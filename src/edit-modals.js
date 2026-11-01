// Reconstructed source; see RECONSTRUCTION.md.
var ProgressModal = class extends Modal {
  constructor(app, title, current, explicit, onSave) {
    super(app);
    this.value = current;
    this.explicit = explicit;
    this.onSave = onSave;
    this.titleEl.setText(`Progress \u2014 ${title}`);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("pmg-picker");
    const row = contentEl.createDiv({ cls: "pmg-edit-row" });
    const slider = row.createEl("input", { cls: "pmg-progress-slider" });
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = String(this.value);
    const readout = row.createSpan({ cls: "pmg-progress-readout", text: `${this.value}%` });
    slider.addEventListener("input", () => {
      this.value = Number(slider.value);
      readout.setText(`${this.value}%`);
    });
    if (!this.explicit) {
      contentEl.createEl("p", {
        cls: "pmg-edit-note",
        text: "Currently computed from this project's milestones. Saving sets an explicit value in the note."
      });
    }
    const footer = contentEl.createDiv({ cls: "pmg-picker-footer" });
    const save = footer.createEl("button", { cls: "pmg-btn pmg-btn--cta", text: "Save" });
    save.addEventListener("click", () => {
      this.onSave(this.value);
      this.close();
    });
    if (this.explicit) {
      const clear = footer.createEl("button", { cls: "pmg-btn", text: "Compute from milestones" });
      clear.addEventListener("click", () => {
        this.onSave(null);
        this.close();
      });
    }
    const cancel = footer.createEl("button", { cls: "pmg-btn", text: "Cancel" });
    cancel.addEventListener("click", () => this.close());
  }
};
var TextEditModal = class extends Modal {
  constructor(app, label, title, current, onSave) {
    super(app);
    this.value = current;
    this.onSave = onSave;
    this.titleEl.setText(`${label} \u2014 ${title}`);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("pmg-picker");
    const input = contentEl.createEl("input", { cls: "pmg-picker-input" });
    input.type = "text";
    input.value = this.value;
    input.addEventListener("input", () => this.value = input.value);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.onSave(this.value.trim());
        this.close();
      }
    });
    window.setTimeout(() => input.focus(), 0);
    const footer = contentEl.createDiv({ cls: "pmg-picker-footer" });
    const save = footer.createEl("button", { cls: "pmg-btn pmg-btn--cta", text: "Save" });
    save.addEventListener("click", () => {
      this.onSave(this.value.trim());
      this.close();
    });
    if (this.value) {
      const clear = footer.createEl("button", { cls: "pmg-btn", text: "Clear" });
      clear.addEventListener("click", () => {
        this.onSave("");
        this.close();
      });
    }
    const cancel = footer.createEl("button", { cls: "pmg-btn", text: "Cancel" });
    cancel.addEventListener("click", () => this.close());
  }
};
var DueDateModal = class extends Modal {
  constructor(app, title, current, onSave) {
    super(app);
    this.value = current;
    this.onSave = onSave;
    this.titleEl.setText(`Due date \u2014 ${title}`);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("pmg-picker");
    const input = contentEl.createEl("input", { cls: "pmg-picker-input" });
    input.type = "date";
    input.value = this.value;
    input.addEventListener("change", () => this.value = input.value);
    const footer = contentEl.createDiv({ cls: "pmg-picker-footer" });
    const save = footer.createEl("button", { cls: "pmg-btn pmg-btn--cta", text: "Save" });
    save.addEventListener("click", () => {
      this.onSave(this.value);
      this.close();
    });
    if (this.value) {
      const clear = footer.createEl("button", { cls: "pmg-btn", text: "Clear date" });
      clear.addEventListener("click", () => {
        this.onSave("");
        this.close();
      });
    }
    const cancel = footer.createEl("button", { cls: "pmg-btn", text: "Cancel" });
    cancel.addEventListener("click", () => this.close());
  }
};
