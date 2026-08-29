
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Pages() {
  const { state, addPage, updatePage, deletePage } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ title: '', bodyHtml: '', published: true });

  const pages = state.pages || [];

  const filtered = useMemo(() => {
    let result = [...pages];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title?.toLowerCase().includes(q));
    }
    return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [pages, searchQuery]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Page title is required';
    return e;
  };

  const openCreate = () => {
    setForm({ title: '', bodyHtml: '', published: true });
    setEditingPage(null);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (page) => {
    setForm({ title: page.title, bodyHtml: page.bodyHtml || '', published: page.published !== false });
    setEditingPage(page);
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const handle = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (editingPage) {
      updatePage(editingPage.id, { title: form.title, bodyHtml: form.bodyHtml, published: form.published, handle });
    } else {
      addPage({ title: form.title, bodyHtml: form.bodyHtml, published: form.published, handle });
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    deletePage(id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Pages</h1>
        <button onClick={openCreate} className="btn-primary text-[13px]">
          <Plus size={16} /> Add page
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-3 border-b" style={{ borderColor: '#e3e3e3' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={16} />
            <input
              type="text"
              placeholder="Search pages"
              className="w-full pl-9 py-[7px] text-[13px]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Handle</th>
              <th>Last updated</th>
              <th>Visibility</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="5" className="text-center text-[#616161] py-12">No pages found. Click "Add page" to create one.</td></tr>
            ) : (
              filtered.map(page => (
                <tr key={page.id}>
                  <td className="font-medium text-[#303030]">{page.title}</td>
                  <td className="text-[#616161] font-mono text-[12px]">{page.handle}</td>
                  <td className="text-[#616161]">{page.updatedAt ? format(new Date(page.updatedAt), 'MMM d, yyyy') : '-'}</td>
                  <td>
                    <span className={`badge ${page.published !== false ? 'badge-success' : 'badge-info'}`}>
                      {page.published !== false ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(page)} className="text-[12px] px-2 py-0.5 rounded-md font-medium text-[#005bd3] hover:bg-[#e4e5e7]">Edit</button>
                      <button onClick={() => setDeleteTarget(page)} className="p-1.5 hover:bg-[#ffd2d2] text-[#d72c0d] rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-modal">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#e3e3e3' }}>
              <h3 className="text-[16px] font-bold text-[#303030]">{editingPage ? 'Edit page' : 'Add page'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-[#f1f1f1] rounded"><X size={20} className="text-[#616161]" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Title</label>
                <input
                  type="text"
                  className={`w-full text-[13px] ${errors.title ? 'border-[#d72c0d]' : ''}`}
                  placeholder="e.g. About Us"
                  value={form.title}
                  onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(v => ({ ...v, title: '' })); }}
                />
                {errors.title && <p className="text-[12px] text-[#d72c0d] mt-1">{errors.title}</p>}
                {form.title && (
                  <p className="text-[12px] text-[#616161] mt-1">
                    URL: /pages/{form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Content</label>
                <textarea
                  className="w-full text-[13px]"
                  rows={6}
                  value={form.bodyHtml}
                  onChange={e => setForm(f => ({ ...f, bodyHtml: e.target.value }))}
                  placeholder="Write your page content here..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="page-visible"
                  checked={form.published}
                  onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                  className="w-4 h-4"
                  style={{ accentColor: '#008060' }}
                />
                <label htmlFor="page-visible" className="text-[13px] text-[#303030]">Visible in online store</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-[13px]">Cancel</button>
                <button type="submit" className="btn-primary text-[13px]">{editingPage ? 'Save' : 'Add page'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete page"
          message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}
    </div>
  );
}
