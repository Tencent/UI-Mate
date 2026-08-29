import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function UserProfileCard({ userId, children }) {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [toastMsg, setToastMsg] = useState('');
  const cardRef = useRef(null);
  const timeoutRef = useRef(null);
  const toastRef = useRef(null);

  const user = state.users.find(u => u.userId === userId);
  if (!user) return children || null;

  const query = searchParams.toString();
  const qStr = query ? `?${query}` : '';

  function getPresenceLabel(p) {
    switch (p) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'dnd': return 'Do not disturb';
      case 'brb': return 'Be right back';
      case 'away': return 'Away';
      case 'inAMeeting': return 'In a meeting';
      case 'offline': return 'Offline';
      default: return p;
    }
  }

  function getPresenceColor(p) {
    switch (p) {
      case 'available': return '#92C353';
      case 'busy': case 'dnd': case 'inAMeeting': return '#C4314B';
      case 'brb': case 'away': return '#FCD116';
      default: return '#B4B4B4';
    }
  }

  function showToast(msg) {
    setToastMsg(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToastMsg(''), 2000);
  }

  function handleChatClick(e) {
    e.stopPropagation();
    setShow(false);
    // Find existing 1:1 chat
    const existing = state.chats.find(c =>
      c.chatType === 'oneOnOne' &&
      c.participants.includes(state.currentUser.userId) &&
      c.participants.includes(userId)
    );
    if (existing) {
      navigate(`/chat/${existing.chatId}${qStr}`);
    } else {
      const newChatId = 'chat_' + Date.now();
      actions.createChat([userId], '', newChatId);
      setTimeout(() => navigate(`/chat/${newChatId}${qStr}`), 50);
    }
  }

  function handleVideoCallClick(e) {
    e.stopPropagation();
    showToast(`Starting video call with ${user.firstName}...`);
    setTimeout(() => setShow(false), 1500);
  }

  function handleAudioCallClick(e) {
    e.stopPropagation();
    showToast(`Calling ${user.firstName}...`);
    setTimeout(() => setShow(false), 1500);
  }

  function handleEmailClick(e) {
    e.stopPropagation();
    window.location.href = `mailto:${user.email}`;
    setShow(false);
  }

  function handleMouseEnter(e) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const rect = e.currentTarget.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: Math.max(8, rect.left) });
      setShow(true);
    }, 400);
  }

  function handleMouseLeave() {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShow(false), 200);
  }

  function handleCardEnter() {
    clearTimeout(timeoutRef.current);
  }

  function handleCardLeave() {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShow(false), 200);
  }

  useEffect(() => {
    return () => { clearTimeout(timeoutRef.current); clearTimeout(toastRef.current); };
  }, []);

  return (
    <>
      <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer' }}>
        {children}
      </span>
      {show && (
        <div
          ref={cardRef}
          className="profile-card"
          style={{ top: pos.top, left: Math.min(pos.left, window.innerWidth - 330) }}
          onMouseEnter={handleCardEnter}
          onMouseLeave={handleCardLeave}
        >
          {toastMsg && (
            <div style={{ background: 'var(--brand-primary)', color: '#fff', borderRadius: 4, padding: '6px 10px', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>
              {toastMsg}
            </div>
          )}
          <div className="profile-card-header">
            <img src={user.avatar} alt={user.displayName} className="profile-card-avatar" />
            <div>
              <div className="profile-card-name">{user.displayName}</div>
              <div className="profile-card-title">{user.jobTitle}</div>
              {user.department && <div className="profile-card-dept">{user.department}</div>}
            </div>
          </div>
          <div className="profile-card-presence">
            <span className="presence-dot-inline" style={{ background: getPresenceColor(user.presence) }} />
            <span>{getPresenceLabel(user.presence)}</span>
          </div>
          {user.statusMessage && (
            <div className="profile-card-status">
              {user.statusMessage}
            </div>
          )}
          <div className="profile-card-actions">
            <button title="Chat" onClick={handleChatClick}>&#128172;</button>
            <button title="Video call" onClick={handleVideoCallClick}>&#127909;</button>
            <button title="Audio call" onClick={handleAudioCallClick}>&#128222;</button>
            <button title={`Email ${user.email}`} onClick={handleEmailClick}>&#9993;</button>
          </div>
          <div className="profile-card-contact">
            <div><span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>Email:</span> {user.email}</div>
            {user.phone && <div style={{ marginTop: 2 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>Phone:</span> {user.phone}</div>}
            {user.location && <div style={{ marginTop: 2 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>Location:</span> {user.location}</div>}
          </div>
        </div>
      )}
    </>
  );
}

