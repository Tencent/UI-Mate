import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, Bell, Settings, HelpCircle, MessageSquare, Terminal, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Header({ onToggleSidebar }) {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [cloudShellOpen, setCloudShellOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  const unreadCount = state.notifications.filter(n => !n.read).length;

  const user = state.currentUser;
  const initials = user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  // Search filtering
  const allServices = state.allServicesCategories.flatMap(cat => cat.services);
  const allResources = [
    ...state.virtualMachines.map(vm => ({ name: vm.name, type: 'Virtual machine', resourceGroup: vm.resourceGroup, path: `/virtual-machines/${vm.id}` })),
    ...state.storageAccounts.map(sa => ({ name: sa.name, type: 'Storage account', resourceGroup: sa.resourceGroup, path: `/storage-accounts/${sa.id}` })),
    ...state.appServices.map(a => ({ name: a.name, type: 'App Service', resourceGroup: a.resourceGroup, path: `/app-services/${a.id}` })),
    ...state.sqlDatabases.map(db => ({ name: db.name, type: 'SQL database', resourceGroup: db.resourceGroup, path: `/sql-databases/${db.id}` })),
  ];

  const q = searchQuery.toLowerCase();
  const filteredServices = q ? allServices.filter(s => s.name.toLowerCase().includes(q)) : [];
  const filteredResources = q ? allResources.filter(r => r.name.toLowerCase().includes(q)) : [];
  const filteredRGs = q ? state.resourceGroups.filter(rg => rg.name.toLowerCase().includes(q)) : [];

  const showDropdown = searchFocused;
  const hasResults = filteredServices.length || filteredResources.length || filteredRGs.length;

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (path) => {
    navigate(path);
    setSearchFocused(false);
    setSearchQuery('');
  };

  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button className="header-hamburger" onClick={onToggleSidebar} aria-label="Toggle menu">
            <Menu size={20} />
          </button>
          <a href="/" className="header-brand" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            Microsoft Xzure
          </a>
        </div>

        <div className="header-search" ref={searchRef}>
          <input
            className="header-search-input"
            placeholder="Search resources, services, and docs (G+/)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
          />
          <Search size={16} className="header-search-icon" />

          {showDropdown && (
            <div className="search-dropdown" ref={dropdownRef}>
              {!q && (
                <>
                  <div className="search-dropdown-section">Recent resources</div>
                  {state.recentResources.slice(0, 5).map((r, i) => (
                    <div key={i} className="search-dropdown-item" onClick={() => {
                      const resource = allResources.find(ar => ar.name === r.name);
                      if (resource) handleSelect(resource.path);
                      else if (r.type === 'Resource group') handleSelect(`/resource-groups/${r.name}`);
                    }}>
                      <span>{r.name}</span>
                      <span className="search-dropdown-item-label">{r.type}</span>
                    </div>
                  ))}
                </>
              )}
              {q && !hasResults && (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--xzure-text-secondary)' }}>
                  No results found for "{searchQuery}"
                </div>
              )}
              {q && filteredServices.length > 0 && (
                <>
                  <div className="search-dropdown-section">Services ({filteredServices.length})</div>
                  {filteredServices.slice(0, 5).map((s, i) => (
                    <div key={i} className="search-dropdown-item" onClick={() => handleSelect(s.path)}>
                      <span>{s.name}</span>
                      <span className="search-dropdown-item-label">Service</span>
                    </div>
                  ))}
                </>
              )}
              {q && filteredResources.length > 0 && (
                <>
                  <div className="search-dropdown-section">Resources ({filteredResources.length})</div>
                  {filteredResources.slice(0, 5).map((r, i) => (
                    <div key={i} className="search-dropdown-item" onClick={() => handleSelect(r.path)}>
                      <span>{r.name}</span>
                      <span className="search-dropdown-item-label">{r.type} | {r.resourceGroup}</span>
                    </div>
                  ))}
                </>
              )}
              {q && filteredRGs.length > 0 && (
                <>
                  <div className="search-dropdown-section">Resource Groups ({filteredRGs.length})</div>
                  {filteredRGs.slice(0, 5).map((rg, i) => (
                    <div key={i} className="search-dropdown-item" onClick={() => handleSelect(`/resource-groups/${rg.name}`)}>
                      <span>{rg.name}</span>
                      <span className="search-dropdown-item-label">Resource group</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className="header-right">
          <button className="header-icon-btn" title="Cloud Shell" onClick={() => setCloudShellOpen(!cloudShellOpen)}>
            <Terminal size={18} />
          </button>
          <button className="header-icon-btn" title="Notifications" onClick={() => setNotifOpen(!notifOpen)}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="header-badge">{unreadCount}</span>}
          </button>
          <button className="header-icon-btn" title="Settings" onClick={() => setSettingsOpen(!settingsOpen)}>
            <Settings size={18} />
          </button>
          <button className="header-icon-btn" title="Help" onClick={() => setHelpOpen(!helpOpen)}>
            <HelpCircle size={18} />
          </button>
          <button className="header-icon-btn" title="Feedback" onClick={() => dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `notif-${Date.now()}`, title: 'Feedback submitted', message: 'Thank you for your feedback!', level: 'success', timestamp: new Date().toISOString(), read: false, resourceName: null } })}>
            <MessageSquare size={18} />
          </button>
          <div className="header-divider" />
          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button className="header-user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className="header-user-info">
                <div className="header-user-name">{user.displayName}</div>
                <div className="header-user-dir">{user.directoryName}</div>
              </div>
              <div className="header-avatar">{initials}</div>
            </button>
            {userMenuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                background: 'var(--xzure-surface)', border: '1px solid var(--xzure-border)',
                borderRadius: '4px', minWidth: '240px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                zIndex: 1000
              }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--xzure-border)' }}>
                  <div style={{ fontWeight: 600 }}>{user.displayName}</div>
                  <div style={{ fontSize: '13px', color: 'var(--xzure-text-secondary)' }}>{user.email}</div>
                  <div style={{ fontSize: '12px', color: 'var(--xzure-text-secondary)', marginTop: '4px' }}>{user.directoryName}</div>
                </div>
                <div style={{ padding: '8px 0' }}>
                  <div style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px' }} onClick={() => { navigate(`/subscriptions`); setUserMenuOpen(false); }}>
                    Switch directory
                  </div>
                  <div style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px', color: 'var(--xzure-text-secondary)' }}>
                    Sign out
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {settingsOpen && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px',
          background: 'var(--xzure-surface)', borderLeft: '1px solid var(--xzure-border)',
          boxShadow: '-4px 0 16px rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--xzure-border)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Portal settings</h2>
            <button onClick={() => setSettingsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--xzure-text-secondary)' }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Theme</label>
              <select className="input" style={{ width: '100%' }}
                value={state.portalSettings.theme}
                onChange={e => dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: e.target.value } })}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="high-contrast">High contrast</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Menu behavior</label>
              <select className="input" style={{ width: '100%' }}
                value={state.portalSettings.menuBehavior}
                onChange={e => dispatch({ type: 'UPDATE_SETTINGS', payload: { menuBehavior: e.target.value } })}>
                <option value="flyout">Flyout</option>
                <option value="docked">Docked</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Startup page</label>
              <select className="input" style={{ width: '100%' }}
                value={state.portalSettings.startupPage}
                onChange={e => dispatch({ type: 'UPDATE_SETTINGS', payload: { startupPage: e.target.value } })}>
                <option value="home">Home</option>
                <option value="dashboard">Dashboard</option>
                <option value="all-resources">All resources</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Language</label>
              <select className="input" style={{ width: '100%' }}
                value={state.portalSettings.language}
                onChange={e => dispatch({ type: 'UPDATE_SETTINGS', payload: { language: e.target.value } })}>
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Spanish">Spanish</option>
                <option value="Japanese">Japanese</option>
                <option value="Chinese (Simplified)">Chinese (Simplified)</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Regional format</label>
              <select className="input" style={{ width: '100%' }}
                value={state.portalSettings.regionalFormat}
                onChange={e => dispatch({ type: 'UPDATE_SETTINGS', payload: { regionalFormat: e.target.value } })}>
                <option value="English (United States)">English (United States)</option>
                <option value="English (United Kingdom)">English (United Kingdom)</option>
                <option value="French (France)">French (France)</option>
                <option value="German (Germany)">German (Germany)</option>
              </select>
            </div>
          </div>
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--xzure-border)', display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={() => setSettingsOpen(false)}>Apply</button>
            <button className="btn btn-default" onClick={() => setSettingsOpen(false)}>Discard</button>
          </div>
        </div>
      )}

      {cloudShellOpen && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '300px',
          background: '#1e1e1e', color: '#cccccc', zIndex: 1000,
          display: 'flex', flexDirection: 'column',
          borderTop: '2px solid var(--xzure-blue)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#252526', borderBottom: '1px solid #444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} color="var(--xzure-blue)" />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Xzure Cloud Shell - Bash</span>
            </div>
            <button onClick={() => setCloudShellOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#cccccc' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ flex: 1, padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', overflowY: 'auto' }}>
            <div style={{ color: '#4ec9b0' }}>Welcome to Xzure Cloud Shell</div>
            <div style={{ color: '#cccccc', marginTop: '4px' }}>alex.johnson@contoso.com [ ~ ]$ <span style={{ opacity: 0.5 }}>_</span></div>
          </div>
        </div>
      )}
      {helpOpen && (
        <div style={{
          position: 'fixed', top: '48px', right: '96px', width: '340px',
          background: 'var(--xzure-surface)', border: '1px solid var(--xzure-border)',
          borderRadius: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 1000
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--xzure-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Help</h2>
            <button className="btn-link" onClick={() => setHelpOpen(false)}>&times;</button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {[
              ['Xzure documentation', 'Browse local guidance for common portal workflows.'],
              ['Quickstart center', 'Create resources, review settings, and inspect activity.'],
              ['Support request', 'Draft a local support request without external submission.']
            ].map(([title, desc]) => (
              <button
                key={title}
                className="dropdown-item"
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', border: 0, background: 'transparent', cursor: 'pointer' }}
                onClick={() => {
                  dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `notif-${Date.now()}`, title, message: `${desc} Opened in the local sandbox.`, level: 'info', timestamp: new Date().toISOString(), read: false, resourceName: null } });
                  setHelpOpen(false);
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'var(--xzure-text-secondary)' }}>{desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      {notifOpen && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <h2>Notifications</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button className="btn-link" onClick={() => dispatch({ type: 'DISMISS_ALL_NOTIFICATIONS' })}>
                Dismiss all
              </button>
              <button className="btn-link" onClick={() => setNotifOpen(false)} style={{ fontSize: '18px' }}>
                &times;
              </button>
            </div>
          </div>
          <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--xzure-border)' }}>
            <a
              href="/activity-log"
              onClick={(e) => { e.preventDefault(); navigate('/activity-log'); setNotifOpen(false); }}
              style={{ color: 'var(--xzure-blue)', fontSize: '13px', textDecoration: 'none' }}
            >
              More events in the activity log &rarr;
            </a>
          </div>
          <div className="notification-panel-body">
            {state.notifications.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--xzure-text-secondary)' }}>
                No notifications
              </div>
            )}
            {state.notifications.map(n => (
              <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                <div className="notification-item-icon" style={{
                  color: n.level === 'success' ? 'var(--xzure-success)' :
                         n.level === 'error' ? 'var(--xzure-error)' :
                         n.level === 'warning' ? '#835b00' : 'var(--xzure-blue)'
                }}>
                  {n.level === 'success' ? '\u2713' : n.level === 'error' ? '\u2717' : n.level === 'warning' ? '\u26A0' : '\u24D8'}
                </div>
                <div className="notification-item-content">
                  <div className="notification-item-title">{n.title}</div>
                  <div className="notification-item-message">{n.message}</div>
                  <div className="notification-item-time">{getTimeAgo(n.timestamp)}</div>
                </div>
                <button
                  className="notification-item-dismiss"
                  onClick={() => dispatch({ type: 'DISMISS_NOTIFICATION', payload: n.id })}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
