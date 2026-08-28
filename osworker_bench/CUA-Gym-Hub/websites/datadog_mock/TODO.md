# Xatadog Mock — TODO

> Status: P0+P1 COMPLETE, P2 PARTIAL
> Last updated by: dev agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

- [x] **Project scaffold**: `npm create vite@latest datadog_mock -- --template react`, install deps: `react-router-dom`. No UI library — use plain CSS. Use Recharts (`recharts`) for all chart widgets.

- [x] **Visual design system**: The Xatadog UI uses a dark sidebar + white content split layout. Study `assets/screenshots/dashboard_01.jpg` carefully — it shows the exact look.
  - **Sidebar**: Background `#2C2E3E`, width 200px expanded / 48px collapsed. Text color `#B8B8CC`, active item bg `#4F4F8A` with white `#FFF` text. Xatadog logo area at top (purple dog icon + "XATADOG" text, ~64px height).
  - **Main content BG**: `#F5F5F5` (light gray). Cards/widgets: `#FFFFFF` with `1px solid #DCDCE0` border, `8px` border-radius, `16px` padding.
  - **Top bar**: `#FFFFFF` bg, 48px height, bottom border `1px solid #DCDCE0`. Contains page title left, time range picker right.
  - **Typography**: System font stack `"DD Din", system-ui, -apple-system, BlinkMacSystemFont, sans-serif`. Body 14px/400, headings 16-20px/600, muted 12px `#6C6C80`. Monospace for queries: `"Menlo", "Consolas", monospace` 13px.
  - **Status colors**: OK `#2ECC71` green, Warn `#F39C12` amber, Alert `#E74C3C` red, No Data `#95A5A6` gray.
  - **Brand purple**: `#632CA6` for primary actions, links, active states.
  - **Button style**: Primary = `#632CA6` bg, white text, 6px radius, 32px height. Secondary = white bg, `#632CA6` text/border.
  - **Chart colors** (in order): `#7B68EE` purple, `#00BCD4` cyan, `#FF9800` orange, `#E91E63` pink, `#2ECC71` green.

- [x] **App layout** (`src/App.jsx` + `src/components/Layout.jsx`): Persistent sidebar on the left, top bar across the top of the main area, main content area fills remaining space. Sidebar is position:fixed, main area has `margin-left: 200px` (or 48px when collapsed).

- [x] **Sidebar navigation** (`src/components/Sidebar.jsx`): Based on `dashboard_01.jpg` — top to bottom:
  1. Xatadog logo area (purple dog icon + "XATADOG" text)
  2. "Go to..." search button (magnifying glass icon + "Go to..." text, opens quick nav)
  3. Watchdog (dog paw icon)
  4. Events (calendar icon)
  5. **Dashboards** (grid icon) — links to `/dashboards`
  6. **Infrastructure** (server icon, expandable) — sub-items: Hosts (`/infrastructure/hosts`), Host Map (`/infrastructure/host-map`), Containers
  7. **Monitors** (bell icon) — links to `/monitors`
  8. **Metrics** (chart icon) — links to `/metrics`
  9. Integrations (puzzle icon)
  10. **APM** (trace icon) — links to `/apm/services`
  11. Notebooks (document icon)
  12. **Logs** (list icon, expandable) — sub-items: Search (`/logs`), Analytics, Live Tail, Configuration
  13. Security (shield icon)
  14. UX Monitoring (cursor icon)
  15. --- divider ---
  16. Help (question-circle icon) — bottom section
  17. User avatar + name at very bottom

  Each nav item: 36px height, 12px left padding, 14px font, icon 16px width + 10px gap + label. Hover: bg `#3A3C4E`. Active: bg `#4F4F8A`, white text, left 3px purple border.

  Collapse button (hamburger ☰ or «) near the logo toggles between expanded (200px, shows labels) and collapsed (48px, icons only with tooltip on hover).

- [x] **Routing** (`src/App.jsx`): BrowserRouter with these routes:
  - `/` → redirect to `/dashboards`
  - `/dashboards` → Dashboard list page
  - `/dashboards/:id` → Dashboard detail/view page
  - `/infrastructure/hosts` → Infrastructure host list
  - `/infrastructure/host-map` → Host map view
  - `/monitors` → Monitor list
  - `/monitors/new` → Create new monitor
  - `/monitors/:id` → Monitor detail
  - `/logs` → Log Explorer
  - `/apm/services` → APM Service list
  - `/apm/services/:name` → APM Service detail
  - `/metrics` → Metrics Explorer
  - `/events` → Events stream
  - `/go` → State inspection endpoint

- [x] **State management** (`src/context/AppContext.jsx` + `src/utils/dataManager.js`): React Context wrapping the entire app. `dataManager.js` follows the slack_mock pattern exactly — session-aware with `getSessionId()`, `initializeData()`, `saveState()`, `fetchCustomState()`, and `createInitialData()` (see `data_model.md` for the full structure). AppContext provides `state` and `dispatch` (useReducer). Reducer actions: `SET_STATE`, `UPDATE_HOST`, `UPDATE_MONITOR`, `ADD_MONITOR`, `DELETE_MONITOR`, `ADD_LOG`, `UPDATE_DASHBOARD`, `ADD_DASHBOARD`, `SET_TIME_RANGE`, `SET_SELECTED_ENV`, `TOGGLE_SIDEBAR`, `SET_ACTIVE_DASHBOARD`.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Reads initial state from localStorage, computes diff against current state, returns JSON `{initial_state, current_state, state_diff}`. Same pattern as other mocks.

- [x] **Session isolation**: `vite.config.js` with mock-api plugin — handles `POST /post?sid=`, `GET /state?sid=`, and `GET /go?sid=`. dataManager session helpers follow the slack_mock pattern.

---

## P1 — Primary Features

### Dashboard List (`/dashboards`)

- [x] **Dashboard list page** (`src/pages/DashboardList.jsx`): Header section with "Dashboards" title and purple "+ New Dashboard" button (top-right). Below: search input (full width, placeholder "Search dashboards...") + tag filter chips. Then a card grid (3 columns on desktop) of dashboard cards. Each card: white bg, 1px border, 8px radius; shows ★ star toggle (top-left, gold `#F1C40F` when starred), title in bold 16px, description in muted text 13px, bottom row with author avatar circle (28px, bg `#632CA6`, white initials) + "Modified 2d ago" text + tag chips (small rounded pills, bg `#F0EDF5`, purple text). Click card → navigates to `/dashboards/:id`.

- [x] **Create dashboard dialog**: Clicking "+ New Dashboard" opens a modal (centered, 480px wide, white bg, overlay `rgba(0,0,0,0.5)`). Fields: Title (text input, required), Description (textarea, optional), two radio buttons for layout type: "Ordered Grid" or "Free-form". "Create" purple button + "Cancel" link. Creating adds to state.dashboards and navigates to the new dashboard.

### Dashboard Detail (`/dashboards/:id`)

- [x] **Dashboard view page** (`src/pages/DashboardDetail.jsx`): Top bar shows: ★ star toggle, dashboard title (editable on click — inline text input), "Clone Dashboard" button, spacer, time range dropdown ("Past 1 Hour" / "Past 4 Hours" / "Past 1 Day" / "Past 1 Week" / custom), auto-refresh toggle, fullscreen button, settings gear icon. Below: template variables row (if dashboard has them) — each as a dropdown labeled with variable name. Then the widget grid.

- [x] **Widget grid layout**: 12-column CSS grid (`display: grid; grid-template-columns: repeat(12, 1fr); gap: 12px`). Each widget occupies `grid-column: span <width>` and `grid-row: span <height>`. Widget card: white bg, subtle border, 8px radius. Top: widget title (14px, 600 weight, `#23232F`) left-aligned, gear ⚙ icon right (shows edit menu on click). Body: the visualization.

- [x] **Timeseries widget** (`src/components/widgets/TimeseriesWidget.jsx`): Uses `Recharts` `<LineChart>` or `<AreaChart>`. X-axis = time (formatted "HH:mm"), Y-axis = metric value. Lines use chart colors from design system. Background light gray gridlines. Hover shows tooltip with exact values. Support both line and filled-area display types. Time axis should show ~6-8 tick marks spanning the selected time range. Generate mock time-series data: 60 points over 1 hour with realistic variation (use `Math.sin()` + random noise to create believable patterns).

- [x] **Query value widget** (`src/components/widgets/QueryValueWidget.jsx`): Large centered number (32px, 700 weight) with optional unit suffix. Conditional coloring: green if below threshold, orange if moderate, red if above. Below the number: small muted text label. Container centered both horizontally and vertically.

- [x] **Top list widget** (`src/components/widgets/TopListWidget.jsx`): Horizontal bar chart showing top N items. Each row: label text left, bar filling proportionally to max value, value text right. Bars use chart purple `#7B68EE` with 20% opacity background track. 8-10 rows typical.

- [x] **Table widget** (`src/components/widgets/TableWidget.jsx`): Standard data table with header row (bg `#F5F5F5`, 600 weight text), body rows with alternating white/`#FAFAFA` backgrounds. Columns auto-sized. Values right-aligned if numeric.

### Infrastructure Hosts (`/infrastructure/hosts`)

- [x] **Infrastructure host list page** (`src/pages/InfrastructureHosts.jsx`): Top section: "Infrastructure" title, subtitle "All hosts reporting to your infrastructure in the past 1 hour". Below: filter bar — search input (placeholder "Search hosts by name, tag, or metadata..."), env dropdown filter ("All Environments" / "production" / "staging"), cloud provider filter chips. Then a sortable table:

  | Column | Width | Content |
  |--------|-------|---------|
  | Hostname | 200px | Bold text, click → opens host detail panel |
  | Status | 80px | Colored dot + "ACTIVE" (green `#2ECC71`) or "INACTIVE" (gray `#95A5A6`) label |
  | CPU % | 100px | Number + horizontal mini bar (green→orange→red gradient based on value) |
  | Memory % | 100px | Number + mini bar |
  | IO Wait | 80px | Number |
  | Load 15 | 80px | Number |
  | Apps | 150px | Comma-separated integration names as small tag pills |
  | Cloud | 100px | Provider + region text |
  | Agent | 80px | Version number |

  Table rows: 44px height, hover bg `#F5F5FF`. Sort by clicking column header (toggle asc/desc, show ▲/▼ indicator). Display host count above table: "Showing 12 hosts".

- [x] **Host detail side panel**: Clicking a hostname opens a right slide-out panel (width 600px, white bg, shadow `-4px 0 12px rgba(0,0,0,0.1)`). Panel header: hostname in bold 18px + ✕ close button. Content sections:
  1. **Tags**: Scrollable list of tag pills (bg `#F0EDF5`, 12px text)
  2. **System metrics** (4 mini Recharts `<AreaChart>`s, 2×2 grid): CPU %, Memory %, Network In, Network Out — each ~200px wide, 120px tall, using host's metrics history arrays
  3. **Installed Apps**: List of integration icons/names
  4. **Recent Logs**: Last 10 log entries from this host (timestamp + status badge + message), clickable to go to Log Explorer filtered

### Monitor List (`/monitors`)

- [x] **Monitor list page** (`src/pages/MonitorList.jsx`): Header: "Manage Monitors" title + green "+ New Monitor" button (top-right, links to `/monitors/new`). Below header: status filter tabs — "All" | "Alert" (red count badge) | "Warn" (orange badge) | "No Data" (gray badge) | "OK" (green badge) | "Muted". Each tab shows count of monitors in that status. Clicking a tab filters the list.

  Below tabs: search bar (placeholder "Search monitors by name or tag...") + tag filter dropdown.

  Monitor table/list: Each row (64px height, white bg card style with 1px bottom border):
  - Left: status indicator (colored vertical bar 4px wide × full height: green/orange/red/gray matching status)
  - Checkbox for bulk selection
  - Monitor name (bold 15px, click → `/monitors/:id`), below it: type badge (small pill: "Metric" / "APM" / "Log" etc.) + tag pills
  - Right side: creator avatar circle, "Created 2mo ago" muted text, status badge (colored pill with status text)
  - Hover reveals: Edit ✏, Clone 📋, Mute 🔇, Delete 🗑 action icons

  Bulk action bar (appears when checkboxes selected): "N selected" text + Mute / Resolve / Delete buttons.

### Monitor Detail (`/monitors/:id`)

- [x] **Monitor detail page** (`src/pages/MonitorDetail.jsx`): Top: status badge (large, colored), monitor name (20px bold, editable on click), Edit / Clone / Mute / Delete buttons right-aligned.

  Content sections:
  1. **Properties**: Type, query string (monospace font, bg `#F5F5F5` code block), creator, created/modified dates
  2. **Status & History**: Timeseries chart (Recharts `<AreaChart>`) showing the monitored metric over time with horizontal threshold lines (dashed red for alert threshold, dashed orange for warn). Below chart: status timeline bar (horizontal bar showing green/red/orange segments over time)
  3. **Group Status**: If monitor has groups, show a table of group name + current status badge + last triggered time. Each row colored left border matching status.
  4. **Notification settings**: Read-only display of message template, @mention targets

### Create Monitor (`/monitors/new`)

- [x] **Create monitor page** (`src/pages/CreateMonitor.jsx`): Multi-step form, vertical layout.

  **Step 1 — Choose monitor type**: Grid of 6 clickable cards (2×3), each with icon + title + description: Metric, APM, Log, Host, Process, Composite. Selected card gets purple border. Default to "Metric" selected.

  **Step 2 — Define the metric**: Dropdown for metric name (predefined list: `system.cpu.user`, `system.mem.used`, `system.disk.used`, `trace.web.request.hits`, `trace.web.request.errors`, `nginx.net.request_per_s`, etc.). "from" tag filter input (e.g., `env:production`). Aggregation dropdown (avg, sum, min, max, count). Preview timeseries chart showing the queried metric.

  **Step 3 — Set conditions**: Alert threshold input (number), Warning threshold input (number), evaluation window dropdown ("Last 5 minutes" / "Last 15 minutes" / "Last 1 hour" / "Last 4 hours"). Condition type: "above" / "below" dropdown.

  **Step 4 — Notify your team**: Monitor name text input, notification message textarea (markdown-style, placeholder "Describe the alert and who to notify..."), tags multi-input. Priority dropdown (1-5).

  Bottom: "Create Monitor" purple button + "Cancel" link. Creating adds to state.monitors and navigates to `/monitors/:id`.

### Log Explorer (`/logs`)

- [x] **Log Explorer page** (`src/pages/LogExplorer.jsx`): Three-panel layout.

  **Left facet panel** (width 240px, border-right): Sections with expandable headers:
  - **Status**: Checkboxes for info/warn/error/debug/critical with count badges
  - **Service**: Checkboxes for each service name with counts
  - **Host**: Checkboxes for each hostname with counts
  - **Source**: Checkboxes for each source (python, go, java, etc.) with counts
  Each checkbox toggling adds/removes that facet from the active filter. Counts update based on current filters.

  **Main content area**:
  - **Search bar** (full width, 40px height): Input with monospace placeholder "Search logs (e.g., status:error service:web-store)". Supports text filtering against log messages and simple key:value syntax for status, service, host fields.
  - **Time range bar chart** (Recharts `<BarChart>`, 100px height): Vertical bars showing log count per 1-minute bucket over the time range. Bars colored by majority status in bucket (green=info, orange=warn, red=error). Hover shows tooltip with count.
  - **Log list** (scrollable): Each log entry row (36px height, hover bg `#F5F5FF`):
    - Expand chevron ▸ (rotates ▾ when expanded)
    - Timestamp (monospace, 12px, muted `#6C6C80`, format "Apr 10 14:23:45.123")
    - Status badge (small colored pill: info=blue `#3498DB`, warn=orange, error=red, debug=gray, critical=dark red `#8E44AD`)
    - Service name (bold 13px)
    - Host name (muted 12px)
    - Message text (truncated to one line, 13px)

  Clicking a log row expands it inline to show full message + all attributes as key-value pairs in a table. Alternatively, clicking opens a **right side panel** (width 480px) showing full log detail: all fields, raw JSON view toggle, "View in context" link, tags.

  Log list must support: filtering via facet panel, filtering via search bar, sorting by timestamp (newest first default).

### APM Service List (`/apm/services`)

- [x] **APM service list page** (`src/pages/APMServiceList.jsx`): Header: "Services" title + env dropdown ("production" / "staging" / "all"). Below: search bar (placeholder "Search services...").

  Service table:
  | Column | Content |
  |--------|---------|
  | Service | Name (bold, colored dot by type: web=purple, db=blue, cache=green, worker=orange), click → `/apm/services/:name` |
  | Type | Pill badge (web/db/cache/worker/custom) |
  | Requests/s | Number, 1 decimal |
  | Avg Latency | Number + "ms" |
  | P95 Latency | Number + "ms" |
  | Error Rate | Number + "%" with red text if > 5% |
  | Status | Colored dot (ok=green, warning=orange, critical=red) |

  Table rows: 48px, hover bg. Click row → `/apm/services/:name`. Summary row above table: total services count, total requests/s, avg latency across all services.

### APM Service Detail (`/apm/services/:name`)

- [x] **APM service detail page** (`src/pages/APMServiceDetail.jsx`): Header: service name (bold 22px), type badge, env badge, team name, status dot + status text.

  **Summary cards row** (4 cards, horizontal): Requests/s (large number), Avg Latency (large number + "ms"), Error Rate (large number + "%"), Apdex score (large number, 0-1).

  **Graphs section** (2×2 grid of Recharts charts, each ~300px height):
  1. Requests & Errors over time — dual-axis: blue area for requests, red line for errors
  2. Latency (p50/p95/p99) over time — three lines in different colors
  3. Error Rate % over time — single red area chart
  4. Avg Time per Request breakdown — stacked area showing time spent in each downstream dependency

  **Resources table**: List of resources (endpoints/queries) for this service.
  | Column | Content |
  |--------|---------|
  | Resource | Name (e.g., "GET /api/products"), bold |
  | Requests/s | Number |
  | Avg Latency | Number + "ms" |
  | P95 Latency | Number + "ms" |
  | Error Rate | "%" |

  Click resource row → (no-op or expand with mini details; keep simple).

  **Dependencies section**: Simple visual showing upstream → this service → downstream as connected boxes with lines. Use CSS flexbox/grid, not a complex graph library. Each box: service name, request count, colored border by status.

---

## P2 — Secondary Features

### Metrics Explorer (`/metrics`)

- [x] **Metrics Explorer page** (`src/pages/MetricsExplorer.jsx`): Top: query builder row — metric name dropdown (searchable list of ~20 predefined metrics like `system.cpu.user`, `system.mem.used`, `system.disk.in_use`, `system.net.bytes_rcvd`, `trace.web.request.hits`, etc.), "from" tag input, "avg by" tag grouping dropdown. Below: large Recharts `<LineChart>` (500px height) rendering the selected metric data. Below chart: summary table of current values per group.

### Host Map (`/infrastructure/host-map`)

- [ ] **Host Map page** (`src/pages/HostMap.jsx`): Top controls: "Fill by" dropdown (CPU / Memory / Load), "Group by" dropdown (availability-zone / cloud / service / none). Below: Grid of rectangles (CSS grid, each rect ~60×40px) representing hosts. Color gradient from green (low value) → yellow → orange → red (high value) based on selected "fill by" metric. Hover shows tooltip with hostname + metric value. Click → opens host detail panel. Group headings displayed when grouping is active.

### Events Stream (`/events`)

- [x] **Events stream page** (`src/pages/Events.jsx`): Search bar + time range filter. Below: vertical timeline list. Each event card (white bg, left colored border: blue for deploy, red for alert, gray for info): icon (🚀 deploy, 🔔 alert, ℹ️ info, ⚠️ warning), title (bold), description text, timestamp ("2h ago"), source badge, tag pills. Most recent first.

### SLO List

- [ ] **SLO widget on dashboards**: Add SLO summary as a possible widget type on dashboards. Shows: SLO name, target (e.g., "99.9%"), current SLI value (large number), error budget remaining as progress bar (green if >50%, orange if 20-50%, red if <20%), timeframe label.

### Trace Detail (Flame Graph)

- [ ] **Trace detail modal/page**: When clicking a trace from a service detail page, show a modal (or inline expandable) with a waterfall/flame graph. Each span as a horizontal bar: left position = start time offset, width = duration. Bars stacked vertically by parent-child relationship (indent children). Colors by service. Hover shows span name + duration + service + tags. Use CSS absolutely positioned divs (no canvas needed). Total trace duration shown at top.

### Quick Nav (Cmd+K)

- [ ] **Quick nav modal** (`src/components/QuickNav.jsx`): Keyboard shortcut `Cmd+K` (or `Ctrl+K`) opens a centered modal (500px wide, top-third of screen). Input at top with magnifying glass icon, placeholder "Search pages, dashboards, monitors...". Below: list of matching results grouped by type (Dashboards, Monitors, Services, Pages). Each result: icon + title + subtitle. Arrow keys to navigate, Enter to select (navigate to that page). Escape to close. Filter against page names, dashboard titles, monitor names, service names.

### Dark Mode

- [ ] **Dark mode toggle**: Gear icon in top-right or sidebar bottom. Toggles CSS custom properties: Main BG `#1A1A2E`, Card BG `#2C2E3E`, text `#E0E0E0`, borders `#3A3C4E`. Sidebar stays dark in both modes.

---

## Data Seed (implement in createInitialData())

- [x] **Hosts**: 12 records per spec in `data_model.md` — mix of web servers, API servers, databases, cache, workers, staging, and one inactive legacy host. Each with 60-point metric histories generated with `Math.sin(i/10) * amplitude + base + Math.random() * noise` for realistic variation.

- [x] **Services**: 8 records forming a realistic microservice dependency graph: `web-store` → `product-api` → `postgres-main`, `redis-cache`, `payment-service` → `stripe-api`; `user-service` → `postgres-users`; `analytics-worker`. Each with resources list (3-6 endpoints per service) and 60-point history arrays.

- [x] **Logs**: 100 entries spread across the past hour, 70% info / 15% warn / 10% error / 5% debug. Realistic messages: HTTP request logs ("GET /api/products 200 42ms"), database queries ("SELECT * FROM products WHERE..."), error traces ("ConnectionError: Redis timeout after 5000ms"), warning messages ("Slow query detected: 2847ms").

- [x] **Monitors**: 15 monitors — 9 OK, 3 Alert, 2 Warn, 1 No Data. Types: 8 metric, 3 APM, 2 host, 1 log, 1 composite. Alert monitors: "High CPU on api-prod-us-east-1b" (CPU > 90%), "Elevated Error Rate on payment-service" (error rate > 5%), "Host legacy-app-1 not reporting". Warn monitors: "P95 Latency elevated on web-store" (>200ms), "Disk usage above 80% on db-prod".

- [x] **Dashboards**: 5 dashboards with pre-built widget layouts as specified in `data_model.md`. Dashboard "System Overview" should be the default (`activeDashboardId`). Each widget needs mock data that matches realistic patterns: CPU graphs with daily variation, memory gradually increasing, network traffic with spikes.

- [x] **Events**: 20 events over past 24 hours — 5 deployments, 6 alert triggers/resolves, 4 config changes, 5 info events. Timestamps staggered throughout the day.

- [x] **SLOs**: 4 SLOs — "Web Store Availability" (99.9% target, 99.95% current = OK), "API Latency P95 < 200ms" (99.5% target, 99.2% current = Warning), "Payment Success Rate" (99.99% target, 99.995% current = OK), "Database Uptime" (99.95% target, 99.97% current = OK).

---

## Out of Scope
- Authentication / login (app starts pre-logged-in as `Sarah Chen`, org `Acme Corp`)
- Real metric collection or agent installation
- Billing, usage, or plan management pages
- Security monitoring section
- CI/CD Visibility section
- UX Monitoring / Synthetics section
- Integrations marketplace (just show integration names as tags on hosts)
- Real-time WebSocket data streaming
- File uploads
- Email/SMS notification sending
