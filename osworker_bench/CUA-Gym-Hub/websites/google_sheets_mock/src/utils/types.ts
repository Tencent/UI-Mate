export interface BorderEdge {
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  width: number;
  color: string;
}

export interface BorderConfig {
  top?: BorderEdge | null;
  right?: BorderEdge | null;
  bottom?: BorderEdge | null;
  left?: BorderEdge | null;
}

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  color?: string;
  bg?: string;
  fontSize?: number;
  fontFamily?: string;
  textWrap?: 'overflow' | 'wrap' | 'clip';
  textRotation?: number;
  borders?: BorderConfig;
}

export type NumberFormat = 'text' | 'number' | 'currency' | 'percent' | 'date' | 'scientific' | 'time';

export interface DataValidation {
  type: 'list' | 'number' | 'text' | 'date' | 'checkbox';
  criteria: Record<string, any>;
  showWarning: boolean;
  helpText: string | null;
}

export interface CellData {
  value: string;
  formula: string;
  computed?: string | number;
  style?: CellStyle;
  format?: NumberFormat;
  note?: string | null;
  hyperlink?: string | null;
  validation?: DataValidation | null;
  mergedWith?: string | null;
  isMergeAnchor?: boolean;
  mergeSpan?: { rows: number; cols: number } | null;
}

export interface FilterCriteria {
  visibleValues: string[];
  hiddenValues: string[];
  condition: string | null;
  conditionValue: string | null;
}

export interface Sheet {
  id: string;
  name: string;
  data: Record<string, CellData>;
  rowCount: number;
  colCount: number;
  frozenRows?: number;
  frozenCols?: number;
  tabColor?: string | null;
  isHidden?: boolean;
  columnWidths?: Record<number, number>;
  rowHeights?: Record<number, number>;
  filterRange?: string | null;
  filterCriteria?: Record<string, FilterCriteria>;
  sortColumn?: string | null;
  sortDirection?: 'asc' | 'desc' | null;
}

export interface ClipboardData {
  type: 'copy' | 'cut';
  data: Record<string, CellData>;
  range: string[];
  sourceSheetId: string;
}

export interface UndoEntry {
  action: string;
  sheetId: string;
  cellChanges: Record<string, { before: CellData | null; after: CellData | null }>;
  timestamp: number;
}

export interface NamedRange {
  name: string;
  sheetId: string;
  range: string;
}

export interface Chart {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  title: string;
  dataRange: string;
  sheetId: string;
  position: { row: number; col: number };
  size: { width: number; height: number };
}

export interface ConditionConfig {
  type: 'greaterThan' | 'lessThan' | 'equalTo' | 'textContains' | 'isEmpty' | 'isNotEmpty' | 'customFormula';
  value: string | number;
}

export interface ConditionalFormatRule {
  id: string;
  range: string;
  sheetId: string;
  condition: ConditionConfig;
  format: CellStyle;
}

export interface WorkbookState {
  id: string;
  title: string;
  sheets: Sheet[];
  activeSheetId: string;
  selectedCell: string | null;
  selectionRange: string[] | null;
  clipboard: ClipboardData | null;
  isDragging: boolean;
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];
  namedRanges: NamedRange[];
  conditionalFormats: ConditionalFormatRule[];
  charts: Chart[];
  showGridlines: boolean;
  showFormulas: boolean;
  zoom: number;
}

export interface AppState {
  initial_state: WorkbookState;
  current_state: WorkbookState;
  history: WorkbookState[];
  historyIndex: number;
}
