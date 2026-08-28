# Xinear Mock -- TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Design: `DESIGN.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Core Shell
<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] **Project scaffold**: `npm create vite@latest linear_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`, `date-fns`, `uuid`. Do NOT use Tailwind -- use plain CSS (or CSS modules) to match Xinear's precise design system from DESIGN.md. Import Inter font from Google Fonts with weights 400, 500, 600 (closest to Xinear's 400/510/590). Set `font-feature-settings: 'cv01', 'ss03'` globally on all text.

- [x] **Global CSS reset and theme**: Create `src/index.css` with Xinear's dark theme as CSS custom properties. Key tokens from DESIGN.md: `--bg-base: #0f1011`, `--bg-surface: #191a1b`, `--bg-elevated: #28282c`, `--text-primary: #f7f8f8`, `--text-secondary: #8a8f98`, `--text-tertiary: #62666d`, `--accent: #5e6ad2`, `--accent-hover: #828fff`, `--border: rgba(255,255,255,0.08)`, `--border-subtle: rgba(255,255,255,0.05)`. Body background `#0f1011`, color `#f7f8f8`, font-family `'Inter', -apple-system, system-ui, sans-serif`.

- [x] **App layout**: `App.jsx` renders a flex row: Sidebar (240px fixed width, `--bg-base` background, left border none, right border `var(--border-subtle)`) + main content area (flex-grow, with a 48px header bar at top). The sidebar should be collapsible (clicking a toggle button or pressing `[` key collapses it to 48px icon-only mode). Main content area has no horizontal scroll, vertical scroll on the content below header.

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes implemented for all views. All routes preserve `?sid=` query parameter across navigation.

- [x] **State management**: Create `src/context/AppContext.jsx` with React Context + `useReducer`. Import initial data from `src/utils/dataManager.js`. The context provides `state` and `dispatch` to all components. Reducer actions cover all CRUD operations for every entity type.

- [x] **dataManager.js**: Create `src/utils/dataManager.js` with `createInitialData()` returning the full seed data structure from data_model.md. Include `loadState()`, `saveState()`, and `computeStateDiff()` for the /go endpoint.

- [x] **`/go` endpoint**: Create `src/pages/Go.jsx` that reads `initial_state` and `current_state` from the context/dataManager, computes `state_diff`, and renders them as formatted JSON.

- [x] **Session isolation**: In `vite.config.js`, add a mock API plugin that handles POST /post and GET /go endpoints. State is stored per-session in a server-side Map keyed by sid.

- [x] **Sidebar component**: Create `src/components/Sidebar.jsx`. Full structure implemented: workspace header, create button, search, navigation items, favorites, team sections with collapsible children, bottom settings/user.

---

## P1 -- Primary Features
<!-- Core features a user interacts with daily. The most important for agent training. -->

### Inbox View

- [x] **Inbox page** (`src/pages/Inbox.jsx`): Two-column layout implemented.

- [x] **Notification list items**: Each notification row shows actor, title, time, read/unread state.

- [x] **Inbox actions**: Archive all, mark all read, per-item archive/read/unread buttons implemented.

- [x] **Inbox empty state**: "You're all caught up" shown when no notifications.

### My Issues View

- [x] **My Issues page** (`src/pages/MyIssues.jsx`): Full-width content area with 4 tab buttons implemented.

- [x] **Assigned tab** (default): Issues grouped by status.

- [x] **Created tab**: Issues created by current user.

- [x] **Subscribed tab**: Issues subscribed to by current user.

- [x] **Activity tab**: Issues updated in last 7 days.

### Issue List Component (Reusable)

- [x] **IssueList component** (`src/components/IssueList.jsx`): Renders list of issue rows with grouping support.

- [x] **Issue row** (`src/components/IssueRow.jsx`): Full row with priority, status, identifier, title, labels, due date, assignee. Clickable dropdowns for inline updates.

### Team Issue Views

- [x] **Team Issues page** (`src/pages/TeamIssues.jsx`): Shows all issues for a team, with filter and display options.

- [x] **Filter bar** (`src/components/FilterBar.jsx`): Multi-select filter dropdowns for status, priority, assignee, label, project.

- [x] **Display options popover** (`src/components/DisplayOptions.jsx`): Grouping and ordering dropdowns.

- [x] **Layout toggle**: List and board view toggle buttons implemented.

### Team Board View

- [x] **Board layout** (`src/components/BoardView.jsx`): Horizontal kanban columns by workflow state.

- [x] **Board card** (`src/components/BoardCard.jsx`): Cards with identifier, title, priority, labels, assignee.

- [x] **Board drag-and-drop**: HTML5 drag API implemented for moving cards between columns.

### Issue Detail View

- [x] **Issue detail page** (`src/pages/IssueDetail.jsx`): Two-column layout with breadcrumb, editable title/description, sub-issues, comments.

- [x] **Issue title**: Editable inline.

- [x] **Issue description**: Editable textarea with save/cancel.

- [x] **Properties sidebar**: Status, Priority, Assignee, Labels, Project, Cycle, Estimate, Due date, Parent, Subscribers — all with clickable dropdowns.

- [x] **Sub-issues section**: Shows child issues with inline creation form.

- [x] **Comments section**: Comments and Activity tabs, comment creation.

- [ ] **Issue peek/side panel**: Not implemented (slide-in panel on Space key).

### Create Issue Modal

- [x] **Create issue modal** (`src/components/CreateIssueModal.jsx`): Team selector, title input, description, property row, footer with create button.

### Command Palette

- [x] **Command palette** (`src/components/CommandPalette.jsx`): Search overlay with issue/project search, keyboard navigation, recent actions.

### Cycle Views

- [x] **Cycles list page** (`src/pages/CyclesList.jsx`): Active, upcoming, completed cycle sections with progress.

- [x] **Cycle detail page** (`src/pages/CycleDetail.jsx`): Issues in cycle, progress bar, "Add issues" for active cycle.

### Project Views

- [x] **Projects list page** (`src/pages/ProjectsList.jsx`): Grid of project cards with progress, health, lead.

- [x] **Project detail page** (`src/pages/ProjectDetail.jsx`): Issue list + properties sidebar with editable fields.

### Backlog View

- [x] **Backlog page** (`src/pages/Backlog.jsx`): Team backlog issues (no cycleId, in backlog/unstarted states).

### Triage View

- [x] **Triage page** (`src/pages/Triage.jsx`): Issues in triage state with Accept/Decline buttons.

### Keyboard Shortcuts

- [x] **Global keyboard shortcut handler**: C (create), Cmd+K (command palette), G+I/M/B/C/P/S navigation, ? (help), Esc (close), [ (sidebar toggle).

- [x] **Keyboard shortcuts help dialog**: Modal with grouped shortcut reference.

---

## P2 -- Secondary Features
<!-- Depth features for realism. Implement only after P1 is solid. -->

- [x] **Custom views page** (`src/pages/ViewsList.jsx`): List of saved custom views.

- [ ] **Favorites management**: Sidebar shows favorites; toggle not wired to star buttons on cards yet.

- [ ] **Issue relations section**: Not implemented.

- [ ] **Bulk actions toolbar**: Not implemented.

- [x] **Settings page** (`src/pages/Settings.jsx`): General, Members, Labels, Workflows sections.

- [ ] **Activity timeline in issue detail**: Basic only (created event).

- [ ] **Toast notifications**: Not implemented.

- [ ] **Empty states for all views**: Basic empty states implemented.

- [ ] **Right-click context menu**: Not implemented.

- [ ] **Responsive sidebar behavior**: Basic implemented via sidebar collapse.

---

## Data Seed (implement in createInitialData())
<!-- Dev must create realistic seed data matching these specs. -->

- [x] **Users**: 6 users as specified in data_model.md. Current user is u1 (Alex Morgan).
- [x] **Teams**: 2 teams (Engineering with key ENG, Design with key DES) with full workflow states (7 states each with unique IDs).
- [x] **Issues**: 32 issues total (22 ENG + 8 DES + 2 sub-issues) with realistic titles, descriptions, varied statuses/priorities/assignees. Each issue has proper timestamps spread across March-April 2026.
- [x] **Projects**: 3 projects with progress calculated from their issues' completion ratios.
- [x] **Cycles**: 4 cycles (1 active + 1 completed + 1 upcoming for ENG, 1 active for DES).
- [x] **Labels**: 8 workspace labels with distinct colors.
- [x] **Comments**: 17 comments spread across 8-10 issues including threaded replies.
- [x] **Notifications**: 10 inbox items for u1. Mix of types and read/unread states.
- [x] **Views**: 2 custom views as specified in data_model.md.
- [x] **Favorites**: 3 favorites for u1.
- [x] **Issue relations**: 4 relations implemented.

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login (app starts pre-logged-in as Alex Morgan, u1)
- Real-time collaboration / WebSocket sync
- File uploads to real servers
- Email, Slack, or GitHub integrations (can show integration names in settings but non-functional)
- Billing, subscription, or plan management
- Mobile-responsive layouts below 1024px (desktop-first, basic responsive is fine)
- Full WYSIWYG rich text editor (basic markdown textarea is sufficient)
- Actual Git branch name generation
- Import/export functionality
- AI features (Xinear AI assist)
- Initiatives/roadmap view (P3, skip for now)
