import { useState } from 'react';
import { useApp } from '../context/AppContext';
import PostCard from '../components/Post/PostCard';
import ComposeBox from '../components/Post/ComposeBox';
import './Pages.css';

export default function HomePage() {
  const { state, dispatch } = useApp();
  const feedTab = state.ui?.feedTab || 'following';

  const allPosts = Object.values(state.posts || {});
  const sortedPosts = allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const followedUserIds = new Set(
    Object.values(state.users || {})
      .filter(u => u.isFollowing || u.id === 'user_current')
      .map(u => u.id)
  );

  const feedPosts = feedTab === 'following'
    ? sortedPosts.filter(p => followedUserIds.has(p.userId))
    : sortedPosts;

  return (
    <div className="page-content">
      {/* Feed Tabs */}
      <div className="feed-tabs card" style={{ marginBottom: 8 }}>
        <button
          className={`feed-tab-btn ${feedTab === 'following' ? 'feed-tab-active' : ''}`}
          onClick={() => dispatch({ type: 'SET_FEED_TAB', tab: 'following' })}
        >
          关注
        </button>
        <button
          className={`feed-tab-btn ${feedTab === 'recommended' ? 'feed-tab-active' : ''}`}
          onClick={() => dispatch({ type: 'SET_FEED_TAB', tab: 'recommended' })}
        >
          推荐
        </button>
      </div>

      {/* Compose Box */}
      <ComposeBox />

      {/* Feed */}
      {feedPosts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>暂无微博</p>
          {feedTab === 'following' && (
            <p style={{ fontSize: 12, marginTop: 8 }}>关注更多用户来填充你的时间线</p>
          )}
        </div>
      ) : (
        feedPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
}
