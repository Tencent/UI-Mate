# Xableau Desktop Mock -- TODO

> Status: DEV COMPLETE (Round 1)
> Last updated by: dev agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Design: `DESIGN.md`
> Primary screenshot reference: `assets/screenshots/reference/docs_0004.png`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest tableau_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`. No Tailwind -- use plain CSS matching the desktop-app aesthetic in DESIGN.md.

- [x] **App layout (worksheet mode)**: The main frame from top to bottom is: Title bar (30px) + Menu bar (24px) + Toolbar (36px) = 90px top chrome. Then the main area fills remaining height: left sidebar (200px) | shelves area (240px) | canvas (flex fill). Below main area: sheet tabs bar (28px) + status bar (22px) = 50px bottom chrome. See `DESIGN.md` section 4 for exact dimensions. Reference: `assets/screenshots/reference/docs_0004.png` -- replicate this layout precisely.

- [x] **Title bar**: Row with Xableau icon (use a simple SVG of overlapping circles in teal/blue, or the text "Xableau"), workbook name "Xableau - Sales Analysis", and minimize/maximize/close faux window controls on the right (non-functional, purely decorative). Background `#F0F0F0`, text `#333333`, 12px.

- [x] **Menu bar**: Horizontal row of text items: File, Data, Worksheet, Dashboard, Story, Analysis, Map, Format, Server, Window, Help. Each item 12px font, #333333, 8px horizontal padding. On hover: background #E0E0E0. Clicking opens a dropdown menu overlay with typical items (see below). Dropdown styling per `DESIGN.md` section 9 context menu CSS. Menus need not have deeply functional items -- most items can just close the menu. Key functional items: Worksheet > New Worksheet, Worksheet > Duplicate Sheet, Worksheet > Clear > Sheet; Data > New Data Source (no-op); Dashboard > New Dashboard.

- [x] **Toolbar**: Row of small icon buttons (28x28px each) separated by thin vertical dividers (#D4D4D4). From left to right per `DESIGN.md` section 13: back/forward arrows, separator, save (floppy), new data source (cylinder), new worksheet (grid+), duplicate sheet, separator, paste, undo, redo, separator, swap rows/columns, sort ascending, sort descending, separator, highlight, group, separator, show/hide labels, mark labels, separator, Fit dropdown ("Fit Width" default, options: Standard / Fit Width / Fit Height / Entire View), separator, **Show Me** toggle button (colored chart icon). Icons use lucide-react where possible; for Xableau-specific ones use simple inline SVG. Icon color #666666, hover #333333 with #E0E0E0 background. Undo/redo should dispatch actual undo/redo from state. Show Me button toggles the Show Me panel.

- [x] **Sidebar -- Data pane**: Left panel, 200px wide, background #F5F5F5, border-right 1px solid #D4D4D4. Contains: (a) **Tab row** (28px): "Data" and "Analytics" text tabs; active tab has bold text + underline, inactive is gray. Clicking switches between Data pane and Analytics pane content. (b) **Data source dropdown** (24px): Shows current data source name truncated (e.g., "Orders (Sample - Superst...") with a small dropdown arrow. (c) **Search box** (24px): Text input with placeholder "Search", border #CCCCCC. Typing filters the field list below. (d) **Tables section**: "Tables" bold header, then a collapsible list of dimension fields (each 20px tall, blue "Abc" icon for string, blue calendar for date, blue globe for geo) followed by a thin divider, then measure fields (green "#" icon). Field items show icon + name, 11px font. Hover: background #E8E8E8. Fields are draggable (see P1 drag-and-drop). Reference: `assets/screenshots/reference/docs_0004.png` component F and `reference/docs_0009.png`.

- [x] **Sidebar -- Analytics pane**: When "Analytics" tab is active, replace the data fields list with the analytics objects from `DESIGN.md` section 10. Three sections: Summarize (Constant Line, Average Line, Median with Quartiles, Box Plot, Totals), Model (Average with 95% CI, Median with 95% CI, Trend Line, Forecast), Custom (Reference Line, Reference Band, Distribution Band). Each item is draggable. For the mock, dropping these onto the canvas is P2; just display the list correctly.

- [x] **Columns and Rows shelves**: Two horizontal bars above the canvas area. Each is 28px tall with a label ("Columns" / "Rows", 60px wide, 11px, #666666) on the left, then a flex pill drop zone to the right. Pills are 22px tall colored rectangles: blue (#4E79A7, border-radius 4px) for discrete, green (#59A14F, border-radius 0px) for continuous. Pill text is white, 11px, 500 weight. Empty shelves show a subtle dashed border drop zone. Pills can be dragged here from the data pane, reordered, or removed. Each pill shows field name + aggregation if applicable (e.g., "SUM(Sales)", "YEAR(Order Date)"). Reference: `workspace/000002.jpg` showing blue "Region" and green "SUM(Sales)" pills.

- [x] **Pages, Filters, and Marks card area**: Vertical column between sidebar and canvas (~240px wide). From top to bottom: (a) **Pages shelf**: Collapsible section with "Pages" header and chevron. Usually empty. (b) **Filters shelf**: Collapsible with "Filters" header. When fields are on it, shows pills similar to Columns/Rows. (c) **Marks card**: Largest section, fills remaining space. Contains: a dropdown selector for mark type (default "Automatic", options: Bar, Line, Area, Square, Circle, Shape, Text, Map, Pie, Gantt Bar, Polygon, Density) -- 24px tall; then a 2x3 grid of 6 buttons (50x36px each): Color, Size, Label (or "Text" in some versions), Detail, Tooltip, Path. Each button has a small icon + text label, white background, 1px #D4D4D4 border. Below the button grid, any fields dropped on these buttons appear as small colored pills. Reference: `reference/docs_0029.png`.

- [x] **Canvas / visualization area**: The remaining space. Shows the chart view title at top (e.g., "Sheet 1", 14px bold #333333), then the chart rendered below. Initially, if no fields are on shelves, show a placeholder: "Drop field here" centered text or the empty worksheet prompt. When fields are placed on shelves, render the appropriate chart using the pre-computed `chartData` from the worksheet state. Charts should use simple SVG or canvas rendering with the Xableau 10 color palette from `DESIGN.md` section 2. Axis labels, grid lines, and headers per canvas styling in DESIGN.md.

- [x] **Sheet tabs bar**: Bottom bar, 28px tall, background #E0E0E0. Shows: (a) "Data Source" tab with table icon (always first), (b) worksheet/dashboard tabs in order from `workbook.sheetOrder`. Active tab: white background, bold text, optional orange top border. Inactive: #E8E8E8 background, #666666 text. Clicking a tab switches the active sheet. At the end: three small "+" buttons to create new worksheet / new dashboard / new story (only worksheet and dashboard functional). Double-clicking a tab name allows renaming (inline text input). Right-clicking shows context menu: Rename, Duplicate, Delete, Color... Reference: `reference/docs_0002.png`, `reference/docs_0011.png`.

- [x] **Status bar**: Bottom bar, 22px tall, background #3C4043, white text 11px. Shows: marks count (e.g., "192 marks"), rows x columns (e.g., "3 rows by 16 columns"), aggregation summary (e.g., "SUM(Profit): 286,397"). Values come from the active worksheet's chartData metadata.

- [x] **Routing**: Use BrowserRouter. Routes: `/` = worksheet view (default), `/datasource` = data source view, `/dashboard/:id` = dashboard view, `/go` = state inspector. The active view is determined by which sheet tab is clicked rather than URL (to mimic desktop app behavior), but route-based navigation should also work for direct linking.

- [x] **State management**: React Context (AppContext) wrapping the entire app. `dataManager.js` implements `createInitialData()` returning the full state structure from `assets/data_model.md` section 9. State includes: workbook, dataSources, worksheets, dashboards, calculatedFields, parameters, uiState, currentUser. Use localStorage for persistence with key `"tableau_mock_state"`. Implement `getStateDiff()` for the /go endpoint.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Returns JSON with `{initial_state, current_state, state_diff}`. Also implement the vite.config.js mock-api plugin for session isolation: `POST /post?sid=<sid>` with `{action:"set", state:{...}}` sets both current + initial; `{action:"set_current", state:{...}}` updates only current; `{action:"reset"}` resets to initial. `GET /go?sid=<sid>` returns the state triple.

- [x] **Session isolation**: In `vite.config.js`, add the mock-api plugin middleware that handles `POST /post?sid=`, `GET /go?sid=`, and `GET /state?sid=`. The `dataManager.js` should export session helpers: `getSessionState(sid)`, `setSessionState(sid, state)`, `resetSession(sid)`. Store sessions in a server-side Map.

---

## P1 -- Primary Features

Core interactive workflows for agent training. These are what make the mock usable as a training sandbox.

### Drag and Drop

- [x] **Field drag from Data pane**: Each field item in the Data pane sidebar is draggable. On drag start, show a ghost pill (blue for dimensions, green for measures) attached to the cursor. While dragging, valid drop targets (Columns, Rows, Filters, Pages, Marks card buttons, and the canvas) highlight with a blue border (#4E79A7) or dashed outline. Use HTML5 drag-and-drop API or a lightweight library (react-dnd is acceptable). On drop: create a ShelfPill from the field and add it to the target shelf's state array.

- [x] **Pill drag between shelves**: Pills already on a shelf can be dragged to a different shelf (e.g., move a pill from Columns to Rows, or from Rows to the Color button on Marks card). On drag, the pill visually lifts. On drop, remove from source shelf and add to target shelf. Dropping a pill onto the canvas area outside any shelf should remove it (equivalent to "Remove").

- [x] **Pill reorder within shelf**: Dragging a pill horizontally within the same shelf (Columns or Rows) reorders it. Show an insertion indicator (thin vertical line) between pills.

- [x] **Drop on Marks card buttons**: Dragging a field onto one of the 6 Marks card buttons (Color, Size, Label, Detail, Tooltip, Path) assigns that field to that property in the MarksConfig. The button then shows the field name as a small pill below it. Dropping a different field replaces the existing one (except Tooltip which allows multiple).

### Pill Interactions

- [x] **Pill right-click context menu**: Right-clicking any pill on a shelf opens a context menu (see `DESIGN.md` section 9). Key functional options: (a) **Remove** -- removes the pill from the shelf and updates state; (b) **Discrete / Continuous** toggle -- changes `isDiscrete` on the pill, which changes its color between blue/green; (c) **Aggregation submenu** (for measures) -- SUM, AVG, COUNT, MIN, MAX, MEDIAN -- updates the pill's `aggregation` field and display text (e.g., "SUM(Sales)" -> "AVG(Sales)"); (d) **Date granularity** (for date fields) -- YEAR, QUARTER, MONTH, DAY -- updates `dateGranularity` and display; (e) **Filter...** -- adds the field to the Filters shelf and opens the filter dialog; (f) **Show Filter** -- toggles showing an interactive filter card in the canvas area.

- [x] **Pill double-click (Edit in Shelf)**: Double-clicking a pill on a shelf converts it to a text input where the user can type a new field reference or calculation. Press Enter to confirm, Escape to cancel. For the mock, this just allows renaming the display text.

### Chart Rendering

- [x] **Bar chart renderer**: When the active worksheet has `showMeType: "bar"` or the shelf configuration implies bars (dimension on one axis, measure on the other), render horizontal or vertical bars using SVG `<rect>` elements. Bars use the Xableau 10 color palette. Include axis lines (#333333), tick marks, axis labels (10px #666666), grid lines (#E8E8E8), and an axis title (11px bold #666666). If a Color field is assigned in Marks, split bars into colored segments (stacked bar) or side-by-side groups. Reference: `workspace/000002.jpg` for stacked bar styling.

- [x] **Line chart renderer**: For `showMeType: "line"` or time-series configurations (date on Columns, measure on Rows). Render SVG `<path>` or `<polyline>` elements. Multiple series get different colors from the palette. Include circle markers at data points (4px radius). Axes and grid lines same as bar chart. Reference: `reference/docs_0004.png` main chart area showing multi-line profit trends.

- [x] **Scatter plot renderer**: For `showMeType: "scatter"`. Render SVG `<circle>` elements positioned by x/y values. Use Xableau 10 palette for color field. Include both x and y axes with labels. Circle size can vary if a Size field is assigned (radius 4-20px).

- [x] **Text table renderer**: For `showMeType: "text"`. Render an HTML table with row and column headers from dimensions, and cell values from measures. Header cells have background #F0F0F0, border 1px solid #D4D4D4. Body cells have white background, right-aligned numbers.

- [x] **Pie chart renderer**: For `showMeType: "pie"`. Render SVG arcs using Xableau 10 colors. Show labels with percentage and value. Center the pie in the canvas.

- [x] **Area chart renderer**: For `showMeType: "area"`. Same as line chart but with filled area below lines using 30% opacity of the line color.

- [x] **Treemap renderer**: For `showMeType: "treemap"`. Render nested rectangles using SVG. Each rectangle colored by category, sized by measure value. Labels inside each rectangle.

- [x] **Chart auto-selection**: When fields are dropped on shelves, automatically determine the chart type: 1 dimension + 1 measure = bar; date dimension + measure = line; 2 measures = scatter; dimension only = text table. Update `showMeType` accordingly. This mimics Xableau's "Automatic" mark type behavior.

### Show Me Panel

- [x] **Show Me panel toggle and layout**: When the "Show Me" toolbar button is clicked, toggle a floating panel anchored to the top-right of the canvas area. Panel is ~280px wide x ~360px tall with a title "Show Me" at top, an X close button, and a 4-column grid of 24 chart type thumbnails (each ~60x44px). Each thumbnail is a simple SVG icon representing that chart type (bar, line, scatter, etc.) with a thin #D4D4D4 border. See `DESIGN.md` section 8 for the full 6x4 grid layout. Panel has white background and shadow `0 2px 12px rgba(0,0,0,0.15)`.

- [x] **Show Me highlight and selection**: The currently active chart type has an orange (#E87722) border on its thumbnail. Chart types that are valid for the current shelf field configuration get a normal border; invalid ones are grayed out (opacity 0.4). Clicking a valid thumbnail changes the worksheet's `showMeType` and re-renders the chart. At the bottom of the panel, show a small text hint: "For [chart type]: try [N] or more [Dimensions/Measures]".

### Filter System

- [x] **Categorical filter dialog**: When a dimension field is dropped on the Filters shelf (or "Filter..." is chosen from pill context menu), open a modal dialog per `DESIGN.md` section 12. Title: "Filter [FieldName]". Four tabs: General | Wildcard | Condition | Top. **General tab** (functional): radio buttons "Select from list" / "Custom value list" / "Use all"; below, a search input + scrollable checkbox list of all unique values for that field from the data source. "All" / "None" buttons. OK / Cancel / Apply buttons. On OK, update the FilterConfig in state with selectedValues. Only General tab needs to be functional; other tabs are visual stubs.

- [x] **Range filter dialog**: When a measure field is dropped on the Filters shelf, open the range filter variant. Title: "Filter [SUM(FieldName)]". Aggregation dropdown (SUM, AVG, etc.). Slider with two handles for min/max. Numeric inputs for precise values. OK / Cancel. On OK, update FilterConfig with rangeMin/rangeMax.

- [x] **Interactive filter cards in view**: When a filter has `showFilter: true`, display a filter card widget in the canvas area (typically right side or top). For categorical: dropdown or checkbox list. For range: a slider. Interacting with these filter cards updates the FilterConfig and (in a real app would re-query; in the mock, just updates state and potentially hides/shows data points in the chart).

### Data Source View

- [x] **Data Source tab view**: Clicking the "Data Source" tab at the bottom switches the entire main area (replaces sidebar + shelves + canvas) with the data source editing view. Layout per `DESIGN.md` section 11: left pane (~200px) with list of tables (Orders, People, Returns for Superstore); canvas area (top half) showing table nodes as rounded rectangles connected by join lines; data grid (bottom half) showing a spreadsheet of sample data rows. The connection bar at top shows "Sample - Superstore" with Live/Extract toggle (visual only).

- [x] **Table relationship canvas**: Show 1-3 table nodes (Orders as primary, with People and Returns as joined tables). Each node is a rounded rectangle with blue border, table name centered. Between connected tables, show a small Venn-diagram join icon. Clicking a join icon opens a simple dialog showing join type (Inner/Left/Right/Full) as a dropdown and join columns. For the mock, the join dialog is functional (updates state) but doesn't affect rendered data.

- [x] **Data grid**: Below the relationship canvas, show a spreadsheet-like grid with column headers (field names + type icons) and ~20 rows of sample data from the Superstore dataset. Columns are resizable (drag the header border). Data types shown with icons: "Abc" for string, "#" for number, calendar for date. This grid is read-only. Include row numbers on the left margin.

### Worksheet Management

- [x] **New worksheet**: Clicking the "+" new worksheet button in the sheet tabs bar creates a new blank worksheet (e.g., "Sheet 4") and switches to it. The new worksheet has empty shelves, "Automatic" mark type, and no chartData. Add to workbook.sheetOrder.

- [x] **New dashboard**: Clicking the "+" new dashboard button creates a new dashboard (e.g., "Dashboard 2") and switches to dashboard view. The dashboard starts with an empty canvas.

- [x] **Rename sheet**: Double-click a sheet tab to enter inline rename mode. The tab text becomes an input. Press Enter to save the new name, Escape to cancel. Update the sheet's name in state.

- [x] **Delete sheet**: Right-click a sheet tab > Delete. Show a confirmation dialog "Permanently delete sheet [name]?" with OK/Cancel. On OK, remove the sheet from state and sheetOrder. Cannot delete the last remaining sheet.

- [x] **Duplicate sheet**: Right-click tab > Duplicate, or toolbar duplicate button. Creates a deep copy of the current worksheet with name "[Original Name] (2)". Adds to sheetOrder after the original.

### Dashboard Authoring

- [x] **Dashboard view layout**: When a dashboard tab is active, the main area switches: the left sidebar shows the Dashboard pane instead of Data pane. Dashboard pane has: (a) **Sheets section**: list of available worksheets as draggable items, each showing the sheet name + a tiny chart thumbnail icon; (b) **Objects section**: Horizontal, Vertical, Text, Image, Blank items; (c) **Layout toggle**: Tiled / Floating radio buttons; (d) **Size section**: dropdown for Fixed (1000x800) / Automatic / Range. The canvas area becomes a drop zone where worksheets can be positioned. No Columns/Rows/Marks shelves in dashboard mode.

- [x] **Dashboard drag worksheets**: Drag a worksheet name from the Dashboard pane onto the canvas. On drop, insert the worksheet's chart rendering as a DashboardObject with a bounding box. The object can be repositioned by dragging its title bar and resized by dragging corner/edge handles. Show a blue selection border when the object is selected.

- [x] **Dashboard text and blank objects**: Dragging "Text" from Objects section onto the dashboard inserts a text box with editable content. "Blank" inserts a spacer. These objects are also repositionable and resizable.

---

## P2 -- Secondary Features

Depth and realism. Implement after P1 is solid.

### Advanced Interactions

- [ ] **Undo/Redo**: Maintain an undoStack and redoStack in uiState. Every state-changing action (add pill to shelf, remove pill, change aggregation, change chart type, add filter, rename sheet, etc.) pushes the previous state onto undoStack and clears redoStack. Toolbar undo button pops undoStack and pushes current to redoStack. Redo does the reverse. Disable the buttons (grayed out) when their respective stacks are empty.

- [ ] **Swap rows/columns**: Toolbar swap button swaps the contents of the Columns shelf with the Rows shelf. This effectively rotates bar charts from vertical to horizontal, etc.

- [ ] **Sort ascending/descending**: Toolbar sort buttons apply a sort to the last measure on Rows or Columns. Sets `sortOrder` on the relevant pill to "asc" or "desc". Visually, the chart should reflect sorted order (reorder bars, etc.).

- [ ] **Fit options**: The Fit dropdown in the toolbar (Standard / Fit Width / Fit Height / Entire View) changes how the chart scales within the canvas. For the mock, adjust CSS: Standard = fixed size with scroll; Fit Width = width 100%; Fit Height = height 100%; Entire View = both 100%.

- [ ] **Calculated field editor**: Right-clicking in the Data pane > Create Calculated Field opens a modal dialog: title input "Name", a large text area for formula (e.g., `SUM([Profit]) / SUM([Sales])`), and OK/Cancel. The formula area should have monospace font. On OK, create a CalculatedField entity and add it to the Data pane as a new field (measure or dimension based on a radio button). The field appears with a small "=" prefix icon. No actual formula evaluation needed.

- [ ] **Parameter controls**: For parameters defined in state (e.g., "Top N"), show a parameter control widget in the canvas area: slider (for range type), dropdown (for list type), or type-in input. Changing the parameter value updates `parameters[].currentValue` in state.

- [ ] **Color legend**: When a Color field is assigned on the Marks card, display a color legend widget in the canvas area (typically top-right). Shows colored squares/circles with labels for each category value, using the Xableau 10 palette.

- [ ] **Size legend**: When a Size field is assigned, display a size legend showing the size range (small to large circles with min/max values).

### Menu Functionality

- [ ] **File menu dropdown**: File > New (clears workbook), File > Save (saves to localStorage, shows brief "Saved" toast), File > Export (no-op), File > Page Setup (no-op). Other items visible but disabled.

- [ ] **Worksheet menu dropdown**: Worksheet > New Worksheet (same as + button), Worksheet > Duplicate (same as toolbar), Worksheet > Clear > Sheet (removes all pills from all shelves), Worksheet > Show Title (toggles chart title visibility), Worksheet > Show Caption (toggles caption area below chart).

- [ ] **Analysis menu dropdown**: Analysis > Totals > Show Column Grand Totals / Show Row Grand Totals (adds total row/column to text tables and total bar to charts), Analysis > Stack Marks > On / Off (toggles stacked vs side-by-side bars). Other items as stubs.

### Visual Polish

- [ ] **Tooltip on hover**: When hovering over a data point in the chart (bar segment, line point, scatter dot), show a tooltip popover with the field values for that mark. Tooltip has white background, 1px #CCCCCC border, shadow `0 2px 8px rgba(0,0,0,0.2)`, 11px text. Shows dimension values as labels and measure values as formatted numbers.

- [ ] **Axis header interactions**: Clicking a column or row header in the chart area sorts by that dimension (toggles asc/desc). The sort icon (small triangle) appears next to the header text. Clicking an axis title selects it for editing (shows input overlay).

- [ ] **Field search filtering**: The search box in the Data pane filters the field list in real-time as the user types. Matching is case-insensitive on field names. Non-matching fields are hidden.

- [ ] **Sheet tab drag reorder**: Sheet tabs at the bottom can be dragged to reorder them. Show an insertion indicator between tabs. On drop, update `workbook.sheetOrder`.

- [ ] **Sheet tab color**: Right-click tab > Color opens a small color picker (6-8 preset colors). Selecting one applies that color as a thin bottom border on the tab.

### Data Pane Enhancements

- [ ] **Field right-click context menu**: Right-clicking a field in the Data pane opens a context menu per `DESIGN.md` section 9. Key functional items: Duplicate (creates a copy), Rename (inline edit), Hide (removes from visible list), Create > Calculated Field (opens calc editor pre-filled), Convert to Dimension / Convert to Measure (toggles role). Other items as stubs.

- [ ] **Measure Names / Measure Values**: These special fields appear at the bottom of the dimensions and measures lists respectively. Dragging "Measure Names" to a shelf adds all measure names as categories. Dragging "Measure Values" adds a combined measure. The mock can treat these as regular fields for simplicity.

- [ ] **Generated fields styling**: "Latitude (generated)" and "Longitude (generated)" fields should appear in italics in the Data pane with a small globe icon, visually distinct from user-defined fields.

---

## Data Seed (implement in createInitialData())

The following data must be created in `dataManager.js` to make the app feel realistic. See `assets/data_model.md` for complete field definitions.

- [x] **Data source**: 1 data source "Sample - Superstore" with connectionType "excel", containing 3 tables: Orders (17 dimensions + 7 measures), People (2 fields), Returns (2 fields). All fields per data_model.md section 2b.

- [x] **Worksheet 1 -- "Sales by Category"**: Horizontal bar chart. Columns: [SUM(Sales)]. Rows: [Category]. showMeType: "bar". chartData with 3 categories (Furniture: 741999, Office Supplies: 719047, Technology: 836154). No color field. This is the default active sheet.

- [x] **Worksheet 2 -- "Profit Trend"**: Line chart over time. Columns: [YEAR(Order Date), QUARTER(Order Date)]. Rows: [SUM(Profit)]. Marks > Color: [Segment]. showMeType: "line". chartData with 4 years x 3 segments of quarterly profit data (pre-computed realistic values). This matches the chart visible in `reference/docs_0004.png`.

- [x] **Worksheet 3 -- "Sales vs Profit"**: Scatter plot. Columns: [SUM(Sales)]. Rows: [SUM(Profit)]. Marks > Detail: [Sub-Category]. Marks > Color: [Category]. showMeType: "scatter". chartData with ~17 scatter points, one per sub-category.

- [x] **Worksheet 4 -- "Regional Sales"**: Stacked bar chart. Columns: [Region]. Rows: [SUM(Sales)]. Marks > Color: [Category]. showMeType: "bar". chartData with 4 regions x 3 categories. This matches the chart in `workspace/000002.jpg`.

- [x] **Dashboard 1 -- "Sales Dashboard"**: Contains ws-1 (Sales by Category) at position {x:0, y:0, w:600, h:400} and ws-2 (Profit Trend) at {x:600, y:0, w:600, h:400}. Size: {width:1200, height:800, sizing:"fixed"}.

- [x] **Calculated fields**: 1 calculated field "Profit Ratio" with formula `SUM([Profit]) / SUM([Sales])`, dataType "number", role "measure".

- [x] **Parameters**: 1 parameter "Top N" with dataType "integer", currentValue 10, allowableValues range 1-50, displayAs "slider".

- [x] **Filters**: Worksheet 2 has one active filter on Region: categorical, selectedValues ["East", "West", "Central", "South"], showFilter true. Worksheet 1 has no filters.

- [x] **UI state defaults**: sidebarTab "data", sidebarCollapsed false, showMeOpen false, activeView "worksheet". currentUser: { name: "Sarah Chen", role: "Analyst" }.

---

## Out of Scope

Dev must NOT implement these:

- **Authentication / login**: App starts pre-logged-in as "Sarah Chen"
- **Real data connections**: All data is pre-loaded mock; no database or file connections
- **Server publish/download**: Server menu items visible but non-functional
- **Real formula evaluation**: Calculated fields store formulas but do not compute against data
- **Data extraction**: Live/Extract toggle is visual only
- **File system access**: File > Open/Save are non-functional (Save writes to localStorage)
- **Story sheets**: The "Story" tab type is not implemented
- **Real map rendering**: Map chart type shows a static placeholder
- **Undo history across page refreshes**: Undo stack resets on reload
- **Multi-user collaboration**: Single-user local state only
- **Export to PDF/Image**: Menu items visible but non-functional
