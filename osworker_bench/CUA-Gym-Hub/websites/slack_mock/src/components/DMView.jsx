
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import './DMView.css';

function DMView() {
  const { dmId } = useParams();
  const { state, addMessage, addMessageWithAttachments, startCall, showToast, updateState } = useApp();
  const [showSettings, setShowSettings] = useState(false);

  // Clear unread count when entering DM
  useEffect(() => {
    if (state && state.dms && dmId) {
      const dm = state.dms.find(d => d.dmId === dmId);
      if (dm && dm.unreadCount > 0) {
        const dms = state.dms.map(d =>
          d.dmId === dmId ? { ...d, unreadCount: 0 } : d
        );
        updateState({ dms });
      }
    }
  }, [dmId]);

  if (!state || !state.dms || !state.users || !state.currentUser) {
    return <div className="dm-view">Loading...</div>;
  }

  const dm = state.dms.find(d => d.dmId === dmId);

  if (!dm) {
    return <div className="dm-view">DM not found</div>;
  }

  const otherUserId = dm.participants.find(id => id !== state.currentUser.userId);
  const otherUser = state.users.find(u => u.userId === otherUserId);

  if (!otherUser) {
    return <div className="dm-view">User not found</div>;
  }

  const messages = state.messages[dmId] || [];
  const dmMessages = messages.filter(m => !m.threadId);
  const isArchived = Boolean(dm.archivedAt);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#2BAC76';
      case 'away': return '#CCCCCC';
      case 'busy': return '#E01E5A';
      default: return '#CCCCCC';
    }
  };

  const handleSendMessage = (content, attachments = [], mentions = []) => {
    if (isArchived) {
      showToast('Unarchive this conversation before sending', 'error');
      return;
    }
    if (attachments.length > 0 || mentions.length > 0) {
      addMessageWithAttachments(null, dmId, content, attachments, mentions);
    } else {
      addMessage(null, dmId, content);
    }
  };

  const updateDm = (updates) => {
    const dms = state.dms.map(d => (
      d.dmId === dmId ? { ...d, ...updates } : d
    ));
    updateState({ dms });
  };

  const handleNotificationPreferences = () => {
    const currentPreference = dm.notificationPreference || 'all';
    const nextPreference = currentPreference === 'all' ? 'mentions' : 'all';
    updateDm({ notificationPreference: nextPreference });
    showToast(nextPreference === 'all' ? 'All DM notifications enabled' : 'Only mentions will notify you');
    setShowSettings(false);
  };

  const handleExportHistory = () => {
    const exportData = {
      conversation: {
        dmId,
        participant: otherUser.fullName,
        exportedAt: new Date().toISOString()
      },
      messages
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xlack-dm-${otherUser.displayName}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    updateDm({ lastExportedAt: exportData.conversation.exportedAt });
    showToast('Message history downloaded');
    setShowSettings(false);
  };

  const handleToggleArchive = () => {
    const nextArchivedAt = isArchived ? null : new Date().toISOString();
    updateDm({ archivedAt: nextArchivedAt });
    showToast(nextArchivedAt ? 'Conversation archived locally' : 'Conversation unarchived');
    setShowSettings(false);
  };

  return (
    <div className="dm-view">
      <div className="dm-header">
        <div className="dm-header-left">
          <div className="dm-user-avatar-container">
            <img src={otherUser.avatar} alt={otherUser.displayName} className="dm-user-avatar" />
            <span 
              className="dm-status-dot" 
              style={{ backgroundColor: getStatusColor(otherUser.status) }}
            />
          </div>
          <div className="dm-user-info">
            <h2 className="dm-user-name">{otherUser.fullName}</h2>
            {otherUser.statusMessage && (
              <div className="dm-user-status">{otherUser.statusMessage}</div>
            )}
          </div>
        </div>
        <div className="dm-header-right">
          <button
            className="header-btn"
            title="Start voice call"
            onClick={() => {
              startCall(dmId, 'voice');
              showToast('Voice call started');
            }}
          >
            📞
          </button>
          <button
            className="header-btn"
            title="Start video call"
            onClick={() => {
              startCall(dmId, 'video');
              showToast('Video call started');
            }}
          >
            📹
          </button>
          <button
            className="header-btn"
            title="Conversation settings"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️
          </button>
        </div>
      </div>

      <MessageList messages={dmMessages} dmId={dmId} />
      {isArchived && (
        <div className="dm-archive-banner">
          <span>This conversation is archived in this local workspace.</span>
          <button onClick={handleToggleArchive}>Unarchive</button>
        </div>
      )}
      
      <MessageComposer
        placeholder={`Message @${otherUser.displayName}`}
        onSend={handleSendMessage}
        channelId={null}
        dmId={dmId}
      />

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Conversation Settings</h2>
              <button onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Conversation with {otherUser.fullName}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                  <img src={otherUser.avatar} alt={otherUser.displayName} style={{ width: '48px', height: '48px', borderRadius: '6px' }} />
                  <div>
                    <div style={{ fontWeight: '600' }}>{otherUser.fullName}</div>
                    <div style={{ fontSize: '13px', color: '#616061' }}>{otherUser.title}</div>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <button
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: '8px'
                  }}
                  onClick={handleNotificationPreferences}
                >
                  🔔 Notification preferences: {dm.notificationPreference === 'mentions' ? 'Mentions only' : 'All messages'}
                </button>
                <button
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: '8px'
                  }}
                  onClick={handleExportHistory}
                >
                  📥 Export message history
                </button>
                <button
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#E01E5A'
                  }}
                  onClick={handleToggleArchive}
                >
                  🗄️ {isArchived ? 'Unarchive conversation' : 'Archive conversation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DMView;
