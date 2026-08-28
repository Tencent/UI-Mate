import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function FlowList() {
  const { state, updateUI, removeEntity, addEntity } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;

  const [statusFilter, setStatusFilter] = useState(state.ui.flowFilters.status || 'all');
  const [search, setSearch] = useState(state.ui.flowFilters.search || '');
  const [selected, setSelected] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');

  const filtered = useMemo(() => {
    let items = state.flows;
    if (statusFilter !== 'all') items = items.filter(f => f.status === statusFilter);
    if (search) items = items.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [state.flows, statusFilter, search]);

  const counts = useMemo(() => ({
    all: state.flows.length,
    live: state.flows.filter(f => f.status === 'live').length,
    manual: state.flows.filter(f => f.status === 'manual').length,
    draft: state.flows.filter(f => f.status === 'draft').length,
  }), [state.flows]);

  const getTriggerDesc = (f) => {
    const d = f.triggerDetails;
    if (d.type === 'added_to_list') return `When someone is added to ${d.listName || 'a list'}`;
    if (d.type === 'metric_triggered') return `When someone ${d.metricName}`;
    if (d.type === 'entered_segment') return `When someone enters ${d.segmentName || 'a segment'}`;
    if (d.type === 'date_property') return `On ${d.property} date`;
    if (d.type === 'price_drop') return `When price drops ${d.percentage}%+`;
    return f.triggerType;
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => selected.length === filtered.length ? setSelected([]) : setSelected(filtered.map(f => f.id));

  const handleCreateFlow = () => {
    if (!newFlowName.trim()) return;
    const newFlow = {
      id: `flow_${Date.now()}`,
      name: newFlowName,
      status: 'draft',
      triggerType: 'list',
      triggerDetails: { type: 'added_to_list', listId: 'list_001', listName: 'Newsletter Subscribers' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      actions: [],
      stats: { delivered: 0, opens: 0, clicks: 0, revenue: 0, conversions: 0 }
    };
    addEntity('flows', newFlow);
    setNewFlowName('');
    setShowCreateModal(false);
    navigate(appendQuery(`/flows/${newFlow.id}`));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Flows</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>Create flow</button>
      </div>

      <div className="tabs">
        {['all', 'live', 'manual', 'draft'].map(s => (
          <button key={s} className={`tab ${statusFilter === s ? 'active' : ''}`} onClick={() => { setStatusFilter(s); updateUI({ flowFilters: { ...state.ui.flowFilters, status: s } }); }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="tab-count">{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <input type="text" placeholder="Search flows..." value={search} onChange={e => { setSearch(e.target.value); updateUI({ flowFilters: { ...state.ui.flowFilters, search: e.target.value } }); }} />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 32 }}><input type="checkbox" className="checkbox" onChange={toggleAll} checked={selected.length === filtered.length && filtered.length > 0} /></th>
              <th>Flow name</th>
              <th>Status</th>
              <th>Trigger</th>
              <th>Actions</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(flow => (
              <tr key={flow.id}>
                <td><input type="checkbox" className="checkbox" checked={selected.includes(flow.id)} onChange={() => toggleSelect(flow.id)} /></td>
                <td><span className="clickable" onClick={() => navigate(appendQuery(`/flows/${flow.id}`))}>{flow.name}</span></td>
                <td><span className={`badge badge-${flow.status}`}>{flow.status.charAt(0).toUpperCase() + flow.status.slice(1)}</span></td>
                <td className="text-muted" style={{ fontSize: 13, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getTriggerDesc(flow)}</td>
                <td>{flow.actions.length}</td>
                <td className="text-muted">{new Date(flow.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No flows found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create Flow</div>
            <div className="form-group">
              <label>Flow name</label>
              <input type="text" value={newFlowName} onChange={e => setNewFlowName(e.target.value)} placeholder="Enter flow name" autoFocus />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateFlow}>Create Flow</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
