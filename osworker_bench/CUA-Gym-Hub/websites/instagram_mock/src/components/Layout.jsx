import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, Menu, Compass, MessageCircle, Film } from 'lucide-react';
import { useData } from '../context/DataContext';
import CreatePostModal from './CreatePostModal';
import NotificationsPanel from './NotificationsPanel';
import SearchPanel from './SearchPanel';

const Layout = () => {
  const { currentUser, getUnreadNotificationCount, getUnreadMessageCount } = useData();
  const location = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [morePanel, setMorePanel] = useState(null);

  const unreadNotifs = getUnreadNotificationCount();
  const unreadMessages = getUnreadMessageCount();

  const isActive = (path) => location.pathname === path;
  const isMessagesActive = location.pathname.startsWith('/direct');

  const isPanelOpen = isNotificationsOpen || isSearchOpen;

  const handleNotificationsClick = () => {
    if (isSearchOpen) setIsSearchOpen(false);
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleSearchClick = () => {
    if (isNotificationsOpen) setIsNotificationsOpen(false);
    setIsSearchOpen(!isSearchOpen);
  };

  const NavItem = ({ to, icon: Icon, label, active, onClick, badge, isAvatar, avatarSrc }) => {
    const content = (
      <>
        <div className="relative flex-shrink-0">
          {isAvatar ? (
            <img
              src={avatarSrc}
              alt="Profile"
              className={`w-6 h-6 rounded-full object-cover ${active ? 'ring-2 ring-[#262626]' : ''}`}
            />
          ) : (
            <Icon className={`w-6 h-6 transition-all ${active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
          )}
          {badge > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[#ED4956] rounded-full flex items-center justify-center text-[10px] text-white font-bold px-1">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>
        <span className={`hidden ${isPanelOpen ? '' : 'xl:block'} text-base transition-all ${active ? 'font-bold' : 'font-normal'}`}>{label}</span>
      </>
    );

    if (onClick) {
      return (
        <button
          onClick={onClick}
          className={`flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-[#F2F2F2] w-full group my-[1px] ${active ? 'font-bold' : ''}`}
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        to={to}
        onClick={() => {
          setIsNotificationsOpen(false);
          setIsSearchOpen(false);
        }}
        className={`flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-[#F2F2F2] group my-[1px] ${active ? 'font-bold' : ''}`}
      >
        {content}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar (Desktop) */}
      <div className={`hidden md:flex flex-col ${isPanelOpen ? 'w-[72px]' : 'w-[72px] xl:w-[244px]'} fixed h-full border-r border-[#DBDBDB] bg-white z-20 px-3 pt-2 pb-5 transition-all duration-300`}>
        {/* Logo */}
        <div className="mb-4 px-3 pt-6 pb-4">
          <Link to="/" onClick={() => { setIsNotificationsOpen(false); setIsSearchOpen(false); }}>
            {isPanelOpen ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="17" cy="7" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            ) : (
              <>
                <svg className="w-6 h-6 xl:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="17" cy="7" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <h1 className="hidden xl:block text-2xl pt-1 pb-2 px-1 select-none" style={{ fontFamily: "'Satisfy', cursive, 'Segoe Script', 'Comic Sans MS'" }}>Xnstagram</h1>
              </>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-0">
          <NavItem to="/" icon={Home} label="Home" active={isActive('/')} />
          <NavItem icon={Search} label="Search" active={isSearchOpen} onClick={handleSearchClick} />
          <NavItem to="/explore" icon={Compass} label="Explore" active={isActive('/explore')} />
          <NavItem to="/reels" icon={Film} label="Reels" active={isActive('/reels')} />
          <NavItem to="/direct/inbox" icon={MessageCircle} label="Messages" active={isMessagesActive} badge={unreadMessages} />
          <NavItem icon={Heart} label="Notifications" active={isNotificationsOpen} onClick={handleNotificationsClick} badge={unreadNotifs} />
          <NavItem icon={PlusSquare} label="Create" onClick={() => setIsCreateModalOpen(true)} />
          <NavItem
            to={`/profile/${currentUser.username}`}
            label="Profile"
            active={location.pathname === `/profile/${currentUser.username}`}
            isAvatar
            avatarSrc={currentUser.avatar}
          />
        </nav>

        <div className="mt-auto relative">
          <NavItem icon={Menu} label="More" onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} />
          {isMoreMenuOpen && (
            <div className="absolute bottom-14 left-2 w-[220px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#DBDBDB] overflow-hidden z-50">
              <button
                onClick={() => { setMorePanel('Settings'); setIsMoreMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#F2F2F2] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                Settings
              </button>
              <button
                onClick={() => { setMorePanel('Your Activity'); setIsMoreMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#F2F2F2] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Your Activity
              </button>
              <Link
                to={`/profile/${currentUser.username}`}
                onClick={() => setIsMoreMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#F2F2F2] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                Saved
              </Link>
              <div className="border-t border-[#DBDBDB]" />
              <button
                onClick={() => { setIsMoreMenuOpen(false); setMorePanel('Report a Problem'); }}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#F2F2F2] transition-colors w-full text-left"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Report a Problem
              </button>
              <div className="border-t border-[#DBDBDB]" />
              <button
                onClick={() => { setIsMoreMenuOpen(false); setMorePanel('Switch Accounts'); }}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#F2F2F2] transition-colors w-full text-left"
              >
                Switch Accounts
              </button>
              <button
                onClick={() => { setIsMoreMenuOpen(false); setMorePanel('Log Out'); }}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#F2F2F2] transition-colors w-full text-left"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out panels */}
      {isNotificationsOpen && (
        <NotificationsPanel onClose={() => setIsNotificationsOpen(false)} />
      )}
      {isSearchOpen && (
        <SearchPanel onClose={() => setIsSearchOpen(false)} />
      )}

      {/* Click-away overlay */}
      {(isPanelOpen || isMoreMenuOpen) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => { setIsNotificationsOpen(false); setIsSearchOpen(false); setIsMoreMenuOpen(false); }}
        />
      )}

      {/* Bottom Nav (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DBDBDB] z-30 px-5 py-2.5 flex justify-between items-center safe-area-bottom">
        <Link to="/"><Home className={`w-7 h-7 ${isActive('/') ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} /></Link>
        <Link to="/explore"><Compass className={`w-7 h-7 ${isActive('/explore') ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} /></Link>
        <Link to="/reels"><Film className={`w-7 h-7 ${isActive('/reels') ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} /></Link>
        <button onClick={() => setIsCreateModalOpen(true)}><PlusSquare className="w-7 h-7 stroke-[1.5px]" /></button>
        <Link to={`/profile/${currentUser.username}`}>
          <img src={currentUser.avatar} alt="Profile" className={`w-7 h-7 rounded-full object-cover ${location.pathname === `/profile/${currentUser.username}` ? 'ring-2 ring-[#262626]' : ''}`} />
        </Link>
      </div>

      {/* Main Content */}
      <main className={`flex-1 ${isPanelOpen ? 'md:ml-[72px]' : 'md:ml-[72px] xl:ml-[244px]'} w-full max-w-full overflow-x-hidden transition-all duration-300`}>
        <Outlet />
      </main>

      {isCreateModalOpen && <CreatePostModal onClose={() => setIsCreateModalOpen(false)} />}

      {morePanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onClick={() => setMorePanel(null)}>
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#EFEFEF] text-center font-bold">{morePanel}</div>
            <div className="p-4 text-sm text-[#8E8E8E]">
              {morePanel === 'Settings' && 'Account, privacy, notifications, and app preferences are available from this panel.'}
              {morePanel === 'Your Activity' && 'Recent likes, comments, saved posts, and account activity are summarized here.'}
              {morePanel === 'Report a Problem' && 'Describe what happened, then close this dialog to return to Xnstagram.'}
              {morePanel === 'Switch Accounts' && 'Account switching is available through the seeded current user state.'}
              {morePanel === 'Log Out' && 'This sandbox keeps the mock account signed in for repeatable training tasks.'}
            </div>
            <button onClick={() => setMorePanel(null)} className="w-full py-3 text-sm font-semibold border-t border-[#EFEFEF] hover:bg-[#FAFAFA]">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
