import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { GitBranch, Trash2, Plus, Shield } from 'lucide-react'
import { useApp, ACTIONS } from '../context/AppContext.jsx'
import { timeAgo } from '../utils/dataManager.js'
import Breadcrumb from '../components/Breadcrumb.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function Branches() {
  const { group, project: projectPath } = useParams()
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [sourceBranch, setSourceBranch] = useState('main')
  const [pendingDelete, setPendingDelete] = useState(null)

  const project = state.projects.find(p => p.fullPath === `${group}/${projectPath}`)
  if (!project) return <div className="gl-empty-state"><div className="gl-empty-state-title">Project not found</div></div>

  const branches = state.branches.filter(b => b.projectId === project.id)
  const now = new Date('2026-04-10')
  const defaultBranch = branches.find(b => b.isDefault)
  const nonDefault = branches.filter(b => !b.isDefault)
  const activeThreshold = 30 * 24 * 60 * 60 * 1000
  const getCommit = (id) => state.commits.find(c => c.id === id || c.shortId === id)

  const handleCreate = () => {
    if (!newBranchName.trim()) return
    dispatch({ type: ACTIONS.CREATE_BRANCH, payload: { projectId: project.id, name: newBranchName.trim(), isDefault: false, isProtected: false, lastCommitId: defaultBranch?.lastCommitId } })
    setShowNew(false)
    setNewBranchName('')
  }

  const handleDelete = (branchId) => {
    const branch = branches.find(b => b.id === branchId)
    setPendingDelete(branch || { id: branchId, name: 'this branch' })
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    dispatch({ type: ACTIONS.DELETE_BRANCH, payload: { branchId: pendingDelete.id } })
    setPendingDelete(null)
  }

  const tabStyle = (t) => ({
    padding: '8px 16px', cursor: 'pointer', border: 'none', background: 'none',
    fontWeight: tab === t ? 600 : 400,
    borderBottom: tab === t ? '2px solid var(--gl-purple)' : '2px solid transparent',
    color: tab === t ? 'var(--gl-purple)' : 'var(--gl-text-secondary)', fontSize: '14px',
  })

  const BranchRow = ({ branch }) => {
    const commit = getCommit(branch.lastCommitId)
    return (
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gl-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <GitBranch size={16} color="var(--gl-text-secondary)" />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Link to={`/${group}/${projectPath}/-/tree/${branch.name}`}
              style={{ fontFamily: 'var(--gl-font-mono)', fontWeight: 600, color: 'var(--gl-purple)', textDecoration: 'none' }}>
              {branch.name}
            </Link>
            {branch.isDefault && <span style={{ fontSize: '11px', background: 'var(--gl-info-bg)', color: 'var(--gl-info)', padding: '1px 8px', borderRadius: '10px' }}>default</span>}
            {branch.isProtected && <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', background: 'var(--gl-warning-bg)', color: 'var(--gl-warning)', padding: '1px 8px', borderRadius: '10px' }}><Shield size={10} /> protected</span>}
          </div>
          {commit && <div style={{ fontSize: '12px', color: 'var(--gl-text-secondary)' }}>{commit.title?.slice(0, 60)} · {timeAgo(commit.createdAt)}</div>}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/${group}/${projectPath}/-/commits/${branch.name}`} className="gl-btn gl-btn-secondary gl-btn-sm">History</Link>
          {!branch.isDefault && !branch.isProtected && (
            <button className="gl-btn gl-btn-danger gl-btn-sm" onClick={() => handleDelete(branch.id)} aria-label={`Delete ${branch.name}`}><Trash2 size={14} /></button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumb items={[{ label: group, to: '/' }, { label: project.name, to: `/${group}/${projectPath}` }, { label: 'Branches' }]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Branches</h1>
        <button className="gl-btn gl-btn-primary" onClick={() => setShowNew(true)}><Plus size={14} style={{ marginRight: '4px' }} />New branch</button>
      </div>

      {showNew && (
        <div className="gl-card" style={{ marginBottom: '20px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div className="gl-form-group" style={{ flex: 2, margin: 0 }}>
            <label className="gl-form-label">Branch name</label>
            <input className="gl-form-input" value={newBranchName} onChange={e => setNewBranchName(e.target.value)} placeholder="feature/my-feature" autoFocus />
          </div>
          <div className="gl-form-group" style={{ flex: 1, margin: 0 }}>
            <label className="gl-form-label">Source</label>
            <select className="gl-form-input" value={sourceBranch} onChange={e => setSourceBranch(e.target.value)}>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <button className="gl-btn gl-btn-primary gl-btn-sm" onClick={handleCreate}>Create</button>
          <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => setShowNew(false)}>Cancel</button>
        </div>
      )}

      <div style={{ borderBottom: '1px solid var(--gl-border)', display: 'flex', marginBottom: '0' }}>
        {['active', 'stale', 'all'].map(t => <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
      </div>

      <div className="gl-card" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        {defaultBranch && <BranchRow branch={defaultBranch} />}
        {nonDefault.filter(b => {
          const commit = getCommit(b.lastCommitId)
          const age = commit ? now - new Date(commit.createdAt) : Infinity
          if (tab === 'active') return age < activeThreshold
          if (tab === 'stale') return age >= activeThreshold
          return true
        }).map(b => <BranchRow key={b.id} branch={b} />)}
      </div>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete branch"
        message={`Delete branch "${pendingDelete?.name}" from this local project?`}
        confirmText="Delete branch"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  )
}
