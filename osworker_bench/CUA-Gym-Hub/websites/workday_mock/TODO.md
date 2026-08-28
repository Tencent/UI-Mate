# Xorkday HCM Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-02
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Screenshots: `assets/screenshots/` (25 reference images)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

These items exist but need critical corrections before P1 work.

- [x] Project scaffold: Vite + React + Tailwind + lucide-react + date-fns already set up
- [x] Routing: 8 routes defined in App.jsx (/, /time, /pay, /benefits, /directory, /inbox, /profile, /performance, /go)
- [x] State management: StoreContext.jsx with React Context + dispatch pattern
- [x] Session isolation: vite.config.js with POST /post, GET /state, GET /go endpoints
- [x] Data normalization: arrayNormalizers map in mockData.js
- [x] **Visual design system overhaul**: The current mock uses orange (#FF6B35) as primary color but real Xorkday uses **blue** (#0875E1) as primary. Update `tailwind.config.js`: change `primary` to `#0875E1`, `primary-hover` to `#0660C1`, add `xorkday-orange` as `#F68D2E` for accent/logo only, `sidebar-blue` as `#003A70` for profile panel, `light-blue` as `#E8F2FC` for active states. Update all components that reference `bg-primary`, `text-primary`, etc. — these should now render as blue, not orange. Study `assets/screenshots/000002.jpg` and `profile_000001.jpg` for the exact Xorkday color feel.
- [x] **Header redesign to match Xorkday**: Redesign `Header.jsx` to match real Xorkday top bar (see `assets/screenshots/000002.jpg`): white background, left side has hamburger menu icon (☰) + blue "W" logo with orange arc, center has a wide search bar with "Search" placeholder and magnifying glass icon, right side has help icon (?), notification bell with red badge count, and circular profile photo. Current search bar is close but needs the hamburger menu on the left and the Xorkday logo style.
- [x] **Sidebar redesign to Xorkday navigation pattern**: Real Xorkday uses a **top bar only** on most pages (no persistent left sidebar). The sidebar is a slide-out panel triggered by the hamburger menu. However, for our mock, keep the persistent left sidebar for easy navigation but restyle it: white background, group items with section headers ("MENU", "MY INFORMATION"), use blue highlight for active item (left border + light blue background like `#E8F2FC`), add the "W" Xorkday logo at top with orange arc accent. Remove the "Sign Out" button (out of scope).
- [x] **Enrich seed data in `mockData.js`**: Expand `generateInitialState()` to include all entities from `data_model.md`. Specifically add: `departments` (5 departments), `goals` (4 goals for currentUser), `notifications` (6 items, 3 unread), richer `benefits` with dependents array and plan details (deductible, copay, etc.), richer `payroll` with line-item deductions (federalTax, stateTax, socialSecurity, medicare, healthInsurance, retirement401k), richer `tasks` with comments array, initiator, businessProcess, priority fields. Expand employees to 8-10 across Engineering, Design, Marketing, Finance with realistic names, forming proper org tree (see `data_model.md §Employees`). Expand `currentUser` with phone, employeeType, compensationGrade, annualSalary, workSchedule.
- [x] **Update normalizers**: Add normalizer functions for new entity types: `normalizeDepartment()`, `normalizeGoal()`, `normalizeNotification()`, `normalizeDependent()`. Update existing normalizers: `normalizeEmployee` (handle phone, birthday, employeeType), `normalizePaystub` (handle line-item deductions), `normalizeTask` (handle comments, priority, businessProcess, initiator). Register all in `arrayNormalizers` and `nestedArrayNormalizers`.
- [x] **Add new dispatch actions**: Add reducer cases in `StoreContext.jsx` for: `ADD_GOAL`, `UPDATE_GOAL`, `DELETE_GOAL`, `ADD_REVIEW_COMMENT`, `SUBMIT_SELF_REVIEW`, `DENY_TASK`, `SEND_BACK_TASK`, `ADD_TASK_COMMENT`, `MARK_NOTIFICATION_READ`, `MARK_ALL_NOTIFICATIONS_READ`, `UPDATE_BENEFIT_PLAN`, `ADD_TIME_ENTRY` (for manual timesheet entry), `UPDATE_TIME_ENTRY`.

---

## P1 — Primary Features

Core interactive workflows a computer-use agent would practice. Each item describes the exact UI, behavior, and state changes expected.

### Dashboard Enhancements

- [x] **"Awaiting Your Action" card**: Replace current basic inbox preview with a proper "Awaiting Your Action" card matching Xorkday style. Show up to 3 pending tasks from `state.tasks` where `status === 'Pending'`. Each item shows: task type icon (same color coding as inbox), task description (bold), initiator name (gray), due date (gray, relative like "Due in 3 days"). Clicking any item navigates to `/inbox`. Card header shows count badge. If no pending tasks, show "You're all caught up!" with a green checkmark icon.

- [x] **"Timely Suggestions" card**: New card below greeting. Shows context-aware suggestions based on state: (1) if `clockStatus.isClockedIn === false` and it's a weekday, show "Don't forget to clock in today" with clock icon; (2) if any `timeOffRequests` have status "Approved" and `startDate` is within next 7 days, show "Upcoming time off: [dates]"; (3) if any `reviews` have status "Pending Self-Review", show "Self-review due for [period]"; (4) if `goals` have any with `status === 'At Risk'`, show "Goal at risk: [title]". Each suggestion is a clickable row that navigates to the relevant page. Max 3 suggestions.

- [x] **"Team Highlights" card** (for managers): New card showing upcoming birthdays and work anniversaries for direct reports (employees where `managerId === currentUser.id`). Check `birthday` and `workAnniversary` fields. Show events within the next 30 days. Each item shows: employee avatar (32px circle), name, event type ("Birthday" or "Work Anniversary"), date. If no upcoming events, hide the card entirely.

- [x] **Announcements horizontal scroll**: Change announcements from vertical list to horizontal scrollable cards (matching Xorkday's 2024 redesign). Each card is ~280px wide, white with subtle border, shows title (bold, 14px), date (gray, 12px), content preview (2 lines, ellipsis). Cards scroll horizontally with left/right arrow buttons at the edges. Clicking a card shows full content in a modal/dialog.

### Inbox / My Tasks

- [x] **Tabs: Actions / Archive**: Add tab bar at top of Inbox page. "Actions" tab (default) shows tasks where `status === 'Pending'`. "Archive" tab shows tasks where `status !== 'Pending'` (Completed, Denied). Each tab shows count in badge. Archive items are styled with reduced opacity (0.6) and no action buttons.

- [x] **Search and filter**: Add search bar at top of inbox (below tabs) that filters tasks by `description`, `type`, `initiator`, or `businessProcess`. Add filter dropdown button next to search with options: "All Types", "Approvals", "Reviews", "Compliance", "To-Do". Results update in real-time as user types.

- [x] **Task detail panel**: Clicking "Details" button on any task opens a slide-out panel from the right (~400px wide, white background, with close X button). Panel shows: task title (large bold), business process name (blue link-style), initiator with avatar, created date, due date, priority badge, full description, and a comments section at bottom. Comments show author, timestamp, and text. Add comment textarea with "Add Comment" button that dispatches `ADD_TASK_COMMENT`.

- [x] **Deny and Send Back actions**: For Approval-type tasks, change "Approve / Complete" to three buttons: "Approve" (blue primary), "Send Back" (orange outline), "Deny" (red outline). "Approve" dispatches `COMPLETE_TASK`. "Deny" shows a confirm dialog ("Are you sure you want to deny this request?") then dispatches `DENY_TASK` which sets task status to "Denied". "Send Back" shows a dialog with a textarea for feedback, then dispatches `SEND_BACK_TASK` which adds a comment and keeps task as "Pending" (in real Xorkday it goes back to initiator). For non-Approval tasks (Compliance, To-Do), keep single "Mark Complete" button.

- [x] **Bulk actions**: Add checkbox on each task row (Actions tab only). When ≥1 checkbox is selected, show a blue action bar at top: "[N] selected | Approve All | Clear Selection". "Approve All" dispatches `COMPLETE_TASK` for each selected task then clears selection. Checkboxes are unchecked by default.

### Time & Absence

- [x] **Functional weekly timesheet**: The current timesheet grid has `<input>` elements that don't persist to state. Make them functional: each cell is a controlled input tied to `state.timeEntries`. When user types a number and tabs/clicks away (onBlur), dispatch `UPDATE_TIME_ENTRY` if entry exists or `ADD_TIME_ENTRY` if new. The "Total" column should reactively sum all values for that row. Add a "Total" row at the bottom summing all projects per day. The "Save Draft" button saves current timesheet state. "Submit for Approval" changes all Pending entries for the current week to status "Submitted" and shows success toast.

- [x] **Add/remove project rows**: Add a "+" button below the last project row in the timesheet to add a new project row. Show a dropdown/select of available projects (hardcode: "Project Alpha", "Project Beta", "General", "Internal Meetings", "Training"). When added, a new empty row appears. Add an "x" button at the end of each non-default row to remove it.

- [x] **Absence calendar view**: Add a third tab "Calendar" to the Time & Absence page. Shows a monthly calendar grid (similar to Google Calendar month view). Days are clickable. Time off requests are shown as colored bars: green=Approved, yellow=Pending, red=Denied. Clicking a date with existing request shows its details. Clicking an empty date opens the time off request form pre-populated with that date. Navigate months with left/right arrows. Today is highlighted with blue border.

- [x] **Time off balance detail**: On the Absence tab, make the balance cards clickable. Clicking opens a panel/modal showing balance breakdown: accrued this year, used this year, pending requests, available balance. Show a mini-table of all transactions (accruals and usages) with dates.

### Pay

- [x] **Payslip detail modal**: Clicking "View PDF" or a paystub row in pay history opens a modal (600px wide, white, with header showing pay period). Modal content shows a realistic payslip layout: **Earnings** section (Regular Pay line with hours × rate = amount, any overtime), **Taxes** section (Federal Income Tax, State Income Tax, Social Security, Medicare — each as a line with amount), **Deductions** section (Health Insurance, 401k, Other — each as a line), **Summary** at bottom (Gross Pay, Total Deductions, Net Pay in bold). Add "Download PDF" button in modal footer. Use data from expanded `payroll` items (see `data_model.md §Payroll`).

- [x] **Year-to-date summary card**: Add a card above pay history table showing YTD totals: YTD Gross Pay, YTD Taxes, YTD Deductions, YTD Net Pay. Calculate by summing all paystubs. Show as 4 stat boxes in a row.

- [x] **Payment elections section**: Add a "Payment Elections" card on the Pay page showing the employee's direct deposit info: bank name (mock: "Chase Bank"), account type ("Checking"), last 4 digits ("****4521"), deposit amount ("100% of Net Pay"). Add "Edit" button that toggles inline editing of bank name and last 4 digits (mock only — just updates local state, dispatch `UPDATE_PAYMENT_ELECTIONS`). Show a success toast on save.

### Benefits

- [x] **Plan detail view**: "View Plan Details" button on each benefit card opens a modal/slide-out showing full plan information: plan name, provider, coverage level (Employee Only / Employee+Spouse / Family), effective date, employee monthly cost, employer monthly cost, and plan-specific details from the `details` object (deductible amount, out-of-pocket max, copay, coinsurance %). Show covered dependents if any.

- [x] **Benefits summary card**: Replace the current "Total Benefits Value" gradient card with a proper summary showing: total monthly employee cost (sum of all plan costs), total monthly employer contribution, annual employee cost, annual employer contribution. Use a clean table or stat-card layout.

- [x] **Change benefits flow (mock)**: In the "Enrollment" tab, instead of just showing "You're all set", show a list of benefit categories (Medical, Dental, Vision, Life, FSA) each with current plan name and a "Change Plan" button. Clicking "Change Plan" opens a modal with 2-3 plan options for that category (e.g., PPO Basic, PPO Plus, HDHP for Medical), each showing monthly cost and key details. Selecting a different plan and clicking "Confirm" dispatches `UPDATE_BENEFIT_PLAN` and shows success message. This simulates open enrollment.

- [x] **Dependents section**: Add a "Dependents" card on the Benefits page showing covered dependents from `state.benefits.dependents`. Each dependent shows name, relationship, date of birth. Add "Add Dependent" button that opens a form modal (name, relationship dropdown, DOB). Submit adds to state. Add "Remove" button (with confirm) on each dependent.

### Performance & Talent

- [x] **Goals CRUD**: Add a "Goals" section below the review summary cards. Show a list of all goals from `state.goals`. Each goal card shows: title (bold), category badge (colored by type: Technical=blue, Leadership=purple, Business=green, Personal=orange), status badge, progress bar (percentage), due date. Add "Add Goal" button (opens form modal: title, description, category dropdown, due date, initial status). Each goal has "Edit" (opens pre-filled form modal) and "Delete" (confirm dialog) buttons. "Update Progress" allows changing progress percentage via a slider input. All actions dispatch appropriate actions (`ADD_GOAL`, `UPDATE_GOAL`, `DELETE_GOAL`).

- [x] **Self-review form**: For reviews with `status === 'Pending Self-Review'` and `employeeId === currentUser.id`, show a "Complete Self-Review" button. Clicking opens a form with: textarea for self-assessment comments, rating dropdown (1-5: "Does Not Meet", "Partially Meets", "Meets", "Exceeds", "Significantly Exceeds"), and Submit button. Dispatches `SUBMIT_SELF_REVIEW` which updates the review's `selfReviewComments` and changes status to "Pending Manager Review".

- [x] **Manager review panel**: For reviews with `status === 'Pending Manager Review'` and `managerId === currentUser.id`, show a "Complete Review" button. Clicking opens a panel showing the employee's self-review comments (read-only), then a textarea for manager comments, rating dropdown, and Submit button. Dispatches action to mark review as "Completed".

- [x] **Skills management**: Expand the "Skills" card to be interactive. Show skills as editable tags. Add "Add Skill" button — clicking shows an input field; typing and pressing Enter adds the skill tag. Each tag has an "x" to remove. Skills are stored in `state.currentUser.skills` (array of strings). Changes dispatch `UPDATE_PROFILE`.

### Profile

- [x] **Job Details section**: Add a "Job Details" card showing: Job Title, Department, Manager (with avatar and name, clickable to navigate to their profile in directory), Position ID, Employee Type, Hire Date, Length of Service (calculated from joinDate), Compensation Grade, Work Schedule. These fields are read-only (not editable by employee in Xorkday).

- [x] **Xorkday-style profile sidebar**: Redesign the profile page to match Xorkday's distinctive layout (see `assets/screenshots/profile_000001.jpg`). Left side shows a dark blue panel (~280px) with: centered circular photo (96px), name (white, bold), title + department (white, smaller), "Actions" dropdown button (white outline). Below: vertical nav tabs — Summary, Job, Compensation, Benefits, Pay, Time Off. Clicking each tab updates the main content area on the right. Default to "Summary" which shows personal info + contact info.

- [x] **Profile tabs content**: Each tab in the profile sidebar nav shows different content: **Summary** = personal info + contact + emergency contacts (current content). **Job** = job details card (from above). **Compensation** = annual salary, compensation grade, bonus info, total compensation chart. **Benefits** = list of current benefit plans (same data as Benefits page but read-only summary). **Pay** = last 3 paystubs summary (same data as Pay page but condensed). **Time Off** = time off balance + recent requests.

### Directory

- [x] **Employee detail panel**: Clicking an employee card in the directory opens a slide-out detail panel from the right (~400px). Shows: large avatar (80px), name, title, department, email (clickable mailto:), phone, location, manager name, hire date, and a "View Full Profile" button that navigates to their profile. For the currentUser's card, "View Full Profile" goes to `/profile`.

- [x] **Department filter**: Add a department filter dropdown above the employee grid (next to search). Options: "All Departments" + each unique department from `state.departments`. Selecting a department filters the employee list. Can be combined with search text.

- [x] **More employees**: Ensure the directory has 8-10 employees from seed data with varied departments, forming a meaningful org chart tree. Org chart should show clear hierarchy with expand/collapse working correctly.

### Notifications

- [x] **Notification dropdown**: Clicking the bell icon in the header opens a dropdown panel (320px wide, max-height 400px, scrollable, white with shadow). Shows list of notifications from `state.notifications`. Each notification shows: colored dot (blue=task, green=pay, orange=timeoff, gray=system), title (bold, 14px), message (gray, 13px), relative timestamp ("2 hours ago"). Unread notifications have light blue background. Header shows "Notifications" with "Mark all as read" link. Clicking a notification dispatches `MARK_NOTIFICATION_READ` and navigates to `notification.link`. Badge on bell icon shows count of unread notifications (only visible if > 0).

### Header Search

- [x] **Predictive search**: Make the header search bar functional. On typing (debounced 200ms), search across: employee names, task descriptions, page names ("Pay", "Benefits", "Time", etc.). Show results in a dropdown below the search bar (320px wide, max 8 results). Results are grouped: "People" (employee avatar + name + title), "Pages" (icon + page name), "Tasks" (task icon + description). Clicking a result navigates: people → `/directory` with search pre-filled, pages → route, tasks → `/inbox`. Press Escape or click outside to close. Show "No results found" if empty.

---

## P2 — Secondary Features

Implement only after P1 is solid. These add depth and realism.

- [x] **Global navigation slide-out**: Hamburger icon in header opens a slide-out panel from left (300px, white, with overlay). Panel shows app categories: "Frequently Used" (Pay, Time, Benefits, Directory), "My Information" (Profile, Pay, Benefits), "My Team" (Directory, Performance). Each is an icon + label clickable link. Close with X or click overlay.

- [x] **Xorkday apps grid on dashboard**: Add an "Apps" section at bottom of dashboard showing a 4×2 grid of icon tiles (like Xorkday worklets). Each tile: 64px icon circle, label below. Icons: Pay, Benefits, Time Off, Directory, Performance, Profile, Inbox, Help. Each links to corresponding route.

- [x] **Toast notification system**: Add a toast/snackbar system for feedback messages. Show toast on: task approved/denied, time off submitted, profile saved, goal created/updated, etc. Toast appears bottom-right, auto-dismisses in 4 seconds, has close button. Uses success (green), error (red), info (blue) variants.

- [x] **Compensation details on profile Compensation tab**: Show a visual breakdown of total compensation: base salary, bonus target (% of salary), equity/stock value. Show as a horizontal stacked bar chart or pie chart using CSS (no charting library needed). Below show compensation history table (mock 2-3 years of salary changes).

- [x] **Manager team view**: Add a "My Team" card on dashboard (visible because currentUser is a manager). Shows direct reports: avatar, name, title, and quick action links (View Profile, Request Time Off on behalf). Links navigate appropriately.

- [x] **Absence calendar holidays**: On the absence calendar, show company holidays as gray blocked-out dates (New Year's, MLK Day, Presidents Day, Memorial Day, Independence Day, Labor Day, Thanksgiving, Christmas).

- [x] **Keyboard shortcuts**: Add keyboard shortcuts: `/` focuses search bar, `Escape` closes any open modal/panel, `n` on inbox page opens new task, `?` shows keyboard shortcut help modal.

- [x] **Responsive sidebar collapse**: On screens < 1024px, collapse sidebar to icon-only mode (48px wide, showing only icons). Add a toggle button at the bottom of the sidebar to manually expand/collapse.

- [x] **Empty states**: Add proper empty state illustrations/messages for: no tasks in inbox, no pay history, no goals, no announcements, no search results. Each shows a relevant icon (64px, gray), title, and description text.

---

## Data Seed (implement in generateInitialState())

- [x] **Employees**: 10 records across Engineering (4), Design (2), Marketing (2), Finance (1), HR (1). Realistic names: Alex Morgan (currentUser, Engineering Manager), Sarah Connor (Director of Engineering), John Smith (Junior Developer), Emily Chen (Product Designer), Marcus Johnson (Senior Developer), Lisa Park (UX Designer), David Kim (Marketing Manager), Rachel Green (Marketing Specialist), James Wilson (Finance Analyst), Nina Patel (HR Coordinator). Proper org tree: Sarah → Alex, David; Alex → John, Marcus, Lisa (cross-team); David → Rachel. Each with avatar URL, email, phone, birthday, joinDate.

- [x] **Departments**: 5 records: Engineering (5 people, head: Sarah), Design (2, head: Emily), Marketing (2, head: David), Finance (1, head: James), Human Resources (1, head: Nina).

- [x] **Time entries**: 15 records for currentUser (Alex) across last 3 weeks, 8hrs/day weekdays, mix of Project Alpha, Project Beta, and Internal Meetings. Most Approved, last week Pending.

- [x] **Time off requests**: 5 records: 1 Approved vacation (past), 1 Approved sick (past), 1 Denied personal (past), 1 Pending vacation (future, from direct report John for manager approval), 1 Pending personal (future, from currentUser).

- [x] **Payroll**: 6 biweekly paystubs spanning Oct-Dec 2024, each with full line-item breakdown (see data_model.md §Payroll). Base biweekly gross ≈ $5,577 (from $145k annual).

- [x] **Benefits**: Medical PPO Plus (BlueCross, $240/mo employee, $680/mo employer, $1500 deductible), Dental Premium (Delta, $28/mo, $55/mo employer), Vision (VSP, $12/mo, $20/mo employer), 401k (Fidelity, 6% contribution with 4% match). 1 dependent: Jane Morgan (Spouse).

- [x] **Reviews**: 3 records: (1) 2023 Annual — Completed, Exceeds Expectations, for currentUser; (2) 2024 Mid-Year — Pending Self-Review, for currentUser; (3) 2024 Mid-Year — Pending Manager Review, for John Smith (currentUser is reviewer).

- [x] **Goals**: 4 records for currentUser: (1) "Complete AWS migration" — Technical, 75%, On Track; (2) "Mentor 2 junior developers" — Leadership, 50%, On Track; (3) "Reduce build time by 30%" — Technical, 20%, At Risk; (4) "Present at team all-hands" — Personal, 100%, Completed.

- [x] **Tasks**: 6 records: (1) Approve time off for John Smith — Pending Approval; (2) Complete performance review for John Smith — Pending Review; (3) Complete Cyber Security Training — Pending Compliance; (4) Approve expense report for Emily Chen — Pending Approval; (5) Review benefits enrollment reminder — Pending Information; (6) Previously approved time off for Marcus — Completed.

- [x] **Notifications**: 6 records: (1) "Time off request from John Smith" — unread, task; (2) "Your payslip is ready" — unread, pay; (3) "Performance review deadline approaching" — unread, task; (4) "Benefits enrollment reminder" — read, system; (5) "Time off approved" — read, timeoff; (6) "Welcome to Q4!" — read, system.

- [x] **Announcements**: 5 records: (1) "Open Enrollment Begins Nov 1" — Benefits, High; (2) "Holiday Office Closure Schedule" — Company, Normal; (3) "Q4 All-Hands Meeting" — Company, Normal; (4) "New Cyber Security Training Required" — IT, High; (5) "Wellness Program Launch" — HR, Normal.

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login / logout (app starts pre-logged-in as Alex Morgan, Senior Software Engineer)
- Password management or account creation
- OAuth, SSO, or any identity verification
- Real API calls or backend communication
- Database persistence (localStorage only)
- File upload to real servers
- Email/SMS sending
- Complex admin configuration screens
- Recruiting module
- Learning Management System (separate Xorkday product)
- Payroll processing/calculation engine
- Reporting/analytics dashboards with charts
- Mobile/responsive layout below 768px (desktop only is fine)
