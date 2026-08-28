
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Clock, Share2, ListPlus, Users } from 'lucide-react';
import { useData } from '../context/DataContext';
import PlaylistModal from '../components/PlaylistModal';
import './SubscriptionsPage.css';

const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const { data, toggleWatchLater, showToast } = useData();
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [menuOpen, setMenuOpen] = useState(null);
  const [playlistVideoId, setPlaylistVideoId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const subscribedChannels = data.channels.filter(c =>
    data.user.subscribedChannels.includes(c.channelId)
  );

  const subscribedVideos = data.videos
    .filter(v => {
      if (selectedChannel === 'all') {
        return data.user.subscribedChannels.includes(v.channelId);
      }
      return v.channelId === selectedChannel;
    })
    .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

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

  const handleVideoClick = (videoId, e) => {
    if (e.target.closest('.subs-card-menu-btn') || e.target.closest('.subs-card-dropdown')) return;
    navigate(`/watch/${videoId}`);
  };

  const handleMenuClick = (e, videoId) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === videoId ? null : videoId);
  };

  const handleAddToWatchLater = (e, video) => {
    e.stopPropagation();
    toggleWatchLater(video.videoId);
    const isInWatchLater = data.user.watchLater.includes(video.videoId);
    showToast(isInWatchLater ? 'Removed from Watch later' : 'Added to Watch later');
    setMenuOpen(null);
  };

  const handleShare = (e, videoId) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/watch/${videoId}`).catch(() => {});
    showToast('Link copied to clipboard');
    setMenuOpen(null);
  };

  if (subscribedChannels.length === 0) {
    return (
      <div className="subscriptions-page">
        <div className="subs-empty-state">
          <Users size={64} className="subs-empty-icon" />
          <div className="subs-empty-title">No subscriptions yet</div>
          <div className="subs-empty-desc">Subscribe to channels to see their latest videos here.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="subscriptions-page">
      <div className="subs-channel-row">
        <div
          className={`subs-channel-item ${selectedChannel === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedChannel('all')}
        >
          <div
            className="subs-channel-avatar"
            style={{
              backgroundColor: 'var(--hover-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}
          >
            All
          </div>
          <span className="subs-channel-name">All</span>
        </div>
        {subscribedChannels.map(channel => (
          <div
            key={channel.channelId}
            className={`subs-channel-item ${selectedChannel === channel.channelId ? 'active' : ''}`}
            onClick={() => setSelectedChannel(channel.channelId)}
          >
            <img src={channel.avatar} alt={channel.name} className="subs-channel-avatar" />
            <span className="subs-channel-name">{channel.name}</span>
          </div>
        ))}
      </div>

      <div className="subs-videos-grid">
        {subscribedVideos.map(video => (
          <div
            key={video.videoId}
            className="subs-video-card"
            onClick={(e) => handleVideoClick(video.videoId, e)}
          >
            <div className="subs-thumb-container">
              <img src={video.thumbnail} alt={video.title} />
              <span className="subs-duration-badge">{video.duration}</span>
              <button
                className="subs-card-menu-btn"
                onClick={(e) => handleMenuClick(e, video.videoId)}
                aria-label="More options"
              >
                <MoreVertical size={20} />
              </button>
              {menuOpen === video.videoId && (
                <div className="subs-card-dropdown" ref={menuRef}>
                  <div className="subs-card-dropdown-item" onClick={(e) => handleAddToWatchLater(e, video)}>
                    <Clock size={20} />
                    <span>{data.user.watchLater.includes(video.videoId) ? 'Remove from Watch later' : 'Add to Watch later'}</span>
                  </div>
                  <div className="subs-card-dropdown-item" onClick={(e) => handleShare(e, video.videoId)}>
                    <Share2 size={20} />
                    <span>Share</span>
                  </div>
                  <div className="subs-card-dropdown-item" onClick={(e) => { e.stopPropagation(); setPlaylistVideoId(video.videoId); setMenuOpen(null); }}>
                    <ListPlus size={20} />
                    <span>Add to playlist</span>
                  </div>
                </div>
              )}
            </div>
            <div className="subs-video-info">
              <img src={video.channelAvatar} alt={video.channelName} className="subs-channel-avatar-small" />
              <div className="subs-video-details">
                <div className="subs-video-title">{video.title}</div>
                <div className="subs-video-channel-name">{video.channelName}</div>
                <div className="subs-video-meta">
                  {formatViewCount(video.viewCount)} views &bull; {formatTimeAgo(video.uploadDate)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PlaylistModal
        isOpen={!!playlistVideoId}
        onClose={() => setPlaylistVideoId(null)}
        videoId={playlistVideoId}
      />
    </div>
  );
};

export default SubscriptionsPage;
