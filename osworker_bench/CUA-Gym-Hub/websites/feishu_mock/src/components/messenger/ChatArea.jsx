import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ThreadPanel from './ThreadPanel';
import ConversationInfoPanel from './ConversationInfoPanel';

export default function ChatArea({ conversation }) {
  const { state, dispatch } = useApp();
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissedNotice, setDismissedNotice] = useState(false);
  const [quoteReply, setQuoteReply] = useState(null);

  const otherUser = conversation.type === 'direct'
    ? state.users.find(u => u.id !== state.currentUser.id && conversation.members.includes(u.id))
    : null;

  const displayName = conversation.type === 'direct'
    ? otherUser?.name || '未知用户'
    : conversation.name;

  const statusColor = {
    online: '#34C724', busy: '#FF7D00', away: '#FAAD14', offline: '#8F959E'
  }[otherUser?.status] || '#8F959E';

  const showTopNotice = conversation.topNotice && !dismissedNotice;

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          height: 56, borderBottom: '1px solid #DEE0E3', background: '#fff',
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, flexShrink: 0,
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 16, color: '#1F2329' }}>{displayName}</span>
            {conversation.type === 'group' && (
              <span style={{ fontSize: 13, color: '#646A73' }}>👥 {conversation.memberCount}</span>
            )}
            {conversation.type === 'direct' && otherUser && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: '#646A73' }}>{otherUser.status === 'online' ? '在线' : otherUser.status === 'busy' ? '忙碌' : '离线'}</span>
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <IconBtn title="语音通话" onClick={() => { dispatch({ type: 'SEND_MESSAGE', payload: { message: { id: `msg_call_${Date.now()}`, conversationId: conversation.id, senderId: state.currentUser.id, content: '📞 发起了语音通话', contentType: 'system', timestamp: Date.now(), isEdited: false, reactions: [], threadId: null, threadCount: 0, threadLastReply: null, replyTo: null, mentions: [], isRead: true, isPinned: false, attachments: [], card: null } } }); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.82 9.72a19.79 19.79 0 01-3.07-8.67A2 2 0 012.73 3h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 10.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            </IconBtn>
            <IconBtn title="视频通话" onClick={() => { dispatch({ type: 'SEND_MESSAGE', payload: { message: { id: `msg_video_${Date.now()}`, conversationId: conversation.id, senderId: state.currentUser.id, content: '📹 发起了视频通话', contentType: 'system', timestamp: Date.now(), isEdited: false, reactions: [], threadId: null, threadCount: 0, threadLastReply: null, replyTo: null, mentions: [], isRead: true, isPinned: false, attachments: [], card: null } } }); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            </IconBtn>
            <IconBtn title="搜索" onClick={() => setShowSearch(!showSearch)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </IconBtn>
            <IconBtn title="群组信息" onClick={() => setShowInfoPanel(!showInfoPanel)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </IconBtn>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div style={{ padding: '8px 16px', background: '#F5F6F7', borderBottom: '1px solid #DEE0E3' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 6, padding: '5px 10px', border: '1px solid #DEE0E3' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8F959E" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="在当前会话中搜索"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13 }}
                autoFocus
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#646A73', fontSize: 13 }}>关闭</button>
            </div>
          </div>
        )}

        {/* Top Notice */}
        {showTopNotice && (
          <div style={{
            background: '#FFF8E5', borderLeft: '3px solid #FF7D00',
            padding: '8px 16px', display: 'flex', alignItems: 'flex-start', gap: 8, flexShrink: 0,
          }}>
            <span style={{ fontSize: 14 }}>📌</span>
            <span style={{ flex: 1, fontSize: 13, color: '#1F2329', lineHeight: '20px' }}>{conversation.topNotice}</span>
            <button
              onClick={() => setDismissedNotice(true)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8F959E', fontSize: 16, lineHeight: 1, padding: 0 }}
            >✕</button>
          </div>
        )}

        {/* Message List */}
        <MessageList
          conversation={conversation}
          searchQuery={showSearch ? searchQuery : ''}
          onQuoteReply={(msg, sender) => setQuoteReply({ message: msg, sender })}
        />

        {/* Input */}
        <MessageInput conversation={conversation} quoteReply={quoteReply} onClearQuote={() => setQuoteReply(null)} />
      </div>

      {/* Thread Panel */}
      {state.threadPanelMessageId && (
        <ThreadPanel conversation={conversation} />
      )}

      {/* Info Panel */}
      {showInfoPanel && (
        <ConversationInfoPanel
          conversation={conversation}
          onClose={() => setShowInfoPanel(false)}
        />
      )}
    </div>
  );
}

function IconBtn({ children, title, onClick, disabled }) {
  return (
    <button
      title={title}
      onClick={disabled ? undefined : onClick}
      style={{
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6, border: 'none', background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: '#646A73',
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = '#F0F1F2'; e.currentTarget.style.color = '#3370FF'; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#646A73'; } }}
    >
      {children}
    </button>
  );
}
