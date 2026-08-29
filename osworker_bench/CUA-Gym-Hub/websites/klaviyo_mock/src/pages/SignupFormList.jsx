import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function SignupFormList() {
  const { state, updateEntity, addEntity } = useAppContext();
  const [selectedForm, setSelectedForm] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [newFormType, setNewFormType] = useState('popup');
  const [newFormTargetList, setNewFormTargetList] = useState(state.lists[0]?.id || '');

  const formatPercent = (n) => (n * 100).toFixed(1) + '%';
  const form = selectedForm ? state.signupForms.find(f => f.id === selectedForm) : null;
  const targetList = form ? state.lists.find(l => l.id === form.targetListId) : null;

  if (form) {
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-secondary" onClick={() => setSelectedForm(null)} style={{ fontSize: 13 }}>&larr; Back to Sign-up forms</button>
        </div>
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="page-title">{form.name}</h1>
            <span className={`badge badge-${form.status}`}>{form.status.charAt(0).toUpperCase() + form.status.slice(1)}</span>
          </div>
          <label className="toggle" onClick={() => updateEntity('signupForms', form.id, { status: form.status === 'live' ? 'draft' : 'live' })}>
            <div className={`toggle-switch ${form.status === 'live' ? 'active' : ''}`}></div>
            {form.status === 'live' ? 'Live' : 'Draft'}
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{form.views.toLocaleString()}</div>
            <div className="text-muted" style={{ fontSize: 13 }}>Views</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{form.submissions.toLocaleString()}</div>
            <div className="text-muted" style={{ fontSize: 13 }}>Submissions</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{formatPercent(form.conversionRate)}</div>
            <div className="text-muted" style={{ fontSize: 13 }}>Conversion Rate</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Form Preview</div>
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: 32, textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>{form.config?.title || 'Sign Up'}</h3>
            <p className="text-muted" style={{ marginBottom: 16 }}>{form.config?.description || ''}</p>
            {(form.config?.fields || ['email']).map(field => (
              <input key={field} type="text" placeholder={field.charAt(0).toUpperCase() + field.slice(1)} style={{ display: 'block', margin: '0 auto 8px', width: 280, padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 4 }} readOnly />
            ))}
            <button className="btn btn-primary" style={{ marginTop: 8 }}>{form.config?.buttonText || 'Sign Up'}</button>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="text-muted" style={{ fontSize: 13 }}>Type: <strong>{form.type}</strong></div>
            <div className="text-muted" style={{ fontSize: 13 }}>Target list: <strong>{targetList?.name || 'Unknown'}</strong></div>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateForm = () => {
    if (!newFormName.trim()) return;
    const newForm = {
      id: `form_${Date.now()}`,
      name: newFormName,
      type: newFormType,
      status: 'draft',
      targetListId: newFormTargetList,
      views: 0,
      submissions: 0,
      conversionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: { title: newFormName, description: '', fields: ['email'], buttonText: 'Sign Up' }
    };
    addEntity('signupForms', newForm);
    setNewFormName('');
    setShowCreateModal(false);
    setSelectedForm(newForm.id);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sign-up forms</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>Create sign-up form</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Form name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Target List</th>
              <th>Views</th>
              <th>Submissions</th>
              <th>Conversion rate</th>
            </tr>
          </thead>
          <tbody>
            {state.signupForms.map(form => {
              const list = state.lists.find(l => l.id === form.targetListId);
              return (
                <tr key={form.id}>
                  <td><span className="clickable" onClick={() => setSelectedForm(form.id)}>{form.name}</span></td>
                  <td><span className="badge badge-scheduled" style={{ textTransform: 'capitalize' }}>{form.type}</span></td>
                  <td><span className={`badge badge-${form.status}`}>{form.status.charAt(0).toUpperCase() + form.status.slice(1)}</span></td>
                  <td className="text-muted">{list?.name || '—'}</td>
                  <td>{form.views.toLocaleString()}</td>
                  <td>{form.submissions.toLocaleString()}</td>
                  <td>{formatPercent(form.conversionRate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create Sign-up Form</div>
            <div className="form-group">
              <label>Form name</label>
              <input type="text" value={newFormName} onChange={e => setNewFormName(e.target.value)} placeholder="Enter form name" autoFocus />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={newFormType} onChange={e => setNewFormType(e.target.value)}>
                <option value="popup">Popup</option>
                <option value="embedded">Embedded</option>
                <option value="flyout">Flyout</option>
                <option value="full_page">Full Page</option>
              </select>
            </div>
            <div className="form-group">
              <label>Target list</label>
              <select value={newFormTargetList} onChange={e => setNewFormTargetList(e.target.value)}>
                {state.lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateForm}>Create Form</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
