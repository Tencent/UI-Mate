import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Tag, Plus } from 'lucide-react'
import { useApp, ACTIONS } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/dataManager.js'
import Breadcrumb from '../components/Breadcrumb.jsx'

export default function Tags() {
  const { group, project: projectPath } = useParams()
  const { state, dispatch } = useApp()
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', commitSha: '', message: '' })

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const tags = (state.tags || []).filter(t => t.projectId === project.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const commits = state.commits.filter(c => c.projectId === project.id)

  const handleCreate = () => {
    if (!form.name.trim() || !form.commitSha) return
    dispatch({ type: ACTIONS.CREATE_TAG, payload: { projectId: project.id, name: form.name, commitSha: form.commitSha, message: form.message, taggerId: state.currentUser.id } })
    setShowNew(false)
    setForm({ name: '', commitSha: '', message: '' })
  }

  return (
    <div>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name, to: `/${group}/${projectPath}` }, { label: 'Tags' }]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Tags</h1>
        <button className="gl-btn gl-btn-primary" onClick={() => setShowNew(true)}><Plus size={14} style={{ marginRight: '4px' }} />New tag</button>
      </div>

      {showNew && (
        <div className="gl-card" style={{ marginBottom: '20px', padding: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="gl-form-group" style={{ flex: 1, margin: 0 }}>
              <label className="gl-form-label">Tag name *</label>
              <input className="gl-form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="v2.0.0" autoFocus />
            </div>
            <div className="gl-form-group" style={{ flex: 1, margin: 0 }}>
              <label className="gl-form-label">Create from (commit) *</label>
              <select className="gl-form-input" value={form.commitSha} onChange={e => setForm(f => ({ ...f, commitSha: e.target.value }))}>
                <option value="">Select commit...</option>
                {commits.map(c => <option key={c.id} value={c.id}>{c.shortId} — {c.title?.slice(0, 40)}</option>)}
              </select>
            </div>
            <div className="gl-form-group" style={{ flex: 2, margin: 0 }}>
              <label className="gl-form-label">Message</label>
              <input className="gl-form-input" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tag message (optional)" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="gl-btn gl-btn-primary gl-btn-sm" onClick={handleCreate}>Create tag</button>
            <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      {tags.length === 0 ? (
        <div className="gl-empty-state" style={{ padding: '40px' }}>
          <div className="gl-empty-state-title">No tags</div>
        </div>
      ) : (
        <div className="gl-card">
          {tags.map(tag => {
            const commit = commits.find(c => c.shortId === tag.commitSha || c.id === tag.commitSha)
            const author = state.users.find(u => u.id === tag.taggerId)
            return (
              <div key={tag.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Tag size={16} color="var(--gl-text-secondary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px', fontFamily: 'var(--gl-font-mono)', color: 'var(--gl-purple)' }}>{tag.name}</div>
                  {tag.message && <div style={{ fontSize: '13px', color: 'var(--gl-text-secondary)', marginBottom: '4px' }}>{tag.message}</div>}
                  {commit && <div style={{ fontSize: '12px', color: 'var(--gl-text-tertiary)' }}>{commit.shortId} — {commit.title?.slice(0, 50)}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {author && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', justifyContent: 'flex-end' }}>
                    <img src={author.avatarUrl || author.avatar} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px' }}>{author.name}</span>
                  </div>}
                  <div style={{ fontSize: '12px', color: 'var(--gl-text-tertiary)' }}>{timeAgo(tag.createdAt)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
