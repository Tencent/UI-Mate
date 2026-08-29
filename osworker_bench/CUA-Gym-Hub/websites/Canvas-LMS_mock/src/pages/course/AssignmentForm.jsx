import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import './AssignmentForm.css';

export default function AssignmentForm() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useAppContext();
  const cid = parseInt(courseId);
  const isEdit = !!assignmentId;
  const aid = isEdit ? parseInt(assignmentId) : null;

  const existingAssignment = isEdit
    ? state.assignments.find(a => a.id === aid && a.course_id === cid)
    : null;

  const assignmentGroups = state.assignmentGroups.filter(g => g.course_id === cid);

  const [form, setForm] = useState({
    name: '',
    description: '',
    points_possible: 100,
    assignment_group_id: assignmentGroups[0]?.id || 1,
    grading_type: 'points',
    submission_type: 'online',
    online_text_entry: true,
    online_upload: false,
    online_url: false,
    restrict_file_types: false,
    allowed_extensions: '',
    group_assignment: false,
    peer_reviews: false,
    due_at: '',
    available_from: '',
    until: '',
  });

  useEffect(() => {
    if (existingAssignment) {
      const subTypes = existingAssignment.submission_types || [];
      let submissionType = 'online';
      if (subTypes.includes('on_paper')) submissionType = 'on_paper';
      else if (subTypes.includes('none')) submissionType = 'none';

      const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      };

      setForm({
        name: existingAssignment.name || '',
        description: existingAssignment.description?.replace(/<[^>]*>/g, '') || '',
        points_possible: existingAssignment.points_possible || 0,
        assignment_group_id: existingAssignment.assignment_group_id || assignmentGroups[0]?.id || 1,
        grading_type: existingAssignment.grading_type || 'points',
        submission_type: submissionType,
        online_text_entry: subTypes.includes('online_text_entry'),
        online_upload: subTypes.includes('online_upload'),
        online_url: subTypes.includes('online_url'),
        restrict_file_types: (existingAssignment.allowed_extensions?.length || 0) > 0,
        allowed_extensions: (existingAssignment.allowed_extensions || []).join(', '),
        group_assignment: false,
        peer_reviews: false,
        due_at: formatDateForInput(existingAssignment.due_at),
        available_from: '',
        until: '',
      });
    }
  }, [existingAssignment]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const submissionTypes = [];
    if (form.submission_type === 'on_paper') {
      submissionTypes.push('on_paper');
    } else if (form.submission_type === 'none') {
      submissionTypes.push('none');
    } else {
      if (form.online_text_entry) submissionTypes.push('online_text_entry');
      if (form.online_upload) submissionTypes.push('online_upload');
      if (form.online_url) submissionTypes.push('online_url');
      if (submissionTypes.length === 0) submissionTypes.push('online_text_entry');
    }

    const extensions = form.restrict_file_types && form.allowed_extensions
      ? form.allowed_extensions.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const dueAt = form.due_at ? new Date(form.due_at).toISOString() : null;

    if (isEdit && existingAssignment) {
      setState(prev => ({
        ...prev,
        assignments: prev.assignments.map(a =>
          a.id === aid
            ? {
                ...a,
                name: form.name,
                description: `<p>${form.description}</p>`,
                points_possible: Number(form.points_possible),
                assignment_group_id: Number(form.assignment_group_id),
                grading_type: form.grading_type,
                submission_types: submissionTypes,
                allowed_extensions: extensions.length > 0 ? extensions : undefined,
                due_at: dueAt,
              }
            : a
        )
      }));
      navigate(`/courses/${courseId}/assignments/${assignmentId}`);
    } else {
      const newId = Math.max(0, ...state.assignments.map(a => a.id)) + 1;
      const groupAssignments = state.assignments.filter(a =>
        a.course_id === cid && a.assignment_group_id === Number(form.assignment_group_id)
      );
      setState(prev => ({
        ...prev,
        assignments: [...prev.assignments, {
          id: newId,
          course_id: cid,
          assignment_group_id: Number(form.assignment_group_id),
          name: form.name || 'Untitled Assignment',
          description: form.description ? `<p>${form.description}</p>` : '',
          due_at: dueAt,
          points_possible: Number(form.points_possible),
          grading_type: form.grading_type,
          submission_types: submissionTypes,
          published: false,
          position: groupAssignments.length + 1,
          needs_grading_count: 0,
          allowed_extensions: extensions.length > 0 ? extensions : undefined,
          workflow_state: 'unpublished'
        }]
      }));
      navigate(`/courses/${courseId}/assignments`);
    }
  };

  const handleCancel = () => {
    if (isEdit) {
      navigate(`/courses/${courseId}/assignments/${assignmentId}`);
    } else {
      navigate(`/courses/${courseId}/assignments`);
    }
  };

  return (
    <div className="assignment-form-page">
      <h1>{isEdit ? 'Edit Assignment' : 'New Assignment'}</h1>

      <div className="assignment-form">
        <div className="form-field">
          <label>Assignment Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="form-input"
            placeholder="Enter assignment name"
          />
        </div>

        <div className="form-field">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="form-textarea"
            placeholder="Enter assignment description..."
            rows={6}
          />
        </div>

        <div className="form-row">
          <div className="form-field form-field-half">
            <label>Points</label>
            <input
              type="number"
              value={form.points_possible}
              onChange={(e) => handleChange('points_possible', e.target.value)}
              className="form-input"
              min="0"
            />
          </div>

          <div className="form-field form-field-half">
            <label>Assignment Group</label>
            <select
              value={form.assignment_group_id}
              onChange={(e) => handleChange('assignment_group_id', e.target.value)}
              className="form-input"
            >
              {assignmentGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-field">
          <label>Display Grade As</label>
          <select
            value={form.grading_type}
            onChange={(e) => handleChange('grading_type', e.target.value)}
            className="form-input"
            style={{ maxWidth: '300px' }}
          >
            <option value="points">Points</option>
            <option value="percent">Percentage</option>
            <option value="letter_grade">Letter Grade</option>
            <option value="gpa_scale">GPA Scale</option>
            <option value="pass_fail">Pass/Fail</option>
            <option value="not_graded">Not Graded</option>
          </select>
        </div>

        <div className="form-field">
          <label>Submission Type</label>
          <select
            value={form.submission_type}
            onChange={(e) => handleChange('submission_type', e.target.value)}
            className="form-input"
            style={{ maxWidth: '300px' }}
          >
            <option value="online">Online</option>
            <option value="on_paper">On Paper</option>
            <option value="none">No Submission</option>
          </select>
        </div>

        {form.submission_type === 'online' && (
          <div className="form-field form-checkboxes">
            <label className="section-label">Online Entry Options</label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.online_text_entry}
                onChange={(e) => handleChange('online_text_entry', e.target.checked)}
              />
              Text Entry
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.online_url}
                onChange={(e) => handleChange('online_url', e.target.checked)}
              />
              Website URL
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.online_upload}
                onChange={(e) => handleChange('online_upload', e.target.checked)}
              />
              File Uploads
            </label>

            {form.online_upload && (
              <div className="sub-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.restrict_file_types}
                    onChange={(e) => handleChange('restrict_file_types', e.target.checked)}
                  />
                  Restrict Upload File Types
                </label>
                {form.restrict_file_types && (
                  <input
                    type="text"
                    value={form.allowed_extensions}
                    onChange={(e) => handleChange('allowed_extensions', e.target.value)}
                    className="form-input"
                    placeholder="py, pdf, docx"
                    style={{ marginTop: '6px', maxWidth: '300px' }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        <div className="form-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.group_assignment}
              onChange={(e) => handleChange('group_assignment', e.target.checked)}
            />
            This is a Group Assignment
          </label>
        </div>

        <div className="form-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.peer_reviews}
              onChange={(e) => handleChange('peer_reviews', e.target.checked)}
            />
            Require Peer Reviews
          </label>
        </div>

        <div className="form-divider" />

        <div className="form-field">
          <label>Due Date</label>
          <input
            type="datetime-local"
            value={form.due_at}
            onChange={(e) => handleChange('due_at', e.target.value)}
            className="form-input"
            style={{ maxWidth: '300px' }}
          />
        </div>

        <div className="form-row">
          <div className="form-field form-field-half">
            <label>Available From</label>
            <input
              type="datetime-local"
              value={form.available_from}
              onChange={(e) => handleChange('available_from', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-field form-field-half">
            <label>Until</label>
            <input
              type="datetime-local"
              value={form.until}
              onChange={(e) => handleChange('until', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {isEdit ? 'Save' : 'Save & Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
