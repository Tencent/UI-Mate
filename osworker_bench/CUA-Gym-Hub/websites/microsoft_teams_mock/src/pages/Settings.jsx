import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

const NAV_ITEMS = [
  { section: 'Personal', items: [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
  ]},
  { section: 'App', items: [
    { id: 'permissions', label: 'App permissions', icon: '🔑' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ]},
];

function Toggle({ value, onChange }) {
  return (
    <button
      className={`settings-toggle ${value ? 'on' : 'off'}`}
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
    />
  );
}

export default function SettingsPage() {
  const { state, actions, updateState } = useApp();
  const [activeSection, setActiveSection] = useState('general');
  const [savedMsg, setSavedMsg] = useState('');

  // Local form state for profile editing
  const [displayName, setDisplayName] = useState(state.currentUser.displayName);
  const [statusMessage, setStatusMessage] = useState(state.currentUser.statusMessage || '');
  const [jobTitle, setJobTitle] = useState(state.currentUser.jobTitle || '');

  // Apply dark theme class to body
  useEffect(() => {
    if (state.settings.theme === 'dark') {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
  }, [state.settings.theme]);

  function showSaved() {
    setSavedMsg('Saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  function handleSaveProfile() {
    actions.updateStatus(statusMessage, state.currentUser.statusEmoji);
    updateState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        displayName: displayName.trim() || prev.currentUser.displayName,
        jobTitle: jobTitle.trim(),
        statusMessage: statusMessage.trim(),
      }
    }));
    showSaved();
  }

  function handleNotifChange(key, value) {
    actions.updateSettings({ notifications: { [key]: value } });
  }

  function handlePrivacyChange(key, value) {
    actions.updateSettings({ privacy: { [key]: value } });
  }

  function handleDisplayChange(key, value) {
    actions.updateSettings({ display: { [key]: value } });
  }

  function handleThemeChange(theme) {
    actions.updateSettings({ theme });
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
    showSaved();
  }

  function renderSection() {
    switch (activeSection) {
      case 'general':
        return (
          <div>
            <div className="settings-section-title">General</div>
            <div className="settings-group">
              <div className="settings-group-title">Profile</div>
              <div className="settings-profile-row">
                <img src={state.currentUser.avatar} alt="" className="settings-profile-avatar" />
                <div style={{ flex: 1 }}>
                  <div className="settings-row" style={{ paddingTop: 0 }}>
                    <div>
                      <div className="settings-row-label">Display name</div>
                      <div className="settings-row-desc">How your name appears to others</div>
                    </div>
                    <input
                      className="settings-input"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      style={{ width: 200 }}
                    />
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-row-label">Job title</div>
                    </div>
                    <input
                      className="settings-input"
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      style={{ width: 200 }}
                    />
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-row-label">Status message</div>
                      <div className="settings-row-desc">Shown to others in your profile card</div>
                    </div>
                    <input
                      className="settings-input"
                      value={statusMessage}
                      onChange={e => setStatusMessage(e.target.value)}
                      placeholder="e.g. Working from home"
                      style={{ width: 200 }}
                    />
                  </div>
                </div>
              </div>
              <button className="settings-save-btn" onClick={handleSaveProfile}>Save changes</button>
              {savedMsg && <span style={{ marginLeft: 12, color: '#92C353', fontSize: 13 }}>{savedMsg}</span>}
            </div>
            <div className="settings-group">
              <div className="settings-group-title">Language</div>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">App language</div>
                  <div className="settings-row-desc">Changes apply after restart</div>
                </div>
                <select className="settings-select" value={state.settings.language || 'en-US'}
                  onChange={e => { actions.updateSettings({ language: e.target.value }); showSaved(); }}>
                  <option value="en-US">English (United States)</option>
                  <option value="en-GB">English (United Kingdom)</option>
                  <option value="fr-FR">Français</option>
                  <option value="de-DE">Deutsch</option>
                  <option value="ja-JP">日本語</option>
                  <option value="zh-CN">中文 (简体)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div>
            <div className="settings-section-title">Notifications</div>
            <div className="settings-group">
              <div className="settings-group-title">General notification settings</div>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Mute all notifications</div>
                  <div className="settings-row-desc">Turn off all notifications temporarily</div>
                </div>
                <Toggle value={state.settings.notifications.muteAll} onChange={v => handleNotifChange('muteAll', v)} />
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Show message previews</div>
                  <div className="settings-row-desc">Show a preview of messages in notifications</div>
                </div>
                <Toggle value={state.settings.notifications.showMessagePreviews} onChange={v => handleNotifChange('showMessagePreviews', v)} />
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Play sounds</div>
                  <div className="settings-row-desc">Play a sound when you receive a notification</div>
                </div>
                <Toggle value={state.settings.notifications.playSound} onChange={v => handleNotifChange('playSound', v)} />
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Show badge count</div>
                  <div className="settings-row-desc">Show unread count on the taskbar icon</div>
                </div>
                <Toggle value={state.settings.notifications.showBadgeCount} onChange={v => handleNotifChange('showBadgeCount', v)} />
              </div>
            </div>
            <div className="settings-group">
              <div className="settings-group-title">Quiet hours</div>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Enable quiet hours</div>
                  <div className="settings-row-desc">Silence notifications during a specific time period</div>
                </div>
                <Toggle value={state.settings.notifications.quietHoursEnabled} onChange={v => handleNotifChange('quietHoursEnabled', v)} />
              </div>
              {state.settings.notifications.quietHoursEnabled && (
                <>
                  <div className="settings-row">
                    <div className="settings-row-label">Start time</div>
                    <input type="time" className="settings-input" style={{ width: 140 }}
                      value={state.settings.notifications.quietHoursStart}
                      onChange={e => handleNotifChange('quietHoursStart', e.target.value)} />
                  </div>
                  <div className="settings-row">
                    <div className="settings-row-label">End time</div>
                    <input type="time" className="settings-input" style={{ width: 140 }}
                      value={state.settings.notifications.quietHoursEnd}
                      onChange={e => handleNotifChange('quietHoursEnd', e.target.value)} />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div>
            <div className="settings-section-title">Privacy</div>
            <div className="settings-group">
              <div className="settings-group-title">Read receipts and presence</div>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Read receipts</div>
                  <div className="settings-row-desc">Let others know when you've read their messages</div>
                </div>
                <Toggle value={state.settings.privacy.readReceipts} onChange={v => handlePrivacyChange('readReceipts', v)} />
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Show presence status</div>
                  <div className="settings-row-desc">Allow others to see when you're available, away, or busy</div>
                </div>
                <Toggle value={state.settings.privacy.showPresence} onChange={v => handlePrivacyChange('showPresence', v)} />
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div>
            <div className="settings-section-title">Appearance</div>
            <div className="settings-group">
              <div className="settings-group-title">Theme</div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                {[
                  { value: 'light', label: 'Light', preview: '#FFFFFF' },
                  { value: 'dark', label: 'Dark', preview: '#1F1F1F' },
                ].map(t => (
                  <div
                    key={t.value}
                    onClick={() => handleThemeChange(t.value)}
                    style={{
                      width: 120, borderRadius: 8, overflow: 'hidden',
                      border: state.settings.theme === t.value ? '2px solid var(--brand-primary)' : '2px solid var(--border-color)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ height: 60, background: t.preview, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                      {t.value === 'light' ? '☀️' : '🌙'}
                    </div>
                    <div style={{ padding: '6px 8px', textAlign: 'center', fontSize: 13, fontWeight: state.settings.theme === t.value ? 600 : 400 }}>
                      {t.label}
                      {state.settings.theme === t.value && <span style={{ color: 'var(--brand-primary)', marginLeft: 4 }}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="settings-group">
              <div className="settings-group-title">Message density</div>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">View density</div>
                  <div className="settings-row-desc">Control spacing between messages</div>
                </div>
                <select className="settings-select"
                  value={state.settings.display?.density || 'comfortable'}
                  onChange={e => { handleDisplayChange('density', e.target.value); showSaved(); }}>
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Show message previews in sidebar</div>
                </div>
                <Toggle
                  value={state.settings.display?.showChannelPreview ?? true}
                  onChange={v => handleDisplayChange('showChannelPreview', v)}
                />
              </div>
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div>
            <div className="settings-section-title">Accessibility</div>
            <div className="settings-group">
              <div className="settings-group-title">Keyboard shortcuts</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Ctrl+1</strong> — Go to Activity
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Ctrl+2</strong> — Go to Chat
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Ctrl+3</strong> — Go to Teams
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Ctrl+4</strong> — Go to Calendar
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Ctrl+5</strong> — Go to Calls
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Ctrl+N</strong> — New chat
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Enter</strong> — Send message
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Shift+Enter</strong> — New line in message
                </div>
              </div>
            </div>
          </div>
        );

      case 'permissions':
        return (
          <div>
            <div className="settings-section-title">App permissions</div>
            <div className="settings-group">
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                Manage which apps have access to your Teams data.
              </div>
              <div style={{ marginTop: 16, padding: 20, border: '1px solid var(--border-color)', borderRadius: 8, textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔑</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>No apps installed</div>
                <div style={{ fontSize: 12 }}>Apps you authorize will appear here.</div>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div>
            <div className="settings-section-title">About</div>
            <div className="settings-group">
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, background: 'var(--brand-primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                  💬
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>Xicrosoft Teams</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Version 23.28.0.0 (Mock)</div>
                </div>
              </div>
              <div className="settings-row">
                <div className="settings-row-label">Account</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{state.currentUser.email}</div>
              </div>
              <div className="settings-row">
                <div className="settings-row-label">Organization</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Contoso</div>
              </div>
              <div className="settings-row">
                <div className="settings-row-label">User ID</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{state.currentUser.userId}</div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="settings-section-title">{activeSection}</div>;
    }
  }

  return (
    <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="content-header">
        <span className="content-header-title">Settings</span>
      </div>
      <div className="settings-layout">
        <nav className="settings-nav">
          {NAV_ITEMS.map(group => (
            <React.Fragment key={group.section}>
              <div className="settings-nav-section">{group.section}</div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`settings-nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>
        <div className="settings-content">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
