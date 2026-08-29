import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { formatCurrency, generateId } from '../utils/dataManager';
import StatusBadge from '../components/StatusBadge';

export default function Invoices() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const outletContext = useOutletContext() || {};
  const addToast = outletContext.addToast || (() => {});
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ customer: '', amount: '', description: '' });
  const [formError, setFormError] = useState('');

  // Open create modal if ?create=1 is in URL
  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreate(true);
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const tabs = ['all', 'draft', 'open', 'paid', 'uncollectible', 'void'];

  const filtered = state.invoices
    .filter(i => filter === 'all' || i.status === filter)
    .sort((a, b) => b.created - a.created);

  function formatTs(ts) {
    return ts ? new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--';
  }

  function handleCreate() {
    setFormError('');
    if (!form.customer || !form.amount) {
      setFormError('Customer and amount are required.');
      return;
    }
    const amountCents = Math.round(parseFloat(form.amount) * 100);
    if (amountCents <= 0) {
      setFormError('Amount must be greater than $0.00.');
      return;
    }
    const cust = state.customers.find(c => c.id === form.customer);
    dispatch({
      type: 'ADD_INVOICE',
      payload: {
        id: generateId('in'),
        number: `INV-${String(state.invoices.length + 1).padStart(4, '0')}`,
        customer: form.customer,
        customer_name: cust?.name || '',
        customer_email: cust?.email || '',
        status: 'draft',
        amount_due: amountCents,
        amount_paid: 0,
        amount_remaining: amountCents,
        currency: 'usd',
        description: form.description || null,
        due_date: null,
        collection_method: 'send_invoice',
        billing_reason: 'manual',
        subscription: null,
        lines: [{ id: generateId('il'), description: form.description || 'Manual charge', amount: amountCents, currency: 'usd', quantity: 1 }],
        subtotal: amountCents,
        tax: 0,
        total: amountCents,
        period_start: Math.floor(Date.now() / 1000),
        period_end: Math.floor(Date.now() / 1000),
        created: Math.floor(Date.now() / 1000),
        paid_at: null,
        metadata: {},
      }
    });
    setShowCreate(false);
    setForm({ customer: '', amount: '', description: '' });
    setFormError('');
    addToast('Invoice created successfully.', 'success');
  }

  function handleFinalize(id) {
    dispatch({ type: 'UPDATE_INVOICE', payload: { id, updates: { status: 'open', due_date: Math.floor(Date.now() / 1000) + 2592000 }, eventType: 'finalized' } });
  }

  function handleMarkPaid(id) {
    const inv = state.invoices.find(i => i.id === id);
    dispatch({ type: 'UPDATE_INVOICE', payload: { id, updates: { status: 'paid', amount_paid: inv.amount_due, amount_remaining: 0, paid_at: Math.floor(Date.now() / 1000) }, eventType: 'paid' } });
  }

  function handleVoid(id) {
    dispatch({ type: 'UPDATE_INVOICE', payload: { id, updates: { status: 'void' }, eventType: 'voided' } });
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Create invoice
        </button>
      </div>

      <div className="filter-tabs">
        {tabs.map(tab => (
          <button key={tab} className={`filter-tab ${filter === tab ? 'active' : ''}`} onClick={() => setFilter(tab)}>
            {tab === 'all' ? 'All' : tab.replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due date</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} onClick={() => navigate(`/invoices/${inv.id}`)}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{inv.number || inv.id}</td>
                <td>
                  <Link to={`/customers/${inv.customer}`} className="table-link" onClick={e => e.stopPropagation()}>
                    {inv.customer_name || inv.customer_email}
                  </Link>
                </td>
                <td className="table-amount">{formatCurrency(inv.amount_due, inv.currency)}</td>
                <td><StatusBadge status={inv.status} /></td>
                <td className="table-secondary">{formatTs(inv.due_date)}</td>
                <td className="table-secondary">{formatTs(inv.created)}</td>
                <td>
                  <div className="actions-row" style={{ justifyContent: 'flex-end' }}>
                    {inv.status === 'draft' && (
                      <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 8px' }} onClick={(e) => { e.stopPropagation(); handleFinalize(inv.id); }}>
                        Finalize
                      </button>
                    )}
                    {inv.status === 'open' && (
                      <>
                        <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 8px' }} onClick={(e) => { e.stopPropagation(); handleMarkPaid(inv.id); }}>
                          Mark paid
                        </button>
                        <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 8px', color: 'var(--color-danger)' }} onClick={(e) => { e.stopPropagation(); handleVoid(inv.id); }}>
                          Void
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => { setShowCreate(false); setFormError(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create invoice</div>
              <button className="modal-close" onClick={() => { setShowCreate(false); setFormError(''); }}>&times;</button>
            </div>
            <div className="modal-body">
              {formError && (
                <div style={{ background: '#FEF3F2', color: 'var(--color-danger)', fontSize: 13, padding: '8px 12px', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                  {formError}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select className="form-select" value={form.customer} onChange={e => setForm({...form, customer: e.target.value})}>
                  <option value="">Select customer...</option>
                  {state.customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount ($) *</label>
                <input className="form-input" type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Invoice description" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowCreate(false); setFormError(''); }}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
