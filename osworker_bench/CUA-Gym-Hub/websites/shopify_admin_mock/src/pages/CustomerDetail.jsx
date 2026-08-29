
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, Mail, MapPin, Phone, Trash2, Edit, X } from 'lucide-react';
import { format } from 'date-fns';

function getFinancialLabel(status) {
  const map = { paid: 'Paid', pending: 'Pending', partially_paid: 'Partially paid', refunded: 'Refunded', partially_refunded: 'Partially refunded', voided: 'Voided', authorized: 'Authorized' };
  return map[status] || status;
}
function getFinancialBadge(status) {
  return { paid: 'badge-success', pending: 'badge-warning', refunded: 'badge-error' }[status] || 'badge-info';
}
function getFulfillmentLabel(status) {
  if (!status) return 'Unfulfilled';
  return { fulfilled: 'Fulfilled', partial: 'Partial', restocked: 'Restocked' }[status] || status;
}
function getFulfillmentBadge(status) {
  if (!status) return 'badge-error';
  return { fulfilled: 'badge-success', partial: 'badge-warning' }[status] || 'badge-info';
}

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, updateState, updateCustomer, deleteCustomer } = useStore();

  const customer = state.customers.find(c => c.id === id);
  const customerOrders = state.orders.filter(o =>
    o.customer?.id === id || o.customer?.email === customer?.email
  );

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailDraftCreated, setEmailDraftCreated] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    note: customer?.note || '',
    tags: (customer?.tags || []).join(', '),
    acceptsMarketing: customer?.acceptsMarketing || false,
  });
  const [editErrors, setEditErrors] = useState({});

  if (!customer) {
    return <div className="p-8 text-center text-[#616161]">Customer not found</div>;
  }

  const getLocation = () => {
    const addr = customer.defaultAddress;
    if (!addr) return '';
    return [addr.city, addr.province, addr.country].filter(Boolean).join(', ');
  };

  const handleCreateEmailDraft = () => {
    const draft = {
      id: `email_${Date.now()}`,
      to: customer.email,
      subject: `Follow up with ${customer.firstName} ${customer.lastName}`,
      body: `Hi ${customer.firstName},\n\n`,
      relatedToType: 'customer',
      relatedToId: customer.id,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    updateState('emailDrafts', [draft, ...(state.emailDrafts || [])]);
    setEmailDraftCreated(true);
    setTimeout(() => setEmailDraftCreated(false), 3000);
  };

  const handleDelete = () => {
    deleteCustomer(id);
    navigate('/customers');
  };

  const validateEdit = () => {
    const e = {};
    if (!editForm.firstName.trim()) e.firstName = 'First name is required';
    if (!editForm.email.trim()) e.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) e.email = 'Valid email required';
    return e;
  };

  const handleEdit = (e) => {
    e.preventDefault();
    const errors = validateEdit();
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    const tags = editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    updateCustomer(id, {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      phone: editForm.phone,
      note: editForm.note,
      tags,
      acceptsMarketing: editForm.acceptsMarketing,
    });
    setShowEditModal(false);
    setEditErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/customers')} className="p-1.5 hover:bg-[#e3e3e3] rounded-lg">
            <ArrowLeft size={20} className="text-[#616161]" />
          </button>
          <h1 className="page-title">{customer.firstName} {customer.lastName}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEditModal(true)} className="btn-secondary text-[13px]">
            <Edit size={16} /> Edit
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="btn-danger text-[13px]">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order history */}
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#e3e3e3', background: '#f9fafb' }}>
              <h3 className="card-title">Order history</h3>
              <span className="text-[13px] text-[#616161]">{customer.ordersCount} orders</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Fulfillment</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {customerOrders.length === 0 ? (
                  <tr><td colSpan="5" className="text-center text-[#616161] py-8">No orders found</td></tr>
                ) : (
                  customerOrders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/orders/${order.id}`} className="font-semibold text-[#005bd3] hover:underline">{order.name}</Link>
                      </td>
                      <td className="text-[#616161]">{format(new Date(order.createdAt), 'MMM d, yyyy')}</td>
                      <td><span className={`badge ${getFinancialBadge(order.financialStatus)}`}>{getFinancialLabel(order.financialStatus)}</span></td>
                      <td><span className={`badge ${getFulfillmentBadge(order.fulfillmentStatus)}`}>{getFulfillmentLabel(order.fulfillmentStatus)}</span></td>
                      <td className="text-right font-medium">${parseFloat(order.totalPrice).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Overview */}
          <div className="card space-y-3">
            <h3 className="card-title">Customer</h3>
            <div className="text-[13px] space-y-2">
              {emailDraftCreated && (
                <div className="p-2 rounded-lg text-[12px] font-medium" style={{ background: '#aee9d1', color: '#047b5d' }}>
                  Email draft created
                </div>
              )}
              <div className="flex items-center gap-2 text-[#616161]">
                <Mail size={14} className="text-[#616161]" />
                <button onClick={handleCreateEmailDraft} className="text-[#005bd3] hover:underline">{customer.email}</button>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-[#616161]">
                  <Phone size={14} className="text-[#616161]" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {getLocation() && (
                <div className="flex items-center gap-2 text-[#616161]">
                  <MapPin size={14} className="text-[#616161]" />
                  <span>{getLocation()}</span>
                </div>
              )}
            </div>
            <div className="pt-3 border-t space-y-2 text-[13px]" style={{ borderColor: '#e3e3e3' }}>
              <div className="flex justify-between"><span className="text-[#616161]">Total spent</span><span className="font-medium">${parseFloat(customer.totalSpent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between"><span className="text-[#616161]">Orders</span><span className="font-medium">{customer.ordersCount}</span></div>
              <div className="flex justify-between"><span className="text-[#616161]">Email verified</span><span>{customer.verifiedEmail ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-[#616161]">Marketing</span><span>{customer.acceptsMarketing ? <span className="badge badge-success">Subscribed</span> : <span className="badge badge-info">Not subscribed</span>}</span></div>
            </div>
          </div>

          {/* Default address */}
          <div className="card">
            <h3 className="card-title mb-2">Default address</h3>
            {customer.defaultAddress ? (
              <div className="text-[13px] text-[#616161] space-y-0.5">
                <p>{customer.firstName} {customer.lastName}</p>
                {customer.defaultAddress.address1 && <p>{customer.defaultAddress.address1}</p>}
                {customer.defaultAddress.address2 && <p>{customer.defaultAddress.address2}</p>}
                <p>{[customer.defaultAddress.city, customer.defaultAddress.province, customer.defaultAddress.zip].filter(Boolean).join(', ')}</p>
                <p>{customer.defaultAddress.country}</p>
                {customer.defaultAddress.phone && <p>{customer.defaultAddress.phone}</p>}
              </div>
            ) : (
              <p className="text-[13px] text-[#616161]">No default address</p>
            )}
          </div>

          {/* Tags */}
          <div className="card">
            <h3 className="card-title mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {(customer.tags || []).map((tag, i) => (
                <span key={i} className="badge badge-info">{tag}</span>
              ))}
              {(!customer.tags || customer.tags.length === 0) && <span className="text-[13px] text-[#616161]">No tags</span>}
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <h3 className="card-title mb-2">Notes</h3>
            <p className="text-[13px] text-[#616161]">{customer.note || 'No notes'}</p>
          </div>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-modal">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#e3e3e3' }}>
              <h3 className="text-[16px] font-bold text-[#303030]">Edit customer</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-[#f1f1f1] rounded">
                <X size={20} className="text-[#616161]" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">First name</label>
                  <input
                    type="text"
                    className={`w-full text-[13px] ${editErrors.firstName ? 'border-[#d72c0d]' : ''}`}
                    value={editForm.firstName}
                    onChange={e => { setEditForm(f => ({ ...f, firstName: e.target.value })); setEditErrors(v => ({ ...v, firstName: '' })); }}
                  />
                  {editErrors.firstName && <p className="text-[12px] text-[#d72c0d] mt-1">{editErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">Last name</label>
                  <input
                    type="text"
                    className="w-full text-[13px]"
                    value={editForm.lastName}
                    onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Email</label>
                <input
                  type="email"
                  className={`w-full text-[13px] ${editErrors.email ? 'border-[#d72c0d]' : ''}`}
                  value={editForm.email}
                  onChange={e => { setEditForm(f => ({ ...f, email: e.target.value })); setEditErrors(v => ({ ...v, email: '' })); }}
                />
                {editErrors.email && <p className="text-[12px] text-[#d72c0d] mt-1">{editErrors.email}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full text-[13px]"
                  value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Tags</label>
                <input
                  type="text"
                  className="w-full text-[13px]"
                  placeholder="vip, wholesale, etc."
                  value={editForm.tags}
                  onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
                />
                <p className="text-[12px] text-[#616161] mt-1">Separate with commas</p>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Note</label>
                <textarea
                  className="w-full text-[13px]"
                  rows={2}
                  value={editForm.note}
                  onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="accepts-marketing"
                  checked={editForm.acceptsMarketing}
                  onChange={e => setEditForm(f => ({ ...f, acceptsMarketing: e.target.checked }))}
                  className="w-4 h-4"
                  style={{ accentColor: '#008060' }}
                />
                <label htmlFor="accepts-marketing" className="text-[13px] text-[#303030]">Customer accepts marketing</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary text-[13px]">Cancel</button>
                <button type="submit" className="btn-primary text-[13px]">Save customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-xl shadow-modal w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#e3e3e3' }}>
              <h2 className="text-[16px] font-semibold text-[#303030]">Delete customer</h2>
              <button onClick={() => setShowDeleteModal(false)}><X size={18} /></button>
            </div>
            <div className="p-4 text-[13px] text-[#303030]">
              Delete {customer.firstName} {customer.lastName}? Their order history remains, but the customer record will move out of the customer list.
            </div>
            <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: '#e3e3e3' }}>
              <button className="btn-secondary text-[13px]" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger text-[13px]" onClick={handleDelete}>Delete customer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
