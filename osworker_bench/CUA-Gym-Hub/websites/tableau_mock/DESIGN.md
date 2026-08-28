# Design System Inspired by Xableau Desktop

## 1. Visual Theme & Atmosphere

Xableau Desktop has a **professional, utilitarian interface** with a light-gray chrome that puts maximum emphasis on the data visualization canvas. The aesthetic is closer to traditional desktop applications (like Microsoft Office) than modern web apps -- with menu bars, toolbars with small icon buttons, and dockable panels. The overall feel is dense, information-rich, and tool-oriented. Every pixel serves a purpose; there is minimal decorative whitespace.

The color language is restrained: neutral grays for chrome, with **blue for dimensions** (categorical fields) and **green for measures** (numeric fields) as the primary semantic colors. These dimension/measure colors are Xableau's most distinctive visual signature and must be faithfully reproduced.

## 2. Color Palette & Roles

### Chrome / Application Frame
- **Title Bar Background**: `#F0F0F0` (light gray, matches OS window chrome)
- **Menu Bar Background**: `#F5F5F5`
- **Menu Bar Text**: `#333333`
- **Menu Bar Hover**: `#E0E0E0` background
- **Toolbar Background**: `#F5F5F5` (same as menu bar, with subtle bottom border)
- **Toolbar Icon Color**: `#666666` (medium gray)
- **Toolbar Icon Hover**: `#333333`
- **Toolbar Separator**: `#D4D4D4`

### Sidebar / Data Pane
- **Sidebar Background**: `#F5F5F5`
- **Sidebar Border Right**: `#D4D4D4`
- **Tab Active Text**: `#333333` (bold, underlined)
- **Tab Inactive Text**: `#888888`
- **Search Input Background**: `#FFFFFF`
- **Search Input Border**: `#CCCCCC`
- **Section Header Text**: `#333333` (bold, "Tables")
- **Field Item Text**: `#333333`
- **Field Item Hover Background**: `#E8E8E8`

### Dimension & Measure Colors (CRITICAL)
- **Dimension Icon / Pill**: `#4E79A7` (steel blue)
- **Dimension Pill Background**: `#4E79A7`
- **Dimension Pill Text**: `#FFFFFF`
- **Measure Icon / Pill**: `#59A14F` (forest green)
- **Measure Pill Background**: `#59A14F`
- **Measure Pill Text**: `#FFFFFF`
- **Discrete Pill Border Radius**: `4px` (rounded rectangle)
- **Continuous Pill Border Radius**: `0px` (sharp rectangle, no rounding)

### Shelves & Cards
- **Shelf Background**: `#FFFFFF`
- **Shelf Label Text**: `#666666` (e.g., "Columns", "Rows")
- **Shelf Drop Zone Border**: `1px dashed #CCCCCC` (when empty/dragging)
- **Shelf Drop Zone Active**: `1px solid #4E79A7` (when drop target)
- **Marks Card Background**: `#F5F5F5`
- **Marks Card Border**: `1px solid #D4D4D4`
- **Marks Button Background**: `#FFFFFF`
- **Marks Button Border**: `1px solid #D4D4D4`
- **Marks Button Icon Color**: `#666666`

### Canvas / View Area
- **Canvas Background**: `#FFFFFF`
- **Axis Line Color**: `#333333`
- **Axis Tick Color**: `#333333`
- **Axis Label Color**: `#666666`
- **Grid Line Color**: `#E8E8E8`
- **Chart Title Color**: `#333333`
- **Header Background**: `#F0F0F0` (row/column headers in view)
- **Header Border**: `1px solid #D4D4D4`

### Sheet Tabs
- **Tab Bar Background**: `#E0E0E0`
- **Active Tab Background**: `#FFFFFF`
- **Active Tab Text**: `#333333`
- **Active Tab Border Top**: `none`
- **Inactive Tab Background**: `#E8E8E8`
- **Inactive Tab Text**: `#666666`
- **Tab Border**: `1px solid #CCCCCC`
- **Data Source Tab Icon**: table icon, slightly different styling

### Status Bar
- **Background**: `#3C4043` (dark charcoal)
- **Text Color**: `#FFFFFF`
- **Font Size**: `11px`

### Xableau 10 Chart Palette
These are the default colors used for data series in charts:
| Index | Name | Hex |
|-------|------|-----|
| 1 | Blue | `#4E79A7` |
| 2 | Orange | `#F28E2B` |
| 3 | Red | `#E15759` |
| 4 | Teal | `#76B7B2` |
| 5 | Green | `#59A14F` |
| 6 | Yellow | `#EDC948` |
| 7 | Purple | `#B07AA1` |
| 8 | Pink | `#FF9DA7` |
| 9 | Brown | `#9C755F` |
| 10 | Gray | `#BAB0AC` |

### Interactive States
- **Drop Target Highlight**: `#4E79A7` with 20% opacity background
- **Selected Field**: `#4E79A7` background with white text
- **Focus Ring**: `2px solid #4E79A7`
- **Disabled / Grayed Out**: `#BBBBBB`

## 3. Typography Rules

Xableau Desktop uses system fonts (Segoe UI on Windows, SF Pro on macOS). For the web mock, use a similar sans-serif stack.

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Menu Bar Item | `"Segoe UI", -apple-system, sans-serif` | 12px | 400 | 20px | 0 |
| Toolbar Label | same | 11px | 400 | 16px | 0 |
| Sidebar Tab | same | 12px | 600 (active) / 400 | 20px | 0 |
| Data Source Name | same | 11px | 400 | 16px | 0 |
| Field Name | same | 11px | 400 | 18px | 0 |
| Section Header | same | 11px | 700 | 18px | 0 |
| Shelf Label | same | 11px | 400 | 16px | 0.5px |
| Pill Text | same | 11px | 500 | 16px | 0 |
| View Title | same | 14px | 700 | 20px | 0 |
| Axis Label | same | 10px | 400 | 14px | 0 |
| Axis Title | same | 11px | 600 | 16px | 0 |
| Status Bar | same | 11px | 400 | 16px | 0 |
| Sheet Tab | same | 11px | 400 (inactive) / 600 (active) | 16px | 0 |

## 4. Spacing & Layout

### Overall Frame
- **Title bar height**: `30px`
- **Menu bar height**: `24px`
- **Toolbar height**: `36px`
- **Status bar height**: `22px`
- **Sheet tabs bar height**: `28px`
- **Total chrome height** (top): `90px` (title + menu + toolbar)
- **Total chrome height** (bottom): `50px` (tabs + status)

### Sidebar
- **Width**: `200px` (default, resizable conceptually)
- **Tab row height**: `28px`
- **Search box height**: `24px`
- **Search box margin**: `4px 8px`
- **Field item height**: `20px`
- **Field item padding**: `2px 8px 2px 20px` (icon space on left)
- **Field icon size**: `12px`
- **Section header padding**: `8px 8px 4px 8px`

### Shelves Area (between sidebar and canvas)
- **Width**: `240px`
- **Pages shelf height**: `28px` (collapsible)
- **Filters shelf height**: `28px` (collapsible, expands with content)
- **Marks card**: fills remaining vertical space
- **Marks dropdown height**: `24px`
- **Marks button grid**: 2 rows x 3 columns, each button `50px x 36px`
- **Padding inside marks card**: `8px`

### Columns / Rows Shelves (above canvas)
- **Height**: `28px` each
- **Label width**: `60px`
- **Pill height**: `22px`
- **Pill horizontal padding**: `8px`
- **Pill margin**: `2px`
- **Pill gap**: `4px`

### Canvas
- **Padding**: `16px`
- **Chart title margin-bottom**: `12px`

### Sheet Tabs
- **Tab min-width**: `80px`
- **Tab max-width**: `160px`
- **Tab padding**: `4px 12px`
- **New sheet button width**: `28px`

## 5. Component Patterns

### Pill (Dimension - Discrete)
```css
.pill-dimension {
  background: #4E79A7;
  color: #FFFFFF;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  height: 22px;
  display: inline-flex;
  align-items: center;
  cursor: grab;
  white-space: nowrap;
}
```

### Pill (Measure - Continuous)
```css
.pill-measure {
  background: #59A14F;
  color: #FFFFFF;
  border-radius: 0px; /* Sharp corners for continuous */
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  height: 22px;
  display: inline-flex;
  align-items: center;
  cursor: grab;
  white-space: nowrap;
}
```

### Menu Bar Item
```css
.menu-item {
  padding: 2px 8px;
  font-size: 12px;
  color: #333333;
  cursor: pointer;
}
.menu-item:hover {
  background: #E0E0E0;
}
```

### Toolbar Button
```css
.toolbar-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #666666;
  cursor: pointer;
  border-radius: 2px;
}
.toolbar-btn:hover {
  background: #E0E0E0;
  color: #333333;
}
```

### Marks Card Button
```css
.marks-button {
  width: 50px;
  height: 36px;
  background: #FFFFFF;
  border: 1px solid #D4D4D4;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  color: #666666;
  gap: 2px;
}
.marks-button:hover {
  background: #F0F0F0;
  border-color: #999999;
}
```

### Shelf Drop Zone
```css
.shelf {
  height: 28px;
  display: flex;
  align-items: center;
  padding: 0 4px;
  background: #FFFFFF;
  border-bottom: 1px solid #D4D4D4;
}
.shelf-label {
  width: 60px;
  font-size: 11px;
  color: #666666;
  flex-shrink: 0;
}
.shelf-pills {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  min-height: 22px;
  flex: 1;
}
```

### Sheet Tab
```css
.sheet-tab {
  padding: 4px 12px;
  font-size: 11px;
  background: #E8E8E8;
  border: 1px solid #CCCCCC;
  border-bottom: none;
  cursor: pointer;
  color: #666666;
}
.sheet-tab.active {
  background: #FFFFFF;
  color: #333333;
  font-weight: 600;
  border-top: 2px solid #E87722; /* Orange accent for active tab in some versions */
}
```

### Data Pane Field Item
```css
.field-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px 2px 12px;
  font-size: 11px;
  color: #333333;
  cursor: grab;
  height: 20px;
}
.field-item:hover {
  background: #E8E8E8;
}
.field-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}
.field-icon.dimension { color: #4E79A7; }
.field-icon.measure { color: #59A14F; }
```

## 6. Shadow & Elevation

Xableau Desktop uses minimal shadows (it's a desktop app aesthetic):

| Element | Shadow |
|---------|--------|
| Dropdown menus | `0 2px 8px rgba(0,0,0,0.15)` |
| Tooltip popover | `0 2px 8px rgba(0,0,0,0.2)` |
| Show Me panel | `0 2px 12px rgba(0,0,0,0.15)` |
| Modal dialogs | `0 4px 16px rgba(0,0,0,0.25)` |
| Context menus | `0 2px 8px rgba(0,0,0,0.15)` |
| Marks card | `none` (uses border only) |
| Sidebar | `none` (uses border-right only) |

## 7. Iconography

Xableau uses small, monochrome icons throughout the toolbar and data pane. For the mock, use a combination of:
- **Lucide React** icons for toolbar (Undo, Redo, Save, Plus, etc.)
- **Custom SVG** for Xableau-specific icons:
  - Dimension icon: small blue "Abc" or text icon
  - Measure icon: small green "#" or number icon
  - Date dimension icon: small blue calendar icon
  - Geographic dimension icon: small blue globe icon
  - Table icon: grid-like icon for data source tab
  - Chart type thumbnails: simple SVG thumbnails for Show Me panel

## 8. Show Me Panel

The Show Me panel is a floating panel (~280px wide, ~360px tall) anchored to the top-right of the canvas area. It contains a 4-column grid of 24 chart type thumbnails:

Row 1: Text Table, Heat Map, Highlight Table, Symbol Map
Row 2: Filled Map, Pie Chart, Horizontal Bar, Stacked Bar
Row 3: Side-by-Side Bar, Treemap, Circle View, Side-by-Side Circle
Row 4: Line (continuous), Line (discrete), Dual Line, Area (continuous)
Row 5: Area (discrete), Dual Combination, Scatter, Histogram
Row 6: Box-and-whisker, Gantt, Bullet, Packed Bubbles

Each thumbnail is approximately `60px x 44px` with a thin border. The recommended chart type for current field selection gets an orange/highlighted border. Unavailable types are grayed out.

## 9. Context Menus

### Pill Right-Click Context Menu
When a user right-clicks a pill on a shelf, a context menu appears with these options (varies by field type):

**For a Measure pill:**
- Filter...
- Show Filter
- Format...
- ---
- Include in Tooltip
- ---
- Dimension / Attribute / Measure (SUM) / Measure (AVG) / Measure (COUNT) / Measure (MIN) / Measure (MAX) / Measure (MEDIAN)
- Discrete / Continuous
- ---
- Edit in Shelf
- Remove

**For a Dimension pill:**
- Filter...
- Show Filter
- Group by...
- Format...
- Show Header
- Include in Tooltip
- Sort...
- ---
- Discrete / Continuous
- ---
- Edit in Shelf
- Remove

**For a Date pill (additional):**
- Year / Quarter / Month / Week Number / Day / ...  (date granularity options at top)
- Exact Date
- Attribute

### Data Pane Field Right-Click Context Menu
- Duplicate
- Rename
- Hide
- Aliases... (dimensions only)
- Create > Calculated Field / Group / Set / Bins / Parameter
- Convert to Dimension / Convert to Measure
- Geographic Role > (submenu)
- Default Properties > Comment, Color, Shape, Sort, Number Format
- Describe...

### Context Menu Styling
```css
.context-menu {
  background: #FFFFFF;
  border: 1px solid #CCCCCC;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  min-width: 200px;
  padding: 4px 0;
  font-size: 12px;
  color: #333333;
}
.context-menu-item {
  padding: 4px 24px 4px 12px;
  cursor: pointer;
}
.context-menu-item:hover {
  background: #4E79A7;
  color: #FFFFFF;
}
.context-menu-separator {
  height: 1px;
  background: #E0E0E0;
  margin: 4px 0;
}
.context-menu-item.disabled {
  color: #BBBBBB;
  cursor: default;
}
.context-menu-item .submenu-arrow {
  float: right;
  font-size: 10px;
}
```

## 10. Analytics Pane

When the "Analytics" tab is active in the sidebar, the Data pane is replaced by the Analytics pane. It has the following draggable items organized in sections:

**Summarize:**
- Constant Line
- Average Line
- Median with Quartiles
- Box Plot
- Totals

**Model:**
- Average with 95% CI
- Median with 95% CI
- Trend Line
- Forecast

**Custom:**
- Reference Line
- Reference Band
- Distribution Band

Each item is a draggable object that can be dropped onto the canvas area. When dragging, drop zones highlight on the visualization.

### Analytics Pane Styling
Same background as data pane (#F5F5F5). Section headers in bold 11px #333333. Items are 20px tall, 11px font, #333333 text with a small icon on the left. On hover, background #E8E8E8.

## 11. Data Source View

When the "Data Source" tab at the bottom is clicked, the entire main area changes to the Data Source editing view:

### Layout
- **Left pane** (~200px): List of available tables from the connection. Each table shows a table icon + name. Tables can be dragged to the canvas.
- **Canvas area** (top half): Shows table relationship diagram. Connected tables show as rounded rectangles linked by join icons (Venn diagram style). Clicking a join icon opens the join editor dialog.
- **Data grid** (bottom half): A spreadsheet-like grid showing the first 1000 rows of data. Column headers show field name + data type icon. Columns are resizable.
- **Connection bar** (top): Shows connection name, server type icon, and a toggle for "Live" vs "Extract" connection mode.

### Table Node Styling
```css
.table-node {
  background: #FFFFFF;
  border: 2px solid #4E79A7;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #333333;
  min-width: 120px;
  cursor: move;
}
```

### Join Icon Styling
Join icons are small Venn diagram circles (~24px) positioned between connected tables. Colors indicate join type:
- Inner join: both circles filled
- Left join: left circle filled, right outlined
- Right join: right filled, left outlined
- Full outer join: both circles filled with different shade

## 12. Filter Dialog

When a user double-clicks a filter pill or adds a field to the Filters shelf, a modal dialog appears:

### Categorical Filter Dialog
- Title bar: field name (e.g., "Filter [Region]")
- Tabs: General | Wildcard | Condition | Top
- General tab: "Select from list" radio, then a scrollable checkbox list of all unique values. "All" / "None" buttons at bottom. Search box at top.
- Dimensions: ~400px wide x ~300px tall dialog

### Range Filter Dialog (for measures)
- Title bar: field name
- Tabs: Range of values | At least | At most | Special
- Range of values: a slider with min/max handles, numeric inputs for min and max values
- Aggregation dropdown at top (SUM, AVG, etc.)

### Dialog Styling
```css
.filter-dialog {
  background: #F5F5F5;
  border: 1px solid #999999;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  border-radius: 0px; /* Square corners like desktop app */
  font-size: 12px;
}
.filter-dialog-title {
  background: #E0E0E0;
  padding: 6px 12px;
  font-weight: 600;
  border-bottom: 1px solid #CCCCCC;
}
.filter-dialog-tabs {
  display: flex;
  border-bottom: 1px solid #CCCCCC;
  background: #F5F5F5;
}
.filter-dialog-tab {
  padding: 6px 16px;
  font-size: 11px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}
.filter-dialog-tab.active {
  border-bottom-color: #4E79A7;
  font-weight: 600;
}
.filter-dialog-body {
  padding: 12px;
}
.filter-dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid #CCCCCC;
}
```

## 13. Toolbar Buttons Reference

From left to right, the toolbar contains:
1. Back / Forward navigation arrows
2. Separator
3. Save icon
4. New data source icon (cylinder)
5. New worksheet icon (grid with +)
6. Duplicate sheet icon
7. Separator
8. Paste icon
9. Undo icon
10. Redo icon
11. Separator
12. Swap (rows/columns) icon
13. Sort ascending icon
14. Sort descending icon
15. Separator
16. Highlight icon (with dropdown arrow)
17. Group icon
18. Separator
19. Show/Hide labels icon
20. Show mark labels icon
21. Separator
22. Fit dropdown (Standard / Fit Width / Fit Height / Entire View)
23. Separator
24. Show Me button (colored chart icon, toggles Show Me panel)
