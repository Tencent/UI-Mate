import { CellData, Sheet } from './types';
import { parseCellId, getCellId } from './helpers';

// Basic formula evaluator
export const evaluateFormula = (formula: string, sheet: Sheet): string | number => {
  if (typeof formula !== 'string' || !formula.startsWith('=')) return formula;

  const expression = formula.substring(1).trim();

  try {
    return evalExpr(expression, sheet);
  } catch (e) {
    return '#ERROR!';
  }
};

// Evaluate expression with full function support
function evalExpr(expr: string, sheet: Sheet): string | number {
  expr = expr.trim();

  // Handle string literals
  if (expr.startsWith('"') && expr.endsWith('"')) {
    return expr.slice(1, -1);
  }

  const upper = expr.toUpperCase();

  // ===== LOGICAL FUNCTIONS =====
  if (upper.startsWith('IF(')) {
    const args = splitArgs(expr.slice(3, -1));
    if (args.length < 2) return '#ERROR!';
    const cond = evalExpr(args[0], sheet);
    const condBool = isTruthy(cond);
    if (condBool) return evalExpr(args[1], sheet);
    if (args[2] !== undefined) return evalExpr(args[2], sheet);
    return 0;
  }

  if (upper.startsWith('AND(')) {
    const args = splitArgs(expr.slice(4, -1));
    return args.every(a => isTruthy(evalExpr(a, sheet))) ? 1 : 0;
  }

  if (upper.startsWith('OR(')) {
    const args = splitArgs(expr.slice(3, -1));
    return args.some(a => isTruthy(evalExpr(a, sheet))) ? 1 : 0;
  }

  if (upper.startsWith('NOT(')) {
    const inner = evalExpr(expr.slice(4, -1), sheet);
    return isTruthy(inner) ? 0 : 1;
  }

  // ===== RANGE FUNCTIONS =====
  const rangeFuncMatch = upper.match(/^([A-Z]+)\(([A-Z]+[0-9]+:[A-Z]+[0-9]+)(.*)\)$/);
  if (rangeFuncMatch) {
    const func = rangeFuncMatch[1];
    const rangeStr = rangeFuncMatch[2];
    const extraStr = rangeFuncMatch[3];
    const rangeParts = rangeStr.split(':');
    const values = getRangeValues(rangeParts[0], rangeParts[1], sheet);
    const allCells = getRangeCells(rangeParts[0], rangeParts[1], sheet);

    switch (func) {
      case 'SUM': return values.reduce((a, b) => a + b, 0);
      case 'AVERAGE': return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 'COUNT': return values.length;
      case 'COUNTA': return allCells.filter(c => c !== '' && c !== undefined && c !== null).length;
      case 'MAX': return values.length ? Math.max(...values) : 0;
      case 'MIN': return values.length ? Math.min(...values) : 0;
      case 'MEDIAN': {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      }
      case 'COUNTIF': {
        if (!extraStr) return '#ERROR!';
        const criteriaArg = extraStr.replace(/^,\s*/, '');
        const actualArgs = splitArgs(rangeStr + extraStr);
        const criteria = actualArgs[1] ? evalExpr(actualArgs[1], sheet) : '';
        return allCells.filter(c => matchesCriteria(String(c), String(criteria))).length;
      }
      case 'SUMIF': {
        const actualArgs = splitArgs(rangeStr + extraStr);
        const criteria = actualArgs[1] ? evalExpr(actualArgs[1], sheet) : '';
        const rangeParts2 = actualArgs[0].toUpperCase().split(':');
        const filterCells = getRangeCells(rangeParts2[0], rangeParts2[1], sheet);
        let sumRangeCells = filterCells;
        if (actualArgs[2]) {
          const sumRangeParts = actualArgs[2].toUpperCase().split(':');
          sumRangeCells = getRangeCells(sumRangeParts[0], sumRangeParts[1], sheet);
        }
        let total = 0;
        filterCells.forEach((c, i) => {
          if (matchesCriteria(String(c), String(criteria))) {
            total += Number(sumRangeCells[i]) || 0;
          }
        });
        return total;
      }
      case 'AVERAGEIF': {
        const actualArgs = splitArgs(rangeStr + extraStr);
        const criteria = actualArgs[1] ? evalExpr(actualArgs[1], sheet) : '';
        const rangeParts2 = actualArgs[0].toUpperCase().split(':');
        const filterCells = getRangeCells(rangeParts2[0], rangeParts2[1], sheet);
        let avgRangeCells = filterCells;
        if (actualArgs[2]) {
          const avgRangeParts = actualArgs[2].toUpperCase().split(':');
          avgRangeCells = getRangeCells(avgRangeParts[0], avgRangeParts[1], sheet);
        }
        let total = 0;
        let count = 0;
        filterCells.forEach((c, i) => {
          if (matchesCriteria(String(c), String(criteria))) {
            total += Number(avgRangeCells[i]) || 0;
            count++;
          }
        });
        return count > 0 ? total / count : '#DIV/0!';
      }
      default:
        break;
    }
  }

  // ===== VLOOKUP / HLOOKUP =====
  if (upper.startsWith('VLOOKUP(')) {
    const args = splitArgs(expr.slice(8, -1));
    if (args.length < 3) return '#N/A';
    const searchKey = evalExpr(args[0], sheet);
    const rangeParts = args[1].toUpperCase().split(':');
    const colIndex = parseInt(String(evalExpr(args[2], sheet)));
    const isSorted = args[3] ? isTruthy(evalExpr(args[3], sheet)) : true;
    const start = parseCellId(rangeParts[0]);
    const end = parseCellId(rangeParts[1]);
    for (let r = start.row; r <= end.row; r++) {
      const firstColId = getCellId(start.col, r);
      const firstCell = sheet.data[firstColId];
      const firstVal = firstCell?.computed ?? firstCell?.value ?? '';
      if (String(firstVal) === String(searchKey)) {
        const resultId = getCellId(start.col + colIndex - 1, r);
        const resultCell = sheet.data[resultId];
        return resultCell?.computed ?? resultCell?.value ?? '';
      }
    }
    return '#N/A';
  }

  if (upper.startsWith('HLOOKUP(')) {
    const args = splitArgs(expr.slice(8, -1));
    if (args.length < 3) return '#N/A';
    const searchKey = evalExpr(args[0], sheet);
    const rangeParts = args[1].toUpperCase().split(':');
    const rowIndex = parseInt(String(evalExpr(args[2], sheet)));
    const start = parseCellId(rangeParts[0]);
    const end = parseCellId(rangeParts[1]);
    for (let c = start.col; c <= end.col; c++) {
      const firstRowId = getCellId(c, start.row);
      const firstCell = sheet.data[firstRowId];
      const firstVal = firstCell?.computed ?? firstCell?.value ?? '';
      if (String(firstVal) === String(searchKey)) {
        const resultId = getCellId(c, start.row + rowIndex - 1);
        const resultCell = sheet.data[resultId];
        return resultCell?.computed ?? resultCell?.value ?? '';
      }
    }
    return '#N/A';
  }

  if (upper.startsWith('INDEX(')) {
    const args = splitArgs(expr.slice(6, -1));
    if (args.length < 2) return '#ERROR!';
    const rangeParts = args[0].toUpperCase().split(':');
    const start = parseCellId(rangeParts[0]);
    const rowIdx = parseInt(String(evalExpr(args[1], sheet)));
    const colIdx = args[2] ? parseInt(String(evalExpr(args[2], sheet))) : 1;
    const resultId = getCellId(start.col + colIdx - 1, start.row + rowIdx - 1);
    const resultCell = sheet.data[resultId];
    return resultCell?.computed ?? resultCell?.value ?? '';
  }

  if (upper.startsWith('MATCH(')) {
    const args = splitArgs(expr.slice(6, -1));
    if (args.length < 2) return '#N/A';
    const searchKey = evalExpr(args[0], sheet);
    const rangeParts = args[1].toUpperCase().split(':');
    const start = parseCellId(rangeParts[0]);
    const end = parseCellId(rangeParts[1]);
    let idx = 1;
    for (let r = start.row; r <= end.row; r++) {
      for (let c = start.col; c <= end.col; c++) {
        const cellId = getCellId(c, r);
        const cell = sheet.data[cellId];
        const val = cell?.computed ?? cell?.value ?? '';
        if (String(val) === String(searchKey)) return idx;
        idx++;
      }
    }
    return '#N/A';
  }

  // ===== TEXT FUNCTIONS =====
  if (upper.startsWith('LEN(')) {
    const val = evalExpr(expr.slice(4, -1), sheet);
    return String(val).length;
  }

  if (upper.startsWith('UPPER(')) {
    const val = evalExpr(expr.slice(6, -1), sheet);
    return String(val).toUpperCase();
  }

  if (upper.startsWith('LOWER(')) {
    const val = evalExpr(expr.slice(6, -1), sheet);
    return String(val).toLowerCase();
  }

  if (upper.startsWith('TRIM(')) {
    const val = evalExpr(expr.slice(5, -1), sheet);
    return String(val).trim();
  }

  if (upper.startsWith('CONCATENATE(')) {
    const args = splitArgs(expr.slice(12, -1));
    return args.map(a => evalExpr(a, sheet)).join('');
  }

  if (upper.startsWith('LEFT(')) {
    const args = splitArgs(expr.slice(5, -1));
    const str = String(evalExpr(args[0], sheet));
    const num = args[1] ? parseInt(String(evalExpr(args[1], sheet))) : 1;
    return str.slice(0, num);
  }

  if (upper.startsWith('RIGHT(')) {
    const args = splitArgs(expr.slice(6, -1));
    const str = String(evalExpr(args[0], sheet));
    const num = args[1] ? parseInt(String(evalExpr(args[1], sheet))) : 1;
    return str.slice(str.length - num);
  }

  if (upper.startsWith('MID(')) {
    const args = splitArgs(expr.slice(4, -1));
    const str = String(evalExpr(args[0], sheet));
    const start = parseInt(String(evalExpr(args[1], sheet))) - 1;
    const len = parseInt(String(evalExpr(args[2], sheet)));
    return str.slice(start, start + len);
  }

  if (upper.startsWith('SUBSTITUTE(')) {
    const args = splitArgs(expr.slice(11, -1));
    const str = String(evalExpr(args[0], sheet));
    const oldStr = String(evalExpr(args[1], sheet));
    const newStr = String(evalExpr(args[2], sheet));
    return str.split(oldStr).join(newStr);
  }

  if (upper.startsWith('TEXT(')) {
    const args = splitArgs(expr.slice(5, -1));
    const val = Number(evalExpr(args[0], sheet));
    const fmt = String(evalExpr(args[1], sheet));
    if (fmt.includes('$') || fmt.toLowerCase().includes('currency')) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }
    if (fmt.includes('%')) {
      return (val * 100).toFixed(2) + '%';
    }
    if (fmt.includes('.00')) {
      const places = (fmt.match(/\.0+/)?.[0].length || 1) - 1;
      return val.toFixed(places);
    }
    return String(val);
  }

  // ===== MATH FUNCTIONS =====
  if (upper.startsWith('ROUND(')) {
    const args = splitArgs(expr.slice(6, -1));
    const val = Number(evalExpr(args[0], sheet));
    const places = args[1] ? parseInt(String(evalExpr(args[1], sheet))) : 0;
    return Math.round(val * Math.pow(10, places)) / Math.pow(10, places);
  }

  if (upper.startsWith('ROUNDUP(')) {
    const args = splitArgs(expr.slice(8, -1));
    const val = Number(evalExpr(args[0], sheet));
    const places = args[1] ? parseInt(String(evalExpr(args[1], sheet))) : 0;
    return Math.ceil(val * Math.pow(10, places)) / Math.pow(10, places);
  }

  if (upper.startsWith('ROUNDDOWN(')) {
    const args = splitArgs(expr.slice(10, -1));
    const val = Number(evalExpr(args[0], sheet));
    const places = args[1] ? parseInt(String(evalExpr(args[1], sheet))) : 0;
    return Math.floor(val * Math.pow(10, places)) / Math.pow(10, places);
  }

  if (upper.startsWith('ABS(')) {
    return Math.abs(Number(evalExpr(expr.slice(4, -1), sheet)));
  }

  if (upper.startsWith('CEILING(')) {
    const args = splitArgs(expr.slice(8, -1));
    const val = Number(evalExpr(args[0], sheet));
    const significance = args[1] ? Number(evalExpr(args[1], sheet)) : 1;
    return Math.ceil(val / significance) * significance;
  }

  if (upper.startsWith('FLOOR(')) {
    const args = splitArgs(expr.slice(6, -1));
    const val = Number(evalExpr(args[0], sheet));
    const significance = args[1] ? Number(evalExpr(args[1], sheet)) : 1;
    return Math.floor(val / significance) * significance;
  }

  if (upper.startsWith('MOD(')) {
    const args = splitArgs(expr.slice(4, -1));
    const dividend = Number(evalExpr(args[0], sheet));
    const divisor = Number(evalExpr(args[1], sheet));
    if (divisor === 0) return '#DIV/0!';
    return dividend % divisor;
  }

  if (upper.startsWith('POWER(')) {
    const args = splitArgs(expr.slice(6, -1));
    const base = Number(evalExpr(args[0], sheet));
    const exp = Number(evalExpr(args[1], sheet));
    return Math.pow(base, exp);
  }

  if (upper.startsWith('SQRT(')) {
    const val = Number(evalExpr(expr.slice(5, -1), sheet));
    if (val < 0) return '#ERROR!';
    return Math.sqrt(val);
  }

  // ===== DATE FUNCTIONS =====
  if (upper === 'NOW()') {
    const now = new Date();
    return now.toLocaleString('en-US');
  }

  if (upper === 'TODAY()') {
    return new Date().toLocaleDateString('en-US');
  }

  if (upper.startsWith('DATE(')) {
    const args = splitArgs(expr.slice(5, -1));
    const y = parseInt(String(evalExpr(args[0], sheet)));
    const m = parseInt(String(evalExpr(args[1], sheet)));
    const d = parseInt(String(evalExpr(args[2], sheet)));
    const date = new Date(y, m - 1, d);
    // Return as Excel date serial
    const excelEpoch = new Date(1899, 11, 30);
    return Math.round((date.getTime() - excelEpoch.getTime()) / 86400000);
  }

  if (upper.startsWith('YEAR(')) {
    const val = Number(evalExpr(expr.slice(5, -1), sheet));
    const date = new Date((val - 25569) * 86400000);
    return date.getFullYear();
  }

  if (upper.startsWith('MONTH(')) {
    const val = Number(evalExpr(expr.slice(6, -1), sheet));
    const date = new Date((val - 25569) * 86400000);
    return date.getMonth() + 1;
  }

  if (upper.startsWith('DAY(')) {
    const val = Number(evalExpr(expr.slice(4, -1), sheet));
    const date = new Date((val - 25569) * 86400000);
    return date.getDate();
  }

  if (upper.startsWith('DATEDIF(')) {
    const args = splitArgs(expr.slice(8, -1));
    const start = Number(evalExpr(args[0], sheet));
    const end = Number(evalExpr(args[1], sheet));
    const unit = String(evalExpr(args[2], sheet)).toUpperCase().replace(/"/g, '');
    const startDate = new Date((start - 25569) * 86400000);
    const endDate = new Date((end - 25569) * 86400000);
    const diffMs = endDate.getTime() - startDate.getTime();
    switch (unit) {
      case 'D': return Math.floor(diffMs / 86400000);
      case 'M': {
        const years = endDate.getFullYear() - startDate.getFullYear();
        const months = endDate.getMonth() - startDate.getMonth();
        return years * 12 + months;
      }
      case 'Y': return endDate.getFullYear() - startDate.getFullYear();
      default: return '#ERROR!';
    }
  }

  // ===== HANDLE & OPERATOR (concatenation) =====
  if (expr.includes('&')) {
    const parts = splitByAmpersand(expr);
    if (parts.length > 1) {
      return parts.map(p => String(evalExpr(p.trim(), sheet))).join('');
    }
  }

  // ===== CELL REFERENCES & ARITHMETIC =====
  // Replace cell references with values
  const processedExpr = upper.replace(/[A-Z]+[0-9]+/g, (match) => {
    const cell = sheet.data[match];
    const val = cell?.computed ?? cell?.value ?? 0;
    const numVal = Number(val);
    return isNaN(numVal) ? '0' : String(numVal);
  });

  // Safe Eval for basic arithmetic
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${processedExpr}`)();
    if (typeof result === 'number' && !isFinite(result)) return '#DIV/0!';
    return result;
  } catch (e) {
    return '#ERROR!';
  }
}

// Split function arguments respecting parentheses and string literals
function splitArgs(expr: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let current = '';
  let inString = false;

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '"' && !inString) { inString = true; current += ch; continue; }
    if (ch === '"' && inString) { inString = false; current += ch; continue; }
    if (inString) { current += ch; continue; }
    if (ch === '(') { depth++; current += ch; }
    else if (ch === ')') { depth--; current += ch; }
    else if (ch === ',' && depth === 0) {
      args.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

// Split by & operator (not inside parens or strings)
function splitByAmpersand(expr: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  let inString = false;

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '"') { inString = !inString; current += ch; continue; }
    if (inString) { current += ch; continue; }
    if (ch === '(') { depth++; current += ch; }
    else if (ch === ')') { depth--; current += ch; }
    else if (ch === '&' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function isTruthy(val: string | number): boolean {
  if (typeof val === 'number') return val !== 0;
  const upper = String(val).toUpperCase();
  return upper !== '0' && upper !== 'FALSE' && upper !== '' && upper !== 'NO';
}

function matchesCriteria(cellVal: string, criteria: string): boolean {
  if (criteria.startsWith('>=')) return Number(cellVal) >= Number(criteria.slice(2));
  if (criteria.startsWith('<=')) return Number(cellVal) <= Number(criteria.slice(2));
  if (criteria.startsWith('>')) return Number(cellVal) > Number(criteria.slice(1));
  if (criteria.startsWith('<')) return Number(cellVal) < Number(criteria.slice(1));
  if (criteria.startsWith('<>')) return cellVal !== criteria.slice(2);
  if (criteria.includes('*')) {
    const regex = new RegExp('^' + criteria.replace(/\*/g, '.*') + '$', 'i');
    return regex.test(cellVal);
  }
  return cellVal.toLowerCase() === criteria.toLowerCase();
}

const getRangeValues = (startId: string, endId: string, sheet: Sheet): number[] => {
  const start = parseCellId(startId);
  const end = parseCellId(endId);
  const values: number[] = [];

  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const id = getCellId(c, r);
      const cell = sheet.data[id];
      const val = cell?.computed ?? cell?.value;
      if (val !== undefined && val !== '' && !isNaN(Number(val))) {
        values.push(Number(val));
      }
    }
  }
  return values;
};

const getRangeCells = (startId: string, endId: string, sheet: Sheet): (string | number)[] => {
  const start = parseCellId(startId);
  const end = parseCellId(endId);
  const cells: (string | number)[] = [];

  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const id = getCellId(c, r);
      const cell = sheet.data[id];
      cells.push(cell?.computed ?? cell?.value ?? '');
    }
  }
  return cells;
};
