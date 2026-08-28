import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { generateImage } from '../utils/imageGenerator.js';

// Helper: convert normalized coords (0-1) to pixel coords
function normToPixel(nx, ny, w, h) {
  return { x: nx * w, y: ny * h };
}

// Render a single measurement as SVG elements
function MeasurementOverlay({ measurement, w, h, isOnCurrentSlice }) {
  if (!isOnCurrentSlice) return null;
  const m = measurement;
  const color = m.color || '#ffeb3b';
  const pts = (m.points || []).map(p => normToPixel(p.x, p.y, w, h));

  if (m.type === 'length' && pts.length >= 2) {
    const dx = pts[1].x - pts[0].x;
    const dy = pts[1].y - pts[0].y;
    const mx = (pts[0].x + pts[1].x) / 2;
    const my = (pts[0].y + pts[1].y) / 2;
    return (
      <g>
        <line x1={pts[0].x} y1={pts[0].y} x2={pts[1].x} y2={pts[1].y} stroke={color} strokeWidth="1.5" />
        <circle cx={pts[0].x} cy={pts[0].y} r="3" fill={color} />
        <circle cx={pts[1].x} cy={pts[1].y} r="3" fill={color} />
        <rect x={mx - 24} y={my - 9} width="48" height="16" fill="rgba(0,0,0,0.6)" rx="2" />
        <text x={mx} y={my + 2} fill={color} fontSize="11" textAnchor="middle" fontFamily="monospace">{m.value}{m.unit}</text>
      </g>
    );
  }

  if (m.type === 'bidirectional' && pts.length >= 4) {
    const mx = (pts[0].x + pts[1].x) / 2;
    const my = (pts[0].y + pts[1].y) / 2;
    const sx = (pts[2].x + pts[3].x) / 2;
    const sy = (pts[2].y + pts[3].y) / 2;
    const lx = (mx + sx) / 2;
    const ly = Math.min(my, sy) - 14;
    return (
      <g>
        <line x1={pts[0].x} y1={pts[0].y} x2={pts[1].x} y2={pts[1].y} stroke={color} strokeWidth="1.5" />
        <line x1={pts[2].x} y1={pts[2].y} x2={pts[3].x} y2={pts[3].y} stroke={color} strokeWidth="1.5" strokeDasharray="4,2" />
        {[...pts].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />)}
        <rect x={lx - 36} y={ly - 8} width="72" height="16" fill="rgba(0,0,0,0.6)" rx="2" />
        <text x={lx} y={ly + 2} fill={color} fontSize="11" textAnchor="middle" fontFamily="monospace">{m.value}×{m.secondaryValue}{m.unit}</text>
      </g>
    );
  }

  if (m.type === 'ellipse' && pts.length >= 2) {
    const cx = (pts[0].x + pts[1].x) / 2;
    const cy = (pts[0].y + pts[1].y) / 2;
    const rx = Math.abs(pts[1].x - pts[0].x) / 2;
    const ry = Math.abs(pts[1].y - pts[0].y) / 2;
    const label = m.huMean != null ? `${m.value}${m.unit} HU:${m.huMean}` : `${m.value}${m.unit}`;
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={Math.max(rx, 2)} ry={Math.max(ry, 2)} stroke={color} strokeWidth="1.5" fill="rgba(5,216,230,0.08)" />
        <rect x={cx - 44} y={cy - ry - 18} width="88" height="16" fill="rgba(0,0,0,0.6)" rx="2" />
        <text x={cx} y={cy - ry - 6} fill={color} fontSize="11" textAnchor="middle" fontFamily="monospace">{label}</text>
      </g>
    );
  }

  if (m.type === 'angle' && pts.length >= 3) {
    return (
      <g>
        <line x1={pts[0].x} y1={pts[0].y} x2={pts[1].x} y2={pts[1].y} stroke={color} strokeWidth="1.5" />
        <line x1={pts[1].x} y1={pts[1].y} x2={pts[2] ? pts[2].x : pts[1].x + 20} y2={pts[2] ? pts[2].y : pts[1].y - 20} stroke={color} strokeWidth="1.5" />
        <circle cx={pts[1].x} cy={pts[1].y} r="3" fill={color} />
        <rect x={pts[1].x + 6} y={pts[1].y - 16} width="44" height="16" fill="rgba(0,0,0,0.6)" rx="2" />
        <text x={pts[1].x + 30} y={pts[1].y - 4} fill={color} fontSize="11" textAnchor="middle" fontFamily="monospace">{m.value}°</text>
      </g>
    );
  }

  if (m.type === 'annotation' && pts.length >= 1) {
    return (
      <g>
        <rect x={pts[0].x - 4} y={pts[0].y - 14} width={Math.max(60, (m.text || '').length * 7 + 12)} height="18" fill="rgba(0,0,0,0.75)" rx="2" />
        <text x={pts[0].x} y={pts[0].y} fill={color} fontSize="12" fontFamily="sans-serif">{m.text || 'Note'}</text>
      </g>
    );
  }

  return null;
}

// In-progress drawing state overlay
function DrawingInProgress({ drawState, activeTool, w, h, color }) {
  const { points, isDrawing } = drawState;
  if (!isDrawing || points.length === 0) return null;
  const pts = points.map(p => normToPixel(p.x, p.y, w, h));

  if ((activeTool === 'length' || activeTool === 'bidirectional') && pts.length >= 1) {
    const last = pts[pts.length - 1];
    const first = pts[0];
    return (
      <g opacity="0.7">
        {pts.length >= 2 && <line x1={first.x} y1={first.y} x2={last.x} y2={last.y} stroke={color} strokeWidth="1.5" strokeDasharray="5,3" />}
        <circle cx={first.x} cy={first.y} r="3" fill={color} />
        {pts.length >= 2 && <circle cx={last.x} cy={last.y} r="3" fill={color} />}
      </g>
    );
  }

  if (activeTool === 'ellipse' && pts.length >= 2) {
    const cx = (pts[0].x + pts[1].x) / 2;
    const cy = (pts[0].y + pts[1].y) / 2;
    const rx = Math.abs(pts[1].x - pts[0].x) / 2;
    const ry = Math.abs(pts[1].y - pts[0].y) / 2;
    return (
      <g opacity="0.7">
        <ellipse cx={cx} cy={cy} rx={Math.max(rx, 2)} ry={Math.max(ry, 2)} stroke={color} strokeWidth="1.5" fill="none" />
      </g>
    );
  }

  if (activeTool === 'angle' && pts.length >= 2) {
    return (
      <g opacity="0.7">
        <line x1={pts[0].x} y1={pts[0].y} x2={pts[1].x} y2={pts[1].y} stroke={color} strokeWidth="1.5" />
        {pts.length >= 3 && <line x1={pts[1].x} y1={pts[1].y} x2={pts[2].x} y2={pts[2].y} stroke={color} strokeWidth="1.5" />}
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />)}
      </g>
    );
  }

  if (activeTool === 'annotation' && pts.length >= 1) {
    return (
      <g opacity="0.7">
        <circle cx={pts[0].x} cy={pts[0].y} r="4" stroke={color} strokeWidth="1.5" fill="none" />
      </g>
    );
  }

  return null;
}

// Count clicks needed to complete measurement
const toolClickCount = {
  length: 2,
  bidirectional: 4,
  ellipse: 2,
  angle: 3,
  annotation: 1,
};

// Generate unique ID
let measCounter = 100;
function genMeasId() {
  return `MEAS-NEW-${++measCounter}`;
}

// Compute measurement value from points (normalized) + series pixel spacing
function computeMeasValue(type, points, series) {
  const spacing = series?.pixelSpacing?.[0] || 1.0;
  const cols = series?.columns || 512;
  const rows = series?.rows || 512;

  if (type === 'length' && points.length >= 2) {
    const dx = (points[1].x - points[0].x) * cols * spacing;
    const dy = (points[1].y - points[0].y) * rows * spacing;
    return parseFloat(Math.sqrt(dx * dx + dy * dy).toFixed(1));
  }

  if (type === 'bidirectional' && points.length >= 4) {
    const dx1 = (points[1].x - points[0].x) * cols * spacing;
    const dy1 = (points[1].y - points[0].y) * rows * spacing;
    const dx2 = (points[3].x - points[2].x) * cols * spacing;
    const dy2 = (points[3].y - points[2].y) * rows * spacing;
    const long = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const short = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    return { value: parseFloat(long.toFixed(1)), secondaryValue: parseFloat(short.toFixed(1)) };
  }

  if (type === 'ellipse' && points.length >= 2) {
    const rx = Math.abs(points[1].x - points[0].x) * cols * spacing / 2;
    const ry = Math.abs(points[1].y - points[0].y) * rows * spacing / 2;
    return parseFloat((Math.PI * rx * ry).toFixed(1));
  }

  if (type === 'angle' && points.length >= 3) {
    const ax = (points[0].x - points[1].x) * cols;
    const ay = (points[0].y - points[1].y) * rows;
    const bx = (points[2].x - points[1].x) * cols;
    const by = (points[2].y - points[1].y) * rows;
    const dot = ax * bx + ay * by;
    const mag = Math.sqrt(ax * ax + ay * ay) * Math.sqrt(bx * bx + by * by);
    const angle = mag === 0 ? 0 : Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180 / Math.PI;
    return parseFloat(angle.toFixed(1));
  }

  return 0;
}

export default function Viewport({ viewportId }) {
  const { state, updateViewport, setActiveViewport, setActiveTool, addMeasurement, toggleSeriesTracking } = useAppContext();
  const vp = state.viewports[viewportId];
  const series = vp?.seriesId ? state.series[vp.seriesId] : null;
  const study = series ? state.studies[series.studyId] : null;
  const patient = study ? state.patients[study.patientId] : null;
  const { activeTool } = state.toolState;

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startWC: 0, startWW: 0, startPanX: 0, startPanY: 0, startZoom: 1 });

  // Drawing state for in-progress measurements
  const [drawState, setDrawState] = useState({ isDrawing: false, points: [] });
  // Track prompt state: ask if series should be tracked
  const [showTrackPrompt, setShowTrackPrompt] = useState(false);
  const pendingMeasRef = useRef(null);

  const isMeasurementTool = (t) => ['length', 'bidirectional', 'ellipse', 'angle', 'annotation'].includes(t);

  // Render image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !series || !vp) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const displayW = Math.floor(rect.width);
    const displayH = Math.floor(rect.height);
    if (displayW <= 0 || displayH <= 0) return;

    canvas.width = displayW;
    canvas.height = displayH;
    const ctx = canvas.getContext('2d');

    // Generate image on offscreen canvas at series resolution
    const imgW = Math.min(series.columns || 512, 512);
    const imgH = Math.min(series.rows || 512, 512);
    const offscreen = document.createElement('canvas');
    offscreen.width = imgW;
    offscreen.height = imgH;
    generateImage(offscreen, series.thumbnailType, vp.currentInstanceNumber, series.numberOfInstances);

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, displayW, displayH);

    // Apply transforms
    ctx.save();
    const centerX = displayW / 2 + (vp.panX || 0);
    const centerY = displayH / 2 + (vp.panY || 0);
    ctx.translate(centerX, centerY);
    ctx.rotate((vp.rotation || 0) * Math.PI / 180);
    ctx.scale(vp.flipH ? -1 : 1, vp.flipV ? -1 : 1);
    const zoom = vp.zoom || 1;
    const drawW = imgW * zoom;
    const drawH = imgH * zoom;

    // Apply invert via filter
    if (vp.invert) {
      ctx.filter = 'invert(1)';
    }

    ctx.drawImage(offscreen, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [vp?.seriesId, vp?.currentInstanceNumber, vp?.windowCenter, vp?.windowWidth, vp?.zoom, vp?.panX, vp?.panY, vp?.rotation, vp?.flipH, vp?.flipV, vp?.invert, series?.thumbnailType]);

  // Scroll handler
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (!series || !vp) return;
    const delta = e.deltaY > 0 ? 1 : -1;
    const newInstance = Math.max(1, Math.min(series.numberOfInstances, vp.currentInstanceNumber + delta));
    if (newInstance !== vp.currentInstanceNumber) {
      updateViewport(viewportId, { currentInstanceNumber: newInstance });
    }
  }, [series, vp, viewportId, updateViewport]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Get normalized coordinates from mouse event
  const getCanvasCoords = useCallback((e) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  }, []);

  // Finalize a measurement and add it to state
  const finalizeMeasurement = useCallback((type, points, currentSeries, currentVP) => {
    if (!currentSeries || !currentVP) return;

    const result = computeMeasValue(type, points, currentSeries);
    const isAngle = type === 'angle';
    const isBidir = type === 'bidirectional';
    const isEllipse = type === 'ellipse';

    let value, secondaryValue, unit;
    if (isBidir) {
      value = result.value;
      secondaryValue = result.secondaryValue;
      unit = 'mm';
    } else if (isEllipse) {
      value = result;
      secondaryValue = null;
      unit = 'mm\u00B2';
    } else if (isAngle) {
      value = result;
      secondaryValue = null;
      unit = '°';
    } else if (type === 'annotation') {
      value = 0;
      secondaryValue = null;
      unit = '';
    } else {
      value = result;
      secondaryValue = null;
      unit = 'mm';
    }

    const measurement = {
      id: genMeasId(),
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      studyId: currentSeries.studyId,
      seriesId: currentSeries.id,
      instanceNumber: currentVP.currentInstanceNumber,
      points: points.map(p => ({ x: parseFloat(p.x.toFixed(4)), y: parseFloat(p.y.toFixed(4)) })),
      value,
      secondaryValue,
      unit,
      text: type === 'annotation' ? 'Note' : null,
      huMean: type === 'ellipse' ? Math.round(40 + Math.random() * 60) : null,
      huStd: type === 'ellipse' ? parseFloat((Math.random() * 15 + 5).toFixed(1)) : null,
      color: currentSeries.isTracked ? '#ffeb3b' : '#05d8e6',
      isTarget: false,
      targetCategory: null,
      createdAt: new Date().toISOString(),
      createdBy: 'Dr. Sarah Chen',
    };

    // Show tracking prompt if series not tracked
    if (!currentSeries.isTracked) {
      pendingMeasRef.current = { measurement, seriesId: currentSeries.id };
      setShowTrackPrompt(true);
      addMeasurement(measurement);
    } else {
      addMeasurement(measurement);
    }
  }, [addMeasurement]);

  // Mouse handlers for tools and measurement placement
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setActiveViewport(viewportId);
    if (!vp) return;

    // Measurement tools: handle click-to-place
    if (isMeasurementTool(activeTool) && series) {
      const coords = getCanvasCoords(e);
      const needed = toolClickCount[activeTool] || 2;

      setDrawState(prev => {
        const newPoints = [...prev.points, coords];
        if (newPoints.length >= needed) {
          // Finalize asynchronously after state update
          setTimeout(() => {
            finalizeMeasurement(activeTool, newPoints, series, vp);
          }, 0);
          return { isDrawing: false, points: [] };
        }
        return { isDrawing: true, points: newPoints };
      });
      return;
    }

    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startWC: vp.windowCenter,
      startWW: vp.windowWidth,
      startPanX: vp.panX || 0,
      startPanY: vp.panY || 0,
      startZoom: vp.zoom || 1,
    };

    const handleMouseMove = (ev) => {
      if (!dragRef.current.dragging) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;

      if (activeTool === 'windowLevel') {
        const newWW = Math.max(1, dragRef.current.startWW + dx * 2);
        const newWC = dragRef.current.startWC - dy * 2;
        updateViewport(viewportId, { windowWidth: Math.round(newWW), windowCenter: Math.round(newWC) });
      } else if (activeTool === 'pan') {
        updateViewport(viewportId, { panX: dragRef.current.startPanX + dx, panY: dragRef.current.startPanY + dy });
      } else if (activeTool === 'zoom') {
        const zoomDelta = 1 + dy * -0.005;
        const newZoom = Math.max(0.1, Math.min(10, dragRef.current.startZoom * zoomDelta));
        updateViewport(viewportId, { zoom: parseFloat(newZoom.toFixed(2)) });
      }
    };

    const handleMouseUp = () => {
      dragRef.current.dragging = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Cancel drawing on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && drawState.isDrawing) {
        setDrawState({ isDrawing: false, points: [] });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [drawState.isDrawing]);

  const zoomPercent = ((vp?.zoom || 1) * 100).toFixed(1);

  // Container dimensions for SVG overlay (from rendered canvas)
  const [containerSize, setContainerSize] = useState({ w: 512, h: 512 });
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Get measurements for current viewport (same series + instance)
  const viewportMeasurements = series ? Object.values(state.measurements).filter(m => m.seriesId === series.id) : [];

  return (
    <div
      ref={containerRef}
      onClick={() => setActiveViewport(viewportId)}
      onMouseDown={handleMouseDown}
      style={{
        position: 'relative',
        background: 'var(--color-bg-viewport)',
        border: vp?.isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
        overflow: 'hidden',
        cursor: isMeasurementTool(activeTool) ? 'crosshair' : activeTool === 'pan' ? 'grab' : activeTool === 'zoom' ? 'zoom-in' : activeTool === 'windowLevel' ? 'crosshair' : 'default',
        userSelect: 'none',
      }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Measurement SVG overlay */}
      {series && containerSize.w > 0 && (
        <svg
          ref={svgRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
          viewBox={`0 0 ${containerSize.w} ${containerSize.h}`}>
          {viewportMeasurements.map(m => (
            <MeasurementOverlay
              key={m.id}
              measurement={m}
              w={containerSize.w}
              h={containerSize.h}
              isOnCurrentSlice={m.instanceNumber === vp.currentInstanceNumber}
            />
          ))}
          <DrawingInProgress
            drawState={drawState}
            activeTool={activeTool}
            w={containerSize.w}
            h={containerSize.h}
            color="#05d8e6"
          />
        </svg>
      )}

      {/* DICOM Overlays */}
      {series && patient && state.settings.showOverlays !== false && (
        <>
          {/* Top-left: Patient info */}
          <div style={{ position: 'absolute', top: '8px', left: '8px', fontFamily: "var(--font-overlay)", fontSize: '12px', color: '#e0e0e0', textShadow: '0 0 3px rgba(0,0,0,0.8)', lineHeight: '1.5' }}>
            <div>{patient.displayName}</div>
            <div>{patient.mrn}</div>
            <div>{patient.dateOfBirth}</div>
            <div>{patient.sex} / {patient.age}</div>
          </div>

          {/* Top-right: Institution */}
          <div style={{ position: 'absolute', top: '8px', right: '8px', fontFamily: "var(--font-overlay)", fontSize: '12px', color: '#e0e0e0', textShadow: '0 0 3px rgba(0,0,0,0.8)', textAlign: 'right', lineHeight: '1.5' }}>
            <div>{study?.institution}</div>
            <div>{study?.studyDate} {study?.studyTime}</div>
          </div>

          {/* Bottom-left: Series info */}
          <div style={{ position: 'absolute', bottom: '8px', left: '8px', fontFamily: "var(--font-overlay)", fontSize: '12px', color: '#e0e0e0', textShadow: '0 0 3px rgba(0,0,0,0.8)', lineHeight: '1.5' }}>
            <div>{series.seriesDescription}</div>
            {series.sliceThickness && <div>T: {series.sliceThickness}mm</div>}
            <div>{series.bodyPart}</div>
          </div>

          {/* Bottom-right: W/L, Zoom, Instance */}
          <div style={{ position: 'absolute', bottom: '8px', right: '8px', fontFamily: "var(--font-overlay)", fontSize: '12px', color: '#e0e0e0', textShadow: '0 0 3px rgba(0,0,0,0.8)', textAlign: 'right', lineHeight: '1.5' }}>
            <div>W: {vp.windowWidth}  L: {vp.windowCenter}</div>
            <div>{zoomPercent}%{vp.invert ? '  INV' : ''}{vp.rotation ? `  ${vp.rotation}°` : ''}</div>
            <div>{vp.currentInstanceNumber}/{series.numberOfInstances}</div>
          </div>

          {/* Orientation markers */}
          {state.settings.showOrientationMarkers !== false && (
            <>
              <div style={{ position: 'absolute', top: '50%', left: '4px', transform: 'translateY(-50%)', fontFamily: "var(--font-overlay)", fontSize: '14px', fontWeight: 'bold', color: '#e0e0e0', textShadow: '0 0 3px rgba(0,0,0,0.8)' }}>
                {vp.flipH ? 'L' : 'R'}
              </div>
              <div style={{ position: 'absolute', top: '50%', right: '4px', transform: 'translateY(-50%)', fontFamily: "var(--font-overlay)", fontSize: '14px', fontWeight: 'bold', color: '#e0e0e0', textShadow: '0 0 3px rgba(0,0,0,0.8)' }}>
                {vp.flipH ? 'R' : 'L'}
              </div>
              <div style={{ position: 'absolute', top: '4px', left: '50%', transform: 'translateX(-50%)', fontFamily: "var(--font-overlay)", fontSize: '14px', fontWeight: 'bold', color: '#e0e0e0', textShadow: '0 0 3px rgba(0,0,0,0.8)' }}>
                {vp.flipV ? 'P' : 'A'}
              </div>
              <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', fontFamily: "var(--font-overlay)", fontSize: '14px', fontWeight: 'bold', color: '#e0e0e0', textShadow: '0 0 3px rgba(0,0,0,0.8)' }}>
                {vp.flipV ? 'A' : 'P'}
              </div>
            </>
          )}

          {/* Scroll position indicator */}
          <div style={{ position: 'absolute', top: '10%', right: '2px', width: '4px', height: '80%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
            <div style={{
              position: 'absolute',
              top: `${((vp.currentInstanceNumber - 1) / Math.max(1, series.numberOfInstances - 1)) * 100}%`,
              width: '4px', height: '8px', background: 'var(--color-accent)', borderRadius: '2px',
              transform: 'translateY(-50%)',
            }} />
          </div>
        </>
      )}

      {/* Drawing instruction banner */}
      {drawState.isDrawing && (
        <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.75)', color: 'var(--color-accent)', fontSize: '11px', padding: '4px 10px', borderRadius: '4px', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          Click to place point {drawState.points.length + 1}/{toolClickCount[activeTool]} — Esc to cancel
        </div>
      )}

      {/* Track series prompt (H-10) */}
      {showTrackPrompt && series && (
        <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', background: '#1a1a2e', border: '1px solid var(--color-accent)', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.6)', zIndex: 50, whiteSpace: 'nowrap' }}>
          <span>Track measurements for <strong>{series.seriesDescription}</strong>?</span>
          <button onClick={() => { toggleSeriesTracking(series.id); setShowTrackPrompt(false); }}
            style={{ background: 'var(--color-accent)', color: '#000', border: 'none', borderRadius: '3px', padding: '3px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
            Yes
          </button>
          <button onClick={() => setShowTrackPrompt(false)}
            style={{ background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: '3px', padding: '3px 10px', fontSize: '11px', cursor: 'pointer' }}>
            No
          </button>
        </div>
      )}

      {/* Empty state */}
      {!series && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#334', fontSize: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
          <div style={{ color: '#556677' }}>No series loaded</div>
          <div style={{ fontSize: '11px', color: '#445', marginTop: '4px' }}>Select a series from the left panel</div>
        </div>
      )}
    </div>
  );
}
