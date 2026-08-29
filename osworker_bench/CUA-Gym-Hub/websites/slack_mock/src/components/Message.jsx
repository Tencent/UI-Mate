
import React, { useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../context/AppContext';
import { parseMarkdown } from '../utils/markdownParser';
import { downloadBase64File, getFileIcon } from '../utils/fileHandler';
import EmojiPicker from './EmojiPicker';
import UserProfilePopover from './UserProfilePopover';
import './Message.css';

function Message({ message, channelId, dmId, isInThread = false }) {
  const { state, addReaction, createThread, setActiveThread, editMessage, deleteMessage, toggleBookmark, togglePinMessage, showToast } = useApp();
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const [popoverAnchorRect, setPopoverAnchorRect] = useState(null);
  const senderNameRef = useRef(null);

  if (!state || !state.users || !state.currentUser) {
    return null;
  }

  const sender = state.users.find(u => u.userId === message.senderId);
  if (!sender) {
    return null;
  }

  const threadReplies = message.threadId ? null : Object.values(state.threads || {}).find(t => t.parentMessageId === message.messageId);
  const replyCount = threadReplies && threadReplies.replies ? threadReplies.replies.length : 0;

  const isBookmarked = (state.bookmarkedMessages || []).includes(message.messageId);
  const channel = channelId ? state.channels.find(ch => ch.channelId === channelId) : null;
  const isPinned = channel ? (channel.pinnedMessages || []).includes(message.messageId) : false;

  const handleReaction = (emoji) => {
    addReaction(message.messageId, channelId, dmId, emoji);
    setShowEmojiPicker(false);
  };

  const handleReplyInThread = () => {
    const existingThread = Object.values(state.threads).find(t => t.parentMessageId === message.messageId);
    if (existingThread) {
      setActiveThread(existingThread.threadId);
    } else {
      const threadId = createThread(message.messageId, channelId, dmId);
      setActiveThread(threadId);
    }
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      editMessage(message.messageId, channelId, dmId, editContent);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMessage(message.messageId, channelId, dmId);
    setShowDeleteConfirm(false);
  };

  const handleShare = () => {
    const messageLink = channelId
      ? `${window.location.origin}/channel/${channelId}?message=${message.messageId}`
      : `${window.location.origin}/dm/${dmId}?message=${message.messageId}`;

    // Copy to clipboard
    navigator.clipboard.writeText(messageLink).then(() => {
      showToast('Message link copied to clipboard');
    }).catch(() => {
      // Fallback
      showToast('Link copied');
    });
  };

  const handleBookmark = () => {
    toggleBookmark(message.messageId);
    setShowMoreOptions(false);
  };

  const handlePin = () => {
    if (channelId) {
      togglePinMessage(message.messageId, channelId);
      setShowMoreOptions(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      showToast('Message text copied');
    });
    setShowMoreOptions(false);
  };

  const handleDownloadAttachment = (attachment) => {
    // If URL is a server path (not base64), use standard download
    if (attachment.url && !attachment.url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      downloadBase64File(attachment.url, attachment.name);
    }
  };

  // Parse message content for markdown and mentions
  const renderContent = () => {
    let content = message.content;

    // Replace mention syntax with styled mentions
    const mentionRegex = /@\[(.*?):(.*?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index);
        parts.push({ type: 'text', content: textBefore });
      }

      // Add mention
      const userId = match[1];
      const displayName = match[2];
      parts.push({ type: 'mention', userId, displayName });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.substring(lastIndex) });
    }

    // Render parts
    return parts.map((part, index) => {
      if (part.type === 'mention') {
        const isSelf = part.userId === state.currentUser.userId;
        return (
          <span
            key={index}
            className={`mention ${isSelf ? 'mention-self' : ''}`}
            title={`@${part.displayName}`}
          >
            @{part.displayName}
          </span>
        );
      } else {
        // Parse markdown in text
        return <span key={index}>{parseMarkdown(part.content)}</span>;
      }
    });
  };

  return (
    <div
      className="message"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <img src={sender.avatar} alt={sender.displayName} className="message-avatar" />
      <div className="message-content">
        <div className="message-header">
          <span
            className="message-sender"
            ref={senderNameRef}
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              setPopoverAnchorRect(rect);
              setShowProfilePopover(!showProfilePopover);
            }}
          >{sender.fullName}</span>
          {sender.statusEmoji && <span className="sender-status-emoji">{sender.statusEmoji}</span>}
          <span className="message-time">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
          {message.isEdited && <span className="edited-label">(edited)</span>}
          {isPinned && <span className="pinned-label">📌 Pinned</span>}
        </div>

        {isEditing ? (
          <div className="message-edit">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEdit();
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditContent(message.content);
                }
              }}
              autoFocus
            />
            <div className="edit-actions">
              <button className="edit-cancel-btn" onClick={() => {
                setIsEditing(false);
                setEditContent(message.content);
              }}>Cancel</button>
              <button className="edit-save-btn" onClick={handleEdit} disabled={!editContent.trim() || editContent === message.content}>Save Changes</button>
              <span className="edit-helper-text">Escape to cancel &middot; Enter to save</span>
            </div>
          </div>
        ) : (
          <div className="message-text">
            {renderContent()}
          </div>
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="message-attachments">
            {message.attachments.map((att, idx) => (
              <div key={idx} className="attachment">
                {att.type === 'image' ? (
                  <div className="attachment-image-wrapper">
                    <img
                      src={att.url}
                      alt={att.name}
                      className="attachment-image"
                      onClick={() => window.open(att.url, '_blank')}
                      style={{ cursor: 'pointer' }}
                    />
                    <button
                      className="download-attachment-btn"
                      onClick={() => handleDownloadAttachment(att)}
                      title="Download"
                    >
                      ⬇️
                    </button>
                  </div>
                ) : (
                  <div className="attachment-file" onClick={() => handleDownloadAttachment(att)} style={{ cursor: 'pointer' }}>
                    <span className="file-icon">{getFileIcon(att.name)}</span>
                    <div className="file-info">
                      <div className="file-name">{att.name}</div>
                      <div className="file-size">{att.size}</div>
                    </div>
                    <span className="download-icon">⬇️</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {message.reactions && message.reactions.length > 0 && (
          <div className="message-reactions">
            {message.reactions.map((reaction, idx) => {
              const reactionUserNames = reaction.users
                .map(uid => {
                  const u = state.users.find(usr => usr.userId === uid);
                  return u ? u.displayName : uid;
                })
                .join(', ');
              const isOwnReaction = reaction.users.includes(state.currentUser.userId);
              return (
                <button
                  key={idx}
                  className={`reaction ${isOwnReaction ? 'reacted' : ''}`}
                  onClick={() => handleReaction(reaction.emoji)}
                  title={reactionUserNames}
                >
                  <span className="reaction-emoji">{reaction.emoji}</span>
                  <span className="reaction-count">{reaction.users.length}</span>
                </button>
              );
            })}
            <button className="add-reaction-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Add a reaction">
              <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM7 8.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-4.2 3a.75.75 0 0 1 1.05-.15c.7.5 1.4.75 2.15.75s1.45-.25 2.15-.75a.75.75 0 1 1 .9 1.2A4.77 4.77 0 0 1 10 13.5a4.77 4.77 0 0 1-3.05-1.05.75.75 0 0 1-.15-1.05z"/></svg>
            </button>
          </div>
        )}

        {replyCount > 0 && !isInThread && (() => {
          // Get unique replier userIds (last 3)
          const replyMessages = (state.messages[channelId || dmId] || [])
            .filter(m => m.threadId === threadReplies.threadId);
          const replierIds = [...new Set(replyMessages.map(m => m.senderId))].slice(-3);
          const repliers = replierIds
            .map(uid => state.users.find(u => u.userId === uid))
            .filter(Boolean);
          const lastReply = replyMessages.length > 0 ? replyMessages[replyMessages.length - 1] : null;

          return (
            <button className="thread-replies" onClick={handleReplyInThread}>
              <div className="thread-replier-avatars">
                {repliers.map((user, i) => (
                  <img
                    key={user.userId}
                    src={user.avatar}
                    alt={user.displayName}
                    className="thread-replier-avatar"
                    style={{ zIndex: repliers.length - i }}
                  />
                ))}
              </div>
              <span className="thread-reply-text">
                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              </span>
              {lastReply && (
                <span className="thread-reply-time">
                  Last reply {formatDistanceToNow(new Date(lastReply.timestamp), { addSuffix: true })}
                </span>
              )}
            </button>
          );
        })()}
      </div>

      {showActions && (
        <div className="message-actions">
          <button className="quick-reaction-btn" onClick={() => handleReaction('\u{1F44D}')} title="Thumbs up">
            <span className="quick-reaction-emoji">{'\u{1F44D}'}</span>
          </button>
          <button className="quick-reaction-btn" onClick={() => handleReaction('\u2764\uFE0F')} title="Heart">
            <span className="quick-reaction-emoji">{'\u2764\uFE0F'}</span>
          </button>
          <button className="quick-reaction-btn" onClick={() => handleReaction('\u{1F440}')} title="Eyes">
            <span className="quick-reaction-emoji">{'\u{1F440}'}</span>
          </button>
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Add reaction">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM7 8.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-4.2 3a.75.75 0 0 1 1.05-.15c.7.5 1.4.75 2.15.75s1.45-.25 2.15-.75a.75.75 0 1 1 .9 1.2A4.77 4.77 0 0 1 10 13.5a4.77 4.77 0 0 1-3.05-1.05.75.75 0 0 1-.15-1.05z"/></svg>
          </button>
          {!isInThread && (
            <button onClick={handleReplyInThread} title="Reply in thread">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M7.5 3a.75.75 0 0 1 0 1.5H4.75v7h3.5a2.25 2.25 0 0 1 2.25 2.25v1.19l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22v-1.19a.75.75 0 0 0-.75-.75h-3.5A1.75 1.75 0 0 1 3 11.25v-7A1.75 1.75 0 0 1 4.75 2.5H7.5a.75.75 0 0 1 0 .5z"/></svg>
            </button>
          )}
          <button onClick={handleBookmark} title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}>
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M5 3.75A1.75 1.75 0 0 1 6.75 2h6.5C14.22 2 15 2.78 15 3.75v13.5a.75.75 0 0 1-1.17.62L10 15.15l-3.83 2.72A.75.75 0 0 1 5 17.25V3.75zm1.75-.25a.25.25 0 0 0-.25.25v11.94l3.08-2.19a.75.75 0 0 1 .84 0l3.08 2.19V3.75a.25.25 0 0 0-.25-.25h-6.5z"/></svg>
          </button>
          <button onClick={() => setShowMoreOptions(!showMoreOptions)} title="More actions">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/></svg>
          </button>
        </div>
      )}

      {showMoreOptions && (
        <div className="more-options-menu">
          {message.senderId === state.currentUser.userId && (
            <button onClick={() => { setIsEditing(true); setEditContent(message.content); setShowMoreOptions(false); }}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M11.498 1.499a1.75 1.75 0 0 1 2.475 0l.528.528a1.75 1.75 0 0 1 0 2.475L5.26 13.743a1.75 1.75 0 0 1-.826.455l-3.08.77a.75.75 0 0 1-.91-.91l.77-3.08a1.75 1.75 0 0 1 .455-.826L11.498 1.499zM12.56 2.56a.25.25 0 0 0-.354 0L2.975 11.79a.25.25 0 0 0-.065.118l-.517 2.066 2.066-.517a.25.25 0 0 0 .118-.065L13.808 4.16a.25.25 0 0 0 0-.354l-.528-.528-.72-.72z"/></svg>
              Edit message
            </button>
          )}
          <button onClick={handleBookmark}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M4 2.75A1.75 1.75 0 0 1 5.75 1h4.5C11.22 1 12 1.78 12 2.75v11.5a.75.75 0 0 1-1.17.62L8 12.15l-2.83 2.72A.75.75 0 0 1 4 14.25V2.75z"/></svg>
            {isBookmarked ? 'Remove bookmark' : 'Bookmark message'}
          </button>
          {channelId && (
            <button onClick={handlePin}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M9.5 1.5L14.5 6.5L10 11L8.5 9.5L5 13L3 11L6.5 7.5L5 6L9.5 1.5z"/></svg>
              {isPinned ? 'Unpin from channel' : 'Pin to channel'}
            </button>
          )}
          <button onClick={handleShare}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M4.5 6.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-7 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM6.2 5.3l3.6-2.1M6.2 10.7l3.6 2.1"/></svg>
            Copy message link
          </button>
          <button onClick={handleCopyText}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M5.75 1A1.75 1.75 0 0 0 4 2.75v8.5c0 .966.784 1.75 1.75 1.75h5.5A1.75 1.75 0 0 0 13 11.25v-8.5A1.75 1.75 0 0 0 11.25 1h-5.5zm-.25 1.75a.25.25 0 0 1 .25-.25h5.5a.25.25 0 0 1 .25.25v8.5a.25.25 0 0 1-.25.25h-5.5a.25.25 0 0 1-.25-.25v-8.5z"/><path d="M1.75 4A.75.75 0 0 1 2.5 3.25V12.25c0 .966.784 1.75 1.75 1.75h6a.75.75 0 0 1 0 1.5h-6A3.25 3.25 0 0 1 1 12.25V4a.75.75 0 0 1 .75-.75z"/></svg>
            Copy text
          </button>
          {message.senderId === state.currentUser.userId && (
            <button className="delete-option" onClick={() => { setShowMoreOptions(false); setShowDeleteConfirm(true); }}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75zM11 3V1.75A1.75 1.75 0 0 0 9.25 0h-2.5A1.75 1.75 0 0 0 5 1.75V3H2.75a.75.75 0 0 0 0 1.5h.29l.72 9.15A1.75 1.75 0 0 0 5.5 15.4h5a1.75 1.75 0 0 0 1.74-1.75l.72-9.15h.29a.75.75 0 0 0 0-1.5H11z"/></svg>
              Delete message
            </button>
          )}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal message-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="message-confirm-header">
              <h2>Delete message?</h2>
              <button onClick={() => setShowDeleteConfirm(false)} aria-label="Close">✕</button>
            </div>
            <p>This removes the message from this local workspace.</p>
            <div className="message-confirm-preview">{message.content}</div>
            <div className="message-confirm-actions">
              <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="message-delete-confirm-btn" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showEmojiPicker && (
        <div style={{ position: 'absolute', top: '100%', left: '0', zIndex: 1000 }}>
          <EmojiPicker
            onSelect={handleReaction}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {showProfilePopover && (
        <UserProfilePopover
          userId={sender.userId}
          anchorRect={popoverAnchorRect}
          onClose={() => setShowProfilePopover(false)}
        />
      )}
    </div>
  );
}

export default Message;
