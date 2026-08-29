import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Bell, Search, X, Check, Clock, XCircle, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function SearchModal({ onClose, projects, runs }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const q = query.toLowerCase().trim();

  const matchedProjects = q
    ? projects.filter(p =>
        p.displayName.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    : [];

  const matchedRuns = q
    ? runs.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.runId?.toLowerCase().includes(q)
      ).slice(0, 6)
    : [];

  const hasResults = matchedProjects.length > 0 || matchedRuns.length > 0;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ alignItems: 'flex-start', paddingTop: 80 }}
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 560, width: '100%', padding: 0, overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--border-color)' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search projects, runs..."
            style={{ flex: 1, border: 'none', background: 'none', fontSize: 14, outline: 'none', color: 'var(--text-primary)' }}
          />
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        {q && !hasResults && (
          <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No results for "{query}"
          </div>
        )}

        {matchedProjects.length > 0 && (
          <div>
            <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Projects</div>
            {matchedProjects.map(p => (
              <button
                key={p.id}
                onClick={() => { navigate(`/${p.entity}/${p.name}/workspace`); onClose(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 16px', textAlign: 'left', cursor: 'pointer', background: 'none' }}
                className="search-result-item"
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1a1c1f', flexShrink: 0 }}>
                  {p.displayName[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{p.displayName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.entity}/{p.name}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {matchedRuns.length > 0 && (
          <div>
            <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Runs</div>
            {matchedRuns.map(r => {
              const proj = projects.find(p => p.id === r.projectId);
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    if (proj) navigate(`/${proj.entity}/${proj.name}/runs/${r.id}/overview`);
                    onClose();
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 16px', textAlign: 'left', cursor: 'pointer', background: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{proj ? `${proj.entity}/${proj.name}` : ''} &middot; {r.state}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!q && (
          <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
            Type to search projects and runs
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-color)', padding: '6px 14px', display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
          <span><kbd style={{ background: 'var(--bg-active)', border: '1px solid var(--border-color)', borderRadius: 3, padding: '1px 5px', fontFamily: 'var(--font-sans)' }}>Esc</kbd> to close</span>
          <span><kbd style={{ background: 'var(--bg-active)', border: '1px solid var(--border-color)', borderRadius: 3, padding: '1px 5px', fontFamily: 'var(--font-sans)' }}>Enter</kbd> to open</span>
        </div>
      </div>
    </div>
  );
}

function CreateTeamModal({ onClose, currentUser }) {
  const [teamName, setTeamName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCreate = () => {
    if (!teamName.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <span className="modal-title">Create Team</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        {submitted ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <Check size={32} color="var(--success-green)" style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Team "{teamName}" created!</div>
            <div className="text-muted text-small">Redirecting you to your new team workspace...</div>
          </div>
        ) : (
          <>
            <p className="text-muted text-small" style={{ marginBottom: 16 }}>
              Teams allow you to share experiments and collaborate with others.
            </p>
            <div className="form-group">
              <label className="form-label">Team Name</label>
              <input
                className="form-input"
                placeholder="my-team"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Team URL: wandb.ai/<strong>{teamName || 'team-name'}</strong>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Owner</label>
              <input
                className="form-input"
                value={currentUser.name}
                readOnly
                style={{ width: '100%', opacity: 0.7 }}
              />
            </div>
            <div className="flex gap-2" style={{ marginTop: 16 }}>
              <button className="btn-blue" onClick={handleCreate} disabled={!teamName.trim()}>
                <Users size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Create Team
              </button>
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NotificationDropdown({ notifications, dispatch, onClose }) {
  const unread = notifications.filter(n => !n.read);

  const getIcon = (type) => {
    if (type === 'run_finished') return <Check size={14} color="var(--success-green)" />;
    if (type === 'run_crashed') return <XCircle size={14} color="var(--error-red)" />;
    return <Clock size={14} color="var(--warning-amber)" />;
  };

  const getLabel = (type) => {
    if (type === 'run_finished') return 'Run finished';
    if (type === 'run_crashed') return 'Run crashed';
    return 'Notification';
  };

  return (
    <div
      className="dropdown-panel"
      style={{ position: 'absolute', top: '100%', right: 0, zIndex: 300, marginTop: 4, minWidth: 300, maxWidth: 360 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="dropdown-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>Notifications {unread.length > 0 && `(${unread.length} unread)`}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {unread.length > 0 && (
            <button
              style={{ fontSize: 11, color: 'var(--accent-blue)', cursor: 'pointer', background: 'none', border: 'none', padding: '2px 6px' }}
              onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No notifications
        </div>
      ) : (
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 14px',
                cursor: 'pointer',
                background: n.read ? 'none' : 'rgba(131,179,247,0.06)',
                borderBottom: '1px solid var(--border-color)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = n.read ? 'none' : 'rgba(131,179,247,0.06)'}
            >
              <div style={{ marginTop: 2, flexShrink: 0 }}>{getIcon(n.type)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: 'var(--text-primary)' }}>
                  {getLabel(n.type)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.runName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {timeAgo(n.timestamp)}
                </div>
              </div>
              {!n.read && (
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-blue)', flexShrink: 0, marginTop: 5 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserProfileDropdown({ currentUser, onClose }) {
  const navigate = useNavigate();
  const initials = currentUser.name.split(' ').map(w => w[0]).join('');

  return (
    <div
      className="dropdown-panel"
      style={{ position: 'absolute', top: '100%', right: 0, zIndex: 300, marginTop: 4, minWidth: 220 }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="user-avatar" style={{ cursor: 'default' }}>{initials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{currentUser.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{currentUser.email}</div>
          </div>
        </div>
      </div>
      <div>
        <button
          className="dropdown-item"
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
          onClick={() => { navigate('/'); onClose(); }}
        >
          Your projects
        </button>
        <button
          className="dropdown-item"
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
          onClick={() => { navigate('/settings/profile'); onClose(); }}
        >
          Profile settings
        </button>
        <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
        <button
          className="dropdown-item"
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)' }}
          onClick={() => { onClose(); }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function TopBar() {
  const { state, dispatch } = useApp();
  const { entity, project } = useParams();
  const navigate = useNavigate();
  const { currentUser, notifications, projects, runs } = state;
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
  const initials = currentUser.name.split(' ').map(w => w[0]).join('');

  const [showSearch, setShowSearch] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifBtnRef = useRef(null);
  const userAvatarRef = useRef(null);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!showNotifications && !showUserMenu) return;
    const handler = (e) => {
      if (notifBtnRef.current && !notifBtnRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userAvatarRef.current && !userAvatarRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications, showUserMenu]);

  return (
    <>
      <div className="topbar">
        <div className="topbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="8" fill="#FFBE00"/>
            <circle cx="20" cy="38" r="4" fill="#1a1c1f"/>
            <circle cx="32" cy="24" r="4" fill="#1a1c1f"/>
            <circle cx="44" cy="32" r="4" fill="#1a1c1f"/>
            <line x1="20" y1="38" x2="20" y2="50" stroke="#1a1c1f" strokeWidth="3" strokeLinecap="round"/>
            <line x1="32" y1="24" x2="32" y2="50" stroke="#1a1c1f" strokeWidth="3" strokeLinecap="round"/>
            <line x1="44" y1="32" x2="44" y2="50" stroke="#1a1c1f" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span>W&B</span>
        </div>

        {entity && (
          <div className="topbar-breadcrumb">
            <Link to="/">{entity}</Link>
            {project && (
              <>
                <span className="separator">/</span>
                <Link to={`/${entity}/${project}/workspace`}>{project}</Link>
              </>
            )}
          </div>
        )}

        <div className="topbar-spacer" />

        <button className="topbar-search" onClick={() => setShowSearch(true)}>
          <Search size={14} />
          <span>Search or jump to...</span>
          <kbd>⌘K</kbd>
        </button>

        <div className="topbar-actions">
          <button className="btn-create-team" onClick={() => setShowCreateTeam(true)}>Create Team</button>

          <div ref={notifBtnRef} style={{ position: 'relative' }}>
            <button
              className="topbar-icon-btn"
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="notification-badge" />}
            </button>
            {showNotifications && (
              <NotificationDropdown
                notifications={notifications || []}
                dispatch={dispatch}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          <div ref={userAvatarRef} style={{ position: 'relative' }}>
            <div
              className="user-avatar"
              title={currentUser.name}
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            >
              {initials}
            </div>
            {showUserMenu && (
              <UserProfileDropdown
                currentUser={currentUser}
                onClose={() => setShowUserMenu(false)}
              />
            )}
          </div>
        </div>
      </div>

      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
          projects={projects || []}
          runs={runs || []}
        />
      )}

      {showCreateTeam && (
        <CreateTeamModal
          onClose={() => setShowCreateTeam(false)}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
