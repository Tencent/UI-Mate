import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, Globe } from 'lucide-react';

export default function EC2ElasticIPs() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showAssociate, setShowAssociate] = useState(false);
  const [assocForm, setAssocForm] = useState({ allocationId: '', instanceId: '' });

  const eips = (state.elasticIps || []).filter(e =>
    !search || e.publicIp.includes(search) || e.allocationId.toLowerCase().includes(search.toLowerCase()) ||
    (e.tags && e.tags.some(t => t.Value.toLowerCase().includes(search.toLowerCase())))
  );

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === eips.length ? [] : eips.map(e => e.allocationId));

  const getName = (eip) => { const t = (eip.tags || []).find(t => t.Key === 'Name'); return t ? t.Value : '-'; };

  const handleAllocate = () => {
    const ip = `${Math.floor(Math.random()*223)+1}.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}`;
    dispatch({ type: 'ALLOCATE_EIP', payload: {
      allocationId: `eipalloc-${Math.random().toString(16).substr(2, 17)}`, publicIp: ip,
      associationId: '', instanceId: '', privateIp: '', networkInterfaceId: '', domain: 'vpc',
      tags: [{ Key: 'Name', Value: '' }]
    }});
    addFlash('success', `Elastic IP address ${ip} allocated.`);
  };

  const handleRelease = () => {
    const releasable = selected.filter(id => { const e = state.elasticIps.find(x => x.allocationId === id); return e && !e.instanceId; });
    if (!releasable.length) { addFlash('error', 'Only unassociated Elastic IPs can be released. Disassociate first.'); return; }
    releasable.forEach(id => dispatch({ type: 'RELEASE_EIP', payload: id }));
    addFlash('success', `${releasable.length} Elastic IP(s) released.`);
    setSelected([]);
  };

  const handleDisassociate = () => {
    selected.forEach(id => { const e = state.elasticIps.find(x => x.allocationId === id); if (e && e.instanceId) dispatch({ type: 'DISASSOCIATE_EIP', payload: id }); });
    addFlash('success', 'Elastic IP(s) disassociated.');
    setSelected([]);
  };

  const handleAssociate = () => {
    if (!assocForm.allocationId || !assocForm.instanceId) return;
    const inst = state.ec2.find(i => i.id === assocForm.instanceId);
    dispatch({ type: 'ASSOCIATE_EIP', payload: {
      allocationId: assocForm.allocationId, associationId: `eipassoc-${Math.random().toString(16).substr(2, 12)}`,
      instanceId: assocForm.instanceId, privateIp: inst ? inst.privateIp || '10.0.1.1' : '10.0.1.1',
      networkInterfaceId: `eni-${Math.random().toString(16).substr(2, 8)}`
    }});
    addFlash('success', 'Elastic IP associated successfully.');
    setShowAssociate(false);
    setAssocForm({ allocationId: '', instanceId: '' });
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg flex items-center gap-2"><Globe size={18} /> Elastic IP addresses ({eips.length})</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="aws-input pl-7 text-sm w-56" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <button className="aws-btn aws-btn-secondary text-xs" disabled={selected.length !== 1} onClick={() => { setAssocForm({ allocationId: selected[0], instanceId: '' }); setShowAssociate(true); }}>Associate</button>
            <button className="aws-btn aws-btn-secondary text-xs" disabled={!selected.length} onClick={handleDisassociate}>Disassociate</button>
            <button className="aws-btn aws-btn-secondary text-xs text-red-600" disabled={!selected.length} onClick={handleRelease}>Release</button>
            <button className="aws-btn aws-btn-primary text-xs" onClick={handleAllocate}>Allocate Elastic IP address</button>
          </div>
        </div>
        <table className="aws-table">
          <thead><tr>
            <th><input type="checkbox" checked={selected.length === eips.length && eips.length > 0} onChange={toggleAll} /></th>
            <th>Name</th><th>Allocation ID</th><th>Public IP</th><th>Associated Instance</th><th>Private IP</th><th>Network Interface</th>
          </tr></thead>
          <tbody>
            {eips.map(e => (
              <tr key={e.allocationId} className={selected.includes(e.allocationId) ? 'bg-blue-50' : ''}>
                <td><input type="checkbox" checked={selected.includes(e.allocationId)} onChange={() => toggleSelect(e.allocationId)} /></td>
                <td className="text-aws-blue font-medium">{getName(e)}</td>
                <td className="font-mono text-sm">{e.allocationId}</td>
                <td className="font-mono text-sm">{e.publicIp}</td>
                <td className="font-mono text-sm">{e.instanceId || '-'}</td>
                <td className="font-mono text-sm">{e.privateIp || '-'}</td>
                <td className="font-mono text-sm">{e.networkInterfaceId || '-'}</td>
              </tr>
            ))}
            {eips.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-aws-text-secondary">No Elastic IPs found</td></tr>}
          </tbody>
        </table>
      </div>

      {showAssociate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-md border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Associate Elastic IP address</h3>
              <button onClick={() => setShowAssociate(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Instance</label>
                <select className="aws-input" value={assocForm.instanceId} onChange={e => setAssocForm({...assocForm, instanceId: e.target.value})}>
                  <option value="">Select an instance</option>
                  {(state.ec2 || []).filter(i => i.state === 'running').map(i => <option key={i.id} value={i.id}>{i.name} ({i.id})</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowAssociate(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleAssociate} disabled={!assocForm.instanceId}>Associate</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
