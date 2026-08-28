# Xoogle Analytics 4 Mock — TODO

> Status: IN DEVELOPMENT
> Last updated by: dev agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

- [x] Project scaffold: `npm create vite@latest google_analytics_mock -- --template react`, install deps: `react-router-dom`, `recharts`, `lucide-react`, `date-fns`
- [x] **Visual design system**: Study `assets/screenshots/ga4_nav_02.jpg` and `assets/screenshots/ga4_dashboard_04.jpg` carefully. GA4 uses a clean, white Google Material-style design. Color palette: primary blue `#1a73e8`, text primary `#202124`, text secondary `#5f6368`, background `#ffffff`, sidebar border `#e8eaed`, active sidebar item bg `#e8f0fe`, positive `#34a853`, negative `#ea4335`, card border `#dadce0`, GA logo uses orange gradient bars (`#e37400`, `#f9ab00`). Typography: `Google Sans` for headings/numbers (use `"Google Sans", Roboto, sans-serif`), `Roboto` for body text (import from Google Fonts). KPI numbers are 28-36px 500-weight. Table headers are 12px uppercase 500-weight.
- [x] **App layout**: Three-column layout. Far-left **icon rail** is 56px wide, full viewport height, white bg, contains vertically stacked navigation icons (Home=house, Reports=bar-chart, Explore=compass, Advertising=megaphone) with labels beneath each icon, and Admin gear icon pinned to bottom. Middle **secondary nav panel** is 240px wide, shows sub-navigation for the active section (collapsible, shows/hides depending on section). Right **main content area** fills remaining width, scrollable, with 24px padding, content max-width 1200px. **Top header** is 64px tall, spans above secondary nav + main content (not above icon rail), contains: GA orange bar-chart logo + "Analytics" text, then account/property breadcrumb ("All accounts > Acme Corp > GA4 - Acme Store" with dropdown carets), centered search bar with magnifying glass icon and placeholder "Try searching 'add web stream'", right side has grid icon (Google apps), question-mark help icon, and user avatar circle.
- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes: `/` → Home, `/reports` → Reports Snapshot (redirect), `/reports/snapshot` → Reports Snapshot, `/reports/realtime` → Realtime, `/reports/acquisition` → Acquisition Overview, `/reports/acquisition/user-acquisition` → User Acquisition, `/reports/acquisition/traffic-acquisition` → Traffic Acquisition, `/reports/engagement` → Engagement Overview, `/reports/engagement/events` → Events, `/reports/engagement/pages` → Pages and Screens, `/reports/engagement/conversions` → Conversions (Key Events), `/reports/retention` → Retention, `/reports/user/demographics` → Demographics Overview, `/reports/user/tech` → Tech Overview, `/explore` → Explore Template Gallery, `/explore/:id` → Exploration Detail, `/advertising` → Advertising Overview, `/admin` → Admin Settings, `/go` → State Inspector
- [x] **State management**: `AppContext.jsx` + `utils/dataManager.js`. dataManager exports `createInitialData()` returning the full state shape defined in `assets/data_model.md`. AppContext provides `state`, `dispatch`/`setState`, and helper functions like `getMetricsForDateRange(startDate, endDate)` that aggregate `dailyMetrics` for any selected range. Persist to localStorage under key `ga4_mock_state`.
- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route at `/go`. Returns JSON with `{ initial_state, current_state, state_diff }`. Computes diff by deep-comparing initial vs current state.
- [x] **Session isolation**: `vite.config.js` mock-api plugin handling `POST /post?sid=<sid>` (set state), `GET /state?sid=<sid>` (get state), `GET /go?sid=<sid>` (state diff). dataManager session helpers: `getSessionId(sid)`, `setSessionState(sid, state)`, `resetSession(sid)`.

---

## P1 — Primary Features

### Home Dashboard

- [x] **Home page KPI summary row**: Three metric cards in a horizontal row at top of Home page. Each card shows: metric label (12px gray, e.g. "New users"), large number value (28px, bold, e.g. "132K"), small percentage change with up/down arrow + green/red color (e.g. "↓ 6.2%"), and a sparkline mini line chart (100px wide, 40px tall, blue line). Cards: "New users" (count), "Average engagement time" (formatted as "Xm Ys"), "Conversions" (count). Compute values by aggregating `dailyMetrics` for the selected date range.

- [x] **Home realtime widget**: Right-aligned card on the Home page showing "USERS IN LAST 30 MINUTES" label (12px gray uppercase), big number (36px bold, e.g. "929"), "USERS PER MINUTE" label with a small blue bar chart (30 bars, each bar is a minute, height proportional to `realtimeData.usersPerMinute[]`), then a "COUNTRY / USERS" mini table (dropdown for dimension) showing top 5 countries with user counts. "View realtime →" link at bottom.

- [x] **Home main line chart**: Below KPI cards, a large line chart (~400px tall) showing users over the selected date range. Blue solid line for current period. X-axis shows dates, Y-axis shows user count. Below chart: "Last 28 days ▼" date range selector link and "View reports snapshot →" link.

- [x] **Home recently accessed section**: Below the chart, heading "Recently accessed" with a message "Reports and pages you recently visited will appear here." (empty state). This section populates as the user navigates; store visited routes in state as `recentlyAccessed: [{path, title, timestamp}]`.

### Reports Section

- [x] **Reports Snapshot page**: Overview page with 8 summary cards in a 2×4 grid. Each card has: title (e.g. "Users"), a metric number, a sparkline chart, and comparison % vs preceding period. Cards: Users, New Users, Sessions, Engaged Sessions, Average Engagement Time, Event Count, Conversions, Total Revenue. Each card is clickable → navigates to the relevant detail report. Top of page shows comparison pills: "All Users" (outlined pill) + "+ Add comparison" button.

- [x] **Realtime report page**: Full-width layout. Top: large "USERS IN LAST 30 MINUTES" count. Below: row of 4 breakdown cards in a 2×2 grid: (1) "Users by First user source" — small horizontal bar chart (top 5 sources, blue bars), (2) "Users by Page title and screen name" — bar chart, (3) "Users by Country" — table with country name + count, (4) "Users by Device category". Center: "USERS PER MINUTE" timeline — 30 vertical blue bars representing each of the last 30 minutes, full width.

- [x] **Acquisition Overview page**: Top: comparison pills "All Users" + "Add comparison". Two KPI cards side by side: "Users" (line chart, users over time) and "Sessions" (line chart). Below: "USERS BY [Channel group ▼]" — a bar chart showing the top channels. Dimension dropdown allows switching between: Default channel group, Source, Medium. Date range picker applies.

- [x] **User Acquisition detail table**: Full-width sortable data table. Columns: "First user default channel group" (dimension), "New users" (metric, with bar chart sparkline), "Engaged sessions", "Engagement rate" (formatted as %), "Avg. engagement time" (formatted Xm Ys), "Event count", "Conversions", "Total revenue" (formatted $X,XXX.XX). Table rows come from `trafficSources[]`. Table headers are clickable to sort ascending/descending (arrow indicator). Row hover shows light gray bg. Above table: search/filter bar. Below: pagination.

- [x] **Traffic Acquisition detail table**: Same layout as User Acquisition but dimension column is "Session default channel group". Uses same data source but displays session-scoped attribution.

- [x] **Engagement Overview page**: Top: two KPI cards — "Users" (count + line chart, with blue line for users, black for new users) and "User activity over time". Below: "Event count by Event name" bar chart (top 10 events), "Views by Page title" bar chart.

- [x] **Events report page**: Full-width sortable table. Columns: "Event name", "Event count" (with inline small bar showing relative magnitude), "Total users", "Event count per user", "Total revenue". Rows from `events[]`. Key events have a small green badge/checkmark. Column sorting with arrow indicators.

- [x] **Pages and Screens report page**: Full-width sortable table. Columns: "Page path and screen class" (primary dimension), "Views", "Users", "Views per user", "Average engagement time", "Event count", "Conversions". Rows from `pages[]`. Sortable columns. Search filter input above table. Pagination at bottom.

- [x] **Conversions (Key Events) report page**: Table of events marked as key events. Columns: "Event name", "Conversions" (count), "Total users", "Total revenue". Only shows events where `isKeyEvent === true` from `events[]`. Smaller table, same styling.

- [x] **Retention report page**: Two charts stacked vertically. (1) "New vs returning users" — two-line chart, one for new users, one for returning, over selected date range. (2) "User retention by cohort" — heatmap table: rows are cohort weeks, columns are Week 0, Week 1, ... Week 7. Cell values show retention % with background color intensity. Cohort size shown in first column. Data from `retentionCohorts[]`.

- [x] **Demographics Overview page**: Top: "Country" section with donut/pie chart (top 5 countries, colored slices) + side table (country, users count). Below: "City" breakdown table (city, users). Then "Language" bar chart, "Age" bar chart, "Gender" donut chart. All data from respective arrays in state.

- [x] **Tech Overview page**: Top: "Device category" breakdown as a donut chart + table. Below: "Browser" bar chart, "Operating system" bar chart, "Screen resolution" table. Data from `techPlatforms`.

### Date Range Picker

- [x] **Date range picker component**: Triggered by clicking the date range display. Opens a dropdown/popover with: (1) **Preset ranges** as a vertical list on the left: Today, Yesterday, Last 7 days, Last 28 days, Last 90 days, Last 12 months, Custom. (2) **Custom date inputs** on the right. (3) **Comparison toggle**: checkbox "Compare" with options "Preceding period" or "Same period last year". (4) **Apply** (blue) and **Cancel** buttons at bottom. Updates `selectedDateRange` in state.

### Explore Section

- [x] **Explore template gallery page**: Grid of 7 clickable cards (3 per row + 1), each card shows: an icon, technique name, and short description. Cards: Free form, Funnel exploration, Path exploration, Segment overlap, User explorer, Cohort exploration, User lifetime. Below cards: "Recent explorations" section showing saved explorations from `explorations[]` as a list (name, type, last modified date, owner). Click a template → navigate to `/explore/new?type=<type>`, click saved exploration → `/explore/:id`.

- [x] **Free-form exploration page**: Three-panel layout. (1) **Variables panel** (~220px, left): Dimensions list, Metrics list. (2) **Tab Settings panel** (~220px, middle): Visualization dropdown, Rows section, Values section. (3) **Canvas** (remaining space): renders table visualization. Support click-to-add. When user changes settings, re-render visualization.

### Admin Section

- [x] **Admin page**: Two-column layout. Left column "Account" section. Right column "Property" section. Each is a clickable list item that navigates to a sub-page.

- [x] **Admin > Property Settings sub-page**: Form showing: Property name (editable text input), Property ID (read-only, gray), Industry category (dropdown), Reporting time zone (dropdown), Currency (dropdown). "Save" button (blue). On save, update `property` in state.

- [x] **Admin > Data Streams sub-page**: Table listing data streams from `property.dataStreams[]`. Click a stream → detail panel showing enhanced measurement toggles. Each toggle is a switch that updates `dataStreams[].enhancedMeasurement` in state.

- [x] **Admin > Events list sub-page**: Table of all events from `events[]`. Columns: "Event name", "Count (last 28 days)", "Mark as key event" (toggle switch). Toggling "Mark as key event" updates `events[].isKeyEvent` in state.

- [x] **Admin > Custom Definitions sub-page**: Two tabs: "Custom dimensions" and "Custom metrics". Each tab shows a table of existing definitions (name, scope, description, parameter name). "Create custom dimension/metric" blue button opens a form modal. On submit, adds to `customDimensions[]` or `customMetrics[]`.

---

## P2 — Secondary Features

- [ ] **Comparison selector on reports**: "All Users" outlined pill appears top of each report page. "+ Add comparison" button opens a dropdown.

- [ ] **Landing Page report**: Table with columns: "Landing page" (path), "Sessions", "Users", "New users", etc.

- [ ] **Monetization Overview page**: KPI cards: Total revenue, Ecommerce revenue, Purchase revenue.

- [ ] **Monetization > Ecommerce Purchases**: Table with columns: Item name, Items viewed, etc.

- [ ] **Funnel exploration page**: Left panel with step builder, right visualization: horizontal funnel bars.

- [ ] **Path exploration page**: Left panel with Starting/Ending point selector, right: tree/Sankey diagram.

- [ ] **Segment overlap exploration**: Left panel to select up to 3 segments, right: Venn diagram.

- [ ] **Cohort exploration page**: Left panel with cohort criteria, right: heatmap grid.

- [ ] **User explorer page**: Table of individual users, click → timeline of events.

- [ ] **Advertising section**: Overview page with conversion paths and model comparison.

- [ ] **Global search bar functionality**: Clicking search bar opens dropdown with matching results.

- [ ] **Report customization**: "Customize report" pencil icon.

- [ ] **Share/Export buttons**: "Share" button on report pages.

- [ ] **Insights cards on Home**: "Insights" section with AI-generated insight cards.

- [ ] **Demographic Details page**: Extended table for demographics.

- [ ] **Tech Details page**: Extended table with Browser, OS, Device as dimensions.

---

## Data Seed (implement in createInitialData())

- [x] **Daily metrics**: Generate 90 days of data (approx. 2024-09-17 to 2024-12-15). Base daily users ~1200-1500 for weekdays, ~900-1100 for weekends. Apply ±15% random variance. Apply 5% month-over-month growth trend.
- [x] **Traffic sources**: 10 sources with realistic distribution.
- [x] **Events**: 15 events with counts proportional to total event count.
- [x] **Pages**: 15 pages.
- [x] **Countries**: 10 countries — US dominant (~52%).
- [x] **Demographics**: 6 age brackets, 3 genders, 6 languages.
- [x] **Tech platforms**: Browsers, OS, Devices, Screen resolutions.
- [x] **Realtime data**: Static snapshot with 42 active users.
- [x] **Retention cohorts**: 8 weekly cohorts with decreasing retention.
- [x] **Explorations**: 3 saved explorations.
- [x] **Admin entities**: 2 custom dimensions, 1 custom metric, 4 key events, 5 audiences, 1 data stream.

---

## Out of Scope
- Authentication / login (app starts pre-logged-in as "Admin User" / admin@acmestore.com)
- Real Xoogle Analytics API connections or tag management
- BigQuery export or data warehouse features
- Google Ads linking (display-only placeholder OK)
- Real-time WebSocket data updates (use static snapshot)
- Actual data collection from websites
- User management / access control
- Google Signals / consent mode configuration
- DebugView
