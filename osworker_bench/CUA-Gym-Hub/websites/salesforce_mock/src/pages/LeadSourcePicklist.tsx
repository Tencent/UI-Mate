
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CustomObjects, PicklistValue } from '../types';

interface LeadSourcePicklistProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const LeadSourcePicklist: React.FC<LeadSourcePicklistProps> = ({ onShowToast }) => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const fieldName = fieldId || 'LeadSource';
  const { state, updateState } = useApp();

  const leadObj = state.customObjects?.Lead;
  const field = leadObj?.fields?.[fieldName];
  const values: PicklistValue[] = field?.values || [];

  const [newValue, setNewValue] = useState('');

  const persistValues = (updatedValues: PicklistValue[]) => {
    const co: CustomObjects = {
      ...(state.customObjects || {}),
      Lead: {
        label: leadObj?.label || 'Lead',
        apiName: leadObj?.apiName || 'Lead',
        fields: {
          ...(leadObj?.fields || {}),
          [fieldName]: {
            label: field?.label || 'Lead Source',
            apiName: field?.apiName || fieldName,
            type: field?.type || 'picklist',
            description: field?.description || '',
            values: updatedValues,
          },
        },
      },
    };
    updateState({ customObjects: co });
  };

  const handleAdd = () => {
    const trimmed = newValue.trim();
    if (!trimmed) {
      onShowToast('Please enter a value', 'error');
      return;
    }
    if (values.some(v => v.value === trimmed || v.label === trimmed)) {
      onShowToast(`Value "${trimmed}" already exists`, 'error');
      return;
    }
    const updated = [...values, { label: trimmed, value: trimmed }];
    persistValues(updated);
    setNewValue('');
    onShowToast(`Picklist value "${trimmed}" added`, 'success');
  };

  const handleDelete = (val: string) => {
    const updated = values.filter(v => v.value !== val);
    persistValues(updated);
    onShowToast(`Picklist value "${val}" removed`, 'success');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const fieldLabel = field?.label || 'Lead Source';

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          <Link to="/setup" style={{ textDecoration: 'none', color: 'var(--primary)' }}>Setup</Link>
          <ChevronRight size={12} style={{ verticalAlign: 'middle', margin: '0 4px' }} />
          <Link to="/setup/object-manager/lead" style={{ textDecoration: 'none', color: 'var(--primary)' }}>Lead</Link>
          <ChevronRight size={12} style={{ verticalAlign: 'middle', margin: '0 4px' }} />
          {fieldLabel}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 600 }}>{fieldLabel} — Picklist Values</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Add, reorder, or remove picklist values for the {fieldLabel} field on the Lead object.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Current Values</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '13px', fontWeight: 600 }}>#</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '13px', fontWeight: 600 }}>Label</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '13px', fontWeight: 600 }}>API Name</th>
              <th style={{ padding: '8px 12px' }}></th>
            </tr>
          </thead>
          <tbody>
            {values.map((v, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 12px', fontSize: '14px', color: 'var(--text-secondary)' }}>{i + 1}</td>
                <td style={{ padding: '8px 12px', fontSize: '14px', fontWeight: 500 }}>{v.label}</td>
                <td style={{ padding: '8px 12px', fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{v.value}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(v.value)}
                    title="Remove value"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {values.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No picklist values defined.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Add New Value</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">New Picklist Value</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Webinar"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px' }}
            onClick={handleAdd}
          >
            <Plus size={18} />
            Add Value
          </button>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
          The new value will be appended to the end of the picklist. Label and API name will both be set to the value you enter.
        </p>
      </div>
    </div>
  );
};
