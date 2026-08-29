import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useApp, ACTIONS } from '../context/AppContext.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'

export default function IssueBoard() {
  const { group, project: projectPath } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const dragIssueRef = useRef(null)
  const [dragOver, setDragOver] = useState(null)

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const board = (state.boards || []).find(b => b.projectId === project.id)
  const lists = board?.lists || []
  const labels = state.labels.filter(l => l.projectId === project.id)
  const issues = state.issues.filter(i => i.projectId === project.id)

  const getIssuesForList = (list) => {
    if (list.type === 'backlog') return issues.filter(i => i.state === 'opened' && !(i.labelIds || []).some(lid => lists.filter(l => l.type === 'label').map(l => l.labelId).includes(lid)))
    if (list.type === 'closed') return issues.filter(i => i.state === 'closed')
    if (list.type === 'label') return issues.filter(i => i.state === 'opened' && (i.labelIds || []).includes(list.labelId))
    return []
  }

  const handleDragStart = (issueId) => { dragIssueRef.current = issueId }
  const handleDrop = (list) => {
    const issueId = dragIssueRef.current
    if (!issueId) return
    const issue = issues.find(i => i.id === issueId)
    if (!issue) return

    // Determine fromListId based on current issue state
    const fromList = lists.find(l => {
      if (l.type === 'closed') return issue.state === 'closed'
      if (l.type === 'backlog') return issue.state === 'opened' && !(issue.labelIds || []).some(lid => lists.filter(ll => ll.type === 'label').map(ll => ll.labelId).includes(lid))
      if (l.type === 'label') return issue.state === 'opened' && (issue.labelIds || []).includes(l.labelId)
      return false
    })
    const fromListId = fromList?.id || null

    if (list.type === 'closed') {
      dispatch({ type: ACTIONS.CLOSE_ISSUE, payload: { issueId } })
    } else if (list.type === 'backlog') {
      const labelListIds = lists.filter(l => l.type === 'label').map(l => l.labelId)
      const newLabelIds = (issue.labelIds || []).filter(lid => !labelListIds.includes(lid))
      dispatch({ type: ACTIONS.UPDATE_ISSUE, payload: { issueId, labelIds: newLabelIds } })
      if (issue.state === 'closed') dispatch({ type: ACTIONS.REOPEN_ISSUE, payload: { issueId } })
    } else if (list.type === 'label') {
      const newLabelIds = [...new Set([...(issue.labelIds || []), list.labelId])]
      dispatch({ type: ACTIONS.UPDATE_ISSUE, payload: { issueId, labelIds: newLabelIds } })
      if (issue.state === 'closed') dispatch({ type: ACTIONS.REOPEN_ISSUE, payload: { issueId } })
    }

    // Always dispatch MOVE_BOARD_ISSUE so board state tracks correctly
    if (fromListId !== list.id) {
      dispatch({ type: ACTIONS.MOVE_BOARD_ISSUE, payload: { issueId, fromListId, toListId: list.id } })
    }

    dragIssueRef.current = null
    setDragOver(null)
  }

  const assignees = (ids) => state.users.filter(u => (ids || []).includes(u.id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name, to: `/${group}/${projectPath}` }, { label: 'Issue board' }]} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{board?.name || 'Development Board'}</h1>
      </div>

      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px' }}>
        {lists.map(list => {
          const listIssues = getIssuesForList(list)
          const listLabel = list.labelId ? labels.find(l => l.id === list.labelId) : null
          return (
            <div key={list.id}
              style={{ width: '280px', flexShrink: 0, background: 'var(--gl-bg-tertiary)', borderRadius: '8px', display: 'flex', flexDirection: 'column', minHeight: '200px', border: dragOver === list.id ? '2px solid var(--gl-purple)' : '2px solid transparent' }}
              onDragOver={e => { e.preventDefault(); setDragOver(list.id) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(list)}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', borderRadius: '8px 8px 0 0' }}>
                {listLabel && <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: listLabel.color, flexShrink: 0 }} />}
                <span style={{ fontWeight: 600, fontSize: '14px', flex: 1 }}>{list.name}</span>
                <span style={{ color: 'var(--gl-text-tertiary)', fontSize: '13px', background: 'var(--gl-bg-tertiary)', padding: '1px 8px', borderRadius: '10px' }}>{listIssues.length}</span>
                <button className="gl-btn gl-btn-ghost gl-btn-sm" onClick={() => navigate(`/${group}/${projectPath}/-/issues/new`)}>
                  <Plus size={14} />
                </button>
              </div>
              <div style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
                {listIssues.map(issue => {
                  const issueLabelObjs = labels.filter(l => (issue.labelIds || []).includes(l.id))
                  const issueAssignees = assignees(issue.assigneeIds)
                  return (
                    <div key={issue.id}
                      draggable
                      onDragStart={() => handleDragStart(issue.id)}
                      style={{ background: '#fff', border: '1px solid var(--gl-border)', borderRadius: '4px', padding: '10px 12px', marginBottom: '8px', cursor: 'grab', boxShadow: 'var(--gl-shadow-sm)' }}>
                      <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '6px', lineHeight: '1.4', cursor: 'pointer', color: 'var(--gl-text-primary)' }}
                        onClick={() => navigate(`/${group}/${projectPath}/-/issues/${issue.iid}`)}>
                        {issue.title}
                      </div>
                      {issueLabelObjs.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '6px' }}>
                          {issueLabelObjs.map(l => <span key={l.id} style={{ fontSize: '10px', background: l.color, color: l.textColor || '#fff', padding: '1px 6px', borderRadius: '8px' }}>{l.name}</span>)}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: 'var(--gl-text-tertiary)' }}>#{issue.iid}</span>
                        <div style={{ display: 'flex' }}>
                          {issueAssignees.map(a => <img key={a.id} src={a.avatarUrl || a.avatar} alt={a.name} title={a.name} style={{ width: '20px', height: '20px', borderRadius: '50%', marginLeft: '-4px', border: '2px solid #fff' }} />)}
                        </div>
                      </div>
                      {issue.dueDate && <div style={{ fontSize: '11px', color: 'var(--gl-text-tertiary)', marginTop: '4px' }}>Due {issue.dueDate}</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {lists.length === 0 && (
          <div className="gl-empty-state"><div className="gl-empty-state-title">No board configured for this project</div></div>
        )}
      </div>
    </div>
  )
}
