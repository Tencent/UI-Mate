
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';
import './MentionsPage.css';

function renderMentionContent(content, currentUserId) {
  const mentionRegex = /@\[(.*?):(.*?)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.substring(lastIndex, match.index) });
    }
    const userId = match[1];
    const displayName = match[2];
    const isSelf = userId === currentUserId;
    parts.push({ type: 'mention', userId, displayName, isSelf });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.substring(lastIndex) });
  }

  return parts.map((part, index) => {
    if (part.type === 'mention') {
      return (
        <span
          key={index}
          className={`mention-highlight ${part.isSelf ? 'mention-highlight-self' : ''}`}
        >
          @{part.displayName}
        </span>
      );
    }
    return <span key={index}>{part.content}</span>;
  });
}

function MentionsPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState('all');

  // Mentions: messages that mention the current user via @[userId:displayName] or @displayName
  const mentions = Object.entries(state.messages).flatMap(([key, messages]) => {
    return messages
      .filter(m => {
        return m.content.includes(`@[${state.currentUser.userId}:`) ||
               m.content.includes(`@${state.currentUser.displayName}`);
      })
      .map(m => {
        const sender = state.users.find(u => u.userId === m.senderId);
        const channel = state.channels.find(ch => ch.channelId === key);
        const dm = state.dms.find(d => d.dmId === key);
        return {
          ...m,
          sender,
          channel,
          dm,
          locationKey: key,
          itemType: 'mention'
        };
      });
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Reactions: messages sent by current user that others reacted to
  const reactionItems = Object.entries(state.messages).flatMap(([key, messages]) => {
    return messages
      .filter(m => m.senderId === state.currentUser.userId && m.reactions && m.reactions.length > 0)
      .flatMap(m => {
        const channel = state.channels.find(ch => ch.channelId === key);
        const dm = state.dms.find(d => d.dmId === key);
        // Get reactions from other users (not the current user)
        return m.reactions.flatMap(r =>
          r.users
            .filter(uid => uid !== state.currentUser.userId)
            .map(uid => {
              const reactor = state.users.find(u => u.userId === uid);
              return {
                messageId: `${m.messageId}_reaction_${uid}_${r.emoji}`,
                originalMessage: m,
                reactor,
                emoji: r.emoji,
                channel,
                dm,
                locationKey: key,
                timestamp: m.timestamp,
                itemType: 'reaction'
              };
            })
        );
      });
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleNavigate = (item) => {
    if (item.channel) {
      navigate(withCurrentSearch(`/channel/${item.channel.channelId}`, location.search));
    } else if (item.dm) {
      navigate(withCurrentSearch(`/dm/${item.dm.dmId}`, location.search));
    }
  };

  const getLocationLabel = (item) => {
    if (item.channel) return `in #${item.channel.name}`;
    if (item.dm) {
      const otherUserId = item.dm.participants.find(id => id !== state.currentUser.userId);
      const otherUser = state.users.find(u => u.userId === otherUserId);
      return `in DM with ${otherUser ? otherUser.displayName : 'Unknown'}`;
    }
    return '';
  };

  return (
    <div className="mentions-page">
      <div className="mentions-header">
        <h2>Mentions & Reactions</h2>
        <div className="mentions-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'mentions' ? 'active' : ''}`}
            onClick={() => setFilter('mentions')}
          >
            Mentions
          </button>
          <button
            className={`filter-btn ${filter === 'reactions' ? 'active' : ''}`}
            onClick={() => setFilter('reactions')}
          >
            Reactions
          </button>
        </div>
      </div>

      <div className="mentions-list">
        {/* Mentions Tab */}
        {(filter === 'all' || filter === 'mentions') && mentions.length > 0 && (
          <>
            {filter === 'all' && <div className="mentions-section-label">Mentions</div>}
            {mentions.map(item => (
              <div
                key={item.messageId}
                className="mention-item"
              >
                <img
                  src={item.sender?.avatar}
                  alt={item.sender?.displayName}
                  className="mention-avatar"
                />
                <div className="mention-content">
                  <div className="mention-meta">
                    <span className="mention-sender">{item.sender?.fullName}</span>
                    <span className="mention-location">{getLocationLabel(item)}</span>
                    <span className="mention-time">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="mention-text-full">
                    {renderMentionContent(item.content, state.currentUser.userId)}
                  </div>
                  <button
                    className="mention-view-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate(item);
                    }}
                  >
                    View in conversation
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Reactions Tab */}
        {(filter === 'all' || filter === 'reactions') && reactionItems.length > 0 && (
          <>
            {filter === 'all' && <div className="mentions-section-label">Reactions</div>}
            {reactionItems.map(item => (
              <div
                key={item.messageId}
                className="mention-item reaction-item"
              >
                <img
                  src={item.reactor?.avatar}
                  alt={item.reactor?.displayName}
                  className="mention-avatar"
                />
                <div className="mention-content">
                  <div className="reaction-description">
                    <span className="reaction-actor-name">{item.reactor?.fullName}</span>
                    {' reacted with '}
                    <span className="reaction-emoji-display">{item.emoji}</span>
                    {' to your message '}
                    <span className="mention-location">{getLocationLabel(item)}</span>
                  </div>
                  <div className="reaction-original-message">
                    {item.originalMessage.content.length > 100
                      ? item.originalMessage.content.substring(0, 100) + '...'
                      : item.originalMessage.content}
                  </div>
                  <button
                    className="mention-view-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate(item);
                    }}
                  >
                    View in conversation
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {filter === 'mentions' && mentions.length === 0 && (
          <div className="no-mentions">
            <svg viewBox="0 0 20 20" width="48" height="48" fill="#BCABBC"><path d="M10 2a8 8 0 1 0 3.293 15.293l-.707-.707A7 7 0 1 1 17 10c0 1.38-.56 2.5-1.25 2.5S14.5 11.38 14.5 10V6.5h-1.25v.63A3.5 3.5 0 1 0 13.5 11c.37.93 1.12 1.5 2 1.5C16.88 12.5 18 11.38 18 10a8 8 0 0 0-8-8zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 1.25a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5z"/></svg>
            <p>No mentions yet</p>
            <span className="no-mentions-hint">Messages where someone @mentions you will appear here</span>
          </div>
        )}

        {filter === 'reactions' && reactionItems.length === 0 && (
          <div className="no-mentions">
            <p>No reactions to your messages yet</p>
            <span className="no-mentions-hint">When someone reacts to one of your messages, it will show up here</span>
          </div>
        )}

        {filter === 'all' && mentions.length === 0 && reactionItems.length === 0 && (
          <div className="no-mentions">
            <p>No mentions or reactions yet</p>
            <span className="no-mentions-hint">Activity related to you will appear here</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MentionsPage;
