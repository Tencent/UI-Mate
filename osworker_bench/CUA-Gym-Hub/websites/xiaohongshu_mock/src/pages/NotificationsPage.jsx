import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { relativeTime, formatCount } from '../utils/helpers.js';
import { getNoteCover } from '../utils/helpers.js';

const NOTIF_TYPES = {
  like: '赞了你的笔记',
  bookmark: '收藏了你的笔记',
  follow: '关注了你',
  comment: '评论了你的笔记',
  reply: '回复了你的评论'
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { state, currentUserId, markNotificationRead, markAllNotificationsRead, followUser } = useApp();
  const [activeTab, setActiveTab] = useState('likes');

  if (!state) return <div className="loading-state">加载中...</div>;

  const allNotifs = Object.values(state.notifications || {})
    .filter(n => n.recipientId === currentUserId)
    .sort((a, b) => b.createdAt - a.createdAt);

  const likesNotifs = allNotifs.filter(n => n.type === 'like' || n.type === 'bookmark');
  const followNotifs = allNotifs.filter(n => n.type === 'follow');
  const commentNotifs = allNotifs.filter(n => n.type === 'comment' || n.type === 'reply');

  const displayNotifs = activeTab === 'likes' ? likesNotifs
    : activeTab === 'follows' ? followNotifs
    : commentNotifs;

  const currentUser = state.users?.[currentUserId];
  const unreadCount = allNotifs.filter(n => !n.isRead).length;

  const handleNotifClick = (notif) => {
    markNotificationRead(notif.id);
    if (notif.noteId) navigate(`/note/${notif.noteId}`);
    else if (notif.type === 'follow') navigate(`/user/${notif.actorId}`);
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1 className="notifications-title">通知</h1>
        {unreadCount > 0 && (
          <button className="mark-read-btn" onClick={markAllNotificationsRead}>
            全部已读
          </button>
        )}
      </div>

      <div className="notification-tabs">
        <button
          className={`notification-tab ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => setActiveTab('likes')}
        >
          赞和收藏
          {likesNotifs.filter(n => !n.isRead).length > 0 && (
            <span style={{ marginLeft: 4, color: 'var(--xhs-red)', fontSize: 12 }}>
              ({likesNotifs.filter(n => !n.isRead).length})
            </span>
          )}
        </button>
        <button
          className={`notification-tab ${activeTab === 'follows' ? 'active' : ''}`}
          onClick={() => setActiveTab('follows')}
        >
          新增关注
          {followNotifs.filter(n => !n.isRead).length > 0 && (
            <span style={{ marginLeft: 4, color: 'var(--xhs-red)', fontSize: 12 }}>
              ({followNotifs.filter(n => !n.isRead).length})
            </span>
          )}
        </button>
        <button
          className={`notification-tab ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          评论和@
          {commentNotifs.filter(n => !n.isRead).length > 0 && (
            <span style={{ marginLeft: 4, color: 'var(--xhs-red)', fontSize: 12 }}>
              ({commentNotifs.filter(n => !n.isRead).length})
            </span>
          )}
        </button>
      </div>

      {displayNotifs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <div className="empty-state-text">暂无通知</div>
        </div>
      ) : (
        <div>
          {displayNotifs.map(notif => {
            const actor = state.users?.[notif.actorId];
            const note = notif.noteId ? state.notes?.[notif.noteId] : null;
            const comment = notif.commentId ? state.comments?.[notif.commentId] : null;
            const isFollowing = currentUser?.followingIds?.includes(notif.actorId);

            return (
              <div
                key={notif.id}
                className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                onClick={() => handleNotifClick(notif)}
              >
                <img
                  src={actor?.avatar}
                  alt={actor?.nickname}
                  className="notif-avatar"
                  onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
                />
                <div className="notif-content">
                  <div className="notif-text">
                    <span className="notif-actor">{actor?.nickname}</span>
                    {' '}
                    {NOTIF_TYPES[notif.type] || notif.type}
                    {comment && (
                      <span style={{ color: 'var(--xhs-text-secondary)', marginLeft: 4 }}>
                        : {comment.content.slice(0, 30)}{comment.content.length > 30 ? '...' : ''}
                      </span>
                    )}
                  </div>
                  <div className="notif-time">{relativeTime(notif.createdAt)}</div>
                </div>

                {notif.type === 'follow' ? (
                  <button
                    className={`notif-follow-back-btn ${isFollowing ? 'following' : ''}`}
                    onClick={e => { e.stopPropagation(); followUser(notif.actorId); }}
                  >
                    {isFollowing ? '已关注' : '回关'}
                  </button>
                ) : note ? (
                  <img
                    src={getNoteCover(note)}
                    alt="note"
                    className="notif-thumbnail"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : null}

                {!notif.isRead && <div className="notif-unread-dot" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
