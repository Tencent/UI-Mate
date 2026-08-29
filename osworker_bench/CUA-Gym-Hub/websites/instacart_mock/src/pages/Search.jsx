import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function Search() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const [sortBy, setSortBy] = useState('best_match');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [onSale, setOnSale] = useState(false);
  const [organic, setOrganic] = useState(false);
  const [selectedStore, setSelectedStore] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    if (!state.searchQuery) return [];
    const q = state.searchQuery.toLowerCase();
    let filtered = state.products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.includes(q)))
    );
    if (selectedStore !== 'all') filtered = filtered.filter(p => p.storeId === selectedStore);
    if (onSale) filtered = filtered.filter(p => p.isOnSale);
    if (organic) filtered = filtered.filter(p => p.isOrganic);
    if (priceMin !== '') filtered = filtered.filter(p => p.price >= parseFloat(priceMin));
    if (priceMax !== '') filtered = filtered.filter(p => p.price <= parseFloat(priceMax));
    if (sortBy === 'price_low') filtered = [...filtered].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_high') filtered = [...filtered].sort((a, b) => b.price - a.price);
    else if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'rating') filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return filtered;
  }, [state.products, state.searchQuery, sortBy, priceMin, priceMax, onSale, organic, selectedStore]);

  const storesInResults = useMemo(() => {
    if (!state.searchQuery) return [];
    const q = state.searchQuery.toLowerCase();
    const storeIds = new Set(
      state.products
        .filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || (p.tags && p.tags.some(t => t.includes(q))))
        .map(p => p.storeId)
    );
    return state.stores.filter(s => storeIds.has(s.id));
  }, [state.products, state.stores, state.searchQuery]);

  const hasActiveFilters = onSale || organic || priceMin !== '' || priceMax !== '' || selectedStore !== 'all';

  const clearFilters = () => {
    setOnSale(false);
    setOrganic(false);
    setPriceMin('');
    setPriceMax('');
    setSelectedStore('all');
  };

  return (
    <div className="page-content">
      <div className="search-results-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <strong>Search results for "{state.searchQuery}"</strong> <span style={{ color: 'var(--color-text-secondary)' }}>({results.length} items)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sort-dropdown">
            <span>Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="best_match">Best Match</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 'var(--radius-pill)', border: `1px solid ${hasActiveFilters ? 'var(--color-primary)' : 'var(--color-border)'}`, fontSize: 14, fontWeight: 500, background: hasActiveFilters ? 'var(--color-primary-light)' : 'var(--color-white)', color: hasActiveFilters ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
            &#x1F50D; Filters{hasActiveFilters && ' •'}
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} style={{ fontSize: 13, color: 'var(--color-red)', fontWeight: 600 }}>Clear All</button>
          )}
        </div>
      </div>

      {showFilters && (
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Price Range</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" placeholder="Min $" value={priceMin} onChange={e => setPriceMin(e.target.value)} min="0" step="0.01"
                  style={{ width: '80px', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', fontSize: 14, outline: 'none' }} />
                <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
                <input type="number" placeholder="Max $" value={priceMax} onChange={e => setPriceMax(e.target.value)} min="0" step="0.01"
                  style={{ width: '80px', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', fontSize: 14, outline: 'none' }} />
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Dietary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="filter-checkbox">
                  <input type="checkbox" checked={onSale} onChange={e => setOnSale(e.target.checked)} />
                  On Sale
                </label>
                <label className="filter-checkbox">
                  <input type="checkbox" checked={organic} onChange={e => setOrganic(e.target.checked)} />
                  Organic
                </label>
              </div>
            </div>
            {storesInResults.length > 1 && (
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Store</div>
                <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', fontSize: 14, outline: 'none' }}>
                  <option value="all">All Stores</option>
                  {storesInResults.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <div className="no-results">
          <div className="icon">&#x1F50D;</div>
          <h3>{state.searchQuery ? 'No results found' : 'Search for something'}</h3>
          <p>{state.searchQuery ? (hasActiveFilters ? 'Try adjusting your filters' : 'Try searching for something else') : 'Use the search bar to find products'}</p>
        </div>
      ) : (
        <>
          {selectedStore === 'all' && storesInResults.length > 1 && (
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              Results from {storesInResults.length} stores: {storesInResults.map(s => s.name).join(', ')}
            </div>
          )}
          <div className="product-grid">
            {results.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
