import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, X, Search } from 'lucide-react';

export default function IAMUsers() {
  const { state, dispatch, addFlash } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailTab, setDetailTab] = useState('Permissions');
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleCreate = () => {
    if (!userName.trim()) return;
    const newUser = {
      name: userName.trim(),
      arn: `arn:aws:iam::123456789012:user/${userName.trim()}`,
      created: new Date().toISOString().split('T')[0],
      lastActivity: 'N/A',
      groups: selectedGroups,
      policies: [],
      mfaEnabled: false,
      accessKeyAge: 'N/A',
      passwordLastUsed: 'N/A',
      path: '/',
      tags: []
    };
    dispatch({ type: 'CREATE_USER', payload: newUser });
    selectedGroups.forEach(g => {
      dispatch({ type: 'ADD_USER_TO_GROUP', payload: { userName: userName.trim(), groupName: g } });
    });
    addFlash('success', `User "${userName}" created successfully`);
    setShowCreate(false);
    setUserName('');
    setSelectedGroups([]);
    setStep(1);
  };

  if (showCreate) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-xl font-bold">Create user</h1>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-aws-blue' : 'text-aws-text-disabled'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-aws-orange text-white' : 'bg-gray-200'}`}>{s}</span>
              <span className="text-sm font-medium">{s === 1 ? 'User details' : s === 2 ? 'Permissions' : 'Review'}</span>
              {s < 3 && <span className="mx-2 text-gray-300">—</span>}
            </div>
          ))}
        </div>
        {step === 1 && (
          <div className="aws-card space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">User name *</label>
              <input className="aws-input max-w-md" value={userName} onChange={e => setUserName(e.target.value)} placeholder="username" />
            </div>
            <div className="flex justify-end gap-2">
              <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="aws-btn aws-btn-primary" onClick={() => setStep(2)} disabled={!userName.trim()}>Next</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="aws-card space-y-4">
            <h3 className="font-bold text-sm">Add user to group</h3>
            <div className="space-y-2">
              {state.iam.groups.map(g => (
                <label key={g.name} className="flex items-center gap-2 p-2 border border-aws-border hover:bg-gray-50">
                  <input type="checkbox" checked={selectedGroups.includes(g.name)} onChange={e => {
                    if (e.target.checked) setSelectedGroups([...selectedGroups, g.name]);
                    else setSelectedGroups(selectedGroups.filter(n => n !== g.name));
                  }} />
                  <span className="text-sm font-medium">{g.name}</span>
                  <span className="text-xs text-aws-text-secondary ml-2">{g.policies.join(', ')}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button className="aws-btn aws-btn-secondary" onClick={() => setStep(1)}>Previous</button>
              <button className="aws-btn aws-btn-primary" onClick={() => setStep(3)}>Next</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="aws-card space-y-4">
            <h3 className="font-bold text-sm">Review and create</h3>
            <div className="text-sm space-y-2">
              <div><strong>User name:</strong> {userName}</div>
              <div><strong>Groups:</strong> {selectedGroups.join(', ') || 'None'}</div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="aws-btn aws-btn-secondary" onClick={() => setStep(2)}>Previous</button>
              <button className="aws-btn aws-btn-primary" onClick={handleCreate}>Create user</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selectedUser) {
    const user = state.iam.users.find(u => u.name === selectedUser);
    if (!user) { setSelectedUser(null); return null; }
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button className="text-aws-blue hover:underline text-sm" onClick={() => setSelectedUser(null)}>Users</button>
          <span className="text-aws-text-secondary">/</span>
          <h1 className="text-xl font-bold">{user.name}</h1>
        </div>
        <div className="flex gap-4 border-b border-aws-border">
          {['Permissions', 'Groups', 'Security credentials', 'Tags'].map(t => (
            <button key={t} onClick={() => setDetailTab(t)} className={`pb-3 px-1 text-sm font-medium border-b-2 ${detailTab === t ? 'border-aws-blue text-aws-blue' : 'border-transparent text-aws-text-secondary'}`}>{t}</button>
          ))}
        </div>
        <div className="aws-card">
          {detailTab === 'Permissions' && (
            <div className="text-sm">
              <h3 className="font-bold mb-2">Attached policies</h3>
              {user.policies.length > 0 ? user.policies.map(p => <div key={p} className="py-1 text-aws-blue">{p}</div>) : <p className="text-aws-text-secondary">No directly attached policies</p>}
              <h3 className="font-bold mt-4 mb-2">Policies from groups</h3>
              {user.groups.map(gName => {
                const group = state.iam.groups.find(g => g.name === gName);
                return group ? group.policies.map(p => <div key={`${gName}-${p}`} className="py-1"><span className="text-aws-blue">{p}</span> <span className="text-aws-text-disabled text-xs">(from {gName})</span></div>) : null;
              })}
            </div>
          )}
          {detailTab === 'Groups' && (
            <div className="text-sm">
              {user.groups.length > 0 ? user.groups.map(g => <div key={g} className="py-1 text-aws-blue">{g}</div>) : <p className="text-aws-text-secondary">Not a member of any groups</p>}
            </div>
          )}
          {detailTab === 'Security credentials' && (
            <div className="text-sm space-y-4">
              <div className="space-y-2">
                <div><span className="text-aws-text-secondary">MFA:</span> <span className="ml-2">{user.mfaEnabled ? 'Enabled' : 'Not enabled'}</span></div>
                <div><span className="text-aws-text-secondary">Password last used:</span> <span className="ml-2">{user.passwordLastUsed}</span></div>
              </div>
              <div>
                <h3 className="font-bold mb-2">Access keys</h3>
                {(user.accessKeys && user.accessKeys.length > 0) ? (
                  <table className="aws-table">
                    <thead><tr><th>Access key ID</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                    <tbody>
                      {user.accessKeys.map(k => (
                        <tr key={k.accessKeyId}>
                          <td className="font-mono text-xs">{k.accessKeyId}</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${k.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {k.status}
                            </span>
                          </td>
                          <td className="text-xs">{k.created || '-'}</td>
                          <td className="flex gap-2">
                            {k.status === 'Active' ? (
                              <button className="aws-btn aws-btn-secondary text-xs" onClick={() => {
                                dispatch({ type: 'DEACTIVATE_ACCESS_KEY', payload: { userName: user.name, accessKeyId: k.accessKeyId } });
                                addFlash('success', `Access key ${k.accessKeyId} has been deactivated.`);
                              }}>Make inactive</button>
                            ) : (
                              <span className="text-xs text-aws-text-disabled">Inactive</span>
                            )}
                            <button className="aws-btn aws-btn-secondary text-xs text-red-600" onClick={() => {
                              dispatch({ type: 'DELETE_ACCESS_KEY', payload: { userName: user.name, accessKeyId: k.accessKeyId } });
                              addFlash('success', `Access key ${k.accessKeyId} has been deleted.`);
                            }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-aws-text-secondary">No access keys</p>
                )}
              </div>
              {!user.accessKeys && user.accessKeyAge && user.accessKeyAge !== 'N/A' && (
                <div><span className="text-aws-text-secondary">Access key age:</span> <span className="ml-2">{user.accessKeyAge}</span></div>
              )}
            </div>
          )}
          {detailTab === 'Tags' && (
            <table className="aws-table">
              <thead><tr><th>Key</th><th>Value</th></tr></thead>
              <tbody>{(user.tags || []).map((t, i) => <tr key={i}><td>{t.Key}</td><td>{t.Value}</td></tr>)}</tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  const filteredUsers = state.iam.users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteUsers = () => {
    selectedUsers.forEach(name => dispatch({ type: 'DELETE_USER', payload: name }));
    addFlash('success', `${selectedUsers.length} user(s) deleted.`);
    setSelectedUsers([]);
  };

  return (
    <div className="aws-card p-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
        <h2 className="font-bold text-lg">Users ({state.iam.users.length})</h2>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
          <button className="aws-btn aws-btn-secondary text-xs text-red-600" disabled={!selectedUsers.length} onClick={handleDeleteUsers}>Delete</button>
          <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create user</button>
        </div>
      </div>
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="aws-input pl-8" placeholder="Filter users" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <table className="aws-table">
        <thead><tr>
          <th className="w-8"><input type="checkbox" checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0} onChange={e => setSelectedUsers(e.target.checked ? filteredUsers.map(u => u.name) : [])} /></th>
          <th>User name</th><th>Groups</th><th>Last activity</th><th>MFA</th><th>Access key age</th>
        </tr></thead>
        <tbody>
          {filteredUsers.map(u => (
            <tr key={u.name} className={selectedUsers.includes(u.name) ? 'bg-blue-50/50' : ''}>
              <td><input type="checkbox" checked={selectedUsers.includes(u.name)} onChange={e => setSelectedUsers(e.target.checked ? [...selectedUsers, u.name] : selectedUsers.filter(n => n !== u.name))} /></td>
              <td><button className="text-aws-blue font-medium hover:underline" onClick={() => setSelectedUser(u.name)}>{u.name}</button></td>
              <td className="text-aws-text-secondary text-xs">{u.groups.join(', ')}</td>
              <td>{u.lastActivity}</td>
              <td>{u.mfaEnabled ? <span className="text-aws-success font-medium">Enabled</span> : <span className="text-aws-text-disabled">Not enabled</span>}</td>
              <td>{u.accessKeyAge}</td>
            </tr>
          ))}
          {filteredUsers.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-aws-text-secondary">No users found</td></tr>}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">
        Showing 1-{filteredUsers.length} of {filteredUsers.length} items
      </div>
    </div>
  );
}
