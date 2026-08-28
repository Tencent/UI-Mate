# Xeta Ads Manager — Data Model

## Entity Definitions

### AdAccount
The top-level container representing the ad account.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"act_123456789"` |
| name | string | `"Acme Corp Ad Account"` |
| businessName | string | `"Acme Corporation"` |
| currency | string | `"USD"` |
| timezone | string | `"America/New_York"` |
| status | enum | `"active"` / `"disabled"` |
| spendCap | number | `50000` |
| amountSpent | number | `23456.78` |
| balance | number | `26543.22` |

### Campaign
Top of the ad hierarchy. Defines the marketing objective.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"camp_001"` |
| name | string | `"Summer Sale 2025 - Conversions"` |
| status | enum | `"active"` / `"paused"` / `"deleted"` / `"draft"` |
| objective | enum | `"awareness"` / `"traffic"` / `"engagement"` / `"leads"` / `"app_promotion"` / `"sales"` |
| buyingType | enum | `"auction"` / `"reach_and_frequency"` |
| budgetOptimization | boolean | `true` (CBO) |
| dailyBudget | number\|null | `100.00` (if CBO + daily) |
| lifetimeBudget | number\|null | `3000.00` (if CBO + lifetime) |
| bidStrategy | enum | `"lowest_cost"` / `"cost_cap"` / `"bid_cap"` / `"target_cost"` |
| specialAdCategories | string[] | `[]` or `["housing", "credit", "employment"]` |
| createdAt | string (ISO) | `"2025-06-01T10:00:00Z"` |
| updatedAt | string (ISO) | `"2025-06-15T14:30:00Z"` |
| startDate | string (ISO) | `"2025-06-01T00:00:00Z"` |
| endDate | string (ISO)\|null | `"2025-08-31T23:59:59Z"` |
| results | number | `1245` |
| reach | number | `156000` |
| impressions | number | `342000` |
| clicks | number | `8900` |
| ctr | number | `2.6` (percentage) |
| cpc | number | `0.56` |
| cpm | number | `14.62` |
| costPerResult | number | `4.02` |
| amountSpent | number | `5012.50` |
| frequency | number | `2.19` |
| roas | number | `3.45` |
| deliveryStatus | enum | `"active"` / `"not_delivering"` / `"scheduled"` / `"completed"` / `"in_review"` / `"error"` |

### AdSet
Mid-level. Defines targeting, budget, schedule, placements.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"adset_001"` |
| campaignId | string | `"camp_001"` |
| name | string | `"US 25-44 Interest-Based"` |
| status | enum | `"active"` / `"paused"` / `"deleted"` / `"draft"` |
| dailyBudget | number\|null | `50.00` |
| lifetimeBudget | number\|null | `null` |
| startDate | string (ISO) | `"2025-06-01T00:00:00Z"` |
| endDate | string (ISO)\|null | `"2025-08-31T23:59:59Z"` |
| optimizationGoal | enum | `"conversions"` / `"landing_page_views"` / `"link_clicks"` / `"impressions"` / `"reach"` / `"lead_generation"` / `"app_installs"` |
| billingEvent | enum | `"impressions"` / `"link_clicks"` |
| bidAmount | number\|null | `5.00` |
| targeting | object | See Targeting sub-object below |
| placements | object | See Placements sub-object below |
| results | number | `623` |
| reach | number | `78000` |
| impressions | number | `171000` |
| clicks | number | `4450` |
| ctr | number | `2.6` |
| cpc | number | `0.56` |
| cpm | number | `14.62` |
| costPerResult | number | `4.02` |
| amountSpent | number | `2506.25` |
| frequency | number | `2.19` |
| deliveryStatus | enum | same as Campaign |

#### Targeting Sub-object

```json
{
  "locations": [
    { "type": "country", "name": "United States", "code": "US" },
    { "type": "city", "name": "New York", "region": "NY" }
  ],
  "ageMin": 25,
  "ageMax": 44,
  "genders": ["all"],
  "detailedTargeting": {
    "interests": [
      { "id": "int_001", "name": "Online shopping" },
      { "id": "int_002", "name": "Fashion" }
    ],
    "behaviors": [
      { "id": "beh_001", "name": "Engaged shoppers" }
    ],
    "demographics": [
      { "id": "dem_001", "name": "College graduates" }
    ]
  },
  "customAudiences": ["aud_001"],
  "lookalikeAudiences": ["aud_002"],
  "excludedAudiences": []
}
```

#### Placements Sub-object

```json
{
  "type": "advantage_plus",
  "platforms": ["facebook", "instagram", "messenger", "audience_network"],
  "positions": {
    "facebook": ["feed", "right_column", "stories", "reels", "in_stream_video", "marketplace"],
    "instagram": ["feed", "stories", "reels", "explore"],
    "messenger": ["inbox", "stories"],
    "audience_network": ["native_banner_interstitial", "rewarded_video"]
  }
}
```

### Ad
The actual creative shown to users.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"ad_001"` |
| adSetId | string | `"adset_001"` |
| campaignId | string | `"camp_001"` |
| name | string | `"Summer Sale - Image Ad A"` |
| status | enum | `"active"` / `"paused"` / `"deleted"` / `"draft"` |
| creativeId | string | `"creative_001"` |
| results | number | `312` |
| reach | number | `39000` |
| impressions | number | `85500` |
| clicks | number | `2225` |
| ctr | number | `2.6` |
| cpc | number | `0.56` |
| cpm | number | `14.62` |
| costPerResult | number | `4.02` |
| amountSpent | number | `1253.13` |
| frequency | number | `2.19` |
| deliveryStatus | enum | same as Campaign |
| reviewStatus | enum | `"approved"` / `"pending"` / `"rejected"` |
| reviewFeedback | string\|null | `null` or `"Ad text exceeds character limit"` |

### AdCreative
The media and copy associated with an ad.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"creative_001"` |
| name | string | `"Summer Sale Creative A"` |
| format | enum | `"single_image"` / `"single_video"` / `"carousel"` / `"collection"` |
| thumbnailUrl | string | `"/mock-media/summer-sale-1.jpg"` |
| primaryText | string | `"Shop our biggest summer sale! Up to 50% off all items."` |
| headline | string | `"Summer Sale - 50% Off"` |
| description | string | `"Limited time offer. Free shipping on orders over $50."` |
| callToAction | enum | `"shop_now"` / `"learn_more"` / `"sign_up"` / `"book_now"` / `"contact_us"` / `"download"` / `"get_offer"` / `"get_quote"` |
| websiteUrl | string | `"https://www.example.com/summer-sale"` |
| displayUrl | string | `"example.com/summer-sale"` |
| mediaItems | array | `[{ type: "image", url: "/mock-media/summer-sale-1.jpg", width: 1080, height: 1080 }]` |
| carouselCards | array\|null | For carousel format: `[{ headline, description, imageUrl, linkUrl }]` |

### Audience
Saved audience configurations.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"aud_001"` |
| name | string | `"Website Visitors - Last 30 Days"` |
| type | enum | `"custom"` / `"lookalike"` / `"saved"` |
| source | enum\|null | `"website"` / `"customer_list"` / `"app_activity"` / `"engagement"` (for custom) |
| size | number | `45000` |
| sizeRange | string | `"40,000 - 50,000"` |
| availability | enum | `"ready"` / `"populating"` / `"too_small"` / `"error"` |
| createdAt | string (ISO) | `"2025-05-15T09:00:00Z"` |
| updatedAt | string (ISO) | `"2025-06-10T12:00:00Z"` |
| description | string | `"People who visited our website in the last 30 days"` |
| lookalikeSpec | object\|null | `{ sourceAudienceId: "aud_001", country: "US", ratio: 0.01 }` |

### Notification

| Field | Type | Example |
|-------|------|---------|
| id | string | `"notif_001"` |
| type | enum | `"ad_approved"` / `"ad_rejected"` / `"budget_alert"` / `"delivery_issue"` / `"performance_alert"` / `"account_update"` |
| title | string | `"Ad Approved"` |
| message | string | `"Your ad 'Summer Sale - Image Ad A' has been approved and is now running."` |
| timestamp | string (ISO) | `"2025-06-15T14:30:00Z"` |
| read | boolean | `false` |
| actionUrl | string\|null | `"/campaigns/camp_001"` |
| relatedEntityId | string\|null | `"ad_001"` |

### BillingTransaction

| Field | Type | Example |
|-------|------|---------|
| id | string | `"txn_001"` |
| date | string (ISO) | `"2025-06-15T00:00:00Z"` |
| description | string | `"Ad charges for June 14, 2025"` |
| amount | number | `156.78` |
| status | enum | `"completed"` / `"pending"` / `"failed"` |
| paymentMethod | string | `"Visa ending in 4242"` |

### PaymentMethod

| Field | Type | Example |
|-------|------|---------|
| id | string | `"pm_001"` |
| type | enum | `"credit_card"` / `"debit_card"` / `"paypal"` / `"bank_account"` |
| name | string | `"Visa ending in 4242"` |
| isPrimary | boolean | `true` |
| expiresAt | string | `"12/2027"` |

### SavedReport

| Field | Type | Example |
|-------|------|---------|
| id | string | `"report_001"` |
| name | string | `"Weekly Performance Summary"` |
| columns | string[] | `["campaign_name", "results", "reach", "impressions", "amount_spent", "ctr", "roas"]` |
| dateRange | string | `"last_7_days"` |
| filters | object | `{ status: ["active"] }` |
| breakdown | string\|null | `"age"` |
| createdAt | string (ISO) | `"2025-06-01T10:00:00Z"` |

### User (Current User / Account Owner)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"user_001"` |
| name | string | `"Sarah Chen"` |
| email | string | `"sarah.chen@acmecorp.com"` |
| avatarUrl | string | `"/avatars/sarah.jpg"` |
| role | string | `"Admin"` |

---

## Relationships

```
AdAccount (1)
  ├── Campaign (many)
  │     ├── AdSet (many)
  │     │     ├── Ad (many)
  │     │     │     └── AdCreative (1)
  │     │     └── Targeting → Audience (refs)
  │     └── metrics (aggregated from ad sets)
  ├── Audience (many)
  ├── Notification (many)
  ├── BillingTransaction (many)
  ├── PaymentMethod (many)
  └── SavedReport (many)
```

---

## createInitialData() Structure

```javascript
export function createInitialData() {
  return {
    // Current user
    user: { id, name, email, avatarUrl, role },

    // Ad Account
    account: { id, name, businessName, currency, timezone, status, spendCap, amountSpent, balance },

    // Campaigns (5-7 campaigns covering different objectives and statuses)
    campaigns: [
      // Active sales campaign with good performance
      // Active traffic campaign
      // Paused awareness campaign
      // Completed leads campaign
      // Draft campaign (not yet published)
      // Active engagement campaign with delivery issue
    ],

    // Ad Sets (2-3 per campaign, ~15 total)
    adSets: [
      // Per campaign: one broad targeting, one interest-based, maybe one retargeting
    ],

    // Ads (2-3 per ad set, ~35 total)
    ads: [
      // Per ad set: image ad, video ad, carousel ad variations
    ],

    // Ad Creatives (one per ad)
    creatives: [...],

    // Audiences (5-8)
    audiences: [
      // Website visitors custom audience
      // Customer list custom audience
      // 1% lookalike of customers
      // Saved audience: US 25-44 interest targeting
      // Engagement custom audience (video viewers)
    ],

    // Notifications (8-12)
    notifications: [
      // Mix of: ad approved, ad rejected, budget alert, delivery warning, performance milestone
    ],

    // Billing
    paymentMethods: [
      { id: "pm_001", type: "credit_card", name: "Visa ending in 4242", isPrimary: true, expiresAt: "12/2027" }
    ],
    billingTransactions: [
      // Last 30 days of daily charges
    ],

    // Saved Reports (3-4)
    savedReports: [
      // "Weekly Performance", "Monthly Spend", "Campaign Comparison"
    ],

    // UI State
    selectedTab: "campaigns", // "campaigns" | "adSets" | "ads"
    selectedDateRange: "last_7_days",
    visibleColumns: ["status", "name", "delivery", "bidStrategy", "budget", "results", "reach", "impressions", "costPerResult", "amountSpent"],
    filters: {},
    searchQuery: "",
    selectedRows: [],
    sidebarCollapsed: false
  };
}
```

### Seed Data Scenarios

The initial data should cover these scenarios for comprehensive agent training:

1. **Active high-performing campaign** — Sales objective, multiple ad sets, good ROAS (3.5+), active delivery
2. **Active underperforming campaign** — Traffic objective, low CTR, high CPC, triggering budget alerts
3. **Paused campaign** — Was active, manually paused by user, retains historical metrics
4. **Completed campaign** — Past end date, all metrics finalized, "completed" delivery status
5. **Draft campaign** — Created but not published, no metrics, "draft" status
6. **Campaign with delivery issues** — Active but not delivering due to audience too narrow or ad rejection
7. **Diverse ad formats** — Mix of single image, video, carousel across different ads
8. **Varied audience types** — Custom, lookalike, and saved audiences with different sizes and readiness states
9. **Mix of notifications** — Unread approvals, rejections, budget warnings, performance alerts
