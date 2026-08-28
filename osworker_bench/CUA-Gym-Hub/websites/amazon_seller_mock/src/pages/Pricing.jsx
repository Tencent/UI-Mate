import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function fmt(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Pricing() {
  const { state, dispatch, showToast } = useApp();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  if (!state) return null;
  const { products } = state;

  const filtered = useMemo(() => {
    if (!search) return products.filter(p => p.status === 'Active');
    const q = search.toLowerCase();
    return products.filter(p => p.status === 'Active' && (p.title.toLowerCase().includes(q) || p.asin.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)));
  }, [products, search]);

  const [editPrice, setEditPrice] = useState({});
  const savePrice = (id, val) => {
    const price = parseFloat(val);
    if (!price || price <= 0) return;
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id, price } });
    showToast('Price updated', 'success');
    setEditPrice(e => ({ ...e, [id]: null }));
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>Manage Pricing</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input className="form-input" style={{ width: 300 }} placeholder="Search by product, ASIN, or SKU" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Your Price</th>
              <th>Buy Box Price</th>
              <th>Buy Box Owner</th>
              <th>Lowest Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(prod => (
              <tr key={prod.id}>
                <td>
                  <Link to={`/catalog/edit-product/${prod.id}`} style={{ fontWeight: 700, display: 'block', maxWidth: 280 }} className="truncate">{prod.title.slice(0, 50)}</Link>
                  <div style={{ fontSize: 11, color: '#555' }}>{prod.asin} · {prod.sku}</div>
                </td>
                <td>
                  {editPrice[prod.id] !== undefined ? (
                    <input type="number" step="0.01" className="form-input" style={{ width: 80 }} defaultValue={prod.price.toFixed(2)} autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') savePrice(prod.id, e.target.value); if (e.key === 'Escape') setEditPrice(ep => ({ ...ep, [prod.id]: null })); }}
                      onBlur={e => savePrice(prod.id, e.target.value)} />
                  ) : (
                    <span onClick={() => setEditPrice(ep => ({ ...ep, [prod.id]: prod.price }))} style={{ cursor: 'pointer', color: '#0066c0', borderBottom: '1px dashed #0066c0' }}>
                      {fmt(prod.price)}
                    </span>
                  )}
                </td>
                <td style={{ fontWeight: 700, color: prod.buyBoxOwner ? '#067d62' : '#111' }}>{fmt(prod.buyBoxPrice)}</td>
                <td>
                  {prod.buyBoxOwner
                    ? <span className="badge badge-success">You ✓</span>
                    : <span className="badge badge-inactive">Competitor</span>}
                </td>
                <td>{fmt(prod.lowestPrice)}</td>
                <td><span className={`badge ${prod.status === 'Active' ? 'badge-success' : 'badge-inactive'}`}>{prod.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
