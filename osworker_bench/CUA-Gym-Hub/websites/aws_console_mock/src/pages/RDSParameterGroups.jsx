import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, ChevronDown, X } from 'lucide-react';

export default function RDSParameterGroups() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [detailGroup, setDetailGroup] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupFamily, setNewGroupFamily] = useState('mysql8.0');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [editingParam, setEditingParam] = useState(null);
  const [editParamValue, setEditParamValue] = useState('');

  const paramGroups = state.rdsParameterGroups || [];
  const filtered = paramGroups.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) || (g.family || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (name) => setSelected(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(g => g.name));

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup = {
      name: newGroupName.trim(),
      family: newGroupFamily,
      description: newGroupDesc.trim(),
      type: 'Custom',
    };
    dispatch({ type: 'CREATE_RDS_PARAMETER_GROUP', payload: newGroup });
    addFlash('success', `Parameter group "${newGroupName}" created`);
    setShowCreate(false);
    setNewGroupName('');
    setNewGroupDesc('');
  };

  const handleSaveParam = () => {
    if (!editingParam) return;
    addFlash('success', `Parameter "${editingParam.name}" updated to "${editParamValue}"`);
    setEditingParam(null);
    setEditParamValue('');
  };

  const mockParams = [
    { name: 'character_set_server', value: 'utf8mb4', type: 'string', applyType: 'static', modifiable: true },
    { name: 'max_connections', value: '150', type: 'integer', applyType: 'dynamic', modifiable: true },
    { name: 'innodb_buffer_pool_size', value: '{DBInstanceClassMemory*3/4}', type: 'integer', applyType: 'static', modifiable: true },
    { name: 'log_bin_trust_function_creators', value: '0', type: 'boolean', applyType: 'dynamic', modifiable: true },
    { name: 'slow_query_log', value: '0', type: 'boolean', applyType: 'dynamic', modifiable: true },
    { name: 'long_query_time', value: '10', type: 'float', applyType: 'dynamic', modifiable: true },
    { name: 'innodb_file_per_table', value: '1', type: 'boolean', applyType: 'static', modifiable: false },
    { name: 'innodb_flush_log_at_trx_commit', value: '1', type: 'integer', applyType: 'dynamic', modifiable: true },
  ];

  if (detailGroup) {
    return (
      <div className="space-y-0">
        <div className="flex items-center gap-2 mb-4">
          <button className="text-aws-blue hover:underline text-sm" onClick={() => setDetailGroup(null)}>Parameter groups</button>
          <span className="text-aws-text-secondary">/</span>
          <h1 className="text-lg font-bold">{detailGroup.name}</h1>
        </div>
        <div className="aws-card p-0">
          <div className="px-4 py-3 border-b border-aws-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-aws-text-secondary font-medium block">Group name</span>{detailGroup.name}</div>
              <div><span className="text-aws-text-secondary font-medium block">Family</span>{detailGroup.family}</div>
              <div><span className="text-aws-text-secondary font-medium block">Type</span>
                <span className={`aws-badge ${detailGroup.type === 'Custom' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>{detailGroup.type || 'Default'}</span>
              </div>
              <div><span className="text-aws-text-secondary font-medium block">Description</span>{detailGroup.description || '-'}</div>
            </div>
          </div>
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm">Parameters</h3>
            <button className="aws-btn aws-btn-secondary text-xs" onClick={() => addFlash('info', 'Select a parameter row to edit its value')}>Edit parameters</button>
          </div>
          <table className="aws-table">
            <thead><tr><th>Parameter name</th><th>Value</th><th>Type</th><th>Apply type</th><th>Modifiable</th><th className="w-20"></th></tr></thead>
            <tbody>
              {mockParams.map(p => (
                <tr key={p.name}>
                  <td className="font-mono text-sm text-aws-blue">{p.name}</td>
                  <td className="font-mono text-sm">
                    {editingParam?.name === p.name ? (
                      <input className="aws-input py-0.5 text-sm w-40" value={editParamValue} onChange={e => setEditParamValue(e.target.value)} autoFocus />
                    ) : p.value}
                  </td>
                  <td>{p.type}</td>
                  <td><span className={`aws-badge ${p.applyType === 'dynamic' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.applyType}</span></td>
                  <td>{p.modifiable ? 'Yes' : 'No'}</td>
                  <td>
                    {p.modifiable && (
                      editingParam?.name === p.name ? (
                        <div className="flex gap-1">
                          <button className="aws-btn aws-btn-primary text-xs py-0.5 px-1.5" onClick={handleSaveParam}>Save</button>
                          <button className="aws-btn aws-btn-secondary text-xs py-0.5 px-1.5" onClick={() => setEditingParam(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="text-xs text-aws-blue hover:underline" onClick={() => { setEditingParam(p); setEditParamValue(p.value); }}>Edit</button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">
            Showing 1-{mockParams.length} of {mockParams.length} parameters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
    <div className="aws-card p-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
        <h2 className="font-bold text-lg">Parameter groups ({paramGroups.length})</h2>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
          <button className="aws-btn aws-btn-secondary text-xs" disabled={!selected.length || selected.some(n => { const g = paramGroups.find(x => x.name === n); return !g || g.type !== 'Custom'; })}>Delete</button>
          <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create parameter group</button>
        </div>
      </div>
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="aws-input pl-8" placeholder="Filter parameter groups" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <table className="aws-table">
        <thead>
          <tr>
            <th className="w-8"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
            <th>Parameter group name</th><th>Parameter group family</th><th>Description</th><th>Type</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-8 text-aws-text-secondary">No parameter groups found</td></tr>
          ) : filtered.map(g => (
            <tr key={g.name} className={`cursor-pointer ${selected.includes(g.name) ? 'bg-blue-50/50' : ''}`} onClick={() => setDetailGroup(g)}>
              <td onClick={e => e.stopPropagation()}>
                <input type="checkbox" checked={selected.includes(g.name)} onChange={() => toggleSelect(g.name)} />
              </td>
              <td className="text-aws-blue font-medium hover:underline">{g.name}</td>
              <td>{g.family}</td>
              <td className="text-xs text-aws-text-secondary">{g.description || '-'}</td>
              <td><span className={`aws-badge ${g.type === 'Custom' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>{g.type || 'Default'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">
        Showing 1-{filtered.length} of {filtered.length} items
      </div>
    </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-lg border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create parameter group</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Parameter group name *</label>
                <input className="aws-input" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="my-parameter-group" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Parameter group family</label>
                <select className="aws-input" value={newGroupFamily} onChange={e => setNewGroupFamily(e.target.value)}>
                  {['mysql8.0', 'mysql5.7', 'postgres15', 'postgres14', 'mariadb10.6'].map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <input className="aws-input" value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="My custom parameter group" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleCreateGroup} disabled={!newGroupName.trim()}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
