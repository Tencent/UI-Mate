import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/dataManager.js'
import Breadcrumb from '../components/Breadcrumb.jsx'

function StatusBadge({ status }) {
  const styles = {
    success: { bg: 'var(--gl-success-bg)', color: 'var(--gl-success)', label: 'passed' },
    failed: { bg: 'var(--gl-danger-bg)', color: 'var(--gl-danger)', label: 'failed' },
    running: { bg: 'var(--gl-info-bg)', color: 'var(--gl-info)', label: 'running' },
    pending: { bg: 'var(--gl-warning-bg)', color: 'var(--gl-warning)', label: 'pending' },
    canceled: { bg: 'var(--gl-bg-tertiary)', color: 'var(--gl-text-secondary)', label: 'canceled' },
  }
  const s = styles[status] || styles.canceled
  return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{s.label}</span>
}

export default function PipelinesList() {
  const { group, project: projectPath } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  let pipelines = state.pipelines.filter(p => p.projectId === project.id)
  if (tab === 'finished') pipelines = pipelines.filter(p => ['success', 'failed', 'canceled'].includes(p.status))
  if (tab === 'running') pipelines = pipelines.filter(p => p.status === 'running')
  if (tab === 'pending') pipelines = pipelines.filter(p => p.status === 'pending')
  pipelines = [...pipelines].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const tabStyle = (t) => ({
    padding: '8px 16px', cursor: 'pointer', border: 'none', background: 'none',
    fontWeight: tab === t ? 600 : 400,
    borderBottom: tab === t ? '2px solid var(--gl-purple)' : '2px solid transparent',
    color: tab === t ? 'var(--gl-purple)' : 'var(--gl-text-secondary)', fontSize: '14px',
  })

  return (
    <div>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name, to: `/${group}/${projectPath}` }, { label: 'Pipelines' }]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Pipelines</h1>
      </div>

      <div style={{ borderBottom: '1px solid var(--gl-border)', display: 'flex', gap: '4px', marginBottom: '0' }}>
        {['all', 'finished', 'running', 'pending'].map(t => <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
      </div>

      {pipelines.length === 0 ? (
        <div className="gl-empty-state" style={{ padding: '40px' }}><div className="gl-empty-state-title">No pipelines found</div></div>
      ) : (
        <div className="gl-card" style={{ marginTop: '0', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          <table className="gl-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Pipeline</th>
                <th>Triggerer</th>
                <th>Commit</th>
                <th>Branch</th>
                <th>Stages</th>
                <th>Duration</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {pipelines.map(pl => {
                const jobs = state.jobs.filter(j => j.pipelineId === pl.id)
                const stages = [...new Set(jobs.map(j => j.stage))]
                const stageStatus = (stage) => {
                  const stageJobs = jobs.filter(j => j.stage === stage)
                  if (stageJobs.some(j => j.status === 'failed')) return 'failed'
                  if (stageJobs.some(j => j.status === 'running')) return 'running'
                  if (stageJobs.every(j => j.status === 'success')) return 'success'
                  return 'pending'
                }
                const stageColor = { success: 'var(--gl-success)', failed: 'var(--gl-danger)', running: 'var(--gl-info)', pending: 'var(--gl-text-tertiary)' }
                const commit = state.commits.find(c => c.shortId === pl.sha || c.id === pl.sha)
                return (
                  <tr key={pl.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/${group}/${projectPath}/-/pipelines/${pl.id}`)}>
                    <td><StatusBadge status={pl.status} /></td>
                    <td style={{ fontWeight: 500 }}>
                      <Link
                        to={`/${group}/${projectPath}/-/pipelines/${pl.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: 'var(--gl-purple)', textDecoration: 'none' }}
                      >
                        #{pl.iid || pl.id}
                      </Link>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {state.users.find(u => u.id === pl.triggeredBy) ? (
                          <img src={state.users.find(u => u.id === pl.triggeredBy).avatarUrl} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                        ) : null}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--gl-text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{commit?.title?.slice(0, 40) || '-'}</td>
                    <td><span style={{ fontFamily: 'var(--gl-font-mono)', fontSize: '12px', background: 'var(--gl-bg-tertiary)', padding: '2px 6px', borderRadius: '3px' }}>{pl.ref}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {stages.map((s, si) => (
                          <span key={s} style={{ display: 'flex', alignItems: 'center' }}>
                            {si > 0 && <span style={{ width: '8px', height: '2px', background: 'var(--gl-border)', display: 'inline-block' }} />}
                            <span title={`${s}: ${stageStatus(s)}`} style={{ width: '18px', height: '18px', borderRadius: '50%', background: stageColor[stageStatus(s)] || '#ccc', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              {stageStatus(s) === 'success' && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="2,5 4,7 8,3" fill="none" stroke="white" strokeWidth="1.5" /></svg>}
                              {stageStatus(s) === 'failed' && <svg width="10" height="10" viewBox="0 0 10 10"><line x1="3" y1="3" x2="7" y2="7" stroke="white" strokeWidth="1.5" /><line x1="7" y1="3" x2="3" y2="7" stroke="white" strokeWidth="1.5" /></svg>}
                              {stageStatus(s) === 'running' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--gl-text-secondary)' }}>{pl.duration ? `${pl.duration}s` : '-'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--gl-text-tertiary)', whiteSpace: 'nowrap' }}>{timeAgo(pl.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
