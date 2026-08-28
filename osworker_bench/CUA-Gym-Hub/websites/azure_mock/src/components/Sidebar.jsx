import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Grid, Folder, Monitor, Database, Globe, Table2 as Table, Key, DollarSign, Plus, ArrowRight } from 'lucide-react';

const iconMap = {
  Grid, Folder, Monitor, Database, Globe, Table, Key, DollarSign,
};

export default function Sidebar({ onClose, isDocked }) {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
    if (!isDocked) onClose();
  };

  return (
    <nav className={`portal-sidebar ${isDocked ? 'docked' : 'flyout'}`}>
      <div className="sidebar-create-btn">
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleNav('/create-resource')}>
          <Plus size={16} /> Create a resource
        </button>
      </div>

      <div className="sidebar-divider" />
      <div className="sidebar-section-label">Favorites</div>

      {state.favorites.map(fav => {
        const Icon = iconMap[fav.icon] || Globe;
        const isActive = location.pathname === fav.path || location.pathname.startsWith(fav.path + '/');
        return (
          <div
            key={fav.id}
            className={`sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => handleNav(fav.path)}
          >
            <Icon size={20} />
            <span>{fav.name}</span>
          </div>
        );
      })}

      <div className="sidebar-footer">
        <div className="sidebar-item" onClick={() => handleNav('/all-services')}>
          <ArrowRight size={16} />
          <span>All services</span>
        </div>
      </div>
    </nav>
  );
}
