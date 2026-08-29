import { useState } from 'react';
import { Link, Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const UNIQUE_SETTINGS_NAV = [
  { label: 'General', path: 'settings/general' },
  { label: 'Domains', path: 'settings/domains' },
  { label: 'Environment Variables', path: 'settings/environment-variables' },
  { label: 'Git', path: 'settings/git' },
  { label: 'Functions', path: 'settings/functions' },
];

export default function ProjectSettings() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname.endsWith(path) || location.pathname.includes(`/${path}`);
  };

  return (
    <div className="settings-layout">
      <nav className="settings-subnav">
        {UNIQUE_SETTINGS_NAV.map(({ label, path }) => (
          <Link
            key={path}
            to={`/project/${projectId}/${path}`}
            className={`settings-subnav-item${location.pathname.endsWith(path.split('/').pop()) || (path === 'settings/general' && location.pathname.endsWith('settings')) ? ' active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="settings-content">
        <Outlet />
      </div>
    </div>
  );
}
