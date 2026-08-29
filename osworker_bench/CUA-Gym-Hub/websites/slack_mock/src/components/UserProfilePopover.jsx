
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';
import './UserProfilePopover.css';

function getLocalTime(timeZone) {
  try {
    return new Date().toLocaleTimeString('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

function UserProfilePopover({ userId, anchorRect, onClose }) {
  const { state, createDM } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const popoverRef = useRef(null);

  const user = state.users.find(u => u.userId === userId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!user) return null;

  const dm = state.dms.find(d => d.participants.includes(userId) && d.participants.includes(state.currentUser.userId));

  const handleMessage = () => {
    onClose();
    if (dm) {
      navigate(withCurrentSearch(`/dm/${dm.dmId}`, location.search));
    } else {
      // Create new DM and navigate to it
      const newDmId = createDM(userId);
      if (newDmId) {
        navigate(withCurrentSearch(`/dm/${newDmId}`, location.search));
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#2BAC76';
      case 'away': return '#E8912D';
      case 'busy': return '#E01E5A';
      default: return '#CCCCCC';
    }
  };

  // Position the popover
  const style = {};
  if (anchorRect) {
    style.position = 'fixed';
    style.left = anchorRect.left;
    style.top = anchorRect.bottom + 4;
    // Adjust if popover would go off screen bottom
    if (anchorRect.bottom + 350 > window.innerHeight) {
      style.top = anchorRect.top - 350;
    }
    // Adjust if popover would go off screen right
    if (anchorRect.left + 300 > window.innerWidth) {
      style.left = window.innerWidth - 310;
    }
  }

  return (
    <div className="user-popover" ref={popoverRef} style={style}>
      <div className="popover-header">
        <img src={user.avatar} alt={user.displayName} className="popover-avatar" />
        <div className="popover-status-indicator">
          <span
            className="popover-status-dot"
            style={{ backgroundColor: getStatusColor(user.status) }}
          />
        </div>
      </div>
      <div className="popover-body">
        <div className="popover-name">{user.fullName}</div>
        <div className="popover-display-name">
          {user.statusEmoji && <span className="popover-status-emoji">{user.statusEmoji}</span>}
          {user.displayName}
        </div>
        {user.title && <div className="popover-title">{user.title}</div>}
        <div className="popover-local-time">
          Local time: {getLocalTime(user.timeZone)}
        </div>
        {user.statusMessage && (
          <div className="popover-status-message">
            {user.statusEmoji && <span>{user.statusEmoji} </span>}
            {user.statusMessage}
          </div>
        )}
      </div>
      {user.userId !== state.currentUser.userId && (
        <div className="popover-actions">
          <button className="popover-message-btn" onClick={handleMessage}>
            Message
          </button>
        </div>
      )}
    </div>
  );
}

export default UserProfilePopover;
