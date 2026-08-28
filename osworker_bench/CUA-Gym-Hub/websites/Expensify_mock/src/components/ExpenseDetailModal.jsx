import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Receipt } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSessionId } from '../utils/dataManager';

export default function ExpenseDetailModal({ expense, onClose }) {
  const { state, dispatch } = useApp();
  // Store amount as dollars for editing; convert to/from cents on save/load
  const [form, setForm] = useState({ ...expense, amountDollars: (expense.amount / 100).toFixed(2) });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState('');
  const fileInputRef = useRef(null);
  const cats = state.categories.filter(c => c.enabled);
  const tags = state.tags.filter(t => t.enabled);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const save = () => {
    const cat = state.categories.find(c => c.id === form.categoryId);
    const tag = state.tags.find(t => t.id === form.tagId);
    const amountCents = Math.round((parseFloat(form.amountDollars) || 0) * 100);
    dispatch({ type: 'UPDATE_EXPENSE', payload: {
      ...form,
      amount: amountCents,
      category: cat ? cat.name : form.category,
      tag: tag ? tag.name : form.tag,
      modifiedAt: new Date().toISOString(),
    }});
    // Update parent report totals if expense is in a report
    if (form.reportId) {
      const report = state.reports.find(r => r.id === form.reportId);
      if (report) {
        const otherExpenses = state.expenses.filter(e => e.reportId === form.reportId && e.id !== form.id);
        const newTotal = otherExpenses.reduce((s, e) => s + e.amount, 0) + amountCents;
        dispatch({ type: 'UPDATE_REPORT', payload: { id: form.reportId, total: newTotal, modifiedAt: new Date().toISOString() } });
      }
    }
    onClose();
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_EXPENSE', payload: form.id });
    onClose();
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingReceipt(true);
    setReceiptError('');
    try {
      const sid = getSessionId();
      const formData = new FormData();
      formData.append('file', file);
      const url = sid ? '/upload?sid=' + encodeURIComponent(sid) : '/upload';
      const res = await fetch(url, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (data.files && data.files[0]) {
        const fileUrl = data.files[0].url;
        setForm(f => ({ ...f, receiptUrl: fileUrl, hasReceipt: true }));
      }
    } catch (err) {
      setReceiptError('Upload failed: ' + err.message);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const report = form.reportId ? state.reports.find(r => r.id === form.reportId) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Expense Detail</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {showDeleteConfirm ? (
            <div>
              <p style={{ marginBottom: 20, fontSize: 15 }}>Are you sure you want to delete the expense <strong>{form.merchant}</strong>? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Delete</button>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="form-group"><label className="form-label">Merchant</label><input className="form-input" value={form.merchant} onChange={e => update('merchant', e.target.value)} /></div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Amount ($)</label><input className="form-input" type="number" step="0.01" value={form.amountDollars} onChange={e => update('amountDollars', e.target.value)} /></div>
                <div className="form-group" style={{ width: 100 }}><label className="form-label">Currency</label>
                  <select className="form-select" value={form.currency} onChange={e => update('currency', e.target.value)}>
                    <option>USD</option><option>EUR</option><option>GBP</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={e => update('date', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-select" value={form.categoryId} onChange={e => update('categoryId', e.target.value)}>
                  <option value="">Select category</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Tag</label>
                <select className="form-select" value={form.tagId || ''} onChange={e => update('tagId', e.target.value || null)}>
                  <option value="">No tag</option>
                  {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={form.description} onChange={e => update('description', e.target.value)} /></div>
              <div className="form-row" style={{ marginBottom: 16 }}>
                <label className="toggle-switch"><span style={{ fontSize: 13 }}>Billable</span><div className={'toggle-track' + (form.billable ? ' on' : '')} onClick={() => update('billable', !form.billable)}><div className="toggle-thumb" /></div></label>
                <label className="toggle-switch"><span style={{ fontSize: 13 }}>Reimbursable</span><div className={'toggle-track' + (form.reimbursable ? ' on' : '')} onClick={() => update('reimbursable', !form.reimbursable)}><div className="toggle-thumb" /></div></label>
              </div>
              <div className="form-group">
                <label className="form-label">Receipt</label>
                {form.receiptUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <a href={form.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary-blue)', fontSize: 13, textDecoration: 'none' }}>
                      <Receipt size={16} /> View Receipt
                    </a>
                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => { update('receiptUrl', null); update('hasReceipt', false); }}>Remove</button>
                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => fileInputRef.current?.click()}>Replace</button>
                  </div>
                ) : (
                  <div>
                    <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => fileInputRef.current?.click()} disabled={uploadingReceipt}>
                      <Upload size={14} /> {uploadingReceipt ? 'Uploading...' : 'Upload Receipt'}
                    </button>
                    {receiptError && <div style={{ color: '#D93025', fontSize: 12, marginTop: 4 }}>{receiptError}</div>}
                  </div>
                )}
                <input ref={fileInputRef} type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={handleReceiptUpload} />
              </div>
              {report && <div className="form-group"><label className="form-label">Report</label><div style={{ fontSize: 14 }}>{report.title} #{report.reportNumber}</div></div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Save</button>
                <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>Delete</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
