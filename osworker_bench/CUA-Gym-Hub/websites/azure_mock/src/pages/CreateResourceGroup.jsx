import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Plus, X } from 'lucide-react';

const locations = ['East US', 'East US 2', 'West US', 'West US 2', 'Central US', 'North Europe', 'West Europe', 'Southeast Asia'];

export default function CreateResourceGroup() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // form | review
  const [name, setName] = useState('');
  const [subscription, setSubscription] = useState(state.subscriptions[0]?.displayName || '');
  const [location, setLocation] = useState('East US');
  const [tags, setTags] = useState([]);
  const [nameError, setNameError] = useState('');

  const validateName = (val) => {
    if (!val.trim()) {
      setNameError('Resource group name is required.');
      return false;
    }
    if (val.length < 1 || val.length > 90) {
      setNameError('Name must be between 1 and 90 characters.');
      return false;
    }
    if (!/^[a-zA-Z0-9._\-()]+$/.test(val)) {
      setNameError('Name can only contain alphanumerics, underscores, hyphens, periods, and parentheses.');
      return false;
    }
    if (state.resourceGroups.some(rg => rg.name === val)) {
      setNameError('A resource group with this name already exists.');
      return false;
    }
    setNameError('');
    return true;
  };

  const addTagRow = () => {
    setTags([...tags, { id: Date.now(), key: '', value: '' }]);
  };

  const removeTagRow = (id) => {
    setTags(tags.filter(t => t.id !== id));
  };

  const updateTag = (id, field, val) => {
    setTags(tags.map(t => t.id === id ? { ...t, [field]: val } : t));
  };

  const handleReview = () => {
    if (validateName(name)) {
      setStep('review');
    }
  };

  const handleCreate = () => {
    const tagsObj = {};
    tags.forEach(t => {
      if (t.key.trim()) tagsObj[t.key.trim()] = t.value.trim();
    });

    dispatch({
      type: 'CREATE_RESOURCE_GROUP',
      payload: {
        name,
        subscriptionId: state.subscriptions[0]?.id || 'sub-001',
        location,
        tags: tagsObj
      }
    });
    navigate('/resource-groups');
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Resource groups', path: '/resource-groups' }, { label: 'Create a resource group' }]} />
      <h1 className="page-title">Create a resource group</h1>

      {step === 'form' && (
        <div className="card" style={{ maxWidth: '680px' }}>
          <div className="section-header" style={{ marginBottom: '16px' }}>Project details</div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>
              Subscription <span style={{ color: 'var(--xzure-error)' }}>*</span>
            </label>
            <select className="input" style={{ width: '100%' }} value={subscription} onChange={e => setSubscription(e.target.value)}>
              {state.subscriptions.map(sub => (
                <option key={sub.id} value={sub.displayName}>{sub.displayName}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>
              Resource group <span style={{ color: 'var(--xzure-error)' }}>*</span>
            </label>
            <input
              className="input"
              style={{ width: '100%', borderColor: nameError ? 'var(--xzure-error)' : undefined }}
              placeholder="Enter a resource group name"
              value={name}
              onChange={e => { setName(e.target.value); if (nameError) validateName(e.target.value); }}
              onBlur={() => name && validateName(name)}
            />
            {nameError && (
              <div style={{ color: 'var(--xzure-error)', fontSize: '12px', marginTop: '4px' }}>{nameError}</div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>
              Region <span style={{ color: 'var(--xzure-error)' }}>*</span>
            </label>
            <select className="input" style={{ width: '100%' }} value={location} onChange={e => setLocation(e.target.value)}>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="section-header" style={{ marginBottom: '12px' }}>Tags</div>
          <div style={{ marginBottom: '16px' }}>
            <div className="card" style={{ padding: 0 }}>
              <table className="xzure-table">
                <thead>
                  <tr><th>Name</th><th>Value</th><th></th></tr>
                </thead>
                <tbody>
                  {tags.map(tag => (
                    <tr key={tag.id}>
                      <td><input className="input" style={{ width: '100%' }} placeholder="Key" value={tag.key} onChange={e => updateTag(tag.id, 'key', e.target.value)} /></td>
                      <td><input className="input" style={{ width: '100%' }} placeholder="Value" value={tag.value} onChange={e => updateTag(tag.id, 'value', e.target.value)} /></td>
                      <td><button className="btn btn-default" style={{ padding: '4px 8px', minHeight: '28px' }} onClick={() => removeTagRow(tag.id)}><X size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-default" onClick={addTagRow} style={{ marginTop: '8px' }}>
              <Plus size={14} /> Add tag
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={handleReview}>Review + create</button>
            <button className="btn btn-default" onClick={() => navigate('/resource-groups')}>Cancel</button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="card" style={{ maxWidth: '680px' }}>
          <div style={{ marginBottom: '16px', padding: '12px', background: '#dff6dd', borderRadius: '2px', color: 'var(--xzure-success)', fontWeight: 600 }}>
            Validation passed
          </div>

          <div className="section-header" style={{ marginBottom: '12px' }}>Review + create</div>

          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '8px 16px', marginBottom: '24px' }}>
            <div style={{ fontWeight: 600, color: 'var(--xzure-text-secondary)' }}>Subscription</div>
            <div>{subscription}</div>
            <div style={{ fontWeight: 600, color: 'var(--xzure-text-secondary)' }}>Resource group</div>
            <div>{name}</div>
            <div style={{ fontWeight: 600, color: 'var(--xzure-text-secondary)' }}>Region</div>
            <div>{location}</div>
            {tags.filter(t => t.key.trim()).length > 0 && (
              <>
                <div style={{ fontWeight: 600, color: 'var(--xzure-text-secondary)' }}>Tags</div>
                <div>
                  {tags.filter(t => t.key.trim()).map(t => (
                    <div key={t.id}>{t.key}: {t.value}</div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={handleCreate}>Create</button>
            <button className="btn btn-default" onClick={() => setStep('form')}>Previous</button>
          </div>
        </div>
      )}
    </div>
  );
}
