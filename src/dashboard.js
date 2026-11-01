// Reconstructed source; see RECONSTRUCTION.md.
var VIEW_TYPE = "pmg-dashboard";
function projectChip(status) {
  return status === "complete" ? "good" : status === "on-track" ? "info" : status === "at-risk" ? "warn" : "bad";
}
function milestoneChip(status, overdue) {
  if (status === "done")
    return "good";
  if (status === "blocked" || overdue)
    return "bad";
  return status === "in-progress" ? "info" : "muted";
}
function gptChip(status, overdue) {
  if (status === "done")
    return "good";
  if (overdue)
    return "bad";
  return status === "in-progress" ? "info" : status === "in-review" ? "warn" : "muted";
}
var FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "overdue", label: "Overdue" },
  { value: "on-track", label: "On track" },
  { value: "at-risk", label: "At risk" },
  { value: "blocked", label: "Blocked" },
  { value: "upcoming", label: "Upcoming" },
  { value: "in-progress", label: "In progress" },
  { value: "queued", label: "Queued" },
  { value: "in-review", label: "In review" }
];
var DashboardView = class extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.refreshTimer = null;
    this.searchQuery = "";
    this.statusFilter = "";
    this.showCompleted = false;
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "Projects dashboard";
  }
  getIcon() {
    return "layout-dashboard";
  }
  async onOpen() {
    const schedule = () => {
      if (this.refreshTimer !== null)
        window.clearTimeout(this.refreshTimer);
      this.refreshTimer = window.setTimeout(() => void this.render(), 250);
    };
    this.registerEvent(this.app.metadataCache.on("changed", schedule));
    this.registerEvent(this.app.vault.on("create", schedule));
    this.registerEvent(this.app.vault.on("delete", schedule));
    this.registerEvent(this.app.vault.on("rename", schedule));
    await this.render();
  }
  isOverdue(item) {
    if (item.overdue !== void 0)
      return item.overdue;
    return item.due !== "" && item.due < todayString() && item.status !== "done" && item.status !== "complete";
  }
  matches(item) {
    var _a, _b, _c, _d, _e;
    if (this.statusFilter) {
      const ok = this.statusFilter === "overdue" ? this.isOverdue(item) : item.status === this.statusFilter;
      if (!ok)
        return false;
    }
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      const hay = [item.title, (_a = item.project) != null ? _a : "", (_b = item.owner) != null ? _b : "", (_c = item.gpt) != null ? _c : "", (_d = item.next) != null ? _d : "", (_e = item.waiting) != null ? _e : ""].join(" ").toLowerCase();
      if (!hay.includes(q))
        return false;
    }
    return true;
  }
  async render() {
    const activeEl = document.activeElement;
    const searchHadFocus = activeEl instanceof HTMLInputElement && activeEl.classList.contains("pmg-search");
    const caret = searchHadFocus ? activeEl.selectionStart : null;
    await this.plugin.refreshIconize();
    const data = loadData(this.app, this.plugin.settings, this.plugin.iconizeByPath);
    const root = this.contentEl;
    root.empty();
    root.addClass("pmg-root");
    const activeProjects = data.projects.filter((p) => p.status !== "complete");
    const activeMilestones = data.milestones.filter((m) => m.status !== "done");
    const activeGpt = data.gptTasks.filter((t) => t.status !== "done");
    const visProjects = activeProjects.filter((p) => this.matches(p));
    const visMilestones = activeMilestones.filter((m) => this.matches(m));
    const visGpt = activeGpt.filter((t) => this.matches(t));
    this.renderHeader(root);
    this.renderStats(root, data);
    this.renderAttention(root, data);
    this.renderLeaderboard(root, data);
    this.renderToolbar(root, { projects: visProjects, milestones: visMilestones, gptTasks: visGpt }, searchHadFocus, caret);
    this.renderProjects(root, data, visProjects, activeProjects.length);
    this.renderMilestones(root, data, visMilestones, activeMilestones.length);
    this.renderGptTasks(root, data, visGpt, activeGpt.length);
    this.renderCompleted(root, data);
  }
  el(parent, tag, cls, text) {
    const node = parent.createEl(tag, cls ? { cls } : void 0);
    if (text !== void 0)
      node.setText(text);
    return node;
  }
  /** A status chip that opens a menu to change the status in place. */
  editableChip(parent, text, tone, options, current, file) {
    const chip = this.el(parent, "span", `pmg-chip pmg-chip--${tone} pmg-chip--editable`, text);
    chip.title = "Click to change status";
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      const menu = new Menu();
      for (const opt of options) {
        menu.addItem((item) => {
          item.setTitle(opt.label);
          item.setChecked(opt.value === current);
          item.onClick(() => void this.setStatus(file, opt.value));
        });
      }
      menu.showAtMouseEvent(e);
    });
  }
  iconInto(parent, icon) {
    return renderIconInto(parent, icon);
  }
  projectIconMap(data) {
    return new Map(data.projects.map((p) => [p.title.toLowerCase(), p.icon]));
  }
  openFile(file) {
    void this.app.workspace.getLeaf(false).openFile(file);
  }
  async setStatus(file, status) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.status = status;
    });
    void this.render();
  }
  async setProgress(file, value) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      if (value === null) {
        delete fm.progress;
      } else {
        fm.progress = value;
      }
    });
    void this.render();
  }
  async setDue(file, value) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      if (value) {
        fm.due = value;
      } else {
        delete fm.due;
      }
    });
    void this.render();
  }
  /** Write or clear a free-text frontmatter field on a project note. */
  async setProjectText(file, key, value) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      if (value) {
        fm[key] = value;
      } else {
        delete fm[key];
      }
    });
    void this.render();
  }
  /** Write a new icon choice back into the project note's frontmatter. */
  async setProjectIcon(p, value) {
    await this.app.fileManager.processFrontMatter(p.file, (fm) => {
      if (value) {
        fm.icon = value;
      } else {
        delete fm.icon;
      }
    });
    new Notice(value ? `Icon updated for ${p.title}` : `Icon cleared for ${p.title}`);
    void this.render();
  }
  renderHeader(root) {
    const head = this.el(root, "div", "pmg-header");
    const left = this.el(head, "div", "pmg-header-left");
    this.el(left, "div", "pmg-eyebrow", this.plugin.settings.workspaceName);
    this.el(left, "h2", "pmg-title", "Workspace overview");
    const now = new Date();
    this.el(
      left,
      "div",
      "pmg-subtitle",
      now.toLocaleDateString(void 0, { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    );
    const actions = this.el(head, "div", "pmg-header-actions");
    const asanaBtn = this.el(actions, "button", "pmg-btn", "Import Asana");
    asanaBtn.addEventListener("click", () => new AsanaImportModal(this.plugin).open());
    const boardBtn = this.el(actions, "button", "pmg-btn", "Board");
    boardBtn.addEventListener("click", () => void this.plugin.activateBoardView());
    const refresh = this.el(actions, "button", "pmg-btn");
    setIcon(refresh, "refresh-cw");
    refresh.createSpan({ text: " Refresh" });
    refresh.addEventListener("click", () => void this.render());
    const add = this.el(actions, "button", "pmg-btn pmg-btn--cta", "+ New project");
    add.addEventListener("click", () => this.plugin.openCreateModal("project"));
  }
  // Reuse dashboard progress; never mutate note data or existing table order.
  renderLeaderboard(root, data) {
    if (!this.plugin.settings.enableLeaderboard)
      return;
    const limit = projectMomentumLimit(this.plugin.settings.leaderboardLimit);
    const section = this.el(root, "section", "pmg-section pmg-leaderboard");
    section.setAttr("aria-label", "Project Momentum");
    this.el(section, "h3", "pmg-section-title", "Project Momentum");
    this.el(section, "p", "pmg-subtitle",
      `Up to ${limit} projects, including completed ones. Ranked by progress, then completed milestones. Equal results share a rank. Dashboard filters do not apply.`);
    const wrap = this.el(section, "div", "pmg-leaderboard-table-wrap");
    const tbody = this.table(wrap, ["Rank", "Project", "Owner", "Status", "Progress", "Milestones done"]);
    const projects = [...data.projects].sort((a, b) =>
      b.progress - a.progress || b.milestoneDone - a.milestoneDone ||
      a.title.localeCompare(b.title) || a.file.path.localeCompare(b.file.path));
    if (projects.length === 0) {
      this.emptyRow(tbody, 6, "No projects yet. Create a project to see its progress here.");
      return;
    }
    let rank = 0;
    projects.slice(0, limit).forEach((p, index) => {
      const previous = projects[index - 1];
      if (!previous || p.progress !== previous.progress || p.milestoneDone !== previous.milestoneDone)
        rank = index + 1;
      const tr = tbody.createEl("tr");
      tr.createEl("td", { text: String(rank) });
      const title = tr.createEl("td");
      const link = title.createEl("a", { cls: "pmg-link", text: p.title, href: "#" });
      link.addEventListener("click", (event) => {
        event.preventDefault();
        void this.app.workspace.getLeaf(false).openFile(p.file);
      });
      tr.createEl("td", { text: p.owner || "Unassigned" });
      tr.createEl("td", { text: labelOf(PROJECT_STATUSES, p.status) });
      const progress = tr.createEl("td");
      const bar = progress.createDiv({ cls: "pmg-progress" });
      bar.setAttr("role", "progressbar");
      bar.setAttr("aria-label", `${p.title} progress`);
      bar.setAttr("aria-valuemin", "0");
      bar.setAttr("aria-valuemax", "100");
      bar.setAttr("aria-valuenow", String(p.progress));
      bar.createDiv({ cls: "pmg-progress-fill" }).style.width = `${p.progress}%`;
      const source = p.progressExplicit ? "manual" : p.milestoneTotal > 0 ? "from milestones" :
        p.status === "complete" ? "complete status" : "no milestones";
      progress.createSpan({ text: `${p.progress}% (${source})` });
      tr.createEl("td", { text: `${p.milestoneDone}/${p.milestoneTotal}` });
    });
  }
  renderStats(root, data) {
    const row = this.el(root, "div", "pmg-stats");
    const attentionCount = data.projects.filter((p) => p.status === "at-risk" || p.status === "blocked").length + data.milestones.filter((m) => m.overdue || m.status === "blocked").length + data.gptTasks.filter((t) => t.overdue).length;
    const today = todayString();
    const weekEnd = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    })();
    const dueThisWeek = [...data.milestones, ...data.gptTasks].filter(
      (i) => i.due !== "" && i.due >= today && i.due <= weekEnd && i.status !== "done"
    ).length;
    const cards = [
      {
        label: "Projects",
        value: String(data.projects.length),
        sub: `${data.projects.filter((p) => p.status === "on-track").length} on track \xB7 ${data.projects.filter((p) => p.status === "complete").length} complete`
      },
      {
        label: "Milestones",
        value: String(data.milestones.length),
        sub: `${data.milestones.filter((m) => m.status !== "done").length} open \xB7 ${data.milestones.filter((m) => m.status === "done").length} done`
      },
      {
        label: "GPT tasks",
        value: String(data.gptTasks.length),
        sub: `${data.gptTasks.filter((t) => t.status === "in-progress").length} in progress \xB7 ${data.gptTasks.filter((t) => t.status === "in-review").length} in review`
      },
      {
        label: "Needs attention",
        value: String(attentionCount),
        sub: `${dueThisWeek} due in the next 7 days`,
        alert: attentionCount > 0
      }
    ];
    for (const c of cards) {
      const card = this.el(row, "div", "pmg-stat" + (c.alert ? " pmg-stat--alert" : ""));
      this.el(card, "div", "pmg-stat-value", c.value);
      this.el(card, "div", "pmg-stat-label", c.label);
      this.el(card, "div", "pmg-stat-sub", c.sub);
    }
  }
  renderAttention(root, data) {
    const icons = this.projectIconMap(data);
    const today = todayString();
    const items = [];
    for (const p of data.projects) {
      if (p.status === "blocked")
        items.push({ text: p.title, reason: "Project blocked", file: p.file, icon: p.icon });
      else if (p.status === "at-risk")
        items.push({ text: p.title, reason: "Project at risk", file: p.file, icon: p.icon });
      else if (p.status !== "complete" && p.due !== "" && p.due < today)
        items.push({ text: p.title, reason: `Project past due \xB7 due ${prettyDate(p.due)}`, file: p.file, icon: p.icon });
      else if (p.status !== "complete" && p.due === today)
        items.push({ text: p.title, reason: "Project due today", file: p.file, icon: p.icon });
    }
    for (const m of data.milestones) {
      const icon = icons.get(m.project.toLowerCase());
      if (m.project !== "" && !m.projectLinked && m.status !== "done")
        items.push({ text: m.title, reason: `Project not found: \u201C${m.project}\u201D`, file: m.file, icon: void 0 });
      else if (m.overdue)
        items.push({ text: m.title, reason: `Milestone overdue \xB7 due ${prettyDate(m.due)}`, file: m.file, icon });
      else if (m.status === "blocked")
        items.push({ text: m.title, reason: "Milestone blocked", file: m.file, icon });
      else if (m.status !== "done" && m.due === today)
        items.push({ text: m.title, reason: "Milestone due today", file: m.file, icon });
    }
    for (const t of data.gptTasks) {
      const icon = icons.get(t.project.toLowerCase());
      if (t.project !== "" && !t.projectLinked && t.status !== "done")
        items.push({ text: t.title, reason: `Project not found: \u201C${t.project}\u201D`, file: t.file, icon: void 0 });
      else if (t.overdue)
        items.push({ text: t.title, reason: `GPT task overdue \xB7 due ${prettyDate(t.due)}`, file: t.file, icon });
      else if (t.status !== "done" && t.due === today)
        items.push({ text: t.title, reason: "GPT task due today", file: t.file, icon });
    }
    if (items.length === 0)
      return;
    const box = this.el(root, "div", "pmg-attention");
    this.el(box, "div", "pmg-attention-title", `\u26A0 Needs attention (${items.length})`);
    for (const item of items.slice(0, 10)) {
      const row = this.el(box, "div", "pmg-attention-row");
      const leftWrap = this.el(row, "span", "pmg-attention-left");
      if (item.icon !== void 0)
        this.iconInto(leftWrap, item.icon);
      const link = this.el(leftWrap, "a", "pmg-link", item.text);
      link.addEventListener("click", () => this.openFile(item.file));
      this.el(row, "span", "pmg-attention-reason", item.reason);
    }
  }
  renderToolbar(root, visible, searchHadFocus, caret) {
    const bar = this.el(root, "div", "pmg-toolbar");
    const search = this.el(bar, "input", "pmg-search");
    search.type = "text";
    search.placeholder = "Search projects, milestones, GPT tasks\u2026";
    search.value = this.searchQuery;
    search.addEventListener("input", () => {
      this.searchQuery = search.value;
      if (this.refreshTimer !== null)
        window.clearTimeout(this.refreshTimer);
      this.refreshTimer = window.setTimeout(() => void this.render(), 200);
    });
    if (searchHadFocus) {
      search.focus();
      if (caret !== null)
        search.setSelectionRange(caret, caret);
    }
    const select = this.el(bar, "select", "pmg-filter");
    for (const opt of FILTER_OPTIONS) {
      const o = select.createEl("option", { text: opt.label });
      o.value = opt.value;
    }
    select.value = this.statusFilter;
    select.addEventListener("change", () => {
      this.statusFilter = select.value;
      void this.render();
    });
    const exportBtn = this.el(bar, "button", "pmg-btn", "Export CSV");
    exportBtn.addEventListener("click", () => this.exportCsv(visible));
  }
  exportCsv(visible) {
    const esc = (v) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    const rows = [["Type", "Title", "Project", "Owner", "GPT", "Status", "Progress", "Due"]];
    for (const p of visible.projects)
      rows.push(["Project", p.title, "", p.owner, "", labelOf(PROJECT_STATUSES, p.status), `${p.progress}%`, p.due]);
    for (const m of visible.milestones)
      rows.push(["Milestone", m.title, m.project, m.owner, "", m.overdue ? "Overdue" : labelOf(MILESTONE_STATUSES, m.status), "", m.due]);
    for (const t of visible.gptTasks)
      rows.push(["GPT task", t.title, t.project, "", t.gpt, labelOf(GPT_TASK_STATUSES, t.status), "", t.due]);
    const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projects-export-${todayString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    new Notice(`Exported ${rows.length - 1} items to CSV`);
  }
  sectionHead(root, title, countText, kind, cta) {
    const head = this.el(root, "div", "pmg-section-head");
    this.el(head, "h3", "pmg-section-title", `${title} `);
    this.el(head, "span", "pmg-section-count", countText);
    const btn = this.el(head, "button", "pmg-btn pmg-btn--small", cta);
    btn.addEventListener("click", () => this.plugin.openCreateModal(kind));
  }
  countText(visible, total) {
    const filtered = this.searchQuery.trim() !== "" || this.statusFilter !== "";
    return filtered && visible !== total ? `${visible} of ${total}` : String(total);
  }
  table(root, headers) {
    const table = this.el(root, "table", "pmg-table");
    const thead = table.createEl("thead");
    const tr = thead.createEl("tr");
    const tbody = table.createEl("tbody");
    // View-local state survives renders without writing plugin settings or notes.
    this.tableSorts ||= new Map();
    const key = headers.join("|");
    const numeric = new Set(["Rank", "Progress", "Milestones", "Milestones done", "GPTs linked"]);
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    let rows = [];
    const value = (row, index) => {
      const cell = row.children[index];
      if (!cell) return null;
      let text = (cell.dataset.pmgSortValue ??
        (cell.querySelector(".pmg-cell-title") || cell).textContent).trim();
      if (!text || text === "—") return null;
      if (headers[index] === "Due") {
        const date = Date.parse(text);
        return Number.isFinite(date) ? date : null;
      }
      if (numeric.has(headers[index])) {
        const number = Number.parseFloat(text);
        return Number.isFinite(number) ? number : null;
      }
      // Decorative unlinked-project warning is not part of the project name.
      return text.replace(/^⚠\s*/, "");
    };
    const apply = () => {
      const state = this.tableSorts.get(key);
      if (!state) return;
      const { index, descending } = state;
      rows.map((row, original) => ({ row, original, value: value(row, index) }))
        .sort((a, b) => {
          // Missing values always follow real values, including descending order.
          if (a.value === null || b.value === null)
            return a.value === b.value ? a.original - b.original : a.value === null ? 1 : -1;
          const comparison = typeof a.value === "number" ? a.value - b.value : collator.compare(a.value, b.value);
          return (descending ? -comparison : comparison) || a.original - b.original;
        }).forEach(({ row }) => tbody.appendChild(row));
    };
    const buttons = [];
    const updateHeaders = () => {
      const state = this.tableSorts.get(key);
      buttons.forEach(({ th, button, label }, index) => {
        const active = state?.index === index;
        th.setAttr("aria-sort", active ? state.descending ? "descending" : "ascending" : "none");
        button.setText(label + (active ? state.descending ? " ▼" : " ▲" : " ↕"));
        button.setAttr("aria-label", `${label}: sort ${active && !state.descending ? "descending" : "ascending"}`);
      });
    };
    headers.forEach((label, index) => {
      const th = tr.createEl("th");
      th.setAttr("scope", "col");
      const button = th.createEl("button", { cls: "pmg-sort-header", text: label });
      button.type = "button";
      buttons.push({ th, button, label });
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const previous = this.tableSorts.get(key);
        this.tableSorts.set(key, { index, descending: previous?.index === index ? !previous.descending : false });
        apply();
        updateHeaders();
      });
    });
    updateHeaders();
    // Callers populate rows synchronously. Capture their original stable order.
    queueMicrotask(() => {
      rows = Array.from(tbody.children).filter(row => !row.querySelector(".pmg-empty"));
      apply();
    });
    return tbody;
  }
  emptyRow(tbody, cols, text) {
    const tr = tbody.createEl("tr");
    const td = tr.createEl("td", { cls: "pmg-empty", text });
    td.colSpan = cols;
  }
  dueCell(tr, item) {
    const td = tr.createEl("td", { cls: "pmg-cell-clickable", text: prettyDate(item.due) });
    td.dataset.pmgSortValue = item.due || "";
    if (this.isOverdue(item))
      td.addClass("pmg-overdue");
    td.title = "Click to change due date";
    td.addEventListener("click", (e) => {
      e.stopPropagation();
      const file = item.file;
      new DueDateModal(this.app, item.title, item.due, (v) => void this.setDue(file, v)).open();
    });
  }
  /** A clickable free-text cell (a project's next action / waiting for). */
  textCell(tr, p, key, label) {
    const value = p[key];
    const td = tr.createEl("td", { cls: "pmg-cell-clickable", text: value || "\u2014" });
    td.title = `Click to edit ${label.toLowerCase()}`;
    td.addEventListener("click", (e) => {
      e.stopPropagation();
      new TextEditModal(
        this.app,
        label,
        p.title,
        value,
        (v) => void this.setProjectText(p.file, key, v)
      ).open();
    });
  }
  renderProjects(root, data, visible, total) {
    const section = this.el(root, "div", "pmg-section");
    this.sectionHead(section, "Projects", this.countText(visible.length, total), "project", "+ New project");
    const tbody = this.table(section, ["Project", "Owner", "Status", "Progress", "Next action", "Waiting for", "Milestones", "Due", "GPTs linked"]);
    if (data.projects.length === 0) {
      this.emptyRow(tbody, 9, `No project notes yet in \u201C${this.plugin.settings.projectsFolder}\u201D. Create one with the button above.`);
      return;
    }
    if (visible.length === 0) {
      this.emptyRow(tbody, 9, "No projects match the current search/filter.");
      return;
    }
    for (const p of visible) {
      const tr = tbody.createEl("tr", { cls: "pmg-row" });
      tr.addEventListener("click", () => this.openFile(p.file));
      const nameTd = tr.createEl("td");
      const main = nameTd.createEl("div", { cls: "pmg-cell-main" });
      const iconSpan = this.iconInto(main, p.icon);
      iconSpan.addClass("pmg-icon--clickable");
      iconSpan.title = "Change icon";
      iconSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        new IconPickerModal(this.app, p.icon, (value) => {
          void this.setProjectIcon(p, value);
        }, this.plugin.iconizeAllIcons).open();
      });
      const titleWrap = main.createEl("div");
      titleWrap.createEl("div", { cls: "pmg-cell-title", text: p.title });
      if (p.code)
        titleWrap.createEl("div", { cls: "pmg-cell-sub", text: p.code });
      tr.createEl("td", { text: p.owner || "\u2014" });
      const statusTd = tr.createEl("td");
      this.editableChip(statusTd, labelOf(PROJECT_STATUSES, p.status), projectChip(p.status), PROJECT_STATUSES, p.status, p.file);
      const progTd = tr.createEl("td", { cls: "pmg-cell-clickable" });
      progTd.title = "Click to set progress";
      const bar = progTd.createEl("div", { cls: "pmg-progress" });
      const fill = bar.createEl("div", { cls: "pmg-progress-fill" });
      fill.style.width = `${p.progress}%`;
      progTd.createEl("div", {
        cls: "pmg-cell-sub",
        text: `${p.progress}%${!p.progressExplicit && p.milestoneTotal > 0 ? " (from milestones)" : ""}`
      });
      progTd.addEventListener("click", (e) => {
        e.stopPropagation();
        new ProgressModal(
          this.app,
          p.title,
          p.progress,
          p.progressExplicit,
          (v) => void this.setProgress(p.file, v)
        ).open();
      });
      this.textCell(tr, p, "next", "Next action");
      this.textCell(tr, p, "waiting", "Waiting for");
      tr.createEl("td", { text: p.milestoneTotal ? `${p.milestoneDone}/${p.milestoneTotal}` : "\u2014" });
      this.dueCell(tr, p);
      tr.createEl("td", { text: p.gptCount ? `${p.gptCount} linked` : "\u2014" });
    }
  }
  renderMilestones(root, data, visible, total) {
    var _a;
    const section = this.el(root, "div", "pmg-section");
    this.sectionHead(section, "Milestones", this.countText(visible.length, total), "milestone", "+ New milestone");
    const tbody = this.table(section, ["Milestone", "Project", "Owner", "Due", "Status"]);
    if (data.milestones.length === 0) {
      this.emptyRow(tbody, 5, `No milestone notes yet in \u201C${this.plugin.settings.milestonesFolder}\u201D.`);
      return;
    }
    if (visible.length === 0) {
      this.emptyRow(tbody, 5, "No milestones match the current search/filter.");
      return;
    }
    const icons = this.projectIconMap(data);
    for (const m of visible) {
      const tr = tbody.createEl("tr", { cls: "pmg-row" });
      tr.addEventListener("click", () => this.openFile(m.file));
      tr.createEl("td", { cls: "pmg-cell-title", text: m.title });
      const projTd = tr.createEl("td");
      if (m.project) {
        if (m.projectLinked) {
          this.iconInto(projTd, (_a = icons.get(m.project.toLowerCase())) != null ? _a : "");
          projTd.createSpan({ text: m.project });
        } else {
          projTd.createSpan({ cls: "pmg-unlinked", text: `\u26A0 ${m.project}` });
          projTd.title = "No project note with this title";
        }
      } else {
        projTd.setText("\u2014");
      }
      tr.createEl("td", { text: m.owner || "\u2014" });
      this.dueCell(tr, m);
      const statusTd = tr.createEl("td");
      const label = m.overdue && m.status !== "done" ? "Overdue" : labelOf(MILESTONE_STATUSES, m.status);
      this.editableChip(statusTd, label, milestoneChip(m.status, m.overdue), MILESTONE_STATUSES, m.status, m.file);
    }
  }
  renderGptTasks(root, data, visible, total) {
    var _a;
    const section = this.el(root, "div", "pmg-section");
    this.sectionHead(section, "GPT tasks", this.countText(visible.length, total), "gpt-task", "+ New GPT task");
    const tbody = this.table(section, ["Task", "GPT", "Project", "Output", "Due", "Status"]);
    if (data.gptTasks.length === 0) {
      this.emptyRow(tbody, 6, `No GPT task notes yet in \u201C${this.plugin.settings.gptTasksFolder}\u201D.`);
      return;
    }
    if (visible.length === 0) {
      this.emptyRow(tbody, 6, "No GPT tasks match the current search/filter.");
      return;
    }
    const icons = this.projectIconMap(data);
    for (const t of visible) {
      const tr = tbody.createEl("tr", { cls: "pmg-row" });
      tr.addEventListener("click", () => this.openFile(t.file));
      tr.createEl("td", { cls: "pmg-cell-title", text: t.title });
      tr.createEl("td", { text: t.gpt || "\u2014" });
      const projTd = tr.createEl("td");
      if (t.project) {
        if (t.projectLinked) {
          this.iconInto(projTd, (_a = icons.get(t.project.toLowerCase())) != null ? _a : "");
          projTd.createSpan({ text: t.project });
        } else {
          projTd.createSpan({ cls: "pmg-unlinked", text: `\u26A0 ${t.project}` });
          projTd.title = "No project note with this title";
        }
      } else {
        projTd.setText("\u2014");
      }
      const outTd = tr.createEl("td");
      outTd.dataset.pmgSortValue = t.output || "";
      if (!t.output) {
        outTd.setText("\u2014");
      } else if (/^https?:\/\//.test(t.output)) {
        const a = outTd.createEl("a", { cls: "pmg-link", text: "Open \u2197" });
        a.href = t.output;
        a.setAttr("target", "_blank");
        a.setAttr("rel", "noopener");
        a.addEventListener("click", (e) => e.stopPropagation());
      } else {
        outTd.setText(t.output);
      }
      this.dueCell(tr, t);
      const statusTd = tr.createEl("td");
      this.editableChip(statusTd, labelOf(GPT_TASK_STATUSES, t.status), gptChip(t.status, t.overdue), GPT_TASK_STATUSES, t.status, t.file);
    }
  }
  renderCompleted(root, data) {
    const rows = [
      ...data.projects.filter((p) => p.status === "complete").map((p) => ({ type: "Project", title: p.title, project: "", next: p.next, waiting: p.waiting, file: p.file })),
      ...data.milestones.filter((m) => m.status === "done").map((m) => ({ type: "Milestone", title: m.title, project: m.project, next: "", waiting: "", file: m.file })),
      ...data.gptTasks.filter((t) => t.status === "done").map((t) => ({ type: "GPT task", title: t.title, project: t.project, next: "", waiting: "", file: t.file }))
    ];
    const q = this.searchQuery.trim().toLowerCase();
    const shown = q ? rows.filter((r) => `${r.title} ${r.project} ${r.next} ${r.waiting}`.toLowerCase().includes(q)) : rows;
    if (rows.length === 0)
      return;
    const section = this.el(root, "div", "pmg-section");
    const toggle = this.el(
      section,
      "button",
      "pmg-btn pmg-completed-toggle",
      `${this.showCompleted ? "\u25BE" : "\u25B8"} Completed (${rows.length})`
    );
    toggle.addEventListener("click", () => {
      this.showCompleted = !this.showCompleted;
      void this.render();
    });
    if (!this.showCompleted)
      return;
    const tbody = this.table(section, ["Type", "Title", "Project", "Next action", "Waiting for"]);
    if (shown.length === 0) {
      this.emptyRow(tbody, 5, "No completed items match the current search.");
      return;
    }
    for (const r of shown) {
      const tr = tbody.createEl("tr", { cls: "pmg-row" });
      tr.addEventListener("click", () => this.openFile(r.file));
      tr.createEl("td", { text: r.type });
      tr.createEl("td", { cls: "pmg-cell-title", text: r.title });
      tr.createEl("td", { text: r.project || "\u2014" });
      tr.createEl("td", { text: r.next || "\u2014" });
      tr.createEl("td", { text: r.waiting || "\u2014" });
    }
  }
};
