
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Send, Wallet, History, FileText, Settings, Bell, Code, Link as LinkIcon } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const location = useLocation();
  const { state, markNotificationsRead } = useStore();
  const notifications = state.notifications || [];
  const unreadCount = notifications.filter(notification => !notification.read).length;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/send', label: 'Send & Request', icon: Send },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/activity', label: 'Activity', icon: History },
    { path: '/invoices', label: 'Invoices', icon: FileText },
    { path: '/payment-links', label: 'Links', icon: LinkIcon },
    { path: '/go', label: 'Debug State', icon: Code },
  ];

  // Safety check
  if (!state || !state.user) {
    return <div className="p-8 text-center">Loading application data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-brand text-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-brand font-bold text-xl italic">
                  P
                </div>
                <span className="font-bold text-xl tracking-tight">PayService</span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200",
                      location.pathname === item.path
                        ? "border-white text-white"
                        : "border-transparent text-brand-light hover:text-white hover:border-brand-light"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-1 rounded-full text-brand-light hover:text-white focus:outline-none"
                aria-label="Open notifications"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              <Link to="/settings" className="p-1 rounded-full text-brand-light hover:text-white focus:outline-none">
                <Settings className="h-6 w-6" />
              </Link>
              <div className="hidden md:flex items-center space-x-2 ml-4">
                 <span className="text-sm font-medium">{state.user?.name}</span>
                 {state.user?.avatar && (
                   <img src={state.user.avatar} alt="Profile" className="h-8 w-8 rounded-full border-2 border-brand-light" />
                 )}
              </div>
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-brand-light hover:text-white hover:bg-brand-dark focus:outline-none"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isNotificationOpen && (
          <div className="absolute right-4 top-14 z-[60] w-80 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="font-bold">Notifications</h2>
              <button onClick={markNotificationsRead} className="text-xs font-bold text-brand hover:underline">Mark all read</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">No notifications</div>
              ) : notifications.map(notification => (
                <div key={notification.id} className="border-b border-gray-50 px-4 py-3 last:border-0">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="mt-1 text-xs text-gray-500">{new Date(notification.date).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-brand-dark">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                    location.pathname === item.path
                      ? "bg-brand border-white text-white"
                      : "border-transparent text-gray-300 hover:bg-brand hover:text-white hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
  
