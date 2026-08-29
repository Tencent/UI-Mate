
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, MoreVertical, Trash2, ArrowUpToLine, ArrowDownToLine, Clock, Globe, Lock, EyeOff } from 'lucide-react';
import { useData } from '../context/DataContext';
import './PlaylistPage.css';

const PlaylistPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { data, updatePlaylist, removeFromPlaylist, toggleWatchLater, showToast } = useData();
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [descValue, setDescValue] = useState('');
  const menuRef = useRef(null);

  const playlist = data.playlists.find(p => p.playlistId === playlistId);

  useEffect(() => {
    if (playlist) {
      setNameValue(playlist.name);
      setDescValue(playlist.description);
    }
  }, [playlist?.playlistId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!playlist) {
    return <div className="pl-not-found">Playlist not found</div>;
  }

  const playlistVideos = playlist.videoIds
    .map(id => data.videos.find(v => v.videoId === id))
    .filter(Boolean);

  const firstThumb = playlistVideos.length > 0 ? playlistVideos[0].thumbnail : playlist.thumbnail;

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

  const parseDuration = (durationStr) => {
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  const totalSeconds = playlistVideos.reduce((sum, v) => sum + parseDuration(v.duration), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMins = Math.floor((totalSeconds % 3600) / 60);
  const totalDurationStr = totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`;

  const handlePlayAll = () => {
    if (playlistVideos.length > 0) {
      navigate(`/watch/${playlistVideos[0].videoId}`);
    }
  };

  const handleShuffle = () => {
    if (playlistVideos.length > 0) {
      const randomIndex = Math.floor(Math.random() * playlistVideos.length);
      navigate(`/watch/${playlistVideos[randomIndex].videoId}`);
    }
  };

  const handleNameSave = () => {
    if (nameValue.trim() && nameValue !== playlist.name) {
      updatePlaylist(playlistId, { name: nameValue.trim() });
      showToast('Playlist name updated');
    }
    setEditingName(false);
  };

  const handleDescSave = () => {
    if (descValue !== playlist.description) {
      updatePlaylist(playlistId, { description: descValue });
      showToast('Description updated');
    }
    setEditingDesc(false);
  };

  const handleRemoveVideo = (e, videoId) => {
    e.stopPropagation();
    removeFromPlaylist(playlistId, videoId);
    showToast('Removed from playlist');
    setMenuOpen(null);
  };

  const handleMoveToTop = (e, videoId) => {
    e.stopPropagation();
    const newIds = [videoId, ...playlist.videoIds.filter(id => id !== videoId)];
    updatePlaylist(playlistId, { videoIds: newIds });
    showToast('Moved to top');
    setMenuOpen(null);
  };

  const handleMoveToBottom = (e, videoId) => {
    e.stopPropagation();
    const newIds = [...playlist.videoIds.filter(id => id !== videoId), videoId];
    updatePlaylist(playlistId, { videoIds: newIds });
    showToast('Moved to bottom');
    setMenuOpen(null);
  };

  const handleAddToWatchLater = (e, videoId) => {
    e.stopPropagation();
    toggleWatchLater(videoId);
    const isInWatchLater = data.user.watchLater.includes(videoId);
    showToast(isInWatchLater ? 'Removed from Watch later' : 'Added to Watch later');
    setMenuOpen(null);
  };

  const handleVideoClick = (videoId, e) => {
    if (e.target.closest('.pl-item-menu-btn') || e.target.closest('.pl-item-dropdown')) return;
    navigate(`/watch/${videoId}`);
  };

  const getPrivacyIcon = () => {
    switch (playlist.privacy) {
      case 'Public': return <Globe size={14} />;
      case 'Private': return <Lock size={14} />;
      case 'Unlisted': return <EyeOff size={14} />;
      default: return <Globe size={14} />;
    }
  };

  return (
    <div className="playlist-page">
      <div className="pl-info-column">
        <div className="pl-cover">
          <img src={firstThumb} alt={playlist.name} />
        </div>

        {editingName ? (
          <input
            className="pl-name-input"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave(); }}
            autoFocus
          />
        ) : (
          <div
            className="pl-name"
            onClick={() => setEditingName(true)}
            title="Click to edit"
            style={{ cursor: 'pointer' }}
          >
            {playlist.name}
          </div>
        )}

        {editingDesc ? (
          <textarea
            className="pl-desc-input"
            value={descValue}
            onChange={(e) => setDescValue(e.target.value)}
            onBlur={handleDescSave}
            autoFocus
          />
        ) : (
          <div
            className="pl-description"
            onClick={() => setEditingDesc(true)}
            title="Click to edit"
            style={{ cursor: 'pointer' }}
          >
            {playlist.description || 'Add description'}
          </div>
        )}

        <div className="pl-privacy-badge">
          {getPrivacyIcon()}
          {playlist.privacy}
        </div>

        <div className="pl-meta">
          {playlistVideos.length} videos &bull; {totalDurationStr}
        </div>

        <div className="pl-creator">
          <img src={data.user.avatar} alt={data.user.displayName} className="pl-creator-avatar" />
          <span className="pl-creator-name">{data.user.displayName}</span>
        </div>

        <div className="pl-actions">
          <button className="pl-play-all-btn" onClick={handlePlayAll}>
            <Play size={18} /> Play all
          </button>
          <button className="pl-shuffle-btn" onClick={handleShuffle}>
            <Shuffle size={16} />
          </button>
        </div>
      </div>

      <div className="pl-list-column">
        {playlistVideos.length === 0 ? (
          <div className="pl-empty">
            <div className="pl-empty-title">No videos in this playlist</div>
            <p>Add videos to get started.</p>
          </div>
        ) : (
          playlistVideos.map((video, index) => (
            <div
              key={video.videoId}
              className="pl-video-item"
              onClick={(e) => handleVideoClick(video.videoId, e)}
            >
              <div className="pl-item-index">{index + 1}</div>
              <div className="pl-item-thumb">
                <img src={video.thumbnail} alt={video.title} />
                <span className="pl-item-duration">{video.duration}</span>
              </div>
              <div className="pl-item-info">
                <div className="pl-item-title">{video.title}</div>
                <div className="pl-item-channel">{video.channelName}</div>
                <div className="pl-item-meta">
                  {formatViewCount(video.viewCount)} views &bull; {formatTimeAgo(video.uploadDate)}
                </div>
              </div>
              <button
                className="pl-item-menu-btn"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === video.videoId ? null : video.videoId); }}
                aria-label="More options"
              >
                <MoreVertical size={20} />
              </button>
              {menuOpen === video.videoId && (
                <div className="pl-item-dropdown" ref={menuRef}>
                  <div className="pl-item-dropdown-item" onClick={(e) => handleRemoveVideo(e, video.videoId)}>
                    <Trash2 size={20} />
                    <span>Remove from playlist</span>
                  </div>
                  <div className="pl-item-dropdown-item" onClick={(e) => handleMoveToTop(e, video.videoId)}>
                    <ArrowUpToLine size={20} />
                    <span>Move to top</span>
                  </div>
                  <div className="pl-item-dropdown-item" onClick={(e) => handleMoveToBottom(e, video.videoId)}>
                    <ArrowDownToLine size={20} />
                    <span>Move to bottom</span>
                  </div>
                  <div className="pl-item-dropdown-item" onClick={(e) => handleAddToWatchLater(e, video.videoId)}>
                    <Clock size={20} />
                    <span>{data.user.watchLater.includes(video.videoId) ? 'Remove from Watch later' : 'Add to Watch later'}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;
