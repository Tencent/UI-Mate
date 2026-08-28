# Xercel Mock — Data Model

## Entity Definitions

---

### §Team (currentTeam)
The active workspace/account. The app starts pre-logged-in to this team.

```javascript
{
  id: "team_abc123",
  name: "Acme Inc",
  slug: "acme-inc",
  avatar: null, // or URL
  plan: "pro", // "hobby" | "pro" | "enterprise"
  createdAt: "2023-06-15T10:00:00Z"
}
```

---

### §CurrentUser
The logged-in user.

```javascript
{
  id: "user_01",
  name: "Alex Johnson",
  username: "alexjohnson",
  email: "alex@acme.dev",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
  role: "owner" // "owner" | "member" | "developer" | "viewer"
}
```

---

### §TeamMember
```javascript
{
  id: "user_01",       // same as user id
  name: "Alex Johnson",
  username: "alexjohnson",
  email: "alex@acme.dev",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
  role: "owner",       // "owner" | "member" | "developer" | "viewer"
  joinedAt: "2023-06-15T10:00:00Z"
}
```

---

### §Project
A deployed web application connected to a Git repository.

```javascript
{
  id: "prj_001",
  name: "my-nextjs-app",
  slug: "my-nextjs-app",        // URL-safe project name
  framework: "nextjs",          // "nextjs" | "vite" | "remix" | "astro" | "nuxt" | "sveltekit" | "gatsby" | "static" | null
  gitRepo: {
    provider: "github",         // "github" | "gitlab" | "bitbucket"
    owner: "alexjohnson",
    name: "my-nextjs-app",
    url: "https://github.com/alexjohnson/my-nextjs-app",
    branch: "main"              // default production branch
  },
  productionUrl: "my-nextjs-app.vercel.app",
  customDomains: ["myapp.com", "www.myapp.com"],
  latestDeployment: "dpl_001",  // deployment id reference
  createdAt: "2024-01-10T14:30:00Z",
  updatedAt: "2025-03-15T09:20:00Z",
  // Settings
  buildCommand: "next build",
  outputDirectory: ".next",
  installCommand: "npm install",
  rootDirectory: null,          // null = repo root
  nodeVersion: "20.x",
  // Decorative stats
  productionBranch: "main",
  autoDeployEnabled: true,
  screenshot: null,             // URL or null (we render a placeholder)
  isPaused: false
}
```

**Seed: 5 projects**
1. `my-nextjs-app` — Next.js, production ready, github, has custom domain
2. `docs-site` — Astro, production ready, github
3. `api-gateway` — Vite (React), production ready, gitlab
4. `marketing-site` — Nuxt, building state (one deployment currently building)
5. `internal-tools` — SvelteKit, error state (latest deployment failed)

---

### §Deployment
The result of a build/deploy operation.

```javascript
{
  id: "dpl_001",
  projectId: "prj_001",
  url: "my-nextjs-app-abc123.vercel.app",  // unique deployment URL
  productionUrl: "my-nextjs-app.vercel.app", // null if not production
  status: "READY",              // "QUEUED" | "BUILDING" | "READY" | "ERROR" | "CANCELED"
  environment: "production",    // "production" | "preview"
  // Git info
  git: {
    branch: "main",
    commitSha: "a1b2c3d",
    commitMessage: "feat: add user dashboard page",
    author: "alexjohnson"
  },
  // Build info
  buildDuration: 45,            // seconds
  framework: "nextjs",
  nodeVersion: "20.x",
  regions: ["iad1"],            // deployment regions
  // Output summary
  output: {
    staticFiles: 42,
    serverlessFunctions: 8,
    edgeFunctions: 2,
    totalSize: "12.4 MB"
  },
  // Build logs (array of log lines)
  buildLogs: [
    { timestamp: "2025-03-15T09:18:00Z", text: "Cloning github.com/alexjohnson/my-nextjs-app (Branch: main, Commit: a1b2c3d)" },
    { timestamp: "2025-03-15T09:18:02Z", text: "Installing dependencies..." },
    { timestamp: "2025-03-15T09:18:15Z", text: "npm warn deprecated some-package@1.0.0" },
    { timestamp: "2025-03-15T09:18:20Z", text: "Running build command: next build" },
    { timestamp: "2025-03-15T09:18:45Z", text: "Creating an optimized production build..." },
    { timestamp: "2025-03-15T09:19:00Z", text: "Route (app)                    Size     First Load JS" },
    { timestamp: "2025-03-15T09:19:00Z", text: "├ ○ /                          5.2 kB   89.1 kB" },
    { timestamp: "2025-03-15T09:19:00Z", text: "├ ○ /dashboard                 12.1 kB  96.0 kB" },
    { timestamp: "2025-03-15T09:19:01Z", text: "Build completed in 45s" },
    { timestamp: "2025-03-15T09:19:02Z", text: "Deploying outputs..." },
    { timestamp: "2025-03-15T09:19:05Z", text: "Deployment ready!" }
  ],
  createdAt: "2025-03-15T09:18:00Z",
  readyAt: "2025-03-15T09:19:05Z",
  creatorId: "user_01"
}
```

**Seed: 15-20 deployments across all projects**
- `prj_001` (my-nextjs-app): 6 deployments — 1 production READY (latest), 3 preview READY, 1 preview BUILDING, 1 old CANCELED
- `prj_002` (docs-site): 4 deployments — 1 production READY, 2 preview READY, 1 CANCELED
- `prj_003` (api-gateway): 3 deployments — 1 production READY, 2 preview READY
- `prj_004` (marketing-site): 4 deployments — 1 production READY, 1 preview BUILDING (currently), 2 old READY
- `prj_005` (internal-tools): 3 deployments — 1 production ERROR (latest), 1 old production READY, 1 preview READY

---

### §Domain
Custom domain assigned to a project.

```javascript
{
  id: "dom_001",
  projectId: "prj_001",
  name: "myapp.com",
  apexDomain: "myapp.com",     // root domain
  verified: true,
  sslStatus: "active",          // "active" | "pending" | "error"
  dnsRecords: [
    { type: "A", name: "@", value: "76.76.21.21" },
    { type: "CNAME", name: "www", value: "cname.vercel-dns.com" }
  ],
  redirectTo: null,              // or another domain name for redirect
  createdAt: "2024-02-01T10:00:00Z"
}
```

**Seed: 5 domains**
1. `myapp.com` — prj_001, verified, SSL active
2. `www.myapp.com` — prj_001, verified, SSL active, redirects to myapp.com
3. `docs.acme.dev` — prj_002, verified, SSL active
4. `api.acme.dev` — prj_003, verified, SSL active
5. `staging.acme.dev` — prj_004, pending verification, SSL pending

---

### §EnvironmentVariable
Key-value pair scoped to specific deployment environments.

```javascript
{
  id: "env_001",
  projectId: "prj_001",
  key: "DATABASE_URL",
  value: "postgresql://user:pass@db.example.com/mydb", // stored but displayed as ••••••
  target: ["production"],        // array of: "production" | "preview" | "development"
  type: "encrypted",             // "encrypted" | "plain" | "system"
  gitBranch: null,               // optional branch-specific override
  createdAt: "2024-03-10T08:00:00Z",
  updatedAt: "2024-03-10T08:00:00Z"
}
```

**Seed: 10 env vars across projects**
- `prj_001`: DATABASE_URL (production), NEXT_PUBLIC_API_URL (all), STRIPE_SECRET_KEY (production), NEXT_PUBLIC_GA_ID (production+preview)
- `prj_002`: CONTENT_API_KEY (all), SITE_URL (production)
- `prj_003`: API_SECRET (production), REDIS_URL (production+preview)
- `prj_005`: DATABASE_URL (all), DEBUG_MODE (development)

---

### §ActivityEvent
Team-level event log entry.

```javascript
{
  id: "evt_001",
  type: "deployment.created",    // event type string
  description: "Deployed my-nextjs-app to production",
  userId: "user_01",
  userName: "Alex Johnson",
  userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
  projectId: "prj_001",         // optional
  projectName: "my-nextjs-app", // optional
  metadata: {},                  // event-specific data
  createdAt: "2025-03-15T09:19:05Z"
}
```

**Event types:**
- `deployment.created`, `deployment.ready`, `deployment.error`, `deployment.canceled`
- `project.created`, `project.removed`, `project.renamed`
- `domain.created`, `domain.verified`, `domain.removed`
- `env-variable.created`, `env-variable.updated`, `env-variable.deleted`
- `member.added`, `member.removed`, `member.role-changed`
- `integration.installed`, `integration.removed`

**Seed: 20 activity events spanning the last 7 days**

---

### §Integration
Third-party service connected to the team.

```javascript
{
  id: "int_001",
  name: "GitHub",
  slug: "github",
  icon: "github",               // icon identifier
  description: "Deploy from GitHub repositories",
  installedAt: "2023-06-15T10:00:00Z",
  status: "active",              // "active" | "suspended"
  configuredProjects: ["prj_001", "prj_002", "prj_003"]
}
```

**Seed: 4 integrations**
1. GitHub — active, connected to 3 projects
2. GitLab — active, connected to 1 project
3. Xercel Analytics — active, connected to 2 projects
4. Sentry — active, connected to 1 project

---

## Relationships

```
Team ──┬── has many ──→ Projects
       ├── has many ──→ TeamMembers
       ├── has many ──→ ActivityEvents
       ├── has many ──→ Integrations
       └── has many ──→ Domains (team-level)

Project ──┬── has many ──→ Deployments
          ├── has many ──→ Domains
          ├── has many ──→ EnvironmentVariables
          └── belongs to ──→ Team

Deployment ──┬── belongs to ──→ Project
             └── created by ──→ TeamMember (creatorId)
```

---

## createInitialData() Structure

```javascript
export function createInitialData() {
  return {
    currentTeam: { /* §Team */ },
    currentUser: { /* §CurrentUser */ },

    // Entities
    projects: [ /* 5 §Project objects */ ],
    deployments: [ /* 15-20 §Deployment objects */ ],
    domains: [ /* 5 §Domain objects */ ],
    environmentVariables: [ /* 10 §EnvironmentVariable objects */ ],
    teamMembers: [ /* 4 §TeamMember objects */ ],
    activityEvents: [ /* 20 §ActivityEvent objects */ ],
    integrations: [ /* 4 §Integration objects */ ],

    // UI state
    ui: {
      sidebarCollapsed: false,
      activeProjectId: null,
      searchQuery: "",
      deploymentFilter: "all", // "all" | "production" | "preview"
      deploymentStatusFilter: "all", // "all" | "ready" | "building" | "error" | "canceled"
    }
  };
}
```

---

## TeamMembers Seed Data

```javascript
[
  {
    id: "user_01", name: "Alex Johnson", username: "alexjohnson",
    email: "alex@acme.dev", role: "owner",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    joinedAt: "2023-06-15T10:00:00Z"
  },
  {
    id: "user_02", name: "Sarah Chen", username: "sarahchen",
    email: "sarah@acme.dev", role: "member",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    joinedAt: "2023-08-20T14:00:00Z"
  },
  {
    id: "user_03", name: "Marcus Williams", username: "marcusw",
    email: "marcus@acme.dev", role: "developer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus",
    joinedAt: "2024-01-10T09:00:00Z"
  },
  {
    id: "user_04", name: "Priya Patel", username: "priyap",
    email: "priya@acme.dev", role: "developer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    joinedAt: "2024-05-05T11:00:00Z"
  }
]
```
