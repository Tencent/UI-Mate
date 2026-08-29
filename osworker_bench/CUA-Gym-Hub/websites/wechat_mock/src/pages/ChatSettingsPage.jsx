
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { getSessionId } from '../utils/storage';
import './ChatSettingsPage.css';

const ChatSettingsPage = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const contacts = useStore(state => state.contacts);
  const conversations = useStore(state => state.conversations);
  const clearChatHistory = useStore(state => state.clearChatHistory);
  const pinConversation = useStore(state => state.pinConversation);
  const muteConversation = useStore(state => state.muteConversation);

  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const contact = contacts.find(c => c.userId === contactId);
  const conversation = conversations.find(c => c.contactId === contactId);

  const sid = getSessionId();
  const bgKey = `wechat_chat_bg_${sid}_${contactId}`;
  const [selectedBg, setSelectedBg] = useState(() => {
    try {
      return localStorage.getItem(bgKey) || '';
    } catch { return ''; }
  });

  const backgroundOptions = [
    { id: 'default', color: '#f5f5f5', label: '默认' },
    { id: 'white', color: '#ffffff', label: '白色' },
    { id: 'light-green', color: '#e8f5e9', label: '浅绿' },
    { id: 'light-blue', color: '#e3f2fd', label: '浅蓝' },
    { id: 'pattern1', color: '', image: 'https://picsum.photos/200/200?random=bgpat1', label: '花纹一' },
    { id: 'pattern2', color: '', image: 'https://picsum.photos/200/200?random=bgpat2', label: '花纹二' },
  ];

  const handleClearHistory = () => {
    setShowClearConfirm(true);
  };

  const confirmClearHistory = () => {
    clearChatHistory(contactId);
    setShowClearConfirm(false);
    navigate('/messages');
  };

  const handleSelectBackground = (bg) => {
    const value = bg.image ? `url(${bg.image})` : bg.color;
    setSelectedBg(value);
    try {
      if (bg.id === 'default') {
        localStorage.removeItem(bgKey);
      } else {
        localStorage.setItem(bgKey, value);
      }
    } catch {}
    setShowBackgroundPicker(false);
  };

  if (!contact) {
    return <div>联系人不存在</div>;
  }

  return (
    <div className="chat-settings-page">
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <h1>聊天设置</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <div className="setting-item" onClick={() => navigate(`/search-chat/${contactId}`)}>
            <span className="setting-label">查找聊天记录</span>
            <span className="arrow">›</span>
          </div>
        </div>

        <div className="settings-section">
          <div className="setting-item toggle-item">
            <span className="setting-label">消息免打扰</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={conversation?.isMuted || false}
                onChange={() => muteConversation(contactId)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item toggle-item">
            <span className="setting-label">置顶聊天</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={conversation?.isPinned || false}
                onChange={() => pinConversation(contactId)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <div className="setting-item" onClick={() => setShowBackgroundPicker(true)}>
            <span className="setting-label">聊天背景</span>
            <div className="setting-value-row">
              {selectedBg && (
                <span
                  className="bg-preview-dot"
                  style={{
                    background: selectedBg.startsWith('url(')
                      ? `${selectedBg} center/cover`
                      : selectedBg
                  }}
                />
              )}
              <span className="arrow">›</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="setting-item danger" onClick={handleClearHistory}>
            <span className="setting-label danger-text">清空聊天记录</span>
          </div>
        </div>
      </div>

      {/* Background Picker */}
      {showBackgroundPicker && (
        <div className="dialog-overlay" onClick={() => setShowBackgroundPicker(false)}>
          <div className="bg-picker-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="bg-picker-header">
              <h3>选择聊天背景</h3>
              <button className="dialog-close-btn" onClick={() => setShowBackgroundPicker(false)}>✕</button>
            </div>
            <div className="bg-picker-grid">
              {backgroundOptions.map(bg => {
                const currentVal = bg.image ? `url(${bg.image})` : bg.color;
                const isSelected = (bg.id === 'default' && !selectedBg) || selectedBg === currentVal;
                return (
                  <div
                    key={bg.id}
                    className={`bg-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectBackground(bg)}
                  >
                    <div
                      className="bg-option-preview"
                      style={bg.image
                        ? { backgroundImage: `url(${bg.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { backgroundColor: bg.color }
                      }
                    >
                      {isSelected && <span className="bg-check">✓</span>}
                    </div>
                    <span className="bg-option-label">{bg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Clear History Confirm Dialog */}
      {showClearConfirm && (
        <div className="dialog-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-text">确定要清空聊天记录吗？</div>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowClearConfirm(false)}>取消</button>
              <button className="confirm-ok" onClick={confirmClearHistory}>清空</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSettingsPage;
