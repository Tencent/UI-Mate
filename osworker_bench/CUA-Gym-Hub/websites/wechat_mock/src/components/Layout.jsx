
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const conversations = useStore(state => state.conversations) || [];

  const totalUnread = conversations
    .filter(c => !c.isMuted)
    .reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  const tabs = [
    { path: '/messages', label: '微信', icon: '💬', badge: totalUnread },
    { path: '/contacts', label: '通讯录', icon: '👥' },
    { path: '/discover', label: '发现', icon: '🔍' },
    { path: '/profile', label: '我', icon: '👤' }
  ];

  return (
    <div className="layout">
      <div className="layout-content">
        <Outlet />
      </div>
      <nav className="bottom-nav" role="tablist" data-testid="bottom-tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.path}
            className={`nav-item ${location.pathname === tab.path ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
            role="tab"
            aria-label={tab.label}
            aria-selected={location.pathname === tab.path}
            data-testid={`tab-${tab.label}`}
          >
            <div className="nav-icon-wrapper">
              <span className="nav-icon">{tab.icon}</span>
              {tab.badge > 0 && <span className="nav-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>}
            </div>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
