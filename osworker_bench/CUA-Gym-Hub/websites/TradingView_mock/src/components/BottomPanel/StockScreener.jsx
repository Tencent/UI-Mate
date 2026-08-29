import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';

const FILTER_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'performance', label: 'Performance' },
  { id: 'valuation', label: 'Valuation' },
];

const COLUMNS = {
  overview: [
    { key: 'id', label: 'Ticker', width: 80, align: 'left', fmt: v => v },
    { key: 'name', label: 'Name', width: 160, align: 'left', fmt: v => v, truncate: true },
    { key: 'price', label: 'Last', width: 90, align: 'right', fmt: (v, s) => s.type === 'forex' ? v?.toFixed(4) : v?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { key: 'changePercent', label: 'Chg%', width: 80, align: 'right', colored: true, fmt: v => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '--' },
    { key: 'volume', label: 'Volume', width: 90, align: 'right', fmt: v => { if (!v) return '--'; if (v >= 1e9) return `${(v/1e9).toFixed(1)}B`; if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`; if (v >= 1e3) return `${(v/1e3).toFixed(0)}K`; return v; } },
    { key: 'marketCap', label: 'Mkt Cap', width: 100, align: 'right', fmt: v => { if (!v) return '--'; if (v >= 1e12) return `${(v/1e12).toFixed(2)}T`; if (v >= 1e9) return `${(v/1e9).toFixed(2)}B`; if (v >= 1e6) return `${(v/1e6).toFixed(2)}M`; return '--'; } },
    { key: 'pe', label: 'P/E', width: 70, align: 'right', fmt: v => v != null ? v.toFixed(1) : '--' },
    { key: 'eps', label: 'EPS', width: 70, align: 'right', fmt: v => v != null ? `$${v.toFixed(2)}` : '--' },
    { key: 'sector', label: 'Sector', width: 150, align: 'left', fmt: v => v || '--', truncate: true },
  ],
  performance: [
    { key: 'id', label: 'Ticker', width: 80, align: 'left', fmt: v => v },
    { key: 'weeklyPerf', label: '1W', width: 80, align: 'right', colored: true, fmt: v => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '--' },
    { key: 'monthlyPerf', label: '1M', width: 80, align: 'right', colored: true, fmt: v => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '--' },
    { key: 'threeMonthPerf', label: '3M', width: 80, align: 'right', colored: true, fmt: v => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '--' },
    { key: 'sixMonthPerf', label: '6M', width: 80, align: 'right', colored: true, fmt: v => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '--' },
    { key: 'ytdPerf', label: 'YTD', width: 80, align: 'right', colored: true, fmt: v => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '--' },
    { key: 'yearlyPerf', label: '1Y', width: 80, align: 'right', colored: true, fmt: v => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '--' },
  ],
  valuation: [
    { key: 'id', label: 'Ticker', width: 80, align: 'left', fmt: v => v },
    { key: 'name', label: 'Name', width: 160, align: 'left', fmt: v => v, truncate: true },
    { key: 'marketCap', label: 'Mkt Cap', width: 110, align: 'right', fmt: v => { if (!v) return '--'; if (v >= 1e12) return `${(v/1e12).toFixed(2)}T`; if (v >= 1e9) return `${(v/1e9).toFixed(2)}B`; return '--'; } },
    { key: 'pe', label: 'P/E', width: 70, align: 'right', fmt: v => v != null ? v.toFixed(1) : '--' },
    { key: 'eps', label: 'EPS', width: 80, align: 'right', fmt: v => v != null ? `$${v.toFixed(2)}` : '--' },
    { key: 'grossMargin', label: 'Gross Margin', width: 100, align: 'right', fmt: v => v != null ? `${v.toFixed(1)}%` : '--' },
    { key: 'operatingMargin', label: 'Op. Margin', width: 100, align: 'right', colored: true, fmt: v => v != null ? `${v.toFixed(1)}%` : '--' },
    { key: 'roe', label: 'ROE', width: 80, align: 'right', fmt: v => v != null ? `${v.toFixed(1)}%` : '--' },
  ],
};

export default function StockScreener() {
  const { state, setSymbol, updateState } = useAppContext();
  const { screenerSymbols, symbols, uiState } = state;
  const [activeTab, setActiveTab] = useState(uiState.screenerFilter?.tab || 'overview');
  const [sortBy, setSortBy] = useState(uiState.screenerFilter?.sortBy || null);
  const [sortDir, setSortDir] = useState(uiState.screenerFilter?.sortDir || 'desc');

  const persistFilter = (tab, by, dir) => {
    updateState(prev => ({
      ...prev,
      uiState: {
        ...prev.uiState,
        screenerFilter: { ...prev.uiState.screenerFilter, tab, sortBy: by, sortDir: dir }
      }
    }));
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    persistFilter(tabId, sortBy, sortDir);
  };

  const columns = COLUMNS[activeTab] || COLUMNS.overview;

  const rows = useMemo(() => {
    const syms = screenerSymbols.map(id => symbols[id]).filter(Boolean);
    if (!sortBy) return syms;
    return [...syms].sort((a, b) => {
      const va = a[sortBy];
      const vb = b[sortBy];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [screenerSymbols, symbols, sortBy, sortDir]);

  const handleSort = (key) => {
    let newDir;
    let newKey;
    if (sortBy === key) {
      newDir = sortDir === 'asc' ? 'desc' : 'asc';
      newKey = key;
    } else {
      newKey = key;
      newDir = 'desc';
    }
    setSortBy(newKey);
    setSortDir(newDir);
    persistFilter(activeTab, newKey, newDir);
  };

  const ROW_HEIGHT = 32;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Filter tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              padding: '5px 12px', fontSize: 11, fontWeight: 500,
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              background: 'transparent', borderRadius: 0,
            }}
          >
            {tab.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '4px 12px', fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
          {rows.length} results
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    width: col.width, minWidth: col.width,
                    padding: '5px 8px',
                    textAlign: col.align || 'right',
                    color: sortBy === col.key ? 'var(--accent)' : 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  {col.label}
                  {sortBy === col.key && (
                    <span style={{ marginLeft: 3, fontSize: 9 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((sym, idx) => {
              const isActive = sym.id === state.chartState.symbolId;
              return (
                <tr
                  key={sym.id}
                  onClick={() => setSymbol(sym.id)}
                  style={{
                    background: isActive ? 'rgba(41,98,255,0.08)' : idx % 2 === 0 ? 'var(--bg-panel)' : '#1A1E2B',
                    cursor: 'pointer', height: ROW_HEIGHT,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isActive ? 'rgba(41,98,255,0.08)' : idx % 2 === 0 ? 'var(--bg-panel)' : '#1A1E2B'; }}
                >
                  {columns.map(col => {
                    const rawVal = sym[col.key];
                    const display = col.fmt ? col.fmt(rawVal, sym) : (rawVal ?? '--');
                    const isColored = col.colored && typeof rawVal === 'number';
                    const color = isColored ? (rawVal >= 0 ? 'var(--up)' : 'var(--down)') : (col.key === 'id' ? (isActive ? 'var(--accent)' : 'var(--text-primary)') : 'var(--text-primary)');

                    return (
                      <td
                        key={col.key}
                        style={{
                          padding: '4px 8px',
                          textAlign: col.align || 'right',
                          color,
                          fontWeight: col.key === 'id' ? 700 : (isColored ? 600 : 400),
                          borderBottom: '1px solid rgba(42,46,57,0.4)',
                          maxWidth: col.width,
                          overflow: col.truncate ? 'hidden' : 'visible',
                          textOverflow: col.truncate ? 'ellipsis' : 'clip',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
