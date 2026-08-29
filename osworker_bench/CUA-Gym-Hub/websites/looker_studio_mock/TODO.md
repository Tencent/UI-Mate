# Xooker Studio Mock -- TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Design: `DESIGN.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Core Shell

- [x] **Project scaffold**: `npm create vite@latest looker_studio_mock -- --template react`, install deps: `react-router-dom`, `recharts`, `lucide-react`, `date-fns`. Set up `index.html` with title "Xooker Studio". Import Google Fonts: `Roboto` (weights 300,400,500) and use system fallback for "Google Sans" (just use `"Product Sans", Roboto, sans-serif`).

- [x] **App layout -- Home page**: White background `#FFFFFF`, full viewport. **Top header** 64px tall, white bg, border-bottom `1px solid #DADCE0`, contains from left: Xooker Studio icon (blue interconnected circles SVG -- two overlapping circles with a small dot, rendered in `#4285F4`) + text "Xooker Studio" in 18px `#5F6368`. Center: search bar 480px wide, 40px tall, `#F1F3F4` bg, 20px border-radius, magnifying glass icon left, placeholder "Search all items" in `#80868B`. Right side: blue "+" Create button (24px circle or pill shape, `#1A73E8` bg, white + icon), help "?" icon in `#5F6368`, user avatar circle (36px, `#4285F4` bg with white initials "SC"). Below header: tab navigation bar -- "Recent", "Owned by me", "Shared with me", "Trash" as text tabs, active tab underlined in `#1A73E8` with blue text, inactive in `#5F6368`. Content area below is centered max-width 960px with 24px padding.

- [x] **App layout -- Report Editor**: Full viewport, no scroll on outer frame. **Menu bar** 40px tall, white bg, border-bottom `1px solid #DADCE0`, contains: back arrow (left arrow icon linking to `/`), report name (editable text, 16px, click to rename), then menu items: File, Edit, View, Insert, Format, Arrange, Page, Resource, Help -- each 14px text, 4px 12px padding, hover bg `#F1F3F4`. Right side of menu bar: blue "View" button (switches to view mode) and blue "Share" button. **Toolbar** 48px tall, `#F8F9FA` bg, border-bottom `1px solid #DADCE0`, contains icon buttons left-to-right: Undo (rotate-ccw), Redo (rotate-cw), separator line, Select tool (cursor/pointer), Add a chart (bar-chart icon with dropdown caret), Add a control (sliders icon with dropdown caret), Insert URL (link icon), Insert Image (image icon), Text (type/T icon), Line (diagonal line icon), Shape (square icon). See DESIGN.md toolbar button styles. **Canvas area** fills remaining space, bg `#F0F0F0`, with centered white rectangle (report page). **Properties panel** 300px wide on right side, white bg, border-left `1px solid #DADCE0`, with "SETUP" and "STYLE" tab bar at top, scrollable content below. **Page tabs** bar at bottom of canvas area, 32px tall, white bg, border-top `1px solid #DADCE0`, shows page tabs + "+" add page button.

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes: `/` -> Home page, `/report/:id` -> Report Editor (edit mode), `/report/:id/view` -> Report Viewer (view mode), `/datasources` -> Data Sources list page, `/templates` -> Template Gallery, `/go` -> State Inspector. Use URL search params `?sid=<sid>` for session isolation.

- [x] **State management**: `AppContext.jsx` wrapping the app + `utils/dataManager.js`. dataManager exports `createInitialData()` returning the full state shape defined in `assets/data_model.md`. AppContext provides `state` and `dispatch` (useReducer). Actions: `SET_STATE`, `UPDATE_REPORT`, `ADD_COMPONENT`, `UPDATE_COMPONENT`, `DELETE_COMPONENT`, `MOVE_COMPONENT`, `RESIZE_COMPONENT`, `SELECT_COMPONENT`, `DESELECT_ALL`, `SET_EDITOR_MODE`, `ADD_PAGE`, `DELETE_PAGE`, `RENAME_PAGE`, `SET_CURRENT_PAGE`, `SET_HOME_VIEW`, `SET_HOME_SORT`, `SET_SEARCH_QUERY`, `TOGGLE_STAR`, `MOVE_TO_TRASH`, `RESTORE_FROM_TRASH`, `UNDO`, `REDO`. Persist to localStorage under key `looker_studio_mock_state`.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route at `/go`. Returns JSON with `{ initial_state, current_state, state_diff }`. Computes diff by deep-comparing initial vs current state. Renders as formatted JSON in a `<pre>` block.

- [x] **Session isolation**: `vite.config.js` mock-api plugin handling `POST /post?sid=<sid>` (accepts `{"action":"set","state":{...}}` to set both initial and current, `{"action":"set_current","state":{...}}` for current only, `{"action":"reset"}` to reset), `GET /state?sid=<sid>` (get current state), `GET /go?sid=<sid>` (returns `{initial_state, current_state, state_diff}`). dataManager session helpers: `getSessionId()`, `fetchCustomState(sid)`, `saveState(sid, state)`, `initializeData(sid, customState)`.

---

## P1 -- Primary Features

### Home Page

- [x] **Template gallery row**: Below the nav tabs, section heading "Start with a Template" in 16px `#202124` with "Template Gallery" link arrow on the right (blue text). Horizontal scrolling row of template cards.

- [x] **Report list -- Grid view**: Below template gallery. Default view shows reports as a grid of cards.

- [x] **Report list -- List view**: Alternative to grid. Toggle between grid/list with icon buttons (grid icon, list icon) in the top-right of the report list area. List view: table rows, each row 48px tall. Columns: icon (small colored square), Name (14px, clickable link), Owner (12px), Last opened (12px relative time, sortable). Row hover: light gray bg `#F8F9FA`. Three-dot menu on hover at row end.

- [x] **Home navigation tabs**: "Recent" shows all reports sorted by last opened. "Owned by me" filters `reports.filter(r => r.ownerId === user.id && !r.trashed)`. "Shared with me" filters `reports.filter(r => r.ownerId !== user.id && !r.trashed)`. "Trash" filters `reports.filter(r => r.trashed)`. Active tab stores in `state.home.view`. Tab underline animation on switch.

- [x] **Home search bar**: Typing in the header search bar filters the report list in real-time by report name (case-insensitive substring match). Updates `state.home.searchQuery`. Shows "No results" empty state if no matches. Clear button (X) on the right of search input when query is non-empty.

- [x] **Create button menu**: Clicking "+" Create button in header opens dropdown menu with 3 items: "Report" (bar-chart icon), "Data source" (database icon), "Explorer" (compass icon). Clicking "Report" creates a new blank report object (with one empty page, generated ID), adds to `state.reports`, and navigates to `/report/<new_id>`. "Data source" and "Explorer" can show a toast "Coming soon" or navigate to a placeholder.

- [x] **Sort dropdown**: Above the report list, right-aligned, a "Last opened by me" dropdown (or "Last modified", "Title"). Selecting changes `state.home.sortBy` and re-sorts the visible list.

### Report Editor -- Canvas & Components

- [x] **Canvas rendering**: The report page canvas is a white rectangle (`page.width` x `page.height`, default 1160x900) centered in the gray canvas area. Components render as positioned `<div>`s inside the canvas using absolute positioning (`x`, `y`, `width`, `height` from component data). Canvas is zoomable (see editor.zoom, apply CSS transform scale). Gray area outside canvas is `#F0F0F0`. Canvas has optional grid lines (10px spacing, very light `#E8EAED` lines) controlled by `editor.showGrid`.

- [x] **Component selection**: Clicking a component on the canvas selects it: sets `editor.selectedComponentIds = [comp.id]`, shows 8 blue resize handles (4 corners + 4 midpoints, 8px squares, `#4285F4` fill) and a `2px solid #4285F4` border around the component. Clicking empty canvas area deselects all. Shift+click for multi-select. Selected component's properties show in the right panel.

- [x] **Component drag to move**: When a selected component is dragged (mousedown on component body, not on handles), move it by updating `component.x` and `component.y` based on mouse delta. Show position guide lines (blue dashed lines) when aligned with other components' edges. On mouseup, commit position. Push to undo stack.

- [x] **Component resize**: Dragging a resize handle changes `component.width` and/or `component.height` (and potentially `x`/`y` for top/left handles). Maintain minimum size 50x30. On mouseup, commit size. Push to undo stack.

- [x] **Component delete**: Pressing Delete or Backspace key when a component is selected removes it from the page's component list and from `state.components`. Also accessible via right-click context menu "Delete" or Edit menu "Delete".

- [x] **Add chart via toolbar**: Clicking "Add a chart" toolbar button opens a dropdown menu organized in sections. Sections with chart type icons: **Table** (table, pivot table), **Scorecard** (scorecard), **Time series** (time series), **Bar** (bar chart, stacked bar, 100% stacked bar, column chart, stacked column, 100% stacked column), **Line** (line chart, sparkline, smooth line), **Area** (area chart, stacked area, 100% stacked area), **Pie** (pie chart, donut chart), **Google Maps** (google maps, geo chart), **Scatter** (scatter chart, bubble chart), **Gauge** (gauge), **Treemap** (treemap), **Combo** (combo chart). Each item shows a small icon + label. On click: set `editor.activeTool = 'chart'` and `editor.activeChartType = '<type>'`, then user draws a rectangle on the canvas (mousedown -> drag -> mouseup creates a component with that position/size and chart type). New component gets default dimensions/metrics from the first data source.

- [x] **Add control via toolbar**: Clicking "Add a control" button opens dropdown. Control types: Drop-down list, Fixed-size list, Input box, Advanced filter, Slider, Checkbox, Preset filter, Date range control, Data control, Dimension control, Button. On click: set active tool to control, user draws on canvas, creates control component. Reference screenshot `specific_000001.jpg` for exact menu layout.

- [x] **Add text/image/shape/line**: Clicking Text tool, then drawing on canvas creates a text component with an editable text area. Image tool opens a URL input dialog then places an image component. Shape tool creates a rectangle (default) with fill and stroke. Line tool creates a line between two points.

### Report Editor -- Properties Panel

- [x] **Properties panel -- Setup tab**: When a chart component is selected, the Setup tab shows: (1) **Chart type** section at top -- shows current chart type icon + name, click opens a chart type picker grid to change the type. (2) **Data source** -- dropdown showing current data source name with a colored icon, click to switch data source. (3) **Dimension** section -- shows current dimension pills (green-tinted chips with field name), click pill to change field (opens field picker dropdown listing all dimension fields from the data source), "Add dimension" link to add another. (4) **Metric** section -- same as dimension but blue-tinted pills, shows aggregation type (SUM, AVG, etc.) next to field name. (5) **Sort** section -- field picker + ASC/DESC toggle. (6) **Default date range** -- Auto or Custom. (7) **Filter** section -- "Add a filter" link. Each section separated by thin divider line.

- [x] **Properties panel -- Style tab**: When a chart component is selected, the Style tab shows: (1) **Title** -- text input for chart title, show/hide toggle. (2) **Color** section -- color picker for series colors (clickable color swatches opening a color palette). (3) **Font** section -- font family dropdown, font size input. (4) **Background & border** -- background color picker, border color picker, border weight slider. (5) **Legend** -- show/hide toggle, position dropdown (Top, Bottom, Left, Right). (6) **Axis** section (for charts with axes) -- show/hide axis labels, axis title. (7) **Data labels** -- show/hide toggle. (8) **Padding** -- numeric input. Each property change updates `component.style.*` in state immediately.

- [x] **Properties panel -- Control setup**: When a control component is selected (e.g., date range, dropdown), Setup tab shows: Data source, Control field (which dimension to filter on), Metric (optional), Default selection. Style tab shows: font, colors, border, alignment. Date range control Setup shows: default date range preset options (Auto, Custom, Today, Yesterday, Last 7/28/90 days, This month, Last month).

- [x] **Properties panel -- Text/Shape**: When text selected: Setup tab is empty or shows "No data configuration". Style tab shows: font family, font size, bold/italic/underline toggles, text color picker, text alignment (left/center/right), background color, border. When shape selected: Style tab shows fill color, border color, border width, border radius, opacity slider.

### Report Editor -- Menus

- [x] **File menu**: Dropdown items: New report, Rename, Make a copy, Move to trash, Download as PDF (mock -- shows toast "Downloaded"), Download as CSV (mock), Report settings (opens a dialog with page size, canvas color), separator, separator. Each item: 14px text, optional keyboard shortcut text right-aligned in `#80868B`.

- [x] **Edit menu**: Undo (Ctrl+Z), Redo (Ctrl+Shift+Z), Cut (Ctrl+X), Copy (Ctrl+C), Paste (Ctrl+V), Delete, Select all (Ctrl+A), separator. Keyboard shortcuts functional.

- [x] **View menu**: Edit mode (radio, switches to edit), View mode (radio, switches to view), separator, Zoom in, Zoom out, Fit to page, Reset zoom (100%), separator, Show grid (checkbox toggle), Snap to grid (checkbox toggle).

- [x] **Insert menu**: Same items as toolbar dropdowns -- Charts submenu (all chart types), Controls submenu (all control types), Text, Image, Line, Rectangle, Circle, separator, URL embed.

- [x] **Page menu**: New page, Duplicate page, Delete page, separator, Page settings (opens dialog for page name, size, background color), separator, Navigate page submenu listing all pages.

### Chart Rendering (using Recharts)

- [x] **Bar chart**: Renders using Recharts `<BarChart>`. Aggregates mock data from the component's data source using the configured dimension and metric. X-axis shows dimension values, Y-axis shows metric values. Applies series colors from `component.style.colors`. Shows title if `showTitle` is true. Handles stacked variant by setting `stackId`. Shows legend if enabled. Tooltip on hover showing dimension value + metric value.

- [x] **Line chart / Time series**: Renders using Recharts `<LineChart>`. For time series, X-axis is date dimension. Line color from style. Smooth line variant uses `type="monotone"`. Area chart uses `<AreaChart>` with fill. Shows dot markers or not based on style.

- [x] **Pie / Donut chart**: Renders using Recharts `<PieChart>`. Dimension slices with metric values. Donut variant has `innerRadius={60}`. Legend showing dimension labels + colors. Hover highlights slice.

- [x] **Table chart**: Renders as an HTML `<table>`. Columns: dimensions first, then metrics. Rows: data aggregated/grouped by dimensions. Headers: 12px uppercase `#5F6368`, sortable (click header to sort). Row hover: `#F8F9FA` bg. Cell values: dimensions left-aligned, metrics right-aligned. Pagination at bottom (rows per page selector, prev/next buttons) if rows exceed 10.

- [x] **Scorecard**: Large single-metric display. Shows: metric label (12px, `#5F6368`), large metric value (32px, `#202124`, optionally compact formatted "1.2K"), optional comparison value with green/red arrow (delta from comparison period). Component background and border from style. Centered content.

- [x] **Geo chart**: Simplified geographic visualization. Render as an SVG world map or US map with colored regions based on the dimension (Country/State) and metric value. Use color intensity (lighter to darker blue) to represent metric magnitude. Can use a simple SVG map component or colored rectangles as a simplified representation. Tooltip on hover showing country + value.

- [x] **Scatter chart**: Renders using Recharts `<ScatterChart>`. Two metrics as X and Y axes, dimension as point label. Dots colored by style.

- [x] **Gauge chart**: Renders as a half-circle gauge using SVG or a Recharts radial bar. Shows a single metric value as a needle/arc position between min and max bounds. Value label centered below.

- [x] **Treemap chart**: Renders using Recharts `<Treemap>`. Rectangles sized by metric value, colored by series colors. Dimension labels inside each rectangle.

### Controls (Interactive Filters)

- [x] **Date range control**: Renders as a button showing the current date range (e.g., "Jan 1, 2025 - Jan 31, 2025"). Clicking opens a date picker popover with: preset options list (Auto, Custom, Today, Yesterday, Last 7 days, Last 28 days, Last 90 days, Last 12 months) on the left, two calendar month grids on the right for start/end date selection, "Apply" and "Cancel" buttons at bottom. Selecting a range updates a global filter that re-filters data for all charts on the page. Store selected range in component state.

- [x] **Dropdown list control**: Renders as a dropdown select with the dimension's unique values as options. Includes "All" option at top. Selecting a value filters charts on the page by that dimension value. Shows search input at top of dropdown if more than 10 items.

- [x] **Checkbox control**: Renders as a list of checkboxes with dimension values. Multiple selection filters data.

- [x] **Slider control**: Renders as a horizontal slider for numeric metric ranges. Drag handles to set min/max filter bounds.

### Page Management

- [x] **Page tabs**: Bottom of canvas area shows horizontal tab bar. Each tab: page name text (12px), click to switch active page (`state.currentReport.currentPageId`). Active tab: underline `2px solid #4285F4`, text in `#1A73E8`. "+" button at end creates new page (adds to `state.pages` and `state.currentReport.pages`). Right-click on tab: context menu with Rename, Duplicate, Delete, Move left, Move right.

- [x] **Page switching**: Clicking a page tab loads that page's components on the canvas. Preserves selected components per page. Clears selection when switching pages.

### View Mode

- [x] **View mode toggle**: Clicking "View" button in editor menu bar switches `editor.mode` to "view". In view mode: toolbar and properties panel are hidden, menu bar is simplified to just show report name + "Edit" pencil button + "Share" button, canvas is centered and takes full width. Charts render without selection handles. Controls are interactive (date range picker, dropdown filters). Charts show hover tooltips.

- [x] **View mode interactivity**: In view mode, date range control and dropdown controls are fully interactive and filter chart data. Clicking a chart does nothing (no selection). Scroll to navigate if report page is taller than viewport.

### Sharing

- [x] **Share dialog**: Clicking "Share" button in header opens a modal dialog. Modal: 520px wide, white bg, 8px border-radius, shadow Level 4. Header: "Share with people and groups" (18px). "Share as [user name]" subtext with avatar. Below: email input field ("Add people and groups" placeholder). Below: "People with access" section listing `currentReport.sharedWith[]` -- each row shows avatar circle, name, email below, and role dropdown (Viewer, Editor, Manager) on the right. At bottom: "Pending changes" text and blue "Save" button. Closing without saving discards changes. Adding a user: type email, select role, appears in list. Removing: click X on user row. Reference screenshot `editor_000005.jpg`.

### Undo/Redo

- [x] **Undo/Redo system**: Every state-mutating editor action (add/delete/move/resize/update component, add/delete page, change component properties) pushes the previous state snapshot (or a delta) onto `editor.undoStack`. Undo pops from undoStack, pushes current to redoStack, restores. Redo reverses. Toolbar undo/redo buttons are grayed out when stack is empty. Keyboard shortcuts Ctrl+Z / Ctrl+Shift+Z.

---

## P2 -- Secondary Features

- [x] **Report renaming from editor**: Clicking the report name in the editor menu bar makes it editable (inline text input). Press Enter to save, Escape to cancel. Updates `currentReport.name` in state.

- [x] **Zoom controls**: View menu items Zoom in (+10%), Zoom out (-10%), Fit to page (calculates scale to fit canvas in viewport), Reset (100%). Also ctrl+mousewheel on canvas area. Zoom level displayed in toolbar as "100%" text. Applies CSS `transform: scale()` to canvas.

- [x] **Grid and snap**: Toggle grid visibility (View > Show grid). When snap-to-grid is on, component positions snap to nearest `gridSize` (10px) increment during drag/resize.

- [x] **Copy/paste components**: Ctrl+C copies selected component(s) to `editor.clipboard`. Ctrl+V pastes at offset (+10px, +10px from original). Also accessible via Edit menu.

- [x] **Data sources list page**: Route `/datasources`. Shows a list/table of `state.dataSources[]`. Columns: Name (clickable), Type (connector icon + label), Owner, Last modified. Click opens a data source detail view showing fields list (name, type, category). "Create data source" button at top.

- [x] **Template gallery page**: Route `/templates`. Full-page grid of template cards (larger than home row). Filter by category tabs. Click template creates a new report from template.

- [x] **Right-click context menu**: Right-clicking a component on canvas shows: Cut, Copy, Paste, Delete, Bring to front, Send to back, separator, Chart properties (opens properties panel focused on that component).

- [x] **Component z-order**: Arrange menu items: Bring to front, Bring forward, Send backward, Send to back. Changes component order in `page.components[]` array.

- [x] **Component alignment**: Format menu or toolbar: Align left, Align center, Align right, Align top, Align middle, Align bottom. Works on multi-selected components -- aligns relative to each other or to the canvas.

- [x] **Chart type switching**: In the properties panel Setup tab, the chart type section at the top allows clicking to open a chart type picker. Selecting a different type changes `component.chartType` and preserves compatible dimension/metric configurations.

- [x] **Add data source to report**: Resource menu > "Manage added data sources" opens a dialog listing data sources attached to the current report. "Add a data source" button shows available data sources from `state.dataSources[]`. Selecting one adds it to `currentReport.dataSources[]`.

- [x] **Report download mock**: File > "Download as" shows PDF option. Clicking shows a brief loading spinner then a toast "Report downloaded as PDF". No actual file generation.

- [x] **Calculated field dialog**: In properties panel, "Add a field" link at bottom of dimensions/metrics section opens a dialog with: field name input, formula text area, and Save/Cancel buttons. On save, adds a new field to the data source. Formula is stored as text but not evaluated -- mock data returns random values.

- [x] **Filter configuration**: Clicking "Add a filter" in properties panel opens a filter builder dialog. Shows: include/exclude toggle, dimension dropdown, condition dropdown (equals, contains, starts with, regex), value input. On save, adds to `component.filters[]`. Applied filters are displayed as removable chips in the properties panel.

---

## Data Seed (implement in createInitialData())

- [x] **User**: Pre-logged-in as Sarah Chen (`user_001`), email `sarah.chen@example.com`.

- [x] **Reports**: 7 reports. Mix of owned (5) and shared (2). One report is in trash. One is starred. Varied modification dates spanning the last 30 days. The primary report "Marketing Dashboard Q4" has 3 pages with 15-20 pre-built components. See `data_model.md` for full list.

- [x] **Data sources**: 3 data sources ("Sample Website Data", "Google Ads Campaign Data", "Sales Pipeline Data"). Each has 15-35 fields (mix of dimensions and metrics). "Sample Website Data" has 90 days of daily data rows (aggregated to ~90 rows with daily totals). "Google Ads" has ~45 rows (5 campaigns x 9 months). "Sales Pipeline" has ~60 rows of deal data.

- [x] **Pre-built components**: The "Marketing Dashboard Q4" report has components pre-placed across 3 pages: Page 1 "Overview" with scorecards + time series + bar + pie + table + date range control. Page 2 "Acquisition" with charts showing traffic sources. Page 3 "Revenue" with revenue-focused visualizations. Components have realistic positions on the 1160x900 canvas. See `data_model.md` for detailed component list.

- [x] **Templates**: 10 templates across 5 categories (Marketing, Sales, Finance, Operations, HR). Each has a name, description, category, and thumbnail color.

- [x] **Mock data generation**: For "Sample Website Data", generate 90 daily rows (2024-10-01 to 2024-12-29) with realistic web analytics metrics: users 800-1500/day (weekday bias), sessions 1.3x users, pageviews 3.2x sessions, bounce rate 35-55%, avg session duration 120-240s, conversions 20-60/day, revenue $500-2000/day. Distribute across 10 countries (US 48%, UK 12%, Canada 8%, Germany 6%, India 6%, etc.), 8 channels (Organic Search 35%, Direct 22%, Social 15%, Paid Search 12%, Email 8%, Referral 5%, Display 2%, Other 1%), 5 device categories, 8 browsers, 6 OS types. For "Google Ads Campaign Data", generate 5 campaigns with daily impressions/clicks/cost/conversions across 90 days.

---

## Out of Scope

- Authentication / login (app starts pre-logged-in as Sarah Chen)
- Real data source connections (Google Analytics, BigQuery, Sheets, etc.)
- Community visualizations (third-party chart plugins)
- Scheduled email delivery
- Real-time multi-user collaboration (cursor sharing, live editing)
- Data blending / joining between data sources
- Embedded reports / iframe embedding
- Advanced calculated field formula evaluation
- Google Drive integration for file storage
- API access / developer console
- Billing / Xooker Studio Pro features
