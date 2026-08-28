# xonday.com Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-01-15
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest monday_mock -- --template react`, `cd monday_mock && npm install react-router-dom`, add to vite.config.js the mock-api plugin (POST /post?sid=, GET /state?sid=) for session isolation. Install no other dependencies — use plain CSS.

- [x] **Visual design system**: Study `assets/screenshots/` (especially `actual_ui_1.jpg`, `board_table_view_4.jpg`, `board_table_view_5.jpg`, `kanban_view_2.jpg`, `timeline_view_3.jpg`). The xonday.com design uses these exact values:
  - **Font**: `"Figtree", "Roboto", "Helvetica Neue", sans-serif` — load Figtree from Google Fonts (weights 400, 500, 600, 700)
  - **Primary blue**: `#0073EA` (buttons, links, active sidebar indicator, primary actions)
  - **Background**: `#F6F7FB` (page background behind content areas)
  - **White**: `#FFFFFF` (board content area, cards, modals)
  - **Sidebar bg**: `#292F4C` (dark blue-grey sidebar background)
  - **Sidebar text**: `#C5C7D0` (muted sidebar text), `#FFFFFF` (active/hover sidebar text)
  - **Text primary**: `#323338` (all main text, item names, headings)
  - **Text secondary**: `#676879` (column headers, descriptions, muted labels)
  - **Border**: `#E6E9EF` (table row borders, section dividers, input borders)
  - **Status colors**: Done `#00C875`, Working on it `#FDAB3D`, Stuck `#E2445C`, Not Started/Empty `#C4C4C4`, Blue status `#579BFC`, Purple `#A25DDC`
  - **Group colors** (left bar + header text): Pink `#FF158A`, Green `#00C875`, Blue `#579BFC`, Purple `#A25DDC`, Orange `#FF642E`, Yellow `#CAB641`, Red `#E2445C`, Dark Blue `#0086C0`
  - **Row height**: 40px per item row, 44px for group headers
  - **Sidebar width**: 250px (collapsible to 0)
  - **Board header height**: ~110px (name + description + view tabs + toolbar)
  - **Border radius**: 4px for buttons, 8px for cards/modals, full-round for avatars
  - **Status cell**: The entire cell background is the status color with white centered text, rounded-none (fills the whole cell like a colored pill)

- [x] **App layout** (`src/App.jsx`): Full viewport layout (100vw × 100vh, no scroll on body). Left: collapsible sidebar (250px, dark bg `#292F4C`). Right: main content area (flex: 1, bg `#F6F7FB`). Use `BrowserRouter` with routes:
  - `/` → Home page
  - `/board/:boardId` → Board table view (default)
  - `/board/:boardId/kanban` → Board kanban view
  - `/my-work` → My Work view
  - `/go` → State inspection endpoint (JSON output)

- [x] **State management** (`src/context/AppContext.jsx` + `src/utils/dataManager.js`): Create React Context wrapping the entire app. `dataManager.js` exports `createInitialData()` following the exact structure in `data_model.md`. Context provides: `state` (the full data object), `dispatch` (reducer for state mutations), and helper functions: `updateColumnValue(itemId, columnId, newValue)`, `createItem(groupId, name)`, `deleteItem(itemId)`, `moveItemToGroup(itemId, targetGroupId)`, `createGroup(boardId, title, color)`, `updateGroupTitle(groupId, newTitle)`, `toggleFavorite(boardId)`, `setActiveBoard(boardId)`, `setActiveView(viewId)`. Persist to localStorage under key `monday_mock_state`. Load from localStorage on mount, fallback to `createInitialData()`.

- [x] **Sidebar component** (`src/components/Sidebar.jsx`): Dark sidebar (`#292F4C`, 250px wide, full height). Structure from top to bottom:
  1. **Workspace header** (padding 16px): Workspace icon (colored circle 32px with letter, bg from workspace.color) + workspace name in white bold 16px + dropdown chevron. Below: a small muted text "Work Management".
  2. **Navigation section** (margin-top 8px): Vertical list of nav items, each 36px tall with left padding 16px: "Home" (house icon, route `/`), "My Work" (person icon, route `/my-work`), "Favorites" (star icon — lists favorited boards indented below). Each nav item: 14px text `#C5C7D0`, hover bg `rgba(255,255,255,0.1)`, active item gets white text + 3px blue left border `#0073EA`.
  3. **Search bar** (padding 12px 16px): Muted search input placeholder "Search" with magnifying glass icon, bg `rgba(255,255,255,0.05)`, rounded 4px, text `#C5C7D0`.
  4. **Board list** (scrollable, flex: 1): Each board is a 36px row: board icon (small colored square 20px with first letter or board icon, bg varies), board name 14px `#C5C7D0`. Active board: white text, blue left border 3px `#0073EA`, bg `rgba(255,255,255,0.1)`. Boards grouped under workspace headings. A "+" button at top-right for "Add new board".
  5. **Bottom section**: Help icon (?), Trash icon, vertical spacer, User avatar (circle, 32px) with current user initials.
  Collapse/expand: clicking a collapse button (hamburger or chevron at very top) toggles sidebar width from 250px to 0px with smooth transition (200ms).

- [x] **Board Header** (`src/components/BoardHeader.jsx`): Displayed at top of main content when viewing a board. Layout:
  - **Row 1** (padding 16px 24px): Board name (24px, bold `#323338`, editable — click to select, blur to save) + info icon (ⓘ, 20px grey) + star icon (☆/★ 20px, click toggles `board.isFavorite`, filled yellow `#FDAB3D` when favorited, grey outline when not).
  - **Row 2** (below name, same padding): Board description text (14px, `#676879`, optional, editable on click).
  - **Row 3** (padding 8px 24px, border-bottom 1px `#E6E9EF`): View tabs: Each tab is text + icon, 14px, padding 8px 12px. Active tab has blue underline (3px `#0073EA`). Tabs come from `board.views` array. A "+" button at end to conceptually "add view" (can be non-functional or show a placeholder dropdown).
  - **Row 4** (toolbar, padding 8px 24px): Left side: "New Item" button (blue `#0073EA` bg, white text, rounded 4px, padding 6px 16px, "+" icon). Right side row of icon buttons with labels (14px `#676879`): 🔍 Search, 👤 Person, ▽ Filter, ↕ Sort, 👁 Hide columns, ⚙ Settings, ⋯ More. Clicking "Search" toggles an inline search text input that filters items by name.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. When rendered, computes and returns a JSON object: `{ initial_state, current_state, state_diff }`. `initial_state` is the data from `createInitialData()` (stored at mount time). `current_state` is live state. `state_diff` is a deep diff showing what changed (added/removed/modified items, changed column values, etc.). Render as `<pre>` with JSON.stringify(data, null, 2).

- [x] **Session isolation**: In `vite.config.js`, add a configureServer plugin that:
  - `POST /post?sid=<sid>`: Accepts JSON body `{action: "set"|"set_current"|"reset", state: {...}}`. "set" replaces both initial and current state for that session. "set_current" updates only current state. "reset" restores current to initial.
  - `GET /go?sid=<sid>`: Returns `{initial_state, current_state, state_diff}` for that session.
  - `POST /upload?sid=<sid>`: Accepts multipart form, stores files, returns file metadata.
  - `GET /files/<sid>/<filename>`: Serves uploaded files.
  Store session data in a Map in the server plugin. Inject session ID into the client via query param or generate random one.

---

## P1 — Primary Features

Core interactive workflows for agent training. These are what make the app usable and realistic.

- [x] **Table View — Group rendering** (`src/components/board/GroupSection.jsx`): Each group renders as a distinct section. Group header row: 4px colored left border bar (group.color), collapse/expand arrow (▶/▼, 16px, clicking toggles `group.isCollapsed`), group title (16px, font-weight 600, color = group.color), item count badge in parentheses (e.g. "4 items"), then column header cells (each column.title, 14px `#676879`, padding 8px, with bottom border). When collapsed, only the header row shows; items are hidden. Below all items in the group: a `+ Add` row (same height, muted text `#676879`, click creates a new item with empty name focused).

- [x] **Table View — Item rows** (`src/components/board/ItemRow.jsx`): Each item renders as a 40px row within its group. Layout (left to right):
  1. **Grip handle** (hidden, shows on row hover): 6px wide, 3 horizontal dots icon, cursor grab — for future drag reorder
  2. **Selection checkbox** (24px): unchecked by default, toggles `item.isSelected` in state
  3. **Item name cell** (~300px, flex): Item name text (14px, `#323338`). Clicking the name opens the item detail panel. A small conversation bubble icon 💬 appears on hover (count of updates if any).
  4. **Column value cells**: One cell per column in `board.columnIds`, each with width from `column.width`. Cell rendering depends on column type (see column renderers below).
  Row hover: light blue background `#F0F7FF`. Selected rows: light blue background `#CCE5FF` with checkbox checked.
  Group color bar: Each item row has a 4px left border in the group's color.

- [x] **Status column renderer** (`src/components/columns/StatusCell.jsx`): The entire cell background fills with the status color. White text centered. Displays the label text (e.g. "Done", "Working on it", "Stuck", "Not Started"). If no value set, shows grey `#C4C4C4` background with no text. **Clicking** the cell opens a small dropdown popover directly below/above the cell showing all available label options as colored rows (each option: full-width colored bg with white text, ~36px tall). Clicking an option updates `item.columnValues[columnId].value` to the selected label index, closes the popover. The popover should have a light shadow and 4px border-radius.

- [x] **People column renderer** (`src/components/columns/PeopleCell.jsx`): Shows circular avatar(s) (28px diameter) stacked with slight overlap (-8px margin-left for 2nd+). Each avatar shows user's initials on their personal color background. If no people assigned, shows a light grey circle with "+" icon. **Clicking** opens a people picker popover: search input at top, then a scrollable list of all users (avatar + name + checkbox). Checking/unchecking toggles user in the `item.columnValues[columnId].value` array. Close on outside click.

- [x] **Date column renderer** (`src/components/columns/DateCell.jsx`): Shows formatted date "Jan 20" (short month + day). If no date set, shows empty cell with calendar icon on hover. **Clicking** opens a calendar date picker popover: month/year header with left/right arrows, 7-column day grid, today highlighted, selected date highlighted in blue `#0073EA`. Clicking a day sets the value and closes the picker.

- [x] **Timeline column renderer** (`src/components/columns/TimelineCell.jsx`): Shows a colored horizontal bar (height 24px, bg is the group's color or a blue `#579BFC`, border-radius 4px) representing the date range. Text on the bar: "Jan 1 - 31" format. Bar width proportional to date range (simplified: just show the text, full bar). If no timeline, shows empty dashed outline. **Clicking** opens a popover with two date inputs (Start Date, End Date) each with mini calendar pickers. Saving updates the timeline value.

- [x] **Numbers column renderer** (`src/components/columns/NumbersCell.jsx`): Right-aligned number with optional unit prefix/suffix (e.g. "$5,000"). Click to edit: shows a text input with numeric validation. Blur saves. At bottom of group, show sum in the summary row.

- [x] **Text column renderer** (`src/components/columns/TextCell.jsx`): Left-aligned text, truncated with ellipsis if too long. Click to edit: cell becomes an input field. Blur or Enter saves.

- [x] **Dropdown column renderer** (`src/components/columns/DropdownCell.jsx`): Shows selected option text. Clicking opens a dropdown popover listing all options from `column.settings.options`. Click to select, closes popover, updates value.

- [x] **Tags column renderer** (`src/components/columns/TagsCell.jsx`): Shows colored tag chips (small rounded pills, ~20px height, colored bg with white text). Multiple tags side by side. Clicking opens a popover with all available tags as checkboxes. Toggle tags on/off.

- [x] **Item Detail Panel** (`src/components/ItemDetailPanel.jsx`): Opens as a slide-in panel from the right (width 600px) or as a full-width overlay/modal. Contains:
  1. **Header**: Close button (X, top-right), item name (large, 20px, editable, bold)
  2. **Column values section**: Vertical list of all column values, each row: column title label (14px `#676879`) on the left (120px), value renderer on the right. Values are editable (same pickers as in the table).
  3. **Tabs**: "Updates" | "Activity Log" | "Files" (tab bar, underline active)
  4. **Updates tab**: Rich text input at top ("Write an update..." placeholder, 100px min height, basic formatting: bold, italic). "Update" button (blue). Below: chronological list of updates for this item, newest first. Each update: author avatar (32px circle) + name (bold 14px) + relative timestamp ("2 hours ago"), then body text below. Like button (👍 + count). Reply button. Replies nested below parent.
  5. **Activity Log tab**: Chronological list of changes to this item. Each entry: user avatar + "User changed Column from OldValue to NewValue" + timestamp.
  6. **Files tab**: Placeholder showing "No files yet" with upload button (visual only).

- [x] **Create new item**: Two entry points:
  1. "+ Add" row at bottom of each group: Clicking creates a new item at the end of the group's `itemIds` array, with empty `name` and all columnValues set to null/empty. The name cell immediately enters edit mode (input focused). Pressing Enter or clicking away saves.
  2. "New Item" button in board header: Creates a new item in the first non-collapsed group. Same behavior.
  Generate unique IDs like `"item-" + Date.now()`. Add to state via dispatch.

- [x] **Delete item**: Right-clicking an item row (or clicking a "..." menu that appears on hover at the far right of the row) shows a context menu with options: "Duplicate", "Move to Group →" (submenu listing other groups), "Archive", "Delete". Clicking "Delete" removes the item from `items` and from the parent group's `itemIds`. Clicking "Move to Group" moves the item.

- [x] **Kanban View** (`src/pages/KanbanView.jsx`): Renders when route is `/board/:boardId/kanban` or when Kanban tab is active. Columns are based on the status column labels. Layout: horizontal row of columns, each ~280px wide, scrollable horizontally if many. Each column:
  - **Header**: Colored top bar (8px, status color), status label text (bold, 14px, white on colored bg), item count (e.g. "/ 3")
  - **Cards**: Stacked vertically in the column. Each card: white bg, 8px border-radius, light shadow, padding 12px. Shows: item name (14px bold), below: key column values (owner avatar, due date). Hover: slightly elevated shadow.
  - **"+ Add Item"**: At bottom of each column, muted text link.
  - **Drag and drop**: Cards can be dragged between columns. Dropping a card into a different status column updates `item.columnValues[statusColumnId].value` to match that column's label index. Use HTML5 drag/drop or a simple mousedown/mousemove/mouseup implementation.

- [x] **Board-level search**: Clicking the Search icon in board toolbar toggles a search input field. As user types, items are filtered in real-time: only items whose `name` contains the search string (case-insensitive) are shown in the table. Groups that have no matching items are hidden. Clear button ("X") to reset. Store `searchQuery` in UI state.

- [x] **Sort**: Clicking "Sort" in toolbar opens a popover. "Sort by" dropdown (list of all columns on this board) + "Ascending/Descending" toggle. Applying sort reorders items within each group. Multiple sort levels: "Add another sort" button. Store in `ui.sortConditions` array.

- [x] **Filter**: Clicking "Filter" in toolbar opens a filter panel/popover. Builder pattern: "Where" + column dropdown + condition dropdown (depends on column type: "is", "is not", "contains", "is empty", "is not empty", etc.) + value input. "Add another filter" button. AND/OR toggle between conditions. Apply filters to show/hide items. Store in `ui.filterConditions`.

---

## P2 — Secondary Features

Depth and realism. Implement only after P1 is solid.

- [ ] **Home page** (`src/pages/Home.jsx`): Route `/`. Shows:
  1. Greeting: "Good morning, Sarah! ☀️" (or afternoon/evening based on time) in large text (28px bold)
  2. "Quickly access your recent boards" section: Grid of board cards (recently visited). Each card: board name, workspace name, small preview icon, last visited time. Click navigates to that board.
  3. "My Work" preview widget: List of items assigned to current user across all boards, sorted by due date. Show item name + board name + status badge + due date.

- [ ] **My Work view** (`src/pages/MyWork.jsx`): Route `/my-work`. Aggregates all items where current user ID is in any `people`-type column value. Grouped by board name (each board is a collapsible section). Columns shown: Item Name, Board, Status, Due Date, Priority. Click item name → navigates to that board and opens item detail.

- [ ] **Group operations**:
  - **Rename**: Double-click group title → editable input, Enter/blur saves.
  - **Change color**: Right-click group header → color picker popover showing 8-10 color swatches. Click to change `group.color`.
  - **Add new group**: Button at bottom of all groups ("+ Add new group"). Creates a new group with default name "New Group" and a random color.
  - **Delete group**: Right-click group header → "Delete Group" (removes group and all its items from state).
  - **Collapse/expand**: Click the arrow icon on group header.

- [ ] **Column operations**:
  - **Add column**: "+" button at the right end of the column header row. Opens a popover/modal: "Choose column type" with icons and names for each type (Status, People, Date, Numbers, Text, Timeline, Dropdown, Tags, Checkbox, Priority, Rating). Selecting creates a new column with a default title and appends to `board.columnIds`.
  - **Rename column**: Double-click column header text → editable input.
  - **Resize column**: Drag the right edge of a column header to resize `column.width`. Cursor changes to `col-resize` on hover over the edge.

- [ ] **Bulk actions toolbar**: When one or more items have `isSelected: true`, a floating toolbar appears at the bottom center of the screen (blue bg `#0073EA`, rounded 8px, shadow). Shows: "X selected" count, action buttons: "Move to" (dropdown of groups), "Change Status" (status picker), "Delete", "Duplicate". Each action applies to all selected items. "Deselect all" button (X) closes toolbar.

- [ ] **Drag-and-drop item reorder**: Within a group, items can be reordered by dragging the grip handle on the left side of the row. Show a blue insertion line indicator where the item will be placed. On drop, reorder `group.itemIds` array accordingly.

- [ ] **Subitems** (`src/components/board/SubitemRow.jsx`): Clicking an expand arrow (▶) on an item row reveals nested subitems below it (indented ~24px from the left). Subitems have the same column structure but render slightly smaller/indented. "+ Add subitem" row at the bottom. Subitems are stored as regular items in the `items` map but with `parentItemId` field and listed in the parent's `subitemIds`.

- [ ] **Notifications panel**: Clicking the bell icon in the sidebar (or top-right) opens a slide-out panel (right side, 380px wide) listing notifications. Each notification: actor avatar + message text + relative timestamp + unread dot (blue circle) if `!isRead`. Clicking a notification marks it as read and navigates to the related board/item. Unread count badge (red circle with number) appears on the bell icon when there are unread notifications.

- [ ] **Favorites section in sidebar**: Boards with `isFavorite: true` appear under a "Favorites" heading in the sidebar, above the main board list. Starred boards show a ★ icon. Clicking the star on a board header toggles favorite status.

- [ ] **Column summary row**: At the bottom of each group (below all item rows and the "+ Add" row), render a summary row. For each column:
  - **Status**: A stacked horizontal color bar showing proportions of each status value (like a mini progress bar segmented by status colors)
  - **Numbers**: Show sum value (e.g. "$55,000")
  - **People**: Show stacked avatar cluster
  - **Others**: Empty or dash

- [ ] **Checkbox column** (`src/components/columns/CheckboxCell.jsx`): Simple checkbox. Click toggles boolean value. Shows ✓ when checked (green `#00C875`), empty box when unchecked.

- [ ] **Rating column** (`src/components/columns/RatingCell.jsx`): Shows star icons (★). Click the nth star to set rating to n (1-5). Filled stars are yellow `#FDAB3D`, empty stars are light grey `#E6E9EF`.

- [ ] **Progress column** (`src/components/columns/ProgressCell.jsx`): Horizontal bar (full cell width, 8px height, bg `#E6E9EF`). Filled portion is green `#00C875` proportional to the value (0-100%). Show percentage text next to bar.

- [ ] **Inline cell editing polish**: All editable cells should show a subtle blue outline `#0073EA` when focused/editing. Escape key cancels edit and reverts value. Tab key moves to next cell.

- [ ] **Board activity log**: Accessible from board header "..." → "Activity Log". Opens a modal/panel showing all activity entries for this board, newest first. Each entry: avatar + "User changed Column on Item from OldValue to NewValue" + timestamp. Color-coded by action type.

---

## Data Seed (implement in createInitialData())

See `assets/data_model.md` for the complete `createInitialData()` structure. Key requirements:

- [x] **6 users** with distinct names, roles, avatar colors, and initials. User-1 (Sarah Johnson) is the current logged-in user.
- [x] **2 workspaces** (Main Workspace with 3 boards, Marketing with 1 board)
- [x] **4 boards** with different use cases: Team Projects (project tracking with timeline + budget), Sprint Planning (dev sprint with status + notes), Bug Tracker (bugs with severity + component dropdown), Content Calendar (marketing with tags + dates)
- [x] **9 groups** across the 4 boards with realistic names and distinct colors
- [x] **25 items** with realistic names and populated column values covering all status types (Done, Working on it, Stuck, Not Started), various assignees, dates spanning current/past/future, realistic budget numbers, and meaningful text/notes
- [x] **6 updates** (comments) on various items showing realistic team communication
- [x] **4 notifications** of different types (mention, status_change, assignment, update) with mix of read/unread
- [x] **3 activity log entries** showing recent column changes

---

## Out of Scope

Dev must NOT implement these:

- Authentication / login / signup (app starts pre-logged-in as Sarah Johnson, user-1)
- Real API calls or network communication
- Real file upload processing
- Automations engine (rule triggers)
- Integrations with third-party services
- Email/SMS notifications
- Collaborative real-time editing
- Billing, account management, admin settings
- Mobile responsive design (desktop-only, 1280px+ viewport)
- Dark mode (sidebar is always dark, content is always light — this is the default xonday.com theme)
- Undo/redo system
- Keyboard shortcuts beyond basic Tab/Enter/Escape for editing
