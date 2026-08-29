# Xmplitude Analytics Mock -- TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Design: `DESIGN.md`
> Reference screenshots: `assets/screenshots/reference/` (botubot_0001-0050, saasui_0001-0006)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest amplitude_mock -- --template react`, install deps: `react-router-dom`, `recharts` (for charts), `lucide-react` (icons). No Tailwind -- use plain CSS matching DESIGN.md tokens.
- [x] **App layout (AppShell)**: Three-zone layout per DESIGN.md Section 4.
  - Top bar: 52px height, white bg, bottom border `#E4E5E8`. Left zone: hamburger (24px icon, toggles sidebar expanded/collapsed), blue "Create" button (`#1E61F0`, white text, 6px radius, 32px height), "Recent" / "Favorites" / "Spaces" dropdown links (14px, dark text, chevron down icon). Center zone: search input ~400px wide with magnifying glass icon, placeholder "Search or ask a question", right-aligned `Cmd+K` badge in gray pill. Right zone: "Invite Members" with people icon and X dismiss button, bell icon, help circle icon, gear icon, "Upgrade" text with sparkle icon in blue.
  - Left sidebar expanded (200px): white bg, border-right `#E4E5E8`. Items: 20px icon + 14px text, padding 8px 12px, border-radius 6px. Active: blue text `#1E61F0`, bg `#E8EEFB`. Hover: bg `#F0F1F3`. Sections: Home, All Content, Live Events, Ask Xmplitude, Product Analytics (expandable chevron, sub-items: Event Segmentation, Funnel Analysis, Retention), Web Analytics (expandable), Users (expandable: User Profiles, Group Profiles, Cohorts, Predictions, Computations, Syncs, User Profile API), Session Replay, Experiment (expandable), Data, Releases. Bottom: "MTUs 4/50k" text + thin progress bar (blue fill) + "Manage Plan" link.
  - Left sidebar collapsed (48px): icon rail only, each icon 20px centered in 48px column, tooltip on hover showing label.
  - Main content area: fills remaining space, padding 24px, bg `#F7F8FA` for home, `#FFFFFF` for chart builder.
- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes:
  - `/` or `/home` -- Home dashboard
  - `/content` -- All Content list
  - `/chart/new` -- New chart builder (defaults to Segmentation tab)
  - `/chart/:id` -- Saved chart builder
  - `/dashboard/:id` -- Dashboard view
  - `/users` -- User Profiles list
  - `/users/:id` -- User Profile detail
  - `/cohorts` -- Cohorts list
  - `/cohorts/new` -- Create cohort
  - `/data/events` -- Data > Events catalog
  - `/notebooks/:id` -- Notebook view
  - `/experiment/:id` -- Experiment setup
  - `/session-replay` -- Session Replay list
  - `/ask` -- Ask Xmplitude AI chat
  - `/live-events` -- Live Events stream
  - `/go` -- State inspection endpoint
- [x] **State management**: React Context (`AppContext.jsx`) + `dataManager.js`. Context provides `{ state, dispatch }`. `dataManager.js` exports `createInitialData()` per `assets/data_model.md`, `loadState()`, `saveState()`. State persisted to localStorage under key `amplitude_mock_state`. Deep-clone initial state for diff tracking.
- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Returns JSON pre-formatted in a `<pre>` tag: `{ initial_state, current_state, state_diff }`. `state_diff` computed by deep comparison of initial vs current, showing only changed/added/removed paths. Must work with session isolation below.
- [x] **Session isolation**: `vite.config.js` mock-api plugin providing:
  - `POST /post?sid=<sid>` with `{"action":"set","state":{...}}` -- sets both initial + current state for session
  - `POST /post?sid=<sid>` with `{"action":"set_current","state":{...}}` -- updates only current state
  - `POST /post?sid=<sid>` with `{"action":"reset"}` -- resets current to initial
  - `GET /go?sid=<sid>` -- returns `{initial_state, current_state, state_diff}`
  - `GET /state?sid=<sid>` -- alias for `/go`
  - Session state stored in-memory on server (Map), falls back to localStorage for default session.
- [x] **"default" project dropdown**: Top of main content shows "default" with chevron dropdown (visible in all screenshots). Non-functional but present for visual fidelity. Located just below the top bar, left-aligned.

---

## P1 -- Primary Features

Core interactive workflows a user performs in the first 5 minutes. These are the key agent training targets.

### Home Dashboard (`/home`)

- [x] **Web Engagement card**: White card with 8px radius, border `#E4E5E8`. Header row: 6-dot drag handle (left, appears on hover), "Web Engagement" dropdown (chevron), info (i) icon, "Open Analysis ->" link (right), three-dot menu (right). Below header: row of 4 metric tabs -- "Visitors (Uniques)", "Page Views (Event Totals)", "Bounce Rate", "Page Views Per Session". Selected tab: blue border `#1E61F0`, bold value. Each tab shows: metric name (12px, gray), value (28px, bold), delta with colored arrow (green `#00875A` for increase, red `#DE350B` for decrease). Clicking a tab updates the line chart below to show that metric's time-series data (from `homeMetrics` in state). Line chart: 30 data points, x-axis dates, y-axis values, blue series line `#1E61F0`, gray gridlines at 25% opacity, tooltip on hover showing "Overall / [Date] / [N] unique users" with action links (Add Annotation, Create Release, Show User Journeys, View User Streams, Watch Session Replay [NEW badge], Create Cohort, Download Users). See botubot_0005 for exact tooltip layout.
- [x] **Current live users card**: Right of Web Engagement. Shows "Current live users" title with blue dot and info icon. Semi-circular gauge (light blue arc, blue dot indicator at value position). Large number centered below gauge. Below: "New Users" count with horizontal blue bar, "Avg session duration" with horizontal blue bar. Data from `homeMetrics.currentLiveUsers`. See botubot_0005.
- [x] **Templates carousel**: Below main cards. "Templates" heading with info icon and "See All" link + three-dot menu. Horizontal scrollable row of template cards (white bg, border, ~200px wide): template name (16px semibold), "Dashboard . N Charts" subtitle, decorative icon/illustration on right side. Right arrow button for scrolling. Cards: User Activity (9 Charts), Marketing Analytics (14 Charts), Session Engagement (6 Charts), Product KPIs (8 Charts), Media (5 Charts). Clicking a template card is non-functional (display only). See botubot_0005, 0012.
- [x] **Top Pages card**: White card, "Top Pages" heading with info icon, "Last 30 Days" subtitle. Table with columns: "Page Title" (blue link text), "Volume" (number). 5 rows from `homeMetrics.topPages`. Page title links navigate to chart builder filtered by that page. See botubot_0012.
- [x] **Breakdown by country card**: White card, "Breakdown of users by country" heading with info icon, "Last 30 Days" subtitle. Table with columns: "Country" (flag emoji + country name, blue link), "Users" (number). Data from `homeMetrics.usersByCountry`. See botubot_0012.
- [x] **Realtime users by location card**: White card, "Realtime users by location" heading with blue dot + info icon, "Realtime" subtitle. Placeholder world map in light blue/gray with zoom +/- buttons. No actual map library needed -- use a simple SVG world outline or a static placeholder image with dot markers. See botubot_0012.
- [x] **Session Replays card**: Below the three cards. "Session Replays" heading, "Last 7 Days" subtitle. Placeholder content with "Did you know? Session Replay is FREE on your plan" banner (dismissible with X). See botubot_0012.
- [x] **Funnel promo card**: "Measure your first funnel in Xmplitude" heading with info icon, "Last 90 Days" subtitle, "Funnel Analysis" link. Shows a mini funnel bar chart (2 bars, 100% and ~25%). Clicking "Funnel Analysis" navigates to `/chart/new?type=funnel`. See botubot_0012.
- [ ] **"Resources" dropdown**: Top-right of home page content area. "Resources" with globe icon and chevron. Non-functional dropdown placeholder.

### Chart Builder (`/chart/new`, `/chart/:id`)

- [x] **Chart type tabs**: Row of icon+text tabs at top of left panel. Tabs: Segmentation (line chart icon, active by default), Funnel (funnel icon), Data Table (grid icon), Retention (curved arrow icon), Journeys (flow icon), three-dot "More" menu. Active tab: blue text `#1E61F0`, 2px blue underline. Inactive: gray text `#6B6F76`. Clicking a tab switches the entire left panel config and right panel chart. See botubot_0010, 0030.
- [x] **Top action bar**: Right side of chart builder top. "More" dropdown, "Add to (N)" button (outline style), "Save"/"Saved" button (blue outline when saved, gray when draft), "Share" button (blue bg `#1E61F0`, white text, link icon). For new/draft charts: "DRAFT" badge (blue pill) before chart title. "Delete" button (outline) for saved charts. See botubot_0030.
- [x] **Chart title**: Editable. Inline text "Page views" or custom name. Click to edit -- turns into text input. Below: "What question does this chart answer? Enter a description here." placeholder text (gray, italic, editable). For saved charts: "Owned by Sam Lee" and "1 Dashboard . 0 Notebooks" on far right. See botubot_0030.
- [x] **Segmentation -- Events section** (left panel): Collapsible section header "Events" with chevron + "Explorer" link on right. Each event row: letter badge (A/B/C in gray circle), colored event icon (blue circle with globe for "Page Viewed"), event name text, three-dot menu. Below each event: "+ Filter by" and "+ Group-by" links in gray. "+ Add Event" blue link at bottom opens event picker dropdown. See botubot_0010, 0030.
- [x] **Event picker dropdown**: Large popover (~500px wide) with search input at top. Grouped sections: "Frequently used events" (with count, collapsible), "Xmplitude" (5 events with count). Events listed with blue circle icon + name. Right side preview panel: "DEFAULT EVENTS" header, event name (large), description text. Events in dropdown: Any Active Event, Any Event, New User, Page Viewed, Start Session (from eventDefinitions in state). Selecting an event adds it to the Events section and regenerates chart data. See botubot_0050.
- [x] **Segmentation -- Measured As section** (left panel): Collapsible "Measured as" header with info icon + "Advanced" dropdown link. 2x3 grid of pill-style toggle buttons: Uniques, Event Totals, Active %, Average, Frequency, Properties (with chevron). Selected pill: blue border `#1E61F0`, blue text. Unselected: gray border `#E4E5E8`, dark text. Below pills: "Set buckets" dropdown (shown when Frequency selected). "Formula" link with sparkle icon. Changing measured-as updates chart data (switch between pre-computed mock data variants). See botubot_0010, 0030.
- [x] **Segmentation -- Segment By section** (left panel): Collapsible "Segment by" header. "Any" dropdown, "Users" dropdown, info icon, "Saved" dropdown on header row. Each segment row: 6-dot drag handle, number badge (1, 2...), segment name "All Users", X remove button, three-dot menu. Below each segment: "+ Filter by", "+ In Cohort", "+ Performed" links. "+ Add Segment" blue link. See botubot_0030.
- [x] **Segmentation -- Group Segment By** (left panel): "Group Segment by" heading. "+ Select User Property" blue link. Clicking opens a property picker dropdown (non-functional placeholder or shows user properties like Country, Platform, Device Type). See botubot_0030.
- [x] **Chart toolbar** (right panel, above chart): Left side: "Anomaly + Forecast" outline button with sparkle icon, "Compare" dropdown. "Data from N min ago" text + refresh icon. Right side: chart visualization dropdown (Line chart / Bar chart / Stacked bar / Pie chart with icon preview), "Daily" / "Weekly" / "Monthly" interval dropdown, time range pills: 7d, 30d (selected: blue border), 60d, 90d, calendar icon for custom range. See botubot_0010, 0030.
- [x] **Metric summary** (right panel, above chart): "Current [MeasuredAs]" dropdown. Large metric number (28px bold), delta percentage with green/red arrow, "yesterday from [start date]" text, trend description text ("Current uniques are trending upwards by >1000% since Nov 16."). See botubot_0030.
- [x] **Line chart rendering** (right panel): Use recharts `<LineChart>` with `<Line>`, `<XAxis>` (date labels), `<YAxis>` (numeric), `<CartesianGrid>` (gray, dashed, 25% opacity), `<Tooltip>` (white card with date + value). Blue series line `#1E61F0`, dotted portion for forecast/anomaly region. Legend row below chart: colored dot + "All Users" label. Left/right arrow buttons for horizontal scrolling if data exceeds viewport. Data from chart.data.series. See botubot_0030.
- [x] **Pie chart rendering**: Use recharts `<PieChart>` when visualization is "Pie chart". Colored slices with labels showing "N times / NN.N%" with leader lines. Legend below: colored dots + labels. See botubot_0010.
- [x] **Bar chart rendering**: Use recharts `<BarChart>` for bar visualization. Solid blue bars for main data, hatched/striped bars for comparison data. Percentage labels on bars for funnel view. See botubot_0035 (notebook dashboard card shows funnel bars).
- [x] **Breakdown table** (right panel, below chart): "Breakdown by:" label + "Top N (Default)" dropdown + info icon + search input. "Export CSV" button with download icon on far right + info icon. Table: checkbox column, colored dot, "Segment" or "Times Performed" column (sortable with chevrons), date columns (sortable), "Row Average" dropdown column. Rows show numeric values. Checkboxes toggle series visibility in chart. Data from chart.data.breakdownTable. See botubot_0010, 0030.
- [x] **Funnel tab**: When "Funnel" tab is active, left panel shows ordered funnel steps instead of events. Each step: number badge (1, 2, 3), colored event icon, event name, three-dot menu. "+ Add Step" link. Right panel: funnel bar chart showing conversion bars (solid blue for converted, hatched for dropped-off), percentage labels above each bar (e.g. "100% / 4" then "25.0% / 1"), step names below x-axis. Overall conversion rate and median time displayed. Legend: "All Users" with blue dot. Data from FunnelChart entity in data_model.md. See botubot_0035 (notebook card shows funnel bars).
- [x] **Retention tab**: When "Retention" tab is active, left panel shows start event and return event selectors. Right panel: retention curve line chart (percentage y-axis 0%-100%, Day 0 through Day 30 x-axis), steep initial drop then flattening. Below chart: retention grid table (cohort rows x day columns) with percentage values, color-coded cells (darker = higher retention). Data from RetentionChart entity. See botubot_0042 (Ask Xmplitude shows retention chart format).
- [x] **Data Table tab**: When "Data Table" tab is active, shows tabular view with event/segment rows and date columns. Column headers have sort arrows and three-dot menus. Inline mini bar charts in cells for visual comparison. See DESIGN.md Section 5.
- [x] **Chart visualization switching**: Changing the visualization dropdown (Line/Bar/Pie etc.) re-renders the same data in the selected chart type. State change recorded: `chart.config.chartVisualization`.
- [x] **Time range switching**: Clicking 7d/30d/60d/90d pills or changing interval (Daily/Weekly/Monthly) updates chart data display. For mock, show the same data but adjust x-axis labels and displayed date range. State change recorded: `chart.config.timeRange`, `chart.config.interval`.
- [x] **Save chart**: Clicking "Save" on a draft chart: changes status from "draft" to "saved", updates button to "Saved" (checkmark icon), assigns to currentUser's space. Persists to state.charts array. Clicking "Save" on already-saved chart updates `updatedAt` timestamp.
- [ ] **Notebook panel**: Right-side slide-in panel (280px wide) triggered by adding chart to notebook. "Untitled Notebook" dropdown at top, "Add chart to notebook" blue button. "Keep track of your analysis" text + preview thumbnail. See botubot_0018.
- [x] **Share modal**: Clicking "Share" opens modal with 3 tabs: "Share", "Embed", "View History". View History tab shows table with columns: NAME (avatar + name + email), LAST VIEWED (relative time like "37 seconds ago"). "Done" button. See botubot_0048.

### User Profiles (`/users`)

- [x] **User Profiles page**: Title "User Profiles" (24px semibold), subtitle "A list of all your users. You can search for and dive into their specific properties and event paths." Search bar with placeholder "Search user or device ID's", "Cancel" and "Save as Cohort" buttons adjacent. Below: cohort query builder: "The Users who" -> "...did perform [Select event...]" dropdown -> "with count >= 1 time" -> "any time during [Last 30 days]" calendar link. "...then" and "...or" links. "+ Add" link. User count display: "N Users" with gear icon dropdown. Table with columns: User ID (three-dot menu on header), Xmplitude ID, First Seen, Last Seen, Watch Session, Country, Platform. Each column header has a three-dot menu for column options. Rows populated from state.users. Clicking a User ID row navigates to `/users/:id`. See botubot_0025.

### User Profile Detail (`/users/:id`)

- [x] **User profile detail page**: Three-panel layout. Left panel (~250px): user avatar (large circle with initials), display name, pinned properties section (expandable cards showing key-value pairs from user.properties), search input to filter properties. Center panel: "Activity" tab active by default (tabs: Activity, Insights, Session Replays, Cohorts, Experiments, Flags). Event stream: grouped by date ("Today", "Yesterday", etc.), each event shows: play icon, timestamp, event name, brief properties. Events listed in reverse chronological order from state.events filtered by userId. Right panel (~300px): Event detail panel, appears when an event row is clicked. Shows "Info" and "Raw" tabs. Info tab: list of property key-value pairs from the event.properties. Raw tab: JSON formatted view.

### All Content (`/content`)

- [x] **All Content page**: Title "All Content". Search bar + filter controls. Table with columns: checkbox, Name (icon + name, blue link), Type (Chart/Dashboard/Notebook/Cohort badge), Owner (avatar + name), Last Modified (relative date), Space. Rows populated from all charts + dashboards + notebooks + cohorts in state. Click name to navigate to the item. Type column shows colored icon badge (chart: line icon, dashboard: grid icon, notebook: document icon, cohort: people icon). Sort by clicking column headers.

### Dashboard View (`/dashboard/:id`)

- [x] **Dashboard page**: Title editing (click to rename), space breadcrumb ("Sam Lee's Space" with chevron), owner info. Top-right: "More" dropdown, "Copy as dashboard" button, "Chart View" button, "Share" button (blue). Grid of chart cards in 2-column layout. Each card: white bg, 8px radius, border `#E4E5E8`. Card header: chart title (16px semibold), "Daily, Last 30 Days" subtitle. Card body: mini chart (line, bar, or funnel) rendered with recharts at reduced size. 6-dot drag handle top-left on card hover. Trash icon top-right on hover. "+ Add Content" button at bottom to add existing charts. Data from state.dashboards[id].chartIds mapped to state.charts. See botubot_0035 for notebook/dashboard card layout.

### Data Events (`/data/events`)

- [x] **Data section layout**: Left sidebar within content area (200px): "Data" heading, project dropdown ("default"), branch dropdown ("main" with git icon). Navigation: Home, Activity, Assistant, Visual Labeling (with "New" green badge), Events (active: blue text, blue left border), Properties, Filters, Connections Overview, Sources, Destinations, Catalog. Bottom: "Pricing", "Settings" links.
- [x] **Events page**: "Events" heading with info icon. Three tabs: "Events", "Custom Events", "Labeled Events" -- active tab has blue underline. Search input below tabs. Table: checkbox column, "NAME" column (colored circle icon + event name as blue link), "CREATED" column (date). Clicking an event name opens the event detail panel on the right side (~400px). See botubot_0040.
- [x] **Event detail panel**: Slide-in right panel. Header: colored event icon + event name (large text), "Create Chart" button (top-right). Two tabs: "DETAILS" (active, blue underline), "USED BY". Details tab: Description (editable placeholder "Add a description"), Created ("December 18, 2024 by samlee@example.com"), Occurrences (mini sparkline chart + "Seen N times in the last 30 days" + "Repair" link). Definition section: "When this [element is clicked]" rule display. Sub-rules: Element Hierarchy (# input), Element Text (= input), Page URL (= input). "Replace" and "Update" buttons at bottom. See botubot_0040.

### Cohorts (`/cohorts`)

- [x] **Cohorts page**: Title "Cohorts". Table listing all cohorts from state.cohorts. Columns: Name (blue link), Description, Owner, User Count, Last Computed (relative date). "+ Create Cohort" button navigates to `/cohorts/new`.
- [x] **Create Cohort page** (`/cohorts/new`): Same behavioral query builder as User Profiles but with "Save as Cohort" prominent action. Name input field at top. Query builder: "The Users who ...did perform [Select event] with count >= N time during [Last 30 days]". Logical combinators "...then" and "...or". Save button creates new cohort entity in state.cohorts.

---

## P2 -- Secondary Features

Depth and realism. Implement after P1 is solid.

### Notebooks (`/notebooks/:id`)

- [x] **Notebook view**: Title (editable, e.g. "SLMobbin Notes"), owner info ("Owned by Sam Lee . 0 views"), "Last edited N seconds ago". Top-right: "More" dropdown, "Copy as dashboard" button (grid icon), "Chart View" button (arrow icon), "Share" button (blue). Content area: vertical stack of blocks. Each block: 6-dot drag handle (left, on hover), chart card or text block, trash icon (right, on hover). Chart blocks show embedded mini charts. No text editing needed -- just display. See botubot_0035.

### Ask Xmplitude (`/ask`)

- [x] **AI Chat interface**: Left sidebar panel (250px): "Ask Xmplitude" heading, "New thread" button (+ icon), thread history links (blue text, truncated). "default" project label at top. Top-right: "FAQ" link, "Send feedback" link, "Link" link. Main area: chat thread. User messages: right-aligned blue pill. Assistant messages: left-aligned, can contain embedded chart cards (white card with title, recharts chart, and "Open Chart" link). Below assistant message: natural language query description in pill tokens (e.g. "Measuring [retention] of users that perform [New User] and [return on or after] the N-th day to perform [Any Active Event] for [All Users] [daily] over the [Last 30 days]"). "FOLLOW UPS" section: 3 suggestion cards with icons and text. Text input at bottom: "Ask follow-up" placeholder, send arrow button, disclaimer text. See botubot_0042.

### Session Replay (`/session-replay`)

- [x] **Session Replay list**: Title "Session Replays" with info icon, subtitle "Unlock qualitative insights by finding the most relevant session replays to watch". Time filter pills: 1d, 7d (selected), 30d, calendar icon. "+ Add Filter" dropdown. "Manage" dropdown (top-right, gear icon). Table: columns: Time, User ID (info icon), Session Length, Country (flag + name). Rows with play icon, timestamp, duration, country flag. See botubot_0038.

### Live Events (`/live-events`)

- [x] **Live Events stream**: Title "Live Events". Simulated real-time event stream. Table that auto-appends rows every 2-5 seconds (using setInterval with mock event data). Columns: Timestamp, Event Name, User ID, Platform. Pause/Resume toggle button. Max 100 rows displayed (older rows removed from top).

### Experiment (`/experiment/:id`)

- [ ] **Experiment setup wizard**: Left sidebar navigation: "Experiment Setup" heading, "A/B Test, Web" subtitle. Steps: Site Setup, Variants (active: blue text, blue left border indicator), Goals, Pages, Targeting, Advanced (Optional). Bottom: "Save All & Close" button. Center content changes per step. Variants step: "Variants (2)" heading, description text, "Open Visual Editor" button (outline). Variant A: green "A" badge, "control" name, "Control" tag, gear icon. Variant B: green "B" badge, "treatment" name, "Setup your variant" blue link, gear icon. "+ Add a Variant" blue link. "Next: Goals" blue button at bottom. Right side (partially visible): summary panel showing Rollout 0%, variant legend (A control, B treatment), Variants (2) table with warning banner. See botubot_0007, 0020.

### Search / Cmd+K Overlay

- [x] **Global search overlay**: Triggered by clicking search bar or pressing Cmd+K. Full-width overlay with search input. Results grouped by type: Charts, Dashboards, Cohorts, Events. Each result: type icon + name + owner. Clicking a result navigates to that item. Close with Escape or clicking outside.

### Create Menu

- [x] **Create button dropdown**: Clicking blue "Create" button opens dropdown with options: Chart (with sub-options: Segmentation, Funnel, Retention, Data Table), Dashboard, Notebook, Cohort, Experiment. Each with icon. Clicking navigates to the appropriate creation route.

### Sidebar Toggle

- [x] **Sidebar expand/collapse**: Clicking hamburger icon toggles between expanded sidebar (200px with text labels) and collapsed icon rail (48px with icons only, tooltips on hover). Transition animated (200ms). State persisted in `ui.sidebarExpanded`.

### Favorites and Spaces

- [ ] **Recent/Favorites/Spaces dropdowns**: In top bar. Each opens a popover listing recently accessed items, favorited items, or spaces respectively. Items show icon + name + type badge. Clicking navigates to the item.

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching these specs. See `assets/data_model.md` for full entity schemas.

- [x] **currentUser**: Sam Lee, samlee@example.com, Admin role, Free plan, 4 MTUs used of 50k limit, organization "AcmeTech"
- [x] **users**: 8 tracked product users with varied countries (US, UK, Canada, Germany, Indonesia), platforms (Web, iOS, Android), device types, realistic names, first/last seen dates spanning Nov-Dec 2024. Include user properties (plan, company, role, signupSource).
- [x] **eventDefinitions**: 8 event types: Page Viewed, Start Session, Element Clicked, Element Changed, Sign Up Button, Sign Up Label, New User, End Session. Each with description, status "live", realistic 30-day occurrence counts, property schemas.
- [x] **events**: ~100 raw events spread across the 8 users over the last 7 days. Mix of Page Viewed (most common), Start Session, Element Clicked, New User. Each with realistic properties (Page Title, Page Path, etc.). Used for user profile event streams.
- [x] **charts**: 6 saved charts:
  1. "Page Views by Unique Users (Last 30 Days)" -- segmentation/line, 30 daily data points, low early values rising to 3
  2. "Daily Active Users" -- segmentation/line, 30 points
  3. "Conversion to Active Users" -- funnel, 3 steps (Start Session -> Page Viewed -> Element Clicked), 100/85/25 conversion
  4. "User Retention (Day 0-30)" -- retention curve, Day 0: 100% -> Day 1: 42% -> Day 7: 8% -> Day 30: 2%
  5. "Event Breakdown by Type" -- segmentation/pie (frequency), slices: 1 time (25%), 3 times (50%), 4 times (25%)
  6. "Weekly Page Views" -- segmentation/bar, weekly aggregation
- [x] **dashboards**: 2 dashboards:
  1. "Product KPIs" -- contains charts 1, 3 (2-column grid layout)
  2. "Web Engagement" -- contains charts 1, 2, 5
- [x] **cohorts**: 4 cohorts: "All Users" (default, all users), "Power Users" (Page Viewed >= 5 times, 7 days, 12 users), "New Users Last 7d" (New User >= 1, 7 days, 3 users), "US Users" (country = US, 6 users)
- [x] **notebooks**: 1 notebook: "SLMobbin Notes" with 2 chart blocks referencing charts 3 and 1
- [x] **experiments**: 2 experiments: "Homepage CTA Test" (draft, A/B web test, control/treatment variants), "Pricing Page Test" (completed)
- [x] **spaces**: 2 spaces: "Sam Lee's Space" (personal, contains all user content), "Product Team" (shared)
- [x] **homeMetrics**: Pre-computed metrics: visitors 42 (+12.5%), pageViews 187 (+8.3%), bounceRate 38.5% (-2.1%), pageViewsPerSession 3.2 (+5.0%), currentLiveUsers 3, newUsersToday 2, avgSessionDuration "4m 23s". topPages: 5 entries. usersByCountry: 5 entries. Web engagement line chart: 30 daily data points.
- [x] **templates**: 5 template cards (display only): User Activity (9 Charts), Marketing Analytics (14 Charts), Session Engagement (6 Charts), Product KPIs (8 Charts), Media (5 Charts)
- [x] **ui**: Initial UI state: sidebarExpanded true, activeSidebarItem "home", expandedSections ["productAnalytics", "users"], currentProject "default"

---

## Out of Scope

Dev must NOT implement these.

- Authentication / login (app starts pre-logged-in as Sam Lee, samlee@example.com)
- Real analytics computation from raw events (all chart data is pre-computed in seed data)
- Real-time data ingestion or event tracking SDK
- Session Replay video playback (list view only, no actual recordings)
- Experiment execution (setup wizard only, no actual A/B testing)
- AI inference for Ask Xmplitude (static mock responses)
- Billing, pricing, or plan management (MTU counter is display-only)
- Integrations, connections, sources, destinations (Data section shows event catalog only)
- File uploads or real CSV export (Export CSV button shows toast/alert "Exported!")
- Keyboard shortcuts beyond Cmd+K search
- Mobile-responsive layout (desktop-only, 1280px+ viewport)
