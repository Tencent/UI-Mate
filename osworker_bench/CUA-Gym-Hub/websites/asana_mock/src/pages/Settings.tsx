
import { useApp } from '../context/AppContext';
import { useState, useRef } from 'react';
import './Settings.css';

export default function Settings() {
  const { state, updateCurrentUser } = useApp();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [profileName, setProfileName] = useState(state.currentUser.name);
  const [profileEmail, setProfileEmail] = useState(state.currentUser.email);
  const [profileTitle, setProfileTitle] = useState(state.currentUser.title);
  const [profileDept, setProfileDept] = useState(state.currentUser.department);
  const [profileSaved, setProfileSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Display state
  const [theme, setTheme] = useState(state.currentUser.theme);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<'sunday' | 'monday'>(
    state.currentUser.firstDayOfWeek || 'sunday'
  );
  const [displaySaved, setDisplaySaved] = useState(false);

  // Notification preferences - initialized from persisted state
  const [notifPrefs, setNotifPrefs] = useState({
    taskAssigned: state.currentUser.notificationPrefs?.taskAssigned ?? true,
    taskCompleted: state.currentUser.notificationPrefs?.taskCompleted ?? true,
    commentsMentions: state.currentUser.notificationPrefs?.commentsMentions ?? true,
    dailySummary: state.currentUser.notificationPrefs?.dailySummary ?? false,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  const handleProfileSave = () => {
    updateCurrentUser({
      name: profileName,
      email: profileEmail,
      title: profileTitle,
      department: profileDept,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        updateCurrentUser({ avatar: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleDisplaySave = () => {
    updateCurrentUser({ theme, firstDayOfWeek });
    document.documentElement.setAttribute('data-theme', theme === 'auto' ? 'light' : theme);
    setDisplaySaved(true);
    setTimeout(() => setDisplaySaved(false), 2000);
  };

  const handleNotifSave = () => {
    updateCurrentUser({ notificationPrefs: notifPrefs });
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-content">
        <nav className="settings-nav">
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={activeTab === 'display' ? 'active' : ''}
            onClick={() => setActiveTab('display')}
          >
            Display
          </button>
          <button
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button
            className={activeTab === 'workspace' ? 'active' : ''}
            onClick={() => setActiveTab('workspace')}
          >
            Workspace
          </button>
          <button
            className={activeTab === 'shortcuts' ? 'active' : ''}
            onClick={() => setActiveTab('shortcuts')}
          >
            Keyboard Shortcuts
          </button>
        </nav>

        <div className="settings-panel">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Settings</h2>
              <div className="profile-photo">
                <img src={state.currentUser.avatar} alt={state.currentUser.name} />
                <div className="profile-photo-actions">
                  <button onClick={handleChangePhoto}>Change Photo</button>
                  <span className="profile-photo-hint">JPG, PNG, GIF up to 5MB</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoFileChange}
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={profileTitle}
                  onChange={e => setProfileTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={profileDept}
                  onChange={e => setProfileDept(e.target.value)}
                />
              </div>
              <div className="save-row">
                <button className="save-btn" onClick={handleProfileSave}>Save Changes</button>
                {profileSaved && <span className="save-confirmation">Saved!</span>}
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="settings-section">
              <h2>Display Settings</h2>
              <div className="form-group">
                <label>Theme</label>
                <select value={theme} onChange={e => setTheme(e.target.value as 'light' | 'dark' | 'auto')}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div className="form-group">
                <label>First day of week</label>
                <select
                  value={firstDayOfWeek}
                  onChange={e => setFirstDayOfWeek(e.target.value as 'sunday' | 'monday')}
                >
                  <option value="sunday">Sunday</option>
                  <option value="monday">Monday</option>
                </select>
              </div>
              <div className="save-row">
                <button className="save-btn" onClick={handleDisplaySave}>Save Changes</button>
                {displaySaved && <span className="save-confirmation">Saved!</span>}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={notifPrefs.taskAssigned}
                    onChange={e => setNotifPrefs(p => ({ ...p, taskAssigned: e.target.checked }))}
                  />
                  Tasks assigned to me
                </label>
              </div>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={notifPrefs.taskCompleted}
                    onChange={e => setNotifPrefs(p => ({ ...p, taskCompleted: e.target.checked }))}
                  />
                  Tasks completed
                </label>
              </div>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={notifPrefs.commentsMentions}
                    onChange={e => setNotifPrefs(p => ({ ...p, commentsMentions: e.target.checked }))}
                  />
                  Comments and mentions
                </label>
              </div>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={notifPrefs.dailySummary}
                    onChange={e => setNotifPrefs(p => ({ ...p, dailySummary: e.target.checked }))}
                  />
                  Daily summary email
                </label>
              </div>
              <div className="save-row">
                <button className="save-btn" onClick={handleNotifSave}>Save Changes</button>
                {notifSaved && <span className="save-confirmation">Saved!</span>}
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="settings-section">
              <h2>Workspace Settings</h2>
              <div className="workspace-info">
                <div className="workspace-info-row">
                  <span className="workspace-info-label">Workspace Name</span>
                  <span className="workspace-info-value">My Organization</span>
                </div>
                <div className="workspace-info-row">
                  <span className="workspace-info-label">Plan</span>
                  <span className="workspace-info-value workspace-plan-badge">Business</span>
                </div>
                <div className="workspace-info-row">
                  <span className="workspace-info-label">Members</span>
                  <span className="workspace-info-value">{state.users.length} members</span>
                </div>
                <div className="workspace-info-row">
                  <span className="workspace-info-label">Teams</span>
                  <span className="workspace-info-value">{state.teams.length} teams</span>
                </div>
              </div>
              <div className="workspace-section-divider" />
              <h3 className="workspace-subsection-title">Members</h3>
              <div className="workspace-members-list">
                {state.users.map(user => (
                  <div key={user.userId} className="workspace-member-row">
                    <img src={user.avatar} alt={user.name} className="workspace-member-avatar" />
                    <div className="workspace-member-info">
                      <div className="workspace-member-name">
                        {user.name}
                        {user.userId === state.currentUser.userId && (
                          <span className="workspace-member-you"> (you)</span>
                        )}
                      </div>
                      <div className="workspace-member-email">{user.email}</div>
                    </div>
                    <div className="workspace-member-role">{user.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="settings-section">
              <h2>Keyboard Shortcuts</h2>
              <div className="shortcuts-list">
                <div className="shortcut-item">
                  <span className="shortcut-action">Search</span>
                  <kbd>Cmd</kbd> + <kbd>K</kbd>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-action">Quick Add</span>
                  <kbd>Tab</kbd> + <kbd>Q</kbd>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-action">My Tasks</span>
                  <kbd>Tab</kbd> + <kbd>Z</kbd>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-action">Mark Complete</span>
                  <kbd>Tab</kbd> + <kbd>C</kbd>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
