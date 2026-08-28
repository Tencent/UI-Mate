import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CARRIERS = ['USPS', 'UPS', 'FedEx', 'DHL', 'Amazon Logistics', 'Other'];

function fmt(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function formatDate(ts) {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }) {
  const map = { 'Shipped': 'badge-success', 'Pending': 'badge-pending', 'Unshipped': 'badge-pending', 'Cancelled': 'badge-error', 'Returned': 'badge-info' };
  return <span className={`badge ${map[status] || 'badge-inactive'}`}>{status}</span>;
}

export default function OrderDetail() {
  const { id } = useParams();
  const { state, dispatch, showToast } = useApp();
  const navigate = useNavigate();
  const [showShipModal, setShowShipModal] = useState(false);
  const [carrier, setCarrier] = useState('USPS');
  const [tracking, setTracking] = useState('');
  const [trackingError, setTrackingError] = useState('');

  if (!state) return null;
  const order = state.orders.find(o => o.id === id);
  if (!order) return <div className="content-area"><div className="alert alert-error">Order not found</div></div>;

  const confirmShipment = () => {
    if (!tracking.trim()) { setTrackingError('Tracking number is required'); return; }
    dispatch({ type: 'UPDATE_ORDER', payload: { id: order.id, status: 'Shipped', carrier, trackingNumber: tracking, shippedDate: new Date().toISOString(), lastUpdateDate: new Date().toISOString() } });
    setShowShipModal(false);
    showToast('Order marked as shipped', 'success');
  };

  const timeline = [
    { event: 'Order Placed', date: order.purchaseDate, done: true },
    { event: 'Payment Confirmed', date: order.purchaseDate, done: true },
    { event: 'Shipped', date: order.shippedDate, done: !!order.shippedDate },
    { event: 'Delivered', date: order.status === 'Shipped' ? order.deliverByDate : null, done: false }
  ].filter(t => t.date || t.done !== false || t.event === 'Delivered');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => navigate('/orders')} className="btn-link" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeft size={14} /> Back to Orders
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Order #{order.amazonOrderId}</h1>
        <StatusBadge status={order.status} />
      </div>

      {/* Order Summary */}
      <div className="card">
        <div className="card-title">Order Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div><div style={{ fontSize: 12, color: '#555' }}>Order Date</div><div style={{ fontWeight: 700 }}>{formatDate(order.purchaseDate)}</div></div>
          <div><div style={{ fontSize: 12, color: '#555' }}>Fulfillment Channel</div><div><span className={order.fulfillmentChannel === 'FBA' ? 'badge badge-fba' : 'badge badge-fbm'}>{order.fulfillmentChannel}</span></div></div>
          <div><div style={{ fontSize: 12, color: '#555' }}>Sales Channel</div><div style={{ fontWeight: 700 }}>{order.salesChannel}</div></div>
          <div><div style={{ fontSize: 12, color: '#555' }}>Ship By</div><div style={{ fontWeight: 700 }}>{order.shipByDate ? new Date(order.shipByDate).toLocaleDateString() : '-'}</div></div>
          <div><div style={{ fontSize: 12, color: '#555' }}>Deliver By</div><div style={{ fontWeight: 700 }}>{order.deliverByDate ? new Date(order.deliverByDate).toLocaleDateString() : '-'}</div></div>
          <div><div style={{ fontSize: 12, color: '#555' }}>Status</div><StatusBadge status={order.status} /></div>
        </div>
      </div>

      {/* Buyer Info */}
      <div className="card">
        <div className="card-title">Buyer Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#555' }}>Buyer Name</div>
            <div style={{ fontWeight: 700 }}>{order.buyerName}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#555' }}>Email</div>
            <div>{order.buyerEmail}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#555' }}>Shipping Address</div>
            <div>
              {order.shippingAddress.name}<br />
              {order.shippingAddress.line1}{order.shippingAddress.line2 ? ', ' + order.shippingAddress.line2 : ''}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card">
        <div className="card-title">Order Items</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>ASIN / SKU</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.orderItemId}>
                <td>{item.title}</td>
                <td style={{ fontSize: 12 }}>{item.asin}<br />{item.sku}</td>
                <td>{item.quantity}</td>
                <td>{fmt(item.unitPrice)}</td>
                <td style={{ fontWeight: 700 }}>{fmt(item.itemTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="card">
        <div className="card-title">Financial Summary</div>
        <div style={{ maxWidth: 300 }}>
          {[
            ['Order Total', order.orderTotal],
            ['Shipping Fee', order.shippingFee],
            ['Amazon Fees', -order.amazonFees],
            ['Net Proceeds', order.netProceeds]
          ].map(([label, val], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 3 ? '1px solid #eee' : '2px solid #222', fontWeight: i === 3 ? 700 : 400 }}>
              <span>{label}</span>
              <span style={{ color: i === 2 ? '#d13212' : i === 3 ? '#067d62' : '#111' }}>{val >= 0 ? fmt(val) : '-' + fmt(-val)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping */}
      <div className="card">
        <div className="card-title">Shipping</div>
        {order.status === 'Shipped' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div><div style={{ fontSize: 12, color: '#555' }}>Carrier</div><div style={{ fontWeight: 700 }}>{order.carrier}</div></div>
            <div><div style={{ fontSize: 12, color: '#555' }}>Tracking Number</div><div style={{ fontWeight: 700 }}>{order.trackingNumber}</div></div>
            <div><div style={{ fontSize: 12, color: '#555' }}>Shipped Date</div><div style={{ fontWeight: 700 }}>{formatDate(order.shippedDate)}</div></div>
          </div>
        ) : order.status === 'Unshipped' ? (
          <div>
            <div className="alert alert-warning" style={{ marginBottom: 12 }}>This order has not been shipped yet. Ship by: <strong>{order.shipByDate ? new Date(order.shipByDate).toLocaleDateString() : 'N/A'}</strong></div>
            <button className="btn-primary" onClick={() => setShowShipModal(true)}>Confirm Shipment</button>
          </div>
        ) : (
          <div style={{ color: '#555' }}>No shipping information available for {order.status.toLowerCase()} orders.</div>
        )}
      </div>

      {/* Activity */}
      <div className="card">
        <div className="card-title">Order Activity</div>
        {timeline.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 12, opacity: t.done || t.date ? 1 : 0.4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.done || t.date ? '#067d62' : '#ddd', marginTop: 4, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{t.event}</div>
              {t.date && <div style={{ fontSize: 12, color: '#555' }}>{formatDate(t.date)}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Ship Modal */}
      {showShipModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Confirm Shipment</h2>
              <button onClick={() => setShowShipModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Order #{order.amazonOrderId}</div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label required">Carrier</label>
                <select className="form-select" value={carrier} onChange={e => setCarrier(e.target.value)} style={{ width: '100%' }}>
                  {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label required">Tracking Number</label>
                <input className="form-input" style={{ width: '100%' }} value={tracking} onChange={e => { setTracking(e.target.value); setTrackingError(''); }} placeholder="Enter tracking number" />
                {trackingError && <span className="form-error">{trackingError}</span>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowShipModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmShipment}>Confirm Shipment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
