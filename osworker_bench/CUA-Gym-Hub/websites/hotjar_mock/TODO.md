# Xotjar Mock -- TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Design: `DESIGN.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest hotjar_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`. No Tailwind -- use plain CSS matching DESIGN.md tokens.
- [x] **App layout**: Fixed left sidebar (56px collapsed icon-only by default, 220px expanded on hover or toggle) with `#FAFBFC` background and right border `1px solid #E5E7EB`. Fixed top header bar 56px tall with `#FFFFFF` background and bottom border. Main content area fills remaining space with 24px padding, `#FFFFFF` background. See DESIGN.md section 4 for all measurements. Reference screenshots: `reference/botubot_0005.webp` (heatmap view with sidebar), `reference/botubot_0011.webp` (dashboard), `reference/botubot_0045.webp` (home view).
- [x] **Header bar**: Left: Xotjar flame logo (orange/red `#FF3C00` stylized flame SVG inline, linking to `/`). Next to logo: site selector dropdown showing current site name + URL with chevron-down, clicking opens dropdown listing all sites from state. Center-right cluster: settings gear icon, invite-user icon, notification bell icon (with blue dot badge), help question-mark icon, user avatar circle (40px, uses `ui-avatars.com` URL from currentUser). See `reference/botubot_0003.webp` header, `reference/botubot_0005.webp` header for exact layout.
- [x] **Left sidebar navigation**: Icon-only sidebar (56px) with icons stacked vertically. Each item: 20px icon centered, 8px vertical padding. Tooltip on hover shows label. Items top-to-bottom with section dividers (1px `#E5E7EB` horizontal lines): (1) Home (house icon), (2) Dashboard (grid-2x2 icon), (3) Highlights (lightbulb icon); divider; (4) Trends (trending-up icon), (5) Funnels (bar-chart-3 icon); divider; (6) Recordings (monitor-play icon), (7) Heatmaps (target icon); divider; (8) Feedback (message-circle icon), (9) Surveys (clipboard-check icon); divider; (10) Interviews (users icon -- disabled/stub). Bottom of sidebar: collapse/expand arrow icon. Active item: blue `#3B82F6` icon color + blue left border 3px + `#EBF5FF` background. Hover: `#F3F4F6` background. See `reference/botubot_0003.webp`, `reference/botubot_0005.webp`, `reference/botubot_0045.webp` for sidebar icon layout.
- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes: `/` (Home/Overview), `/dashboard` (Dashboard), `/dashboard/:dashboardId` (specific dashboard), `/highlights` (Highlights), `/highlights/:collectionId` (specific collection), `/trends` (Trends), `/funnels` (Funnels), `/recordings` (Recordings list), `/recordings/:id` (Recording player), `/heatmaps` (Heatmaps list), `/heatmaps/:id` (Heatmap viewer), `/feedback` (Feedback list), `/surveys` (Surveys list), `/surveys/new` (Survey builder), `/surveys/:id` (Survey detail/results), `/events` (Events list), `/settings` (Settings), `/go` (State inspector).
- [x] **State management**: `AppContext.jsx` + `src/utils/dataManager.js`. `dataManager.js` exports `createInitialData()` returning the full state object (see `data_model.md` for complete schema). Context provides `state` and `dispatch` (useReducer pattern). Actions: `SET_ACTIVE_SITE`, `SET_DATE_RANGE`, `ADD_FILTER`, `REMOVE_FILTER`, `TOGGLE_SIDEBAR`, `UPDATE_RECORDING` (star/tag), `CREATE_SURVEY`, `UPDATE_SURVEY`, `DELETE_SURVEY`, `CREATE_HEATMAP`, `UPDATE_HEATMAP`, `ADD_HIGHLIGHT`, `REMOVE_HIGHLIGHT`, `ADD_FEEDBACK`, `CREATE_FUNNEL`, `UPDATE_FUNNEL`, `SET_STATE` (for session injection). State persists to localStorage keyed by `hotjar_mock_state`.
- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Reads `initialState` (from dataManager) and `currentState` (from context), computes `state_diff` by deep-comparing all top-level keys. Returns JSON: `{ initial_state, current_state, state_diff }`. Render as formatted `<pre>` block.
- [x] **Session isolation**: `vite.config.js` mock-api plugin following the pattern from other mocks (see `slack_mock/vite.config.js`). Endpoints: `POST /post?sid=<sid>` (set/reset state), `GET /go?sid=<sid>` (inspect state), `GET /state?sid=<sid>`. State files stored in `.mock-states/` directory. `createInitialData()` imported server-side for initial/reset state. Support actions: `set` (overwrites both initial + current), `set_current` (updates current only), `reset` (restores to initial).

---

## P1 -- Primary Features

Core features a user interacts with in the first 5 minutes. These are the main workflows for agent training.

### P1.1 -- Dashboard View (`/dashboard`)

- [x] **Dashboard page layout**: Page title "Dashboard" (24px, 700 weight) with subtitle "An aggregated view of all your data" (14px, `#6B7280`) and feedback link. Left sub-sidebar (280px) within content area listing: "+ New dashboard" button at top, "Pinned" section (empty state: "Any dashboards you pin will show here"), "Dashboards" section listing saved dashboards ("Site overview", "Testing template"). Clicking a dashboard name highlights it and loads its content in main area. See `reference/botubot_0011.webp` and `reference/botubot_0030.webp`.
- [x] **Dashboard filter bar**: Row below title containing: calendar icon + "Last 30 days" dropdown pill (clicking opens date range picker -- see P2.9), filter icon + "Add filter" button (clicking opens filter type dropdown -- see P2.10). Applied filters shown as removable pills with X close button.
- [x] **Dashboard segment tabs**: Horizontal tab bar below filter bar: "All sessions" (default, active), "Direct traffic", "Error occurred", "Mobile users", "New users", "Organic traffic", "Paid traffic", "Rage clicked", "Returning users". Active tab has bottom blue underline. Clicking a tab filters dashboard metrics to that segment (filter the displayed metric values from state). See `reference/botubot_0011.webp` tab row.
- [x] **Dashboard metric cards**: Row of 3-4 cards in a horizontal flex layout. Each card: white background, 1px border `#E5E7EB`, 8px border-radius, 20px padding. Content: small label (12px, `#6B7280`, uppercase) e.g. "Total sessions", large value (28px, 700 weight) e.g. "14", and a small inline sparkline chart (32px height) rendered as SVG polyline from `sessionsSparkline` array. Cards: (1) Total sessions, (2) Avg. session duration (format "M:SS"), (3) Avg. pages / session, (4) Bounce rate (percentage). See `reference/botubot_0011.webp` and `reference/botubot_0030.webp`.
- [x] **Dashboard Page Overview widget**: Card below metric cards on left side (~60% width). Header: "Page overview" label + URL dropdown filter. Content: mock website thumbnail preview (a grey placeholder box with mock browser chrome -- three dots top-left). Overlaid stats grid (2x3): Sessions count + icon, Clicks count + icon, Rage clicks count + icon, Avg. time on page + icon, Avg. scroll depth % + icon, Drop-off rate % + icon. Below: "View heatmap" button (outlined) + play recording button. See `reference/botubot_0011.webp` left card.
- [x] **Dashboard Top Clicked Buttons & Links widget**: Card on right side (~40% width). Header: "Top clicked buttons & li..." label + URL dropdown filter + kebab menu. Content: list of clicked elements, each row: element name/label, horizontal blue progress bar (width proportional to session count), session count text, action icons (external link, heatmap, play recording). See `reference/botubot_0011.webp` right card showing "Login" (3 sessions bar), "Supabase" (2 sessions), "Deploy to Vercel" (2 sessions).
- [x] **Dashboard Rage Clicks & U-turns widget**: Card in lower section. Shows rage click count and u-turn count with small sparkline or trend icon. Title "Rage clicks & u-turns" with subtitle "Sessions of users who felt frustrated or confused". Links to filtered recordings view.
- [x] **Dashboard Feedback widget**: Card showing positive/negative feedback summary counts. Title "Feedback" with dropdown filter. Links to feedback view.
- [x] **Dashboard NPS widget**: Card showing NPS setup prompt if no NPS survey exists ("Looks like NPS isn't set up"). Shows "+ Create NPS survey" button. See `reference/botubot_0013.webp`.
- [x] **Add Widget button**: Top-right "+ Add widget" button (blue `#3B82F6` background, white text). Clicking opens a modal or dropdown with widget type options (placeholder -- non-functional is acceptable).

### P1.2 -- Heatmaps

- [x] **Heatmaps list view** (`/heatmaps`): Left sub-sidebar with: "+ New heatmap" button (blue text, plus icon), URL input field with "Save" button for quick heatmap creation, "Saved heatmaps" section header, list of saved heatmap names as links (clicking navigates to `/heatmaps/:id`). When no saved heatmaps: "When you save heatmaps, they'll appear here". Below: "TUTORIAL: Get Started with Heatmaps" card with illustration and "Launch tutorial" link. Main area shows the heatmap viewer for the selected/first heatmap. See `reference/botubot_0005.webp` and `reference/botubot_0016.webp`.
- [x] **Heatmap viewer** (`/heatmaps/:id`): Top toolbar row: "View recordings" button (play icon + text), "Download" button (download icon + text), "Max." toggle (checkmark). Main viewport: large area (~70% width) showing a mock website screenshot (static grey placeholder with fake content blocks, headings, and buttons). Heatmap overlay rendered as canvas/SVG: for "Click" type, render colored circular blobs at each `clickData[].x, clickData[].y` position using the thermal gradient (hot red center fading to cool blue edges). Numbered badges (1, 2, 3...) at top click positions. Scroll depth indicator on the left edge: "Average fold: 777px" label at fold line, percentage markers (75%, 50%, etc.) below fold. Bottom device bar: Desktop count (monitor icon + number), Tablet count (tablet icon + number), Mobile count (phone icon + number); additional icons for compare/filter toggles. Status bar at bottom: "Select an area to highlight, then save it to add comments, labels, and collections". See `reference/botubot_0005.webp` and `reference/botubot_0016.webp`.
- [x] **Heatmap right sidebar** ("About this heatmap"): Toggled open/closed with X button. Sections (each collapsible with chevron): (1) "Page screenshot" -- thumbnail of the tracked page, (2) "Map types" -- 2x3 grid of clickable type cards: "All clicks" (selected, orange border), "Move", "Scroll", "Engagement zones", "Rage clicks" -- each card is a small icon/thumbnail with label. Clicking switches the heatmap overlay type. (3) "Overlays" -- "Top 3 clicks" and "Highlights" thumbnail options. (4) "Stats" section: "Total clicks: 15", "Rage clicks: 0", "Avg. time on page: 1:24", "Avg. scroll depth: 95.9%", "Drop-off rate: 28.6%". See `reference/botubot_0005.webp` right panel.
- [x] **Heatmap type switching**: Toggle between Click / Move / Scroll heatmap types via the right sidebar "Map types" grid. Click map: colored blobs at click positions. Move map: similar blobs but using `moveData` positions. Scroll map: horizontal gradient bands -- full green/yellow at top of page fading to blue/transparent at bottom using `scrollData.reachPercentages`. Each switch re-renders the overlay in the viewport.
- [x] **Heatmap device toggle**: Bottom device bar shows Desktop/Tablet/Mobile counts from `heatmap.deviceBreakdown`. Clicking a device filters the data to that device type only, updates the click count displayed. Currently selected device has bold/active styling.
- [x] **New heatmap creation**: "+ New heatmap" button in sidebar. Clicking shows URL input field below. User types a URL, clicks "Save". Creates a new heatmap entry in state with status "recording", empty click/scroll/move data, and the URL as name. New heatmap appears in sidebar list and is auto-selected.

### P1.3 -- Recordings

- [x] **Recordings list view** (`/recordings`): Full-width table layout. Top: "Filter by..." label with filter pills below. Filter bar shows active filters as removable pills (e.g. "Unsaved segment" dropdown, "Traffic source" pill, etc.). Quick date range toggles: "Custom", "24h", "7d", "15d", "30 days". "Funnel steps" dropdown button on right. Summary row: "Overall conversion (all steps): 0%" and "Avg. time to convert: 0:00m". Below: list of recording rows. Each row shows: date + time (e.g. "03 Jun, 19:24"), frustration bars (red/orange vertical bars visual), engagement bars (blue vertical bars visual), duration (e.g. "4:12"). Rows are clickable -- clicking navigates to `/recordings/:id`. Active/selected row has blue left border. Left panel shows "Recordings list / Sorted by Relevance" header with X close. See `reference/botubot_0035.webp`.
- [x] **Recording player** (`/recordings/:id`): Full-screen-like layout. Top bar: back arrow, skip-previous icon, skip-next icon, "Recording {id}" title centered, "+ Add to collection" button (blue), "Share" button (outlined), link icon, help icon, kebab menu. URL bar below: "TAB: 1/1" badge, full URL of current page, copy/screenshot icons. Main viewport: large area showing a mock webpage with an animated cursor dot. The cursor position animates through `recording.events` positions sequentially during playback. See `reference/botubot_0035.webp`.
- [x] **Recording playback controls**: Bottom control bar. Left: play/pause button (circle with triangle), skip-back icon (rewind 10s), skip-forward icon. Playback speed button cycling through "1x", "2x", "4x" on click. Center: timeline scrubber -- horizontal track with colored event markers (red dots for rage clicks, blue dots for clicks, yellow for u-turns, grey for page changes). Draggable blue circle thumb. Current position updates cursor in viewport. Right of scrubber: elapsed time / total time (e.g. "0:35 / 4:12"). Far right: tabs for "Info" and "Actions". Emoji reaction bar at bottom: lightbulb, fire, warning, smiley, neutral, sad, angry, thumbsdown, chevron-left icons. "Comment" button and "Console" button. See `reference/botubot_0035.webp` bottom bar.
- [x] **Recording right sidebar -- Info tab**: Shows "Session info" section: visitor icon + anonymous ID (e.g. "88f36f33"), country flag + country name, calendar icon + date, monitor icon + device and resolution (e.g. "Phone (430 x 746)"), browser icon + browser version, OS icon + OS version, referrer info. "View similar recordings" link at bottom. See `reference/botubot_0035.webp` right panel.
- [x] **Recording right sidebar -- Actions tab**: Shows "Recording actions" as 2x4 grid of stat cards: "Clicks" (count), "Text input" (count), "Rage clicks" (count), "U-turns" (count), "Surveys" (count), "Feedback" (count), "Errors" (count), "Events" (count). Each card: icon + count + label. "See all N actions" link below. See `reference/botubot_0035.webp` right panel Actions tab.
- [x] **Recording comment/highlight**: "Comment" button in bottom bar opens a popover with: textarea for comment text, "Collections" label + "Add to a collection" input, "Give us feedback" link, "Save" button. Saving creates a new highlight in state linked to this recording at current playback timestamp. See `reference/botubot_0035.webp` comment popover.
- [x] **Recording star/tag**: Star button in recording player to toggle `isStarred`. Tags shown as pills, can add new tags via input.

### P1.4 -- Surveys

- [x] **Surveys list view** (`/surveys`): Table showing all surveys. Columns: survey name (clickable link), status badge (Active = green, Draft = grey, Paused = yellow, Completed = blue), responses count, created date. Top: "Create survey" button (primary red/orange). Status filter tabs or dropdown. Each row clickable to navigate to `/surveys/:id`.
- [x] **Survey builder** (`/surveys/new`): Full-screen overlay (X close button top-left, "New survey" title, "Create survey" button top-right). Left panel: step-by-step sections (collapsible accordion): (1) "Type" -- grid of survey type cards: "Popover" (selected), "Button", "Embedded", "Full screen", "Link". Each card: icon illustration, name, short description, radio circle. "Done" button below. (2) "Questions" -- list of added questions with drag handles, "+ Add question" button. (3) "Appearance" -- language, background color, button color pickers. (4) "Targeting" -- device checkboxes (Desktop/Tablet/Mobile), pages/events radio (All pages vs Specific), users radio (All users vs Specific), traffic coverage percentage input. Right panel: live preview showing the survey widget as it would appear on a website (grey mock page with the survey popover in bottom-right showing emoji rating scale). Desktop/Mobile toggle below preview. See `reference/botubot_0037.webp` for type selection, `reference/botubot_0025.webp` for targeting.
- [x] **Survey question editor**: Within the "Questions" section of builder. Each question: type selector dropdown (Reaction/Long text/Short text/Email/Radio/Checkbox/NPS/Rating/Statement), question text input, options editor for radio/checkbox (list of text inputs with + add / X remove), required toggle, branching logic rules (optional). Reaction type shows 5 emoji faces ("Not good at all" to "Very good"). NPS shows 0-10 number scale. Rating shows 1-5 stars.
- [x] **Survey results view** (`/surveys/:id`): Page header with survey name, status badge, edit button. Summary section: response count, completion rate. For each question: chart visualization (bar chart for radio/checkbox, NPS score gauge for NPS, word list for text responses). Individual responses table below with columns: date, visitor ID, device, page, answers. Tabbed: "Overview" vs "Individual responses". AI-generated summary section with "Quotes" card showing notable text responses and "Next steps" card with bullet recommendations. See `reference/botubot_0002.webp` for report layout.

### P1.5 -- Feedback

- [x] **Feedback list view** (`/feedback`): List of feedback items. Each item card: emoji icon (happy/sad/confused/neutral/love faces), message text, page URL, timestamp, device badge, browser badge. Sentiment filter bar (All / Positive / Negative / Neutral). Sort by date (newest first). Clicking an item expands details or opens a side panel. Summary header: count of positive vs negative feedback with percentages.

### P1.6 -- Home/Overview

- [x] **Home page** (`/`): Title "Home" with "Share" button. Right sidebar: "Tracking status" section showing active sessions count (green dot + "Active sessions: 0"), site URL with checkmark, session targeting settings. "Recent team activity" section showing activity log entries. Main area: "GUIDES: DEMO -- Explore the Xotjar demo" banner card with illustration and "Explore demo" button (dismissible with X). "Suggested for you" horizontal card row: "Invite team members", "Enable 2FA now", "Save Highlights", "Track user attributes" -- each card with illustration, title, and description, dismissible with X. Below: "And we're live! Xotjar is capturing data" success banner. See `reference/botubot_0045.webp`.

---

## P2 -- Secondary Features

Depth and realism, implement after P1 is complete.

### P2.1 -- Funnels

- [x] **Funnels view** (`/funnels`): Page title "Funnels" with subtitle "Measure conversions and learn why users drop off." and "Share your feedback" link. Top-right: "+ Add to dashboard" button. Step builder: numbered steps (1, 2, 3...) each with: condition pill showing "Viewed page contains [URL]" with copy icon. "+ Add step" button below last step. Minimum 2 steps required to render funnel (show "Add at least 2 steps to view a funnel." message). Below: funnel visualization -- descending blue bar chart where each bar is shorter than the previous, showing drop-off visually. See `reference/botubot_0010.webp`.
- [x] **Funnel step editing**: Clicking a step pill opens condition editor: type selector (page URL / event), match type (contains / equals / starts with), value input. Remove step with X.
- [x] **Funnel metrics**: When funnel has 2+ steps: show "Overall conversion (all steps)" percentage with green checkmark, "Avg. time to convert" with clock icon. Between each step pair: drop-off rate percentage and conversion rate.
- [ ] **Funnel segment saving**: "Save new segment" modal: segment name input, integrations section (Slack toggle, Microsoft Teams toggle, Webhooks toggle), Cancel/Save segment buttons. See `reference/botubot_0012.webp`.

### P2.2 -- Trends

- [x] **Trends view** (`/trends`): Line chart showing metrics over time using SVG. X-axis: dates. Y-axis: metric values. Metric selector dropdown (sessions, pageviews, rage clicks, avg session duration). Date range presets (Custom, 24h, 7d, 15d, 30 days). Hover tooltip showing exact value at date. Data from `trends[].dataPoints`. "+ Compare with..." button to add a second metric line overlay.

### P2.3 -- Highlights

- [x] **Highlights view** (`/highlights`): Page title (collection name, e.g. "Login Experience") with author + date. Top-right: kebab menu, "+ New collection" button, "Share" button. Left sub-sidebar: "New collection" button, "All Highlights" link, collection name links (e.g. "Login Experience", "Sudden Pauses"). Highlight count: "0 Highlights out of 0". Empty state: illustration + "No highlights yet" message + "Go to Recordings" button. When highlights exist: grid/list of highlight cards showing recording thumbnail, notes, timestamp range, tags. See `reference/botubot_0003.webp`.
- [x] **Create highlight**: From recording player, select time range + add comment + assign to collection. New highlight appears in highlights view.

### P2.4 -- Events

- [x] **Events list view** (`/events`): Table of tracked events. Columns: event name, type badge (Custom / Auto), first seen date, last seen date, total count. Sort by column headers. Search/filter by event name. Data from `events[]` in state.

### P2.5 -- Settings

- [x] **Account & Security settings** (`/settings`): Left settings sidebar with icons: Account (person icon, active), Appearance (palette icon), Notifications (bell icon), Organization (building icon). "Account details" section: avatar upload area (circle with "Choose file" button), "Full name" input (editable), "Your role" dropdown (Content Designer, Product Manager, etc.), "Email address" with "Verified" badge + email display. "Save changes" button (primary red) + "Change email" button (outlined). "Security" section below: "Password" with "Change password" button, "Two-factor authentication" description. See `reference/botubot_0007.webp`.
- [x] **Site settings within settings**: Site name, site URL display, tracking code snippet (readonly code block with copy button), team members list stub.

### P2.6 -- Toast Notifications

- [ ] **Toast system**: Bottom-right positioned toasts for actions: "Collection created", "New dashboard created", "Widget deleted", "Your Highlight has been saved". Auto-dismiss after 4 seconds. Green checkmark icon + message text. White background, card shadow. See toasts in `reference/botubot_0003.webp`, `reference/botubot_0005.webp`, `reference/botubot_0013.webp`, `reference/botubot_0030.webp`.

### P2.7 -- Search

- [ ] **Global search**: "Jump to..." input in sidebar top (magnifying glass icon + placeholder text). Typing filters a dropdown list of matching items across heatmaps, recordings, surveys, dashboards by name/URL. Clicking a result navigates to that item. See `reference/botubot_0005.webp` sidebar search.

### P2.8 -- Feedback Widget (floating)

- [ ] **Rate your experience widget**: Fixed vertical tab on right edge of screen, red/orange background `#FF3C00`, rotated text "Rate your experience" with a small survey icon. Clicking opens a small popover feedback form. This appears on all pages. See the red vertical tab in `reference/botubot_0003.webp`, `reference/botubot_0010.webp`, etc.

### P2.9 -- Date Range Picker

- [ ] **Date range picker popover**: Opens from "Last 30 days" pill click. Preset buttons: "Last 7 days", "Last 15 days", "Last 30 days", "Last 90 days", "Custom". Custom mode shows two calendar month grids side-by-side with selectable start/end dates. "Apply" and "Cancel" buttons. Selection updates `selectedDateRange` in state and re-filters visible data.

### P2.10 -- Filter System

- [ ] **Reusable filter bar component**: "+ Add filter" button opens dropdown of filter categories: Pages visited, Device type, Browser, OS, Country, Date range, Frustration level, Events, Traffic source. Selecting a category opens a value picker (dropdown, text input, or multi-select depending on type). Applied filters shown as removable pill badges with filter name + value + X close. Removing a filter updates state and re-filters data.

### P2.11 -- Interviews (Stub)

- [x] **Interviews page stub**: Sidebar icon navigates to `/interviews`. Shows "Follow up interview invitation" page header with "IN PROGRESS" badge. Summary cards row: "Feedback received: 4 (View all)", "Recruited participants: 0", "Scheduled interviews: 0", "Completed interviews: 0". Tabs: "Interviews" / "Invitations". Empty state: illustration + "No scheduled interviews yet" message. See `reference/botubot_0036.webp`.

---

## Data Seed (implement in createInitialData())

See `assets/data_model.md` for complete field definitions. Quantities and scenarios:

- [x] **CurrentUser**: 1 record -- "Alex Chen", admin role, alex.chen@acmecorp.com, with avatar URL
- [x] **Organization**: 1 record -- "Acme Corp", Business plan
- [x] **Sites**: 2 records -- "Acme Store" (site-1, active, primary) and "Acme Blog" (site-2, active)
- [x] **Heatmaps**: 6 records across both sites. Mix of statuses: 3 recording, 1 paused, 2 completed. Include realistic click data arrays (15-30 click points per heatmap with x/y percentages, click counts). Include scroll data with 8-level reach percentages. Pages: homepage, products page, pricing page, checkout page, blog homepage, blog post
- [x] **Recordings**: 25 records with varied: visitor IDs (V-XXXXXX format), countries (US, UK, DE, JP, BR, IN, FR, AU), devices (15 desktop, 5 mobile, 5 tablet), browsers (Chrome, Firefox, Safari, Edge), durations (30s to 600s), frustration scores (0-5, skewed low), engagement scores (0-5, skewed high), 5-20 events per recording with realistic page flows. 3 recordings starred, 5 with tags. Include recordings with rage clicks (5), u-turns (3), errors (4) for filtering scenarios
- [x] **Surveys**: 4 records. (1) Active NPS survey "Net Promoter Score" with 0-10 scale question + follow-up text, 15 responses. (2) Active multi-question "Post-Purchase Satisfaction" with reaction + radio + text questions, 10 responses. (3) Draft "Feature Request Survey" with 3 questions, 0 responses. (4) Completed "Onboarding Feedback" with 5 questions, 8 responses
- [x] **Feedback**: 20 records. Mixed sentiments: 10 positive, 6 negative, 4 neutral. Spread across different pages. Include emoji types (happy, sad, confused, neutral, love). Messages range from 1 sentence to 3 sentences
- [x] **Funnels**: 2 records. (1) "Checkout Funnel" with 4 steps: Product Page (4200 visitors) -> Cart (3255) -> Checkout (2100) -> Confirmation (1680). (2) "Signup Funnel" with 3 steps: Landing (8500) -> Form (3400) -> Confirmation (2550)
- [x] **Trends**: 3 records with 30 data points each. (1) Daily sessions (values 800-1500 with realistic variance), (2) Daily pageviews (values 3000-6000), (3) Daily rage clicks (values 5-30)
- [x] **Highlights**: 5 records linked to recordings, 2 collections ("Sprint 12 UX Issues", "Checkout Flow Problems")
- [x] **Events**: 8 records: add_to_cart (15420 total), checkout_started (8930), signup_completed (3210), page_scroll_50 (45200), video_played (2100), search_used (6780), filter_applied (4350), form_submitted (5690)
- [x] **DashboardMetrics**: 1 object for site-1 with sparkline arrays (30 values each), top pages array (5 pages), top clicked elements array (5 elements with session counts)

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login / signup flows (app starts pre-logged-in as "Alex Chen")
- Real tracking code execution or installation
- Actual session recording capture or video replay (use animated cursor simulation)
- Real heatmap data generation from live traffic
- Working integrations (Slack, HubSpot, etc.) -- show UI stubs only
- Real-time WebSocket connections or live data streaming
- Interview video calling functionality
- Email sending or notification delivery
- File upload to real servers
- Payment/billing/plan management
