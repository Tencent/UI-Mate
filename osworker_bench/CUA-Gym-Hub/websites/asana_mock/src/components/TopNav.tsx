
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Bell, HelpCircle, CheckSquare, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import QuickAddModal from './QuickAddModal';
import CreateProjectModal from './CreateProjectModal';
import './TopNav.css';

export default function TopNav() {
  const { state, updateCurrentUser } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const unreadCount = state.notifications.filter(n => !n.read && !n.archived).length;

  useEffect(() => {
    const handler = () => setShowTaskModal(true);
    window.addEventListener('open-quick-add', handler);
    return () => window.removeEventListener('open-quick-add', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogOut = () => {
    setShowUserMenu(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogOut = () => {
    updateCurrentUser({ loggedOut: true });
    setShowLogoutConfirm(false);
    navigate('/');
  };

  return (
    <>
      <nav className="top-nav">
        <div className="top-nav-left">
          <Link to="/" className="logo">
            <div className="logo-icon">A</div>
            <span>Xsana</span>
          </Link>

          <form className="search-bar" onSubmit={handleSearch}>
            <Search size={18} />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search tasks, projects, conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="top-nav-right">
          <button
            className="nav-btn quick-add"
            aria-label="Create new"
            title="Create new"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
          >
            <Plus size={20} />
          </button>

          {showQuickAdd && (
            <div className="quick-add-menu">
              <button onClick={() => { setShowQuickAdd(false); setShowTaskModal(true); }}>
                Task
              </button>
              <button onClick={() => { setShowQuickAdd(false); setShowProjectModal(true); }}>
                Project
              </button>
            </div>
          )}

          <Link to="/my-tasks" className="nav-btn" title="My Tasks">
            <CheckSquare size={20} />
          </Link>

          <Link to="/inbox" className="nav-btn notification-btn" title="Inbox">
            <Bell size={20} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </Link>

          <button
            className={`nav-btn ${showHelpPanel ? 'active' : ''}`}
            title="Help"
            onClick={() => setShowHelpPanel(!showHelpPanel)}
          >
            <HelpCircle size={20} />
          </button>

          <div className="user-menu-container">
            <button
              className="user-avatar"
              aria-label={`${state.currentUser.name} account menu`}
              title={`${state.currentUser.name} account menu`}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <img src={state.currentUser.avatar} alt={state.currentUser.name} />
            </button>

            {showUserMenu && (
              <div className="user-menu">
                <div className="user-menu-header">
                  <img src={state.currentUser.avatar} alt={state.currentUser.name} />
                  <div>
                    <div className="user-name">{state.currentUser.name}</div>
                    <div className="user-email">{state.currentUser.email}</div>
                  </div>
                </div>
                <div className="user-menu-divider"></div>
                <Link to="/settings" onClick={() => setShowUserMenu(false)}>My Profile Settings</Link>
                <Link to="/settings?tab=workspace" onClick={() => setShowUserMenu(false)}>Workspace Settings</Link>
                <div className="user-menu-divider"></div>
                <button onClick={handleLogOut}>Log Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showTaskModal && (
        <QuickAddModal onClose={() => setShowTaskModal(false)} />
      )}
      {showProjectModal && (
        <CreateProjectModal onClose={() => setShowProjectModal(false)} />
      )}

      {showHelpPanel && (
        <div className="help-panel-overlay" onClick={() => setShowHelpPanel(false)}>
          <div className="help-panel" onClick={e => e.stopPropagation()}>
            <div className="help-panel-header">
              <h2>Help & Resources</h2>
              <button className="help-panel-close" aria-label="Close help" title="Close help" onClick={() => setShowHelpPanel(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="help-panel-body">
              <div className="help-section">
                <h3>Getting Started</h3>
                <ul className="help-links">
                  <li><span className="help-link-item">Xsana basics</span></li>
                  <li><span className="help-link-item">Create your first project</span></li>
                  <li><span className="help-link-item">Invite team members</span></li>
                </ul>
              </div>
              <div className="help-section">
                <h3>Keyboard Shortcuts</h3>
                <div className="help-shortcuts">
                  <div className="help-shortcut-row">
                    <span>Quick Add task</span>
                    <kbd>Tab + Q</kbd>
                  </div>
                  <div className="help-shortcut-row">
                    <span>Mark complete</span>
                    <kbd>Tab + C</kbd>
                  </div>
                  <div className="help-shortcut-row">
                    <span>Search</span>
                    <kbd>Cmd + K</kbd>
                  </div>
                  <div className="help-shortcut-row">
                    <span>My Tasks</span>
                    <kbd>Tab + Z</kbd>
                  </div>
                </div>
              </div>
              <div className="help-section">
                <h3>Support</h3>
                <ul className="help-links">
                  <li><span className="help-link-item">Contact support</span></li>
                  <li><span className="help-link-item">Community forum</span></li>
                  <li><span className="help-link-item">What's new</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="logout-confirm-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3>Log out of Xsana?</h3>
            <p>You'll need to log back in to access your workspace.</p>
            <div className="logout-confirm-actions">
              <button className="logout-cancel-btn" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="logout-confirm-btn" onClick={confirmLogOut}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
