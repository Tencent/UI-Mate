import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { WINDOW_LEVEL_PRESETS } from '../utils/dataManager.js';

const tools = [
  { id: 'zoom', label: 'Zoom', icon: '🔍' },
  { id: 'windowLevel', label: 'Levels', icon: '◑' },
  { id: 'pan', label: 'Pan', icon: '✥' },
  { id: 'length', label: 'Length', icon: '📏' },
  { id: 'bidirectional', label: 'Bidir', icon: '✚' },
  { id: 'ellipse', label: 'Ellipse', icon: '⬭' },
  { id: 'angle', label: 'Angle', icon: '∠' },
  { id: 'annotation', label: 'Note', icon: 'T' },
];

const layouts = [
  { rows: 1, cols: 1, label: '1×1' },
  { rows: 1, cols: 2, label: '1×2' },
  { rows: 2, cols: 1, label: '2×1' },
  { rows: 2, cols: 2, label: '2×2' },
  { rows: 2, cols: 3, label: '2×3' },
  { rows: 3, cols: 3, label: '3×3' },
];

const moreTools = [
  { id: 'magnify', label: 'Magnify' },
  { id: 'probe', label: 'Probe' },
  { id: 'invert', label: 'Invert' },
  { id: 'rotateCW', label: 'Rotate CW' },
  { id: 'rotateCCW', label: 'Rotate CCW' },
  { id: 'flipH', label: 'Flip H' },
  { id: 'flipV', label: 'Flip V' },
  { id: 'reset', label: 'Reset' },
];

export default function Toolbar() {
  const navigate = useNavigate();
  const { state, setActiveTool, setLayout, updateViewport, resetViewport, setWindowLevelPreset, setCinePlaying } = useAppContext();
  const { activeTool, windowLevelPreset } = state.toolState;
  const { layoutRows, layoutColumns } = state.settings;
  const { cineIsPlaying } = state.uiState;
  const [showLayout, setShowLayout] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const layoutRef = useRef(null);
  const moreRef = useRef(null);
  const presetsRef = useRef(null);

  const activeVP = Object.values(state.viewports).find(vp => vp.isActive);
  const activeVPId = activeVP?.id || 'VP-0';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (layoutRef.current && !layoutRef.current.contains(e.target)) setShowLayout(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMore(false);
      if (presetsRef.current && !presetsRef.current.contains(e.target)) setShowPresets(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Cine playback interval
  useEffect(() => {
    if (!cineIsPlaying || !activeVP || !activeVP.seriesId) return;
    const series = state.series[activeVP.seriesId];
    if (!series) return;
    const fps = state.settings.cineFrameRate || 24;
    const interval = setInterval(() => {
      const current = state.viewports[activeVPId];
      if (!current) return;
      const next = current.currentInstanceNumber >= series.numberOfInstances ? 1 : current.currentInstanceNumber + 1;
      updateViewport(activeVPId, { currentInstanceNumber: next });
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [cineIsPlaying, activeVPId, state.settings.cineFrameRate, activeVP?.seriesId]);

  const handleMoreTool = (toolId) => {
    setShowMore(false);
    if (toolId === 'magnify') {
      setActiveTool('magnify');
    } else if (toolId === 'probe') {
      setActiveTool('probe');
    } else if (toolId === 'invert' && activeVP) {
      updateViewport(activeVPId, { invert: !activeVP.invert });
    } else if (toolId === 'rotateCW' && activeVP) {
      updateViewport(activeVPId, { rotation: (activeVP.rotation + 90) % 360 });
    } else if (toolId === 'rotateCCW' && activeVP) {
      updateViewport(activeVPId, { rotation: (activeVP.rotation + 270) % 360 });
    } else if (toolId === 'flipH' && activeVP) {
      updateViewport(activeVPId, { flipH: !activeVP.flipH });
    } else if (toolId === 'flipV' && activeVP) {
      updateViewport(activeVPId, { flipV: !activeVP.flipV });
    } else if (toolId === 'reset') {
      resetViewport(activeVPId);
    }
  };

  const handlePreset = (presetKey) => {
    setShowPresets(false);
    const preset = WINDOW_LEVEL_PRESETS[presetKey];
    if (!preset) return;
    setWindowLevelPreset(presetKey);
    if (activeVP) {
      updateViewport(activeVPId, { windowWidth: preset.ww, windowCenter: preset.wc });
    }
  };

  // Keyboard shortcuts (H-08)
  const handleKeyDown = useCallback((e) => {
    // Don't fire when typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    const key = e.key;

    // Tool shortcuts
    if (key === 'l' || key === 'L') { setActiveTool('length'); return; }
    if (key === 'a' || key === 'A') { setActiveTool('annotation'); return; }
    if (key === 'Escape') { resetViewport(activeVPId); return; }

    // W/L preset shortcuts (1-8)
    const presetKeys = ['softTissue', 'lung', 'bone', 'brain', 'abdomen', 'liver', 'mediastinum', 'stroke'];
    const num = parseInt(key, 10);
    if (num >= 1 && num <= 8) {
      handlePreset(presetKeys[num - 1]);
      return;
    }

    // Zoom
    if (key === '+' || key === '=') {
      if (activeVP) updateViewport(activeVPId, { zoom: Math.min(10, parseFloat(((activeVP.zoom || 1) * 1.1).toFixed(2))) });
      return;
    }
    if (key === '-' || key === '_') {
      if (activeVP) updateViewport(activeVPId, { zoom: Math.max(0.1, parseFloat(((activeVP.zoom || 1) * 0.9).toFixed(2))) });
      return;
    }

    // Scroll slices
    if (key === 'ArrowUp') {
      e.preventDefault();
      if (activeVP && activeVP.seriesId) {
        const series = state.series[activeVP.seriesId];
        if (series) {
          const newInst = Math.max(1, activeVP.currentInstanceNumber - 1);
          updateViewport(activeVPId, { currentInstanceNumber: newInst });
        }
      }
      return;
    }
    if (key === 'ArrowDown') {
      e.preventDefault();
      if (activeVP && activeVP.seriesId) {
        const series = state.series[activeVP.seriesId];
        if (series) {
          const newInst = Math.min(series.numberOfInstances, activeVP.currentInstanceNumber + 1);
          updateViewport(activeVPId, { currentInstanceNumber: newInst });
        }
      }
      return;
    }

    // Invert
    if (key === 'i' || key === 'I') {
      if (activeVP) updateViewport(activeVPId, { invert: !activeVP.invert });
      return;
    }

    // Rotate
    if (key === 'r' || key === 'R') {
      if (activeVP) updateViewport(activeVPId, { rotation: (activeVP.rotation + 90) % 360 });
      return;
    }
  }, [activeVP, activeVPId, state.series, setActiveTool, updateViewport, resetViewport]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const btnStyle = (isActive) => ({
    background: isActive ? 'rgba(5,216,230,0.15)' : 'none',
    border: 'none',
    borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
    cursor: 'pointer',
    padding: '4px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '16px',
    minWidth: '44px',
    height: '44px',
    justifyContent: 'center',
    borderRadius: '4px 4px 0 0',
  });

  const dropdownItemStyle = {
    padding: '8px 14px',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    fontSize: '13px',
  };

  return (
    <div style={{ height: '48px', background: 'var(--color-bg-toolbar)', borderBottom: '1px solid #2a3a4a', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px', flexShrink: 0 }}>
      {/* Back button */}
      <button onClick={() => navigate('/studies')} title="Back to Study List"
        style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '18px', cursor: 'pointer', padding: '4px 8px' }}>
        ←
      </button>
      <span style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: '600', marginRight: '8px' }}>XACS Viewer</span>

      {/* Separator */}
      <div style={{ width: '1px', height: '28px', background: '#2a3a4a', margin: '0 4px' }} />

      {/* Tool buttons */}
      {tools.map(tool => (
        <button key={tool.id} onClick={() => setActiveTool(tool.id)} title={tool.label}
          style={btnStyle(activeTool === tool.id)}>
          <span>{tool.icon}</span>
          <span style={{ fontSize: '9px', marginTop: '1px' }}>{tool.label}</span>
        </button>
      ))}

      {/* More dropdown */}
      <div ref={moreRef} style={{ position: 'relative' }}>
        <button onClick={() => { setShowMore(!showMore); setShowLayout(false); setShowPresets(false); }}
          style={{ background: showMore ? 'rgba(5,216,230,0.1)' : 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px 8px', fontSize: '12px', borderRadius: '4px' }}>
          More ▾
        </button>
        {showMore && (
          <div style={{ position: 'absolute', top: '38px', left: 0, background: 'var(--color-bg-toolbar)', border: '1px solid var(--color-border)', borderRadius: '4px', zIndex: 100, minWidth: '140px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            {moreTools.map(mt => (
              <div key={mt.id} onClick={() => handleMoreTool(mt.id)}
                style={dropdownItemStyle}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(5,216,230,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {mt.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Separator */}
      <div style={{ width: '1px', height: '28px', background: '#2a3a4a', margin: '0 4px' }} />

      {/* W/L Presets dropdown */}
      <div ref={presetsRef} style={{ position: 'relative' }}>
        <button onClick={() => { setShowPresets(!showPresets); setShowMore(false); setShowLayout(false); }} title="Window/Level Presets"
          style={{ background: showPresets ? 'rgba(5,216,230,0.1)' : 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px 8px', fontSize: '12px', borderRadius: '4px' }}>
          W/L ▾
        </button>
        {showPresets && (
          <div style={{ position: 'absolute', top: '38px', left: 0, background: 'var(--color-bg-toolbar)', border: '1px solid var(--color-border)', borderRadius: '4px', zIndex: 100, minWidth: '160px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            {Object.entries(WINDOW_LEVEL_PRESETS).map(([key, preset], i) => (
              <div key={key} onClick={() => handlePreset(key)}
                style={{
                  ...dropdownItemStyle,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: windowLevelPreset === key ? 'var(--color-accent)' : 'var(--color-text-primary)',
                  background: windowLevelPreset === key ? 'rgba(5,216,230,0.08)' : 'transparent',
                }}
                onMouseEnter={e => { if (windowLevelPreset !== key) e.currentTarget.style.background = 'rgba(5,216,230,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = windowLevelPreset === key ? 'rgba(5,216,230,0.08)' : 'transparent'; }}>
                <span>{i + 1}. {preset.name}</span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px', marginLeft: '8px' }}>
                  {preset.ww}/{preset.wc}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Separator */}
      <div style={{ width: '1px', height: '28px', background: '#2a3a4a', margin: '0 4px' }} />

      {/* Cine controls */}
      <button
        onClick={() => setCinePlaying(!cineIsPlaying)}
        title={cineIsPlaying ? 'Pause (Cine)' : 'Play (Cine)'}
        style={{
          background: cineIsPlaying ? 'rgba(5,216,230,0.15)' : 'none',
          border: 'none',
          color: cineIsPlaying ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          cursor: 'pointer',
          padding: '4px 8px',
          fontSize: '16px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
        {cineIsPlaying ? '⏸' : '▶'}
        <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{state.settings.cineFrameRate}fps</span>
      </button>

      {/* Separator */}
      <div style={{ width: '1px', height: '28px', background: '#2a3a4a', margin: '0 4px' }} />

      {/* Layout selector */}
      <div ref={layoutRef} style={{ position: 'relative' }}>
        <button onClick={() => { setShowLayout(!showLayout); setShowMore(false); setShowPresets(false); }} title="Layout"
          style={{ background: showLayout ? 'rgba(5,216,230,0.1)' : 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px 8px', fontSize: '14px', borderRadius: '4px' }}>
          ⊞ {layoutRows}×{layoutColumns}
        </button>
        {showLayout && (
          <div style={{ position: 'absolute', top: '38px', left: 0, background: 'var(--color-bg-toolbar)', border: '1px solid var(--color-border)', borderRadius: '4px', zIndex: 100, padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            {layouts.map(l => {
              const isActive = layoutRows === l.rows && layoutColumns === l.cols;
              return (
                <div key={l.label} onClick={() => { setLayout(l.rows, l.cols); setShowLayout(false); }}
                  style={{
                    padding: '6px 14px', cursor: 'pointer', fontSize: '13px',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    background: isActive ? 'rgba(5,216,230,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(5,216,230,0.3)' : '1px solid transparent',
                    borderRadius: '3px', margin: '2px 0',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(5,216,230,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isActive ? 'rgba(5,216,230,0.08)' : 'transparent'; }}>
                  {l.label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Right section */}
      <span style={{ color: '#556677', fontSize: '11px', letterSpacing: '0.5px' }}>INVESTIGATIONAL USE ONLY</span>
    </div>
  );
}
