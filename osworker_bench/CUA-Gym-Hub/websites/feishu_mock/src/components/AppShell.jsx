import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import UserProfilePopover from './UserProfilePopover';
import GlobalSearch from './GlobalSearch';

const modules = [
  { id: 'messenger', label: '消息', path: '/messenger', icon: ChatIcon },
  { id: 'calendar', label: '日历', path: '/calendar', icon: CalendarIcon },
  { id: 'docs', label: '云文档', path: '/docs', icon: DocIcon },
  { id: 'meetings', label: '会议', path: '/meetings', icon: MeetingIcon },
  { id: 'workbench', label: '工作台', path: '/workbench', icon: WorkbenchIcon },
  { id: 'contacts', label: '通讯录', path: '/contacts', icon: ContactsIcon },
];

export default function AppShell() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const activeModule = modules.find(m => location.pathname.startsWith(m.path))?.id || 'messenger';

  // Calculate total unread for messenger badge
  const totalUnread = state.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  function handleModuleClick(mod) {
    dispatch({ type: 'SET_ACTIVE_MODULE', payload: mod.id });
    navigate(mod.path);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Icon Sidebar */}
      <div style={{
        width: 64,
        minWidth: 64,
        background: '#F0F1F2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 8,
        borderRight: '1px solid #DEE0E3',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ width: 36, height: 36, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FeishuLogo />
        </div>

        {/* Module icons */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 4 }}>
          {modules.map(mod => {
            const isActive = activeModule === mod.id;
            const Icon = mod.icon;
            const badge = mod.id === 'messenger' ? totalUnread : 0;
            return (
              <button
                key={mod.id}
                title={mod.label}
                onClick={() => handleModuleClick(mod)}
                style={{
                  width: 48,
                  height: 48,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? '#E1EAFF' : 'transparent',
                  color: isActive ? '#3370FF' : '#646A73',
                  transition: 'background 0.15s, color 0.15s',
                  position: 'relative',
                  gap: 1,
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#E5E6E7'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = isActive ? '#E1EAFF' : 'transparent'; } }}
              >
                <Icon size={18} active={isActive} />
                <span style={{ fontSize: 10, lineHeight: '12px', fontWeight: isActive ? 500 : 400 }}>{mod.label}</span>
                {badge > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    minWidth: 14, height: 14, borderRadius: 7,
                    background: '#F54A45', color: '#fff', fontSize: 9, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px', lineHeight: 1,
                  }}>{badge > 99 ? '99+' : badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom: Search + Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button
            title="搜索"
            onClick={() => setShowSearch(true)}
            style={{
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: '#646A73',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E5E6E7'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <SearchIcon size={18} />
          </button>
          <button
            title={state.currentUser.name}
            onClick={() => setShowProfile(true)}
            style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: state.currentUser.avatarColor || '#3370FF',
              color: '#fff', fontWeight: 600, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}
          >
            {state.currentUser.initials || state.currentUser.name?.[0]}
            {/* Online status dot */}
            <span style={{
              position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%',
              background: state.currentUser.status === 'online' ? '#34C724' : state.currentUser.status === 'busy' ? '#FF7D00' : '#8F959E',
              border: '1.5px solid #F0F1F2',
            }} />
          </button>
        </div>
      </div>

      {/* Content (Module Panel + Content Area) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Outlet />
      </div>

      {/* Modals/Popovers */}
      {showProfile && <UserProfilePopover onClose={() => setShowProfile(false)} />}
      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
    </div>
  );
}

// ─── SVG Icons ───────────────────────────────────────────
function FeishuLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#3370FF" />
      <path d="M7.5 10.5C9.5 8 12 7 14.5 7.5C13 9 12 11.5 12 14C12 16.5 13.5 18.5 15.5 19.5C13 20.5 10 20 7.5 17.5C6 15.5 6 12.5 7.5 10.5Z" fill="white" opacity="0.9" />
      <path d="M15 8C17 7.5 19 8 20.5 10C22 12 22 14.5 20.5 16.5C18.5 19 16 20 13.5 19.5C15 18 16 15.5 16 13C16 10.5 15 9 15 8Z" fill="white" opacity="0.6" />
    </svg>
  );
}

function ChatIcon({ size = 20, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function CalendarIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function DocIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function MeetingIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}

function WorkbenchIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ContactsIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function SearchIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
