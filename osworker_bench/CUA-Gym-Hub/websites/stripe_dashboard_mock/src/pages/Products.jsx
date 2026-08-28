import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { formatCurrency, generateId } from '../utils/dataManager';

export default function Products() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', interval: 'month' });

  function handleCreate() {
    if (!form.name) return;
    const priceAmount = Math.round(parseFloat(form.price || 0) * 100);
    const prodId = generateId('prod');
    const priceId = generateId('price');
    dispatch({
      type: 'ADD_PRODUCT',
      payload: { id: prodId, name: form.name, description: form.description, active: true, images: [], default_price: priceId, metadata: {}, created: Math.floor(Date.now() / 1000), updated: Math.floor(Date.now() / 1000), unit_label: null }
    });
    dispatch({
      type: 'ADD_PRICE',
      payload: { id: priceId, product: prodId, active: true, currency: 'usd', unit_amount: priceAmount, billing_scheme: 'per_unit', type: 'recurring', recurring: { interval: form.interval, interval_count: 1, usage_type: 'licensed' }, nickname: null, metadata: {}, created: Math.floor(Date.now() / 1000) }
    });
    setShowCreate(false);
    setForm({ name: '', description: '', price: '', interval: 'month' });
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Add product
        </button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Pricing</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {state.products.map(prod => {
              const price = state.prices.find(p => p.id === prod.default_price);
              return (
                <tr key={prod.id} onClick={() => navigate(`/products/${prod.id}`)}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{prod.name}</div>
                    {prod.description && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{prod.description}</div>}
                  </td>
                  <td>
                    {price ? (
                      <span>
                        {formatCurrency(price.unit_amount, price.currency)}
                        {price.recurring && <span style={{ color: 'var(--color-text-muted)' }}>/{price.recurring.interval}</span>}
                      </span>
                    ) : '--'}
                  </td>
                  <td>
                    <span className={`badge ${prod.active ? 'badge-active' : 'badge-canceled'}`}>
                      <span className="badge-dot" />
                      {prod.active ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="table-secondary">
                    {new Date(prod.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add product</div>
              <button className="modal-close" onClick={() => setShowCreate(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input className="form-input" type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Billing interval</label>
                  <select className="form-select" value={form.interval} onChange={e => setForm({...form, interval: e.target.value})}>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                    <option value="week">Weekly</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate}>Add product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
