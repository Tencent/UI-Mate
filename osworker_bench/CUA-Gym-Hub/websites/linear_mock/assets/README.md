# Xinear Mock -- Research Summary

## App Overview

Xinear is a project management and issue tracking tool purpose-built for software development teams. It emphasizes speed, keyboard-first navigation, and an opinionated workflow. Xinear is the primary competitor to Jira in the modern developer tools space, differentiated by its extreme performance, minimal UI, and dark-mode-first aesthetic.

The desktop web app (linear.app) is the primary interface. It uses a three-panel layout: left sidebar for navigation, main content area for issue lists/boards, and an optional right detail panel.

## Key User Personas

1. **Engineering Lead** (primary): Creates issues, manages sprints/cycles, reviews project progress, triages incoming bugs. Daily workflow: check inbox, review cycle progress, update issue statuses, create new issues, review project health.

2. **Individual Developer**: Works through assigned issues, updates status, adds comments, checks inbox for mentions. Daily workflow: view "My Issues", pick up next task, update status, comment on blockers.

3. **Product Manager**: Creates projects, writes specs, tracks project health, sends project updates. Workflow: create projects, add issues to projects, monitor progress, write updates.

4. **Designer**: Works on design-specific issues, cross-team collaboration. Similar to developer workflow but within design team.

## Core Workflows for Agent Training

1. **Issue CRUD**: Create, view, edit, delete issues with all properties (status, priority, assignee, labels, estimate, project, cycle, due date)
2. **Navigation**: Move between inbox, my issues, team views, project views, cycle views using sidebar and keyboard shortcuts
3. **Triage**: Review new issues in triage, accept or reject, assign priority and team member
4. **Cycle management**: View current cycle, add/remove issues, complete cycle, view past cycles
5. **Project tracking**: View project progress, filter issues by project, update project status
6. **Search and filter**: Use command palette (Cmd+K) and filter bar to find issues
7. **Board and list views**: Toggle between board (kanban) and list layouts, group/sort/filter
8. **Inbox management**: Read notifications, archive, snooze, mark as read
9. **Bulk operations**: Select multiple issues, bulk update status/assignee/priority/labels
10. **Keyboard-driven workflow**: Navigate and perform actions entirely via keyboard

## Complete Feature List

### P0 -- Critical (app cannot function without these)
- App shell: sidebar + header + main content area
- Routing between all views
- State management with React Context + dataManager
- `/go` endpoint for state inspection
- Session isolation via mock API plugin
- Dark theme matching Xinear's design system

### P1 -- Primary Features (core interactive workflows)
- **Inbox view**: Notification list with read/unread states, archive, snooze
- **My Issues view**: 4 tabs (Assigned, Created, Subscribed, Activity)
- **Team issue list view**: Grouped by status, with display options
- **Team board view**: Kanban columns by status, drag-and-drop between columns
- **Issue detail view**: Full issue page with all properties, description editor, comments, activity
- **Issue peek preview**: Side panel showing issue details without navigating away
- **Create issue modal**: Quick issue creation with all fields
- **Command palette**: Cmd+K search and action palette
- **Cycle view**: Current cycle issues, progress bar, past/upcoming cycles
- **Project view**: Project issues grouped by status, progress tracker, project details panel
- **Backlog view**: Issues not in any cycle, sortable and filterable
- **Filter bar**: Filter by status, priority, assignee, label, project, cycle
- **Display options**: Group by, sort by, layout toggle (list/board), show/hide properties
- **Keyboard shortcuts**: Full keyboard navigation (see DESIGN.md for complete list)
- **Inline status/property updates**: Click status icon to change, click priority to change
- **Search**: Global search across issues, projects, cycles

### P2 -- Secondary Features (depth and realism)
- **Triage view**: Queue of new issues awaiting triage decisions
- **Project updates**: Health status updates with on-track/at-risk/off-track
- **Custom views**: Create and save filtered views
- **Favorites**: Star projects, views, cycles for sidebar quick access
- **Issue relations**: Block/blocked-by, relates-to, duplicate linking
- **Sub-issues**: Create and manage child issues
- **Bulk actions**: Multi-select issues, bulk update properties
- **Settings page**: Workspace settings, team settings, notification preferences
- **Activity feed**: Timeline of all changes on an issue
- **Label management**: Create, edit, delete labels with colors
- **Keyboard shortcuts help dialog**: ? key opens shortcuts reference

## UI Layout Description

### Sidebar (Left Panel, ~240px wide, collapsible)
- **Top**: Workspace name + switcher dropdown (chevron), create issue button (+ icon)
- **Navigation section**:
  - Inbox (with unread count badge)
  - My Issues
  - Views (custom saved views)
  - Initiatives (roadmap)
- **Favorites section** (if any): Starred items
- **Team sections** (one per team, expandable):
  - Team name header (with icon)
  - Issues (team's default list view)
  - Active (started issues)
  - Backlog
  - Triage (if enabled)
  - Projects (team's projects)
  - Cycles
  - Views (team-specific custom views)
- **Bottom**: Settings link, Help, user avatar with status

### Header Bar (Top of main content area, ~48px)
- Breadcrumb on left: "Team > View Name" or "Project Name"
- Filter bar icon buttons on right: filter, display options, search
- Layout toggle: list/board icons

### Main Content Area
- **List layout**: Rows of issues grouped by status/priority/assignee, each row shows: status icon, identifier, title, labels (colored dots), assignee avatar, priority icon, optional: estimate, project, cycle, due date
- **Board layout**: Columns per status, cards within each column showing: identifier, title, priority icon, assignee avatar, labels, estimate

### Issue Detail View (Full page or side panel)
- **Header**: Status dropdown, identifier, title (editable)
- **Properties sidebar** (right side): Status, Assignee, Priority, Label, Project, Cycle, Estimate, Due date, Parent issue, Subscribers
- **Main content**: Description (rich text editor), Sub-issues list, Activity/Comments tabs
- **Comment input**: Rich text editor at bottom

### Command Palette (Cmd+K overlay)
- Centered modal with search input at top
- Results grouped by: Issues, Projects, Cycles, Actions
- Each result shows icon, title, metadata
- Keyboard navigable (arrow keys + Enter)

## Data Model Overview

See `assets/data_model.md` for complete specifications. Key entities:
- **User** (6 seed records)
- **Team** (2: Engineering, Design)
- **Issue** (32 seed records across both teams)
- **WorkflowState** (7 per team: Triage, Backlog, Todo, In Progress, In Review, Done, Canceled)
- **Project** (3: Website Redesign, API v2 Migration, Mobile App Launch)
- **Cycle** (4: 2 active, 1 completed, 1 upcoming)
- **Label** (8 workspace labels)
- **Comment** (15-20 across issues)
- **Notification** (10 inbox items)
- **View** (2 custom views)
- **Favorite** (3 favorites)

## What to Skip

- **Authentication/Login**: App starts pre-logged-in as Alex Morgan (u1)
- **Real-time sync**: No WebSocket or live collaboration
- **File uploads**: No actual file upload to servers
- **Email/Slack integrations**: No external service communication
- **Git integration**: No real GitHub/GitLab sync (can show mock PR references)
- **Billing/subscription**: No payment or plan management
- **Mobile responsive**: Focus on desktop layout (1280px+)
- **Rich text editor**: Use a simple textarea with markdown support rather than a full WYSIWYG editor; basic formatting is fine

## Key Design References

- Primary background: `#0f1011` (panel), `#191a1b` (elevated surfaces)
- Text: `#f7f8f8` (primary), `#8a8f98` (muted), `#62666d` (subtle)
- Accent: `#5e6ad2` (brand indigo), `#7170ff` (interactive violet)
- Borders: `rgba(255,255,255,0.08)` (standard), `rgba(255,255,255,0.05)` (subtle)
- Font: Inter (or system sans-serif fallback), weight 400/510/590
- Sidebar width: 240px
- Header height: 48px
- Issue row height: ~36px
- Board card: 8px border-radius, subtle shadow
- All detailed design specs in `DESIGN.md`
