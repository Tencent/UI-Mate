import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, X } from 'lucide-react';
import { format } from 'date-fns';

export default function IAMIdentityProviders() {
  const { state, dispatch, addFlash } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [providerUrl, setProviderUrl] = useState('');
  const [thumbprint, setThumbprint] = useState('');

  const providers = state.iam?.identityProviders || [];

  const handleCreate = () => {
    if (!providerUrl.trim()) return;
    const provider = {
      name: providerUrl.trim().replace(/^https?:\/\//, '').split('/')[0],
      type: 'OpenID Connect',
      arn: `arn:aws:iam::123456789012:oidc-provider/${providerUrl.trim().replace(/^https?:\/\//, '')}`,
      url: providerUrl.trim(),
      thumbprints: thumbprint.trim() ? [thumbprint.trim()] : [],
      created: new Date().toISOString()
    };
    dispatch({ type: 'CREATE_IDENTITY_PROVIDER', payload: provider });
    addFlash('success', `Identity provider "${provider.name}" created`);
    setShowCreate(false);
    setProviderUrl(''); setThumbprint('');
  };

  return (
    <div>
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-lg">Identity providers ({providers.length})</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Add provider</button>
          </div>
        </div>
        <table className="aws-table">
          <thead><tr><th>Provider name</th><th>Type</th><th>ARN</th><th>Thumbprints</th><th>Created</th></tr></thead>
          <tbody>
            {providers.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-aws-text-secondary">No identity providers configured</td></tr>
            ) : providers.map(p => (
              <tr key={p.arn || p.name}>
                <td className="text-aws-blue font-medium">{p.name}</td>
                <td>{p.type}</td>
                <td className="font-mono text-xs">{p.arn}</td>
                <td>{(p.thumbprints || []).length}</td>
                <td>{p.created ? format(new Date(p.created), 'MMM d, yyyy') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-md border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Add identity provider</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Provider URL *</label>
                <input className="aws-input" value={providerUrl} onChange={e => setProviderUrl(e.target.value)} placeholder="https://accounts.google.com" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Thumbprint</label>
                <input className="aws-input" value={thumbprint} onChange={e => setThumbprint(e.target.value)} placeholder="6938fd4d98bab03faadb97b34396831e3780aea1" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!providerUrl.trim()}>Add provider</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
