# tableau_mock Schema

**Base URL**: `http://localhost:5173/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → stored state object

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `workbook` | object | `{id, name, sheetOrder[], activeSheetId}` — `sheetOrder` is ordered array of sheet IDs (worksheet + dashboard IDs). `activeSheetId` can be a worksheet ID, dashboard ID, or `"datasource"` |
| `dataSources` | array | Each: `{id, name, connectionType, isLive, tables[]}` — each table: `{id, name, rowCount, fields[], sampleRows[]}` — each field: `{id, name, dataType, role, isGenerated, isSpecial?}` — `role` is `"dimension"` or `"measure"`, `dataType` is `"string"`, `"number"`, or `"date"` |
| `worksheets` | array | Each: `{id, type:"worksheet", name, dataSourceId, columns[], rows[], filters[], pages[], marks{}, showMeType, chartData, tabColor?}` — columns/rows are shelf pill arrays (see pill shape below) |
| `dashboards` | array | Each: `{id, type:"dashboard", name, size{width,height,sizing}, objects[], tabColor?}` — each object: `{id, objectType, sheetId, content, layout{x,y,width,height}, isFloating}` — `objectType` is `"worksheet"`, `"text"`, `"horizontal"`, `"vertical"`, or `"blank"` |
| `calculatedFields` | array | Each: `{id, name, formula, dataType, role, dataSourceId}` |
| `parameters` | array | Each: `{id, name, dataType, currentValue, allowableValues{type,min,max,step}, displayAs}` |
| `uiState` | object | `{sidebarTab, sidebarCollapsed, showMeOpen, activeView, selectedFields[], dragState, undoStack[], redoStack[]}` — `sidebarTab` is `"data"` or `"analytics"`, `activeView` is `"worksheet"`, `"dashboard"`, or `"datasource"` |
| `currentUser` | object | `{name, role}` |

### Shelf Pill Shape

Each pill in `columns[]`, `rows[]`, `pages[]`, `filters[]`:

```json
{
  "fieldId": "fld-sales",
  "fieldName": "Sales",
  "aggregation": "SUM",
  "dateGranularity": null,
  "isDiscrete": false,
  "sortOrder": null
}
```

### Marks Card Shape

```json
{
  "markType": "Automatic",
  "color": null,
  "size": null,
  "label": null,
  "detail": null,
  "tooltip": [],
  "path": null
}
```
`color`, `size`, `label`, `detail`, `path` are either `null` or a single pill object. `tooltip` is an array of pill objects.

### Filter Config Shape

Each entry in `worksheets[].filters[]`:

```json
{
  "fieldId": "fld-region",
  "fieldName": "Region",
  "filterType": "categorical",
  "selectedValues": ["East", "West"],
  "rangeMin": null,
  "rangeMax": null,
  "showFilter": true
}
```
`filterType` is `"categorical"` or `"range"`.

### Default IDs

**Worksheets**: `ws-1` (Sales by Category), `ws-2` (Profit Trend), `ws-3` (Sales vs Profit), `ws-4` (Regional Sales)

**Dashboards**: `dash-1` (Sales Dashboard)

**Data source**: `ds-superstore` (Sample - Superstore)

**Tables**: `tbl-orders`, `tbl-people`, `tbl-returns`

**Key field IDs**: `fld-sales`, `fld-profit`, `fld-category`, `fld-region`, `fld-segment`, `fld-order-date`, `fld-sub-category`, `fld-quantity`, `fld-discount`

**Dashboard objects**: `dobj-1` (ws-1 at x:0,y:0), `dobj-2` (ws-2 at x:600,y:0)

**Calculated field**: `calc-1` (Profit Ratio)

**Parameter**: `param-1` (Top N, default value 10)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "workbook": {
      "id": "wb-1",
      "name": "Sales Analysis",
      "sheetOrder": ["ws-1"],
      "activeSheetId": "ws-1"
    },
    "dataSources": [],
    "worksheets": [
      {
        "id": "ws-1",
        "type": "worksheet",
        "name": "Sales by Category",
        "dataSourceId": "ds-superstore",
        "columns": [
          { "fieldId": "fld-sales", "fieldName": "Sales", "aggregation": "SUM", "dateGranularity": null, "isDiscrete": false, "sortOrder": null }
        ],
        "rows": [
          { "fieldId": "fld-category", "fieldName": "Category", "aggregation": null, "dateGranularity": null, "isDiscrete": true, "sortOrder": null }
        ],
        "filters": [],
        "pages": [],
        "marks": { "markType": "Automatic", "color": null, "size": null, "label": null, "detail": null, "tooltip": [], "path": null },
        "showMeType": "bar",
        "chartData": {
          "type": "bar",
          "categories": ["Furniture", "Office Supplies", "Technology"],
          "series": [{ "name": "Sales", "values": [741999, 719047, 836154] }],
          "colorField": null
        }
      }
    ],
    "dashboards": [],
    "calculatedFields": [],
    "parameters": [],
    "uiState": {
      "sidebarTab": "data",
      "sidebarCollapsed": false,
      "showMeOpen": false,
      "activeView": "worksheet",
      "selectedFields": [],
      "dragState": null,
      "undoStack": [],
      "redoStack": []
    },
    "currentUser": { "name": "Sarah Chen", "role": "Analyst" }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Drag field to Columns shelf | `worksheets[i].columns` array grows by 1 |
| Drag field to Rows shelf | `worksheets[i].rows` array grows by 1 |
| Drag field to Filters shelf | `worksheets[i].filters` array grows by 1 |
| Drop field onto Marks > Color | `worksheets[i].marks.color` set to pill object |
| Drop field onto Marks > Size | `worksheets[i].marks.size` set to pill object |
| Drop field onto Marks > Label | `worksheets[i].marks.label` set to pill object |
| Drop field onto Marks > Detail | `worksheets[i].marks.detail` set to pill object |
| Drop field onto Marks > Tooltip | `worksheets[i].marks.tooltip` array grows by 1 |
| Remove pill from shelf (× button or context menu) | `worksheets[i].columns` or `.rows` array shrinks |
| Right-click pill > change aggregation | `worksheets[i].[shelf][j].aggregation` updated |
| Right-click pill > Discrete/Continuous | `worksheets[i].[shelf][j].isDiscrete` toggled |
| Right-click pill > date granularity | `worksheets[i].[shelf][j].dateGranularity` updated |
| Double-click pill > rename | `worksheets[i].[shelf][j].fieldName` updated |
| Reorder pills within shelf | `worksheets[i].[shelf]` array re-ordered |
| Change mark type (Marks dropdown) | `worksheets[i].marks.markType` updated |
| Click Show Me chart type | `worksheets[i].showMeType` updated |
| Filter dialog OK | `worksheets[i].filters[j].selectedValues` or `.rangeMin`/`.rangeMax` updated |
| Swap Rows/Columns toolbar button | `worksheets[i].columns` and `.rows` exchanged |
| Click sheet tab | `workbook.activeSheetId` updated; `uiState.activeView` updated |
| Create new worksheet (+ button) | `worksheets` array grows; `workbook.sheetOrder` grows; `workbook.activeSheetId` = new sheet |
| Create new dashboard (dashboard + button) | `dashboards` array grows; `workbook.sheetOrder` grows |
| Rename sheet (double-click tab) | `worksheets[i].name` or `dashboards[i].name` updated |
| Delete sheet (right-click > Delete) | `worksheets` or `dashboards` array shrinks; `workbook.sheetOrder` shrinks |
| Duplicate sheet (right-click > Duplicate) | `worksheets` array grows; `workbook.sheetOrder` grows |
| Set tab color (right-click > Color) | `worksheets[i].tabColor` or `dashboards[i].tabColor` set |
| Click Analytics sidebar tab | `uiState.sidebarTab` = `"analytics"` |
| Click Data sidebar tab | `uiState.sidebarTab` = `"data"` |
| Toggle Show Me panel | `uiState.showMeOpen` toggled |
| Drag worksheet to dashboard canvas | `dashboards[i].objects` array grows by 1 |
| Move/resize dashboard object | `dashboards[i].objects[j].layout` updated |
| Remove dashboard object | `dashboards[i].objects` array shrinks |
| Duplicate field in Data pane | `dataSources[0].tables[0].fields` grows by 1 (name suffixed with ` (2)`) |
| Convert field dimension ↔ measure | `dataSources[0].tables[0].fields[j].role` toggled |
