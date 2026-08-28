import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  calculatePriority, getPriorityLabel, getPriorityColor, getIncidentStateLabel,
  getUserDisplayName, getGroupDisplayName, generateId, getNextNumber
} from '../utils/dataManager';
import ReferenceField from '../components/ReferenceField';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES = {
  'Inquiry / Help': [''],
  'Software': ['Email', 'Operating System', 'Application'],
  'Hardware': ['Computer', 'Disk', 'Keyboard', 'Monitor', 'Mouse', 'Printer'],
  'Network': ['VPN', 'Wireless', 'Connectivity', 'DNS'],
  'Database': ['Oracle', 'SQL Server', 'DB2'],
};

const STATES = [
  { value: 1, label: 'New' }, { value: 2, label: 'In Progress' }, { value: 3, label: 'On Hold' },
  { value: 6, label: 'Resolved' }, { value: 7, label: 'Closed' }, { value: 8, label: 'Cancelled' },
];
const IMPACTS = [{ value: 1, label: '1 - High' }, { value: 2, label: '2 - Medium' }, { value: 3, label: '3 - Low' }];
const URGENCIES = [{ value: 1, label: '1 - High' }, { value: 2, label: '2 - Medium' }, { value: 3, label: '3 - Low' }];
const CONTACT_TYPES = ['Phone', 'Email', 'Self-service', 'Walk-in'];
const CLOSE_CODES = ['Solved (Permanently)', 'Solved (Workaround)', 'Not Solved', 'Closed/Resolved by Caller'];

export default function IncidentForm() {
  const { state, dispatch } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';

  const isNew = !id || id === 'create';
  const existing = !isNew ? state.incidents.find(i => i.sys_id === id) : null;

  const defaultForm = isNew ? {
    sys_id: generateId(),
    number: getNextNumber(state.incidents, 'INC'),
    caller_id: '',
    category: '',
    subcategory: '',
    contact_type: 'Phone',
    short_description: '',
    description: '',
    state: 1,
    impact: 2,
    urgency: 2,
    priority: 3,
    assignment_group: '',
    assigned_to: '',
    opened_at: new Date().toISOString(),
    opened_by: state.currentUser.sys_id,
    resolved_at: null,
    resolved_by: null,
    closed_at: null,
    closed_by: null,
    close_code: '',
    close_notes: '',
    updated_at: new Date().toISOString(),
    sla_due: null,
    cmdb_ci: '',
    knowledge: false,
  } : { ...existing };

  const [form, setForm] = useState(defaultForm);
  const [activeTab, setActiveTab] = useState('notes');
  const [commentText, setCommentText] = useState('');
  const [workNoteText, setWorkNoteText] = useState('');
  const [errors, setErrors] = useState({});

  if (!isNew && !existing) {
    return <div className="sn-page-body"><p>Incident not found.</p></div>;
  }

  const update = (field, value) => {
    const next = { ...form, [field]: value };
    if (field === 'impact' || field === 'urgency') {
      const impact = field === 'impact' ? value : next.impact;
      const urgency = field === 'urgency' ? value : next.urgency;
      next.priority = calculatePriority(impact, urgency);
    }
    if (field === 'category') {
      next.subcategory = '';
    }
    // Clear field error on change
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
    setForm(next);
  };

  const validateForm = () => {
    const errs = {};
    if (!form.short_description.trim()) errs.short_description = 'Short description is required.';
    if (!form.assignment_group) errs.assignment_group = 'Assignment group is required.';
    return errs;
  };

  const subcategories = CATEGORIES[form.category] || [];

  const userOptions = state.users.map(u => ({ value: u.sys_id, label: `${u.first_name} ${u.last_name}` }));
  const groupOptions = state.groups.map(g => ({ value: g.sys_id, label: g.name }));
  const ciOptions = state.cmdbItems.map(c => ({ value: c.sys_id, label: c.name }));

  const journalEntries = (state.journal || [])
    .filter(j => j.element_id === form.sys_id)
    .sort((a, b) => new Date(b.sys_created_on) - new Date(a.sys_created_on));

  // Related records: problems that reference this incident, and incidents sharing the same CI
  const relatedProblems = state.problems.filter(p =>
    (p.related_incidents || []).includes(form.sys_id)
  );
  const relatedChanges = state.changeRequests.filter(c =>
    form.cmdb_ci && c.cmdb_ci === form.cmdb_ci && c.sys_id !== form.sys_id
  );
  const relatedIncidents = form.cmdb_ci
    ? state.incidents.filter(i => i.cmdb_ci === form.cmdb_ci && i.sys_id !== form.sys_id)
    : [];

  const handleSubmit = () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const data = { ...form, updated_at: new Date().toISOString() };
    if (isNew) {
      dispatch({ type: 'ADD_INCIDENT', payload: data });
    } else {
      dispatch({ type: 'UPDATE_INCIDENT', payload: data });
    }
    navigate('/incident/list' + sp);
  };

  const handleResolve = () => {
    // Validate required fields first
    const errs = validateForm();
    // Also require close_code and close_notes for resolution
    if (!form.close_code) {
      errs.close_code = 'Close code is required before resolving.';
    }
    if (!form.close_notes.trim()) {
      errs.close_notes = 'Close notes are required before resolving.';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setActiveTab('resolution');
      return;
    }
    const data = { ...form, state: 6, resolved_at: new Date().toISOString(), resolved_by: state.currentUser.sys_id, updated_at: new Date().toISOString() };
    if (isNew) {
      dispatch({ type: 'ADD_INCIDENT', payload: data });
    } else {
      dispatch({ type: 'UPDATE_INCIDENT', payload: data });
    }
    navigate('/incident/list' + sp);
  };

  const handleDelete = () => {
    if (!isNew && window.confirm(`Delete incident ${form.number}? This action cannot be undone.`)) {
      dispatch({ type: 'DELETE_INCIDENT', payload: form.sys_id });
      navigate('/incident/list' + sp);
    }
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    dispatch({
      type: 'ADD_JOURNAL_ENTRY',
      payload: {
        sys_id: generateId(),
        element_id: form.sys_id,
        element: 'comments',
        value: commentText.trim(),
        sys_created_by: state.currentUser.sys_id,
        sys_created_on: new Date().toISOString(),
        name: 'incident',
      }
    });
    setCommentText('');
  };

  const handlePostWorkNote = () => {
    if (!workNoteText.trim()) return;
    dispatch({
      type: 'ADD_JOURNAL_ENTRY',
      payload: {
        sys_id: generateId(),
        element_id: form.sys_id,
        element: 'work_notes',
        value: workNoteText.trim(),
        sys_created_by: state.currentUser.sys_id,
        sys_created_on: new Date().toISOString(),
        name: 'incident',
      }
    });
    setWorkNoteText('');
  };

  return (
    <div className="sn-page">
      <div className="sn-form-header">
        <div className="sn-form-header-left">
          <button className="sn-form-back" onClick={() => navigate('/incident/list' + sp)}><ArrowLeft size={18} /></button>
          <h1 className="sn-page-title" style={{ fontSize: 16 }}>
            {isNew ? 'Incident - New record' : `Incident ${form.number}`}
          </h1>
        </div>
        <div className="sn-form-header-right">
          <button className="sn-btn" onClick={handleSubmit}>
            {isNew ? 'Submit' : 'Update'}
          </button>
          <button className="sn-btn" onClick={handleResolve}>Resolve</button>
          {!isNew && (
            <button className="sn-btn sn-btn-danger" onClick={handleDelete}>Delete</button>
          )}
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
          {/* Left column */}
          <div>
            <div className="sn-form-row">
              <label className="sn-form-label">Number</label>
              <div className="sn-form-field">
                <input className="sn-form-input" value={form.number} readOnly />
              </div>
            </div>
            <div className="sn-form-row">
              <label className="sn-form-label">Caller</label>
              <div className="sn-form-field">
                <ReferenceField
                  value={form.caller_id}
                  displayValue={getUserDisplayName(state.users, form.caller_id)}
                  options={userOptions}
                  onChange={v => update('caller_id', v || '')}
                />
              </div>
            </div>
            <div className="sn-form-row">
              <label className="sn-form-label">Category</label>
              <div className="sn-form-field">
                <select className="sn-form-select" value={form.category} onChange={e => update('category', e.target.value)}>
                  <option value="">-- None --</option>
                  {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="sn-form-row">
              <label className="sn-form-label">Subcategory</label>
              <div className="sn-form-field">
                <select className="sn-form-select" value={form.subcategory} onChange={e => update('subcategory', e.target.value)}>
                  <option value="">-- None --</option>
                  {subcategories.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="sn-form-row">
              <label className="sn-form-label">Configuration item</label>
              <div className="sn-form-field">
                <ReferenceField
                  value={form.cmdb_ci}
                  displayValue={state.cmdbItems.find(c => c.sys_id === form.cmdb_ci)?.name || ''}
                  options={ciOptions}
                  onChange={v => update('cmdb_ci', v || '')}
                />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div>
            <div className="sn-form-row">
              <label className="sn-form-label">State</label>
              <div className="sn-form-field">
                <select className="sn-form-select" value={form.state} onChange={e => update('state', Number(e.target.value))}>
                  {STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="sn-form-row">
              <label className="sn-form-label">Opened</label>
              <div className="sn-form-field">
                <input className="sn-form-input" value={form.opened_at ? format(new Date(form.opened_at), 'yyyy-MM-dd HH:mm:ss') : ''} readOnly />
              </div>
            </div>
            <div className="sn-form-row">
              <label className="sn-form-label">Opened by</label>
              <div className="sn-form-field">
                <input className="sn-form-input" value={getUserDisplayName(state.users, form.opened_by)} readOnly />
              </div>
            </div>
            <div className="sn-form-row">
              <label className="sn-form-label">Contact type</label>
              <div className="sn-form-field">
                <select className="sn-form-select" value={form.contact_type} onChange={e => update('contact_type', e.target.value)}>
                  {CONTACT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className={`sn-form-row ${errors.assignment_group ? 'sn-field-error' : ''}`}>
              <label className="sn-form-label">Assignment group <span className="mandatory">*</span></label>
              <div className="sn-form-field">
                <ReferenceField
                  value={form.assignment_group}
                  displayValue={getGroupDisplayName(state.groups, form.assignment_group)}
                  options={groupOptions}
                  onChange={v => update('assignment_group', v || '')}
                />
              </div>
            </div>
            <div className="sn-form-row">
              <label className="sn-form-label">Assigned to</label>
              <div className="sn-form-field">
                <ReferenceField
                  value={form.assigned_to}
                  displayValue={getUserDisplayName(state.users, form.assigned_to)}
                  options={userOptions}
                  onChange={v => update('assigned_to', v || '')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority section */}
        <div className="sn-form-section" style={{ marginTop: 16 }}>
          <div className="sn-form-grid">
            <div>
              <div className="sn-form-row">
                <label className="sn-form-label">Impact <span className="mandatory">*</span></label>
                <div className="sn-form-field">
                  <select className="sn-form-select" value={form.impact} onChange={e => update('impact', Number(e.target.value))}>
                    {IMPACTS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <div className="sn-form-row">
                <label className="sn-form-label">Urgency <span className="mandatory">*</span></label>
                <div className="sn-form-field">
                  <select className="sn-form-select" value={form.urgency} onChange={e => update('urgency', Number(e.target.value))}>
                    {URGENCIES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <div className="sn-form-row">
                <label className="sn-form-label">Priority</label>
                <div className="sn-form-field">
                  <span className="sn-priority-badge" style={{ background: getPriorityColor(form.priority) }}>
                    {getPriorityLabel(form.priority)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description section */}
        <div className="sn-form-section">
          <div className={`sn-form-row ${errors.short_description ? 'sn-field-error' : ''}`}>
            <label className="sn-form-label">Short description <span className="mandatory">*</span></label>
            <div className="sn-form-field" style={{ flex: 1 }}>
              <input className="sn-form-input" value={form.short_description} onChange={e => update('short_description', e.target.value)} />
              {errors.short_description && <div className="sn-field-error-text">{errors.short_description}</div>}
            </div>
          </div>
          <div className="sn-form-row">
            <label className="sn-form-label">Description</label>
            <div className="sn-form-field" style={{ flex: 1 }}>
              <textarea className="sn-form-textarea" rows={4} value={form.description} onChange={e => update('description', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sn-tabs">
          <button className={`sn-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>Notes</button>
          <button className={`sn-tab ${activeTab === 'related' ? 'active' : ''}`} onClick={() => setActiveTab('related')}>
            Related Records {(relatedProblems.length + relatedChanges.length + relatedIncidents.length) > 0 ? `(${relatedProblems.length + relatedChanges.length + relatedIncidents.length})` : ''}
          </button>
          <button className={`sn-tab ${activeTab === 'resolution' ? 'active' : ''}`} onClick={() => setActiveTab('resolution')}>
            Resolution Information {(errors.close_code || errors.close_notes) ? '\u26A0\uFE0F' : ''}
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
                    <div className="sn-activity-header">
                      <strong>{getUserDisplayName(state.users, j.sys_created_by)}</strong>
                      <span className="sn-activity-time">{formatDistanceToNow(new Date(j.sys_created_on), { addSuffix: true })}</span>
                      <span style={{ marginLeft: 8, fontSize: 11, color: '#999' }}>({j.element === 'work_notes' ? 'Work Note' : 'Comment'})</span>
                    </div>
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
            {relatedProblems.length === 0 && relatedChanges.length === 0 && relatedIncidents.length === 0 ? (
              <p style={{ color: '#999', fontSize: 13 }}>No related records.</p>
            ) : (
              <>
                {relatedProblems.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div className="sn-form-section-title" style={{ marginBottom: 8 }}>Related Problems</div>
                    {relatedProblems.map(p => (
                      <div key={p.sys_id} style={{ padding: '4px 0', fontSize: 13 }}>
                        <a className="sn-table-link" onClick={() => navigate(`/problem/${p.sys_id}${sp}`)}>{p.number}</a>
                        {' '}&mdash; {p.short_description}
                        <span style={{ marginLeft: 8, color: '#666', fontSize: 12 }}>[{p.state === 5 ? 'Resolved' : p.state === 6 ? 'Closed' : 'Open'}]</span>
                      </div>
                    ))}
                  </div>
                )}
                {relatedIncidents.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div className="sn-form-section-title" style={{ marginBottom: 8 }}>Related Incidents (same CI)</div>
                    {relatedIncidents.map(i => (
                      <div key={i.sys_id} style={{ padding: '4px 0', fontSize: 13 }}>
                        <a className="sn-table-link" onClick={() => navigate(`/incident/${i.sys_id}${sp}`)}>{i.number}</a>
                        {' '}&mdash; {i.short_description}
                      </div>
                    ))}
                  </div>
                )}
                {relatedChanges.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div className="sn-form-section-title" style={{ marginBottom: 8 }}>Related Change Requests (same CI)</div>
                    {relatedChanges.map(c => (
                      <div key={c.sys_id} style={{ padding: '4px 0', fontSize: 13 }}>
                        <a className="sn-table-link" onClick={() => navigate(`/change/${c.sys_id}${sp}`)}>{c.number}</a>
                        {' '}&mdash; {c.short_description}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'resolution' && (
          <div>
            <div className={`sn-form-row ${errors.close_code ? 'sn-field-error' : ''}`}>
              <label className="sn-form-label">Close code <span className="mandatory">*</span></label>
              <div className="sn-form-field">
                <select className="sn-form-select" value={form.close_code} onChange={e => update('close_code', e.target.value)}>
                  <option value="">-- None --</option>
                  {CLOSE_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.close_code && <div className="sn-field-error-text">{errors.close_code}</div>}
              </div>
            </div>
            <div className={`sn-form-row ${errors.close_notes ? 'sn-field-error' : ''}`}>
              <label className="sn-form-label">Close notes <span className="mandatory">*</span></label>
              <div className="sn-form-field">
                <textarea className="sn-form-textarea" rows={4} value={form.close_notes} onChange={e => update('close_notes', e.target.value)} />
                {errors.close_notes && <div className="sn-field-error-text">{errors.close_notes}</div>}
              </div>
            </div>
            {form.resolved_at && (
              <div className="sn-form-row">
                <label className="sn-form-label">Resolved at</label>
                <div className="sn-form-field">
                  <input className="sn-form-input" value={format(new Date(form.resolved_at), 'yyyy-MM-dd HH:mm:ss')} readOnly />
                </div>
              </div>
            )}
            {form.resolved_by && (
              <div className="sn-form-row">
                <label className="sn-form-label">Resolved by</label>
                <div className="sn-form-field">
                  <input className="sn-form-input" value={getUserDisplayName(state.users, form.resolved_by)} readOnly />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
