# Xattice Mock — TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [x] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

- [x] Project scaffold: `npm create vite@latest lattice_mock -- --template react`, install deps: `react-router-dom`
- [x] **Visual design system**: Study `assets/screenshots/home_dashboard.jpg` and `assets/screenshots/grow_page_idp.jpg`. The Xattice app uses a **dark navy sidebar** (#1B1E3D) ~200px wide with white text, a **white main content area**, and **warm peach/salmon gradient** header on the home page. Font: Inter (import from Google Fonts) or system sans-serif. Primary action color: blue #4C6EF5. Text: #1A1A2E primary, #6B7280 muted. Cards: white bg, 1px border #E5E7EB, border-radius 8px, subtle shadow. Status colors: green #22C55E (on track/completed), amber #F59E0B (progressing/still receiving), red #EF4444 (behind), gray #9CA3AF (not started). Sidebar active item: light blue-purple background pill #E8EAFF.
- [x] App layout: Fixed left sidebar (200px, dark navy #1B1E3D, full viewport height). Main content area fills remaining width with 32px padding. Sidebar has: Xattice logo area at top (multicolor diamond icon + "Xattice" white text + search icon), main nav items vertically stacked (icon + label, 14px medium weight, white, 40px row height, 16px left padding), divider line, company name section, bottom section pinned to bottom with Tasks/Help/User avatar+name. Active nav item has rounded pill highlight bg #E8EAFF with blue text.
- [x] Routing: App.jsx with BrowserRouter. Routes: `/` (Home), `/1on1s` (1:1 Meetings list), `/1on1s/:id` (1:1 detail), `/feedback` (Feedback), `/updates` (Updates), `/grow` (Grow), `/grow/career-tracks` (Career Tracks), `/goals` (Goals), `/goals/:id` (Goal detail), `/engagement` (Engagement), `/reviews` (Reviews), `/reviews/:id` (Review cycle detail), `/people` (People directory), `/people/:id` (Person profile), `/compensation` (Compensation), `/go` (State inspector)
- [x] Sidebar component: Render all nav items with react-router NavLink. Items: 1:1s (calendar icon), Feedback (message-circle icon), Updates (refresh-cw icon), Grow (trending-up icon), Goals (target icon), Engagement (heart icon), Reviews (clipboard-check icon). Divider. Company name "Evergreen Technologies, Inc" (link to /people). Bottom: Tasks (check-square icon), Help (help-circle icon), User profile row (avatar circle with initials + "Sarah Chen"). Use simple SVG icons or Unicode for icons — no external icon library required.
- [x] State management: Create AppContext.jsx wrapping the app. Create `utils/dataManager.js` with `createInitialData()` returning all entities per `assets/data_model.md`. Store state in localStorage keyed by session ID. Provide `getState()`, `setState()`, `resetState()`, `getStateDiff()` functions.
- [x] `/go` endpoint: `src/pages/Go.jsx` mounted at `/go`. Renders JSON with `{ initial_state, current_state, state_diff }`. state_diff computed by deep-comparing initial vs current state.
- [x] Session isolation: Add Vite plugin in `vite.config.js` for mock API: `POST /post?sid=<sid>` (set/reset state), `GET /state?sid=<sid>` (read state). DataManager reads `sid` from URL query params and uses `lattice_<sid>` as localStorage key. When no sid, use `lattice_default`.

---

## P1 — Primary Features

### Home Dashboard (`/`)
- [x] Welcome banner: Full-width section at top with warm peach/salmon gradient background (linear-gradient from #F8D3C5 at left to #FDE8E0 at right). Left side: 48px round avatar + "Welcome, Sarah!" in 28px semibold dark text. Right side: "Give or request feedback" button (outlined, border #1A1A2E, rounded 8px) and "More actions" dropdown button (outlined, with chevron-down). "More actions" dropdown shows: "Request feedback", "Give praise", "Create a goal", "Write an update" — each navigates to the corresponding page/modal.
- [x] Tasks card: White card with "Tasks" heading (18px semibold) + "Sorted by priority" muted text + info circle icon. Lists pending tasks (from state.tasks where completed=false) as rows: task title, due date pill if due soon, task type icon. When all tasks are done, show empty state: centered party popper emoji (🎉 large 48px) + "You're all caught up on tasks this week!" in muted text. Clicking a task navigates to its related entity (e.g., clicking a review task → /reviews/:id).
- [x] Active goals card: White card below tasks. Header: "Active goal (N)" with count in parens, info icon, "Create goal" button (outlined, right-aligned). Goals grouped by status label ("Progressing" in amber, "On track" in green, etc.). Each goal row: colored status dot (8px circle), goal title (14px, dark), "Last updated on [date]" in muted small text, chevron-right icon. Clicking a goal → `/goals/:id`.
- [x] Right sidebar panel: Fixed ~280px panel on right side of home page (not a global sidebar — only on home). Contains 3 stacked cards: **Manager card**: 40px avatar + manager name + "View org chart" button (outlined, small). **1:1s card**: "1:1s" header + "Add 1:1" button; list upcoming 1:1: avatar + name, date/time, "N talking points" in muted text. **Celebrations card**: "🎉 Celebrations" header; tab row: "New hires" | "Birthdays" | "Anniversaries"; each tab shows row of 32px avatar circles (colored initials), "+N" overflow pill, "Show more" link.

### 1:1 Meetings (`/1on1s`)
- [x] 1:1 list page: Header "1:1s". List of 1:1 relationships as cards: other person's avatar (40px) + name + title, frequency label ("Weekly"), next meeting date, count of talking points. Click → `/1on1s/:id`.
- [x] 1:1 detail page (`/1on1s/:id`): Header with other person's avatar+name, meeting date/time selector (static display). Two-column layout: left column is **Talking Points** section, right column is **Notes** section. Talking points: ordered list, each with checkbox (mark as discussed), text, "Added by [name]" muted label. "+" button at bottom to add new talking point (inline text input). Action items section below talking points: each with checkbox, text, assignee avatar, due date. "Add action item" button. Notes: textarea for free-form meeting notes (auto-saves to state).
- [x] 1:1 meeting history: Below the active meeting, show "Previous meetings" collapsible section. List past meetings as rows: date, "N topics discussed", "N action items". Clicking expands to show that meeting's talking points and notes (read-only).

### Feedback (`/feedback`)
- [x] Feedback page with tab navigation: "Received" | "Given" | "Praise" tabs at top. Each tab shows a filtered list of feedback cards.
- [x] Feedback card component: White card with: sender/recipient avatar (36px) + name + title, timestamp ("3 days ago"), visibility badge (🔒 Private, 👁 Public, 👤 Manager only) as small pill, feedback body text, competency tags as small colored pills at bottom (e.g., "Leadership" in blue pill, "Communication" in green pill).
- [x] Praise tab: Shows public praise items as cards. Each praise card: giver avatar+name → recipient avatar+name (with arrow between), message body, company value tag (e.g., "🌟 Teamwork" in highlighted pill), timestamp, reaction row (👏 emoji + count, clickable to toggle current user's reaction).
- [x] Give feedback modal/page: Triggered by "Give or request feedback" button on home or nav. Form: recipient search (text input with dropdown showing matching users with avatars), feedback type toggle (Feedback / Praise), textarea for message body, visibility selector (radio buttons: Private / Public / Manager only — shown only for feedback type, praise is always public), competency tag multi-select, optional value tag selector (for praise). Submit button creates new feedback entry in state and navigates to feedback page.
- [x] Request feedback page: Form: select people to request from (multi-user search/select), optional prompt text ("What would you like feedback on?"). Submit creates tasks for the selected users.

### Goals (`/goals`)
- [x] Goals list page: Header "Goals". Filter row: segmented control "My Goals" | "Team Goals" | "Company Goals". Status filter dropdown: All, On track, Progressing, Behind, Completed. Below filters: list of goal cards.
- [x] Goal card (list item): White card row. Left: colored status dot (green/amber/red/gray, 10px), goal title (16px semibold), owner avatar+name (small, muted). Right: progress bar (thin horizontal bar, colored by status, showing % filled), due date in muted text, chevron-right.
- [x] Goal detail page (`/goals/:id`): Full page. Header: goal title (24px), status badge (colored pill), edit button. Sections: **Description** (text block), **Owner** (avatar + name + title), **Due date**, **Parent goal** (if aligned, show link to parent), **Progress** (large progress bar with percentage). **Key Results** section: list of KRs, each with: title, progress bar (start → current → target), numeric values ("3 of 5 pages"), update button to change current value. **Activity/Comments** section at bottom: timeline of updates (status changes, KR updates) with timestamps.
- [x] Create goal modal: Triggered by "Create goal" button. Form: Title (text input), Description (textarea), Category (My Goal / Team Goal / Company Goal), Status (dropdown), Due date (date input), Parent goal (optional dropdown), Key Results section (dynamic list — "Add key result" button, each KR has title + start/current/target value inputs). Submit adds to state.goals.
- [x] Update goal: On goal detail page, clicking status badge opens dropdown to change status. Clicking KR "Update" button opens inline editor to change currentValue. Each update adds an entry to activity timeline.

### Reviews (`/reviews`)
- [x] Reviews list page: Header "Reviews". Shows review cycles as large cards. Each card: cycle name (20px semibold, e.g., "Q1 2025 Performance Review"), date range, status badge, progress summary ("3 of 5 reviews completed").
- [x] Review cycle detail (`/reviews/:id`): Dark teal/navy header bar with cycle name + close (X) button. Left sidebar navigation: step list (Nominate peers ✓, Manage team ●, Share results ○) — checkmark for completed, filled circle for current, empty circle for upcoming. Main area: **Progress card** at top showing stacked horizontal bar (green=Completed, amber=Still Receiving, gray=Not Started) with legend showing counts and percentages (e.g., "Completed: 1 review, 20%"). **"Manage your team"** section below: list of team members with 48px avatar, name (bold), title (muted), status badge pill (COMPLETED in green bg, STILL RECEIVING in amber bg, NOT STARTED in gray bg), "Show reviewers" link that expands to show who is reviewing that person. See `assets/screenshots/review_cycle_manage_team.jpg` for exact layout.
- [x] Self-review form: When current user clicks on their own pending review (or from tasks), open a form page. Sections: Overall self-assessment (textarea), competency self-ratings (list of competencies with 1-5 star or button rating), question-response pairs (textarea for each question like "What are your key accomplishments?"). Submit button marks the review as completed and updates state.
- [x] Peer nomination: Step 1 of review cycle. Show list of colleagues with checkboxes to nominate as peer reviewers. "Confirm nominations" button saves selections.

### Updates / Weekly Check-ins (`/updates`)
- [x] Updates list page: Header "Updates". Reverse-chronological list of weekly updates. Each update card: "Week of [date]" header, author avatar+name, mood indicator (emoji: 😄 great, 🙂 good, 😐 okay, 😟 not great), sections for Accomplishments/Challenges/Priorities as labeled text blocks with subtle left border accent.
- [x] Write update form: "Write an update" button at top of page opens form. Three text areas: "What did you accomplish this week?" / "What challenges are you facing?" / "What are your priorities for next week?". Optional mood selector (row of emoji buttons, select one). Submit adds to state.updates.
- [x] Update detail: Clicking an update card expands or navigates to show full update with all fields rendered. Manager can view all direct reports' updates.

### Grow (`/grow`)
- [x] Grow overview page: Header "Grow" with "Best practices" link (muted, right side). Blue info banner below: "Welcome to your Individual development plan (IDP) — a space to plan and capture progress on your career development. Use the career vision exercises to clarify your long-term career objectives. Create growth areas to identify short-term development opportunities and track progress against them." See `assets/screenshots/grow_page_idp.jpg` for exact layout.
- [x] IDP section: Left side: **Career Track** label + current track name (e.g., "Product Marketing Manager") + "Browse all" link. **Career Vision** label + editable text field (e.g., "North Star Goal"). **Growth Areas** section: "+ New" button, "Active" header with "Hide" toggle, list of active growth area cards (title, "N of M actions completed", "Last updated [date]"), "Drafts" header with draft growth areas.
- [x] Growth area detail: Clicking a growth area expands or opens a detail panel. Shows: title, description, list of action items (checkboxes + text), progress indicator, "Delete" button. For recommended growth areas (right panel): show suggested area with title, description, suggested actions, "Delete" and "Add draft" buttons.
- [x] Career tracks page (`/grow/career-tracks`): List of available career tracks. Each track expandable to show levels and competencies per level as a matrix/table. Sub-nav item under Grow in sidebar.
- [x] Create/edit growth area: Modal or inline form: title, description, action items (dynamic list with add/remove), status (active/draft). Competency tag optional.

### Engagement (`/engagement`)
- [x] Engagement overview page: Header "Engagement". If there's an active survey needing response, show a prominent banner: "Q1 2025 Engagement Pulse is live! Complete by [date]" with "Take survey" button.
- [x] Take survey form: Full-page survey form. Each question rendered by type: **Likert (1-5)**: row of 5 radio buttons labeled "Strongly Disagree" to "Strongly Agree". **eNPS (0-10)**: row of 11 number buttons (0-10), colored gradient (red at 0, yellow at 5, green at 10). **Open text**: textarea. Progress indicator at top ("Question 3 of 5"). "Submit" button at end. Submission updates state.
- [x] Survey results view: After submission (or for closed surveys), show results dashboard: Overall engagement score (large number with trend arrow), eNPS score, category breakdown as horizontal bar charts (each category: label, score, bar filled proportionally), response rate percentage. This uses the aggregated `surveyResults` from state — individual responses are anonymous.

---

## P2 — Secondary Features

### People Directory (`/people`)
- [x] People list page: Header "People" (linked from company name in sidebar). Search bar at top. Table view: columns for Avatar+Name, Title, Department, Location, Manager. Rows are clickable → `/people/:id`. Filter dropdowns: Department, Location.
- [x] Person profile page (`/people/:id`): Left column: large avatar (80px), name (24px), title, department, location, start date, manager link. Right column: tabs: "About" (contact info, team) | "Goals" (person's goals) | "Feedback" (public feedback/praise for this person) | "Reviews" (past review summaries if visible).
- [x] Org chart: Accessible from "View org chart" button on home page manager card. Visual tree showing reporting structure. Each node: avatar + name + title. Current user highlighted. Click a node → navigate to that person's profile.

### Compensation (`/compensation`)
- [x] Compensation overview: Card showing current user's compensation info: base salary, bonus target %, equity grants (number of shares/options), total compensation. Note: "Compensation data shown is for demonstration purposes only" disclaimer.
- [x] Comp history: Table showing compensation changes over time: date, type (merit, promotion, equity refresh), old value, new value.

### Analytics (simplified)
- [x] If time permits: simple analytics page with mock charts: performance rating distribution (bar chart), goal completion rate (donut chart), review cycle completion (progress bars).

---

## Data Seed (implement in createInitialData())

- [x] **Users**: 10 employees as specified in `data_model.md §Seed Data Requirements`. Current user is Sarah Chen (user_1). Include diverse names, titles, departments. Each user has avatar: null (use colored circle with initials — generate consistent color from user ID).
- [x] **Goals**: 8 goals — 2 for current user (1 "on_track" at 65%, 1 "progressing" at 30%), 1 team goal (current user's manager owns it), 2 company OKRs, 1 completed goal, 1 behind goal, 1 not-started goal. Each with 2-3 key results with realistic metrics.
- [x] **Feedback**: 10 items — 3 private feedback received by current user from various colleagues, 2 public praise items (with value tags like "Teamwork", "Innovation" and 2-3 reactions each), 2 feedback given by current user, 2 praise given by others to others (visible in praise wall), 1 pending feedback request.
- [x] **1:1s**: 2 relationships — current user with manager (Marcus Johnson, weekly), current user with a report if manager, or with another colleague. 6 meeting instances: 2 upcoming (with 3-5 talking points each, 1-2 action items), 4 completed (with discussed talking points and notes).
- [x] **Review Cycles**: 1 active cycle ("Q1 2025 Performance Review") with 5 reviewees at various statuses (1 completed, 2 still receiving, 2 not started). Current user has a pending self-review (creates a task). 1 completed past cycle for history.
- [x] **Updates**: 4 weekly updates by current user, covering the last 4 weeks. Varied moods (great, good, good, okay). Realistic accomplishments/challenges/priorities text.
- [x] **Growth Areas**: 3 for current user — 2 active (one with 1/2 actions completed, one with 0/1), 1 draft. Titles like "Improve onboarding training skills", "Establish cross-functional team of talent experts", "Learn data visualization techniques".
- [x] **Career Tracks**: 2 tracks — "Product Manager" (3 levels with 4 competencies each), "Software Engineer" (4 levels with 5 competencies each).
- [x] **Engagement Survey**: 1 active survey ("Q1 2025 Engagement Pulse") with 5 questions (3 Likert, 1 eNPS, 1 open text). Aggregated results showing overall score 4.1/5, eNPS 32, category scores, 78% response rate. Current user has not yet responded (creates a task).
- [x] **Tasks**: 5 pending tasks for current user — "Submit self-review for Q1 Performance Review" (high priority), "Complete Q1 Engagement Pulse survey" (medium), "Update progress on v2.0 launch goal" (medium), "Prepare talking points for 1:1 with Marcus" (low), "Review Emily's feedback request" (medium).
- [x] **Celebrations**: 8 items for next 2 weeks — 2 birthdays (with month/day matching upcoming dates), 2 work anniversaries ("3 years", "1 year"), 3 new hires this month, 1 upcoming birthday for current user's teammate.
- [x] **Company**: name "Evergreen Technologies, Inc", departments list, company values list.

---

## Out of Scope
- Authentication / login (app starts pre-logged-in as Sarah Chen, user_1)
- Real email or Slack notifications
- AI-powered features (show static recommended growth areas, no dynamic AI)
- Admin configuration panels (survey creation, review cycle setup)
- Real file uploads
- Compensation benchmarking with external data
- Integration with external tools (Slack, JIRA, etc.)
- Mobile-specific responsive layouts (optimize for desktop 1280px+)
