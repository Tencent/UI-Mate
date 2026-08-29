# vercel_mock Schema

**Deploy order**: 85 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8085)
**Base URL**: `http://localhost:5173/` (dev) or `http://172.17.46.46:8085/` (prod)
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{success, files: [{original_name, stored_name, size, content_type, url}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content with Content-Type

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentTeam` | object | Active team: `{id, name, slug, avatar, plan, createdAt}` |
| `currentUser` | object | Logged-in user: `{id, name, username, email, avatar, role}` — always `user_01` (Alex Johnson, owner) |
| `projects` | array | Each: `{id, name, slug, framework, gitRepo, productionUrl, customDomains[], latestDeployment, createdAt, updatedAt, buildCommand, outputDirectory, installCommand, rootDirectory, nodeVersion, productionBranch, autoDeployEnabled, screenshot, isPaused}` — `framework` ∈ `nextjs|astro|vite|nuxt|sveltekit|gatsby|remix` |
| `deployments` | array | Each: `{id, projectId, url, productionUrl, status, environment, git, buildDuration, framework, nodeVersion, regions[], output, buildLogs[], createdAt, readyAt, creatorId}` — `status` ∈ `READY|BUILDING|ERROR|CANCELED|QUEUED`, `environment` ∈ `production|preview` |
| `domains` | array | Each: `{id, projectId, name, apexDomain, verified, sslStatus, dnsRecords[], redirectTo, createdAt}` — `sslStatus` ∈ `active|pending` |
| `environmentVariables` | array | Each: `{id, projectId, key, value, target[], type, gitBranch, createdAt, updatedAt}` — `target` is array of `production|preview|development`, `type` ∈ `plain|encrypted` |
| `teamMembers` | array | Each: `{id, name, username, email, avatar, role, joinedAt}` — `role` ∈ `owner|member|developer|viewer` |
| `activityEvents` | array | Each: `{id, type, description, userId, userName, userAvatar, projectId, projectName, metadata, createdAt}` — `type` ∈ `deployment.ready|deployment.created|deployment.error|deployment.canceled|project.created|project.removed|project.renamed|domain.created|domain.updated|domain.verified|domain.removed|env-variable.created|env-variable.updated|env-variable.deleted|member.added|member.removed|member.role-changed|integration.installed|integration.removed|team.deleted` |
| `integrations` | array | Each: `{id, name, slug, icon, description, installedAt, status, configuredProjects[]}` — `status` ∈ `active|inactive` |
| `ui` | object | `{sidebarCollapsed, activeProjectId, searchQuery, deploymentFilter, deploymentStatusFilter}` — local UI state, not meaningful for RL evaluation |

### Default IDs

**Projects**: `prj_001` (my-nextjs-app, Next.js, READY), `prj_002` (docs-site, Astro, READY), `prj_003` (api-gateway, Vite, READY), `prj_004` (marketing-site, Nuxt, BUILDING), `prj_005` (internal-tools, SvelteKit, ERROR)

**Deployments**: `dpl_001`–`dpl_020` distributed across projects. Key production deployments: `dpl_001` (prj_001 prod READY), `dpl_007` (prj_002 prod READY), `dpl_011` (prj_003 prod READY), `dpl_015` (prj_004 prod READY), `dpl_018` (prj_005 prod ERROR)

**Domains**: `dom_001` (myapp.com, verified), `dom_002` (www.myapp.com, verified), `dom_003` (docs.acme.dev, verified), `dom_004` (api.acme.dev, verified), `dom_005` (staging.acme.dev, **unverified**)

**Environment Variables**: `env_001`–`env_010` across projects. Keys include `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_GA_ID`, `CONTENT_API_KEY`, `SITE_URL`, `API_SECRET`, `REDIS_URL`, `DATABASE_URL` (prj_005), `DEBUG_MODE`

**Team Members**: `user_01` (Alex Johnson, owner), `user_02` (Sarah Chen, member), `user_03` (Marcus Williams, developer), `user_04` (Priya Patel, developer)

**Activity Events**: `evt_001`–`evt_020`, spanning last 7 days

**Integrations**: `int_001` (GitHub, active), `int_002` (GitLab, active), `int_003` (Xercel Analytics, active), `int_004` (Sentry, active)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentTeam": {
      "id": "team_abc123",
      "name": "Acme Inc",
      "slug": "acme-inc",
      "avatar": null,
      "plan": "pro",
      "createdAt": "2023-06-15T10:00:00Z"
    },
    "currentUser": {
      "id": "user_01",
      "name": "Alex Johnson",
      "username": "alexjohnson",
      "email": "alex@acme.dev",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      "role": "owner"
    },
    "projects": [
      {
        "id": "prj_001",
        "name": "my-nextjs-app",
        "slug": "my-nextjs-app",
        "framework": "nextjs",
        "gitRepo": {"provider": "github", "owner": "alexjohnson", "name": "my-nextjs-app", "url": "https://github.com/alexjohnson/my-nextjs-app", "branch": "main"},
        "productionUrl": "my-nextjs-app.vercel.app",
        "customDomains": ["myapp.com"],
        "latestDeployment": "dpl_001",
        "createdAt": "2024-01-10T14:30:00Z",
        "updatedAt": "2025-03-15T09:19:05Z",
        "buildCommand": "next build",
        "outputDirectory": ".next",
        "installCommand": "npm install",
        "rootDirectory": null,
        "nodeVersion": "20.x",
        "productionBranch": "main",
        "autoDeployEnabled": true,
        "screenshot": null,
        "isPaused": false
      }
    ],
    "deployments": [
      {
        "id": "dpl_001",
        "projectId": "prj_001",
        "url": "my-nextjs-app-a1b2c3d.vercel.app",
        "productionUrl": "my-nextjs-app.vercel.app",
        "status": "READY",
        "environment": "production",
        "git": {"branch": "main", "commitSha": "a1b2c3d", "commitMessage": "feat: add user dashboard page", "author": "alexjohnson"},
        "buildDuration": 45,
        "framework": "nextjs",
        "nodeVersion": "20.x",
        "regions": ["iad1"],
        "output": {"staticFiles": 42, "serverlessFunctions": 8, "edgeFunctions": 2, "totalSize": "12.4 MB"},
        "buildLogs": [{"timestamp": "2025-03-15T09:19:05Z", "text": "Deployment ready!"}],
        "createdAt": "2025-03-15T09:19:05Z",
        "readyAt": "2025-03-15T09:19:05Z",
        "creatorId": "user_01"
      }
    ],
    "domains": [],
    "environmentVariables": [],
    "teamMembers": [
      {"id": "user_01", "name": "Alex Johnson", "username": "alexjohnson", "email": "alex@acme.dev", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=alex", "role": "owner", "joinedAt": "2023-06-15T10:00:00Z"}
    ],
    "activityEvents": [],
    "integrations": [],
    "ui": {"sidebarCollapsed": false, "activeProjectId": null, "searchQuery": "", "deploymentFilter": "all", "deploymentStatusFilter": "all"}
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Create new project (via /new → Import + Deploy) | `projects` array grows by 1; `deployments` array grows by 1 (BUILDING); `activityEvents` grows by 1 (`project.created`) |
| Redeploy from project overview | `deployments` array grows by 1 (BUILDING → READY after 5s); `activityEvents` grows by 2 |
| Redeploy from deployment detail | `deployments` array grows by 1 (BUILDING → READY after 5s); `activityEvents` grows by 1 |
| Promote preview deployment to production | `deployments[i].environment` → `"production"`, `deployments[i].productionUrl` set; `projects[i].latestDeployment` updated; `activityEvents` grows |
| Cancel BUILDING deployment | `deployments[i].status` → `"CANCELED"` |
| Update project name (Settings → General → Save) | `projects[i].name` updated; `activityEvents` grows by 1 (`project.renamed`) |
| Update project framework preset (Settings → General → Save) | `projects[i].framework` updated |
| Update build command/output dir/etc. (Settings → General → Save) | `projects[i].buildCommand` / `outputDirectory` / `installCommand` / `rootDirectory` / `nodeVersion` updated |
| Delete project (Settings → General → Delete) | `projects` shrinks by 1; `activityEvents` grows by 1 (`project.removed`) |
| Add domain (Settings → Domains → Add) | `domains` grows by 1 (unverified, pending SSL); `activityEvents` grows by 1 (`domain.created`) |
| Remove domain (Settings → Domains → Remove) | `domains` shrinks by 1; `activityEvents` grows by 1 (`domain.removed`) |
| Add env var (Settings → Env Vars → Save) | `environmentVariables` grows by 1; `activityEvents` grows by 1 (`env-variable.created`) |
| Edit env var (Settings → Env Vars → Edit → Save) | `environmentVariables[i]` updated; `activityEvents` grows by 1 (`env-variable.updated`) |
| Delete env var (Settings → Env Vars → Delete) | `environmentVariables` shrinks by 1; `activityEvents` grows by 1 (`env-variable.deleted`) |
| Change team member role (Settings → Members) | `teamMembers[i].role` updated; `activityEvents` grows by 1 (`member.role-changed`) |
| Remove team member (Settings → Members → Remove) | `teamMembers` shrinks by 1; `activityEvents` grows by 1 (`member.removed`) |
| Collapse/expand sidebar | `ui.sidebarCollapsed` toggled |
| Update team name/slug (Team Settings → General → Save) | `currentTeam.name` and/or `currentTeam.slug` updated (via `UPDATE_TEAM`) |
| Enable/Disable Web Analytics (Project → Analytics → toggle) | `projects[i].analyticsEnabled` toggled |
| Save Functions region (Project → Settings → Functions → Save) | `projects[i].functions.region` updated |
| Save Functions memory (Project → Settings → Functions → Save) | `projects[i].functions.memory` updated |
| Save Functions max duration (Project → Settings → Functions → Save) | `projects[i].functions.maxDuration` updated |
| Toggle Cron Jobs (Project → Settings → Functions → toggle) | `projects[i].functions.cronsEnabled` toggled |
| Save Production Branch (Project → Settings → Git → Save) | `projects[i].productionBranch` updated |
| Disconnect Git repository (Project → Settings → Git → Disconnect) | `projects[i].gitRepo` → `null`; `projects[i].autoDeployEnabled` → `false` |
| Create Deploy Hook (Project → Settings → Git → Create Hook) | `projects[i].deployHooks` array grows by 1 |
| Edit domain name (Project → Settings → Domains → Edit → Save) | `domains[i].name` and `domains[i].apexDomain` updated; `activityEvents` grows by 1 (`domain.updated`) |
| Install integration (Integrations → Install) | `integrations` array grows by 1; `activityEvents` grows by 1 (`integration.installed`) |
| Delete team (Team Settings → General → Delete Team) | `activityEvents` grows by 1 (`team.deleted`); app navigates to `/` |
