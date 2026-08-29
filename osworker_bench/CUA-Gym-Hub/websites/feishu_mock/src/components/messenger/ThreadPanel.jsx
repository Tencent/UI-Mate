import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import MessageItem from './MessageItem';

export default function ThreadPanel({ conversation }) {
  const { state, dispatch } = useApp();
  const { threadPanelMessageId, messages, currentUser } = state;
  const [replyContent, setReplyContent] = useState('');
  const bottomRef = useRef(null);

  const allMsgs = messages[conversation.id] || [];
  const parentMsg = allMsgs.find(m => m.id === threadPanelMessageId);
  const threadReplies = allMsgs.filter(m => m.threadId === threadPanelMessageId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadReplies.length]);

  function sendReply() {
    if (!replyContent.trim()) return;
    const reply = {
      id: `thread_${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      content: replyContent.trim(),
      contentType: 'text',
      timestamp: Date.now(),
      isEdited: false,
      reactions: [],
      threadId: threadPanelMessageId,
      threadCount: 0,
      threadLastReply: null,
      replyTo: null,
      mentions: [],
      isRead: true,
      isPinned: false,
      attachments: [],
      card: null,
    };
    dispatch({ type: 'SEND_THREAD_REPLY', payload: { reply, parentId: threadPanelMessageId, conversationId: conversation.id } });
    setReplyContent('');
  }

  return (
    <div style={{
      width: 360, borderLeft: '1px solid #DEE0E3', background: '#fff',
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ height: 56, borderBottom: '1px solid #DEE0E3', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 16, color: '#1F2329' }}>话题</span>
        <button
          onClick={() => dispatch({ type: 'SET_THREAD_PANEL', payload: null })}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#646A73', fontSize: 18, lineHeight: 1 }}
        >✕</button>
      </div>

      {/* Parent message */}
      <div style={{ padding: '12px 0', borderBottom: '1px solid #DEE0E3' }}>
        {parentMsg && (
          <MessageItem
            message={parentMsg}
            showAvatar={true}
            conversation={conversation}
            highlighted={false}
            searchQuery=""
          />
        )}
      </div>

      {/* Thread replies */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {threadReplies.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#8F959E', fontSize: 13 }}>
            还没有回复，来第一个发言吧
          </div>
        )}
        {threadReplies.map(m => (
          <MessageItem
            key={m.id}
            message={m}
            showAvatar={true}
            conversation={conversation}
            highlighted={false}
            searchQuery=""
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply input */}
      <div style={{ borderTop: '1px solid #DEE0E3', padding: '8px 12px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
            placeholder="回复话题..."
            rows={2}
            style={{
              flex: 1, resize: 'none', border: '1px solid #DEE0E3', borderRadius: 8,
              padding: '6px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', lineHeight: '20px',
            }}
            onFocus={e => { e.target.style.borderColor = '#3370FF'; }}
            onBlur={e => { e.target.style.borderColor = '#DEE0E3'; }}
          />
          <button
            onClick={sendReply}
            disabled={!replyContent.trim()}
            style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none',
              background: replyContent.trim() ? '#3370FF' : '#DEE0E3',
              color: '#fff', cursor: replyContent.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
