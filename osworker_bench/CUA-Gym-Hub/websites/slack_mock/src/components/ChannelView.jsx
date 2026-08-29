
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import ChannelDetailsPanel from './ChannelDetailsPanel';
import './ChannelView.css';

function ChannelView() {
  const { channelId } = useParams();
  const { state, toggleChannelStar, addMessage, addMessageWithAttachments, showToast, updateChannelDescription, updateChannelTopic, updateState } = useApp();
  const [showMembers, setShowMembers] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [detailsTab, setDetailsTab] = useState('about');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTopic, setEditingTopic] = useState(false);
  const [topicValue, setTopicValue] = useState('');

  // Clear unread count when entering channel
  useEffect(() => {
    if (state && state.channels && channelId) {
      const channel = state.channels.find(ch => ch.channelId === channelId);
      if (channel && channel.unreadCount > 0) {
        const channels = state.channels.map(ch =>
          ch.channelId === channelId ? { ...ch, unreadCount: 0 } : ch
        );
        updateState({ channels });
      }
    }
  }, [channelId]);

  if (!state || !state.channels || !state.messages) {
    return <div className="channel-view">Loading...</div>;
  }

  const channel = state.channels.find(ch => ch.channelId === channelId);

  if (!channel) {
    return <div className="channel-view">Channel not found</div>;
  }

  const messages = state.messages[channelId] || [];
  const channelMessages = messages.filter(m => !m.threadId);

  const handleSendMessage = (content, attachments = [], mentions = []) => {
    if (attachments.length > 0 || mentions.length > 0) {
      addMessageWithAttachments(channelId, null, content, attachments, mentions);
    } else {
      addMessage(channelId, null, content);
    }
  };

  return (
    <div className="channel-view-wrapper">
      <div className="channel-view">
        <div className="channel-header">
          <div className="channel-header-left">
            <h2 className="channel-title" onClick={() => { setDetailsTab('about'); setShowDetailsPanel(true); }} style={{ cursor: 'pointer' }}>
              <span className="channel-title-hash">{channel.isPrivate ? '\u{1F512}' : '#'}</span>
              {' '}{channel.name}
            </h2>
            <button
              className={`star-btn ${channel.isStarred ? 'starred' : ''}`}
              onClick={() => toggleChannelStar(channelId)}
              title={channel.isStarred ? 'Unstar channel' : 'Star channel'}
            >
              {channel.isStarred ? '\u2605' : '\u2606'}
            </button>
            {(channel.topic || channel.members) && (
              <div className="channel-header-meta">
                <span className="meta-divider">|</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="#616061"><path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zm0 1a5 5 0 1 1 0 10A5 5 0 0 1 8 3zm-1.5 2.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zM5 9.5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v.5H5v-.5z"/></svg>
                  {channel.members.length}
                </span>
                <span className="meta-divider">|</span>
                {editingTopic ? (
                  <input
                    type="text"
                    className="channel-topic-input"
                    value={topicValue}
                    onChange={(e) => setTopicValue(e.target.value)}
                    onBlur={() => {
                      if (topicValue !== channel.topic) {
                        updateChannelTopic(channelId, topicValue);
                      }
                      setEditingTopic(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (topicValue !== channel.topic) {
                          updateChannelTopic(channelId, topicValue);
                        }
                        setEditingTopic(false);
                      } else if (e.key === 'Escape') {
                        setEditingTopic(false);
                      }
                    }}
                    autoFocus
                    placeholder="Add a topic"
                  />
                ) : (
                  <span
                    className="channel-topic"
                    title={channel.topic ? `${channel.topic} (click to edit)` : 'Click to add a topic'}
                    onClick={() => {
                      setTopicValue(channel.topic || '');
                      setEditingTopic(true);
                    }}
                  >
                    {channel.topic || <span className="channel-topic-placeholder">Add a topic</span>}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="channel-header-right">
            <button
              className="header-btn"
              onClick={() => { setDetailsTab('members'); setShowDetailsPanel(!showDetailsPanel || detailsTab !== 'members'); }}
              title="View members"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zm0 1a5 5 0 1 1 0 10A5 5 0 0 1 8 3zm-1.5 2.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zM5 9.5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v.5H5v-.5z"/></svg>
            </button>
            <button
              className="header-btn"
              title="View pinned messages"
              onClick={() => { setDetailsTab('pinned'); setShowDetailsPanel(!showDetailsPanel || detailsTab !== 'pinned'); }}
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M9.5 1.5L14.5 6.5L10 11L8.5 9.5L5 13L3 11L6.5 7.5L5 6L9.5 1.5zM9.5 3.5L6.5 6.5L8 8L5 11L5.5 11.5L8.5 8.5L10 10L13 7L9.5 3.5z"/></svg>
            </button>
            <button
              className="header-btn"
              title="Search in channel"
              onClick={() => setShowSearch(!showSearch)}
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11.5 7a4.5 4.5 0 1 0-2.03 3.77l3.13 3.13a.75.75 0 1 0 1.06-1.06l-3.13-3.13A4.5 4.5 0 0 0 11.5 7zM7 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
            </button>
          </div>
        </div>

        <MessageList messages={channelMessages} channelId={channelId} />

        <MessageComposer
          placeholder={`Message #${channel.name}`}
          onSend={handleSendMessage}
          channelId={channelId}
          dmId={null}
        />

        {showSearch && (
          <div className="search-panel">
            <div style={{ padding: '12px', borderBottom: '1px solid #DDDDDD', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                placeholder="Search in this channel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #BBBBBB',
                  borderRadius: '4px',
                  fontSize: '15px',
                  outline: 'none'
                }}
                autoFocus
              />
              <button onClick={() => setShowSearch(false)} style={{ padding: '8px', color: '#616061', borderRadius: '4px' }}>&#10005;</button>
            </div>
            <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
              {searchQuery.trim() ? (
                messages.filter(m =>
                  m.content.toLowerCase().includes(searchQuery.toLowerCase())
                ).length > 0 ? (
                  messages.filter(m =>
                    m.content.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(msg => {
                    const sender = state.users.find(u => u.userId === msg.senderId);
                    return (
                      <div key={msg.messageId} style={{ padding: '8px', borderBottom: '1px solid #F0F0F0', cursor: 'pointer', borderRadius: '4px' }}>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: '#1D1C1D' }}>{sender?.fullName}</div>
                        <div style={{ fontSize: '14px', color: '#616061', marginTop: '4px', lineHeight: '1.4' }}>{msg.content}</div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', color: '#616061', padding: '20px', fontSize: '15px' }}>
                    No messages found matching "{searchQuery}"
                  </div>
                )
              ) : (
                <div style={{ textAlign: 'center', color: '#616061', padding: '20px', fontSize: '15px' }}>
                  Type to search messages in this channel
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showDetailsPanel && (
        <ChannelDetailsPanel
          channelId={channelId}
          initialTab={detailsTab}
          onClose={() => setShowDetailsPanel(false)}
        />
      )}
    </div>
  );
}

export default ChannelView;
