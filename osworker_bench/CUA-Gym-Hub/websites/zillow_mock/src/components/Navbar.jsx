import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, User, MapPin, X, Check } from 'lucide-react';
import { useStore } from '../lib/store';

export default function Navbar() {
  const { state, updateFilters } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [navSearch, setNavSearch] = useState('');
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setDialog(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const runNavSearch = (event) => {
    event.preventDefault();
    updateFilters({
      ...state.filters,
      search: navSearch,
    });
    navigate('/');
  };

  const startFlow = (type) => {
    setDialog(type);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[1000]">
      <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-brand-500 p-1.5 rounded text-white">
              <MapPin size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-brand-500 tracking-tight">Estately</span>
          </Link>
          
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
            <Link to="/" className="hover:text-brand-500">Buy</Link>
            <button onClick={() => startFlow('rent')} className="hover:text-brand-500">Rent</button>
            <button onClick={() => startFlow('sell')} className="hover:text-brand-500">Sell</button>
            <Link to="/mortgage" className="hover:text-brand-500">Mortgage</Link>
          </div>
        </div>

        {/* Search Bar (Compact on Nav) */}
        {location.pathname !== '/' && (
           <form onSubmit={runNavSearch} className="hidden lg:flex flex-1 max-w-md mx-8 relative">
             <input 
               type="text" 
               placeholder="Address, City, Zip" 
               value={navSearch}
               onChange={(event) => setNavSearch(event.target.value)}
               className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
             />
             <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-500" aria-label="Search listings">
               <Search size={20} />
             </button>
           </form>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link to="/saved" className="flex items-center gap-2 text-gray-700 hover:text-brand-500">
            <span className="relative">
                <Heart size={20} />
                {state.user.savedProperties.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                        {state.user.savedProperties.length}
                    </span>
                )}
            </span>
            <span className="hidden sm:inline">Saved</span>
          </Link>
          <button onClick={() => startFlow('signin')} className="flex items-center gap-2 text-brand-500 font-medium hover:bg-brand-50 px-3 py-2 rounded-lg transition-colors">
            <User size={20} />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        </div>
      </div>

      {dialog && (
        <div className="fixed inset-0 z-[2500] bg-black/40 flex items-center justify-center p-4" onClick={() => setDialog(null)}>
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {dialog === 'rent' ? 'Rental alerts' : dialog === 'sell' ? 'Sell your home' : 'Sign in'}
              </h2>
              <button onClick={() => setDialog(null)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close dialog">
                <X size={20} />
              </button>
            </div>

            {dialog === 'rent' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Create a local rental search draft. No external listing service is contacted.</p>
                <button
                  onClick={() => {
                    updateFilters({ ...state.filters, type: 'All', search: 'Santa Monica' });
                    setDialog(null);
                    navigate('/');
                  }}
                  className="w-full bg-brand-500 text-white font-bold py-3 rounded-lg hover:bg-brand-600"
                >
                  Browse Santa Monica rentals
                </button>
              </div>
            )}

            {dialog === 'sell' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Estimate a local listing workflow with saved property data and market comps.</p>
                <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
                  <div className="font-bold text-gray-900">Suggested next step</div>
                  <div>Compare nearby sold homes, then contact a local Premier Agent from any listing.</div>
                </div>
                <button onClick={() => { setDialog(null); navigate('/mortgage'); }} className="w-full border border-brand-500 text-brand-500 font-bold py-3 rounded-lg hover:bg-brand-50">
                  Check affordability first
                </button>
              </div>
            )}

            {dialog === 'signin' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3 text-green-700">
                  <Check size={18} className="mt-0.5" />
                  <div>
                    <div className="font-bold">Demo account active</div>
                    <div className="text-sm">Saved homes and searches are stored locally for this training session.</div>
                  </div>
                </div>
                <button onClick={() => setDialog(null)} className="w-full bg-brand-500 text-white font-bold py-3 rounded-lg hover:bg-brand-600">
                  Continue as DemoUser
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
