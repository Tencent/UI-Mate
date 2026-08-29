
    import React, { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { MapPin, Search, ShoppingCart, Menu, User, X } from 'lucide-react';
    import { useStore } from '../context/StoreContext';

    export default function Navbar({ toggleCart }) {
      const { state } = useStore();
      const [search, setSearch] = useState('');
      const [isMenuOpen, setIsMenuOpen] = useState(false);
      const navigate = useNavigate();
      const cartCount = state.cart.items.reduce((acc, item) => acc + item.quantity, 0);

      const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
          navigate(`/?q=${search}`);
        }
      };

      return (
        <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm h-16 sm:h-20">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
            {/* Logo & Mobile Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link to="/" className="text-2xl font-bold tracking-tight">
                Uber <span className="text-primary">Eats</span>
              </Link>
            </div>

            {/* Address & Search (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-2xl items-center gap-4 bg-gray-100 rounded-full px-4 py-2">
              <div className="flex items-center gap-2 border-r border-gray-300 pr-4 min-w-[150px]">
                <MapPin className="w-5 h-5 text-black" />
                <span className="text-sm font-medium truncate">New York, NY</span>
              </div>
              <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Food, groceries, drinks, etc." 
                  className="bg-transparent border-none focus:outline-none w-full text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={toggleCart}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-medium">{cartCount} cart</span>
              </button>
              
              <Link to="/orders" className="p-2 hover:bg-gray-100 rounded-full">
                <User className="w-6 h-6" />
              </Link>
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="md:hidden px-4 pb-3">
             <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <Search className="w-5 h-5 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none focus:outline-none w-full text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>
          </div>

          {isMenuOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setIsMenuOpen(false)}>
              <div className="h-full w-80 max-w-[85vw] bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-xl font-bold">Uber <span className="text-primary">Eats</span></span>
                  <button onClick={() => setIsMenuOpen(false)} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close navigation menu">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <Link onClick={() => setIsMenuOpen(false)} to="/" className="block rounded-lg px-3 py-3 font-bold hover:bg-gray-100">Home</Link>
                  <Link onClick={() => setIsMenuOpen(false)} to="/orders" className="block rounded-lg px-3 py-3 font-bold hover:bg-gray-100">Orders</Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      toggleCart();
                    }}
                    className="w-full rounded-lg px-3 py-3 text-left font-bold hover:bg-gray-100"
                  >
                    Cart ({cartCount})
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>
      );
    }
  
