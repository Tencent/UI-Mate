import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, Plus } from 'lucide-react';

export default function VPCList() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [cidr, setCidr] = useState('10.0.0.0/16');
  const [tenancy, setTenancy] = useState('default');

  const vpcs = state.vpc.vpcs.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q) || v.cidr.includes(q);
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const id = `vpc-${Math.random().toString(16).substr(2, 17)}`;
    dispatch({ type: 'CREATE_VPC', payload: {
      id, name: name || 'unnamed-vpc', cidr, state: 'available', isDefault: false,
      tenancy, dnsHostnames: true, dnsResolution: true, tags: [{ Key: 'Name', Value: name }]
    }});
    addFlash('success', `Successfully created VPC ${id}`);
    setName(''); setCidr('10.0.0.0/16'); setTenancy('default'); setShowCreate(false);
  };

  const handleDelete = () => {
    selected.forEach(id => dispatch({ type: 'DELETE_VPC', payload: id }));
    addFlash('success', `Deleted ${selected.length} VPC(s)`);
    setSelected([]);
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Your VPCs ({vpcs.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            {selected.length > 0 && <button className="aws-btn aws-btn-secondary text-xs" onClick={handleDelete}>Delete VPC</button>}
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}><Plus size={14} className="inline mr-1" />Create VPC</button>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="aws-input pl-8" placeholder="Filter VPCs" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <table className="aws-table">
          <thead>
            <tr><th className="w-8"><input type="checkbox" onChange={e => setSelected(e.target.checked ? vpcs.map(v=>v.id) : [])} /></th>
            <th>VPC ID</th><th>Name</th><th>State</th><th>IPv4 CIDR</th><th>Default VPC</th><th>DNS hostnames</th><th>Tenancy</th></tr>
          </thead>
          <tbody>
            {vpcs.map(v => (
              <tr key={v.id} className={selected.includes(v.id) ? 'bg-blue-50/50' : ''}>
                <td><input type="checkbox" checked={selected.includes(v.id)} onChange={e => setSelected(e.target.checked ? [...selected, v.id] : selected.filter(x=>x!==v.id))} /></td>
                <td className="font-mono text-sm text-aws-blue">{v.id}</td>
                <td className="font-medium">{v.name}</td>
                <td><span className="aws-badge bg-green-50 text-green-700">{v.state}</span></td>
                <td className="font-mono text-sm">{v.cidr}</td>
                <td>{v.isDefault ? 'Yes' : 'No'}</td>
                <td>{v.dnsHostnames ? 'Enabled' : 'Disabled'}</td>
                <td>{v.tenancy}</td>
              </tr>
            ))}
            {vpcs.length === 0 && <tr><td colSpan="8" className="text-center py-8 text-aws-text-secondary">No VPCs found.</td></tr>}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">Showing 1-{vpcs.length} of {vpcs.length} items</div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-lg border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create VPC</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Name</label>
                <input className="aws-input" value={name} onChange={e => setName(e.target.value)} placeholder="my-vpc" required /></div>
              <div><label className="block text-sm font-bold mb-1">IPv4 CIDR block</label>
                <input className="aws-input" value={cidr} onChange={e => setCidr(e.target.value)} placeholder="10.0.0.0/16" required /></div>
              <div><label className="block text-sm font-bold mb-1">Tenancy</label>
                <select className="aws-input" value={tenancy} onChange={e => setTenancy(e.target.value)}>
                  <option value="default">Default</option><option value="dedicated">Dedicated</option>
                </select></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="aws-btn aws-btn-primary">Create VPC</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
