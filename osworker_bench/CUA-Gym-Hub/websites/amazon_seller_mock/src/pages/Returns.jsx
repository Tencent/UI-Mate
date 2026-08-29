import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function fmt(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Returns() {
  const { state, dispatch, showToast } = useApp();
  const [expanded, setExpanded] = useState(null);
  const [notes, setNotes] = useState({});
  const [denyReason, setDenyReason] = useState({});
  const [showDenyModal, setShowDenyModal] = useState(null);

  if (!state) return null;
  const { returns, orders } = state;

  const approve = (id) => {
    dispatch({ type: 'UPDATE_RETURN', payload: { id, status: 'Approved', resolution: 'Refund' } });
    showToast('Return approved', 'success');
  };
  const deny = (id) => {
    dispatch({ type: 'UPDATE_RETURN', payload: { id, status: 'Denied', resolution: 'Denied', sellerNotes: denyReason[id] || '' } });
    setShowDenyModal(null);
    showToast('Return denied', 'info');
  };
  const saveNotes = (id, note) => {
    dispatch({ type: 'UPDATE_RETURN', payload: { id, sellerNotes: note } });
  };

  const statusClass = { Pending: 'badge-pending', Approved: 'badge-success', Completed: 'badge-info', Denied: 'badge-error' };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>Manage Returns</h1>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Request Date</th>
              <th>Order ID</th>
              <th>Product</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Refund Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {returns.map(ret => {
              const order = orders.find(o => o.id === ret.orderId);
              return (
                <React.Fragment key={ret.id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === ret.id ? null : ret.id)}>
                    <td style={{ fontSize: 12 }}>{new Date(ret.returnRequestDate).toLocaleDateString()}</td>
                    <td><span style={{ color: '#0066c0', fontSize: 12 }}>{ret.amazonOrderId}</span></td>
                    <td><div className="truncate" style={{ maxWidth: 200 }}>{ret.items[0]?.title?.slice(0, 35)}</div></td>
                    <td style={{ maxWidth: 160 }}><div className="truncate" style={{ maxWidth: 160, fontSize: 12 }}>{ret.reason}</div></td>
                    <td><span className={`badge ${statusClass[ret.status]}`}>{ret.status}</span></td>
                    <td style={{ fontWeight: 700 }}>{fmt(ret.items.reduce((s, i) => s + i.refundAmount, 0))}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {ret.status === 'Pending' && <>
                          <button className="btn-primary" style={{ fontSize: 11, padding: '2px 8px', height: 26 }} onClick={e => { e.stopPropagation(); approve(ret.id); }}>Approve</button>
                          <button className="btn-secondary" style={{ fontSize: 11, padding: '2px 8px', height: 26 }} onClick={e => { e.stopPropagation(); setShowDenyModal(ret.id); }}>Deny</button>
                        </>}
                      </div>
                    </td>
                  </tr>
                  {expanded === ret.id && (
                    <tr>
                      <td colSpan={7} style={{ background: '#f9fafb', padding: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div>
                            <div style={{ fontWeight: 700, marginBottom: 8 }}>Buyer Comments</div>
                            <div style={{ fontSize: 13, color: '#333', lineHeight: '18px', background: 'white', padding: 12, border: '1px solid #eee', borderRadius: 4 }}>{ret.buyerComments}</div>
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, marginBottom: 8 }}>Seller Notes</div>
                            <textarea className="form-textarea" style={{ width: '100%', height: 80 }} value={notes[ret.id] !== undefined ? notes[ret.id] : ret.sellerNotes} onChange={e => setNotes(n => ({ ...n, [ret.id]: e.target.value }))} onBlur={() => saveNotes(ret.id, notes[ret.id] || ret.sellerNotes)} placeholder="Add internal notes..." />
                          </div>
                        </div>
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontWeight: 700, marginBottom: 8 }}>Items</div>
                          {ret.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid #eee' }}>
                              <span>{item.title}</span>
                              <span>Qty: {item.quantity} · Refund: {fmt(item.refundAmount)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {showDenyModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header"><h2>Deny Return Request</h2></div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Reason for Denial</label>
                <textarea className="form-textarea" style={{ width: '100%', height: 80 }} value={denyReason[showDenyModal] || ''} onChange={e => setDenyReason(r => ({ ...r, [showDenyModal]: e.target.value }))} placeholder="Provide reason for denying this return..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDenyModal(null)}>Cancel</button>
              <button className="btn-primary" style={{ background: 'linear-gradient(to bottom, #f5a0a0, #e05555)', borderColor: '#c44' }} onClick={() => deny(showDenyModal)}>Deny Return</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
