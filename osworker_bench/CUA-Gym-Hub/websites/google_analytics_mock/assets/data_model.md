# Xoogle Analytics 4 Mock — Data Model

This document defines all entity types, their fields, relationships, and the structure of `createInitialData()` in `dataManager.js`.

## Property (Top-Level Container)

```js
{
  propertyId: "384729156",          // String, 9-digit GA4 property ID
  propertyName: "GA4 - Acme Store", // String
  accountName: "Acme Corp",         // String
  accountId: "219384756",           // String
  websiteUrl: "https://www.acmestore.com",
  industry: "Shopping",             // String category
  timezone: "America/New_York",
  currency: "USD",
  dataStreams: [DataStream],        // Array<DataStream>
  createdAt: "2023-01-15"
}
```

## DataStream

```js
{
  id: "ds_001",
  name: "Acme Store Web",
  type: "WEB",                      // "WEB" | "IOS" | "ANDROID"
  url: "https://www.acmestore.com",
  measurementId: "G-ABC123XYZ",     // String
  status: "active",                 // "active" | "inactive"
  enhancedMeasurement: {
    pageViews: true,
    scrolls: true,
    outboundClicks: true,
    siteSearch: true,
    formInteractions: true,
    videoEngagement: true,
    fileDownloads: true
  }
}
```

## DateRange & Time Series Data

All metrics are stored as time-series keyed by date string. The mock should generate 90 days of data.

```js
// Helper: dailyMetrics is an object keyed by "YYYY-MM-DD"
{
  "2024-11-01": { users: 1245, newUsers: 834, sessions: 1678, ... },
  "2024-11-02": { users: 1312, newUsers: 901, sessions: 1790, ... },
  ...
}
```

## DailyMetrics (per date)

```js
{
  date: "2024-11-15",               // String YYYY-MM-DD
  // User metrics
  users: 1350,                      // Int, total active users
  newUsers: 890,                    // Int, first-time users
  returningUsers: 460,              // Int
  // Session metrics
  sessions: 1780,                   // Int
  engagedSessions: 1200,            // Int (sessions > 10s or 2+ pageviews or conversion)
  engagementRate: 0.6742,           // Float 0-1
  avgSessionDuration: 145,          // Seconds (Int)
  avgEngagementTime: 97,            // Seconds (Int)
  sessionsPerUser: 1.32,            // Float
  // Page metrics
  screenPageViews: 4520,            // Int
  viewsPerSession: 2.54,            // Float
  // Event metrics
  eventCount: 8930,                 // Int total events fired
  // Conversion/Revenue
  conversions: 78,                  // Int, key events
  totalRevenue: 3456.78,            // Float USD
  purchaseRevenue: 3200.50,         // Float
  ecommercePurchases: 42,           // Int
  // Bounce
  bounceRate: 0.3258                // Float 0-1
}
```

## TrafficSource (Acquisition dimension)

```js
{
  id: "src_001",
  // First-user (user acquisition) vs session (traffic acquisition)
  channelGroup: "Organic Search",   // "Organic Search" | "Direct" | "Referral" | "Paid Search" | "Social" | "Email" | "Display" | "Affiliates" | "(Other)"
  source: "google",                 // String
  medium: "organic",                // String
  campaign: "(not set)",            // String
  // Aggregated metrics for this source (same shape as DailyMetrics subset)
  users: 5400,
  newUsers: 3800,
  sessions: 7200,
  engagedSessions: 4800,
  engagementRate: 0.667,
  avgEngagementTime: 102,
  eventCount: 35000,
  conversions: 320,
  totalRevenue: 15600.00
}
```

**Seed data sources** (10 sources):
| channelGroup | source | medium |
|---|---|---|
| Organic Search | google | organic |
| Organic Search | bing | organic |
| Direct | (direct) | (none) |
| Referral | facebook.com | referral |
| Referral | reddit.com | referral |
| Paid Search | google | cpc |
| Social | instagram | social |
| Social | twitter.com | social |
| Email | newsletter | email |
| Display | google | display |

## Event

```js
{
  id: "evt_001",
  name: "page_view",               // String, event name
  count: 45200,                     // Int, total event count in period
  totalUsers: 12500,                // Int, users who triggered
  countPerUser: 3.62,               // Float
  isKeyEvent: false,                // Bool (formerly "conversion")
  revenue: 0                        // Float (only for purchase events)
}
```

**Seed events** (15 events):
| name | isKeyEvent | notes |
|---|---|---|
| page_view | false | Auto-collected |
| session_start | false | Auto-collected |
| first_visit | false | Auto-collected |
| scroll | false | Enhanced measurement |
| click | false | Enhanced measurement (outbound) |
| view_search_results | false | Enhanced measurement |
| file_download | false | Enhanced measurement |
| video_start | false | Enhanced measurement |
| video_progress | false | Enhanced measurement |
| video_complete | false | Enhanced measurement |
| add_to_cart | true | Ecommerce |
| begin_checkout | true | Ecommerce |
| purchase | true | Ecommerce, has revenue |
| sign_up | true | Custom |
| generate_lead | true | Custom |

## Page

```js
{
  id: "page_001",
  pagePath: "/",                    // String
  pageTitle: "Home | Acme Store",   // String
  views: 12500,                     // Int
  users: 8900,                      // Int
  viewsPerUser: 1.40,               // Float
  avgEngagementTime: 45,            // Seconds
  eventCount: 28000,                // Int
  conversions: 120                  // Int
}
```

**Seed pages** (15 pages):
| pagePath | pageTitle |
|---|---|
| / | Home - Acme Store |
| /products | All Products - Acme Store |
| /products/wireless-headphones | Wireless Headphones - Acme Store |
| /products/smart-watch | Smart Watch Pro - Acme Store |
| /products/laptop-stand | Ergonomic Laptop Stand - Acme Store |
| /products/mechanical-keyboard | Mechanical Keyboard - Acme Store |
| /cart | Shopping Cart - Acme Store |
| /checkout | Checkout - Acme Store |
| /order-confirmation | Order Confirmation - Acme Store |
| /about | About Us - Acme Store |
| /contact | Contact - Acme Store |
| /blog | Blog - Acme Store |
| /blog/best-headphones-2024 | Best Headphones 2024 - Acme Store |
| /account | My Account - Acme Store |
| /search | Search Results - Acme Store |

## Country (Demographics dimension)

```js
{
  id: "country_001",
  country: "United States",         // String
  countryCode: "US",                // ISO 2-letter
  users: 6500,
  newUsers: 4200,
  sessions: 8500,
  engagementRate: 0.72,
  avgEngagementTime: 110,
  conversions: 280,
  revenue: 12500.00
}
```

**Seed countries** (10):
United States, India, United Kingdom, Canada, Germany, Australia, France, Brazil, Japan, Netherlands

## City

```js
{
  id: "city_001",
  city: "New York",
  country: "United States",
  users: 1200,
  sessions: 1600
}
```

## Language, Age, Gender

```js
// Language
{ language: "English", users: 8500, percentage: 0.68 }

// Age bracket
{ bracket: "25-34", users: 3200, percentage: 0.256 }

// Gender
{ gender: "male", users: 5800, percentage: 0.464 }
```

**Seed age brackets**: 18-24, 25-34, 35-44, 45-54, 55-64, 65+
**Seed genders**: male, female, unknown

## TechPlatform (Tech dimension)

```js
{
  browser: "Chrome",                // String
  os: "Windows",                    // String
  platform: "web",                  // "web" | "iOS" | "Android"
  screenResolution: "1920x1080",    // String
  deviceCategory: "desktop",        // "desktop" | "mobile" | "tablet"
  users: 5200,
  sessions: 7000,
  engagementRate: 0.71
}
```

**Seed browsers**: Chrome (62%), Safari (18%), Firefox (8%), Edge (7%), Samsung Internet (3%), Other (2%)
**Seed OS**: Windows (45%), macOS (22%), iOS (15%), Android (12%), Linux (4%), Chrome OS (2%)
**Seed devices**: desktop (58%), mobile (36%), tablet (6%)

## RealtimeData (for Real-time report)

```js
{
  activeUsers: 42,                  // Int, users in last 30 min
  usersPerMinute: [3,5,2,4,6,1,3,5,4,2,7,3,4,5,2,3,6,4,2,5,3,4,1,6,3,5,4,2,3,4], // Array<Int>, last 30 values
  byCountry: [                      // Top 5
    { country: "United States", users: 18 },
    { country: "India", users: 7 },
    ...
  ],
  bySource: [
    { source: "google / organic", users: 15 },
    { source: "(direct) / (none)", users: 12 },
    ...
  ],
  byPage: [
    { pagePath: "/", pageTitle: "Home", users: 10 },
    { pagePath: "/products", pageTitle: "All Products", users: 8 },
    ...
  ],
  byDevice: [
    { device: "desktop", users: 24 },
    { device: "mobile", users: 15 },
    { device: "tablet", users: 3 }
  ]
}
```

## RetentionCohort

```js
{
  cohortDate: "2024-11-01",         // Week start date
  cohortSize: 1200,                 // Users in cohort
  retention: [1.0, 0.42, 0.28, 0.21, 0.18, 0.15, 0.13, 0.11] // Float[], week 0..7
}
```

Generate 8 weekly cohorts with gradually decreasing retention.

## Exploration (saved explorations for Explore section)

```js
{
  id: "exp_001",
  name: "Traffic Source Analysis",
  type: "free_form",               // "free_form" | "funnel" | "path" | "segment_overlap" | "user_explorer" | "cohort" | "user_lifetime"
  createdAt: "2024-10-15",
  lastModified: "2024-11-20",
  owner: "Admin User",
  shared: false,
  // Configuration stored for rendering
  config: {
    dimensions: ["sessionSource", "sessionMedium"],
    metrics: ["sessions", "engagementRate", "conversions"],
    visualization: "table",         // "table" | "line" | "bar" | "donut" | "scatter" | "geo"
    dateRange: "last28days",
    filters: []
  }
}
```

**Seed explorations** (3):
1. "Traffic Source Analysis" — free_form, table
2. "Purchase Funnel" — funnel, 4 steps (session_start → view_item → add_to_cart → purchase)
3. "User Retention Cohorts" — cohort

## CustomDimension & CustomMetric (Admin)

```js
// Custom dimension
{
  id: "cd_001",
  name: "user_membership_level",
  scope: "user",                    // "event" | "user"
  description: "Membership tier of the user",
  parameterName: "membership_level"
}

// Custom metric
{
  id: "cm_001",
  name: "loyalty_points_earned",
  scope: "event",
  description: "Points earned per transaction",
  parameterName: "points_earned",
  unit: "STANDARD"                  // "STANDARD" | "CURRENCY" | "FEET" | "METERS" | "KILOMETERS" | "MILES"
}
```

## Conversion (Key Event)

```js
{
  id: "conv_001",
  eventName: "purchase",
  isKeyEvent: true,
  createdAt: "2023-01-20",
  count: 1250,                      // Total in last 28 days
  value: 58700.00                   // Revenue attributed
}
```

## Audience (Admin)

```js
{
  id: "aud_001",
  name: "Purchasers",
  description: "Users who completed a purchase in the last 30 days",
  membershipDuration: 30,           // Days
  userCount: 1250,
  trigger: "purchase event"
}
```

**Seed audiences** (5): All Users, New Users, Purchasers, Cart Abandoners, High-Value Customers

---

## createInitialData() Structure

```js
export function createInitialData() {
  return {
    property: { /* Property object */ },
    dailyMetrics: { /* keyed by YYYY-MM-DD, 90 days */ },
    trafficSources: [ /* 10 TrafficSource objects */ ],
    events: [ /* 15 Event objects */ ],
    pages: [ /* 15 Page objects */ ],
    countries: [ /* 10 Country objects */ ],
    cities: [ /* 15 City objects */ ],
    languages: [ /* 6 Language objects */ ],
    ageBrackets: [ /* 6 AgeBracket objects */ ],
    genders: [ /* 3 Gender objects */ ],
    techPlatforms: [ /* TechPlatform data: browsers, os, devices, resolutions */ ],
    realtimeData: { /* RealtimeData object */ },
    retentionCohorts: [ /* 8 RetentionCohort objects */ ],
    explorations: [ /* 3 Exploration objects */ ],
    customDimensions: [ /* 2 CustomDimension objects */ ],
    customMetrics: [ /* 1 CustomMetric object */ ],
    conversions: [ /* 4 Conversion/KeyEvent objects */ ],
    audiences: [ /* 5 Audience objects */ ],
    // UI state
    selectedDateRange: {
      preset: "last28days",
      startDate: "2024-11-18",
      endDate: "2024-12-15",
      compareEnabled: false,
      compareType: "precedingPeriod"  // "precedingPeriod" | "samePeriodLastYear"
    },
    currentUser: {
      name: "Admin User",
      email: "admin@acmestore.com",
      role: "Administrator",
      avatarUrl: null
    }
  };
}
```

### Data Generation Notes

- **dailyMetrics**: Generate 90 days of data with realistic patterns. Weekdays should have ~20% more traffic than weekends. Add a gradual upward trend of ~5% month-over-month. Include some variance (±15% random daily fluctuation).
- **trafficSources**: Organic Search should be largest (~40% of users), followed by Direct (~25%), Referral (~12%), Paid Search (~10%), Social (~8%), Email (~3%), Display (~2%).
- **Retention cohorts**: Week 0 = 100%, Week 1 ≈ 35-45%, Week 2 ≈ 22-30%, then gradual decay to ~10-15% by Week 7.
- **Realtime**: Static snapshot — 42 active users is realistic for a medium e-commerce site.
- **Revenue**: Average order value ~$85, ~40-50 purchases/day for the mock property.
