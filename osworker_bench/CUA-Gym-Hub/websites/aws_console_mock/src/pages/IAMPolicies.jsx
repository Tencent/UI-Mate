import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Search, RefreshCw, X, ChevronDown } from 'lucide-react';

export default function IAMPolicies() {
  const { state, dispatch, addFlash } = useStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [policyActionsOpen, setPolicyActionsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [detailPolicy, setDetailPolicy] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', effect: 'Allow', service: '*', action: '*', resource: '*' });

  const allPolicies = state.iam.policies;
  const policies = allPolicies.filter(p => {
    if (filter === 'aws' && p.type !== 'AWS managed') return false;
    if (filter === 'customer' && p.type !== 'Customer managed') return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (arn) => setSelected(prev => prev.includes(arn) ? prev.filter(x => x !== arn) : [...prev, arn]);

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const arn = `arn:aws:iam::123456789012:policy/${form.name.trim()}`;
    dispatch({ type: 'CREATE_POLICY', payload: {
      name: form.name.trim(),
      arn,
      type: 'Customer managed',
      description: form.description || `Custom policy ${form.name.trim()}`,
      attachedEntities: 0,
      created: new Date().toISOString().split('T')[0],
      document: JSON.stringify({
        Version: '2012-10-17',
        Statement: [{ Effect: form.effect, Action: form.action, Resource: form.resource }]
      }, null, 2)
    }});
    addFlash('success', `Policy "${form.name}" created successfully.`);
    setShowCreate(false);
    setForm({ name: '', description: '', effect: 'Allow', service: '*', action: '*', resource: '*' });
  };

  const handleDelete = () => {
    const deletable = selected.filter(arn => {
      const p = allPolicies.find(x => x.arn === arn);
      return p && p.type === 'Customer managed';
    });
    if (!deletable.length) { addFlash('error', 'Only customer managed policies can be deleted.'); return; }
    deletable.forEach(arn => dispatch({ type: 'DELETE_POLICY', payload: arn }));
    addFlash('success', `${deletable.length} policy(ies) deleted.`);
    setSelected([]);
  };

  return (
    <div className="space-y-0">
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Policies ({allPolicies.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <div className="relative">
              <button className="aws-btn aws-btn-secondary text-xs flex items-center gap-1" disabled={!selected.length} onClick={() => setPolicyActionsOpen(!policyActionsOpen)}>
                Policy actions <ChevronDown size={12} />
              </button>
              {policyActionsOpen && selected.length > 0 && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-aws-border shadow-lg z-20" style={{ borderRadius: 8 }}>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={() => { addFlash('info', 'Attach entities dialog (simulated)'); setPolicyActionsOpen(false); }}>Attach</button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={() => { addFlash('info', 'Detach entities dialog (simulated)'); setPolicyActionsOpen(false); }}>Detach</button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={() => { addFlash('info', 'Set as permissions boundary (simulated)'); setPolicyActionsOpen(false); }}>Set permissions boundary</button>
                </div>
              )}
            </div>
            <button className="aws-btn aws-btn-secondary text-xs text-red-600" disabled={!selected.length} onClick={handleDelete}>Delete</button>
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create policy</button>
          </div>
        </div>
        {/* Filter tabs */}
        <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-4">
          {[{ key: 'all', label: `All policies (${allPolicies.length})` }, { key: 'aws', label: `AWS managed (${allPolicies.filter(p=>p.type==='AWS managed').length})` }, { key: 'customer', label: `Customer managed (${allPolicies.filter(p=>p.type==='Customer managed').length})` }].map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setSelected([]); }}
              className={`text-sm pb-1 border-b-2 ${filter === f.key ? 'border-aws-blue text-aws-blue font-medium' : 'border-transparent text-aws-text-secondary hover:text-aws-text'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="aws-input pl-8" placeholder="Search by policy name" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <table className="aws-table">
          <thead>
            <tr>
              <th className="w-8"><input type="checkbox" onChange={e => setSelected(e.target.checked ? policies.map(p => p.arn) : [])} /></th>
              <th>Policy name</th><th>Type</th><th>Description</th><th>Attached entities</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {policies.map(p => (
              <tr key={p.arn || p.name} className={`cursor-pointer ${selected.includes(p.arn) ? 'bg-blue-50/50' : ''}`} onClick={() => setDetailPolicy(p)}>
                <td onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.includes(p.arn)} onChange={() => toggleSelect(p.arn)} />
                </td>
                <td className="text-aws-blue font-medium hover:underline">{p.name}</td>
                <td>
                  <span className={`aws-badge ${p.type === 'AWS managed' ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                    {p.type}
                  </span>
                </td>
                <td className="text-aws-text-secondary text-xs max-w-xs truncate">{p.description}</td>
                <td>{p.attachedEntities}</td>
                <td>{p.created}</td>
              </tr>
            ))}
            {policies.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-aws-text-secondary">No policies found</td></tr>}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">
          Showing 1-{policies.length} of {policies.length} items
        </div>
      </div>

      {detailPolicy && (
        <div className="aws-card mt-0 border-t-0 p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
            <h3 className="font-bold text-sm">{detailPolicy.name}</h3>
            <button className="text-xs text-aws-text-secondary hover:text-aws-text" onClick={() => setDetailPolicy(null)}>Close</button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4">
              <div><span className="text-aws-text-secondary font-medium">Policy ARN:</span><br/><span className="font-mono text-xs">{detailPolicy.arn}</span></div>
              <div><span className="text-aws-text-secondary font-medium">Type:</span><br/>{detailPolicy.type}</div>
              <div><span className="text-aws-text-secondary font-medium">Description:</span><br/>{detailPolicy.description}</div>
              <div><span className="text-aws-text-secondary font-medium">Created:</span><br/>{detailPolicy.created}</div>
            </div>
            {detailPolicy.document && (
              <div>
                <h4 className="font-bold text-xs mb-2">Policy document (JSON)</h4>
                <pre className="aws-code text-xs">{typeof detailPolicy.document === 'string' ? detailPolicy.document : JSON.stringify(detailPolicy.document, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreate && (
        <div className="aws-modal-overlay">
          <div className="aws-modal max-w-lg">
            <div className="aws-modal-header">
              <h3 className="font-bold text-lg">Create policy</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="aws-modal-body space-y-4">
              <div>
                <label className="aws-form-label">Policy name <span className="text-red-500">*</span></label>
                <input className="aws-input mt-1" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="MyCustomPolicy" />
              </div>
              <div>
                <label className="aws-form-label">Description</label>
                <input className="aws-input mt-1" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Policy description" />
              </div>
              <div className="border-t border-aws-border pt-3">
                <h4 className="font-bold text-sm mb-2">Policy statement</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="aws-form-label">Effect</label>
                    <select className="aws-input mt-1" value={form.effect} onChange={e => setForm({...form, effect: e.target.value})}>
                      <option value="Allow">Allow</option>
                      <option value="Deny">Deny</option>
                    </select>
                  </div>
                  <div>
                    <label className="aws-form-label">Action</label>
                    <input className="aws-input mt-1" value={form.action} onChange={e => setForm({...form, action: e.target.value})} placeholder="s3:GetObject" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="aws-form-label">Resource</label>
                  <input className="aws-input mt-1" value={form.resource} onChange={e => setForm({...form, resource: e.target.value})} placeholder="arn:aws:s3:::my-bucket/*" />
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <h4 className="font-bold text-xs mb-1">Preview</h4>
                <pre className="text-xs font-mono text-gray-700">{JSON.stringify({
                  Version: '2012-10-17',
                  Statement: [{ Effect: form.effect, Action: form.action, Resource: form.resource }]
                }, null, 2)}</pre>
              </div>
            </div>
            <div className="aws-modal-footer">
              <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!form.name.trim()}>Create policy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
