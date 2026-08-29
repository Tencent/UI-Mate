import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function CreateJobModal({ onClose }) {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  const [form, setForm] = useState({
    title: '',
    departmentId: '',
    officeId: '',
    hiringManagerId: '',
    recruiterId: state.currentUser.id,
    openings: 1,
    description: '',
    requirements: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Required';
    if (!form.departmentId) errs.departmentId = 'Required';
    if (!form.officeId) errs.officeId = 'Required';
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const jobId = uuidv4();
    const now = new Date().toISOString();
    const reqList = form.requirements.split('\n').map(r => r.trim()).filter(Boolean);

    const newJob = {
      id: jobId,
      title: form.title.trim(),
      status: 'draft',
      departmentId: form.departmentId,
      officeId: form.officeId,
      hiringManagerId: form.hiringManagerId || null,
      recruiterId: form.recruiterId,
      coordinatorId: null,
      openings: parseInt(form.openings) || 1,
      openDate: now.split('T')[0],
      closeDate: null,
      description: form.description.trim(),
      requirements: reqList,
      stages: [],
      candidateCount: 0,
      createdAt: now,
      updatedAt: now
    };

    dispatch({ type: 'ADD_JOB', payload: newJob });
    navigate(buildLink(`/jobs/${jobId}`));
    onClose();
  };

  const hiringManagers = state.users.filter(u => u.role === 'hiring_manager' || u.role === 'admin');
  const recruiters = state.users.filter(u => u.role === 'recruiter' || u.role === 'admin');

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2 className="modal-title">Create Job</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input className="form-input" value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g. Senior Software Engineer" />
            {errors.title && <span style={{ color: 'var(--red)', fontSize: 12 }}>{errors.title}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select className="form-select" value={form.departmentId} onChange={e => handleChange('departmentId', e.target.value)}>
                <option value="">Select department...</option>
                {state.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.departmentId && <span style={{ color: 'var(--red)', fontSize: 12 }}>{errors.departmentId}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Office *</label>
              <select className="form-select" value={form.officeId} onChange={e => handleChange('officeId', e.target.value)}>
                <option value="">Select office...</option>
                {state.offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              {errors.officeId && <span style={{ color: 'var(--red)', fontSize: 12 }}>{errors.officeId}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Hiring Manager</label>
              <select className="form-select" value={form.hiringManagerId} onChange={e => handleChange('hiringManagerId', e.target.value)}>
                <option value="">Select hiring manager...</option>
                {hiringManagers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Recruiter</label>
              <select className="form-select" value={form.recruiterId} onChange={e => handleChange('recruiterId', e.target.value)}>
                {recruiters.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Number of Openings</label>
            <input type="number" className="form-input" value={form.openings} onChange={e => handleChange('openings', e.target.value)} min={1} style={{ width: 100 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Job Description</label>
            <textarea className="form-textarea" placeholder="Describe the role and responsibilities..." value={form.description} onChange={e => handleChange('description', e.target.value)} style={{ minHeight: 100 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Requirements (one per line)</label>
            <textarea className="form-textarea" placeholder="5+ years of experience...&#10;Proficiency in React...&#10;Strong communication skills..." value={form.requirements} onChange={e => handleChange('requirements', e.target.value)} style={{ minHeight: 80 }} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Create Job</button>
        </div>
      </div>
    </div>
  );
}
