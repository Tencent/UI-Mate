import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import './BillingPage.css';

function formatCurrency(n) {
  return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TxnStatus({ status }) {
  const map = {
    completed: { label: 'Completed', bg: '#E6F4EA', color: '#31A24C' },
    pending: { label: 'Pending', bg: '#FFF9E6', color: '#F7B928' },
    failed: { label: 'Failed', bg: '#FFF0F0', color: '#FA383E' },
  };
  const s = map[status] || map['completed'];
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>{s.label}</span>;
}

export default function BillingPage() {
  const { state, updateState } = useApp();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showEditLimit, setShowEditLimit] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardLast4, setNewCardLast4] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newSpendCap, setNewSpendCap] = useState('');
  const pageSize = 10;
  const txns = state.billingTransactions || [];
  const totalPages = Math.ceil(txns.length / pageSize);
  const pageTxns = txns.slice((page - 1) * pageSize, page * pageSize);
  const pm = state.paymentMethods?.[0];

  function handleAddPayment() {
    if (!newCardName.trim() || !newCardLast4.trim() || !newCardExpiry.trim()) {
      showToast('Please fill in all fields.');
      return;
    }
    const newMethod = {
      id: `pm_${Date.now()}`,
      type: 'credit_card',
      name: `${newCardName} ••••${newCardLast4}`,
      last4: newCardLast4,
      expiresAt: newCardExpiry,
      isPrimary: (state.paymentMethods || []).length === 0
    };
    updateState(prev => ({
      ...prev,
      paymentMethods: [...(prev.paymentMethods || []), newMethod]
    }));
    showToast('Payment method added.');
    setShowAddPayment(false);
    setNewCardName('');
    setNewCardLast4('');
    setNewCardExpiry('');
  }

  function handleEditLimit() {
    const val = parseFloat(newSpendCap);
    if (isNaN(val) || val < 0) {
      showToast('Please enter a valid amount.');
      return;
    }
    updateState(prev => ({
      ...prev,
      account: { ...prev.account, spendCap: val }
    }));
    showToast('Spending limit updated.');
    setShowEditLimit(false);
    setNewSpendCap('');
  }

  return (
    <div className="billing-page">
      <h2 className="page-title" style={{ marginBottom: 16 }}>Billing</h2>

      <div className="billing-card">
        <div className="billing-card-title">Payment methods</div>
        {(state.paymentMethods || []).map(method => (
          <div key={method.id} className="payment-method-row">
            <div className="pm-icon">💳</div>
            <div className="pm-info">
              <div className="pm-name">{method.name}</div>
              <div className="pm-exp">Expires {method.expiresAt}</div>
            </div>
            {method.isPrimary && <span className="pm-primary-badge">Primary</span>}
          </div>
        ))}
        <div className="billing-actions">
          <button className="btn-outline" onClick={() => setShowAddPayment(true)}>Add payment method</button>
        </div>
        <div className="spend-limit-row">
          <div>
            <div className="billing-meta-label">Account spending limit</div>
            {showEditLimit ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontWeight: 500 }}>$</span>
                <input
                  type="number"
                  value={newSpendCap}
                  onChange={e => setNewSpendCap(e.target.value)}
                  placeholder={state.account?.spendCap || '0'}
                  style={{ width: 100, padding: '4px 8px', border: '1px solid #CCD0D5', borderRadius: 4, fontSize: 13 }}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleEditLimit(); if (e.key === 'Escape') setShowEditLimit(false); }}
                />
                <button className="btn-primary btn-sm" onClick={handleEditLimit}>Save</button>
                <button className="btn-outline btn-sm" onClick={() => { setShowEditLimit(false); setNewSpendCap(''); }}>Cancel</button>
              </div>
            ) : (
              <div className="billing-meta-value">{formatCurrency(state.account?.spendCap)}</div>
            )}
          </div>
          {!showEditLimit && (
            <button className="link-btn" onClick={() => { setNewSpendCap(state.account?.spendCap || ''); setShowEditLimit(true); }}>Edit</button>
          )}
        </div>
      </div>

      <div className="billing-card">
        <div className="billing-card-title">Transaction history</div>
        <table className="data-table-basic">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Status</th>
              <th>Payment method</th>
            </tr>
          </thead>
          <tbody>
            {pageTxns.map(txn => (
              <tr key={txn.id}>
                <td style={{ color: 'var(--text-secondary)' }}>{new Date(txn.date).toLocaleDateString()}</td>
                <td>{txn.description}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(txn.amount)}</td>
                <td><TxnStatus status={txn.status} /></td>
                <td style={{ color: 'var(--text-secondary)' }}>{txn.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button className="btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {/* Add payment method modal */}
      {showAddPayment && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddPayment(false); }}>
          <div className="modal-container" style={{ width: 420 }}>
            <div className="modal-header">
              <div className="modal-tabs"><button className="modal-tab modal-tab--active">Add payment method</button></div>
              <button className="modal-close" onClick={() => setShowAddPayment(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: 20 }}>
              <div className="field-group">
                <label className="field-label">Cardholder name</label>
                <input className="field-input" value={newCardName} onChange={e => setNewCardName(e.target.value)} placeholder="e.g. Sarah Chen" autoFocus />
              </div>
              <div className="field-group">
                <label className="field-label">Last 4 digits</label>
                <input className="field-input" value={newCardLast4} onChange={e => setNewCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1234" maxLength={4} />
              </div>
              <div className="field-group">
                <label className="field-label">Expiration date (MM/YY)</label>
                <input className="field-input" value={newCardExpiry} onChange={e => setNewCardExpiry(e.target.value)} placeholder="12/27" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowAddPayment(false)}>Cancel</button>
              <div style={{ flex: 1 }} />
              <button className="btn-primary" onClick={handleAddPayment}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
