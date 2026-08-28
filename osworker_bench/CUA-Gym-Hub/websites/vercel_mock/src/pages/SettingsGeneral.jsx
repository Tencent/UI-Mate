import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function SettingsGeneral() {
  const { projectId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const project = state.projects.find(p => p.id === projectId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const [form, setForm] = useState({
    name: project?.name || '',
    framework: project?.framework || 'nextjs',
    buildCommand: project?.buildCommand || '',
    outputDirectory: project?.outputDirectory || '',
    installCommand: project?.installCommand || '',
    rootDirectory: project?.rootDirectory || '',
    nodeVersion: project?.nodeVersion || '20.x',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectId, ...form } });
    dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: {
      type: 'project.updated',
      description: `Updated settings for ${project?.name}`,
      userId: state.currentUser?.id, userName: state.currentUser?.name,
      userAvatar: state.currentUser?.avatar, projectId, projectName: project?.name, metadata: {},
    }});
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    if (deleteConfirm !== project?.name) return;
    dispatch({ type: 'DELETE_PROJECT', payload: projectId });
    dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: {
      type: 'project.removed',
      description: `Deleted project ${project?.name}`,
      userId: state.currentUser?.id, userName: state.currentUser?.name,
      userAvatar: state.currentUser?.avatar, projectId: null, projectName: project?.name, metadata: {},
    }});
    navigate('/');
  };

  if (!project) return <p style={{ color: 'var(--fg-muted)' }}>Project not found.</p>;

  return (
    <div>
      {saved && (
        <div style={{ marginBottom: 16, padding: '10px 16px', background: '#dafbe8', border: '1px solid #0a7362', borderRadius: 'var(--radius)', color: '#0a7362', fontSize: 14 }}>
          Settings saved successfully.
        </div>
      )}

      <div className="settings-section">
        <div className="settings-section-title">Project Name</div>
        <div className="settings-section-desc">Used to identify your Project on the Dashboard, Xercel CLI, and in the URL of your Deployments.</div>
        <div className="settings-row">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Framework Preset</div>
        <div className="settings-section-desc">Select the framework your project uses. This will configure the build settings accordingly.</div>
        <div className="settings-row">
          <select value={form.framework} onChange={e => setForm(f => ({ ...f, framework: e.target.value }))}>
            <option value="nextjs">Next.js</option>
            <option value="vite">Vite</option>
            <option value="remix">Remix</option>
            <option value="astro">Astro</option>
            <option value="nuxt">Nuxt</option>
            <option value="sveltekit">SvelteKit</option>
            <option value="gatsby">Gatsby</option>
            <option value="static">Other</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Build & Output Settings</div>
        <div className="settings-section-desc">Configure the build command and output directory for your project.</div>
        {[
          { label: 'Build Command', key: 'buildCommand', placeholder: 'e.g. npm run build' },
          { label: 'Output Directory', key: 'outputDirectory', placeholder: 'e.g. .next' },
          { label: 'Install Command', key: 'installCommand', placeholder: 'e.g. npm install' },
          { label: 'Root Directory', key: 'rootDirectory', placeholder: './ (repository root)' },
        ].map(({ label, key, placeholder }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--fg-secondary)', marginBottom: 6 }}>{label}</div>
            <div className="settings-row">
              <input
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}
              />
            </div>
          </div>
        ))}
        <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Node.js Version</div>
        <div className="settings-section-desc">The Node.js version used during the build step.</div>
        <div className="settings-row">
          <select value={form.nodeVersion} onChange={e => setForm(f => ({ ...f, nodeVersion: e.target.value }))}>
            <option value="18.x">18.x</option>
            <option value="20.x">20.x (Recommended)</option>
            <option value="22.x">22.x</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Project ID</div>
        <div className="code-block" style={{ userSelect: 'all' }}>{project.id}</div>
      </div>

      <div className="settings-section">
        <div className="danger-zone">
          <div className="danger-zone-title">Delete Project</div>
          <p style={{ fontSize: 14, color: 'var(--fg-secondary)', marginBottom: 16 }}>
            Permanently delete this project and all of its deployments. This action is not reversible, so please continue with caution.
          </p>
          <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
            Delete Project
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title" style={{ color: 'var(--error)' }}>Delete Project</h3>
            <p className="modal-desc">
              This will permanently delete <strong>{project.name}</strong> and all its deployments.
              Type <strong>{project.name}</strong> to confirm.
            </p>
            <input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder={project.name}
              style={{ width: '100%', marginBottom: 16 }}
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button
                className="btn btn-danger"
                disabled={deleteConfirm !== project.name}
                onClick={handleDelete}
                style={{ opacity: deleteConfirm !== project.name ? 0.5 : 1 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
