
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmDialog from '../components/ConfirmDialog';

function getStatusBadge(status) {
  return { active: 'badge-success', scheduled: 'badge-warning', expired: 'badge-info' }[status] || 'badge-info';
}

function getTypeLabel(type) {
  return { percentage: 'Percentage', fixed_amount: 'Fixed amount', free_shipping: 'Free shipping', buy_x_get_y: 'Buy X get Y' }[type] || type;
}

export default function Discounts() {
  const { state, addDiscount, updateDiscount, deleteDiscount } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '',
    code: '',
    type: 'percentage',
    value: '',
    status: 'active',
    appliesTo: 'all',
    minimumRequirement: 'none',
    minimumValue: '',
    usageLimit: '',
    oncePerCustomer: false,
    startsAt: new Date().toISOString().slice(0, 10),
    endsAt: '',
  });

  const discounts = state.discounts || [];

  const tabs = [
    { label: 'All', filter: () => true },
    { label: 'Active', filter: d => d.status === 'active' },
    { label: 'Scheduled', filter: d => d.status === 'scheduled' },
    { label: 'Expired', filter: d => d.status === 'expired' },
  ];

  const filtered = useMemo(() => {
    let result = discounts.filter(tabs[activeTab].filter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.title?.toLowerCase().includes(q) ||
        d.code?.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [discounts, activeTab, searchQuery]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.value || isNaN(parseFloat(form.value)) || parseFloat(form.value) <= 0) e.value = 'Valid discount value required';
    if (form.type === 'percentage' && parseFloat(form.value) > 100) e.value = 'Percentage cannot exceed 100';
    return e;
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    addDiscount({
      title: form.title,
      code: form.code || null,
      type: form.type,
      value: form.value,
      status: form.status,
      appliesTo: form.appliesTo,
      appliesToIds: [],
      minimumRequirement: form.minimumRequirement,
      minimumValue: form.minimumValue,
      customerEligibility: 'all',
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
      usageCount: 0,
      oncePerCustomer: form.oncePerCustomer,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : new Date().toISOString(),
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      createdAt: new Date().toISOString(),
    });
    setShowCreateModal(false);
    setForm({
      title: '', code: '', type: 'percentage', value: '', status: 'active',
      appliesTo: 'all', minimumRequirement: 'none', minimumValue: '',
      usageLimit: '', oncePerCustomer: false,
      startsAt: new Date().toISOString().slice(0, 10), endsAt: '',
    });
    setErrors({});
  };

  const handleDelete = (id) => {
    deleteDiscount(id);
    setDeleteTarget(null);
  };

  const handleToggleStatus = (discount) => {
    const newStatus = discount.status === 'active' ? 'expired' : 'active';
    updateDiscount(discount.id, { status: newStatus });
  };

  const formatValue = (discount) => {
    if (discount.type === 'percentage') return `${discount.value}%`;
    if (discount.type === 'fixed_amount') return `$${parseFloat(discount.value).toFixed(2)}`;
    if (discount.type === 'free_shipping') return 'Free shipping';
    return discount.value;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Discounts</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary text-[13px]">
          <Plus size={16} /> Create discount
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-3 border-b" style={{ borderColor: '#e3e3e3' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={16} />
            <input
              type="text"
              placeholder="Search discounts"
              className="w-full pl-9 py-[7px] text-[13px]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: '#e3e3e3' }}>
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                activeTab === i ? 'border-[#303030] text-[#303030]' : 'border-transparent text-[#616161] hover:text-[#303030]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Title / Code</th>
              <th>Status</th>
              <th>Type</th>
              <th>Value</th>
              <th>Usage</th>
              <th>Starts</th>
              <th>Ends</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" className="text-center text-[#616161] py-12">No discounts found</td></tr>
            ) : (
              filtered.map(discount => (
                <tr key={discount.id}>
                  <td>
                    <div className="font-medium text-[#303030]">{discount.title}</div>
                    {discount.code && <div className="text-[12px] font-mono text-[#616161]">{discount.code}</div>}
                  </td>
                  <td><span className={`badge ${getStatusBadge(discount.status)}`}>{discount.status}</span></td>
                  <td className="text-[#616161]">{getTypeLabel(discount.type)}</td>
                  <td className="font-medium text-[#303030]">{formatValue(discount)}</td>
                  <td className="text-[#616161]">
                    {discount.usageCount || 0}
                    {discount.usageLimit ? ` / ${discount.usageLimit}` : ''}
                  </td>
                  <td className="text-[#616161]">{discount.startsAt ? format(new Date(discount.startsAt), 'MMM d, yyyy') : '-'}</td>
                  <td className="text-[#616161]">{discount.endsAt ? format(new Date(discount.endsAt), 'MMM d, yyyy') : 'No end date'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(discount)}
                        className={`text-[12px] px-2 py-0.5 rounded-md font-medium ${discount.status === 'active' ? 'text-[#d72c0d] hover:bg-[#ffd2d2]' : 'text-[#047b5d] hover:bg-[#aee9d1]'}`}
                      >
                        {discount.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(discount)}
                        className="p-1.5 hover:bg-[#ffd2d2] text-[#d72c0d] rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Discount Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-modal">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#e3e3e3' }}>
              <h3 className="text-[16px] font-bold text-[#303030]">Create discount</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-[#f1f1f1] rounded">
                <X size={20} className="text-[#616161]" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Discount name</label>
                <input
                  type="text"
                  className={`w-full text-[13px] ${errors.title ? 'border-[#d72c0d]' : ''}`}
                  placeholder="e.g. Summer sale"
                  value={form.title}
                  onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(v => ({ ...v, title: '' })); }}
                />
                {errors.title && <p className="text-[12px] text-[#d72c0d] mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Discount code <span className="text-[#616161] font-normal">(optional — leave blank for automatic)</span></label>
                <input
                  type="text"
                  className="w-full text-[13px] font-mono uppercase"
                  placeholder="e.g. SUMMER20"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">Discount type</label>
                  <select
                    className="w-full text-[13px]"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed amount</option>
                    <option value="free_shipping">Free shipping</option>
                    <option value="buy_x_get_y">Buy X get Y</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">
                    Value {form.type === 'percentage' ? '(%)' : form.type === 'fixed_amount' ? '($)' : ''}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`w-full text-[13px] ${errors.value ? 'border-[#d72c0d]' : ''}`}
                    placeholder={form.type === 'percentage' ? '10' : '5.00'}
                    value={form.value}
                    onChange={e => { setForm(f => ({ ...f, value: e.target.value })); setErrors(v => ({ ...v, value: '' })); }}
                    disabled={form.type === 'free_shipping'}
                  />
                  {errors.value && <p className="text-[12px] text-[#d72c0d] mt-1">{errors.value}</p>}
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Status</label>
                <select
                  className="w-full text-[13px]"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">Start date</label>
                  <input type="date" className="w-full text-[13px]" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">End date <span className="text-[#616161] font-normal">(optional)</span></label>
                  <input type="date" className="w-full text-[13px]" value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Usage limit <span className="text-[#616161] font-normal">(optional)</span></label>
                <input
                  type="number"
                  min="1"
                  className="w-full text-[13px]"
                  placeholder="Unlimited"
                  value={form.usageLimit}
                  onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="once-per-customer"
                  checked={form.oncePerCustomer}
                  onChange={e => setForm(f => ({ ...f, oncePerCustomer: e.target.checked }))}
                  className="w-4 h-4"
                  style={{ accentColor: '#008060' }}
                />
                <label htmlFor="once-per-customer" className="text-[13px] text-[#303030]">Limit to one use per customer</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary text-[13px]">Cancel</button>
                <button type="submit" className="btn-primary text-[13px]">Create discount</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete discount"
          message={`Delete ${deleteTarget.code || deleteTarget.title || 'this discount'}? This cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}
    </div>
  );
}
