import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Home, List, Users, Building2, BarChart3, Settings, LayoutGrid } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const navItems = [
  { icon: Home, path: '/', label: 'Home' },
  { icon: List, path: '/views/1', label: 'Views' },
  { icon: Users, path: '/customers', label: 'Customers' },
  { icon: Building2, path: '/organizations', label: 'Organizations' },
  { icon: BarChart3, path: '/reporting', label: 'Reporting' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { state } = useApp();
  const { addToast } = useToast();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const adminRef = useRef(null);
  const productsRef = useRef(null);
  const avatarRef = useRef(null);

  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;

  // Click-outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAdminMenu && adminRef.current && !adminRef.current.contains(e.target)) {
        setShowAdminMenu(false);
      }
      if (showProductsMenu && productsRef.current && !productsRef.current.contains(e.target)) {
        setShowProductsMenu(false);
      }
      if (showAvatarMenu && avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowAvatarMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAdminMenu, showProductsMenu, showAvatarMenu]);

  const isActive = (item) => {
    if (item.path === '/') return location.pathname === '/';
    if (item.path.startsWith('/views')) return location.pathname.startsWith('/views') || location.pathname.startsWith('/tickets');
    return location.pathname.startsWith(item.path);
  };

  const sidebarDropdownStyle = {
    position: 'absolute',
    left: '100%',
    bottom: 0,
    marginLeft: 4,
    background: '#fff',
    border: '1px solid #D8DCDE',
    borderRadius: 4,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    minWidth: 180,
    zIndex: 200,
  };

  const sidebarDropdownItemStyle = {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    textAlign: 'left',
    fontFamily: 'var(--font-family)',
    color: '#2F3941',
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate(appendQuery('/'))}>
        <svg viewBox="0 0 26 26" fill="none">
          <path d="M13 0C5.82 0 0 5.82 0 13s5.82 13 13 13 13-5.82 13-13S20.18 0 13 0z" fill="#03363D"/>
          <path d="M18.5 8.5l-4.2 9.3h-2.6L7.5 8.5h2.8l2.7 6.2 2.7-6.2h2.8z" fill="#fff"/>
        </svg>
      </div>

      <div className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`sidebar-nav-item ${isActive(item) ? 'active' : ''}`}
            onClick={() => navigate(appendQuery(item.path))}
            title={item.label}
          >
            <item.icon />
          </button>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div style={{ position: 'relative' }} ref={adminRef}>
          <button
            className="sidebar-nav-item"
            title="Admin"
            onClick={() => { setShowAdminMenu(!showAdminMenu); setShowProductsMenu(false); setShowAvatarMenu(false); }}
          >
            <Settings />
          </button>
          {showAdminMenu && (
            <div style={sidebarDropdownStyle}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #D8DCDE', fontWeight: 600, fontSize: 13 }}>
                Admin Center
              </div>
              <button style={sidebarDropdownItemStyle} onClick={() => { addToast('Account settings not available in demo'); setShowAdminMenu(false); }}>
                Account Settings
              </button>
              <button style={sidebarDropdownItemStyle} onClick={() => { addToast('People management not available in demo'); setShowAdminMenu(false); }}>
                People
              </button>
              <button style={sidebarDropdownItemStyle} onClick={() => { addToast('Channels settings not available in demo'); setShowAdminMenu(false); }}>
                Channels
              </button>
              <button style={sidebarDropdownItemStyle} onClick={() => { addToast('Business rules not available in demo'); setShowAdminMenu(false); }}>
                Business Rules
              </button>
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }} ref={productsRef}>
          <button
            className="sidebar-nav-item"
            title="Products"
            onClick={() => { setShowProductsMenu(!showProductsMenu); setShowAdminMenu(false); setShowAvatarMenu(false); }}
          >
            <LayoutGrid />
          </button>
          {showProductsMenu && (
            <div style={sidebarDropdownStyle}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #D8DCDE', fontWeight: 600, fontSize: 13 }}>
                Products
              </div>
              <button style={{ ...sidebarDropdownItemStyle, color: '#1F73B7', fontWeight: 600 }} onClick={() => { setShowProductsMenu(false); }}>
                Support (Current)
              </button>
              <button style={sidebarDropdownItemStyle} onClick={() => { addToast('Chat product not available in demo'); setShowProductsMenu(false); }}>
                Chat
              </button>
              <button style={sidebarDropdownItemStyle} onClick={() => { addToast('Talk product not available in demo'); setShowProductsMenu(false); }}>
                Talk
              </button>
              <button style={sidebarDropdownItemStyle} onClick={() => { addToast('Guide product not available in demo'); setShowProductsMenu(false); }}>
                Guide
              </button>
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }} ref={avatarRef}>
          <div
            className="sidebar-avatar"
            title={state.currentUser.name}
            onClick={() => { setShowAvatarMenu(!showAvatarMenu); setShowAdminMenu(false); setShowProductsMenu(false); }}
          >
            {state.currentUser.initials}
          </div>
          {showAvatarMenu && (
            <div style={sidebarDropdownStyle}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #D8DCDE' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{state.currentUser.name}</div>
                <div style={{ fontSize: 12, color: '#87929D' }}>{state.currentUser.email}</div>
              </div>
              <button style={sidebarDropdownItemStyle} onClick={() => { addToast('Profile not available in demo'); setShowAvatarMenu(false); }}>
                Profile
              </button>
              <button style={sidebarDropdownItemStyle} onClick={() => { addToast('Sign out not available in demo'); setShowAvatarMenu(false); }}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
