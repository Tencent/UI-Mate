import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, X } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  creating: 'bg-blue-100 text-blue-800',
  deleting: 'bg-orange-100 text-orange-800',
};

export default function RDSSnapshots() {
  const { state, dispatch, addFlash } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [dbInstance, setDbInstance] = useState('');
  const [snapshotId, setSnapshotId] = useState('');

  const snapshots = state.rdsSnapshots || [];
  const databases = state.rds || [];

  const handleCreate = () => {
    if (!snapshotId.trim() || !dbInstance) return;
    const db = databases.find(d => d.id === dbInstance);
    const snapshot = {
      id: snapshotId.trim(),
      dbInstance: dbInstance,
      engine: db?.engine || 'mysql',
      engineVersion: db?.engineVersion || '8.0',
      status: 'creating',
      type: 'manual',
      created: new Date().toISOString(),
      size: db?.storage || 20,
      encrypted: false,
    };
    dispatch({ type: 'CREATE_RDS_SNAPSHOT', payload: snapshot });
    addFlash('success', `Snapshot "${snapshotId}" is being created...`);
    setTimeout(() => {
      dispatch({ type: 'UPDATE_RDS_SNAPSHOT_STATUS', payload: { id: snapshotId.trim(), status: 'available' } });
    }, 3000);
    setShowCreate(false);
    setSnapshotId(''); setDbInstance('');
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Snapshots ({snapshots.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Take snapshot</button>
          </div>
        </div>
        <table className="aws-table">
          <thead><tr><th>Snapshot ID</th><th>DB instance</th><th>Engine</th><th>Status</th><th>Type</th><th>Created</th><th>Size</th><th>Encrypted</th><th>Actions</th></tr></thead>
          <tbody>
            {snapshots.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-aws-text-secondary">No snapshots</td></tr>
            ) : snapshots.map(s => (
              <tr key={s.id}>
                <td className="text-aws-blue font-medium">{s.id}</td>
                <td>{s.dbInstance}</td>
                <td>{s.engine}</td>
                <td><span className={`aws-badge ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-800'}`}>{s.status}</span></td>
                <td><span className={`aws-badge ${s.type === 'automated' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>{s.type}</span></td>
                <td>{format(new Date(s.created), 'MMM d, yyyy h:mm a')}</td>
                <td>{s.size} GiB</td>
                <td>{s.encrypted ? 'Yes' : 'No'}</td>
                <td><button className="text-aws-error text-xs hover:underline" onClick={() => { dispatch({ type: 'DELETE_RDS_SNAPSHOT', payload: s.id }); addFlash('success', `Snapshot "${s.id}" deleted`); }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-md border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Take DB snapshot</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">DB instance *</label>
                <select className="aws-input" value={dbInstance} onChange={e => setDbInstance(e.target.value)}>
                  <option value="">Select a DB instance</option>
                  {databases.map(db => <option key={db.id} value={db.id}>{db.id} ({db.engine})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Snapshot identifier *</label>
                <input className="aws-input" value={snapshotId} onChange={e => setSnapshotId(e.target.value)} placeholder="my-snapshot" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!snapshotId.trim() || !dbInstance}>Take snapshot</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
