import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function Favorites() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('name');

  const favoriteProducts = useMemo(() => {
    const favIds = state.favorites || [];
    let prods = state.products.filter(p => favIds.includes(p.id));
    if (sortBy === 'name') prods = [...prods].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'price_low') prods = [...prods].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_high') prods = [...prods].sort((a, b) => b.price - a.price);
    else if (sortBy === 'store') prods = [...prods].sort((a, b) => a.storeId.localeCompare(b.storeId));
    return prods;
  }, [state.favorites, state.products, sortBy]);

  const handleAddAllToCart = () => {
    favoriteProducts.forEach(p => {
      const existing = state.cart.find(ci => ci.productId === p.id);
      if (!existing) {
        dispatch({ type: ACTION_TYPES.ADD_TO_CART, payload: { productId: p.id, storeId: p.storeId, quantity: 1 } });
      }
    });
  };

  const handleClearAll = () => {
    (state.favorites || []).forEach(id => {
      dispatch({ type: ACTION_TYPES.REMOVE_FAVORITE, payload: id });
    });
  };

  if (!state.favorites || state.favorites.length === 0) {
    return (
      <div className="page-content">
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Saved Items</h1>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>&#x2665;</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No saved items yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
            Tap the heart icon on any product to save it here for easy access
          </p>
          <button className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }} onClick={() => navigate('/')}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Saved Items</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="sort-dropdown">
            <span>Sort by:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="name">Name A-Z</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="store">Store</option>
            </select>
          </div>
          {favoriteProducts.length > 0 && (
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '8px 18px', fontSize: 14 }}
              onClick={handleAddAllToCart}
            >
              Add All to Cart
            </button>
          )}
          <button
            style={{ fontSize: 13, color: 'var(--color-red)', fontWeight: 600, padding: '8px 4px' }}
            onClick={handleClearAll}
          >
            Clear All
          </button>
        </div>
      </div>

      <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
        {favoriteProducts.length} saved {favoriteProducts.length === 1 ? 'item' : 'items'}
      </div>

      <div className="product-grid">
        {favoriteProducts.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
