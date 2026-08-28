
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const notifications = useStore(state => state.notifications);
  const users = useStore(state => state.users);
  const answers = useStore(state => state.answers);
  const questions = useStore(state => state.questions);
  const markNotificationRead = useStore(state => state.markNotificationRead);
  const markAllNotificationsRead = useStore(state => state.markAllNotificationsRead);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTargetUrl = (notification: typeof notifications[0]) => {
    if (!notification.targetId) return null;
    if (notification.targetType === 'answer') return `/answer/${notification.targetId}`;
    if (notification.targetType === 'question') return `/question/${notification.targetId}`;
    if (notification.targetType === 'article') return `/article/${notification.targetId}`;
    return null;
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markNotificationRead(notification.notificationId);
    const url = getTargetUrl(notification);
    if (url) navigate(url);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voteup': return '👍';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'favorite': return '⭐';
      case 'thank': return '❤️';
      case 'invite': return '📩';
      case 'system': return '🔔';
      default: return '📌';
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>消息中心</h1>
            {unreadCount > 0 && (
              <div style={styles.unreadCount}>{unreadCount} 条未读</div>
            )}
          </div>
          {unreadCount > 0 && (
            <button style={styles.markAllBtn} onClick={markAllNotificationsRead}>
              全部标为已读
            </button>
          )}
        </div>

        <div style={styles.list}>
          {notifications.map(notification => {
            const fromUser = users.find(u => u.userId === notification.fromUserId);
            const targetUrl = getTargetUrl(notification);

            return (
              <div
                key={notification.notificationId}
                className="card"
                style={{
                  ...styles.notifCard,
                  ...(notification.isRead ? {} : styles.notifUnread),
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div style={styles.notifIcon}>
                  {getTypeIcon(notification.type)}
                </div>
                {fromUser && (
                  <img
                    src={fromUser.avatar}
                    alt=""
                    style={styles.avatar}
                    onClick={e => { e.stopPropagation(); navigate(`/user/${fromUser.userId}`); }}
                  />
                )}
                <div style={styles.notifContent}>
                  <div style={styles.notifText}>
                    {fromUser && (
                      <span
                        style={styles.notifUserLink}
                        onClick={e => { e.stopPropagation(); navigate(`/user/${fromUser.userId}`); }}
                      >
                        {fromUser.nickname}
                      </span>
                    )}
                    <span> {notification.content}</span>
                  </div>
                  <div style={styles.notifMeta}>
                    <span style={styles.notifTime}>
                      {new Date(notification.createdTime).toLocaleString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {!notification.isRead && <span style={styles.unreadDot} />}
                  </div>
                </div>
                {targetUrl && (
                  <span style={styles.arrow}>›</span>
                )}
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div style={styles.empty}>暂无消息</div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: 'var(--bg-secondary)',
    minHeight: 'calc(100vh - 56px)',
    paddingTop: '20px',
    paddingBottom: '40px',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  unreadCount: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  markAllBtn: {
    padding: '8px 16px',
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '13px',
    color: 'var(--primary-color)',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  notifCard: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  notifUnread: {
    background: 'rgba(0, 100, 168, 0.05)',
  },
  notifIcon: {
    fontSize: '18px',
    flexShrink: 0,
    width: '24px',
    textAlign: 'center' as const,
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    flexShrink: 0,
    cursor: 'pointer',
  },
  notifContent: {
    flex: 1,
    minWidth: 0,
  },
  notifText: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    lineHeight: '1.6',
    marginBottom: '4px',
  },
  notifUserLink: {
    fontWeight: '600',
    cursor: 'pointer',
    color: 'var(--text-primary)',
  },
  notifMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  notifTime: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  unreadDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--primary-color)',
    flexShrink: 0,
  },
  arrow: {
    fontSize: '20px',
    color: 'var(--text-secondary)',
    flexShrink: 0,
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'var(--text-secondary)',
    fontSize: '16px',
  },
};

export default Messages;
