import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useToast } from '../components/Toast'

const REASON_LABELS = {
  size_issue: '尺码问题',
  quality_issue: '质量问题',
  wrong_item: '发错商品',
  not_as_described: '与描述不符',
  no_longer_needed: '不想要了',
}

const colors = ['#FF5000', '#1890FF', '#52C41A', '#FAAD14', '#722ED1']
function getProductColor(id) { return colors[parseInt((id || '').replace(/\D/g, '')) % colors.length] }

function ApproveModal({ refund, onClose, onConfirm }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">同意退款</span>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 18 }}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, marginBottom: 16 }}>确认同意退款 <strong style={{ color: 'var(--color-primary)' }}>¥{refund.amount.toFixed(2)}</strong> 给买家 <strong>{refund.buyerName}</strong>？</p>
          <p style={{ fontSize: 13, color: '#666' }}>退款原因：{REASON_LABELS[refund.reason] || refund.reason}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-success" onClick={onConfirm}>确认同意</button>
        </div>
      </div>
    </div>
  )
}

function RejectModal({ refund, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">拒绝退款</span>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 18 }}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label required">拒绝原因</label>
            <textarea
              className="form-input"
              style={{ width: '100%', minHeight: 100, resize: 'vertical' }}
              placeholder="请详细说明拒绝原因..."
              value={reason}
              onChange={e => { setReason(e.target.value); setError('') }}
            />
            {error && <div className="form-error">{error}</div>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-danger" onClick={() => {
            if (!reason.trim()) { setError('请填写拒绝原因'); return }
            onConfirm(reason.trim())
          }}>确认拒绝</button>
        </div>
      </div>
    </div>
  )
}

function Deadline({ deadline }) {
  if (!deadline) return null
  const diff = (new Date(deadline) - new Date()) / 1000
  if (diff <= 0) return <span style={{ color: 'var(--color-danger)', fontSize: 12, fontWeight: 600 }}>已超时</span>
  const hours = Math.floor(diff / 3600)
  const days = Math.floor(hours / 24)
  const remainHours = hours % 24
  const color = hours < 12 ? 'var(--color-danger)' : hours < 24 ? 'var(--color-warning)' : '#FA8C16'
  return (
    <span style={{ color, fontSize: 12 }}>
      剩余处理时间: {days > 0 ? `${days}天` : ''}{remainHours}小时
    </span>
  )
}

const TABS = [
  { key: 'pending', label: '待处理' },
  { key: 'approved', label: '处理中' },
  { key: 'completed', label: '已完成' },
  { key: 'rejected', label: '已拒绝' },
]

const STATUS_MAP = {
  pending: { label: '待处理', class: 'badge-warning' },
  approved: { label: '已同意', class: 'badge-info' },
  completed: { label: '已完成', class: 'badge-success' },
  rejected: { label: '已拒绝', class: 'badge-default' },
}

export default function RefundList() {
  const { state, dispatch } = useAppContext()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pending')
  const [approveRefund, setApproveRefund] = useState(null)
  const [rejectRefund, setRejectRefund] = useState(null)

  const filtered = useMemo(() => {
    return state.refunds.filter(r => r.status === activeTab)
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
  }, [state.refunds, activeTab])

  const counts = useMemo(() => {
    const c = {}
    state.refunds.forEach(r => { c[r.status] = (c[r.status] || 0) + 1 })
    return c
  }, [state.refunds])

  function handleApprove(refund) {
    dispatch({ type: 'APPROVE_REFUND', payload: { refundId: refund.id, response: '亲，已同意退款，请注意查收～' } })
    addToast('已同意退款', 'success')
    setApproveRefund(null)
  }

  function handleReject(refund, reason) {
    dispatch({ type: 'REJECT_REFUND', payload: { refundId: refund.id, reason } })
    addToast('已拒绝退款申请', 'info')
    setRejectRefund(null)
  }

  function formatDate(iso) {
    if (!iso) return '-'
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">退款管理</h1>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="tabs">
          {TABS.map(tab => (
            <div
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {counts[tab.key] > 0 && <span style={{ fontSize: 12 }}>({counts[tab.key]})</span>}
              {tab.key === 'pending' && counts.pending > 0 && (
                <span className="count-badge" style={{ marginLeft: 2 }}>{counts.pending}</span>
              )}
            </div>
          ))}
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>退款编号</th>
                <th>商品</th>
                <th>买家</th>
                <th>退款金额</th>
                <th>退款原因</th>
                <th>申请时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无退款记录</td>
                </tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <span style={{ color: 'var(--color-link)', cursor: 'pointer', fontSize: 12 }} onClick={() => navigate(`/refunds/${r.id}`)}>
                      {r.refundNo}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 4, flexShrink: 0,
                        background: getProductColor(r.productId),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 14, fontWeight: 700
                      }}>{r.productTitle.charAt(0)}</div>
                      <div>
                        <div style={{ fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.productTitle}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{r.productSku}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{r.buyerName}</td>
                  <td><span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>¥{r.amount.toFixed(2)}</span></td>
                  <td style={{ fontSize: 12, color: '#666' }}>{REASON_LABELS[r.reason] || r.reason}</td>
                  <td style={{ fontSize: 12, color: '#999' }}>
                    {formatDate(r.appliedAt)}
                    {r.status === 'pending' && r.deadline && (
                      <div><Deadline deadline={r.deadline} /></div>
                    )}
                  </td>
                  <td><span className={`badge ${STATUS_MAP[r.status]?.class || 'badge-default'}`}>{STATUS_MAP[r.status]?.label || r.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-link" style={{ fontSize: 12 }} onClick={() => navigate(`/refunds/${r.id}`)}>查看</button>
                      {r.status === 'pending' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => setApproveRefund(r)}>同意</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setRejectRefund(r)}>拒绝</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {approveRefund && (
        <ApproveModal
          refund={approveRefund}
          onClose={() => setApproveRefund(null)}
          onConfirm={() => handleApprove(approveRefund)}
        />
      )}
      {rejectRefund && (
        <RejectModal
          refund={rejectRefund}
          onClose={() => setRejectRefund(null)}
          onConfirm={(reason) => handleReject(rejectRefund, reason)}
        />
      )}
    </div>
  )
}
