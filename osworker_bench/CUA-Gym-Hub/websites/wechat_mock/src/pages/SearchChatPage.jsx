import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatChatTime } from '../utils/helpers';
import './SearchChatPage.css';

// Safe highlight: splits plain text on query matches and wraps in <mark>
const HighlightText = ({ text, query }) => {
  if (!query.trim()) return <span>{text}</span>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
};

const SearchChatPage = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const contacts = useStore(state => state.contacts);
  const messages = useStore(state => state.messages);
  const user = useStore(state => state.user);

  if (!user || !contacts) {
    return <div>加载中...</div>;
  }

  const contact = contacts.find(c => c.userId === contactId);
  const chatMessages = messages[contactId] || [];

  const filteredMessages = searchQuery.trim()
    ? chatMessages.filter(msg =>
        msg.type === 'text' && msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="search-chat-page">
      <div className="search-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <div className="search-input-container">
          <input
            type="text"
            className="search-input"
            placeholder="搜索聊天记录"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="search-results">
        {searchQuery.trim() === '' ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>输入关键词搜索聊天记录</p>
          </div>
        ) : filteredMessages.length > 0 ? (
          <div className="results-list">
            <div className="results-count">
              找到 {filteredMessages.length} 条相关记录
            </div>
            {filteredMessages.map((msg) => {
              const sender = msg.isSelf ? user : contact;

              return (
                <div key={msg.messageId} className="result-item">
                  <div className="result-header">
                    <img src={sender.avatar} alt={sender.nickname} className="result-avatar" />
                    <span className="result-name">{sender.nickname}</span>
                    <span className="result-time">{formatChatTime(msg.timestamp)}</span>
                  </div>
                  <div className="result-content">
                    <HighlightText text={msg.content} query={searchQuery} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>未找到相关聊天记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchChatPage;
