import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { Plus, Filter, Download, Search } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { formatCurrency, generateId } from '../utils/dataManager';
import { downloadCsv } from '../utils/exportFiles';
import StatusBadge from '../components/StatusBadge';

const PAGE_SIZE = 20;

export default function Payments() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const outletContext = useOutletContext() || {};
  const addToast = outletContext.addToast || (() => {});
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({ minAmount: '', maxAmount: '', cardBrand: 'all' });
  const [form, setForm] = useState({ amount: '', customer: '', description: '' });
  const [formError, setFormError] = useState('');

  // Open create modal if ?create=1 is in URL
  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreate(true);
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'succeeded', label: 'Succeeded' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' },
    { key: 'refunded', label: 'Refunded' },
  ];

  const filtered = useMemo(() => {
    let list = [...state.payments];
    if (statusFilter !== 'all') {
      if (statusFilter === 'refunded') {
        list = list.filter(p => p.refunded || p.amount_refunded > 0);
      } else {
        list = list.filter(p => p.status === statusFilter);
      }
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.id.toLowerCase().includes(q) ||
        (p.customer_name && p.customer_name.toLowerCase().includes(q)) ||
        (p.customer_email && p.customer_email.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (advancedFilters.minAmount) {
      list = list.filter(p => p.amount >= Math.round(parseFloat(advancedFilters.minAmount) * 100));
    }
    if (advancedFilters.maxAmount) {
      list = list.filter(p => p.amount <= Math.round(parseFloat(advancedFilters.maxAmount) * 100));
    }
    if (advancedFilters.cardBrand !== 'all') {
      list = list.filter(p => p.payment_method?.card?.brand === advancedFilters.cardBrand);
    }
    list.sort((a, b) => b.created - a.created);
    return list;
  }, [state.payments, statusFilter, searchTerm, advancedFilters]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  function formatTimestamp(ts) {
    return new Date(ts * 1000).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  }

  function handleCreatePayment() {
    setFormError('');
    if (!form.amount || !form.customer) {
      setFormError('Amount and customer are required.');
      return;
    }
    const amountCents = Math.round(parseFloat(form.amount) * 100);
    if (amountCents <= 0) {
      setFormError('Amount must be greater than $0.00.');
      return;
    }
    const cust = state.customers.find(c => c.id === form.customer);
    const paymentId = generateId('py');
    dispatch({
      type: 'ADD_PAYMENT',
      payload: {
        id: paymentId,
        amount: amountCents,
        amount_refunded: 0,
        currency: 'usd',
        status: 'succeeded',
        description: form.description || null,
        customer: form.customer,
        customer_name: cust?.name || '',
        customer_email: cust?.email || '',
        payment_method: {
          type: 'card',
          card: { brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2026 }
        },
        receipt_email: cust?.email || null,
        refunded: false,
        disputed: false,
        risk_level: 'normal',
        risk_score: 12,
        metadata: {},
        created: Math.floor(Date.now() / 1000),
        livemode: !state.testMode,
      }
    });
    setShowCreate(false);
    setForm({ amount: '', customer: '', description: '' });
    setFormError('');
    addToast('Payment created successfully.', 'success');
  }

  function handleExport() {
    const statusLabel = statusFilter === 'all' ? 'all' : statusFilter;
    downloadCsv(`xtripe-${statusLabel}-payments.csv`, filtered, [
      { label: 'Payment ID', value: p => p.id },
      { label: 'Amount', value: p => formatCurrency(p.amount, p.currency) },
      { label: 'Status', value: p => p.refunded ? 'refunded' : p.status },
      { label: 'Description', value: p => p.description || '' },
      { label: 'Customer', value: p => p.customer_name || p.customer_email || p.customer },
      { label: 'Email', value: p => p.customer_email || '' },
      { label: 'Card brand', value: p => p.payment_method?.card?.brand || '' },
      { label: 'Card last4', value: p => p.payment_method?.card?.last4 || '' },
      { label: 'Refunded', value: p => formatCurrency(p.amount_refunded || 0, p.currency) },
      { label: 'Created', value: p => formatTimestamp(p.created) },
    ]);
    addToast(`Exported ${filtered.length} payment${filtered.length !== 1 ? 's' : ''}.`, 'success');
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
        <div className="actions-row">
          <button className="btn-secondary" onClick={() => setShowFilterModal(true)}><Filter size={14} /> Filter</button>
          <button className="btn-secondary" onClick={handleExport}><Download size={14} /> Export</button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Create payment
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`filter-tab ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => { setStatusFilter(tab.key); setPage(0); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Status</th>
              <th>Description</th>
              <th>Customer</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(p => (
              <tr key={p.id} onClick={() => navigate(`/payments/${p.id}`)}>
                <td className="table-amount">{formatCurrency(p.amount, p.currency)}</td>
                <td>
                  <StatusBadge status={p.refunded ? 'refunded' : p.status} />
                </td>
                <td style={{ color: p.description ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                  {p.description || '--'}
                </td>
                <td>
                  <Link to={`/customers/${p.customer}`} className="table-link" onClick={(e) => e.stopPropagation()}>
                    {p.customer_name || p.customer_email || p.customer}
                  </Link>
                </td>
                <td className="table-secondary">{formatTimestamp(p.created)}</td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length > PAGE_SIZE && (
          <div className="table-pagination">
            <span>Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="table-pagination-btns">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {showFilterModal && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Filter payments</div>
              <button className="modal-close" onClick={() => setShowFilterModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Minimum amount ($)</label>
                <input className="form-input" type="number" min="0" step="0.01" value={advancedFilters.minAmount} onChange={e => { setAdvancedFilters({ ...advancedFilters, minAmount: e.target.value }); setPage(0); }} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum amount ($)</label>
                <input className="form-input" type="number" min="0" step="0.01" value={advancedFilters.maxAmount} onChange={e => { setAdvancedFilters({ ...advancedFilters, maxAmount: e.target.value }); setPage(0); }} placeholder="100.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Card brand</label>
                <select className="form-select" value={advancedFilters.cardBrand} onChange={e => { setAdvancedFilters({ ...advancedFilters, cardBrand: e.target.value }); setPage(0); }}>
                  <option value="all">All brands</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                  <option value="discover">Discover</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setAdvancedFilters({ minAmount: '', maxAmount: '', cardBrand: 'all' }); setPage(0); }}>Reset</button>
              <button className="btn-primary" onClick={() => setShowFilterModal(false)}>Apply filters</button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => { setShowCreate(false); setFormError(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create payment</div>
              <button className="modal-close" onClick={() => { setShowCreate(false); setFormError(''); }}>&times;</button>
            </div>
            <div className="modal-body">
              {formError && (
                <div style={{ background: '#FEF3F2', color: 'var(--color-danger)', fontSize: 13, padding: '8px 12px', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                  {formError}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Amount ($) *</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select
                  className="form-select"
                  value={form.customer}
                  onChange={e => setForm({ ...form, customer: e.target.value })}
                >
                  <option value="">Select customer...</option>
                  {state.customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Payment for..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowCreate(false); setFormError(''); }}>Cancel</button>
              <button className="btn-primary" onClick={handleCreatePayment}>Create payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
