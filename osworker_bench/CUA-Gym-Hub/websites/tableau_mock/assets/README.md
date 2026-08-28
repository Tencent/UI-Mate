# Xableau Mock -- Assets Reference

## App Overview

Xableau Desktop is the premier data visualization and business intelligence tool by Salesforce (formerly Xableau Software). It allows analysts to connect to data sources, explore data through interactive visualizations, and create dashboards that combine multiple charts and views. The desktop application is a thick-client authoring environment -- our mock replicates its web-like interface.

## Key User Personas

1. **Business Analyst** (primary): Connects to data, creates worksheets with drag-and-drop, builds dashboards, applies filters, shares insights.
2. **Data Engineer**: Manages data source connections, joins/unions tables, sets up relationships.
3. **Dashboard Consumer**: Views completed dashboards, interacts with filters, drills into data.

## Primary Workflows

1. **Open workbook** -- see existing worksheets/dashboards in sheet tabs at bottom
2. **Create a worksheet** -- drag dimensions/measures from Data pane onto Columns/Rows shelves
3. **Change chart type** -- use Show Me panel or Marks card mark type dropdown
4. **Apply filters** -- drag field to Filters shelf, configure filter dialog
5. **Configure marks** -- drag fields to Color/Size/Label/Detail/Tooltip on Marks card
6. **Build a dashboard** -- switch to Dashboard tab, drag worksheets onto canvas
7. **Edit data source** -- click Data Source tab, see table relationships and data grid
8. **Sort data** -- click axis headers or toolbar sort buttons
9. **Create calculated field** -- right-click in Data pane, enter formula
10. **Undo/Redo** -- toolbar buttons for navigation through edit history

---

## Feature List (Priority)

### P0 -- Core Shell
- Menu bar: File, Data, Worksheet, Dashboard, Story, Analysis, Map, Format, Server, Window, Help
- Toolbar: undo/redo, save, new data source, new worksheet, duplicate, sort, swap, clear, totals, highlight, Show Me toggle, fit dropdown
- Sidebar: Data tab + Analytics tab toggle
- Data pane: data source selector dropdown, search box, Tables section (dimensions list + measures list)
- Sheet tabs at bottom: Data Source tab + worksheet/dashboard tabs with add-new buttons
- Status bar: marks count, rows/columns count, aggregation summary

### P1 -- Primary Features
- Columns shelf: drop zone for pills (blue=discrete, green=continuous)
- Rows shelf: drop zone for pills
- Marks card: mark type dropdown, Color/Size/Label/Detail/Tooltip/Path buttons
- Filters shelf: drop zone + filter cards in view
- Pages shelf: drop zone
- Show Me panel: grid of 24 chart type thumbnails, highlight recommended ones
- Visualization canvas: renders chart based on shelf configuration (bar, line, scatter, pie, map, treemap, heatmap, text table, area)
- Drag-and-drop: fields from data pane to shelves, between shelves, reorder pills
- Pill interactions: right-click context menu (aggregation, discrete/continuous toggle, sort, remove, filter)
- Data Source page: left pane with tables, canvas for relationships, data grid preview
- Dashboard authoring: drag worksheets onto dashboard canvas, resize/position objects
- Filter dialogs: categorical checkboxes, range sliders, date pickers

### P2 -- Secondary / Depth Features
- Analytics pane: drag analytics objects (constant line, average line, trend line, reference band, box plot, median, totals, subtotals)
- Calculated field editor: formula input with autocomplete
- Parameter controls: slider, dropdown, type-in
- Sorting: ascending/descending on axes, toolbar sort
- Swap rows/columns
- Fit options: Standard, Fit Width, Fit Height, Entire View
- Tooltip customization
- Color legend display
- Size legend display
- Shape selector
- Format pane (font, alignment, borders for cells/headers)
- Worksheet right-click context menus
- Rename sheets (double-click tab)
- Duplicate/delete sheets
- Dashboard sizing options (fixed, automatic, range)
- Dashboard objects: text, image, blank, horizontal/vertical layout containers

---

## UI Layout Description

### Worksheet View (Primary View)
Refer to: `assets/screenshots/reference/docs_0004.png` -- the canonical reference.

**Layout (top to bottom, left to right):**

1. **Title bar** (top, ~30px): Xableau icon + "Xableau - Book1" text + window controls
2. **Menu bar** (~24px): File | Data | Worksheet | Dashboard | Story | Analysis | Map | Format | Server | Window | Help
3. **Toolbar** (~36px): back/forward nav, icon buttons (save, new data source, new ws, duplicate, paste, undo, redo), separator, sort/swap/highlight/totals icons, separator, Show Me button (far right), Fit Width dropdown
4. **Main area** (flex):
   - **Left sidebar** (~200px wide):
     - Data | Analytics tabs (toggle)
     - Data source dropdown (e.g., "Orders (Sample - Superst...)")
     - Search box
     - "Tables" section header
     - Dimensions list (blue icons): Category, City, Country/Region, Customer ID, Customer Name, Order Date, Order ID, Postal Code, Product ID, Product Name, Region, Row ID, Segment, Ship Date, Ship Mode, State, Sub-Category
     - Divider line
     - Measures list (green icons): Discount, Profit, Quantity, Sales, Latitude (generated), Longitude (generated)
   - **Shelves area** (~240px wide, between sidebar and canvas):
     - Pages shelf (collapsible)
     - Filters shelf (collapsible)
     - Marks card: dropdown "Automatic", then grid of 6 buttons: Color, Size, Label/Text, Detail, Tooltip, Path
   - **Main canvas** (remaining space):
     - Columns shelf (horizontal bar at top): "Columns" label + pill drop zone
     - Rows shelf (horizontal bar below Columns): "Rows" label + pill drop zone
     - View title (e.g., "Sheet 1")
     - Chart area: the actual visualization
5. **Sheet tabs bar** (bottom, ~28px): "Data Source" tab (table icon) | Sheet1 | Sheet2 | ... | + new sheet buttons (worksheet, dashboard, story)
6. **Status bar** (bottom, ~22px): "192 marks", "3 rows by 16 columns", "SUM(Profit): 286,397"

### Data Source View
- Left pane: list of connected tables (Orders, People, Returns)
- Canvas: table relationship diagram (drag tables, draw joins)
- Bottom: data grid showing first 1000 rows with column headers
- Connection type toggle: Live / Extract (top right of canvas)

### Dashboard View
- Left panel: "Dashboard" pane with:
  - Sheets section: list of available worksheets to drag onto canvas
  - Objects section: Horizontal, Vertical, Text, Image, Blank, Navigation, Download, Extension
  - Layout section: tiled/floating toggle
  - Size section: dimensions dropdown
- Main canvas: positioned worksheet views and other objects
- No Columns/Rows/Marks shelves visible in dashboard mode

---

## Screenshots Index

| File | Description |
|------|-------------|
| `reference/docs_0004.png` | **PRIMARY REFERENCE**: Complete Xableau worksheet workspace with labeled components (A-I). Shows Data pane, shelves, Marks card, chart area with line charts, sheet tabs, status bar. This is the canonical layout reference -- replicate this exactly. |
| `reference/docs_0002.png` | Bottom status bar detail: marks count, dimensions, SUM aggregation, sheet tabs styling |
| `reference/docs_0009.png` | Data/Analytics tab toggle and data source dropdown -- shows the tab underline style and dropdown appearance |
| `reference/docs_0011.png` | Data Source tab at bottom of workspace -- icon style for the tab |
| `reference/docs_0024.png` | Data/Analytics tab toggle variant |
| `reference/docs_0029.png` | Pages/Filters/Marks card area detail -- shows the collapsible sections and Marks card button grid layout with Color, Size, Text, Detail, Tooltip buttons |
| `workspace/000002.jpg` | Workspace with stacked bar chart, Columns/Rows shelves showing blue (Region) and green (SUM(Sales)) pills, and the Fit dropdown open showing Standard/Fit Width/Fit Height/Entire View options |
| `dashboard/000005.jpg` | Xableau start page / home screen showing connection panel (left sidebar with blue background), Open section (center), and Explore section (right) |

---

## Color Scheme Notes

Xableau Desktop uses a **light gray professional theme**:
- Background: very light gray (#F5F5F5) for sidebar and shelves
- Canvas background: white (#FFFFFF)
- Menu/toolbar background: light gray (#F0F0F0)
- Sheet tabs: medium gray, active tab white
- Dimension fields/pills: blue (#4E79A7)
- Measure fields/pills: green (#59A14F)
- Discrete pills: blue background (#4E79A7) with white text
- Continuous pills: green background (#59A14F) with white text
- Text: dark gray (#333333) primary, medium gray (#666666) secondary
- Borders: light gray (#D4D4D4)
- Toolbar icons: medium gray (#666666)
- Status bar: dark blue-gray (#3C4043) background with white text

### Xableau 10 Default Color Palette (for chart colors):
1. #4E79A7 (blue)
2. #F28E2B (orange)
3. #E15759 (red)
4. #76B7B2 (teal)
5. #59A14F (green)
6. #EDC948 (yellow)
7. #B07AA1 (purple)
8. #FF9DA7 (pink)
9. #9C755F (brown)
10. #BAB0AC (gray)

---

## What to Skip

- **Authentication**: App opens directly to worksheet view, logged in as "Sarah Chen"
- **Real data connections**: All data is pre-loaded mock data
- **Server publish/download**: Server menu items are visible but non-functional
- **Real calculations**: Calculated fields store formulas but don't evaluate against data
- **Data extraction**: Live/Extract toggle is visual only
- **File system access**: File > Open/Save dialogs are non-functional
- **Story sheets**: Lower priority, skip for now
- **Map rendering**: Use a static placeholder image for map viz types
