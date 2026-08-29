# Xableau Mock -- Data Model

This document defines all entity types, their fields, relationships, and realistic example values for `dataManager.js`.

---

## 1. Workbook

Top-level container. Only one workbook is open at a time.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"wb-1"` |
| `name` | string | `"Sales Analysis"` |
| `sheetOrder` | string[] | `["ws-1","ws-2","ws-3","dash-1"]` |
| `activeSheetId` | string | `"ws-1"` |
| `dataSources` | DataSource[] | see below |

---

## 2. DataSource

A connected data source with tables/fields. We pre-load "Sample - Superstore" as the canonical dataset (matching real Xableau).

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"ds-superstore"` |
| `name` | string | `"Sample - Superstore"` |
| `connectionType` | string | `"excel"` |
| `tables` | Table[] | see below |
| `isLive` | boolean | `true` |

### 2a. Table

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"tbl-orders"` |
| `name` | string | `"Orders"` |
| `fields` | Field[] | see below |
| `rowCount` | number | `9994` |

### 2b. Field

Each field is either a dimension (categorical) or a measure (numeric).

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"fld-sales"` |
| `name` | string | `"Sales"` |
| `dataType` | enum | `"number"` / `"string"` / `"date"` / `"geo"` / `"boolean"` |
| `role` | enum | `"dimension"` / `"measure"` |
| `isGenerated` | boolean | `false` (true for Latitude/Longitude generated) |

**Superstore dimensions** (role=dimension):
- Category (string): Technology, Furniture, Office Supplies
- City (string)
- Country/Region (string)
- Customer ID (string)
- Customer Name (string)
- Order Date (date)
- Order ID (string)
- Postal Code (string)
- Product ID (string)
- Product Name (string)
- Region (string): Central, East, South, West
- Row ID (string)
- Segment (string): Consumer, Corporate, Home Office
- Ship Date (date)
- Ship Mode (string): Standard Class, Second Class, First Class, Same Day
- State (string)
- Sub-Category (string): Bookcases, Chairs, Labels, Tables, Storage, Furnishings, Art, Phones, Binders, Appliances, Paper, Accessories, Envelopes, Fasteners, Supplies, Machines, Copiers

**Superstore measures** (role=measure):
- Discount (number)
- Profit (number)
- Quantity (number)
- Sales (number)
- Latitude (generated) (number, isGenerated=true)
- Longitude (generated) (number, isGenerated=true)
- Number of Records (number, isGenerated=true)

**Special entries**:
- Measure Names (dimension, special -- represents all measure names)
- Measure Values (measure, special -- represents all measure values)

---

## 3. Worksheet

A single visualization sheet.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"ws-1"` |
| `type` | literal | `"worksheet"` |
| `name` | string | `"Sales by Category"` |
| `dataSourceId` | string | `"ds-superstore"` |
| `columns` | ShelfPill[] | pills on Columns shelf |
| `rows` | ShelfPill[] | pills on Rows shelf |
| `filters` | FilterConfig[] | active filters |
| `pages` | ShelfPill[] | pills on Pages shelf (usually empty) |
| `marks` | MarksConfig | marks card state |
| `showMeType` | enum | `"bar"` / `"line"` / `"scatter"` / `"pie"` / `"map"` / `"treemap"` / `"heatmap"` / `"text"` / `"area"` / `"histogram"` / `"gantt"` / `"bullet"` / `"packed-bubble"` |
| `chartData` | object | pre-computed chart data for rendering (see section 7) |

### 3a. ShelfPill

A field placed on a shelf.

| Field | Type | Example |
|-------|------|---------|
| `fieldId` | string | `"fld-sales"` |
| `fieldName` | string | `"Sales"` |
| `aggregation` | string/null | `"SUM"` / `"AVG"` / `"COUNT"` / `"MIN"` / `"MAX"` / `"MEDIAN"` / `null` |
| `dateGranularity` | string/null | `"YEAR"` / `"QUARTER"` / `"MONTH"` / `"DAY"` / `null` |
| `isDiscrete` | boolean | `true` = blue pill, `false` = green pill |
| `sortOrder` | string/null | `"asc"` / `"desc"` / `null` |

### 3b. MarksConfig

| Field | Type | Example |
|-------|------|---------|
| `markType` | enum | `"Automatic"` / `"Bar"` / `"Line"` / `"Area"` / `"Square"` / `"Circle"` / `"Shape"` / `"Text"` / `"Map"` / `"Pie"` / `"Gantt Bar"` / `"Polygon"` / `"Density"` |
| `color` | ShelfPill/null | field on Color |
| `size` | ShelfPill/null | field on Size |
| `label` | ShelfPill/null | field on Label |
| `detail` | ShelfPill/null | field on Detail |
| `tooltip` | ShelfPill[] | fields on Tooltip |
| `path` | ShelfPill/null | field on Path |

### 3c. FilterConfig

| Field | Type | Example |
|-------|------|---------|
| `fieldId` | string | `"fld-region"` |
| `fieldName` | string | `"Region"` |
| `filterType` | enum | `"categorical"` / `"range"` / `"relative-date"` |
| `selectedValues` | string[] | `["East","West"]` (for categorical) |
| `rangeMin` | number/null | `0` (for range) |
| `rangeMax` | number/null | `1000` (for range) |
| `showFilter` | boolean | `true` (show as interactive filter card in view) |

---

## 4. Dashboard

A layout of multiple worksheets and objects.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"dash-1"` |
| `type` | literal | `"dashboard"` |
| `name` | string | `"Sales Dashboard"` |
| `size` | object | `{ width: 1200, height: 800, sizing: "fixed" }` |
| `objects` | DashboardObject[] | positioned items |

### 4a. DashboardObject

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"dobj-1"` |
| `objectType` | enum | `"worksheet"` / `"text"` / `"image"` / `"blank"` / `"filter"` / `"legend"` |
| `sheetId` | string/null | `"ws-1"` (if objectType=worksheet) |
| `content` | string/null | text content (if objectType=text) |
| `layout` | object | `{ x: 0, y: 0, width: 600, height: 400 }` |
| `isFloating` | boolean | `false` |

---

## 5. Calculated Field

User-created calculated fields.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"calc-1"` |
| `name` | string | `"Profit Ratio"` |
| `formula` | string | `"SUM([Profit]) / SUM([Sales])"` |
| `dataType` | string | `"number"` |
| `role` | string | `"measure"` |
| `dataSourceId` | string | `"ds-superstore"` |

---

## 6. Parameter

User-defined parameters.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"param-1"` |
| `name` | string | `"Top N"` |
| `dataType` | string | `"integer"` |
| `currentValue` | any | `10` |
| `allowableValues` | object | `{ type: "range", min: 1, max: 50, step: 1 }` |
| `displayAs` | string | `"slider"` / `"type-in"` / `"list"` |

---

## 7. Chart Data (Pre-computed for rendering)

Since we cannot run real analytics, each worksheet has pre-computed `chartData` matching its shelf configuration. This allows the mock to render realistic-looking charts.

### Bar chart example:
```json
{
  "type": "bar",
  "categories": ["Furniture", "Office Supplies", "Technology"],
  "series": [
    { "name": "Sales", "values": [741999, 719047, 836154] }
  ],
  "colorField": null
}
```

### Line chart example:
```json
{
  "type": "line",
  "xAxis": ["2019", "2020", "2021", "2022"],
  "series": [
    { "name": "Consumer", "values": [134119, 155467, 178245, 200417] },
    { "name": "Corporate", "values": [91979, 107532, 122218, 139562] },
    { "name": "Home Office", "values": [60455, 74102, 82905, 96262] }
  ]
}
```

### Scatter plot example:
```json
{
  "type": "scatter",
  "points": [
    { "x": 261.96, "y": 41.91, "label": "Bookcases", "color": "Furniture" },
    { "x": 731.94, "y": 219.58, "label": "Chairs", "color": "Furniture" }
  ]
}
```

---

## 8. UI State

Non-data state tracked for the UI.

| Field | Type | Example |
|-------|------|---------|
| `sidebarTab` | enum | `"data"` / `"analytics"` |
| `sidebarCollapsed` | boolean | `false` |
| `showMeOpen` | boolean | `false` |
| `activeView` | enum | `"worksheet"` / `"datasource"` / `"dashboard"` |
| `selectedFields` | string[] | currently selected fields in data pane |
| `dragState` | object/null | `{ fieldId, source, target }` |
| `undoStack` | object[] | previous states for undo |
| `redoStack` | object[] | states for redo |

---

## 9. createInitialData() Structure

```javascript
{
  workbook: {
    id: "wb-1",
    name: "Sales Analysis",
    sheetOrder: ["ws-1", "ws-2", "ws-3", "dash-1"],
    activeSheetId: "ws-1"
  },
  dataSources: [ /* DataSource objects with tables & fields */ ],
  worksheets: [
    // ws-1: "Sales by Category" -- horizontal bar chart
    // ws-2: "Profit Trend" -- line chart over time
    // ws-3: "Sales vs Profit" -- scatter plot
  ],
  dashboards: [
    // dash-1: "Sales Dashboard" combining ws-1 and ws-2
  ],
  calculatedFields: [
    // "Profit Ratio" = SUM(Profit)/SUM(Sales)
  ],
  parameters: [
    // "Top N" = 10
  ],
  uiState: {
    sidebarTab: "data",
    sidebarCollapsed: false,
    showMeOpen: false,
    activeView: "worksheet",
    selectedFields: [],
    dragState: null,
    undoStack: [],
    redoStack: []
  },
  currentUser: {
    name: "Sarah Chen",
    role: "Analyst"
  }
}
```

---

## Entity Relationship Summary

```
Workbook
  |-- has many DataSources
  |     |-- has many Tables
  |           |-- has many Fields
  |-- has many Worksheets
  |     |-- references DataSource
  |     |-- has Columns/Rows (ShelfPill[])
  |     |-- has Filters (FilterConfig[])
  |     |-- has MarksConfig
  |     |-- has chartData (pre-computed)
  |-- has many Dashboards
  |     |-- has many DashboardObjects
  |           |-- references Worksheet (optional)
  |-- has many CalculatedFields
  |-- has many Parameters
  |-- has UIState
```
