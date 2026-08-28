# XircleCI Mock — Research Summary

## App Overview

**XircleCI** is a leading continuous integration and continuous delivery (CI/CD) platform. It automates the process of building, testing, and deploying code. Teams connect their source code repositories (GitHub, GitLab, Bitbucket) and XircleCI automatically runs pipelines on every commit, providing feedback on build status, test results, and deployment readiness.

**Real Website**: https://app.circleci.com
**Target users**: Software developers, DevOps engineers, platform engineers, engineering managers

## Key User Personas & Workflows

### Developer
1. Push code → view pipeline status → check if build/tests passed
2. Click into a failed job → read output logs → identify failure cause
3. Re-run a failed workflow or individual job
4. Approve a manual approval step in a deployment workflow
5. View test results and artifacts from a build

### Engineering Manager
1. View Insights dashboard → check overall success rates and build durations
2. Monitor credit usage across projects
3. Review project health metrics
4. Track MTTR (Mean Time to Recovery)

### Platform Engineer
1. Configure project settings (env vars, SSH keys)
2. Manage organization contexts (shared secrets)
3. Set up self-hosted runners
4. Configure webhooks

---

## UI Layout Description

### Global Shell
- **Dark sidebar** (left, ~220px): Contains org switcher at top, then nav items with icons
- **Main content area** (right): White/light gray background, full width minus sidebar
- **No top header bar** — navigation is entirely in the left sidebar

### Sidebar Navigation Items (from screenshot 000003.jpg)
1. **Home** (house icon) — Org overview dashboard
2. **Pipelines** (play-circle icon) — Main pipelines dashboard (default view)
3. **Projects** (folder icon) — List of all projects
4. **Deploys** (rocket icon) — Deployment environments
5. **Insights** (bar-chart icon) — Analytics dashboard
6. **Runners** (server icon) — Self-hosted runner management
7. **Settings** (gear icon) — Organization settings
8. **Plan** (credit-card icon) — Usage and billing

At the top of the sidebar: Organization name with dropdown switcher.

### Pipelines Page (Primary View)
- **Header**: "All Pipelines" title
- **Filters bar**: "Everyone's Pipelines" dropdown, project-name dropdown, branch filter (e.g., "Main")
- **Pipeline table/list**: Each row shows:
  - Project name (colored text, clickable)
  - Pipeline number (e.g., #184770)
  - Status badge (Running/Success/Failed/Queued/Needs Approval — color-coded)
  - Workflow name
  - Trigger event info (commit message snippet)
  - Branch name
  - Relative timestamp
  - Quick actions (rerun, cancel) on right side

### Workflow Detail View
- **Breadcrumb**: Project > Pipeline # > Workflow name
- **Workflow map**: Visual DAG (directed acyclic graph) showing jobs as nodes connected by arrows
  - Each node shows: job name, status icon, duration
  - Node colors: green (success), red (failed), gray (not run), yellow (running), orange (on hold)
- **Jobs list** below the map: Table with columns — Job Name, Status, Duration, Credits
- **Rerun/Cancel buttons** at top right

### Job Detail View
- **Tabs**: Steps (output), Tests, Artifacts, Timing, Usage
- **Steps tab** (default): Collapsible list of step names, each expandable to show terminal-style output
  - Dark background terminal output area
  - Line numbers
  - Search functionality within output
  - Timestamps per line
- **Tests tab**: List of test suites with pass/fail counts
- **Artifacts tab**: File tree of uploaded artifacts with download links
- **Timing tab**: Visual timeline of step durations

### Projects Page
- List/grid of projects with:
  - Project name
  - VCS provider icon (GitHub/GitLab/Bitbucket)
  - Default branch
  - Last build status
  - "Set Up Project" or "Follow/Unfollow" button

### Insights Page
- **Time range selector**: 24h, 7d, 30d, 60d, 90d
- **Summary cards**: Workflow Runs, Total Duration, Success Rate, Credits
- **Workflow list**: Table with columns — Workflow Name, Runs, Success Rate, P50 Duration, P95 Duration, Credits
- **Drill-down**: Click workflow → time-series charts for duration/success/credits
- **Jobs tab**: Per-job metrics within a workflow

### Project Settings Page
- **Sidebar tabs**: Overview, Triggers, Environment Variables, SSH Keys, API Tokens, Webhooks, Advanced
- **Environment Variables**: Table with Name, Value (masked), Created date, Delete button; "Add Environment Variable" button opens modal
- **SSH Keys**: Deploy key and additional key management

### Organization Settings
- Members & roles
- Contexts (shared environment variable groups)
- Security policies
- VCS connections

---

## Feature List with Priority

### P0 — Core (App cannot render without)
1. Project scaffold (Vite + React)
2. Visual design system matching XircleCI's dark sidebar + light content theme
3. App shell layout (sidebar + main content)
4. Routing for all pages
5. State management (AppContext + dataManager)
6. `/go` state inspection endpoint
7. Session isolation (mock API plugin)

### P1 — Primary Features (Core workflows)
1. Pipelines dashboard with status badges and filters
2. Workflow detail with visual workflow map (DAG)
3. Job detail with step output (terminal-style)
4. Projects list page
5. Insights dashboard with metrics
6. Project settings (env vars, SSH keys)
7. Pipeline rerun/cancel actions
8. Manual approval workflow step
9. Branch and project filtering
10. Search across pipelines/projects

### P2 — Secondary Features (Depth & realism)
1. Insights drill-down with time-series charts
2. Test results tab in job detail
3. Artifacts tab in job detail
4. Timing visualization tab
5. Organization settings page
6. Contexts management
7. Runners page
8. Deploys page
9. Keyboard shortcuts
10. Webhook configuration

---

## What to Skip (and Why)

- **Authentication/Login**: App starts pre-logged-in as a default user in an organization
- **Real VCS integration**: No actual GitHub/GitLab connections
- **Real build execution**: Pipeline/job statuses are simulated with mock data
- **Real-time WebSocket updates**: Status changes happen through user actions
- **Credit billing/payment**: Plan page shows static usage data
- **SSH into running jobs**: Not implementable in a frontend mock
- **Real artifact downloads**: Visual only

---

## Screenshots Reference

- `000003.jpg` — **XircleCI homepage hero** showing the Pipelines dashboard UI with sidebar navigation, pipeline list with status badges (Running, Success, Queued, Needs Approval, Failed), project names, workflow names, and trigger events. This is the primary reference for the app shell and pipelines page layout.

## Color Palette (from screenshots and XircleCI branding)

- **Sidebar background**: `#0D0E12` (very dark, near-black)
- **Sidebar text**: `#A0A4AB` (muted gray), `#FFFFFF` (active item)
- **Sidebar active item bg**: `#1C1E26` (slightly lighter dark)
- **Main content bg**: `#FFFFFF` (white)
- **Content secondary bg**: `#F7F7F8` (light gray)
- **Primary accent**: `#04AA51` (XircleCI green — used for success, CTA buttons)
- **Running status**: `#2196F3` (blue)
- **Failed status**: `#F44336` (red)
- **Queued/On Hold status**: `#9E7C0C` (amber/gold)
- **Needs Approval**: `#9C27B0` (purple)
- **Canceled status**: `#757575` (gray)
- **Text primary**: `#24292F` (near-black)
- **Text secondary**: `#656D76` (medium gray)
- **Border color**: `#D1D5DA` (light gray)
- **Link color**: `#0969DA` (blue)
