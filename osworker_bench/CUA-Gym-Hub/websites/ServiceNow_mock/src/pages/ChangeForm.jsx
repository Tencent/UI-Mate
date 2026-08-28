import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getPriorityLabel, getPriorityColor, getChangeStateLabel, getUserDisplayName, getGroupDisplayName, generateId, getNextNumber } from '../utils/dataManager';
import ReferenceField from '../components/ReferenceField';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

const CHANGE_STATES = [
  { value: -5, label: 'New' }, { value: -4, label: 'Assess' }, { value: -3, label: 'Authorize' },
  { value: -2, label: 'Scheduled' }, { value: -1, label: 'Implement' }, { value: 0, label: 'Review' },
  { value: 3, label: 'Closed' }, { value: 4, label: 'Cancelled' },
];
const RISKS = ['High', 'Moderate', 'Low'];
const IMPACTS = [{ value: 1, label: '1 - High' }, { value: 2, label: '2 - Medium' }, { value: 3, label: '3 - Low' }];
const CLOSE_CODES = ['Successful', 'Unsuccessful', 'Cancelled'];

export default function ChangeForm() {
  const { state, dispatch } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';
  const isNew = !id || id === 'create';
  const existing = !isNew ? state.changeRequests.find(c => c.sys_id === id) : null;

  const [changeType, setChangeType] = useState(isNew ? null : existing?.type);
  const [workNoteText, setWorkNoteText] = useState('');
  const [activeTab, setActiveTab] = useState('notes');

  const defaultForm = isNew ? {
    sys_id: generateId(), number: getNextNumber(state.changeRequests, 'CHG'), type: '', short_description: '', description: '',
    state: -5, priority: 3, impact: 2, risk: 'Moderate', category: '', assignment_group: '', assigned_to: '',
    requested_by: state.currentUser.sys_id, opened_at: new Date().toISOString(), opened_by: state.currentUser.sys_id,
    start_date: '', end_date: '', close_code: '', close_notes: '', updated_at: new Date().toISOString(),
    cmdb_ci: '', approval: 'Not Yet Requested', conflict_status: 'Not Run',
  } : { ...existing };

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  if (!isNew && !existing) return <div className="sn-page-body"><p>Change request not found.</p></div>;

  // Type interceptor page for new changes
  if (isNew && !changeType) {
    return (
      <div className="sn-page">
        <div className="sn-form-header">
          <div className="sn-form-header-left">
            <button className="sn-form-back" onClick={() => navigate('/change/list' + sp)}><ArrowLeft size={18} /></button>
            <h1 className="sn-page-title" style={{ fontSize: 16 }}>Create Change Request</h1>
          </div>
        </div>
        <div className="sn-change-type-page">
          <h1>What type of change is required?</h1>
          <div className="sn-change-type-card" onClick={() => { setChangeType('Normal'); setForm(f => ({ ...f, type: 'Normal' })); }}>
            <h3>Create Normal Change</h3>
            <p>A change that requires assessment, authorization, and scheduled implementation. Follows the full change management process including CAB approval.</p>
          </div>
          <div className="sn-change-type-card" onClick={() => { setChangeType('Standard'); setForm(f => ({ ...f, type: 'Standard' })); }}>
            <h3>Create Standard Change</h3>
            <p>A pre-approved, low-risk change that follows an established template. Does not require individual CAB approval. Examples: routine patching, standard software installations.</p>
          </div>
          <div className="sn-change-type-card" onClick={() => { setChangeType('Emergency'); setForm(f => ({ ...f, type: 'Emergency' })); }}>
            <h3>Create Emergency Change</h3>
            <p>An urgent change needed to resolve a critical incident or prevent an imminent major outage. Expedited approval process with post-implementation review.</p>
          </div>
        </div>
      </div>
    );
  }

  const update = (field, value) => {
    setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
    setForm(f => ({ ...f, [field]: value }));
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

  const handleSubmit = () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const data = { ...form, updated_at: new Date().toISOString() };
    dispatch({ type: isNew ? 'ADD_CHANGE' : 'UPDATE_CHANGE', payload: data });
    navigate('/change/list' + sp);
  };

  const handleApprove = () => {
    const data = { ...form, approval: 'Approved', updated_at: new Date().toISOString() };
    dispatch({ type: 'UPDATE_CHANGE', payload: data });
    setForm(data);
  };

  const handleReject = () => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason !== null) {
      const data = { ...form, approval: 'Rejected', close_notes: reason, state: 4, updated_at: new Date().toISOString() };
      dispatch({ type: 'UPDATE_CHANGE', payload: data });
      navigate('/change/list' + sp);
    }
  };

  const handleDelete = () => {
    if (!isNew && window.confirm(`Delete change request ${form.number}? This action cannot be undone.`)) {
      dispatch({ type: 'DELETE_CHANGE', payload: form.sys_id });
      navigate('/change/list' + sp);
    }
  };

  const handlePostWorkNote = () => {
    if (!workNoteText.trim()) return;
    dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: { sys_id: generateId(), element_id: form.sys_id, element: 'work_notes', value: workNoteText.trim(), sys_created_by: state.currentUser.sys_id, sys_created_on: new Date().toISOString(), name: 'change_request' } });
    setWorkNoteText('');
  };

  return (
    <div className="sn-page">
      <div className="sn-form-header">
        <div className="sn-form-header-left">
          <button className="sn-form-back" onClick={() => navigate('/change/list' + sp)}><ArrowLeft size={18} /></button>
          <h1 className="sn-page-title" style={{ fontSize: 16 }}>{isNew ? 'Change Request - New record' : `Change Request ${form.number}`}</h1>
        </div>
        <div className="sn-form-header-right">
          <button className="sn-btn" onClick={handleSubmit}>{isNew ? 'Submit' : 'Update'}</button>
          {!isNew && form.approval === 'Requested' && (
            <>
              <button className="sn-btn sn-btn-success" onClick={handleApprove}>Approve</button>
              <button className="sn-btn sn-btn-danger" onClick={handleReject}>Reject</button>
            </>
          )}
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
            <div className="sn-form-row"><label className="sn-form-label">Requested by</label><div className="sn-form-field">
              <ReferenceField value={form.requested_by} displayValue={getUserDisplayName(state.users, form.requested_by)} options={userOptions} onChange={v => update('requested_by', v || '')} />
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Category</label><div className="sn-form-field">
              <input className="sn-form-input" value={form.category} onChange={e => update('category', e.target.value)} />
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Configuration item</label><div className="sn-form-field">
              <ReferenceField value={form.cmdb_ci} displayValue={state.cmdbItems.find(c => c.sys_id === form.cmdb_ci)?.name || ''} options={ciOptions} onChange={v => update('cmdb_ci', v || '')} />
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Priority</label><div className="sn-form-field">
              <span className="sn-priority-badge" style={{ background: getPriorityColor(form.priority) }}>{getPriorityLabel(form.priority)}</span>
            </div></div>
          </div>
          <div>
            <div className="sn-form-row"><label className="sn-form-label">Type</label><div className="sn-form-field"><input className="sn-form-input" value={form.type} readOnly /></div></div>
            <div className="sn-form-row"><label className="sn-form-label">State</label><div className="sn-form-field">
              <select className="sn-form-select" value={form.state} onChange={e => update('state', Number(e.target.value))}>{CHANGE_STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Risk</label><div className="sn-form-field">
              <select className="sn-form-select" value={form.risk} onChange={e => update('risk', e.target.value)}>{RISKS.map(r => <option key={r} value={r}>{r}</option>)}</select>
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Impact</label><div className="sn-form-field">
              <select className="sn-form-select" value={form.impact} onChange={e => update('impact', Number(e.target.value))}>{IMPACTS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}</select>
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Assignment group</label><div className="sn-form-field">
              <ReferenceField value={form.assignment_group} displayValue={getGroupDisplayName(state.groups, form.assignment_group)} options={groupOptions} onChange={v => update('assignment_group', v || '')} />
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Assigned to</label><div className="sn-form-field">
              <ReferenceField value={form.assigned_to} displayValue={getUserDisplayName(state.users, form.assigned_to)} options={userOptions} onChange={v => update('assigned_to', v || '')} />
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Approval</label><div className="sn-form-field"><input className="sn-form-input" value={form.approval} readOnly /></div></div>
          </div>
        </div>

        <div className="sn-form-section" style={{ marginTop: 12 }}>
          <div className="sn-form-row"><label className="sn-form-label">Short description <span className="mandatory">*</span></label><div className="sn-form-field" style={{ flex: 1 }}>
            <input className="sn-form-input" value={form.short_description} onChange={e => update('short_description', e.target.value)} />
            {errors.short_description && <div className="sn-field-error-text">{errors.short_description}</div>}
          </div></div>
          <div className="sn-form-row"><label className="sn-form-label">Description</label><div className="sn-form-field" style={{ flex: 1 }}><textarea className="sn-form-textarea" rows={3} value={form.description} onChange={e => update('description', e.target.value)} /></div></div>
        </div>

        <div className="sn-form-section">
          <div className="sn-form-section-title">Schedule</div>
          <div className="sn-form-grid">
            <div className="sn-form-row"><label className="sn-form-label">Planned start</label><div className="sn-form-field">
              <input className="sn-form-input" type="datetime-local" value={form.start_date ? form.start_date.slice(0, 16) : ''} onChange={e => update('start_date', e.target.value ? new Date(e.target.value).toISOString() : '')} />
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Planned end</label><div className="sn-form-field">
              <input className="sn-form-input" type="datetime-local" value={form.end_date ? form.end_date.slice(0, 16) : ''} onChange={e => update('end_date', e.target.value ? new Date(e.target.value).toISOString() : '')} />
            </div></div>
          </div>
        </div>

        {(form.state === 3) && (
          <div className="sn-form-section">
            <div className="sn-form-section-title">Closure</div>
            <div className="sn-form-row"><label className="sn-form-label">Close code</label><div className="sn-form-field">
              <select className="sn-form-select" value={form.close_code} onChange={e => update('close_code', e.target.value)}><option value="">-- None --</option>{CLOSE_CODES.map(c => <option key={c} value={c}>{c}</option>)}</select>
            </div></div>
            <div className="sn-form-row"><label className="sn-form-label">Close notes</label><div className="sn-form-field"><textarea className="sn-form-textarea" rows={3} value={form.close_notes} onChange={e => update('close_notes', e.target.value)} /></div></div>
          </div>
        )}

        <div className="sn-tabs" style={{ marginTop: 16 }}>
          <button className={`sn-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>Notes</button>
        </div>
        {activeTab === 'notes' && (
          <div>
            <div className="sn-notes-input worknotes">
              <label>Work notes</label>
              <textarea value={workNoteText} onChange={e => setWorkNoteText(e.target.value)} placeholder="Add a work note..." />
              <button className="sn-btn sn-btn-sm sn-notes-post-btn" onClick={handlePostWorkNote}>Post</button>
            </div>
            <div className="sn-activity-stream">
              {journalEntries.map(j => (
                <div key={j.sys_id} className="sn-activity-entry work-note">
                  <span className="sn-activity-icon">{'\u{1F527}'}</span>
                  <div className="sn-activity-content">
                    <div className="sn-activity-header"><strong>{getUserDisplayName(state.users, j.sys_created_by)}</strong><span className="sn-activity-time">{formatDistanceToNow(new Date(j.sys_created_on), { addSuffix: true })}</span></div>
                    <div className="sn-activity-text">{j.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
