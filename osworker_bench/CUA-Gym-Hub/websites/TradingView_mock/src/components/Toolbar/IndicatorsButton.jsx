import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { X, Search, Check, TrendingUp, BarChart2, Star } from 'lucide-react';

const BUILTIN_INDICATORS = [
  { type: 'SMA', name: 'Moving Average', fullName: 'Simple Moving Average', category: 'built-in', defaultInputs: { length: 20, source: 'close' }, defaultStyle: { color: '#2962FF', lineWidth: 2, lineStyle: 'solid' }, paneIndex: 0 },
  { type: 'EMA', name: 'Moving Average Exponential', fullName: 'Exponential Moving Average', category: 'built-in', defaultInputs: { length: 50, source: 'close' }, defaultStyle: { color: '#FF6D00', lineWidth: 2, lineStyle: 'solid' }, paneIndex: 0 },
  { type: 'BB', name: 'Bollinger Bands', fullName: 'Bollinger Bands', category: 'built-in', defaultInputs: { length: 20, stdDev: 2 }, defaultStyle: { color: '#9C27B0', lineWidth: 1, lineStyle: 'solid' }, paneIndex: 0 },
  { type: 'RSI', name: 'RSI', fullName: 'Relative Strength Index', category: 'built-in', defaultInputs: { length: 14, source: 'close' }, defaultStyle: { color: '#E91E63', lineWidth: 2, lineStyle: 'solid' }, paneIndex: 1 },
  { type: 'MACD', name: 'MACD', fullName: 'MACD', category: 'built-in', defaultInputs: { fast: 12, slow: 26, signal: 9 }, defaultStyle: { color: '#2962FF', lineWidth: 2, lineStyle: 'solid' }, paneIndex: 1 },
  { type: 'VOL', name: 'Volume', fullName: 'Volume', category: 'volume', defaultInputs: {}, defaultStyle: { color: '#26A69A', lineWidth: 1, lineStyle: 'solid' }, paneIndex: 1 },
  { type: 'VWAP', name: 'VWAP', fullName: 'Volume Weighted Average Price', category: 'built-in', defaultInputs: {}, defaultStyle: { color: '#2962FF', lineWidth: 2, lineStyle: 'dashed' }, paneIndex: 0 },
  { type: 'ATR', name: 'ATR', fullName: 'Average True Range', category: 'built-in', defaultInputs: { length: 14 }, defaultStyle: { color: '#4CAF50', lineWidth: 2, lineStyle: 'solid' }, paneIndex: 1 },
  { type: 'STOCH', name: 'Stochastic', fullName: 'Stochastic Oscillator', category: 'built-in', defaultInputs: { kLength: 14, dSmooth: 3 }, defaultStyle: { color: '#00BCD4', lineWidth: 2, lineStyle: 'solid' }, paneIndex: 1 },
];

const COMMUNITY_SCRIPTS = [
  { type: 'COMMUNITY_MACD_ADV', name: 'MACD Advanced', fullName: 'MACD Advanced (Community)', category: 'community', defaultInputs: { fast: 8, slow: 21, signal: 5 }, defaultStyle: { color: '#FF9800', lineWidth: 2, lineStyle: 'solid' }, paneIndex: 1 },
  { type: 'COMMUNITY_SUPERTREND', name: 'Supertrend', fullName: 'Supertrend Indicator', category: 'community', defaultInputs: { period: 7, multiplier: 3 }, defaultStyle: { color: '#E91E63', lineWidth: 2, lineStyle: 'solid' }, paneIndex: 0 },
  { type: 'COMMUNITY_PIVOTS', name: 'Pivot Points', fullName: 'Pivot Points (Community)', category: 'community', defaultInputs: {}, defaultStyle: { color: '#9C27B0', lineWidth: 1, lineStyle: 'dashed' }, paneIndex: 0 },
];

const ALL_INDICATORS = [...BUILTIN_INDICATORS, ...COMMUNITY_SCRIPTS];

const CATEGORIES = ['All', 'Favorites', 'Built-ins', 'Volume', 'Community Scripts'];

export default function IndicatorsButton() {
  const { state, addIndicator, removeIndicator, updateState } = useAppContext();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const modalRef = useRef(null);

  const favorites = state.uiState.favoriteIndicators || [];
  const activeIndicatorTypes = state.indicators.map(i => i.type);

  const filteredIndicators = ALL_INDICATORS.filter(ind => {
    const matchesQuery = !query || ind.name.toLowerCase().includes(query.toLowerCase()) || ind.fullName.toLowerCase().includes(query.toLowerCase());
    let matchesCategory;
    if (activeCategory === 'All') matchesCategory = true;
    else if (activeCategory === 'Favorites') matchesCategory = favorites.includes(ind.type);
    else if (activeCategory === 'Volume') matchesCategory = ind.category === 'volume';
    else if (activeCategory === 'Built-ins') matchesCategory = ind.category === 'built-in';
    else if (activeCategory === 'Community Scripts') matchesCategory = ind.category === 'community';
    else matchesCategory = true;
    return matchesQuery && matchesCategory;
  });

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggleFavorite = useCallback((type, e) => {
    e.stopPropagation();
    updateState(prev => {
      const favs = prev.uiState.favoriteIndicators || [];
      const newFavs = favs.includes(type) ? favs.filter(f => f !== type) : [...favs, type];
      return { ...prev, uiState: { ...prev.uiState, favoriteIndicators: newFavs } };
    });
  }, [updateState]);

  const handleToggleIndicator = useCallback((ind) => {
    const existing = state.indicators.find(i => i.type === ind.type);
    if (existing) {
      removeIndicator(existing.id);
    } else {
      addIndicator({
        type: ind.type,
        name: `${ind.name} (${ind.defaultInputs.length || ''})`.replace(/\s\(\)$/, ''),
        visible: true,
        paneIndex: ind.paneIndex,
        inputs: ind.defaultInputs,
        style: ind.defaultStyle,
      });
    }
  }, [state.indicators, addIndicator, removeIndicator]);

  return (
    <>
      <button
        className="tv-icon-btn"
        title="Indicators"
        style={{
          width: 'auto',
          padding: '0 10px',
          fontSize: 13,
          gap: 6,
          display: 'flex',
          alignItems: 'center',
          color: state.indicators.length > 0 ? 'var(--accent)' : undefined
        }}
        onClick={() => setOpen(true)}
      >
        <TrendingUp size={15} />
        <span style={{ fontSize: 12 }}>Indicators</span>
        {state.indicators.length > 0 && (
          <span style={{
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 9,
            fontSize: 10,
            padding: '0 5px',
            lineHeight: '16px',
            minWidth: 16,
            textAlign: 'center',
          }}>{state.indicators.length}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div ref={modalRef} style={{
            width: 580,
            height: 480,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-light)',
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>Indicators & Strategies</span>
              <button className="tv-icon-btn" style={{ width: 28, height: 28 }} onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search indicators..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: 32 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Sidebar */}
              <div style={{ width: 160, borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '8px 0' }}>
                {CATEGORIES.map(cat => (
                  <div
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '7px 16px',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: activeCategory === cat ? 'var(--accent)' : 'var(--text-secondary)',
                      background: activeCategory === cat ? 'rgba(41,98,255,0.1)' : 'transparent',
                      borderLeft: activeCategory === cat ? '2px solid var(--accent)' : '2px solid transparent',
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>

              {/* Indicator List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
                {filteredIndicators.length === 0 && (
                  <div style={{ color: 'var(--text-secondary)', padding: 24, textAlign: 'center', fontSize: 13 }}>
                    {activeCategory === 'Favorites'
                      ? 'No favorites yet. Click the star icon next to an indicator to add it to favorites.'
                      : activeCategory === 'Community Scripts'
                      ? 'Community scripts shown above.'
                      : 'No indicators found'}
                  </div>
                )}
                {filteredIndicators.map(ind => {
                  const isActive = activeIndicatorTypes.includes(ind.type);
                  const isFav = favorites.includes(ind.type);
                  return (
                    <div
                      key={ind.type}
                      onClick={() => handleToggleIndicator(ind)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        background: isActive ? 'rgba(41,98,255,0.08)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isActive ? 'rgba(41,98,255,0.08)' : 'transparent'; }}
                    >
                      <BarChart2 size={15} style={{ color: 'var(--text-secondary)', marginRight: 10, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>{ind.fullName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{ind.type}</div>
                      </div>
                      <button
                        onClick={(e) => handleToggleFavorite(ind.type, e)}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        style={{
                          background: 'none', padding: 4, marginRight: 4, flexShrink: 0,
                          color: isFav ? '#FFD600' : 'var(--text-secondary)',
                        }}
                      >
                        <Star size={13} fill={isFav ? '#FFD600' : 'none'} />
                      </button>
                      {isActive && <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
