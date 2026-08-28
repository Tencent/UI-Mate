
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const { data, toggleSubscription, showToast } = useData();
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Relevance');

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

  const videoResults = data.videos.filter(v =>
    v.title.toLowerCase().includes(query.toLowerCase()) ||
    v.description.toLowerCase().includes(query.toLowerCase())
  );

  const channelResults = data.channels.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase())
  );

  const playlistResults = data.playlists.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
  );

  let results = [];
  if (activeFilter === 'All') {
    results = [...videoResults, ...channelResults];
  } else if (activeFilter === 'Videos') {
    results = videoResults;
  } else if (activeFilter === 'Channels') {
    results = channelResults;
  } else if (activeFilter === 'Playlists') {
    results = playlistResults;
  }

  if (sortBy === 'Upload date') {
    results = results.sort((a, b) => new Date(b.uploadDate || b.joinedDate || b.createdDate) - new Date(a.uploadDate || a.joinedDate || a.createdDate));
  } else if (sortBy === 'View count') {
    results = results.sort((a, b) => (b.viewCount || b.subscriberCount || 0) - (a.viewCount || a.subscriberCount || 0));
  } else if (sortBy === 'Rating') {
    results = results.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
  }

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`);
  };

  const handleChannelClick = (channelId) => {
    navigate(`/channel/${channelId}`);
  };

  const handleSubscribe = (e, channelId) => {
    e.stopPropagation();
    toggleSubscription(channelId);
    const isSubscribed = data.user.subscribedChannels.includes(channelId);
    showToast(isSubscribed ? 'Unsubscribed' : 'Subscribed');
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1 className="search-query">Search results for: {query}</h1>
      </div>

      <div className="search-filters">
        <div className="filter-tabs">
          {['All', 'Videos', 'Channels', 'Playlists'].map(filter => (
            <button
              key={filter}
              className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <select
          className="sort-dropdown"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="Relevance">Relevance</option>
          <option value="Upload date">Upload date</option>
          <option value="View count">View count</option>
          <option value="Rating">Rating</option>
        </select>
      </div>

      <div className="search-results">
        {results.length === 0 && query && (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>No results found for "{query}"</div>
            <div style={{ fontSize: 14 }}>Try different keywords or remove search filters</div>
          </div>
        )}
        {results.map(result => {
          if (result.videoId) {
            return (
              <div
                key={result.videoId}
                className="search-result-item"
                onClick={() => handleVideoClick(result.videoId)}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="search-result-thumbnail"
                  />
                  <span className="video-duration" style={{ position: 'absolute', bottom: '8px', right: '8px' }}>
                    {result.duration}
                  </span>
                </div>
                <div className="search-result-info">
                  <div className="search-result-title">{result.title}</div>
                  <div className="search-result-metadata">
                    {formatViewCount(result.viewCount)} views • {formatTimeAgo(result.uploadDate)}
                  </div>
                  <div className="search-result-channel">
                    <img
                      src={result.channelAvatar}
                      alt={result.channelName}
                      className="search-result-channel-avatar"
                    />
                    <span className="search-result-channel-name">{result.channelName}</span>
                  </div>
                  <div className="search-result-description">{result.description}</div>
                </div>
              </div>
            );
          } else if (result.channelId) {
            const isSubscribed = data.user.subscribedChannels.includes(result.channelId);
            return (
              <div
                key={result.channelId}
                className="channel-result-item"
                onClick={() => handleChannelClick(result.channelId)}
              >
                <img
                  src={result.avatar}
                  alt={result.name}
                  className="channel-result-avatar"
                />
                <div className="channel-result-info">
                  <div className="channel-result-name">{result.name}</div>
                  <div className="channel-result-handle">{result.handle}</div>
                  <div className="channel-result-stats">
                    {formatViewCount(result.subscriberCount)} subscribers • {result.videoCount} videos
                  </div>
                  <div className="search-result-description">{result.description}</div>
                </div>
                <button
                  className={`channel-subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
                  onClick={(e) => handleSubscribe(e, result.channelId)}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>
            );
          } else if (result.playlistId) {
            const firstVideoId = result.videoIds && result.videoIds[0];
            const firstVideo = firstVideoId ? data.videos.find(v => v.videoId === firstVideoId) : null;
            return (
              <div
                key={result.playlistId}
                className="search-result-item"
                onClick={() => navigate(`/playlist/${result.playlistId}`)}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={firstVideo ? firstVideo.thumbnail : 'https://picsum.photos/640/360?random=playlist'}
                    alt={result.name}
                    className="search-result-thumbnail"
                  />
                  <span className="video-duration" style={{ position: 'absolute', bottom: '8px', right: '8px' }}>
                    {result.videoIds.length} videos
                  </span>
                </div>
                <div className="search-result-info">
                  <div className="search-result-title">{result.name}</div>
                  <div className="search-result-metadata">Playlist • {result.privacy}</div>
                  <div className="search-result-description">{result.description}</div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default SearchPage;
  