import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} className={i <= rating ? 'star-filled' : 'star-empty'} fill={i <= rating ? '#ff9900' : 'none'} stroke={i <= rating ? '#ff9900' : '#ddd'} />
      ))}
    </div>
  );
}

export default function Feedback() {
  const { state, dispatch, showToast } = useApp();
  const [expanded, setExpanded] = useState(null);
  const [responses, setResponses] = useState({});

  if (!state) return null;
  const { feedback } = state;

  const submitResponse = (fbId) => {
    const resp = responses[fbId];
    if (!resp?.trim()) return;
    dispatch({ type: 'ADD_FEEDBACK_RESPONSE', payload: { id: fbId, response: resp } });
    showToast('Response posted', 'success');
    setExpanded(null);
  };

  const requestRemoval = (fbId) => {
    dispatch({ type: 'ADD_FEEDBACK_RESPONSE', payload: { id: fbId, response: responses[fbId] || '', removalRequested: true } });
    showToast('Removal requested', 'info');
    setExpanded(null);
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>Feedback Manager</h1>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Order ID</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map(fb => (
              <React.Fragment key={fb.id}>
                <tr onClick={() => setExpanded(expanded === fb.id ? null : fb.id)} style={{ cursor: 'pointer' }}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{new Date(fb.date).toLocaleDateString()}</td>
                  <td><StarRating rating={fb.rating} /></td>
                  <td style={{ maxWidth: 300 }}><div className="truncate" style={{ maxWidth: 280 }}>{fb.comment}</div></td>
                  <td>{fb.orderId ? <span style={{ fontSize: 12, color: '#0066c0' }}>{state.orders.find(o => o.id === fb.orderId)?.amazonOrderId || fb.orderId}</span> : '-'}</td>
                  <td>
                    {fb.removalRequested ? <span className="badge badge-info">Removal Requested</span> : fb.hasResponse ? <span className="badge badge-success">Responded</span> : <span className="badge badge-pending">Not Responded</span>}
                  </td>
                </tr>
                {expanded === fb.id && (
                  <tr>
                    <td colSpan={5} style={{ background: '#f9fafb', padding: 16 }}>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <StarRating rating={fb.rating} />
                          <span style={{ fontSize: 12, color: '#555' }}>{fb.buyerName} · {new Date(fb.date).toLocaleDateString()}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#111', lineHeight: '18px', marginBottom: 12 }}>{fb.comment}</div>
                        {fb.hasResponse && fb.sellerResponse && (
                          <div style={{ background: '#e6f7f9', padding: '8px 12px', borderLeft: '3px solid #007185', borderRadius: 3, marginBottom: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#007185', marginBottom: 4 }}>Your Response:</div>
                            <div style={{ fontSize: 13 }}>{fb.sellerResponse}</div>
                          </div>
                        )}
                        {!fb.hasResponse && (
                          <div>
                            <textarea className="form-textarea" style={{ width: '100%', height: 80, marginBottom: 8 }} placeholder="Write your response..." value={responses[fb.id] || ''} onChange={e => setResponses(r => ({ ...r, [fb.id]: e.target.value }))} />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn-primary" onClick={() => submitResponse(fb.id)}>Post Response</button>
                              {fb.rating <= 3 && <button className="btn-secondary" onClick={() => requestRemoval(fb.id)}>Request Removal</button>}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
