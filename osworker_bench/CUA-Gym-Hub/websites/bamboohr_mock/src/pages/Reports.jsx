import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Play, X } from 'lucide-react';

function CreateCustomReportModal({ state, dispatch, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!name.trim()) { setError('Report name is required.'); return; }
    const reports = state.reports || [];
    const nextId = Math.max(0, ...reports.map(r => r.id)) + 1;
    dispatch({
      type: 'ADD_REPORT',
      report: {
        id: nextId,
        name: name.trim(),
        description: description.trim() || 'Custom report',
        category: 'custom',
        lastRunAt: null
      }
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 480 }}>
        <div className="modal-header">
          <h2>Create Custom Report</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div className="form-group">
          <label className="form-label">Report Name *</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Q1 Headcount by Department" />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this report show?" style={{ minHeight: 80 }} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Create Report</button>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const { state, dispatch } = useApp();
  const [searchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const sid = searchParams.get('sid');
  const navTo = (path) => sid ? `${path}?sid=${sid}` : path;

  const standardReports = (state.reports || []).filter(r => r.category === 'standard');
  const customReports = (state.reports || []).filter(r => r.category === 'custom');

  return (
    <div style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #E0E0E0', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 18, padding: '14px 0', flex: 1 }}>Reports</span>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={14} /> Create Custom Report</button>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: '#333' }}>Standard Reports</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {standardReports.map(report => (
              <div key={report.id} style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: 4, padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <Link to={navTo(`/reports/${report.id}`)} style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>{report.name}</Link>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4, lineHeight: 1.4 }}>{report.description}</div>
                </div>
                {report.lastRunAt && (
                  <div style={{ fontSize: 11, color: '#ccc' }}>Last run: {report.lastRunAt}</div>
                )}
                <div>
                  <Link to={navTo(`/reports/${report.id}`)} className="btn btn-primary" style={{ fontSize: 12, padding: '5px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Play size={11} /> Run Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {customReports.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: '#333' }}>Custom Reports</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {customReports.map(report => (
                <div key={report.id} style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: 4, padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <Link to={navTo(`/reports/${report.id}`)} style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>{report.name}</Link>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{report.description}</div>
                  </div>
                  {report.lastRunAt && (
                    <div style={{ fontSize: 11, color: '#ccc' }}>Last run: {report.lastRunAt}</div>
                  )}
                  <Link to={navTo(`/reports/${report.id}`)} className="btn btn-primary" style={{ fontSize: 12, padding: '5px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                    <Play size={11} /> Run Report
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {showCreateModal && <CreateCustomReportModal state={state} dispatch={dispatch} onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
