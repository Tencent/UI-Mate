import { Link, useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/dataManager.js'
import Breadcrumb from '../components/Breadcrumb.jsx'

function JobBox({ job, onClick }) {
  const colors = { success: { bg: '#DCFCE7', border: '#108548', color: '#108548' }, failed: { bg: '#FEE2E2', border: '#DD2B0E', color: '#DD2B0E' }, running: { bg: '#DBEAFE', border: '#1F75CB', color: '#1F75CB' }, pending: { bg: '#f0f0f0', border: '#ccc', color: '#74717A' }, canceled: { bg: '#f0f0f0', border: '#ccc', color: '#74717A' } }
  const s = colors[job.status] || colors.pending
  return (
    <div onClick={onClick} style={{ border: `1px solid ${s.border}`, background: s.bg, borderRadius: '6px', padding: '10px 14px', cursor: 'pointer', minWidth: '140px', marginBottom: '8px' }}>
      <div style={{ fontWeight: 600, fontSize: '13px', color: s.color, marginBottom: '4px' }}>{job.name}</div>
      <div style={{ fontSize: '11px', color: 'var(--gl-text-secondary)' }}>{job.status}{job.duration ? ` · ${job.duration}s` : ''}</div>
    </div>
  )
}

export default function PipelineDetail() {
  const { group, project: projectPath, id } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const pipeline = state.pipelines.find(p => p.id === id || String(p.iid) === String(id))
  if (!pipeline) return <div className="gl-empty-state"><div className="gl-empty-state-title">Pipeline not found</div></div>

  const jobs = state.jobs.filter(j => j.pipelineId === pipeline.id)
  const stages = [...new Set(jobs.map(j => j.stage))]
  const statusColors = { success: 'var(--gl-success)', failed: 'var(--gl-danger)', running: 'var(--gl-info)', pending: 'var(--gl-warning)', canceled: 'var(--gl-text-secondary)' }

  return (
    <div>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name, to: `/${group}/${projectPath}` }, { label: 'Pipelines', to: `/${group}/${projectPath}/-/pipelines` }, { label: `#${pipeline.iid || pipeline.id}` }]} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Pipeline #{pipeline.iid || pipeline.id}</h1>
        <span style={{ background: pipeline.status === 'success' ? 'var(--gl-success-bg)' : pipeline.status === 'failed' ? 'var(--gl-danger-bg)' : 'var(--gl-info-bg)', color: statusColors[pipeline.status] || 'var(--gl-text-secondary)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
          {pipeline.status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', fontSize: '14px', color: 'var(--gl-text-secondary)' }}>
        <span>Branch: <strong style={{ fontFamily: 'var(--gl-font-mono)', background: 'var(--gl-bg-tertiary)', padding: '2px 6px', borderRadius: '3px' }}>{pipeline.ref}</strong></span>
        <span>Commit: <strong style={{ fontFamily: 'var(--gl-font-mono)' }}>{pipeline.sha}</strong></span>
        {pipeline.duration && <span>Duration: <strong>{pipeline.duration}s</strong></span>}
        <span>Created: <strong>{timeAgo(pipeline.createdAt)}</strong></span>
      </div>

      {/* Stage graph */}
      <div className="gl-card" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gl-border)', fontWeight: 600 }}>Pipeline stages</div>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '0', overflowX: 'auto' }}>
          {stages.map((stage, i) => {
            const stageJobs = jobs.filter(j => j.stage === stage)
            const stageStatus = stageJobs.some(j => j.status === 'failed') ? 'failed' : stageJobs.some(j => j.status === 'running') ? 'running' : stageJobs.every(j => j.status === 'success') ? 'success' : 'pending'
            return (
              <div key={stage} style={{ display: 'flex', alignItems: 'flex-start' }}>
                {i > 0 && <div style={{ width: '40px', height: '2px', background: 'var(--gl-border)', marginTop: '28px', flexShrink: 0 }} />}
                <div style={{ minWidth: '160px', padding: '0 8px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: statusColors[stageStatus] || '#ccc' }}>
                      {stageStatus === 'success' && <svg width="12" height="12" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" fill="none" stroke="white" strokeWidth="2" /></svg>}
                      {stageStatus === 'failed' && <svg width="12" height="12" viewBox="0 0 12 12"><line x1="3" y1="3" x2="9" y2="9" stroke="white" strokeWidth="2" /><line x1="9" y1="3" x2="3" y2="9" stroke="white" strokeWidth="2" /></svg>}
                      {stageStatus === 'running' && <span className="gl-spinner" style={{ width: '12px', height: '12px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />}
                      {stageStatus === 'pending' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '13px', textTransform: 'capitalize', color: 'var(--gl-text-secondary)' }}>{stage}</span>
                  </div>
                  {stageJobs.map(j => (
                    <JobBox key={j.id} job={j} onClick={() => navigate(`/${group}/${projectPath}/-/jobs/${j.id}`)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Jobs table */}
      <div className="gl-card">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gl-border)', fontWeight: 600 }}>Jobs</div>
        <table className="gl-table" style={{ width: '100%' }}>
          <thead><tr><th>Status</th><th>Job</th><th>Stage</th><th>Duration</th></tr></thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/${group}/${projectPath}/-/jobs/${j.id}`)}>
                <td><span style={{ color: statusColors[j.status] || 'var(--gl-text-secondary)', fontWeight: 600, fontSize: '13px' }}>{j.status}</span></td>
                <td style={{ fontWeight: 500 }}>
                  <Link
                    to={`/${group}/${projectPath}/-/jobs/${j.id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: 'var(--gl-purple)', textDecoration: 'none' }}
                  >
                    {j.name}
                  </Link>
                </td>
                <td style={{ color: 'var(--gl-text-secondary)', fontSize: '13px' }}>{j.stage}</td>
                <td style={{ color: 'var(--gl-text-secondary)', fontSize: '13px' }}>{j.duration ? `${j.duration}s` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
