// Reconstructed source; see RECONSTRUCTION.md.
// Asana import: parse/review first; creating notes is a separate explicit action.
function parseAsanaExport(text) {
  if (typeof text !== "string" || text.length > 10 * 1024 * 1024) throw new Error("Choose a JSON export smaller than 10 MB.");
  let json;
  try { json = JSON.parse(text.replace(/^\uFEFF/, "")); } catch { throw new Error("Invalid JSON. Export the project as JSON in Asana; CSV and ZIP files are not supported."); }
  let source = json;
  if (!Array.isArray(source)) source = json?.tasks ?? json?.data;
  if (!Array.isArray(source) && source && Array.isArray(source.tasks)) source = source.tasks;
  if (!Array.isArray(source)) throw new Error("Unsupported JSON structure. Expected a task array, {data: [...]}, {tasks: [...]}, or {data: {tasks: [...]}}.");
  const rows = [], seen = new Set();
  const visit = (items, depth = 0) => {
    if (depth > 100) throw new Error("Too many nested subtasks (maximum depth 100).");
    for (const raw of items) {
      if (rows.length >= 10000) throw new Error("This import exceeds 10,000 tasks. Split the export into smaller files.");
      const row = { id: "", title: typeof raw?.name === "string" ? raw.name.trim() : "", notes: "", due: "", owner: "", completed: false, decision: "pending", result: "", error: "" };
      const id = raw?.gid ?? raw?.id;
      if (typeof id === "string" && /^\d+$/.test(id)) row.id = id;
      else if (typeof id === "number" && Number.isSafeInteger(id) && id > 0) row.id = String(id);
      if (!row.id) row.error = "Missing or invalid Asana ID. IDs exceeding JavaScript's safe integer range must be JSON strings.";
      else if (seen.has(row.id)) row.error = "Duplicate ID within this export; only the first occurrence is eligible.";
      else seen.add(row.id);
      if (!row.title) row.error ||= "Missing task name.";
      if (raw?.resource_type && raw.resource_type !== "task" || raw?.is_rendered_as_separator) row.error ||= "Not an importable task (section/separator or another resource type).";
      if (raw?.completed != null && typeof raw.completed !== "boolean") row.error ||= "Invalid completed flag; expected true or false.";
      row.completed = raw?.completed === true || raw?.completed == null && !!raw?.completed_at;
      row.notes = typeof raw?.notes === "string" ? raw.notes : typeof raw?.description === "string" ? raw.description : typeof raw?.html_notes === "string" ? raw.html_notes : "";
      row.owner = typeof raw?.assignee?.name === "string" ? raw.assignee.name : "";
      const due = raw?.due_on ?? raw?.due_date ?? raw?.due_at;
      if (due != null && due !== "") {
        const date = typeof due === "string" ? due.slice(0, 10) : "";
        const shape = typeof due === "string" && (/^\d{4}-\d{2}-\d{2}$/.test(due) || raw?.due_on == null && raw?.due_date == null && /^\d{4}-\d{2}-\d{2}T/.test(due) && Number.isFinite(Date.parse(due)));
        if (!shape || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) row.error ||= "Invalid due date.";
        else row.due = date;
      }
      row.url = `https://app.asana.com/0/0/${row.id}`;
      if (typeof raw?.permalink_url === "string" && /^https:\/\/app\.asana\.com\//i.test(raw.permalink_url)) row.url = raw.permalink_url;
      rows.push(row);
      if (raw?.subtasks != null) {
        const children = Array.isArray(raw.subtasks) ? raw.subtasks : raw.subtasks?.data;
        if (!Array.isArray(children)) row.error ||= "Unsupported subtasks structure; expected an array.";
        else visit(children, depth + 1);
      }
    }
  };
  visit(source);
  if (!rows.length) throw new Error("This export contains no tasks.");
  return rows;
}
async function existingAsanaIds(app, folder) {
  const ids = new Set();
  for (const file of app.vault.getMarkdownFiles()) {
    const cached = app.metadataCache.getFileCache(file)?.frontmatter?.asana_gid;
    if (cached != null) ids.add(String(cached));
    // Read milestone files as well: metadata cache may lag immediately after a write.
    if (inFolder(file, folder)) {
      const text = await app.vault.read(file);
      const front = text.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
      if (front && /^asana_gid\s*:/m.test(front[1])) {
        const fm = parseYaml(front[1]);
        if (fm?.asana_gid != null) ids.add(String(fm.asana_gid));
      }
    }
  }
  return ids;
}
function asanaMilestoneNote(task, project, status) {
  const fields = { title: task.title, status: task.completed ? "done" : status, asana_gid: task.id, asana_url: task.url };
  if (project) fields.project = project;
  if (task.owner) fields.owner = task.owner;
  if (task.due) fields.due = task.due;
  const lines = ["---", ...Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`), "---", "", "## Asana task description", ""];
  // Literal text prevents exported HTML, embeds or fence delimiters becoming active.
  const longest = (task.notes.match(/`+/g) || []).reduce((length, s) => Math.max(length, s.length), 2);
  const fence = "`".repeat(longest + 1);
  lines.push(fence + "text", task.notes || "(No description)", fence, "");
  return lines.join("\n");
}
async function writeApprovedAsana(app, settings, rows, project, status) {
  const selected = rows.filter(r => r.decision === "approved" && !r.error && !["imported", "duplicate"].includes(r.result));
  if (!selected.length) return { imported: 0, duplicate: 0, failed: 0 };
  if (!["upcoming", "in-progress", "blocked"].includes(status)) throw new Error("Choose a valid open-task status.");
  const folder = settings.milestonesFolder.replace(/^\/+|\/+$/g, "");
  if (folder.split("/").some(part => part === ".." || part === ".") || folder.includes("\\")) throw new Error("The configured Milestones folder must be a vault-relative folder.");
  const ids = await existingAsanaIds(app, folder);
  const counts = { imported: 0, duplicate: 0, failed: 0 };
  for (const task of selected) {
    if (ids.has(task.id)) { task.result = "duplicate"; counts.duplicate++; continue; }
    try {
      if (folder && !await app.vault.adapter.exists(folder)) await app.vault.createFolder(folder);
      const base = `Asana ${task.id} - ${sanitizeFileName(task.title.replace(/[\x00-\x1f]/g, " ")).slice(0, 100).replace(/[. ]+$/, "")}`;
      const path = folder ? `${folder}/${base}.md` : `${base}.md`;
      if (await app.vault.adapter.exists(path)) throw new Error("Destination filename already exists; no existing file was changed.");
      await app.vault.create(path, asanaMilestoneNote(task, project, status));
      ids.add(task.id); task.result = "imported"; task.detail = path; counts.imported++;
    } catch (error) { task.result = "failed"; task.detail = error.message || String(error); counts.failed++; }
  }
  return counts;
}
var AsanaImportModal = class extends Modal {
  constructor(plugin) {
    super(plugin.app); this.plugin = plugin; this.rows = []; this.project = ""; this.status = "upcoming"; this.busy = false; this.generation = 0;
  }
  onOpen() {
    const root = this.contentEl; root.empty();
    root.createEl("h2", { text: "Import Asana JSON into Milestones" });
    root.createEl("p", { text: "Choose a file, review every task, then explicitly confirm. Existing Asana IDs are skipped; reimport never overwrites local notes. Subtasks in the file are reviewed separately." });
    root.createEl("p", { text: `Destination: ${this.plugin.settings.milestonesFolder || "vault root"}` });
    this.controls = [];
    const project = root.createEl("select"); project.setAttr("aria-label", "Destination Project");
    project.createEl("option", { value: "", text: "No Project" });
    const projects = loadData(this.app, this.plugin.settings, this.plugin.iconizeByPath).projects;
    for (const p of projects) project.createEl("option", { value: p.title, text: p.title });
    project.addEventListener("change", () => { this.project = project.value; });
    const status = root.createEl("select"); status.setAttr("aria-label", "Status for open tasks");
    for (const s of MILESTONE_STATUSES.filter(s => s.value !== "done")) status.createEl("option", { value: s.value, text: `Open tasks: ${s.label}` });
    status.value = this.status;
    status.addEventListener("change", () => { this.status = status.value; this.review(); });
    const input = root.createEl("input", { type: "file" }); input.accept = ".json,application/json"; input.setAttr("aria-label", "Asana JSON export");
    input.addEventListener("change", async () => {
      const generation = ++this.generation; this.rows = []; this.review();
      const file = input.files?.[0]; if (!file) return;
      if (file.size > 10 * 1024 * 1024) { this.message.setText("Choose a JSON export smaller than 10 MB."); return; }
      this.message.setText("Reading export…");
      try {
        const rows = parseAsanaExport(await file.text());
        const ids = await existingAsanaIds(this.app, this.plugin.settings.milestonesFolder);
        if (generation !== this.generation) return;
        for (const row of rows) if (ids.has(row.id)) row.result = "duplicate";
        this.rows = rows; this.message.setText("Review tasks below. No notes have been written."); this.review();
      } catch (error) { if (generation === this.generation) { this.rows = []; this.review(); this.message.setText(error.message || String(error)); } }
    });
    this.controls.push(project, status, input);
    this.message = root.createEl("p"); this.message.setAttr("role", "status");
    const actions = root.createDiv({ cls: "pmg-header-actions" });
    for (const [label, decision] of [["Approve all eligible", "approved"], ["Deny all", "denied"]]) {
      const button = actions.createEl("button", { text: label }); this.controls.push(button);
      button.addEventListener("click", () => { for (const row of this.rows) if (!row.error && !["imported", "duplicate"].includes(row.result)) row.decision = decision; this.review(); });
    }
    this.count = root.createEl("p");
    this.list = root.createDiv({ cls: "pmg-asana-review" });
    this.confirm = root.createEl("button", { text: "Confirm import of approved tasks" }); this.confirm.addClass("mod-cta");
    this.confirm.addEventListener("click", () => void this.confirmImport());
    const cancel = root.createEl("button", { text: "Cancel / close" }); cancel.addEventListener("click", () => this.close()); this.controls.push(cancel);
    this.review();
  }
  review() {
    this.list?.empty();
    const approved = this.rows.filter(r => r.decision === "approved" && !r.error && !["imported", "duplicate"].includes(r.result)).length;
    this.count?.setText(`${this.rows.length} parsed · ${approved} approved · ${this.rows.filter(r => r.decision === "denied").length} denied · ${this.rows.filter(r => r.decision === "pending" && !r.error && !r.result).length} pending · ${this.rows.filter(r => r.error).length} invalid · ${this.rows.filter(r => r.result === "duplicate").length} duplicates`);
    for (const row of this.rows) {
      const card = this.list.createEl("section", { cls: "pmg-asana-task" });
      card.createEl("h3", { text: row.title || "Unnamed task" });
      card.createEl("p", { text: `ID ${row.id || "missing"} · ${row.completed ? "done" : this.status} · Due ${row.due || "none"} · Owner ${row.owner || "none"}` });
      card.createEl("pre", { text: row.notes });
      card.createEl("p", { text: row.error || `${row.result || row.decision}${row.detail ? ": " + row.detail : ""}` });
      for (const [label, decision] of [["Approve", "approved"], ["Deny", "denied"]]) {
        const b = card.createEl("button", { text: label });
        b.disabled = this.busy || !!row.error || ["imported", "duplicate"].includes(row.result);
        b.setAttr("aria-label", `${label} ${row.title || "unnamed task"}`);
        b.setAttr("aria-pressed", String(row.decision === decision));
        b.addEventListener("click", () => { row.decision = decision; this.review(); });
      }
    }
    if (this.confirm) { this.confirm.disabled = this.busy || approved === 0; this.confirm.setText(`Confirm import of ${approved} approved task${approved === 1 ? "" : "s"}`); }
  }
  async confirmImport() {
    if (this.busy) return;
    if (this.plugin.asanaImportBusy) { this.message.setText("Another Asana import is running. Wait for it to finish, then try again."); return; }
    if (!this.rows.some(r => r.decision === "approved" && !r.error && !["imported", "duplicate"].includes(r.result))) { this.message.setText("Approve at least one eligible task before importing."); return; }
    this.busy = this.plugin.asanaImportBusy = true;
    for (const c of this.controls) c.disabled = true;
    this.review(); this.message.setText("Importing approved tasks…");
    try {
      const result = await writeApprovedAsana(this.app, this.plugin.settings, this.rows, this.project, this.status);
      this.message.setText(`Imported ${result.imported}; skipped existing ${result.duplicate}; failed ${result.failed}. Failed rows can be retried. Existing notes were not changed.`);
    } catch (error) { this.message.setText(`Import stopped: ${error.message || String(error)}`); }
    finally {
      this.busy = this.plugin.asanaImportBusy = false;
      for (const c of this.controls) c.disabled = false;
      this.review();
      for (const type of [VIEW_TYPE, BOARD_VIEW_TYPE]) for (const leaf of this.app.workspace.getLeavesOfType(type)) void leaf.view.render();
    }
  }
  onClose() { this.generation++; }
};
