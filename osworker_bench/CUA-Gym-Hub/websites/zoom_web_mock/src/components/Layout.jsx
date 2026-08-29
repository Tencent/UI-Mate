import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, Clock, UserPlus, Settings, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available', color: 'bg-green-500' },
  { value: 'busy', label: 'Busy', color: 'bg-red-500' },
  { value: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500' },
  { value: 'away', label: 'Away', color: 'bg-yellow-500' },
  { value: 'offline', label: 'Appear Offline', color: 'bg-gray-400' },
];

const NavTab = ({ to, icon: Icon, label }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const href = query ? `${to}?${query}` : to;
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center px-4 py-1 text-xs font-medium transition-colors relative min-w-[56px]',
          isActive
            ? 'text-xoom-blue'
            : 'text-xoom-gray hover:text-xoom-dark'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="w-5 h-5 mb-0.5" strokeWidth={isActive ? 2.2 : 1.8} />
          <span className={cn('text-[11px]', isActive && 'font-semibold')}>{label}</span>
          {isActive && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-xoom-blue rounded-full" />
          )}
        </>
      )}
    </NavLink>
  );
};

export default function Layout() {
  const { user, updateUser, meetings, contacts, channels } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const statusRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close status dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchBar(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus input when search bar opens
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);

  const currentStatus = STATUS_OPTIONS.find(s => s.value === user.status) || STATUS_OPTIONS[0];

  const handleStatusChange = (statusValue) => {
    updateUser({ status: statusValue });
    setShowStatusDropdown(false);
  };

  // Build search results from state
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results = [];

    // Search meetings
    meetings.filter(m => m.title.toLowerCase().includes(q)).slice(0, 3).forEach(m => {
      results.push({ type: 'meeting', label: m.title, sub: m.meetingId, action: () => navigate(query ? `/meetings?${query}` : '/meetings') });
    });

    // Search contacts
    contacts.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 3).forEach(c => {
      results.push({ type: 'contact', label: c.name, sub: c.email, action: () => navigate(query ? `/contacts?${query}` : '/contacts') });
    });

    // Search channels
    channels.filter(ch => ch.name && ch.name.toLowerCase().includes(q)).slice(0, 3).forEach(ch => {
      results.push({ type: 'channel', label: `#${ch.name}`, sub: ch.description || '', action: () => navigate(query ? `/chat/${ch.channelId}?${query}` : `/chat/${ch.channelId}`) });
    });

    return results;
  };

  const searchResults = getSearchResults();

  // Hide top nav for room and go routes
  if (location.pathname.startsWith('/room') || location.pathname === '/go') {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation Bar */}
      <nav className="h-12 bg-white border-b border-xoom-border flex items-center px-3 shrink-0 z-20">
        {/* Left section: logo + nav arrows + search */}
        <div className="flex items-center space-x-2 min-w-[260px]">
          {/* Xoom logo */}
          <div className="w-8 h-8 bg-xoom-blue rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            Z
          </div>
          {/* Nav arrows */}
          <button
            onClick={() => window.history.back()}
            className="p-1 text-xoom-gray hover:text-xoom-dark hover:bg-gray-100 rounded transition-colors"
            title="Go back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.history.forward()}
            className="p-1 text-xoom-gray hover:text-xoom-dark hover:bg-gray-100 rounded transition-colors"
            title="Go forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {/* Search bar */}
          <div ref={searchRef} className="relative ml-1">
            {showSearchBar ? (
              <div className="flex items-center bg-[#F1F1F1] rounded-full px-3 py-1.5 w-[220px]">
                <Search className="w-3.5 h-3.5 text-xoom-gray mr-2 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 bg-transparent text-xs outline-none text-xoom-dark placeholder:text-xoom-gray"
                  onKeyDown={e => { if (e.key === 'Escape') { setShowSearchBar(false); setSearchQuery(''); } }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="ml-1 text-xoom-gray hover:text-xoom-dark">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowSearchBar(true)}
                className="flex items-center bg-[#F1F1F1] rounded-full px-3 py-1.5 w-[200px] hover:bg-gray-200 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-xoom-gray mr-2 shrink-0" />
                <span className="text-xs text-xoom-gray">Search</span>
                <span className="ml-auto text-[10px] text-xoom-gray bg-white rounded px-1 py-0.5 border border-xoom-border">Ctrl+F</span>
              </button>
            )}

            {/* Search results dropdown */}
            {showSearchBar && searchQuery.trim() && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-xoom-border rounded-lg shadow-lg w-72 z-50 overflow-hidden">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-xoom-gray">No results found</div>
                ) : (
                  <div className="py-1">
                    {searchResults.map((result, i) => (
                      <button
                        key={i}
                        onClick={() => { result.action(); setShowSearchBar(false); setSearchQuery(''); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-xoom-gray rounded uppercase font-semibold tracking-wide shrink-0">
                            {result.type}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-xoom-dark truncate">{result.label}</div>
                            {result.sub && <div className="text-xs text-xoom-gray truncate">{result.sub}</div>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center section: Tab icons */}
        <div className="flex-1 flex items-center justify-center space-x-1">
          <NavTab to="/" icon={Home} label="Home" />
          <NavTab to="/chat" icon={MessageSquare} label="Team Chat" />
          <NavTab to="/meetings" icon={Clock} label="Meetings" />
          <NavTab to="/contacts" icon={UserPlus} label="Contacts" />
        </div>

        {/* Right section: Settings + avatar */}
        <div className="flex items-center space-x-3 min-w-[100px] justify-end">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'p-1.5 rounded transition-colors',
                isActive ? 'text-xoom-blue bg-xoom-hover' : 'text-xoom-gray hover:text-xoom-dark hover:bg-gray-100'
              )
            }
          >
            <Settings className="w-5 h-5" />
          </NavLink>

          {/* Avatar with status dropdown */}
          <div ref={statusRef} className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="relative focus:outline-none"
              title="Set status"
            >
              <img
                src={user.avatar}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-xoom-border cursor-pointer hover:opacity-90 transition-opacity"
              />
              {/* Status dot */}
              <div className={cn(
                'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white',
                currentStatus.color
              )} />
            </button>

            {showStatusDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-xoom-border rounded-xl shadow-lg w-52 py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="font-medium text-sm text-xoom-dark truncate">{user.username}</div>
                  <div className="text-xs text-xoom-gray truncate">{user.email}</div>
                </div>
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] text-xoom-gray font-semibold uppercase tracking-wider">Status</div>
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(s.value)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm flex items-center space-x-2.5 hover:bg-gray-50 transition-colors',
                        user.status === s.value && 'bg-xoom-hover'
                      )}
                    >
                      <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', s.color)} />
                      <span className={user.status === s.value ? 'font-medium text-xoom-blue' : 'text-xoom-dark'}>{s.label}</span>
                      {user.status === s.value && <span className="ml-auto text-xoom-blue text-xs">✓</span>}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-1">
                  <NavLink
                    to={query ? `/settings?${query}` : '/settings'}
                    onClick={() => setShowStatusDropdown(false)}
                    className="w-full text-left px-3 py-2 text-sm text-xoom-dark hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <Settings className="w-3.5 h-3.5 mr-2 text-xoom-gray" />
                    Settings
                  </NavLink>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-xoom-bg">
        <Outlet />
      </main>
    </div>
  );
}
