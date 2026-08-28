import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Bell, ChevronDown, Menu, PenTool, Eye, CheckSquare, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import NotificationDropdown from './NotificationDropdown';
import SearchModal from './SearchModal';
import { showToast } from './Toast';

const PAGE_TITLES = {
  '/contracts': 'Contracts',
  '/templates': 'Templates',
  '/tasks': 'Tasks',
  '/contacts': 'Contacts',
  '/settings': 'Settings',
};

export default function Header({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const sid = searchParams.get('sid');
  const query = sid ? `?sid=${sid}` : '';

  const unreadCount = state.notifications.filter(n => !n.read).length;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/contracts/')) return 'Contract Detail';
    if (path.startsWith('/templates/')) return 'Template Detail';
    return PAGE_TITLES[path] || 'Xontractbook';
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setCollapsed(!collapsed)}
          title="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="header-title">{getPageTitle()}</h1>
      </div>

      <div className="header-right">
        <button
          className="btn btn-ghost"
          onClick={() => setSearchOpen(true)}
          title="Search (Cmd+K)"
        >
          <Search size={18} />
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>⌘K</span>
        </button>

        {/* Notifications */}
        <div className="dropdown" ref={notifRef}>
          <button
            className="btn btn-ghost btn-icon notif-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
        </div>

        {/* User Avatar */}
        <div className="dropdown" ref={userRef}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="avatar avatar-md">
              {getInitials(state.currentUser?.firstName, state.currentUser?.lastName)}
            </div>
          </button>
          {userMenuOpen && (
            <div className="dropdown-menu" style={{ minWidth: 180 }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border-light)', marginBottom: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{state.currentUser?.firstName} {state.currentUser?.lastName}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{state.currentUser?.email}</div>
              </div>
              <button className="dropdown-item" onClick={() => { setUserMenuOpen(false); navigate(`/settings${query}`); }}>Profile</button>
              <button className="dropdown-item" onClick={() => { setUserMenuOpen(false); navigate(`/settings${query}`); }}>Settings</button>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={() => { setUserMenuOpen(false); showToast('You have been logged out', 'info'); }}>Log out</button>
            </div>
          )}
        </div>
      </div>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
