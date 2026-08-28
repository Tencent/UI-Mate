import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import NoteCard from '../components/NoteCard.jsx';
import EditProfileModal from '../components/EditProfileModal.jsx';
import { formatCount } from '../utils/helpers.js';

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { state, currentUserId, followUser } = useApp();
  const [activeTab, setActiveTab] = useState('notes');
  const [showEditModal, setShowEditModal] = useState(false);

  if (!state) return <div className="loading-state">加载中...</div>;

  const user = state.users?.[userId];
  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👤</div>
        <div className="empty-state-text">用户不存在</div>
      </div>
    );
  }

  const currentUser = state.users?.[currentUserId];
  const isOwnProfile = userId === currentUserId;
  const isFollowing = currentUser?.followingIds?.includes(userId);

  const allNotes = Object.values(state.notes || {});

  const userNotes = allNotes
    .filter(n => n.authorId === userId)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt - a.createdAt;
    });

  const bookmarkedNotes = allNotes
    .filter(n => n.bookmarkedByIds?.includes(userId))
    .sort((a, b) => b.createdAt - a.createdAt);

  const likedNotes = allNotes
    .filter(n => n.likedByIds?.includes(userId))
    .sort((a, b) => b.createdAt - a.createdAt);

  const tabNotes = activeTab === 'notes' ? userNotes
    : activeTab === 'bookmarks' ? bookmarkedNotes
    : likedNotes;

  return (
    <div>
      {/* Banner */}
      {user.banner ? (
        <img
          src={user.banner}
          alt="banner"
          className="profile-banner"
          onError={e => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="profile-banner-placeholder" />
      )}

      {/* Profile info */}
      <div className="profile-info-section">
        <div className="profile-avatar-wrapper">
          <img
            src={user.avatar}
            alt={user.nickname}
            className="profile-avatar"
            onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
          />
        </div>

        <div className="profile-name">
          {user.nickname}
          {user.verified && <span className="verified-badge">✓</span>}
        </div>

        <div className="profile-red-id">小红书号: {user.redId}</div>

        {user.bio && <div className="profile-bio">{user.bio}</div>}

        {user.location && (
          <div className="profile-location">
            📍 {user.location}
            {user.gender === 'female' && ' · ♀'}
            {user.gender === 'male' && ' · ♂'}
          </div>
        )}

        <div className="profile-stats">
          <div
            className="profile-stat"
            onClick={() => navigate(`/user/${userId}/following`)}
          >
            <span className="stat-value">{formatCount(user.followingIds?.length || 0)}</span>
            <span className="stat-label">关注</span>
          </div>
          <div
            className="profile-stat"
            onClick={() => navigate(`/user/${userId}/followers`)}
          >
            <span className="stat-value">{formatCount(user.followerIds?.length || 0)}</span>
            <span className="stat-label">粉丝</span>
          </div>
          <div className="profile-stat">
            <span className="stat-value">{formatCount(user.likesAndBookmarksReceived || 0)}</span>
            <span className="stat-label">获赞与收藏</span>
          </div>
        </div>

        {isOwnProfile ? (
          <button
            className="profile-action-btn edit"
            onClick={() => setShowEditModal(true)}
          >
            编辑资料
          </button>
        ) : (
          <button
            className={`profile-action-btn ${isFollowing ? 'following' : 'follow'}`}
            onClick={() => followUser(userId)}
          >
            {isFollowing ? '已关注' : '关注'}
          </button>
        )}
      </div>

      {/* Content tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          笔记
        </button>
        <button
          className={`profile-tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmarks')}
        >
          收藏
        </button>
        <button
          className={`profile-tab ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          赞过
        </button>
      </div>

      {/* Note grid */}
      {tabNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">
            {activeTab === 'notes' ? '还没有发布笔记' : activeTab === 'bookmarks' ? '还没有收藏' : '还没有点赞'}
          </div>
        </div>
      ) : (
        <div className="waterfall-grid" style={{ padding: '16px 40px 40px' }}>
          {tabNotes.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
}
