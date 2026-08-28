import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { CellData } from '../../utils/types';

interface CellProps {
  id: string;
  data?: CellData;
  isSelected: boolean;
  isInRange: boolean;
  isSearchMatch?: boolean;
  isCurrentSearchMatch?: boolean;
  isClipboard?: boolean;
  showGridlines?: boolean;
  colWidth?: number;
  rowHeight?: number;
  forceEditMode?: boolean;
  onSelect: (id: string, isShift: boolean) => void;
  onUpdate: (id: string, value: string) => void;
  onRangeStart: (id: string) => void;
  onRangeEnter: (id: string) => void;
  onContextMenu?: (id: string, e: React.MouseEvent) => void;
  onEnterCommit?: (id: string, value: string) => void;
  onTabCommit?: (id: string, value: string, shiftKey: boolean) => void;
  onEscapeEdit?: () => void;
  onEditValueChange?: (value: string) => void;
}

export const Cell: React.FC<CellProps> = React.memo(({
  id, data, isSelected, isInRange, isSearchMatch, isCurrentSearchMatch, isClipboard,
  showGridlines = true, colWidth = 80, rowHeight = 24,
  forceEditMode,
  onSelect, onUpdate, onRangeStart, onRangeEnter, onContextMenu,
  onEnterCommit, onTabCommit, onEscapeEdit, onEditValueChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  // Synchronous guard so a rapid key stream (e.g. pyautogui.typewrite at
  // 10ms interval) only seeds edit mode once; subsequent keys must land in
  // the now-focused <input> via onChange, not re-seed editValue.
  const seedingRef = useRef(false);

  // Enter edit mode when forceEditMode is activated (F2 key from outside)
  useEffect(() => {
    if (forceEditMode && isSelected && !isEditing) {
      setEditValue(data?.formula || '');
      setIsEditing(true);
    }
  }, [forceEditMode]);

  // Selecting a cell + typing a printable char should enter edit mode with
  // that char as the initial value (real Google Sheets behavior). Previously
  // the mock only entered edit mode via double-click / F2, so single-click +
  // typewrite did nothing — agents got stuck typing into a non-editing cell.
  useEffect(() => {
    if (!isSelected || isEditing) return;
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack keys meant for an already-focused input/textarea.
      const ae = document.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return; // only printable single chars
      if (seedingRef.current) return; // already seeding; let it bubble to input
      e.preventDefault();
      e.stopPropagation();
      seedingRef.current = true;
      setEditValue(e.key);
      setIsEditing(true);
    };
    // Capture phase so this runs before Spreadsheet's bubble-phase keydown.
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isSelected, isEditing]);

  // Focus the edit input synchronously after commit so a fast key stream
  // (10ms interval) lands in the input instead of being dropped.
  useLayoutEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end when F2 is used (don't select all)
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
    // Reset the seed guard only when leaving edit mode, so a rapid key
    // stream never re-seeds (overwriting) while the input owns the keys.
    if (!isEditing) {
      seedingRef.current = false;
    }
  }, [isEditing]);

  // When cell is deselected while editing, commit
  useEffect(() => {
    if (!isSelected && isEditing) {
      onUpdate(id, editValue);
      setIsEditing(false);
    }
  }, [isSelected]);

  const handleDoubleClick = () => {
    setEditValue(data?.formula || '');
    setIsEditing(true);
    // Place cursor at end after double-click
    setTimeout(() => {
      if (inputRef.current) {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }, 0);
  };

  const handleEditChange = (val: string) => {
    setEditValue(val);
    if (onEditValueChange) onEditValueChange(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onUpdate(id, editValue);
      setIsEditing(false);
      if (onEnterCommit) {
        onEnterCommit(id, editValue);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      if (onEscapeEdit) onEscapeEdit();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onUpdate(id, editValue);
      setIsEditing(false);
      if (onTabCommit) {
        onTabCommit(id, editValue, e.shiftKey);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) {
      if (e.shiftKey) {
        onSelect(id, true);
      } else {
        onRangeStart(id);
        onSelect(id, false);
      }
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      onRangeEnter(id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onContextMenu) onContextMenu(id, e);
  };

  // Compute display value
  let displayValue: string | number = data?.computed ?? data?.value ?? '';
  const isError = typeof displayValue === 'string' && (
    displayValue.startsWith('#ERROR') || displayValue.startsWith('#NAME') ||
    displayValue.startsWith('#REF') || displayValue.startsWith('#DIV') ||
    displayValue.startsWith('#VALUE') || displayValue.startsWith('#N/A')
  );

  if (!isError && typeof displayValue === 'number') {
    switch (data?.format) {
      case 'currency':
        displayValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(displayValue);
        break;
      case 'percent':
        displayValue = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(displayValue);
        break;
      case 'scientific':
        displayValue = displayValue.toExponential(2);
        break;
      case 'date': {
        const d = new Date((displayValue - 25569) * 86400000);
        displayValue = d.toLocaleDateString('en-US');
        break;
      }
      case 'time': {
        const totalSecs = Math.round((displayValue - Math.floor(displayValue)) * 86400);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        displayValue = `${h % 12 || 12}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${ampm}`;
        break;
      }
      default:
        displayValue = Number(displayValue).toLocaleString(undefined, { maximumFractionDigits: 6 });
    }
  } else if (!isError && data?.format === 'percent' && !isNaN(Number(displayValue))) {
    displayValue = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(Number(displayValue));
  }

  const cellStyle = data?.style || {};

  // Build background
  let bgColor: string;
  if (isError) {
    bgColor = '#FEF2F2';
  } else if (isCurrentSearchMatch) {
    bgColor = '#FBBC04';
  } else if (isSearchMatch) {
    bgColor = '#FEF7CD';
  } else if (isInRange && !isSelected) {
    bgColor = 'rgba(26,115,232,0.1)';
  } else if (cellStyle.bg) {
    bgColor = cellStyle.bg;
  } else {
    bgColor = 'white';
  }

  // Text alignment: numbers right by default, else left
  const defaultAlign = typeof (data?.computed ?? data?.value) === 'number' || !isNaN(Number(data?.value)) && data?.value !== ''
    ? 'right'
    : 'left';
  const textAlign = cellStyle.align || (data?.format === 'currency' || data?.format === 'percent' || data?.format === 'number' ? 'right' : defaultAlign);

  // Hide merged-into cells
  if (data?.mergedWith) {
    return (
      <div
        style={{
          width: colWidth,
          minWidth: colWidth,
          height: rowHeight,
          flexShrink: 0,
          display: 'none',
        }}
      />
    );
  }

  // Compute merged cell span dimensions
  const mergeColSpan = data?.isMergeAnchor && data.mergeSpan ? data.mergeSpan.cols : 1;
  const mergeRowSpan = data?.isMergeAnchor && data.mergeSpan ? data.mergeSpan.rows : 1;

  return (
    <div
      className={`relative border-r border-b ${isSelected ? 'overflow-visible' : 'overflow-hidden'}${isClipboard ? ' marching-ants' : ''}`}
      style={{
        borderColor: showGridlines ? '#E1E3E6' : 'transparent',
        backgroundColor: bgColor,
        color: isError ? '#DC2626' : (cellStyle.color || '#202124'),
        width: colWidth * mergeColSpan,
        minWidth: colWidth,
        height: rowHeight * mergeRowSpan,
        flexShrink: 0,
        outline: isSelected ? '2px solid #1A73E8' : undefined,
        outlineOffset: isSelected ? '-2px' : undefined,
        zIndex: isSelected ? 15 : (data?.isMergeAnchor ? 2 : 1),
        fontSize: cellStyle.fontSize ? `${cellStyle.fontSize}px` : undefined,
        fontFamily: cellStyle.fontFamily || undefined,
        fontWeight: cellStyle.bold ? 'bold' : undefined,
        fontStyle: cellStyle.italic ? 'italic' : undefined,
        textDecoration: [
          cellStyle.underline ? 'underline' : '',
          cellStyle.strikethrough ? 'line-through' : '',
        ].filter(Boolean).join(' ') || undefined,
        textAlign,
        cursor: 'cell',
        // Border styles
        borderTopWidth: cellStyle.borders?.top ? cellStyle.borders.top.width || 1 : undefined,
        borderTopColor: cellStyle.borders?.top?.color,
        borderTopStyle: cellStyle.borders?.top?.style as any,
        borderBottomWidth: cellStyle.borders?.bottom ? cellStyle.borders.bottom.width || 1 : undefined,
        borderBottomColor: cellStyle.borders?.bottom?.color,
        borderBottomStyle: cellStyle.borders?.bottom?.style as any,
        borderLeftWidth: cellStyle.borders?.left ? cellStyle.borders.left.width || 1 : undefined,
        borderLeftColor: cellStyle.borders?.left?.color,
        borderLeftStyle: cellStyle.borders?.left?.style as any,
        borderRightWidth: cellStyle.borders?.right ? cellStyle.borders.right.width || 1 : undefined,
        borderRightColor: cellStyle.borders?.right?.color,
        borderRightStyle: cellStyle.borders?.right?.style as any,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="absolute inset-0 w-full h-full px-1 outline-none bg-white z-20 text-[#202124]"
          style={{ border: '2px solid #1A73E8', fontSize: 'inherit', fontFamily: 'inherit' }}
          value={editValue}
          onChange={(e) => handleEditChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            onUpdate(id, editValue);
            setIsEditing(false);
          }}
        />
      ) : (
        <span
          className="px-1 pointer-events-none block truncate"
          style={{
            lineHeight: `${rowHeight}px`,
            height: rowHeight,
          }}
        >
          {String(displayValue)}
        </span>
      )}

      {/* Fill handle */}
      {isSelected && !isEditing && (
        <div
          className="absolute bottom-[-4px] right-[-4px] w-3 h-3 bg-[#1A73E8] border-2 border-white cursor-crosshair z-30"
        />
      )}
    </div>
  );
}, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.isSelected === next.isSelected &&
    prev.isInRange === next.isInRange &&
    prev.isSearchMatch === next.isSearchMatch &&
    prev.isCurrentSearchMatch === next.isCurrentSearchMatch &&
    prev.isClipboard === next.isClipboard &&
    prev.showGridlines === next.showGridlines &&
    prev.colWidth === next.colWidth &&
    prev.rowHeight === next.rowHeight &&
    prev.forceEditMode === next.forceEditMode
  );
});
