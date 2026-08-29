import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { showToast } from '../components/Toast';
import { X, Plus, Users } from 'lucide-react';

function Toggle({ value, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border-light)' }}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <div
        className="toggle-switch"
        onClick={() => onChange(!value)}
        style={{ cursor: 'pointer' }}
      >
        <div className={`toggle-track ${value ? 'on' : ''}`}>
          <div className="toggle-thumb" />
        </div>
      </div>
    </div>
  );
}

function InviteModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2>Invite Team Member</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="input" type="email" placeholder="colleague@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { showToast('Invitation sent (simulated)', 'success'); onClose(); }}>Send Invite</button>
        </div>
      </div>
    </div>
  );
}

const TABS = ['General', 'Notifications', 'Team'];

export default function Settings() {
  const { state, updateSettings } = useApp();
  const [activeTab, setActiveTab] = useState('General');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const settings = state.settings || {};

  const [general, setGeneral] = useState({
    companyName: settings.companyName || '',
    defaultCurrency: settings.defaultCurrency || 'USD',
    defaultLanguage: settings.defaultLanguage || 'English',
    timezone: settings.timezone || 'America/New_York',
  });

  const saveGeneral = () => {
    updateSettings(general);
    showToast('Settings saved', 'success');
  };

  const allUsers = [state.currentUser, ...state.users].filter(Boolean);

  const getRoleBadge = (role) => {
    if (role === 'admin') return <span className="badge" style={{ background: '#EEF2FF', color: 'var(--color-primary)' }}>Admin</span>;
    if (role === 'viewer') return <span className="badge" style={{ background: '#F3F4F6', color: '#6B7280' }}>Viewer</span>;
    return <span className="badge" style={{ background: '#F0FDF4', color: '#16A34A' }}>Member</span>;
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="settings-content">
        <div className="tabs" style={{ padding: '0 24px' }}>
          {TABS.map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        <div className="settings-tab-content">
          {/* General */}
          {activeTab === 'General' && (
            <div style={{ maxWidth: 480 }}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input className="input" value={general.companyName} onChange={e => setGeneral({ ...general, companyName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Default Currency</label>
                <select className="input" value={general.defaultCurrency} onChange={e => setGeneral({ ...general, defaultCurrency: e.target.value })}>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>JPY</option>
                  <option>CAD</option>
                  <option>AUD</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Default Language</label>
                <select className="input" value={general.defaultLanguage} onChange={e => setGeneral({ ...general, defaultLanguage: e.target.value })}>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Portuguese</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select className="input" value={general.timezone} onChange={e => setGeneral({ ...general, timezone: e.target.value })}>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={saveGeneral}>Save Changes</button>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'Notifications' && (
            <div style={{ maxWidth: 480 }}>
              <Toggle
                label="Email Notifications"
                value={settings.emailNotifications !== false}
                onChange={(val) => updateSettings({ emailNotifications: val })}
              />
              <Toggle
                label="In-App Notifications"
                value={settings.inAppNotifications !== false}
                onChange={(val) => updateSettings({ inAppNotifications: val })}
              />
              <Toggle
                label="Signing Reminders"
                value={settings.signingReminders !== false}
                onChange={(val) => updateSettings({ signingReminders: val })}
              />
              <Toggle
                label="Expiration Alerts"
                value={settings.expirationAlerts !== false}
                onChange={(val) => updateSettings({ expirationAlerts: val })}
              />

              <div style={{ marginTop: 24 }}>
                <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                  Reminder days before expiration
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[1, 3, 7, 14, 30].map(day => {
                    const active = (settings.reminderDays || []).includes(day);
                    return (
                      <button
                        key={day}
                        className={active ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                        onClick={() => {
                          const current = settings.reminderDays || [];
                          const newDays = active ? current.filter(d => d !== day) : [...current, day].sort((a, b) => a - b);
                          updateSettings({ reminderDays: newDays });
                        }}
                      >
                        {day} day{day !== 1 ? 's' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Team */}
          {activeTab === 'Team' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
                  <Plus size={14} />
                  Invite Member
                </button>
              </div>
              <div className="contracts-table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>NAME</th>
                      <th>EMAIL</th>
                      <th>ROLE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar avatar-sm">{user.firstName?.[0]}{user.lastName?.[0]}</div>
                            <span style={{ fontWeight: 500 }}>{user.firstName} {user.lastName}</span>
                            {user.id === state.currentUser?.id && (
                              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>(you)</span>
                            )}
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{user.email}</td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>
                          <span style={{ fontSize: 12, color: user.status === 'active' || !user.status ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                            {user.status || 'active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </div>
  );
}
