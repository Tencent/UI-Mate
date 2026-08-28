import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Send, Zap, Users, BarChart3, Globe, FolderOpen, Puzzle, ChevronRight, Search, Bell, Plus, Mail, Workflow, Layout as LayoutIcon, ClipboardList, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { label: 'Campaigns', icon: Send, path: '/campaigns', subs: [{ label: 'All Campaigns', path: '/campaigns' }, { label: 'Email', path: '/campaigns/new' }] },
  { label: 'Automations', icon: Zap, path: '/automations', subs: [{ label: 'All Automations', path: '/automations' }, { label: 'Pre-built', path: '/automations/prebuilt' }] },
  { label: 'Audience', icon: Users, path: '/audience', subs: [{ label: 'All Contacts', path: '/audience' }, { label: 'Segments', path: '/audience/segments' }, { label: 'Tags', path: '/audience/tags' }, { label: 'Signup Forms', path: '/audience/signup-forms' }] },
  { label: 'Analytics', icon: BarChart3, path: '/analytics', subs: [{ label: 'Reports', path: '/analytics' }] },
  { label: 'Website', icon: Globe, path: '/landing-pages', subs: [{ label: 'Landing Pages', path: '/landing-pages' }] },
  { label: 'Content', icon: FolderOpen, path: '/content', subs: [{ label: 'Content Studio', path: '/content' }] },
  { label: 'Integrations', icon: Puzzle, path: '/settings' }
];

function getPageTitle(pathname) {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/campaigns')) return 'Campaigns';
  if (pathname.startsWith('/automations')) return 'Automations';
  if (pathname.startsWith('/audience')) return 'Audience';
  if (pathname.startsWith('/analytics')) return 'Analytics';
  if (pathname.startsWith('/content')) return 'Content';
  if (pathname.startsWith('/landing-pages')) return 'Landing Pages';
  if (pathname.startsWith('/settings')) return 'Settings';
  return '';
}

export default function Layout({ children, hideSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, toasts, removeToast, addToast, markNotificationRead, markAllNotificationsRead } = useApp();
  const [expandedNav, setExpandedNav] = useState(() => {
    const active = navItems.find(n => location.pathname.startsWith(n.path));
    return active ? active.label : null;
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const unreadCount = state.notifications.filter(n => !n.read).length;

  const handleNavClick = (item) => {
    if (item.subs) {
      setExpandedNav(prev => prev === item.label ? null : item.label);
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const searchResults = searchQuery.length > 1 ? {
    campaigns: state.campaigns.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    contacts: state.contacts.filter(c => `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    automations: state.automations.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 2)
  } : null;

  const hasSearchResults = searchResults && (searchResults.campaigns.length > 0 || searchResults.contacts.length > 0 || searchResults.automations.length > 0);

  function formatRelativeDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="app-layout">
      {!hideSidebar && (
        <aside className="sidebar">
          <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#FFE01B"/>
              <text x="16" y="22" textAnchor="middle" fill="#241C15" fontSize="18" fontWeight="bold">M</text>
            </svg>
            <span>xailchimp</span>
          </div>
          <div className="sidebar-marketing">
            <span>Marketing</span>
            <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>...</button>
          </div>
          <button className="sidebar-create" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Create
          </button>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <div key={item.label}>
                <div className={`nav-item ${isActive(item.path) ? 'active' : ''}`} onClick={() => handleNavClick(item)}>
                  <item.icon size={18} />
                  <span className="nav-label">{item.label}</span>
                  {item.subs && <ChevronRight className={`nav-chevron ${expandedNav === item.label ? 'open' : ''}`} />}
                </div>
                {item.subs && (
                  <div className="nav-subitems" style={{ maxHeight: expandedNav === item.label ? `${item.subs.length * 40}px` : '0px' }}>
                    {item.subs.map(sub => (
                      <a key={sub.path} className={`nav-subitem ${location.pathname === sub.path ? 'active' : ''}`} onClick={() => navigate(sub.path)}>
                        {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>
      )}

      <main className={`main-content ${hideSidebar ? 'no-sidebar' : ''}`}>
        <header className="top-header">
          <span className="page-title">{getPageTitle(location.pathname)}</span>
          <div className="header-search">
            <Search size={16} />
            <input
              placeholder="Search Xailchimp"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
              onFocus={() => setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            />
            {showSearchResults && hasSearchResults && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: '0 0 8px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 200, maxHeight: 360, overflowY: 'auto' }}>
                {searchResults.campaigns.length > 0 && (
                  <div style={{ padding: '8px 12px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#707070', textTransform: 'uppercase', marginBottom: 4 }}>Campaigns</div>
                    {searchResults.campaigns.map(c => (
                      <div key={c.id} style={{ padding: '6px 0', cursor: 'pointer', fontSize: 14 }} onClick={() => { navigate(`/campaigns/${c.id}`); setSearchQuery(''); }}>
                        <Send size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />{c.name}
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.contacts.length > 0 && (
                  <div style={{ padding: '8px 12px', borderTop: '1px solid #F0F0F0' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#707070', textTransform: 'uppercase', marginBottom: 4 }}>Contacts</div>
                    {searchResults.contacts.map(c => (
                      <div key={c.id} style={{ padding: '6px 0', cursor: 'pointer', fontSize: 14 }} onClick={() => { navigate(`/audience/${c.id}`); setSearchQuery(''); }}>
                        <Users size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />{c.firstName} {c.lastName} <span style={{ color: '#707070', fontSize: 12 }}>({c.email})</span>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.automations.length > 0 && (
                  <div style={{ padding: '8px 12px', borderTop: '1px solid #F0F0F0' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#707070', textTransform: 'uppercase', marginBottom: 4 }}>Automations</div>
                    {searchResults.automations.map(a => (
                      <div key={a.id} style={{ padding: '6px 0', cursor: 'pointer', fontSize: 14 }} onClick={() => { navigate(`/automations/${a.id}`); setSearchQuery(''); }}>
                        <Zap size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />{a.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="header-actions">
            <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            <div className="user-avatar" onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
              {state.user.firstName[0]}{state.user.lastName[0]}
            </div>
          </div>
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <span>Notifications</span>
                <button onClick={() => { markAllNotificationsRead(); }}>Mark all as read</button>
              </div>
              {state.notifications.map(n => (
                <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => { markNotificationRead(n.id); if (n.link) navigate(n.link); setShowNotifications(false); }}>
                  <div>
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-message">{n.message}</div>
                    <div className="notif-time">{formatRelativeDate(n.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </header>

        {children || (
          <div className="page-content">
            <Outlet />
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal create-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="create-option" onClick={() => { setShowCreateModal(false); navigate('/campaigns/new'); }}>
                <div className="create-option-icon"><Mail size={20} /></div>
                <div className="create-option-text">
                  <h3>Email</h3>
                  <p>Design and send automated or regular emails to your contacts.</p>
                </div>
              </div>
              <div className="create-option" onClick={() => { setShowCreateModal(false); navigate('/automations/prebuilt'); }}>
                <div className="create-option-icon"><Workflow size={20} /></div>
                <div className="create-option-text">
                  <h3>Customer Journey</h3>
                  <p>Map out a marketing journey for your contacts.</p>
                </div>
              </div>
              <div className="create-option" onClick={() => { setShowCreateModal(false); navigate('/content'); }}>
                <div className="create-option-icon"><LayoutIcon size={20} /></div>
                <div className="create-option-text">
                  <h3>Email Template</h3>
                  <p>Design your own template or tailor a pre-designed one.</p>
                </div>
              </div>
              <div className="create-option" onClick={() => { setShowCreateModal(false); navigate('/landing-pages'); }}>
                <div className="create-option-icon"><Globe size={20} /></div>
                <div className="create-option-text">
                  <h3>Landing Page</h3>
                  <p>Create a landing page to collect new contacts.</p>
                </div>
              </div>
              <div className="create-option" onClick={() => { setShowCreateModal(false); navigate('/surveys'); }}>
                <div className="create-option-icon"><ClipboardList size={20} /></div>
                <div className="create-option-text">
                  <h3>Survey</h3>
                  <p>Collect feedback from your audience.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)}><X size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
