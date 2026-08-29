import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const TYPE_LABELS = { leave: '请假', expense: '报销', business_trip: '出差', overtime: '加班', purchase: '采购', general: '通用' }
const STATUS_STYLES = {
  pending: { color: '#FA8C16', bg: '#FFF7E6', label: '审批中' },
  approved: { color: '#52C41A', bg: '#F6FFED', label: '已通过' },
  rejected: { color: '#FF4D4F', bg: '#FFF1F0', label: '已拒绝' },
}

export default function ApprovalDetail({ id }) {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const [comment, setComment] = useState('')
  const getPath = (p) => sid ? `${p}?sid=${sid}` : p

  const form = state.approvalForms.find(f => f.id === id)
  if (!form) return <div style={{ padding: 32, color: 'var(--text-secondary)' }}>未找到审批单</div>

  const getUser = (uid) => state.users.find(u => u.id === uid)
  const submitter = getUser(form.submitterId)
  const status = STATUS_STYLES[form.status]
  const isCurrentApprover = form.currentApproverId === state.currentUser.id

  const handleApprove = () => {
    dispatch({ type: 'APPROVE_FORM', id: form.id, comment })
    setComment('')
  }

  const handleReject = () => {
    dispatch({ type: 'REJECT_FORM', id: form.id, comment })
    setComment('')
  }

  const renderFields = () => {
    const f = form.fields
    if (form.type === 'leave') return (
      <>
        <Field label="假期类型" value={f.leaveType} />
        <Field label="开始日期" value={f.startDate} />
        <Field label="结束日期" value={f.endDate} />
        <Field label="请假时长" value={f.duration} />
        <Field label="请假原因" value={f.reason} />
      </>
    )
    if (form.type === 'expense') return (
      <>
        <Field label="费用类别" value={f.category} />
        <Field label="费用总计" value={`¥${f.amount}`} />
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>费用明细</div>
          {(f.items || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
              <span>{item.desc}</span><span>¥{item.amount}</span>
            </div>
          ))}
        </div>
      </>
    )
    if (form.type === 'business_trip') return (
      <>
        <Field label="出差地点" value={f.destination} />
        <Field label="出发日期" value={f.startDate} />
        <Field label="返回日期" value={f.endDate} />
        <Field label="出行方式" value={f.transportation} />
        <Field label="出差目的" value={f.purpose} />
      </>
    )
    return Object.entries(f).map(([k, v]) => <Field key={k} label={k} value={String(v)} />)
  }

  return (
    <div style={{ padding: '20px', maxWidth: 640 }}>
      <button onClick={() => navigate(getPath('/workbench/approval'))} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, cursor: 'pointer', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-family)' }}>
        ← 返回列表
      </button>
      <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--border)', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{form.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {TYPE_LABELS[form.type]} · 提交人：{submitter?.name} · {new Date(form.createdAt).toLocaleDateString('zh-CN')}
            </div>
          </div>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, color: status.color, background: status.bg }}>
            {status.label}
          </span>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 }}>
          {renderFields()}
        </div>

        {/* Approval flow */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>审批流程</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <ApproverStep user={submitter} label="提交" status="done" isFirst />
            {form.approverIds.map((uid, i) => {
              const u = getUser(uid)
              const isDone = form.comments.some(c => c.userId === uid && c.action === 'approved')
              const isRejected = form.comments.some(c => c.userId === uid && c.action === 'rejected')
              const isCurrent = form.currentApproverId === uid
              return <ApproverStep key={uid} user={u} label={isDone ? '已通过' : isRejected ? '已拒绝' : isCurrent ? '审批中' : '待审批'} status={isDone ? 'done' : isRejected ? 'rejected' : isCurrent ? 'current' : 'waiting'} />
            })}
          </div>
        </div>

        {/* Comments */}
        {form.comments.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>审批意见</div>
            {form.comments.map((c, i) => {
              const u = getUser(c.userId)
              return <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div className="avatar-circle avatar-sm" style={{ background: u?.avatar || '#ccc', flexShrink: 0 }}>{u?.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u?.name} · {new Date(c.timestamp).toLocaleDateString('zh-CN')}</div>
                  <div style={{ fontSize: 13, marginTop: 2 }}>{c.text}</div>
                </div>
              </div>
            })}
          </div>
        )}

        {/* Action buttons for current approver */}
        {isCurrentApprover && form.status === 'pending' && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>审批意见</div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="填写审批意见（可选）"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 13, minHeight: 72, resize: 'none', marginBottom: 12, fontFamily: 'var(--font-family)' }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={handleApprove} style={{ background: '#52C41A', borderColor: '#52C41A' }}>✓ 同意</button>
              <button className="btn btn-default" onClick={handleReject} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>✗ 拒绝</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div style={{ display: 'flex', marginBottom: 10 }}>
      <span style={{ width: 80, fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

function ApproverStep({ user, label, status, isFirst }) {
  const colors = { done: '#52C41A', rejected: '#FF4D4F', current: '#FA8C16', waiting: '#C4C9D4' }
  const col = colors[status] || '#C4C9D4'
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {!isFirst && <div style={{ width: 32, height: 2, background: col }} />}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div className="avatar-circle avatar-sm" style={{ background: user?.avatar || '#ccc', border: `2px solid ${col}` }}>{user?.name.charAt(0) || '?'}</div>
        <div style={{ fontSize: 10, color: col, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{user?.name}</div>
      </div>
    </div>
  )
}
