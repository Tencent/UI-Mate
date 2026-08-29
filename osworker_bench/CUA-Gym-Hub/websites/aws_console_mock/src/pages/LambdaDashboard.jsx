import React from 'react';
import { useStore } from '../store/StoreContext';
import { Link } from 'react-router-dom';
import { Zap, Layers, Clock } from 'lucide-react';

export default function LambdaDashboard() {
  const { state } = useStore();
  const functions = state.lambda || [];
  const totalFunctions = functions.length;
  const totalInvocations = functions.reduce((sum, f) => sum + (f.invocations || 0), 0);

  const runtimeCounts = {};
  functions.forEach(f => {
    const rt = f.runtime || 'unknown';
    runtimeCounts[rt] = (runtimeCounts[rt] || 0) + 1;
  });

  const runtimeBadgeColor = (rt) => {
    if (rt.startsWith('nodejs')) return 'bg-green-100 text-green-800';
    if (rt.startsWith('python')) return 'bg-blue-100 text-blue-800';
    if (rt.startsWith('java')) return 'bg-red-100 text-red-800';
    if (rt.startsWith('go')) return 'bg-cyan-100 text-cyan-800';
    if (rt.startsWith('dotnet')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const recentFunctions = [...functions]
    .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Lambda Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="aws-card" style={{ borderLeft: '4px solid #FF9900' }}>
          <div className="flex items-center gap-2 text-xs text-aws-text-secondary uppercase font-bold"><Zap size={14} /> Total functions</div>
          <div className="text-3xl font-bold mt-1">{totalFunctions}</div>
          <Link to="/lambda" className="text-xs text-aws-blue hover:underline mt-2 block">View all functions</Link>
        </div>
        <div className="aws-card" style={{ borderLeft: '4px solid #0073BB' }}>
          <div className="flex items-center gap-2 text-xs text-aws-text-secondary uppercase font-bold"><Clock size={14} /> Total invocations</div>
          <div className="text-3xl font-bold mt-1">{totalInvocations.toLocaleString()}</div>
        </div>
        <div className="aws-card" style={{ borderLeft: '4px solid #1D8102' }}>
          <div className="flex items-center gap-2 text-xs text-aws-text-secondary uppercase font-bold"><Layers size={14} /> Runtimes</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(runtimeCounts).map(([rt, count]) => (
              <span key={rt} className={`aws-badge ${runtimeBadgeColor(rt)}`}>{rt} ({count})</span>
            ))}
          </div>
        </div>
      </div>

      <div className="aws-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">Recently modified functions</h3>
          <Link to="/lambda" className="text-xs text-aws-blue hover:underline">View all</Link>
        </div>
        <table className="aws-table">
          <thead><tr><th>Function name</th><th>Runtime</th><th>Memory</th><th>Last modified</th></tr></thead>
          <tbody>
            {recentFunctions.map(f => (
              <tr key={f.name}>
                <td><Link to={`/lambda/${f.name}`} className="text-aws-blue font-medium hover:underline">{f.name}</Link></td>
                <td><span className={`aws-badge ${runtimeBadgeColor(f.runtime)}`}>{f.runtime}</span></td>
                <td>{f.memorySize} MB</td>
                <td className="text-xs text-aws-text-secondary">{new Date(f.lastModified).toLocaleDateString()}</td>
              </tr>
            ))}
            {recentFunctions.length === 0 && (
              <tr><td colSpan={4} className="text-center text-aws-text-secondary">No functions created yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
