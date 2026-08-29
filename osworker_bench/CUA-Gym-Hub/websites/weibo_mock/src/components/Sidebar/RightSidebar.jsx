import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCount, getHotBadgeClass, getHotBadgeText } from '../../utils/helpers';
import './Sidebar.css';

const REC_PAGE_SIZE = 4;

export default function RightSidebar() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [hotOffset, setHotOffset] = useState(0);
  const [recPage, setRecPage] = useState(0);

  const hotSearches = (state.hotSearches || []).slice(hotOffset, hotOffset + 10);

  const allRecUsers = Object.values(state.users || {})
    .filter(u => u.id !== 'user_current' && !u.isFollowing);
  const totalRecPages = Math.ceil(allRecUsers.length / REC_PAGE_SIZE) || 1;
  const recommendedUsers = allRecUsers.slice(
    recPage * REC_PAGE_SIZE,
    recPage * REC_PAGE_SIZE + REC_PAGE_SIZE
  );

  const handleRefresh = () => {
    const maxOffset = Math.max(0, (state.hotSearches || []).length - 10);
    setHotOffset(prev => (prev + 10 > maxOffset ? 0 : prev + 10));
  };

  const handleRecRefresh = () => {
    setRecPage(prev => (prev + 1) % totalRecPages);
  };

  const handleFollow = (userId) => {
    dispatch({ type: 'TOGGLE_FOLLOW', userId });
  };

  return (
    <div className="right-sidebar">
      {/* Hot Search Panel */}
      <div className="sidebar-panel card">
        <div className="panel-header">
          <span className="panel-title">热搜榜</span>
          <button className="panel-link" onClick={handleRefresh}>换一换</button>
        </div>
        <ul className="hot-list">
          {hotSearches.map((item, index) => {
            const rank = hotOffset + index + 1;
            const badgeClass = getHotBadgeClass(item.badge);
            const badgeText = getHotBadgeText(item.badge);
            return (
              <li key={item.id} className="hot-item" onClick={() => navigate(item.url)}>
                <span className={`hot-rank ${rank <= 3 ? 'hot-rank-top' : ''}`}>{rank}</span>
                <span className="hot-title">{item.title}</span>
                {badgeClass && (
                  <span className={`hot-badge ${badgeClass}`}>{badgeText}</span>
                )}
              </li>
            );
          })}
        </ul>
        <button className="panel-more" onClick={() => navigate('/hot')}>查看更多</button>
      </div>

      {/* Recommended Users Panel */}
      {allRecUsers.length > 0 && (
        <div className="sidebar-panel card" style={{ marginTop: 12 }}>
          <div className="panel-header">
            <span className="panel-title">推荐用户</span>
            <button className="panel-link" onClick={handleRecRefresh}>换一换</button>
          </div>
          <div className="rec-users-list">
            {recommendedUsers.map(user => (
              <div key={user.id} className="rec-user-item">
                <img
                  src={user.avatar}
                  alt={user.screenName}
                  className="avatar"
                  style={{ width: 40, height: 40, cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/${user.id}`)}
                />
                <div className="rec-user-info" onClick={() => navigate(`/profile/${user.id}`)}>
                  <span className="rec-user-name">{user.screenName}</span>
                  <span className="rec-user-bio">{user.bio?.slice(0, 20) || ''}</span>
                </div>
                <button
                  className={`btn ${user.isFollowing ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  onClick={(e) => { e.stopPropagation(); handleFollow(user.id); }}
                >
                  {user.isFollowing ? '已关注' : '关注'}
                </button>
              </div>
            ))}
          </div>
          <button className="panel-more" onClick={() => navigate('/search?tab=users')}>查看更多</button>
        </div>
      )}
    </div>
  );
}
