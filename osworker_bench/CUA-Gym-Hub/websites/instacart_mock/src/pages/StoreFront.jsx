import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function StoreFront() {
  const { storeId, deptId } = useParams();
  const { state, dispatch, ACTION_TYPES } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState(deptId || null);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('all');

  const store = state.stores.find(s => s.id === storeId);
  if (!store) return <div className="page-content"><h2>Store not found</h2></div>;

  const departments = state.departments.filter(d => d.storeId === storeId);

  const allBrands = useMemo(() => {
    const prods = state.products.filter(p => p.storeId === storeId);
    const brands = [...new Set(prods.map(p => p.brand))].sort();
    return brands;
  }, [state.products, storeId]);

  const filteredProducts = useMemo(() => {
    let prods = state.products.filter(p => p.storeId === storeId);
    if (selectedDept) prods = prods.filter(p => p.departmentId === selectedDept);
    if (searchQuery) prods = prods.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    if (state.filters.onSale) prods = prods.filter(p => p.isOnSale);
    if (state.filters.organic) prods = prods.filter(p => p.isOrganic);
    if (priceMin !== '') prods = prods.filter(p => p.price >= parseFloat(priceMin));
    if (priceMax !== '') prods = prods.filter(p => p.price <= parseFloat(priceMax));
    if (selectedBrand !== 'all') prods = prods.filter(p => p.brand === selectedBrand);
    if (state.sortBy === 'price_low') prods = [...prods].sort((a, b) => a.price - b.price);
    else if (state.sortBy === 'price_high') prods = [...prods].sort((a, b) => b.price - a.price);
    else if (state.sortBy === 'name') prods = [...prods].sort((a, b) => a.name.localeCompare(b.name));
    return prods;
  }, [state.products, storeId, selectedDept, searchQuery, state.filters, state.sortBy, priceMin, priceMax, selectedBrand]);

  const hasAdvancedFilters = priceMin !== '' || priceMax !== '' || selectedBrand !== 'all';

  const clearAdvancedFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setSelectedBrand('all');
    dispatch({ type: ACTION_TYPES.SET_FILTER, payload: { onSale: false, organic: false } });
  };

  return (
    <div>
      <div className="storefront-header">
        <div className="storefront-header-inner">
          <div className="storefront-logo" style={{ background: store.color }}>{store.emoji}</div>
          <div className="storefront-info">
            <h1>{store.name}</h1>
            <div className="meta">
              <span>Delivery in {store.deliveryTimeMin}-{store.deliveryTimeMax} min</span>
              <span>&#x2B50; {store.rating}</span>
              {state.user.instacartPlus && <span className="badge">Free Delivery</span>}
              {store.isInStorePricing && <span className="badge">In-store prices</span>}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', position: 'relative', maxWidth: 300, flex: 1 }}>
            <input
              type="text"
              placeholder={`Search ${store.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)', outline: 'none', fontSize: 14 }}
            />
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="dept-tabs hide-scrollbar">
          <button className={`dept-tab ${!selectedDept ? 'active' : ''}`} onClick={() => { setSelectedDept(null); navigate(`/store/${storeId}`); }}>All</button>
          {departments.map(dept => (
            <button key={dept.id} className={`dept-tab ${selectedDept === dept.id ? 'active' : ''}`} onClick={() => { setSelectedDept(dept.id); navigate(`/store/${storeId}/department/${dept.id}`); }}>
              {dept.icon} {dept.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{filteredProducts.length} items</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="sort-dropdown">
              <span>Sort by:</span>
              <select value={state.sortBy} onChange={(e) => dispatch({ type: ACTION_TYPES.SET_SORT, payload: e.target.value })}>
                <option value="best_match">Best Match</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 'var(--radius-pill)', border: `1px solid ${hasAdvancedFilters || state.filters.onSale || state.filters.organic ? 'var(--color-primary)' : 'var(--color-border)'}`, fontSize: 13, background: hasAdvancedFilters || state.filters.onSale || state.filters.organic ? 'var(--color-primary-light)' : 'var(--color-white)', color: hasAdvancedFilters || state.filters.onSale || state.filters.organic ? 'var(--color-primary)' : 'var(--color-text-primary)', fontWeight: 500 }}>
              Filters {(hasAdvancedFilters || state.filters.onSale || state.filters.organic) && '•'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Dietary</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label className="filter-checkbox">
                    <input type="checkbox" checked={state.filters.onSale} onChange={(e) => dispatch({ type: ACTION_TYPES.SET_FILTER, payload: { onSale: e.target.checked } })} />
                    On Sale
                  </label>
                  <label className="filter-checkbox">
                    <input type="checkbox" checked={state.filters.organic} onChange={(e) => dispatch({ type: ACTION_TYPES.SET_FILTER, payload: { organic: e.target.checked } })} />
                    Organic
                  </label>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Price Range</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} min="0" step="0.01"
                    style={{ width: '70px', padding: '7px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', fontSize: 13, outline: 'none' }} />
                  <span>–</span>
                  <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} min="0" step="0.01"
                    style={{ width: '70px', padding: '7px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', fontSize: 13, outline: 'none' }} />
                </div>
              </div>
              {allBrands.length > 1 && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Brand</div>
                  <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)', fontSize: 13, outline: 'none' }}>
                    <option value="all">All Brands</option>
                    {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
            </div>
            {(hasAdvancedFilters || state.filters.onSale || state.filters.organic) && (
              <button onClick={clearAdvancedFilters} style={{ marginTop: 12, fontSize: 13, color: 'var(--color-red)', fontWeight: 600 }}>Clear All Filters</button>
            )}
          </div>
        )}

        {!showFilters && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <label className="filter-checkbox">
              <input type="checkbox" checked={state.filters.onSale} onChange={(e) => dispatch({ type: ACTION_TYPES.SET_FILTER, payload: { onSale: e.target.checked } })} />
              On Sale
            </label>
            <label className="filter-checkbox">
              <input type="checkbox" checked={state.filters.organic} onChange={(e) => dispatch({ type: ACTION_TYPES.SET_FILTER, payload: { organic: e.target.checked } })} />
              Organic
            </label>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="no-results">
            <div className="icon">&#x1F50D;</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
