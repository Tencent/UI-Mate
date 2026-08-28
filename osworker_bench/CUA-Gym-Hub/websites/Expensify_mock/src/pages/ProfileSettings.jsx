import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Bell, Shield, Globe } from 'lucide-react';

const profileTabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'preferences', label: 'Preferences', icon: Globe },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
];

function Toggle({ value, onChange, label }) {
  return (
    <label className="toggle-switch" onClick={onChange} style={{ cursor: 'pointer' }}>
      <div className={'toggle-track' + (value ? ' on' : '')}><div className="toggle-thumb" /></div>
      {label && <span>{label}</span>}
    </label>
  );
}

export default function ProfileSettings() {
  const { state, dispatch } = useApp();
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  const qsStr = qs ? '?' + qs : '';
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Profile & Settings</h1></div>
      <div className="settings-layout">
        {/* Left sub-nav */}
        <div className="settings-subnav">
          <div className="settings-subnav-title" style={{ fontSize: 13, color: '#8B959E', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
            My Account
          </div>
          {profileTabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={'settings-subnav-link' + (activeTab === t.key ? ' active' : '')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div className="settings-content">
          {activeTab === 'profile' && <ProfileTab state={state} dispatch={dispatch} />}
          {activeTab === 'preferences' && <PreferencesTab state={state} dispatch={dispatch} />}
          {activeTab === 'notifications' && <NotificationsTab state={state} dispatch={dispatch} />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ state, dispatch }) {
  const user = state.currentUser;
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    displayName: user.displayName || '',
    email: user.email || '',
    employeeId: user.employeeId || '',
    pronouns: user.pronouns || '',
    timezone: user.timezone || 'America/Los_Angeles',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_CURRENT_USER', payload: form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = (form.firstName[0] || '') + (form.lastName[0] || '');

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Profile</h2>

      {/* Avatar section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, padding: 20, background: '#F5F7F9', borderRadius: 8, border: '1px solid var(--border-color)' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: '#E85E95', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'white', fontSize: 28, fontWeight: 700,
          flexShrink: 0
        }}>
          {initials || 'S'}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{form.displayName || form.firstName + ' ' + form.lastName}</div>
          <div style={{ fontSize: 13, color: '#8B959E', marginBottom: 10 }}>{form.email}</div>
          <button className="btn btn-outline" style={{ fontSize: 13, padding: '5px 14px' }}
            onClick={() => alert('Avatar upload is simulated in this mock environment.')}>
            Change Avatar
          </button>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">First Name</label>
          <input className="form-input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Last Name</label>
          <input className="form-input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Display Name</label>
        <input className="form-input" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} />
        <div style={{ fontSize: 12, color: '#8B959E', marginTop: 4 }}>This is how your name appears to others.</div>
      </div>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input className="form-input" value={form.email} disabled style={{ background: '#F5F7F9', color: '#8B959E', cursor: 'not-allowed' }} />
        <div style={{ fontSize: 12, color: '#8B959E', marginTop: 4 }}>Contact support to change your email address.</div>
      </div>

      <div className="form-row">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Employee ID</label>
          <input className="form-input" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} placeholder="e.g. EMP-1234" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Pronouns</label>
          <select className="form-select" value={form.pronouns} onChange={e => setForm({ ...form, pronouns: e.target.value })}>
            <option value="">Prefer not to say</option>
            <option value="she/her">she/her</option>
            <option value="he/him">he/him</option>
            <option value="they/them">they/them</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        {saved && <span style={{ color: '#03D47C', fontSize: 13, fontWeight: 600 }}>Saved!</span>}
      </div>
    </div>
  );
}

function PreferencesTab({ state, dispatch }) {
  const prefs = state.currentUser.preferences || {};
  const [form, setForm] = useState({
    timezone: prefs.timezone || 'America/Los_Angeles',
    language: prefs.language || 'en-US',
    currency: prefs.currency || 'USD',
    dateFormat: prefs.dateFormat || 'MM/DD/YYYY',
    theme: prefs.theme || 'light',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_CURRENT_USER', payload: { preferences: form } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const timezones = [
    'America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York',
    'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney',
  ];

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Preferences</h2>

      <div className="form-group">
        <label className="form-label">Timezone</label>
        <select className="form-select" value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}>
          {timezones.map(tz => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Language</label>
        <select className="form-select" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="ja">日本語</option>
          <option value="zh">中文</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Default Currency</label>
          <select className="form-select" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
            {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Date Format</label>
          <select className="form-select" value={form.dateFormat} onChange={e => setForm({ ...form, dateFormat: e.target.value })}>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Theme</label>
        <div style={{ display: 'flex', gap: 12 }}>
          {[['light', 'Light'], ['dark', 'Dark'], ['system', 'System']].map(([val, lbl]) => (
            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '8px 16px', border: `1px solid ${form.theme === val ? '#0185FF' : 'var(--border-color)'}`, borderRadius: 6, color: form.theme === val ? '#0185FF' : 'inherit' }}>
              <input type="radio" name="theme" style={{ display: 'none' }} checked={form.theme === val} onChange={() => setForm({ ...form, theme: val })} />
              {lbl}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <button className="btn btn-primary" onClick={handleSave}>Save Preferences</button>
        {saved && <span style={{ color: '#03D47C', fontSize: 13, fontWeight: 600 }}>Saved!</span>}
      </div>
    </div>
  );
}

function NotificationsTab({ state, dispatch }) {
  const notifs = state.currentUser.notifications || {};
  const [form, setForm] = useState({
    emailReportSubmitted: notifs.emailReportSubmitted !== false,
    emailReportApproved: notifs.emailReportApproved !== false,
    emailReportRejected: notifs.emailReportRejected !== false,
    emailNewComment: notifs.emailNewComment !== false,
    emailPolicyViolation: notifs.emailPolicyViolation !== false,
    emailWeeklyDigest: notifs.emailWeeklyDigest !== false,
    pushReportSubmitted: notifs.pushReportSubmitted !== false,
    pushReportApproved: notifs.pushReportApproved !== false,
    pushNewComment: notifs.pushNewComment !== false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = key => setForm(f => ({ ...f, [key]: !f[key] }));

  const handleSave = () => {
    dispatch({ type: 'UPDATE_CURRENT_USER', payload: { notifications: form } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Section = ({ title, items }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#8B959E', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>{title}</div>
      {items.map(([key, label]) => (
        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: 14 }}>{label}</span>
          <Toggle value={form[key]} onChange={() => toggle(key)} />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Notifications</h2>
      <Section title="Email Notifications" items={[
        ['emailReportSubmitted', 'Report submitted for approval'],
        ['emailReportApproved', 'Report approved'],
        ['emailReportRejected', 'Report rejected'],
        ['emailNewComment', 'New comment on a report'],
        ['emailPolicyViolation', 'Policy violation detected'],
        ['emailWeeklyDigest', 'Weekly expense digest'],
      ]} />
      <Section title="Push Notifications" items={[
        ['pushReportSubmitted', 'Report submitted for approval'],
        ['pushReportApproved', 'Report approved'],
        ['pushNewComment', 'New comment on a report'],
      ]} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-primary" onClick={handleSave}>Save Notifications</button>
        {saved && <span style={{ color: '#03D47C', fontSize: 13, fontWeight: 600 }}>Saved!</span>}
      </div>
    </div>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState(null);

  const handleChange = () => {
    if (!form.current || !form.next || !form.confirm) { setMsg({ ok: false, text: 'All fields are required.' }); return; }
    if (form.next !== form.confirm) { setMsg({ ok: false, text: 'New passwords do not match.' }); return; }
    if (form.next.length < 8) { setMsg({ ok: false, text: 'Password must be at least 8 characters.' }); return; }
    setMsg({ ok: true, text: 'Password change simulated — this is a mock environment.' });
    setForm({ current: '', next: '', confirm: '' });
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div style={{ maxWidth: 440 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Security</h2>

      <div style={{ background: '#F5F7F9', border: '1px solid var(--border-color)', borderRadius: 8, padding: 20, marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Two-Factor Authentication</div>
        <div style={{ fontSize: 13, color: '#8B959E', marginBottom: 12 }}>Add an extra layer of security to your account.</div>
        <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => alert('2FA setup is simulated in this mock environment.')}>
          Enable 2FA
        </button>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Change Password</h3>

      <div className="form-group">
        <label className="form-label">Current Password</label>
        <input className="form-input" type="password" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} placeholder="Enter current password" />
      </div>
      <div className="form-group">
        <label className="form-label">New Password</label>
        <input className="form-input" type="password" value={form.next} onChange={e => setForm({ ...form, next: e.target.value })} placeholder="Minimum 8 characters" />
      </div>
      <div className="form-group">
        <label className="form-label">Confirm New Password</label>
        <input className="form-input" type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="Re-enter new password" />
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 14, background: msg.ok ? '#E8FFF4' : '#FFF0EF', color: msg.ok ? '#0B8043' : '#D93025', border: `1px solid ${msg.ok ? '#03D47C' : '#F5A623'}`, fontSize: 13 }}>
          {msg.text}
        </div>
      )}

      <button className="btn btn-primary" onClick={handleChange}>Change Password</button>

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontWeight: 600, color: '#D93025', marginBottom: 4 }}>Danger Zone</div>
        <div style={{ fontSize: 13, color: '#8B959E', marginBottom: 12 }}>Permanently close your account and remove your data.</div>
        <button className="btn btn-outline" style={{ color: '#D93025', borderColor: '#D93025', fontSize: 13 }}
          onClick={() => alert('Account deletion is disabled in this mock environment.')}>
          Close Account
        </button>
      </div>
    </div>
  );
}
