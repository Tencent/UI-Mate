# google_ads_mock Schema

**Base URL**: `http://localhost:<port>/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `account` | object | `{id, name, accountId, currency, timezone, optimizationScore}` — `optimizationScore` is 0–100 integer |
| `campaigns` | array | Each: `{id, name, status, type, budget, biddingStrategy, targetCpa, startDate, endDate, networks[], locations[], languages[], metrics{}}` — `status` in `ENABLED\|PAUSED\|REMOVED`; `type` in `SEARCH\|DISPLAY\|VIDEO\|SHOPPING\|PERFORMANCE_MAX` |
| `adGroups` | array | Each: `{id, campaignId, name, status, defaultBid, metrics{}}` — `status` in `ENABLED\|PAUSED\|REMOVED` |
| `ads` | array | Each: `{id, adGroupId, campaignId, type, status, headlines[], descriptions[], finalUrl, displayUrl, metrics{}}` — `type` in `RESPONSIVE_SEARCH\|RESPONSIVE_DISPLAY` |
| `keywords` | array | Each: `{id, adGroupId, campaignId, text, matchType, status, bid, qualityScore, isNegative, metrics{}}` — `matchType` in `BROAD\|PHRASE\|EXACT`; `isNegative` bool; `bid` nullable float |
| `recommendations` | array | Each: `{id, type, title, description, impact, estimatedImpact, campaignId, adGroupId, status}` — `type` in `KEYWORD\|BID\|BUDGET\|AD\|EXTENSION\|TARGETING`; `impact` in `HIGH\|MEDIUM\|LOW`; `status` in `PENDING\|APPLIED\|DISMISSED` |
| `dailyMetrics` | array | Each: `{date, campaignId, clicks, impressions, cost, conversions}` — 30 days × 6 campaigns = 180 entries |
| `notifications` | array | Each: `{id, type, title, message, timestamp, read, campaignId}` — `type` in `ALERT\|INFO\|RECOMMENDATION` |
| `searchTerms` | array | Each: `{id, searchTerm, matchedKeywordId, campaignId, adGroupId, clicks, impressions, cost, conversions}` |
| `selectedDateRange` | object | `{start, end, label}` — ISO date strings; controls overview chart filter |
| `selectedCampaignFilter` | string\|null | Campaign ID filter applied globally (null = all) |
| `currentView` | string | Current page label (cosmetic only, not used for routing) |

### Metrics shape (common to campaigns, adGroups, ads, keywords)

```json
{
  "clicks": 0,
  "impressions": 0,
  "ctr": 0.0,
  "avgCpc": 0.0,
  "cost": 0.0,
  "conversions": 0,
  "conversionRate": 0.0,
  "costPerConversion": 0.0
}
```

### Default IDs

**Campaigns**: `camp-1` (Brand Search - US), `camp-2` (Generic Search - Running Shoes), `camp-3` (Competitor Keywords), `camp-4` (Display Remarketing), `camp-5` (YouTube Pre-Roll), `camp-6` (Shopping - All Products)

**Ad Groups**: `ag-1`–`ag-14` (distributed across 6 campaigns)

**Ads**: `ad-1`–`ad-9`

**Keywords**: `kw-1`–`kw-20` (regular), `kw-neg-1`–`kw-neg-5` (negative)

**Recommendations**: `rec-1`–`rec-10`

**Notifications**: `notif-1`–`notif-6` (2 unread: `notif-1`, `notif-2`)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "account": {
      "id": "acc-1",
      "name": "Acme Corp",
      "accountId": "123-456-7890",
      "currency": "USD",
      "timezone": "America/New_York",
      "optimizationScore": 72
    },
    "campaigns": [
      {
        "id": "camp-1",
        "name": "Brand Search - US",
        "status": "ENABLED",
        "type": "SEARCH",
        "budget": 50,
        "biddingStrategy": "MANUAL_CPC",
        "targetCpa": null,
        "startDate": "2025-01-15",
        "endDate": null,
        "networks": ["SEARCH"],
        "locations": ["United States"],
        "languages": ["English"],
        "metrics": { "clicks": 0, "impressions": 0, "ctr": 0, "avgCpc": 0, "cost": 0, "conversions": 0, "conversionRate": 0, "costPerConversion": 0 }
      }
    ],
    "adGroups": [],
    "ads": [],
    "keywords": [],
    "recommendations": [],
    "dailyMetrics": [],
    "notifications": [],
    "searchTerms": [],
    "selectedDateRange": { "start": "2025-03-01", "end": "2025-03-30", "label": "Last 30 days" },
    "selectedCampaignFilter": null,
    "currentView": "overview"
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Toggle campaign status (enable/pause) | `campaigns[i].status` → `"ENABLED"` or `"PAUSED"` |
| Toggle ad group status | `adGroups[i].status` → `"ENABLED"` or `"PAUSED"` |
| Toggle keyword status | `keywords[i].status` → `"ENABLED"` or `"PAUSED"` |
| Toggle ad status | `ads[i].status` → `"ENABLED"` or `"PAUSED"` |
| Edit keyword bid (inline) | `keywords[i].bid` value changes |
| Remove keyword (kebab menu) | `keywords[i].status` → `"REMOVED"` |
| Create campaign (wizard) | `campaigns` array grows by 1; optionally `adGroups`, `ads`, `keywords` grow |
| Create ad group | `adGroups` array grows by 1 |
| Create keyword | `keywords` array grows by N (one per line entered) |
| Create ad | `ads` array grows by 1 |
| Edit ad (save in preview panel) | `ads[i].headlines`, `ads[i].descriptions`, `ads[i].finalUrl`, `ads[i].status` may change |
| Apply recommendation | `recommendations[i].status` → `"APPLIED"`; `account.optimizationScore` recalculated |
| Dismiss recommendation | `recommendations[i].status` → `"DISMISSED"` |
| Mark notification read | `notifications[i].read` → `true` |
| Mark all notifications read | all `notifications[i].read` → `true` |
