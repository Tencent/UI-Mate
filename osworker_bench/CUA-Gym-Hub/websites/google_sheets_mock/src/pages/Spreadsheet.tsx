import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSpreadsheet } from '../store/useSpreadsheet';
import { Toolbar } from '../components/Toolbar';
import { FormulaBar } from '../components/FormulaBar';
import { Grid } from '../components/Grid/Grid';
import { SheetTabs } from '../components/SheetTabs';
import { MenuBar } from '../components/MenuBar';
import { ContextMenu } from '../components/ContextMenu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ChartModal } from '../components/ChartModal';
import { FileSpreadsheet, Share, MessageSquare, Star, FolderOpen, Cloud, X, ChevronUp, ChevronDown } from 'lucide-react';
import { parseCellId, isInRange, getCellId, getNextCellId, colIndexToLabel } from '../utils/helpers';
import type { CellStyle } from '../utils/types';

export const Spreadsheet: React.FC = () => {
  const {
    state,
    getActiveSheet,
    updateCell,
    setSelection,
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
    insertRow,
    deleteRow,
    insertCol,
    deleteCol,
    sortSheet,
    setFilter,
    setZoom,
    toggleGridlines,
    setFreeze,
    clearContents,
    copyToClipboard,
    pasteFromClipboard,
    cancelClipboard,
    selectColumn,
    selectRow,
    selectAll,
    resizeColumn,
    resizeRow,
    mergeCells,
    setFilterCriteria,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useSpreadsheet();

  const activeSheet = getActiveSheet();
  const selectedCellData = state.selectedCell ? activeSheet.data[state.selectedCell] : undefined;

  // Editable title state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(state.title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const consumedNewTemplateRef = useRef(false);
  const [isStarred, setIsStarred] = useState(false);
  const [folderName, setFolderName] = useState('My Drive');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [showAddOnsDialog, setShowAddOnsDialog] = useState(false);
  const [trashConfirm, setTrashConfirm] = useState(false);
  const [paintFormatStyle, setPaintFormatStyle] = useState<CellStyle | null>(null);

  useEffect(() => {
    setTitleDraft(state.title);
  }, [state.title]);

  useEffect(() => {
    if (consumedNewTemplateRef.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') {
      consumedNewTemplateRef.current = true;
      createBlankWorkbook();
      params.delete('new');
      const nextSearch = params.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`);
    }
  }, [createBlankWorkbook]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed) {
      updateTitle(trimmed);
    } else {
      setTitleDraft(state.title);
    }
    setIsEditingTitle(false);
  };

  // Toast notification
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Find & Replace state
  const [showSearch, setShowSearch] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchMatches: string[] = React.useMemo(() => {
    if (!searchText) return [];
    const search = matchCase ? searchText : searchText.toLowerCase();
    const matches: string[] = [];
    const data = activeSheet.data;
    for (let r = 0; r < activeSheet.rowCount; r++) {
      for (let c = 0; c < activeSheet.colCount; c++) {
        if (c >= 26) continue;
        const col = String.fromCharCode(65 + c);
        const id = `${col}${r + 1}`;
        const cell = data[id];
        if (cell) {
          const val = matchCase
            ? String(cell.computed ?? cell.value ?? '')
            : String(cell.computed ?? cell.value ?? '').toLowerCase();
          if (val.includes(search)) matches.push(id);
        }
      }
    }
    return matches;
  }, [searchText, matchCase, activeSheet]);

  const searchMatchSet = React.useMemo(() => new Set(searchMatches), [searchMatches]);

  useEffect(() => {
    setCurrentMatchIndex(0);
    if (searchMatches.length > 0) setSelection(searchMatches[0], null);
  }, [searchMatches]);

  const navigateMatch = useCallback((direction: 'next' | 'prev') => {
    if (searchMatches.length === 0) return;
    const newIndex = direction === 'next'
      ? (currentMatchIndex + 1) % searchMatches.length
      : (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(newIndex);
    setSelection(searchMatches[newIndex], null);
  }, [searchMatches, currentMatchIndex, setSelection]);

  const closeSearch = useCallback(() => {
    setShowSearch(false);
    setShowFindReplace(false);
    setSearchText('');
    setReplaceText('');
    setCurrentMatchIndex(0);
  }, []);

  const handleReplaceAll = useCallback(() => {
    if (!searchText) return;
    let count = 0;
    searchMatches.forEach(cellId => {
      const cell = activeSheet.data[cellId];
      if (cell) {
        const oldVal = String(cell.value ?? '');
        const newVal = matchCase
          ? oldVal.split(searchText).join(replaceText)
          : oldVal.replace(new RegExp(searchText, 'gi'), replaceText);
        updateCell(cellId, { value: newVal });
        count++;
      }
    });
    showToast(`${count} replacement(s) made`);
  }, [searchText, replaceText, matchCase, searchMatches, activeSheet, updateCell, showToast]);

  const handleReplaceOne = useCallback(() => {
    if (searchMatches.length === 0) return;
    const cellId = searchMatches[currentMatchIndex];
    const cell = activeSheet.data[cellId];
    if (cell) {
      const oldVal = String(cell.value ?? '');
      const newVal = matchCase
        ? oldVal.split(searchText).join(replaceText)
        : oldVal.replace(new RegExp(searchText, 'gi'), replaceText);
      updateCell(cellId, { value: newVal });
    }
    navigateMatch('next');
  }, [searchMatches, currentMatchIndex, searchText, replaceText, matchCase, activeSheet, updateCell, navigateMatch]);

  // Get selected cell range for row/col context
  const getSelectedRowCol = () => {
    if (!state.selectedCell) return { row: 0, col: 0 };
    return parseCellId(state.selectedCell);
  };

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number;
    cellId: string;
    type: 'cell' | 'row' | 'col';
  } | null>(null);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleContextMenu = useCallback((cellId: string, type: 'cell' | 'row' | 'col', e: React.MouseEvent) => {
    e.preventDefault();
    // Select the cell that was right-clicked
    if (type === 'cell') {
      setSelection(cellId, null);
    }
    setContextMenu({ x: e.clientX, y: e.clientY, cellId, type });
  }, [setSelection]);

  const promptForNote = useCallback(() => {
    if (!state.selectedCell) return;
    const note = window.prompt('Note', selectedCellData?.note || '');
    if (note !== null) updateCell(state.selectedCell, { note });
  }, [state.selectedCell, selectedCellData, updateCell]);

  const promptForComment = useCallback(() => {
    if (!state.selectedCell) return;
    const comment = window.prompt('Comment', selectedCellData?.note?.replace(/^Comment: /, '') || '');
    if (comment !== null) updateCell(state.selectedCell, { note: `Comment: ${comment}` });
  }, [state.selectedCell, selectedCellData, updateCell]);

  const promptForNamedRange = useCallback(() => {
    const range = state.selectionRange && state.selectionRange.length >= 2
      ? `${state.selectionRange[0]}:${state.selectionRange[state.selectionRange.length - 1]}`
      : (state.selectedCell || 'A1');
    const name = window.prompt('Named range name', `Range_${state.namedRanges.length + 1}`);
    if (name && name.trim()) {
      addNamedRange(name.trim(), range);
      showToast(`Created named range ${name.trim()}`);
    }
  }, [state.selectionRange, state.selectedCell, state.namedRanges.length, addNamedRange, showToast]);

  // Build context menu items based on type
  const contextMenuItems = useMemo(() => {
    if (!contextMenu) return [];
    const { cellId, type } = contextMenu;
    const { row, col } = parseCellId(cellId);

    const copyItem = { label: 'Copy', shortcut: 'Ctrl+C', onClick: () => copyToClipboard('copy') };
    const cutItem = { label: 'Cut', shortcut: 'Ctrl+X', onClick: () => copyToClipboard('cut') };
    const pasteItem = {
      label: 'Paste', shortcut: 'Ctrl+V',
      onClick: () => pasteFromClipboard('all'),
      disabled: !state.clipboard,
    };
    const pasteSpecialItem = {
      label: 'Paste special',
      submenu: true,
      disabled: !state.clipboard,
      onClick: () => { /* shows submenu - handled inline */ },
    };
    const pasteValuesItem = {
      label: '  Paste values only',
      onClick: () => pasteFromClipboard('values'),
      disabled: !state.clipboard,
    };
    const pasteFormatItem = {
      label: '  Paste format only',
      onClick: () => pasteFromClipboard('format'),
      disabled: !state.clipboard,
    };

    if (type === 'col') {
      return [
        cutItem, copyItem, pasteItem,
        pasteValuesItem, pasteFormatItem,
        { separator: true },
        { label: 'Insert 1 column left', onClick: () => insertCol(col, true) },
        { label: 'Insert 1 column right', onClick: () => insertCol(col, false) },
        { label: 'Delete column', onClick: () => deleteCol(col) },
        { label: 'Clear column', onClick: () => {
          const cells: string[] = [];
          for (let r = 0; r < activeSheet.rowCount; r++) {
            cells.push(getCellId(col, r));
          }
          clearContents(cells);
        }},
        { separator: true },
        { label: 'Sort sheet A→Z', onClick: () => sortSheet(String.fromCharCode(65 + col), 'asc') },
        { label: 'Sort sheet Z→A', onClick: () => sortSheet(String.fromCharCode(65 + col), 'desc') },
      ];
    }

    if (type === 'row') {
      return [
        cutItem, copyItem, pasteItem,
        pasteValuesItem, pasteFormatItem,
        { separator: true },
        { label: 'Insert 1 row above', onClick: () => insertRow(row, true) },
        { label: 'Insert 1 row below', onClick: () => insertRow(row, false) },
        { label: 'Delete row', onClick: () => deleteRow(row) },
        { label: 'Clear row', onClick: () => {
          const cells: string[] = [];
          for (let c = 0; c < activeSheet.colCount; c++) {
            cells.push(getCellId(c, row));
          }
          clearContents(cells);
        }},
      ];
    }

    // Cell context menu
    return [
      cutItem, copyItem, pasteItem,
      pasteSpecialItem,
      pasteValuesItem, pasteFormatItem,
      { separator: true },
      { label: 'Insert row above', onClick: () => insertRow(row, true) },
      { label: 'Insert row below', onClick: () => insertRow(row, false) },
      { label: 'Insert column left', onClick: () => insertCol(col, true) },
      { label: 'Insert column right', onClick: () => insertCol(col, false) },
      { separator: true },
      { label: 'Delete row', onClick: () => deleteRow(row) },
      { label: 'Delete column', onClick: () => deleteCol(col) },
      { label: 'Clear contents', shortcut: 'Delete', onClick: () => {
        const targets = state.selectionRange && state.selectionRange.length >= 2
          ? (() => {
              const start = parseCellId(state.selectionRange[0]);
              const end = parseCellId(state.selectionRange[state.selectionRange.length - 1]);
              const cells: string[] = [];
              for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
                for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
                  cells.push(getCellId(c, r));
                }
              }
              return cells;
            })()
          : (state.selectedCell ? [state.selectedCell] : []);
        clearContents(targets);
      }},
      { separator: true },
      { label: 'Insert note', onClick: promptForNote },
      { label: 'Insert comment', onClick: promptForComment },
      { separator: true },
      { label: 'Define named range', onClick: promptForNamedRange },
    ];
  }, [contextMenu, state.clipboard, state.selectedCell, state.selectionRange, activeSheet,
    copyToClipboard, pasteFromClipboard, insertRow, insertCol, deleteRow, deleteCol,
    clearContents, sortSheet, promptForNote, promptForComment, promptForNamedRange]);

  // Compute clipboard cell set for marching ants display
  const clipboardSet = useMemo(() => {
    if (!state.clipboard) return undefined;
    const set = new Set<string>();
    Object.keys(state.clipboard.data).forEach(id => set.add(id));
    return set;
  }, [state.clipboard]);

  // Delete-sheet confirm dialog state
  const [deleteSheetConfirm, setDeleteSheetConfirm] = useState<string | null>(null);

  // F2 / Enter edit mode state
  const [forceEditMode, setForceEditMode] = useState(false);

  // Name box display (shows range like A1:D10 when range selected)
  const nameBoxDisplay = useMemo(() => {
    if (state.selectionRange && state.selectionRange.length >= 2) {
      const start = state.selectionRange[0];
      const end = state.selectionRange[state.selectionRange.length - 1];
      if (start !== end) {
        const s = parseCellId(start);
        const e2 = parseCellId(end);
        const minCol = Math.min(s.col, e2.col);
        const maxCol = Math.max(s.col, e2.col);
        const minRow = Math.min(s.row, e2.row);
        const maxRow = Math.max(s.row, e2.row);
        return `${colIndexToLabel(minCol)}${minRow + 1}:${colIndexToLabel(maxCol)}${maxRow + 1}`;
      }
    }
    return state.selectedCell || '';
  }, [state.selectedCell, state.selectionRange]);

  // Shift+Arrow range extension
  const extendSelection = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!state.selectedCell) return;
    const sheet = getActiveSheet();
    const anchor = state.selectedCell;
    const currentEnd = state.selectionRange && state.selectionRange.length >= 2
      ? state.selectionRange[state.selectionRange.length - 1]
      : anchor;
    const nextEnd = getNextCellId(currentEnd, direction, sheet.rowCount, sheet.colCount);
    if (nextEnd !== currentEnd) {
      setSelection(anchor, [anchor, nextEnd]);
    }
  }, [state.selectedCell, state.selectionRange, getActiveSheet, setSelection]);

  // After Enter commit: move down
  const handleEnterCommit = useCallback((id: string, _value: string) => {
    setForceEditMode(false);
    const sheet = getActiveSheet();
    const next = getNextCellId(id, 'down', sheet.rowCount, sheet.colCount);
    setSelection(next, null);
  }, [getActiveSheet, setSelection]);

  // After Tab commit: move right (or left if Shift+Tab)
  const handleTabCommit = useCallback((id: string, _value: string, shiftKey: boolean) => {
    setForceEditMode(false);
    const sheet = getActiveSheet();
    const next = getNextCellId(id, shiftKey ? 'left' : 'right', sheet.rowCount, sheet.colCount);
    setSelection(next, null);
  }, [getActiveSheet, setSelection]);

  const handleEscapeEdit = useCallback(() => {
    setForceEditMode(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
        return;
      }
      if (isCtrl && e.key === 'h') {
        e.preventDefault();
        setShowFindReplace(true);
        return;
      }
      if (isCtrl && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if (isCtrl && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
        return;
      }
      if (isCtrl && e.key === 'c') {
        e.preventDefault();
        copyToClipboard('copy');
        return;
      }
      if (isCtrl && e.key === 'x') {
        e.preventDefault();
        copyToClipboard('cut');
        return;
      }
      if (isCtrl && e.key === 'v') {
        e.preventDefault();
        pasteFromClipboard('all');
        return;
      }
      if (isCtrl && e.key === 'b') {
        e.preventDefault();
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          updateFormat({ bold: !selectedCellData?.style?.bold });
        }
        return;
      }
      if (isCtrl && e.key === 'i') {
        e.preventDefault();
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          updateFormat({ italic: !selectedCellData?.style?.italic });
        }
        return;
      }
      if (isCtrl && e.key === 'u') {
        e.preventDefault();
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          updateFormat({ underline: !selectedCellData?.style?.underline });
        }
        return;
      }
      if (isCtrl && e.key === 'a') {
        e.preventDefault();
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          selectAll();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (forceEditMode) {
          setForceEditMode(false);
          return;
        }
        if (contextMenu) {
          closeContextMenu();
          return;
        }
        if (showSearch || showFindReplace) {
          closeSearch();
          return;
        }
        if (state.clipboard) {
          cancelClipboard();
          return;
        }
      }

      // F2 enters edit mode
      if (e.key === 'F2' && state.selectedCell) {
        e.preventDefault();
        if (document.activeElement?.tagName !== 'INPUT') {
          setForceEditMode(true);
        }
        return;
      }

      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      // Shift+Arrow extends selection
      if (e.shiftKey && !isCtrl) {
        if (e.key === 'ArrowUp') { e.preventDefault(); extendSelection('up'); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); extendSelection('down'); return; }
        if (e.key === 'ArrowLeft') { e.preventDefault(); extendSelection('left'); return; }
        if (e.key === 'ArrowRight') { e.preventDefault(); extendSelection('right'); return; }
      }

      if (e.key === 'ArrowUp') { e.preventDefault(); setForceEditMode(false); moveSelection('up'); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setForceEditMode(false); moveSelection('down'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setForceEditMode(false); moveSelection('left'); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); setForceEditMode(false); moveSelection('right'); }

      // Delete key clears selected cell(s)
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedCell) {
          const targets = state.selectionRange && state.selectionRange.length >= 2
            ? (() => {
                const start2 = parseCellId(state.selectionRange[0]);
                const end2 = parseCellId(state.selectionRange[state.selectionRange.length - 1]);
                const cells: string[] = [];
                for (let r = Math.min(start2.row, end2.row); r <= Math.max(start2.row, end2.row); r++) {
                  for (let c = Math.min(start2.col, end2.col); c <= Math.max(start2.col, end2.col); c++) {
                    cells.push(getCellId(c, r));
                  }
                }
                return cells;
              })()
            : [state.selectedCell];
          clearContents(targets);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveSelection, showSearch, showFindReplace, closeSearch, undo, redo,
      copyToClipboard, pasteFromClipboard, cancelClipboard, contextMenu, closeContextMenu,
      state.clipboard, state.selectedCell, state.selectionRange, forceEditMode,
      extendSelection, clearContents, updateFormat, selectedCellData, selectAll]);

  const handleCellUpdate = (id: string, value: string) => {
    updateCell(id, { value });
  };

  const sheetRows = useCallback(() => {
    const sheet = getActiveSheet();
    const rows: string[][] = [];
    for (let r = 0; r < sheet.rowCount; r++) {
      const values: string[] = [];
      let hasContent = false;
      for (let c = 0; c < sheet.colCount; c++) {
        const cellId = getCellId(c, r);
        const raw = sheet.data[cellId]?.computed ?? sheet.data[cellId]?.value ?? '';
        const value = String(raw);
        if (value) hasContent = true;
        values.push(value);
      }
      if (hasContent) rows.push(values);
    }
    return rows;
  }, [getActiveSheet]);

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, []);

  const downloadActiveSheetCsv = useCallback(() => {
    const sheet = getActiveSheet();
    const csv = sheetRows()
      .map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${sheet.name}.csv`);
    showToast(`Downloaded ${sheet.name}.csv`);
  }, [downloadBlob, getActiveSheet, sheetRows, showToast]);

  const escapeXml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const downloadActiveSheetXls = useCallback(() => {
    const sheet = getActiveSheet();
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><table>${
      sheetRows().map(row => `<tr>${row.map(value => `<td>${escapeXml(value)}</td>`).join('')}</tr>`).join('')
    }</table></body></html>`;
    downloadBlob(new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' }), `${sheet.name}.xls`);
    showToast(`Downloaded ${sheet.name}.xls`);
  }, [downloadBlob, getActiveSheet, sheetRows, showToast]);

  const downloadActiveSheetPdf = useCallback(() => {
    const sheet = getActiveSheet();
    const lines = [`${state.title} - ${sheet.name}`, '', ...sheetRows().map(row => row.join('   '))].slice(0, 45);
    const escapePdf = (value: string) => value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const content = [
      'BT',
      '/F1 11 Tf',
      '50 760 Td',
      ...lines.flatMap((line, index) => [
        index === 0 ? '' : '0 -16 Td',
        `(${escapePdf(line.slice(0, 120))}) Tj`,
      ]).filter(Boolean),
      'ET',
    ].join('\n');
    const objects = [
      '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
      '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj',
      '4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj',
      `5 0 obj<</Length ${content.length}>>stream\n${content}\nendstream\nendobj`,
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach(obj => {
      offsets.push(pdf.length);
      pdf += `${obj}\n`;
    });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF`;
    downloadBlob(new Blob([pdf], { type: 'application/pdf' }), `${sheet.name}.pdf`);
    showToast(`Downloaded ${sheet.name}.pdf`);
  }, [downloadBlob, getActiveSheet, sheetRows, showToast, state.title]);

  const parseCsv = (text: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let value = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];
      if (ch === '"' && inQuotes && next === '"') {
        value += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        row.push(value);
        value = '';
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        if (ch === '\r' && next === '\n') i++;
        row.push(value);
        if (row.some(cell => cell.trim())) rows.push(row);
        row = [];
        value = '';
      } else {
        value += ch;
      }
    }
    row.push(value);
    if (row.some(cell => cell.trim())) rows.push(row);
    return rows;
  };

  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
    if (!isCsv) {
      showToast('Only CSV import is supported in this sandbox');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result || ''));
      if (rows.length === 0) {
        showToast('The selected CSV is empty');
      } else {
        addImportedSheet(file.name, rows);
        showToast(`Imported ${file.name}`);
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  }, [addImportedSheet, showToast]);

  const handleImageImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !state.selectedCell) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateCell(state.selectedCell!, {
        value: `[Image: ${file.name}]`,
        note: String(reader.result || ''),
        style: { ...(selectedCellData?.style || {}), bg: '#E8F0FE', align: 'center' },
      });
      showToast(`Inserted image ${file.name}`);
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  }, [state.selectedCell, selectedCellData, updateCell, showToast]);

  const selectedRangeLabel = useCallback(() => {
    if (state.selectionRange && state.selectionRange.length >= 2) {
      return `${state.selectionRange[0]}:${state.selectionRange[state.selectionRange.length - 1]}`;
    }
    return state.selectedCell || 'A1';
  }, [state.selectionRange, state.selectedCell]);

  const applyPaintFormat = useCallback(() => {
    if (!paintFormatStyle || !state.selectedCell) return;
    updateFormat(paintFormatStyle);
    setPaintFormatStyle(null);
    showToast('Applied paint format');
  }, [paintFormatStyle, state.selectedCell, updateFormat, showToast]);

  const handleFormulaUpdate = (value: string) => {
    if (state.selectedCell) {
      updateCell(state.selectedCell, { formula: value });
    }
  };

  const handleMenuAction = useCallback((action: string, payload?: any) => {
    const { row, col } = getSelectedRowCol();
    switch (action) {
      case 'undo': undo(); break;
      case 'redo': redo(); break;
      case 'copy': copyToClipboard('copy'); break;
      case 'cut': copyToClipboard('cut'); break;
      case 'paste': pasteFromClipboard('all'); break;
      case 'paste_values': pasteFromClipboard('values'); break;
      case 'paste_format': pasteFromClipboard('format'); break;
      case 'clear_contents': {
        const targets = state.selectionRange
          ? state.selectionRange
          : (state.selectedCell ? [state.selectedCell] : []);
        clearContents(targets);
        break;
      }
      case 'delete_row': deleteRow(row); break;
      case 'delete_col': deleteCol(col); break;
      case 'insert_row_above': insertRow(row, true); break;
      case 'insert_row_below': insertRow(row, false); break;
      case 'insert_col_left': insertCol(col, true); break;
      case 'insert_col_right': insertCol(col, false); break;
      case 'sort_asc': {
        const colLetter = String.fromCharCode(65 + col);
        sortSheet(colLetter, 'asc');
        break;
      }
      case 'sort_desc': {
        const colLetter = String.fromCharCode(65 + col);
        sortSheet(colLetter, 'desc');
        break;
      }
      case 'create_filter': {
        const sheet = getActiveSheet();
        setFilter(sheet.filterRange ? null : `A1:${String.fromCharCode(65 + sheet.colCount - 1)}${sheet.rowCount}`);
        break;
      }
      case 'toggle_gridlines': toggleGridlines(); break;
      case 'zoom': setZoom(payload); break;
      case 'freeze': setFreeze(payload.rows, payload.cols); break;
      case 'find': {
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
        break;
      }
      case 'find_replace': setShowFindReplace(true); break;
      case 'rename_title': setTitleDraft(state.title); setIsEditingTitle(true); break;
      case 'new_workbook': createBlankWorkbook(); showToast('Created a new blank spreadsheet'); break;
      case 'open_file': fileInputRef.current?.click(); break;
      case 'make_copy': updateTitle(`Copy of ${state.title}`); showToast('Created a local copy'); break;
      case 'share': setShowShareDialog(true); break;
      case 'email_sheet': setShowEmailDialog(true); break;
      case 'move_file': {
        const next = window.prompt('Move spreadsheet to folder', folderName);
        if (next && next.trim()) {
          setFolderName(next.trim());
          showToast(`Moved to ${next.trim()}`);
        }
        break;
      }
      case 'move_to_trash': setTrashConfirm(true); break;
      case 'version_history': setShowVersionHistory(true); break;
      case 'print': window.print(); break;
      case 'download_csv': downloadActiveSheetCsv(); break;
      case 'download_xls': downloadActiveSheetXls(); break;
      case 'download_pdf': downloadActiveSheetPdf(); break;
      case 'formula_bar': showToast('Formula bar is visible'); break;
      case 'insert_chart': {
        addChart('bar', `${activeSheet.name} chart`, selectedRangeLabel());
        setShowChartModal(true);
        break;
      }
      case 'insert_image': imageInputRef.current?.click(); break;
      case 'insert_note': {
        promptForNote();
        break;
      }
      case 'insert_comment': {
        promptForComment();
        break;
      }
      case 'data_validation': {
        if (!state.selectedCell) break;
        const options = window.prompt('Dropdown options separated by commas', 'Approved,Pending,Rejected');
        if (options !== null) {
          updateCell(state.selectedCell, {
            validation: {
              type: 'list',
              criteria: { values: options.split(',').map(item => item.trim()).filter(Boolean) },
              showWarning: true,
              helpText: 'Choose a value from the configured list',
            },
          });
          showToast(`Added data validation to ${state.selectedCell}`);
        }
        break;
      }
      case 'named_ranges': {
        promptForNamedRange();
        break;
      }
      case 'spelling': {
        const misspellings = Object.values(activeSheet.data).filter(cell => /\b(teh|recieve|adress)\b/i.test(cell.value || '')).length;
        showToast(misspellings ? `${misspellings} possible spelling issue(s)` : 'Spelling check complete');
        break;
      }
      case 'notification_settings': setShowNotificationDialog(true); break;
      case 'add_ons': setShowAddOnsDialog(true); break;
      case 'keyboard_shortcuts': setShowShortcutsDialog(true); break;
      case 'insert_function': {
        if (!state.selectedCell) break;
        const fnName = payload || 'SUM';
        const col = parseCellId(state.selectedCell).col;
        const colLabel = colIndexToLabel(col);
        const formula = `=${fnName}(${colLabel}1:${colLabel}10)`;
        updateCell(state.selectedCell, { formula });
        break;
      }
      case 'bold': updateFormat({ bold: !selectedCellData?.style?.bold }); break;
      case 'italic': updateFormat({ italic: !selectedCellData?.style?.italic }); break;
      case 'underline': updateFormat({ underline: !selectedCellData?.style?.underline }); break;
      case 'strikethrough': updateFormat({ strikethrough: !selectedCellData?.style?.strikethrough }); break;
      case 'align': updateFormat({ align: payload }); break;
      case 'format_number': updateFormat({}, payload); break;
      case 'clear_formatting': updateFormat({
        bold: false, italic: false, underline: false, strikethrough: false,
        color: undefined, bg: undefined, fontSize: undefined, fontFamily: undefined,
      }); break;
      default:
        showToast('Command completed');
    }
  }, [undo, redo, copyToClipboard, pasteFromClipboard, clearContents, deleteRow, deleteCol,
      insertRow, insertCol, sortSheet, setFilter, toggleGridlines, setZoom, setFreeze,
      updateFormat, selectedCellData, state, getActiveSheet, showToast, updateCell,
      downloadActiveSheetCsv, downloadActiveSheetXls, downloadActiveSheetPdf,
      createBlankWorkbook, updateTitle, folderName, addChart, addNamedRange, activeSheet.name,
      activeSheet.data, selectedRangeLabel, promptForNote, promptForComment, promptForNamedRange]);

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 font-sans overflow-hidden" style={{ fontSize: 14 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        aria-label="Open CSV file"
        onChange={handleFileImport}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Insert image file"
        onChange={handleImageImport}
      />

      {/* Title Bar */}
      <header className="flex items-center justify-between px-3 pt-2 pb-0 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={28} className="text-[#0F9D58]" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  className="text-lg font-normal leading-tight border border-blue-400 rounded px-1 outline-none min-w-[200px]"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitTitle();
                    if (e.key === 'Escape') { setTitleDraft(state.title); setIsEditingTitle(false); }
                  }}
                />
              ) : (
                <h1
                  className="text-lg font-normal leading-tight cursor-pointer hover:bg-gray-100 px-1 rounded text-[#202124]"
                  onClick={() => { setTitleDraft(state.title); setIsEditingTitle(true); }}
                >
                  {state.title}
                </h1>
              )}
              <button
                className={`p-1 hover:bg-gray-100 rounded ${isStarred ? 'text-[#F9AB00]' : 'text-gray-500'}`}
                title={isStarred ? 'Remove star' : 'Star'}
                onClick={() => setIsStarred(value => !value)}
              >
                <Star size={16} fill={isStarred ? '#F9AB00' : 'none'} />
              </button>
              <button
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
                title={`Move: ${folderName}`}
                onClick={() => handleMenuAction('move_file')}
              >
                <FolderOpen size={16} />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded text-gray-400" title="Saved to Drive" onClick={() => showToast('All changes saved locally')}>
                <Cloud size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full" title="Comments" onClick={() => handleMenuAction('insert_comment')}>
            <MessageSquare size={20} className="text-gray-600" />
          </button>
          <button
            className="flex items-center gap-2 bg-[#1A73E8] hover:bg-[#1765CC] text-white px-4 py-1.5 rounded-full font-medium text-sm transition-colors"
            onClick={() => setShowShareDialog(true)}
            title="Share"
          >
            <Share size={16} />
            Share
          </button>
          <img
            src="https://ui-avatars.com/api/?name=Alex+Johnson&background=4285F4&color=fff&size=32"
            alt="User"
            className="w-8 h-8 rounded-full border border-gray-300"
          />
        </div>
      </header>

      {/* Menu Bar */}
      <MenuBar onAction={handleMenuAction} state={state} activeSheet={activeSheet} />

      {/* Toolbar */}
      <Toolbar
        onFormat={updateFormat}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        zoom={state.zoom}
        onZoom={setZoom}
        selectedCellData={selectedCellData}
        onFilter={() => handleMenuAction('create_filter')}
        onMerge={(type) => mergeCells(type, state.selectionRange, state.selectedCell)}
        onPrint={() => window.print()}
        onPaintFormat={() => {
          if (paintFormatStyle) {
            applyPaintFormat();
          } else if (selectedCellData?.style) {
            setPaintFormatStyle(selectedCellData.style);
            showToast('Paint format copied; choose another cell and click again');
          } else {
            showToast('Select a styled cell first');
          }
        }}
        onInsertFunction={(fn) => {
          if (!state.selectedCell) return;
          const sheet = getActiveSheet();
          // Build a default range from column A rows 1 to last data row
          const col = parseCellId(state.selectedCell).col;
          const colLabel = colIndexToLabel(col);
          const formula = `=${fn}(${colLabel}1:${colLabel}10)`;
          updateCell(state.selectedCell, { formula });
        }}
      />

      {/* Formula Bar */}
      <FormulaBar
        selectedCellId={state.selectedCell}
        nameBoxDisplay={nameBoxDisplay}
        cellData={selectedCellData}
        onUpdate={handleFormulaUpdate}
        onNavigate={(cellId) => setSelection(cellId, null)}
      />

      {/* Search Bar */}
      {(showSearch || showFindReplace) && (
        <div className="flex items-start gap-3 px-4 py-2 bg-white border-b border-gray-300 shadow-sm z-30">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16">Find</label>
              <input
                ref={searchInputRef}
                type="text"
                className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400 w-56"
                placeholder="Find in sheet..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') closeSearch();
                  if (e.key === 'Enter') navigateMatch(e.shiftKey ? 'prev' : 'next');
                }}
              />
              <span className="text-sm text-gray-400 min-w-[90px]">
                {searchText ? (searchMatches.length > 0 ? `${currentMatchIndex + 1} / ${searchMatches.length}` : 'No matches') : ''}
              </span>
              <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-40" onClick={() => navigateMatch('prev')} disabled={searchMatches.length === 0} title="Previous">
                <ChevronUp size={16} />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-40" onClick={() => navigateMatch('next')} disabled={searchMatches.length === 0} title="Next">
                <ChevronDown size={16} />
              </button>
            </div>
            {showFindReplace && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-16">Replace</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400 w-56"
                  placeholder="Replace with..."
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                />
                <button className="px-2 py-1 text-sm bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 text-blue-700" onClick={handleReplaceOne}>Replace</button>
                <button className="px-2 py-1 text-sm bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 text-blue-700" onClick={handleReplaceAll}>Replace all</button>
              </div>
            )}
            <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={matchCase} onChange={e => setMatchCase(e.target.checked)} className="rounded" />
              Match case
            </label>
          </div>
          <button className="ml-auto p-1 hover:bg-gray-100 rounded mt-0.5" onClick={closeSearch}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Grid */}
      <Grid
        sheet={activeSheet}
        selectedCell={state.selectedCell}
        selectionRange={state.selectionRange}
        clipboardSet={clipboardSet}
        searchMatches={searchMatchSet}
        currentSearchMatch={searchMatches.length > 0 ? searchMatches[currentMatchIndex] : null}
        showGridlines={state.showGridlines}
        forceEditMode={forceEditMode}
        onSelect={(id, isShift) => {
          if (isShift && state.selectedCell) {
            setSelection(state.selectedCell, [state.selectedCell, id]);
          } else {
            setForceEditMode(false);
            setSelection(id, null);
          }
        }}
        onUpdate={handleCellUpdate}
        onRangeSelect={(range) => setSelection(state.selectedCell || range[0], range)}
        onContextMenu={handleContextMenu}
        onColumnSelect={selectColumn}
        onRowSelect={selectRow}
        onSelectAll={selectAll}
        onResizeColumn={resizeColumn}
        onResizeRow={resizeRow}
        onEnterCommit={handleEnterCommit}
        onTabCommit={handleTabCommit}
        onEscapeEdit={handleEscapeEdit}
        onSort={sortSheet}
        onFilterChange={setFilterCriteria}
      />

      {/* Sheet Tabs */}
      <SheetTabs
        sheets={state.sheets}
        activeSheetId={state.activeSheetId}
        onSwitch={switchSheet}
        onAdd={addSheet}
        onRename={renameSheet}
        onDelete={(id) => {
          if (state.sheets.length <= 1) {
            showToast('Cannot delete the only sheet.');
            return;
          }
          setDeleteSheetConfirm(id);
        }}
        onDuplicate={duplicateSheet}
        onTabColor={setSheetTabColor}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={closeContextMenu}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-[#202124] text-white text-sm px-4 py-2 rounded shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}

      {/* Delete Sheet Confirm Dialog */}
      {deleteSheetConfirm && (
        <ConfirmDialog
          message="Are you sure you want to delete this sheet? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => {
            deleteSheet(deleteSheetConfirm);
            setDeleteSheetConfirm(null);
          }}
          onCancel={() => setDeleteSheetConfirm(null)}
        />
      )}

      {trashConfirm && (
        <ConfirmDialog
          message="Move this spreadsheet to the local trash? This sandbox action renames the file and keeps the state available for inspection."
          confirmLabel="Move to trash"
          onConfirm={() => {
            updateTitle(`${state.title} (Trashed)`);
            setTrashConfirm(false);
            showToast('Moved to local trash');
          }}
          onCancel={() => setTrashConfirm(false)}
        />
      )}

      {showShareDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setShowShareDialog(false); }}>
          <div className="bg-white rounded-lg shadow-xl w-[480px] p-5 border border-[#DADCE0]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-[#202124]">Share "{state.title}"</h2>
              <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setShowShareDialog(false)}><X size={18} /></button>
            </div>
            <label className="block text-sm text-[#5F6368] mb-1">People with access</label>
            <div className="border border-[#DADCE0] rounded px-3 py-2 text-sm mb-4">Alex Johnson - Owner</div>
            <label className="block text-sm text-[#5F6368] mb-1">General access</label>
            <select className="w-full border border-[#DADCE0] rounded px-3 py-2 text-sm mb-4" defaultValue="restricted">
              <option value="restricted">Restricted</option>
              <option value="viewer">Anyone with the link can view</option>
              <option value="commenter">Anyone with the link can comment</option>
              <option value="editor">Anyone with the link can edit</option>
            </select>
            <div className="flex justify-between">
              <button className="text-sm text-[#1A73E8] hover:bg-[#E8F0FE] px-3 py-2 rounded" onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast('Copied sandbox link'); }}>Copy link</button>
              <button className="bg-[#1A73E8] hover:bg-[#1765CC] text-white text-sm px-5 py-2 rounded" onClick={() => setShowShareDialog(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {showEmailDialog && (
        <div className="fixed bottom-8 right-8 z-[9999] w-[520px] bg-white rounded-t-lg shadow-2xl border border-[#DADCE0] overflow-hidden">
          <div className="bg-[#F1F3F4] px-4 py-2 flex items-center justify-between text-sm font-medium">
            <span>Message</span>
            <button onClick={() => setShowEmailDialog(false)}><X size={16} /></button>
          </div>
          <input className="w-full border-b border-[#DADCE0] px-4 py-2 text-sm outline-none" placeholder="Recipients" />
          <input className="w-full border-b border-[#DADCE0] px-4 py-2 text-sm outline-none" defaultValue={state.title} />
          <textarea className="w-full h-36 px-4 py-3 text-sm outline-none resize-none" defaultValue={`Sharing a local sandbox copy of ${state.title}.`} />
          <div className="px-4 py-3 border-t border-[#DADCE0] flex justify-between">
            <button className="bg-[#1A73E8] hover:bg-[#1765CC] text-white text-sm px-4 py-1.5 rounded" onClick={() => { setShowEmailDialog(false); showToast('Email draft saved locally'); }}>Save draft</button>
            <span className="text-xs text-[#5F6368] self-center">Sandbox draft only</span>
          </div>
        </div>
      )}

      {showVersionHistory && (
        <div className="fixed inset-y-0 right-0 z-[9998] w-[360px] bg-white shadow-xl border-l border-[#DADCE0] p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium">Version history</h2>
            <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setShowVersionHistory(false)}><X size={18} /></button>
          </div>
          {[...state.undoStack].reverse().slice(0, 12).map((entry, index) => (
            <div key={`${entry.timestamp}-${index}`} className="py-3 border-b border-[#F1F3F4]">
              <div className="text-sm text-[#202124]">{entry.action}</div>
              <div className="text-xs text-[#5F6368]">{new Date(entry.timestamp).toLocaleString()}</div>
            </div>
          ))}
          {state.undoStack.length === 0 && <div className="text-sm text-[#5F6368]">No edits yet.</div>}
        </div>
      )}

      {showNotificationDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[420px] p-5 border border-[#DADCE0]">
            <h2 className="text-lg mb-4">Notification settings</h2>
            <label className="flex items-center gap-2 text-sm mb-3"><input type="checkbox" defaultChecked /> Edits to this spreadsheet</label>
            <label className="flex items-center gap-2 text-sm mb-5"><input type="checkbox" /> Comments and mentions</label>
            <div className="text-right"><button className="bg-[#1A73E8] text-white px-4 py-2 rounded text-sm" onClick={() => setShowNotificationDialog(false)}>Save</button></div>
          </div>
        </div>
      )}

      {showShortcutsDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[520px] p-5 border border-[#DADCE0]">
            <div className="flex justify-between mb-4"><h2 className="text-lg">Keyboard shortcuts</h2><button onClick={() => setShowShortcutsDialog(false)}><X size={18} /></button></div>
            {['Ctrl+C Copy', 'Ctrl+V Paste', 'Ctrl+Z Undo', 'Ctrl+F Find', 'Ctrl+H Find and replace', 'F2 Edit active cell'].map(item => (
              <div key={item} className="py-2 border-b border-[#F1F3F4] text-sm">{item}</div>
            ))}
          </div>
        </div>
      )}

      {showAddOnsDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[520px] p-5 border border-[#DADCE0]">
            <div className="flex justify-between mb-4"><h2 className="text-lg">Add-ons</h2><button onClick={() => setShowAddOnsDialog(false)}><X size={18} /></button></div>
            {['AppSheet', 'Apps Script', 'Form Builder'].map(name => (
              <button key={name} className="w-full text-left px-3 py-3 rounded hover:bg-[#F1F3F4]" onClick={() => showToast(`${name} opened in sandbox mode`)}>{name}</button>
            ))}
          </div>
        </div>
      )}

      <ChartModal
        isOpen={showChartModal}
        onClose={() => setShowChartModal(false)}
        sheet={activeSheet}
        selectionRange={state.selectionRange}
      />
    </div>
  );
};
