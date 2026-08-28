
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmDialog from '../components/ConfirmDialog';

export default function BlogPosts() {
  const { state, addBlogPost, updateBlogPost, deleteBlogPost } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '',
    author: state.store?.owner ? `${state.store.owner.firstName} ${state.store.owner.lastName}` : 'Alex Chen',
    bodyHtml: '',
    tags: '',
    published: true,
  });

  const posts = state.blogPosts || [];

  const filtered = useMemo(() => {
    let result = [...posts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title?.toLowerCase().includes(q) || p.author?.toLowerCase().includes(q));
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [posts, searchQuery]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    return e;
  };

  const openCreate = () => {
    setForm({ title: '', author: state.store?.owner ? `${state.store.owner.firstName} ${state.store.owner.lastName}` : 'Alex Chen', bodyHtml: '', tags: '', published: true });
    setEditingPost(null);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (post) => {
    setForm({ title: post.title, author: post.author, bodyHtml: post.bodyHtml || '', tags: (post.tags || []).join(', '), published: post.published !== false });
    setEditingPost(post);
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
    const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const handle = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (editingPost) {
      updateBlogPost(editingPost.id, { title: form.title, author: form.author, bodyHtml: form.bodyHtml, tags, published: form.published, handle });
    } else {
      addBlogPost({ title: form.title, author: form.author, bodyHtml: form.bodyHtml, tags, published: form.published, handle });
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    deleteBlogPost(id);
    setDeleteTarget(null);
  };

  const handleTogglePublish = (post) => {
    updateBlogPost(post.id, { published: !post.published });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Blog posts</h1>
        <button onClick={openCreate} className="btn-primary text-[13px]">
          <Plus size={16} /> Create post
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-3 border-b" style={{ borderColor: '#e3e3e3' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={16} />
            <input
              type="text"
              placeholder="Search posts"
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
              <th>Author</th>
              <th>Tags</th>
              <th>Created</th>
              <th>Status</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-[#616161] py-12">No blog posts found</td></tr>
            ) : (
              filtered.map(post => (
                <tr key={post.id}>
                  <td>
                    <div className="font-medium text-[#303030]">{post.title}</div>
                    {post.handle && <div className="text-[12px] text-[#616161]">/{post.handle}</div>}
                  </td>
                  <td className="text-[#616161]">{post.author}</td>
                  <td className="text-[#616161]">{(post.tags || []).join(', ') || '—'}</td>
                  <td className="text-[#616161]">{format(new Date(post.createdAt), 'MMM d, yyyy')}</td>
                  <td>
                    <span className={`badge ${post.published !== false ? 'badge-success' : 'badge-info'}`}>
                      {post.published !== false ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(post)} className="text-[12px] px-2 py-0.5 rounded-md font-medium text-[#005bd3] hover:bg-[#e4e5e7]">Edit</button>
                      <button onClick={() => setDeleteTarget(post)} className="p-1.5 hover:bg-[#ffd2d2] text-[#d72c0d] rounded"><Trash2 size={14} /></button>
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
              <h3 className="text-[16px] font-bold text-[#303030]">{editingPost ? 'Edit post' : 'Create post'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-[#f1f1f1] rounded"><X size={20} className="text-[#616161]" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Title</label>
                <input
                  type="text"
                  className={`w-full text-[13px] ${errors.title ? 'border-[#d72c0d]' : ''}`}
                  value={form.title}
                  onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(v => ({ ...v, title: '' })); }}
                />
                {errors.title && <p className="text-[12px] text-[#d72c0d] mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Author</label>
                <input
                  type="text"
                  className="w-full text-[13px]"
                  value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Content</label>
                <textarea
                  className="w-full text-[13px]"
                  rows={5}
                  value={form.bodyHtml}
                  onChange={e => setForm(f => ({ ...f, bodyHtml: e.target.value }))}
                  placeholder="Write your blog post content..."
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Tags</label>
                <input
                  type="text"
                  className="w-full text-[13px]"
                  placeholder="news, tips, sale"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                  className="w-4 h-4"
                  style={{ accentColor: '#008060' }}
                />
                <label htmlFor="published" className="text-[13px] text-[#303030]">Published</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-[13px]">Cancel</button>
                <button type="submit" className="btn-primary text-[13px]">{editingPost ? 'Save' : 'Create post'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete blog post"
          message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}
    </div>
  );
}
