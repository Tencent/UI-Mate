import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { generateId, STICKY_COLORS } from '../utils/dataManager.js';
import TopBar from '../components/TopBar.jsx';
import LeftToolbar from '../components/LeftToolbar.jsx';
import ZoomControls from '../components/ZoomControls.jsx';
import Canvas from '../components/Canvas.jsx';

const ZOOM_LEVELS = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];

export default function BoardView() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch, onUndo, onRedo } = useAppContext();
  const sid = searchParams.get('sid');
  const sidQuery = sid ? `?sid=${sid}` : '';

  const board = state.boards.find(b => b.id === boardId);
  const items = state.boardItems[boardId] || [];

  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [clipboard, setClipboard] = useState([]);

  // Connector tool: two-click state
  const [connectorStart, setConnectorStart] = useState(null); // { itemId, snapTo } or null

  // Keyboard shortcuts overlay
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Share dialog
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Navigate back if board not found
  useEffect(() => {
    if (!board) {
      navigate(`/${sidQuery}`);
    }
  }, [board, navigate, sidQuery]);

  const handleGoHome = () => {
    navigate(`/${sidQuery}`);
  };

  const handleBoardNameChange = (name) => {
    dispatch({ type: 'UPDATE_BOARD', payload: { id: boardId, changes: { name } } });
  };

  const handleZoomIn = () => {
    setZoom(prev => {
      const idx = ZOOM_LEVELS.findIndex(z => z >= prev);
      const nextIdx = Math.min(idx + 1, ZOOM_LEVELS.length - 1);
      return ZOOM_LEVELS[nextIdx];
    });
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const idx = ZOOM_LEVELS.findIndex(z => z >= prev);
      const nextIdx = Math.max(idx - 1, 0);
      return ZOOM_LEVELS[nextIdx];
    });
  };

  const handleZoomTo = useCallback((newZoom) => {
    const clamped = Math.min(4, Math.max(0.1, newZoom));
    setZoom(clamped);
  }, []);

  const handlePan = useCallback((dx, dy) => {
    setPanX(prev => prev + dx);
    setPanY(prev => prev + dy);
  }, []);

  const handleToolSelect = (tool) => {
    setActiveTool(tool);
    setConnectorStart(null);
    if (tool !== 'select') {
      setSelectedItemIds([]);
    }
  };

  const handleCanvasClick = useCallback((canvasX, canvasY) => {
    if (activeTool === 'select') {
      setSelectedItemIds([]);
      return;
    }

    const baseItem = {
      boardId,
      rotation: 0,
      parentId: null,
      locked: false,
      createdBy: 'user_1',
    };

    let newItem = null;

    if (activeTool === 'sticky_note') {
      newItem = {
        ...baseItem,
        id: generateId(),
        type: 'sticky_note',
        x: canvasX,
        y: canvasY,
        width: 199,
        height: 199,
        content: '',
        shape: 'square',
        zIndex: items.length + 10,
        style: { fillColor: 'light_yellow', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' },
        tagIds: [],
      };
    } else if (activeTool === 'text') {
      newItem = {
        ...baseItem,
        id: generateId(),
        type: 'text',
        x: canvasX,
        y: canvasY,
        width: 200,
        height: 40,
        content: '',
        zIndex: items.length + 10,
        style: { fillColor: 'transparent', fontFamily: 'arial', fontSize: 24, color: '#1a1a1a', textAlign: 'left', bold: false, italic: false, underline: false, strikethrough: false },
      };
    } else if (activeTool === 'shape') {
      newItem = {
        ...baseItem,
        id: generateId(),
        type: 'shape',
        shapeType: 'rectangle',
        x: canvasX,
        y: canvasY,
        width: 200,
        height: 120,
        content: '',
        zIndex: items.length + 10,
        style: { fillColor: '#ffffff', fillOpacity: 1, borderColor: '#1a1a1a', borderWidth: 2, borderStyle: 'normal', borderOpacity: 1, fontFamily: 'arial', fontSize: 14, color: '#1a1a1a', textAlign: 'center', textAlignVertical: 'middle' },
      };
    } else if (activeTool === 'frame') {
      newItem = {
        ...baseItem,
        id: generateId(),
        type: 'frame',
        title: 'Frame',
        x: canvasX,
        y: canvasY,
        width: 800,
        height: 600,
        zIndex: 0,
        style: { fillColor: '#f5f5f5' },
        childrenIds: [],
        showContent: true,
      };
    } else if (activeTool === 'connector') {
      // Connector tool: first click sets a floating start point, second click creates the connector
      if (!connectorStart) {
        // First click: set floating start point (not snapped to any item)
        setConnectorStart({ x: canvasX, y: canvasY, itemId: null });
      } else {
        // Second click: create a floating connector (no item snap, uses absolute positions)
        const newId = generateId();
        // Create a special floating connector stored as two absolute points
        newItem = {
          ...baseItem,
          id: newId,
          type: 'connector',
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          zIndex: items.length + 5,
          start: {
            itemId: null,
            position: { x: connectorStart.x, y: connectorStart.y },
            snapTo: null,
            absoluteX: connectorStart.x,
            absoluteY: connectorStart.y,
          },
          end: {
            itemId: null,
            position: { x: canvasX, y: canvasY },
            snapTo: null,
            absoluteX: canvasX,
            absoluteY: canvasY,
          },
          shape: 'straight',
          style: { strokeColor: '#1a1a1a', strokeWidth: 2, strokeStyle: 'normal', startStrokeCap: 'none', endStrokeCap: 'stealth' },
          captions: [],
        };
        setConnectorStart(null);
      }
    } else if (activeTool === 'pen') {
      // Pen tool not supported in this implementation
      return;
    }

    if (newItem) {
      dispatch({ type: 'ADD_ITEM', payload: { boardId, item: newItem } });
      setSelectedItemIds([newItem.id]);
      setActiveTool('select');
    }
  }, [activeTool, boardId, dispatch, items.length, connectorStart]);

  const handleSelectItem = useCallback((itemIdOrIds, multi) => {
    if (Array.isArray(itemIdOrIds)) {
      // Multi-select from selection rectangle
      setSelectedItemIds(itemIdOrIds);
      return;
    }
    if (multi) {
      setSelectedItemIds(prev =>
        prev.includes(itemIdOrIds) ? prev.filter(id => id !== itemIdOrIds) : [...prev, itemIdOrIds]
      );
    } else {
      setSelectedItemIds([itemIdOrIds]);
    }
  }, []);

  const handleMoveItem = useCallback((itemId, x, y) => {
    dispatch({ type: 'MOVE_ITEM', payload: { boardId, itemId, x, y } });
  }, [boardId, dispatch]);

  const handleResizeItem = useCallback((itemId, width, height, x, y) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { boardId, itemId, changes: { width, height, x, y } } });
  }, [boardId, dispatch]);

  const handleUpdateItem = useCallback((itemId, changes) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { boardId, itemId, changes } });
  }, [boardId, dispatch]);

  const handleDeleteSelected = useCallback(() => {
    selectedItemIds.forEach(itemId => {
      dispatch({ type: 'DELETE_ITEM', payload: { boardId, itemId } });
    });
    setSelectedItemIds([]);
  }, [boardId, dispatch, selectedItemIds]);

  // Copy
  const handleCopy = useCallback(() => {
    const copied = items.filter(i => selectedItemIds.includes(i.id));
    setClipboard(copied.map(i => ({ ...i })));
  }, [items, selectedItemIds]);

  // Paste
  const handlePaste = useCallback(() => {
    if (clipboard.length === 0) return;
    const newIds = [];
    clipboard.forEach(item => {
      const newId = generateId();
      const newItem = {
        ...item,
        id: newId,
        boardId,
        x: item.x + 20,
        y: item.y + 20,
        zIndex: items.length + 10,
      };
      dispatch({ type: 'ADD_ITEM', payload: { boardId, item: newItem } });
      newIds.push(newId);
    });
    setSelectedItemIds(newIds);
  }, [clipboard, boardId, dispatch, items.length]);

  // Duplicate
  const handleDuplicate = useCallback(() => {
    const toDuplicate = items.filter(i => selectedItemIds.includes(i.id));
    const newIds = [];
    toDuplicate.forEach(item => {
      const newId = generateId();
      const newItem = {
        ...item,
        id: newId,
        x: item.x + 20,
        y: item.y + 20,
        zIndex: items.length + 10,
      };
      dispatch({ type: 'ADD_ITEM', payload: { boardId, item: newItem } });
      newIds.push(newId);
    });
    setSelectedItemIds(newIds);
  }, [items, selectedItemIds, boardId, dispatch]);

  // Bring to front
  const handleBringToFront = useCallback(() => {
    const maxZ = Math.max(...items.map(i => i.zIndex || 0), 0);
    selectedItemIds.forEach((itemId, idx) => {
      dispatch({ type: 'UPDATE_ITEM', payload: { boardId, itemId, changes: { zIndex: maxZ + 1 + idx } } });
    });
  }, [items, selectedItemIds, boardId, dispatch]);

  // Send to back
  const handleSendToBack = useCallback(() => {
    const minZ = Math.min(...items.map(i => i.zIndex || 0), 0);
    selectedItemIds.forEach((itemId, idx) => {
      dispatch({ type: 'UPDATE_ITEM', payload: { boardId, itemId, changes: { zIndex: minZ - 1 - idx } } });
    });
  }, [items, selectedItemIds, boardId, dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Tool shortcuts
      if (!ctrl && !e.shiftKey) {
        if (e.key === 'v' || e.key === 'V') { setActiveTool('select'); e.preventDefault(); return; }
        if (e.key === 'n' || e.key === 'N') { setActiveTool('sticky_note'); e.preventDefault(); return; }
        if (e.key === 't' || e.key === 'T') { setActiveTool('text'); e.preventDefault(); return; }
        if (e.key === 's' || e.key === 'S') { setActiveTool('shape'); e.preventDefault(); return; }
        if (e.key === 'f' || e.key === 'F') { setActiveTool('frame'); e.preventDefault(); return; }
        if (e.key === 'p' || e.key === 'P') { setActiveTool('pen'); e.preventDefault(); return; }
        if (e.key === 'l' || e.key === 'L') { setActiveTool('connector'); setConnectorStart(null); e.preventDefault(); return; }
        if (e.key === '?') { setShowShortcuts(v => !v); e.preventDefault(); return; }
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedItemIds.length > 0) {
          handleDeleteSelected();
          e.preventDefault();
          return;
        }
      }

      // Escape
      if (e.key === 'Escape') {
        setActiveTool('select');
        setSelectedItemIds([]);
        setConnectorStart(null);
        setShowShortcuts(false);
        setShowShareDialog(false);
        e.preventDefault();
        return;
      }

      // Ctrl shortcuts
      if (ctrl) {
        if (e.key === 'z' || e.key === 'Z') {
          if (e.shiftKey) {
            onRedo();
          } else {
            onUndo();
          }
          e.preventDefault();
          return;
        }
        if (e.key === 'y' || e.key === 'Y') {
          onRedo();
          e.preventDefault();
          return;
        }
        if (e.key === 'c' || e.key === 'C') {
          handleCopy();
          e.preventDefault();
          return;
        }
        if ((e.key === 'v' || e.key === 'V') && ctrl) {
          handlePaste();
          e.preventDefault();
          return;
        }
        if (e.key === 'd' || e.key === 'D') {
          handleDuplicate();
          e.preventDefault();
          return;
        }
        if (e.key === 'a' || e.key === 'A') {
          const allIds = items.filter(i => i.type !== 'connector').map(i => i.id);
          setSelectedItemIds(allIds);
          e.preventDefault();
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteSelected, selectedItemIds, handleCopy, handlePaste, handleDuplicate, items, onUndo, onRedo]);

  if (!board) return null;

  return (
    <div className="board-view">
      <TopBar
        boardName={board.name}
        onBoardNameChange={handleBoardNameChange}
        onGoHome={handleGoHome}
        userName={state.currentUser.initials}
        onShowShortcuts={() => setShowShortcuts(true)}
        onShowShare={() => setShowShareDialog(true)}
      />
      <LeftToolbar
        activeTool={activeTool}
        onToolSelect={handleToolSelect}
        onUndo={onUndo}
        onRedo={onRedo}
        connectorStart={connectorStart}
      />
      <Canvas
        items={items}
        zoom={zoom}
        panX={panX}
        panY={panY}
        activeTool={activeTool}
        selectedItemIds={selectedItemIds}
        onCanvasClick={handleCanvasClick}
        onSelectItem={handleSelectItem}
        onMoveItem={handleMoveItem}
        onResizeItem={handleResizeItem}
        onDeleteItems={handleDeleteSelected}
        onUpdateItem={handleUpdateItem}
        onZoom={handleZoomTo}
        onPan={handlePan}
        onSetActiveTool={setActiveTool}
        boardId={boardId}
        dispatch={dispatch}
        clipboard={clipboard}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onDuplicate={handleDuplicate}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        connectorStart={connectorStart}
        onConnectorItemClick={(itemId, snapTo) => {
          if (activeTool === 'connector') {
            if (!connectorStart) {
              setConnectorStart({ itemId, snapTo });
            } else {
              // Create connector snapped to two items
              const newId = generateId();
              const newConn = {
                boardId,
                id: newId,
                type: 'connector',
                x: 0, y: 0, width: 0, height: 0,
                rotation: 0, parentId: null, locked: false,
                zIndex: items.length + 5,
                start: { itemId: connectorStart.itemId, snapTo: connectorStart.snapTo, position: { x: 0.5, y: 0.5 } },
                end: { itemId, snapTo, position: { x: 0.5, y: 0.5 } },
                shape: 'straight',
                style: { strokeColor: '#1a1a1a', strokeWidth: 2, strokeStyle: 'normal', startStrokeCap: 'none', endStrokeCap: 'stealth' },
                captions: [],
                createdBy: 'user_1',
              };
              dispatch({ type: 'ADD_ITEM', payload: { boardId, item: newConn } });
              setSelectedItemIds([newId]);
              setConnectorStart(null);
              setActiveTool('select');
            }
          }
        }}
      />
      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onShowShortcuts={() => setShowShortcuts(true)}
      />

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (
        <div className="modal-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="modal-dialog shortcuts-dialog" onClick={e => e.stopPropagation()}>
            <h3>Keyboard Shortcuts</h3>
            <div className="shortcuts-grid">
              <div className="shortcut-section">
                <div className="shortcut-section-title">Tools</div>
                {[
                  ['V', 'Select'],
                  ['N', 'Sticky note'],
                  ['T', 'Text'],
                  ['S', 'Shape'],
                  ['F', 'Frame'],
                  ['L', 'Connector'],
                  ['P', 'Pen'],
                ].map(([key, label]) => (
                  <div key={key} className="shortcut-row">
                    <kbd className="shortcut-key">{key}</kbd>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="shortcut-section">
                <div className="shortcut-section-title">Actions</div>
                {[
                  ['Ctrl+Z', 'Undo'],
                  ['Ctrl+Shift+Z', 'Redo'],
                  ['Ctrl+C', 'Copy'],
                  ['Ctrl+V', 'Paste'],
                  ['Ctrl+D', 'Duplicate'],
                  ['Ctrl+A', 'Select all'],
                  ['Delete', 'Delete selected'],
                  ['Escape', 'Deselect / Cancel'],
                  ['Space + drag', 'Pan canvas'],
                  ['Ctrl + scroll', 'Zoom'],
                ].map(([key, label]) => (
                  <div key={key} className="shortcut-row">
                    <kbd className="shortcut-key">{key}</kbd>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowShortcuts(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Share dialog */}
      {showShareDialog && (
        <div className="modal-overlay" onClick={() => setShowShareDialog(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <h3>Share "{board.name}"</h3>
            <p>Anyone with the link can view this board. Copy the link below to share.</p>
            <div className="share-link-row">
              <input
                className="share-link-input"
                readOnly
                value={window.location.href}
                onFocus={e => e.target.select()}
              />
              <button className="modal-btn" style={{ background: 'var(--xiro-primary)', color: 'white' }}
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href).catch(() => {});
                }}>
                Copy
              </button>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="modal-btn cancel" onClick={() => setShowShareDialog(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
