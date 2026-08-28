# sentry_mock Schema

**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{files: [{url, original_name, stored_name, size}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content with Content-Type

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `organization` | object | `{id, name, slug, avatar, dateCreated, teams[], members[], projects[]}` |
| `currentUser` | object | `{id, name, email, avatar, role, teams[], dateJoined}` |
| `users` | array | All org members; each: `{id, name, email, avatar, role, teams[], dateJoined}` |
| `teams` | array | Each: `{id, name, slug, avatar, memberCount, members[], projects[]}` |
| `projects` | array | Each: `{id, name, slug, platform, color, teams[], dateCreated, stats{crashFreeSessions, crashFreeUsers, totalErrors24h, totalTransactions24h}, latestRelease, environments[]}` |
| `issues` | array | Each: `{id, shortId, title, subtitle, culprit, type, level, status, priority, isUnhandled, project, assignee, firstSeen, lastSeen, count, userCount, stats14d[], trend, events[], tags[], metadata{}}` — `status`: `"unresolved"`, `"resolved"`, `"archived"` — `priority`: `"critical"`, `"high"`, `"medium"`, `"low"` — `level`: `"error"`, `"warning"`, `"info"` |
| `events` | object | Keyed by issueId → array of event objects; each: `{id, title, message, timestamp, level, platform, tags[], user{}, contexts{}, breadcrumbs[], stackTrace{}}` |
| `alertRules` | array | Each: `{id, name, type, status, threshold, thresholdType, triggerLabel, dateTriggered, dateCreated, project, team, history[]}` — `type`: `"error"`, `"transaction"`, `"metric"` — `status`: `"triggered"`, `"resolved"`, `"warning"` |
| `releases` | array | Each: `{id, version, shortVersion, dateCreated, dateReleased, projects[], newIssues, crashFreeSessions, crashFreeUsers, adoption, totalSessions, commitCount, authors[], lastEvent}` |
| `dashboards` | array | Each: `{id, title, dateCreated, createdBy, widgets[]}` where widgets have `{id, title, displayType, queries[]}` |
| `transactions` | array | Each: `{id, name, project, tpm, p50, p75, p95, p99, failureRate, apdex, totalCount, stats24h[]}` |
| `selectedProject` | string | Active project filter: `"all"` or a project ID |
| `selectedEnvironment` | string | Active environment filter: `"all"` or environment name |
| `dateRange` | string | Date range filter: `"1h"`, `"24h"`, `"7d"`, `"14d"`, `"30d"`, `"90d"` |
| `issueListSort` | string | Issue list sort: `"lastSeen"`, `"firstSeen"`, `"count"`, `"userCount"`, `"priority"` |
| `issueListTab` | string | Issue list tab: `"unresolved"`, `"resolved"`, `"archived"`, `"all"` |
| `issueSearchQuery` | string | Issue search query text |
| `selectedIssues` | array | IDs of selected issues (for bulk actions) |
| `bookmarkedIssues` | array | IDs of bookmarked issues |

### Default IDs

**Users**: `user-1` (Jane Schmidt, Admin), `user-2` (Keith Ryan), `user-3` (Maria Chen, Manager), `user-4` (Alex Thompson), `user-5` (Sam Park)

**Teams**: `team-1` (Frontend), `team-2` (Backend), `team-3` (Infrastructure)

**Projects**: `proj-1` (javascript, React), `proj-2` (react-app, React), `proj-3` (flask-api, Python Flask), `proj-4` (spring-boot-5, Java Spring Boot)

**Issues**: `issue-1` through `issue-13` (13 issues across projects with varying status, priority, and counts)

**Alert Rules**: 8 rules across projects and types

**Releases**: `rel-1` through `rel-6`

**Dashboards**: `dash-1` (Frontend Overview), `dash-2` (Backend Performance)

**Transactions**: 10 transaction entries for performance monitoring

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "organization": {
      "id": "org-1",
      "name": "Empower Plant",
      "slug": "empower-plant",
      "avatar": null,
      "dateCreated": "2023-01-15T00:00:00Z",
      "teams": ["team-1"],
      "members": ["user-1"],
      "projects": ["proj-1"]
    },
    "currentUser": {
      "id": "user-1",
      "name": "Jane Schmidt",
      "email": "jane@empower-plant.io",
      "avatar": null,
      "role": "Admin",
      "teams": ["team-1"],
      "dateJoined": "2023-01-15T00:00:00Z"
    },
    "users": [
      {"id": "user-1", "name": "Jane Schmidt", "email": "jane@empower-plant.io", "avatar": null, "role": "Admin", "teams": ["team-1"], "dateJoined": "2023-01-15T00:00:00Z"}
    ],
    "teams": [
      {"id": "team-1", "name": "Frontend", "slug": "frontend", "avatar": null, "memberCount": 1, "members": ["user-1"], "projects": ["proj-1"]}
    ],
    "projects": [
      {"id": "proj-1", "name": "javascript", "slug": "javascript", "platform": "javascript-react", "color": "#F5B000", "teams": ["team-1"], "dateCreated": "2023-02-01T00:00:00Z", "stats": {"crashFreeSessions": 97.2, "crashFreeUsers": 98.5, "totalErrors24h": 342, "totalTransactions24h": 15200}, "latestRelease": "rel-1", "environments": ["production", "staging"]}
    ],
    "issues": [
      {"id": "issue-1", "shortId": "REACT-59F", "title": "TypeError", "subtitle": "'NoneType' object has no attribute 'split'", "culprit": "app/components/smartSearchBar/utils.tsx", "type": "error", "level": "error", "status": "unresolved", "priority": "critical", "isUnhandled": true, "project": "proj-1", "assignee": "user-1", "firstSeen": "2024-12-20T08:30:00Z", "lastSeen": "2025-04-09T14:22:00Z", "count": 8300, "userCount": 6600, "stats14d": [120, 95, 140, 110, 200, 180, 150, 170, 190, 210, 230, 185, 160, 145], "trend": "increasing", "events": [], "tags": [], "metadata": {}}
    ],
    "events": {},
    "alertRules": [],
    "releases": [],
    "dashboards": [],
    "transactions": [],
    "selectedProject": "all",
    "selectedEnvironment": "all",
    "dateRange": "14d",
    "issueListSort": "lastSeen",
    "issueListTab": "unresolved",
    "issueSearchQuery": "is:unresolved",
    "selectedIssues": [],
    "bookmarkedIssues": []
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Resolve issue (click Resolve button) | `issues[i].status` → `"resolved"` |
| Unresolve issue | `issues[i].status` → `"unresolved"` |
| Archive issue | `issues[i].status` → `"archived"` |
| Change issue assignee | `issues[i].assignee` updated to user ID or `null` |
| Change issue priority | `issues[i].priority` updated |
| Bookmark/unbookmark issue | `bookmarkedIssues` array toggled with issue ID |
| Add comment on issue | `comments[issueId]` array grows (if `comments` key exists in state) |
| Change issue list sort | `issueListSort` updated |
| Change issue list tab | `issueListTab` updated |
| Search issues | `issueSearchQuery` updated |
| Select/deselect issues | `selectedIssues` array updated |
| Filter by project | `selectedProject` updated |
| Filter by environment | `selectedEnvironment` updated |
| Change date range | `dateRange` updated |
| Bulk resolve issues | Multiple `issues[i].status` → `"resolved"`; `selectedIssues` → `[]` |
| Bulk archive issues | Multiple `issues[i].status` → `"archived"`; `selectedIssues` → `[]` |
| Merge issues | `issues` array shrinks; primary issue `count` increases; `selectedIssues` → `[]` |
