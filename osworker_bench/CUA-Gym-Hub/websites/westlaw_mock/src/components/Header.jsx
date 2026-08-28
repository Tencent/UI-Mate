import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, FolderOpen, Clock, BookOpen, Bell, Star } from 'lucide-react';

export default function Header() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('All Content');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    dispatch({ type: 'SEARCH', payload: { query: query.trim() } });
    navigate('/search');
  };

  const user = state.currentUser || {};

  return (
    <>
      <header className="header">
        <Link to="/" className="header-logo">
          <span className="header-logo-top">Thomson Reuters</span>
          <span className="header-logo-bottom">Xestlaw</span>
        </Link>

        <div className="header-search-area">
          <form className="header-search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-bar"
                placeholder="Search cases, statutes, regulations..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <select
              className="search-jurisdiction-select"
              value={searchType}
              onChange={e => setSearchType(e.target.value)}
            >
              <option>All Content</option>
              <option>Cases</option>
              <option>Statutes &amp; Court Rules</option>
              <option>Secondary Sources</option>
              <option>Regulations</option>
              <option>Briefs</option>
            </select>
            <button type="submit" className="search-button">
              <Search size={18} />
            </button>
          </form>
        </div>

        <div className="header-actions">
          <Link to="/history" className="header-icon-btn" title="History">
            <Clock size={18} />
          </Link>
          <Link to="/folders" className="header-icon-btn" title="Folders">
            <FolderOpen size={18} />
          </Link>
          <button
            className="header-icon-btn"
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            <span className="notification-badge">2</span>
            {showNotifications && (
              <div className="notifications-dropdown" onClick={e => e.stopPropagation()}>
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <a onClick={() => setShowNotifications(false)}>Mark all read</a>
                </div>
                <div className="notification-item unread">
                  <div className="notification-item-title">KeyCite Alert</div>
                  <div className="notification-item-message">New citing reference found for Brown v. Board of Education</div>
                  <div className="notification-item-time">2 hours ago</div>
                </div>
                <div className="notification-item unread">
                  <div className="notification-item-title">WestClip Results</div>
                  <div className="notification-item-message">3 new results for your saved search "equal protection"</div>
                  <div className="notification-item-time">5 hours ago</div>
                </div>
              </div>
            )}
          </button>
          <div className="user-avatar" title={user.name}>
            {user.initials || 'SM'}
          </div>
        </div>
      </header>

      <nav className="secondary-nav">
        <Link to="/" className="secondary-nav-link">
          <BookOpen size={14} /> Home
        </Link>
        <Link to="/search" className="secondary-nav-link">
          <Search size={14} /> Search
        </Link>
        <Link to="/folders" className="secondary-nav-link">
          <FolderOpen size={14} /> Folders
        </Link>
        <Link to="/history" className="secondary-nav-link">
          <Clock size={14} /> History
        </Link>
        <button className="secondary-nav-link" onClick={() => {
          dispatch({ type: 'SEARCH', payload: { query: '' } });
          navigate('/search');
        }}>
          <Star size={14} /> Favorites
        </button>
        <div className="secondary-nav-spacer" />
        <span className="secondary-nav-signout">{user.name || 'User'}</span>
      </nav>
    </>
  );
}
