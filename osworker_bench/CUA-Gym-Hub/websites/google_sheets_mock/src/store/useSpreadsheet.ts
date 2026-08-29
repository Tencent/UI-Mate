import { useState, useEffect, useCallback, useRef } from 'react';
import { WorkbookState, Sheet, CellData, CellStyle, NumberFormat, UndoEntry } from '../utils/types';
import { evaluateFormula } from '../utils/formulas';
import { getCellId, getNextCellId, parseCellId } from '../utils/helpers';

const BASE_STORAGE_KEY = 'spreadsheet_app_v2';
const BASE_INITIAL_KEY = 'spreadsheet_app_v2_initialState';
const MAX_UNDO = 100;

function storageKey(sid: string | null): string {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}

function initialKey(sid: string | null): string {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export const getSessionId = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid: string | null = null): Promise<Partial<WorkbookState> | null> => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const resp = await fetch(url);
    if (resp.ok) {
      const d = await resp.json();
      if (d.has_custom_state && d.stored_state) return d.stored_state;
    }
  } catch (e) {
    console.log('No custom state available, using defaults');
  }
  return null;
};

function numericKeyToExcel(key: string): string | null {
  const match = key.match(/^(\d+)-(\d+)$/);
  if (!match) return null;
  const row = parseInt(match[1]);
  const col = parseInt(match[2]);
  let colLabel = '';
  let c = col;
  while (c >= 0) {
    colLabel = String.fromCharCode(65 + (c % 26)) + colLabel;
    c = Math.floor(c / 26) - 1;
  }
  return `${colLabel}${row + 1}`;
}

function normalizeSheetData(sheet: any): Sheet {
  const normalizedData: Record<string, CellData> = {};
  if (sheet.data && typeof sheet.data === 'object') {
    for (const key of Object.keys(sheet.data)) {
      const excelKey = numericKeyToExcel(key) || key;
      const cell = sheet.data[key];
      const value = cell.value != null ? String(cell.value) : '';
      // Coerce formula to string: server-side state files may store formula
      // as a number (e.g. {value: 4, formula: 4}). Without coercion, the
      // recompute loop's `cell.formula.startsWith('=')` throws
      // "TypeError: formula.startsWith is not a function" and crashes the
      // page on every cell edit. Fallback to `value` when formula is absent.
      const formulaRaw = cell.formula != null ? cell.formula : value;
      const formula = String(formulaRaw);
      normalizedData[excelKey] = {
        value,
        formula,
        computed: cell.computed ?? (isNaN(Number(value)) ? value : Number(value)),
        ...(cell.style ? { style: cell.style } : {}),
        ...(cell.format ? { format: cell.format } : {}),
      };
    }
  }
  return {
    id: sheet.id || `sheet${Date.now()}`,
    name: sheet.name || 'Sheet1',
    data: normalizedData,
    rowCount: sheet.rowCount || 100,
    colCount: sheet.colCount || 26,
    frozenRows: sheet.frozenRows ?? 0,
    frozenCols: sheet.frozenCols ?? 0,
    tabColor: sheet.tabColor ?? null,
    isHidden: sheet.isHidden ?? false,
    columnWidths: sheet.columnWidths ?? {},
    rowHeights: sheet.rowHeights ?? {},
    filterRange: sheet.filterRange ?? null,
    filterCriteria: sheet.filterCriteria ?? {},
    sortColumn: sheet.sortColumn ?? null,
    sortDirection: sheet.sortDirection ?? null,
  };
}

function deepMergeWithDefaults<T extends Record<string, any>>(defaults: T, custom: Partial<T> | null): T {
  if (!custom) return defaults;
  const result = { ...defaults } as any;
  for (const key in custom) {
    if ((custom as any)[key] !== null && (custom as any)[key] !== undefined) {
      if (key === 'sheets' && Array.isArray((custom as any)[key])) {
        result[key] = ((custom as any)[key] as any[]).map(s => normalizeSheetData(s));
        if (result[key].length > 0) {
          result['activeSheetId'] = result[key][0].id;
        }
      } else if (
        typeof (custom as any)[key] === 'object' &&
        !Array.isArray((custom as any)[key]) &&
        typeof (defaults as any)[key] === 'object' &&
        !Array.isArray((defaults as any)[key])
      ) {
        result[key] = deepMergeWithDefaults((defaults as any)[key], (custom as any)[key]);
      } else {
        result[key] = (custom as any)[key];
      }
    }
  }
  return result;
}

function createInitialData(): WorkbookState {
  const sheet1Data: Record<string, CellData> = {
    'A1': { value: 'Product', formula: 'Product', computed: 'Product', style: { bold: true, bg: '#F3F3F3', align: 'center' } },
    'B1': { value: 'Category', formula: 'Category', computed: 'Category', style: { bold: true, bg: '#F3F3F3', align: 'center' } },
    'C1': { value: 'Q4 Sales', formula: 'Q4 Sales', computed: 'Q4 Sales', style: { bold: true, bg: '#F3F3F3', align: 'center' } },
    'D1': { value: 'Units Sold', formula: 'Units Sold', computed: 'Units Sold', style: { bold: true, bg: '#F3F3F3', align: 'center' } },
    'E1': { value: 'Revenue', formula: 'Revenue', computed: 'Revenue', style: { bold: true, bg: '#F3F3F3', align: 'center' } },
    'F1': { value: 'Status', formula: 'Status', computed: 'Status', style: { bold: true, bg: '#F3F3F3', align: 'center' } },

    'A2': { value: 'Widget Pro', formula: 'Widget Pro', computed: 'Widget Pro' },
    'B2': { value: 'Electronics', formula: 'Electronics', computed: 'Electronics' },
    'C2': { value: '45200', formula: '45200', computed: 45200, format: 'currency' },
    'D2': { value: '1250', formula: '1250', computed: 1250, format: 'number' },
    'E2': { value: '=C2*1.15', formula: '=C2*1.15', computed: 51980, format: 'currency' },
    'F2': { value: 'On Track', formula: 'On Track', computed: 'On Track', style: { color: '#0F9D58' } },

    'A3': { value: 'Gadget X', formula: 'Gadget X', computed: 'Gadget X' },
    'B3': { value: 'Electronics', formula: 'Electronics', computed: 'Electronics' },
    'C3': { value: '32800', formula: '32800', computed: 32800, format: 'currency' },
    'D3': { value: '890', formula: '890', computed: 890, format: 'number' },
    'E3': { value: '=C3*1.15', formula: '=C3*1.15', computed: 37720, format: 'currency' },
    'F3': { value: 'On Track', formula: 'On Track', computed: 'On Track', style: { color: '#0F9D58' } },

    'A4': { value: 'SuperChip 3000', formula: 'SuperChip 3000', computed: 'SuperChip 3000' },
    'B4': { value: 'Components', formula: 'Components', computed: 'Components' },
    'C4': { value: '67500', formula: '67500', computed: 67500, format: 'currency' },
    'D4': { value: '2100', formula: '2100', computed: 2100, format: 'number' },
    'E4': { value: '=C4*1.15', formula: '=C4*1.15', computed: 77625, format: 'currency' },
    'F4': { value: 'Exceeding', formula: 'Exceeding', computed: 'Exceeding', style: { color: '#1A73E8', bold: true } },

    'A5': { value: 'DataSync Hub', formula: 'DataSync Hub', computed: 'DataSync Hub' },
    'B5': { value: 'Software', formula: 'Software', computed: 'Software' },
    'C5': { value: '89100', formula: '89100', computed: 89100, format: 'currency' },
    'D5': { value: '3400', formula: '3400', computed: 3400, format: 'number' },
    'E5': { value: '=C5*1.15', formula: '=C5*1.15', computed: 102465, format: 'currency' },
    'F5': { value: 'Exceeding', formula: 'Exceeding', computed: 'Exceeding', style: { color: '#1A73E8', bold: true } },

    'A6': { value: 'CloudBase Pro', formula: 'CloudBase Pro', computed: 'CloudBase Pro' },
    'B6': { value: 'Software', formula: 'Software', computed: 'Software' },
    'C6': { value: '54300', formula: '54300', computed: 54300, format: 'currency' },
    'D6': { value: '1800', formula: '1800', computed: 1800, format: 'number' },
    'E6': { value: '=C6*1.15', formula: '=C6*1.15', computed: 62445, format: 'currency' },
    'F6': { value: 'On Track', formula: 'On Track', computed: 'On Track', style: { color: '#0F9D58' } },

    'A7': { value: 'NetGuard Firewall', formula: 'NetGuard Firewall', computed: 'NetGuard Firewall' },
    'B7': { value: 'Security', formula: 'Security', computed: 'Security' },
    'C7': { value: '41200', formula: '41200', computed: 41200, format: 'currency' },
    'D7': { value: '620', formula: '620', computed: 620, format: 'number' },
    'E7': { value: '=C7*1.15', formula: '=C7*1.15', computed: 47380, format: 'currency' },
    'F7': { value: 'Behind', formula: 'Behind', computed: 'Behind', style: { color: '#EA4335' } },

    'A8': { value: 'PrintMaster 500', formula: 'PrintMaster 500', computed: 'PrintMaster 500' },
    'B8': { value: 'Hardware', formula: 'Hardware', computed: 'Hardware' },
    'C8': { value: '28900', formula: '28900', computed: 28900, format: 'currency' },
    'D8': { value: '450', formula: '450', computed: 450, format: 'number' },
    'E8': { value: '=C8*1.15', formula: '=C8*1.15', computed: 33235, format: 'currency' },
    'F8': { value: 'Behind', formula: 'Behind', computed: 'Behind', style: { color: '#EA4335' } },

    'A9': { value: 'SmartDisplay 4K', formula: 'SmartDisplay 4K', computed: 'SmartDisplay 4K' },
    'B9': { value: 'Hardware', formula: 'Hardware', computed: 'Hardware' },
    'C9': { value: '73600', formula: '73600', computed: 73600, format: 'currency' },
    'D9': { value: '920', formula: '920', computed: 920, format: 'number' },
    'E9': { value: '=C9*1.15', formula: '=C9*1.15', computed: 84640, format: 'currency' },
    'F9': { value: 'On Track', formula: 'On Track', computed: 'On Track', style: { color: '#0F9D58' } },

    'A10': { value: 'AI Assistant Kit', formula: 'AI Assistant Kit', computed: 'AI Assistant Kit' },
    'B10': { value: 'Software', formula: 'Software', computed: 'Software' },
    'C10': { value: '96800', formula: '96800', computed: 96800, format: 'currency' },
    'D10': { value: '4200', formula: '4200', computed: 4200, format: 'number' },
    'E10': { value: '=C10*1.15', formula: '=C10*1.15', computed: 111320, format: 'currency' },
    'F10': { value: 'Exceeding', formula: 'Exceeding', computed: 'Exceeding', style: { color: '#1A73E8', bold: true } },

    'A12': { value: 'TOTALS', formula: 'TOTALS', computed: 'TOTALS', style: { bold: true, bg: '#E8F0FE' } },
    'B12': { value: '', formula: '', computed: '', style: { bg: '#E8F0FE' } },
    'C12': { value: '=SUM(C2:C10)', formula: '=SUM(C2:C10)', computed: 529400, format: 'currency', style: { bold: true, bg: '#E8F0FE' } },
    'D12': { value: '=SUM(D2:D10)', formula: '=SUM(D2:D10)', computed: 15630, format: 'number', style: { bold: true, bg: '#E8F0FE' } },
    'E12': { value: '=SUM(E2:E10)', formula: '=SUM(E2:E10)', computed: 608810, format: 'currency', style: { bold: true, bg: '#E8F0FE' } },
    'F12': { value: '', formula: '', computed: '', style: { bg: '#E8F0FE' } },

    'A13': { value: 'AVERAGE', formula: 'AVERAGE', computed: 'AVERAGE', style: { bold: true } },
    'C13': { value: '=AVERAGE(C2:C10)', formula: '=AVERAGE(C2:C10)', computed: 58822.22, format: 'currency', style: { bold: true } },
    'D13': { value: '=AVERAGE(D2:D10)', formula: '=AVERAGE(D2:D10)', computed: 1736.67, format: 'number', style: { bold: true } },

    'A14': { value: 'MAX', formula: 'MAX', computed: 'MAX', style: { bold: true } },
    'C14': { value: '=MAX(C2:C10)', formula: '=MAX(C2:C10)', computed: 96800, format: 'currency', style: { bold: true } },

    'A15': { value: 'MIN', formula: 'MIN', computed: 'MIN', style: { bold: true } },
    'C15': { value: '=MIN(C2:C10)', formula: '=MIN(C2:C10)', computed: 28900, format: 'currency', style: { bold: true } },

    'A16': { value: 'COUNT', formula: 'COUNT', computed: 'COUNT', style: { bold: true } },
    'C16': { value: '=COUNT(C2:C10)', formula: '=COUNT(C2:C10)', computed: 9, format: 'number', style: { bold: true } },
  };

  const sheet2Data: Record<string, CellData> = {
    'A1': { value: 'Category', formula: 'Category', computed: 'Category', style: { bold: true, bg: '#E8F0FE', align: 'center' } },
    'B1': { value: 'Total Revenue', formula: 'Total Revenue', computed: 'Total Revenue', style: { bold: true, bg: '#E8F0FE', align: 'center' } },
    'C1': { value: '% of Total', formula: '% of Total', computed: '% of Total', style: { bold: true, bg: '#E8F0FE', align: 'center' } },

    'A2': { value: 'Electronics', formula: 'Electronics', computed: 'Electronics' },
    'B2': { value: '78000', formula: '78000', computed: 78000, format: 'currency' },
    'C2': { value: '0.1443', formula: '0.1443', computed: 0.1443, format: 'percent' },

    'A3': { value: 'Components', formula: 'Components', computed: 'Components' },
    'B3': { value: '67500', formula: '67500', computed: 67500, format: 'currency' },
    'C3': { value: '0.1249', formula: '0.1249', computed: 0.1249, format: 'percent' },

    'A4': { value: 'Software', formula: 'Software', computed: 'Software' },
    'B4': { value: '240200', formula: '240200', computed: 240200, format: 'currency' },
    'C4': { value: '0.4445', formula: '0.4445', computed: 0.4445, format: 'percent' },

    'A5': { value: 'Security', formula: 'Security', computed: 'Security' },
    'B5': { value: '41200', formula: '41200', computed: 41200, format: 'currency' },
    'C5': { value: '0.0763', formula: '0.0763', computed: 0.0763, format: 'percent' },

    'A6': { value: 'Hardware', formula: 'Hardware', computed: 'Hardware' },
    'B6': { value: '102500', formula: '102500', computed: 102500, format: 'currency' },
    'C6': { value: '0.1897', formula: '0.1897', computed: 0.1897, format: 'percent' },

    'A8': { value: 'Grand Total', formula: 'Grand Total', computed: 'Grand Total', style: { bold: true, bg: '#E8F0FE' } },
    'B8': { value: '=SUM(B2:B6)', formula: '=SUM(B2:B6)', computed: 529400, format: 'currency', style: { bold: true, bg: '#E8F0FE' } },
    'C8': { value: '=SUM(C2:C6)', formula: '=SUM(C2:C6)', computed: 0.9797, format: 'percent', style: { bold: true, bg: '#E8F0FE' } },
  };

  const sheet3Data: Record<string, CellData> = {
    'A1': { value: 'Topic', formula: 'Topic', computed: 'Topic', style: { bold: true, bg: '#FFF3CD' } },
    'B1': { value: 'Details', formula: 'Details', computed: 'Details', style: { bold: true, bg: '#FFF3CD' } },
    'A2': { value: 'Data Source', formula: 'Data Source', computed: 'Data Source' },
    'B2': { value: 'CRM export from Q4 2024, updated Jan 5', formula: 'CRM export from Q4 2024, updated Jan 5', computed: 'CRM export from Q4 2024, updated Jan 5' },
    'A3': { value: 'Review Date', formula: 'Review Date', computed: 'Review Date' },
    'B3': { value: 'January 15, 2025', formula: 'January 15, 2025', computed: 'January 15, 2025' },
    'A4': { value: 'Status Criteria', formula: 'Status Criteria', computed: 'Status Criteria' },
    'B4': { value: 'Exceeding: >110% target. On Track: 90-110%. Behind: <90%', formula: 'Exceeding: >110% target. On Track: 90-110%. Behind: <90%', computed: 'Exceeding: >110% target. On Track: 90-110%. Behind: <90%' },
    'A5': { value: 'Next Steps', formula: 'Next Steps', computed: 'Next Steps' },
    'B5': { value: 'Present to leadership team on Jan 20. Add Q1 projections.', formula: 'Present to leadership team on Jan 20. Add Q1 projections.', computed: 'Present to leadership team on Jan 20. Add Q1 projections.' },
  };

  return {
    id: 'workbook_1',
    title: 'Q4 2024 Sales Report',
    activeSheetId: 'sheet_1',
    selectedCell: 'A1',
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
    zoom: 100,
    sheets: [
      {
        id: 'sheet_1',
        name: 'Sales Data',
        rowCount: 100,
        colCount: 26,
        frozenRows: 1,
        frozenCols: 0,
        tabColor: null,
        isHidden: false,
        columnWidths: { 0: 140, 1: 120, 2: 100, 3: 100, 4: 120, 5: 100 },
        rowHeights: {},
        filterRange: null,
        filterCriteria: {},
        sortColumn: null,
        sortDirection: null,
        data: sheet1Data,
      },
      {
        id: 'sheet_2',
        name: 'Summary',
        rowCount: 100,
        colCount: 26,
        frozenRows: 0,
        frozenCols: 0,
        tabColor: '#1A73E8',
        isHidden: false,
        columnWidths: { 0: 140, 1: 120, 2: 120 },
        rowHeights: {},
        filterRange: null,
        filterCriteria: {},
        sortColumn: null,
        sortDirection: null,
        data: sheet2Data,
      },
      {
        id: 'sheet_3',
        name: 'Notes',
        rowCount: 100,
        colCount: 26,
        frozenRows: 0,
        frozenCols: 0,
        tabColor: '#FBBC04',
        isHidden: false,
        columnWidths: { 0: 200, 1: 400 },
        rowHeights: {},
        filterRange: null,
        filterCriteria: {},
        sortColumn: null,
        sortDirection: null,
        data: sheet3Data,
      },
    ],
  };
}

let _syncTimer: ReturnType<typeof setTimeout> | null = null;

const saveState = (state: WorkbookState, sid: string | null = null, initialState: WorkbookState | null = null): void => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state, initial_state: initialState }),
    }).catch(() => {});
  }, 300);
};

const getStoredInitialState = (sid: string | null = null): WorkbookState | null => {
  const s = localStorage.getItem(initialKey(sid));
  return s ? JSON.parse(s) : null;
};

const initializeLocalData = (sid: string | null = null, customState: Partial<WorkbookState> | null = null): WorkbookState => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const data = { ...createInitialData(), ...customState };
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const data = createInitialData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

function recomputeSheet(sheet: Sheet): Sheet {
  const newData = { ...sheet.data };
  Object.keys(newData).forEach(key => {
    const cell = newData[key];
    if (cell.formula && typeof cell.formula === 'string' && cell.formula.startsWith('=')) {
      const tempSheet = { ...sheet, data: newData };
      newData[key] = { ...cell, computed: evaluateFormula(cell.formula, tempSheet) };
    }
  });
  return { ...sheet, data: newData };
}

function createBlankWorkbookData(): WorkbookState {
  const newId = `sheet_${Date.now()}`;
  return {
    id: `workbook_${Date.now()}`,
    title: 'Untitled spreadsheet',
    activeSheetId: newId,
    selectedCell: 'A1',
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
    zoom: 100,
    sheets: [{
      id: newId,
      name: 'Sheet1',
      data: {},
      rowCount: 100,
      colCount: 26,
      frozenRows: 0,
      frozenCols: 0,
      tabColor: null,
      isHidden: false,
      columnWidths: {},
      rowHeights: {},
      filterRange: null,
      filterCriteria: {},
      sortColumn: null,
      sortDirection: null,
    }],
  };
}

export const useSpreadsheet = () => {
  const sidRef = useRef<string | null>(getSessionId());
  const initDone = useRef(false);

  const [state, setState] = useState<WorkbookState>(() => {
    const sid = sidRef.current;
    const saved = localStorage.getItem(storageKey(sid));
    return saved ? JSON.parse(saved) : createInitialData();
  });

  const [initialStateRecord, setInitialStateRecord] = useState<WorkbookState>(() => {
    const sid = sidRef.current;
    const stored = getStoredInitialState(sid);
    return stored || JSON.parse(JSON.stringify(createInitialData()));
  });

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;
    if (new URLSearchParams(window.location.search).get('new') === '1') {
      const blank = createBlankWorkbookData();
      setState(blank);
      setInitialStateRecord(JSON.parse(JSON.stringify(blank)));
      localStorage.setItem(storageKey(sid), JSON.stringify(blank));
      localStorage.setItem(initialKey(sid), JSON.stringify(blank));
      return;
    }
    fetchCustomState(sid).then((customState) => {
      if (customState) {
        const data = initializeLocalData(sid, customState);
        setState(data);
        setInitialStateRecord(JSON.parse(JSON.stringify(data)));
      } else {
        const data = initializeLocalData(sid, null);
        setState(data);
        const storedInitial = getStoredInitialState(sid);
        if (storedInitial) {
          setInitialStateRecord(storedInitial);
        }
      }
    });
  }, []);

  useEffect(() => {
    const sid = sidRef.current;
    saveState(state, sid, initialStateRecord);
  }, [state, initialStateRecord]);

  const getActiveSheet = useCallback(() => {
    return state.sheets.find(s => s.id === state.activeSheetId) || state.sheets[0];
  }, [state.sheets, state.activeSheetId]);

  const pushUndo = (action: string, sheetId: string, cellChanges: UndoEntry['cellChanges']) => {
    const entry: UndoEntry = { action, sheetId, cellChanges, timestamp: Date.now() };
    setState(prev => ({
      ...prev,
      undoStack: [...prev.undoStack.slice(-MAX_UNDO + 1), entry],
      redoStack: [],
    }));
  };

  const updateCell = useCallback((cellId: string, updates: Partial<CellData>) => {
    setState(prev => {
      const activeSheet = prev.sheets.find(s => s.id === prev.activeSheetId)!;
      const before = activeSheet.data[cellId] || null;

      const newSheets = prev.sheets.map(sheet => {
        if (sheet.id !== prev.activeSheetId) return sheet;

        const newData = { ...sheet.data };
        const existing = newData[cellId] || { value: '', formula: '' };

        const updatedCell = { ...existing, ...updates };

        if (updates.formula !== undefined) {
          updatedCell.value = updates.formula;
          updatedCell.computed = evaluateFormula(updates.formula, sheet);
        } else if (updates.value !== undefined && !updates.formula) {
          updatedCell.formula = updates.value;
          updatedCell.computed = isNaN(Number(updates.value)) ? updates.value : (updates.value === '' ? '' : Number(updates.value));
        }

        newData[cellId] = updatedCell;

        Object.keys(newData).forEach(key => {
          const cell = newData[key];
          if (cell.formula && typeof cell.formula === 'string' && cell.formula.startsWith('=')) {
            const tempSheet = { ...sheet, data: newData };
            newData[key] = { ...cell, computed: evaluateFormula(cell.formula, tempSheet) };
          }
        });

        return { ...sheet, data: newData };
      });

      const after = newSheets.find(s => s.id === prev.activeSheetId)?.data[cellId] || null;
      const entry: UndoEntry = {
        action: `Edit cell ${cellId}`,
        sheetId: prev.activeSheetId,
        cellChanges: { [cellId]: { before, after } },
        timestamp: Date.now(),
      };

      return {
        ...prev,
        sheets: newSheets,
        undoStack: [...prev.undoStack.slice(-MAX_UNDO + 1), entry],
        redoStack: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.undoStack.length === 0) return prev;
      const stack = [...prev.undoStack];
      const entry = stack.pop()!;

      const newSheets = prev.sheets.map(sheet => {
        if (sheet.id !== entry.sheetId) return sheet;
        const newData = { ...sheet.data };
        for (const cellId of Object.keys(entry.cellChanges)) {
          const { before } = entry.cellChanges[cellId];
          if (before === null) {
            delete newData[cellId];
          } else {
            newData[cellId] = before;
          }
        }
        return recomputeSheet({ ...sheet, data: newData });
      });

      return {
        ...prev,
        sheets: newSheets,
        undoStack: stack,
        redoStack: [...prev.redoStack, entry],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.redoStack.length === 0) return prev;
      const stack = [...prev.redoStack];
      const entry = stack.pop()!;

      const newSheets = prev.sheets.map(sheet => {
        if (sheet.id !== entry.sheetId) return sheet;
        const newData = { ...sheet.data };
        for (const cellId of Object.keys(entry.cellChanges)) {
          const { after } = entry.cellChanges[cellId];
          if (after === null) {
            delete newData[cellId];
          } else {
            newData[cellId] = after;
          }
        }
        return recomputeSheet({ ...sheet, data: newData });
      });

      return {
        ...prev,
        sheets: newSheets,
        undoStack: [...prev.undoStack, entry],
        redoStack: stack,
      };
    });
  }, []);

  const setSelection = useCallback((cellId: string, range: string[] | null) => {
    setState(prev => ({ ...prev, selectedCell: cellId, selectionRange: range }));
  }, []);

  const setDragging = useCallback((isDragging: boolean) => {
    setState(prev => ({ ...prev, isDragging }));
  }, []);

  const moveSelection = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setState(prev => {
      if (!prev.selectedCell) return prev;
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId) || prev.sheets[0];
      const newId = getNextCellId(prev.selectedCell, direction, sheet.rowCount, sheet.colCount);
      return { ...prev, selectedCell: newId, selectionRange: null };
    });
  }, []);

  const addSheet = useCallback(() => {
    const newId = `sheet_${Date.now()}`;
    setState(prev => ({
      ...prev,
      sheets: [...prev.sheets, {
        id: newId,
        name: `Sheet${prev.sheets.length + 1}`,
        data: {},
        rowCount: 100,
        colCount: 26,
        frozenRows: 0,
        frozenCols: 0,
        tabColor: null,
        isHidden: false,
        columnWidths: {},
        rowHeights: {},
        filterRange: null,
        filterCriteria: {},
        sortColumn: null,
        sortDirection: null,
      }],
      activeSheetId: newId,
    }));
  }, []);

  const addImportedSheet = useCallback((name: string, rows: string[][]) => {
    const newId = `sheet_${Date.now()}`;
    const data: Record<string, CellData> = {};
    rows.forEach((rowValues, rowIndex) => {
      rowValues.forEach((rawValue, colIndex) => {
        const value = rawValue.trim();
        if (!value) return;
        const numeric = Number(value.replace(/[$,]/g, ''));
        data[getCellId(colIndex, rowIndex)] = {
          value,
          formula: value,
          computed: Number.isFinite(numeric) && value.match(/^-?[$,\d.]+%?$/) ? numeric : value,
          ...(rowIndex === 0 ? { style: { bold: true, bg: '#F3F3F3', align: 'center' } } : {}),
        };
      });
    });

    setState(prev => ({
      ...prev,
      sheets: [...prev.sheets, {
        id: newId,
        name: name.replace(/\.[^.]+$/, '').slice(0, 80) || `Imported ${prev.sheets.length + 1}`,
        data,
        rowCount: Math.max(100, rows.length || 1),
        colCount: Math.max(26, ...rows.map(row => row.length), 1),
        frozenRows: rows.length > 0 ? 1 : 0,
        frozenCols: 0,
        tabColor: '#0F9D58',
        isHidden: false,
        columnWidths: {},
        rowHeights: {},
        filterRange: null,
        filterCriteria: {},
        sortColumn: null,
        sortDirection: null,
      }],
      activeSheetId: newId,
      selectedCell: 'A1',
      selectionRange: null,
    }));
  }, []);

  const createBlankWorkbook = useCallback(() => {
    const blank = createBlankWorkbookData();
    setState(blank);
  }, []);

  const addNamedRange = useCallback((name: string, range: string) => {
    setState(prev => ({
      ...prev,
      namedRanges: [
        ...prev.namedRanges.filter(item => item.name !== name),
        { name, range, sheetId: prev.activeSheetId },
      ],
    }));
  }, []);

  const addChart = useCallback((type: 'bar' | 'line' | 'pie' | 'scatter' | 'area', title: string, dataRange: string) => {
    setState(prev => ({
      ...prev,
      charts: [
        ...prev.charts,
        {
          id: `chart_${Date.now()}`,
          type,
          title,
          dataRange,
          sheetId: prev.activeSheetId,
          position: { row: 1, col: 5 },
          size: { width: 600, height: 360 },
        },
      ],
    }));
  }, []);

  const updateTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, title }));
  }, []);

  const switchSheet = useCallback((id: string) => {
    setState(prev => ({ ...prev, activeSheetId: id, selectedCell: 'A1', selectionRange: null }));
  }, []);

  const renameSheet = useCallback((id: string, name: string) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => s.id === id ? { ...s, name } : s),
    }));
  }, []);

  const deleteSheet = useCallback((id: string) => {
    setState(prev => {
      if (prev.sheets.length <= 1) return prev;
      const idx = prev.sheets.findIndex(s => s.id === id);
      const newSheets = prev.sheets.filter(s => s.id !== id);
      const newActive = prev.activeSheetId === id
        ? (newSheets[Math.max(0, idx - 1)]?.id || newSheets[0].id)
        : prev.activeSheetId;
      return { ...prev, sheets: newSheets, activeSheetId: newActive };
    });
  }, []);

  const duplicateSheet = useCallback((id: string) => {
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === id);
      if (!sheet) return prev;
      const newId = `sheet_${Date.now()}`;
      const newSheet = { ...sheet, id: newId, name: `Copy of ${sheet.name}` };
      const idx = prev.sheets.findIndex(s => s.id === id);
      const newSheets = [...prev.sheets.slice(0, idx + 1), newSheet, ...prev.sheets.slice(idx + 1)];
      return { ...prev, sheets: newSheets, activeSheetId: newId };
    });
  }, []);

  const setSheetTabColor = useCallback((id: string, color: string | null) => {
    setState(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => s.id === id ? { ...s, tabColor: color } : s),
    }));
  }, []);

  const updateFormat = useCallback((style: Partial<CellStyle>, format?: NumberFormat) => {
    setState(prev => {
      if (!prev.selectedCell) return prev;
      const targetCells = prev.selectionRange
        ? (() => {
            const start = parseCellId(prev.selectionRange[0]);
            const end = parseCellId(prev.selectionRange[prev.selectionRange.length - 1]);
            const cells: string[] = [];
            const minCol = Math.min(start.col, end.col);
            const maxCol = Math.max(start.col, end.col);
            const minRow = Math.min(start.row, end.row);
            const maxRow = Math.max(start.row, end.row);
            for (let r = minRow; r <= maxRow; r++) {
              for (let c = minCol; c <= maxCol; c++) {
                cells.push(getCellId(c, r));
              }
            }
            return cells;
          })()
        : [prev.selectedCell];

      const newSheets = prev.sheets.map(sheet => {
        if (sheet.id !== prev.activeSheetId) return sheet;
        const newData = { ...sheet.data };
        const cellChanges: UndoEntry['cellChanges'] = {};

        targetCells.forEach(cellId => {
          const existing = newData[cellId] || { value: '', formula: '' };
          cellChanges[cellId] = { before: existing, after: null };
          newData[cellId] = {
            ...existing,
            style: { ...existing.style, ...style },
            ...(format !== undefined ? { format } : {}),
          };
          cellChanges[cellId].after = newData[cellId];
        });

        return { ...sheet, data: newData };
      });

      const entry: UndoEntry = {
        action: 'Format cells',
        sheetId: prev.activeSheetId,
        cellChanges: (() => {
          const changes: UndoEntry['cellChanges'] = {};
          targetCells.forEach(cellId => {
            const sheet = prev.sheets.find(s => s.id === prev.activeSheetId)!;
            changes[cellId] = {
              before: sheet.data[cellId] || null,
              after: newSheets.find(s => s.id === prev.activeSheetId)?.data[cellId] || null,
            };
          });
          return changes;
        })(),
        timestamp: Date.now(),
      };

      return {
        ...prev,
        sheets: newSheets,
        undoStack: [...prev.undoStack.slice(-MAX_UNDO + 1), entry],
        redoStack: [],
      };
    });
  }, []);

  const setCellFormat = useCallback((cellIds: string[], format: NumberFormat) => {
    setState(prev => {
      const newSheets = prev.sheets.map(sheet => {
        if (sheet.id !== prev.activeSheetId) return sheet;
        const newData = { ...sheet.data };
        cellIds.forEach(cellId => {
          const existing = newData[cellId] || { value: '', formula: '' };
          newData[cellId] = { ...existing, format };
        });
        return { ...sheet, data: newData };
      });
      return { ...prev, sheets: newSheets };
    });
  }, []);

  const insertRow = useCallback((rowIndex: number, above: boolean) => {
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;

      const insertAt = above ? rowIndex : rowIndex + 1;
      const newData: Record<string, CellData> = {};

      Object.keys(sheet.data).forEach(key => {
        const { col, row } = parseCellId(key);
        if (row >= insertAt) {
          newData[getCellId(col, row + 1)] = sheet.data[key];
        } else {
          newData[key] = sheet.data[key];
        }
      });

      const newSheets = prev.sheets.map(s =>
        s.id === prev.activeSheetId
          ? { ...s, data: newData, rowCount: s.rowCount + 1 }
          : s
      );

      const entry: UndoEntry = {
        action: `Insert row ${above ? 'above' : 'below'} row ${rowIndex + 1}`,
        sheetId: prev.activeSheetId,
        cellChanges: {},
        timestamp: Date.now(),
      };

      return { ...prev, sheets: newSheets, undoStack: [...prev.undoStack.slice(-MAX_UNDO + 1), entry], redoStack: [] };
    });
  }, []);

  const deleteRow = useCallback((rowIndex: number) => {
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;

      const cellChanges: UndoEntry['cellChanges'] = {};
      // Record all cells that will be deleted (shifted)
      Object.keys(sheet.data).forEach(key => {
        const { row } = parseCellId(key);
        if (row === rowIndex) {
          cellChanges[key] = { before: sheet.data[key], after: null };
        }
      });

      const newData: Record<string, CellData> = {};
      Object.keys(sheet.data).forEach(key => {
        const { col, row } = parseCellId(key);
        if (row < rowIndex) {
          newData[key] = sheet.data[key];
        } else if (row > rowIndex) {
          newData[getCellId(col, row - 1)] = sheet.data[key];
        }
      });

      const newSheets = prev.sheets.map(s =>
        s.id === prev.activeSheetId
          ? { ...s, data: newData, rowCount: Math.max(1, s.rowCount - 1) }
          : s
      );

      const entry: UndoEntry = {
        action: `Delete row ${rowIndex + 1}`,
        sheetId: prev.activeSheetId,
        cellChanges,
        timestamp: Date.now(),
      };

      return { ...prev, sheets: newSheets, undoStack: [...prev.undoStack.slice(-MAX_UNDO + 1), entry], redoStack: [] };
    });
  }, []);

  const insertCol = useCallback((colIndex: number, left: boolean) => {
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;

      const insertAt = left ? colIndex : colIndex + 1;
      const newData: Record<string, CellData> = {};

      Object.keys(sheet.data).forEach(key => {
        const { col, row } = parseCellId(key);
        if (col >= insertAt) {
          newData[getCellId(col + 1, row)] = sheet.data[key];
        } else {
          newData[key] = sheet.data[key];
        }
      });

      const newSheets = prev.sheets.map(s =>
        s.id === prev.activeSheetId
          ? { ...s, data: newData, colCount: s.colCount + 1 }
          : s
      );

      const entry: UndoEntry = {
        action: `Insert column ${left ? 'left of' : 'right of'} column ${colIndex}`,
        sheetId: prev.activeSheetId,
        cellChanges: {},
        timestamp: Date.now(),
      };

      return { ...prev, sheets: newSheets, undoStack: [...prev.undoStack.slice(-MAX_UNDO + 1), entry], redoStack: [] };
    });
  }, []);

  const deleteCol = useCallback((colIndex: number) => {
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;

      const cellChanges: UndoEntry['cellChanges'] = {};
      Object.keys(sheet.data).forEach(key => {
        const { col } = parseCellId(key);
        if (col === colIndex) {
          cellChanges[key] = { before: sheet.data[key], after: null };
        }
      });

      const newData: Record<string, CellData> = {};
      Object.keys(sheet.data).forEach(key => {
        const { col, row } = parseCellId(key);
        if (col < colIndex) {
          newData[key] = sheet.data[key];
        } else if (col > colIndex) {
          newData[getCellId(col - 1, row)] = sheet.data[key];
        }
      });

      const newSheets = prev.sheets.map(s =>
        s.id === prev.activeSheetId
          ? { ...s, data: newData, colCount: Math.max(1, s.colCount - 1) }
          : s
      );

      const entry: UndoEntry = {
        action: `Delete column ${colIndex}`,
        sheetId: prev.activeSheetId,
        cellChanges,
        timestamp: Date.now(),
      };

      return { ...prev, sheets: newSheets, undoStack: [...prev.undoStack.slice(-MAX_UNDO + 1), entry], redoStack: [] };
    });
  }, []);

  const sortSheet = useCallback((colLetter: string, direction: 'asc' | 'desc') => {
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;

      const colIndex = colLetter.toUpperCase().charCodeAt(0) - 65;
      const frozenRows = sheet.frozenRows || 0;

      // Collect data rows (exclude frozen header rows)
      const rowObjects: Array<{ row: number; cells: Record<string, CellData> }> = [];
      for (let r = frozenRows; r < sheet.rowCount; r++) {
        const cells: Record<string, CellData> = {};
        for (let c = 0; c < sheet.colCount; c++) {
          const id = getCellId(c, r);
          if (sheet.data[id]) cells[id] = sheet.data[id];
        }
        if (Object.keys(cells).length > 0) rowObjects.push({ row: r, cells });
      }

      rowObjects.sort((a, b) => {
        const aKey = getCellId(colIndex, a.row);
        const bKey = getCellId(colIndex, b.row);
        const aVal = a.cells[aKey]?.computed ?? a.cells[aKey]?.value ?? '';
        const bVal = b.cells[bKey]?.computed ?? b.cells[bKey]?.value ?? '';
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        let cmp: number;
        if (!isNaN(aNum) && !isNaN(bNum)) {
          cmp = aNum - bNum;
        } else {
          cmp = String(aVal).localeCompare(String(bVal));
        }
        return direction === 'asc' ? cmp : -cmp;
      });

      // Rebuild data
      const newData: Record<string, CellData> = {};
      // Keep frozen rows
      for (let r = 0; r < frozenRows; r++) {
        for (let c = 0; c < sheet.colCount; c++) {
          const id = getCellId(c, r);
          if (sheet.data[id]) newData[id] = sheet.data[id];
        }
      }
      // Place sorted rows
      rowObjects.forEach((rowObj, newRowOffset) => {
        const newRow = frozenRows + newRowOffset;
        Object.keys(rowObj.cells).forEach(oldKey => {
          const { col } = parseCellId(oldKey);
          newData[getCellId(col, newRow)] = rowObj.cells[oldKey];
        });
      });

      const newSheets = prev.sheets.map(s =>
        s.id === prev.activeSheetId
          ? { ...s, data: newData, sortColumn: colLetter, sortDirection: direction }
          : s
      );
      return { ...prev, sheets: newSheets };
    });
  }, []);

  const setFilter = useCallback((filterRange: string | null) => {
    setState(prev => {
      const newSheets = prev.sheets.map(s =>
        s.id === prev.activeSheetId
          ? { ...s, filterRange }
          : s
      );
      return { ...prev, sheets: newSheets };
    });
  }, []);

  const setFilterCriteria = useCallback((colIndex: number, hiddenValues: string[]) => {
    setState(prev => {
      const newSheets = prev.sheets.map(s => {
        if (s.id !== prev.activeSheetId) return s;
        const newCriteria = { ...s.filterCriteria, [colIndex]: hiddenValues };
        return { ...s, filterCriteria: newCriteria };
      });
      return { ...prev, sheets: newSheets };
    });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom }));
  }, []);

  const toggleGridlines = useCallback(() => {
    setState(prev => ({ ...prev, showGridlines: !prev.showGridlines }));
  }, []);

  const setFreeze = useCallback((frozenRows: number, frozenCols: number) => {
    setState(prev => {
      const newSheets = prev.sheets.map(s =>
        s.id === prev.activeSheetId
          ? { ...s, frozenRows, frozenCols }
          : s
      );
      return { ...prev, sheets: newSheets };
    });
  }, []);

  const copyToClipboard = useCallback((type: 'copy' | 'cut') => {
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;

      let cellIds: string[] = [];
      if (prev.selectionRange && prev.selectionRange.length >= 2) {
        const start = parseCellId(prev.selectionRange[0]);
        const end = parseCellId(prev.selectionRange[prev.selectionRange.length - 1]);
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            cellIds.push(getCellId(c, r));
          }
        }
      } else if (prev.selectedCell) {
        cellIds = [prev.selectedCell];
      }

      if (cellIds.length === 0) return prev;

      const data: Record<string, CellData> = {};
      cellIds.forEach(id => {
        if (sheet.data[id]) data[id] = { ...sheet.data[id] };
      });

      const range = prev.selectionRange && prev.selectionRange.length >= 2
        ? [prev.selectionRange[0], prev.selectionRange[prev.selectionRange.length - 1]]
        : (prev.selectedCell ? [prev.selectedCell, prev.selectedCell] : []);

      return {
        ...prev,
        clipboard: {
          type,
          data,
          range,
          sourceSheetId: prev.activeSheetId,
        },
      };
    });
  }, []);

  const pasteFromClipboard = useCallback((pasteType: 'all' | 'values' | 'format' = 'all') => {
    setState(prev => {
      if (!prev.clipboard || !prev.selectedCell) return prev;

      const clipboard = prev.clipboard;
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;

      // Determine source range bounds
      const sourceStart = parseCellId(clipboard.range[0]);
      const sourceEnd = parseCellId(clipboard.range[clipboard.range.length - 1]);
      const srcMinRow = Math.min(sourceStart.row, sourceEnd.row);
      const srcMinCol = Math.min(sourceStart.col, sourceEnd.col);

      // Determine paste target anchor
      const targetAnchor = parseCellId(prev.selectedCell);

      const cellChanges: UndoEntry['cellChanges'] = {};
      const newData = { ...sheet.data };

      Object.keys(clipboard.data).forEach(srcId => {
        const srcPos = parseCellId(srcId);
        const rowOffset = srcPos.row - srcMinRow;
        const colOffset = srcPos.col - srcMinCol;
        const destId = getCellId(targetAnchor.col + colOffset, targetAnchor.row + rowOffset);

        const srcCell = clipboard.data[srcId];
        const existingDest = newData[destId] || { value: '', formula: '' };
        cellChanges[destId] = { before: existingDest, after: null };

        if (pasteType === 'values') {
          newData[destId] = {
            ...existingDest,
            value: srcCell.value,
            formula: srcCell.formula,
            computed: srcCell.computed,
          };
        } else if (pasteType === 'format') {
          newData[destId] = {
            ...existingDest,
            style: srcCell.style ? { ...srcCell.style } : undefined,
            format: srcCell.format,
          };
        } else {
          newData[destId] = { ...srcCell };
        }
        cellChanges[destId].after = newData[destId];
      });

      // Recompute formulas
      Object.keys(newData).forEach(key => {
        const cell = newData[key];
        if (cell.formula && typeof cell.formula === 'string' && cell.formula.startsWith('=')) {
          const tempSheet = { ...sheet, data: newData };
          newData[key] = { ...cell, computed: evaluateFormula(cell.formula, tempSheet) };
        }
      });

      // If cut, clear source cells
      let finalSheets = prev.sheets.map(s => {
        if (s.id !== prev.activeSheetId) return s;
        return { ...s, data: newData };
      });

      if (clipboard.type === 'cut' && pasteType === 'all') {
        finalSheets = finalSheets.map(s => {
          if (s.id !== clipboard.sourceSheetId) return s;
          const cutData = { ...s.data };
          Object.keys(clipboard.data).forEach(srcId => {
            delete cutData[srcId];
          });
          return { ...s, data: cutData };
        });
      }

      const entry: UndoEntry = {
        action: 'Paste',
        sheetId: prev.activeSheetId,
        cellChanges,
        timestamp: Date.now(),
      };

      return {
        ...prev,
        sheets: finalSheets,
        clipboard: clipboard.type === 'cut' ? null : prev.clipboard,
        undoStack: [...prev.undoStack.slice(-MAX_UNDO + 1), entry],
        redoStack: [],
      };
    });
  }, []);

  const cancelClipboard = useCallback(() => {
    setState(prev => ({ ...prev, clipboard: null }));
  }, []);

  const selectColumn = useCallback((colIndex: number) => {
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId) || prev.sheets[0];
      const firstCell = getCellId(colIndex, 0);
      const lastCell = getCellId(colIndex, sheet.rowCount - 1);
      return { ...prev, selectedCell: firstCell, selectionRange: [firstCell, lastCell] };
    });
  }, []);

  const selectRow = useCallback((rowIndex: number) => {
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId) || prev.sheets[0];
      const firstCell = getCellId(0, rowIndex);
      const lastCell = getCellId(sheet.colCount - 1, rowIndex);
      return { ...prev, selectedCell: firstCell, selectionRange: [firstCell, lastCell] };
    });
  }, []);

  const selectAll = useCallback(() => {
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId) || prev.sheets[0];
      const firstCell = 'A1';
      const lastCell = getCellId(sheet.colCount - 1, sheet.rowCount - 1);
      return { ...prev, selectedCell: firstCell, selectionRange: [firstCell, lastCell] };
    });
  }, []);

  const resizeColumn = useCallback((colIndex: number, width: number) => {
    setState(prev => {
      const newSheets = prev.sheets.map(s =>
        s.id === prev.activeSheetId
          ? { ...s, columnWidths: { ...(s.columnWidths || {}), [colIndex]: width } }
          : s
      );
      return { ...prev, sheets: newSheets };
    });
  }, []);

  const resizeRow = useCallback((rowIndex: number, height: number) => {
    setState(prev => {
      const newSheets = prev.sheets.map(s =>
        s.id === prev.activeSheetId
          ? { ...s, rowHeights: { ...(s.rowHeights || {}), [rowIndex]: height } }
          : s
      );
      return { ...prev, sheets: newSheets };
    });
  }, []);

  const mergeCells = useCallback((type: 'all' | 'horizontal' | 'vertical' | 'unmerge', selectionRange: string[] | null, selectedCell: string | null) => {
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;

      const range = selectionRange || (selectedCell ? [selectedCell, selectedCell] : null);
      if (!range || range.length < 2) return prev;

      const start = parseCellId(range[0]);
      const end = parseCellId(range[range.length - 1]);
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);

      const newData = { ...sheet.data };

      if (type === 'unmerge') {
        // Clear all merge info in range
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            const id = getCellId(c, r);
            if (newData[id]) {
              newData[id] = { ...newData[id], isMergeAnchor: false, mergeSpan: null, mergedWith: null };
            }
          }
        }
      } else if (type === 'all') {
        const anchorId = getCellId(minCol, minRow);
        const anchorCell = newData[anchorId] || { value: '', formula: '' };
        // Set anchor
        newData[anchorId] = { ...anchorCell, isMergeAnchor: true, mergeSpan: { rows: maxRow - minRow + 1, cols: maxCol - minCol + 1 }, mergedWith: null };
        // Hide other cells
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            if (r === minRow && c === minCol) continue;
            const id = getCellId(c, r);
            newData[id] = { ...(newData[id] || { value: '', formula: '' }), mergedWith: anchorId, isMergeAnchor: false, mergeSpan: null };
          }
        }
      } else if (type === 'horizontal') {
        // Merge each row
        for (let r = minRow; r <= maxRow; r++) {
          const anchorId = getCellId(minCol, r);
          const anchorCell = newData[anchorId] || { value: '', formula: '' };
          newData[anchorId] = { ...anchorCell, isMergeAnchor: true, mergeSpan: { rows: 1, cols: maxCol - minCol + 1 }, mergedWith: null };
          for (let c = minCol + 1; c <= maxCol; c++) {
            const id = getCellId(c, r);
            newData[id] = { ...(newData[id] || { value: '', formula: '' }), mergedWith: anchorId, isMergeAnchor: false, mergeSpan: null };
          }
        }
      } else if (type === 'vertical') {
        // Merge each column
        for (let c = minCol; c <= maxCol; c++) {
          const anchorId = getCellId(c, minRow);
          const anchorCell = newData[anchorId] || { value: '', formula: '' };
          newData[anchorId] = { ...anchorCell, isMergeAnchor: true, mergeSpan: { rows: maxRow - minRow + 1, cols: 1 }, mergedWith: null };
          for (let r = minRow + 1; r <= maxRow; r++) {
            const id = getCellId(c, r);
            newData[id] = { ...(newData[id] || { value: '', formula: '' }), mergedWith: anchorId, isMergeAnchor: false, mergeSpan: null };
          }
        }
      }

      const newSheets = prev.sheets.map(s =>
        s.id === prev.activeSheetId ? { ...s, data: newData } : s
      );
      return { ...prev, sheets: newSheets };
    });
  }, []);

  const clearContents = useCallback((cellIds: string[]) => {
    setState(prev => {
      const sheet = prev.sheets.find(s => s.id === prev.activeSheetId);
      if (!sheet) return prev;

      const cellChanges: UndoEntry['cellChanges'] = {};
      const newSheets = prev.sheets.map(s => {
        if (s.id !== prev.activeSheetId) return s;
        const newData = { ...s.data };
        cellIds.forEach(cellId => {
          if (newData[cellId]) {
            cellChanges[cellId] = { before: newData[cellId], after: null };
            newData[cellId] = { ...newData[cellId], value: '', formula: '', computed: '' };
            cellChanges[cellId].after = newData[cellId];
          }
        });
        return { ...s, data: newData };
      });

      const entry: UndoEntry = {
        action: `Clear contents`,
        sheetId: prev.activeSheetId,
        cellChanges,
        timestamp: Date.now(),
      };

      return {
        ...prev,
        sheets: newSheets,
        undoStack: [...prev.undoStack.slice(-MAX_UNDO + 1), entry],
        redoStack: [],
      };
    });
  }, []);

  const getStateDiff = useCallback(() => {
    const diff: Record<string, { old: any; new: any }> = {};
    const compareObjects = (initial: any, current: any, path: string) => {
      if (typeof initial !== typeof current) {
        diff[path] = { old: initial, new: current };
        return;
      }
      if (typeof initial !== 'object' || initial === null) {
        if (initial !== current) diff[path] = { old: initial, new: current };
        return;
      }
      if (Array.isArray(initial) || Array.isArray(current)) {
        if (JSON.stringify(initial) !== JSON.stringify(current)) {
          diff[path] = { old: initial, new: current };
        }
        return;
      }
      const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})]);
      allKeys.forEach(key => {
        if (key === 'undoStack' || key === 'redoStack') return;
        compareObjects((initial || {})[key], (current || {})[key], path ? `${path}.${key}` : key);
      });
    };
    compareObjects(initialStateRecord, state, '');
    return diff;
  }, [state, initialStateRecord]);

  return {
    state,
    initialState: initialStateRecord,
    getActiveSheet,
    updateCell,
    setSelection,
    setDragging,
    moveSelection,
    addSheet,
    addImportedSheet,
    createBlankWorkbook,
    addNamedRange,
    addChart,
    switchSheet,
    renameSheet,
    deleteSheet,
    duplicateSheet,
    setSheetTabColor,
    updateTitle,
    updateFormat,
    setCellFormat,
    insertRow,
    deleteRow,
    insertCol,
    deleteCol,
    sortSheet,
    setFilter,
    setFilterCriteria,
    setZoom,
    toggleGridlines,
    setFreeze,
    clearContents,
    mergeCells,
    copyToClipboard,
    pasteFromClipboard,
    cancelClipboard,
    selectColumn,
    selectRow,
    selectAll,
    resizeColumn,
    resizeRow,
    undo,
    redo,
    canUndo: state.undoStack.length > 0,
    canRedo: state.redoStack.length > 0,
    getStateDiff,
    reset: () => setState(initialStateRecord),
  };
};
