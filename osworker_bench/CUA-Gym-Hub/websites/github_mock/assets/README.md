# XitHub Mock — Research Summary

> Last updated: 2026-02-28
> Real website: https://github.com

## App Overview

XitHub is the world's largest code hosting and collaboration platform for software developers. Founded in 2008 and now owned by Microsoft, it hosts over 200 million repositories and is used by 100+ million developers. The platform provides Git-based version control, issue tracking, pull request code review, CI/CD automation (XitHub Actions), project management, wikis, and community features.

**Category**: Developer productivity / Code collaboration platform
**Core interaction model**: Repository-centric — all features (issues, PRs, code, wiki, settings) are scoped under `/:owner/:repo`

## Key User Personas

### 1. Open Source Contributor
- **Primary workflows**: Browse repos → Fork → Create branch → Make changes → Open PR → Respond to reviews
- **Key interactions**: Star/Watch repos, open issues, comment on PRs, review code diffs

### 2. Project Maintainer
- **Primary workflows**: Triage issues → Assign labels/milestones → Review PRs → Merge → Manage releases
- **Key interactions**: Label management, PR review (approve/request changes), merge strategies, project board management

### 3. Team Developer
- **Primary workflows**: View dashboard → Check assigned issues → Create branches → Push code → Open PRs → CI checks
- **Key interactions**: Notifications, issue assignment, code review, branch management

## Visual Design (Dark Theme)

XitHub uses a dark theme ("XitHub Dark") as one of its primary themes. The mock should use this dark theme exclusively.

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0d1117` | Page background |
| `card` / `canvas-subtle` | `#161b22` | Card backgrounds, table headers |
| `border` | `#30363d` | All borders |
| `text` | `#c9d1d9` | Primary text |
| `muted` | `#8b949e` | Secondary/muted text |
| `accent` / link | `#58a6ff` | Links, active states |
| `success` | `#238636` | Green buttons, open issues |
| `danger` | `#da3633` | Delete buttons, error states |
| `header` | `#010409` | Top navigation bar background |
| `merged` | `#8957e5` | Merged PR badge (purple) |
| `closed-issue` | `#8957e5` | Closed issue icon (purple) |
| `warning` | `#d29922` | Warning states, pending reviews |

### Typography
- **Font family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif`
- **Font sizes**: 12px (xs), 14px (sm/body), 16px (md), 20px (lg), 24px (xl), 32px (2xl)
- **Weights**: 400 (normal), 600 (semibold), 700 (bold)
- **Monospace**: `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`

### Spacing Scale
- Base unit: 4px
- Common: 4, 8, 12, 16, 24, 32, 48px

## Complete Feature List

### P0 — Core Shell (App renders)
- [x] Vite + React project scaffold with Tailwind CSS
- [x] XitHub dark theme color system
- [x] Global header: XitHub logo, search bar, nav links (Pull requests, Issues, Codespaces, Marketplace, Explore), notifications bell, create (+) dropdown, profile avatar dropdown
- [x] Routing: `/` (Dashboard), `/:owner/:repo` (Repo Code), `/:owner/:repo/issues`, `/:owner/:repo/pulls`, etc.
- [x] State management: React Context + useReducer
- [x] `/go` endpoint: GoDebug component with deep diff
- [x] Session isolation: vite.config.js mock-api plugin with POST/GET endpoints
- [x] Data normalization for POST API resilience

### P1 — Primary Features (Core interactive workflows)
- [x] **Dashboard**: Left sidebar (Top Repositories list), main feed (All Repositories cards with star button, language badge, updated date)
- [x] **Repository page**: Owner/repo breadcrumb, Public/Private badge, Watch/Fork/Star buttons with counts, tab navigation (Code, Issues, PRs, Actions, Projects, Wiki, Security, Settings) with active indicator and counts
- [x] **Code browser**: Branch selector dropdown with search, file tree with folders/files, last commit info bar, README.md rendering (Markdown), file viewer with syntax highlighting and line numbers, Raw view toggle, Download button, Code dropdown with clone URL
- [x] **Issues list**: Open/Closed filter with counts, search bar, Label filter dropdown, Sort dropdown (newest/oldest/most-commented/least-commented), issue rows with status icon (green circle=open, purple check=closed), title link, labels, author, date, comment count
- [x] **Issue detail**: Title with #number, Open/Closed badge, author info, description with Markdown rendering, comment thread (avatar + author + date + content), Write/Preview tabs for new comment, Close/Reopen button, sidebar (Assignees selector, Labels selector)
- [x] **New issue form**: Title input, description textarea, submit button, sidebar placeholders
- [x] **Pull Requests list**: Open/Closed filter with counts, PR rows with status icon (green=open, purple=merged, red=closed), title, review status badge, author, date
- [x] **PR detail**: Title with #number, status badge, branch info (base ← compare), description with Markdown, comment thread, merge box (green "Merge pull request" button when open, purple "merged" banner after merge), Close/Reopen button, sidebar (Reviewers selector with status icons, Assignees selector), static file diff view
- [x] **New PR form**: Branch selection (base ← compare), title, description, submit
- [x] **Commits list**: Sorted by date, commit message link, author avatar+name, date, short SHA with copy button
- [x] **Commit detail**: Commit message header, author info, mock diff view with line numbers and green/red highlighting
- [x] **Project Board**: 3-column Kanban (To Do, In Progress, Done), drag-and-drop, add item inline form, column menu, issue cards with status icon and number
- [x] **Wiki**: Page list sidebar, create new page, edit existing page, Markdown rendering
- [x] **Actions page**: Workflow list with status icons (success=green check, failed=red X, running=yellow clock)
- [x] **Security page**: Static overview with Dependabot and Code scanning alert counts
- [x] **Settings**: Sidebar nav (General, Collaborators, Webhooks, Pages), General tab (repo name, description, private toggle, save, Danger Zone delete with confirmation)
- [x] **Search**: Global search in header searching repos/issues/users with categorized dropdown results
- [x] **Keyboard shortcut**: "/" focuses search bar

### P1 — Missing Features (Need Implementation)
- [ ] **Repository About sidebar**: Right sidebar on Code tab showing description, homepage link, topics, license info, star/watcher/fork counts, languages breakdown
- [ ] **Language statistics bar**: Colored bar below About section showing % of each language
- [ ] **Notifications**: Actual notification items (e.g., "you were mentioned in issue #1", "PR #3 was merged") instead of static "no unread" message
- [ ] **New Repository creation form**: Full form accessible from "+" menu with repo name, description, visibility, README init, .gitignore template
- [ ] **PR review submission**: Form to approve/request changes/leave review comment (not just toggle reviewer in sidebar)
- [ ] **PR merge strategy**: Dropdown to choose merge commit / squash / rebase before merging
- [ ] **Issue/PR reactions**: Thumbs up/down, heart, rocket, eyes emoji reactions on issues and comments
- [ ] **Comment editing/deletion**: Edit or delete your own comments
- [ ] **Milestone management**: Create/edit milestones, assign issues to milestones, filter by milestone
- [ ] **New Issue sidebar actions**: Working assignee/label selectors on new issue creation form (currently static text)

### P2 — Secondary Features (Depth/realism)
- [ ] **Discussions tab**: Question/answer and general discussion threads
- [ ] **User profile page**: Avatar, bio, pinned repos, contribution graph
- [ ] **Repository insights tab**: Contributors graph, commit frequency, code frequency
- [ ] **Branch management**: Create new branch, delete branch, compare branches
- [ ] **Releases page**: Create release, list releases with tag, changelog
- [ ] **File editing**: Edit file content inline in code browser
- [ ] **Issue/PR cross-references**: `#1` in comments links to issues/PRs
- [ ] **Keyboard navigation shortcuts**: G+C (Code), G+I (Issues), G+P (PRs), G+A (Actions), G+W (Wiki)
- [ ] **Command palette**: Ctrl+K to open search/command dialog
- [ ] **Pinned issues**: Pin important issues to top of list
- [ ] **Draft PRs**: Create PR as draft, mark as ready for review
- [ ] **PR checks/CI status**: Show CI check results in merge box
- [ ] **Code search within repo**: Search file contents
- [ ] **Blame view**: Show line-by-line blame annotations
- [ ] **Contributors page**: List all contributors with commit counts
- [ ] **Activity feed**: Dashboard shows recent activity (pushes, PRs, issues) from followed users/repos
- [ ] **Fork creates actual repo**: Fork button creates a copy repo in state owned by currentUser

## UI Layout Descriptions

### Global Header (sticky, ~60px height)
```
[XitHub Logo] [Search "Search or jump to..." /] [Pull requests] [Issues] [Codespaces] [Marketplace] [Explore]  ...  [Bell+dot] [+▼] [Avatar▼]
```
- Background: `#010409`
- Height: ~60px
- Search bar: `#0d1117` bg with `#30363d` border, 288px width, "/" key indicator on right

### Dashboard (`/`)
```
| Left Sidebar (25%)        | Main Content (75%)                    |
| Top Repositories          | Home                                  |
|   repo-link               | [Discover interesting projects card]  |
|   repo-link               |                                       |
| [Show more]               | All Repositories                      |
| ─────────────             |   [Repo card: name, desc, lang, ★]   |
| Recent activity           |   [Repo card]                         |
|   [empty state]           |   [Repo card]                         |
```

### Repository Page (`/:owner/:repo`)
```
| repo-icon owner / repo-name [Public] ........... [Watch▼ N] [Fork▼ N] [★ Star N] |
| [Code] [Issues N] [Pull requests N] [Actions] [Projects] [Wiki] [Security] [Settings] |
├─────────────────────────────────────────────────────────────────────────────────────────┤
| (Tab content: CodeBrowser / Issues / PRs / etc.)                                       |
```
- Tab bar has orange-red bottom border on active tab (`#fd8c73`)
- Tab counts shown in gray pill badges

### Code Browser (repo index)
```
| [branch▼ main] owner / repo-name / path .............. [Code▼] |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ avatar author  "commit message"  ...... sha  date  N commits│ |
| ├──────────────────────────────────────────────────────────────┤ |
| │ 📁 src           Folder update              2 days ago       │ |
| │ 📄 package.json  Initial commit              3 days ago       │ |
| │ 📄 README.md     Update readme               1 day ago        │ |
| └──────────────────────────────────────────────────────────────┘ |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ 📖 README.md                                                 │ |
| │ rendered markdown content...                                  │ |
| └──────────────────────────────────────────────────────────────┘ |
```

### Issue Detail (`/:owner/:repo/issues/:number`)
```
| Title #number ............................ [Edit] |
| ● Open  author opened ... · N comments          |
| ──────────────────────────────────────────────── |
| avatar │ author      commented on date    │ side │
|        │ markdown body                    │ bar  │
|        │                                  │──────│
| avatar │ commenter   commented on date    │Assig.│
|        │ comment content                  │Labels│
|        │                                  │      │
| avatar │ [Write] [Preview]               │      │
|        │ textarea                         │      │
|        │ [Close issue] [Comment]          │      │
```

## Data Model Overview

See `assets/data_model.md` for full entity definitions.

**Core entities**: User, Repository, Branch, File, Commit, Issue, PullRequest, Comment, WikiPage, Action, Notification, Label, Milestone

**Key relationships**:
- Repository → owned by User (via `ownerId`)
- Issue/PR → belongs to Repository (via `repoId`)
- Issue/PR → authored by User (via `authorId`)
- Issue/PR → has many Comments
- Issue → has many Labels (string array)
- Issue → has many Assignees (userId array)
- PR → has many Reviewers (with approval status)
- File/Branch/Commit → belongs to Repository

## What to Skip (Out of Scope)
- **Authentication**: App starts pre-logged-in as "admin" user
- **Real Git operations**: No actual git clone/push/pull
- **File uploads**: No real file upload to server
- **Email notifications**: No actual email sending
- **OAuth/SSO**: No identity providers
- **Billing**: No payment features
- **XitHub Copilot/AI**: No AI code suggestions
- **XitHub Pages deployment**: No actual site deployment
- **Codespaces**: No actual dev environments
- **XitHub Packages**: No package registry

## Reference Screenshots

Screenshots saved in `assets/screenshots/`:
- `000002.jpg` — XitHub repository page (facebook/react) showing: header nav, repo breadcrumb, Watch/Star/Fork buttons, tab bar (Code/Issues/PRs/Projects/Wiki/Security/Insights), description, topics, stats bar (commits/branches/releases/contributors/license), branch selector, file tree with commit messages and dates, language bar
- Additional screenshots in subdirectories for specific views

## Key Insights for Implementation

1. **Everything is repo-scoped**: Unlike Slack (workspace-scoped) or Gmail (user-scoped), XitHub's UI revolves around the `/:owner/:repo` path prefix. The repo tab bar is the primary navigation within a repo.

2. **Issues and PRs share numbering**: In real XitHub, issues and PRs share a single incrementing number per repo. The mock already implements this correctly.

3. **Dark theme consistency**: XitHub's dark theme is very consistent — `#0d1117` background, `#161b22` for elevated surfaces, `#30363d` for borders. The existing mock already uses these correctly via Tailwind config.

4. **Interaction density is high**: A single issue page has: title editing, comment adding, label toggling, assignee toggling, milestone setting, status toggling, reaction adding, markdown previewing — many interactive targets for agent training.

5. **State changes are observable**: The `/go` endpoint already provides deep diff — this is critical for RL training to measure if the agent successfully completed an action.
