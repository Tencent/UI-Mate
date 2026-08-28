import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/dataManager.js'
import Breadcrumb from '../components/Breadcrumb.jsx'

export default function JobDetail() {
  const { group, project: projectPath, id } = useParams()
  const { state } = useApp()

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const job = state.jobs.find(j => j.id === id)
  if (!job) return <div className="gl-empty-state"><div className="gl-empty-state-title">Job not found</div></div>

  const pipeline = state.pipelines.find(p => p.id === job.pipelineId)
  const statusColors = { success: 'var(--gl-success)', failed: 'var(--gl-danger)', running: 'var(--gl-info)', pending: 'var(--gl-warning)', canceled: 'var(--gl-text-secondary)' }

  const logLines = (job.logExcerpt || '').split('\n')

  return (
    <div>
      <Breadcrumb items={[
        { label: group, to: '/' },
        { label: project.name, to: `/${group}/${projectPath}` },
        { label: 'Pipelines', to: `/${group}/${projectPath}/-/pipelines` },
        pipeline && { label: `#${pipeline.iid}`, to: `/${group}/${projectPath}/-/pipelines/${pipeline.id}` },
        { label: `Job: ${job.name}` }
      ].filter(Boolean)} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Job #{job.id}: {job.name}</h1>
        <span style={{ color: statusColors[job.status] || 'var(--gl-text-secondary)', fontWeight: 600, fontSize: '14px' }}>{job.status}</span>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Log viewer */}
        <div style={{ flex: 1 }}>
          <div className="gl-terminal" style={{ minHeight: '400px', overflowX: 'auto' }}>
            {logLines.map((line, i) => {
              const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('failed') || line.toLowerCase().includes('fail')
              const isSuccess = line.toLowerCase().includes('succeed') || line.toLowerCase().includes('passed') || line.startsWith('✓') || line.includes('Job succeeded')
              const isCommand = line.startsWith('$') || line.startsWith('>')
              return (
                <div key={i} className={isError ? 'log-error' : isSuccess ? 'log-success' : isCommand ? 'log-command' : ''}
                  style={{ display: 'flex', gap: '12px', fontFamily: 'var(--gl-font-mono)', fontSize: '12px', lineHeight: '20px' }}>
                  <span style={{ color: '#555', userSelect: 'none', minWidth: '32px', textAlign: 'right' }}>{i + 1}</span>
                  <span style={{ whiteSpace: 'pre' }}>{line}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: '200px', flexShrink: 0 }}>
          <div className="gl-card" style={{ padding: '16px' }}>
            <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Job info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div><span style={{ color: 'var(--gl-text-secondary)' }}>Stage: </span><strong>{job.stage}</strong></div>
              {pipeline && <div><span style={{ color: 'var(--gl-text-secondary)' }}>Pipeline: </span><strong>#{pipeline.iid}</strong></div>}
              {job.duration && <div><span style={{ color: 'var(--gl-text-secondary)' }}>Duration: </span><strong>{job.duration}s</strong></div>}
              {job.startedAt && <div><span style={{ color: 'var(--gl-text-secondary)' }}>Started: </span><strong>{timeAgo(job.startedAt)}</strong></div>}
              {job.finishedAt && <div><span style={{ color: 'var(--gl-text-secondary)' }}>Finished: </span><strong>{timeAgo(job.finishedAt)}</strong></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
