import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, GitFork, Lock, Globe, Folder, FileText, Clock, GitBranch, GitCommit, GitMerge, CircleDot, Tag, Play } from 'lucide-react'
import { useApp, ACTIONS } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/dataManager.js'
import { renderMarkdown } from '../utils/markdown.js'
import BranchSelector from '../components/BranchSelector.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'

export default function ProjectOverview() {
  const { group, project: projectPath } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [branch, setBranch] = useState('main')

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const allFiles = state.files.filter(f => f.projectId === project.id && f.branch === branch)
  const readme = state.files.find(f => f.projectId === project.id && f.branch === branch && f.name === 'README.md')

  const commitCount = state.commits.filter(c => c.projectId === project.id).length
  const branchCount = state.branches.filter(b => b.projectId === project.id).length
  const tagCount = state.tags.filter(t => t.projectId === project.id).length
  const mrCount = state.mergeRequests.filter(m => m.projectId === project.id).length
  const pipelineCount = state.pipelines.filter(p => p.projectId === project.id).length
  const latestPipeline = state.pipelines.filter(p => p.projectId === project.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]

  const handleStar = () => dispatch({ type: ACTIONS.STAR_PROJECT, payload: { projectId: project.id } })
  const handleFork = () => dispatch({ type: ACTIONS.FORK_PROJECT, payload: { projectId: project.id } })
  const resolveReadmeLink = (href) => {
    if (/^(https?:|mailto:|#|\/)/.test(href)) return href
    return `/${group}/${projectPath}/-/blob/${branch}/${href.replace(/^\.\//, '')}`
  }

  const getCommit = (commitId) => state.commits.find(c => c.id === commitId)

  // Activity feed - recent events
  const recentCommits = state.commits.filter(c => c.projectId === project.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const recentIssues = state.issues.filter(i => i.projectId === project.id).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3)
  const recentMRs = state.mergeRequests.filter(m => m.projectId === project.id).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3)

  const activities = [
    ...recentCommits.map(c => ({ type: 'commit', data: c, date: c.createdAt })),
    ...recentIssues.map(i => ({ type: 'issue', data: i, date: i.updatedAt })),
    ...recentMRs.map(m => ({ type: 'mr', data: m, date: m.updatedAt })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)

  const pipelineStatusColor = { success: 'var(--gl-success)', passed: 'var(--gl-success)', failed: 'var(--gl-danger)', running: 'var(--gl-info)', pending: 'var(--gl-warning)', canceled: 'var(--gl-text-secondary)' }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name }]} />

      {/* Project header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '40px', height: '40px', background: project.avatarColor || 'var(--gl-purple)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '18px' }}>
                {project.name.charAt(0).toUpperCase()}
              </div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>{project.name}</h1>
              {project.visibility === 'private' ? <Lock size={14} color="var(--gl-text-tertiary)" /> : <Globe size={14} color="var(--gl-text-secondary)" />}
            </div>
            {project.description && <p style={{ margin: '4px 0 8px', color: 'var(--gl-text-secondary)' }}>{project.description}</p>}
            {project.topics?.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {project.topics.map(t => <span key={t} style={{ fontSize: '12px', background: '#E6E0F5', color: 'var(--gl-purple)', padding: '2px 10px', borderRadius: '10px' }}>{t}</span>)}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={handleStar}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: project.isStarred ? '#C17D10' : '' }}>
              <Star size={14} fill={project.isStarred ? '#C17D10' : 'none'} /> {project.isStarred ? 'Unstar' : 'Star'} {project.stars}
            </button>
            <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={handleFork}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <GitFork size={14} /> Fork {project.forks}
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Link to={`/${group}/${projectPath}/-/commits/main`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gl-text-secondary)', textDecoration: 'none', padding: '6px 12px', border: '1px solid var(--gl-border)', borderRadius: '6px', background: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gl-purple)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gl-border)'}>
          <GitCommit size={14} /> <strong>{commitCount}</strong> commits
        </Link>
        <Link to={`/${group}/${projectPath}/-/branches`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gl-text-secondary)', textDecoration: 'none', padding: '6px 12px', border: '1px solid var(--gl-border)', borderRadius: '6px', background: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gl-purple)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gl-border)'}>
          <GitBranch size={14} /> <strong>{branchCount}</strong> branches
        </Link>
        <Link to={`/${group}/${projectPath}/-/tags`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gl-text-secondary)', textDecoration: 'none', padding: '6px 12px', border: '1px solid var(--gl-border)', borderRadius: '6px', background: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gl-purple)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gl-border)'}>
          <Tag size={14} /> <strong>{tagCount}</strong> tags
        </Link>
        <Link to={`/${group}/${projectPath}/-/merge_requests`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gl-text-secondary)', textDecoration: 'none', padding: '6px 12px', border: '1px solid var(--gl-border)', borderRadius: '6px', background: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gl-purple)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gl-border)'}>
          <GitMerge size={14} /> <strong>{mrCount}</strong> merge requests
        </Link>
        {latestPipeline && (
          <Link to={`/${group}/${projectPath}/-/pipelines/${latestPipeline.id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gl-text-secondary)', textDecoration: 'none', padding: '6px 12px', border: '1px solid var(--gl-border)', borderRadius: '6px', background: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gl-purple)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gl-border)'}>
            <Play size={14} /> Pipeline
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: pipelineStatusColor[latestPipeline.status] || '#ccc', display: 'inline-block' }} />
            {latestPipeline.status}
          </Link>
        )}
      </div>

      {/* File browser */}
      <div className="gl-card" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BranchSelector currentBranch={branch} onChange={setBranch} />
          <span style={{ color: 'var(--gl-text-secondary)', fontSize: '13px' }}>
            {allFiles.filter(f => f.type === 'blob').length} files
          </span>
        </div>
        <table className="gl-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Last commit</th>
              <th>Last update</th>
            </tr>
          </thead>
          <tbody>
            {allFiles.filter(f => !f.path.includes('/') || (f.type === 'tree' && f.path.split('/').length === 1)).sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name)
              return a.type === 'tree' ? -1 : 1
            }).slice(0, 25).map(f => {
              const commit = getCommit(f.lastCommitId)
              return (
                <tr key={f.id}>
                  <td>
                    <Link to={`/${group}/${projectPath}/-/${f.type === 'tree' ? 'tree' : 'blob'}/${branch}/${f.path}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'var(--gl-text-primary)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--gl-purple)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--gl-text-primary)'}>
                      {f.type === 'tree' ? <Folder size={16} color="var(--gl-text-secondary)" /> : <FileText size={16} color="var(--gl-text-secondary)" />}
                      {f.name}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--gl-text-secondary)', fontSize: '13px', maxWidth: '200px' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {commit?.title || ''}
                    </span>
                  </td>
                  <td style={{ color: 'var(--gl-text-tertiary)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {commit ? timeAgo(commit.createdAt) : ''}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* README */}
      {readme && (
        <div className="gl-card" style={{ marginBottom: '24px' }}>
          <div className="gl-card-header" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} /> README.md
          </div>
          <div className="gl-card-body" style={{ padding: '20px' }}>
            <div className="gl-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(readme.content, { resolveLink: resolveReadmeLink }) }}
              style={{ lineHeight: 1.6, maxWidth: '800px' }} />
          </div>
        </div>
      )}
      {project.readme && !readme && (
        <div className="gl-card" style={{ marginBottom: '24px' }}>
          <div className="gl-card-header" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} /> README.md
          </div>
          <div className="gl-card-body" style={{ padding: '20px' }}>
            <div className="gl-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(project.readme, { resolveLink: resolveReadmeLink }) }} style={{ lineHeight: 1.6 }} />
          </div>
        </div>
      )}

      {/* Activity feed */}
      <div className="gl-card">
        <div className="gl-card-header" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} /> Project activity
        </div>
        <div>
          {activities.map((act, i) => {
            const user = state.users.find(u => u.id === (act.data.authorId || act.data.authorId))
            return (
              <div key={`${act.type}-${act.data.id}-${i}`} style={{ padding: '10px 16px', borderBottom: '1px solid var(--gl-border-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {user && <img src={user.avatarUrl || user.avatar} alt={user.name} style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {act.type === 'commit' && (
                    <div style={{ fontSize: '13px' }}>
                      <strong>{act.data.authorName}</strong>{' '}
                      <span style={{ color: 'var(--gl-text-secondary)' }}>pushed to</span>{' '}
                      <span style={{ fontFamily: 'var(--gl-font-mono)', background: 'var(--gl-bg-tertiary)', padding: '1px 6px', borderRadius: '3px', fontSize: '12px' }}>{act.data.branch}</span>
                      <span style={{ color: 'var(--gl-text-secondary)' }}> - </span>
                      <Link to={`/${group}/${projectPath}/-/commit/${act.data.shortId}`} style={{ textDecoration: 'none', color: 'var(--gl-text-primary)' }}>
                        {act.data.title}
                      </Link>
                    </div>
                  )}
                  {act.type === 'issue' && (
                    <div style={{ fontSize: '13px' }}>
                      <strong>{act.data.authorName}</strong>{' '}
                      <span style={{ color: 'var(--gl-text-secondary)' }}>{act.data.state === 'opened' ? 'opened' : 'closed'} issue</span>{' '}
                      <Link to={`/${group}/${projectPath}/-/issues/${act.data.iid}`} style={{ textDecoration: 'none' }}>
                        <CircleDot size={12} style={{ verticalAlign: 'middle', marginRight: '4px', color: act.data.state === 'opened' ? 'var(--gl-success)' : 'var(--gl-purple)' }} />
                        #{act.data.iid} {act.data.title}
                      </Link>
                    </div>
                  )}
                  {act.type === 'mr' && (
                    <div style={{ fontSize: '13px' }}>
                      <strong>{act.data.authorName}</strong>{' '}
                      <span style={{ color: 'var(--gl-text-secondary)' }}>{act.data.state === 'merged' ? 'merged' : act.data.state === 'opened' ? 'opened' : 'closed'} merge request</span>{' '}
                      <Link to={`/${group}/${projectPath}/-/merge_requests/${act.data.iid}`} style={{ textDecoration: 'none' }}>
                        <GitMerge size={12} style={{ verticalAlign: 'middle', marginRight: '4px', color: act.data.state === 'merged' ? 'var(--gl-purple)' : 'var(--gl-success)' }} />
                        !{act.data.iid} {act.data.title}
                      </Link>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--gl-text-tertiary)', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(act.date)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
