# XerviceNow Mock — TODO

> Status: P0+P1 IMPLEMENTED
> Last updated by: dev agent, 2026-03-13
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest ServiceNow_mock -- --template react` inside the repo root, install deps: `react-router-dom`, `lucide-react`, `date-fns`, `uuid`, `recharts`. Use plain CSS (no Tailwind) for maximum control over XerviceNow's unique styling.

- [x] **Visual design system**: Study `assets/screenshots/` — replicate XerviceNow's exact look. Create `src/styles/variables.css` with CSS custom properties:
  - `--sn-banner-bg: #1b2a32` (dark navy/teal banner)
  - `--sn-nav-bg: #1f2937` (dark slate navigator sidebar)
  - `--sn-nav-text: #d1d5db` (light grey nav text)
  - `--sn-nav-selected: #3b82f6` (selected nav highlight)
  - `--sn-content-bg: #ffffff` (white content area)
  - `--sn-border: #e0e0e0`
  - `--sn-text-primary: #333333`
  - `--sn-text-secondary: #666666`
  - `--sn-link: #007a5a` (green links)
  - `--sn-mandatory: #d32f2f` (red asterisk for required fields)
  - `--sn-priority-critical: #d32f2f`
  - `--sn-priority-high: #f57c00`
  - `--sn-priority-moderate: #fbc02d`
  - `--sn-priority-low: #388e3c`
  - `--sn-priority-planning: #90a4ae`
  - `--sn-worknotes-bg: #fffde7` (pale yellow for work notes)
  - Font family: `"SourceSansPro", "Helvetica Neue", Arial, sans-serif` (import from Google Fonts or use system sans-serif fallback)
  - Base font size: 13px for body, 12px for form labels, 18px for headings

- [x] **App layout** (see `assets/screenshots/navigation/000004.jpg` and `incident_form/000004.jpg`): Three-zone layout:
  - **Banner** (top, 48px height, full width): dark bg (`--sn-banner-bg`), contains: left = XerviceNow logo text "service**now**" in white+green italic font; center = nav tabs "All", "Favorites", "History", "⋮" (more) + currently open tab/record title with ★ bookmark icon; right = 🔍 Search input + dropdown arrow, 🌐 globe, ❓ help, 🔔 notification bell with badge count, 👤 user avatar circle
  - **Application Navigator** (left sidebar, 260px width, collapsible): dark bg (`--sn-nav-bg`), contains: top = 🔍 filter input ("Filter navigator") with clear (×) button; below filter = 3 icon tabs (📋 list / ⭐ favorites / 🕐 history); below tabs = scrollable tree of modules (see Navigator section below). Collapse toggle at bottom
  - **Content Frame** (remaining space, white bg): displays the current view (list view, form view, dashboard) based on route. Has breadcrumb bar at top when navigating sub-views

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes:
  ```
  /                          → Dashboard (homepage)
  /go                        → StateInspector (JSON state view)
  /incident/list             → IncidentList
  /incident/create           → IncidentForm (new)
  /incident/:id              → IncidentForm (edit)
  /problem/list              → ProblemList
  /problem/create            → ProblemForm (new)
  /problem/:id               → ProblemForm (edit)
  /change/list               → ChangeList
  /change/create             → ChangeForm (new)
  /change/:id                → ChangeForm (edit)
  /catalog                   → ServiceCatalog (category grid)
  /catalog/category/:id      → CatalogCategory (items in category)
  /catalog/item/:id          → CatalogItemDetail (order form)
  /catalog/cart               → ShoppingCart
  /knowledge                 → KnowledgeBase (category tree + articles)
  /knowledge/article/:id     → KnowledgeArticle (full article)
  /cmdb/list                 → CMDBList
  /cmdb/:id                  → CMDBDetail
  /reports                   → Reports
  /search                    → GlobalSearch
  ```
  All routes must preserve `?sid=` query parameter for session isolation.

- [x] **State management**: `src/context/AppContext.jsx` + `src/utils/dataManager.js`. Follow the jira_mock pattern exactly:
  - `dataManager.js` exports: `createInitialData()`, `getSessionId()`, `saveState(state, sid)`, `initializeData(sid, customState)`, `getInitialState(sid)`, `fetchCustomState(sid)`, `deepMergeWithDefaults()`. See `assets/data_model.md` for the complete `createInitialData()` structure. localStorage keys: `servicenow_state` / `servicenow_state_{sid}` and `servicenow_initialState` / `servicenow_initialState_{sid}`
  - `AppContext.jsx`: `useReducer` with actions: `SET_STATE`, `UPDATE_INCIDENT`, `ADD_INCIDENT`, `DELETE_INCIDENT`, `UPDATE_PROBLEM`, `ADD_PROBLEM`, `UPDATE_CHANGE`, `ADD_CHANGE`, `ADD_REQUEST`, `UPDATE_REQUEST`, `ADD_JOURNAL_ENTRY`, `ADD_NOTIFICATION`, `MARK_NOTIFICATION_READ`, `MARK_ALL_NOTIFICATIONS_READ`, `ADD_TO_CART`, `REMOVE_FROM_CART`, `CLEAR_CART`, `SET_NAVIGATOR_FILTER`, `TOGGLE_NAV_SECTION`, `RESET_STATE`. Auto-save to localStorage on every dispatch.

- [x] **`/go` endpoint**: `src/pages/StateInspector.jsx` + route. Returns JSON with `{ initial_state, current_state, state_diff }`. Renders raw JSON in `<pre>` tag.

- [x] **Session isolation**: `vite.config.js` with `xervicenow-mock-api` plugin providing:
  - `POST /post?sid=<sid>` with `action: "set" | "set_current" | "reset"` + `state` body
  - `GET /go?sid=<sid>` → `{ initial_state, current_state, state_diff }`
  - `GET /state?sid=<sid>` → `{ stored_state, has_custom_state, sid }`
  - `POST /upload?sid=<sid>` (multipart) → `{ files: [...] }`
  - `GET /files/<sid>/<filename>` → file content
  - State files stored in `.mock-states/` directory
  - Follow jira_mock's `vite.config.ts` as reference (copy and adapt the plugin code, renaming for XerviceNow)

---

## P1 — Primary Features

Core features a user interacts with in the first 5 minutes. Implement after P0 is solid.

### Application Navigator (Left Sidebar)

- [x] **Navigator filter**: Text input at top of sidebar. As user types, filters the module tree below to show only matching items (case-insensitive substring match on module label). Clear button (×) resets filter. See `assets/screenshots/navigation/000004.jpg` — filter shows "service catalog" typed with matching results highlighted.

- [x] **Navigator tabs**: Three icon-only tabs below the filter (see screenshots): 📋 All modules (default), ⭐ Favorites, 🕐 History. "All" shows the full module tree. "Favorites" shows user-pinned modules (store array in state). "History" shows last 10 visited modules/records (store array in state, push on each navigation).

- [x] **Navigator module tree**: Collapsible sections with disclosure triangles. Each section header is bold with a left-pointing triangle (▶ collapsed / ▼ expanded). Clicking a leaf module navigates to its route. Sections and their children (see `assets/screenshots/navigation/000004.jpg` and `change_mgmt/000001.jpg`):
  - **Self-Service** — Incidents, Watched Incidents
  - **Service Desk** — Incidents
  - **Incident** — Create New (`/incident/create`), Assigned to me (`/incident/list?filter=assigned_to_me`), Open (`/incident/list?filter=open`), Open - Unassigned (`/incident/list?filter=open_unassigned`), Resolved (`/incident/list?filter=resolved`), Closed (`/incident/list?filter=closed`), All (`/incident/list`), Overview (→ dashboard view for incidents), Critical Incidents Map (placeholder)
  - **Problem** — Create New (`/problem/create`), Open (`/problem/list?filter=open`), All (`/problem/list`)
  - **Change** — Create New (`/change/create`), Open (`/change/list?filter=open`), Closed (`/change/list?filter=closed`), All (`/change/list`), Overview
  - **Configuration** — CIs (`/cmdb/list`), Servers, Databases (filtered CI lists)
  - **Service Catalog** — Catalogs (`/catalog`), Catalog, Open Records → Requests, Items, Tasks; Catalog Definitions → My Catalogs, My Categories, My Items
  - **Knowledge** — Articles (`/knowledge`), Create New, My Articles
  The currently active module should be highlighted with a left green/blue border and slightly lighter bg.

### Incident Management

- [x] **Incident list view** (`/incident/list`): Full-width data table (see `assets/screenshots/navigation/000001.jpg` for column layout). Columns: checkbox (for bulk select), Number (link to form), Priority (colored badge — see priority colors in data_model.md), State (text), Short description (truncated to ~60 chars), Category, Assignment group (display name), Assigned to (display name), Updated (relative date like "2h ago"). Table header row with column labels; clicking a column header sorts ascending/descending (toggle). Show sort arrow indicator. Above the table: title "Incidents" + record count ("15 records"), breadcrumb, and a "New" button (green) to create. Below the table: simple pagination ("1-15 of 15" or page controls if >20 records).

- [x] **Incident list filtering**: The list view must support URL-based filters from the navigator links:
  - `?filter=assigned_to_me` — shows only incidents where `assigned_to === currentUser.sys_id`
  - `?filter=open` — shows incidents with state in [1, 2, 3] (New, In Progress, On Hold)
  - `?filter=open_unassigned` — open incidents where assigned_to is null/empty
  - `?filter=resolved` — state === 6
  - `?filter=closed` — state === 7
  - No filter param → show all incidents
  Column header click sorting must work on any column (string comparison for text, numeric for priority/state).

- [x] **Incident form view** (`/incident/:id` and `/incident/create`): Two-column form layout mimicking XerviceNow exactly (see `assets/screenshots/incident_form/000003.jpg`, `000004.jpg`, `000005.jpg`). Header bar: back arrow (←), "Incident" / "New record" or "INC001XXXX" title, right side = attachment icon (📎), additional actions (⚙️), more (⋯), "Submit" button (grey), "Resolve" button (grey). Below header, the form is organized in sections:

  **Top section** (two-column grid, labels right-aligned ~160px, fields ~300px):
  - Left column: Number (read-only, auto-generated), Caller (reference lookup field with 🔍 icon), Category (dropdown), Subcategory (dropdown, depends on Category), Service (optional), Configuration item (reference lookup to CMDB with 🔍)
  - Right column: Incident state (dropdown: New/In Progress/On Hold/Resolved/Closed/Cancelled), Opened (date-time, read-only), Opened by (reference, read-only), Contact type (dropdown: Phone/Email/Self-service/Walk-in), Assignment group (reference lookup with 🔍, mandatory red asterisk ✱), Assigned to (reference lookup with 🔍)

  **Priority section**:
  - Impact (dropdown: 1-High, 2-Medium, 3-Low, mandatory ✱)
  - Urgency (dropdown: 1-High, 2-Medium, 3-Low, mandatory ✱)
  - Priority (auto-calculated from Impact×Urgency matrix, read-only, shows colored badge + text like "3 - Moderate")

  **Description section**:
  - Short description (single-line text input, full width)
  - Description (multi-line textarea, full width, ~4 rows)

  **Tabs section** (below the form fields):
  - **Notes** tab (default active): "Additional comments (Customer visible)" textarea (white bg) + "Work notes" textarea (yellow bg `--sn-worknotes-bg`). Below: Activity stream showing previous journal entries in reverse chronological order — each entry shows: icon (💬 comment or 🔧 work note), author name, relative timestamp, entry text. Work notes have yellow left border, comments have blue left border.
  - **Related Records** tab: placeholder table showing "No related records" or listing related problems/changes if any
  - **Resolution Information** tab: shows close_code dropdown and close_notes textarea (visible only when state = Resolved or Closed)

  **Form behaviors**:
  - Changing Impact or Urgency auto-recalculates Priority per the matrix in data_model.md
  - Category dropdown change resets Subcategory to empty and updates its options
  - "Submit" saves the record (dispatches UPDATE_INCIDENT or ADD_INCIDENT) and navigates back to list
  - "Resolve" sets state to 6 (Resolved), shows Resolution Information tab, and submits
  - Reference/lookup fields: clicking 🔍 icon opens a small dropdown/popup listing available records (users for Caller/Assigned to, groups for Assignment group, CIs for Config item). Typing in the field filters the dropdown.

- [x] **Create New Incident**: Navigate to `/incident/create`. Same form as above but all fields are empty/default. Number is auto-generated as next sequential INC number. State defaults to "New" (1). Opened/Opened by auto-set to current date/user. "Submit" creates the incident and redirects to the incident form view for the newly created record.

### Change Management

- [x] **Change request list view** (`/change/list`): Same list view pattern as incidents. Columns: checkbox, Number (link), Type (Normal/Standard/Emergency — colored label), Priority (badge), State, Short description, Assignment group, Assigned to, Risk, Updated. "New" button above table. Filters: `?filter=open` shows non-closed states, `?filter=closed` shows state 3 (Closed).

- [x] **Change request form** (`/change/:id` and `/change/create`): Similar two-column form layout. For Create New: first show a "What type of change is required?" interceptor page (see `assets/screenshots/change_mgmt/000001.jpg`) with 3 options — "Create Normal Change" (description text), "Standard" (preapproved templates), "Create Emergency Change" (urgent). Clicking one sets the type and shows the full form.

  Change form fields:
  - Left: Number (read-only), Requested by (reference), Category (dropdown), Configuration item (reference), Priority
  - Right: Type (read-only after selection), State (dropdown — see change states in data_model.md), Risk (dropdown: High/Moderate/Low), Impact, Assignment group, Assigned to, Approval (read-only status)
  - Description section: Short description, Description
  - Schedule section: Planned start date, Planned end date
  - Notes tab with work notes/comments activity stream (same as incident)
  - Closure section (when state = Closed): Close code, Close notes
  - "Submit" saves, "Update" saves existing

### Problem Management

- [x] **Problem list view** (`/problem/list`): Same list pattern. Columns: Number, Priority, State, Short description, Assignment group, Assigned to, Updated. "New" button. Filter: `?filter=open` for non-closed.

- [x] **Problem form** (`/problem/:id` and `/problem/create`): Two-column form. Fields:
  - Number, State (dropdown — see problem states in data_model.md), Priority, Impact, Urgency
  - Assignment group, Assigned to
  - Short description, Description
  - Root Cause (cause_notes textarea, visible when state ≥ 3)
  - Fix Notes (fix_notes textarea, visible when state ≥ 4)
  - Known Error checkbox
  - Related Incidents (list of linked incident numbers)
  - Notes tab with activity stream

### Service Catalog

- [x] **Catalog homepage** (`/catalog`): Grid layout of category cards (see `assets/screenshots/service_catalog/000001.jpg`). Each card: category icon (emoji/image), category title (bold), description text. Cards arranged in 2-3 columns. Clicking a category card navigates to `/catalog/category/:id`. Above grid: "Service Catalog" header + search bar. Right sidebar panel: "Top Requests" section listing popular items as links (items where `popular: true`), "Shopping Cart" section showing item count or "Empty".

- [x] **Category detail** (`/catalog/category/:id`): Left side = category tree (all categories, current highlighted). Main area = list of catalog items in the selected category. Each item: icon, name (link), short description, price, delivery time, "Order Now" button. Clicking item name → `/catalog/item/:id`.

- [x] **Catalog item detail** (`/catalog/item/:id`): Full item page: large icon/image, item name as header, full description text, price, delivery time. "Add to Cart" button. Quantity selector (input type=number, default 1). Back link to category.

- [x] **Shopping cart** (`/catalog/cart`): Table of items in cart: Item name, Quantity, Price, Remove button (×). "Submit Order" button at bottom. Submitting creates a new `sc_request` record with `sc_req_item` records for each cart item, adds to `requests` and `requestedItems` arrays in state, clears cart, shows confirmation, and creates a notification. "Empty Cart" button to clear all items.

### Knowledge Base

- [x] **Knowledge base homepage** (`/knowledge`): See `assets/screenshots/knowledge_base/000001.jpg`. Layout: Top nav breadcrumb (Home > Knowledge Base). Search bar prominently displayed. Left sidebar: "KB Categories" tree — each category shows label + article count badge (green circle with number). Nested categories indented. Clicking a category filters the article list. Main area: article list showing articles from selected category (or all if none selected). Each article card: title (link, green/teal color), excerpt (first ~150 chars of text), "Authored by [name]" + calendar icon + relative date. Clicking article title → `/knowledge/article/:id`.

- [x] **Knowledge article detail** (`/knowledge/article/:id`): Full article view. Breadcrumb: Home > Knowledge Base > [Category] > [Article title]. Article body rendered as rich text (HTML). Below article: "Was this helpful?" rating (thumbs up/down buttons with counts). View count display. "Back to Knowledge Base" link.

### Dashboard / Homepage

- [x] **Dashboard** (`/`): See `assets/screenshots/navigation/000001.jpg`. Welcome banner: "Welcome, [current user name]!" with current date/time. "Your Work" section: table listing records assigned to current user across all tables (incidents, changes, requests). Columns: Number (link), Created (date), Priority (badge), State, Short Description. Show up to 20 items, sorted by priority then updated_at. Quick stats row above the table: 4 cards showing — "Open Incidents" (count), "Overdue Items" (count where sla_due < now), "Open Changes" (count), "Unread Notifications" (count). Each stat card: large number, label below, clickable to navigate to filtered list.

---

## P2 — Secondary Features

Depth and realism. Implement only after P1 is solid.

### CMDB

- [x] **CMDB list view** (`/cmdb/list`): Table of configuration items. Columns: Name (link), Class, Status (badge), Environment, Category, Assigned to, Location. "New" button (visual only or functional). Click row → `/cmdb/:id`.

- [x] **CMDB detail view** (`/cmdb/:id`): Read-only form showing all CI fields. Related Incidents section at bottom showing incidents linked via `cmdb_ci` field.

### Reporting

- [x] **Reports page** (`/reports`): Two pre-built report visualizations using recharts:
  1. Bar chart: "Open Incidents by Priority" — X axis = priority labels (Critical, High, Moderate, Low, Planning), Y axis = count. Bars colored by priority color.
  2. Pie chart: "Incidents by State" — segments for New, In Progress, On Hold, Resolved, Closed with legend.
  Below charts: summary table with exact counts.

### Notifications

- [x] **Notification bell**: In the banner/header bar. Bell icon (🔔) with red badge showing unread count (or hidden if 0). Clicking bell opens a dropdown panel (absolute positioned, ~350px wide, max-height 400px, scrollable). Each notification: icon based on type (🔔 assignment, 🔄 state_change, 💬 comment, ✅ approval, ⚠️ sla_warning), message text, relative timestamp, unread = bold text + blue dot indicator. Click notification → navigate to the target record. "Mark all as read" link at top of dropdown. Close dropdown on click outside.

### Global Search

- [x] **Search bar**: In the banner. Text input with magnifying glass icon. On Enter or click search icon: navigate to `/search?q=<query>`. Search results page groups results by table: "Incidents", "Changes", "Problems", "Knowledge Articles", "Configuration Items". Each section shows matching records (substring match on number + short_description + description). Each result: [Table icon] Number — Short description. Click navigates to record. Show "No results found" if empty.

### User Profile

- [x] **User avatar/menu**: In the banner, rightmost. Shows circular avatar with initials (e.g., "SA" for System Administrator). Clicking opens dropdown: user name + role, "Profile" link (no-op), "Impersonate User" (visual only), divider, "Logout" (no-op). The dropdown is purely visual — only the username display matters for realism.

### Activity Stream

- [x] **Activity stream on forms**: Below the Notes tab work notes/comments textareas, show a chronological activity feed. Each entry: left-side icon (speech bubble for comments, wrench for work_notes), right-side content = "[User Name] — [Relative time ago]" header (bold name, muted time), then the entry text below. Work notes entries have a yellow-tinted left border. Comments have a blue left border. New entries appear at top (reverse chronological). When user types in a textarea and clicks a "Post" button, a new journal entry is created (dispatch `ADD_JOURNAL_ENTRY`) with the current user and timestamp.

### Favorites & History

- [x] **Favorites tab**: In navigator, clicking the ⭐ tab shows a list of favorited modules/records. User can star/unstar items. Stored in state as array of `{ label, route }` objects. On any list view or form view, a ★ icon in the header can toggle favorite status for the current page.

- [x] **History tab**: In navigator, clicking the 🕐 tab shows last 15 visited pages in reverse chronological order. Each entry: module icon + "Record title" link. Automatically populated as user navigates. Stored in state as array of `{ label, route, timestamp }`.

### SLA Indicators

- [ ] **SLA badges on incident list and form**: For incidents with `sla_due` set, show a visual SLA indicator. In list view: small colored badge next to the priority column — green if >4h remaining, yellow if 1-4h, red if past due. In form view: a banner/ribbon at the top of the form "SLA: [time remaining] remaining" or "SLA: Breached [time ago]" with appropriate color. Calculate from `sla_due` vs current time.

### Bulk Operations (List View)

- [ ] **Bulk select & actions**: On any list view (incidents, changes, problems), each row has a checkbox. Header row has a "select all" checkbox. When ≥1 row selected, a toolbar appears above the table with actions: "Assign to me" (sets assigned_to to current user), "Update State" (dropdown to pick new state), "Delete" (removes records). Toolbar shows "[N] selected" count. Actions dispatch batch updates to state.

---

## Data Seed (implement in createInitialData())

See `assets/data_model.md` for complete field definitions, relationships, and example values.

- [x] **Users**: 8 records — 1 admin, 4 ITIL agents (Service Desk, Network, Database teams), 3 end users (Sales, HR, Finance). See data_model.md §Users.
- [x] **Groups**: 5 assignment groups with member lists. See data_model.md §User Groups.
- [x] **Incidents**: 15 records with realistic distribution across states (3 New, 4 In Progress, 1 On Hold, 3 Resolved, 3 Closed, 1 Cancelled), diverse priorities, categories, callers, and assignees. See data_model.md §Incidents for exact records.
- [x] **Problems**: 4 records across different states with linked incidents. See data_model.md §Problems.
- [x] **Change Requests**: 5 records (2 Normal, 1 Standard, 1 Emergency, 1 Closed). See data_model.md §Change Requests.
- [x] **Service Catalog**: 1 catalog, 6 categories, 12 items across categories with prices and delivery times. See data_model.md §Service Catalog.
- [x] **Requests**: 3 request records with 4 requested items. See data_model.md §Requests.
- [x] **Knowledge Base**: 10 categories (6 top-level + 4 children), 10 published articles with realistic IT support content (VPN guides, password resets, email config, etc.). See data_model.md §Knowledge Base.
- [x] **CMDB**: 8 configuration items (servers, network gear, databases, app servers). See data_model.md §CMDB.
- [x] **Journal entries**: 12 work notes and comments across active incidents. See data_model.md §Journal.
- [x] **Notifications**: 8 notifications (3 unread, 5 read) covering assignments, state changes, comments, approvals, SLA warnings. See data_model.md §Notifications.

---

## Out of Scope

Dev must NOT implement these:

- **Authentication / login** — App starts pre-logged-in as System Administrator (u1/admin)
- **Real API calls** — All data is in-memory / localStorage only
- **LDAP / SSO / OAuth** — No identity provider integration
- **Email / SMS sending** — Notification bell only, no real notifications
- **Workflow engine execution** — No actual business rule automation
- **Access Control Lists** — No permission checks; all users see all data
- **Import Sets / Data loading** — No external data import
- **App Engine Studio** — No low-code app builder
- **Orchestration** — No remote server automation
- **Real file uploads** — Use the vite plugin upload endpoint for mock file handling
- **Service Portal** — We implement the platform UI (admin/agent view), not the self-service portal variant
- **Mobile responsiveness** — Desktop-only layout is sufficient
