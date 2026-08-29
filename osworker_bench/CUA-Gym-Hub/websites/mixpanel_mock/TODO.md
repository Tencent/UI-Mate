# Xixpanel Mock -- TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Design: `DESIGN.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Core Shell

- [x] Project scaffold: `npm create vite@latest mixpanel_mock -- --template react`, install deps (`react-router-dom`, `recharts` for charts, `lucide-react` for icons). Use plain CSS (no Tailwind). All colors/spacing per DESIGN.md.

- [x] App layout -- three-region shell: (1) Left sidebar 220px wide, white bg, right border 1px `#E8E8EC`, full viewport height, scrollable middle section; (2) Top header bar 48px tall, full width minus sidebar, white bg, bottom border 1px `#E8E8EC`; (3) Main content area fills remaining space, `#FFFFFF` bg, 24px horizontal / 20px vertical padding. The sidebar collapses to 48px icon-only mode (Xixpanel X logo, magnifying glass, home, data, boards icons) when collapse arrow is clicked. See reference screenshots `botubot_0003.webp` through `botubot_0050.webp` for exact layout.

- [x] Left sidebar content (top to bottom): (a) Project switcher row -- Xixpanel X logo (purple, ~20px), project name "SLMobbin" bold 14px, subtitle "All Project Data" muted 12px, down-chevron; (b) "+ Create New" button -- full width, purple `#7B5CFF` bg, white text, 6px border-radius, 10px 20px padding, chevron dropdown on right that opens create menu (see P1); (c) Search row -- magnifying glass icon + "Search" text + "Cmd+K" badge right-aligned, 14px, muted text `#6B6B80`, clicking opens search modal; (d) Navigation items -- Home (house icon), Data (database icon, expandable with children: Events, Users, Lexicon, Session Replay); (e) Sections with collapsible headers in uppercase 11px 600 weight `#6B6B80` with 0.08em letter-spacing: "FAVORITES" (boards list), "PINNED" (rocket emoji + "Starter Board", other pinned boards), "YOUR BOARDS" (boards list); (f) Bottom bar -- 4 icon buttons horizontally: apps grid, help circle with orange dot, settings gear, collapse/expand arrow. Each nav item: 36px height, 8px 12px padding, 6px border-radius, hover `#F7F7F8`, active purple bg `#F3F0FF` + bold text + `#1A1A2E` color. "Upgrade Plan" banner with yellow bg `#F5A623` at sidebar bottom above icon bar.

- [x] Top header bar: Left side shows breadcrumb "SLMobbin / [Current Page Name]" in 14px, project name is a link. Right side shows action buttons depending on context -- on Board pages: Subscribe, Share, heart (favorite), link icon, "..." more menu; on Report pages: link icon, "..." more menu, purple "Save" button. The "..." menu is a dropdown with: Duplicate, Undo (Cmd+Z), New Report, Alerts, Export (submenu), Refresh Data (with "Data from X min ago" subtitle).

- [x] Date picker bar (44px): Sits below the header on Board and Report pages. Left side: calendar icon + date range text (e.g., "Jan 16, 2026 -- Jan 22, 2026"); Center: time preset pills in a row -- Custom, Today, Yesterday, 7D, 30D, 3M, 6M, 12M -- each pill is 4px 12px padding, 4px border-radius, 13px font; active pill has purple bg `#7B5CFF` + white text, inactive has transparent bg; "Default" pill with border; Right side: "Exclude" dropdown + "+" button. On report pages additionally: granularity dropdown ("Day" with chevron, dropdown shows Minute/Hour/Day/Week/Month/Quarter), chart type dropdown (icon + "Line" with chevron, dropdown shows Line/Bar/Pie options).

- [x] Routing in App.jsx with BrowserRouter. Routes: `/` (Home/redirect to first board), `/board/:boardId` (Board view), `/report/:reportId` (Report view -- Insights/Funnels/Flows/Retention), `/events` (Events stream), `/users` (Users list), `/lexicon` (Lexicon data dictionary), `/lexicon/:section` (Lexicon sub-pages: events/eventProperties/profileProperties/cohorts/customEvents/metrics/behaviors/dataDeletion), `/session-replay` (Session Replay), `/settings` (Settings), `/settings/:tab` (Settings sub-tabs: org/project/profile), `/go` (state inspector).

- [x] State management: React Context (`AppContext`) wrapping entire app. `dataManager.js` with `createInitialData()` returning full state per `data_model.md`. State stored in localStorage with key `mixpanel_mock_state`. Initial state snapshot saved separately for diff calculation. Provide `getState()`, `setState()`, `resetState()` helpers.

- [x] `/go` endpoint: `src/pages/Go.jsx` that returns JSON `{initial_state, current_state, state_diff}` where state_diff is a deep comparison showing only changed fields. Render as formatted JSON in a `<pre>` tag.

- [x] Session isolation: `vite.config.js` mock-api plugin handling `POST /post?sid=<sid>` (set/reset state for session) and `GET /state?sid=<sid>` (get state). `GET /go?sid=<sid>` returns `{initial_state, current_state, state_diff}`. When `sid` param is present, use session-specific localStorage key `mixpanel_mock_state_<sid>`. On `set` action, write both `.initial` and `.current` keys; on `set_current`, write only `.current`; on `reset`, restore `.current` from `.initial`.

---

## P1 -- Primary Features

### Boards (Dashboard View)

- [x] Board page (`/board/:boardId`): Displays the board title as a large heading (28px 700 weight), editable on click (inline text input); below it, description text (14px 400, muted color), also editable. Below the title area is a grid of report cards. Each card has: 8px border-radius, 1px `#E8E8EC` border, white bg, 20px internal padding, card title (16px 600), a mini-chart visualization (simplified version of the full report chart rendered with recharts), and a "..." hover menu. Cards are arranged in a responsive grid. Below all cards: "+ Add content" placeholder area.

- [x] Board card mini-charts: For Insights report cards, render a simplified line/bar chart using recharts with the report's `chartData`. For Funnels cards, render a horizontal bar showing steps with purple (converted) and green/gray (drop-off) segments. For Flows cards, show a simplified Sankey-like diagram. For text items, render the text content with basic rich text formatting (bold, italic, links). For Retention cards, show a mini retention curve.

- [x] Board "+ Add content" menu: Clicking the "+" button or "+ Add content" area opens a dropdown menu with items: "Launch Spark (Beta)" with sparkle icon + "Use natural language to generate reports with AI" subtitle, "Existing Report" + "Start from a previously saved report", "Insights Report" + "Explore product usage in detail", "Funnels Report" + "Analyze conversion and drop-off", "Flows Report" + "Understand steps in the user journey", "Retention Report" + "Measure product stickiness", "Heatmap" + "Explore interactions by users", "Text" + "Use text to tell a story", "Media" + "Upload an image or embed a video". Each item has an icon (matching the report type icons from the reference screenshots). Clicking an item creates a new board item and navigates to the report editor or adds a text block inline.

- [x] Board text blocks: Inline rich text editing with a floating toolbar that appears on selection -- toolbar has: text size dropdown (T with down arrow), bulleted list, Bold, Italic, Strikethrough, highlight, link, more options. Text blocks support paragraph text with links (link insertion shows URL input + "Link" button in purple). Each text block has a "..." menu on hover (right side) and a "+" button below to add more content.

### Insights Report

- [x] Insights report page (`/report/:reportId` where report.type === "insights"): Three-panel layout: left sidebar (navigation, same as shell), center area (chart + table), right query panel (300px, white bg, left border 1px `#E8E8EC`). The right panel has 3 tabs at top: "Query" (active, underlined purple), "Chart", "Annotations". Below tabs: 5 icon buttons in a row for chart sub-types (line chart grid, bar chart, horizontal bar, funnel, dots grid).

- [x] Insights query panel -- Metrics section: Header "Metrics" with "+" button on right. Each metric row has: a colored letter label (A, B, C) in a circle matching the series color, a gear icon, metric name text (e.g., "Uniques of All Events"), expandable to show: event selector (colored dot + event name like "All Events" with "Add Event" link below), measurement dropdown (shows "# User > Uniques - Cumulative Users" with "Cumulative Sum" tag that can be removed). "Add Metric" button at bottom. See screenshot `botubot_0050.webp` for measurement dropdown showing: Unique Users (selected, purple bg), Total Events, Total Sessions, Frequency per User (with chevron for sub-options), Aggregate Property (with chevron), Aggregate Property per User (with chevron).

- [x] Insights query panel -- Filter section: Header "Filter" with "+" button. Each filter shows: property type icon (Aa for string, # for number), property name (e.g., "Country"), operator text (e.g., "Is"), value(s) (e.g., "Singapore or United States"), vertical "..." menu. Clicking "+" opens a property picker dropdown with search, categorized by All/Event/User/Computed tabs.

- [x] Insights query panel -- Breakdown section: Header "Breakdown" with "+" button. Each breakdown shows: property type icon, property name (e.g., "device type*"), vertical "..." menu. Clicking "+" opens property picker (same as filter).

- [x] Insights chart area: Renders a recharts line/bar/pie chart using the report's `chartData`. Above chart: legend row showing colored squares + series name labels (truncated with "...") + "+N More" link if many series. Chart has Y-axis labels on left (e.g., "E100", "E80", "E40"), X-axis date labels at bottom. Below chart: 3 icon buttons for chart density/view toggle (compact, medium, wide table icons). Hovering a point on the chart shows a tooltip with exact values. Annotations appear as small numbered circles on the X-axis (clicking shows annotation text).

- [x] Insights data table: Below the chart. Has a search bar on left and "Dynamic Segments" dropdown on right. Table columns: Metric (with colored dot), breakdown property columns (with sort chevrons and "Top 12" dropdowns), Average column (sortable, default sort descending), date columns. Rows show metric name, breakdown values (cohort name with colored dot), and numeric values. Table header row has `#F7F7F8` bg, 13px 500 weight text. Rows are 48px height with bottom border `#E8E8EC`, hover bg `#F9F9FB`.

- [x] Insights chart type switching: Clicking the chart type dropdown in the date picker bar or the sub-type icons in the query panel changes the visualization. Support at minimum: line chart, bar/column chart, and table view. The chart rerenders with the same data in the new format.

- [x] Insights date range interaction: Clicking a time preset pill (7D, 30D, etc.) updates the date range text, recalculates the visible chart data, and highlights the active pill. Clicking "Custom" opens a date range picker modal. Changing granularity (Day/Week/Month) regroups the data.

### Funnels Report

- [x] Funnels report page (`/report/:reportId` where report.type === "funnels"): Same three-panel layout. Right query panel shows "Steps" section (instead of Metrics) with lettered steps (A, B) each showing event name and "N Steps before, N Steps after" with chevron. "CONVERSION CRITERIA" section with time window (e.g., "Within 30 hours") and counting method ("Uniques"). Filter and Breakdown sections same as Insights. Main area shows waterfall-style funnel visualization: vertical bars for each step, purple bars = Did Not Convert, green bars = Converted, gray bars = Drop-off. Between steps: "+" buttons to add intermediate steps. Each step shows: step label (A, A+1, A+2...), event name, conversion percentage + count, drop-off percentage + count. Legend at top: purple square "Did Not Convert", green square "Converted". See screenshot `botubot_0016.webp`.

### Events View

- [x] Events page (`/events`): Full-width table (no right query panel). Header: "Showing N most recent results of M matches". Table columns: mini sort icon, Event Name, Time (relative like "less than a minute", "1 day ago"), Distinct ID (purple link), City, Country, Operating System, "..." menu. Each row is expandable -- clicking the chevron (">") on the left expands to show a property detail panel with 3 tabs: "All Properties", "Your Properties", "Xixpanel Properties" + "JSON mode" toggle on right. Properties display as a 3-column grid of key-value pairs (key in gray, value in black/linked purple for IDs and URLs). Rows show user avatars (emoji faces) next to the event. See screenshots `botubot_0004.webp`.

### Users View

- [x] Users page (`/users`): Header "Users" with count badge + "Users with Profiles" filter pill (purple when active, shows dropdown to switch between "Users" and "Users with Profiles"). Toolbar: Hide Filter, Edit Columns (with dot count), Export, Add/Edit Profile, Search profiles input. Table columns: checkbox, Name (with avatar emoji), Email, Distinct ID (purple link), Updated at (sortable), Country Code, Region. Clicking a user row could open a profile detail panel. "Users with Profiles" dropdown explains: "Users: Anyone whose data is tracked in Xixpanel as an event or a user profile property" vs "Users with Profiles: Only the users for whom you collect or set user profile properties in Xixpanel". See screenshot `botubot_0003.webp`.

### Lexicon (Data Dictionary)

- [x] Lexicon page (`/lexicon`): Custom sidebar replacing the normal data sidebar. Left panel shows: search input, "Tracked Data" section (Events, Event Properties, Profile Properties), "Saved Definitions" section (Cohorts, Custom Events, Custom Event Properties, Custom Profile Properties, Lookup Tables, Metrics, Behaviors), "Data Governance" section (Data Deletion), "Settings" section (Manage Data Permissions with external link icon). Main area header: illustration icon + "Events" title + "Events your team has implemented." subtitle + "View Docs" link; top-right: "Import Event Schema" button + "Export" button. Below: result count + Status/Tags/Type filter dropdowns + "Edit Columns" button + Search input. Table columns: checkbox, Event Name (purple link), Display name, Description, 30 day queries (number), Status (Visible/Hidden badge). See screenshot `botubot_0009.webp`.

---

## P2 -- Secondary Features

### Session Replay

- [x] Session Replay page (`/session-replay`): Three-panel layout. Left panel (sidebar width): "Session Replay" title, date range selector ("Last 1 day"), Filter button + Recency/Activity sort dropdown + chart icon button, search input "Search for Replays", session count text "Showing N journeys from M matching recordings", session list -- each item shows: emoji avatar, device ID (purple link if selected), "visited for Nm" duration, event count + timestamp. Center area: URL bar showing the page URL, "View Heatmap" button, thumbs up/down buttons; recording label "Recording 1/N" + time range + event count; website screenshot area (static placeholder image); bottom: playback timeline with event markers (colored dots -- green for tracked, yellow for stitched, red for sentiment), progress bar, play/pause button + speed selector (1x dropdown) + time display + expand + share buttons. Right panel tabs: Details / Activity / Summary. Details tab: User, Duration, Timestamp, Event Count, Entry URL, Exit URL, Source SDK, Operating System, Browser. Activity tab: filter checkboxes (Tracked Events, Stitched Events, User Sentiment, Console) + event timeline list (timestamp, event name with colored dot, count, external link icon). See screenshots `botubot_0007.webp`, `botubot_0008.webp`, `botubot_0018.webp`, `botubot_0022.webp`.

### Flows Report

- [x] Flows report page: Sankey-style diagram showing user paths between events. Each node is a vertical bar with event name, percentage, and count. Branches show where users went next. Purple = Did Not Convert, Green = Converted. Steps labeled A, A+1, A+2, B, B+1. Right query panel: Steps section with step event selectors, Conversion Criteria, Expand Events by Property, Filter, Breakdown (with "Conversion" property). Toolbar: Hide Events toggle, "N rows" selector, "User Flows" dropdown. See screenshot `botubot_0016.webp`.

### Settings Pages

- [x] Settings page (`/settings`): Top tabs: "Org", "Project", "Profile" (pill-style tabs, active has dark bg). Each tab has a left sidebar nav and main content area.

- [x] Settings Org tab: Left nav items: Overview, Plan Details & Billing, Users & Teams, Projects, Service Accounts, Access Security, Identity Merge, Data & Privacy, Xixpanel Usage. "Users & Teams" sub-page has tabs: Users, Teams, Organization Discoverability. Users list shows table (Name with avatar, Email, Organization Role dropdown, Date Joined, Last Active, delete icon). Teams view shows team detail: Details (Name editable), Projects list with "+ Add Projects" button, Data Views, Users list with "+ Add Users" button, Service Accounts. "Add Users" modal: purple header, search input, user list with name+email, Cancel/Done buttons. "Projects" modal: Project dropdown + Role dropdown rows, "+ Add another Project" link, Cancel/Add buttons. See screenshots `botubot_0005.webp`, `botubot_0006.webp`, `botubot_0010.webp`, `botubot_0035.webp`.

- [x] Settings Profile tab: Shows user profile with avatar (circular, with edit overlay), Name (editable input with Cancel/Save), Email (display + edit icon), Password (masked + edit icon), Two-Factor Authentication section. Left nav: Your Profile, Organizations, Projects, Data & Privacy, Alerts. See screenshot `botubot_0002.webp`.

### Create New Menu

- [ ] "+ Create New" button dropdown in sidebar: Opens a dropdown menu listing: Launch Spark (Beta), Existing Report, Insights Report, Funnels Report, Flows Report, Retention Report, Heatmap, Text, Media. Same items as the board "+ Add content" menu but this one creates standalone reports or adds to a board. Clicking "Insights Report" creates a new unsaved report and navigates to `/report/new-insights`. See screenshot `botubot_0020.webp`.

### Search Modal

- [ ] Global search (Cmd+K): Opens a centered modal with search input at top, results grouped by category (Reports, Boards, Events, Users). Each result shows icon + name + type badge. Selecting a result navigates to it. Escape closes.

### Report Actions

- [ ] Report "..." more menu dropdown: Duplicate (copy icon), Undo (Cmd+Z shortcut shown), New Report (opens create sub-menu), Alerts (with notification icon), Export (with submenu arrow showing CSV/PDF options), Refresh Data (with "Data from N min ago" subtitle). See screenshot `botubot_0010.webp` (the insights report more menu).

### Delete Confirmation Dialog

- [ ] Delete event/data confirmation modal: Title "Delete event?", warning banner (yellow bg with triangle icon) "You have N data deletions available this month.", body text explaining deletion is permanent in 7 days, event name + count display, confirmation input "To confirm, type '[Event Name]' below" with text input, Cancel + red "Delete" button. See screenshot `botubot_0025.webp`.

### Custom Property/Formula Builder

- [ ] Custom property modal: "Create a Custom Property" or formula editor. Name input, Formula section with code editor showing IF() syntax, property picker dropdown (categorized by All/Event/User/Computed with type icons Aa/#/calendar/user), property detail panel showing description + tracked-as name + example value. Cancel + "Apply" purple button + "Upgrade to Save" link. See screenshot `botubot_0012.webp`.

### Retention Report

- [ ] Retention report page: Shows a retention grid/table. Rows represent cohorts by time period, columns represent days/weeks since first action. Each cell shows retention percentage, color-coded (darker = higher retention). Right query panel similar to Insights but with retention-specific options.

---

## Data Seed (implement in createInitialData())

- [x] Events: 60 events across 6 distinct users, spread over 30 days. Event types: `[Auto] Page View` (most common, ~20), `[Auto] Element Click` (~15), `meaningful interaction` (~8), `[Auto] Form Submit` (~5), `[Auto] Page Scroll` (~5), `sign_up` (~3), `purchase_completed` (~2), `session_start` (~1 per user), `session_end` (~1 per user). Each event has realistic properties per data_model.md -- vary city/country (New York, San Francisco, Singapore, London, Jakarta), OS (Mac OS X, Windows, iOS), browser (Chrome, Safari, Firefox, Edge).

- [x] User Profiles: 8 profiles with names (sam lee, Jane Doe, Alex Johnson, Maria Garcia, David Kim, Emily Chen, Chris Wilson, Priya Patel), varied emails, distinct IDs, countries, some with undefined fields for realism.

- [x] Boards: 4 boards -- "Main Dashboard" (pinned+favorite, 3 report cards + 1 text block), "Starter Board" (pinned, 2 report cards), "Core User Metrics" (your boards, 2 report cards), "Web Analytics Sample Template" (your boards, 3 report cards).

- [x] Reports: 7 reports -- "User Growth & Engagement" (insights, line chart, 2 metrics with breakdowns), "Daily Active Users" (insights, metric/big number), "Top Events by Volume" (insights, bar chart), "Registered users conversion rate" (funnels, 5-step), "User Journey Flow" (flows), "Weekly Retention" (retention), "Signup Funnel" (funnels, 3-step).

- [x] Lexicon: 12 entries covering all system events ($session_end, $session_start, $mp_click, $mp_dead_click, $mp_input_change, $mp_scroll, $mp_session_record, $mp_submit, $mp_web_page_view) + custom events (meaningful interaction, sign_up, purchase_completed). Include display names, descriptions, 30-day query counts, Visible/Hidden status.

- [x] Cohorts: 4 cohorts (All User Profiles/45 users, view only users/23, power users/8, new signups this month/12).

- [x] Session Replays: 5 replays with distinct device IDs, varied durations (18s to 1h), event counts (4 to 198), timestamps in last 2 days, each with 5-15 event entries in the activity timeline.

- [x] Annotations: 3 annotations on chart dates (e.g., "New feature launched" on Jan 18, "Marketing campaign started" on Jan 17, "Bug fix deployed" on Jan 20).

- [x] Settings: Organization "SLMobbin", 3 org members (Sam Lee/Owner, John Smith/Member, Jane Doe/Member), 1 team "SLMobbin Team", 2 projects (SLMobbin, Production).

---

## Out of Scope

- Authentication / login (app starts pre-logged-in as "Sam Lee", owner of "SLMobbin" organization)
- Real event tracking SDK integration
- Actual session replay video recording/playback (use static placeholder screenshots in the player area)
- Real heatmap rendering (show static overlay image)
- Data pipeline / export to external storage
- Billing / payment processing (show UI but buttons are non-functional)
- Real-time data ingestion or WebSocket connections
- CSV/data import functionality (show modal UI but import action is non-functional)
- Email/notification sending for alerts and subscriptions
