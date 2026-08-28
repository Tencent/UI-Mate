import React, { useRef, useState } from 'react';
import { Upload, Grid, List, Image as ImageIcon, FileText, Trash2, X, Download, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ContentStudio() {
  const { state, updateState, addToast, sid } = useApp();
  const [view, setView] = useState('grid');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getImageDimensions = (file) => new Promise(resolve => {
    if (!file.type.startsWith('image/')) {
      resolve(null);
      return;
    }
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    let url = `/files${sid ? `?sid=${encodeURIComponent(sid)}&` : '?'}filename=${encodeURIComponent(safeName)}`;
    try {
      const res = await fetch(url, { method: 'POST', body: await file.arrayBuffer() });
      const data = await res.json();
      if (data.url) url = data.url;
    } catch (e) {
      addToast('File stored in this browser session', 'info');
      url = URL.createObjectURL(file);
    }
    const dimensions = await getImageDimensions(file);
    const newFile = {
      id: `file_${Date.now()}`,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      mimeType: file.type || 'application/octet-stream',
      url,
      size: file.size,
      dimensions,
      createdAt: new Date().toISOString()
    };
    updateState(s => ({ ...s, contentFiles: [...s.contentFiles, newFile] }));
    addToast(`${file.name} uploaded successfully`);
    event.target.value = '';
  };

  const handleDelete = (fileId) => {
    updateState(s => ({ ...s, contentFiles: s.contentFiles.filter(f => f.id !== fileId) }));
    addToast('File deleted');
    setSelectedFile(null);
  };

  const fileColors = ['#E0F7FA', '#FFF3E0', '#F3E5F5', '#E8F5E9', '#FCE4EC', '#E3F2FD'];

  return (
    <div>
      <div className="page-header">
        <h1>Content</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="segmented-control">
            <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><Grid size={14} /></button>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={14} /></button>
          </div>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}><Upload size={16} /> Upload</button>
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleUpload} />
        </div>
      </div>

      {view === 'grid' ? (
        <div className="content-grid">
          {state.contentFiles.map((file, i) => (
            <div key={file.id} className="content-file-card" onClick={() => setSelectedFile(file)}>
              <div className="file-thumbnail" style={{ background: fileColors[i % fileColors.length] }}>
                {file.type === 'image' ? <ImageIcon size={32} style={{ color: '#707070' }} /> : <FileText size={32} style={{ color: '#707070' }} />}
              </div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-meta">{formatSize(file.size)} &middot; {new Date(file.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}></th>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Dimensions</th>
                <th>Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {state.contentFiles.map((file, i) => (
                <tr key={file.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedFile(file)}>
                  <td><div style={{ width: 32, height: 32, borderRadius: 4, background: fileColors[i % fileColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{file.type === 'image' ? <ImageIcon size={14} /> : <FileText size={14} />}</div></td>
                  <td style={{ fontWeight: 500 }}>{file.name}</td>
                  <td className="text-muted">{file.type}</td>
                  <td className="text-muted">{formatSize(file.size)}</td>
                  <td className="text-muted">{file.dimensions ? `${file.dimensions.width}x${file.dimensions.height}` : '—'}</td>
                  <td className="text-muted text-sm">{new Date(file.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedFile && (
        <div className="modal-overlay" onClick={() => setSelectedFile(null)}>
          <div className="modal" style={{ width: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedFile.name}</h2>
              <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ height: 200, background: '#F6F6F4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {selectedFile.type === 'image' ? <img src={selectedFile.url} alt={selectedFile.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={e => { e.currentTarget.style.display = 'none'; }} /> : <FileText size={48} style={{ color: '#707070' }} />}
              </div>
              <div style={{ marginBottom: 8 }}><span className="text-sm text-muted">Type:</span> <span className="text-sm">{selectedFile.type}</span></div>
              <div style={{ marginBottom: 8 }}><span className="text-sm text-muted">Size:</span> <span className="text-sm">{formatSize(selectedFile.size)}</span></div>
              {selectedFile.dimensions && <div style={{ marginBottom: 8 }}><span className="text-sm text-muted">Dimensions:</span> <span className="text-sm">{selectedFile.dimensions.width} x {selectedFile.dimensions.height}</span></div>}
              <div style={{ marginBottom: 8 }}><span className="text-sm text-muted">Uploaded:</span> <span className="text-sm">{new Date(selectedFile.createdAt).toLocaleString()}</span></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => { navigator.clipboard?.writeText(selectedFile.url); addToast('URL copied'); }}><Copy size={14} /> Copy URL</button>
              <a className="btn btn-outlined" href={selectedFile.url} download={selectedFile.name}><Download size={14} /> Download</a>
              <button className="btn btn-danger" onClick={() => handleDelete(selectedFile.id)}><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
