# Xentry Mock — Data Model

> For use in `src/utils/dataManager.js` → `createInitialData()`

---

## Entity Types

### Organization

```js
{
  id: "org-1",
  name: "Empower Plant",
  slug: "empower-plant",
  avatar: "/avatars/org-ep.png",  // or generated initials
  dateCreated: "2023-01-15T00:00:00Z",
  teams: ["team-1", "team-2", "team-3"],
  members: ["user-1", "user-2", "user-3", "user-4", "user-5"],
  projects: ["proj-1", "proj-2", "proj-3", "proj-4"]
}
```

### User / Member

```js
{
  id: "user-1",
  name: "Jane Schmidt",           // Default logged-in user
  email: "jane@empower-plant.io",
  avatar: null,                    // Use initials "JS"
  role: "Admin",                   // Admin | Manager | Member
  teams: ["team-1", "team-2"],
  dateJoined: "2023-01-15T00:00:00Z"
}
```

**Seed 5 users:**
| id | name | role | teams |
|---|---|---|---|
| user-1 | Jane Schmidt | Admin | frontend, backend |
| user-2 | Keith Ryan | Member | frontend |
| user-3 | Maria Chen | Manager | backend, infra |
| user-4 | Alex Thompson | Member | frontend |
| user-5 | Sam Park | Member | infra |

### Team

```js
{
  id: "team-1",
  name: "Frontend",
  slug: "frontend",
  avatar: null,                    // color circle with "F"
  memberCount: 3,
  members: ["user-1", "user-2", "user-4"],
  projects: ["proj-1", "proj-2"]
}
```

**Seed 3 teams:** Frontend, Backend, Infrastructure

### Project

```js
{
  id: "proj-1",
  name: "javascript",
  slug: "javascript",
  platform: "javascript",         // javascript | python | react | node
  color: "#F5B000",               // Badge/avatar color
  teams: ["team-1"],
  dateCreated: "2023-02-01T00:00:00Z",
  stats: {
    crashFreeSessions: 97.2,      // percentage
    crashFreeUsers: 98.5,
    totalErrors24h: 342,
    totalTransactions24h: 15200
  },
  latestRelease: "rel-1",
  environments: ["production", "staging", "development"]
}
```

**Seed 4 projects:**
| id | name | platform | color | teams |
|---|---|---|---|---|
| proj-1 | javascript | javascript-react | `#F5B000` | frontend |
| proj-2 | react-app | javascript-react | `#E03E2F` | frontend |
| proj-3 | flask-api | python-flask | `#33BF9E` | backend |
| proj-4 | spring-boot-5 | java-spring-boot | `#3B6ECC` | backend, infra |

### Issue

The core entity. Issues are groupings of similar error events.

```js
{
  id: "issue-1",
  shortId: "REACT-59F",           // PROJECT-HASH format
  title: "TypeError",             // Exception class name
  subtitle: "'NoneType' object has no attribute 'split'",  // Error message
  culprit: "app/components/smartSearchBar/utils.tsx in escapeTagValue",  // Transaction/function
  type: "error",                  // "error" | "performance"
  level: "error",                 // "fatal" | "error" | "warning" | "info" | "debug"
  status: "unresolved",           // "unresolved" | "resolved" | "ignored" | "archived"
  priority: "high",               // "critical" | "high" | "medium" | "low"
  isUnhandled: true,
  project: "proj-1",
  assignee: "user-2",             // user ID or null
  firstSeen: "2024-12-20T08:30:00Z",
  lastSeen: "2025-04-09T14:22:00Z",
  count: 8300,                    // Total event count
  userCount: 6600,                // Unique users affected
  // Sparkline data for trend chart (last 90 days, simplified to 14 buckets)
  stats14d: [120, 95, 140, 110, 200, 180, 150, 170, 190, 210, 230, 185, 160, 145],
  // Trend label
  trend: "ongoing",               // "ongoing" | "escalating" | "new" | "regression"
  // For issue detail page
  events: ["event-1", "event-2"], // Array of event IDs (detail view loads these)
  tags: {
    browser: { "Chrome": 61, "Firefox": 20, "Safari": 15, "Edge": 4 },
    os: { "Mac OS X": 55, "Windows": 35, "Linux": 10 },
    environment: { "production": 90, "staging": 10 },
    handled: { "yes": 30, "no": 70 },
    level: { "error": 100 },
    release: { "d66ac445f3b1": 60, "a3bc88e12f4a": 40 }
  },
  // Metadata for list display
  metadata: {
    type: "TypeError",
    value: "'NoneType' object has no attribute 'split'"
  }
}
```

**Seed 12-15 issues** covering:
- 3-4 `TypeError` / `ReferenceError` (JavaScript)
- 2-3 `IntegrityError` / `DatabaseError` (Python)
- 2 `RuntimeException` (Java)
- 2-3 Performance issues: `N+1 Query`, `Slow DB Query`
- 1 `500 - Internal Server Error` (HTTP)
- Mix of statuses: ~8 unresolved, 2 resolved, 2 archived, 1 ignored
- Mix of priorities: 2 critical, 3 high, 4 medium, 3 low
- Mix of trends: 4 ongoing, 3 escalating, 2 new, 1 regression
- Mix of projects across all 4 projects

### Event (Issue Event Detail)

```js
{
  id: "event-1",
  eventId: "59d078e91074",         // Short hex ID displayed
  issueId: "issue-1",
  title: "TypeError: 'NoneType' object has no attribute 'split'",
  timestamp: "2025-04-09T14:22:00Z",
  level: "error",
  platform: "javascript",
  release: "d66ac445f3b1",
  environment: "production",
  user: {
    id: "web-user-739596",
    email: "hello@abc.xyz",
    ip: "192.168.1.42"
  },
  contexts: {
    browser: { name: "Chrome", version: "121.0" },
    os: { name: "Mac OS X", version: ">=10.15.7" },
    runtime: { name: "CPython", version: "3.11.8" }
  },
  // Event Highlights (promoted tags)
  highlights: {
    handled: "yes",
    level: "error",
    release: "d66ac445f3b1",
    environment: "prod",
    url: "/checkout",
    transaction: "xentry.tasks.process_commit_context",
    status_code: "500",
    sentry_region: "us"
  },
  // Stack trace
  exception: {
    type: "TypeError",
    value: "'NoneType' object has no attribute 'split'",
    stacktrace: {
      frames: [
        {
          filename: "app/components/smartSearchBar/utils.tsx",
          function: "escapeTagValue",
          lineNo: 46,
          colNo: 28,
          context: [
            [41, "export function escapeTagValue(value: string): string {"],
            [42, "  // Wrap in quotes if there is a space"],
            [43, "  const isArrayTag = value.startsWith('[') && value.endsWith(']') && value.includes(',');"],
            [44, "  return (value.includes('\"') || value.includes(\"'\")) && !isArrayTag"],
            [45, "    ? `${value.replace(/\\'/g, '\\\\'\\'')}\"` "],
            [46, "    : value;"],
            [47, "}"]
          ],
          inApp: true
        },
        {
          filename: "app/components/smartSearchBar/index.tsx",
          function: "SmartSearchBar",
          lineNo: 1295,
          colNo: 19,
          context: [],
          inApp: true
        },
        {
          filename: "node_modules/react-dom/cjs/react-dom.production.min.js",
          function: "render",
          lineNo: 234,
          colNo: 12,
          context: [],
          inApp: false
        }
      ]
    }
  },
  // Breadcrumbs (newest first)
  breadcrumbs: [
    {
      type: "error",
      category: "exception",
      message: "TypeError: 'NoneType' object has no attribute 'split'",
      level: "error",
      timestamp: "2025-04-09T14:22:00Z",
      data: {}
    },
    {
      type: "navigation",
      category: "navigation",
      message: null,
      level: "info",
      timestamp: "2025-04-09T14:21:59Z",
      data: {
        from: "/issues/2341631/events/33e19392daae4cbcb5c8c82aef233a4e/",
        to: "/issues/2341631/events/33e19392daae4cbcb5c8c82aef233a4e/replays/"
      }
    },
    {
      type: "ui",
      category: "ui.click",
      message: "span.app-1x2krai.e16hd6vm1",
      level: "info",
      timestamp: "2025-04-09T14:21:58Z",
      data: { ui_component_name: "SectionHeader" }
    },
    {
      type: "http",
      category: "fetch",
      message: null,
      level: "info",
      timestamp: "2025-04-09T14:21:55Z",
      data: { method: "GET", url: "/api/0/issues/2341631/", status_code: 200 }
    },
    {
      type: "default",
      category: "console",
      message: "Warning: componentWillReceiveProps has been renamed",
      level: "warning",
      timestamp: "2025-04-09T14:21:50Z",
      data: {}
    }
  ],
  tags: {
    browser: "Chrome 121.0",
    "browser.name": "Chrome",
    environment: "prod",
    handled: "yes",
    level: "error",
    mechanism: "logging",
    "organization.slug": "empower-plant",
    release: "d66ac445f3b1",
    runtime: "CPython 3.11.8",
    "server_name": "glob-production-8684ccf568-r7jzg",
    transaction: "xentry.tasks.process_commit_context"
  }
}
```

**Seed 2-3 events per issue** (at minimum for the first 5 issues; other issues can reference 1 event each).

### Alert Rule

```js
{
  id: "alert-1",
  name: "Signup page is too slow",
  type: "metric",                  // "metric" | "issue"
  status: "warning",               // "critical" | "warning" | "resolved"
  threshold: 0.2,
  thresholdType: "below",          // "below" | "above"
  triggerLabel: "Below 0.2",       // Display text
  dateTriggered: "2025-04-09T13:30:00Z",
  dateCreated: "2024-05-29T00:00:00Z",
  project: "proj-1",
  team: "team-1",
  // For alert history
  history: [
    { timestamp: "2025-04-09T13:30:00Z", status: "warning" },
    { timestamp: "2025-04-08T09:00:00Z", status: "resolved" },
    { timestamp: "2025-04-07T22:15:00Z", status: "critical" }
  ]
}
```

**Seed 8 alert rules:**
- 3 metric alerts (Apdex below threshold, error count above, CLS above)
- 3 issue alerts (new issue, high-frequency, regression)
- 2 resolved alerts (to show green "resolved" state)
- Mix across all 4 projects

### Release

```js
{
  id: "rel-1",
  version: "d66ac445f3b1",         // Short commit hash
  shortVersion: "d66ac445",
  dateCreated: "2025-04-08T10:00:00Z",
  dateReleased: "2025-04-08T12:00:00Z",
  projects: ["proj-1", "proj-2"],
  newIssues: 2,
  crashFreeSessions: 97.2,
  crashFreeUsers: 98.5,
  adoption: 85,                    // percentage of sessions on this release
  totalSessions: 24500,
  commitCount: 12,
  authors: ["user-1", "user-2"],
  lastEvent: "2025-04-09T14:22:00Z"
}
```

**Seed 6 releases** spanning last 30 days, across projects.

### Dashboard

```js
{
  id: "dash-1",
  title: "Frontend Overview",
  dateCreated: "2024-06-15T00:00:00Z",
  createdBy: "user-1",
  widgets: [
    {
      id: "widget-1",
      title: "Top 5 Issues by Unique Users Over Time",
      type: "line",                // "line" | "bar" | "area" | "table" | "big_number"
      layout: { x: 0, y: 0, w: 6, h: 3 },  // grid position (12-col grid)
      // Pre-computed mock data for display
      data: {
        series: [
          { label: "REACT-59F", color: "#6C5FC7", values: [120, 95, 140, 110, 200, 180, 150] },
          { label: "REACT-655", color: "#E03E2F", values: [80, 110, 90, 130, 100, 120, 95] }
        ],
        xLabels: ["Sep 1", "Oct 1", "Nov 1", "Dec 1", "Jan 1", "Feb 1", "Mar 1"]
      }
    },
    {
      id: "widget-2",
      title: "Overall LCP",
      type: "big_number",
      layout: { x: 6, y: 3, w: 3, h: 1 },
      data: { value: "1.46s", previousValue: "1.62s" }
    }
  ]
}
```

**Seed 2 dashboards:**
1. "Frontend Overview" — 6-8 widgets (line charts, tables, big numbers matching `custom-dash-W3TM22YX.png`)
2. "Backend Health" — 4-6 widgets

### Performance Transaction (for Performance page)

```js
{
  id: "txn-1",
  name: "/api/checkout",
  project: "proj-3",
  tpm: 45.2,                      // transactions per minute
  p50: 120,                        // ms
  p75: 250,
  p95: 890,
  p99: 2400,
  failureRate: 0.032,              // 3.2%
  apdex: 0.92,
  totalCount: 65000,
  // Sparkline for last 24h
  stats24h: [40, 42, 38, 45, 50, 48, 43, 41, 44, 46, 49, 52]
}
```

**Seed 10 transactions** — mix of API endpoints (`/api/checkout`, `/api/products`, `/api/users`), page loads (`/products`, `/checkout`, `/`), and background tasks.

---

## Relationships

```
Organization
  ├── Teams[]
  │     └── Members[] (Users)
  ├── Projects[]
  │     ├── Teams[]
  │     ├── Issues[]
  │     │     ├── Events[]
  │     │     └── Tags{}
  │     ├── AlertRules[]
  │     └── Releases[]
  ├── Dashboards[]
  │     └── Widgets[]
  └── PerformanceTransactions[]
```

---

## createInitialData() Structure

```js
export function createInitialData() {
  return {
    organization: { /* single org object */ },
    currentUser: { /* user-1 Jane Schmidt */ },
    users: [ /* 5 users */ ],
    teams: [ /* 3 teams */ ],
    projects: [ /* 4 projects */ ],
    issues: [ /* 12-15 issues */ ],
    events: { /* keyed by issue ID: { "issue-1": [event1, event2], ... } */ },
    alertRules: [ /* 8 alert rules */ ],
    releases: [ /* 6 releases */ ],
    dashboards: [ /* 2 dashboards with widgets */ ],
    transactions: [ /* 10 performance transactions */ ],
    // UI state
    selectedProject: "all",         // "all" or project ID
    selectedEnvironment: "all",     // "all" | "production" | "staging" | "development"
    dateRange: "14d",               // "1h" | "24h" | "7d" | "14d" | "30d" | "90d"
    issueListSort: "lastSeen",      // "lastSeen" | "firstSeen" | "events" | "users" | "trends"
    issueListTab: "unresolved",     // "unresolved" | "forReview" | "regressed" | "escalating" | "archived"
    issueSearchQuery: "is:unresolved"
  };
}
```
