# Xpensify Mock — TODO

> Status: ALL COMPLETE (P0+P1+P2)
> Last updated by: dev agent, 2026-03-12
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest Expensify_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`. No Tailwind — use plain CSS to match the classic Xpensify styling precisely.

- [x] **Visual design system**: Study `assets/screenshots/` — replicate the exact Xpensify Classic look:
  - **Sidebar background**: `#0E1B2A` (very dark navy blue)
  - **Primary action (buttons)**: `#03D47C` (vibrant green) with white text, border-radius 20px (pill shape)
  - **Active nav indicator**: `#0185FF` (bright blue), 3px left border on active sidebar item
  - **Text primary**: `#2E3440` (charcoal)
  - **Text secondary/muted**: `#8B959E` (gray)
  - **Background**: `#FFFFFF` (white main area)
  - **Borders/dividers**: `#E8ECF0` (light gray)
  - **Status badge colors**: Open=`#03D47C`, Closed=`#8B959E`, Processing=`#F5A623`, Approved=`#0B8043`, Reimbursed=`#E85E95`, Retracted/Deleted=`#D93025`
  - **Star/favorite**: `#F5A623` (gold)
  - **Font**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`
  - **Page title**: 28px, font-weight 700
  - **Table headers**: 12px, uppercase, font-weight 500, color `#8B959E`, letter-spacing 0.5px
  - **Body text**: 14px, font-weight 400
  - **Amount display**: Dollar portion 16px font-weight 600, cents portion 11px superscript

- [x] **App layout**: Three-zone layout matching screenshots exactly:
  - **Left sidebar**: Fixed, 220px wide, 100vh height, `#0E1B2A` background. Top section: circular avatar (80px, pink `#E85E95` background with white initials), email text below centered in white 13px. Navigation items vertically stacked with 48px height, 24px left padding, 14px white text, icon (20px) + 12px gap + label. Active item: blue `#0185FF` left border (3px), blue icon color. Bottom: "**Xpensify**" wordmark in bold white 18px, padding-bottom 24px.
  - **Main content**: Fills remaining width. Page title top-left (28px bold). Action buttons top-right. Scrollable content area below.
  - **Footer**: Inside main content at bottom — gray text links (OUR PRODUCT, UPGRADE, PRICING, JOBS, ABOUT US, BLOG, COMMUNITY, STATUS, PRIVACY, HELP) centered, copyright "© 2008-2024 Xpensify, Inc." right-aligned. Height ~60px, border-top 1px `#E8ECF0`.
  - **Concierge bubble**: Fixed position, bottom-right (20px offset), 56px blue `#0185FF` circle with white speech bubble icon, box-shadow, z-index 1000.

- [x] **Routing**: `App.jsx` with `BrowserRouter`, routes:
  - `/` → redirects to `/inbox`
  - `/inbox` → Inbox page
  - `/expenses` → Expenses list page
  - `/expenses/:id` → Expense detail (modal or page)
  - `/reports` → Reports list page
  - `/reports/:id` → Report detail page
  - `/settings` → Settings page (redirects to `/settings/workspace/pol_001/basics`)
  - `/settings/workspace/:policyId/:tab` → Settings with sub-tab (basics, connections, categories, tags, people, distance, reportfields, tax, exportformats)
  - `/go` → State inspector

- [x] **State management**: `AppContext.jsx` + `dataManager.js` using React Context. `dataManager.js` exports `createInitialData()` returning full state shape (see `data_model.md` for `createInitialData()` structure). Context provides `state` and `dispatch` (useReducer). Reducer handles actions: `SET_STATE`, `ADD_EXPENSE`, `UPDATE_EXPENSE`, `DELETE_EXPENSE`, `ADD_REPORT`, `UPDATE_REPORT`, `DELETE_REPORT`, `ADD_COMMENT`, `UPDATE_INBOX_ITEM`, `UPDATE_CATEGORY`, `UPDATE_TAG`, `UPDATE_MEMBER`, `UPDATE_POLICY`, `UPDATE_UI`, `SET_FILTERS`, `TOGGLE_EXPENSE_SELECTION`, `TOGGLE_REPORT_SELECTION`, `TOGGLE_REPORT_STAR`. Persist to `localStorage` key `expensify_mock_state`.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Computes `initial_state` (from `createInitialData()`), `current_state` (from context), `state_diff` (deep diff of the two). Renders as formatted JSON. Returns object shape `{ initial_state, current_state, state_diff }`.

- [x] **Session isolation**: `vite.config.js` mock-api plugin. Endpoints:
  - `POST /post?sid=<sid>` — accepts `{"action":"set","state":{...}}` (sets both initial + current), `{"action":"set_current","state":{...}}` (updates only current), `{"action":"reset"}` (resets to initial)
  - `GET /go?sid=<sid>` → returns `{initial_state, current_state, state_diff}`
  - `POST /upload?sid=<sid>` (multipart) → `{files: [{url, original_name, stored_name, size}]}`
  - `GET /files/<sid>/<filename>` → serves uploaded file
  Session data stored in-memory Map keyed by `sid`. `dataManager.js` provides `createSession(sid)`, `getSession(sid)`, `updateSession(sid, state)`, `resetSession(sid)`.

---

## P1 — Primary Features

Core features a user interacts with in the first 5 minutes. These are the interactive workflows that agents need to practice.

### Sidebar Navigation

- [x] **Sidebar nav items**: Four items, each with icon from lucide-react:
  - Inbox → `MessageCircle` icon (or custom speech bubble)
  - Expenses → `FileText` icon
  - Reports → `File` icon
  - Settings → `Settings` icon
  Clicking navigates to corresponding route. Active state: 3px blue left border, icon + text turn blue `#0185FF`. Hover state: slightly lighter background `rgba(255,255,255,0.05)`.
  Unread badge on Inbox: small green dot or count badge (top-right of icon) showing number of unread `inboxItems`.

### Inbox Page

- [x] **Inbox page layout** (`/inbox`): Title "Inbox" (28px bold). Main content is a vertical list of inbox item cards. Each card: white background, 1px border `#E8ECF0`, border-radius 8px, padding 20px, margin-bottom 12px. Card shows: left — from user avatar (40px circle) + name (bold 14px) + description (14px gray); right — timestamp (12px gray) + action button if `actionRequired` (green button "Review" or "Approve"). Unread items have a left 3px blue border.

- [x] **Concierge welcome card**: First item in inbox — special card with Concierge avatar (blue circle with triangle logo), "Concierge" name, welcome message, "Watch Demo" (outlined button) and "Call" (outlined button) in top-right of card. Below: setup prompt "Are you here to setup Xpensify for your business, or just yourself?" with two option cards: "Business" (suitcase icon, description) and "Individual" (piggy bank icon, description). These are clickable but just dismiss the card.

- [x] **Inbox item interactions**: Clicking an inbox item with `actionRequired: true` and `actionType: "approve_report"` navigates to `/reports/:relatedId`. Clicking marks the item as `read: true`. "Hide" action (three-dot menu → "Hide") sets `hidden: true` and removes from visible list. "Show Hidden Tasks" toggle at bottom toggles visibility of hidden items.

### Expenses Page

- [x] **Expenses page layout** (`/expenses`): Title "Expenses" (28px bold, top-left). "New Expense" green pill button top-right with down-chevron — clicking opens dropdown with 4 options: "Expense", "Distance", "Time", "Multiple". Each option opens the New Expense modal with corresponding tab pre-selected.

- [x] **Expenses filter bar**: Below title, blue link "⚙ Show Filters" (toggle). When expanded, shows a filter panel (white bg, 1px border, padding 16px, border-radius 4px) with:
  - Row 1: Merchant text input (placeholder "Merchant"), Date From (date picker), Date To (date picker), three toggle buttons (All / Billable / Reimbursable)
  - Row 2: Category multi-select dropdown ("All categories"), Tags multi-select dropdown ("All tags"), Policy dropdown ("All policies"), Card dropdown ("All cards")
  - Row 3: Status filter chips/checkboxes — Unreported (gray), Open (green), Processing (yellow), Approved (green-outline), Reimbursed (pink), Closed (gray), Deleted (red). Each is a small colored box + label, toggleable.
  - Row 4: "All expenses" dropdown (filter by "All" / "Unreported only" / "With reports")
  Applying any filter immediately re-filters the expense list below. "Reset" link clears all filters.

- [x] **Expenses table**: Below filter bar. View toggle buttons in top-right corner (4 icons: list bars, compact bars, grid, receipt icon). Default is list view.
  **List view columns** (sortable — click header to toggle asc/desc, sort arrow indicator):
  - Checkbox (16px, leftmost, select-all in header)
  - DATE — formatted "Mon DD" (e.g., "Nov 15"), 12px gray
  - MERCHANT — expense type icon (receipt=document icon, mileage=car icon, time=clock icon) + merchant name (14px, bold) on first line; below: status badge (pill, colored) + "Report Name #ID" link (12px gray, clickable navigates to report)
  - AMOUNT — dollar sign + whole dollars (16px semibold) + superscript cents (11px); below: currency badge if not USD
  - (receipt thumbnail — small 40x40px image placeholder, or empty)
  - (user avatar — 24px circle)
  - POLICY — policy name (14px)
  - CATEGORY — category name (14px)
  - DESCRIPTION — description text (14px), truncated with ellipsis
  Table rows: 70px height, hover background `#F5F7F9`, border-bottom 1px `#E8ECF0`. Clicking a row opens expense detail.

- [x] **Expense detail view**: Clicking an expense row opens a detail panel or modal showing: full merchant name, amount with currency, date, category (dropdown — editable), tag (dropdown — editable), description (textarea — editable), receipt image (placeholder), billable toggle, reimbursable toggle, report assignment (link to report or "Unreported"), policy name, comments section. "Save" button (green) and "Delete" button (red outline). Changes update state immediately.

- [x] **View toggle — Compact view**: Same columns as list but rows are 48px, no expense type icon, no receipt thumbnail, smaller font (13px). More data visible at once.

- [x] **View toggle — Grid view**: Expenses displayed as cards in a CSS grid (3-4 columns). Each card: white bg, border, border-radius 8px, padding 16px. Shows: receipt image placeholder (full width, 120px height, gray bg), merchant name (bold), amount (bold, green), date (gray), category pill badge, status pill badge.

- [x] **Expenses pagination**: Bottom of table — "Expenses 1 to N" text right-aligned, with left-arrow and right-arrow icon buttons. Show 25 items per page by default.

### Reports Page

- [x] **Reports page layout** (`/reports`): Title "Reports" (28px bold). "New Report" green pill button (top-right) with dropdown chevron. "Export to" button (gray outline, top-right, left of New Report) with dropdown (CSV, PDF, Excel). "⚙ Show Filters" blue toggle link.

- [x] **Reports filter bar**: Similar to expenses filters but with report-relevant fields: Date From, Date To, Policy dropdown, Status checkboxes (Open, Submitted, Approved, Reimbursed, Closed, Archived).

- [x] **Reports table**: Sortable columns:
  - Checkbox (select-all in header)
  - NAME — star icon (gold `#F5A623` filled if starred, gray outline if not; clickable to toggle) + report name text (14px, e.g., "Expense Report #77324820"); below name: if retracted, red "RETRACTED" label. The entire text clickable → navigates to report detail.
  - TOTAL — status badge (pill) on top line, amount below (16px bold dollars + 11px superscript cents)
  - POLICY — policy name (14px)
  - FROM — email address (14px, truncated)
  - TO — email address (14px, truncated)
  - SUBMITTED — date (14px, e.g., "Jul 15, 2024") or empty
  - EXPORTED — date or empty
  Rows: 80px height (status + amount stacked), hover background, border-bottom.

- [x] **Star/favorite toggle on reports**: Clicking the star icon toggles `starred` boolean on the report. Star icon: 16px, `#F5A623` gold fill when starred, `#C4C9D1` stroke when unstarred. Update state immediately via `TOGGLE_REPORT_STAR` action.

- [x] **Reports pagination**: Same pattern as expenses — "Reports 1 to N" with prev/next arrows, 25 per page.

### Report Detail Page

- [x] **Report detail page** (`/reports/:id`): Full-page view showing:
  - **Header**: Status badge (large pill, 24px), "ID: {reportNumber}" (gray text), Policy name (right-aligned). Report title (20px bold, e.g., "NYC Client Visit - November 2024"). Total amount right-aligned (24px bold).
  - **Submitter info**: From avatar (40px) + name + "Date: Nov 15 to Nov 16, 2024"
  - **Expense table within report**: Columns: Date, Merchant, receipt icon button, Total. Each row is an expense belonging to this report. Rows clickable → open expense detail modal.
  - **Report total**: Sum line at bottom of expense table, right-aligned bold.
  - **Report History & Comments section**: Timeline of events — each entry shows avatar (32px), timestamp (gray 12px), text. System events ("You created this report", "Report submitted", "Report approved") in gray italic. User comments in regular text. Comment input box at bottom: textarea + "Add Comment" button. Adding a comment creates a new Comment entity and appends to timeline.
  - **Receipt Thumbnails section**: Grid of receipt thumbnail images from the report's expenses. Each thumbnail: 150x120px, border, border-radius 4px, shows date + merchant + total below image.
  - **Action buttons**: For reports with status "submitted" and current user is approver: "Approve" (green button) and "Reject" (red outline button). Approve changes status to "approved", creates system comment. Reject changes status to "open" (retracted), adds system comment. For "open" reports owned by current user: "Submit" button — changes status to "submitted", sets submittedDate.

### New Expense Modal

- [x] **New Expense modal**: Triggered by "New Expense" button → option selection. Modal overlay (dark semi-transparent backdrop), centered white card (640px wide, auto height, max 80vh with scroll), border-radius 8px.
  - **Header**: "New Expense" title (18px bold), X close button (top-right)
  - **Tab bar**: 4 tabs horizontally — "Expense", "Distance", "Time", "Multiple". Active tab: bold text, bottom border 2px blue `#0185FF`. Inactive: gray text.

- [x] **Expense tab (default)**: Form fields stacked vertically, 16px gap:
  - Date: date input (default today)
  - Merchant: text input (placeholder "Merchant name")
  - Amount: number input + currency dropdown (default USD) side-by-side
  - Category: dropdown populated from categories list (required if policy.requiresCategory)
  - Tag: dropdown populated from tags list
  - Description: textarea (3 rows)
  - Billable: toggle switch
  - Reimbursable: toggle switch (default on)
  - Receipt: "Upload Receipt" button (simulated — clicking adds a placeholder receipt)
  - **"Save" button** (green, full-width at bottom): Creates new expense via `ADD_EXPENSE` action with generated ID, status "unreported", current user as creator. Closes modal. Shows expense in list.

- [x] **Distance tab**: Form fields:
  - Date: date input
  - Distance: number input + unit dropdown (mi/km)
  - Rate: read-only, pulled from policy's distanceRate (e.g., "$0.67 / mi")
  - Calculated amount: read-only (distance × rate)
  - Category: auto-set to "Mileage"
  - Description: textarea
  - Save creates expense with `type: "distance"`, computed amount.

- [x] **Time tab**: Form fields:
  - Date: date input
  - Hours: number input (e.g., "8")
  - Hourly Rate: number input (e.g., "$120.00")
  - Calculated amount: read-only (hours × rate)
  - Category: dropdown
  - Description: textarea
  - Save creates expense with `type: "time"`, computed amount.

- [x] **Multiple tab**: Spreadsheet-like bulk entry grid:
  - Columns: Date, Merchant, Total, Tax, Category (dropdown), Description
  - 10 empty rows by default, each row is an inline-editable form
  - "Reset" button (bottom-left, gray outline) clears all rows
  - "Save" button (bottom-right, green) creates multiple expenses at once from filled rows (skip empty rows)
  - Each row: 40px height, cells have 1px border, no padding. Date cell: date input. Merchant: text input. Total: number input prefixed "$". Tax: number input. Category: mini dropdown. Description: text input.

### New Report Modal

- [x] **New Report modal**: Triggered by "New Report" button. Modal with fields:
  - Report Name: text input (placeholder "Expense Report #[auto-number]" — auto-generate 8-digit number)
  - Policy: dropdown (populated from policies list)
  - **Unreported expenses list**: Show all expenses with `reportId: null` as a checklist. Each row: checkbox + merchant + date + amount. User selects which unreported expenses to include.
  - "Create Report" green button: Creates report via `ADD_REPORT` action, assigns selected expenses' `reportId` to new report, computes total. Navigates to `/reports/:newId`.

### Settings Page

- [x] **Settings page layout** (`/settings/workspace/:policyId/:tab`): Two-panel layout inside main content area:
  - **Left sub-nav panel** (240px wide, white bg, right border `#E8ECF0`): Policy name at top (16px bold) with hamburger menu icon. Below: vertical nav links (14px), 40px height each, left padding 16px. Active link: blue `#0185FF` text, blue left border. Links:
    - Basics
    - Connections
    - Categories
    - Tags
    - People
    - Distance and Time
    - Report Fields
    - Tax
    - Export Formats
  - **Right content panel**: Fills remaining width, padding 24px. Content depends on active tab.

- [x] **Settings — Basics tab**: Form fields:
  - Workspace Name: text input (editable)
  - Output Currency: dropdown (USD, EUR, GBP, CAD, AUD, JPY, etc.)
  - Auto-Reporting: toggle + frequency dropdown (Daily, Weekly, Monthly, Trip, Manual)
  - Require Category: toggle
  - Require Tag: toggle
  - Require Comments: toggle
  - Max Expense Age: number input (days)
  - Max Expense Amount: number input (dollars)
  - Prevent Self-Approval: toggle
  - Approval Mode: radio buttons (Basic, Advanced)
  - Reimbursement: radio buttons (Manual, ACH, No Reimbursement)
  - "Save" button. Changes update policy via `UPDATE_POLICY` action.

- [x] **Settings — Categories tab**: Top: checkbox "People must categorize expenses" (bound to `policy.requiresCategory`). Below: table with columns: enabled toggle (green circle icon), Name, GL Code (editable inline), Payroll Code (editable inline). Each row is a category. "Add Category" button at bottom opens inline row for new category entry (name + GL code + payroll code). Clicking enabled icon toggles `category.enabled`. Save updates via `UPDATE_CATEGORY`.

- [x] **Settings — Tags tab**: Table of tags with columns: enabled toggle, Name, GL Code. "Add Tag" button. Same interaction pattern as Categories. Tags can be hierarchical (colon-separated display).

- [x] **Settings — People tab**: Table of workspace members with columns: Avatar (circle), Name, Email, Role (dropdown: Admin/Member/Auditor), Manager (dropdown of other members or "None"), Employee ID (text). "Invite" button opens a simple form (email input + role dropdown + "Send Invite" button — just adds to members list). Role changes update via `UPDATE_MEMBER`.

- [x] **Settings — Distance and Time tab**: Distance section: table with Rate (editable number, cents per mile/km), Unit (dropdown mi/km), Currency, Enabled toggle. Time section: default hourly rate input. "Save" button updates via dispatch.

- [x] **Settings — Report Fields tab**: List of custom report fields. Each shows: Name, Type (text/dropdown/date), Required toggle, Values (for dropdown — comma-separated, editable). "Add Field" button opens inline form: name input, type dropdown, required toggle, values textarea (for dropdown type). Delete button (trash icon) per field.

- [x] **Settings — Tax tab**: Table of tax rates: Name, Rate (percentage), Default radio button, Enabled toggle. "Add Tax Rate" button. Editing is inline.

---

## P2 — Secondary Features

Depth and realism, implement after P1 is solid.

- [x] **Expense bulk actions**: When expenses are selected (checkboxes), a bulk action bar appears at top: "N selected" text + "Delete" button (red) + "Add to Report" dropdown (lists existing open reports) + "Categorize" dropdown. Bulk delete removes selected expenses. Bulk "Add to Report" assigns `reportId`. Bulk "Categorize" sets category on all selected.

- [x] **Report bulk actions**: When reports are selected: "N selected" text + "Export" dropdown (CSV, PDF) + "Delete" button. Export generates a simulated file download (CSV blob with report data).

- [x] **Expense sorting**: Clicking any table header column sorts the expense list by that field. Toggle between ascending (↑) and descending (↓). Current sort shown with arrow icon next to header text. Default: date descending.

- [x] **Report sorting**: Same pattern — clicking any header sorts. Default: name descending.

- [x] **Search/filter persistence**: Filters and sort state persist in URL query params and in state. Navigating away and back retains filters.

- [x] **Settings — Connections tab**: List of available integrations (QuickBooks, Xero, NetSuite, Sage Intacct). Each shown as a card with logo placeholder, integration name, "Connect" button (green outline). Clicking shows a modal saying "Connection simulated — this is a mock environment." with "OK" button. Visual only, no real connection.

- [x] **Settings — Export Formats tab**: Textarea for export template format string (Freemarker-like). "Default CSV", "Default PDF" options as radio buttons. "Save" button. Read-only preview of what export would look like.

- [x] **Expense violation indicators**: Expenses that violate policy rules (e.g., `amount > policy.maxExpenseAmount` or `category === null && policy.requiresCategory`) show a yellow warning triangle icon + tooltip "Policy violation: [reason]". Violations calculated dynamically from policy settings.

- [x] **Concierge floating button**: Bottom-right blue circle. Clicking opens a small chat panel (300px wide, 400px tall, bottom-right anchored) with a few static Concierge messages: "Hi Sarah! 👋 How can I help?", "You have 2 reports awaiting your approval.", "Tip: Use SmartScan to capture receipts instantly." Input box at bottom (disabled with "This is a mock" placeholder).

- [x] **Responsive behavior**: Sidebar collapses to icon-only (60px) when viewport < 1024px. Main content takes full width. Hamburger menu in top-left toggles sidebar overlay.

- [x] **Empty states**: When expense list is empty: centered illustration + "No expenses yet" heading + "Create your first expense" subtext + green "New Expense" button. Same for reports: "No reports yet" + "Create your first report". Inbox empty: "All caught up!" message.

- [x] **Keyboard shortcuts**:
  - `N` then `E` → open New Expense modal
  - `N` then `R` → open New Report modal
  - `Escape` → close any open modal
  - `?` → show keyboard shortcuts help overlay

- [x] **Export to CSV**: "Export to" button on Reports page generates a CSV file download containing the visible/selected reports with columns: Report Name, Total, Policy, Status, From, Submitted, Exported. Uses `Blob` + `URL.createObjectURL` for download.

- [x] **Receipt view toggle**: Fourth view option on Expenses page. Shows expenses as a wall of receipt thumbnails (200x250px cards). Each card: receipt image placeholder (gray with receipt icon), merchant name below, amount, date. Clicking opens expense detail.

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching these specs. See `data_model.md` for full field definitions.

- [x] **Users**: 6 users (see data_model.md §Users table). Current user: Sarah Chen (usr_001, admin).
- [x] **Policies**: 2 policies — "Acme Corp Expenses" (corporate) and "Sarah's Personal Expenses" (personal). See §Policies.
- [x] **Categories**: 15 categories for corporate policy (Airfare, Hotel, Car Rental, Ground Transport, Meals, Office Supplies, Software, Professional Services, Communication, Mileage, Equipment, Training, Utilities, Dues, Miscellaneous). See §Categories.
- [x] **Tags**: 6 tags (Project Alpha, Project Beta, Client: Globex, Client: Initech, Internal, Conference). See §Tags.
- [x] **Expenses**: 15 expenses with varied merchants, amounts ($11.68 to $960.00), categories, statuses (unreported, open, approved, reimbursed, closed), dates (Oct-Dec 2024), types (expense, distance, time). 3 unreported expenses. See §Expenses.
- [x] **Reports**: 5 reports with varied statuses (2 open, 1 approved, 1 reimbursed, 1 closed), realistic titles, computed totals, date ranges. See §Reports.
- [x] **Comments**: 8 comments across reports — mix of system events ("You created this report", "Report submitted", "Report approved", "Reimbursement processed via ACH") and user comments. See §Comments.
- [x] **Inbox items**: 6 items — 2 report submissions awaiting approval (unread, actionRequired), 1 policy violation (unread), 1 approval notification (read), 1 Concierge welcome (read), 1 setup task (unread). See §InboxItems.
- [x] **Members**: 6 members matching users, with roles (1 admin, 5 employees), manager assignments. See §Members.
- [x] **Report fields**: 3 custom fields (Department dropdown, Project Code text, Trip End Date). See §ReportFields.
- [x] **Distance rates**: 1 rate — $0.67/mile (IRS standard). See §DistanceRates.
- [x] **Tax rates**: 3 rates — No Tax (default, 0%), Sales Tax (8.25%), VAT (20%). See §TaxRates.

---

## Out of Scope

Dev must NOT implement these.

- Authentication / login (app starts pre-logged-in as Sarah Chen, sarah.chen@acmecorp.com, admin role)
- Real SmartScan / OCR receipt processing (receipt "upload" adds a placeholder)
- Real payment processing / ACH transfers (status changes are state-only)
- Real accounting software integration (Connections page is visual only)
- Real email/SMS notifications
- File uploads to real servers (receipt images are placeholders or local blobs)
- Real currency conversion
- Real Concierge AI responses
- Mobile-specific layouts (focus on desktop ≥1200px viewport)
