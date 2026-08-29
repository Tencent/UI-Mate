import React from 'react';
import { useStore } from '../store/StoreContext';
import { Link } from 'react-router-dom';
import { Database, HardDrive, Shield, Settings } from 'lucide-react';

const STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  stopped: 'bg-red-100 text-red-800',
  creating: 'bg-blue-100 text-blue-800',
  deleting: 'bg-orange-100 text-orange-800',
};

export default function RDSDashboard() {
  const { state } = useStore();
  const databases = state.rds || [];
  const snapshots = state.rdsSnapshots || [];
  const subnetGroups = state.rdsSubnetGroups || [];
  const paramGroups = state.rdsParameterGroups || [];

  const statusCounts = {};
  databases.forEach(db => { statusCounts[db.status] = (statusCounts[db.status] || 0) + 1; });

  const engineCounts = {};
  databases.forEach(db => { engineCounts[db.engine] = (engineCounts[db.engine] || 0) + 1; });

  const engineColors = { mysql: '#00758F', postgres: '#336791', mariadb: '#003545', 'aurora-mysql': '#FF9900' };

  const rdsNotifications = (state.notifications || []).filter(n => n.service === 'RDS').slice(0, 5);

  const resources = [
    { label: 'DB Instances', count: databases.length, icon: Database, to: '/rds', color: '#0073BB' },
    { label: 'Snapshots', count: snapshots.length, icon: HardDrive, to: '/rds/snapshots', color: '#1D8102' },
    { label: 'Subnet Groups', count: subnetGroups.length, icon: Shield, to: '/rds/subnet-groups', color: '#DD6B10' },
    { label: 'Parameter Groups', count: paramGroups.length, icon: Settings, to: '/rds/parameter-groups', color: '#8C4FFF' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Amazon RDS Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {resources.map(r => (
          <Link key={r.label} to={r.to} className="aws-card hover:shadow-md transition-shadow" style={{ borderLeft: `4px solid ${r.color}` }}>
            <div className="flex items-center gap-2 text-xs text-aws-text-secondary uppercase font-bold"><r.icon size={14} /> {r.label}</div>
            <div className="text-3xl font-bold mt-1">{r.count}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="aws-card">
          <h3 className="font-bold text-sm mb-4">Instances by status</h3>
          {Object.keys(statusCounts).length === 0 ? (
            <p className="text-sm text-aws-text-secondary">No database instances</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`aws-badge ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-100 h-2 rounded-full">
                      <div className="h-2 rounded-full bg-aws-blue" style={{ width: `${(count / databases.length) * 100}%` }}></div>
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="aws-card">
          <h3 className="font-bold text-sm mb-4">Engine breakdown</h3>
          {Object.keys(engineCounts).length === 0 ? (
            <p className="text-sm text-aws-text-secondary">No databases</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(engineCounts).map(([engine, count]) => (
                <div key={engine} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{engine}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-100 h-3 rounded-full">
                      <div className="h-3 rounded-full" style={{ width: `${(count / databases.length) * 100}%`, backgroundColor: engineColors[engine] || '#666' }}></div>
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="aws-card">
        <h3 className="font-bold text-sm mb-4">Recent events</h3>
        {rdsNotifications.length === 0 ? (
          <p className="text-sm text-aws-text-secondary">No recent RDS events</p>
        ) : (
          <div className="space-y-2">
            {rdsNotifications.map((n, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className={`aws-badge mt-0.5 ${n.type === 'success' ? 'bg-green-100 text-green-800' : n.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{n.type}</span>
                <div>
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-aws-text-secondary">{n.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
