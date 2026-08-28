import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PostCard from '../components/Post/PostCard';
import { formatCount, getVerifiedBadgeClass } from '../utils/helpers';
import './Pages.css';

const ALL_PROFILE_TABS = ['微博', '转发', '视频', '相册', '收藏'];

export default function ProfilePage() {
  const { userId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const isCurrentUser = userId === 'user_current';
  const PROFILE_TABS = isCurrentUser ? ALL_PROFILE_TABS : ['微博', '转发', '视频', '相册'];
  const [activeTab, setActiveTab] = useState('微博');
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const user = state.users?.[userId];
  const badgeClass = getVerifiedBadgeClass(user?.verifiedType);

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👤</div>
        <p>用户不存在</p>
      </div>
    );
  }

  const userPosts = Object.values(state.posts || {})
    .filter(p => {
      if (activeTab === '收藏') return isCurrentUser && p.isFavorited;
      if (p.userId !== userId) return false;
      if (activeTab === '微博') return !p.repostOf;
      if (activeTab === '转发') return !!p.repostOf;
      if (activeTab === '视频') return !!p.video;
      if (activeTab === '相册') return p.images && p.images.length > 0;
      return false;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleFollow = () => {
    dispatch({ type: 'TOGGLE_FOLLOW', userId });
  };

  return (
    <div className="page-content">
      {/* Cover Banner */}
      <div className="profile-cover card" style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}>
        {user.coverImage ? (
          <img src={user.coverImage} alt="封面" />
        ) : null}
      </div>

      {/* Profile Header */}
      <div className="card" style={{ borderRadius: '0 0 0 0', borderTop: 'none', borderBottom: 'none' }}>
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <img
              src={user.avatar}
              alt={user.screenName}
              className="profile-avatar"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="profile-info">
              <div className="profile-name-row">
                <span className="profile-name">{user.screenName}</span>
                {badgeClass && <span className={`badge-v ${badgeClass}`} style={{ width: 20, height: 20, fontSize: 12 }}>V</span>}
              </div>
              <div className="profile-handle">@{user.handle}</div>

              {user.bio && <p className="profile-bio">{user.bio}</p>}

              <div className="profile-meta">
                {user.location && <span>📍 {user.location}</span>}
                <span>📅 {new Date(user.createdAt).getFullYear()}年{new Date(user.createdAt).getMonth() + 1}月加入</span>
              </div>

              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="profile-stat-num">{formatCount(user.followingCount)}</span>
                  <span className="profile-stat-label">关注</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-num">{formatCount(user.followersCount)}</span>
                  <span className="profile-stat-label">粉丝</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-num">{formatCount(user.postsCount)}</span>
                  <span className="profile-stat-label">微博</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="profile-action-row">
              {isCurrentUser ? (
                <button
                  className="btn btn-secondary"
                  style={{ minWidth: 90 }}
                  onClick={() => setShowEditModal(true)}
                >
                  编辑资料
                </button>
              ) : (
                <button
                  className={`btn follow-btn ${user.isFollowing ? 'btn-secondary follow-btn-following' : 'btn-outline'}`}
                  onClick={handleFollow}
                  onMouseEnter={() => setIsHoveringFollow(true)}
                  onMouseLeave={() => setIsHoveringFollow(false)}
                >
                  {user.isFollowing
                    ? (isHoveringFollow ? '取消关注' : '已关注')
                    : '关注'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="card" style={{ borderRadius: 0, borderTop: 'none', borderBottom: '1px solid var(--color-border)', marginBottom: 8 }}>
        <div className="profile-tabs">
          {PROFILE_TABS.map(tab => (
            <button
              key={tab}
              className={`profile-tab-btn ${activeTab === tab ? 'profile-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Posts list */}
      {userPosts.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📭</div>
          <p>暂无内容</p>
        </div>
      ) : (
        userPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          dispatch={dispatch}
        />
      )}
    </div>
  );
}

function EditProfileModal({ user, onClose, dispatch }) {
  const [displayName, setDisplayName] = useState(user.screenName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_PROFILE',
      updates: {
        screenName: displayName.trim() || user.screenName,
        bio: bio.trim(),
        location: location.trim(),
      },
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <span>编辑资料</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>昵称</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={30}
              style={{
                width: '100%', border: '1px solid var(--color-border)',
                borderRadius: 6, padding: '8px 12px', fontSize: 14,
                fontFamily: 'var(--font-family)', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>简介</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              style={{
                width: '100%', border: '1px solid var(--color-border)',
                borderRadius: 6, padding: '8px 12px', fontSize: 14,
                fontFamily: 'var(--font-family)', outline: 'none', resize: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>所在地</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              maxLength={30}
              style={{
                width: '100%', border: '1px solid var(--color-border)',
                borderRadius: 6, padding: '8px 12px', fontSize: 14,
                fontFamily: 'var(--font-family)', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button className="btn btn-secondary" onClick={onClose}>取消</button>
            <button className="btn btn-primary" onClick={handleSave}>保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}

