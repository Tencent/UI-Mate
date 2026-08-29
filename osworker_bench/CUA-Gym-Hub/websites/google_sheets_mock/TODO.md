# Xoogle Sheets Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing code: TypeScript + React + Vite + Tailwind CSS (project is already scaffolded with basic grid)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

## Current Implementation Status

The project already has a working scaffold with basic spreadsheet grid, cell editing, simple formula engine (SUM/AVERAGE/COUNT/MAX/MIN), range selection, toolbar with some formatting, formula bar, sheet tabs, and the /go state endpoint. The items below focus on **fixing, completing, and extending** the existing implementation to match real Xoogle Sheets behavior.

---

## P0 — Core Shell Fixes & Completion

These items fix critical issues in the existing scaffold that prevent it from feeling like a real Xoogle Sheets document.

- [x] **Visual design system overhaul**: Study `assets/screenshots/main_ui_03.jpg` and `assets/screenshots/sort_filter_01.jpg` closely. The current mock uses generic colors. Match the real Xoogle Sheets color system exactly:
  - Title bar: white background, Xoogle Sheets icon (green doc with grid) 28px, document title 18px regular weight `#202124`, star icon ☆, folder icon, cloud save icon
  - Menu bar: background `#EDF2FA` (slightly blue-tinted), items `File Edit View Insert Format Data Tools Extensions Help` in 14px `#202124`, ~8px padding between items, hover background `#D3E3FD` rounded 4px
  - Toolbar: background `#F9FBFD`, icons 18px, grouped by thin 1px `#DADCE0` vertical separators, button hover shows `#E8EAED` rounded rectangle, active/toggled state uses `#D3E3FD` background
  - Formula bar: 1px `#DADCE0` top/bottom borders, cell name box ~60px with `#F1F3F4` background, "fx" label in `#5F6368` 14px, input area plain white
  - Grid: cell borders `#E0E0E0` 1px, column headers `#F8F9FA` background with `#5F6368` 11px centered text, row numbers same styling, selected cell `#1A73E8` 2px border, range fill `rgba(26,115,232,0.1)`
  - Sheet tabs bar: `#F9FBFD` background, active tab white with 3px `#0F9D58` bottom border, inactive tab `#F8F9FA`, "+" button, "≡" all-sheets button
  - Scrollbars: thin custom scrollbars matching Google Material style

- [x] **Seed data upgrade**: Replace the tiny 2-row Apple/Banana demo data with the comprehensive "Q4 2024 Sales Report" dataset from `assets/data_model.md` — 3 sheets ("Sales Data" with 9 product rows + summary formulas, "Summary" with category aggregates + percentages, "Notes" with text content). This gives agents meaningful content to search, sort, edit, and format.

- [x] **Menu bar — implement all dropdown menus**: Each menu item should open a dropdown panel on click. Clicking another menu item while one is open switches. Clicking outside closes. Each dropdown shows items with: label (left), keyboard shortcut (right, gray `#5F6368`), separator lines, disabled items in `#DADCE0`. Submenus show on hover with `▸` arrow. Items should dispatch real actions where implemented, or show a toast "Not available" for unimplemented items.
  - **File**: New, Open, Make a copy, Share, Email, Download ▸ (CSV, XLSX, PDF), Rename, Move, Move to trash, Version history ▸, Print (Ctrl+P)
  - **Edit**: Undo (Ctrl+Z), Redo (Ctrl+Y), Cut (Ctrl+X), Copy (Ctrl+C), Paste (Ctrl+V), Paste special ▸ (Values only, Format only), Find and replace (Ctrl+H), Delete values, Delete row, Delete column
  - **View**: Show ▸ (Formula bar ✓, Gridlines ✓), Freeze ▸ (No rows, 1 row, 2 rows, Up to current row, No columns, 1 column, 2 columns, Up to current column), Group ▸, Zoom ▸ (50%, 75%, 100%, 125%, 150%, 200%)
  - **Insert**: Rows above, Rows below, Columns left, Columns right, Cells and shift down, Cells and shift right, —, Chart, Image, Drawing, —, Function ▸ (SUM, AVERAGE, COUNT, MAX, MIN), Note, Comment
  - **Format**: Number ▸ (Automatic, Plain text, Number, Percent, Scientific, Currency, Date, Time), Bold (Ctrl+B), Italic (Ctrl+I), Underline (Ctrl+U), Strikethrough (Alt+Shift+5), —, Font size ▸, —, Align ▸ (Left, Center, Right), Text wrapping ▸ (Overflow, Wrap, Clip), —, Conditional formatting, Alternating colors, —, Clear formatting (Ctrl+\\)
  - **Data**: Sort sheet by column A (A→Z), Sort sheet by column A (Z→A), Sort range ▸, Create filter, —, Data validation, —, Named ranges
  - **Tools**: Spelling, Notification settings
  - **Extensions**: Add-ons (non-functional placeholder)
  - **Help**: Search the menus, Keyboard shortcuts

- [x] **Toolbar completion — add missing buttons and make all buttons functional**: The current toolbar is missing several Xoogle Sheets toolbar buttons. Match the exact toolbar layout from `assets/screenshots/sort_filter_01.jpg`:
  - Group 1: Undo (↶) Redo (↷) Print (🖨) Paint format (🖌) — undo/redo need actual action history
  - Group 2: Zoom dropdown (100% ▼) — opens list: 50%, 75%, 90%, 100%, 125%, 150%, 200%
  - Group 3: Currency ($), Percent (%), Decrease decimal (.0←), Increase decimal (.0→), Number format (123 ▼) dropdown
  - Group 4: Font family dropdown (currently works), Font size dropdown (currently works)
  - Group 5: Bold (**B**), Italic (*I*), Strikethrough (~~S~~), Text color (**A̲** with colored underline), Fill color (paint bucket with colored bar)
  - Group 6: Borders dropdown (grid icon ⊞ with dropdown arrow — opens border type selector: all, inner, outer, left, right, top, bottom, clear, border color, border style), Merge cells dropdown (merge all, merge horizontally, merge vertically, unmerge)
  - Group 7: Horizontal align (≡ with 3 options on dropdown), Vertical align (similar), Text wrapping (overflow/wrap/clip), Text rotation
  - Group 8: Insert link (🔗), Insert comment (💬), Insert chart (📊)
  - Group 9: Create filter (▽), Functions dropdown (Σ ▼ — lists SUM, AVERAGE, COUNT, MAX, MIN with auto-range detection)
  - Each button must show a tooltip on hover with the action name + shortcut

- [x] **Undo/Redo system**: Implement real undo/redo with action history stack. Before any cell edit, format change, row/col insert/delete, or sort operation, push the affected cells' before-state to the undo stack. Ctrl+Z pops from undo and pushes to redo. Ctrl+Y reverses. Cap stack at 100 entries. The undo/redo toolbar buttons should show enabled (dark icon) when stack is non-empty, disabled (gray icon) when empty.

- [x] **Copy/Cut/Paste**: Implement Ctrl+C (copy), Ctrl+X (cut), Ctrl+V (paste). When cells are copied/cut, show a marching-ants dashed border animation around the source range (green dashed border that animates). On paste: insert cell data + formatting at the selected cell, offsetting by the relative position. Cut should clear the source cells after paste. Clipboard state stored in workbook state. Also support Paste Special: "Paste values only" (strips formatting) and "Paste format only" (copies only style, not values). Esc cancels the copy/cut operation (removes marching ants).

- [x] **Context menu (right-click)**: Right-clicking a cell (or selected range, or row header, or column header) shows a context menu. Style: white background, `#202124` text, `#F1F3F4` hover, 1px `#DADCE0` border, 4px border-radius, `box-shadow: 0 2px 6px rgba(0,0,0,0.15)`. Items vary by target:
  - **Cell context menu**: Cut, Copy, Paste, Paste special ▸, —, Insert row above, Insert row below, Insert column left, Insert column right, —, Delete row, Delete column, Clear contents, —, Insert note, Insert comment, —, Define named range
  - **Row header context menu**: Cut, Copy, Paste, Paste special ▸, —, Insert 1 row above, Insert 1 row below, Delete row, Clear row, —, Resize row, Hide row
  - **Column header context menu**: Cut, Copy, Paste, Paste special ▸, —, Insert 1 column left, Insert 1 column right, Delete column, Clear column, —, Resize column, Hide column, —, Sort sheet A→Z, Sort sheet Z→A

- [x] **Session isolation & state API**: Verify and fix the existing vite.config.js mock-api plugin to ensure: (1) `POST /post?sid=<sid>` with `{"action":"set","state":{...}}` sets both current + initial state, (2) `POST /post?sid=<sid>` with `{"action":"set_current","state":{...}}` updates only current state, (3) `POST /post?sid=<sid>` with `{"action":"reset"}` resets to initial, (4) `GET /go?sid=<sid>` returns `{initial_state, current_state, state_diff}`. The `useSpreadsheet.ts` hook must call `fetchCustomState()` on mount and merge any server-provided state with defaults. State must survive page refresh via localStorage keyed by sid.

---

## P1 — Primary Interactive Features

These are the core workflows agents need to practice. Each feature should produce observable state changes via `/go`.

### Cell Editing & Navigation

- [x] **Enhanced cell editing**: Double-click or F2 enters edit mode in the cell (blue border thickens, cursor blinks inside). Enter commits and moves down. Tab commits and moves right. Shift+Enter commits and moves up. Shift+Tab commits and moves left. Escape cancels edit and restores previous value. Clicking another cell commits current edit and selects new cell. The formula bar should simultaneously show/edit the same content (typing in formula bar updates cell, and vice versa).

- [x] **Arrow key navigation**: Arrow keys move selection when not editing. When editing, arrow keys move cursor within text. When at edge of text (cursor at end + press Right), commit and move to next cell. Home key goes to column A. Ctrl+Home goes to A1. End key goes to last column with data. Ctrl+End goes to last cell with data.

- [x] **Multi-cell selection improvements**: Click+drag for rectangular range selection (currently exists). Shift+Click extends selection from anchor to clicked cell. Ctrl+Click adds individual cells to selection (non-contiguous). Shift+Arrow extends selection by one cell. Ctrl+Shift+Arrow extends to edge of data region. Clicking column header selects entire column. Clicking row number selects entire row. Clicking the corner cell (top-left, intersection of row/col headers) selects all cells. Selected range shown in name box as "A1:D10" format.

### Formatting

- [x] **Text color picker**: Click the text color button dropdown arrow (not the button itself — button applies last color). Dropdown shows: grid of 10×8 preset colors (Google's standard palette: row 1 = black/dark4/dark3/dark2/dark1/gray/light1/light2/light3/white; rows 2-7 = red/orange/yellow/green/cyan/blue/purple/magenta shades from dark to light), "Custom" button at bottom opens hex input field. The colored bar under the "A" on the button shows the last-used color. Applying color changes `sheets[i].data[cellId].style.color`.

- [x] **Fill color picker**: Same dropdown pattern as text color but for cell background. Paint bucket icon with colored bar. Applying changes `sheets[i].data[cellId].style.bg`. Include a "None" option to remove background.

- [x] **Borders dropdown**: Click the borders button dropdown arrow. Shows a grid of border preset options: All borders, Inner borders, Horizontal borders, Vertical borders, Outer borders, —, Left border, Right border, Top border, Bottom border, —, Clear borders. Below that: "Border color" (opens color picker), "Border style" (solid 1px, solid 2px, dashed, dotted). Applying borders updates `sheets[i].data[cellId].style.borders`.

- [x] **Cell merge**: Merge dropdown with options: "Merge all" (merge selected range into one cell, keep top-left value), "Merge horizontally" (merge each row in selection), "Merge vertically" (merge each column in selection), "Unmerge". Merged cells display the anchor cell's content spanning across the merge area. Non-anchor cells in merged range are hidden. Update `isMergeAnchor`, `mergeSpan`, `mergedWith` fields per `data_model.md`.

- [x] **Number format dropdown (123▼)**: Dropdown shows: Automatic, Plain text, —, Number (1,000.12), Currency ($1,000.12), Percent (10.12%), Scientific (1.01E+03), —, Date (12/31/2024), Time (3:59:00 PM), —, More formats. Applying changes `sheets[i].data[cellId].format` and triggers re-render of computed display value.

- [x] **Font family dropdown**: Dropdown of fonts: Arial (default), Roboto, Times New Roman, Courier New, Georgia, Verdana, Comic Sans MS, Trebuchet MS, Impact, Palatino. Selected font shown in dropdown button. Applying changes `sheets[i].data[cellId].style.fontFamily`. Font preview: each item in dropdown rendered in its own font.

- [x] **Font size dropdown**: Dropdown of sizes: 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72. Also allow typing a custom number in the dropdown input. Applying changes `sheets[i].data[cellId].style.fontSize`.

### Row & Column Operations

- [x] **Insert rows**: From menu (Insert > Rows above/below) or context menu. Inserts a new empty row above or below the selected cell's row. All cell references in formulas below the insertion point must be updated (e.g., `=SUM(A1:A5)` becomes `=SUM(A1:A6)` if a row was inserted in that range). Row count increments. Existing data shifts down.

- [x] **Insert columns**: Same as rows but for columns. Insert column left/right of selected cell's column. Formula references update. Column count increments. Existing data shifts right.

- [x] **Delete rows/columns**: From context menu or Edit menu. Deletes selected row(s)/column(s). Remaining data shifts up/left. Formula references update. Row/col count decrements.

- [x] **Resize rows/columns**: Drag the border between row number headers to resize row height. Drag the border between column letter headers to resize column width. Cursor changes to `col-resize` or `row-resize` on hover. Double-clicking the column border auto-fits to widest content. Store in `sheets[i].columnWidths` and `sheets[i].rowHeights`.

### Data Operations

- [x] **Sort**: Data menu > "Sort sheet by column X, A→Z" or "Sort sheet by column X, Z→A". Sorts all data rows (excluding frozen header rows) by the column of the selected cell. Numeric values sort numerically, text sorts alphabetically. Update `sheets[i].sortColumn` and `sheets[i].sortDirection` in state. Cell data positions change in the `sheets[i].data` map (rows renumber).

- [x] **Filter**: Data menu > "Create a filter" or toolbar filter button. Adds dropdown arrows to the header row of the data range. Clicking a column's dropdown shows: "Sort A→Z", "Sort Z→A", "—", search box, list of unique values with checkboxes (all checked by default). Unchecking a value hides rows containing that value. Visual indicator: green filter icon when filter is active. Filter state stored in `sheets[i].filterRange` and `sheets[i].filterCriteria`.

- [x] **Find and Replace dialog**: Ctrl+H opens a floating dialog (not modal — user can still click cells). Fields: "Find" text input, "Replace with" text input. Buttons: "Find" (highlights next match yellow), "Replace" (replaces current match), "Replace all" (replaces all matches, shows count). Options: "Match case" checkbox, "Search using regular expressions" checkbox, "Match entire cell contents" checkbox. Close (X) button. Dialog positioned top-center of viewport. Matches highlighted with yellow background temporarily.

### Sheet Tab Management

- [x] **Rename sheet**: Double-click a sheet tab name to make it editable (inline text input). Enter confirms. Escape cancels. Empty name reverts to previous.

- [x] **Delete sheet**: Right-click sheet tab > "Delete". If it's the only sheet, show alert "Cannot delete the only sheet." Otherwise confirm with dialog: "Are you sure? This cannot be undone." Remove from sheets array, switch to adjacent tab.

- [x] **Duplicate sheet**: Right-click tab > "Duplicate". Creates "Copy of [SheetName]" with identical data and formatting. Appended after the original tab.

- [x] **Change tab color**: Right-click tab > "Change color" > shows color palette (8-10 preset colors + "None"). Sets `sheets[i].tabColor`. Tab displays a colored bottom bar (4px) in the chosen color instead of the default green.

- [x] **Sheet tab right-click menu**: Right-click any sheet tab shows: Duplicate, Delete, Rename, Change color ▸, Move left, Move right, Hide sheet. Style matches context menu pattern.

### Formula Engine Expansion

- [x] **Additional formulas**: Extend the formula engine (`formulas.ts`) to support these commonly-used functions:
  - **Logical**: `IF(condition, true_value, false_value)`, `AND(...)`, `OR(...)`, `NOT(expr)`
  - **Lookup**: `VLOOKUP(search_key, range, index, [is_sorted])`, `HLOOKUP(search_key, range, index, [is_sorted])`, `INDEX(range, row, col)`, `MATCH(search_key, range, type)`
  - **Text**: `CONCATENATE(str1, str2, ...)` or `&` operator, `LEN(text)`, `UPPER(text)`, `LOWER(text)`, `TRIM(text)`, `LEFT(text, num)`, `RIGHT(text, num)`, `MID(text, start, num)`, `SUBSTITUTE(text, old, new)`, `TEXT(value, format)`
  - **Math**: `ROUND(value, places)`, `ROUNDUP(value, places)`, `ROUNDDOWN(value, places)`, `ABS(value)`, `CEILING(value)`, `FLOOR(value)`, `MOD(dividend, divisor)`, `POWER(base, exp)`, `SQRT(value)`
  - **Statistical**: `COUNTA(range)`, `COUNTIF(range, criteria)`, `SUMIF(range, criteria, [sum_range])`, `AVERAGEIF(range, criteria, [average_range])`, `MEDIAN(range)`
  - **Date**: `NOW()`, `TODAY()`, `DATE(year, month, day)`, `YEAR(date)`, `MONTH(date)`, `DAY(date)`, `DATEDIF(start, end, unit)`
  - Formula errors should display as: `#ERROR!`, `#REF!`, `#NAME?`, `#VALUE!`, `#DIV/0!`, `#N/A` in red text within the cell

### View Controls

- [x] **Freeze rows/columns**: View > Freeze submenu. Options: "No rows", "1 row", "2 rows", "Up to current row (row N)", "No columns", "1 column", "2 columns", "Up to current column (column N)". Frozen rows/cols get a thick gray border (2px `#DADCE0`) on their bottom/right edge. Frozen areas don't scroll — they stay fixed while the rest of the grid scrolls. Store in `sheets[i].frozenRows` and `sheets[i].frozenCols`.

- [x] **Zoom control**: Toolbar zoom dropdown and View > Zoom submenu. Options: 50%, 75%, 90%, 100%, 125%, 150%, 200%. Apply CSS `transform: scale(X)` to the grid area only (not toolbar/menu). Display current zoom level in the dropdown button.

---

## P2 — Secondary Features (Depth & Realism)

Implement these after P1 is solid. They add depth that makes the mock more convincing.

- [ ] **Conditional formatting panel**: Format > Conditional formatting opens a side panel (right side, 300px wide, slides in). Shows existing rules list. "Add another rule" button. Each rule: range input, condition dropdown (Greater than, Less than, Text contains, Is empty, Custom formula), value input, format preview (text color, bg color, bold/italic). Apply/cancel. Rules stored in `conditionalFormats[]`. Cells matching conditions get dynamic styling overlaid.

- [ ] **Chart insertion and editing**: Insert > Chart opens chart editor side panel (right side, 350px wide). Options: chart type selector (bar, line, pie, scatter, area), data range input, chart title input, "Use row 1 as headers" checkbox. Preview renders using Recharts library. "Insert" button places chart as an overlay on the grid. Charts stored in `charts[]` array in state.

- [ ] **Data validation**: Data > Data validation opens side panel. Validation types: "List of items" (comma-separated values — cell shows dropdown arrow), "Number" (between/not between/equal to/greater than/less than), "Text" (contains/doesn't contain/is email/is URL), "Checkbox" (cell becomes a clickable checkbox). Options: "Show warning" vs "Reject input", "Help text" for hover tooltip. Store in `CellData.validation`.

- [ ] **Named ranges panel**: Data > Named ranges opens side panel. Shows list of existing named ranges. "Add a range" form: name input, range input (with cell picker). Named ranges usable in formulas: `=SUM(SalesData)` where "SalesData" is a named range. Store in `namedRanges[]`.

- [ ] **Notes and comments**: Insert > Note adds a yellow sticky-note tooltip to the cell (shown on hover). Small yellow triangle in top-right corner of cell indicates a note. Insert > Comment opens a comment thread panel (right side). Comment shows avatar, name, timestamp, text, "Reply" button, "Resolve" button. Simpler implementation: just support notes with hover display.

- [ ] **Paint format tool**: Click paint format button (toolbar, paintbrush icon), then click a source cell (copies its style), then click or drag over target cells (applies the copied style). Single-click = one-time use. Double-click paint format = stays active for multiple applications until Esc. Visual indicator: cursor changes to paint roller, button shows active/toggled state.

- [ ] **Auto-fill drag handle**: Small blue square in bottom-right corner of selected cell. Drag down/right to fill series. Smart detection: numbers increment (1,2,3...), dates increment by day, text repeats, formulas adjust references. Fill preview shows values in tooltip while dragging.

- [ ] **Status bar (bottom)**: Below the sheet tabs bar, show a status bar that displays aggregate info for the current selection: "Sum: $529,400 | Average: $58,822 | Count: 9". Updates whenever selection changes. Only shows when 2+ cells are selected with numeric data.

- [ ] **Keyboard shortcuts dialog**: Help > Keyboard shortcuts opens an overlay dialog showing a categorized list of all supported shortcuts: Navigation, Editing, Formatting, Selection, Menus. Two-column layout. Close button.

- [ ] **Clear formatting**: Format > Clear formatting (Ctrl+\\) removes all style properties from selected cells (bold, italic, colors, borders, etc.) while preserving values and formulas.

- [ ] **Column auto-resize**: Double-clicking the border between two column headers auto-sizes the left column to fit its widest content. Iterate through all cells in the column, measure text width (approximate: char count × average char width for the font), set `columnWidths[colIndex]` to the maximum.

- [ ] **Cell overflow rendering**: When a cell's text is wider than the column, and the adjacent cell to the right is empty, the text visually overflows into the adjacent cell. When the adjacent cell has content, the text is clipped at the column border. When text wrapping is "wrap", the row height increases to show all content.

- [ ] **Alternating colors**: Format > Alternating colors opens side panel. Header color picker, Color 1 (even rows), Color 2 (odd rows), footer toggle. Apply to range. Creates automatic row-striping for readability.

---

## Data Seed (implement in createInitialData())

- [x] **Sheet 1 "Sales Data"**: 9 product rows across 6 columns (Product, Category, Q4 Sales, Units Sold, Revenue, Status) + 1 header row (bold, light gray bg) + summary rows (TOTALS with SUM formulas, AVERAGE, MAX, MIN, COUNT). Currency and number formatting applied. Status column color-coded (green "On Track", blue bold "Exceeding", red "Behind"). See `data_model.md` for exact values.

- [x] **Sheet 2 "Summary"**: 5 category aggregation rows (Electronics, Components, Software, Security, Hardware) with Total Revenue (currency) and % of Total (percent). Grand Total row with SUM formula. Blue header background. Tab color blue `#1A73E8`.

- [x] **Sheet 3 "Notes"**: 4 rows of plain text notes (Data Source, Review Date, Status Criteria, Next Steps). Yellow header background. Tab color yellow `#FBBC04`.

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login (app starts pre-logged-in, user avatar in top-right is decorative)
- Real-time collaboration / multi-user cursors
- Google account integration / Google apps grid menu
- Share dialog (button visible but non-functional)
- Version history / revision tracking
- Add-ons / Extensions marketplace (menu exists but placeholder)
- Print preview / actual printing
- File import/export (CSV/XLSX upload/download)
- Explore panel (AI/Gemini insights)
- Apps Script editor
- Offline mode
- Protected ranges / sheet protection
- Pivot tables
- Data connectors (BigQuery/Looker)
- Notification rules
- Real file storage (use localStorage only)
