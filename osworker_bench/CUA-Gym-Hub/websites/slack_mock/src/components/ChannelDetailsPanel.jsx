
import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { useApp } from '../context/AppContext';
import './ChannelDetailsPanel.css';

function ChannelDetailsPanel({ channelId, initialTab = 'about', onClose }) {
  const { state, updateChannelDescription, updateChannelTopic } = useApp();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');
  const [editingTopic, setEditingTopic] = useState(false);
  const [topicValue, setTopicValue] = useState('');

  if (!state || !state.channels) return null;

  const channel = state.channels.find(ch => ch.channelId === channelId);
  if (!channel) return null;

  const messages = state.messages[channelId] || [];
  const pinnedMessageIds = channel.pinnedMessages || [];
  const pinnedMessages = pinnedMessageIds
    .map(id => messages.find(m => m.messageId === id))
    .filter(Boolean);

  const files = messages
    .filter(m => m.attachments && m.attachments.length > 0)
    .flatMap(m => m.attachments.map(att => ({ ...att, messageId: m.messageId, senderId: m.senderId, timestamp: m.timestamp })));

  const createdByUser = state.users.find(u => u.userId === channel.createdBy);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#2BAC76';
      case 'away': return '#E8912D';
      case 'busy': return '#E01E5A';
      default: return '#CCCCCC';
    }
  };

  return (
    <div className="channel-details-panel">
      <div className="cdp-header">
        <div className="cdp-header-info">
          <h3>{channel.isPrivate ? '🔒' : '#'} {channel.name}</h3>
        </div>
        <button className="cdp-close-btn" onClick={onClose} title="Close">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.03a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
          </svg>
        </button>
      </div>

      <div className="cdp-tabs">
        <button
          className={`cdp-tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
        <button
          className={`cdp-tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members ({channel.members.length})
        </button>
        <button
          className={`cdp-tab ${activeTab === 'pinned' ? 'active' : ''}`}
          onClick={() => setActiveTab('pinned')}
        >
          Pinned ({pinnedMessageIds.length})
        </button>
        <button
          className={`cdp-tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Files ({files.length})
        </button>
      </div>

      <div className="cdp-content">
        {activeTab === 'about' && (
          <div className="cdp-about">
            <div className="cdp-about-section">
              <h4>Topic</h4>
              {editingTopic ? (
                <div className="cdp-edit-field">
                  <input
                    type="text"
                    value={topicValue}
                    onChange={(e) => setTopicValue(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateChannelTopic(channelId, topicValue);
                        setEditingTopic(false);
                      } else if (e.key === 'Escape') {
                        setEditingTopic(false);
                      }
                    }}
                    onBlur={() => {
                      updateChannelTopic(channelId, topicValue);
                      setEditingTopic(false);
                    }}
                  />
                </div>
              ) : (
                <p
                  className="cdp-about-text clickable"
                  onClick={() => { setTopicValue(channel.topic || ''); setEditingTopic(true); }}
                >
                  {channel.topic || <span className="cdp-placeholder">Add a topic</span>}
                </p>
              )}
            </div>

            <div className="cdp-about-section">
              <h4>Description</h4>
              {editingDesc ? (
                <div className="cdp-edit-field">
                  <textarea
                    value={descValue}
                    onChange={(e) => setDescValue(e.target.value)}
                    autoFocus
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setEditingDesc(false);
                      }
                    }}
                    onBlur={() => {
                      updateChannelDescription(channelId, descValue);
                      setEditingDesc(false);
                    }}
                  />
                </div>
              ) : (
                <p
                  className="cdp-about-text clickable"
                  onClick={() => { setDescValue(channel.description || ''); setEditingDesc(true); }}
                >
                  {channel.description || <span className="cdp-placeholder">Add a description</span>}
                </p>
              )}
            </div>

            <div className="cdp-about-section">
              <h4>Created by</h4>
              <p className="cdp-about-text">
                {createdByUser ? createdByUser.fullName : 'Unknown'} on {channel.createdAt ? format(new Date(channel.createdAt), 'MMMM d, yyyy') : 'Unknown date'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="cdp-members">
            {channel.members.map(userId => {
              const user = state.users.find(u => u.userId === userId);
              if (!user) return null;
              return (
                <div key={userId} className="cdp-member-item">
                  <div className="cdp-member-avatar-wrapper">
                    <img src={user.avatar} alt={user.displayName} className="cdp-member-avatar" />
                    <span className="cdp-member-status" style={{ backgroundColor: getStatusColor(user.status) }} />
                  </div>
                  <div className="cdp-member-info">
                    <div className="cdp-member-name">
                      {user.fullName}
                      {user.statusEmoji && <span className="cdp-member-emoji">{user.statusEmoji}</span>}
                      {user.userId === state.currentUser.userId && <span className="cdp-you-badge">you</span>}
                    </div>
                    <div className="cdp-member-title">{user.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'pinned' && (
          <div className="cdp-pinned">
            {pinnedMessages.length === 0 ? (
              <div className="cdp-empty">
                <p>No pinned messages yet.</p>
                <p className="cdp-empty-hint">Pin important messages so they are easy to find.</p>
              </div>
            ) : (
              pinnedMessages.map(msg => {
                const sender = state.users.find(u => u.userId === msg.senderId);
                if (!sender) return null;
                return (
                  <div key={msg.messageId} className="cdp-pinned-item">
                    <img src={sender.avatar} alt={sender.displayName} className="cdp-pinned-avatar" />
                    <div className="cdp-pinned-content">
                      <div className="cdp-pinned-header">
                        <span className="cdp-pinned-sender">{sender.fullName}</span>
                        <span className="cdp-pinned-time">
                          {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="cdp-pinned-text">{msg.content}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="cdp-files">
            {files.length === 0 ? (
              <div className="cdp-empty">
                <p>No files have been shared yet.</p>
              </div>
            ) : (
              files.map((file, idx) => {
                const sender = state.users.find(u => u.userId === file.senderId);
                return (
                  <div key={idx} className="cdp-file-item">
                    <div className="cdp-file-icon">
                      {file.type === 'image' ? (
                        <svg viewBox="0 0 16 16" width="20" height="20" fill="#616061"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9zM3.5 3a.5.5 0 0 0-.5.5v6.793l2.146-2.147a.5.5 0 0 1 .708 0L8 10.293l2.146-2.147a.5.5 0 0 1 .708 0L13 10.293V3.5a.5.5 0 0 0-.5-.5h-9z"/></svg>
                      ) : (
                        <svg viewBox="0 0 16 16" width="20" height="20" fill="#616061"><path d="M4 1.5A1.5 1.5 0 0 1 5.5 0h5.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 14 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 4 14.5v-13z"/></svg>
                      )}
                    </div>
                    <div className="cdp-file-info">
                      <div className="cdp-file-name">{file.name}</div>
                      <div className="cdp-file-meta">
                        {sender ? sender.displayName : 'Unknown'} &middot; {file.size}
                        {file.timestamp && ` &middot; ${formatDistanceToNow(new Date(file.timestamp), { addSuffix: true })}`}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChannelDetailsPanel;
