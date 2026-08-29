import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const presenceOptions = [
  { value: 'available', label: 'Available', color: '#92C353' },
  { value: 'busy', label: 'Busy', color: '#C4314B' },
  { value: 'dnd', label: 'Do not disturb', color: '#C4314B' },
  { value: 'brb', label: 'Be right back', color: '#FCD116' },
  { value: 'away', label: 'Appear away', color: '#FCD116' },
  { value: 'offline', label: 'Appear offline', color: '#B4B4B4' },
];

export default function Header() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const query = searchParams.toString();
  const qStr = query ? `?${query}` : '';

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut: Ctrl+E to focus search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        const input = searchRef.current?.querySelector('input');
        if (input) { input.focus(); setSearchFocused(true); }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cu = state.currentUser;

  // Search results computation
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchResults = { people: [], messages: [], files: [] };
  if (trimmedQuery.length > 0) {
    // People
    searchResults.people = state.users.filter(u =>
      u.displayName.toLowerCase().includes(trimmedQuery) ||
      u.email.toLowerCase().includes(trimmedQuery) ||
      (u.jobTitle && u.jobTitle.toLowerCase().includes(trimmedQuery))
    ).slice(0, 4);

    // Messages - search across all containers
    const allMessages = [];
    for (const [containerId, msgs] of Object.entries(state.messages)) {
      for (const msg of msgs) {
        if (msg.content && msg.content.toLowerCase().includes(trimmedQuery)) {
          allMessages.push({ ...msg, _containerId: containerId });
        }
      }
    }
    searchResults.messages = allMessages.sort((a, b) => (b.createdDateTime || '').localeCompare(a.createdDateTime || '')).slice(0, 4);

    // Files
    searchResults.files = state.files.filter(f =>
      f.name.toLowerCase().includes(trimmedQuery)
    ).slice(0, 4);
  }

  const hasResults = searchResults.people.length > 0 || searchResults.messages.length > 0 || searchResults.files.length > 0;

  function getContainerName(containerId) {
    const channel = state.channels.find(c => c.channelId === containerId);
    if (channel) {
      const team = state.teams.find(t => t.teamId === channel.teamId);
      return team ? `${team.displayName} > ${channel.displayName}` : channel.displayName;
    }
    const chat = state.chats.find(c => c.chatId === containerId);
    if (chat) {
      if (chat.topic) return chat.topic;
      const others = chat.participants.filter(p => p !== cu.userId);
      return others.map(p => {
        const u = state.users.find(u2 => u2.userId === p);
        return u ? u.firstName : p;
      }).join(', ');
    }
    return '';
  }

  function getSender(senderId) {
    return state.users.find(u => u.userId === senderId);
  }

  function handleSearchNavigate(type, item) {
    setSearchFocused(false);
    setSearchQuery('');
    if (type === 'person') {
      // Navigate to existing chat with this person, or just chat page
      const existingChat = state.chats.find(c =>
        c.chatType === 'oneOnOne' &&
        c.participants.includes(item.userId) &&
        c.participants.includes(cu.userId)
      );
      if (existingChat) {
        navigate(`/chat/${existingChat.chatId}${qStr}`);
      } else {
        navigate(`/chat${qStr}`);
      }
    } else if (type === 'message') {
      const channel = state.channels.find(c => c.channelId === item._containerId);
      if (channel) {
        navigate(`/teams/${channel.teamId}/channels/${channel.channelId}${qStr}`);
      } else {
        navigate(`/chat/${item._containerId}${qStr}`);
      }
    } else if (type === 'file') {
      navigate(`/files${qStr}`);
    }
  }

  return (
    <div className="top-header">
      <div className="nav-arrows">
        <button title="Back" onClick={() => window.history.back()}>&#8592;</button>
        <button title="Forward" onClick={() => window.history.forward()}>&#8594;</button>
      </div>
      <div className="search-bar" ref={searchRef}>
        <span className="search-icon">&#128269;</span>
        <input
          type="text"
          placeholder="Search (Ctrl+E)"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
        />
        {searchFocused && trimmedQuery.length > 0 && (
          <div className="search-dropdown">
            {hasResults ? (
              <>
                {searchResults.people.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-label">People</div>
                    {searchResults.people.map(user => (
                      <button key={user.userId} className="search-result-item" onClick={() => handleSearchNavigate('person', user)}>
                        <img src={user.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{user.displayName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user.jobTitle}</div>
                        </div>
                        <span className={`presence-dot ${user.presence}`} />
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.messages.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-label">Messages</div>
                    {searchResults.messages.map(msg => {
                      const sender = getSender(msg.senderId);
                      return (
                        <button key={msg.messageId} className="search-result-item" onClick={() => handleSearchNavigate('message', msg)}>
                          <span style={{ fontSize: 18, marginRight: 4 }}>&#128172;</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                              {sender?.displayName} in {getContainerName(msg._containerId)}
                            </div>
                            <div style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.content}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {searchResults.files.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-label">Files</div>
                    {searchResults.files.map(file => (
                      <button key={file.fileId} className="search-result-item" onClick={() => handleSearchNavigate('file', file)}>
                        <span style={{ fontSize: 18, marginRight: 4 }}>&#128196;</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{file.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{getContainerName(file.containerId)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No results found for "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>
      <div className="header-right">
        <button title="Settings" onClick={() => navigate(`/settings${qStr}`)}>&#9881;</button>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button className="user-avatar-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
            <img src={cu.avatar} alt={cu.displayName} />
            <span className={`presence-dot ${cu.presence}`} style={{ borderColor: '#fff' }} />
          </button>
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-header">
                <img className="user-menu-avatar" src={cu.avatar} alt={cu.displayName} />
                <div>
                  <div className="user-menu-name">{cu.displayName}</div>
                  <div className="user-menu-email">{cu.email}</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', padding: '4px 12px' }}>Set status</div>
                {presenceOptions.map(opt => (
                  <button key={opt.value} className="presence-option" onClick={() => { actions.updatePresence(opt.value); setShowUserMenu(false); }}>
                    <span className="presence-dot-inline" style={{ background: opt.color }} />
                    <span>{opt.label}</span>
                    {cu.presence === opt.value && <span style={{ marginLeft: 'auto', color: 'var(--brand-primary)' }}>&#10003;</span>}
                  </button>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 4 }}>
                <button className="presence-option" onClick={() => { navigate(`/settings${qStr}`); setShowUserMenu(false); }}>
                  &#9881; Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
