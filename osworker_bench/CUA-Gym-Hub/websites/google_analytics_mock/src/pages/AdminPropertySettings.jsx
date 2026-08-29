import { useAppContext } from '../context/AppContext';
import { useState } from 'react';

export default function AdminPropertySettings() {
  const { state, updateState } = useAppContext();
  const [propertyName, setPropertyName] = useState(state.property.propertyName);
  const [industry, setIndustry] = useState(state.property.industry);
  const [timezone, setTimezone] = useState(state.property.timezone);
  const [currency, setCurrency] = useState(state.property.currency);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateState(prev => ({
      ...prev,
      property: {
        ...prev.property,
        propertyName,
        industry,
        timezone,
        currency
      }
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Property settings</h1>

      <div className="card" style={{ maxWidth: 600, padding: 24 }}>
        <div className="form-group">
          <label className="form-label">Property Name</label>
          <input className="form-input" value={propertyName} onChange={e => setPropertyName(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Property ID</label>
          <input className="form-input" value={state.property.propertyId} readOnly />
        </div>

        <div className="form-group">
          <label className="form-label">Industry Category</label>
          <select className="form-select" value={industry} onChange={e => setIndustry(e.target.value)}>
            <option value="Shopping">Shopping</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Travel">Travel</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Reporting Time Zone</label>
          <select className="form-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
            <option value="America/New_York">America/New_York (EST/EDT)</option>
            <option value="America/Chicago">America/Chicago (CST/CDT)</option>
            <option value="America/Denver">America/Denver (MST/MDT)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="Europe/Berlin">Europe/Berlin (CET/CEST)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Currency</label>
          <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
          {saved && <span style={{ color: 'var(--ga-positive)', fontSize: 13 }}>Saved!</span>}
        </div>
      </div>
    </div>
  );
}
