import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Star } from 'lucide-react';

export default function AllServices() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const isFavorite = (name) => state.favorites.some(f => f.name === name);

  const toggleFav = (service) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: { name: service.name, icon: service.icon, path: service.path } });
  };

  const filteredCategories = state.allServicesCategories.map(cat => ({
    ...cat,
    services: cat.services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  })).filter(cat => cat.services.length > 0);

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'All services' }]} />
      <h1 className="page-title">All services</h1>

      <div className="filter-bar">
        <input className="input" placeholder="Filter services..." value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: '300px' }} />
      </div>

      {/* Favorites section */}
      {state.favorites.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div className="section-header">Favorites</div>
          {state.favorites.map(fav => (
            <div key={fav.id} className="sidebar-item" style={{ borderLeft: 'none', paddingLeft: '8px' }} onClick={() => navigate(fav.path)}>
              <Star size={16} fill="#e3a21a" color="#e3a21a" />
              <span>{fav.name}</span>
            </div>
          ))}
        </div>
      )}

      {filteredCategories.map(cat => (
        <div key={cat.category} style={{ marginBottom: '24px' }}>
          <div className="section-header">{cat.category}</div>
          {cat.services.map(service => (
            <div key={service.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', cursor: 'pointer' }} onClick={() => navigate(service.path)}>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFav(service); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
              >
                <Star size={16} fill={isFavorite(service.name) ? '#e3a21a' : 'none'} color={isFavorite(service.name) ? '#e3a21a' : '#a19f9d'} />
              </button>
              <span style={{ color: 'var(--xzure-blue)' }}>{service.name}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
