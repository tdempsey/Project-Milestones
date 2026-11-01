# Projects, Milestones & GPT Tasks — Obsidian plugin

A dashboard for your vault that tracks **projects**, **milestones**, and **GPT tasks** — the Obsidian-native version of the Workroom dashboard. All data lives in plain Markdown notes with frontmatter, in three folders. No database, no lock-in: edit a note's frontmatter and the dashboard updates itself.

## What you get

- A **dashboard view**: stat cards (projects, milestones, GPT tasks, needs-attention), a "Needs attention" list (blocked, at-risk, overdue), and three tables with status chips and progress bars.
- **Create commands** and buttons: New project / New milestone / New GPT task — a small form writes the note with the right frontmatter for you.
- **Click any row** to open the underlying note.
- Project progress: set `progress:` in frontmatter, or leave it off and it's computed from that project's milestones (done ÷ total). "GPTs linked" counts GPT tasks naming that project.
- Past-due open milestones and GPT tasks automatically show as **Overdue**.
- Follows your Obsidian theme (light/dark). The accent color is the Intown Maps red from the dashboard design.

## Install (Windows)

1. Unzip `project-milestone-gpt-tracker.zip`.
2. Copy the `project-milestone-gpt-tracker` folder into your vault's plugins folder:
   `<your vault>\.obsidian\plugins\`
   (so you end up with `.obsidian\plugins\project-milestone-gpt-tracker\main.js`, `manifest.json`, `styles.css`).
3. In Obsidian: **Settings → Community plugins**. If Restricted mode is on, turn it off, then enable **Projects, Milestones & GPT Tasks** in the installed list.
4. Open the dashboard from the ribbon icon (layout/dashboard icon on the left) or the command palette: **Open dashboard**.

## Try it with the samples

Copy the three folders from `sample-notes` (`Projects`, `Milestones`, `GPT Tasks`) into the root of your vault, open the dashboard, and you'll see it populated — including an overdue milestone and a blocked project in the Needs attention list. Delete the samples whenever you're ready.

## Board view

Open it from the dashboard's **Board** button, the command palette (**Open board**), and switch back with its **Dashboard** button.

- Tabs for **Projects**, **Milestones**, and **GPT tasks**; columns are each type's statuses (e.g. Queued → In progress → In review → Done).
- **Drag a card to another column** to change its status — the new status is written to the note's frontmatter.
- Cards show the project (with its icon), owner, due date (overdue in red), and, for projects, a progress bar. Project cards also show the **next action** as a small line, plus a **"Waiting: …"** line when the project is waiting on someone or something.
- Click a card to open its note. The **+** in a column header creates a new item with that column's status already set.

## Editing in place

You rarely need to open a note just to update it:

- **Status chips are menus** — click any status chip in the dashboard tables and pick the new status; it's written to the note's frontmatter.
- **Progress** — click a project's progress cell for a slider. If the project had no explicit `progress:`, the value is marked "(from milestones)" and saving sets an explicit one; the editor also offers "Compute from milestones" to clear it again.
- **Due dates** — click any due-date cell to reschedule or clear it.
- **Next action / Waiting for** — projects have two text columns: `next:` (the next concrete action) and `waiting:` (who or what the project is waiting on). Click either cell to edit or clear it in place; both are written to the note's frontmatter.
- **Completed items** move out of the main tables into a collapsed **Completed** section at the bottom of the dashboard (click to expand).

## Search, filter, export

The toolbar above the tables has a **search box** (matches titles, projects, owners, GPT names, and projects' next-action / waiting-for text across all three tables), a **status filter** (including an Overdue filter), and **Export CSV**, which downloads exactly what's currently visible — Type, Title, Project, Owner, GPT, Status, Progress, Due.

## Warnings and due notices

- A milestone or GPT task whose `project:` doesn't match any project note is flagged in its table (⚠, red) and listed under Needs attention as "Project not found" — so a typo'd project name can't silently disconnect an item.
- Needs attention also lists items **due today** and **past-due projects**.
- Once per Obsidian session, if anything is overdue or due today, a brief notice summarizes the counts on startup.

## Using it

- **Create** items from the dashboard buttons or the command palette. The form asks for title, owner, status, due date, and (for milestones and GPT tasks) the project — picked from your existing project notes. The project form also has optional **Next action** and **Waiting for** fields.
- **Linking**: a milestone or GPT task links to a project when its `project:` frontmatter exactly matches the project's note title.
- **Folders are settings**: Settings → Projects, Milestones & GPT Tasks lets you rename the three folders and the workspace name shown on the dashboard. Subfolders count too — anything inside the folder is picked up.
- Everything is just frontmatter, so Dataview, search, and graph view all work on the same notes.

### Frontmatter reference

Project note (in the Projects folder):

```yaml
code: PRJ-001        # optional
icon: 🚀             # optional; an emoji or a Lucide icon name (rocket, map, bot, target…)
owner: Alex Morgan
status: on-track     # on-track | at-risk | blocked | complete
progress: 80         # optional; otherwise computed from milestones
next: Send the revised mockups   # optional; the next concrete action — shown on the dashboard and board
waiting: Client sign-off          # optional; who or what the project is waiting on
due: 2026-10-23
```

The project icon shows next to the project on the dashboard, in the Needs attention list, and beside the project name in the milestone and GPT task tables. Projects without an `icon:` get a plain folder icon. You don't have to type it: the New project form has an **icon picker** (searchable grid of icons and emojis, plus a custom entry), and on the dashboard you can **click a project's icon** to change it — the choice is written back into the note's frontmatter.

### Iconize integration

If you use the **Iconize** plugin (obsidian-icon-folder) to put icons on files in the file explorer, this plugin reads them too:

- A project note with **no** `icon:` in its frontmatter shows its **Iconize icon** on the dashboard instead. (Precedence: the note's own `icon:` wins, then Iconize, then the default folder icon.) So you can set project icons by right-clicking the note in the explorer → Change icon, the way you already do for folders.
- The icon picker gains a **"From Iconize"** section listing the icons you've already used in Iconize across the vault, so you can reuse them for projects.
- Choosing an icon in this plugin's picker writes `icon:` frontmatter as usual; it doesn't change Iconize's own data. If a project shows an Iconize icon and you pick "No icon" here, the Iconize icon still applies — remove it in the file explorer if you want the default.
- Iconize's Lucide and Font Awesome identifiers (like `LiBookOpen`) are converted to the names Obsidian renders; emojis pass through as-is. Custom SVG icons from Iconize packs can't be rendered by the dashboard and are skipped.
- Turn the whole integration off in Settings → Projects, Milestones & GPT Tasks → "Use Iconize icons."

Milestone note (in the Milestones folder):

```yaml
project: Customer portal redesign   # the project's note title
owner: J. Chen
status: upcoming     # upcoming | in-progress | blocked | done
due: 2026-10-19
```

GPT task note (in the GPT Tasks folder):

```yaml
gpt: Research assistant
project: Customer portal redesign
status: queued       # queued | in-progress | in-review | done
due: 2026-10-24
output: https://…    # optional; a URL shows as a link in the GPT tasks table
```

The **New GPT task** form includes an optional **Output tag** field. It saves the
existing `output:` frontmatter property; plain text appears in the Output column
and URLs appear as links. Leaving it blank omits the property. Edit `output:` in
the task note to change it later, using the existing note-editing workflow.

## Development

This checkout contains reconstructed JavaScript source, not recovered original TypeScript. See [RECONSTRUCTION.md](RECONSTRUCTION.md) for provenance and build details. Run `npm ci`, `npm run build`, `npm run check`, and `npm test`. The deterministic build writes `dist/project-milestone-gpt-tracker/`. No TypeScript type check is claimed.

## Optional Project Momentum

Enable **Settings → Projects, Milestones & GPT Tasks → Enable Project Momentum**
to show project rankings on the dashboard. Disabled by default, including on
existing installations. Disabling immediately removes it from every open dashboard.
The preference persists across restarts.

All projects participate, including completed ones, independently of dashboard
search/status filters. Ranked by progress percentage, highest first, then by number
of completed linked milestones. Equal metrics share a rank; title and file path
provide stable display order. Each title opens its project note.

Progress follows the existing dashboard: explicit `progress:` takes precedence;
otherwise done / total linked milestones; without milestones, complete status gives
100% and other statuses give 0%. Rows label the percentage source and show owner,
status, and completed/total milestones (0/0 when none exist). Updates follow note
changes. Rankings never write to notes or award points for activity.


### Table sorting
Click any table column header to sort ascending; click again for descending.
The arrow shows the current direction. Headers also work with keyboard focus
and Enter/Space. Numbers (including progress, counts, ranks and completed
milestone counts) sort numerically, due dates chronologically, and text uses
natural alphabetical order. Empty values stay last in both directions; equal
values retain their original order. Each table keeps its selection while the
dashboard refreshes or filters change, until the view is closed/reloaded.
Project Momentum ranks retain their original meaning when its rows are sorted.


### Project Momentum display limit
The optional Project Momentum section displays the top five projects by default.
Change **Project Momentum display limit** in plugin settings to any positive
whole number. Invalid entries leave the last valid setting unchanged. The limit
is applied after ranking, and fewer available projects are all displayed.
Equal results keep their shared ranks, with the existing title/path tie order;
the limit is a maximum number of rows. Column sorting reorders those displayed
projects. Dashboard filters continue to apply only to the dashboard tables,
not to Project Momentum. Existing installations default to five automatically.


### Installed Iconize packs
The Project icon picker refreshes Iconize's loaded pack catalogue each time it
opens. Search by icon name, prefix (Fab, Far, Ra, Li), or pack name. All matching
icons are available, including icons not yet assigned to any note. Pack-prefixed
identifiers are saved unchanged; existing emoji and Lucide selections still work.
Pack SVG previews are rebuilt using inert geometry and safe attributes only.
Iconize manages its own configured pack path and ZIP loading; PMG does not modify
Iconize settings or pack files. Iconize must be enabled to expose its catalogue.


### Import Asana JSON into Milestones
Use **Import Asana** on the dashboard or the **Import Asana JSON into Milestones**
command. Choose the destination Project (or No Project) and open-task status.
The destination is the configured Milestones folder. Completed tasks become Done.
Choose an Asana JSON file: task arrays, `data` arrays, `tasks` arrays and
`data.tasks` arrays are supported, along with nested `subtasks` arrays (or
`subtasks.data`). Files must be under 10 MB and at most 10,000 tasks.
Review each task's title, ID, owner, date and description. Initially every
eligible task is pending. Approve/deny individually or use the bulk controls,
then click **Confirm import** to write only approved tasks. Cancel before
confirmation makes no changes. Invalid rows are shown with reasons and cannot
be approved. Files without tasks, invalid JSON, unsafe numeric IDs and invalid
dates are reported; IDs should be strings in the export.

Each approved task creates a new milestone note with `title`, `project`, `owner`,
`status`, `due`, `asana_gid` and `asana_url` where available. The description is
preserved as literal text, including HTML-only descriptions; attachments and
comments are not fetched. `due_at` uses its exported calendar date, without
converting time zones. Stable Asana IDs prevent reimports: existing notes are
skipped, never overwritten, including local edits. Identical IDs within a file
are eligible only once. Failures are reported per row; retries skip successes.
The same Asana ID is skipped even when selecting another Project. Filename
conflicts are reported rather than overwriting any note. No vault notes or
settings change while choosing a file or reviewing tasks.

Task fields follow [Asana's task reference](https://developers.asana.com/reference/tasks).
