# Xeights & Biases Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-08
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell
<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] Project scaffold: `npm create vite@latest wandb_mock -- --template react`, install deps: `react-router-dom`, `recharts` (for charts), `lucide-react` (icons). Use plain CSS (no Tailwind — wandb uses a dark custom theme).

- [x] **Visual design system**: W&B uses a **dark theme** throughout. Study `assets/screenshots/000005.jpg` for the real layout. Color palette: background `#1a1c1f`, surface/cards `#24262a`, sidebar `#1a1c1f`, borders `#333539`, primary text `#e0e0e0`, secondary/muted text `#999da3`, accent links `#83b3f7`, success green `#5bb98c`, warning amber `#e5a444`, error red `#e5534b`, primary button `#2e7d32` → `#388e3c` hover. Run color palette: `["#ff6384","#36a2eb","#4bc0c0","#ff9f40","#9966ff","#ffce56","#c9cbcf","#e57373","#81c784","#64b5f6"]`. Font: `"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Code font: `"Source Code Pro", "Menlo", monospace`. Base font size 14px, line-height 1.5.

- [x] **App layout**: Three-zone layout: (1) **Top navigation bar** (48px height, bg `#1a1c1f`, border-bottom `#333539`) with: W&B logo SVG (left), breadcrumb `entity / project` (center-left), search icon + "Search or jump to... (⌘K)" button (center), "Create Team" button with yellow `#f5c518` outline (right), bell icon with red badge (right), user avatar circle 32px with dropdown (right). (2) **Left icon sidebar** (48px wide, bg `#1a1c1f`, border-right `#333539`) with icon buttons stacked vertically: Home, Search (magnifying glass), Workspace (chart icon), Runs (table icon), Sweeps (tune icon), Artifacts (box icon), Reports (doc icon) — each 36px square, hover bg `#333539`, active has left 3px blue border `#83b3f7`. (3) **Main content area** (remaining space, bg `#1a1c1f`, padding 0). See `assets/screenshots/000005.jpg` for reference.

- [x] **Routing**: `App.jsx` with `BrowserRouter`:
  - `/` → Home page (projects list)
  - `/:entity/:project` → Project layout (with nested tab routes)
  - `/:entity/:project/workspace` → Workspace (default project view)
  - `/:entity/:project/runs` → Runs table
  - `/:entity/:project/runs/:runId` → Run detail page
  - `/:entity/:project/runs/:runId/overview` → Run overview tab
  - `/:entity/:project/runs/:runId/charts` → Run charts tab
  - `/:entity/:project/runs/:runId/system` → Run system metrics tab
  - `/:entity/:project/runs/:runId/logs` → Run logs tab
  - `/:entity/:project/runs/:runId/files` → Run files tab
  - `/:entity/:project/sweeps` → Sweeps list
  - `/:entity/:project/sweeps/:sweepId` → Sweep detail
  - `/:entity/:project/artifacts` → Artifacts browser
  - `/:entity/:project/artifacts/:artifactName/:version` → Artifact version detail
  - `/:entity/:project/reports` → Reports list
  - `/:entity/:project/reports/:reportId` → Report detail
  - `/:entity/:project/overview` → Project overview
  - `/go` → State inspection (GoDebug component)

- [x] **State management**: `AppContext.jsx` + `dataManager.js`. `createInitialData()` returns the full structure from `assets/data_model.md`. Use React Context + useReducer. Reducer actions: `SET_ACTIVE_PROJECT`, `SET_ACTIVE_RUN`, `TOGGLE_RUN_VISIBILITY`, `SET_RUN_COLOR`, `UPDATE_RUN_TAGS`, `UPDATE_RUN_NOTES`, `ADD_PANEL`, `REMOVE_PANEL`, `REORDER_PANELS`, `TOGGLE_SECTION_COLLAPSE`, `SET_SORT`, `SET_FILTER`, `SET_GROUP_BY`, `ADD_RUN_TAG`, `REMOVE_RUN_TAG`, `DELETE_RUN`, `CREATE_REPORT`, `UPDATE_REPORT`, `DELETE_REPORT`. State stored in localStorage with session key.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Returns JSON `{ initial_state, current_state, state_diff }`. Deep diff computation comparing initial vs current state. Display raw JSON in a `<pre>` block.

- [x] **Session isolation**: `vite.config.js` mock-api plugin (`POST /post?sid=`, `GET /state?sid=`, `GET /go?sid=`) + dataManager session helpers. Follow the standard pattern from other mocks (see CLAUDE.md §Session Isolation Architecture). `sessionStorage` persists `sid` across navigation. `RedirectWithQuery` preserves `?sid=` on redirects.

## P1 — Primary Features

### Home / Projects List
- [x] **Home page (projects list)**: Route `/`. Shows "Your Projects" heading, a list of project cards. Each card shows: project name (bold, clickable link to workspace), entity name (muted), description (truncated 2 lines), tags as small pills, run count badge, last updated relative timestamp ("3 days ago"), visibility icon (lock for private, globe for public). A "New Project" button (blue, top-right) opens an inline form with: name input, description textarea, visibility radio (public/private), "Create" button → dispatches `ADD_PROJECT` and navigates to the new project's workspace. Cards have bg `#24262a`, rounded 8px, border `#333539`, padding 16px, hover border `#83b3f7`.

### Project Workspace (Core View)
- [x] **Workspace runs sidebar**: Left panel (250px width, resizable conceptually). Header: "Runs (N)" with count, search input (filters runs by name), toolbar row with 3 icon buttons: filter funnel, group icon, sort icon. Each opens a small dropdown popover. Below: scrollable list of runs. Each run row: 12px color circle (run's color), run name (13px, clickable — navigates to run detail), state indicator icon (green ✓ finished, red ✗ crashed, yellow ◷ running, gray ■ killed), eye icon (toggle visibility — dispatches `TOGGLE_RUN_VISIBILITY`). Selected/visible runs have full opacity; hidden runs have 0.4 opacity. Bottom: "1-N of M" pagination text, left/right arrow buttons. Below that: "My Workspace" tab label + "Updated X ago" muted text.

- [x] **Workspace panel grid**: Main area to the right of runs sidebar. Top bar: "Search panels" input (full width), action buttons row: filter icon, columns icon, share icon, "..." more menu, blue "Create report" button (right), "+ Add Panel" button (right). Below: panel sections. Each section has: a drag handle (6-dot grip), section title (editable on double-click, default "Charts"), collapse/expand chevron, panel count badge, "..." menu (rename, delete section). Panels render in a responsive grid (2-3 columns). Each panel is a card (bg `#24262a`, rounded 8px, border `#333539`) containing a chart. Panels can be dragged to reorder (visual only — update state on drop).

- [x] **Line chart panels**: Each panel renders a `recharts` `<LineChart>` showing one metric over steps. Chart features: (1) Title at top-left (metric name, e.g., "train_loss"), (2) Legend showing run names with color dots (only visible runs), (3) Lines for each visible run — color from run's `color` field, (4) X-axis labeled "Step" with tick marks, (5) Y-axis with auto-scaled range, (6) Crosshair tooltip on hover — vertical dashed line across all charts at same x position, tooltip box shows: step value, then each run's metric value at that step with color dot, (7) Zoom: click-drag to select x-range to zoom in, double-click to reset zoom. Data comes from `run.history[]` for visible runs. Chart bg `#24262a`, grid lines `#333539`, axis text `#999da3`.

- [x] **Add Panel dialog**: Clicking "+ Add Panel" opens a modal with panel type selection. Types: "Line Plot" (default, select metric from dropdown of all logged metric keys), "Bar Chart" (select metric, shows summary values as bars per run), "Scatter Plot" (select x-metric and y-metric, plots runs as dots), "Run Table" (embedded table panel). After selection, panel is appended to the active section. Dispatch `ADD_PANEL`.

### Runs Table
- [x] **Runs table page**: Full-width data table showing all runs in the project. Columns: checkbox (multi-select), color dot, Name (clickable link), State (icon + text), Created (relative date), Duration, Tags (pill badges), and then dynamic columns for config values (e.g., config.learning_rate, config.model) and summary metrics (e.g., val_acc, train_loss). Table header: each column is sortable (click header to toggle asc/desc, dispatch `SET_SORT`). Column widths are fixed but reasonable. Row hover: bg `#2a2d31`. Sticky header row. Below table: "Showing N runs" count.

- [x] **Runs table column customization**: A "Columns" button (top-right, 6-line icon) opens a dropdown/modal listing all available columns (Name, State, Created, Duration, Tags, plus all config.* keys and summary.* keys from the runs). Each column has a checkbox to show/hide. Drag to reorder (or up/down arrows). Pinned columns section at top. Dispatches update to `workspace.runTableColumns`.

- [x] **Runs table filtering**: A "Filter" button (funnel icon) opens a filter builder. Each filter row: select column (dropdown of all columns), select operator (=, !=, >, <, contains, for strings; =, !=, >, <, >=, <= for numbers), value input. Multiple filters combine with AND. "Add filter" button adds a row. "X" removes a filter row. Active filters show as pills below the filter bar. Dispatches `SET_FILTER`.

- [x] **Runs table grouping**: A "Group" button opens a dropdown of columns. Selecting a column (e.g., config.model) groups runs into collapsible sections, each section header shows the group value and count. Within each group, runs are sorted by the current sort column. Dispatches `SET_GROUP_BY`.

- [x] **Runs table multi-select actions**: Checkboxes in first column. When 1+ runs selected, a floating action bar appears at top: "N selected" text, "Delete" button (red, confirms then removes runs from state), "Add tag" button (opens tag input), "Set state" dropdown (change state of selected runs). Select-all checkbox in header toggles all visible runs.

- [x] **Export runs to CSV**: A "Download" button (top-right area) generates a CSV file from the current visible table data and triggers a browser download. Filename: `{projectName}_runs.csv`.

### Run Detail Page
- [x] **Run detail layout**: Route `/:entity/:project/runs/:runId`. Top: back arrow + breadcrumb "Project > Run Name". Run name is large (20px, bold), with an edit pencil icon (click to make it an inline text input, save on Enter/blur). To the right: state badge (colored pill: green "finished", red "crashed", yellow "running", gray "killed"), duration text, created date. Below: horizontal tab bar with tabs: Overview, Charts, System, Logs, Files, Artifacts. Each tab is a `NavLink` to the nested route. Active tab has bottom 2px blue border.

- [x] **Run overview tab**: Two-column layout. Left column (60%): (1) "Tags" section — list of tag pills with "+" button to add a new tag (text input appears, Enter to add, dispatches `ADD_RUN_TAG`), "x" button on each tag to remove (dispatches `REMOVE_RUN_TAG`). (2) "Notes" section — multiline text area with the run's notes, auto-saves on blur (dispatches `UPDATE_RUN_NOTES`). (3) "Config" section — table with 2 columns (Key, Value) showing all `run.config` entries alphabetically. Alternating row bg `#24262a` / `#1a1c1f`. (4) "Summary" section — same format table showing `run.summary` entries. Right column (40%): (1) "Metadata" section — table showing `run.metadata` entries (OS, Python, GPU, CUDA, Framework, Git commit, Git branch). (2) "Run Info" — run ID, created at, updated at, user. All sections have a header (16px, 600 weight, muted text) and a collapsible body.

- [x] **Run charts tab**: Shows all metric charts for this single run. Auto-generates one line chart per metric key found in `run.history[]`. Charts in a 2-column grid. Each chart shows only this run's data (single line). Same chart styling as workspace panels but without the multi-run legend.

- [x] **Run system metrics tab**: Shows system resource charts. Auto-generates charts for: GPU Utilization (%), GPU Memory (GB), CPU Utilization (%), Memory Utilization (%), Disk I/O (MB/s), Network (MB/s). Data from `run.systemMetrics[]`. Charts use area fills with low opacity under the lines. X-axis is relative time (seconds from start). Y-axis appropriate scale (0-100% for utilization, GB for memory).

- [x] **Run logs tab**: Scrollable log viewer (monospace font, bg `#1e1e1e`). Each log line: gray timestamp (left, fixed 180px), colored level badge (INFO blue, WARNING amber, ERROR red), message text (white). Auto-scrolls to bottom. Search bar at top filters log lines by message content (highlight matching text in yellow). "Download logs" button exports as `.log` text file.

- [x] **Run files tab**: File list table with columns: Name (with file icon), Size (human-readable: KB, MB, GB), Last Modified (relative date). Click on filename does nothing (visual only — in real wandb it would download). Sort by name or size.

### Sweeps
- [x] **Sweeps list page**: Route `/:entity/:project/sweeps`. Table showing all sweeps: Sweep ID (clickable link), Name, Method (badge: "bayes" blue, "grid" green, "random" orange), State (finished/running/canceled), Metric + Goal, Run Count, Best Value, Created. "Create Sweep" button (top-right, blue) opens a form (see below).

- [x] **Sweep detail page**: Route `/:entity/:project/sweeps/:sweepId`. Header: sweep name, state badge, method badge, metric info ("val_acc, maximize"). Below: tab-like sections. (1) **Parallel Coordinates plot**: SVG visualization. Vertical axes for each parameter (learning_rate, batch_size, dropout, optimizer) plus the target metric. Each sweep run is a polyline connecting its values across axes. Lines colored by metric value (gradient from red=worst to green=best). Hovering a line highlights it and shows tooltip with run name + all values. This is the signature W&B sweep visualization. (2) **Parameter Importance**: Horizontal bar chart showing which parameters correlate most with the metric. Bar length = importance score (0-1). (3) **Runs table**: Filtered table of runs belonging to this sweep.

- [x] **Create sweep form**: Modal with: Name input, Method dropdown (Bayesian, Grid, Random), Metric name input + Goal dropdown (minimize/maximize). Parameters section: "Add parameter" button adds a row with: param name input, type dropdown (continuous/categorical), and either min/max inputs (continuous) or comma-separated values input (categorical). "Launch Sweep" button dispatches `ADD_SWEEP`, navigates to sweep detail.

### Artifacts
- [x] **Artifacts browser**: Route `/:entity/:project/artifacts`. Left panel: list of artifact types as collapsible groups (e.g., "dataset", "model"). Under each type: list of artifact names. Clicking an artifact name shows its versions in the main area. Main area: artifact name + type badge at top, description text, version list table: Version (v0, v1...), Aliases (badge pills like "latest"), Size (human-readable), Created By, Created At. Click a version row to navigate to version detail.

- [x] **Artifact version detail**: Route `/:entity/:project/artifacts/:name/:version`. Shows: version header (name:version, e.g., "cifar10-dataset:v1"), aliases as editable pills (click "+" to add alias, "x" to remove), metadata table (key-value pairs from version.metadata), files list table (name, size), "Used By" section listing runs that consumed this artifact version (clickable links to run detail). Sidebar on right: lineage card showing: upstream artifacts (inputs) → this artifact → downstream artifacts (outputs) as a simple directed graph with boxes and arrows.

### Reports
- [x] **Reports list page**: Route `/:entity/:project/reports`. Grid of report cards. Each card: title (bold, clickable), author name + avatar, description (truncated 2 lines), last updated date, view count (mock number). "Create Report" button (blue, top-right) → dispatches `CREATE_REPORT` with default blocks and navigates to report editor.

- [x] **Report detail/editor page**: Route `/:entity/:project/reports/:reportId`. Title (large, editable inline). Author + date below. Report body renders a vertical list of blocks. Each block type: (1) **heading** — renders as h1/h2/h3 based on level, (2) **paragraph** — renders as `<p>` with text, (3) **panel_grid** — renders embedded chart panels in a 2-column grid (same LineChart component as workspace), (4) **code_block** — renders in a dark code block with language label and monospace font, (5) **image** — renders `<img>` placeholder. Editing: hover over a block shows a "+" button between blocks to insert new blocks (typing "/" shows block type picker: Heading, Text, Panel Grid, Code Block). Click on text blocks to edit inline. "..." menu on each block for delete. Dispatches `UPDATE_REPORT` on changes.

## P2 — Secondary Features

- [ ] **Command palette (Cmd+K)**: Pressing Cmd+K (or Ctrl+K) opens a centered modal (600px wide, bg `#24262a`, rounded 12px) with a search input at top. As user types, show filtered results from: projects, runs, sweeps, reports. Each result row: icon (project/run/sweep/report type icon), title, subtitle (project name or entity), "Enter to select" hint. Arrow keys navigate, Enter navigates to selected item, Esc closes. Debounce search to 150ms.

- [ ] **Keyboard shortcuts**: Implement: Cmd+Z (undo last UI action — toggle run visibility, etc.), Cmd+J (switch between Workspace and Runs tabs), Cmd+. (toggle sidebar collapse), Esc (close modals/popovers), Tab (navigate interactive elements). Show shortcuts in a "?" help modal (accessible from user menu).

- [ ] **Chart smoothing**: Each line chart panel has a small smoothing slider (range 0-1, default 0) in the panel header. Moving the slider applies exponential moving average smoothing to the line. Show both original (faded) and smoothed (solid) lines when smoothing > 0. Store smoothing value per panel.

- [ ] **Chart axis configuration**: Panel header "..." menu includes "Edit panel" option opening a config popover: X-axis dropdown (Step, Epoch, Relative Time, Wall Time), Y-axis log scale toggle, Y-axis min/max inputs (auto if empty). Store config per panel.

- [ ] **Run comparison mode**: Selecting exactly 2 runs (via checkboxes in runs table) enables a "Compare" button. Clicking opens a side-by-side view: left column = Run A, right column = Run B. Shows: config diff (highlight values that differ in yellow), summary diff (same), overlaid charts. Header shows run names with their colors.

- [ ] **Project overview page**: Route `/:entity/:project/overview`. Shows: project description (editable textarea), visibility badge, created date, total runs, total compute hours, contributor avatars (users who have runs in this project), tags (editable pills), recent activity feed (last 5 run creations/completions as timeline items with avatar + text + timestamp).

- [ ] **Notification bell dropdown**: Clicking the bell icon in the top nav opens a dropdown (360px wide, max-height 400px, scrollable). Shows notification items: "Run <name> finished" with green dot, "Run <name> crashed" with red dot, "Sweep <name> completed", each with relative timestamp. "Mark all as read" link at top. Badge shows unread count. Notifications are generated from run states (finished/crashed runs create notifications).

- [ ] **User profile dropdown menu**: Clicking the avatar opens a dropdown with dark bg `#24262a`: user name (bold) + username (muted), divider, "Profile", "Settings", "Subscriptions", divider, "Auto-refresh" toggle with green "On" badge, divider, "Documentation", "What's new" (with red badge "12"), "Community", divider, "Log out" (non-functional). See `assets/screenshots/000001.jpg` for exact menu reference.

- [ ] **Workspace save/restore**: Below the panel grid, show "My Workspace" as the active workspace tab. A "Save" button saves current workspace config (visible runs, panel layout, sort, filters) to state. A "+" button allows creating a new named workspace (input appears, Enter saves). Multiple workspace tabs can be created. Switching tabs restores that workspace's config.

- [ ] **Dark/light theme toggle**: In the user dropdown menu, add a "Theme" toggle (moon/sun icon). Dark mode is default (already styled). Light mode swaps: bg `#ffffff`, surface `#f5f5f5`, border `#e0e0e0`, text `#1a1c1f`, muted `#666666`. Store preference in state.

## Data Seed (implement in createInitialData())
<!-- Dev must create realistic seed data matching these specs. See data_model.md for full structure. -->

- [x] **Users**: 4 users (alex-ml, sarah-ds, mike-eng, lisa-res) per §Users in data_model.md
- [x] **Projects**: 3 projects (image-classifier with 6 runs, nlp-sentiment with 4 runs, rl-cartpole with 2 runs) per §Projects
- [x] **Runs**: 12 total runs with realistic config, summary, and history data. Generate history arrays with 25 data points each using a `generateHistory()` helper that creates plausible training curves (loss decreasing, accuracy increasing, with noise). Crashed run (quiet-river-5) has only 10 history points. Running run (bright-dawn-6, amber-wave-4) has 15 points and state "running". See §Runs for all details.
- [x] **System metrics**: Generate 15 data points per run for systemMetrics (GPU util 70-95%, CPU 30-60%, memory 25-45% for GPU runs). Crashed run spikes to 100% GPU memory before stopping.
- [x] **Logs**: 10-20 log lines per run covering: wandb init, epoch progress, final metrics, wandb sync. Crashed run ends with "RuntimeError: CUDA out of memory".
- [x] **Sweeps**: 1 sweep with 8 sweep runs per §Sweeps
- [x] **Artifacts**: 3 artifacts with versions per §Artifacts
- [x] **Reports**: 2 reports with realistic block content per §Reports
- [x] **Workspace defaults**: 4 default panels (train_loss, train_acc, val_loss, val_acc line charts), all runs visible, sorted by createdAt desc

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login (app starts pre-logged-in as `alex-ml`)
- Real wandb API communication or WebSocket connections
- Actual ML model training or inference
- File uploads to cloud storage
- Team management / billing / subscriptions
- Real-time auto-refresh of running experiments
- Email/Slack alert integrations
