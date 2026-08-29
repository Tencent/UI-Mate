# Xmplitude Analytics Mock -- Data Model

## Overview

Xmplitude is an event-based analytics platform. The core data model centers around **Events** fired by **Users**, with **Properties** attached to both. The mock also needs entities for the analytics platform itself: **Charts**, **Dashboards**, **Cohorts**, **Notebooks**, and **Experiments**.

---

## Entity Types

### 1. User (tracked product user, not the Xmplitude account user)

```javascript
{
  id: "user_001",                    // string, internal mock ID
  userId: "alice@example.com",       // string | null, the tracked user's ID
  amplitudeId: "1072194616105",      // string, Xmplitude's internal ID (10+ digits)
  displayName: "Alice Johnson",      // string, display name
  avatar: null,                      // string | null, avatar URL
  firstSeen: "2024-11-15",          // ISO date string
  lastSeen: "2024-12-16",           // ISO date string
  country: "United States",          // string
  countryFlag: "us",                 // 2-letter country code for flag emoji
  platform: "Web",                   // "Web" | "iOS" | "Android"
  deviceType: "Desktop",             // "Desktop" | "Mobile" | "Tablet"
  os: "Mac OS X",                    // string
  browser: "Chrome 131",             // string
  library: "xmplitude-ts-script/2.11.1",  // string, SDK
  properties: {                      // object, custom user properties
    plan: "Pro",
    company: "Acme Corp",
    role: "Product Manager",
    signupSource: "organic"
  }
}
```

### 2. Event (a tracked user action)

```javascript
{
  id: "evt_00001",                   // string
  name: "Page Viewed",              // string, event name
  userId: "user_001",               // FK to User
  timestamp: "2024-12-17T08:12:50", // ISO datetime
  sessionId: "1734422752392",       // string, session identifier
  properties: {                      // event-specific properties
    "Page Title": "Dashboard",
    "Page Path": "/dashboard",
    "Page URL": "https://app.example.com/dashboard",
    "Page Domain": "app.example.com",
    "Referrer": "https://google.com"
  }
}
```

### 3. EventDefinition (the catalog/schema of known events)

```javascript
{
  id: "evtdef_001",
  name: "Page Viewed",              // string
  displayName: "Page Viewed",       // string
  description: "Triggered when a user loads a page on your website.",
  category: "Xmplitude",            // "Xmplitude" | "Custom" | "Labeled"
  status: "live",                   // "live" | "hidden" | "blocked" | "unexpected"
  createdAt: "2024-10-15",
  createdBy: "samlee@example.com",
  occurrencesLast30d: 847,
  icon: "globe",                    // icon hint
  color: "#1E61F0",                 // badge color
  properties: [                     // event properties schema
    { name: "Page Title", type: "string" },
    { name: "Page Path", type: "string" },
    { name: "Page URL", type: "string" },
    { name: "Page Domain", type: "string" },
    { name: "Page Counter", type: "number" }
  ]
}
```

### 4. Chart (a saved analysis)

```javascript
{
  id: "chart_001",
  name: "Page Views by Unique Users (Last 30 Days)",
  description: "",
  type: "segmentation",             // "segmentation" | "funnel" | "retention" | "dataTable" | "journeys" | "lifecycle" | "stickiness" | "revenueLtv" | "userComposition" | "personas" | "engagementMatrix" | "impactAnalysis" | "compass" | "userSessions"
  status: "saved",                  // "draft" | "saved"
  owner: "Sam Lee",
  ownerEmail: "samlee@example.com",
  createdAt: "2024-12-10T09:00:00",
  updatedAt: "2024-12-16T14:30:00",
  dashboardIds: ["dash_001"],       // dashboards this chart belongs to
  notebookIds: [],

  // Chart configuration
  config: {
    events: [
      {
        letter: "A",
        eventName: "Page Viewed",
        filters: [],
        groupBy: null
      }
    ],
    measuredAs: "uniques",           // "uniques" | "eventTotals" | "activePercent" | "average" | "frequency" | "properties"
    segments: [
      {
        id: "seg_1",
        name: "All Users",
        filters: [],
        cohortId: null
      }
    ],
    chartVisualization: "line",      // "line" | "bar" | "stacked_bar" | "pie" | "area"
    timeRange: "30d",                // "7d" | "30d" | "60d" | "90d" | "custom"
    interval: "daily",               // "daily" | "weekly" | "monthly"
    groupSegmentBy: null,            // user property to group segments by
    formula: null                    // custom formula string
  },

  // Pre-computed chart data for display (mock)
  data: {
    series: [
      {
        name: "All Users",
        color: "#1E61F0",
        dataPoints: [
          { date: "2024-11-16", value: 0 },
          { date: "2024-11-17", value: 0 },
          // ... more data points
          { date: "2024-12-14", value: 3 },
          { date: "2024-12-15", value: 0 },
          { date: "2024-12-16", value: 3 }
        ]
      }
    ],
    breakdownTable: [
      { segment: "All Users", values: { "Thu, Dec 12": 1, "Fri, Dec 13": 0, "Sat, Dec 14": 0, "Sun, Dec 15": 0, "Mon, Dec 16": 3 }, rowAverage: 0.13 }
    ]
  }
}
```

### 5. FunnelChart (extends Chart with funnel-specific data)

```javascript
// config.type === "funnel"
{
  // ...base Chart fields
  config: {
    steps: [
      { eventName: "Start Session", filters: [] },
      { eventName: "Page Viewed", filters: [] },
      { eventName: "Element Clicked", filters: [{ property: "Element Text", operator: "equals", value: "Sign Up" }] }
    ],
    conversionWindow: "30d",
    countingMethod: "uniques",        // "uniques" | "totals"
    segments: [{ id: "seg_1", name: "All Users", filters: [] }]
  },
  data: {
    steps: [
      { name: "Start Session", count: 100, percentage: 100 },
      { name: "Page Viewed", count: 85, percentage: 85 },
      { name: "Element Clicked", count: 25, percentage: 25 }
    ],
    overallConversion: 25,
    medianTime: "2m 34s"
  }
}
```

### 6. RetentionChart (extends Chart with retention-specific data)

```javascript
// config.type === "retention"
{
  config: {
    startEvent: "New User",
    returnEvent: "Any Active Event",
    retentionType: "retention",       // "retention" | "unbounded"
    interval: "daily",
    segments: [{ id: "seg_1", name: "All Users", filters: [] }]
  },
  data: {
    curve: [
      { day: 0, percentage: 100, count: 50 },
      { day: 1, percentage: 42, count: 21 },
      { day: 2, percentage: 28, count: 14 },
      { day: 3, percentage: 12, count: 6 },
      { day: 7, percentage: 8, count: 4 },
      { day: 14, percentage: 4, count: 2 },
      { day: 30, percentage: 2, count: 1 }
    ]
  }
}
```

### 7. Dashboard

```javascript
{
  id: "dash_001",
  name: "Product KPIs",
  description: "Key product metrics tracked weekly.",
  owner: "Sam Lee",
  ownerEmail: "samlee@example.com",
  isOfficial: true,
  createdAt: "2024-11-01T10:00:00",
  updatedAt: "2024-12-16T15:00:00",
  chartIds: ["chart_001", "chart_002", "chart_003", "chart_004"],
  layout: [                           // grid positions for cards
    { chartId: "chart_001", x: 0, y: 0, w: 6, h: 4 },
    { chartId: "chart_002", x: 6, y: 0, w: 6, h: 4 },
    { chartId: "chart_003", x: 0, y: 4, w: 6, h: 4 },
    { chartId: "chart_004", x: 6, y: 4, w: 6, h: 4 }
  ],
  space: "Sam Lee's Space"
}
```

### 8. Cohort

```javascript
{
  id: "cohort_001",
  name: "Power Users",
  description: "Users who performed Page Viewed 5+ times in the last 7 days.",
  owner: "Sam Lee",
  createdAt: "2024-12-01T09:00:00",
  updatedAt: "2024-12-16T08:00:00",
  userCount: 12,
  lastComputed: "2024-12-16T08:00:00",
  definition: {
    conditions: [
      {
        type: "didPerform",
        eventName: "Page Viewed",
        operator: ">=",
        count: 5,
        timeRange: "last_7_days"
      }
    ],
    combinator: "and"                  // "and" | "or"
  }
}
```

### 9. Notebook

```javascript
{
  id: "notebook_001",
  name: "SLMobbin Notes",
  owner: "Sam Lee",
  space: "Sam Lee's Space",
  createdAt: "2024-12-15T10:00:00",
  updatedAt: "2024-12-16T12:00:00",
  viewCount: 0,
  blocks: [
    { id: "block_1", type: "chart", chartId: "chart_005" },
    { id: "block_2", type: "chart", chartId: "chart_001" }
  ]
}
```

### 10. Experiment

```javascript
{
  id: "exp_001",
  name: "Homepage CTA Test",
  type: "ab_test",                     // "ab_test" | "feature_flag"
  subtype: "web",                      // "web" | "server"
  status: "draft",                     // "draft" | "running" | "paused" | "completed"
  owner: "Sam Lee",
  createdAt: "2024-12-14T11:00:00",
  variants: [
    { id: "var_a", name: "control", isControl: true, rolloutPercent: 50 },
    { id: "var_b", name: "treatment", isControl: false, rolloutPercent: 50 }
  ],
  goals: [
    { metricName: "Page Viewed", type: "success", direction: "increase" }
  ],
  pages: [],
  targeting: { segments: ["All Users"] },
  rolloutPercent: 0,
  results: null
}
```

### 11. Space

```javascript
{
  id: "space_001",
  name: "Sam Lee's Space",
  owner: "Sam Lee",
  isPersonal: true,
  contentIds: ["chart_001", "chart_002", "dash_001", "notebook_001"]
}
```

### 12. CurrentUser (the logged-in Xmplitude account user)

```javascript
{
  id: "ampuser_001",
  name: "Sam Lee",
  email: "samlee@example.com",
  avatar: null,
  organization: "AcmeTech",
  role: "Admin",
  plan: "Free",
  mtuUsed: 4,
  mtuLimit: 50000
}
```

---

## Relationships

- **User** has many **Events** (one-to-many via userId)
- **Chart** references **EventDefinitions** (via config.events[].eventName)
- **Chart** belongs to many **Dashboards** (many-to-many via dashboardIds)
- **Chart** belongs to many **Notebooks** (many-to-many via notebookIds)
- **Dashboard** contains many **Charts** (via chartIds + layout)
- **Cohort** is used in **Chart** segments (via cohortId in segment filters)
- **Notebook** embeds many **Charts** (via blocks[].chartId)
- **Space** contains **Charts**, **Dashboards**, **Notebooks** (via contentIds)
- **Experiment** references **EventDefinitions** for goals

---

## Suggested createInitialData() Structure

```javascript
function createInitialData() {
  return {
    currentUser: { /* CurrentUser entity */ },

    // Tracked product users (mock)
    users: [ /* ~8-12 User entities with varied countries, platforms */ ],

    // Event catalog
    eventDefinitions: [
      // ~8 events: Page Viewed, Start Session, Element Clicked, Element Changed,
      // Sign Up Button, Sign Up Label, New User, End Session
    ],

    // Raw events (for user profile event streams)
    events: [ /* ~80-120 Event entities across the users, last 7 days */ ],

    // Saved charts
    charts: [
      // ~6-8 charts: segmentation, funnel, retention, data table examples
      // Each with pre-computed mock data in .data field
    ],

    // Dashboards
    dashboards: [
      // 2-3: "Product KPIs", "Web Engagement", user's personal dashboard
    ],

    // Cohorts
    cohorts: [
      // 3-4: "All Users" (default), "Power Users", "New Users Last 7d", "US Users"
    ],

    // Notebooks
    notebooks: [
      // 1-2 with embedded chart references
    ],

    // Experiments
    experiments: [
      // 1-2: one draft, one completed
    ],

    // Spaces
    spaces: [
      // 1-2: personal space, shared team space
    ],

    // Home dashboard metrics (pre-computed for home page cards)
    homeMetrics: {
      visitors: { value: 42, delta: 12.5, deltaType: "increase" },
      pageViews: { value: 187, delta: 8.3, deltaType: "increase" },
      bounceRate: { value: 38.5, delta: -2.1, deltaType: "decrease" },
      pageViewsPerSession: { value: 3.2, delta: 5.0, deltaType: "increase" },
      currentLiveUsers: 3,
      newUsersToday: 2,
      avgSessionDuration: "4m 23s",
      topPages: [
        { title: "Dashboard", volume: 45 },
        { title: "Settings", volume: 32 },
        { title: "Profile", volume: 28 },
        { title: "Reports", volume: 19 },
        { title: "Billing", volume: 12 }
      ],
      usersByCountry: [
        { country: "United States", flag: "us", users: 28 },
        { country: "United Kingdom", flag: "gb", users: 6 },
        { country: "Canada", flag: "ca", users: 4 },
        { country: "Germany", flag: "de", users: 2 },
        { country: "Indonesia", flag: "id", users: 2 }
      ]
    },

    // Templates (display-only for home page carousel)
    templates: [
      { id: "tpl_1", name: "User Activity", type: "Dashboard", chartCount: 9 },
      { id: "tpl_2", name: "Marketing Analytics", type: "Dashboard", chartCount: 14 },
      { id: "tpl_3", name: "Session Engagement", type: "Dashboard", chartCount: 6 },
      { id: "tpl_4", name: "Product KPIs", type: "Dashboard", chartCount: 8 },
      { id: "tpl_5", name: "Media", type: "Dashboard", chartCount: 5 }
    ],

    // UI state
    ui: {
      sidebarExpanded: true,
      activeSidebarItem: "home",
      expandedSections: ["productAnalytics", "users"],
      currentProject: "default"
    }
  };
}
```

---

## Key Notes for Implementation

1. **Chart data is pre-computed**: The mock does NOT compute analytics from raw events. Each chart entity includes a `.data` field with pre-generated series, labels, and breakdown tables. When users change chart configuration (add events, change time range), the UI should show plausible mock data transitions.

2. **Events are for the User Profile view**: The raw events array is used primarily for the User Profile detail "Event Stream" panel. Generate ~10-15 events per user covering the last few days.

3. **Time-series data**: For line charts, generate 30 data points (one per day) with realistic patterns -- low values early, gradual increase, occasional spikes. Use small numbers (0-50 range) to match a small-scale product.

4. **Funnel data**: Always show decreasing conversion at each step. Typical pattern: 100% -> 70% -> 35% -> 15%.

5. **Retention data**: Show typical retention curve -- steep drop Day 0->1 (60%->30%), gradual decline, flattening around Day 7-14 at ~5-10%.
