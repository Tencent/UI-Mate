
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Archive, Inbox as InboxIcon } from 'lucide-react';
import './Inbox.css';

type InboxTab = 'activity' | 'archive';

export default function Inbox() {
  const { state, markNotificationRead, markAllNotificationsRead, archiveNotification } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<InboxTab>('activity');

  const allNotifications = state.notifications
    .filter(n => n.userId === state.currentUser.userId)
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

  const activityNotifications = allNotifications.filter(n => !n.archived);
  const archivedNotifications = allNotifications.filter(n => n.archived);

  const notifications = activeTab === 'activity' ? activityNotifications : archivedNotifications;
  const unreadCount = activityNotifications.filter(n => !n.read).length;

  const getNotificationText = (notif: any) => {
    const actor = state.users.find(u => u.userId === notif.actorId);
    const task = state.tasks.find(t => t.taskId === notif.targetId);
    const project = state.projects.find(p => p.projectId === notif.targetId);

    switch (notif.type) {
      case 'comment':
        return `${actor?.name} commented on "${task?.name || 'a task'}"`;
      case 'task-completed':
        return `${actor?.name} completed "${task?.name || 'a task'}"`;
      case 'task-assigned':
        return `${actor?.name} assigned you to "${task?.name || 'a task'}"`;
      case 'task-due-soon':
        return `"${task?.name || 'A task'}" is due soon`;
      case 'mention':
        return `${actor?.name} mentioned you in "${task?.name || 'a task'}"`;
      case 'project-invite':
        return `${actor?.name} invited you to "${project?.name || 'a project'}"`;
      case 'status-update':
        return `${actor?.name} posted a status update on "${task?.name || 'a task'}"`;
      default:
        return 'New notification';
    }
  };

  const handleNotificationClick = (notif: any) => {
    markNotificationRead(notif.notificationId);
    if (notif.targetType === 'task') {
      const task = state.tasks.find(t => t.taskId === notif.targetId);
      if (task && task.projectId) {
        navigate(`/projects/${task.projectId}`);
      }
    } else if (notif.targetType === 'project') {
      navigate(`/projects/${notif.targetId}`);
    }
  };

  return (
    <div className="inbox-page">
      <div className="inbox-header">
        <h1>Inbox</h1>
        {activeTab === 'activity' && unreadCount > 0 && (
          <button className="mark-all-read" onClick={markAllNotificationsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="inbox-tabs">
        <button
          className={`inbox-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <InboxIcon size={16} />
          Activity
          {unreadCount > 0 && <span className="inbox-tab-badge">{unreadCount}</span>}
        </button>
        <button
          className={`inbox-tab ${activeTab === 'archive' ? 'active' : ''}`}
          onClick={() => setActiveTab('archive')}
        >
          <Archive size={16} />
          Archive
          {archivedNotifications.length > 0 && (
            <span className="inbox-tab-count">{archivedNotifications.length}</span>
          )}
        </button>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>
              {activeTab === 'activity'
                ? 'No new notifications'
                : 'No archived notifications'}
            </p>
          </div>
        ) : (
          notifications.map(notif => {
            const actor = state.users.find(u => u.userId === notif.actorId);
            return (
              <div
                key={notif.notificationId}
                className={`notification-item ${notif.read ? 'read' : 'unread'}`}
              >
                <img
                  src={actor?.avatar}
                  alt={actor?.name}
                  className="notification-avatar"
                  onClick={() => handleNotificationClick(notif)}
                />
                <div
                  className="notification-content"
                  onClick={() => handleNotificationClick(notif)}
                >
                  <p className="notification-text">{getNotificationText(notif)}</p>
                  <span className="notification-time">
                    {formatDistanceToNow(new Date(notif.createdDate), { addSuffix: true })}
                  </span>
                </div>
                <div className="notification-actions">
                  {!notif.read && <div className="unread-dot"></div>}
                  <button
                    className="notification-archive-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      archiveNotification(notif.notificationId);
                    }}
                    title={notif.archived ? 'Move to Inbox' : 'Archive'}
                  >
                    {notif.archived ? (
                      <InboxIcon size={16} />
                    ) : (
                      <Archive size={16} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
