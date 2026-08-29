import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, X, Search } from 'lucide-react';

export default function IAMGroups() {
  const { state, dispatch, addFlash } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [detailTab, setDetailTab] = useState('Users');
  const [search, setSearch] = useState('');
  const [selectedGroups, setSelectedGroupsList] = useState([]);

  const handleCreate = () => {
    if (!groupName.trim()) return;
    dispatch({
      type: 'CREATE_GROUP',
      payload: {
        name: groupName.trim(),
        arn: `arn:aws:iam::123456789012:group/${groupName.trim()}`,
        created: new Date().toISOString().split('T')[0],
        users: [],
        policies: selectedPolicies,
        path: '/'
      }
    });
    addFlash('success', `Group "${groupName}" created`);
    setShowCreate(false);
    setGroupName('');
    setSelectedPolicies([]);
  };

  if (showCreate) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-xl font-bold">Create group</h1>
        <div className="aws-card space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Group name *</label>
            <input className="aws-input max-w-md" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="my-group" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Attach policies</label>
            <div className="space-y-1 max-h-60 overflow-y-auto border border-aws-border p-2">
              {state.iam.policies.map(p => (
                <label key={p.name} className="flex items-center gap-2 py-1 text-sm">
                  <input type="checkbox" checked={selectedPolicies.includes(p.name)} onChange={e => {
                    if (e.target.checked) setSelectedPolicies([...selectedPolicies, p.name]);
                    else setSelectedPolicies(selectedPolicies.filter(n => n !== p.name));
                  }} />
                  {p.name} <span className="text-xs text-aws-text-disabled">({p.type})</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!groupName.trim()}>Create group</button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedGroup) {
    const group = state.iam.groups.find(g => g.name === selectedGroup);
    if (!group) { setSelectedGroup(null); return null; }
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button className="text-aws-blue hover:underline text-sm" onClick={() => setSelectedGroup(null)}>User groups</button>
          <span className="text-aws-text-secondary">/</span>
          <h1 className="text-xl font-bold">{group.name}</h1>
        </div>
        <div className="flex gap-4 border-b border-aws-border">
          {['Users', 'Permissions'].map(t => (
            <button key={t} onClick={() => setDetailTab(t)} className={`pb-3 px-1 text-sm font-medium border-b-2 ${detailTab === t ? 'border-aws-blue text-aws-blue' : 'border-transparent text-aws-text-secondary'}`}>{t}</button>
          ))}
        </div>
        <div className="aws-card">
          {detailTab === 'Users' && (
            <div className="text-sm">
              {group.users.length > 0 ? group.users.map(u => <div key={u} className="py-1 text-aws-blue">{u}</div>) : <p className="text-aws-text-secondary">No users in this group</p>}
            </div>
          )}
          {detailTab === 'Permissions' && (
            <div className="text-sm">
              {group.policies.length > 0 ? group.policies.map(p => <div key={p} className="py-1 text-aws-blue">{p}</div>) : <p className="text-aws-text-secondary">No policies attached</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  const filteredGroups = state.iam.groups.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteGroups = () => {
    selectedGroups.forEach(name => dispatch({ type: 'DELETE_GROUP', payload: name }));
    addFlash('success', `${selectedGroups.length} group(s) deleted.`);
    setSelectedGroupsList([]);
  };

  return (
    <div className="aws-card p-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
        <h2 className="font-bold text-lg">User groups ({state.iam.groups.length})</h2>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
          <button className="aws-btn aws-btn-secondary text-xs text-red-600" disabled={!selectedGroups.length} onClick={handleDeleteGroups}>Delete</button>
          <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create group</button>
        </div>
      </div>
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="aws-input pl-8" placeholder="Filter groups" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <table className="aws-table">
        <thead><tr>
          <th className="w-8"><input type="checkbox" checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0} onChange={e => setSelectedGroupsList(e.target.checked ? filteredGroups.map(g => g.name) : [])} /></th>
          <th>Group name</th><th>Users</th><th>Attached policies</th><th>Creation date</th>
        </tr></thead>
        <tbody>
          {filteredGroups.map(g => (
            <tr key={g.name} className={selectedGroups.includes(g.name) ? 'bg-blue-50/50' : ''}>
              <td><input type="checkbox" checked={selectedGroups.includes(g.name)} onChange={e => setSelectedGroupsList(e.target.checked ? [...selectedGroups, g.name] : selectedGroups.filter(n => n !== g.name))} /></td>
              <td><button className="text-aws-blue font-medium hover:underline" onClick={() => setSelectedGroup(g.name)}>{g.name}</button></td>
              <td>{g.users.length}</td>
              <td>{g.policies.length}</td>
              <td>{g.created}</td>
            </tr>
          ))}
          {filteredGroups.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-aws-text-secondary">No groups found</td></tr>}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">
        Showing 1-{filteredGroups.length} of {filteredGroups.length} items
      </div>
    </div>
  );
}
