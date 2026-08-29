import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Globe, HelpCircle, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

function getNotifIcon(type) {
  const icons = { assignment: '\u{1F514}', state_change: '\u{1F504}', comment: '\u{1F4AC}', approval: '\u2705', sla_warning: '\u26A0\uFE0F' };
  return icons[type] || '\u{1F514}';
}

function getNotifRoute(notif) {
  const table = notif.target_table;
  const id = notif.target_id;
  if (table === 'incident') return `/incident/${id}`;
  if (table === 'change_request') return `/change/${id}`;
  if (table === 'sc_req_item') return `/catalog/cart`;
  if (table === 'sc_request') return `/catalog/cart`;
  return '/';
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
];

export default function Banner() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showGlobeMenu, setShowGlobeMenu] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('all');
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const globeRef = useRef(null);
  const helpRef = useRef(null);

  const sid = searchParams.get('sid');
  const sidParam = sid ? `?sid=${sid}` : '';
  const unreadCount = (state.notifications || []).filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
      if (globeRef.current && !globeRef.current.contains(e.target)) setShowGlobeMenu(false);
      if (helpRef.current && !helpRef.current.contains(e.target)) setShowHelpPanel(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/search${sidParam}${sidParam ? '&' : '?'}q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleNotifClick = (notif) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.sys_id });
    setShowNotifications(false);
    navigate(getNotifRoute(notif) + sidParam);
  };

  // Banner tab click: switch navigator tab via dispatch or local state
  const handleBannerTab = (tab) => {
    setActiveTab(tab);
    // Sync navigator tab by dispatching a SET_NAVIGATOR_TAB action (handled below via URL or state)
    dispatch({ type: 'SET_BANNER_TAB', payload: tab });
  };

  const handleProfile = () => {
    setShowUserMenu(false);
    // Navigate to a user profile-style page — use the go endpoint to show user info
    navigate(`/search${sidParam}${sidParam ? '&' : '?'}q=user:${state.currentUser.user_name}`);
  };

  const handleImpersonate = () => {
    setShowUserMenu(false);
    // Show a simple prompt to pick user to impersonate
    const userList = state.users.filter(u => u.sys_id !== state.currentUser.sys_id);
    const names = userList.map((u, i) => `${i + 1}. ${u.first_name} ${u.last_name} (${u.user_name})`).join('\n');
    const input = window.prompt(`Impersonate User\n\nSelect a user to impersonate:\n${names}\n\nEnter number:`);
    if (input) {
      const idx = parseInt(input.trim(), 10) - 1;
      if (idx >= 0 && idx < userList.length) {
        const newUser = userList[idx];
        dispatch({ type: 'SET_CURRENT_USER', payload: newUser });
        alert(`Now impersonating: ${newUser.first_name} ${newUser.last_name}`);
      }
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch({ type: 'LOGOUT' });
      navigate('/' + sidParam);
    }
  };

  const handleLanguageSelect = (code) => {
    setSelectedLanguage(code);
    setShowGlobeMenu(false);
    dispatch({ type: 'SET_LANGUAGE', payload: code });
  };

  return (
    <div className="sn-banner">
      <div className="sn-banner-left">
        <div className="sn-banner-logo" onClick={() => navigate('/' + sidParam)}>
          service<b>now</b>
        </div>
      </div>

      <div className="sn-banner-center">
        <div className="sn-banner-tabs">
          <button
            className={`sn-banner-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleBannerTab('all')}
          >
            All
          </button>
          <button
            className={`sn-banner-tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => handleBannerTab('favorites')}
          >
            Favorites
          </button>
          <button
            className={`sn-banner-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleBannerTab('history')}
          >
            History
          </button>
        </div>
        {activeTab === 'favorites' && (
          <div className="sn-banner-tab-panel">
            {(state.favorites || []).length === 0 ? (
              <span style={{ fontSize: 13, color: '#ccc', padding: '0 12px' }}>No favorites. Star items in the navigator.</span>
            ) : (
              (state.favorites || []).map((fav, i) => (
                <a key={i} className="sn-banner-tab-item" onClick={() => navigate(fav.route + sidParam)}>
                  {'\u2B50'} {fav.label}
                </a>
              ))
            )}
          </div>
        )}
        {activeTab === 'history' && (
          <div className="sn-banner-tab-panel">
            {(state.history || []).length === 0 ? (
              <span style={{ fontSize: 13, color: '#ccc', padding: '0 12px' }}>No recent history.</span>
            ) : (
              (state.history || []).slice(0, 8).map((item, i) => (
                <a key={i} className="sn-banner-tab-item" onClick={() => navigate(item.route + sidParam)}>
                  {item.label}
                </a>
              ))
            )}
          </div>
        )}
      </div>

      <div className="sn-banner-right">
        <div className="sn-banner-search">
          <Search size={14} className="sn-banner-search-icon" onClick={() => searchValue.trim() && navigate(`/search${sidParam}${sidParam ? '&' : '?'}q=${encodeURIComponent(searchValue.trim())}`)} />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <div ref={globeRef} style={{ position: 'relative' }}>
          <button
            className="sn-banner-icon-btn"
            title="Language / Scope"
            onClick={() => { setShowGlobeMenu(g => !g); setShowHelpPanel(false); setShowNotifications(false); setShowUserMenu(false); }}
          >
            <Globe size={16} />
          </button>
          {showGlobeMenu && (
            <div className="sn-dropdown-panel" style={{ right: 0, minWidth: 160 }}>
              <div className="sn-dropdown-panel-header">Language</div>
              {LANGUAGES.map(lang => (
                <div
                  key={lang.code}
                  className={`sn-dropdown-panel-item ${selectedLanguage === lang.code ? 'active' : ''}`}
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  {selectedLanguage === lang.code && <span style={{ marginRight: 6 }}>{'\u2713'}</span>}
                  {lang.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div ref={helpRef} style={{ position: 'relative' }}>
          <button
            className="sn-banner-icon-btn"
            title="Help"
            onClick={() => { setShowHelpPanel(h => !h); setShowGlobeMenu(false); setShowNotifications(false); setShowUserMenu(false); }}
          >
            <HelpCircle size={16} />
          </button>
          {showHelpPanel && (
            <div className="sn-dropdown-panel" style={{ right: 0, minWidth: 280 }}>
              <div className="sn-dropdown-panel-header">Help & Documentation</div>
              <div className="sn-dropdown-panel-item" onClick={() => { setShowHelpPanel(false); navigate('/knowledge' + sidParam); }}>
                {'\u{1F4DA}'} Knowledge Base
              </div>
              <div className="sn-dropdown-panel-item" onClick={() => { setShowHelpPanel(false); navigate('/search' + sidParam); }}>
                {'\u{1F50D}'} Global Search
              </div>
              <div className="sn-dropdown-panel-divider" />
              <div style={{ padding: '8px 12px', fontSize: 12, color: '#ccc' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>XerviceNow Mock</div>
                <div>Version: Quebec (mock)</div>
                <div>Build: 2026.03</div>
                <div style={{ marginTop: 6 }}>For issues, contact your system administrator.</div>
              </div>
            </div>
          )}
        </div>

        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="sn-banner-icon-btn" title="Notifications" onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); setShowGlobeMenu(false); setShowHelpPanel(false); }}>
            <Bell size={16} />
            {unreadCount > 0 && <span className="sn-notification-badge">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="sn-notification-dropdown">
              <div className="sn-notification-dropdown-header">
                <span>Notifications</span>
                <a onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}>Mark all as read</a>
              </div>
              <div className="sn-notification-list">
                {(state.notifications || []).map(n => (
                  <div key={n.sys_id} className={`sn-notification-item ${n.read ? '' : 'unread'}`} onClick={() => handleNotifClick(n)}>
                    <span className="sn-notification-item-icon">{getNotifIcon(n.type)}</span>
                    <div className="sn-notification-item-content">
                      <div className="sn-notification-item-message">{n.message}</div>
                      <div className="sn-notification-item-time">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</div>
                    </div>
                    {!n.read && <div className="sn-notification-unread-dot" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={userRef} style={{ position: 'relative' }}>
          <button className="sn-avatar-btn" onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); setShowGlobeMenu(false); setShowHelpPanel(false); }}>
            {state.currentUser?.avatar || 'SA'}
          </button>
          {showUserMenu && (
            <div className="sn-user-dropdown">
              <div className="sn-user-dropdown-header">
                <div className="sn-user-dropdown-name">{state.currentUser?.first_name} {state.currentUser?.last_name}</div>
                <div className="sn-user-dropdown-role">{state.currentUser?.title}</div>
              </div>
              <div className="sn-user-dropdown-item" onClick={handleProfile}>Profile</div>
              <div className="sn-user-dropdown-item" onClick={handleImpersonate}>Impersonate User</div>
              <div className="sn-user-dropdown-divider" />
              <div className="sn-user-dropdown-item" onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
