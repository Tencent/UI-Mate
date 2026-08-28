
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import ConfirmDialog from '../components/ConfirmDialog';
import './HistoryPage.css';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { data, removeFromHistory, clearHistory, showToast } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

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

  const historyVideos = data.user.watchHistory
    .map(h => {
      const video = data.videos.find(v => v.videoId === h.videoId);
      if (!video) return null;
      return { ...video, watchedAt: h.watchedAt };
    })
    .filter(v => v !== null);

  const filteredVideos = searchQuery
    ? historyVideos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : historyVideos;

  const getDateGroup = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    if (date >= todayStart) return 'Today';
    if (date >= yesterdayStart) return 'Yesterday';
    if (diffDays <= 7) return 'This week';
    if (diffDays <= 30) return 'This month';
    return 'Older';
  };

  const groupedHistory = {};
  const groupOrder = ['Today', 'Yesterday', 'This week', 'This month', 'Older'];
  filteredVideos.forEach(video => {
    const group = getDateGroup(video.watchedAt);
    if (!groupedHistory[group]) groupedHistory[group] = [];
    groupedHistory[group].push(video);
  });

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`);
  };

  const handleRemove = (e, videoId) => {
    e.stopPropagation();
    removeFromHistory(videoId);
    showToast('Removed from watch history');
  };

  const handleClearAll = () => {
    clearHistory();
    setShowConfirm(false);
    showToast('Watch history cleared');
  };

  return (
    <div className="history-page">
      <div className="history-main">
        <h1 className="history-title">Watch history</h1>

        {filteredVideos.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-title">
              {searchQuery ? 'No results found' : 'No watch history'}
            </div>
            <p>{searchQuery ? 'Try different keywords' : 'Videos you watch will appear here.'}</p>
          </div>
        ) : (
          groupOrder.map(group => {
            if (!groupedHistory[group]) return null;
            return (
              <div key={group} className="history-date-group">
                <div className="history-date-label">{group}</div>
                {groupedHistory[group].map(video => (
                  <div
                    key={video.videoId}
                    className="history-item"
                    onClick={() => handleVideoClick(video.videoId)}
                  >
                    <div className="history-thumb-container">
                      <img src={video.thumbnail} alt={video.title} />
                      <span className="history-duration">{video.duration}</span>
                      <button
                        className="history-remove-btn"
                        onClick={(e) => handleRemove(e, video.videoId)}
                        aria-label="Remove from history"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="history-item-info">
                      <div className="history-item-title">{video.title}</div>
                      <div className="history-item-channel">{video.channelName}</div>
                      <div className="history-item-meta">
                        {formatViewCount(video.viewCount)} views &bull; {formatTimeAgo(video.uploadDate)}
                      </div>
                      <div className="history-item-desc">{video.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      <div className="history-sidebar">
        <div className="history-search-container">
          <div className="history-search-wrapper">
            <Search size={18} className="history-search-icon" />
            <input
              type="text"
              className="history-search-input"
              placeholder="Search watch history"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <button
          className="history-clear-btn"
          onClick={() => setShowConfirm(true)}
        >
          Clear all watch history
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClearAll}
        title="Clear watch history?"
        message="This will clear your entire watch history. This action cannot be undone."
        confirmText="Clear history"
      />
    </div>
  );
};

export default HistoryPage;
