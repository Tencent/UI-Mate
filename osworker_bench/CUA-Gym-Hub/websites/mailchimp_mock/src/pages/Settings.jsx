import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { state, updateState, addToast } = useApp();
  const [company, setCompany] = useState(state.user.company);
  const [fromName, setFromName] = useState(state.user.defaultFromName);
  const [fromEmail, setFromEmail] = useState(state.user.defaultFromEmail);
  const [replyTo, setReplyTo] = useState(state.user.defaultReplyTo);
  const [timezone, setTimezone] = useState(state.user.timezone);
  const [notifCampaign, setNotifCampaign] = useState(true);
  const [notifReport, setNotifReport] = useState(true);
  const [notifImport, setNotifImport] = useState(true);

  const saveCompany = () => {
    updateState(s => ({ ...s, user: { ...s.user, company } }));
    addToast('Company info saved');
  };

  const saveSending = () => {
    updateState(s => ({ ...s, user: { ...s.user, defaultFromName: fromName, defaultFromEmail: fromEmail, defaultReplyTo: replyTo } }));
    addToast('Sending defaults saved');
  };

  const saveTimezone = () => {
    updateState(s => ({ ...s, user: { ...s.user, timezone } }));
    addToast('Timezone saved');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-section">
        <h3>Company Info</h3>
        <div className="form-group">
          <label>Company Name</label>
          <input value={company} onChange={e => setCompany(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={saveCompany}>Save Changes</button>
      </div>

      <div className="settings-section">
        <h3>Default Sending</h3>
        <div className="form-group">
          <label>From Name</label>
          <input value={fromName} onChange={e => setFromName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>From Email</label>
          <input value={fromEmail} onChange={e => setFromEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Reply-To Email</label>
          <input value={replyTo} onChange={e => setReplyTo(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={saveSending}>Save Changes</button>
      </div>

      <div className="settings-section">
        <h3>Timezone</h3>
        <div className="form-group">
          <select value={timezone} onChange={e => setTimezone(e.target.value)}>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={saveTimezone}>Save Changes</button>
      </div>

      <div className="settings-section">
        <h3>Notification Preferences</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <div onClick={() => setNotifCampaign(!notifCampaign)} style={{ width: 44, height: 24, borderRadius: 12, background: notifCampaign ? '#007C89' : '#E5E5E5', padding: 2, cursor: 'pointer', transition: 'background 0.2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', transform: notifCampaign ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
            </div>
            Campaign sent notifications
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <div onClick={() => setNotifReport(!notifReport)} style={{ width: 44, height: 24, borderRadius: 12, background: notifReport ? '#007C89' : '#E5E5E5', padding: 2, cursor: 'pointer', transition: 'background 0.2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', transform: notifReport ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
            </div>
            Report ready notifications
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <div onClick={() => setNotifImport(!notifImport)} style={{ width: 44, height: 24, borderRadius: 12, background: notifImport ? '#007C89' : '#E5E5E5', padding: 2, cursor: 'pointer', transition: 'background 0.2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', transform: notifImport ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
            </div>
            Import complete notifications
          </label>
        </div>
      </div>
    </div>
  );
}
