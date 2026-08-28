import React, { useState } from 'react';
import { Plus, Edit3, Trash2, X, Pause, Play, ExternalLink, Copy, Code } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SignupForms() {
  const { state, updateState, addToast } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', type: 'embedded' });
  const [showEmbed, setShowEmbed] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = () => {
    if (!newForm.name.trim()) return;
    const form = {
      id: `form_${Date.now()}`,
      name: newForm.name.trim(),
      type: newForm.type,
      status: 'active',
      views: 0,
      submissions: 0,
      conversionRate: 0,
      audienceId: 'aud_1',
      createdAt: new Date().toISOString()
    };
    updateState(s => ({ ...s, signupForms: [...(s.signupForms || []), form] }));
    addToast('Signup form created');
    setShowCreate(false);
    setNewForm({ name: '', type: 'embedded' });
  };

  const toggleStatus = (form) => {
    const newStatus = form.status === 'active' ? 'paused' : 'active';
    updateState(s => ({
      ...s,
      signupForms: s.signupForms.map(f => f.id === form.id ? { ...f, status: newStatus } : f)
    }));
    addToast(`Form ${newStatus === 'active' ? 'activated' : 'paused'}`);
  };

  const handleDelete = (id) => {
    updateState(s => ({ ...s, signupForms: s.signupForms.filter(f => f.id !== id) }));
    addToast('Signup form deleted');
    setDeleteConfirm(null);
  };

  const embedCode = (form) => `<div id="mc-embed-${form.id}"></div>\n<script src="https://mailchi.mp/acme/embed.js" data-form="${form.id}"></script>`;

  return (
    <div>
      <div className="page-header">
        <h1>Signup Forms</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Form</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {(state.signupForms || []).map(form => (
          <div key={form.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{form.name}</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge badge-${form.status}`}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', marginRight: 4, background: form.status === 'active' ? '#2E7D32' : '#E65100' }} />
                    {form.status}
                  </span>
                  <span className="badge" style={{ background: '#F0F0F0', color: '#707070' }}>{form.type}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => toggleStatus(form)} style={{ background: 'none', border: 'none', color: '#707070', cursor: 'pointer', padding: 4 }} title={form.status === 'active' ? 'Pause' : 'Activate'}>
                  {form.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button onClick={() => setDeleteConfirm(form)} style={{ background: 'none', border: 'none', color: '#D5432F', cursor: 'pointer', padding: 4 }} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ textAlign: 'center', padding: 8, background: '#F6F6F4', borderRadius: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{form.views.toLocaleString()}</div>
                <div className="text-xs text-muted">Views</div>
              </div>
              <div style={{ textAlign: 'center', padding: 8, background: '#F6F6F4', borderRadius: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{form.submissions.toLocaleString()}</div>
                <div className="text-xs text-muted">Signups</div>
              </div>
              <div style={{ textAlign: 'center', padding: 8, background: '#F6F6F4', borderRadius: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{form.conversionRate}%</div>
                <div className="text-xs text-muted">Rate</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm btn-outlined" style={{ flex: 1 }} onClick={() => setShowEmbed(form)}>
                <Code size={12} /> Embed Code
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Signup Form</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Form Name</label>
                <input value={newForm.name} onChange={e => setNewForm({ ...newForm, name: e.target.value })} placeholder="e.g., Homepage Signup" autoFocus />
              </div>
              <div className="form-group">
                <label>Form Type</label>
                <select value={newForm.type} onChange={e => setNewForm({ ...newForm, type: e.target.value })}>
                  <option value="embedded">Embedded Form</option>
                  <option value="popup">Popup Form</option>
                  <option value="inline">Inline Form</option>
                </select>
              </div>
              <div className="form-group">
                <label>Audience</label>
                <select defaultValue="aud_1">
                  {state.audiences.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={!newForm.name.trim()}>Create Form</button>
            </div>
          </div>
        </div>
      )}

      {/* Embed Code Modal */}
      {showEmbed && (
        <div className="modal-overlay" onClick={() => setShowEmbed(null)}>
          <div className="modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Embed Code</h2>
              <button onClick={() => setShowEmbed(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-muted mb-16">Copy and paste this code into your website to display the signup form.</p>
              <pre style={{ background: '#F6F6F4', padding: 16, borderRadius: 8, fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6 }}>
                {embedCode(showEmbed)}
              </pre>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => { navigator.clipboard?.writeText(embedCode(showEmbed)); addToast('Code copied to clipboard'); }}>
                <Copy size={14} /> Copy Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Signup Form</h2></div>
            <div className="modal-body"><p>Delete "{deleteConfirm.name}"? This will remove the form from any pages where it is embedded.</p></div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
