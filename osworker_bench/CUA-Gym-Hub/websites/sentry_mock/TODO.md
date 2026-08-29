# Xentry Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

<!-- Without these, the app cannot render. Dev implements these first. -->

- [ ] **Project scaffold**: `npm create vite@latest sentry_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`, `recharts` (for sparklines/charts), `date-fns`

- [ ] **Visual design system**: Study `assets/screenshots/` — replicate Xentry's exact look:
  - Sidebar background: dark purple `#362D59` (deepest), sidebar text muted `#9386A0`, active text white
  - Active nav item: left 3px purple `#6C5FC7` border + lighter bg `#4A3E6B`
  - Main content bg: `#FFFFFF`, subtle gray bg `#FAF9FB` for table header rows
  - Primary accent (buttons, links): `#6C5FC7` (purple)
  - Text primary: `#2B2233`, text secondary: `#80708F`
  - Borders: `#E2DBE8`
  - Error red: `#E03E2F`, warning amber: `#F5B000`, success green: `#2BA185`, info blue: `#3B6ECC`
  - Font: `"Rubik", -apple-system, BlinkMacSystemFont, sans-serif` — import from Google Fonts
  - Monospace (stack traces): `"Source Code Pro", monospace` — import from Google Fonts
  - Body text 14px, small/meta 12px, headings 16-20px semi-bold

- [ ] **App layout** (see `alert-listing-PNFBRZVA.png` for full sidebar visible):
  - Left sidebar: fixed, 220px wide, dark purple `#362D59` bg, full viewport height
  - Sidebar top: organization avatar (purple circle with "EP" initials) + org name "Empower Plant" + chevron dropdown + user avatar
  - Sidebar nav items (icon + label, 14px, 40px row height, 16px left padding): Issues, Projects, Performance, Releases, User Feedback, Alerts, Discover, Dashboards, Monitors, Activity, Stats
  - Sidebar bottom: Settings, Help, What's new, Collapse toggle
  - Divider lines between nav sections (subtle `rgba(255,255,255,0.1)`)
  - Main content area: left margin 220px, max-width none, padding 24px 32px
  - No global top bar — page title + breadcrumbs are in the main content area

- [ ] **Routing**: `App.jsx` with `BrowserRouter`, define routes:
  - `/` → redirect to `/issues/`
  - `/issues/` → IssuesListPage
  - `/issues/:issueId/` → IssueDetailPage
  - `/projects/` → ProjectsListPage
  - `/projects/:projectSlug/` → ProjectDetailPage
  - `/performance/` → PerformancePage
  - `/releases/` → ReleasesPage
  - `/alerts/` → AlertsPage (with `?tab=rules` and `?tab=history`)
  - `/dashboards/` → DashboardsListPage
  - `/dashboards/:dashboardId/` → DashboardDetailPage
  - `/discover/` → DiscoverPage
  - `/user-feedback/` → UserFeedbackPage
  - `/monitors/` → MonitorsPage
  - `/activity/` → ActivityPage
  - `/stats/` → StatsPage
  - `/settings/` → SettingsPage
  - `/go` → Go.jsx (state inspection)

- [ ] **State management**: `AppContext.jsx` + `dataManager.js`
  - `dataManager.js` exports `createInitialData()` per `assets/data_model.md`
  - `AppContext` wraps the app, provides `state` + `dispatch`/`setState` for all data
  - Persist to localStorage under key `sentry_mock_state`
  - Implement deep diff for state_diff calculation

- [ ] **`/go` endpoint**: `src/pages/Go.jsx` + route, returns JSON `{initial_state, current_state, state_diff}` rendered as formatted `<pre>` block

- [ ] **Session isolation**: `vite.config.js` mock-api plugin:
  - `POST /post?sid=<sid>` with `{"action":"set","state":{...}}` — sets both current + initial
  - `POST /post?sid=<sid>` with `{"action":"set_current","state":{...}}` — updates current only
  - `POST /post?sid=<sid>` with `{"action":"reset"}` — resets to initial
  - `GET /go?sid=<sid>` → returns `{initial_state, current_state, state_diff}`
  - Session map stored in memory (Map of sid → {initial, current})

---

## P1 — Primary Features

<!-- Core features a user interacts with in the first 5 minutes. -->

### Issues List Page (`/issues/`)

- [ ] **Page header**: Breadcrumb "Issues" in page title area; right side: "Last Seen" sort dropdown (options: Last Seen, First Seen, Trends, Events, Users) + "Save As" purple outlined button

- [ ] **Filter bar**: Row of dropdowns — "My Projects" multi-select dropdown, "All Envs" dropdown (All Environments, production, staging, development), date range dropdown (1h, 24h, 7d, 14d, 30d, 90d)

- [ ] **Search bar**: Full-width input with search icon, placeholder "Search for events, users, tags, and more", supports filter tokens displayed as pills (e.g., `is:unresolved` shown as a purple-outlined removable chip). Typing filters the issue list client-side by title/subtitle match

- [ ] **Tab bar**: Horizontal tabs below search — "All Unresolved" (default), "For Review", "Regressed", "Escalating", "Archived". Each tab shows count badge. Clicking tab filters issues by `status`/`trend` fields. Active tab has purple bottom border

- [ ] **Issue list table**: Columns (left to right):
  1. Checkbox (for bulk select)
  2. **Issue** (main column, ~40% width): colored error level dot (red=error, yellow=warning, gray=info), issue type bold + subtitle on second line, below that: project badge (colored rectangle with project name in small text), "Unhandled" red badge if `isUnhandled`, short ID muted text
  3. **Last Seen**: relative time (e.g., "17s ago", "22s ago", "42s ago") in muted text
  4. **Age**: relative time since first seen (e.g., "4mo", "2d")
  5. **Trend**: tiny sparkline chart (60px wide × 24px tall) using the `stats14d` array, below it a label: "Ongoing" (blue), "Escalating" (pink/red), "New" (purple)
  6. **Events**: formatted number (e.g., "462k", "8.3k")
  7. **Users**: formatted number
  8. **Priority**: icon — critical (red double-arrow-up), high (orange arrow-up), medium (yellow dash), low (blue arrow-down)
  9. **Assignee**: avatar circle (24px, initials) or empty circle with "+" on hover

- [ ] **Bulk actions bar**: When checkboxes are selected, show action bar above table: "N selected" + Resolve button + Archive button + Merge button + Assign dropdown + "..." more menu. Bar has light purple background

- [ ] **Issue row hover state**: Row gets subtle `#FAF9FB` background on hover; cursor pointer; entire row is clickable → navigates to `/issues/:issueId/`

- [ ] **Sorting**: Clicking sort dropdown re-orders the list. "Last Seen" sorts by `lastSeen` desc, "First Seen" by `firstSeen` desc, "Events" by `count` desc, "Users" by `userCount` desc, "Trends" puts escalating/new first then by count

- [ ] **Empty states**: If a tab has no matching issues, show centered empty state: icon + "No issues match your filters" + suggestion text

### Issue Detail Page (`/issues/:issueId/`)

- [ ] **Breadcrumb header**: "Issues" link > project shortId (e.g., "JAVASCRIPT-SHQH"). Right side: "Events" count + "Users" count displayed as large numbers

- [ ] **Issue title section**: Large text — exception type (e.g., "TypeError") + subtitle message. Below: red dot + culprit path (e.g., `xentry.tasks.process_commit_context`)

- [ ] **Action toolbar**: Row of action buttons:
  - **Resolve** button: green/purple outlined, with dropdown arrow (Immediately, In next release, In current release). Clicking toggles `status` to "resolved"
  - **Archive** button: outlined, clicking sets `status` to "archived"
  - **Bookmark** toggle icon button (star)
  - **Subscribe** toggle icon button (bell)
  - **"..."** more menu (Delete, Merge)
  - Right side: **Priority** dropdown (Critical/High/Medium/Low with colored icons), **Assignee** dropdown (list of team members with avatars)

- [ ] **Event distribution graph**: Bar chart (using recharts BarChart) showing event counts over the selected date range. X-axis: dates, Y-axis: event count. Purple/gray bars. Below chart: "459 events" and "200 users" summary numbers

- [ ] **Event navigation bar**: "Events ~ in this issue" header, then tab buttons: "First" | "Last" | "Recommended" (purple, active) | "All Events". Below: event ID link, timestamp, user email, browser badge, OS badge

- [ ] **Event Highlights section**: Collapsible section with "Event Highlights" header + "Feedback" / "View All" / "Edit" buttons. Two-column key-value grid (see `issue-highlights-PJ7EFVXP.png`): handled, level, release (link), environment, url, transaction, status_code, sentry_region, silo_mode, Trace ID (link), Runtime Name, Runtime Version. Alternating subtle row background `#FAF9FB`

- [ ] **Stack Trace section**: Collapsible "Stack Trace" header. Error type + message at top. Toggle: "Most Relevant" / "Full Stack Trace" + "Most Recent ▾" sort. Each frame:
  - Collapsed: filename + function + line number, "In App" green badge or gray "library" indicator
  - Expanded (click to toggle): syntax-highlighted code block with line numbers, highlighted error line in pink/red bg `#FFF0F0`, 3-5 context lines above/below. Variables/args section expandable below code
  - Frames with `inApp: true` highlighted, library frames collapsed by default
  - "Show N more frames" toggle for long traces

- [ ] **Breadcrumbs section**: Collapsible "Breadcrumbs" header + "Give Feedback" / search / filter buttons. Reverse-chronological list of breadcrumb entries (see `issue-breadcrumbs-B4ZJBMX3.png`). Each entry: category icon (colored circle — red for error, green for navigation, purple for UI click, blue for HTTP, yellow for console), **Category label** bold (e.g., "Exception", "Navigation", "UI Click"), message/data content, right-aligned: level badge + timestamp (relative ms). "View All" button at bottom

- [ ] **Tags section**: Collapsible "Tags" header with "?" tooltip icon. Filter tabs: "All" | "Custom" | "Application" | "Other". Two-column layout of key-value pairs. Each tag: key in muted text, value in dark text. Context menu on "..." click: "View other events with this tag value", "View issues with this tag value"

- [ ] **Right sidebar** (280px wide, separated by border):
  - "Last seen" + relative time + "in release" link
  - "First seen" + relative time + "in release" link
  - Divider
  - "Issue Tracking" header + "Manage" link. Integration icons: Asana, GitHub, Jira (as linked icon buttons)
  - Divider
  - "Activity" section: "Add comment..." text input. Timeline of activities: "Assigned to Keith Ryan" with timestamp, "JIRA ticket created #4234", "First seen" with priority note. Each entry: icon + description + timestamp
  - Divider
  - "People" section: "N participating" with avatar stack, "N viewed" with avatar stack
  - Divider
  - "Similar Issues" link → "View"
  - "Grouping" link → "View"

### Alerts Page (`/alerts/`)

- [ ] **Page header**: "Alerts" title + "Create Alert" purple button (top right)

- [ ] **Tabs**: "Alert Rules" (default) | "History" — horizontal tabs with underline indicator

- [ ] **Alert Rules tab**: Filter bar with "N Active Filters" chip, project filter dropdown, "Search by name" input. Table columns: Alert Rule (name + "Triggered X ago" subtext), Status (colored badge — red "Below 0.2", yellow "Below 99.1", green "Resolved"), Project (badge), Team (avatar circle), Created (date), Actions ("..." menu). Clicking row navigates to alert detail (can be a simple expanded view)

- [ ] **History tab**: Table of alert trigger events: alert name, status change, duration, timestamp. Sorted newest first

- [ ] **Alert status badges**: Red circle = critical, yellow diamond = warning, green checkmark = resolved. Display threshold value next to status

### Projects Page (`/projects/`)

- [ ] **Page header**: "Projects" title
- [ ] **Project cards grid**: 2-3 column grid of project cards. Each card: colored left border (project color), project name (bold), platform icon, team badges, stats row: "X errors today" + "Y% crash-free sessions", mini sparkline of errors last 7 days. Click → `/projects/:slug/`

### Project Detail Page (`/projects/:projectSlug/`)

- [ ] **Metric cards row**: 4 cards across top — Crash Free Sessions (%), Crash Free Users (%), Number of Releases, Apdex Score. Each shows value + sparkline trend
- [ ] **Two time-series graphs**: Selectable metric display (errors, sessions, transactions). Line charts with date axis
- [ ] **Latest Alerts**: 3 most recent triggered alerts (name + status + time)
- [ ] **Latest Releases**: 5 most recent releases (version + date + crash-free %)
- [ ] **Top Issues**: 5 most frequent unhandled issues (title + events count)

### Performance Page (`/performance/`)

- [ ] **Page header**: "Performance" title + project/env/date filters
- [ ] **Summary cards**: TPM (transactions per minute), Failure Rate, Apdex, P75 latency — each as a card with big number + sparkline
- [ ] **Transaction list table**: Columns — Transaction (name), Project (badge), TPM, P50, P75, P95, P99, Failure Rate, Apdex. Sortable by clicking column headers. Rows show data from `transactions` in data model

### Releases Page (`/releases/`)

- [ ] **Page header**: "Releases" title + project/env filters
- [ ] **Release list**: Each release row: version hash (truncated, monospace), date released (relative), project badges, crash-free sessions %, crash-free users %, new issues count. Click → expanded detail or detail page
- [ ] **Release detail view**: Adoption percentage bar, crash-free stats, new issues list, commit count + authors

### Dashboards Page (`/dashboards/`)

- [ ] **Dashboards list** (`/dashboards/`): Grid of dashboard cards with title, last modified, creator. Click → detail
- [ ] **Dashboard detail** (`/dashboards/:id/`): Top bar with project/env/date/release filters + "Edit Dashboard" button. Widget grid (CSS Grid, 12-column layout). Widget types:
  - **Line chart**: recharts LineChart with multiple series, legend below
  - **Bar chart**: recharts BarChart
  - **Area chart**: stacked area
  - **Table**: sortable data table with column headers
  - **Big number**: large formatted number + label + optional comparison to previous period
  Each widget: title bar + chart/content area + subtle border/shadow card style

---

## P2 — Secondary Features

<!-- Depth and realism, implement after P1 is complete. -->

- [ ] **Discover Page** (`/discover/`): Simple query builder with field dropdowns (event.type, project, timestamp, etc.), condition inputs, results table. "Run Query" button. "Save Query" button

- [ ] **User Feedback Page** (`/user-feedback/`): List of feedback entries with user name, email, message preview, associated issue link, timestamp. Click to expand full message

- [ ] **Monitors Page** (`/monitors/`): List of cron job monitors. Each: name, status badge (OK green / ERROR red / MISSED yellow), schedule (e.g., "*/5 * * * *"), last check-in time, next expected. Simple timeline visualization of check-in history

- [ ] **Activity Page** (`/activity/`): Reverse-chronological feed of org-wide activities: issue assignments, status changes, comments, deploys, alert triggers. Each: icon + user avatar + description + relative timestamp

- [ ] **Stats Page** (`/stats/`): Simple charts showing: events received over time (line chart), events by project (pie/bar chart), transaction count over time

- [ ] **Settings Page** (`/settings/`): Left sidebar sub-navigation: General, Teams, Members, Projects, Integrations. General: org name, slug (read-only), timezone dropdown, default role dropdown. Teams: list with member counts. Members: table of users with role, email, date joined. Projects: list of project cards with links to project settings

- [ ] **Issue detail — Suspect Commits**: Section below stack trace showing "Suspect Commits" — commit hash, author avatar + name, commit message, "View Commit" link. (See `suspect-commit-STG3IOHD.png`)

- [ ] **Issue merge**: Select 2+ issues from list → "Merge" action groups them under one issue

- [ ] **Issue status transitions**: When resolving, update `status` to "resolved" and remove from unresolved list; when archiving, move to archived tab; "unresolve" action available on resolved/archived issues

- [ ] **Keyboard shortcuts**: `?` opens shortcut help modal; `j/k` navigate issue list; `r` resolve; `a` archive; `l` assign; `s` toggle star/bookmark

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. -->

- [ ] **Organization**: 1 org "Empower Plant" with slug "empower-plant"
- [ ] **Users**: 5 members (Jane Schmidt as current/logged-in admin, Keith Ryan, Maria Chen, Alex Thompson, Sam Park) — see data_model.md §User
- [ ] **Teams**: 3 teams (Frontend, Backend, Infrastructure) with appropriate member assignments
- [ ] **Projects**: 4 projects (javascript, react-app, flask-api, spring-boot-5) with platform, color, team assignments — see data_model.md §Project
- [ ] **Issues**: 12-15 issues covering: TypeError, ReferenceError, IntegrityError, DatabaseError, RuntimeException, N+1 Query, Slow DB Query, 500 Internal Server Error. Mix of statuses (8 unresolved, 2 resolved, 2 archived, 1 ignored), priorities (2 critical, 3 high, 4 medium, 3 low), trends (4 ongoing, 3 escalating, 2 new, 1 regression). Each with realistic `stats14d` sparkline data, tags map, event/user counts ranging from hundreds to hundreds of thousands
- [ ] **Events**: 2-3 detailed events for each of the first 5 issues; 1 event for remaining issues. Each event has full stack trace (3-8 frames with realistic filenames, functions, line numbers, and code context), 4-8 breadcrumbs, tags, highlights, user info, browser/OS contexts
- [ ] **Alert Rules**: 8 rules — 3 metric (Apdex, error count, CLS), 3 issue (new issue, frequency, regression), 2 resolved. Mix across projects/teams
- [ ] **Releases**: 6 releases over last 30 days, each with version hash, crash-free stats, project associations, new issue counts, author references
- [ ] **Dashboards**: 2 dashboards — "Frontend Overview" (6-8 widgets: line charts, tables, big numbers matching `custom-dash-W3TM22YX.png` layout) and "Backend Health" (4-6 widgets)
- [ ] **Performance Transactions**: 10 transactions — mix of API endpoints, page loads, background tasks. Realistic TPM, latency percentiles, failure rates, Apdex scores

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login (app starts pre-logged-in as `Jane Schmidt` at `Empower Plant`)
- Real SDK integration or event ingestion from actual apps
- WebSocket/real-time event streaming
- Email/SMS/Slack notification delivery
- File upload to real servers (attachments are mock data)
- Session Replay video playback (placeholder only)
- Seer AI debugging agent
- OAuth flows for integrations (GitHub, Jira icons visible but non-functional)
- API key management / DSN generation
- Billing / subscription management
