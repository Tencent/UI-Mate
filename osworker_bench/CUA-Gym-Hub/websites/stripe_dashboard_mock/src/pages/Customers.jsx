import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { generateId, formatCurrency } from '../utils/dataManager';
import { downloadCsv } from '../utils/exportFiles';

export default function Customers() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const outletContext = useOutletContext() || {};
  const addToast = outletContext.addToast || (() => {});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({ delinquent: 'all', paymentMethod: 'all' });
  const [form, setForm] = useState({ name: '', email: '', phone: '', description: '' });

  // Open create modal if ?create=1 is in URL
  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreateModal(true);
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const filtered = useMemo(() => {
    let list = [...state.customers];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    if (filters.delinquent !== 'all') {
      list = list.filter(c => String(c.delinquent) === filters.delinquent);
    }
    if (filters.paymentMethod === 'present') {
      list = list.filter(c => !!c.default_payment_method);
    } else if (filters.paymentMethod === 'missing') {
      list = list.filter(c => !c.default_payment_method);
    }
    list.sort((a, b) => b.created - a.created);
    return list;
  }, [state.customers, searchTerm, filters]);

  function formatTimestamp(ts) {
    return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function handleCreate() {
    if (!form.email) return;
    const newCust = {
      id: generateId('cus'),
      name: form.name || form.email,
      email: form.email,
      phone: form.phone || null,
      description: form.description || null,
      address: null,
      balance: 0,
      currency: 'usd',
      default_payment_method: null,
      metadata: {},
      created: Math.floor(Date.now() / 1000),
      livemode: true,
      delinquent: false,
      total_spent: 0,
      payments_count: 0,
    };
    dispatch({ type: 'ADD_CUSTOMER', payload: newCust });
    setShowCreateModal(false);
    setForm({ name: '', email: '', phone: '', description: '' });
    addToast('Customer created successfully.', 'success');
  }

  function handleExport() {
    downloadCsv('xtripe-customers.csv', filtered, [
      { label: 'Customer ID', value: c => c.id },
      { label: 'Name', value: c => c.name },
      { label: 'Email', value: c => c.email },
      { label: 'Phone', value: c => c.phone || '' },
      { label: 'Total spent', value: c => formatCurrency(c.total_spent, c.currency) },
      { label: 'Payments', value: c => c.payments_count },
      { label: 'Default payment method', value: c => c.default_payment_method || '' },
      { label: 'Delinquent', value: c => c.delinquent ? 'yes' : 'no' },
      { label: 'Created', value: c => formatTimestamp(c.created) },
    ]);
    addToast(`Exported ${filtered.length} customer${filtered.length !== 1 ? 's' : ''}.`, 'success');
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <div className="actions-row">
          <button className="btn-secondary" onClick={() => setShowFilterModal(true)}><Filter size={14} /> Filter</button>
          <button className="btn-secondary" onClick={handleExport}><Download size={14} /> Export</button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> Add customer
          </button>
        </div>
      </div>

      <div className="search-input-wrapper" style={{ maxWidth: 400 }}>
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Total spent</th>
              <th>Payments</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => navigate(`/customers/${c.id}`)}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td className="table-secondary">{c.email}</td>
                <td className="table-amount">${(c.total_spent / 100).toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>{c.payments_count}</td>
                <td className="table-secondary">{formatTimestamp(c.created)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showFilterModal && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Filter customers</div>
              <button className="modal-close" onClick={() => setShowFilterModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Delinquency</label>
                <select className="form-select" value={filters.delinquent} onChange={e => setFilters({ ...filters, delinquent: e.target.value })}>
                  <option value="all">All customers</option>
                  <option value="true">Delinquent only</option>
                  <option value="false">Not delinquent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Default payment method</label>
                <select className="form-select" value={filters.paymentMethod} onChange={e => setFilters({ ...filters, paymentMethod: e.target.value })}>
                  <option value="all">Any</option>
                  <option value="present">Has payment method</option>
                  <option value="missing">Missing payment method</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setFilters({ delinquent: 'all', paymentMethod: 'all' })}>Reset</button>
              <button className="btn-primary" onClick={() => setShowFilterModal(false)}>Apply filters</button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add customer</div>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Customer name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="customer@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate}>Add customer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
