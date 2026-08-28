import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Database } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const STATUS_COLORS = {
  available: 'bg-green-50 text-green-800',
  creating: 'bg-blue-50 text-blue-800',
  deleting: 'bg-orange-50 text-orange-800',
  stopped: 'bg-red-50 text-red-800',
  stopping: 'bg-yellow-50 text-yellow-800',
  starting: 'bg-blue-50 text-blue-800',
};

const ENGINES = [
  { id: 'mysql', name: 'MySQL', version: '8.0.35' },
  { id: 'postgres', name: 'PostgreSQL', version: '15.4' },
  { id: 'mariadb', name: 'MariaDB', version: '10.11.6' },
  { id: 'aurora-mysql', name: 'Amazon Aurora (MySQL)', version: '3.04.1' },
];

export default function RDS() {
  const { state, dispatch, addFlash } = useStore();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [engine, setEngine] = useState('mysql');
  const [template, setTemplate] = useState('free');
  const [dbId, setDbId] = useState('');
  const [masterUser, setMasterUser] = useState('admin');
  const [masterPass, setMasterPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [formError, setFormError] = useState('');
  const [dbClass, setDbClass] = useState('db.t3.micro');
  const [storageSize, setStorageSize] = useState(20);
  const [storageType, setStorageType] = useState('gp3');

  const handleCreate = () => {
    if (!dbId.trim()) return;
    if (masterPass !== confirmPass) {
      setFormError('Master password and confirmation must match.');
      return;
    }
    const eng = ENGINES.find(e => e.id === engine) || ENGINES[0];
    const newDb = {
      id: dbId.trim(),
      engine: eng.id,
      engineVersion: eng.version,
      class: dbClass,
      status: 'creating',
      role: 'Instance',
      endpoint: `${dbId.trim()}.cxyz1234abcd.${state.user.region}.rds.amazonaws.com`,
      port: eng.id === 'postgres' ? 5432 : 3306,
      az: `${state.user.region}a`,
      multiAZ: false,
      storage: storageSize,
      storageType,
      vpcId: 'vpc-0abc1234def56789',
      created: new Date().toISOString(),
      tags: []
    };
    dispatch({ type: 'CREATE_DB', payload: newDb });
    addFlash('success', `Database ${dbId} is being created...`);
    setTimeout(() => {
      dispatch({ type: 'UPDATE_DB_STATUS', payload: { id: dbId.trim(), status: 'available' } });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { title: 'Database available', message: `${dbId} is now available`, type: 'success', service: 'RDS' } });
    }, 5000);
    setShowCreate(false);
    setDbId('');
    setMasterPass('');
    setConfirmPass('');
    setFormError('');
  };

  const handleAction = (action) => {
    selectedIds.forEach(id => {
      const db = state.rds.find(d => d.id === id);
      if (!db) return;
      if (action === 'stop' && db.status === 'available') {
        dispatch({ type: 'UPDATE_DB_STATUS', payload: { id, status: 'stopping' } });
        setTimeout(() => dispatch({ type: 'UPDATE_DB_STATUS', payload: { id, status: 'stopped' } }), 3000);
      } else if (action === 'start' && db.status === 'stopped') {
        dispatch({ type: 'UPDATE_DB_STATUS', payload: { id, status: 'starting' } });
        setTimeout(() => {
          dispatch({ type: 'UPDATE_DB_STATUS', payload: { id, status: 'available' } });
          dispatch({ type: 'ADD_NOTIFICATION', payload: { title: 'Database started', message: `${id} is now available`, type: 'success', service: 'RDS' } });
        }, 4000);
      } else if (action === 'delete') {
        dispatch({ type: 'UPDATE_DB_STATUS', payload: { id, status: 'deleting' } });
        setTimeout(() => {
          dispatch({ type: 'DELETE_DB', payload: id });
          dispatch({ type: 'ADD_NOTIFICATION', payload: { title: 'Database deleted', message: `${id} has been deleted`, type: 'info', service: 'RDS' } });
        }, 4000);
      }
    });
    setSelectedIds([]);
  };

  if (showCreate) {
    return (
      <div className="max-w-3xl space-y-6">
        <h1 className="text-xl font-bold">Create database</h1>
        {/* Engine */}
        <div className="aws-card">
          <h3 className="font-bold text-sm mb-3">Engine type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ENGINES.map(e => (
              <button key={e.id} onClick={() => setEngine(e.id)} className={`p-3 border text-left ${engine === e.id ? 'border-aws-orange bg-orange-50' : 'border-aws-border hover:bg-gray-50'}`}>
                <div className="font-bold text-sm">{e.name}</div>
                <div className="text-xs text-aws-text-secondary mt-1">v{e.version}</div>
              </button>
            ))}
          </div>
        </div>
        {/* Template */}
        <div className="aws-card">
          <h3 className="font-bold text-sm mb-3">Templates</h3>
          <div className="flex gap-4">
            {['Production', 'Dev/Test', 'Free tier'].map(t => {
              const val = t.toLowerCase().replace(/\s+/g, '-').replace('/', '-');
              return (
                <label key={t} className={`flex items-center gap-2 p-3 border text-sm ${template === val ? 'border-aws-orange bg-orange-50' : 'border-aws-border'}`}>
                  <input type="radio" checked={template === val} onChange={() => { setTemplate(val); if (val === 'free-tier') { setDbClass('db.t3.micro'); setStorageSize(20); } }} /> {t}
                </label>
              );
            })}
          </div>
        </div>
        {/* Settings */}
        <div className="aws-card space-y-4">
          <h3 className="font-bold text-sm">Settings</h3>
          <div>
            <label className="block text-sm font-bold mb-1">DB instance identifier *</label>
            <input className="aws-input max-w-md" value={dbId} onChange={e => setDbId(e.target.value)} placeholder="my-database" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Master username</label>
            <input className="aws-input max-w-md" value={masterUser} onChange={e => setMasterUser(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Master password</label>
            <div className="relative max-w-md">
              <input type={showPass ? 'text' : 'password'} className="aws-input pr-16" value={masterPass} onChange={e => setMasterPass(e.target.value)} />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-aws-blue" onClick={() => setShowPass(!showPass)}>{showPass ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Confirm password</label>
            <input
              type={showPass ? 'text' : 'password'}
              className="aws-input max-w-md"
              value={confirmPass}
              onChange={e => { setConfirmPass(e.target.value); setFormError(''); }}
            />
          </div>
          {formError && <div className="text-sm text-aws-error">{formError}</div>}
        </div>
        {/* Instance */}
        <div className="aws-card space-y-4">
          <h3 className="font-bold text-sm">Instance configuration</h3>
          <select className="aws-input max-w-md" value={dbClass} onChange={e => setDbClass(e.target.value)}>
            {['db.t3.micro', 'db.t3.small', 'db.t3.medium', 'db.r6g.large', 'db.r6g.xlarge'].map(c => (
              <option key={c} value={c}>{c} {c === 'db.t3.micro' ? '(Free tier eligible)' : ''}</option>
            ))}
          </select>
        </div>
        {/* Storage */}
        <div className="aws-card space-y-4">
          <h3 className="font-bold text-sm">Storage</h3>
          <div className="flex items-center gap-3">
            <select className="aws-input w-32" value={storageType} onChange={e => setStorageType(e.target.value)}>
              <option value="gp2">gp2</option><option value="gp3">gp3</option><option value="io1">io1</option>
            </select>
            <input type="number" className="aws-input w-24" value={storageSize} onChange={e => setStorageSize(Number(e.target.value))} min={20} />
            <span className="text-sm">GiB</span>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
          <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!dbId.trim() || masterPass !== confirmPass}>Create database</button>
        </div>
      </div>
    );
  }

  const selectedDb = selectedIds.length === 1 ? state.rds.find(d => d.id === selectedIds[0]) : null;

  return (
    <div className="aws-card p-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
        <h2 className="font-bold text-lg">Databases ({state.rds.length})</h2>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100"><RefreshCw size={16} className="text-aws-text-secondary" /></button>
          <button className="aws-btn aws-btn-primary text-xs" onClick={() => setShowCreate(true)}>Create database</button>
        </div>
      </div>
      {selectedIds.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex gap-2">
          <button className="aws-btn aws-btn-secondary text-xs" onClick={() => selectedDb && navigate(`/rds/${selectedDb.id}`)}>Modify</button>
          {selectedDb?.status === 'available' && <button className="aws-btn aws-btn-secondary text-xs" onClick={() => handleAction('stop')}>Stop</button>}
          {selectedDb?.status === 'stopped' && <button className="aws-btn aws-btn-secondary text-xs" onClick={() => handleAction('start')}>Start</button>}
          <button className="aws-btn aws-btn-danger text-xs" onClick={() => handleAction('delete')}>Delete</button>
        </div>
      )}
      <table className="aws-table">
        <thead><tr><th className="w-8"><input type="checkbox" /></th><th>DB identifier</th><th>Engine</th><th>Status</th><th>Role</th><th>Size</th><th>Region</th><th>Multi-AZ</th></tr></thead>
        <tbody>
          {state.rds.map(db => (
            <tr key={db.id} className={selectedIds.includes(db.id) ? 'bg-blue-50/50' : ''}>
              <td><input type="checkbox" checked={selectedIds.includes(db.id)} onChange={e => {
                if (e.target.checked) setSelectedIds([...selectedIds, db.id]);
                else setSelectedIds(selectedIds.filter(i => i !== db.id));
              }} /></td>
              <td><Link to={`/rds/${db.id}`} className="text-aws-blue font-medium hover:underline">{db.id}</Link></td>
              <td>{db.engine}</td>
              <td><span className={`aws-badge ${STATUS_COLORS[db.status] || 'bg-gray-100 text-gray-800'}`}>{db.status}</span></td>
              <td>{db.role}</td>
              <td>{db.class}</td>
              <td>{db.az?.split('-').slice(0, -1).join('-') || state.user.region}</td>
              <td>{db.multiAZ ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">
        Showing 1-{state.rds.length} of {state.rds.length} items
      </div>
    </div>
  );
}
