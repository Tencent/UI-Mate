
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Eye, Palette, FileText, PenTool, Navigation as NavIcon, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function OnlineStore() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const pages = state.pages || [];
  const blogPosts = state.blogPosts || [];
  const navigationMenus = state.navigationMenus || [];
  const featuredProducts = (state.products || []).filter(p => p.status === 'active').slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Online Store</h1>
        <button onClick={() => setShowPreview(true)} className="btn-secondary text-[13px]"><Eye size={16} /> View your store</button>
      </div>

      {/* Theme card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: '#008060' }}>
              <Palette size={24} className="text-white" />
            </div>
            <div>
              <h3 className="card-title">Dawn</h3>
              <div className="text-[12px] text-[#616161]">Current theme - Published</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-[13px]" onClick={() => navigate('/online-store/themes')}>Customize</button>
            <button className="btn-secondary text-[13px]" onClick={() => navigate('/online-store/themes')}>Actions</button>
          </div>
        </div>
        <div className="h-40 rounded-lg overflow-hidden border p-4" style={{ borderColor: '#e3e3e3', background: 'linear-gradient(135deg, #f6f6f7, #ffffff)' }}>
          <div className="text-[12px] uppercase tracking-wide text-[#616161] mb-2">{state.store?.name || 'Evergreen Goods'}</div>
          <div className="text-[24px] font-semibold text-[#303030] mb-2">Sustainable essentials for everyday living</div>
          <div className="flex gap-2">
            {featuredProducts.map(product => (
              <div key={product.id} className="px-3 py-2 bg-white rounded-lg border text-[12px]" style={{ borderColor: '#e3e3e3' }}>{product.title}</div>
            ))}
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-xl shadow-modal w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#e3e3e3' }}>
              <h2 className="text-[16px] font-semibold text-[#303030]">Store preview</h2>
              <button className="btn-secondary text-[13px]" onClick={() => setShowPreview(false)}>Close preview</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="rounded-xl p-6" style={{ background: '#f1f8f5' }}>
                <div className="text-[12px] uppercase tracking-wide text-[#047b5d]">{state.store?.customDomain || state.store?.domain}</div>
                <h3 className="text-[28px] font-semibold text-[#303030] mt-2">Evergreen Goods</h3>
                <p className="text-[13px] text-[#616161] mt-1">A local storefront preview generated from current products and pages.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {featuredProducts.map(product => (
                  <div key={product.id} className="border rounded-lg p-3" style={{ borderColor: '#e3e3e3' }}>
                    <img src={product.images?.[0]?.src} alt={product.title} className="w-full h-24 object-cover rounded-md mb-2" />
                    <div className="text-[13px] font-medium text-[#303030]">{product.title}</div>
                    <div className="text-[12px] text-[#616161]">{product.vendor}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pages */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#e3e3e3', background: '#f9fafb' }}>
            <h3 className="card-title flex items-center gap-2"><FileText size={16} /> Pages</h3>
            <button className="btn-plain text-[13px]" onClick={() => navigate('/online-store/pages')}>Add page</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.id}>
                  <td className="font-medium text-[#303030]">{page.title}</td>
                  <td>
                    <span className={`badge ${page.published ? 'badge-success' : 'badge-info'}`}>
                      {page.published ? 'Published' : 'Hidden'}
                    </span>
                  </td>
                  <td className="text-[#616161]">{format(new Date(page.updatedAt || page.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr><td colSpan="3" className="text-center text-[#616161] py-8">No pages</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Blog posts */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#e3e3e3', background: '#f9fafb' }}>
            <h3 className="card-title flex items-center gap-2"><PenTool size={16} /> Blog posts</h3>
            <button className="btn-plain text-[13px]" onClick={() => navigate('/online-store/blog-posts')}>Create post</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {blogPosts.map(post => (
                <tr key={post.id}>
                  <td className="font-medium text-[#303030]">{post.title}</td>
                  <td className="text-[#616161]">{post.author}</td>
                  <td>
                    <span className={`badge ${post.published ? 'badge-success' : 'badge-info'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                </tr>
              ))}
              {blogPosts.length === 0 && (
                <tr><td colSpan="3" className="text-center text-[#616161] py-8">No blog posts</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div className="card">
        <h3 className="card-title flex items-center gap-2 mb-4"><NavIcon size={16} /> Navigation</h3>
        <div className="space-y-3">
          {navigationMenus.map(menu => (
            <div key={menu.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: '#e3e3e3' }}>
              <div>
                <div className="text-[13px] font-medium text-[#303030]">{menu.title}</div>
                <div className="text-[12px] text-[#616161]">{menu.items?.length || 0} menu items</div>
              </div>
              <button className="btn-secondary text-[13px]" onClick={() => navigate('/online-store/navigation')}>Edit menu</button>
            </div>
          ))}
          {navigationMenus.length === 0 && (
            <p className="text-[13px] text-[#616161]">No navigation menus</p>
          )}
        </div>
      </div>
    </div>
  );
}
