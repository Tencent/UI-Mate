import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const categories = [
  { path: '/hotels', label: 'Hotels', key: 'hotels' },
  { path: '/attractions', label: 'Things to Do', key: 'attractions' },
  { path: '/restaurants', label: 'Restaurants', key: 'restaurants' },
  { path: '/flights', label: 'Flights', key: 'flights' },
  { path: '/vacation-rentals', label: 'Vacation Rentals', key: 'vacationRentals' }
];

export default function CategoryNav() {
  const { dispatch } = useApp();
  const location = useLocation();

  return (
    <nav style={{
      height: '48px',
      background: '#fff',
      borderBottom: '1px solid #E0E0E0',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      transition: 'box-shadow 0.2s'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '32px'
      }}>
        {categories.map(cat => {
          const isActive = location.pathname.startsWith(cat.path) ||
            (cat.key === 'attractions' && location.pathname.startsWith('/attraction'));
          return (
            <NavLink
              key={cat.key}
              to={cat.path}
              onClick={() => {
                if (['hotels', 'restaurants', 'attractions'].includes(cat.key)) {
                  dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: cat.key });
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                fontSize: '14px',
                fontWeight: isActive ? 700 : 600,
                color: isActive ? '#1A1A1A' : '#545454',
                textDecoration: 'none',
                borderBottom: isActive ? '3px solid #1A1A1A' : '3px solid transparent',
                padding: '0 4px',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => { if (!isActive) e.target.style.color = '#1A1A1A'; }}
              onMouseLeave={(e) => { if (!isActive) e.target.style.color = '#545454'; }}
            >
              {cat.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
