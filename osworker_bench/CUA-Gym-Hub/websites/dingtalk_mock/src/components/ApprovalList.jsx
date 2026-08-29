import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import CreateApprovalModal from './CreateApprovalModal'

const STATUS_MAP = {
  pending: { label: '审批中', color: '#FA8C16' },
  approved: { label: '已通过', color: '#52C41A' },
  rejected: { label: '已拒绝', color: '#FF4D4F' },
}

const TYPE_ICONS = {
  leave: '🌿', expense: '💰', business_trip: '✈️', overtime: '⏰', purchase: '🛒', general: '📋'
}

function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getMonth()+1}月${d.getDate()}日`
}

export default function ApprovalList() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const getPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [showCreate, setShowCreate] = useState(false)

  const tab = state.approvalActiveTab || 'submitted'

  const getList = () => {
    if (tab === 'submitted') return state.approvalForms.filter(f => f.submitterId === state.currentUser.id)
    if (tab === 'pending') return state.approvalForms.filter(f => f.currentApproverId === state.currentUser.id)
    return state.approvalForms.filter(f => f.approverIds.includes(state.currentUser.id))
  }

  const getUser = (id) => state.users.find(u => u.id === id)

  const pendingCount = state.approvalForms.filter(f => f.currentApproverId === state.currentUser.id).length

  return (
    <div style={{ padding: '20px', maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>审批</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ 发起审批</button>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        {[
          { key: 'submitted', label: '我发起的' },
          { key: 'pending', label: '我审批的', badge: pendingCount },
          { key: 'cc', label: '我收到的' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => dispatch({ type: 'SET_APPROVAL_TAB', tab: t.key })}
            style={{
              padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 14, fontFamily: 'var(--font-family)',
              color: tab === t.key ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: tab === t.key ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            {t.label}
            {t.badge > 0 && <span className="badge">{t.badge}</span>}
          </button>
        ))}
      </div>
      {getList().map(form => {
        const submitter = getUser(form.submitterId)
        const status = STATUS_MAP[form.status]
        return (
          <div
            key={form.id}
            onClick={() => navigate(getPath(`/workbench/approval/${form.id}`))}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              background: 'white', border: '1px solid var(--border)', borderRadius: 8,
              marginBottom: 10, cursor: 'pointer', transition: 'box-shadow 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {TYPE_ICONS[form.type] || '📋'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{form.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {submitter?.name} · {formatDate(form.createdAt)}
              </div>
            </div>
            <span style={{
              padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500,
              color: status.color, background: status.color + '18'
            }}>
              {status.label}
            </span>
          </div>
        )
      })}
      {getList().length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
          暂无审批记录
        </div>
      )}
      {showCreate && <CreateApprovalModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
