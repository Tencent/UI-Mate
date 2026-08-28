import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const navigate = useNavigate();

  const departments = state.departments.filter(d => d.storeId === 'store_1');
  const onSaleProducts = state.products.filter(p => p.isOnSale).slice(0, 10);
  const popularProducts = state.products.slice(0, 10);

  const buyItAgainProducts = useMemo(() => {
    const productCounts = {};
    state.orders.forEach(order => {
      order.items?.forEach(item => {
        if (item.productId) {
          productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
        }
      });
    });
    const productIds = Object.keys(productCounts).sort((a, b) => productCounts[b] - productCounts[a]);
    return productIds
      .map(id => state.products.find(p => p.id === id))
      .filter(Boolean)
      .slice(0, 10);
  }, [state.orders, state.products]);

  const savedProducts = useMemo(() => {
    const favIds = state.favorites || [];
    return favIds.map(id => state.products.find(p => p.id === id)).filter(Boolean).slice(0, 10);
  }, [state.favorites, state.products]);

  return (
    <div className="page-content">
      <div className="hero-banner">
        <div>
          <h1>Groceries delivered in as little as 1 hour</h1>
          <p>Shop your favorite stores with free delivery on orders $35+</p>
          {state.user.instacartPlus && (
            <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-pill)', padding: '6px 14px', fontSize: 13, fontWeight: 600 }}>
              Xnstacart+ Member
            </div>
          )}
        </div>
        <div className="hero-emoji">&#x1F6D2;</div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Shop by Category</h2>
        </div>
        <div className="category-row hide-scrollbar">
          {departments.slice(0, 12).map(dept => (
            <button key={dept.id} className="category-bubble" onClick={() => { dispatch({ type: ACTION_TYPES.SET_STORE, payload: 'store_1' }); navigate(`/store/store_1/department/${dept.id}`); }}>
              <div className="category-bubble-icon">{dept.icon}</div>
              <span className="category-bubble-label">{dept.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Stores Near You</h2>
          <span className="see-all" onClick={() => navigate('/store/store_1')}>See all</span>
        </div>
        <div className="store-grid">
          {state.stores.map(store => (
            <button key={store.id} className="store-card" onClick={() => { dispatch({ type: ACTION_TYPES.SET_STORE, payload: store.id }); navigate(`/store/${store.id}`); }}>
              <div className="store-card-logo" style={{ background: store.color }}>{store.emoji}</div>
              <div className="store-card-name">{store.name}</div>
              <div className="store-card-delivery">Delivery in {store.deliveryTimeMin}-{store.deliveryTimeMax} min</div>
              <div className="store-card-fee">
                {state.user.instacartPlus ? <span className="free">Free delivery</span> : `$${store.deliveryFee} delivery`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {savedProducts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>&#x2665; Saved Items</h2>
            <span className="see-all" onClick={() => navigate('/favorites')}>See all ({state.favorites.length})</span>
          </div>
          <div className="product-scroll-row hide-scrollbar">
            {savedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {buyItAgainProducts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>Buy It Again</h2>
            <span className="see-all" onClick={() => navigate('/buy-it-again')}>See all</span>
          </div>
          <div className="product-scroll-row hide-scrollbar">
            {buyItAgainProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {onSaleProducts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>On Sale Now</h2>
            <span className="see-all" onClick={() => navigate('/deals')}>See all deals</span>
          </div>
          <div className="product-scroll-row hide-scrollbar">
            {onSaleProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h2>Popular Items</h2>
        </div>
        <div className="product-scroll-row hide-scrollbar">
          {popularProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
