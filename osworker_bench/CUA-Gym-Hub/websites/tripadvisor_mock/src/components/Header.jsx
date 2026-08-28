import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, User, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import SearchOverlay from './SearchOverlay.jsx';

export default function Header() {
  const { state } = useApp();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/hotels?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
      setSearchQuery('');
    }
  };

  return (
    <header style={{
      height: '64px',
      background: '#fff',
      borderBottom: '1px solid #E0E0E0',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      position: 'relative',
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#34E0A1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="8" cy="12" r="3" fill="#1A1A1A" />
              <circle cx="16" cy="12" r="3" fill="#1A1A1A" />
              <circle cx="8" cy="12" r="1.5" fill="white" />
              <circle cx="16" cy="12" r="1.5" fill="white" />
              <path d="M5 9 C5 5, 19 5, 19 9" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
              <path d="M12 6 L12 4" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M10 4 L14 4" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.5px' }}>
            Xripadvisor
          </span>
        </Link>

        {/* Search */}
        <div ref={searchRef} style={{ position: 'relative', flex: '0 1 400px', margin: '0 24px' }}>
          <form onSubmit={handleSearchSubmit}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #E0E0E0',
              borderRadius: '24px',
              padding: '8px 16px',
              background: searchFocused ? '#fff' : '#F5F5F5',
              boxShadow: searchFocused ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              transition: 'all 0.2s'
            }}>
              <Search size={18} color="#8A8A8A" />
              <input
                type="text"
                placeholder="Where to?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  marginLeft: '8px',
                  fontSize: '14px',
                  width: '100%',
                  color: '#1A1A1A'
                }}
              />
            </div>
          </form>
          {searchFocused && (
            <SearchOverlay
              query={searchQuery}
              onSelect={() => { setSearchFocused(false); setSearchQuery(''); }}
            />
          )}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <Link to="/trips" style={{ display: 'flex', alignItems: 'center', color: '#1A1A1A' }} title="Trips">
            <Heart size={20} />
          </Link>

          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#00AA6C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: 700
              }}>
                {state.currentUser.name.charAt(0).toUpperCase()}
              </div>
              <ChevronDown size={14} color="#545454" />
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: 'white',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                minWidth: '200px',
                zIndex: 200,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #E0E0E0' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{state.currentUser.name}</div>
                  <div style={{ color: '#8A8A8A', fontSize: '12px' }}>{state.currentUser.location}</div>
                </div>
                {[
                  { to: '/profile', label: 'Profile' },
                  { to: '/reviews/write/hotel/hotel_1', label: 'Write a Review' },
                  { to: '/trips', label: 'Trips' },
                  { to: '/forums', label: 'Forums' }
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      fontSize: '14px',
                      color: '#1A1A1A',
                      textDecoration: 'none',
                      borderBottom: '1px solid #f5f5f5'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#F2F2F2'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
