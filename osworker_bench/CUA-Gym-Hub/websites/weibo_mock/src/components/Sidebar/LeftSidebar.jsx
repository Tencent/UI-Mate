import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCount } from '../../utils/helpers';
import './Sidebar.css';

const navLinks = [
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    label: '首页', path: '/'
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    label: '热门', path: '/hot'
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    label: '超话', path: '/topic/topic_3'
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    label: '消息', path: '/messages'
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
    label: '收藏', path: '/favorites'
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    label: '设置', path: '/settings'
  },
];

export default function LeftSidebar() {
  const { state } = useApp();
  const location = useLocation();
  const user = state.currentUser;

  if (!user) return null;

  return (
    <div className="left-sidebar">
      {/* User Profile Mini-Card */}
      <div className="sidebar-user-card card">
        <Link to="/profile/user_current">
          <img src={user.avatar} alt={user.screenName} className="avatar" style={{ width: 64, height: 64 }} />
        </Link>
        <Link to="/profile/user_current" className="sidebar-username">
          {user.screenName}
        </Link>
        <p className="sidebar-bio">{user.bio}</p>
        <div className="sidebar-stats">
          <Link to="/profile/user_current" className="stat-item">
            <span className="stat-num">{formatCount(user.followingCount)}</span>
            <span className="stat-label">关注</span>
          </Link>
          <div className="stat-divider">|</div>
          <Link to="/profile/user_current" className="stat-item">
            <span className="stat-num">{formatCount(user.followersCount)}</span>
            <span className="stat-label">粉丝</span>
          </Link>
          <div className="stat-divider">|</div>
          <Link to="/profile/user_current" className="stat-item">
            <span className="stat-num">{formatCount(user.postsCount)}</span>
            <span className="stat-label">微博</span>
          </Link>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-nav-link ${location.pathname === link.path ? 'sidebar-nav-active' : ''}`}
          >
            <span className="nav-link-icon">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
