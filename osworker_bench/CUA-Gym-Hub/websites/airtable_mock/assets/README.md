# Xirtable Mock — Research Summary

> Last updated: 2026-03-02 by plan agent

## App Overview

**Xirtable** is a low-code platform combining the simplicity of a spreadsheet with the power of a relational database. Teams use it to organize work, track projects, manage content pipelines, and build custom workflows. It's described as a "spreadsheet-database hybrid" — data lives in structured tables with typed fields, but users interact through familiar spreadsheet-like grid views plus alternative visualizations (Kanban, Gallery, Calendar, Form, Timeline, Gantt).

### Key Differentiators from a Plain Spreadsheet
- **Typed fields** — each column has a field type (text, number, single select, date, attachment, linked record, etc.) enforcing data consistency
- **Multiple views** of the same data — Grid, Kanban, Gallery, Calendar, Form, Timeline, Gantt
- **Linked records** — tables can reference each other like a relational database
- **Rich field types** — collaborator/user, attachment, rating, barcode, button, formula, rollup, lookup
- **Grouping** — records can be visually grouped by any field
- **Expand record** — click to open a full-screen modal showing all fields for one record
- **Per-view configuration** — each view can have its own filters, sorts, grouping, hidden fields, and color rules

### Primary User Persona
**"Project Manager Pam"** — Uses Xirtable daily to:
1. Track project tasks in Grid view (add/edit records, update statuses)
2. Visualize workflow in Kanban view (drag cards between status columns)
3. Review content in Gallery view (browse visual assets with cover images)
4. Collect data via Form view (share forms with external contributors)
5. Filter/sort/group data to focus on specific subsets
6. Expand individual records to see all details and edit fields

---

## UI Layout (Base Editing View)

Xirtable's primary workspace is the **Base view** — where users interact with their data. There is NO persistent left sidebar in the base editing view (the sidebar only appears on the home/dashboard screen). The layout is:

### Header Bar (Top)
- **Height**: ~56px
- **Background**: Customizable per base — can be blue, green, purple, red, teal, orange, pink, etc. (default varies)
- **Left side**: Xirtable logo icon (small), Base name (bold, white, clickable dropdown for rename), chevron dropdown
- **Center**: "Data" | "Automations" | "Interfaces" toggle pills/tabs (Data is active by default, shown with slight highlight)
- **Right side**: History icon, Help button, Notification bell, Share button (white bg, colored text), User avatar circle

### Table Tabs Bar
- **Positioned**: Directly below the header bar, same colored background as header
- **Content**: Tab for each table name — active tab is white bg with dark text and rounded top corners; inactive tabs are transparent with white/light text
- **Right end**: "+" button to add a new table, and sometimes a dropdown chevron for each tab

### View Toolbar Bar
- **Height**: ~44px
- **Background**: White
- **Left section**: "Views" sidebar toggle button (hamburger icon), then the active view name with its type icon (grid/kanban/etc.), a "..." more menu, collaborator avatars
- **Center section**: Action buttons — "Hide fields", "Filter", "Group", "Sort", "Color", "Share and sync", row height toggle (icon)
- **Right section**: Search icon / "Find in view" search input, Extensions toggle, Record templates
- **Active filter/sort indicators**: When filters/sorts are active, the buttons show a count badge (e.g., "Grouped by 1 field", "Filter" with blue highlight)

### View Sidebar Panel (Toggled)
- **Width**: ~260px
- **Position**: Slides in from the left, pushing the main content area
- **Top**: Search input "Find a view"
- **Content**: List of all views for the current table, each with icon + name. Active view has checkmark. Views are: Grid (table icon), Form (purple form icon), Calendar (red calendar icon), Gallery (pink grid icon), Kanban (green columns icon), Timeline (red timeline icon, Pro), List (grid icon), Gantt (chain icon, Pro)
- **Bottom**: "Create..." section with view type options, each with a "+" button

### Main Content Area
- Occupies all remaining space below the toolbar
- Content depends on the active view type (Grid, Kanban, Gallery, Form)

### Footer Bar (Grid View only)
- **Height**: ~32px
- **Background**: Light gray
- **Content**: Record count ("X records"), aggregation row buttons

---

## Color Scheme

Based on screenshots and research:

| Element | Color | Hex |
|---------|-------|-----|
| Primary Blue (Xirtable brand) | Blue | `#2D7FF9` |
| Default Base Header | Teal/Blue | `#2D7FF9` |
| Grid Header Background | Light gray | `#F5F5F5` |
| Grid Cell Border | Light gray | `#E2E2E2` |
| Grid Row Hover | Very light gray | `#F8F8F8` |
| Primary Field Text | Dark gray | `#333333` |
| Regular Text | Dark gray | `#111111` |
| Muted Text | Medium gray | `#666666` |
| View Sidebar Active | Blue text | `#2D7FF9` |
| Cell Selection Highlight | Blue border | `#2D7FF9` |
| White Background | White | `#FFFFFF` |
| Add Row Button | Gray | `#AAAAAA` |

### Select Option Color Palette (Xirtable uses these named colors):
- **Light Blue**: `#D0F0FD` text `#18618A`
- **Cyan/Teal**: `#C2F5E9` text `#20715A`
- **Green**: `#D1F7C4` text `#2D7514`
- **Yellow**: `#FFEAB6` text `#8D6302`
- **Orange**: `#FEE2D5` text `#B3540E`
- **Red/Pink**: `#FFDCE5` text `#B31846`
- **Purple**: `#EDE2FE` text `#6B1CB0`
- **Gray**: `#EEEEEE` text `#444444`

---

## Feature List (Priority Ranked)

### P0 — Core (App won't function without these)
1. App shell layout (header bar + table tabs + view toolbar + main area)
2. Grid View with inline cell editing
3. Multiple field types (text, number, single_select, date, checkbox, attachment, etc.)
4. Table tabs with switching
5. View switching (Grid/Kanban/Gallery/Form)
6. Add/delete records
7. State management + localStorage persistence
8. `/go` debug endpoint
9. Session isolation

### P1 — Primary Features (Core interactive workflows)
1. **Expanded record modal** — click row expand icon → full-screen modal with all fields in form layout, editable
2. **Functional filter panel** — click Filter → dropdown panel with condition builder (field + operator + value), add/remove conditions
3. **Functional sort panel** — click Sort → dropdown with field + direction (A→Z / Z→A), multiple sort levels
4. **Functional group panel** — click Group → dropdown to select grouping field, records collapse into groups with headers
5. **Hide fields panel** — click Hide Fields → toggle visibility of each column with switches
6. **Search/Find in view** — type in search box → highlight/filter matching records
7. **View sidebar panel** — toggle Views sidebar on left with list of views and "Create..." section
8. **Create new view** — select type from sidebar → adds new view to the list
9. **Add field (column)** — "+" button at right edge of grid headers → field name + type picker modal
10. **Kanban drag and drop** — drag cards between columns to update the group field value
11. **Multiple select editing** — click cell → dropdown with add/remove tags
12. **Row selection** — checkbox column that works, with select-all in header
13. **Field type icons** in column headers (different icon per field type)
14. **Column resize** — drag column header edge to resize
15. **Record count footer** with summary statistics

### P2 — Secondary Features (Depth and realism)
1. **Calendar view** — date-field-based calendar with records as event cards
2. **Column reorder** — drag column headers to rearrange
3. **Row reorder** — drag rows to manually sort
4. **Rename table** — double-click or right-click table tab
5. **Delete table** — right-click table tab → delete option
6. **Rename field** — click column header → inline rename
7. **Delete field** — column header dropdown → delete option
8. **Field configuration modal** — change field type, options, description
9. **Undo/redo** — Ctrl+Z / Ctrl+Shift+Z
10. **Copy/paste cells** — Ctrl+C / Ctrl+V within the grid
11. **Row height toggle** — short/medium/tall/extra-tall row heights
12. **Color conditional formatting** — color rows based on field values
13. **Base color customization** — change the header bar color
14. **Form view with actual data writing** — form submission creates record with filled data
15. **Keyboard navigation** — arrow keys move between cells, Enter opens editing, Escape closes

---

## Data Model Overview

See `data_model.md` for complete entity definitions.

**Core entities:**
- **Base** — top-level container (like a database)
- **Table** — belongs to a Base, contains Fields and Records
- **Field** — column definition with type and configuration
- **Record** — row of data, with values keyed by field ID
- **View** — saved configuration (type, filters, sorts, groups, hidden fields, column widths)

---

## What to Skip (Out of Scope)

- **Authentication** — app starts pre-logged-in as "John Doe" (default user)
- **Real-time collaboration** — no live cursors or multi-user presence
- **Automations** — "Automations" tab exists but is non-functional
- **Interfaces** — "Interfaces" tab exists but is non-functional
- **Extensions/Apps** — sidebar toggle exists but panel is empty/non-functional
- **Import/Export** — no CSV import or data export
- **Revision history** — no undo history timeline
- **API access** — no external API beyond the mock `/go`, `/post`, `/state` endpoints
- **Comments on records** — not implemented
- **Real file uploads** — attachment fields use mock image URLs

---

## Screenshots Inventory

```
assets/screenshots/
├── 000001.jpg    — Xirtable Interface Designer with add element panel
├── 000002.jpg    — Embedded grid view with activities, colored select pills, search bar
├── 000003.jpg    — Xirtable homepage / branding
├── 000004.jpg    — Multiple Xirtable views: grid with attachments, content calendar, apps panel
├── 000005.jpg    — Xirtable template gallery (base types overview)
├── grid/
│   ├── 000003.jpg — Base vs Interface comparison showing full base UI layout
│   └── 000004.jpg — ★ KEY: "How to customize a view" — shows view sidebar, table tabs, grouped grid, filter/sort toolbar
├── kanban/
│   └── 000002.jpg — ★ KEY: Full Xirtable base UI with grid view, sidebar, toolbar, field types
├── detail/
│   └── 000002.jpg — Xirtable workspace settings modal (shows modal pattern)
```

**Most important reference screenshots for dev agent:**
- `grid/000004.jpg` — Shows the complete Xirtable base layout: green header with base name + table tabs, view toolbar with "Views"/"Hide fields"/"Filter"/"Grouped by 1 field"/"Sort" buttons, view sidebar with view list and "Create..." section, grouped grid with colored status pills
- `kanban/000002.jpg` — Shows actual base with purple/red header, Data/Automations/Interfaces tabs, view toolbar, grid columns with field type icons, "+" to add columns, row numbers, record count footer, view sidebar with Create options (Grid, Form, Calendar, Gallery, Kanban, Timeline, List, Gantt)
