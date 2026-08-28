import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, Plus, ArrowBigUp, Gift, AtSign, X, User, Settings, LogOut, Moon, ChevronDown, Menu } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../lib/store';

function NotificationIcon({ type }) {
  switch (type) {
    case 'upvote':
      return <ArrowBigUp className="w-4 h-4 text-[#FF4500]" />;
    case 'award':
      return <Gift className="w-4 h-4 text-yellow-500" />;
    case 'mention':
      return <AtSign className="w-4 h-4 text-[#0079D3]" />;
    case 'reply':
    case 'post_reply':
    default:
      return <MessageSquare className="w-4 h-4 text-[#0079D3]" />;
  }
}

export default function Navbar({ onMenuToggle }) {
  const { state, actions } = useStore();
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const messagesRef = useRef(null);
  const userMenuRef = useRef(null);

  const unreadCount = (state.notifications || []).filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(e.target)) {
        setShowMessages(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleNotifClick = (notif) => {
    actions.markNotificationRead(notif.id);
    if (notif.postId) {
      navigate(`/post/${notif.postId}`);
    }
    setShowNotifications(false);
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    actions.markAllNotificationsRead();
  };

  const totalKarma = (state.currentUser.postKarma || 0) + (state.currentUser.commentKarma || 0);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#EDEFF1] h-12 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Hamburger menu for mobile */}
        <button
          onClick={onMenuToggle}
          className="md:hidden hover:bg-[#F6F7F8] p-2 rounded-full text-[#787C7E]"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FF4500] flex items-center justify-center text-white font-bold text-xl">
            r
          </div>
          <span className="hidden md:block font-bold text-xl text-[#1C1C1C]">xeddit</span>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl px-4">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#787C7E]" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-1.5 border border-[#EDEFF1] rounded-full leading-5 bg-[#F6F7F8] placeholder-[#787C7E] focus:outline-none focus:bg-white focus:border-[#0079D3] focus:ring-1 focus:ring-[#0079D3] sm:text-sm transition-colors"
            placeholder="Search Xeddit"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link to="/submit" className="hidden sm:flex items-center gap-2 text-[#787C7E] hover:bg-[#F6F7F8] px-3 py-1.5 rounded-full border border-transparent hover:border-[#EDEFF1]">
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Create</span>
        </Link>

        <div className="flex items-center gap-1 text-[#787C7E]">
          {/* Bell icon with dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); setShowUserMenu(false); }}
              className="hover:bg-[#F6F7F8] p-2 rounded-full relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-1 w-[360px] bg-white rounded-md shadow-xl border border-[#EDEFF1] z-[200] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDEFF1]">
                  <span className="font-bold text-[#1C1C1C] text-sm">Notifications</span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-[#0079D3] hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[#787C7E] hover:text-[#1C1C1C] p-0.5 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notification list */}
                <div className="max-h-[420px] overflow-y-auto">
                  {(state.notifications || []).length === 0 ? (
                    <div className="text-center py-10 text-[#A8AAAB]">
                      <Bell className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    (state.notifications || []).map(notif => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-[#F6F7F8] border-b border-[#EDEFF1] last:border-0 transition-colors"
                      >
                        {/* Unread indicator */}
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full" style={{ backgroundColor: notif.read ? 'transparent' : '#0079D3' }} />
                        {/* Notif icon */}
                        <div className="flex-shrink-0 w-8 h-8 bg-[#F6F7F8] rounded-full flex items-center justify-center">
                          <NotificationIcon type={notif.type} />
                        </div>
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${notif.read ? 'text-[#787C7E]' : 'text-[#1C1C1C] font-medium'}`}>
                            {notif.content || notif.text}
                          </p>
                          <p className="text-[11px] text-[#A8AAAB] mt-0.5">
                            {notif.created ? formatDistanceToNow(new Date(notif.created)) + ' ago' : ''}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat/Messages icon with dropdown */}
          <div className="relative" ref={messagesRef}>
            <button
              onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); setShowUserMenu(false); }}
              className="hover:bg-[#F6F7F8] p-2 rounded-full"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            {showMessages && (
              <div className="absolute right-0 top-full mt-1 w-[320px] bg-white rounded-md shadow-xl border border-[#EDEFF1] z-[200] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDEFF1]">
                  <span className="font-bold text-[#1C1C1C] text-sm">Messages</span>
                  <button onClick={() => setShowMessages(false)} className="text-[#787C7E] hover:text-[#1C1C1C] p-0.5 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="py-10 text-center text-[#A8AAAB]">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Start a conversation with another Redditor</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); setShowMessages(false); }}
            className="flex items-center gap-2 hover:bg-[#F6F7F8] p-1 pr-2 rounded-md border border-transparent hover:border-[#EDEFF1]"
          >
            <div className="w-6 h-6 relative">
              <img
                src={state.currentUser.avatar}
                alt={state.currentUser.username}
                className="w-full h-full rounded-sm object-cover"
              />
            </div>
            <div className="hidden lg:flex flex-col text-xs">
              <span className="font-medium text-[#1C1C1C]">{state.currentUser.username}</span>
              <span className="text-[#A8AAAB]">{totalKarma.toLocaleString()} karma</span>
            </div>
            <ChevronDown className="hidden lg:block w-3 h-3 text-[#787C7E]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-[220px] bg-white rounded-md shadow-xl border border-[#EDEFF1] z-[200] py-1 animate-fade-in">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-[#EDEFF1]">
                <div className="flex items-center gap-2">
                  <img src={state.currentUser.avatar} className="w-8 h-8 rounded-full" alt="" />
                  <div>
                    <div className="text-sm font-bold text-[#1C1C1C]">{state.currentUser.username}</div>
                    <div className="text-xs text-[#A8AAAB]">{totalKarma.toLocaleString()} karma</div>
                  </div>
                </div>
              </div>
              <Link
                to={`/user/${state.currentUser.id}`}
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1C1C1C] hover:bg-[#F6F7F8]"
              >
                <User className="w-4 h-4 text-[#787C7E]" />
                My Profile
              </Link>
              <button
                onClick={() => { setDarkMode(!darkMode); setShowUserMenu(false); }}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-[#1C1C1C] hover:bg-[#F6F7F8]"
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-[#787C7E]" />
                  Dark Mode
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors ${darkMode ? 'bg-[#0079D3]' : 'bg-[#EDEFF1]'} relative`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                </div>
              </button>
              <div className="border-t border-[#EDEFF1] my-1"></div>
              <button
                onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1C1C1C] hover:bg-[#F6F7F8]"
              >
                <LogOut className="w-4 h-4 text-[#787C7E]" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
