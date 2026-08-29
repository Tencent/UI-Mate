import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STATUS_TABS = ['All Orders', 'Pending', 'Unshipped', 'Shipped', 'Cancelled'];
const PAGE_SIZE = 10;
const CARRIERS = ['USPS', 'UPS', 'FedEx', 'DHL', 'Amazon Logistics', 'Other'];

function fmt(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function formatDate(ts) {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }) {
  const map = {
    'Shipped': 'badge-success',
    'Pending': 'badge-pending',
    'Unshipped': 'badge-pending',
    'Cancelled': 'badge-error',
    'Returned': 'badge-info'
  };
  return <span className={`badge ${map[status] || 'badge-inactive'}`}>{status}</span>;
}

function ConfirmShipmentModal({ orders: selectedOrders, onClose, onConfirm }) {
  const [data, setData] = useState(() => Object.fromEntries(selectedOrders.map(o => [o.id, { carrier: 'USPS', trackingNumber: '' }])));
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const errs = {};
    for (const o of selectedOrders) {
      if (!data[o.id]?.trackingNumber.trim()) errs[o.id] = 'Tracking number required';
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onConfirm(data);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Confirm Shipment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {selectedOrders.map(order => (
            <div key={order.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Order #{order.amazonOrderId}</div>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>
                {order.items.map(i => `${i.title.slice(0, 40)} (x${i.quantity})`).join(', ')}
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label required">Carrier</label>
                  <select className="form-select" value={data[order.id].carrier} onChange={e => setData(d => ({ ...d, [order.id]: { ...d[order.id], carrier: e.target.value } }))}>
                    {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label required">Tracking Number</label>
                  <input className="form-input" style={{ width: '100%' }} value={data[order.id].trackingNumber} onChange={e => { setData(d => ({ ...d, [order.id]: { ...d[order.id], trackingNumber: e.target.value } })); setErrors(er => ({ ...er, [order.id]: '' })); }} placeholder="Enter tracking number" />
                  {errors[order.id] && <span className="form-error">{errors[order.id]}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>Confirm Shipment</button>
        </div>
      </div>
    </div>
  );
}

function CancelOrderModal({ order, onClose, onConfirm }) {
  if (!order) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2>Cancel Order</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ marginTop: 0 }}>
            Cancel order <strong>{order.amazonOrderId}</strong> for {order.buyerName}?
          </p>
          <p style={{ color: '#555', fontSize: 13 }}>
            The order status will change to Cancelled and remain visible in order history.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Keep Order</button>
          <button className="btn-primary" style={{ background: '#d13212', borderColor: '#d13212' }} onClick={onConfirm}>Cancel Order</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const { state, dispatch, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || 'All Orders';
  const [activeTab, setActiveTab] = useState(STATUS_TABS.includes(statusParam) ? statusParam : 'All Orders');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [fulfillment, setFulfillment] = useState('All');
  const [sortCol, setSortCol] = useState('purchaseDate');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showShipModal, setShowShipModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const orders = state?.orders || [];

  const tabCounts = useMemo(() => {
    const counts = { 'All Orders': orders.length };
    STATUS_TABS.slice(1).forEach(s => { counts[s] = orders.filter(o => o.status === s).length; });
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    let list = orders;
    if (activeTab !== 'All Orders') list = list.filter(o => o.status === activeTab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o => o.amazonOrderId.toLowerCase().includes(q) || o.buyerName.toLowerCase().includes(q) || o.items.some(i => i.title.toLowerCase().includes(q)));
    }
    if (dateFrom) list = list.filter(o => o.purchaseDate >= dateFrom);
    if (dateTo) list = list.filter(o => o.purchaseDate <= dateTo + 'T23:59:59Z');
    if (fulfillment !== 'All') list = list.filter(o => o.fulfillmentChannel === fulfillment);
    list = [...list].sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [orders, activeTab, search, dateFrom, dateTo, fulfillment, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageOrders = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const toggleSelect = (id) => setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  const toggleAll = () => setSelected(sel => sel.length === pageOrders.length ? [] : pageOrders.map(o => o.id));

  const handleConfirmShipment = (shipData) => {
    const now = new Date().toISOString();
    Object.entries(shipData).forEach(([orderId, { carrier, trackingNumber }]) => {
      dispatch({ type: 'UPDATE_ORDER', payload: { id: orderId, status: 'Shipped', carrier, trackingNumber, shippedDate: now, lastUpdateDate: now } });
    });
    setShowShipModal(false);
    setSelected([]);
    showToast(`${Object.keys(shipData).length} order(s) marked as shipped`, 'success');
  };

  const handleCancelOrder = () => {
    if (!orderToCancel) return;
    dispatch({ type: 'UPDATE_ORDER', payload: { id: orderToCancel.id, status: 'Cancelled', lastUpdateDate: new Date().toISOString() } });
    setSelected(sel => sel.filter(id => id !== orderToCancel.id));
    setOrderToCancel(null);
    showToast('Order cancelled', 'info');
  };

  const selectedUnshipped = selected.map(id => orders.find(o => o.id === id)).filter(o => o && o.status === 'Unshipped');

  const changeTab = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSelected([]);
    if (tab === 'All Orders') setSearchParams({});
    else setSearchParams({ status: tab });
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.2px' }}>Manage Orders</h1>

      {/* Tabs */}
      <div className="tab-bar">
        {STATUS_TABS.map(tab => (
          <div key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => changeTab(tab)}>
            {tab} ({tabCounts[tab]})
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffeaa7', padding: '8px 12px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{selected.length} order(s) selected</span>
          {selectedUnshipped.length > 0 && (
            <button className="btn-primary" onClick={() => setShowShipModal(true)}>Confirm Shipment ({selectedUnshipped.length})</button>
          )}
          <button className="btn-secondary" onClick={() => showToast('Packing slips printed', 'info')}>Print Packing Slips</button>
          <button className="btn-link" onClick={() => setSelected([])}>Clear selection</button>
        </div>
      )}

      {/* Search/Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" style={{ width: 300 }} placeholder="Search by Order ID, buyer name, or product" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <input className="form-input" type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} style={{ width: 140 }} />
        <span style={{ fontSize: 13, color: '#555' }}>to</span>
        <input className="form-input" type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} style={{ width: 140 }} />
        <select className="form-select" value={fulfillment} onChange={e => { setFulfillment(e.target.value); setPage(1); }}>
          <option value="All">All Fulfillment</option>
          <option value="FBA">FBA</option>
          <option value="FBM">FBM</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: 4, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}><input type="checkbox" checked={selected.length === pageOrders.length && pageOrders.length > 0} onChange={toggleAll} /></th>
              <th onClick={() => handleSort('purchaseDate')} style={{ cursor: 'pointer' }}>Order Date <SortIcon col="purchaseDate" /></th>
              <th>Order ID</th>
              <th>Product</th>
              <th onClick={() => handleSort('orderTotal')} style={{ cursor: 'pointer' }}>Total <SortIcon col="orderTotal" /></th>
              <th>Status</th>
              <th>Fulfillment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageOrders.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#555' }}>No orders found</td></tr>
            ) : pageOrders.map(order => (
              <tr key={order.id}>
                <td><input type="checkbox" checked={selected.includes(order.id)} onChange={() => toggleSelect(order.id)} /></td>
                <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{formatDate(order.purchaseDate)}</td>
                <td><Link to={`/orders/${order.id}`} style={{ fontWeight: 700 }}>{order.amazonOrderId}</Link></td>
                <td>
                  <div style={{ maxWidth: 220 }}>
                    <div className="truncate" style={{ maxWidth: 220 }}>{order.items[0].title.slice(0, 40)}{order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>Qty: {order.items.reduce((s, i) => s + i.quantity, 0)}</div>
                  </div>
                </td>
                <td style={{ fontWeight: 700 }}>${order.orderTotal.toFixed(2)}</td>
                <td><StatusBadge status={order.status} /></td>
                <td><span className={order.fulfillmentChannel === 'FBA' ? 'badge badge-fba' : 'badge badge-fbm'}>{order.fulfillmentChannel}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button className="btn-link" style={{ fontSize: 12 }} onClick={() => navigate(`/orders/${order.id}`)}>View</button>
                    {order.status === 'Unshipped' && <button className="btn-link" style={{ fontSize: 12 }} onClick={() => { setSelected([order.id]); setShowShipModal(true); }}>Ship</button>}
                    {(order.status === 'Pending' || order.status === 'Unshipped') && (
                      <button className="btn-link" style={{ fontSize: 12, color: '#d13212' }} onClick={() => setOrderToCancel(order)}>Cancel</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const p = i + 1;
          return <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
        })}
        <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        <span style={{ fontSize: 12, color: '#555', marginLeft: 8 }}>{filtered.length} orders total</span>
      </div>

      {showShipModal && (
        <ConfirmShipmentModal
          orders={selectedUnshipped}
          onClose={() => setShowShipModal(false)}
          onConfirm={handleConfirmShipment}
        />
      )}
      {orderToCancel && (
        <CancelOrderModal
          order={orderToCancel}
          onClose={() => setOrderToCancel(null)}
          onConfirm={handleCancelOrder}
        />
      )}
    </div>
  );
}
