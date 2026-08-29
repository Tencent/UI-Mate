import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PostCard from '../components/Post/PostCard';
import { formatCount, getVerifiedBadgeClass } from '../utils/helpers';
import './Pages.css';

const SEARCH_TABS = ['综合', '实时', '用户', '话题'];

const TAB_PARAM_MAP = {
  users: '用户',
  topics: '话题',
  realtime: '实时',
  all: '综合',
};

export default function SearchPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  const tabParam = params.get('tab') || '';
  const initialTab = TAB_PARAM_MAP[tabParam] || '综合';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchInput, setSearchInput] = useState(query);

  // Sync activeTab when URL tab param changes
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const tp = p.get('tab') || '';
    const mapped = TAB_PARAM_MAP[tp] || '综合';
    setActiveTab(mapped);
  }, [location.search]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  // Filter posts by query
  const matchedPosts = query
    ? Object.values(state.posts || {})
        .filter(p => p.text.includes(query))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  // Filter users by query
  const matchedUsers = query
    ? Object.values(state.users || {})
        .filter(u => u.screenName.includes(query) || u.handle.includes(query) || (u.bio || '').includes(query))
    : [];

  // Filter topics by query
  const matchedTopics = query
    ? Object.values(state.topics || {})
        .filter(t => t.name.includes(query) || (t.description || '').includes(query))
    : [];

  return (
    <div className="page-content">
      {/* Search Bar */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="搜索微博、用户、话题"
            style={{
              flex: 1,
              border: '1px solid var(--color-border)',
              borderRadius: 20,
              padding: '8px 16px',
              fontSize: 14,
              fontFamily: 'var(--font-family)',
              outline: 'none',
            }}
          />
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`)}
          >
            搜索
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ marginBottom: 8 }}>
        <div className="search-tabs">
          {SEARCH_TABS.map(tab => (
            <button
              key={tab}
              className={`search-tab-btn ${activeTab === tab ? 'search-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {!query ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-state-icon">🔍</div>
            <p>输入关键词搜索微博、用户或话题</p>
          </div>
        ) : (
          <>
            {/* 综合 / 实时: show posts */}
            {(activeTab === '综合' || activeTab === '实时') && (
              matchedPosts.length === 0 ? (
                <div className="empty-state" style={{ padding: 40 }}>
                  <div className="empty-state-icon">😕</div>
                  <p>未找到相关结果</p>
                </div>
              ) : (
                <div>
                  {matchedPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )
            )}

            {/* 用户 */}
            {activeTab === '用户' && (
              matchedUsers.length === 0 ? (
                <div className="empty-state" style={{ padding: 40 }}>
                  <div className="empty-state-icon">👤</div>
                  <p>未找到相关用户</p>
                </div>
              ) : (
                <div>
                  {matchedUsers.map(user => (
                    <UserSearchCard key={user.id} user={user} />
                  ))}
                </div>
              )
            )}

            {/* 话题 */}
            {activeTab === '话题' && (
              matchedTopics.length === 0 ? (
                <div className="empty-state" style={{ padding: 40 }}>
                  <div className="empty-state-icon">🏷️</div>
                  <p>未找到相关话题</p>
                </div>
              ) : (
                <div>
                  {matchedTopics.map(topic => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

function UserSearchCard({ user }) {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const badgeClass = getVerifiedBadgeClass(user.verifiedType);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="user-card" onClick={() => navigate(`/profile/${user.id}`)}>
      <img src={user.avatar} alt={user.screenName} className="avatar" style={{ width: 48, height: 48 }} />
      <div className="user-card-info">
        <div className="user-card-name">
          {user.screenName}
          {badgeClass && <span className={`badge-v ${badgeClass}`} style={{ fontSize: 10, width: 14, height: 14 }}>V</span>}
        </div>
        <div className="user-card-bio">{user.bio}</div>
        <div className="user-card-stats">粉丝 {formatCount(user.followersCount)}</div>
      </div>
      <button
        className={`btn ${user.isFollowing ? 'btn-secondary' : 'btn-outline'}`}
        style={{ fontSize: 13 }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={e => {
          e.stopPropagation();
          dispatch({ type: 'TOGGLE_FOLLOW', userId: user.id });
        }}
      >
        {user.isFollowing ? (isHovering ? '取消关注' : '已关注') : '关注'}
      </button>
    </div>
  );
}

function TopicCard({ topic }) {
  const navigate = useNavigate();
  return (
    <div className="topic-card" onClick={() => navigate(`/topic/${topic.id}`)}>
      <div className="topic-card-name">#{topic.name}#</div>
      <div className="topic-card-stats">
        {formatCount(topic.readCount)} 阅读 · {formatCount(topic.discussionCount)} 讨论
      </div>
    </div>
  );
}
