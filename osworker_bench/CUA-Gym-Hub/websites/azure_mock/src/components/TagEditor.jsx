import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function TagEditor({ tags = {}, onSave }) {
  const initialRows = Object.entries(tags).map(([key, value], i) => ({ id: i, key, value }));
  const [rows, setRows] = useState(initialRows.length > 0 ? initialRows : []);

  const addRow = () => {
    setRows([...rows, { id: Date.now(), key: '', value: '' }]);
  };

  const removeRow = (id) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id, field, val) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  const handleSave = () => {
    const tagsObj = {};
    rows.forEach(r => {
      if (r.key.trim()) {
        tagsObj[r.key.trim()] = r.value.trim();
      }
    });
    onSave(tagsObj);
  };

  return (
    <div>
      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Name</th>
              <th style={{ width: '40%' }}>Value</th>
              <th style={{ width: '20%' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                <td>
                  <input
                    className="input"
                    style={{ width: '100%' }}
                    placeholder="Key"
                    value={row.key}
                    onChange={e => updateRow(row.id, 'key', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    style={{ width: '100%' }}
                    placeholder="Value"
                    value={row.value}
                    onChange={e => updateRow(row.id, 'value', e.target.value)}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-default"
                    style={{ padding: '4px 8px', minHeight: '28px' }}
                    onClick={() => removeRow(row.id)}
                    title="Remove tag"
                  >
                    <X size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--xzure-text-secondary)', padding: '16px' }}>
                  No tags. Click "+ Add tag" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button className="btn btn-default" onClick={addRow}>
          <Plus size={14} /> Add tag
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}
