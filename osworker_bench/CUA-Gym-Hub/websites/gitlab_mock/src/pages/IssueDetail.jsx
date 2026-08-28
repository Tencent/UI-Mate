import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CircleDot, CheckCircle, Edit2, X, Plus } from 'lucide-react'
import { useApp, ACTIONS } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/dataManager.js'
import { renderMarkdown } from '../utils/markdown.js'
import Breadcrumb from '../components/Breadcrumb.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function IssueDetail() {
  const { group, project: projectPath, iid } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [commentText, setCommentText] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState('')
  const [editingDesc, setEditingDesc] = useState(false)
  const [descVal, setDescVal] = useState('')
  const [editingAssignees, setEditingAssignees] = useState(false)
  const [editingLabels, setEditingLabels] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentVal, setEditingCommentVal] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const issue = state.issues.find(i => i.projectId === project.id && i.iid === parseInt(iid))
  if (!issue) return <div className="gl-empty-state"><div className="gl-empty-state-title">Issue not found</div></div>

  const labels = state.labels.filter(l => l.projectId === project.id)
  const milestones = state.milestones.filter(m => m.projectId === project.id)
  const members = state.members.filter(m => m.projectId === project.id)
  const projectUsers = state.users.filter(u => members.some(m => m.userId === u.id))
  const issueLabels = labels.filter(l => issue.labelIds?.includes(l.id))
  const assignees = state.users.filter(u => issue.assigneeIds?.includes(u.id))
  const milestone = milestones.find(m => m.id === issue.milestoneId)
  const comments = state.issueComments.filter(c => c.issueId === issue.id).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const handleClose = () => dispatch({ type: ACTIONS.CLOSE_ISSUE, payload: { issueId: issue.id } })
  const handleReopen = () => dispatch({ type: ACTIONS.REOPEN_ISSUE, payload: { issueId: issue.id } })
  const handleComment = () => {
    if (!commentText.trim()) return
    dispatch({ type: ACTIONS.ADD_ISSUE_COMMENT, payload: { issueId: issue.id, authorId: state.currentUser.id, body: commentText } })
    setCommentText('')
  }
  const handleSaveTitle = () => {
    dispatch({ type: ACTIONS.UPDATE_ISSUE, payload: { issueId: issue.id, title: titleVal } })
    setEditingTitle(false)
  }
  const handleSaveDesc = () => {
    dispatch({ type: ACTIONS.UPDATE_ISSUE, payload: { issueId: issue.id, description: descVal } })
    setEditingDesc(false)
  }
  const toggleLabel = (labelId) => {
    const current = issue.labelIds || []
    const updated = current.includes(labelId) ? current.filter(id => id !== labelId) : [...current, labelId]
    dispatch({ type: ACTIONS.UPDATE_ISSUE, payload: { issueId: issue.id, labelIds: updated } })
  }
  const toggleAssignee = (userId) => {
    const current = issue.assigneeIds || []
    const updated = current.includes(userId) ? current.filter(id => id !== userId) : [...current, userId]
    dispatch({ type: ACTIONS.UPDATE_ISSUE, payload: { issueId: issue.id, assigneeIds: updated } })
  }

  const confirmDeleteIssue = () => {
    dispatch({ type: ACTIONS.DELETE_ISSUE, payload: { issueId: issue.id } })
    setShowDeleteDialog(false)
    navigate(`/${group}/${projectPath}/-/issues`)
  }

  return (
    <div>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name, to: `/${group}/${projectPath}` }, { label: 'Issues', to: `/${group}/${projectPath}/-/issues` }, { label: `#${issue.iid}` }]} />

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            {editingTitle ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="gl-form-input" value={titleVal} onChange={e => setTitleVal(e.target.value)} style={{ flex: 1, fontSize: '18px' }} autoFocus />
                <button className="gl-btn gl-btn-primary gl-btn-sm" onClick={handleSaveTitle}>Save</button>
                <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => setEditingTitle(false)}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, flex: 1 }}>{issue.title}</h1>
                <button className="gl-btn gl-btn-ghost gl-btn-sm" onClick={() => { setTitleVal(issue.title); setEditingTitle(true) }} aria-label="Edit issue title">
                  <Edit2 size={14} />
                </button>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              {issue.state === 'opened' ? (
                <span style={{ background: 'var(--gl-success)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CircleDot size={14} /> Open
                </span>
              ) : (
                <span style={{ background: 'var(--gl-purple)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} /> Closed
                </span>
              )}
              <span style={{ color: 'var(--gl-text-secondary)', fontSize: '14px' }}>
                <strong>#{issue.iid}</strong> opened {timeAgo(issue.createdAt)} by{' '}
                <strong>{state.users.find(u => u.id === issue.authorId)?.name}</strong>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="gl-card" style={{ marginBottom: '16px' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{state.users.find(u => u.id === issue.authorId)?.name}</span>
              {!editingDesc && <button className="gl-btn gl-btn-ghost gl-btn-sm" onClick={() => { setDescVal(issue.description || ''); setEditingDesc(true) }} aria-label="Edit issue description"><Edit2 size={14} /></button>}
            </div>
            <div style={{ padding: '16px' }}>
              {editingDesc ? (
                <>
                  <textarea className="gl-form-textarea" value={descVal} onChange={e => setDescVal(e.target.value)} style={{ minHeight: '200px', width: '100%', resize: 'vertical' }} autoFocus />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="gl-btn gl-btn-primary gl-btn-sm" onClick={handleSaveDesc}>Save</button>
                    <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => setEditingDesc(false)}>Cancel</button>
                  </div>
                </>
              ) : issue.description ? (
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(issue.description) }} style={{ lineHeight: 1.6 }} />
              ) : (
                <span style={{ color: 'var(--gl-text-tertiary)' }}>No description provided.</span>
              )}
            </div>
          </div>

          {/* Comments */}
          {comments.map(comment => {
            const author = state.users.find(u => u.id === comment.authorId)
            return (
              <div key={comment.id} className="gl-card" style={{ marginBottom: '12px' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', alignItems: 'center', gap: '8px', background: comment.isSystemNote ? 'var(--gl-bg-secondary)' : '' }}>
                  {author && <img src={author.avatarUrl || author.avatar} alt={author.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />}
                  <span style={{ fontWeight: comment.isSystemNote ? 400 : 600, color: comment.isSystemNote ? 'var(--gl-text-secondary)' : '' }}>{author?.name}</span>
                  <span style={{ color: 'var(--gl-text-tertiary)', fontSize: '12px', marginLeft: 'auto' }}>{timeAgo(comment.createdAt)}</span>
                  {!comment.isSystemNote && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="gl-btn gl-btn-ghost gl-btn-sm" title="Edit comment"
                        onClick={() => { setEditingCommentId(comment.id); setEditingCommentVal(comment.body) }}>
                        <Edit2 size={12} />
                      </button>
                      <button className="gl-btn gl-btn-ghost gl-btn-sm" title="Delete comment"
                        style={{ color: 'var(--gl-danger)' }}
                        onClick={() => dispatch({ type: ACTIONS.DELETE_ISSUE_COMMENT, payload: { commentId: comment.id } })}>
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ padding: '12px 16px', background: comment.isSystemNote ? 'var(--gl-bg-secondary)' : '' }}>
                  {comment.isSystemNote ? (
                    <span style={{ color: 'var(--gl-text-secondary)', fontStyle: 'italic', fontSize: '13px' }}>{comment.body}</span>
                  ) : editingCommentId === comment.id ? (
                    <>
                      <textarea className="gl-form-textarea" value={editingCommentVal} onChange={e => setEditingCommentVal(e.target.value)}
                        style={{ width: '100%', minHeight: '80px', resize: 'vertical', marginBottom: '8px' }} autoFocus />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="gl-btn gl-btn-primary gl-btn-sm" onClick={() => {
                          dispatch({ type: ACTIONS.UPDATE_ISSUE_COMMENT, payload: { commentId: comment.id, body: editingCommentVal } })
                          setEditingCommentId(null); setEditingCommentVal('')
                        }}>Save</button>
                        <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => { setEditingCommentId(null); setEditingCommentVal('') }}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(comment.body) }} style={{ lineHeight: 1.6 }} />
                  )}
                </div>
              </div>
            )
          })}

          {/* New comment */}
          <div className="gl-card">
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={state.currentUser.avatarUrl || state.currentUser.avatar} alt={state.currentUser.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              <span style={{ fontWeight: 600 }}>Add a comment</span>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <textarea className="gl-form-textarea" placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)}
                style={{ width: '100%', minHeight: '100px', resize: 'vertical', marginBottom: '8px' }} />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {issue.state === 'opened' ? (
                    <button className="gl-btn gl-btn-danger gl-btn-sm" onClick={handleClose}>Close issue</button>
                  ) : (
                    <button className="gl-btn gl-btn-success gl-btn-sm" onClick={handleReopen}>Reopen issue</button>
                  )}
                </div>
                <button className="gl-btn gl-btn-success gl-btn-sm" onClick={handleComment} disabled={!commentText.trim()}>Comment</button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: '220px', flexShrink: 0 }}>
          {/* Assignees */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>Assignees</span>
              <button className="gl-btn gl-btn-ghost gl-btn-sm" style={{ fontSize: '12px', color: 'var(--gl-purple)' }} onClick={() => setEditingAssignees(o => !o)}>Edit</button>
            </div>
            {editingAssignees && (
              <div style={{ border: '1px solid var(--gl-border)', borderRadius: '4px', padding: '8px', marginBottom: '8px', background: '#fff', position: 'relative', zIndex: 10 }}>
                {projectUsers.map(u => (
                  <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={issue.assigneeIds?.includes(u.id)} onChange={() => toggleAssignee(u.id)} />
                    <img src={u.avatarUrl || u.avatar} alt={u.name} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px' }}>{u.name}</span>
                  </label>
                ))}
                <button className="gl-btn gl-btn-ghost gl-btn-sm" style={{ marginTop: '8px', width: '100%' }} onClick={() => setEditingAssignees(false)}>Done</button>
              </div>
            )}
            {assignees.length > 0 ? assignees.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <img src={a.avatarUrl || a.avatar} alt={a.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                <span style={{ fontSize: '13px' }}>{a.name}</span>
              </div>
            )) : <span style={{ fontSize: '13px', color: 'var(--gl-text-tertiary)' }}>None</span>}
          </div>

          {/* Labels */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>Labels</span>
              <button className="gl-btn gl-btn-ghost gl-btn-sm" style={{ fontSize: '12px', color: 'var(--gl-purple)' }} onClick={() => setEditingLabels(o => !o)}>Edit</button>
            </div>
            {editingLabels && (
              <div style={{ border: '1px solid var(--gl-border)', borderRadius: '4px', padding: '8px', marginBottom: '8px', background: '#fff', position: 'relative', zIndex: 10 }}>
                {labels.map(l => (
                  <label key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={issue.labelIds?.includes(l.id)} onChange={() => toggleLabel(l.id)} />
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', background: l.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '13px' }}>{l.name}</span>
                  </label>
                ))}
                <button className="gl-btn gl-btn-ghost gl-btn-sm" style={{ marginTop: '8px', width: '100%' }} onClick={() => setEditingLabels(false)}>Done</button>
              </div>
            )}
            {issueLabels.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {issueLabels.map(l => <span key={l.id} style={{ background: l.color, color: l.textColor || '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>{l.name}</span>)}
              </div>
            ) : <span style={{ fontSize: '13px', color: 'var(--gl-text-tertiary)' }}>None</span>}
          </div>

          {/* Milestone */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>Milestone</span>
              <button className="gl-btn gl-btn-ghost gl-btn-sm" style={{ fontSize: '12px', color: 'var(--gl-purple)' }} onClick={() => setEditingMilestone(o => !o)}>Edit</button>
            </div>
            {editingMilestone && (
              <div style={{ border: '1px solid var(--gl-border)', borderRadius: '4px', padding: '8px', marginBottom: '8px', background: '#fff', zIndex: 10, position: 'relative' }}>
                <select className="gl-form-input" style={{ width: '100%', fontSize: '13px' }}
                  value={issue.milestoneId || ''} onChange={e => { dispatch({ type: ACTIONS.UPDATE_ISSUE, payload: { issueId: issue.id, milestoneId: e.target.value || null } }); setEditingMilestone(false) }}>
                  <option value="">None</option>
                  {milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
            )}
            <span style={{ fontSize: '13px', color: milestone ? 'var(--gl-text-primary)' : 'var(--gl-text-tertiary)' }}>{milestone?.title || 'None'}</span>
          </div>

          {/* Due Date */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Due date</div>
            <input type="date" className="gl-form-input" style={{ fontSize: '13px', width: '100%' }}
              value={issue.dueDate || ''}
              onChange={e => dispatch({ type: ACTIONS.UPDATE_ISSUE, payload: { issueId: issue.id, dueDate: e.target.value || null } })} />
          </div>

          {/* Weight */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Weight</div>
            <input type="number" className="gl-form-input" style={{ fontSize: '13px', width: '100%' }} min="0"
              value={issue.weight || ''} placeholder="None"
              onChange={e => dispatch({ type: ACTIONS.UPDATE_ISSUE, payload: { issueId: issue.id, weight: e.target.value ? parseInt(e.target.value) : null } })} />
          </div>

          {/* Delete */}
          <div style={{ borderTop: '1px solid var(--gl-border)', paddingTop: '16px', marginTop: '16px' }}>
            <button className="gl-btn gl-btn-danger gl-btn-sm" style={{ width: '100%' }} onClick={() => setShowDeleteDialog(true)}>Delete issue</button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete issue"
        message={`Delete issue #${issue.iid} "${issue.title}" and its comments?`}
        confirmText="Delete issue"
        onConfirm={confirmDeleteIssue}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  )
}
