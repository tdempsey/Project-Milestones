// Reconstructed source; see RECONSTRUCTION.md.
var KIND_LABEL = {
  project: "project",
  milestone: "milestone",
  "gpt-task": "GPT task"
};
var CreateItemModal = class extends Modal {
  constructor(app, kind, settings, projectTitles, onCreated, iconizeIcons = [], initialStatus) {
    super(app);
    this.title = "";
    this.code = "";
    this.icon = "";
    this.owner = "";
    this.project = "";
    this.gpt = "";
    this.output = "";
    this.status = "";
    this.due = "";
    this.progress = "";
    this.next = "";
    this.waiting = "";
    this.kind = kind;
    this.settings = settings;
    this.projectTitles = projectTitles;
    this.onCreated = onCreated;
    this.iconizeIcons = iconizeIcons;
    this.status = kind === "project" ? "on-track" : kind === "milestone" ? "upcoming" : "queued";
    if (initialStatus) {
      const valid = (kind === "project" ? PROJECT_STATUSES : kind === "milestone" ? MILESTONE_STATUSES : GPT_TASK_STATUSES).map((s) => s.value);
      if (valid.includes(initialStatus))
        this.status = initialStatus;
    }
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: `New ${KIND_LABEL[this.kind]}` });
    new Setting(contentEl).setName("Title").addText((t) => {
      t.setPlaceholder(
        this.kind === "project" ? "e.g. Customer portal redesign" : this.kind === "milestone" ? "e.g. Usability sign-off" : "e.g. Draft the launch announcement"
      );
      t.onChange((v) => this.title = v);
      t.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter")
          void this.submit();
      });
      window.setTimeout(() => t.inputEl.focus(), 0);
    });
    if (this.kind === "project") {
      new Setting(contentEl).setName("Code").addText((t) => {
        t.setPlaceholder("e.g. PRJ-001 (optional)");
        t.onChange((v) => this.code = v);
      });
      const iconSetting = new Setting(contentEl).setName("Icon").setDesc("Shown next to the project on the dashboard. Optional.");
      const preview = iconSetting.controlEl.createSpan({ cls: "pmg-icon-preview" });
      const renderPreview = () => {
        preview.empty();
        const value = this.icon.trim();
        if (value === "") {
          preview.setText("Default");
        } else {
          renderIconGraphic(preview, value);
        }
      };
      iconSetting.addButton((b) => {
        b.setButtonText("Choose\u2026");
        b.onClick(() => {
          new IconPickerModal(this.app, this.icon, (value) => {
            this.icon = value;
            renderPreview();
          }, this.iconizeIcons).open();
        });
      });
      renderPreview();
    }
    if (this.kind === "gpt-task") {
      new Setting(contentEl).setName("GPT").addText((t) => {
        t.setPlaceholder("e.g. Research assistant");
        t.onChange((v) => this.gpt = v);
      });
      new Setting(contentEl).setName("Output tag").setDesc("Optional output property, shown in the GPT tasks table. URLs appear as links.").addText((t) => {
        t.setPlaceholder("Optional output value");
        t.onChange((v) => this.output = v);
      });
    }
    if (this.kind !== "project") {
      new Setting(contentEl).setName("Project").addDropdown((d) => {
        d.addOption("", "\u2014 none \u2014");
        for (const title of this.projectTitles)
          d.addOption(title, title);
        d.onChange((v) => this.project = v);
      });
    }
    new Setting(contentEl).setName("Owner").addText((t) => {
      t.setPlaceholder("Who is responsible?");
      t.onChange((v) => this.owner = v);
    });
    const statuses = this.kind === "project" ? PROJECT_STATUSES : this.kind === "milestone" ? MILESTONE_STATUSES : GPT_TASK_STATUSES;
    new Setting(contentEl).setName("Status").addDropdown((d) => {
      for (const s of statuses)
        d.addOption(s.value, s.label);
      d.setValue(this.status);
      d.onChange((v) => this.status = v);
    });
    if (this.kind === "project") {
      new Setting(contentEl).setName("Progress %").setDesc("Optional \u2014 leave blank to compute from milestones.").addText((t) => {
        t.setPlaceholder("0\u2013100");
        t.inputEl.type = "number";
        t.inputEl.min = "0";
        t.inputEl.max = "100";
        t.onChange((v) => this.progress = v);
      });
      new Setting(contentEl).setName("Next action").setDesc("Optional \u2014 the next concrete step for this project.").addText((t) => {
        t.setPlaceholder("e.g. Send the revised mockups");
        t.onChange((v) => this.next = v);
      });
      new Setting(contentEl).setName("Waiting for").setDesc("Optional \u2014 who or what this project is waiting on.").addText((t) => {
        t.setPlaceholder("e.g. Client sign-off");
        t.onChange((v) => this.waiting = v);
      });
    }
    new Setting(contentEl).setName("Due date").addText((t) => {
      t.inputEl.type = "date";
      t.onChange((v) => this.due = v);
    });
    new Setting(contentEl).addButton((b) => {
      b.setButtonText(`Create ${KIND_LABEL[this.kind]}`).setCta().onClick(() => void this.submit());
    });
  }
  folder() {
    return this.kind === "project" ? this.settings.projectsFolder : this.kind === "milestone" ? this.settings.milestonesFolder : this.settings.gptTasksFolder;
  }
  async submit() {
    var _a;
    const title = this.title.trim();
    if (!title) {
      new Notice("Give it a title first.");
      return;
    }
    const folder = this.folder().replace(/^\/+|\/+$/g, "");
    if (folder && !await this.app.vault.adapter.exists(folder)) {
      await this.app.vault.createFolder(folder);
    }
    const base = sanitizeFileName(title);
    let path = folder ? `${folder}/${base}.md` : `${base}.md`;
    let n = 2;
    while (await this.app.vault.adapter.exists(path)) {
      path = folder ? `${folder}/${base} ${n}.md` : `${base} ${n}.md`;
      n += 1;
    }
    const lines = ["---"];
    if (this.kind === "project" && this.code.trim())
      lines.push(`code: ${yamlScalar(this.code.trim())}`);
    if (this.kind === "project" && this.icon.trim())
      lines.push(`icon: ${yamlScalar(this.icon.trim())}`);
    if (this.kind === "gpt-task" && this.gpt.trim())
      lines.push(`gpt: ${yamlScalar(this.gpt.trim())}`);
    if (this.kind === "gpt-task" && this.output.trim())
      lines.push(`output: ${yamlScalar(this.output.trim())}`);
    if (this.kind !== "project" && this.project)
      lines.push(`project: ${yamlScalar(this.project)}`);
    if (this.owner.trim())
      lines.push(`owner: ${yamlScalar(this.owner.trim())}`);
    lines.push(`status: ${this.status}`);
    if (this.kind === "project" && this.progress.trim() !== "") {
      const p = Math.max(0, Math.min(100, Number(this.progress) || 0));
      lines.push(`progress: ${p}`);
    }
    if (this.kind === "project" && this.next.trim())
      lines.push(`next: ${yamlScalar(this.next.trim())}`);
    if (this.kind === "project" && this.waiting.trim())
      lines.push(`waiting: ${yamlScalar(this.waiting.trim())}`);
    if (this.due)
      lines.push(`due: ${this.due}`);
    lines.push("---", "", `# ${title}`, "");
    const file = await this.app.vault.create(path, lines.join("\n"));
    this.close();
    new Notice(`Created ${KIND_LABEL[this.kind]}: ${title}`);
    (_a = this.onCreated) == null ? void 0 : _a.call(this);
    await this.app.workspace.getLeaf(false).openFile(file);
  }
};
