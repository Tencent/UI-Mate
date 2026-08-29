import { useState, useEffect } from 'react';
import { NavLink, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, ChevronDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import SearchModal from '../SearchModal/SearchModal';
import NotificationsPanel from '../NotificationsPanel/NotificationsPanel';

function GreenhouseLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="13" stroke="#3B8427" strokeWidth="2" fill="none"/>
      <path d="M14 7C10.134 7 7 10.134 7 14C7 17.866 10.134 21 14 21H20V17H14C12.343 17 11 15.657 11 14C11 12.343 12.343 11 14 11H20V7H14Z" fill="#3B8427"/>
    </svg>
  );
}

function Avatar({ user, size = 'sm' }) {
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U';
  return (
    <div className={`avatar avatar-${size}`} style={{ background: '#3B8427', color: 'white', width: 32, height: 32, fontSize: 13, fontWeight: 600, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export default function TopNav() {
  const { state, dispatch } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  const unreadCount = state.notifications.filter(n => !n.isRead).length;

  const handleSettingsClick = () => {
    navigate(buildLink('/settings'));
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && !showSearch) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        e.preventDefault();
        setShowSearch(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showSearch]);

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Jobs', path: '/jobs' },
    { label: 'Candidates', path: '/candidates' },
    { label: 'Interviews', path: '/interviews' },
    { label: 'Reports', path: '/reports' },
  ];

  return (
    <>
      <nav style={{
        background: '#1B3A2D',
        height: 56,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Left: Logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <GreenhouseLogo />
          <span style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>Recruiting</span>
        </div>

        {/* Center: Nav tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, padding: '0 32px' }}>
          {navLinks.map(link => (
            <NavLink
              key={link.path}
              to={buildLink(link.path)}
              style={({ isActive }) => ({
                color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                fontSize: 14,
                fontWeight: 500,
                padding: '8px 16px',
                borderRadius: 4,
                textDecoration: 'none',
                borderBottom: isActive ? '2px solid white' : '2px solid transparent',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right: icons + user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <button
            aria-label="Open search"
            onClick={() => setShowSearch(true)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
          >
            <Search size={18} />
          </button>

          <div style={{ position: 'relative' }}>
            <button
              aria-label="Open settings"
              onClick={handleSettingsClick}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>

          {/* Notifications bell */}
          <div style={{ position: 'relative' }}>
            <button
              aria-label="Open notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
            >
              <Bell size={18} />
            </button>
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute',
                top: -2,
                right: -2,
                background: '#DC2626',
                color: 'white',
                borderRadius: '50%',
                width: 16,
                height: 16,
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
            {showNotifications && (
              <NotificationsPanel onClose={() => setShowNotifications(false)} />
            )}
          </div>

          {/* User greeting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
            <span>Hi {state.currentUser.firstName}</span>
            <Avatar user={state.currentUser} />
          </div>
        </div>
      </nav>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
}
