import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';

const TABS = [
  { id: 'gainers', label: 'Top Gainers' },
  { id: 'losers', label: 'Top Losers' },
  { id: 'active', label: 'Most Active' },
  { id: 'highs', label: 'New Highs' },
  { id: 'lows', label: 'New Lows' },
];

export default function HotlistsPanel() {
  const { state, setSymbol } = useAppContext();
  const { symbols, chartState } = state;
  const [activeTab, setActiveTab] = useState('gainers');

  const allSyms = Object.values(symbols);

  let sorted;
  switch (activeTab) {
    case 'gainers':
      sorted = [...allSyms].sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0)).slice(0, 15);
      break;
    case 'losers':
      sorted = [...allSyms].sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0)).slice(0, 15);
      break;
    case 'active':
      sorted = [...allSyms].filter(s => s.volume > 0).sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 15);
      break;
    case 'highs':
      // Show symbols closest to their 52-week high (highest ratio of price/52wHigh)
      sorted = [...allSyms]
        .filter(s => s.price != null && s.week52High != null && s.week52High > 0)
        .sort((a, b) => ((b.price / b.week52High) - (a.price / a.week52High)))
        .slice(0, 15);
      break;
    case 'lows':
      // Show symbols furthest from their 52-week high (lowest price/52wHigh ratio = near 52-week low)
      sorted = [...allSyms]
        .filter(s => s.price != null && s.week52Low != null && s.week52Low > 0)
        .sort((a, b) => ((a.price / (a.week52High || a.price + 1)) - (b.price / (b.week52High || b.price + 1))))
        .slice(0, 15);
      break;
    default:
      sorted = allSyms.slice(0, 15);
  }

  function fmtPrice(sym) {
    if (sym.price == null) return '--';
    if (sym.type === 'forex') return sym.price.toFixed(4);
    return sym.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtVolume(vol) {
    if (!vol) return '--';
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`;
    return vol.toString();
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>Hotlists</span>
      </div>

      {/* Tabs */}
      <div style={{
        overflowX: 'auto', flexShrink: 0, borderBottom: '1px solid var(--border)',
        display: 'flex',
        scrollbarWidth: 'none',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '7px 10px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              background: 'transparent', borderRadius: 0, flexShrink: 0,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div style={{
        display: 'flex', padding: '4px 12px', flexShrink: 0,
        fontSize: 10, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ width: 20, flexShrink: 0 }}>#</div>
        <div style={{ flex: 2 }}>Symbol</div>
        <div style={{ flex: 1, textAlign: 'right' }}>Price</div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          {activeTab === 'active' ? 'Volume' : 'Chg%'}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sorted.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, padding: 24, textAlign: 'center' }}>
            No data
          </div>
        )}
        {sorted.map((sym, idx) => {
          const isActive = sym.id === chartState.symbolId;
          const isUp = sym.changePercent >= 0;

          return (
            <div
              key={sym.id}
              onClick={() => setSymbol(sym.id)}
              style={{
                display: 'flex', alignItems: 'center', padding: '6px 12px',
                borderBottom: '1px solid rgba(42,46,57,0.4)', cursor: 'pointer',
                background: isActive ? 'rgba(41,98,255,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isActive ? 'rgba(41,98,255,0.08)' : 'transparent'; }}
            >
              <div style={{ width: 20, fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0 }}>
                {idx + 1}
              </div>
              <div style={{ flex: 2, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {sym.id}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sym.exchange}
                </div>
              </div>
              <div style={{ flex: 1, textAlign: 'right', fontSize: 12, fontWeight: 500 }}>
                {fmtPrice(sym)}
              </div>
              <div style={{
                flex: 1, textAlign: 'right', fontSize: 12, fontWeight: 600,
                color: activeTab === 'active' ? 'var(--text-primary)' : (isUp ? 'var(--up)' : 'var(--down)'),
              }}>
                {activeTab === 'active'
                  ? fmtVolume(sym.volume)
                  : `${isUp ? '+' : ''}${sym.changePercent?.toFixed(2)}%`
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
