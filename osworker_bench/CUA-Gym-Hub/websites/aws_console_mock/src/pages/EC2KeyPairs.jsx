import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X, ChevronDown, Copy } from 'lucide-react';
import { format } from 'date-fns';

export default function EC2KeyPairs() {
  const { state, dispatch, addFlash } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [name, setName] = useState('');
  const [keyType, setKeyType] = useState('RSA');
  const [keyFormat, setKeyFormat] = useState('.pem');

  const kps = (state.keyPairs || []).filter(kp =>
    !search || kp.name.toLowerCase().includes(search.toLowerCase()) || kp.id.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (name) => setSelected(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  const toggleAll = () => setSelected(selected.length === kps.length ? [] : kps.map(kp => kp.name));

  const downloadPrivateKey = (keyPair, format = keyFormat) => {
    if (!keyPair) return;
    const extension = format.replace('.', '');
    const body = extension === 'ppk'
      ? [
          'PuTTY-User-Key-File-3: ssh-rsa',
          `Comment: ${keyPair.name}`,
          'Public-Lines: 1',
          keyPair.fingerprint.replaceAll(':', ''),
          'Private-Lines: 1',
          `mock-private-key-${keyPair.id}`,
          'Private-MAC: mock-local-sandbox',
        ].join('\n')
      : [
          '-----BEGIN RSA PRIVATE KEY-----',
          btoa(`mock-private-key:${keyPair.name}:${keyPair.id}`).match(/.{1,64}/g).join('\n'),
          '-----END RSA PRIVATE KEY-----',
        ].join('\n');
    const blob = new Blob([body], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${keyPair.name}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const newKp = {
      name: name.trim(),
      id: `key-${Math.random().toString(16).substr(2, 16)}`,
      type: keyType,
      fingerprint: Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'),
      created: new Date().toISOString()
    };
    dispatch({ type: 'CREATE_KEY_PAIR', payload: newKp });
    downloadPrivateKey(newKp);
    addFlash('success', `Key pair "${name}" created. The private key file (${keyFormat}) has been downloaded.`);
    setShowCreate(false);
    setName('');
  };

  const handleDelete = () => {
    if (!selected.length) return;
    selected.forEach(name => dispatch({ type: 'DELETE_KEY_PAIR', payload: name }));
    addFlash('success', `${selected.length} key pair(s) deleted.`);
    setSelected([]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
    addFlash('info', `Copied: ${text}`);
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Key Pairs ({state.keyPairs.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <div className="relative">
              <button className="aws-btn aws-btn-secondary text-xs flex items-center gap-1" disabled={!selected.length} onClick={() => setActionsOpen(!actionsOpen)}>
                Actions <ChevronDown size={12} />
              </button>
              {actionsOpen && selected.length > 0 && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-aws-border shadow-lg z-20" style={{ borderRadius: 8 }}>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={() => {
                    const kp = state.keyPairs.find(item => item.name === selected[0]);
                    downloadPrivateKey(kp);
                    addFlash('success', `Private key downloaded for ${selected[0]}`);
                    setActionsOpen(false);
                  }}>Download private key</button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={() => { addFlash('info', `Copied key fingerprint`); setActionsOpen(false); }}>Copy fingerprint</button>
                </div>
              )}
            </div>
            <button className="aws-btn aws-btn-secondary text-xs text-red-600" disabled={!selected.length} onClick={handleDelete}>Delete</button>
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create key pair</button>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="aws-input pl-8" placeholder="Filter key pairs" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <table className="aws-table">
          <thead>
            <tr>
              <th className="w-8"><input type="checkbox" checked={selected.length === kps.length && kps.length > 0} onChange={toggleAll} /></th>
              <th>Key pair name</th>
              <th>Key pair ID</th>
              <th>Type</th>
              <th>Fingerprint</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {kps.map(kp => (
              <tr key={kp.name} className={selected.includes(kp.name) ? 'bg-blue-50/50' : ''}>
                <td><input type="checkbox" checked={selected.includes(kp.name)} onChange={() => toggleSelect(kp.name)} /></td>
                <td className="text-aws-blue font-medium">{kp.name}</td>
                <td>
                  <span className="font-mono text-sm">{kp.id}</span>
                  <button className="ml-1 text-gray-400 hover:text-gray-600" onClick={() => copyToClipboard(kp.id)}><Copy size={12} /></button>
                </td>
                <td>{kp.type}</td>
                <td className="font-mono text-xs text-aws-text-secondary max-w-xs truncate">{kp.fingerprint}</td>
                <td>{format(new Date(kp.created), 'MMM d, yyyy h:mm a')}</td>
              </tr>
            ))}
            {kps.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-aws-text-secondary">No key pairs found</td></tr>}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary">
          Showing 1-{kps.length} of {kps.length} items
        </div>
      </div>

      {showCreate && (
        <div className="aws-modal-overlay">
          <div className="aws-modal max-w-md">
            <div className="aws-modal-header">
              <h3 className="font-bold text-lg">Create key pair</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="aws-modal-body space-y-4">
              <div>
                <label className="aws-form-label">Name <span className="text-red-500">*</span></label>
                <input className="aws-input mt-1" value={name} onChange={e => setName(e.target.value)} placeholder="my-key-pair" />
              </div>
              <div>
                <label className="aws-form-label">Key pair type</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 text-sm border border-aws-border rounded px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <input type="radio" checked={keyType === 'RSA'} onChange={() => setKeyType('RSA')} /> RSA
                  </label>
                  <label className="flex items-center gap-2 text-sm border border-aws-border rounded px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <input type="radio" checked={keyType === 'ED25519'} onChange={() => setKeyType('ED25519')} /> ED25519
                  </label>
                </div>
              </div>
              <div>
                <label className="aws-form-label">Private key file format</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 text-sm border border-aws-border rounded px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <input type="radio" checked={keyFormat === '.pem'} onChange={() => setKeyFormat('.pem')} /> .pem
                    <span className="text-xs text-aws-text-secondary">(OpenSSH)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm border border-aws-border rounded px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <input type="radio" checked={keyFormat === '.ppk'} onChange={() => setKeyFormat('.ppk')} /> .ppk
                    <span className="text-xs text-aws-text-secondary">(PuTTY)</span>
                  </label>
                </div>
              </div>
              <div className="aws-alert aws-alert-info text-xs">
                <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <span>You can use a key pair to securely connect to your instance. Ensure that you save the private key file in a safe place.</span>
              </div>
            </div>
            <div className="aws-modal-footer">
              <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!name.trim()}>Create key pair</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
