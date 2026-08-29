
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useData } from '../context/DataContext';
import './TrendingPage.css';

const TABS = [
  { key: 'now', label: 'Now', category: null },
  { key: 'music', label: 'Music', category: 'Music' },
  { key: 'gaming', label: 'Gaming', category: 'Gaming' },
  { key: 'movies', label: 'Movies', category: 'Movies' }
];

const TrendingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data } = useData();
  const [activeTab, setActiveTab] = useState('now');

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const matchingTab = TABS.find(t => t.category === categoryParam || t.label === categoryParam);
      if (matchingTab) {
        setActiveTab(matchingTab.key);
      }
    }
  }, [searchParams]);

  const formatViewCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const days = Math.floor(diff / 86400000);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    return 'Today';
  };

  const currentTab = TABS.find(t => t.key === activeTab);
  const filteredVideos = currentTab.category
    ? data.videos.filter(v => v.category === currentTab.category)
    : [...data.videos];

  const sortedVideos = [...filteredVideos]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 20);

  return (
    <div className="trending-page">
      <div className="trending-header">
        <Flame size={28} className="trending-icon" />
        <h1 className="trending-title">Trending</h1>
      </div>

      <div className="trending-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`trending-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {sortedVideos.length === 0 ? (
        <div className="trending-empty">No trending videos in this category</div>
      ) : (
        <div className="trending-list">
          {sortedVideos.map((video, index) => (
            <div
              key={video.videoId}
              className="trending-item"
              onClick={() => navigate(`/watch/${video.videoId}`)}
            >
              <div className="trending-rank">#{index + 1}</div>
              <div className="trending-thumb-container">
                <img src={video.thumbnail} alt={video.title} />
                <span className="trending-duration">{video.duration}</span>
              </div>
              <div className="trending-item-info">
                <div className="trending-item-title">{video.title}</div>
                <div className="trending-item-channel">
                  <img src={video.channelAvatar} alt={video.channelName} className="trending-channel-avatar" />
                  <span className="trending-channel-name">{video.channelName}</span>
                </div>
                <div className="trending-item-meta">
                  {formatViewCount(video.viewCount)} views &bull; {formatTimeAgo(video.uploadDate)}
                </div>
                <div className="trending-item-desc">{video.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingPage;
