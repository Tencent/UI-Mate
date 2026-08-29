import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronLeft, X } from 'lucide-react'

const TABS = ['General', 'Inventory', 'Shipping', 'Linked Products', 'Attributes', 'Advanced']

export default function ProductEdit() {
  const { productId } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const isNew = productId === 'new' || !productId

  const existing = isNew ? null : state.products.find(p => p.id === productId)

  const blank = {
    name: '', slug: '', type: 'simple', status: 'draft', featured: false, catalogVisibility: 'visible',
    description: '', shortDescription: '', sku: '', price: '', regularPrice: '', salePrice: '', onSale: false,
    taxStatus: 'taxable', taxClass: '', manageStock: false, stockQuantity: '', stockStatus: 'instock',
    weight: '', dimensions: { length: '', width: '', height: '' },
    categories: [], tags: [], images: [], attributes: [], variations: [],
    reviewCount: 0, averageRating: '0', totalSales: 0,
    dateCreated: new Date().toISOString(), dateModified: new Date().toISOString(),
  }

  const [form, setForm] = useState(existing || blank)
  const [activeTab, setActiveTab] = useState('General')
  const [notice, setNotice] = useState(null)
  const [errors, setErrors] = useState({})
  const [tagInput, setTagInput] = useState('')
  const [imageUrlInput, setImageUrlInput] = useState(existing?.images?.[0]?.src || '')

  const navTo = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const setDim = (dim, value) => setForm(f => ({ ...f, dimensions: { ...f.dimensions, [dim]: value } }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Product name is required'
    if (form.regularPrice && isNaN(parseFloat(form.regularPrice))) errs.regularPrice = 'Must be a valid number'
    // Check SKU uniqueness
    if (form.sku && !isNew) {
      const dup = state.products.find(p => p.sku === form.sku && p.id !== productId)
      if (dup) errs.sku = 'SKU already exists on another product'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const save = (status) => {
    if (!validate()) return
    const now = new Date().toISOString()
    const updatedForm = {
      ...form,
      status: status || form.status,
      dateModified: now,
      price: form.salePrice && parseFloat(form.salePrice) < parseFloat(form.regularPrice) ? form.salePrice : form.regularPrice,
      onSale: !!(form.salePrice && parseFloat(form.salePrice) < parseFloat(form.regularPrice)),
      images: imageUrlInput ? [{ id: `img_${Date.now()}`, src: imageUrlInput, alt: form.name }] : form.images,
    }
    if (isNew) {
      const newId = `prod_${Date.now()}`
      dispatch({ type: 'ADD_PRODUCT', payload: { ...updatedForm, id: newId, dateCreated: now } })
      setNotice({ type: 'success', msg: 'Product published.' })
      setTimeout(() => navTo(`/products/${newId}`), 300)
    } else {
      dispatch({ type: 'UPDATE_PRODUCT', payload: { ...updatedForm, id: productId } })
      setNotice({ type: 'success', msg: 'Product updated.' })
    }
  }

  const addTag = (name) => {
    if (!name.trim()) return
    const existing = state.tags.find(t => t.name.toLowerCase() === name.toLowerCase())
    const tag = existing || { id: `tag_${Date.now()}`, name: name.trim(), slug: name.trim().toLowerCase().replace(/\s+/g, '-'), count: 0 }
    if (!form.tags.some(t => t.name === tag.name)) {
      setForm(f => ({ ...f, tags: [...f.tags, { id: tag.id, name: tag.name }] }))
    }
    setTagInput('')
  }

  const removeTag = (tagId) => setForm(f => ({ ...f, tags: f.tags.filter(t => t.id !== tagId) }))

  const toggleCategory = (cat) => {
    const has = form.categories.some(c => c.id === cat.id)
    if (has) setForm(f => ({ ...f, categories: f.categories.filter(c => c.id !== cat.id) }))
    else setForm(f => ({ ...f, categories: [...f.categories, { id: cat.id, name: cat.name }] }))
  }

  return (
    <div>
      {notice && (
        <div className={`notice notice-${notice.type}`}>
          <span>{notice.msg}</span>
          <button className="notice-dismiss" onClick={() => setNotice(null)}>×</button>
        </div>
      )}

      <div className="wp-page-title">
        <h1>{isNew ? 'Add New Product' : `Edit Product`}</h1>
        <button className="button" onClick={() => navTo('/products')}>
          <ChevronLeft size={14} /> Back to products
        </button>
      </div>

      <div className="wp-two-col">
        {/* Left column */}
        <div className="wp-col-main">
          {/* Product name */}
          <div className="postbox" style={{ marginBottom: 20 }}>
            <div className="postbox-body">
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Product name"
                className={errors.name ? 'error' : ''}
                style={{ width: '100%', fontSize: 24, fontWeight: 400, height: 40, border: '1px solid #dcdcde', padding: '0 12px' }}
              />
              {errors.name && <div style={{ color: '#d63638', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
            </div>
          </div>

          {/* Product data panel */}
          <div className="wc-product-data-panel">
            <div className="wc-product-tabs">
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #dcdcde' }}>
                <select value={form.type} onChange={e => set('type', e.target.value)} style={{ height: 28, width: '100%', fontSize: 12 }}>
                  <option value="simple">Simple product</option>
                  <option value="variable">Variable product</option>
                  <option value="grouped">Grouped product</option>
                  <option value="external">External/Affiliate product</option>
                </select>
              </div>
              {TABS.map(tab => (
                <button key={tab} className={`wc-product-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="wc-product-tab-content">
              {activeTab === 'General' && (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Regular price ($)</label>
                    <input type="text" value={form.regularPrice} onChange={e => set('regularPrice', e.target.value)} className={errors.regularPrice ? 'error' : ''} style={{ width: 150 }} />
                    {errors.regularPrice && <div style={{ color: '#d63638', fontSize: 12 }}>{errors.regularPrice}</div>}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Sale price ($)</label>
                    <input type="text" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} style={{ width: 150 }} />
                  </div>
                </div>
              )}
              {activeTab === 'Inventory' && (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>SKU</label>
                    <input type="text" value={form.sku} onChange={e => set('sku', e.target.value)} className={errors.sku ? 'error' : ''} style={{ width: 200 }} />
                    {errors.sku && <div style={{ color: '#d63638', fontSize: 12 }}>{errors.sku}</div>}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                      <input type="checkbox" checked={form.manageStock} onChange={e => set('manageStock', e.target.checked)} />
                      Manage stock?
                    </label>
                  </div>
                  {form.manageStock && (
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Stock quantity</label>
                      <input type="number" value={form.stockQuantity || ''} onChange={e => set('stockQuantity', parseInt(e.target.value) || 0)} style={{ width: 100 }} />
                    </div>
                  )}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Stock status</label>
                    <select value={form.stockStatus} onChange={e => set('stockStatus', e.target.value)} style={{ height: 30 }}>
                      <option value="instock">In stock</option>
                      <option value="outofstock">Out of stock</option>
                      <option value="onbackorder">On backorder</option>
                    </select>
                  </div>
                </div>
              )}
              {activeTab === 'Shipping' && (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Weight ({state.store.weightUnit})</label>
                    <input type="text" value={form.weight} onChange={e => set('weight', e.target.value)} style={{ width: 100 }} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Dimensions ({state.store.dimensionUnit})</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="text" value={form.dimensions.length} onChange={e => setDim('length', e.target.value)} placeholder="L" style={{ width: 70 }} />
                      <span>×</span>
                      <input type="text" value={form.dimensions.width} onChange={e => setDim('width', e.target.value)} placeholder="W" style={{ width: 70 }} />
                      <span>×</span>
                      <input type="text" value={form.dimensions.height} onChange={e => setDim('height', e.target.value)} placeholder="H" style={{ width: 70 }} />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'Linked Products' && (
                <div style={{ color: '#646970', fontSize: 13 }}>
                  <p>Upsells and cross-sells can be configured here.</p>
                </div>
              )}
              {activeTab === 'Attributes' && (
                <div style={{ color: '#646970', fontSize: 13 }}>
                  <p>Product attributes can be added here for variable products.</p>
                </div>
              )}
              {activeTab === 'Advanced' && (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Purchase note</label>
                    <textarea rows={3} style={{ width: '100%' }} value={form.purchaseNote || ''} onChange={e => set('purchaseNote', e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={state.store.enableReviews} readOnly />
                      Enable reviews
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Short description */}
          <div className="postbox">
            <div className="postbox-header">Product short description</div>
            <div className="postbox-body">
              <textarea rows={3} style={{ width: '100%' }} value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} placeholder="Short description..." />
            </div>
          </div>

          {/* Full description */}
          <div className="postbox">
            <div className="postbox-header">Product description</div>
            <div className="postbox-body">
              <textarea rows={8} style={{ width: '100%' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Full description..." />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="wp-col-side">
          {/* Publish */}
          <div className="postbox">
            <div className="postbox-header">Publish</div>
            <div className="postbox-body">
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontWeight: 600, fontSize: 13, marginRight: 8 }}>Status:</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} style={{ height: 30 }}>
                  <option value="publish">Published</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontWeight: 600, fontSize: 13, marginRight: 8 }}>Catalog visibility:</label>
                <select value={form.catalogVisibility} onChange={e => set('catalogVisibility', e.target.value)} style={{ height: 30 }}>
                  <option value="visible">Shop and search results</option>
                  <option value="catalog">Shop only</option>
                  <option value="search">Search results only</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="button-primary" onClick={() => save('publish')}>
                  {isNew ? 'Publish' : 'Update'}
                </button>
                {form.status !== 'draft' && (
                  <button className="button" onClick={() => save('draft')}>Save Draft</button>
                )}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="postbox">
            <div className="postbox-header">Product categories</div>
            <div className="postbox-body" style={{ maxHeight: 200, overflowY: 'auto' }}>
              {state.categories.map(cat => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, cursor: 'pointer', paddingLeft: cat.parent ? 16 : 0, fontSize: 13 }}>
                  <input type="checkbox" checked={form.categories.some(c => c.id === cat.id)} onChange={() => toggleCategory(cat)} />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="postbox">
            <div className="postbox-header">Product tags</div>
            <div className="postbox-body">
              <div style={{ marginBottom: 8 }}>
                {form.tags.map(t => (
                  <span key={t.id} className="tag-pill">
                    {t.name}
                    <button className="tag-pill-remove" onClick={() => removeTag(t.id)}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag(tagInput)}
                  placeholder="Add tag..."
                  style={{ flex: 1 }}
                />
                <button className="button" style={{ height: 30, padding: '0 8px', fontSize: 12 }} onClick={() => addTag(tagInput)}>Add</button>
              </div>
              <div style={{ marginTop: 6 }}>
                {state.tags.filter(t => !form.tags.some(ft => ft.id === t.id)).map(t => (
                  <button key={t.id} className="button-link" style={{ fontSize: 12, marginRight: 6, color: '#646970' }} onClick={() => addTag(t.name)}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product image */}
          <div className="postbox">
            <div className="postbox-header">Product image</div>
            <div className="postbox-body">
              {imageUrlInput ? (
                <div style={{ marginBottom: 8 }}>
                  <img src={imageUrlInput} alt="" style={{ width: '100%', maxHeight: 150, objectFit: 'cover', border: '1px solid #dcdcde' }} />
                </div>
              ) : (
                <div style={{ border: '1px dashed #c3c4c7', padding: 20, textAlign: 'center', marginBottom: 8, color: '#646970', fontSize: 12 }}>
                  No product image
                </div>
              )}
              <input type="url" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} placeholder="Image URL (e.g. https://placehold.co/...)" style={{ width: '100%', fontSize: 12 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
