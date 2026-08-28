import React, { useState } from 'react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

function formatTimestamp(iso) {
  if (!iso) return '';
  const d = parseISO(iso);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'M/d');
}

function formatDuration(seconds) {
  if (!seconds) return '--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function CallsPage() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('history');
  const [callingUser, setCallingUser] = useState(null); // { user, type: 'audio'|'video' }

  const query = searchParams.toString();
  const qStr = query ? `?${query}` : '';

  function getOtherUser(call) {
    const otherId = call.participants.find(p => p !== state.currentUser.userId);
    return state.users.find(u => u.userId === otherId);
  }

  function handleCall(user, callType) {
    setCallingUser({ user, type: callType });
    // Simulate call connecting after 2s then navigate to chat
    setTimeout(() => {
      setCallingUser(null);
      const existing = state.chats.find(c =>
        c.chatType === 'oneOnOne' &&
        c.participants.includes(user.userId) &&
        c.participants.includes(state.currentUser.userId)
      );
      if (existing) {
        navigate(`/chat/${existing.chatId}${qStr}`);
      } else {
        const newChatId = 'chat_' + Date.now();
        actions.createChat([user.userId], '', newChatId);
        setTimeout(() => navigate(`/chat/${newChatId}${qStr}`), 50);
      }
    }, 2000);
  }

  function handleCallBack(call) {
    const other = getOtherUser(call);
    if (other) handleCall(other, call.isVideoCall ? 'video' : 'audio');
  }

  return (
    <>
      <div className="secondary-sidebar">
        <div className="sidebar-header">
          <h2>Calls</h2>
          <div className="sidebar-header-actions">
            <button title="Dial pad">&#128222;</button>
          </div>
        </div>
        <div className="filter-chips">
          <button className={`filter-chip ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
          <button className={`filter-chip ${activeTab === 'speed-dial' ? 'active' : ''}`} onClick={() => setActiveTab('speed-dial')}>Speed dial</button>
        </div>
        <div className="sidebar-list">
          {activeTab === 'history' && (
            <>
              {state.calls.map(call => {
                const other = getOtherUser(call);
                const isMissed = call.status === 'missed';
                return (
                  <div key={call.callId} className="call-item">
                    <div className="call-item-avatar">
                      {other?.avatar ? <img src={other.avatar} alt={other?.displayName} /> : <div className="avatar-initials" style={{ background: '#6264A7' }}>?</div>}
                    </div>
                    <div className="call-item-info">
                      <div className={`call-item-name ${isMissed ? 'missed' : ''}`}>{other?.displayName || 'Unknown'}</div>
                      <div className="call-item-details">
                        <span>{call.direction === 'incoming' ? '\u2199\uFE0F' : '\u2197\uFE0F'}</span>
                        <span>{call.isVideoCall ? 'Video' : 'Audio'}</span>
                        <span>&middot;</span>
                        <span>{isMissed ? 'Missed' : formatDuration(call.duration)}</span>
                      </div>
                    </div>
                    <div className="call-item-time">{formatTimestamp(call.startDateTime)}</div>
                    {other && (
                      <div className="call-item-actions">
                        <button title="Call back" onClick={() => handleCallBack(call)}>
                          {call.isVideoCall ? '🎥' : '📞'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {state.calls.length === 0 && (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No recent calls</div>
              )}
            </>
          )}
          {activeTab === 'speed-dial' && (
            <>
              {state.users.filter(u => u.userId !== state.currentUser.userId).map(user => (
                <div key={user.userId} className="call-item">
                  <div className="call-item-avatar">
                    <img src={user.avatar} alt={user.displayName} />
                    <span className={`presence-dot presence-dot-sidebar ${user.presence}`} />
                  </div>
                  <div className="call-item-info">
                    <div className="call-item-name">{user.displayName}</div>
                    <div className="call-item-details">
                      <span>{user.jobTitle}</span>
                    </div>
                  </div>
                  <div className="call-item-actions">
                    <button title="Audio call" onClick={() => handleCall(user, 'audio')}>&#128222;</button>
                    <button title="Video call" onClick={() => handleCall(user, 'video')}>&#127909;</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="main-content">
        {callingUser ? (
          <div className="empty-state">
            <div className="empty-state-icon">{callingUser.type === 'video' ? '📹' : '📞'}</div>
            <div className="empty-state-title">Calling {callingUser.user.displayName}...</div>
            <div className="empty-state-text">Connecting your {callingUser.type} call</div>
            <button
              style={{ marginTop: 16, padding: '10px 24px', fontSize: 14, borderRadius: 20, border: 'none', cursor: 'pointer', background: '#C4314B', color: '#fff' }}
              onClick={() => setCallingUser(null)}
            >
              &#128244; End
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">&#128222;</div>
            <div className="empty-state-title">Make a call</div>
            <div className="empty-state-text">Use the dial pad or select a contact to start a call.</div>
            <button className="btn-primary" style={{ marginTop: 16, padding: '10px 24px', fontSize: 14, borderRadius: 20, border: 'none', cursor: 'pointer', background: 'var(--brand-primary)', color: '#fff' }}
              onClick={() => setActiveTab('speed-dial')}>
              &#128222; Make a call
            </button>
          </div>
        )}
      </div>
    </>
  );
}

