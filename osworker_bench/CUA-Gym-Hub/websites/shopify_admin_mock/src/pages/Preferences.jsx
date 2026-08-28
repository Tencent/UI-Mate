
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Save } from 'lucide-react';

export default function Preferences() {
  const { state, updateState } = useStore();
  const [prefs, setPrefs] = useState({
    title: state.settings?.onlineStoreTitle || state.store?.name || '',
    metaDescription: state.settings?.metaDescription || '',
    googleAnalyticsId: state.settings?.googleAnalyticsId || '',
    facebookPixelId: state.settings?.facebookPixelId || '',
    passwordEnabled: state.settings?.passwordEnabled || false,
    passwordMessage: state.settings?.passwordMessage || '',
    checkoutStyle: state.settings?.checkoutStyle || 'default',
    orderStatusPage: state.settings?.orderStatusPage || '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateState('settings', { ...state.settings, ...prefs, onlineStoreTitle: prefs.title });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Preferences</h1>
        <button onClick={handleSave} className="btn-primary text-[13px]">
          <Save size={16} /> Save
        </button>
      </div>

      {saved && (
        <div className="p-3 rounded-lg text-[13px] font-medium" style={{ background: '#aee9d1', color: '#047b5d' }}>
          Preferences saved successfully
        </div>
      )}

      {/* Title & Meta */}
      <div className="card space-y-4">
        <h3 className="card-title">Title and meta description</h3>
        <p className="text-[13px] text-[#616161]">The title and meta description help define how your store shows up on search engines.</p>
        <div>
          <label className="block text-[13px] font-medium text-[#303030] mb-1">Homepage title</label>
          <input
            type="text"
            className="w-full text-[13px]"
            value={prefs.title}
            onChange={e => setPrefs(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Evergreen Goods — Sustainable Living"
          />
          <p className="text-[12px] text-[#616161] mt-1">{prefs.title.length} of 70 characters used</p>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#303030] mb-1">Meta description</label>
          <textarea
            className="w-full text-[13px]"
            rows={3}
            value={prefs.metaDescription}
            onChange={e => setPrefs(p => ({ ...p, metaDescription: e.target.value }))}
            placeholder="Describe your store for search engines..."
          />
          <p className="text-[12px] text-[#616161] mt-1">{prefs.metaDescription.length} of 320 characters used</p>
        </div>
      </div>

      {/* Google Analytics */}
      <div className="card space-y-4">
        <h3 className="card-title">Google Analytics</h3>
        <p className="text-[13px] text-[#616161]">Add your Google Analytics 4 measurement ID to track website traffic and conversions.</p>
        <div>
          <label className="block text-[13px] font-medium text-[#303030] mb-1">Measurement ID</label>
          <input
            type="text"
            className="w-full text-[13px]"
            value={prefs.googleAnalyticsId}
            onChange={e => setPrefs(p => ({ ...p, googleAnalyticsId: e.target.value }))}
            placeholder="G-XXXXXXXXXX"
          />
        </div>
      </div>

      {/* Facebook Pixel */}
      <div className="card space-y-4">
        <h3 className="card-title">Facebook &amp; Instagram</h3>
        <p className="text-[13px] text-[#616161]">Add your Meta Pixel ID to track visitors and optimize ad campaigns.</p>
        <div>
          <label className="block text-[13px] font-medium text-[#303030] mb-1">Pixel ID</label>
          <input
            type="text"
            className="w-full text-[13px]"
            value={prefs.facebookPixelId}
            onChange={e => setPrefs(p => ({ ...p, facebookPixelId: e.target.value }))}
            placeholder="XXXXXXXXXXXXXXXX"
          />
        </div>
      </div>

      {/* Password protection */}
      <div className="card space-y-4">
        <h3 className="card-title">Password protection</h3>
        <p className="text-[13px] text-[#616161]">Restrict access to your store while you prepare to launch.</p>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="password-enabled"
            checked={prefs.passwordEnabled}
            onChange={e => setPrefs(p => ({ ...p, passwordEnabled: e.target.checked }))}
            className="w-4 h-4"
            style={{ accentColor: '#008060' }}
          />
          <label htmlFor="password-enabled" className="text-[13px] text-[#303030]">Restrict access to visitors with the password</label>
        </div>
        {prefs.passwordEnabled && (
          <div>
            <label className="block text-[13px] font-medium text-[#303030] mb-1">Message for visitors</label>
            <textarea
              className="w-full text-[13px]"
              rows={2}
              value={prefs.passwordMessage}
              onChange={e => setPrefs(p => ({ ...p, passwordMessage: e.target.value }))}
              placeholder="Opening soon — enter the password to preview our store."
            />
          </div>
        )}
      </div>
    </div>
  );
}
