import React, { useRef, useState } from 'react';
import { useStore } from '../store/StoreContext';
import { useParams, Link } from 'react-router-dom';
import { File, Folder, Upload, Trash2, X, FolderPlus } from 'lucide-react';
import { format } from 'date-fns';

function formatSize(bytes) {
  if (bytes === 0) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

export default function S3BucketDetail() {
  const { bucketName } = useParams();
  const { state, dispatch, addFlash } = useStore();
  const bucket = state.s3.find(b => b.name === bucketName);
  const [tab, setTab] = useState('Objects');
  const [currentPrefix, setCurrentPrefix] = useState('');
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const fileInputRef = useRef(null);

  if (!bucket) {
    return <div className="p-8 text-center text-aws-text-secondary">Bucket not found.</div>;
  }

  // Build folder view
  const objects = bucket.objects || [];
  const prefixParts = currentPrefix ? currentPrefix.split('/').filter(Boolean) : [];
  const folders = new Set();
  const files = [];
  objects.forEach(obj => {
    if (!obj.key.startsWith(currentPrefix) && currentPrefix) return;
    const rest = currentPrefix ? obj.key.slice(currentPrefix.length) : obj.key;
    const slashIdx = rest.indexOf('/');
    if (slashIdx >= 0) {
      folders.add(rest.substring(0, slashIdx));
    } else {
      files.push(obj);
    }
  });

  const folderList = Array.from(folders).sort();

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    dispatch({ type: 'CREATE_FOLDER', payload: { bucketName, folderKey: `${currentPrefix}${folderName.trim()}/` } });
    addFlash('success', `Folder "${folderName}" created`);
    setShowCreateFolder(false);
    setFolderName('');
  };

  const handleDeleteSelected = () => {
    if (deleteConfirm !== 'permanently delete') return;
    selectedObjects.forEach(key => {
      dispatch({ type: 'DELETE_OBJECT', payload: { bucketName, key } });
    });
    addFlash('success', `Deleted ${selectedObjects.length} object(s)`);
    setSelectedObjects([]);
    setShowDelete(false);
    setDeleteConfirm('');
  };

  const handleFileSelection = (event) => {
    setUploadFiles(Array.from(event.target.files || []));
  };

  const handleUpload = () => {
    setUploading(true);
    const filesToUpload = uploadFiles.length ? uploadFiles : [{ name: 'sample-upload.csv', size: 21 }];
    setTimeout(() => {
      filesToUpload.forEach(file => {
        const extension = file.name.includes('.') ? file.name.split('.').pop() : 'file';
        dispatch({
          type: 'UPLOAD_OBJECT',
          payload: {
            bucketName,
            object: {
              key: `${currentPrefix}${file.name}`,
              size: file.size,
              lastModified: new Date().toISOString(),
              storageClass: 'Standard',
              type: extension
            }
          }
        });
      });
      addFlash('success', `Upload succeeded: ${filesToUpload.length} file(s) uploaded`);
      setUploading(false);
      setShowUpload(false);
      setUploadFiles([]);
    }, 1500);
  };

  const tabs = ['Objects', 'Properties', 'Permissions', 'Metrics', 'Management'];

  return (
    <div className="space-y-0">
      {/* Tab bar */}
      <div className="aws-card p-0">
        <div className="px-4 pt-3 pb-0 flex gap-4 border-b border-aws-border">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`pb-3 px-1 text-sm font-medium border-b-2 ${tab === t ? 'border-aws-orange text-aws-orange' : 'border-transparent text-aws-text-secondary hover:text-aws-text'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Objects' && (
          <>
            {/* Path breadcrumb */}
            <div className="px-4 py-2 text-sm flex items-center gap-1">
              <button className="text-aws-blue hover:underline" onClick={() => setCurrentPrefix('')}>{bucketName}</button>
              {prefixParts.map((part, i) => (
                <React.Fragment key={i}>
                  <span className="text-aws-text-secondary">/</span>
                  <button className="text-aws-blue hover:underline" onClick={() => setCurrentPrefix(prefixParts.slice(0, i + 1).join('/') + '/')}>{part}</button>
                </React.Fragment>
              ))}
              <span className="text-aws-text-secondary">/</span>
            </div>
            {/* Actions */}
            <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
              <button className="aws-btn aws-btn-primary text-xs" onClick={() => setShowUpload(true)}>Upload</button>
              <button className="aws-btn aws-btn-secondary text-xs" onClick={() => setShowCreateFolder(true)}>Create folder</button>
              {selectedObjects.length > 0 && (
                <button className="aws-btn aws-btn-danger text-xs" onClick={() => setShowDelete(true)}>Delete</button>
              )}
            </div>
            {/* Table */}
            <table className="aws-table">
              <thead><tr><th className="w-8"><input type="checkbox" /></th><th>Name</th><th>Type</th><th>Last modified</th><th>Size</th><th>Storage class</th></tr></thead>
              <tbody>
                {folderList.map(f => (
                  <tr key={f}>
                    <td></td>
                    <td>
                      <button className="flex items-center gap-2 text-aws-blue hover:underline" onClick={() => setCurrentPrefix(currentPrefix + f + '/')}>
                        <Folder size={16} className="text-aws-orange" />{f}/
                      </button>
                    </td>
                    <td>Folder</td><td>-</td><td>-</td><td>-</td>
                  </tr>
                ))}
                {files.map(obj => (
                  <tr key={obj.key}>
                    <td><input type="checkbox" checked={selectedObjects.includes(obj.key)} onChange={e => {
                      if (e.target.checked) setSelectedObjects([...selectedObjects, obj.key]);
                      else setSelectedObjects(selectedObjects.filter(k => k !== obj.key));
                    }} /></td>
                    <td className="flex items-center gap-2 text-aws-blue"><File size={16} className="text-gray-400" />{obj.key.split('/').pop()}</td>
                    <td>{obj.type || '-'}</td>
                    <td>{obj.lastModified ? format(new Date(obj.lastModified), 'MMM d, yyyy h:mm a') : '-'}</td>
                    <td>{formatSize(obj.size)}</td>
                    <td>{obj.storageClass}</td>
                  </tr>
                ))}
                {folderList.length === 0 && files.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-8 text-aws-text-secondary">No objects in this location.</td></tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {tab === 'Properties' && (
          <div className="p-4 space-y-6">
            {/* Bucket versioning */}
            <div className="border border-aws-border">
              <div className="px-4 py-3 bg-gray-50 border-b border-aws-border font-bold text-sm">Bucket Versioning</div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-aws-text-secondary">Versioning is a means of keeping multiple variants of an object in the same bucket.</p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="versioning" checked={bucket.versioning === 'Enabled'} onChange={() => dispatch({ type: 'UPDATE_BUCKET_VERSIONING', payload: { bucketName, versioning: 'Enabled' } })} />
                    Enable
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="versioning" checked={bucket.versioning !== 'Enabled'} onChange={() => dispatch({ type: 'UPDATE_BUCKET_VERSIONING', payload: { bucketName, versioning: 'Disabled' } })} />
                    Suspend
                  </label>
                  <span className={`aws-badge text-xs ${bucket.versioning === 'Enabled' ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                    Currently: {bucket.versioning || 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
            {/* Default encryption */}
            <div className="border border-aws-border">
              <div className="px-4 py-3 bg-gray-50 border-b border-aws-border font-bold text-sm">Default encryption</div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-aws-text-secondary">Encryption type:</span> <span className="ml-2 font-medium">{bucket.encryption || 'SSE-S3'}</span></div>
                  <div><span className="text-aws-text-secondary">Bucket Key:</span> <span className="ml-2 font-medium">Enabled</span></div>
                </div>
              </div>
            </div>
            {/* Server access logging */}
            <div className="border border-aws-border">
              <div className="px-4 py-3 bg-gray-50 border-b border-aws-border font-bold text-sm">Server access logging</div>
              <div className="p-4">
                <span className="aws-badge bg-gray-100 text-gray-700 text-xs">Disabled</span>
                <p className="text-sm text-aws-text-secondary mt-2">Server access logging provides detailed records for the requests that are made to a bucket.</p>
              </div>
            </div>
            {/* Static website hosting */}
            <div className="border border-aws-border">
              <div className="px-4 py-3 bg-gray-50 border-b border-aws-border font-bold text-sm">Static website hosting</div>
              <div className="p-4">
                <span className="aws-badge bg-gray-100 text-gray-700 text-xs">Disabled</span>
                <p className="text-sm text-aws-text-secondary mt-2">You can use Amazon S3 to host a static website.</p>
              </div>
            </div>
            {/* Requester pays */}
            <div className="border border-aws-border">
              <div className="px-4 py-3 bg-gray-50 border-b border-aws-border font-bold text-sm">Requester pays</div>
              <div className="p-4">
                <span className="aws-badge bg-gray-100 text-gray-700 text-xs">Disabled</span>
                <p className="text-sm text-aws-text-secondary mt-2">When enabled, the requester pays for requests and data transfer costs.</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'Permissions' && (
          <div className="p-4 space-y-6">
            {/* Block public access */}
            <div className="border border-aws-border">
              <div className="px-4 py-3 bg-gray-50 border-b border-aws-border font-bold text-sm">Block public access (bucket settings)</div>
              <div className="p-4 space-y-2">
                <div className="p-3 bg-green-50 border border-green-100 text-sm flex items-center gap-2">
                  <span className="text-aws-success font-bold">On</span>
                  <span>Block <em>all</em> public access</span>
                </div>
                <div className="space-y-1 ml-4">
                  {['Block public access to buckets and objects granted through new access control lists (ACLs)',
                    'Block public access to buckets and objects granted through any access control lists (ACLs)',
                    'Block public access to buckets and objects granted through new public bucket or access point policies',
                    'Block public and cross-account access to buckets and objects through any public bucket or access point policies'
                  ].map((item, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm text-aws-text-secondary">
                      <input type="checkbox" checked disabled className="opacity-60" />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* Bucket policy */}
            <div className="border border-aws-border">
              <div className="px-4 py-3 bg-gray-50 border-b border-aws-border font-bold text-sm">Bucket policy</div>
              <div className="p-4">
                <pre className="p-3 text-sm font-mono overflow-auto" style={{ background: '#1E1E1E', color: '#D4D4D4', borderRadius: 2, maxHeight: 200 }}>
{JSON.stringify({
  Version: "2012-10-17",
  Statement: [{
    Sid: "AllowSSLRequestsOnly",
    Effect: "Deny",
    Principal: "*",
    Action: "s3:*",
    Resource: [
      `arn:aws:s3:::${bucketName}`,
      `arn:aws:s3:::${bucketName}/*`
    ],
    Condition: {
      Bool: { "aws:SecureTransport": "false" }
    }
  }]
}, null, 2)}
                </pre>
              </div>
            </div>
            {/* ACL */}
            <div className="border border-aws-border">
              <div className="px-4 py-3 bg-gray-50 border-b border-aws-border font-bold text-sm">Access control list (ACL)</div>
              <div className="p-4">
                <table className="aws-table">
                  <thead><tr><th>Grantee</th><th>Objects</th><th>Bucket ACL</th></tr></thead>
                  <tbody>
                    <tr>
                      <td className="text-sm font-medium">Bucket owner (your AWS account)</td>
                      <td className="text-sm">List, Write</td>
                      <td className="text-sm">Read, Write</td>
                    </tr>
                    <tr>
                      <td className="text-sm text-aws-text-secondary">Everyone (public access)</td>
                      <td className="text-sm text-aws-text-disabled">No access</td>
                      <td className="text-sm text-aws-text-disabled">No access</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'Metrics' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-aws-border p-4">
                <div className="text-xs text-aws-text-secondary">Total objects</div>
                <div className="text-2xl font-bold mt-1">{objects.filter(o => o.type !== 'folder').length}</div>
              </div>
              <div className="border border-aws-border p-4">
                <div className="text-xs text-aws-text-secondary">Total size</div>
                <div className="text-2xl font-bold mt-1">{formatSize(objects.reduce((sum, o) => sum + (o.size || 0), 0))}</div>
              </div>
              <div className="border border-aws-border p-4">
                <div className="text-xs text-aws-text-secondary">Storage class</div>
                <div className="text-2xl font-bold mt-1">Standard</div>
              </div>
            </div>
            <div className="border border-aws-border p-4">
              <h3 className="font-bold text-sm mb-2">Request metrics</h3>
              <div className="h-28 flex items-end gap-2">
                {[28, 46, 35, 60, 52, 76, 64].map((height, idx) => (
                  <div key={idx} className="bg-aws-blue w-8" style={{ height }} title={`${height} requests`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'Management' && (
          <div className="p-4 space-y-4">
            <div className="border border-aws-border">
              <div className="px-4 py-3 bg-gray-50 border-b border-aws-border font-bold text-sm">Lifecycle rules</div>
              <div className="p-4">
                <table className="aws-table">
                  <thead><tr><th>Name</th><th>Status</th><th>Scope</th><th>Transition</th></tr></thead>
                  <tbody>
                    <tr><td>archive-old-logs</td><td><span className="aws-badge bg-green-50 text-green-800">Enabled</span></td><td>logs/</td><td>Glacier after 90 days</td></tr>
                    <tr><td>expire-temp</td><td><span className="aws-badge bg-gray-100 text-gray-700">Disabled</span></td><td>tmp/</td><td>Delete after 7 days</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="border border-aws-border">
              <div className="px-4 py-3 bg-gray-50 border-b border-aws-border font-bold text-sm">Replication rules</div>
              <div className="p-4 text-sm text-aws-text-secondary">No active replication rules for this local sandbox bucket.</div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-lg border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Upload</h3>
              <button onClick={() => setShowUpload(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-sm text-aws-text-secondary">Destination: s3://{bucketName}/{currentPrefix}</div>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelection} />
              <button className="aws-btn aws-btn-secondary text-xs" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                Choose files
              </button>
              {uploadFiles.length > 0 && (
                <div className="border border-aws-border">
                  {uploadFiles.map(file => (
                    <div key={`${file.name}-${file.size}`} className="flex justify-between px-3 py-2 text-sm border-b last:border-b-0">
                      <span>{file.name}</span>
                      <span className="text-aws-text-secondary">{formatSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              )}
              {uploading && (
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-aws-orange h-full rounded-full animate-pulse" style={{ width: '75%' }}></div>
                </div>
              )}
              <p className="text-sm">Choose local files to upload into this sandbox bucket. If no file is selected, a sample CSV is added for deterministic testing.</p>
              <div className="flex justify-end gap-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowUpload(false)} disabled={uploading}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-md border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Create folder</h3>
              <button onClick={() => setShowCreateFolder(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Folder name</label>
                <input className="aws-input" value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="new-folder" />
              </div>
              <div className="flex justify-end gap-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowCreateFolder(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleCreateFolder} disabled={!folderName.trim()}>Create folder</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-md border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold text-aws-error">Delete objects</h3>
              <button onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm">To confirm deletion, type <strong>permanently delete</strong> in the field below.</p>
              <input className="aws-input" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="permanently delete" />
              <div className="flex justify-end gap-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}>Cancel</button>
                <button className="aws-btn aws-btn-danger" onClick={handleDeleteSelected} disabled={deleteConfirm !== 'permanently delete'}>Delete objects</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
