# Xira Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-02-28
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing codebase: TypeScript + Vite + React 18 + Tailwind CSS + @hello-pangea/dnd + recharts + lucide-react + date-fns + clsx + uuid

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

## Existing Implementation (Already Built)
The following are already functional in the codebase and do NOT need reimplementation:
- [x] Project scaffold (Vite + React + TypeScript + Tailwind)
- [x] Session isolation (vite.config.js mock-api plugin with POST /post and GET /state)
- [x] State management (StoreContext.tsx with useReducer, dataManager pattern in mockData.ts)
- [x] `/go` endpoint (StateInspector.tsx at /go route)
- [x] Basic sidebar navigation (Sidebar.tsx with NavLink routing)
- [x] Board view with drag-drop columns (Board.tsx + IssueCard.tsx using @hello-pangea/dnd)
- [x] Backlog view with sprint sections, drag-drop, sprint start/complete (Backlog.tsx)
- [x] Issue detail modal with editing (IssueModal.tsx — summary, description, status, assignee, priority, story points, subtasks, comments)
- [x] Advanced search with table view and bulk selection (AdvancedSearch.tsx)
- [x] Bulk edit modal (BulkEditModal.tsx — status, assignee, priority, sprint)
- [x] Dashboard with charts (Dashboard.tsx — pie chart, bar chart, activity stream, assigned-to-me)
- [x] Reports with burndown chart (Reports.tsx)
- [x] RedirectWithQuery component for preserving ?sid= across navigations

---

## P0 — Core Shell Improvements
<!-- These fix foundational issues in the existing implementation. -->

- [x] **Visual design system audit**: Compare current Tailwind config against `assets/screenshots/`. Current tailwind.config.js defines xira colors correctly (`#0052CC`, `#172B4D`, `#F4F5F7`, `#DFE1E6`, `#36B37E`, `#FFAB00`, `#DE350B`, `#5E6C84`). Verify all components consistently use these tokens — check that Board column headers, Backlog section headers, and Dashboard cards all match the Atlassian Design System. Fix any hardcoded hex values that should use Tailwind classes.

- [x] **Data seed determinism**: The current `generateIssues()` in `mockData.ts` uses `Math.random()` which produces different data on every load — this makes agent training non-reproducible. Replace with **hardcoded, realistic seed data** (see `data_model.md` §Issues for exact specifications): 25 issues with specific summaries like "Set up CI/CD pipeline for staging environment", "Fix login page redirect loop on Safari", etc. Each issue should have deterministic type/status/priority/assignee/sprint assignments. Add a 3rd sprint (`s3`, state: `"closed"`, 5 issues all Done) for historical reporting data. All issues in the active sprint should have a realistic mix of statuses (2 To Do, 3 In Progress, 1 In Review, 2 Done).

- [x] **Add epicId field to Issue type**: In `types.ts`, add `epicId: string | null` to the `Issue` interface. In `mockData.ts`, add `epicId` to all generated issues (most `null`, but 8-10 issues should reference an Epic-type issue). Create 2 Epic-type issues (e.g., "Infrastructure & DevOps" and "User Experience Overhaul") that serve as parents.

- [x] **Add Notification entity**: In `types.ts`, add `Notification` interface (see `data_model.md` §Notification). In `AppState`, add `notifications: Notification[]`. In `StoreContext.tsx`, add reducer actions: `ADD_NOTIFICATION`, `MARK_NOTIFICATION_READ`, `MARK_ALL_NOTIFICATIONS_READ`. In `mockData.ts`, generate 8-10 seed notifications for the current user (3 unread, 5 read) covering comment, assignment, and status_change types.

- [x] **Add linkedIssueIds field to Issue type**: In `types.ts`, add `linkedIssueIds: string[]` to the `Issue` interface. Default to empty array `[]` for most issues. Link 2-3 pairs of issues together (e.g., bug "blocks" a story).

- [x] **Normalization for POST /post custom state**: In `mockData.ts`, update `deepMergeWithDefaults()` to normalize custom issue arrays — ensure each issue has all required fields with sensible defaults (status → "To Do", priority → "Medium", type → "Story", labels → [], subtasks → [], epicId → null, linkedIssueIds → []). Map unknown assigneeId values to null, unknown sprintId to null. Ensure storyPoints defaults to 0 if missing.

---

## P1 — Primary Feature Gaps
<!-- These are the most impactful missing interactive features for agent training. -->

- [x] **Create Issue Dialog (global modal)**: Add `CreateIssueModal.tsx` component. Triggered by: (1) a blue "Create" button in the sidebar (between project nav and search link), (2) keyboard shortcut "C" anywhere in the app. Modal contains a form with: **Project** dropdown (pre-selected to current project), **Issue Type** dropdown (Story/Task/Bug/Epic with colored icons — Story=green bookmark, Task=blue checkmark, Bug=red circle, Epic=purple lightning), **Summary** text input (required, auto-focus), **Description** textarea, **Assignee** dropdown (user list + "Unassigned"), **Priority** dropdown (with colored arrow icons matching IssueCard), **Labels** multi-select input (type to add, chip display, existing labels as suggestions), **Sprint** dropdown (active/future sprints + "Backlog"), **Story Points** number input, **Epic Link** dropdown (list of Epic-type issues or "None"). Footer: "Create" primary button (blue, disabled if summary empty) + "Cancel" text button. On create: dispatch `ADD_ISSUE` with auto-generated key (`{PROJECT_KEY}-{nextNumber}`), set reporterId to currentUser.id, set createdAt/updatedAt to now. Close modal and optionally navigate to the issue. Add `CREATE_ISSUE_MODAL_OPEN` and `CREATE_ISSUE_MODAL_CLOSE` to a UI state (can use local state in App.tsx or add to context).

- [x] **Sidebar "Create" button**: In `Sidebar.tsx`, add a prominent blue "Create" button (full sidebar width, `bg-xira-blue text-white`, `PlusCircle` icon + "Create" text) above the navigation links. Clicking it opens the CreateIssueModal. Style: `rounded-md py-2 px-4 font-medium text-sm`, with `hover:bg-blue-700` transition.

- [x] **Advanced Search filter dropdowns**: In `AdvancedSearch.tsx`, add a filter bar below the search input with 4 dropdown filters in a horizontal row: **Type** (All Types / Story / Task / Bug / Epic), **Status** (All Statuses / To Do / In Progress / In Review / Done), **Priority** (All Priorities / Highest / High / Medium / Low / Lowest), **Assignee** (All Assignees / list of users / Unassigned). Each is a `<select>` with `bg-white border border-gray-300 rounded px-3 py-1.5 text-sm`. Filters combine with AND logic on top of the text search. Add a "Clear all filters" link that resets all dropdowns and the search query.

- [x] **Advanced Search sortable columns**: Make table headers in `AdvancedSearch.tsx` clickable to sort. Add sort state: `{ column: 'key' | 'summary' | 'status' | 'priority' | 'assignee', direction: 'asc' | 'desc' }`. Clicking a header sorts by that column; clicking again toggles direction. Show a small up/down arrow icon (ChevronUp/ChevronDown from lucide) next to the active sort column. Default sort: by key ascending.

- [x] **Sprint creation from Backlog**: In `Backlog.tsx`, add a "Create Sprint" button at the bottom of the sprint list (before the Backlog section). Style: dashed border button, gray text, `+ Create Sprint`. On click: dispatch `ADD_SPRINT` with auto-generated name (`Sprint {n+1}`), empty goal, future state, dates set to 2 weeks from now. The new sprint section appears immediately and is expanded. The sprint header should have inline-editable name (click name → input field, Enter to save, Esc to cancel) and an "Edit dates" pencil icon that shows a date range input.

- [x] **Board quick filters**: In `Board.tsx`, add a row of quick-filter chip buttons below the search bar: "Only My Issues" (filters to currentUser.assigneeId), "Recently Updated" (updated in last 24h), and label-based chips for each unique label that exists in the sprint's issues (e.g., "frontend", "backend", "urgent"). Chips are toggle buttons: unselected = `bg-gray-100 text-gray-700`, selected = `bg-xira-blue/10 text-xira-blue border-xira-blue`. Multiple can be active. Label chips filter to issues containing that label. Combine all active filters with AND logic.

- [x] **Issue type selector in IssueModal**: In `IssueModal.tsx` right sidebar, add an **Issue Type** field (currently shown in header breadcrumb but not editable). Display as a dropdown with colored type icons (same icons as IssueCard.tsx's `getTypeIcon`). Changing type dispatches an update. Show below the Status field.

- [x] **Labels editor in IssueModal**: In `IssueModal.tsx` right sidebar, add a **Labels** field below Story Points. Display current labels as removable chip badges (`bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs` with an X button to remove). Below chips, show a text input: typing filters existing labels in a dropdown suggestion list; pressing Enter or clicking a suggestion adds the label; typing a new value and pressing Enter creates a new label. Existing label pool: gather all unique labels from all issues in state.

- [x] **Reporter display in IssueModal**: In `IssueModal.tsx` right sidebar, add a **Reporter** field (read-only display) below Assignee. Show the reporter's avatar (24px rounded) + name. The reporter is set at creation time and typically not changed. Look up user from `state.users` by `editedIssue.reporterId`.

- [x] **Notifications panel**: Add `NotificationPanel.tsx` component. In `Sidebar.tsx`, add a bell icon button (`Bell` from lucide) near the bottom, above the user info section. Show an unread count badge (red circle with white number, positioned top-right of bell icon, hidden when 0). Clicking the bell opens a slide-out panel (or popover) from the right side showing notification list: each notification shows an icon (💬 comment, 🔄 status change, 👤 assignment), actor avatar + name, message text, relative timestamp ("2 hours ago"), and unread indicator (blue dot on left). Clicking a notification marks it as read and could navigate to the related issue. Header: "Notifications" with a "Mark all as read" text button. Generate notifications when: (a) user creates a comment on an issue assigned to current user, (b) issue assigned to current user changes status, (c) issue gets assigned to current user. For seed data, use the hardcoded notifications from `data_model.md`.

- [x] **Board column issue count and WIP indicator**: In `Board.tsx`, each column header already shows a count badge. Enhance: if a column has more than 5 issues (configurable WIP limit), change the count badge background to `bg-yellow-200 text-yellow-800` as a visual WIP warning. If > 8, use `bg-red-200 text-red-800`. This teaches agents about Kanban WIP limits.

- [x] **Backlog inline issue editing**: In `Backlog.tsx` issue rows, make the **summary** text editable: double-click on the summary text to enter edit mode (replace text with an input field, auto-focus, pre-filled). Press Enter to save (dispatch `UPDATE_ISSUE`), Esc to cancel. Also make **story points** editable: click on the story points badge to show a small number input (styled as an inline editor). This matches real Xira's inline editing in the backlog.

---

## P2 — Secondary Features
<!-- Depth and realism features. Implement after all P1 items are solid. -->

- [x] **Velocity Chart in Reports**: In `Reports.tsx`, add a second chart section below the burndown. "Velocity Chart" — a grouped bar chart (using recharts `BarChart`) showing story points committed vs completed per sprint. Use data from closed sprints: for each closed sprint, count total story points of issues that were in the sprint, and count points of issues that reached "Done" status. X-axis: sprint names. Y-axis: story points. Two bars per sprint: gray = committed, green = completed. Include at least the closed Sprint 3 data and the active Sprint 1 in-progress data.

- [x] **Sprint Report in Reports**: Add a third section in `Reports.tsx`: "Sprint Report" — a summary panel for the active sprint showing: sprint name, goal, date range, days remaining (calculated), and a table with 4 rows: "Completed" (count + points), "In Progress" (count + points), "To Do" (count + points), "Removed" (0 for mock). Include a small donut chart showing the completion percentage.

- [x] **Epic swimlanes on Board**: In `Board.tsx`, add a toggle button "Group by Epic" in the filter bar. When active, the board shows horizontal swimlanes — one row per epic (+ "No Epic" row for unlinked issues). Each swimlane has the epic name as a header (with the purple epic icon), and the 4 status columns beneath it. This is a common Xira board configuration. When the toggle is off, show the flat column view (current behavior).

- [x] **Epic filter in Backlog**: In `Backlog.tsx`, add an "Epic" dropdown filter at the top (next to the header). Options: "All Epics", then each epic issue by name, plus "Issues without epic". When selected, only issues matching that epicId (or null) are shown.

- [x] **Project Settings page**: Create `src/pages/Settings.tsx`. Route: `/project/:key/settings`. Add "Settings" NavLink with `Settings` icon in Sidebar. Page has tabs: **Details** (project name input, key display read-only, lead dropdown, category dropdown, description textarea, Save button) and **Board** (list of board columns with drag-to-reorder, each showing column name + mapped status). Changes to project details dispatch an `UPDATE_PROJECT` action (add to reducer). Board column config is display-only (informational).

- [x] **Keyboard shortcuts**: Add a global keyboard event listener (in `App.tsx` or a custom hook `useKeyboardShortcuts.ts`). Shortcuts: `C` → open CreateIssueModal (unless a text input is focused), `?` → open keyboard shortcuts help dialog (simple modal listing all shortcuts), `Escape` → close any open modal. When the shortcuts help dialog opens, show a two-column layout: left = shortcut key, right = description. Keys to list: C (Create issue), ? (Shortcuts), Esc (Close dialog), J/K (Next/Previous issue in search results — future).

- [x] **Issue linking in IssueModal**: In `IssueModal.tsx` main content area, add an "Issue Links" section below Subtasks. Shows existing links as rows: "[Link type] [Issue key] — [Summary]" with a remove (X) button. Link types: "blocks", "is blocked by", "relates to", "duplicates". "Link issue" button opens an inline form: link type dropdown + issue key search input (autocomplete from all issues). On save, add the linked issue ID to both issues' `linkedIssueIds` arrays and dispatch updates.

- [x] **Breadcrumb navigation**: Add a breadcrumb bar at the top of each page (Board, Backlog, Reports, Settings). Format: "Projects / {Project Name} / {Page Name}". Each segment is a link: "Projects" → dashboard, project name → board, page name is current (not linked). Style: `text-sm text-gray-500`, links in `text-xira-blue hover:underline`. Add `flex items-center gap-1` with `/` separators.

- [x] **Activity tab in IssueModal**: In the comments section of `IssueModal.tsx`, add tab buttons above: "Comments" (current view), "Activity" (shows all changes as a timeline — status changes, assignments, field edits). For mock purposes, auto-generate 2-3 activity entries from the issue's createdAt/updatedAt timestamps: "Admin User created this issue", "Jane Doe changed status from To Do to In Progress", "John Smith was assigned". Activity entries show: user avatar, user name, action text, relative timestamp.

- [x] **Drag-drop reorder within columns on Board**: Currently the Board supports drag between columns (status change). Also support drag-to-reorder within the same column to prioritize issues visually. The index position within a column is informational only (no backend ordering field needed), but the visual reorder should persist within the current session.

- [x] **Empty states**: Add meaningful empty state components for: (a) Board with no active sprint → "No Active Sprint — Start a sprint in the Backlog to see the board" with a "Go to Backlog" link button (partially exists), (b) Search with no results → "No issues match your search" with an illustration, (c) Backlog with no issues → "Your backlog is empty — Create an issue to get started" with a Create button, (d) Notifications with none → "You're all caught up! No new notifications."

---

## Data Seed (implement in createInitialData())
<!-- Dev must replace random generation with deterministic, realistic seed data. -->

- [x] **Users**: 4 users (u1-u4) as currently defined — Admin User, Jane Doe, John Smith, Sarah Connor. Keep avatars using picsum.photos with deterministic random seeds.

- [x] **Projects**: 2 projects as currently defined — KAN (Kanban Project, Software, lead u1) and SCRUM (Scrum Alpha, Marketing, lead u2).

- [x] **Sprints**: 3 sprints for project p1:
  - s1: "Sprint 1", active, started 5 days ago, ends in 9 days, goal: "Setup core infrastructure"
  - s2: "Sprint 2", future, starts in 10 days, ends in 24 days, goal: "User authentication flow"
  - s3: "Sprint 3 (completed)", closed, started 19 days ago, ended 5 days ago, goal: "Initial MVP features"

- [x] **Issues**: 25 issues with specific, realistic summaries and deterministic field values. See `data_model.md` §Issues for distribution rules. Key: use sequential keys (KAN-1 through KAN-25). Each issue MUST have a unique, descriptive summary that sounds like real software development work.

- [x] **Comments**: 15-20 deterministic comments spread across Sprint 1 issues and a few backlog issues. Use realistic developer conversation snippets (see `data_model.md` §Comments). Each comment references a specific user.

- [x] **Notifications**: 8-10 notifications for current user (u1). Mix of types: 2 comment mentions, 3 assignments, 3 status changes. 3 unread (most recent), rest read.

- [x] **Workflows**: 1 default workflow (already exists). Transitions: To Do → [In Progress]; In Progress → [In Review, To Do, Done]; In Review → [Done, In Progress]; Done → [In Progress, To Do].

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login (app starts pre-logged-in as `Admin User`, id `u1`)
- Real file uploads (attachment drop zone is visual-only placeholder)
- Real-time collaboration / WebSocket updates
- JQL query parser (use simple text matching + dropdown filters)
- Time tracking / work logging
- Automation rules engine
- Confluence / Bitbucket integration
- Email / SMS notifications
- User/role permissions (all users can do everything)
- Marketplace apps / plugins
- Multiple board types per project (just one board per project)
- Dark mode (Xira doesn't have native dark mode)
