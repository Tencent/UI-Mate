import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';

const STATUS_COLORS = {
  available: 'bg-green-50 text-green-800',
  creating: 'bg-blue-50 text-blue-800',
  deleting: 'bg-orange-50 text-orange-800',
  stopped: 'bg-red-50 text-red-800',
  stopping: 'bg-yellow-50 text-yellow-800',
  starting: 'bg-blue-50 text-blue-800',
};

export default function RDSDetail() {
  const { dbId } = useParams();
  const { state } = useStore();
  const db = state.rds.find(d => d.id === dbId);
  const [tab, setTab] = useState('Connectivity & security');

  if (!db) {
    return <div className="p-8 text-center text-aws-text-secondary">Database not found.</div>;
  }

  const tabs = ['Connectivity & security', 'Monitoring', 'Logs & events', 'Configuration', 'Maintenance & backups', 'Tags'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">{db.id}</h1>
        <span className={`aws-badge ${STATUS_COLORS[db.status] || 'bg-gray-100 text-gray-800'}`}>{db.status}</span>
      </div>

      {/* Tab bar */}
      <div className="flex gap-4 border-b border-aws-border overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`pb-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${tab === t ? 'border-aws-blue text-aws-blue' : 'border-transparent text-aws-text-secondary hover:text-aws-text'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Connectivity & security' && (
        <div className="space-y-6">
          {/* Endpoint & port */}
          <div className="aws-card">
            <h3 className="font-bold text-sm mb-4">Endpoint & port</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-aws-text-secondary block mb-1">Endpoint</span>
                <span className="font-mono text-xs bg-gray-50 px-2 py-1 border border-gray-200 inline-block">{db.endpoint}</span>
              </div>
              <div>
                <span className="text-aws-text-secondary block mb-1">Port</span>
                <span className="font-medium">{db.port}</span>
              </div>
            </div>
          </div>

          {/* Networking */}
          <div className="aws-card">
            <h3 className="font-bold text-sm mb-4">Networking</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-aws-text-secondary">VPC:</span> <span className="font-mono ml-2 text-aws-blue">{db.vpcId}</span></div>
              <div><span className="text-aws-text-secondary">Subnet group:</span> <span className="ml-2">default-{db.vpcId?.slice(-8)}</span></div>
              <div><span className="text-aws-text-secondary">Availability zone:</span> <span className="ml-2">{db.az}</span></div>
              <div><span className="text-aws-text-secondary">Public accessibility:</span> <span className="ml-2">No</span></div>
            </div>
          </div>

          {/* Security */}
          <div className="aws-card">
            <h3 className="font-bold text-sm mb-4">Security</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <span className="text-aws-text-secondary">VPC security groups:</span>
                <span className="ml-2 text-aws-blue">{db.engine === 'postgres' ? 'db-access-sg' : 'db-access-sg'}</span>
                <span className="aws-badge bg-green-50 text-green-800 text-xs ml-2">Active</span>
              </div>
              <div><span className="text-aws-text-secondary">Certificate authority:</span> <span className="ml-2">rds-ca-rsa2048-g1</span></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Configuration' && (
        <div className="space-y-6">
          <div className="aws-card">
            <h3 className="font-bold text-sm mb-4">Instance specifications</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-aws-text-secondary">DB instance class:</span> <span className="ml-2 font-medium">{db.class}</span></div>
              <div><span className="text-aws-text-secondary">Engine:</span> <span className="ml-2">{db.engine} {db.engineVersion}</span></div>
              <div><span className="text-aws-text-secondary">Multi-AZ:</span> <span className="ml-2">{db.multiAZ ? 'Yes' : 'No'}</span></div>
              <div><span className="text-aws-text-secondary">DB instance identifier:</span> <span className="ml-2 font-medium">{db.id}</span></div>
            </div>
          </div>

          <div className="aws-card">
            <h3 className="font-bold text-sm mb-4">Storage</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-aws-text-secondary">Storage type:</span> <span className="ml-2">{db.storageType}</span></div>
              <div><span className="text-aws-text-secondary">Allocated storage:</span> <span className="ml-2">{db.storage} GiB</span></div>
              <div><span className="text-aws-text-secondary">Storage autoscaling:</span> <span className="ml-2">Disabled</span></div>
              <div><span className="text-aws-text-secondary">IOPS:</span> <span className="ml-2">{db.storageType === 'io1' ? '3000' : 'N/A'}</span></div>
            </div>
          </div>

          <div className="aws-card">
            <h3 className="font-bold text-sm mb-4">Database options</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-aws-text-secondary">Parameter group:</span> <span className="ml-2">default.{db.engine}{db.engineVersion?.split('.')[0]}</span></div>
              <div><span className="text-aws-text-secondary">Option group:</span> <span className="ml-2">default:{db.engine}-{db.engineVersion?.split('.')[0]}-{db.engineVersion?.split('.')[1]}</span></div>
              <div><span className="text-aws-text-secondary">Deletion protection:</span> <span className="ml-2">Disabled</span></div>
              <div><span className="text-aws-text-secondary">Created:</span> <span className="ml-2">{db.created ? format(new Date(db.created), 'MMM d, yyyy h:mm a') : '-'}</span></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Tags' && (
        <div className="aws-card">
          <h3 className="font-bold text-sm mb-4">Tags</h3>
          <table className="aws-table">
            <thead><tr><th>Key</th><th>Value</th></tr></thead>
            <tbody>
              {(db.tags || []).map((t, i) => (
                <tr key={i}><td>{t.Key}</td><td>{t.Value}</td></tr>
              ))}
              {(!db.tags || db.tags.length === 0) && (
                <tr><td colSpan="2" className="text-center text-aws-text-secondary py-4">No tags</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Monitoring' && (
        <div className="aws-card">
          <h3 className="font-bold text-sm mb-4">CloudWatch metrics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'CPU Utilization', unit: '%', seed: 1 },
              { name: 'Database Connections', unit: '', seed: 2 },
              { name: 'Free Storage Space', unit: 'GB', seed: 3 },
              { name: 'Read IOPS', unit: '/s', seed: 4 },
              { name: 'Write IOPS', unit: '/s', seed: 5 },
              { name: 'Read Latency', unit: 'ms', seed: 6 },
            ].map(({ name, unit, seed }) => {
              const pts = Array.from({ length: 20 }, (_, i) => {
                const v = 20 + 15 * Math.sin(i * 0.5 + seed) + 5 * Math.cos(i * 0.3 + seed * 2);
                return `${i * 10},${40 - v * 0.8}`;
              }).join(' ');
              const lastVal = (20 + 15 * Math.sin(19 * 0.5 + seed)).toFixed(1);
              return (
                <div key={name} className="border border-aws-border p-3" style={{ borderRadius: 8 }}>
                  <div className="text-xs font-medium text-aws-text-secondary mb-1">{name}</div>
                  <div className="text-sm font-bold mb-1">{lastVal}{unit}</div>
                  <svg width="100%" height="40" viewBox="0 0 200 40">
                    <polyline fill="none" stroke="#0972D3" strokeWidth="1.5" points={pts} />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'Logs & events' && (
        <div className="space-y-4">
          <div className="aws-card">
            <h3 className="font-bold text-sm mb-4">Recent events</h3>
            <table className="aws-table">
              <thead><tr><th>Time</th><th>Event</th></tr></thead>
              <tbody>
                <tr>
                  <td className="text-sm text-aws-text-secondary">{db.created ? format(new Date(db.created), 'MMM d, yyyy h:mm a') : '-'}</td>
                  <td className="text-sm">DB instance created</td>
                </tr>
                <tr>
                  <td className="text-sm text-aws-text-secondary">{db.created ? format(new Date(new Date(db.created).getTime() + 300000), 'MMM d, yyyy h:mm a') : '-'}</td>
                  <td className="text-sm">DB instance started: {db.id}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="aws-card">
            <h3 className="font-bold text-sm mb-4">Logs</h3>
            <div className="text-sm text-aws-text-secondary">No log exports configured. Enable log exports in the database modification settings.</div>
          </div>
        </div>
      )}

      {tab === 'Maintenance & backups' && (
        <div className="space-y-6">
          <div className="aws-card">
            <h3 className="font-bold text-sm mb-4">Maintenance</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-aws-text-secondary">Maintenance window:</span> <span className="ml-2">Sun:05:00-Sun:05:30 UTC</span></div>
              <div><span className="text-aws-text-secondary">Pending maintenance:</span> <span className="ml-2 text-aws-success">None</span></div>
              <div><span className="text-aws-text-secondary">Auto minor version upgrade:</span> <span className="ml-2">Enabled</span></div>
            </div>
          </div>
          <div className="aws-card">
            <h3 className="font-bold text-sm mb-4">Backup</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-aws-text-secondary">Automated backup:</span> <span className="ml-2">Enabled</span></div>
              <div><span className="text-aws-text-secondary">Backup retention period:</span> <span className="ml-2">7 days</span></div>
              <div><span className="text-aws-text-secondary">Backup window:</span> <span className="ml-2">03:00-03:30 UTC</span></div>
              <div><span className="text-aws-text-secondary">Latest restorable time:</span> <span className="ml-2">{format(new Date(), 'MMM d, yyyy h:mm a')}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
