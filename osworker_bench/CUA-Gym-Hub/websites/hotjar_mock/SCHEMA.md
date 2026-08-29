# hotjar_mock Schema

**Base URL**: `http://localhost:<port>/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload**: `POST /upload?sid=<sid>` (multipart/form-data) → `{success, files:[{original_name, stored_name, size, content_type, url}]}`
**Serve file**: `GET /files/<sid>/<filename>`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | `{id, name, email, avatar, role, organizationId}` — the logged-in user |
| `organization` | object | `{id, name, plan}` — the org owning the account |
| `sites` | array | Each: `{id, name, url, trackingCode, createdAt, isActive}` — tracked websites |
| `activeSiteId` | string | ID of the currently selected site (drives all filtered views) |
| `heatmaps` | array | Each: `{id, siteId, name, pageUrl, status, createdAt, sessionsCount, deviceBreakdown{desktop,tablet,mobile}, screenshotUrl, clickData[], scrollData{averageFold,reachPercentages[]}, moveData[], pageStats{uTurns,rageClicks,dropOffRate,avgTimeOnPage,totalErrors}}` — `status` can be `"recording"`, `"paused"`, or `"completed"` |
| `recordings` | array | Each: `{id, siteId, visitorId, country, countryFlag, device, browser, os, screenSize, duration, pagesVisited, pagesList[], startedAt, frustrationScore, engagementScore, hasRageClicks, hasUTurns, hasErrors, isStarred, tags[], events[]}` — `device` one of `"desktop"`, `"tablet"`, `"mobile"` |
| `surveys` | array | Each: `{id, siteId, name, status, createdAt, responsesCount, questions[], appearance{position,color,widgetType}, behavior{showOnUrl,showAfterSeconds,showOnDevice,triggerEvent}, responses[]}` — `status` one of `"active"`, `"draft"`, `"paused"`, `"completed"` |
| `feedback` | array | Each: `{id, siteId, sentiment, emoji, message, page, submittedAt, device, browser, screenshotUrl}` — `sentiment` one of `"positive"`, `"negative"`, `"neutral"` |
| `funnels` | array | Each: `{id, siteId, name, createdAt, steps[{id,name,type,value,visitors,dropOffRate,conversionRate}]}` |
| `trends` | array | Each: `{id, siteId, name, metric, period, dataPoints[{date,value}]}` |
| `highlights` | array | Each: `{id, siteId, title, sourceType, sourceId, startTime, endTime, createdAt, createdBy, collectionId, notes}` |
| `highlightCollections` | array | Each: `{id, name, highlightIds[]}` |
| `events` | array | Each: `{id, siteId, name, type, firstSeen, lastSeen, totalCount}` — `type` one of `"custom"`, `"auto"` |
| `dashboardMetrics` | object | `{siteId, period, totalSessions, avgSessionDuration, avgPagesPerSession, sessionsSparkline[], durationSparkline[], pagesSparkline[], topClickedElements[], topPages[], rageClicksCount, uTurnsCount, feedbackPositive, feedbackNegative}` |
| `sidebarExpanded` | boolean | Whether the left sidebar is expanded (220px) or collapsed (56px) |
| `selectedDateRange` | string | Currently selected date range filter (e.g. `"last_30_days"`) |
| `activeFilters` | array | Active filter objects applied to views |

### questions[] shape
Each question: `{id, type, text, required, options[], scaleMax, logic}` — `type` one of `"reaction"`, `"nps"`, `"radio"`, `"checkbox"`, `"rating"`, `"long_text"`, `"short_text"`, `"email"`, `"statement"`

### responses[] shape
Each response: `{id, submittedAt, answers{questionId: answer}, visitorId, device, page}`

### events[] shape (recordings)
Each recording event: `{id, type, timestamp, page, details, x, y}` — `type` one of `"page_change"`, `"click"`, `"scroll"`, `"rage_click"`, `"u_turn"`, `"error"`, `"input"`

### Default IDs

**Sites**: `site-1` (Acme Store), `site-2` (Acme Blog)

**Heatmaps**: `heatmap-1` through `heatmap-6` (4 on site-1, 2 on site-2)

**Recordings**: `rec-1` through `rec-25` (all on site-1)

**Surveys**: `survey-1` (NPS, active), `survey-2` (Post-Purchase Satisfaction, active), `survey-3` (Feature Request, draft), `survey-4` (Onboarding Feedback, completed)

**Funnels**: `funnel-1` (Checkout Funnel), `funnel-2` (Signup Funnel)

**Highlights**: `highlight-1` through `highlight-5`; collections: `coll-1` (Sprint 12 UX Issues), `coll-2` (Checkout Flow Problems)

**Events**: `event-1` (add_to_cart) through `event-8` (form_submitted)

**User**: `user-1` (Alex Chen, alex.chen@acmecorp.com, Admin)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user-1",
      "name": "Alex Chen",
      "email": "alex.chen@acmecorp.com",
      "avatar": "https://ui-avatars.com/api/?name=Alex+Chen&background=FF3C00&color=fff",
      "role": "Admin",
      "organizationId": "org-1"
    },
    "organization": {"id": "org-1", "name": "Acme Corp", "plan": "Business"},
    "sites": [
      {"id": "site-1", "name": "Acme Store", "url": "https://www.acmestore.com", "trackingCode": "", "createdAt": "2024-09-15T10:00:00Z", "isActive": true}
    ],
    "activeSiteId": "site-1",
    "heatmaps": [],
    "recordings": [],
    "surveys": [],
    "feedback": [],
    "funnels": [],
    "trends": [],
    "highlights": [],
    "highlightCollections": [],
    "events": [],
    "dashboardMetrics": {
      "siteId": "site-1",
      "period": "last_30_days",
      "totalSessions": 0,
      "avgSessionDuration": "0:00",
      "avgPagesPerSession": 0,
      "sessionsSparkline": [],
      "durationSparkline": [],
      "pagesSparkline": [],
      "topClickedElements": [],
      "topPages": [],
      "rageClicksCount": 0,
      "uTurnsCount": 0,
      "feedbackPositive": 0,
      "feedbackNegative": 0
    },
    "sidebarExpanded": false,
    "selectedDateRange": "last_30_days",
    "activeFilters": []
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Switch active site from header dropdown | `activeSiteId` updated to new site ID |
| Toggle sidebar expand/collapse | `sidebarExpanded` toggled |
| Create new heatmap (type URL + Save) | `heatmaps` array grows by 1 (status `"recording"`) |
| Switch heatmap map type (click/move/scroll) | UI only — no state change |
| Switch heatmap device filter | UI only — no state change |
| Star/unstar a recording | `recordings[i].isStarred` toggled |
| Add tag to recording | `recordings[i].tags` array grows |
| Save comment/highlight from recording player | `highlights` array grows by 1 |
| Create new survey via builder | `surveys` array grows by 1 (status `"draft"`) |
| Delete survey | `surveys` array shrinks by 1 |
| Toggle survey status (pause/activate) | `surveys[i].status` updated |
| Add funnel step | `funnels[i].steps` array grows |
| Remove funnel step | `funnels[i].steps` array shrinks |
| Save settings (name change) | UI only — `currentUser.name` NOT currently persisted (bug) |
