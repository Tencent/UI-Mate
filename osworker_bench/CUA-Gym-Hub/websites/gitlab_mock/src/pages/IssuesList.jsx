import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { CircleDot, CheckCircle, MessageSquare, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/dataManager.js'
import Breadcrumb from '../components/Breadcrumb.jsx'

export default function IssuesList() {
  const { group, project: projectPath } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('opened')
  const [filterAssignee, setFilterAssignee] = useState('')
  const [filterLabel, setFilterLabel] = useState('')
  const [filterMilestone, setFilterMilestone] = useState('')
  const [sortBy, setSortBy] = useState('created_desc')

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const labels = state.labels.filter(l => l.projectId === project.id)
  const milestones = state.milestones.filter(m => m.projectId === project.id)
  const users = state.users

  let issues = state.issues.filter(i => i.projectId === project.id && i.state === tab)
  if (filterAssignee) issues = issues.filter(i => i.assigneeIds?.includes(filterAssignee))
  if (filterLabel) issues = issues.filter(i => i.labelIds?.includes(filterLabel))
  if (filterMilestone) issues = issues.filter(i => i.milestoneId === filterMilestone)

  issues = [...issues].sort((a, b) => {
    if (sortBy === 'created_desc') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'created_asc') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'updated_desc') return new Date(b.updatedAt) - new Date(a.updatedAt)
    return 0
  })

  const openCount = state.issues.filter(i => i.projectId === project.id && i.state === 'opened').length
  const closedCount = state.issues.filter(i => i.projectId === project.id && i.state === 'closed').length

  const tabStyle = (t) => ({
    padding: '8px 16px', cursor: 'pointer', border: 'none', background: 'none',
    fontWeight: tab === t ? 600 : 400,
    borderBottom: tab === t ? '2px solid var(--gl-purple)' : '2px solid transparent',
    color: tab === t ? 'var(--gl-purple)' : 'var(--gl-text-secondary)',
    fontSize: '14px',
  })

  return (
    <div>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name, to: `/${group}/${projectPath}` }, { label: 'Issues' }]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Issues</h1>
        <button className="gl-btn gl-btn-success" onClick={() => navigate(`/${group}/${projectPath}/-/issues/new`)}>New issue</button>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--gl-border)', display: 'flex', gap: '4px', marginBottom: '0' }}>
        <button style={tabStyle('opened')} onClick={() => setTab('opened')}>
          <CircleDot size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Open {openCount}
        </button>
        <button style={tabStyle('closed')} onClick={() => setTab('closed')}>
          <CheckCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Closed {closedCount}
        </button>
      </div>

      {/* Filters */}
      <div style={{ padding: '12px 0', display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--gl-border)', marginBottom: '0' }}>
        <select className="gl-form-input" style={{ padding: '4px 8px', fontSize: '13px' }} value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
          <option value="">Assignee</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select className="gl-form-input" style={{ padding: '4px 8px', fontSize: '13px' }} value={filterLabel} onChange={e => setFilterLabel(e.target.value)}>
          <option value="">Label</option>
          {labels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select className="gl-form-input" style={{ padding: '4px 8px', fontSize: '13px' }} value={filterMilestone} onChange={e => setFilterMilestone(e.target.value)}>
          <option value="">Milestone</option>
          {milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <select className="gl-form-input" style={{ padding: '4px 8px', fontSize: '13px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="created_desc">Sort: Created date (newest)</option>
          <option value="created_asc">Sort: Created date (oldest)</option>
          <option value="updated_desc">Sort: Updated date</option>
        </select>
      </div>

      {/* Issue list */}
      {issues.length === 0 ? (
        <div className="gl-empty-state" style={{ padding: '40px' }}>
          <CircleDot size={32} color="var(--gl-text-tertiary)" />
          <div className="gl-empty-state-title">No issues to display</div>
          <div className="gl-empty-state-desc">Create the first issue to get started</div>
          <button className="gl-btn gl-btn-success" style={{ marginTop: '12px' }} onClick={() => navigate(`/${group}/${projectPath}/-/issues/new`)}>Create your first issue</button>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--gl-border)', borderTop: 'none' }}>
          {issues.map(issue => {
            const issueLabels = labels.filter(l => issue.labelIds?.includes(l.id))
            const assignees = users.filter(u => issue.assigneeIds?.includes(u.id))
            const milestone = milestones.find(m => m.id === issue.milestoneId)
            const commentCount = state.issueComments.filter(c => c.issueId === issue.id).length
            return (
              <div key={issue.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gl-bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <div style={{ paddingTop: '2px', flexShrink: 0 }}>
                  {issue.state === 'opened' ? <CircleDot size={16} color="var(--gl-success)" /> : <CheckCircle size={16} color="var(--gl-purple)" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ marginBottom: '4px' }}>
                    <Link to={`/${group}/${projectPath}/-/issues/${issue.iid}`} style={{ fontWeight: 600, fontSize: '15px', textDecoration: 'none', color: 'var(--gl-text-primary)', marginRight: '8px' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--gl-purple)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--gl-text-primary)'}>
                      {issue.title}
                    </Link>
                    {issueLabels.map(l => (
                      <span key={l.id} style={{ display: 'inline-block', background: l.color, color: l.textColor || '#fff', fontSize: '11px', padding: '1px 8px', borderRadius: '10px', marginRight: '4px', fontWeight: 500 }}>{l.name}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gl-text-tertiary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>#{issue.iid}</span>
                    <span>opened {timeAgo(issue.createdAt)}</span>
                    {milestone && <span>Milestone: {milestone.title}</span>}
                    {issue.dueDate && <span>Due: {issue.dueDate}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  {assignees.length > 0 && (
                    <div style={{ display: 'flex' }}>
                      {assignees.map(a => (
                        <img key={a.id} src={a.avatarUrl || a.avatar} alt={a.name} title={a.name}
                          style={{ width: '24px', height: '24px', borderRadius: '50%', marginLeft: '-4px', border: '2px solid #fff' }} />
                      ))}
                    </div>
                  )}
                  {commentCount > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--gl-text-tertiary)' }}>
                      <MessageSquare size={12} /> {commentCount}
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: 'var(--gl-text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {timeAgo(issue.updatedAt)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
