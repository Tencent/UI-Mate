import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CatalogCategory() {
  const { state } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';

  const category = state.catalogCategories.find(c => c.sys_id === id);
  const items = state.catalogItems.filter(i => i.category === id && i.active);
  const categories = state.catalogCategories.filter(c => c.active);

  if (!category) return <div className="sn-page-body"><p>Category not found.</p></div>;

  return (
    <div className="sn-page">
      <div className="sn-breadcrumb">
        <a onClick={() => navigate('/' + sp)}>Home</a>
        <span className="sn-breadcrumb-sep">&gt;</span>
        <a onClick={() => navigate('/catalog' + sp)}>Service Catalog</a>
        <span className="sn-breadcrumb-sep">&gt;</span>
        <span>{category.title}</span>
      </div>
      <div className="sn-catalog-page">
        <div className="sn-catalog-sidebar" style={{ order: -1 }}>
          <div className="sn-sidebar-section">
            <div className="sn-sidebar-section-title">Categories</div>
            {categories.map(cat => (
              <a
                key={cat.sys_id}
                className="sn-sidebar-item"
                style={cat.sys_id === id ? { fontWeight: 600, color: 'var(--sn-text-primary)' } : {}}
                onClick={() => navigate(`/catalog/category/${cat.sys_id}${sp}`)}
              >
                {cat.icon} {cat.title}
              </a>
            ))}
          </div>
        </div>
        <div className="sn-catalog-main">
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>{category.icon} {category.title}</h1>
          <p style={{ color: '#666', marginBottom: 20 }}>{category.description}</p>
          {items.length === 0 ? (
            <p style={{ color: '#999' }}>No items in this category.</p>
          ) : (
            items.map(item => (
              <div key={item.sys_id} className="sn-catalog-item-row">
                <div className="sn-catalog-item-icon">{item.picture}</div>
                <div className="sn-catalog-item-info">
                  <div className="sn-catalog-item-name" onClick={() => navigate(`/catalog/item/${item.sys_id}${sp}`)}>{item.name}</div>
                  <div className="sn-catalog-item-short-desc">{item.short_description}</div>
                </div>
                <div className="sn-catalog-item-meta">
                  <div className="sn-catalog-item-price">{item.price}</div>
                  <div className="sn-catalog-item-delivery">{item.delivery_time}</div>
                </div>
                <button className="sn-btn sn-btn-sm sn-btn-primary" onClick={() => navigate(`/catalog/item/${item.sys_id}${sp}`)}>Order Now</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
