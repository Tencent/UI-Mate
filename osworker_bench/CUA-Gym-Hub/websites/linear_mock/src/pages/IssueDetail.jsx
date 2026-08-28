import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronRight, Plus, X, CheckSquare, Square, User } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { PriorityIcon, StatusIcon, Avatar, LabelPill, formatRelativeTime, formatDate, isOverdue, PRIORITY_LABELS } from '../components/Icons.jsx';
import './IssueDetail.css';

function PropertyRow({ label, children }) {
  return (
    <div className="prop-row">
      <span className="prop-label">{label}</span>
      <div className="prop-value">{children}</div>
    </div>
  );
}

function StatusSelect({ issue, team, dispatch }) {
  const [open, setOpen] = useState(false);
  const states = team?.workflowStates || [];
  const current = states.find(s => s.id === issue.stateId);
  return (
    <div className="prop-select-wrapper">
      <button className="prop-select-btn" onClick={() => setOpen(!open)}>
        <StatusIcon state={current} size={14} />
        <span>{current?.name || 'Unknown'}</span>
      </button>
      {open && (
        <>
          <div className="prop-backdrop" onClick={() => setOpen(false)} />
          <div className="prop-dropdown">
            {states.map(s => (
              <button key={s.id} className={`prop-option ${s.id === issue.stateId ? 'selected' : ''}`}
                onClick={() => {
                  dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { stateId: s.id } });
                  setOpen(false);
                }}>
                <StatusIcon state={s} size={13} /><span>{s.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PrioritySelect({ issue, dispatch }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="prop-select-wrapper">
      <button className="prop-select-btn" onClick={() => setOpen(!open)}>
        <PriorityIcon priority={issue.priority} size={14} />
        <span>{PRIORITY_LABELS[issue.priority]}</span>
      </button>
      {open && (
        <>
          <div className="prop-backdrop" onClick={() => setOpen(false)} />
          <div className="prop-dropdown">
            {[0,1,2,3,4].map(p => (
              <button key={p} className={`prop-option ${issue.priority === p ? 'selected' : ''}`}
                onClick={() => { dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { priority: p } }); setOpen(false); }}>
                <PriorityIcon priority={p} size={13} /><span>{PRIORITY_LABELS[p]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AssigneeSelect({ issue, team, users, dispatch }) {
  const [open, setOpen] = useState(false);
  const members = users.filter(u => team?.memberIds?.includes(u.id));
  const assignee = issue.assigneeId ? users.find(u => u.id === issue.assigneeId) : null;
  return (
    <div className="prop-select-wrapper">
      <button className="prop-select-btn" onClick={() => setOpen(!open)}>
        <Avatar user={assignee} size={16} />
        <span>{assignee?.name || 'No assignee'}</span>
      </button>
      {open && (
        <>
          <div className="prop-backdrop" onClick={() => setOpen(false)} />
          <div className="prop-dropdown">
            <button className={`prop-option ${!issue.assigneeId ? 'selected' : ''}`}
              onClick={() => { dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { assigneeId: null } }); setOpen(false); }}>
              <Avatar user={null} size={14} /><span>No assignee</span>
            </button>
            {members.map(u => (
              <button key={u.id} className={`prop-option ${u.id === issue.assigneeId ? 'selected' : ''}`}
                onClick={() => { dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { assigneeId: u.id } }); setOpen(false); }}>
                <Avatar user={u} size={14} /><span>{u.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EstimateSelect({ issue, dispatch }) {
  const [open, setOpen] = useState(false);
  const estimates = [null, 0, 1, 2, 3, 5, 8, 13, 21];
  return (
    <div className="prop-select-wrapper">
      <button className="prop-select-btn" onClick={() => setOpen(!open)}>
        <span>{issue.estimate != null ? issue.estimate : 'No estimate'}</span>
      </button>
      {open && (
        <>
          <div className="prop-backdrop" onClick={() => setOpen(false)} />
          <div className="prop-dropdown">
            {estimates.map(e => (
              <button key={String(e)} className={`prop-option ${issue.estimate === e ? 'selected' : ''}`}
                onClick={() => { dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { estimate: e } }); setOpen(false); }}>
                <span>{e != null ? e : 'No estimate'}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function LabelSelect({ issue, labels, dispatch }) {
  const [open, setOpen] = useState(false);
  const current = (issue.labelIds || []).map(id => labels.find(l => l.id === id)).filter(Boolean);
  return (
    <div className="prop-select-wrapper">
      <button className="prop-select-btn" onClick={() => setOpen(!open)}>
        {current.length === 0 ? <span>No labels</span> : current.slice(0,3).map(l => <LabelPill key={l.id} label={l} small />)}
      </button>
      {open && (
        <>
          <div className="prop-backdrop" onClick={() => setOpen(false)} />
          <div className="prop-dropdown">
            {labels.map(l => {
              const checked = issue.labelIds?.includes(l.id);
              return (
                <button key={l.id} className={`prop-option ${checked ? 'selected' : ''}`}
                  onClick={() => {
                    const next = checked
                      ? issue.labelIds.filter(id => id !== l.id)
                      : [...(issue.labelIds || []), l.id];
                    dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { labelIds: next } });
                  }}>
                  {checked ? <CheckSquare size={13} /> : <Square size={13} />}
                  <span style={{ color: l.color, fontWeight: 510 }}>{l.name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectSelect({ issue, projects, dispatch }) {
  const [open, setOpen] = useState(false);
  const project = issue.projectId ? projects.find(p => p.id === issue.projectId) : null;
  return (
    <div className="prop-select-wrapper">
      <button className="prop-select-btn" onClick={() => setOpen(!open)}>
        <span>{project?.name || 'No project'}</span>
      </button>
      {open && (
        <>
          <div className="prop-backdrop" onClick={() => setOpen(false)} />
          <div className="prop-dropdown">
            <button className={`prop-option ${!issue.projectId ? 'selected' : ''}`}
              onClick={() => { dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { projectId: null } }); setOpen(false); }}>
              <span>No project</span>
            </button>
            {projects.map(p => (
              <button key={p.id} className={`prop-option ${p.id === issue.projectId ? 'selected' : ''}`}
                onClick={() => { dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { projectId: p.id } }); setOpen(false); }}>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CycleSelect({ issue, cycles, dispatch }) {
  const [open, setOpen] = useState(false);
  const cycle = issue.cycleId ? cycles.find(c => c.id === issue.cycleId) : null;
  const teamCycles = cycles.filter(c => c.teamId === issue.teamId);
  return (
    <div className="prop-select-wrapper">
      <button className="prop-select-btn" onClick={() => setOpen(!open)}>
        <span>{cycle?.name || 'No cycle'}</span>
      </button>
      {open && (
        <>
          <div className="prop-backdrop" onClick={() => setOpen(false)} />
          <div className="prop-dropdown">
            <button className={`prop-option ${!issue.cycleId ? 'selected' : ''}`}
              onClick={() => { dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { cycleId: null } }); setOpen(false); }}>
              <span>No cycle</span>
            </button>
            {teamCycles.map(c => (
              <button key={c.id} className={`prop-option ${c.id === issue.cycleId ? 'selected' : ''}`}
                onClick={() => { dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { cycleId: c.id } }); setOpen(false); }}>
                <span>{c.name} {c.isActive ? '(Active)' : c.isCompleted ? '(Completed)' : ''}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DueDateSelect({ issue, dispatch }) {
  const [editing, setEditing] = useState(false);
  const overdue = isOverdue(issue.dueDate);
  return (
    <div className="prop-select-wrapper">
      {editing ? (
        <input
          type="date"
          className="prop-date-input"
          defaultValue={issue.dueDate || ''}
          onBlur={e => {
            dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { dueDate: e.target.value || null } });
            setEditing(false);
          }}
          autoFocus
        />
      ) : (
        <button className={`prop-select-btn ${overdue ? 'overdue' : ''}`} onClick={() => setEditing(true)}>
          <span>{issue.dueDate ? formatDate(issue.dueDate) : 'No due date'}</span>
        </button>
      )}
    </div>
  );
}

export default function IssueDetail() {
  const { issueId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');
  const toPath = p => sid ? `${p}?sid=${sid}` : p;

  const [activeTab, setActiveTab] = useState('comments');
  const [editTitle, setEditTitle] = useState(false);
  const [editDesc, setEditDesc] = useState(false);
  const [titleVal, setTitleVal] = useState('');
  const [descVal, setDescVal] = useState('');
  const [commentText, setCommentText] = useState('');
  const [showAddSubIssue, setShowAddSubIssue] = useState(false);
  const [subIssueTitle, setSubIssueTitle] = useState('');

  const issue = state.issues?.find(i => i.id === issueId);

  useEffect(() => {
    if (issue) {
      setTitleVal(issue.title);
      setDescVal(issue.description || '');
    }
  }, [issue?.id]);

  if (!issue) {
    return <div className="page-not-found">Issue not found</div>;
  }

  const team = state.teams?.find(t => t.id === issue.teamId);
  const workflowState = team?.workflowStates?.find(s => s.id === issue.stateId);
  const subIssues = state.issues?.filter(i => i.parentId === issue.id) || [];
  const comments = (state.comments || []).filter(c => c.issueId === issue.id && !c.parentId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  function saveTitle() {
    if (titleVal.trim() && titleVal !== issue.title) {
      dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { title: titleVal.trim() } });
    }
    setEditTitle(false);
  }

  function saveDesc() {
    dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { description: descVal } });
    setEditDesc(false);
  }

  function addComment() {
    if (!commentText.trim()) return;
    dispatch({
      type: 'CREATE_COMMENT',
      comment: {
        id: `cm${Date.now()}`,
        body: commentText.trim(),
        issueId: issue.id,
        userId: state.currentUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: null,
      },
    });
    setCommentText('');
  }

  function createSubIssue() {
    if (!subIssueTitle.trim()) return;
    const team = state.teams?.find(t => t.id === issue.teamId);
    const counter = (state.issueCounters?.[issue.teamId] || 0) + 1;
    const identifier = `${team?.key}-${counter}`;
    dispatch({
      type: 'CREATE_ISSUE',
      issue: {
        id: `i${Date.now()}`,
        identifier,
        number: counter,
        title: subIssueTitle.trim(),
        description: '',
        stateId: team?.workflowStates?.find(s => s.category === 'unstarted')?.id || team?.workflowStates?.[0]?.id,
        priority: 0,
        estimate: null,
        assigneeId: null,
        creatorId: state.currentUserId,
        teamId: issue.teamId,
        projectId: issue.projectId,
        cycleId: null,
        labelIds: [],
        parentId: issue.id,
        dueDate: null,
        subscriberIds: [state.currentUserId],
        relationIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        sortOrder: Date.now(),
      },
    });
    setSubIssueTitle('');
    setShowAddSubIssue(false);
  }

  const currentUser = state.users?.find(u => u.id === state.currentUserId);

  return (
    <div className="issue-detail-page">
      {/* Left content */}
      <div className="issue-detail-main">
        {/* Breadcrumb */}
        <div className="issue-breadcrumb">
          <Link to={toPath(`/team/${issue.teamId}/issues`)} className="breadcrumb-link">{team?.name}</Link>
          <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
          <Link to={toPath(`/team/${issue.teamId}/issues`)} className="breadcrumb-link">Issues</Link>
          <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
          <span className="breadcrumb-current">{issue.identifier}</span>
        </div>

        {/* Title */}
        {editTitle ? (
          <input
            className="issue-title-input"
            value={titleVal}
            onChange={e => setTitleVal(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditTitle(false); }}
            autoFocus
          />
        ) : (
          <h1 className="issue-title" onClick={() => setEditTitle(true)}>{issue.title}</h1>
        )}

        {/* Description */}
        <div className="issue-description-area">
          {editDesc ? (
            <div>
              <textarea
                className="issue-desc-textarea"
                value={descVal}
                onChange={e => setDescVal(e.target.value)}
                onBlur={saveDesc}
                placeholder="Add description..."
                autoFocus
              />
              <div className="issue-desc-actions">
                <button className="btn-primary" onClick={saveDesc}>Save</button>
                <button className="btn-ghost" onClick={() => setEditDesc(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div
              className={`issue-description ${!issue.description ? 'empty' : ''}`}
              onClick={() => setEditDesc(true)}
            >
              {issue.description
                ? <pre className="issue-desc-text">{issue.description}</pre>
                : <span className="issue-desc-placeholder">Add description...</span>
              }
            </div>
          )}
        </div>

        {/* Sub-issues */}
        <div className="issue-section">
          <div className="issue-section-header">
            <span className="issue-section-title">Sub-issues</span>
            {subIssues.length > 0 && <span className="issue-section-count">{subIssues.length}</span>}
            <button className="issue-section-add" onClick={() => setShowAddSubIssue(!showAddSubIssue)}>
              <Plus size={13} />
            </button>
          </div>
          {showAddSubIssue && (
            <div className="sub-issue-form">
              <input
                className="sub-issue-input"
                placeholder="Sub-issue title..."
                value={subIssueTitle}
                onChange={e => setSubIssueTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createSubIssue(); if (e.key === 'Escape') setShowAddSubIssue(false); }}
                autoFocus
              />
              <button className="btn-primary btn-sm" onClick={createSubIssue} disabled={!subIssueTitle.trim()}>Create</button>
            </div>
          )}
          {subIssues.map(sub => {
            const subState = team?.workflowStates?.find(s => s.id === sub.stateId);
            return (
              <div key={sub.id} className="sub-issue-row" onClick={() => navigate(toPath(`/issue/${sub.id}`))}>
                <StatusIcon state={subState} size={13} />
                <span className="sub-issue-id">{sub.identifier}</span>
                <span className="sub-issue-title">{sub.title}</span>
              </div>
            );
          })}
        </div>

        {/* Comments / Activity */}
        <div className="issue-section">
          <div className="issue-tabs">
            <button className={`issue-tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
              Comments {comments.length > 0 && <span className="tab-count">{comments.length}</span>}
            </button>
            <button className={`issue-tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
              Activity
            </button>
          </div>

          {activeTab === 'comments' ? (
            <div>
              {comments.map(c => {
                const author = state.users?.find(u => u.id === c.userId);
                const replies = state.comments?.filter(r => r.parentId === c.id) || [];
                return (
                  <div key={c.id} className="comment">
                    <Avatar user={author} size={24} />
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-author">{author?.name}</span>
                        <span className="comment-time">{formatRelativeTime(c.createdAt)}</span>
                      </div>
                      <div className="comment-text">{c.body}</div>
                      {replies.map(r => {
                        const rAuthor = state.users?.find(u => u.id === r.userId);
                        return (
                          <div key={r.id} className="comment-reply">
                            <Avatar user={rAuthor} size={18} />
                            <div className="comment-body">
                              <div className="comment-header">
                                <span className="comment-author">{rAuthor?.name}</span>
                                <span className="comment-time">{formatRelativeTime(r.createdAt)}</span>
                              </div>
                              <div className="comment-text">{r.body}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div className="comment-input-area">
                <Avatar user={currentUser} size={24} />
                <div className="comment-input-wrapper">
                  <textarea
                    className="comment-textarea"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addComment(); }}
                    rows={3}
                  />
                  <div className="comment-input-footer">
                    <span className="comment-hint">Cmd+Enter to submit</span>
                    <button className="btn-primary btn-sm" onClick={addComment} disabled={!commentText.trim()}>
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-dot" style={{ background: 'var(--accent)' }} />
                <span className="activity-text">
                  <strong>{state.users?.find(u => u.id === issue.creatorId)?.name}</strong> created this issue
                </span>
                <span className="activity-time">{formatRelativeTime(issue.createdAt)}</span>
              </div>
              {issue.completedAt && (
                <div className="activity-item">
                  <div className="activity-dot" style={{ background: 'var(--success)' }} />
                  <span className="activity-text">Issue completed</span>
                  <span className="activity-time">{formatRelativeTime(issue.completedAt)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="issue-detail-sidebar">
        <PropertyRow label="Status">
          <StatusSelect issue={issue} team={team} dispatch={dispatch} />
        </PropertyRow>
        <PropertyRow label="Priority">
          <PrioritySelect issue={issue} dispatch={dispatch} />
        </PropertyRow>
        <PropertyRow label="Assignee">
          <AssigneeSelect issue={issue} team={team} users={state.users || []} dispatch={dispatch} />
        </PropertyRow>
        <PropertyRow label="Labels">
          <LabelSelect issue={issue} labels={state.labels || []} dispatch={dispatch} />
        </PropertyRow>
        <PropertyRow label="Project">
          <ProjectSelect issue={issue} projects={state.projects || []} dispatch={dispatch} />
        </PropertyRow>
        <PropertyRow label="Cycle">
          <CycleSelect issue={issue} cycles={state.cycles || []} dispatch={dispatch} />
        </PropertyRow>
        <PropertyRow label="Estimate">
          <EstimateSelect issue={issue} dispatch={dispatch} />
        </PropertyRow>
        <PropertyRow label="Due date">
          <DueDateSelect issue={issue} dispatch={dispatch} />
        </PropertyRow>
        {issue.parentId && (
          <PropertyRow label="Parent">
            <button className="prop-select-btn" onClick={() => navigate(toPath(`/issue/${issue.parentId}`))}>
              <span>{state.issues?.find(i => i.id === issue.parentId)?.identifier}</span>
            </button>
          </PropertyRow>
        )}
        <PropertyRow label="Subscribers">
          <div className="subscribers-row">
            {(issue.subscriberIds || []).map(uid => {
              const u = state.users?.find(u => u.id === uid);
              return u ? <Avatar key={uid} user={u} size={20} /> : null;
            })}
          </div>
        </PropertyRow>
      </div>
    </div>
  );
}
