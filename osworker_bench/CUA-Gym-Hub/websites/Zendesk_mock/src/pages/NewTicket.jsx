import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function NewTicket() {
  const { state, dispatch } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;

  const [form, setForm] = useState({
    requester: '',
    subject: '',
    description: '',
    type: '',
    priority: 'normal',
    group_id: state.groups[0]?.id || 1,
    assignee_id: '',
    tags: '',
  });
  const [requesterSuggestions, setRequesterSuggestions] = useState([]);
  const [selectedRequester, setSelectedRequester] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('open');
  const [showSubmitDropdown, setShowSubmitDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const submitDropdownRef = useRef(null);

  // Click-outside for submit dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSubmitDropdown && submitDropdownRef.current && !submitDropdownRef.current.contains(e.target)) {
        setShowSubmitDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSubmitDropdown]);

  const endUsers = state.users.filter(u => u.role === 'end-user');
  const agents = state.users.filter(u => u.role === 'agent');

  const handleRequesterInput = (val) => {
    setForm(f => ({ ...f, requester: val }));
    setSelectedRequester(null);
    setTouched(t => ({ ...t, requester: true }));
    if (val.length >= 2) {
      const matches = endUsers.filter(u =>
        u.name.toLowerCase().includes(val.toLowerCase()) ||
        u.email.toLowerCase().includes(val.toLowerCase())
      );
      setRequesterSuggestions(matches.slice(0, 5));
    } else {
      setRequesterSuggestions([]);
    }
  };

  const selectRequester = (user) => {
    setSelectedRequester(user);
    setForm(f => ({ ...f, requester: user.name }));
    setRequesterSuggestions([]);
    setErrors(e => ({ ...e, requester: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedRequester) {
      newErrors.requester = 'Please select a requester from the dropdown';
    }
    if (!form.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }
    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched(t => ({ ...t, [field]: true }));
    const newErrors = validate();
    setErrors(newErrors);
  };

  const handleSubmit = () => {
    const newErrors = validate();
    setErrors(newErrors);
    setTouched({ requester: true, subject: true, description: true });

    if (Object.keys(newErrors).length > 0) {
      addToast('Please fix the errors before submitting', 'error');
      return;
    }

    const maxId = Math.max(...state.tickets.map(t => t.id), 1000);
    const newId = maxId + 1;
    const now = new Date().toISOString();

    const newTicket = {
      id: newId,
      subject: form.subject.trim(),
      description: form.description.trim(),
      status: submitStatus,
      type: form.type || null,
      priority: form.priority || null,
      requester_id: selectedRequester.id,
      submitter_id: state.currentUser.id,
      assignee_id: form.assignee_id ? parseInt(form.assignee_id) : null,
      group_id: parseInt(form.group_id),
      organization_id: selectedRequester.organization_id,
      collaborator_ids: [],
      follower_ids: [],
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      via: { channel: 'web' },
      satisfaction_rating: null,
      due_at: null,
      is_public: true,
      custom_fields: [],
      created_at: now,
      updated_at: now,
      comment_count: 0,
      sla: { first_reply_at: null, next_reply_due: null, breached: false },
    };

    const firstComment = {
      id: Date.now(),
      ticket_id: newId,
      author_id: selectedRequester.id,
      body: form.description.trim(),
      html_body: `<p>${form.description.trim().replace(/\n/g, '<br>')}</p>`,
      public: true,
      type: 'Comment',
      attachments: [],
      created_at: now,
    };

    dispatch({ type: 'ADD_TICKET', payload: newTicket });
    dispatch({ type: 'ADD_COMMENT', payload: { ticketId: newId, comment: firstComment } });
    dispatch({ type: 'OPEN_TICKET_TAB', payload: newId });
    addToast(`Ticket #${newId} created`);
    navigate(appendQuery(`/tickets/${newId}`));
  };

  const filteredAgents = form.group_id
    ? agents.filter(a => a.group_id === parseInt(form.group_id))
    : agents;

  const errorStyle = { fontSize: 12, color: '#CC3340', marginTop: 4 };
  const errorBorderStyle = { borderColor: '#CC3340' };

  return (
    <div className="new-ticket-page">
      <h1 className="new-ticket-title">New Ticket</h1>

      <div className="form-group form-autocomplete">
        <label className="form-label">Requester <span className="required">*</span></label>
        <input
          className="form-input"
          style={touched.requester && errors.requester ? errorBorderStyle : {}}
          placeholder="Search for a requester..."
          value={form.requester}
          onChange={e => handleRequesterInput(e.target.value)}
          onBlur={() => handleBlur('requester')}
        />
        {requesterSuggestions.length > 0 && (
          <div className="form-autocomplete-dropdown">
            {requesterSuggestions.map(u => (
              <div key={u.id} className="form-autocomplete-item" onClick={() => selectRequester(u)}>
                {u.name} <span className="email">{u.email}</span>
              </div>
            ))}
          </div>
        )}
        {selectedRequester && (
          <div style={{ fontSize: 12, color: '#186F50', marginTop: 4 }}>
            Selected: {selectedRequester.name} ({selectedRequester.email})
          </div>
        )}
        {touched.requester && errors.requester && (
          <div style={errorStyle}>{errors.requester}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Subject <span className="required">*</span></label>
        <input
          className="form-input"
          style={touched.subject && errors.subject ? errorBorderStyle : {}}
          placeholder="Enter ticket subject..."
          value={form.subject}
          onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
          onBlur={() => handleBlur('subject')}
        />
        {touched.subject && errors.subject && (
          <div style={errorStyle}>{errors.subject}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Description <span className="required">*</span></label>
        <textarea
          className="form-textarea"
          style={touched.description && errors.description ? errorBorderStyle : {}}
          placeholder="Describe the issue..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          onBlur={() => handleBlur('description')}
        />
        {touched.description && errors.description && (
          <div style={errorStyle}>{errors.description}</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="">--</option>
            <option value="question">Question</option>
            <option value="incident">Incident</option>
            <option value="problem">Problem</option>
            <option value="task">Task</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            <option value="">--</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Group</label>
          <select className="form-select" value={form.group_id} onChange={e => setForm(f => ({ ...f, group_id: e.target.value, assignee_id: '' }))}>
            {state.groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Assignee</label>
          <select className="form-select" value={form.assignee_id} onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))}>
            <option value="">-- Unassigned --</option>
            {filteredAgents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tags</label>
        <input
          className="form-input"
          placeholder="Comma-separated tags..."
          value={form.tags}
          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, position: 'relative' }} ref={submitDropdownRef}>
        <div className="submit-btn">
          <button className="submit-btn-main" onClick={handleSubmit}>
            Submit as {submitStatus.charAt(0).toUpperCase() + submitStatus.slice(1)}
          </button>
          <button className="submit-btn-caret" onClick={() => setShowSubmitDropdown(!showSubmitDropdown)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
        {showSubmitDropdown && (
          <div className="submit-dropdown">
            {['new', 'open', 'pending', 'hold', 'solved'].map(s => (
              <button
                key={s}
                className="submit-dropdown-item"
                onClick={() => { setSubmitStatus(s); setShowSubmitDropdown(false); }}
              >
                Submit as {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
