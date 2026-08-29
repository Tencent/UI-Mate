import { useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, Inbox, Users, Navigation } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { formatDistanceToNow } from 'date-fns';

const sourceIcons = {
  applied: '📥',
  referral: '👥',
  sourced: '🔍',
  agency: '🏢',
  internal: '⭐'
};

const actionColors = {
  needs_scheduling: '#DC2626',
  needs_decision: '#DC2626',
  needs_scorecard: '#F59E0B',
  awaiting_candidate: '#D1D5DB'
};

function CandidateCard({ app, candidate, job, stages, onDragStart, onClick }) {
  const stage = stages.find(s => s.id === app.currentStageId);
  const borderColor = app.actionRequired ? (actionColors[app.actionRequired] || '#D1D5DB') : '#D1D5DB';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, app.id)}
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: 6,
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${borderColor}`,
        padding: '10px 12px',
        cursor: 'pointer',
        marginBottom: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.15s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.12)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
    >
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, color: 'var(--text-primary)' }}>
        {candidate?.name}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {candidate?.currentTitle} · {candidate?.currentCompany}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {app.daysInCurrentStage}d
        </span>
        <span title={candidate?.source} style={{ fontSize: 13 }}>
          {sourceIcons[candidate?.source] || ''}
        </span>
      </div>
    </div>
  );
}

export default function Pipeline() {
  const { jobId } = useParams();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [dragOverStage, setDragOverStage] = useState(null);
  const draggingAppId = useRef(null);

  const job = state.jobs.find(j => j.id === jobId);
  if (!job) return <div style={{ padding: 24 }}>Job not found</div>;

  const stages = state.jobStages
    .filter(s => s.jobId === jobId)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const applications = state.applications.filter(a => a.jobId === jobId);

  const handleDragStart = (e, appId) => {
    draggingAppId.current = appId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };

  const handleDrop = (e, newStageId) => {
    e.preventDefault();
    setDragOverStage(null);
    const appId = draggingAppId.current;
    if (!appId) return;

    const app = state.applications.find(a => a.id === appId);
    if (!app || app.currentStageId === newStageId) return;

    const fromStage = stages.find(s => s.id === app.currentStageId);
    const toStage = stages.find(s => s.id === newStageId);

    dispatch({ type: 'MOVE_APPLICATION_STAGE', payload: { applicationId: appId, newStageId } });
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: uuidv4(),
        candidateId: app.candidateId,
        applicationId: appId,
        type: 'stage_change',
        actorId: state.currentUser.id,
        description: `Moved to ${toStage?.name}`,
        metadata: { fromStage: fromStage?.name, toStage: toStage?.name },
        createdAt: new Date().toISOString()
      }
    });
    draggingAppId.current = null;
  };

  const handleDragLeave = () => setDragOverStage(null);

  const getStageApps = (stageId) => {
    return applications.filter(a => a.currentStageId === stageId && (a.status === 'active' || a.status === 'hired'))
      .filter(a => {
        if (!search) return true;
        const cand = state.candidates.find(c => c.id === a.candidateId);
        return cand?.name.toLowerCase().includes(search.toLowerCase());
      });
  };

  return (
    <div style={{ padding: 24, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(buildLink(`/jobs/${jobId}`))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
          >
            <ArrowLeft size={14} /> {job.title}
          </button>
          <span style={{ color: 'var(--text-muted)' }}>›</span>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Pipeline</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              placeholder="Search candidates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32, width: 200 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sort:</span>
            <select className="form-select" style={{ width: 140 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="name">Name</option>
              <option value="days">Time in Stage</option>
              <option value="applied">Date Applied</option>
              <option value="activity">Last Activity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
        {stages.map(stage => {
          const stageApps = getStageApps(stage.id);
          const isOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              style={{ minWidth: 200, width: 200, flexShrink: 0 }}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragLeave={handleDragLeave}
            >
              {/* Column header */}
              <div style={{
                background: isOver ? '#E0F5ED' : '#F5F5F5',
                borderRadius: '6px 6px 0 0',
                padding: '10px 12px',
                border: `1px solid ${isOver ? 'var(--accent)' : 'var(--border)'}`,
                borderBottom: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s'
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {stage.name}
                </span>
                <span style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, borderRadius: 10, padding: '1px 6px', flexShrink: 0 }}>
                  {stageApps.length}
                </span>
              </div>

              {/* Column body */}
              <div style={{
                background: isOver ? '#F0FBF7' : '#FAFAFA',
                border: `1px solid ${isOver ? 'var(--accent)' : 'var(--border)'}`,
                borderTop: 'none',
                borderRadius: '0 0 6px 6px',
                padding: 8,
                minHeight: 120,
                transition: 'all 0.15s'
              }}>
                {stageApps.slice(0, 10).map(app => {
                  const cand = state.candidates.find(c => c.id === app.candidateId);
                  return (
                    <CandidateCard
                      key={app.id}
                      app={app}
                      candidate={cand}
                      job={job}
                      stages={stages}
                      onDragStart={handleDragStart}
                      onClick={() => navigate(buildLink(`/candidates/${app.candidateId}`))}
                    />
                  );
                })}
                {stageApps.length > 10 && (
                  <button
                    onClick={() => navigate(buildLink(`/jobs/${jobId}/candidates`))}
                    style={{ width: '100%', background: 'none', border: '1px dashed var(--border)', borderRadius: 4, padding: '6px 8px', cursor: 'pointer', fontSize: 12, color: 'var(--accent)' }}
                  >
                    Show all ({stageApps.length})
                  </button>
                )}
                {stageApps.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 8px' }}>
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
