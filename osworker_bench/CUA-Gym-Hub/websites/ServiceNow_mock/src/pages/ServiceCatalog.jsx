import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ServiceCatalog() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';

  const categories = state.catalogCategories.filter(c => c.active);
  const popularItems = state.catalogItems.filter(i => i.popular && i.active);
  const cartCount = state.shoppingCart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="sn-page">
      <div className="sn-breadcrumb">
        <a onClick={() => navigate('/' + sp)}>Home</a>
        <span className="sn-breadcrumb-sep">&gt;</span>
        <span>Service Catalog</span>
      </div>
      <div className="sn-catalog-page">
        <div className="sn-catalog-main">
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20, color: 'var(--sn-text-primary)' }}>Service Catalog</h1>
          <div className="sn-catalog-grid">
            {categories.map(cat => (
              <div key={cat.sys_id} className="sn-catalog-card" onClick={() => navigate(`/catalog/category/${cat.sys_id}${sp}`)}>
                <div className="sn-catalog-card-icon">{cat.icon}</div>
                <div>
                  <div className="sn-catalog-card-title">{cat.title}</div>
                  <div className="sn-catalog-card-desc">{cat.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="sn-catalog-sidebar">
          <div className="sn-sidebar-section">
            <div className="sn-sidebar-section-title">Top Requests</div>
            {popularItems.map(item => (
              <a key={item.sys_id} className="sn-sidebar-item" onClick={() => navigate(`/catalog/item/${item.sys_id}${sp}`)}>
                {item.name}
              </a>
            ))}
          </div>
          <div className="sn-sidebar-section">
            <div className="sn-sidebar-section-title">Shopping Cart</div>
            {cartCount > 0 ? (
              <div>
                <p style={{ fontSize: 13, marginBottom: 8 }}>{cartCount} item{cartCount !== 1 ? 's' : ''} in cart</p>
                <button className="sn-btn sn-btn-sm sn-btn-primary" onClick={() => navigate('/catalog/cart' + sp)}>View Cart</button>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#999' }}>Empty</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
