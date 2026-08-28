import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { Search, ChevronDown, X } from 'lucide-react';

const TYPE_ICONS = {
  stock: { label: 'S', color: '#2962FF' },
  crypto: { label: 'C', color: '#FF9800' },
  forex: { label: 'F', color: '#26A69A' },
  futures: { label: 'Fu', color: '#AB47BC' },
  index: { label: 'I', color: '#42A5F5' },
};

export default function SymbolSearch() {
  const { state, setSymbol } = useAppContext();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const currentSymbol = state.symbols[state.chartState.symbolId];
  const categories = ['All', 'Stocks', 'Crypto', 'Forex', 'Futures', 'Indices'];
  const typeMap = { Stocks: 'stock', Crypto: 'crypto', Forex: 'forex', Futures: 'futures', Indices: 'index' };

  const results = Object.values(state.symbols).filter(s => {
    if (filter !== 'All' && s.type !== typeMap[filter]) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
  }).slice(0, 20);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => { setSelectedIdx(0); }, [query, filter]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Ctrl+K or Ctrl+/ to open symbol search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === '/')) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (sym) => {
    setSymbol(sym.id);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIdx]) { handleSelect(results[selectedIdx]); }
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
          borderRadius: 4, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
          cursor: 'pointer', background: open ? 'var(--bg-hover)' : 'transparent',
        }}
      >
        {currentSymbol?.id || 'AAPL'}
        <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          width: 380, background: '#1E222D', border: '1px solid var(--border)',
          borderRadius: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 1000,
          overflow: 'hidden',
        }}>
          <div style={{ padding: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search symbol or name..."
                style={{ width: '100%', paddingLeft: 30, height: 34 }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: 2 }}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 2, padding: '0 8px 6px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '3px 10px', borderRadius: 12, fontSize: 11,
                  background: filter === cat ? 'var(--accent)' : 'var(--bg-hover)',
                  color: filter === cat ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {results.map((s, i) => {
              const ti = TYPE_ICONS[s.type] || TYPE_ICONS.stock;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  onMouseEnter={() => setSelectedIdx(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                    cursor: 'pointer',
                    background: i === selectedIdx ? 'var(--bg-hover)' : 'transparent',
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: ti.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {ti.label}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{s.id}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0 }}>{s.exchange}</span>
                </div>
              );
            })}
            {results.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
