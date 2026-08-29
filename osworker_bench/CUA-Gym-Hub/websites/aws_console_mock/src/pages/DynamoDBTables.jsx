import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Link } from 'react-router-dom';
import { RefreshCw, Search, X, Plus } from 'lucide-react';
import { format } from 'date-fns';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const KEY_TYPES = ['String', 'Number', 'Binary'];

export default function DynamoDBTables() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '', partitionKey: '', partitionKeyType: 'String',
    sortKey: '', sortKeyType: 'String', hasSortKey: false,
    billingMode: 'PAY_PER_REQUEST', readCapacity: 5, writeCapacity: 5
  });

  const tables = state.dynamodb.tables.filter(t => {
    if (!search) return true;
    return t.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch({ type: 'CREATE_DYNAMO_TABLE', payload: {
      name: form.name, status: 'ACTIVE',
      partitionKey: form.partitionKey, sortKey: form.hasSortKey ? form.sortKey : '',
      itemCount: 0, sizeBytes: 0, created: new Date().toISOString(),
      readCapacity: form.billingMode === 'PROVISIONED' ? form.readCapacity : 0,
      writeCapacity: form.billingMode === 'PROVISIONED' ? form.writeCapacity : 0,
      billingMode: form.billingMode, encryption: 'DEFAULT', streamEnabled: false,
      tags: [], gsi: []
    }});
    addFlash('success', `Successfully created table "${form.name}"`);
    setForm({ name: '', partitionKey: '', partitionKeyType: 'String', sortKey: '', sortKeyType: 'String', hasSortKey: false, billingMode: 'PAY_PER_REQUEST', readCapacity: 5, writeCapacity: 5 });
    setShowCreate(false);
  };

  const handleDelete = () => {
    selected.forEach(name => dispatch({ type: 'DELETE_DYNAMO_TABLE', payload: name }));
    addFlash('success', `Deleted ${selected.length} table(s)`);
    setSelected([]);
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Tables ({tables.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            {selected.length > 0 && <button className="aws-btn aws-btn-secondary text-xs" onClick={handleDelete}>Delete table</button>}
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}><Plus size={14} className="inline mr-1" />Create table</button>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="aws-input pl-8" placeholder="Filter tables" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="aws-table">
            <thead>
              <tr><th className="w-8"><input type="checkbox" onChange={e => setSelected(e.target.checked ? tables.map(t=>t.name) : [])} /></th>
              <th>Name</th><th>Status</th><th>Partition key</th><th>Sort key</th><th>Items</th><th>Size</th><th>Billing mode</th><th>Created</th></tr>
            </thead>
            <tbody>
              {tables.map(t => (
                <tr key={t.name} className={selected.includes(t.name) ? 'bg-blue-50/50' : ''}>
                  <td><input type="checkbox" checked={selected.includes(t.name)} onChange={e => setSelected(e.target.checked ? [...selected, t.name] : selected.filter(x=>x!==t.name))} /></td>
                  <td><Link to={`/dynamodb/${t.name}`} className="font-medium text-aws-blue hover:underline">{t.name}</Link></td>
                  <td><span className={`aws-badge ${t.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{t.status}</span></td>
                  <td className="font-mono text-sm">{t.partitionKey}</td>
                  <td className="font-mono text-sm">{t.sortKey || '-'}</td>
                  <td>{t.itemCount?.toLocaleString()}</td>
                  <td>{formatBytes(t.sizeBytes)}</td>
                  <td>{t.billingMode === 'PAY_PER_REQUEST' ? 'On-demand' : 'Provisioned'}</td>
                  <td>{t.created ? format(new Date(t.created), 'MMM d, yyyy') : '-'}</td>
                </tr>
              ))}
              {tables.length === 0 && <tr><td colSpan="9" className="text-center py-8 text-aws-text-secondary">No tables found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">Showing 1-{tables.length} of {tables.length} items</div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-lg border border-aws-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 sticky top-0">
              <h3 className="font-bold">Create table</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Table name</label>
                <input className="aws-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">Partition key</label>
                  <input className="aws-input" value={form.partitionKey} onChange={e => setForm({...form, partitionKey: e.target.value})} required /></div>
                <div><label className="block text-sm font-bold mb-1">Type</label>
                  <select className="aws-input" value={form.partitionKeyType} onChange={e => setForm({...form, partitionKeyType: e.target.value})}>
                    {KEY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select></div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.hasSortKey} onChange={e => setForm({...form, hasSortKey: e.target.checked})} />
                  <span className="font-bold">Add sort key</span>
                </label>
                {form.hasSortKey && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div><input className="aws-input" placeholder="Sort key name" value={form.sortKey} onChange={e => setForm({...form, sortKey: e.target.value})} required /></div>
                    <div><select className="aws-input" value={form.sortKeyType} onChange={e => setForm({...form, sortKeyType: e.target.value})}>
                      {KEY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select></div>
                  </div>
                )}
              </div>
              <div><label className="block text-sm font-bold mb-1">Billing mode</label>
                <select className="aws-input" value={form.billingMode} onChange={e => setForm({...form, billingMode: e.target.value})}>
                  <option value="PAY_PER_REQUEST">On-demand</option>
                  <option value="PROVISIONED">Provisioned</option>
                </select></div>
              {form.billingMode === 'PROVISIONED' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold mb-1">Read capacity units</label>
                    <input type="number" className="aws-input" value={form.readCapacity} onChange={e => setForm({...form, readCapacity: Number(e.target.value)})} min={1} /></div>
                  <div><label className="block text-sm font-bold mb-1">Write capacity units</label>
                    <input type="number" className="aws-input" value={form.writeCapacity} onChange={e => setForm({...form, writeCapacity: Number(e.target.value)})} min={1} /></div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="aws-btn aws-btn-primary">Create table</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
