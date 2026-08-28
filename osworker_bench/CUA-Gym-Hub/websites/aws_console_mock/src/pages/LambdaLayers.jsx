import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, X } from 'lucide-react';
import { format } from 'date-fns';

const RUNTIMES = ['nodejs18.x', 'nodejs20.x', 'python3.12', 'python3.11', 'java17', 'java21', 'go1.x', 'dotnet8'];

export default function LambdaLayers() {
  const { state, dispatch, addFlash } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [runtime, setRuntime] = useState('nodejs18.x');
  const [description, setDescription] = useState('');

  const layers = state.lambdaLayers || [];

  const handleCreate = () => {
    if (!name.trim()) return;
    const layer = {
      name: name.trim(),
      version: 1,
      runtime,
      description: description.trim(),
      size: Math.floor(Math.random() * 5000000) + 100000,
      created: new Date().toISOString(),
      arn: `arn:aws:lambda:${state.user?.region || 'us-east-1'}:123456789012:layer:${name.trim()}:1`
    };
    dispatch({ type: 'CREATE_LAMBDA_LAYER', payload: layer });
    addFlash('success', `Layer "${name}" created successfully`);
    setShowCreate(false);
    setName(''); setDescription(''); setRuntime('nodejs18.x');
  };

  const formatSize = (bytes) => {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Layers ({layers.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create layer</button>
          </div>
        </div>
        <table className="aws-table">
          <thead><tr><th>Name</th><th>Version</th><th>Runtime</th><th>Description</th><th>Size</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {layers.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-aws-text-secondary">No layers</td></tr>
            ) : layers.map(l => (
              <tr key={l.name + l.version}>
                <td className="text-aws-blue font-medium">{l.name}</td>
                <td>{l.version}</td>
                <td><span className="aws-badge bg-green-100 text-green-800">{l.runtime}</span></td>
                <td className="text-xs text-aws-text-secondary max-w-xs truncate">{l.description || '-'}</td>
                <td>{formatSize(l.size)}</td>
                <td>{format(new Date(l.created), 'MMM d, yyyy')}</td>
                <td><button className="text-aws-error text-xs hover:underline" onClick={() => { dispatch({ type: 'DELETE_LAMBDA_LAYER', payload: l.name }); addFlash('success', `Layer "${l.name}" deleted`); }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-md border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create layer</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name *</label>
                <input className="aws-input" value={name} onChange={e => setName(e.target.value)} placeholder="my-layer" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Compatible runtime</label>
                <select className="aws-input" value={runtime} onChange={e => setRuntime(e.target.value)}>
                  {RUNTIMES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <input className="aws-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Layer description" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!name.trim()}>Create layer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
