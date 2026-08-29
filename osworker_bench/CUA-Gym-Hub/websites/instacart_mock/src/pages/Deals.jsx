import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Deals() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');

  const storesWithDeals = state.stores.filter(s => state.deals.some(d => d.storeId === s.id));

  const filteredDeals = activeFilter === 'all'
    ? state.deals
    : state.deals.filter(d => d.storeId === activeFilter || (activeFilter === 'xnstacart' && d.storeId === null));

  return (
    <div className="page-content">
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Deals & Coupons</h1>

      <div className="dept-tabs hide-scrollbar" style={{ marginBottom: 24 }}>
        <button className={`dept-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
          All Deals
        </button>
        <button className={`dept-tab ${activeFilter === 'xnstacart' ? 'active' : ''}`} onClick={() => setActiveFilter('xnstacart')}>
          &#x1F955; Xnstacart
        </button>
        {storesWithDeals.map(store => (
          <button key={store.id} className={`dept-tab ${activeFilter === store.id ? 'active' : ''}`} onClick={() => setActiveFilter(store.id)}>
            {store.emoji} {store.name}
          </button>
        ))}
      </div>

      {filteredDeals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#x1F3F7;&#xFE0F;</div>
          <p>No deals available for this store right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredDeals.map(deal => {
            const store = state.stores.find(s => s.id === deal.storeId);
            return (
              <div key={deal.id} className="deal-card">
                <span className="deal-badge">{deal.badge}</span>
                <div className="deal-title">{deal.title}</div>
                <div className="deal-description">{deal.description}</div>
                {store && <div className="deal-store">{store.emoji} {store.name}</div>}
                {!store && deal.storeId === null && <div className="deal-store">&#x1F955; Xnstacart</div>}
                <div className="deal-expiry">Valid until {deal.endDate}</div>
                <button className={`btn-outline ${deal.isClipped ? 'clipped' : ''}`} style={{ alignSelf: 'flex-start' }}
                  onClick={() => dispatch({ type: ACTION_TYPES.CLIP_DEAL, payload: deal.id })}>
                  {deal.isClipped ? '&#x2713; Clipped' : 'Clip Coupon'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
