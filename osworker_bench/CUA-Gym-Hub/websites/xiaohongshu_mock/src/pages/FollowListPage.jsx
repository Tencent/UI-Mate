import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function FollowListPage({ type }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { state, currentUserId, followUser } = useApp();

  if (!state) return <div className="loading-state">加载中...</div>;

  const user = state.users?.[userId];
  if (!user) return (
    <div className="empty-state">
      <div className="empty-state-icon">👤</div>
      <div className="empty-state-text">用户不存在</div>
    </div>
  );

  const userIds = type === 'followers' ? user.followerIds : user.followingIds;
  const users = (userIds || []).map(id => state.users?.[id]).filter(Boolean);

  return (
    <div className="follow-list-page">
      <div className="follow-list-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <h1 className="follow-list-title">
          {user.nickname} 的{type === 'followers' ? '粉丝' : '关注'}
        </h1>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-text">暂无{type === 'followers' ? '粉丝' : '关注'}</div>
        </div>
      ) : (
        <div>
          {users.map(u => {
            const isFollowing = state.users?.[currentUserId]?.followingIds?.includes(u.id);
            return (
              <div key={u.id} className="follow-list-item">
                <img
                  src={u.avatar}
                  alt={u.nickname}
                  className="follow-list-avatar"
                  onClick={() => navigate(`/user/${u.id}`)}
                  onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
                />
                <div
                  className="follow-list-info"
                  onClick={() => navigate(`/user/${u.id}`)}
                >
                  <div className="follow-list-name">
                    {u.nickname}
                    {u.verified && <span style={{ color: 'var(--xhs-red)', marginLeft: 4, fontSize: 12 }}>✓</span>}
                  </div>
                  <div className="follow-list-bio">{u.bio || '暂无简介'}</div>
                </div>
                {u.id !== currentUserId && (
                  <button
                    className={`follow-btn ${isFollowing ? 'following' : 'not-following'}`}
                    onClick={() => followUser(u.id)}
                  >
                    {isFollowing ? '已关注' : '关注'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
