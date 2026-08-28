import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Bell, Menu, X, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const CATEGORIES = [
  'Electronics', 'Fashion', 'Motors', 'Collectibles',
  'Sports', 'Home', 'Books', 'Cameras', 'Other'
];

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showShopByCategory, setShowShopByCategory] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showShippingDialog, setShowShippingDialog] = useState(false);
  const [helpTopic, setHelpTopic] = useState('Buying');
  const [helpMessage, setHelpMessage] = useState('');
  const [helpSubmitted, setHelpSubmitted] = useState(false);
  const [shipCountry, setShipCountry] = useState('United States');
  const [shipZip, setShipZip] = useState('94105');
  const [shippingSaved, setShippingSaved] = useState(false);
  const navigate = useNavigate();
  const { state, markNotificationRead, markAllNotificationsRead, removeFromCart } = useStore();

  const cartIds = state.cart || [];
  const cartCount = cartIds.length;
  const cartListings = cartIds.map(id => state.listings.find(l => l.id === id)).filter(Boolean);
  const notifCount = state.notifications.filter(n => !n.read).length;
  const userNotifs = state.notifications.filter(n => n.userId === state.currentUser.id);

  const notifRef = useRef(null);
  const cartRef = useRef(null);
  const shopByCatRef = useRef(null);
  const searchCatRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifDropdown(false);
      if (cartRef.current && !cartRef.current.contains(e.target)) setShowCartDropdown(false);
      if (shopByCatRef.current && !shopByCatRef.current.contains(e.target)) setShowShopByCategory(false);
      if (searchCatRef.current && !searchCatRef.current.contains(e.target)) setShowCategoryDropdown(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setShowHelpDialog(false);
        setShowShippingDialog(false);
        setShowCategoryDropdown(false);
        setShowShopByCategory(false);
        setShowNotifDropdown(false);
        setShowCartDropdown(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedCategory !== 'All Categories') params.set('c', selectedCategory);
    navigate(`/search?${params.toString()}`);
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setShowCategoryDropdown(false);
  };

  const submitHelpRequest = (e) => {
    e.preventDefault();
    setHelpSubmitted(true);
  };

  const saveShippingLocation = (e) => {
    e.preventDefault();
    setShippingSaved(true);
  };

  return (
    <header className="border-b border-gray-200 bg-white relative z-40">
      {/* Top Bar */}
      <div className="container mx-auto px-4 py-1 text-xs text-gray-600 flex justify-between">
        <div>
          Hi! <Link to="/dashboard" className="text-xbay-blue hover:underline font-bold">{state.currentUser.username}</Link>
          <span className="mx-2">|</span>
          <Link to="/search?c=Electronics" className="hover:underline">Daily Deals</Link>
          <span className="mx-2">|</span>
          <button
            type="button"
            onClick={() => {
              setHelpSubmitted(false);
              setShowHelpDialog(true);
            }}
            className="hover:underline cursor-pointer"
          >
            Help &amp; Contact
          </button>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              setShippingSaved(false);
              setShowShippingDialog(true);
            }}
            className="hover:underline cursor-pointer"
          >
            Ship to
          </button>
          <Link to="/sell" className="hover:underline">Sell</Link>
          <Link to="/dashboard?tab=watchlist" className="hover:underline">Watchlist</Link>
          <Link to="/dashboard" className="hover:underline">My xBay</Link>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-3xl font-bold tracking-tighter text-xbay-blue shrink-0">
          xbay<span className="text-xbay-yellow">.</span><span className="text-xbay-green">mock</span>
        </Link>

        {/* Shop by Category */}
        <div className="hidden md:block relative shrink-0" ref={shopByCatRef}>
          <button
            onClick={() => setShowShopByCategory(v => !v)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 gap-1 py-1"
          >
            <Menu size={16} />
            <span className="leading-tight">Shop by<br />category</span>
            <ChevronDown size={14} className={`transition-transform ${showShopByCategory ? 'rotate-180' : ''}`} />
          </button>
          {showShopByCategory && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat}
                  to={`/search?c=${cat}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-xbay-blue"
                  onClick={() => setShowShopByCategory(false)}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 flex min-w-0">
          <div className="relative w-full flex">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border-2 border-r-0 border-black rounded-l-full focus:outline-none"
              placeholder="Search for anything"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Category selector */}
            <div className="relative shrink-0" ref={searchCatRef}>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(v => !v)}
                className="border-2 border-l-0 border-black bg-white flex items-center px-3 border-r-0 text-sm text-gray-600 h-full gap-1 hover:bg-gray-50 whitespace-nowrap"
              >
                <span className="max-w-[80px] truncate">{selectedCategory}</span>
                <ChevronDown size={12} className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full right-0 w-48 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('All Categories')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedCategory === 'All Categories' ? 'font-bold text-xbay-blue' : 'text-gray-700'}`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => handleSelectCategory(cat)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedCategory === cat ? 'font-bold text-xbay-blue' : 'text-gray-700'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="bg-xbay-blue text-white px-8 py-2.5 rounded-r-full font-bold hover:bg-blue-700 transition-colors shrink-0">
              Search
            </button>
          </div>
        </form>

        <div className="flex items-center gap-6 text-gray-600 shrink-0">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(v => !v)}
              className="relative hover:text-xbay-blue"
            >
              <Bell size={24} />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {notifCount}
                </span>
              )}
            </button>
            {showNotifDropdown && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <div className="flex justify-between items-center p-3 border-b border-gray-100">
                  <span className="font-bold text-gray-900 text-sm">Notifications</span>
                  <div className="flex items-center gap-2">
                    {notifCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-xbay-blue hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setShowNotifDropdown(false)} className="text-gray-400 hover:text-gray-700">
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {userNotifs.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                  ) : (
                    userNotifs.slice().reverse().map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 text-sm ${notif.read ? 'opacity-60' : 'bg-blue-50/30'}`}
                      >
                        <div className="flex gap-2 items-start">
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-xbay-blue mt-1 shrink-0" />}
                          <span className={notif.read ? 'ml-4' : ''}>{notif.message}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="relative" ref={cartRef}>
            <button
              onClick={() => setShowCartDropdown(v => !v)}
              className="relative hover:text-xbay-blue"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-xbay-blue text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            {showCartDropdown && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <div className="flex justify-between items-center p-3 border-b border-gray-100">
                  <span className="font-bold text-gray-900 text-sm">Cart ({cartCount})</span>
                  <button onClick={() => setShowCartDropdown(false)} className="text-gray-400 hover:text-gray-700">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {cartListings.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Your cart is empty</div>
                  ) : (
                    cartListings.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <img src={item.images[0]} alt={item.title} className="w-12 h-12 object-cover rounded bg-gray-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/item/${item.id}`}
                            className="text-xs font-medium text-gray-900 line-clamp-2 hover:text-xbay-blue"
                            onClick={() => setShowCartDropdown(false)}
                          >
                            {item.title}
                          </Link>
                          <div className="text-xs font-bold text-gray-700 mt-0.5">
                            ${(item.buyItNowPrice || item.price || item.currentBid || 0).toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 shrink-0"
                          title="Remove from cart"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {cartListings.length > 0 && (
                  <div className="p-3 border-t border-gray-100">
                    <Link
                      to="/dashboard"
                      onClick={() => setShowCartDropdown(false)}
                      className="block w-full text-center bg-xbay-blue text-white text-sm font-bold py-2 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      View Cart
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="container mx-auto px-4 py-2 overflow-x-auto">
        <div className="flex gap-6 text-sm text-gray-600 whitespace-nowrap">
          <Link to="/dashboard?tab=watchlist" className="hover:text-xbay-blue hover:underline">Saved</Link>
          <Link to="/search?c=Electronics" className="hover:text-xbay-blue hover:underline">Electronics</Link>
          <Link to="/search?c=Motors" className="hover:text-xbay-blue hover:underline">Motors</Link>
          <Link to="/search?c=Fashion" className="hover:text-xbay-blue hover:underline">Fashion</Link>
          <Link to="/search?c=Collectibles" className="hover:text-xbay-blue hover:underline">Collectibles</Link>
          <Link to="/search?c=Sports" className="hover:text-xbay-blue hover:underline">Sports</Link>
          <Link to="/search?c=Home" className="hover:text-xbay-blue hover:underline">Home &amp; Garden</Link>
        </div>
      </div>

      {showHelpDialog && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-900">Help & Contact</h2>
              <button onClick={() => setShowHelpDialog(false)} className="text-gray-500 hover:text-gray-800">
                <X size={18} />
              </button>
            </div>
            {helpSubmitted ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-3">
                  ✓
                </div>
                <p className="font-bold text-gray-900">Support request saved locally</p>
                <p className="text-sm text-gray-500 mt-1">A mock xBay teammate will follow up in Messages.</p>
                <button onClick={() => setShowHelpDialog(false)} className="mt-5 btn-primary text-sm">Done</button>
              </div>
            ) : (
              <form onSubmit={submitHelpRequest} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Topic</label>
                  <select
                    value={helpTopic}
                    onChange={e => setHelpTopic(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none"
                  >
                    <option>Buying</option>
                    <option>Selling</option>
                    <option>Payments</option>
                    <option>Shipping</option>
                    <option>Account</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Message</label>
                  <textarea
                    value={helpMessage}
                    onChange={e => setHelpMessage(e.target.value)}
                    rows="4"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none"
                    placeholder={`Describe your ${helpTopic.toLowerCase()} issue`}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowHelpDialog(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-sm">Save Request</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showShippingDialog && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-900">Shipping location</h2>
              <button onClick={() => setShowShippingDialog(false)} className="text-gray-500 hover:text-gray-800">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveShippingLocation} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Country or region</label>
                <select
                  value={shipCountry}
                  onChange={e => setShipCountry(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none"
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                  <option>Germany</option>
                  <option>Japan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">ZIP or postal code</label>
                <input
                  value={shipZip}
                  onChange={e => setShipZip(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none"
                  required
                />
              </div>
              {shippingSaved && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
                  Shipping location set to {shipCountry} {shipZip}.
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowShippingDialog(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm">Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
