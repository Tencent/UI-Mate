# Xercel Dashboard Mock — TODO

> Status: COMPLETE
> Last updated by: orchestrator, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [x] Not started
- [x] In progress
- [x] Done

---

## P0 — Core Shell
<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] Project scaffold: `npm create vite@latest vercel_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`. Use plain CSS (not Tailwind) to match Geist design system precisely.

- [x] **Visual design system**: Dark-first Geist Design System. CSS custom properties in `:root` — `--bg-primary: #000000`, `--bg-secondary: #0A0A0A`, `--bg-tertiary: #111111`, `--bg-hover: #1A1A1A`, `--fg-primary: #EDEDED`, `--fg-secondary: #888888`, `--fg-muted: #666666`, `--border: rgba(255,255,255,0.08)`, `--border-strong: rgba(255,255,255,0.15)`, `--accent-blue: #0070F3`, `--accent-blue-hover: #0060D0`, `--success: #50E3C2`, `--error: #EE0000`, `--warning: #F5A623`, `--white: #FFFFFF`. Font family: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. Mono: `'SF Mono', 'Menlo', 'Consolas', monospace`. Base font 14px, body line-height 1.5, heading letter-spacing -0.04em. Border-radius: 6px for buttons/inputs, 8px for cards, 12px for modals. Global `* { box-sizing: border-box }`, `body { margin: 0; background: #000; color: #EDEDED }`.

- [x] **App layout**: Full-viewport flex layout. Left sidebar (240px width, collapsible to 48px icon rail via toggle) with `#000000` bg and right `var(--border)` border. Main content area fills remaining width. No fixed top header bar — instead, each page has its own breadcrumb/header area at the top of the main content. Sidebar is full height (100vh), sticky. Main content scrolls independently.

- [x] **Sidebar component**: At top: Xercel triangle logo (▲ as SVG, white, 20px) + team name "Acme Inc" as text (truncated). Below: team/account switcher dropdown (click team name → dropdown with "Personal Account" and team names). Navigation items with 20px icons from lucide-react + 14px labels: **Overview** (layout-grid icon), **Integrations** (puzzle icon), **Activity** (activity icon), **Domains** (globe icon), **Usage** (bar-chart icon), **Settings** (settings icon). Active item: white text + `var(--bg-tertiary)` bg + left 2px white accent border. Inactive: `var(--fg-secondary)` text. Hover: `var(--bg-hover)` bg. Section divider line between team nav and project nav. At bottom: avatar circle (32px) + username + help button.

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes: `/` → Dashboard (project list), `/project/:projectId` → ProjectLayout (with nested: `overview`, `deployments`, `deployments/:deploymentId`, `analytics`, `speed-insights`, `logs`, `storage`, `settings`, `settings/domains`, `settings/environment-variables`, `settings/git`, `settings/functions`, `settings/general`), `/activity` → ActivityLog, `/domains` → DomainsPage (team-level), `/integrations` → IntegrationsPage, `/usage` → UsagePage, `/settings` → TeamSettings, `/settings/members` → TeamMembers, `/new` → NewProject, `/go` → StateInspector.

- [x] **State management**: React Context (`AppContext`) + `useReducer`. `dataManager.js` exports `createInitialData()` per `data_model.md`. Actions: `SET_STATE`, `RESET_STATE`, `ADD_PROJECT`, `UPDATE_PROJECT`, `DELETE_PROJECT`, `ADD_DEPLOYMENT`, `UPDATE_DEPLOYMENT`, `ADD_DOMAIN`, `UPDATE_DOMAIN`, `DELETE_DOMAIN`, `ADD_ENV_VAR`, `UPDATE_ENV_VAR`, `DELETE_ENV_VAR`, `ADD_ACTIVITY_EVENT`, `ADD_TEAM_MEMBER`, `REMOVE_TEAM_MEMBER`, `UPDATE_TEAM_MEMBER_ROLE`, `SET_UI`. Each action must update state immutably and push an activity event where appropriate.

- [x] `/go` endpoint: `src/pages/StateInspector.jsx` + route at `/go`. Returns JSON `{ initial_state, current_state, state_diff }`. Deep diff computation comparing initial vs current state. Supports `?sid=` query param for session isolation.

- [x] Session isolation: `vite.config.js` mock-api plugin. `POST /post?sid=<sid>` with `{"action":"set","state":{...}}` sets both initial + current state. `POST /post?sid=<sid>` with `{"action":"set_current","state":{...}}` updates only current state. `POST /post?sid=<sid>` with `{"action":"reset"}` resets current to initial. `GET /go?sid=<sid>` returns `{initial_state, current_state, state_diff}`. Session data stored in-memory map keyed by sid. When no sid, use localStorage for persistence.

---

## P1 — Primary Features
<!-- Core features a user interacts with in the first 5 minutes. -->

- [x] **Dashboard / Project list page** (`/`): Page header with "Overview" title (24px semibold). Below: search input (full-width, 40px height, magnifying glass icon, placeholder "Search Projects...", filters projects by name as user types). Below search: "Add New..." button (white bg, black text, 36px height) that opens dropdown with "Project" option (navigates to `/new`). Below: project cards in a responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile). Each **project card**: 8px border-radius, `var(--border)` border, `var(--bg-secondary)` bg on hover. Card content: top row = project name (16px semibold white, clickable → `/project/:id/overview`) + framework icon (Next.js triangle, Vite bolt, etc. — use simple colored SVG badges). Second row = Git repo link (muted, 12px, "github.com/alexjohnson/my-nextjs-app"). Third row = production URL (12px, blue accent link). Bottom row = deployment status dot (8px circle: green `#50E3C2` for READY, yellow `#F5A623` for BUILDING, red `#EE0000` for ERROR, gray `#666` for CANCELED) + status text + relative timestamp ("2h ago"). Card click navigates to project overview.

- [x] **Project layout** (`/project/:projectId`): When navigating into a project, the sidebar should update to show project-level navigation tabs. Replace the team-level nav items with: **Project** (overview), **Deployments**, **Analytics**, **Speed Insights**, **Logs**, **Storage**, **Settings**. Breadcrumb at top of main content: "Acme Inc" (link to `/`) > "my-nextjs-app" (project name). The project-level sidebar nav items use the same styling as team nav (active = white text + bg-tertiary + left accent).

- [x] **Project overview page** (`/project/:projectId/overview`): Main content split into sections. **Production Deployment** card (prominent, full-width): shows deployment URL (clickable, opens in new tab), status badge (pill: green "Ready" / yellow "Building" / red "Error"), branch name + commit SHA (monospace, 12px) + commit message (truncated to 60 chars), author avatar (24px) + name, relative timestamp. "Visit" button (outline, opens URL). "Redeploy" button (outline). Below: **Preview Deployments** section title + list of latest 5 preview deployments, each row: branch name, commit message (truncated), status dot, author avatar, timestamp, "Visit" link. If no previews, show "No preview deployments" muted text. Below: **Domains** section showing list of assigned domains with status indicators.

- [x] **Deployments list page** (`/project/:projectId/deployments`): Page header "Deployments". Filter bar: environment dropdown ("All Environments" / "Production" / "Preview") + status dropdown ("All Statuses" / "Ready" / "Building" / "Error" / "Canceled") + search input (searches commit messages). Below: list of deployments for this project sorted by `createdAt` desc. Each deployment row: left side = status indicator (colored vertical bar 3px wide on left edge: green/yellow/red/gray) + deployment URL (truncated, 14px, monospace) + environment badge (small pill: "Production" blue bg or "Preview" gray bg). Middle = Git info: commit message (14px, truncated), branch name (12px muted, with git-branch icon), commit SHA (12px monospace muted). Right side = author avatar (24px circle) + relative timestamp. Row is clickable → navigates to deployment detail. Hover: `var(--bg-hover)` bg.

- [x] **Deployment detail page** (`/project/:projectId/deployments/:deploymentId`): Header: deployment URL (16px, monospace, clickable "Visit" link), status badge pill, environment badge. Below header: Git info card — commit SHA (monospace, linked), commit message (full), branch with icon, author avatar + name, timestamp. **Tabs**: "Build Logs" (default) | "Source" | "Functions". **Build Logs tab**: dark terminal-style container (`#0A0A0A` bg, monospace font, 13px), each log line: muted timestamp on left + log text. Auto-scroll to bottom. Color-code: lines containing "error" or "Error" in red, lines containing "warn" in yellow, "ready" or "success" in green. **Deployment Summary** sidebar (right, 280px): Framework (with icon), Build Duration (e.g., "45s"), Status, Regions (list), Output stats: Static Files count, Serverless Functions count, Edge Functions count, Total Size. **Action buttons** at top-right: "Redeploy" (outline), "Promote to Production" (only for preview deployments, outline), three-dot menu with "Cancel deployment" (only if BUILDING/QUEUED).

- [x] **Project settings — General** (`/project/:projectId/settings` or `/settings/general`): Settings page has its own left sub-navigation within the main content area (not sidebar): General, Domains, Environment Variables, Git, Functions, Deployment Protection, Security. **General page**: "Project Name" input (editable, with "Save" button), "Framework Preset" dropdown (Next.js, Vite, Remix, Astro, Nuxt, SvelteKit, Gatsby, Other), "Build & Output Settings" section with: Build Command input, Output Directory input, Install Command input — each with a toggle "Override" checkbox. "Root Directory" input. "Node.js Version" dropdown (18.x, 20.x, 22.x). "Project ID" read-only code block. At bottom: red danger zone — "Delete Project" section with red-outlined "Delete" button that opens confirmation modal (type project name to confirm).

- [x] **Project settings — Domains** (`/project/:projectId/settings/domains`): "Add Domain" input + "Add" button at top. Below: table of domains. Each row: domain name (14px), status indicator (green check "Valid Configuration" / yellow warning "Pending Verification" / red X "Invalid"), SSL status badge, "Edit" and "Remove" buttons. When a domain is pending, expand to show DNS configuration instructions: record type (A/CNAME), name, value — in a code-style table. Clicking "Remove" shows confirmation dialog. Adding a domain dispatches `ADD_DOMAIN` and `ADD_ACTIVITY_EVENT`.

- [x] **Project settings — Environment Variables** (`/project/:projectId/settings/environment-variables`): "Add New" form at top: key input (placeholder "VARIABLE_NAME", monospace), value textarea (placeholder "Value", monospace), environment checkboxes (Production ✓, Preview ✓, Development ✓ — all checked by default), "Save" button. Below form: table of existing env vars. Each row: key name (monospace, 14px), value shown as "••••••••" (with eye icon toggle to reveal), environment scope badges (small pills: "Production" / "Preview" / "Development"), "Edit" pencil icon button, "Delete" trash icon button. Edit mode: row expands inline to show editable key, value, and environment checkboxes with Save/Cancel. Delete: confirmation dialog. All actions dispatch corresponding actions + activity events.

- [x] **Activity log page** (`/activity`): Page header "Activity". Filter bar: event type dropdown ("All Events" / "Deployments" / "Projects" / "Domains" / "Members"), date range (preset: "Last 7 days" / "Last 30 days" / "All time"). Below: chronological list (newest first) of activity events. Each event row: left = user avatar (32px), right = event description text (14px, e.g., "Alex Johnson deployed my-nextjs-app to production"), relative timestamp, event type icon. Group events by date (section headers: "Today", "Yesterday", "March 14, 2025"). Clicking project name in event navigates to that project.

- [x] **Search / Command palette**: `Ctrl+K` (or `Cmd+K`) opens a centered modal overlay (dark bg, 640px width, 8px radius). Search input at top (autofocus, 16px, magnifying glass icon). As user types, show filtered results: project names matching query (with framework icon), then page links (Settings, Activity, Domains, etc.). Each result row: icon + title + path/description muted text. Up/Down arrows navigate, Enter selects (navigates), Esc closes. Show "No results" if nothing matches. Clicking outside closes.

---

## P2 — Secondary Features
<!-- Depth and realism, implement after P1 is solid. -->

- [x] **New project page** (`/new`): Two-column layout. Left: "Import Git Repository" section — list of mock repositories from connected git account (4-5 repos showing repo name, visibility badge, last updated). Each has an "Import" button. Search filter for repos. Right: "Clone Template" section with 3-4 template cards (Next.js Starter, Vite React, Astro Blog, SvelteKit Demo) each with name, description, "Deploy" button. Clicking "Import" on a repo opens a configuration step: Project Name input, Framework Preset dropdown, Root Directory input, Build Settings, Environment Variables (add key-value pairs). "Deploy" button creates the project (dispatches `ADD_PROJECT`) and a first deployment (`ADD_DEPLOYMENT` with BUILDING status), then navigates to the new project page.

- [x] **Team domains page** (`/domains`): Team-level domain management. List of all domains across all projects. Each row: domain name, project it's assigned to (linked), DNS status, SSL status, expiration date (decorative). "Add Domain" button opens form. Can transfer domains between projects.

- [x] **Integrations page** (`/integrations`): Grid of integration cards. Each card: integration icon/logo (32px), name (16px semibold), description (14px muted), status badge ("Active" green / "Not Connected" gray). Installed integrations show a "Configure" button. Uninstalled show "Install" button (visual only — toggles installed state). Section headers: "Installed" and "Available".

- [x] **Usage page** (`/usage`): Decorative dashboard showing usage metrics. Sections: **Bandwidth** (progress bar showing 45/100 GB used, with breakdown by project), **Build Minutes** (progress bar 120/400 min), **Serverless Function Invocations** (progress bar 50K/100K), **Image Optimizations** (progress bar 800/1000). Each section has a small bar chart (last 7 days, static SVG). "Current billing period: Mar 1 - Mar 31, 2025" header text.

- [x] **Team settings** (`/settings`): Sections: "Team Name" input (editable + Save), "Team URL" slug input (editable + Save), "Team ID" read-only code block, "Transfer Ownership" button (visual only), "Delete Team" red danger zone.

- [x] **Team members page** (`/settings/members`): "Invite Member" button + email input at top. Table of members: avatar (32px), name, email, role dropdown (Owner/Member/Developer/Viewer), joined date, "Remove" button (red, with confirmation). Changing role dispatches `UPDATE_TEAM_MEMBER_ROLE`. Removing dispatches `REMOVE_TEAM_MEMBER`.

- [x] **Project settings — Git** (`/project/:projectId/settings/git`): "Connected Git Repository" card showing provider icon + repo URL + "Disconnect" button (visual). "Production Branch" input (default: "main"). "Deploy Hooks" section: list of existing hooks (name + URL), "Create Hook" form (name input + branch dropdown). "Ignored Build Step" dropdown (Automatic / Don't build anything / Custom command input).

- [x] **Project settings — Functions** (`/project/:projectId/settings/functions`): "Default Region" dropdown (list of 10+ region codes: iad1, sfo1, cdg1, hnd1, etc. with city names). "Default Memory" dropdown (128 MB, 256 MB, 512 MB, 1024 MB). "Default Max Duration" input (seconds, 10-300). "Cron Jobs" toggle (enabled/disabled). All changes are visual — update local UI state.

- [x] **Analytics placeholder** (`/project/:projectId/analytics`): Decorative page. "Web Analytics" header. Large line chart placeholder (static SVG or CSS-drawn) showing "Visitors" over last 7 days. Below: stats cards — "Unique Visitors: 12,847", "Page Views: 48,293", "Avg. Visit Duration: 2m 34s". "Top Pages" table: path, views, unique visitors (5 rows of static data). "Enable Web Analytics" button if not "enabled" (toggle state in project).

- [x] **Speed Insights placeholder** (`/project/:projectId/speed-insights`): Decorative page. Large circular score gauge (0-100, colored green/yellow/red). Core Web Vitals cards: LCP (2.1s, green), FID (45ms, green), CLS (0.08, green), FCP (1.2s, green), TTFB (0.3s, green). Static data.

- [x] **Logs placeholder** (`/project/:projectId/logs`): Dark terminal-style full-height container. Header with: environment dropdown (Production/Preview), time range dropdown (Last hour / Last 24h / Last 7d), search input, "Live" toggle button. Below: mock log entries in monospace font — each line: timestamp (muted), HTTP method badge (GET green, POST blue, etc.), path, status code (200 green, 404 yellow, 500 red), duration (ms). Show ~20 static log entries. "Live" mode: when toggled on, append a new mock log entry every 3 seconds (simulated).

- [x] **Deployment redeploy action**: "Redeploy" button on deployment detail and project overview. Clicking opens confirmation modal: "This will create a new deployment using the same source code and configuration." → "Redeploy" button. On confirm: dispatch `ADD_DEPLOYMENT` with status BUILDING, same git info as source deployment, new id/timestamp. After 5 seconds (simulated), dispatch `UPDATE_DEPLOYMENT` to set status to READY.

- [x] **Deployment promote action**: On preview deployment detail, "Promote to Production" button. Confirmation modal: "This will make this deployment the active production deployment." On confirm: update the deployment's environment to "production", update project's `latestDeployment` reference, dispatch activity event.

- [x] **Sidebar collapse toggle**: Button at bottom of sidebar (chevron icon). Clicking collapses sidebar to 48px width showing only icons (no labels). Icons should have tooltips on hover when collapsed. State persisted in `ui.sidebarCollapsed`. Smooth CSS transition (200ms).

- [x] **Notification bell**: In sidebar footer area or page header, a bell icon with unread count badge (decorative, shows "3"). Clicking opens a dropdown/popover: "Notifications" header, list of 3-5 mock notifications (deployment ready, deployment failed, domain verified), each with icon + text + timestamp. "Mark all as read" button. Clicking a notification navigates to relevant project/deployment.

---

## Data Seed (implement in createInitialData())
<!-- Dev must create realistic seed data matching these specs. -->

- [x] **Projects**: 5 projects per `data_model.md` §Project — my-nextjs-app (Next.js, READY), docs-site (Astro, READY), api-gateway (Vite, READY), marketing-site (Nuxt, BUILDING), internal-tools (SvelteKit, ERROR). Each with distinct git repos, realistic build commands, and framework presets.

- [x] **Deployments**: 20 deployments distributed across 5 projects per `data_model.md` §Deployment. Each has 8-12 build log lines with realistic Next.js/Vite/Astro build output. Timestamps span last 7 days. Production deployments have production URLs matching project's `productionUrl`. Preview deployments have unique hash URLs like `my-nextjs-app-abc123.vercel.app`.

- [x] **Domains**: 5 domains per `data_model.md` §Domain. Include realistic DNS records (A records pointing to `76.76.21.21`, CNAMEs to `cname.vercel-dns.com`).

- [x] **Environment Variables**: 10 env vars per `data_model.md` §EnvironmentVariable. Mix of production-only, all-environments, and development-only variables. Values should be realistic (postgres URLs, API keys, feature flags).

- [x] **Activity Events**: 20 events per `data_model.md` §ActivityEvent spanning last 7 days. Mix of deployment.ready, deployment.error, project.created, domain.verified, member.added events with realistic descriptions.

- [x] **Team Members**: 4 members per `data_model.md` — Alex (owner), Sarah (member), Marcus (developer), Priya (developer). Use dicebear avatars.

- [x] **Integrations**: 4 integrations per `data_model.md` — GitHub, GitLab, Xercel Analytics, Sentry.

---

## Out of Scope
<!-- Dev must NOT implement these. -->

- Authentication / login (app starts pre-logged-in as Alex Johnson, owner of "Acme Inc" team)
- Real Git repository imports or connections
- Real deployment builds or serverless function execution
- Real DNS verification or SSL certificate issuance
- Billing, payments, or plan upgrades
- Real-time WebSocket log streaming (use simulated polling)
- File uploads for deployments
- v0 AI assistant / AI Gateway features
- Email notifications or webhook delivery
- Edge Config or Feature Flags management
- Marketplace or third-party integration installation flows
