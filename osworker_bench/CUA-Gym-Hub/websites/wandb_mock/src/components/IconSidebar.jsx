import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Home, Search, BarChart3, Table2, SlidersHorizontal, Box, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function IconSidebar() {
  const navigate = useNavigate();
  const { entity, project } = useParams();
  const location = useLocation();
  const path = location.pathname;
  const { state } = useApp();
  const [showSearchHint, setShowSearchHint] = useState(false);

  const hasProject = entity && project;
  const basePath = hasProject ? `/${entity}/${project}` : '';

  const items = hasProject ? [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: null, action: 'search' },
    { icon: BarChart3, label: 'Workspace', path: `${basePath}/workspace` },
    { icon: Table2, label: 'Runs', path: `${basePath}/runs` },
    { icon: SlidersHorizontal, label: 'Sweeps', path: `${basePath}/sweeps` },
    { icon: Box, label: 'Artifacts', path: `${basePath}/artifacts` },
    { icon: FileText, label: 'Reports', path: `${basePath}/reports` },
  ] : [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: null, action: 'search' },
  ];

  const isActive = (itemPath) => {
    if (!itemPath) return false;
    if (itemPath === '/') return path === '/';
    return path.startsWith(itemPath);
  };

  const handleClick = (item) => {
    if (item.action === 'search') {
      // Trigger global search via keyboard event simulation
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="icon-sidebar">
      {items.map((item, i) => (
        <button
          key={i}
          className={`sidebar-icon${isActive(item.path) ? ' active' : ''}`}
          title={item.label}
          onClick={() => handleClick(item)}
        >
          <item.icon size={18} />
        </button>
      ))}
    </div>
  );
}
