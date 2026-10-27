"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PMGPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian6 = require("obsidian");

// src/board.ts
var import_obsidian2 = require("obsidian");

// src/icon-picker.ts
var import_obsidian = require("obsidian");
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
  if (isIconName(value)) (0, import_obsidian.setIcon)(node, value);
  else node.setText(value);
}
function renderIconInto(parent, icon) {
  const span = parent.createSpan({ cls: "pmg-icon" });
  const value = (icon != null ? icon : "").trim();
  if (value === "") {
    span.addClass("pmg-icon--default");
    (0, import_obsidian.setIcon)(span, "folder");
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
var IconPickerModal = class extends import_obsidian.Modal {
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
      (0, import_obsidian.setIcon)(btn, name);
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

// src/types.ts
var PROJECT_STATUSES = [
  { value: "on-track", label: "On track" },
  { value: "at-risk", label: "At risk" },
  { value: "blocked", label: "Blocked" },
  { value: "complete", label: "Complete" }
];
var MILESTONE_STATUSES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "in-progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" }
];
var GPT_TASK_STATUSES = [
  { value: "queued", label: "Queued" },
  { value: "in-progress", label: "In progress" },
  { value: "in-review", label: "In review" },
  { value: "done", label: "Done" }
];
function labelOf(list, value) {
  var _a, _b;
  return (_b = (_a = list.find((s) => s.value === value)) == null ? void 0 : _a.label) != null ? _b : value;
}
function fmString(fm, key) {
  if (!fm)
    return "";
  const v = fm[key];
  if (v === null || v === void 0)
    return "";
  if (v instanceof Date)
    return toDateString(v);
  return String(v).trim();
}
function fmNumber(fm, key) {
  if (!fm)
    return null;
  const v = fm[key];
  if (typeof v === "number" && Number.isFinite(v))
    return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)))
    return Number(v);
  return null;
}
function toDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function todayString() {
  return toDateString(/* @__PURE__ */ new Date());
}
function fmDate(fm, key) {
  const raw = fmString(fm, key);
  if (!raw)
    return "";
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m)
    return `${m[1]}-${m[2]}-${m[3]}`;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : toDateString(parsed);
}
function prettyDate(iso) {
  if (!iso)
    return "\u2014";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m)
    return iso;
  return `${months[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}
function isOverdue(due, done) {
  return !done && due !== "" && due < todayString();
}
function yamlScalar(value) {
  if (value === "")
    return '""';
  if (/^[A-Za-z0-9][A-Za-z0-9 _.\-/&'()]*$/.test(value) && !/^(yes|no|true|false|null|~)$/i.test(value)) {
    return value;
  }
  return JSON.stringify(value);
}
function sanitizeFileName(title) {
  const cleaned = title.replace(/[\\/:*?"<>|#^[\]]/g, "").trim();
  return cleaned === "" ? "Untitled" : cleaned;
}

// src/store.ts
var DEFAULT_SETTINGS = {
  workspaceName: "Workroom",
  projectsFolder: "Projects",
  milestonesFolder: "Milestones",
  gptTasksFolder: "GPT Tasks",
  useIconize: true,
  enableLeaderboard: false,
  leaderboardLimit: 5
};
function projectMomentumLimit(value) {
  return Number.isSafeInteger(value) && value > 0 ? value : 5;
}
function inFolder(file, folder) {
  var _a;
  const f = folder.replace(/^\/+|\/+$/g, "");
  if (f === "")
    return ((_a = file.parent) == null ? void 0 : _a.path) === "/";
  return file.path.startsWith(f + "/");
}
function oneOf(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}
function loadData(app, settings, iconizeByPath) {
  var _a, _b;
  const files = app.vault.getMarkdownFiles();
  const milestones = [];
  const gptTasks = [];
  const rawProjects = [];
  for (const file of files) {
    const fm = (_a = app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
    if (inFolder(file, settings.milestonesFolder)) {
      const status = oneOf(fmString(fm, "status").toLowerCase(), ["upcoming", "in-progress", "blocked", "done"], "upcoming");
      const due = fmDate(fm, "due");
      milestones.push({
        file,
        title: fmString(fm, "title") || file.basename,
        project: fmString(fm, "project"),
        projectLinked: false,
        // resolved after all projects are known
        owner: fmString(fm, "owner"),
        status,
        due,
        overdue: isOverdue(due, status === "done")
      });
    } else if (inFolder(file, settings.gptTasksFolder)) {
      const status = oneOf(fmString(fm, "status").toLowerCase(), ["queued", "in-progress", "in-review", "done"], "queued");
      const due = fmDate(fm, "due");
      gptTasks.push({
        file,
        title: fmString(fm, "title") || file.basename,
        gpt: fmString(fm, "gpt"),
        project: fmString(fm, "project"),
        projectLinked: false,
        // resolved after all projects are known
        output: fmString(fm, "output"),
        status,
        due,
        overdue: isOverdue(due, status === "done")
      });
    } else if (inFolder(file, settings.projectsFolder)) {
      const status = oneOf(fmString(fm, "status").toLowerCase(), ["on-track", "at-risk", "blocked", "complete"], "on-track");
      const fmIcon = fmString(fm, "icon");
      rawProjects.push({
        file,
        title: fmString(fm, "title") || file.basename,
        code: fmString(fm, "code"),
        icon: fmIcon || (settings.useIconize ? (_b = iconizeByPath == null ? void 0 : iconizeByPath.get(file.path)) != null ? _b : "" : ""),
        owner: fmString(fm, "owner"),
        status,
        due: fmDate(fm, "due"),
        next: fmString(fm, "next"),
        waiting: fmString(fm, "waiting")
      });
    }
  }
  const projects = rawProjects.map((p) => {
    var _a2;
    const linked = milestones.filter(
      (m) => m.project !== "" && m.project.toLowerCase() === p.title.toLowerCase()
    );
    const done = linked.filter((m) => m.status === "done").length;
    const gptCount = gptTasks.filter(
      (t) => t.project !== "" && t.project.toLowerCase() === p.title.toLowerCase()
    ).length;
    const fm = (_a2 = app.metadataCache.getFileCache(p.file)) == null ? void 0 : _a2.frontmatter;
    const explicit = fmNumber(fm, "progress");
    const progress = explicit !== null ? Math.max(0, Math.min(100, Math.round(explicit))) : linked.length > 0 ? Math.round(done / linked.length * 100) : p.status === "complete" ? 100 : 0;
    return {
      ...p,
      progress,
      progressExplicit: explicit !== null,
      gptCount,
      milestoneTotal: linked.length,
      milestoneDone: done
    };
  });
  const projectTitles = new Set(projects.map((p) => p.title.toLowerCase()));
  for (const m of milestones) {
    m.projectLinked = m.project !== "" && projectTitles.has(m.project.toLowerCase());
  }
  for (const t of gptTasks) {
    t.projectLinked = t.project !== "" && projectTitles.has(t.project.toLowerCase());
  }
  const byDueThenTitle = (a, b) => {
    if (a.due !== b.due)
      return a.due === "" ? 1 : b.due === "" ? -1 : a.due < b.due ? -1 : 1;
    return a.title.localeCompare(b.title);
  };
  projects.sort(byDueThenTitle);
  milestones.sort((a, b) => {
    if (a.status === "done" !== (b.status === "done"))
      return a.status === "done" ? 1 : -1;
    return byDueThenTitle(a, b);
  });
  const gptOrder = ["in-progress", "in-review", "queued", "done"];
  gptTasks.sort((a, b) => {
    const d = gptOrder.indexOf(a.status) - gptOrder.indexOf(b.status);
    return d !== 0 ? d : byDueThenTitle(a, b);
  });
  return { projects, milestones, gptTasks };
}

// src/board.ts
var BOARD_VIEW_TYPE = "pmg-board";
var TAB_KINDS = [
  { kind: "project", label: "Projects" },
  { kind: "milestone", label: "Milestones" },
  { kind: "gpt-task", label: "GPT tasks" }
];
var BoardView = class extends import_obsidian2.ItemView {
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
        if (file instanceof import_obsidian2.TFile)
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

// src/iconize.ts
var EMPTY = { byPath: /* @__PURE__ */ new Map(), allIcons: [] };
function camelToKebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2").toLowerCase();
}
function normalizeIconizeValue(raw) {
  var _a, _b;
  let value = "";
  if (typeof raw === "string") {
    value = raw.trim();
  } else if (raw && typeof raw === "object") {
    const obj = raw;
    const candidate = (_b = (_a = obj.icon) != null ? _a : obj.name) != null ? _b : obj.iconName;
    if (typeof candidate === "string")
      value = candidate.trim();
  }
  if (value === "")
    return "";
  if (value.startsWith("<") || value.startsWith("data:"))
    return "";
  // Keep Iconize's pack prefix; Fab/Far/Ra/Li are distinct namespaces.
  return value;
}
function collectEntries(source, into) {
  for (const [key, raw] of Object.entries(source)) {
    if (key === "settings" || key === "settingsData")
      continue;
    if (typeof raw !== "string" && !(raw && typeof raw === "object"))
      continue;
    const icon = normalizeIconizeValue(raw);
    if (icon !== "")
      into.set(key, icon);
  }
}
async function loadIconizeIcons(app) {
  const path = `${app.vault.configDir}/plugins/obsidian-icon-folder/data.json`;
  const all = new Set();
  // Iconize owns ZIP loading and its configured iconPacksPath. Its API includes
  // every installed icon (not just the extracted SVGs already assigned to notes).
  const iconize = app.plugins?.getPlugin?.("obsidian-icon-folder") || app.plugins?.plugins?.["obsidian-icon-folder"];
  try {
    for (const pack of iconize?.api?.getAllIconPacks?.() || []) {
      for (const icon of pack.icons || []) {
        const prefix = icon.prefix || pack.prefix;
        const name = (icon.name || "").split(/[ _-]/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join("");
        if (!prefix || !name) continue;
        const id = prefix + name;
        pmgPackIcons.set(id, icon);
        all.add(id);
      }
    }
  } catch (error) {
    console.warn("PMG: could not read Iconize pack catalogue", error);
  }
  try {
    if (!await app.vault.adapter.exists(path))
      return { byPath: new Map(), allIcons: [...all] };
    const text = await app.vault.adapter.read(path);
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object")
      return EMPTY;
    const root = parsed;
    const byPath = /* @__PURE__ */ new Map();
    collectEntries(root, byPath);
    const nested = root.icons;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      collectEntries(nested, byPath);
    }
    const allIcons = [...new Set([...all, ...byPath.values()])];
    return { byPath, allIcons };
  } catch (e) {
    return { byPath: new Map(), allIcons: [...all] };
  }
}

// src/modals.ts
var import_obsidian3 = require("obsidian");
var KIND_LABEL = {
  project: "project",
  milestone: "milestone",
  "gpt-task": "GPT task"
};
var CreateItemModal = class extends import_obsidian3.Modal {
  constructor(app, kind, settings, projectTitles, onCreated, iconizeIcons = [], initialStatus) {
    super(app);
    this.title = "";
    this.code = "";
    this.icon = "";
    this.owner = "";
    this.project = "";
    this.gpt = "";
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
    new import_obsidian3.Setting(contentEl).setName("Title").addText((t) => {
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
      new import_obsidian3.Setting(contentEl).setName("Code").addText((t) => {
        t.setPlaceholder("e.g. PRJ-001 (optional)");
        t.onChange((v) => this.code = v);
      });
      const iconSetting = new import_obsidian3.Setting(contentEl).setName("Icon").setDesc("Shown next to the project on the dashboard. Optional.");
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
      new import_obsidian3.Setting(contentEl).setName("GPT").addText((t) => {
        t.setPlaceholder("e.g. Research assistant");
        t.onChange((v) => this.gpt = v);
      });
    }
    if (this.kind !== "project") {
      new import_obsidian3.Setting(contentEl).setName("Project").addDropdown((d) => {
        d.addOption("", "\u2014 none \u2014");
        for (const title of this.projectTitles)
          d.addOption(title, title);
        d.onChange((v) => this.project = v);
      });
    }
    new import_obsidian3.Setting(contentEl).setName("Owner").addText((t) => {
      t.setPlaceholder("Who is responsible?");
      t.onChange((v) => this.owner = v);
    });
    const statuses = this.kind === "project" ? PROJECT_STATUSES : this.kind === "milestone" ? MILESTONE_STATUSES : GPT_TASK_STATUSES;
    new import_obsidian3.Setting(contentEl).setName("Status").addDropdown((d) => {
      for (const s of statuses)
        d.addOption(s.value, s.label);
      d.setValue(this.status);
      d.onChange((v) => this.status = v);
    });
    if (this.kind === "project") {
      new import_obsidian3.Setting(contentEl).setName("Progress %").setDesc("Optional \u2014 leave blank to compute from milestones.").addText((t) => {
        t.setPlaceholder("0\u2013100");
        t.inputEl.type = "number";
        t.inputEl.min = "0";
        t.inputEl.max = "100";
        t.onChange((v) => this.progress = v);
      });
      new import_obsidian3.Setting(contentEl).setName("Next action").setDesc("Optional \u2014 the next concrete step for this project.").addText((t) => {
        t.setPlaceholder("e.g. Send the revised mockups");
        t.onChange((v) => this.next = v);
      });
      new import_obsidian3.Setting(contentEl).setName("Waiting for").setDesc("Optional \u2014 who or what this project is waiting on.").addText((t) => {
        t.setPlaceholder("e.g. Client sign-off");
        t.onChange((v) => this.waiting = v);
      });
    }
    new import_obsidian3.Setting(contentEl).setName("Due date").addText((t) => {
      t.inputEl.type = "date";
      t.onChange((v) => this.due = v);
    });
    new import_obsidian3.Setting(contentEl).addButton((b) => {
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
      new import_obsidian3.Notice("Give it a title first.");
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
    new import_obsidian3.Notice(`Created ${KIND_LABEL[this.kind]}: ${title}`);
    (_a = this.onCreated) == null ? void 0 : _a.call(this);
    await this.app.workspace.getLeaf(false).openFile(file);
  }
};

// src/view.ts
var import_obsidian5 = require("obsidian");

// src/edit-modals.ts
var import_obsidian4 = require("obsidian");
var ProgressModal = class extends import_obsidian4.Modal {
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
var TextEditModal = class extends import_obsidian4.Modal {
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
var DueDateModal = class extends import_obsidian4.Modal {
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

// src/view.ts
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
var DashboardView = class extends import_obsidian5.ItemView {
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
      const menu = new import_obsidian5.Menu();
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
    new import_obsidian5.Notice(value ? `Icon updated for ${p.title}` : `Icon cleared for ${p.title}`);
    void this.render();
  }
  renderHeader(root) {
    const head = this.el(root, "div", "pmg-header");
    const left = this.el(head, "div", "pmg-header-left");
    this.el(left, "div", "pmg-eyebrow", this.plugin.settings.workspaceName);
    this.el(left, "h2", "pmg-title", "Workspace overview");
    const now = /* @__PURE__ */ new Date();
    this.el(
      left,
      "div",
      "pmg-subtitle",
      now.toLocaleDateString(void 0, { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    );
    const actions = this.el(head, "div", "pmg-header-actions");
    const boardBtn = this.el(actions, "button", "pmg-btn", "Board");
    boardBtn.addEventListener("click", () => void this.plugin.activateBoardView());
    const refresh = this.el(actions, "button", "pmg-btn");
    (0, import_obsidian5.setIcon)(refresh, "refresh-cw");
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
      const d = /* @__PURE__ */ new Date();
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
    new import_obsidian5.Notice(`Exported ${rows.length - 1} items to CSV`);
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

// src/main.ts
var PMGPlugin = class extends import_obsidian6.Plugin {
  constructor() {
    super(...arguments);
    this.settings = { ...DEFAULT_SETTINGS };
    /** Which entity the board view is showing. */
    this.boardTab = "milestone";
    /** Iconize (obsidian-icon-folder) assignments, refreshed on load and on dashboard renders. */
    this.iconizeByPath = /* @__PURE__ */ new Map();
    this.iconizeAllIcons = [];
  }
  async refreshIconize() {
    if (!this.settings.useIconize) {
      this.iconizeByPath = /* @__PURE__ */ new Map();
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
      new import_obsidian6.Notice(`Projects tracker: ${parts.join(" \xB7 ")}. Open the dashboard for details.`, 9e3);
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
var PMGSettingTab = class extends import_obsidian6.PluginSettingTab {
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
    new import_obsidian6.Setting(containerEl).setName("Workspace name").setDesc("Shown at the top of the dashboard.").addText((t) => {
      t.setValue(this.plugin.settings.workspaceName);
      t.onChange(async (v) => {
        this.plugin.settings.workspaceName = v.trim() || "Workroom";
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian6.Setting(containerEl).setName("Projects folder").addText((t) => {
      t.setValue(this.plugin.settings.projectsFolder);
      t.onChange(async (v) => {
        this.plugin.settings.projectsFolder = v.trim() || "Projects";
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian6.Setting(containerEl).setName("Milestones folder").addText((t) => {
      t.setValue(this.plugin.settings.milestonesFolder);
      t.onChange(async (v) => {
        this.plugin.settings.milestonesFolder = v.trim() || "Milestones";
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian6.Setting(containerEl).setName("GPT tasks folder").addText((t) => {
      t.setValue(this.plugin.settings.gptTasksFolder);
      t.onChange(async (v) => {
        this.plugin.settings.gptTasksFolder = v.trim() || "GPT Tasks";
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian6.Setting(containerEl).setName("Use Iconize icons").setDesc(
      "If the Iconize plugin (obsidian-icon-folder) is installed, a project note's Iconize icon is used on the dashboard when the note has no icon: of its own, and all installed Iconize pack icons appear in the icon picker. A note's own icon: frontmatter always wins."
    ).addToggle((t) => {
      t.setValue(this.plugin.settings.useIconize);
      t.onChange(async (v) => {
        this.plugin.settings.useIconize = v;
        await this.plugin.saveSettings();
        await this.plugin.refreshIconize();
      });
    });
    new import_obsidian6.Setting(containerEl).setName("Enable Project Momentum").setDesc(
      "Show project rankings by progress percentage, then completed milestones. Includes completed projects. Off by default; turning it off immediately hides the Project Momentum in all open dashboards."
    ).addToggle((t) => {
      t.setValue(this.plugin.settings.enableLeaderboard);
      t.onChange(async (v) => {
        await this.plugin.setLeaderboardEnabled(v);
      });
    });
    new import_obsidian6.Setting(containerEl).setName("Project Momentum display limit").setDesc(
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
