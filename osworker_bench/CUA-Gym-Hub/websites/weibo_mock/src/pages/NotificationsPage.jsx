import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatRelativeTime, getVerifiedBadgeClass } from '../utils/helpers';
import './Pages.css';

const NOTIF_TABS = ['全部', '评论', '点赞', '转发', '关注', '@我'];

const NOTIF_TYPE_MAP = {
  '全部': null,
  '评论': 'comment',
  '点赞': 'like',
  '转发': 'repost',
  '关注': 'follow',
  '@我': 'mention',
};

export default function NotificationsPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('全部');

  useEffect(() => {
    dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
  }, []);

  const typeFilter = NOTIF_TYPE_MAP[activeTab];
  const notifications = (state.notifications || [])
    .filter(n => !typeFilter || n.type === typeFilter)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="page-content">
      <div className="card">
        <div className="page-header">通知</div>

        <div className="notif-tabs">
          {NOTIF_TABS.map(tab => (
            <button
              key={tab}
              className={`notif-tab-btn ${activeTab === tab ? 'notif-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-state-icon">🔔</div>
            <p>暂无通知</p>
          </div>
        ) : (
          notifications.map(notif => (
            <NotificationCard key={notif.id} notif={notif} />
          ))
        )}
      </div>
    </div>
  );
}

function NotificationCard({ notif }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const fromUser = notif.fromUserId ? state.users?.[notif.fromUserId] : null;
  const relatedPost = notif.postId ? state.posts?.[notif.postId] : null;
  const badgeClass = fromUser ? getVerifiedBadgeClass(fromUser.verifiedType) : null;

  const handleClick = () => {
    if (notif.postId) navigate(`/post/${notif.postId}`);
    else if (notif.fromUserId) navigate(`/profile/${notif.fromUserId}`);
  };

  const getIcon = () => {
    switch (notif.type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'repost': return '🔄';
      case 'follow': return '👤';
      case 'mention': return '@';
      case 'system': return '📢';
      default: return '🔔';
    }
  };

  return (
    <div
      className={`notif-card ${!notif.isRead ? 'notif-unread' : ''}`}
      onClick={handleClick}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {fromUser ? (
          <img
            src={fromUser.avatar}
            alt={fromUser.screenName}
            className="avatar"
            style={{ width: 44, height: 44 }}
          />
        ) : (
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--color-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: 'white'
          }}>
            {getIcon()}
          </div>
        )}
        <span style={{
          position: 'absolute', bottom: -2, right: -2,
          fontSize: 14, lineHeight: 1
        }}>{getIcon()}</span>
      </div>

      <div className="notif-content">
        <div className="notif-text">
          {fromUser && (
            <strong
              onClick={e => { e.stopPropagation(); navigate(`/profile/${fromUser.id}`); }}
            >
              {fromUser.screenName}
              {badgeClass && <span className={`badge-v ${badgeClass}`} style={{ fontSize: 10, width: 14, height: 14, marginLeft: 2 }}>V</span>}
            </strong>
          )}
          {' '}{notif.text}
        </div>
        {relatedPost && (
          <div style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            marginTop: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {relatedPost.text.slice(0, 50)}{relatedPost.text.length > 50 ? '...' : ''}
          </div>
        )}
        <div className="notif-time">{formatRelativeTime(notif.createdAt)}</div>
      </div>

      {notif.type === 'follow' && fromUser && !fromUser.isFollowing && (
        <button
          className="btn btn-outline"
          style={{ fontSize: 13, padding: '4px 12px', flexShrink: 0 }}
          onClick={e => {
            e.stopPropagation();
            dispatch({ type: 'TOGGLE_FOLLOW', userId: fromUser.id });
          }}
        >
          回关
        </button>
      )}

      {relatedPost && relatedPost.images && relatedPost.images.length > 0 && (
        <img
          src={relatedPost.images[0]}
          alt="相关微博"
          className="notif-post-thumb"
        />
      )}
    </div>
  );
}
