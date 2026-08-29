import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Puzzle, Activity, Globe, BarChart2, Settings,
  ChevronLeft, ChevronRight, HelpCircle, ChevronDown, Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'deployment.ready', text: 'my-nextjs-app deployed to production', path: '/project/prj_001/overview', time: '5m ago' },
  { id: 'n2', type: 'deployment.error', text: 'internal-tools deployment failed', path: '/project/prj_005/deployments/dpl_018', time: '3h ago' },
  { id: 'n3', type: 'domain.verified', text: 'docs.acme.dev verified successfully', path: '/domains', time: '1d ago' },
];

const VercelLogo = () => (
  <svg width="20" height="20" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="white"/>
  </svg>
);

const teamNavItems = [
  { icon: LayoutGrid, label: 'Overview', path: '/' },
  { icon: Puzzle, label: 'Integrations', path: '/integrations' },
  { icon: Activity, label: 'Activity', path: '/activity' },
  { icon: Globe, label: 'Domains', path: '/domains' },
  { icon: BarChart2, label: 'Usage', path: '/usage' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [readNotifications, setReadNotifications] = useState(new Set());
  const collapsed = state.ui?.sidebarCollapsed;

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !readNotifications.has(n.id)).length;

  const toggleCollapse = () => {
    dispatch({ type: 'SET_UI', payload: { sidebarCollapsed: !collapsed } });
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header" onClick={() => setShowTeamDropdown(s => !s)}>
        <div className="sidebar-logo">
          <VercelLogo />
        </div>
        {!collapsed && (
          <>
            <span className="sidebar-team-name">{state.currentTeam?.name || 'Acme Inc'}</span>
            <ChevronDown size={14} color="var(--fg-secondary)" />
          </>
        )}
        {showTeamDropdown && !collapsed && (
          <div className="dropdown-menu" style={{ top: 52 }} onClick={e => e.stopPropagation()}>
            <button className="dropdown-item" onClick={() => { setShowTeamDropdown(false); navigate('/'); }}>
              Personal Account
            </button>
            <button className="dropdown-item" style={{ color: 'var(--white)' }} onClick={() => setShowTeamDropdown(false)}>
              ✓ Acme Inc
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {teamNavItems.map(({ icon: Icon, label, path }) => (
          <div key={path} className="tooltip-wrap">
            <Link
              to={path}
              className={`sidebar-nav-item${isActive(path) ? ' active' : ''}`}
            >
              <Icon className="nav-icon" size={20} />
              {!collapsed && <span className="sidebar-nav-label">{label}</span>}
            </Link>
            {collapsed && <span className="tooltip">{label}</span>}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <img
          src={state.currentUser?.avatar}
          alt={state.currentUser?.name}
          className="avatar"
          width={32}
          height={32}
        />
        {!collapsed && (
          <div className="sidebar-footer-user">
            <div className="sidebar-footer-name">{state.currentUser?.name}</div>
            <div className="sidebar-footer-email">{state.currentUser?.email}</div>
          </div>
        )}
        {!collapsed && (
          <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            title="Help"
            aria-label="Open help"
            onClick={() => {
              setShowHelp(s => !s);
              setShowNotifications(false);
            }}
          >
            <HelpCircle size={16} />
          </button>
          {showHelp && (
            <div style={{
              position: 'absolute', bottom: 36, right: 0, width: 300,
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-strong)',
              borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100,
            }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14 }}>
                Help
              </div>
              {[
                ['Deployments', 'Review build logs, promote previews, and redeploy from project pages.'],
                ['Domains', 'Add local domains, verify status, and attach them to projects.'],
                ['Environment variables', 'Create, reveal, edit, and remove encrypted variables in project settings.'],
              ].map(([title, body]) => (
                <button
                  key={title}
                  className="dropdown-item"
                  style={{ display: 'block', whiteSpace: 'normal', lineHeight: 1.4, padding: '10px 16px' }}
                  onClick={() => setShowHelp(false)}
                >
                  <div style={{ color: 'var(--fg-primary)', fontWeight: 500, marginBottom: 2 }}>{title}</div>
                  <div style={{ color: 'var(--fg-muted)', fontSize: 12 }}>{body}</div>
                </button>
              ))}
            </div>
          )}
          </div>
        )}
        {!collapsed && (
          <div style={{ position: 'relative' }}>
            <button
              className="btn-icon"
              title="Notifications"
              aria-label="Open notifications"
              onClick={() => {
                setShowNotifications(s => !s);
                setShowHelp(false);
              }}
              style={{ position: 'relative' }}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  background: 'var(--error)', color: '#fff', borderRadius: '50%',
                  fontSize: 10, fontWeight: 700, width: 14, height: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                }}>{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div style={{
                position: 'absolute', bottom: 36, right: 0, width: 280,
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-strong)',
                borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100,
              }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                  <button
                    style={{ background: 'none', border: 'none', color: 'var(--fg-secondary)', cursor: 'pointer', fontSize: 12 }}
                    onClick={() => setReadNotifications(new Set(MOCK_NOTIFICATIONS.map(n => n.id)))}
                  >
                    Mark all as read
                  </button>
                </div>
                {MOCK_NOTIFICATIONS.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '10px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                      background: readNotifications.has(n.id) ? 'transparent' : 'rgba(0,112,243,0.05)',
                    }}
                    onClick={() => {
                      setReadNotifications(prev => new Set([...prev, n.id]));
                      setShowNotifications(false);
                      navigate(n.path);
                    }}
                  >
                    <div style={{ fontSize: 13, color: 'var(--fg-primary)', marginBottom: 2 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          className="btn-icon"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={toggleCollapse}
          style={{ marginLeft: collapsed ? 'auto' : '0' }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </div>
  );
}
