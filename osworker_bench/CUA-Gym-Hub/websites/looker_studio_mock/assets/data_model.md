# Xooker Studio Mock -- Data Model

## Entity Types

### 1. User (Current User)

The pre-logged-in user who owns/manages reports.

```js
user: {
  id: "user_001",
  name: "Sarah Chen",
  email: "sarah.chen@example.com",
  avatarUrl: null, // use initials "SC"
  avatarColor: "#4285F4"
}
```

### 2. Report

A report is the primary entity -- a multi-page dashboard document containing visualizations.

```js
report: {
  id: "rpt_001",                    // unique ID
  name: "Marketing Dashboard Q4",    // editable title
  ownerId: "user_001",              // creator
  ownerName: "Sarah Chen",
  ownerEmail: "sarah.chen@example.com",
  createdAt: "2024-10-15T10:30:00Z",
  modifiedAt: "2025-01-08T14:22:00Z",
  thumbnailColor: "#4285F4",         // fallback color for thumbnail
  starred: false,                    // starred/favorited
  shared: true,                      // whether shared with others
  sharedWith: [                      // list of collaborators
    { email: "alex.rivera@example.com", name: "Alex Rivera", role: "editor" },
    { email: "jordan.lee@example.com", name: "Jordan Lee", role: "viewer" }
  ],
  dataSources: ["ds_001"],           // connected data source IDs
  pages: ["page_001", "page_002"],   // page IDs in order
  currentPageId: "page_001"          // currently viewed page
}
```

### 3. ReportPage

Each report contains one or more pages (like slides).

```js
page: {
  id: "page_001",
  reportId: "rpt_001",
  name: "Overview",                  // page tab name
  width: 1160,                       // canvas width in px
  height: 900,                       // canvas height in px
  backgroundColor: "#FFFFFF",
  components: ["comp_001", "comp_002", "comp_003"]  // component IDs in z-order
}
```

### 4. Component (Chart/Control/Shape)

Components are the items placed on the report canvas.

```js
component: {
  id: "comp_001",
  pageId: "page_001",
  type: "chart",                     // "chart" | "control" | "text" | "image" | "shape" | "line"
  chartType: "bar",                  // for charts: "bar" | "line" | "pie" | "table" | "scorecard" | "geo" | "scatter" | "area" | "treemap" | "pivot_table" | "gauge" | "time_series" | "combo"
  controlType: null,                 // for controls: "date_range" | "dropdown" | "fixed_list" | "input_box" | "advanced_filter" | "slider" | "checkbox" | "preset_filter" | "data_control" | "dimension_control" | "button"

  // Position & size
  x: 50,                            // left offset on canvas
  y: 120,                           // top offset on canvas
  width: 400,                       // component width
  height: 300,                      // component height

  // Data configuration (Setup tab)
  dataSourceId: "ds_001",
  dimensions: [                      // dimension fields used
    { fieldId: "dim_country", name: "Country", type: "text" }
  ],
  metrics: [                         // metric fields used
    { fieldId: "met_users", name: "Users", type: "number", aggregation: "SUM" }
  ],
  sortField: "met_users",
  sortDirection: "DESC",             // "ASC" | "DESC"
  rowLimit: 10,                      // max rows to display

  // Filter
  filters: [],

  // Style configuration (Style tab)
  style: {
    title: "Users by Country",
    showTitle: true,
    titleFontSize: 14,
    titleColor: "#202124",
    backgroundColor: "#FFFFFF",
    borderColor: "#DADCE0",
    borderWidth: 1,
    borderRadius: 0,
    fontFamily: "Roboto",
    fontSize: 12,
    colors: ["#4285F4", "#EA4335", "#FBBC04", "#34A853"], // series colors
    showLegend: true,
    legendPosition: "bottom",         // "top" | "bottom" | "left" | "right" | "none"
    showDataLabels: false,
    opacity: 1,
    padding: 16
  },

  // For scorecard type
  compactNumber: true,               // show "1.2K" instead of "1,200"
  comparisonField: null,             // field for comparison

  // For text type
  textContent: "",
  textAlign: "left",
  textBold: false,
  textItalic: false,
  textSize: 14,
  textColor: "#202124",

  // For shape/line
  shapeType: null,                   // "rectangle" | "circle" | "ellipse"
  lineStartX: null,
  lineStartY: null,
  lineEndX: null,
  lineEndY: null,
  strokeColor: "#5F6368",
  strokeWidth: 1,
  fillColor: "#FFFFFF",

  // Selection state (editor only)
  selected: false,
  locked: false
}
```

### 5. DataSource

A data source provides fields (dimensions and metrics) to charts.

```js
dataSource: {
  id: "ds_001",
  name: "Sample Website Data",
  type: "google_analytics",          // connector type label
  connectorIcon: "analytics",        // icon identifier
  createdAt: "2024-09-01T08:00:00Z",
  modifiedAt: "2025-01-05T12:00:00Z",
  ownerId: "user_001",
  ownerName: "Sarah Chen",
  fields: [
    // Dimensions
    { id: "dim_date", name: "Date", type: "date", category: "dimension" },
    { id: "dim_country", name: "Country", type: "text", category: "dimension" },
    { id: "dim_city", name: "City", type: "text", category: "dimension" },
    { id: "dim_source", name: "Source", type: "text", category: "dimension" },
    { id: "dim_medium", name: "Medium", type: "text", category: "dimension" },
    { id: "dim_channel", name: "Channel", type: "text", category: "dimension" },
    { id: "dim_device", name: "Device Category", type: "text", category: "dimension" },
    { id: "dim_browser", name: "Browser", type: "text", category: "dimension" },
    { id: "dim_os", name: "Operating System", type: "text", category: "dimension" },
    { id: "dim_page_path", name: "Page Path", type: "text", category: "dimension" },
    { id: "dim_page_title", name: "Page Title", type: "text", category: "dimension" },
    { id: "dim_campaign", name: "Campaign", type: "text", category: "dimension" },
    { id: "dim_event_name", name: "Event Name", type: "text", category: "dimension" },
    { id: "dim_age", name: "Age", type: "text", category: "dimension" },
    { id: "dim_gender", name: "Gender", type: "text", category: "dimension" },
    { id: "dim_product_name", name: "Product Name", type: "text", category: "dimension" },
    { id: "dim_product_category", name: "Product Category", type: "text", category: "dimension" },
    // Metrics
    { id: "met_users", name: "Users", type: "number", category: "metric", aggregation: "SUM" },
    { id: "met_new_users", name: "New Users", type: "number", category: "metric", aggregation: "SUM" },
    { id: "met_sessions", name: "Sessions", type: "number", category: "metric", aggregation: "SUM" },
    { id: "met_pageviews", name: "Pageviews", type: "number", category: "metric", aggregation: "SUM" },
    { id: "met_bounce_rate", name: "Bounce Rate", type: "number", category: "metric", aggregation: "AVG" },
    { id: "met_avg_session_duration", name: "Avg. Session Duration", type: "number", category: "metric", aggregation: "AVG" },
    { id: "met_conversions", name: "Conversions", type: "number", category: "metric", aggregation: "SUM" },
    { id: "met_revenue", name: "Revenue", type: "number", category: "metric", aggregation: "SUM" },
    { id: "met_transactions", name: "Transactions", type: "number", category: "metric", aggregation: "SUM" },
    { id: "met_event_count", name: "Event Count", type: "number", category: "metric", aggregation: "SUM" },
    { id: "met_conversion_rate", name: "Conversion Rate", type: "number", category: "metric", aggregation: "AVG" },
    { id: "met_cost", name: "Cost", type: "number", category: "metric", aggregation: "SUM" },
    { id: "met_cpc", name: "CPC", type: "number", category: "metric", aggregation: "AVG" },
    { id: "met_ctr", name: "CTR", type: "number", category: "metric", aggregation: "AVG" },
    { id: "met_impressions", name: "Impressions", type: "number", category: "metric", aggregation: "SUM" }
  ],
  // Mock data rows for this data source
  data: [] // populated in createInitialData(), see below
}
```

### 6. DataRow (Mock Data)

Each data source has rows of mock data used to render charts.

```js
dataRow: {
  dim_date: "2025-01-01",
  dim_country: "United States",
  dim_city: "New York",
  dim_source: "google",
  dim_medium: "organic",
  dim_channel: "Organic Search",
  dim_device: "desktop",
  dim_browser: "Chrome",
  dim_os: "Windows",
  dim_page_path: "/",
  dim_page_title: "Home",
  dim_campaign: "(none)",
  dim_event_name: "page_view",
  dim_age: "25-34",
  dim_gender: "male",
  dim_product_name: "Pro Plan",
  dim_product_category: "Subscriptions",
  met_users: 1250,
  met_new_users: 820,
  met_sessions: 1680,
  met_pageviews: 4200,
  met_bounce_rate: 42.5,
  met_avg_session_duration: 185,
  met_conversions: 45,
  met_revenue: 2250.00,
  met_transactions: 38,
  met_event_count: 8500,
  met_conversion_rate: 2.68,
  met_cost: 450.00,
  met_cpc: 0.85,
  met_ctr: 3.2,
  met_impressions: 52000
}
```

### 7. Template

Pre-built report templates shown in the template gallery.

```js
template: {
  id: "tmpl_001",
  name: "Google Analytics Overview",
  category: "Marketing",             // "Marketing" | "Sales" | "Finance" | "Operations" | "HR"
  description: "A comprehensive dashboard for website traffic and user behavior.",
  thumbnailColor: "#4285F4",
  dataSourceType: "google_analytics",
  popularity: 1200                    // for sorting
}
```

---

## Relationships

- A **User** owns multiple **Reports** and **DataSources**
- A **Report** contains multiple **ReportPages** (ordered)
- A **ReportPage** contains multiple **Components** (z-ordered)
- A **Component** references a **DataSource** (for data-driven components)
- A **DataSource** has many **Fields** (dimensions & metrics) and **DataRows**
- **Templates** are read-only report starters

---

## State Shape for createInitialData()

```js
{
  user: { ... },

  reports: [
    // 6-8 reports: mix of owned and shared, various modification dates
  ],

  dataSources: [
    // 3 data sources: "Sample Website Data", "Google Ads Campaign Data", "Sales Pipeline Data"
  ],

  templates: [
    // 8-10 templates across categories
  ],

  // The currently open report's editor state
  currentReport: {
    id: "rpt_001",
    // ... full report object
  },

  pages: {
    // keyed by page ID
    "page_001": { ... },
    "page_002": { ... }
  },

  components: {
    // keyed by component ID
    "comp_001": { ... },
    "comp_002": { ... },
    // etc.
  },

  // Editor UI state
  editor: {
    mode: "edit",                    // "edit" | "view"
    selectedComponentIds: [],         // multi-select support
    clipboard: null,                  // for copy/paste
    zoom: 100,                        // zoom percentage
    showGrid: true,
    snapToGrid: true,
    gridSize: 10,
    undoStack: [],
    redoStack: [],
    propertiesPanel: {
      visible: true,
      activeTab: "setup"              // "setup" | "style"
    },
    activeTool: "select",             // "select" | "text" | "image" | "shape" | "line"
    activeChartType: null,            // when drawing a new chart
    activeControlType: null           // when adding a new control
  },

  // Home page UI state
  home: {
    view: "recent",                   // "recent" | "owned" | "shared" | "trash"
    sortBy: "lastOpened",             // "lastOpened" | "lastModified" | "name"
    sortDirection: "desc",
    searchQuery: "",
    viewMode: "grid"                  // "grid" | "list"
  },

  // Data source management
  dataSourcesView: {
    sortBy: "lastModified",
    searchQuery: ""
  },

  // Share dialog state
  shareDialog: {
    open: false,
    reportId: null
  }
}
```

---

## Mock Data Generation Guidelines

### Reports (6-8)
- "Marketing Dashboard Q4" -- owner, modified recently, 3 pages, multiple charts
- "Sales Pipeline Report" -- owner, modified last week
- "Website Traffic Analysis" -- owner, modified last month
- "Social Media Metrics" -- shared by "Alex Rivera", viewer access
- "Q3 Revenue Report" -- shared by "Jordan Lee", editor access
- "Customer Acquisition Cost" -- owner, in trash
- "Weekly KPI Dashboard" -- owner, starred, modified yesterday
- "Campaign Performance" -- shared by "Priya Patel", viewer access

### Data Sources (3)
1. **Sample Website Data** (Google Analytics-like): 90 days of daily data, ~1200-1500 daily users, traffic from 8 channels, 10 countries, 15 pages, 12 events
2. **Google Ads Campaign Data**: 90 days, 5 campaigns, impressions/clicks/cost/conversions
3. **Sales Pipeline Data**: 60 rows of deal data with stages, amounts, close dates

### Pre-built Components for Default Report (15-20)
The "Marketing Dashboard Q4" report should come pre-populated with:
- Page 1 "Overview": 1 scorecard (Total Users), 1 scorecard (Revenue), 1 scorecard (Conversions), 1 time series chart (Users over time), 1 bar chart (Users by Channel), 1 pie chart (Users by Device), 1 table (Top Pages), 1 date range control
- Page 2 "Acquisition": 1 time series (Sessions over time), 1 bar chart (Sessions by Source/Medium), 1 geo map (Users by Country), 1 table (Campaign performance)
- Page 3 "Revenue": 1 scorecard (Total Revenue), 1 line chart (Revenue over time), 1 bar chart (Revenue by Product Category), 1 table (Top Products)

### Templates (8-10)
- Google Analytics Overview (Marketing)
- Google Ads Performance (Marketing)
- Social Media Dashboard (Marketing)
- Sales Pipeline (Sales)
- Revenue Overview (Finance)
- E-commerce Dashboard (Sales)
- SEO Performance (Marketing)
- Customer Support Metrics (Operations)
- HR Workforce Dashboard (HR)
- Project Management (Operations)
