import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { useApp } from '../context/AppContext.jsx';
import MessageList from '../components/MessageList.jsx';
import MessageComposer from '../components/MessageComposer.jsx';

function formatTimestamp(iso) {
  if (!iso) return '';
  const d = parseISO(iso);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'M/d');
}

export default function ChatPage() {
  const { chatId: paramChatId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, actions } = useApp();
  const [filter, setFilter] = useState('all');
  const [composingNew, setComposingNew] = useState(false);
  const [toUsers, setToUsers] = useState([]);
  const [toSearch, setToSearch] = useState('');
  const [groupName, setGroupName] = useState('');

  const chats = state.chats.filter(c => !c.isHidden);
  const query = searchParams.toString();
  const qStr = query ? `?${query}` : '';

  const activeChatId = composingNew ? null : (paramChatId || (chats.length > 0 ? chats[0].chatId : null));

  let filteredChats = [...chats];
  if (filter === 'unread') filteredChats = filteredChats.filter(c => c.unreadCount > 0);
  if (filter === 'muted') filteredChats = filteredChats.filter(c => c.isMuted);

  const pinnedChats = filteredChats.filter(c => c.isPinned).sort((a, b) => (b.lastMessageTimestamp || '').localeCompare(a.lastMessageTimestamp || ''));
  const recentChats = filteredChats.filter(c => !c.isPinned).sort((a, b) => (b.lastMessageTimestamp || '').localeCompare(a.lastMessageTimestamp || ''));

  const activeChat = state.chats.find(c => c.chatId === activeChatId);
  const activeMessages = activeChatId ? (state.messages[activeChatId] || []) : [];

  // User search for new chat compose
  const searchResults = toSearch.trim()
    ? state.users.filter(u =>
        u.userId !== state.currentUser.userId &&
        !toUsers.find(tu => tu.userId === u.userId) &&
        (u.displayName.toLowerCase().includes(toSearch.toLowerCase()) ||
         u.email.toLowerCase().includes(toSearch.toLowerCase()))
      )
    : [];

  function getChatDisplayName(chat) {
    if (chat.chatType === 'group' || chat.chatType === 'meeting') {
      return chat.topic || chat.participants.filter(p => p !== state.currentUser.userId).map(p => {
        const u = state.users.find(u2 => u2.userId === p);
        return u ? u.firstName : p;
      }).join(', ');
    }
    const otherId = chat.participants.find(p => p !== state.currentUser.userId);
    const user = state.users.find(u => u.userId === otherId);
    return user ? user.displayName : 'Unknown';
  }

  function getChatAvatar(chat) {
    if (chat.chatType === 'oneOnOne') {
      const otherId = chat.participants.find(p => p !== state.currentUser.userId);
      const user = state.users.find(u => u.userId === otherId);
      return user ? user.avatar : '';
    }
    return null;
  }

  function getChatPresence(chat) {
    if (chat.chatType === 'oneOnOne') {
      const otherId = chat.participants.find(p => p !== state.currentUser.userId);
      const user = state.users.find(u => u.userId === otherId);
      return user ? user.presence : 'offline';
    }
    return null;
  }

  function handleSelectChat(chatId) {
    setComposingNew(false);
    actions.markAsRead(chatId);
    navigate(`/chat/${chatId}${qStr}`);
  }

  function handleSendMessage(content) {
    if (!activeChatId) return;
    actions.sendMessage(activeChatId, content);
  }

  function handleNewChat() {
    setComposingNew(true);
    setToUsers([]);
    setToSearch('');
    setGroupName('');
  }

  function handleAddUser(user) {
    setToUsers(prev => [...prev, user]);
    setToSearch('');
  }

  function handleRemoveUser(userId) {
    setToUsers(prev => prev.filter(u => u.userId !== userId));
  }

  function handleSendNewMessage(content) {
    if (toUsers.length === 0 || !content.trim()) return;
    const participantIds = toUsers.map(u => u.userId);
    const chatType = participantIds.length === 1 ? 'oneOnOne' : 'group';
    const topic = chatType === 'group' ? (groupName.trim() || null) : null;

    // Check if there's an existing chat with these exact participants
    const existingChat = state.chats.find(c => {
      if (chatType === 'oneOnOne' && c.chatType === 'oneOnOne') {
        return c.participants.includes(participantIds[0]) && c.participants.includes(state.currentUser.userId);
      }
      return false;
    });

    if (existingChat) {
      actions.sendMessage(existingChat.chatId, content);
      setComposingNew(false);
      navigate(`/chat/${existingChat.chatId}${qStr}`);
    } else {
      // createChat expects (participants, topic, optionalChatId)
      // Generate a predictable chatId so we can navigate immediately
      const newChatId = 'chat_' + Date.now();
      actions.createChat(participantIds, topic || '', newChatId);
      // Use setTimeout to ensure state has updated before sending message
      setTimeout(() => {
        actions.sendMessage(newChatId, content);
        setComposingNew(false);
        navigate(`/chat/${newChatId}${qStr}`);
      }, 0);
    }
  }

  function renderChatItem(chat) {
    const name = getChatDisplayName(chat);
    const avatar = getChatAvatar(chat);
    const presence = getChatPresence(chat);
    const isActive = chat.chatId === activeChatId;
    const initials = chat.chatType !== 'oneOnOne' ? name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() : '';

    return (
      <button key={chat.chatId} className={`chat-item ${isActive ? 'active' : ''}`} onClick={() => handleSelectChat(chat.chatId)}>
        <div className="chat-item-avatar">
          {avatar ? (
            <img src={avatar} alt={name} />
          ) : (
            <div className="avatar-initials" style={{ background: '#6264A7' }}>{initials}</div>
          )}
          {presence && <span className={`presence-dot presence-dot-sidebar ${presence}`} />}
        </div>
        <div className="chat-item-content">
          <div className="chat-item-name">{name}</div>
          <div className="chat-item-preview">{chat.lastMessagePreview}</div>
        </div>
        <div className="chat-item-meta">
          <span className="chat-item-time">{formatTimestamp(chat.lastMessageTimestamp)}</span>
          {chat.unreadCount > 0 && <span className="chat-item-badge">{chat.unreadCount}</span>}
        </div>
      </button>
    );
  }

  return (
    <>
      <div className="secondary-sidebar">
        <div className="sidebar-header">
          <h2>Chat</h2>
          <div className="sidebar-header-actions">
            <button title="Filter">&#9783;</button>
            <button title="Video">&#127909;</button>
            <button title="New chat" onClick={handleNewChat}>&#9998;</button>
          </div>
        </div>
        <div className="filter-chips">
          {['all', 'unread', 'muted'].map(f => (
            <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="sidebar-list">
          {pinnedChats.length > 0 && (
            <>
              <div className="sidebar-section-label"><span className="chevron">&#9660;</span> Pinned</div>
              {pinnedChats.map(renderChatItem)}
            </>
          )}
          {recentChats.length > 0 && (
            <>
              <div className="sidebar-section-label"><span className="chevron">&#9660;</span> Recent</div>
              {recentChats.map(renderChatItem)}
            </>
          )}
          {filteredChats.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No chats found</div>
          )}
        </div>
        <button className="invite-btn">&#128101; Invite to Teams</button>
      </div>
      <div className="main-content">
        {composingNew ? (
          <>
            <div className="content-header">
              <span className="content-header-title">New Chat</span>
              <div className="content-header-actions">
                <button onClick={() => setComposingNew(false)} title="Cancel">&times;</button>
              </div>
            </div>
            <div className="new-chat-to-bar">
              <span className="new-chat-to-label">To:</span>
              <div className="new-chat-to-chips">
                {toUsers.map(u => (
                  <span key={u.userId} className="to-chip">
                    <img src={u.avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 4 }} />
                    {u.displayName}
                    <button className="to-chip-remove" onClick={() => handleRemoveUser(u.userId)}>&times;</button>
                  </span>
                ))}
                <input
                  type="text"
                  className="new-chat-to-input"
                  value={toSearch}
                  onChange={e => setToSearch(e.target.value)}
                  placeholder={toUsers.length === 0 ? 'Start typing a name...' : ''}
                  autoFocus
                />
              </div>
              {searchResults.length > 0 && (
                <div className="user-search-dropdown">
                  {searchResults.slice(0, 6).map(user => (
                    <button key={user.userId} className="user-search-item" onClick={() => handleAddUser(user)}>
                      <img src={user.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{user.displayName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user.jobTitle}</div>
                      </div>
                      <span className={`presence-dot ${user.presence}`} style={{ marginLeft: 'auto' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {toUsers.length > 1 && (
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <input
                  type="text"
                  className="new-chat-to-input"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="Add a group name (optional)"
                  style={{ width: '100%' }}
                />
              </div>
            )}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {toUsers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">&#9998;</div>
                  <div className="empty-state-title">Start a new conversation</div>
                  <div className="empty-state-text">Search for people to chat with.</div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">&#128172;</div>
                  <div className="empty-state-title">Ready to chat</div>
                  <div className="empty-state-text">Type a message below to start the conversation with {toUsers.map(u => u.firstName).join(', ')}.</div>
                </div>
              )}
            </div>
            {toUsers.length > 0 && <MessageComposer onSend={handleSendNewMessage} placeholder="Type a new message" />}
          </>
        ) : activeChat ? (
          <>
            <div className="content-header">
              <span className="content-header-title">{getChatDisplayName(activeChat)}</span>
              <div className="content-header-actions">
                <button title="Video call">&#127909;</button>
                <button title="Audio call">&#128222;</button>
                <button title="Screen share">&#128187;</button>
                <button title="More">&#8943;</button>
              </div>
            </div>
            <div className="tab-bar">
              <button className="tab-item active">Chat</button>
              <button className="tab-item">Files</button>
              {activeChat.chatType === 'oneOnOne' && <button className="tab-item">Organization</button>}
              <button className="tab-item">Activity</button>
              <button className="tab-item tab-add" aria-label="Add chat tab">+</button>
            </div>
            <MessageList containerId={activeChatId} messages={activeMessages} />
            <MessageComposer onSend={handleSendMessage} />
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">&#128172;</div>
            <div className="empty-state-title">Select a chat</div>
            <div className="empty-state-text">Choose a conversation from the sidebar to start messaging.</div>
          </div>
        )}
      </div>
    </>
  );
}
