# Xooker Studio Mock -- Research & Asset Index

## App Overview

Xooker Studio (formerly Google Data Studio) is Google's free, web-based business intelligence and data visualization tool. It allows users to create interactive dashboards and reports by connecting to various data sources and placing charts, tables, scorecards, and controls on a drag-and-drop canvas. Reports can be shared with collaborators and viewed interactively.

## Key User Personas

1. **Marketing Analyst** (primary): Creates and edits dashboards to track website traffic, campaign performance, and conversion metrics. Spends most time in the report editor adding/configuring charts.
2. **Business Stakeholder** (secondary): Views shared reports, uses date range controls and filters to explore data, exports/downloads reports.
3. **Data Team Lead**: Manages data sources, creates templates, shares reports with the team.

## Primary Workflows

1. **Home page browsing**: View recent reports, search for reports, create new report, open template gallery
2. **Report editing**: Open report editor, add charts/controls to canvas, configure chart data (dimensions/metrics), style charts, arrange/resize components
3. **Report viewing**: Switch to view mode, interact with date range controls and filters, drill down into charts
4. **Data source management**: View data sources list, create new data source (simplified), edit field properties
5. **Sharing and collaboration**: Share reports with people, set access levels (viewer/editor)

## Feature List by Priority

### P0 -- Core Shell
- App layout with header, home/editor routing
- Xooker Studio branding (logo, Google-style header)
- State management with dataManager.js and AppContext
- `/go` endpoint for state inspection
- Session isolation for RL training

### P1 -- Primary Features
- **Home page** with report list (recent, owned, shared, trash views)
- **Template gallery** row on home page
- **Report editor** with menu bar and toolbar
- **Canvas** with drag-and-drop component placement
- **Properties panel** (Setup and Style tabs) for component configuration
- **Chart rendering** (bar, line, pie, table, scorecard, time series, geo, scatter, area, treemap)
- **Control components** (date range picker, dropdown filter)
- **Component selection, resize, move, delete**
- **Page management** (multiple pages with tab navigation)
- **View mode** for viewing reports interactively
- **Share dialog** modal
- **Undo/redo** for editor actions

### P2 -- Secondary Features
- Report renaming from editor
- Zoom controls
- Grid/snap-to-grid
- Copy/paste components
- Data source list page
- Report search and filtering on home page
- Sort reports by different criteria
- Template gallery full page
- Right-click context menu on components
- Component alignment tools
- Chart type switching in properties panel
- Add data source to report
- Report download/export (mock)

## UI Layout Description

### Home Page
- **Top header** (64px): Xooker Studio logo (blue interconnected circles icon + "Xooker Studio" text), centered search bar (rounded, gray background, "Search all items" placeholder), right side: create button (+), help icon, settings gear, user avatar
- **Navigation tabs** below header: "Recent" | "Owned by me" | "Shared with me" | "Trash" as tab buttons
- **Template gallery** strip: horizontal scrolling row of template cards (small preview thumbnails with labels), "Template Gallery" heading with arrow link
- **Report list**: Either grid view (cards with thumbnail, title, owner, last modified) or list view (rows with icon, name, owner, modified date). Sortable columns.
- **Create button**: Floating action button or header button, opens menu: "Report", "Data source", "Explorer"

### Report Editor
- **Menu bar** (40px): File | Edit | View | Insert | Format | Arrange | Page | Resource | Help
- **Toolbar** (48px): Undo/Redo arrows, Select tool (cursor icon), Add data, Add a chart (dropdown with all chart types), Add a control (dropdown with all control types), Insert URL/image, Text tool, Line tool, Shape tool, then separator, then right-side: Edit/View toggle, Share button
- **Canvas area**: Gray background with centered white rectangle (default 1160x900px). Components are placed on the canvas with drag-and-drop.
- **Properties panel** (300px, right side): Appears when a component is selected. Two tabs: "SETUP" and "STYLE". Setup tab shows: data source selector, dimension pills, metric pills, sort options, filter options. Style tab shows: color pickers, font selectors, alignment options, border, background, legend position, etc.
- **Page tabs** (bottom, 32px): Horizontal tabs showing page names ("Page 1", "Page 2", etc.) with + button to add new page. Right-click for rename/delete/duplicate.

### Report View Mode
- Same canvas display but without toolbar/properties panel
- Interactive controls (date range pickers, filters) are active
- Charts show tooltips on hover
- Header shows report name, share button, edit button (pencil icon)

## Data Model Overview

See `assets/data_model.md` for complete specification. Key entities:
- **User**: The logged-in user (pre-authenticated as Sarah Chen)
- **Report**: Dashboard documents with metadata, sharing, pages
- **ReportPage**: Canvas pages within a report
- **Component**: Charts, controls, text, shapes placed on canvas
- **DataSource**: Connected data providers with fields (dimensions/metrics) and mock data rows
- **Template**: Pre-built report starters

## Screenshot Index

### Original Downloads (assets/screenshots/)
- `editor_000005.jpg` -- **BEST REFERENCE**: Shows the share dialog modal with "Share with people and groups" overlay. Shows header with project name, Reports/Data sources tabs, report list behind the modal with name column and date. Modal shows user list with roles (Manager, Content Manager, Contributor) and role dropdowns. "Add people and groups" input, "Pending changes" text, blue "Save" button.
- `specific_000001.jpg` -- **VALUABLE**: Shows the "Add a control" dropdown menu from toolbar with all control types listed: Drop-down list, Fixed-size list, Input box, Advanced filter, Slider, Checkbox, Preset filter, Date range control, Data control, Dimension control, Button. Also shows the SETUP/STYLE tabs in the properties panel on the right.
- `dashboard_000002.jpg` / `home_000004.jpg` -- Stock photo showing laptop with Xooker Studio-like dashboard (scorecards at top, pie chart, line chart, bar chart, geo map visible on screen). Gives sense of typical dashboard layout.
- `panel_000003.jpg` -- Illustration of combo chart in Xooker Studio (bar + line overlay)

### Reference Downloads (assets/screenshots/reference/)
- Most are tutorial thumbnails/illustrations, not actual UI screenshots
- `000001.jpg` -- Simple illustration of Xooker Studio interface concept (search bar + cards)

## Notes on What to Skip

- **Authentication**: App starts pre-logged-in as "Sarah Chen"
- **Real data connections**: All data is mock/seeded, no actual Google Analytics or BigQuery connections
- **File uploads**: No real file upload to servers
- **Real-time collaboration**: No WebSocket or real-time multi-user editing
- **Community visualizations**: Only built-in chart types
- **Scheduled email delivery**: Not implemented
- **Data blending**: Complex data joining between sources not needed
- **Calculated fields**: Full formula editor not needed (can show UI but calculations are mock)
