import React, { useState } from 'react';
import { Globe, Clock, Eye, Bell, Lock, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese (Simplified)', 'Japanese', 'Portuguese'];
const TIMEZONES = [
  'Eastern Time (US & Canada)',
  'Central Time (US & Canada)',
  'Mountain Time (US & Canada)',
  'Pacific Time (US & Canada)',
  'UTC',
  'London',
  'Paris',
  'Tokyo',
  'Beijing',
];

export default function AccountSettings() {
  const { state, setState } = useAppContext();
  const settings = state.accountSettings || {};

  const [form, setForm] = useState({
    language: settings.language || 'English',
    timezone: settings.timezone || 'Eastern Time (US & Canada)',
    colorTheme: settings.colorTheme || 'canvas',
    pronounsVisible: settings.pronounsVisible !== undefined ? settings.pronounsVisible : true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saved, setSaved] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setSaved(false);
  };

  const handleSaveGeneral = () => {
    setState(prev => ({
      ...prev,
      accountSettings: {
        ...(prev.accountSettings || {}),
        language: form.language,
        timezone: form.timezone,
        colorTheme: form.colorTheme,
        pronounsVisible: form.pronounsVisible,
      }
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangePassword = () => {
    setPwError('');
    setPwSaved(false);
    if (!form.currentPassword) { setPwError('Please enter your current password.'); return; }
    if (form.newPassword.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (form.newPassword !== form.confirmPassword) { setPwError('Passwords do not match.'); return; }
    // Simulate success
    setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 300, marginBottom: 24, color: 'var(--text-primary)' }}>Account Settings</h1>

      {/* General Settings */}
      <Section icon={<Globe size={18} />} title="General">
        <Field label="Language">
          <select name="language" value={form.language} onChange={handleChange} style={inputStyle}>
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Time Zone">
          <select name="timezone" value={form.timezone} onChange={handleChange} style={inputStyle}>
            {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
          </select>
        </Field>
        <Field label="Color Theme">
          <select name="colorTheme" value={form.colorTheme} onChange={handleChange} style={inputStyle}>
            <option value="canvas">Xanvas Default</option>
            <option value="high_contrast">High Contrast</option>
            <option value="modern_dark">Modern Dark</option>
          </select>
        </Field>
        <div style={{ marginTop: 4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" name="pronounsVisible" checked={form.pronounsVisible} onChange={handleChange} />
            <span style={{ color: 'var(--text-primary)' }}>Show pronouns next to my name</span>
          </label>
        </div>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={handleSaveGeneral} style={btnPrimary}>
            Save Settings
          </button>
          {saved && (
            <span style={{ fontSize: 13, color: 'var(--success, #0B874B)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={14} /> Saved
            </span>
          )}
        </div>
      </Section>

      {/* Change Password */}
      <Section icon={<Lock size={18} />} title="Change Password">
        <Field label="Current Password">
          <input type="password" name="currentPassword" value={form.currentPassword}
            onChange={handleChange} placeholder="Enter current password" style={inputStyle} autoComplete="current-password" />
        </Field>
        <Field label="New Password">
          <input type="password" name="newPassword" value={form.newPassword}
            onChange={handleChange} placeholder="At least 8 characters" style={inputStyle} autoComplete="new-password" />
        </Field>
        <Field label="Confirm New Password">
          <input type="password" name="confirmPassword" value={form.confirmPassword}
            onChange={handleChange} placeholder="Repeat new password" style={inputStyle} autoComplete="new-password" />
        </Field>
        {pwError && (
          <p style={{ fontSize: 13, color: 'var(--danger, #E74C3C)', marginTop: 4 }}>{pwError}</p>
        )}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={handleChangePassword} style={btnPrimary}>
            Update Password
          </button>
          {pwSaved && (
            <span style={{ fontSize: 13, color: 'var(--success, #0B874B)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={14} /> Password updated
            </span>
          )}
        </div>
      </Section>

      {/* Notifications shortcut */}
      <Section icon={<Bell size={18} />} title="Email Notifications">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Manage how and when Xanvas sends you email and push notifications.
        </p>
        <a href="/notifications" style={{ fontSize: 14, color: 'var(--primary, #0374B5)', textDecoration: 'none', fontWeight: 600 }}>
          Go to Notification Preferences →
        </a>
      </Section>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div style={{
      background: 'white', border: '1px solid var(--border-light)',
      borderRadius: 8, padding: 24, marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <span style={{ color: 'var(--primary, #0374B5)' }}>{icon}</span>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const inputStyle = {
  width: '100%', padding: '7px 10px', border: '1px solid var(--border-light)',
  borderRadius: 4, fontSize: 14, color: 'var(--text-primary)',
  outline: 'none', boxSizing: 'border-box', background: 'white',
};

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 16px', background: 'var(--primary, #0374B5)', color: 'white',
  border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
