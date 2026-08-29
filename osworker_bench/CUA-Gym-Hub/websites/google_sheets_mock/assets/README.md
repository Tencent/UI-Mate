# Xoogle Sheets Mock — Research Summary

## App Overview

**Xoogle Sheets** is Google's web-based spreadsheet application, part of the Google Workspace (formerly G Suite) productivity suite. It allows users to create, edit, format, and collaborate on spreadsheets directly in the browser. It competes primarily with Microsoft Excel and Apple Numbers.

**Category**: Productivity / Spreadsheet
**Platform**: Web (primary), mobile apps (iOS/Android)
**URL**: https://docs.google.com/spreadsheets

Xoogle Sheets is one of the most widely-used spreadsheet applications globally, with hundreds of millions of users. For agent training, it provides a rich, interaction-dense environment with cell editing, formula computation, formatting toolbars, menu systems, and multi-sheet management.

---

## Key User Personas & Primary Workflows

### Persona 1: Data Analyst
- Enters and organizes tabular data
- Uses formulas (SUM, AVERAGE, VLOOKUP, IF) for calculations
- Sorts and filters data columns
- Creates charts from data ranges
- Formats cells for readability (number formatting, conditional formatting)

### Persona 2: Project Manager
- Tracks tasks, deadlines, and status in a spreadsheet
- Uses formatting (bold headers, colored rows) to organize
- Edits cell values frequently
- Manages multiple sheets (tabs) for different teams/quarters
- Shares and comments on the spreadsheet

### Persona 3: Finance/Accounting User
- Enters financial data with currency formatting
- Uses SUM, COUNT, formulas extensively
- Applies number formats (currency, percent, decimal places)
- Freezes header rows for scrolling through large datasets
- Sorts data by date or amount

### Top 10 Daily Actions
1. Click a cell and type a value
2. Navigate between cells (arrow keys, Tab, Enter)
3. Enter/edit formulas (=SUM, =IF, etc.)
4. Format cells (bold, colors, number format, alignment)
5. Select cell ranges (click-drag or Shift+click)
6. Copy/paste cells (Ctrl+C / Ctrl+V)
7. Sort a column (A→Z or Z→A)
8. Add/rename/switch sheet tabs
9. Use Find & Replace (Ctrl+H)
10. Insert/delete rows and columns

---

## Complete Feature List

### P0 — Core Shell (Required to Render)
1. **App Layout**: Title bar + menu bar + toolbar + formula bar + grid + sheet tabs + status bar
2. **Title Bar**: Xoogle Sheets icon, editable document title, star (favorite), move to folder icon, cloud status icon, menu bar (File, Edit, View, Insert, Format, Data, Tools, Extensions, Help)
3. **Toolbar**: Undo, Redo, Print, Paint format, Zoom, Currency, Percent, Decimal +/-, Number format (123), Font family, Font size, Bold, Italic, Strikethrough, Text color, Fill color, Borders, Merge cells, Alignment (left/center/right), Text wrapping, Text rotation, Link, Comment, Chart, Filter, Functions
4. **Formula Bar**: Cell name box (shows "A1"), fx icon, formula/value input area
5. **Grid**: Column headers (A, B, C...), row numbers (1, 2, 3...), cells with borders, scroll (horizontal + vertical)
6. **Sheet Tabs Bar**: + button (add sheet), sheet tab list, right-click context menu on tabs
7. **Cell Selection**: Single cell blue border, range selection blue highlight, selection handles
8. **Routing**: / for main spreadsheet, /go for state inspection
9. **State Management**: Workbook state with session isolation
10. **Go Endpoint**: /go returning {initial_state, current_state, state_diff}

### P1 — Primary Features (Core Interactive Workflows)
1. **Cell Editing**: Click to select, double-click or F2 to edit, Enter to commit, Escape to cancel, Tab to move right
2. **Formula Engine**: Support for SUM, AVERAGE, COUNT, MAX, MIN, IF, VLOOKUP, CONCATENATE, LEN, UPPER, LOWER, TRIM, LEFT, RIGHT, MID, NOW, TODAY, ROUND, ABS, COUNTA, COUNTIF, SUMIF
3. **Cell Range Selection**: Click-drag to select rectangle, Shift+click for extend, Ctrl+click for non-contiguous
4. **Copy/Cut/Paste**: Ctrl+C, Ctrl+X, Ctrl+V with cell data + formatting, paste indicator (marching ants border)
5. **Undo/Redo**: Ctrl+Z / Ctrl+Y with action history stack
6. **Text Formatting**: Bold (Ctrl+B), Italic (Ctrl+I), Underline (Ctrl+U), Strikethrough (Alt+Shift+5)
7. **Number Formatting**: Automatic, Plain text, Number, Currency ($), Percent (%), Scientific, Date, Time, custom decimal places
8. **Font Controls**: Font family dropdown (Default Arial, and 10+ font options), font size (dropdown + freeform)
9. **Cell Colors**: Text color picker (palette + custom hex), fill/background color picker
10. **Cell Alignment**: Horizontal (left, center, right), Vertical (top, middle, bottom), text wrapping (overflow, wrap, clip), text rotation
11. **Cell Borders**: Border button with dropdown showing: all borders, inner borders, horizontal, vertical, outer, top, bottom, left, right, clear, border color, border style
12. **Merge Cells**: Merge all, merge horizontally, merge vertically, unmerge
13. **Row/Column Operations**: Insert row above/below, insert column left/right, delete row, delete column, resize row height, resize column width
14. **Sort Data**: Sort A→Z, Sort Z→A (from Data menu or right-click)
15. **Filter Views**: Toggle filter on header row, dropdown filter per column with checkboxes
16. **Find & Replace**: Ctrl+H opens dialog with find field, replace field, match case toggle, regex toggle, find/replace/replace all buttons
17. **Sheet Tab Management**: Add new sheet, rename sheet (double-click tab), delete sheet, duplicate sheet, change tab color
18. **Freeze Rows/Columns**: View > Freeze > 1 row, 2 rows, up to current row; 1 column, 2 columns, up to current column
19. **Context Menu (Right-Click)**: Cut, Copy, Paste, Paste special, Insert row above/below, Insert column left/right, Delete row/column, Clear contents, Insert note/comment, Define named range, Protect range

### P2 — Secondary Features (Depth & Realism)
1. **Conditional Formatting**: Rules panel on right side, format cells if: greater than, less than, text contains, is empty, custom formula; format style: text color, fill color, bold/italic
2. **Chart Modal**: Insert chart from selected data, chart types (bar, line, pie, scatter), chart title, basic editor panel
3. **Data Validation**: Set allowed values for cells (list of items, number range, date, checkbox), show warning or reject on invalid
4. **Named Ranges**: Define name for cell range (Data > Named ranges), use in formulas
5. **Auto-Fill / Drag Fill**: Drag cell corner handle to fill series (numbers, dates, patterns)
6. **Hyperlinks**: Insert link (Ctrl+K), display text + URL, clickable in cell
7. **Notes & Comments**: Insert note (hover to view), insert comment (thread with replies)
8. **Status Bar**: Bottom bar showing SUM, AVERAGE, COUNT of selected range
9. **Paint Format**: Click paint format button, then click cells to apply source formatting
10. **Keyboard Shortcuts**: Comprehensive shortcut support matching real Xoogle Sheets
11. **Cell Overflow**: Long text overflows into adjacent empty cells, wrapping when wrap is enabled
12. **Clear Formatting**: Format > Clear formatting (Ctrl+\)
13. **Column Auto-Resize**: Double-click column border to auto-fit content width

---

## UI Layout Description

### Overall Page Layout (from screenshots)
The Xoogle Sheets interface uses a **full-viewport layout** with no sidebar. Every pixel is devoted to the spreadsheet content.

```
┌─────────────────────────────────────────────────────────────────┐
│ [Sheets Icon] [Document Title] [★] [📁] [☁] [Last edit...]     │  ← Title Row (~40px)
│ File  Edit  View  Insert  Format  Data  Tools  Extensions  Help │  ← Menu Bar (~30px)
│ ↶ ↷ 🖨 🎨 | 100% ▼ | $ % .0 .00 123▼ | Arial▼ | 10▼ | B I S  │  ← Toolbar (~36px)
│ | A̲ 🪣 | ⊞ ⊟ | ≡ ≡ ≡ | ↕ | 🔗 💬 📊 | ▽ Σ▼              │
├──────┬──────────────────────────────────────────────────────────┤
│  A1  │ fx │  (formula/value input)                              │  ← Formula Bar (~30px)
├──────┴──────────────────────────────────────────────────────────┤
│    │  A  │  B  │  C  │  D  │  E  │  F  │  G  │  H  │  ...    │  ← Column Headers (~24px)
│  1 │     │     │     │     │     │     │     │     │          │
│  2 │     │     │     │     │     │     │     │     │          │
│  3 │     │     │     │     │     │     │     │     │          │  ← Grid (fills remaining)
│  4 │     │     │     │     │     │     │     │     │          │
│ ...│     │     │     │     │     │     │     │     │          │
├─────────────────────────────────────────────────────────────────┤
│ [+] [≡] │ Sheet1 │ Sheet2 │ Sheet3 │          │ ◀ ▶          │  ← Sheet Tabs (~28px)
└─────────────────────────────────────────────────────────────────┘
```

### Color Palette (Xoogle Sheets Design System)
- **Primary Green**: `#0F9D58` (Sheets brand, icon, active tab indicator)
- **Primary Green Dark**: `#0B8043` (hover state for green elements)
- **Header Background**: `#F8F9FA` (column/row headers, light gray)
- **Header Text**: `#5F6368` (column letters, row numbers)
- **Grid Border**: `#E0E0E0` (cell borders, thin 1px)
- **Selection Blue Border**: `#1A73E8` (Google blue, selected cell outline, 2px)
- **Selection Range Fill**: `rgba(26, 115, 232, 0.1)` (light blue for range highlight)
- **Toolbar Background**: `#F9FBFD` (very light blue-gray)
- **Menu Bar Background**: `#EDF2FA` (slightly blue-tinted gray)
- **Title Bar Background**: white
- **Active Sheet Tab**: white background with green bottom border
- **Inactive Sheet Tab**: `#F8F9FA` gray background
- **Text Primary**: `#202124` (near-black, for cell content)
- **Text Secondary**: `#5F6368` (gray, for labels and headers)
- **Menu Text**: `#202124`
- **Menu Hover**: `#F1F3F4`
- **Button Hover**: `#E8EAED` rounded highlight
- **Focus Ring**: `#1A73E8` 2px outline
- **Formula Bar Border**: `#DADCE0`
- **Scrollbar**: thin, `#DADCE0` track, `#BDC1C6` thumb

### Typography
- **Font Family**: `'Google Sans', Roboto, Arial, sans-serif` (UI elements); `Arial, sans-serif` (cell content default)
- **Menu Bar**: 14px, regular weight
- **Toolbar Icons**: 18-20px
- **Cell Content**: 10pt (default), configurable 6pt-36pt
- **Column/Row Headers**: 11px, regular, centered
- **Formula Bar**: 14px, regular
- **Document Title**: 18px, regular weight
- **Sheet Tab Labels**: 13px

### Spacing & Dimensions
- **Title bar height**: ~40px
- **Menu bar height**: ~30px
- **Toolbar height**: ~36px
- **Formula bar height**: ~30px
- **Column header height**: ~24px
- **Default row height**: ~21px
- **Default column width**: ~100px
- **Row number column width**: ~46px (auto-sizes for 3-4 digit numbers)
- **Sheet tabs bar height**: ~28px
- **Cell padding**: 3px horizontal, 2px vertical

---

## Screenshots Reference

| File | Content |
|------|---------|
| `main_ui_01.jpg` | Xoogle Sheets brand icon (green document icon with grid) |
| `main_ui_02.jpg` | YouTube thumbnail about creating new sheets |
| `main_ui_03.jpg` | **BEST REFERENCE** — Real Xoogle Sheets in browser with Stock Price Chart data, showing: title bar, menu bar (File/Edit/View/Insert/Format/Data/Tools/Extensions/Help), toolbar with all formatting buttons, formula bar, grid with data, sheet tabs at bottom |
| `main_ui_04.jpg` | Marketing promo image (not useful for UI) |
| `main_ui_05.jpg` | Spreadsheet design concepts (not Xoogle Sheets UI) |
| `toolbar_01.jpg` | Windows desktop screenshot (not relevant) |
| `toolbar_02.jpg` | Google Docs toolbar (similar but for Docs, not Sheets — still useful for menu pattern reference) |
| `toolbar_03.jpg` | Xoogle Sheets formatting tutorial showing bold/italic/underline options |
| `toolbar_04.jpg` | Xoogle Sheets tutorial showing strikethrough formatting |
| `toolbar_05.jpg` | Xoogle Sheets tutorial showing text formatting |
| `sort_filter_01.jpg` | **EXCELLENT REFERENCE** — Real Xoogle Sheets Sort tutorial showing: full toolbar with zoom, currency/percent/decimal buttons, font family (Default/Arial), font size (10), B/I/S/A̲/fill color/borders/merge/alignment, clear view of column headers and data grid |
| `sort_filter_02.jpg` | Sort dropdown tutorial (less useful) |
| `sort_filter_03.jpg` | Data filter tutorial |

### Key UI Observations from Screenshots

**Title Row** (top):
- Sheets icon (green document with grid) on far left
- Document title text (editable on click) next to icon
- Star icon (★) for favoriting
- Folder/move icon
- Cloud icon (save status)
- "Last edit was X ago" text (gray, right-aligned in title area)

**Menu Bar**:
- Items: File, Edit, View, Insert, Format, Data, Tools, Extensions, Help
- Text-only items, no icons
- Light background (`#EDF2FA`)
- Click opens dropdown with menu items, separators, keyboard shortcuts shown right-aligned

**Toolbar** (from sort_filter_01.jpg, main_ui_03.jpg):
- Grouped with subtle separators (thin gray lines)
- Group 1: Undo (↶), Redo (↷), Print (🖨), Paint format (🎨)
- Group 2: Zoom dropdown (100% ▼)
- Group 3: Currency ($), Percent (%), Decimal decrease (.0), Decimal increase (.00), Format dropdown (123 ▼)
- Group 4: Font family dropdown (Default (Ari... ▼)), Font size dropdown (10 ▼)
- Group 5: Bold (B), Italic (I), Strikethrough (S̶), Text color (A̲ with color bar), Fill color (bucket icon with color bar)
- Group 6: Borders (⊞), Merge (⊟)
- Group 7: Horizontal align (≡ left/center/right), Vertical align, Text wrapping, Text rotation
- Group 8: Link (🔗), Comment (💬), Chart (📊)
- Group 9: Filter (▽), Functions (Σ ▼)

**Formula Bar**:
- Left: Cell name box (e.g., "D3") with dropdown arrow — about 60px wide
- Center: "fx" label
- Right: Formula/value text input stretching to full width

**Grid**:
- Column headers: A, B, C, D... in gray background cells
- Row numbers: 1, 2, 3... in gray background column on left
- Selected cell: Blue border (2px), slightly bolder than grid lines
- Grid lines: Light gray (#E0E0E0), 1px
- Header text: centered, gray (#5F6368)

**Sheet Tabs Bar** (bottom):
- Far left: [+] Add sheet button, [≡] All sheets button
- Tabs: "Sheet1", "Sheet2" etc., active tab has white bg + green bottom border
- Tab right-click menu: Duplicate, Delete, Rename, Change color, Protect, Hide
- Navigation arrows on far right when many tabs

---

## Data Model Overview

See `data_model.md` for complete entity definitions.

**Core Entities:**
- **Workbook**: The top-level container (title, settings)
- **Sheet**: A tab within the workbook (name, grid data, frozen rows/cols)
- **Cell**: Individual cell data (value, formula, computed result, style, format)
- **CellStyle**: Formatting properties (bold, italic, colors, alignment, borders)
- **Chart**: Embedded chart (type, data range, title)
- **ConditionalFormatRule**: Formatting rules (condition, format, range)
- **FilterView**: Column filters (column, criteria)
- **NamedRange**: Named cell ranges (name, range)

**Relationships:**
- Workbook has many Sheets (1:N)
- Sheet has many Cells (1:N, keyed by cell ID like "A1")
- Sheet has many Charts, ConditionalFormatRules, FilterViews (1:N)
- Cells reference other cells via formulas

---

## What to Skip (Out of Scope)

- **Authentication / Login**: App starts pre-logged-in as default user
- **Real-time collaboration**: No multi-user cursors or presence indicators
- **Google account integration**: No Google profile menu, no Google apps grid
- **Sharing dialog**: Share button can be visible but non-functional
- **Version history**: No revision tracking UI
- **Add-ons / Extensions marketplace**: Menu item exists but doesn't open anything
- **Printing**: Print button exists but no print preview/dialog
- **File import/export**: No CSV/XLSX upload or download
- **Explore panel** (AI insights): Not implemented
- **Apps Script editor**: Not implemented
- **Offline mode**: Not relevant
- **Protected ranges**: Too complex for training scope
- **Pivot tables**: Complex feature, out of scope
- **Data connectors**: BigQuery, Looker integration not relevant
