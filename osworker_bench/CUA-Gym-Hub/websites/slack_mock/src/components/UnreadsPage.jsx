
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';
import './UnreadsPage.css';

function UnreadsPage() {
  const { state, updateState } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (!state || !state.channels || !state.messages) {
    return <div className="unreads-page">Loading...</div>;
  }

  // Gather channels and DMs with unread messages
  const unreadChannels = state.channels.filter(ch => ch.unreadCount > 0);
  const unreadDMs = state.dms.filter(dm => dm.unreadCount > 0);

  const totalUnread = unreadChannels.reduce((sum, ch) => sum + ch.unreadCount, 0)
    + unreadDMs.reduce((sum, dm) => sum + dm.unreadCount, 0);

  const handleMarkAllRead = () => {
    const channels = state.channels.map(ch => ({ ...ch, unreadCount: 0 }));
    const dms = state.dms.map(dm => ({ ...dm, unreadCount: 0 }));
    updateState({ channels, dms });
  };

  const handleChannelClick = (channelId) => {
    navigate(withCurrentSearch(`/channel/${channelId}`, location.search));
  };

  const handleDMClick = (dmId) => {
    navigate(withCurrentSearch(`/dm/${dmId}`, location.search));
  };

  // Get last N messages from a channel/DM (simulating the unread messages)
  const getRecentMessages = (key, count) => {
    const msgs = (state.messages[key] || []).filter(m => !m.threadId);
    return msgs.slice(-count);
  };

  return (
    <div className="unreads-page">
      <div className="unreads-header">
        <h2>All unreads</h2>
        {totalUnread > 0 && (
          <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="unreads-content">
        {totalUnread === 0 ? (
          <div className="unreads-empty">
            <div className="unreads-empty-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="#BCABBC">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3>You're all caught up</h3>
            <p>No unread messages across your channels and DMs.</p>
          </div>
        ) : (
          <>
            {unreadChannels.map(channel => {
              const recentMessages = getRecentMessages(channel.channelId, channel.unreadCount);
              return (
                <div key={channel.channelId} className="unread-group">
                  <div className="unread-group-header" onClick={() => handleChannelClick(channel.channelId)}>
                    <span className="unread-group-icon">{channel.isPrivate ? '🔒' : '#'}</span>
                    <span className="unread-group-name">{channel.name}</span>
                    <span className="unread-group-count">{channel.unreadCount} new</span>
                  </div>
                  <div className="unread-messages">
                    {recentMessages.map(msg => {
                      const sender = state.users.find(u => u.userId === msg.senderId);
                      if (!sender) return null;
                      return (
                        <div key={msg.messageId} className="unread-message-item" onClick={() => handleChannelClick(channel.channelId)}>
                          <img src={sender.avatar} alt={sender.displayName} className="unread-message-avatar" />
                          <div className="unread-message-content">
                            <div className="unread-message-header">
                              <span className="unread-message-sender">{sender.fullName}</span>
                              <span className="unread-message-time">
                                {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="unread-message-text">{msg.content}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {unreadDMs.map(dm => {
              const otherUserId = dm.participants.find(id => id !== state.currentUser.userId);
              const otherUser = state.users.find(u => u.userId === otherUserId);
              if (!otherUser) return null;
              const recentMessages = getRecentMessages(dm.dmId, dm.unreadCount);
              return (
                <div key={dm.dmId} className="unread-group">
                  <div className="unread-group-header" onClick={() => handleDMClick(dm.dmId)}>
                    <img src={otherUser.avatar} alt={otherUser.displayName} className="unread-group-dm-avatar" />
                    <span className="unread-group-name">{otherUser.fullName}</span>
                    <span className="unread-group-count">{dm.unreadCount} new</span>
                  </div>
                  <div className="unread-messages">
                    {recentMessages.map(msg => {
                      const sender = state.users.find(u => u.userId === msg.senderId);
                      if (!sender) return null;
                      return (
                        <div key={msg.messageId} className="unread-message-item" onClick={() => handleDMClick(dm.dmId)}>
                          <img src={sender.avatar} alt={sender.displayName} className="unread-message-avatar" />
                          <div className="unread-message-content">
                            <div className="unread-message-header">
                              <span className="unread-message-sender">{sender.fullName}</span>
                              <span className="unread-message-time">
                                {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="unread-message-text">{msg.content}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default UnreadsPage;
