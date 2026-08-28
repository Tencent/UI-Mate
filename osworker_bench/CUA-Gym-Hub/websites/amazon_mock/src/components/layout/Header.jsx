import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, Menu, X, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CATEGORIES } from '../../lib/mockData';

const NAV_ITEMS = [
  { label: "Today's Deals", to: '/search?deals=true' },
  { label: 'Customer Service', to: '/profile' },
  { label: 'Registry', to: '/wishlist' },
  { label: 'Gift Cards', to: '/search?category=Beauty' },
  { label: 'Sell', to: '/profile' },
];

export const Header = () => {
  const { state, addToRecentSearches } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const searchRef = useRef(null);
  const accountRef = useRef(null);
  const navMenuRef = useRef(null);
  const navigate = useNavigate();

  const cartCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
      if (navMenuRef.current && !navMenuRef.current.contains(event.target)) {
        setShowNavMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowSuggestions(false);
        setShowAccountMenu(false);
        setShowNavMenu(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate suggestions based on products and categories
  useEffect(() => {
    if (searchTerm.length > 1) {
      const term = searchTerm.toLowerCase();
      const filtered = searchCategory !== 'All'
        ? state.products.filter(p => p.category === searchCategory)
        : state.products;

      const productMatches = filtered
        .filter(p => p.title.toLowerCase().includes(term))
        .slice(0, 5)
        .map(p => ({ type: 'product', text: p.title, id: p.id }));

      const categoryMatches = CATEGORIES
        .filter(c => c.toLowerCase().includes(term))
        .map(c => ({ type: 'category', text: c }));

      setSuggestions([...categoryMatches, ...productMatches]);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, searchCategory, state.products]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      addToRecentSearches(searchTerm);
      setShowSuggestions(false);
      const catParam = searchCategory !== 'All' ? `&category=${encodeURIComponent(searchCategory)}` : '';
      navigate(`/search?q=${encodeURIComponent(searchTerm)}${catParam}`);
    } else if (searchCategory !== 'All') {
      navigate(`/search?category=${encodeURIComponent(searchCategory)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product') {
      navigate(`/product/${suggestion.id}`);
    } else {
      setSearchTerm(suggestion.text);
      navigate(`/search?category=${encodeURIComponent(suggestion.text)}`);
    }
    setShowSuggestions(false);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-xmazon text-white px-4 py-2 flex items-center gap-4 h-[60px]">
        <Link to="/" className="flex items-center border border-transparent hover:border-white p-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-white">
          <span className="text-2xl font-bold tracking-tighter">xmazon<span className="text-xmazon-orange">.mock</span></span>
        </Link>

        <Link to="/profile" className="hidden md:flex flex-col text-xs border border-transparent hover:border-white p-2 rounded-sm leading-tight">
          <span className="text-gray-300">Deliver to {state.user.name.split(' ')[0]}</span>
          <div className="flex items-center font-bold">
            <MapPin size={14} className="mr-1" />
            {state.user.address.city} {state.user.address.zip}
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="flex h-10 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-xmazon-orange">
            <select
              value={searchCategory}
              onChange={e => setSearchCategory(e.target.value)}
              className="bg-gray-100 text-gray-600 text-xs px-2 border-r border-gray-300 w-auto max-w-[150px] cursor-pointer hover:bg-gray-200 outline-none border-none h-full"
            >
              <option value="All">All</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
              className="flex-1 px-3 text-black outline-none h-full"
              placeholder="Search Xmazon Mock"
            />
            <button type="submit" className="bg-xmazon-yellow hover:bg-xmazon-darkYellow px-4 text-black h-full flex items-center justify-center">
              <Search size={20} />
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg rounded-b-md mt-0 overflow-hidden z-50">
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black flex items-center gap-2"
                >
                  <Search size={14} className="text-gray-400" />
                  <span className={`truncate ${s.type === 'category' ? 'font-bold' : ''}`}>
                    {s.text}
                  </span>
                  {s.type === 'category' && <span className="text-gray-400 text-xs italic ml-auto flex-shrink-0">Category</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-1">
          {/* Account & Lists dropdown */}
          <div
            className="relative hidden md:block"
            ref={accountRef}
            onMouseEnter={() => setShowAccountMenu(true)}
            onMouseLeave={() => setShowAccountMenu(false)}
          >
            <button
              onClick={() => setShowAccountMenu(v => !v)}
              className="border border-transparent hover:border-white p-2 rounded-sm text-left"
            >
              <div className="text-xs text-gray-300">Hello, {state.user.name.split(' ')[0]}</div>
              <div className="text-sm font-bold">Account &amp; Lists</div>
            </button>
            {showAccountMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white text-gray-800 shadow-xl rounded border border-gray-200 w-[460px] z-50 p-4">
                <div className="grid grid-cols-2 gap-5">
                  <div className="border-r pr-5">
                    <div className="font-bold mb-2">Your Lists</div>
                    <Link to="/wishlist" onClick={() => setShowAccountMenu(false)} className="block py-1 text-sm text-gray-700 hover:text-xmazon-orange hover:underline">
                      Shopping List
                    </Link>
                    <Link to="/wishlist" onClick={() => setShowAccountMenu(false)} className="block py-1 text-sm text-gray-700 hover:text-xmazon-orange hover:underline">
                      Create a List
                    </Link>
                    <Link to="/wishlist" onClick={() => setShowAccountMenu(false)} className="block py-1 text-sm text-gray-700 hover:text-xmazon-orange hover:underline">
                      Find a List or Registry
                    </Link>
                  </div>
                  <div>
                    <div className="font-bold mb-2">Your Account</div>
                    {[
                      ['Account', '/profile'],
                      ['Orders', '/orders'],
                      ['Recommendations', '/'],
                      ['Browsing History', '/'],
                      ['Watchlist', '/wishlist'],
                      ['Wish List', '/wishlist'],
                    ].map(([label, to]) => (
                      <Link
                        key={label}
                        to={to}
                        onClick={() => setShowAccountMenu(false)}
                        className="flex items-center gap-1 py-1 text-sm text-gray-700 hover:text-xmazon-orange hover:underline"
                      >
                        <ChevronRight size={12} className="text-gray-400" /> {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link to="/orders" className="hidden md:block border border-transparent hover:border-white p-2 rounded-sm">
            <div className="text-xs text-gray-300">Returns</div>
            <div className="text-sm font-bold">&amp; Orders</div>
          </Link>

          <Link to="/cart" className="flex items-end border border-transparent hover:border-white p-2 rounded-sm relative">
            <div className="relative">
              <ShoppingCart size={32} />
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-xmazon-orange font-bold text-sm">
                {cartCount}
              </span>
            </div>
            <span className="font-bold text-sm mb-1 hidden md:inline">Cart</span>
          </Link>
        </div>
      </div>

      {/* Sub Nav */}
      <div className="bg-xmazon-light text-white text-sm px-4 py-1.5 flex items-center gap-4 overflow-x-auto whitespace-nowrap border-b border-[#485769]" ref={navMenuRef}>
        <button
          onClick={() => setShowNavMenu(v => !v)}
          className="flex items-center gap-1 font-bold hover:border hover:border-white px-1 rounded-sm"
        >
          <Menu size={20} /> All
        </button>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.label}
            to={item.to}
            className="hover:border hover:border-white px-2 py-1 rounded-sm"
          >
            {item.label}
          </Link>
        ))}

        {/* All Categories Drawer */}
        {showNavMenu && (
          <div className="fixed inset-0 z-50" onClick={() => setShowNavMenu(false)}>
            <div
              className="absolute top-0 left-0 h-full w-72 bg-white text-gray-800 shadow-2xl overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-xmazon text-white px-4 py-3 flex justify-between items-center">
                <span className="font-bold">Hello, {state.user.name.split(' ')[0]}</span>
                <button onClick={() => setShowNavMenu(false)} className="text-white hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm mb-2 uppercase text-gray-500">Shop by Category</h3>
                <ul className="divide-y divide-gray-100">
                  {CATEGORIES.map(cat => (
                    <li key={cat}>
                      <button
                        onClick={() => { navigate(`/search?category=${encodeURIComponent(cat)}`); setShowNavMenu(false); }}
                        className="w-full text-left py-2.5 px-1 text-sm hover:text-xmazon-orange flex justify-between items-center font-medium"
                      >
                        {cat}
                        <ChevronRight size={14} className="text-gray-400" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t p-4">
                <h3 className="font-bold text-sm mb-2 uppercase text-gray-500">Settings</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/profile" onClick={() => setShowNavMenu(false)} className="text-sm text-xmazon-blue hover:underline block py-1">Your Account</Link>
                  </li>
                  <li>
                    <Link to="/orders" onClick={() => setShowNavMenu(false)} className="text-sm text-xmazon-blue hover:underline block py-1">Your Orders</Link>
                  </li>
                  <li>
                    <Link to="/wishlist" onClick={() => setShowNavMenu(false)} className="text-sm text-xmazon-blue hover:underline block py-1">Your Wishlist</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
