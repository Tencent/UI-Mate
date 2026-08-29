import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, ACTIONS } from '../context/AppContext.jsx';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { renderMarkdown } from '../utils/markdown.js';
import { timeAgo } from '../utils/dataManager.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Wiki() {
  const { group, project: projectSlug, slug } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [pendingDelete, setPendingDelete] = useState(null);

  const proj = state.projects.find(p => p.fullPath === `${group}/${projectSlug}`);
  if (!proj) return <div>Project not found</div>;

  const base = `/${group}/${projectSlug}`;
  const pages = state.wikiPages.filter(w => w.projectId === proj.id);
  const currentPage = slug ? pages.find(w => w.slug === slug) : pages.find(w => w.slug === 'home') || pages[0];
  const resolveWikiLink = (href) => {
    if (/^(https?:|mailto:|#|\/)/.test(href)) return href;
    return `${base}/-/wikis/${href.replace(/^\.\//, '').replace(/\.md$/i, '')}`;
  };

  const getUser = id => state.users.find(u => u.id === id);

  const handleSave = () => {
    if (!form.title.trim()) return;
    const slug = form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (creating) {
      dispatch({ type: ACTIONS.CREATE_WIKI_PAGE, payload: { projectId: proj.id, title: form.title, slug, content: form.content, authorId: state.currentUser.id } });
      navigate(`${base}/-/wikis/${slug}`);
    } else {
      dispatch({ type: ACTIONS.UPDATE_WIKI_PAGE, payload: { id: currentPage.id, title: form.title, content: form.content } });
    }
    setEditing(false);
    setCreating(false);
  };

  const handleDelete = (id) => {
    const page = pages.find(p => p.id === id);
    setPendingDelete(page || { id, title: 'this wiki page' });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    dispatch({ type: ACTIONS.DELETE_WIKI_PAGE, payload: { pageId: pendingDelete.id } });
    setPendingDelete(null);
    navigate(`${base}/-/wikis`);
  };

  const startEdit = () => {
    if (!currentPage) return;
    setForm({ title: currentPage.title, content: currentPage.content });
    setEditing(true);
    setCreating(false);
  };

  const startCreate = () => {
    setForm({ title: '', content: '' });
    setCreating(true);
    setEditing(false);
  };

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* Sidebar */}
      <div style={{ width: 200, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gl-text-secondary)' }}>PAGES</span>
          <button className="gl-btn gl-btn-ghost gl-btn-sm" onClick={startCreate} title="New page" aria-label="New wiki page">
            <Plus size={13} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {pages.map(page => (
            <button key={page.id}
              onClick={() => navigate(`${base}/-/wikis/${page.slug}`)}
              style={{ width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: 4, background: currentPage?.id === page.id ? 'var(--gl-bg-hover)' : 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: currentPage?.id === page.id ? 'var(--gl-purple)' : 'var(--gl-text-primary)', fontWeight: currentPage?.id === page.id ? 600 : 400 }}>
              <BookOpen size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              {page.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {creating ? (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>New wiki page</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Page title"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Content (Markdown)</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                style={{ width: '100%', minHeight: 300, padding: '10px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, fontFamily: 'var(--gl-font-mono)', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="gl-btn gl-btn-primary" onClick={handleSave} disabled={!form.title.trim()}>Create page</button>
              <button className="gl-btn gl-btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </div>
        ) : editing && currentPage ? (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Edit: {currentPage.title}</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Content (Markdown)</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                style={{ width: '100%', minHeight: 300, padding: '10px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, fontFamily: 'var(--gl-font-mono)', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="gl-btn gl-btn-primary" onClick={handleSave}>Save changes</button>
              <button className="gl-btn gl-btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : currentPage ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{currentPage.title}</h1>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={startEdit}><Edit2 size={13} /> Edit</button>
                <button className="gl-btn gl-btn-ghost gl-btn-sm" style={{ color: 'var(--gl-danger)' }} onClick={() => handleDelete(currentPage.id)} aria-label={`Delete ${currentPage.title}`}><Trash2 size={13} /></button>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--gl-text-secondary)', marginBottom: 20 }}>
              Last edited by {getUser(currentPage.authorId)?.name} · {timeAgo(currentPage.updatedAt)}
            </div>
            <div className="gl-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(currentPage.content, { resolveLink: resolveWikiLink }) }} />
          </div>
        ) : (
          <div className="gl-empty-state">
            <BookOpen size={40} style={{ color: 'var(--gl-text-tertiary)' }} />
            <div className="gl-empty-state-title">No wiki pages yet</div>
            <div className="gl-empty-state-desc">Create the first page to document your project.</div>
            <button className="gl-btn gl-btn-primary" onClick={startCreate}><Plus size={14} /> Create home page</button>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete wiki page"
        message={`Delete "${pendingDelete?.title}" from the project wiki?`}
        confirmText="Delete page"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
