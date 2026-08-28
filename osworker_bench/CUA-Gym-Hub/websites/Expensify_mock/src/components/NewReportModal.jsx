import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

function formatAmount(cents) {
  return '$' + (cents / 100).toFixed(2);
}

export default function NewReportModal({ onClose }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  const qsStr = qs ? '?' + qs : '';

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const reportNum = Math.floor(10000000 + Math.random() * 90000000);
  const [name, setName] = useState('Expense Report #' + reportNum);
  const [policyId, setPolicyId] = useState('pol_001');
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  const unreported = state.expenses.filter(e => e.reportId === null);
  const policy = state.policies.find(p => p.id === policyId);

  const toggleExpense = (id) => {
    setSelectedExpenses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const total = selectedExpenses.reduce((sum, id) => {
    const e = state.expenses.find(x => x.id === id);
    return sum + (e ? e.amount : 0);
  }, 0);

  const [nameError, setNameError] = useState('');

  const create = () => {
    if (!name.trim()) { setNameError('Report name is required.'); return; }
    setNameError('');
    const id = 'rpt_' + Date.now();
    const user = state.currentUser;
    const selExps = selectedExpenses.map(eid => state.expenses.find(e => e.id === eid)).filter(Boolean);
    const dates = selExps.map(e => e.date).sort();

    dispatch({ type: 'ADD_REPORT', payload: {
      id, title: name, reportNumber: reportNum, policyId,
      policyName: policy ? policy.name : '',
      createdBy: user.id, createdByName: user.displayName, createdByEmail: user.email,
      status: 'open', total, currency: 'USD',
      submittedTo: 'usr_001', submittedToEmail: 'sarah.chen@acmecorp.com',
      submittedDate: null, approvedDate: null, reimbursedDate: null,
      startDate: dates[0] || '', endDate: dates[dates.length - 1] || '',
      expenseCount: selectedExpenses.length, starred: false,
      exported: false, exportedDate: null, isRetracted: false,
      createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(),
    }});

    selectedExpenses.forEach(eid => {
      dispatch({ type: 'UPDATE_EXPENSE', payload: { id: eid, reportId: id, status: 'open' } });
    });

    dispatch({ type: 'ADD_COMMENT', payload: {
      id: 'cmt_' + Date.now(), reportId: id, authorId: user.id,
      authorName: user.displayName, authorEmail: user.email,
      type: 'system', text: 'You created this report',
      timestamp: new Date().toISOString(),
    }});

    onClose();
    navigate('/reports/' + id + qsStr);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Report</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Report Name</label>
            <input className="form-input" value={name} onChange={e => { setName(e.target.value); if (e.target.value.trim()) setNameError(''); }} />
            {nameError && <div style={{ color: '#D93025', fontSize: 12, marginTop: 4 }}>{nameError}</div>}
          </div>
          <div className="form-group"><label className="form-label">Policy</label>
            <select className="form-select" value={policyId} onChange={e => setPolicyId(e.target.value)}>
              {state.policies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Unreported Expenses ({unreported.length})</label>
            <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: 4 }}>
              {unreported.length === 0 && <div style={{ padding: 12, color: '#8B959E', textAlign: 'center' }}>No unreported expenses</div>}
              {unreported.map(e => (
                <label key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedExpenses.includes(e.id)} onChange={() => toggleExpense(e.id)} />
                  <span style={{ flex: 1 }}>{e.merchant}</span>
                  <span style={{ color: '#8B959E', fontSize: 12 }}>{e.date}</span>
                  <span style={{ fontWeight: 600 }}>{formatAmount(e.amount)}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Total: {formatAmount(total)}</div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={create}>Create Report</button>
        </div>
      </div>
    </div>
  );
}
