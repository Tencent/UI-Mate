import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CatalogItemDetail() {
  const { state, dispatch } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const item = state.catalogItems.find(i => i.sys_id === id);
  if (!item) return <div className="sn-page-body"><p>Item not found.</p></div>;

  const category = state.catalogCategories.find(c => c.sys_id === item.category);

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_TO_CART', payload: { item, quantity } });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="sn-page">
      <div className="sn-breadcrumb">
        <a onClick={() => navigate('/' + sp)}>Home</a>
        <span className="sn-breadcrumb-sep">&gt;</span>
        <a onClick={() => navigate('/catalog' + sp)}>Service Catalog</a>
        <span className="sn-breadcrumb-sep">&gt;</span>
        {category && <><a onClick={() => navigate(`/catalog/category/${category.sys_id}${sp}`)}>{category.title}</a><span className="sn-breadcrumb-sep">&gt;</span></>}
        <span>{item.name}</span>
      </div>
      <div className="sn-page-body">
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ fontSize: 64, flexShrink: 0 }}>{item.picture}</div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{item.name}</h1>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>{item.short_description}</div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
                <div><strong style={{ fontSize: 20 }}>{item.price}</strong></div>
                <div style={{ fontSize: 13, color: '#999' }}>Delivery: {item.delivery_time}</div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <label style={{ fontSize: 13, color: '#666' }}>Quantity:</label>
                <input type="number" min={1} max={10} value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: 60, padding: '4px 8px', border: '1px solid #ccc', borderRadius: 3 }} />
                <button className="sn-btn sn-btn-success" onClick={handleAddToCart}>
                  {added ? 'Added!' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
          <div className="sn-form-section">
            <div className="sn-form-section-title">Description</div>
            <div dangerouslySetInnerHTML={{ __html: item.description }} style={{ fontSize: 14, lineHeight: 1.6, color: '#333' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
