# Xotjar Mock -- Data Model

This document defines all entity types, their fields, relationships, and example values for the `dataManager.js` `createInitialData()` function.

---

## 1. CurrentUser

The pre-logged-in user.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"user-1"` |
| name | string | `"Alex Chen"` |
| email | string | `"alex.chen@acmecorp.com"` |
| avatar | string | `"https://ui-avatars.com/api/?name=Alex+Chen&background=FF3C00&color=fff"` |
| role | string | `"Admin"` |
| organizationId | string | `"org-1"` |

---

## 2. Organization

| Field | Type | Example |
|-------|------|---------|
| id | string | `"org-1"` |
| name | string | `"Acme Corp"` |
| plan | string | `"Business"` |

---

## 3. Sites

Tracked websites/projects. The site selector in the header switches between these.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"site-1"` |
| name | string | `"Acme Store"` |
| url | string | `"https://www.acmestore.com"` |
| trackingCode | string | `"<!-- Xotjar Tracking Code -->\n<script>..."` |
| createdAt | string (ISO) | `"2024-09-15T10:00:00Z"` |
| isActive | boolean | `true` |

Seed: 2 sites (`"Acme Store"`, `"Acme Blog"`)

---

## 4. Heatmaps

| Field | Type | Example |
|-------|------|---------|
| id | string | `"heatmap-1"` |
| siteId | string | `"site-1"` |
| name | string | `"Homepage - Above the Fold"` |
| pageUrl | string | `"https://www.acmestore.com/"` |
| status | enum | `"recording"` / `"paused"` / `"completed"` |
| createdAt | string (ISO) | `"2025-01-10T14:30:00Z"` |
| sessionsCount | number | `7376` |
| deviceBreakdown | object | `{ desktop: 5420, tablet: 1203, mobile: 753 }` |
| screenshotUrl | string | `"/mock-screenshots/homepage.png"` (placeholder) |
| clickData | array | See ClickPoint below |
| scrollData | object | `{ averageFold: 62, reachPercentages: [100, 95, 88, 75, 60, 42, 28, 15] }` |
| moveData | array | Similar to clickData but for mouse movement |
| pageStats | object | See PageStats below |

### ClickPoint (embedded in heatmap)
| Field | Type | Example |
|-------|------|---------|
| x | number (%) | `32.5` |
| y | number (%) | `18.2` |
| clicks | number | `734` |
| percentage | number | `10.1` |
| elementSelector | string | `".hero-cta-button"` |

### PageStats (embedded in heatmap)
| Field | Type | Example |
|-------|------|---------|
| uTurns | number | `245` |
| rageClicks | number | `89` |
| dropOffRate | number | `34.2` |
| avgTimeOnPage | string | `"2:45"` |
| totalErrors | number | `12` |

Seed: 6 heatmaps across 2 sites, with various statuses and realistic click/scroll data points.

---

## 5. Recordings (Sessions)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"rec-1"` |
| siteId | string | `"site-1"` |
| visitorId | string | `"V-8A3F2B"` |
| country | string | `"US"` |
| countryFlag | string | `"us"` |
| device | enum | `"desktop"` / `"tablet"` / `"mobile"` |
| browser | string | `"Chrome 120"` |
| os | string | `"Windows 11"` |
| screenSize | string | `"1920x1080"` |
| duration | number (seconds) | `187` |
| pagesVisited | number | `5` |
| pagesList | array of strings | `["/", "/products", "/products/widget", "/cart", "/checkout"]` |
| startedAt | string (ISO) | `"2025-03-15T09:23:00Z"` |
| frustrationScore | number (0-5) | `3` |
| engagementScore | number (0-5) | `4` |
| hasRageClicks | boolean | `true` |
| hasUTurns | boolean | `false` |
| hasErrors | boolean | `true` |
| events | array | See RecordingEvent below |
| isStarred | boolean | `false` |
| tags | array of strings | `["bug", "checkout-issue"]` |

### RecordingEvent (embedded in recording)
| Field | Type | Example |
|-------|------|---------|
| id | string | `"evt-1"` |
| type | enum | `"click"` / `"scroll"` / `"rage_click"` / `"u_turn"` / `"page_change"` / `"error"` / `"input"` |
| timestamp | number (ms from start) | `4500` |
| page | string | `"/products"` |
| details | string | `"Clicked .add-to-cart-btn"` |
| x | number (%) | `45.2` (cursor position, for simulated playback) |
| y | number (%) | `67.8` |

Seed: 25 recordings with varied frustration/engagement scores, devices, browsers, countries, and realistic event timelines of 5-20 events each.

---

## 6. Surveys

| Field | Type | Example |
|-------|------|---------|
| id | string | `"survey-1"` |
| siteId | string | `"site-1"` |
| name | string | `"Post-Purchase Satisfaction"` |
| status | enum | `"active"` / `"draft"` / `"paused"` / `"completed"` |
| createdAt | string (ISO) | `"2025-02-01T10:00:00Z"` |
| responsesCount | number | `342` |
| questions | array | See SurveyQuestion below |
| appearance | object | `{ position: "bottom-right", color: "#FF3C00", widgetType: "popover" }` |
| behavior | object | `{ showOnUrl: "*", showAfterSeconds: 5, showOnDevice: "all", triggerEvent: null }` |
| responses | array | See SurveyResponse below |

### SurveyQuestion (embedded in survey)
| Field | Type | Example |
|-------|------|---------|
| id | string | `"q-1"` |
| type | enum | `"reaction"` / `"long_text"` / `"short_text"` / `"email"` / `"radio"` / `"checkbox"` / `"nps"` / `"rating"` / `"statement"` |
| text | string | `"How satisfied are you with your purchase?"` |
| required | boolean | `true` |
| options | array of strings | `["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]` (for radio/checkbox) |
| scaleMax | number | `5` or `7` or `10` (for rating/NPS) |
| logic | object or null | `{ "Very Dissatisfied": "q-3", "default": "next" }` |

### SurveyResponse (embedded in survey)
| Field | Type | Example |
|-------|------|---------|
| id | string | `"resp-1"` |
| submittedAt | string (ISO) | `"2025-03-10T14:22:00Z"` |
| answers | object | `{ "q-1": "Satisfied", "q-2": "Great product, fast shipping" }` |
| visitorId | string | `"V-2C4E8F"` |
| device | string | `"mobile"` |
| page | string | `"/order-confirmation"` |

Seed: 4 surveys (1 active NPS, 1 active multi-question, 1 draft, 1 completed), each with 5-15 sample responses.

---

## 7. Feedback

| Field | Type | Example |
|-------|------|---------|
| id | string | `"fb-1"` |
| siteId | string | `"site-1"` |
| sentiment | enum | `"positive"` / `"negative"` / `"neutral"` |
| emoji | string | `"happy"` / `"sad"` / `"confused"` / `"neutral"` / `"love"` |
| message | string | `"Love the new checkout flow!"` |
| page | string | `"https://www.acmestore.com/checkout"` |
| submittedAt | string (ISO) | `"2025-03-14T16:45:00Z"` |
| device | string | `"desktop"` |
| browser | string | `"Firefox 122"` |
| screenshotUrl | string | `null` or placeholder URL |

Seed: 20 feedback items with mixed sentiments, spread across various pages.

---

## 8. Funnels

| Field | Type | Example |
|-------|------|---------|
| id | string | `"funnel-1"` |
| siteId | string | `"site-1"` |
| name | string | `"Checkout Funnel"` |
| createdAt | string (ISO) | `"2025-01-20T09:00:00Z"` |
| steps | array | See FunnelStep below |

### FunnelStep (embedded in funnel)
| Field | Type | Example |
|-------|------|---------|
| id | string | `"step-1"` |
| name | string | `"Product Page"` |
| type | enum | `"page_url"` / `"event"` |
| value | string | `"/products/*"` or `"add_to_cart"` |
| visitors | number | `4200` |
| dropOffRate | number | `22.5` |
| conversionRate | number | `77.5` |

Seed: 2 funnels (Checkout Funnel with 4 steps, Signup Funnel with 3 steps).

---

## 9. Trends

| Field | Type | Example |
|-------|------|---------|
| id | string | `"trend-1"` |
| siteId | string | `"site-1"` |
| name | string | `"Daily Sessions"` |
| metric | string | `"sessions"` / `"pageviews"` / `"rage_clicks"` / `"avg_session_duration"` |
| period | string | `"last_30_days"` |
| dataPoints | array | `[{ date: "2025-03-01", value: 1250 }, { date: "2025-03-02", value: 1340 }, ...]` |

Seed: 3 trend charts with 30 data points each.

---

## 10. Highlights

| Field | Type | Example |
|-------|------|---------|
| id | string | `"highlight-1"` |
| siteId | string | `"site-1"` |
| title | string | `"Checkout rage click issue"` |
| sourceType | enum | `"recording"` / `"heatmap"` |
| sourceId | string | `"rec-5"` |
| startTime | number (ms) | `12000` (for recordings) |
| endTime | number (ms) | `18000` |
| createdAt | string (ISO) | `"2025-03-12T11:00:00Z"` |
| createdBy | string | `"user-1"` |
| collectionId | string or null | `"coll-1"` |
| notes | string | `"User keeps clicking disabled submit button"` |

### HighlightCollection
| Field | Type | Example |
|-------|------|---------|
| id | string | `"coll-1"` |
| name | string | `"Sprint 12 UX Issues"` |
| highlightIds | array of strings | `["highlight-1", "highlight-2"]` |

Seed: 5 highlights, 2 collections.

---

## 11. Events

Custom tracked events on the site.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"event-1"` |
| siteId | string | `"site-1"` |
| name | string | `"add_to_cart"` |
| type | enum | `"custom"` / `"auto"` |
| firstSeen | string (ISO) | `"2024-11-01T00:00:00Z"` |
| lastSeen | string (ISO) | `"2025-03-15T23:59:00Z"` |
| totalCount | number | `15420` |

Seed: 8 events (add_to_cart, checkout_started, signup_completed, page_scroll_50, video_played, search_used, filter_applied, form_submitted).

---

## 12. DashboardMetrics (Aggregated)

Pre-computed metrics for the dashboard view. Stored as a single object per site.

| Field | Type | Example |
|-------|------|---------|
| siteId | string | `"site-1"` |
| period | string | `"last_30_days"` |
| totalSessions | number | `12458` |
| avgSessionDuration | string | `"3:03"` |
| avgPagesPerSession | number | `4.2` |
| sessionsSparkline | array of numbers | `[380, 420, 395, 450, ...]` (30 values) |
| durationSparkline | array of numbers | `[180, 175, 192, 188, ...]` (30 values, in seconds) |
| pagesSparkline | array of numbers | `[4.1, 4.3, 4.0, 4.5, ...]` (30 values) |
| topClickedElements | array | `[{ name: "How this works", sessions: 3, url: "#" }, ...]` |
| topPages | array | `[{ url: "/", label: "Homepage" }, { url: "/products", label: "Products" }, ...]` |
| rageClicksCount | number | `89` |
| uTurnsCount | number | `245` |
| feedbackPositive | number | `156` |
| feedbackNegative | number | `34` |

---

## Relationships

```
Organization (1) ---> (N) Sites
Site (1) ---> (N) Heatmaps
Site (1) ---> (N) Recordings
Site (1) ---> (N) Surveys
Site (1) ---> (N) Feedback
Site (1) ---> (N) Funnels
Site (1) ---> (N) Trends
Site (1) ---> (N) Highlights
Site (1) ---> (N) Events
Site (1) ---> (1) DashboardMetrics
Survey (1) ---> (N) SurveyQuestions
Survey (1) ---> (N) SurveyResponses
Recording (1) ---> (N) RecordingEvents
Funnel (1) ---> (N) FunnelSteps
Highlight (N) ---> (1) HighlightCollection
```

---

## createInitialData() Structure

```javascript
function createInitialData() {
  return {
    currentUser: { /* CurrentUser */ },
    organization: { /* Organization */ },
    sites: [ /* 2 Sites */ ],
    activeSiteId: "site-1",
    heatmaps: [ /* 6 Heatmaps */ ],
    recordings: [ /* 25 Recordings */ ],
    surveys: [ /* 4 Surveys with questions and responses */ ],
    feedback: [ /* 20 Feedback items */ ],
    funnels: [ /* 2 Funnels with steps */ ],
    trends: [ /* 3 Trend charts with data points */ ],
    highlights: [ /* 5 Highlights */ ],
    highlightCollections: [ /* 2 Collections */ ],
    events: [ /* 8 Events */ ],
    dashboardMetrics: { /* DashboardMetrics for site-1 */ },
    // UI state
    sidebarExpanded: true,
    selectedDateRange: "last_30_days",
    activeFilters: [],
  };
}
```
