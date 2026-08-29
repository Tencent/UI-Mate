import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Plus, Grid, Key, Monitor, Globe, Database, Table2 as Table, ArrowRight, BookOpen, BarChart, Shield, DollarSign } from 'lucide-react';

export default function Home() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [toolStatus, setToolStatus] = React.useState('');

  const services = [
    { label: '+ Create a resource', icon: Plus, color: '#0078d4', path: '/create-resource' },
    { label: 'All resources', icon: Grid, color: '#0078d4', path: '/all-resources' },
    { label: 'Subscriptions', icon: Key, color: '#e3a21a', path: '/subscriptions' },
    { label: 'Virtual machines', icon: Monitor, color: '#0078d4', path: '/virtual-machines' },
    { label: 'App Services', icon: Globe, color: '#0078d4', path: '/app-services' },
    { label: 'Storage accounts', icon: Database, color: '#0078d4', path: '/storage-accounts' },
    { label: 'SQL databases', icon: Table, color: '#0078d4', path: '/sql-databases' },
    { label: 'More services', icon: ArrowRight, color: '#605e5c', path: '/all-services' },
  ];

  const navigateCards = [
    { label: 'Subscriptions', icon: Key, path: '/subscriptions' },
    { label: 'Resource groups', icon: Grid, path: '/resource-groups' },
    { label: 'All resources', icon: Grid, path: '/all-resources' },
    { label: 'Dashboard', icon: BarChart, path: '/dashboard' },
  ];

  const tools = [
    { label: 'Microsoft Learn', desc: 'Learn about Xzure services', icon: BookOpen, path: '/all-services', status: 'Microsoft Learn opened locally.' },
    { label: 'Xzure Monitor', desc: 'Monitor your resources', icon: BarChart, path: '/activity-log' },
    { label: 'Security Center', desc: 'Protect your workloads', icon: Shield, path: '/cost-management' },
    { label: 'Cost Management', desc: 'Manage your spending', icon: DollarSign, path: '/cost-management' },
  ];

  const getTimeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getResourcePath = (r) => {
    if (r.type === 'Virtual machine') return `/virtual-machines/${state.virtualMachines.find(vm => vm.name === r.name)?.id || ''}`;
    if (r.type === 'Storage account') return `/storage-accounts/${state.storageAccounts.find(sa => sa.name === r.name)?.id || ''}`;
    if (r.type === 'App Service') return `/app-services/${state.appServices.find(a => a.name === r.name)?.id || ''}`;
    if (r.type === 'SQL database') return `/sql-databases/${state.sqlDatabases.find(db => db.name === r.name)?.id || ''}`;
    if (r.type === 'Resource group') return `/resource-groups/${r.name}`;
    return '#';
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home' }]} />

      {/* Xzure services row */}
      <div className="home-section">
        <div className="section-header">Xzure services</div>
        <div className="home-services-row">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="home-service-tile" onClick={() => navigate(s.path)}>
                <div className="home-service-icon" style={{ color: s.color }}>
                  <Icon size={32} />
                </div>
                <div className="home-service-label">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent resources */}
      <div className="home-section">
        <div className="section-header">Recent resources</div>
        {state.recentResources.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--xzure-text-secondary)', padding: '24px' }}>
            No recent resources
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <table className="xzure-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Resource group</th>
                  <th>Last viewed</th>
                </tr>
              </thead>
              <tbody>
                {state.recentResources.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    <td><Link to={getResourcePath(r)}>{r.name}</Link></td>
                    <td>{r.type}</td>
                    <td>{r.resourceGroup || '-'}</td>
                    <td>{getTimeAgo(r.lastViewed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Navigate */}
      <div className="home-section">
        <div className="section-header">Navigate</div>
        <div className="navigate-cards">
          {navigateCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="navigate-card" onClick={() => navigate(card.path)}>
                <Icon size={24} />
                <span>{card.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tools */}
      <div className="home-section">
        <div className="section-header">Tools</div>
        {toolStatus && (
          <div className="card" style={{ marginBottom: '12px', padding: '10px 12px', color: 'var(--xzure-text-secondary)' }}>
            {toolStatus}
          </div>
        )}
        <div className="navigate-cards">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <div key={i} className="navigate-card" onClick={() => {
                if (tool.status) setToolStatus(tool.status);
                navigate(tool.path);
              }}>
                <Icon size={24} />
                <div>
                  <div style={{ fontWeight: 600 }}>{tool.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--xzure-text-secondary)' }}>{tool.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
