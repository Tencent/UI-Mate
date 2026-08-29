# XambooHR Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell
<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] **Project scaffold**: `npm create vite@latest bamboohr_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`

- [x] **Visual design system**: Study `assets/screenshots/` carefully. XambooHR uses a **clean, corporate green** palette:
  - Primary brand green: `#73B255` (buttons, links, active states, icons)
  - Dark green (profile banner, header accents): `#2E7D32`
  - Top nav background: `#FFFFFF` with light bottom border `#E0E0E0`
  - Page background: `#F5F5F5`
  - Card/content background: `#FFFFFF`
  - Text primary: `#333333`, secondary: `#666666`, muted: `#999999`
  - Border/divider: `#E0E0E0`
  - Alert/overdue badge: `#E65100` (orange-red)
  - Font: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Nav text: 14px medium weight; Page headers: 20px bold; Section headers: 18px bold with green icon; Body: 14px regular; Employee name on banner: 28px bold white

- [x] **App layout — Top navigation bar**: Full-width white bar, ~56px height, fixed at top. Left: XambooHR-style green logo text `"XambooHR"` in brand green italic script font. Center: horizontal nav links — Home, My Info, People, Hiring, Reports, Files — each ~14px medium weight, active link has green underline (3px solid `#73B255`). Right cluster: search icon (magnifying glass) opening a search input, notification bell icon with red badge count (e.g., "12"), help icon (question mark in circle), settings gear icon, and user avatar (32px circle) with dropdown menu. Nav items should have hover state (green text color shift).

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Define routes:
  - `/` → Home (dashboard)
  - `/my-info` → My Info (current user's own employee profile)
  - `/my-info/:tab` → My Info with specific tab selected
  - `/people` → Employee directory (grid view)
  - `/people/org-chart` → Org chart view
  - `/people/:id` → Employee profile
  - `/people/:id/:tab` → Employee profile with specific tab
  - `/hiring` → Job openings list
  - `/hiring/:id` → Job opening detail with candidate pipeline
  - `/reports` → Reports list
  - `/reports/:id` → Report detail/results view
  - `/files` → Company files
  - `/settings` → Settings page
  - `/go` → State inspection endpoint

- [x] **State management**: `AppContext.jsx` providing global state + `utils/dataManager.js` with `createInitialData()` (see `data_model.md` for full structure). State stored in localStorage under key `bamboohr_state`. Context provides: `state`, `dispatch`, and helper functions: `getEmployee(id)`, `getDepartment(id)`, `getLocation(id)`, `updateEmployee(id, changes)`, `addTimeOffRequest(request)`, `updateTimeOffRequest(id, changes)`, `addCandidate(candidate)`, `updateCandidate(id, changes)`, `addNote(note)`, `addAnnouncement(announcement)`.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Returns JSON with `{initial_state, current_state, state_diff}`. Computes deep diff of all state arrays/objects. Show raw JSON in a `<pre>` tag with monospace formatting.

- [x] **Session isolation**: `vite.config.js` mock-api plugin. `POST /post?sid=<sid>` accepts `{"action":"set","state":{...}}` to set both initial + current state; `{"action":"set_current","state":{...}}` for current only; `{"action":"reset"}` to restore initial. `GET /go?sid=<sid>` returns `{initial_state, current_state, state_diff}`. Session data stored in-memory Map keyed by sid. `GET /state?sid=<sid>` alias for `/go`.

- [x] **Seed data**: Populate `createInitialData()` with ~30 employees across 10 departments, 3 locations, realistic org hierarchy (CEO → VPs → Managers → ICs). Current user = Charlotte Abbott (id: 1), HR Admin. Include time-off balances (Vacation: 54.6 hrs, Sick: 24.0 hrs), 8 time-off requests (2 pending, 4 approved, 1 denied, 1 completed), 4 job openings with 12 candidates, 4 announcements, 12 notifications, training records, assets, goals, benefit enrollments. See `data_model.md` for full entity specs and suggested values.

---

## P1 — Primary Features
<!-- Core features a user interacts with in the first 5 minutes. -->

- [x] **Home — Dashboard page**: Three-column layout. **Left column** (~280px): Current user card with circular avatar (80px), name (bold), green "Request Time Off" button. Below: two PTO balance circles — "Vacation" with green palm-tree icon showing large number (e.g., "54.6") + "HOURS AVAILABLE" + "48.0 hours scheduled" subtext, and "Sick" same format. Below: "Who's Out" section with "TODAY", "TOMORROW", date headers, each entry showing small avatar (32px) + name + role as greyed-out row when someone is out. **Center/right column**: "WHAT'S HAPPENING AT [COMPANY NAME]" feed header with "Announcements" tab toggle. Activity feed: list of notification items, each with left icon (colored circle, 32px), bold action text, relative timestamp ("4 days ago"), optional orange "PAST DUE" badge, dismiss X button. Below the feed: Report widgets section showing Department Report donut chart (colored segments per dept with legend), "COMMON REPORTS" quick links, "YOUR MOST RUN" reports. Below: "WELCOME TO [COMPANY]" section with recent new hire spotlight (avatar, name, role, "started [date]"). Below: "KEEP AN EYE ON YOUR GOALS" section with progress bars. Below: "MY BENEFITS" section listing current benefit plans. **Left column lower**: "COMPANY LINKS" section with categorized quick links (Benefits, General, etc.), "TRAINING" section listing training items with status badges (green "Complete", orange "Overdue", blue "Upcoming").

- [x] **Home — "New..." dropdown button**: Top-right green button with dropdown on click. Options: "New Employee", "New Announcement", "New Time Off Request". Each option navigates to the appropriate creation form/modal.

- [x] **Home — Request Time Off modal**: Triggered by the green "Request Time Off" button. Modal with: Time-off type dropdown (Vacation, Sick, Personal, etc.), date range picker (start date + end date calendar inputs), hours per day input (defaults to 8), total hours display (computed), note textarea (optional), "Submit" green button and "Cancel" gray button. On submit: creates a new TimeOffRequest in state with status "pending", adds notification, closes modal.

- [x] **People — Employee Directory**: Route `/people`. Page header "People" with two view toggles: "Directory" (grid icon, default) and "Org Chart" (hierarchy icon). Search bar (full-width, placeholder "Search employees...") with filter dropdown (All, My Circle, By Department, By Location, By Status). **Directory grid**: Cards in a responsive grid (4 columns on desktop), each card: white background, top-center circular avatar (64px), name (bold, centered), job title (muted, centered), department (small, centered). Card hover: subtle shadow elevation. Click card → navigate to `/people/:id`. Below search: result count "Showing X of Y employees". If filtered, show active filter chips with X to remove.

- [x] **People — Org Chart**: Route `/people/org-chart`. Toggle from directory view. Hierarchical tree visualization. Each node: rounded-rectangle green card (~200px wide) with circular avatar (48px), employee name (bold, white text), job title (italic, white text). Lines (gray, 2px) connecting managers to direct reports. Tree starts from CEO at top, expands downward. Nodes are collapsible (click to toggle children). Clicking a node navigates to that employee's profile. Horizontal scroll for wide trees.

- [x] **Employee Profile — Shell/Header**: Route `/people/:id`. **Banner**: Full-width dark green gradient background (~140px height). Large circular avatar (100px) with white border, positioned left overlapping banner. Name (28px, bold, white): "Charlotte Danielle Abbott". Title + department below name (16px, white): "Sr. HR Administrator". Right side of banner: "Request a Change" green button with dropdown (Request Compensation Change, Request Job Information Change, Request Promotion), gear icon dropdown (Edit Employee, Terminate Employee). Pagination: "1 of 86 · Previous | Next >" links. **Left sidebar** (~220px): Contact block with icons — work phone (phone icon), cell phone (mobile icon), email (envelope icon). Social media icon row (LinkedIn, Twitter, Facebook — gray icons). "Hire Date" label (green) + date + tenure ("5y · 7m · 30d"). Employee # , Employment status (Full-Time icon), Department, Division, Location — each with icon prefix. "Manager" section: small avatar + name (as link) + their title. "Direct Reports" section if applicable: linked count. **Tab bar**: Horizontal tabs below banner — Personal | Job | Time Off | Documents | Benefits | Training | Assets | Notes | Performance | Onboarding | More ▾. Active tab has green underline. Clicking each tab updates the main content area and URL.

- [x] **Employee Profile — Personal tab**: Display personal information in a clean form-like layout. Sections: **Contact Info** (Work Email, Home Email, Work Phone, Mobile Phone, Home Phone), **Personal** (Date of Birth, Gender, Marital Status, SSN masked as "•••-••-1234"), **Address** (Street, City, State, Zip, Country), **Emergency Contact** (Name, Phone, Relationship). Each field: label (muted gray, 12px) above value (14px, black). Fields should be inline-editable: clicking a value or pencil icon turns it into an input. Save with checkmark, cancel with X. On save: update employee in state.

- [x] **Employee Profile — Job tab**: Display current job information. Sections: **Job Information** (Job Title, Department, Division, Location, Reports To — as clickable link to manager), **Employment Status** (Status, Employment Type, Hire Date, Original Hire Date), **Compensation** (Pay Rate formatted as "$85,000.00/yr" or "$45.00/hr", Pay Type, Pay Frequency, Standard Hours Per Week). Below: **Job History** timeline — vertical timeline of job changes (title changes, promotions, dept transfers) with date, old value → new value. Each entry: date on left, description on right, connected by vertical gray line with green dots.

- [x] **Employee Profile — Time Off tab**: Header: "Time Off" with palm-tree icon. "Accrual Level Start Date: MM/DD/YYYY" right-aligned. **Balance cards**: Horizontal scrollable row of cards. Each card (~180px wide, ~120px tall, white with light border): Top: category name (e.g., "Vacation"), center: green icon + large bold number (e.g., "27.4"), bottom: "HOURS AVAILABLE" label + "72 hours scheduled" subtext. Cards for: Vacation, Sick, Bereavement, FMLA, Personal. Horizontal scroll arrows if overflow. Below: **Upcoming Time Off** list with clock icon header. Each item: date range (bold, "Apr 12–13"), green status dot, hours + type ("16 hours of Vacation"). Below: **Request Time Off** button (reuses modal from Home). Below: **Time Off History** table: Date, Type, Hours, Status (Approved/Pending/Denied badge), Note.

- [x] **Employee Profile — Documents tab**: Header "Documents" with folder icon. "Upload Document" green button top-right. Document table: columns — Name (link), Category, Date Uploaded, Uploaded By, Size. Each row has actions: download icon, delete icon (with confirmation). Category filter dropdown above table. Empty state: "No documents found" with upload prompt.

- [x] **Employee Profile — Notes tab**: Header "Notes" with notepad icon. "Add Note" green button top-right. Notes list: reverse-chronological cards. Each card: author avatar (24px) + author name (bold) + relative timestamp, note content below. "Add Note" opens inline form: textarea + "Save" button. On save: creates Note in state. Notes are editable by the author (pencil icon shows edit form) and deletable (trash icon with confirmation).

- [x] **Employee Profile — Benefits tab**: Header "Benefits" with heart icon. List of enrolled benefit plans. Each plan card: plan type icon (medical cross, tooth, eye, piggy bank), plan name (bold), provider name, coverage level, employee cost per month. Enrollment status badge (green "Active", gray "Terminated"). If no enrollments: "No benefit plans enrolled" empty state.

- [x] **Employee Profile — Training tab**: Header "Training" with graduation cap icon. Training list: each item is a card with title (bold), category tag, status badge (green "Complete" with date, orange "Overdue" with due date in red, blue "Upcoming" with due date), and a progress indicator. Click to expand for details.

- [x] **Employee Profile — Assets tab**: Header "Assets" with box icon. Asset table: columns — Type (with icon: laptop, phone, badge), Description, Serial Number, Assigned Date, Status badge. "Assign Asset" button for admins. Click row to see details.

- [x] **Employee Profile — Performance tab**: Header "Performance" with star icon. Three sub-tabs: **Goals**, **Feedback**, **Assessment**. Active sub-tab has green underline. **Goals sub-tab**: List of goals with title, description (truncated), progress bar (0-100%, colored green/yellow/red by status), due date. "Add Goal" button. Click goal to inline-edit. **Feedback sub-tab**: Period dropdown ("Last Year", "This Year"). "Request feedback about [Name]" section: search input for peer names + "Send Request" button. Below: received feedback cards with reviewer avatar, name, title, feedback text. **Assessment sub-tab**: Performance review summary — overall rating (1-5 stars), reviewer name, review period, comments. "View Full Review" link.

- [x] **Hiring — Job Openings list**: Route `/hiring`. Page header "Job Openings" with "New Job Opening" green button top-right. Job openings table: columns — Job Title (bold, clickable link), Department, Location, Status (colored badge: green "Open", gray "Draft", yellow "On Hold", red "Closed"), Applicants (count as green number), Hiring Manager, Date Posted. Table is sortable by clicking column headers. Filter bar above table: status filter dropdown, department filter dropdown, search input.

- [x] **Hiring — Job Opening detail / Candidate pipeline**: Route `/hiring/:id`. Header: job title (large), department + location badges, status badge, hiring manager. **Pipeline view**: Horizontal columns representing stages — "New" | "Screening" | "Phone Interview" | "On-site Interview" | "Offer" | "Hired" | "Rejected". Each column: header with stage name + count, below: candidate cards stacked vertically. Each candidate card: name (bold), email (muted), applied date, star rating (1-5, clickable to update). Cards are draggable between columns (drag-and-drop to advance/move stage). Click candidate card: expand to show full details (resume link, phone, notes, action buttons: "Advance", "Reject", "Email"). "Add Candidate" button opens form modal.

- [x] **Reports — Reports list**: Route `/reports`. Header "Reports" with "Create Custom Report" green button. Two sections: **Standard Reports** (predefined: Headcount, Employee Turnover, Compensation Summary, Time Off Usage, Benefits Enrollment, Department Report, New Hires). **Custom Reports** (user-created). Each report card: name (bold), description (muted), last run date, "Run Report" green button. Click report name to navigate to detail.

- [x] **Reports — Report detail view**: Route `/reports/:id`. Header: report name, "Run" button, "Export CSV" button, "Export PDF" button. Filter panel: date range, department dropdown, location dropdown, status filter. Results shown in a data table with sortable columns. For Department Report: also show donut/bar chart visualization above the table. Table has pagination (25/50/100 per page). Column headers are dynamic based on report type.

- [x] **Notifications panel**: Clicking the bell icon in top nav opens a dropdown panel (right-aligned, ~360px wide, ~400px max-height scrollable). Header: "Notifications" + "Mark All Read" link. List of notification items: unread items have left green border accent + slightly bolder text. Each item: icon (24px, colored by type), message text, relative timestamp, read/unread dot indicator. Click notification: mark as read + navigate to `linkTo` route. Bottom: "View All Notifications" link. Badge count on bell icon updates as notifications are read.

- [x] **Global search**: Clicking search icon in top nav expands an input field (or opens a search modal). As user types, show live results below — employee matches with avatar (24px) + name + title + department. Pressing Enter or clicking a result navigates to that employee's profile. Search matches against: firstName, lastName, displayName, jobTitle, department name, email. Show "No results found" for no matches. Min 2 characters to trigger search.

---

## P2 — Secondary Features
<!-- Depth and realism, implement after P1 is solid. -->

- [ ] **Employee Profile — Onboarding tab**: Checklist of onboarding tasks. Each task: checkbox, title, due date, assigned to (avatar + name), status (complete/incomplete/overdue). Tasks grouped by category: "Before First Day", "First Day", "First Week", "First Month". Progress bar at top showing completion percentage. "Add Task" button for admins.

- [ ] **Files page**: Route `/files`. Company-level document repository. Folder tree on left sidebar: "Company Documents", "Employee Documents", etc. File list on right: table with Name, Category, Date, Uploaded By, Size. Folder creation, file "upload" (just adds a mock entry to state). Breadcrumb navigation for nested folders.

- [ ] **Settings page**: Route `/settings`. Left sidebar menu: Company Info, Departments, Locations, Access Levels, Time Off Policies, Email Templates. **Company Info**: Company name, address, phone, logo upload area. **Departments**: List with add/edit/delete. **Locations**: List with add/edit/delete. **Time Off Policies**: List of policies with accrual rules, editable. All settings update state on save.

- [x] **My Info page**: Route `/my-info`. Same as employee profile but for the current user (id: 1, Charlotte Abbott). Identical layout but with self-service editing enabled on personal fields. No "Request a Change" button (user can edit directly). Shows "My Info" in page header instead of employee name.

- [ ] **Employee creation form**: Triggered by "New Employee" from the "New..." button on Home or from People directory. Modal or full-page form. Required fields: First Name, Last Name, Email, Hire Date, Department, Location, Job Title. Optional: Middle Name, Phone, Employment Status, Pay Rate, Reports To (searchable employee dropdown). On save: creates new employee in state, adds notification, redirects to new profile.

- [ ] **Announcement creation**: Triggered by "New Announcement" from the "New..." button. Modal with: Title input, Body textarea (rich text or plain), Pin toggle. On save: adds to announcements array, creates notification visible to all.

- [ ] **Department Report donut chart**: On Home dashboard, render an interactive donut chart showing employee count per department. Segments colored distinctly. Legend on right with dept name + count. Hover segment: show tooltip with dept name and percentage. Click segment: filter directory to that department.

- [ ] **"Who's Out" calendar view**: Expanded view from "Who's Out" widget. Full calendar showing approved time-off for all employees. Month view with colored bars spanning leave dates. Color-coded by leave type (blue=vacation, orange=sick, etc.). Click on a bar to see details.

- [ ] **Employee termination flow**: From gear menu on employee profile, "Terminate Employee" opens a modal: Termination Date (date picker), Termination Type (Resignation, Involuntary, Death), Termination Reason dropdown, Regrettable toggle, Rehire Eligible toggle, Notes textarea. On submit: sets employee status to "Inactive", sets terminationDate, adds to job history, adds notification.

- [ ] **Inline field editing on profile**: All profile fields support click-to-edit. Clicking a field value turns it into the appropriate input (text, select, date picker). Show save checkmark + cancel X. Validate required fields. On save: update employee record, show brief green success toast.

- [ ] **Toast notifications**: Global toast system. Show brief (3s auto-dismiss) green success toasts for: record saved, time off requested, candidate advanced, etc. Show red error toasts for validation failures. Toasts appear top-right, stack if multiple.

- [ ] **Employee profile pagination**: "1 of 86 · Previous | Next >" navigation on employee profiles. Previous/Next cycle through employee IDs. Shows total count. Updates URL on navigate.

---

## Data Seed (implement in createInitialData())
<!-- Dev must create realistic seed data matching these specs. -->

- [x] **Departments**: 10 departments — Human Resources, Engineering, Sales, Marketing, Customer Support, Finance, Operations, IT, Legal, Leadership. See `data_model.md §Department`.

- [x] **Locations**: 3 locations — San Francisco HQ, New York Office, Remote. See `data_model.md §Location`.

- [x] **Employees**: ~30 records with realistic org hierarchy. CEO at top, VPs per department, managers, individual contributors. Current user Charlotte Abbott (id: 1) is SR HR Admin. Include 2 recently terminated employees. Mix of locations, hire dates (2015–2026), diverse names. Each employee has time-off balances, some have training records, assets, notes. See `data_model.md §Employee` for all fields.

- [x] **Time Off**: 5 policies (Vacation, Sick, Bereavement, FMLA, Personal). Balances for all active employees. 8 requests: 2 pending approval (from employees on current user's team + one from another dept), 4 approved upcoming, 1 denied, 1 past completed. See `data_model.md §TimeOffRequest`.

- [x] **Hiring**: 4 job openings (3 Open, 1 Draft). 12 candidates spread across openings at various pipeline stages (New through Offer). At least 1 candidate at "Offer" stage, several at "Screening". See `data_model.md §JobOpening, §Candidate`.

- [x] **Notifications**: 12 items covering all types — time-off requests, new applications, compensation requests, asset requests, announcements, training overdue, performance review due, signature requests, exit interview scheduling. 5 unread, 7 read. Include 2 with "PAST DUE" status. See `data_model.md §Notification`.

- [x] **Announcements**: 4 records — company event (pinned), policy update, new hire welcome, office closure notice. See `data_model.md §Announcement`.

- [x] **Performance/Goals/Training/Assets/Documents**: Populate for at least the current user (Charlotte) and 3-4 other employees. 5 goals (2 company-wide, 3 individual). 6 training records. 4 asset assignments. 5 documents. 3 performance reviews. See `data_model.md` for field details.

---

## Out of Scope
<!-- Dev must NOT implement these. -->

- Authentication / login / logout (app starts pre-logged-in as Charlotte Abbott, HR Admin)
- Real payroll processing or pay stub generation (show static mock pay info if needed)
- E-Verify / I-9 compliance workflows
- Real email/SMS sending
- Real file uploads (mock with state entries)
- Third-party integrations
- SSO/MFA/encryption settings
- Actual benefits enrollment processing
- Mobile-responsive layouts (desktop only is fine)
