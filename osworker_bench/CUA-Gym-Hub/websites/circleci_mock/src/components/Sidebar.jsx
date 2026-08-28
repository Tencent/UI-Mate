import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { withCurrentSearch } from '../utils/navigation.js';

const icons = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  pipelines: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>,
  projects: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  deploys: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  insights: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  runners: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  plan: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
};

const navItems = [
  { label: 'Home', icon: 'home', path: '/home' },
  { label: 'Pipelines', icon: 'pipelines', path: '/pipelines' },
  { label: 'Projects', icon: 'projects', path: '/projects' },
  { label: 'Deploys', icon: 'deploys', path: '/deploys' },
  { label: 'Insights', icon: 'insights', path: '/insights' },
  { label: 'Runners', icon: 'runners', path: '/runners' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
  { label: 'Plan', icon: 'plan', path: '/plan' }
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const orgRef = useRef(null);
  const searchTimer = useRef(null);

  const isActive = (path) => location.pathname.startsWith(path);
  const toPath = (path) => withCurrentSearch(path, location.search);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (orgRef.current && !orgRef.current.contains(e.target)) {
        setOrgMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setOrgMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSearch = (q) => {
    setSearchQuery(q);
    dispatch({ type: 'SET_SEARCH_QUERY', payload: { query: q } });
    clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults(null); setSearchOpen(false); return; }
    searchTimer.current = setTimeout(() => {
      const ql = q.toLowerCase();
      const matchProjects = state.projects.filter(p => p.name.toLowerCase().includes(ql)).slice(0, 4);
      const matchPipelines = state.pipelines.filter(p => {
        const proj = state.projects.find(pr => pr.id === p.projectId);
        return (proj && proj.name.toLowerCase().includes(ql)) ||
          String(p.number).includes(ql) ||
          p.vcs.branch.toLowerCase().includes(ql);
      }).slice(0, 4);
      setSearchResults({ projects: matchProjects, pipelines: matchPipelines });
      setSearchOpen(true);
    }, 300);
  };

  const handleResultClick = (type, item) => {
    setSearchQuery('');
    setSearchOpen(false);
    if (type === 'project') {
      navigate(toPath('/projects'));
    } else if (type === 'pipeline') {
      navigate(toPath(`/pipelines/${item.id}`));
    }
  };

  const getInitials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className="sidebar">
      <div className="sidebar-org" ref={orgRef} onClick={() => setOrgMenuOpen(open => !open)}>
        <div className="org-avatar">A</div>
        <span className="org-name">{state.organization.name}</span>
        <span className="org-chevron">▾</span>
        {orgMenuOpen && (
          <div className="org-dropdown" onClick={e => e.stopPropagation()}>
            <div className="org-dropdown-title">{state.organization.name}</div>
            <div className="org-dropdown-meta">{state.organization.slug} · {state.organization.plan}</div>
            <button onClick={() => { setOrgMenuOpen(false); navigate('/settings'); }}>Organization settings</button>
            <button onClick={() => { setOrgMenuOpen(false); navigate('/plan'); }}>Plan and usage</button>
          </div>
        )}
      </div>

      <div className="sidebar-search" ref={searchRef}>
        <span className="sidebar-search-icon">{icons.search}</span>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => searchResults && setSearchOpen(true)}
        />
        {searchOpen && searchResults && (
          <div className="search-dropdown">
            {searchResults.projects.length > 0 && (
              <>
                <div className="search-group-label">Projects</div>
                {searchResults.projects.map(p => (
                  <div key={p.id} className="search-result-item" onClick={() => handleResultClick('project', p)}>
                    <span>{icons.projects}</span>
                    {p.name}
                  </div>
                ))}
              </>
            )}
            {searchResults.pipelines.length > 0 && (
              <>
                <div className="search-group-label">Pipelines</div>
                {searchResults.pipelines.map(p => {
                  const proj = state.projects.find(pr => pr.id === p.projectId);
                  return (
                    <div key={p.id} className="search-result-item" onClick={() => handleResultClick('pipeline', p)}>
                      <span>{icons.pipelines}</span>
                      {proj ? proj.name : ''} #{p.number} · {p.vcs.branch}
                    </div>
                  );
                })}
              </>
            )}
            {searchResults.projects.length === 0 && searchResults.pipelines.length === 0 && (
              <div className="search-result-item" style={{ color: '#888' }}>No results found</div>
            )}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div
            key={item.path}
            className={`nav-item${isActive(item.path) ? ' active' : ''}`}
            onClick={() => navigate(toPath(item.path))}
          >
            {icons[item.icon]}
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{getInitials(state.currentUser.name)}</div>
        <span className="user-name">{state.currentUser.name}</span>
      </div>
    </aside>
  );
}
