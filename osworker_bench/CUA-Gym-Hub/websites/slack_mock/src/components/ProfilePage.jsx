
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import EmojiPicker from './EmojiPicker';
import './ProfilePage.css';

const POPULAR_STATUS_EMOJIS = [
  { emoji: '\u{1F3E0}', label: 'Working from home' },
  { emoji: '\u{1F4C5}', label: 'In a meeting' },
  { emoji: '\u{1F912}', label: 'Out sick' },
  { emoji: '\u{1F3D6}\uFE0F', label: 'Vacationing' },
  { emoji: '\u{1F68C}', label: 'Commuting' },
  { emoji: '\u{1F3AF}', label: 'Focusing' },
  { emoji: '\u{1F4AC}', label: 'Available' },
  { emoji: '\u{1F534}', label: 'Busy' },
];

function ProfilePage() {
  const { state, updateUserProfile } = useApp();

  if (!state || !state.currentUser) {
    return <div className="profile-page">Loading...</div>;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [showFullEmojiPicker, setShowFullEmojiPicker] = useState(false);
  const [formData, setFormData] = useState({
    fullName: state.currentUser.fullName,
    displayName: state.currentUser.displayName,
    title: state.currentUser.title,
    statusMessage: state.currentUser.statusMessage,
    statusEmoji: state.currentUser.statusEmoji || '',
    email: state.currentUser.email,
    timeZone: state.currentUser.timeZone
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectStatusEmoji = (emoji) => {
    setFormData(prev => ({
      ...prev,
      statusEmoji: prev.statusEmoji === emoji ? '' : emoji
    }));
    setShowFullEmojiPicker(false);
  };

  const handleClearStatusEmoji = () => {
    setFormData(prev => ({ ...prev, statusEmoji: '' }));
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>Your Profile</h2>
        {!isEditing && (
          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-avatar-section">
          <img
            src={state.currentUser.avatar}
            alt={state.currentUser.displayName}
            className="profile-avatar-large"
          />
          <div className="profile-status">
            <span
              className="profile-status-dot"
              style={{
                backgroundColor: state.currentUser.status === 'online' ? '#2BAC76' :
                                state.currentUser.status === 'busy' ? '#E01E5A' : '#CCCCCC'
              }}
            />
            <span className="profile-status-text">
              {state.currentUser.statusEmoji && <span className="profile-status-emoji">{state.currentUser.statusEmoji}</span>}
              {state.currentUser.status.charAt(0).toUpperCase() + state.currentUser.status.slice(1)}
            </span>
          </div>
        </div>

        {isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Status Emoji</label>
              <div className="status-emoji-picker">
                <div className="status-emoji-current">
                  {formData.statusEmoji ? (
                    <span className="selected-status-emoji">
                      {formData.statusEmoji}
                      <button type="button" className="clear-emoji-btn" onClick={handleClearStatusEmoji} title="Clear emoji">&times;</button>
                    </span>
                  ) : (
                    <span className="no-emoji-placeholder">No emoji selected</span>
                  )}
                </div>
                <div className="popular-emojis">
                  {POPULAR_STATUS_EMOJIS.map((item) => (
                    <button
                      key={item.emoji}
                      type="button"
                      className={`popular-emoji-btn ${formData.statusEmoji === item.emoji ? 'selected' : ''}`}
                      onClick={() => handleSelectStatusEmoji(item.emoji)}
                      title={item.label}
                    >
                      {item.emoji}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="more-emoji-btn"
                    onClick={() => setShowFullEmojiPicker(!showFullEmojiPicker)}
                    title="Browse all emoji"
                  >
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM7 8.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-4.2 3a.75.75 0 0 1 1.05-.15c.7.5 1.4.75 2.15.75s1.45-.25 2.15-.75a.75.75 0 1 1 .9 1.2A4.77 4.77 0 0 1 10 13.5a4.77 4.77 0 0 1-3.05-1.05.75.75 0 0 1-.15-1.05z"/></svg>
                  </button>
                </div>
                {showFullEmojiPicker && (
                  <div className="status-emoji-picker-popup">
                    <EmojiPicker
                      onSelect={handleSelectStatusEmoji}
                      onClose={() => setShowFullEmojiPicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Status Message</label>
              <input
                type="text"
                name="statusMessage"
                value={formData.statusMessage}
                onChange={handleChange}
                placeholder="What's your status?"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Time Zone</label>
              <input
                type="text"
                name="timeZone"
                value={formData.timeZone}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setIsEditing(false);
                  setShowFullEmojiPicker(false);
                  setFormData({
                    fullName: state.currentUser.fullName,
                    displayName: state.currentUser.displayName,
                    title: state.currentUser.title,
                    statusMessage: state.currentUser.statusMessage,
                    statusEmoji: state.currentUser.statusEmoji || '',
                    email: state.currentUser.email,
                    timeZone: state.currentUser.timeZone
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <label>Full Name</label>
              <div className="info-value">{state.currentUser.fullName}</div>
            </div>

            <div className="info-group">
              <label>Display Name</label>
              <div className="info-value">
                {state.currentUser.statusEmoji && <span className="profile-display-emoji">{state.currentUser.statusEmoji} </span>}
                {state.currentUser.displayName}
              </div>
            </div>

            <div className="info-group">
              <label>Title</label>
              <div className="info-value">{state.currentUser.title}</div>
            </div>

            <div className="info-group">
              <label>Status</label>
              <div className="info-value">
                {state.currentUser.statusEmoji && <span>{state.currentUser.statusEmoji} </span>}
                {state.currentUser.statusMessage || <em>No status message</em>}
              </div>
            </div>

            <div className="info-group">
              <label>Email</label>
              <div className="info-value">{state.currentUser.email}</div>
            </div>

            <div className="info-group">
              <label>Time Zone</label>
              <div className="info-value">{state.currentUser.timeZone}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
