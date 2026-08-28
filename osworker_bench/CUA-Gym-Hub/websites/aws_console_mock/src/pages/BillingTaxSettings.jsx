import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';

export default function BillingTaxSettings() {
  const { state, dispatch, addFlash } = useStore();
  const taxSettings = state.billing?.taxSettings || {};
  const addr = taxSettings.address || {};

  const [legalName, setLegalName] = useState(taxSettings.businessLegalName || '');
  const [line1, setLine1] = useState(addr.line1 || '');
  const [city, setCity] = useState(addr.city || '');
  const [stateField, setStateField] = useState(addr.state || '');
  const [zip, setZip] = useState(addr.zip || '');
  const [country, setCountry] = useState(addr.country || 'US');
  const [taxExempt, setTaxExempt] = useState(taxSettings.taxExemption || false);
  const [regNumber, setRegNumber] = useState(taxSettings.registrationNumber || '');

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_TAX_SETTINGS',
      payload: {
        businessLegalName: legalName,
        taxExemption: taxExempt,
        registrationNumber: regNumber,
        address: { line1, city, state: stateField, zip, country },
      }
    });
    addFlash('success', 'Tax settings saved successfully');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Tax Settings</h1>
      <div className="aws-card space-y-4 max-w-2xl">
        <h3 className="font-bold text-sm">Business information</h3>
        <div>
          <label className="block text-sm font-bold mb-1">Business legal name</label>
          <input className="aws-input max-w-md" value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="Acme Corp" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Address line 1</label>
          <input className="aws-input max-w-md" value={line1} onChange={e => setLine1(e.target.value)} placeholder="123 Main St" />
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-md">
          <div>
            <label className="block text-sm font-bold mb-1">City</label>
            <input className="aws-input" value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">State</label>
            <input className="aws-input" value={stateField} onChange={e => setStateField(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">ZIP</label>
            <input className="aws-input" value={zip} onChange={e => setZip(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Country</label>
          <select className="aws-input max-w-md" value={country} onChange={e => setCountry(e.target.value)}>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="DE">Germany</option>
            <option value="JP">Japan</option>
            <option value="AU">Australia</option>
          </select>
        </div>
        <div className="border-t border-aws-border pt-4">
          <h3 className="font-bold text-sm mb-2">Tax exemption</h3>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={taxExempt} onChange={e => setTaxExempt(e.target.checked)} />
            This account is tax exempt
          </label>
          {taxExempt && (
            <p className="text-xs text-aws-text-secondary mt-2">Tax exemption documentation must be submitted separately through AWS Support.</p>
          )}
        </div>
        <div className="border-t border-aws-border pt-4">
          <h3 className="font-bold text-sm mb-2">Tax registration</h3>
          <div>
            <label className="block text-sm font-bold mb-1">Tax registration number</label>
            <input className="aws-input max-w-md" value={regNumber} onChange={e => setRegNumber(e.target.value)} placeholder="e.g. VAT or GST number" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button className="aws-btn aws-btn-primary" onClick={handleSave}>Save changes</button>
        </div>
      </div>
    </div>
  );
}
