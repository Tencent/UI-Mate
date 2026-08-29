import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { ChevronDown } from 'lucide-react';

const TIMEFRAMES = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '1h', value: '60' },
  { label: '4h', value: '240' },
  { label: 'D', value: 'D' },
  { label: 'W', value: 'W' },
  { label: 'M', value: 'M' },
];

const MORE_TIMEFRAMES = [
  { label: '3m', value: '3' },
  { label: '10m', value: '10' },
  { label: '30m', value: '30' },
  { label: '2h', value: '120' },
  { label: '6h', value: '360' },
  { label: '12h', value: '720' },
];

export default function TimeframeSelector() {
  const { state, setTimeframe } = useAppContext();
  const [showMore, setShowMore] = useState(false);
  const dropdownRef = useRef(null);
  const currentTf = state.chartState.timeframe;

  // Close dropdown on outside click
  useEffect(() => {
    if (!showMore) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMore]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }} ref={dropdownRef}>
      {TIMEFRAMES.map(tf => (
        <button
          key={tf.value}
          onClick={() => setTimeframe(tf.value)}
          style={{
            padding: '4px 8px', borderRadius: 4, fontSize: 13,
            color: currentTf === tf.value ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: currentTf === tf.value ? 700 : 400,
            background: currentTf === tf.value ? 'rgba(41,98,255,0.1)' : 'transparent',
          }}
        >
          {tf.label}
        </button>
      ))}
      <button
        onClick={() => setShowMore(!showMore)}
        style={{
          padding: '4px 4px', borderRadius: 4,
          color: MORE_TIMEFRAMES.some(tf => tf.value === currentTf) ? 'var(--accent)' : 'var(--text-secondary)',
          fontWeight: MORE_TIMEFRAMES.some(tf => tf.value === currentTf) ? 700 : 400,
          background: MORE_TIMEFRAMES.some(tf => tf.value === currentTf) ? 'rgba(41,98,255,0.1)' : 'transparent',
          display: 'flex', alignItems: 'center',
        }}
      >
        {MORE_TIMEFRAMES.find(tf => tf.value === currentTf)?.label || <ChevronDown size={14} />}
      </button>
      {showMore && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4,
          background: '#1E222D', border: '1px solid var(--border)', borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)', zIndex: 1000, overflow: 'hidden',
          minWidth: 100,
        }}>
          {MORE_TIMEFRAMES.map(tf => (
            <button
              key={tf.value}
              onClick={() => { setTimeframe(tf.value); setShowMore(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '6px 12px', fontSize: 12,
                color: currentTf === tf.value ? 'var(--accent)' : 'var(--text-primary)',
                background: currentTf === tf.value ? 'rgba(41,98,255,0.1)' : 'transparent',
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
