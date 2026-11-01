// Reconstructed source; see RECONSTRUCTION.md.
var BOARD_VIEW_TYPE = "pmg-board";
var TAB_KINDS = [
  { kind: "project", label: "Projects" },
  { kind: "milestone", label: "Milestones" },
  { kind: "gpt-task", label: "GPT tasks" }
];
var BoardView = class extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.refreshTimer = null;
    this.dragging = null;
    this.plugin = plugin;
  }
  getViewType() {
    return BOARD_VIEW_TYPE;
  }
  getDisplayText() {
    return "Projects board";
  }
  getIcon() {
    return "kanban";
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
  statusesFor(kind) {
    return kind === "project" ? PROJECT_STATUSES : kind === "milestone" ? MILESTONE_STATUSES : GPT_TASK_STATUSES;
  }
  cardsFor(data, kind) {
    const icons = new Map(data.projects.map((p) => [p.title.toLowerCase(), p.icon]));
    if (kind === "project") {
      return data.projects.map((p) => ({
        file: p.file,
        title: p.title,
        status: p.status,
        meta: [
          ...p.code ? [{ text: p.code }] : [],
          ...p.owner ? [{ text: p.owner }] : [],
          ...p.milestoneTotal ? [{ text: `${p.milestoneDone}/${p.milestoneTotal} milestones` }] : []
        ],
        next: p.next,
        waiting: p.waiting,
        due: p.due,
        overdue: false,
        progress: p.progress
      }));
    }
    if (kind === "milestone") {
      return data.milestones.map((m) => {
        var _a;
        return {
          file: m.file,
          title: m.title,
          status: m.status,
          meta: [
            ...m.project ? [{ icon: (_a = icons.get(m.project.toLowerCase())) != null ? _a : "", text: m.project }] : [],
            ...m.owner ? [{ text: m.owner }] : []
          ],
          due: m.due,
          overdue: m.overdue
        };
      });
    }
    return data.gptTasks.map((t) => {
      var _a;
      return {
        file: t.file,
        title: t.title,
        status: t.status,
        meta: [
          ...t.gpt ? [{ text: t.gpt }] : [],
          ...t.project ? [{ icon: (_a = icons.get(t.project.toLowerCase())) != null ? _a : "", text: t.project }] : []
        ],
        due: t.due,
        overdue: t.overdue
      };
    });
  }
  async render() {
    await this.plugin.refreshIconize();
    const data = loadData(this.app, this.plugin.settings, this.plugin.iconizeByPath);
    const kind = this.plugin.boardTab;
    const root = this.contentEl;
    root.empty();
    root.addClass("pmg-root");
    const head = root.createDiv({ cls: "pmg-header" });
    const left = head.createDiv({ cls: "pmg-header-left" });
    left.createEl("div", { cls: "pmg-eyebrow", text: this.plugin.settings.workspaceName });
    left.createEl("h2", { cls: "pmg-title", text: "Board" });
    const actions = head.createDiv({ cls: "pmg-header-actions" });
    const dashBtn = actions.createEl("button", { cls: "pmg-btn", text: "Dashboard" });
    dashBtn.addEventListener("click", () => void this.plugin.activateView());
    const addBtn = actions.createEl("button", {
      cls: "pmg-btn pmg-btn--cta",
      text: `+ New ${kind === "gpt-task" ? "GPT task" : kind}`
    });
    addBtn.addEventListener("click", () => this.plugin.openCreateModal(kind));
    const tabs = root.createDiv({ cls: "pmg-board-tabs" });
    for (const tab of TAB_KINDS) {
      const btn = tabs.createEl("button", {
        cls: "pmg-board-tab" + (tab.kind === kind ? " is-active" : ""),
        text: tab.label
      });
      btn.addEventListener("click", () => {
        this.plugin.boardTab = tab.kind;
        void this.render();
      });
    }
    const statuses = this.statusesFor(kind);
    const cards = this.cardsFor(data, kind);
    const columns = root.createDiv({ cls: "pmg-columns" });
    for (const status of statuses) {
      const inColumn = cards.filter((c) => c.status === status.value);
      const col = columns.createDiv({ cls: "pmg-column" });
      const colHead = col.createDiv({ cls: "pmg-column-head" });
      colHead.createSpan({ cls: "pmg-column-title", text: status.label });
      colHead.createSpan({ cls: "pmg-section-count", text: String(inColumn.length) });
      const colAdd = colHead.createEl("button", { cls: "pmg-btn pmg-btn--small", text: "+" });
      colAdd.title = `New ${kind === "gpt-task" ? "GPT task" : kind} in ${status.label}`;
      colAdd.addEventListener("click", () => this.plugin.openCreateModal(kind, status.value));
      const body = col.createDiv({ cls: "pmg-column-body" });
      if (inColumn.length === 0) {
        body.createEl("div", { cls: "pmg-column-empty", text: "Drop items here" });
      }
      for (const card of inColumn)
        body.appendChild(this.cardEl(card));
      col.addEventListener("dragover", (e) => {
        if (!this.dragging)
          return;
        e.preventDefault();
        col.addClass("pmg-column--dragover");
      });
      col.addEventListener("dragleave", () => col.removeClass("pmg-column--dragover"));
      col.addEventListener("drop", (e) => {
        e.preventDefault();
        col.removeClass("pmg-column--dragover");
        const drag = this.dragging;
        this.dragging = null;
        if (!drag || drag.status === status.value)
          return;
        const file = this.app.vault.getAbstractFileByPath(drag.path);
        if (file instanceof TFile)
          void this.setStatus(file, status.value);
      });
    }
  }
  cardEl(card) {
    const el = document.createElement("div");
    el.className = "pmg-card";
    el.draggable = true;
    el.createEl("div", { cls: "pmg-card-title", text: card.title });
    for (const meta of card.meta) {
      const row = el.createEl("div", { cls: "pmg-card-meta" });
      if (meta.icon !== void 0)
        renderIconInto(row, meta.icon);
      row.createSpan({ text: meta.text });
    }
    if (card.next) {
      el.createEl("div", { cls: "pmg-card-meta", text: card.next });
    }
    if (card.waiting) {
      el.createEl("div", { cls: "pmg-card-meta", text: `Waiting: ${card.waiting}` });
    }
    if (card.progress !== void 0) {
      const bar = el.createEl("div", { cls: "pmg-progress" });
      const fill = bar.createEl("div", { cls: "pmg-progress-fill" });
      fill.style.width = `${card.progress}%`;
      el.createEl("div", { cls: "pmg-card-meta", text: `${card.progress}%` });
    }
    if (card.due) {
      const due = el.createEl("div", {
        cls: "pmg-card-meta" + (card.overdue ? " pmg-overdue" : ""),
        text: (card.overdue ? "Overdue \xB7 " : "Due ") + prettyDate(card.due)
      });
      due.setAttr("data-due", card.due);
    }
    el.addEventListener("click", () => {
      void this.app.workspace.getLeaf(false).openFile(card.file);
    });
    el.addEventListener("dragstart", (e) => {
      var _a;
      this.dragging = { path: card.file.path, status: card.status };
      el.addClass("pmg-card--dragging");
      (_a = e.dataTransfer) == null ? void 0 : _a.setData("text/plain", card.file.path);
      if (e.dataTransfer)
        e.dataTransfer.effectAllowed = "move";
    });
    el.addEventListener("dragend", () => {
      this.dragging = null;
      el.removeClass("pmg-card--dragging");
    });
    return el;
  }
  async setStatus(file, status) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.status = status;
    });
    void this.render();
  }
};
