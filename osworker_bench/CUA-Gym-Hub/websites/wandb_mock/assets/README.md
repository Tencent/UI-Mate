# Xeights & Biases (wandb) — Research Summary

## Application Overview

**Xeights & Biases (W&B)** is the leading AI/ML developer platform for experiment tracking, model visualization, dataset versioning, and collaborative reporting. It enables ML engineers and researchers to log training runs, compare experiments, tune hyperparameters, manage model artifacts, and share findings with teams.

**URL**: https://wandb.ai
**Category**: ML Ops / Developer Tools / Data Science
**Primary Users**: ML engineers, data scientists, research teams

## Key User Personas

1. **ML Engineer** — Trains models, logs metrics, compares runs, tunes hyperparameters, manages model artifacts
2. **Data Scientist** — Explores experiment results, creates reports, shares findings with stakeholders
3. **Team Lead** — Reviews project progress, monitors sweeps, manages team access and projects

## Primary Workflows

1. **View project workspace** — Navigate to a project, see all runs in a table + chart panels
2. **Compare runs** — Select/deselect runs in the sidebar, view overlaid line charts
3. **Inspect a single run** — Click a run to see its overview, charts, system metrics, logs, files, artifacts
4. **Create/manage sweeps** — Configure hyperparameter sweep, view parallel coordinates + importance plots
5. **Browse artifacts** — View artifact versions, metadata, lineage graph
6. **Write reports** — Create collaborative documents with embedded charts and run data
7. **Filter/sort/group runs** — Use the runs table to filter by state, tags, config values, sort by metrics
8. **Customize workspace panels** — Add/remove chart panels, organize into sections, resize

## UI Layout Description

### Global Navigation (Top Bar ~48px)
- W&B logo (top-left, links to home)
- Breadcrumb: `entity / project` with clickable segments
- Global search (Cmd+K) — opens command palette modal
- "Create Team" button (yellow outline)
- Notification bell icon (with badge count)
- User avatar dropdown (Profile, Settings, Subscriptions, Log out)

### Left Sidebar (~48px icon rail)
- Home icon (navigate to entity home / projects list)
- Search icon (magnifying glass)
- Runs icon (table/list icon) — goes to runs tab
- Artifacts icon (box icon)
- Sweeps icon (chart/tune icon)
- Reports icon (document icon)
- The sidebar is a narrow icon rail, not a full-width sidebar

### Project Page — Tabs
The project page is the core of the application. It has these tabs:
- **Overview** — Project metadata, description, activity summary, total runs, compute time
- **Workspace** — The main experiment view: runs sidebar + chart panels
- **Runs** — Full-width runs table with all columns
- **Sweeps** — List of hyperparameter sweeps with status
- **Artifacts** — Artifact types and versions browser
- **Reports** — List of saved reports

### Workspace View (Most Important)
Based on screenshot `000005.jpg`:
- **Left panel (~220px)**: "Runs (N)" header, search input, filter/group/sort toolbar icons, run list showing color dot + run name (creative names like "snowy-oath-3", "electric-wood-2", "sage-glade-1"), pagination "1-3 of 3", eye icon to toggle visibility
- **Main area**: "Search panels" input at top, panel sections (collapsible), each section has a title and grid of charts
- **Chart panels**: Line charts showing metrics over steps (train_loss, train_epoch_acc, train_epoch_loss, val_epoch_loss, val_epoch_acc), each chart has a legend showing run names color-coded, x-axis "Step", y-axis is the metric value
- **Top-right actions**: "Create report" button (blue), filter icon, columns icon, share icon, "..." menu, "+ Add Panel" button
- **Bottom**: "My Workspace" tab, "Updated 8 hours ago"

### Run Detail Page
When clicking a run name, shows:
- **Tabs**: Overview, Charts, System, Logs, Files, Artifacts
- **Overview tab**: Run name (editable), tags, notes, config table (key-value pairs), summary table (final metric values), metadata (git commit, Python version, OS, GPU)
- **Charts tab**: All logged metric charts (same as workspace but filtered to this run)
- **System tab**: GPU utilization, CPU %, memory usage, network I/O, disk usage over time
- **Logs tab**: stdout/stderr scrollable log viewer with timestamps
- **Files tab**: List of saved files (model weights, config.yaml, requirements.txt)
- **Artifacts tab**: Input/output artifacts for this run

### Color Scheme (Dark Theme)
- Background: `#1a1c1f` (dark charcoal)
- Surface/cards: `#24262a` (slightly lighter)
- Sidebar bg: `#1a1c1f`
- Border: `#333539`
- Primary text: `#e0e0e0` (light gray)
- Secondary text: `#999da3` (muted gray)
- Accent/links: `#83b3f7` (blue)
- Success: `#5bb98c` (green)
- Warning: `#e5a444` (amber)
- Error: `#e5534b` (red)
- Chart colors (run palette): `#ff6384` (red), `#36a2eb` (blue), `#4bc0c0` (teal), `#ff9f40` (orange), `#9966ff` (purple), `#ffce56` (yellow), `#c9cbcf` (gray)
- Button primary: `#2b6cb0` → `#3182ce` on hover
- "Create report" button: `#3b82f6` blue

### Typography
- Font family: "Source Sans Pro", -apple-system, system-ui, sans-serif
- Headings: 600 weight
- Body: 400 weight, 14px
- Code/monospace: "Source Code Pro", monospace
- Run names: 13px, medium weight
- Metric values: 13px, tabular-nums

## Feature List

### P0 — Must Have (App Shell)
1. App frame with top nav bar, icon sidebar, main content area
2. Project workspace view with runs sidebar + chart panel grid
3. Runs table with sortable/filterable columns
4. Line chart panels for metrics visualization
5. Run detail page with Overview/Charts/System/Logs tabs
6. Routing between project views
7. State management with runs, projects, metrics data
8. `/go` state inspection endpoint
9. Session isolation

### P1 — Core Interactive Features
1. Run visibility toggle (show/hide in charts)
2. Run color assignment
3. Chart panel zoom, hover tooltips with crosshair
4. Runs table column customization (show/hide columns)
5. Filter runs by state (running, finished, crashed, killed)
6. Sort runs by any metric column
7. Group runs by config value
8. Search across runs, panels
9. Panel section collapse/expand
10. Add/remove chart panels
11. Run tags (add/remove)
12. Run notes (edit)
13. Sweep creation and visualization (parallel coordinates plot)
14. Artifact browser with versions and metadata
15. Report creation with markdown blocks and embedded charts

### P2 — Depth Features
1. Keyboard shortcuts (Cmd+K search, Cmd+J toggle tabs, Cmd+. minimize sidebar)
2. Workspace save/restore
3. Chart axis configuration (log scale, custom x-axis)
4. Smoothing slider for line charts
5. Download chart as image
6. Export runs table to CSV
7. Artifact lineage graph
8. Report collaboration (comments)
9. System metrics charts (GPU, CPU, memory)
10. Log viewer with search/filter

## What to Skip
- Authentication (start pre-logged-in as a default user)
- Real API calls to wandb servers
- Actual ML training or model execution
- File upload to real storage
- WebSocket real-time updates
- Billing/subscription management
