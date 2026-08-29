import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatRelativeTime } from '../utils/helpers';
import './Pages.css';

export default function MessagesPage() {
  const { state, dispatch } = useApp();
  const [activeConvId, setActiveConvId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  const conversations = Object.values(state.conversations || {})
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

  const activeConv = activeConvId ? state.conversations?.[activeConvId] : null;
  const otherUserId = activeConv
    ? activeConv.participantIds.find(id => id !== 'user_current')
    : null;
  const otherUser = otherUserId ? state.users?.[otherUserId] : null;

  const convMessages = activeConvId
    ? Object.values(state.messages || {})
        .filter(m => m.conversationId === activeConvId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : [];

  const handleSelectConv = (convId) => {
    setActiveConvId(convId);
    dispatch({ type: 'MARK_CONVERSATION_READ', conversationId: convId });
  };

  const handleSend = () => {
    if (!messageText.trim() || !activeConvId || !otherUserId) return;
    dispatch({
      type: 'SEND_MESSAGE',
      conversationId: activeConvId,
      receiverId: otherUserId,
      text: messageText.trim(),
    });
    setMessageText('');
  };

  return (
    <div className="page-content">
      <div className="messages-layout">
        {/* Conversation List */}
        <div className="conv-list">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 'bold', fontSize: 15 }}>
            私信
          </div>
          {conversations.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <p>暂无私信</p>
            </div>
          ) : (
            conversations.map(conv => {
              const otherId = conv.participantIds.find(id => id !== 'user_current');
              const otherUser = state.users?.[otherId];
              const lastMsg = conv.lastMessageId ? state.messages?.[conv.lastMessageId] : null;

              return (
                <div
                  key={conv.id}
                  className={`conv-item ${activeConvId === conv.id ? 'conv-item-active' : ''}`}
                  onClick={() => handleSelectConv(conv.id)}
                >
                  <img
                    src={otherUser?.avatar}
                    alt={otherUser?.screenName}
                    className="avatar"
                    style={{ width: 44, height: 44 }}
                  />
                  <div className="conv-info">
                    <div className="conv-name" style={{ fontWeight: conv.unreadCount > 0 ? 'bold' : 'normal' }}>
                      {otherUser?.screenName || '未知用户'}
                    </div>
                    <div className="conv-preview">
                      {lastMsg?.text?.slice(0, 30) || ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className="conv-time">{lastMsg ? formatRelativeTime(lastMsg.createdAt) : ''}</span>
                    {conv.unreadCount > 0 && (
                      <span style={{
                        background: 'var(--color-hot)',
                        color: 'white',
                        borderRadius: 8,
                        padding: '1px 6px',
                        fontSize: 11,
                        fontWeight: 'bold'
                      }}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Panel */}
        {activeConv && otherUser ? (
          <div className="chat-panel">
            <div className="chat-header">
              <img
                src={otherUser.avatar}
                alt={otherUser.screenName}
                className="avatar"
                style={{ width: 32, height: 32 }}
              />
              {otherUser.screenName}
            </div>

            <div className="chat-messages">
              {convMessages.map(msg => {
                const isOwn = msg.senderId === 'user_current';
                const sender = state.users?.[msg.senderId];
                return (
                  <div key={msg.id} className={`message-bubble ${isOwn ? 'message-bubble-own' : ''}`}>
                    {!isOwn && (
                      <img src={sender?.avatar} alt={sender?.screenName} className="avatar" style={{ width: 32, height: 32 }} />
                    )}
                    <div>
                      <div className="bubble-text">{msg.text}</div>
                      <div className="bubble-time">{formatRelativeTime(msg.createdAt)}</div>
                    </div>
                    {isOwn && (
                      <img src={sender?.avatar} alt={sender?.screenName} className="avatar" style={{ width: 32, height: 32 }} />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-compose">
              <textarea
                className="chat-input"
                placeholder="发送消息..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                rows={2}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                className="btn btn-primary"
                onClick={handleSend}
                disabled={!messageText.trim()}
              >
                发送
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-panel">
            <div className="chat-empty">选择一个对话开始聊天</div>
          </div>
        )}
      </div>
    </div>
  );
}
