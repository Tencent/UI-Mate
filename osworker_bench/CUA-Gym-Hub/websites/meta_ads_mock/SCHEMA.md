# meta_ads_mock Schema

**Deploy order**: 60 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8060)
**Base URL**: `http://localhost:8060/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → current state object (or null)

> **Note**: Both a server-side `/go` endpoint (in `vite.config.js`) and a client-side `/go` React route (`src/pages/Go.jsx`) are implemented. The server-side endpoint is the canonical evaluation path — it reads `.mock-states/<sid>.json` and computes a diff. The client-side route reads from localStorage and is useful for browser debugging.

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Current user: `{id, name, email, avatarUrl, role}` |
| `account` | object | Ad account: `{id, name, businessName, currency, timezone, status, spendCap, amountSpent, balance}` |
| `campaigns` | array | Each campaign: `{id, name, status, objective, buyingType, budgetOptimization, dailyBudget, lifetimeBudget, bidStrategy, specialAdCategories[], createdAt, updatedAt, startDate, endDate, results, reach, impressions, clicks, ctr, cpc, cpm, costPerResult, amountSpent, frequency, roas, deliveryStatus}` — `status`: `"active"`, `"paused"`, `"draft"`, `"deleted"`, `"completed"` — `deliveryStatus`: `"active"`, `"not_delivering"`, `"scheduled"`, `"completed"`, `"in_review"`, `"error"` |
| `adSets` | array | Each ad set: `{id, campaignId, name, status, dailyBudget, lifetimeBudget, startDate, endDate, optimizationGoal, billingEvent, bidAmount, targeting{locations[], ageMin, ageMax, genders[], detailedTargeting, customAudiences[], lookalikeAudiences[], excludedAudiences[]}, placements{type, platforms[]}, results, reach, impressions, clicks, ctr, cpc, cpm, costPerResult, amountSpent, frequency, deliveryStatus}` |
| `ads` | array | Each ad: `{id, adSetId, campaignId, name, status, creativeId, results, reach, impressions, clicks, ctr, cpc, cpm, costPerResult, amountSpent, frequency, deliveryStatus, reviewStatus, reviewFeedback}` — `reviewStatus`: `"approved"`, `"pending"`, `"rejected"` |
| `creatives` | array | Each creative: `{id, adId, format, mediaUrl, primaryText, headline, description, displayUrl, websiteUrl, cta, thumbnailUrl}` — `format`: `"single_image"`, `"carousel"`, `"single_video"` |
| `audiences` | array | Each audience: `{id, name, type, source, size, sizeRange, availability, createdAt, updatedAt, description, lookalikeSpec}` — `type`: `"custom"`, `"lookalike"`, `"saved"` — `availability`: `"ready"`, `"populating"`, `"too_small"` |
| `notifications` | array | Each: `{id, type, title, message, timestamp, read, actionUrl, relatedEntityId}` — `type`: `"ad_approved"`, `"ad_rejected"`, `"budget_alert"`, `"performance_alert"`, `"account_update"` |
| `paymentMethods` | array | Each: `{id, type, name, isPrimary, expiresAt}` |
| `billingTransactions` | array | Each: `{id, date, description, amount, status, paymentMethod}` — `status`: `"completed"`, `"pending"`, `"failed"` |
| `savedReports` | array | Each: `{id, name, metrics[], dateRange, createdAt}` — seed data uses `columns[]` (legacy alias); `ReportingPage` save handler writes `metrics[]` |
| `selectedTab` | string | UI state: `"campaigns"` \| `"adSets"` \| `"ads"` |
| `selectedDateRange` | string | Date range key: `"today"`, `"yesterday"`, `"last_7_days"`, `"last_14_days"`, `"last_30_days"`, `"this_month"`, `"last_month"`, `"maximum"` |
| `visibleColumns` | array | Column keys to show in table |
| `filters` | object | Active table filters (not persisted across sessions) |
| `searchQuery` | string | Active table search query |
| `selectedRows` | array | IDs of selected table rows |
| `sidebarCollapsed` | boolean | Whether sidebar is in icon-rail mode |
| `settings` | object | `{notificationPreferences: {adApprovals, budgetAlerts, performanceAlerts, deliveryIssues}}` — each boolean |

### Default Campaign IDs
`camp_001` (Summer Sale 2025 — active/sales), `camp_002` (Brand Awareness Q3 — active/awareness), `camp_003` (Spring Collection Traffic — paused/traffic), `camp_004` (Lead Gen Webinar Q2 — completed/leads), `camp_005` (Holiday Promo 2025 — draft/sales), `camp_006` (App Install Push — active/error)

### Default Ad Set IDs
`adset_001`–`adset_003` (camp_001), `adset_004`–`adset_006` (camp_002), `adset_007`–`adset_009` (camp_003), `adset_010`–`adset_011` (camp_004), `adset_012` (camp_005), `adset_013`–`adset_014` (camp_006)

### Default Audience IDs
`aud_001` (Website Visitors 30d — custom/ready/45K), `aud_002` (Email Subscribers — custom/ready/12K), `aud_003` (1% Lookalike Purchasers — lookalike/ready/2.1M), `aud_004` (Video Viewers 75% — custom/ready/28K), `aud_005` (US 25-44 Shoppers — saved/ready/15M), `aud_006` (New Prospect List — custom/populating/0)

### Default User
`user_001` — Sarah Chen, sarah.chen@acmecorp.com, Admin

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "user": {
      "id": "user_001",
      "name": "Sarah Chen",
      "email": "sarah.chen@acmecorp.com",
      "avatarUrl": null,
      "role": "Admin"
    },
    "account": {
      "id": "act_987654321",
      "name": "Acme Corp Ad Account",
      "businessName": "Acme Corporation",
      "currency": "USD",
      "timezone": "America/New_York",
      "status": "active",
      "spendCap": 50000,
      "amountSpent": 23456.78,
      "balance": 26543.22
    },
    "campaigns": [
      {
        "id": "camp_001",
        "name": "Summer Sale 2025",
        "status": "active",
        "objective": "sales",
        "buyingType": "auction",
        "budgetOptimization": true,
        "dailyBudget": 100.00,
        "lifetimeBudget": null,
        "bidStrategy": "lowest_cost",
        "specialAdCategories": [],
        "createdAt": "2025-06-01T10:00:00Z",
        "updatedAt": "2025-06-15T14:30:00Z",
        "startDate": "2025-06-01T00:00:00Z",
        "endDate": null,
        "results": 1245, "reach": 156000, "impressions": 342000,
        "clicks": 8900, "ctr": 2.60, "cpc": 0.56, "cpm": 14.62,
        "costPerResult": 4.02, "amountSpent": 5012.50, "frequency": 2.19,
        "roas": 3.45, "deliveryStatus": "active"
      }
    ],
    "adSets": [],
    "ads": [],
    "creatives": [],
    "audiences": [],
    "notifications": [],
    "paymentMethods": [
      { "id": "pm_001", "type": "credit_card", "name": "Visa ending in 4242", "isPrimary": true, "expiresAt": "12/2027" }
    ],
    "billingTransactions": [],
    "savedReports": [],
    "selectedTab": "campaigns",
    "selectedDateRange": "last_7_days",
    "visibleColumns": ["status", "name", "delivery", "bidStrategy", "budget", "results", "reach", "impressions", "costPerResult", "amountSpent"],
    "filters": {},
    "searchQuery": "",
    "selectedRows": [],
    "sidebarCollapsed": false,
    "settings": {
      "notificationPreferences": {
        "adApprovals": true,
        "budgetAlerts": true,
        "performanceAlerts": true,
        "deliveryIssues": true
      }
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Create campaign (Publish in modal) | `campaigns` array grows by 1; `adSets` grows by 1; `ads` grows by 1; `creatives` grows by 1 with `{id, adId, format, mediaUrl, primaryText, headline, description, cta, createdAt}` |
| Toggle campaign on/off | `campaigns[i].status` toggled between `"active"` / `"paused"`; `campaigns[i].deliveryStatus` updated |
| Toggle ad set on/off | `adSets[i].status` toggled; `adSets[i].deliveryStatus` updated |
| Toggle ad on/off | `ads[i].status` toggled; `ads[i].deliveryStatus` updated |
| Inline rename campaign/ad set/ad | `campaigns[i].name` (or `adSets[i].name` / `ads[i].name`) updated; `campaigns[i].updatedAt` refreshed |
| Inline budget edit | `campaigns[i].dailyBudget` or `lifetimeBudget` updated (or adSets equivalent) |
| Duplicate entity (campaign) | `campaigns` grows by 1 with `status: "draft"` and `"(Copy)"` suffix; **all child adSets and their ads are also cloned** — `adSets` grows by N (one per child adSet of the source campaign) and `ads` grows by M (one per ad under each cloned adSet); cloned adSets have new IDs with `campaignId` → new campaign; cloned ads have new IDs with `adSetId` → new adSet and `campaignId` → new campaign |
| Duplicate entity (adSet or ad) | `adSets` (or `ads`) array grows by 1 with `status: "draft"` and `"(Copy)"` suffix; no child cloning for non-campaign entities |
| Bulk pause | `campaigns[i].status` → `"paused"`, `deliveryStatus` → `"not_delivering"` for each selected |
| Bulk activate | `campaigns[i].status` → `"active"`, `deliveryStatus` → `"active"` for each selected |
| Bulk delete | `campaigns[i].status` → `"deleted"` for each selected |
| Bulk duplicate | `campaigns` grows by N; new entries have `status: "draft"` |
| Mark notification read | `notifications[i].read` → `true` |
| Mark all notifications read | `notifications[i].read` → `true` for all |
| Create audience | `audiences` array grows by 1 |
| Delete audience | `audiences` array shrinks (entry removed) |
| Update account settings | `account.name`, `account.businessName`, `account.timezone` updated |
| Update notification preferences | `settings.notificationPreferences` fields updated |
| Change selected tab | `selectedTab` updated |
| Change date range | `selectedDateRange` updated |
| Change search query | `searchQuery` updated |
| Select/deselect rows | `selectedRows` array updated |
| Collapse/expand sidebar | `sidebarCollapsed` toggled |
| Save report (Reporting page) | `savedReports` array grows by 1 with `{id, name, metrics[], dateRange, createdAt}` |
| Add payment method (Billing page) | `paymentMethods` array grows by 1 |
| Edit spending limit (Billing page) | `account.spendCap` updated |
| Add ad set to existing campaign (modal "New ad set or ad" tab) | `adSets` array grows by 1 |
| Publish draft campaign (Review and Publish panel) | `campaigns[i].status` → `"active"`, `campaigns[i].deliveryStatus` → `"active"` |
| Discard draft campaign (Review and Publish panel) | `campaigns[i].status` → `"deleted"` |
