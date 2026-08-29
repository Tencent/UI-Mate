# xonday.com Mock — Research Summary

## App Overview

**xonday.com** is a cloud-based Work Operating System (Work OS) that enables teams to build custom workflows for managing projects, tasks, and everyday work. It is a highly visual, colorful, and flexible platform where the primary data abstraction is the **board** — a customizable spreadsheet-like table with rows (items), column groups (groups), and typed columns (status, people, dates, numbers, etc.).

xonday.com serves 225,000+ customers across 200+ industries. Its core strength is the combination of a structured data table with colorful, visual status indicators and multiple view types (Table, Kanban, Timeline/Gantt, Calendar, Chart, Dashboard).

## Key User Personas

1. **Project Manager (Sarah)** — Manages multiple project boards, assigns tasks to team members, tracks timelines and deadlines, monitors status across groups. Primary workflows: creating items, changing statuses, assigning people, setting timelines.

2. **Team Member (Alex)** — Views assigned tasks, updates item statuses, adds comments/updates to items, tracks personal workload. Primary workflows: filtering "My Items", updating status columns, writing updates.

3. **Department Lead (Mike)** — Oversees multiple boards/workspaces, uses dashboards for high-level views, reviews progress across teams. Primary workflows: navigating between boards, using dashboards, filtering/sorting.

## Core Architecture: The Board Model

xonday.com's data hierarchy is:

```
Workspace
  └── Folder (optional)
       └── Board
            └── Group (colored section header)
                 └── Item (row)
                      ├── Column Values (cells)
                      ├── Subitems
                      └── Updates (comments/activity)
```

## Complete Feature List

### P0 — Core Shell (Must Have)

| Feature | Description |
|---------|-------------|
| **Left Sidebar** | Collapsible sidebar (~250px wide) with: workspace selector at top, navigation items (Home, My Work, Favorites), board list organized by folders/workspaces, "+" button for new board, search icon, notification bell, user avatar at bottom |
| **Board Header** | Board name (editable), board description, star/favorite toggle, info icon, view tabs (Table, Kanban, +), "New Item" button (blue), search, person filter, filter, sort, hide columns, settings, "..." more menu |
| **Table View (Main Board View)** | The primary view. Full-width table with: colored group headers (collapsible), item rows with checkbox, item name, and column cells. Bottom of each group has "+ Add" row. Bottom summary row with column aggregations. |
| **Groups** | Colored section headers (pink, blue, green, orange, purple, yellow). Each group has a name, color indicator bar on the left, collapse/expand arrow, item count. Column headers repeat per group. |
| **Items (Rows)** | Individual rows within groups. Each has: selection checkbox, item name (clickable to open detail), conversation bubble icon, and cells for each column. Rows highlight on hover with light background. |
| **Routing** | Sidebar-driven routing: `/board/:boardId` for board views, `/board/:boardId/kanban` for kanban, `/my-work` for My Work view, `/` for Home |

### P1 — Primary Interactive Features

| Feature | Description |
|---------|-------------|
| **Status Column** | Colored label cells with text. Default statuses: "Done" (green #00C875), "Working on it" (orange #FDAB3D), "Stuck" (red #E2445C), "Not Started" (grey #C4C4C4), "" (empty/grey #C4C4C4). Clicking opens a dropdown picker to change status. Each status has a distinct background color filling the entire cell. |
| **People/Owner Column** | Shows circular avatar(s) of assigned people. Clicking opens a people picker dropdown with search, showing all workspace members with checkboxes. Multiple people can be assigned. |
| **Date Column** | Shows date in "MMM D" or "Mon D, YYYY" format. Clicking opens a date picker calendar popup. |
| **Timeline Column** | Shows a colored bar representing a date range (start → end). Displays "Dec 1 - 12" style text. Clicking opens dual date pickers. |
| **Numbers Column** | Editable numeric input. Bottom of group shows sum/average aggregation. |
| **Text Column** | Simple editable text field. Click to edit inline. |
| **Priority Column** | Similar to Status but with priority-specific labels: "Critical" (dark red), "High" (red), "Medium" (yellow #FDAB3D), "Low" (blue #579BFC), "" (grey). |
| **Item Detail Panel** | Clicking an item name opens a detail panel/dialog. Contains: item name (editable), all column values in a vertical layout, "Updates" tab with conversation thread, "Activity Log" tab, "Files" tab. Updates section has a rich text editor to write new updates, and shows previous updates with author avatar, timestamp, and content. |
| **Create New Item** | Clicking "+ Add" at bottom of a group or "New Item" button in header. Creates a new row at the top of the selected group with an empty name field focused for typing. |
| **Kanban View** | Cards organized in columns by Status value. Each column has a colored header matching the status color, shows count. Cards show item name, key column values (owner avatar, due date). Drag-and-drop cards between columns to change status. "+ Add Item" at bottom of each column. |
| **Search (Board-level)** | Opens an inline search bar in the board header. Filters visible items by name in real-time. Highlights matching text. |
| **Sort** | Opens a popover to select column + direction (ascending/descending). Multi-level sort supported. |
| **Filter** | Opens a filter panel. "Where [Column] [condition] [value]" builder. Multiple conditions with AND/OR. |

### P2 — Secondary/Depth Features

| Feature | Description |
|---------|-------------|
| **Home Page** | Landing page after login showing: "Good morning, [Name]" greeting, quick access boards, recently visited boards, "My Work" summary widget, "Upcoming deadlines" widget |
| **My Work View** | Personal task view aggregating items assigned to the current user across all boards. Grouped by board name or by date. Shows item name, board name, status, due date. |
| **Dashboard View** | Collection of widgets (chart, numbers, battery/progress, table). Each widget pulls data from one or more boards. Read-only aggregate display. |
| **Group Operations** | Collapse/expand group, rename group, change group color, add new group, delete group, move group up/down, duplicate group |
| **Column Operations** | Add new column (+ button at end of header row), rename column, change column type, hide column, resize column width, reorder columns via drag |
| **Item Operations** | Duplicate item, move item to group, move item to board, archive item, delete item, select multiple items via checkboxes for bulk actions |
| **Bulk Actions** | When items are selected via checkboxes, a toolbar appears at bottom: "X items selected" with actions: Move to group, Change status, Assign person, Duplicate, Archive, Delete |
| **Drag & Drop (Items)** | Reorder items within a group by dragging the grip handle on the left side of the row |
| **Subitems** | Expand arrow on items to show nested sub-items. Subitems have their own column values. "+ Add subitem" at bottom. |
| **Notifications Bell** | Top-right bell icon showing unread count badge. Clicking opens a notifications panel listing recent @mentions, assignments, status changes. |
| **Favorites** | Star boards/items to appear in "Favorites" section of the sidebar |
| **Board Activity Log** | Accessible from board header "..." menu. Shows chronological list of all changes: who changed what, when, old → new values. |
| **Inline Editing** | Most column cells are editable inline. Click a cell → it becomes editable (text input, dropdown, date picker, etc.). Blur/Enter saves. |
| **Column Summary Row** | Bottom of each group shows aggregated values: Status shows colored stacked bar, Numbers show sum, Timeline shows combined range, People shows avatar stack. |
| **Checkbox Column** | Simple checkbox toggle (checked/unchecked) |
| **Dropdown Column** | Custom dropdown with predefined options. Click cell → opens dropdown with options list. |
| **Tags Column** | Colorful tag chips. Click to add/remove tags from a predefined set. |
| **Rating Column** | Star rating (1-5 stars). Click to set rating. |
| **Progress Column** | Percentage bar showing completion (based on subitems or manual). Green fill proportional to value. |

## UI Layout Description

### Overall Layout
- **Left Sidebar**: ~250px wide, dark background (#292F4C or white in newer designs), contains workspace/board navigation
- **Main Content**: Fills remaining width, white/light grey background (#F6F7FB)
- **No persistent top bar** — board header is part of main content area

### Sidebar Structure (Top to Bottom)
1. **Workspace Selector** — Current workspace name with dropdown arrow, workspace icon/logo
2. **Navigation Links** — Home (house icon), My Work (person icon), Favorites (star icon)
3. **Search** — Search input or icon
4. **Board List** — Folders (expandable) containing boards. Each board shows icon + name. Active board highlighted with blue left border
5. **+ Add** — Button to create new board/folder
6. **Bottom Icons** — Help (?), Trash, Notifications bell, User avatar/initials

### Board Table View Layout
1. **Board Header** (~60px height)
   - Left: Board name (large, bold), info icon, star icon
   - Below: Board description (small, muted text)
   - Below: View tabs (Table, Kanban, + icon to add views)
   - Right: "New Item" button (blue), Search, Person, Filter, Sort, Hide, Settings, "..."
2. **Table Area**
   - Group header: Colored bar (4px left border) + arrow + group name (colored text) + item count
   - Column headers: "Item" (name column, wider ~300px), then custom columns (~150px each)
   - Item rows: ~40px height, checkbox + name + cells, light grey borders between rows
   - "+ Add" row at bottom of each group
   - Summary/aggregation row at very bottom

### Color Palette (xonday.com Vibe Design System)
| Token | Hex | Usage |
|-------|-----|-------|
| Primary / Brand Blue | `#0073EA` | Primary buttons, links, active states |
| Surface / Background | `#F6F7FB` | Page background |
| White | `#FFFFFF` | Cards, board content area |
| Sidebar Dark | `#292F4C` | Sidebar background (dark mode sidebar) |
| Text Primary | `#323338` | Main text color |
| Text Secondary | `#676879` | Muted text, descriptions |
| Border | `#E6E9EF` | Table borders, dividers |
| Status Green (Done) | `#00C875` | Done status |
| Status Orange (Working) | `#FDAB3D` | Working on it status |
| Status Red (Stuck) | `#E2445C` | Stuck status |
| Status Blue | `#579BFC` | Ready to start, Low priority |
| Status Grey | `#C4C4C4` | Empty/default status |
| Status Purple | `#A25DDC` | Custom status |
| Status Dark Red | `#D63964` | Critical priority |
| Group Pink | `#FF158A` | Group color option |
| Group Purple | `#A25DDC` | Group color option |
| Group Blue | `#0086C0` | Group color option |
| Group Green | `#037F4C` | Group color option |
| Group Orange | `#FF642E` | Group color option |
| Group Yellow | `#CAB641` | Group color option |

### Typography (Vibe Design System)
- **Font Family**: `Figtree`, sans-serif (fallback: `Roboto`, `Helvetica`, `Arial`)
- **Board Name**: 24px, font-weight 600
- **Group Name**: 16px, font-weight 600, colored
- **Column Header**: 14px, font-weight 400, color #676879
- **Item Name**: 14px, font-weight 400, color #323338
- **Cell Text**: 14px, font-weight 400
- **Status Label**: 14px, font-weight 500, white text on colored background

## What to Skip (Out of Scope)

- **Authentication/Login** — App starts pre-logged-in as "Sarah Johnson"
- **Real API calls** — All data is mock/localStorage
- **File uploads** — Visual only (no real upload processing)
- **Automations engine** — No real automation triggers
- **Integrations** — No third-party connections
- **Email notifications** — No real email sending
- **Collaborative real-time editing** — Single-user simulation
- **Billing/admin** — No account management
- **Mobile responsive** — Desktop-only layout
