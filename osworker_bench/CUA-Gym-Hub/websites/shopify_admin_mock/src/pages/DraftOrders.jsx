
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmDialog from '../components/ConfirmDialog';

function getStatusBadge(status) {
  return { open: 'badge-warning', invoice_sent: 'badge-info', completed: 'badge-success' }[status] || 'badge-info';
}

export default function DraftOrders() {
  const { state, addDraftOrder, updateDraftOrder, deleteDraftOrder } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    lineItems: [{ title: '', quantity: 1, price: '' }],
    note: '',
    tags: '',
  });

  const draftOrders = state.draftOrders || [];

  const filtered = useMemo(() => {
    let result = [...draftOrders];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        `${d.customer?.firstName} ${d.customer?.lastName}`.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [draftOrders, searchQuery]);

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Customer name is required';
    if (form.lineItems.some(li => !li.title.trim())) e.lineItems = 'All items need a title';
    if (form.lineItems.some(li => !li.price || isNaN(parseFloat(li.price)))) e.lineItemsPrice = 'All items need a valid price';
    return e;
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const nameParts = form.customerName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    const subtotal = form.lineItems.reduce((s, li) => s + parseFloat(li.price) * (li.quantity || 1), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    const custId = `cust_draft_${Date.now()}`;
    addDraftOrder({
      lineItems: form.lineItems.map((li, i) => ({
        id: `li_d_${Date.now()}_${i}`,
        title: li.title,
        quantity: li.quantity || 1,
        price: parseFloat(li.price).toFixed(2),
      })),
      customer: form.customerName ? { id: custId, firstName, lastName, email: form.customerEmail } : null,
      subtotalPrice: subtotal.toFixed(2),
      totalTax: tax.toFixed(2),
      totalPrice: total.toFixed(2),
      note: form.note,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      status: 'open',
    });
    setShowCreateModal(false);
    setForm({ customerName: '', customerEmail: '', lineItems: [{ title: '', quantity: 1, price: '' }], note: '', tags: '' });
    setErrors({});
  };

  const handleDelete = (id) => {
    deleteDraftOrder(id);
    setDeleteTarget(null);
  };

  const handleMarkComplete = (draft) => {
    updateDraftOrder(draft.id, { status: 'completed' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Draft orders</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary text-[13px]">
          <Plus size={16} /> Create draft order
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-3 border-b" style={{ borderColor: '#e3e3e3' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={16} />
            <input
              type="text"
              placeholder="Search draft orders"
              className="w-full pl-9 py-[7px] text-[13px]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Draft order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th style={{ width: 120 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-[#616161] py-12">No draft orders found</td></tr>
            ) : (
              filtered.map(draft => (
                <tr key={draft.id}>
                  <td className="font-semibold text-[#303030]">{draft.name}</td>
                  <td className="text-[#616161]">{format(new Date(draft.createdAt), 'MMM d, yyyy')}</td>
                  <td className="text-[#303030]">
                    {draft.customer ? `${draft.customer.firstName} ${draft.customer.lastName}` : <span className="text-[#616161]">No customer</span>}
                  </td>
                  <td className="font-medium text-[#303030]">
                    ${parseFloat(draft.totalPrice || 0).toFixed(2)}
                  </td>
                  <td><span className={`badge ${getStatusBadge(draft.status)}`}>{draft.status || 'open'}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      {draft.status === 'open' && (
                        <button
                          onClick={() => handleMarkComplete(draft)}
                          className="text-[12px] px-2 py-0.5 rounded-md font-medium text-[#047b5d] hover:bg-[#aee9d1]"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(draft)}
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

      {/* Create Draft Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-modal">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#e3e3e3' }}>
              <h3 className="text-[16px] font-bold text-[#303030]">Create draft order</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-[#f1f1f1] rounded">
                <X size={20} className="text-[#616161]" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">Customer name</label>
                  <input
                    type="text"
                    className={`w-full text-[13px] ${errors.customerName ? 'border-[#d72c0d]' : ''}`}
                    placeholder="Jane Smith"
                    value={form.customerName}
                    onChange={e => { setForm(f => ({ ...f, customerName: e.target.value })); setErrors(v => ({ ...v, customerName: '' })); }}
                  />
                  {errors.customerName && <p className="text-[12px] text-[#d72c0d] mt-1">{errors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">Customer email <span className="text-[#616161] font-normal">(optional)</span></label>
                  <input
                    type="email"
                    className="w-full text-[13px]"
                    placeholder="jane@example.com"
                    value={form.customerEmail}
                    onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[13px] font-medium text-[#303030]">Line items</label>
                  <button
                    type="button"
                    className="btn-plain text-[12px] py-0.5"
                    onClick={() => setForm(f => ({ ...f, lineItems: [...f.lineItems, { title: '', quantity: 1, price: '' }] }))}
                  >
                    + Add item
                  </button>
                </div>
                {errors.lineItems && <p className="text-[12px] text-[#d72c0d] mb-2">{errors.lineItems}</p>}
                {errors.lineItemsPrice && <p className="text-[12px] text-[#d72c0d] mb-2">{errors.lineItemsPrice}</p>}
                <div className="space-y-2">
                  {form.lineItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <input
                        type="text"
                        className="flex-1 text-[13px]"
                        placeholder="Product name"
                        value={item.title}
                        onChange={e => {
                          const items = [...form.lineItems];
                          items[idx] = { ...items[idx], title: e.target.value };
                          setForm(f => ({ ...f, lineItems: items }));
                          setErrors(v => ({ ...v, lineItems: '' }));
                        }}
                      />
                      <input
                        type="number"
                        min="1"
                        className="w-16 text-[13px]"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={e => {
                          const items = [...form.lineItems];
                          items[idx] = { ...items[idx], quantity: parseInt(e.target.value) || 1 };
                          setForm(f => ({ ...f, lineItems: items }));
                        }}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-24 text-[13px]"
                        placeholder="Price"
                        value={item.price}
                        onChange={e => {
                          const items = [...form.lineItems];
                          items[idx] = { ...items[idx], price: e.target.value };
                          setForm(f => ({ ...f, lineItems: items }));
                          setErrors(v => ({ ...v, lineItemsPrice: '' }));
                        }}
                      />
                      {form.lineItems.length > 1 && (
                        <button
                          type="button"
                          className="p-1 hover:bg-[#ffd2d2] text-[#d72c0d] rounded mt-1"
                          onClick={() => setForm(f => ({ ...f, lineItems: f.lineItems.filter((_, i) => i !== idx) }))}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Note</label>
                <textarea
                  className="w-full text-[13px]"
                  rows={2}
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Internal note..."
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Tags <span className="text-[#616161] font-normal">(optional)</span></label>
                <input
                  type="text"
                  className="w-full text-[13px]"
                  placeholder="tag1, tag2"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary text-[13px]">Cancel</button>
                <button type="submit" className="btn-primary text-[13px]">Create draft order</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete draft order"
          message={`Delete ${deleteTarget.name || 'this draft order'}? This cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}
    </div>
  );
}
