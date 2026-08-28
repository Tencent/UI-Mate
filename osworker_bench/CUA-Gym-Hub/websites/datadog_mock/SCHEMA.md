# datadog_mock Schema

**Base URL**: `http://localhost:<port>/`
**Go Endpoint**: `GET /go?sid=<sid>` -> `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update Current**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | Object | `{id, name, email, avatar, org, role}` |
| `hosts` | Array | 12 host objects: `{id, hostname, aliases[], status, os, cloudProvider, region, instanceType, agentVersion, cpu, memory, ioWait, load15, apps[], tags[], metrics:{cpuHistory[], memoryHistory[], networkInHistory[], networkOutHistory[]}, createdAt}` |
| `services` | Array | 8 APM service objects: `{id, name, type, language, framework, env, team, status, requestsPerSec, avgLatencyMs, p50/p95/p99LatencyMs, errorRate, apdex, dependencies[], resources[], latencyHistory[], requestHistory[], errorHistory[]}` |
| `logs` | Array | 100 log entries: `{id, timestamp, service, source, host, status, message, tags[], attributes{}}` |
| `monitors` | Array | 15 monitors: `{id, name, type, status, query, message, tags[], priority, creator, created, modified, muted, groups[], overallState, thresholds{}}` |
| `dashboards` | Array | 5 dashboards: `{id, title, description, author, created, modified, isStarred, isReadOnly, tags[], widgets[], templateVariables[]}` |
| `events` | Array | 20 events: `{id, title, text, type, source, timestamp, tags[], priority}` |
| `slos` | Array | 4 SLOs: `{id, name, description, type, targetSli, currentSli, timeframe, status, errorBudgetRemaining, tags[], monitorIds[]}` |
| `selectedTimeRange` | String | One of: "Past 15 Minutes", "Past 1 Hour", "Past 4 Hours", "Past 1 Day", "Past 1 Week" |
| `selectedEnv` | String | "production" or "staging" |
| `sidebarCollapsed` | Boolean | Whether sidebar is collapsed |
| `activeDashboardId` | String | ID of active dashboard (default: "dash-1") |

### Default IDs
- Hosts: host-1 through host-12
- Services: svc-1 through svc-8
- Monitors: mon-1 through mon-15
- Dashboards: dash-1 through dash-5
- SLOs: slo-1 through slo-4
- Events: evt-1 through evt-20
- Logs: log-1 through log-100

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "monitors": [
      {"id":"mon-1","name":"Test Monitor","type":"metric","status":"Alert","query":"avg:system.cpu{*} > 90","message":"CPU too high","tags":["test"],"priority":1,"creator":"test@test.com","created":"2026-04-10T00:00:00Z","modified":"2026-04-10T00:00:00Z","muted":false,"groups":[],"overallState":"Alert","thresholds":{"alert":90,"warn":75}}
    ]
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Click sidebar nav item | (route change, no state field) |
| Toggle sidebar collapse | `sidebarCollapsed` |
| Change time range | `selectedTimeRange` |
| Star/unstar dashboard | `dashboards[].isStarred` |
| Create new dashboard | `dashboards` (new item added) |
| Edit dashboard title | `dashboards[].title` |
| Click "New Monitor" + fill form + Create | `monitors` (new item added) |
| Edit monitor name | `monitors[].name`, `monitors[].modified` |
| Mute/unmute monitor | `monitors[].muted` |
| Delete monitor | `monitors` (item removed) |
| Bulk mute monitors | `monitors[].muted` (multiple) |
| Bulk delete monitors | `monitors` (items removed) |
| Filter logs by status | (UI only, no state change) |
| Filter logs by service | (UI only, no state change) |
| Search logs | (UI only, no state change) |
| Filter hosts by env | (UI only, no state change) |
| Sort host table | (UI only, no state change) |
| Filter monitors by status tab | (UI only, no state change) |
| Search monitors | (UI only, no state change) |
| Filter APM services by env | (UI only, no state change) |
