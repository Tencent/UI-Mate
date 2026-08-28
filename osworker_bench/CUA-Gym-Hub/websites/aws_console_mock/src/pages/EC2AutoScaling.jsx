import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, Scaling, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const AZS = ['us-east-1a', 'us-east-1b', 'us-east-1c'];

export default function EC2AutoScaling() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ min: 0, max: 1, desired: 1 });
  const [form, setForm] = useState({ name: '', launchTemplate: '', min: 1, max: 3, desired: 2, az: ['us-east-1a', 'us-east-1b'] });

  const asgs = (state.autoScalingGroups || []).filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (name) => setSelected(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  const toggleAll = () => setSelected(selected.length === asgs.length ? [] : asgs.map(a => a.name));
  const toggleAZ = (az) => setForm(prev => ({ ...prev, az: prev.az.includes(az) ? prev.az.filter(a => a !== az) : [...prev.az, az] }));

  const handleCreate = () => {
    if (!form.name.trim() || !form.launchTemplate) return;
    dispatch({ type: 'CREATE_ASG', payload: {
      name: form.name.trim(), minSize: Number(form.min), maxSize: Number(form.max), desiredCapacity: Number(form.desired),
      launchTemplate: form.launchTemplate, launchTemplateVersion: '1',
      az: form.az, vpcZoneIdentifier: form.az.map((_, i) => `subnet-${Math.random().toString(16).substr(2, 16)}`).join(','),
      targetGroupARNs: [], healthCheckType: 'EC2', healthCheckGracePeriod: 300,
      instances: [], created: new Date().toISOString(), tags: [], policies: []
    }});
    addFlash('success', `Auto Scaling group "${form.name}" created.`);
    setShowCreate(false);
    setForm({ name: '', launchTemplate: '', min: 1, max: 3, desired: 2, az: ['us-east-1a', 'us-east-1b'] });
  };

  const handleDelete = () => {
    selected.forEach(name => dispatch({ type: 'DELETE_ASG', payload: name }));
    addFlash('success', `${selected.length} Auto Scaling group(s) deleted.`);
    setSelected([]);
  };

  const handleUpdateCapacity = () => {
    if (Number(editForm.desired) < Number(editForm.min) || Number(editForm.desired) > Number(editForm.max)) {
      addFlash('error', 'Desired capacity must be between min and max.');
      return;
    }
    dispatch({ type: 'UPDATE_ASG', payload: { name: detail.name, minSize: Number(editForm.min), maxSize: Number(editForm.max), desiredCapacity: Number(editForm.desired) } });
    addFlash('success', 'Auto Scaling group capacity updated.');
    setShowEdit(false);
    setDetail(prev => ({ ...prev, minSize: Number(editForm.min), maxSize: Number(editForm.max), desiredCapacity: Number(editForm.desired) }));
  };

  if (detail) {
    const currentAsg = (state.autoScalingGroups || []).find(a => a.name === detail.name) || detail;
    return (
      <div>
        <button className="flex items-center gap-1 text-aws-blue text-sm mb-3 hover:underline" onClick={() => setDetail(null)}><ArrowLeft size={14} /> Back to Auto Scaling groups</button>
        <div className="aws-card p-0 mb-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
            <h2 className="font-bold text-lg">{currentAsg.name}</h2>
            <button className="aws-btn aws-btn-primary text-xs" onClick={() => { setEditForm({ min: currentAsg.minSize, max: currentAsg.maxSize, desired: currentAsg.desiredCapacity }); setShowEdit(true); }}>Edit capacity</button>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-aws-text-secondary">Min size:</span> {currentAsg.minSize}</div>
            <div><span className="text-aws-text-secondary">Max size:</span> {currentAsg.maxSize}</div>
            <div><span className="text-aws-text-secondary">Desired capacity:</span> {currentAsg.desiredCapacity}</div>
            <div><span className="text-aws-text-secondary">Launch template:</span> {currentAsg.launchTemplate}</div>
            <div><span className="text-aws-text-secondary">Health check:</span> {currentAsg.healthCheckType}</div>
            <div><span className="text-aws-text-secondary">AZ:</span> {currentAsg.az.join(', ')}</div>
            <div><span className="text-aws-text-secondary">Created:</span> {format(new Date(currentAsg.created), 'MMM d, yyyy h:mm a')}</div>
          </div>
        </div>
        <div className="aws-card p-0">
          <div className="px-4 py-3 border-b border-aws-border font-bold">Instances ({(currentAsg.instances || []).length})</div>
          <table className="aws-table">
            <thead><tr><th>Instance ID</th><th>Lifecycle</th><th>Health status</th></tr></thead>
            <tbody>
              {(currentAsg.instances || []).map(id => (
                <tr key={id}><td className="font-mono text-sm">{id}</td><td>InService</td><td><span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Healthy</span></td></tr>
              ))}
              {(currentAsg.instances || []).length === 0 && <tr><td colSpan={3} className="text-center py-6 text-aws-text-secondary">No instances</td></tr>}
            </tbody>
          </table>
        </div>

        {showEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white shadow-xl w-full max-w-sm border border-aws-border">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <h3 className="font-bold">Edit group size</h3>
                <button onClick={() => setShowEdit(false)}><X size={18} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div><label className="block text-sm font-bold mb-1">Minimum capacity</label><input type="number" className="aws-input" value={editForm.min} onChange={e => setEditForm({...editForm, min: e.target.value})} min={0} /></div>
                <div><label className="block text-sm font-bold mb-1">Maximum capacity</label><input type="number" className="aws-input" value={editForm.max} onChange={e => setEditForm({...editForm, max: e.target.value})} min={0} /></div>
                <div><label className="block text-sm font-bold mb-1">Desired capacity</label><input type="number" className="aws-input" value={editForm.desired} onChange={e => setEditForm({...editForm, desired: e.target.value})} min={0} /></div>
                <div className="flex justify-end gap-2 pt-2">
                  <button className="aws-btn aws-btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
                  <button className="aws-btn aws-btn-primary" onClick={handleUpdateCapacity}>Update</button>
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
          <h2 className="font-bold text-lg flex items-center gap-2"><Scaling size={18} /> Auto Scaling Groups ({asgs.length})</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="aws-input pl-7 text-sm w-56" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <button className="aws-btn aws-btn-secondary text-xs text-red-600" disabled={!selected.length} onClick={handleDelete}>Delete</button>
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create Auto Scaling group</button>
          </div>
        </div>
        <table className="aws-table">
          <thead><tr>
            <th><input type="checkbox" checked={selected.length === asgs.length && asgs.length > 0} onChange={toggleAll} /></th>
            <th>Name</th><th>Min</th><th>Max</th><th>Desired</th><th>Launch template</th><th>AZ</th><th>Health check</th><th>Created</th>
          </tr></thead>
          <tbody>
            {asgs.map(a => (
              <tr key={a.name} className={selected.includes(a.name) ? 'bg-blue-50' : ''}>
                <td><input type="checkbox" checked={selected.includes(a.name)} onChange={() => toggleSelect(a.name)} /></td>
                <td className="text-aws-blue font-medium cursor-pointer hover:underline" onClick={() => setDetail(a)}>{a.name}</td>
                <td>{a.minSize}</td>
                <td>{a.maxSize}</td>
                <td>{a.desiredCapacity}</td>
                <td>{a.launchTemplate}</td>
                <td className="text-xs">{a.az.join(', ')}</td>
                <td>{a.healthCheckType}</td>
                <td>{format(new Date(a.created), 'MMM d, yyyy')}</td>
              </tr>
            ))}
            {asgs.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-aws-text-secondary">No Auto Scaling groups found</td></tr>}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-md border border-aws-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create Auto Scaling group</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Name</label><input className="aws-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="my-asg" /></div>
              <div><label className="block text-sm font-bold mb-1">Launch template</label>
                <select className="aws-input" value={form.launchTemplate} onChange={e => setForm({...form, launchTemplate: e.target.value})}>
                  <option value="">Select a launch template</option>
                  {(state.launchTemplates || []).map(lt => <option key={lt.id} value={lt.name}>{lt.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="block text-sm font-bold mb-1">Min</label><input type="number" className="aws-input" value={form.min} onChange={e => setForm({...form, min: e.target.value})} min={0} /></div>
                <div><label className="block text-sm font-bold mb-1">Max</label><input type="number" className="aws-input" value={form.max} onChange={e => setForm({...form, max: e.target.value})} min={0} /></div>
                <div><label className="block text-sm font-bold mb-1">Desired</label><input type="number" className="aws-input" value={form.desired} onChange={e => setForm({...form, desired: e.target.value})} min={0} /></div>
              </div>
              <div><label className="block text-sm font-bold mb-1">Availability Zones</label>
                <div className="flex gap-4">
                  {AZS.map(az => <label key={az} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.az.includes(az)} onChange={() => toggleAZ(az)} /> {az}</label>)}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!form.name.trim() || !form.launchTemplate}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
