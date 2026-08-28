# Xira Mock — Research Summary

> Researched: 2026-02-28
> Application: [Xira Software](https://www.atlassian.com/software/jira) by Atlassian
> Category: Project management / Issue tracking / Agile development

---

## App Overview

Xira Software is Atlassian's flagship project management and issue tracking tool, widely used by software development teams for agile project management. It supports both Scrum and Kanban methodologies, offering boards, backlogs, sprints, roadmaps, and extensive reporting. In 2024, Xira Software and Xira Work Management were unified under the single "Xira" brand.

In 2025, Atlassian rolled out a completely redesigned navigation with a vertical left sidebar replacing the old horizontal top bar — making the layout more consistent across all Atlassian products.

## Key User Personas

1. **Developer** (primary): Views board daily, updates issue status via drag-drop, logs work, adds comments, creates subtasks
2. **Project Manager / Scrum Master**: Manages sprints (create, start, complete), grooms backlog, views reports (burndown, velocity), manages board configuration
3. **Product Owner**: Creates and prioritizes issues in backlog, writes descriptions and acceptance criteria, manages epics and roadmap
4. **QA Engineer**: Creates bug reports, transitions issues through review states, adds comments with test results

## Visual Design System

### Color Palette (Atlassian Design System)
- **Primary Blue**: `#0052CC` (buttons, links, active states, board column highlights)
- **Dark Blue/Text**: `#172B4D` (primary text, headings)
- **Subtext Gray**: `#5E6C84` (secondary text, timestamps, metadata)
- **Background White**: `#FFFFFF` (main content area)
- **Light Gray BG**: `#F4F5F7` (sidebar, column backgrounds, card hover)
- **Border Gray**: `#DFE1E6` (borders, dividers, card outlines)
- **Green (Success)**: `#36B37E` (Done status, success states)
- **Yellow (Warning)**: `#FFAB00` (Medium priority, warning states)
- **Red (Error/High)**: `#DE350B` (Bug icon, high priority, error states)
- **Teal (Info)**: `#00B8D9` (In Review status)
- **Purple**: `#6554C0` (Epic issue type)
- **Light Blue BG**: `#DEEBFF` (selected/active item backgrounds)

### Typography
- **Font Family**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`
- **Headings**: 20-24px, font-weight 600-700, color `#172B4D`
- **Body Text**: 14px, font-weight 400, color `#172B4D`
- **Secondary Text**: 12-13px, font-weight 400, color `#5E6C84`
- **Labels/Badges**: 11-12px, font-weight 600, uppercase for field labels

### Layout Dimensions
- **Left Sidebar**: 240-260px wide, fixed position, full height
- **Top Header**: None (new 2025 layout uses sidebar-only navigation)
- **Main Content**: Fills remaining space, scrollable
- **Issue Modal**: Max-width ~960px, 90vh height, centered overlay
- **Board Columns**: ~280-300px each, horizontal scroll for overflow

## Feature List (Prioritized)

### P0 — Core Shell (App cannot render without these)
1. Project scaffold with Vite + React + TypeScript + Tailwind
2. Visual design system matching Atlassian Design tokens
3. App layout: Fixed left sidebar (260px) + fluid main content area
4. Routing: BrowserRouter with project-scoped routes
5. State management: React Context + useReducer + dataManager.js
6. `/go` state inspection endpoint
7. Session isolation (vite.config.js mock-api plugin)

### P1 — Primary Features (Core interactive workflows)
1. **Board View** (Scrum/Kanban): Columns for each status, drag-drop issue cards, sprint header, search/filter bar, avatar filter chips
2. **Backlog View**: Sprint sections (collapsible), backlog section, drag-drop between sprints, inline create issue, sprint start/complete actions, story point totals
3. **Issue Detail Modal**: Two-column layout (main content left, fields sidebar right), summary editing, description textarea with toolbar, status/assignee/priority/type dropdowns, labels, story points, subtasks with progress bar, comments with avatar, timestamps
4. **Create Issue Dialog**: Modal form with project selector, issue type, summary, description, assignee, priority, labels, sprint, story points — appears globally via "Create" button or keyboard shortcut "C"
5. **Sidebar Navigation**: Project icon + name, nav links (Board, Backlog, Reports, Settings), project list, search, starred items, user avatar at bottom
6. **Advanced Search / Filters**: Search bar with type/status/priority/assignee filter dropdowns, table view with sortable columns, bulk selection, bulk edit
7. **Sprint Management**: Create sprint, start sprint (with date picker), complete sprint (moves incomplete to backlog), sprint goal editing
8. **Bulk Edit**: Multi-select issues, change status/assignee/priority/sprint in batch

### P2 — Secondary Features (Depth & Realism)
1. **Dashboard**: Configurable gadget layout (status pie chart, assigned-to-me list, activity stream, priority bar chart)
2. **Reports**: Burndown chart (line chart showing ideal vs actual), velocity chart (bar chart of completed points per sprint), sprint report (planned vs delivered)
3. **Roadmap/Timeline**: Gantt-style horizontal bars showing epics over time (simplified)
4. **Epic Management**: Epic entity, link issues to epics, epic swimlanes on board, epic filter in backlog
5. **Quick Filters**: Board-level filter chips (Only My Issues, Recently Updated, by label)
6. **Notifications Panel**: Bell icon in sidebar, list of recent activity notifications
7. **Project Settings Page**: Project details (name, key, lead, category), board column configuration
8. **Keyboard Shortcuts**: "C" to create issue, "?" for shortcuts dialog, "J"/"K" for navigate issues
9. **Issue Linking**: Link issues (blocks, is blocked by, relates to, duplicates)
10. **Watcher/Follower**: Watch an issue for updates
11. **Column Constraints**: WIP limits with visual indicator when exceeded

## UI Layout — Major Views

### Sidebar (Global)
- Top: Xira logo + product name
- Project section: Project icon, name, key
- Navigation: Summary/Board/Backlog/Reports/Settings (icons + labels)
- Divider
- Search link
- Bottom: Current user avatar + name + email

### Board View
- Header: Sprint name (h1), issue count badge
- Filter bar: Search input, user avatar filter chips, "Clear filters" link
- Columns: 4 status columns (To Do, In Progress, In Review, Done), each with header (status name + count badge), scrollable card list
- Cards: White with border, shows issue key (muted), summary text, bottom row with type icon + priority icon + story points badge + assignee avatar
- Drag-drop: Cards draggable between columns, blue highlight on drop zone

### Backlog View
- Header: "Backlog" (h1), bulk change button (appears when issues selected)
- Sprint sections: Collapsible with chevron, sprint name, date range, issue count, story point total, Start/Complete Sprint button, "..." menu
- Issue rows: Checkbox, issue key, summary (truncated), status badge (colored), assignee avatar, story points badge
- Drag-drop: Issues draggable between sprints and backlog
- Bottom: Backlog section with same row format, "Create issue" button at bottom of each section

### Issue Detail Modal
- Overlay: Dark semi-transparent backdrop
- Layout: Two columns — left ~60% (main content), right ~40% (detail fields sidebar, gray bg)
- Header: Issue key + type breadcrumb, delete button (red), close button (X)
- Left column: Summary (editable h2 input), Description (textarea with rich text toolbar icons), Subtasks section (progress bar, checkbox list, add subtask), Attachments (drag-drop zone), Comments (avatar + input + send, reverse-chronological list)
- Right column: Status dropdown (with allowed transitions), Assignee dropdown, Priority dropdown, Issue Type (shown but often not editable), Story Points input, Labels (tag chips), Sprint assignment, Reporter (display), Created/Updated timestamps
- Footer area: Timestamps (created, updated) with icons

### Advanced Search
- Header: "Advanced Search" (h1), bulk change button
- Search bar: Full-width input with search icon
- Results table: Checkbox column, Key, Summary, Status (badge), Priority, Assignee (avatar + name)
- Select all checkbox in header, row hover highlight

### Dashboard
- Header: "System Dashboard" (h1)
- Grid layout (3 columns):
  - Welcome banner (full width, gradient blue)
  - Status pie chart (donut)
  - Assigned to me list
  - Recent activity stream
  - Priority bar chart (full 2-col width)

### Reports
- Header: "Reports" (h1)
- Burndown chart: Area chart showing remaining work over sprint days
- (Future: Velocity chart, Sprint report)

## Data Model Overview

See `data_model.md` for complete field definitions.

**Core Entities:**
- **User**: Team members (id, name, email, avatar)
- **Project**: Container for issues (id, key, name, lead, category, icon)
- **Issue**: Central entity (id, key, summary, description, type, status, priority, assignee, reporter, sprint, story points, labels, subtasks, epic link, created/updated)
- **Sprint**: Time-boxed iteration (id, name, goal, dates, state)
- **Comment**: Issue comments (id, issueId, userId, content, createdAt)
- **Workflow**: Status transition rules (id, name, transitions)
- **Epic**: Large feature grouping (linked via epicId on issues)

**Key Relationships:**
- Issue → Project (many-to-one via projectId)
- Issue → Sprint (many-to-one via sprintId, nullable = backlog)
- Issue → Assignee/Reporter (many-to-one via userId)
- Issue → Epic (many-to-one via epicId, nullable)
- Comment → Issue (many-to-one via issueId)
- Sprint → Project (many-to-one via projectId)

## What to Skip (Out of Scope)

- **Authentication**: App starts pre-logged-in as "Admin User" (u1)
- **Real file uploads**: Attachment zone is visual-only
- **Permissions/roles**: All users can edit everything
- **Real-time collaboration**: No WebSocket/push updates
- **Marketplace apps**: No third-party integrations
- **Automation rules**: No triggers/conditions/actions engine
- **Confluence/Bitbucket integration**: No cross-product linking
- **Email notifications**: No real email sending
- **JQL parser**: Search uses simple text matching + dropdown filters, not full JQL syntax
- **Time tracking**: Log work feature omitted for simplicity

## Existing Implementation Status

The current codebase already has a partial implementation:
- ✅ TypeScript + Vite + React + Tailwind setup
- ✅ Session isolation (vite.config.js + dataManager.js)
- ✅ State management (React Context + useReducer)
- ✅ `/go` endpoint (StateInspector)
- ✅ Sidebar navigation (basic)
- ✅ Board view with drag-drop (using @hello-pangea/dnd)
- ✅ Backlog view with sprint management
- ✅ Issue detail modal (comprehensive)
- ✅ Advanced search with table view
- ✅ Bulk edit modal
- ✅ Dashboard with charts (recharts)
- ✅ Reports with burndown chart
- ❌ Create issue dialog (only inline creation in backlog)
- ❌ Epic management (type exists but no parent/epic link)
- ❌ Roadmap/Timeline view
- ❌ Project settings page
- ❌ Notifications
- ❌ Issue linking
- ❌ Keyboard shortcuts
- ❌ Filter dropdowns (type, status, priority) on search page
- ❌ Sprint creation from backlog

## Screenshot Index

| File | Description |
|------|-------------|
| `board_kanban_01-05.jpg` | Kanban board views with columns and cards |
| `board_scrum_01-03.jpg` | Scrum board with sprint columns and cards |
| `backlog_sprint_01.jpg` | Backlog view with sprint sections and issue list |
| `backlog_sprint_04.jpg` | Backlog with inline editing, story points, status |
| `create_issue_01-02.jpg` | Create issue dialog/form |
| `dashboard_01-03.jpg` | Dashboard with gadgets and charts |
| `issue_detail_02-05.jpg` | Issue detail views with fields |
| `navigation_01-03.jpg` | Navigation comparison (old vs new Xira UI) |

## Sources

- [Xira (software) - Wikipedia](https://en.wikipedia.org/wiki/Jira_(software))
- [Xira on Product Hunt](https://www.producthunt.com/products/jira)
- [Xira's ever-evolving UI (2025 Edition)](https://community.atlassian.com/forums/Jira-articles/Jira-s-ever-evolving-UI-2025-Edition/ba-p/2966105)
- [What is the new navigation in Xira?](https://support.atlassian.com/jira-software-cloud/docs/what-is-the-new-navigation-in-xira/)
- [Configure columns](https://support.atlassian.com/jira-software-cloud/docs/configure-columns/)
- [Configure the work item details](https://support.atlassian.com/jira-software-cloud/docs/configure-the-issue-detail-view/)
- [Xira keyboard shortcuts](https://support.atlassian.com/jira-software-cloud/docs/use-keyboard-shortcuts/)
- [Xira Data Model](https://hevodata.com/learn/jira-data-model/)
- [Xira Database Schema](https://developer.atlassian.com/server/jira/platform/database-schema/)
- [Schema for Xira Analytics](https://support.atlassian.com/analytics/docs/schema-for-xira-software/)
