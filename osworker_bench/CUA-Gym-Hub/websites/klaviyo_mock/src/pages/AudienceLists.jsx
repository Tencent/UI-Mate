import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function AudienceLists() {
  const { state, updateUI, updateEntity, addEntity } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;

  const [tab, setTab] = useState(state.ui.audienceTab || 'lists');
  const [showCreateSegment, setShowCreateSegment] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [newListName, setNewListName] = useState('');
  const [newListType, setNewListType] = useState('single_opt_in');

  const handleTabChange = (t) => {
    setTab(t);
    updateUI({ audienceTab: t });
  };

  const handleToggleStar = (segId) => {
    const seg = state.segments.find(s => s.id === segId);
    if (seg) updateEntity('segments', segId, { isStarred: !seg.isStarred });
  };

  const handleCreateSegment = () => {
    if (!newSegmentName.trim()) return;
    addEntity('segments', {
      id: `seg_${Date.now()}`,
      name: newSegmentName,
      isStarred: false,
      isActive: true,
      memberCount: 0,
      conditionGroups: [{ conditions: [] }],
      createdAt: new Date().toISOString(),
      lastCalculated: new Date().toISOString()
    });
    setNewSegmentName('');
    setShowCreateSegment(false);
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    addEntity('lists', {
      id: `list_${Date.now()}`,
      name: newListName,
      type: newListType,
      memberCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    });
    setNewListName('');
    setNewListType('single_opt_in');
    setShowCreateList(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Lists & segments</h1>
        <button className="btn btn-primary" onClick={() => tab === 'segments' ? setShowCreateSegment(true) : setShowCreateList(true)}>
          {tab === 'lists' ? 'Create List' : 'Create Segment'}
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'lists' ? 'active' : ''}`} onClick={() => handleTabChange('lists')}>Lists</button>
        <button className={`tab ${tab === 'segments' ? 'active' : ''}`} onClick={() => handleTabChange('segments')}>Segments</button>
      </div>

      {tab === 'lists' && (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}><input type="checkbox" className="checkbox" /></th>
                <th>List name</th>
                <th>Members</th>
                <th>Type</th>
                <th>Created</th>
                <th>Last updated</th>
              </tr>
            </thead>
            <tbody>
              {state.lists.map(list => (
                <tr key={list.id}>
                  <td><input type="checkbox" className="checkbox" /></td>
                  <td><span className="clickable">{list.name}</span></td>
                  <td>{list.memberCount.toLocaleString()}</td>
                  <td className="text-muted">{list.type.replace(/_/g, ' ')}</td>
                  <td className="text-muted">{new Date(list.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="text-muted">{new Date(list.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'segments' && (
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}><input type="checkbox" className="checkbox" /></th>
                <th style={{ width: 32 }}></th>
                <th>Segment name</th>
                <th>Members</th>
                <th>Conditions</th>
                <th>Last calculated</th>
              </tr>
            </thead>
            <tbody>
              {state.segments.map(seg => (
                <tr key={seg.id}>
                  <td><input type="checkbox" className="checkbox" /></td>
                  <td>
                    <span onClick={() => handleToggleStar(seg.id)} style={{ cursor: 'pointer', fontSize: 16 }}>
                      {seg.isStarred ? '★' : '☆'}
                    </span>
                  </td>
                  <td><span className="clickable">{seg.name}</span></td>
                  <td>{seg.memberCount.toLocaleString()}</td>
                  <td className="text-muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                    {seg.conditionGroups.flatMap(g => g.conditions).map(c => `${c.property || c.type} ${c.operator} ${c.value}`).join(' AND ') || 'No conditions'}
                  </td>
                  <td className="text-muted">{new Date(seg.lastCalculated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Segment Modal */}
      {showCreateSegment && (
        <div className="modal-overlay" onClick={() => setShowCreateSegment(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create Segment</div>
            <div className="form-group">
              <label>Segment name</label>
              <input type="text" value={newSegmentName} onChange={e => setNewSegmentName(e.target.value)} placeholder="Enter segment name" />
            </div>
            <div className="card" style={{ background: 'var(--bg-tertiary)', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Definition</div>
              <div style={{ padding: 16, border: '1px dashed var(--border-color)', borderRadius: 4, textAlign: 'center' }}>
                <button className="btn btn-secondary" style={{ fontSize: 13 }}>+ Add condition</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateSegment(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateSegment}>Create Segment</button>
            </div>
          </div>
        </div>
      )}

      {/* Create List Modal */}
      {showCreateList && (
        <div className="modal-overlay" onClick={() => setShowCreateList(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create List</div>
            <div className="form-group">
              <label>List name</label>
              <input type="text" value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="Enter list name" autoFocus />
            </div>
            <div className="form-group">
              <label>List type</label>
              <select value={newListType} onChange={e => setNewListType(e.target.value)}>
                <option value="single_opt_in">Single opt-in</option>
                <option value="double_opt_in">Double opt-in</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateList(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateList}>Create List</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
