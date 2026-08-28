import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, ACTIONS } from '../context/AppContext.jsx';
import TopBar from '../components/TopBar.jsx';

const COLORS = ['#6B4FBB', '#FC6D26', '#108548', '#1F75CB', '#E24329', '#C17D10'];

export default function NewProject() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', visibility: 'private', groupId: 'g1', avatarColor: '#6B4FBB' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Project name is required';
    if (form.name.length > 100) e.name = 'Too long';
    if (!/^[a-zA-Z0-9_.-]/.test(form.name)) e.name = 'Must start with a letter, digit, underscore, or dash';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    const group = state.groups.find(g => g.id === form.groupId);
    const slug = form.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_.]/g, '');
    const fullPath = group ? `${group.path}/${slug}` : slug;
    dispatch({
      type: ACTIONS.CREATE_PROJECT,
      payload: {
        id: `p${Date.now()}`,
        name: slug,
        fullPath,
        groupId: form.groupId,
        description: form.description,
        language: null,
        languageColor: null,
        visibility: form.visibility,
        stars: 0,
        forks: 0,
        isStarred: false,
        defaultBranch: 'main',
        topics: [],
        avatarColor: form.avatarColor,
        features: { issues: true, mergeRequests: true, wiki: true, snippets: true, pipelines: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readme: `# ${form.name}\n\n${form.description}`,
      }
    });
    navigate(`/${fullPath}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--gl-bg-secondary)', padding: 24 }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Create new project</h1>
          <p style={{ color: 'var(--gl-text-secondary)', marginBottom: 24, fontSize: 14 }}>A project is where you store your code, access issues, wiki and other features.</p>

          <div style={{ background: '#fff', border: '1px solid var(--gl-border)', borderRadius: 6, padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Project name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="my-awesome-project"
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${errors.name ? 'var(--gl-danger)' : 'var(--gl-border)'}`, borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
              {errors.name && <div style={{ color: 'var(--gl-danger)', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Group / namespace</label>
              <select value={form.groupId} onChange={e => setForm(f => ({ ...f, groupId: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14 }}>
                {state.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Project description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
                rows={3}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Visibility level</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {['private', 'internal', 'public'].map(v => (
                  <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="visibility" value={v} checked={form.visibility === v} onChange={() => setForm(f => ({ ...f, visibility: v }))} />
                    <span style={{ textTransform: 'capitalize' }}>{v}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Avatar color</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, avatarColor: c }))}
                    style={{ width: 32, height: 32, borderRadius: 6, background: c, border: form.avatarColor === c ? '3px solid #333' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                    {form.name ? form.name[0].toUpperCase() : '?'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="gl-btn gl-btn-primary" onClick={handleCreate} disabled={!form.name.trim()}>
                Create project
              </button>
              <button className="gl-btn gl-btn-secondary" onClick={() => navigate('/')}>Cancel</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
