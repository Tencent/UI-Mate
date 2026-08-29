import { useParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/dataManager.js'
import BranchSelector from '../components/BranchSelector.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'

export default function CommitHistory() {
  const { group, project: projectPath, branch } = useParams()
  const { state } = useApp()

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const commits = state.commits.filter(c => c.projectId === project.id && c.branch === branch)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  // Group by date
  const grouped = commits.reduce((acc, c) => {
    const date = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    if (!acc[date]) acc[date] = []
    acc[date].push(c)
    return acc
  }, {})

  return (
    <div>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name, to: `/${group}/${projectPath}` }, { label: 'Commits' }]} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Commits</h1>
        <BranchSelector currentBranch={branch} basePath={`/${group}/${projectPath}/-/commits`} />
      </div>

      {Object.entries(grouped).map(([date, dayCommits]) => (
        <div key={date} style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gl-text-secondary)', padding: '8px 0', borderBottom: '1px solid var(--gl-border)', marginBottom: '0' }}>{date}</div>
          <div className="gl-card" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px', marginBottom: '0' }}>
            {dayCommits.map(c => {
              const author = state.users.find(u => u.id === c.authorId)
              return (
                <div key={c.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {author && <img src={author.avatarUrl || author.avatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/${group}/${projectPath}/-/commit/${c.shortId}`} style={{ fontWeight: 500, color: 'var(--gl-text-primary)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--gl-purple)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--gl-text-primary)'}>
                      {c.title}
                    </Link>
                    <div style={{ fontSize: '12px', color: 'var(--gl-text-tertiary)' }}>{c.authorName} · {timeAgo(c.createdAt)}</div>
                  </div>
                  <Link to={`/${group}/${projectPath}/-/commit/${c.shortId}`}
                    style={{ fontFamily: 'var(--gl-font-mono)', fontSize: '12px', color: 'var(--gl-purple)', background: 'var(--gl-bg-tertiary)', padding: '2px 8px', borderRadius: '4px', textDecoration: 'none', flexShrink: 0 }}>
                    {c.shortId}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      {commits.length === 0 && <div className="gl-empty-state"><div className="gl-empty-state-title">No commits on branch {branch}</div></div>}
    </div>
  )
}
