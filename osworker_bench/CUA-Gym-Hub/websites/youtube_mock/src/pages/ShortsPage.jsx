
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import './ShortsPage.css';

const ShortsPage = () => {
  const { data, showToast } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedShorts, setLikedShorts] = useState([]);
  const [dislikedShorts, setDislikedShorts] = useState([]);

  const shorts = data.shorts || [];

  if (shorts.length === 0) {
    return (
      <div className="shorts-page">
        <div className="shorts-empty">No Shorts available</div>
      </div>
    );
  }

  const currentShort = shorts[currentIndex];

  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < shorts.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleLike = (shortId) => {
    if (likedShorts.includes(shortId)) {
      setLikedShorts(likedShorts.filter(id => id !== shortId));
    } else {
      setLikedShorts([...likedShorts, shortId]);
      setDislikedShorts(dislikedShorts.filter(id => id !== shortId));
    }
  };

  const handleDislike = (shortId) => {
    if (dislikedShorts.includes(shortId)) {
      setDislikedShorts(dislikedShorts.filter(id => id !== shortId));
    } else {
      setDislikedShorts([...dislikedShorts, shortId]);
      setLikedShorts(likedShorts.filter(id => id !== shortId));
    }
  };

  return (
    <div className="shorts-page">
      <div className="shorts-container">
        <div className="shorts-nav">
          <button
            className="shorts-nav-btn"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous short"
          >
            <ChevronUp size={24} />
          </button>
        </div>

        <div className="shorts-viewer">
          <div className="shorts-card">
            <div className="shorts-video-area">
              <img
                src={currentShort.thumbnail}
                alt={currentShort.title}
                className="shorts-thumbnail"
              />
              <div className="shorts-overlay-info">
                <div className="shorts-channel-row">
                  <img src={currentShort.channelAvatar} alt="" className="shorts-channel-avatar" />
                  <span className="shorts-channel-name">{currentShort.channelName}</span>
                  <button className="shorts-subscribe-btn" onClick={() => showToast('Subscribed')}>Subscribe</button>
                </div>
                <div className="shorts-title">{currentShort.title}</div>
              </div>
            </div>

            <div className="shorts-actions-bar">
              <button
                className={`shorts-action-btn ${likedShorts.includes(currentShort.shortId) ? 'active' : ''}`}
                onClick={() => handleLike(currentShort.shortId)}
              >
                <ThumbsUp size={24} />
                <span>{formatCount(currentShort.likeCount + (likedShorts.includes(currentShort.shortId) ? 1 : 0))}</span>
              </button>
              <button
                className={`shorts-action-btn ${dislikedShorts.includes(currentShort.shortId) ? 'active' : ''}`}
                onClick={() => handleDislike(currentShort.shortId)}
              >
                <ThumbsDown size={24} />
                <span>Dislike</span>
              </button>
              <button className="shorts-action-btn" onClick={() => showToast('Comments opened')}>
                <MessageCircle size={24} />
                <span>{formatCount(currentShort.commentCount)}</span>
              </button>
              <button className="shorts-action-btn" onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); showToast('Link copied'); }}>
                <Share2 size={24} />
                <span>Share</span>
              </button>
              <button className="shorts-action-btn" onClick={() => showToast('More options')}>
                <MoreVertical size={24} />
              </button>
              <div className="shorts-sound-btn">
                <img src={currentShort.channelAvatar} alt="" className="shorts-sound-avatar" />
              </div>
            </div>
          </div>
        </div>

        <div className="shorts-nav">
          <button
            className="shorts-nav-btn"
            onClick={handleNext}
            disabled={currentIndex >= shorts.length - 1}
            aria-label="Next short"
          >
            <ChevronDown size={24} />
          </button>
        </div>
      </div>

      <div className="shorts-indicator">
        {currentIndex + 1} / {shorts.length}
      </div>
    </div>
  );
};

export default ShortsPage;
