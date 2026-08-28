import React, { useCallback, useState } from 'react';
import { Cell } from './Cell';
import { FilterDropdown } from './FilterDropdown';
import { Sheet } from '../../utils/types';
import { colIndexToLabel, getCellId, isInRange } from '../../utils/helpers';

interface GridProps {
  sheet: Sheet;
  selectedCell: string | null;
  selectionRange: string[] | null;
  clipboardSet?: Set<string>;
  searchMatches?: Set<string>;
  currentSearchMatch?: string | null;
  showGridlines?: boolean;
  editingCell?: string | null;
  forceEditMode?: boolean;
  onSelect: (id: string, isShift: boolean) => void;
  onUpdate: (id: string, value: string) => void;
  onRangeSelect: (range: string[]) => void;
  onContextMenu?: (cellId: string, type: 'cell' | 'row' | 'col', e: React.MouseEvent) => void;
  onColumnSelect?: (colIndex: number) => void;
  onRowSelect?: (rowIndex: number) => void;
  onSelectAll?: () => void;
  onResizeColumn?: (colIndex: number, width: number) => void;
  onResizeRow?: (rowIndex: number, height: number) => void;
  onEnterCommit?: (id: string, value: string) => void;
  onTabCommit?: (id: string, value: string, shiftKey: boolean) => void;
  onEscapeEdit?: () => void;
  onEditValueChange?: (value: string) => void;
  onSort?: (colLabel: string, direction: 'asc' | 'desc') => void;
  onFilterChange?: (colIndex: number, hiddenValues: string[]) => void;
}

export const Grid: React.FC<GridProps> = ({
  sheet, selectedCell, selectionRange, clipboardSet, searchMatches, currentSearchMatch,
  showGridlines = true, editingCell, forceEditMode, onSelect, onUpdate, onRangeSelect, onContextMenu,
  onColumnSelect, onRowSelect, onSelectAll, onResizeColumn, onResizeRow,
  onEnterCommit, onTabCommit, onEscapeEdit, onEditValueChange,
  onSort, onFilterChange,
}) => {
  const [dragStart, setDragStart] = useState<string | null>(null);

  const handleRangeStart = useCallback((id: string) => {
    setDragStart(id);
    onRangeSelect([id]);
  }, [onRangeSelect]);

  const handleRangeEnter = useCallback((id: string) => {
    if (dragStart) {
      onRangeSelect([dragStart, id]);
    }
  }, [dragStart, onRangeSelect]);

  const handleMouseUp = () => {
    setDragStart(null);
  };

  // Column resize handlers
  const handleColResizeMouseDown = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const startWidth = sheet.columnWidths?.[colIndex] || 80;
    const startX = e.clientX;

    const onMove = (ev: MouseEvent) => {
      const newWidth = Math.max(20, startWidth + (ev.clientX - startX));
      if (onResizeColumn) onResizeColumn(colIndex, newWidth);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // Row resize handlers
  const handleRowResizeMouseDown = (e: React.MouseEvent, rowIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const startHeight = sheet.rowHeights?.[rowIndex] || 24;
    const startY = e.clientY;

    const onMove = (ev: MouseEvent) => {
      const newHeight = Math.max(12, startHeight + (ev.clientY - startY));
      if (onResizeRow) onResizeRow(rowIndex, newHeight);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const borderClass = showGridlines ? 'border-[#E1E3E6]' : 'border-transparent';
  const headerBorderClass = showGridlines ? 'border-[#E1E3E6]' : 'border-transparent';

  const hasFilter = !!sheet.filterRange;

  // Get unique values for a column (for filter dropdown)
  const getColumnUniqueValues = (colIndex: number): string[] => {
    const values = new Set<string>();
    for (let r = 1; r < sheet.rowCount; r++) { // skip header row (row 0)
      const id = getCellId(colIndex, r);
      const cell = sheet.data[id];
      const val = String(cell?.computed ?? cell?.value ?? '');
      values.add(val);
    }
    return Array.from(values).sort();
  };

  // Get hidden values for a column
  const getHiddenValues = (colIndex: number): string[] => {
    return (sheet.filterCriteria?.[colIndex] as string[]) || [];
  };

  // Check if a row is hidden by filter
  const isRowHidden = (rowIndex: number): boolean => {
    if (!hasFilter || rowIndex === 0) return false; // never hide header row
    if (!sheet.filterCriteria) return false;
    for (const [colIndexStr, hiddenVals] of Object.entries(sheet.filterCriteria)) {
      const colIndex = parseInt(colIndexStr);
      const id = getCellId(colIndex, rowIndex);
      const cell = sheet.data[id];
      const val = String(cell?.computed ?? cell?.value ?? '');
      if ((hiddenVals as string[]).includes(val)) return true;
    }
    return false;
  };

  // Render Column Headers
  const renderHeaders = () => (
    <div className="flex sticky top-0 z-30" style={{ backgroundColor: '#F8F9FA' }}>
      <div
        className={`w-[46px] h-[24px] border-r border-b ${headerBorderClass} flex-shrink-0 bg-[#F8F9FA] cursor-pointer select-none hover:bg-[#E8EAED] sticky left-0 z-40`}
        onClick={() => onSelectAll && onSelectAll()}
        onContextMenu={(e) => { e.preventDefault(); }}
      />
      {Array.from({ length: sheet.colCount }).map((_, i) => {
        const colLabel = colIndexToLabel(i);
        const colWidth = sheet.columnWidths?.[i] || 80;
        return (
          <div
            key={i}
            className={`h-[24px] border-r border-b ${headerBorderClass} flex items-center justify-center text-xs text-[#5F6368] select-none bg-[#F8F9FA] font-medium hover:bg-[#E8EAED] cursor-pointer relative z-30`}
            style={{ minWidth: colWidth, width: colWidth, flexShrink: 0 }}
            onClick={() => onColumnSelect && onColumnSelect(i)}
            onContextMenu={(e) => {
              e.preventDefault();
              if (onContextMenu) {
                const cellId = `${colLabel}1`;
                onContextMenu(cellId, 'col', e);
              }
            }}
          >
            {colLabel}
            {/* Column resize handle */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-40 hover:bg-[#1A73E8]"
              onMouseDown={(e) => handleColResizeMouseDown(e, i)}
            />
          </div>
        );
      })}
    </div>
  );

  // Render Rows
  const renderRows = () => {
    return Array.from({ length: sheet.rowCount }).map((_, r) => {
      const rowHeight = sheet.rowHeights?.[r] || 24;
      // Hide rows filtered out
      if (isRowHidden(r)) return null;

      const isHeaderRow = hasFilter && r === 0;

      return (
        <div key={r} className="flex">
          <div
            className={`w-[46px] border-r border-b ${borderClass} bg-[#F8F9FA] flex items-center justify-center text-xs text-[#5F6368] select-none sticky left-0 z-20 hover:bg-[#E8EAED] cursor-pointer relative`}
            style={{ height: rowHeight, flexShrink: 0 }}
            onClick={() => onRowSelect && onRowSelect(r)}
            onContextMenu={(e) => {
              e.preventDefault();
              if (onContextMenu) {
                const cellId = `A${r + 1}`;
                onContextMenu(cellId, 'row', e);
              }
            }}
          >
            {r + 1}
            {/* Row resize handle */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize z-40 hover:bg-[#1A73E8]"
              onMouseDown={(e) => handleRowResizeMouseDown(e, r)}
            />
          </div>
          {Array.from({ length: sheet.colCount }).map((_, c) => {
            const id = getCellId(c, r);
            const isSelected = selectedCell === id;
            const isRange = selectionRange ? isInRange(id, selectionRange[0], selectionRange[selectionRange.length - 1]) : false;
            const isSearchMatch = searchMatches ? searchMatches.has(id) : false;
            const isCurrentSearchMatch = currentSearchMatch === id;
            const isClipboard = clipboardSet ? clipboardSet.has(id) : false;
            const colWidth = sheet.columnWidths?.[c] || 80;

            return (
              <div key={id} className="relative" style={{ flexShrink: 0, zIndex: isSelected ? 15 : 1 }}>
                <Cell
                  id={id}
                  data={sheet.data[id]}
                  isSelected={isSelected}
                  isInRange={isRange}
                  isSearchMatch={isSearchMatch}
                  isCurrentSearchMatch={isCurrentSearchMatch}
                  isClipboard={isClipboard}
                  showGridlines={showGridlines}
                  colWidth={colWidth}
                  rowHeight={rowHeight}
                  forceEditMode={isSelected ? forceEditMode : false}
                  onSelect={onSelect}
                  onUpdate={onUpdate}
                  onRangeStart={handleRangeStart}
                  onRangeEnter={handleRangeEnter}
                  onContextMenu={(cellId, e) => {
                    if (onContextMenu) onContextMenu(cellId, 'cell', e);
                  }}
                  onEnterCommit={onEnterCommit}
                  onTabCommit={onTabCommit}
                  onEscapeEdit={onEscapeEdit}
                  onEditValueChange={onEditValueChange}
                />
                {/* Filter dropdown button for header row cells */}
                {isHeaderRow && hasFilter && (
                  <div className="absolute bottom-1 right-1 z-20">
                    <FilterDropdown
                      colIndex={c}
                      colLabel={colIndexToLabel(c)}
                      uniqueValues={getColumnUniqueValues(c)}
                      hiddenValues={getHiddenValues(c)}
                      onSort={(direction) => onSort && onSort(colIndexToLabel(c), direction)}
                      onFilterChange={(hiddenVals) => onFilterChange && onFilterChange(c, hiddenVals)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div
      className="flex-1 overflow-auto relative isolate"
      style={{ backgroundColor: 'white' }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="inline-block min-w-full">
        {renderHeaders()}
        {renderRows()}
      </div>
    </div>
  );
};
