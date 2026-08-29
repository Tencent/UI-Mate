
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Collections() {
  const { state, addCollection, updateCollection, deleteCollection } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '',
    bodyHtml: '',
    collectionType: 'manual',
    sortOrder: 'manual',
  });

  const collections = state.collections || [];

  const filtered = useMemo(() => {
    let result = [...collections];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.title?.toLowerCase().includes(q));
    }
    return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [collections, searchQuery]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Collection title is required';
    return e;
  };

  const openCreate = () => {
    setForm({ title: '', bodyHtml: '', collectionType: 'manual', sortOrder: 'manual' });
    setEditingCollection(null);
    setErrors({});
    setShowCreateModal(true);
  };

  const openEdit = (collection) => {
    setForm({
      title: collection.title || '',
      bodyHtml: collection.bodyHtml || '',
      collectionType: collection.collectionType || 'manual',
      sortOrder: collection.sortOrder || 'manual',
    });
    setEditingCollection(collection);
    setErrors({});
    setShowCreateModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const handle = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (editingCollection) {
      updateCollection(editingCollection.id, {
        title: form.title,
        bodyHtml: form.bodyHtml,
        collectionType: form.collectionType,
        sortOrder: form.sortOrder,
        handle,
      });
    } else {
      addCollection({
        title: form.title,
        bodyHtml: form.bodyHtml,
        handle,
        collectionType: form.collectionType,
        sortOrder: form.sortOrder,
        image: null,
      });
    }
    setShowCreateModal(false);
    setErrors({});
  };

  const handleDelete = (id) => {
    deleteCollection(id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Collections</h1>
        <button onClick={openCreate} className="btn-primary text-[13px]">
          <Plus size={16} /> Create collection
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-3 border-b" style={{ borderColor: '#e3e3e3' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={16} />
            <input
              type="text"
              placeholder="Search collections"
              className="w-full pl-9 py-[7px] text-[13px]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Collection</th>
              <th>Type</th>
              <th>Products</th>
              <th>Last updated</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="5" className="text-center text-[#616161] py-12">No collections found</td></tr>
            ) : (
              filtered.map(collection => (
                <tr key={collection.id}>
                  <td>
                    <div className="font-medium text-[#303030]">{collection.title}</div>
                    {collection.handle && <div className="text-[12px] text-[#616161]">/{collection.handle}</div>}
                  </td>
                  <td>
                    <span className="badge badge-info capitalize">
                      {collection.collectionType || 'manual'}
                    </span>
                  </td>
                  <td className="text-[#616161]">{(collection.productIds || []).length}</td>
                  <td className="text-[#616161]">{collection.updatedAt ? format(new Date(collection.updatedAt), 'MMM d, yyyy') : '-'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(collection)}
                        className="text-[12px] px-2 py-0.5 rounded-md font-medium text-[#005bd3] hover:bg-[#e4e5e7]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(collection)}
                        className="p-1.5 hover:bg-[#ffd2d2] text-[#d72c0d] rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-modal">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#e3e3e3' }}>
              <h3 className="text-[16px] font-bold text-[#303030]">{editingCollection ? 'Edit collection' : 'Create collection'}</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-[#f1f1f1] rounded">
                <X size={20} className="text-[#616161]" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Title</label>
                <input
                  type="text"
                  className={`w-full text-[13px] ${errors.title ? 'border-[#d72c0d]' : ''}`}
                  placeholder="e.g. Summer Collection"
                  value={form.title}
                  onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(v => ({ ...v, title: '' })); }}
                />
                {errors.title && <p className="text-[12px] text-[#d72c0d] mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Description <span className="text-[#616161] font-normal">(optional)</span></label>
                <textarea
                  className="w-full text-[13px]"
                  rows={3}
                  value={form.bodyHtml}
                  onChange={e => setForm(f => ({ ...f, bodyHtml: e.target.value }))}
                  placeholder="Describe this collection..."
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Collection type</label>
                <select
                  className="w-full text-[13px]"
                  value={form.collectionType}
                  onChange={e => setForm(f => ({ ...f, collectionType: e.target.value }))}
                >
                  <option value="manual">Manual — Add products manually</option>
                  <option value="smart">Automated — Products added automatically</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Sort order</label>
                <select
                  className="w-full text-[13px]"
                  value={form.sortOrder}
                  onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                >
                  <option value="manual">Manually</option>
                  <option value="best-selling">Best selling</option>
                  <option value="alpha-asc">Alphabetically A-Z</option>
                  <option value="alpha-desc">Alphabetically Z-A</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="created-desc">Newest</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary text-[13px]">Cancel</button>
                <button type="submit" className="btn-primary text-[13px]">{editingCollection ? 'Save' : 'Create collection'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete collection"
          message={`Delete "${deleteTarget.title}"? Products in the collection will not be deleted.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}
    </div>
  );
}
