import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { formatCurrency, generateId } from '../utils/dataManager';
import StatusBadge from '../components/StatusBadge';

export default function Subscriptions() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ customer: '', product: '', quantity: '1' });

  const tabs = ['all', 'active', 'trialing', 'past_due', 'canceled', 'paused'];

  const subs = state.subscriptions
    .filter(s => filter === 'all' || s.status === filter)
    .sort((a, b) => b.created - a.created);

  function handleCancel(e, id) {
    e.stopPropagation();
    dispatch({ type: 'CANCEL_SUBSCRIPTION', payload: { id, immediate: true } });
  }

  function formatTs(ts) {
    return ts ? new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--';
  }

  function handleCreate() {
    if (!form.customer || !form.product) return;
    const prod = state.products.find(p => p.id === form.product);
    const price = state.prices.find(p => p.product === form.product && p.active);
    if (!prod || !price) return;
    const cust = state.customers.find(c => c.id === form.customer);
    const now = Math.floor(Date.now() / 1000);
    const periodEnd = now + (price.recurring?.interval === 'year' ? 31536000 : price.recurring?.interval === 'week' ? 604800 : 2592000);
    const qty = parseInt(form.quantity) || 1;

    const subId = generateId('sub');
    dispatch({
      type: 'ADD_SUBSCRIPTION',
      payload: {
        id: subId,
        customer: form.customer,
        customer_name: cust?.name || '',
        customer_email: cust?.email || '',
        status: 'active',
        items: [{
          id: generateId('si'),
          price: price.id,
          product: prod.id,
          product_name: prod.name,
          unit_amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval || 'month',
          quantity: qty,
        }],
        current_period_start: now,
        current_period_end: periodEnd,
        cancel_at_period_end: false,
        canceled_at: null,
        trial_start: null,
        trial_end: null,
        default_payment_method: null,
        collection_method: 'charge_automatically',
        metadata: {},
        created: now,
        livemode: !state.testMode,
      }
    });
    setShowCreate(false);
    setForm({ customer: '', product: '', quantity: '1' });
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Subscriptions</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Create subscription
        </button>
      </div>

      <div className="filter-tabs">
        {tabs.map(tab => (
          <button key={tab} className={`filter-tab ${filter === tab ? 'active' : ''}`} onClick={() => setFilter(tab)}>
            {tab === 'all' ? 'All' : tab.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Current period</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {subs.map(s => (
              <tr key={s.id} onClick={() => navigate(`/subscriptions/${s.id}`)}>
                <td>
                  <Link to={`/customers/${s.customer}`} className="table-link" onClick={e => e.stopPropagation()}>{s.customer_name || s.customer_email}</Link>
                </td>
                <td style={{ fontWeight: 500 }}>
                  {s.items.map(i => i.product_name).join(', ')}
                  {s.items[0]?.quantity > 1 && <span style={{ color: 'var(--color-text-muted)' }}> x{s.items[0].quantity}</span>}
                </td>
                <td><StatusBadge status={s.status} /></td>
                <td className="table-secondary">{formatTs(s.current_period_start)} - {formatTs(s.current_period_end)}</td>
                <td className="table-secondary">{formatTs(s.created)}</td>
                <td>
                  {(s.status === 'active' || s.status === 'trialing') && (
                    <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 8px' }} onClick={(e) => handleCancel(e, s.id)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
                  No subscriptions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create subscription</div>
              <button className="modal-close" onClick={() => setShowCreate(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select className="form-select" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })}>
                  <option value="">Select customer...</option>
                  {state.customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Product *</label>
                <select className="form-select" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })}>
                  <option value="">Select product...</option>
                  {state.products.filter(p => p.active).map(p => {
                    const price = state.prices.find(pr => pr.product === p.id && pr.active);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} {price ? `(${formatCurrency(price.unit_amount, price.currency)}/${price.recurring?.interval || 'one-time'})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate}>Create subscription</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
