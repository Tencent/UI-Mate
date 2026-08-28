# looker_studio_mock Schema

**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Active user: `{id, name, email, avatarUrl, avatarColor}` |
| `reports` | array | All reports. Each: `{id, name, description, thumbnail, createdAt, modifiedAt, ownerId, ownerName, shared, starred, published, publishedUrl, pages[], components[], dateRange, filters, settings}` |
| `dataSources` | array | Connected data sources. Each: `{id, name, type, connectorIcon, createdAt, modifiedAt, ownerId, ownerName, fields[], data[]}` -- `fields[]`: `{id, name, type, category, aggregation}` |
| `templates` | array | Report templates. Each: `{id, name, description, category, thumbnail, pages[], components[]}` |
| `currentReport` | object\|null | Currently open report (same shape as `reports[]` entries) |
| `pages` | array | Pages in current report. Each: `{id, name, reportId, width, height, background, order}` |
| `components` | array | Chart/control components on pages. Each: `{id, type, pageId, x, y, width, height, dataSourceId, config, style}` |
| `editor` | object | Editor UI state: `{mode, selectedComponentIds[], clipboard, zoom, showGrid, snapToGrid, gridSize, undoStack[], redoStack[], propertiesPanel, activeTool, activeChartType, activeControlType, isDrawing, drawStart}` |
| `home` | object | Home page UI state: `{view, sortBy, sortDirection, searchQuery, viewMode}` |
| `dataSourcesView` | object | Data sources page state: `{sortBy, searchQuery}` |
| `shareDialog` | object | Share dialog state: `{open, reportId}` |
| `connectorDialog` | object | Connector dialog state: `{open}` |
| `publishDialog` | object | Publish dialog state: `{open, reportId}` |

### Default data source types
`google_analytics`, `google_ads`, `google_sheets`

### Default user ID
`user_001` (Sarah Chen)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "user": {
      "id": "user_001",
      "name": "Sarah Chen",
      "email": "sarah.chen@example.com",
      "avatarUrl": null,
      "avatarColor": "#4285F4"
    },
    "reports": [],
    "dataSources": [],
    "templates": [],
    "currentReport": null,
    "pages": [],
    "components": [],
    "editor": {
      "mode": "edit",
      "selectedComponentIds": [],
      "clipboard": null,
      "zoom": 100,
      "showGrid": true,
      "snapToGrid": true,
      "gridSize": 10,
      "undoStack": [],
      "redoStack": [],
      "propertiesPanel": { "visible": true, "activeTab": "setup" },
      "activeTool": "select"
    },
    "home": { "view": "recent", "sortBy": "lastOpened", "sortDirection": "desc", "searchQuery": "", "viewMode": "grid" },
    "dataSourcesView": { "sortBy": "lastModified", "searchQuery": "" },
    "shareDialog": { "open": false, "reportId": null },
    "connectorDialog": { "open": false },
    "publishDialog": { "open": false, "reportId": null }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Create new report | `reports` array grows; `currentReport` updated |
| Open report | `currentReport` set to the selected report |
| Rename report | `reports[i].name` updated; `currentReport.name` if open |
| Delete report | `reports` array shrinks |
| Star/unstar report | `reports[i].starred` toggled |
| Add data source | `dataSources` array grows |
| Add component to page | `components` array grows |
| Move/resize component | `components[i].x`, `y`, `width`, `height` updated |
| Delete component | `components` array shrinks |
| Select component | `editor.selectedComponentIds` updated |
| Change editor zoom | `editor.zoom` updated |
| Toggle grid | `editor.showGrid` toggled |
| Change sort/filter on home | `home.sortBy`, `home.searchQuery` updated |
| Share report | `reports[i].shared` updated; `shareDialog` state changes |
| Publish report | `reports[i].published` set to true; `reports[i].publishedUrl` set |
| Add page | `pages` array grows |
| Delete page | `pages` array shrinks |
| Switch tool | `editor.activeTool` updated |
