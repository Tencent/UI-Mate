import { useState } from 'react';
import { useApp, ACTIONS } from '../context/AppContext.jsx';
import TopBar from '../components/TopBar.jsx';

export default function UserProfile() {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: state.currentUser.name, bio: state.currentUser.bio || '', email: state.currentUser.email || '' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    dispatch({ type: ACTIONS.UPDATE_USER_PROFILE, payload: { name: form.name, bio: form.bio, email: form.email } });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--gl-bg-secondary)', padding: 24 }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Edit profile</h1>

          {saved && (
            <div style={{ padding: '10px 16px', background: 'var(--gl-success-bg)', color: 'var(--gl-success)', borderRadius: 6, marginBottom: 16, fontWeight: 600 }}>
              Profile updated successfully!
            </div>
          )}

          <div style={{ background: '#fff', border: '1px solid var(--gl-border)', borderRadius: 6, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
              <img src={state.currentUser.avatarUrl} alt={state.currentUser.name}
                style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid var(--gl-border)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{state.currentUser.name}</div>
                <div style={{ color: 'var(--gl-text-secondary)', fontSize: 14 }}>@{state.currentUser.username}</div>
                <div style={{ fontSize: 13, color: 'var(--gl-text-secondary)', marginTop: 4 }}>{state.currentUser.role}</div>
              </div>
            </div>

            {editing ? (
              <div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Full name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Email</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Bio</label>
                  <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    rows={3}
                    placeholder="Tell us about yourself"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="gl-btn gl-btn-primary" onClick={handleSave}>Save changes</button>
                  <button className="gl-btn gl-btn-secondary" onClick={() => { setEditing(false); setForm({ name: state.currentUser.name, bio: state.currentUser.bio || '', email: state.currentUser.email || '' }); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gl-text-secondary)', marginBottom: 4 }}>FULL NAME</div>
                  <div style={{ fontSize: 15 }}>{state.currentUser.name}</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gl-text-secondary)', marginBottom: 4 }}>EMAIL</div>
                  <div style={{ fontSize: 15 }}>{state.currentUser.email}</div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gl-text-secondary)', marginBottom: 4 }}>BIO</div>
                  <div style={{ fontSize: 15 }}>{state.currentUser.bio || <span style={{ color: 'var(--gl-text-tertiary)' }}>No bio</span>}</div>
                </div>
                <button className="gl-btn gl-btn-primary" onClick={() => setEditing(true)}>Edit profile</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
