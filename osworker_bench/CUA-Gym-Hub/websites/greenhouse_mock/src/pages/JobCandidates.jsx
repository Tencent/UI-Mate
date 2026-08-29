import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatDistanceToNow, format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const statusBadge = (status) => {
  const map = { active: 'badge-green', rejected: 'badge-red', hired: 'badge-blue' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

export default function JobCandidates() {
  const { jobId } = useParams();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const job = state.jobs.find(j => j.id === jobId);
  if (!job) return <div style={{ padding: 24 }}>Job not found</div>;

  const stages = state.jobStages.filter(s => s.jobId === jobId).sort((a, b) => a.orderIndex - b.orderIndex);

  const jobApps = state.applications.filter(a => a.jobId === jobId);
  const filtered = jobApps.filter(a => {
    const cand = state.candidates.find(c => c.id === a.candidateId);
    if (search && !cand?.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (stageFilter !== 'all' && a.currentStageId !== stageFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (sourceFilter !== 'all' && a.source !== sourceFilter) return false;
    return true;
  });

  const toggleSelect = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map(a => a.id));
  };

  const handleBulkMoveStage = (newStageId) => {
    if (!newStageId) return;
    const newStage = stages.find(s => s.id === newStageId);
    selected.forEach(appId => {
      const app = state.applications.find(a => a.id === appId);
      if (!app || app.status !== 'active') return;
      const oldStage = stages.find(s => s.id === app.currentStageId);
      dispatch({
        type: 'MOVE_APPLICATION_STAGE',
        payload: {
          applicationId: appId,
          newStageId,
          fromStageName: oldStage?.name || '',
          toStageName: newStage?.name || ''
        }
      });
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: uuidv4(),
          candidateId: app.candidateId,
          applicationId: appId,
          type: 'stage_change',
          actorId: state.currentUser.id,
          description: `Moved to ${newStage?.name || newStageId} (bulk action)`,
          metadata: { fromStage: oldStage?.name, toStage: newStage?.name },
          createdAt: new Date().toISOString()
        }
      });
    });
    setSelected([]);
  };

  const handleBulkRejectConfirm = () => {
    selected.forEach(appId => {
      const app = state.applications.find(a => a.id === appId);
      if (!app || app.status !== 'active') return;
      dispatch({
        type: 'REJECT_APPLICATION',
        payload: {
          applicationId: appId,
          rejectionReason: 'Bulk rejection',
          notes: ''
        }
      });
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: uuidv4(),
          candidateId: app.candidateId,
          applicationId: appId,
          type: 'rejection',
          actorId: state.currentUser.id,
          description: 'Application rejected (bulk action)',
          metadata: { reason: 'Bulk rejection' },
          createdAt: new Date().toISOString()
        }
      });
    });
    setSelected([]);
    setShowRejectConfirm(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => navigate(buildLink(`/jobs/${jobId}`))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
        >
          <ArrowLeft size={14} /> {job.title}
        </button>
        <span style={{ color: 'var(--text-muted)' }}>›</span>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Candidates</span>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 2, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
          <option value="all">All Stages</option>
          {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="form-select" style={{ width: 130 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="hired">Hired</option>
        </select>
        <select className="form-select" style={{ width: 140 }} value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
          <option value="all">All Sources</option>
          <option value="applied">Applied</option>
          <option value="referral">Referral</option>
          <option value="sourced">Sourced</option>
          <option value="agency">Agency</option>
          <option value="internal">Internal</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div style={{ background: '#F0FBF7', border: '1px solid var(--accent)', borderRadius: 6, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{selected.length} selected</span>
          <select
            className="form-select"
            style={{ width: 180 }}
            defaultValue=""
            onChange={e => { handleBulkMoveStage(e.target.value); e.target.value = ''; }}
          >
            <option value="" disabled>Move to Stage...</option>
            {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="btn btn-danger btn-sm" onClick={() => setShowRejectConfirm(true)}>Reject Selected</button>
          <button onClick={() => setSelected([])} className="btn btn-ghost btn-sm">Clear</button>
        </div>
      )}

      {/* Reject confirmation modal */}
      {showRejectConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 8, padding: 24, width: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Reject {selected.length} candidate{selected.length > 1 ? 's' : ''}?</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              This will reject all {selected.length} selected application{selected.length > 1 ? 's' : ''}. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowRejectConfirm(false)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={handleBulkRejectConfirm}>Reject All</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ cursor: 'pointer' }} />
              </th>
              <th>Candidate Name</th>
              <th>Current Stage</th>
              <th>Status</th>
              <th>Days in Stage</th>
              <th>Source</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(app => {
              const cand = state.candidates.find(c => c.id === app.candidateId);
              const stage = stages.find(s => s.id === app.currentStageId);
              return (
                <tr key={app.id}>
                  <td>
                    <input type="checkbox" checked={selected.includes(app.id)} onChange={() => toggleSelect(app.id)} style={{ cursor: 'pointer' }} />
                  </td>
                  <td>
                    <span
                      onClick={() => navigate(buildLink(`/candidates/${app.candidateId}`))}
                      style={{ fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}
                    >
                      {cand?.name}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{stage?.name}</td>
                  <td>{statusBadge(app.status)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{app.daysInCurrentStage}d</td>
                  <td style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{app.source}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {formatDistanceToNow(new Date(app.lastActivityAt), { addSuffix: true })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <h3>No candidates found</h3>
            <p>Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
