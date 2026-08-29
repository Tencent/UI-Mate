# XircleCI Mock — Data Model

## Entity Hierarchy

```
Organization
  └── Project (linked to a VCS repo)
       └── Pipeline (triggered by commit/API/schedule)
            └── Workflow (a named sequence of jobs)
                 └── Job (a unit of work)
                      ├── Step (individual command within a job)
                      ├── TestResult (test suite outcomes)
                      └── Artifact (uploaded files)
```

---

## Entity Definitions

### Organization

```javascript
{
  id: "org-1",
  name: "Acme Corp",
  slug: "acme-corp",
  avatarUrl: null,       // or a generated avatar
  plan: "performance",   // "free" | "performance" | "scale"
  createdAt: "2022-03-15T10:00:00Z"
}
```

### User (currentUser)

```javascript
{
  id: "user-1",
  name: "Alex Johnson",
  username: "alexj",
  email: "alex@acmecorp.com",
  avatarUrl: null,       // placeholder/generated
  role: "admin",         // "admin" | "member"
  createdAt: "2022-03-15T10:00:00Z"
}
```

### Project

```javascript
{
  id: "proj-1",
  name: "frontend-app",
  slug: "gh/acme-corp/frontend-app",  // vcsType/orgName/repoName
  vcsProvider: "github",               // "github" | "gitlab" | "bitbucket"
  vcsUrl: "https://github.com/acme-corp/frontend-app",
  defaultBranch: "main",
  isFollowed: true,                    // whether current user follows this project
  lastBuildStatus: "success",          // latest pipeline status
  lastBuildAt: "2026-04-10T08:30:00Z",
  createdAt: "2023-01-10T09:00:00Z"
}
```

### Pipeline

```javascript
{
  id: "pipe-1",
  projectId: "proj-1",
  number: 1847,                        // sequential pipeline number
  state: "created",                    // "created" | "errored" | "setup-pending" | "setup" | "pending"
  trigger: {
    type: "webhook",                   // "webhook" | "api" | "schedule"
    actor: {
      login: "alexj",
      avatarUrl: null
    }
  },
  vcs: {
    branch: "main",
    commitHash: "a3f7b2c",            // short SHA
    commitMessage: "Fix responsive layout on dashboard",
    commitAuthor: "alexj"
  },
  createdAt: "2026-04-10T08:25:00Z",
  updatedAt: "2026-04-10T08:30:00Z"
}
```

### Workflow

```javascript
{
  id: "wf-1",
  pipelineId: "pipe-1",
  projectId: "proj-1",
  name: "build-test-deploy",
  status: "success",                   // "success" | "failed" | "running" | "on_hold" | "canceled" | "not_run" | "queued" | "needs_approval"
  startedAt: "2026-04-10T08:25:05Z",
  stoppedAt: "2026-04-10T08:29:45Z",
  duration: 280,                       // seconds
  creditsUsed: 45,
  createdAt: "2026-04-10T08:25:00Z"
}
```

### Job

```javascript
{
  id: "job-1",
  workflowId: "wf-1",
  pipelineId: "pipe-1",
  projectId: "proj-1",
  name: "build",
  type: "build",                       // "build" | "approval" | "release" | "noop"
  status: "success",                   // "success" | "failed" | "running" | "blocked" | "canceled" | "not_run" | "on_hold" | "unauthorized"
  jobNumber: 28451,
  executor: {
    type: "docker",                    // "docker" | "machine" | "macos"
    resourceClass: "medium"            // "small" | "medium" | "large" | "xlarge"
  },
  parallelism: 1,
  dependencies: [],                    // array of job IDs this job depends on
  startedAt: "2026-04-10T08:25:05Z",
  stoppedAt: "2026-04-10T08:26:30Z",
  duration: 85,                        // seconds
  creditsUsed: 10,
  steps: [/* Step objects inline */],
  createdAt: "2026-04-10T08:25:00Z"
}
```

### Step (nested within Job)

```javascript
{
  id: "step-1",
  name: "Checkout code",               // or "Spin up environment", "run: npm install", etc.
  status: "success",                   // "success" | "failed" | "running" | "canceled"
  index: 0,                            // order within job
  duration: 3,                         // seconds
  output: [                            // terminal output lines
    { line: 1, text: "#!/bin/bash -eo pipefail", timestamp: "2026-04-10T08:25:05Z" },
    { line: 2, text: "Cloning into '.'...", timestamp: "2026-04-10T08:25:06Z" },
    { line: 3, text: "HEAD is now at a3f7b2c Fix responsive layout", timestamp: "2026-04-10T08:25:07Z" }
  ]
}
```

### TestResult (nested or linked to Job)

```javascript
{
  id: "test-1",
  jobId: "job-1",
  suiteName: "src/components/Dashboard.test.js",
  totalTests: 12,
  passed: 11,
  failed: 1,
  skipped: 0,
  duration: 4.5,                       // seconds
  failures: [
    {
      testName: "renders loading state correctly",
      className: "Dashboard",
      message: "Expected element to have class 'loading', but received 'loaded'",
      stackTrace: "at Object.<anonymous> (src/components/Dashboard.test.js:45:12)"
    }
  ]
}
```

### Artifact (linked to Job)

```javascript
{
  id: "art-1",
  jobId: "job-1",
  path: "coverage/lcov-report/index.html",
  url: "#",                            // mock URL
  size: 15234                          // bytes
}
```

### Context (organization-level shared secrets)

```javascript
{
  id: "ctx-1",
  name: "production-secrets",
  orgId: "org-1",
  createdAt: "2023-06-01T12:00:00Z",
  envVars: [
    { name: "AWS_ACCESS_KEY_ID", value: "****", createdAt: "2023-06-01T12:00:00Z" },
    { name: "AWS_SECRET_ACCESS_KEY", value: "****", createdAt: "2023-06-01T12:00:00Z" }
  ]
}
```

### EnvironmentVariable (project-level)

```javascript
{
  id: "env-1",
  projectId: "proj-1",
  name: "NPM_TOKEN",
  value: "xxxx...xxxx",               // masked, only last 4 chars shown
  createdAt: "2024-01-15T09:00:00Z"
}
```

### SSHKey (project-level)

```javascript
{
  id: "ssh-1",
  projectId: "proj-1",
  type: "deploy-key",                 // "deploy-key" | "additional"
  fingerprint: "SHA256:abc123...",
  hostname: "github.com",
  createdAt: "2024-01-15T09:00:00Z"
}
```

### Webhook (project-level)

```javascript
{
  id: "wh-1",
  projectId: "proj-1",
  name: "Slack Notification",
  url: "https://hooks.slack.com/services/...",
  events: ["workflow-completed"],      // "workflow-completed" | "job-completed"
  signingSecret: "****",
  createdAt: "2024-02-01T10:00:00Z"
}
```

### InsightsMetrics (computed/aggregated, not stored per-entity)

```javascript
{
  // Organization-level summary for a time window
  workflowRuns: 1247,
  totalDuration: 345600,              // seconds
  successRate: 87.3,                  // percentage
  totalCredits: 12450,
  // Per-workflow breakdown
  workflows: [
    {
      workflowName: "build-test-deploy",
      projectName: "frontend-app",
      runs: 342,
      successRate: 91.2,
      p50Duration: 185,               // seconds
      p95Duration: 420,               // seconds
      credits: 4200,
      mttr: 1800,                     // seconds (mean time to recovery)
      throughput: 12.3                 // runs per day
    }
  ]
}
```

---

## Relationships

```
Organization 1──* Project
Organization 1──* Context
Organization 1──* User (members)
Project 1──* Pipeline
Project 1──* EnvironmentVariable
Project 1──* SSHKey
Project 1──* Webhook
Pipeline 1──* Workflow
Workflow 1──* Job
Job 1──* Step (inline)
Job 1──* TestResult
Job 1──* Artifact
Job *──* Job (dependencies, via job.dependencies[])
```

---

## createInitialData() Structure

```javascript
function createInitialData() {
  return {
    organization: { /* single org object */ },
    currentUser: { /* logged-in user */ },
    users: [
      // 4 team members: alexj (admin), sarahm, mikec, lisap
    ],
    projects: [
      // 4 projects:
      // 1. "frontend-app" (GitHub, active, many pipelines)
      // 2. "backend-api" (GitHub, active)
      // 3. "mobile-app" (GitLab, some failures)
      // 4. "infrastructure" (Bitbucket, less active)
    ],
    pipelines: [
      // ~15-20 pipelines across projects, various states
      // Include: recent success, recent failure, currently running, queued, needs approval
    ],
    workflows: [
      // ~20-25 workflows, 1-3 per pipeline
      // Names: "build-test-deploy", "lint", "nightly-tests", "deploy-staging", "deploy-production"
      // Various statuses to demonstrate all states
    ],
    jobs: [
      // ~60-80 jobs across workflows
      // Common job names: "checkout", "install-deps", "lint", "unit-test", "integration-test",
      // "build", "deploy-staging", "hold-for-approval", "deploy-production"
      // Include approval-type jobs
      // Include jobs with dependencies (DAG structure)
    ],
    testResults: [
      // ~10 test result entries for test-type jobs
      // Mix of all-pass, some-failures, some-skipped
    ],
    artifacts: [
      // ~8 artifacts across various jobs
      // Types: coverage reports, build outputs, screenshots
    ],
    contexts: [
      // 2 contexts: "production-secrets", "staging-secrets"
    ],
    environmentVariables: [
      // ~6-8 env vars across projects
      // Common: NPM_TOKEN, AWS_ACCESS_KEY_ID, DATABASE_URL, SENTRY_DSN
    ],
    sshKeys: [
      // 2-3 SSH keys
    ],
    webhooks: [
      // 1-2 webhooks
    ],
    // Pre-computed insights data
    insights: {
      timeRange: "30d",
      summary: {
        workflowRuns: 1247,
        totalDuration: 345600,
        successRate: 87.3,
        totalCredits: 12450
      },
      workflowMetrics: [/* per-workflow metrics */],
      dailyData: [/* 30 days of { date, runs, successRate, avgDuration, credits } */]
    }
  };
}
```

### Seed Data Scenarios

The mock data must cover these scenarios for agent training:

1. **Currently running pipeline** — so agents can see live status and cancel
2. **Failed pipeline with failed job** — so agents can drill into failure logs
3. **Pipeline awaiting approval** — "on_hold" workflow with approval job
4. **Successful pipeline** — green status across the board
5. **Queued pipeline** — waiting to start
6. **Multi-workflow pipeline** — e.g., "lint" + "build-test-deploy" in one pipeline
7. **Complex DAG workflow** — jobs with fan-out/fan-in dependencies (e.g., build → [test-unit, test-e2e, test-integration] → deploy)
8. **Job with test failures** — test results tab shows failures
9. **Job with artifacts** — artifacts tab has downloadable files
10. **Multiple branches** — pipelines on "main", "develop", "feature/new-dashboard"
