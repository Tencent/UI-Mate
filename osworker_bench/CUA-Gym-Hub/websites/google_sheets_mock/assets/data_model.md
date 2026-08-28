# Xoogle Sheets Mock — Data Model

> This document defines all entity types, their fields, relationships, and the suggested `createInitialData()` structure for `dataManager.js` / `useSpreadsheet.ts`.

---

## Entity Types

### 1. WorkbookState (Top-Level State)

The root state object representing an entire Xoogle Sheets document.

| Field | Type | Required | Default | Description | Example |
|-------|------|----------|---------|-------------|---------|
| `id` | `string` | ✅ | `"workbook_1"` | Unique workbook identifier | `"workbook_1"` |
| `title` | `string` | ✅ | `"Untitled spreadsheet"` | Document title (editable) | `"Q4 Budget Report"` |
| `sheets` | `Sheet[]` | ✅ | `[defaultSheet]` | Array of sheet tabs | See Sheet entity |
| `activeSheetId` | `string` | ✅ | `sheets[0].id` | Currently visible sheet tab | `"sheet_1"` |
| `selectedCell` | `string \| null` | ✅ | `"A1"` | Currently selected cell ID | `"B5"` |
| `selectionRange` | `[string, string] \| null` | ❌ | `null` | Start and end of selection range | `["A1", "D10"]` |
| `clipboard` | `ClipboardData \| null` | ❌ | `null` | Copy/cut buffer | See ClipboardData |
| `isDragging` | `boolean` | ✅ | `false` | Whether user is dragging a selection | `false` |
| `undoStack` | `UndoEntry[]` | ❌ | `[]` | Undo history (array of snapshots) | See UndoEntry |
| `redoStack` | `UndoEntry[]` | ❌ | `[]` | Redo history | See UndoEntry |
| `namedRanges` | `NamedRange[]` | ❌ | `[]` | User-defined named ranges | See NamedRange |
| `conditionalFormats` | `ConditionalFormatRule[]` | ❌ | `[]` | Conditional formatting rules | See ConditionalFormatRule |
| `charts` | `Chart[]` | ❌ | `[]` | Embedded charts | See Chart |
| `showGridlines` | `boolean` | ❌ | `true` | Whether grid lines are visible | `true` |
| `showFormulas` | `boolean` | ❌ | `false` | Display formulas instead of computed values | `false` |

---

### 2. Sheet

A single sheet tab within the workbook.

| Field | Type | Required | Default | Description | Example |
|-------|------|----------|---------|-------------|---------|
| `id` | `string` | ✅ | `"sheet_1"` | Unique sheet identifier | `"sheet_1"` |
| `name` | `string` | ✅ | `"Sheet1"` | Tab display name | `"Sales Data"` |
| `data` | `Record<string, CellData>` | ✅ | `{}` | Cell data keyed by ID ("A1", "B2") | `{ "A1": {...}, "B2": {...} }` |
| `rowCount` | `number` | ✅ | `100` | Total number of rows | `100` |
| `colCount` | `number` | ✅ | `26` | Total number of columns | `26` |
| `frozenRows` | `number` | ❌ | `0` | Number of frozen rows at top | `1` |
| `frozenCols` | `number` | ❌ | `0` | Number of frozen columns at left | `1` |
| `tabColor` | `string \| null` | ❌ | `null` | Tab color (hex code) | `"#FF0000"` |
| `isHidden` | `boolean` | ❌ | `false` | Whether the tab is hidden | `false` |
| `columnWidths` | `Record<number, number>` | ❌ | `{}` | Custom column widths (col index → px) | `{ 0: 150, 2: 200 }` |
| `rowHeights` | `Record<number, number>` | ❌ | `{}` | Custom row heights (row index → px) | `{ 0: 30 }` |
| `filterRange` | `string \| null` | ❌ | `null` | Active filter range (e.g., "A1:D20") | `"A1:F50"` |
| `filterCriteria` | `Record<string, FilterCriteria>` | ❌ | `{}` | Filter state per column | See FilterCriteria |
| `sortColumn` | `string \| null` | ❌ | `null` | Currently sorted column letter | `"B"` |
| `sortDirection` | `'asc' \| 'desc' \| null` | ❌ | `null` | Sort direction | `"asc"` |

---

### 3. CellData

Data for a single cell.

| Field | Type | Required | Default | Description | Example |
|-------|------|----------|---------|-------------|---------|
| `value` | `string` | ✅ | `""` | Raw user input (what user typed) | `"=SUM(A1:A5)"` |
| `formula` | `string` | ✅ | `""` | Formula string or raw value | `"=SUM(A1:A5)"` |
| `computed` | `string \| number` | ❌ | `undefined` | Evaluated result of formula | `42` or `"Hello"` |
| `style` | `CellStyle` | ❌ | `{}` | Formatting properties | See CellStyle |
| `format` | `NumberFormat` | ❌ | `undefined` | Number format category | `"currency"` |
| `note` | `string \| null` | ❌ | `null` | Cell note (hover tooltip) | `"Review this number"` |
| `hyperlink` | `string \| null` | ❌ | `null` | URL for clickable link | `"https://example.com"` |
| `validation` | `DataValidation \| null` | ❌ | `null` | Data validation rule | See DataValidation |
| `mergedWith` | `string \| null` | ❌ | `null` | If this cell is merged, the anchor cell ID | `"A1"` |
| `isMergeAnchor` | `boolean` | ❌ | `false` | Whether this cell is the top-left of a merged range | `true` |
| `mergeSpan` | `{ rows: number, cols: number } \| null` | ❌ | `null` | How many rows/cols this merge covers (only on anchor) | `{ rows: 2, cols: 3 }` |

---

### 4. CellStyle

Visual formatting for a cell. All properties are optional — absence means "use default".

| Field | Type | Default | Description | Example |
|-------|------|---------|-------------|---------|
| `bold` | `boolean` | `false` | Bold text | `true` |
| `italic` | `boolean` | `false` | Italic text | `true` |
| `underline` | `boolean` | `false` | Underlined text | `true` |
| `strikethrough` | `boolean` | `false` | Strikethrough text | `true` |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Horizontal alignment | `"center"` |
| `verticalAlign` | `'top' \| 'middle' \| 'bottom'` | `'bottom'` | Vertical alignment | `"middle"` |
| `color` | `string` | `"#000000"` | Text color (hex) | `"#FF0000"` |
| `bg` | `string` | `""` (transparent) | Background fill color (hex) | `"#FFFF00"` |
| `fontSize` | `number` | `10` | Font size in pt | `12` |
| `fontFamily` | `string` | `"Arial"` | Font family name | `"Times New Roman"` |
| `textWrap` | `'overflow' \| 'wrap' \| 'clip'` | `'overflow'` | Text wrapping mode | `"wrap"` |
| `textRotation` | `number` | `0` | Text rotation in degrees | `45` |
| `borders` | `BorderConfig` | `undefined` | Custom border settings | See BorderConfig |

---

### 5. NumberFormat (enum)

| Value | Renders As | Example Input → Display |
|-------|-----------|------------------------|
| `"text"` | Plain text (no formatting) | `"12345"` → `"12345"` |
| `"number"` | Number with commas | `1234.5` → `"1,234.50"` |
| `"currency"` | Dollar sign + commas + 2 decimals | `1234.5` → `"$1,234.50"` |
| `"percent"` | Multiply by 100 + % sign | `0.75` → `"75%"` |
| `"date"` | Date format | `"2024-01-15"` → `"1/15/2024"` |
| `"scientific"` | Scientific notation | `12345` → `"1.23E+04"` |
| `"time"` | Time format | `"14:30"` → `"2:30 PM"` |

---

### 6. BorderConfig

Per-cell border configuration.

| Field | Type | Description |
|-------|------|-------------|
| `top` | `BorderEdge \| null` | Top border |
| `right` | `BorderEdge \| null` | Right border |
| `bottom` | `BorderEdge \| null` | Bottom border |
| `left` | `BorderEdge \| null` | Left border |

**BorderEdge:**
| Field | Type | Example |
|-------|------|---------|
| `style` | `'solid' \| 'dashed' \| 'dotted' \| 'double'` | `"solid"` |
| `width` | `number` | `1` or `2` |
| `color` | `string` | `"#000000"` |

---

### 7. ClipboardData

Represents copied/cut cell data.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `type` | `'copy' \| 'cut'` | Whether copy or cut operation | `"copy"` |
| `data` | `Record<string, CellData>` | Copied cell data keyed by relative position | `{ "A1": {...}, "A2": {...} }` |
| `range` | `[string, string]` | Start and end cell IDs of source range | `["A1", "A5"]` |
| `sourceSheetId` | `string` | Which sheet the data came from | `"sheet_1"` |

---

### 8. UndoEntry

A snapshot for the undo/redo system.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `action` | `string` | Description of the action | `"Edit cell B2"` |
| `sheetId` | `string` | Which sheet was affected | `"sheet_1"` |
| `cellChanges` | `Record<string, { before: CellData \| null, after: CellData \| null }>` | Changed cells with before/after states | `{ "B2": { before: {...}, after: {...} } }` |
| `timestamp` | `number` | When the action occurred | `1709000000000` |

---

### 9. NamedRange

User-defined named cell range.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | `string` | Range name (used in formulas) | `"SalesTotal"` |
| `sheetId` | `string` | Which sheet the range is on | `"sheet_1"` |
| `range` | `string` | Cell range notation | `"A1:D20"` |

---

### 10. Chart

An embedded chart visualization.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | `string` | Unique chart ID | `"chart_1"` |
| `type` | `'bar' \| 'line' \| 'pie' \| 'scatter' \| 'area'` | Chart type | `"bar"` |
| `title` | `string` | Chart title | `"Monthly Sales"` |
| `dataRange` | `string` | Source data range | `"A1:B12"` |
| `sheetId` | `string` | Which sheet the chart belongs to | `"sheet_1"` |
| `position` | `{ row: number, col: number }` | Anchor position in grid | `{ row: 1, col: 5 }` |
| `size` | `{ width: number, height: number }` | Chart size in pixels | `{ width: 600, height: 400 }` |

---

### 11. ConditionalFormatRule

A conditional formatting rule.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | `string` | Unique rule ID | `"cf_1"` |
| `range` | `string` | Affected cell range | `"B2:B20"` |
| `sheetId` | `string` | Which sheet | `"sheet_1"` |
| `condition` | `ConditionConfig` | Rule condition | See below |
| `format` | `CellStyle` | Style to apply when condition is true | `{ bold: true, bg: "#FF0000" }` |

**ConditionConfig:**
| Field | Type | Description |
|-------|------|-------------|
| `type` | `'greaterThan' \| 'lessThan' \| 'equalTo' \| 'textContains' \| 'isEmpty' \| 'isNotEmpty' \| 'customFormula'` | Condition type |
| `value` | `string \| number` | Comparison value |

---

### 12. FilterCriteria

Filter state for a column in a filter view.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `visibleValues` | `string[]` | Values that pass the filter (checked items) | `["Apple", "Banana"]` |
| `hiddenValues` | `string[]` | Values hidden by filter (unchecked items) | `["Cherry"]` |
| `condition` | `string \| null` | Filter condition (e.g., "text contains") | `null` |
| `conditionValue` | `string \| null` | Value for the condition | `null` |

---

### 13. DataValidation

Cell data validation rule.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `type` | `'list' \| 'number' \| 'text' \| 'date' \| 'checkbox'` | Validation type | `"list"` |
| `criteria` | `object` | Type-specific criteria | See below |
| `showWarning` | `boolean` | Show warning vs. reject input | `true` |
| `helpText` | `string \| null` | Help text for invalid input | `"Select a status"` |

**Criteria by type:**
- `list`: `{ values: ["Done", "In Progress", "Not Started"] }`
- `number`: `{ min: 0, max: 100 }`
- `checkbox`: `{ checkedValue: "TRUE", uncheckedValue: "FALSE" }`

---

## Entity Relationships

```
WorkbookState
├── sheets: Sheet[] (1:N)
│   ├── data: Record<cellId, CellData> (1:N)
│   │   ├── style: CellStyle (1:1, optional)
│   │   ├── validation: DataValidation (1:1, optional)
│   │   └── note: string (1:1, optional)
│   ├── columnWidths: Record<colIndex, pixels> (config)
│   ├── rowHeights: Record<rowIndex, pixels> (config)
│   └── filterCriteria: Record<colLetter, FilterCriteria> (1:N)
├── namedRanges: NamedRange[] (1:N) → references Sheet by sheetId
├── conditionalFormats: ConditionalFormatRule[] (1:N) → references Sheet by sheetId
├── charts: Chart[] (1:N) → references Sheet by sheetId
├── undoStack: UndoEntry[] (history)
├── redoStack: UndoEntry[] (history)
└── clipboard: ClipboardData (1:1, nullable)
```

---

## Suggested createInitialData() Structure

The initial data should create a realistic spreadsheet that feels pre-populated, giving agents meaningful content to interact with. The seed data creates a **"Q4 2024 Sales Report"** scenario.

```javascript
export function createInitialData() {
  return {
    id: "workbook_1",
    title: "Q4 2024 Sales Report",
    activeSheetId: "sheet_1",
    selectedCell: "A1",
    selectionRange: null,
    clipboard: null,
    isDragging: false,
    undoStack: [],
    redoStack: [],
    namedRanges: [],
    conditionalFormats: [],
    charts: [],
    showGridlines: true,
    showFormulas: false,
    sheets: [
      // Sheet 1: "Sales Data" — main data table
      {
        id: "sheet_1",
        name: "Sales Data",
        rowCount: 100,
        colCount: 26,
        frozenRows: 1,
        frozenCols: 0,
        tabColor: null,
        isHidden: false,
        columnWidths: { 0: 120, 1: 140, 2: 100, 3: 100, 4: 120, 5: 100 },
        rowHeights: {},
        filterRange: null,
        filterCriteria: {},
        sortColumn: null,
        sortDirection: null,
        data: {
          // Row 1: Headers (bold, light gray bg, centered)
          "A1": { value: "Product", formula: "Product", style: { bold: true, bg: "#F3F3F3", align: "center" } },
          "B1": { value: "Category", formula: "Category", style: { bold: true, bg: "#F3F3F3", align: "center" } },
          "C1": { value: "Q4 Sales", formula: "Q4 Sales", style: { bold: true, bg: "#F3F3F3", align: "center" } },
          "D1": { value: "Units Sold", formula: "Units Sold", style: { bold: true, bg: "#F3F3F3", align: "center" } },
          "E1": { value: "Revenue", formula: "Revenue", style: { bold: true, bg: "#F3F3F3", align: "center" } },
          "F1": { value: "Status", formula: "Status", style: { bold: true, bg: "#F3F3F3", align: "center" } },

          // Row 2-11: Data rows
          "A2": { value: "Widget Pro", formula: "Widget Pro" },
          "B2": { value: "Electronics", formula: "Electronics" },
          "C2": { value: "45200", formula: "45200", format: "currency" },
          "D2": { value: "1250", formula: "1250", format: "number" },
          "E2": { value: "=C2*1.15", formula: "=C2*1.15", format: "currency" },
          "F2": { value: "On Track", formula: "On Track", style: { color: "#0F9D58" } },

          "A3": { value: "Gadget X", formula: "Gadget X" },
          "B3": { value: "Electronics", formula: "Electronics" },
          "C3": { value: "32800", formula: "32800", format: "currency" },
          "D3": { value: "890", formula: "890", format: "number" },
          "E3": { value: "=C3*1.15", formula: "=C3*1.15", format: "currency" },
          "F3": { value: "On Track", formula: "On Track", style: { color: "#0F9D58" } },

          "A4": { value: "SuperChip 3000", formula: "SuperChip 3000" },
          "B4": { value: "Components", formula: "Components" },
          "C4": { value: "67500", formula: "67500", format: "currency" },
          "D4": { value: "2100", formula: "2100", format: "number" },
          "E4": { value: "=C4*1.15", formula: "=C4*1.15", format: "currency" },
          "F4": { value: "Exceeding", formula: "Exceeding", style: { color: "#1A73E8", bold: true } },

          "A5": { value: "DataSync Hub", formula: "DataSync Hub" },
          "B5": { value: "Software", formula: "Software" },
          "C5": { value: "89100", formula: "89100", format: "currency" },
          "D5": { value: "3400", formula: "3400", format: "number" },
          "E5": { value: "=C5*1.15", formula: "=C5*1.15", format: "currency" },
          "F5": { value: "Exceeding", formula: "Exceeding", style: { color: "#1A73E8", bold: true } },

          "A6": { value: "CloudBase Pro", formula: "CloudBase Pro" },
          "B6": { value: "Software", formula: "Software" },
          "C6": { value: "54300", formula: "54300", format: "currency" },
          "D6": { value: "1800", formula: "1800", format: "number" },
          "E6": { value: "=C6*1.15", formula: "=C6*1.15", format: "currency" },
          "F6": { value: "On Track", formula: "On Track", style: { color: "#0F9D58" } },

          "A7": { value: "NetGuard Firewall", formula: "NetGuard Firewall" },
          "B7": { value: "Security", formula: "Security" },
          "C7": { value: "41200", formula: "41200", format: "currency" },
          "D7": { value: "620", formula: "620", format: "number" },
          "E7": { value: "=C7*1.15", formula: "=C7*1.15", format: "currency" },
          "F7": { value: "Behind", formula: "Behind", style: { color: "#EA4335" } },

          "A8": { value: "PrintMaster 500", formula: "PrintMaster 500" },
          "B8": { value: "Hardware", formula: "Hardware" },
          "C8": { value: "28900", formula: "28900", format: "currency" },
          "D8": { value: "450", formula: "450", format: "number" },
          "E8": { value: "=C8*1.15", formula: "=C8*1.15", format: "currency" },
          "F8": { value: "Behind", formula: "Behind", style: { color: "#EA4335" } },

          "A9": { value: "SmartDisplay 4K", formula: "SmartDisplay 4K" },
          "B9": { value: "Hardware", formula: "Hardware" },
          "C9": { value: "73600", formula: "73600", format: "currency" },
          "D9": { value: "920", formula: "920", format: "number" },
          "E9": { value: "=C9*1.15", formula: "=C9*1.15", format: "currency" },
          "F9": { value: "On Track", formula: "On Track", style: { color: "#0F9D58" } },

          "A10": { value: "AI Assistant Kit", formula: "AI Assistant Kit" },
          "B10": { value: "Software", formula: "Software" },
          "C10": { value: "96800", formula: "96800", format: "currency" },
          "D10": { value: "4200", formula: "4200", format: "number" },
          "E10": { value: "=C10*1.15", formula: "=C10*1.15", format: "currency" },
          "F10": { value: "Exceeding", formula: "Exceeding", style: { color: "#1A73E8", bold: true } },

          // Row 12: Summary section with formulas
          "A12": { value: "TOTALS", formula: "TOTALS", style: { bold: true, bg: "#E8F0FE" } },
          "B12": { value: "", formula: "", style: { bg: "#E8F0FE" } },
          "C12": { value: "=SUM(C2:C10)", formula: "=SUM(C2:C10)", format: "currency", style: { bold: true, bg: "#E8F0FE" } },
          "D12": { value: "=SUM(D2:D10)", formula: "=SUM(D2:D10)", format: "number", style: { bold: true, bg: "#E8F0FE" } },
          "E12": { value: "=SUM(E2:E10)", formula: "=SUM(E2:E10)", format: "currency", style: { bold: true, bg: "#E8F0FE" } },
          "F12": { value: "", formula: "", style: { bg: "#E8F0FE" } },

          "A13": { value: "AVERAGE", formula: "AVERAGE", style: { bold: true } },
          "C13": { value: "=AVERAGE(C2:C10)", formula: "=AVERAGE(C2:C10)", format: "currency", style: { bold: true } },
          "D13": { value: "=AVERAGE(D2:D10)", formula: "=AVERAGE(D2:D10)", format: "number", style: { bold: true } },

          "A14": { value: "MAX", formula: "MAX", style: { bold: true } },
          "C14": { value: "=MAX(C2:C10)", formula: "=MAX(C2:C10)", format: "currency", style: { bold: true } },

          "A15": { value: "MIN", formula: "MIN", style: { bold: true } },
          "C15": { value: "=MIN(C2:C10)", formula: "=MIN(C2:C10)", format: "currency", style: { bold: true } },

          "A16": { value: "COUNT", formula: "COUNT", style: { bold: true } },
          "C16": { value: "=COUNT(C2:C10)", formula: "=COUNT(C2:C10)", format: "number", style: { bold: true } },
        }
      },

      // Sheet 2: "Summary" — aggregated view
      {
        id: "sheet_2",
        name: "Summary",
        rowCount: 100,
        colCount: 26,
        frozenRows: 0,
        frozenCols: 0,
        tabColor: "#1A73E8",
        isHidden: false,
        columnWidths: { 0: 140, 1: 120, 2: 120 },
        rowHeights: {},
        filterRange: null,
        filterCriteria: {},
        sortColumn: null,
        sortDirection: null,
        data: {
          "A1": { value: "Category", formula: "Category", style: { bold: true, bg: "#E8F0FE", align: "center" } },
          "B1": { value: "Total Revenue", formula: "Total Revenue", style: { bold: true, bg: "#E8F0FE", align: "center" } },
          "C1": { value: "% of Total", formula: "% of Total", style: { bold: true, bg: "#E8F0FE", align: "center" } },

          "A2": { value: "Electronics", formula: "Electronics" },
          "B2": { value: "78000", formula: "78000", format: "currency" },
          "C2": { value: "0.1443", formula: "0.1443", format: "percent" },

          "A3": { value: "Components", formula: "Components" },
          "B3": { value: "67500", formula: "67500", format: "currency" },
          "C3": { value: "0.1249", formula: "0.1249", format: "percent" },

          "A4": { value: "Software", formula: "Software" },
          "B4": { value: "240200", formula: "240200", format: "currency" },
          "C4": { value: "0.4445", formula: "0.4445", format: "percent" },

          "A5": { value: "Security", formula: "Security" },
          "B5": { value: "41200", formula: "41200", format: "currency" },
          "C5": { value: "0.0763", formula: "0.0763", format: "percent" },

          "A6": { value: "Hardware", formula: "Hardware" },
          "B6": { value: "102500", formula: "102500", format: "currency" },
          "C6": { value: "0.1897", formula: "0.1897", format: "percent" },

          "A8": { value: "Grand Total", formula: "Grand Total", style: { bold: true, bg: "#E8F0FE" } },
          "B8": { value: "=SUM(B2:B6)", formula: "=SUM(B2:B6)", format: "currency", style: { bold: true, bg: "#E8F0FE" } },
          "C8": { value: "=SUM(C2:C6)", formula: "=SUM(C2:C6)", format: "percent", style: { bold: true, bg: "#E8F0FE" } },
        }
      },

      // Sheet 3: "Notes" — plain text notes sheet
      {
        id: "sheet_3",
        name: "Notes",
        rowCount: 100,
        colCount: 26,
        frozenRows: 0,
        frozenCols: 0,
        tabColor: "#FBBC04",
        isHidden: false,
        columnWidths: { 0: 200, 1: 400 },
        rowHeights: {},
        filterRange: null,
        filterCriteria: {},
        sortColumn: null,
        sortDirection: null,
        data: {
          "A1": { value: "Topic", formula: "Topic", style: { bold: true, bg: "#FFF3CD" } },
          "B1": { value: "Details", formula: "Details", style: { bold: true, bg: "#FFF3CD" } },
          "A2": { value: "Data Source", formula: "Data Source" },
          "B2": { value: "CRM export from Q4 2024, updated Jan 5", formula: "CRM export from Q4 2024, updated Jan 5" },
          "A3": { value: "Review Date", formula: "Review Date" },
          "B3": { value: "January 15, 2025", formula: "January 15, 2025" },
          "A4": { value: "Status Criteria", formula: "Status Criteria" },
          "B4": { value: "Exceeding: >110% target. On Track: 90-110%. Behind: <90%", formula: "Exceeding: >110% target. On Track: 90-110%. Behind: <90%" },
          "A5": { value: "Next Steps", formula: "Next Steps" },
          "B5": { value: "Present to leadership team on Jan 20. Add Q1 projections.", formula: "Present to leadership team on Jan 20. Add Q1 projections." },
        }
      }
    ]
  };
}
```

---

## Default IDs Reference

| Entity | ID Pattern | Examples |
|--------|-----------|----------|
| Workbook | `workbook_1` | `"workbook_1"` |
| Sheet | `sheet_N` | `"sheet_1"`, `"sheet_2"`, `"sheet_3"` |
| Cell | `[COL][ROW]` | `"A1"`, `"B2"`, `"AA100"` |
| Chart | `chart_N` | `"chart_1"` |
| Named Range | user-defined | `"SalesTotal"` |
| Conditional Format | `cf_N` | `"cf_1"` |

---

## Seed Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Sheets | 3 | "Sales Data" (main), "Summary" (aggregates), "Notes" (text) |
| Cells with data | ~60 | Headers + 9 data rows + summary formulas across 3 sheets |
| Formulas | ~15 | SUM, AVERAGE, MAX, MIN, COUNT, multiplication |
| Styled cells | ~25 | Bold headers, colored status text, background fills |
| Number formats | ~20 | Currency, percent, number formats applied |

---

## State Fields to Track for Diffs

These are the key state fields that change during agent interaction and should be tracked by `getStateDiff()`:

| User Action | State Fields Changed |
|-------------|---------------------|
| Type in cell | `sheets[i].data[cellId].value`, `.formula`, `.computed` |
| Format cell (bold, etc.) | `sheets[i].data[cellId].style.*` |
| Change number format | `sheets[i].data[cellId].format` |
| Select cell | `selectedCell`, `selectionRange` |
| Switch sheet | `activeSheetId` |
| Add sheet | `sheets` array length, `activeSheetId` |
| Rename sheet | `sheets[i].name` |
| Delete sheet | `sheets` array length, possibly `activeSheetId` |
| Change title | `title` |
| Sort column | `sheets[i].sortColumn`, `sheets[i].sortDirection`, `sheets[i].data` order |
| Toggle filter | `sheets[i].filterRange` |
| Freeze rows | `sheets[i].frozenRows` |
| Resize column | `sheets[i].columnWidths` |
| Insert/delete row | `sheets[i].data`, `sheets[i].rowCount` |
| Insert/delete col | `sheets[i].data`, `sheets[i].colCount` |
