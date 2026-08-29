import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const SERVICES = ['USPS Priority Mail', 'USPS First Class', 'UPS Ground', 'FedEx Home Delivery'];
const HANDLING_TIMES = [1, 2, 3, 4, 5];

export default function ShippingSettings() {
  const { state, dispatch, showToast } = useApp();
  const [form, setForm] = useState(null);

  if (!state) return null;
  const { settings } = state;
  const ss = settings.shippingSettings;

  const currentForm = form || {
    defaultShippingService: ss.defaultShippingService,
    handlingTime: ss.handlingTime,
    returnAddress: { ...ss.returnAddress }
  };

  const setField = (k, v) => setForm(f => ({ ...currentForm, ...f, [k]: v }));
  const setAddr = (k, v) => setForm(f => ({ ...currentForm, ...f, returnAddress: { ...(f?.returnAddress || ss.returnAddress), [k]: v } }));

  const save = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { shippingSettings: currentForm } });
    setForm(null);
    showToast('Shipping settings saved', 'success');
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>Shipping Settings</h1>
      <div className="card">
        <div className="card-title">Default Shipping Settings</div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Default Shipping Service</label>
          <select className="form-select" value={currentForm.defaultShippingService} onChange={e => setField('defaultShippingService', e.target.value)} style={{ width: 260 }}>
            {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Handling Time</label>
          <select className="form-select" value={currentForm.handlingTime} onChange={e => setField('handlingTime', parseInt(e.target.value))} style={{ width: 120 }}>
            {HANDLING_TIMES.map(t => <option key={t} value={t}>{t} day{t > 1 ? 's' : ''}</option>)}
          </select>
        </div>

        <div className="card-title">Return Address</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" style={{ width: '100%' }} value={currentForm.returnAddress.name || ''} onChange={e => setAddr('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Address Line 1</label>
            <input className="form-input" style={{ width: '100%' }} value={currentForm.returnAddress.line1 || ''} onChange={e => setAddr('line1', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">City</label>
            <input className="form-input" style={{ width: '100%' }} value={currentForm.returnAddress.city || ''} onChange={e => setAddr('city', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <input className="form-input" style={{ width: '100%' }} value={currentForm.returnAddress.state || ''} onChange={e => setAddr('state', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Postal Code</label>
            <input className="form-input" style={{ width: '100%' }} value={currentForm.returnAddress.postalCode || ''} onChange={e => setAddr('postalCode', e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button className="btn-primary" onClick={save}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
