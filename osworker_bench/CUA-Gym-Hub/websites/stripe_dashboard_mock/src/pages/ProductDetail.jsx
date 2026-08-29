import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Edit2, Archive, RotateCcw } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { formatCurrency } from '../utils/dataManager';

export default function ProductDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});

  const product = state.products.find(p => p.id === id);
  if (!product) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-title">Product not found</div>
          <button className="btn-primary" onClick={() => navigate('/products')}>Back to products</button>
        </div>
      </div>
    );
  }

  const prices = state.prices.filter(p => p.product === id);
  const subscriptions = state.subscriptions.filter(s => s.items.some(i => i.product === id));

  function formatTimestamp(ts) {
    return ts ? new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--';
  }

  function handleToggleActive() {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id, updates: { active: !product.active, updated: Math.floor(Date.now() / 1000) } } });
  }

  function handleEdit() {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id, updates: { ...editForm, updated: Math.floor(Date.now() / 1000) } } });
    setShowEdit(false);
  }

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/products" className="breadcrumb-link">Products</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {product.name}
            <span className={`badge ${product.active ? 'badge-active' : 'badge-canceled'}`}>
              <span className="badge-dot" />
              {product.active ? 'Active' : 'Archived'}
            </span>
          </h1>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{product.id}</div>
        </div>
        <div className="actions-row">
          <button className="btn-secondary" onClick={() => { setEditForm({ name: product.name, description: product.description || '' }); setShowEdit(true); }}>
            <Edit2 size={14} /> Edit
          </button>
          <button className="btn-secondary" onClick={handleToggleActive}>
            {product.active ? <><Archive size={14} /> Archive</> : <><RotateCcw size={14} /> Reactivate</>}
          </button>
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Details</div></div>
            <div className="kv-list">
              <div className="kv-row"><span className="kv-label">Name</span><span className="kv-value">{product.name}</span></div>
              {product.description && (
                <div className="kv-row"><span className="kv-label">Description</span><span className="kv-value">{product.description}</span></div>
              )}
              <div className="kv-row"><span className="kv-label">Status</span><span className="kv-value">{product.active ? 'Active' : 'Archived'}</span></div>
              <div className="kv-row"><span className="kv-label">Created</span><span className="kv-value">{formatTimestamp(product.created)}</span></div>
              <div className="kv-row"><span className="kv-label">Updated</span><span className="kv-value">{formatTimestamp(product.updated)}</span></div>
              {product.unit_label && (
                <div className="kv-row"><span className="kv-label">Unit label</span><span className="kv-value">{product.unit_label}</span></div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Pricing</div></div>
            {prices.length > 0 ? (
              <div className="data-table" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Price</th>
                      <th>Type</th>
                      <th>Interval</th>
                      <th>Status</th>
                      <th>ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map(price => (
                      <tr key={price.id}>
                        <td className="table-amount">{formatCurrency(price.unit_amount, price.currency)}</td>
                        <td style={{ textTransform: 'capitalize' }}>{price.type}</td>
                        <td>{price.recurring ? `Every ${price.recurring.interval_count > 1 ? price.recurring.interval_count + ' ' : ''}${price.recurring.interval}${price.recurring.interval_count > 1 ? 's' : ''}` : 'One time'}</td>
                        <td>
                          <span className={`badge ${price.active ? 'badge-active' : 'badge-canceled'}`}>
                            <span className="badge-dot" />
                            {price.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>{price.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>No prices configured</div>
            )}
          </div>

          {subscriptions.length > 0 && (
            <div className="card">
              <div className="card-header"><div className="card-title">Subscriptions using this product</div></div>
              <div className="data-table" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map(s => (
                      <tr key={s.id} onClick={() => navigate(`/subscriptions/${s.id}`)}>
                        <td>
                          <Link to={`/customers/${s.customer}`} className="table-link" onClick={e => e.stopPropagation()}>
                            {s.customer_name || s.customer_email}
                          </Link>
                        </td>
                        <td>
                          <span className={`badge badge-${s.status}`}>
                            <span className="badge-dot" />
                            {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                        </td>
                        <td className="table-secondary">{formatTimestamp(s.created)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          {Object.keys(product.metadata || {}).length > 0 && (
            <div className="card">
              <div className="card-header"><div className="card-title">Metadata</div></div>
              <div className="kv-list">
                {Object.entries(product.metadata).map(([k, v]) => (
                  <div key={k} className="kv-row">
                    <span className="kv-label" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{k}</span>
                    <span className="kv-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Edit product</div>
              <button className="modal-close" onClick={() => setShowEdit(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleEdit}>Save changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
