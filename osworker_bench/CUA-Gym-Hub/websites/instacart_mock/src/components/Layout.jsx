import React, { useMemo, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Home, Clock, User, Menu, Search, Bell, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Layout() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const cartItemCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadCount = (state.notifications || []).filter(notification => !notification.read).length;
  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return state.products
      .filter(product => product.name.toLowerCase().includes(term))
      .slice(0, 6);
  }, [searchTerm, state.products]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const firstResult = searchResults[0];
    if (!firstResult) return;
    handleResultClick(firstResult);
  };

  const handleResultClick = (product) => {
    if (state.currentStoreId !== product.storeId && state.cart.length === 0) {
      dispatch({ type: ACTION_TYPES.SET_STORE, payload: product.storeId });
    }
    navigate(`/store/${product.storeId}?q=${encodeURIComponent(product.name)}`);
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-primary font-bold text-xl hidden md:block">GroceryGo</span>
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search products, stores, and recipes" 
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="absolute left-0 right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No products found</div>
                ) : (
                  searchResults.map(product => {
                    const store = state.stores.find(item => item.id === product.storeId);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleResultClick(product)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                      >
                        <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-50" />
                        <span className="flex-1">
                          <span className="block text-sm font-semibold text-gray-900">{product.name}</span>
                          <span className="block text-xs text-gray-500">{store?.name} · ${product.price.toFixed(2)} / {product.unit}</span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </form>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(value => !value)}
                className="relative flex flex-col items-center text-gray-600 hover:text-primary"
                aria-label="Open notifications"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Notifications</h2>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: ACTION_TYPES.MARK_NOTIFICATIONS_READ })}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {(state.notifications || []).length === 0 ? (
                      <div className="px-4 py-6 text-sm text-gray-500 text-center">No notifications</div>
                    ) : (
                      state.notifications.map(notification => (
                        <div key={notification.id} className={`px-4 py-3 border-b border-gray-100 ${notification.read ? 'bg-white' : 'bg-primary/5'}`}>
                          <div className="text-sm font-semibold text-gray-900">{notification.message}</div>
                          <div className="text-xs text-gray-500 mt-1">{new Date(notification.created).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/orders" className="flex flex-col items-center text-gray-600 hover:text-primary">
              <Clock className="w-6 h-6" />
              <span className="text-xs font-medium hidden md:block">Orders</span>
            </Link>
            
            <Link to="/cart" className="relative flex items-center gap-2 bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">{cartItemCount}</span>
            </Link>
            
            <Link to="/account" className="hidden md:flex items-center gap-2 hover:opacity-80">
              <img src={state.user.avatar} alt="User" className="w-8 h-8 rounded-full border border-gray-200" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50">
        <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-primary' : 'text-gray-500'}`}>
          <Home className="w-6 h-6" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link to="/orders" className={`flex flex-col items-center gap-1 ${location.pathname.includes('/orders') ? 'text-primary' : 'text-gray-500'}`}>
          <Clock className="w-6 h-6" />
          <span className="text-[10px]">Orders</span>
        </Link>
        <Link to="/go" className={`flex flex-col items-center gap-1 ${location.pathname === '/go' ? 'text-primary' : 'text-gray-500'}`}>
          <Menu className="w-6 h-6" />
          <span className="text-[10px]">Debug</span>
        </Link>
        <Link to="/account" className={`flex flex-col items-center gap-1 ${location.pathname === '/account' ? 'text-primary' : 'text-gray-500'}`}>
          <User className="w-6 h-6" />
          <span className="text-[10px]">Account</span>
        </Link>
      </nav>
    </div>
  );
}
