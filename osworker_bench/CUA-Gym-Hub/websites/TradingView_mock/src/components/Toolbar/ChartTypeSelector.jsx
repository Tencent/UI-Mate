import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { CandlestickChart, ChevronDown, LineChart, AreaChart, BarChart3 } from 'lucide-react';

const CHART_TYPES = [
  { name: 'Bars', icon: 'bars' },
  { name: 'Candles', icon: 'candles' },
  { name: 'Hollow Candles', icon: 'candles' },
  { name: 'Line', icon: 'line' },
  { name: 'Area', icon: 'area' },
  { name: 'Baseline', icon: 'line' },
  { name: 'Heikin Ashi', icon: 'candles' },
];

export default function ChartTypeSelector() {
  const { state, setChartType } = useAppContext();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px',
          borderRadius: 4, color: 'var(--text-secondary)',
        }}
      >
        <CandlestickChart size={16} />
        <ChevronDown size={12} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          background: '#1E222D', border: '1px solid var(--border)', borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)', zIndex: 1000, minWidth: 180,
          overflow: 'hidden',
        }}>
          {CHART_TYPES.map(ct => (
            <button
              key={ct.name}
              onClick={() => { setChartType(ct.name); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '7px 12px', fontSize: 12, textAlign: 'left',
                color: state.chartState.chartType === ct.name ? 'var(--accent)' : 'var(--text-primary)',
                background: state.chartState.chartType === ct.name ? 'rgba(41,98,255,0.08)' : 'transparent',
              }}
            >
              {ct.icon === 'line' && <LineChart size={14} />}
              {ct.icon === 'area' && <AreaChart size={14} />}
              {ct.icon === 'candles' && <CandlestickChart size={14} />}
              {ct.icon === 'bars' && <BarChart3 size={14} />}
              {ct.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
