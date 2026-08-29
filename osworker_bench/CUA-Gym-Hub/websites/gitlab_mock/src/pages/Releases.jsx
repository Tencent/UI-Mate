import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp, ACTIONS } from '../context/AppContext.jsx';
import { Plus, Package } from 'lucide-react';
import { renderMarkdown } from '../utils/markdown.js';
import { timeAgo } from '../utils/dataManager.js';

export default function Releases() {
  const { group, project: projectSlug } = useParams();
  const { state, dispatch } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ tagName: '', title: '', description: '' });

  const proj = state.projects.find(p => p.fullPath === `${group}/${projectSlug}`);
  if (!proj) return <div>Project not found</div>;

  const releases = state.releases
    .filter(r => r.projectId === proj.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const tags = state.tags.filter(t => t.projectId === proj.id);
  const getUser = id => state.users.find(u => u.id === id);

  const handleCreate = () => {
    if (!form.tagName.trim() || !form.title.trim()) return;
    dispatch({
      type: ACTIONS.CREATE_RELEASE,
      payload: { projectId: proj.id, tagName: form.tagName, title: form.title, description: form.description, authorId: state.currentUser.id }
    });
    setForm({ tagName: '', title: '', description: '' });
    setShowCreate(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Releases</h1>
        <button className="gl-btn gl-btn-primary" onClick={() => setShowCreate(v => !v)}>
          <Plus size={14} /> New release
        </button>
      </div>

      {showCreate && (
        <div style={{ border: '1px solid var(--gl-border)', borderRadius: 6, padding: 16, marginBottom: 20, background: '#fff' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>New release</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Tag *</label>
              <select value={form.tagName} onChange={e => setForm(f => ({ ...f, tagName: e.target.value }))}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14 }}>
                <option value="">Select a tag</option>
                {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Release title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. v1.0.0 - First Release"
                style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Release notes (Markdown)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="## What's new..."
              style={{ width: '100%', minHeight: 120, padding: '7px 10px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="gl-btn gl-btn-primary gl-btn-sm" onClick={handleCreate} disabled={!form.tagName || !form.title.trim()}>Create release</button>
            <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      {releases.length === 0 ? (
        <div className="gl-empty-state">
          <Package size={40} style={{ color: 'var(--gl-text-tertiary)' }} />
          <div className="gl-empty-state-title">No releases</div>
          <div className="gl-empty-state-desc">Releases are based on Git tags. Create a release to share assets with your users.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {releases.map(rel => (
            <div key={rel.id} style={{ border: '1px solid var(--gl-border)', borderRadius: 6, background: '#fff', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gl-border)', background: 'var(--gl-bg-secondary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Package size={18} style={{ color: 'var(--gl-purple)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{rel.title}</h2>
                  <div style={{ fontSize: 12, color: 'var(--gl-text-secondary)', marginTop: 2 }}>
                    <span style={{ fontFamily: 'var(--gl-font-mono)', background: 'var(--gl-bg-tertiary)', padding: '1px 6px', borderRadius: 3 }}>{rel.tagName}</span>
                    {' · Released by '}{getUser(rel.authorId)?.name}
                    {' · '}{timeAgo(rel.createdAt)}
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {rel.description ? (
                  <div className="gl-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(rel.description) }} />
                ) : (
                  <span style={{ color: 'var(--gl-text-secondary)', fontStyle: 'italic' }}>No release notes.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
