import React, { useState } from 'react';
import { Plus, ExternalLink, MoreHorizontal, Trash2, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LandingPages() {
  const { state, updateState, addToast } = useApp();
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = () => {
    const newPage = {
      id: `lp_${Date.now()}`,
      name: 'Untitled Landing Page',
      status: 'draft',
      url: '',
      views: 0,
      signups: 0,
      publishedAt: null,
      createdAt: new Date().toISOString()
    };
    updateState(s => ({ ...s, landingPages: [...s.landingPages, newPage] }));
    addToast('Landing page created');
  };

  const togglePublish = (page) => {
    const newStatus = page.status === 'published' ? 'unpublished' : 'published';
    updateState(s => ({
      ...s,
      landingPages: s.landingPages.map(p => p.id === page.id ? { ...p, status: newStatus, publishedAt: newStatus === 'published' ? new Date().toISOString() : p.publishedAt } : p)
    }));
    addToast(`Landing page ${newStatus}`);
    setMenuOpen(null);
  };

  const handleDelete = (id) => {
    updateState(s => ({ ...s, landingPages: s.landingPages.filter(p => p.id !== id) }));
    addToast('Landing page deleted');
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Landing Pages</h1>
        <button className="btn btn-primary" onClick={handleCreate}><Plus size={16} /> Create Landing Page</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>URL</th>
              <th>Views</th>
              <th>Signups</th>
              <th>Published</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {state.landingPages.map(page => (
              <tr key={page.id}>
                <td style={{ fontWeight: 500 }}>{page.name}</td>
                <td><span className={`badge badge-${page.status}`}>{page.status}</span></td>
                <td>{page.url ? <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{page.url.slice(0, 40)}... <ExternalLink size={12} /></a> : '—'}</td>
                <td>{page.views.toLocaleString()}</td>
                <td>{page.signups.toLocaleString()}</td>
                <td className="text-muted text-sm">{page.publishedAt ? new Date(page.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                <td>
                  <div className="action-menu">
                    <button className="action-menu-btn" onClick={() => setMenuOpen(menuOpen === page.id ? null : page.id)}><MoreHorizontal size={16} /></button>
                    {menuOpen === page.id && (
                      <div className="action-menu-dropdown">
                        <button className="action-menu-item" onClick={() => togglePublish(page)}>
                          {page.status === 'published' ? <><EyeOff size={14} style={{ marginRight: 8 }} />Unpublish</> : <><Eye size={14} style={{ marginRight: 8 }} />Publish</>}
                        </button>
                        <button className="action-menu-item danger" onClick={() => { setDeleteConfirm(page); setMenuOpen(null); }}><Trash2 size={14} style={{ marginRight: 8 }} />Delete</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Landing Page</h2></div>
            <div className="modal-body"><p>Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
