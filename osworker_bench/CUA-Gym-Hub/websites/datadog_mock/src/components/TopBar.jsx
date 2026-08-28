import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';

const timeRanges = ['Past 15 Minutes', 'Past 1 Hour', 'Past 4 Hours', 'Past 1 Day', 'Past 1 Week'];

const pageTitles = {
  '/dashboards': 'Dashboards',
  '/infrastructure/hosts': 'Infrastructure',
  '/infrastructure/host-map': 'Host Map',
  '/infrastructure/containers': 'Containers',
  '/monitors': 'Manage Monitors',
  '/monitors/new': 'Create Monitor',
  '/logs': 'Log Explorer',
  '/apm/services': 'Services',
  '/apm/traces': 'Traces',
  '/apm/service-map': 'Service Map',
  '/metrics': 'Metrics Explorer',
  '/events': 'Events',
  '/incidents': 'Incidents',
  '/notebooks': 'Notebooks',
};

export default function TopBar() {
  const { state, dispatch } = useAppContext();
  const location = useLocation();

  // Determine page title
  let title = pageTitles[location.pathname] || '';
  if (location.pathname.startsWith('/dashboards/') && !title) {
    const dash = state.dashboards.find(d => d.id === location.pathname.split('/').pop());
    title = dash ? dash.title : 'Dashboard';
  }
  if (location.pathname.startsWith('/monitors/') && location.pathname !== '/monitors/new' && !title) {
    title = 'Monitor Detail';
  }
  if (location.pathname.startsWith('/apm/services/') && location.pathname !== '/apm/services') {
    title = 'Service Detail';
  }

  // Breadcrumb
  let breadcrumb = null;
  if (location.pathname.startsWith('/dashboards/') && location.pathname !== '/dashboards') {
    breadcrumb = { label: 'Dashboards', path: '/dashboards' };
  } else if (location.pathname.startsWith('/monitors/') && location.pathname !== '/monitors') {
    breadcrumb = { label: 'Monitors', path: '/monitors' };
  } else if (location.pathname.startsWith('/apm/services/') && location.pathname !== '/apm/services') {
    breadcrumb = { label: 'Services', path: '/apm/services' };
  }

  // Active alerts count
  const alertCount = state.monitors.filter(m => m.status === 'Alert').length;

  return (
    <div className="top-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {breadcrumb && (
          <>
            <Link to={withCurrentSearch(breadcrumb.path, location.search)} style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              {breadcrumb.label}
            </Link>
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>/</span>
          </>
        )}
        <span className="page-title">{title}</span>
      </div>
      <span className="spacer" />

      {alertCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#fde8e8', borderRadius: 12, fontSize: 12, fontWeight: 600, color: '#E74C3C' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E74C3C' }} />
          {alertCount} Alert{alertCount > 1 ? 's' : ''}
        </div>
      )}

      <div className="time-range-picker">
        <select
          value={state.selectedTimeRange}
          onChange={e => dispatch({ type: 'SET_TIME_RANGE', payload: e.target.value })}
        >
          {timeRanges.map(tr => <option key={tr} value={tr}>{tr}</option>)}
        </select>
      </div>
    </div>
  );
}
