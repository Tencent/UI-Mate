import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, Target, ArrowLeft } from 'lucide-react';

export default function EC2TargetGroups() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [registerInstance, setRegisterInstance] = useState('');
  const [form, setForm] = useState({ name: '', protocol: 'HTTP', port: 80, targetType: 'instance', healthPath: '/health' });

  const tgs = (state.targetGroups || []).filter(tg =>
    !search || tg.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (name) => setSelected(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  const toggleAll = () => setSelected(selected.length === tgs.length ? [] : tgs.map(t => t.name));

  const handleCreate = () => {
    if (!form.name.trim()) return;
    dispatch({ type: 'CREATE_TARGET_GROUP', payload: {
      name: form.name.trim(),
      arn: `arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/${form.name.trim()}/${Math.random().toString(16).substr(2, 16)}`,
      protocol: form.protocol, port: Number(form.port), targetType: form.targetType, vpcId: 'vpc-0abc1234def56789',
      healthCheck: { path: form.healthPath, protocol: form.protocol, interval: 30, timeout: 5, healthyThreshold: 3, unhealthyThreshold: 3 },
      targets: [], loadBalancer: ''
    }});
    addFlash('success', `Target group "${form.name}" created.`);
    setShowCreate(false);
    setForm({ name: '', protocol: 'HTTP', port: 80, targetType: 'instance', healthPath: '/health' });
  };

  const handleDelete = () => {
    selected.forEach(name => dispatch({ type: 'DELETE_TARGET_GROUP', payload: name }));
    addFlash('success', `${selected.length} target group(s) deleted.`);
    setSelected([]);
  };

  const handleRegister = () => {
    if (!registerInstance || !detail) return;
    dispatch({ type: 'REGISTER_TARGET', payload: { groupName: detail.name, target: { id: registerInstance, port: detail.port, health: 'initial' } } });
    addFlash('success', `Target ${registerInstance} registered.`);
    setShowRegister(false);
    setRegisterInstance('');
    setDetail(state.targetGroups.find(tg => tg.name === detail.name));
  };

  const handleDeregister = (targetId) => {
    dispatch({ type: 'DEREGISTER_TARGET', payload: { groupName: detail.name, targetId } });
    addFlash('success', `Target ${targetId} deregistered.`);
  };

  if (detail) {
    const currentTg = (state.targetGroups || []).find(tg => tg.name === detail.name) || detail;
    return (
      <div>
        <button className="flex items-center gap-1 text-aws-blue text-sm mb-3 hover:underline" onClick={() => setDetail(null)}><ArrowLeft size={14} /> Back to target groups</button>
        <div className="aws-card p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
            <h2 className="font-bold text-lg">{currentTg.name}</h2>
            <div className="flex items-center gap-2">
              <button className="aws-btn aws-btn-primary text-xs" onClick={() => setShowRegister(true)}>Register targets</button>
            </div>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4 text-sm border-b border-aws-border">
            <div><span className="text-aws-text-secondary">Protocol:</span> {currentTg.protocol}</div>
            <div><span className="text-aws-text-secondary">Port:</span> {currentTg.port}</div>
            <div><span className="text-aws-text-secondary">Target type:</span> {currentTg.targetType}</div>
            <div><span className="text-aws-text-secondary">VPC:</span> {currentTg.vpcId}</div>
            <div><span className="text-aws-text-secondary">Load balancer:</span> {currentTg.loadBalancer || '-'}</div>
            <div><span className="text-aws-text-secondary">Health check path:</span> {currentTg.healthCheck?.path || '/'}</div>
          </div>
          <div className="px-4 py-2 font-bold text-sm border-b border-aws-border">Registered targets ({currentTg.targets.length})</div>
          <table className="aws-table">
            <thead><tr><th>Instance ID</th><th>Port</th><th>Health status</th><th>Actions</th></tr></thead>
            <tbody>
              {currentTg.targets.map(t => (
                <tr key={t.id}>
                  <td className="font-mono text-sm">{t.id}</td>
                  <td>{t.port}</td>
                  <td><span className={`px-2 py-0.5 rounded text-xs font-medium ${t.health === 'healthy' ? 'bg-green-100 text-green-800' : t.health === 'unhealthy' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{t.health}</span></td>
                  <td><button className="text-red-600 text-xs hover:underline" onClick={() => handleDeregister(t.id)}>Deregister</button></td>
                </tr>
              ))}
              {currentTg.targets.length === 0 && <tr><td colSpan={4} className="text-center py-6 text-aws-text-secondary">No registered targets</td></tr>}
            </tbody>
          </table>
        </div>

        {showRegister && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white shadow-xl w-full max-w-md border border-aws-border">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <h3 className="font-bold">Register targets</h3>
                <button onClick={() => setShowRegister(false)}><X size={18} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div><label className="block text-sm font-bold mb-1">Instance</label>
                  <select className="aws-input" value={registerInstance} onChange={e => setRegisterInstance(e.target.value)}>
                    <option value="">Select an instance</option>
                    {(state.ec2 || []).map(i => <option key={i.id} value={i.id}>{i.name} ({i.id})</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button className="aws-btn aws-btn-secondary" onClick={() => setShowRegister(false)}>Cancel</button>
                  <button className="aws-btn aws-btn-primary" onClick={handleRegister} disabled={!registerInstance}>Register</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg flex items-center gap-2"><Target size={18} /> Target Groups ({tgs.length})</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="aws-input pl-7 text-sm w-56" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <button className="aws-btn aws-btn-secondary text-xs text-red-600" disabled={!selected.length} onClick={handleDelete}>Delete</button>
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create target group</button>
          </div>
        </div>
        <table className="aws-table">
          <thead><tr>
            <th><input type="checkbox" checked={selected.length === tgs.length && tgs.length > 0} onChange={toggleAll} /></th>
            <th>Name</th><th>Protocol</th><th>Port</th><th>Target type</th><th>VPC</th><th>Load balancer</th><th>Targets</th>
          </tr></thead>
          <tbody>
            {tgs.map(tg => (
              <tr key={tg.name} className={selected.includes(tg.name) ? 'bg-blue-50' : ''}>
                <td><input type="checkbox" checked={selected.includes(tg.name)} onChange={() => toggleSelect(tg.name)} /></td>
                <td className="text-aws-blue font-medium cursor-pointer hover:underline" onClick={() => setDetail(tg)}>{tg.name}</td>
                <td>{tg.protocol}</td>
                <td>{tg.port}</td>
                <td>{tg.targetType}</td>
                <td className="font-mono text-sm">{tg.vpcId}</td>
                <td>{tg.loadBalancer || '-'}</td>
                <td>{tg.targets.length}</td>
              </tr>
            ))}
            {tgs.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-aws-text-secondary">No target groups found</td></tr>}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-md border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create target group</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Name</label><input className="aws-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="my-target-group" /></div>
              <div><label className="block text-sm font-bold mb-1">Protocol</label>
                <select className="aws-input" value={form.protocol} onChange={e => setForm({...form, protocol: e.target.value})}>
                  <option>HTTP</option><option>HTTPS</option><option>TCP</option><option>UDP</option><option>TLS</option>
                </select>
              </div>
              <div><label className="block text-sm font-bold mb-1">Port</label><input type="number" className="aws-input" value={form.port} onChange={e => setForm({...form, port: e.target.value})} /></div>
              <div><label className="block text-sm font-bold mb-1">Target type</label>
                <select className="aws-input" value={form.targetType} onChange={e => setForm({...form, targetType: e.target.value})}>
                  <option value="instance">Instance</option><option value="ip">IP</option><option value="lambda">Lambda</option>
                </select>
              </div>
              <div><label className="block text-sm font-bold mb-1">Health check path</label><input className="aws-input" value={form.healthPath} onChange={e => setForm({...form, healthPath: e.target.value})} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!form.name.trim()}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
