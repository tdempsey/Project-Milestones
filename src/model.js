// Reconstructed source; see RECONSTRUCTION.md.
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
  return toDateString(new Date());
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
