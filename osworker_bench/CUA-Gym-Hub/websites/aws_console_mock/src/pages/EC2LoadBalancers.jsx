import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, Network } from 'lucide-react';
import { format } from 'date-fns';

const AZS = ['us-east-1a', 'us-east-1b', 'us-east-1c'];

export default function EC2LoadBalancers() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'application', scheme: 'internet-facing', az: ['us-east-1a', 'us-east-1b'], listenerPort: 80, listenerProtocol: 'HTTP' });

  const lbs = (state.loadBalancers || []).filter(lb =>
    !search || lb.name.toLowerCase().includes(search.toLowerCase()) || lb.dnsName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (name) => setSelected(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  const toggleAll = () => setSelected(selected.length === lbs.length ? [] : lbs.map(lb => lb.name));

  const toggleAZ = (az) => setForm(prev => ({ ...prev, az: prev.az.includes(az) ? prev.az.filter(a => a !== az) : [...prev.az, az] }));

  const handleCreate = () => {
    if (!form.name.trim() || form.az.length < 2) { addFlash('error', 'Name required and at least 2 AZs must be selected.'); return; }
    dispatch({ type: 'CREATE_LOAD_BALANCER', payload: {
      name: form.name.trim(),
      arn: `arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/${form.type === 'application' ? 'app' : 'net'}/${form.name.trim()}/${Math.random().toString(16).substr(2, 16)}`,
      type: form.type, scheme: form.scheme, state: 'active',
      dnsName: `${form.name.trim()}-${Math.random().toString(16).substr(2, 10)}.us-east-1.elb.amazonaws.com`,
      vpcId: 'vpc-0abc1234def56789', az: form.az,
      securityGroups: form.type === 'application' ? ['sg-0abc1234def56789'] : [],
      listeners: [{ port: Number(form.listenerPort), protocol: form.listenerProtocol, defaultAction: 'forward' }],
      created: new Date().toISOString(), tags: []
    }});
    addFlash('success', `Load balancer "${form.name}" created.`);
    setShowCreate(false);
    setForm({ name: '', type: 'application', scheme: 'internet-facing', az: ['us-east-1a', 'us-east-1b'], listenerPort: 80, listenerProtocol: 'HTTP' });
  };

  const handleDelete = () => {
    selected.forEach(name => dispatch({ type: 'DELETE_LOAD_BALANCER', payload: name }));
    addFlash('success', `${selected.length} load balancer(s) deleted.`);
    setSelected([]);
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg flex items-center gap-2"><Network size={18} /> Load Balancers ({lbs.length})</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="aws-input pl-7 text-sm w-56" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <button className="aws-btn aws-btn-secondary text-xs text-red-600" disabled={!selected.length} onClick={handleDelete}>Delete</button>
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create load balancer</button>
          </div>
        </div>
        <table className="aws-table">
          <thead><tr>
            <th><input type="checkbox" checked={selected.length === lbs.length && lbs.length > 0} onChange={toggleAll} /></th>
            <th>Name</th><th>DNS name</th><th>Type</th><th>Scheme</th><th>State</th><th>AZ</th><th>Created</th>
          </tr></thead>
          <tbody>
            {lbs.map(lb => (
              <tr key={lb.name} className={selected.includes(lb.name) ? 'bg-blue-50' : ''}>
                <td><input type="checkbox" checked={selected.includes(lb.name)} onChange={() => toggleSelect(lb.name)} /></td>
                <td className="text-aws-blue font-medium">{lb.name}</td>
                <td className="font-mono text-xs max-w-xs truncate">{lb.dnsName}</td>
                <td><span className={`px-2 py-0.5 rounded text-xs font-medium ${lb.type === 'application' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'}`}>{lb.type === 'application' ? 'ALB' : 'NLB'}</span></td>
                <td>{lb.scheme}</td>
                <td><span className={`px-2 py-0.5 rounded text-xs font-medium ${lb.state === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{lb.state}</span></td>
                <td className="text-xs">{lb.az.join(', ')}</td>
                <td>{format(new Date(lb.created), 'MMM d, yyyy')}</td>
              </tr>
            ))}
            {lbs.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-aws-text-secondary">No load balancers found</td></tr>}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-lg border border-aws-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create load balancer</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Name</label><input className="aws-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="my-load-balancer" /></div>
              <div><label className="block text-sm font-bold mb-1">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm"><input type="radio" checked={form.type === 'application'} onChange={() => setForm({...form, type: 'application', listenerProtocol: 'HTTP'})} /> Application (ALB)</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" checked={form.type === 'network'} onChange={() => setForm({...form, type: 'network', listenerProtocol: 'TCP'})} /> Network (NLB)</label>
                </div>
              </div>
              <div><label className="block text-sm font-bold mb-1">Scheme</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm"><input type="radio" checked={form.scheme === 'internet-facing'} onChange={() => setForm({...form, scheme: 'internet-facing'})} /> Internet-facing</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" checked={form.scheme === 'internal'} onChange={() => setForm({...form, scheme: 'internal'})} /> Internal</label>
                </div>
              </div>
              <div><label className="block text-sm font-bold mb-1">Availability Zones (min 2)</label>
                <div className="flex gap-4">
                  {AZS.map(az => <label key={az} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.az.includes(az)} onChange={() => toggleAZ(az)} /> {az}</label>)}
                </div>
              </div>
              <div className="border-t pt-3"><label className="block text-sm font-bold mb-1">Listener</label>
                <div className="flex gap-2">
                  <select className="aws-input w-28" value={form.listenerProtocol} onChange={e => setForm({...form, listenerProtocol: e.target.value})}>
                    {form.type === 'application' ? <><option>HTTP</option><option>HTTPS</option></> : <><option>TCP</option><option>UDP</option><option>TLS</option></>}
                  </select>
                  <input type="number" className="aws-input w-24" value={form.listenerPort} onChange={e => setForm({...form, listenerPort: e.target.value})} placeholder="Port" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!form.name.trim() || form.az.length < 2}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
