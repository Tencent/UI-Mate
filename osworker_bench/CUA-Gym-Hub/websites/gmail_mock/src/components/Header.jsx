import React, { useState } from 'react';
import { Menu, Search, Settings, HelpCircle, Grid, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const AdvancedSearchModal = () => {
  const { isSearchModalOpen, setIsSearchModalOpen, setSearchQuery } = useStore();
  const [localQuery, setLocalQuery] = useState({ from: '', to: '', subject: '', hasAttachment: false });

  if (!isSearchModalOpen) return null;

  const handleSearch = () => {
    const parts = [];
    if (localQuery.from) parts.push(`from:${localQuery.from}`);
    if (localQuery.to) parts.push(`to:${localQuery.to}`);
    if (localQuery.subject) parts.push(localQuery.subject);
    if (localQuery.hasAttachment) parts.push('has:attachment');

    setSearchQuery(parts.join(' '));
    setIsSearchModalOpen(false);
  };

  return (
    <div className="absolute top-16 left-0 right-0 bg-white shadow-xl border border-gray-200 p-6 z-50 w-[600px] mx-auto rounded-b-lg">
      <div className="grid grid-cols-[100px_1fr] gap-4 mb-4 items-center">
        <label className="text-gray-600 text-sm font-medium">From</label>
        <input
          className="border-b border-gray-200 outline-none py-1 text-sm"
          value={localQuery.from}
          onChange={e => setLocalQuery({...localQuery, from: e.target.value})}
        />

        <label className="text-gray-600 text-sm font-medium">To</label>
        <input
          className="border-b border-gray-200 outline-none py-1 text-sm"
          value={localQuery.to}
          onChange={e => setLocalQuery({...localQuery, to: e.target.value})}
        />

        <label className="text-gray-600 text-sm font-medium">Subject</label>
        <input
          className="border-b border-gray-200 outline-none py-1 text-sm"
          value={localQuery.subject}
          onChange={e => setLocalQuery({...localQuery, subject: e.target.value})}
        />

        <div className="col-start-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="has-attach"
            checked={localQuery.hasAttachment}
            onChange={e => setLocalQuery({...localQuery, hasAttachment: e.target.checked})}
          />
          <label htmlFor="has-attach" className="text-sm text-gray-600">Has attachment</label>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
          <button
              onClick={() => setIsSearchModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded"
          >
              Cancel
          </button>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </div>
  );
};

const GoogleAppsPanel = ({ onClose }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const apps = [
    { name: 'Search', icon: '🔍' },
    { name: 'Maps', icon: '🗺️' },
    { name: 'YouTube', icon: '▶️' },
    { name: 'Play', icon: '🎮' },
    { name: 'News', icon: '📰' },
    { name: 'Xmail', icon: '✉️' },
    { name: 'Meet', icon: '📹' },
    { name: 'Chat', icon: '💬' },
    { name: 'Drive', icon: '📁' },
    { name: 'Calendar', icon: '📅' },
    { name: 'Docs', icon: '📄' },
    { name: 'Sheets', icon: '📊' },
  ];

  return (
    <div
      ref={ref}
      className="absolute top-12 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-72 p-3"
    >
      <h3 className="text-sm font-medium text-gray-700 px-2 pb-2 border-b border-gray-100 mb-2">Google apps</h3>
      <div className="grid grid-cols-3 gap-1">
        {apps.map(app => (
          <button
            key={app.name}
            onClick={onClose}
            className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl">{app.icon}</span>
            <span className="text-xs text-gray-600">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const ProfileDropdown = ({ onClose }) => {
  const { state } = useStore();
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute top-12 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-72 py-4">
      <div className="flex flex-col items-center px-4 pb-4 border-b border-gray-100">
        <img
          src={state.user.avatar}
          alt={state.user.username}
          className="w-16 h-16 rounded-full border border-gray-200 mb-2"
        />
        <p className="font-medium text-gray-900 text-base">{state.user.username}</p>
        <p className="text-sm text-gray-500">{state.user.email}</p>
      </div>
      <div className="py-2">
        <button
          onClick={onClose}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Manage your Google Account
        </button>
        <button
          onClick={onClose}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

const Header = () => {
  const { searchQuery, setSearchQuery, state, setIsSearchModalOpen, sidebarCollapsed, setSidebarCollapsed, showToast } = useStore();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showAppsPanel, setShowAppsPanel] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center justify-between px-4 bg-white border-b border-gray-200 sticky top-0 z-20 relative">
      <div className="flex items-center gap-4 w-60">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Main menu"
        >
          <Menu size={24} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r2.png" alt="Xmail" className="h-10" />
        </div>
      </div>

      <div className="flex-1 max-w-3xl relative">
        <div className="bg-[#eaf1fb] flex items-center px-4 py-3 rounded-full focus-within:bg-white focus-within:shadow-md transition-all">
          <Search size={20} className="text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="Search mail"
            className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => setIsSearchModalOpen(prev => !prev)}
            className="p-1 hover:bg-gray-200 rounded-full ml-2"
          >
            <SlidersHorizontal size={18} className="text-gray-600" />
          </button>
        </div>
        <AdvancedSearchModal />
      </div>

      <div className="flex items-center gap-2 w-60 justify-end">
        <button
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Support"
          onClick={() => showToast('Xmail Help Center — not available in mock')}
        >
          <HelpCircle size={24} className="text-gray-600" />
        </button>
        <button onClick={() => navigate('/settings')} className="p-2 hover:bg-gray-100 rounded-full" title="Settings">
          <Settings size={24} className="text-gray-600" />
        </button>
        <div className="relative">
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Google apps"
            onClick={() => setShowAppsPanel(v => !v)}
          >
            <Grid size={24} className="text-gray-600" />
          </button>
          {showAppsPanel && (
            <GoogleAppsPanel onClose={() => setShowAppsPanel(false)} />
          )}
        </div>
        <div className="ml-2 relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            title={state.user.email}
          >
            <img
              src={state.user.avatar}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-gray-200 hover:opacity-90"
            />
          </button>
          {showProfileDropdown && (
            <ProfileDropdown onClose={() => setShowProfileDropdown(false)} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
