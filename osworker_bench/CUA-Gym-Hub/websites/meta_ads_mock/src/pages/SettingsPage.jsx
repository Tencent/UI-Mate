import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import './SettingsPage.css';

export default function SettingsPage() {
  const { state, updateAccount, updateSettings } = useApp();
  const { showToast } = useToast();
  const [accountName, setAccountName] = useState(state.account.name);
  const [businessName, setBusinessName] = useState(state.account.businessName);
  const [timezone, setTimezone] = useState(state.account.timezone);
  const [notifPrefs, setNotifPrefs] = useState(state.settings?.notificationPreferences || {
    adApprovals: true, budgetAlerts: true, performanceAlerts: true, deliveryIssues: true
  });

  function handleSave() {
    updateAccount({ name: accountName, businessName, timezone });
    updateSettings({ notificationPreferences: notifPrefs });
    showToast('Settings saved successfully.');
  }

  function toggleNotif(key) {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const timezones = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai'];

  return (
    <div className="settings-page">
      <h2 className="page-title" style={{ marginBottom: 16 }}>Settings</h2>

      <div className="settings-card">
        <div className="settings-section-title">Account information</div>
        <div className="settings-fields">
          <div className="field-group">
            <label className="field-label">Account name</label>
            <input className="field-input" value={accountName} onChange={e => setAccountName(e.target.value)} />
          </div>
          <div className="field-group">
            <label className="field-label">Account ID</label>
            <input className="field-input" value={state.account.id} readOnly style={{ background: '#F7F8FA', cursor: 'not-allowed' }} />
          </div>
          <div className="field-group">
            <label className="field-label">Business name</label>
            <input className="field-input" value={businessName} onChange={e => setBusinessName(e.target.value)} />
          </div>
          <div className="field-group">
            <label className="field-label">Timezone</label>
            <select className="field-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
              {timezones.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Currency</label>
            <input className="field-input" value={state.account.currency} readOnly style={{ background: '#F7F8FA', cursor: 'not-allowed' }} />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-section-title">Notification preferences</div>
        <div className="notif-prefs">
          {[
            { key: 'adApprovals', label: 'Ad approvals', desc: 'When your ads are approved or rejected' },
            { key: 'budgetAlerts', label: 'Budget alerts', desc: 'When you reach budget thresholds' },
            { key: 'performanceAlerts', label: 'Performance alerts', desc: 'When campaigns hit performance milestones' },
            { key: 'deliveryIssues', label: 'Delivery issues', desc: 'When ads have delivery problems' },
          ].map(pref => (
            <div key={pref.key} className="notif-pref-row">
              <div className="notif-pref-info">
                <div className="notif-pref-label">{pref.label}</div>
                <div className="notif-pref-desc">{pref.desc}</div>
              </div>
              <button
                className={`toggle-btn ${notifPrefs[pref.key] ? 'toggle-btn--on' : ''}`}
                onClick={() => toggleNotif(pref.key)}
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={handleSave} style={{ marginTop: 8 }}>Save changes</button>
    </div>
  );
}
