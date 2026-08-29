
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Shuffle, Trash2, GripVertical, MoreVertical, Clock, ListPlus } from 'lucide-react';
import { useData } from '../context/DataContext';
import ConfirmDialog from '../components/ConfirmDialog';
import PlaylistModal from '../components/PlaylistModal';
import './WatchLaterPage.css';

const WatchLaterPage = () => {
  const navigate = useNavigate();
  const { data, removeFromWatchLater, toggleWatchLater, showToast } = useData();
  const [menuOpen, setMenuOpen] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const watchLaterVideos = data.user.watchLater
    .map(id => data.videos.find(v => v.videoId === id))
    .filter(Boolean);

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

  const handlePlayAll = () => {
    if (watchLaterVideos.length > 0) {
      navigate(`/watch/${watchLaterVideos[0].videoId}`);
    }
  };

  const handleShuffle = () => {
    if (watchLaterVideos.length > 0) {
      const randomIndex = Math.floor(Math.random() * watchLaterVideos.length);
      navigate(`/watch/${watchLaterVideos[randomIndex].videoId}`);
    }
  };

  const handleRemoveAll = () => {
    data.user.watchLater.forEach(id => removeFromWatchLater(id));
    setShowConfirm(false);
    showToast('Watch later cleared');
  };

  const handleVideoClick = (videoId, e) => {
    if (e.target.closest('.wl-item-menu-btn') || e.target.closest('.wl-item-dropdown')) return;
    navigate(`/watch/${videoId}`);
  };

  const handleRemoveItem = (e, videoId) => {
    e.stopPropagation();
    removeFromWatchLater(videoId);
    showToast('Removed from Watch later');
    setMenuOpen(null);
  };

  const firstThumb = watchLaterVideos.length > 0 ? watchLaterVideos[0].thumbnail : '';

  return (
    <div className="watch-later-page">
      <div className="wl-info-column">
        <div className="wl-cover">
          {firstThumb ? (
            <img src={firstThumb} alt="Watch Later" />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--hover-bg)' }} />
          )}
          <div className="wl-cover-overlay" />
          <div className="wl-cover-text">
            <div className="wl-playlist-title">Watch later</div>
            <div className="wl-video-count">{watchLaterVideos.length} videos</div>
          </div>
        </div>

        <div className="wl-actions">
          <button className="wl-play-all-btn" onClick={handlePlayAll}>
            <Play size={18} /> Play all
          </button>
          <button className="wl-action-btn" onClick={handleShuffle}>
            <Shuffle size={16} />
          </button>
        </div>
        <div style={{ marginTop: 8 }}>
          <button
            className="wl-action-btn"
            style={{ width: '100%' }}
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 size={16} /> Remove all
          </button>
        </div>
      </div>

      <div className="wl-list-column">
        {watchLaterVideos.length === 0 ? (
          <div className="wl-empty">
            <div className="wl-empty-title">No videos in Watch later</div>
            <p>Save videos to watch them later.</p>
          </div>
        ) : (
          watchLaterVideos.map((video, index) => (
            <div
              key={video.videoId}
              className="wl-video-item"
              onClick={(e) => handleVideoClick(video.videoId, e)}
            >
              <div className="wl-drag-handle">
                <GripVertical size={18} />
              </div>
              <div className="wl-item-index">{index + 1}</div>
              <div className="wl-item-thumb">
                <img src={video.thumbnail} alt={video.title} />
                <span className="wl-item-duration">{video.duration}</span>
              </div>
              <div className="wl-item-info">
                <div className="wl-item-title">{video.title}</div>
                <div className="wl-item-channel">{video.channelName}</div>
                <div className="wl-item-meta">
                  {formatViewCount(video.viewCount)} views &bull; {formatTimeAgo(video.uploadDate)}
                </div>
              </div>
              <button
                className="wl-item-menu-btn"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === video.videoId ? null : video.videoId); }}
                aria-label="More options"
              >
                <MoreVertical size={20} />
              </button>
              {menuOpen === video.videoId && (
                <div className="wl-item-dropdown" ref={menuRef}>
                  <div className="wl-item-dropdown-item" onClick={(e) => handleRemoveItem(e, video.videoId)}>
                    <Clock size={20} />
                    <span>Remove from Watch later</span>
                  </div>
                  <div className="wl-item-dropdown-item" onClick={(e) => { e.stopPropagation(); setPlaylistVideoId(video.videoId); setMenuOpen(null); }}>
                    <ListPlus size={20} />
                    <span>Add to playlist</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleRemoveAll}
        title="Remove all?"
        message="Are you sure you want to remove all videos from Watch later?"
        confirmText="Remove all"
      />

      <PlaylistModal
        isOpen={!!playlistVideoId}
        onClose={() => setPlaylistVideoId(null)}
        videoId={playlistVideoId}
      />
    </div>
  );
};

export default WatchLaterPage;
