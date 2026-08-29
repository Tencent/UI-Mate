# Xsana Mock — Research Summary

> Last updated: 2026-03-02 by plan agent

## App Overview

**Xsana** is a web-based project management and work tracking platform used by teams to organize, track, and manage work. It provides multiple ways to view work (list, board, timeline, calendar, dashboard), supports rich task management with custom fields, and offers features like portfolios, goals, and team collaboration.

**Category**: Productivity / Project Management
**Primary Users**: Product managers, designers, engineers, marketers — anyone coordinating team work
**Platform**: Web (primary), Desktop (Electron wrapper), iOS, Android

## Key User Personas & Primary Workflows

### 1. Project Manager (Alex Johnson — our default user)
- Views Home dashboard for overview of tasks and projects
- Navigates to "My Tasks" to see personal task list organized by Today/Upcoming/Later
- Opens projects to track team progress via List or Board views
- Creates and assigns tasks to team members
- Reviews project status via Dashboard charts
- Manages portfolios to track multiple projects
- Sets and monitors goals

### 2. Individual Contributor (Sarah Chen — designer)
- Checks "My Tasks" daily for assigned work
- Opens task detail panels to read descriptions, view subtasks, update progress
- Marks tasks complete when done
- Comments on tasks for collaboration
- Uses Board view for visual workflow (Kanban)

### 3. Team Lead (Mike Rodriguez — lead engineer)
- Manages team page, views team members and projects
- Creates new projects for sprints/initiatives
- Uses Timeline/Gantt view for dependency planning
- Filters tasks by assignee, priority, due date
- Reviews inbox for notifications about team activity

## Complete Feature List

### P0 — Critical (App cannot function without)
1. **App shell layout**: Dark sidebar (240px) + white top nav bar (48px) + main content area
2. **Sidebar navigation**: Home, My Tasks, Inbox, Portfolios, Goals — then Starred items, Projects (auto-curated), Teams (expandable with flyout)
3. **Top nav bar**: Xsana logo (left), search bar (center), "+ New" quick-add button (coral/red), help "?", user avatar with dropdown
4. **Routing**: All primary routes (/, /my-tasks, /inbox, /projects, /projects/:id, /portfolios, /goals, /teams/:id, /settings, /search, /go)
5. **State management**: React Context with localStorage persistence
6. **Session isolation**: Vite middleware for POST/GET /state, /go endpoints

### P1 — Primary Features (Core interactive workflows)
7. **Home page**: Welcome greeting, quick access cards (My Tasks count, Inbox unread count, Calendar), Tasks Due Soon list, Recent Projects grid with progress bars
8. **My Tasks — List view**: Tasks grouped into sections: Recently Assigned, Today, Upcoming, Later, Completed. Each row: checkbox, task name, project name, due date. "Add task" button per section
9. **My Tasks — Board view**: Kanban columns matching My Tasks sections. Cards show task name, project, due date, priority badge
10. **My Tasks — Calendar view**: Monthly calendar grid. Tasks placed on their due date cells. Click date to add task
11. **Project Detail — List view**: Sections as collapsible groups. Each task row: checkbox, task name, assignee avatar, due date, priority badge. Row numbers. "Add Task" button per section. Click task name opens detail panel
12. **Project Detail — Board view**: Kanban columns per section. Cards with task name, assignee avatar, due date, custom field color tags. Drag-and-drop between columns (react-beautiful-dnd). "+" button per column to add card
13. **Project Detail — Timeline view**: Horizontal Gantt-style chart. X-axis = dates (scrollable). Y-axis = tasks as horizontal bars (start → due date). Color-coded by section. Dependency arrows between tasks. Drag bars to reschedule
14. **Project Detail — Calendar view**: Monthly grid showing tasks on their due dates. Click to add new task on date. Drag tasks between dates to reschedule
15. **Project Detail — Dashboard view**: Charts showing task completion (donut chart: complete vs incomplete), tasks by section (bar chart), tasks by assignee (horizontal bar), overdue tasks count, upcoming milestones
16. **Task detail panel/modal**: Opens as right-side panel or overlay modal. Fields: Mark Complete button, Task name (editable), Assignee (dropdown picker), Due date (date picker), Projects (link), Section/Status (dropdown), Priority (dropdown), Tags (multi-select), Description (rich text area), Subtasks list, Comments thread, Attachments, Like/heart button. Close with X or Escape
17. **Create task**: Quick-add via Tab+Q or "+New" button opens modal with: Task name, Assignee picker, Due date picker, Project selector, Description. Also inline "Add task" in list/board views creates new task row
18. **Create project**: Modal with: Project name, Team selector, Color picker, Privacy (public/private), Description. Adds to sidebar immediately
19. **Inbox/Notifications**: Chronological feed of notifications. Each item: actor avatar, action text ("Sarah commented on..."), timestamp (relative). Click notification navigates to target task. Tabs: Activity | Archive. "Mark all read" button works. Individual mark-read on click. Archive/unarchive buttons
20. **Search**: Global search bar in top nav (Cmd+K or click). Results grouped by: Tasks, Projects, People. Shows task name, project, assignee for task results. Shows team name for project results. Click result navigates to item
21. **Comments on tasks**: Comment thread in task detail panel. Add new comment via text input + submit button. Each comment: avatar, name, timestamp, content, like button. Comments appear in real-time after posting
22. **Drag-and-drop**: Board view cards can be dragged between columns (sections). Uses react-beautiful-dnd. On drop, updates task's sectionId
23. **Project starring**: Click star icon next to project name toggles starred state. Starred projects appear in sidebar "Starred" section

### P2 — Secondary Features (Depth & realism)
24. **Portfolios page**: Grid of portfolio cards. Each card: color bar, name, project count, owner avatar, member avatars. Click opens portfolio detail showing contained projects with status indicators (On Track / At Risk / Off Track)
25. **Goals page**: List of goal cards. Each: name, owner, time period, progress bar (0-100%), status badge (On Track green / At Risk yellow / Off Track red). Click opens goal detail with supporting projects and metrics
26. **Teams page**: Team header (name, description, member count). Members list with avatars, names, titles. Team projects list. "Add Member" button (opens user picker). "Create Project" shortcut
27. **Settings page**: Tabs: Profile, Display, Notifications, Keyboard Shortcuts. Profile: Edit name/email/title/department with Save button that actually updates state. Display: Theme toggle (light/dark/auto). Notifications: Toggle switches for each notification type. Keyboard Shortcuts: reference list
28. **Subtasks**: In task detail panel, subtasks section showing child tasks with checkboxes. "Add subtask" button creates inline input. Subtasks have own assignee, due date. Clicking subtask opens its own detail panel
29. **Task dependencies**: Show dependency indicators in list/timeline views. In task detail, "Dependencies" field lists blocking/blocked-by tasks. Dependency arrows in Timeline view
30. **Custom fields**: Projects can define custom fields (Priority, Status, etc.). Fields appear as columns in list view and on board cards. Editable in task detail panel via appropriate input type (dropdown for single-select, etc.)
31. **Keyboard shortcuts**: Tab+N (new task), Tab+Q (quick add), Tab+Z (My Tasks), Tab+I (Inbox), Enter (complete edit/new task), Escape (close panel), Up/Down arrows (navigate tasks), Ctrl+/ (show shortcuts dialog)
32. **"Mark all as read" in Inbox**: Button actually marks all notifications as read and updates badge count
33. **Notification badge**: Red badge on Inbox in sidebar showing unread count. Updates in real-time when notifications are read
34. **Quick-add menu**: "+New" button in top nav opens dropdown with: Task, Project, Message, Invite. Each option opens appropriate creation modal
35. **User menu dropdown**: Avatar click shows: Profile link, Settings link, Theme toggle, Workspace info, Log out (non-functional)

## UI Layout Description (from screenshots)

### Sidebar (Left, ~240px width)
- **Background**: Dark charcoal (#1e1f21)
- **Text**: White/light gray
- **Navigation items**: Home (house icon), My Tasks (check-circle), Inbox (bell icon with badge), Portfolios (bar-chart), Goals (target)
- **Sections**: "Starred" (collapsible), "Projects" (auto-populated top 10), "Teams" (expandable, each team shows projects)
- **Bottom**: "+ Create a Project" link, "+ Add Team" link, "Browse Other Teams" link
- **Active item**: Highlighted with lighter background

### Top Navigation Bar (~48px height)
- **Left**: Xsana logo (coral dots icon) + hamburger menu toggle
- **Center**: Search input ("Go to any project or task...")
- **Right**: "+New" button (coral red bg, white text), "?" help button, user avatar
- **Background**: Dark (#2e2e30) in dark theme, or white (#fff) in light theme

### Main Content Area
- **Background**: White (#fff)
- **Project header**: Project icon (colored square) + project name + star button + share button + "..." menu
- **View tabs**: List | Board | Timeline | Calendar | Progress | Forms | More...
- **Content**: Varies by view

### Board View (from screenshot 000002.jpg)
- **Columns**: Named sections (TO DO, Working, Test/Review, Done)
- **Column header**: Section name + dropdown arrow + "+" add button
- **Cards**: White bg, subtle shadow, rounded corners. Shows: colored custom field tags (horizontal bars top of card), task name, assignee avatar (circle), due date
- **Card spacing**: ~8px gap between cards

### List View (from screenshot 000003.jpg)
- **Row numbers**: Left margin
- **Sections**: Bold section headers (e.g., "To do:", "In progress:", "Done:")
- **Task rows**: Checkbox + task name. Clickable
- **Right panel**: Status updates card showing description, user name, timestamp, status color bar

### Dashboard (from screenshot 000004.jpg)
- **Cards**: White cards with status color bars (red/yellow/green top border)
- **Each card**: Project name, owner avatar, status text, small area chart
- **View filter**: "View: Projects by status color"

## Xsana Color Palette

### Brand Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Coral/Salmon | #F06A6A | Primary brand accent, buttons, links |
| Dark Sidebar | #1E1F21 | Sidebar background |
| Dark TopNav | #2E2E30 | Top nav in dark theme |
| White | #FFFFFF | Main content background |
| Light Gray BG | #F6F8F9 | Secondary backgrounds |
| Text Primary | #1E1F21 | Main text color |
| Text Secondary | #6D6E6F | Muted text, labels |
| Border | #ECEDEF | Dividers, card borders |

### Project / Section Colors (used for project icons and status)
| Color | Hex | Usage |
|-------|-----|-------|
| Orange | #FC6D26 | Project accent |
| Pink | #EA4E9D | Project accent |
| Green | #7AC142 | Project accent, on-track status |
| Blue | #4186E0 | Project accent |
| Yellow/Amber | #FFB900 | At-risk status |
| Red | #E8384F | Off-track status, overdue |
| Purple | #6A67CE | Project accent |
| Teal | #1AAFD0 | Project accent |

### Priority Colors
| Priority | Color |
|----------|-------|
| High | #E8384F (red) |
| Medium | #FFB900 (amber) |
| Low | #4186E0 (blue) |

## Typography
- **Font family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif
- **Heading sizes**: H1: 20px bold, H2: 16px semibold, H3: 14px semibold
- **Body text**: 13px regular
- **Small text**: 11px (timestamps, counts)
- **Line height**: 1.5 for body, 1.3 for headings

## Data Model Overview
See `data_model.md` for complete entity definitions. Key entities:
- **Users** (6): Team members with roles
- **Teams** (3): Product, Engineering, Marketing
- **Projects** (4): Each with sections and custom fields
- **Tasks** (8+): Across projects with various states
- **Comments** (3): On tasks
- **Portfolios** (2): Grouping projects
- **Goals** (2): With progress tracking
- **Notifications** (2+): Activity feed items
- **Attachments** (0): Empty by default

## What to Skip (Out of Scope)
- **Authentication/Login**: App starts pre-logged-in as Alex Johnson (user-0)
- **Real API calls**: All data is local/localStorage
- **File uploads**: Attachment UI can exist but no real upload
- **Email/SMS**: No real notifications outside the app
- **AI features**: Xsana AI is not replicated
- **Forms**: Xsana Forms for external data collection — skip
- **Rules/Automation**: Automated workflow rules — skip
- **Workload management**: Resource allocation views — skip
- **Reporting (global)**: Cross-project reporting dashboards — skip (project-level Dashboard is in scope)
