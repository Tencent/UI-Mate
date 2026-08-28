# XitHub Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-02-28
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell
<!-- Without these, the app cannot render. Dev implements these first. -->
<!-- NOTE: Most P0 items are already implemented. Items marked [x] need no changes. -->

- [x] Project scaffold: Vite + React with Tailwind CSS, all deps installed
- [x] **Visual design system**: XitHub dark theme via Tailwind config — primary `#0d1117` bg, `#161b22` card, `#30363d` border, `#c9d1d9` text, `#8b949e` muted, `#58a6ff` accent, `#238636` success, `#da3633` danger, `#010409` header. Font: `-apple-system, BlinkMacSystemFont, "Segoe UI"...`. Study `assets/screenshots/000002.jpg` for the real XitHub repo page layout.
- [x] App layout: Sticky header (~60px) + full-width main content area. No persistent sidebar (sidebar is per-page).
- [x] Routing: `main.jsx` with `createBrowserRouter` — `/` (Dashboard), `/:username/:repoName` (RepoLayout with nested routes for code/issues/pulls/actions/projects/wiki/security/settings), `/go` (GoDebug)
- [x] State management: React Context + useReducer in `src/lib/store.jsx`, data in `src/lib/mockData.js` with `INITIAL_STATE`, session-aware storage, array normalizers
- [x] `/go` endpoint: `src/pages/GoDebug.jsx` with deep diff computation, session ID tracking, metadata
- [x] Session isolation: `vite.config.js` mock-api plugin with `POST /post?sid=`, `GET /state?sid=`, `GET /go?sid=` endpoints + `dataManager` session helpers

## P0 — Data Model Upgrade
<!-- Update INITIAL_STATE to match data_model.md for new features to work -->
- [x] **Upgrade INITIAL_STATE**: Replace current mock data in `src/lib/mockData.js` with the richer seed data from `assets/data_model.md` — 5 users (octocat, mojombo, defunkt, pjhyett, wycats), 3 repos (hello-world with 7 files + feature branches, spoon-knife demo repo, private-notes), realistic commit hashes (7-char hex like `a1b2c3d`), 5 issues with detailed Markdown descriptions and multiple comments, 2 PRs with reviewers/checks, 3 wiki pages, 5 action runs with branch/event info, 4 notifications, 9 labels with hex colors, 2 milestones. currentUser should be `octocat` (not `admin`).
- [x] **Add new entities to state**: Add `notifications`, `labels`, `milestones` arrays to `INITIAL_STATE`. Add corresponding normalizer functions (`normalizeNotification`, `normalizeLabel`, `normalizeMilestone`) following existing pattern in mockData.js. Register them in `arrayNormalizers` map.
- [x] **Add new reducer actions**: Add to store.jsx reducer: `ADD_NOTIFICATION`, `MARK_NOTIFICATION_READ`, `MARK_ALL_NOTIFICATIONS_READ`, `ADD_LABEL`, `DELETE_LABEL`, `ADD_MILESTONE`, `UPDATE_MILESTONE`, `ADD_REACTION` (for issues/comments), `REMOVE_REACTION`, `CREATE_REPO` (full repo creation with initial files/branches), `UPDATE_COMMENT`, `DELETE_COMMENT`. Each action must correctly update state immutably.
- [x] **Add `languages` field to repos**: Each repo needs a `languages` object (e.g., `{ "JavaScript": 55.2, "CSS": 22.1 }`) for the language statistics bar on the code page. Add `topics`, `license`, `homepage`, `watchers`, `createdAt`, `hasWiki`, `hasIssues`, `hasProjects` fields per data_model.md.
- [x] **Upgrade issue/PR data**: Add `reactions` object to issues and comments (see data_model.md §Issue). Add `milestone` field to issues and PRs. Add `checks` array to PRs. Add `isDraft` boolean to PRs. Add `additions`/`deletions` to commits.

## P1 — Primary Features (Enhancements to Existing)
<!-- These improve already-working features to match real XitHub more closely -->

- [x] **Repository About sidebar on Code tab**: On the CodeBrowser page, add a right sidebar (280px) showing: repo description (editable pencil icon), homepage link (clickable), topics as clickable pill badges (blue bg), "Releases" link, "Packages" link, license name with icon. Below that: a "Languages" section with a colored percentage bar (each language gets a colored segment proportional to its %) and a legend showing language name + percentage. Below that: star/fork/watcher counts with icons. The sidebar only appears on the code tab root (not in file view). See `assets/screenshots/000002.jpg` for reference — the real XitHub page shows this to the right of the file tree.

- [x] **Colored label badges**: Currently labels render as generic blue pills. Use the new `labels` entity in state to look up each label's `color` hex value. Render labels as rounded pills with the label's color as background (at 20% opacity) and the label color as text/border. Apply this everywhere labels appear: issue list, issue detail, PR list, PR detail, new issue form. If label not found in `labels` entity, fall back to default blue.

- [x] **Notifications panel with real data**: Replace the static "No unread notifications" in the header dropdown with a list of `state.notifications`. Each notification row shows: repo icon, notification title (linked to the relevant issue/PR), relative timestamp ("2 hours ago"), unread dot (blue circle) if `!isRead`. Add a "Mark all as read" button at the top that dispatches `MARK_ALL_NOTIFICATIONS_READ`. Clicking a notification dispatches `MARK_NOTIFICATION_READ` and navigates to the relevant issue/PR. Show badge count on bell icon for unread count.

- [x] **New Repository creation form**: When clicking "New repository" in the header "+" dropdown, navigate to a `/new` route. The form should have: Repository name input (validates uniqueness against existing repos), Description textarea, Public/Private radio buttons, "Initialize with README" checkbox, "Add .gitignore" dropdown (None, Node, Python, Java), "Choose a license" dropdown (None, MIT, Apache 2.0, GPL 3.0). On submit, dispatch `CREATE_REPO` which creates the repo + default branch + initial files (README.md if checked, .gitignore if selected, LICENSE if selected) and navigates to the new repo page.

- [x] **Issue reactions**: Below each issue description and each comment, show a row of emoji reaction buttons: 👍 👎 ❤️ 🚀 👀. Show count next to each emoji that has > 0 reactions. Clicking an emoji toggles the current user's reaction (dispatch `ADD_REACTION` or `REMOVE_REACTION`). Show a "+" button that reveals the reaction picker. Style: small rounded pills with emoji + count, gray border, slight bg on hover. Match XitHub's reaction bar style.

- [x] **PR merge strategy dropdown**: On the PR detail merge box, replace the single "Merge pull request" button with a split button: main button shows the selected strategy label, dropdown arrow reveals 3 options: "Create a merge commit" (default), "Squash and merge", "Rebase and merge". Each option shows a brief description. The selected strategy is stored in PR state as `mergeStrategy`. When merge button is clicked, dispatch `MERGE_PR` with the selected strategy.

- [x] **PR review submission form**: Add a "Review changes" button at the top of the PR file changes section (or in the comment area). Clicking it opens a form with: textarea for review body, 3 radio buttons: "Comment" (just comment), "Approve" (green checkmark), "Request changes" (red X). Submitting dispatches `ADD_PR_COMMENT` (with review metadata) and updates the reviewer's status in `pr.reviewers[]`. If the current user isn't already a reviewer, add them.

- [x] **PR checks/CI status in merge box**: In the PR merge box, above the merge button, show a list of `pr.checks[]`. Each check shows: status icon (green ✓ for success, red ✗ for failure, yellow ◷ for pending), check name, and detail text. If any check has `status: "failure"`, show a yellow warning: "Some checks were not successful". The merge button should still be clickable regardless.

- [x] **Comment edit/delete**: On each comment (issue comments and PR comments), if `comment.authorId === currentUser.id`, show a "..." menu button in the top-right corner of the comment header. The dropdown has "Edit" and "Delete" options. "Edit" replaces the comment content with a textarea pre-filled with the current content, with Save/Cancel buttons. "Delete" shows a confirmation and dispatches `DELETE_COMMENT`. Dispatch `UPDATE_COMMENT` for edits.

- [x] **New Issue sidebar actions**: On the NewIssue page, make the sidebar Assignees/Labels/Milestone sections interactive (currently static text). Each section has a gear icon that opens a dropdown selector matching the pattern used in IssueDetail (checkbox list of users/labels). Selected values should be included in the `ADD_ISSUE` payload when the form is submitted.

- [x] **Actions page from state data**: Replace hardcoded workflow data in `Actions.jsx` with data from `state.actions`. Filter by `repo.id`. Show workflow name, status icon (✓ green / ✗ red / ◷ yellow pulse), branch name, event type, duration, date, run number. Add a "Re-run" button (visual only — adds a new action entry with "running" status).

## P1 — New Pages/Views

- [x] **User profile page**: Add route `/profile/:username` (or just `/profile`). Shows: large avatar (96px), display name, username, bio, location, company, website link, join date. Below: "Popular repositories" section showing the user's repos sorted by stars (card grid, max 6). Below that: a contribution-graph placeholder (green squares grid, can be static/decorative). Header profile dropdown "Your profile" should link to `/profile/octocat`.

- [x] **Milestone management**: Add a "Milestones" tab/link on the Issues page (next to the New Issue button). Route: `/:owner/:repo/milestones`. Shows list of milestones with: title, description snippet, due date, progress bar (% of associated closed issues / total issues), open/closed issue counts. Click opens milestone detail showing filtered issues. "New milestone" button opens a form with title, due date, description. Issues list and new issue form should have a "Milestone" filter/selector.

## P2 — Secondary Features
<!-- Depth and realism, implement after P1 is complete. -->

- [x] **Discussions tab**: Add route `/:owner/:repo/discussions`. Tab shows in repo nav with speech-bubble icon. Page shows a list of discussion threads, each with: title, category badge (General, Q&A, Ideas, Show and tell), author, reply count, last activity date. "New discussion" button opens a form. Discussion detail page shows original post + replies. Add `discussions` to state with entity: `{ id, repoId, title, body, category, authorId, replies: [], createdAt }`. Reducer actions: `ADD_DISCUSSION`, `ADD_DISCUSSION_REPLY`.

- [x] **Keyboard navigation shortcuts**: Implement XitHub's `G` key navigation: press `G` then `C` navigates to Code tab, `G` then `I` to Issues, `G` then `P` to Pull Requests, `G` then `A` to Actions, `G` then `W` to Wiki. Use a two-key sequence detector (500ms timeout between keys). Only active when not focused in an input/textarea. Show a small toast "Go to: Issues" when triggered.

- [x] **Command palette**: `Ctrl+K` (or `Cmd+K` on Mac) opens a centered modal dialog with a search input at the top. As user types, show filtered results: repos, issues, PRs, pages (Settings, Wiki, Actions). Each result row shows icon + title + path. Arrow keys to navigate, Enter to select, Esc to close. Similar to XitHub's real command palette.

- [x] **Branch management page**: Add route `/:owner/:repo/branches`. Shows all branches for the repo: branch name, last commit message, relative date, ahead/behind count vs default branch (can be static), "Delete" button (with confirmation, dispatches action to remove branch from state). "New branch" button: input for name, select base branch, creates entry in `state.branches`.

- [x] **Releases page**: Add route `/:owner/:repo/releases`. Shows list of releases with: tag name (e.g., "v2.0.0"), release title, Markdown body, author, date, asset download buttons (visual only). "Draft a new release" form: tag input, target branch selector, release title, Markdown body. Add `releases` entity to state.

- [x] **Inline file editing**: On the file viewer (CodeBrowser), add an "Edit" pencil icon button in the file header toolbar (next to Raw and Download). Clicking it replaces the syntax-highlighted view with a `<textarea>` pre-filled with the file content. Below: commit message input (default: "Update {filename}"), "Commit changes" button that dispatches an action to update `state.files` content and adds a new commit to `state.commits`.

- [x] **Issue/PR cross-reference linking**: In issue and PR descriptions and comments, auto-detect `#N` patterns and render them as links to `/:owner/:repo/issues/N` (or `/pulls/N`). Also detect `@username` mentions and link to profile. Use a simple regex replacement when rendering Markdown content.

- [x] **Fork creates actual repo**: When clicking "Fork" on a repo, instead of just incrementing the fork count, create an actual new repo in state owned by `currentUser` with name `{repoName}` and a `forkedFrom: repoId` field. Copy all files and branches. Navigate to the new forked repo.

- [x] **Insights tab**: Add route `/:owner/:repo/insights`. Shows placeholder graphs: "Contributors" (bar chart of top contributors by commit count), "Commit activity" (line chart of commits per week, can be decorative SVG), "Code frequency" (additions vs deletions over time). Use simple inline SVG or CSS-based charts — no chart library needed.

- [x] **Pinned issues**: Add "Pin issue" option to the issue "..." menu (or sidebar). Pinned issues (`isPinned: true`) appear at the top of the issues list with a 📌 icon. Max 3 pinned issues per repo. Dispatches `UPDATE_ISSUE` with `isPinned: true/false`.

- [x] **Draft PRs**: Add a checkbox "Create as draft" on the new PR form. Draft PRs show a gray "Draft" badge instead of green "Open". The merge box shows "This pull request is still a work in progress" with a "Ready for review" button that changes `isDraft` to false.

- [x] **Code search within repo**: Add a search input on the Code tab that searches file contents and file paths within the current repo. Results show file path, matching line with highlighted query, line number. Clicking navigates to the file.

- [x] **Contributors page**: Route `/:owner/:repo/graphs/contributors`. Shows a list of contributors derived from `state.commits` — group commits by `authorId`, show: avatar, username, total commits count, last commit date. Sorted by commit count descending.

## Data Seed (implement in createInitialData())
<!-- Dev must create realistic seed data matching these specs. -->
- [x] **Users**: 5 users with realistic XitHub-style usernames, avatars (use XitHub avatar URLs or generated avatars), bios. User `u1` = "octocat" is the logged-in user.
- [x] **Repositories**: 3 repos — 1 active public JS project with rich data (issues, PRs, wiki, actions), 1 popular demo/fork repo, 1 private personal repo. Each with realistic star/fork/watcher counts, topics, licenses, language breakdowns.
- [x] **Issues**: 5 issues across repos. Mix of open/closed, with varying labels (bug, enhancement, documentation, good first issue), assignees, milestones. At least 2 issues should have multiple comments with back-and-forth discussion. Include Markdown formatting (code blocks, links, lists) in descriptions.
- [x] **Pull Requests**: 2 PRs — 1 with mixed reviewer status (one approved, one changes_requested) and multiple comments and CI checks; 1 clean PR ready to merge. Both with branch info matching existing branches.
- [x] **Files**: 7+ files for main repo across folders (src/, root), providing realistic code browser experience with folders and nested navigation.
- [x] **Commits**: 8 commits across repos with realistic 7-char hex IDs, proper chronological ordering, addition/deletion counts.
- [x] **Wiki**: 3 pages (Home, Getting Started, API Reference) with substantive Markdown content including tables, code blocks, links.
- [x] **Actions**: 5 workflow runs with varying statuses (success, failure), branches, event types.
- [x] **Notifications**: 4 notifications — 2 unread, 2 read, different types (comment, review, mention, CI).
- [x] **Labels**: 9 labels with proper XitHub-style hex colors (#d73a4a for bug red, #a2eeef for enhancement teal, #0075ca for docs blue, #7057ff for good-first-issue purple, etc.).
- [x] **Milestones**: 2 milestones — 1 open with future due date, 1 closed.

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login / signup (app starts pre-logged-in as `octocat`)
- Real Git operations (clone, push, pull, diff computation)
- File uploads to real servers
- Email/SMS notifications
- OAuth, SSO, or any identity verification
- XitHub Copilot / AI features
- XitHub Pages deployment
- XitHub Codespaces
- XitHub Packages registry
- Billing / payment
- Organization management (keep it single-user focused)
- Real network API calls (all data is in-memory/localStorage)
