import React, { useState } from 'react';
import { User, Mail, BookOpen, Edit2, Check, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Profile() {
  const { state, setState } = useAppContext();
  const user = state.currentUser;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    short_name: user.short_name,
    pronouns: user.pronouns || '',
    bio: user.bio || '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    setState(prev => ({
      ...prev,
      currentUser: { ...prev.currentUser, ...form },
    }));
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({
      name: user.name,
      short_name: user.short_name,
      pronouns: user.pronouns || '',
      bio: user.bio || '',
    });
    setEditing(false);
  };

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 300, marginBottom: 24, color: 'var(--text-primary)' }}>Profile</h1>

      {/* Avatar + name card */}
      <div style={{
        background: 'white', border: '1px solid var(--border-light)',
        borderRadius: 8, padding: 24, marginBottom: 24,
        display: 'flex', gap: 24, alignItems: 'flex-start',
      }}>
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--primary, #0374B5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 700, color: 'white', flexShrink: 0,
        }}>
          {initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Display Name</label>
                <input name="short_name" value={form.short_name} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Pronouns</label>
                <select name="pronouns" value={form.pronouns} onChange={handleChange} style={inputStyle}>
                  <option value="">-- Select --</option>
                  <option>He/Him</option>
                  <option>She/Her</option>
                  <option>They/Them</option>
                  <option>He/They</option>
                  <option>She/They</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange}
                  rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={handleSave} style={btnPrimary}>
                  <Check size={14} /> Save
                </button>
                <button onClick={handleCancel} style={btnSecondary}>
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                  {user.pronouns && (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{user.pronouns}</div>
                  )}
                </div>
                <button onClick={() => setEditing(true)} style={btnSecondary}>
                  <Edit2 size={14} /> Edit Profile
                </button>
              </div>
              {user.bio && (
                <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{user.bio}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Details */}
      <div style={{
        background: 'white', border: '1px solid var(--border-light)',
        borderRadius: 8, padding: 24,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Account Details</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <DetailRow icon={<User size={16} />} label="Display Name" value={user.short_name} />
          <DetailRow icon={<Mail size={16} />} label="Email" value={user.email} />
          <DetailRow icon={<BookOpen size={16} />} label="Role" value={capitalize(user.role)} />
          <DetailRow icon={<User size={16} />} label="Sortable Name" value={user.sortable_name} />
          {user.last_login && (
            <DetailRow icon={<User size={16} />} label="Last Login"
              value={new Date(user.last_login).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
      <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{icon}</span>
      <span style={{ color: 'var(--text-secondary)', width: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em',
};

const inputStyle = {
  width: '100%', padding: '7px 10px', border: '1px solid var(--border-light)',
  borderRadius: 4, fontSize: 14, color: 'var(--text-primary)',
  outline: 'none', boxSizing: 'border-box', background: 'white',
};

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', background: 'var(--primary, #0374B5)', color: 'white',
  border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

const btnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', background: 'white', color: 'var(--text-primary)',
  border: '1px solid var(--border-light)', borderRadius: 4, fontSize: 13, cursor: 'pointer',
};
