import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PieChart, History, Search, Menu, X, Bell, CheckCircle } from 'lucide-react';
import { useStore } from '../lib/store';

export default function Layout() {
  const { state, markNotificationRead, markAllNotificationsRead } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = (state.notifications || []).filter(notification => !notification.read).length;

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      const results = state.stocks.filter(s => 
        s.symbol.toLowerCase().includes(query.toLowerCase()) || 
        s.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/' },
    { icon: PieChart, label: 'Portfolio', path: '/portfolio' },
    { icon: History, label: 'History', path: '/history' },
  ];

  return (
    <div className="min-h-screen bg-background text-text flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-surface bg-background sticky top-0 z-50">
        <Link to="/" className="font-bold text-primary text-xl">TradeFlow</Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        fixed inset-0 z-40 bg-background md:static md:w-64 md:border-r md:border-surface flex flex-col
        transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:block">
          <Link to="/" className="font-bold text-primary text-2xl tracking-tight">TradeFlow</Link>
        </div>

        <div className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-surface text-primary' 
                  : 'text-text-muted hover:text-text hover:bg-surface-hover'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="p-6 border-t border-surface">
          <div className="text-sm text-text-muted mb-1">Total Balance</div>
          <div className="text-xl font-bold">
            ${(state.user.cashBalance + state.user.portfolioValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-primary mt-1">
            Buying Power: ${state.user.buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-surface flex items-center px-6 justify-between bg-background shrink-0">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search symbol or company"
              className="w-full bg-surface border border-transparent focus:border-primary rounded-md py-2 pl-10 pr-4 text-sm text-text placeholder-text-muted focus:outline-none transition-all"
              value={searchQuery}
              onChange={handleSearch}
              onBlur={() => setTimeout(() => setSearchResults([]), 200)}
            />
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-surface-hover rounded-lg shadow-xl overflow-hidden z-50">
                {searchResults.map(stock => (
                  <div 
                    key={stock.symbol}
                    onClick={() => {
                      navigate(`/stock/${stock.symbol}`);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="flex justify-between items-center px-4 py-3 hover:bg-surface-hover cursor-pointer"
                  >
                    <div>
                      <div className="font-bold">{stock.symbol}</div>
                      <div className="text-xs text-text-muted">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div>${stock.currentPrice.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 ml-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(value => !value)}
                className="relative text-text-muted hover:text-primary transition-colors"
                aria-label="Open notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 min-w-4 h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-8 w-80 bg-surface border border-surface-hover rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="flex items-center justify-between p-3 border-b border-surface-hover">
                    <div className="font-bold text-sm">Notifications</div>
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {(state.notifications || []).length === 0 ? (
                      <div className="p-6 text-center text-sm text-text-muted">No notifications</div>
                    ) : (
                      state.notifications.map(notification => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => markNotificationRead(notification.id)}
                          className={`w-full text-left p-3 border-b border-surface-hover last:border-b-0 hover:bg-surface-hover ${notification.read ? '' : 'bg-primary/5'}`}
                        >
                          <div className="flex items-start gap-3">
                            <CheckCircle size={16} className={notification.read ? 'text-text-muted' : 'text-primary'} />
                            <div>
                              <div className="text-sm font-bold">{notification.title}</div>
                              <div className="text-xs text-text-muted mt-1">{notification.message}</div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-sm font-bold border border-surface">
              DU
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
