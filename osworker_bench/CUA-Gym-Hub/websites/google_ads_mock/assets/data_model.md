# Xoogle Ads Mock - Data Model

## Entity Hierarchy

```
Account (1)
  └── Campaign (many)
       └── Ad Group (many)
            ├── Ad (many)
            └── Keyword (many)

Standalone:
  - Recommendations (many, linked to campaign/ad group)
  - Daily Metrics (time series, per campaign)
  - Notifications (list)
```

---

## Entity Definitions

### Account

The single logged-in advertiser account. No auth required — always pre-loaded.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"acc-1"` |
| `name` | string | `"Acme Corp"` |
| `accountId` | string | `"123-456-7890"` |
| `currency` | string | `"USD"` |
| `timezone` | string | `"America/New_York"` |
| `optimizationScore` | number (0-100) | `72` |

---

### Campaign

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"camp-1"` |
| `name` | string | `"Brand Search - US"` |
| `status` | enum | `"ENABLED"` / `"PAUSED"` / `"REMOVED"` |
| `type` | enum | `"SEARCH"` / `"DISPLAY"` / `"VIDEO"` / `"SHOPPING"` / `"PERFORMANCE_MAX"` |
| `budget` | number (daily, USD) | `50.00` |
| `biddingStrategy` | enum | `"MANUAL_CPC"` / `"TARGET_CPA"` / `"MAXIMIZE_CLICKS"` / `"MAXIMIZE_CONVERSIONS"` / `"TARGET_ROAS"` |
| `targetCpa` | number or null | `15.00` |
| `startDate` | string (ISO date) | `"2025-01-15"` |
| `endDate` | string or null | `null` |
| `networks` | string[] | `["SEARCH", "SEARCH_PARTNERS"]` |
| `locations` | string[] | `["United States", "Canada"]` |
| `languages` | string[] | `["English"]` |
| `metrics` | CampaignMetrics | see below |

**CampaignMetrics** (aggregated for the selected date range):

| Field | Type | Example |
|-------|------|---------|
| `clicks` | number | `1245` |
| `impressions` | number | `34500` |
| `ctr` | number (ratio) | `0.0361` |
| `avgCpc` | number (USD) | `1.42` |
| `cost` | number (USD) | `1768.90` |
| `conversions` | number | `87` |
| `conversionRate` | number (ratio) | `0.0699` |
| `costPerConversion` | number (USD) | `20.33` |

---

### Ad Group

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"ag-1"` |
| `campaignId` | string | `"camp-1"` |
| `name` | string | `"Running Shoes - Broad"` |
| `status` | enum | `"ENABLED"` / `"PAUSED"` / `"REMOVED"` |
| `defaultBid` | number (USD) | `2.50` |
| `metrics` | AdGroupMetrics | same shape as CampaignMetrics |

---

### Ad (Responsive Search Ad)

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"ad-1"` |
| `adGroupId` | string | `"ag-1"` |
| `campaignId` | string | `"camp-1"` |
| `type` | enum | `"RESPONSIVE_SEARCH"` / `"RESPONSIVE_DISPLAY"` |
| `status` | enum | `"ENABLED"` / `"PAUSED"` / `"REMOVED"` |
| `headlines` | string[] (3-15) | `["Buy Running Shoes", "Free Shipping Today", "Top Rated Sneakers"]` |
| `descriptions` | string[] (2-4) | `["Shop the latest running shoes. Free returns.", "Up to 50% off. Limited time offer."]` |
| `finalUrl` | string | `"https://www.acmecorp.com/running-shoes"` |
| `displayUrl` | string | `"www.acmecorp.com/shoes"` |
| `metrics` | AdMetrics | same shape as CampaignMetrics |

---

### Keyword

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"kw-1"` |
| `adGroupId` | string | `"ag-1"` |
| `campaignId` | string | `"camp-1"` |
| `text` | string | `"running shoes"` |
| `matchType` | enum | `"BROAD"` / `"PHRASE"` / `"EXACT"` |
| `status` | enum | `"ENABLED"` / `"PAUSED"` / `"REMOVED"` |
| `bid` | number or null (USD) | `2.75` |
| `qualityScore` | number (1-10) or null | `7` |
| `metrics` | KeywordMetrics | same shape as CampaignMetrics |
| `isNegative` | boolean | `false` |

---

### Recommendation

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"rec-1"` |
| `type` | enum | `"KEYWORD"` / `"BID"` / `"BUDGET"` / `"AD"` / `"EXTENSION"` / `"TARGETING"` |
| `title` | string | `"Add new keywords"` |
| `description` | string | `"Add 5 keywords to 'Running Shoes - Broad' to reach more customers"` |
| `impact` | enum | `"HIGH"` / `"MEDIUM"` / `"LOW"` |
| `estimatedImpact` | string | `"+12% clicks"` |
| `campaignId` | string or null | `"camp-1"` |
| `adGroupId` | string or null | `"ag-1"` |
| `status` | enum | `"PENDING"` / `"APPLIED"` / `"DISMISSED"` |

---

### DailyMetric (for performance charts)

| Field | Type | Example |
|-------|------|---------|
| `date` | string (ISO date) | `"2025-03-15"` |
| `campaignId` | string | `"camp-1"` |
| `clicks` | number | `42` |
| `impressions` | number | `1150` |
| `cost` | number | `59.64` |
| `conversions` | number | `3` |

---

### Notification

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"notif-1"` |
| `type` | enum | `"ALERT"` / `"INFO"` / `"RECOMMENDATION"` |
| `title` | string | `"Campaign 'Brand Search' limited by budget"` |
| `message` | string | `"Your daily budget of $50 is limiting impressions. Consider raising to $75."` |
| `timestamp` | string (ISO) | `"2025-03-20T14:30:00Z"` |
| `read` | boolean | `false` |
| `campaignId` | string or null | `"camp-1"` |

---

### SearchTerm (for Search Terms report)

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"st-1"` |
| `searchTerm` | string | `"best running shoes 2025"` |
| `matchedKeywordId` | string | `"kw-1"` |
| `campaignId` | string | `"camp-1"` |
| `adGroupId` | string | `"ag-1"` |
| `clicks` | number | `12` |
| `impressions` | number | `340` |
| `cost` | number | `17.04` |
| `conversions` | number | `1` |

---

## Seed Data Specification

### `createInitialData()` structure

```javascript
export function createInitialData() {
  return {
    account: { /* single Account object */ },
    campaigns: [ /* 6 campaigns */ ],
    adGroups: [ /* 2-4 per campaign, ~15 total */ ],
    ads: [ /* 1-3 per ad group, ~25 total */ ],
    keywords: [ /* 5-15 per ad group, ~100 total */ ],
    recommendations: [ /* 10 items */ ],
    dailyMetrics: [ /* 30 days x 6 campaigns = ~180 rows */ ],
    notifications: [ /* 5-8 notifications */ ],
    searchTerms: [ /* 20-30 search terms */ ],

    // UI state
    selectedDateRange: { start: "2025-03-01", end: "2025-03-30", label: "Last 30 days" },
    selectedCampaignFilter: null,  // null = all campaigns
    currentView: "overview",
  };
}
```

### Seed Campaigns

| # | Name | Type | Status | Budget | Bidding |
|---|------|------|--------|--------|---------|
| 1 | Brand Search - US | SEARCH | ENABLED | $50/day | MANUAL_CPC |
| 2 | Generic Search - Running Shoes | SEARCH | ENABLED | $120/day | MAXIMIZE_CLICKS |
| 3 | Competitor Keywords | SEARCH | PAUSED | $30/day | MANUAL_CPC |
| 4 | Display Remarketing | DISPLAY | ENABLED | $40/day | TARGET_CPA ($12) |
| 5 | YouTube Pre-Roll | VIDEO | ENABLED | $75/day | MAXIMIZE_CONVERSIONS |
| 6 | Shopping - All Products | SHOPPING | ENABLED | $100/day | TARGET_ROAS (400%) |

### Seed Ad Groups (examples for Campaign 1 "Brand Search - US")

| Name | Default Bid | Status |
|------|-------------|--------|
| Brand Core | $3.50 | ENABLED |
| Brand + Product | $2.80 | ENABLED |

### Seed Ad Groups (examples for Campaign 2 "Generic Search - Running Shoes")

| Name | Default Bid | Status |
|------|-------------|--------|
| Running Shoes - Broad | $2.50 | ENABLED |
| Running Shoes - Exact | $3.00 | ENABLED |
| Trail Running | $2.20 | PAUSED |

### Seed Keywords (examples for "Running Shoes - Broad" ad group)

| Text | Match Type | Bid | Quality Score |
|------|-----------|-----|---------------|
| running shoes | BROAD | $2.50 | 7 |
| best running shoes | BROAD | $2.75 | 8 |
| buy running shoes online | PHRASE | $3.00 | 6 |
| running shoes for men | BROAD | $2.40 | 7 |
| nike running shoes | EXACT | $4.00 | 9 |
| running shoes sale | BROAD | $2.20 | 5 |
| marathon training shoes | PHRASE | $2.60 | 6 |
| lightweight running shoes | BROAD | null | 7 |

(Provide similar keyword sets for each ad group)

### Seed Recommendations

1. **Add new keywords** (HIGH) — "Add 5 keywords to 'Running Shoes - Broad' to reach more customers" → +12% clicks
2. **Raise budget** (HIGH) — "'Generic Search' is limited by budget. Raise from $120 to $150/day" → +18% impressions
3. **Add responsive search ad** (MEDIUM) — "'Brand Core' has only 1 ad. Add another for A/B testing" → +8% CTR
4. **Remove redundant keywords** (LOW) — "3 keywords in 'Running Shoes - Exact' overlap with broad match"
5. **Use automated bidding** (MEDIUM) — "Switch 'Competitor Keywords' to Target CPA for better ROI"
6. **Add sitelink extensions** (MEDIUM) — "Add sitelinks to 'Brand Search' for more ad real estate"
7. **Expand location targeting** (LOW) — "Add United Kingdom to 'Brand Search' based on search interest"
8. **Improve ad strength** (HIGH) — "Ad in 'Trail Running' has 'Poor' strength. Add 2 more headlines"
9. **Pause low-performing keywords** (MEDIUM) — "5 keywords have 0 conversions in last 30 days"
10. **Enable auto-applied recommendations** (LOW) — "Auto-apply non-disruptive optimizations"

### Daily Metrics

Generate 30 days of data (March 1-30, 2025) for each campaign with realistic patterns:
- Weekdays have higher volume than weekends
- Brand search has high CTR (8-12%), low CPC ($1-2)
- Generic search has moderate CTR (3-5%), moderate CPC ($1.50-3)
- Display remarketing has low CTR (0.3-0.8%), low CPC ($0.30-0.80)
- Video has very low CTR (0.1-0.3%), low cost per view
- Shopping has moderate CTR (2-4%), moderate CPC ($0.80-1.50)
