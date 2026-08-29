import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Tags() {
  const { state, addTag, updateTag, deleteTag, addToast } = useApp();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = () => {
    if (!newTagName.trim()) return;
    addTag({
      id: `tag_${Date.now()}`,
      name: newTagName.trim(),
      contactCount: 0,
      createdAt: new Date().toISOString()
    });
    addToast('Tag created');
    setNewTagName('');
    setShowCreate(false);
  };

  const handleRename = () => {
    if (!editName.trim() || !editingTag) return;
    updateTag(editingTag, { name: editName.trim() });
    addToast('Tag renamed');
    setEditingTag(null);
    setEditName('');
  };

  const handleDelete = (tag) => {
    const contactsWithTag = state.contacts.filter(c => c.tags.includes(tag.name)).length;
    deleteTag(tag.id);
    addToast(`Tag "${tag.name}" deleted`);
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Tags</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Tag</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
        {state.tags.map(tag => (
          <div key={tag.id} className="card" style={{ padding: 16 }}>
            {editingTag === tag.id ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus style={{ flex: 1, height: 32, border: '1px solid #E5E5E5', borderRadius: 4, padding: '0 8px', fontSize: 14 }}
                  onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingTag(null); }} />
                <button className="btn btn-sm btn-primary" onClick={handleRename}>Save</button>
                <button className="btn btn-sm btn-outlined" onClick={() => setEditingTag(null)}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <a style={{ fontWeight: 600, fontSize: 16, cursor: 'pointer', color: '#007C89' }} onClick={() => navigate(`/audience?tag=${tag.name}`)}>{tag.name}</a>
                  <p className="text-muted text-sm">{tag.contactCount} contacts</p>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { setEditingTag(tag.id); setEditName(tag.name); }} style={{ background: 'none', border: 'none', color: '#707070', cursor: 'pointer', padding: 4 }}><Edit3 size={14} /></button>
                  <button onClick={() => setDeleteConfirm(tag)} style={{ background: 'none', border: 'none', color: '#D5432F', cursor: 'pointer', padding: 4 }}><Trash2 size={14} /></button>
                </div>
              </div>
            )}
            <p className="text-xs text-muted">Created {new Date(tag.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Create Tag</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button></div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tag Name</label>
                <input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="Enter tag name" autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={!newTagName.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Tag</h2></div>
            <div className="modal-body"><p>Delete tag "{deleteConfirm.name}"? This will remove the tag from {state.contacts.filter(c => c.tags.includes(deleteConfirm.name)).length} contacts.</p></div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
