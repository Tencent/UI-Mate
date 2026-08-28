
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Message from './Message';
import EmojiPicker from './EmojiPicker';
import './ThreadPanel.css';

function ThreadPanel() {
  const { state, activeThread, setActiveThread, addMessage, addMessageWithAttachments, toggleThreadFollow, showToast } = useApp();
  const [replyContent, setReplyContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!activeThread) return null;

  const thread = state.threads[activeThread];
  if (!thread) return null;

  const parentMessage = Object.values(state.messages)
    .flat()
    .find(m => m.messageId === thread.parentMessageId);

  if (!parentMessage) return null;

  const threadMessages = Object.values(state.messages)
    .flat()
    .filter(m => m.threadId === activeThread);

  const isFollowing = thread.followers.includes(state.currentUser.userId);

  // Get channel/DM name for subtitle
  const channelInfo = thread.channelId
    ? state.channels.find(ch => ch.channelId === thread.channelId)
    : null;
  const dmInfo = thread.dmId
    ? state.dms.find(d => d.dmId === thread.dmId)
    : null;
  let contextName = '';
  if (channelInfo) {
    contextName = `#${channelInfo.name}`;
  } else if (dmInfo) {
    const otherUser = state.users.find(u =>
      u.userId !== state.currentUser.userId && dmInfo.participants.includes(u.userId)
    );
    contextName = otherUser ? otherUser.displayName : 'Direct Message';
  }

  const handleSendReply = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      addMessage(thread.channelId, thread.dmId, replyContent, activeThread);
      setReplyContent('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply(e);
    }
  };

  const handleEmojiSelect = (emoji) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = replyContent.substring(0, start) + emoji + replyContent.substring(end);
      setReplyContent(newContent);
      setTimeout(() => {
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      const urlParams = new URLSearchParams(window.location.search);
      const sid = urlParams.get('sid') || '';
      const uploadUrl = sid ? `/upload?sid=${encodeURIComponent(sid)}` : '/upload';

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      if (result.success && result.files && result.files.length > 0) {
        const uploaded = result.files[0];
        const isImage = file.type.startsWith('image/');
        const attachment = {
          type: isImage ? 'image' : 'file',
          name: uploaded.original_name,
          url: uploaded.url,
          mimeType: file.type,
        };
        addMessageWithAttachments(thread.channelId, thread.dmId, replyContent, [attachment], [], activeThread);
        setReplyContent('');
        showToast(`File sent: ${file.name}`);
      }
    } catch (error) {
      showToast(error.message || 'Failed to upload file', 'error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="thread-panel">
      <div className="thread-header">
        <div className="thread-header-info">
          <h3>Thread</h3>
          {contextName && <span className="thread-header-channel">{contextName}</span>}
        </div>
        <div className="thread-actions">
          <button
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
            onClick={() => toggleThreadFollow(activeThread)}
          >
            {isFollowing ? '\u2713 Following' : 'Follow'}
          </button>
          <button className="close-btn" onClick={() => setActiveThread(null)} title="Close">
            <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M15.06 4.94a.75.75 0 0 1 0 1.06L11.12 10l3.94 3.94a.75.75 0 1 1-1.06 1.06L10 11.06l-3.94 3.94a.75.75 0 0 1-1.06-1.06L8.94 10 5 6.06a.75.75 0 0 1 1.06-1.06L10 8.94l3.94-3.94a.75.75 0 0 1 1.06 0z"/></svg>
          </button>
        </div>
      </div>

      <div className="thread-content">
        <div className="thread-parent">
          <Message
            message={parentMessage}
            channelId={thread.channelId}
            dmId={thread.dmId}
            isInThread={true}
          />
        </div>

        <div className="thread-replies-list">
          <div className="replies-count">
            {threadMessages.length} {threadMessages.length === 1 ? 'reply' : 'replies'}
          </div>
          {threadMessages.map(message => (
            <Message
              key={message.messageId}
              message={message}
              channelId={thread.channelId}
              dmId={thread.dmId}
              isInThread={true}
            />
          ))}
        </div>
      </div>

      <div className="thread-composer">
        <form onSubmit={handleSendReply}>
          <textarea
            ref={textareaRef}
            className="thread-reply-input"
            placeholder="Reply to thread..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          />
          <div className="thread-composer-actions">
            <div className="thread-composer-left">
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              />
              <button
                type="button"
                className="thread-action-btn"
                title="Attach file"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor"><path d="M8 1a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 8 1z"/></svg>
              </button>
              <button
                type="button"
                className="thread-action-btn"
                title="Insert emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM7 8.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-4.2 3a.75.75 0 0 1 1.05-.15c.7.5 1.4.75 2.15.75s1.45-.25 2.15-.75a.75.75 0 1 1 .9 1.2A4.77 4.77 0 0 1 10 13.5a4.77 4.77 0 0 1-3.05-1.05.75.75 0 0 1-.15-1.05z"/></svg>
              </button>
            </div>
            <button
              type="submit"
              className="thread-send-btn"
              disabled={!replyContent.trim()}
            >
              Send
            </button>
          </div>
        </form>
        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '100%', right: '16px', zIndex: 1000 }}>
            <EmojiPicker
              onSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ThreadPanel;
