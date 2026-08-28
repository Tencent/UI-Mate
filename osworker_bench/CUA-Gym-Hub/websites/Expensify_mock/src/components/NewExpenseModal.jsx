import React, { useState, useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSessionId } from '../utils/dataManager';

const tabNames = ['expense', 'distance', 'time', 'multiple'];

function today() {
  return new Date().toISOString().split('T')[0];
}

export default function NewExpenseModal({ initialTab = 'expense', onClose }) {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [validationError, setValidationError] = useState('');
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const fileInputRef = useRef(null);

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingReceipt(true);
    try {
      const sid = getSessionId();
      const formData = new FormData();
      formData.append('file', file);
      const url = sid ? '/upload?sid=' + encodeURIComponent(sid) : '/upload';
      const res = await fetch(url, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (data.files && data.files[0]) setReceiptUrl(data.files[0].url);
    } catch (err) {
      // silently fail; receipt just won't be attached
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Expense tab (independent state)
  const [date, setDate] = useState(today());
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [categoryId, setCategoryId] = useState('');
  const [tagId, setTagId] = useState('');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(false);
  const [reimbursable, setReimbursable] = useState(true);

  // Distance tab (independent state)
  const [distDate, setDistDate] = useState(today());
  const [distance, setDistance] = useState('');
  const [distUnit, setDistUnit] = useState('mi');
  const [distDescription, setDistDescription] = useState('');
  const distRate = state.distanceRates[0]?.rate || 67;
  const distAmount = distance ? Math.round(parseFloat(distance) * distRate) : 0;

  // Time tab (independent state)
  const [timeDate, setTimeDate] = useState(today());
  const [hours, setHours] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [timeCategoryId, setTimeCategoryId] = useState('');
  const [timeDescription, setTimeDescription] = useState('');
  const timeAmount = hours && hourlyRate ? Math.round(parseFloat(hours) * parseFloat(hourlyRate) * 100) : 0;

  // Multiple tab
  const [multiRows, setMultiRows] = useState(Array.from({ length: 10 }, () => ({ date: today(), merchant: '', total: '', tax: '', categoryId: '', description: '' })));

  const cats = state.categories.filter(c => c.enabled);
  const tags = state.tags.filter(t => t.enabled);

  const getCatName = (id) => { const c = state.categories.find(x => x.id === id); return c ? c.name : ''; };

  const saveExpense = () => {
    if (!merchant.trim()) { setValidationError('Merchant name is required.'); return; }
    setValidationError('');
    const cents = Math.round((parseFloat(amount) || 0) * 100);
    const exp = {
      id: 'exp_' + Date.now(),
      type: 'expense',
      policyId: state.currentUser.defaultPolicy || 'pol_001',
      reportId: null,
      createdBy: state.currentUser.id,
      merchant,
      amount: cents,
      currency,
      date,
      categoryId,
      category: getCatName(categoryId),
      tagId: tagId || null,
      tag: tagId ? (state.tags.find(t => t.id === tagId)?.name || '') : '',
      description,
      comment: '',
      receiptUrl: receiptUrl,
      hasReceipt: !!receiptUrl,
      billable,
      reimbursable,
      taxAmount: 0,
      taxRate: '',
      distance: null, distanceUnit: null, distanceRate: null,
      hours: null, hourlyRate: null,
      status: 'unreported',
      violations: [],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_EXPENSE', payload: exp });
    onClose();
  };

  const saveDistance = () => {
    if (!distance) { setValidationError('Distance is required.'); return; }
    setValidationError('');
    const exp = {
      id: 'exp_' + Date.now(),
      type: 'distance',
      policyId: state.currentUser.defaultPolicy || 'pol_001',
      reportId: null,
      createdBy: state.currentUser.id,
      merchant: parseFloat(distance) + ' ' + distUnit + ' mileage',
      amount: distAmount,
      currency: 'USD',
      date: distDate,
      categoryId: 'cat_010',
      category: 'Mileage',
      tagId: null, tag: '',
      description: distDescription,
      comment: '',
      receiptUrl: null, hasReceipt: false,
      billable: false, reimbursable: true,
      taxAmount: 0, taxRate: '',
      distance: parseFloat(distance), distanceUnit: distUnit, distanceRate: distRate,
      hours: null, hourlyRate: null,
      status: 'unreported', violations: [],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_EXPENSE', payload: exp });
    onClose();
  };

  const saveTime = () => {
    if (!hours) { setValidationError('Hours are required.'); return; }
    if (!hourlyRate) { setValidationError('Hourly rate is required.'); return; }
    setValidationError('');
    const exp = {
      id: 'exp_' + Date.now(),
      type: 'time',
      policyId: state.currentUser.defaultPolicy || 'pol_001',
      reportId: null,
      createdBy: state.currentUser.id,
      merchant: hours + ' hours consulting',
      amount: timeAmount,
      currency: 'USD',
      date: timeDate,
      categoryId: timeCategoryId || '', category: getCatName(timeCategoryId),
      tagId: null, tag: '',
      description: timeDescription,
      comment: '',
      receiptUrl: null, hasReceipt: false,
      billable: true, reimbursable: true,
      taxAmount: 0, taxRate: '',
      distance: null, distanceUnit: null, distanceRate: null,
      hours: parseFloat(hours), hourlyRate: Math.round(parseFloat(hourlyRate) * 100),
      status: 'unreported', violations: [],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_EXPENSE', payload: exp });
    onClose();
  };

  const saveMultiple = () => {
    const filled = multiRows.filter(r => r.merchant.trim());
    if (filled.length === 0) { setValidationError('Enter at least one expense with a merchant name.'); return; }
    setValidationError('');
    filled.forEach(r => {
      const cents = Math.round((parseFloat(r.total) || 0) * 100);
      dispatch({ type: 'ADD_EXPENSE', payload: {
        id: 'exp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        type: 'expense', policyId: state.currentUser.defaultPolicy || 'pol_001', reportId: null, createdBy: state.currentUser.id,
        merchant: r.merchant, amount: cents, currency: 'USD', date: r.date,
        categoryId: r.categoryId, category: getCatName(r.categoryId),
        tagId: null, tag: '', description: r.description, comment: '',
        receiptUrl: null, hasReceipt: false, billable: false, reimbursable: true,
        taxAmount: Math.round((parseFloat(r.tax)||0)*100), taxRate: '',
        distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null,
        status: 'unreported', violations: [],
        createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(),
      }});
    });
    onClose();
  };

  const updateMultiRow = (idx, key, val) => {
    const next = [...multiRows];
    next[idx] = { ...next[idx], [key]: val };
    setMultiRows(next);
  };

  // Clear validation error on tab change
  const switchTab = (t) => { setActiveTab(t); setValidationError(''); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Expense</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-tabs">
          {tabNames.map(t => (
            <button key={t} className={'modal-tab' + (activeTab === t ? ' active' : '')} onClick={() => switchTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {validationError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#D93025', padding: '8px 12px', borderRadius: 4, marginBottom: 12, fontSize: 13 }}>
              {validationError}
            </div>
          )}

          {activeTab === 'expense' && (
            <div>
              <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Merchant <span style={{ color: '#D93025' }}>*</span></label><input className="form-input" placeholder="Merchant name" value={merchant} onChange={e => { setMerchant(e.target.value); if (e.target.value.trim()) setValidationError(''); }} /></div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Amount</label><input className="form-input" type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} /></div>
                <div className="form-group" style={{ width: 100 }}><label className="form-label">Currency</label><select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}><option>USD</option><option>EUR</option><option>GBP</option></select></div>
              </div>
              <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}><option value="">Select category</option>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Tag</label><select className="form-select" value={tagId} onChange={e => setTagId(e.target.value)}><option value="">Select tag</option>{tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} /></div>
              <div className="form-group">
                <label className="form-label">Receipt (optional)</label>
                {receiptUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ color: '#03D47C' }}>Receipt attached</span>
                    <button className="btn-link" style={{ color: '#D93025', fontSize: 12 }} onClick={() => setReceiptUrl(null)}>Remove</button>
                  </div>
                ) : (
                  <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => fileInputRef.current?.click()} disabled={uploadingReceipt}>
                    <Upload size={14} /> {uploadingReceipt ? 'Uploading...' : 'Upload Receipt'}
                  </button>
                )}
                <input ref={fileInputRef} type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={handleReceiptUpload} />
              </div>
              <div className="form-row" style={{ marginBottom: 16 }}>
                <label className="toggle-switch"><span style={{ fontSize: 13 }}>Billable</span><div className={'toggle-track' + (billable ? ' on' : '')} onClick={() => setBillable(!billable)}><div className="toggle-thumb" /></div></label>
                <label className="toggle-switch"><span style={{ fontSize: 13 }}>Reimbursable</span><div className={'toggle-track' + (reimbursable ? ' on' : '')} onClick={() => setReimbursable(!reimbursable)}><div className="toggle-thumb" /></div></label>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveExpense}>Save</button>
            </div>
          )}

          {activeTab === 'distance' && (
            <div>
              <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={distDate} onChange={e => setDistDate(e.target.value)} /></div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Distance <span style={{ color: '#D93025' }}>*</span></label><input className="form-input" type="number" step="0.1" value={distance} onChange={e => { setDistance(e.target.value); if (e.target.value) setValidationError(''); }} /></div>
                <div className="form-group" style={{ width: 80 }}><label className="form-label">Unit</label><select className="form-select" value={distUnit} onChange={e => setDistUnit(e.target.value)}><option value="mi">mi</option><option value="km">km</option></select></div>
              </div>
              <div className="form-group"><label className="form-label">Rate</label><input className="form-input" readOnly value={'$' + (distRate / 100).toFixed(2) + ' / ' + distUnit} /></div>
              <div className="form-group"><label className="form-label">Calculated Amount</label><input className="form-input" readOnly value={'$' + (distAmount / 100).toFixed(2)} /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={distDescription} onChange={e => setDistDescription(e.target.value)} /></div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveDistance}>Save</button>
            </div>
          )}

          {activeTab === 'time' && (
            <div>
              <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={timeDate} onChange={e => setTimeDate(e.target.value)} /></div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Hours <span style={{ color: '#D93025' }}>*</span></label><input className="form-input" type="number" step="0.5" value={hours} onChange={e => { setHours(e.target.value); if (e.target.value) setValidationError(''); }} /></div>
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Hourly Rate ($) <span style={{ color: '#D93025' }}>*</span></label><input className="form-input" type="number" step="0.01" value={hourlyRate} onChange={e => { setHourlyRate(e.target.value); if (e.target.value) setValidationError(''); }} /></div>
              </div>
              <div className="form-group"><label className="form-label">Calculated Amount</label><input className="form-input" readOnly value={'$' + (timeAmount / 100).toFixed(2)} /></div>
              <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={timeCategoryId} onChange={e => setTimeCategoryId(e.target.value)}><option value="">Select category</option>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={timeDescription} onChange={e => setTimeDescription(e.target.value)} /></div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveTime}>Save</button>
            </div>
          )}

          {activeTab === 'multiple' && (
            <div>
              <table className="multi-expense-grid">
                <thead><tr><th>Date</th><th>Merchant</th><th>Total</th><th>Tax</th><th>Category</th><th>Description</th></tr></thead>
                <tbody>
                  {multiRows.map((r, i) => (
                    <tr key={i}>
                      <td><input type="date" value={r.date} onChange={e => updateMultiRow(i, 'date', e.target.value)} /></td>
                      <td><input value={r.merchant} onChange={e => { updateMultiRow(i, 'merchant', e.target.value); if (e.target.value.trim()) setValidationError(''); }} /></td>
                      <td><input type="number" step="0.01" value={r.total} onChange={e => updateMultiRow(i, 'total', e.target.value)} /></td>
                      <td><input type="number" step="0.01" value={r.tax} onChange={e => updateMultiRow(i, 'tax', e.target.value)} /></td>
                      <td><select value={r.categoryId} onChange={e => updateMultiRow(i, 'categoryId', e.target.value)}><option value=""></option>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></td>
                      <td><input value={r.description} onChange={e => updateMultiRow(i, 'description', e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn btn-outline" onClick={() => setMultiRows(Array.from({ length: 10 }, () => ({ date: today(), merchant: '', total: '', tax: '', categoryId: '', description: '' })))}>Reset</button>
                <button className="btn btn-primary" onClick={saveMultiple}>Save</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
