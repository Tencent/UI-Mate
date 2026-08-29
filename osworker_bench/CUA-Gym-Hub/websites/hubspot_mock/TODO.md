# XubSpot CRM Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing scaffold: Vite + React + Tailwind already set up with basic pages

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Infrastructure Fixes

> These fix critical architectural issues in the existing scaffold. Without these, the app's state management is broken and the /go endpoint returns empty data.

- [x] **Fix state management architecture**: The current `StoreContext.jsx` does NOT use the session-aware `dataManager` functions from `mockData.js`. Rewrite `StoreContext.jsx` to:
  1. Import `getSessionId`, `fetchCustomState`, `initializeData`, `saveState`, `getInitialState` from `data/mockData.js`
  2. On mount, call `getSessionId()` to detect the session, then check if this is a page refresh (localStorage has initial key) or first load (need to `fetchCustomState(sid)`)
  3. Call `initializeData(sid, customState)` to get the merged initial data
  4. Store the session ID in a ref (`sidRef`)
  5. Store initialState separately from currentState (for diff tracking)
  6. On every state change, persist to localStorage via `saveState(state, sid)` AND sync to the server via `POST /post?sid=${sid}` with `{ action: 'set', state: currentState }` — this is critical for the `/go` endpoint to return correct data
  7. The `getDiff()` function should compare `initialState` (frozen at first load) with `currentState`, not hardcoded `initialState` from the import
  Reference pattern: see `slack_mock/src/context/AppContext.jsx` for the canonical implementation

- [x] **Expand mock data**: Replace the minimal 4-contact/4-company dataset in `data/mockData.js` with the comprehensive seed data defined in `assets/data_model.md`. Must include:
  - 12 contacts across 6 companies with diverse lifecycle stages and lead statuses
  - 6 companies across different industries with full property sets (phone, city, state, employees, revenue)
  - 10 deals spread across ALL 7 pipeline stages (including `closed_won` and `closed_lost`)
  - 8 tickets with varied statuses, priorities, categories, and sources
  - 8 tasks with different types (to_do, call, email), statuses, and associations
  - 6 notes associated with various record types
  - 4 email templates with realistic {{variable}} placeholders
  - 4 meetings with different statuses (completed, scheduled)
  - 4 forms with varying submission counts and active/inactive status
  - Deal stages config with 7 stages (add `decision_maker_bought_in`, `closed_won`, `closed_lost` — currently only 5 stages)
  - Ticket statuses config: new, waiting_on_contact, waiting_on_us, in_progress, closed

- [x] **Fix deal stages config**: Current `dealStages` in mockData.js only has 5 stages (appointments, qualified, presentation, contract, closedwon). Update to match real XubSpot's 7 default stages with correct IDs, labels, probabilities, and colors. Add `decision_maker_bought_in` (80%), `closed_won` (100%), and `closed_lost` (0%). Use snake_case IDs consistently: `appointment_scheduled`, `qualified_to_buy`, `presentation_scheduled`, `decision_maker_bought_in`, `contract_sent`, `closed_won`, `closed_lost`. Store as part of the state so it appears in `/go`.

- [x] **Add missing reducer actions**: Add these action types to the reducer in StoreContext.jsx:
  - `ADD_COMPANY`, `UPDATE_COMPANY`, `DELETE_COMPANY`
  - `UPDATE_DEAL` (update any deal properties, not just stage), `DELETE_DEAL`
  - `UPDATE_TICKET`, `DELETE_TICKET`
  - `ADD_TASK`, `UPDATE_TASK`, `DELETE_TASK`, `COMPLETE_TASK`
  - `ADD_NOTE`, `UPDATE_NOTE`, `DELETE_NOTE`
  - `ADD_TEMPLATE`, `UPDATE_TEMPLATE`, `DELETE_TEMPLATE`
  - `ADD_MEETING`, `UPDATE_MEETING`, `DELETE_MEETING`
  - `ADD_FORM`, `UPDATE_FORM`
  - `SET_STATE` (for bulk state replacement from server injection)

- [x] **Add Tasks route**: Add `/tasks` route to `App.jsx` and add "Tasks" to the sidebar navigation in `Layout.jsx` (under CRM group, between Tickets and the Marketing section). Icon: `CheckSquare` from lucide-react.

- [x] **Visual design system refinement**: Study `assets/screenshots/` — the real XubSpot uses these exact design tokens. Ensure the tailwind config and component styles match:
  - Primary orange: `#FF7A59` (CTA buttons, active nav, links) ✅ already correct
  - Dark sidebar: `#2D3E50` ✅ already correct
  - Page background: `#F5F8FA` ✅ already correct
  - Text color: `#33475B` ✅ already correct
  - Border color: `#CBD6E2` — add to tailwind config as `xubspot-border` if not present
  - Success/teal: `#00A4BD` — add for positive states
  - Error red: `#F2545B` — add for delete/error states
  - Ensure all table rows have `border-b border-gray-200`, hover state `hover:bg-gray-50`
  - Ensure buttons match: primary = orange bg white text, secondary = white bg gray border, danger = red bg white text

---

## P1 — Primary Features (Core interactive workflows)

### Contacts CRUD & Search

- [x] **Contact search**: Add a search input above the contacts table (matching screenshot: "Search name, phone, e..." placeholder with magnifying glass icon). Filters `state.contacts` by matching `firstName`, `lastName`, `email`, or `phone` case-insensitively. Updates table in real-time as user types.

- [x] **Contact filter chips**: Below the search bar, add filter dropdown buttons matching the real XubSpot UI (see `contacts_ui/000001.jpg`): "Contact owner" (dropdown), "Create date" (date range picker or simple last 7/30/90 days), "Last activity date" (same), "Lead status" (multi-select from enum: new, open, in_progress, etc.), "Lifecycle stage" (multi-select). Plus an "All filters (N)" button that shows how many are active. Each chip is a clickable dropdown; selecting a value filters the table.

- [x] **Contact table sort**: Make table column headers clickable to sort ascending/descending. Show a sort indicator arrow (▲/▼) on the active sort column. Sortable columns: Name, Email, Phone, Job Title, Company. Default sort: by name ascending.

- [x] **Contact create modal — enhanced fields**: Expand the existing create modal to include all contact fields: Email (required, validate format), First Name, Last Name, Phone, Job Title, Lifecycle Stage (dropdown: lead/mql/sql/opportunity/customer/evangelist), Lead Status (dropdown), Company (dropdown selecting from existing companies in state), City, State, Country. The modal should be a right-side slide-in panel (like in the screenshot contacts_ui/000001.jpg — "Create contact" panel slides in from the right, 400px wide, with an X close button at top-right).

- [x] **Contact edit**: Clicking a contact's name in the table should either: (a) open an edit modal pre-populated with all the contact's current values, allowing the user to modify and save, OR (b) navigate to a contact detail page (see P2). At minimum for P1, implement an edit modal that opens when clicking the Edit2 pencil icon on hover. It should dispatch `UPDATE_CONTACT` with the updated fields.

- [x] **Bulk select & actions**: Make the "select all" checkbox in the table header toggle all row checkboxes. When any checkboxes are checked, show a blue action bar above the table with: "N selected" text, "Delete" button (red, confirms then dispatches DELETE_CONTACT for each), "Assign Owner" button (dropdown to change owner). Deselect all after action completes.

- [x] **Contact pagination**: Add table footer with pagination: "Showing 1-25 of N contacts" text on left, page number buttons (1, 2, 3...) in center, items-per-page dropdown (10, 25, 50, 100) on right. Only show page controls when contacts exceed the page size.

### Companies CRUD & Search

- [x] **Company create modal**: Add a click handler to the existing "Create Company" button. Opens a modal/slide-in panel with fields: Company Name (required), Domain, Industry (dropdown: Technology, Marketing, Manufacturing, Finance, Healthcare, Education, Environmental Services, Design, Venture Capital, Other), Phone, City, State, Country, Number of Employees (number input), Annual Revenue (currency input), Lifecycle Stage (dropdown), Owner (text input), Description (textarea). On submit, dispatch `ADD_COMPANY` with a new uuid.

- [x] **Company edit/delete**: Add hover actions column to the companies table (like contacts — Edit2 and Trash2 icons). Edit opens pre-populated modal. Delete shows confirmation dialog. Dispatch `UPDATE_COMPANY` / `DELETE_COMPANY`.

- [x] **Company search & filter**: Add search bar and filter chips above companies table. Search matches on company name, domain, industry. Filters: Industry (multi-select dropdown), Create Date, Lifecycle Stage.

- [x] **Company table enhancements**: Add more columns to match XubSpot: Phone Number, City/State, Number of Employees. Add column sorting (clickable headers).

### Deals CRUD & Board/Table Toggle

- [x] **Create deal modal**: Add click handler to existing "Create Deal" button. Opens a modal with fields: Deal Name (required), Pipeline (dropdown — just "Sales Pipeline" for now), Deal Stage (dropdown populated from `dealStages` config, default to first stage), Amount (currency input with $ prefix), Close Date (date input), Deal Type (dropdown: "New Business" / "Existing Business"), Priority (dropdown: low/medium/high), Owner (text), Associate with Company (dropdown from companies), Associate with Contacts (multi-select dropdown from contacts). On submit, dispatch `ADD_DEAL` with uuid.

- [x] **Deal edit/delete**: Clicking a deal card on the Kanban board opens an edit modal showing all deal properties. Include a "Delete deal" link at the bottom (red text, with confirmation). Also add a small ••• menu icon on each deal card that shows Edit/Delete options. Dispatch `UPDATE_DEAL` / `DELETE_DEAL`.

- [x] **Board/Table view toggle**: Add list view (table) and grid view (board) toggle buttons in the deals header area (matching screenshot: two icons — list lines and grid dots). Table view shows deals in a sortable table with columns: Deal Name, Stage (with colored badge), Amount, Close Date, Deal Owner, Company. Board view is the existing Kanban. Store the active view mode in local component state.

- [x] **Deal search & filters**: Add search bar above deals (both views). Search matches deal name, company name. Add filter chips: Deal owner, Create date, Last activity date, Close date, "More filters". Each is a dropdown that filters the visible deals.

- [x] **Deal pipeline totals**: At the bottom of each Kanban column, display "Total: $X" showing sum of deal amounts in that stage (matching screenshot). Also show weighted amount: total × probability%.

- [x] **Deal card enhancements**: On each Kanban deal card, display: Deal name (clickable blue link), Amount with $ icon, Close date (relative format: "Jun 15"), Company name below a light border. On hover, show a faint shadow elevation.

### Tickets CRUD & Filters

- [x] **Create ticket modal**: Add click handler to "Create Ticket" button. Opens modal with fields: Ticket Name/Subject (required), Description (textarea), Pipeline (default "Support"), Status (dropdown from ticketStatuses: new, waiting_on_contact, waiting_on_us, in_progress, closed), Priority (dropdown: low/medium/high), Category (dropdown: general_inquiry, bug_report, feature_request, billing, technical_support), Source (dropdown: email, phone, chat, form, manual), Associated Contact (dropdown from contacts), Associated Company (dropdown from companies), Owner (text). Dispatch `ADD_TICKET` with uuid.

- [x] **Ticket edit/delete**: Add hover actions to ticket table rows (like contacts). Edit opens pre-populated modal. Delete with confirmation. Status changes should be reflected immediately. Dispatch `UPDATE_TICKET` / `DELETE_TICKET`.

- [x] **Ticket search & filter**: Add search bar (search by subject, contact name). Add filter chips: Status (multi-select), Priority (multi-select), Category, Owner, Create date.

- [x] **Ticket table enhancements**: Add columns for: Description (truncated to 50 chars), Category (with icon), Source, Owner, Create Date. Add column sorting.

- [x] **Ticket status visual indicator**: Replace simple status text with a colored pill/badge for each status. Use colors: New = blue, Waiting on Contact = yellow, Waiting on Us = orange, In Progress = teal, Closed = green. Show the colored dot icon + status text.

### Tasks Page (New)

- [x] **Tasks page component**: Create `src/pages/Tasks.jsx`. Display a table/list of all tasks with columns: checkbox (for completion), Task Title, Type (icon: phone for call, mail for email, check-square for to_do), Due Date (show relative: "Today", "Tomorrow", "Overdue" in red, date otherwise), Priority (colored badge: high=red, medium=yellow, low=blue), Associated Contact (name link), Associated Deal (name), Status (Not Started / In Progress / Completed), Actions (edit/delete).

- [x] **Create task modal**: "Create task" button opens modal with fields: Title (required), Type (dropdown: to_do, call, email), Due Date (date+time picker), Priority (dropdown: low/medium/high), Notes (textarea), Assigned To (text, default "Admin User"), Associate with Contact (dropdown), Associate with Company (dropdown), Associate with Deal (dropdown). Dispatch `ADD_TASK`.

- [x] **Complete task inline**: Clicking the checkbox on a task row should toggle its status to "completed" (or back to "not_started"). Set `completedDate` to current ISO timestamp when completing. Show completed tasks with strikethrough text and muted styling. Dispatch `COMPLETE_TASK`.

- [x] **Task edit/delete**: Edit button opens pre-populated modal. Delete with confirmation. Dispatch `UPDATE_TASK` / `DELETE_TASK`.

- [x] **Task filters**: Filter buttons above table for: Type (multi-select: to_do/call/email), Status (not_started/in_progress/completed), Priority (low/medium/high), Due date (Overdue, Today, This week, This month). Default view shows incomplete tasks sorted by due date ascending.

### Dashboard Enhancements

- [x] **Recent activity feed**: Below the two charts, add a "Recent Activity" card showing the last 10 state changes (contact created, deal moved, task completed, etc.). Each entry shows: icon (by type), description text, relative timestamp ("2 hours ago"), associated record name as a clickable link. For now, generate this from the timestamps in the mock data (meetings, tasks completedDate, notes createDate, etc.).

- [x] **Dashboard KPI cards — dynamic data**: Make all 4 stat cards fully dynamic:
  - "Total Contacts" = `state.contacts.length`
  - "Revenue Closed" = sum of `amount` for deals where `stage === 'closed_won'`
  - "Open Deals" = count of deals NOT in closed_won or closed_lost
  - "Pipeline Value" = sum of all deal amounts (excluding closed_lost)
  - Trend percentages can remain static for now (+12%, +8.2%, +5%, +24%)

- [x] **Deal pipeline chart — fix to match stages**: Update the `dealStageData` array to include all 7 stages (not just 5). Bar chart should show counts for each stage.

### Header Search (Global)

- [x] **Global search implementation**: Make the search bar in the top header functional. On focus, show a dropdown panel (like a command palette, 400px wide). As user types, search across contacts (by name/email), companies (by name/domain), deals (by name), tickets (by subject). Group results by type with section headers ("Contacts", "Companies", "Deals", "Tickets"). Each result shows icon, name, and subtitle (email for contacts, domain for companies, amount for deals, status for tickets). Clicking a result navigates to the relevant page. Show "No results" if nothing matches. Close dropdown on blur or Escape key.

---

## P2 — Secondary Features (Depth and realism)

### Record Detail Pages

- [ ] **Contact detail page**: Add route `/contacts/:id` in App.jsx. Create `src/pages/ContactDetail.jsx` with three-column layout:
  - **Left column (280px)**: "About this contact" panel with all contact properties displayed as label-value pairs. Each value is click-to-edit (inline editing). Shows: Name (large), Job Title, Email (mailto link), Phone, Company (link to company), Lifecycle Stage (dropdown), Lead Status (dropdown), Owner, City/State/Country, Create Date, Last Activity Date.
  - **Center column (flex)**: Activity timeline. Shows notes, logged calls/emails/meetings in reverse-chronological order. Each entry has: icon (by type), title, body preview, timestamp, "created by" text. At the top: action buttons row: "Email" (opens compose stub), "Call" (logs a call), "Log" (add activity), "Task" (create task modal), "Meet" (schedule meeting modal). Also a "Note" textarea + "Save note" button to quickly add notes. Below the action buttons is a filter: "Filter activity" dropdown (All, Notes, Emails, Calls, Meetings, Tasks).
  - **Right column (300px)**: Associations panel. Cards for: "Companies (N)" showing associated company with name + domain + link, "Deals (N)" showing deals linked to this contact with name + amount + stage badge, "Tickets (N)" showing tickets for this contact with subject + status badge. Each card has "+ Add" button.

- [ ] **Company detail page**: Add route `/companies/:id`. Similar 3-column layout as contact detail but for company. Left: company properties. Center: activity timeline (aggregated from all associated contacts/deals). Right: Associated Contacts (list of linked contacts), Associated Deals, Associated Tickets.

- [ ] **Deal detail page**: Add route `/deals/:id`. Layout: Header shows deal name (large) + stage progress bar (horizontal steps showing all pipeline stages, current stage highlighted in orange). Left: deal properties panel. Center: activity timeline. Right: Associated Contacts (list), Associated Company, Line items (future, can be placeholder).

### Notes System

- [ ] **Notes CRUD**: On any detail page, users can add notes via a textarea at the top of the activity timeline. "Save note" creates a Note entity (dispatch `ADD_NOTE`) with `associatedType` and `associatedId`. Notes appear in the timeline. Each note has edit (pencil icon) and delete (trash icon) buttons on hover.

### Marketing & Sales Tool CRUD

- [x] **Email templates CRUD**: The existing templates page only displays cards. Add:
  - "New Template" button opens modal with Name, Subject, Body (textarea), Folder fields
  - Each template card gets Edit and Delete icon buttons
  - Clicking a template card opens an edit modal
  - "Copy" button creates a duplicate template with " (Copy)" appended to name
  Dispatch `ADD_TEMPLATE`, `UPDATE_TEMPLATE`, `DELETE_TEMPLATE`.

- [x] **Meetings CRUD**:
  - "Schedule Meeting" button opens modal with: Title, Date/Time, Duration (dropdown: 15/30/45/60/90 min), Contact (dropdown), Company (dropdown), Location (dropdown: Zoom/Google Meet/In-person/Phone), Notes
  - Each meeting row gets Edit and Cancel (delete) actions
  - Status display: Scheduled = blue, Completed = green, Cancelled = gray, No Show = red
  Dispatch `ADD_MEETING`, `UPDATE_MEETING`, `DELETE_MEETING`.

- [x] **Forms enhancements**:
  - "Create Form" opens modal with Name, Fields list (checkboxes for: email, first_name, last_name, company, phone, message, custom fields)
  - Each form card shows active/inactive toggle switch. Clicking toggles `status` between active/inactive (dispatch `UPDATE_FORM`)
  - "View Submissions" button opens a panel showing submission count and a sample data table (generate fake rows from the form's fields)

### UI Polish

- [x] **Table pagination**: Add pagination to Contacts, Companies, Tickets tables. Show 25 items per page by default. Pagination controls: "< Prev" and "Next >" buttons, page numbers, "Showing X-Y of Z" text.

- [x] **Column sorting on all tables**: Make all table column headers clickable for sort. Show active sort indicator (▲/▼). Contacts, Companies, Tickets, Tasks tables.

- [ ] **Empty states**: When any list is empty (0 contacts, 0 deals, etc.), show a centered empty state illustration (lucide icon + "No contacts yet" text + "Create your first contact" CTA button). Don't show an empty table.

- [x] **Import/Export buttons**: Add "Import" and "Export" buttons (non-functional, just UI) to Contacts, Companies, Deals list view headers. Style: secondary button (white bg, gray border). On click, show a toast message "Import/Export feature not available in mock environment."

- [x] **Toast notification system**: Add a simple toast/snackbar component that appears for 3 seconds in the bottom-right corner after actions: "Contact created", "Deal updated", "Ticket deleted", etc. Green for success, red for errors.

- [ ] **Confirm delete dialogs**: Replace `confirm()` calls with styled modal dialogs. Show: warning icon, "Are you sure you want to delete [record name]?" message, "Cancel" and "Delete" buttons (red).

---

## Data Seed (implement in createInitialData())

> Dev must create realistic seed data matching the specs in `assets/data_model.md`.

- [x] **Contacts**: 12 records across 6 companies. Include varied lifecycle stages (lead, mql, sql, opportunity, customer) and lead statuses (new, open, in_progress, open_deal, connected, attempted). Varied cities/states. Some contacts share a company (TechCorp has 2, Enterprise Global has 2, etc.).
- [x] **Companies**: 6 records across industries: Technology, Marketing, Venture Capital, Manufacturing, Environmental Services, Design. Include employee counts (20-5000), revenue ($1.2M-$500M), full address info.
- [x] **Deals**: 10 records spread across all 7 pipeline stages. Amounts range from $8,000 to $150,000. Some closed_won, some closed_lost (with reason). Multiple contacts per deal. Various close dates (past for closed, future for open).
- [x] **Tickets**: 8 records across all 5 statuses. Varied priorities, categories (bug_report, billing, feature_request, technical_support, general_inquiry), and sources (email, phone, chat, form). Some closed with closeDate, some open.
- [x] **Tasks**: 8 records with mix of types (to_do, call, email) and statuses (not_started, in_progress, completed). Some overdue, some due today, some future. Associated with specific contacts/deals.
- [x] **Notes**: 6 records associated with different entity types (contacts, deals, companies, tickets). Realistic business context.
- [x] **Templates**: 4 email templates (Introductory, Follow-Up, Closing Nudge, Welcome) with {{variable}} placeholders (first_name, company_name, sender_name, their_company).
- [x] **Meetings**: 4 records with different statuses (completed, scheduled). Various durations and locations.
- [x] **Forms**: 4 records, some active, some inactive. Varying submission counts.

---

## Out of Scope

> Dev must NOT implement these.

- Authentication / login — app starts pre-logged-in as `Admin User` (admin@example.com)
- Real email sending — templates can be viewed/created but not "sent"
- Real API calls — all data lives in localStorage + server file persistence
- Workflow/automation builder
- Real-time updates / WebSockets
- Mobile responsive layout (focus on 1280px+ desktop)
- File upload UI (server endpoint exists but no UI needed)
- Dark mode
