# XDP Workforce Now Mock — TODO

> Status: P0 + P1 + Data Seed COMPLETE — P2 deferred
> Last updated by: dev agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] Project scaffold: `npm create vite@latest adp_mock -- --template react`, install deps (`react-router-dom`). Set up directory structure: `src/components/`, `src/pages/`, `src/context/`, `src/utils/`.

- [x] **Visual design system**: XDP uses a corporate HR/payroll aesthetic. Study `assets/screenshots/000004.jpg` (navigation), `assets/screenshots/000010.jpg` (benefits cards), and `assets/screenshots/000005.jpg` (pay stub). Exact palette: Primary Red `#D0271D` (XDP brand red — logo, primary CTAs, active nav underline), Dark Navy `#1F2937` (top nav background, headings), White `#FFFFFF` (card backgrounds, main content), Light Gray `#F3F4F6` (page background behind cards), Medium Gray `#6B7280` (secondary text, labels), Border Gray `#E5E7EB` (card borders, dividers, table lines), Success Green `#059669` (approved badges, positive amounts), Warning Amber `#D97706` (pending badges), Info Blue `#2563EB` (links). Font: system sans-serif (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`). Body text 14px/400. Headings 600 weight. All cards have `border-radius: 8px`, `box-shadow: 0 1px 3px rgba(0,0,0,0.1)`.

- [x] **App layout**: Full-width top navigation bar (56px height, `#1F2937` background). Below that, a secondary nav area (if on a sub-section page, shows breadcrumb and section tabs). Main content area with `#F3F4F6` background, max-width 1200px centered, 24px padding. No persistent sidebar — XDP uses top nav with dropdown menus (see screenshot 000004.jpg: HOME, RESOURCES, MYSELF tabs in the top bar, clicking MYSELF opens a dropdown flyout).

- [x] **Top Navigation Bar**: Left side: XDP logo (red "xdp" wordmark in bold, or just the text "XDP" in `#D0271D` bold 24px). Center: nav tabs — "Home", "Myself", "My Team" (each is a clickable tab, active tab has red underline). Right side: icon buttons — Notifications (bell icon with red badge count), Search (magnifying glass), User profile dropdown (avatar circle with initials "SJ", clicking shows: "Sarah Johnson", "Settings", divider, "Sign Out" which is non-functional).

- [x] **MYSELF dropdown navigation**: When "Myself" tab is active or hovered, show a dropdown flyout menu (white background, shadow, 280px wide) with sections: **My Information** (links to profile page), **Pay** (links: Pay Statements, Tax Statements (W-2), Direct Deposit), **Time & Attendance** (links: My Timecard, My Schedule, Attendance), **Time Off** (links: Request Time Off, Time Off Balances, Holiday Calendar), **Benefits** (links: My Benefits, My Dependents). Each section header is bold, sub-links are regular weight with left padding. See screenshot 000004.jpg for exact layout.

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes: `/` (Dashboard/Home), `/myself/info` (My Information/Profile), `/myself/pay` (Pay Statements list), `/myself/pay/:id` (Pay Statement detail), `/myself/tax` (Tax Documents), `/myself/direct-deposit` (Direct Deposit), `/myself/time` (Timecard), `/myself/schedule` (My Schedule), `/myself/attendance` (Attendance), `/myself/timeoff` (Time Off main — balances + request), `/myself/timeoff/request` (Request Time Off form), `/myself/timeoff/history` (Time Off History), `/myself/timeoff/holidays` (Holiday Calendar), `/myself/benefits` (My Benefits), `/myself/dependents` (My Dependents), `/my-team` (Team overview), `/my-team/approvals` (Pending Approvals), `/go` (State Inspector).

- [x] **State management**: `src/context/AppContext.jsx` providing global state via React Context. `src/utils/dataManager.js` with `createInitialData()` function returning all seed data (see `assets/data_model.md` for complete structure). State stored in localStorage under key `adp_mock_state`. On first load, initialize from `createInitialData()`. Export `getState()`, `setState()`, `resetState()`, `getInitialState()`, `getStateDiff()`.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` mapped to `/go` route. Renders JSON with `{ initial_state, current_state, state_diff }`. Uses `dataManager.getInitialState()`, `dataManager.getState()`, and `dataManager.getStateDiff()`. Display as formatted JSON in a `<pre>` tag.

- [x] **Session isolation**: Configure `vite.config.js` with a mock-api plugin. Handle `POST /post?sid=<sid>` with actions: `set` (sets both initial + current state), `set_current` (updates only current state), `reset` (resets to initial). Handle `GET /go?sid=<sid>` returning `{initial_state, current_state, state_diff}`. Session state keyed by `sid` in localStorage (key: `adp_mock_state_<sid>`). When `sid` query param is present, all state operations use the sid-specific key.

---

## P1 — Primary Features

Core interactive workflows an agent would use in the first 5 minutes.

### Dashboard / Home (`/`)

- [x] **Welcome banner**: Full-width card at top of dashboard. Shows "Good morning, Sarah!" (time-appropriate greeting), today's date formatted as "Thursday, April 10, 2026", and a subtitle "Here's what's happening today". White background card with subtle left-border accent in `#D0271D`.

- [x] **Quick action buttons row**: Horizontal row of 3 action cards below welcome banner: (1) "Clock In/Out" with clock icon — shows current status ("Clocked in since 8:02 AM" in green or "Not clocked in" in gray), clicking navigates to `/myself/time`; (2) "Request Time Off" with calendar icon, clicking navigates to `/myself/timeoff/request`; (3) "View Pay Statement" with dollar icon, clicking navigates to `/myself/pay`. Each card: white background, 100px height, icon on left, text on right, hover lifts with shadow.

- [x] **Pay summary card**: Left column card showing: "Last Pay" header, pay date "Mar 28, 2026", net pay "$2,487.32" in large bold font, "Gross: $3,653.85" in smaller gray text, "Next pay date: Apr 11, 2026" footer. "View Details" link navigates to `/myself/pay/pay-001`.

- [x] **Time off balances card**: Left column card below pay summary. Shows 3 horizontal bars: Vacation (12 of 20 days — 60% filled, blue bar), Sick (8 of 10 — 80% filled, green bar), Personal (2 of 3 — 67% filled, amber bar). Each shows "X days available" text. "View All" link → `/myself/timeoff`.

- [x] **To-do items card**: Right column card. Header "To-Do (3)" with count badge. List of action items, each showing: checkbox circle, title, due date in gray, and a right-arrow icon linking to relevant page. Items: "Submit timecard for week of 4/7" (due Apr 11), "Review updated remote work policy" (due Apr 15), "Complete annual compliance training" (due Apr 30). Clicking checkbox marks item completed (strikethrough + green check). Clicking the item navigates to its `link` URL.

- [x] **Company announcements card**: Right column card below to-dos. Header "Company News". Scrollable list (max 4 visible, rest scrollable) of announcement cards. Each shows: colored category badge (Benefits=red, Company=blue, Policy=gray, Events=green), title (bold), date, and first line of content truncated. Unread items have a blue dot indicator. Clicking expands to show full content inline.

- [x] **Notification bell dropdown**: Clicking bell icon in top nav opens a dropdown panel (320px wide, max 400px tall, scrollable). Header "Notifications" with "Mark all read" link. Each notification: bold title, message body, relative timestamp ("2 hours ago"), unread items have light blue background. Clicking a notification marks it read and navigates to its `actionUrl`. Badge on bell shows count of unread notifications.

### Pay Section

- [x] **Pay Statements list** (`/myself/pay`): Page header "Pay Statements". Data table with columns: Pay Date, Pay Period, Gross Pay, Deductions, Net Pay. Each row is clickable → navigates to `/myself/pay/:id`. Most recent pay at top. Rows alternate white/light gray backgrounds. Amounts right-aligned, formatted as currency. Show 6 pay statements (3 months of biweekly pay). Above table: filter by year dropdown (default: 2026).

- [x] **Pay Statement detail** (`/myself/pay/:id`): Back button "← Back to Pay Statements". Header showing company name "Acme Corporation", pay period dates, pay date. Three sections in cards: (1) **Earnings** table — columns: Type, Hours, Rate, Current, YTD. Rows: Regular (80 hrs), Overtime if applicable. Totals row bold. (2) **Deductions** table — columns: Type, Current, YTD. Rows: Medical, Dental, Vision, 401(k). Totals row. (3) **Taxes** table — columns: Type, Current, YTD. Rows: Federal Income Tax, State Income Tax (CA), Social Security, Medicare. Totals row. Bottom summary: Gross Pay, Total Deductions, Total Taxes, **Net Pay** (large, bold). "Print" button in top-right corner (opens browser print dialog).

- [x] **Tax Documents** (`/myself/tax`): Page header "Tax Statements". Table with columns: Year, Document Type, Employer, Available Date, Action. Show W-2 for 2025 and 2024. Action column has "View" button (opens a modal showing a simplified W-2 summary with employer info, wages, federal/state tax withheld) and "Download" button (simulated — shows toast "Download started").

- [x] **Direct Deposit** (`/myself/direct-deposit`): Page header "Direct Deposit". Card showing current setup: bank name, account type, masked routing/account numbers, deposit type (percentage or flat amount), primary indicator. "Edit" button opens modal with form fields: Bank Name (text), Routing Number (text, 9 digits), Account Number (text), Account Type (radio: Checking/Savings), Deposit Type (radio: Percentage/Flat Amount), Amount (number input). "Add Account" button adds another deposit row. "Save" updates state, "Cancel" closes modal.

### Time & Attendance

- [x] **Timecard** (`/myself/time`): Page header "My Timecard". Top area: prominent clock in/out button — large rounded button, green background when clocked out ("Clock In"), red when clocked in ("Clock Out"), shows current clock status and duration. Below: week selector (← Previous Week | "Apr 7 – Apr 11, 2026" | Next Week →). Weekly grid table: columns: Day, Date, Clock In, Clock Out, Break (min), Total Hours, Status. Each row for Mon-Fri. Clicking a time cell opens an inline edit (time picker input). Empty cells (like current day Friday if not yet filled) show "—". Status column shows colored badge: "Approved" (green), "Submitted" (blue), "Not Submitted" (gray). Bottom: Total Hours for week (sum), "Submit Timecard" button (only active if all days filled and status is "Not Submitted"). Submitting changes status to "Submitted" and shows success toast.

- [x] **Clock In/Out interaction**: When clicking "Clock In": set `clockStatus.isClockedIn = true`, `clockStatus.lastClockIn` to current time, add new TimeEntry for today with `clockIn` set. When clicking "Clock Out": set `clockStatus.isClockedIn = false`, `clockStatus.lastClockOut` to current time, update today's TimeEntry with `clockOut` and calculate `totalHours`. Button pulses briefly on click. Show confirmation toast: "Clocked in at 8:02 AM" or "Clocked out at 5:15 PM — Total: 8h 13m".

- [x] **My Schedule** (`/myself/schedule`): Page header "My Schedule". Weekly calendar view showing the employee's assigned shift for each day. Each day cell shows: shift time range ("8:00 AM - 5:00 PM"), total hours, and break. Non-work days (Sat/Sun) are grayed out. Week navigator at top.

### Time Off

- [x] **Time Off overview** (`/myself/timeoff`): Page header "Time Off". Top section: 3 balance cards side by side (Vacation, Sick, Personal). Each card shows: type name, circular progress indicator (available/total), "X of Y days" text, "Available: X days" prominent, accrual rate in small text. Below cards: "Request Time Off" primary button (navigates to `/myself/timeoff/request`). Below button: recent time-off requests table (last 5) with columns: Type, Dates, Hours, Status, Actions. Status badges: green "Approved", amber "Pending", red "Denied". Pending requests show "Cancel" action button.

- [x] **Request Time Off form** (`/myself/timeoff/request`): Page header "Request Time Off". Form card with: Time Off Type dropdown (Vacation, Sick, Personal), Start Date (calendar date picker), End Date (calendar date picker), Hours per Day (number input, default 8), calculated Total Hours display (auto-computed from date range × hours/day, excluding weekends and holidays), Notes textarea (optional). Bottom: "Submit Request" primary button and "Cancel" secondary button. On submit: validate dates (end >= start, not in past, not on holidays), create new TimeOffRequest with status "Pending", update the relevant TimeOffBalance's `pendingDays`, show success toast "Time off request submitted", navigate back to `/myself/timeoff`. On cancel: navigate back.

- [x] **Time Off History** (`/myself/timeoff/history`): Full history table of all time-off requests. Columns: Request Date, Type, Start Date, End Date, Total Hours, Status, Reviewed By, Actions. Sortable by date. Filter by type dropdown and status dropdown. Pending requests show "Cancel Request" button which opens confirmation dialog, then removes the request and restores pending days to balance.

- [x] **Holiday Calendar** (`/myself/timeoff/holidays`): Page header "Company Holidays — 2026". Clean list/table showing all 10 company holidays: date, day of week, holiday name. Past holidays are slightly grayed out. Current/next holiday is highlighted with a subtle indicator.

### Benefits

- [x] **My Benefits** (`/myself/benefits`): Page header "My Benefits". Cards for each benefit plan (see screenshot 000010.jpg for card-based layout). Each card shows: category icon (medical=shield, dental=tooth icon, vision=eye icon, life=heart, 401k=piggy bank — use emoji or simple SVG), plan name, coverage level, employee cost per pay period, employer contribution, effective date, and list of covered dependents. Cards are clickable to expand/collapse showing more details. Top of page: "Benefits Effective Date: January 1, 2026" subtitle. Bottom section: total employee cost per pay period (sum of all plan costs).

- [x] **My Dependents** (`/myself/dependents`): Page header "My Dependents". Table/card list of dependents. Each shows: name, relationship, date of birth, SSN (masked), covered plans (as badges). "Add Dependent" button opens a modal form with: First Name, Last Name, Relationship (dropdown: Spouse, Child, Domestic Partner), Date of Birth (date picker), SSN (text input, auto-masks). "Edit" button on each row opens pre-filled modal. "Remove" button shows confirmation dialog. Adding/editing/removing updates state.

### My Information (Profile)

- [x] **Personal Information** (`/myself/info`): Page header "My Information" with "Employee ID: EMP-2847" subtitle. Two-column layout. Left column "Personal Details" card: Full Name, Date of Birth (display only), Employee ID (display only), Hire Date (display only), Job Title, Department, Division, Manager, Work Location, Employment Status, Pay Rate (masked by default, click to reveal). Right column "Contact Information" card: Home Address (multi-line), Phone Number, Email Address. Each editable field has a pencil icon. Clicking "Edit" on a card section opens fields as editable inputs with Save/Cancel buttons. Saving updates state and shows success toast.

- [x] **Emergency Contacts section** (on `/myself/info` page, below contact info): Card showing emergency contacts list. Each contact: name, relationship, phone, email, primary indicator badge. "Add Emergency Contact" button opens modal with Name, Relationship (dropdown), Phone, Email fields. Edit/Remove buttons on each contact.

---

## P2 — Secondary Features

Depth features — implement after P1 is solid.

### My Team (Manager View)

- [ ] **Team Roster** (`/my-team`): Page header "My Team". Table of direct reports: Name (with avatar initials), Job Title, Department, Email, Status (Active badge). Clicking a name opens a detail panel/card showing full info.

- [ ] **Pending Approvals** (`/my-team/approvals`): Page header "Pending Approvals". Two sections: **Time Off Requests** — cards showing: employee name + avatar, request type, dates, total hours, with "Approve" (green) and "Deny" (red) buttons. Approving moves request to "Approved" status, denying opens a modal for denial reason. **Timecard Approvals** — similar cards for timecard submissions. Approve/deny updates the respective status in state.

- [ ] **Team Calendar** (accessible from My Team): Monthly calendar view showing team members' approved time off, with color-coded bars per person. Helpful for managers to see coverage.

### Search

- [ ] **Global search**: Clicking search icon in top nav opens a search overlay/modal. Text input with placeholder "Search pay statements, time off, benefits...". Searches across: pay statement dates/amounts, time-off requests, benefit plan names, employee directory names. Results grouped by category with clickable links. Typing filters results in real-time (client-side).

### Employee Directory

- [ ] **Employee Directory**: Searchable list of ~20 employees (direct reports + other department members from seed data). Each shows avatar, name, title, department, email, phone. Search/filter by name or department. Click opens profile card with full details.

### Notifications & Messages

- [ ] **Notifications panel enhancements**: "Settings" link in notification dropdown opens notification preferences. Preference toggles: Email notifications (on/off), Push notifications (on/off), Notification types: Pay statements, Time off updates, Timecard reminders, Company announcements.

### Settings

- [ ] **Settings page** (from user profile dropdown): Display preferences: date format (MM/DD/YYYY vs DD/MM/YYYY), time format (12hr vs 24hr). These preferences are stored in state and applied globally.

---

## Data Seed (implement in createInitialData())

See `assets/data_model.md` for complete field definitions and the `createInitialData()` structure.

- [x] **Employee**: 1 record — Sarah Johnson, Senior Software Engineer, Engineering dept, hired 2021-03-15, $95K salary, biweekly pay
- [x] **Pay Statements**: 6 biweekly records (Jan 17 through Mar 28, 2026). Each with: Regular earnings (80hrs × $45.67 = $3,653.85 gross), standard deductions (Medical $187.50, Dental $42.00, Vision $18.00, 401k $182.69 = 5% of gross), standard taxes (Federal ~$548, State CA ~$219, SS ~$226, Medicare ~$53). One statement includes 4hrs overtime. Net pay ~$2,487 per period. YTD totals accumulate correctly.
- [x] **Time Entries**: 9 records — full work week Apr 1-4 (Approved, ~8hrs each) + current partial week Apr 7-10 (Submitted, ~8hrs each, Friday empty). Varying clock-in times (8:00-8:15) for realism.
- [x] **Time Off Requests**: 4 records with mixed statuses — 1 Pending future vacation (Apr 21-25), 1 Approved past vacation (Feb 16-20), 1 Approved sick day (Jan 13), 1 Denied personal day (Mar 31).
- [x] **Benefits**: 5 plans — Medical (Blue Cross PPO Gold, Employee+Spouse, $187.50/period), Dental (Delta PPO, $42.00), Vision (VSP Choice, $18.00), Life (1x salary, $0 employee cost), 401k (8% contribution, 4% employer match).
- [x] **Holidays**: 10 company holidays for 2026 (New Year's Day Jan 1, MLK Day Jan 19, Presidents' Day Feb 16, Memorial Day May 25, Independence Day Jul 3, Labor Day Sep 7, Thanksgiving Nov 26, Day After Thanksgiving Nov 27, Christmas Eve Dec 24, Christmas Day Dec 25).
- [x] **Announcements**: 4 items — Open Enrollment (high priority, unread), Q1 All-Hands (read), Updated Remote Work Policy (unread), Summer Team Building (read).
- [x] **Notifications**: 5 items — 2 unread (timecard reminder, pay statement available), 3 read (time-off approved, benefits update, policy update).
- [x] **Direct Reports**: 4 team members (Alex Rivera, Emily Zhang, Marcus Williams, Priya Patel) with varying titles.
- [x] **Pending Manager Approvals**: 2 items — Alex Rivera's time-off request, Marcus Williams' timecard.

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login / registration (app starts pre-logged-in as Sarah Johnson, EMP-2847)
- Real payroll calculation or tax computation (all amounts are static seed data)
- Real carrier integrations for benefits
- File uploads to real servers
- Email/SMS sending
- SSO/OAuth/password management
- Real XDP API calls
- Database persistence (use localStorage only)
- XDP Marketplace integrations
