import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, MessageCircle, ChevronDown, User, Settings, LogOut, Layout } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { relativeTime } from '../lib/utils';

const PinterestLogo = ({ size = 24 }) => (
  <svg height={size} width={size} viewBox="0 0 24 24" aria-label="Xinterest" role="img" fill="currentColor">
    <path d="M0 12c0 5.123 3.211 9.497 7.73 11.218-.11-.937-.227-2.482.025-3.566.217-.932 1.401-5.938 1.401-5.938s-.357-.715-.357-1.774c0-1.66.962-2.899 2.16-2.899 1.017 0 1.508.765 1.508 1.682 0 1.026-.653 2.56-1.01 3.982-.297 1.186.597 2.153 1.769 2.153 2.126 0 3.76-2.245 3.76-5.487 0-2.87-2.064-4.875-5.008-4.875-3.65 0-5.789 2.732-5.789 5.558 0 1.1.424 2.279.952 2.917.105.127.12.237.09.429-.098.636-.316 1.29-.358 1.465-.057.237-.233.287-.536.147-2.002-.932-3.256-3.854-3.256-6.205 0-5.053 3.674-9.696 10.59-9.696 5.56 0 9.874 3.96 9.874 9.24 0 5.514-3.475 9.942-8.293 9.942-1.62 0-3.14-.841-3.66-1.832l-.997 3.79c-.358 1.375-1.332 3.097-1.984 4.025 1.49.46 3.09.71 4.74.71 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12S0 5.373 0 12" />
  </svg>
);

const Navbar = () => {
  const { state, setSearchQuery, markNotificationRead, markAllNotificationsRead } = useStore();
  const [localSearch, setLocalSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  const unreadCount = state.notifications.filter(n => !n.read).length;

  const isActive = (path) => location.pathname === path;

  const runSearch = (query) => {
    if (!query.trim()) return;
    setLocalSearch(query);
    setSearchQuery(query);
    setShowSearchSuggestions(false);
    navigate('/search');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchSuggestions(false);
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const formValue = e.currentTarget.querySelector('input')?.value || localSearch;
    runSearch(formValue);
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    setShowSearchSuggestions(val.trim().length > 0);
  };

  const handleSuggestionClick = (title) => {
    runSearch(title);
  };

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    setShowNotifications(false);

    if (notif.type === 'follow' && notif.fromUserId) {
      navigate(`/profile/${notif.fromUserId}`);
    } else if (notif.targetId && notif.targetId.startsWith('p')) {
      navigate(`/pin/${notif.targetId}`);
    } else if (notif.targetId && notif.targetId.startsWith('b')) {
      navigate(`/board/${notif.targetId}`);
    }
  };

  // Search suggestions
  const searchSuggestions = localSearch.trim()
    ? state.pins
        .filter(p => p.title.toLowerCase().includes(localSearch.toLowerCase()))
        .slice(0, 8)
        .map(p => p.title)
        .filter((title, i, arr) => arr.indexOf(title) === i)
    : [];

  // Category suggestions when search is focused but empty
  const categorySuggestions = ['Home Decor', 'Recipes', 'Travel Ideas', 'Fashion Outfits', 'DIY Crafts', 'Art Inspiration', 'Wedding Planning', 'Fitness Tips'];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-[56px] bg-white z-50 flex items-center px-4 gap-2" style={{ boxShadow: '0 1px 0 0 #e5e5e0' }}>
        {/* Logo */}
        <Link to="/" className="p-2 rounded-full hover:bg-gray-100 flex items-center justify-center text-xinterest-red flex-shrink-0">
          <PinterestLogo size={24} />
        </Link>

        {/* Nav Links */}
        <Link
          to="/"
          className={`hidden md:flex px-4 py-2 rounded-full font-semibold text-[15px] transition-colors flex-shrink-0 ${
            isActive('/') ? 'bg-black text-white' : 'text-black hover:bg-gray-100'
          }`}
        >
          Home
        </Link>
        <Link
          to="/explore"
          className={`hidden md:flex px-4 py-2 rounded-full font-semibold text-[15px] transition-colors flex-shrink-0 ${
            isActive('/explore') ? 'bg-black text-white' : 'text-black hover:bg-gray-100'
          }`}
        >
          Explore
        </Link>
        <Link
          to="/create"
          className={`hidden md:flex px-4 py-2 rounded-full font-semibold text-[15px] transition-colors flex-shrink-0 ${
            isActive('/create') ? 'bg-black text-white' : 'text-black hover:bg-gray-100'
          }`}
        >
          Create
        </Link>

        {/* Search Bar */}
        <div className="flex-1 mx-2 relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-xinterest-olive-gray">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search"
              className={`w-full pl-10 pr-4 py-[10px] rounded-full text-[15px] outline-none transition-all ${
                searchFocused
                  ? 'bg-white border-2 border-xinterest-focus-blue shadow-sm'
                  : 'bg-[#e5e5e0] hover:bg-[#d5d5d0] border-2 border-transparent'
              }`}
              value={localSearch}
              onChange={handleSearchInput}
              onInput={handleSearchInput}
              onFocus={() => {
                setSearchFocused(true);
                if (localSearch.trim()) setShowSearchSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  runSearch(e.currentTarget.value);
                }
              }}
            />
          </form>

          {/* Search Suggestions Dropdown */}
          {searchFocused && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden max-h-[400px] overflow-y-auto">
              {showSearchSuggestions && searchSuggestions.length > 0 ? (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400">Suggestions</div>
                  {searchSuggestions.map((title, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-[14px]"
                      onClick={() => handleSuggestionClick(title)}
                    >
                      <Search size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate font-medium">{title}</span>
                    </button>
                  ))}
                </>
              ) : !localSearch.trim() ? (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400">Popular searches</div>
                  {categorySuggestions.map((cat, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-[14px]"
                      onClick={() => handleSuggestionClick(cat)}
                    >
                      <Search size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate font-medium">{cat}</span>
                    </button>
                  ))}
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600 relative"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              title="Notifications"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-xinterest-red rounded-full text-white text-[11px] font-bold flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-[380px] max-h-[480px] bg-white rounded-2xl shadow-xl border border-gray-200 z-50 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                  <h3 className="font-bold text-lg">Updates</h3>
                  {unreadCount > 0 && (
                    <button
                      className="text-sm text-gray-500 hover:text-black font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllNotificationsRead();
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto flex-1">
                  {state.notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    state.notifications
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .map(notif => {
                        const fromUser = notif.fromUserId
                          ? state.users.find(u => u.id === notif.fromUserId)
                          : null;
                        const targetPin = notif.targetId && notif.targetId.startsWith('p')
                          ? state.pins.find(p => p.id === notif.targetId)
                          : null;

                        return (
                          <button
                            key={notif.id}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors ${
                              !notif.read ? 'bg-red-50' : ''
                            }`}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            {fromUser ? (
                              <img
                                src={fromUser.avatar}
                                alt={fromUser.name}
                                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-xinterest-red flex items-center justify-center flex-shrink-0">
                                <PinterestLogo size={18} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] leading-snug">
                                {fromUser && <span className="font-bold">{fromUser.name} </span>}
                                {notif.message.replace(fromUser?.name || '', '').trim()}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {relativeTime(notif.createdAt)}
                              </p>
                            </div>
                            {targetPin && (
                              <img
                                src={targetPin.image}
                                alt=""
                                className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                          </button>
                        );
                      })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <Link
            to="/messages"
            className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600"
            title="Messages"
          >
            <MessageCircle size={22} />
          </Link>

          {/* User Avatar */}
          <Link to={`/profile/${state.currentUser.id}`} className="p-1 rounded-full hover:bg-gray-100 ml-0.5">
            <img
              src={state.currentUser.avatar}
              alt="Profile"
              className="w-7 h-7 rounded-full object-cover"
            />
          </Link>

          {/* User Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              className="p-1 rounded-full hover:bg-gray-100"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
            >
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-[240px] bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-bold text-sm">{state.currentUser.name}</p>
                  <p className="text-xs text-gray-500">@{state.currentUser.username}</p>
                  {state.currentUser.monthlyViews > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{state.currentUser.monthlyViews.toLocaleString()} monthly views</p>
                  )}
                </div>

                <div className="py-1">
                  <button
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-100 text-sm flex items-center gap-3"
                    onClick={() => { setShowUserMenu(false); navigate(`/profile/${state.currentUser.id}`); }}
                  >
                    <User size={16} className="text-gray-500" />
                    Your profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-100 text-sm flex items-center gap-3"
                    onClick={() => { setShowUserMenu(false); navigate(`/profile/${state.currentUser.id}`); }}
                  >
                    <Layout size={16} className="text-gray-500" />
                    Your boards
                  </button>
                  <button
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-100 text-sm flex items-center gap-3"
                    onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  >
                    <Settings size={16} className="text-gray-500" />
                    Settings
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-100 text-sm flex items-center gap-3"
                    onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  >
                    <LogOut size={16} className="text-gray-500" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
