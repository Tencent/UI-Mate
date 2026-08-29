import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, XCircle, PauseCircle, PlayCircle } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { formatCurrency } from '../utils/dataManager';
import StatusBadge from '../components/StatusBadge';

export default function SubscriptionDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelMode, setCancelMode] = useState('immediately');

  const sub = state.subscriptions.find(s => s.id === id);
  if (!sub) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-title">Subscription not found</div>
          <button className="btn-primary" onClick={() => navigate('/subscriptions')}>Back to subscriptions</button>
        </div>
      </div>
    );
  }

  const customer = state.customers.find(c => c.id === sub.customer);
  const subInvoices = state.invoices.filter(i => i.subscription === id).sort((a, b) => b.created - a.created);

  function formatTs(ts) {
    return ts ? new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--';
  }

  function handleCancel() {
    dispatch({
      type: 'CANCEL_SUBSCRIPTION',
      payload: { id, immediate: cancelMode === 'immediately' }
    });
    setShowCancelModal(false);
  }

  function handlePause() {
    dispatch({
      type: 'UPDATE_SUBSCRIPTION',
      payload: { id, updates: { status: 'paused', pause_collection: { behavior: 'void' } } }
    });
  }

  function handleResume() {
    dispatch({
      type: 'UPDATE_SUBSCRIPTION',
      payload: { id, updates: { status: 'active', pause_collection: null } }
    });
  }

  const isActive = sub.status === 'active' || sub.status === 'trialing';
  const isPaused = sub.status === 'paused';

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/subscriptions" className="breadcrumb-link">Subscriptions</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-current">{sub.items?.[0]?.product_name || sub.id}</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {sub.items?.map(i => i.product_name).join(', ') || sub.id}
            <StatusBadge status={sub.status} />
          </h1>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{sub.id}</div>
        </div>
        <div className="actions-row">
          {isActive && (
            <>
              <button className="btn-secondary" onClick={handlePause}>
                <PauseCircle size={14} /> Pause
              </button>
              <button className="btn-secondary" style={{ color: 'var(--color-danger)' }} onClick={() => setShowCancelModal(true)}>
                <XCircle size={14} /> Cancel
              </button>
            </>
          )}
          {isPaused && (
            <button className="btn-primary" onClick={handleResume}>
              <PlayCircle size={14} /> Resume
            </button>
          )}
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Subscription details</div></div>
            <div className="kv-list">
              <div className="kv-row"><span className="kv-label">Status</span><span className="kv-value"><StatusBadge status={sub.status} /></span></div>
              <div className="kv-row"><span className="kv-label">Current period</span><span className="kv-value">{formatTs(sub.current_period_start)} to {formatTs(sub.current_period_end)}</span></div>
              <div className="kv-row"><span className="kv-label">Created</span><span className="kv-value">{formatTs(sub.created)}</span></div>
              {sub.trial_start && (
                <div className="kv-row"><span className="kv-label">Trial period</span><span className="kv-value">{formatTs(sub.trial_start)} to {formatTs(sub.trial_end)}</span></div>
              )}
              {sub.canceled_at && (
                <div className="kv-row"><span className="kv-label">Canceled at</span><span className="kv-value">{formatTs(sub.canceled_at)}</span></div>
              )}
              {sub.cancel_at_period_end && (
                <div className="kv-row"><span className="kv-label">Cancels at</span><span className="kv-value">End of current period</span></div>
              )}
              <div className="kv-row"><span className="kv-label">Collection method</span><span className="kv-value" style={{ textTransform: 'capitalize' }}>{(sub.collection_method || 'charge_automatically').replace(/_/g, ' ')}</span></div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Items</div></div>
            <div className="data-table" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {sub.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                      <td>{formatCurrency(item.unit_amount, item.currency)}/{item.interval}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {subInvoices.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Invoices</div>
                <Link to="/invoices" style={{ fontSize: 13 }}>View all →</Link>
              </div>
              <div className="data-table" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Number</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subInvoices.slice(0, 10).map(inv => (
                      <tr key={inv.id} onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{inv.number || inv.id}</td>
                        <td className="table-amount">{formatCurrency(inv.amount_due, inv.currency)}</td>
                        <td><StatusBadge status={inv.status} /></td>
                        <td className="table-secondary">{formatTs(inv.created)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          {customer && (
            <div className="card">
              <div className="card-header"><div className="card-title">Customer</div></div>
              <div style={{ fontSize: 14 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{customer.name}</div>
                <div style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>{customer.email}</div>
                <Link to={`/customers/${customer.id}`} style={{ fontSize: 13 }}>View customer →</Link>
              </div>
            </div>
          )}

          {sub.default_payment_method && (
            <div className="card">
              <div className="card-header"><div className="card-title">Payment method</div></div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {sub.default_payment_method}
              </div>
            </div>
          )}

          {Object.keys(sub.metadata || {}).length > 0 && (
            <div className="card">
              <div className="card-header"><div className="card-title">Metadata</div></div>
              <div className="kv-list">
                {Object.entries(sub.metadata).map(([k, v]) => (
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

      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Cancel subscription</div>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16, color: 'var(--color-text-secondary)' }}>
                Choose when this subscription should be canceled:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '12px 16px', border: `2px solid ${cancelMode === 'immediately' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', background: cancelMode === 'immediately' ? 'rgba(99, 91, 255, 0.04)' : 'transparent' }}>
                  <input
                    type="radio"
                    name="cancelMode"
                    checked={cancelMode === 'immediately'}
                    onChange={() => setCancelMode('immediately')}
                    style={{ marginTop: 2 }}
                  />
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>Cancel immediately</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>The subscription will be canceled right away. The customer will not be charged again.</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '12px 16px', border: `2px solid ${cancelMode === 'end_of_period' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', background: cancelMode === 'end_of_period' ? 'rgba(99, 91, 255, 0.04)' : 'transparent' }}>
                  <input
                    type="radio"
                    name="cancelMode"
                    checked={cancelMode === 'end_of_period'}
                    onChange={() => setCancelMode('end_of_period')}
                    style={{ marginTop: 2 }}
                  />
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>Cancel at end of billing period</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>The subscription will remain active until {formatTs(sub.current_period_end)}.</div>
                  </div>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCancelModal(false)}>Keep subscription</button>
              <button className="btn-primary" style={{ background: 'var(--color-danger)' }} onClick={handleCancel}>Cancel subscription</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
