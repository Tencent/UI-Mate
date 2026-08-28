import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FileText, Copy, Edit2, Download } from 'lucide-react'
import { useApp, ACTIONS } from '../context/AppContext.jsx'
import { renderMarkdown } from '../utils/markdown.js'
import BranchSelector from '../components/BranchSelector.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'

export default function FileBlob() {
  const { group, project: projectPath, branch, '*': filePath } = useParams()
  const { state, dispatch } = useApp()
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [preview, setPreview] = useState(true)
  const [copied, setCopied] = useState(false)

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  const file = project ? state.files.find(f => f.projectId === project.id && f.branch === branch && f.path === filePath) : null

  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>
  if (!file) return <div className="gl-empty-state"><div className="gl-empty-state-title">File not found: {filePath}</div></div>

  const pathParts = filePath.split('/')
  const breadcrumbItems = [
    { label: group, to: '/' },
    { label: project.name, to: `/${group}/${projectPath}` },
    ...pathParts.slice(0, -1).map((part, i) => ({
      label: part,
      to: `/${group}/${projectPath}/-/tree/${branch}/${pathParts.slice(0, i+1).join('/')}`
    })),
    { label: pathParts[pathParts.length - 1] }
  ]

  const handleCopy = () => {
    try {
      const copyResult = navigator.clipboard?.writeText(file.content || '')
      if (copyResult?.catch) copyResult.catch(() => {})
    } catch(e) {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    dispatch({ type: ACTIONS.UPDATE_FILE, payload: { path: file.path, content: editContent, projectId: project.id, branch } })
    setEditMode(false)
  }

  const handleDownload = () => {
    const blob = new Blob([file.content || ''], { type: file.name.endsWith('.md') ? 'text/markdown' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    URL.revokeObjectURL(url)
  }

  const isMarkdown = file.name.endsWith('.md')
  const lines = (file.content || '').split('\n')
  const displaySize = typeof file.size === 'number' ? `${(file.size / 1024).toFixed(1)} KB` : file.size

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <BranchSelector currentBranch={branch} basePath={`/${group}/${projectPath}/-/blob`} />
      </div>

      <div className="gl-card">
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="var(--gl-text-secondary)" />
            <span style={{ fontWeight: 500 }}>{file.name}</span>
            <span style={{ color: 'var(--gl-text-tertiary)', fontSize: '13px' }}>{displaySize || ''}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isMarkdown && !editMode && (
              <div style={{ display: 'flex', border: '1px solid var(--gl-border)', borderRadius: '4px', overflow: 'hidden' }}>
                <button className="gl-btn gl-btn-ghost gl-btn-sm" style={{ borderRadius: 0, background: preview ? 'var(--gl-bg-tertiary)' : '' }} onClick={() => setPreview(true)}>Preview</button>
                <button className="gl-btn gl-btn-ghost gl-btn-sm" style={{ borderRadius: 0, background: !preview ? 'var(--gl-bg-tertiary)' : '' }} onClick={() => setPreview(false)}>Code</button>
              </div>
            )}
            <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={handleDownload}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Download size={12} /> Download
            </button>
            <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => { setEditContent(file.content || ''); setEditMode(true) }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Edit2 size={12} /> Edit
            </button>
          </div>
        </div>

        {editMode ? (
          <div>
            <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
              style={{ width: '100%', minHeight: '400px', fontFamily: 'var(--gl-font-mono)', fontSize: '13px', padding: '16px', border: 'none', outline: 'none', resize: 'vertical' }} />
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--gl-border)', display: 'flex', gap: '8px' }}>
              <button className="gl-btn gl-btn-primary gl-btn-sm" onClick={handleSave}>Save changes</button>
              <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </div>
        ) : isMarkdown && preview ? (
          <div style={{ padding: '24px' }}>
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(file.content) }} style={{ lineHeight: 1.7, maxWidth: '800px' }} />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'var(--gl-font-mono)', fontSize: '13px' }}>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} style={{ lineHeight: '20px' }}>
                    <td style={{ padding: '0 12px', color: 'var(--gl-text-tertiary)', userSelect: 'none', textAlign: 'right', minWidth: '48px', background: 'var(--gl-bg-secondary)', borderRight: '1px solid var(--gl-border)' }}>{i + 1}</td>
                    <td style={{ padding: '0 16px', whiteSpace: 'pre', color: 'var(--gl-text-primary)' }}>{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
