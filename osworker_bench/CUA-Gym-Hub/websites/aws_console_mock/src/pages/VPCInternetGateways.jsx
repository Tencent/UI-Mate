import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, Plus } from 'lucide-react';

export default function VPCInternetGateways() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');

  const igws = state.vpc.internetGateways.filter(ig => {
    if (!search) return true;
    const q = search.toLowerCase();
    return ig.name.toLowerCase().includes(q) || ig.id.toLowerCase().includes(q);
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const id = `igw-${Math.random().toString(16).substr(2, 12)}`;
    dispatch({ type: 'CREATE_IGW', payload: { id, name: name || 'unnamed-igw', state: 'detached', vpcId: '' } });
    addFlash('success', `Successfully created internet gateway ${id}`);
    setName(''); setShowCreate(false);
  };

  const handleDelete = () => {
    selected.forEach(id => dispatch({ type: 'DELETE_IGW', payload: id }));
    addFlash('success', `Deleted ${selected.length} internet gateway(s)`);
    setSelected([]);
  };

  const handleAttach = (igwId) => {
    const vpc = state.vpc.vpcs[0];
    if (!vpc) { addFlash('error', 'No VPC available to attach to'); return; }
    dispatch({ type: 'UPDATE_IGW', payload: { id: igwId, state: 'attached', vpcId: vpc.id } });
    addFlash('success', `Attached ${igwId} to ${vpc.id}`);
  };

  const handleDetach = (igwId) => {
    dispatch({ type: 'UPDATE_IGW', payload: { id: igwId, state: 'detached', vpcId: '' } });
    addFlash('success', `Detached ${igwId}`);
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Internet Gateways ({igws.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            {selected.length === 1 && (() => {
              const igw = state.vpc.internetGateways.find(i => i.id === selected[0]);
              return igw?.state === 'detached'
                ? <button className="aws-btn aws-btn-secondary text-xs" onClick={() => handleAttach(selected[0])}>Attach to VPC</button>
                : <button className="aws-btn aws-btn-secondary text-xs" onClick={() => handleDetach(selected[0])}>Detach from VPC</button>;
            })()}
            {selected.length > 0 && <button className="aws-btn aws-btn-secondary text-xs" onClick={handleDelete}>Delete</button>}
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}><Plus size={14} className="inline mr-1" />Create internet gateway</button>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="aws-input pl-8" placeholder="Filter internet gateways" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <table className="aws-table">
          <thead>
            <tr><th className="w-8"><input type="checkbox" onChange={e => setSelected(e.target.checked ? igws.map(i=>i.id) : [])} /></th>
            <th>Internet Gateway ID</th><th>Name</th><th>State</th><th>VPC ID</th></tr>
          </thead>
          <tbody>
            {igws.map(ig => (
              <tr key={ig.id} className={selected.includes(ig.id) ? 'bg-blue-50/50' : ''}>
                <td><input type="checkbox" checked={selected.includes(ig.id)} onChange={e => setSelected(e.target.checked ? [...selected, ig.id] : selected.filter(x=>x!==ig.id))} /></td>
                <td className="font-mono text-sm text-aws-blue">{ig.id}</td>
                <td className="font-medium">{ig.name}</td>
                <td><span className={`aws-badge ${ig.state === 'attached' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{ig.state}</span></td>
                <td className="font-mono text-sm">{ig.vpcId || '-'}</td>
              </tr>
            ))}
            {igws.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-aws-text-secondary">No internet gateways found.</td></tr>}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">Showing 1-{igws.length} of {igws.length} items</div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-lg border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create internet gateway</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Name</label>
                <input className="aws-input" value={name} onChange={e => setName(e.target.value)} placeholder="my-igw" required /></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="aws-btn aws-btn-primary">Create internet gateway</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
