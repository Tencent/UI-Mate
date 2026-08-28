import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Folder, RefreshCw, Search, X, Copy, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getSessionId } from '../store/dataManager';

export default function S3Buckets() {
  const { state, dispatch, addFlash } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedBuckets, setSelectedBuckets] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const buckets = state.s3.filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(buckets.length / PAGE_SIZE));
  const pagedBuckets = buckets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    dispatch({
      type: 'CREATE_BUCKET',
      payload: {
        name: newName.trim(),
        region: state.user.region,
        created: new Date().toISOString(),
        access: 'Bucket and objects not public',
        versioning: 'Disabled',
        encryption: 'SSE-S3',
        objects: []
      }
    });
    addFlash('success', `Successfully created bucket "${newName.trim()}"`);
    setNewName('');
    setShowCreate(false);
  };

  const handleDelete = () => {
    selectedBuckets.forEach(name => dispatch({ type: 'DELETE_BUCKET', payload: name }));
    addFlash('success', `Deleted ${selectedBuckets.length} bucket(s)`);
    setSelectedBuckets([]);
  };

  const handleEmpty = () => {
    selectedBuckets.forEach(name => dispatch({ type: 'EMPTY_BUCKET', payload: name }));
    addFlash('success', `Emptied ${selectedBuckets.length} bucket(s)`);
    setSelectedBuckets([]);
  };

  const openBucket = (name) => {
    const sid = getSessionId();
    navigate(sid ? `/s3/${name}?sid=${encodeURIComponent(sid)}` : `/s3/${name}`);
  };

  const tabs = [
    { id: 'general', label: 'General purpose buckets' },
    { id: 'all', label: 'All AWS Regions' },
    { id: 'directory', label: 'Directory buckets' },
  ];

  return (
    <div>
      {/* Page header */}
      <h1 className="text-xl font-bold mb-4">Buckets</h1>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-aws-border mb-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-aws-blue text-aws-blue'
                : 'border-transparent text-aws-text-secondary hover:text-aws-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="aws-card p-0 mt-0" style={{ borderRadius: '0 0 16px 16px', borderTop: 'none' }}>
        {/* Subheader */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-sm">
            General purpose buckets ({state.s3.length}) <span className="text-aws-blue text-xs font-normal ml-1 cursor-pointer hover:underline">Info</span>
          </h2>
          <div className="flex items-center gap-2">
            {selectedBuckets.length > 0 && (
              <>
                <button className="aws-btn aws-btn-secondary text-xs" onClick={() => addFlash('info', 'ARN copied to clipboard')}>
                  <Copy size={12} className="mr-1" /> Copy ARN
                </button>
                <button className="aws-btn aws-btn-secondary text-xs" onClick={handleEmpty}>Empty</button>
                <button className="aws-btn aws-btn-secondary text-xs" onClick={handleDelete}>Delete</button>
              </>
            )}
            <button className="aws-btn aws-btn-call-to-action text-xs" onClick={() => setShowCreate(true)}>Create bucket</button>
          </div>
        </div>

        {/* Description + Search */}
        <div className="px-4 py-2 border-b border-gray-100 text-sm text-aws-text-secondary">
          Buckets are containers for data stored in S3.
        </div>
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input className="aws-input pl-8" placeholder="Find buckets by name" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded" title="Preferences">
            <Settings size={16} className="text-aws-text-secondary" />
          </button>
        </div>

        {/* Table */}
        <table className="aws-table">
          <thead>
            <tr>
              <th className="w-8"><input type="checkbox" onChange={e => setSelectedBuckets(e.target.checked ? buckets.map(b => b.name) : [])} /></th>
              <th>
                <span className="flex items-center gap-1">
                  Name
                  <svg width="10" height="10" viewBox="0 0 10 10" className="text-aws-text-secondary"><path d="M2 4 L5 7 L8 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </span>
              </th>
              <th>
                <span className="flex items-center gap-1">
                  AWS Region
                  <svg width="10" height="10" viewBox="0 0 10 10" className="text-aws-text-secondary"><path d="M2 4 L5 7 L8 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </span>
              </th>
              <th>
                <span className="flex items-center gap-1">
                  Creation date
                  <svg width="10" height="10" viewBox="0 0 10 10" className="text-aws-text-secondary"><path d="M2 4 L5 7 L8 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </span>
              </th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            {pagedBuckets.map(bucket => (
              <tr key={bucket.name} className={selectedBuckets.includes(bucket.name) ? 'bg-blue-50/50' : ''}>
                <td><input type="checkbox" checked={selectedBuckets.includes(bucket.name)} onChange={e => {
                  if (e.target.checked) setSelectedBuckets([...selectedBuckets, bucket.name]);
                  else setSelectedBuckets(selectedBuckets.filter(n => n !== bucket.name));
                }} /></td>
                <td>
                  <button type="button" onClick={() => openBucket(bucket.name)} className="text-aws-blue font-medium hover:underline">
                    {bucket.name}
                  </button>
                </td>
                <td>{bucket.region}</td>
                <td>{format(new Date(bucket.created), 'MMMM d, yyyy, HH:mm:ss')} (UTC+08:00)</td>
                <td className="text-aws-text-secondary text-xs">{bucket.access}</td>
              </tr>
            ))}
            {buckets.length === 0 && (
              <tr><td colSpan="5" className="text-center py-8 text-aws-text-secondary">No buckets found.</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-aws-text-secondary flex items-center justify-between">
          <span>Showing {buckets.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, buckets.length)} of {buckets.length} items</span>
          <div className="flex items-center gap-2">
            <button className="px-2 py-0.5 text-xs border border-aws-border rounded hover:bg-gray-50" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>&lt;</button>
            <span className="text-xs">{page} of {totalPages}</span>
            <button className="px-2 py-0.5 text-xs border border-aws-border rounded hover:bg-gray-50" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>&gt;</button>
          </div>
        </div>
      </div>

      {/* Account snapshot sidebar removed - layout is full-width table */}

      {showCreate && (
        <div className="aws-modal-overlay">
          <div className="aws-modal max-w-lg">
            <div className="aws-modal-header">
              <h3 className="font-bold text-lg">Create bucket</h3>
              <button onClick={() => setShowCreate(false)} className="text-aws-text-secondary hover:text-aws-text"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="aws-modal-body space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Bucket name</label>
                <input className="aws-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="my-new-bucket" required pattern="[a-z0-9.-]+" />
                <p className="text-xs text-aws-text-disabled mt-1">Must be globally unique, lowercase, no spaces.</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">AWS Region</label>
                <select className="aws-input" defaultValue={state.user.region}>
                  <option value={state.user.region}>{state.user.region}</option>
                </select>
              </div>
            </form>
            <div className="aws-modal-footer">
              <button type="button" className="aws-btn aws-btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="aws-btn aws-btn-call-to-action" onClick={handleCreate} disabled={!newName.trim()}>Create bucket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
