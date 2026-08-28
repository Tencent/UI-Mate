# Xusto Mock — TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] Project scaffold: `npm create vite@latest gusto_mock -- --template react`, install deps: `react-router-dom`
- [x] **Visual design system**: Xusto uses a clean, friendly aesthetic. Study `assets/screenshots/gusto_000001.jpg` and `assets/screenshots/000001.jpg` carefully. Color palette: primary coral `#F45D48` (logo, accents), teal `#0A8080` (active nav items, links, primary buttons), white `#FFFFFF` (sidebar & content bg), light gray `#F7F7F7` (page background), dark charcoal `#1A1A1A` (text), medium gray `#666666` (secondary text), border `#E0E0E0`. Font: system sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`). Heading: 28px/700, subheading: 20px/600, body: 14px/400, small: 12px/400. Border radius: 4-6px for inputs/cards, 8px for modals. Subtle box shadows for cards: `0 1px 3px rgba(0,0,0,0.08)`.
- [x] **App layout** (see screenshots `gusto_000001.jpg`, `000001.jpg`): Fixed left sidebar 220px wide, white bg, Xusto logo ("xusto" in coral lowercase) top-left with 24px padding. Top bar: 56px height, right side has search input (pill-shaped, gray border, placeholder "Search people"), notification bell icon, user avatar circle (initials "JJ" on teal bg) + name "Jessica Jackson" + role "Administrator" with dropdown chevron. Main content area: `calc(100vw - 220px)` width, light gray `#F7F7F7` bg, content column centered max-width 900px with 32px padding.
- [x] **Sidebar navigation**: Implement exactly as shown in `assets/screenshots/000001.jpg`. Structure: Logo area → "Home" link → "People" section (expandable, sub-items: Team members, Org chart, Team insights, Performance) → "Company" link → "Payroll" section (expandable, sub-items: Run Payroll, Pay Contractors) → "Time tools" section (expandable, sub-items: Time Tracking, Time Off) → "Benefits" link → "Taxes & compliance" link → separator → "Reports" link → "App directory" link → separator → "Settings" link → "Refer & earn" link → "Help" link. Active item: teal text `#0A8080` with 3px left teal border. Hover: light gray bg `#F5F5F5`. Expand/collapse with chevron icons. Sub-items indented 16px.
- [x] **Routing** in App.jsx with BrowserRouter. Routes: `/` → Home, `/people/team-members` → TeamMembers, `/people/team-members/:id` → EmployeeProfile, `/people/org-chart` → OrgChart, `/people/team-insights` → TeamInsights, `/people/performance` → Performance, `/company` → CompanyDetails, `/payroll/run` → RunPayroll, `/payroll/history` → PayrollHistory, `/payroll/contractors` → PayContractors, `/time-tools/time-tracking` → TimeTracking, `/time-tools/time-off` → TimeOff, `/benefits` → Benefits, `/taxes` → TaxesCompliance, `/reports` → Reports, `/documents` → Documents, `/settings` → Settings, `/go` → StateInspector
- [x] **State management**: Create `src/context/AppContext.jsx` wrapping entire app. Create `src/utils/dataManager.js` with `createInitialData()` that returns all entities defined in `assets/data_model.md`. Persist to localStorage under key `gusto_mock_state`. Provide `getState()`, `setState()`, `resetState()`, `getStateDiff()` functions.
- [x] **`/go` endpoint**: `src/pages/Go.jsx` route renders JSON with `{ initial_state, current_state, state_diff }`. Style as raw JSON in `<pre>` tag with monospace font.
- [x] **Session isolation**: Configure `vite.config.js` with mock-api plugin. `POST /post?sid=<sid>` accepts `{ action: "set"|"set_current"|"reset", state: {...} }`. `GET /go?sid=<sid>` returns `{ initial_state, current_state, state_diff }`. If no `sid` param, use default "main" session. Store sessions in memory Map.

---

## P1 — Primary Features

<!-- Core features a user interacts with daily. Implement after P0. -->

- [x] **Home Dashboard** (`/`): Welcome banner "Welcome back, Jessica!" at top. Below: "Things to do" section showing `todoItems` from state as cards — each card has a teal left border (4px), title in bold, description in gray, due date badge, and "Start >" teal link that navigates to `actionUrl`. Cards are stacked vertically with 12px gap. Below todos: "Upcoming payroll" card showing next payroll date, pay period, and "Run payroll" teal button. Below that: "Recent activity" feed showing last 3-5 payroll completions, time off approvals, and new hire events as single-line items with timestamp.

- [x] **People — Team Members** (`/people/team-members`): Page title "Team members" with subtitle "You have N team members". Two tabs: "Team members" (active tab with teal underline), "Contractors". Search bar ("Search people..." with magnifying glass icon). Below: data table with columns: Name (avatar circle with initials + full name + email below in gray), Department, Job title, Employment type, Status (green badge "Active", yellow "Onboarding"), Start date. Rows clickable → navigate to `/people/team-members/:id`. "Add employee" teal button top-right. Table supports sorting by clicking column headers (toggle asc/desc). Filter dropdown for Department (All, Engineering, Sales, Marketing, Operations, Finance) and Status (All, Active, Onboarding).

- [x] **Employee Profile** (`/people/team-members/:id`): Breadcrumb "People > Team members > [Name]". Header section: large avatar circle (48px, initials on colored bg), name (24px bold), job title in gray, department badge, status badge. Below: tabbed sections — "Personal" tab (name, email, phone, address, DOB — editable fields with "Edit" pencil icon toggling to edit mode), "Employment" tab (job title, department, manager, location, start date, compensation type + amount, pay method), "Time off" tab (vacation/sick balances shown as progress bars, accrual rates, recent requests list), "Documents" tab (list of documents for this employee), "Benefits" tab (enrolled plans list). Each field row: label on left (gray, 140px width), value on right. Edit mode: input fields replace text, "Save" + "Cancel" buttons appear.

- [x] **Add Employee Modal**: Triggered by "Add employee" button on Team Members page. Full-page modal overlay with white content area (max-width 680px centered). Multi-step form with horizontal progress bar at top (coral-to-teal gradient, 4 step dots with labels: "1. Basics", "2. Employment details", "3. Review & send"). Step 1 — Basics: First name, Middle name (optional), Last name, Personal email address (hint text: "Use an address not associated with your company"), Job title (dropdown from existing titles), Manager (searchable dropdown), Department (dropdown), Start date (date picker). Step 2 — Employment details: Employment type (Full-time/Part-time radio), Compensation type (Salary/Hourly radio), Amount input + per (Year/Hour), Pay schedule info, Work location (dropdown). Step 3 — Review: Summary card showing all entered info, "Send invite" primary button. Footer buttons: "Save and close", "Cancel", "[Next step] >" (teal filled button). On submit: add employee to state with status "Onboarding", create onboarding checklist, add todo item, navigate to team members list.

- [x] **Run Payroll** (`/payroll/run`): Multi-step horizontal progress bar: "1. Hours" → "2. Time Off" → "3. Review" → "4. Confirmation". All steps implemented with working state updates.

- [x] **Payroll History** (`/payroll/history`): Page title "Payroll History". Table with columns: Pay Period, Check Date, Employees, Total Gross Pay, Total Taxes, Total Net Pay, Status badge. Rows clickable to expand per-employee breakdown.

- [x] **Time Tracking** (`/time-tools/time-tracking`): Page title "Time Tracking" with two tabs. Week selector, employee list, weekly detail, approve button.

- [x] **Time Off** (`/time-tools/time-off`): Page title "Time Off". Pending requests with Approve/Deny buttons. Upcoming approved section.

- [x] **Benefits** (`/benefits`): Page title "Benefits". Cards grid for each benefit plan with cost breakdown.

---

## P2 — Secondary Features

<!-- Depth features. Implement after P1 is solid. -->

- [x] **Org Chart** (`/people/org-chart`): Visual tree/hierarchy rendering.

- [x] **Team Insights** (`/people/team-insights`): Dashboard with summary cards and charts.

- [x] **Performance** (`/people/performance`): Placeholder page with empty state.

- [x] **Pay Contractors** (`/payroll/contractors`): Table of contractors.

- [x] **Taxes & Compliance** (`/taxes`): Tax documents and setup tabs.

- [x] **Reports** (`/reports`): Card grid of available report types.

- [x] **Company Details** (`/company`): Company info with edit sections.

- [x] **Documents** (`/documents`): Document list with search and upload modal.

- [x] **Settings** (`/settings`): Notification toggles and company settings.

- [x] **Refer & Earn** (`/refer`): Full page with referral program info, email invite form, referral link copy, and referral history table.

- [x] **Search functionality**: Top bar search input with employee filtering.

- [x] **User profile dropdown**: Click user avatar/name shows dropdown.

- [x] **Notification bell**: Click bell shows notification dropdown.

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. Reference data_model.md for complete schemas. -->

- [x] **Company**: 1 company "Horizon Tech Solutions" with 2 locations, 5 departments
- [x] **Employees**: 13 employees across 5 departments
- [x] **Contractors**: 2 contractors
- [x] **Payrolls**: 1 Draft + 3 Complete historical payrolls
- [x] **Time entries**: 2 weeks of entries for Alex Martin
- [x] **Time off requests**: 4 requests — 2 Pending, 2 Approved
- [x] **Benefit plans**: 4 plans — Medical, Dental, Vision, 401(k)
- [x] **Tax forms**: 6 forms
- [x] **Documents**: 5 documents
- [x] **Todo items**: 4 dashboard action items
- [x] **Onboarding checklist**: 1 checklist for Craig Ellis with 6 tasks
- [x] **Company holidays**: 9 standard US holidays for 2025

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login / logout (app starts pre-logged-in as "Jessica Jackson", Administrator)
- Real tax calculations (display realistic static/computed numbers)
- Actual payment processing or bank transfers
- Email or SMS notifications
- Real file uploads (documents are metadata-only)
- Third-party integrations / App directory functional connections
- Mobile responsive layout (desktop-only is fine)
- Actual W-2/1099 PDF generation
