import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import SymbolSearch from './SymbolSearch.jsx';
import TimeframeSelector from './TimeframeSelector.jsx';
import ChartTypeSelector from './ChartTypeSelector.jsx';
import IndicatorsButton from './IndicatorsButton.jsx';
import AlertButton from './AlertButton.jsx';
import {
  Undo2, Redo2, Camera, Settings, BarChart3, X
} from 'lucide-react';

const TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'New York (UTC-5)', value: 'America/New_York' },
  { label: 'Chicago (UTC-6)', value: 'America/Chicago' },
  { label: 'Los Angeles (UTC-8)', value: 'America/Los_Angeles' },
  { label: 'London (UTC+0)', value: 'Europe/London' },
  { label: 'Frankfurt (UTC+1)', value: 'Europe/Berlin' },
  { label: 'Moscow (UTC+3)', value: 'Europe/Moscow' },
  { label: 'Dubai (UTC+4)', value: 'Asia/Dubai' },
  { label: 'Mumbai (UTC+5:30)', value: 'Asia/Kolkata' },
  { label: 'Shanghai (UTC+8)', value: 'Asia/Shanghai' },
  { label: 'Tokyo (UTC+9)', value: 'Asia/Tokyo' },
  { label: 'Sydney (UTC+11)', value: 'Australia/Sydney' },
];

// Global chart ref for screenshot
export const chartScreenshotRef = { current: null };

function SettingsModal({ onClose }) {
  const { state, updateState } = useAppContext();
  const [activeTab, setActiveTab] = useState('symbol');
  const prefs = state.currentUser.preferences;

  const updatePref = (key, value) => {
    updateState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        preferences: { ...prev.currentUser.preferences, [key]: value }
      }
    }));
  };

  const TABS = [
    { id: 'symbol', label: 'Symbol' },
    { id: 'scales', label: 'Scales' },
    { id: 'background', label: 'Background' },
    { id: 'timezone', label: 'Timezone' },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#1E222D', border: '1px solid var(--border)',
        borderRadius: 8, width: 520, maxHeight: '80vh',
        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Chart Settings</span>
          <button className="tv-icon-btn" onClick={onClose} style={{ width: 28, height: 28 }}>
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', paddingLeft: 8 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px', fontSize: 12,
                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                background: 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
          {activeTab === 'symbol' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Candle Colors</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Up Body Color</span>
                  <input type="color" value={prefs.upCandleColor || '#26A69A'}
                    onChange={e => updatePref('upCandleColor', e.target.value)}
                    style={{ width: 60, height: 32, borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', background: 'transparent' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Down Body Color</span>
                  <input type="color" value={prefs.downCandleColor || '#EF5350'}
                    onChange={e => updatePref('downCandleColor', e.target.value)}
                    style={{ width: 60, height: 32, borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', background: 'transparent' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Up Wick Color</span>
                  <input type="color" value={prefs.upWickColor || '#26A69A'}
                    onChange={e => updatePref('upWickColor', e.target.value)}
                    style={{ width: 60, height: 32, borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', background: 'transparent' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Down Wick Color</span>
                  <input type="color" value={prefs.downWickColor || '#EF5350'}
                    onChange={e => updatePref('downWickColor', e.target.value)}
                    style={{ width: 60, height: 32, borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', background: 'transparent' }} />
                </label>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Status Line</div>
                {[
                  { key: 'showOHLC', label: 'Show OHLC values' },
                  { key: 'showVolume', label: 'Show Volume' },
                  { key: 'showChange', label: 'Show Change %' },
                ].map(item => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={prefs[item.key] !== false}
                      onChange={e => updatePref(item.key, e.target.checked)}
                      style={{ width: 14, height: 14, accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'scales' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prefs.logScale || false}
                  onChange={e => updatePref('logScale', e.target.checked)}
                  style={{ width: 14, height: 14, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Logarithmic Scale</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prefs.autoScale !== false}
                  onChange={e => updatePref('autoScale', e.target.checked)}
                  style={{ width: 14, height: 14, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Auto Scale</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prefs.percentageMode || false}
                  onChange={e => updatePref('percentageMode', e.target.checked)}
                  style={{ width: 14, height: 14, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Percentage Mode</span>
              </label>
            </div>
          )}

          {activeTab === 'background' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Chart Background</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={prefs.chartBg || '#131722'}
                    onChange={e => updatePref('chartBg', e.target.value)}
                    style={{ width: 60, height: 32, borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', background: 'transparent' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{prefs.chartBg || '#131722'}</span>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prefs.showGrid !== false}
                  onChange={e => updatePref('showGrid', e.target.checked)}
                  style={{ width: 14, height: 14, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Show Grid Lines</span>
              </label>
            </div>
          )}

          {activeTab === 'timezone' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Select Timezone</div>
              {TIMEZONES.map(tz => (
                <label key={tz.value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 4, cursor: 'pointer', background: prefs.timezone === tz.value ? 'rgba(41,98,255,0.08)' : 'transparent' }}>
                  <input
                    type="radio"
                    name="timezone"
                    value={tz.value}
                    checked={prefs.timezone === tz.value}
                    onChange={() => updatePref('timezone', tz.value)}
                    style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, color: prefs.timezone === tz.value ? 'var(--accent)' : 'var(--text-primary)' }}>{tz.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 20px', borderRadius: 4, fontSize: 13,
              background: 'var(--accent)', color: '#fff', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TopToolbar() {
  const { state, toggleBottomPanel, undoDrawing, redoDrawing, canUndo, canRedo } = useAppContext();
  const [showSettings, setShowSettings] = useState(false);

  const handleScreenshot = () => {
    if (chartScreenshotRef.current) {
      try {
        // lightweight-charts v5 exposes takeScreenshot() which returns an HTMLCanvasElement
        const canvas = chartScreenshotRef.current.takeScreenshot();
        if (canvas) {
          const url = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = url;
          a.download = `chart-${state.chartState.symbolId}-${state.chartState.timeframe}-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          // Fallback: show a brief visual feedback
          console.warn('Screenshot canvas not available');
        }
      } catch (e) {
        console.warn('Screenshot failed:', e.message);
      }
    }
  };

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        padding: '0 8px',
        gap: 4,
      }}>
        <SymbolSearch />
        <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />
        <TimeframeSelector />
        <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />
        <ChartTypeSelector />
        <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />
        <IndicatorsButton />
        <AlertButton />
        <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />
        <button
          className="tv-icon-btn"
          title="Undo (Ctrl+Z)"
          style={{ width: 32, height: 32, opacity: canUndo ? 1 : 0.4 }}
          onClick={undoDrawing}
          disabled={!canUndo}
        >
          <Undo2 size={16} />
        </button>
        <button
          className="tv-icon-btn"
          title="Redo (Ctrl+Y)"
          style={{ width: 32, height: 32, opacity: canRedo ? 1 : 0.4 }}
          onClick={redoDrawing}
          disabled={!canRedo}
        >
          <Redo2 size={16} />
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="tv-icon-btn"
          title="Stock Screener"
          style={{ width: 32, height: 32, color: state.uiState.activeBottomPanel === 'screener' ? 'var(--accent)' : undefined }}
          onClick={() => toggleBottomPanel('screener')}
        >
          <BarChart3 size={16} />
        </button>
        <button
          className="tv-icon-btn"
          title="Take Screenshot"
          style={{ width: 32, height: 32 }}
          onClick={handleScreenshot}
        >
          <Camera size={16} />
        </button>
        <button
          className="tv-icon-btn"
          title="Chart Settings"
          style={{ width: 32, height: 32, color: showSettings ? 'var(--accent)' : undefined }}
          onClick={() => setShowSettings(true)}
        >
          <Settings size={16} />
        </button>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
