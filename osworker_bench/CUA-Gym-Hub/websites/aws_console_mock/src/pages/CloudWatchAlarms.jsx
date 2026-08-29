import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, Plus } from 'lucide-react';
import { format } from 'date-fns';

const NAMESPACES = ['AWS/EC2', 'AWS/RDS', 'AWS/Lambda', 'AWS/S3', 'AWS/ApplicationELB', 'AWS/Billing', 'AWS/DynamoDB', 'AWS/SQS'];
const STATISTICS = ['Average', 'Sum', 'Minimum', 'Maximum', 'SampleCount'];
const COMPARISONS = ['GreaterThanThreshold', 'GreaterThanOrEqualToThreshold', 'LessThanThreshold', 'LessThanOrEqualToThreshold'];

export default function CloudWatchAlarms() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [detailName, setDetailName] = useState(null);
  const [form, setForm] = useState({ name: '', namespace: 'AWS/EC2', metric: '', statistic: 'Average', period: 300, threshold: 0, comparison: 'GreaterThanThreshold', description: '' });

  const alarms = state.cloudwatch.alarms.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.metric.toLowerCase().includes(q) || a.namespace.toLowerCase().includes(q);
  });

  const detail = detailName ? state.cloudwatch.alarms.find(a => a.name === detailName) : null;

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch({ type: 'CREATE_ALARM', payload: {
      ...form, state: 'INSUFFICIENT_DATA', evaluationPeriods: 1, dimensions: [],
      actions: [], updated: new Date().toISOString()
    }});
    addFlash('success', `Successfully created alarm "${form.name}"`);
    setForm({ name: '', namespace: 'AWS/EC2', metric: '', statistic: 'Average', period: 300, threshold: 0, comparison: 'GreaterThanThreshold', description: '' });
    setShowCreate(false);
  };

  const handleDelete = () => {
    selected.forEach(name => dispatch({ type: 'DELETE_ALARM', payload: name }));
    addFlash('success', `Deleted ${selected.length} alarm(s)`);
    setSelected([]); setDetailName(null);
  };

  return (
    <div className="space-y-0">
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Alarms ({alarms.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            {selected.length > 0 && <button className="aws-btn aws-btn-secondary text-xs" onClick={handleDelete}>Delete</button>}
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}><Plus size={14} className="inline mr-1" />Create alarm</button>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="aws-input pl-8" placeholder="Filter alarms" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="aws-table">
            <thead>
              <tr><th className="w-8"><input type="checkbox" onChange={e => setSelected(e.target.checked ? alarms.map(a=>a.name) : [])} /></th>
              <th>Name</th><th>State</th><th>Metric</th><th>Namespace</th><th>Threshold</th><th>Description</th></tr>
            </thead>
            <tbody>
              {alarms.map(a => (
                <tr key={a.name} className={`cursor-pointer ${selected.includes(a.name) ? 'bg-blue-50/50' : ''}`} onClick={() => setDetailName(a.name)}>
                  <td onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(a.name)} onChange={e => setSelected(e.target.checked ? [...selected, a.name] : selected.filter(x=>x!==a.name))} />
                  </td>
                  <td className="font-medium text-aws-blue">{a.name}</td>
                  <td>
                    <span className={`aws-badge ${a.state === 'OK' ? 'bg-green-50 text-green-700' : a.state === 'ALARM' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{a.state}</span>
                  </td>
                  <td>{a.metric}</td>
                  <td>{a.namespace}</td>
                  <td>{a.comparisonOperator?.replace(/([A-Z])/g, ' $1').trim()} {a.threshold}</td>
                  <td className="text-xs text-aws-text-secondary max-w-xs truncate">{a.description}</td>
                </tr>
              ))}
              {alarms.length === 0 && <tr><td colSpan="7" className="text-center py-8 text-aws-text-secondary">No alarms found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">Showing 1-{alarms.length} of {alarms.length} items</div>
      </div>

      {detail && (
        <div className="aws-card mt-0 border-t-0">
          <h3 className="font-bold text-sm mb-3">Alarm Details: {detail.name}</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div><span className="text-aws-text-secondary">State:</span> <span className={`ml-2 font-medium ${detail.state === 'ALARM' ? 'text-red-600' : detail.state === 'OK' ? 'text-green-600' : 'text-gray-500'}`}>{detail.state}</span></div>
            <div><span className="text-aws-text-secondary">Namespace:</span> <span className="ml-2">{detail.namespace}</span></div>
            <div><span className="text-aws-text-secondary">Metric:</span> <span className="ml-2">{detail.metric}</span></div>
            <div><span className="text-aws-text-secondary">Statistic:</span> <span className="ml-2">{detail.statistic}</span></div>
            <div><span className="text-aws-text-secondary">Period:</span> <span className="ml-2">{detail.period}s</span></div>
            <div><span className="text-aws-text-secondary">Threshold:</span> <span className="ml-2">{detail.threshold}</span></div>
            <div><span className="text-aws-text-secondary">Comparison:</span> <span className="ml-2">{detail.comparisonOperator}</span></div>
            <div><span className="text-aws-text-secondary">Last Updated:</span> <span className="ml-2">{detail.updated ? format(new Date(detail.updated), 'MMM d, yyyy h:mm a') : '-'}</span></div>
            <div className="col-span-2"><span className="text-aws-text-secondary">Description:</span> <span className="ml-2">{detail.description}</span></div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-lg border border-aws-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 sticky top-0">
              <h3 className="font-bold">Create alarm</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Alarm name</label>
                <input className="aws-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><label className="block text-sm font-bold mb-1">Description</label>
                <input className="aws-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div><label className="block text-sm font-bold mb-1">Namespace</label>
                <select className="aws-input" value={form.namespace} onChange={e => setForm({...form, namespace: e.target.value})}>
                  {NAMESPACES.map(n => <option key={n} value={n}>{n}</option>)}
                </select></div>
              <div><label className="block text-sm font-bold mb-1">Metric name</label>
                <input className="aws-input" value={form.metric} onChange={e => setForm({...form, metric: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">Statistic</label>
                  <select className="aws-input" value={form.statistic} onChange={e => setForm({...form, statistic: e.target.value})}>
                    {STATISTICS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select></div>
                <div><label className="block text-sm font-bold mb-1">Period (seconds)</label>
                  <select className="aws-input" value={form.period} onChange={e => setForm({...form, period: Number(e.target.value)})}>
                    {[60,300,900,3600].map(p => <option key={p} value={p}>{p}s ({p/60}m)</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">Comparison</label>
                  <select className="aws-input" value={form.comparison} onChange={e => setForm({...form, comparison: e.target.value})}>
                    {COMPARISONS.map(c => <option key={c} value={c}>{c.replace(/([A-Z])/g, ' $1').trim()}</option>)}
                  </select></div>
                <div><label className="block text-sm font-bold mb-1">Threshold</label>
                  <input type="number" className="aws-input" value={form.threshold} onChange={e => setForm({...form, threshold: Number(e.target.value)})} required /></div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="aws-btn aws-btn-primary">Create alarm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
