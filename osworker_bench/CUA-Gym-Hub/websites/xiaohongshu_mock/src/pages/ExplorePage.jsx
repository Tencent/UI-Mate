import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import NoteCard from '../components/NoteCard.jsx';

const CATEGORIES = [
  { id: 'all', label: '推荐', icon: null },
  { id: 'food', label: '美食', icon: '🍜' },
  { id: 'travel', label: '旅行', icon: '✈️' },
  { id: 'beauty', label: '美妆', icon: '💄' },
  { id: 'fashion', label: '穿搭', icon: '👗' },
  { id: 'fitness', label: '健身', icon: '💪' },
  { id: 'home', label: '家居', icon: '🏠' },
  { id: 'digital', label: '数码', icon: '📱' },
  { id: 'study', label: '学习', icon: '📚' },
  { id: 'pets', label: '萌宠', icon: '🐱' },
];

function formatViewCount(n) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}千万`;
  if (n >= 10000) return `${(n / 10000).toFixed(0)}万`;
  return String(n);
}

function TrendingTopics({ topics, navigate }) {
  const sorted = Object.values(topics || {})
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10);

  if (sorted.length === 0) return null;

  return (
    <div className="trending-section">
      <div className="trending-title">🔥 热门话题</div>
      <div className="trending-list">
        {sorted.map((topic, index) => (
          <div
            key={topic.id}
            className="trending-item"
            onClick={() => navigate(`/search?q=${encodeURIComponent(topic.name)}`)}
          >
            <span className={`trending-rank ${index < 3 ? 'top3' : ''}`}>{index + 1}</span>
            <span className="trending-topic-name">{topic.name}</span>
            <span className="trending-count">{formatViewCount(topic.viewCount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const { category: urlCategory } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'all');

  const notes = state ? Object.values(state.notes || {}) : [];

  const filteredNotes = activeCategory === 'all'
    ? notes
    : notes.filter(n => n.category === activeCategory);

  // Sort by recency
  const sortedNotes = [...filteredNotes].sort((a, b) => b.createdAt - a.createdAt);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') navigate('/explore');
    else navigate(`/explore/${catId}`);
  };

  if (!state) {
    return <div className="loading-state">加载中...</div>;
  }

  return (
    <div>
      {/* Category tabs */}
      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.icon ? `${cat.icon} ${cat.label}` : cat.label}
          </button>
        ))}
      </div>

      {/* Mobile trending section (below category tabs) */}
      <div className="explore-mobile-trending">
        <TrendingTopics topics={state.topics} navigate={navigate} />
      </div>

      <div className="explore-layout">
        {/* Main waterfall grid */}
        <div className="explore-main">
          {sortedNotes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">暂无相关内容</div>
            </div>
          ) : (
            <div className="waterfall-grid">
              {sortedNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop sidebar */}
        <div className="explore-sidebar">
          <div className="explore-sidebar-card">
            <TrendingTopics topics={state.topics} navigate={navigate} />
          </div>
        </div>
      </div>
    </div>
  );
}
