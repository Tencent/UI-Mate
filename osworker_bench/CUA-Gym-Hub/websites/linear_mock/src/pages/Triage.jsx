import React from 'react';
import { useParams } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { StatusIcon, PriorityIcon, Avatar } from '../components/Icons.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import '../pages/TeamIssues.css';
import './Triage.css';

export default function Triage() {
  const { teamId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');
  const toPath = p => sid ? `${p}?sid=${sid}` : p;

  const team = state.teams?.find(t => t.id === teamId);
  const allStates = team?.workflowStates || [];
  const triageState = allStates.find(s => s.category === 'triage');
  const todoState = allStates.find(s => s.category === 'unstarted');
  const canceledState = allStates.find(s => s.category === 'canceled');

  const triageIssues = (state.issues || []).filter(
    i => i.teamId === teamId && i.stateId === triageState?.id
  );

  function accept(issueId) {
    dispatch({ type: 'UPDATE_ISSUE', issueId, updates: { stateId: todoState?.id } });
  }

  function decline(issueId) {
    dispatch({ type: 'UPDATE_ISSUE', issueId, updates: { stateId: canceledState?.id } });
  }

  return (
    <div className="team-issues-page">
      <div className="page-header">
        <div className="page-header-left">
          <Flag size={16} style={{ color: 'var(--text-muted)' }} />
          <h2 className="page-title">Triage</h2>
          <span className="issue-count">{triageIssues.length}</span>
        </div>
      </div>
      <div className="team-issues-content">
        {triageIssues.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)' }}>
            <Flag size={36} style={{ marginBottom: 12 }} />
            <p>No issues to triage</p>
          </div>
        ) : (
          triageIssues.map(issue => {
            const assignee = issue.assigneeId ? state.users?.find(u => u.id === issue.assigneeId) : null;
            return (
              <div key={issue.id} className="triage-row">
                <div className="triage-row-left" onClick={() => navigate(toPath(`/issue/${issue.id}`))}>
                  <PriorityIcon priority={issue.priority} size={14} />
                  <span className="triage-row-id">{issue.identifier}</span>
                  <span className="triage-row-title">{issue.title}</span>
                </div>
                <div className="triage-row-actions">
                  <Avatar user={assignee} size={18} />
                  <button className="triage-accept-btn" onClick={() => accept(issue.id)}>
                    Accept
                  </button>
                  <button className="triage-decline-btn" onClick={() => decline(issue.id)}>
                    Decline
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
