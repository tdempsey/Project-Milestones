# Projects, Milestones & GPT Tasks

A dashboard for your vault that tracks **projects**, **milestones**, and **GPT tasks** — the Obsidian-native version of the Workroom dashboard. All data lives in plain Markdown notes with frontmatter, in three folders. No database, no lock-in: edit a note's frontmatter and the dashboard updates itself.

## What you get

- A **dashboard view**: stat cards (projects, milestones, GPT tasks, needs-attention), a "Needs attention" list (blocked, at-risk, overdue), and three tables with status chips and progress bars.
- **Create commands** and buttons: New project / New milestone / New GPT task — a small form writes the note with the right frontmatter for you.
- **Click any row** to open the underlying note.
- Project progress: set `progress:` in frontmatter, or leave it off and it's computed from that project's milestones (done ÷ total). "GPTs linked" counts GPT tasks naming that project.
- Past-due open milestones and GPT tasks automatically show as **Overdue**.
- Follows your Obsidian theme (light/dark). The accent color is the Intown Maps red from the dashboard design.

## Installation and platform compatibility

The plugin is packaged for **Obsidian**, not as a standalone application. The current manifest (version 1.7.0) sets `isDesktopOnly: false`, allowing Obsidian to load it on desktop and mobile. That declaration is **not a guarantee that every feature has been tested on every device**.

| Platform | Installation route | Notes |
| --- | --- | --- |
| Windows | Copy the built plugin into your vault | See Windows below. |
| macOS | Copy the built plugin into your vault | Show hidden files to find `.obsidian`. |
| Linux | Copy the built plugin into your vault | Use the vault location accessible to your Obsidian installation. |
| Android phones and tablets | Sync the installed plugin, or copy it with a file manager | File access depends on where the vault is stored. |
| iPhone and iPad | Sync the installed plugin from a desktop vault | Direct access to hidden configuration folders is limited. |
| ChromeOS | Use an available Android or Linux installation of Obsidian | Follow that application's instructions; no browser-only plugin installation. |
| Web browsers / Obsidian Publish | Not supported as a plugin runtime | Publishing Markdown does not publish this interactive dashboard. |

### Before you install

- Install Obsidian from [the official download page](https://obsidian.md/download), then create or open your vault.
- Back up your vault and its configuration before installing or updating a community plugin. Community plugins run with access to your vault; install only code you trust.
- Obtain the **built plugin files**: `main.js`, `manifest.json`, and `styles.css`. If supplied with `project-milestone-gpt-tracker.zip`, extract it first. A GitHub source-code ZIP is not necessarily an installable plugin: this repository's source must be built if it does not contain `main.js`. See **Development** below.
- Use the same plugin version on devices sharing a vault.
- The paths below assume the default configuration folder, `.obsidian`. If you changed it in Obsidian, use your chosen configuration folder instead.

The final layout is the same on every platform:

```text
YourVault/
└── .obsidian/
    └── plugins/
        └── project-milestone-gpt-tracker/
            ├── main.js
            ├── manifest.json
            └── styles.css
```

Do not put an extra nested `project-milestone-gpt-tracker` folder between the plugin directory and these files.

### Windows

1. Close Obsidian before copying the files.
2. Extract the plugin ZIP and copy the `project-milestone-gpt-tracker` folder into:
   `<your vault>\.obsidian\plugins\`
3. In File Explorer, enable **View → Show → Hidden items** if needed. Create the `plugins` folder if it does not exist.
4. Reopen Obsidian and enable the plugin as described in **Enable and open the plugin** below.

Example: `C:\Users\YourName\Documents\MyVault\.obsidian\plugins\project-milestone-gpt-tracker\`.

### macOS

1. Quit Obsidian.
2. Open your vault folder in Finder. Press **Command + Shift + .** to show hidden files.
3. Copy the extracted `project-milestone-gpt-tracker` folder into:
   `<your vault>/.obsidian/plugins/`
4. Reopen Obsidian and enable the plugin.

Example: `/Users/YourName/Documents/MyVault/.obsidian/plugins/project-milestone-gpt-tracker/`.

### Linux

1. Close Obsidian.
2. Open your vault in your file manager. **Ctrl + H** shows hidden files in many file managers.
3. Copy the extracted `project-milestone-gpt-tracker` folder into:
   `<your vault>/.obsidian/plugins/`
4. Reopen Obsidian and enable the plugin.

Example: `/home/yourname/Documents/MyVault/.obsidian/plugins/project-milestone-gpt-tracker/`. With a sandboxed application package, use a vault folder the application can access; do not copy into the application's installation directory.

### Android

**Option A: sync from a desktop installation**

Install the plugin in the desktop copy of the same vault, then use the **Syncing between devices** instructions below. Wait for the plugin files and notes to finish syncing before restarting Obsidian on Android.

**Option B: manual installation**

1. Close Obsidian and locate the actual vault folder in an Android file manager.
2. Enable the file manager's hidden-files option so `.obsidian` is visible.
3. Extract and copy the plugin folder into `<your vault>/.obsidian/plugins/`.
4. Reopen Obsidian and enable the plugin.

The vault location varies by device and storage setup. If the file manager cannot access the vault or hidden folder, use a supported vault-sync route instead of changing Android security settings.

### iPhone and iPad

The simplest route for this manually installed plugin is to install it on a desktop first, then sync that same vault and its plugin configuration to Obsidian on iOS/iPadOS.

1. Install the plugin in the desktop vault.
2. Connect the mobile copy of the vault to your chosen supported sync service.
3. Ensure the plugin files are included. With **Obsidian Sync**, use **Syncing between devices** below.
4. Let synchronization finish, fully close and reopen Obsidian, then enable the plugin.

If you use iCloud Drive instead, use an Obsidian-compatible iCloud vault and verify that its `.obsidian` configuration and plugin files have reached the device. Do not assume the iOS Files app can expose or edit hidden plugin folders. Avoid running two different sync services on the same vault.

### Enable and open the plugin

On each device:

1. Open **Settings → Community plugins**. Turn off **Restricted mode** only if you trust the plugin.
2. Find **Projects Milestones and GPT Tasks** in the installed list and enable it. Some existing documentation uses the display name **Projects, Milestones & GPT Tasks**; the plugin ID is `project-milestone-gpt-tracker`.
3. Open the command palette, search for this plugin, and choose **Open dashboard**. On desktop you can also use its ribbon icon. On mobile, the command palette avoids relying on a visible desktop-style ribbon.
4. Open the plugin settings to check your Projects, Milestones, and GPT Tasks folders.

See Obsidian's [community-plugin guide](https://obsidian.md/help/community-plugins) for the current settings workflow.

### Syncing between devices

This plugin does not provide its own sync service. Sync the Markdown notes and plugin configuration using your chosen vault-sync method.

With **Obsidian Sync**, enable the **Installed community plugin list** and, if you want enabled/disabled states shared, **Active community plugin list** under the vault configuration sync options. Include community-plugin settings if you want shared plugin preferences. Check these options on the devices involved, allow synchronization to finish, then restart Obsidian. See [Obsidian Sync settings](https://obsidian.md/help/sync/settings).

If you use another sync tool, verify that it includes the hidden configuration folder and the three note folders; many tools exclude hidden folders by default. Different configuration profiles require the plugin to be installed in each profile you use. Keep a separate backup: synchronization is not a backup.

### Mobile considerations

- Use **tap** wherever the guide says **click**. Wide dashboard tables may be easier in landscape orientation or on a tablet.
- Board movement currently uses HTML drag-and-drop events. Touch dragging is **not verified** on Android or iOS/iPadOS. If dragging does not work, change status through a dashboard status chip or edit the note's `status:` property.
- CSV export uses a browser-style Blob download. Saving the file on mobile is **not verified**; if no file is saved, export from desktop.
- Asana import uses the device's file picker. Make the JSON file accessible to that picker; if the import flow fails on mobile, import on desktop and sync the resulting milestone notes.
- Iconize integration requires Iconize to be installed and enabled on that device. Its icon packs and their loading may differ between devices.
- Mobile instructions document installation routes, not a completed device test matrix. Test in a backed-up or disposable vault before relying on mobile import/export or bulk changes.

### Updating and removing the plugin

To update a manual installation, back up the vault, close Obsidian, and replace only `main.js`, `manifest.json`, and `styles.css` with the matching files from the newer build. Preserve the plugin's existing `data.json` settings file if present. Restart Obsidian and check the installed version. Repeat or sync the update on your other devices.

To stop using the plugin, disable it under Community plugins. Uninstalling removes the plugin, not the project, milestone, or GPT task Markdown notes. Back up settings before uninstalling if you may want them later.

### Installation troubleshooting

- **Plugin is missing from the list:** confirm that `main.js` and `manifest.json` are directly inside the correct plugin folder in the correct vault, not a nested source ZIP folder.
- **Plugin will not load:** check that all three files came from the same build and that Obsidian is up to date. The manifest declares a minimum of 1.0.0, but this guide does not certify every feature on that old release.
- **Dashboard is empty:** verify the configured note folders and frontmatter. Optionally try the sample notes in a test vault.
- **Only one device sees the plugin:** check hidden-folder/configuration sync and whether the other device uses a different configuration profile.
- **Mobile drag, export, or file selection fails:** use the desktop fallback above. Record the device, operating system, Obsidian version, plugin version, and steps when reporting a problem.

## Try it with the samples

Copy the three folders from `sample-notes` (`Projects`, `Milestones`, `GPT Tasks`) into the root of your vault, open the dashboard, and you'll see it populated — including an overdue milestone and a blocked project in the Needs attention list. Delete the samples whenever you're ready.

## Board view

Open it from the dashboard's **Board** button, the command palette (**Open board**), and switch back with its **Dashboard** button.

- Tabs for **Projects**, **Milestones**, and **GPT tasks**; columns are each type's statuses (e.g. Queued → In progress → In review → Done).
- **Drag a card to another column** to change its status — the new status is written to the note's frontmatter.
- Cards show the project (with its icon), owner, due date (overdue in red), and, for projects, a progress bar. Project cards also show the **next action** as a small line, plus a **"Waiting: …"** line when the project is waiting on someone or something.
- Click a card to open its note. The **+** in a column header creates a new item with that column's status already set.

## Editing in place

You rarely need to open a note just to update it:

- **Status chips are menus** — click any status chip in the dashboard tables and pick the new status; it's written to the note's frontmatter.
- **Progress** — click a project's progress cell for a slider. If the project had no explicit `progress:`, the value is marked "(from milestones)" and saving sets an explicit one; the editor also offers "Compute from milestones" to clear it again.
- **Due dates** — click any due-date cell to reschedule or clear it.
- **Next action / Waiting for** — projects have two text columns: `next:` (the next concrete action) and `waiting:` (who or what the project is waiting on). Click either cell to edit or clear it in place; both are written to the note's frontmatter.
- **Completed items** move out of the main tables into a collapsed **Completed** section at the bottom of the dashboard (click to expand).

## Search, filter, export

The toolbar above the tables has a **search box** (matches titles, projects, owners, GPT names, and projects' next-action / waiting-for text across all three tables), a **status filter** (including an Overdue filter), and **Export CSV**, which downloads exactly what's currently visible — Type, Title, Project, Owner, GPT, Status, Progress, Due.

## Warnings and due notices

- A milestone or GPT task whose `project:` doesn't match any project note is flagged in its table (⚠, red) and listed under Needs attention as "Project not found" — so a typo'd project name can't silently disconnect an item.
- Needs attention also lists items **due today** and **past-due projects**.
- Once per Obsidian session, if anything is overdue or due today, a brief notice summarizes the counts on startup.

## Using it

- **Create** items from the dashboard buttons or the command palette. The form asks for title, owner, status, due date, and (for milestones and GPT tasks) the project — picked from your existing project notes. The project form also has optional **Next action** and **Waiting for** fields.
- **Linking**: a milestone or GPT task links to a project when its `project:` frontmatter exactly matches the project's note title.
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

The project icon shows next to the project on the dashboard, in the Needs attention list, and beside the project name in the milestone and GPT task tables. Projects without an `icon:` get a plain folder icon. You don't have to type it: the New project form has an **icon picker** (searchable grid of icons and emojis, plus a custom entry), and on the dashboard you can **click a project's icon** to change it — the choice is written back into the note's frontmatter.

### Iconize integration

If you use the **Iconize** plugin (obsidian-icon-folder) to put icons on files in the file explorer, this plugin reads them too:

- A project note with **no** `icon:` in its frontmatter shows its **Iconize icon** on the dashboard instead. (Precedence: the note's own `icon:` wins, then Iconize, then the default folder icon.) So you can set project icons by right-clicking the note in the explorer → Change icon, the way you already do for folders.
- The icon picker gains a **"From Iconize"** section listing the icons you've already used in Iconize across the vault, so you can reuse them for projects.
- Choosing an icon in this plugin's picker writes `icon:` frontmatter as usual; it doesn't change Iconize's own data. If a project shows an Iconize icon and you pick "No icon" here, the Iconize icon still applies — remove it in the file explorer if you want the default.
- Iconize's Lucide and Font Awesome identifiers (like `LiBookOpen`) are converted to the names Obsidian renders; emojis pass through as-is. Custom SVG icons from Iconize packs can't be rendered by the dashboard and are skipped.
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

The **New GPT task** form includes an optional **Output tag** field. It saves the\
existing `output:` frontmatter property; plain text appears in the Output column\
and URLs appear as links. Leaving it blank omits the property. Edit `output:` in\
the task note to change it later, using the existing note-editing workflow.

## Development

This checkout contains reconstructed JavaScript source, not recovered original TypeScript. See [RECONSTRUCTION.md](https://github.com/tdempsey/Project-Milestones/blob/HEAD/RECONSTRUCTION.md) for provenance and build details. Run `npm ci`, `npm run build`, `npm run check`, and `npm test`. The deterministic build writes `dist/project-milestone-gpt-tracker/`. No TypeScript type check is claimed.

## Optional Project Momentum

Enable **Settings → Projects, Milestones & GPT Tasks → Enable Project Momentum**\
to show project rankings on the dashboard. Disabled by default, including on\
existing installations. Disabling immediately removes it from every open dashboard.\
The preference persists across restarts.

All projects participate, including completed ones, independently of dashboard\
search/status filters. Ranked by progress percentage, highest first, then by number\
of completed linked milestones. Equal metrics share a rank; title and file path\
provide stable display order. Each title opens its project note.

Progress follows the existing dashboard: explicit `progress:` takes precedence;\
otherwise done / total linked milestones; without milestones, complete status gives\
100% and other statuses give 0%. Rows label the percentage source and show owner,\
status, and completed/total milestones (0/0 when none exist). Updates follow note\
changes. Rankings never write to notes or award points for activity.

### Table sorting

Click any table column header to sort ascending; click again for descending.\
The arrow shows the current direction. Headers also work with keyboard focus\
and Enter/Space. Numbers (including progress, counts, ranks and completed\
milestone counts) sort numerically, due dates chronologically, and text uses\
natural alphabetical order. Empty values stay last in both directions; equal\
values retain their original order. Each table keeps its selection while the\
dashboard refreshes or filters change, until the view is closed/reloaded.\
Project Momentum ranks retain their original meaning when its rows are sorted.

### Project Momentum display limit

The optional Project Momentum section displays the top five projects by default.\
Change **Project Momentum display limit** in plugin settings to any positive\
whole number. Invalid entries leave the last valid setting unchanged. The limit\
is applied after ranking, and fewer available projects are all displayed.\
Equal results keep their shared ranks, with the existing title/path tie order;\
the limit is a maximum number of rows. Column sorting reorders those displayed\
projects. Dashboard filters continue to apply only to the dashboard tables,\
not to Project Momentum. Existing installations default to five automatically.

### Installed Iconize packs

The Project icon picker refreshes Iconize's loaded pack catalogue each time it\
opens. Search by icon name, prefix (Fab, Far, Ra, Li), or pack name. All matching\
icons are available, including icons not yet assigned to any note. Pack-prefixed\
identifiers are saved unchanged; existing emoji and Lucide selections still work.\
Pack SVG previews are rebuilt using inert geometry and safe attributes only.\
Iconize manages its own configured pack path and ZIP loading; PMG does not modify\
Iconize settings or pack files. Iconize must be enabled to expose its catalogue.

### Import Asana JSON into Milestones

Use **Import Asana** on the dashboard or the **Import Asana JSON into Milestones**\
command. Choose the destination Project (or No Project) and open-task status.\
The destination is the configured Milestones folder. Completed tasks become Done.\
Choose an Asana JSON file: task arrays, `data` arrays, `tasks` arrays and\
`data.tasks` arrays are supported, along with nested `subtasks` arrays (or\
`subtasks.data`). Files must be under 10 MB and at most 10,000 tasks.\
Review each task's title, ID, owner, date and description. Initially every\
eligible task is pending. Approve/deny individually or use the bulk controls,\
then click **Confirm import** to write only approved tasks. Cancel before\
confirmation makes no changes. Invalid rows are shown with reasons and cannot\
be approved. Files without tasks, invalid JSON, unsafe numeric IDs and invalid\
dates are reported; IDs should be strings in the export.

Each approved task creates a new milestone note with `title`, `project`, `owner`,\
`status`, `due`, `asana_gid` and `asana_url` where available. The description is\
preserved as literal text, including HTML-only descriptions; attachments and\
comments are not fetched. `due_at` uses its exported calendar date, without\
converting time zones. Stable Asana IDs prevent reimports: existing notes are\
skipped, never overwritten, including local edits. Identical IDs within a file\
are eligible only once. Failures are reported per row; retries skip successes.\
The same Asana ID is skipped even when selecting another Project. Filename\
conflicts are reported rather than overwriting any note. No vault notes or\
settings change while choosing a file or reviewing tasks.

Task fields follow [Asana's task reference](https://developers.asana.com/reference/tasks).