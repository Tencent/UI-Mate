import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Briefcase, MessageSquare, Bell, Search, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const NavItem = ({ to, icon: Icon, label, active, badge }) => (
  <Link to={to} className={`flex flex-col items-center justify-center px-4 min-w-[80px] cursor-pointer hover:text-black transition-colors relative ${active ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}>
    <div className="relative">
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      {badge > 0 && (
        <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-[#cc1016] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </div>
    <span className="text-xs mt-1 hidden md:block">{label}</span>
  </Link>
);

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Calculate unread counts
  const unreadNotifications = state.notifications.filter(n => !n.read).length;
  const unreadMessages = state.chats.filter(chat => {
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg && lastMsg.senderId !== state.currentUser.id && lastMsg.read === false;
  }).length;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-[52px]">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xinkedin-blue">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.22-.6-1.93-1.84-1.93-1 0-1.62.67-1.62 1.93V19h-3v-9h3v1.23c.88-1.5 2.16-1.6 3.22-1.6 2.4 0 3.24 1.6 3.24 4.4z" />
            </svg>
          </Link>
          <div className="relative hidden md:block">
            <Search className="absolute left-2 top-2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="bg-[#eef3f8] pl-8 pr-4 py-1.5 rounded-md text-sm w-64 focus:w-80 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center h-full">
          <NavItem to="/" icon={Home} label="Home" active={pathname === '/'} />
          <NavItem to="/mynetwork" icon={Users} label="My Network" active={pathname === '/mynetwork'} />
          <NavItem to="/jobs" icon={Briefcase} label="Jobs" active={pathname === '/jobs'} />
          <NavItem to="/messaging" icon={MessageSquare} label="Messaging" active={pathname === '/messaging'} badge={unreadMessages} />
          <NavItem to="/notifications" icon={Bell} label="Notifications" active={pathname === '/notifications'} badge={unreadNotifications} />
          <div className="border-l border-gray-200 h-full mx-2"></div>
          <Link to="/profile/me" className="flex flex-col items-center justify-center px-2 text-gray-500 hover:text-black">
            <img src={state.currentUser.avatar} alt="Me" className="w-6 h-6 rounded-full object-cover" />
            <span className="text-xs mt-1 hidden md:block">Me</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
