import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Transformer, Line } from 'react-konva';
import { 
  MousePointer2, StickyNote as StickyIcon, Square, Circle as CircleIcon,
  Type, Image as ImageIcon, Layout, ArrowRight,
  ZoomIn, ZoomOut, Hand, Download, Trash2, Copy,
  MoreHorizontal, Play, Pause, RotateCcw, CheckCircle2,
  Grid, Maximize, ArrowUpRight, Frame as FrameIcon,
  Palette, Type as TypeIcon, Minus, HelpCircle, Layers, Link, X
} from 'lucide-react';
import { useWhiteboardStore } from './store';
import { StickyNote, Shape, UrlImage, Connector, Frame, TextObject, MockCursor } from './components/CanvasObjects';
import { generateId, COLORS, STROKE_COLORS } from './utils';

// --- Main App Component ---
function App() {
  const {
    data,
    loading,
    addObject,
    updateObject,
    deleteObject,
    updateView,
    updateBoardName,
    loadTemplate,
    getStateReport
  } = useWhiteboardStore();

  // Local UI State
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select'); // select, hand, sticky, rect, circle, text, connector, frame
  const [isGoMode, setIsGoMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [votingMode, setVotingMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareNotice, setShareNotice] = useState('');
  
  // Default Styles (for new objects)
  const [defaultFill, setDefaultFill] = useState(COLORS.yellow);
  const [defaultStroke, setDefaultStroke] = useState(STROKE_COLORS.blue);
  const [defaultFontSize, setDefaultFontSize] = useState(16);
  const [defaultFontFamily, setDefaultFontFamily] = useState('Inter');
  
  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editPosition, setEditPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  // Connector State
  const [connectorStart, setConnectorStart] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Refs
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- Routing Simulation ---
  useEffect(() => {
    if (window.location.pathname === '/go') {
      setIsGoMode(true);
    }
  }, []);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingId) return; // Disable shortcuts while editing text

      if (e.code === 'Space') {
        if (tool !== 'hand') setTool('hand');
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedId) {
          deleteObject(selectedId);
          setSelectedId(null);
        }
      } else if (e.code === 'KeyZ') {
        // Simple zoom toggle for mock
        updateView({ scale: data.view.scale === 1 ? 0.5 : 1 });
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedId, tool, editingId]);

  // --- Timer Logic ---
  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timer]);

  useEffect(() => {
    if (!showShare && !showTemplates) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowShare(false);
        setShowTemplates(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showShare, showTemplates]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- Canvas Interaction Handlers ---
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    };
    stage.position(newPos);
    updateView({ x: newPos.x, y: newPos.y, scale: newScale });
    
    // Update edit position if editing
    if (editingId) updateEditPosition(editingId);
  };

  const handleMouseMove = (e) => {
    if (connectorStart) {
      const stage = stageRef.current;
      const pos = stage.getRelativePointerPosition();
      setMousePos(pos);
    }
  };

  const updateEditPosition = (id) => {
    const stage = stageRef.current;
    const obj = data.objects.find(o => o.id === id);
    if (!obj || !stage) return;

    const absPos = stage.getAbsoluteTransform().point({ x: obj.x, y: obj.y });
    setEditPosition({
      left: absPos.x,
      top: absPos.y,
      width: obj.width * stage.scaleX(),
      height: obj.height * stage.scaleY()
    });
  };

  const handleStageClick = (e) => {
    // If clicked on empty stage
    if (e.target === stageRef.current) {
      setSelectedId(null);
      if (editingId) {
        // Commit edit
        updateObject(editingId, { text: editValue });
        setEditingId(null);
      }
      
      const pos = stageRef.current.getRelativePointerPosition();
      
      // Tool Actions
      if (tool === 'sticky') {
        const id = generateId();
        addObject({
          id: id,
          type: 'sticky',
          x: pos.x - 75,
          y: pos.y - 75,
          width: 150,
          height: 150,
          text: '',
          fill: defaultFill,
          votes: 0
        });
        setTool('select');
        setSelectedId(id); // Auto-select to show properties
      } else if (tool === 'rect') {
        const id = generateId();
        addObject({
          id: id,
          type: 'shape',
          shapeType: 'rect',
          x: pos.x - 50,
          y: pos.y - 50,
          width: 100,
          height: 100,
          fill: defaultFill === COLORS.yellow ? COLORS.blue : defaultFill, // Default to blue for rects if yellow
          stroke: defaultStroke,
          strokeWidth: 2,
          votes: 0
        });
        setTool('select');
        setSelectedId(id);
      } else if (tool === 'circle') {
        const id = generateId();
        addObject({
          id: id,
          type: 'shape',
          shapeType: 'circle',
          x: pos.x,
          y: pos.y,
          width: 100,
          height: 100,
          fill: defaultFill === COLORS.yellow ? COLORS.green : defaultFill,
          stroke: defaultStroke,
          strokeWidth: 2,
          votes: 0
        });
        setTool('select');
        setSelectedId(id);
      } else if (tool === 'frame') {
        const id = generateId();
        addObject({
          id: id,
          type: 'frame',
          title: 'New Frame',
          x: pos.x - 200,
          y: pos.y - 150,
          width: 400,
          height: 300,
          fill: '#ffffff'
        });
        setTool('select');
        setSelectedId(id);
      } else if (tool === 'text') {
        const id = generateId();
        addObject({
          id: id,
          type: 'text',
          x: pos.x,
          y: pos.y,
          width: 200,
          height: 50,
          text: 'Type here...',
          fill: '#050038',
          fontSize: defaultFontSize,
          fontFamily: defaultFontFamily,
          votes: 0
        });
        setTool('select');
        setSelectedId(id);
        // Auto enter edit mode
        setTimeout(() => startEditing(id, 'Type here...'), 50);
      } else if (tool === 'connector') {
        // Reset connector start if clicked on empty space
        setConnectorStart(null);
      }
      return;
    }
  };

  const handleObjectClick = (e, obj) => {
    if (votingMode) {
      e.cancelBubble = true;
      handleVote(obj.id);
      return;
    }

    if (tool === 'connector') {
      e.cancelBubble = true;
      if (!connectorStart) {
        setConnectorStart(obj);
        // Set initial mouse pos for rubber band
        const stage = stageRef.current;
        setMousePos(stage.getRelativePointerPosition());
      } else {
        // Create connector
        if (connectorStart.id !== obj.id) {
          addObject({
            id: generateId(),
            type: 'connector',
            points: [
              connectorStart.x + connectorStart.width/2, 
              connectorStart.y + connectorStart.height/2,
              obj.x + obj.width/2,
              obj.y + obj.height/2
            ],
            from: connectorStart.id,
            to: obj.id,
            stroke: defaultStroke,
            strokeWidth: 2
          });
        }
        setConnectorStart(null);
        setTool('select');
      }
      return;
    }

    if (tool === 'select') {
      e.cancelBubble = true;
      setSelectedId(obj.id);
      if (editingId && editingId !== obj.id) {
         updateObject(editingId, { text: editValue });
         setEditingId(null);
      }
    }
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setEditValue(text);
    updateEditPosition(id);
    // Focus happens via useEffect or ref
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 50);
  };

  // --- Object Modification ---
  const handleObjectChange = (id, newAttrs) => {
    updateObject(id, newAttrs);
    if (editingId === id) updateEditPosition(id);
  };

  const handleVote = (id) => {
    if (!votingMode) return;
    const obj = data.objects.find(o => o.id === id);
    if (obj) {
      updateObject(id, { votes: (obj.votes || 0) + 1 });
    }
  };

  const handleFitToContent = () => {
    if (data.objects.length === 0) return;
    
    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    data.objects.forEach(obj => {
      if (obj.type === 'connector') return; // Skip connectors for bounds
      minX = Math.min(minX, obj.x);
      minY = Math.min(minY, obj.y);
      maxX = Math.max(maxX, obj.x + (obj.width || 0));
      maxY = Math.max(maxY, obj.y + (obj.height || 0));
    });

    const padding = 50;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    
    const scaleX = window.innerWidth / width;
    const scaleY = window.innerHeight / height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in too much

    const x = -minX * scale + (window.innerWidth - width * scale) / 2 + padding * scale;
    const y = -minY * scale + (window.innerHeight - height * scale) / 2 + padding * scale;

    stageRef.current.scale({ x: scale, y: scale });
    stageRef.current.position({ x, y });
    updateView({ x, y, scale });
  };

  const addImageObject = (url, pos, fileMeta = {}) => {
    addObject({
      id: generateId(),
      type: 'image',
      url,
      x: pos.x - 200,
      y: pos.y - 150,
      width: 400,
      height: 300,
      fileName: fileMeta.name,
      fileType: fileMeta.type,
      fileSize: fileMeta.size
    });
  };

  const addImageFile = (file, pos) => {
    const reader = new FileReader();
    reader.onload = () => addImageObject(reader.result, pos, file);
    reader.readAsDataURL(file);
  };

  // --- Drag and Drop Image Import ---
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    
    stage.setPointersPositions(e);
    const pos = stage.getRelativePointerPosition();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      addImageFile(file, pos);
    }
  };

  // --- Transformer Logic ---
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const node = stageRef.current.findOne('#' + selectedId);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, data.objects]);

  // --- Templates ---
  const applyTemplate = (type) => {
    setShowTemplates(false);
    const center = { x: -data.view.x + window.innerWidth/2, y: -data.view.y + window.innerHeight/2 };
    let newObjects = [];
    
    if (type === 'kanban') {
      ['To Do', 'In Progress', 'Done'].forEach((title, i) => {
        newObjects.push({
          id: generateId(),
          type: 'frame',
          title: title,
          x: center.x + (i * 320) - 400,
          y: center.y - 200,
          width: 300,
          height: 500,
          fill: '#f8f9fa'
        });
      });
    } else if (type === 'retrospective') {
      ['Went Well', 'To Improve', 'Action Items'].forEach((title, i) => {
        newObjects.push({
          id: generateId(),
          type: 'sticky',
          text: title,
          x: center.x + (i * 220) - 300,
          y: center.y - 100,
          width: 200,
          height: 200,
          fill: i === 0 ? COLORS.green : i === 1 ? COLORS.pink : COLORS.blue,
          votes: 0
        });
      });
    } else if (type === 'brainstorm') {
        // Simple 3x3 grid of stickies
        for(let i=0; i<3; i++) {
            for(let j=0; j<3; j++) {
                newObjects.push({
                    id: generateId(),
                    type: 'sticky',
                    text: 'Idea',
                    x: center.x + (i * 160) - 240,
                    y: center.y + (j * 160) - 240,
                    width: 150,
                    height: 150,
                    fill: COLORS.yellow,
                    votes: 0
                });
            }
        }
    }
    loadTemplate(newObjects);
  };

  // --- Image Upload ---
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const center = { x: -data.view.x + window.innerWidth/2, y: -data.view.y + window.innerHeight/2 };
    addImageFile(file, center);
    event.target.value = '';
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.name || 'xiro-board'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyShareLink = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    setShareNotice('Board link copied locally');
  };

  // --- Loading State ---
  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  // --- Render /go Endpoint ---
  if (isGoMode) {
    const report = getStateReport();
    return (
      <pre className="json-pre">
        {JSON.stringify(report, null, 2)}
      </pre>
    );
  }

  // --- Render Main App ---
  const selectedObject = data.objects.find(o => o.id === selectedId);

  return (
    <div 
      style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      
      {/* --- Top Bar --- */}
      <div className="ui-panel" style={{ 
        position: 'absolute', top: 20, left: 20, right: 20, height: 60, zIndex: 10,
        display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 'bold', fontSize: 20, color: '#050038' }}>Xiro Mock</div>
          <div style={{ height: 20, width: 1, background: '#ccc' }} />
          <input
            value={data.name}
            onChange={(event) => updateBoardName(event.target.value)}
            style={{ border: '1px solid transparent', borderRadius: 4, padding: '4px 6px', fontSize: 14, minWidth: 180 }}
            aria-label="Board name"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <button className="tool-btn" onClick={() => setShowGrid(!showGrid)} title="Toggle grid">
            <Grid size={18} />
          </button>
          <button className="tool-btn" onClick={handleFitToContent} title="Fit to content">
            <Maximize size={18} />
          </button>
          <button className="tool-btn" onClick={handleDownloadJson} title="Download board JSON">
            <Download size={18} />
          </button>
          {/* Timer Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f0f0f4', padding: '4px 8px', borderRadius: 4 }}>
            <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{formatTime(timer)}</div>
            <button className="tool-btn" style={{ width: 24, height: 24 }} onClick={() => {
              if (isTimerRunning) setIsTimerRunning(false);
              else {
                if (timer === 0) setTimer(60); // Default 1 min
                setIsTimerRunning(true);
              }
            }}>
              {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button className="tool-btn" style={{ width: 24, height: 24 }} onClick={() => { setIsTimerRunning(false); setTimer(0); }}>
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Voting Toggle */}
          <button 
            className={`tool-btn ${votingMode ? 'active' : ''}`}
            onClick={() => setVotingMode(!votingMode)}
            title="Voting Mode"
            style={{ width: 'auto', padding: '0 10px', gap: 5 }}
          >
            <CheckCircle2 size={18} />
            Voting {votingMode ? 'ON' : 'OFF'}
          </button>

          <div style={{ display: 'flex', gap: -5 }}>
            {[1,2,3].map(i => (
              <img key={i} src={`https://picsum.photos/30/30?random=user${i}`} style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid white', marginLeft: -8 }} />
            ))}
          </div>
          <button className="tool-btn" onClick={() => setShowShare(true)} style={{ background: '#2d9bf0', color: 'white' }}>Share</button>
        </div>
      </div>

      {/* --- Left Toolbar --- */}
      <div className="ui-panel" style={{ 
        position: 'absolute', top: 100, left: 20, width: 50, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 0'
      }}>
        <button className={`tool-btn ${tool === 'select' ? 'active' : ''}`} onClick={() => setTool('select')} title="Select (V)"><MousePointer2 size={20} /></button>
        <button className={`tool-btn ${tool === 'hand' ? 'active' : ''}`} onClick={() => setTool('hand')} title="Hand (Space)"><Hand size={20} /></button>
        <button className={`tool-btn ${tool === 'sticky' ? 'active' : ''}`} onClick={() => setTool('sticky')} title="Sticky Note"><StickyIcon size={20} /></button>
        <button className={`tool-btn ${tool === 'rect' ? 'active' : ''}`} onClick={() => setTool('rect')} title="Rectangle"><Square size={20} /></button>
        <button className={`tool-btn ${tool === 'circle' ? 'active' : ''}`} onClick={() => setTool('circle')} title="Circle"><CircleIcon size={20} /></button>
        <button className={`tool-btn ${tool === 'text' ? 'active' : ''}`} onClick={() => setTool('text')} title="Text"><Type size={20} /></button>
        <button className={`tool-btn ${tool === 'connector' ? 'active' : ''}`} onClick={() => setTool('connector')} title="Connector"><ArrowUpRight size={20} /></button>
        <button className={`tool-btn ${tool === 'frame' ? 'active' : ''}`} onClick={() => setTool('frame')} title="Frame"><FrameIcon size={20} /></button>
        <button className="tool-btn" onClick={() => fileInputRef.current?.click()} title="Upload Image"><ImageIcon size={20} /></button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
        <hr style={{ width: '80%', border: 'none', borderTop: '1px solid #eee' }} />
        <button className="tool-btn" onClick={() => setShowTemplates(true)} title="Templates"><Layout size={20} /></button>
      </div>

      {/* --- Right Properties Sidebar (Always Visible) --- */}
      <div className="properties-sidebar">
        
        {/* Layers / Objects List for Accessibility/Testing */}
        <div className="prop-section">
          <div className="prop-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Layers size={12} /> Layers
          </div>
          <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4 }}>
            {data.objects.length === 0 ? (
              <div style={{ padding: 5, fontSize: 11, color: '#999' }}>No objects</div>
            ) : (
              data.objects.slice().reverse().map(obj => (
                <div 
                  key={obj.id}
                  onClick={() => setSelectedId(obj.id)}
                  style={{
                    padding: '4px 8px',
                    fontSize: 12,
                    cursor: 'pointer',
                    background: selectedId === obj.id ? '#e6f0ff' : 'transparent',
                    borderBottom: '1px solid #f5f5f5',
                    display: 'flex', alignItems: 'center', gap: 5
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: obj.fill || '#ccc' }} />
                  {obj.type} {obj.id.slice(0,4)}
                </div>
              ))
            )}
          </div>
        </div>

        <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #eee' }} />

        <div className="prop-section">
          <div className="prop-label">Properties</div>
          {!selectedId ? (
            <>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
                Default styles for new objects:
              </div>
              
              {/* Default Fill */}
              <div className="prop-section">
                <div className="prop-label">Fill Color</div>
                <div className="prop-row">
                  {Object.values(COLORS).map(c => (
                    <div 
                      key={c} 
                      className="color-swatch" 
                      style={{ background: c, border: defaultFill === c ? '2px solid #2d9bf0' : '1px solid #ddd' }}
                      onClick={() => setDefaultFill(c)}
                      title="Default Fill Color"
                    />
                  ))}
                </div>
              </div>

              {/* Default Font */}
              <div className="prop-section">
                <div className="prop-label">Typography</div>
                <div className="prop-row">
                  <select 
                    value={defaultFontSize} 
                    onChange={(e) => setDefaultFontSize(parseInt(e.target.value))}
                    style={{ width: '48%', padding: 5, borderRadius: 4, border: '1px solid #ccc' }}
                  >
                    {[12, 14, 16, 20, 24, 32, 48, 64].map(s => <option key={s} value={s}>{s}px</option>)}
                  </select>
                  <select 
                    value={defaultFontFamily} 
                    onChange={(e) => setDefaultFontFamily(e.target.value)}
                    style={{ width: '48%', padding: 5, borderRadius: 4, border: '1px solid #ccc' }}
                  >
                    {['Inter', 'Arial', 'Georgia', 'Courier New'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {/* Default Stroke */}
              <div className="prop-section">
                <div className="prop-label">Stroke</div>
                <div className="prop-row">
                  {Object.values(STROKE_COLORS).map(c => (
                    <div 
                      key={c} 
                      className="color-swatch" 
                      style={{ background: c, width: 20, height: 20, border: defaultStroke === c ? '2px solid #2d9bf0' : '1px solid #ccc' }}
                      onClick={() => setDefaultStroke(c)}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
               {/* Color Pickers (Fill) */}
              {(selectedObject?.type === 'sticky' || selectedObject?.type === 'shape' || selectedObject?.type === 'frame') && (
                <div className="prop-section">
                  <div className="prop-label">Fill Color</div>
                  <div className="prop-row">
                    {Object.values(COLORS).map(c => (
                      <div 
                        key={c} 
                        className="color-swatch" 
                        style={{ background: c, border: selectedObject.fill === c ? '2px solid #2d9bf0' : '1px solid #ddd' }}
                        onClick={() => updateObject(selectedId, { fill: c })}
                        title="Fill Color"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Text Controls */}
              {(selectedObject?.type === 'text' || selectedObject?.type === 'sticky') && (
                <div className="prop-section">
                  <div className="prop-label">Typography</div>
                  <div className="prop-row">
                    <select 
                      value={selectedObject.fontSize || 16} 
                      onChange={(e) => updateObject(selectedId, { fontSize: parseInt(e.target.value) })}
                      style={{ width: '48%', padding: 5, borderRadius: 4, border: '1px solid #ccc' }}
                    >
                      {[12, 14, 16, 20, 24, 32, 48, 64].map(s => <option key={s} value={s}>{s}px</option>)}
                    </select>
                    <select 
                      value={selectedObject.fontFamily || 'Inter'} 
                      onChange={(e) => updateObject(selectedId, { fontFamily: e.target.value })}
                      style={{ width: '48%', padding: 5, borderRadius: 4, border: '1px solid #ccc' }}
                    >
                      {['Inter', 'Arial', 'Georgia', 'Courier New'].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              )}
              
              {/* Frame Title Edit */}
              {selectedObject?.type === 'frame' && (
                <div className="prop-section">
                  <div className="prop-label">Frame Title</div>
                  <div className="prop-row">
                    <input 
                      type="text"
                      value={selectedObject.title || ''}
                      onChange={(e) => updateObject(selectedId, { title: e.target.value })}
                      style={{ width: '100%', padding: 5, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                  </div>
                </div>
              )}

              {/* Stroke Controls */}
              {(selectedObject?.type === 'shape' || selectedObject?.type === 'connector') && (
                <div className="prop-section">
                  <div className="prop-label">Stroke</div>
                  <div className="prop-row">
                    {Object.values(STROKE_COLORS).map(c => (
                      <div 
                        key={c} 
                        className="color-swatch" 
                        style={{ background: c, width: 20, height: 20, border: selectedObject.stroke === c ? '2px solid #2d9bf0' : '1px solid #ccc' }}
                        onClick={() => updateObject(selectedId, { stroke: c })}
                      />
                    ))}
                  </div>
                  <div className="prop-row">
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      value={selectedObject.strokeWidth || 0} 
                      onChange={(e) => updateObject(selectedId, { strokeWidth: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="prop-section">
                <div className="prop-label">Actions</div>
                <div className="prop-row">
                  <button className="tool-btn" onClick={() => {
                    const obj = data.objects.find(o => o.id === selectedId);
                    if (obj) addObject({ ...obj, id: generateId(), x: obj.x + 20, y: obj.y + 20 });
                  }} title="Duplicate"><Copy size={16} /></button>
                  
                  <button className="tool-btn" style={{ color: 'red' }} onClick={() => {
                    deleteObject(selectedId);
                    setSelectedId(null);
                  }} title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </>
          )}
        </div>

        <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #eee' }} />
        
        <div className="prop-section">
          <div className="prop-label">Help / Debug</div>
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
            <div>• <b>Wheel</b>: Zoom</div>
            <div>• <b>Space+Drag</b>: Pan</div>
            <div>• <b>Dbl Click</b>: Edit Text</div>
          </div>
          
          {/* Demo Buttons for Testing */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
             <button 
              onClick={() => {
                const center = { x: -data.view.x + window.innerWidth/2, y: -data.view.y + window.innerHeight/2 };
                addObject({
                  id: generateId(),
                  type: 'shape',
                  shapeType: 'rect',
                  x: center.x,
                  y: center.y,
                  width: 100,
                  height: 100,
                  fill: defaultFill,
                  stroke: defaultStroke,
                  strokeWidth: 2
                });
              }}
              style={{ fontSize: 10, padding: 4, cursor: 'pointer' }}
            >+ Rect</button>
             <button 
              onClick={() => {
                const center = { x: -data.view.x + window.innerWidth/2, y: -data.view.y + window.innerHeight/2 };
                addObject({
                  id: generateId(),
                  type: 'shape',
                  shapeType: 'circle',
                  x: center.x + 120,
                  y: center.y,
                  width: 100,
                  height: 100,
                  fill: defaultFill,
                  stroke: defaultStroke,
                  strokeWidth: 2
                });
              }}
              style={{ fontSize: 10, padding: 4, cursor: 'pointer' }}
            >+ Circle</button>
            <button 
              onClick={() => {
                if (data.objects.length >= 2) {
                  const o1 = data.objects[0];
                  const o2 = data.objects[1];
                  addObject({
                    id: generateId(),
                    type: 'connector',
                    points: [o1.x, o1.y, o2.x, o2.y],
                    from: o1.id,
                    to: o2.id,
                    stroke: defaultStroke,
                    strokeWidth: 2
                  });
                }
              }}
              style={{ fontSize: 10, padding: 4, cursor: 'pointer' }}
            >+ Connector</button>
            <button 
              onClick={() => {
                const center = { x: -data.view.x + window.innerWidth/2, y: -data.view.y + window.innerHeight/2 };
                const id = generateId();
                addObject({
                  id: id,
                  type: 'frame',
                  title: 'Demo Frame',
                  x: center.x + 200,
                  y: center.y + 200,
                  width: 300,
                  height: 200,
                  fill: '#ffffff'
                });
                setSelectedId(id);
              }}
              style={{ fontSize: 10, padding: 4, cursor: 'pointer' }}
            >+ Frame</button>
             <button 
              onClick={() => {
                if (data.objects.length > 0) {
                    const obj = data.objects[0];
                    updateObject(obj.id, { votes: (obj.votes || 0) + 1 });
                }
              }}
              style={{ fontSize: 10, padding: 4, cursor: 'pointer' }}
            >+ Vote</button>
          </div>
        </div>
      </div>

      {/* --- Share Modal --- */}
      {showShare && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.35)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="ui-panel" style={{ width: 420, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Share board</h3>
              <button className="tool-btn" onClick={() => setShowShare(false)}><X size={18} /></button>
            </div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
              Local sharing keeps this sandbox self-contained. Copy the current board URL or create a local invite.
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input value={window.location.href} readOnly style={{ flex: 1, border: '1px solid #ddd', borderRadius: 4, padding: 8 }} />
              <button className="tool-btn" style={{ width: 'auto', padding: '0 12px' }} onClick={handleCopyShareLink}>Copy link</button>
            </div>
            <button
              className="tool-btn"
              style={{ width: 'auto', padding: '0 12px' }}
              onClick={() => {
                addObject({
                  id: generateId(),
                  type: 'sticky',
                  x: -data.view.x + 120,
                  y: -data.view.y + 120,
                  width: 180,
                  height: 120,
                  text: 'Shared with guest reviewer',
                  fill: COLORS.green,
                  votes: 0
                });
                setShareNotice('Local reviewer note added to board');
              }}
            >
              Add reviewer note
            </button>
            {shareNotice && <div style={{ marginTop: 12, color: '#0b7a3b', fontSize: 13 }}>{shareNotice}</div>}
          </div>
        </div>
      )}

      {/* --- Templates Modal --- */}
      {showTemplates && (
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ background: 'white', padding: 20, borderRadius: 8, width: 400 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ margin: 0 }}>Choose a Template</h3>
                    <button onClick={() => setShowTemplates(false)} style={{ border: 'none', background: 'transparent' }}><X size={20} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button 
                        onClick={() => applyTemplate('kanban')}
                        style={{ padding: 20, border: '1px solid #ddd', borderRadius: 4, background: '#f9f9f9', cursor: 'pointer' }}
                    >
                        <Layout size={24} style={{ marginBottom: 10 }} />
                        <div>Kanban Board</div>
                    </button>
                    <button 
                        onClick={() => applyTemplate('retrospective')}
                        style={{ padding: 20, border: '1px solid #ddd', borderRadius: 4, background: '#f9f9f9', cursor: 'pointer' }}
                    >
                        <MoreHorizontal size={24} style={{ marginBottom: 10 }} />
                        <div>Retrospective</div>
                    </button>
                    <button 
                        onClick={() => applyTemplate('brainstorm')}
                        style={{ padding: 20, border: '1px solid #ddd', borderRadius: 4, background: '#f9f9f9', cursor: 'pointer' }}
                    >
                        <StickyIcon size={24} style={{ marginBottom: 10 }} />
                        <div>Brainstorming</div>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- Canvas Stage --- */}
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        draggable={tool === 'hand'} // Only drag stage when hand tool is active
        onWheel={handleWheel}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        className={`canvas-container ${showGrid ? 'grid-background' : ''}`}
      >
        <Layer>
          {data.objects.map((obj) => {
            const isSelected = obj.id === selectedId;
            const isEditing = obj.id === editingId;
            const isHovered = obj.id === hoveredId;
            
            // Common props
            const props = {
              key: obj.id,
              ...obj,
              isSelected,
              votes: obj.votes || 0,
              opacity: isEditing ? 0.5 : 1, // Dim object while editing
              onSelect: (e) => handleObjectClick(e, obj),
              onChange: (newAttrs) => handleObjectChange(obj.id, newAttrs),
              onDoubleClick: (e) => {
                if (obj.type === 'sticky' || obj.type === 'text') {
                  e.cancelBubble = true;
                  startEditing(obj.id, obj.text);
                }
              },
              onHover: () => setHoveredId(obj.id),
              onHoverEnd: () => setHoveredId(null),
              votingMode: votingMode
            };

            // Highlight if hovered in connector mode
            if (tool === 'connector' && isHovered) {
              props.stroke = '#2d9bf0';
              props.strokeWidth = 4;
            }

            switch (obj.type) {
              case 'sticky': return <StickyNote {...props} />;
              case 'shape': return <Shape {...props} />;
              case 'text': return <TextObject {...props} />;
              case 'image': return <UrlImage {...props} />;
              case 'frame': return <Frame {...props} />;
              case 'connector': return <Connector {...props} />;
              default: return null;
            }
          })}
          
          {/* Temporary Connector Line */}
          {tool === 'connector' && connectorStart && (
             <Line
               points={[
                 connectorStart.x + connectorStart.width/2,
                 connectorStart.y + connectorStart.height/2,
                 mousePos.x,
                 mousePos.y
               ]}
               stroke="#2d9bf0"
               strokeWidth={2}
               dash={[5, 5]}
             />
          )}

          {/* Mock Cursors */}
          <MockCursor x={200} y={300} name="Alice" color="#e63946" />
          <MockCursor x={500} y={150} name="Bob" color="#2a9d8f" />

          {/* Transformer for resizing/rotating */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 20 || newBox.height < 20) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
