import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GitMerge, GitPullRequest, X, Edit2 } from 'lucide-react'
import { useApp, ACTIONS } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/dataManager.js'
import { renderMarkdown } from '../utils/markdown.js'
import Breadcrumb from '../components/Breadcrumb.jsx'

export default function MergeRequestDetail() {
  const { group, project: projectPath, iid } = useParams()
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('overview')
  const [commentText, setCommentText] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentVal, setEditingCommentVal] = useState('')
  const [editingAssignees, setEditingAssignees] = useState(false)
  const [editingReviewers, setEditingReviewers] = useState(false)
  const [editingLabels, setEditingLabels] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState(false)

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>
  const mr = state.mergeRequests.find(m => m.projectId === project.id && m.iid === parseInt(iid))
  if (!mr) return <div className="gl-empty-state"><div className="gl-empty-state-title">MR not found</div></div>

  const labels = state.labels.filter(l => l.projectId === project.id)
  const milestones = state.milestones.filter(m => m.projectId === project.id)
  const mrLabels = labels.filter(l => mr.labelIds?.includes(l.id))
  const assignees = state.users.filter(u => mr.assigneeIds?.includes(u.id))
  const reviewers = state.users.filter(u => mr.reviewerIds?.includes(u.id))
  const pipeline = mr.pipelineId ? state.pipelines.find(p => p.id === mr.pipelineId) : null
  const comments = state.mrComments.filter(c => c.mergeRequestId === mr.id).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  const mrCommits = state.commits.filter(c => c.projectId === project.id && c.branch === mr.sourceBranch)
  const milestone = milestones.find(m => m.id === mr.milestoneId)

  const members = state.members.filter(m => m.projectId === project.id)
  const projectUsers = state.users.filter(u => members.some(m => m.userId === u.id))

  const toggleMRAssignee = (userId) => {
    const current = mr.assigneeIds || []
    const updated = current.includes(userId) ? current.filter(id => id !== userId) : [...current, userId]
    dispatch({ type: ACTIONS.UPDATE_MERGE_REQUEST, payload: { mrId: mr.id, assigneeIds: updated } })
  }
  const toggleMRReviewer = (userId) => {
    const current = mr.reviewerIds || []
    const updated = current.includes(userId) ? current.filter(id => id !== userId) : [...current, userId]
    dispatch({ type: ACTIONS.UPDATE_MERGE_REQUEST, payload: { mrId: mr.id, reviewerIds: updated } })
  }
  const toggleMRLabel = (labelId) => {
    const current = mr.labelIds || []
    const updated = current.includes(labelId) ? current.filter(id => id !== labelId) : [...current, labelId]
    dispatch({ type: ACTIONS.UPDATE_MERGE_REQUEST, payload: { mrId: mr.id, labelIds: updated } })
  }

  const handleMerge = () => dispatch({ type: ACTIONS.MERGE_MR, payload: { mrId: mr.id } })
  const handleClose = () => dispatch({ type: ACTIONS.CLOSE_MR, payload: { mrId: mr.id } })
  const handleReopen = () => dispatch({ type: ACTIONS.REOPEN_MR, payload: { mrId: mr.id } })
  const handleComment = () => {
    if (!commentText.trim()) return
    dispatch({ type: ACTIONS.ADD_MR_COMMENT, payload: { mergeRequestId: mr.id, authorId: state.currentUser.id, body: commentText } })
    setCommentText('')
  }

  const tabStyle = (t) => ({
    padding: '8px 16px', cursor: 'pointer', border: 'none', background: 'none',
    fontWeight: activeTab === t ? 600 : 400,
    borderBottom: activeTab === t ? '2px solid var(--gl-purple)' : '2px solid transparent',
    color: activeTab === t ? 'var(--gl-purple)' : 'var(--gl-text-secondary)', fontSize: '14px',
  })

  const pipelineColor = { success: 'var(--gl-success)', failed: 'var(--gl-danger)', running: 'var(--gl-info)', pending: 'var(--gl-warning)', canceled: 'var(--gl-text-secondary)' }

  return (
    <div>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name, to: `/${group}/${projectPath}` }, { label: 'Merge requests', to: `/${group}/${projectPath}/-/merge_requests` }, { label: `!${mr.iid}` }]} />

      <div style={{ marginBottom: '16px' }}>
        {editingTitle ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="gl-form-input" value={titleVal} onChange={e => setTitleVal(e.target.value)} style={{ flex: 1, fontSize: '18px' }} autoFocus />
            <button className="gl-btn gl-btn-primary gl-btn-sm" onClick={() => { dispatch({ type: ACTIONS.UPDATE_MERGE_REQUEST, payload: { mrId: mr.id, title: titleVal } }); setEditingTitle(false) }}>Save</button>
            <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => setEditingTitle(false)}>Cancel</button>
          </div>
        ) : (
          <h1 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 700 }} onDoubleClick={() => { setTitleVal(mr.title); setEditingTitle(true) }}>
            {mr.isDraft && <span style={{ color: 'var(--gl-text-secondary)', fontWeight: 400 }}>Draft: </span>}
            {mr.title}
          </h1>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {mr.state === 'opened' ? <span style={{ background: 'var(--gl-success)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GitPullRequest size={14} /> Open</span> :
           mr.state === 'merged' ? <span style={{ background: 'var(--gl-purple)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GitMerge size={14} /> Merged</span> :
           <span style={{ background: 'var(--gl-text-secondary)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><X size={14} /> Closed</span>}
          <span style={{ color: 'var(--gl-text-secondary)', fontSize: '14px' }}>
            !{mr.iid} · {mr.state === 'merged' ? 'Merged' : 'opened'} {timeAgo(mr.createdAt)} by <strong>{state.users.find(u => u.id === mr.authorId)?.name}</strong>
          </span>
          <span style={{ fontFamily: 'var(--gl-font-mono)', background: 'var(--gl-bg-tertiary)', padding: '3px 8px', borderRadius: '20px', fontSize: '12px' }}>
            {mr.sourceBranch} → {mr.targetBranch}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ borderBottom: '1px solid var(--gl-border)', marginBottom: '16px', display: 'flex', gap: '4px' }}>
            <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>Overview</button>
            <button style={tabStyle('commits')} onClick={() => setActiveTab('commits')}>Commits ({mrCommits.length})</button>
            <button style={tabStyle('changes')} onClick={() => setActiveTab('changes')}>Changes ({mr.changes?.length || 0})</button>
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Description */}
              <div className="gl-card" style={{ marginBottom: '16px' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--gl-border)' }}>
                  <span style={{ fontWeight: 600 }}>{state.users.find(u => u.id === mr.authorId)?.name}</span>
                </div>
                <div style={{ padding: '16px' }}>
                  {mr.description ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(mr.description) }} style={{ lineHeight: 1.6 }} />
                   : <span style={{ color: 'var(--gl-text-tertiary)' }}>No description provided.</span>}
                </div>
              </div>

              {/* Pipeline */}
              {pipeline && (
                <div className="gl-card" style={{ marginBottom: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px', color: pipelineColor[pipeline.status] || 'var(--gl-text-secondary)' }}>●</span>
                  <span style={{ fontWeight: 500 }}>Pipeline #{pipeline.iid} </span>
                  <span style={{ color: pipelineColor[pipeline.status], fontWeight: 600 }}>{pipeline.status}</span>
                  <span style={{ color: 'var(--gl-text-tertiary)', fontSize: '13px' }}>{pipeline.duration ? `in ${pipeline.duration}s` : ''}</span>
                </div>
              )}

              {/* Merge widget */}
              {mr.state === 'opened' && (
                <div className="gl-card" style={{ marginBottom: '16px', padding: '16px' }}>
                  {mr.isDraft ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: 'var(--gl-text-secondary)' }}>This is a draft merge request.</span>
                      <button className="gl-btn gl-btn-primary gl-btn-sm" onClick={() => dispatch({ type: ACTIONS.UPDATE_MERGE_REQUEST, payload: { mrId: mr.id, isDraft: false } })}>Mark as ready</button>
                    </div>
                  ) : mr.mergeStatus === 'cannot_be_merged' ? (
                    <div style={{ color: 'var(--gl-danger)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>⚠</span> Merge blocked: merge conflicts must be resolved first.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button className="gl-btn gl-btn-success" onClick={handleMerge}>Merge</button>
                      <span style={{ color: 'var(--gl-success)', fontWeight: 500 }}>✓ Ready to merge</span>
                    </div>
                  )}
                </div>
              )}
              {mr.state === 'merged' && (
                <div className="gl-card" style={{ marginBottom: '16px', padding: '12px 16px', background: '#f0e8ff' }}>
                  <span style={{ color: 'var(--gl-purple)', fontWeight: 500 }}>
                    <GitMerge size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Merged {timeAgo(mr.mergedAt)} by {state.users.find(u => u.id === mr.authorId)?.name}
                  </span>
                </div>
              )}

              {/* Comments */}
              {comments.map(c => {
                const author = state.users.find(u => u.id === c.authorId)
                return (
                  <div key={c.id} className="gl-card" style={{ marginBottom: '12px' }}>
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {author && <img src={author.avatarUrl || author.avatar} alt={author.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />}
                      <span style={{ fontWeight: 600 }}>{author?.name}</span>
                      <span style={{ color: 'var(--gl-text-tertiary)', fontSize: '12px', marginLeft: 'auto' }}>{timeAgo(c.createdAt)}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="gl-btn gl-btn-ghost gl-btn-sm" title="Edit comment"
                          onClick={() => { setEditingCommentId(c.id); setEditingCommentVal(c.body) }}>
                          <Edit2 size={12} />
                        </button>
                        <button className="gl-btn gl-btn-ghost gl-btn-sm" title="Delete comment"
                          style={{ color: 'var(--gl-danger)' }}
                          onClick={() => dispatch({ type: ACTIONS.DELETE_MR_COMMENT, payload: { commentId: c.id } })}>
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: '12px 16px' }}>
                      {editingCommentId === c.id ? (
                        <>
                          <textarea className="gl-form-textarea" value={editingCommentVal} onChange={e => setEditingCommentVal(e.target.value)}
                            style={{ width: '100%', minHeight: '80px', resize: 'vertical', marginBottom: '8px' }} autoFocus />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="gl-btn gl-btn-primary gl-btn-sm" onClick={() => {
                              dispatch({ type: ACTIONS.UPDATE_MR_COMMENT, payload: { commentId: c.id, body: editingCommentVal } })
                              setEditingCommentId(null); setEditingCommentVal('')
                            }}>Save</button>
                            <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => { setEditingCommentId(null); setEditingCommentVal('') }}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(c.body) }} style={{ lineHeight: 1.6 }} />
                      )}
                    </div>
                  </div>
                )
              })}

              {/* New comment */}
              <div className="gl-card">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={state.currentUser.avatarUrl || state.currentUser.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <span style={{ fontWeight: 600 }}>Add a comment</span>
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <textarea className="gl-form-textarea" placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} style={{ width: '100%', minHeight: '80px', resize: 'vertical', marginBottom: '8px' }} />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                    <div>
                      {mr.state === 'opened' && <button className="gl-btn gl-btn-danger gl-btn-sm" onClick={handleClose}>Close MR</button>}
                      {mr.state === 'closed' && <button className="gl-btn gl-btn-success gl-btn-sm" onClick={handleReopen}>Reopen MR</button>}
                    </div>
                    <button className="gl-btn gl-btn-success gl-btn-sm" onClick={handleComment} disabled={!commentText.trim()}>Comment</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'commits' && (
            <div className="gl-card">
              {mrCommits.length === 0 ? <div style={{ padding: '24px', textAlign: 'center', color: 'var(--gl-text-tertiary)' }}>No commits found on branch {mr.sourceBranch}</div> :
               mrCommits.map(c => {
                const author = state.users.find(u => u.id === c.authorId)
                return (
                  <div key={c.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {author && <img src={author.avatarUrl || author.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{c.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gl-text-tertiary)' }}>{c.authorName} · {timeAgo(c.createdAt)}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--gl-font-mono)', fontSize: '12px', color: 'var(--gl-purple)', background: 'var(--gl-bg-tertiary)', padding: '2px 8px', borderRadius: '4px' }}>{c.shortId}</span>
                  </div>
                )
               })
              }
            </div>
          )}

          {activeTab === 'changes' && (
            <div>
              {(!mr.changes || mr.changes.length === 0) ? (
                <div className="gl-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--gl-text-tertiary)' }}>
                  No file changes recorded for this merge request.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'var(--gl-bg-secondary)', border: '1px solid var(--gl-border)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--gl-success)', fontWeight: 600 }}>+{mr.changes.reduce((s, c) => s + (c.additions || 0), 0)}</span>
                    <span style={{ color: 'var(--gl-danger)', fontWeight: 600 }}>-{mr.changes.reduce((s, c) => s + (c.deletions || 0), 0)}</span>
                    <span style={{ color: 'var(--gl-text-secondary)' }}>{mr.changes.length} {mr.changes.length === 1 ? 'file' : 'files'} changed</span>
                  </div>
                  {mr.changes.map((change, ci) => (
                    <div key={ci} className="gl-card" style={{ marginBottom: '12px' }}>
                      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gl-bg-secondary)' }}>
                        <span style={{ fontFamily: 'var(--gl-font-mono)', fontSize: '13px', fontWeight: 500 }}>{change.file}</span>
                        <span style={{ fontSize: '12px', color: 'var(--gl-text-secondary)' }}>
                          <span style={{ color: 'var(--gl-success)' }}>+{change.additions}</span>{' '}
                          <span style={{ color: 'var(--gl-danger)' }}>-{change.deletions}</span>
                        </span>
                      </div>
                      {change.diff && (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--gl-font-mono)', fontSize: '13px' }}>
                            <tbody>
                              {change.diff.split('\n').map((line, li) => {
                                const isAdd = line.startsWith('+')
                                const isDel = line.startsWith('-')
                                const bgColor = isAdd ? '#DCFCE7' : isDel ? '#FEE2E2' : 'transparent'
                                const textColor = isAdd ? '#166534' : isDel ? '#7F1D1D' : 'var(--gl-text-primary)'
                                return (
                                  <tr key={li}>
                                    <td style={{ padding: '0 8px', color: 'var(--gl-text-tertiary)', userSelect: 'none', textAlign: 'right', minWidth: '40px', background: isAdd ? '#bbf7d0' : isDel ? '#fecaca' : 'var(--gl-bg-secondary)', borderRight: '1px solid var(--gl-border)', fontSize: '12px' }}>
                                      {!isDel ? li + 1 : ''}
                                    </td>
                                    <td style={{ padding: '0 8px', color: 'var(--gl-text-tertiary)', userSelect: 'none', textAlign: 'right', minWidth: '40px', background: isAdd ? '#bbf7d0' : isDel ? '#fecaca' : 'var(--gl-bg-secondary)', borderRight: '1px solid var(--gl-border)', fontSize: '12px' }}>
                                      {!isAdd ? li + 1 : ''}
                                    </td>
                                    <td style={{ padding: '0 16px', whiteSpace: 'pre', background: bgColor, color: textColor, lineHeight: '22px' }}>
                                      {line}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
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
                    <input type="checkbox" checked={mr.assigneeIds?.includes(u.id)} onChange={() => toggleMRAssignee(u.id)} />
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

          {/* Reviewers */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>Reviewers</span>
              <button className="gl-btn gl-btn-ghost gl-btn-sm" style={{ fontSize: '12px', color: 'var(--gl-purple)' }} onClick={() => setEditingReviewers(o => !o)}>Edit</button>
            </div>
            {editingReviewers && (
              <div style={{ border: '1px solid var(--gl-border)', borderRadius: '4px', padding: '8px', marginBottom: '8px', background: '#fff', position: 'relative', zIndex: 10 }}>
                {projectUsers.map(u => (
                  <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={mr.reviewerIds?.includes(u.id)} onChange={() => toggleMRReviewer(u.id)} />
                    <img src={u.avatarUrl || u.avatar} alt={u.name} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px' }}>{u.name}</span>
                  </label>
                ))}
                <button className="gl-btn gl-btn-ghost gl-btn-sm" style={{ marginTop: '8px', width: '100%' }} onClick={() => setEditingReviewers(false)}>Done</button>
              </div>
            )}
            {reviewers.length > 0 ? reviewers.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <img src={r.avatarUrl || r.avatar} alt={r.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                <span style={{ fontSize: '13px' }}>{r.name}</span>
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
                    <input type="checkbox" checked={mr.labelIds?.includes(l.id)} onChange={() => toggleMRLabel(l.id)} />
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', background: l.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '13px' }}>{l.name}</span>
                  </label>
                ))}
                <button className="gl-btn gl-btn-ghost gl-btn-sm" style={{ marginTop: '8px', width: '100%' }} onClick={() => setEditingLabels(false)}>Done</button>
              </div>
            )}
            {mrLabels.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {mrLabels.map(l => <span key={l.id} style={{ background: l.color, color: l.textColor || '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>{l.name}</span>)}
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
                  value={mr.milestoneId || ''} onChange={e => { dispatch({ type: ACTIONS.UPDATE_MERGE_REQUEST, payload: { mrId: mr.id, milestoneId: e.target.value || null } }); setEditingMilestone(false) }}>
                  <option value="">None</option>
                  {milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
            )}
            <span style={{ fontSize: '13px', color: milestone ? 'var(--gl-text-primary)' : 'var(--gl-text-tertiary)' }}>{milestone?.title || 'None'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
