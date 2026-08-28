import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { relativeTime } from '../utils/helpers.js';

export default function MessagesPage() {
  const { conversationId: urlConvId } = useParams();
  const navigate = useNavigate();
  const { state, currentUserId, sendMessage, markConvRead } = useApp();
  const [activeConvId, setActiveConvId] = useState(urlConvId || null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (urlConvId) {
      setActiveConvId(urlConvId);
      markConvRead(urlConvId);
    }
  }, [urlConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, state?.messages]);

  if (!state) return <div className="loading-state">加载中...</div>;

  const conversations = Object.values(state.conversations || {})
    .sort((a, b) => b.lastMessageAt - a.lastMessageAt);

  const getOtherParticipant = (conv) => {
    const otherId = conv.participantIds.find(id => id !== currentUserId);
    return state.users?.[otherId];
  };

  const activeConv = activeConvId ? state.conversations?.[activeConvId] : null;
  const otherUser = activeConv ? getOtherParticipant(activeConv) : null;

  const convMessages = activeConvId
    ? Object.values(state.messages || {})
        .filter(m => m.conversationId === activeConvId)
        .sort((a, b) => a.createdAt - b.createdAt)
    : [];

  const handleSend = (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !activeConvId) return;
    sendMessage(activeConvId, text);
    setInputText('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleSelectConv = (convId) => {
    setActiveConvId(convId);
    navigate(`/messages/${convId}`);
    markConvRead(convId);
  };

  return (
    <div className="messages-page">
      {/* Sidebar */}
      <div className="messages-sidebar">
        <div className="messages-sidebar-header">私信</div>
        {conversations.map(conv => {
          const other = getOtherParticipant(conv);
          return (
            <div
              key={conv.id}
              className={`conversation-item ${conv.id === activeConvId ? 'active' : ''}`}
              onClick={() => handleSelectConv(conv.id)}
            >
              <img
                src={other?.avatar}
                alt={other?.nickname}
                className="conv-avatar"
                onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
              />
              <div className="conv-info">
                <div className="conv-name-row">
                  <span className={`conv-name ${conv.unreadCount > 0 ? 'unread' : ''}`}>
                    {other?.nickname}
                  </span>
                  <span className="conv-time">{relativeTime(conv.lastMessageAt)}</span>
                </div>
                <div className="conv-preview">{conv.lastMessagePreview}</div>
              </div>
              {conv.unreadCount > 0 && (
                <div className="conv-unread-badge">{conv.unreadCount}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chat panel */}
      {activeConv && otherUser ? (
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <img
              src={otherUser.avatar}
              alt={otherUser.nickname}
              className="chat-header-avatar"
              onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
            />
            <span className="chat-header-name">{otherUser.nickname}</span>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {convMessages.map(msg => {
              const isOwn = msg.senderId === currentUserId;
              const sender = state.users?.[msg.senderId];
              return (
                <div
                  key={msg.id}
                  className={`message-bubble-row ${isOwn ? 'own' : ''}`}
                >
                  {!isOwn && (
                    <img
                      src={sender?.avatar}
                      alt={sender?.nickname}
                      className="message-bubble-avatar"
                      onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
                    />
                  )}
                  <div>
                    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                      {msg.content}
                    </div>
                    <div className="message-time" style={{ textAlign: isOwn ? 'right' : 'left' }}>
                      {relativeTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chat-input-area" onSubmit={handleSend}>
            <input
              type="text"
              className="chat-input"
              placeholder="发送消息..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />
            <button type="submit" className="chat-send-btn" disabled={!inputText.trim()}>
              ↑
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-panel">
          <div className="chat-empty-state">
            <div className="chat-empty-icon">💬</div>
            <div>选择一个对话开始聊天</div>
          </div>
        </div>
      )}
    </div>
  );
}
