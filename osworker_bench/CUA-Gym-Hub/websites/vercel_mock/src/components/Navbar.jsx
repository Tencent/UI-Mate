import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, MessageSquare, LogOut, Settings, User, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

const VercelLogo = () => (
  <svg width="22" height="20" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="#000"/>
  </svg>
);

const NOTIFICATIONS = [
  { id: 'n1', type: 'deployment', text: 'my-nextjs-app deployed to production', path: '/project/prj_001/overview', time: '5m ago' },
  { id: 'n2', type: 'error', text: 'internal-tools deployment failed', path: '/project/prj_003/deployments/dpl_018', time: '3h ago' },
  { id: 'n3', type: 'domain', text: 'docs.acme.dev verified successfully', path: '/domains', time: '1d ago' },
];

export default function Navbar({ onSearchClick }) {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [showTeamMenu, setShowTeamMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [readNotifs, setReadNotifs] = useState(new Set());
  const teamRef = useRef(null);
  const userRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = NOTIFICATIONS.filter(n => !readNotifs.has(n.id)).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (teamRef.current && !teamRef.current.contains(e.target)) setShowTeamMenu(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Build breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  let breadcrumbs = null;
  if (pathParts[0] === 'project' && pathParts[1]) {
    const project = state.projects.find(p => p.id === pathParts[1]);
    if (project) {
      breadcrumbs = (
        <div className="navbar-breadcrumb">
          <span className="navbar-sep">/</span>
          <Link to={`/project/${project.id}/overview`}>
            <span className="navbar-breadcrumb-current">{project.name}</span>
          </Link>
        </div>
      );
    }
  }

  return (
    <nav className="navbar">
      {/* Left: Logo + Team + Breadcrumb */}
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <VercelLogo />
        </Link>
        <span className="navbar-sep">/</span>
        <div ref={teamRef} style={{ position: 'relative' }}>
          <button className="team-selector" onClick={() => setShowTeamMenu(s => !s)}>
            <div className="team-selector-avatar">
              {(state.currentTeam?.name || 'A')[0].toUpperCase()}
            </div>
            <span>{state.currentTeam?.name || 'Acme Inc'}</span>
            <ChevronDown size={14} color="#666" />
          </button>
          {showTeamMenu && (
            <div className="dropdown-menu" style={{ top: 'calc(100% + 4px)', left: 0, minWidth: 220 }}>
              <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--fg-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Teams
              </div>
              <button className="dropdown-item" style={{ fontWeight: 500 }} onClick={() => { setShowTeamMenu(false); navigate('/'); }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 20, height: 20, background: '#171717', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 600 }}>A</span>
                  Acme Inc
                </span>
              </button>
              <button className="dropdown-item" onClick={() => { setShowTeamMenu(false); navigate('/'); }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 20, height: 20, background: '#666', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}>P</span>
                  Personal Account
                </span>
              </button>
            </div>
          )}
        </div>
        {breadcrumbs}
      </div>

      {/* Center: Search */}
      <div className="navbar-center">
        <button className="navbar-search" onClick={onSearchClick}>
          <Search size={14} />
          <span>Search...</span>
          <kbd>Ctrl K</kbd>
        </button>
      </div>

      {/* Right: Feedback, Notifications, User */}
      <div className="navbar-right">
        <button
          className="btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setShowFeedback(true)}
        >
          <MessageSquare size={14} />
          Feedback
        </button>

        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="btn-icon" onClick={() => setShowNotifications(s => !s)} style={{ position: 'relative' }}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="user-menu" style={{ width: 320, right: 0 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
                  onClick={() => setReadNotifs(new Set(NOTIFICATIONS.map(n => n.id)))}
                >
                  Mark all read
                </button>
              </div>
              {NOTIFICATIONS.map(n => (
                <div
                  key={n.id}
                  style={{
                    padding: '10px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                    background: readNotifs.has(n.id) ? 'transparent' : 'rgba(0,112,243,0.03)',
                  }}
                  onClick={() => {
                    setReadNotifs(prev => new Set([...prev, n.id]));
                    setShowNotifications(false);
                    navigate(n.path);
                  }}
                >
                  <div style={{ fontSize: 13, color: 'var(--fg)', marginBottom: 2 }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{n.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div ref={userRef} style={{ position: 'relative' }}>
          <button className="avatar-btn" onClick={() => setShowUserMenu(s => !s)}>
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${state.currentUser?.name || 'AJ'}&backgroundColor=171717&textColor=ffffff`}
              alt={state.currentUser?.name}
            />
          </button>
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-header">
                <div style={{ fontSize: 14, fontWeight: 500 }}>{state.currentUser?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{state.currentUser?.email}</div>
              </div>
              <button className="user-menu-item" onClick={() => { setShowUserMenu(false); navigate('/'); }}>
                <User size={14} /> Dashboard
              </button>
              <button className="user-menu-item" onClick={() => {
                setUserStatus('Account settings are available locally in this sandbox.');
                setShowUserMenu(false);
              }}>
                <Settings size={14} /> Settings
              </button>
              <button className="user-menu-item" onClick={() => {
                dispatch({ type: 'SET_UI', payload: { theme: state.ui?.theme === 'dark' ? 'light' : 'dark' } });
                setUserStatus('Theme preference saved locally.');
                setShowUserMenu(false);
              }}>
                <Moon size={14} /> Theme
              </button>
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <button className="user-menu-item" onClick={() => {
                  setUserStatus('Signed out locally. No external session was changed.');
                  setShowUserMenu(false);
                }}>
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {userStatus && (
        <div className="toast" style={{ position: 'fixed', top: 64, right: 24, zIndex: 3000 }}>
          {userStatus}
          <button className="btn-icon" aria-label="Dismiss status" onClick={() => setUserStatus('')} style={{ marginLeft: 8 }}>×</button>
        </div>
      )}
      {showFeedback && (
        <div className="modal-overlay" onClick={() => setShowFeedback(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Send Feedback</h3>
            <p className="modal-desc">Feedback is saved as a local activity event in this sandbox.</p>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Describe what happened..."
              style={{ width: '100%', minHeight: 100, marginBottom: 16 }}
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowFeedback(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={!feedbackText.trim()}
                onClick={() => {
                  dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: {
                    type: 'feedback.created',
                    description: `Submitted feedback: ${feedbackText.trim()}`,
                    userId: state.currentUser?.id,
                    userName: state.currentUser?.name,
                    userAvatar: state.currentUser?.avatar,
                    projectId: null,
                    projectName: null,
                    metadata: { feedback: feedbackText.trim() },
                  }});
                  setFeedbackText('');
                  setShowFeedback(false);
                  setUserStatus('Feedback saved locally.');
                }}
                style={{ opacity: feedbackText.trim() ? 1 : 0.5 }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
