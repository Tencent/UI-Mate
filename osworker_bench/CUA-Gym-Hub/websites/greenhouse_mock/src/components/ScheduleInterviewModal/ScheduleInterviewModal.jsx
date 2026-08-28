import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

export default function ScheduleInterviewModal({ application, candidate, stages, onClose }) {
  const { state, dispatch } = useAppContext();
  const [form, setForm] = useState({
    stageId: application.currentStageId,
    interviewerIds: [],
    date: '',
    time: '10:00',
    duration: 60,
    location: '',
    isVideoCall: false,
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const toggleInterviewer = (userId) => {
    setForm(prev => ({
      ...prev,
      interviewerIds: prev.interviewerIds.includes(userId)
        ? prev.interviewerIds.filter(id => id !== userId)
        : [...prev.interviewerIds, userId]
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.date) errs.date = 'Required';
    if (form.interviewerIds.length === 0) errs.interviewers = 'At least one interviewer required';
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const now = new Date().toISOString();
    const scheduledAt = new Date(`${form.date}T${form.time}:00`).toISOString();
    const meetingUrl = form.isVideoCall ? `https://meet.company.com/int-${Date.now()}` : null;

    const newInterview = {
      id: uuidv4(),
      applicationId: application.id,
      stageId: form.stageId,
      interviewerIds: form.interviewerIds,
      scheduledAt,
      duration: parseInt(form.duration),
      location: form.isVideoCall ? 'Video Call' : form.location,
      status: 'scheduled',
      meetingUrl,
      notes: form.notes
    };

    dispatch({ type: 'ADD_INTERVIEW', payload: newInterview });

    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: uuidv4(),
        candidateId: candidate.id,
        applicationId: application.id,
        type: 'interview_scheduled',
        actorId: state.currentUser.id,
        description: `Interview scheduled for ${new Date(scheduledAt).toLocaleDateString()}`,
        metadata: { interviewId: newInterview.id },
        createdAt: now
      }
    });

    // Notifications for interviewers
    form.interviewerIds.forEach(uid => {
      if (uid !== state.currentUser.id) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: uuidv4(),
            type: 'interview_reminder',
            title: `Interview scheduled: ${candidate.name}`,
            message: `You have an interview with ${candidate.name} on ${new Date(scheduledAt).toLocaleDateString()}`,
            isRead: false,
            link: `/candidates/${candidate.id}`,
            createdAt: now
          }
        });
      }
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2 className="modal-title">Schedule Interview</h2>
          <button aria-label="Close dialog" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Scheduling interview for <strong>{candidate.name}</strong>
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="interview-stage">Stage</label>
            <select id="interview-stage" className="form-select" value={form.stageId} onChange={e => handleChange('stageId', e.target.value)}>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Interviewers *</label>
            {errors.interviewers && <span style={{ color: 'var(--red)', fontSize: 12, display: 'block', marginBottom: 4 }}>{errors.interviewers}</span>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6, padding: 8 }}>
              {state.users.filter(u => ['interviewer', 'hiring_manager', 'recruiter'].includes(u.role)).map(u => (
                <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, padding: '3px 0' }}>
                  <input
                    type="checkbox"
                    checked={form.interviewerIds.includes(u.id)}
                    onChange={() => toggleInterviewer(u.id)}
                  />
                  {u.name} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({u.title})</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="interview-date">Date *</label>
              <input id="interview-date" type="date" className="form-input" value={form.date} onChange={e => handleChange('date', e.target.value)} />
              {errors.date && <span style={{ color: 'var(--red)', fontSize: 12 }}>{errors.date}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="interview-time">Time</label>
              <input id="interview-time" type="time" className="form-input" value={form.time} onChange={e => handleChange('time', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="interview-duration">Duration</label>
            <select id="interview-duration" className="form-select" value={form.duration} onChange={e => handleChange('duration', parseInt(e.target.value))}>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, marginBottom: 8 }}>
              <input type="checkbox" checked={form.isVideoCall} onChange={e => handleChange('isVideoCall', e.target.checked)} />
              Video Call (generates meeting link)
            </label>
            {!form.isVideoCall && (
              <input aria-label="Interview location" className="form-input" placeholder="Conference room or address" value={form.location} onChange={e => handleChange('location', e.target.value)} />
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="interview-notes">Notes</label>
            <textarea id="interview-notes" className="form-textarea" placeholder="Interview prep notes..." value={form.notes} onChange={e => handleChange('notes', e.target.value)} style={{ minHeight: 60 }} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Schedule Interview</button>
        </div>
      </div>
    </div>
  );
}
