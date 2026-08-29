import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCount, getHotBadgeClass, getHotBadgeText } from '../utils/helpers';
import './Pages.css';

const HOT_TABS = ['热搜', '热门话题', '要闻'];

// Curated list of news post IDs shown under 要闻
const NEWS_POST_IDS = ['post_1', 'post_2', 'post_6', 'post_10', 'post_11'];

export default function HotPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('热搜');

  const hotSearches = state.hotSearches || [];

  const hotTopics = Object.values(state.topics || {})
    .sort((a, b) => b.discussionCount - a.discussionCount);

  const newsPosts = NEWS_POST_IDS
    .map(id => state.posts?.[id])
    .filter(Boolean);

  return (
    <div className="page-content">
      <div className="card">
        {/* Sub-tabs */}
        <div className="hot-sub-tabs">
          {HOT_TABS.map(tab => (
            <button
              key={tab}
              className={`hot-sub-tab-btn ${activeTab === tab ? 'hot-sub-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 热搜 tab */}
        {activeTab === '热搜' && (
          <>
            <div className="page-header" style={{ paddingTop: 12, paddingBottom: 12 }}>微博热搜榜</div>
            {hotSearches.map((item) => {
              const badgeClass = getHotBadgeClass(item.badge);
              const badgeText = getHotBadgeText(item.badge);
              const isTop3 = item.rank <= 3;

              return (
                <div
                  key={item.id}
                  className="hot-page-item"
                  onClick={() => navigate(item.url)}
                >
                  <span className={`hot-page-rank ${isTop3 ? 'hot-page-rank-top' : ''}`}>
                    {item.rank}
                  </span>
                  <div className="hot-page-info">
                    <div className={`hot-page-title ${isTop3 ? 'hot-page-title-top' : ''}`}>
                      {item.title}
                      {badgeClass && (
                        <span className={`hot-badge ${badgeClass}`} style={{ marginLeft: 6 }}>{badgeText}</span>
                      )}
                    </div>
                    <div className="hot-page-meta">
                      {formatCount(item.searchCount)}次搜索 · {item.category}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* 热门话题 tab */}
        {activeTab === '热门话题' && (
          <>
            <div className="page-header" style={{ paddingTop: 12, paddingBottom: 12 }}>热门话题</div>
            {hotTopics.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-state-icon">🏷️</div>
                <p>暂无热门话题</p>
              </div>
            ) : (
              hotTopics.map((topic, index) => (
                <div
                  key={topic.id}
                  className="hot-page-item"
                  onClick={() => navigate(`/topic/${topic.id}`)}
                >
                  <span className={`hot-page-rank ${index < 3 ? 'hot-page-rank-top' : ''}`}>
                    {index + 1}
                  </span>
                  <div className="hot-page-info">
                    <div className={`hot-page-title ${index < 3 ? 'hot-page-title-top' : ''}`}>
                      #{topic.name}#
                      {topic.isSuperTopic && (
                        <span className="hot-badge hot-badge-hot" style={{ marginLeft: 6 }}>超话</span>
                      )}
                    </div>
                    <div className="hot-page-meta">
                      {formatCount(topic.readCount)}阅读 · {formatCount(topic.discussionCount)}讨论
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* 要闻 tab */}
        {activeTab === '要闻' && (
          <>
            <div className="page-header" style={{ paddingTop: 12, paddingBottom: 12 }}>今日要闻</div>
            {newsPosts.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-state-icon">📰</div>
                <p>暂无要闻</p>
              </div>
            ) : (
              newsPosts.map((post, index) => {
                const author = state.users?.[post.userId];
                return (
                  <div
                    key={post.id}
                    className="hot-page-item"
                    style={{ alignItems: 'flex-start', gap: 10 }}
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <span className={`hot-page-rank ${index < 3 ? 'hot-page-rank-top' : ''}`} style={{ paddingTop: 2 }}>
                      {index + 1}
                    </span>
                    <div className="hot-page-info">
                      <div className={`hot-page-title ${index < 3 ? 'hot-page-title-top' : ''}`} style={{ lineHeight: 1.5, marginBottom: 4 }}>
                        {post.text.length > 80 ? post.text.slice(0, 80) + '…' : post.text}
                      </div>
                      <div className="hot-page-meta">
                        {author?.screenName} · {formatCount(post.repostCount)}转发 · {formatCount(post.commentCount)}评论
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
