import { useParams, Link } from 'react-router-dom'
import { Folder, FileText, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/dataManager.js'
import BranchSelector from '../components/BranchSelector.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'

export default function FileTree() {
  const { group, project: projectPath, branch, '*': filePath } = useParams()
  const { state } = useApp()

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const currentDir = filePath || ''
  const files = state.files.filter(f => {
    if (f.projectId !== project.id || f.branch !== branch) return false
    const rel = currentDir ? f.path.replace(currentDir + '/', '') : f.path
    if (!f.path.startsWith(currentDir ? currentDir + '/' : '')) return false
    const parts = (currentDir ? f.path.slice(currentDir.length + 1) : f.path).split('/')
    return parts.length === 1
  }).sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name)
    return a.type === 'tree' ? -1 : 1
  })

  const getCommit = (id) => state.commits.find(c => c.id === id)

  const pathParts = currentDir ? currentDir.split('/') : []
  const breadcrumbItems = [
    { label: group, to: '/' },
    { label: project.name, to: `/${group}/${projectPath}` },
    ...pathParts.map((part, i) => ({
      label: part,
      to: `/${group}/${projectPath}/-/tree/${branch}/${pathParts.slice(0, i+1).join('/')}`
    }))
  ]

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <BranchSelector currentBranch={branch} basePath={`/${group}/${projectPath}/-/tree`} />
        {currentDir && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--gl-font-mono)', fontSize: '13px' }}>
            {pathParts.map((part, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {i > 0 && <ChevronRight size={12} />}
                <Link to={`/${group}/${projectPath}/-/tree/${branch}/${pathParts.slice(0, i+1).join('/')}`}
                  style={{ color: 'var(--gl-purple)', textDecoration: 'none' }}>{part}</Link>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="gl-card">
        <table className="gl-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Last commit</th>
              <th>Last update</th>
            </tr>
          </thead>
          <tbody>
            {currentDir && (
              <tr>
                <td>
                  <Link to={`/${group}/${projectPath}/-/tree/${branch}${pathParts.length > 1 ? '/' + pathParts.slice(0, -1).join('/') : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'var(--gl-text-secondary)' }}>
                    <Folder size={16} /> ..
                  </Link>
                </td>
                <td /><td />
              </tr>
            )}
            {files.map(f => {
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
                  <td style={{ color: 'var(--gl-text-secondary)', fontSize: '13px', maxWidth: '250px', overflow: 'hidden' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{commit?.title}</span>
                  </td>
                  <td style={{ color: 'var(--gl-text-tertiary)', fontSize: '13px', whiteSpace: 'nowrap' }}>{commit ? timeAgo(commit.createdAt) : ''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
