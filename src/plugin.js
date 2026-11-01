// Reconstructed source; see RECONSTRUCTION.md.
var PMGPlugin = class extends Plugin {
  constructor() {
    super(...arguments);
    this.settings = { ...DEFAULT_SETTINGS };
    /** Which entity the board view is showing. */
    this.boardTab = "milestone";
    /** Iconize (obsidian-icon-folder) assignments, refreshed on load and on dashboard renders. */
    this.iconizeByPath = new Map();
    this.iconizeAllIcons = [];
  }
  async refreshIconize() {
    if (!this.settings.useIconize) {
      this.iconizeByPath = new Map();
      this.iconizeAllIcons = [];
      return;
    }
    const data = await loadIconizeIcons(this.app);
    this.iconizeByPath = data.byPath;
    this.iconizeAllIcons = data.allIcons;
  }
  async onload() {
    await this.loadSettings();
    await this.refreshIconize();
    this.registerView(VIEW_TYPE, (leaf) => new DashboardView(leaf, this));
    this.registerView(BOARD_VIEW_TYPE, (leaf) => new BoardView(leaf, this));
    this.addRibbonIcon("layout-dashboard", "Open projects dashboard", () => {
      void this.activateView();
    });
    this.addCommand({
      id: "open-dashboard",
      name: "Open dashboard",
      callback: () => void this.activateView()
    });
    this.addCommand({
      id: "open-board",
      name: "Open board",
      callback: () => void this.activateBoardView()
    });
    this.addCommand({
      id: "new-project",
      name: "New project",
      callback: () => this.openCreateModal("project")
    });
    this.addCommand({
      id: "new-milestone",
      name: "New milestone",
      callback: () => this.openCreateModal("milestone")
    });
    this.addCommand({
      id: "new-gpt-task",
      name: "New GPT task",
      callback: () => this.openCreateModal("gpt-task")
    });
    this.addCommand({
      id: "import-asana-milestones",
      name: "Import Asana JSON into Milestones",
      callback: () => new AsanaImportModal(this).open()
    });
    this.addSettingTab(new PMGSettingTab(this));
    this.app.workspace.onLayoutReady(() => {
      void this.notifyDueSummary();
    });
  }
  /** One quiet notice per session when anything is overdue or due today. */
  async notifyDueSummary() {
    await this.refreshIconize();
    const data = loadData(this.app, this.settings, this.iconizeByPath);
    const today = todayString();
    let overdue = 0;
    let dueToday = 0;
    const bump = (due, open, isOverdue2) => {
      if (!open)
        return;
      if (isOverdue2)
        overdue += 1;
      else if (due === today)
        dueToday += 1;
    };
    for (const p of data.projects) {
      bump(p.due, p.status !== "complete", p.due !== "" && p.due < today);
    }
    for (const m of data.milestones)
      bump(m.due, m.status !== "done", m.overdue);
    for (const t of data.gptTasks)
      bump(t.due, t.status !== "done", t.overdue);
    if (overdue + dueToday > 0) {
      const parts = [];
      if (overdue)
        parts.push(`${overdue} overdue`);
      if (dueToday)
        parts.push(`${dueToday} due today`);
      new Notice(`Projects tracker: ${parts.join(" \xB7 ")}. Open the dashboard for details.`, 9e3);
    }
  }
  async activateView() {
    var _a;
    const { workspace } = this.app;
    let leaf = (_a = workspace.getLeavesOfType(VIEW_TYPE)[0]) != null ? _a : null;
    if (!leaf) {
      leaf = workspace.getLeaf("tab");
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    void workspace.revealLeaf(leaf);
  }
  async activateBoardView() {
    var _a;
    const { workspace } = this.app;
    let leaf = (_a = workspace.getLeavesOfType(BOARD_VIEW_TYPE)[0]) != null ? _a : null;
    if (!leaf) {
      leaf = workspace.getLeaf("tab");
      await leaf.setViewState({ type: BOARD_VIEW_TYPE, active: true });
    }
    void workspace.revealLeaf(leaf);
  }
  openCreateModal(kind, initialStatus) {
    void this.refreshIconize().then(() => {
      const titles = loadData(this.app, this.settings, this.iconizeByPath).projects.map((p) => p.title);
      new CreateItemModal(this.app, kind, this.settings, titles, () => {
        for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
          const view = leaf.view;
          if (view instanceof DashboardView)
            void view.render();
        }
        for (const leaf of this.app.workspace.getLeavesOfType(BOARD_VIEW_TYPE)) {
          const view = leaf.view;
          if (view instanceof BoardView)
            void view.render();
        }
      }, this.iconizeAllIcons, initialStatus).open();
    });
  }
  async setLeaderboardEnabled(enabled) {
    this.settings.enableLeaderboard = enabled;
    // Hide synchronously even if saving or an icon refresh is still pending.
    if (!enabled) {
      for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE))
        leaf.view.contentEl.querySelectorAll(".pmg-leaderboard").forEach((el) => el.remove());
    }
    await this.saveSettings();
  }
  async loadSettings() {
    const saved = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...saved != null ? saved : {} };
    this.settings.leaderboardLimit = projectMomentumLimit(this.settings.leaderboardLimit);
  }
  async saveSettings() {
    await this.saveData(this.settings);
    // Apply settings to every open dashboard without reopening it.
    await Promise.all(this.app.workspace.getLeavesOfType(VIEW_TYPE).map((leaf) => {
      const view = leaf.view;
      return view instanceof DashboardView ? view.render() : Promise.resolve();
    }));
  }
};
