# mixpanel_mock Schema

**Base URL**: `http://localhost:<port>/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | `{id, name, email, avatar, role, orgName}` — logged-in user; role is "Admin" |
| `project` | object | `{id, name, dataView, timezone, createdAt}` — active project context |
| `events` | array | Raw event stream; each: `{id, eventName, displayName, distinctId, time, city, country, region, operatingSystem, browser, browserVersion, currentUrl, deviceId, properties{}}` |
| `userProfiles` | array | Each: `{id, name, email, distinctId, avatar, countryCode, region, city, lastSeen, createdAt, properties{Plan, Sign Up Date, Total Sessions, Device Type}}` |
| `boards` | array | Each: `{id, name, description, isPinned, isFavorite, isStarter, createdBy, createdAt, updatedAt, items[]}` where each item is `{id, type("report"\|"text"), reportId?, title?, content?, position{x,y,w,h}}` |
| `reports` | array | Each: `{id, name, type("insights"\|"funnels"\|"flows"\|"retention"), boardId, createdBy, createdAt, updatedAt, dateRange{start,end,preset}, granularity, chartType, metrics[], filters[], breakdowns[], chartData{labels[],series[]}, tableData{columns[],rows[]}}` — funnels reports have `steps[]`, `conversionCriteria`, `funnelData`; flows have `flowData.nodes[]`; retention have `retentionData.cohorts[]` |
| `lexicon` | array | Each: `{id, category("events"), eventName, displayName, description, thirtyDayQueries, status("Visible"\|"Hidden"), tags[], type("auto"\|"custom")}` |
| `cohorts` | array | Each: `{id, name, description, userCount, createdAt}` |
| `sessionReplays` | array | Each: `{id, distinctId, visitDuration, eventCount, timestamp, url, entryUrl, exitUrl, operatingSystem, browser, sourceSDK, avatar, events[{time, name, count, country}]}` |
| `annotations` | array | Each: `{id, date, text, createdBy}` |
| `settings` | object | `{org{name,plan,monthlyEvents,monthlyReplays}, project{name,timezone,dataRetention}, profile{id,name,email,avatar}, teams[{id,name,members[],projects[{name,role}]}], orgMembers[{id,name,email,role,dateJoined,lastActive}]}` |

### Default IDs

**Boards**: `board_001` (Main Dashboard, pinned+favorite), `board_002` (Starter Board, pinned), `board_003` (Core User Metrics), `board_004` (Web Analytics Sample Template)

**Reports**: `report_001` (User Growth & Engagement, insights/line), `report_002` (Daily Active Users, insights/metric), `report_003` (Registered users conversion rate, funnels), `report_004` (Weekly Retention, retention), `report_005` (User Journey Flow, flows), `report_006` (Top Events by Volume, insights/column), `report_007` (Signup Funnel, funnels)

**Events**: `evt_001` through `evt_060` (60 events across 30 days)

**User Profiles**: `profile_001` (sam lee) through `profile_008` (Priya Patel)

**Lexicon**: `lex_001` through `lex_012`

**Cohorts**: `cohort_001` through `cohort_004`

**Session Replays**: `replay_001` through `replay_005`

**Org Members**: `user_001` (Sam Lee, Owner), `user_002` (John Smith), `user_003` (Jane Doe)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user_001",
      "name": "Sam Lee",
      "email": "samlee@example.com",
      "avatar": null,
      "role": "Admin",
      "orgName": "SLMobbin"
    },
    "project": {
      "id": "proj_001",
      "name": "SLMobbin",
      "dataView": "All Project Data",
      "timezone": "US/Pacific",
      "createdAt": "2025-06-15T00:00:00Z"
    },
    "boards": [
      {
        "id": "board_001",
        "name": "Main Dashboard",
        "description": "A central view of user activity",
        "isPinned": true,
        "isFavorite": true,
        "isStarter": false,
        "createdBy": "user_001",
        "createdAt": "2025-12-23T10:00:00Z",
        "updatedAt": "2026-01-22T10:00:00Z",
        "items": [
          {"id": "bitem_001", "type": "report", "reportId": "report_001", "position": {"x": 0, "y": 0, "w": 6, "h": 4}, "title": "User Growth"}
        ]
      }
    ],
    "reports": [
      {
        "id": "report_001",
        "name": "User Growth & Engagement",
        "type": "insights",
        "boardId": "board_001",
        "createdBy": "user_001",
        "createdAt": "2026-01-16T10:00:00Z",
        "updatedAt": "2026-01-22T10:00:00Z",
        "dateRange": {"start": "2026-01-16", "end": "2026-01-22", "preset": "7D"},
        "granularity": "Day",
        "chartType": "line",
        "metrics": [
          {"id": "metric_a", "label": "A", "name": "Uniques of All Events", "events": [{"id": "mevt_001", "name": "All Events", "color": "#7B5CFF"}], "measurement": "Uniques"}
        ],
        "filters": [],
        "breakdowns": [],
        "chartData": {
          "labels": ["Jan 16", "Jan 17", "Jan 18", "Jan 19", "Jan 20", "Jan 21", "Jan 22"],
          "series": [{"name": "A. Uniques of All Events", "color": "#7B5CFF", "data": [2, 12, 95, 80, 45, 30, 8]}]
        },
        "tableData": {"columns": ["Metric", "Average"], "rows": []}
      }
    ],
    "events": [],
    "userProfiles": [],
    "lexicon": [],
    "cohorts": [],
    "sessionReplays": [],
    "annotations": [],
    "settings": {
      "org": {"name": "SLMobbin", "plan": "Growth", "monthlyEvents": "1M", "monthlyReplays": "20K"},
      "project": {"name": "SLMobbin", "timezone": "US/Pacific", "dataRetention": "180 days"},
      "profile": {"id": "user_001", "name": "Sam Lee", "email": "samlee@example.com", "avatar": null},
      "teams": [],
      "orgMembers": []
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Toggle board favorite (heart icon in header) | `boards[i].isFavorite` toggled |
| Edit board title (click title, type, press Enter/blur) | `boards[i].name` updated |
| Add report card to board via "+ Add content" | `boards[i].items` array grows; `reports` array grows with new report entry |
| Add text block to board via "+ Add content" | `boards[i].items` array grows with `type: "text"` item |
| Create new report via sidebar "+ Create New" | `reports` array grows with new entry; `boardId: null` |
| Change date preset on board/report page | `reports[i].dateRange.preset` updated |
| Change granularity (Day/Week/Month) on Insights | `reports[i].granularity` updated |
| Change chart type (Line/Bar/Pie) on Insights | `reports[i].chartType` updated |
| Change metric measurement in query panel | `reports[i].metrics[j].measurement` updated |
| Save profile name in Settings > Profile | `settings.profile.name` updated |
| Search profiles in Users page (client-side filter only) | No state change — local UI state only |
| Select session replay in Session Replay | No state change — local UI state only |
| Toggle sidebar collapse | No state change — local React state only (not persisted) |
| Expand/collapse event row in Events page | No state change — local UI state only |
| Filter lexicon by status | No state change — local UI state only |
