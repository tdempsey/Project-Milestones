// Reconstructed source; see RECONSTRUCTION.md.
function isIconName(value) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value.trim());
}
var pmgPackIcons = new Map();
function renderPackIcon(node, value) {
  const icon = pmgPackIcons.get(value);
  if (!icon) return false;
  // Rebuild only inert SVG geometry: never insert pack markup as HTML.
  const source = typeof icon.svgElement === "string" ? icon.svgElement : icon.svgElement?.outerHTML || `<svg ${icon.svgViewbox || ""}>${icon.svgContent || ""}</svg>`;
  const parsed = new DOMParser().parseFromString(source, "image/svg+xml");
  const tags = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon"]);
  const attrs = new Set(["viewBox", "d", "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "width", "height", "points", "transform", "fill", "fill-rule", "clip-rule", "opacity", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"]);
  const copy = (el) => {
    if (!tags.has(el.localName)) return null;
    const clean = node.ownerDocument.createElementNS("http://www.w3.org/2000/svg", el.localName);
    for (const attr of Array.from(el.attributes)) {
      if (attrs.has(attr.name) && !/url\s*\(|[<>]|javascript:|data:/i.test(attr.value)) clean.setAttribute(attr.name, attr.value);
    }
    for (const child of Array.from(el.children)) {
      const next = copy(child);
      if (next) clean.appendChild(next);
    }
    return clean;
  };
  const svg = copy(parsed.documentElement);
  if (!svg || svg.localName !== "svg") return false;
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("aria-hidden", "true");
  if (!svg.hasAttribute("viewBox")) svg.setAttribute("viewBox", "0 0 24 24");
  if (!svg.hasAttribute("fill")) svg.setAttribute("fill", "currentColor");
  node.appendChild(svg);
  return true;
}
function renderIconGraphic(node, value) {
  if (renderPackIcon(node, value)) return;
  if (isIconName(value)) setIcon(node, value);
  else node.setText(value);
}
function renderIconInto(parent, icon) {
  const span = parent.createSpan({ cls: "pmg-icon" });
  const value = (icon != null ? icon : "").trim();
  if (value === "") {
    span.addClass("pmg-icon--default");
    setIcon(span, "folder");
  } else {
    renderIconGraphic(span, value);
  }
  return span;
}
var LUCIDE_ICONS = [
  "rocket",
  "map",
  "compass",
  "globe",
  "target",
  "flag",
  "star",
  "heart",
  "home",
  "briefcase",
  "code",
  "calendar",
  "camera",
  "music",
  "film",
  "newspaper",
  "mail",
  "users",
  "book-open",
  "bot",
  "lightbulb",
  "zap",
  "flame",
  "coffee",
  "utensils",
  "shopping-bag",
  "trending-up",
  "search",
  "settings",
  "wrench",
  "hammer",
  "palette",
  "pen-tool",
  "mic",
  "radio",
  "tv",
  "phone",
  "gift",
  "award",
  "crown",
  "gem",
  "leaf",
  "sun",
  "moon",
  "anchor",
  "plane",
  "car",
  "bike",
  "dumbbell",
  "graduation-cap",
  "landmark",
  "scale",
  "rainbow",
  "sparkles"
];
var EMOJI_ICONS = [
  "\u{1F680}",
  "\u{1F4DA}",
  "\u{1F916}",
  "\u{1F5FA}\uFE0F",
  "\u{1F3AF}",
  "\u{1F4CC}",
  "\u{1F4C5}",
  "\u{1F4F0}",
  "\u{1F399}\uFE0F",
  "\u{1F3AC}",
  "\u{1F3B5}",
  "\u{1F4F8}",
  "\u{1F4A1}",
  "\u{1F4BC}",
  "\u{1F3E0}",
  "\u{1F308}",
  "\u{1F37D}\uFE0F",
  "\u2615",
  "\u{1F3C6}",
  "\u{1F525}",
  "\u2B50",
  "\u2764\uFE0F",
  "\u{1F6E0}\uFE0F",
  "\u{1F4CA}",
  "\u{1F9ED}",
  "\u2708\uFE0F",
  "\u{1F393}",
  "\u{1F4B0}",
  "\u{1F331}",
  "\u{1F3A8}",
  "\u26BD",
  "\u{1F3E5}"
];
var IconPickerModal = class extends Modal {
  constructor(app, current, onPick, extraIcons = [], extraLabel = "From Iconize") {
    super(app);
    this.query = "";
    this.current = (current != null ? current : "").trim();
    this.onPick = onPick;
    this.extraIcons = extraIcons;
    this.extraLabel = extraLabel;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("pmg-picker");
    contentEl.createEl("h2", { text: "Pick an icon" });
    const searchWrap = contentEl.createDiv({ cls: "pmg-picker-search" });
    this.input = searchWrap.createEl("input", { cls: "pmg-picker-input" });
    this.input.type = "text";
    this.input.placeholder = "Search icons, or type any emoji / icon name\u2026";
    if (this.current && !LUCIDE_ICONS.includes(this.current) && !EMOJI_ICONS.includes(this.current)) {
      this.input.value = this.current;
      this.query = this.current.toLowerCase();
    }
    this.input.addEventListener("input", () => {
      this.query = this.input.value.trim().toLowerCase();
      this.renderGrids();
    });
    window.setTimeout(() => this.input.focus(), 0);
    contentEl.createEl("div", { cls: "pmg-picker-section", text: "Icons" });
    this.lucideGrid = contentEl.createDiv({ cls: "pmg-icon-grid" });
    this.extraSection = contentEl.createEl("div", { cls: "pmg-picker-section", text: this.extraLabel });
    this.extraGrid = contentEl.createDiv({ cls: "pmg-icon-grid" });
    this.emojiSection = contentEl.createEl("div", { cls: "pmg-picker-section", text: "Emoji" });
    this.emojiGrid = contentEl.createDiv({ cls: "pmg-icon-grid" });
    const footer = contentEl.createDiv({ cls: "pmg-picker-footer" });
    this.customBtn = footer.createEl("button", { cls: "pmg-btn" });
    this.customBtn.addEventListener("click", () => this.pick(this.input.value.trim()));
    const noneBtn = footer.createEl("button", { cls: "pmg-btn", text: "No icon (default)" });
    noneBtn.addEventListener("click", () => this.pick(""));
    this.renderGrids();
    // Re-query the live catalogue on every opening, including after pack installs.
    this.pickerClosed = false;
    const projectPlugin = this.app.plugins?.getPlugin?.("project-milestone-gpt-tracker");
    if (projectPlugin?.settings?.useIconize === false) return;
    void loadIconizeIcons(this.app).then((data) => {
      if (this.pickerClosed) return;
      this.extraIcons = [...new Set([...this.extraIcons, ...data.allIcons])];
      this.renderGrids();
    });
  }
  onClose() {
    this.pickerClosed = true;
  }
  pick(value) {
    this.onPick(value);
    this.close();
  }
  renderGrids() {
    const q = this.query;
    this.lucideGrid.empty();
    const names = LUCIDE_ICONS.filter((n) => q === "" || n.includes(q));
    if (names.length === 0) {
      this.lucideGrid.createEl("div", { cls: "pmg-picker-none", text: "No matching icons." });
    }
    for (const name of names) {
      const btn = this.lucideGrid.createEl("button", { cls: "pmg-icon-btn" });
      btn.title = name;
      if (name === this.current)
        btn.addClass("is-selected");
      setIcon(btn, name);
      btn.addEventListener("click", () => this.pick(name));
    }
    const extras = this.extraIcons.filter(
      (v) => q === "" || `${v} ${pmgPackIcons.get(v)?.iconPackName || ""}`.toLowerCase().includes(q)
    );
    const showExtras = extras.length > 0;
    this.extraSection.style.display = showExtras ? "" : "none";
    this.extraGrid.style.display = showExtras ? "" : "none";
    if (showExtras) {
      this.extraGrid.empty();
      for (const value of extras) {
        const btn = this.extraGrid.createEl("button", { cls: "pmg-icon-btn" });
        btn.title = value;
        if (value === this.current)
          btn.addClass("is-selected");
        renderIconGraphic(btn, value);
        btn.addEventListener("click", () => this.pick(value));
      }
    }
    const showEmoji = q === "";
    this.emojiSection.style.display = showEmoji ? "" : "none";
    this.emojiGrid.style.display = showEmoji ? "" : "none";
    if (showEmoji) {
      this.emojiGrid.empty();
      for (const emoji of EMOJI_ICONS) {
        const btn = this.emojiGrid.createEl("button", { cls: "pmg-icon-btn", text: emoji });
        btn.title = emoji;
        if (emoji === this.current)
          btn.addClass("is-selected");
        btn.addEventListener("click", () => this.pick(emoji));
      }
    }
    const custom = this.input.value.trim();
    this.customBtn.style.display = custom !== "" ? "" : "none";
    this.customBtn.setText(`Use \u201C${custom}\u201D`);
  }
};
