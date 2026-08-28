import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';

// SVG icon components matching Xatadog's style
const icons = {
  dashboard: <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>,
  infrastructure: <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><rect x="1" y="1" width="14" height="4" rx="1"/><circle cx="4" cy="3" r="1"/><rect x="1" y="7" width="14" height="4" rx="1"/><circle cx="4" cy="9" r="1"/><rect x="1" y="13" width="6" height="2" rx="0.5"/></svg>,
  monitors: <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a1 1 0 011 1v3.59l2.12 2.12a1 1 0 01-1.42 1.42l-2.41-2.42A1 1 0 017 8V4a1 1 0 011-1z"/></svg>,
  metrics: <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M2 14V4l4 4 3-6 5 4v8H2z" opacity="0.3"/><path d="M2 14V4l4 4 3-6 5 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  apm: <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M1 8h2l2-5 3 10 2-7 2 4h3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  logs: <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><rect x="2" y="2" width="12" height="2" rx="0.5"/><rect x="2" y="5.5" width="10" height="2" rx="0.5"/><rect x="2" y="9" width="12" height="2" rx="0.5"/><rect x="2" y="12.5" width="8" height="2" rx="0.5"/></svg>,
  events: <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1.5"/><line x1="5" y1="2" x2="5" y2="4" stroke="currentColor" strokeWidth="1.5"/><line x1="11" y1="2" x2="11" y2="4" stroke="currentColor" strokeWidth="1.5"/></svg>,
  incidents: <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M8 1l7 13H1L8 1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><line x1="8" y1="6" x2="8" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.8"/></svg>,
  notebooks: <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><rect x="3" y="1" width="10" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5"/><line x1="6" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1.2"/><line x1="6" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1.2"/><line x1="6" y1="11" x2="9" y2="11" stroke="currentColor" strokeWidth="1.2"/><line x1="1" y1="4" x2="3" y2="4" stroke="currentColor" strokeWidth="1.5"/><line x1="1" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.5"/><line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="1.5"/></svg>,
  security: <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  help: <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M6 6a2 2 0 114 0c0 1.5-2 1.5-2 3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="12" r="0.8"/></svg>,
};

const navItems = [
  { id: 'dashboards', icon: 'dashboard', label: 'Dashboards', path: '/dashboards' },
  { id: 'infrastructure', icon: 'infrastructure', label: 'Infrastructure', expandable: true, children: [
    { id: 'hosts', label: 'Hosts', path: '/infrastructure/hosts' },
    { id: 'host-map', label: 'Host Map', path: '/infrastructure/host-map' },
    { id: 'containers', label: 'Containers', path: '/infrastructure/containers' },
  ] },
  { id: 'monitors', icon: 'monitors', label: 'Monitors', path: '/monitors' },
  { id: 'metrics', icon: 'metrics', label: 'Metrics', path: '/metrics' },
  { id: 'apm', icon: 'apm', label: 'APM', expandable: true, children: [
    { id: 'apm-services', label: 'Services', path: '/apm/services' },
    { id: 'apm-traces', label: 'Traces', path: '/apm/traces' },
    { id: 'apm-service-map', label: 'Service Map', path: '/apm/service-map' },
  ] },
  { id: 'logs', icon: 'logs', label: 'Logs', expandable: true, children: [
    { id: 'log-search', label: 'Search', path: '/logs' },
  ] },
  { id: 'notebooks', icon: 'notebooks', label: 'Notebooks', path: '/notebooks' },
  { id: 'incidents', icon: 'incidents', label: 'Incidents', path: '/incidents' },
  { id: 'events', icon: 'events', label: 'Events', path: '/events' },
  { id: 'security', icon: 'security', label: 'Security', path: '/security' },
];

export default function Sidebar() {
  const { state, dispatch } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = state.sidebarCollapsed;
  const toPath = (path) => withCurrentSearch(path, location.search);
  const [expanded, setExpanded] = useState({ infrastructure: true, logs: true, apm: true });
  const [showHelp, setShowHelp] = useState(false);

  function toggleCollapse() {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function isActive(path) {
    if (!path) return false;
    if (path === '/dashboards') return location.pathname === '/dashboards' || location.pathname.startsWith('/dashboards/');
    if (path === '/monitors') return location.pathname === '/monitors' || location.pathname.startsWith('/monitors/');
    if (path === '/apm/services') return location.pathname === '/apm/services' && !location.pathname.includes('/apm/service-map');
    return location.pathname.startsWith(path);
  }

  // Count active alerts for badge
  const alertCount = state.monitors.filter(m => m.status === 'Alert').length;
  const activeIncidents = state.incidents.filter(i => i.status === 'active').length;

  return (
    <div className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg viewBox="0 0 32 32" width="22" height="22" fill="white">
            <path d="M22.5 10.2c-.4-.3-.8-.5-1.3-.4-.5.1-.8.4-1 .8l-2.5 4.8-2-3.1c-.3-.5-.8-.8-1.4-.7-.5.1-1 .4-1.2.9l-1.5 3.8-1.2-1.2c-.3-.3-.7-.5-1.1-.4-.4 0-.8.3-1 .6l-2 3.2c-.3.5-.2 1.2.3 1.5.5.3 1.2.2 1.5-.3l1.2-2 1.6 1.7c.3.3.8.5 1.2.4.5-.1.9-.5 1.1-1l1.2-3.1 2 3.1c.3.5.8.8 1.3.7.5-.1 1-.5 1.2-.9l2.4-4.7.6.4c.4.3.9.3 1.3.1.4-.2.7-.6.7-1.1v-2.4c0-.5-.3-1-.7-1.2z"/>
            <circle cx="16" cy="16" r="14" fill="none" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        {!collapsed && <span className="logo-text">XATADOG</span>}
        <button className="sidebar-collapse-btn" onClick={toggleCollapse} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '\u{00BB}' : '\u{00AB}'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          if (item.expandable) {
            const isExp = expanded[item.id];
            const hasActiveSub = item.children?.some(c => isActive(c.path));
            return (
              <div key={item.id}>
                <div
                  className={`nav-item${hasActiveSub ? ' active' : ''}`}
                  onClick={() => {
                    if (collapsed && item.children?.[0]?.path) {
                      navigate(toPath(item.children[0].path));
                    } else {
                      toggleExpand(item.id);
                    }
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="nav-icon">{icons[item.icon]}</span>
                  {!collapsed && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.6 }}>{isExp ? '\u25BC' : '\u25B6'}</span>
                    </>
                  )}
                </div>
                {!collapsed && isExp && item.children?.map(child => (
                  <Link
                    key={child.id}
                    to={toPath(child.path)}
                    className={`nav-item nav-sub-item${isActive(child.path) ? ' active' : ''}`}
                  >
                    <span className="nav-label">{child.label}</span>
                  </Link>
                ))}
              </div>
            );
          }

          if (item.path) {
            return (
              <Link
                key={item.id}
                to={toPath(item.path)}
                className={`nav-item${isActive(item.path) ? ' active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon">{icons[item.icon]}</span>
                {!collapsed && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.id === 'monitors' && alertCount > 0 && (
                      <span className="nav-badge alert">{alertCount}</span>
                    )}
                    {item.id === 'incidents' && activeIncidents > 0 && (
                      <span className="nav-badge warn">{activeIncidents}</span>
                    )}
                  </>
                )}
              </Link>
            );
          }

          return null;
        })}
      </nav>

      <div className="nav-divider" />

      <div className="sidebar-bottom">
        <button className="nav-item nav-item-button" onClick={() => setShowHelp(true)} title={collapsed ? 'Help' : undefined}>
          <span className="nav-icon">{icons.help}</span>
          {!collapsed && <span className="nav-label">Help</span>}
        </button>
        <div className="sidebar-user">
          <div className="user-avatar">{state.currentUser.avatar}</div>
          {!collapsed && <span className="user-name">{state.currentUser.name}</span>}
        </div>
      </div>

      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Xatadog Help</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                ['Dashboards', 'Create dashboards, clone them, and add widgets for metric triage.'],
                ['Monitors', 'Create, mute, delete, and inspect alert history for training tasks.'],
                ['Security', 'Review security signals and declare incidents from suspicious activity.'],
                ['Incidents', 'Declare incidents, add timeline notes, and resolve active incidents.'],
              ].map(([title, text]) => (
                <div key={title} style={{ padding: 12, background: 'var(--content-bg)', borderRadius: 6 }}>
                  <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{text}</span>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowHelp(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
