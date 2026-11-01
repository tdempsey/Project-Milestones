// Reconstructed source; see RECONSTRUCTION.md.
var EMPTY = { byPath: new Map(), allIcons: [] };
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
    const byPath = new Map();
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
