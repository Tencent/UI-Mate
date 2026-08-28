import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Folder, FileText, Upload, Plus, Search, Trash2, Download,
  ChevronRight, File, X, FolderOpen
} from 'lucide-react';

const FOLDERS = [
  { key: 'all', label: 'All Files', icon: <Folder size={15} /> },
  { key: 'Policies', label: 'Policies', icon: <Folder size={15} /> },
  { key: 'Tax Forms', label: 'Tax Forms', icon: <Folder size={15} /> },
  { key: 'Contracts', label: 'Contracts', icon: <Folder size={15} /> },
  { key: 'Certifications', label: 'Certifications', icon: <Folder size={15} /> },
  { key: 'Company', label: 'Company', icon: <Folder size={15} /> },
  { key: 'Other', label: 'Other', icon: <Folder size={15} /> },
];

function UploadModal({ onClose, dispatch, state }) {
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState('Company');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!docName.trim()) { setError('Document name is required.'); return; }
    const nextId = Math.max(0, ...(state.documents || []).map(d => d.id)) + 1;
    dispatch({
      type: 'ADD_DOCUMENT',
      document: {
        id: nextId,
        employeeId: null,
        name: docName.trim(),
        category,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedById: state.currentUser?.employeeId || 1,
        size: `${(Math.random() * 5 + 0.1).toFixed(1)} MB`
      }
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 460 }}>
        <div className="modal-header">
          <h2>Upload File</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div className="form-group">
          <label className="form-label">File Name *</label>
          <input className="form-input" value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. Employee Handbook 2026.pdf" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Folder</label>
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
            {FOLDERS.filter(f => f.key !== 'all').map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </div>
        <div style={{ border: '2px dashed #E0E0E0', borderRadius: 6, padding: '32px 20px', textAlign: 'center', marginBottom: 16, background: '#fafafa' }}>
          <Upload size={28} color="#ccc" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 13, color: '#999' }}>Drag and drop files here, or click to browse</div>
          <div style={{ fontSize: 11, color: '#ccc', marginTop: 4 }}>PDF, DOC, XLS, PNG up to 10MB</div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}><Upload size={14} /> Upload</button>
        </div>
      </div>
    </div>
  );
}

export default function Files() {
  const { state, dispatch } = useApp();
  const [searchParams] = useSearchParams();
  const [activeFolder, setActiveFolder] = useState('all');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const allDocs = (state.documents || []);
  const companyDocs = allDocs.filter(d => !d.employeeId);
  const employeeDocs = allDocs.filter(d => d.employeeId);

  const filteredDocs = (activeFolder === 'all' ? allDocs : allDocs.filter(d => d.category === activeFolder))
    .filter(d => {
      if (!search) return true;
      const q = search.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    });

  function deleteDoc(id) {
    if (window.confirm('Delete this file?')) {
      dispatch({ type: 'DELETE_DOCUMENT', id });
    }
  }

  const folderCounts = {};
  FOLDERS.forEach(f => {
    if (f.key === 'all') folderCounts[f.key] = allDocs.length;
    else folderCounts[f.key] = allDocs.filter(d => d.category === f.key).length;
  });

  return (
    <div style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #E0E0E0', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0', flex: 1 }}>
          <Folder size={18} color="#73C41D" />
          <span style={{ fontWeight: 600, fontSize: 18 }}>Files</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
          <Upload size={14} /> Upload File
        </button>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Sidebar folders */}
        <div style={{ width: 240, flexShrink: 0, background: 'white', borderRight: '1px solid #E0E0E0', minHeight: 'calc(100vh - 112px)' }}>
          <div style={{ padding: '16px 16px 8px', fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Folders
          </div>
          {FOLDERS.map(folder => (
            <button
              key={folder.key}
              onClick={() => setActiveFolder(folder.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '9px 16px', border: 'none',
                background: activeFolder === folder.key ? '#edf8e0' : 'none',
                color: activeFolder === folder.key ? '#5CA315' : '#555',
                fontSize: 13, fontWeight: activeFolder === folder.key ? 600 : 400,
                cursor: 'pointer', textAlign: 'left',
                borderLeft: activeFolder === folder.key ? '3px solid #73C41D' : '3px solid transparent'
              }}
              onMouseEnter={e => { if (activeFolder !== folder.key) e.currentTarget.style.background = '#fafafa'; }}
              onMouseLeave={e => { if (activeFolder !== folder.key) e.currentTarget.style.background = 'none'; }}
            >
              <span style={{ color: activeFolder === folder.key ? '#73C41D' : '#999' }}>{folder.icon}</span>
              <span style={{ flex: 1 }}>{folder.label}</span>
              <span style={{ fontSize: 11, color: '#999', background: '#f0f0f0', borderRadius: 10, padding: '1px 7px' }}>{folderCounts[folder.key] || 0}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '20px 24px' }}>
          {/* Search */}
          <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: 4, padding: '8px 12px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={15} color="#999" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search files..."
              style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 14 }}
            />
            {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}><X size={14} /></button>}
          </div>

          <div style={{ color: '#999', fontSize: 13, marginBottom: 12 }}>
            {filteredDocs.length} file{filteredDocs.length !== 1 ? 's' : ''} {activeFolder !== 'all' && `in ${activeFolder}`}
          </div>

          {filteredDocs.length === 0 ? (
            <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: 4, padding: '60px 20px', textAlign: 'center' }}>
              <FolderOpen size={40} color="#E0E0E0" style={{ margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>No files found</div>
              <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
                <Upload size={14} /> Upload a File
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Folder</th>
                    <th>Employee</th>
                    <th>Date Uploaded</th>
                    <th>Uploaded By</th>
                    <th>Size</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map(doc => {
                    const uploader = state.employees?.find(e => e.id === doc.uploadedById);
                    const emp = doc.employeeId ? state.employees?.find(e => e.id === doc.employeeId) : null;
                    return (
                      <tr key={doc.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FileText size={14} color="#73C41D" />
                            <a href="javascript:void(0)" style={{ color: '#73C41D', fontSize: 13, fontWeight: 500 }}>{doc.name}</a>
                          </div>
                        </td>
                        <td><span className="badge badge-gray" style={{ fontSize: 11 }}>{doc.category}</span></td>
                        <td style={{ fontSize: 13 }}>{emp ? emp.displayName : 'Company'}</td>
                        <td style={{ fontSize: 13, color: '#666' }}>{doc.uploadedAt}</td>
                        <td style={{ fontSize: 13 }}>{uploader ? `${uploader.firstName} ${uploader.lastName}` : '---'}</td>
                        <td style={{ fontSize: 13, color: '#999' }}>{doc.size}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#73C41D', padding: 4 }} title="Download"><Download size={13} /></button>
                            <button onClick={() => deleteDoc(doc.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ccc', padding: 4 }} title="Delete"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} dispatch={dispatch} state={state} />}
    </div>
  );
}
