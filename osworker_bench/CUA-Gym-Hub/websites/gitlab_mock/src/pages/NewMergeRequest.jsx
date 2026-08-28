import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp, ACTIONS } from '../context/AppContext.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'

export default function NewMergeRequest() {
  const { group, project: projectPath } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const branches = state.branches.filter(b => b.projectId === project.id)
  const defaultBranch = branches.find(b => b.isDefault)

  const [sourceBranch, setSourceBranch] = useState(branches.find(b => !b.isDefault)?.name || '')
  const [targetBranch, setTargetBranch] = useState(defaultBranch?.name || 'main')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [assigneeIds, setAssigneeIds] = useState([])
  const [reviewerIds, setReviewerIds] = useState([])
  const [labelIds, setLabelIds] = useState([])
  const [milestoneId, setMilestoneId] = useState('')
  const [deleteSourceBranch, setDeleteSourceBranch] = useState(true)
  const [squash, setSquash] = useState(false)
  const [errors, setErrors] = useState({})

  const labels = state.labels.filter(l => l.projectId === project.id)
  const milestones = state.milestones.filter(m => m.projectId === project.id)
  const members = state.members.filter(m => m.projectId === project.id)
  const projectUsers = state.users.filter(u => members.some(m => m.userId === u.id))

  const autoTitle = sourceBranch ? sourceBranch.replace(/^(feature|fix|chore|refactor)\//, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''

  const handleSubmit = () => {
    const t = title.trim() || autoTitle
    if (!t) { setErrors({ title: 'Title is required' }); return }
    if (!sourceBranch) { setErrors({ source: 'Source branch is required' }); return }
    const existingIids = state.mergeRequests.filter(m => m.projectId === project.id).map(m => m.iid)
    const newIid = existingIids.length > 0 ? Math.max(...existingIids) + 1 : 1
    dispatch({ type: ACTIONS.CREATE_MERGE_REQUEST, payload: {
      projectId: project.id, title: t, description: desc,
      sourceBranch, targetBranch, assigneeIds, reviewerIds, labelIds,
      milestoneId: milestoneId || null, squash,
      authorId: state.currentUser.id, iid: newIid, draft: false,
      state: 'opened', mergeStatus: 'can_be_merged',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }})
    navigate(`/${group}/${projectPath}/-/merge_requests/${newIid}`)
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name, to: `/${group}/${projectPath}` }, { label: 'Merge requests', to: `/${group}/${projectPath}/-/merge_requests` }, { label: 'New merge request' }]} />
      <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>New merge request</h1>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div className="gl-form-group" style={{ flex: 1, margin: 0 }}>
              <label className="gl-form-label">Source branch</label>
              <select className="gl-form-input" value={sourceBranch} onChange={e => setSourceBranch(e.target.value)}>
                <option value="">Select branch...</option>
                {branches.filter(b => !b.isDefault).map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
              {errors.source && <div style={{ color: 'var(--gl-danger)', fontSize: '12px' }}>{errors.source}</div>}
            </div>
            <div style={{ paddingTop: '28px', color: 'var(--gl-text-secondary)' }}>→</div>
            <div className="gl-form-group" style={{ flex: 1, margin: 0 }}>
              <label className="gl-form-label">Target branch</label>
              <select className="gl-form-input" value={targetBranch} onChange={e => setTargetBranch(e.target.value)}>
                {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="gl-form-group">
            <label className="gl-form-label">Title</label>
            <input className="gl-form-input" value={title || autoTitle} onChange={e => setTitle(e.target.value)} placeholder={autoTitle || 'Merge request title'} />
            {errors.title && <div style={{ color: 'var(--gl-danger)', fontSize: '12px' }}>{errors.title}</div>}
          </div>
          <div className="gl-form-group">
            <label className="gl-form-label">Description</label>
            <textarea className="gl-form-textarea" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe your changes..." style={{ minHeight: '150px', resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
              <input type="checkbox" checked={deleteSourceBranch} onChange={e => setDeleteSourceBranch(e.target.checked)} />
              Delete source branch when merge request is merged
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={squash} onChange={e => setSquash(e.target.checked)} />
              Squash commits when merge request is merged
            </label>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="gl-btn gl-btn-primary" onClick={handleSubmit}>Create merge request</button>
            <button className="gl-btn gl-btn-secondary" onClick={() => navigate(`/${group}/${projectPath}/-/merge_requests`)}>Cancel</button>
          </div>
        </div>
        <div style={{ width: '220px', flexShrink: 0 }}>
          <div className="gl-form-group">
            <label className="gl-form-label">Assignees</label>
            <div style={{ border: '1px solid var(--gl-border)', borderRadius: '4px', padding: '8px', maxHeight: '130px', overflowY: 'auto' }}>
              {projectUsers.map(u => (
                <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={assigneeIds.includes(u.id)} onChange={() => setAssigneeIds(ids => ids.includes(u.id) ? ids.filter(id => id !== u.id) : [...ids, u.id])} />
                  <img src={u.avatarUrl || u.avatar} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                  <span style={{ fontSize: '13px' }}>{u.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="gl-form-group">
            <label className="gl-form-label">Reviewers</label>
            <div style={{ border: '1px solid var(--gl-border)', borderRadius: '4px', padding: '8px', maxHeight: '130px', overflowY: 'auto' }}>
              {projectUsers.map(u => (
                <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={reviewerIds.includes(u.id)} onChange={() => setReviewerIds(ids => ids.includes(u.id) ? ids.filter(id => id !== u.id) : [...ids, u.id])} />
                  <img src={u.avatarUrl || u.avatar} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                  <span style={{ fontSize: '13px' }}>{u.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="gl-form-group">
            <label className="gl-form-label">Labels</label>
            <div style={{ border: '1px solid var(--gl-border)', borderRadius: '4px', padding: '8px', maxHeight: '120px', overflowY: 'auto' }}>
              {labels.map(l => (
                <label key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={labelIds.includes(l.id)} onChange={() => setLabelIds(ids => ids.includes(l.id) ? ids.filter(id => id !== l.id) : [...ids, l.id])} />
                  <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: l.color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: '13px' }}>{l.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="gl-form-group">
            <label className="gl-form-label">Milestone</label>
            <select className="gl-form-input" value={milestoneId} onChange={e => setMilestoneId(e.target.value)}>
              <option value="">None</option>
              {milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
