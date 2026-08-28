import React, { useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getSessionId } from '../utils/dataManager';

export default function BrandSettings() {
  const { state, updateState } = useAppContext();
  const brand = state.account.brandSettings || { primaryColor: '#000000', secondaryColor: '#00D68F', accentColor: '#4E7CFF', fontFamily: 'Sans-serif', logoUrl: '' };

  const [colors, setColors] = useState({
    primary: brand.primaryColor,
    secondary: brand.secondaryColor,
    accent: brand.accentColor
  });
  const [fontFamily, setFontFamily] = useState(brand.fontFamily);
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const handleSave = () => {
    updateState(prev => ({
      ...prev,
      account: {
        ...prev.account,
        brandSettings: {
          ...prev.account.brandSettings,
          primaryColor: colors.primary,
          secondaryColor: colors.secondary,
          accentColor: colors.accent,
          fontFamily,
          logoUrl
        }
      }
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleColorChange = (key, value) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const sid = getSessionId();
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/upload${sid ? `?sid=${encodeURIComponent(sid)}` : ''}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      const uploaded = data.files?.[0];
      if (uploaded?.url) {
        setLogoUrl(uploaded.url);
        updateState(prev => ({
          ...prev,
          account: {
            ...prev.account,
            brandSettings: { ...prev.account.brandSettings, logoUrl: uploaded.url }
          }
        }));
      }
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    updateState(prev => ({
      ...prev,
      account: {
        ...prev.account,
        brandSettings: { ...prev.account.brandSettings, logoUrl: '' }
      }
    }));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Images & Brand</h1>
      </div>

      <div className="card">
        <div className="card-title">Brand Colors</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { label: 'Primary Color', key: 'primary' },
            { label: 'Secondary Color', key: 'secondary' },
            { label: 'Accent Color', key: 'accent' }
          ].map(c => (
            <div key={c.key} className="form-group">
              <label>{c.label}</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={colors[c.key]}
                  onChange={e => handleColorChange(c.key, e.target.value)}
                  style={{ width: 40, height: 40, border: '1px solid var(--border-color)', borderRadius: 6, padding: 2, cursor: 'pointer', background: 'var(--bg-input)' }}
                />
                <input
                  type="text"
                  value={colors[c.key]}
                  onChange={e => handleColorChange(c.key, e.target.value)}
                  style={{ width: 120 }}
                />
              </div>
              <div style={{ marginTop: 8, height: 32, borderRadius: 6, background: colors[c.key], border: '1px solid var(--border-color)' }}></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Brand Assets</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="form-group">
            <label>Logo</label>
            <div style={{ width: '100%', height: 120, border: '2px dashed var(--border-color)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-green)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
              {logoUrl ? <img src={logoUrl} alt="Brand logo" style={{ maxWidth: '90%', maxHeight: 90, objectFit: 'contain' }} /> : uploading ? 'Uploading logo...' : 'Click to upload logo'}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
            {logoUrl && <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={handleRemoveLogo}>Remove logo</button>}
          </div>
          <div className="form-group">
            <label>Font Family</label>
            <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
              <option>Sans-serif</option>
              <option>Serif</option>
              <option>Monospace</option>
              <option>Georgia</option>
              <option>Helvetica</option>
              <option>Inter</option>
            </select>
            <div style={{ marginTop: 12, padding: 16, background: 'var(--bg-tertiary)', borderRadius: 8, fontFamily: fontFamily === 'Sans-serif' ? 'sans-serif' : fontFamily.toLowerCase() }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Preview text</div>
              <div style={{ color: 'var(--text-muted)' }}>The quick brown fox jumps over the lazy dog.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Preview</div>
        <div style={{ maxWidth: 400, margin: '0 auto', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <div style={{ background: colors.primary, color: '#fff', padding: 24, textAlign: 'center', fontFamily: fontFamily === 'Sans-serif' ? 'sans-serif' : fontFamily.toLowerCase() }}>
            {logoUrl && <img src={logoUrl} alt="Brand logo preview" style={{ maxWidth: 140, maxHeight: 56, objectFit: 'contain', marginBottom: 12 }} />}
            <div style={{ fontSize: 20, fontWeight: 700 }}>Acme Store</div>
          </div>
          <div style={{ padding: 24, background: 'var(--bg-tertiary)', fontFamily: fontFamily === 'Sans-serif' ? 'sans-serif' : fontFamily.toLowerCase() }}>
            <div style={{ marginBottom: 12, color: 'var(--text-primary)' }}>Preview of your brand styles</div>
            <button style={{ background: colors.secondary, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', marginRight: 8 }}>Primary CTA</button>
            <button style={{ background: 'transparent', color: colors.accent, border: `1px solid ${colors.accent}`, padding: '10px 24px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Secondary CTA</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        {saved && <div className="toast" style={{ position: 'static', animation: 'none' }}>Saved successfully!</div>}
      </div>
    </div>
  );
}
