# Xsana Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-02
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Screenshots: `assets/screenshots/` (5 images showing board view, list view, dashboard, project overview)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

## Current State Summary

The app already has a solid foundation:
- ✅ All 11 routes working (/, /my-tasks, /inbox, /projects, /projects/:id, /portfolios, /goals, /teams/:id, /settings, /search, /go)
- ✅ State management with React Context + localStorage persistence
- ✅ Session isolation with Vite middleware (POST/GET /state, /go)
- ✅ Data normalization for POST API
- ✅ Basic UI for all pages
- ✅ Task completion toggling, project starring, notification read marking

**What's broken/missing:**
- ❌ Timeline, Calendar, Dashboard views are placeholder text
- ❌ My Tasks Board/Calendar views are placeholder text
- ❌ All "Create" buttons (task, project, portfolio, goal) have NO handlers
- ❌ Task detail panel: cannot change assignee, due date, section, or custom fields
- ❌ Drag-and-drop: react-beautiful-dnd imported but NOT wired up
- ❌ "Mark all read" in Inbox: button present, NO handler
- ❌ Quick-add menu: opens/closes but NO creation modal
- ❌ Settings Save buttons: non-functional
- ❌ Add comments: no UI for creating new comments in task detail
- ❌ No subtask creation UI
- ❌ Only 8 tasks — too few for realistic views
- ❌ Only 2 notifications — Inbox looks empty

---

## P0 — Core Shell & Critical Fixes

> Without these, the app feels broken. Dev implements these first.

- [x] **Visual design system**: Study `assets/screenshots/` — the real Xsana uses a dark sidebar (#1E1F21), white main content area (#FFFFFF), coral accent (#F06A6A) for primary actions. Font: system font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto). Body text 13px, headings 16-20px bold. Top nav height ~48px. Sidebar width ~240px. Ensure all existing components match this palette. Currently the mock's existing colors are approximately correct but audit and fix any deviations: sidebar text should be light gray (#A2A0A2) for inactive items, white for active; top nav search bar has a subtle dark bg (#383839); the "+New" button is coral/salmon (#F06A6A) with white text and rounded corners
- [x] **Expand seed data for realism**: The current 8 tasks, 3 comments, and 2 notifications are too sparse. Add to `generateInitialData()` in `src/data/initialData.ts`:
  - **Tasks**: Add 12-15 more tasks (total ~20-23) distributed across all 4 projects. Include: 3-4 tasks with no due date, 2-3 overdue tasks (due dates in the past), 3-4 tasks due within the next 3 days, 2-3 tasks with `startDate` set (for Timeline view), 2 subtasks (set `parentTaskId` to existing task IDs), tasks covering all priority levels (High/Medium/Low), tasks in all sections of each project. Ensure each user has 3-5 tasks assigned to them so "My Tasks" feels populated
  - **Comments**: Add 5 more comments (total ~8) spread across tasks 3-7. Include comments from different users. Some should have `likedBy` arrays with 1-2 user IDs
  - **Notifications**: Add 6-8 more (total ~8-10). Types: 2 task-assigned, 1 task-due-soon, 2 comment, 1 mention, 1 project-invite, 1 status-update. Mix of read (3-4) and unread (4-6). Various `actorId` values. Timestamps spread over last 3 days
  - **Attachments**: Add 2-3 mock attachments on tasks (just metadata — fileName, fileType, fileSize — no real files). E.g., "design_mockup_v2.fig" (application/fig, 2.4MB), "requirements.pdf" (application/pdf, 450KB)
- [x] **Add missing context methods**: In `src/context/AppContext.tsx`, add these methods to the context (alongside existing ones):
  - `markAllNotificationsRead()` — sets `read: true` on all notifications where `userId === currentUser.userId`
  - `archiveNotification(notificationId: string)` — sets `archived: true` on the notification
  - `addGoal(goal: Goal)` — appends to goals array
  - `updateGoal(goalId: string, updates: Partial<Goal>)` — updates goal by ID
  - `addPortfolio(portfolio: Portfolio)` — appends to portfolios array
  - `updatePortfolio(portfolioId: string, updates: Partial<Portfolio>)` — updates portfolio by ID
  - `addTeamMember(teamId: string, userId: string)` — pushes userId to team's memberIds if not already present
  - `deleteProject(projectId: string)` — removes project and its tasks from state
  - Update the `AppContextType` interface to include all new methods

---

## P1 — Primary Interactive Features

> Core features a user interacts with in the first 5 minutes. These are the main training targets for browser agents.

### Task Creation (Critical — currently 100% broken)
- [x] **Inline "Add task" in List view**: The `+ Add task` button in `ProjectDetail.tsx` `renderListView()` currently has NO handler. Wire it up: clicking the button inserts a new editable task row at the bottom of that section. The row shows: an empty text input (auto-focused) for the task name. On Enter or blur (if non-empty): create a new `Task` object via `addTask()` with a unique `taskId` (e.g., `task-${Date.now()}`), `projectId` from current project, `sectionId` from the section, `creatorId` from `currentUser.userId`, empty description, no assignee, no due date, `completed: false`. On Escape or blur (if empty): remove the input row. The new task should appear immediately in the list
- [x] **Inline "Add task" in Board view**: Same as above but for the Board column "+ Add card" button. Shows an inline card-like input at the bottom of the column. Enter creates the task; Escape/empty-blur cancels
- [x] **Quick-add modal (Tab+Q and "+New" button)**: The "+New" button in TopNav currently only toggles a dropdown open/closed but the dropdown items do nothing. Implement a full quick-add modal that appears centered on screen with overlay backdrop. Modal fields: Task name (text input, auto-focused), For project (dropdown selector populated from `state.projects`, default to first project), Assignee (dropdown from `state.users`, with "Unassigned" option), Due date (use `react-datepicker` — already installed), Description (textarea). Buttons: "Create Task" (primary coral button) — creates task via `addTask()` and closes modal; "Cancel" — closes modal. Also wire the "+New" dropdown to show options: "Task" (opens this modal), "Project" (opens project creation modal, see below). Keyboard: Tab+Q should open this modal from anywhere in the app (add a global keydown listener in `Layout.tsx`)

### Task Detail Panel (Critical — currently read-only for most fields)
- [x] **Assignee picker**: In the task detail modal (`ProjectDetail.tsx` → `renderTaskDetailModal()`), the Assignee field currently just displays text. Convert it to a clickable dropdown: clicking the assignee name/avatar opens a dropdown list of all `state.users` plus an "Unassigned" option. Each option shows: user avatar (24px circle) + user name. Selecting a user calls `updateTask(taskId, { assigneeId: selectedUserId })`. Dropdown closes after selection. Show the updated assignee immediately
- [x] **Due date picker**: The due date field currently shows read-only text. Make it clickable to open a `react-datepicker` calendar popup (the library is already installed as a dependency). Selecting a date calls `updateTask(taskId, { dueDate: selectedDate.toISOString().split('T')[0] })`. Include a "Clear" button to remove due date. Show relative formatting: "Today", "Tomorrow", "Mon, Mar 15", etc. Color-code overdue dates in red (#E8384F)
- [x] **Section/status dropdown**: The "Status" field shows the section name as text. Make it a dropdown showing all sections from the current project. Selecting a section calls `updateTask(taskId, { sectionId: newSectionId })`. This effectively moves the task between sections
- [x] **Priority dropdown**: The "Priority" field shows a badge or "None". Make it a dropdown with options: "High" (red badge), "Medium" (amber badge), "Low" (blue badge), "None". Selection calls `updateTask(taskId, { customFieldValues: { ...task.customFieldValues, 'field-1': value } })`
- [x] **Comments section in task detail**: Below the description in the task detail panel, add a "Comments" section. Show existing comments for this task (filter `state.comments` by `taskId`): each comment displays user avatar (32px), user name (bold), relative timestamp (from `date-fns` `formatDistanceToNow`), comment text, and a heart/like button (clicking toggles current user in `likedBy`). Below the comment list, add a text input + "Comment" submit button. On submit: call `addComment()` with new comment object (unique commentId, taskId, userId from currentUser, content from input, current timestamp, empty likedBy). Clear input after posting
- [x] **Tags display and management**: Tags currently display as badges but cannot be edited. Add a "+ Add tag" button after existing tags in task detail. Clicking it shows a text input; typing a tag name and pressing Enter adds it to `task.tags` via `updateTask()`. Each existing tag should have an "x" button to remove it

### Project Creation (Currently broken — button does nothing)
- [x] **Create Project modal**: The "Create Project" button in `Projects.tsx` and the sidebar "Create a Project" link currently do nothing. Implement a modal: Project name (text input, required), Team (dropdown from `state.teams`), Color (row of 8 color swatches: #FC6D26, #EA4E9D, #7AC142, #4186E0, #FFB900, #E8384F, #6A67CE, #1AAFD0 — clicking one selects it with a check mark), Privacy (radio: Public / Private), Description (textarea, optional). Default sections: auto-create 3 sections ["To Do", "In Progress", "Done"]. "Create" button: calls `addProject()` with generated projectId, selected team, color, owner = currentUser, memberIds = [currentUser], generated default sections, empty customFields. Then navigate to the new project's detail page. "Cancel" button: closes modal

### Inbox Improvements (Mostly display-only currently)
- [x] **Mark all as read**: The "Mark all as read" button in `Inbox.tsx` has no handler. Wire it up to call the new `markAllNotificationsRead()` context method. After clicking, all notification items should visually change from bold/unread style to read style, and the badge count in the sidebar should update to 0
- [x] **Archive notifications**: Add an archive button (📥 icon or "Archive" text) on each notification item on hover. Clicking calls `archiveNotification(notificationId)`. Archived notifications are hidden from the main Inbox list. Add tab buttons at top of Inbox: "Activity" (shows non-archived) | "Archive" (shows archived). Clicking "Archive" tab shows only `archived: true` notifications with an "Move to Inbox" button to unarchive
- [x] **Click notification to navigate**: When clicking a notification item, navigate to the relevant task or project. For `targetType: 'task'`: find the task's projectId, then navigate to `/projects/${projectId}` and open the task detail modal. For `targetType: 'project'`: navigate to `/projects/${targetId}`. Mark the notification as read on click

### Drag-and-Drop in Board View
- [x] **Wire up react-beautiful-dnd**: The library is already installed. In `ProjectDetail.tsx` `renderBoardView()`, wrap the board in `<DragDropContext onDragEnd={handleDragEnd}>`. Wrap each column's task list in `<Droppable droppableId={section.sectionId}>`. Wrap each task card in `<Draggable draggableId={task.taskId} index={idx}>`. Implement `handleDragEnd(result)`: if `destination` exists and is different from `source`, call `updateTask(draggedTaskId, { sectionId: destination.droppableId })`. This moves the task to the new column. Add visual feedback: when dragging, show a placeholder in the target column. Style the dragged card with a slight rotation and shadow

### My Tasks Views (Board and Calendar are placeholders)
- [x] **My Tasks — functional Board view**: In `MyTasks.tsx`, the Board view currently shows a placeholder. Implement a Kanban board with columns for: "Recently Assigned" (tasks assigned in last 7 days), "Today" (dueDate = today), "Upcoming" (dueDate within next 7 days), "Later" (everything else), "Completed" (completed = true). Each column shows cards for tasks where `assigneeId === currentUser.userId`. Cards show: task name, project name (small gray text), due date, priority badge. Support drag-and-drop between columns (updates task due dates or completed status accordingly)
- [x] **My Tasks — functional Calendar view**: In `MyTasks.tsx`, the Calendar view currently shows a placeholder. Implement a monthly calendar grid. Show current month with previous/next month navigation arrows. Each day cell shows tasks assigned to currentUser that have `dueDate` matching that day. Tasks show as small colored pills (task name, truncated). Click a task pill to navigate to its project and open task detail. Click an empty date cell to create a new task with that due date. Use the existing `react-datepicker` styles for the calendar header or build a simple custom grid

### Search Improvements
- [x] **Keyboard shortcut (Cmd/Ctrl+K)**: Add a global keydown listener in `Layout.tsx`. When Cmd+K (Mac) or Ctrl+K (Windows) is pressed, focus the search input in TopNav. If already on a different page, navigate to `/search` and focus the input
- [x] **Search results polish**: In `Search.tsx`, improve results display: group results under "Tasks" and "Projects" headers with counts. For task results, show: checkbox (toggleable), task name, project name (gray), assignee avatar, due date. Clicking a task navigates to its project and opens task detail. For project results, show: project color dot, project name, team name. Clicking navigates to `/projects/:id`

---

## P2 — Secondary Features

> Depth and realism. Implement after P1 is solid.

### Project Detail — Timeline View
- [x] **Gantt chart implementation**: Replace the "Timeline view coming soon" placeholder in `ProjectDetail.tsx`. Build a horizontal scrollable timeline: X-axis shows dates (one column per day, grouped by weeks/months). Y-axis shows tasks (one row per task). Each task renders as a horizontal bar spanning from `task.startDate` (or `task.createdDate` if no start date) to `task.dueDate`. Bar color = project's section-based color or priority color. Tasks without due dates show as a single-day dot. Support: (1) Hover a bar shows tooltip with task name, dates, assignee. (2) Click a bar opens task detail panel. (3) If task has `dependencies`, draw a small arrow from dependency task's bar end to this task's bar start. (4) "Today" vertical red line indicator. Scrolling: show ~4 weeks initially. Navigation arrows to scroll left/right by week. This can be built with simple CSS grid + absolute positioning — no need for a library

### Project Detail — Calendar View
- [x] **Monthly calendar for project tasks**: Replace the "Calendar view coming soon" placeholder. Show a standard month grid (7 columns: Sun-Sat, 5-6 rows). Header shows month/year with < > navigation arrows. Each day cell shows tasks from this project whose `dueDate` falls on that day. Tasks appear as small colored bars (task name, truncated to fit). Click a task opens detail panel. Tasks can be dragged between date cells to change their due date (simple drag-and-drop or click-to-move). Style overdue tasks in red. Empty cells show "+" on hover to add a new task for that date

### Project Detail — Dashboard View
- [x] **Project metrics charts**: Replace the "Dashboard view coming soon" placeholder. Build 4 chart widgets arranged in 2x2 grid: (1) **Task completion donut chart**: center shows "X of Y complete", ring shows percentage green (complete) vs gray (incomplete). Build with SVG circles. (2) **Tasks by section bar chart**: horizontal bars, one per section, bar width proportional to task count, labeled with section name + count. (3) **Tasks by assignee**: horizontal bars showing how many tasks each project member has, with their avatar and name. (4) **Overdue/upcoming summary card**: text card showing: "X tasks overdue" (red), "X tasks due this week" (amber), "X tasks completed this week" (green). All charts should use real data from `state.tasks` filtered to this project

### Subtasks
- [x] **Subtask section in task detail**: In the task detail panel, below the tags and above the description, add a "Subtasks" section. Show tasks where `parentTaskId === selectedTask.taskId`. Each subtask row: checkbox (toggle complete), task name (clickable — opens that subtask's detail), assignee avatar, due date. Add a "+ Add subtask" button that inserts an inline text input. On Enter: create a new task with `parentTaskId` set to the parent task's `taskId`, same `projectId` and `sectionId`. Subtasks should also appear (indented) below their parent in the project List view

### Settings (Currently non-functional)
- [x] **Profile editing that saves**: In `Settings.tsx` Profile tab, the "Save Changes" button does nothing. Wire it up: on click, update `state.currentUser` with the edited name, email, title, department values. Show a brief "Saved!" toast or green text confirmation. The changes should persist (sidebar and top nav should reflect updated name/avatar)
- [x] **Display theme toggle**: In the Display tab, the theme dropdown currently does nothing. Wire it up: changing the theme should update `currentUser.theme` and apply a CSS class to the root element (`data-theme="dark"` or `data-theme="light"`). Define basic dark theme CSS variables: dark backgrounds (#1E1F21 for main area, #2E2E30 for cards), light text (#FFFFFF), adjusted borders (#3E3F42). The sidebar already looks dark so dark mode mainly affects the main content area
- [x] **Notification preferences**: Wire up the notification preference checkboxes so toggling them updates a `notificationPreferences` object in state (add to AppState if needed). These don't need to filter notifications — just need to be toggleable and persistent for agent training

### Portfolios Detail
- [x] **Portfolio detail view**: Clicking a portfolio card in `Portfolios.tsx` should navigate to a detail page or expand to show: contained projects as a table (project name, status indicator dot, progress bar, owner, team). Each project row is clickable → navigates to project. Add status column showing project health derived from task completion % (>75% complete = On Track/green, 50-75% = At Risk/yellow, <50% = Off Track/red). "Add Project" button: opens dropdown of all projects not in this portfolio, selecting one adds it to `portfolio.projectIds`

### Goals Detail
- [x] **Goal detail view**: Clicking a goal card in `Goals.tsx` should navigate to a detail page or expand to show: goal name (editable), description (editable), progress slider (0-100%, draggable or input), status dropdown (On Track / At Risk / Off Track), time period, supporting projects list (each clickable to navigate), metrics list. "Update" button saves changes via `updateGoal()`. Add "Edit Goal" and "Add Supporting Project" buttons

### Keyboard Shortcuts
- [x] **Global shortcut handler**: In `Layout.tsx`, add a `useEffect` with a `keydown` listener. Implement these shortcuts (only when not in a text input/textarea): Tab+N → focus on inline "add task" in current view; Tab+Q → open quick-add modal; Tab+Z → navigate to /my-tasks; Tab+I → navigate to /inbox; Escape → close any open modal/panel; Ctrl+/ (or Cmd+/) → show shortcuts overlay dialog listing all shortcuts. Display the shortcuts dialog as a centered modal with a list of all available shortcuts grouped by category

### UI Polish
- [x] **Notification badge count**: The sidebar "Inbox" item should show a red badge circle with the unread notification count. In `Sidebar.tsx`, compute `unreadCount = state.notifications.filter(n => !n.read && n.userId === currentUser.userId).length`. Show badge only if count > 0. Badge style: red (#E8384F) circle, white text, positioned top-right of the Inbox icon, min-width 18px, font-size 11px
- [x] **Quick-add dropdown in TopNav**: The "+New" button currently toggles a local `showMenu` state. Replace the empty/non-functional dropdown with actual options: "Task" (opens quick-add modal), "Project" (opens create project modal). Each option: icon + label, clickable. Close dropdown on click outside or after selection
- [x] **Hover states and transitions**: Audit all clickable elements for proper hover/focus states. Sidebar items: lighter background on hover (#3e3f42). Task rows: light blue/gray background on hover (#f0f4ff). Buttons: opacity or background shift. Cards in board view: subtle shadow increase on hover. Add `transition: all 0.15s ease` to interactive elements
- [x] **Empty states**: When a view has no data, show a helpful empty state instead of blank space. My Tasks with no tasks: illustration placeholder + "You're all caught up!" text. Inbox with no notifications: "No new notifications". Project with no tasks: "No tasks yet. Click '+ Add task' to get started." Search with no results: "No results found for '[query]'"

---

## Data Seed Improvements (implement in `generateInitialData()`)

- [x] **Add 12-15 more tasks**: See P0 seed data item above for detailed specifications. Ensure tasks are realistic project management work items with natural names like "Set up staging environment", "Create onboarding email sequence", "Review competitor analysis", "Update privacy policy", "Design mobile navigation", "Write unit tests for auth module", etc.
- [x] **Add subtask examples**: Create 2-3 tasks that have `parentTaskId` pointing to existing tasks. E.g., "Design hero section" and "Design footer" as subtasks of "Design landing page mockups" (task-1)
- [x] **Add more notifications**: See P0 item above. Use realistic recent timestamps (last 72 hours) and varied notification types
- [x] **Add mock attachments**: 2-3 attachments with metadata only. E.g., attached to task-1: `{ fileName: "landing_page_v2.fig", fileType: "application/x-figma", fileSize: 2457600, fileUrl: "#", uploaderId: "user-1" }`

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login (app starts pre-logged-in as Alex Johnson, `user-0`)
- Real network API calls (everything is local state + localStorage)
- Real file uploads (attachment metadata only)
- Email/SMS sending
- Xsana AI features
- Xsana Forms (external data collection)
- Xsana Rules / Automation engine
- Workload management / resource allocation views
- Global reporting (cross-project dashboards)
- Multi-workspace support
- Guest user access controls
- Real-time collaboration / multiplayer
