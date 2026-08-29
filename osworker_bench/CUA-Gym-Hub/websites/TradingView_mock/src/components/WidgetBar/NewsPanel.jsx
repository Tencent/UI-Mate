import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';

function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'Just now';
}

const CATEGORY_COLORS = {
  earnings: '#2962FF', economy: '#9C27B0', crypto: '#F7931A',
  market: '#26A69A', forex: '#00BCD4', analysis: '#FF6D00',
};

export default function NewsPanel() {
  const { state, setSymbol } = useAppContext();
  const { news, chartState } = state;
  const [filterSymbol, setFilterSymbol] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const currentSymbol = chartState.symbolId;

  // Filter to show news for current symbol or all
  const filtered = filterSymbol === 'current'
    ? news.filter(n => n.relatedSymbols.includes(currentSymbol))
    : news;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>News</span>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'current', label: currentSymbol },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterSymbol(tab.id)}
            style={{
              padding: '7px 14px', fontSize: 12, fontWeight: 500,
              borderBottom: filterSymbol === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: filterSymbol === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              background: 'transparent', borderRadius: 0,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* News list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, padding: 24, textAlign: 'center' }}>
            No news available
          </div>
        )}
        {filtered.map(item => {
          const isExpanded = expandedId === item.id;
          const catColor = CATEGORY_COLORS[item.category] || '#787B86';

          return (
            <div
              key={item.id}
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid rgba(42,46,57,0.6)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{relTime(item.timestamp)}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)' }}>{item.source}</span>
                <span style={{
                  fontSize: 9, padding: '1px 5px', borderRadius: 3,
                  background: `${catColor}22`, color: catColor,
                  textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600,
                }}>
                  {item.category}
                </span>
              </div>

              {/* Headline */}
              <div style={{
                fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: isExpanded ? undefined : 2,
                WebkitBoxOrient: 'vertical',
                overflow: isExpanded ? 'visible' : 'hidden',
              }}>
                {item.title}
              </div>

              {/* Related symbols */}
              <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                {item.relatedSymbols.map(sym => (
                  <span
                    key={sym}
                    onClick={(e) => { e.stopPropagation(); setSymbol(sym); }}
                    style={{
                      fontSize: 10, padding: '1px 6px', borderRadius: 3,
                      background: 'rgba(41,98,255,0.15)', color: 'var(--accent)',
                      cursor: 'pointer', fontWeight: 600,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(41,98,255,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(41,98,255,0.15)'}
                  >
                    {sym}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
