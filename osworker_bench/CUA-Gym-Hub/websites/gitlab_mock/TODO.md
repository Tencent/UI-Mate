# XitLab Mock — TODO

> Status: IMPLEMENTED
> Last updated by: dev agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

- [x] **Project scaffold**: `npm create vite@latest gitlab_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`. Do NOT use TypeScript — use plain JSX.

- [x] **Visual design system**: XitLab uses the "Pajamas" design system. Study `assets/screenshots/000003.jpg` for the real UI. Create a CSS file (`src/styles/gitlab.css`) with CSS variables:
  - `--gl-purple`: `#7759C2` (primary action buttons, active sidebar items)
  - `--gl-purple-light`: `#A989F5`
  - `--gl-purple-dark`: `#5943B6`
  - `--gl-orange`: `#FC6D26` (XitLab tanuki logo)
  - `--gl-red`: `#E24329` (tanuki accent, danger)
  - `--gl-bg-primary`: `#FFFFFF` (main content background)
  - `--gl-bg-secondary`: `#FAFAFA` (sidebar background, secondary areas)
  - `--gl-bg-tertiary`: `#F0F0F0` (input backgrounds, hover states)
  - `--gl-text-primary`: `#1F1E24`
  - `--gl-text-secondary`: `#74717A`
  - `--gl-text-tertiary`: `#A2A1A6`
  - `--gl-border`: `#DCDCDE`
  - `--gl-success`: `#108548`
  - `--gl-warning`: `#C17D10`
  - `--gl-danger`: `#DD2B0E`
  - `--gl-info`: `#1F75CB`
  - Font family: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - Mono font: `'JetBrains Mono', 'Menlo', 'Consolas', monospace`
  - Base font size: 14px, border-radius: 4px for most elements, 8px for cards

- [x] **App layout** (`src/components/Layout.jsx`): Three-zone layout matching screenshot 000003.jpg:
  - **Top bar**: 48px height, white background, bottom border `#DCDCDE`. Contains: XitLab tanuki SVG logo (left, 28px), "Search or go to..." search input (centered, ~400px wide, gray bg `#F0F0F0`, rounded pill shape), right side: "+" create button, todo counter badge (shows number like "3"), user avatar (32px round).
  - **Left sidebar**: 220px width, white background `#FAFAFA`, right border `#DCDCDE`. Scrollable. At top: current project avatar (colored square with first letter) + project name. Then navigation sections (see next item). Collapsible via hamburger in top bar.
  - **Main content**: fills remaining space, padding 24px, max-width 1200px centered, scrollable.

- [x] **Left sidebar navigation** (`src/components/Sidebar.jsx`): Context-sensitive sidebar for project view. Each item: 14px text, 36px row height, 8px left padding, `lucide-react` icon (16px) + label. Hover: bg `#EDEDEF`. Active: bg `#E9E5F5` (light purple tint), text `#5943B6` (purple). Sections with expandable chevrons:
  - **Project section** (always visible): Project avatar + name at top
  - **Pinned** (collapsible, initially empty — placeholder)
  - Items (not in sub-sections):
    - "Issues" (icon: `CircleDot`) — links to `/:group/:project/-/issues` — shows open count badge
    - "Merge requests" (icon: `GitMerge`) — links to `/:group/:project/-/merge_requests` — shows open count badge
  - **Manage** (expandable): Members, Labels
  - **Plan** (expandable): Issue boards, Milestones, Wiki
  - **Code** (expandable): Repository (file browser), Branches, Commits, Tags, Compare
  - **Build** (expandable): Pipelines, Jobs
  - **Deploy** (expandable): Releases
  - **Monitor** (expandable): (empty placeholder)
  - **Analyze** (expandable): (empty placeholder)
  - **Settings** (expandable): General, Repository

- [x] **Routing** (`src/App.jsx`): BrowserRouter with routes:
  - `/` → Dashboard (project list)
  - `/:group/:project` → Project overview (README + file summary)
  - `/:group/:project/-/issues` → Issues list
  - `/:group/:project/-/issues/new` → New issue form
  - `/:group/:project/-/issues/:iid` → Issue detail
  - `/:group/:project/-/boards` → Issue board (kanban)
  - `/:group/:project/-/merge_requests` → MR list
  - `/:group/:project/-/merge_requests/new` → New MR form
  - `/:group/:project/-/merge_requests/:iid` → MR detail
  - `/:group/:project/-/pipelines` → Pipelines list
  - `/:group/:project/-/pipelines/:id` → Pipeline detail
  - `/:group/:project/-/jobs/:id` → Job detail (log viewer)
  - `/:group/:project/-/tree/:branch/*` → File browser (tree)
  - `/:group/:project/-/blob/:branch/*` → File viewer (single file)
  - `/:group/:project/-/commits/:branch` → Commit history
  - `/:group/:project/-/commit/:sha` → Commit detail
  - `/:group/:project/-/branches` → Branches list
  - `/:group/:project/-/tags` → Tags list
  - `/:group/:project/-/releases` → Releases list
  - `/:group/:project/-/wikis` → Wiki pages
  - `/:group/:project/-/wikis/:slug` → Wiki page detail
  - `/:group/:project/-/snippets` → Snippets list
  - `/:group/:project/-/project_members` → Members list
  - `/:group/:project/-/milestones` → Milestones list
  - `/:group/:project/-/labels` → Labels management
  - `/:group/:project/-/settings/general` → Project settings
  - `/projects/new` → New project form
  - `/dashboard/todos` → Todo list
  - `/-/profile` → User profile
  - `/go` → State inspection (JSON endpoint)
  The `/:group/:project/*` routes should all render within the Layout with sidebar. Dashboard and `/go` do NOT use the project sidebar.

- [x] **State management**: `src/context/AppContext.jsx` with React Context + `useReducer`. Pattern: import `createInitialData` from `src/utils/dataManager.js`. Actions should mirror the github_mock pattern — define an ACTIONS object with all action types. Key actions:
  - `INIT`, `RESET`
  - `CREATE_PROJECT`, `UPDATE_PROJECT`, `DELETE_PROJECT`, `STAR_PROJECT`, `FORK_PROJECT`
  - `CREATE_ISSUE`, `UPDATE_ISSUE`, `CLOSE_ISSUE`, `REOPEN_ISSUE`, `DELETE_ISSUE`
  - `ADD_ISSUE_COMMENT`, `UPDATE_ISSUE_COMMENT`, `DELETE_ISSUE_COMMENT`
  - `CREATE_MERGE_REQUEST`, `UPDATE_MERGE_REQUEST`, `MERGE_MR`, `CLOSE_MR`, `REOPEN_MR`
  - `ADD_MR_COMMENT`, `UPDATE_MR_COMMENT`, `DELETE_MR_COMMENT`
  - `CREATE_LABEL`, `UPDATE_LABEL`, `DELETE_LABEL`
  - `CREATE_MILESTONE`, `UPDATE_MILESTONE`, `CLOSE_MILESTONE`
  - `CREATE_BRANCH`, `DELETE_BRANCH`
  - `CREATE_WIKI_PAGE`, `UPDATE_WIKI_PAGE`, `DELETE_WIKI_PAGE`
  - `CREATE_SNIPPET`, `UPDATE_SNIPPET`, `DELETE_SNIPPET`
  - `ADD_MEMBER`, `UPDATE_MEMBER_ROLE`, `REMOVE_MEMBER`
  - `MARK_TODO_DONE`, `MARK_ALL_TODOS_DONE`
  - `MOVE_BOARD_ISSUE` (drag-drop on kanban)
  - `UPDATE_FILE`
  State should persist to localStorage with key `gitlab_mock_state`.

- [x] **Data manager** (`src/utils/dataManager.js`): Implement `createInitialData()` returning the full state object per `assets/data_model.md`. All seed data must be realistic and internally consistent (e.g., issue assigneeIds reference real user IDs, labelIds reference real labels, etc.). Include helper functions: `getSessionId()`, `saveState(state)`, `loadState()`.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route at `/go`. Returns JSON with `{ initial_state, current_state, state_diff }`. Compute deep diff between initial and current state. Display as formatted JSON in a `<pre>` tag. Also serve as API: the vite dev server plugin intercepts `GET /go?sid=<sid>` and returns the JSON directly.

- [x] **Session isolation**: `vite.config.js` mock-api plugin handling:
  - `POST /post?sid=<sid>` with `{"action":"set","state":{...}}` — sets both initial + current state
  - `POST /post?sid=<sid>` with `{"action":"set_current","state":{...}}` — sets current only
  - `POST /post?sid=<sid>` with `{"action":"reset"}` — resets to initial
  - `GET /go?sid=<sid>` — returns `{initial_state, current_state, state_diff}`
  Use localStorage keyed by sid.

---

## P1 — Primary Features

### Dashboard & Navigation

- [x] **Dashboard page** (`src/pages/Dashboard.jsx`): The landing page when no project is selected. Full-width (no project sidebar). Shows:
  - Header: "Welcome to XitLab" greeting with current user name
  - "Your projects" section: list of all projects the user has access to, each showing: project avatar (colored square), full path ("acme-corp / web-platform"), description, language badge, star count, fork count, last updated relative time ("3 hours ago"), visibility icon (lock for private, globe for public)
  - Each project row is clickable → navigates to project overview
  - "New project" button (top right, green `#108548` bg)

- [x] **Global search bar**: Clicking the "Search or go to..." input in the top bar opens a dropdown/modal overlay. Type to filter projects by name. Show matching projects with their full paths. Clicking a result navigates to that project. Also support searching issues and MRs by title (show results grouped: "Projects", "Issues", "Merge Requests"). Pressing Escape closes. Keyboard shortcut "/" focuses search.

- [x] **Top bar actions**:
  - "+" button: dropdown menu with options: "New project", "New issue" (if in a project context), "New merge request" (if in a project context), "New snippet". Each links to appropriate route.
  - Todo counter: shows number of pending todos. Clicking navigates to `/dashboard/todos`.
  - User avatar: dropdown with: user name + username, "Edit profile", "Preferences" (no-op), separator, "Sign out" (no-op). 32px round avatar.

- [x] **Breadcrumb navigation** (`src/components/Breadcrumb.jsx`): Shown at top of main content area below top bar. Format: "Group name > Project name > Section" with each segment as a link. E.g., "Acme Corp > web-platform > Issues". Use `>` separator, text color `#74717A`, last segment `#1F1E24`.

### Project Overview

- [x] **Project overview page** (`src/pages/ProjectOverview.jsx`): Route `/:group/:project`. Shows:
  - **Project header**: Project name (h1), description below, row of stats: star count (star icon), fork count (git-fork icon), visibility badge. "Star" button (toggleable, outline when unstarred, filled when starred) and "Fork" button.
  - **Tabbed file browser summary**: Shows the repo file tree (top-level files/folders) in a table: icon (folder/file), name (link), last commit message, last commit date (relative). Table headers: "Name", "Last commit", "Last update". Branch selector dropdown above table (shows current branch "main", click to switch).
  - **README.md**: Below the file table, render the README content from the files data. Wrap in a bordered card with header "README.md".
  - **Right sidebar**: Languages bar (colored horizontal segments per language), Topics (pill badges), Activity graph placeholder.

### Repository (Code) Browser

- [x] **File tree view** (`src/pages/FileTree.jsx`): Route `/:group/:project/-/tree/:branch/*`. Shows directory listing as a table identical to GitHub's: columns Name (with folder/file icon), Last commit, Last update. Folders sort before files. Clicking a folder navigates deeper (`/-/tree/main/src/components`). Clicking a file navigates to blob view. Branch selector dropdown at top left. Breadcrumb shows path: "project > src > components".

- [x] **File blob view** (`src/pages/FileBlob.jsx`): Route `/:group/:project/-/blob/:branch/*`. Shows file content with:
  - File header: filename, file size, "Copy file path" button, "Raw" button (shows raw content), "Edit" button (opens inline editor), "Delete" button
  - Line numbers on left side (monospace, gray)
  - Syntax-highlighted content (use `<pre><code>` with language class for basic highlighting — color keywords, strings, comments)
  - For markdown files, render as formatted markdown below a "Preview" / "Code" toggle

- [x] **Branch selector dropdown** (`src/components/BranchSelector.jsx`): Dropdown button showing current branch name with a down chevron. On click, shows searchable list of all branches for the project. Clicking a branch updates the current view to that branch's files. Default branch shows a "default" badge.

### Issues

- [x] **Issues list page** (`src/pages/IssuesList.jsx`): Route `/:group/:project/-/issues`. Features:
  - **Tabs**: "Open" (count) and "Closed" (count), styled as tabs with active underline in purple
  - **Filter bar**: Row of dropdowns: "Assignee" (user list), "Label" (label list with color swatches), "Milestone" (milestone list), "Sort" (Created date, Updated date, Priority, Due date)
  - **Issue rows**: Each row shows: status icon (green circle-dot for open, purple check-circle for closed), title (bold, clickable link → issue detail), label badges (colored pills with label name), right side: assignee avatar(s) (24px round, stacked if multiple), comment count icon + number, relative time ("2 days ago"), milestone name if set
  - **"New issue" button**: top right, green bg `#108548`, navigates to new issue form
  - Pagination or "Show more" at bottom if >20 issues

- [x] **Issue detail page** (`src/pages/IssueDetail.jsx`): Route `/:group/:project/-/issues/:iid`. Layout: main content (left ~70%) + sidebar (right ~30%):
  - **Header**: Issue title (h1, editable — click to show inline text input + Save/Cancel), issue state badge ("Open" green / "Closed" purple), `#iid` reference number, author name + "created X days ago"
  - **Description**: Markdown-rendered body. "Edit" button (pencil icon) toggles to textarea editor with Save/Cancel
  - **Comment thread**: List of comments, each with: author avatar (40px) + name + relative timestamp, comment body (markdown). Below all comments: "Add a comment" textarea + "Comment" submit button (green). Also show system notes ("Sofia assigned this to Marcus 2 days ago") in a muted style
  - **Sidebar** (right):
    - Assignees: show assigned user avatars + names, "Edit" link opens dropdown to add/remove
    - Labels: show colored label pills, "Edit" link opens multi-select dropdown
    - Milestone: show milestone title or "None", "Edit" link opens dropdown
    - Due date: show date or "None", "Edit" opens date input
    - Weight: show number or "None", "Edit" opens number input
  - **Action buttons**: "Close issue" button (red-ish) / "Reopen issue" button. State toggle dispatches CLOSE_ISSUE / REOPEN_ISSUE

- [x] **New issue form** (`src/pages/NewIssue.jsx`): Route `/:group/:project/-/issues/new`. Form with:
  - Title input (required)
  - Description textarea (large, markdown supported)
  - Right sidebar: Assignee dropdown (multi-select from project members), Labels dropdown (multi-select with color swatches), Milestone dropdown, Due date picker, Weight input
  - "Create issue" primary button (green), "Cancel" link
  - On submit: dispatch CREATE_ISSUE, navigate to new issue detail

### Merge Requests

- [x] **Merge requests list page** (`src/pages/MergeRequestsList.jsx`): Route `/:group/:project/-/merge_requests`. Similar layout to issues list:
  - **Tabs**: "Open" (count), "Merged" (count), "Closed" (count)
  - **Filter bar**: Assignee, Reviewer, Label, Milestone, Sort dropdowns
  - **MR rows**: Status icon (green for open, purple-merged icon for merged, gray for closed), title (link), "Draft:" prefix if draft, label badges, right side: pipeline status mini-badge (green circle = passed, red = failed, blue spinner = running), assignee avatar, comment count, branch badge "source → target" in monospace, relative time
  - "New merge request" button top right

- [x] **Merge request detail page** (`src/pages/MergeRequestDetail.jsx`): Route `/:group/:project/-/merge_requests/:iid`. Layout with tabs:
  - **Header**: Title (editable inline), state badge, `!iid` reference, author + created date, source → target branch badges (monospace, pill-shaped)
  - **Tabs**: "Overview", "Commits" (count), "Changes" (count)
  - **Overview tab**:
    - Description (markdown, editable)
    - Pipeline status section: status badge + "Pipeline #X passed/failed" link
    - Merge widget: If `can_be_merged`: show green "Merge" button. If draft: show "Mark as ready" button. If merged: show "Merged by X at Y" info. If conflicts: show "Merge blocked: conflicts" warning.
    - Comment thread (same as issue detail)
  - **Commits tab**: List of commits on the source branch. Each: short SHA (monospace link), commit message, author avatar + name, relative date
  - **Changes tab**: Simplified diff viewer. Show list of changed files with + additions / - deletions count. For each file, show a collapsible diff block with green (added) and red (removed) lines with line numbers
  - **Sidebar** (right): Assignees, Reviewers (with approval status), Labels, Milestone
  - **Actions**: "Merge" button (green, only if open+mergeable), "Close" button, "Reopen" (if closed)

- [x] **New merge request form** (`src/pages/NewMergeRequest.jsx`): Route `/:group/:project/-/merge_requests/new`.
  - Source branch selector dropdown, Target branch selector dropdown
  - Title input (auto-fills from branch name: "feature/dashboard-refactor" → "Resolve: Dashboard refactor")
  - Description textarea
  - Right sidebar: Assignee, Reviewer, Labels, Milestone dropdowns
  - Merge options: checkboxes for "Delete source branch when merged", "Squash commits when merged"
  - "Create merge request" button (purple/blue `#7759C2`), "Cancel"

### CI/CD Pipelines

- [x] **Pipelines list page** (`src/pages/PipelinesList.jsx`): Route `/:group/:project/-/pipelines`. Table of pipelines:
  - Columns: Status (colored badge: green "passed", red "failed", blue "running", gray "pending"), Pipeline (# + short description), Triggerer (user avatar), Commit (short SHA link), Branch (monospace badge), Stages (row of small colored circles — green/red/gray per stage status), Duration, Created (relative time)
  - Each pipeline row is clickable → pipeline detail
  - Filter tabs: "All", "Finished", "Running", "Pending"

- [x] **Pipeline detail page** (`src/pages/PipelineDetail.jsx`): Route `/:group/:project/-/pipelines/:id`.
  - **Header**: "Pipeline #X" with status badge, triggered by user, branch, commit SHA
  - **Stage/Job graph**: Visual representation of stages as columns. Each stage ("build", "test", "deploy") is a column header. Below each stage, show job boxes with: job name, status icon (green check, red X, blue spinner, gray circle). Lines connect stages left-to-right. Clicking a job → job detail page
  - **Jobs table**: Alternative tabular view: columns Status, Job name, Stage, Duration, Triggered by

- [x] **Job detail page** (`src/pages/JobDetail.jsx`): Route `/:group/:project/-/jobs/:id`.
  - Header: "Job #X: job-name" with status badge
  - **Log viewer**: Black background terminal-style display showing the job's `logExcerpt`. Monospace font (XitLab Mono/JetBrains Mono), green text for success lines, red for errors, white for normal output. Line numbers on left. Auto-scroll to bottom. Show duration at bottom.
  - Sidebar: Job info (stage, runner, duration, timestamps)

### Issue Board (Kanban)

- [x] **Issue board page** (`src/pages/IssueBoard.jsx`): Route `/:group/:project/-/boards`. Kanban-style board:
  - **Board header**: Board name ("Development Board"), board settings button
  - **Columns/Lists**: Each list is a vertical column ~300px wide, horizontal scroll if many lists. Column header: list name (label name with colored dot, or "Open"/"Closed"), issue count. Background of column: `#F0F0F0`
  - **Cards**: Each issue card shows: title (14px, bold), issue reference (#iid), label badges (small), assignee avatar (24px, bottom-right of card), due date if set. Card background white, border `#DCDCDE`, border-radius 4px, margin 8px
  - **Drag and drop**: Cards can be dragged between columns. When dropped on a label column, that label is added/removed from the issue. When dropped on "Closed", issue is closed. Implement with HTML5 drag events (onDragStart, onDragOver, onDrop) — no library needed
  - **Add issue**: Each column has a "+" button at top or bottom to create a new issue directly in that column/list

### Labels & Milestones

- [x] **Labels management page** (`src/pages/Labels.jsx`): Route `/:group/:project/-/labels`.
  - List of labels, each row: color swatch (20px square, rounded), label name (bold), description, "Edit" and "Delete" buttons on right
  - "New label" button opens inline form or modal: name input, color picker (preset colors + custom hex input), description textarea, Save/Cancel buttons
  - Edit: same form pre-filled
  - Delete: confirmation dialog

- [x] **Milestones list page** (`src/pages/Milestones.jsx`): Route `/:group/:project/-/milestones`.
  - Tabs: "Open" / "Closed"
  - Each milestone card: title (h3 link), progress bar (green fill = % of issues closed), "X% complete (Y open — Z closed)", due date, description preview
  - "New milestone" button → inline form: title, description, start date, due date
  - Milestone detail: clicking title shows full description + list of issues in that milestone

### Wiki & Snippets

- [x] **Wiki pages** (`src/pages/Wiki.jsx`): Route `/:group/:project/-/wikis`.
  - Sidebar: page list (clickable titles), "New page" button
  - Main area: selected page content rendered as markdown
  - **Edit mode**: Toggle to textarea editor, Save/Cancel buttons
  - **Create page**: Title input + content textarea + Save button

- [x] **Snippets list** (`src/pages/Snippets.jsx`): Route `/:group/:project/-/snippets`.
  - List of snippets: title (link), filename, language badge, author, created date
  - Snippet detail: title, description, code block with syntax highlighting, "Edit"/"Delete" buttons
  - "New snippet" form: title, description, filename, language selector, content textarea

### Members

- [x] **Members page** (`src/pages/Members.jsx`): Route `/:group/:project/-/project_members`.
  - Table: user avatar (40px), name, username, role dropdown (Owner/Maintainer/Developer/Reporter/Guest — editable for current user if Owner), "Remove" button (not for self)
  - "Invite members" button → form: username/email input, role selector, "Invite" button

### Project Settings

- [x] **Project settings page** (`src/pages/ProjectSettings.jsx`): Route `/:group/:project/-/settings/general`.
  - Section cards:
    - **General**: Project name (editable input), Description (editable textarea), Topics (editable tag input), Visibility (radio: Private/Internal/Public), Save button
    - **Features**: Toggle switches for Issues, Merge Requests, Wiki, Snippets, Pipelines
    - **Danger zone** (red border): "Archive project" button, "Delete project" button (confirmation modal with project name input to confirm)

### Branches, Commits, Tags

- [x] **Branches list page** (`src/pages/Branches.jsx`): Route `/:group/:project/-/branches`.
  - Tabs: "Active", "Stale", "All"
  - **Default branch**: Highlighted at top with "default" badge
  - Each branch row: branch name (monospace, link), last commit message, last commit date (relative), commit author avatar, "Compare" button, "Delete" button (not for default/protected branches, protected badge shown)
  - "New branch" button → modal: branch name input, source branch selector

- [x] **Commit history page** (`src/pages/CommitHistory.jsx`): Route `/:group/:project/-/commits/:branch`.
  - Grouped by date. Each day header: "Apr 08, 2026"
  - Each commit row: short SHA (monospace, clickable → commit detail), commit message title (bold), author avatar (20px) + author name, relative time on right
  - Branch selector at top (same as file tree)

- [x] **Commit detail page** (`src/pages/CommitDetail.jsx`): Route `/:group/:project/-/commit/:sha`.
  - Header: Full commit message, author avatar + name + email + date, SHA (full, copyable)
  - Stats: "+X additions, -Y deletions" in green/red
  - File diff list: same simplified diff viewer as MR Changes tab

- [x] **Tags list** (`src/pages/Tags.jsx`): Route `/:group/:project/-/tags`. Simple list: tag name, commit SHA it points to, tagger, date. "Create tag" button.

- [x] **Releases list** (`src/pages/Releases.jsx`): Route `/:group/:project/-/releases`. Each release: tag name (h3), release title, description (markdown), created date, author. "New release" button.

---

## P2 — Secondary Features

- [x] **Todo list page** (`src/pages/Todos.jsx`): Route `/dashboard/todos`. List of pending todos: action icon, "UserX assigned/mentioned you on Issue #Y: title" with links, project path, relative time. "Mark as done" button per item. "Mark all as done" button at top. Tabs: "Pending" / "Done"

- [ ] **Activity feed**: On project overview page, show recent activity: push events, issue creation, MR merges, comments. Each event: user avatar, "UserX pushed to branch main", relative time. Show last 10 events.

- [ ] **Compare branches page**: Route `/:group/:project/-/compare`. Two branch selector dropdowns (source, target), "Compare" button. Shows: commit list between branches, file diff. Useful for creating MRs.

- [x] **User profile page** (`src/pages/UserProfile.jsx`): Route `/-/profile`. Shows: avatar (large, 96px), name, username, bio, location, organization, email, member since date. Activity tab showing recent contributions. Edit profile button → inline editable fields.

- [x] **New project page** (`src/pages/NewProject.jsx`): Route `/projects/new`. Form: project name, project slug (auto-generated), description, visibility radio (Private/Internal/Public), "Initialize with a README" checkbox, "Create project" button.

- [ ] **Keyboard shortcuts modal**: Press "?" anywhere to open modal overlay listing shortcuts: "/" focus search, "g i" go to issues, "g m" go to merge requests, "g p" go to pipelines, "n" new issue. Escape closes.

- [ ] **Notification preferences**: In user dropdown, a "Notification settings" option (can be no-op or simple toggle).

- [ ] **Responsive sidebar**: On small screens (<1024px), sidebar auto-collapses. Hamburger menu button in top bar toggles it. Sidebar overlays content when open on mobile.

- [ ] **Empty states**: When a project has no issues, show an empty state illustration placeholder with "No issues to display" message and "Create your first issue" CTA button. Same pattern for MRs, pipelines, wiki, etc.

---

## Data Seed (implement in createInitialData())

- [x] **Users**: 6 users (see data_model.md §2). Current user: Sofia Velasquez ("svelasquez"), with realistic avatars via pravatar.cc
- [x] **Groups**: 2 groups — "Acme Corp" (top-level) and "Frontend Team" (subgroup)
- [x] **Projects**: 4 projects — "web-platform" (main, TypeScript, most activity), "mobile-app" (Kotlin), "design-system" (CSS/TS), "docs-site" (Markdown, less active)
- [x] **Labels**: 12 labels for p1 (bug, feature, enhancement, documentation, critical, design, backend, frontend, devops, good first issue, blocked, needs review) with distinct colors, plus 5 for p2
- [x] **Milestones**: 3 for p1 (v2.0 Release active, v2.1 Hotfix active, v1.5 Release closed), 1 for p2
- [x] **Issues**: 15 for p1 (10 open, 5 closed), 6 for p2 (4 open, 2 closed), 3 for p3. Mix of bugs, features, enhancements. Varying labels, assignees, milestones. Some with due dates
- [x] **Issue Comments**: 25+ comments spread across issues. Include both user comments (markdown body) and system notes ("assigned to", "added label", "changed milestone"). 3-5 comments on most open issues
- [x] **Merge Requests**: 8 total — 3 open (1 draft), 3 merged, 1 closed, 1 with failing pipeline. Each with realistic source/target branches
- [x] **MR Comments**: 15+ comments on MRs, including code review feedback
- [x] **Pipelines**: 8 for p1 (3 passed, 2 failed, 1 running, 1 pending, 1 canceled), 2 for p2
- [x] **Jobs**: 3-5 jobs per pipeline (build, lint, test, deploy stages) with varied statuses. Include `logExcerpt` strings that look like real terminal output (10-20 lines each with `$` commands, stdout, timing info)
- [x] **Branches**: 6 for p1 (main, develop, feature/dashboard-refactor, feature/auth-module, fix/login-redirect, release/v2.0), 3 for p2, 2 for p3
- [x] **Commits**: 20+ for p1 on main branch (conventional commit messages: "feat:", "fix:", "docs:", "refactor:"), 5+ per feature branch, 10 for p2, 5 for p3
- [x] **Files**: Full directory structure for p1 (~20 files including package.json, tsconfig.json, src/ tree with components, pages, utils), simplified for other projects
- [x] **Wiki Pages**: 3 for p1 (Home, Getting Started, Architecture), 1 for p2
- [x] **Snippets**: 3 total (2 project, 1 personal) with real code content
- [x] **Members**: All 6 users as members of p1 (Owner, Maintainer, 3 Developers, 1 Reporter), 4 for p2
- [x] **Todos**: 5 pending todos for current user (assigned issue, mentioned in MR, approval required, etc.)
- [x] **Board + Lists**: 1 board for p1 with 5 lists: Open (backlog), Bug, Feature, Enhancement, Closed. Issues distributed across lists based on their labels
- [x] **Tags**: 3 for p1 (v1.0.0, v1.5.0, v2.0.0-rc1) pointing to specific commits
- [x] **Releases**: 2 for p1 (v1.0.0, v1.5.0) with descriptions and asset links

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login (app starts pre-logged-in as `svelasquez`)
- Real Git operations (clone, push, pull)
- Real CI/CD pipeline execution
- WebSocket real-time updates
- File uploads to real servers
- Email/notification sending
- Container registry, package registry
- Admin/instance-level settings
- SAML/SSO/OAuth configuration
- Advanced security features (SAST/DAST)
- Geo replication settings
- Kubernetes cluster management
