
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, Settings, Maximize, ThumbsUp, ThumbsDown, Share2, Download, ListPlus, MoreHorizontal, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { useData } from '../context/DataContext';
import ShareModal from '../components/ShareModal';
import PlaylistModal from '../components/PlaylistModal';
import './VideoPlayerPage.css';

const VideoPlayerPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { data, addToWatchHistory, toggleLike, toggleDislike, toggleCommentLike, toggleWatchLater, toggleSubscription, addComment, showToast } = useData();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState('720p');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentActions, setShowCommentActions] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [commentSort, setCommentSort] = useState('top');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    return data?.settings?.autoplay !== false;
  });
  const sortDropdownRef = useRef(null);
  const moreOptionsRef = useRef(null);

  const video = data.videos.find(v => v.videoId === videoId);
  const channel = video ? data.channels.find(c => c.channelId === video.channelId) : null;
  const rawComments = video ? (data.comments[videoId] || []) : [];
  const comments = [...rawComments].sort((a, b) => {
    if (commentSort === 'top') return b.likeCount - a.likeCount;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  const isLiked = video ? data.user.likedVideos.includes(videoId) : false;
  const isDisliked = video ? (data.user.dislikedVideos || []).includes(videoId) : false;
  const isSubscribed = channel ? data.user.subscribedChannels.includes(channel.channelId) : false;

  const suggestedVideos = data.videos
    .filter(v => v.videoId !== videoId)
    .sort((a, b) => {
      // Prioritize same category/channel
      const aScore = (a.category === video?.category ? 2 : 0) + (a.channelId === video?.channelId ? 1 : 0);
      const bScore = (b.category === video?.category ? 2 : 0) + (b.channelId === video?.channelId ? 1 : 0);
      return bScore - aScore || b.viewCount - a.viewCount;
    })
    .slice(0, 20);

  useEffect(() => {
    if (video) {
      addToWatchHistory(videoId);
    }
  }, [videoId]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateTime = () => setCurrentTime(videoElement.currentTime);
    const updateDuration = () => setDuration(videoElement.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (autoplayEnabled && suggestedVideos.length > 0) {
        navigate(`/watch/${suggestedVideos[0].videoId}`);
      }
    };

    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [autoplayEnabled, suggestedVideos]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
      if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target)) {
        setShowMoreOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!video || !channel) {
    return <div style={{ padding: '24px' }}>Video not found</div>;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * duration;
    }
  };

  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleLike = () => {
    toggleLike(videoId);
    showToast(isLiked ? 'Removed from liked videos' : 'Added to liked videos');
  };

  const handleDislike = () => {
    toggleDislike(videoId);
    showToast(isDisliked ? 'Dislike removed' : 'Dislike recorded');
  };

  const handleSubscribe = () => {
    toggleSubscription(channel.channelId);
    showToast(isSubscribed ? 'Unsubscribed' : 'Subscribed');
  };

  const handleNotificationBell = () => {
    showToast(isSubscribed ? 'Notification preferences updated' : 'Subscribe to manage notifications');
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleSave = () => {
    setShowPlaylistModal(true);
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      addComment(videoId, commentText);
      setCommentText('');
      setShowCommentActions(false);
      showToast('Comment added');
    }
  };

  const handleReplySubmit = (parentCommentId) => {
    if (replyText.trim()) {
      addComment(videoId, replyText, parentCommentId);
      setReplyText('');
      setReplyingTo(null);
      showToast('Reply added');
    }
  };

  const handleCommentLike = (commentId, isReply = false, parentCommentId = null) => {
    toggleCommentLike(videoId, commentId, isReply, parentCommentId);
  };

  const handleSuggestedVideoClick = (suggestedVideoId) => {
    navigate(`/watch/${suggestedVideoId}`);
  };

  return (
    <div className="video-player-page">
      <div className="video-player-main">
        <div className="video-player-container">
          <video
            ref={videoRef}
            className="video-player"
            src={video.videoUrl}
            onClick={handlePlayPause}
          />
          <div className="video-controls-overlay">
            <div className="video-progress-bar" onClick={handleProgressClick}>
              <div 
                className="video-progress-filled" 
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="video-progress-handle" />
              </div>
            </div>
            <div className="video-controls">
              <button className="control-button" onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <span className="video-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div className="video-controls-right">
                <div className="volume-control">
                  <button className="control-button" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                  <div className="volume-slider" onClick={handleVolumeChange}>
                    <div className="volume-slider-filled" style={{ width: `${volume * 100}%` }} />
                  </div>
                </div>
                <div className="settings-menu">
                  <button 
                    className="control-button" 
                    onClick={() => setShowSettings(!showSettings)}
                    aria-label="Settings"
                  >
                    <Settings size={24} />
                  </button>
                  {showSettings && (
                    <div className="settings-dropdown">
                      <div className="settings-item" style={{ fontWeight: 500, cursor: 'default' }}>
                        Quality
                      </div>
                      {['360p', '720p', '1080p'].map(q => (
                        <div
                          key={q}
                          className={`settings-item ${quality === q ? 'active' : ''}`}
                          onClick={() => {
                            setQuality(q);
                            showToast(`Quality set to ${q}`);
                            setShowSettings(false);
                          }}
                        >
                          <span>{q}</span>
                          {quality === q && <span>✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button className="control-button" onClick={toggleFullscreen} aria-label="Fullscreen">
                  <Maximize size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="video-title-section">
          <h1 className="video-title">{video.title}</h1>
          <div className="video-metadata-row">
            <div className="video-stats">
              {formatViewCount(video.viewCount)} views • {formatTimeAgo(video.uploadDate)}
            </div>
            <div className="video-actions">
              <div className="like-dislike-group">
                <button
                  className={`action-button ${isLiked ? 'liked' : ''}`}
                  onClick={handleLike}
                >
                  <ThumbsUp size={20} />
                  <span>{formatViewCount(video.likeCount)}</span>
                </button>
                <button
                  className={`action-button ${isDisliked ? 'liked' : ''}`}
                  onClick={handleDislike}
                >
                  <ThumbsDown size={20} />
                </button>
              </div>
              <button className="action-button" onClick={handleShare}>
                <Share2 size={20} />
                <span>Share</span>
              </button>
              <button className="action-button" onClick={() => { showToast('Download started'); }}>
                <Download size={20} />
                <span>Download</span>
              </button>
              <button className="action-button" onClick={handleSave}>
                <ListPlus size={20} />
                <span>Save</span>
              </button>
              <div style={{ position: 'relative' }} ref={moreOptionsRef}>
                <button
                  className="action-button"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                >
                  <MoreHorizontal size={20} />
                </button>
                {showMoreOptions && (
                  <div className="settings-dropdown" style={{ right: 0, left: 'auto', minWidth: 200 }}>
                    <div
                      className="settings-item"
                      onClick={() => {
                        toggleWatchLater(videoId);
                        const inWL = data.user.watchLater.includes(videoId);
                        showToast(inWL ? 'Removed from Watch later' : 'Added to Watch later');
                        setShowMoreOptions(false);
                      }}
                    >
                      {data.user.watchLater.includes(videoId) ? 'Remove from Watch later' : 'Add to Watch later'}
                    </div>
                    <div
                      className="settings-item"
                      onClick={() => {
                        navigate(`/channel/${channel.channelId}`);
                        setShowMoreOptions(false);
                      }}
                    >
                      Go to channel
                    </div>
                    <div
                      className="settings-item"
                      onClick={() => {
                        showToast('Report submitted');
                        setShowMoreOptions(false);
                      }}
                    >
                      Report
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="channel-info-section">
          <div className="channel-info-left">
            <img 
              src={channel.avatar} 
              alt={channel.name}
              className="channel-avatar-large"
              onClick={() => navigate(`/channel/${channel.channelId}`)}
            />
            <div className="channel-details" onClick={() => navigate(`/channel/${channel.channelId}`)}>
              <div className="channel-name">{channel.name}</div>
              <div className="channel-subscribers">
                {formatViewCount(channel.subscriberCount)} subscribers
              </div>
            </div>
          </div>
          <div className="subscribe-section">
            <button 
              className={`subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
              onClick={handleSubscribe}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
            {isSubscribed && (
              <button
                className="notification-bell-button"
                aria-label="Notifications"
                onClick={handleNotificationBell}
              >
                <Bell size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="video-description-section" onClick={() => setDescriptionExpanded(!descriptionExpanded)}>
          <div className="description-stats">
            {formatViewCount(video.viewCount)} views  {formatTimeAgo(video.uploadDate)}
          </div>
          <div className={`description-text ${!descriptionExpanded ? 'collapsed' : ''}`}>
            {video.description}
          </div>
          <button
            className="show-more-button"
            onClick={(e) => { e.stopPropagation(); setDescriptionExpanded(!descriptionExpanded); }}
          >
            {descriptionExpanded ? 'Show less' : '...more'}
          </button>
        </div>

        <div className="comments-section">
          <div className="comments-header">
            <div className="comments-count">{comments.length} Comments</div>
            <div className="comments-sort-container" ref={sortDropdownRef} style={{ position: 'relative' }}>
              <div
                className="comments-sort"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                <ChevronDown size={20} />
                <span>{commentSort === 'top' ? 'Top comments' : 'Newest first'}</span>
              </div>
              {showSortDropdown && (
                <div className="comments-sort-dropdown">
                  <div
                    className={`comments-sort-option ${commentSort === 'top' ? 'active' : ''}`}
                    onClick={() => { setCommentSort('top'); setShowSortDropdown(false); }}
                  >
                    Top comments
                  </div>
                  <div
                    className={`comments-sort-option ${commentSort === 'newest' ? 'active' : ''}`}
                    onClick={() => { setCommentSort('newest'); setShowSortDropdown(false); }}
                  >
                    Newest first
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="add-comment">
            <img src={data.user.avatar} alt={data.user.displayName} className="comment-avatar" />
            <div className="comment-input-container">
              <input
                type="text"
                className="comment-input"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onFocus={() => setShowCommentActions(true)}
              />
              {showCommentActions && (
                <div className="comment-actions">
                  <button 
                    className="comment-cancel"
                    onClick={() => {
                      setCommentText('');
                      setShowCommentActions(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="comment-submit"
                    onClick={handleCommentSubmit}
                    disabled={!commentText.trim()}
                  >
                    Comment
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.commentId}>
                <div className="comment-item">
                  <img src={comment.userAvatar} alt={comment.userName} className="comment-avatar" />
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.userName}</span>
                      <span className="comment-time">{formatTimeAgo(comment.timestamp)}</span>
                    </div>
                    <div className="comment-text">{comment.text}</div>
                    <div className="comment-actions-row">
                      <button
                        className={`comment-action ${(comment.likedBy || []).includes(data.user.userId) ? 'liked' : ''}`}
                        onClick={() => handleCommentLike(comment.commentId)}
                      >
                        <ThumbsUp size={16} />
                        <span className="comment-like-count">
                          {comment.likeCount}
                        </span>
                      </button>
                      <button className="comment-action" onClick={() => showToast('Dislike recorded')}>
                        <ThumbsDown size={16} />
                      </button>
                      <button
                        className="comment-action"
                        onClick={() => setReplyingTo(comment.commentId)}
                      >
                        <span>Reply</span>
                      </button>
                    </div>
                    {replyingTo === comment.commentId && (
                      <div className="reply-input-section">
                        <img src={data.user.avatar} alt={data.user.displayName} className="comment-avatar" />
                        <div className="reply-input-container">
                          <input
                            type="text"
                            className="comment-input"
                            placeholder="Add a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            autoFocus
                          />
                          <div className="comment-actions">
                            <button 
                              className="comment-cancel"
                              onClick={() => {
                                setReplyText('');
                                setReplyingTo(null);
                              }}
                            >
                              Cancel
                            </button>
                            <button 
                              className="comment-submit"
                              onClick={() => handleReplySubmit(comment.commentId)}
                              disabled={!replyText.trim()}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                      <>
                        <button
                          className="show-replies-btn"
                          onClick={() => setExpandedReplies(prev => ({ ...prev, [comment.commentId]: !prev[comment.commentId] }))}
                          style={{ marginLeft: 0, marginTop: 4 }}
                        >
                          {expandedReplies[comment.commentId] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </button>
                        {expandedReplies[comment.commentId] && (
                          <div className="comment-replies" style={{ marginLeft: 0 }}>
                            {comment.replies.map(reply => (
                              <div key={reply.commentId} className="comment-item">
                                <img src={reply.userAvatar} alt={reply.userName} className="comment-avatar" style={{ width: 24, height: 24 }} />
                                <div className="comment-content">
                                  <div className="comment-header">
                                    <span className="comment-author">{reply.userName}</span>
                                    <span className="comment-time">{formatTimeAgo(reply.timestamp)}</span>
                                  </div>
                                  <div className="comment-text">{reply.text}</div>
                                  <div className="comment-actions-row">
                                    <button
                                      className={`comment-action ${(reply.likedBy || []).includes(data.user.userId) ? 'liked' : ''}`}
                                      onClick={() => handleCommentLike(reply.commentId, true, comment.commentId)}
                                    >
                                      <ThumbsUp size={14} />
                                      <span className="comment-like-count">
                                        {reply.likeCount}
                                      </span>
                                    </button>
                                    <button className="comment-action" onClick={() => showToast('Dislike recorded')}>
                                      <ThumbsDown size={14} />
                                    </button>
                                    <button
                                      className="comment-reply-btn"
                                      onClick={() => setReplyingTo(comment.commentId)}
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="video-player-sidebar">
        <div className="suggested-header">
          <span className="suggested-header-title">Up next</span>
          <div className="autoplay-toggle">
            <span className="autoplay-label">Autoplay</span>
            <label className="autoplay-switch">
              <input
                type="checkbox"
                checked={autoplayEnabled}
                onChange={() => setAutoplayEnabled(!autoplayEnabled)}
              />
              <span className="autoplay-slider" />
            </label>
          </div>
        </div>
        <div className="suggested-videos">
          {suggestedVideos.map(suggestedVideo => (
            <div
              key={suggestedVideo.videoId}
              className="suggested-video-item"
              onClick={() => handleSuggestedVideoClick(suggestedVideo.videoId)}
            >
              <div className="suggested-thumb-wrapper">
                <img
                  src={suggestedVideo.thumbnail}
                  alt={suggestedVideo.title}
                  className="suggested-thumbnail"
                />
                <span className="suggested-duration">
                  {suggestedVideo.duration}
                </span>
              </div>
              <div className="suggested-info">
                <div className="suggested-title">{suggestedVideo.title}</div>
                <div className="suggested-channel">{suggestedVideo.channelName}</div>
                <div className="suggested-stats">
                  {formatViewCount(suggestedVideo.viewCount)} views • {formatTimeAgo(suggestedVideo.uploadDate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        videoId={videoId}
        videoTitle={video.title}
        currentTime={currentTime}
      />

      <PlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        videoId={videoId}
      />
    </div>
  );
};

export default VideoPlayerPage;
  