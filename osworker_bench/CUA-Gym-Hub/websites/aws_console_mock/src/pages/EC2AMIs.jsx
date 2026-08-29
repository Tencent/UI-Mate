import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, Image, ChevronDown, X } from 'lucide-react';
import { format } from 'date-fns';

export default function EC2AMIs() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [tab, setTab] = useState('owned'); // 'owned' | 'public'
  const [showLaunch, setShowLaunch] = useState(false);
  const [launchName, setLaunchName] = useState('');
  const [launchType, setLaunchType] = useState('t2.micro');

  const allAmis = state.amis || [];
  const filtered = allAmis.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'owned' ? (a.owner === '123456789012' || !a.public) : a.public;
    return matchSearch && matchTab;
  });

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(a => a.id));

  const handleLaunch = () => {
    if (!launchName.trim()) return;
    const ami = state.amis?.find(a => a.id === selected[0]);
    const region = state.user?.region || 'us-east-1';
    const az = `${region}a`;
    const id = `i-${Math.random().toString(16).substr(2, 17)}`;
    dispatch({
      type: 'LAUNCH_INSTANCE',
      payload: {
        id,
        name: launchName.trim(),
        type: launchType,
        state: 'running',
        az,
        publicIp: `54.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        privateIp: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        securityGroups: (state.securityGroups || []).slice(0, 1).map(sg => sg.id),
        keyPair: state.keyPairs?.[0]?.name || '',
        launchTime: new Date().toISOString(),
        imageId: selected[0],
        platform: ami?.platform || 'Linux',
        tags: [{ key: 'Name', value: launchName.trim() }],
      }
    });
    addFlash('success', `Instance "${launchName}" launched successfully from AMI ${selected[0]}`);
    setShowLaunch(false);
    setLaunchName('');
    setSelected([]);
  };

  return (
    <div>
      <div className="aws-card p-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-aws-border">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="aws-input pl-7 text-sm w-56" placeholder="Search AMIs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
          <button className="aws-btn aws-btn-secondary text-xs" disabled={!selected.length} onClick={() => setShowLaunch(true)}>Launch instance from AMI</button>
          <button className="aws-btn aws-btn-secondary text-xs text-red-600" disabled={!selected.length} onClick={() => { selected.forEach(id => dispatch({ type: 'DELETE_AMI', payload: id })); addFlash('success', `${selected.length} AMI(s) deregistered.`); setSelected([]); }}>Deregister AMI</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-aws-border">
          <button className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === 'owned' ? 'border-aws-blue text-aws-blue' : 'border-transparent text-aws-text-secondary hover:text-aws-text'}`} onClick={() => { setTab('owned'); setSelected([]); }}>Owned by me</button>
          <button className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === 'public' ? 'border-aws-blue text-aws-blue' : 'border-transparent text-aws-text-secondary hover:text-aws-text'}`} onClick={() => { setTab('public'); setSelected([]); }}>Public images</button>
        </div>

        {/* Table */}
        <table className="aws-table">
          <thead><tr>
            <th><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
            <th>Name</th><th>AMI ID</th><th>Owner</th><th>State</th><th>Architecture</th><th>Platform</th><th>Root device type</th><th>Created</th>
          </tr></thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className={selected.includes(a.id) ? 'bg-blue-50' : ''}>
                <td><input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleSelect(a.id)} /></td>
                <td className="text-aws-blue font-medium">{a.name}</td>
                <td className="font-mono text-sm">{a.id}</td>
                <td><span className={`px-2 py-0.5 rounded text-xs font-medium ${a.owner === 'amazon' ? 'bg-orange-100 text-orange-800' : a.owner === '123456789012' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {a.owner === '123456789012' ? 'self' : a.owner}
                </span></td>
                <td><span className={`px-2 py-0.5 rounded text-xs font-medium ${a.state === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{a.state}</span></td>
                <td>{a.architecture}</td>
                <td>{a.platform}</td>
                <td>{a.rootDeviceType}</td>
                <td>{format(new Date(a.created), 'MMM d, yyyy')}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-aws-text-secondary">No AMIs found</td></tr>}
          </tbody>
        </table>
      </div>

      {showLaunch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-md border border-aws-border" style={{ borderRadius: 8 }}>
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Launch instance from AMI</h3>
              <button onClick={() => setShowLaunch(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-sm text-aws-text-secondary bg-gray-50 p-2 rounded">
                AMI: <span className="font-mono text-xs">{selected[0]}</span>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Instance name *</label>
                <input className="aws-input" value={launchName} onChange={e => setLaunchName(e.target.value)} placeholder="my-instance" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Instance type</label>
                <select className="aws-input" value={launchType} onChange={e => setLaunchType(e.target.value)}>
                  {['t2.micro', 't3.micro', 't3.small', 'm5.large', 'c5.large'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowLaunch(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleLaunch} disabled={!launchName.trim()}>Launch instance</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
