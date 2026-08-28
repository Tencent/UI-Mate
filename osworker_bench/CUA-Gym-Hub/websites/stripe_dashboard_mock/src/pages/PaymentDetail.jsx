import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { formatCurrency, generateId } from '../utils/dataManager';
import StatusBadge from '../components/StatusBadge';

export default function PaymentDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');

  const payment = state.payments.find(p => p.id === id);
  if (!payment) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-title">Payment not found</div>
          <button className="btn-primary" onClick={() => navigate('/payments')}>Back to payments</button>
        </div>
      </div>
    );
  }

  const customer = state.customers.find(c => c.id === payment.customer);
  const refundable = payment.status === 'succeeded' && payment.amount > payment.amount_refunded;
  const maxRefund = payment.amount - payment.amount_refunded;

  function handleRefund() {
    const amountCents = Math.round(parseFloat(refundAmount || 0) * 100);
    if (amountCents <= 0 || amountCents > maxRefund) return;
    dispatch({
      type: 'ADD_REFUND',
      payload: {
        id: generateId('re'),
        amount: amountCents,
        currency: payment.currency,
        charge: payment.id,
        reason: 'requested_by_customer',
        status: 'succeeded',
        created: Math.floor(Date.now() / 1000),
        metadata: {},
      }
    });
    setShowRefundModal(false);
    setRefundAmount('');
  }

  function formatTimestamp(ts) {
    return new Date(ts * 1000).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  }

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/payments" className="breadcrumb-link">Payments</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-current">{formatCurrency(payment.amount, payment.currency)}</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {formatCurrency(payment.amount, payment.currency)}
            <StatusBadge status={payment.refunded ? 'refunded' : payment.status} />
          </h1>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{payment.id}</div>
        </div>
        <div className="actions-row">
          {refundable && (
            <button className="btn-secondary" onClick={() => setShowRefundModal(true)}>
              <RotateCcw size={14} /> Refund
            </button>
          )}
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title">Payment details</div>
            </div>
            <div className="kv-list">
              <div className="kv-row"><span className="kv-label">Amount</span><span className="kv-value">{formatCurrency(payment.amount, payment.currency)}</span></div>
              <div className="kv-row"><span className="kv-label">Amount refunded</span><span className="kv-value">{formatCurrency(payment.amount_refunded, payment.currency)}</span></div>
              <div className="kv-row"><span className="kv-label">Net</span><span className="kv-value">{formatCurrency(payment.amount - payment.amount_refunded, payment.currency)}</span></div>
              <div className="kv-row"><span className="kv-label">Status</span><span className="kv-value"><StatusBadge status={payment.refunded ? 'refunded' : payment.status} /></span></div>
              <div className="kv-row"><span className="kv-label">Description</span><span className="kv-value">{payment.description || '--'}</span></div>
              <div className="kv-row">
                <span className="kv-label">Customer</span>
                <span className="kv-value">
                  {customer ? (
                    <Link to={`/customers/${customer.id}`} className="table-link">{customer.name || customer.email}</Link>
                  ) : payment.customer_email || '--'}
                </span>
              </div>
              {payment.payment_method && (
                <div className="kv-row">
                  <span className="kv-label">Payment method</span>
                  <span className="kv-value" style={{ textTransform: 'capitalize' }}>
                    {payment.payment_method.card?.brand} **** {payment.payment_method.card?.last4}
                  </span>
                </div>
              )}
              <div className="kv-row"><span className="kv-label">Risk evaluation</span><span className="kv-value">{payment.risk_level || 'normal'} ({payment.risk_score || '--'})</span></div>
              <div className="kv-row"><span className="kv-label">Created</span><span className="kv-value">{formatTimestamp(payment.created)}</span></div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Timeline</div>
            </div>
            <div className="timeline">
              {payment.status === 'succeeded' && (
                <div className="timeline-item">
                  <div className="timeline-dot success" />
                  <div className="timeline-label">Payment succeeded</div>
                  <div className="timeline-time">{formatTimestamp(payment.created)}</div>
                </div>
              )}
              {payment.status === 'failed' && (
                <div className="timeline-item">
                  <div className="timeline-dot" style={{ borderColor: 'var(--color-danger)', background: 'var(--color-danger)' }} />
                  <div className="timeline-label">Payment failed</div>
                  <div className="timeline-time">{formatTimestamp(payment.created)}</div>
                </div>
              )}
              {payment.amount_refunded > 0 && (
                <div className="timeline-item">
                  <div className="timeline-dot info" />
                  <div className="timeline-label">Refunded {formatCurrency(payment.amount_refunded, payment.currency)}</div>
                  <div className="timeline-time">Recently</div>
                </div>
              )}
              <div className="timeline-item">
                <div className="timeline-dot info" />
                <div className="timeline-label">Payment created</div>
                <div className="timeline-time">{formatTimestamp(payment.created)}</div>
              </div>
            </div>
          </div>
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
          {Object.keys(payment.metadata || {}).length > 0 && (
            <div className="card">
              <div className="card-header"><div className="card-title">Metadata</div></div>
              <div className="kv-list">
                {Object.entries(payment.metadata).map(([k, v]) => (
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

      {showRefundModal && (
        <div className="modal-overlay" onClick={() => setShowRefundModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Refund payment</div>
              <button className="modal-close" onClick={() => setShowRefundModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16, color: 'var(--color-text-secondary)' }}>
                Maximum refundable: {formatCurrency(maxRefund, payment.currency)}
              </p>
              <div className="form-group">
                <label className="form-label">Refund amount ($)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={(maxRefund / 100).toFixed(2)}
                  value={refundAmount}
                  onChange={e => setRefundAmount(e.target.value)}
                  placeholder={(maxRefund / 100).toFixed(2)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRefundModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleRefund}>Refund</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
