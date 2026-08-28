
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Truck, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';

const tabs = [
  { label: 'All', filter: () => true },
  { label: 'Unfulfilled', filter: (o) => !o.fulfillmentStatus },
  { label: 'Unpaid', filter: (o) => o.financialStatus !== 'paid' },
  { label: 'Open', filter: (o) => !o.closedAt && !o.cancelledAt },
  { label: 'Closed', filter: (o) => !!o.closedAt || !!o.cancelledAt },
];

function getFinancialBadge(status) {
  const map = {
    paid: 'badge-success',
    pending: 'badge-warning',
    partially_paid: 'badge-warning',
    refunded: 'badge-error',
    partially_refunded: 'badge-warning',
    voided: 'badge-info',
    authorized: 'badge-warning',
  };
  return map[status] || 'badge-info';
}

function getFinancialLabel(status) {
  const map = {
    paid: 'Paid',
    pending: 'Pending',
    partially_paid: 'Partially paid',
    refunded: 'Refunded',
    partially_refunded: 'Partially refunded',
    voided: 'Voided',
    authorized: 'Authorized',
  };
  return map[status] || status;
}

function getFulfillmentBadge(status) {
  if (!status) return 'badge-error';
  const map = {
    fulfilled: 'badge-success',
    partial: 'badge-warning',
    restocked: 'badge-info',
  };
  return map[status] || 'badge-info';
}

function getFulfillmentLabel(status) {
  if (!status) return 'Unfulfilled';
  const map = {
    fulfilled: 'Fulfilled',
    partial: 'Partial',
    restocked: 'Restocked',
  };
  return map[status] || status;
}

function formatOrderDate(dateStr) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = (now - d) / (1000 * 60 * 60);
    if (diffHours < 24) {
      return formatDistanceToNow(d, { addSuffix: true });
    }
    return format(d, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export default function Orders() {
  const { state, updateOrder, addOrder } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerEmail: '',
    lineItems: [{ title: '', quantity: 1, price: '' }],
    financialStatus: 'pending',
    note: '',
  });

  const filteredOrders = useMemo(() => {
    let result = state.orders || [];

    // Tab filter
    result = result.filter(tabs[activeTab].filter);

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.name.toLowerCase().includes(q) ||
        (o.customer && `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q)) ||
        o.email?.toLowerCase().includes(q)
      );
    }

    // Sort by date descending
    result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [state.orders, activeTab, searchQuery]);

  const validateCreate = () => {
    const e = {};
    if (!newOrder.customerName.trim()) e.customerName = 'Customer name is required';
    if (!newOrder.customerEmail.trim()) e.customerEmail = 'Customer email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newOrder.customerEmail)) e.customerEmail = 'Valid email required';
    if (newOrder.lineItems.some(li => !li.title.trim())) e.lineItems = 'All items need a title';
    if (newOrder.lineItems.some(li => !li.price || isNaN(parseFloat(li.price)) || parseFloat(li.price) < 0)) e.lineItemsPrice = 'All items need a valid price';
    return e;
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const validationErrors = validateCreate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const nameParts = newOrder.customerName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const subtotal = newOrder.lineItems.reduce((s, li) => s + (parseFloat(li.price) * (li.quantity || 1)), 0);
    const tax = subtotal * 0.08;
    const shipping = 5.99;
    const total = subtotal + tax + shipping;
    const custId = `cust_tmp_${Date.now()}`;
    addOrder({
      email: newOrder.customerEmail,
      financialStatus: newOrder.financialStatus,
      fulfillmentStatus: null,
      subtotalPrice: subtotal.toFixed(2),
      totalShippingPrice: shipping.toFixed(2),
      totalTax: tax.toFixed(2),
      totalPrice: total.toFixed(2),
      lineItems: newOrder.lineItems.map((li, i) => ({
        id: `li_new_${Date.now()}_${i}`,
        title: li.title,
        quantity: li.quantity || 1,
        price: parseFloat(li.price).toFixed(2),
        variantTitle: '',
        sku: '',
      })),
      customer: { id: custId, firstName, lastName, email: newOrder.customerEmail },
      shippingAddress: {},
      billingAddress: {},
      note: newOrder.note,
    });
    setShowCreateModal(false);
    setNewOrder({
      customerName: '', customerEmail: '',
      lineItems: [{ title: '', quantity: 1, price: '' }],
      financialStatus: 'pending', note: '',
    });
    setErrors({});
  };

  const handleFulfill = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const order = state.orders.find(o => o.id === id);
    if (order) {
      const newTimeline = [
        ...(order.timeline || []),
        {
          id: `evt_${Date.now()}`,
          type: 'fulfilled',
          message: `${order.name} was fulfilled`,
          createdAt: new Date().toISOString(),
          user: 'Alex Chen'
        }
      ];
      updateOrder(id, {
        fulfillmentStatus: 'fulfilled',
        timeline: newTimeline,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredOrders.map(o => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Orders</h1>
        <button className="btn-primary text-[13px]" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Create order
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b" style={{ borderColor: '#e3e3e3' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={16} />
            <input
              type="text"
              placeholder="Search orders"
              className="w-full pl-9 py-[7px] text-[13px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto" style={{ borderColor: '#e3e3e3' }}>
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => { setActiveTab(i); setSelectedIds([]); }}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === i
                  ? 'border-[#303030] text-[#303030]'
                  : 'border-transparent text-[#616161] hover:text-[#303030]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40, paddingLeft: 16 }}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length > 0 && selectedIds.length === filteredOrders.length}
                  style={{ width: 16, height: 16 }}
                />
              </th>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment status</th>
              <th>Fulfillment status</th>
              <th>Items</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-[#616161] py-12">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr
                  key={order.id}
                  className={selectedIds.includes(order.id) ? 'bg-[#f6f6f7]' : ''}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <td style={{ paddingLeft: 16, width: 40 }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => handleSelectOne(order.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: 16, height: 16 }}
                    />
                  </td>
                  <td>
                    <Link
                      to={`/orders/${order.id}`}
                      className="font-semibold text-[#303030] hover:underline"
                      style={{ color: '#303030' }}
                    >
                      {order.name}
                    </Link>
                  </td>
                  <td className="text-[#616161]">
                    {formatOrderDate(order.createdAt)}
                  </td>
                  <td>
                    {order.customer ? (
                      <span className="text-[#303030]">
                        {order.customer.firstName} {order.customer.lastName}
                      </span>
                    ) : (
                      <span className="text-[#616161]">No customer</span>
                    )}
                  </td>
                  <td className="text-[#303030] font-medium">
                    ${parseFloat(order.totalPrice).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${getFinancialBadge(order.financialStatus)}`}>
                      {getFinancialLabel(order.financialStatus)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getFulfillmentBadge(order.fulfillmentStatus)}`}>
                      {getFulfillmentLabel(order.fulfillmentStatus)}
                    </span>
                  </td>
                  <td className="text-[#616161]">
                    {order.lineItems ? order.lineItems.length : 0} items
                  </td>
                  <td>
                    {!order.fulfillmentStatus && order.financialStatus === 'paid' && (
                      <button
                        onClick={(e) => handleFulfill(order.id, e)}
                        title="Fulfill order"
                        className="p-1.5 hover:bg-[#aee9d1] text-[#047b5d] rounded-lg transition-colors"
                      >
                        <Truck size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-modal overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#e3e3e3' }}>
              <h3 className="text-[16px] font-bold text-[#303030]">Create order</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-[#f1f1f1] rounded">
                <X size={20} className="text-[#616161]" />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">Customer name</label>
                  <input
                    type="text"
                    className={`w-full text-[13px] ${errors.customerName ? 'border-[#d72c0d]' : ''}`}
                    placeholder="Jane Smith"
                    value={newOrder.customerName}
                    onChange={e => { setNewOrder({ ...newOrder, customerName: e.target.value }); setErrors(v => ({ ...v, customerName: '' })); }}
                  />
                  {errors.customerName && <p className="text-[12px] text-[#d72c0d] mt-1">{errors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#303030] mb-1">Customer email</label>
                  <input
                    type="email"
                    className={`w-full text-[13px] ${errors.customerEmail ? 'border-[#d72c0d]' : ''}`}
                    placeholder="jane@example.com"
                    value={newOrder.customerEmail}
                    onChange={e => { setNewOrder({ ...newOrder, customerEmail: e.target.value }); setErrors(v => ({ ...v, customerEmail: '' })); }}
                  />
                  {errors.customerEmail && <p className="text-[12px] text-[#d72c0d] mt-1">{errors.customerEmail}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Payment status</label>
                <select
                  className="w-full text-[13px]"
                  value={newOrder.financialStatus}
                  onChange={e => setNewOrder({ ...newOrder, financialStatus: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="authorized">Authorized</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[13px] font-medium text-[#303030]">Line items</label>
                  <button
                    type="button"
                    className="btn-plain text-[12px] py-0.5"
                    onClick={() => setNewOrder({ ...newOrder, lineItems: [...newOrder.lineItems, { title: '', quantity: 1, price: '' }] })}
                  >
                    + Add item
                  </button>
                </div>
                {errors.lineItems && <p className="text-[12px] text-[#d72c0d] mb-2">{errors.lineItems}</p>}
                {errors.lineItemsPrice && <p className="text-[12px] text-[#d72c0d] mb-2">{errors.lineItemsPrice}</p>}
                <div className="space-y-2">
                  {newOrder.lineItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <input
                        type="text"
                        className="flex-1 text-[13px]"
                        placeholder="Product name"
                        value={item.title}
                        onChange={e => {
                          const items = [...newOrder.lineItems];
                          items[idx] = { ...items[idx], title: e.target.value };
                          setNewOrder({ ...newOrder, lineItems: items });
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
                          const items = [...newOrder.lineItems];
                          items[idx] = { ...items[idx], quantity: parseInt(e.target.value) || 1 };
                          setNewOrder({ ...newOrder, lineItems: items });
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
                          const items = [...newOrder.lineItems];
                          items[idx] = { ...items[idx], price: e.target.value };
                          setNewOrder({ ...newOrder, lineItems: items });
                          setErrors(v => ({ ...v, lineItemsPrice: '' }));
                        }}
                      />
                      {newOrder.lineItems.length > 1 && (
                        <button
                          type="button"
                          className="p-1 hover:bg-[#ffd2d2] text-[#d72c0d] rounded mt-1"
                          onClick={() => setNewOrder({ ...newOrder, lineItems: newOrder.lineItems.filter((_, i) => i !== idx) })}
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
                  value={newOrder.note}
                  onChange={e => setNewOrder({ ...newOrder, note: e.target.value })}
                  placeholder="Internal order note..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary text-[13px]">Cancel</button>
                <button type="submit" className="btn-primary text-[13px]">Create order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
