// Reconstructed source; see RECONSTRUCTION.md.
var PMGSettingTab = class extends PluginSettingTab {
  constructor(plugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Projects, Milestones & GPT Tasks" });
    containerEl.createEl("p", {
      text: "Items are plain notes with frontmatter, kept in three folders. Create a note in a folder (or use the New commands) and it appears on the dashboard."
    });
    new Setting(containerEl).setName("Workspace name").setDesc("Shown at the top of the dashboard.").addText((t) => {
      t.setValue(this.plugin.settings.workspaceName);
      t.onChange(async (v) => {
        this.plugin.settings.workspaceName = v.trim() || "Workroom";
        await this.plugin.saveSettings();
      });
    });
    new Setting(containerEl).setName("Projects folder").addText((t) => {
      t.setValue(this.plugin.settings.projectsFolder);
      t.onChange(async (v) => {
        this.plugin.settings.projectsFolder = v.trim() || "Projects";
        await this.plugin.saveSettings();
      });
    });
    new Setting(containerEl).setName("Milestones folder").addText((t) => {
      t.setValue(this.plugin.settings.milestonesFolder);
      t.onChange(async (v) => {
        this.plugin.settings.milestonesFolder = v.trim() || "Milestones";
        await this.plugin.saveSettings();
      });
    });
    new Setting(containerEl).setName("GPT tasks folder").addText((t) => {
      t.setValue(this.plugin.settings.gptTasksFolder);
      t.onChange(async (v) => {
        this.plugin.settings.gptTasksFolder = v.trim() || "GPT Tasks";
        await this.plugin.saveSettings();
      });
    });
    new Setting(containerEl).setName("Use Iconize icons").setDesc(
      "If the Iconize plugin (obsidian-icon-folder) is installed, a project note's Iconize icon is used on the dashboard when the note has no icon: of its own, and all installed Iconize pack icons appear in the icon picker. A note's own icon: frontmatter always wins."
    ).addToggle((t) => {
      t.setValue(this.plugin.settings.useIconize);
      t.onChange(async (v) => {
        this.plugin.settings.useIconize = v;
        await this.plugin.saveSettings();
        await this.plugin.refreshIconize();
      });
    });
    new Setting(containerEl).setName("Enable Project Momentum").setDesc(
      "Show project rankings by progress percentage, then completed milestones. Includes completed projects. Off by default; turning it off immediately hides the Project Momentum in all open dashboards."
    ).addToggle((t) => {
      t.setValue(this.plugin.settings.enableLeaderboard);
      t.onChange(async (v) => {
        await this.plugin.setLeaderboardEnabled(v);
      });
    });
    new Setting(containerEl).setName("Project Momentum display limit").setDesc(
      "Maximum projects to display after ranking. Enter a positive whole number (default 5)."
    ).addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.min = "1";
      t.inputEl.step = "1";
      t.setValue(String(projectMomentumLimit(this.plugin.settings.leaderboardLimit)));
      t.onChange(async (value) => {
        const number = Number(value);
        const valid = value.trim() !== "" && Number.isSafeInteger(number) && number > 0;
        t.inputEl.setCustomValidity(valid ? "" : "Enter a positive whole number.");
        t.inputEl.setAttribute("aria-invalid", String(!valid));
        if (!valid) {
          t.inputEl.reportValidity();
          return;
        }
        this.plugin.settings.leaderboardLimit = number;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h3", { text: "Frontmatter reference" });
    const pre = containerEl.createEl("pre", { cls: "pmg-settings-pre" });
    pre.setText(
      [
        "Project note:",
        "  code: PRJ-001        (optional)",
        "  icon: \u{1F680}             (optional; an emoji or a Lucide icon name like rocket, map, bot)",
        "  owner: Alex Morgan",
        "  status: on-track | at-risk | blocked | complete",
        "  progress: 80         (optional; otherwise computed from milestones)",
        "  next: Send the revised mockups   (optional; the next concrete action)",
        "  waiting: Client sign-off          (optional; who or what it is waiting on)",
        "  due: 2026-10-23",
        "",
        "Milestone note:",
        "  project: Customer portal redesign   (the project's note title)",
        "  owner: J. Chen",
        "  status: upcoming | in-progress | blocked | done",
        "  due: 2026-10-19      (past-due open milestones show as Overdue)",
        "",
        "GPT task note:",
        "  gpt: Research assistant",
        "  project: Customer portal redesign",
        "  status: queued | in-progress | in-review | done",
        "  due: 2026-10-24"
      ].join("\n")
    );
  }
};
