import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FolderOpen, Plus, Trash2, Edit2, Check, X, ArrowLeft } from 'lucide-react';

export default function Folders() {
  const { state, dispatch } = useApp();
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const folders = state.folders || [];
  const allDocs = [...(state.cases || []), ...(state.statutes || [])];

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    dispatch({ type: 'CREATE_FOLDER', payload: { name: newFolderName.trim() } });
    setNewFolderName('');
    setShowCreate(false);
  };

  const handleDeleteFolder = (folderId) => {
    dispatch({ type: 'DELETE_FOLDER', payload: { folderId } });
    setShowDeleteConfirm(null);
    if (selectedFolder === folderId) setSelectedFolder(null);
  };

  const handleRemoveFromFolder = (folderId, docId) => {
    dispatch({ type: 'REMOVE_FROM_FOLDER', payload: { folderId, documentId: docId } });
  };

  const activeFolderData = selectedFolder ? folders.find(f => f.id === selectedFolder) : null;
  const folderDocs = activeFolderData
    ? (activeFolderData.documentIds || []).map(id => allDocs.find(d => d.id === id)).filter(Boolean)
    : [];

  if (selectedFolder && activeFolderData) {
    return (
      <div className="folders-page">
        <a className="back-link" onClick={() => setSelectedFolder(null)}>
          <ArrowLeft size={14} /> Back to Folders
        </a>
        <div className="page-header">
          <h1 className="page-title">
            <FolderOpen size={20} style={{ verticalAlign: -3, marginRight: 8 }} />
            {activeFolderData.name}
          </h1>
          <span style={{ fontSize: 13, color: '#5A6577' }}>{folderDocs.length} document{folderDocs.length !== 1 ? 's' : ''}</span>
        </div>

        {folderDocs.length === 0 ? (
          <div className="no-results">
            <h3>This folder is empty</h3>
            <p>Save documents to this folder from search results or document views.</p>
          </div>
        ) : (
          <table className="docs-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Citation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {folderDocs.map(doc => (
                <tr key={doc.id}>
                  <td><span className="doc-type-badge">{doc.type}</span></td>
                  <td>
                    <Link
                      to={doc.type === 'statute' ? `/statute/${doc.id}` : `/document/${doc.id}`}
                      style={{ color: '#1A73BA', fontWeight: 500 }}
                    >
                      {doc.title}
                    </Link>
                  </td>
                  <td style={{ color: '#5A6577', fontSize: 13 }}>{doc.citation}</td>
                  <td>
                    <button
                      className="icon-btn"
                      title="Remove from folder"
                      onClick={() => handleRemoveFromFolder(activeFolderData.id, doc.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  return (
    <div className="folders-page">
      <div className="page-header">
        <h1 className="page-title">Folders</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> New Folder
        </button>
      </div>

      {showCreate && (
        <div className="create-folder-form">
          <input
            type="text"
            placeholder="Folder name..."
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
            autoFocus
          />
          <button className="btn-primary" onClick={handleCreateFolder}>Create</button>
          <button className="btn-secondary" onClick={() => { setShowCreate(false); setNewFolderName(''); }}>Cancel</button>
        </div>
      )}

      {folders.length === 0 ? (
        <div className="no-results">
          <h3>No folders yet</h3>
          <p>Create a folder to organize your research documents.</p>
        </div>
      ) : (
        <table className="folders-table">
          <thead>
            <tr>
              <th>Folder Name</th>
              <th>Documents</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {folders.map(folder => (
              <tr key={folder.id}>
                <td>
                  {editingId === folder.id ? (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <input
                        className="inline-edit-input"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            // For simplicity, just stop editing (rename not implemented in reducer)
                            setEditingId(null);
                          }
                        }}
                      />
                      <button className="icon-btn" onClick={() => setEditingId(null)}><Check size={14} /></button>
                      <button className="icon-btn" onClick={() => setEditingId(null)}><X size={14} /></button>
                    </div>
                  ) : (
                    <a className="folder-name-cell" onClick={() => setSelectedFolder(folder.id)}>
                      <FolderOpen size={16} />
                      {folder.name}
                    </a>
                  )}
                </td>
                <td>{(folder.documentIds || []).length}</td>
                <td style={{ fontSize: 13, color: '#5A6577' }}>
                  {new Date(folder.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button className="icon-btn" title="Rename" onClick={() => { setEditingId(folder.id); setEditName(folder.name); }}>
                    <Edit2 size={14} />
                  </button>
                  <button className="icon-btn" title="Delete" onClick={() => setShowDeleteConfirm(folder.id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Delete Folder</h2>
            <div className="modal-body">
              Are you sure you want to delete this folder? Documents inside will not be deleted.
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDeleteFolder(showDeleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
