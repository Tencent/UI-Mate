import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

export default function TimeOffModal({ employeeId, onClose }) {
  const { state, dispatch, addTimeOffRequest } = useApp();
  const [policyId, setPolicyId] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const policies = state.timeOffPolicies || [];

  function calcTotalHours() {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate), e = new Date(endDate);
    if (e < s) return 0;
    let days = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) days++;
      cur.setDate(cur.getDate() + 1);
    }
    return days * hoursPerDay;
  }

  function handleSubmit() {
    if (!startDate || !endDate) { setError('Please select start and end dates.'); return; }
    if (endDate < startDate) { setError('End date must be after start date.'); return; }

    const newReqs = state.timeOffRequests || [];
    const nextId = Math.max(0, ...newReqs.map(r => r.id)) + 1;
    const request = {
      id: nextId,
      employeeId: employeeId,
      policyId: Number(policyId),
      startDate,
      endDate,
      hours: calcTotalHours(),
      status: 'pending',
      note,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_TIME_OFF_REQUEST', request });

    const notifs = state.notifications || [];
    const nextNotifId = Math.max(0, ...notifs.map(n => n.id)) + 1;
    const policyName = policies.find(p => p.id === Number(policyId))?.type || 'Time Off';
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        id: nextNotifId,
        type: 'time_off_request',
        message: `Time off request submitted: ${policyName} from ${startDate} to ${endDate}.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        icon: 'calendar',
        linkTo: `/people/${employeeId}/time-off`,
        isPastDue: false,
        dueDate: null
      }
    });

    onClose();
  }

  const totalHours = calcTotalHours();

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 480 }}>
        <div className="modal-header">
          <h2>Request Time Off</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
        </div>

        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">Time Off Type</label>
          <select className="form-select" value={policyId} onChange={e => setPolicyId(e.target.value)}>
            {policies.map(p => <option key={p.id} value={p.id}>{p.type}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Start Date</label>
            <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">End Date</label>
            <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Hours Per Day</label>
          <input type="number" className="form-input" value={hoursPerDay} min={1} max={24} onChange={e => setHoursPerDay(Number(e.target.value))} />
        </div>

        {totalHours > 0 && (
          <div style={{ background: '#f8fdf6', border: '1px solid #c9eb8a', borderRadius: 4, padding: '8px 12px', marginBottom: 16, fontSize: 13, color: '#333' }}>
            Total: <strong>{totalHours} hours</strong>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Note (optional)</label>
          <textarea className="form-textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." style={{ minHeight: 60 }} />
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Submit Request</button>
        </div>
      </div>
    </div>
  );
}
