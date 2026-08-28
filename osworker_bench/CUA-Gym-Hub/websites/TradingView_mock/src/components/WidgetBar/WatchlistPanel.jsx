import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { Plus, MoreHorizontal, ChevronDown, ChevronRight, Search, X } from 'lucide-react';

function SymbolIcon({ symbolId, type }) {
  const colors = {
    stock: '#2962FF', crypto: '#F7931A', forex: '#00BCD4',
    index: '#9C27B0', futures: '#FF6D00',
  };
  const bg = colors[type] || '#2962FF';
  const letter = symbolId?.[0] || '?';
  return (
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      background: bg, color: '#fff', fontSize: 11, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {letter}
    </div>
  );
}

function formatPrice(price, type) {
  if (price == null) return '--';
  if (type === 'forex') return price.toFixed(4);
  if (price >= 10000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toFixed(2);
}

function formatChange(val, pct, type) {
  const isUp = val >= 0;
  const sign = isUp ? '+' : '';
  return {
    label: `${sign}${pct.toFixed(2)}%`,
    color: isUp ? 'var(--up)' : 'var(--down)',
  };
}

export default function WatchlistPanel() {
  const { state, setSymbol, addToWatchlist, removeFromWatchlist, toggleRightPanel, addAlert } = useAppContext();
  const { watchlists, symbols, chartState } = state;

  const [activeWl, setActiveWl] = useState(watchlists[0]?.id || null);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [showWlDropdown, setShowWlDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [sortBy, setSortBy] = useState('ticker');
  const [sortDir, setSortDir] = useState('asc');

  const wlDropdownRef = useRef(null);
  const moreMenuRef = useRef(null);
  const searchRef = useRef(null);

  const wl = watchlists.find(w => w.id === activeWl) || watchlists[0];
  const currentSymbol = chartState.symbolId;

  // Symbol search
  useEffect(() => {
    if (!searchQuery) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const results = Object.values(symbols).filter(s =>
      s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 10);
    setSearchResults(results);
  }, [searchQuery, symbols]);

  // Close watchlist dropdown on outside click
  useEffect(() => {
    if (!showWlDropdown) return;
    const handler = (e) => {
      if (wlDropdownRef.current && !wlDropdownRef.current.contains(e.target)) setShowWlDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showWlDropdown]);

  // Close more menu on outside click
  useEffect(() => {
    if (!showMoreMenu) return;
    const handler = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMoreMenu]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const handleContextMenu = (e, symbolId) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, symbolId });
  };

  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [contextMenu]);

  // Sort symbols based on sortBy/sortDir
  function sortSymbols(syms) {
    if (!syms || syms.length === 0) return syms;
    return [...syms].sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'ticker') {
        aVal = a.id;
        bVal = b.id;
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortBy === 'last') {
        aVal = a.price || 0;
        bVal = b.price || 0;
      } else if (sortBy === 'chg') {
        aVal = a.changePercent || 0;
        bVal = b.changePercent || 0;
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        borderBottom: '1px solid var(--border)', gap: 6, flexShrink: 0,
      }}>
        <div style={{ position: 'relative', flex: 1 }} ref={wlDropdownRef}>
          <button
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 13, fontWeight: 600, textAlign: 'left', borderRadius: 4, padding: '2px 4px',
            }}
            onClick={() => setShowWlDropdown(v => !v)}
          >
            <span>{wl?.name || 'Watchlist'}</span>
            <ChevronDown size={13} style={{ color: 'var(--text-secondary)' }} />
          </button>
          {/* Watchlist dropdown */}
          {showWlDropdown && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 2, zIndex: 100,
              background: 'var(--bg-panel)', border: '1px solid var(--border-light)',
              borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}>
              {watchlists.map(w => (
                <div
                  key={w.id}
                  onClick={() => { setActiveWl(w.id); setShowWlDropdown(false); }}
                  style={{
                    padding: '8px 14px', cursor: 'pointer', fontSize: 13,
                    background: activeWl === w.id ? 'rgba(41,98,255,0.1)' : 'transparent',
                    color: activeWl === w.id ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                  onMouseEnter={e => { if (activeWl !== w.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = activeWl === w.id ? 'rgba(41,98,255,0.1)' : 'transparent'; }}
                >
                  {w.name} {w.isDefault && <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>(default)</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="tv-icon-btn" style={{ width: 28, height: 28 }} title="Add symbol" onClick={() => setShowSearch(v => !v)}>
          <Plus size={15} />
        </button>
        <div style={{ position: 'relative' }} ref={moreMenuRef}>
          <button className="tv-icon-btn" style={{ width: 28, height: 28 }} title="More options" onClick={() => setShowMoreMenu(v => !v)}>
            <MoreHorizontal size={15} />
          </button>
          {showMoreMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 2, zIndex: 200,
              background: 'var(--bg-panel)', border: '1px solid var(--border-light)',
              borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              minWidth: 180,
            }}>
              {[
                { label: 'Add symbol', action: () => { setShowSearch(true); setShowMoreMenu(false); } },
                { label: 'Sort by Symbol ↑', action: () => { setSortBy('ticker'); setSortDir('asc'); setShowMoreMenu(false); } },
                { label: 'Sort by Price ↓', action: () => { setSortBy('last'); setSortDir('desc'); setShowMoreMenu(false); } },
                { label: 'Sort by Change% ↓', action: () => { setSortBy('chg'); setSortDir('desc'); setShowMoreMenu(false); } },
              ].map(item => (
                <div key={item.label} onClick={item.action}
                  style={{ padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Symbol search input */}
      {showSearch && (
        <div ref={searchRef} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              autoFocus
              type="text"
              placeholder="Search to add symbol..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: 28, paddingRight: 28 }}
              onKeyDown={e => {
                if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); }
              }}
            />
            <button
              style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', padding: 0 }}
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
            >
              <X size={12} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 200,
              background: 'var(--bg-panel)', border: '1px solid var(--border-light)',
              borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}>
              {searchResults.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    addToWatchlist(s.id, wl?.id);
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 12px', cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <SymbolIcon symbolId={s.id} type={s.type} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.id}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.name}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-secondary)' }}>{s.exchange}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Column headers */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '4px 12px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        {[
          { key: 'ticker', label: 'Symbol', flex: 2 },
          { key: 'last', label: 'Last', flex: 1, align: 'right' },
          { key: 'chg', label: 'Chg%', flex: 1, align: 'right' },
        ].map(col => (
          <div
            key={col.key}
            onClick={() => handleSort(col.key)}
            style={{
              flex: col.flex, fontSize: 11, color: sortBy === col.key ? 'var(--accent)' : 'var(--text-secondary)',
              textAlign: col.align || 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start', gap: 2,
            }}
          >
            {col.label}
            {sortBy === col.key && <span style={{ fontSize: 9 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {wl?.sections.map(section => {
          const isCollapsed = collapsedSections[section.id];
          let sectionSymbols = sortSymbols(section.symbolIds.map(id => symbols[id]).filter(Boolean));

          return (
            <div key={section.id}>
              {section.name && (
                <div
                  onClick={() => setCollapsedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', cursor: 'pointer',
                    background: 'var(--bg-page)', color: 'var(--text-secondary)', fontSize: 11,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-page)'}
                >
                  {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  <span style={{ fontWeight: 600 }}>{section.name}</span>
                  <span style={{ marginLeft: 'auto' }}>{section.symbolIds.length}</span>
                </div>
              )}
              {!isCollapsed && sectionSymbols.map(sym => {
                const isActive = sym.id === currentSymbol;
                const chg = formatChange(sym.change, sym.changePercent, sym.type);

                return (
                  <div
                    key={sym.id}
                    onClick={() => setSymbol(sym.id)}
                    onContextMenu={(e) => handleContextMenu(e, sym.id)}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '6px 12px',
                      cursor: 'pointer', gap: 8,
                      background: isActive ? 'rgba(41,98,255,0.08)' : 'transparent',
                      borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isActive ? 'rgba(41,98,255,0.08)' : 'transparent'; }}
                  >
                    <SymbolIcon symbolId={sym.id} type={sym.type} />
                    <div style={{ flex: 2, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>{sym.id}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sym.name}</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right', fontWeight: 500, fontSize: 13 }}>
                      {formatPrice(sym.price, sym.type)}
                    </div>
                    <div style={{ flex: 1, textAlign: 'right', fontSize: 12, color: chg.color, fontWeight: 500 }}>
                      {chg.label}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div style={{
          position: 'fixed',
          left: contextMenu.x, top: contextMenu.y,
          zIndex: 9999,
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-light)',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          minWidth: 160,
        }}>
          {[
            {
              label: 'Remove from watchlist',
              action: () => { removeFromWatchlist(contextMenu.symbolId, wl?.id); setContextMenu(null); }
            },
            {
              label: 'Add alert',
              action: () => {
                setSymbol(contextMenu.symbolId);
                toggleRightPanel('alerts');
                setContextMenu(null);
              }
            },
            {
              label: 'Symbol info',
              action: () => {
                setSymbol(contextMenu.symbolId);
                toggleRightPanel('details');
                setContextMenu(null);
              }
            },
          ].map(item => (
            <div
              key={item.label}
              onClick={item.action}
              style={{ padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
