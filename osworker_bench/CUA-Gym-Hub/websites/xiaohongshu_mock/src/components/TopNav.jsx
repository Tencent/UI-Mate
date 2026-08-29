import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../App.jsx';

export default function TopNav() {
  const { state, currentUserId, setTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const currentUser = state?.users?.[currentUserId];
  const isDark = state?.isDarkMode ?? false;
  const unreadCount = state
    ? Object.values(state.notifications || {})
        .filter(n => n.recipientId === currentUserId && !n.isRead).length
    : 0;

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('xhs_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isHome = location.pathname === '/' || location.pathname === '/explore';
  const isExplore = location.pathname.startsWith('/explore/');

  return (
    <nav className="top-nav">
      <Link to="/explore" className="nav-logo">小红书</Link>

      <div className="nav-tabs">
        <Link
          to="/explore"
          className={`nav-tab ${isHome ? 'active' : ''}`}
        >
          首页
        </Link>
        <Link
          to="/explore/food"
          className={`nav-tab ${isExplore ? 'active' : ''}`}
        >
          发现
        </Link>
        <span
          className="nav-tab"
          style={{ cursor: 'pointer' }}
          onClick={() => showToast('功能暂未开放')}
        >
          创作者服务
        </span>
      </div>

      <div className="nav-search">
        <form onSubmit={handleSearch}>
          <span className="nav-search-icon">🔍</span>
          <input
            type="text"
            placeholder="搜索小红书"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="nav-actions">
        {/* Notifications */}
        <div
          className="nav-icon-btn"
          onClick={() => navigate('/notifications')}
          title="通知"
        >
          🔔
          {unreadCount > 0 && (
            <span className="nav-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        {/* Messages */}
        <div
          className="nav-icon-btn"
          onClick={() => navigate('/messages')}
          title="私信"
        >
          💬
        </div>

        {/* User avatar + dropdown */}
        <div className="dropdown-wrapper" ref={dropdownRef}>
          <img
            src={currentUser?.avatar || 'https://i.pravatar.cc/150?u=u1'}
            alt="avatar"
            className="nav-avatar"
            onClick={() => setShowDropdown(v => !v)}
          />
          {showDropdown && (
            <div className="dropdown-menu">
              <div
                className="dropdown-item"
                onClick={() => { navigate(`/user/${currentUserId}`); setShowDropdown(false); }}
              >
                👤 我的主页
              </div>
              <div
                className="dropdown-item"
                onClick={() => { navigate('/publish'); setShowDropdown(false); }}
              >
                ✏️ 发布笔记
              </div>
              <div className="dropdown-divider" />
              <div
                className="dropdown-item"
                onClick={() => { setTheme(!isDark); setShowDropdown(false); }}
              >
                {isDark ? '☀️ 浅色模式' : '🌙 深色模式'}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
