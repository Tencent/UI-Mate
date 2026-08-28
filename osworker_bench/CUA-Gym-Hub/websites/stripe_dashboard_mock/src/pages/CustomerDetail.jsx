import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { formatCurrency } from '../utils/dataManager';
import StatusBadge from '../components/StatusBadge';

export default function CustomerDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const customer = state.customers.find(c => c.id === id);
  if (!customer) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-title">Customer not found</div>
          <button className="btn-primary" onClick={() => navigate('/customers')}>Back to customers</button>
        </div>
      </div>
    );
  }

  const customerPayments = state.payments.filter(p => p.customer === id).sort((a, b) => b.created - a.created).slice(0, 10);
  const customerSubs = state.subscriptions.filter(s => s.customer === id);
  const customerInvoices = state.invoices.filter(i => i.customer === id).slice(0, 5);

  function formatTimestamp(ts) {
    return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function handleEdit() {
    dispatch({ type: 'UPDATE_CUSTOMER', payload: { id: customer.id, updates: editForm } });
    setShowEditModal(false);
  }

  function handleDeleteConfirmed() {
    dispatch({ type: 'DELETE_CUSTOMER', payload: customer.id });
    setShowDeleteConfirm(false);
    navigate('/customers');
  }

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/customers" className="breadcrumb-link">Customers</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-current">{customer.name}</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">{customer.name}</h1>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{customer.id}</div>
        </div>
        <div className="actions-row">
          <button className="btn-secondary" onClick={() => { setEditForm({ name: customer.name, email: customer.email, phone: customer.phone || '', description: customer.description || '' }); setShowEditModal(true); }}>
            <Edit2 size={14} /> Edit
          </button>
          <button className="btn-secondary" style={{ color: 'var(--color-danger)' }} onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Details</div></div>
            <div className="kv-list">
              <div className="kv-row"><span className="kv-label">Email</span><span className="kv-value">{customer.email}</span></div>
              {customer.phone && <div className="kv-row"><span className="kv-label">Phone</span><span className="kv-value">{customer.phone}</span></div>}
              {customer.description && <div className="kv-row"><span className="kv-label">Description</span><span className="kv-value">{customer.description}</span></div>}
              <div className="kv-row"><span className="kv-label">Created</span><span className="kv-value">{formatTimestamp(customer.created)}</span></div>
              <div className="kv-row"><span className="kv-label">Total spent</span><span className="kv-value">{formatCurrency(customer.total_spent)}</span></div>
              {customer.address && (
                <div className="kv-row">
                  <span className="kv-label">Address</span>
                  <span className="kv-value" style={{ textAlign: 'right' }}>
                    {customer.address.line1}{customer.address.line2 ? `, ${customer.address.line2}` : ''}<br />
                    {customer.address.city}, {customer.address.state} {customer.address.postal_code}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recent payments */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title">Recent payments</div>
              <Link to="/payments" style={{ fontSize: 13 }}>View all →</Link>
            </div>
            {customerPayments.length > 0 ? (
              <div className="data-table" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <tbody>
                    {customerPayments.map(p => (
                      <tr key={p.id} onClick={() => navigate(`/payments/${p.id}`)}>
                        <td className="table-amount">{formatCurrency(p.amount, p.currency)}</td>
                        <td><StatusBadge status={p.refunded ? 'refunded' : p.status} /></td>
                        <td className="table-secondary">{p.description || '--'}</td>
                        <td className="table-secondary">{formatTimestamp(p.created)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>No payments yet</div>
            )}
          </div>

          {/* Subscriptions */}
          {customerSubs.length > 0 && (
            <div className="card">
              <div className="card-header"><div className="card-title">Subscriptions</div></div>
              <div className="data-table" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <tbody>
                    {customerSubs.map(s => (
                      <tr key={s.id} onClick={() => navigate(`/subscriptions/${s.id}`)}>
                        <td style={{ fontWeight: 500 }}>{s.items?.[0]?.product_name || s.id}</td>
                        <td><StatusBadge status={s.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          <div className="card">
            <div className="card-header"><div className="card-title">Balance</div></div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{formatCurrency(customer.balance)}</div>
          </div>
          {Object.keys(customer.metadata || {}).length > 0 && (
            <div className="card">
              <div className="card-header"><div className="card-title">Metadata</div></div>
              <div className="kv-list">
                {Object.entries(customer.metadata).map(([k, v]) => (
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Edit customer</div>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleEdit}>Save changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Delete customer</div>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
                Are you sure you want to delete <strong>{customer.name}</strong>? This action cannot be undone. All associated data will be permanently removed.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button
                className="btn-danger"
                onClick={handleDeleteConfirmed}
              >
                <Trash2 size={14} /> Delete customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
