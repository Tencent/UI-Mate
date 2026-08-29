import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Search, HelpCircle, Menu, User, FileText, Calendar, Shield, DollarSign, Inbox, Book, MessageCircle, Phone, Settings, LogOut } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

function NotificationDropdown({ notifications, dispatch, onClose }) {
  const navigate = useNavigate();

  const timeSince = (dateStr) => {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const typeColors = {
    task: 'bg-blue-500',
    pay: 'bg-green-500',
    timeoff: 'bg-orange-500',
    system: 'bg-gray-400',
  };

  const handleClick = (notif) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id });
    if (notif.link) navigate(notif.link);
    onClose();
  };

  const handleMarkAllRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  };

  return (
    <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
        <button
          onClick={handleMarkAllRead}
          className="text-xs text-primary hover:text-primary-hover font-medium"
        >
          Mark all as read
        </button>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            No notifications
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`p-3 flex items-start gap-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${
                !notif.read ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${typeColors[notif.type] || 'bg-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {notif.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                <p className="text-[11px] text-gray-400 mt-1">{timeSince(notif.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Header({ onToggleSidebar, onOpenGlobalNav }) {
  const { state, dispatch } = useStore();
  const { currentUser, notifications, employees } = state;
  const navigate = useNavigate();
  const unreadCount = (notifications || []).filter(n => !n.read).length;
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const [showHelp, setShowHelp] = useState(false);
  const helpRef = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [accountDialog, setAccountDialog] = useState(null);
  const profileRef = useRef(null);

  // Predictive search items
  const searchItems = useMemo(() => {
    const pages = [
      { label: 'Dashboard', type: 'page', icon: 'home', path: '/' },
      { label: 'Inbox & Tasks', type: 'page', icon: 'inbox', path: '/inbox' },
      { label: 'Time & Absence', type: 'page', icon: 'clock', path: '/time' },
      { label: 'Pay & Tax', type: 'page', icon: 'pay', path: '/pay' },
      { label: 'Benefits', type: 'page', icon: 'shield', path: '/benefits' },
      { label: 'Performance & Talent', type: 'page', icon: 'star', path: '/performance' },
      { label: 'My Profile', type: 'page', icon: 'user', path: '/profile' },
      { label: 'Directory', type: 'page', icon: 'users', path: '/directory' },
      { label: 'Request Time Off', type: 'action', icon: 'calendar', path: '/time' },
      { label: 'View Payslips', type: 'action', icon: 'doc', path: '/pay' },
      { label: 'View Benefits', type: 'action', icon: 'shield', path: '/benefits' },
      { label: 'Review Goals', type: 'action', icon: 'star', path: '/performance' },
    ];

    const empItems = (employees || []).map(emp => ({
      label: emp.name,
      subtitle: `${emp.title} - ${emp.department}`,
      type: 'employee',
      icon: 'user',
      avatar: emp.avatar,
      path: emp.id === currentUser.id ? '/profile' : '/directory',
    }));

    return [...pages, ...empItems];
  }, [employees, currentUser.id]);

  const filteredSearch = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return searchItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [searchQuery, searchItems]);

  const getSearchIcon = (icon) => {
    switch (icon) {
      case 'inbox': return <Inbox size={16} />;
      case 'calendar': return <Calendar size={16} />;
      case 'pay': case 'doc': return <DollarSign size={16} />;
      case 'shield': return <Shield size={16} />;
      case 'user': case 'users': return <User size={16} />;
      default: return <FileText size={16} />;
    }
  };

  // Close on click outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
      if (helpRef.current && !helpRef.current.contains(e.target)) {
        setShowHelp(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-20">
      {/* Left side: hamburger + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenGlobalNav || onToggleSidebar}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        {/* Xorkday logo: blue W with orange arc */}
        <div className="flex items-center gap-1.5">
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              W
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-xorkday-orange rounded-tr-full"></div>
          </div>
          <span className="font-bold text-lg text-gray-800 tracking-tight hidden sm:block">
            xorkday
          </span>
        </div>
      </div>

      {/* Center: search bar with predictive results */}
      <div className="flex-1 max-w-xl mx-4" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search people, pages, actions..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => { if (searchQuery.trim()) setShowSearch(true); }}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-full text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
          {showSearch && filteredSearch.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {filteredSearch.map((item, i) => (
                <div
                  key={i}
                  onClick={() => {
                    navigate(item.path);
                    setSearchQuery('');
                    setShowSearch(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                >
                  {item.avatar ? (
                    <img src={item.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      {getSearchIcon(item.icon)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                    {item.subtitle && <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    item.type === 'page' ? 'bg-blue-100 text-blue-700' :
                    item.type === 'action' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.type === 'page' ? 'Page' : item.type === 'action' ? 'Action' : 'Person'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: help, bell, profile */}
      <div className="flex items-center gap-2">
        {/* Help button with dropdown */}
        <div className="relative" ref={helpRef}>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Help"
          >
            <HelpCircle size={20} />
          </button>
          {showHelp && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Help & Support</h3>
              </div>
              <div className="py-1">
                {[
                  { icon: <Book size={16} />, label: 'Help Center', desc: 'Browse knowledge articles' },
                  { icon: <MessageCircle size={16} />, label: 'Contact HR', desc: 'Ask HR a question' },
                  { icon: <Phone size={16} />, label: 'IT Support', desc: 'Report a technical issue' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setShowHelp(false)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="text-gray-400 mt-0.5">{item.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification bell with dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown
              notifications={notifications || []}
              dispatch={dispatch}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        {/* Profile avatar with dropdown menu */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="focus:outline-none"
            aria-label="Profile menu"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full border-2 border-gray-200 object-cover cursor-pointer hover:border-primary transition-colors"
            />
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <User size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">My Profile</span>
                </button>
                <button
                  onClick={() => { setShowProfileMenu(false); setAccountDialog('settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <Settings size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">Settings</span>
                </button>
              </div>
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={() => { setShowProfileMenu(false); setAccountDialog('signout'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left text-red-600"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {accountDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setAccountDialog(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {accountDialog === 'settings' ? 'Account Settings' : 'Sign Out'}
              </h2>
              <button onClick={() => setAccountDialog(null)} className="text-gray-400 hover:text-gray-600">
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
            <div className="p-5 text-sm text-gray-600 space-y-3">
              {accountDialog === 'settings' ? (
                <>
                  <p>Manage local sandbox preferences and profile details for this Xorkday session.</p>
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <p className="font-medium text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                  </div>
                </>
              ) : (
                <>
                  <p>This sandbox keeps you signed in so training tasks remain deterministic.</p>
                  <p>Use Reset State from the task harness to clear session data.</p>
                </>
              )}
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              {accountDialog === 'settings' && (
                <button
                  onClick={() => { setAccountDialog(null); navigate('/profile'); }}
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover"
                >
                  Open Profile
                </button>
              )}
              <button
                onClick={() => setAccountDialog(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
