import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const TABS = ['Product Identity', 'Vital Info', 'Description', 'Images', 'Keywords', 'More Details'];

function genId() { return 'PROD_' + Math.random().toString(36).slice(2, 8).toUpperCase(); }
function genSku() { return 'EHG-NEW-' + Math.random().toString(36).slice(2, 6).toUpperCase(); }
function genAsin() { return 'B0' + Math.random().toString(36).slice(2, 9).toUpperCase(); }

function Tab({ tabs, activeTab, onChange, errors }) {
  return (
    <div className="tab-bar" style={{ marginBottom: 20 }}>
      {tabs.map((t, i) => (
        <div key={t} className={`tab-item ${activeTab === i ? 'active' : ''}`} onClick={() => onChange(i)} style={{ position: 'relative' }}>
          {t}
          {errors[i] && <span style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, background: '#d13212', borderRadius: '50%' }} />}
        </div>
      ))}
    </div>
  );
}

export default function ProductForm({ mode = 'add' }) {
  const { state, dispatch, showToast } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const imageInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const existing = mode === 'edit' ? state?.products?.find(p => p.id === id) : null;

  const [form, setForm] = useState(() => ({
    productIdType: 'ASIN',
    productId: existing?.asin || '',
    title: existing?.title || '',
    brand: existing?.brand || 'Evergreen Home Goods',
    manufacturer: existing?.brand || '',
    category: existing?.category || '',
    condition: existing?.condition || 'New',
    bulletPoints: existing?.bulletPoints || ['', '', '', '', ''],
    description: existing?.description || '',
    mainImage: existing?.imageUrl || '',
    keywords: existing?.keywords || '',
    subjectMatter: '',
    targetAudience: '',
    price: existing?.price?.toString() || '',
    quantity: existing?.availableQuantity?.toString() || '',
    sku: existing?.sku || genSku(),
    fulfillmentChannel: existing?.fulfillmentChannel || 'FBA',
    weight: existing?.weight || '',
    imageFileName: existing?.imageFileName || '',
    dimL: '', dimW: '', dimH: ''
  }));

  if (!state) return null;

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setBullet = (i, v) => setForm(f => ({ ...f, bulletPoints: f.bulletPoints.map((b, bi) => bi === i ? v : b) }));

  const handleImageFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({
        ...f,
        mainImage: reader.result,
        imageFileName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Required';
    if (!form.brand.trim()) errs.brand = 'Required';
    if (!form.price || parseFloat(form.price) <= 0) errs.price = 'Must be > 0';
    if (!form.quantity || parseInt(form.quantity) < 0) errs.quantity = 'Must be >= 0';
    return errs;
  };

  const getTabErrors = (errs) => {
    const tabErrs = {};
    if (errs.title || errs.brand) tabErrs[1] = true;
    if (errs.price || errs.quantity) tabErrs[5] = true;
    return tabErrs;
  };

  const handleSave = (isDraft = false) => {
    setSubmitted(true);
    if (!isDraft) {
      const errs = validate();
      if (Object.keys(errs).length > 0) {
        const tabErrs = getTabErrors(errs);
        const firstErrTab = Object.keys(tabErrs).map(Number).sort()[0];
        if (firstErrTab !== undefined) setActiveTab(firstErrTab);
        return;
      }
    }
    const productData = {
      id: mode === 'edit' ? id : genId(),
      asin: form.productId || genAsin(),
      sku: form.sku,
      title: form.title,
      brand: form.brand,
      category: form.category || 'Home & Kitchen',
      imageUrl: form.mainImage || '',
      imageFileName: form.imageFileName || '',
      price: parseFloat(form.price) || 0,
      salePrice: null,
      costOfGoods: 0,
      fulfillmentChannel: form.fulfillmentChannel,
      status: isDraft ? 'Incomplete' : 'Active',
      condition: form.condition,
      availableQuantity: parseInt(form.quantity) || 0,
      reservedQuantity: 0,
      inboundQuantity: 0,
      buyBoxOwner: false,
      buyBoxPrice: parseFloat(form.price) || 0,
      lowestPrice: parseFloat(form.price) || 0,
      rating: 0,
      reviewCount: 0,
      bulletPoints: form.bulletPoints.filter(b => b.trim()),
      description: form.description,
      keywords: form.keywords,
      weight: form.weight,
      dimensions: form.dimL ? `${form.dimL} x ${form.dimW} x ${form.dimH} inches` : '',
      dateCreated: existing?.dateCreated || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    if (mode === 'edit') {
      dispatch({ type: 'UPDATE_PRODUCT', payload: productData });
      showToast('Product updated successfully', 'success');
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: productData });
      showToast('Product added successfully', 'success');
    }
    navigate('/inventory');
  };

  const errs = submitted ? validate() : {};
  const tabErrs = getTabErrors(errs);
  const titleText = mode === 'edit' ? `Edit Listing: ${existing?.title?.slice(0, 50) || 'Product'}` : 'Add a Product';

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 20px' }}>{titleText}</h1>
      <Tab tabs={TABS} activeTab={activeTab} onChange={setActiveTab} errors={tabErrs} />

      <div className="card">
        {/* Tab 0: Product Identity */}
        {activeTab === 0 && (
          <div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Product ID Type</label>
              <select className="form-select" value={form.productIdType} onChange={e => setField('productIdType', e.target.value)}>
                {['UPC', 'EAN', 'ISBN', 'ASIN'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{form.productIdType}</label>
              <input className="form-input" value={form.productId} onChange={e => setField('productId', e.target.value)} placeholder={`Enter ${form.productIdType}`} style={{ width: 300 }} />
            </div>
          </div>
        )}

        {/* Tab 1: Vital Info */}
        {activeTab === 1 && (
          <div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label required">Product Name</label>
              <input className="form-input" style={{ width: '100%', borderColor: errs.title ? '#d13212' : '' }} maxLength={200} value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Enter product name (max 200 chars)" />
              {errs.title && <span className="form-error">{errs.title}</span>}
              <span style={{ fontSize: 11, color: '#555' }}>{form.title.length}/200</span>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label required">Brand</label>
                <input className="form-input" style={{ width: '100%', borderColor: errs.brand ? '#d13212' : '' }} value={form.brand} onChange={e => setField('brand', e.target.value)} />
                {errs.brand && <span className="form-error">{errs.brand}</span>}
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Manufacturer</label>
                <input className="form-input" style={{ width: '100%' }} value={form.manufacturer} onChange={e => setField('manufacturer', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Category</label>
                <input className="form-input" style={{ width: '100%' }} value={form.category} onChange={e => setField('category', e.target.value)} placeholder="e.g. Home & Kitchen" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Condition</label>
                <select className="form-select" style={{ width: '100%' }} value={form.condition} onChange={e => setField('condition', e.target.value)}>
                  {['New', 'Refurbished', 'Used - Like New', 'Used - Good', 'Used - Acceptable'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Description */}
        {activeTab === 2 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>Key Features (Bullet Points)</label>
              {form.bulletPoints.map((b, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 2 }}>Key Feature {i+1}</label>
                  <input className="form-input" style={{ width: '100%' }} maxLength={256} value={b} onChange={e => setBullet(i, e.target.value)} placeholder={`Key feature ${i+1} (max 256 chars)`} />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Product Description</label>
              <textarea className="form-textarea" style={{ width: '100%', height: 120 }} maxLength={2000} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Enter product description (max 2000 chars)" />
              <span style={{ fontSize: 11, color: '#555' }}>{form.description.length}/2000</span>
            </div>
          </div>
        )}

        {/* Tab 3: Images */}
        {activeTab === 3 && (
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: 12 }}>Main Image</label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg"
              style={{ display: 'none' }}
              onChange={e => handleImageFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                handleImageFile(e.dataTransfer.files?.[0]);
              }}
              style={{ width: 220, minHeight: 220, border: '2px dashed #ddd', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: form.mainImage ? '#f8fbfb' : 'white', marginBottom: 12, padding: 8 }}
            >
              {form.mainImage ? (
                <>
                  <img src={form.mainImage} alt="Main product preview" style={{ maxWidth: 180, maxHeight: 160, objectFit: 'contain', marginBottom: 10 }} />
                  <span style={{ color: '#007185', fontSize: 13, fontWeight: 700 }}>{form.imageFileName || 'Main image selected'}</span>
                  <span style={{ color: '#555', fontSize: 11, marginTop: 4 }}>Click to replace image</span>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                  <span style={{ fontSize: 12, color: '#555', textAlign: 'center', padding: '0 16px' }}>Drag image here or click to upload</span>
                </>
              )}
            </button>
            {form.mainImage && (
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setField('mainImage', '');
                  setField('imageFileName', '');
                  if (imageInputRef.current) imageInputRef.current.value = '';
                }}
                style={{ marginBottom: 12 }}
              >
                Remove image
              </button>
            )}
            <div style={{ fontSize: 11, color: '#555' }}>Image requirements: JPEG or PNG, minimum 1000x1000px, white background for main image.</div>
          </div>
        )}

        {/* Tab 4: Keywords */}
        {activeTab === 4 && (
          <div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Search Terms</label>
              <textarea className="form-textarea" style={{ width: '100%', height: 80 }} maxLength={250} value={form.keywords} onChange={e => setField('keywords', e.target.value)} placeholder="Enter search terms, comma-separated (max 250 chars)" />
              <span style={{ fontSize: 11, color: '#555' }}>{form.keywords.length}/250</span>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Subject Matter</label>
                <input className="form-input" style={{ width: '100%' }} value={form.subjectMatter} onChange={e => setField('subjectMatter', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Target Audience</label>
                <input className="form-input" style={{ width: '100%' }} value={form.targetAudience} onChange={e => setField('targetAudience', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: More Details */}
        {activeTab === 5 && (
          <div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Price</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 16 }}>$</span>
                  <input type="number" className="form-input" step="0.01" min="0.01" value={form.price} onChange={e => setField('price', e.target.value)} style={{ width: 100, borderColor: errs.price ? '#d13212' : '' }} />
                </div>
                {errs.price && <span className="form-error">{errs.price}</span>}
              </div>
              <div className="form-group">
                <label className="form-label required">Quantity</label>
                <input type="number" className="form-input" min="0" step="1" value={form.quantity} onChange={e => setField('quantity', e.target.value)} style={{ width: 100, borderColor: errs.quantity ? '#d13212' : '' }} />
                {errs.quantity && <span className="form-error">{errs.quantity}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input className="form-input" value={form.sku} onChange={e => setField('sku', e.target.value)} style={{ width: 160 }} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Fulfillment Channel</label>
              <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                {['FBA', 'FBM'].map(ch => (
                  <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="radio" name="fulfillment" value={ch} checked={form.fulfillmentChannel === ch} onChange={() => setField('fulfillmentChannel', ch)} />
                    {ch === 'FBA' ? 'Fulfilled by Amazon (FBA)' : 'Fulfilled by Merchant (FBM)'}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Weight</label>
                <input className="form-input" value={form.weight} onChange={e => setField('weight', e.target.value)} placeholder="e.g. 10 oz" style={{ width: 120 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Dimensions (L x W x H inches)</label>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <input type="number" className="form-input" placeholder="L" value={form.dimL} onChange={e => setField('dimL', e.target.value)} style={{ width: 60 }} />
                  <span>x</span>
                  <input type="number" className="form-input" placeholder="W" value={form.dimW} onChange={e => setField('dimW', e.target.value)} style={{ width: 60 }} />
                  <span>x</span>
                  <input type="number" className="form-input" placeholder="H" value={form.dimH} onChange={e => setField('dimH', e.target.value)} style={{ width: 60 }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '12px 0' }}>
        <button className="btn-secondary" onClick={() => navigate('/inventory')}>Cancel</button>
        <button className="btn-secondary" onClick={() => handleSave(true)}>Save as Draft</button>
        <button className="btn-primary" onClick={() => handleSave(false)}>{mode === 'edit' ? 'Save Changes' : 'Submit Listing'}</button>
      </div>
    </div>
  );
}
