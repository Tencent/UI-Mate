import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowUp, ArrowDown } from 'lucide-react';
import { useApp, evaluateViewConditions } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import SlaIndicator, { getSlaStatus } from '../components/SlaIndicator.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDistanceToNow } from 'date-fns';

export default function ViewsPage() {
  const { viewId } = useParams();
  const { state, dispatch } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [viewFilter, setViewFilter] = useState('');
  const [sortField, setSortField] = useState('updated_at');
  const [sortDir, setSortDir] = useState('desc');
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkChanges, setBulkChanges] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState('');

  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;

  const currentViewId = parseInt(viewId) || 1;

  const viewCounts = useMemo(() => {
    const counts = {};
    state.views.forEach(v => {
      counts[v.id] = evaluateViewConditions(v, state.tickets, state.currentUser.id).length;
    });
    return counts;
  }, [state.views, state.tickets, state.currentUser.id]);

  const currentView = state.views.find(v => v.id === currentViewId);
  const filteredTickets = useMemo(() => {
    if (!currentView) return [];
    let tickets = evaluateViewConditions(currentView, state.tickets, state.currentUser.id);
    if (sortField) {
      tickets = [...tickets].sort((a, b) => {
        let va = a[sortField];
        let vb = b[sortField];
        if (sortField === 'updated_at' || sortField === 'created_at') {
          va = new Date(va || 0).getTime();
          vb = new Date(vb || 0).getTime();
        }
        if (va == null) return 1;
        if (vb == null) return -1;
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return tickets;
  }, [currentView, state.tickets, state.currentUser.id, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleRowClick = (ticket) => {
    dispatch({ type: 'OPEN_TICKET_TAB', payload: ticket.id });
    navigate(appendQuery(`/tickets/${ticket.id}`));
  };

  const handleViewClick = (vid) => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: vid });
    navigate(appendQuery(`/views/${vid}`));
  };

  const toggleSelect = (e, ticketId) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_SELECTED_TICKET', payload: ticketId });
  };

  const toggleSelectAll = () => {
    if (state.ui.selectedTicketIds.length === filteredTickets.length) {
      dispatch({ type: 'DESELECT_ALL_TICKETS' });
    } else {
      dispatch({ type: 'SELECT_ALL_TICKETS', payload: filteredTickets.map(t => t.id) });
    }
  };

  const getUserName = (userId) => {
    const u = state.users.find(u => u.id === userId);
    return u ? u.name : '—';
  };

  const getGroupName = (groupId) => {
    const g = state.groups.find(g => g.id === groupId);
    return g ? g.name : '—';
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch { return '—'; }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const selectedCount = state.ui.selectedTicketIds.length;

  const handleBulkApply = () => {
    const changes = {};
    if (bulkChanges.status) changes.status = bulkChanges.status;
    if (bulkChanges.priority) changes.priority = bulkChanges.priority;
    if (bulkChanges.assignee_id) changes.assignee_id = parseInt(bulkChanges.assignee_id) || null;
    if (bulkChanges.group_id) changes.group_id = parseInt(bulkChanges.group_id);
    if (Object.keys(changes).length > 0) {
      dispatch({ type: 'BULK_UPDATE_TICKETS', payload: { ids: state.ui.selectedTicketIds, changes } });
      addToast(`${state.ui.selectedTicketIds.length} ticket(s) updated`);
    }
    setShowBulkEdit(false);
    setBulkChanges({});
  };

  const handleBulkDelete = () => {
    const count = state.ui.selectedTicketIds.length;
    state.ui.selectedTicketIds.forEach(id => dispatch({ type: 'DELETE_TICKET', payload: id }));
    addToast(`${count} ticket(s) deleted`);
    setShowDeleteConfirm(false);
  };

  const handleBulkMarkSpam = () => {
    const ids = state.ui.selectedTicketIds;
    const spamTag = 'spam';
    ids.forEach(id => {
      const ticket = state.tickets.find(t => t.id === id);
      if (!ticket) return;
      const tags = ticket.tags.includes(spamTag) ? ticket.tags : [...ticket.tags, spamTag];
      dispatch({ type: 'UPDATE_TICKET', payload: { id, changes: { status: 'solved', tags } } });
    });
    dispatch({ type: 'DESELECT_ALL_TICKETS' });
    addToast(`${ids.length} ticket(s) marked as spam`);
  };

  const handleMerge = () => {
    const targetId = parseInt(mergeTargetId);
    if (!targetId) return;
    const targetTicket = state.tickets.find(t => t.id === targetId);
    if (!targetTicket) {
      addToast('Target ticket not found', 'error');
      return;
    }
    const sourceIds = state.ui.selectedTicketIds.filter(id => id !== targetId);
    if (sourceIds.length === 0) {
      addToast('No source tickets to merge', 'error');
      return;
    }
    // Add a comment to the target ticket noting the merge
    const mergedFrom = sourceIds.map(id => `#${id}`).join(', ');
    const mergeComment = {
      id: Date.now(),
      ticket_id: targetId,
      author_id: state.currentUser.id,
      body: `Merged tickets ${mergedFrom} into this ticket.`,
      html_body: `<p>Merged tickets ${mergedFrom} into this ticket.</p>`,
      public: false,
      type: 'Comment',
      attachments: [],
      created_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_COMMENT', payload: { ticketId: targetId, comment: mergeComment } });
    // Close source tickets with a note
    sourceIds.forEach(sourceId => {
      const closeComment = {
        id: Date.now() + sourceId,
        ticket_id: sourceId,
        author_id: state.currentUser.id,
        body: `This ticket was merged into #${targetId}.`,
        html_body: `<p>This ticket was merged into #${targetId}.</p>`,
        public: false,
        type: 'Comment',
        attachments: [],
        created_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_COMMENT', payload: { ticketId: sourceId, comment: closeComment } });
      dispatch({ type: 'UPDATE_TICKET', payload: { id: sourceId, changes: { status: 'closed' } } });
    });
    dispatch({ type: 'DESELECT_ALL_TICKETS' });
    addToast(`${sourceIds.length} ticket(s) merged into #${targetId}`);
    setShowMergeModal(false);
    setMergeTargetId('');
    dispatch({ type: 'OPEN_TICKET_TAB', payload: targetId });
    navigate(appendQuery(`/tickets/${targetId}`));
  };

  const filteredViews = state.views.filter(v =>
    v.title.toLowerCase().includes(viewFilter.toLowerCase())
  );

  return (
    <div className="views-layout">
      <div className="views-panel">
        <div className="views-panel-header">
          <div className="views-panel-title">Views</div>
          <div className="views-panel-search">
            <Search size={14} />
            <input
              placeholder="Filter views"
              value={viewFilter}
              onChange={e => setViewFilter(e.target.value)}
            />
          </div>
        </div>
        <div className="views-section-label">Views</div>
        <div className="views-list">
          {filteredViews.map(view => (
            <button
              key={view.id}
              className={`view-item ${view.id === currentViewId ? 'active' : ''}`}
              onClick={() => handleViewClick(view.id)}
            >
              <span className="view-item-title">{view.title}</span>
              <span className="view-item-count">{viewCounts[view.id] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ticket-list-container">
        <div className="ticket-list-header">
          <span className="ticket-list-count">
            {currentView ? currentView.title : 'View'} ({filteredTickets.length} tickets)
          </span>
        </div>

        {selectedCount > 0 && (
          <div className="bulk-actions-bar">
            <span className="bulk-count">{selectedCount} ticket(s) selected</span>
            <button className="bulk-btn" onClick={() => setShowBulkEdit(true)}>Edit</button>
            <button className="bulk-btn" onClick={() => setShowMergeModal(true)}>Merge</button>
            <button className="bulk-btn" onClick={handleBulkMarkSpam}>Mark as spam</button>
            <button className="bulk-btn danger" onClick={() => setShowDeleteConfirm(true)}>Delete</button>
            <button className="bulk-btn" onClick={() => dispatch({ type: 'DESELECT_ALL_TICKETS' })}>Clear</button>
          </div>
        )}

        <div className="ticket-table-wrapper">
          <table className="ticket-table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={filteredTickets.length > 0 && state.ui.selectedTicketIds.length === filteredTickets.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="status-cell">Status</th>
                <th className="id-cell" onClick={() => handleSort('id')}>ID <SortIcon field="id" /></th>
                <th className="subject-cell" onClick={() => handleSort('subject')}>Subject <SortIcon field="subject" /></th>
                <th onClick={() => handleSort('requester_id')}>Requester <SortIcon field="requester_id" /></th>
                <th onClick={() => handleSort('created_at')}>Requested <SortIcon field="created_at" /></th>
                <th onClick={() => handleSort('updated_at')}>Updated <SortIcon field="updated_at" /></th>
                <th onClick={() => handleSort('group_id')}>Group <SortIcon field="group_id" /></th>
                <th onClick={() => handleSort('assignee_id')}>Assignee <SortIcon field="assignee_id" /></th>
                <th onClick={() => handleSort('priority')}>Priority <SortIcon field="priority" /></th>
                <th className="sla-cell">SLA</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} onClick={() => handleRowClick(ticket)}>
                  <td className="checkbox-cell" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={state.ui.selectedTicketIds.includes(ticket.id)}
                      onChange={e => toggleSelect(e, ticket.id)}
                    />
                  </td>
                  <td className="status-cell">
                    <span className={`status-dot ${ticket.status}`} />
                  </td>
                  <td className="id-cell">#{ticket.id}</td>
                  <td className="subject-cell">
                    <span className="subject-text">{ticket.subject}</span>
                    <div className="subject-requester">{getUserName(ticket.requester_id)}</div>
                  </td>
                  <td className="requester-cell">{getUserName(ticket.requester_id)}</td>
                  <td className="time-cell">{formatTime(ticket.created_at)}</td>
                  <td className="time-cell">{formatTime(ticket.updated_at)}</td>
                  <td className="group-cell">{getGroupName(ticket.group_id)}</td>
                  <td className="assignee-cell">{ticket.assignee_id ? getUserName(ticket.assignee_id) : '—'}</td>
                  <td><PriorityBadge priority={ticket.priority} /></td>
                  <td className="sla-cell">
                    <SlaIndicator ticket={ticket} compact />
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ padding: 0, border: 'none' }}>
                    <EmptyState
                      type="tickets"
                      title="No tickets in this view"
                      subtitle="Tickets matching this view's conditions will appear here."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showBulkEdit && (
        <div className="modal-overlay" onClick={() => setShowBulkEdit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Edit {selectedCount} ticket(s)</div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={bulkChanges.status || ''} onChange={e => setBulkChanges(prev => ({ ...prev, status: e.target.value }))}>
                <option value="">— No change —</option>
                <option value="new">New</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="hold">Hold</option>
                <option value="solved">Solved</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={bulkChanges.priority || ''} onChange={e => setBulkChanges(prev => ({ ...prev, priority: e.target.value }))}>
                <option value="">— No change —</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select className="form-select" value={bulkChanges.assignee_id || ''} onChange={e => setBulkChanges(prev => ({ ...prev, assignee_id: e.target.value }))}>
                <option value="">— No change —</option>
                {state.users.filter(u => u.role === 'agent').map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Group</label>
              <select className="form-select" value={bulkChanges.group_id || ''} onChange={e => setBulkChanges(prev => ({ ...prev, group_id: e.target.value }))}>
                <option value="">— No change —</option>
                {state.groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="modal-btn" onClick={() => setShowBulkEdit(false)}>Cancel</button>
              <button className="modal-btn primary" onClick={handleBulkApply}>Apply</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete {selectedCount} ticket(s)?</div>
            <p style={{ fontSize: 13, color: '#68737D', marginBottom: 16 }}>
              This action cannot be undone. The selected tickets and all their comments will be permanently deleted.
            </p>
            <div className="modal-actions">
              <button className="modal-btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="modal-btn danger" onClick={handleBulkDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showMergeModal && (
        <div className="modal-overlay" onClick={() => setShowMergeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Merge {selectedCount} ticket(s)</div>
            <p style={{ fontSize: 13, color: '#68737D', marginBottom: 16 }}>
              Selected tickets ({state.ui.selectedTicketIds.map(id => `#${id}`).join(', ')}) will be closed and their content merged into the target ticket.
            </p>
            <div className="form-group">
              <label className="form-label">Merge into ticket ID</label>
              <select
                className="form-select"
                value={mergeTargetId}
                onChange={e => setMergeTargetId(e.target.value)}
              >
                <option value="">— Select target ticket —</option>
                {state.tickets
                  .filter(t => !['closed'].includes(t.status))
                  .map(t => (
                    <option key={t.id} value={t.id}>
                      #{t.id} — {t.subject.length > 50 ? t.subject.substring(0, 50) + '...' : t.subject}
                    </option>
                  ))
                }
              </select>
            </div>
            <div className="modal-actions">
              <button className="modal-btn" onClick={() => { setShowMergeModal(false); setMergeTargetId(''); }}>Cancel</button>
              <button
                className="modal-btn primary"
                onClick={handleMerge}
                disabled={!mergeTargetId}
                style={{ opacity: mergeTargetId ? 1 : 0.5, cursor: mergeTargetId ? 'pointer' : 'not-allowed' }}
              >
                Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
