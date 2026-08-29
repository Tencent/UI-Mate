import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search } from 'lucide-react';

export default function IAMRoles() {
  const { state, dispatch, addFlash } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [detailTab, setDetailTab] = useState('Permissions');
  const [roleName, setRoleName] = useState('');
  const [trustedService, setTrustedService] = useState('ec2.amazonaws.com');
  const [selectedPolicies, setSelectedPolicies] = useState([]);

  const filteredRoles = state.iam.roles.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!roleName.trim()) return;
    dispatch({
      type: 'CREATE_ROLE',
      payload: {
        name: roleName.trim(),
        arn: `arn:aws:iam::123456789012:role/${roleName.trim()}`,
        created: new Date().toISOString().split('T')[0],
        lastActivity: 'N/A',
        trustedEntities: `AWS service: ${trustedService}`,
        description: '',
        policies: selectedPolicies,
        path: '/',
        maxSessionDuration: 3600
      }
    });
    addFlash('success', `Role "${roleName}" created`);
    setShowCreate(false);
    setRoleName('');
    setSelectedPolicies([]);
  };

  const handleDelete = () => {
    selected.forEach(name => dispatch({ type: 'DELETE_ROLE', payload: name }));
    addFlash('success', `${selected.length} role(s) deleted.`);
    setSelected([]);
  };

  if (showCreate) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-xl font-bold">Create role</h1>
        <div className="aws-card space-y-4">
          <div>
            <label className="aws-form-label">Trusted entity type</label>
            <select className="aws-input max-w-md mt-1" value={trustedService} onChange={e => setTrustedService(e.target.value)}>
              <option value="ec2.amazonaws.com">EC2</option>
              <option value="lambda.amazonaws.com">Lambda</option>
              <option value="ecs-tasks.amazonaws.com">ECS</option>
              <option value="s3.amazonaws.com">S3</option>
            </select>
          </div>
          <div>
            <label className="aws-form-label">Attach policies</label>
            <div className="space-y-1 max-h-48 overflow-y-auto border border-aws-border rounded p-2 mt-1">
              {state.iam.policies.map(p => (
                <label key={p.name} className="flex items-center gap-2 py-1 text-sm hover:bg-gray-50 px-1 rounded">
                  <input type="checkbox" checked={selectedPolicies.includes(p.name)} onChange={e => {
                    if (e.target.checked) setSelectedPolicies([...selectedPolicies, p.name]);
                    else setSelectedPolicies(selectedPolicies.filter(n => n !== p.name));
                  }} />
                  {p.name}
                  <span className="text-xs text-aws-text-disabled ml-auto">{p.type}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="aws-form-label">Role name <span className="text-red-500">*</span></label>
            <input className="aws-input max-w-md mt-1" value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="MyServiceRole" />
          </div>
          <div className="flex justify-end gap-2">
            <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!roleName.trim()}>Create role</button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedRole) {
    const role = state.iam.roles.find(r => r.name === selectedRole);
    if (!role) { setSelectedRole(null); return null; }
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button className="text-aws-blue hover:underline text-sm" onClick={() => setSelectedRole(null)}>Roles</button>
          <span className="text-aws-text-secondary">/</span>
          <h1 className="text-xl font-bold">{role.name}</h1>
        </div>
        <div className="aws-card text-sm space-y-2">
          <div><span className="text-aws-text-secondary font-medium">ARN:</span> <span className="font-mono text-xs ml-2">{role.arn}</span></div>
          <div><span className="text-aws-text-secondary font-medium">Created:</span> <span className="ml-2">{role.created}</span></div>
          <div><span className="text-aws-text-secondary font-medium">Trusted entities:</span> <span className="ml-2">{role.trustedEntities}</span></div>
          <div><span className="text-aws-text-secondary font-medium">Max session duration:</span> <span className="ml-2">{role.maxSessionDuration || 3600}s</span></div>
        </div>
        <div className="flex gap-4 border-b border-aws-border">
          {['Permissions', 'Trust relationships'].map(t => (
            <button key={t} onClick={() => setDetailTab(t)} className={`pb-3 px-1 text-sm font-medium border-b-2 ${detailTab === t ? 'border-aws-blue text-aws-blue' : 'border-transparent text-aws-text-secondary'}`}>{t}</button>
          ))}
        </div>
        <div className="aws-card">
          {detailTab === 'Permissions' && (
            <div className="text-sm">
              <h3 className="font-bold mb-2">Attached policies</h3>
              {(role.policies || []).length > 0 ? role.policies.map(p => (
                <div key={p} className="py-1.5 flex items-center gap-2 border-b border-gray-100 last:border-0">
                  <span className="text-aws-blue">{p}</span>
                </div>
              )) : <p className="text-aws-text-secondary">No policies attached</p>}
            </div>
          )}
          {detailTab === 'Trust relationships' && (
            <div>
              <h3 className="font-bold text-sm mb-2">Trusted entities</h3>
              <pre className="aws-code text-xs">{JSON.stringify({
                Version: '2012-10-17',
                Statement: [{
                  Effect: 'Allow',
                  Principal: { Service: role.trustedEntities?.replace('AWS service: ', '') || 'ec2.amazonaws.com' },
                  Action: 'sts:AssumeRole'
                }]
              }, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="aws-card p-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
        <h2 className="font-bold text-lg">Roles ({state.iam.roles.length})</h2>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
          <button className="aws-btn aws-btn-secondary text-xs text-red-600" disabled={!selected.length} onClick={handleDelete}>Delete</button>
          <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create role</button>
        </div>
      </div>
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="aws-input pl-8" placeholder="Filter roles" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <table className="aws-table">
        <thead><tr>
          <th className="w-8"><input type="checkbox" checked={selected.length === filteredRoles.length && filteredRoles.length > 0} onChange={e => setSelected(e.target.checked ? filteredRoles.map(r => r.name) : [])} /></th>
          <th>Role name</th><th>Trusted entities</th><th>Last activity</th><th>Creation date</th>
        </tr></thead>
        <tbody>
          {filteredRoles.map(r => (
            <tr key={r.name} className={selected.includes(r.name) ? 'bg-blue-50/50' : ''}>
              <td><input type="checkbox" checked={selected.includes(r.name)} onChange={e => setSelected(e.target.checked ? [...selected, r.name] : selected.filter(n => n !== r.name))} /></td>
              <td><button className="text-aws-blue font-medium hover:underline" onClick={() => setSelectedRole(r.name)}>{r.name}</button></td>
              <td className="text-aws-text-secondary text-xs">{r.trustedEntities}</td>
              <td>{r.lastActivity}</td>
              <td>{r.created}</td>
            </tr>
          ))}
          {filteredRoles.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-aws-text-secondary">No roles found</td></tr>}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">
        Showing 1-{filteredRoles.length} of {filteredRoles.length} items
      </div>
    </div>
  );
}
