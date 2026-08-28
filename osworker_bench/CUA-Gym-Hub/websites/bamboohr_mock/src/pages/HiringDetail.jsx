import React, { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Star, Plus, X, ChevronDown } from 'lucide-react';

const STAGES = ['New', 'Screening', 'Phone Interview', 'On-site Interview', 'Offer', 'Hired', 'Rejected'];

function StarRating({ rating, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onRate(i)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 1 }}
        >
          <Star
            size={14}
            fill={(hover || rating) >= i ? '#ffc107' : 'none'}
            color={(hover || rating) >= i ? '#ffc107' : '#ddd'}
          />
        </button>
      ))}
    </div>
  );
}

function CandidateCard({ candidate, job, onDragStart, onClick, onRateCandidate }) {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, candidate.id)}
      onClick={() => onClick(candidate)}
      style={{
        background: 'white', border: '1px solid #E0E0E0', borderRadius: 4,
        padding: '10px 12px', marginBottom: 8, cursor: 'pointer',
        transition: 'box-shadow 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
    >
      <div style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 2 }}>
        {candidate.firstName} {candidate.lastName}
      </div>
      <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>{candidate.email}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#999' }}>{candidate.appliedAt}</span>
        <StarRating rating={candidate.rating || 0} onRate={(r) => { onRateCandidate(candidate.id, r); }} />
      </div>
    </div>
  );
}

function AddCandidateModal({ jobId, onClose, onAdd }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Add Candidate</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input className="form-input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input className="form-input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => {
            if (!form.firstName || !form.email) return;
            onAdd({ ...form, jobOpeningId: jobId, stage: 'New', rating: 3, appliedAt: new Date().toISOString().split('T')[0], notes: '' });
            onClose();
          }}>Add Candidate</button>
        </div>
      </div>
    </div>
  );
}

export default function HiringDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const [searchParams] = useSearchParams();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const sid = searchParams.get('sid');
  const navTo = (path) => sid ? `${path}?sid=${sid}` : path;

  const job = (state.jobOpenings || []).find(j => j.id === Number(id));
  if (!job) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Job opening not found.</div>;

  const dept = state.departments?.find(d => d.id === job.departmentId);
  const loc = state.locations?.find(l => l.id === job.locationId);
  const manager = state.employees?.find(e => e.id === job.hiringManagerId);

  const candidates = (state.candidates || []).filter(c => c.jobOpeningId === Number(id));

  function handleDragStart(e, candidateId) {
    e.dataTransfer.setData('candidateId', candidateId);
  }

  function handleDrop(e, stage) {
    e.preventDefault();
    const candidateId = Number(e.dataTransfer.getData('candidateId'));
    dispatch({ type: 'UPDATE_CANDIDATE', id: candidateId, changes: { stage } });
    setDragOverStage(null);
  }

  function handleRateCandidate(id, rating) {
    dispatch({ type: 'UPDATE_CANDIDATE', id, changes: { rating } });
  }

  function handleAddCandidate(data) {
    const nextId = Math.max(0, ...(state.candidates || []).map(c => c.id)) + 1;
    dispatch({ type: 'ADD_CANDIDATE', candidate: { id: nextId, ...data } });
  }

  function statusBadge(status) {
    const map = { Open: 'badge-green', Draft: 'badge-gray', 'On Hold': 'badge-yellow', Closed: 'badge-red' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
  }

  return (
    <div style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 56px)' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E0E0E0', padding: '16px 24px' }}>
        <div style={{ marginBottom: 12 }}>
          <Link to={navTo('/hiring')} style={{ color: '#999', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ChevronLeft size={14} /> Back to Job Openings
          </Link>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 6 }}>{job.title}</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {dept && <span className="badge badge-gray">{dept.name}</span>}
              {loc && <span className="badge badge-gray">{loc.name}</span>}
              {statusBadge(job.status)}
              {manager && <span style={{ fontSize: 12, color: '#999' }}>Hiring Manager: {manager.firstName} {manager.lastName}</span>}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Candidate
          </button>
        </div>
      </div>

      {/* Pipeline Kanban */}
      <div style={{ padding: '20px 24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 12, minWidth: 'max-content' }}>
          {STAGES.map(stage => {
            const stageCandidates = candidates.filter(c => c.stage === stage);
            const isDragOver = dragOverStage === stage;
            return (
              <div
                key={stage}
                onDragOver={e => { e.preventDefault(); setDragOverStage(stage); }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={e => handleDrop(e, stage)}
                style={{
                  width: 220, flexShrink: 0,
                  background: isDragOver ? '#f0f9f0' : '#f8f8f8',
                  border: isDragOver ? '2px dashed #73C41D' : '1px solid #E0E0E0',
                  borderRadius: 6, padding: '12px',
                  transition: 'background 0.1s, border-color 0.1s',
                  minHeight: 400
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 12, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stage}</span>
                  <span style={{ background: '#E0E0E0', color: '#666', borderRadius: 12, padding: '1px 7px', fontSize: 11, fontWeight: 600 }}>{stageCandidates.length}</span>
                </div>
                {stageCandidates.map(c => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    job={job}
                    onDragStart={handleDragStart}
                    onClick={setSelectedCandidate}
                    onRateCandidate={handleRateCandidate}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate detail panel */}
      {selectedCandidate && (
        <div style={{ position: 'fixed', right: 0, top: 56, bottom: 0, width: 360, background: 'white', borderLeft: '1px solid #E0E0E0', boxShadow: '-4px 0 16px rgba(0,0,0,0.1)', overflow: 'auto', zIndex: 200 }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedCandidate.firstName} {selectedCandidate.lastName}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{selectedCandidate.stage}</div>
            </div>
            <button onClick={() => setSelectedCandidate(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Email</div>
              <div style={{ fontSize: 14 }}>{selectedCandidate.email}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Phone</div>
              <div style={{ fontSize: 14 }}>{selectedCandidate.phone || '—'}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Applied</div>
              <div style={{ fontSize: 14 }}>{selectedCandidate.appliedAt}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Rating</div>
              <StarRating
                rating={selectedCandidate.rating || 0}
                onRate={r => {
                  dispatch({ type: 'UPDATE_CANDIDATE', id: selectedCandidate.id, changes: { rating: r } });
                  setSelectedCandidate(c => ({ ...c, rating: r }));
                }}
              />
            </div>
            {selectedCandidate.notes && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Notes</div>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{selectedCandidate.notes}</div>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Move Stage</div>
              <select
                className="form-select"
                value={selectedCandidate.stage}
                onChange={e => {
                  const stage = e.target.value;
                  dispatch({ type: 'UPDATE_CANDIDATE', id: selectedCandidate.id, changes: { stage } });
                  setSelectedCandidate(c => ({ ...c, stage }));
                }}
              >
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  const nextStageIdx = STAGES.indexOf(selectedCandidate.stage) + 1;
                  if (nextStageIdx < STAGES.length - 1) {
                    const nextStage = STAGES[nextStageIdx];
                    dispatch({ type: 'UPDATE_CANDIDATE', id: selectedCandidate.id, changes: { stage: nextStage } });
                    setSelectedCandidate(c => ({ ...c, stage: nextStage }));
                  }
                }}
              >
                Advance
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  dispatch({ type: 'UPDATE_CANDIDATE', id: selectedCandidate.id, changes: { stage: 'Rejected' } });
                  setSelectedCandidate(c => ({ ...c, stage: 'Rejected' }));
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddCandidateModal
          jobId={Number(id)}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCandidate}
        />
      )}
    </div>
  );
}
