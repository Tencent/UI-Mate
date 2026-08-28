# Xoogle Analytics 4 Mock — SCHEMA.md

## State API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/post?sid=<sid>` | POST | Set state. Body: `{"action":"set","state":{...}}` |
| `/post?sid=<sid>` | POST | Update current only. Body: `{"action":"set_current","state":{...}}` |
| `/post?sid=<sid>` | POST | Reset state. Body: `{"action":"reset"}` |
| `/go?sid=<sid>` | GET | Get `{initial_state, current_state, state_diff}` |
| `/state?sid=<sid>` | GET | Get raw current state |
| `/upload?sid=<sid>` | POST | Upload files (multipart) |
| `/files/<sid>/<name>` | GET | Serve uploaded file |

## State Shape

```json
{
  "property": {
    "propertyId": "384729156",
    "propertyName": "GA4 - Acme Store",
    "accountName": "Acme Corp",
    "accountId": "219384756",
    "websiteUrl": "https://www.acmestore.com",
    "industry": "Shopping",
    "timezone": "America/New_York",
    "currency": "USD",
    "dataStreams": [{ "id", "name", "type", "url", "measurementId", "status", "enhancedMeasurement": {...} }],
    "createdAt": "2023-01-15"
  },
  "dailyMetrics": { "YYYY-MM-DD": { "date", "users", "newUsers", "returningUsers", "sessions", "engagedSessions", "engagementRate", "avgSessionDuration", "avgEngagementTime", "sessionsPerUser", "screenPageViews", "viewsPerSession", "eventCount", "conversions", "totalRevenue", "purchaseRevenue", "ecommercePurchases", "bounceRate" } },
  "trafficSources": [{ "id", "channelGroup", "source", "medium", "campaign", "users", "newUsers", "sessions", "engagedSessions", "engagementRate", "avgEngagementTime", "eventCount", "conversions", "totalRevenue" }],
  "events": [{ "id", "name", "count", "totalUsers", "countPerUser", "isKeyEvent", "revenue" }],
  "pages": [{ "id", "pagePath", "pageTitle", "views", "users", "viewsPerUser", "avgEngagementTime", "eventCount", "conversions" }],
  "countries": [{ "id", "country", "countryCode", "users", "newUsers", "sessions", "engagementRate", "avgEngagementTime", "conversions", "revenue" }],
  "cities": [{ "id", "city", "country", "users", "sessions" }],
  "languages": [{ "language", "users", "percentage" }],
  "ageBrackets": [{ "bracket", "users", "percentage" }],
  "genders": [{ "gender", "users", "percentage" }],
  "techPlatforms": { "browsers": [...], "operatingSystems": [...], "devices": [...], "screenResolutions": [...] },
  "realtimeData": { "activeUsers", "usersPerMinute": [...], "byCountry": [...], "bySource": [...], "byPage": [...], "byDevice": [...] },
  "retentionCohorts": [{ "cohortDate", "cohortSize", "retention": [...] }],
  "explorations": [{ "id", "name", "type", "createdAt", "lastModified", "owner", "shared", "config": {...} }],
  "customDimensions": [{ "id", "name", "scope", "description", "parameterName" }],
  "customMetrics": [{ "id", "name", "scope", "description", "parameterName", "unit" }],
  "conversions": [{ "id", "eventName", "isKeyEvent", "createdAt", "count", "value" }],
  "audiences": [{ "id", "name", "description", "membershipDuration", "userCount", "trigger" }],
  "selectedDateRange": { "preset", "startDate", "endDate", "compareEnabled", "compareType" },
  "activeComparison": null,
  "recentlyAccessed": [{ "path", "title", "timestamp" }],
  "currentUser": { "name", "email", "role", "avatarUrl" }
}
```

## Observable State Changes

| Action | State Path | Type |
|--------|-----------|------|
| Change date range | `selectedDateRange` | Object update |
| Navigate to page | `recentlyAccessed` | Array prepend |
| Edit property name | `property.propertyName` | String |
| Edit industry | `property.industry` | String |
| Edit timezone | `property.timezone` | String |
| Edit currency | `property.currency` | String |
| Toggle enhanced measurement | `property.dataStreams[0].enhancedMeasurement.<field>` | Boolean toggle |
| Toggle key event | `events[n].isKeyEvent` | Boolean toggle |
| Create custom dimension | `customDimensions` | Array append |
| Create custom metric | `customMetrics` | Array append |

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Dashboard with KPIs, chart, realtime widget |
| `/reports/snapshot` | ReportsSnapshot | Summary cards grid |
| `/reports/realtime` | Realtime | Real-time users and breakdowns |
| `/reports/acquisition` | AcquisitionOverview | Users/sessions charts + channel bar chart |
| `/reports/acquisition/user-acquisition` | UserAcquisition | Sortable acquisition table |
| `/reports/acquisition/traffic-acquisition` | TrafficAcquisition | Sortable traffic table |
| `/reports/engagement` | EngagementOverview | Users chart + event/page charts |
| `/reports/engagement/events` | EventsReport | Events sortable table |
| `/reports/engagement/pages` | PagesAndScreens | Pages sortable table |
| `/reports/engagement/conversions` | ConversionsReport | Key events table |
| `/reports/retention` | RetentionReport | Retention charts + cohort heatmap |
| `/reports/user/demographics` | DemographicsOverview | Country, city, language, age, gender |
| `/reports/user/tech` | TechOverview | Device, browser, OS, resolution |
| `/explore` | ExploreGallery | Template cards + recent explorations |
| `/explore/:id` | FreeFormExploration | 3-panel exploration tool |
| `/advertising` | AdvertisingOverview | Placeholder advertising page |
| `/admin` | AdminPage | Admin overview with links |
| `/admin/property-settings` | AdminPropertySettings | Property form |
| `/admin/data-streams` | AdminDataStreams | Data streams list + detail |
| `/admin/events` | AdminEvents | Events with key event toggles |
| `/admin/custom-definitions` | AdminCustomDefinitions | Custom dims/metrics CRUD |
| `/go` | Go | State inspector JSON output |
