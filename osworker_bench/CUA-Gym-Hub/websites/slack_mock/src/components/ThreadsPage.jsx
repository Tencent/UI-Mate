
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';
import './ThreadsPage.css';

function ThreadsPage() {
  const { state, setActiveThread } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState('all');

  const threadsArray = Object.values(state.threads).map(thread => {
    const parentMessage = Object.values(state.messages)
      .flat()
      .find(m => m.messageId === thread.parentMessageId);

    const sender = state.users.find(u => u.userId === parentMessage?.senderId);
    const channel = state.channels.find(ch => ch.channelId === thread.channelId);
    const dm = state.dms.find(d => d.dmId === thread.dmId);

    // Get the actual reply messages
    const allMessages = thread.channelId
      ? (state.messages[thread.channelId] || [])
      : (state.messages[thread.dmId] || []);
    const replyMessages = allMessages.filter(m => m.threadId === thread.threadId);

    // Last reply info
    const lastReply = replyMessages.length > 0 ? replyMessages[replyMessages.length - 1] : null;
    const lastReplySender = lastReply ? state.users.find(u => u.userId === lastReply.senderId) : null;

    // DM context: find other user name
    let dmOtherUserName = null;
    if (dm) {
      const otherUserId = dm.participants.find(id => id !== state.currentUser.userId);
      const otherUser = state.users.find(u => u.userId === otherUserId);
      dmOtherUserName = otherUser ? otherUser.displayName : 'Unknown';
    }

    return {
      ...thread,
      parentMessage,
      sender,
      channel,
      dm,
      dmOtherUserName,
      replyMessages,
      lastReply,
      lastReplySender,
      isFollowing: thread.followers.includes(state.currentUser.userId)
    };
  }).filter(thread => {
    if (filter === 'following') return thread.isFollowing;
    return true;
  }).sort((a, b) => {
    const aTime = a.lastReply ? new Date(a.lastReply.timestamp) : new Date(a.parentMessage?.timestamp || 0);
    const bTime = b.lastReply ? new Date(b.lastReply.timestamp) : new Date(b.parentMessage?.timestamp || 0);
    return bTime - aTime;
  });

  const handleThreadClick = (thread) => {
    setActiveThread(thread.threadId);
    if (thread.channel) {
      navigate(withCurrentSearch(`/channel/${thread.channel.channelId}`, location.search));
    } else if (thread.dm) {
      navigate(withCurrentSearch(`/dm/${thread.dm.dmId}`, location.search));
    }
  };

  return (
    <div className="threads-page">
      <div className="threads-header">
        <h2>Threads</h2>
        <div className="threads-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All threads
          </button>
          <button
            className={`filter-btn ${filter === 'following' ? 'active' : ''}`}
            onClick={() => setFilter('following')}
          >
            Following
          </button>
        </div>
      </div>

      <div className="threads-list">
        {threadsArray.map(thread => (
          <div
            key={thread.threadId}
            className="thread-item"
            onClick={() => handleThreadClick(thread)}
          >
            <div className="thread-item-top">
              <span className="thread-context">
                {thread.channel
                  ? <span className="thread-context-channel">in <span className="thread-channel-name">#{thread.channel.name}</span></span>
                  : <span className="thread-context-dm">DM with {thread.dmOtherUserName}</span>
                }
              </span>
              {thread.parentMessage && (
                <span className="thread-parent-time">
                  {formatDistanceToNow(new Date(thread.parentMessage.timestamp), { addSuffix: true })}
                </span>
              )}
            </div>

            <div className="thread-parent-row">
              <img
                src={thread.sender?.avatar}
                alt={thread.sender?.displayName}
                className="thread-avatar"
              />
              <div className="thread-parent-content">
                <span className="thread-sender">{thread.sender?.fullName}</span>
                <div className="thread-message">{thread.parentMessage?.content}</div>
              </div>
            </div>

            <div className="thread-reply-info">
              <span className="thread-reply-count-label">
                <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '4px' }}><path d="M7.5 2a5.5 5.5 0 0 0-4.926 7.986L2 12.5l2.514-.574A5.5 5.5 0 1 0 7.5 2zm0 1.5a4 4 0 1 1-2.292 7.276l-.278-.192-1.43.327.327-1.43-.192-.278A4 4 0 0 1 7.5 3.5z"/></svg>
                {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
              </span>

              {thread.lastReply && thread.lastReplySender && (
                <div className="thread-last-reply">
                  <img
                    src={thread.lastReplySender.avatar}
                    alt={thread.lastReplySender.displayName}
                    className="thread-last-reply-avatar"
                  />
                  <span className="thread-last-reply-name">{thread.lastReplySender.displayName}</span>
                  <span className="thread-last-reply-preview">
                    {thread.lastReply.content.length > 60
                      ? thread.lastReply.content.substring(0, 60) + '...'
                      : thread.lastReply.content}
                  </span>
                  <span className="thread-last-reply-time">
                    {formatDistanceToNow(new Date(thread.lastReply.timestamp), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {threadsArray.length === 0 && (
          <div className="no-threads">
            <svg viewBox="0 0 20 20" width="48" height="48" fill="#BCABBC"><path d="M7.5 2a5.5 5.5 0 0 0-4.926 7.986L2 12.5l2.514-.574A5.5 5.5 0 1 0 7.5 2zm0 1.5a4 4 0 1 1-2.292 7.276l-.278-.192-1.43.327.327-1.43-.192-.278A4 4 0 0 1 7.5 3.5z"/></svg>
            <p>No threads yet</p>
            <span className="no-threads-hint">Threads you start or follow will show up here</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThreadsPage;
