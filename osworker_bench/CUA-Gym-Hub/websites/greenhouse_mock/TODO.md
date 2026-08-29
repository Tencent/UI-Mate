# Xreenhouse Recruiting Mock — TODO

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

- [x] **Project scaffold**: `npm create vite@latest greenhouse_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`, `recharts`, `date-fns`, `clsx`, `uuid`. No TypeScript — plain JSX.

- [x] **Visual design system**: Study `assets/screenshots/` carefully. The Xreenhouse UI uses a **dark green top bar** and clean white/gray content area. Exact palette:
  - Top nav bar background: `#1B3A2D` (very dark forest green)
  - Primary accent / buttons / links: `#2D9D78` (teal-green)
  - Primary accent hover: `#248A69`
  - Logo green: `#3BB893`
  - Page background: `#F5F5F5` (light gray)
  - Card/panel background: `#FFFFFF`
  - Text primary: `#1A1A1A`
  - Text secondary: `#6B7280`
  - Text muted: `#9CA3AF`
  - Border: `#E5E7EB`
  - Divider: `#F3F4F6`
  - Red (needs action / strong no): `#DC2626`
  - Yellow (needs scorecard / warning): `#F59E0B`
  - Green (hired / strong yes): `#16A34A`
  - Blue (info): `#2563EB`
  - Font family: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  - Font sizes: 12px (small labels), 14px (body/nav), 16px (card headers), 20px (page titles), 24px (main headings)
  - Border radius: 6px (cards), 4px (buttons/inputs), 50% (avatars)
  - Box shadow on cards: `0 1px 3px rgba(0,0,0,0.08)`

- [x] **App layout**: Full-width layout, no sidebar. Top navigation bar is 56px tall, dark green (`#1B3A2D`), horizontally arranged:
  - **Left section**: Xreenhouse "g" logo icon (stylized lowercase "g" with a circle — use an SVG or text rendering in `#3BB893`) + "Recruiting" text in white, 16px medium weight
  - **Center/Nav tabs**: Horizontal tab links — "All Jobs", "Candidates", "Reports" — white text 14px, active tab has white underline 2px bottom border. Spacing: 24px between tabs
  - **Right section**: Search icon (magnifying glass), notification bell icon with badge count, user greeting "Hi Jules" + 32px round avatar
  Content area: below nav, `max-width: 1200px`, centered, `padding: 24px`

- [x] **Routing**: `App.jsx` with `BrowserRouter`, routes:
  - `/` → Dashboard (redirect to `/dashboard`)
  - `/dashboard` → Dashboard page
  - `/jobs` → All Jobs list
  - `/jobs/:jobId` → Job detail (with sub-routes: overview, pipeline, candidates, setup)
  - `/jobs/:jobId/pipeline` → Visual pipeline kanban
  - `/jobs/:jobId/candidates` → Job candidate list
  - `/candidates` → All Candidates list
  - `/candidates/:candidateId` → Candidate profile
  - `/candidates/:candidateId/scorecard/:scorecardId` → Scorecard view/edit
  - `/reports` → Reports dashboard
  - `/reports/:reportId` → Individual report
  - `/interviews` → All upcoming interviews
  - `/go` → State inspector (Go.jsx)
  All routes must preserve `?sid=` query parameter across navigation using a helper component.

- [x] **State management**: `AppContext.jsx` with `useReducer`. Actions:
  - `SET_STATE` — bulk state replacement (for POST /post)
  - `UPDATE_JOB` — update job fields
  - `ADD_JOB` — create new job
  - `UPDATE_APPLICATION` — update application fields (stage, status, etc.)
  - `ADD_APPLICATION` — add candidate to job
  - `MOVE_APPLICATION_STAGE` — move candidate to different pipeline stage
  - `REJECT_APPLICATION` — reject with reason
  - `ADD_CANDIDATE` — create new candidate
  - `UPDATE_CANDIDATE` — update candidate fields
  - `ADD_SCORECARD` — create new scorecard
  - `UPDATE_SCORECARD` — submit/update scorecard
  - `ADD_INTERVIEW` — schedule interview
  - `UPDATE_INTERVIEW` — update interview details
  - `ADD_OFFER` — create offer
  - `UPDATE_OFFER` — update offer status
  - `ADD_NOTE` — add note to candidate
  - `UPDATE_NOTE` — edit/pin note
  - `DELETE_NOTE` — remove note
  - `ADD_NOTIFICATION` — add notification
  - `MARK_NOTIFICATION_READ` — mark single as read
  - `MARK_ALL_NOTIFICATIONS_READ` — mark all as read
  - `ADD_ACTIVITY` — add activity feed entry
  State is initialized from `dataManager.js`'s `createInitialData()` and persisted to localStorage.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` at `/go` route. Returns JSON: `{ initial_state, current_state, state_diff }`. `initial_state` is captured on first load, `current_state` is live state from context, `state_diff` is a deep diff showing only changed fields. Display as formatted JSON in a `<pre>` tag with monospace font.

- [x] **Session isolation**: `vite.config.js` mock-api plugin implementing:
  - `POST /post?sid=<sid>` with `{"action":"set","state":{...}}` — sets both initial + current state
  - `POST /post?sid=<sid>` with `{"action":"set_current","state":{...}}` — updates only current state
  - `POST /post?sid=<sid>` with `{"action":"reset"}` — resets to initial
  - `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
  - `POST /upload?sid=<sid>` — multipart file upload
  - `GET /files/<sid>/<filename>` — serve uploaded files
  Session state stored in-memory Map keyed by sid. When no sid, use default session.

---

## P1 — Primary Features
<!-- Core features a user interacts with in the first 5 minutes. -->

- [x] **Dashboard page** (`src/pages/Dashboard.jsx`): Main landing page after nav. Grid layout with widget cards (white background, rounded corners, subtle shadow). Widgets:
  1. **My Tasks** — left column, full height. Two tabs: "My tasks" / "All tasks". List items with green dot indicator and count badge: "Application Review (5)", "Phone Screen (3)", "Needs Decision (2)", "Scorecards Due (4)", "Interviews Today (2)". Clicking a task category navigates to filtered candidate list. Each item shows count in a rounded pill badge on right.
  2. **Applications Over Time** — top-right, line chart (recharts `LineChart`) showing applications per week for last 3 months. Teal line (`#2D9D78`) with dots at data points. Y-axis: 0-25, X-axis: week labels.
  3. **Pipeline Summary** — right side card. Horizontal bars showing candidate count per stage (Application Review: 201, Phone Screen: 165, Interview: 65, Onsite: 12, Reference Check: 15, Offer: 8). Each bar is proportional width, teal fill. Numbers right-aligned in red.
  4. **Candidates I'm Following** — bottom section. Table: Name (bold, clickable link), Department, Office, Current Status. Show 5 followed candidates from seed data.
  5. **Upcoming Interviews** — card showing next 3 scheduled interviews: candidate name, job title, time, interviewer(s).
  6. **Prospecting** — small card: "Current prospects: 12" with teal "Find prospects" button (non-functional, visual only).

- [x] **All Jobs page** (`src/pages/Jobs.jsx`): Route `/jobs`. Header: "All Jobs" title + "Create Job" teal button (top-right). Filter bar: search input (magnifying glass icon), status dropdown (All / Open / Closed / Draft), department dropdown, office dropdown. Table with columns: Job Title (bold, linked to `/jobs/:id`), Department, Office, Status (colored badge: green="Open", gray="Closed", yellow="Draft"), Openings, Candidates (count), Hiring Manager, Recruiter, Created date. Rows are clickable → navigate to job detail. Sort by clicking column headers. Show all 6 seed jobs.

- [x] **Job Detail page** (`src/pages/JobDetail.jsx`): Route `/jobs/:jobId`. Left sidebar navigation for the job (visible only on job detail, not global): Overview, Pipeline, Candidates, Job Posts, Hiring Team, Job Setup. Top section: job title (24px bold), department + office badges, status badge, hiring manager avatar+name, recruiter avatar+name.
  - **Overview tab** (default): Job description text, requirements list, key metrics cards (Total Candidates, Active, Rejected, Hired as 4 number cards in a row), recent activity list.
  - **Hiring Team sub-tab**: List of team members with role (Recruiter, Coordinator, Hiring Manager) and avatar+name. "Add member" button opens a dropdown to select user+role.

- [x] **Visual Pipeline** (`src/pages/Pipeline.jsx`): Route `/jobs/:jobId/pipeline`. Kanban board. Each column = one `JobStage` for this job. Column header: stage name + candidate count badge. Candidate cards inside columns, each card showing:
  - Candidate full name (bold, clickable → opens candidate profile)
  - Current title + company (truncated, gray text)
  - Days in stage: "3 days" in small muted text
  - Color-coded left border: Red=`#DC2626` if actionRequired is "needs_scheduling" or "needs_decision", Yellow=`#F59E0B` if "needs_scorecard", Gray=`#D1D5DB` if null or "awaiting_candidate"
  - Source icon: small indicator (referral=people icon, applied=inbox icon, sourced=search icon)
  Cards are draggable (use HTML5 drag-and-drop or a lightweight library). Dropping a card on a different column dispatches `MOVE_APPLICATION_STAGE` and adds an `ADD_ACTIVITY` entry. Show max 10 candidates per column with "Show all (N)" link that expands. Filter/sort bar above: search input, sort dropdown (Priority, Time in Stage, Name, Date Applied).

- [x] **Job Candidates list** (`src/pages/JobCandidates.jsx`): Route `/jobs/:jobId/candidates`. Table view of all candidates for this job. Columns: Candidate Name (linked), Current Stage, Status (colored badge: active=green, rejected=red, hired=blue), Days in Stage, Source, Recruiter, Last Activity (relative date). Filter bar: stage dropdown, status dropdown, source dropdown, search input. Bulk actions: select multiple via checkboxes → "Reject", "Move to Stage" dropdown. Sortable columns.

- [x] **All Candidates page** (`src/pages/Candidates.jsx`): Route `/candidates`. Header: "Candidates" title + "Add Candidate" teal button. Search bar with name search. Table: Name (linked to profile), Email, Current Company, Current Title, Source, Applied Jobs count, Last Activity (relative date). Filterable by source. Sortable columns. Clicking a row navigates to candidate profile.

- [x] **Candidate Profile page** (`src/pages/CandidateProfile.jsx`): Route `/candidates/:candidateId`. Three-section layout:
  - **Header bar**: Candidate name (24px bold), current title + company, location, email (clickable), phone. Action buttons on right: "Email" (teal outline), "Move Stage" dropdown (teal), "Reject" (red outline), "Add to Job" button. If candidate has multiple applications, show a job selector dropdown.
  - **Main content area** (left 65%): Tab navigation — "Activity", "Scorecards", "Interviews", "Offers"
    - **Activity tab**: Reverse-chronological activity feed. Each entry: icon (stage_change=arrow, scorecard=clipboard, note=pencil, email=mail, interview=calendar), description text, actor name, relative timestamp. Auto-generated from `activityFeed` entries for this candidate.
    - **Scorecards tab**: List of scorecards grouped by application/job. Each scorecard card shows: interviewer avatar+name, stage name, overall recommendation (colored badge: strong_yes=dark green, yes=green, no_opinion=gray, no=orange, strong_no=red), submitted date or "Pending" in yellow. Clicking opens full scorecard view.
    - **Interviews tab**: List of scheduled interviews. Each: date/time, stage, interviewers, location/video link, status badge. "Schedule Interview" button at top.
    - **Offers tab**: List of offers with salary, start date, status, approval chain progress.
  - **Right sidebar** (35%): Tabbed panels — "Details", "Application", "Notes"
    - **Details tab**: Personal info (email, phone, location), current company, current title, resume link, LinkedIn link, source, tags (as removable chips + add tag input), referred by (if applicable).
    - **Application tab**: Applied date, current stage with progress dots (visual indicator showing which stage they're at in the pipeline — filled dots for passed stages, outlined dot for current, empty for future), recruiter, coordinator, rejection info if rejected.
    - **Notes tab**: List of notes with author avatar+name, timestamp, body text, pin icon, visibility badge (public/private). "Add Note" textarea at top with visibility dropdown and "Save" button. Pinned notes shown first with pin icon.

- [x] **Scorecard View/Edit** (`src/pages/ScorecardForm.jsx`): Route `/candidates/:candidateId/scorecard/:scorecardId` or modal overlay. Header: "Interview Scorecard" with dark green banner (matching screenshot). Candidate avatar (64px round) + name + applied job title. Section for each attribute category: attribute name label, 4-point rating radio buttons displayed as dots/circles (empty=unselected, filled=selected), with verdict icons at the right (👍 thumbs up green for 3-4, 👎 thumbs down red for 1, ⭐ star gold for 4). Text area for notes per attribute. Overall Recommendation section at bottom: 5 radio options displayed as styled buttons in a row — "Strong No" (red), "No" (orange), "No Opinion" (gray), "Yes" (green), "Strong Yes" (dark green). Overall notes textarea. "Submit Scorecard" teal button. If already submitted, show as read-only with values pre-filled.

- [x] **Add Candidate modal** (`src/components/AddCandidateModal.jsx`): Triggered by "Add Candidate" button on Candidates page. Modal with form fields: First Name, Last Name, Email, Phone, Current Company, Current Title, Location, Source dropdown (Applied/Referral/Sourced/Agency/Internal), Referrer dropdown (if source=Referral, select from users), Job dropdown (select from open jobs), Resume upload placeholder. Footer: "Add Candidate" teal button + "Cancel". On submit: dispatches `ADD_CANDIDATE` + `ADD_APPLICATION` + `ADD_ACTIVITY`.

- [x] **Move Stage action**: When clicking "Move Stage" on candidate profile or dragging in pipeline, show a dropdown/popover listing all stages for the job. Current stage highlighted. Selecting a different stage: dispatches `MOVE_APPLICATION_STAGE` (updates `currentStageId`, resets `daysInCurrentStage` to 0, sets `lastActivityAt` to now) + `ADD_ACTIVITY` (type: `"stage_change"`, metadata: `{ fromStage, toStage }`).

- [x] **Reject Candidate action**: Clicking "Reject" on candidate profile opens a modal: "Reject [Name]?" with rejection reason dropdown (from `rejectionReasons`), optional notes textarea, optional "Send rejection email" checkbox (visual only). "Reject" red button + "Cancel". On confirm: dispatches `REJECT_APPLICATION` (sets status to "rejected", rejectedAt to now, rejectionReason) + `ADD_ACTIVITY`.

- [x] **Global Search** (`src/components/SearchModal.jsx`): Clicking the search icon in the top nav opens a modal/overlay with a large search input at the top. Real-time search across candidates (by name, email, company) and jobs (by title). Results grouped: "Candidates" section showing matching candidates (avatar + name + company), "Jobs" section showing matching jobs (title + department + status badge). Clicking a result navigates to the detail page and closes the search. Keyboard shortcut: `/` opens search.

- [x] **Notifications panel** (`src/components/NotificationsPanel.jsx`): Clicking the bell icon in the top nav opens a dropdown/popover panel (320px wide, max 400px tall, scrollable). Header: "Notifications" + "Mark all as read" link. Each notification: icon by type (scorecard_due=clipboard, interview_reminder=calendar, candidate_applied=user-plus, stage_change=arrow-right, offer_update=file-text, mention=at-sign), title (bold if unread), message, relative timestamp, blue unread dot indicator on left. Clicking a notification marks it as read and navigates to `link`. Unread count shown as red badge (rounded circle, white text) on bell icon in nav bar — hidden when 0.

- [x] **Create Job modal/page** (`src/components/CreateJobModal.jsx`): Triggered by "Create Job" button on All Jobs page. Modal or full page form: Job Title (text input, required), Department (dropdown), Office (dropdown), Hiring Manager (user dropdown), Recruiter (user dropdown, defaults to current user), Openings (number input, default 1), Description (textarea), Requirements (multi-line, one per line). Footer: "Create Job" teal button + "Cancel". On submit: creates job with draft status, auto-generates 8 default pipeline stages, dispatches `ADD_JOB`, navigates to new job's detail page.

- [x] **Schedule Interview modal** (`src/components/ScheduleInterviewModal.jsx`): Triggered from candidate profile Interviews tab or from pipeline card actions. Form: Stage (dropdown, defaults to current stage), Interviewers (multi-select from users), Date (date picker input), Time (time picker), Duration (30min/45min/60min dropdown), Location (text input, or "Video Call" checkbox that generates a mock URL). Footer: "Schedule" teal button + "Cancel". On submit: dispatches `ADD_INTERVIEW` + `ADD_ACTIVITY` + `ADD_NOTIFICATION` (to interviewers).

---

## P2 — Secondary Features
<!-- Depth and realism, implement after P1 is complete. -->

- [x] **Reports Dashboard** (`src/pages/Reports.jsx`): Route `/reports`. Grid of report category cards: "Pipeline Health", "Recruiting Efficiency", "Offers & Hires", "Sourcing", "Candidate Survey". Each card: icon, title, brief description, "View Report" link. Below cards: "All Reports" section with list of specific reports (Pipeline History, Time to Hire, Source Effectiveness, etc.)

- [ ] **Pipeline Health Report** (`src/pages/reports/PipelineHealth.jsx`): Route `/reports/pipeline-health`. Filter bar at top (matching screenshot): Rows dropdown (Stage), Job Filter ("For X Open Jobs" + "Change Filter" button), Group of Candidates dropdown, checkbox "Include Migrated Candidates", "Apply" teal button. Below filters: stacked horizontal bar chart showing candidates at each pipeline stage across all open jobs. Use recharts `BarChart` with horizontal layout. Second chart: funnel visualization showing pass-through rates between stages.

- [ ] **Time to Hire Report** (`src/pages/reports/TimeToHire.jsx`): Average time to hire by department/job. Bar chart (recharts) showing average days from application to hire for each department. Table below with job-level detail: Job Title, Avg Days to Hire, Total Hires, Avg Days per Stage.

- [ ] **Source Effectiveness Report** (`src/pages/reports/SourceReport.jsx`): Donut chart showing candidate distribution by source. Table: Source Name, Candidates, Applications, Interviews, Offers, Hires, Conversion Rate %. Use seed data sources.

- [ ] **Offer Management**: On candidate profile Offers tab, add "Create Offer" button. Opens modal with: Base Salary (number input), Start Date (date picker), Expiration Date (date picker), Approvers (multi-select from users). On create: dispatches `ADD_OFFER` with status "pending_approval". Offer card shows approval chain: each approver with status icon (pending=clock, approved=check, rejected=x). Approver can click "Approve" or "Reject" button on the offer (simulated as current user approving). Once all approved, status changes to "approved" and "Send Offer" button appears (changes status to "sent").

- [ ] **Job posting preview**: On Job Detail page, "Job Posts" sub-tab shows a preview of how the job would appear on a public job board. Rendered as a styled card: job title, department, office/location, full description, requirements as bullet list, "Apply" button (visual only). Toggle between "Published" and "Draft" status.

- [ ] **Candidate tags management**: On candidate profile Details tab, tags section shows existing tags as colored chips. Click "+" to add a tag — shows dropdown with existing tags from all candidates + free text input to create new tag. Click "x" on a chip to remove tag. Tags are useful for filtering on the All Candidates page (add tag filter dropdown).

- [ ] **My Tasks sidebar** (`src/components/TasksSidebar.jsx`): Slide-out panel from right side (or always-visible sidebar on dashboard). Shows task categories with counts: Application Review, Phone Screen, Needs Decision, Forms to Send, Scorecards Due. Each category is expandable, showing the specific candidates that need action. Clicking a candidate navigates to their profile. Tasks are computed from application state: "Application Review" = applications in Application Review stage with actionRequired="needs_decision", "Scorecards Due" = scorecards where submittedAt is null and interviewerId is current user.

- [ ] **Interview calendar view** (`src/pages/Interviews.jsx`): Route `/interviews`. Two views toggled by buttons: "List" and "Calendar". List view: table of all interviews sorted by date (upcoming first) — Date/Time, Candidate, Job, Stage, Interviewers, Location, Status badge. Calendar view: simple week grid (Mon-Fri, 9am-6pm) with interview blocks placed at their scheduled times. Each block shows candidate name + job abbreviation. Clicking a block opens candidate profile.

- [ ] **Keyboard shortcuts**: `R` on candidate profile = open resume link, `X` = open reject modal, `M` = open move stage dropdown, `/` = open global search, `Esc` = close any modal. Show a "?" shortcut help modal listing all shortcuts.

- [ ] **Bulk actions on candidate list**: On Job Candidates list, add checkboxes on each row. When 1+ rows selected, show action bar: "N selected" + "Move to Stage" dropdown + "Reject" button + "Email" button (visual). Move to Stage applies to all selected applications. Reject opens confirmation modal listing selected candidates.

---

## Data Seed (implement in createInitialData())
<!-- Dev must create realistic seed data matching these specs. -->

- [x] **Users**: 8 users as specified in `data_model.md §Users`. Current user is Jules Park (user-1, recruiter). Include realistic titles and departments.

- [x] **Jobs**: 6 jobs as specified in `data_model.md §Jobs`. 5 open, 1 closed. Each with distinct department/office combinations. Each open job has 8 default pipeline stages.

- [x] **Candidates**: 20 candidates with diverse, realistic names (mix of ethnicities/genders). Each has: current company (real-sounding tech companies: "Stripe", "Figma", "Airbnb", "Notion", etc.), current title, location, source. At least 3 referrals, 10 applied, 5 sourced, 2 agency.

- [x] **Applications**: 25 applications. Distribution: Senior Frontend Engineer job gets 8 applications (at various stages from Application Review to Offer), Product Designer gets 5, Backend Engineer gets 6, Product Manager gets 4, Marketing Coordinator gets 2. Include 3 rejected applications (different reasons), 1 hired. Ensure each pipeline stage has at least 1-2 candidates for the main jobs so the pipeline view is interesting.

- [x] **Scorecards**: 15 scorecards. 10 submitted with varied ratings and recommendations (mix of strong_yes to strong_no), 5 pending (submittedAt=null). Associate with applications in Phone Screen and Interview stages.

- [x] **Interviews**: 10 interviews. 4 scheduled (future dates relative to "today"), 5 completed, 1 cancelled. Various durations and locations.

- [x] **Offers**: 3 offers. 1 pending_approval (for a Senior Frontend Engineer candidate), 1 sent (for Product Designer), 1 accepted (for the closed DevOps Engineer job, establishing a "hired" candidate).

- [x] **Notes**: 12 notes across 8 different candidates. Mix of public/private visibility. 2 pinned. Content like "Strong React experience, ask about system design in onsite", "Candidate preferred hybrid schedule", "Referred by our CTO, prioritize".

- [x] **Activity Feed**: 30+ entries covering: application_submitted (for each application), stage_change events, scorecard_submitted events, note_added, interview_scheduled, offer_created. Spread across the last 30 days with realistic timestamps.

- [x] **Notifications**: 8 for current user (Jules Park). 3 unread: "New application from Alex Chen for Senior Frontend Engineer", "Scorecard due: Interview with Maria Santos", "Offer awaiting your approval: Product Designer". 5 read: older application notifications, interview reminders, stage changes.

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login (app starts pre-logged-in as `Jules Park`, recruiter)
- Real email sending or calendar integration
- AI-powered features (job description generation, candidate summaries)
- Xreenhouse Onboarding module (separate product)
- CRM / prospect nurturing campaigns
- Third-party integrations or webhooks
- EEOC/diversity compliance reporting
- Real file uploads (resume upload is a visual placeholder only)
- Approval workflow email notifications
- Multi-organization support
