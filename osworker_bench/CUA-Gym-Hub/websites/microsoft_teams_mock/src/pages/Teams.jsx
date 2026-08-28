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

export default function TeamsPage() {
  const { teamId: paramTeamId, channelId: paramChannelId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, actions, updateState } = useApp();
  const [expandedTeams, setExpandedTeams] = useState(() => {
    const m = {};
    state.teams.forEach(t => { m[t.teamId] = true; });
    return m;
  });
  const [activeTab, setActiveTab] = useState('posts');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [activeThread, setActiveThread] = useState(null);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [infoTab, setInfoTab] = useState('about');
  const [statusMessage, setStatusMessage] = useState('');

  const query = searchParams.toString();
  const qStr = query ? `?${query}` : '';

  const activeTeamId = paramTeamId || (state.teams.length > 0 ? state.teams[0].teamId : null);
  const activeTeam = state.teams.find(t => t.teamId === activeTeamId);
  const teamChannels = state.channels.filter(c => c.teamId === activeTeamId);
  const activeChannelId = paramChannelId || (teamChannels.length > 0 ? teamChannels[0].channelId : null);
  const activeChannel = state.channels.find(c => c.channelId === activeChannelId);
  const activeMessages = activeChannelId ? (state.messages[activeChannelId] || []) : [];

  function toggleTeam(teamId) {
    setExpandedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));
  }

  function handleSelectChannel(teamId, channelId) {
    actions.markAsRead(channelId);
    setActiveTab('posts');
    setActiveThread(null);
    navigate(`/teams/${teamId}/channels/${channelId}${qStr}`);
  }

  function handleSendMessage(content) {
    if (!activeChannelId) return;
    actions.sendMessage(activeChannelId, content);
  }

  function handleSendReply(content) {
    if (!activeChannelId || !activeThread) return;
    actions.sendReply(activeChannelId, activeThread, content);
  }

  function handleCreateChannel(e) {
    e.preventDefault();
    if (!newChannelName.trim() || !activeTeamId) return;
    actions.createChannel(activeTeamId, newChannelName.trim(), newChannelDesc.trim());
    setNewChannelName('');
    setNewChannelDesc('');
    setShowCreateChannel(false);
  }

  function handleCreateTeam(e) {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    actions.createTeam(newTeamName.trim(), newTeamDesc.trim(), 'private', []);
    setNewTeamName('');
    setNewTeamDesc('');
    setShowCreateTeam(false);
  }

  function handleOpenThread(msgId) {
    setActiveThread(msgId);
  }

  function showStatus(message) {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 2000);
  }

  // Thread panel messages
  const threadMessages = activeThread ? activeMessages.filter(m => m.messageId === activeThread || m.replyToId === activeThread) : [];

  return (
    <>
      <div className="secondary-sidebar">
        <div className="sidebar-header">
          <h2>Teams</h2>
          <div className="sidebar-header-actions">
            <button title="Create team" aria-label="Create team" onClick={() => setShowCreateTeam(true)}>&#43;</button>
          </div>
        </div>
        <div className="sidebar-list">
          {state.teams.map(team => {
            const tChannels = state.channels.filter(c => c.teamId === team.teamId);
            const isExpanded = expandedTeams[team.teamId];
            return (
              <div key={team.teamId} className="team-section">
                <button className="team-item" onClick={() => toggleTeam(team.teamId)}>
                  <span className="chevron">{isExpanded ? '\u25BC' : '\u25B6'}</span>
                  <div className="team-avatar" style={{ background: team.avatarColor }}>{team.avatarInitials}</div>
                  <span className="team-name">{team.displayName}</span>
                </button>
                {isExpanded && (
                  <div className="channel-list">
                    {tChannels.map(ch => {
                      const isActive = ch.channelId === activeChannelId;
                      return (
                        <button key={ch.channelId} className={`channel-item ${isActive ? 'active' : ''}`} onClick={() => handleSelectChannel(team.teamId, ch.channelId)}>
                          <span className="channel-hash">#</span>
                          <span className="channel-name">{ch.displayName}</span>
                          {ch.membershipType === 'private' && <span className="channel-lock">&#128274;</span>}
                          {ch.unreadCount > 0 && <span className="channel-badge">{ch.unreadCount}</span>}
                        </button>
                      );
                    })}
                    <button className="channel-item add-channel" onClick={() => setShowCreateChannel(true)}>
                      <span className="channel-hash">+</span>
                      <span className="channel-name">Add a channel</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="main-content">
        {activeChannel ? (
          <>
            <div className="content-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="team-avatar" style={{ background: activeTeam?.avatarColor || '#6264A7', width: 28, height: 28, fontSize: 11 }}>{activeTeam?.avatarInitials}</div>
                <span className="content-header-title">{activeChannel.displayName}</span>
                {activeChannel.membershipType === 'private' && <span style={{ fontSize: 12 }}>&#128274;</span>}
              </div>
              <div className="content-header-actions">
                <button title="Video call">&#127909;</button>
                <button title="Audio call">&#128222;</button>
                <button title="Channel info" onClick={() => setShowChannelInfo(!showChannelInfo)} style={{ color: showChannelInfo ? 'var(--brand-primary)' : undefined }}>&#9432;</button>
                <button title="More">&#8943;</button>
              </div>
            </div>
            <div className="tab-bar">
              <button className={`tab-item ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Posts</button>
              <button className={`tab-item ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>Files</button>
              <button className={`tab-item ${activeTab === 'wiki' ? 'active' : ''}`} onClick={() => setActiveTab('wiki')}>Wiki</button>
              <button className="tab-item tab-add" onClick={() => showStatus('Add tab opens a local tab picker in this sandbox.')} title="Add a tab" aria-label="Add tab">+</button>
            </div>
            {statusMessage && <div role="status" className="inline-status" style={{ margin: '8px 16px 0' }}>{statusMessage}</div>}
            {activeTab === 'posts' && (
              <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <MessageList containerId={activeChannelId} messages={activeMessages} onOpenThread={handleOpenThread} />
                  <MessageComposer onSend={handleSendMessage} placeholder={`Message # ${activeChannel.displayName}`} teamMembers={activeTeam ? state.users.filter(u => activeTeam.members.includes(u.userId)) : null} />
                </div>
                {activeThread && (
                  <div className="thread-panel">
                    <div className="thread-panel-header">
                      <span>Thread</span>
                      <button onClick={() => setActiveThread(null)} title="Close">&times;</button>
                    </div>
                    <MessageList containerId={activeChannelId} messages={threadMessages} />
                    <MessageComposer onSend={handleSendReply} placeholder="Reply..." />
                  </div>
                )}
              </div>
            )}
            {activeTab === 'files' && (
              <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                <table className="files-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Modified</th>
                      <th>Modified By</th>
                      <th>Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.files.filter(f => f.containerId === activeChannelId).map(file => {
                      const modifier = state.users.find(u => u.userId === file.lastModifiedBy);
                      return (
                        <tr key={file.fileId}>
                          <td>
                            <span style={{ marginRight: 8 }}>&#128196;</span>
                            {file.name}
                          </td>
                          <td>{formatTimestamp(file.lastModifiedDateTime)}</td>
                          <td>{modifier ? modifier.displayName : 'Unknown'}</td>
                          <td>{file.size < 1024 ? file.size + ' B' : file.size < 1024 * 1024 ? (file.size / 1024).toFixed(1) + ' KB' : (file.size / (1024 * 1024)).toFixed(1) + ' MB'}</td>
                        </tr>
                      );
                    })}
                    {state.files.filter(f => f.containerId === activeChannelId).length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32 }}>No files shared in this channel yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'wiki' && (
              <div className="empty-state">
                <div className="empty-state-icon">&#128214;</div>
                <div className="empty-state-title">Wiki is empty</div>
                <div className="empty-state-text">Start adding content to the wiki to share knowledge with your team.</div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">&#128101;</div>
            <div className="empty-state-title">Select a channel</div>
            <div className="empty-state-text">Choose a team and channel from the sidebar to start collaborating.</div>
          </div>
        )}
      </div>

      {/* Channel Info Panel */}
      {showChannelInfo && activeChannel && (
        <div className="info-panel">
          <div className="info-panel-header">
            <span>{activeChannel.displayName}</span>
            <button onClick={() => setShowChannelInfo(false)} title="Close">&times;</button>
          </div>
          <div className="tab-bar" style={{ paddingLeft: 16 }}>
            <button className={`tab-item ${infoTab === 'about' ? 'active' : ''}`} onClick={() => setInfoTab('about')}>About</button>
            <button className={`tab-item ${infoTab === 'members' ? 'active' : ''}`} onClick={() => setInfoTab('members')}>Members</button>
          </div>
          <div className="info-panel-body">
            {infoTab === 'about' && (
              <div>
                {activeChannel.description && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Description</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{activeChannel.description}</div>
                  </div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Type</div>
                  <div style={{ fontSize: 13 }}>{activeChannel.membershipType === 'private' ? 'Private channel' : 'Standard channel'}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Team</div>
                  <div style={{ fontSize: 13 }}>{activeTeam?.displayName}</div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button className="info-panel-action" onClick={() => {
                    const link = `${window.location.origin}/teams/${activeTeamId}/channels/${activeChannelId}${qStr}`;
                    try {
                      const copyResult = navigator.clipboard?.writeText(link);
                      if (copyResult?.catch) copyResult.catch(() => {});
                    } catch(e) {}
                    showStatus('Channel link copied');
                  }}>&#128279; Get link to channel</button>
                  <button className="info-panel-action" onClick={() => {
                    const muted = activeChannel.isMuted;
                    updateState(prev => ({ ...prev, channels: prev.channels.map(c => c.channelId === activeChannelId ? { ...c, isMuted: !muted } : c) }));
                  }}>&#128276; Channel notifications {activeChannel.isMuted ? '(Unmute)' : '(Mute)'}</button>
                  <button className="info-panel-action" onClick={() => setShowChannelInfo(false)}>&#128065; Close info</button>
                </div>
              </div>
            )}
            {infoTab === 'members' && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {activeChannel.members?.length || activeTeam?.members?.length || 0} members
                </div>
                {(activeTeam?.members || []).map(memberId => {
                  const user = state.users.find(u => u.userId === memberId);
                  if (!user) return null;
                  const isOwner = activeTeam?.owners?.includes(memberId);
                  return (
                    <div key={memberId} className="info-panel-member">
                      <img src={user.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{user.displayName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user.jobTitle}</div>
                      </div>
                      {isOwner && <span style={{ fontSize: 10, color: 'var(--brand-primary)', background: 'var(--selected-bg)', padding: '2px 6px', borderRadius: 8 }}>Owner</span>}
                      <span className={`presence-dot ${user.presence}`} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="modal-overlay" onClick={() => setShowCreateChannel(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create a channel</h3>
              <button className="modal-close" onClick={() => setShowCreateChannel(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateChannel} className="modal-body">
              <div className="form-field">
                <label>Channel name</label>
                <input type="text" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="Enter channel name" autoFocus required />
              </div>
              <div className="form-field">
                <label>Description (optional)</label>
                <input type="text" value={newChannelDesc} onChange={e => setNewChannelDesc(e.target.value)} placeholder="Describe the channel" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateChannel(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="modal-overlay" onClick={() => setShowCreateTeam(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create a team</h3>
              <button className="modal-close" onClick={() => setShowCreateTeam(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateTeam} className="modal-body">
              <div className="form-field">
                <label>Team name</label>
                <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Enter team name" autoFocus required />
              </div>
              <div className="form-field">
                <label>Description (optional)</label>
                <input type="text" value={newTeamDesc} onChange={e => setNewTeamDesc(e.target.value)} placeholder="Describe the team" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateTeam(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
