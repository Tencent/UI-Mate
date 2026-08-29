import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Search, Bell, Mail, Settings, HelpCircle, ChevronDown, X, AlertTriangle, CheckCircle, Info, AlertCircle, User, Shield, CreditCard, BookOpen, MessageCircle, FileText, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

function NotificationIcon({ type }) {
  const props = { size: 16 };
  if (type === 'warning') return <AlertTriangle {...props} style={{ color: '#b7791f' }} />;
  if (type === 'error') return <AlertCircle {...props} style={{ color: '#d13212' }} />;
  if (type === 'success') return <CheckCircle {...props} style={{ color: '#067d62' }} />;
  return <Info {...props} style={{ color: '#007185' }} />;
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return [open, setOpen, ref];
}

const dropdownStyle = {
  position: 'absolute', top: 42, right: 0, background: 'white',
  border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 200, minWidth: 220,
};

const dropItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
  cursor: 'pointer', fontSize: 13, color: '#111', textDecoration: 'none',
  borderBottom: '1px solid #f0f0f0',
};

export default function TopNav({ onHamburger }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen, notifRef] = useDropdown();
  const [helpOpen, setHelpOpen, helpRef] = useDropdown();
  const [nameOpen, setNameOpen, nameRef] = useDropdown();
  const [searchVal, setSearchVal] = useState('');

  if (!state) return null;

  const unreadCount = state.seller.notificationCount;
  const unreadMessages = state.seller.unreadMessages;

  const markAllRead = () => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  const markRead = (id) => {
    const notif = state.notifications.find(n => n.id === id);
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    if (notif && notif.actionUrl) navigate(notif.actionUrl);
    setNotifOpen(false);
  };

  const navAndClose = (path, closeFn) => {
    navigate(path);
    closeFn(false);
  };

  const helpItems = [
    { icon: <BookOpen size={15} />, label: 'Seller University', path: '/growth' },
    { icon: <FileText size={15} />, label: 'Selling Policies', path: '/account-health' },
    { icon: <MessageCircle size={15} />, label: 'Contact Seller Support', path: '/messages' },
    { icon: <Info size={15} />, label: 'Help & Customer Service', path: '/feedback' },
    { icon: <ExternalLink size={15} />, label: 'Seller Forums', path: '/feedback' },
  ];

  const nameItems = [
    { icon: <User size={15} />, label: 'Account Info', path: '/account-info' },
    { icon: <Shield size={15} />, label: 'Login & Security', path: '/settings' },
    { icon: <CreditCard size={15} />, label: 'Payment Methods', path: '/payments' },
    { icon: <Settings size={15} />, label: 'Account Settings', path: '/settings' },
  ];

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 50, background: '#232f3e', zIndex: 1000, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 0 }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onHamburger} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
          <Menu size={20} color="white" />
        </button>
        <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none' }}>
          <span style={{ color: 'white', fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1 }}>amazon</span>
          <span style={{ color: '#ff9900', fontSize: 10, lineHeight: 1 }}>seller central</span>
        </Link>
      </div>

      {/* Center: Search */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: 4, maxWidth: 400, width: '100%', height: 34 }}>
          <Search size={16} color="#888" style={{ marginLeft: 8, flexShrink: 0 }} />
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && searchVal.trim()) navigate(`/inventory?search=${encodeURIComponent(searchVal.trim())}`) }}
            placeholder="Search Seller Central"
            style={{ border: 'none', outline: 'none', flex: 1, padding: '0 8px', fontSize: 13, height: '100%', borderRadius: 4 }}
          />
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        {/* Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Bell size={20} color="white" />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#d13212', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: '50%', minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div style={{ position: 'absolute', top: 36, right: 0, width: 320, maxHeight: 400, overflowY: 'auto', background: 'white', border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 200 }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
                <button onClick={markAllRead} className="btn-link" style={{ fontSize: 12 }}>Mark all read</button>
              </div>
              {state.notifications.map(n => (
                <div key={n.id} onClick={() => markRead(n.id)} style={{ padding: '10px 12px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', gap: 8, background: n.isRead ? 'white' : '#f9fafb', borderLeft: n.isRead ? 'none' : '3px solid #ff9900' }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}><NotificationIcon type={n.type} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 700 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: '16px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{timeAgo(n.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* US Flag */}
        <span style={{ color: 'white', fontSize: 13 }}>🇺🇸</span>

        {/* Mail */}
        <button onClick={() => navigate('/messages')} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Mail size={20} color="white" />
          {unreadMessages > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, background: '#d13212', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: '50%', minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
              {unreadMessages}
            </span>
          )}
        </button>

        <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Settings size={20} color="white" />
        </button>

        {/* Help dropdown */}
        <div ref={helpRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setHelpOpen(!helpOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: 13, display: 'flex', alignItems: 'center', gap: 3 }}
          >
            <HelpCircle size={16} color="white" />
            <span>Help</span>
            <ChevronDown size={12} color="white" style={{ opacity: 0.7 }} />
          </button>
          {helpOpen && (
            <div style={dropdownStyle}>
              <div style={{ padding: '8px 14px 6px', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Help & Support
              </div>
              {helpItems.map((item, i) => (
                <div
                  key={i}
                  onClick={() => navAndClose(item.path, setHelpOpen)}
                  style={{ ...dropItemStyle, borderBottom: i < helpItems.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f7f8fa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <span style={{ color: '#555' }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Name dropdown */}
        <div ref={nameRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNameOpen(!nameOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, maxWidth: 130, padding: 0 }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{state.seller.displayName}</span>
            <ChevronDown size={12} color="white" style={{ flexShrink: 0, opacity: 0.7 }} />
          </button>
          {nameOpen && (
            <div style={dropdownStyle}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #eee', background: '#f7f8fa' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{state.seller.displayName}</div>
                <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{state.seller.email}</div>
              </div>
              {nameItems.map((item, i) => (
                <div
                  key={i}
                  onClick={() => navAndClose(item.path, setNameOpen)}
                  style={{ ...dropItemStyle, borderBottom: i < nameItems.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f7f8fa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <span style={{ color: '#555' }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
