import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function VPCNATGateways() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [subnetId, setSubnetId] = useState(state.vpc.subnets[0]?.id || '');

  const currentRegion = state.user?.region || 'us-east-1';
  const nats = state.vpc.natGateways.filter(n => {
    if (n.region && n.region !== currentRegion) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q);
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const id = `nat-${Math.random().toString(16).substr(2, 17)}`;
    const pubIp = `${Math.floor(Math.random()*50)+3}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
    const privIp = `10.0.${Math.floor(Math.random()*4)+1}.${Math.floor(Math.random()*250)+1}`;
    dispatch({ type: 'CREATE_NAT', payload: {
      id, name: name || 'unnamed-nat', state: 'available', subnetId,
      publicIp: pubIp, privateIp: privIp, created: new Date().toISOString()
    }});
    addFlash('success', `Successfully created NAT gateway ${id}`);
    setName(''); setShowCreate(false);
  };

  const handleDelete = () => {
    selected.forEach(id => dispatch({ type: 'DELETE_NAT', payload: id }));
    addFlash('success', `Deleted ${selected.length} NAT gateway(s)`);
    setSelected([]);
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">NAT Gateways ({nats.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            {selected.length > 0 && <button className="aws-btn aws-btn-secondary text-xs" onClick={handleDelete}>Delete NAT gateway</button>}
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}><Plus size={14} className="inline mr-1" />Create NAT gateway</button>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="aws-input pl-8" placeholder="Filter NAT gateways" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="aws-table">
            <thead>
              <tr><th className="w-8"><input type="checkbox" onChange={e => setSelected(e.target.checked ? nats.map(n=>n.id) : [])} /></th>
              <th>NAT Gateway ID</th><th>Name</th><th>State</th><th>Subnet</th><th>Public IP</th><th>Private IP</th><th>Created</th></tr>
            </thead>
            <tbody>
              {nats.map(n => (
                <tr key={n.id} className={selected.includes(n.id) ? 'bg-blue-50/50' : ''}>
                  <td><input type="checkbox" checked={selected.includes(n.id)} onChange={e => setSelected(e.target.checked ? [...selected, n.id] : selected.filter(x=>x!==n.id))} /></td>
                  <td className="font-mono text-sm text-aws-blue">{n.id}</td>
                  <td className="font-medium">{n.name}</td>
                  <td><span className={`aws-badge ${n.state === 'available' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{n.state}</span></td>
                  <td className="font-mono text-sm">{n.subnetId}</td>
                  <td className="font-mono text-sm">{n.publicIp}</td>
                  <td className="font-mono text-sm">{n.privateIp}</td>
                  <td>{n.created ? format(new Date(n.created), 'MMM d, yyyy h:mm a') : '-'}</td>
                </tr>
              ))}
              {nats.length === 0 && <tr><td colSpan="8" className="text-center py-8 text-aws-text-secondary">No NAT gateways found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">Showing 1-{nats.length} of {nats.length} items</div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-lg border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create NAT gateway</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Name</label>
                <input className="aws-input" value={name} onChange={e => setName(e.target.value)} placeholder="my-nat-gateway" required /></div>
              <div><label className="block text-sm font-bold mb-1">Subnet</label>
                <select className="aws-input" value={subnetId} onChange={e => setSubnetId(e.target.value)}>
                  {state.vpc.subnets.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                </select></div>
              <div><label className="block text-sm font-bold mb-1">Elastic IP allocation</label>
                <p className="text-xs text-aws-text-secondary">A new Elastic IP will be allocated automatically.</p></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="aws-btn aws-btn-primary">Create NAT gateway</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
