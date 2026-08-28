import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import EmojiPicker from './EmojiPicker';

export default function MessageInput({ conversation, quoteReply, onClearQuote }) {
  const { state, dispatch } = useApp();
  const { currentUser } = state;
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null); // null or string
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const members = conversation.members
    ? state.users.filter(u => conversation.members.includes(u.id) && u.id !== currentUser.id)
    : state.users.filter(u => u.id !== currentUser.id);

  const filteredMembers = mentionQuery !== null
    ? members.filter(u => u.name.includes(mentionQuery) || u.englishName.toLowerCase().includes(mentionQuery.toLowerCase()))
    : [];

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === 'Escape' && mentionQuery !== null) {
      setMentionQuery(null);
    }
  }

  function handleChange(e) {
    const val = e.target.value;
    setContent(val);

    // Detect @mention
    const cursor = e.target.selectionStart;
    const textBefore = val.slice(0, cursor);
    const atIdx = textBefore.lastIndexOf('@');
    if (atIdx >= 0 && (atIdx === 0 || textBefore[atIdx - 1] === ' ' || textBefore[atIdx - 1] === '\n')) {
      const query = textBefore.slice(atIdx + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query);
        setMentionStart(atIdx);
        return;
      }
    }
    setMentionQuery(null);
  }

  function insertMention(user) {
    const before = content.slice(0, mentionStart);
    const after = content.slice(textareaRef.current?.selectionStart || mentionStart + mentionQuery.length + 1);
    setContent(`${before}@${user.name} ${after}`);
    setMentionQuery(null);
    textareaRef.current?.focus();
  }

  function handleFileAttach(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const msg = {
      id: `msg_${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      content: `[文件] ${file.name}`,
      contentType: 'file',
      fileName: file.name,
      fileSize: file.size,
      timestamp: Date.now(),
      isEdited: false,
      reactions: [],
      threadId: null,
      threadCount: 0,
      threadLastReply: null,
      replyTo: null,
      mentions: [],
      isRead: true,
      isPinned: false,
      attachments: [{ name: file.name, size: file.size }],
      card: null,
    };
    dispatch({ type: 'SEND_MESSAGE', payload: { message: msg } });
    e.target.value = '';
  }

  function sendMessage() {
    const text = content.trim();
    if (!text) return;

    // Parse mentions
    const mentions = [];
    state.users.forEach(u => {
      if (text.includes(`@${u.name}`)) mentions.push(u.id);
    });

    const quotedPrefix = quoteReply
      ? `> ${quoteReply.sender?.name || '未知用户'}: ${quoteReply.message.content?.slice(0, 80)}\n`
      : '';

    const msg = {
      id: `msg_${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      content: quotedPrefix + text,
      contentType: 'text',
      timestamp: Date.now(),
      isEdited: false,
      reactions: [],
      threadId: null,
      threadCount: 0,
      threadLastReply: null,
      replyTo: quoteReply ? quoteReply.message.id : null,
      mentions,
      isRead: true,
      isPinned: false,
      attachments: [],
      card: null,
    };

    dispatch({ type: 'SEND_MESSAGE', payload: { message: msg } });
    setContent('');
    if (onClearQuote) onClearQuote();
  }

  const placeholder = `发给 ${conversation.type === 'direct'
    ? state.users.find(u => u.id !== currentUser.id && conversation.members.includes(u.id))?.name || '对方'
    : conversation.name || '群组'}`;

  return (
    <div style={{
      borderTop: '1px solid #DEE0E3', background: '#fff', padding: '8px 16px 12px', position: 'relative',
    }}>
      {/* Quote reply banner */}
      {quoteReply && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, right: 0,
          background: '#F7F8FA', borderTop: '1px solid #DEE0E3', borderLeft: '3px solid #3370FF',
          padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 12, color: '#646A73', flex: 1 }}>
            引用 <strong style={{ color: '#1F2329' }}>{quoteReply.sender?.name || '未知用户'}</strong>: {quoteReply.message.content?.slice(0, 60)}{quoteReply.message.content?.length > 60 ? '…' : ''}
          </span>
          <button
            onClick={onClearQuote}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8F959E', fontSize: 16, lineHeight: 1, padding: 0 }}
          >✕</button>
        </div>
      )}

      {/* Mention dropdown */}
      {mentionQuery !== null && filteredMembers.length > 0 && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 16, right: 16,
          background: '#fff', borderRadius: 8, boxShadow: '0 -4px 16px rgba(0,0,0,0.12)',
          border: '1px solid #DEE0E3', maxHeight: 200, overflowY: 'auto', zIndex: 50,
        }}>
          {filteredMembers.map(u => (
            <div
              key={u.id}
              onClick={() => insertMention(u)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: u.avatarColor, color: '#fff', fontWeight: 600, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{u.initials}</div>
              <div>
                <div style={{ fontSize: 14, color: '#1F2329' }}>{u.name}</div>
                <div style={{ fontSize: 11, color: '#8F959E' }}>{u.department}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileAttach} />
        <ToolbarBtn title="加粗" onClick={() => setContent(c => `**${c}**`)}>
          <strong style={{ fontSize: 13 }}>B</strong>
        </ToolbarBtn>
        <ToolbarBtn title="@提及" onClick={() => { setContent(c => c + '@'); textareaRef.current?.focus(); }}>
          @
        </ToolbarBtn>
        <ToolbarBtn title="表情" onClick={() => setShowEmojiPicker(p => !p)}>😀</ToolbarBtn>
        <ToolbarBtn title="附件" onClick={() => fileInputRef.current?.click()}>📎</ToolbarBtn>
        <ToolbarBtn title="截图" onClick={() => { setContent(c => c + '[截图已添加]'); textareaRef.current?.focus(); }}>✂️</ToolbarBtn>
      </div>

      {/* Input area */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          style={{
            flex: 1, resize: 'none', border: '1px solid #DEE0E3', borderRadius: 8,
            padding: '8px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none',
            lineHeight: '22px', maxHeight: 120, overflowY: 'auto',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = '#3370FF'; }}
          onBlur={e => { e.target.style.borderColor = '#DEE0E3'; }}
        />
        <button
          onClick={sendMessage}
          disabled={!content.trim()}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: content.trim() ? '#3370FF' : '#DEE0E3',
            color: '#fff', cursor: content.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div style={{ position: 'absolute', bottom: '100%', left: 16, zIndex: 50 }}>
          <EmojiPicker
            onSelect={emoji => { setContent(c => c + emoji); setShowEmojiPicker(false); textareaRef.current?.focus(); }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}
    </div>
  );
}

function ToolbarBtn({ children, title, onClick, disabled }) {
  return (
    <button
      title={title}
      onClick={disabled ? undefined : onClick}
      style={{
        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', background: 'transparent', borderRadius: 4, color: '#646A73', fontSize: 14,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#F0F1F2'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}
