import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import {
  Undo2, Redo2, Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Trash2, Lock, Unlock, PaintBucket, Palette, Minus, Plus, ChevronDown,
  Star, Settings, MessageSquare, Clock, Layers,
  Search, X, Eye, EyeOff
} from 'lucide-react';

// Shape rendering helper
function getShapeSVG(shape, isCanvas = false) {
  const { type, x, y, width, height, fillColor, borderColor, borderWidth, borderStyle, rotation } = shape;
  const dashArray = borderStyle === 'dashed' ? '8,4' : borderStyle === 'dotted' ? '2,2' : 'none';
  const da = dashArray === 'none' ? {} : { strokeDasharray: dashArray };

  const cx = x + width / 2;
  const cy = y + height / 2;
  const rotateTransform = rotation ? `rotate(${rotation}, ${cx}, ${cy})` : undefined;
  const wrapTransform = rotateTransform ? { transform: rotateTransform } : {};

  const renderShape = () => {
    switch (type) {
      case 'terminator':
        return <rect x={x} y={y} width={width} height={height} rx={height / 2} fill={fillColor} stroke={borderColor} strokeWidth={borderWidth} {...da} />;
      case 'decision':
        return <polygon points={`${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`} fill={fillColor} stroke={borderColor} strokeWidth={borderWidth} {...da} />;
      case 'data':
        return <polygon points={`${x + 20},${y} ${x + width},${y} ${x + width - 20},${y + height} ${x},${y + height}`} fill={fillColor} stroke={borderColor} strokeWidth={borderWidth} {...da} />;
      case 'circle':
      case 'connector_shape':
        return <ellipse cx={x + width / 2} cy={y + height / 2} rx={width / 2} ry={height / 2} fill={fillColor} stroke={borderColor} strokeWidth={borderWidth} {...da} />;
      case 'triangle':
        return <polygon points={`${x + width / 2},${y} ${x + width},${y + height} ${x},${y + height}`} fill={fillColor} stroke={borderColor} strokeWidth={borderWidth} {...da} />;
      case 'hexagon':
      case 'preparation':
        return <polygon points={`${x + width * 0.25},${y} ${x + width * 0.75},${y} ${x + width},${y + height / 2} ${x + width * 0.75},${y + height} ${x + width * 0.25},${y + height} ${x},${y + height / 2}`} fill={fillColor} stroke={borderColor} strokeWidth={borderWidth} {...da} />;
      case 'diamond':
        return <polygon points={`${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`} fill={fillColor} stroke={borderColor} strokeWidth={borderWidth} {...da} />;
      case 'document_shape':
        return <path d={`M${x},${y} L${x + width},${y} L${x + width},${y + height * 0.8} Q${x + width * 0.75},${y + height} ${x + width / 2},${y + height * 0.85} Q${x + width * 0.25},${y + height * 0.7} ${x},${y + height * 0.8} Z`} fill={fillColor} stroke={borderColor} strokeWidth={borderWidth} {...da} />;
      case 'merge':
        return <polygon points={`${x},${y} ${x + width},${y} ${x + width / 2},${y + height}`} fill={fillColor} stroke={borderColor} strokeWidth={borderWidth} {...da} />;
      case 'sticky_note':
        return <rect x={x} y={y} width={width} height={height} rx={2} fill={fillColor || '#FFF9C4'} stroke={borderColor || '#F9A825'} strokeWidth={borderWidth} {...da} />;
      case 'star_5': {
        const outerR = Math.min(width, height) / 2;
        const innerR = outerR * 0.4;
        const scx = x + width / 2;
        const scy = y + height / 2;
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          pts.push(`${scx + r * Math.cos(angle)},${scy + r * Math.sin(angle)}`);
        }
        return <polygon points={pts.join(' ')} fill={fillColor} stroke={borderColor} strokeWidth={borderWidth} {...da} />;
      }
      case 'cloud': {
        const lx = x, ly = y, lw = width, lh = height;
        return (
          <path
            d={`M${lx + lw * 0.25},${ly + lh * 0.65}
               A${lw * 0.15},${lh * 0.22} 0 0,1 ${lx + lw * 0.18},${ly + lh * 0.45}
               A${lw * 0.18},${lh * 0.25} 0 0,1 ${lx + lw * 0.4},${ly + lh * 0.25}
               A${lw * 0.16},${lh * 0.22} 0 0,1 ${lx + lw * 0.6},${ly + lh * 0.22}
               A${lw * 0.2},${lh * 0.28} 0 0,1 ${lx + lw * 0.82},${ly + lh * 0.38}
               A${lw * 0.15},${lh * 0.2} 0 0,1 ${lx + lw * 0.88},${ly + lh * 0.55}
               A${lw * 0.14},${lh * 0.18} 0 0,1 ${lx + lw * 0.78},${ly + lh * 0.65}
               Z`}
            fill={fillColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
            strokeLinejoin="round"
            {...da}
          />
        );
      }
      case 'line':
        return <line x1={x} y1={y + height / 2} x2={x + width} y2={y + height / 2} stroke={borderColor} strokeWidth={borderWidth || 2} {...da} />;
      default: // rectangle, process, text, container, etc.
        return <rect x={x} y={y} width={width} height={height} rx={2} fill={fillColor} stroke={borderColor} strokeWidth={borderWidth} {...da} />;
    }
  };

  if (rotation) {
    return <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>{renderShape()}</g>;
  }
  return renderShape();
}

function getConnectionPoint(shape, point) {
  const { x, y, width, height } = shape;
  switch (point) {
    case 'top': return { x: x + width / 2, y };
    case 'bottom': return { x: x + width / 2, y: y + height };
    case 'left': return { x, y: y + height / 2 };
    case 'right': return { x: x + width, y: y + height / 2 };
    default: return { x: x + width / 2, y: y + height / 2 };
  }
}

function getConnectorPath(source, target, routingType) {
  const sx = source.x, sy = source.y, tx = target.x, ty = target.y;
  if (routingType === 'straight') return `M${sx},${sy} L${tx},${ty}`;
  if (routingType === 'curved') {
    const dx = Math.abs(tx - sx) * 0.5;
    const dy = Math.abs(ty - sy) * 0.5;
    return `M${sx},${sy} C${sx},${sy + dy} ${tx},${ty - dy} ${tx},${ty}`;
  }
  // orthogonal
  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;
  if (Math.abs(tx - sx) > Math.abs(ty - sy)) {
    return `M${sx},${sy} L${mx},${sy} L${mx},${ty} L${tx},${ty}`;
  }
  return `M${sx},${sy} L${sx},${my} L${tx},${my} L${tx},${ty}`;
}

// Shape panel definitions
const STANDARD_SHAPES = [
  { type: 'text', label: 'Text', icon: 'T' },
  { type: 'rectangle', label: 'Rectangle', icon: '\u25A1' },
  { type: 'sticky_note', label: 'Sticky Note', icon: '\u25A3' },
  { type: 'container', label: 'Container', icon: '\u2B1C' },
  { type: 'line', label: 'Line', icon: '\u2571' },
];

const FLOWCHART_SHAPES = [
  { type: 'process', label: 'Process', icon: '\u25A1' },
  { type: 'decision', label: 'Decision', icon: '\u25C7' },
  { type: 'terminator', label: 'Terminator', icon: '\u2B2D' },
  { type: 'data', label: 'Data', icon: '\u25B1' },
  { type: 'document_shape', label: 'Document', icon: '\u25AD' },
  { type: 'preparation', label: 'Preparation', icon: '\u2B21' },
  { type: 'connector_shape', label: 'Connector', icon: '\u25CB' },
  { type: 'merge', label: 'Merge', icon: '\u25BD' },
];

const BASIC_SHAPES = [
  { type: 'triangle', label: 'Triangle', icon: '\u25B3' },
  { type: 'circle', label: 'Circle', icon: '\u25CB' },
  { type: 'diamond', label: 'Diamond', icon: '\u25C7' },
  { type: 'hexagon', label: 'Hexagon', icon: '\u2B21' },
  { type: 'star_5', label: 'Star', icon: '\u2606' },
  { type: 'cloud', label: 'Cloud', icon: '\u2601' },
];

const DEFAULT_SHAPE_SIZE = {
  process: { w: 160, h: 80 },
  decision: { w: 140, h: 100 },
  terminator: { w: 160, h: 60 },
  data: { w: 160, h: 80 },
  rectangle: { w: 160, h: 80 },
  circle: { w: 80, h: 80 },
  diamond: { w: 120, h: 100 },
  triangle: { w: 100, h: 100 },
  hexagon: { w: 120, h: 100 },
  text: { w: 120, h: 40 },
  sticky_note: { w: 140, h: 140 },
  container: { w: 300, h: 200 },
  line: { w: 100, h: 2 },
  document_shape: { w: 160, h: 80 },
  preparation: { w: 160, h: 80 },
  connector_shape: { w: 60, h: 60 },
  merge: { w: 100, h: 80 },
  star_5: { w: 80, h: 80 },
  cloud: { w: 140, h: 100 },
};

const FONT_FAMILIES = ['Liberation Sans', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];

// Cursor map for 8 resize handles (indexed TL, TM, TR, ML, MR, BL, BM, BR)
const RESIZE_CURSORS = ['nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize', 'ew-resize', 'nesw-resize', 'ns-resize', 'nwse-resize'];

export default function Editor() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    state, updateState, setUI, addShape, updateShape, deleteShapes,
    addConnector, updateConnector, deleteConnector,
    addPage, updatePage, deletePage, updateDocument,
    addComment, updateComment, addDocument
  } = useAppContext();

  const query = searchParams.toString();
  const navTo = (path) => navigate(query ? `${path}?${query}` : path);

  const doc = state.documents.find(d => d.id === documentId);
  const docPages = useMemo(() => doc ? state.pages.filter(p => p.documentId === documentId).sort((a, b) => a.order - b.order) : [], [doc, state.pages, documentId]);

  const [activePageId, setActivePageId] = useState(null);
  const [dragInfo, setDragInfo] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [connectPreview, setConnectPreview] = useState(null);
  const [editingShapeId, setEditingShapeId] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectionBox, setSelectionBox] = useState(null);
  const [hoveredShapeId, setHoveredShapeId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(doc?.title || '');
  const [shapePanelSearch, setShapePanelSearch] = useState('');
  const [shapeSections, setShapeSections] = useState({ standard: true, flowchart: true, shapes: true });
  const [rightPanelTab, setRightPanelTab] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [replyTexts, setReplyTexts] = useState({});
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [historyEntries, setHistoryEntries] = useState([
    { id: 'hist-init', action: 'Document opened', timestamp: new Date().toISOString(), user: state.currentUser.name }
  ]);

  // Undo/Redo history stack (max 50 entries)
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const isUndoRedoRef = useRef(false);

  const addHistoryEntry = useCallback((action) => {
    setHistoryEntries(prev => [
      { id: `hist-${Date.now()}`, action, timestamp: new Date().toISOString(), user: state.currentUser.name },
      ...prev
    ].slice(0, 50));
  }, [state.currentUser.name]);

  const pushUndoSnapshot = useCallback(() => {
    if (isUndoRedoRef.current) return;
    const snapshot = {
      shapes: JSON.parse(JSON.stringify(state.shapes)),
      connectors: JSON.parse(JSON.stringify(state.connectors)),
      selectedShapeIds: [...(state.ui.selectedShapeIds || [])],
    };
    undoStackRef.current = [...undoStackRef.current.slice(-49), snapshot];
    redoStackRef.current = [];
  }, [state.shapes, state.connectors, state.ui.selectedShapeIds]);

  const performUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const currentSnapshot = {
      shapes: JSON.parse(JSON.stringify(state.shapes)),
      connectors: JSON.parse(JSON.stringify(state.connectors)),
      selectedShapeIds: [...(state.ui.selectedShapeIds || [])],
    };
    redoStackRef.current = [...redoStackRef.current, currentSnapshot];

    const prev = undoStackRef.current[undoStackRef.current.length - 1];
    undoStackRef.current = undoStackRef.current.slice(0, -1);

    isUndoRedoRef.current = true;
    updateState(s => ({
      ...s,
      shapes: prev.shapes,
      connectors: prev.connectors,
      ui: { ...s.ui, selectedShapeIds: prev.selectedShapeIds },
    }));
    setTimeout(() => { isUndoRedoRef.current = false; }, 50);
  }, [state.shapes, state.connectors, state.ui.selectedShapeIds, updateState]);

  const performRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const currentSnapshot = {
      shapes: JSON.parse(JSON.stringify(state.shapes)),
      connectors: JSON.parse(JSON.stringify(state.connectors)),
      selectedShapeIds: [...(state.ui.selectedShapeIds || [])],
    };
    undoStackRef.current = [...undoStackRef.current, currentSnapshot];

    const next = redoStackRef.current[redoStackRef.current.length - 1];
    redoStackRef.current = redoStackRef.current.slice(0, -1);

    isUndoRedoRef.current = true;
    updateState(s => ({
      ...s,
      shapes: next.shapes,
      connectors: next.connectors,
      ui: { ...s.ui, selectedShapeIds: next.selectedShapeIds },
    }));
    setTimeout(() => { isUndoRedoRef.current = false; }, 50);
  }, [state.shapes, state.connectors, state.ui.selectedShapeIds, updateState]);

  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  const selectedIds = state.ui.selectedShapeIds || [];
  const zoomLevel = state.ui.zoomLevel || 100;
  const zoom = zoomLevel / 100;

  useEffect(() => {
    if (doc && docPages.length > 0 && !activePageId) {
      setActivePageId(docPages[0].id);
    }
  }, [doc, docPages, activePageId]);

  useEffect(() => {
    if (doc) {
      setUI({ activeDocumentId: documentId, activePageId: activePageId });
    }
  }, [documentId, activePageId, doc]);

  if (!doc) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500">Document not found</p>
        <button className="text-blue-500 underline" onClick={() => navTo('/')}>Go to Dashboard</button>
      </div>
    );
  }

  const activePage = docPages.find(p => p.id === activePageId) || docPages[0];
  const pageShapes = activePage ? state.shapes.filter(s => s.pageId === activePage.id && s.visible !== false) : [];
  const pageConnectors = activePage ? state.connectors.filter(c => c.pageId === activePage.id) : [];
  const pageComments = activePage ? state.comments.filter(c => c.pageId === activePage.id) : [];
  const selectedShapes = pageShapes.filter(s => selectedIds.includes(s.id));

  const getMousePos = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  };

  const snapToGrid = (val, gridSize = 20) => Math.round(val / gridSize) * gridSize;

  // Shape panel
  const addShapeToCanvas = (shapeType, category = 'standard') => {
    pushUndoSnapshot();
    const size = DEFAULT_SHAPE_SIZE[shapeType] || { w: 120, h: 80 };
    const pageW = activePage?.width || 1200;
    const pageH = activePage?.height || 900;
    const id = `shape-${uuidv4().slice(0, 8)}`;
    const newShape = {
      id, pageId: activePage.id, type: shapeType, category,
      x: snapToGrid(pageW / 2 - size.w / 2), y: snapToGrid(pageH / 2 - size.h / 2),
      width: size.w, height: size.h, rotation: 0,
      text: shapeType === 'text' ? 'Text' : '',
      fontSize: 13, fontFamily: 'Liberation Sans', fontWeight: 'normal', fontStyle: 'normal',
      textAlign: 'center', textColor: '#333333',
      fillColor: shapeType === 'sticky_note' ? '#FFF9C4' : '#FFFFFF',
      borderColor: '#333333', borderWidth: 2, borderStyle: 'solid',
      opacity: 1, locked: false, visible: true,
      zIndex: pageShapes.length + 1, groupId: null
    };
    addShape(newShape);
    setUI({ selectedShapeIds: [id] });
    addHistoryEntry(`Added ${shapeType} shape`);
  };

  // Cut / Copy / Paste helpers
  const performCopy = useCallback(() => {
    if (selectedIds.length === 0) return;
    const shapesToCopy = pageShapes.filter(s => selectedIds.includes(s.id));
    if (shapesToCopy.length > 0) {
      setClipboard({ shapes: JSON.parse(JSON.stringify(shapesToCopy)) });
    }
  }, [selectedIds, pageShapes]);

  const performCut = useCallback(() => {
    if (selectedIds.length === 0) return;
    const shapesToCut = pageShapes.filter(s => selectedIds.includes(s.id));
    if (shapesToCut.length > 0) {
      setClipboard({ shapes: JSON.parse(JSON.stringify(shapesToCut)) });
      pushUndoSnapshot();
      deleteShapes(selectedIds);
      setUI({ selectedShapeIds: [] });
      addHistoryEntry(`Cut ${shapesToCut.length} shape(s)`);
    }
  }, [selectedIds, pageShapes, pushUndoSnapshot, deleteShapes, setUI, addHistoryEntry]);

  const performPaste = useCallback(() => {
    if (!clipboard || !clipboard.shapes || clipboard.shapes.length === 0) return;
    pushUndoSnapshot();
    const newIds = [];
    clipboard.shapes.forEach(s => {
      const newId = `shape-${uuidv4().slice(0, 8)}`;
      newIds.push(newId);
      addShape({ ...s, id: newId, x: s.x + 20, y: s.y + 20, pageId: activePage.id });
    });
    setUI({ selectedShapeIds: newIds });
    addHistoryEntry(`Pasted ${clipboard.shapes.length} shape(s)`);
  }, [clipboard, pushUndoSnapshot, addShape, activePage, setUI, addHistoryEntry]);

  // Bring to Front / Send to Back
  const bringToFront = useCallback(() => {
    if (selectedIds.length === 0) return;
    const maxZ = Math.max(...pageShapes.map(s => s.zIndex || 0), 0);
    pushUndoSnapshot();
    selectedIds.forEach((id, i) => {
      const s = pageShapes.find(sh => sh.id === id);
      if (s) updateShape(id, { zIndex: maxZ + 1 + i });
    });
    addHistoryEntry('Brought to front');
  }, [selectedIds, pageShapes, pushUndoSnapshot, updateShape, addHistoryEntry]);

  const sendToBack = useCallback(() => {
    if (selectedIds.length === 0) return;
    const minZ = Math.min(...pageShapes.map(s => s.zIndex || 0), 0);
    pushUndoSnapshot();
    selectedIds.forEach((id, i) => {
      const s = pageShapes.find(sh => sh.id === id);
      if (s) updateShape(id, { zIndex: minZ - 1 - i });
    });
    addHistoryEntry('Sent to back');
  }, [selectedIds, pageShapes, pushUndoSnapshot, updateShape, addHistoryEntry]);

  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0) return;
    if (editingShapeId) return;

    // Check if clicking on a resize handle
    const resizeHandle = e.target.closest('[data-resize-handle]');
    if (resizeHandle) {
      e.stopPropagation();
      const handleIndex = parseInt(resizeHandle.dataset.resizeHandle, 10);
      const shapeId = resizeHandle.dataset.shapeId;
      const shape = pageShapes.find(s => s.id === shapeId);
      if (!shape) return;
      const pos = getMousePos(e);
      pushUndoSnapshot();
      setDragInfo({
        type: 'resize',
        handleIndex,
        shapeId,
        startX: pos.x, startY: pos.y,
        origX: shape.x, origY: shape.y,
        origW: shape.width, origH: shape.height
      });
      return;
    }

    const pos = getMousePos(e);
    const target = e.target.closest('[data-shape-id]');
    const connTarget = e.target.closest('[data-conn-id]');

    if (target) {
      const shapeId = target.dataset.shapeId;
      const shape = pageShapes.find(s => s.id === shapeId);
      if (shape?.locked) return;

      if (e.shiftKey) {
        const newSel = selectedIds.includes(shapeId)
          ? selectedIds.filter(id => id !== shapeId)
          : [...selectedIds, shapeId];
        setUI({ selectedShapeIds: newSel });
      } else if (!selectedIds.includes(shapeId)) {
        setUI({ selectedShapeIds: [shapeId] });
      }

      const toMove = selectedIds.includes(shapeId) ? selectedIds : [shapeId];
      const initialPositions = {};
      toMove.forEach(id => {
        const s = pageShapes.find(sh => sh.id === id);
        if (s) initialPositions[id] = { x: s.x, y: s.y };
      });

      pushUndoSnapshot();
      setDragInfo({ type: 'move', startX: pos.x, startY: pos.y, initialPositions });
    } else if (connTarget) {
      const connId = connTarget.dataset.connId;
      setUI({ selectedShapeIds: [connId] });
    } else {
      if (!e.shiftKey) setUI({ selectedShapeIds: [] });
      setDragInfo({ type: 'select-box', startX: pos.x, startY: pos.y });
      setSelectionBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (connectingFrom) {
      const pos = getMousePos(e);
      setConnectPreview({ x: pos.x, y: pos.y });
      return;
    }
    if (!dragInfo) return;
    const pos = getMousePos(e);

    if (dragInfo.type === 'move') {
      const dx = pos.x - dragInfo.startX;
      const dy = pos.y - dragInfo.startY;
      Object.entries(dragInfo.initialPositions).forEach(([id, initial]) => {
        updateShape(id, {
          x: snapToGrid(initial.x + dx),
          y: snapToGrid(initial.y + dy)
        });
      });
    }

    if (dragInfo.type === 'resize') {
      const dx = pos.x - dragInfo.startX;
      const dy = pos.y - dragInfo.startY;
      const { handleIndex, origX, origY, origW, origH } = dragInfo;
      let nx = origX, ny = origY, nw = origW, nh = origH;

      // Handle index mapping: 0=TL, 1=TM, 2=TR, 3=ML, 4=MR, 5=BL, 6=BM, 7=BR
      if ([0, 1, 2].includes(handleIndex)) { // top edge
        ny = Math.min(snapToGrid(origY + dy), origY + origH - 10);
        nh = Math.max(origH - dy, 10);
      }
      if ([5, 6, 7].includes(handleIndex)) { // bottom edge
        nh = Math.max(snapToGrid(origH + dy), 10);
      }
      if ([0, 3, 5].includes(handleIndex)) { // left edge
        nx = Math.min(snapToGrid(origX + dx), origX + origW - 10);
        nw = Math.max(origW - dx, 10);
      }
      if ([2, 4, 7].includes(handleIndex)) { // right edge
        nw = Math.max(snapToGrid(origW + dx), 10);
      }

      updateShape(dragInfo.shapeId, { x: nx, y: ny, width: nw, height: nh });
    }

    if (dragInfo.type === 'select-box') {
      const x = Math.min(dragInfo.startX, pos.x);
      const y = Math.min(dragInfo.startY, pos.y);
      setSelectionBox({ x, y, width: Math.abs(pos.x - dragInfo.startX), height: Math.abs(pos.y - dragInfo.startY) });
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (connectingFrom) {
      const target = e.target.closest('[data-shape-id]');
      if (target && target.dataset.shapeId !== connectingFrom.shapeId) {
        const targetId = target.dataset.shapeId;
        const connId = `conn-${uuidv4().slice(0, 8)}`;
        pushUndoSnapshot();
        addConnector({
          id: connId, pageId: activePage.id,
          sourceShapeId: connectingFrom.shapeId, sourcePoint: connectingFrom.point,
          targetShapeId: targetId, targetPoint: 'top',
          waypoints: [], lineStyle: 'solid', lineWidth: 2, lineColor: '#333333',
          sourceArrow: 'none', targetArrow: 'arrow',
          label: '', labelPosition: 0.5, routingType: 'orthogonal', zIndex: 0
        });
      }
      setConnectingFrom(null);
      setConnectPreview(null);
      return;
    }

    if (dragInfo?.type === 'resize') {
      addHistoryEntry('Resized shape');
    }

    if (dragInfo?.type === 'select-box' && selectionBox) {
      const sb = selectionBox;
      if (sb.width > 5 && sb.height > 5) {
        const ids = pageShapes.filter(s =>
          s.x >= sb.x && s.x + s.width <= sb.x + sb.width &&
          s.y >= sb.y && s.y + s.height <= sb.y + sb.height
        ).map(s => s.id);
        if (ids.length > 0) setUI({ selectedShapeIds: ids });
      }
      setSelectionBox(null);
    }
    setDragInfo(null);
  };

  const handleDoubleClick = (e) => {
    const target = e.target.closest('[data-shape-id]');
    if (target) {
      const shapeId = target.dataset.shapeId;
      const shape = pageShapes.find(s => s.id === shapeId);
      if (shape && !shape.locked) {
        setEditingShapeId(shapeId);
        setEditText(shape.text || '');
      }
    }
  };

  const commitTextEdit = () => {
    if (editingShapeId) {
      pushUndoSnapshot();
      updateShape(editingShapeId, { text: editText });
      setEditingShapeId(null);
      addHistoryEntry('Edited text');
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (editingShapeId || editingTitle) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedIds.length > 0) {
        pushUndoSnapshot();
        const shapeIds = selectedIds.filter(id => pageShapes.find(s => s.id === id));
        const connIds = selectedIds.filter(id => pageConnectors.find(c => c.id === id));
        if (shapeIds.length) deleteShapes(shapeIds);
        connIds.forEach(id => deleteConnector(id));
        setUI({ selectedShapeIds: [] });
        addHistoryEntry(`Deleted ${shapeIds.length + connIds.length} element(s)`);
      }
    }
    if (e.key === 'Escape') {
      setUI({ selectedShapeIds: [] });
      setOpenMenu(null);
      setContextMenu(null);
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault();
        performUndo();
        addHistoryEntry('Undo');
      }
      if (e.key === 'y') {
        e.preventDefault();
        performRedo();
        addHistoryEntry('Redo');
      }
      if (e.key === 'a') {
        e.preventDefault();
        setUI({ selectedShapeIds: pageShapes.map(s => s.id) });
      }
      if (e.key === 'd') {
        e.preventDefault();
        pushUndoSnapshot();
        selectedIds.forEach(id => {
          const s = pageShapes.find(sh => sh.id === id);
          if (s) {
            const newId = `shape-${uuidv4().slice(0, 8)}`;
            addShape({ ...s, id: newId, x: s.x + 20, y: s.y + 20 });
          }
        });
        addHistoryEntry(`Duplicated ${selectedIds.length} shape(s)`);
      }
      if (e.key === 'x') {
        e.preventDefault();
        performCut();
      }
      if (e.key === 'c') {
        e.preventDefault();
        performCopy();
      }
      if (e.key === 'v') {
        e.preventDefault();
        performPaste();
      }
      if (e.key === 'p') {
        e.preventDefault();
        window.print();
      }
      if (e.shiftKey && e.key === ']') {
        e.preventDefault();
        bringToFront();
      }
      if (e.shiftKey && e.key === '[') {
        e.preventDefault();
        sendToBack();
      }
    }
  }, [editingShapeId, editingTitle, selectedIds, pageShapes, pageConnectors,
      pushUndoSnapshot, performUndo, performRedo, addHistoryEntry,
      performCut, performCopy, performPaste, bringToFront, sendToBack]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    try {
      const { type, category } = JSON.parse(data);
      pushUndoSnapshot();
      const pos = getMousePos(e);
      const size = DEFAULT_SHAPE_SIZE[type] || { w: 120, h: 80 };
      const id = `shape-${uuidv4().slice(0, 8)}`;
      addShape({
        id, pageId: activePage.id, type, category: category || 'standard',
        x: snapToGrid(pos.x - size.w / 2), y: snapToGrid(pos.y - size.h / 2),
        width: size.w, height: size.h, rotation: 0,
        text: type === 'text' ? 'Text' : '',
        fontSize: 13, fontFamily: 'Liberation Sans', fontWeight: 'normal', fontStyle: 'normal',
        textAlign: 'center', textColor: '#333333',
        fillColor: type === 'sticky_note' ? '#FFF9C4' : '#FFFFFF',
        borderColor: '#333333', borderWidth: 2, borderStyle: 'solid',
        opacity: 1, locked: false, visible: true,
        zIndex: pageShapes.length + 1, groupId: null
      });
      setUI({ selectedShapeIds: [id] });
    } catch (err) { /* ignore parse errors from non-shape drag sources */ }
  };

  const handleCanvasWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      const idx = ZOOM_LEVELS.indexOf(zoomLevel);
      const newIdx = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, idx + delta));
      setUI({ zoomLevel: ZOOM_LEVELS[newIdx] });
    }
  };

  const handleContextMenuCanvas = (e) => {
    e.preventDefault();
    const pos = getMousePos(e);
    const target = e.target.closest('[data-shape-id]');
    const connTarget = e.target.closest('[data-conn-id]');
    setContextMenu({ x: e.clientX, y: e.clientY, shapeId: target?.dataset.shapeId, connId: connTarget?.dataset.connId, pos });
  };

  const commitTitle = () => {
    if (titleValue.trim()) {
      updateDocument(documentId, { title: titleValue.trim() });
    }
    setEditingTitle(false);
  };

  // Connection point click
  const startConnection = (shapeId, point) => {
    setConnectingFrom({ shapeId, point });
  };

  // Toolbar update helper
  const updateSelectedProps = (changes) => {
    selectedIds.forEach(id => {
      const shape = pageShapes.find(s => s.id === id);
      if (shape) updateShape(id, changes);
    });
  };

  const firstSelected = selectedIds.length === 1 ? pageShapes.find(s => s.id === selectedIds[0]) : null;

  // Add new page
  const handleAddPage = () => {
    const pageId = `page-${uuidv4().slice(0, 8)}`;
    const newOrder = docPages.length;
    addPage({
      id: pageId, documentId, name: `Page ${newOrder + 1}`, order: newOrder,
      width: 1200, height: 900, gridVisible: true, gridSize: 20, backgroundColor: '#FFFFFF'
    });
    updateDocument(documentId, { pageOrder: [...(doc.pageOrder || []), pageId] });
    setActivePageId(pageId);
  };

  // Delete page
  const handleDeletePage = (pageId) => {
    if (docPages.length <= 1) return; // cannot delete last page
    deletePage(pageId);
    updateDocument(documentId, { pageOrder: (doc.pageOrder || []).filter(pid => pid !== pageId) });
    if (activePageId === pageId) {
      const remaining = docPages.filter(p => p.id !== pageId);
      if (remaining.length > 0) setActivePageId(remaining[0].id);
    }
    addHistoryEntry('Deleted page');
  };

  // Share dialog
  const handleAddShare = () => {
    if (!shareEmail.trim()) return;
    const existingUser = [...state.users, state.currentUser].find(u => u.email === shareEmail.trim());
    if (existingUser) {
      const newShared = [...(doc.sharedWith || []).filter(s => s.userId !== existingUser.id), { userId: existingUser.id, permission: sharePermission }];
      updateDocument(documentId, { sharedWith: newShared });
    }
    setShareEmail('');
  };

  const handleRemoveShare = (userId) => {
    updateDocument(documentId, { sharedWith: (doc.sharedWith || []).filter(s => s.userId !== userId) });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const commentId = `comment-${uuidv4().slice(0, 8)}`;
    addComment({
      id: commentId, pageId: activePage.id,
      shapeId: selectedIds.length === 1 ? selectedIds[0] : null,
      x: null, y: null,
      authorId: state.currentUser.id, authorName: state.currentUser.name,
      text: commentText.trim(), resolved: false,
      createdAt: new Date().toISOString(), replies: []
    });
    setCommentText('');
  };

  const handleAddReply = (commentId) => {
    const text = (replyTexts[commentId] || '').trim();
    if (!text) return;
    const replyId = `reply-${uuidv4().slice(0, 8)}`;
    const comment = pageComments.find(c => c.id === commentId);
    if (!comment) return;
    updateComment(commentId, {
      replies: [...(comment.replies || []), {
        id: replyId,
        authorId: state.currentUser.id,
        authorName: state.currentUser.name,
        text,
        createdAt: new Date().toISOString()
      }]
    });
    setReplyTexts(prev => ({ ...prev, [commentId]: '' }));
  };

  // Import file handler
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.svg,.xml';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        addHistoryEntry(`Imported file: ${file.name}`);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Filter shapes for panel search
  const filterShapes = (shapes) => {
    if (!shapePanelSearch) return shapes;
    return shapes.filter(s => s.label.toLowerCase().includes(shapePanelSearch.toLowerCase()));
  };

  const renderShapePanel = (shapes, cat) => {
    const filtered = filterShapes(shapes);
    if (filtered.length === 0) return null;
    return (
      <div className="grid grid-cols-4 gap-1 p-1">
        {filtered.map(s => (
          <div
            key={s.type}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 text-gray-600 text-sm"
            title={s.label}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify({ type: s.type, category: cat }))}
            onClick={() => addShapeToCanvas(s.type, cat)}
          >
            {s.icon}
          </div>
        ))}
      </div>
    );
  };

  // Make a Copy handler
  const handleMakeACopy = () => {
    const newDocId = `doc-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    const docPageIds = doc.pageOrder || docPages.map(p => p.id);
    const pageIdMap = {};
    docPageIds.forEach(pid => {
      pageIdMap[pid] = `page-${uuidv4().slice(0, 8)}`;
    });
    const shapeIdMap = {};
    const docShapes = state.shapes.filter(s => docPageIds.includes(s.pageId));
    docShapes.forEach(s => {
      shapeIdMap[s.id] = `shape-${uuidv4().slice(0, 8)}`;
    });
    const newPages = docPages.map(p => ({
      ...p,
      id: pageIdMap[p.id],
      documentId: newDocId,
    }));
    const newShapes = docShapes.map(s => ({
      ...s,
      id: shapeIdMap[s.id],
      pageId: pageIdMap[s.pageId],
    }));
    const docConnectors = state.connectors.filter(c => docPageIds.includes(c.pageId));
    const newConnectors = docConnectors.map(c => ({
      ...c,
      id: `conn-${uuidv4().slice(0, 8)}`,
      pageId: pageIdMap[c.pageId],
      sourceShapeId: shapeIdMap[c.sourceShapeId] || c.sourceShapeId,
      targetShapeId: shapeIdMap[c.targetShapeId] || c.targetShapeId,
    }));
    const docComments = state.comments.filter(c => docPageIds.includes(c.pageId));
    const newComments = docComments.map(c => ({
      ...c,
      id: `comment-${uuidv4().slice(0, 8)}`,
      pageId: pageIdMap[c.pageId],
      shapeId: c.shapeId ? (shapeIdMap[c.shapeId] || c.shapeId) : null,
      replies: (c.replies || []).map(r => ({ ...r, id: `reply-${uuidv4().slice(0, 8)}` })),
    }));
    const newDoc = {
      ...doc,
      id: newDocId,
      title: `${doc.title} (Copy)`,
      starred: false,
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      sharedWith: [],
      pageOrder: docPageIds.map(pid => pageIdMap[pid]),
    };
    updateState(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc],
      pages: [...prev.pages, ...newPages],
      shapes: [...prev.shapes, ...newShapes],
      connectors: [...prev.connectors, ...newConnectors],
      comments: [...prev.comments, ...newComments],
    }));
    navTo(`/editor/${newDocId}`);
  };

  // Download As handler — SVG export from live canvas; PNG via canvas rasterization
  const handleDownloadAs = (format) => {
    const fileName = `${doc.title}.${format.toLowerCase()}`;
    if (format === 'SVG') {
      const content = svgRef.current ? svgRef.current.outerHTML : '<svg></svg>';
      const blob = new Blob([content], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'PNG') {
      const svgEl = svgRef.current;
      if (!svgEl) return;
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = svgEl.width.baseVal.value || activePage?.width || 1200;
        canvas.height = svgEl.height.baseVal.value || activePage?.height || 900;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob(pngBlob => {
          const pngUrl = URL.createObjectURL(pngBlob);
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(pngUrl);
        }, 'image/png');
      };
      img.src = url;
    } else if (format === 'PDF') {
      // Print to PDF via browser print dialog
      window.print();
    }
  };

  // Menu dropdown items
  const menus = {
    File: [
      { label: 'New', action: () => { navTo('/'); } },
      { label: 'Make a Copy', action: handleMakeACopy },
      { label: 'Rename', action: () => { setEditingTitle(true); setTitleValue(doc.title); } },
      { type: 'divider' },
      { label: 'Download As', sub: true, subItems: [
        { label: 'PNG', action: () => handleDownloadAs('PNG') },
        { label: 'SVG', action: () => handleDownloadAs('SVG') },
        { label: 'PDF', action: () => handleDownloadAs('PDF') },
      ]},
      { type: 'divider' },
      { label: 'Print', shortcut: 'Ctrl+P', action: () => window.print() },
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: performUndo },
      { label: 'Redo', shortcut: 'Ctrl+Y', action: performRedo },
      { type: 'divider' },
      { label: 'Cut', shortcut: 'Ctrl+X', action: performCut },
      { label: 'Copy', shortcut: 'Ctrl+C', action: performCopy },
      { label: 'Paste', shortcut: 'Ctrl+V', action: performPaste },
      { type: 'divider' },
      { label: 'Select All', shortcut: 'Ctrl+A', action: () => setUI({ selectedShapeIds: pageShapes.map(s => s.id) }) },
      { label: 'Delete', shortcut: 'Del', action: () => { if (selectedIds.length) deleteShapes(selectedIds); setUI({ selectedShapeIds: [] }); } },
    ],
    View: [
      { label: 'Zoom In', shortcut: 'Ctrl++', action: () => { const idx = ZOOM_LEVELS.indexOf(zoomLevel); if (idx < ZOOM_LEVELS.length - 1) setUI({ zoomLevel: ZOOM_LEVELS[idx + 1] }); } },
      { label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => { const idx = ZOOM_LEVELS.indexOf(zoomLevel); if (idx > 0) setUI({ zoomLevel: ZOOM_LEVELS[idx - 1] }); } },
      { label: 'Zoom to 100%', shortcut: 'Ctrl+0', action: () => setUI({ zoomLevel: 100 }) },
      { type: 'divider' },
      { label: `Grid ${activePage?.gridVisible ? '\u2713' : ''}`, action: () => activePage && updatePage(activePage.id, { gridVisible: !activePage.gridVisible }) },
    ],
    Insert: [
      { label: 'Text', action: () => addShapeToCanvas('text', 'standard') },
      { label: 'Rectangle', action: () => addShapeToCanvas('rectangle', 'standard') },
      { label: 'Note', action: () => addShapeToCanvas('sticky_note', 'standard') },
      { type: 'divider' },
      { label: 'Page', action: handleAddPage },
    ],
    Arrange: [
      { label: 'Bring to Front', shortcut: 'Ctrl+Shift+]', action: bringToFront },
      { label: 'Send to Back', shortcut: 'Ctrl+Shift+[', action: sendToBack },
      { type: 'divider' },
      { label: 'Lock', action: () => updateSelectedProps({ locked: true }) },
      { label: 'Unlock', action: () => updateSelectedProps({ locked: false }) },
    ],
    Share: [
      { label: 'Share...', action: () => setShareModalOpen(true) },
    ],
  };

  const getUserById = (id) => {
    if (id === state.currentUser.id) return state.currentUser;
    return state.users.find(u => u.id === id);
  };

  // Restore history snapshot
  const restoreHistoryEntry = (entry) => {
    if (entry.snapshot) {
      pushUndoSnapshot();
      isUndoRedoRef.current = true;
      updateState(s => ({
        ...s,
        shapes: entry.snapshot.shapes,
        connectors: entry.snapshot.connectors,
        ui: { ...s.ui, selectedShapeIds: [] },
      }));
      setTimeout(() => { isUndoRedoRef.current = false; }, 50);
      addHistoryEntry(`Restored: ${entry.action}`);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}>
      {/* Menu Bar */}
      <div className="h-8 flex items-center px-2 bg-white border-b flex-shrink-0" style={{ borderColor: '#E0E0E0', fontSize: '13px' }}>
        <div className="flex items-center gap-2 mr-3 cursor-pointer" onClick={() => navTo('/')}>
          <svg width="20" height="20" viewBox="0 0 20 20">
            <rect x="2" y="2" width="16" height="16" rx="2" fill="#F96B13" />
            <rect x="5" y="5" width="10" height="10" rx="1" fill="white" opacity="0.9" />
          </svg>
        </div>
        {editingTitle ? (
          <input
            autoFocus value={titleValue} onChange={e => setTitleValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
            onBlur={commitTitle}
            className="text-sm font-medium border border-blue-400 rounded px-1.5 py-0.5 mr-2 focus:outline-none"
            style={{ width: '200px' }}
          />
        ) : (
          <span className="text-sm font-medium mr-2 cursor-pointer hover:underline" onClick={() => { setEditingTitle(true); setTitleValue(doc.title); }}>
            {doc.title}
          </span>
        )}
        <button className={`mr-1 ${doc.starred ? 'text-orange-400' : 'text-gray-300 hover:text-orange-400'}`}
          onClick={() => updateDocument(documentId, { starred: !doc.starred })}>
          <Star size={14} fill={doc.starred ? 'currentColor' : 'none'} />
        </button>
        <span className="text-xs text-gray-500 mr-3 flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${doc.status === 'published' ? 'bg-green-500' : 'bg-orange-400'}`} />
          {doc.status === 'published' ? 'Published' : 'Draft'}
        </span>
        <span className="text-gray-300 mr-2">|</span>

        {/* Menu items */}
        <div className="flex items-center relative">
          {Object.keys(menus).map(menuName => (
            <div key={menuName} className="relative">
              <button
                className={`px-2 py-0.5 text-gray-700 hover:bg-gray-100 rounded text-[13px] ${openMenu === menuName ? 'bg-gray-100' : ''}`}
                onClick={() => setOpenMenu(openMenu === menuName ? null : menuName)}
                onMouseEnter={() => { if (openMenu) setOpenMenu(menuName); }}
              >
                {menuName}
              </button>
              {openMenu === menuName && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => { setOpenMenu(null); setHoveredSubmenu(null); }} />
                  <div className="absolute left-0 top-full mt-0.5 bg-white border border-gray-200 rounded shadow-lg py-1 w-56 z-40">
                    {menus[menuName].map((item, i) => {
                      if (item.type === 'divider') return <div key={i} className="border-t border-gray-100 my-1" />;
                      if (item.sub && item.subItems) {
                        return (
                          <div key={i} className="relative"
                            onMouseEnter={() => setHoveredSubmenu(item.label)}
                            onMouseLeave={() => setHoveredSubmenu(null)}>
                            <button
                              className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 text-left"
                              onClick={() => setHoveredSubmenu(hoveredSubmenu === item.label ? null : item.label)}
                            >
                              <span>{item.label}</span>
                              <span className="text-gray-400 text-xs">{'\u25B6'}</span>
                            </button>
                            {hoveredSubmenu === item.label && (
                              <div className="absolute left-full top-0 bg-white border border-gray-200 rounded shadow-lg py-1 w-36 z-50">
                                {item.subItems.map((sub, si) => (
                                  <button
                                    key={si}
                                    className="w-full flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                    onClick={() => { sub.action?.(); setOpenMenu(null); setHoveredSubmenu(null); }}
                                  >
                                    {sub.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <button
                          key={i}
                          className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 text-left"
                          onClick={() => { item.action?.(); setOpenMenu(null); }}
                        >
                          <span>{item.label}</span>
                          {item.shortcut && <span className="text-gray-400 text-xs">{item.shortcut}</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex-1" />
        <span className="text-xs text-green-600 mr-3">{'\u2713'} Saved</span>
        <button
          className="text-white text-sm font-medium px-4 py-1 rounded mr-2"
          style={{ backgroundColor: '#F96B13' }}
          onClick={() => setShareModalOpen(true)}
        >
          Share
        </button>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: state.currentUser.avatarColor }}>
          {state.currentUser.avatar}
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="h-10 flex items-center px-2 bg-white border-b flex-shrink-0 gap-1" style={{ borderColor: '#E0E0E0' }}>
        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Undo" onClick={performUndo}><Undo2 size={16} /></button>
        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Redo" onClick={performRedo}><Redo2 size={16} /></button>
        <div className="w-px h-5 bg-gray-200 mx-1" />

        <select
          className="h-7 border border-gray-200 rounded text-xs px-1 bg-white text-gray-700"
          style={{ width: '120px' }}
          value={firstSelected?.fontFamily || 'Liberation Sans'}
          onChange={e => updateSelectedProps({ fontFamily: e.target.value })}
        >
          {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          className="h-7 border border-gray-200 rounded text-xs px-1 bg-white text-gray-700 w-14"
          value={firstSelected?.fontSize || 10}
          onChange={e => updateSelectedProps({ fontSize: parseInt(e.target.value) })}
        >
          {FONT_SIZES.map(s => <option key={s} value={s}>{s} pt</option>)}
        </select>

        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button
          className={`p-1.5 rounded text-gray-600 hover:bg-gray-100 ${firstSelected?.fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : ''}`}
          onClick={() => updateSelectedProps({ fontWeight: firstSelected?.fontWeight === 'bold' ? 'normal' : 'bold' })}
          title="Bold"
        ><Bold size={14} /></button>
        <button
          className={`p-1.5 rounded text-gray-600 hover:bg-gray-100 ${firstSelected?.fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : ''}`}
          onClick={() => updateSelectedProps({ fontStyle: firstSelected?.fontStyle === 'italic' ? 'normal' : 'italic' })}
          title="Italic"
        ><Italic size={14} /></button>

        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button
          className={`p-1.5 rounded text-gray-600 hover:bg-gray-100 ${firstSelected?.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : ''}`}
          onClick={() => updateSelectedProps({ textAlign: 'left' })}
          title="Align Left"
        ><AlignLeft size={14} /></button>
        <button
          className={`p-1.5 rounded text-gray-600 hover:bg-gray-100 ${!firstSelected || firstSelected?.textAlign === 'center' ? 'bg-blue-50' : ''}`}
          onClick={() => updateSelectedProps({ textAlign: 'center' })}
          title="Align Center"
        ><AlignCenter size={14} /></button>
        <button
          className={`p-1.5 rounded text-gray-600 hover:bg-gray-100 ${firstSelected?.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : ''}`}
          onClick={() => updateSelectedProps({ textAlign: 'right' })}
          title="Align Right"
        ><AlignRight size={14} /></button>

        <div className="w-px h-5 bg-gray-200 mx-1" />
        <div className="relative">
          <label className="p-1.5 hover:bg-gray-100 rounded cursor-pointer block" title="Fill Color">
            <PaintBucket size={14} className="text-gray-600" />
            <input type="color" className="absolute opacity-0 w-0 h-0" value={firstSelected?.fillColor || '#FFFFFF'}
              onChange={e => updateSelectedProps({ fillColor: e.target.value })} />
          </label>
        </div>
        <div className="relative">
          <label className="p-1.5 hover:bg-gray-100 rounded cursor-pointer block" title="Border Color">
            <Palette size={14} className="text-gray-600" />
            <input type="color" className="absolute opacity-0 w-0 h-0" value={firstSelected?.borderColor || '#333333'}
              onChange={e => updateSelectedProps({ borderColor: e.target.value })} />
          </label>
        </div>

        <div className="w-px h-5 bg-gray-200 mx-1" />
        <select className="h-7 border border-gray-200 rounded text-xs px-1 bg-white text-gray-700 w-16"
          value={firstSelected?.borderStyle || 'solid'}
          onChange={e => updateSelectedProps({ borderStyle: e.target.value })}>
          <option value="solid">{'\u2500\u2500\u2500'}</option>
          <option value="dashed">{'\u2500 \u2500 \u2500'}</option>
          <option value="dotted">{'\u00B7\u00B7\u00B7'}</option>
        </select>
        <select className="h-7 border border-gray-200 rounded text-xs px-1 bg-white text-gray-700 w-14"
          value={firstSelected?.borderWidth || 2}
          onChange={e => updateSelectedProps({ borderWidth: parseInt(e.target.value) })}>
          {[1, 2, 3, 4].map(w => <option key={w} value={w}>{w} px</option>)}
        </select>

        <div className="flex-1" />
        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Lock"
          onClick={() => updateSelectedProps({ locked: !firstSelected?.locked })}>
          {firstSelected?.locked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>
        <button className="p-1.5 hover:bg-red-50 rounded text-red-400" title="Delete"
          onClick={() => { if (selectedIds.length) { deleteShapes(selectedIds); setUI({ selectedShapeIds: [] }); } }}>
          <Trash2 size={14} />
        </button>
      </div>

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Shape Panel */}
        <div className="w-[180px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Shapes</span>
            <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setShapePanelSearch(shapePanelSearch ? '' : ' ')}>
              <Search size={14} className="text-gray-400" />
            </button>
          </div>
          {shapePanelSearch !== '' && (
            <div className="px-2 py-1 border-b border-gray-100">
              <input
                autoFocus value={shapePanelSearch.trim()} onChange={e => setShapePanelSearch(e.target.value)}
                placeholder="Search shapes..."
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
              />
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {/* Standard */}
            <div>
              <button className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                onClick={() => setShapeSections(s => ({ ...s, standard: !s.standard }))}>
                <span>Standard</span>
                <ChevronDown size={12} className={`transform ${shapeSections.standard ? '' : '-rotate-90'}`} />
              </button>
              {shapeSections.standard && renderShapePanel(STANDARD_SHAPES, 'standard')}
            </div>
            {/* Flowchart */}
            <div>
              <button className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                onClick={() => setShapeSections(s => ({ ...s, flowchart: !s.flowchart }))}>
                <span>Flowchart</span>
                <ChevronDown size={12} className={`transform ${shapeSections.flowchart ? '' : '-rotate-90'}`} />
              </button>
              {shapeSections.flowchart && renderShapePanel(FLOWCHART_SHAPES, 'flowchart')}
            </div>
            {/* Shapes */}
            <div>
              <button className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                onClick={() => setShapeSections(s => ({ ...s, shapes: !s.shapes }))}>
                <span>Shapes</span>
                <ChevronDown size={12} className={`transform ${shapeSections.shapes ? '' : '-rotate-90'}`} />
              </button>
              {shapeSections.shapes && renderShapePanel(BASIC_SHAPES, 'shapes')}
            </div>
          </div>
          <div className="p-2 border-t border-gray-100">
            <button
              className="w-full text-center text-xs font-medium text-white py-2 rounded"
              style={{ backgroundColor: '#4A86C8' }}
              onClick={handleImport}
            >
              More shapes
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-auto relative"
          style={{ backgroundColor: '#F0F0F0' }}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onWheel={handleCanvasWheel}
        >
          <svg
            ref={svgRef}
            width={(activePage?.width || 1200) * zoom}
            height={(activePage?.height || 900) * zoom}
            viewBox={`0 0 ${activePage?.width || 1200} ${activePage?.height || 900}`}
            style={{ backgroundColor: activePage?.backgroundColor || '#FFFFFF', margin: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'block' }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenuCanvas}
          >
            {/* Grid */}
            {activePage?.gridVisible && (
              <>
                <defs>
                  <pattern id="grid" width={activePage.gridSize || 20} height={activePage.gridSize || 20} patternUnits="userSpaceOnUse">
                    <path d={`M ${activePage.gridSize || 20} 0 L 0 0 0 ${activePage.gridSize || 20}`} fill="none" stroke="#E8E8E8" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </>
            )}

            {/* Arrow marker defs */}
            <defs>
              <marker id="arrow-marker" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
              </marker>
              <marker id="arrow-marker-blue" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#0D99FF" />
              </marker>
            </defs>

            {/* Connectors */}
            {pageConnectors.map(conn => {
              const sourceShape = pageShapes.find(s => s.id === conn.sourceShapeId);
              const targetShape = pageShapes.find(s => s.id === conn.targetShapeId);
              if (!sourceShape || !targetShape) return null;
              const sp = getConnectionPoint(sourceShape, conn.sourcePoint);
              const tp = getConnectionPoint(targetShape, conn.targetPoint);
              const path = getConnectorPath(sp, tp, conn.routingType);
              const isSelected = selectedIds.includes(conn.id);
              const dashArray = conn.lineStyle === 'dashed' ? '8,4' : conn.lineStyle === 'dotted' ? '2,2' : undefined;

              return (
                <g key={conn.id} data-conn-id={conn.id}>
                  {/* Invisible wider line for easier clicking */}
                  <path d={path} stroke="transparent" strokeWidth={12} fill="none" style={{ cursor: 'pointer' }} />
                  <path
                    d={path}
                    stroke={isSelected ? '#0D99FF' : conn.lineColor}
                    strokeWidth={isSelected ? conn.lineWidth + 1 : conn.lineWidth}
                    fill="none"
                    strokeDasharray={dashArray}
                    markerEnd={conn.targetArrow !== 'none' ? (isSelected ? 'url(#arrow-marker-blue)' : 'url(#arrow-marker)') : undefined}
                    style={{ cursor: 'pointer' }}
                  />
                  {conn.label && (() => {
                    const lx = sp.x + (tp.x - sp.x) * conn.labelPosition;
                    const ly = sp.y + (tp.y - sp.y) * conn.labelPosition - 8;
                    return (
                      <text x={lx} y={ly} textAnchor="middle" fontSize="11" fill="#666" style={{ pointerEvents: 'none' }}>
                        {conn.label}
                      </text>
                    );
                  })()}
                </g>
              );
            })}

            {/* Shapes */}
            {[...pageShapes].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map(shape => {
              const isSelected = selectedIds.includes(shape.id);
              const isEditing = editingShapeId === shape.id;
              const isHovered = hoveredShapeId === shape.id;

              // 8 resize handle positions: TL, TM, TR, ML, MR, BL, BM, BR
              const handles = [
                [shape.x - 3, shape.y - 3],
                [shape.x + shape.width / 2 - 3, shape.y - 3],
                [shape.x + shape.width - 3, shape.y - 3],
                [shape.x - 3, shape.y + shape.height / 2 - 3],
                [shape.x + shape.width - 3, shape.y + shape.height / 2 - 3],
                [shape.x - 3, shape.y + shape.height - 3],
                [shape.x + shape.width / 2 - 3, shape.y + shape.height - 3],
                [shape.x + shape.width - 3, shape.y + shape.height - 3],
              ];

              return (
                <g key={shape.id} data-shape-id={shape.id}
                  onMouseEnter={() => setHoveredShapeId(shape.id)}
                  onMouseLeave={() => setHoveredShapeId(null)}
                  style={{ cursor: shape.locked ? 'default' : 'move', opacity: shape.opacity }}>
                  {getShapeSVG(shape)}

                  {/* Text */}
                  {!isEditing && shape.text && (
                    <foreignObject x={shape.x} y={shape.y} width={shape.width} height={shape.height} style={{ pointerEvents: 'none' }}>
                      <div style={{
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: shape.textAlign === 'left' ? 'flex-start' : shape.textAlign === 'right' ? 'flex-end' : 'center',
                        textAlign: shape.textAlign, padding: '4px 8px', fontSize: `${shape.fontSize}px`,
                        fontFamily: shape.fontFamily || 'Arial', fontWeight: shape.fontWeight,
                        fontStyle: shape.fontStyle, color: shape.textColor, whiteSpace: 'pre-wrap',
                        lineHeight: '1.3', overflow: 'hidden'
                      }}>
                        {shape.text}
                      </div>
                    </foreignObject>
                  )}

                  {/* Editing */}
                  {isEditing && (
                    <foreignObject x={shape.x} y={shape.y} width={shape.width} height={shape.height}>
                      <textarea
                        autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Escape') commitTextEdit(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitTextEdit(); } }}
                        onBlur={commitTextEdit}
                        style={{
                          width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none',
                          textAlign: shape.textAlign || 'center', fontSize: `${shape.fontSize}px`,
                          fontFamily: shape.fontFamily || 'Arial', fontWeight: shape.fontWeight,
                          fontStyle: shape.fontStyle, color: shape.textColor, resize: 'none', padding: '4px 8px'
                        }}
                      />
                    </foreignObject>
                  )}

                  {/* Selection handles with resize capability */}
                  {isSelected && !isEditing && (
                    <>
                      <rect x={shape.x - 2} y={shape.y - 2} width={shape.width + 4} height={shape.height + 4}
                        fill="none" stroke="#0D99FF" strokeWidth="1" strokeDasharray="4,2" />
                      {handles.map(([hx, hy], i) => (
                        <rect
                          key={i}
                          x={hx} y={hy} width={6} height={6}
                          fill="white" stroke="#0D99FF" strokeWidth="1"
                          style={{ cursor: RESIZE_CURSORS[i] }}
                          data-resize-handle={i}
                          data-shape-id={shape.id}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const pos = getMousePos(e);
                            pushUndoSnapshot();
                            setDragInfo({
                              type: 'resize',
                              handleIndex: i,
                              shapeId: shape.id,
                              startX: pos.x, startY: pos.y,
                              origX: shape.x, origY: shape.y,
                              origW: shape.width, origH: shape.height
                            });
                          }}
                        />
                      ))}
                    </>
                  )}

                  {/* Connection points on hover */}
                  {(isHovered || isSelected) && !isEditing && (
                    <>
                      {[
                        { cx: shape.x + shape.width / 2, cy: shape.y, point: 'top' },
                        { cx: shape.x + shape.width, cy: shape.y + shape.height / 2, point: 'right' },
                        { cx: shape.x + shape.width / 2, cy: shape.y + shape.height, point: 'bottom' },
                        { cx: shape.x, cy: shape.y + shape.height / 2, point: 'left' },
                      ].map(({ cx, cy, point }) => (
                        <circle key={point} cx={cx} cy={cy} r={4} fill="#0D99FF" stroke="white" strokeWidth="1.5"
                          style={{ cursor: 'crosshair' }}
                          onMouseDown={(e) => { e.stopPropagation(); startConnection(shape.id, point); }}
                        />
                      ))}
                    </>
                  )}
                </g>
              );
            })}

            {/* Connect preview line */}
            {connectingFrom && connectPreview && (() => {
              const srcShape = pageShapes.find(s => s.id === connectingFrom.shapeId);
              if (!srcShape) return null;
              const sp = getConnectionPoint(srcShape, connectingFrom.point);
              return <line x1={sp.x} y1={sp.y} x2={connectPreview.x} y2={connectPreview.y} stroke="#0D99FF" strokeWidth="2" strokeDasharray="4,4" />;
            })()}

            {/* Selection box */}
            {selectionBox && selectionBox.width > 0 && (
              <rect x={selectionBox.x} y={selectionBox.y} width={selectionBox.width} height={selectionBox.height}
                fill="rgba(13,153,255,0.08)" stroke="#0D99FF" strokeWidth="1" strokeDasharray="4,2" />
            )}
          </svg>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-shrink-0" style={{ backgroundColor: '#FAFAFA' }}>
          {/* Icon strip */}
          <div className="w-10 border-l border-gray-200 flex flex-col items-center py-2 gap-1">
            {[
              { id: 'settings', icon: Settings, label: 'SETTINGS' },
              { id: 'comments', icon: MessageSquare, label: 'COMMENT' },
              { id: 'layers', icon: Layers, label: 'LAYERS' },
              { id: 'history', icon: Clock, label: 'HISTORY' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`w-9 flex flex-col items-center justify-center py-1.5 rounded text-gray-500 hover:bg-gray-200 ${rightPanelTab === tab.id ? 'bg-blue-100 text-blue-600' : ''}`}
                onClick={() => setRightPanelTab(rightPanelTab === tab.id ? null : tab.id)}
                title={tab.label}
              >
                <tab.icon size={16} />
                <span className="text-[8px] mt-0.5">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Panel content */}
          {rightPanelTab && (
            <div className="w-[240px] border-l border-gray-200 bg-white flex flex-col overflow-hidden">
              {rightPanelTab === 'comments' && (
                <>
                  <div className="p-3 border-b border-gray-100 font-semibold text-sm">Comments</div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {pageComments.map(c => (
                      <div key={c.id} className={`p-2 mb-2 rounded border ${c.resolved ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                            style={{ backgroundColor: getUserById(c.authorId)?.avatarColor || '#999' }}>
                            {getUserById(c.authorId)?.avatar || '?'}
                          </div>
                          <span className="text-xs font-semibold">{c.authorName}</span>
                          <span className="text-[10px] text-gray-400 ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-700 mb-1">{c.text}</p>
                        {c.replies?.map(r => (
                          <div key={r.id} className="ml-4 border-l-2 border-gray-200 pl-2 mt-1">
                            <span className="text-[10px] font-semibold">{r.authorName}</span>
                            <p className="text-[10px] text-gray-600">{r.text}</p>
                          </div>
                        ))}
                        {!c.resolved && (
                          <div className="mt-2">
                            <div className="flex gap-1">
                              <input
                                value={replyTexts[c.id] || ''}
                                onChange={e => setReplyTexts(prev => ({ ...prev, [c.id]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddReply(c.id); } }}
                                placeholder="Reply..."
                                className="flex-1 border border-gray-200 rounded text-[10px] px-1.5 py-1 focus:outline-none focus:border-blue-400"
                              />
                              <button
                                className="text-[10px] text-white px-2 py-1 rounded"
                                style={{ backgroundColor: '#4A86C8' }}
                                onClick={() => handleAddReply(c.id)}
                              >
                                Reply
                              </button>
                            </div>
                            <button className="text-[10px] text-green-600 mt-1 hover:underline"
                              onClick={() => updateComment(c.id, { resolved: true })}>
                              Resolve
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-100">
                    <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                      placeholder="Add a comment..." rows={2}
                      className="w-full border border-gray-200 rounded text-xs p-2 resize-none focus:outline-none focus:border-blue-400" />
                    <button className="mt-1 w-full text-xs font-medium text-white py-1.5 rounded"
                      style={{ backgroundColor: '#4A86C8' }} onClick={handleAddComment}>
                      Comment
                    </button>
                  </div>
                </>
              )}
              {rightPanelTab === 'layers' && (
                <>
                  <div className="p-3 border-b border-gray-100 font-semibold text-sm">Layers</div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {[...pageShapes].reverse().map(s => (
                      <div key={s.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer hover:bg-gray-50 ${selectedIds.includes(s.id) ? 'bg-blue-50' : ''}`}
                        onClick={() => setUI({ selectedShapeIds: [s.id] })}>
                        <span className="truncate flex-1">{s.text || s.type}</span>
                        <button onClick={e => { e.stopPropagation(); updateShape(s.id, { visible: !s.visible }); }}
                          className="text-gray-400 hover:text-gray-600">
                          {s.visible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <button onClick={e => { e.stopPropagation(); updateShape(s.id, { locked: !s.locked }); }}
                          className="text-gray-400 hover:text-gray-600">
                          {s.locked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {rightPanelTab === 'settings' && activePage && (
                <>
                  <div className="p-3 border-b border-gray-100 font-semibold text-sm">Page Settings</div>
                  <div className="p-3 space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Page Name</label>
                      <input className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                        value={activePage.name} onChange={e => updatePage(activePage.id, { name: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 block mb-1">Width</label>
                        <input type="number" className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                          value={activePage.width} onChange={e => updatePage(activePage.id, { width: parseInt(e.target.value) || 1200 })} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 block mb-1">Height</label>
                        <input type="number" className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                          value={activePage.height} onChange={e => updatePage(activePage.id, { height: parseInt(e.target.value) || 900 })} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={activePage.gridVisible}
                        onChange={e => updatePage(activePage.id, { gridVisible: e.target.checked })} />
                      <label className="text-xs text-gray-600">Show Grid</label>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Grid Size (px)</label>
                      <input type="number" className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                        value={activePage.gridSize} onChange={e => updatePage(activePage.id, { gridSize: parseInt(e.target.value) || 20 })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Background Color</label>
                      <input type="color" className="w-full h-7 border border-gray-200 rounded px-1 focus:outline-none cursor-pointer"
                        value={activePage.backgroundColor || '#FFFFFF'}
                        onChange={e => updatePage(activePage.id, { backgroundColor: e.target.value })} />
                    </div>
                  </div>
                </>
              )}
              {rightPanelTab === 'history' && (
                <>
                  <div className="p-3 border-b border-gray-100 font-semibold text-sm">History</div>
                  <div className="flex-1 overflow-y-auto">
                    {historyEntries.map((entry, idx) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-2 px-3 py-2 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                        onClick={() => restoreHistoryEntry(entry)}
                        title="Click to restore this state"
                      >
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-800 font-medium truncate">{entry.action}</p>
                          <p className="text-[10px] text-gray-400">
                            {entry.user} &bull; {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-8 flex items-center px-2 bg-white border-t flex-shrink-0 gap-2" style={{ borderColor: '#E0E0E0' }}>
        <div className="flex items-center gap-1">
          {docPages.map(page => (
            <div key={page.id} className="flex items-center group">
              <button
                className={`px-3 py-0.5 text-xs font-medium rounded-l ${page.id === activePageId ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                style={page.id === activePageId ? { backgroundColor: '#4A86C8' } : {}}
                onClick={() => setActivePageId(page.id)}
              >
                {page.name}
              </button>
              {docPages.length > 1 && (
                <button
                  className={`px-1 py-0.5 text-xs rounded-r opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 ${page.id === activePageId ? 'text-white opacity-60' : 'text-gray-400'}`}
                  style={page.id === activePageId ? { backgroundColor: '#4A86C8' } : {}}
                  onClick={(e) => { e.stopPropagation(); handleDeletePage(page.id); }}
                  title="Delete page"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
          <button className="p-0.5 hover:bg-gray-100 rounded text-gray-400" onClick={handleAddPage} title="Add page">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{pageShapes.length}/60</span>
          <div className="flex items-center gap-1">
            <button className="p-0.5 hover:bg-gray-100 rounded" onClick={() => {
              const idx = ZOOM_LEVELS.indexOf(zoomLevel);
              if (idx > 0) setUI({ zoomLevel: ZOOM_LEVELS[idx - 1] });
            }}><Minus size={12} /></button>
            <select className="border-none bg-transparent text-xs text-gray-600 focus:outline-none" value={zoomLevel}
              onChange={e => setUI({ zoomLevel: parseInt(e.target.value) })}>
              {ZOOM_LEVELS.map(z => <option key={z} value={z}>{z}%</option>)}
            </select>
            <button className="p-0.5 hover:bg-gray-100 rounded" onClick={() => {
              const idx = ZOOM_LEVELS.indexOf(zoomLevel);
              if (idx < ZOOM_LEVELS.length - 1) setUI({ zoomLevel: ZOOM_LEVELS[idx + 1] });
            }}><Plus size={12} /></button>
          </div>
          {selectedIds.length > 0 && <span>Selected: {selectedIds.length}</span>}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div className="fixed z-50 bg-white rounded shadow-lg border border-gray-200 py-1 w-52"
            style={{ left: contextMenu.x, top: contextMenu.y }}>
            {contextMenu.shapeId ? (
              <>
                <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => { deleteShapes([contextMenu.shapeId]); setContextMenu(null); }}>Delete</button>
                <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => {
                    const s = pageShapes.find(sh => sh.id === contextMenu.shapeId);
                    if (s) { const id = `shape-${uuidv4().slice(0, 8)}`; addShape({ ...s, id, x: s.x + 20, y: s.y + 20 }); }
                    setContextMenu(null);
                  }}>Duplicate</button>
                <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => {
                    const s = pageShapes.find(sh => sh.id === contextMenu.shapeId);
                    if (s) setClipboard({ shapes: [JSON.parse(JSON.stringify(s))] });
                    setContextMenu(null);
                  }}>Copy</button>
                <div className="border-t border-gray-100 my-1" />
                <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => {
                    const maxZ = Math.max(...pageShapes.map(s => s.zIndex || 0), 0);
                    updateShape(contextMenu.shapeId, { zIndex: maxZ + 1 });
                    setContextMenu(null);
                  }}>Bring to Front</button>
                <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => {
                    const minZ = Math.min(...pageShapes.map(s => s.zIndex || 0), 0);
                    updateShape(contextMenu.shapeId, { zIndex: minZ - 1 });
                    setContextMenu(null);
                  }}>Send to Back</button>
                <div className="border-t border-gray-100 my-1" />
                <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => { updateShape(contextMenu.shapeId, { locked: !pageShapes.find(s => s.id === contextMenu.shapeId)?.locked }); setContextMenu(null); }}>
                  {pageShapes.find(s => s.id === contextMenu.shapeId)?.locked ? 'Unlock' : 'Lock'}
                </button>
              </>
            ) : contextMenu.connId ? (
              <>
                <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 text-red-600"
                  onClick={() => { deleteConnector(contextMenu.connId); setContextMenu(null); }}>Delete Connector</button>
              </>
            ) : (
              <>
                <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => { addShapeToCanvas('text', 'standard'); setContextMenu(null); }}>Add Text</button>
                <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => { addShapeToCanvas('sticky_note', 'standard'); setContextMenu(null); }}>Add Sticky Note</button>
                {clipboard && clipboard.shapes && clipboard.shapes.length > 0 && (
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                    onClick={() => { performPaste(); setContextMenu(null); }}>Paste</button>
                )}
                <div className="border-t border-gray-100 my-1" />
                <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => { setUI({ selectedShapeIds: pageShapes.map(s => s.id) }); setContextMenu(null); }}>Select All</button>
              </>
            )}
          </div>
        </>
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-[440px] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Share "{doc.title}"</h3>
              <button onClick={() => setShareModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                value={shareEmail} onChange={e => setShareEmail(e.target.value)}
                placeholder="Add people by email"
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                onKeyDown={e => { if (e.key === 'Enter') handleAddShare(); }}
              />
              <select value={sharePermission} onChange={e => setSharePermission(e.target.value)}
                className="border border-gray-300 rounded px-2 text-sm">
                <option value="view">Can view</option>
                <option value="edit">Can edit</option>
              </select>
              <button onClick={handleAddShare} className="text-white px-3 py-2 rounded text-sm font-medium" style={{ backgroundColor: '#4A86C8' }}>Add</button>
            </div>
            <div className="mb-4">
              {(doc.sharedWith || []).map(s => {
                const u = getUserById(s.userId);
                if (!u) return null;
                return (
                  <div key={s.userId} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: u.avatarColor }}>
                        {u.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Can {s.permission}</span>
                      <button onClick={() => handleRemoveShare(s.userId)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => { navigator.clipboard?.writeText(`https://lucidchart.mock/editor/${documentId}`); }}
                className="text-sm text-blue-600 hover:underline"
              >
                Copy link
              </button>
              <button onClick={() => setShareModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white rounded" style={{ backgroundColor: '#4A86C8' }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
