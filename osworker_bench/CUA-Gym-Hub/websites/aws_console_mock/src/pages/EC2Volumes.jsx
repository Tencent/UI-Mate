import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, HardDrive } from 'lucide-react';
import { format } from 'date-fns';
import AccessDenied from '../components/AccessDenied';

const VOLUME_TYPES = ['gp2', 'gp3', 'io1', 'io2', 'st1', 'sc1'];

const getRegionFromAz = (az) => az ? az.replace(/[a-z]$/, '') : '';

export default function EC2Volumes() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const currentRegion = state.user?.region || 'us-east-1';
  const AZS = [`${currentRegion}a`, `${currentRegion}b`, `${currentRegion}c`];
  const [form, setForm] = useState({ name: '', size: 8, volumeType: 'gp3', az: AZS[0], encrypted: true });

  const userRole = state.user?.role || 'admin';
  const approvedRegions = state.user?.approvedRegions || [];
  const isRestricted = userRole === 'lab-member' && approvedRegions.length > 0 && !approvedRegions.includes(currentRegion);

  if (isRestricted) {
    return <AccessDenied service="EC2 - Volumes" region={currentRegion} action="ec2:DescribeVolumes" />;
  }

  const volumes = (state.volumes || []).filter(v => {
    if (getRegionFromAz(v.az) !== currentRegion) return false;
    return !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase());
  });

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === volumes.length ? [] : volumes.map(v => v.id));

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const iops = ['gp3', 'io1', 'io2'].includes(form.volumeType) ? 3000 : ['gp2'].includes(form.volumeType) ? Math.max(100, form.size * 3) : 0;
    dispatch({ type: 'CREATE_VOLUME', payload: {
      id: `vol-${Math.random().toString(16).substr(2, 17)}`, name: form.name.trim(), size: Number(form.size),
      volumeType: form.volumeType, state: 'available', iops, throughput: form.volumeType === 'gp3' ? 125 : 0,
      az: form.az, attachedTo: '', device: '', created: new Date().toISOString(), encrypted: form.encrypted, snapshotId: ''
    }});
    addFlash('success', `Volume "${form.name}" created successfully.`);
    setShowCreate(false);
    setForm({ name: '', size: 8, volumeType: 'gp3', az: 'us-east-1a', encrypted: true });
  };

  const handleDelete = () => {
    const deletable = selected.filter(id => { const v = state.volumes.find(x => x.id === id); return v && v.state === 'available'; });
    if (!deletable.length) { addFlash('error', 'Only available (unattached) volumes can be deleted.'); return; }
    deletable.forEach(id => dispatch({ type: 'DELETE_VOLUME', payload: id }));
    addFlash('success', `${deletable.length} volume(s) deleted.`);
    setSelected([]);
  };

  const handleDetach = () => {
    selected.forEach(id => { const v = state.volumes.find(x => x.id === id); if (v && v.state === 'in-use') dispatch({ type: 'DETACH_VOLUME', payload: id }); });
    addFlash('success', 'Volume(s) detached.');
    setSelected([]);
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg flex items-center gap-2"><HardDrive size={18} /> Volumes ({volumes.length})</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="aws-input pl-7 text-sm w-56" placeholder="Search volumes..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <button className="aws-btn aws-btn-secondary text-xs" disabled={!selected.length} onClick={handleDetach}>Detach</button>
            <button className="aws-btn aws-btn-secondary text-xs text-red-600" disabled={!selected.length} onClick={handleDelete}>Delete</button>
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create volume</button>
          </div>
        </div>
        <table className="aws-table">
          <thead><tr>
            <th><input type="checkbox" checked={selected.length === volumes.length && volumes.length > 0} onChange={toggleAll} /></th>
            <th>Name</th><th>Volume ID</th><th>Size</th><th>Type</th><th>State</th><th>IOPS</th><th>Attached Instance</th><th>AZ</th><th>Created</th><th>Encrypted</th>
          </tr></thead>
          <tbody>
            {volumes.map(v => (
              <tr key={v.id} className={selected.includes(v.id) ? 'bg-blue-50' : ''}>
                <td><input type="checkbox" checked={selected.includes(v.id)} onChange={() => toggleSelect(v.id)} /></td>
                <td className="text-aws-blue font-medium">{v.name}</td>
                <td className="font-mono text-sm">{v.id}</td>
                <td>{v.size} GiB</td>
                <td><span className="text-xs font-mono">{v.volumeType}</span></td>
                <td><span className={`px-2 py-0.5 rounded text-xs font-medium ${v.state === 'in-use' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{v.state}</span></td>
                <td>{v.iops || '-'}</td>
                <td className="font-mono text-sm">{v.attachedTo || '-'}</td>
                <td>{v.az}</td>
                <td>{format(new Date(v.created), 'MMM d, yyyy')}</td>
                <td>{v.encrypted ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {volumes.length === 0 && <tr><td colSpan={11} className="text-center py-8 text-aws-text-secondary">No volumes found</td></tr>}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-md border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create volume</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div><label className="block text-sm font-bold mb-1">Name</label><input className="aws-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="my-volume" /></div>
              <div><label className="block text-sm font-bold mb-1">Size (GiB)</label><input type="number" className="aws-input" value={form.size} onChange={e => setForm({...form, size: e.target.value})} min={1} /></div>
              <div><label className="block text-sm font-bold mb-1">Volume type</label>
                <select className="aws-input" value={form.volumeType} onChange={e => setForm({...form, volumeType: e.target.value})}>
                  {VOLUME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-bold mb-1">Availability Zone</label>
                <select className="aws-input" value={form.az} onChange={e => setForm({...form, az: e.target.value})}>
                  {AZS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.encrypted} onChange={e => setForm({...form, encrypted: e.target.checked})} /> Encrypt this volume</label></div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!form.name.trim()}>Create volume</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
