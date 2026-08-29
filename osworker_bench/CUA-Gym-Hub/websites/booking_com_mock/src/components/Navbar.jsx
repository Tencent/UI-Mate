import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/StoreContext';
import { InfoDialog } from './InfoDialog';

const BCLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="130" height="24" viewBox="0 0 130 24" fill="white">
    <text x="0" y="20" fontSize="22" fontWeight="bold" fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" fill="white">Xooking.com</text>
  </svg>
);

const NAV_TABS = [
  { label: 'Stays', path: '/', icon: '🏨' },
  { label: 'Flights', path: '#', icon: '✈️' },
  { label: 'Flight + Hotel', path: '#', icon: '🏖️' },
  { label: 'Car rentals', path: '#', icon: '🚗' },
  { label: 'Attractions', path: '#', icon: '🎡' },
  { label: 'Airport taxis', path: '#', icon: '🚕' },
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, loading, updateCurrentState } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHomePage = location.pathname === '/';
  const isSearchPage = location.pathname === '/search';
  // On home page, header has dark blue background with the hero below it
  // On other pages, header remains blue but may have slightly different styling

  const openTravelDraft = (tab) => {
    updateCurrentState(current => ({
      ...current,
      travelDrafts: [
        {
          id: `draft_${Date.now()}`,
          product: tab.label,
          status: 'draft',
          createdAt: new Date().toISOString(),
        },
        ...(current.travelDrafts || []),
      ].slice(0, 10),
    }));
    setDialog({ type: 'travel', title: tab.label });
  };

  const setPreference = (field, value) => {
    updateCurrentState(current => ({
      ...current,
      user: current.user ? { ...current.user, [field]: value } : current.user,
      preferences: { ...(current.preferences || {}), [field]: value },
    }));
  };

  return (
    <header style={{ background: 'var(--bc-blue-dark)', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top row: logo + account actions */}
      <div className="container--wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: 'white', fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px' }}>
            Xooking.com
          </span>
        </Link>

        {/* Right side actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setDialog({ type: 'currency', title: 'Choose your currency' })}
            style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: 4,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="USD"
          >
            USD
          </button>
          <button
            onClick={() => setDialog({ type: 'language', title: 'Choose your language' })}
            style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: 4,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="English (US)"
          >
            🌐 EN
          </button>
          <Link
            to="/mytrips"
            style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: 4,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            My trips
          </Link>
          {!loading && data?.user ? (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                style={{
                  background: 'var(--bc-yellow)',
                  color: 'var(--bc-text-dark)',
                  border: '2px solid var(--bc-yellow)',
                  borderRadius: 4,
                  padding: '6px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>👤</span>
                <span>{data.user.firstName}</span>
                <span style={{ fontSize: 10 }}>{menuOpen ? '▲' : '▼'}</span>
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                  background: 'white', border: '1px solid var(--bc-gray-border)',
                  borderRadius: 4, boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
                  minWidth: 200, zIndex: 200,
                }}>
                  <Link
                    to="/mytrips"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block', padding: '12px 16px', fontSize: 14,
                      color: 'var(--bc-text-dark)', textDecoration: 'none',
                      borderBottom: '1px solid var(--bc-gray-border)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bc-gray-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    My bookings
                  </Link>
                  <Link
                    to="/saved"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block', padding: '12px 16px', fontSize: 14,
                      color: 'var(--bc-text-dark)', textDecoration: 'none',
                      borderBottom: '1px solid var(--bc-gray-border)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bc-gray-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Saved
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      updateCurrentState(current => ({
                        ...current,
                        user: null,
                      }));
                      navigate('/');
                    }}
                    style={{
                      display: 'block', width: '100%', padding: '12px 16px', fontSize: 14,
                      color: 'var(--bc-text-medium)', background: 'none', border: 'none',
                      textAlign: 'left', cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bc-gray-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                updateCurrentState(current => ({
                  ...current,
                  user: {
                    id: 'user_1',
                    firstName: 'Sarah',
                    lastName: 'Johnson',
                    email: 'sarah.johnson@email.com',
                    phone: '+1 (555) 123-4567',
                    country: 'United States',
                    nationality: 'American',
                    avatarUrl: null,
                    geniusLevel: 1,
                    geniusBookings: 2,
                    geniusBookingsRequired: 5,
                    currency: 'USD',
                    language: 'English (US)',
                    savedProperties: current?.user?.savedProperties || [],
                  },
                }));
              }}
              style={{
                background: 'var(--bc-yellow)',
                color: 'var(--bc-text-dark)',
                border: '2px solid var(--bc-yellow)',
                borderRadius: 4,
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="container--wide" style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {NAV_TABS.map(tab => {
            const isActive = tab.path !== '#' && location.pathname === tab.path;
            const isDead = tab.path === '#';
            return isDead ? (
              <button
                key={tab.label}
                onClick={() => openTravelDraft(tab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 14px',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 400,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '3px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'border-color 0.15s',
                  opacity: 0.8,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }}
              >
                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ) : (
              <Link
                key={tab.label}
                to={tab.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 14px',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 400,
                  textDecoration: 'none',
                  borderBottom: isActive ? '3px solid white' : '3px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'border-color 0.15s',
                  opacity: 1,
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.5)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.borderBottomColor = 'transparent';
                }}
              >
                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      {dialog && (
        <InfoDialog title={dialog.title} onClose={() => setDialog(null)}>
          {dialog.type === 'currency' && (
            <div style={{ display: 'grid', gap: 10 }}>
              {['USD', 'EUR', 'GBP', 'JPY'].map(currency => (
                <button
                  key={currency}
                  onClick={() => { setPreference('currency', currency); setDialog(null); }}
                  style={{
                    textAlign: 'left',
                    padding: '12px 14px',
                    border: '1px solid var(--bc-gray-border)',
                    borderRadius: 6,
                    background: currency === data?.user?.currency ? '#e7f1ff' : 'white',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {currency}
                </button>
              ))}
            </div>
          )}
          {dialog.type === 'language' && (
            <div style={{ display: 'grid', gap: 10 }}>
              {['English (US)', 'Deutsch', 'Français', 'Español'].map(language => (
                <button
                  key={language}
                  onClick={() => { setPreference('language', language); setDialog(null); }}
                  style={{
                    textAlign: 'left',
                    padding: '12px 14px',
                    border: '1px solid var(--bc-gray-border)',
                    borderRadius: 6,
                    background: language === data?.user?.language ? '#e7f1ff' : 'white',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {language}
                </button>
              ))}
            </div>
          )}
          {dialog.type === 'travel' && dialog.title === 'Flights' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  From
                  <input defaultValue="New York (JFK)" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
                </label>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  To
                  <input defaultValue="Paris (CDG)" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Departure
                  <input type="date" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
                </label>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Return
                  <input type="date" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
                </label>
              </div>
              <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                Passengers
                <select style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }}>
                  <option>1 adult</option>
                  <option>2 adults</option>
                  <option>2 adults, 1 child</option>
                  <option>2 adults, 2 children</option>
                </select>
              </label>
              <button className="btn btn--primary" onClick={() => setDialog(null)}>Search flights</button>
            </div>
          )}
          {dialog.type === 'travel' && dialog.title === 'Flight + Hotel' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Flying from
                  <input defaultValue="New York (JFK)" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
                </label>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Going to
                  <input defaultValue="Paris" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Check-in
                  <input type="date" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
                </label>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Check-out
                  <input type="date" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
                </label>
              </div>
              <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                Travellers &amp; rooms
                <select style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }}>
                  <option>2 adults · 1 room</option>
                  <option>1 adult · 1 room</option>
                  <option>2 adults · 2 rooms</option>
                  <option>Family (2+2) · 1 room</option>
                </select>
              </label>
              <button className="btn btn--primary" onClick={() => { setDialog(null); navigate('/search?destination=Paris'); }}>Search packages</button>
            </div>
          )}
          {dialog.type === 'travel' && dialog.title === 'Car rentals' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                Pick-up location
                <input defaultValue="Paris Charles de Gaulle Airport" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Pick-up date
                  <input type="date" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
                </label>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Drop-off date
                  <input type="date" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
                </label>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" /> Drop off at a different location
              </label>
              <button className="btn btn--primary" onClick={() => setDialog(null)}>Search cars</button>
            </div>
          )}
          {dialog.type === 'travel' && dialog.title === 'Attractions' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                Where are you going?
                <input defaultValue="Paris" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Date
                  <input type="date" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
                </label>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Guests
                  <select style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }}>
                    <option>1 person</option>
                    <option>2 people</option>
                    <option>3–4 people</option>
                    <option>5+ people</option>
                  </select>
                </label>
              </div>
              <button className="btn btn--primary" onClick={() => setDialog(null)}>Search attractions</button>
            </div>
          )}
          {dialog.type === 'travel' && dialog.title === 'Airport taxis' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                Pick-up location
                <input defaultValue="Paris Charles de Gaulle Airport (CDG)" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                Drop-off location
                <input defaultValue="City centre / hotel" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Date
                  <input type="date" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
                </label>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  Time
                  <input type="time" defaultValue="10:00" style={{ padding: 10, border: '1px solid var(--bc-gray-border)', borderRadius: 4 }} />
                </label>
              </div>
              <button className="btn btn--primary" onClick={() => setDialog(null)}>Search taxis</button>
            </div>
          )}
        </InfoDialog>
      )}
    </header>
  );
};
