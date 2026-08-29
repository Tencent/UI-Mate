import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { format } from 'date-fns';
import ColumnToggle, { useColumnVisibility } from '../components/ColumnToggle';

const STATE_COLORS = {
  running: { dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
  stopped: { dot: 'bg-red-400', text: 'text-gray-700', bg: 'bg-gray-100' },
  pending: { dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  stopping: { dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  'shutting-down': { dot: 'bg-red-400 animate-pulse', text: 'text-red-700', bg: 'bg-red-50' },
  terminated: { dot: 'bg-gray-400', text: 'text-gray-500', bg: 'bg-gray-50' },
};

const INSTANCE_TYPES = [
  { name: 't2.micro', vcpus: 1, memory: 1, storage: 'EBS Only', network: 'Low to Moderate', free: true },
  { name: 't3.micro', vcpus: 2, memory: 1, storage: 'EBS Only', network: 'Low to Moderate', free: true },
  { name: 't3.small', vcpus: 2, memory: 2, storage: 'EBS Only', network: 'Low to Moderate' },
  { name: 't3.medium', vcpus: 2, memory: 4, storage: 'EBS Only', network: 'Low to Moderate' },
  { name: 'm5.large', vcpus: 2, memory: 8, storage: 'EBS Only', network: 'Up to 10 Gbps' },
  { name: 'm5.xlarge', vcpus: 4, memory: 16, storage: 'EBS Only', network: 'Up to 10 Gbps' },
  { name: 'c5.large', vcpus: 2, memory: 4, storage: 'EBS Only', network: 'Up to 10 Gbps' },
];

const AMIS = [
  { id: 'ami-0abcdef1234567890', name: 'Amazon Linux 2023 AMI', os: 'Amazon Linux', arch: '64-bit (x86)', free: true },
  { id: 'ami-0bcdef2345678901a', name: 'Ubuntu Server 22.04 LTS', os: 'Ubuntu', arch: '64-bit (x86)', free: true },
  { id: 'ami-0cdef3456789012ab', name: 'Windows Server 2022 Base', os: 'Windows', arch: '64-bit (x86)', free: true },
  { id: 'ami-0def4567890123bcd', name: 'Red Hat Enterprise Linux 9', os: 'Red Hat', arch: '64-bit (x86)' },
  { id: 'ami-0ef56789012345cde', name: 'macOS Ventura 13.6', os: 'macOS', arch: '64-bit (Arm)' },
  { id: 'ami-0f67890123456def0', name: 'SUSE Linux Enterprise 15', os: 'SUSE', arch: '64-bit (x86)' },
  { id: 'ami-0089012345678ef01', name: 'Debian 12', os: 'Debian', arch: '64-bit (x86)', free: true },
];

export default function EC2() {
  const { state, dispatch, addFlash } = useStore();
  const [view, setView] = useState('list');
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [detailTab, setDetailTab] = useState('Details');
  const [stateDropdown, setStateDropdown] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const EC2_COLUMNS = [
    { key: 'name', label: 'Name' },
    { key: 'id', label: 'Instance ID' },
    { key: 'state', label: 'Instance state' },
    { key: 'type', label: 'Instance type' },
    { key: 'publicIp', label: 'Public IPv4 address' },
    { key: 'az', label: 'Availability zone' },
    { key: 'launchTime', label: 'Launch time' },
  ];
  const [visibleCols, setVisibleCols] = useColumnVisibility('ec2_instances', EC2_COLUMNS.map(c => c.key));

  // Launch wizard state
  const [launchName, setLaunchName] = useState('');
  const [launchAmi, setLaunchAmi] = useState(AMIS[0].id);
  const [launchType, setLaunchType] = useState('t2.micro');
  const [launchKeyPair, setLaunchKeyPair] = useState(state.keyPairs[0]?.name || '');
  const [launchStorage, setLaunchStorage] = useState(8);
  const [launchStorageType, setLaunchStorageType] = useState('gp3');

  const instances = state.ec2.filter(i => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.state.toLowerCase().includes(q) || i.type.toLowerCase().includes(q);
  }).sort((a, b) => {
    const val = sortDir === 'asc' ? 1 : -1;
    const aVal = a[sortCol] || '';
    const bVal = b[sortCol] || '';
    return aVal < bVal ? -val : aVal > bVal ? val : 0;
  });

  const selectedInstance = selectedIds.length === 1 ? state.ec2.find(i => i.id === selectedIds[0]) : null;

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const handleStateChange = (action) => {
    selectedIds.forEach(id => {
      const inst = state.ec2.find(i => i.id === id);
      if (!inst) return;
      if (action === 'start' && inst.state === 'stopped') {
        dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id, state: 'pending' } });
        setTimeout(() => {
          const ip = `${Math.floor(Math.random()*50)+3}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
          dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id, state: 'running', publicIp: ip } });
          dispatch({ type: 'ADD_NOTIFICATION', payload: { title: 'Instance started', message: `${inst.name} (${id}) is now running`, type: 'success', service: 'EC2' } });
          addFlash('success', `Successfully started instance ${id}`);
        }, 3000);
      } else if (action === 'stop' && inst.state === 'running') {
        dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id, state: 'stopping' } });
        setTimeout(() => {
          dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id, state: 'stopped', publicIp: '-' } });
          dispatch({ type: 'ADD_NOTIFICATION', payload: { title: 'Instance stopped', message: `${inst.name} (${id}) has been stopped`, type: 'info', service: 'EC2' } });
        }, 2000);
      } else if (action === 'reboot' && inst.state === 'running') {
        dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id, state: 'pending' } });
        setTimeout(() => {
          dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id, state: 'running' } });
        }, 2000);
      } else if (action === 'terminate') {
        dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id, state: 'shutting-down' } });
        setTimeout(() => {
          dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id, state: 'terminated' } });
          dispatch({ type: 'ADD_NOTIFICATION', payload: { title: 'Instance terminated', message: `${inst.name} (${id}) has been terminated`, type: 'warning', service: 'EC2' } });
          setTimeout(() => dispatch({ type: 'TERMINATE_INSTANCE', payload: id }), 5000);
        }, 3000);
      }
    });
    setSelectedIds([]);
    setStateDropdown(false);
  };

  const handleLaunch = () => {
    const ami = AMIS.find(a => a.id === launchAmi) || AMIS[0];
    const newId = `i-${Math.random().toString(16).substr(2, 17).padEnd(17, '0')}`;
    const newInstance = {
      id: newId,
      name: launchName || 'Unnamed Instance',
      type: launchType,
      state: 'pending',
      publicIp: '-',
      privateIp: `10.0.${Math.floor(Math.random()*4)}.${Math.floor(Math.random()*250)+1}`,
      az: `${state.user.region}${['a','b','c'][Math.floor(Math.random()*3)]}`,
      vpcId: 'vpc-0abc1234def56789',
      subnetId: 'subnet-0def5678abc12345',
      ami: launchAmi,
      amiName: ami.name,
      platform: ami.os === 'Windows' ? 'Windows' : 'Linux/UNIX',
      keyPair: launchKeyPair,
      securityGroups: ['sg-web-server'],
      launchTime: new Date().toISOString(),
      monitoring: 'disabled',
      tags: [{ Key: 'Name', Value: launchName || 'Unnamed Instance' }]
    };
    dispatch({ type: 'LAUNCH_INSTANCE', payload: newInstance });
    addFlash('success', `Successfully initiated launch of instance ${newId}`);
    setTimeout(() => {
      const ip = `${Math.floor(Math.random()*50)+3}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
      dispatch({ type: 'UPDATE_INSTANCE_STATE', payload: { id: newId, state: 'running', publicIp: ip } });
    }, 3000);
    setView('list');
    setLaunchName(''); setLaunchType('t2.micro'); setLaunchAmi(AMIS[0].id); setLaunchStorage(8);
  };

  // Launch Wizard
  if (view === 'launch') {
    const selectedAmi = AMIS.find(a => a.id === launchAmi) || AMIS[0];
    const selectedType = INSTANCE_TYPES.find(t => t.name === launchType) || INSTANCE_TYPES[0];
    return (
      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          <h1 className="text-xl font-bold text-aws-text">Launch an instance</h1>
          {/* Name */}
          <div className="aws-card">
            <h2 className="font-bold text-sm mb-3">Name and tags</h2>
            <input className="aws-input max-w-md" placeholder="e.g. My Web Server" value={launchName} onChange={e => setLaunchName(e.target.value)} />
          </div>
          {/* AMI */}
          <div className="aws-card">
            <h2 className="font-bold text-sm mb-3">Application and OS Images (AMI)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AMIS.map(ami => (
                <button key={ami.id} onClick={() => setLaunchAmi(ami.id)} className={`p-3 border text-left ${launchAmi === ami.id ? 'border-aws-orange bg-orange-50' : 'border-aws-border hover:bg-gray-50'}`}>
                  <div className="font-bold text-sm">{ami.os}</div>
                  <div className="text-xs text-aws-text-secondary mt-1">{ami.name}</div>
                  {ami.free && <div className="text-xs text-aws-success mt-1 font-medium">Free tier eligible</div>}
                  <div className="text-xs text-aws-text-disabled mt-0.5">{ami.arch}</div>
                </button>
              ))}
            </div>
          </div>
          {/* Instance Type */}
          <div className="aws-card">
            <h2 className="font-bold text-sm mb-3">Instance type</h2>
            <table className="aws-table">
              <thead><tr><th></th><th>Name</th><th>vCPUs</th><th>Memory (GiB)</th><th>Storage</th><th>Network</th></tr></thead>
              <tbody>
                {INSTANCE_TYPES.map(t => (
                  <tr key={t.name} className={`cursor-pointer ${launchType === t.name ? 'bg-orange-50' : ''}`} onClick={() => setLaunchType(t.name)}>
                    <td><input type="radio" checked={launchType === t.name} onChange={() => setLaunchType(t.name)} /></td>
                    <td className="font-medium">{t.name} {t.free && <span className="text-xs text-aws-success ml-1">Free tier eligible</span>}</td>
                    <td>{t.vcpus}</td><td>{t.memory}</td><td>{t.storage}</td><td>{t.network}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Key Pair */}
          <div className="aws-card">
            <h2 className="font-bold text-sm mb-3">Key pair (login)</h2>
            <select className="aws-input max-w-md" value={launchKeyPair} onChange={e => setLaunchKeyPair(e.target.value)}>
              {state.keyPairs.map(kp => <option key={kp.name} value={kp.name}>{kp.name} ({kp.type})</option>)}
            </select>
          </div>
          {/* Storage */}
          <div className="aws-card">
            <h2 className="font-bold text-sm mb-3">Configure storage</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm">1x</span>
              <input type="number" className="aws-input w-20" value={launchStorage} onChange={e => setLaunchStorage(Number(e.target.value))} min={1} />
              <span className="text-sm">GiB</span>
              <select className="aws-input w-32" value={launchStorageType} onChange={e => setLaunchStorageType(e.target.value)}>
                <option value="gp2">gp2</option><option value="gp3">gp3</option><option value="io1">io1</option><option value="io2">io2</option>
              </select>
            </div>
          </div>
        </div>
        {/* Summary Sidebar */}
        <div className="w-72 flex-shrink-0">
          <div className="aws-card sticky top-4">
            <h3 className="font-bold text-sm mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-aws-text-secondary">AMI:</span> <span className="font-medium">{selectedAmi.name}</span></div>
              <div><span className="text-aws-text-secondary">Instance type:</span> <span className="font-medium">{launchType}</span></div>
              <div><span className="text-aws-text-secondary">Key pair:</span> <span className="font-medium">{launchKeyPair || 'None'}</span></div>
              <div><span className="text-aws-text-secondary">Storage:</span> <span className="font-medium">{launchStorage} GiB {launchStorageType}</span></div>
            </div>
            <div className="mt-6 space-y-2">
              <button className="aws-btn aws-btn-primary w-full" onClick={handleLaunch}>Launch instance</button>
              <button className="aws-btn aws-btn-secondary w-full" onClick={() => setView('list')}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Instance List
  return (
    <div className="space-y-0">
      <div className="aws-card p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Instances ({instances.length})</h2>
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 hover:bg-gray-100 rounded"
              onClick={() => { setLastRefreshed(new Date()); addFlash('info', 'Instances refreshed from local state'); }}
              title={lastRefreshed ? `Last refreshed ${lastRefreshed.toLocaleTimeString()}` : 'Refresh instances'}
            >
              <RefreshCw size={16} className="text-aws-text-secondary" />
            </button>
            <ColumnToggle tableName="ec2_instances" columns={EC2_COLUMNS} visibleColumns={visibleCols} onToggle={setVisibleCols} />
          </div>
        </div>
        {/* Actions bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <button
              className="aws-btn aws-btn-secondary flex items-center gap-1 text-xs"
              disabled={selectedIds.length === 0}
              onClick={() => setStateDropdown(!stateDropdown)}
            >
              Instance state <ChevronDown size={12} />
            </button>
            {stateDropdown && selectedIds.length > 0 && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-aws-border shadow-lg z-20 w-36" style={{ borderRadius: 2 }}>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => handleStateChange('start')}>Start</button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => handleStateChange('stop')}>Stop</button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => handleStateChange('reboot')}>Reboot</button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-aws-error" onClick={() => handleStateChange('terminate')}>Terminate</button>
              </div>
            )}
          </div>
          <button className="aws-btn aws-btn-primary text-xs" onClick={() => setView('launch')}>Launch instances</button>
        </div>
        {/* Filter */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="aws-input pl-8" placeholder="Find instances by attribute or tag" value={filterText} onChange={e => setFilterText(e.target.value)} />
          </div>
          {filterText && (
            <button className="flex items-center gap-1 text-xs text-aws-blue hover:underline" onClick={() => setFilterText('')}>
              <X size={12} /> Clear
            </button>
          )}
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="aws-table">
            <thead>
              <tr>
                <th className="w-8"><input type="checkbox" onChange={e => { if (e.target.checked) setSelectedIds(instances.map(i => i.id)); else setSelectedIds([]); }} checked={selectedIds.length > 0 && selectedIds.length === instances.length} /></th>
                {visibleCols.includes('name') && <th className="cursor-pointer select-none" onClick={() => handleSort('name')}>Name <SortIcon col="name" /></th>}
                {visibleCols.includes('id') && <th className="cursor-pointer select-none" onClick={() => handleSort('id')}>Instance ID <SortIcon col="id" /></th>}
                {visibleCols.includes('state') && <th className="cursor-pointer select-none" onClick={() => handleSort('state')}>Instance state <SortIcon col="state" /></th>}
                {visibleCols.includes('type') && <th className="cursor-pointer select-none" onClick={() => handleSort('type')}>Instance type <SortIcon col="type" /></th>}
                {visibleCols.includes('publicIp') && <th>Public IPv4 address</th>}
                {visibleCols.includes('az') && <th className="cursor-pointer select-none" onClick={() => handleSort('az')}>Availability zone <SortIcon col="az" /></th>}
                {visibleCols.includes('launchTime') && <th className="cursor-pointer select-none" onClick={() => handleSort('launchTime')}>Launch time <SortIcon col="launchTime" /></th>}
              </tr>
            </thead>
            <tbody>
              {instances.map(inst => {
                const colors = STATE_COLORS[inst.state] || STATE_COLORS.running;
                return (
                  <tr key={inst.id} className={selectedIds.includes(inst.id) ? 'bg-blue-50/50' : ''}>
                    <td>
                      <input type="checkbox" checked={selectedIds.includes(inst.id)} onChange={e => {
                        if (e.target.checked) setSelectedIds([...selectedIds, inst.id]);
                        else setSelectedIds(selectedIds.filter(id => id !== inst.id));
                      }} />
                    </td>
                    {visibleCols.includes('name') && <td className="font-medium text-aws-blue cursor-pointer hover:underline">{inst.name}</td>}
                    {visibleCols.includes('id') && <td className="font-mono text-sm text-aws-blue cursor-pointer hover:underline">{inst.id}</td>}
                    {visibleCols.includes('state') && <td>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${colors.text}`}>
                        <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
                        {inst.state}
                      </span>
                    </td>}
                    {visibleCols.includes('type') && <td>{inst.type}</td>}
                    {visibleCols.includes('publicIp') && <td className="font-mono text-sm">{inst.publicIp}</td>}
                    {visibleCols.includes('az') && <td>{inst.az}</td>}
                    {visibleCols.includes('launchTime') && <td>{inst.launchTime ? format(new Date(inst.launchTime), 'MMM d, yyyy h:mm a') : '-'}</td>}
                  </tr>
                );
              })}
              {instances.length === 0 && (
                <tr>
                  <td colSpan={1 + visibleCols.length} className="text-center py-8 text-aws-text-secondary">
                    No instances found.
                    <button className="text-aws-blue hover:underline ml-2" onClick={() => setView('launch')}>Launch instances</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary flex items-center justify-between">
          <span>Showing 1-{instances.length} of {instances.length} items</span>
          <div className="flex items-center gap-2">
            <button className="aws-btn aws-btn-secondary text-xs py-0.5" disabled>Previous</button>
            <span className="px-2">1</span>
            <button className="aws-btn aws-btn-secondary text-xs py-0.5" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedInstance && (
        <div className="aws-card mt-0 border-t-0">
          <div className="flex gap-4 border-b border-aws-border mb-4">
            {['Details', 'Security', 'Networking', 'Storage', 'Tags'].map(tab => (
              <button key={tab} onClick={() => setDetailTab(tab)} className={`pb-2 px-1 text-sm font-medium border-b-2 ${detailTab === tab ? 'border-aws-orange text-aws-orange' : 'border-transparent text-aws-text-secondary hover:text-aws-text'}`}>
                {tab}
              </button>
            ))}
          </div>
          {detailTab === 'Details' && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-aws-text-secondary">Instance ID:</span> <span className="font-mono ml-2">{selectedInstance.id}</span></div>
              <div><span className="text-aws-text-secondary">Public IPv4:</span> <span className="font-mono ml-2">{selectedInstance.publicIp}</span></div>
              <div><span className="text-aws-text-secondary">Private IPv4:</span> <span className="font-mono ml-2">{selectedInstance.privateIp}</span></div>
              <div><span className="text-aws-text-secondary">Instance type:</span> <span className="ml-2">{selectedInstance.type}</span></div>
              <div><span className="text-aws-text-secondary">AMI ID:</span> <span className="font-mono ml-2">{selectedInstance.ami}</span></div>
              <div><span className="text-aws-text-secondary">AMI name:</span> <span className="ml-2">{selectedInstance.amiName}</span></div>
              <div><span className="text-aws-text-secondary">Key pair:</span> <span className="ml-2">{selectedInstance.keyPair}</span></div>
              <div><span className="text-aws-text-secondary">Launch time:</span> <span className="ml-2">{selectedInstance.launchTime ? format(new Date(selectedInstance.launchTime), 'MMM d, yyyy h:mm a') : '-'}</span></div>
              <div><span className="text-aws-text-secondary">VPC ID:</span> <span className="font-mono ml-2">{selectedInstance.vpcId}</span></div>
              <div><span className="text-aws-text-secondary">Subnet ID:</span> <span className="font-mono ml-2">{selectedInstance.subnetId}</span></div>
              <div><span className="text-aws-text-secondary">Platform:</span> <span className="ml-2">{selectedInstance.platform}</span></div>
              <div><span className="text-aws-text-secondary">Monitoring:</span> <span className="ml-2">{selectedInstance.monitoring}</span></div>
            </div>
          )}
          {detailTab === 'Security' && (
            <div className="text-sm"><span className="text-aws-text-secondary">Security Groups:</span> <span className="ml-2">{selectedInstance.securityGroups?.join(', ')}</span></div>
          )}
          {detailTab === 'Networking' && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-aws-text-secondary">VPC ID:</span> <span className="font-mono ml-2">{selectedInstance.vpcId}</span></div>
              <div><span className="text-aws-text-secondary">Subnet ID:</span> <span className="font-mono ml-2">{selectedInstance.subnetId}</span></div>
              <div><span className="text-aws-text-secondary">Public IP:</span> <span className="font-mono ml-2">{selectedInstance.publicIp}</span></div>
              <div><span className="text-aws-text-secondary">Private IP:</span> <span className="font-mono ml-2">{selectedInstance.privateIp}</span></div>
              <div><span className="text-aws-text-secondary">Availability Zone:</span> <span className="ml-2">{selectedInstance.az}</span></div>
            </div>
          )}
          {detailTab === 'Storage' && (
            <div className="text-sm text-aws-text-secondary">Root device: /dev/xvda (8 GiB, gp3)</div>
          )}
          {detailTab === 'Tags' && (
            <table className="aws-table">
              <thead><tr><th>Key</th><th>Value</th></tr></thead>
              <tbody>
                {(selectedInstance.tags || []).map((t, i) => (
                  <tr key={i}><td>{t.Key}</td><td>{t.Value}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
