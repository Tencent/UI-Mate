
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatTime } from '../utils/helpers';
import './MessagesPage.css';

const MessagesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [activeSwipe, setActiveSwipe] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);

  const conversations = useStore(state => state.conversations) || [];
  const contacts = useStore(state => state.contacts) || [];
  const groups = useStore(state => state.groups) || [];
  const pinConversation = useStore(state => state.pinConversation);
  const markAsRead = useStore(state => state.markAsRead);
  const deleteConversation = useStore(state => state.deleteConversation);

  const getContactInfo = (contactId) => {
    return contacts.find(c => c.userId === contactId);
  };

  const getGroupInfo = (groupId) => {
    return groups.find(g => g.groupId === groupId);
  };

  const getChatInfo = (conv) => {
    if (conv.isGroup) {
      return getGroupInfo(conv.contactId);
    }
    return getContactInfo(conv.contactId);
  };

  // Sort: pinned first, then by time
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastTime) - new Date(a.lastTime);
  });

  const filteredConversations = sortedConversations.filter(conv => {
    const chatInfo = getChatInfo(conv);
    if (!chatInfo) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = (chatInfo.nickname || chatInfo.name || '').toLowerCase().includes(query);
      const messageMatch = (conv.lastMessage || '').toLowerCase().includes(query);
      return nameMatch || messageMatch;
    }
    return true;
  });

  const handleTouchStart = (contactId, e) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (contactId, e) => {
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchStartX.current - touchCurrentX.current;
    if (diff > 50) {
      setActiveSwipe(contactId);
    } else if (diff < -20) {
      setActiveSwipe(null);
    }
  };

  const handleTouchEnd = () => {
    // Keep swipe state
  };

  const handleSwipePin = (contactId, e) => {
    e.stopPropagation();
    pinConversation(contactId);
    setActiveSwipe(null);
  };

  const handleSwipeRead = (contactId, e) => {
    e.stopPropagation();
    markAsRead(contactId);
    setActiveSwipe(null);
  };

  const handleSwipeDelete = (contactId, e) => {
    e.stopPropagation();
    setShowDeleteConfirm(contactId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteConversation(showDeleteConfirm);
      setShowDeleteConfirm(null);
      setActiveSwipe(null);
    }
  };

  const totalUnread = conversations
    .filter(c => !c.isMuted)
    .reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="messages-page" onClick={() => { setShowPlusMenu(false); setActiveSwipe(null); }}>
      <div className="messages-header">
        <h1>微信{totalUnread > 0 ? `(${totalUnread})` : ''}</h1>
        <button className="add-btn" onClick={(e) => { e.stopPropagation(); setShowPlusMenu(!showPlusMenu); }}>+</button>
      </div>

      {showPlusMenu && (
        <div className="plus-menu" onClick={(e) => e.stopPropagation()}>
          <div className="plus-menu-item" onClick={() => { setShowPlusMenu(false); navigate('/groups'); }}>
            <span className="plus-menu-icon">👥</span>
            <span>发起群聊</span>
          </div>
          <div className="plus-menu-item" onClick={() => { setShowPlusMenu(false); navigate('/contacts'); }}>
            <span className="plus-menu-icon">➕</span>
            <span>添加朋友</span>
          </div>
          <div className="plus-menu-item" onClick={() => setShowPlusMenu(false)}>
            <span className="plus-menu-icon">📷</span>
            <span>扫一扫</span>
          </div>
          <div className="plus-menu-item" onClick={() => setShowPlusMenu(false)}>
            <span className="plus-menu-icon">💳</span>
            <span>收付款</span>
          </div>
        </div>
      )}

      <div className="search-bar" data-testid="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="搜索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="search-input"
        />
      </div>

      <div className="conversations-list">
        {filteredConversations.length === 0 ? (
          <div className="empty-state">
            <p>暂无对话</p>
          </div>
        ) : (
          filteredConversations.map(conv => {
            const chatInfo = getChatInfo(conv);
            if (!chatInfo) return null;

            const chatName = chatInfo.nickname || chatInfo.name;
            const chatPath = conv.isGroup ? `/group/${conv.contactId}` : `/chat/${conv.contactId}`;
            const isSwipeOpen = activeSwipe === conv.contactId;

            let messagePreview;
            if (conv.draft) {
              messagePreview = (
                <span className="last-message">
                  <span className="draft-tag">[草稿]</span>
                  <span className="draft-text">{conv.draft}</span>
                </span>
              );
            } else {
              messagePreview = <span className="last-message">{conv.lastMessage}</span>;
            }

            return (
              <div
                key={conv.contactId}
                className={`conversation-item-wrapper ${isSwipeOpen ? 'swiped' : ''}`}
                data-testid={`conversation-${conv.contactId}`}
              >
                <div
                  className={`conversation-item ${conv.isPinned ? 'pinned' : ''}`}
                  onClick={() => navigate(chatPath)}
                  onTouchStart={(e) => handleTouchStart(conv.contactId, e)}
                  onTouchMove={(e) => handleTouchMove(conv.contactId, e)}
                  onTouchEnd={handleTouchEnd}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setActiveSwipe(isSwipeOpen ? null : conv.contactId);
                  }}
                >
                  <img src={chatInfo.avatar} alt={chatName} className="avatar" />
                  <div className="conversation-info">
                    <div className="conversation-top">
                      <span className="contact-name">{chatName}</span>
                      <div className="top-right">
                        <span className="time">{formatTime(conv.lastTime)}</span>
                      </div>
                    </div>
                    <div className="conversation-bottom">
                      {messagePreview}
                      <div className="bottom-right">
                        {conv.isMuted && <span className="mute-icon">🔇</span>}
                        {conv.unreadCount > 0 && !conv.isMuted && (
                          <span className="unread-badge">
                            {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                          </span>
                        )}
                        {conv.unreadCount > 0 && conv.isMuted && (
                          <span className="unread-dot"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {isSwipeOpen && (
                  <div className="swipe-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="swipe-btn pin-btn" onClick={(e) => handleSwipePin(conv.contactId, e)}>
                      {conv.isPinned ? '取消置顶' : '置顶'}
                    </button>
                    <button className="swipe-btn read-btn" onClick={(e) => handleSwipeRead(conv.contactId, e)}>
                      已读
                    </button>
                    <button className="swipe-btn delete-btn" onClick={(e) => handleSwipeDelete(conv.contactId, e)}>
                      删除
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showDeleteConfirm && (
        <div className="dialog-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-text">确定删除该聊天吗？</div>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowDeleteConfirm(null)}>取消</button>
              <button className="confirm-ok" onClick={confirmDelete}>删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
