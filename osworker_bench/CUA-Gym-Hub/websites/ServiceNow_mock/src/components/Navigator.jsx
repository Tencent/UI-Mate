import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

const NAV_SECTIONS = [
  {
    label: 'Self-Service',
    items: [
      { label: 'Incidents', route: '/incident/list', id: 'ss_incidents' },
      { label: 'Watched Incidents', route: '/incident/list?filter=assigned_to_me', id: 'ss_watched' },
    ]
  },
  {
    label: 'Service Desk',
    items: [
      { label: 'Incidents', route: '/incident/list', id: 'sd_incidents' },
    ]
  },
  {
    label: 'Incident',
    items: [
      { label: 'Create New', route: '/incident/create', id: 'inc_create' },
      { label: 'Assigned to me', route: '/incident/list?filter=assigned_to_me', id: 'inc_assigned' },
      { label: 'Open', route: '/incident/list?filter=open', id: 'inc_open' },
      { label: 'Open - Unassigned', route: '/incident/list?filter=open_unassigned', id: 'inc_unassigned' },
      { label: 'Resolved', route: '/incident/list?filter=resolved', id: 'inc_resolved' },
      { label: 'Closed', route: '/incident/list?filter=closed', id: 'inc_closed' },
      { label: 'All', route: '/incident/list', id: 'inc_all' },
    ]
  },
  {
    label: 'Problem',
    items: [
      { label: 'Create New', route: '/problem/create', id: 'prb_create' },
      { label: 'Open', route: '/problem/list?filter=open', id: 'prb_open' },
      { label: 'All', route: '/problem/list', id: 'prb_all' },
    ]
  },
  {
    label: 'Change',
    items: [
      { label: 'Create New', route: '/change/create', id: 'chg_create' },
      { label: 'Open', route: '/change/list?filter=open', id: 'chg_open' },
      { label: 'Closed', route: '/change/list?filter=closed', id: 'chg_closed' },
      { label: 'All', route: '/change/list', id: 'chg_all' },
    ]
  },
  {
    label: 'Configuration',
    items: [
      { label: 'CIs', route: '/cmdb/list', id: 'cmdb_list' },
      { label: 'Servers', route: '/cmdb/list?class=server', id: 'cmdb_servers' },
      { label: 'Databases', route: '/cmdb/list?class=database', id: 'cmdb_databases' },
    ]
  },
  {
    label: 'Service Catalog',
    items: [
      { label: 'Catalogs', route: '/catalog', id: 'cat_main' },
      { label: 'Shopping Cart', route: '/catalog/cart', id: 'cat_cart' },
    ]
  },
  {
    label: 'Knowledge',
    items: [
      { label: 'Articles', route: '/knowledge', id: 'kb_articles' },
    ]
  },
  {
    label: 'Reports',
    items: [
      { label: 'Reports', route: '/reports', id: 'rpt_main' },
    ]
  },
];

export default function Navigator() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const filter = state.navigatorFilter || '';
  const expandedSections = state.navigatorExpandedSections || [];

  const sid = searchParams.get('sid');
  const sidParam = sid ? `?sid=${sid}` : '';

  const filteredSections = useMemo(() => {
    if (!filter) return NAV_SECTIONS;
    const lf = filter.toLowerCase();
    return NAV_SECTIONS.map(section => {
      const matchItems = section.items.filter(item => item.label.toLowerCase().includes(lf));
      const matchSection = section.label.toLowerCase().includes(lf);
      if (matchSection) return section;
      if (matchItems.length > 0) return { ...section, items: matchItems };
      return null;
    }).filter(Boolean);
  }, [filter]);

  const handleNav = (item) => {
    let route = item.route;
    // Preserve sid parameter
    if (route.includes('?')) {
      route = sid ? route + `&sid=${sid}` : route;
    } else {
      route = route + sidParam;
    }
    dispatch({ type: 'ADD_HISTORY', payload: { label: item.label, route: item.route } });
    navigate(route);
  };

  const isItemActive = (item) => {
    const currentPath = location.pathname + location.search;
    // Check without sid param
    const itemRoute = item.route;
    if (itemRoute === currentPath) return true;
    // Check base path match
    const basePath = itemRoute.split('?')[0];
    if (location.pathname === basePath) {
      const itemParams = new URLSearchParams(itemRoute.split('?')[1] || '');
      const currentParams = searchParams;
      const itemFilter = itemParams.get('filter');
      const currentFilter = currentParams.get('filter');
      if (itemFilter && currentFilter && itemFilter === currentFilter) return true;
      if (!itemFilter && !currentFilter && basePath === location.pathname) return true;
    }
    return false;
  };

  const isFavorited = (item) => {
    return (state.favorites || []).some(f => f.route === item.route);
  };

  const toggleFavorite = (e, item) => {
    e.stopPropagation();
    if (isFavorited(item)) {
      dispatch({ type: 'REMOVE_FAVORITE', payload: item.route });
    } else {
      dispatch({ type: 'ADD_FAVORITE', payload: { label: item.label, route: item.route } });
    }
  };

  const renderAllModules = () => (
    <div className="sn-nav-tree">
      {filteredSections.map(section => {
        const isExpanded = expandedSections.includes(section.label) || filter;
        return (
          <div key={section.label} className="sn-nav-section">
            <button
              className="sn-nav-section-header"
              onClick={() => dispatch({ type: 'TOGGLE_NAV_SECTION', payload: section.label })}
            >
              <span className={`sn-nav-section-arrow ${isExpanded ? 'expanded' : ''}`}>{'\u25B6'}</span>
              {section.label}
            </button>
            {isExpanded && section.items.map(item => (
              <div key={item.id} className={`sn-nav-item-row ${isItemActive(item) ? 'active' : ''}`}>
                <a
                  className="sn-nav-item-label"
                  onClick={() => handleNav(item)}
                >
                  {item.label}
                </a>
                <button
                  className={`sn-nav-star-btn ${isFavorited(item) ? 'starred' : ''}`}
                  onClick={(e) => toggleFavorite(e, item)}
                  title={isFavorited(item) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorited(item) ? '\u2B50' : '\u2606'}
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  const renderFavorites = () => (
    <div className="sn-nav-tree">
      {(state.favorites || []).length === 0 ? (
        <div className="sn-nav-empty">No favorites yet. Star items to add them here.</div>
      ) : (
        (state.favorites || []).map((fav, i) => (
          <div key={i} className="sn-nav-item-row">
            <a className="sn-nav-item-label sn-nav-favorites-item" onClick={() => navigate(fav.route + sidParam)}>
              {'\u2B50'} {fav.label}
            </a>
            <button
              className="sn-nav-star-btn starred"
              onClick={() => dispatch({ type: 'REMOVE_FAVORITE', payload: fav.route })}
              title="Remove from favorites"
            >
              {'\u2B50'}
            </button>
          </div>
        ))
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="sn-nav-tree">
      {(state.history || []).length === 0 ? (
        <div className="sn-nav-empty">No recent history.</div>
      ) : (
        (state.history || []).map((item, i) => (
          <a key={i} className="sn-nav-history-item" onClick={() => navigate(item.route + sidParam)}>
            <span>{item.label}</span>
            {item.timestamp && (
              <span className="sn-nav-history-time">
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </span>
            )}
          </a>
        ))
      )}
    </div>
  );

  return (
    <div className="sn-navigator">
      <div className="sn-nav-filter">
        <input
          type="text"
          placeholder="Filter navigator"
          value={filter}
          onChange={e => dispatch({ type: 'SET_NAVIGATOR_FILTER', payload: e.target.value })}
        />
        {filter && (
          <button className="sn-nav-filter-clear" onClick={() => dispatch({ type: 'SET_NAVIGATOR_FILTER', payload: '' })}>
            {'\u2715'}
          </button>
        )}
      </div>

      <div className="sn-nav-tabs">
        <button className={`sn-nav-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')} title="All">
          {'\u{1F4CB}'}
        </button>
        <button className={`sn-nav-tab ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')} title="Favorites">
          {'\u2B50'}
        </button>
        <button className={`sn-nav-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')} title="History">
          {'\u{1F550}'}
        </button>
      </div>

      {activeTab === 'all' && renderAllModules()}
      {activeTab === 'favorites' && renderFavorites()}
      {activeTab === 'history' && renderHistory()}
    </div>
  );
}
