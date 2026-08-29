import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp, ACTIONS } from '../context/AppContext.jsx';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Labels() {
  const { group, project: projectSlug } = useParams();
  const { state, dispatch } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#6B4FBB', description: '' });
  const [pendingDelete, setPendingDelete] = useState(null);

  const proj = state.projects.find(p => p.fullPath === `${group}/${projectSlug}`);
  if (!proj) return <div>Project not found</div>;

  const labels = state.labels.filter(l => l.projectId === proj.id);
  const PRESET_COLORS = ['#DD2B0E', '#FC6D26', '#C17D10', '#108548', '#1F75CB', '#6B4FBB', '#74717A', '#E24329'];

  const handleCreate = () => {
    if (!form.name.trim()) return;
    dispatch({ type: ACTIONS.CREATE_LABEL, payload: { projectId: proj.id, name: form.name.trim(), color: form.color, description: form.description } });
    setForm({ name: '', color: '#6B4FBB', description: '' });
    setShowCreate(false);
  };

  const handleUpdate = (id) => {
    dispatch({ type: ACTIONS.UPDATE_LABEL, payload: { id, name: form.name, color: form.color, description: form.description } });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    const label = labels.find(l => l.id === id);
    setPendingDelete(label || { id, name: 'this label' });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    dispatch({ type: ACTIONS.DELETE_LABEL, payload: { labelId: pendingDelete.id } });
    setPendingDelete(null);
  };

  const startEdit = (label) => {
    setForm({ name: label.name, color: label.color, description: label.description || '' });
    setEditingId(label.id);
    setShowCreate(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Labels <span style={{ color: 'var(--gl-text-secondary)', fontWeight: 400 }}>{labels.length}</span></h1>
        <button className="gl-btn gl-btn-primary" onClick={() => { setShowCreate(v => !v); setEditingId(null); setForm({ name: '', color: '#6B4FBB', description: '' }); }}>
          <Plus size={14} /> New label
        </button>
      </div>

      {(showCreate || editingId !== null) && (
        <div style={{ border: '1px solid var(--gl-border)', borderRadius: 6, padding: 16, marginBottom: 20, background: '#fff' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>{editingId ? 'Edit label' : 'Create label'}</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Label name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. bug"
                style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 2, minWidth: 200 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional"
                style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  aria-label={`Use color ${c}`}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #333' : '3px solid transparent', cursor: 'pointer', outline: 'none' }} />
              ))}
              <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                style={{ width: 32, height: 28, padding: 2, border: '1px solid var(--gl-border)', borderRadius: 4, cursor: 'pointer' }} />
              <span style={{ fontSize: 13, padding: '3px 10px', background: form.color + '22', color: form.color, border: `1px solid ${form.color}55`, borderRadius: 12 }}>{form.name || 'preview'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="gl-btn gl-btn-primary gl-btn-sm" onClick={editingId ? () => handleUpdate(editingId) : handleCreate} disabled={!form.name.trim()}>
              {editingId ? 'Save changes' : 'Create label'}
            </button>
            <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => { setShowCreate(false); setEditingId(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {labels.length === 0 ? (
        <div className="gl-empty-state">
          <div className="gl-empty-state-title">No labels yet</div>
          <div className="gl-empty-state-desc">Labels help you organize and prioritize your issues and merge requests.</div>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--gl-border)', borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
          {labels.map((label, i) => (
            <div key={label.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < labels.length - 1 ? '1px solid var(--gl-border-light)' : 'none' }}>
              <span style={{ padding: '4px 12px', background: label.color + '22', color: label.color, border: `1px solid ${label.color}55`, borderRadius: 12, fontWeight: 600, fontSize: 13 }}>{label.name}</span>
              <span style={{ fontSize: 13, color: 'var(--gl-text-secondary)', flex: 1 }}>{label.description}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="gl-btn gl-btn-ghost gl-btn-sm" onClick={() => startEdit(label)} aria-label={`Edit ${label.name}`}><Edit2 size={13} /></button>
                <button className="gl-btn gl-btn-ghost gl-btn-sm" style={{ color: 'var(--gl-danger)' }} onClick={() => handleDelete(label.id)} aria-label={`Delete ${label.name}`}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete label"
        message={`Delete the "${pendingDelete?.name}" label? Existing issues keep their other metadata.`}
        confirmText="Delete label"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
