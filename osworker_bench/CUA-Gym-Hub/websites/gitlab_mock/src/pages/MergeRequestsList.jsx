import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { GitMerge, GitPullRequest, X, MessageSquare, Clock, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/dataManager.js'
import Breadcrumb from '../components/Breadcrumb.jsx'

function StatusBadge({ status }) {
  const map = {
    success: { color: '#108548', bg: '#DCFCE7', label: '●' },
    failed: { color: '#DD2B0E', bg: '#FEE2E2', label: '●' },
    running: { color: '#1F75CB', bg: '#DBEAFE', label: '◉' },
    pending: { color: '#C17D10', bg: '#FEF9C3', label: '○' },
  }
  const s = map[status] || { color: '#74717A', bg: '#f0f0f0', label: '●' }
  return <span style={{ fontSize: '12px', color: s.color, background: s.bg, padding: '2px 6px', borderRadius: '10px' }}>{s.label}</span>
}

export default function MergeRequestsList() {
  const { group, project: projectPath } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('opened')

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const labels = state.labels.filter(l => l.projectId === project.id)
  const mrs = state.mergeRequests.filter(m => m.projectId === project.id && m.state === tab)
  const openCount = state.mergeRequests.filter(m => m.projectId === project.id && m.state === 'opened').length
  const mergedCount = state.mergeRequests.filter(m => m.projectId === project.id && m.state === 'merged').length
  const closedCount = state.mergeRequests.filter(m => m.projectId === project.id && m.state === 'closed').length

  const tabStyle = (t) => ({
    padding: '8px 16px', cursor: 'pointer', border: 'none', background: 'none',
    fontWeight: tab === t ? 600 : 400,
    borderBottom: tab === t ? '2px solid var(--gl-purple)' : '2px solid transparent',
    color: tab === t ? 'var(--gl-purple)' : 'var(--gl-text-secondary)', fontSize: '14px',
  })

  return (
    <div>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name, to: `/${group}/${projectPath}` }, { label: 'Merge requests' }]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Merge requests</h1>
        <button className="gl-btn gl-btn-primary" onClick={() => navigate(`/${group}/${projectPath}/-/merge_requests/new`)}>New merge request</button>
      </div>

      <div style={{ borderBottom: '1px solid var(--gl-border)', display: 'flex', gap: '4px' }}>
        <button style={tabStyle('opened')} onClick={() => setTab('opened')}><GitPullRequest size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Open {openCount}</button>
        <button style={tabStyle('merged')} onClick={() => setTab('merged')}><GitMerge size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Merged {mergedCount}</button>
        <button style={tabStyle('closed')} onClick={() => setTab('closed')}><X size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Closed {closedCount}</button>
      </div>

      {mrs.length === 0 ? (
        <div className="gl-empty-state" style={{ padding: '40px' }}>
          <GitMerge size={32} color="var(--gl-text-tertiary)" />
          <div className="gl-empty-state-title">No merge requests</div>
          <div className="gl-empty-state-desc">Create a merge request to propose and review changes</div>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--gl-border)', borderTop: 'none' }}>
          {mrs.map(mr => {
            const mrLabels = labels.filter(l => mr.labelIds?.includes(l.id))
            const assignees = state.users.filter(u => mr.assigneeIds?.includes(u.id))
            const pipeline = mr.pipelineId ? state.pipelines.find(p => p.id === mr.pipelineId) : null
            const commentCount = state.mrComments.filter(c => c.mergeRequestId === mr.id).length
            return (
              <div key={mr.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', gap: '12px' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gl-bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <div style={{ paddingTop: '2px' }}>
                  {mr.state === 'opened' ? <GitPullRequest size={16} color="var(--gl-success)" /> :
                   mr.state === 'merged' ? <GitMerge size={16} color="var(--gl-purple)" /> :
                   <X size={16} color="var(--gl-text-tertiary)" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ marginBottom: '4px' }}>
                    <Link to={`/${group}/${projectPath}/-/merge_requests/${mr.iid}`} style={{ fontWeight: 600, fontSize: '15px', textDecoration: 'none', color: 'var(--gl-text-primary)', marginRight: '8px' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--gl-purple)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--gl-text-primary)'}>
                      {mr.isDraft && <span style={{ color: 'var(--gl-text-secondary)', fontWeight: 400 }}>Draft: </span>}
                      {mr.title}
                    </Link>
                    {mrLabels.map(l => <span key={l.id} style={{ background: l.color, color: l.textColor || '#fff', fontSize: '11px', padding: '1px 8px', borderRadius: '10px', marginRight: '4px' }}>{l.name}</span>)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gl-text-tertiary)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span>!{mr.iid}</span>
                    <span>{tab === 'merged' ? 'merged' : 'opened'} {timeAgo(mr.createdAt)}</span>
                    <span style={{ fontFamily: 'var(--gl-font-mono)', background: 'var(--gl-bg-tertiary)', padding: '1px 6px', borderRadius: '3px' }}>
                      {mr.sourceBranch} → {mr.targetBranch}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {pipeline && <StatusBadge status={pipeline.status} />}
                  {assignees.map(a => <img key={a.id} src={a.avatarUrl || a.avatar} alt={a.name} title={a.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />)}
                  {commentCount > 0 && <span style={{ fontSize: '12px', color: 'var(--gl-text-tertiary)', display: 'flex', alignItems: 'center', gap: '3px' }}><MessageSquare size={12} />{commentCount}</span>}
                  <span style={{ fontSize: '12px', color: 'var(--gl-text-tertiary)', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={12} />{timeAgo(mr.updatedAt)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
