# Xendesk Support Mock — TODO

> Status: COMPLETE (all items done)
> Last updated by: dev agent, 2025-03-11
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest Zendesk_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`, `date-fns`, `recharts`. Use plain CSS (not Tailwind). Structure: `src/components/`, `src/pages/`, `src/context/`, `src/utils/`.

- [x] **Visual design system**: The Xendesk Agent Workspace uses a clean, professional aesthetic. Study `assets/screenshots/000005.jpg` (the real Agent Workspace screenshot) as primary visual reference. Colors:
  - Sidebar background: `#1F293D` (dark navy/charcoal)
  - Sidebar icon default: `#8C9BAA` (muted gray-blue)
  - Sidebar icon active: `#FFFFFF` with `#78A300` (lime green) left border indicator (3px)
  - Page background: `#F8F9F9` (very light gray)
  - Card/panel background: `#FFFFFF`
  - Border color: `#D8DCDE`
  - Primary text: `#2F3941`
  - Secondary text: `#68737D`
  - Muted text: `#87929D`
  - Link/accent: `#1F73B7` (blue)
  - Status "New": `#4A90D9` (blue badge)
  - Status "Open": `#E35B51` (red/coral badge)
  - Status "Pending": `#3091EC` (bright blue badge)
  - Status "Hold": `#2F3941` (dark badge)
  - Status "Solved": `#87929D` (gray badge)
  - Status "Closed": `#C2C8CC` (light gray badge)
  - Priority "Urgent": `#CC3340` (red)
  - Priority "High": `#ED6C38` (orange)
  - Priority "Normal": `#1F73B7` (blue)
  - Priority "Low": `#68737D` (gray)
  - Internal note bg: `#FFF6D6` (light yellow)
  - Internal note border-left: `#FFCA00` (yellow)
  - Typography: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`
  - Font sizes: 13px body, 14px headings in panels, 18px page titles, 12px labels/meta
  - Border radius: 4px for inputs/buttons, 50% for avatars/badges

- [x] **App layout** (see `assets/screenshots/000005.jpg`): Three-zone layout filling the viewport (100vw x 100vh, no scroll on body):
  - **Left sidebar**: Fixed, 56px wide, full height, dark bg `#1F293D`. Contains from top: Xendesk "Z" logo (stylized, can use a simple SVG "Z" shape in white, 28px, centered), then vertical icon buttons (~40px spacing each): Home, Views (ticket list icon — this is the primary nav), Customers (people icon), Organizations (building icon), Reporting (bar-chart icon). At bottom: Admin gear icon, product-switcher grid icon, current user avatar (32px circle). Each icon is 20px, color `#8C9BAA`, hover brightens to `#FFFFFF`. Active page icon is white with a 3px `#78A300` left border on the icon's parent row.
  - **Top header**: Fixed, 50px tall, spans from sidebar right edge to viewport right. White bg, bottom border `#D8DCDE`. Contains: left side = ticket tabs area (each tab: ~200px, shows ticket subject truncated + "x" close button, active tab has bottom green border); center = search icon + input ("Search" placeholder, 300px wide, rounded, light gray bg `#F8F9F9`); right side = "+ Add" button (green text, no bg), conversations icon with count badge, notifications bell icon, help "?" icon, user avatar (28px) with dropdown.
  - **Main content area**: Below header, right of sidebar, fills remaining space. Content varies by route. Has its own scrolling.

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes:
  - `/` → Home/Dashboard page (overview stats)
  - `/views/:viewId` → Views page (ticket list filtered by view)
  - `/tickets/new` → New Ticket page
  - `/tickets/:ticketId` → Ticket Detail page (Agent Workspace)
  - `/customers` → Customers list page
  - `/customers/:userId` → Customer detail page
  - `/organizations` → Organizations list page
  - `/organizations/:orgId` → Organization detail page
  - `/reporting` → Reporting page
  - `/search` → Search results page
  - `/go` → State inspector (JSON debug endpoint)
  Default redirect: `/` shows Dashboard; clicking "Views" sidebar icon navigates to `/views/1` (first view). Preserve `?sid=` query parameter across all navigation.

- [x] **State management**: `src/context/AppContext.jsx` using React Context + useReducer. Provider wraps entire app. Actions: `SET_STATE`, `UPDATE_TICKET`, `ADD_TICKET`, `DELETE_TICKET`, `ADD_COMMENT`, `UPDATE_COMMENT`, `APPLY_MACRO`, `SET_ACTIVE_VIEW`, `OPEN_TICKET_TAB`, `CLOSE_TICKET_TAB`, `SET_ACTIVE_TICKET`, `SET_SEARCH_QUERY`, `TOGGLE_SELECTED_TICKET`, `SELECT_ALL_TICKETS`, `DESELECT_ALL_TICKETS`, `BULK_UPDATE_TICKETS`, `SET_UI`. Reducer handles all mutations. State shape matches `data_model.md` `createInitialData()`.

- [x] **Data manager**: `src/utils/dataManager.js` — `createInitialData()` returns full initial state per `data_model.md`. Include session isolation helpers: `getSessionId()`, `storageKey(sid)`, `initialKey(sid)`, `saveState(state, sid)`, `loadState(sid)`, `getInitialState(sid)`, `fetchCustomState(sid)`. On app mount: check for `?sid=` param → try `fetchCustomState(sid)` from `/state` endpoint → if found, deep-merge with defaults → else use `createInitialData()`. Auto-save to localStorage on every state change.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` route. Renders raw JSON: `{ initial_state, current_state, state_diff }`. Compute `state_diff` by deep-comparing `initial_state` vs `current_state` and outputting only changed paths. Style: white bg, monospace font, pre-formatted.

- [x] **Session isolation**: `vite.config.js` with custom Vite plugin `xendesk-mock-api`. Implement middleware for:
  - `POST /post?sid=<sid>` — body `{ action: "set" | "set_current" | "reset", state: {...} }`. `"set"` saves to both `.mock-states/<sid>.json` and `.mock-states/<sid>.initial.json`. `"set_current"` saves only to `<sid>.json`. `"reset"` deletes both files.
  - `GET /state?sid=<sid>` — returns stored state JSON or 404.
  - `GET /go?sid=<sid>` — returns `{ initial_state, current_state, state_diff }` by reading from state files.
  - `POST /upload?sid=<sid>` — multipart file upload, saves to `.mock-uploads/<sid>/`, returns `{ files: [{url, original_name, stored_name, size}] }`.
  - `GET /files/:sid/:filename` — serves uploaded files with correct Content-Type.

---

## P1 — Primary Features

Core interactive workflows a support agent performs daily. Implement after P0 shell is rendering.

- [x] **Views panel (sidebar within main content)**: When on any `/views/*` route, show a left sub-panel (~260px, white bg, right border `#D8DCDE`) listing all views grouped by section headers: "Views" (section header, uppercase, 11px, `#68737D`). Each view row: click to navigate to `/views/:id`; shows view title (13px, `#2F3941`) and ticket count badge on right (rounded pill, `#E9EBED` bg, `#68737D` text, 12px). Active view row has `#EDF7FF` blue highlight background and `#1F73B7` blue text. At top of panel: "Views" title (16px, bold) and a filter/search input. Dynamically compute ticket counts by evaluating each view's conditions against the tickets array.

- [x] **Ticket list table**: Main content when a view is selected. Table with header row (sticky, `#F8F9F9` bg, 12px uppercase text `#68737D`) and data rows. Columns:
  - Checkbox (32px width) — for multi-select
  - Status (40px) — colored dot or small badge showing ticket status with first letter
  - ID (60px) — `#` + ticket ID, muted text
  - Subject (flexible) — ticket subject, bold 13px `#2F3941`, truncated with ellipsis; below it in 12px gray: requester name
  - Requester (150px) — requester name
  - Requested (120px) — relative time since ticket creation ("2 hours ago", "3 days ago") using date-fns `formatDistanceToNow`
  - Updated (120px) — relative time since last update
  - Group (130px) — group name
  - Assignee (130px) — agent name or "—" if unassigned
  - Priority (80px) — colored text/badge with priority name
  Row hover: `#F8F9F9` bg. Row click: navigates to `/tickets/:id` and opens a tab. Entire header row is sortable — click column header to sort asc/desc (toggle arrow icon). Default sort: updated_at desc. Show total count at top: "X tickets" above the table.

- [x] **Ticket detail page — layout**: Three-column layout when on `/tickets/:ticketId`:
  - **Left properties panel** (280px, fixed, white bg, right border): Scrollable. At top: breadcrumb/tab showing organization name (link) → requester name (link) → "Ticket #XXXX" with status badge. Below: form fields stacked vertically, each with 12px uppercase gray label above a dropdown/input:
    - **Assignee**: Dropdown showing agent name + avatar; option to search agents; selecting changes `assignee_id`
    - **Status**: Dropdown with colored status options: New, Open, Pending, Hold, Solved (each with colored dot prefix)
    - **Type**: Dropdown: Question, Incident, Problem, Task
    - **Priority**: Dropdown with colored indicators: Urgent (red), High (orange), Normal (blue), Low (gray)
    - **Group**: Dropdown listing all groups
    - **Tags**: Tag input field; shows current tags as pills with "x" remove button; typing shows autocomplete from global tag list; pressing Enter adds tag
    - **Followers**: Shows follower avatars, + button to add
    All changes immediately update state (no separate save button — changes are applied on dropdown change).

- [x] **Ticket detail — conversation panel**: Center column (flexible width, scrollable). At top: ticket subject as h2 (18px, bold, `#2F3941`), then the channel indicator ("via Email" in muted text). Below: chronological list of comments. Each comment block:
  - **Public comment**: White bg, full-width. Shows: 32px avatar circle on left (initials if no photo, with colored bg based on role: blue-gray for agents, teal for end-users), then: author name (bold 13px), role badge if agent ("Agent" small badge in gray), timestamp (12px muted, relative time). Below: comment body (13px, `#2F3941`, preserve line breaks, support basic HTML rendering). Bottom: thin border separator between comments.
  - **Internal note**: Distinct yellow bg `#FFF6D6` with left border 3px `#FFCA00`. Same layout as public but prefixed with a lock icon and "Internal note" label in amber/yellow text. Makes it visually obvious this is not visible to the customer.
  - Comments are in chronological order (oldest first, newest at bottom). The conversation area scrolls; newest comments at bottom (scroll to bottom on load).

- [x] **Reply composer**: Fixed at bottom of conversation panel. Two-mode toggle at top: "Public reply" (default, green active state) and "Internal note" (yellow active state) — clicking toggles the mode. When in public reply mode: "To:" field showing requester email chip + CC button to add more. When in internal note mode: yellow border and yellow bg tint. Below: rich text area (textarea or contenteditable div, ~120px height, resizable). Toolbar above textarea: Bold (B), Italic (I), Bulleted list, Numbered list, Code block, Link, Attachment (paperclip icon) — these can be cosmetic or functional. Below composer: left side = "Apply macro" button (text button with caret) which opens macro selection dropdown; right side = "Submit as Open" split button (main action button, green/teal bg, white text) with dropdown caret showing: "Submit as New", "Submit as Open", "Submit as Pending", "Submit as Hold", "Submit as Solved". Clicking submit: creates a new comment in the ticket (public or internal based on mode), updates ticket status to the selected value, clears the composer, appends the new comment to the conversation. Also show "Stay on ticket" checkbox next to submit.

- [x] **Create new ticket**: Accessible via "+ Add" button in header (clicking opens a new tab and navigates to `/tickets/new`). Full-page form or modal-style form with fields:
  - **Requester**: Text input with autocomplete searching end-users by name/email. Required.
  - **Subject**: Text input. Required.
  - **Description**: Large textarea / rich text editor for the initial comment. Required.
  - **Type**: Dropdown (Question, Incident, Problem, Task). Optional.
  - **Priority**: Dropdown (Low, Normal, High, Urgent). Optional.
  - **Group**: Dropdown of groups. Defaults to current user's group.
  - **Assignee**: Dropdown of agents (filtered by selected group). Optional.
  - **Tags**: Tag input with autocomplete.
  Bottom: "Submit as [Status]" split button (same as reply composer). On submit: create new ticket in state with an auto-incremented ID, create the first comment from the description, navigate to the new ticket detail page, add to open tabs.

- [x] **Search**: Clicking the search bar in the header or pressing `/` focuses the search input. Typing and pressing Enter navigates to `/search?q=<query>`. Search page shows results: match against ticket subject, description, requester name, tags, and ticket ID. Results displayed as a table similar to ticket list view. Show result count ("X results for 'query'"). Support filtering search results by status, priority, type via filter buttons/dropdowns above results.

- [x] **Ticket tabs**: The top header tab bar shows tabs for currently open tickets. Each tab (~200px max-width): shows ticket status colored dot + truncated subject (ellipsis). Active tab (currently viewed ticket) has a bottom 2px green border (`#78A300`). Hover on tab shows close "x" button. Clicking "x" removes ticket from `openTicketTabs` in UI state and navigates to the next open tab (or back to views if no tabs left). Clicking a tab navigates to that ticket. The "+ Add" button in the tab bar creates a new ticket tab. Maximum ~8-10 tabs visible; if more, show a "+" overflow indicator. When navigating to a ticket from views, automatically add it to open tabs.

- [x] **Macro application**: At bottom-left of ticket detail page, "Apply macro" button. Clicking opens a dropdown/popover listing all macros (from state). Each macro shows title. Searching/filtering within the dropdown. Clicking a macro: applies all its actions to the current ticket — e.g., changes status, adds a comment, changes group/assignee, changes priority. Show a brief toast/notification "Macro applied: [macro name]". The comment (if any from macro actions) appears in the conversation. State updates immediately.

- [x] **Bulk actions on ticket list**: In views, when one or more tickets are selected via checkboxes, a toolbar appears above the table (replacing or overlaying the column headers). Toolbar shows: "X ticket(s) selected", then action buttons: "Edit" (opens a mini-form to bulk change status/priority/assignee/group), "Merge" (button, opens merge modal), "Mark as spam" (button), "Delete" (button, with confirmation). "Edit" action: modal/popover with dropdowns for Status, Priority, Assignee, Group — only filled fields are applied. On confirm: update all selected tickets. "Select all" checkbox in header row toggles all visible tickets. Show count of selected tickets.

- [x] **Status badges**: Throughout the app, ticket status is shown as a colored badge/pill. Implementation: a `<StatusBadge status="open" />` component. Each status has a background color (slightly transparent) and text color:
  - New: bg `#EDF7FF`, text `#1F73B7`
  - Open: bg `#FFEDED`, text `#CC3340`
  - Pending: bg `#E9EBED`, text `#2F3941`
  - Hold: bg `#E9EBED`, text `#2F3941`
  - Solved: bg `#E9EBED`, text `#68737D`
  - Closed: bg `#E9EBED`, text `#87929D`
  Badge is 12px font, uppercase, small padding (2px 8px), border-radius 2px. Used in ticket list, ticket detail, and tabs.

- [x] **Priority indicators**: A `<PriorityBadge priority="high" />` component. Shows colored arrow icon or text:
  - Urgent: red down-arrow ↓ or filled red circle, text "Urgent" in `#CC3340`
  - High: orange up-arrow ↑, text "High" in `#ED6C38`
  - Normal: blue dash —, text "Normal" in `#1F73B7`
  - Low: gray down-arrow ↓, text "Low" in `#68737D`

---

## P2 — Secondary Features

Depth and realism. Implement only after P1 is solid.

- [x] **Dashboard / Home page** (`/`): Overview for the agent. Shows welcome message "Good [morning/afternoon], Sarah". Stats cards in a row: "Tickets assigned to you" (open count), "Pending your reply" (pending count), "Solved this week" (solved count), "Unassigned" (unassigned count). Each card: white bg, shadow, colored left border (green/blue/gray). Below: "Recent tickets" list showing last 5 updated tickets. Quick link buttons: "Your unsolved tickets" → `/views/1`, "Unassigned tickets" → `/views/2`. Simple, clean layout.

- [x] **Reporting page** (`/reporting`): Static mock charts using `recharts`. Four panels:
  1. **Tickets over time** (line chart): X-axis = last 7 days, Y-axis = count; two lines: "Created" (blue) and "Solved" (green). Use mock data with realistic daily counts (5-20 range).
  2. **Tickets by status** (donut/pie chart): Segments for New (blue), Open (red), Pending (teal), Hold (dark), Solved (gray). Counts from current ticket data.
  3. **Tickets by priority** (horizontal bar chart): Urgent/High/Normal/Low with colored bars and counts.
  4. **Agent leaderboard** (table): Columns: Agent name, Assigned, Solved this week, Avg. response time. Use mock data.
  Header: "Reporting" title, subtitle "Support performance overview". Clean grid layout, 2 columns.

- [x] **Customer list page** (`/customers`): Table of end-users. Columns: Name (with avatar initials), Email, Organization, Tickets (count), Created. Search/filter bar at top. Click row → navigate to `/customers/:userId`.

- [x] **Customer detail page** (`/customers/:userId`): Profile page for an end-user. Top section: large avatar (initials, 64px), name, email, phone, organization link, timezone, member since date. Two-column below: Left = "User details" card (all fields), Right = "Tickets" list (all tickets where requester_id = this user, as a compact table with subject, status, updated). Links to organization page.

- [x] **Organization list page** (`/organizations`): Table of organizations. Columns: Name, Domain, Users (count), Tickets (count), Tags. Search/filter bar. Click row → navigate to `/organizations/:orgId`.

- [x] **Organization detail page** (`/organizations/:orgId`): Top: Org name, details, domain, tags. Two sections below: "Members" (table of users in this org with name/email/tickets), "Tickets" (table of tickets from this org's users). Notes field (editable textarea).

- [x] **Ticket context panel (right side)**: In ticket detail view, 300px panel on the right (collapsible). Sections:
  1. **Requester info**: Avatar (48px), name (link to customer page), email, phone, org name (link), local time, "Member since" date.
  2. **Interaction history**: Compact list: "X tickets (Y open)" → link to customer page to see all.
  3. **Recent tickets**: Last 3-5 tickets from same requester (other than current), each showing subject (link), status badge, updated time.
  Toggle button (arrow icon) to collapse/expand this panel.

- [x] **SLA indicators**: On ticket detail, show SLA status below the ticket subject: "First reply: [time left]" or "BREACHED" with appropriate coloring (green for on-track, yellow for warning <2 hours, red for breached). In ticket list, show a clock icon in a column if SLA is near-breach or breached. Simple implementation: compute based on `ticket.sla.next_reply_due` vs current time.

- [x] **Followers and CCs management**: In ticket properties panel, "Followers" section shows small avatars (24px) of following agents; clicking "+" opens a dropdown to search/add agents. "CC" section in reply composer: clicking "CC" button shows a text input to add email addresses; added CCs shown as pills.

- [x] **Toast notifications**: A toast notification system. Show temporary notifications (3 seconds, bottom-right, slide in/out) for: "Ticket #XXXX updated", "Macro applied: [name]", "Ticket created: #XXXX", "X tickets updated". Toast: white bg, left colored border (green for success, blue for info, red for error), shadow, 13px text, close "x" button.

- [x] **Keyboard shortcuts**: Support common shortcuts:
  - `/` — Focus search bar
  - `n` — New ticket
  - `j` / `k` — Next/previous ticket in list
  - `?` — Show keyboard shortcuts dialog (modal listing all shortcuts)
  Show keyboard shortcuts help modal when "?" is pressed or via Help menu.

- [x] **Dropdown menus and popovers**: Consistent dropdown component used throughout: white bg, shadow (`0 2px 8px rgba(0,0,0,0.15)`), border-radius 4px, border `#D8DCDE`. Items: 13px text, 32px row height, hover `#F8F9F9` bg. Search/filter input at top of long lists. Divider lines between sections.

- [x] **Empty states**: When a view has no tickets: centered illustration placeholder, "No tickets found" text, suggestion text. When search returns no results: "No results for 'query'". When a new user has no tickets: appropriate empty message.

- [x] **Responsive ticket properties**: In the ticket properties panel (left side of ticket detail), support for custom fields. Show a "Show more" toggle if there are more than 6 fields visible. Fields should have proper form controls: dropdowns for select fields, text inputs for text fields, date picker for date fields. All changes auto-save (no explicit save button).

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching these specs. See `assets/data_model.md` for complete field definitions.

- [x] **Users**: 5 agents (IDs 1-5) and 10 end-users (IDs 101-110). Current logged-in user: agent ID 1 "Sarah Chen". Each user has name, email, role, organization_id (end-users), group_id (agents), created_at. Generate initials from names for avatar display.

- [x] **Organizations**: 5 organizations (IDs 1-5) with realistic company names, domains, notes, and tags.

- [x] **Groups**: 4 groups: Tier 1 Support (default), Tier 2 Support, Billing, Engineering.

- [x] **Tickets**: 15 tickets (IDs 1001-1015) covering ALL statuses (3 new, 4 open, 3 pending, 1 hold, 3 solved, 1 closed), ALL priorities (2 urgent, 3 high, 6 normal, 3 low, 1 null), ALL types (4 question, 3 incident, 4 problem, 3 task, 1 null). Distributed across requesters, assignees (including 3 unassigned), and groups. Subjects should be realistic customer support topics: login issues, billing questions, feature requests, bug reports, integration problems, performance issues. Created_at dates spread over last 2 weeks. See `data_model.md §Seed Tickets` for the full list.

- [x] **Comments**: ~50 total comments across all 15 tickets (2-5 per ticket). Mix of public replies from end-users and agents, and internal notes from agents. Realistic conversation flows: customer describes problem → agent asks for info or provides solution → customer confirms or provides more detail. Internal notes contain agent-to-agent communication like "Checked the logs, this is a known issue" or "Escalating to engineering". See `data_model.md §Comments` for structure.

- [x] **Views**: 8 views with proper filter conditions (see `data_model.md §Views`). View counts should be dynamically computed at runtime from current ticket data.

- [x] **Macros**: 6 macros with realistic actions (see `data_model.md §Macros`).

- [x] **Tags**: 30+ realistic support tags for autocomplete.

---

## Out of Scope

Dev must NOT implement these:

- **Authentication / login** — App starts pre-logged-in as agent Sarah Chen (user ID 1)
- **Admin Center** — No admin configuration UI (triggers config, automation rules, SLA policy setup, channel config, custom fields management)
- **Real email/notifications** — No actual email sending or receiving
- **Live chat / messaging** — No real-time chat widget
- **Help Center (Guide)** — No public-facing knowledge base
- **Xendesk Talk (phone)** — No VoIP or call functionality
- **AI / bot features** — No Xendesk AI or Answer Bot
- **Marketplace / third-party apps** — No app integrations
- **Multi-brand / multi-instance** — Single brand only
- **Real file uploads** — Attachment UI can exist but actual upload to server not required (unless using the `/upload` endpoint)
- **Ticket sharing between instances** — Not applicable
- **Advanced permissions / custom roles** — All agents have full access
- **Explore (advanced reporting)** — Only simple reporting charts, not full Explore BI tool
