// Reconstructed source; see RECONSTRUCTION.md.
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
