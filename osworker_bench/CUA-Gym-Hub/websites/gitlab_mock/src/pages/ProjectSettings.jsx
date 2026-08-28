import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, ACTIONS } from '../context/AppContext.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function ProjectSettings() {
  const { group, project: projectSlug } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const proj = state.projects.find(p => p.fullPath === `${group}/${projectSlug}`);

  const [form, setForm] = useState(proj ? {
    name: proj.name,
    description: proj.description || '',
    topics: (proj.topics || []).join(', '),
    visibility: proj.visibility,
  } : {});
  const [features, setFeatures] = useState(proj?.features || {});
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!proj) return <div>Project not found</div>;

  const handleSave = () => {
    dispatch({
      type: ACTIONS.UPDATE_PROJECT_SETTINGS,
      payload: {
        projectId: proj.id,
        settings: {
          name: form.name,
          description: form.description,
          topics: form.topics.split(',').map(t => t.trim()).filter(Boolean),
          visibility: form.visibility,
          features,
        }
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = () => {
    if (deleteConfirm !== proj.name) { setDeleteError('Project name does not match.'); setTimeout(() => setDeleteError(''), 3000); return; }
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    dispatch({ type: ACTIONS.DELETE_PROJECT, payload: { projectId: proj.id } });
    setShowDeleteDialog(false);
    navigate('/');
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>General settings</h1>

      {saved && (
        <div style={{ padding: '10px 16px', background: 'var(--gl-success-bg)', color: 'var(--gl-success)', borderRadius: 6, marginBottom: 16, fontWeight: 600 }}>
          Settings saved successfully!
        </div>
      )}

      {/* Naming & description */}
      <div style={{ border: '1px solid var(--gl-border)', borderRadius: 6, padding: 20, marginBottom: 20, background: '#fff' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>Naming, topics, avatar</h2>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Project name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Project description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Topics (comma-separated)</label>
          <input value={form.topics} onChange={e => setForm(f => ({ ...f, topics: e.target.value }))}
            placeholder="react, typescript, vite"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Visibility level</label>
          <div style={{ display: 'flex', gap: 16 }}>
            {['private', 'internal', 'public'].map(v => (
              <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                <input type="radio" name="visibility" value={v} checked={form.visibility === v} onChange={() => setForm(f => ({ ...f, visibility: v }))} />
                <span style={{ textTransform: 'capitalize' }}>{v}</span>
              </label>
            ))}
          </div>
        </div>
        <button className="gl-btn gl-btn-primary" onClick={handleSave}>Save changes</button>
      </div>

      {/* Features toggles */}
      <div style={{ border: '1px solid var(--gl-border)', borderRadius: 6, padding: 20, marginBottom: 20, background: '#fff' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>Visibility, project features, permissions</h2>
        {Object.entries(features).map(([key, val]) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={val} onChange={e => setFeatures(f => ({ ...f, [key]: e.target.checked }))} />
            <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
          </label>
        ))}
        <button className="gl-btn gl-btn-primary gl-btn-sm" onClick={handleSave}>Save changes</button>
      </div>

      {/* Danger zone */}
      <div style={{ border: '2px solid var(--gl-danger)', borderRadius: 6, padding: 20, background: '#fff' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gl-danger)', marginBottom: 16, marginTop: 0 }}>Danger zone</h2>
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 14, color: 'var(--gl-text-secondary)', margin: '0 0 10px' }}>
            This action deletes <strong>{proj.name}</strong> and everything it contains. There is no undo.
          </p>
          <p style={{ fontSize: 14, margin: '0 0 8px' }}>Please type <strong>{proj.name}</strong> to confirm:</p>
          <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
            placeholder={proj.name}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
          {deleteError && (
            <div style={{ color: 'var(--gl-danger)', fontSize: 13, marginBottom: 10, fontWeight: 600 }}>{deleteError}</div>
          )}
          <button className="gl-btn gl-btn-danger" onClick={handleDelete} disabled={deleteConfirm !== proj.name}>
            Delete project
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete project"
        message={`Delete ${proj.name} and all local sandbox data for this project? This cannot be undone.`}
        confirmText="Delete project"
        onConfirm={confirmDelete}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
