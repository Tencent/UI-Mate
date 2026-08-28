import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, Plus } from 'lucide-react';

export default function VPCSubnets() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [vpcId, setVpcId] = useState(state.vpc.vpcs[0]?.id || '');
  const [cidr, setCidr] = useState('');
  const [az, setAz] = useState('us-east-1a');

  const subnets = state.vpc.subnets.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.vpcId.toLowerCase().includes(q);
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const id = `subnet-${Math.random().toString(16).substr(2, 17)}`;
    dispatch({ type: 'CREATE_SUBNET', payload: {
      id, name: name || 'unnamed-subnet', vpcId, cidr, az, availableIps: 251,
      autoAssignPublicIp: false, routeTable: '', type: 'private'
    }});
    addFlash('success', `Successfully created subnet ${id}`);
    setName(''); setCidr(''); setShowCreate(false);
  };

  const handleDelete = () => {
    selected.forEach(id => dispatch({ type: 'DELETE_SUBNET', payload: id }));
    addFlash('success', `Deleted ${selected.length} subnet(s)`);
    setSelected([]);
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Subnets ({subnets.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            {selected.length > 0 && <button className="aws-btn aws-btn-secondary text-xs" onClick={handleDelete}>Delete subnet</button>}
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}><Plus size={14} className="inline mr-1" />Create subnet</button>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="aws-input pl-8" placeholder="Filter subnets" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="aws-table">
            <thead>
              <tr><th className="w-8"><input type="checkbox" onChange={e => setSelected(e.target.checked ? subnets.map(s=>s.id) : [])} /></th>
              <th>Subnet ID</th><th>Name</th><th>VPC</th><th>IPv4 CIDR</th><th>Availability Zone</th><th>Available IPs</th><th>Auto-assign public IP</th><th>Type</th></tr>
            </thead>
            <tbody>
              {subnets.map(s => (
                <tr key={s.id} className={selected.includes(s.id) ? 'bg-blue-50/50' : ''}>
                  <td><input type="checkbox" checked={selected.includes(s.id)} onChange={e => setSelected(e.target.checked ? [...selected, s.id] : selected.filter(x=>x!==s.id))} /></td>
                  <td className="font-mono text-sm text-aws-blue">{s.id}</td>
                  <td className="font-medium">{s.name}</td>
                  <td className="font-mono text-sm">{s.vpcId}</td>
                  <td className="font-mono text-sm">{s.cidr}</td>
                  <td>{s.az}</td>
                  <td>{s.availableIps}</td>
                  <td>{s.autoAssignPublicIp ? 'Yes' : 'No'}</td>
                  <td><span className={`aws-badge ${s.type === 'public' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{s.type}</span></td>
                </tr>
              ))}
              {subnets.length === 0 && <tr><td colSpan="9" className="text-center py-8 text-aws-text-secondary">No subnets found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">Showing 1-{subnets.length} of {subnets.length} items</div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-lg border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create subnet</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Name</label>
                <input className="aws-input" value={name} onChange={e => setName(e.target.value)} placeholder="my-subnet" required /></div>
              <div><label className="block text-sm font-bold mb-1">VPC</label>
                <select className="aws-input" value={vpcId} onChange={e => setVpcId(e.target.value)}>
                  {state.vpc.vpcs.map(v => <option key={v.id} value={v.id}>{v.name} ({v.id})</option>)}
                </select></div>
              <div><label className="block text-sm font-bold mb-1">IPv4 CIDR block</label>
                <input className="aws-input" value={cidr} onChange={e => setCidr(e.target.value)} placeholder="10.0.5.0/24" required /></div>
              <div><label className="block text-sm font-bold mb-1">Availability Zone</label>
                <select className="aws-input" value={az} onChange={e => setAz(e.target.value)}>
                  {['us-east-1a','us-east-1b','us-east-1c','us-east-1d'].map(z => <option key={z} value={z}>{z}</option>)}
                </select></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="aws-btn aws-btn-primary">Create subnet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
