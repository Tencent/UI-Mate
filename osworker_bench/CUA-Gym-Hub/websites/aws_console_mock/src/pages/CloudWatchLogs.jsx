import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, Plus } from 'lucide-react';
import { format } from 'date-fns';

const RETENTIONS = [
  { label: 'Never expire', value: 0 },
  { label: '1 day', value: 1 },
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 },
  { label: '365 days', value: 365 },
];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function CloudWatchLogs() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [retention, setRetention] = useState(30);

  const logGroups = state.cloudwatch.logGroups.filter(lg => {
    if (!search) return true;
    return lg.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch({ type: 'CREATE_LOG_GROUP', payload: {
      name, storedBytes: 0, retentionDays: retention,
      created: new Date().toISOString(), streams: 0
    }});
    addFlash('success', `Successfully created log group "${name}"`);
    setName(''); setRetention(30); setShowCreate(false);
  };

  const handleDelete = () => {
    selected.forEach(name => dispatch({ type: 'DELETE_LOG_GROUP', payload: name }));
    addFlash('success', `Deleted ${selected.length} log group(s)`);
    setSelected([]);
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Log Groups ({logGroups.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            {selected.length > 0 && <button className="aws-btn aws-btn-secondary text-xs" onClick={handleDelete}>Delete</button>}
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}><Plus size={14} className="inline mr-1" />Create log group</button>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="aws-input pl-8" placeholder="Filter log groups" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="aws-table">
            <thead>
              <tr><th className="w-8"><input type="checkbox" onChange={e => setSelected(e.target.checked ? logGroups.map(l=>l.name) : [])} /></th>
              <th>Log group</th><th>Stored bytes</th><th>Retention</th><th>Streams</th><th>Created</th></tr>
            </thead>
            <tbody>
              {logGroups.map(lg => (
                <tr key={lg.name} className={selected.includes(lg.name) ? 'bg-blue-50/50' : ''}>
                  <td><input type="checkbox" checked={selected.includes(lg.name)} onChange={e => setSelected(e.target.checked ? [...selected, lg.name] : selected.filter(x=>x!==lg.name))} /></td>
                  <td className="font-medium text-aws-blue font-mono text-sm">{lg.name}</td>
                  <td>{formatBytes(lg.storedBytes)}</td>
                  <td>{lg.retentionDays ? `${lg.retentionDays} days` : 'Never expire'}</td>
                  <td>{lg.streams}</td>
                  <td>{lg.created ? format(new Date(lg.created), 'MMM d, yyyy') : '-'}</td>
                </tr>
              ))}
              {logGroups.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-aws-text-secondary">No log groups found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">Showing 1-{logGroups.length} of {logGroups.length} items</div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-lg border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create log group</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Log group name</label>
                <input className="aws-input" value={name} onChange={e => setName(e.target.value)} placeholder="/aws/lambda/my-function" required /></div>
              <div><label className="block text-sm font-bold mb-1">Retention setting</label>
                <select className="aws-input" value={retention} onChange={e => setRetention(Number(e.target.value))}>
                  {RETENTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="aws-btn aws-btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
