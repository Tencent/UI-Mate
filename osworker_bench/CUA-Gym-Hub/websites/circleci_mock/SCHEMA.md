# circleci_mock Schema

**Base URL**: `http://localhost:<port>/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `organization` | object | `{id, name, slug, avatarUrl, plan, createdAt, creditBalance, creditsUsed}` |
| `currentUser` | object | Active user — same shape as `users[]` entry |
| `users` | array | Each: `{id, name, username, email, avatarUrl, role, createdAt}` — `role` is `"admin"` or `"member"` |
| `projects` | array | Each: `{id, name, slug, vcsProvider, vcsUrl, defaultBranch, isFollowed, lastBuildStatus, lastBuildAt, createdAt, settings}` — `settings`: `{buildForkPRs, passSecretsToForks, onlyBuildPRs, autoCancelRedundant}` |
| `pipelines` | array | Each: `{id, projectId, number, state, trigger, vcs, createdAt, updatedAt}` — `trigger`: `{type, actor: {login, avatarUrl}}` — `vcs`: `{branch, commitHash, commitMessage, commitAuthor}` |
| `workflows` | array | Each: `{id, pipelineId, projectId, name, status, startedAt, stoppedAt, duration, creditsUsed, createdAt}` — `status`: `"success"`, `"failed"`, `"running"`, `"queued"`, `"on_hold"`, `"canceled"` |
| `jobs` | array | Each: `{id, workflowId, pipelineId, projectId, name, type, status, jobNumber, executor, parallelism, dependencies[], startedAt, stoppedAt, duration, creditsUsed, createdAt, steps[]}` — `type`: `"build"` or `"approval"` — `executor`: `{type, resourceClass}` — `steps[]`: `{id, name, status, index, duration, output[{line, text, timestamp}]}` |
| `testResults` | array | Each: `{id, jobId, suiteName, totalTests, passed, failed, skipped, duration, failures[]}` — `failures[]`: `{testName, className, message, stackTrace}` |
| `artifacts` | array | Each: `{id, jobId, path, url, size}` |
| `contexts` | array | Each: `{id, name, orgId, createdAt, envVars[]}` — `envVars[]`: `{id, name, value, createdAt}` |
| `environmentVariables` | array | Each: `{id, projectId, name, value, createdAt}` — value is masked (e.g., `"xxxx...1a2b"`) |
| `sshKeys` | array | Each: `{id, projectId, type, fingerprint, hostname, createdAt}` — `type`: `"deploy-key"` or `"additional"` |
| `webhooks` | array | Each: `{id, projectId, name, url, events[], signingSecret, createdAt}` |
| `insights` | object | `{timeRange, summary, workflowMetrics[], dailyData[]}` — `summary`: `{workflowRuns, totalDuration, successRate, totalCredits}` — `workflowMetrics[]`: `{workflowName, projectName, runs, successRate, p50Duration, p95Duration, credits, mttr, throughput}` — `dailyData[]`: `{date, runs, successRate, avgDuration, credits}` |
| `pipelineFilters` | object | `{ownership, projectId, branch}` — `ownership`: `"everyone"` or `"mine"` |
| `searchQuery` | string | Current sidebar search input value |
| `resourceClasses` | array | Each: `{id, name, description, createdAt}` — self-hosted runner resource class definitions |
| `runnerInstances` | array | Each: `{id, name, resourceClassId, resourceClassName, version, platform, status, ip, lastContactAt}` — `status`: `"online"` or `"offline"` |
| `deployEnvironments` | array | Each: `{id, name, status, version, commit, deployedAt, url}` — `status`: `"success"`, `"running"`, `"failed"` |

### Default IDs

**Organization**: `org-1` (Acme Corp, performance plan)

**Users**: `user-1` (Alex Johnson / alexj, admin, currentUser), `user-2` (Sarah Martinez / sarahm), `user-3` (Mike Chen / mikec), `user-4` (Lisa Park / lisap)

**Projects**: `proj-1` (frontend-app, github), `proj-2` (backend-api, github), `proj-3` (mobile-app, gitlab), `proj-4` (infrastructure, bitbucket)

**Pipelines**: `pipe-1` through `pipe-15` across all projects

**Workflows**: `wf-1` through `wf-17` (build-test-deploy, lint, nightly-tests, deploy-staging, deploy-production, terraform-plan-apply)

**Jobs**: `job-1` through `job-34` (fan-out/fan-in patterns, approval gates at `job-8`, `job-33`)

**Contexts**: `ctx-1` (production-secrets), `ctx-2` (staging-secrets)

**SSH Keys**: `ssh-1` (proj-1 deploy key), `ssh-2` (proj-2 deploy key), `ssh-3` (proj-4 additional key)

**Webhooks**: `wh-1` (proj-1 Slack Notification), `wh-2` (proj-2 PagerDuty Alert)

**Resource Classes**: `rc-1` (acme-corp/docker-runner), `rc-2` (acme-corp/macos-runner)

**Runner Instances**: `ri-1`, `ri-2`, `ri-3` (docker-runner instances), `ri-4` (macos-runner instance)

**Deploy Environments**: `deploy-env-1` (Production), `deploy-env-2` (Staging), `deploy-env-3` (Development)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "organization": {
      "id": "org-1",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "plan": "performance",
      "creditBalance": 50000,
      "creditsUsed": 12450
    },
    "currentUser": {
      "id": "user-1",
      "name": "Alex Johnson",
      "username": "alexj",
      "role": "admin"
    },
    "users": [
      {"id": "user-1", "name": "Alex Johnson", "username": "alexj", "role": "admin"}
    ],
    "projects": [
      {
        "id": "proj-1",
        "name": "frontend-app",
        "slug": "gh/acme-corp/frontend-app",
        "vcsProvider": "github",
        "vcsUrl": "https://github.com/acme-corp/frontend-app",
        "defaultBranch": "main",
        "isFollowed": true,
        "lastBuildStatus": "success",
        "settings": {"buildForkPRs": false, "passSecretsToForks": false, "onlyBuildPRs": false, "autoCancelRedundant": true}
      }
    ],
    "pipelines": [
      {
        "id": "pipe-1",
        "projectId": "proj-1",
        "number": 1847,
        "state": "created",
        "trigger": {"type": "webhook", "actor": {"login": "alexj", "avatarUrl": null}},
        "vcs": {"branch": "main", "commitHash": "a3f7b2c", "commitMessage": "Fix layout", "commitAuthor": "alexj"},
        "createdAt": "2026-04-10T08:25:00Z"
      }
    ],
    "workflows": [
      {"id": "wf-1", "pipelineId": "pipe-1", "projectId": "proj-1", "name": "build-test-deploy", "status": "success", "startedAt": "2026-04-10T08:25:00Z", "stoppedAt": "2026-04-10T08:27:00Z", "duration": 120, "creditsUsed": 14}
    ],
    "jobs": [],
    "testResults": [],
    "artifacts": [],
    "contexts": [],
    "environmentVariables": [],
    "sshKeys": [],
    "webhooks": [],
    "insights": {"timeRange": "30d", "summary": {"workflowRuns": 100, "totalDuration": 86400, "successRate": 90.0, "totalCredits": 5000}, "workflowMetrics": [], "dailyData": []},
    "pipelineFilters": {"ownership": "everyone", "projectId": "all", "branch": "all"},
    "searchQuery": ""
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Rerun pipeline | `pipelines` array grows by 1; `workflows` array grows by N (one per original workflow) |
| Rerun workflow | `workflows` array grows by 1 with `status: "running"` |
| Cancel workflow | `workflows[i].status` → `"canceled"`; affected `jobs[].status` → `"canceled"` |
| Approve job (approval gate) | `jobs[i].status` → `"success"` (approval job); blocked downstream jobs → `"running"` |
| Deny job (approval gate) | `jobs[i].status` → `"failed"`; `workflows[i].status` → `"failed"`; downstream blocked → `"not_run"` |
| Follow project | `projects[i].isFollowed` → `true` |
| Unfollow project | `projects[i].isFollowed` → `false` |
| Add environment variable | `environmentVariables` grows by 1 |
| Delete environment variable | `environmentVariables` shrinks by 1 |
| Add SSH key | `sshKeys` grows by 1 |
| Delete SSH key | `sshKeys` shrinks by 1 |
| Add webhook | `webhooks` grows by 1 |
| Delete webhook | `webhooks` shrinks by 1 |
| Toggle advanced project setting | `projects[i].settings[key]` toggled |
| Create context | `contexts` grows by 1 |
| Delete context | `contexts` shrinks by 1 |
| Add context env var | `contexts[i].envVars` grows by 1 |
| Delete context env var | `contexts[i].envVars` shrinks by 1 |
| Change insights time range | `insights.timeRange` updated |
| Change pipeline filter | `pipelineFilters.ownership`, `.projectId`, or `.branch` updated |
| Type in search box | `searchQuery` updated (via SET_SEARCH_QUERY) |
| Create resource class | `resourceClasses` grows by 1 |
| Delete resource class | `resourceClasses` shrinks by 1 |
| Redeploy environment | `deployEnvironments[i].status` → `"running"` then `"success"` (after 3s timeout) |
