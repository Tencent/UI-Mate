import React, { useState } from 'react';
import { Plus, Trash2, Edit3, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Segments() {
  const { state, addSegment, updateSegment, deleteSegment, addToast } = useApp();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [segmentName, setSegmentName] = useState('');
  const [conditionMatch, setConditionMatch] = useState('all');
  const [conditions, setConditions] = useState([{ field: 'emailActivity', operator: 'opened', value: '' }]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const addCondition = () => {
    setConditions([...conditions, { field: 'emailActivity', operator: 'opened', value: '' }]);
  };

  const removeCondition = (i) => {
    setConditions(conditions.filter((_, idx) => idx !== i));
  };

  const updateCondition = (i, updates) => {
    setConditions(conditions.map((c, idx) => idx === i ? { ...c, ...updates } : c));
  };

  const getOperators = (field) => {
    switch (field) {
      case 'emailActivity': return [{ v: 'opened', l: 'opened' }, { v: 'did_not_open', l: 'did not open' }, { v: 'clicked', l: 'clicked' }];
      case 'tags': return [{ v: 'is', l: 'is' }, { v: 'is_not', l: 'is not' }];
      case 'rating': return [{ v: 'greater_than', l: 'is greater than' }, { v: 'less_than', l: 'is less than' }];
      case 'subscribedDate': return [{ v: 'after', l: 'is after' }, { v: 'before', l: 'is before' }];
      default: return [{ v: 'is', l: 'is' }];
    }
  };

  const estimateCount = () => {
    return Math.floor(Math.random() * 500 + 100);
  };

  const handleSave = () => {
    if (!segmentName) return;
    if (editingId) {
      updateSegment(editingId, { name: segmentName, conditionMatch, conditions, memberCount: estimateCount(), updatedAt: new Date().toISOString() });
      addToast('Segment updated');
    } else {
      addSegment({
        id: `seg_${Date.now()}`,
        audienceId: 'aud_1',
        name: segmentName,
        conditions,
        conditionMatch,
        memberCount: estimateCount(),
        type: 'saved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      addToast('Segment created');
    }
    setShowBuilder(false);
    setEditingId(null);
    setSegmentName('');
    setConditions([{ field: 'emailActivity', operator: 'opened', value: '' }]);
  };

  const startEdit = (seg) => {
    setEditingId(seg.id);
    setSegmentName(seg.name);
    setConditionMatch(seg.conditionMatch);
    setConditions(seg.conditions.length > 0 ? [...seg.conditions] : [{ field: 'emailActivity', operator: 'opened', value: '' }]);
    setShowBuilder(true);
  };

  const handleDelete = (id) => {
    deleteSegment(id);
    addToast('Segment deleted');
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Segments</h1>
        <button className="btn btn-primary" onClick={() => { setShowBuilder(true); setEditingId(null); setSegmentName(''); setConditions([{ field: 'emailActivity', operator: 'opened', value: '' }]); }}><Plus size={16} /> Create Segment</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Members</th>
              <th>Created</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.segments.map(seg => (
              <tr key={seg.id}>
                <td style={{ fontWeight: 500 }}>{seg.name}</td>
                <td><span className={`badge badge-${seg.type}`}>{seg.type}</span></td>
                <td>{seg.memberCount.toLocaleString()}</td>
                <td className="text-muted text-sm">{new Date(seg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => startEdit(seg)} style={{ background: 'none', border: 'none', color: '#707070', cursor: 'pointer', padding: 4 }}><Edit3 size={14} /></button>
                    {seg.type !== 'pre-built' && (
                      <button onClick={() => setDeleteConfirm(seg)} style={{ background: 'none', border: 'none', color: '#D5432F', cursor: 'pointer', padding: 4 }}><Trash2 size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showBuilder && (
        <div className="modal-overlay" onClick={() => setShowBuilder(false)}>
          <div className="modal" style={{ width: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Segment' : 'Create Segment'}</h2>
              <button onClick={() => setShowBuilder(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Segment Name</label>
                <input value={segmentName} onChange={e => setSegmentName(e.target.value)} placeholder="Enter segment name" />
              </div>
              <div className="form-group">
                <label>Contacts match <select value={conditionMatch} onChange={e => setConditionMatch(e.target.value)} style={{ display: 'inline', width: 'auto', height: 28, margin: '0 4px' }}><option value="all">all</option><option value="any">any</option></select> of the following conditions:</label>
              </div>
              {conditions.map((cond, i) => (
                <div key={i} className="condition-row">
                  <select value={cond.field} onChange={e => updateCondition(i, { field: e.target.value, operator: getOperators(e.target.value)[0]?.v || 'is' })}>
                    <option value="emailActivity">Email Activity</option>
                    <option value="tags">Tags</option>
                    <option value="rating">Rating</option>
                    <option value="subscribedDate">Subscribed Date</option>
                    <option value="location">Location</option>
                    <option value="source">Source</option>
                  </select>
                  <select value={cond.operator} onChange={e => updateCondition(i, { operator: e.target.value })}>
                    {getOperators(cond.field).map(op => <option key={op.v} value={op.v}>{op.l}</option>)}
                  </select>
                  <input value={cond.value} onChange={e => updateCondition(i, { value: e.target.value })} placeholder="Value" />
                  {conditions.length > 1 && <button className="condition-remove" onClick={() => removeCondition(i)}><X size={16} /></button>}
                </div>
              ))}
              <button onClick={addCondition} style={{ background: 'none', border: 'none', color: '#007C89', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}><Plus size={14} /> Add condition</button>
              <p className="text-sm text-muted mt-16">Estimated: {estimateCount()} contacts</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setShowBuilder(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!segmentName}>Save Segment</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Segment</h2></div>
            <div className="modal-body"><p>Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
