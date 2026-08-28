import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, FileCode, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const INSTANCE_TYPES = ['t2.micro', 't2.small', 't2.medium', 't3.micro', 't3.small', 't3.medium', 't3.large', 'm5.large', 'm5.xlarge', 'c5.large', 'c5.xlarge', 'r5.large'];

export default function EC2LaunchTemplates() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ name: '', ami: '', instanceType: 't3.small', keyPair: '', securityGroups: [], userData: '' });

  const lts = (state.launchTemplates || []).filter(lt =>
    !search || lt.name.toLowerCase().includes(search.toLowerCase()) || lt.id.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === lts.length ? [] : lts.map(lt => lt.id));
  const toggleSG = (sgId) => setForm(prev => ({ ...prev, securityGroups: prev.securityGroups.includes(sgId) ? prev.securityGroups.filter(x => x !== sgId) : [...prev.securityGroups, sgId] }));

  const handleCreate = () => {
    if (!form.name.trim()) return;
    dispatch({ type: 'CREATE_LAUNCH_TEMPLATE', payload: {
      id: `lt-${Math.random().toString(16).substr(2, 17)}`, name: form.name.trim(),
      version: 1, defaultVersion: 1, latestVersion: 1,
      ami: form.ami || 'ami-0abcdef1234567890', instanceType: form.instanceType,
      keyPair: form.keyPair, securityGroups: form.securityGroups,
      userData: form.userData, iamInstanceProfile: '', monitoring: false,
      created: new Date().toISOString(), createdBy: state.user?.name || 'admin', tags: []
    }});
    addFlash('success', `Launch template "${form.name}" created.`);
    setShowCreate(false);
    setForm({ name: '', ami: '', instanceType: 't3.small', keyPair: '', securityGroups: [], userData: '' });
  };

  const handleDelete = () => {
    selected.forEach(id => dispatch({ type: 'DELETE_LAUNCH_TEMPLATE', payload: id }));
    addFlash('success', `${selected.length} launch template(s) deleted.`);
    setSelected([]);
  };

  if (detail) {
    const currentLt = (state.launchTemplates || []).find(lt => lt.id === detail.id) || detail;
    return (
      <div>
        <button className="flex items-center gap-1 text-aws-blue text-sm mb-3 hover:underline" onClick={() => setDetail(null)}><ArrowLeft size={14} /> Back to launch templates</button>
        <div className="aws-card p-0">
          <div className="px-4 py-3 border-b border-aws-border">
            <h2 className="font-bold text-lg">{currentLt.name}</h2>
            <p className="text-sm text-aws-text-secondary font-mono">{currentLt.id}</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-aws-text-secondary font-bold block mb-1">Default version</span>{currentLt.defaultVersion}</div>
              <div><span className="text-aws-text-secondary font-bold block mb-1">Latest version</span>{currentLt.latestVersion}</div>
              <div><span className="text-aws-text-secondary font-bold block mb-1">AMI</span><span className="font-mono">{currentLt.ami}</span></div>
              <div><span className="text-aws-text-secondary font-bold block mb-1">Instance type</span>{currentLt.instanceType}</div>
              <div><span className="text-aws-text-secondary font-bold block mb-1">Key pair</span>{currentLt.keyPair || '-'}</div>
              <div><span className="text-aws-text-secondary font-bold block mb-1">Created</span>{format(new Date(currentLt.created), 'MMM d, yyyy h:mm a')}</div>
              <div><span className="text-aws-text-secondary font-bold block mb-1">Security groups</span>{currentLt.securityGroups.length ? currentLt.securityGroups.join(', ') : '-'}</div>
              <div><span className="text-aws-text-secondary font-bold block mb-1">Monitoring</span>{currentLt.monitoring ? 'Enabled' : 'Disabled'}</div>
            </div>
            {currentLt.userData && (
              <div>
                <span className="text-aws-text-secondary font-bold block mb-1 text-sm">User data</span>
                <pre className="bg-gray-50 border border-aws-border p-3 text-xs font-mono rounded overflow-x-auto">{currentLt.userData}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg flex items-center gap-2"><FileCode size={18} /> Launch Templates ({lts.length})</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="aws-input pl-7 text-sm w-56" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <button className="aws-btn aws-btn-secondary text-xs text-red-600" disabled={!selected.length} onClick={handleDelete}>Delete</button>
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create launch template</button>
          </div>
        </div>
        <table className="aws-table">
          <thead><tr>
            <th><input type="checkbox" checked={selected.length === lts.length && lts.length > 0} onChange={toggleAll} /></th>
            <th>Name</th><th>Template ID</th><th>Default version</th><th>Latest version</th><th>AMI</th><th>Instance type</th><th>Created</th>
          </tr></thead>
          <tbody>
            {lts.map(lt => (
              <tr key={lt.id} className={selected.includes(lt.id) ? 'bg-blue-50' : ''}>
                <td><input type="checkbox" checked={selected.includes(lt.id)} onChange={() => toggleSelect(lt.id)} /></td>
                <td className="text-aws-blue font-medium cursor-pointer hover:underline" onClick={() => setDetail(lt)}>{lt.name}</td>
                <td className="font-mono text-sm">{lt.id}</td>
                <td>{lt.defaultVersion}</td>
                <td>{lt.latestVersion}</td>
                <td className="font-mono text-sm">{lt.ami}</td>
                <td>{lt.instanceType}</td>
                <td>{format(new Date(lt.created), 'MMM d, yyyy')}</td>
              </tr>
            ))}
            {lts.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-aws-text-secondary">No launch templates found</td></tr>}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-lg border border-aws-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create launch template</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Name</label><input className="aws-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="my-launch-template" /></div>
              <div><label className="block text-sm font-bold mb-1">AMI</label>
                <select className="aws-input" value={form.ami} onChange={e => setForm({...form, ami: e.target.value})}>
                  <option value="">Select an AMI</option>
                  {(state.amis || []).map(a => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-bold mb-1">Instance type</label>
                <select className="aws-input" value={form.instanceType} onChange={e => setForm({...form, instanceType: e.target.value})}>
                  {INSTANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-bold mb-1">Key pair</label>
                <select className="aws-input" value={form.keyPair} onChange={e => setForm({...form, keyPair: e.target.value})}>
                  <option value="">None</option>
                  {(state.keyPairs || []).map(kp => <option key={kp.name} value={kp.name}>{kp.name}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-bold mb-1">Security groups</label>
                <div className="space-y-1 max-h-32 overflow-y-auto border border-aws-border rounded p-2">
                  {(state.securityGroups || []).map(sg => (
                    <label key={sg.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.securityGroups.includes(sg.id)} onChange={() => toggleSG(sg.id)} /> {sg.name} ({sg.id})</label>
                  ))}
                </div>
              </div>
              <div><label className="block text-sm font-bold mb-1">User data</label>
                <textarea className="aws-input font-mono text-xs" rows={4} value={form.userData} onChange={e => setForm({...form, userData: e.target.value})} placeholder="#!/bin/bash" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!form.name.trim()}>Create launch template</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
