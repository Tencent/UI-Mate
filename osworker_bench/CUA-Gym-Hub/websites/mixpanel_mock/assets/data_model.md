# Xixpanel Mock -- Data Model

This document defines all entity types for `dataManager.js`. The dev agent should use this as the authoritative reference for `createInitialData()`.

---

## 1. Project

The top-level container. Only one project is active at a time.

```js
{
  id: "proj_001",
  name: "SLMobbin",
  dataView: "All Project Data",  // shown in sidebar subtitle
  timezone: "US/Pacific",
  createdAt: "2025-06-15T00:00:00Z"
}
```

---

## 2. CurrentUser

The pre-logged-in user (app owner).

```js
{
  id: "user_001",
  name: "Sam Lee",
  email: "samlee@example.com",
  avatar: null,  // use initials "SL"
  role: "Admin",
  orgName: "SLMobbin"
}
```

---

## 3. Events (tracked analytics events)

These represent the raw event stream that Xixpanel tracks. Each event is a data point in the Events view.

```js
{
  id: "evt_001",
  eventName: "[Auto] Page View",       // string
  displayName: "[Auto] Page View",     // Lexicon display name
  distinctId: "$device:f85dc969-ffdf-4cc2-b0f0-a3ed2236b2a0",
  time: "2026-01-18T21:09:46.031Z",    // ISO timestamp
  city: "New York",
  country: "United States",
  region: "New York",
  operatingSystem: "Mac OS X",
  browser: "Chrome",
  browserVersion: "143",
  currentUrl: "https://www.content-mobbin.com/",
  deviceId: "f85dc969-ffdf-4cc2-b0f0-a3ed2236b2a0",
  properties: {
    // Arbitrary key-value pairs
    "Host": "www.content-mobbin.com",
    "Initial Referrer": "$direct",
    "Path Name": "/",
    "Screen Height": 982,
    "Screen Width": 1512,
    "Library Version": "2.73.0",
    "Xixpanel Library": "web",
    "Insert ID": "5aqr4d7pt9tdh07g",
    "Autocapture Event": true,
    "[Auto] Event Type": "click",
    "[Auto] Page Height": 1221,
    "[Auto] Page Width": 1512
  }
}
```

**Seed requirement**: 50-80 events across 5-7 distinct users, covering event types: `[Auto] Page View`, `[Auto] Element Click`, `[Auto] Form Submit`, `[Auto] Page Scroll`, `[Auto] Input Change`, `meaningful interaction`, `sign_up`, `purchase_completed`, `session_start`, `session_end`. Spread across last 30 days.

---

## 4. UserProfiles (tracked user profiles)

User profiles in the analytics sense (not app users). Shown in the Users view.

```js
{
  id: "profile_001",
  name: "sam lee",
  email: "samlee.mobbin+1@gmail.com",
  distinctId: "samlee.mobbin+1@gmail.com",
  avatar: null,  // emoji face or initials
  countryCode: "US",
  region: "New York",
  city: "New York",
  lastSeen: "2026-01-22T00:00:00Z",
  createdAt: "2026-01-15T00:00:00Z",
  properties: {
    "Plan": "Growth",
    "Sign Up Date": "2025-12-01",
    "Total Sessions": 47,
    "Device Type": "Desktop"
  }
}
```

**Seed requirement**: 8-12 user profiles with varied properties, some with undefined fields to match realistic data.

---

## 5. Boards (Dashboards)

A board is a collection of report cards and content blocks.

```js
{
  id: "board_001",
  name: "Main Dashboard",
  description: "A central view of user activity, engagement, and usage trends across the product/site",
  isPinned: true,
  isFavorite: true,
  isStarter: false,
  createdBy: "user_001",
  createdAt: "2025-12-20T00:00:00Z",
  updatedAt: "2026-01-22T00:00:00Z",
  items: [
    // Array of board items (report cards, text blocks)
    {
      id: "bitem_001",
      type: "report",       // "report" | "text" | "media"
      reportId: "report_001",
      position: { x: 0, y: 0, w: 6, h: 4 },  // grid position
      title: "User Growth & Engagement"  // override title on card
    },
    {
      id: "bitem_002",
      type: "report",
      reportId: "report_003",
      position: { x: 6, y: 0, w: 6, h: 4 },
      title: "Registered users conversion rate"
    },
    {
      id: "bitem_003",
      type: "text",
      content: "User engagement measures how meaningfully users interact with your product, based on the events they perform.",
      position: { x: 0, y: 4, w: 12, h: 2 }
    }
  ]
}
```

**Seed requirement**: 3-4 boards: "Main Dashboard" (pinned+favorite), "Starter Board" (pinned, starter), "Core User Metrics" (your boards), "Web Analytics Sample Template" (your boards).

---

## 6. Reports (Saved report configurations)

```js
{
  id: "report_001",
  name: "User Growth & Engagement",
  type: "insights",  // "insights" | "funnels" | "flows" | "retention"
  boardId: "board_001",  // can be null if standalone
  createdBy: "user_001",
  createdAt: "2026-01-16T00:00:00Z",
  updatedAt: "2026-01-22T00:00:00Z",

  // Query configuration
  dateRange: {
    start: "2026-01-16",
    end: "2026-01-22",
    preset: "7D"  // "Custom"|"Today"|"Yesterday"|"7D"|"30D"|"3M"|"6M"|"12M"
  },
  granularity: "Day",  // "Minute"|"Hour"|"Day"|"Week"|"Month"|"Quarter"
  chartType: "line",   // "line"|"stacked_line"|"column"|"stacked_column"|"bar"|"stacked_bar"|"pie"|"metric"|"table"

  // Insights-specific
  metrics: [
    {
      id: "metric_a",
      label: "A",
      name: "Uniques of All Events",
      events: [
        { id: "mevt_001", name: "All Events", color: "#7B5CFF" }
      ],
      measurement: "Uniques",  // "Unique Users"|"Total Events"|"Total Sessions"|"Frequency per User"|"Aggregate Property"
      aggregation: null
    },
    {
      id: "metric_b",
      label: "B",
      name: "Total Events of meaningful interaction",
      events: [
        { id: "mevt_002", name: "meaningful interaction", color: "#E74C3C" }
      ],
      measurement: "Total Events",
      aggregation: null
    }
  ],
  filters: [
    {
      id: "filter_001",
      property: "Country",
      propertyType: "string",  // "string"|"number"|"boolean"|"date"
      operator: "is",
      values: ["Singapore", "United States"]
    }
  ],
  breakdowns: [
    {
      id: "bd_001",
      property: "device type",
      propertyType: "string"
    },
    {
      id: "bd_002",
      property: "1 cohort",
      propertyType: "cohort"
    }
  ],

  // Pre-computed chart data (mock data for rendering)
  chartData: {
    labels: ["Jan 16", "Jan 17", "Jan 18", "Jan 19", "Jan 20", "Jan 21", "Jan 22"],
    series: [
      { name: "A. Uniques of All E...", color: "#7B5CFF", data: [0, 12, 95, 80, 45, 30, 8] },
      { name: "A. Uniques of All E...", color: "#E74C3C", data: [0, 5, 40, 55, 30, 20, 5] },
      { name: "A. Uniques of All E...", color: "#4CAF50", data: [0, 3, 15, 12, 8, 5, 2] }
    ]
  },
  tableData: {
    columns: ["Metric", "device type", "Cohort", "Average", "Jan 16", "Jan 17", "Jan 18", "Jan 19", "Jan 20", "Jan 21"],
    rows: [
      { metric: "A. Uniques of All Events", deviceType: "Desktop", cohort: "All User Profiles", average: 16.2, values: [0, 12, 45, 30, 20, 15] },
      { metric: "A. Uniques of All Events", deviceType: "Desktop", cohort: "view only users", average: 14.5, values: [0, 10, 40, 25, 18, 12] },
      { metric: "A. Uniques of All Events", deviceType: "Mobile", cohort: "All User Profiles", average: 0.5, values: [0, 0, 1, 1, 0, 0] }
    ]
  }
}
```

### Funnels Report variant:
```js
{
  id: "report_003",
  type: "funnels",
  name: "Registered users conversion rate",
  steps: [
    { id: "step_a", label: "A", eventName: "meaningful interaction", stepsBefore: 0, stepsAfter: 3 },
    { id: "step_b", label: "B", eventName: "[Auto] Form Submit", stepsBefore: 0, stepsAfter: 3 }
  ],
  conversionCriteria: {
    timeWindow: "30 hours",
    counting: "Uniques"
  },
  funnelData: {
    steps: [
      { name: "meaningful interaction", total: 7, converted: 5, convertedPct: 71.43, dropOff: 2, dropOffPct: 28.57 },
      { name: "[Auto] Page View", total: 6, converted: 5, convertedPct: 83.33, dropOff: 1, dropOffPct: 16.67 },
      { name: "[Auto] Page View", total: 3, converted: 2, convertedPct: 66.67, dropOff: 1, dropOffPct: 33.33 },
      { name: "meaningful interaction", total: 4, converted: 4, convertedPct: 100, dropOff: 0, dropOffPct: 0 },
      { name: "[Auto] Form Submit", total: 5, converted: 5, convertedPct: 71.43, dropOff: 2, dropOffPct: 28.57 }
    ]
  }
}
```

### Retention Report variant:
```js
{
  id: "report_004",
  type: "retention",
  name: "Weekly Retention",
  retentionData: {
    cohorts: [
      { period: "Jan 6-12", users: 45, retention: [100, 62, 48, 35, 28] },
      { period: "Jan 13-19", users: 52, retention: [100, 58, 42, 30] },
      { period: "Jan 20-26", users: 38, retention: [100, 55, 40] }
    ]
  }
}
```

**Seed requirement**: 5-7 reports across types: 3 Insights (line chart, bar chart, metric), 1 Funnels, 1 Flows, 1 Retention.

---

## 7. LexiconEntries (Data Dictionary)

```js
{
  id: "lex_001",
  category: "events",  // "events" | "eventProperties" | "profileProperties"
  eventName: "$session_end",
  displayName: "Session End",
  description: "Xixpanel virtual event triggered at the end of each session",
  thirtyDayQueries: 7,
  status: "Visible",   // "Visible" | "Hidden" | "Dropped"
  tags: [],
  type: "auto"  // "auto" | "custom"
}
```

**Seed requirement**: 8-12 Lexicon entries covering system events ($session_end, $session_start, $mp_click, $mp_dead_click, $mp_input_change, $mp_scroll, $mp_session_record, $mp_submit, $mp_web_page_view) and custom events (meaningful interaction, sign_up, purchase_completed).

---

## 8. Cohorts

```js
{
  id: "cohort_001",
  name: "view only users",
  description: "Users who viewed but did not interact",
  userCount: 23,
  createdAt: "2026-01-10T00:00:00Z"
}
```

**Seed requirement**: 3-4 cohorts (All User Profiles, view only users, power users, new signups).

---

## 9. SessionReplays

```js
{
  id: "replay_001",
  distinctId: "$device:f85dc969-ffd...",
  visitDuration: "2m",
  eventCount: 11,
  timestamp: "2026-01-19T01:21:00Z",
  url: "https://www.content-mobbin.com/",
  entryUrl: "https://www.content-mobbin.com/",
  exitUrl: "https://www.content-mobbin.com/about",
  operatingSystem: "Mac OS X",
  browser: "Chrome",
  sourceSDK: "web",
  events: [
    { time: "00:00:00", name: "[Auto] Page View", count: 1, country: "Indonesia" },
    { time: "00:00:06", name: "[Auto] Element Click", count: 2, country: "Indonesia" },
    { time: "00:00:07", name: "[Auto] Page Scroll", count: 1, country: "Indonesia" }
  ]
}
```

**Seed requirement**: 4-6 session replays with varied durations and event counts.

---

## 10. Annotations

```js
{
  id: "ann_001",
  date: "2026-01-18",
  text: "New feature launched",
  createdBy: "user_001"
}
```

---

## 11. Settings

```js
{
  org: {
    name: "SLMobbin",
    plan: "Growth",
    monthlyEvents: "1M",
    monthlyReplays: "20K"
  },
  project: {
    name: "SLMobbin",
    timezone: "US/Pacific",
    dataRetention: "180 days"
  },
  profile: {
    // mirrors CurrentUser
  },
  teams: [
    {
      id: "team_001",
      name: "SLMobbin Team",
      members: ["user_001", "user_002", "user_003"],
      projects: [
        { name: "SLMobbin", role: "Admin" },
        { name: "Production", role: "Analyst" }
      ]
    }
  ],
  orgMembers: [
    { id: "user_001", name: "Sam Lee", email: "samlee@example.com", role: "Owner", dateJoined: "2025-06-15", lastActive: "2026-01-22" },
    { id: "user_002", name: "John Smith", email: "jsmith@example.com", role: "Member", dateJoined: "2026-01-21", lastActive: "2026-01-22" },
    { id: "user_003", name: "Jane Doe", email: "jdoe@example.com", role: "Member", dateJoined: "2026-01-15", lastActive: "2026-01-20" }
  ]
}
```

---

## createInitialData() Structure

```js
function createInitialData() {
  return {
    currentUser: { /* see section 2 */ },
    project: { /* see section 1 */ },
    events: [ /* 50-80 event objects */ ],
    userProfiles: [ /* 8-12 profile objects */ ],
    boards: [ /* 3-4 board objects with items */ ],
    reports: [ /* 5-7 report objects with chart/table data */ ],
    lexicon: [ /* 8-12 lexicon entries */ ],
    cohorts: [ /* 3-4 cohort objects */ ],
    sessionReplays: [ /* 4-6 replay objects */ ],
    annotations: [ /* 2-3 annotations */ ],
    settings: { /* see section 11 */ }
  };
}
```
