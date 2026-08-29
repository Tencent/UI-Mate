import React from 'react';
import { useStore } from '../store/StoreContext';
import { Link } from 'react-router-dom';
import { Network, GitBranch, Route, Globe, ArrowUpRight, Shield } from 'lucide-react';

const cards = [
  { key: 'vpcs', label: 'VPCs', icon: Network, path: '/vpc/vpcs', color: 'text-blue-600' },
  { key: 'subnets', label: 'Subnets', icon: GitBranch, path: '/vpc/subnets', color: 'text-green-600' },
  { key: 'routeTables', label: 'Route Tables', icon: Route, path: '/vpc/route-tables', color: 'text-purple-600' },
  { key: 'internetGateways', label: 'Internet Gateways', icon: Globe, path: '/vpc/internet-gateways', color: 'text-orange-600' },
  { key: 'natGateways', label: 'NAT Gateways', icon: ArrowUpRight, path: '/vpc/nat-gateways', color: 'text-teal-600' },
  { key: 'networkAcls', label: 'Network ACLs', icon: Shield, path: '/vpc/network-acls', color: 'text-red-600' },
];

export default function VPCDashboard() {
  const { state } = useStore();
  const vpc = state.vpc;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-aws-text">VPC Dashboard</h1>
      <div className="aws-card">
        <h2 className="font-bold text-sm mb-1">Resources by Region</h2>
        <p className="text-xs text-aws-text-secondary mb-4">Region: {state.user.region}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map(c => {
            const Icon = c.icon;
            const count = (vpc[c.key] || []).length;
            return (
              <Link key={c.key} to={c.path} className="border border-aws-border rounded p-4 hover:bg-gray-50 hover:border-aws-blue transition-colors cursor-pointer block">
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={20} className={c.color} />
                  <span className="text-sm font-medium text-aws-text">{c.label}</span>
                </div>
                <div className="text-2xl font-bold text-aws-text">{count}</div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="aws-card">
        <h2 className="font-bold text-sm mb-3">VPCs</h2>
        <table className="aws-table">
          <thead>
            <tr><th>VPC ID</th><th>Name</th><th>State</th><th>CIDR</th><th>Default</th></tr>
          </thead>
          <tbody>
            {vpc.vpcs.map(v => (
              <tr key={v.id}>
                <td className="font-mono text-sm text-aws-blue">{v.id}</td>
                <td className="font-medium">{v.name}</td>
                <td><span className="aws-badge bg-green-50 text-green-700">{v.state}</span></td>
                <td className="font-mono text-sm">{v.cidr}</td>
                <td>{v.isDefault ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
