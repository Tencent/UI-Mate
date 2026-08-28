
import React, { useState } from 'react';
import { X, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, videoId, videoTitle, currentTime }) => {
  const { showToast } = useData();
  const [includeTimestamp, setIncludeTimestamp] = useState(false);

  const baseUrl = `${window.location.origin}/watch/${videoId}`;
  const shareUrl = includeTimestamp && currentTime
    ? `${baseUrl}?t=${Math.floor(currentTime)}`
    : baseUrl;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    showToast('Link copied to clipboard');
  };

  const handleSocialShare = (platform) => {
    showToast(`Shared to ${platform}`);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Share</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className="share-options">
          <div className="share-link-section">
            <input
              type="text"
              className="share-link-input"
              value={shareUrl}
              readOnly
            />
            <button className="copy-button" onClick={handleCopyLink}>
              Copy
            </button>
          </div>

          <div className="timestamp-checkbox">
            <input
              type="checkbox"
              id="timestamp"
              checked={includeTimestamp}
              onChange={(e) => setIncludeTimestamp(e.target.checked)}
            />
            <label htmlFor="timestamp">Start at current time</label>
          </div>

          <div className="social-buttons">
            <button className="social-button" onClick={() => handleSocialShare('Facebook')}>
              <Facebook size={20} />
              <span>Facebook</span>
            </button>
            <button className="social-button" onClick={() => handleSocialShare('Twitter')}>
              <Twitter size={20} />
              <span>Twitter</span>
            </button>
            <button className="social-button" onClick={() => handleSocialShare('WhatsApp')}>
              <MessageCircle size={20} />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
  