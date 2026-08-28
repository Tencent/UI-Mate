import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { X } from 'lucide-react';

const DATE_RANGES = [
  { label: '1D', value: '1D' },
  { label: '5D', value: '5D' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: 'YTD', value: 'YTD' },
  { label: '1Y', value: '1Y' },
  { label: '2Y', value: '2Y' },
  { label: '5Y', value: '5Y' },
  { label: 'All', value: 'All' },
];

function formatTime(timezone) {
  try {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
      timeZone: timezone || 'America/New_York',
    });
  } catch {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  }
}

function getTZLabel(tz) {
  const map = {
    'America/New_York': 'UTC-4',
    'America/Chicago': 'UTC-5',
    'America/Denver': 'UTC-6',
    'America/Los_Angeles': 'UTC-7',
    'UTC': 'UTC',
    'Europe/London': 'UTC+1',
    'Europe/Paris': 'UTC+2',
    'Asia/Shanghai': 'UTC+8',
    'Asia/Tokyo': 'UTC+9',
    'Europe/Berlin': 'UTC+2',
    'Europe/Moscow': 'UTC+3',
    'Asia/Dubai': 'UTC+4',
    'Asia/Kolkata': 'UTC+5:30',
    'Australia/Sydney': 'UTC+11',
  };
  return map[tz] || 'UTC';
}

export default function StatusBar() {
  const { state, updateState, undoDrawing, redoDrawing, canUndo, canRedo } = useAppContext();
  const { chartState, currentUser } = state;
  const timezone = currentUser?.preferences?.timezone || 'America/New_York';
  const [time, setTime] = useState(() => formatTime(timezone));
  const [showDateRange, setShowDateRange] = useState(false);
  const dateRangeRef = useRef(null);
  const selectedRange = state.chartState.visibleRange || null;

  // Update clock every second
  useEffect(() => {
    const tick = () => setTime(formatTime(timezone));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  const logScale = chartState.logScale;
  const autoScale = chartState.priceScaleMode === 'auto';
  const pctMode = state.currentUser?.preferences?.percentageMode || false;

  const toggleLog = useCallback(() => {
    updateState(prev => ({
      ...prev,
      chartState: { ...prev.chartState, logScale: !prev.chartState.logScale },
    }));
  }, [updateState]);

  const toggleAuto = useCallback(() => {
    updateState(prev => ({
      ...prev,
      chartState: {
        ...prev.chartState,
        priceScaleMode: prev.chartState.priceScaleMode === 'auto' ? 'manual' : 'auto',
      },
    }));
  }, [updateState]);

  const togglePct = useCallback(() => {
    updateState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        preferences: { ...prev.currentUser.preferences, percentageMode: !prev.currentUser.preferences.percentageMode }
      }
    }));
  }, [updateState]);

  const setDateRange = useCallback((rangeValue) => {
    updateState(prev => ({
      ...prev,
      chartState: { ...prev.chartState, visibleRange: rangeValue },
    }));
    setShowDateRange(false);
  }, [updateState]);

  // Close date range dropdown on outside click
  useEffect(() => {
    if (!showDateRange) return;
    const handler = (e) => {
      if (dateRangeRef.current && !dateRangeRef.current.contains(e.target)) setShowDateRange(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDateRange]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undoDrawing();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redoDrawing();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [undoDrawing, redoDrawing, canUndo, canRedo]);

  const buttonStyle = (active) => ({
    padding: '0 8px',
    height: '100%',
    fontSize: 11,
    fontWeight: 600,
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    background: 'transparent',
    borderRadius: 0,
    cursor: 'pointer',
    letterSpacing: 0.3,
    transition: 'color 0.1s',
  });

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      gap: 4,
      background: 'var(--bg-page)',
      fontSize: 11,
    }}>
      {/* Left: Date range */}
      <div style={{ position: 'relative' }} ref={dateRangeRef}>
        <button
          style={{
            ...buttonStyle(!!selectedRange),
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
          title="Date range"
          onClick={() => setShowDateRange(v => !v)}
        >
          {selectedRange || 'Date Range'}
          <span style={{ fontSize: 9 }}>▾</span>
        </button>
        {showDateRange && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, marginBottom: 4,
            background: 'var(--bg-panel)', border: '1px solid var(--border-light)',
            borderRadius: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            zIndex: 100, overflow: 'hidden', minWidth: 80,
          }}>
            {DATE_RANGES.map(r => (
              <div
                key={r.value}
                onClick={() => setDateRange(r.value)}
                style={{
                  padding: '6px 14px', cursor: 'pointer', fontSize: 12,
                  color: selectedRange === r.value ? 'var(--accent)' : 'var(--text-primary)',
                  background: selectedRange === r.value ? 'rgba(41,98,255,0.1)' : 'transparent',
                  fontWeight: selectedRange === r.value ? 600 : 400,
                }}
                onMouseEnter={e => { if (selectedRange !== r.value) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = selectedRange === r.value ? 'rgba(41,98,255,0.1)' : 'transparent'; }}
              >
                {r.label}
              </div>
            ))}
            {selectedRange && (
              <div
                onClick={() => setDateRange(null)}
                style={{ padding: '6px 14px', cursor: 'pointer', fontSize: 12, color: 'var(--down)', borderTop: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Reset
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ width: 1, height: 14, background: 'var(--border)', margin: '0 4px' }} />

      {/* Center: Clock */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        color: 'var(--text-secondary)',
        fontSize: 11,
        fontVariantNumeric: 'tabular-nums',
        fontFamily: 'var(--font-mono)',
      }}>
        {time}
        <span style={{ opacity: 0.6 }}>({getTZLabel(timezone)})</span>
      </div>

      <div style={{ width: 1, height: 14, background: 'var(--border)', margin: '0 4px' }} />

      {/* Right: Scale toggles */}
      <button
        style={buttonStyle(pctMode)}
        title="Percentage scale"
        onClick={togglePct}
      >
        %
      </button>
      <button
        style={buttonStyle(logScale)}
        title="Logarithmic scale (Alt+L)"
        onClick={toggleLog}
      >
        log
      </button>
      <button
        style={buttonStyle(autoScale)}
        title="Auto-fit scale"
        onClick={toggleAuto}
      >
        auto
      </button>
    </div>
  );
}
