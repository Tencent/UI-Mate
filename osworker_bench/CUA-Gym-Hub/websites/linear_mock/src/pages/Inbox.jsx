import React, { useState } from 'react';
import { Inbox as InboxIcon, Archive, CheckCheck, X, Clock, Circle } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { Avatar, formatRelativeTime } from '../components/Icons.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import './Inbox.css';

const NOTIFICATION_ICONS = {
  issue_assigned: User => <span style={{ color: '#5e6ad2' }}>→</span>,
  issue_mention: () => <span style={{ color: '#f2c94c' }}>@</span>,
  issue_status_changed: () => <span style={{ color: '#27a644' }}>✓</span>,
  comment: () => <span style={{ color: '#8a8f98' }}>💬</span>,
  project_update: () => <span style={{ color: '#f2994a' }}>📁</span>,
};

export default function Inbox() {
  const { state, dispatch } = useApp();
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');

  const notifications = (state.notifications || [])
    .filter(n => !n.isArchived)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const selected = notifications.find(n => n.id === selectedId);

  function getActor(actorId) {
    return state.users?.find(u => u.id === actorId);
  }

  function getIssue(issueId) {
    return issueId ? state.issues?.find(i => i.id === issueId) : null;
  }

  function getProject(projectId) {
    return projectId ? state.projects?.find(p => p.id === projectId) : null;
  }

  function handleSelect(n) {
    setSelectedId(n.id);
    if (!n.isRead) {
      dispatch({ type: 'MARK_NOTIFICATION_READ', notificationId: n.id });
    }
  }

  return (
    <div className="inbox-layout">
      {/* Left panel */}
      <div className="inbox-panel">
        <div className="inbox-panel-header">
          <div className="inbox-title-row">
            <h2 className="inbox-title">Inbox</h2>
            {unreadCount > 0 && <span className="inbox-unread-badge">{unreadCount}</span>}
          </div>
          <div className="inbox-actions">
            <button className="inbox-action-btn" onClick={() => dispatch({ type: 'ARCHIVE_ALL_NOTIFICATIONS' })} title="Archive all">
              <Archive size={14} />
              <span>Archive all</span>
            </button>
            <button className="inbox-action-btn" onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })} title="Mark all read">
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          </div>
        </div>

        <div className="inbox-list">
          {notifications.length === 0 ? (
            <div className="inbox-empty">
              <InboxIcon size={40} style={{ color: 'var(--text-tertiary)', marginBottom: 12 }} />
              <p>You're all caught up</p>
            </div>
          ) : (
            notifications.map(n => {
              const actor = getActor(n.actorId);
              return (
                <div
                  key={n.id}
                  className={`inbox-item ${!n.isRead ? 'unread' : ''} ${selectedId === n.id ? 'selected' : ''}`}
                  onClick={() => handleSelect(n)}
                >
                  {!n.isRead && <div className="inbox-unread-dot" />}
                  <div className="inbox-item-content">
                    <div className="inbox-item-header">
                      <Avatar user={actor} size={20} />
                      <span className="inbox-item-actor">{actor?.name || 'System'}</span>
                      <span className="inbox-item-time">{formatRelativeTime(n.createdAt)}</span>
                    </div>
                    <div className="inbox-item-title">{n.title}</div>
                    {n.body && <div className="inbox-item-body">{n.body}</div>}
                  </div>
                  <div className="inbox-item-actions">
                    <button
                      className="inbox-item-btn"
                      title="Archive"
                      onClick={e => {
                        e.stopPropagation();
                        dispatch({ type: 'ARCHIVE_NOTIFICATION', notificationId: n.id });
                        if (selectedId === n.id) setSelectedId(null);
                      }}
                    >
                      <X size={12} />
                    </button>
                    <button
                      className="inbox-item-btn"
                      title={n.isRead ? 'Mark unread' : 'Mark read'}
                      onClick={e => {
                        e.stopPropagation();
                        dispatch({ type: n.isRead ? 'MARK_NOTIFICATION_UNREAD' : 'MARK_NOTIFICATION_READ', notificationId: n.id });
                      }}
                    >
                      <Circle size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="inbox-detail">
        {selected ? (
          <div className="inbox-detail-content">
            <div className="inbox-detail-header">
              <span className="inbox-detail-type">{selected.type.replace(/_/g, ' ')}</span>
              <span className="inbox-detail-time">{formatRelativeTime(selected.createdAt)}</span>
            </div>
            <h3 className="inbox-detail-title">{selected.title}</h3>
            {selected.body && <p className="inbox-detail-body">{selected.body}</p>}
            {selected.issueId && (() => {
              const issue = getIssue(selected.issueId);
              return issue ? (
                <button
                  className="inbox-detail-link"
                  onClick={() => navigate(sid ? `/issue/${issue.id}?sid=${sid}` : `/issue/${issue.id}`)}
                >
                  <span className="inbox-detail-issue-id">{issue.identifier}</span>
                  <span>{issue.title}</span>
                </button>
              ) : null;
            })()}
            {selected.projectId && (() => {
              const project = getProject(selected.projectId);
              return project ? (
                <button
                  className="inbox-detail-link"
                  onClick={() => navigate(sid ? `/project/${project.id}?sid=${sid}` : `/project/${project.id}`)}
                >
                  <span>{project.name}</span>
                </button>
              ) : null;
            })()}
          </div>
        ) : (
          <div className="inbox-detail-empty">
            <p>Select a notification to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
