
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, Save, Plus, Trash2, Upload, X } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addProduct, updateProduct, deleteProduct } = useStore();
  const isNew = id === 'new';

  const [formData, setFormData] = useState({
    title: '', bodyHtml: '', vendor: '', productType: '', handle: '',
    status: 'active', tags: [], images: [], variants: [], options: [],
    collections: []
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mediaInputRef = React.useRef(null);

  useEffect(() => {
    if (!isNew) {
      const product = state.products.find(p => p.id === id);
      if (product) {
        setFormData({ ...product });
      } else {
        navigate('/products');
      }
    }
  }, [id, state.products, isNew, navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (isNew) {
      addProduct({
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: formData.status === 'active' ? new Date().toISOString() : null,
      });
    } else {
      updateProduct(id, { ...formData, updatedAt: new Date().toISOString() });
    }
    navigate('/products');
  };

  const handleDelete = () => {
    setConfirmDelete(true);
  };

  const confirmDeleteProduct = () => {
    deleteProduct(id);
    setConfirmDelete(false);
    navigate('/products');
  };

  const updateVariant = (variantId, updates) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === variantId ? { ...v, ...updates } : v)
    }));
  };

  const addVariant = () => {
    const newVariant = {
      id: `var_new_${Date.now()}`,
      productId: id || 'new',
      title: 'Default',
      price: '0.00',
      compareAtPrice: null,
      sku: '',
      barcode: '',
      inventoryQuantity: 0,
      inventoryPolicy: 'deny',
      weight: 0,
      weightUnit: 'lb',
      requiresShipping: true,
      taxable: true,
      option1: 'Default',
      option2: null,
      option3: null,
      position: (formData.variants?.length || 0) + 1,
    };
    setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), newVariant] }));
  };

  const removeVariant = (variantId) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter(v => v.id !== variantId) }));
  };

  const getProductImage = () => {
    if (formData.images && formData.images.length > 0) return formData.images[0].src;
    return null;
  };

  const handleAddImage = (file = null, dataUrl = null) => {
    const newImage = {
      id: `img_new_${Date.now()}`,
      src: dataUrl || `https://picsum.photos/seed/${encodeURIComponent(formData.title?.slice(0,10) || 'P')}/400/400`,
      alt: file?.name || formData.title || 'Product image',
      position: (formData.images?.length || 0) + 1,
      width: 400,
      height: 400,
      originalName: file?.name || null,
      contentType: file?.type || null,
    };
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), newImage] }));
  };

  const removeImage = (imgId) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(i => i.id !== imgId) }));
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/products')} className="p-1.5 hover:bg-[#e3e3e3] rounded-lg">
            <ArrowLeft size={20} className="text-[#616161]" />
          </button>
          <h1 className="page-title">{isNew ? 'Add product' : formData.title}</h1>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <button onClick={handleDelete} className="btn-danger text-[13px]"><Trash2 size={16} /> Delete</button>
          )}
          <button onClick={handleSave} className="btn-primary text-[13px]"><Save size={16} /> Save</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="card space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1">Title</label>
              <input type="text" className="w-full text-[13px]" value={formData.title} onChange={e => handleChange('title', e.target.value)} placeholder="Short sleeve t-shirt" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1">Description</label>
              <textarea className="w-full h-32 text-[13px]" value={formData.bodyHtml || ''} onChange={e => handleChange('bodyHtml', e.target.value)} placeholder="Add a description" />
            </div>
          </div>

          {/* Media */}
          <div className="card">
            <h3 className="card-title mb-3">Media</h3>
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = event => handleAddImage(file, event.target.result);
                  reader.readAsDataURL(file);
                }
                e.target.value = '';
              }}
            />
            <div onClick={() => mediaInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-[#f9fafb] cursor-pointer transition-colors" style={{ borderColor: '#c9cccf' }}>
              <Upload className="mx-auto mb-2 text-[#616161]" size={20} />
              <p className="text-[13px] text-[#005bd3] font-medium">Add files</p>
              <p className="text-[12px] text-[#616161] mt-1">Accepts local image files</p>
            </div>
            {formData.images && formData.images.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {formData.images.map(img => (
                  <div key={img.id} className="relative group">
                    <img src={img.src} alt={img.alt} className="rounded border w-full h-20 object-cover" style={{ borderColor: '#e3e3e3' }} />
                    <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 bg-white rounded-full p-0.5 opacity-100 shadow-sm">
                      <X size={12} className="text-[#d72c0d]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="card-title">Variants</h3>
              <button onClick={addVariant} className="btn-plain text-[13px]"><Plus size={14} /> Add variant</button>
            </div>
            {formData.variants && formData.variants.length > 0 ? (
              <div className="space-y-2">
                {formData.variants.map(variant => (
                  <div key={variant.id} className="flex items-center gap-2 p-3 rounded-lg border" style={{ borderColor: '#e3e3e3' }}>
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <input type="text" className="text-[13px]" placeholder="Title" value={variant.title} onChange={e => updateVariant(variant.id, { title: e.target.value })} />
                      <input type="text" className="text-[13px]" placeholder="SKU" value={variant.sku} onChange={e => updateVariant(variant.id, { sku: e.target.value })} />
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#616161] text-[13px]">$</span>
                        <input type="text" className="text-[13px] pl-5" placeholder="0.00" value={variant.price} onChange={e => updateVariant(variant.id, { price: e.target.value })} />
                      </div>
                      <input type="number" className="text-[13px]" placeholder="Qty" value={variant.inventoryQuantity} onChange={e => updateVariant(variant.id, { inventoryQuantity: parseInt(e.target.value) || 0 })} />
                    </div>
                    <button onClick={() => removeVariant(variant.id)} className="p-1 hover:bg-[#ffd2d2] text-[#d72c0d] rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#616161]">This product has no variants. Add options like size or color.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="card">
            <h3 className="card-title mb-3">Status</h3>
            <select className="w-full text-[13px]" value={formData.status} onChange={e => handleChange('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Organization */}
          <div className="card space-y-3">
            <h3 className="card-title">Product organization</h3>
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1">Product type</label>
              <input type="text" className="w-full text-[13px]" value={formData.productType || ''} onChange={e => handleChange('productType', e.target.value)} placeholder="e.g. Shirts" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1">Vendor</label>
              <input type="text" className="w-full text-[13px]" value={formData.vendor || ''} onChange={e => handleChange('vendor', e.target.value)} placeholder="e.g. Nike" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#303030] mb-1">Tags</label>
              <input type="text" className="w-full text-[13px]" value={(formData.tags || []).join(', ')} onChange={e => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} placeholder="Vintage, cotton, summer" />
            </div>
          </div>

          {/* Collections */}
          <div className="card">
            <h3 className="card-title mb-2">Collections</h3>
            {formData.collections && formData.collections.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {formData.collections.map(collId => {
                  const coll = state.collections?.find(c => c.id === collId);
                  return coll ? <span key={collId} className="badge badge-info">{coll.title}</span> : null;
                })}
              </div>
            ) : (
              <p className="text-[13px] text-[#616161]">Not in any collection</p>
            )}
          </div>
        </div>
      </div>
      {confirmDelete && (
        <ConfirmDialog
          title="Delete product"
          message={`Delete "${formData.title}"? This cannot be undone.`}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={confirmDeleteProduct}
        />
      )}
    </div>
  );
}
