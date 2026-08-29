import { useState } from 'react';
import { User, Mail, AtSign, Save, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProfileSettings() {
  const { state, dispatch } = useApp();
  const { currentUser } = state;

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [username, setUsername] = useState(currentUser.username);
  const [saved, setSaved] = useState(false);

  const initials = name.trim()
    ? name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const isDirty =
    name !== currentUser.name ||
    email !== currentUser.email ||
    username !== currentUser.username;

  const handleSave = () => {
    if (!name.trim() || !email.trim() || !username.trim()) return;
    dispatch({
      type: 'UPDATE_CURRENT_USER',
      payload: { name: name.trim(), email: email.trim(), username: username.trim() }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-container" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
      </div>

      {/* Avatar preview */}
      <div
        className="card"
        style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#4a6fa5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{name || '—'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            wandb.ai/{username || '…'}
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={13} /> Display Name
          </label>
          <input
            className="form-input"
            value={name}
            onChange={e => { setName(e.target.value); setSaved(false); }}
            placeholder="Your full name"
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AtSign size={13} /> Username
          </label>
          <input
            className="form-input"
            value={username}
            onChange={e => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '')); setSaved(false); }}
            placeholder="your-username"
          />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Only lowercase letters, numbers, hyphens and underscores.
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mail size={13} /> Email Address
          </label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setSaved(false); }}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="btn-blue"
          onClick={handleSave}
          disabled={!isDirty || !name.trim() || !email.trim() || !username.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            opacity: !isDirty || !name.trim() || !email.trim() || !username.trim() ? 0.5 : 1,
          }}
        >
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
        {saved && (
          <span style={{ fontSize: 13, color: 'var(--success-green)' }}>
            Profile updated.
          </span>
        )}
      </div>
    </div>
  );
}
