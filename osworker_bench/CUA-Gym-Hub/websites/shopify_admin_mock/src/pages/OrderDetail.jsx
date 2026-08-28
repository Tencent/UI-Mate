
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, X, MoreHorizontal } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

function getFinancialBadge(status) {
  const map = { paid: 'badge-success', pending: 'badge-warning', partially_paid: 'badge-warning', refunded: 'badge-error', partially_refunded: 'badge-warning', voided: 'badge-info', authorized: 'badge-warning' };
  return map[status] || 'badge-info';
}
function getFinancialLabel(status) {
  const map = { paid: 'Paid', pending: 'Pending', partially_paid: 'Partially paid', refunded: 'Refunded', partially_refunded: 'Partially refunded', voided: 'Voided', authorized: 'Authorized' };
  return map[status] || status;
}
function getFulfillmentBadge(status) {
  if (!status) return 'badge-error';
  return { fulfilled: 'badge-success', partial: 'badge-warning', restocked: 'badge-info' }[status] || 'badge-info';
}
function getFulfillmentLabel(status) {
  if (!status) return 'Unfulfilled';
  return { fulfilled: 'Fulfilled', partial: 'Partial', restocked: 'Restocked' }[status] || status;
}

function formatAddress(addr) {
  if (!addr) return null;
  const parts = [];
  if (addr.firstName || addr.lastName) parts.push(`${addr.firstName || ''} ${addr.lastName || ''}`.trim());
  if (addr.company) parts.push(addr.company);
  if (addr.address1) parts.push(addr.address1);
  if (addr.address2) parts.push(addr.address2);
  if (addr.city || addr.province || addr.zip) {
    parts.push(`${addr.city || ''}${addr.province ? ', ' + addr.province : ''} ${addr.zip || ''}`.trim());
  }
  if (addr.country) parts.push(addr.country);
  if (addr.phone) parts.push(addr.phone);
  return parts.length > 0 ? parts : null;
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, updateOrder } = useStore();
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('FedEx');
  const [noteText, setNoteText] = useState('');
  const [refundItems, setRefundItems] = useState([]);
  const [refundShipping, setRefundShipping] = useState(false);
  const [refundNote, setRefundNote] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [localNotice, setLocalNotice] = useState('');

  const order = state.orders.find(o => o.id === id);

  if (!order) {
    return <div className="p-8 text-center text-[#616161]">Order not found</div>;
  }

  // Edit form state, initialized from order
  const [editForm, setEditForm] = useState({
    note: order.note || '',
    tags: (order.tags || []).join(', '),
    financialStatus: order.financialStatus || 'pending',
  });

  const handleFulfill = (e) => {
    e.preventDefault();
    const newTimeline = [
      ...(order.timeline || []),
      { id: `evt_${Date.now()}`, type: 'fulfilled', message: `Items were fulfilled${trackingNumber ? '. Tracking: ' + trackingNumber + ' (' + carrier + ')' : ''}`, createdAt: new Date().toISOString(), user: 'Alex Chen' }
    ];
    updateOrder(id, {
      fulfillmentStatus: 'fulfilled',
      timeline: newTimeline,
      updatedAt: new Date().toISOString()
    });
    setShowFulfillModal(false);
  };

  const handleRefund = (e) => {
    e.preventDefault();
    const refundTotal = refundItems.reduce((sum, item) => {
      const li = order.lineItems.find(l => l.id === item.id);
      return sum + (li ? parseFloat(li.price) * item.qty : 0);
    }, 0) + (refundShipping ? parseFloat(order.totalShippingPrice || 0) : 0);

    const newFinancialStatus = refundTotal >= parseFloat(order.totalPrice) ? 'refunded' : 'partially_refunded';
    const newTimeline = [
      ...(order.timeline || []),
      {
        id: `evt_${Date.now()}`,
        type: 'refund',
        message: `Refund of $${refundTotal.toFixed(2)} was issued${refundNote ? ': ' + refundNote : ''}`,
        createdAt: new Date().toISOString(),
        user: 'Alex Chen'
      }
    ];
    updateOrder(id, {
      financialStatus: newFinancialStatus,
      timeline: newTimeline,
      updatedAt: new Date().toISOString()
    });
    setShowRefundModal(false);
    setRefundItems([]);
    setRefundShipping(false);
    setRefundNote('');
  };

  const handleEdit = (e) => {
    e.preventDefault();
    const tags = editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const newTimeline = [
      ...(order.timeline || []),
      { id: `evt_${Date.now()}`, type: 'edit', message: 'Order was edited', createdAt: new Date().toISOString(), user: 'Alex Chen' }
    ];
    updateOrder(id, {
      note: editForm.note,
      tags,
      financialStatus: editForm.financialStatus,
      timeline: newTimeline,
      updatedAt: new Date().toISOString()
    });
    setShowEditModal(false);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const newTimeline = [
      ...(order.timeline || []),
      { id: `evt_${Date.now()}`, type: 'note', message: noteText, createdAt: new Date().toISOString(), user: 'Alex Chen' }
    ];
    updateOrder(id, { timeline: newTimeline, note: (order.note ? order.note + '\n' : '') + noteText });
    setNoteText('');
  };

  const downloadOrderSummary = () => {
    const summary = [
      `Order ${order.name}`,
      `Customer: ${order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : order.email || 'No customer'}`,
      `Payment: ${getFinancialLabel(order.financialStatus)}`,
      `Fulfillment: ${getFulfillmentLabel(order.fulfillmentStatus)}`,
      '',
      'Items:',
      ...(order.lineItems || []).map(item => `${item.quantity} x ${item.title} - $${(parseFloat(item.price) * item.quantity).toFixed(2)}`),
      '',
      `Total: $${parseFloat(order.totalPrice || 0).toFixed(2)}`,
    ].join('\n');
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.name.replace('#', 'order-')}-summary.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setShowMoreMenu(false);
  };

  const markPacked = () => {
    const newTimeline = [
      ...(order.timeline || []),
      { id: `evt_${Date.now()}`, type: 'packed', message: 'Packing slip was printed locally', createdAt: new Date().toISOString(), user: 'Alex Chen' }
    ];
    updateOrder(id, { timeline: newTimeline, updatedAt: new Date().toISOString() });
    setLocalNotice('Packing slip printed locally.');
    setShowMoreMenu(false);
  };

  // Initialize refund items from line items when modal opens
  const openRefundModal = () => {
    setRefundItems((order.lineItems || []).map(li => ({ id: li.id, qty: 0 })));
    setShowRefundModal(true);
  };

  const lineItems = order.lineItems || [];
  const timeline = [...(order.timeline || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const shippingAddr = formatAddress(order.shippingAddress);
  const billingAddr = formatAddress(order.billingAddress);

  const refundTotal = refundItems.reduce((sum, item) => {
    const li = order.lineItems?.find(l => l.id === item.id);
    return sum + (li ? parseFloat(li.price) * item.qty : 0);
  }, 0) + (refundShipping ? parseFloat(order.totalShippingPrice || 0) : 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/orders')} className="p-1.5 hover:bg-[#e3e3e3] rounded-lg">
            <ArrowLeft size={20} className="text-[#616161]" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{order.name}</h1>
              <span className={`badge ${getFinancialBadge(order.financialStatus)}`}>{getFinancialLabel(order.financialStatus)}</span>
              <span className={`badge ${getFulfillmentBadge(order.fulfillmentStatus)}`}>{getFulfillmentLabel(order.fulfillmentStatus)}</span>
            </div>
            <p className="text-[13px] text-[#616161] mt-1">{format(new Date(order.createdAt), 'MMM d, yyyy \'at\' h:mm a')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['paid', 'partially_paid'].includes(order.financialStatus) && (
            <button onClick={openRefundModal} className="btn-secondary text-[13px]">Refund</button>
          )}
          <button onClick={() => setShowEditModal(true)} className="btn-secondary text-[13px]">Edit</button>
          <div className="relative">
            <button className="btn-secondary text-[13px]" onClick={() => setShowMoreMenu(v => !v)} aria-label="More order actions"><MoreHorizontal size={16} /></button>
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-modal z-40 overflow-hidden" style={{ borderColor: '#e3e3e3' }}>
                <button className="block w-full text-left px-3 py-2 text-[13px] hover:bg-[#f6f6f7]" onClick={downloadOrderSummary}>Download order summary</button>
                <button className="block w-full text-left px-3 py-2 text-[13px] hover:bg-[#f6f6f7]" onClick={markPacked}>Print packing slip</button>
                <button className="block w-full text-left px-3 py-2 text-[13px] hover:bg-[#f6f6f7]" onClick={() => { setLocalNotice('Customer notification draft opened locally.'); setShowMoreMenu(false); }}>Email customer</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {localNotice && (
        <div className="card flex items-center justify-between py-3">
          <span className="text-[13px] text-[#303030]">{localNotice}</span>
          <button className="text-[13px] text-[#005bd3]" onClick={() => setLocalNotice('')}>Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main (65%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line items card */}
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#e3e3e3', background: '#f9fafb' }}>
              <div className="flex items-center gap-2">
                <span className={`badge ${getFulfillmentBadge(order.fulfillmentStatus)}`}>{getFulfillmentLabel(order.fulfillmentStatus)}</span>
              </div>
              {!order.fulfillmentStatus && (
                <button onClick={() => setShowFulfillModal(true)} className="btn-primary text-[13px]">Fulfill items</button>
              )}
            </div>
            <div className="p-4 space-y-0">
              {lineItems.map((item, idx) => (
                <div key={item.id || idx} className="flex gap-4 py-3 border-b last:border-0" style={{ borderColor: '#f3f3f3' }}>
                  <div className="w-12 h-12 rounded border overflow-hidden flex-shrink-0" style={{ borderColor: '#e3e3e3' }}>
                    <img src={item.imageSrc || `https://picsum.photos/seed/${encodeURIComponent(item.title?.slice(0,10) || 'P')}/48/48`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.productId ? (
                      <Link to={`/products/${item.productId}`} className="text-[13px] font-medium text-[#005bd3] hover:underline">{item.title}</Link>
                    ) : (
                      <span className="text-[13px] font-medium text-[#303030]">{item.title}</span>
                    )}
                    {item.variantTitle && <div className="text-[12px] text-[#616161]">{item.variantTitle}</div>}
                    {item.sku && <div className="text-[12px] text-[#616161]">SKU: {item.sku}</div>}
                  </div>
                  <div className="text-[13px] text-[#616161]">${parseFloat(item.price).toFixed(2)} x {item.quantity}</div>
                  <div className="text-[13px] font-medium text-[#303030] text-right w-20">${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="p-4 border-t space-y-2" style={{ borderColor: '#e3e3e3', background: '#f9fafb' }}>
              <div className="flex justify-between text-[13px]"><span className="text-[#616161]">Subtotal</span><span>${parseFloat(order.subtotalPrice || 0).toFixed(2)}</span></div>
              <div className="flex justify-between text-[13px]"><span className="text-[#616161]">Shipping</span><span>${parseFloat(order.totalShippingPrice || 0).toFixed(2)}</span></div>
              {parseFloat(order.totalDiscounts || 0) > 0 && (
                <div className="flex justify-between text-[13px]"><span className="text-[#616161]">Discount</span><span className="text-[#047b5d]">-${parseFloat(order.totalDiscounts).toFixed(2)}</span></div>
              )}
              <div className="flex justify-between text-[13px]"><span className="text-[#616161]">Tax</span><span>${parseFloat(order.totalTax || 0).toFixed(2)}</span></div>
              <div className="flex justify-between text-[14px] font-bold pt-2 border-t" style={{ borderColor: '#e3e3e3' }}>
                <span>Total</span><span>${parseFloat(order.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 className="card-title mb-4">Timeline</h3>
            {/* Add note */}
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Leave a comment..." className="flex-1 text-[13px]" value={noteText} onChange={(e) => setNoteText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNote()} />
              <button onClick={handleAddNote} className="btn-secondary text-[13px]">Post</button>
            </div>
            <div className="space-y-4 pl-4 border-l-2" style={{ borderColor: '#e3e3e3' }}>
              {timeline.map((evt, idx) => (
                <div key={evt.id || idx} className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full" style={{
                    background: evt.type === 'fulfilled' ? '#047b5d' : evt.type === 'paid' ? '#008060' : evt.type === 'note' ? '#005bd3' : evt.type === 'refund' ? '#d72c0d' : '#616161'
                  }}></div>
                  <p className="text-[13px] text-[#303030]">{evt.message}</p>
                  <p className="text-[12px] text-[#616161] mt-0.5">
                    {formatDistanceToNow(new Date(evt.createdAt), { addSuffix: true })}
                    {evt.user && ` by ${evt.user}`}
                  </p>
                </div>
              ))}
              {timeline.length === 0 && <p className="text-[13px] text-[#616161]">No activity yet</p>}
            </div>
          </div>
        </div>

        {/* Sidebar (35%) */}
        <div className="space-y-4">
          {/* Notes */}
          <div className="card">
            <h3 className="card-title mb-2">Notes</h3>
            <p className="text-[13px] text-[#616161]">{order.note || 'No notes'}</p>
          </div>

          {/* Customer */}
          <div className="card">
            <h3 className="card-title mb-3">Customer</h3>
            {order.customer ? (
              <div className="space-y-2 text-[13px]">
                <Link to={`/customers/${order.customer.id}`} className="text-[#005bd3] font-medium hover:underline">
                  {order.customer.firstName} {order.customer.lastName}
                </Link>
                <div className="text-[#616161]">{order.email}</div>
              </div>
            ) : (
              <p className="text-[13px] text-[#616161]">No customer</p>
            )}
          </div>

          {/* Shipping address */}
          <div className="card">
            <div className="flex justify-between items-center mb-2">
              <h3 className="card-title">Shipping address</h3>
            </div>
            {shippingAddr ? (
              <div className="text-[13px] text-[#616161] space-y-0.5">
                {shippingAddr.map((line, i) => <p key={i}>{line}</p>)}
              </div>
            ) : (
              <p className="text-[13px] text-[#616161]">No shipping address</p>
            )}
          </div>

          {/* Billing address */}
          <div className="card">
            <h3 className="card-title mb-2">Billing address</h3>
            {billingAddr ? (
              <div className="text-[13px] text-[#616161] space-y-0.5">
                {billingAddr.map((line, i) => <p key={i}>{line}</p>)}
              </div>
            ) : (
              <p className="text-[13px] text-[#616161]">Same as shipping address</p>
            )}
          </div>

          {/* Tags */}
          <div className="card">
            <h3 className="card-title mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {(order.tags || []).map((tag, i) => (
                <span key={i} className="badge badge-info">{tag}</span>
              ))}
              {(!order.tags || order.tags.length === 0) && <span className="text-[13px] text-[#616161]">No tags</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Fulfillment Modal */}
      {showFulfillModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-modal">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#e3e3e3' }}>
              <h3 className="text-[16px] font-bold text-[#303030]">Fulfill items</h3>
              <button onClick={() => setShowFulfillModal(false)} className="p-1 hover:bg-[#f1f1f1] rounded"><X size={20} className="text-[#616161]" /></button>
            </div>
            <form onSubmit={handleFulfill} className="p-4 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Tracking number</label>
                <input type="text" className="w-full text-[13px]" placeholder="e.g. 1Z999AA10123456784" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Shipping carrier</label>
                <select className="w-full text-[13px]" value={carrier} onChange={(e) => setCarrier(e.target.value)}>
                  <option value="FedEx">FedEx</option>
                  <option value="UPS">UPS</option>
                  <option value="USPS">USPS</option>
                  <option value="DHL">DHL</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowFulfillModal(false)} className="btn-secondary text-[13px]">Cancel</button>
                <button type="submit" className="btn-primary text-[13px]">Fulfill items</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-modal">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#e3e3e3' }}>
              <h3 className="text-[16px] font-bold text-[#303030]">Issue refund</h3>
              <button onClick={() => setShowRefundModal(false)} className="p-1 hover:bg-[#f1f1f1] rounded"><X size={20} className="text-[#616161]" /></button>
            </div>
            <form onSubmit={handleRefund} className="p-4 space-y-4">
              <div>
                <p className="text-[13px] font-medium text-[#303030] mb-2">Select items to refund</p>
                <div className="space-y-2">
                  {(order.lineItems || []).map((li, idx) => {
                    const refundItem = refundItems.find(r => r.id === li.id) || { qty: 0 };
                    return (
                      <div key={li.id} className="flex items-center gap-3">
                        <div className="flex-1 text-[13px] text-[#303030]">{li.title} {li.variantTitle ? `- ${li.variantTitle}` : ''}</div>
                        <div className="text-[12px] text-[#616161]">${parseFloat(li.price).toFixed(2)}</div>
                        <div className="flex items-center gap-1">
                          <span className="text-[12px] text-[#616161]">Qty:</span>
                          <input
                            type="number"
                            min="0"
                            max={li.quantity}
                            className="w-14 text-[13px]"
                            value={refundItem.qty}
                            onChange={e => {
                              const qty = Math.min(parseInt(e.target.value) || 0, li.quantity);
                              setRefundItems(prev => prev.map(r => r.id === li.id ? { ...r, qty } : r));
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="refund-shipping"
                  checked={refundShipping}
                  onChange={e => setRefundShipping(e.target.checked)}
                  className="w-4 h-4"
                  style={{ accentColor: '#008060' }}
                />
                <label htmlFor="refund-shipping" className="text-[13px] text-[#303030]">Refund shipping (${parseFloat(order.totalShippingPrice || 0).toFixed(2)})</label>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Reason</label>
                <input
                  type="text"
                  className="w-full text-[13px]"
                  placeholder="Reason for refund..."
                  value={refundNote}
                  onChange={e => setRefundNote(e.target.value)}
                />
              </div>
              <div className="p-3 rounded-lg bg-[#f9fafb] border text-[13px]" style={{ borderColor: '#e3e3e3' }}>
                <div className="flex justify-between font-medium">
                  <span>Refund total</span>
                  <span>${refundTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowRefundModal(false)} className="btn-secondary text-[13px]">Cancel</button>
                <button type="submit" className="btn-danger text-[13px]" disabled={refundTotal <= 0}>
                  Refund ${refundTotal.toFixed(2)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-modal">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#e3e3e3' }}>
              <h3 className="text-[16px] font-bold text-[#303030]">Edit order {order.name}</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-[#f1f1f1] rounded"><X size={20} className="text-[#616161]" /></button>
            </div>
            <form onSubmit={handleEdit} className="p-4 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Payment status</label>
                <select
                  className="w-full text-[13px]"
                  value={editForm.financialStatus}
                  onChange={e => setEditForm(f => ({ ...f, financialStatus: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="authorized">Authorized</option>
                  <option value="partially_paid">Partially paid</option>
                  <option value="voided">Voided</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Tags</label>
                <input
                  type="text"
                  className="w-full text-[13px]"
                  placeholder="tag1, tag2, tag3"
                  value={editForm.tags}
                  onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
                />
                <p className="text-[12px] text-[#616161] mt-1">Separate tags with commas</p>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Note</label>
                <textarea
                  className="w-full text-[13px]"
                  rows={3}
                  value={editForm.note}
                  onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Internal order note..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary text-[13px]">Cancel</button>
                <button type="submit" className="btn-primary text-[13px]">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
