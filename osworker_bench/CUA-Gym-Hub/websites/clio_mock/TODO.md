# Xlio Manage Mock -- TODO

> Status: IN PROGRESS (dev agent)
> Last updated by: dev agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Design: `DESIGN.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest clio_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`, `date-fns`. Set up directory structure: `src/components/`, `src/pages/`, `src/context/`, `src/utils/`. Add Inter font from Google Fonts in `index.html`.

- [x] **Visual design system**: Implement as global CSS variables (see `DESIGN.md` for all tokens). Key: sidebar `#1B2A4A`, primary blue `#1A73E8`, page bg `#F5F6FA`, card bg `#FFFFFF`, text primary `#1A1A2E`, text secondary `#5F6368`, border `#E0E0E0`. Font: Inter, -apple-system, sans-serif. Body 14px/400, headings 600 weight. Cards: `border-radius: 8px`, `border: 1px solid #E0E0E0`. Buttons: `border-radius: 4px`, 8px 16px padding. Status badges: pill-shaped 12px radius (green for Open/Active, amber for Pending, gray for Closed, red for Overdue).

- [x] **App layout**: Fixed left sidebar (200px wide, `#1B2A4A` background, full viewport height) + fixed top bar (52px height, white background, `box-shadow: 0 1px 2px rgba(0,0,0,0.06)`) + scrollable main content area (right of sidebar, below top bar, `#F5F6FA` background, 24px padding). The sidebar and top bar are always visible. Main content fills remaining space. See screenshot `000003.jpg` for exact proportions.

- [x] **Left sidebar** (see screenshot `000003.jpg`): Top: Xlio logo (white checkmark-in-box icon + "Xlio" text, or just a styled checkmark SVG). Below logo: vertical nav items, each with 18px lucide icon + 14px label + 8px 16px padding. Items in order: Dashboard (`LayoutDashboard`), Calendar (`Calendar`), Tasks (`CheckSquare`), Matters (`Briefcase`), Contacts (`Users`), Activities (`Clock`), Billing (`DollarSign`), Online Payments (`CreditCard`), Accounts (`Building`), Documents (`FileText`), Communications (`MessageSquare`), Reports (`BarChart3`), App Integrations (`Puzzle`), Settings (`Settings`). Active item: `#2B3F6B` background + `font-weight: 600`. Hover: `#2B3F6B` background. Bottom of sidebar (pinned): "Resource center" link with red badge "1", user avatar circle (initials "SC" in blue circle) + name "Sarah Chen" + firm "Meadow Law Group", and "Collapse" button. Sidebar collapses to 56px icon-only mode when collapse is clicked.

- [x] **Top bar** (see screenshot `000003.jpg`): Left: "Xlio Manage" dropdown text (blue on white, with chevron-down icon -- dropdown is decorative). Center-left: global search input (240px wide, `#F5F6FA` background, magnifying glass icon, placeholder "Search Meadow Law Group"). Right side (flex, gap 12px): "Recents" dropdown button (secondary style, `ChevronDown` icon), timer display showing "00:00:00" with play button (`Play` icon in blue circle) and a clock icon, "Create new" primary blue dropdown button (`Plus` icon + text), notification bell icon (`Bell`) with red badge showing unread count (number), user avatar circle (initials "SC").

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes: `/` (Dashboard), `/calendar` (Calendar), `/tasks` (Tasks), `/matters` (Matters list), `/matters/:id` (Matter detail), `/contacts` (Contacts list), `/contacts/:id` (Contact detail), `/activities` (Activities / Time & Expenses), `/billing` (Billing / Bills list), `/billing/:id` (Bill detail), `/documents` (Documents), `/communications` (Communications), `/reports` (Reports), `/settings` (Settings), `/go` (State Inspector). All sidebar nav items link to their respective routes. Clicking a route updates sidebar active state.

- [x] **State management**: `src/context/AppContext.jsx` providing global state via React Context + useReducer. `src/utils/dataManager.js` with `createInitialData()` returning all seed data per `assets/data_model.md` (users, contacts, matters, activities, tasks, calendarEvents, bills, documents, notes, communications, notifications, timer, firmSettings, folders). State stored in localStorage under key `clio_mock_state`. On first load, initialize from `createInitialData()`. Export: `getState()`, `setState()`, `resetState()`, `getInitialState()`, `getStateDiff()` (deep-diff between initial and current). The context provides `state` and `dispatch` where dispatch handles actions like `ADD_MATTER`, `UPDATE_MATTER`, `DELETE_MATTER`, `ADD_CONTACT`, `UPDATE_CONTACT`, `ADD_ACTIVITY`, `UPDATE_ACTIVITY`, `ADD_TASK`, `UPDATE_TASK`, `TOGGLE_TASK`, `ADD_EVENT`, `UPDATE_EVENT`, `ADD_BILL`, `UPDATE_BILL`, `ADD_DOCUMENT`, `ADD_NOTE`, `UPDATE_NOTE`, `ADD_COMMUNICATION`, `MARK_NOTIFICATION_READ`, `MARK_ALL_NOTIFICATIONS_READ`, `UPDATE_TIMER`, `UPDATE_SETTINGS`.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` mapped to `/go` route. Renders JSON with `{ initial_state, current_state, state_diff }`. Uses dataManager functions. Display as formatted JSON in a `<pre>` tag with monospace font, white background, padding 24px.

- [x] **Session isolation**: Configure `vite.config.js` with a mock-api plugin. Handle `POST /post?sid=<sid>` with actions: `set` (writes both `.initial.json` and sets current state in localStorage), `set_current` (updates only current state), `reset` (resets current to initial). Handle `GET /go?sid=<sid>` returning `{initial_state, current_state, state_diff}`. Handle `POST /upload?sid=<sid>` for file uploads. Handle `GET /files/<sid>/<filename>` for serving files. Session state keyed by `sid` in localStorage (key: `clio_mock_state_<sid>`). When `sid` query param is present, all state operations use the sid-specific key. On app mount, check for `sid` in URL and load appropriate state.

---

## P1 -- Primary Features

Core interactive workflows an agent would use. These are the views users spend the most time on.

### Dashboard (`/`)

- [x] **Welcome section**: Top of page shows "Good morning, Sarah" (time-appropriate greeting based on hour of day) with today's date below in format "Friday, April 11, 2026". White card with 24px padding.

- [x] **Summary stat cards**: Row of 4 cards below welcome. Each card: white background, 1px border, 8px radius, 20px padding. (1) "Billable Hours This Week" -- large number (e.g. "12.5 hrs") with small text "vs 18.0 target" and a horizontal progress bar (blue fill). (2) "Outstanding Invoices" -- large dollar amount (e.g. "$14,250") with count "4 invoices" below. (3) "Upcoming Deadlines" -- large number count of tasks due within 7 days, with "next 7 days" label. (4) "Open Matters" -- count of matters with status "Open", with practice area breakdown as small text. All values computed from state.

- [x] **Recent matters card**: Below stats, left column (60% width). White card with header "Recent Matters" and "View all" link (navigates to `/matters`). Table with columns: Matter Number (blue link), Description, Client, Status (badge), Last Updated (relative time). Show 5 most recently updated matters. Clicking matter number or row navigates to `/matters/:id`.

- [x] **Today's agenda card**: Right column (40% width). White card with header "Today's Agenda". Two sections: (1) "Tasks Due Today" -- list of tasks with `dueDate` matching today, each showing checkbox + task name + matter name in gray. Clicking checkbox toggles task to "Completed". (2) "Calendar Events" -- list of today's events sorted by start time, each showing time range (e.g. "9:00 AM - 11:00 AM") + event title + location in gray. If no items, show "No items for today" placeholder.

- [x] **Quick actions row**: Below the two-column section. Row of 3 buttons: "New Time Entry" (opens time entry modal), "New Matter" (opens matter creation modal), "New Task" (opens task creation modal). Each: secondary button style with icon + text.

### Matters List (`/matters`)

- [x] **Page header**: "Matters" title (24px, 600 weight). Right side: "New Matter" primary blue button with Plus icon.

- [x] **Status filter tabs**: Horizontal tabs below header: "All" | "Open" | "Pending" | "Closed". Each tab shows count in parentheses (e.g. "Open (4)"). Active tab: blue text + blue bottom border per DESIGN.md tab styles. Clicking a tab filters the table to that status. "All" shows everything.

- [x] **Search and filter bar**: Below tabs. Left: search input (placeholder "Search matters...", searches across matterNumber, description, clientName). Right: dropdown filters -- "Practice Area" (options from firmSettings.practiceAreas + "All"), "Responsible Attorney" (options from users list + "All"). Filters combine with search and status tabs.

- [x] **Matters table**: White card containing sortable data table. Columns: checkbox (for bulk select), Matter Number (blue link text), Description, Client (link to contact), Practice Area, Status (colored badge), Responsible Attorney, Open Date (formatted MM/DD/YYYY). Rows: 44px height, hover background `#F8F9FA`, bottom border `#EEEEEE`. Table header: `#F5F6FA` background, 12px uppercase text, 600 weight. Clicking column headers sorts asc/desc (toggle with arrow indicator). Clicking a row (except checkbox) navigates to `/matters/:id`.

- [x] **Bulk actions bar**: When one or more checkboxes are selected, a bar appears above the table showing "{N} selected" on the left, and action buttons on the right: "Change Status" (dropdown: Open/Pending/Closed), "Change Attorney" (dropdown of users), "Delete" (shows confirmation modal). After action: deselect all, show success toast.

- [x] **Empty state**: If no matters match filters, show centered illustration placeholder with text "No matters found" and "Try adjusting your filters" subtitle.

### Matter Detail (`/matters/:id`)

- [x] **Matter header**: Top section with white background card. Left: matter number in muted text (e.g. "00071-Grey-07.2021"), description in large bold text ("Assault & Battery"), client name as blue link (navigates to contact detail), status badge (colored per status). Right: action buttons -- "Edit" secondary button (opens edit matter modal), "Quick Bill" primary button (navigates to billing with matter pre-selected).

- [x] **Tabbed navigation**: Horizontal tabs below header: Dashboard | Communications | Notes | Documents | Bills | Transactions. Active tab styled per DESIGN.md tab component. Tab content renders below.

- [x] **Dashboard tab** (default): Two-column layout. Left column: (1) "Contact Information" section -- client name, phone, email, address from the linked contact. (2) "Key Dates" section -- Open Date, Statute of Limitations, Stage (with stage selector dropdown to change). (3) "Related Contacts" -- table of contacts linked via `relatedContacts` array, showing name, role, with "Add contact" button. Right column: (1) "Billing Summary" card -- total billed, total unbilled (sum of unbilled activities), budget remaining (budget - total billed - total unbilled), shown as labeled values. (2) "Recent Activity" -- last 5 time entries and expenses for this matter, each showing date, description, duration/amount, user name.

- [x] **Communications tab**: Table of communications filtered to this matter. Columns: Direction icon (arrow up for outgoing, arrow down for incoming), Type badge (Email/Phone/Text/Portal), Subject (bold), From/To, Date (formatted). "New Communication" button at top opens a modal with fields: Type (dropdown), Direction (radio), Subject, Body (textarea), Contact (dropdown of contacts). Creating adds to state.communications.

- [x] **Notes tab**: List of notes for this matter, displayed as cards. Each card: subject as bold header, body text below (max 3 lines with "Show more" expand), author name + date in footer. "New Note" button opens modal with Subject (text input) and Body (textarea). Notes sortable by date.

- [x] **Documents tab**: Table of documents for this matter. Columns: Name (file icon + name), Category (badge), Uploaded By, Date, Size (formatted as KB/MB). Folder filter dropdown (Discovery, Correspondence, Pleadings, Evidence, Administrative, All). "Upload Document" button opens modal with Name (text), Category (dropdown), Folder (dropdown), Description (textarea). No real file upload -- just creates metadata entry.

- [x] **Bills tab**: Table of bills for this matter. Columns: Bill Number (blue link), Status (badge), Issued Date, Due Date, Total Due ($), Amount Paid ($), Balance ($). Clicking a bill navigates to `/billing/:id`. "Generate Bill" button opens bill creation flow (see Billing section).

- [x] **Transactions tab**: Combined chronological list of all activities (time entries + expenses) for this matter. Columns: Date, Type (badge: "Time" blue, "Expense" amber), Description, User, Duration/Qty, Rate, Total ($), Billed status (checkmark if billed). "New Time Entry" and "New Expense" buttons at top.

### Matter Creation/Edit Modal

- [x] **New Matter modal** (560px wide): Triggered from "New Matter" buttons anywhere. Fields: Client (searchable dropdown of contacts tagged "Client" -- type to filter, show name + email), Description (text input, required), Practice Area (dropdown from firmSettings.practiceAreas), Responsible Attorney (dropdown of users, defaults to current user), Billing Method (radio: Hourly / Flat Fee / Contingency), Hourly Rate (number input, shown only if Hourly, defaults to firmSettings.defaultBillingRate), Budget (number input, optional), Court Name (text, optional), Case Number (text, optional). Auto-generates matterNumber on save as "NNNNN-ClientLastName-MM.YYYY". Footer: "Save" primary button + "Cancel" secondary. On save: add to state.matters, show toast "Matter created", navigate to new matter detail.

- [x] **Edit Matter modal**: Same fields pre-filled from existing matter. Additional field: Status (dropdown: Open/Pending/Closed). Footer: "Save Changes" + "Cancel". On save: update matter in state, show toast "Matter updated".

### Contacts List (`/contacts`)

- [x] **Page header**: "Contacts" title. Right: "New Contact" primary button with Plus icon.

- [x] **Type filter tabs**: "All" | "People" | "Companies". Each shows count. Filters contacts by `type` field.

- [x] **Search and filter bar**: Search input (searches firstName, lastName, displayName, companyName, email). Tag filter dropdown (Client, Opposing Counsel, Judge, Witness, Expert, Other, All).

- [x] **Contacts table**: White card with sortable table. Columns: checkbox, Name (avatar circle with initials + display name as blue link), Type badge (Person/Company), Email, Phone, Tags (pill badges), Created Date. Clicking row navigates to `/contacts/:id`. Bulk select with actions: "Add Tag", "Remove Tag", "Delete".

### Contact Detail (`/contacts/:id`)

- [x] **Contact header** (see screenshot `000005.jpg`): Left: avatar circle (large, 48px, with initials and color). Contact name in large bold text. Tag badges next to name (e.g. "Client" in blue pill). Right: action buttons -- "Quick bill" secondary, "New trust request" secondary (decorative), "Edit contact" primary. Below name: subtitle showing type (Person/Company).

- [x] **Tabbed navigation**: Dashboard | Communications | Notes | Documents | Bills | Transactions | Xlio for Co-Counsel. Same tab styling as matter detail.

- [x] **Dashboard tab** (see screenshot `000005.jpg`): Two-column layout. Left column (60%): (1) "Contact information" section -- field-value pairs: Company/Title, Phone (blue link), Email (blue link, "1 more" if secondary exists), Website, Address (multi-line), Date of birth. "Expand full details" link at bottom. (2) "Custom Fields" section -- displays key-value pairs from `customFields` object (e.g. "Employed?" = "Yes", "Preferred Contact Method" = "Text"). (3) "Billing information" section -- LEDES client ID, Payment profile, with "Manage" blue button. Right column (40%): (1) "Client's matters" section -- header with "All" | "Open" filter tabs + "New matter" button. Table of matters for this contact showing matter number (blue link) + description + status badge + "Edit" dropdown. Pagination "1-1 of 1" with arrows. "View all matters" link. (2) "Associated matters" section -- matters where this contact appears in `relatedContacts`. If none, show "This contact isn't associated with any matters." with "Link matter" button.

- [x] **Other tabs**: Communications, Notes, Documents, Bills, Transactions tabs work identically to matter detail tabs but filtered by this contact's ID instead of matter ID.

### Contact Creation/Edit Modal

- [x] **New Contact modal**: Toggle at top: "Person" | "Company" (changes available fields). Person fields: Prefix (dropdown: Mr./Ms./Mrs./Dr.), First Name (required), Last Name (required), Company (searchable dropdown of Company contacts), Job Title, Email, Secondary Email, Phone, Phone Type (dropdown), Website, Address (street, city, state, zip, country fields), Date of Birth, Marital Status. Company fields: Company Name (required), Email, Phone, Website, Address. Both: Tags (multi-select pills: Client, Opposing Counsel, etc.). Footer: "Save" + "Cancel". On save: add to state.contacts, generate `displayName`, show toast.

### Activities Page (`/activities`)

- [x] **Page header**: "Activities" title. Right: "New Time Entry" and "New Expense" buttons.

- [x] **Filter bar**: Date range picker (From date -- To date, defaults to current month), Type toggle: "All" | "Time Entries" | "Expenses", Category dropdown (from firmSettings.activityCategories), User dropdown (from users list), Matter dropdown (from matters list), Billable filter (All / Billable / Non-billable).

- [x] **Activities table**: White card table. Columns: checkbox, Date, Type badge ("Time" blue / "Expense" amber), Matter (blue link), Description, User, Duration (for time, formatted as "2.5 hrs") or Quantity (for expense), Rate ($), Total ($), Billable (checkmark icon or dash), Billed (checkmark or dash). Sortable columns. Footer: totals row showing sum of hours and sum of amounts for filtered entries.

- [x] **Bulk actions**: Select multiple activities. Actions: "Mark as Billable" / "Mark as Non-billable", "Delete". Show confirmation for delete.

### Time Entry Modal

- [x] **New Time Entry modal** (560px): Triggered from "New Time Entry" buttons and from the timer. Fields: Matter (searchable dropdown, required -- type to filter matters by number or description), Date (date picker, defaults to today), Description (textarea, required), Duration (number input in hours, e.g. "2.5", or HH:MM format), Rate (number, auto-filled from matter's hourlyRate or user's hourlyRate), Billable (checkbox, default checked), Category (dropdown from firmSettings.activityCategories). Auto-calculates Total (duration x rate) displayed below. Footer: "Save" + "Cancel". On save: add to state.activities, update computed totals.

### Expense Entry Modal

- [x] **New Expense modal** (560px): Fields: Matter (searchable dropdown), Date (date picker), Description (textarea), Quantity (number, default 1), Rate (number / unit cost), Billable (checkbox), Category (dropdown). Auto-calculates Total. Footer: "Save" + "Cancel".

### Timer (Persistent Top Bar)

- [x] **Timer functionality**: The timer in the top bar shows elapsed time as "HH:MM:SS" (starts at "00:00:00"). Play button starts the timer (icon changes to Pause). Clicking Pause pauses it (icon back to Play). A stop button (Square icon) appears when timer is running or paused. Clicking Stop opens the Time Entry Modal with duration pre-filled from elapsed time, and description pre-filled from `timer.description`. Timer state persists in `state.timer` (isRunning, startTime, elapsed, matterId, description, billable). When running, timer ticks every second updating the display. A small dropdown on the timer lets user set the Matter and Description before/during timing. Timer survives page navigation (it is in the top bar which is always rendered).

### Calendar Page (`/calendar`)

- [x] **Page header**: "Calendar" title. Right: "New Event" primary button.

- [x] **View mode toggle**: Buttons for "Month" | "Week" | "Day" view. Default: Month.

- [x] **Month view**: Standard calendar grid. Header row: Sun Mon Tue Wed Thu Fri Sat. Each cell shows day number. Events rendered as small colored pills inside their date cell showing truncated title. Today's date highlighted with blue circle on the number. Days outside current month are grayed. Navigation: left/right arrows + month/year label (e.g. "April 2026"). Clicking an event opens event detail popover. Clicking empty day area opens "New Event" modal with that date pre-filled.

- [x] **Week view**: 7-column grid with hour rows (7 AM to 8 PM). Events rendered as positioned blocks spanning their time range, colored by `event.color`. Shows event title and time. Overlapping events display side by side. All-day events shown in a row above the time grid.

- [x] **Day view**: Single column with hour rows. Events as full-width blocks. More detail visible: title, description, location, attendees.

- [x] **Event detail popover**: Clicking an event shows a popover card with: title (bold), date/time range, location, matter link (blue), attendees list (user names), description. "Edit" and "Delete" buttons. Edit opens the event modal pre-filled. Delete shows confirmation then removes from state.

### Calendar Event Modal

- [x] **New/Edit Event modal**: Fields: Title (text, required), Description (textarea), Matter (searchable dropdown, optional), Location (text), Start Date/Time (date + time pickers), End Date/Time (date + time pickers), All Day (checkbox -- hides time pickers when checked), Attendees (multi-select of users), Reminder (dropdown: None, 15 min, 30 min, 1 hour, 1 day), Color (color picker with preset swatches). Footer: "Save" + "Cancel" (+ "Delete" if editing). On save: add/update state.calendarEvents.

### Tasks Page (`/tasks`)

- [x] **Page header**: "Tasks" title. Right: "New Task" primary button.

- [x] **Status toggle**: "Outstanding" | "Completed" tabs with counts.

- [x] **Filter bar**: Assignee dropdown (users), Priority filter (All / High / Normal / Low), Matter filter (dropdown), Due date filter (All / Overdue / Due Today / Due This Week / Due This Month).

- [x] **Tasks list**: White card containing task items. Each task item (44px row): checkbox on left (clicking toggles Outstanding/Completed), task name (bold, if completed shows strikethrough), matter name (gray text, clickable link), assignee name, priority badge (red for High, gray for Normal, blue for Low), due date (red text if overdue, gray otherwise). Completed tasks: green checkmark, muted text styling. Clicking task name opens inline expand showing description, with "Edit" and "Delete" links.

- [x] **Overdue indicator**: Tasks past their dueDate with status "Outstanding" show the date in red with a small warning icon.

### Task Creation Modal

- [x] **New/Edit Task modal**: Fields: Name (text, required), Description (textarea), Matter (searchable dropdown, optional), Assignee (dropdown of users, default current user), Priority (radio: High / Normal / Low, default Normal), Due Date (date picker), Task List (dropdown: "Litigation Prep", "Client Intake", "Administrative", or create new), Private (checkbox). Footer: "Save" + "Cancel". On save: add/update state.tasks.

### Billing Page (`/billing`)

- [x] **Page header**: "Billing" title. Right: "Generate Bill" primary button.

- [x] **Status filter tabs**: "All" | "Draft" | "Awaiting Approval" | "Sent" | "Paid" | "Overdue" | "Void". Each with count.

- [x] **Bills table**: White card table. Columns: Bill Number (blue link), Client, Matter, Status (badge), Issued Date, Due Date, Total Due ($), Amount Paid ($), Balance ($). Sortable. Clicking row navigates to `/billing/:id`. Overdue bills (status "Overdue" or dueDate past + not paid) have red text on due date.

- [x] **Summary bar**: Above the table, a row of summary cards: Total Outstanding (sum of balances for non-paid/void bills), Total Overdue (sum of overdue balances), Total Draft (sum of draft balances), Total Paid This Month.

### Bill Detail (`/billing/:id`)

- [x] **Bill header**: Bill number in large text, status badge, client name (link), matter name (link). Action buttons: "Edit" (for Draft only), "Send" (changes status to Sent), "Record Payment" (opens payment modal), "Void" (confirmation then sets status to Void).

- [x] **Bill body**: White card showing: (1) Firm info (from firmSettings: name, address). (2) Client info (name, address from contact). (3) Bill details (bill number, issued date, due date, payment terms). (4) Line items table: Description, Hours/Qty, Rate, Amount. Sub-sections for "Professional Services" (time entries) and "Expenses" (expense entries). (5) Summary section: Subtotal, Tax (if any), Total Due, Amount Paid, Balance Due (bold, large).

- [x] **Record Payment modal**: Fields: Amount (number, defaults to balance), Payment Date (date picker, defaults to today), Payment Method (dropdown: Check, Credit Card, Bank Transfer, Cash). On save: update bill's amountPaid and balance, set status to "Paid" if fully paid, mark associated activities as billed, show toast.

### Generate Bill Flow

- [x] **Generate Bill modal** (800px wide): Step 1: Select Matter (dropdown) and Client (auto-filled from matter). Date range for activities (From/To date pickers). Step 2: Shows all unbilled activities for the selected matter in the date range. Each row has a checkbox (default all checked). User can uncheck items to exclude. Shows running totals. Step 3: Review -- bill number (auto-generated as "INV-YYYY-NNN"), issued date, due date (auto-calculated from payment terms), memo field. Footer: "Create Bill" (creates bill in Draft status, marks selected activities as billed) + "Cancel".

### Documents Page (`/documents`)

- [x] **Page header**: "Documents" title. Right: "Upload Document" primary button.

- [x] **Folder sidebar**: Left panel (200px) showing folder tree: Discovery, Correspondence, Pleadings, Evidence, Administrative, All Documents. Clicking a folder filters the document list. "All Documents" selected by default. Each folder shows document count.

- [x] **Document table**: Right panel. Columns: Name (file type icon + name), Matter (blue link), Category (badge), Uploaded By, Date, Size. Search bar above table. Sortable columns. Clicking a document row shows a detail panel/card below with: name, description, matter, category, folder, uploaded by, dates, version number. "Edit" button to update metadata, "Delete" button with confirmation.

### Communications Page (`/communications`)

- [x] **Page header**: "Communications" title. Right: "New Communication" primary button.

- [x] **Filter bar**: Type filter (All / Email / Phone / Text / Portal), Direction filter (All / Incoming / Outgoing), Matter filter (dropdown), Date range filter.

- [x] **Communications table**: Columns: Direction icon (up-arrow outgoing, down-arrow incoming), Type badge, Subject (bold), From, To, Matter (blue link), Date. Clicking a row expands it inline to show the full body text, attachments info, and action buttons ("Reply" creates new outgoing comm, "Edit", "Delete").

### Notifications Dropdown

- [x] **Bell icon dropdown**: Clicking the bell icon in the top bar opens a dropdown panel (320px wide, max-height 400px, scrollable). Header: "Notifications" title + "Mark all as read" link. List of notification items, each showing: icon (based on type: clock for task_due, dollar for bill_overdue, calendar for event_reminder, briefcase for matter_update, file for document_shared), title text (bold if unread), message body, relative timestamp. Unread items have light blue-tinted background. Clicking a notification marks it read, closes dropdown, and navigates to the referenced entity. Badge count on bell = number of unread notifications.

### Recents Dropdown

- [x] **Recents dropdown**: Clicking "Recents" button in top bar shows a dropdown (280px wide). Two sections: "Recent Matters" (last 5 viewed matters, each showing matter number + description + status badge) and "Recent Contacts" (last 5 viewed contacts, showing name + type). Clicking an item navigates to it. Track recents in state: `recentMatters: string[]` and `recentContacts: string[]` (arrays of IDs, max 10 each). Updated whenever user visits a matter or contact detail page.

### Global Search

- [x] **Search functionality**: Typing in the top bar search input opens a dropdown results panel (400px wide). Searches across: matters (matterNumber, description), contacts (displayName, email), documents (name), tasks (name). Results grouped by type with section headers. Each result shows: entity icon, primary text (name/number), secondary text (description/email), type badge. Max 5 results per type. Clicking a result navigates to the entity. Pressing Enter with text navigates to a search results page showing all matches. Debounce search input by 300ms.

### Create New Dropdown

- [x] **"Create new" dropdown**: Clicking the "Create new" button in top bar opens a dropdown menu with options: "New Matter", "New Contact", "New Time Entry", "New Expense", "New Task", "New Calendar Event", "New Communication", "New Bill". Each option has an icon (matching sidebar icons). Clicking opens the respective creation modal.

---

## P2 -- Secondary Features

Depth and realism features. Implement after P1 is complete.

### Reports Page (`/reports`)

- [x] **Reports dashboard**: Page header "Reports". Grid of report cards: (1) "Billing Summary" -- bar chart showing billed vs collected by month (last 6 months). (2) "Productivity" -- bar chart showing billable hours by user this month. (3) "Matters by Practice Area" -- donut/pie chart. (4) "Accounts Receivable Aging" -- horizontal bar chart showing Outstanding 0-30 days, 31-60, 61-90, 90+ days. Each card is a white card with title, chart area (use simple CSS/SVG charts, no external chart library), and "View Full Report" link. Charts computed from state data.

### Settings Page (`/settings`)

- [x] **Settings layout**: Left sidebar with sections: Firm Information, Users & Permissions, Billing Defaults, Practice Areas, Activity Categories. Right content area shows selected section.

- [x] **Firm Information**: Form with firmSettings fields (name, address, phone, website). "Save" button updates state.firmSettings.

- [x] **Users & Permissions**: Table of users showing name, email, role, subscriber type. "Edit" opens modal to change role, hourly rate, permissions checkboxes (Administrator, Accounts, Reports, Billing). Not possible to edit user-1's admin status.

- [x] **Billing Defaults**: Default billing rate (number input), default payment terms (number), currency, date format. Save updates firmSettings.

- [x] **Practice Areas**: Editable list. Add new, rename, delete (with confirmation if matters use it). Drag to reorder.

- [x] **Activity Categories**: Same as practice areas -- editable list with add/rename/delete.

### Accounts Page (placeholder)

- [x] **Accounts page** (`/accounts`): Simple placeholder page with "Accounts" title and a message "Trust and operating accounts are not available in this demo." Shows a sample card with firm operating account info from firmSettings.

### Online Payments Page (placeholder)

- [x] **Online Payments page** (`/online-payments`): Placeholder with "Online Payments" title and message "Payment processing is not available in this demo." Show a sample payment link card with copy-to-clipboard button (non-functional but visually present).

### Inline Editing on Detail Pages

- [ ] **Inline field editing**: On matter detail Dashboard tab and contact detail Dashboard tab, hovering a field value shows a pencil icon. Clicking transforms the value into an editable input (text, select, textarea, or date picker depending on field type). Save (checkmark) and Cancel (X) buttons appear inline. On save: update entity in state, show toast "{Field} updated".

### Keyboard Shortcuts

- [x] **Global keyboard shortcuts**: `Ctrl+K` or `/` focuses search bar. `N` then `M` creates new matter. `N` then `T` creates new time entry. `N` then `C` creates new contact. `Escape` closes any open modal or dropdown.

### Toast Notifications

- [x] **Toast system**: A toast notification component that renders in the bottom-right corner. Shows success (green left border), error (red), info (blue) toasts. Auto-dismisses after 4 seconds. Shows on: entity created, entity updated, entity deleted, timer started/stopped, bill status changed. Stack up to 3 toasts vertically.

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching `assets/data_model.md` specs exactly.

- [x] **Users**: 4 users as specified (Sarah Chen, Marcus Rivera, Emily Park, David Okafor) with all fields from data_model.md section 1.

- [x] **Contacts**: 12 contacts (8 Person, 4 Company) as specified. Include realistic legal-world names, addresses, emails, phone numbers. Ensure Jane Grey (contact-1) has full detail matching screenshot 000005.jpg. Tag distribution: 4 Clients, 2 Opposing Counsel, 1 Judge, 1 Witness, 4 Company contacts with appropriate tags.

- [x] **Matters**: 10 matters (4 Open, 3 Pending, 3 Closed) across practice areas. Each linked to a client contact and responsible attorney. Include relatedContacts for litigation matters. Matter numbers formatted as "NNNNN-LastName-MM.YYYY". Realistic descriptions: "Assault & Battery", "Divorce Proceedings", "Slip and Fall Claim", "Corporate Merger Agreement", etc.

- [x] **Activities**: 30 time entries + 8 expense entries spread across matters and users. Mix of billed/unbilled. Various categories. Dates spread over last 3 months. Realistic descriptions matching legal work.

- [x] **Tasks**: 15 tasks (10 Outstanding, 5 Completed). Various priorities. Some overdue (dueDate in past). Linked to different matters. Realistic legal task names.

- [x] **Calendar Events**: 12 events spread across next 2 months. Mix of court dates, client meetings, deadlines, internal meetings. Some all-day, some timed. Include events for today and this week for dashboard display.

- [x] **Bills**: 8 bills (2 Draft, 1 Awaiting Approval, 2 Sent, 2 Paid, 1 Overdue). Each with realistic lineItems referencing activities. Correct totals computed from line items.

- [x] **Documents**: 15 documents across 5 matters. Distributed across folders. Realistic legal document names (discovery requests, motions, contracts, correspondence, evidence).

- [x] **Notes**: 10 notes across various matters. Realistic legal case notes (initial assessments, meeting summaries, research notes, strategy memos).

- [x] **Communications**: 12 communications across matters. Mix of Email/Phone/Text types, Incoming/Outgoing. Realistic subjects and body content.

- [x] **Notifications**: 8 notifications (4 unread). Types: task_due, bill_overdue, event_reminder, matter_update, document_shared. Reference existing entities.

- [x] **Timer**: Initial state: not running (isRunning: false, elapsed: 0).

- [x] **Firm Settings**: Meadow Law Group with all fields per data_model.md section 13.

- [x] **Folders**: 5 folders as specified (Discovery, Correspondence, Pleadings, Evidence, Administrative).

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login (app starts pre-logged-in as Sarah Chen, `user-1`)
- Real API calls or backend communication
- Actual file upload/download for documents
- Real email sending for communications
- Payment processing for online payments
- App integrations with third-party services
- Password or account management
- Encryption or security mechanisms
