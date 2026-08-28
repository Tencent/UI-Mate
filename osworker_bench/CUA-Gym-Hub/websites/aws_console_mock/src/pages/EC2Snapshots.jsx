import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, Camera } from 'lucide-react';
import { format } from 'date-fns';

export default function EC2Snapshots() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', volumeId: '' });

  const snapshots = (state.snapshots || []).filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === snapshots.length ? [] : snapshots.map(s => s.id));

  const handleCreate = () => {
    if (!form.volumeId) return;
    const vol = state.volumes.find(v => v.id === form.volumeId);
    dispatch({ type: 'CREATE_SNAPSHOT', payload: {
      id: `snap-${Math.random().toString(16).substr(2, 17)}`, name: form.name.trim() || 'Unnamed',
      description: form.description, volumeId: form.volumeId, volumeSize: vol ? vol.size : 0,
      status: 'completed', started: new Date().toISOString(), progress: '100%',
      encrypted: vol ? vol.encrypted : false, ownerId: '123456789012'
    }});
    addFlash('success', `Snapshot created from volume "${form.volumeId}".`);
    setShowCreate(false);
    setForm({ name: '', description: '', volumeId: '' });
  };

  const handleDelete = () => {
    selected.forEach(id => dispatch({ type: 'DELETE_SNAPSHOT', payload: id }));
    addFlash('success', `${selected.length} snapshot(s) deleted.`);
    setSelected([]);
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg flex items-center gap-2"><Camera size={18} /> Snapshots ({snapshots.length})</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="aws-input pl-7 text-sm w-56" placeholder="Search snapshots..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <button className="aws-btn aws-btn-secondary text-xs text-red-600" disabled={!selected.length} onClick={handleDelete}>Delete</button>
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create snapshot</button>
          </div>
        </div>
        <table className="aws-table">
          <thead><tr>
            <th><input type="checkbox" checked={selected.length === snapshots.length && snapshots.length > 0} onChange={toggleAll} /></th>
            <th>Name</th><th>Snapshot ID</th><th>Volume ID</th><th>Size</th><th>Status</th><th>Started</th><th>Progress</th><th>Encrypted</th>
          </tr></thead>
          <tbody>
            {snapshots.map(s => (
              <tr key={s.id} className={selected.includes(s.id) ? 'bg-blue-50' : ''}>
                <td><input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelect(s.id)} /></td>
                <td className="text-aws-blue font-medium">{s.name}</td>
                <td className="font-mono text-sm">{s.id}</td>
                <td className="font-mono text-sm">{s.volumeId}</td>
                <td>{s.volumeSize} GiB</td>
                <td><span className={`px-2 py-0.5 rounded text-xs font-medium ${s.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{s.status}</span></td>
                <td>{format(new Date(s.started), 'MMM d, yyyy h:mm a')}</td>
                <td>{s.progress}</td>
                <td>{s.encrypted ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {snapshots.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-aws-text-secondary">No snapshots found</td></tr>}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-md border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create snapshot</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Volume</label>
                <select className="aws-input" value={form.volumeId} onChange={e => setForm({...form, volumeId: e.target.value})}>
                  <option value="">Select a volume</option>
                  {(state.volumes || []).map(v => <option key={v.id} value={v.id}>{v.name} ({v.id})</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-bold mb-1">Name</label><input className="aws-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="my-snapshot" /></div>
              <div><label className="block text-sm font-bold mb-1">Description</label><textarea className="aws-input" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!form.volumeId}>Create snapshot</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
