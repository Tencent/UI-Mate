import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculatePriority, getPriorityLabel, getPriorityColor, getProblemStateLabel, getUserDisplayName, getGroupDisplayName, generateId, getNextNumber } from '../utils/dataManager';
import ReferenceField from '../components/ReferenceField';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

const PROBLEM_STATES = [
  { value: 1, label: 'New' }, { value: 2, label: 'Assess' }, { value: 3, label: 'Root Cause Analysis' },
  { value: 4, label: 'Fix in Progress' }, { value: 5, label: 'Resolved' }, { value: 6, label: 'Closed' },
];
const IMPACTS = [{ value: 1, label: '1 - High' }, { value: 2, label: '2 - Medium' }, { value: 3, label: '3 - Low' }];
const URGENCIES = [{ value: 1, label: '1 - High' }, { value: 2, label: '2 - Medium' }, { value: 3, label: '3 - Low' }];

export default function ProblemForm() {
  const { state, dispatch } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';
  const isNew = !id || id === 'create';
  const existing = !isNew ? state.problems.find(p => p.sys_id === id) : null;

  const defaultForm = isNew ? {
    sys_id: generateId(), number: getNextNumber(state.problems, 'PRB'), short_description: '', description: '',
    state: 1, priority: 3, impact: 2, urgency: 2, assignment_group: '', assigned_to: '',
    opened_at: new Date().toISOString(), opened_by: state.currentUser.sys_id,
    resolved_at: null, closed_at: null, cause_notes: '', fix_notes: '', known_error: false,
    related_incidents: [], updated_at: new Date().toISOString(), cmdb_ci: '',
  } : { ...existing };

  const [form, setForm] = useState(defaultForm);
  const [activeTab, setActiveTab] = useState('notes');
  const [workNoteText, setWorkNoteText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [errors, setErrors] = useState({});

  if (!isNew && !existing) return <div className="sn-page-body"><p>Problem not found.</p></div>;

  const update = (field, value) => {
    const next = { ...form, [field]: value };
    if (field === 'impact' || field === 'urgency') {
      next.priority = calculatePriority(field === 'impact' ? value : next.impact, field === 'urgency' ? value : next.urgency);
    }
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
    setForm(next);
  };

  const validateForm = () => {
    const errs = {};
    if (!form.short_description.trim()) errs.short_description = 'Short description is required.';
    return errs;
  };

  const userOptions = state.users.map(u => ({ value: u.sys_id, label: `${u.first_name} ${u.last_name}` }));
  const groupOptions = state.groups.map(g => ({ value: g.sys_id, label: g.name }));
  const ciOptions = state.cmdbItems.map(c => ({ value: c.sys_id, label: c.name }));

  const journalEntries = (state.journal || []).filter(j => j.element_id === form.sys_id).sort((a, b) => new Date(b.sys_created_on) - new Date(a.sys_created_on));

  // Related incidents from form.related_incidents array
  const relatedIncidents = (form.related_incidents || [])
    .map(incId => state.incidents.find(i => i.sys_id === incId))
    .filter(Boolean);

  const handleSubmit = () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const data = { ...form, updated_at: new Date().toISOString() };
    dispatch({ type: isNew ? 'ADD_PROBLEM' : 'UPDATE_PROBLEM', payload: data });
    navigate('/problem/list' + sp);
  };

  const handleResolve = () => {
    const errs = validateForm();
    if (!form.cause_notes.trim()) errs.cause_notes = 'Root cause notes are required before resolving.';
    if (!form.fix_notes.trim()) errs.fix_notes = 'Fix notes are required before resolving.';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const data = { ...form, state: 5, resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    dispatch({ type: isNew ? 'ADD_PROBLEM' : 'UPDATE_PROBLEM', payload: data });
    navigate('/problem/list' + sp);
  };

  const handleDelete = () => {
    if (!isNew && window.confirm(`Delete problem ${form.number}? This action cannot be undone.`)) {
      dispatch({ type: 'DELETE_PROBLEM', payload: form.sys_id });
      navigate('/problem/list' + sp);
    }
  };

  const handlePostWorkNote = () => {
    if (!workNoteText.trim()) return;
    dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: { sys_id: generateId(), element_id: form.sys_id, element: 'work_notes', value: workNoteText.trim(), sys_created_by: state.currentUser.sys_id, sys_created_on: new Date().toISOString(), name: 'problem' } });
    setWorkNoteText('');
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: { sys_id: generateId(), element_id: form.sys_id, element: 'comments', value: commentText.trim(), sys_created_by: state.currentUser.sys_id, sys_created_on: new Date().toISOString(), name: 'problem' } });
    setCommentText('');
  };

  return (
    <div className="sn-page">
      <div className="sn-form-header">
        <div className="sn-form-header-left">
          <button className="sn-form-back" onClick={() => navigate('/problem/list' + sp)}><ArrowLeft size={18} /></button>
          <h1 className="sn-page-title" style={{ fontSize: 16 }}>{isNew ? 'Problem - New record' : `Problem ${form.number}`}</h1>
        </div>
        <div className="sn-form-header-right">
          <button className="sn-btn" onClick={handleSubmit}>{isNew ? 'Submit' : 'Update'}</button>
          <button className="sn-btn" onClick={handleResolve}>Resolve</button>
          {!isNew && <button className="sn-btn sn-btn-danger" onClick={handleDelete}>Delete</button>}
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="sn-form-errors">
          {Object.values(errors).map((err, i) => (
            <div key={i} className="sn-form-error-msg">{'\u26A0\uFE0F'} {err}</div>
          ))}
        </div>
      )}

      <div className="sn-form-body">
        <div className="sn-form-grid">
          <div>
            <div className="sn-form-row"><label className="sn-form-label">Number</label><div className="sn-form-field"><input className="sn-form-input" value={form.number} readOnly /></div></div>
            <div className="sn-form-row"><label className="sn-form-label">State</label><div className="sn-form-field">
              <select className="sn-form-select" value={form.state} onChange={e => update('state', Number(e.target.value))}>{PROBLEM_STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Impact <span className="mandatory">*</span></label><div className="sn-form-field">
              <select className="sn-form-select" value={form.impact} onChange={e => update('impact', Number(e.target.value))}>{IMPACTS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}</select>
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Urgency <span className="mandatory">*</span></label><div className="sn-form-field">
              <select className="sn-form-select" value={form.urgency} onChange={e => update('urgency', Number(e.target.value))}>{URGENCIES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}</select>
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Priority</label><div className="sn-form-field">
              <span className="sn-priority-badge" style={{ background: getPriorityColor(form.priority) }}>{getPriorityLabel(form.priority)}</span>
            </div></div>
          </div>
          <div>
            <div className="sn-form-row"><label className="sn-form-label">Assignment group</label><div className="sn-form-field">
              <ReferenceField value={form.assignment_group} displayValue={getGroupDisplayName(state.groups, form.assignment_group)} options={groupOptions} onChange={v => update('assignment_group', v || '')} />
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Assigned to</label><div className="sn-form-field">
              <ReferenceField value={form.assigned_to} displayValue={getUserDisplayName(state.users, form.assigned_to)} options={userOptions} onChange={v => update('assigned_to', v || '')} />
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Configuration item</label><div className="sn-form-field">
              <ReferenceField value={form.cmdb_ci} displayValue={state.cmdbItems.find(c => c.sys_id === form.cmdb_ci)?.name || ''} options={ciOptions} onChange={v => update('cmdb_ci', v || '')} />
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Known Error</label><div className="sn-form-field" style={{ paddingTop: 6 }}>
              <input type="checkbox" checked={form.known_error} onChange={e => update('known_error', e.target.checked)} />
            </div></div>
          </div>
        </div>

        <div className="sn-form-section" style={{ marginTop: 12 }}>
          <div className={`sn-form-row ${errors.short_description ? 'sn-field-error' : ''}`}>
            <label className="sn-form-label">Short description <span className="mandatory">*</span></label>
            <div className="sn-form-field" style={{ flex: 1 }}>
              <input className="sn-form-input" value={form.short_description} onChange={e => update('short_description', e.target.value)} />
              {errors.short_description && <div className="sn-field-error-text">{errors.short_description}</div>}
            </div>
          </div>
          <div className="sn-form-row"><label className="sn-form-label">Description</label><div className="sn-form-field" style={{ flex: 1 }}><textarea className="sn-form-textarea" rows={3} value={form.description} onChange={e => update('description', e.target.value)} /></div></div>
        </div>

        {form.state >= 3 && (
          <div className="sn-form-section">
            <div className={`sn-form-row ${errors.cause_notes ? 'sn-field-error' : ''}`}>
              <label className="sn-form-label">Root Cause <span className="mandatory">*</span></label>
              <div className="sn-form-field" style={{ flex: 1 }}>
                <textarea className="sn-form-textarea" rows={3} value={form.cause_notes} onChange={e => update('cause_notes', e.target.value)} />
                {errors.cause_notes && <div className="sn-field-error-text">{errors.cause_notes}</div>}
              </div>
            </div>
          </div>
        )}
        {form.state >= 4 && (
          <div className="sn-form-section">
            <div className={`sn-form-row ${errors.fix_notes ? 'sn-field-error' : ''}`}>
              <label className="sn-form-label">Fix Notes <span className="mandatory">*</span></label>
              <div className="sn-form-field" style={{ flex: 1 }}>
                <textarea className="sn-form-textarea" rows={3} value={form.fix_notes} onChange={e => update('fix_notes', e.target.value)} />
                {errors.fix_notes && <div className="sn-field-error-text">{errors.fix_notes}</div>}
              </div>
            </div>
          </div>
        )}

        <div className="sn-tabs" style={{ marginTop: 16 }}>
          <button className={`sn-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>Notes</button>
          <button className={`sn-tab ${activeTab === 'related' ? 'active' : ''}`} onClick={() => setActiveTab('related')}>
            Related Incidents {relatedIncidents.length > 0 ? `(${relatedIncidents.length})` : ''}
          </button>
        </div>

        {activeTab === 'notes' && (
          <div>
            <div className="sn-notes-input">
              <label>Additional comments (Customer visible)</label>
              <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." />
              <button className="sn-btn sn-btn-sm sn-notes-post-btn" onClick={handlePostComment}>Post</button>
            </div>
            <div className="sn-notes-input worknotes">
              <label>Work notes</label>
              <textarea value={workNoteText} onChange={e => setWorkNoteText(e.target.value)} placeholder="Add a work note..." />
              <button className="sn-btn sn-btn-sm sn-notes-post-btn" onClick={handlePostWorkNote}>Post</button>
            </div>
            <div className="sn-activity-stream">
              {journalEntries.map(j => (
                <div key={j.sys_id} className={`sn-activity-entry ${j.element === 'work_notes' ? 'work-note' : 'comment'}`}>
                  <span className="sn-activity-icon">{j.element === 'work_notes' ? '\u{1F527}' : '\u{1F4AC}'}</span>
                  <div className="sn-activity-content">
                    <div className="sn-activity-header"><strong>{getUserDisplayName(state.users, j.sys_created_by)}</strong><span className="sn-activity-time">{formatDistanceToNow(new Date(j.sys_created_on), { addSuffix: true })}</span></div>
                    <div className="sn-activity-text">{j.value}</div>
                  </div>
                </div>
              ))}
              {journalEntries.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>No activity yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'related' && (
          <div style={{ padding: '12px 0' }}>
            {relatedIncidents.length === 0 ? (
              <p style={{ color: '#999', fontSize: 13 }}>No related incidents.</p>
            ) : (
              <div>
                <div className="sn-form-section-title" style={{ marginBottom: 8 }}>Related Incidents</div>
                {relatedIncidents.map(inc => (
                  <div key={inc.sys_id} style={{ padding: '4px 0', fontSize: 13 }}>
                    <a className="sn-table-link" onClick={() => navigate(`/incident/${inc.sys_id}${sp}`)}>{inc.number}</a>
                    {' '}&mdash; {inc.short_description}
                    <span style={{ marginLeft: 8, color: '#666', fontSize: 12 }}>[{inc.state === 6 ? 'Resolved' : inc.state === 7 ? 'Closed' : 'Open'}]</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
