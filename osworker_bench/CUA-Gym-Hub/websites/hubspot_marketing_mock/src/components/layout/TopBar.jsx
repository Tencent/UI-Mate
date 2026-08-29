import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Settings, Bell, ChevronDown, X, User, CreditCard, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const BREADCRUMB_MAP = {
  '/': ['Marketing'],
  '/contacts': ['CRM', 'Contacts'],
  '/companies': ['CRM', 'Companies'],
  '/deals': ['CRM', 'Deals'],
  '/lists': ['CRM', 'Lists'],
  '/marketing/email': ['Marketing', 'Email'],
  '/marketing/campaigns': ['Marketing', 'Campaigns'],
  '/marketing/forms': ['Marketing', 'Forms'],
  '/marketing/social': ['Marketing', 'Social'],
  '/marketing/ads': ['Marketing', 'Ads'],
  '/marketing/ctas': ['Marketing', 'CTAs'],
  '/marketing/landing-pages': ['Content', 'Landing Pages'],
  '/automations/workflows': ['Automations', 'Workflows'],
  '/reports/dashboards': ['Reporting', 'Dashboards'],
  '/reports/analytics': ['Reporting', 'Analytics'],
  '/settings': ['Settings']
};

function getBreadcrumb(pathname) {
  // Exact match first
  if (BREADCRUMB_MAP[pathname]) return BREADCRUMB_MAP[pathname];
  // Prefix match
  for (const [key, val] of Object.entries(BREADCRUMB_MAP)) {
    if (key !== '/' && pathname.startsWith(key)) return val;
  }
  return ['HubSpot'];
}

export default function TopBar({ sidebarWidth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, updateState, showToast } = useApp();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const breadcrumb = getBreadcrumb(location.pathname);
  const unreadCount = state.notifications?.filter(n => !n.read).length || 0;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    updateState(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n => ({ ...n, read: true }))
    }));
  };

  const searchResults = searchQuery.length >= 2 ? getSearchResults(state, searchQuery) : [];

  const handleSearchResult = (result) => {
    setShowSearch(false);
    setSearchQuery('');
    navigate(result.path);
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: sidebarWidth,
        right: 0,
        height: 56,
        background: '#fff',
        borderBottom: '1px solid var(--hs-topbar-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 40,
        gap: 16
      }}>
        {/* Breadcrumb */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--hs-text-muted)' }}>
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color: 'var(--hs-border)' }}>›</span>}
              <span style={{ color: i === breadcrumb.length - 1 ? 'var(--hs-text-primary)' : 'var(--hs-text-muted)', fontWeight: i === breadcrumb.length - 1 ? 500 : 400 }}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Search */}
          <IconBtn onClick={() => setShowSearch(true)} title="Search">
            <Search size={18} />
          </IconBtn>

          {/* Settings */}
          <IconBtn onClick={() => navigate('/settings')} title="Settings">
            <Settings size={18} />
          </IconBtn>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <IconBtn onClick={() => setShowNotifications(!showNotifications)} title="Notifications">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'var(--hs-danger)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>{unreadCount}</span>
              )}
            </IconBtn>
            {showNotifications && (
              <NotificationsDropdown
                notifications={state.notifications || []}
                onMarkAllRead={markAllRead}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* User avatar */}
          <div ref={userRef} style={{ position: 'relative', marginLeft: 8 }}>
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 4,
                transition: 'background 0.1s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hs-table-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--hs-orange)' }}>
                SJ
              </div>
              <ChevronDown size={14} style={{ color: 'var(--hs-text-muted)' }} />
            </div>
            {showUserMenu && (
              <div className="dropdown-menu" style={{ right: 0, top: '100%', minWidth: 220 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--hs-border)' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Sarah Johnson</div>
                  <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 2 }}>sarah.johnson@acmecorp.com</div>
                </div>
                <div className="dropdown-item"><User size={15} /> Profile & Preferences</div>
                <div className="dropdown-item"><CreditCard size={15} /> Account & Billing</div>
                <div className="dropdown-divider" />
                <div className="dropdown-item" style={{ color: 'var(--hs-danger)' }}><LogOut size={15} /> Sign out</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {showSearch && (
        <div className="search-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowSearch(false); setSearchQuery(''); } }}>
          <div className="search-box">
            <div className="search-input-row">
              <Search size={20} style={{ color: 'var(--hs-text-muted)', flexShrink: 0 }} />
              <input
                autoFocus
                placeholder="Search contacts, emails, campaigns..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && setShowSearch(false)}
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            {searchQuery.length < 2 ? (
              <div style={{ padding: '20px 24px', color: 'var(--hs-text-muted)', fontSize: 13 }}>
                Type at least 2 characters to search...
                <div style={{ marginTop: 8, fontSize: 12 }}>Press ⌘K to search</div>
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: '20px 24px', color: 'var(--hs-text-muted)', fontSize: 13 }}>
                No results for "{searchQuery}"
              </div>
            ) : (
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {searchResults.map((group, gi) => (
                  <div key={gi}>
                    <div style={{ padding: '8px 20px 4px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--hs-text-muted)' }}>
                      {group.type}
                    </div>
                    {group.items.map((item, ii) => (
                      <div
                        key={ii}
                        onClick={() => handleSearchResult(item)}
                        style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hs-table-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ color: 'var(--hs-text-muted)' }}>{item.icon}</span>
                        <span>{item.label}</span>
                        <span style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginLeft: 'auto' }}>{item.sublabel}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function IconBtn({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        position: 'relative',
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        color: 'var(--hs-text-secondary)',
        transition: 'background 0.1s'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--hs-table-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </button>
  );
}

function NotificationsDropdown({ notifications, onMarkAllRead, onClose }) {
  return (
    <div className="dropdown-menu" style={{ right: 0, top: '100%', width: 360, maxHeight: 420, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--hs-border)' }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
        <button onClick={onMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--hs-teal)', cursor: 'pointer', fontSize: 13 }}>Mark all read</button>
      </div>
      {notifications.length === 0 ? (
        <div style={{ padding: '20px 16px', color: 'var(--hs-text-muted)', textAlign: 'center', fontSize: 14 }}>No notifications</div>
      ) : (
        notifications.map(n => (
          <div
            key={n.id}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--hs-border)',
              borderLeft: n.read ? '3px solid transparent' : '3px solid var(--hs-teal)',
              background: n.read ? 'transparent' : '#F8FEFF'
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--hs-text-primary)', lineHeight: 1.4 }}>{n.message}</div>
            <div style={{ fontSize: 11, color: 'var(--hs-text-muted)', marginTop: 4 }}>
              {new Date(n.timestamp).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function getSearchResults(state, query) {
  const q = query.toLowerCase();
  const results = [];

  const contacts = (state.contacts || []).filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  ).slice(0, 4);
  if (contacts.length > 0) {
    results.push({ type: 'Contacts', items: contacts.map(c => ({ label: `${c.firstName} ${c.lastName}`, sublabel: c.email, path: `/contacts/${c.id}`, icon: '👤' })) });
  }

  const emails = (state.emails || []).filter(e => e.name.toLowerCase().includes(q)).slice(0, 3);
  if (emails.length > 0) {
    results.push({ type: 'Emails', items: emails.map(e => ({ label: e.name, sublabel: e.status, path: `/marketing/email/${e.id}`, icon: '✉️' })) });
  }

  const campaigns = (state.campaigns || []).filter(c => c.name.toLowerCase().includes(q)).slice(0, 3);
  if (campaigns.length > 0) {
    results.push({ type: 'Campaigns', items: campaigns.map(c => ({ label: c.name, sublabel: c.status, path: `/marketing/campaigns/${c.id}`, icon: '📣' })) });
  }

  return results;
}
