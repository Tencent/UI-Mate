import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp, ACTIONS } from '../context/AppContext.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'

export default function NewIssue() {
  const { group, project: projectPath } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [assigneeIds, setAssigneeIds] = useState([])
  const [labelIds, setLabelIds] = useState([])
  const [milestoneId, setMilestoneId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [weight, setWeight] = useState('')
  const [errors, setErrors] = useState({})

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const labels = state.labels.filter(l => l.projectId === project.id)
  const milestones = state.milestones.filter(m => m.projectId === project.id)
  const members = state.members.filter(m => m.projectId === project.id)
  const projectUsers = state.users.filter(u => members.some(m => m.userId === u.id))

  const handleSubmit = () => {
    if (!title.trim()) { setErrors({ title: 'Title is required' }); return }
    const existingIids = state.issues.filter(i => i.projectId === project.id).map(i => i.iid)
    const newIid = existingIids.length > 0 ? Math.max(...existingIids) + 1 : 1
    dispatch({ type: ACTIONS.CREATE_ISSUE, payload: {
      projectId: project.id, title: title.trim(), description: desc,
      assigneeIds, labelIds, milestoneId: milestoneId || null,
      dueDate: dueDate || null, weight: weight ? parseInt(weight) : null,
      authorId: state.currentUser.id, iid: newIid,
      state: 'opened', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }})
    navigate(`/${group}/${projectPath}/-/issues/${newIid}`)
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name, to: `/${group}/${projectPath}` }, { label: 'Issues', to: `/${group}/${projectPath}/-/issues` }, { label: 'New issue' }]} />
      <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>New issue</h1>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <div className="gl-form-group">
            <label className="gl-form-label">Title <span style={{ color: 'var(--gl-danger)' }}>*</span></label>
            <input className="gl-form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Issue title" autoFocus />
            {errors.title && <div style={{ color: 'var(--gl-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.title}</div>}
          </div>
          <div className="gl-form-group">
            <label className="gl-form-label">Description</label>
            <textarea className="gl-form-textarea" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Write a description..." style={{ minHeight: '200px', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="gl-btn gl-btn-success" onClick={handleSubmit}>Create issue</button>
            <button className="gl-btn gl-btn-secondary" onClick={() => navigate(`/${group}/${projectPath}/-/issues`)}>Cancel</button>
          </div>
        </div>
        <div style={{ width: '220px', flexShrink: 0 }}>
          <div className="gl-form-group">
            <label className="gl-form-label">Assignees</label>
            <div style={{ border: '1px solid var(--gl-border)', borderRadius: '4px', padding: '8px', maxHeight: '150px', overflowY: 'auto' }}>
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
            <label className="gl-form-label">Labels</label>
            <div style={{ border: '1px solid var(--gl-border)', borderRadius: '4px', padding: '8px', maxHeight: '150px', overflowY: 'auto' }}>
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
          <div className="gl-form-group">
            <label className="gl-form-label">Due date</label>
            <input type="date" className="gl-form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div className="gl-form-group">
            <label className="gl-form-label">Weight</label>
            <input type="number" className="gl-form-input" min="0" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0" />
          </div>
        </div>
      </div>
    </div>
  )
}
