
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';
import './Sidebar.css';

// SVG icons matching Xlack's clean style
const UnreadsIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
    <path d="M4.5 2A2.5 2.5 0 0 0 2 4.5v8A2.5 2.5 0 0 0 4.5 15H6v3l4-3h5.5a2.5 2.5 0 0 0 2.5-2.5v-8A2.5 2.5 0 0 0 15.5 2h-11zm0 1.5h11a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9.7L7.5 15.2V13.5H4.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM6 7a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm4 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm4 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"/>
  </svg>
);

const ThreadsIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
    <path d="M7.5 2a5.5 5.5 0 0 0-4.926 7.986L2 12.5l2.514-.574A5.5 5.5 0 1 0 7.5 2zm0 1.5a4 4 0 1 1-2.292 7.276l-.278-.192-1.43.327.327-1.43-.192-.278A4 4 0 0 1 7.5 3.5z"/>
    <path d="M12.5 5a5.5 5.5 0 0 1 4.926 7.986L18 15.5l-2.514-.574A5.5 5.5 0 0 1 12.5 16c-.57 0-1.12-.087-1.637-.249a6.96 6.96 0 0 0 1.082-1.295 4 4 0 1 0 2.843-6.77A6.965 6.965 0 0 0 12.5 5z"/>
  </svg>
);

const AllDMsIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
    <path d="M17 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3v3l4-3h7a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-.5 9.5H9.7L7.5 14.2V12.5H3.5v-8h13v8z"/>
  </svg>
);

const MentionsIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
    <path d="M10 2a8 8 0 1 0 3.293 15.293l-.707-.707A7 7 0 1 1 17 10c0 1.38-.56 2.5-1.25 2.5S14.5 11.38 14.5 10V6.5h-1.25v.63A3.5 3.5 0 1 0 13.5 11c.37.93 1.12 1.5 2 1.5C16.88 12.5 18 11.38 18 10a8 8 0 0 0-8-8zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 1.25a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5z"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
    <path d="M13.22 14.63a8 8 0 1 1 1.41-1.41l4.29 4.29a1 1 0 1 1-1.41 1.41l-4.29-4.29zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
    <path d="M8 1a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zm2.5 6h-5V5a2.5 2.5 0 0 1 5 0v2z"/>
  </svg>
);

function Sidebar() {
  const { state, joinChannel, signOut, showToast, sendInvitation, createChannel } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showChannelBrowser, setShowChannelBrowser] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showInviteTeammates, setShowInviteTeammates] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [isPrivateChannel, setIsPrivateChannel] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Collapsible sections state
  const [starredCollapsed, setStarredCollapsed] = useState(false);
  const [channelsCollapsed, setChannelsCollapsed] = useState(false);
  const [dmsCollapsed, setDmsCollapsed] = useState(false);

  if (!state || !state.channels || !state.currentUser) {
    return <div className="sidebar">Loading...</div>;
  }

  const starredChannels = state.channels.filter(ch => ch.isStarred && ch.members.includes(state.currentUser.userId));
  const publicChannels = state.channels.filter(ch => !ch.isPrivate && !ch.isStarred && ch.members.includes(state.currentUser.userId));
  const privateChannels = state.channels.filter(ch => ch.isPrivate && ch.members.includes(state.currentUser.userId));

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#2BAC76';
      case 'away': return '#E8912D';
      case 'busy': return '#E01E5A';
      default: return 'transparent';
    }
  };

  const getStatusBorder = (status) => {
    if (status === 'offline') return '2px solid #BCABBC';
    return 'none';
  };

  const isActive = (path) => location.pathname === path;
  const go = (path) => withCurrentSearch(path, location.search);

  const getChannelUnread = (channelId) => {
    const ch = state.channels.find(c => c.channelId === channelId);
    return ch?.unreadCount || 0;
  };

  return (
    <div className="sidebar">
      <div className="workspace-header" onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}>
        <div className="workspace-info">
          <img src={state.workspace.icon} alt="Workspace" className="workspace-icon" />
          <span className="workspace-name">{state.workspace.workspaceName}</span>
        </div>
        <span className="dropdown-arrow">&#9662;</span>
      </div>

      {showWorkspaceMenu && (
        <div className="workspace-menu">
          <div className="menu-item" onClick={() => {
            setShowWorkspaceMenu(false);
            navigate(go('/profile'));
          }}>Preferences</div>
          <div className="menu-item" onClick={() => {
            setShowWorkspaceMenu(false);
            signOut();
          }}>Sign out</div>
        </div>
      )}

      <div className="sidebar-content">
        <div className="nav-section">
          <Link to={go('/unreads')} className={`nav-item ${isActive('/unreads') ? 'active' : ''}`}>
            <span className="nav-icon"><UnreadsIcon /></span>
            <span>All unreads</span>
            {(() => {
              const totalUnread = (state.channels || []).reduce((sum, ch) => sum + (ch.unreadCount || 0), 0)
                + (state.dms || []).reduce((sum, dm) => sum + (dm.unreadCount || 0), 0);
              return totalUnread > 0 ? <span className="nav-badge">{totalUnread}</span> : null;
            })()}
          </Link>
          <Link to={go('/threads')} className={`nav-item ${isActive('/threads') ? 'active' : ''}`}>
            <span className="nav-icon"><ThreadsIcon /></span>
            <span>Threads</span>
          </Link>
          <Link to={go('/all-dms')} className={`nav-item ${isActive('/all-dms') ? 'active' : ''}`}>
            <span className="nav-icon"><AllDMsIcon /></span>
            <span>All DMs</span>
          </Link>
          <Link to={go('/mentions')} className={`nav-item ${isActive('/mentions') ? 'active' : ''}`}>
            <span className="nav-icon"><MentionsIcon /></span>
            <span>Mentions & reactions</span>
          </Link>
          <Link to={go('/search')} className={`nav-item ${isActive('/search') ? 'active' : ''}`}>
            <span className="nav-icon"><SearchIcon /></span>
            <span>Search</span>
          </Link>
        </div>

        <div className="channels-section">
          {starredChannels.length > 0 && (
            <>
              <div className="section-header" onClick={() => setStarredCollapsed(!starredCollapsed)}>
                <div className="section-header-left">
                  <span className={`section-toggle ${starredCollapsed ? 'collapsed' : ''}`}>&#9662;</span>
                  <span className="section-label">Starred</span>
                </div>
              </div>
              {!starredCollapsed && starredChannels.map(channel => {
                const unread = getChannelUnread(channel.channelId);
                return (
                  <Link
                    key={channel.channelId}
                    to={go(`/channel/${channel.channelId}`)}
                    className={`channel-item ${isActive(`/channel/${channel.channelId}`) ? 'active' : ''} ${unread > 0 ? 'has-unread' : ''}`}
                  >
                    <span className="channel-icon">{channel.isPrivate ? <LockIcon /> : '#'}</span>
                    <span className="channel-name">{channel.name}</span>
                    {unread > 0 && <span className="channel-badge">{unread}</span>}
                  </Link>
                );
              })}
            </>
          )}

          <div className="section-header" onClick={() => setChannelsCollapsed(!channelsCollapsed)}>
            <div className="section-header-left">
              <span className={`section-toggle ${channelsCollapsed ? 'collapsed' : ''}`}>&#9662;</span>
              <span className="section-label">Channels</span>
            </div>
            <button className="section-add-btn" onClick={(e) => { e.stopPropagation(); setShowCreateChannel(true); }} title="Create channel">+</button>
          </div>
          {!channelsCollapsed && (
            <>
              {publicChannels.map(channel => {
                const unread = getChannelUnread(channel.channelId);
                return (
                  <Link
                    key={channel.channelId}
                    to={go(`/channel/${channel.channelId}`)}
                    className={`channel-item ${isActive(`/channel/${channel.channelId}`) ? 'active' : ''} ${unread > 0 ? 'has-unread' : ''}`}
                  >
                    <span className="channel-icon">#</span>
                    <span className="channel-name">{channel.name}</span>
                    {unread > 0 && <span className="channel-badge">{unread}</span>}
                  </Link>
                );
              })}
              {privateChannels.map(channel => {
                const unread = getChannelUnread(channel.channelId);
                return (
                  <Link
                    key={channel.channelId}
                    to={go(`/channel/${channel.channelId}`)}
                    className={`channel-item ${isActive(`/channel/${channel.channelId}`) ? 'active' : ''} ${unread > 0 ? 'has-unread' : ''}`}
                  >
                    <span className="channel-icon"><LockIcon /></span>
                    <span className="channel-name">{channel.name}</span>
                    {unread > 0 && <span className="channel-badge">{unread}</span>}
                  </Link>
                );
              })}
              <button className="add-channel-btn" onClick={() => setShowChannelBrowser(true)}>
                <span>+</span> Browse channels
              </button>
            </>
          )}
        </div>

        <div className="dms-section">
          <div className="section-header" onClick={() => setDmsCollapsed(!dmsCollapsed)}>
            <div className="section-header-left">
              <span className={`section-toggle ${dmsCollapsed ? 'collapsed' : ''}`}>&#9662;</span>
              <span className="section-label">Direct messages</span>
            </div>
            <button className="section-add-btn" onClick={(e) => { e.stopPropagation(); setShowInviteTeammates(true); }} title="Open a direct message">+</button>
          </div>
          {!dmsCollapsed && (
            <>
              {state.dms.map(dm => {
                const otherUserId = dm.participants.find(id => id !== state.currentUser.userId);
                const otherUser = state.users.find(u => u.userId === otherUserId);
                if (!otherUser) return null;
                return (
                  <Link
                    key={dm.dmId}
                    to={go(`/dm/${dm.dmId}`)}
                    className={`dm-item ${isActive(`/dm/${dm.dmId}`) ? 'active' : ''} ${dm.unreadCount > 0 ? 'has-unread' : ''}`}
                  >
                    <div className="dm-avatar-container">
                      <img src={otherUser.avatar} alt={otherUser.displayName} className="dm-avatar" />
                      <span
                        className="status-dot"
                        style={{
                          backgroundColor: getStatusColor(otherUser.status),
                          border: getStatusBorder(otherUser.status)
                        }}
                      />
                    </div>
                    <span className="channel-name">
                      {otherUser.displayName}
                      {otherUser.statusEmoji && <span className="dm-status-emoji">{otherUser.statusEmoji}</span>}
                    </span>
                    {dm.unreadCount > 0 && <span className="unread-badge">{dm.unreadCount}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </div>

      <div className="user-profile" onClick={() => navigate(go('/profile'))}>
        <div className="user-avatar-container">
          <img src={state.currentUser.avatar} alt={state.currentUser.displayName} className="user-avatar" />
          <span
            className="status-dot"
            style={{
              backgroundColor: getStatusColor(state.currentUser.status),
              border: getStatusBorder(state.currentUser.status)
            }}
          />
        </div>
        <div className="user-info">
          <div className="user-name">{state.currentUser.displayName}</div>
          {state.currentUser.statusMessage && (
            <div className="user-status">
              {state.currentUser.statusEmoji && <span>{state.currentUser.statusEmoji} </span>}
              {state.currentUser.statusMessage}
            </div>
          )}
        </div>
      </div>

      {showChannelBrowser && (
        <div className="modal-overlay" onClick={() => setShowChannelBrowser(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Browse Channels</h2>
              <button onClick={() => setShowChannelBrowser(false)}>&#10005;</button>
            </div>
            <div className="modal-body">
              {state.channels.filter(ch => !ch.members.includes(state.currentUser.userId)).map(channel => (
                <div key={channel.channelId} className="channel-browser-item">
                  <div>
                    <div className="channel-browser-name">
                      {channel.isPrivate ? <LockIcon /> : '#'} {channel.name}
                    </div>
                    <div className="channel-browser-desc">{channel.description}</div>
                  </div>
                  <button
                    className="join-btn"
                    onClick={() => {
                      joinChannel(channel.channelId);
                      setShowChannelBrowser(false);
                      navigate(go(`/channel/${channel.channelId}`));
                    }}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCreateChannel && (
        <div className="modal-overlay" onClick={() => setShowCreateChannel(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create a Channel</h2>
              <button onClick={() => setShowCreateChannel(false)}>&#10005;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (newChannelName.trim()) {
                  const channelId = createChannel(newChannelName.trim(), newChannelDesc.trim(), isPrivateChannel);
                  setShowCreateChannel(false);
                  setNewChannelName('');
                  setNewChannelDesc('');
                  setIsPrivateChannel(false);
                  if (channelId) {
                    navigate(go(`/channel/${channelId}`));
                  }
                }
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '15px', color: '#1D1C1D' }}>
                    Channel Name *
                  </label>
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="e.g. marketing"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #BBBBBB',
                      fontSize: '15px'
                    }}
                    autoFocus
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '15px', color: '#1D1C1D' }}>
                    Description (optional)
                  </label>
                  <textarea
                    value={newChannelDesc}
                    onChange={(e) => setNewChannelDesc(e.target.value)}
                    placeholder="What's this channel about?"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #BBBBBB',
                      fontSize: '15px',
                      minHeight: '60px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isPrivateChannel}
                      onChange={(e) => setIsPrivateChannel(e.target.checked)}
                    />
                    <span style={{ fontSize: '15px' }}>Make private</span>
                  </label>
                  <div style={{ fontSize: '13px', color: '#616061', marginTop: '4px', marginLeft: '24px' }}>
                    {isPrivateChannel ? 'Only invited members can see this channel' : 'Anyone in the workspace can join'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 20px',
                      background: '#007A5A',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '15px'
                    }}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateChannel(false)}
                    style={{
                      padding: '8px 20px',
                      background: '#FFFFFF',
                      color: '#1D1C1D',
                      border: '1px solid #BBBBBB',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '15px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showInviteTeammates && (
        <div className="modal-overlay" onClick={() => setShowInviteTeammates(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invite Teammates</h2>
              <button onClick={() => setShowInviteTeammates(false)}>&#10005;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (inviteEmail.trim()) {
                  sendInvitation(inviteEmail.trim());
                  setInviteEmail('');
                  setShowInviteTeammates(false);
                }
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '15px', color: '#1D1C1D' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #BBBBBB',
                      fontSize: '15px'
                    }}
                    autoFocus
                  />
                  <div style={{ fontSize: '13px', color: '#616061', marginTop: '8px' }}>
                    We'll send them an email invitation to join {state.workspace.workspaceName}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 20px',
                      background: '#007A5A',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '15px'
                    }}
                  >
                    Send Invitation
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteTeammates(false)}
                    style={{
                      padding: '8px 20px',
                      background: '#FFFFFF',
                      color: '#1D1C1D',
                      border: '1px solid #BBBBBB',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '15px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
