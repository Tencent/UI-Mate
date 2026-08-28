import React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const navItems = [
  { id: 'activity', icon: '\uD83D\uDD14', label: 'Activity', path: '/activity' },
  { id: 'chat', icon: '\uD83D\uDCAC', label: 'Chat', path: '/chat' },
  { id: 'teams', icon: '\uD83D\uDC65', label: 'Teams', path: '/teams' },
  { id: 'calendar', icon: '\uD83D\uDCC5', label: 'Calendar', path: '/calendar' },
  { id: 'calls', icon: '\uD83D\uDCDE', label: 'Calls', path: '/calls' },
  { id: 'files', icon: '\uD83D\uDCC1', label: 'Files', path: '/files' },
];

export default function LeftRail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { state } = useApp();

  const query = searchParams.toString();
  const qStr = query ? `?${query}` : '';

  const unreadNotifs = state.notifications.filter(n => !n.isRead).length;
  const unreadChats = state.chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  function getBadge(id) {
    if (id === 'activity' && unreadNotifs > 0) return unreadNotifs;
    if (id === 'chat' && unreadChats > 0) return unreadChats;
    return 0;
  }

  return (
    <nav className="left-rail">
      {navItems.map(item => {
        const active = location.pathname.startsWith(item.path);
        const badge = getBadge(item.id);
        return (
          <button
            key={item.id}
            className={`rail-item ${active ? 'active' : ''}`}
            onClick={() => navigate(`${item.path}${qStr}`)}
            title={item.label}
          >
            <span className="rail-icon">{item.icon}</span>
            <span className="rail-label">{item.label}</span>
            {badge > 0 && <span className="rail-badge">{badge > 99 ? '99+' : badge}</span>}
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <button
        className={`rail-item ${location.pathname.startsWith('/settings') ? 'active' : ''}`}
        onClick={() => navigate(`/settings${qStr}`)}
        title="Settings"
      >
        <span className="rail-icon">&#9881;</span>
        <span className="rail-label">Settings</span>
      </button>
    </nav>
  );
}
