import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw } from 'lucide-react';

export default function RDSSubnetGroups() {
  const { state, addFlash } = useStore();
  const [selectedGroup, setSelectedGroup] = useState(null);

  if (selectedGroup) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button className="text-aws-blue hover:underline text-sm" onClick={() => setSelectedGroup(null)}>Subnet groups</button>
          <span className="text-aws-text-secondary">/</span>
          <h1 className="text-xl font-bold">{selectedGroup.name}</h1>
        </div>
        <div className="aws-card grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-bold block">Name</span>{selectedGroup.name}</div>
          <div><span className="font-bold block">Description</span>{selectedGroup.description || '-'}</div>
          <div><span className="font-bold block">VPC</span><span className="font-mono text-xs">{selectedGroup.vpc}</span></div>
          <div><span className="font-bold block">Status</span><span className="aws-badge bg-green-100 text-green-800">{selectedGroup.status || 'Complete'}</span></div>
        </div>
        <div className="aws-card">
          <h3 className="font-bold text-sm mb-3">Subnets ({(selectedGroup.subnets || []).length})</h3>
          <table className="aws-table">
            <thead><tr><th>Subnet ID</th><th>Availability Zone</th><th>CIDR Block</th></tr></thead>
            <tbody>
              {(selectedGroup.subnets || []).map((s, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs">{typeof s === 'string' ? s : s.id}</td>
                  <td>{typeof s === 'string' ? '-' : s.az || '-'}</td>
                  <td className="font-mono text-xs">{typeof s === 'string' ? '-' : s.cidr || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="aws-card p-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
        <h2 className="font-bold text-lg">Subnet groups ({subnetGroups.length})</h2>
        <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
      </div>
      <table className="aws-table">
        <thead><tr><th>Name</th><th>Description</th><th>VPC</th><th>Status</th><th>Subnets</th></tr></thead>
        <tbody>
          {subnetGroups.length === 0 ? (
            <tr><td colSpan={5} className="text-center text-aws-text-secondary">No subnet groups</td></tr>
          ) : subnetGroups.map(g => (
            <tr key={g.name}>
              <td><button className="text-aws-blue font-medium hover:underline" onClick={() => setSelectedGroup(g)}>{g.name}</button></td>
              <td className="text-xs text-aws-text-secondary">{g.description || '-'}</td>
              <td className="font-mono text-xs">{g.vpc}</td>
              <td><span className="aws-badge bg-green-100 text-green-800">{g.status || 'Complete'}</span></td>
              <td>{(g.subnets || []).length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
