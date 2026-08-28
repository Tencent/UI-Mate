# XircleCI Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell
<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] Project scaffold: `npm create vite@latest circleci_mock -- --template react`, install deps: `react-router-dom`. Use plain CSS (no Tailwind).

- [x] **Visual design system**: XircleCI uses a dark sidebar + white content layout. Study `assets/screenshots/000003.jpg` closely. Exact color palette:
  - Sidebar bg: `#0D0E12` (near-black)
  - Sidebar text: `#A0A4AB` (muted), `#FFFFFF` (active)
  - Sidebar active item bg: `#1C1E26`
  - Sidebar hover: `#161820`
  - Main content bg: `#FFFFFF`
  - Content secondary bg: `#F7F7F8` (table header, cards)
  - Primary green (success, CTA): `#04AA51`
  - Running blue: `#1A73E8`
  - Failed red: `#F44336`
  - On-hold/queued amber: `#D4A017`
  - Needs approval purple: `#9C27B0`
  - Canceled gray: `#757575`
  - Text primary: `#24292F`
  - Text secondary: `#656D76`
  - Border: `#D1D5DA`
  - Link blue: `#0969DA`
  - Font: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Font sizes: 13px body, 14px nav items, 20px page titles, 11px badges/labels
  - Sidebar width: 220px, icon size: 18px, nav item padding: 8px 16px

- [x] **App layout**: Fixed left sidebar (220px wide, full viewport height, dark bg `#0D0E12`). Main content area fills remaining width with white bg. No top header bar — all navigation is in the sidebar. At top of sidebar: org name "XircleCI" with a small org avatar/icon and a dropdown chevron. Below that: nav items vertically stacked, each with icon + label. At bottom of sidebar: user avatar (small circle) + username.

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes:
  - `/` → redirect to `/pipelines`
  - `/pipelines` → Pipelines dashboard (default view)
  - `/pipelines/:pipelineId` → Pipeline detail (shows workflows for a pipeline)
  - `/pipelines/:pipelineId/workflows/:workflowId` → Workflow detail with DAG map
  - `/pipelines/:pipelineId/workflows/:workflowId/jobs/:jobId` → Job detail with output
  - `/projects` → Projects list
  - `/projects/:projectSlug/settings` → Project settings (tabs: overview, env vars, SSH keys, webhooks, advanced)
  - `/insights` → Insights dashboard
  - `/insights/:projectSlug/:workflowName` → Workflow insights drill-down
  - `/runners` → Runners page
  - `/deploys` → Deploys page
  - `/settings` → Organization settings
  - `/plan` → Plan/usage page
  - `/go` → State inspection endpoint

- [x] **State management**: React Context (`AppContext.jsx`) + `dataManager.js`. The `dataManager.js` exports `createInitialData()` (see `data_model.md` for full structure) and `getStorageKey()`. AppContext provides `state` and `dispatch` to all components. Reducer handles all CRUD actions. State persisted to localStorage keyed by session ID.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Returns JSON with `{ initial_state, current_state, state_diff }`. Computes deep diff between initial and current state. Displays raw JSON in `<pre>` tag. Also accessible via `GET /go?sid=` from the Vite dev server plugin.

- [x] **Session isolation**: `vite.config.js` mock-api plugin:
  - `POST /post?sid=<sid>` with `{"action":"set","state":{...}}` — sets both current + initial state
  - `POST /post?sid=<sid>` with `{"action":"set_current","state":{...}}` — updates only current state
  - `POST /post?sid=<sid>` with `{"action":"reset"}` — resets to initial state
  - `GET /go?sid=<sid>` → returns `{ initial_state, current_state, state_diff }`
  - `GET /state?sid=<sid>` → returns current state
  Session data stored in-memory on the server plugin, keyed by `sid`.

---

## P1 — Primary Features
<!-- Core features a user interacts with in the first 5 minutes. -->

- [x] **Sidebar navigation component**: Fixed left sidebar matching XircleCI's dark theme (see screenshots). Top section: org avatar (green circle with "A" letter) + "Acme Corp" org name + dropdown chevron for org switcher (visual only). Nav items below, each with an SVG icon and label: Home, Pipelines (default active), Projects, Deploys, Insights, Runners, Settings, Plan. Active item has white text + `#1C1E26` bg + 3px green left border accent. Hover state: `#161820` bg. Bottom of sidebar: current user's circular avatar (32px) + name "Alex Johnson". Clicking a nav item navigates to the corresponding route and updates active state.

- [x] **Pipelines dashboard page** (`/pipelines`): The main view. Header shows "All Pipelines" title. Below: filter bar with 3 dropdowns — (1) "Everyone's Pipelines" / "My Pipelines" toggle, (2) project filter dropdown (lists all project names, "All Projects" default), (3) branch filter dropdown ("All Branches" default, lists branches from selected project's pipelines). Below filters: pipeline list. Each pipeline row is a card/row showing:
  - Left: project name (green text, clickable → project pipelines filter) + pipeline number (muted, e.g., "#1847")
  - Center: status badge (colored pill: green "Success", blue "Running" with spinning icon, red "Failed", amber "Queued", purple "Needs Approval") + workflow name (clickable → workflow detail)
  - Right: trigger info — branch name in a rounded label, commit message (truncated 50 chars), committer avatar + name, relative timestamp ("2 min ago")
  - Far right: quick action buttons — "Rerun" (circular arrow icon), "Cancel" (X icon, only for running)
  Clicking a pipeline row expands it or navigates to pipeline detail showing all workflows. Pipelines sorted by most recent first.

- [x] **Pipeline detail page** (`/pipelines/:pipelineId`): Shows all workflows for a specific pipeline. Breadcrumb at top: "Pipelines" > "project-name #1847". Pipeline metadata: branch, commit hash (short SHA with copy button), commit message, trigger type, triggered by user, timestamp. Below: list of workflows in this pipeline, each showing: workflow name, status badge, duration, credit usage. Click workflow → workflow detail page. "Rerun from failed" and "Rerun" buttons at top right.

- [x] **Workflow detail page** (`/pipelines/:pipelineId/workflows/:workflowId`): Breadcrumb: "Pipelines" > "project #1847" > "build-test-deploy". Top section: workflow status badge + name + duration + "Rerun" / "Cancel" buttons. Main content: **Workflow map (DAG visualization)**. Render jobs as rounded-rectangle nodes (120px × 50px) arranged left-to-right. Each node shows: job name (truncated), status icon (✓ green / ✗ red / ● blue spinning / ◷ amber / ⏸ gray). Nodes connected by directional arrows based on `job.dependencies[]`. Fan-out: one job connects to multiple downstream. Fan-in: multiple jobs connect to one downstream. Use CSS flexbox or SVG for layout — arrange in columns by dependency depth. Below the map: jobs table with columns — Job Name, Type, Status, Duration, Credits. Clicking a job name → job detail page. Approval-type jobs show an "Approve" button (dispatches action to change job status to "success" and unblock dependent jobs).

- [x] **Job detail page** (`/pipelines/:pipelineId/workflows/:workflowId/jobs/:jobId`): Breadcrumb: "Pipelines" > "project #1847" > "build-test-deploy" > "unit-test". Header: job name, status badge, duration, executor info (e.g., "docker / medium"), job number. **Tab bar** with 4 tabs:
  1. **Steps** (default): List of collapsible step panels. Each step header shows: step name (e.g., "Spin up environment", "Checkout code", "run: npm test"), status icon, duration. Clicking expands to show terminal-style output — dark background (`#1E1E1E`), monospace font (`"JetBrains Mono", "Fira Code", monospace`), green/white text, line numbers on left. Output lines from `step.output[]`. Failed steps auto-expanded with red left border. Include "Search" input at top of output area to filter lines.
  2. **Tests**: Shows test results for this job. If `testResults` exist for this job: summary bar (X passed, Y failed, Z skipped), then list of test suites. Each suite: name, pass/fail/skip counts. Failed tests expandable to show failure message + stack trace in red text. If no test results: "No test results found" message.
  3. **Artifacts**: If artifacts exist for this job: file tree or flat list showing file path, size (formatted KB/MB). Each artifact has a "Download" link (visual only). If none: "No artifacts" message.
  4. **Timing**: Visual bar chart showing step durations stacked horizontally (Gantt-style). Each bar labeled with step name and duration. Total duration at top.
  "Rerun" button in header to rerun this specific job.

- [x] **Projects page** (`/projects`): Header "Projects" + search input to filter by name. Project cards/rows showing: VCS provider icon (GitHub octocat / GitLab fox / Bitbucket), project name (bold, clickable), repository URL (muted), default branch, last build status badge, last build time. Each project has a "Follow/Unfollow" toggle button (star icon or similar). Clicking project name filters pipelines to that project. "Set Up Project" button (visual only) for unfollowed projects. Gear icon links to project settings.

- [x] **Insights dashboard** (`/insights`): Header "Insights". **Time range selector**: buttons for "24 hours", "7 days", "30 days", "60 days", "90 days" — defaults to "30 days". **Summary cards** (4 cards in a row):
  1. Workflow Runs: large number (e.g., "1,247"), trend arrow (↑ or ↓ + percentage vs prior period)
  2. Total Duration: formatted (e.g., "96h 0m"), trend
  3. Success Rate: percentage with colored indicator (green if > 90%, amber if 70-90%, red if < 70%), trend
  4. Credits Used: number, trend
  Below: **Workflow metrics table** with columns — Workflow Name, Project, Runs, Success Rate (with mini bar), P50 Duration, P95 Duration, Total Credits. Rows clickable → drill-down. Sort by clicking column headers.

- [x] **Project Settings page** (`/projects/:projectSlug/settings`): Left sidebar with tab list: Overview, Environment Variables, SSH Keys, Webhooks, Advanced. **Overview tab**: project name, slug, VCS URL, "Stop Building" button (visual). **Environment Variables tab**: table showing Name and "xxxx...xxxx" masked value and created date. "Add Environment Variable" button opens a modal with Name + Value inputs. "Delete" (X) button per row with confirmation. **SSH Keys tab**: "Deploy Keys" section + "Additional SSH Keys" section, each showing fingerprint + hostname + delete button. "Add SSH Key" button. **Webhooks tab**: list of webhooks showing name, URL (truncated), events, edit/delete. **Advanced tab**: toggle switches for: "Build forked pull requests", "Pass secrets to builds from forked PRs", "Only build pull requests", "Auto-cancel redundant workflows".

- [x] **Pipeline rerun & cancel actions**: On pipeline row quick actions and on workflow/pipeline detail pages:
  - "Rerun" button: creates a new pipeline entry in state with same project/branch/commit but new ID and timestamp, status "running", generates new workflow entries copying the original workflow structure. Dispatch `RERUN_PIPELINE` action.
  - "Rerun from failed": same as rerun but only re-creates failed jobs, keeps successful jobs as-is.
  - "Cancel": changes running workflow/job statuses to "canceled". Dispatch `CANCEL_WORKFLOW` action.

- [x] **Manual approval step**: Approval-type jobs render differently in the workflow map — shown as a special node with a pause icon and "Approve" / "Deny" buttons. When a workflow has an approval job with status "on_hold", dependent jobs show as "blocked". Clicking "Approve" dispatches `APPROVE_JOB` action: sets approval job to "success", sets blocked downstream jobs to "queued" then "running" → simulate progression to "success" after a delay. Clicking "Deny" sets the approval job to "failed" and the workflow to "failed".

- [x] **Search functionality**: Search input in the sidebar (below org name). Searches across: project names, pipeline numbers, branch names. Dropdown results panel shows matching items grouped by type (Projects, Pipelines). Clicking a result navigates to the relevant page. Debounced input (300ms).

---

## P2 — Secondary Features
<!-- Depth and realism, implement after P1 is complete. -->

- [ ] **Insights drill-down page** (`/insights/:projectSlug/:workflowName`): Breadcrumb "Insights > project > workflow". Time range selector same as main Insights. Two charts (can use simple CSS/SVG bar charts or line indicators):
  1. **Duration over time**: horizontal bars per day showing P50 + P95 duration
  2. **Success rate over time**: green/red stacked bars per day (success vs failure count)
  Below: **Jobs tab** — table of jobs within this workflow: Job Name, Runs, Success Rate, P95 Duration, Credits. Clickable for further drill-down.

- [ ] **Organization settings page** (`/settings`): Tab sidebar: Overview, Members, Contexts, Security, VCS. **Overview tab**: org name, org ID, org slug (read-only display). **Members tab**: list of members showing avatar, name, email, role (admin/member), "Remove" button. No "Invite" (auth-related, skip). **Contexts tab**: list of contexts showing name, created date. Click → context detail showing env var list (name + masked value). "Create Context" button with name input. "Add Environment Variable" within context. "Delete Context" with confirmation. **Security tab**: static display of security settings. **VCS tab**: show connected VCS providers (GitHub/GitLab logos).

- [ ] **Runners page** (`/runners`): Header "Self-Hosted Runners". Two sections: (1) **Resource Classes** — table showing class name (e.g., "acme-corp/my-runner"), description, runner count. "Create Resource Class" button (modal form). (2) **Runner Instances** — table per resource class showing: runner name, version, platform (Linux/macOS/Windows), status (online/offline), IP address, last contact time. All data is mock/static.

- [ ] **Deploys page** (`/deploys`): Header "Deploys". Shows deployment environments: Production, Staging, Development. Each environment card shows: environment name, last deployment status, last deployed version/commit, deployment time, "View details" link. Clicking shows deployment history list. All mock/static data.

- [ ] **Plan/Usage page** (`/plan`): Header "Plan & Usage". Shows: current plan name ("Performance"), credit balance, network/storage usage bars. Credit usage breakdown by project (bar chart or table). Monthly trend. "Upgrade Plan" button (visual only).

- [ ] **Breadcrumb navigation**: Consistent breadcrumb component across all detail pages. Pattern: `Pipelines > project-name #1847 > workflow-name > job-name`. Each segment is a clickable link navigating back to that level. Separator: ">" or "/". Style: small muted text, active (last) segment is bold.

- [ ] **Real-time status simulation**: For "running" pipelines/workflows/jobs, simulate progress:
  - Running jobs increment duration every second (via `setInterval`)
  - After a random 15-60 second delay, running jobs transition to "success" or "failed"
  - When all jobs in a workflow complete, workflow status updates accordingly
  - Pulse animation on running status badges

- [ ] **Keyboard shortcuts**: `?` opens a shortcuts help modal listing available shortcuts. `R` reruns the current workflow/pipeline when on a detail page. `/` focuses the search input. `Esc` closes modals and dropdowns.

- [ ] **Config file viewer**: On pipeline detail page, add a "Configuration" tab that shows the pipeline's `.circleci/config.yml` content in a syntax-highlighted code viewer (use `<pre>` with monospace font). Show a mock YAML config relevant to the pipeline's workflows/jobs. Read-only.

---

## Data Seed (implement in createInitialData())
<!-- Dev must create realistic seed data matching these specs. -->

- [x] **Organization**: 1 org — "Acme Corp", slug "acme-corp", performance plan
- [x] **Users**: 4 users — alexj (Alex Johnson, admin, current user), sarahm (Sarah Martinez, member), mikec (Mike Chen, member), lisap (Lisa Park, member)
- [x] **Projects**: 4 projects:
  1. `frontend-app` (GitHub, active, followed, last build success)
  2. `backend-api` (GitHub, active, followed, last build failed)
  3. `mobile-app` (GitLab, active, followed, last build running)
  4. `infrastructure` (Bitbucket, less active, not followed)
- [x] **Pipelines**: 15 pipelines across all projects, various branches (main, develop, feature/new-dashboard, fix/auth-bug, release/v2.1). Cover all states: 3 successful, 2 failed, 2 running, 1 queued, 1 needs-approval, and others. Various trigger types and committers.
- [x] **Workflows**: 20 workflows, 1-3 per pipeline. Names: "build-test-deploy", "lint", "nightly-tests", "deploy-staging", "deploy-production". Cover all statuses.
- [x] **Jobs**: 70+ jobs with realistic DAG structures. Include:
  - Simple linear: checkout → install → lint → test → build
  - Fan-out: build → [test-unit, test-e2e, test-integration]
  - Fan-in: [test-unit, test-e2e, test-integration] → deploy-staging
  - Approval: deploy-staging → hold-for-approval → deploy-production
  - Each job with 3-8 steps with realistic output lines (npm install output, test runner output, build output, deploy output)
- [x] **TestResults**: 10 test result entries. Include: all-passing suite (24/24), mostly passing with 1 failure (23/24), suite with skipped tests (18 passed, 0 failed, 3 skipped)
- [x] **Artifacts**: 8 artifacts across jobs: coverage/lcov-report/index.html, build/app.js, build/app.css, screenshots/homepage.png, test-results/junit.xml
- [x] **Contexts**: 2 — "production-secrets" (3 env vars), "staging-secrets" (2 env vars)
- [x] **Environment Variables**: 8 across projects — NPM_TOKEN, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, DATABASE_URL, SENTRY_DSN, DOCKER_HUB_TOKEN, SLACK_WEBHOOK_URL, DEPLOY_KEY
- [x] **SSH Keys**: 3 — deploy keys for frontend-app and backend-api, additional key for infrastructure
- [x] **Webhooks**: 2 — "Slack Notification" (workflow-completed), "PagerDuty Alert" (job-completed, failed only)
- [x] **Insights data**: Pre-computed for 30 days. Daily data points with realistic patterns: weekdays have 40-60 runs, weekends have 5-15. Success rate fluctuates 82-95%. Duration varies 2-8 min. Per-workflow metrics for the 5 workflow types. Trend indicators comparing current 30d to prior 30d.

---

## Reducer Actions (implement in AppContext)

The reducer must handle these actions at minimum:

- `SET_STATE` — bulk state replacement (for session API)
- `RERUN_PIPELINE` — creates new pipeline+workflows+jobs copying structure, sets status to running
- `RERUN_WORKFLOW` — similar but for single workflow
- `CANCEL_WORKFLOW` — sets running workflow/jobs to canceled
- `APPROVE_JOB` — sets approval job to success, unblocks downstream jobs
- `DENY_JOB` — sets approval job to failed, fails workflow
- `FOLLOW_PROJECT` / `UNFOLLOW_PROJECT` — toggles project.isFollowed
- `ADD_ENV_VAR` — adds env var to project
- `DELETE_ENV_VAR` — removes env var from project
- `ADD_SSH_KEY` / `DELETE_SSH_KEY` — manage SSH keys
- `ADD_WEBHOOK` / `UPDATE_WEBHOOK` / `DELETE_WEBHOOK` — manage webhooks
- `UPDATE_PROJECT_SETTINGS` — toggle advanced settings
- `ADD_CONTEXT` / `DELETE_CONTEXT` — manage contexts
- `ADD_CONTEXT_ENV_VAR` / `DELETE_CONTEXT_ENV_VAR` — manage context env vars
- `SET_INSIGHTS_TIME_RANGE` — update insights time range filter
- `SET_PIPELINE_FILTER` — update pipeline list filters (project, branch, ownership)

---

## Out of Scope
<!-- Dev must NOT implement these. -->

- Authentication / login (app starts pre-logged-in as `Alex Johnson` / `alexj`)
- Real VCS integration (GitHub/GitLab/Bitbucket OAuth)
- Real build execution or Docker container management
- Real-time WebSocket connections
- Credit card / payment / billing
- SSH debugging into running containers
- Real artifact file downloads (links are visual only)
- Email notifications
- SAML/SSO configuration
- Orb registry browsing (complex, out of scope for mock)
