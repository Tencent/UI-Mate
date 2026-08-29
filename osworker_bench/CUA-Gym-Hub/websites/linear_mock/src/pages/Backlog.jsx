import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Layers, Plus, Check, Square, CheckSquare } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { StatusIcon, PriorityIcon, Avatar } from '../components/Icons.jsx';
import IssueList from '../components/IssueList.jsx';
import '../pages/TeamIssues.css';

export default function Backlog() {
  const { teamId } = useParams();
  const { state, dispatch } = useApp();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');

  const team = state.teams?.find(t => t.id === teamId);
  const allStates = team?.workflowStates || [];
  const backlogStateIds = allStates
    .filter(s => s.category === 'backlog' || s.category === 'unstarted')
    .map(s => s.id);

  const backlogIssues = (state.issues || []).filter(
    i => i.teamId === teamId && !i.cycleId && backlogStateIds.includes(i.stateId)
  );

  const [selectedIds, setSelectedIds] = useState([]);
  const [showMoveModal, setShowMoveModal] = useState(false);

  const teamCycles = (state.cycles || []).filter(c => c.teamId === teamId && !c.isCompleted);

  function toggleSelect(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function selectAll() {
    if (selectedIds.length === backlogIssues.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(backlogIssues.map(i => i.id));
    }
  }

  function moveToC(cycleId) {
    selectedIds.forEach(id => {
      dispatch({ type: 'UPDATE_ISSUE', issueId: id, updates: { cycleId } });
    });
    setSelectedIds([]);
    setShowMoveModal(false);
  }

  return (
    <div className="team-issues-page">
      <div className="page-header">
        <div className="page-header-left">
          <Layers size={16} style={{ color: 'var(--text-muted)' }} />
          <h2 className="page-title">Backlog</h2>
          <span className="issue-count">{backlogIssues.length}</span>
        </div>
        <div className="page-header-right">
          {backlogIssues.length > 0 && (
            <button
              className="header-icon-btn"
              onClick={selectAll}
              title={selectedIds.length === backlogIssues.length ? 'Deselect all' : 'Select all'}
            >
              {selectedIds.length === backlogIssues.length ? <CheckSquare size={14} /> : <Square size={14} />}
            </button>
          )}
          {selectedIds.length > 0 && (
            <>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedIds.length} selected</span>
              <button className="btn-primary btn-sm" onClick={() => setShowMoveModal(true)}>
                Move to cycle
              </button>
            </>
          )}
        </div>
      </div>

      {showMoveModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowMoveModal(false); }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border)', padding: 16, minWidth: 240, boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 510, marginBottom: 12, color: 'var(--text-primary)' }}>Move to cycle</h3>
            {teamCycles.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No active cycles</p>
            ) : (
              teamCycles.map(c => (
                <button key={c.id} className="issue-dropdown-item" style={{ width: '100%' }} onClick={() => moveToC(c.id)}>
                  {c.name} {c.isActive ? '(Active)' : ''}
                </button>
              ))
            )}
            <button className="btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setShowMoveModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="team-issues-content">
        <IssueList
          issues={backlogIssues}
          groupBy="status"
          showProject={true}
          emptyMessage="Backlog is clear"
          selectedIds={selectedIds}
          onSelectIssue={toggleSelect}
        />
      </div>
    </div>
  );
}
