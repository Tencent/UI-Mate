import React, { useState, useRef, useEffect } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext.jsx';

const QUICK_EMOJIS = ['\u{1F44D}', '\u2764\uFE0F', '\uD83D\uDE02', '\uD83D\uDE2E', '\uD83D\uDE22', '\uD83D\uDE21'];

function formatDate(iso) {
  const d = parseISO(iso);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
}

function formatTime(iso) {
  return format(parseISO(iso), 'h:mm a');
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return { icon: '\uD83D\uDCC4', cls: 'pdf' };
  if (['doc', 'docx'].includes(ext)) return { icon: '\uD83D\uDCC3', cls: 'doc' };
  if (['xls', 'xlsx'].includes(ext)) return { icon: '\uD83D\uDCCA', cls: 'xls' };
  if (['ppt', 'pptx'].includes(ext)) return { icon: '\uD83D\uDCCA', cls: 'ppt' };
  if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return { icon: '\uD83D\uDDBC', cls: 'img' };
  return { icon: '\uD83D\uDCC4', cls: 'other' };
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function MessageList({ containerId, messages, onOpenThread }) {
  const { state, actions } = useApp();
  const endRef = useRef(null);
  const [emojiPickerMsg, setEmojiPickerMsg] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [editText, setEditText] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');

  const users = state.users;
  const currentUserId = state.currentUser.userId;

  // Get pinned message IDs from the container (channel or chat)
  const container = state.channels.find(c => c.channelId === containerId) || state.chats.find(c => c.chatId === containerId);
  const pinnedMessageIds = container?.pinnedMessages || [];

  function getUser(userId) {
    return users.find(u => u.userId === userId) || { displayName: userId, avatar: '' };
  }

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'auto' });
  }, [messages?.length]);

  // Close emoji picker/context on outside click
  useEffect(() => {
    function handleClick() { setEmojiPickerMsg(null); setContextMenu(null); }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!messages || messages.length === 0) {
    return (
      <div className="message-list">
        <div className="empty-state">
          <div className="empty-state-icon">&#128172;</div>
          <div className="empty-state-title">No messages yet</div>
          <div className="empty-state-text">Send a message to start the conversation.</div>
        </div>
      </div>
    );
  }

  // Group messages by date
  const grouped = [];
  let lastDate = '';
  for (const msg of messages) {
    if (msg.replyToId) continue; // skip thread replies in main view
    const date = formatDate(msg.createdDateTime);
    if (date !== lastDate) {
      grouped.push({ type: 'divider', date });
      lastDate = date;
    }
    grouped.push({ type: 'message', msg });
  }

  // Compute thread info for channel messages
  const threadMap = {};
  for (const msg of messages) {
    if (msg.replyToId) {
      if (!threadMap[msg.replyToId]) threadMap[msg.replyToId] = [];
      threadMap[msg.replyToId].push(msg);
    }
  }

  function toggleReaction(msgId, emoji) {
    const msg = messages.find(m => m.messageId === msgId);
    if (!msg) return;
    const reaction = msg.reactions.find(r => r.emoji === emoji);
    if (reaction && reaction.users.includes(currentUserId)) {
      actions.removeReaction(containerId, msgId, emoji);
    } else {
      actions.addReaction(containerId, msgId, emoji);
    }
  }

  function handleEdit(msg) {
    setEditingMsg(msg.messageId);
    setEditText(msg.content);
    setContextMenu(null);
  }

  function saveEdit(msgId) {
    if (editText.trim()) {
      actions.editMessage(containerId, msgId, editText.trim());
    }
    setEditingMsg(null);
    setEditText('');
  }

  function handleDelete(msgId) {
    actions.deleteMessage(containerId, msgId);
    setContextMenu(null);
  }

  return (
    <div className="message-list">
      {grouped.map((item, i) => {
        if (item.type === 'divider') {
          return <div key={`d-${i}`} className="date-divider">{item.date}</div>;
        }

        const msg = item.msg;
        const sender = getUser(msg.senderId);
        const isSystem = msg.messageType === 'systemEvent';
        const isDeleted = !!msg.deletedDateTime;
        const isOwn = msg.senderId === currentUserId;
        const threadReplies = threadMap[msg.messageId] || [];
        const threadParticipants = [...new Set(threadReplies.map(r => getUser(r.senderId).displayName))];

        if (isSystem) {
          return (
            <div key={msg.messageId} className="message-row system-message">
              <span className="system-text">{msg.content}</span>
            </div>
          );
        }

        return (
          <div key={msg.messageId} className="message-row">
            <div className="message-avatar">
              <img src={sender.avatar} alt={sender.displayName} />
            </div>
            <div className="message-body">
              <div className="message-header">
                <span className="message-sender">{sender.displayName}</span>
                <span className="message-time">{formatTime(msg.createdDateTime)}</span>
              </div>
              {msg.subject && <div className="message-subject">{msg.subject}</div>}
              {pinnedMessageIds.includes(msg.messageId) && <div className="message-pinned-badge">&#128204; Pinned</div>}
              {editingMsg === msg.messageId ? (
                <div style={{ marginTop: 4 }}>
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    style={{ width: '100%', minHeight: 40, padding: 8, border: '1px solid var(--border-color)', borderRadius: 4, fontFamily: 'var(--font-family)', fontSize: 14 }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button className="btn-primary" style={{ padding: '4px 12px', fontSize: 13, borderRadius: 4, border: 'none', cursor: 'pointer', background: 'var(--brand-primary)', color: '#fff' }} onClick={() => saveEdit(msg.messageId)}>Save</button>
                    <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 13, borderRadius: 4, border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--sidebar-bg)' }} onClick={() => setEditingMsg(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className={`message-content ${isDeleted ? 'deleted' : ''}`}>
                  {msg.content}
                  {msg.lastEditedDateTime && !isDeleted && <span className="message-edited">(Edited)</span>}
                </div>
              )}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="message-attachments">
                  {msg.attachments.map(att => {
                    const fi = getFileIcon(att.name);
                    return (
                      <div key={att.attachmentId} className="attachment-card" style={{ cursor: 'pointer' }}
                        onClick={() => setPreviewAttachment(att)}>
                        <span className={`attachment-icon ${fi.cls}`}>{fi.icon}</span>
                        <div>
                          <div className="attachment-name">{att.name}</div>
                          <div className="attachment-size">{formatSize(att.size)}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: 16, color: 'var(--text-secondary)' }}>&#8681;</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="message-reactions">
                  {msg.reactions.map((r, ri) => (
                    <button
                      key={ri}
                      className={`reaction-badge ${r.users.includes(currentUserId) ? 'mine' : ''}`}
                      onClick={() => toggleReaction(msg.messageId, r.emoji)}
                    >
                      {r.emoji} {r.users.length}
                    </button>
                  ))}
                  <button className="reaction-add" aria-label="Add reaction" onClick={e => { e.stopPropagation(); setEmojiPickerMsg(msg.messageId); }}>+</button>
                </div>
              )}
              {threadReplies.length > 0 && onOpenThread && (
                <div className="message-thread-info" onClick={() => onOpenThread(msg.messageId)}>
                  {threadReplies.length} {threadReplies.length === 1 ? 'reply' : 'replies'}
                  {threadParticipants.length > 0 && ` from ${threadParticipants.slice(0, 2).join(', ')}`}
                  {threadParticipants.length > 2 && ` and ${threadParticipants.length - 2} more`}
                </div>
              )}
            </div>
            {/* Hover actions */}
            <div className="message-hover-actions">
              <button title="React" onClick={e => { e.stopPropagation(); setEmojiPickerMsg(msg.messageId); }}>&#128522;</button>
              {onOpenThread && <button title="Reply" onClick={() => onOpenThread(msg.messageId)}>&#8617;</button>}
              <button title="More" onClick={e => { e.stopPropagation(); setContextMenu({ msgId: msg.messageId, x: e.clientX, y: e.clientY }); }}>&#8943;</button>
            </div>
            {/* Emoji picker */}
            {emojiPickerMsg === msg.messageId && (
              <div className="emoji-picker" onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: -48, right: 12 }}>
                <div className="emoji-quick-row">
                  {QUICK_EMOJIS.map(em => (
                    <button key={em} className="emoji-btn" onClick={() => { toggleReaction(msg.messageId, em); setEmojiPickerMsg(null); }}>{em}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div ref={endRef} />

      {/* Context menu */}
      {contextMenu && (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={e => e.stopPropagation()}>
          {messages.find(m => m.messageId === contextMenu.msgId)?.senderId === currentUserId && (
            <>
              <button className="context-menu-item" onClick={() => handleEdit(messages.find(m => m.messageId === contextMenu.msgId))}>&#9998; Edit</button>
              <button className="context-menu-item danger" onClick={() => handleDelete(contextMenu.msgId)}>&#128465; Delete</button>
              <div className="context-menu-divider" />
            </>
          )}
          <button className="context-menu-item" onClick={() => {
            const isPinned = pinnedMessageIds.includes(contextMenu.msgId);
            if (isPinned) {
              actions.unpinMessage(containerId, contextMenu.msgId);
            } else {
              actions.pinMessage(containerId, contextMenu.msgId);
            }
            setContextMenu(null);
          }}>
            &#128204; {pinnedMessageIds.includes(contextMenu.msgId) ? 'Unpin' : 'Pin'}
          </button>
          <button className="context-menu-item" onClick={() => {
            const msg = messages.find(m => m.messageId === contextMenu.msgId);
            if (msg) {
              const link = `${window.location.origin}/message/${containerId}/${contextMenu.msgId}`;
              try {
                const copyResult = navigator.clipboard?.writeText(link);
                if (copyResult?.catch) copyResult.catch(() => {});
              } catch(e) {}
              setCopyStatus('Message link copied');
              setTimeout(() => setCopyStatus(''), 2000);
            }
            setContextMenu(null);
          }}>&#128278; Copy link</button>
          <button className="context-menu-item" onClick={() => {
            const msg = messages.find(m => m.messageId === contextMenu.msgId);
            if (msg) {
              actions.bookmarkMessage ? actions.bookmarkMessage(containerId, contextMenu.msgId) : null;
            }
            setContextMenu(null);
          }}>&#128190; Save this message</button>
        </div>
      )}

      {/* Attachment preview modal */}
      {previewAttachment && (
        <div className="modal-overlay" onClick={() => setPreviewAttachment(null)} style={{ zIndex: 500 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{getFileIcon(previewAttachment.name).icon}</span>
                {previewAttachment.name}
              </h3>
              <button className="modal-close" onClick={() => setPreviewAttachment(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '8px 12px', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>File size</span>
                <span>{formatSize(previewAttachment.size)}</span>
                {previewAttachment.contentType && (
                  <>
                    <span style={{ color: 'var(--text-secondary)' }}>Type</span>
                    <span>{previewAttachment.contentType}</span>
                  </>
                )}
              </div>
              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 4, border: 'none', cursor: 'pointer', background: 'var(--brand-primary)', color: '#fff' }}
                  onClick={() => {
                    if (previewAttachment.downloadUrl && previewAttachment.downloadUrl !== '#') {
                      const a = document.createElement('a');
                      a.href = previewAttachment.downloadUrl;
                      a.download = previewAttachment.name;
                      a.click();
                    } else {
                      const content = `File: ${previewAttachment.name}\nThis is a mock file.`;
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = previewAttachment.name; a.click();
                      URL.revokeObjectURL(url);
                    }
                    setPreviewAttachment(null);
                  }}>
                  &#8681; Download
                </button>
                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 4, border: '1px solid var(--border-color)', cursor: 'pointer', background: 'transparent' }}
                  onClick={() => setPreviewAttachment(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {copyStatus && <div role="status" className="inline-status" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 700 }}>{copyStatus}</div>}
    </div>
  );
}
