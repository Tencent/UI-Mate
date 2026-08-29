import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import './ComposeBox.css';

const EMOJI_LIST = [
  '😂', '🥰', '😭', '😍', '🤔', '👍', '❤️', '🎉', '🔥', '💪',
  '😅', '🤣', '🥺', '😊', '🙏', '✨', '🎊', '💕', '😏', '😁',
  '🤦', '🤷', '😤', '😓', '🥳', '🫶', '🤩', '😴', '🤯', '🫠',
];

const LOCATION_OPTIONS = ['北京市', '上海市', '广州市', '深圳市', '成都市', '杭州市'];

export default function ComposeBox() {
  const { state, dispatch } = useApp();
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMention, setShowMention] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handlePublish = () => {
    if (!text.trim()) return;
    dispatch({
      type: 'PUBLISH_POST',
      text: text.trim(),
      images: selectedImages,
      video: selectedVideos.length > 0 ? selectedVideos[0] : null,
      location: selectedLocation || null,
    });
    setText('');
    setShowEmoji(false);
    setSelectedImages([]);
    setSelectedVideos([]);
    setSelectedLocation('');
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedImages(prev => [...prev, ...files.map(f => f.name)]);
    e.target.value = '';
  };

  const handleRemoveImage = (idx) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedVideos(prev => [...prev, ...files.map(f => f.name)]);
    e.target.value = '';
  };

  const handleRemoveVideo = (idx) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc);
    setShowLocation(false);
  };

  const handleEmojiClick = (emoji) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newText = text.slice(0, start) + emoji + text.slice(end);
      setText(newText);
      setTimeout(() => {
        ta.selectionStart = start + emoji.length;
        ta.selectionEnd = start + emoji.length;
        ta.focus();
      }, 0);
    } else {
      setText(prev => prev + emoji);
    }
    setShowEmoji(false);
  };

  const handleTopicInsert = () => {
    const tag = '#话题名#';
    setText(prev => prev + tag);
    textareaRef.current?.focus();
  };

  const handleMentionSelect = (user) => {
    setText(prev => prev + `@${user.handle} `);
    setShowMention(false);
    textareaRef.current?.focus();
  };

  const followedUsers = Object.values(state.users || {})
    .filter(u => u.id !== 'user_current' && u.isFollowing);

  return (
    <div className="compose-box card">
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />
      <input
        type="file"
        accept=".mp4,.mov,.avi,video/*"
        multiple
        ref={videoInputRef}
        style={{ display: 'none' }}
        onChange={handleVideoChange}
      />
      <div className="compose-inner">
        <img
          src={state.currentUser?.avatar}
          alt={state.currentUser?.screenName}
          className="avatar compose-avatar"
        />
        <div className="compose-content">
          <textarea
            ref={textareaRef}
            className="compose-textarea"
            placeholder="有什么新鲜事想告诉大家？"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={text.length > 0 ? 4 : 2}
          />

          {/* Attachment previews */}
          {(selectedImages.length > 0 || selectedVideos.length > 0 || selectedLocation) && (
            <div className="compose-attachments">
              {selectedImages.map((name, idx) => (
                <span key={idx} className="attachment-tag">
                  📷 {name}
                  <button className="attachment-remove" onClick={() => handleRemoveImage(idx)}>×</button>
                </span>
              ))}
              {selectedVideos.map((name, idx) => (
                <span key={idx} className="attachment-tag video-tag">
                  🎬 {name}
                  <button className="attachment-remove" onClick={() => handleRemoveVideo(idx)}>×</button>
                </span>
              ))}
              {selectedLocation && (
                <span className="attachment-tag location-tag">
                  📍 {selectedLocation}
                  <button className="attachment-remove" onClick={() => setSelectedLocation('')}>×</button>
                </span>
              )}
            </div>
          )}

          {/* Toolbar */}
          <div className="compose-toolbar">
            <div className="toolbar-icons">
              <button className="toolbar-btn" title="图片" onClick={handleImageClick}>
                📷 <span>图片</span>
              </button>
              <button className="toolbar-btn" title="视频" onClick={handleVideoClick}>
                🎬 <span>视频</span>
              </button>
              <div className="toolbar-dropdown-wrap">
                <button
                  className="toolbar-btn"
                  title="表情"
                  onClick={() => { setShowEmoji(!showEmoji); setShowMention(false); setShowLocation(false); }}
                >
                  😊 <span>表情</span>
                </button>
                {showEmoji && (
                  <div className="emoji-picker">
                    <div className="emoji-grid">
                      {EMOJI_LIST.map(emoji => (
                        <button
                          key={emoji}
                          className="emoji-btn"
                          onClick={() => handleEmojiClick(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button className="toolbar-btn" title="话题" onClick={handleTopicInsert}>
                # <span>话题</span>
              </button>
              <div className="toolbar-dropdown-wrap">
                <button
                  className="toolbar-btn"
                  title="提到"
                  onClick={() => { setShowMention(!showMention); setShowEmoji(false); setShowLocation(false); }}
                >
                  @ <span>提到</span>
                </button>
                {showMention && (
                  <div className="mention-dropdown">
                    {followedUsers.length === 0 ? (
                      <div className="mention-empty">暂无关注用户</div>
                    ) : (
                      followedUsers.map(user => (
                        <div
                          key={user.id}
                          className="mention-item"
                          onClick={() => handleMentionSelect(user)}
                        >
                          <img src={user.avatar} alt={user.screenName} className="avatar" style={{ width: 28, height: 28 }} />
                          <span>{user.screenName}</span>
                          <span className="mention-handle">@{user.handle}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="toolbar-dropdown-wrap">
                <button
                  className="toolbar-btn"
                  title="位置"
                  onClick={() => { setShowLocation(!showLocation); setShowEmoji(false); setShowMention(false); }}
                >
                  📍 <span>位置</span>
                </button>
                {showLocation && (
                  <div className="mention-dropdown">
                    {LOCATION_OPTIONS.map(loc => (
                      <div
                        key={loc}
                        className="mention-item"
                        onClick={() => handleLocationSelect(loc)}
                        style={{ cursor: 'pointer' }}
                      >
                        📍 {loc}
                        {selectedLocation === loc && <span style={{ marginLeft: 'auto', color: 'var(--color-primary)' }}>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="compose-right">
              {text.length > 0 && (
                <span className={`char-count ${text.length > 2000 ? 'char-over' : ''}`}>
                  {text.length}
                </span>
              )}
              <button
                className="btn btn-primary publish-btn"
                onClick={handlePublish}
                disabled={!text.trim() || text.length > 2000}
              >
                发布
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
