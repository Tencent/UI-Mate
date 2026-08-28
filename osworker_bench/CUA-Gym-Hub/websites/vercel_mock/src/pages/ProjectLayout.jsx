import { Link, Outlet, useParams, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const PROJECT_NAV = [
  { label: 'Project', path: 'overview' },
  { label: 'Deployments', path: 'deployments' },
  { label: 'Analytics', path: 'analytics' },
  { label: 'Speed Insights', path: 'speed-insights' },
  { label: 'Logs', path: 'logs' },
  { label: 'Settings', path: 'settings' },
];

export default function ProjectLayout() {
  const { projectId } = useParams();
  const { state } = useApp();
  const location = useLocation();

  const project = state.projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="page-body">
        <p style={{ color: 'var(--fg-muted)' }}>Project not found.</p>
        <Link to="/" style={{ color: 'var(--accent-blue)' }}>Back to Overview</Link>
      </div>
    );
  }

  const isNavActive = (path) => {
    const base = `/project/${projectId}/${path}`;
    if (path === 'settings') return location.pathname.startsWith(base);
    return location.pathname === base || location.pathname.startsWith(base + '/');
  };

  return (
    <div>
      <nav className="project-nav">
        {PROJECT_NAV.map(({ label, path }) => (
          <Link
            key={path}
            to={`/project/${projectId}/${path}`}
            className={`project-nav-item${isNavActive(path) ? ' active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Outlet context={{ project }} />
    </div>
  );
}
