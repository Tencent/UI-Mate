# amplitude_mock Schema

**Base URL**: `http://localhost:5173/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{initial_state, current_state, state_diff}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | Active user: `{id, name, email, avatar, organization, role, plan, mtuUsed, mtuLimit}` |
| `users` | array | Tracked product users; each: `{id, userId, amplitudeId, displayName, avatar, firstSeen, lastSeen, country, countryFlag, platform, deviceType, os, browser, library, properties{plan, company, role, signupSource}}` |
| `eventDefinitions` | array | Event catalog; each: `{id, name, displayName, description, category, status, createdAt, createdBy, occurrencesLast30d, icon, color, properties[]}` |
| `events` | array | Raw event stream; each: `{id, name, userId, timestamp, sessionId, properties{}}` |
| `charts` | array | Saved/draft charts; each: `{id, name, description, type, status, owner, ownerEmail, createdAt, updatedAt, dashboardIds[], notebookIds[], config{}, data{}}` |
| `charts[].config` | object | `{events[], measuredAs, segments[], chartVisualization, timeRange, interval, groupSegmentBy, formula}` for segmentation; `{steps[], conversionWindow, countingMethod, segments[]}` for funnel; `{startEvent, returnEvent, retentionType, interval, segments[]}` for retention |
| `charts[].data` | object | Segmentation: `{series[{name, color, dataPoints[{date,value}]}], breakdownTable[{segment, values{}, rowAverage}]}`; Funnel: `{steps[{name, count, percentage}], overallConversion, medianTime}`; Retention: `{curve[{day, percentage, count}]}` |
| `dashboards` | array | Each: `{id, name, description, owner, ownerEmail, isOfficial, createdAt, updatedAt, chartIds[], layout[], space}` |
| `cohorts` | array | Each: `{id, name, description, owner, createdAt, updatedAt, userCount, lastComputed, definition{conditions[], combinator}}` |
| `notebooks` | array | Each: `{id, name, owner, space, createdAt, updatedAt, viewCount, blocks[{id, type, chartId}]}` |
| `experiments` | array | Each: `{id, name, type, subtype, status, owner, createdAt, variants[{id, name, isControl, rolloutPercent}], goals[], pages[], targeting{}, rolloutPercent, results}` |
| `spaces` | array | Each: `{id, name, owner, isPersonal, contentIds[]}` |
| `homeMetrics` | object | `{visitors{value,delta,deltaType}, pageViews{...}, bounceRate{...}, pageViewsPerSession{...}, currentLiveUsers, newUsersToday, avgSessionDuration, topPages[{title,volume}], usersByCountry[{country,flag,users}], webEngagementSeries[{date,value}]}` |
| `templates` | array | Display-only; each: `{id, name, type, chartCount}` |
| `ui` | object | `{sidebarExpanded, activeSidebarItem, expandedSections[], currentProject}` |

### Default IDs

**Charts**: `chart_001` (Page Views by Unique Users), `chart_002` (Daily Active Users), `chart_003` (Conversion to Active Users — funnel), `chart_004` (User Retention — retention), `chart_005` (Event Breakdown by Type — pie), `chart_006` (Weekly Page Views — bar)

**Dashboards**: `dash_001` (Product KPIs — charts 001, 003), `dash_002` (Web Engagement — charts 001, 002, 005)

**Users**: `user_001` (alice@example.com, US, Web) through `user_008` (henry@mediagroup.com, UK, iOS)

**Cohorts**: `cohort_001` (All Users), `cohort_002` (Power Users), `cohort_003` (New Users Last 7d), `cohort_004` (US Users)

**Notebooks**: `notebook_001` (SLMobbin Notes)

**Experiments**: `exp_001` (Homepage CTA Test — draft), `exp_002` (Pricing Page Test — completed)

**Spaces**: `space_001` (Sam Lee's Space), `space_002` (Product Team)

**Event Definitions**: `evtdef_001` (Page Viewed) through `evtdef_008` (End Session)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "ampuser_001",
      "name": "Sam Lee",
      "email": "samlee@example.com",
      "avatar": null,
      "organization": "AcmeTech",
      "role": "Admin",
      "plan": "Free",
      "mtuUsed": 4,
      "mtuLimit": 50000
    },
    "charts": [
      {
        "id": "chart_001",
        "name": "Page Views by Unique Users (Last 30 Days)",
        "type": "segmentation",
        "status": "saved",
        "owner": "Sam Lee",
        "ownerEmail": "samlee@example.com",
        "createdAt": "2024-12-10T09:00:00",
        "updatedAt": "2024-12-16T14:30:00",
        "dashboardIds": ["dash_001"],
        "notebookIds": [],
        "config": {
          "events": [{"letter": "A", "eventName": "Page Viewed", "filters": [], "groupBy": null}],
          "measuredAs": "uniques",
          "segments": [{"id": "seg_1", "name": "All Users", "filters": [], "cohortId": null}],
          "chartVisualization": "line",
          "timeRange": "30d",
          "interval": "daily"
        },
        "data": {
          "series": [{"name": "All Users", "color": "#1E61F0", "dataPoints": [{"date": "2024-11-16", "value": 0}]}],
          "breakdownTable": []
        }
      }
    ],
    "cohorts": [],
    "ui": {"sidebarExpanded": true, "activeSidebarItem": "home", "expandedSections": [], "currentProject": "default"}
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Save chart (draft → saved) | `charts[i].status` → `"saved"`; `charts[i].updatedAt` updated; new chart added to `charts[]` if new |
| Delete chart | `charts[]` array shrinks by 1 |
| Change chart visualization | `charts[i].config.chartVisualization` updated (after Save) |
| Change chart time range | `charts[i].config.timeRange` updated (after Save) |
| Change chart interval | `charts[i].config.interval` updated (after Save) |
| Change measured-as | `charts[i].config.measuredAs` updated (after Save) |
| Add event to chart | `charts[i].config.events[]` grows (after Save) |
| Rename chart title | `charts[i].name` updated (after Save) |
| Create cohort | `cohorts[]` array grows by 1 |
| Rename dashboard | `dashboards[i].name` updated; `updatedAt` refreshed |
| Remove chart from dashboard | `dashboards[i].chartIds[]` shrinks |
| Toggle sidebar | `ui.sidebarExpanded` toggled |
| Expand/collapse sidebar section | `ui.expandedSections[]` modified |
| Navigate (sidebar click) | `ui.activeSidebarItem` updated |
