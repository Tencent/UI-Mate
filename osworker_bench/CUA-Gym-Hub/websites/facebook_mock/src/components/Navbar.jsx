import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, Users, MonitorPlay, Store, Bell, MessageCircle, Menu, Grid, ChevronDown, X, Settings, LogOut, Moon } from 'lucide-react';
import { useApp } from '../store/AppContext';
import NotificationsDropdown from './NotificationsDropdown';
import MessengerDropdown from './MessengerDropdown';

const Navbar = () => {
  const { state, currentUser, isChatOpen, setIsChatOpen, isNotificationsOpen, setIsNotificationsOpen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const searchRef = useRef(null);
  const accountMenuRef = useRef(null);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/friends')) return 'friends';
    if (path.startsWith('/watch')) return 'watch';
    if (path.startsWith('/marketplace')) return 'marketplace';
    if (path.startsWith('/groups')) return 'groups';
    return '';
  };

  const activeTab = getActiveTab();

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Search results computation
  const getSearchResults = () => {
    if (!searchQuery.trim() || !state) return { users: [], posts: [], groups: [], pages: [] };
    const q = searchQuery.toLowerCase();

    const users = Object.values(state.users || {})
      .filter(u => u.id !== currentUser?.id && u.name.toLowerCase().includes(q))
      .slice(0, 3);

    const posts = (state.posts || [])
      .filter(p => p.content.toLowerCase().includes(q) && !p.groupId && !p.pageId)
      .slice(0, 3);

    const groups = (state.groups || [])
      .filter(g => g.name.toLowerCase().includes(q))
      .slice(0, 2);

    const pages = (state.pages || [])
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 2);

    return { users, posts, groups, pages };
  };

  const results = getSearchResults();
  const hasResults = results.users.length + results.posts.length + results.groups.length + results.pages.length > 0;

  const NavItem = ({ icon: Icon, id, path = '/' }) => (
    <div
      className={`flex-1 flex justify-center items-center h-full cursor-pointer relative group ${activeTab === id ? 'text-primary' : 'text-gray-500 hover:bg-gray-100 rounded-lg'}`}
      onClick={() => navigate(path)}
    >
      <div className="relative">
        <Icon size={28} strokeWidth={activeTab === id ? 2.5 : 2} />
      </div>
      {activeTab === id && (
        <div className="absolute bottom-0 w-full h-1 bg-primary rounded-t-md transform translate-y-[1px]"></div>
      )}
      <div className="absolute inset-0 bg-transparent group-hover:bg-gray-100/50 rounded-lg transition-colors -z-10"></div>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-50 flex items-center justify-between px-4">
      {/* Left: Logo & Search */}
      <div className="flex items-center gap-2 w-[300px]">
        <Link to="/" className="text-primary flex-shrink-0">
          <svg viewBox="0 0 36 36" className="fill-current h-10 w-10" height="40" width="40">
            <path d="M20.181 35.87C29.094 34.791 36 27.202 36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.442 5.811 15.526 13.652 17.471L14 27.435v-9.177h-3.48v-4.654H14v-3.612c0-3.243 1.992-5.856 5.404-5.856 1.637 0 2.829.115 3.162.169v3.679h-2.504c-1.582 0-1.64 1.012-1.64 2.019v3.6h4.335l-.66 4.654h-3.675v10.204c2.038.264 2.12.308 2.12.308z"></path>
          </svg>
        </Link>

        {/* Search bar */}
        <div className="relative" ref={searchRef}>
          <div
            className="relative bg-gray-100 rounded-full h-10 w-10 lg:w-[240px] flex items-center lg:px-3 justify-center lg:justify-start hover:bg-gray-200 transition-colors"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="text-gray-500 flex-shrink-0" size={20} />
            <input
              type="text"
              placeholder="Search Xacebook"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              className="hidden lg:block bg-transparent border-none outline-none ml-2 text-[15px] placeholder-gray-500 w-full"
            />
            {searchQuery && (
              <button
                className="hidden lg:flex absolute right-3 text-gray-500 hover:text-gray-700"
                onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {searchOpen && searchQuery.trim() && (
            <div className="absolute top-full left-0 mt-1 w-[340px] bg-white rounded-lg shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto z-50">
              {!hasResults ? (
                <div className="p-4 text-center text-gray-500 text-[15px]">
                  No results for "{searchQuery}"
                </div>
              ) : (
                <div>
                  {results.users.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-500 uppercase tracking-wide">People</p>
                      {results.users.map(user => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => { navigate(`/profile/${user.id}`); setSearchOpen(false); setSearchQuery(''); }}
                        >
                          <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-[15px]">{user.name}</p>
                            {user.bio && <p className="text-[13px] text-gray-500 truncate max-w-[200px]">{user.bio}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.groups.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-500 uppercase tracking-wide">Groups</p>
                      {results.groups.map(group => (
                        <div
                          key={group.id}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => { navigate('/groups'); setSearchOpen(false); setSearchQuery(''); }}
                        >
                          <img src={group.cover} alt={group.name} className="w-9 h-9 rounded-lg object-cover" />
                          <div>
                            <p className="font-semibold text-[15px]">{group.name}</p>
                            <p className="text-[13px] text-gray-500">{group.members.length} members</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.pages.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-500 uppercase tracking-wide">Pages</p>
                      {results.pages.map(page => (
                        <div
                          key={page.id}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => { navigate(`/pages/${page.id}`); setSearchOpen(false); setSearchQuery(''); }}
                        >
                          <img src={page.avatar} alt={page.name} className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-[15px]">{page.name}</p>
                            {page.category && <p className="text-[13px] text-gray-500">{page.category}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.posts.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-500 uppercase tracking-wide">Posts</p>
                      {results.posts.map(post => (
                        <div
                          key={post.id}
                          className="flex items-start gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => { navigate('/'); setSearchOpen(false); setSearchQuery(''); }}
                        >
                          {post.image && (
                            <img src={post.image} alt="Post" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-[15px] line-clamp-2">{post.content.slice(0, 80)}...</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center: Navigation */}
      <div className="hidden md:flex items-center justify-center flex-1 h-full max-w-[600px] gap-1">
        <NavItem icon={Home} id="home" path="/" />
        <NavItem icon={Users} id="friends" path="/friends" />
        <NavItem icon={MonitorPlay} id="watch" path="/watch" />
        <NavItem icon={Store} id="marketplace" path="/marketplace" />
        <NavItem icon={Grid} id="groups" path="/groups" />
      </div>

      {/* Right: Profile & Tools */}
      <div className="flex items-center justify-end gap-2 w-[300px] relative">
        <Link to="/profile" className="hidden xl:flex items-center gap-2 hover:bg-gray-100 p-1 pr-3 rounded-full transition-colors">
          <img src={currentUser.avatar} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
          <span className="font-semibold text-[15px]">{currentUser.name.split(' ')[0]}</span>
        </Link>

        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors" onClick={() => navigate('/')}>
          <Menu size={20} className="text-black" />
        </div>

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors relative ${isChatOpen ? 'bg-blue-100 text-primary' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
          onClick={() => { setIsChatOpen(!isChatOpen); setIsNotificationsOpen(false); }}
        >
          <MessageCircle size={20} className={isChatOpen ? 'fill-current' : ''} />
          {isChatOpen && <MessengerDropdown />}
        </div>

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors relative ${isNotificationsOpen ? 'bg-blue-100 text-primary' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
          onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsChatOpen(false); }}
        >
          <Bell size={20} className={isNotificationsOpen ? 'fill-current' : ''} />
          {/* Unread badge */}
          {state && (state.notifications || []).filter(n => !n.read).length > 0 && !isNotificationsOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {Math.min((state.notifications || []).filter(n => !n.read).length, 9)}
            </span>
          )}
          {isNotificationsOpen && <NotificationsDropdown />}
        </div>

        <div className="relative" ref={accountMenuRef}>
          <div
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
            onClick={() => { setShowAccountMenu(v => !v); setIsChatOpen(false); setIsNotificationsOpen(false); }}
          >
            <ChevronDown size={20} className="text-black" />
          </div>
          {showAccountMenu && (
            <div className="absolute top-12 right-0 w-[300px] bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50" onClick={e => e.stopPropagation()}>
              {/* User Card */}
              <div
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer rounded-t-lg"
                onClick={() => { navigate('/profile'); setShowAccountMenu(false); }}
              >
                <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-bold text-[17px]">{currentUser.name}</p>
                  <p className="text-[13px] text-primary hover:underline">See your profile</p>
                </div>
              </div>
              <div className="border-t border-gray-200 mx-4 my-2"></div>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 text-left"
                onClick={() => { navigate('/saved'); setShowAccountMenu(false); }}
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Settings size={18} />
                </div>
                <span className="font-medium text-[15px]">Settings & privacy</span>
              </button>
              <div className="border-t border-gray-200 mx-4 my-2"></div>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 text-left"
                onClick={() => {
                  // Clear session state and reload
                  const sid = sessionStorage.getItem('mock_sid');
                  if (sid) {
                    localStorage.removeItem(`fb_mock_state_${sid}`);
                    localStorage.removeItem(`fb_mock_initialState_${sid}`);
                    sessionStorage.removeItem('mock_sid');
                  } else {
                    localStorage.removeItem('fb_mock_state');
                    localStorage.removeItem('fb_mock_initialState');
                  }
                  window.location.href = '/';
                }}
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <LogOut size={18} />
                </div>
                <span className="font-medium text-[15px]">Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
