
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Save, CreditCard, Truck, Globe, Percent, Mail, MapPin, Store, X } from 'lucide-react';

export default function Settings() {
  const { state, updateState } = useStore();
  // Initialize with correct field names from seed data
  const [settings, setSettings] = useState({
    storeName: state.settings?.storeName || '',
    storeEmail: state.settings?.storeEmail || '',
    senderEmail: state.settings?.senderEmail || '',
    storePhone: state.settings?.storePhone || '',
    currency: state.settings?.currency || 'USD',
    timezone: state.settings?.timezone || '(GMT-08:00) Pacific Time',
    weightUnit: state.settings?.weightUnit || 'lb',
    taxIncluded: state.settings?.taxIncluded !== undefined ? state.settings.taxIncluded : true,
    paypalEnabled: state.settings?.paypalEnabled || false,
  });
  // Address lives on state.store.address
  const [address, setAddress] = useState({ ...(state.store?.address || {}) });
  const [saved, setSaved] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [paypalActivated, setPaypalActivated] = useState(state.settings?.paypalEnabled || false);
  const [showShippingEditor, setShowShippingEditor] = useState(false);
  const [shippingRates, setShippingRates] = useState(state.shippingRates || {
    domestic: '5.99',
    international: 'calculated',
    freeThreshold: '75.00',
  });

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleAddressChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // Save settings (with correct field names)
    updateState('settings', { ...settings, paypalEnabled: paypalActivated, taxIncluded: settings.taxIncluded });
    // Save address back to store
    updateState('store', { ...state.store, address });
    updateState('shippingRates', shippingRates);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleActivatePaypal = () => {
    setPaypalActivated(true);
    setSaved(false);
  };

  const notificationTemplates = [
    { name: 'Order confirmation', subject: 'Your order from Evergreen Goods', body: 'Thank you for your purchase! Your order #{{order_number}} has been confirmed.' },
    { name: 'Shipping confirmation', subject: 'Your order is on its way', body: 'Good news! Your order #{{order_number}} has shipped.' },
    { name: 'Shipping update', subject: 'Shipping update for your order', body: 'Your package for order #{{order_number}} has an update.' },
    { name: 'Delivery confirmation', subject: 'Your order has been delivered', body: 'Your order #{{order_number}} has been delivered.' },
    { name: 'Order refund', subject: 'Refund processed for your order', body: 'A refund has been issued for your order #{{order_number}}.' },
    { name: 'Customer account welcome', subject: 'Welcome to Evergreen Goods', body: 'Your account has been created. You can now log in to track your orders.' },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Settings</h1>
        <button onClick={handleSave} className="btn-primary text-[13px]">
          <Save size={16} /> Save
        </button>
      </div>

      {saved && (
        <div className="p-3 rounded-lg text-[13px] font-medium" style={{ background: '#aee9d1', color: '#047b5d' }}>
          Settings saved successfully
        </div>
      )}

      {/* Store details */}
      <div className="card space-y-4">
        <h3 className="card-title flex items-center gap-2"><Store size={16} /> Store details</h3>
        <div>
          <label className="block text-[13px] font-medium text-[#303030] mb-1">Store name</label>
          <input
            type="text"
            className="w-full text-[13px]"
            value={settings.storeName}
            onChange={e => handleChange('storeName', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#303030] mb-1">Store contact email</label>
            <input
              type="email"
              className="w-full text-[13px]"
              value={settings.storeEmail}
              onChange={e => handleChange('storeEmail', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#303030] mb-1">Store phone</label>
            <input
              type="tel"
              className="w-full text-[13px]"
              value={settings.storePhone}
              onChange={e => handleChange('storePhone', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#303030] mb-1">Sender email</label>
          <input
            type="email"
            className="w-full text-[13px]"
            value={settings.senderEmail}
            onChange={e => handleChange('senderEmail', e.target.value)}
            placeholder="noreply@example.com"
          />
        </div>
      </div>

      {/* Store address */}
      <div className="card space-y-4">
        <h3 className="card-title flex items-center gap-2"><MapPin size={16} /> Store address</h3>
        <div>
          <label className="block text-[13px] font-medium text-[#303030] mb-1">Address</label>
          <input
            type="text"
            className="w-full text-[13px]"
            value={address.address1 || ''}
            onChange={e => handleAddressChange('address1', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#303030] mb-1">Apartment, suite, etc.</label>
          <input
            type="text"
            className="w-full text-[13px]"
            value={address.address2 || ''}
            onChange={e => handleAddressChange('address2', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#303030] mb-1">City</label>
            <input
              type="text"
              className="w-full text-[13px]"
              value={address.city || ''}
              onChange={e => handleAddressChange('city', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#303030] mb-1">State/Province</label>
            <input
              type="text"
              className="w-full text-[13px]"
              value={address.province || ''}
              onChange={e => handleAddressChange('province', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#303030] mb-1">ZIP/Postal code</label>
            <input
              type="text"
              className="w-full text-[13px]"
              value={address.zip || ''}
              onChange={e => handleAddressChange('zip', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#303030] mb-1">Country</label>
          <input
            type="text"
            className="w-full text-[13px]"
            value={address.country || ''}
            onChange={e => handleAddressChange('country', e.target.value)}
          />
        </div>
      </div>

      {/* Store currency and locale */}
      <div className="card space-y-4">
        <h3 className="card-title flex items-center gap-2"><Globe size={16} /> Standards and formats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#303030] mb-1">Store currency</label>
            <select
              className="w-full text-[13px]"
              value={settings.currency}
              onChange={e => handleChange('currency', e.target.value)}
            >
              <option value="USD">US Dollar (USD $)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
              <option value="CAD">Canadian Dollar (CAD)</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#303030] mb-1">Timezone</label>
            <select
              className="w-full text-[13px]"
              value={settings.timezone}
              onChange={e => handleChange('timezone', e.target.value)}
            >
              <option value="(GMT-05:00) Eastern Time">(GMT-05:00) Eastern Time</option>
              <option value="(GMT-06:00) Central Time">(GMT-06:00) Central Time</option>
              <option value="(GMT-07:00) Mountain Time">(GMT-07:00) Mountain Time</option>
              <option value="(GMT-08:00) Pacific Time">(GMT-08:00) Pacific Time</option>
              <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#303030] mb-1">Weight unit</label>
          <select
            className="w-full text-[13px] max-w-[200px]"
            value={settings.weightUnit}
            onChange={e => handleChange('weightUnit', e.target.value)}
          >
            <option value="lb">Pounds (lb)</option>
            <option value="oz">Ounces (oz)</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="g">Grams (g)</option>
          </select>
        </div>
      </div>

      {/* Payments */}
      <div className="card space-y-4">
        <h3 className="card-title flex items-center gap-2"><CreditCard size={16} /> Payments</h3>
        <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: '#e3e3e3', background: '#f9fafb' }}>
          <div>
            <div className="text-[13px] font-medium text-[#303030]">Xhopify Payments</div>
            <div className="text-[12px] text-[#616161]">Accept all major credit and debit cards</div>
          </div>
          <span className="badge badge-success">Active</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: '#e3e3e3', background: '#f9fafb' }}>
          <div>
            <div className="text-[13px] font-medium text-[#303030]">PayPal</div>
            <div className="text-[12px] text-[#616161]">PayPal express checkout</div>
          </div>
          {paypalActivated ? (
            <span className="badge badge-success">Active</span>
          ) : (
            <button onClick={handleActivatePaypal} className="btn-secondary text-[13px]">Activate</button>
          )}
        </div>
      </div>

      {/* Shipping */}
      <div className="card space-y-4">
        <h3 className="card-title flex items-center gap-2"><Truck size={16} /> Shipping and delivery</h3>
        <div className="p-3 rounded-lg border" style={{ borderColor: '#e3e3e3', background: '#f9fafb' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] font-medium text-[#303030]">General shipping rates</span>
            <button
              className="btn-plain text-[13px]"
              onClick={() => setShowShippingEditor(true)}
            >
              Edit
            </button>
          </div>
          <div className="text-[12px] text-[#616161] space-y-0.5">
            <p>Domestic: Flat rate ${shippingRates.domestic}</p>
            <p>International: {shippingRates.international === 'calculated' ? 'Calculated at checkout' : `Flat rate $${shippingRates.international}`}</p>
          </div>
        </div>
        <div className="p-3 rounded-lg border" style={{ borderColor: '#e3e3e3', background: '#f9fafb' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] font-medium text-[#303030]">Free shipping</span>
          </div>
          <div className="text-[12px] text-[#616161]">
            <p>Orders over ${shippingRates.freeThreshold} qualify for free shipping</p>
          </div>
        </div>
      </div>

      {/* Taxes */}
      <div className="card space-y-4">
        <h3 className="card-title flex items-center gap-2"><Percent size={16} /> Taxes and duties</h3>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="tax-include"
            checked={settings.taxIncluded}
            onChange={e => handleChange('taxIncluded', e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: '#008060' }}
          />
          <label htmlFor="tax-include" className="text-[13px] text-[#303030]">Charge tax on this product</label>
        </div>
        <div className="p-3 rounded-lg border" style={{ borderColor: '#e3e3e3', background: '#f9fafb' }}>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[13px] font-medium text-[#303030]">United States</span>
              <div className="text-[12px] text-[#616161]">Federal and state taxes</div>
            </div>
            <span className="badge badge-success">Collecting</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card space-y-4">
        <h3 className="card-title flex items-center gap-2"><Mail size={16} /> Notifications</h3>
        <p className="text-[13px] text-[#616161]">Manage the email templates sent to your customers.</p>
        <div className="space-y-2">
          {notificationTemplates.map(template => (
            <div key={template.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f9fafb]">
              <span className="text-[13px] text-[#303030]">{template.name}</span>
              <button
                className="btn-plain text-[13px]"
                onClick={() => setPreviewTemplate(template)}
              >
                Preview
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-modal">
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#e3e3e3' }}>
              <h3 className="text-[16px] font-bold text-[#303030]">Preview: {previewTemplate.name}</h3>
              <button onClick={() => setPreviewTemplate(null)} className="p-1 hover:bg-[#f1f1f1] rounded">
                <X size={20} className="text-[#616161]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-[12px] text-[#616161] font-medium mb-1">Subject</div>
                <div className="text-[13px] font-medium text-[#303030]">{previewTemplate.subject}</div>
              </div>
              <div className="border-t pt-4" style={{ borderColor: '#e3e3e3' }}>
                <div className="text-[12px] text-[#616161] font-medium mb-2">Body preview</div>
                <div
                  className="text-[13px] text-[#303030] p-4 rounded-lg"
                  style={{ background: '#f9fafb', border: '1px solid #e3e3e3' }}
                >
                  <p className="font-medium mb-2" style={{ color: '#008060' }}>Evergreen Goods</p>
                  <p>{previewTemplate.body}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end" style={{ borderColor: '#e3e3e3' }}>
              <button onClick={() => setPreviewTemplate(null)} className="btn-secondary text-[13px]">Close</button>
            </div>
          </div>
        </div>
      )}

      {showShippingEditor && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowShippingEditor(false)}>
          <div className="bg-white rounded-xl shadow-modal w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#e3e3e3' }}>
              <h2 className="text-[16px] font-semibold text-[#303030]">Shipping rates</h2>
              <button onClick={() => setShowShippingEditor(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Domestic flat rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]">$</span>
                  <input className="w-full pl-7 text-[13px]" value={shippingRates.domestic} onChange={e => setShippingRates(prev => ({ ...prev, domestic: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">International rate</label>
                <select className="w-full text-[13px]" value={shippingRates.international} onChange={e => setShippingRates(prev => ({ ...prev, international: e.target.value }))}>
                  <option value="calculated">Calculated at checkout</option>
                  <option value="14.99">$14.99 flat rate</option>
                  <option value="24.99">$24.99 flat rate</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#303030] mb-1">Free shipping threshold</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]">$</span>
                  <input className="w-full pl-7 text-[13px]" value={shippingRates.freeThreshold} onChange={e => setShippingRates(prev => ({ ...prev, freeThreshold: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: '#e3e3e3' }}>
              <button className="btn-secondary text-[13px]" onClick={() => setShowShippingEditor(false)}>Cancel</button>
              <button className="btn-primary text-[13px]" onClick={() => { updateState('shippingRates', shippingRates); setShowShippingEditor(false); setSaved(true); setTimeout(() => setSaved(false), 3000); }}>Save rates</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
