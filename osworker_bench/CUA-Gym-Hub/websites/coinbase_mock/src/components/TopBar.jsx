import React, { useContext, useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, X } from 'lucide-react';
import { CoinbaseContext } from '../context/CoinbaseContext';
import NotificationDropdown from './NotificationDropdown';

const pageTitles = {
  '/': 'Home',
  '/assets': 'Assets',
  '/trade': 'Trade',
  '/history': 'History',
  '/settings': 'Settings',
};

function TopBar({ onMenuToggle }) {
  const { state } = useContext(CoinbaseContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const unreadCount = (state.notifications || []).filter(n => !n.read).length;
  const searchResults = state.assets
    .filter(asset => {
      const term = searchTerm.trim().toLowerCase();
      return term && (asset.name.toLowerCase().includes(term) || asset.symbol.toLowerCase().includes(term));
    })
    .slice(0, 5);

  // Determine title from current path
  let title = pageTitles[location.pathname] || '';
  if (location.pathname.startsWith('/asset/')) {
    const assetId = location.pathname.split('/asset/')[1];
    const asset = state.assets.find(a => a.id === assetId);
    title = asset ? asset.name : 'Asset';
  }

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-gray-600 hover:text-gray-900"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <div className="hidden sm:block relative w-full max-w-sm" ref={searchRef}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assets"
            className="w-full rounded-full bg-gray-100 border border-gray-200 py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:bg-white"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          {searchTerm && (
            <div className="absolute left-0 right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No assets found</div>
              ) : (
                searchResults.map(asset => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      navigate(`/asset/${asset.id}`);
                      setSearchTerm('');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                  >
                    <span className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: asset.iconColor }}>
                      {asset.symbol.charAt(0)}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-gray-900">{asset.name}</span>
                      <span className="block text-xs text-gray-500">{asset.symbol}</span>
                    </span>
                    <span className="text-sm font-semibold text-gray-900">${asset.currentPrice.toLocaleString()}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-gray-500 hover:text-gray-900 transition-colors p-1"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#CF202F] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-300">
          {state.currentUser.name.split(' ').map(n => n[0]).join('')}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
