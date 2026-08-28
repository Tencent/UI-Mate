import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import NoteCard from '../components/NoteCard.jsx';
import { formatCount } from '../utils/helpers.js';

function formatViewCount(n) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}千万`;
  if (n >= 10000) return `${(n / 10000).toFixed(0)}万`;
  return String(n);
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, currentUserId, followUser } = useApp();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('notes');

  const q = (searchParams.get('q') || '').toLowerCase().trim();

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  const handleHotSearch = (term) => {
    setQuery(term);
    setSearchParams({ q: term });
  };

  if (!state) return <div className="loading-state">加载中...</div>;

  const allNotes = Object.values(state.notes || {});
  const allUsers = Object.values(state.users || {});
  const allTopics = Object.values(state.topics || {}).sort((a, b) => b.viewCount - a.viewCount);

  const filteredNotes = q
    ? allNotes.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.hashtags?.some(h => h.toLowerCase().includes(q))
      ).sort((a, b) => b.createdAt - a.createdAt)
    : [];

  const filteredUsers = q
    ? allUsers.filter(u =>
        u.nickname?.toLowerCase().includes(q) ||
        u.redId?.toLowerCase().includes(q)
      )
    : [];

  // Find topic info for topic header
  const matchingTopic = q
    ? allTopics.find(t => t.name.toLowerCase() === q.toLowerCase())
    : null;

  const currentUser = state.users?.[currentUserId];

  // No query: show hot search page
  if (!q) {
    return (
      <div className="search-page">
        <div className="search-header">
          <div style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
            <span
              style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontSize: '16px', color: 'var(--xhs-text-secondary)', pointerEvents: 'none'
              }}
            >🔍</span>
            <form onSubmit={handleSearch} style={{ display: 'contents' }}>
              <input
                type="text"
                className="search-input-large"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="搜索小红书"
                autoFocus
              />
            </form>
          </div>
          <button
            onClick={handleSearch}
            style={{
              padding: '8px 20px',
              background: 'var(--xhs-red)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'var(--xhs-font)'
            }}
          >
            搜索
          </button>
        </div>

        {/* Hot search list */}
        <div className="hot-search-section">
          <div className="hot-search-title">🔥 小红书热搜</div>
          <div className="hot-search-list">
            {allTopics.slice(0, 16).map((topic, index) => (
              <div
                key={topic.id}
                className="hot-search-item"
                onClick={() => handleHotSearch(topic.name)}
              >
                <span className={`hot-search-rank ${index < 3 ? 'top3' : ''}`}>{index + 1}</span>
                <span className="hot-search-name">{topic.name}</span>
                <span className="hot-search-count">{formatViewCount(topic.viewCount)} 浏览</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested users */}
        <div className="hot-search-section" style={{ marginTop: 20 }}>
          <div className="hot-search-title">💡 推荐关注</div>
          <div className="suggested-users-row">
            {allUsers.filter(u => u.id !== currentUserId).slice(0, 6).map(user => {
              const isFollowing = currentUser?.followingIds?.includes(user.id);
              return (
                <div key={user.id} className="suggested-user-card" onClick={() => navigate(`/user/${user.id}`)}>
                  <img
                    src={user.avatar}
                    alt={user.nickname}
                    className="suggested-user-avatar"
                    onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
                  />
                  <div className="suggested-user-name">{user.nickname}</div>
                  <div className="suggested-user-fans">{formatCount(user.followerIds?.length || 0)} 粉丝</div>
                  <button
                    className={`follow-btn ${isFollowing ? 'following' : 'not-following'}`}
                    onClick={e => { e.stopPropagation(); followUser(user.id); }}
                    style={{ marginTop: 6, fontSize: 12, padding: '3px 12px' }}
                  >
                    {isFollowing ? '已关注' : '关注'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <div style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
          <span
            style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              fontSize: '16px', color: 'var(--xhs-text-secondary)', pointerEvents: 'none'
            }}
          >🔍</span>
          <form onSubmit={handleSearch} style={{ display: 'contents' }}>
            <input
              type="text"
              className="search-input-large"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索小红书"
              autoFocus
            />
          </form>
        </div>
        <button
          onClick={handleSearch}
          style={{
            padding: '8px 20px',
            background: 'var(--xhs-red)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'var(--xhs-font)'
          }}
        >
          搜索
        </button>
      </div>

      {/* Topic header */}
      {matchingTopic && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--xhs-red-light)',
          borderRadius: 'var(--xhs-radius)',
          marginBottom: '12px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '20px', color: 'var(--xhs-red)', fontWeight: 700 }}>
            #{matchingTopic.name}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--xhs-text-secondary)' }}>
            {formatCount(matchingTopic.noteCount)} 篇笔记 · {formatCount(matchingTopic.viewCount)} 浏览
          </span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="search-filter-tabs">
        <button
          className={`search-filter-tab ${activeFilter === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveFilter('notes')}
        >
          笔记 ({filteredNotes.length})
        </button>
        <button
          className={`search-filter-tab ${activeFilter === 'users' ? 'active' : ''}`}
          onClick={() => setActiveFilter('users')}
        >
          用户 ({filteredUsers.length})
        </button>
      </div>

      {/* Notes tab */}
      {activeFilter === 'notes' && (
        filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-text">没有找到相关笔记</div>
          </div>
        ) : (
          <div className="waterfall-grid" style={{ padding: '0 0 40px' }}>
            {filteredNotes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )
      )}

      {/* Users tab */}
      {activeFilter === 'users' && (
        filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <div className="empty-state-text">没有找到相关用户</div>
          </div>
        ) : (
          <div className="user-search-list">
            {filteredUsers.map(user => {
              const isFollowing = currentUser?.followingIds?.includes(user.id);
              return (
                <div
                  key={user.id}
                  className="user-search-item"
                  onClick={() => navigate(`/user/${user.id}`)}
                >
                  <img
                    src={user.avatar}
                    alt={user.nickname}
                    className="user-search-avatar"
                    onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
                  />
                  <div className="user-search-info">
                    <div className="user-search-name">
                      {user.nickname}
                      {user.verified && <span style={{ color: 'var(--xhs-red)', marginLeft: 4, fontSize: '12px' }}>✓</span>}
                    </div>
                    <div className="user-search-bio">{user.bio}</div>
                    <div className="user-search-followers">
                      {formatCount(user.followerIds?.length || 0)} 粉丝
                    </div>
                  </div>
                  {user.id !== currentUserId && (
                    <button
                      className={`follow-btn ${isFollowing ? 'following' : 'not-following'}`}
                      onClick={e => { e.stopPropagation(); followUser(user.id); }}
                    >
                      {isFollowing ? '已关注' : '关注'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
