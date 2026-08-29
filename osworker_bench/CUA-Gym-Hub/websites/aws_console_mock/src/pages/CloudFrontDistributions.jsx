import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Search, X } from 'lucide-react';
import { format } from 'date-fns';

export default function CloudFrontDistributions() {
  const { state, dispatch, addFlash } = useStore();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDist, setSelectedDist] = useState(null);
  const [detailTab, setDetailTab] = useState('General');
  const [originDomain, setOriginDomain] = useState('');
  const [originId, setOriginId] = useState('');
  const [viewerPolicy, setViewerPolicy] = useState('redirect-to-https');

  const distributions = (state.cloudfront?.distributions || []).filter(d => !search || d.id.toLowerCase().includes(search.toLowerCase()) || d.domainName.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    if (!originDomain.trim()) return;
    const id = 'E' + Math.random().toString(36).substr(2, 13).toUpperCase();
    const newDist = {
      id,
      domainName: `${id.toLowerCase()}.cloudfront.net`,
      status: 'Deployed',
      state: 'Enabled',
      origins: [{ domainName: originDomain.trim(), id: originId.trim() || 'S3-origin' }],
      priceClass: 'PriceClass_All',
      alternateNames: [],
      viewerProtocolPolicy: viewerPolicy,
      lastModified: new Date().toISOString()
    };
    dispatch({ type: 'CREATE_DISTRIBUTION', payload: newDist });
    addFlash('success', `Distribution ${id} created successfully`);
    setShowCreate(false);
    setOriginDomain(''); setOriginId('');
  };

  if (showCreate) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-xl font-bold">Create distribution</h1>
        <div className="aws-card space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Origin domain name *</label>
            <input className="aws-input max-w-md" value={originDomain} onChange={e => setOriginDomain(e.target.value)} placeholder="mybucket.s3.amazonaws.com" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Origin ID</label>
            <input className="aws-input max-w-md" value={originId} onChange={e => setOriginId(e.target.value)} placeholder="S3-origin" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Viewer protocol policy</label>
            <select className="aws-input max-w-md" value={viewerPolicy} onChange={e => setViewerPolicy(e.target.value)}>
              <option value="allow-all">HTTP and HTTPS</option>
              <option value="redirect-to-https">Redirect HTTP to HTTPS</option>
              <option value="https-only">HTTPS Only</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="aws-btn aws-btn-primary" onClick={handleCreate} disabled={!originDomain.trim()}>Create distribution</button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedDist) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button className="text-aws-blue hover:underline text-sm" onClick={() => setSelectedDist(null)}>Distributions</button>
          <span className="text-aws-text-secondary">/</span>
          <h1 className="text-xl font-bold">{selectedDist.id}</h1>
        </div>
        <div className="flex gap-2">
          <button className="aws-btn aws-btn-danger text-xs" onClick={() => { dispatch({ type: 'DELETE_DISTRIBUTION', payload: selectedDist.id }); addFlash('success', 'Distribution deleted'); setSelectedDist(null); }}>Delete</button>
        </div>
        <div className="flex gap-4 border-b border-aws-border">
          {['General', 'Origins', 'Behaviors', 'Error Pages'].map(t => (
            <button key={t} onClick={() => setDetailTab(t)} className={`pb-3 px-1 text-sm font-medium border-b-2 ${detailTab === t ? 'border-aws-blue text-aws-blue' : 'border-transparent text-aws-text-secondary'}`}>{t}</button>
          ))}
        </div>
        {detailTab === 'General' && (
          <div className="aws-card grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-bold block">Distribution ID</span>{selectedDist.id}</div>
            <div><span className="font-bold block">Domain name</span><span className="font-mono text-xs">{selectedDist.domainName}</span></div>
            <div><span className="font-bold block">Status</span><span className="aws-badge bg-green-100 text-green-800">{selectedDist.status}</span></div>
            <div><span className="font-bold block">State</span><span className={`aws-badge ${selectedDist.state === 'Enabled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedDist.state}</span></div>
            <div><span className="font-bold block">Price class</span>{selectedDist.priceClass}</div>
            <div><span className="font-bold block">Last modified</span>{format(new Date(selectedDist.lastModified), 'MMM d, yyyy h:mm a')}</div>
            <div><span className="font-bold block">Alternate domain names</span>{selectedDist.alternateNames?.length > 0 ? selectedDist.alternateNames.join(', ') : '-'}</div>
          </div>
        )}
        {detailTab === 'Origins' && (
          <div className="aws-card p-0">
            <table className="aws-table">
              <thead><tr><th>Origin ID</th><th>Domain name</th></tr></thead>
              <tbody>
                {(selectedDist.origins || []).map((o, i) => (
                  <tr key={i}><td>{o.id}</td><td className="font-mono text-xs">{o.domainName}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {detailTab === 'Behaviors' && (
          <div className="aws-card text-sm">
            <div className="py-2"><span className="font-bold">Path pattern:</span> Default (*)</div>
            <div className="py-2"><span className="font-bold">Viewer protocol policy:</span> {selectedDist.viewerProtocolPolicy || 'redirect-to-https'}</div>
            <div className="py-2"><span className="font-bold">Cache policy:</span> CachingOptimized</div>
          </div>
        )}
        {detailTab === 'Error Pages' && (
          <div className="aws-card text-center text-aws-text-secondary py-8">No custom error responses configured</div>
        )}
      </div>
    );
  }

  return (
    <div className="aws-card p-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
        <h2 className="font-bold text-lg">Distributions ({distributions.length})</h2>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
          <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create distribution</button>
        </div>
      </div>
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="aws-input pl-8" placeholder="Filter distributions" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <table className="aws-table">
        <thead><tr><th>ID</th><th>Domain name</th><th>Status</th><th>State</th><th>Origins</th><th>Price class</th><th>Alternate names</th><th>Last modified</th></tr></thead>
        <tbody>
          {distributions.map(d => (
            <tr key={d.id}>
              <td><button className="text-aws-blue font-medium hover:underline" onClick={() => setSelectedDist(d)}>{d.id}</button></td>
              <td className="font-mono text-xs">{d.domainName}</td>
              <td><span className="aws-badge bg-green-100 text-green-800">{d.status}</span></td>
              <td><span className={`aws-badge ${d.state === 'Enabled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{d.state}</span></td>
              <td>{d.origins?.length || 0}</td>
              <td className="text-xs">{d.priceClass}</td>
              <td className="text-xs">{d.alternateNames?.join(', ') || '-'}</td>
              <td>{format(new Date(d.lastModified), 'MMM d, yyyy')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
