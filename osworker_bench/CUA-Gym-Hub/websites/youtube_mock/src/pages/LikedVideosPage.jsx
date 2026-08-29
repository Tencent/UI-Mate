
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Shuffle, MoreVertical, ThumbsDown, Clock, ListPlus } from 'lucide-react';
import { useData } from '../context/DataContext';
import PlaylistModal from '../components/PlaylistModal';
import './LikedVideosPage.css';

const LikedVideosPage = () => {
  const navigate = useNavigate();
  const { data, toggleLike, toggleWatchLater, showToast } = useData();
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

  const likedVideos = data.user.likedVideos
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
    if (likedVideos.length > 0) {
      navigate(`/watch/${likedVideos[0].videoId}`);
    }
  };

  const handleShuffle = () => {
    if (likedVideos.length > 0) {
      const randomIndex = Math.floor(Math.random() * likedVideos.length);
      navigate(`/watch/${likedVideos[randomIndex].videoId}`);
    }
  };

  const handleVideoClick = (videoId, e) => {
    if (e.target.closest('.lv-item-menu-btn') || e.target.closest('.lv-item-dropdown')) return;
    navigate(`/watch/${videoId}`);
  };

  const handleRemoveLike = (e, videoId) => {
    e.stopPropagation();
    toggleLike(videoId);
    showToast('Removed from Liked videos');
    setMenuOpen(null);
  };

  const handleAddToWatchLater = (e, videoId) => {
    e.stopPropagation();
    toggleWatchLater(videoId);
    const isInWatchLater = data.user.watchLater.includes(videoId);
    showToast(isInWatchLater ? 'Removed from Watch later' : 'Added to Watch later');
    setMenuOpen(null);
  };

  return (
    <div className="liked-videos-page">
      <div className="lv-info-column">
        <div className="lv-cover">
          <div className="lv-cover-title">Liked videos</div>
          <div className="lv-cover-count">{likedVideos.length} videos</div>
        </div>

        <div className="lv-user-info">
          <img src={data.user.avatar} alt={data.user.displayName} className="lv-user-avatar" />
          <span className="lv-user-name">{data.user.displayName}</span>
        </div>

        <div className="lv-actions">
          <button className="lv-play-all-btn" onClick={handlePlayAll}>
            <Play size={18} /> Play all
          </button>
          <button className="lv-shuffle-btn" onClick={handleShuffle}>
            <Shuffle size={16} />
          </button>
        </div>
      </div>

      <div className="lv-list-column">
        {likedVideos.length === 0 ? (
          <div className="lv-empty">
            <div className="lv-empty-title">No liked videos</div>
            <p>Videos you like will appear here.</p>
          </div>
        ) : (
          likedVideos.map((video, index) => (
            <div
              key={video.videoId}
              className="lv-video-item"
              onClick={(e) => handleVideoClick(video.videoId, e)}
            >
              <div className="lv-item-index">{index + 1}</div>
              <div className="lv-item-thumb">
                <img src={video.thumbnail} alt={video.title} />
                <span className="lv-item-duration">{video.duration}</span>
              </div>
              <div className="lv-item-info">
                <div className="lv-item-title">{video.title}</div>
                <div className="lv-item-channel">{video.channelName}</div>
                <div className="lv-item-meta">
                  {formatViewCount(video.viewCount)} views &bull; {formatTimeAgo(video.uploadDate)}
                </div>
              </div>
              <button
                className="lv-item-menu-btn"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === video.videoId ? null : video.videoId); }}
                aria-label="More options"
              >
                <MoreVertical size={20} />
              </button>
              {menuOpen === video.videoId && (
                <div className="lv-item-dropdown" ref={menuRef}>
                  <div className="lv-item-dropdown-item" onClick={(e) => handleRemoveLike(e, video.videoId)}>
                    <ThumbsDown size={20} />
                    <span>Remove from Liked videos</span>
                  </div>
                  <div className="lv-item-dropdown-item" onClick={(e) => handleAddToWatchLater(e, video.videoId)}>
                    <Clock size={20} />
                    <span>{data.user.watchLater.includes(video.videoId) ? 'Remove from Watch later' : 'Add to Watch later'}</span>
                  </div>
                  <div className="lv-item-dropdown-item" onClick={(e) => { e.stopPropagation(); setPlaylistVideoId(video.videoId); setMenuOpen(null); }}>
                    <ListPlus size={20} />
                    <span>Add to playlist</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <PlaylistModal
        isOpen={!!playlistVideoId}
        onClose={() => setPlaylistVideoId(null)}
        videoId={playlistVideoId}
      />
    </div>
  );
};

export default LikedVideosPage;
