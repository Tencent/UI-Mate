import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Copy } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/dataManager.js'
import Breadcrumb from '../components/Breadcrumb.jsx'

export default function CommitDetail() {
  const { group, project: projectPath, sha } = useParams()
  const { state } = useApp()
  const [copied, setCopied] = useState(false)

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const commit = state.commits.find(c => c.projectId === project.id && (c.shortId === sha || c.id === sha))
  if (!commit) return <div className="gl-empty-state"><div className="gl-empty-state-title">Commit not found</div></div>

  const author = state.users.find(u => u.id === commit.authorId)

  return (
    <div>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name, to: `/${group}/${projectPath}` }, { label: 'Commits', to: `/${group}/${projectPath}/-/commits/${commit.branch}` }, { label: commit.shortId }]} />

      <div className="gl-card" style={{ marginBottom: '24px', padding: '20px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>{commit.message}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {author && <img src={author.avatarUrl || author.avatar} alt={author.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />}
          <div>
            <div style={{ fontWeight: 600 }}>{commit.authorName}</div>
            <div style={{ fontSize: '12px', color: 'var(--gl-text-tertiary)' }}>{commit.authorEmail} · {timeAgo(commit.createdAt)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--gl-font-mono)', fontSize: '13px', color: 'var(--gl-text-secondary)', background: 'var(--gl-bg-tertiary)', padding: '8px 12px', borderRadius: '4px' }}>
          <span>SHA: </span>
          <span style={{ fontWeight: 600, color: 'var(--gl-text-primary)' }}>{commit.shortId}</span>
          <button className="gl-btn gl-btn-ghost gl-btn-sm" aria-label="Copy commit SHA" onClick={() => {
            try {
              const copyResult = navigator.clipboard?.writeText(commit.shortId)
              if (copyResult?.catch) copyResult.catch(() => {})
            } catch(e) {}
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}><Copy size={12} /></button>
          {copied && <span style={{ color: 'var(--gl-success)', fontSize: '12px' }}>Copied</span>}
        </div>
      </div>

      <div className="gl-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
          <span style={{ color: 'var(--gl-success)', fontWeight: 600 }}>+{commit.additions} additions</span>
          <span style={{ color: 'var(--gl-danger)', fontWeight: 600 }}>-{commit.deletions} deletions</span>
        </div>
      </div>

      <div className="gl-card">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gl-border)', fontWeight: 600 }}>File changes</div>
        <div style={{ padding: '16px', color: 'var(--gl-text-secondary)', fontStyle: 'italic' }}>
          Showing diff for commit {commit.shortId}: +{commit.additions} −{commit.deletions}
        </div>
        <div style={{ padding: '0 0 16px', fontFamily: 'var(--gl-font-mono)', fontSize: '13px' }}>
          {Array.from({ length: Math.min(commit.additions || 0, 5) }).map((_, i) => (
            <div key={i} className="gl-diff-line-added" style={{ padding: '1px 16px' }}>+ Added line {i + 1}</div>
          ))}
          {Array.from({ length: Math.min(commit.deletions || 0, 3) }).map((_, i) => (
            <div key={i} className="gl-diff-line-removed" style={{ padding: '1px 16px' }}>- Removed line {i + 1}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
