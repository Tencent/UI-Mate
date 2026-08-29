import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Bell, Mail, Bookmark, ListTodo, User, MoreHorizontal, PenSquare, Settings, HelpCircle, Moon, LogOut } from 'lucide-react';
import { useData } from '../context/DataContext';
import clsx from 'clsx';

const SidebarItem = ({ to, icon: Icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        "flex items-center gap-5 p-3 rounded-full w-fit xl:w-full transition-colors duration-200",
        isActive ? "font-bold" : "font-normal",
        "hover:bg-[#F7F9F9]"
      )
    }
  >
    <div className="relative">
      <Icon className="w-[26px] h-[26px]" />
      {badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-[#1DA1F2] text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </div>
    <span className="hidden xl:block text-xl text-[#0F1419]">{label}</span>
  </NavLink>
);

export default function Sidebar({ onTweet }) {
  const { state } = useData();
  const navigate = useNavigate();
  const unreadNotifs = state.notifications.filter(n => !n.read).length;
  const unreadDMs = (state.conversations || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const moreMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed h-screen flex flex-col justify-between py-2 px-2 xl:px-4 border-r border-[#EFF3F4] w-[68px] xl:w-[275px]">
      <div className="flex flex-col gap-0.5 items-center xl:items-start">
        <NavLink to="/" className="p-3 rounded-full hover:bg-blue-50 w-fit mb-1">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current text-[#1DA1F2]" aria-hidden="true">
            <g><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path></g>
          </svg>
        </NavLink>

        <nav className="flex flex-col gap-0.5 w-full">
          <SidebarItem to="/" icon={Home} label="Home" />
          <SidebarItem to="/explore" icon={Search} label="Explore" />
          <SidebarItem to="/notifications" icon={Bell} label="Notifications" badge={unreadNotifs} />
          <SidebarItem to="/messages" icon={Mail} label="Messages" badge={unreadDMs} />
          <SidebarItem to="/bookmarks" icon={Bookmark} label="Bookmarks" />
          <SidebarItem to="/lists" icon={ListTodo} label="Lists" />
          <SidebarItem to={`/profile/${state.currentUser.handle}`} icon={User} label="Profile" />

          {/* More menu */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(prev => !prev)}
              className="flex items-center gap-5 p-3 rounded-full w-fit xl:w-full transition-colors duration-200 hover:bg-[#F7F9F9]"
            >
              <MoreHorizontal className="w-[26px] h-[26px]" />
              <span className="hidden xl:block text-xl text-[#0F1419]">More</span>
            </button>
            {showMoreMenu && (
              <div className="absolute bottom-14 left-0 bg-white shadow-xl rounded-2xl border border-[#EFF3F4] py-2 w-[220px] z-50">
                <button
                  onClick={() => { setShowMoreMenu(false); navigate('/go'); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F7F9F9] text-[15px] text-[#0F1419] font-bold transition-colors"
                >
                  <Settings className="w-[22px] h-[22px]" />
                  Settings &amp; Support
                </button>
                <button
                  onClick={() => { setShowMoreMenu(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F7F9F9] text-[15px] text-[#0F1419] font-bold transition-colors"
                >
                  <HelpCircle className="w-[22px] h-[22px]" />
                  Help Center
                </button>
                <button
                  onClick={() => { setShowMoreMenu(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F7F9F9] text-[15px] text-[#0F1419] font-bold transition-colors"
                >
                  <Moon className="w-[22px] h-[22px]" />
                  Display
                </button>
              </div>
            )}
          </div>
        </nav>

        <button
          onClick={onTweet}
          className="mt-4 bg-[#1DA1F2] hover:bg-[#1a91da] text-white rounded-full p-3 xl:py-3 xl:px-8 xl:w-full shadow-md transition-colors"
        >
          <PenSquare className="w-6 h-6 xl:hidden" />
          <span className="hidden xl:block font-bold text-[17px]">Tweet</span>
        </button>
      </div>

      {/* User profile menu */}
      <div className="relative" ref={userMenuRef}>
        <div
          className="flex items-center gap-3 p-3 rounded-full hover:bg-[#F7F9F9] cursor-pointer w-full transition-colors"
          onClick={() => setShowUserMenu(prev => !prev)}
        >
          <img src={state.currentUser.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
          <div className="hidden xl:block flex-1 overflow-hidden">
            <p className="font-bold text-[15px] text-[#0F1419] truncate">{state.currentUser.name}</p>
            <p className="text-[#536471] text-[15px] truncate">@{state.currentUser.handle}</p>
          </div>
          <MoreHorizontal className="hidden xl:block w-5 h-5 text-[#536471]" />
        </div>
        {showUserMenu && (
          <div className="absolute bottom-16 left-0 bg-white shadow-xl rounded-2xl border border-[#EFF3F4] py-2 w-[280px] z-50">
            <div className="px-4 py-3 border-b border-[#EFF3F4]">
              <div className="flex items-center gap-3">
                <img src={state.currentUser.avatar} alt="" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-bold text-[15px] text-[#0F1419]">{state.currentUser.name}</p>
                  <p className="text-[#536471] text-[15px]">@{state.currentUser.handle}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setShowUserMenu(false); navigate(`/profile/${state.currentUser.handle}`); }}
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F7F9F9] text-[15px] text-[#0F1419] font-bold transition-colors"
            >
              <User className="w-[18px] h-[18px]" />
              View profile
            </button>
            <button
              onClick={() => { setShowUserMenu(false); navigate('/go'); }}
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F7F9F9] text-[15px] text-[#0F1419] font-bold transition-colors"
            >
              <Settings className="w-[18px] h-[18px]" />
              Settings
            </button>
            <div className="border-t border-[#EFF3F4] mt-1 pt-1">
              <button
                onClick={() => { setShowUserMenu(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F7F9F9] text-[15px] text-[#0F1419] transition-colors"
              >
                <LogOut className="w-[18px] h-[18px]" />
                Log out @{state.currentUser.handle}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
