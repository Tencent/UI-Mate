import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Search, Plus, HelpCircle, Bell, Settings, ChevronDown, CheckCircle, X } from 'lucide-react';
import { useAppState } from '../context/AppContext';

function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {type === 'success' && <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />}
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}><X size={14} /></button>
    </div>
  );
}

export default function Layout() {
  const { state, dispatch } = useAppState();
  const location = useLocation();
  const navigate = useNavigate();
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const notifRef = useRef(null);

  const navItems = [
    { to: '/', label: 'Home', exact: true },
    { to: '/payments', label: 'Payments' },
    { to: '/balances', label: 'Balances' },
    { to: '/customers', label: 'Customers' },
    { to: '/products', label: 'Products' },
    { to: '/reports', label: 'Reports' },
  ];

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  const handleToggleTestMode = () => {
    dispatch({ type: 'TOGGLE_TEST_MODE' });
  };

  function addToast(message, type = 'info') {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  // Close notifications dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen]);

  // Recent events for notifications panel
  const recentEvents = (state.events || []).slice(0, 8);

  function formatEventLabel(type) {
    return (type || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function formatEventTime(ts) {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  return (
    <div className="app-layout">
      {state.testMode && (
        <div className="test-mode-banner">
          You're viewing test data. Toggle off test mode to see your live data.
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button className="business-selector" onClick={() => navigate('/settings')}>
            <span className="business-icon">R</span>
            <span>{state.business?.name || 'Rocket Rides'}</span>
            <ChevronDown size={14} />
          </button>
        </div>

        <div className="header-center">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={state.searchQuery || ''}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && state.searchQuery) {
                  addToast(`Search results for "${state.searchQuery}" — use page-level search for detailed results.`, 'info');
                }
              }}
            />
            <span className="search-hint">⌘K</span>
          </div>
        </div>

        <div className="header-right">
          <div className="dropdown" style={{ position: 'relative' }}>
            <button
              className="header-btn"
              onClick={() => setCreateMenuOpen(!createMenuOpen)}
            >
              <Plus size={14} />
              <span>Create</span>
              <ChevronDown size={12} />
            </button>
            {createMenuOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => { setCreateMenuOpen(false); navigate('/payments?create=1'); }}>
                  Payment
                </button>
                <button className="dropdown-item" onClick={() => { setCreateMenuOpen(false); navigate('/invoices?create=1'); }}>
                  Invoice
                </button>
                <button className="dropdown-item" onClick={() => { setCreateMenuOpen(false); navigate('/customers?create=1'); }}>
                  Customer
                </button>
                <button className="dropdown-item" onClick={() => { setCreateMenuOpen(false); navigate('/products?create=1'); }}>
                  Product
                </button>
              </div>
            )}
          </div>
          <button
            className="header-icon-btn"
            title="Help"
            onClick={() => navigate('/developers')}
          >
            <HelpCircle size={18} />
          </button>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              className="header-icon-btn"
              title="Notifications"
              onClick={() => setNotifOpen(o => !o)}
              style={{ position: 'relative' }}
            >
              <Bell size={18} />
              {recentEvents.length > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--color-danger)', border: '2px solid white',
                }} />
              )}
            </button>
            {notifOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
                minWidth: 320, maxWidth: 360, zIndex: 300,
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: 14 }}>
                  Recent events
                </div>
                {recentEvents.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                    No recent events
                  </div>
                ) : (
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {recentEvents.map(evt => (
                      <div key={evt.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{formatEventLabel(evt.type)}</div>
                          {evt.data?.object?.id && (
                            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginTop: 2 }}>{evt.data.object.id}</div>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{formatEventTime(evt.created)}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ padding: '8px 16px', borderTop: '1px solid var(--color-border)' }}>
                  <button className="btn-link" style={{ fontSize: 12 }} onClick={() => setNotifOpen(false)}>Dismiss all</button>
                </div>
              </div>
            )}
          </div>

          <button className="header-icon-btn" title="Settings" onClick={() => navigate('/settings')}>
            <Settings size={18} />
          </button>
          <div className="user-avatar" title={state.currentUser?.name || 'AJ'}>
            {(state.currentUser?.name || 'AJ').split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="app-nav">
        <div className="nav-tabs">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={`nav-tab ${isActive(item.to, item.exact) ? 'active' : ''}`}
              end={item.exact}
            >
              {item.label}
            </NavLink>
          ))}
          <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
            <button
              className="nav-tab"
              onClick={(e) => {
                const menu = e.currentTarget.nextElementSibling;
                if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
              }}
            >
              More <ChevronDown size={12} style={{ marginLeft: 4 }} />
            </button>
            <div className="dropdown-menu" style={{ display: 'none', left: 0, right: 'auto' }}>
              <button className="dropdown-item" onClick={() => navigate('/invoices')}>Billing</button>
              <button className="dropdown-item" onClick={() => navigate('/subscriptions')}>Subscriptions</button>
              <button className="dropdown-item" onClick={() => navigate('/disputes')}>Disputes</button>
            </div>
          </div>
        </div>

        <div className="nav-right">
          <NavLink to="/developers" className="nav-text-link">Developers</NavLink>
          <div className="test-mode-toggle">
            <span>Test mode</span>
            <div
              className={`toggle-switch ${state.testMode ? 'active' : ''}`}
              onClick={handleToggleTestMode}
              role="switch"
              aria-checked={state.testMode}
            />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="app-main">
        <Outlet context={{ addToast }} />
      </main>

      {/* Toast container */}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Close create dropdown on outside click */}
      {createMenuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50 }}
          onClick={() => setCreateMenuOpen(false)}
        />
      )}
    </div>
  );
}
