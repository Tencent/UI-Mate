import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, Plus } from 'lucide-react';

export default function VPCRouteTables() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [detailTab, setDetailTab] = useState('Routes');
  const [name, setName] = useState('');
  const [vpcId, setVpcId] = useState(state.vpc.vpcs[0]?.id || '');

  const routeTables = state.vpc.routeTables.filter(rt => {
    if (!search) return true;
    const q = search.toLowerCase();
    return rt.name.toLowerCase().includes(q) || rt.id.toLowerCase().includes(q);
  });

  const detail = detailId ? state.vpc.routeTables.find(rt => rt.id === detailId) : null;

  const handleCreate = (e) => {
    e.preventDefault();
    const id = `rtb-${Math.random().toString(16).substr(2, 12)}`;
    dispatch({ type: 'CREATE_ROUTE_TABLE', payload: {
      id, name: name || 'unnamed-rt', vpcId, associations: [],
      routes: [{ destination: state.vpc.vpcs.find(v=>v.id===vpcId)?.cidr || '10.0.0.0/16', target: 'local', status: 'active' }]
    }});
    addFlash('success', `Successfully created route table ${id}`);
    setName(''); setShowCreate(false);
  };

  const handleDelete = () => {
    selected.forEach(id => dispatch({ type: 'DELETE_ROUTE_TABLE', payload: id }));
    addFlash('success', `Deleted ${selected.length} route table(s)`);
    setSelected([]); setDetailId(null);
  };

  return (
    <div className="space-y-0">
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Route Tables ({routeTables.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            {selected.length > 0 && <button className="aws-btn aws-btn-secondary text-xs" onClick={handleDelete}>Delete</button>}
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}><Plus size={14} className="inline mr-1" />Create route table</button>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="aws-input pl-8" placeholder="Filter route tables" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <table className="aws-table">
          <thead>
            <tr><th className="w-8"><input type="checkbox" onChange={e => setSelected(e.target.checked ? routeTables.map(r=>r.id) : [])} /></th>
            <th>Route Table ID</th><th>Name</th><th>VPC</th><th>Associations</th></tr>
          </thead>
          <tbody>
            {routeTables.map(rt => (
              <tr key={rt.id} className={`cursor-pointer ${selected.includes(rt.id) ? 'bg-blue-50/50' : ''}`} onClick={() => setDetailId(rt.id)}>
                <td onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.includes(rt.id)} onChange={e => setSelected(e.target.checked ? [...selected, rt.id] : selected.filter(x=>x!==rt.id))} />
                </td>
                <td className="font-mono text-sm text-aws-blue">{rt.id}</td>
                <td className="font-medium">{rt.name}</td>
                <td className="font-mono text-sm">{rt.vpcId}</td>
                <td>{rt.associations.length} subnet(s)</td>
              </tr>
            ))}
            {routeTables.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-aws-text-secondary">No route tables found.</td></tr>}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">Showing 1-{routeTables.length} of {routeTables.length} items</div>
      </div>

      {detail && (
        <div className="aws-card mt-0 border-t-0">
          <div className="flex gap-4 border-b border-aws-border mb-4">
            {['Routes', 'Subnet Associations'].map(tab => (
              <button key={tab} onClick={() => setDetailTab(tab)} className={`pb-2 px-1 text-sm font-medium border-b-2 ${detailTab === tab ? 'border-aws-blue text-aws-blue' : 'border-transparent text-aws-text-secondary hover:text-aws-text'}`}>{tab}</button>
            ))}
          </div>
          {detailTab === 'Routes' && (
            <table className="aws-table">
              <thead><tr><th>Destination</th><th>Target</th><th>Status</th></tr></thead>
              <tbody>
                {(detail.routes || []).map((r, i) => (
                  <tr key={i}>
                    <td className="font-mono text-sm">{r.destination}</td>
                    <td className="font-mono text-sm text-aws-blue">{r.target}</td>
                    <td><span className="aws-badge bg-green-50 text-green-700">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {detailTab === 'Subnet Associations' && (
            <table className="aws-table">
              <thead><tr><th>Subnet ID</th><th>Subnet Name</th></tr></thead>
              <tbody>
                {detail.associations.map(subId => {
                  const sub = state.vpc.subnets.find(s => s.id === subId);
                  return <tr key={subId}><td className="font-mono text-sm text-aws-blue">{subId}</td><td>{sub?.name || '-'}</td></tr>;
                })}
                {detail.associations.length === 0 && <tr><td colSpan="2" className="text-center py-4 text-aws-text-secondary">No subnet associations.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-lg border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create route table</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Name</label>
                <input className="aws-input" value={name} onChange={e => setName(e.target.value)} placeholder="my-route-table" required /></div>
              <div><label className="block text-sm font-bold mb-1">VPC</label>
                <select className="aws-input" value={vpcId} onChange={e => setVpcId(e.target.value)}>
                  {state.vpc.vpcs.map(v => <option key={v.id} value={v.id}>{v.name} ({v.id})</option>)}
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
