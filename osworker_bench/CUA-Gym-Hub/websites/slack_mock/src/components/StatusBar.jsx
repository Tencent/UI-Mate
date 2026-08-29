
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './StatusBar.css';

function StatusBar() {
  const { state, updateState, showToast } = useApp();
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const dndEnabled = state && state.currentUser && state.currentUser.status === 'dnd';

  const handleToggleDND = () => {
    if (!state || !state.currentUser) return;
    const newStatus = dndEnabled ? 'online' : 'dnd';
    const currentUser = { ...state.currentUser, status: newStatus };
    const users = state.users.map(u =>
      u.userId === currentUser.userId ? currentUser : u
    );
    updateState({ currentUser, users });
    showToast(newStatus === 'dnd' ? 'Do Not Disturb enabled' : 'Do Not Disturb disabled');
  };

  const handleNotificationsClick = () => {
    setShowNotifPanel(!showNotifPanel);
  };

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <div className="connection-status">
          <span className="connection-dot"></span>
          <span>Connected</span>
        </div>
      </div>
      <div className="status-bar-right">
        <button
          className={`dnd-toggle ${dndEnabled ? 'active' : ''}`}
          onClick={handleToggleDND}
          title="Do Not Disturb"
        >
          🔕 {dndEnabled ? 'DND On' : 'DND Off'}
        </button>
        <button
          className={`notifications-btn ${showNotifPanel ? 'active' : ''}`}
          title="Notification preferences"
          onClick={handleNotificationsClick}
        >
          🔔
        </button>
        {showNotifPanel && (
          <div className="notif-panel">
            <div className="notif-panel-header">Notification preferences</div>
            <div className="notif-panel-body">
              <label className="notif-option">
                <input
                  type="radio"
                  name="notif"
                  value="all"
                  checked={state && state.settings && state.settings.notifications === 'all'}
                  onChange={() => updateState({ settings: { ...state.settings, notifications: 'all' } })}
                />
                All messages
              </label>
              <label className="notif-option">
                <input
                  type="radio"
                  name="notif"
                  value="mentions"
                  checked={state && state.settings && state.settings.notifications === 'mentions'}
                  onChange={() => updateState({ settings: { ...state.settings, notifications: 'mentions' } })}
                />
                Mentions only
              </label>
              <label className="notif-option">
                <input
                  type="radio"
                  name="notif"
                  value="none"
                  checked={state && state.settings && state.settings.notifications === 'none'}
                  onChange={() => updateState({ settings: { ...state.settings, notifications: 'none' } })}
                />
                Nothing
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusBar;
