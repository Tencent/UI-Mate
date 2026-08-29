import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const FILTER_TABS = ['全部', '未读', '@我', '群组', '单聊'];

export default function ConversationList() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('全部');
  const [contextMenu, setContextMenu] = useState(null);

  const { conversations, messages, currentUser, activeConversationId } = state;

  function getOtherUser(conv) {
    if (conv.type !== 'direct') return null;
    const otherId = conv.members.find(id => id !== currentUser.id);
    return state.users.find(u => u.id === otherId);
  }

  function getConvName(conv) {
    if (conv.type === 'direct') {
      return getOtherUser(conv)?.name || '未知用户';
    }
    return conv.name || '未知群组';
  }

  function getConvAvatar(conv) {
    if (conv.type === 'direct') {
      const u = getOtherUser(conv);
      return { color: u?.avatarColor || '#8F959E', initials: u?.initials || u?.name?.[0] || '?' };
    }
    if (conv.type === 'bot') {
      return { color: '#3370FF', initials: '🤖' };
    }
    // Group: use first letter of group name
    return { color: '#646A73', initials: conv.name?.[0] || '群' };
  }

  function getLastMessageText(conv) {
    const msgs = messages[conv.id] || [];
    const last = msgs[msgs.length - 1];
    if (!last && conv.lastMessage) return conv.lastMessage.content;
    if (!last) return '';
    if (last.contentType === 'system') return last.content;
    if (last.contentType === 'card') return '[卡片消息]';
    const sender = last.senderId === currentUser.id ? '你: ' : '';
    return sender + (last.content || '');
  }

  function formatTime(ts) {
    if (!ts) return '';
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    const yesterday = new Date(today - 86400000);
    if (d.toDateString() === yesterday.toDateString()) return '昨天';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }

  function handleContextMenu(e, conv) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, conv });
  }

  function handleMenuAction(action, conv) {
    if (action === 'pin') dispatch({ type: 'TOGGLE_PIN_CONVERSATION', payload: conv.id });
    if (action === 'read') dispatch({ type: 'MARK_CONVERSATION_READ', payload: conv.id });
    if (action === 'mute') dispatch({ type: 'TOGGLE_MUTE_CONVERSATION', payload: conv.id });
    setContextMenu(null);
  }

  // Filter conversations
  let filtered = [...conversations];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(c => getConvName(c).toLowerCase().includes(q) || (c.lastMessage?.content || '').toLowerCase().includes(q));
  }

  if (activeFilter === '未读') filtered = filtered.filter(c => c.unreadCount > 0);
  else if (activeFilter === '@我') {
    filtered = filtered.filter(c => {
      const msgs = messages[c.id] || [];
      return msgs.some(m => m.mentions?.includes(currentUser.id) && !m.isRead);
    });
  }
  else if (activeFilter === '群组') filtered = filtered.filter(c => c.type === 'group');
  else if (activeFilter === '单聊') filtered = filtered.filter(c => c.type === 'direct');

  // Separate pinned
  const pinned = filtered.filter(c => c.isPinned);
  const unpinned = filtered.filter(c => !c.isPinned);

  function handleSelectConv(conv) {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conv.id });
    navigate(`/messenger/${conv.id}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} onClick={() => setContextMenu(null)}>
      {/* Search */}
      <div style={{ padding: '12px 12px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#F5F6F7', borderRadius: 8, padding: '0 10px', height: 32,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8F959E" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索"
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#1F2329' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8F959E', fontSize: 16, lineHeight: 1 }}>✕</button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #DEE0E3', paddingLeft: 8, paddingRight: 8 }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            style={{
              flex: 1, padding: '7px 4px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 13, color: activeFilter === tab ? '#3370FF' : '#646A73',
              fontWeight: activeFilter === tab ? 500 : 400,
              borderBottom: activeFilter === tab ? '2px solid #3370FF' : '2px solid transparent',
              transition: 'color 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Pinned */}
        {pinned.length > 0 && (
          <>
            <div style={{ padding: '6px 16px 2px', fontSize: 11, color: '#8F959E', fontWeight: 500 }}>置顶</div>
            {pinned.map(conv => (
              <ConvRow
                key={conv.id}
                conv={conv}
                name={getConvName(conv)}
                avatar={getConvAvatar(conv)}
                lastText={getLastMessageText(conv)}
                time={formatTime(conv.lastMessage?.timestamp)}
                active={conv.id === activeConversationId}
                onSelect={() => handleSelectConv(conv)}
                onContextMenu={e => handleContextMenu(e, conv)}
              />
            ))}
          </>
        )}

        {/* Rest */}
        {unpinned.map(conv => (
          <ConvRow
            key={conv.id}
            conv={conv}
            name={getConvName(conv)}
            avatar={getConvAvatar(conv)}
            lastText={getLastMessageText(conv)}
            time={formatTime(conv.lastMessage?.timestamp)}
            active={conv.id === activeConversationId}
            onSelect={() => handleSelectConv(conv)}
            onContextMenu={e => handleContextMenu(e, conv)}
          />
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: '#8F959E', fontSize: 13 }}>
            {searchQuery ? `未找到 "${searchQuery}" 相关会话` : '暂无会话'}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div onClick={() => setContextMenu(null)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
          <div style={{
            position: 'fixed', left: contextMenu.x, top: contextMenu.y,
            background: '#fff', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 200, minWidth: 160, border: '1px solid #DEE0E3', padding: '4px 0',
          }}>
            {[
              [contextMenu.conv?.isPinned ? '取消置顶' : '置顶', 'pin'],
              ['标记已读', 'read'],
              [contextMenu.conv?.isMuted ? '取消免打扰' : '免打扰', 'mute'],
            ].map(([label, action]) => (
              <button
                key={action}
                onClick={() => handleMenuAction(action, contextMenu.conv)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 16px', border: 'none', background: 'transparent',
                  cursor: 'pointer', fontSize: 13, color: '#1F2329',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F7'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ConvRow({ conv, name, avatar, lastText, time, active, onSelect, onContextMenu }) {
  return (
    <div
      onClick={onSelect}
      onContextMenu={onContextMenu}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 16px', height: 56,
        background: active ? '#E1EAFF' : 'transparent',
        cursor: 'pointer', transition: 'background 0.1s',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F0F1F2'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: avatar.color, color: '#fff', fontWeight: 600, fontSize: 15,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {avatar.initials}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#1F2329', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
            {name}
          </span>
          <span style={{ fontSize: 11, color: '#8F959E', flexShrink: 0, marginLeft: 6 }}>{time}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            fontSize: 12, color: '#646A73',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
            opacity: conv.isMuted ? 0.6 : 1,
          }}>
            {lastText}
          </span>
          {conv.unreadCount > 0 && (
            <span style={{
              minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px',
              background: conv.isMuted ? '#8F959E' : '#F54A45',
              color: '#fff', fontSize: 10, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
