import React, { useRef, useState, useCallback, useEffect } from 'react';
import { STICKY_COLORS } from '../utils/dataManager.js';

function getStickyColor(colorKey) {
  return STICKY_COLORS[colorKey] || colorKey || '#fff9b1';
}

// Clip path definitions for shapes
const CLIP_PATHS = {
  triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  rhombus: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  octagon: 'polygon(29% 0%, 71% 0%, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0% 71%, 0% 29%)',
  parallelogram: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
  cross: 'polygon(33% 0%, 67% 0%, 67% 33%, 100% 33%, 100% 67%, 67% 67%, 67% 100%, 33% 100%, 33% 67%, 0% 67%, 0% 33%, 33% 33%)',
  right_arrow: 'polygon(0% 20%, 70% 20%, 70% 0%, 100% 50%, 70% 100%, 70% 80%, 0% 80%)',
  left_arrow: 'polygon(30% 0%, 30% 20%, 100% 20%, 100% 80%, 30% 80%, 30% 100%, 0% 50%)',
};

export default function Canvas({
  items,
  zoom,
  panX,
  panY,
  activeTool,
  selectedItemIds,
  onCanvasClick,
  onSelectItem,
  onMoveItem,
  onResizeItem,
  onDeleteItems,
  onUpdateItem,
  onZoom,
  onPan,
  onSetActiveTool,
  boardId,
  dispatch,
  clipboard,
  onCopy,
  onPaste,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  connectorStart,
  onConnectorItemClick,
}) {
  const canvasRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragItemId, setDragItemId] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragItemStart, setDragItemStart] = useState({ x: 0, y: 0 });
  const [spaceDown, setSpaceDown] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Selection rectangle
  const [selectionRect, setSelectionRect] = useState(null);
  const [selectionStart, setSelectionStart] = useState(null);

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [resizeStart, setResizeStart] = useState(null);
  const [resizeItemStart, setResizeItemStart] = useState(null);

  // Context menu
  const [contextMenu, setContextMenu] = useState(null);

  // Context toolbar color picker
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Space key for panning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.target.isContentEditable && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSpaceDown(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setSpaceDown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Close context menu on any click
  useEffect(() => {
    if (contextMenu) {
      const handleClick = () => setContextMenu(null);
      setTimeout(() => window.addEventListener('click', handleClick), 0);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Wheel zoom
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newZoom = Math.min(4, Math.max(0.1, zoom + delta));
      onZoom(newZoom);
    } else {
      onPan(-e.deltaX, -e.deltaY);
    }
  }, [zoom, onZoom, onPan]);

  useEffect(() => {
    const el = canvasRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const clientToCanvas = useCallback((clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - panX) / zoom,
      y: (clientY - rect.top - panY) / zoom,
    };
  }, [panX, panY, zoom]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.canvas-item') || e.target.closest('.context-toolbar') || e.target.closest('.canvas-context-menu')) return;

    // Close context menu
    setContextMenu(null);
    setShowColorPicker(false);

    if (e.button === 1 || spaceDown || activeTool === 'hand') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      return;
    }

    if (activeTool !== 'select') {
      const { x, y } = clientToCanvas(e.clientX, e.clientY);
      onCanvasClick(x, y);
      return;
    }

    // Start selection rectangle (or deselect)
    if (activeTool === 'select') {
      const { x, y } = clientToCanvas(e.clientX, e.clientY);
      setSelectionStart({ x, y, clientX: e.clientX, clientY: e.clientY });
      setSelectionRect(null);
      // Deselect if not shift
      if (!e.shiftKey) {
        onCanvasClick(0, 0);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      onPan(dx, dy);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isResizing && resizeHandle && resizeItemStart) {
      const dx = (e.clientX - resizeStart.x) / zoom;
      const dy = (e.clientY - resizeStart.y) / zoom;
      const item = resizeItemStart;
      let newWidth = item.width;
      let newHeight = item.height;
      let newX = item.x;
      let newY = item.y;

      const handle = resizeHandle;
      if (handle.includes('e')) {
        newWidth = Math.max(40, item.width + dx);
        newX = item.x + (newWidth - item.width) / 2;
      }
      if (handle.includes('w')) {
        newWidth = Math.max(40, item.width - dx);
        newX = item.x - (newWidth - item.width) / 2;
      }
      if (handle.includes('s')) {
        newHeight = Math.max(40, item.height + dy);
        newY = item.y + (newHeight - item.height) / 2;
      }
      if (handle.includes('n')) {
        newHeight = Math.max(40, item.height - dy);
        newY = item.y - (newHeight - item.height) / 2;
      }

      onResizeItem(resizeItemStart.id, newWidth, newHeight, newX, newY);
      return;
    }

    if (isDragging && dragItemId) {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      onMoveItem(dragItemId, dragItemStart.x + dx, dragItemStart.y + dy);
      return;
    }

    // Selection rectangle
    if (selectionStart && activeTool === 'select') {
      const { x, y } = clientToCanvas(e.clientX, e.clientY);
      const sx = Math.min(selectionStart.x, x);
      const sy = Math.min(selectionStart.y, y);
      const sw = Math.abs(x - selectionStart.x);
      const sh = Math.abs(y - selectionStart.y);
      if (sw > 5 || sh > 5) {
        setSelectionRect({ x: sx, y: sy, width: sw, height: sh });
      }
    }
  };

  const handleMouseUp = (e) => {
    // Complete selection rectangle
    if (selectionRect && selectionRect.width > 5 && selectionRect.height > 5) {
      const selected = items.filter(item => {
        if (item.type === 'connector') return false;
        const il = item.x - item.width / 2;
        const it = item.y - item.height / 2;
        const ir = item.x + item.width / 2;
        const ib = item.y + item.height / 2;
        return il < selectionRect.x + selectionRect.width &&
               ir > selectionRect.x &&
               it < selectionRect.y + selectionRect.height &&
               ib > selectionRect.y;
      }).map(i => i.id);
      if (selected.length > 0) {
        onSelectItem(selected, true);
      }
    }

    setIsPanning(false);
    setIsDragging(false);
    setDragItemId(null);
    setIsResizing(false);
    setResizeHandle(null);
    setResizeStart(null);
    setResizeItemStart(null);
    setSelectionRect(null);
    setSelectionStart(null);
  };

  const handleItemMouseDown = (e, item) => {
    e.stopPropagation();
    if (editingItemId === item.id) return;

    // Connector tool: clicking on an item
    if (activeTool === 'connector' && onConnectorItemClick && item.type !== 'connector') {
      // Determine snap side based on click position relative to item center
      const rect = e.currentTarget.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      let snapTo = 'right';
      if (relX < 0.25) snapTo = 'left';
      else if (relX > 0.75) snapTo = 'right';
      else if (relY < 0.5) snapTo = 'top';
      else snapTo = 'bottom';
      onConnectorItemClick(item.id, snapTo);
      return;
    }

    if (activeTool !== 'select') return;
    if (item.locked) return;

    setContextMenu(null);
    setShowColorPicker(false);

    onSelectItem(item.id, e.shiftKey);
    setIsDragging(true);
    setDragItemId(item.id);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragItemStart({ x: item.x, y: item.y });
  };

  const handleItemDoubleClick = (e, item) => {
    e.stopPropagation();
    if (item.locked) return;
    if (item.type === 'connector') return;

    const content = item.type === 'frame' ? (item.title || '') : (item.content || '');
    setEditingItemId(item.id);
    setEditValue(content);
    setShowColorPicker(false);
  };

  const handleEditBlur = (item) => {
    if (editingItemId === item.id) {
      if (item.type === 'frame') {
        onUpdateItem(item.id, { title: editValue });
      } else {
        onUpdateItem(item.id, { content: editValue });
      }
      setEditingItemId(null);
      setEditValue('');
    }
  };

  const handleEditKeyDown = (e, item) => {
    if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditValue('');
    }
  };

  const handleResizeHandleMouseDown = (e, handle, item) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setResizeItemStart({ ...item });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      isOnItem: false,
    });
  };

  const handleItemContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedItemIds.includes(item.id)) {
      onSelectItem(item.id, false);
    }
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      isOnItem: true,
    });
  };

  const getCursorStyle = () => {
    if (isPanning || spaceDown) return 'grab';
    if (activeTool !== 'select') return 'crosshair';
    return 'default';
  };

  // Sort items by zIndex for rendering
  const sortedItems = [...items].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // Get selected items for context toolbar
  const selectedItems = items.filter(i => selectedItemIds.includes(i.id));
  const showContextToolbar = selectedItems.length > 0 && !isResizing && !isDragging && activeTool === 'select';

  // Compute context toolbar position (above the first selected item)
  let toolbarX = 0, toolbarY = 0;
  if (showContextToolbar) {
    let minY = Infinity, minX = Infinity, maxX = -Infinity;
    selectedItems.forEach(item => {
      const top = item.y - item.height / 2;
      const left = item.x - item.width / 2;
      const right = item.x + item.width / 2;
      if (top < minY) minY = top;
      if (left < minX) minX = left;
      if (right > maxX) maxX = right;
    });
    toolbarX = (minX + maxX) / 2 * zoom + panX;
    toolbarY = minY * zoom + panY - 52;
  }

  return (
    <div
      ref={canvasRef}
      className="canvas-area"
      style={{ cursor: getCursorStyle() }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      <div
        className="canvas-transform"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {sortedItems.map(item => {
          const isSelected = selectedItemIds.includes(item.id);
          const isEditing = editingItemId === item.id;
          return (
            <CanvasItem
              key={item.id}
              item={item}
              isSelected={isSelected}
              isEditing={isEditing}
              editValue={editValue}
              onEditChange={setEditValue}
              onEditBlur={() => handleEditBlur(item)}
              onEditKeyDown={(e) => handleEditKeyDown(e, item)}
              onMouseDown={(e) => handleItemMouseDown(e, item)}
              onDoubleClick={(e) => handleItemDoubleClick(e, item)}
              onContextMenu={(e) => handleItemContextMenu(e, item)}
              onResizeHandleMouseDown={handleResizeHandleMouseDown}
              allItems={items}
              zoom={zoom}
            />
          );
        })}

        {/* Selection rectangle */}
        {selectionRect && (
          <div
            className="selection-rect"
            style={{
              position: 'absolute',
              left: selectionRect.x,
              top: selectionRect.y,
              width: selectionRect.width,
              height: selectionRect.height,
            }}
          />
        )}
      </div>

      {/* Context Toolbar */}
      {showContextToolbar && !editingItemId && (
        <ContextToolbar
          items={selectedItems}
          x={toolbarX}
          y={toolbarY}
          onUpdateItem={onUpdateItem}
          showColorPicker={showColorPicker}
          onToggleColorPicker={() => setShowColorPicker(!showColorPicker)}
        />
      )}

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          className="canvas-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.isOnItem ? (
            <>
              <button className="ctx-menu-item" onClick={() => { onCopy(); setContextMenu(null); }}>
                <span className="ctx-menu-icon">&#x2398;</span>Copy
                <span className="ctx-menu-shortcut">Ctrl+C</span>
              </button>
              <button className="ctx-menu-item" onClick={() => { onPaste(); setContextMenu(null); }}>
                <span className="ctx-menu-icon">&#x2399;</span>Paste
                <span className="ctx-menu-shortcut">Ctrl+V</span>
              </button>
              <button className="ctx-menu-item" onClick={() => { onDuplicate(); setContextMenu(null); }}>
                <span className="ctx-menu-icon">&#x29C9;</span>Duplicate
                <span className="ctx-menu-shortcut">Ctrl+D</span>
              </button>
              <div className="ctx-menu-divider" />
              <button className="ctx-menu-item" onClick={() => { onBringToFront(); setContextMenu(null); }}>
                <span className="ctx-menu-icon">&#x2B06;</span>Bring to front
              </button>
              <button className="ctx-menu-item" onClick={() => { onSendToBack(); setContextMenu(null); }}>
                <span className="ctx-menu-icon">&#x2B07;</span>Send to back
              </button>
              <div className="ctx-menu-divider" />
              <button className="ctx-menu-item" onClick={() => {
                selectedItemIds.forEach(id => {
                  const itm = items.find(i => i.id === id);
                  if (itm) onUpdateItem(id, { locked: !itm.locked });
                });
                setContextMenu(null);
              }}>
                <span className="ctx-menu-icon">&#x1F512;</span>
                {selectedItems.some(i => i.locked) ? 'Unlock' : 'Lock'}
              </button>
              <div className="ctx-menu-divider" />
              <button className="ctx-menu-item danger" onClick={() => { onDeleteItems(); setContextMenu(null); }}>
                <span className="ctx-menu-icon">&#x1F5D1;</span>Delete
              </button>
            </>
          ) : (
            <>
              {clipboard && clipboard.length > 0 && (
                <button className="ctx-menu-item" onClick={() => { onPaste(); setContextMenu(null); }}>
                  <span className="ctx-menu-icon">&#x2399;</span>Paste
                  <span className="ctx-menu-shortcut">Ctrl+V</span>
                </button>
              )}
              {clipboard && clipboard.length > 0 && <div className="ctx-menu-divider" />}
              <button className="ctx-menu-item" onClick={() => {
                const allIds = items.filter(i => i.type !== 'connector').map(i => i.id);
                onSelectItem(allIds, true);
                setContextMenu(null);
              }}>
                <span className="ctx-menu-icon">&#x2610;</span>Select all
                <span className="ctx-menu-shortcut">Ctrl+A</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// --- Context Toolbar ---
function ContextToolbar({ items, x, y, onUpdateItem, showColorPicker, onToggleColorPicker }) {
  const item = items[0];
  if (!item) return null;

  const stickyColorOptions = [
    'white', 'light_yellow', 'yellow', 'orange',
    'lime', 'yellow_green', 'green', 'cyan',
    'light_pink', 'pink', 'violet', 'red',
    'light_blue', 'sky_blue', 'blue', 'black',
  ];

  const handleColorSelect = (colorKey) => {
    items.forEach(i => {
      if (i.type === 'sticky_note') {
        onUpdateItem(i.id, { style: { ...i.style, fillColor: colorKey } });
      } else if (i.type === 'shape') {
        onUpdateItem(i.id, { style: { ...i.style, fillColor: getStickyColor(colorKey) } });
      }
    });
  };

  const handleBold = () => {
    items.forEach(i => {
      if (i.style) {
        onUpdateItem(i.id, { style: { ...i.style, bold: !i.style.bold } });
      }
    });
  };

  const handleTextAlign = (align) => {
    items.forEach(i => {
      if (i.style) {
        onUpdateItem(i.id, { style: { ...i.style, textAlign: align } });
      }
    });
  };

  const handleFontSizeChange = (delta) => {
    items.forEach(i => {
      if (i.style && typeof i.style.fontSize === 'number') {
        const newSize = Math.max(8, Math.min(144, (i.style.fontSize || 14) + delta));
        onUpdateItem(i.id, { style: { ...i.style, fontSize: newSize } });
      } else if (i.style && i.type === 'sticky_note') {
        // sticky notes use 'auto' by default but we can set a numeric size
        const current = typeof i.style.fontSize === 'number' ? i.style.fontSize : 14;
        const newSize = Math.max(8, Math.min(72, current + delta));
        onUpdateItem(i.id, { style: { ...i.style, fontSize: newSize } });
      }
    });
  };

  const currentColor = item.type === 'sticky_note'
    ? (item.style?.fillColor || 'light_yellow')
    : (item.style?.fillColor || '#ffffff');
  const displayColor = getStickyColor(currentColor);

  return (
    <div
      className="context-toolbar"
      style={{ left: x, top: Math.max(8, y), transform: 'translateX(-50%)' }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {(item.type === 'sticky_note' || item.type === 'shape') && (
        <>
          <div className="ct-color-btn-wrapper">
            <button
              className="ct-btn ct-color-btn"
              title="Fill color"
              onClick={onToggleColorPicker}
            >
              <span className="ct-color-swatch" style={{ backgroundColor: displayColor, border: currentColor === 'white' || displayColor === '#ffffff' ? '1px solid #ccc' : 'none' }} />
            </button>
            {showColorPicker && (
              <div className="ct-color-picker" onMouseDown={(e) => e.stopPropagation()}>
                {stickyColorOptions.map(c => (
                  <button
                    key={c}
                    className={`ct-color-option ${currentColor === c ? 'active' : ''}`}
                    style={{ backgroundColor: getStickyColor(c) }}
                    onClick={() => { handleColorSelect(c); onToggleColorPicker(); }}
                    title={c.replace(/_/g, ' ')}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="ct-divider" />
        </>
      )}
      <button className="ct-btn" title="Bold" onClick={handleBold} style={{ fontWeight: item.style?.bold ? 'bold' : 'normal' }}>B</button>
      <button className="ct-btn" title="Decrease font size" onClick={() => handleFontSizeChange(-2)} style={{ fontSize: 12 }}>A-</button>
      <button className="ct-btn" title="Increase font size" onClick={() => handleFontSizeChange(2)} style={{ fontSize: 12 }}>A+</button>
      <button className="ct-btn" title="Align left" onClick={() => handleTextAlign('left')}>
        <svg width="14" height="14" viewBox="0 0 14 14"><line x1="1" y1="2" x2="13" y2="2" stroke="currentColor" strokeWidth="1.5"/><line x1="1" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="1.5"/><line x1="1" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth="1.5"/></svg>
      </button>
      <button className="ct-btn" title="Align center" onClick={() => handleTextAlign('center')}>
        <svg width="14" height="14" viewBox="0 0 14 14"><line x1="1" y1="2" x2="13" y2="2" stroke="currentColor" strokeWidth="1.5"/><line x1="3" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5"/><line x1="2" y1="10" x2="12" y2="10" stroke="currentColor" strokeWidth="1.5"/></svg>
      </button>
      <button className="ct-btn" title="Align right" onClick={() => handleTextAlign('right')}>
        <svg width="14" height="14" viewBox="0 0 14 14"><line x1="1" y1="2" x2="13" y2="2" stroke="currentColor" strokeWidth="1.5"/><line x1="5" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.5"/><line x1="3" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5"/></svg>
      </button>

      {item.type === 'text' && (
        <>
          <div className="ct-divider" />
          <button className="ct-btn" title="Italic" onClick={() => {
            items.forEach(i => {
              if (i.style) onUpdateItem(i.id, { style: { ...i.style, italic: !i.style.italic } });
            });
          }} style={{ fontStyle: item.style?.italic ? 'italic' : 'normal' }}>I</button>
          <button className="ct-btn" title="Underline" onClick={() => {
            items.forEach(i => {
              if (i.style) onUpdateItem(i.id, { style: { ...i.style, underline: !i.style.underline } });
            });
          }} style={{ textDecoration: item.style?.underline ? 'underline' : 'none' }}>U</button>
        </>
      )}

      {item.type === 'shape' && (
        <>
          <div className="ct-divider" />
          <select
            className="ct-select"
            value={item.style?.borderStyle || 'normal'}
            onChange={(e) => {
              items.forEach(i => {
                if (i.style) onUpdateItem(i.id, { style: { ...i.style, borderStyle: e.target.value } });
              });
            }}
          >
            <option value="normal">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </>
      )}
    </div>
  );
}

// --- Canvas Item Router ---
function CanvasItem({ item, isSelected, isEditing, editValue, onEditChange, onEditBlur, onEditKeyDown, onMouseDown, onDoubleClick, onContextMenu, onResizeHandleMouseDown, allItems, zoom }) {
  const common = { item, isSelected, isEditing, editValue, onEditChange, onEditBlur, onEditKeyDown, onMouseDown, onDoubleClick, onContextMenu, onResizeHandleMouseDown };

  switch (item.type) {
    case 'sticky_note':
      return <StickyNoteItem {...common} />;
    case 'shape':
      return <ShapeItem {...common} />;
    case 'text':
      return <TextItem {...common} />;
    case 'frame':
      return <FrameItem {...common} />;
    case 'connector':
      return <ConnectorItem item={item} isSelected={isSelected} onMouseDown={onMouseDown} onContextMenu={onContextMenu} allItems={allItems} />;
    default:
      return null;
  }
}

// --- Selection Handles ---
function SelectionHandles({ item, onResizeHandleMouseDown }) {
  const w = item.width;
  const h = item.height;
  const handleSize = 8;
  const hs = handleSize / 2;

  const handles = [
    { id: 'nw', x: -hs, y: -hs, cursor: 'nw-resize' },
    { id: 'n', x: w / 2 - hs, y: -hs, cursor: 'n-resize', small: true },
    { id: 'ne', x: w - hs, y: -hs, cursor: 'ne-resize' },
    { id: 'e', x: w - hs, y: h / 2 - hs, cursor: 'e-resize', small: true },
    { id: 'se', x: w - hs, y: h - hs, cursor: 'se-resize' },
    { id: 's', x: w / 2 - hs, y: h - hs, cursor: 's-resize', small: true },
    { id: 'sw', x: -hs, y: h - hs, cursor: 'sw-resize' },
    { id: 'w', x: -hs, y: h / 2 - hs, cursor: 'w-resize', small: true },
  ];

  return (
    <>
      {handles.map(h => (
        <div
          key={h.id}
          className={`resize-handle ${h.small ? 'small' : ''}`}
          style={{
            left: h.x,
            top: h.y,
            cursor: h.cursor,
          }}
          onMouseDown={(e) => onResizeHandleMouseDown(e, h.id, item)}
        />
      ))}
    </>
  );
}

// --- Sticky Note ---
function StickyNoteItem({ item, isSelected, isEditing, editValue, onEditChange, onEditBlur, onEditKeyDown, onMouseDown, onDoubleClick, onContextMenu, onResizeHandleMouseDown }) {
  const bgColor = getStickyColor(item.style?.fillColor);
  const textColor = item.style?.fillColor === 'black' ? '#ffffff' : '#1a1a1a';
  const editRef = useRef(null);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className={`canvas-item sticky-note-item ${isSelected ? 'selected' : ''} ${item.locked ? 'locked' : ''}`}
      style={{
        left: item.x - item.width / 2,
        top: item.y - item.height / 2,
        width: item.width,
        height: item.height,
        backgroundColor: bgColor,
        transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
        zIndex: item.zIndex || 1,
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      {isEditing ? (
        <textarea
          ref={editRef}
          className="item-edit-textarea"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditBlur}
          onKeyDown={onEditKeyDown}
          style={{
            color: textColor,
            textAlign: item.style?.textAlign || 'center',
          }}
        />
      ) : (
        <div className="sticky-note-content" style={{
          color: textColor,
          textAlign: item.style?.textAlign || 'center',
          justifyContent: item.style?.textAlignVertical === 'top' ? 'flex-start' : item.style?.textAlignVertical === 'bottom' ? 'flex-end' : 'center',
          fontWeight: item.style?.bold ? 'bold' : 'normal',
          fontSize: typeof item.style?.fontSize === 'number' ? item.style.fontSize : 14,
        }}>
          {item.content || (isSelected ? '' : '')}
        </div>
      )}
      {isSelected && !isEditing && <SelectionHandles item={item} onResizeHandleMouseDown={onResizeHandleMouseDown} />}
    </div>
  );
}

// --- Shape ---
function ShapeItem({ item, isSelected, isEditing, editValue, onEditChange, onEditBlur, onEditKeyDown, onMouseDown, onDoubleClick, onContextMenu, onResizeHandleMouseDown }) {
  const s = item.style || {};
  const editRef = useRef(null);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
    }
  }, [isEditing]);

  const borderRadius = item.shapeType === 'round_rectangle' ? 8
    : item.shapeType === 'circle' ? '50%'
    : 0;

  const clipPath = CLIP_PATHS[item.shapeType] || undefined;

  const borderStyle = s.borderStyle === 'dashed' ? 'dashed' : s.borderStyle === 'dotted' ? 'dotted' : 'solid';

  // For can (cylinder), use a simpler visual approach
  const isCan = item.shapeType === 'can';

  return (
    <div
      className={`canvas-item shape-item ${isSelected ? 'selected' : ''} ${item.locked ? 'locked' : ''}`}
      style={{
        left: item.x - item.width / 2,
        top: item.y - item.height / 2,
        width: item.width,
        height: item.height,
        backgroundColor: clipPath ? 'transparent' : (s.fillColor || '#ffffff'),
        opacity: s.fillOpacity ?? 1,
        border: clipPath ? 'none' : `${s.borderWidth || 2}px ${borderStyle} ${s.borderColor || '#1a1a1a'}`,
        borderRadius: clipPath ? 0 : borderRadius,
        transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
        zIndex: item.zIndex || 1,
        overflow: 'visible',
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      {clipPath && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: s.fillColor || '#ffffff',
          clipPath,
          border: `${s.borderWidth || 2}px ${borderStyle} ${s.borderColor || '#1a1a1a'}`,
        }} />
      )}
      {isCan && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox={`0 0 ${item.width} ${item.height}`}>
          <ellipse cx={item.width/2} cy={item.height*0.15} rx={item.width/2-2} ry={item.height*0.15} fill={s.fillColor || '#ffffff'} stroke={s.borderColor || '#1a1a1a'} strokeWidth={s.borderWidth || 2} />
          <rect x={2} y={item.height*0.15} width={item.width-4} height={item.height*0.7} fill={s.fillColor || '#ffffff'} />
          <line x1={2} y1={item.height*0.15} x2={2} y2={item.height*0.85} stroke={s.borderColor || '#1a1a1a'} strokeWidth={s.borderWidth || 2} />
          <line x1={item.width-2} y1={item.height*0.15} x2={item.width-2} y2={item.height*0.85} stroke={s.borderColor || '#1a1a1a'} strokeWidth={s.borderWidth || 2} />
          <ellipse cx={item.width/2} cy={item.height*0.85} rx={item.width/2-2} ry={item.height*0.15} fill={s.fillColor || '#ffffff'} stroke={s.borderColor || '#1a1a1a'} strokeWidth={s.borderWidth || 2} />
        </svg>
      )}
      {isEditing ? (
        <textarea
          ref={editRef}
          className="item-edit-textarea"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditBlur}
          onKeyDown={onEditKeyDown}
          style={{
            color: s.color || '#1a1a1a',
            fontSize: s.fontSize || 14,
            textAlign: s.textAlign || 'center',
            zIndex: 2,
            position: 'relative',
          }}
        />
      ) : (
        <div className="shape-content" style={{
          color: s.color || '#1a1a1a',
          fontSize: s.fontSize || 14,
          fontFamily: s.fontFamily || 'arial',
          textAlign: s.textAlign || 'center',
          justifyContent: s.textAlignVertical === 'top' ? 'flex-start' : s.textAlignVertical === 'bottom' ? 'flex-end' : 'center',
          position: 'relative',
          zIndex: 2,
        }}>
          {item.content}
        </div>
      )}
      {isSelected && !isEditing && <SelectionHandles item={item} onResizeHandleMouseDown={onResizeHandleMouseDown} />}
    </div>
  );
}

// --- Text ---
function TextItem({ item, isSelected, isEditing, editValue, onEditChange, onEditBlur, onEditKeyDown, onMouseDown, onDoubleClick, onContextMenu, onResizeHandleMouseDown }) {
  const s = item.style || {};
  const editRef = useRef(null);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className={`canvas-item text-item ${isSelected ? 'selected' : ''} ${item.locked ? 'locked' : ''}`}
      style={{
        left: item.x - item.width / 2,
        top: item.y - item.height / 2,
        width: item.width,
        minHeight: item.height,
        transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
        zIndex: item.zIndex || 1,
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      {isEditing ? (
        <textarea
          ref={editRef}
          className="item-edit-textarea text-edit"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditBlur}
          onKeyDown={onEditKeyDown}
          style={{
            color: s.color || '#1a1a1a',
            fontSize: s.fontSize || 24,
            fontFamily: s.fontFamily || 'arial',
            textAlign: s.textAlign || 'left',
            fontWeight: s.bold ? 'bold' : 'normal',
            fontStyle: s.italic ? 'italic' : 'normal',
          }}
        />
      ) : (
        <div className="text-content" style={{
          color: s.color || '#1a1a1a',
          fontSize: s.fontSize || 24,
          fontFamily: s.fontFamily || 'arial',
          textAlign: s.textAlign || 'left',
          fontWeight: s.bold ? 'bold' : 'normal',
          fontStyle: s.italic ? 'italic' : 'normal',
          textDecoration: [s.underline ? 'underline' : '', s.strikethrough ? 'line-through' : ''].join(' ').trim() || 'none',
        }}>
          {item.content}
        </div>
      )}
      {isSelected && !isEditing && <SelectionHandles item={item} onResizeHandleMouseDown={onResizeHandleMouseDown} />}
    </div>
  );
}

// --- Frame ---
function FrameItem({ item, isSelected, isEditing, editValue, onEditChange, onEditBlur, onEditKeyDown, onMouseDown, onDoubleClick, onContextMenu, onResizeHandleMouseDown }) {
  const s = item.style || {};
  const editRef = useRef(null);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className={`canvas-item frame-item ${isSelected ? 'selected' : ''} ${item.locked ? 'locked' : ''}`}
      style={{
        left: item.x - item.width / 2,
        top: item.y - item.height / 2,
        width: item.width,
        height: item.height,
        backgroundColor: s.fillColor || '#f5f5f5',
        transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
        zIndex: item.zIndex || 0,
      }}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
    >
      {isEditing ? (
        <input
          ref={editRef}
          className="frame-title-input"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditBlur}
          onKeyDown={onEditKeyDown}
        />
      ) : (
        <div className="frame-title" onDoubleClick={onDoubleClick}>{item.title}</div>
      )}
      {isSelected && !isEditing && <SelectionHandles item={item} onResizeHandleMouseDown={onResizeHandleMouseDown} />}
    </div>
  );
}

// --- Connector ---
function ConnectorItem({ item, isSelected, onMouseDown, onContextMenu, allItems }) {
  const s = item.style || {};

  let startX = 0, startY = 0, endX = 100, endY = 100;

  if (item.start?.itemId) {
    const startItem = allItems.find(i => i.id === item.start.itemId);
    if (startItem) {
      const snap = item.start.snapTo;
      if (snap === 'right') { startX = startItem.x + startItem.width / 2; startY = startItem.y; }
      else if (snap === 'left') { startX = startItem.x - startItem.width / 2; startY = startItem.y; }
      else if (snap === 'top') { startX = startItem.x; startY = startItem.y - startItem.height / 2; }
      else if (snap === 'bottom') { startX = startItem.x; startY = startItem.y + startItem.height / 2; }
      else { startX = startItem.x; startY = startItem.y; }
    }
  } else if (item.start?.absoluteX !== undefined) {
    startX = item.start.absoluteX;
    startY = item.start.absoluteY;
  }

  if (item.end?.itemId) {
    const endItem = allItems.find(i => i.id === item.end.itemId);
    if (endItem) {
      const snap = item.end.snapTo;
      if (snap === 'right') { endX = endItem.x + endItem.width / 2; endY = endItem.y; }
      else if (snap === 'left') { endX = endItem.x - endItem.width / 2; endY = endItem.y; }
      else if (snap === 'top') { endX = endItem.x; endY = endItem.y - endItem.height / 2; }
      else if (snap === 'bottom') { endX = endItem.x; endY = endItem.y + endItem.height / 2; }
      else { endX = endItem.x; endY = endItem.y; }
    }
  } else if (item.end?.absoluteX !== undefined) {
    endX = item.end.absoluteX;
    endY = item.end.absoluteY;
  }

  const padding = 20;
  const minX = Math.min(startX, endX) - padding;
  const minY = Math.min(startY, endY) - padding;
  const maxX = Math.max(startX, endX) + padding;
  const maxY = Math.max(startY, endY) + padding;
  const width = maxX - minX;
  const height = maxY - minY;

  const sx = startX - minX;
  const sy = startY - minY;
  const ex = endX - minX;
  const ey = endY - minY;

  let pathD;
  if (item.shape === 'elbowed') {
    const midX = (sx + ex) / 2;
    pathD = `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ey} L ${ex} ${ey}`;
  } else if (item.shape === 'curved') {
    const cx1 = sx + (ex - sx) * 0.4;
    const cx2 = sx + (ex - sx) * 0.6;
    pathD = `M ${sx} ${sy} C ${cx1} ${sy}, ${cx2} ${ey}, ${ex} ${ey}`;
  } else {
    pathD = `M ${sx} ${sy} L ${ex} ${ey}`;
  }

  const strokeDash = s.strokeStyle === 'dashed' ? '8 4' : s.strokeStyle === 'dotted' ? '2 4' : undefined;
  const markerId = `arrow-${item.id}`;

  const caption = item.captions?.[0];
  const captionX = (startX + endX) / 2;
  const captionY = (startY + endY) / 2;

  return (
    <>
      <svg
        className={`canvas-item connector-item ${isSelected ? 'selected' : ''}`}
        style={{
          position: 'absolute',
          left: minX,
          top: minY,
          width,
          height,
          zIndex: item.zIndex || 5,
          overflow: 'visible',
          pointerEvents: 'all',
          cursor: 'pointer',
        }}
        onMouseDown={onMouseDown}
        onContextMenu={onContextMenu}
      >
        <defs>
          {(s.endStrokeCap === 'stealth' || s.endStrokeCap === 'filled_triangle' || s.endStrokeCap === 'arrow') && (
            <marker id={markerId} markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
              <path d="M 0 0 L 10 4 L 0 8 L 3 4 Z" fill={isSelected ? '#4262ff' : (s.strokeColor || '#000')} />
            </marker>
          )}
        </defs>
        <path
          d={pathD}
          stroke={isSelected ? '#4262ff' : (s.strokeColor || '#000')}
          strokeWidth={Math.max((s.strokeWidth || 2), 2)}
          fill="none"
          strokeDasharray={strokeDash}
          markerEnd={(s.endStrokeCap && s.endStrokeCap !== 'none') ? `url(#${markerId})` : undefined}
          style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        />
        {/* Invisible wider path for easier clicking */}
        <path
          d={pathD}
          stroke="transparent"
          strokeWidth={12}
          fill="none"
          style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        />
      </svg>
      {caption && (
        <div
          className="connector-caption"
          style={{
            position: 'absolute',
            left: captionX,
            top: captionY - 12,
            transform: 'translateX(-50%)',
            zIndex: (item.zIndex || 5) + 1,
          }}
        >
          {caption.content}
        </div>
      )}
    </>
  );
}
