import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AddCandidateModal({ onClose }) {
  const { state, dispatch, sid: contextSid } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid') || contextSid;
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    currentCompany: '', currentTitle: '', location: '',
    source: 'applied', referrerId: '', jobId: ''
  });
  const [errors, setErrors] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    return errs;
  };

  const uploadResume = async () => {
    if (!resumeFile) return null;
    const formData = new FormData();
    formData.append('resume', resumeFile);
    const url = sid ? `/upload?sid=${encodeURIComponent(sid)}` : '/upload';
    const res = await fetch(url, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Resume upload failed');
    const data = await res.json();
    return data.files?.[0] || null;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsSubmitting(true);

    const candidateId = uuidv4();
    const now = new Date().toISOString();
    let uploadedResume = null;
    try {
      uploadedResume = await uploadResume();
    } catch {
      setErrors({ resume: 'Resume upload failed. Remove the file or try again.' });
      setIsSubmitting(false);
      return;
    }

    const newCandidate = {
      id: candidateId,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      currentCompany: form.currentCompany.trim(),
      currentTitle: form.currentTitle.trim(),
      resumeUrl: uploadedResume?.url || null,
      resumeFile: uploadedResume ? {
        originalName: uploadedResume.original_name,
        storedName: uploadedResume.stored_name,
        size: uploadedResume.size,
        contentType: uploadedResume.content_type,
        url: uploadedResume.url
      } : null,
      linkedinUrl: null,
      source: form.source,
      referrerId: form.referrerId || null,
      tags: [],
      createdAt: now,
      updatedAt: now
    };

    dispatch({ type: 'ADD_CANDIDATE', payload: newCandidate });

    let applicationId = null;
    if (form.jobId) {
      const job = state.jobs.find(j => j.id === form.jobId);
      const stages = state.jobStages.filter(s => s.jobId === form.jobId).sort((a, b) => a.orderIndex - b.orderIndex);
      const firstStage = stages[0];

      if (firstStage) {
        applicationId = uuidv4();
        const newApp = {
          id: applicationId,
          candidateId,
          jobId: form.jobId,
          currentStageId: firstStage.id,
          status: 'active',
          appliedAt: now,
          rejectedAt: null,
          rejectionReason: null,
          hiredAt: null,
          lastActivityAt: now,
          source: form.source,
          creditedTo: form.referrerId || null,
          recruiterId: state.currentUser.id,
          coordinatorId: null,
          actionRequired: 'needs_decision',
          daysInCurrentStage: 0
        };
        dispatch({ type: 'ADD_APPLICATION', payload: newApp });
      }
    }

    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: uuidv4(),
        candidateId,
        applicationId,
        type: 'application_submitted',
        actorId: state.currentUser.id,
        description: `${newCandidate.name} added as candidate`,
        metadata: {},
        createdAt: now
      }
    });

    onClose();
    navigate(buildLink(`/candidates/${candidateId}`));
  };

  const openJobs = state.jobs.filter(j => j.status === 'open');

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2 className="modal-title">Add Candidate</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="candidate-first-name">First Name *</label>
              <input id="candidate-first-name" className="form-input" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} placeholder="First name" />
              {errors.firstName && <span style={{ color: 'var(--red)', fontSize: 12 }}>{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="candidate-last-name">Last Name *</label>
              <input id="candidate-last-name" className="form-input" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} placeholder="Last name" />
              {errors.lastName && <span style={{ color: 'var(--red)', fontSize: 12 }}>{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="candidate-email">Email *</label>
            <input id="candidate-email" className="form-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="email@example.com" />
            {errors.email && <span style={{ color: 'var(--red)', fontSize: 12 }}>{errors.email}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="(555) 555-0100" />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="City, State" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Current Company</label>
              <input className="form-input" value={form.currentCompany} onChange={e => handleChange('currentCompany', e.target.value)} placeholder="Company name" />
            </div>
            <div className="form-group">
              <label className="form-label">Current Title</label>
              <input className="form-input" value={form.currentTitle} onChange={e => handleChange('currentTitle', e.target.value)} placeholder="Job title" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Source</label>
              <select className="form-select" value={form.source} onChange={e => handleChange('source', e.target.value)}>
                <option value="applied">Applied</option>
                <option value="referral">Referral</option>
                <option value="sourced">Sourced</option>
                <option value="agency">Agency</option>
                <option value="internal">Internal</option>
              </select>
            </div>
            {form.source === 'referral' && (
              <div className="form-group">
                <label className="form-label">Referred By</label>
                <select className="form-select" value={form.referrerId} onChange={e => handleChange('referrerId', e.target.value)}>
                  <option value="">Select referrer...</option>
                  {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Job (optional)</label>
            <select className="form-select" value={form.jobId} onChange={e => handleChange('jobId', e.target.value)}>
              <option value="">Select job...</option>
              {openJobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="resume-upload-input">Resume</label>
            <div
              style={{
                padding: '16px', border: '2px dashed var(--border)', borderRadius: 6,
                textAlign: 'center', cursor: 'pointer', position: 'relative',
                background: resumeFile ? '#F0FDF4' : 'transparent',
                borderColor: resumeFile ? 'var(--green)' : 'var(--border)'
              }}
              onClick={() => document.getElementById('resume-upload-input').click()}
            >
              <input
                id="resume-upload-input"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setResumeFile(file);
                }}
              />
              {resumeFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--green)', fontSize: 13 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>{resumeFile.name}</span>
                  <button
                    onClick={e => { e.stopPropagation(); setResumeFile(null) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  <div style={{ marginBottom: 4, fontWeight: 500 }}>Click to upload resume</div>
                  <div style={{ fontSize: 11 }}>PDF, DOC, DOCX, or TXT (max 10MB)</div>
                </div>
              )}
            </div>
            {errors.resume && <span style={{ color: 'var(--red)', fontSize: 12 }}>{errors.resume}</span>}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Candidate'}
          </button>
        </div>
      </div>
    </div>
  );
}
