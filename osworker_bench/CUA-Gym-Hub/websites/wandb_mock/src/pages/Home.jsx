import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Lock, Plus, MoreHorizontal, Trash2, Edit2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function EditProjectModal({ project, onSave, onClose }) {
  const [displayName, setDisplayName] = useState(project.displayName);
  const [description, setDescription] = useState(project.description || '');
  const [visibility, setVisibility] = useState(project.visibility);

  const handleSave = () => {
    if (!displayName.trim()) return;
    onSave({ ...project, displayName: displayName.trim(), description, visibility });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <span className="modal-title">Edit Project</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Display Name</label>
          <input
            className="form-input"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            style={{ width: '100%' }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Visibility</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2" style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
              <input type="radio" checked={visibility === 'public'} onChange={() => setVisibility('public')} />
              <Globe size={14} /> Public
            </label>
            <label className="flex items-center gap-2" style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
              <input type="radio" checked={visibility === 'private'} onChange={() => setVisibility('private')} />
              <Lock size={14} /> Private
            </label>
          </div>
        </div>
        <div className="flex gap-2" style={{ marginTop: 16 }}>
          <button className="btn-blue" onClick={handleSave} disabled={!displayName.trim()}>Save Changes</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function DeleteProjectModal({ project, onConfirm, onClose }) {
  const [confirmName, setConfirmName] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <span className="modal-title" style={{ color: 'var(--error-red)' }}>Delete Project</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <p style={{ marginBottom: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
          This will permanently delete the project <strong>"{project.displayName}"</strong> and all its runs, sweeps, artifacts, and reports.
          This action cannot be undone.
        </p>
        <div className="form-group">
          <label className="form-label">Type <strong>{project.name}</strong> to confirm</label>
          <input
            className="form-input"
            style={{ width: '100%', borderColor: confirmName === project.name ? 'var(--error-red)' : undefined }}
            value={confirmName}
            onChange={e => setConfirmName(e.target.value)}
            placeholder={project.name}
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <button
            className="btn-danger"
            onClick={onConfirm}
            disabled={confirmName !== project.name}
            style={{ opacity: confirmName !== project.name ? 0.5 : 1 }}
          >
            Delete Project
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { projects, runs, currentUser } = state;
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', visibility: 'public' });
  const [menuOpen, setMenuOpen] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleCreate = () => {
    const slug = newProject.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (!slug) return;
    const proj = {
      id: `proj-${Date.now()}`,
      name: slug,
      displayName: newProject.name,
      entity: currentUser.defaultEntity,
      description: newProject.description,
      visibility: newProject.visibility,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalRuns: 0,
      totalComputeHours: 0,
      tags: []
    };
    dispatch({ type: 'ADD_PROJECT', payload: proj });
    setShowForm(false);
    setNewProject({ name: '', description: '', visibility: 'public' });
    navigate(`/${proj.entity}/${proj.name}/workspace`);
  };

  const handleEditSave = (updated) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: updated });
    setEditTarget(null);
  };

  const handleDelete = (proj) => {
    dispatch({ type: 'DELETE_PROJECT', payload: proj.id });
    setDeleteTarget(null);
    setMenuOpen(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Your Projects</h1>
        <button className="btn-blue" onClick={() => setShowForm(true)}>
          <Plus size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          New Project
        </button>
      </div>

      {showForm && (
        <div className="card mb-4" style={{ maxWidth: 500 }}>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input
              className="form-input"
              placeholder="my-project"
              value={newProject.name}
              onChange={e => setNewProject({ ...newProject, name: e.target.value })}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Describe your project..."
              value={newProject.description}
              onChange={e => setNewProject({ ...newProject, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Visibility</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2" style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                <input type="radio" name="visibility" value="public" checked={newProject.visibility === 'public'} onChange={() => setNewProject({ ...newProject, visibility: 'public' })} />
                <Globe size={14} /> Public
              </label>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                <input type="radio" name="visibility" value="private" checked={newProject.visibility === 'private'} onChange={() => setNewProject({ ...newProject, visibility: 'private' })} />
                <Lock size={14} /> Private
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-blue" onClick={handleCreate}>Create</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {projects.map(proj => {
          const projRuns = runs.filter(r => r.projectId === proj.id);
          return (
            <div
              key={proj.id}
              className="card"
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={() => { if (menuOpen !== proj.id) navigate(`/${proj.entity}/${proj.name}/workspace`); }}
            >
              {/* Project menu */}
              <div
                style={{ position: 'absolute', top: 8, right: 8 }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setMenuOpen(menuOpen === proj.id ? null : proj.id)}
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4 }}
                  title="Project settings"
                >
                  <MoreHorizontal size={14} />
                </button>
                {menuOpen === proj.id && (
                  <div className="dropdown-panel" style={{ position: 'absolute', top: 24, right: 0, zIndex: 50, minWidth: 150 }}>
                    <button
                      className="dropdown-item flex items-center gap-2"
                      style={{ padding: '6px 12px', width: '100%', textAlign: 'left', fontSize: 13, cursor: 'pointer' }}
                      onClick={() => { setEditTarget(proj); setMenuOpen(null); }}
                    >
                      <Edit2 size={13} /> Edit project
                    </button>
                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '2px 0' }} />
                    <button
                      className="dropdown-item flex items-center gap-2"
                      style={{ padding: '6px 12px', width: '100%', textAlign: 'left', fontSize: 13, cursor: 'pointer', color: 'var(--error-red)' }}
                      onClick={() => { setDeleteTarget(proj); setMenuOpen(null); }}
                    >
                      <Trash2 size={13} /> Delete project
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-2" style={{ paddingRight: 24 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{proj.displayName}</span>
                {proj.visibility === 'private' ? <Lock size={14} color="var(--text-muted)" /> : <Globe size={14} color="var(--text-muted)" />}
              </div>
              <div className="text-muted text-small mb-2">{proj.entity}</div>
              <p className="text-muted text-small mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {proj.description}
              </p>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {proj.tags.map(tag => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-muted text-small">
                <span>{projRuns.length} runs</span>
                <span>{timeAgo(proj.updatedAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {editTarget && (
        <EditProjectModal
          project={editTarget}
          onSave={handleEditSave}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteProjectModal
          project={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
