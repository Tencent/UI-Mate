import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { useApp } from '../context/AppContext.jsx';

function formatTimestamp(iso) {
  if (!iso) return '';
  const d = parseISO(iso);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'M/d');
}

function getNotifIcon(type) {
  switch (type) {
    case 'mention': return '\u{1F4E2}';
    case 'reply': return '\u{1F4AC}';
    case 'reaction': return '\u{1F44D}';
    case 'meeting': return '\u{1F4C5}';
    case 'system': return '\u2699\uFE0F';
    case 'assignment': return '\u{1F4CB}';
    default: return '\u{1F514}';
  }
}

export default function ActivityPage() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState('all');
  const [selectedNotif, setSelectedNotif] = useState(null);

  const query = searchParams.toString();
  const qStr = query ? `?${query}` : '';

  const notifications = [...state.notifications].sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

  let filtered = notifications;
  if (filter === 'unread') filtered = notifications.filter(n => !n.isRead);
  if (filter === 'mentions') filtered = notifications.filter(n => n.type === 'mention');

  function handleMarkAllRead() {
    actions.markAllNotificationsRead();
  }

  function handleSelectNotif(notif) {
    setSelectedNotif(notif);
    if (!notif.isRead) {
      actions.markNotificationRead(notif.notificationId);
    }
  }

  function handleNavigate(notif) {
    if (notif.containerId && notif.containerType === 'channel') {
      const channel = state.channels.find(c => c.channelId === notif.containerId);
      if (channel) {
        navigate(`/teams/${channel.teamId}/channels/${channel.channelId}${qStr}`);
      }
    } else if (notif.containerId && notif.containerType === 'chat') {
      navigate(`/chat/${notif.containerId}${qStr}`);
    }
  }

  return (
    <>
      <div className="secondary-sidebar">
        <div className="sidebar-header">
          <h2>Activity</h2>
          <div className="sidebar-header-actions">
            <button title="Mark all read" onClick={handleMarkAllRead}>&#10003;</button>
          </div>
        </div>
        <div className="filter-chips">
          {['all', 'unread', 'mentions'].map(f => (
            <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="sidebar-list">
          {filtered.map(notif => (
            <button
              key={notif.notificationId}
              className={`activity-item ${!notif.isRead ? 'unread' : ''} ${selectedNotif?.notificationId === notif.notificationId ? 'active' : ''}`}
              onClick={() => handleSelectNotif(notif)}
            >
              <div className="activity-icon">{getNotifIcon(notif.type)}</div>
              <div className="activity-content">
                <div className="activity-text">{notif.previewText}</div>
                <div className="activity-meta">
                  <span className="activity-location">{notif.teamName ? `${notif.teamName} > ${notif.containerName}` : notif.containerName}</span>
                  <span className="activity-time">{formatTimestamp(notif.timestamp)}</span>
                </div>
              </div>
              {!notif.isRead && <div className="activity-unread-dot" />}
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              {filter === 'unread' ? 'No unread notifications' : filter === 'mentions' ? 'No mentions' : 'No activity yet'}
            </div>
          )}
        </div>
      </div>
      <div className="main-content">
        {selectedNotif ? (
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>{getNotifIcon(selectedNotif.type)}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{selectedNotif.type.charAt(0).toUpperCase() + selectedNotif.type.slice(1)} notification</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {selectedNotif.teamName && `${selectedNotif.teamName} > `}{selectedNotif.containerName} &middot; {formatTimestamp(selectedNotif.timestamp)}
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--secondary-sidebar-bg)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{selectedNotif.previewText}</p>
            </div>
            {selectedNotif.containerId && (
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 4, border: 'none', cursor: 'pointer', background: 'var(--brand-primary)', color: '#fff' }} onClick={() => handleNavigate(selectedNotif)}>
                Go to conversation
              </button>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">&#128276;</div>
            <div className="empty-state-title">Stay on top of it all</div>
            <div className="empty-state-text">Select a notification from the feed to see details.</div>
          </div>
        )}
      </div>
    </>
  );
}
