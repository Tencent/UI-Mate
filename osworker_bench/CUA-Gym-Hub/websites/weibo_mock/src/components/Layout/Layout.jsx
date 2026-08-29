import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import LeftSidebar from '../Sidebar/LeftSidebar';
import RightSidebar from '../Sidebar/RightSidebar';
import './Layout.css';

export default function Layout() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    }
  };

  const handleSearchClick = () => {
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navTabs = [
    { label: '首页', path: '/' },
    { label: '热门', path: '/hot' },
    { label: '视频', path: '/video' },
    { label: '超话', path: '/topic/topic_3' },
  ];

  const unreadNotif = state.ui?.notificationUnreadCount || 0;
  const unreadMsg = state.ui?.messageUnreadCount || 0;

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="top-nav-inner">
          <div className="nav-left">
            <Link to="/" className="nav-logo">
              <svg className="xeibo-logo-svg" viewBox="0 0 48 24" width="48" height="24" fill="none">
                <circle cx="12" cy="12" r="11" fill="#E6162D"/>
                <text x="12" y="17" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="PingFang SC, Microsoft YaHei, sans-serif">微</text>
              </svg>
              <span className="logo-text">微博</span>
            </Link>
            <div className="nav-tabs">
              {navTabs.map(tab => {
                const isActive = tab.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(tab.path);
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`nav-tab ${isActive ? 'nav-tab-active' : ''}`}
                  >
                    {tab.label}
                    {isActive && <span className="nav-tab-indicator" />}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="nav-right">
            <div className="nav-search">
              <input
                type="text"
                className="search-input"
                placeholder="大家都在搜"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={handleSearch}
              />
              <button className="search-btn" onClick={handleSearchClick} aria-label="搜索">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>

            <button
              className="nav-compose-btn"
              onClick={() => navigate('/')}
              title="发微博"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <span>发微博</span>
            </button>

            <Link to="/notifications" className="nav-icon-btn" title="通知">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadNotif > 0 && (
                <span className="badge-dot">{unreadNotif > 99 ? '99+' : unreadNotif}</span>
              )}
            </Link>

            <Link to="/messages" className="nav-icon-btn" title="私信">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {unreadMsg > 0 && (
                <span className="badge-dot">{unreadMsg > 99 ? '99+' : unreadMsg}</span>
              )}
            </Link>

            <div className="nav-user" ref={dropdownRef} onClick={() => setShowUserDropdown(!showUserDropdown)}>
              <img
                src={state.currentUser?.avatar}
                alt={state.currentUser?.screenName}
                className="avatar nav-avatar"
              />
              <svg className="nav-user-caret" width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {showUserDropdown && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <img src={state.currentUser?.avatar} alt="" className="avatar" style={{ width: 40, height: 40 }} />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 14 }}>{state.currentUser?.screenName}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>@{state.currentUser?.handle}</div>
                    </div>
                  </div>
                  <div className="user-dropdown-divider" />
                  <Link to="/profile/user_current" onClick={() => setShowUserDropdown(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>我的主页</span>
                  </Link>
                  <Link to="/favorites" onClick={() => setShowUserDropdown(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    <span>我的收藏</span>
                  </Link>
                  <Link to="/settings" onClick={() => setShowUserDropdown(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <span>设置</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-inner">
          <aside className="sidebar-left">
            <LeftSidebar />
          </aside>

          <main className="center-column">
            <Outlet />
          </main>

          <aside className="sidebar-right">
            <RightSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
