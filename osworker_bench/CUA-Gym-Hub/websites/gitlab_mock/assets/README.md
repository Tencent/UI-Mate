# XitLab Mock — Research Summary

## Application Overview

**XitLab** is a comprehensive DevOps platform that provides source code management, CI/CD pipelines, issue tracking, code review, and project management — all in a single web application. It is the primary competitor to GitHub and is used by millions of developers worldwide.

**Real Website**: https://gitlab.com

## Key User Personas

1. **Developer** — Browses code, creates branches, opens merge requests, reviews diffs, writes code comments
2. **Project Manager** — Creates/manages issues, organizes issue boards (kanban), tracks milestones, monitors project activity
3. **DevOps Engineer** — Monitors CI/CD pipelines, reviews job logs, manages environments and deployments
4. **Team Lead** — Reviews merge requests, manages labels/milestones, assigns work, monitors project health

## Primary Workflows (Daily Usage)

1. Browse project files and code
2. Create and manage issues (assign, label, milestone, comment)
3. Create merge requests from branches, review code changes
4. View CI/CD pipeline status and job logs
5. Use issue boards (kanban) to track work progress
6. Search across projects, issues, and merge requests
7. Manage project settings, labels, milestones, members
8. View commit history and branch comparisons
9. Create and edit wiki documentation
10. Track to-do items and notifications

## UI Layout Structure

### Global Shell
- **Top bar** (height ~48px): XitLab logo (tanuki) on far left, global "Search or go to..." bar centered, quick-action buttons on right (create new "+", to-dos counter, user avatar dropdown)
- **Left sidebar** (~220px wide, collapsible): Context-sensitive navigation. Changes based on whether viewing project, group, or personal dashboard. Has a "pinned" section at top for favorites.
- **Main content area**: Takes remaining space, scrollable

### Color Palette (Pajamas Design System)
- **Primary Purple**: `#7759C2` (purple-02p)
- **Light Purple**: `#A989F5` (purple-01p)
- **Dark Purple**: `#5943B6` (purple-02s)
- **Charcoal (dark bg)**: `#171321`
- **Orange accent**: `#FC6D26` (brand orange)
- **Red/Orange**: `#E24329` (brand red)
- **Teal**: `#10B1B1`
- **White**: `#FFFFFF`
- **Gray-01**: `#D1D0D3`
- **Gray-02**: `#A2A1A6`
- **Gray-03**: `#74717A`
- **Gray-04**: `#45424D`
- **Gray-05**: `#2B2838`
- **Background (light mode)**: `#FFFFFF` main, `#FAFAFA` sidebar
- **Background (dark mode)**: Not needed — use light mode
- **Text primary**: `#1F1E24` (near-black)
- **Text secondary**: `#74717A` (gray-03)
- **Border**: `#DCDCDE`
- **Success green**: `#108548`
- **Warning orange**: `#C17D10`
- **Danger red**: `#DD2B0E`
- **Info blue**: `#1F75CB`

### Typography
- **Primary font**: `'XitLab Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, Cantarell, 'Helvetica Neue', sans-serif`
- **Mono font**: `'XitLab Mono', 'JetBrains Mono', 'Menlo', 'DejaVu Sans Mono', 'Liberation Mono', 'Consolas', monospace`
- **Body text**: 14px, weight 400
- **H1**: 24-30px, weight 600
- **H2**: 21-25px, weight 600
- **H3**: 18-20px, weight 600
- **H4**: 16px, weight 600
- **Small/meta**: 12px, weight 400

## Complete Feature List

### P0 — Core Shell (Must Have)
1. App layout with top bar, left sidebar, main content
2. Left sidebar navigation (context-sensitive for project)
3. Routing for all major pages
4. Global search bar ("Search or go to...")
5. State management (React Context + reducer)
6. `/go` state inspection endpoint
7. Session isolation (sid-based state)

### P1 — Primary Features
8. **Project overview page** — README display, file tree summary, star/fork counts, activity graph
9. **Repository file browser** — Tree view of files/folders, file content display with syntax highlighting, branch selector dropdown
10. **Commit history** — List of commits with author avatar, message, date, short SHA; commit detail page with diff
11. **Branches list** — All branches with last commit info, default branch indicator
12. **Issues list** — Filterable/sortable list with Open/Closed tabs, labels as colored badges, assignee avatars, milestone names
13. **Issue detail** — Title, description (markdown), sidebar with assignee/labels/milestone/due date, comment thread, close/reopen button, edit title/description inline
14. **New issue form** — Title, description, assignee selector, label multi-select, milestone dropdown
15. **Merge requests list** — Similar to issues list with Open/Merged/Closed tabs, source->target branch display, pipeline status badge, approvals info
16. **Merge request detail** — Title, description, tabs (Overview/Commits/Changes), sidebar (assignee/reviewer/labels/milestone), merge button, close button, comment thread, diff viewer
17. **New merge request form** — Source/target branch selectors, title, description, assignee, reviewer, labels, milestone
18. **Labels management** — List of labels with color swatch, create/edit/delete labels
19. **Milestones management** — List with progress bar (% issues closed), create/edit milestones
20. **Issue board (kanban)** — Columns by label or status, drag-and-drop cards between columns, card shows title + labels + assignee avatar
21. **CI/CD Pipelines list** — Pipeline rows with status badge (passed/failed/running/pending), branch, commit, duration, stages visualization (small circles)
22. **Pipeline detail** — Stage/job graph visualization, job list with status, job log viewer (mock terminal output)
23. **Wiki** — Page list, page content (markdown rendered), create/edit pages
24. **Snippets** — List and detail view, create/edit snippets with syntax highlighting
25. **Members list** — User list with role (Owner/Maintainer/Developer/Reporter/Guest), invite member form
26. **Project settings** — General settings (name, description, visibility), feature toggles

### P2 — Secondary Features
27. **To-do list** — Items assigned to current user from issues/MRs
28. **Activity feed** — Recent events on project (push, issue create, MR merge, comment)
29. **Tags list** — Git tags with associated release info
30. **Releases** — Release list with tag, description, assets
31. **Compare branches** — Two-branch diff view
32. **User profile page** — Avatar, bio, activity, owned projects
33. **New project creation** — Form to create a new project
34. **Notifications** — Notification badge on top bar, dropdown/page listing notifications
35. **Keyboard shortcuts modal** — "?" opens shortcuts overlay
36. **Breadcrumb navigation** — Group > Project > Section path in main content area

## Screenshot Annotations

### Screenshot 000003.jpg (New Merge Request page)
- **Left sidebar**: Dark purple/gray (#292261 area), showing: Project name "Predefined Variables" at top, then sections: Pinned, Issues (count badge "0"), Merge requests (count badge "0"), then expandable sections: Manage, Plan, Code, Build, Secure, Deploy, Operate, Monitor, Analyze, Settings. Each section has a ">" chevron for sub-menu.
- **Top bar**: XitLab tanuki logo (orange/red), quick action buttons, user avatar, "Search or go to..." bar
- **Breadcrumb**: "demos-group / Predefined Variables / Merge requests / New"
- **Main content**: New MR form with: Assignee dropdown, Approval rules, Milestone selector, Labels multi-select (showing colored pill badges like "predefined-variables" in green, "testing-rules" in red), Merge options checkboxes, "Create merge request" primary button (purple), "Cancel" secondary button
- **Bottom tabs**: Commits (1), Pipelines (1), Changes (1) — showing commit list with avatar, message, date, and short SHA hash

## Data Model Summary

See `data_model.md` for complete entity definitions. Key entities:
- **Users** (5 users including current user)
- **Groups** (2 groups/namespaces)
- **Projects** (4 projects across groups)
- **Issues** (15+ issues across projects)
- **Merge Requests** (8+ MRs)
- **Pipelines** (6+ pipelines)
- **Jobs** (20+ jobs across pipelines)
- **Labels** (10+ labels per project)
- **Milestones** (3+ per project)
- **Branches** (multiple per project)
- **Commits** (many per project)
- **Files** (repository tree)
- **Comments/Notes** (on issues and MRs)
- **Wiki Pages** (per project)
- **Snippets** (project and personal)
- **Members** (per project with roles)
- **Todos** (assigned items)

## What to Skip
- Authentication/login (app starts pre-logged-in as default user)
- Real Git operations (all simulated in state)
- Real CI/CD execution (pipelines are mock data)
- File uploads to real servers
- Email/notification sending
- WebSocket real-time updates
- Container registry, package registry
- Admin/instance-level settings
