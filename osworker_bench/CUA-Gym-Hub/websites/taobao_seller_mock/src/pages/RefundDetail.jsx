import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useToast } from '../components/Toast'

const REASON_LABELS = {
  size_issue: '尺码问题',
  quality_issue: '质量问题',
  wrong_item: '发错商品',
  not_as_described: '与描述不符',
  no_longer_needed: '不想要了',
}

const STATUS_MAP = {
  pending: { label: '待处理', bg: '#FFF7E6', color: '#FA8C16' },
  approved: { label: '处理中', bg: '#E6F7FF', color: '#1890FF' },
  completed: { label: '已完成', bg: '#F6FFED', color: '#52C41A' },
  rejected: { label: '已拒绝', bg: '#F5F5F5', color: '#999' },
}

const colors = ['#FF5000', '#1890FF', '#52C41A', '#FAAD14', '#722ED1']
function getProductColor(id) { return colors[parseInt((id || '').replace(/\D/g, '')) % colors.length] }

export default function RefundDetail() {
  const { id } = useParams()
  const { state, dispatch } = useAppContext()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  const refund = state.refunds.find(r => r.id === id)
  if (!refund) return <div className="empty-state"><p>退款记录不存在</p></div>

  const order = state.orders.find(o => o.id === refund.orderId)
  const statusInfo = STATUS_MAP[refund.status] || { label: refund.status, bg: '#F5F5F5', color: '#999' }

  function formatDate(iso) {
    if (!iso) return '-'
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  function handleApprove() {
    dispatch({ type: 'APPROVE_REFUND', payload: { refundId: id, response: '亲，已同意退款，请注意查收～' } })
    addToast('已同意退款', 'success')
  }

  function handleReject() {
    if (!rejectReason.trim()) { addToast('请填写拒绝原因', 'error'); return }
    dispatch({ type: 'REJECT_REFUND', payload: { refundId: id, reason: rejectReason.trim() } })
    addToast('已拒绝退款申请', 'info')
    setShowReject(false)
  }

  const timeline = [
    { label: '申请退款', time: refund.appliedAt, done: true },
    { label: '卖家处理', time: refund.processedAt, done: !!refund.processedAt },
    { label: '退款完成', time: refund.status === 'completed' ? refund.processedAt : null, done: refund.status === 'completed' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, fontSize: 13, color: '#999' }}>
        <span style={{ cursor: 'pointer', color: 'var(--color-link)' }} onClick={() => navigate('/refunds')}>退款管理</span>
        {' > '}退款详情
      </div>

      {/* Status banner */}
      <div style={{
        background: statusInfo.bg, border: `1px solid ${statusInfo.color}30`,
        borderRadius: 8, padding: '16px 20px', marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <span style={{ fontSize: 18, fontWeight: 700, color: statusInfo.color }}>{statusInfo.label}</span>
          <span style={{ fontSize: 13, color: '#999', marginLeft: 16 }}>{refund.refundNo}</span>
        </div>
        {refund.status === 'pending' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-success" onClick={handleApprove}>同意退款</button>
            <button className="btn btn-danger" onClick={() => setShowReject(true)}>拒绝退款</button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Refund info */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>退款信息</div>
          {[
            ['退款金额', `¥${refund.amount.toFixed(2)}`],
            ['退款类型', refund.type === 'refund_only' ? '仅退款' : '退货退款'],
            ['退款原因', REASON_LABELS[refund.reason] || refund.reason],
            ['申请时间', formatDate(refund.appliedAt)],
            ['处理时间', formatDate(refund.processedAt)],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', marginBottom: 10 }}>
              <span style={{ width: 80, fontSize: 13, color: '#999', flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: 13, color: '#333' }}>{v}</span>
            </div>
          ))}
          {refund.reasonText && (
            <div style={{ marginTop: 8, padding: 12, background: '#FAFAFA', borderRadius: 6, fontSize: 13, color: '#666' }}>
              买家说明：{refund.reasonText}
            </div>
          )}
          {refund.sellerResponse && (
            <div style={{ marginTop: 8, padding: 12, background: '#F6FFED', borderRadius: 6, fontSize: 13, color: '#52C41A' }}>
              卖家回复：{refund.sellerResponse}
            </div>
          )}
        </div>

        {/* Original order */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>原始订单</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 4, flexShrink: 0,
              background: getProductColor(refund.productId),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 18, fontWeight: 700
            }}>
              {refund.productTitle.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 13 }}>{refund.productTitle}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{refund.productSku}</div>
            </div>
          </div>
          {[
            ['订单编号', refund.orderNo],
            ['买家', refund.buyerName],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', marginBottom: 8 }}>
              <span style={{ width: 80, fontSize: 13, color: '#999', flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: 13 }}>{v}</span>
            </div>
          ))}
          {order && (
            <button className="btn btn-link" style={{ fontSize: 13, marginTop: 8 }} onClick={() => navigate(`/orders/${order.id}`)}>
              查看原订单 ›
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>处理进度</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {timeline.map((step, i) => (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', margin: '0 auto 8px',
                  background: step.done ? '#52C41A' : '#E8E8E8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: step.done ? '#fff' : '#999', fontSize: 14
                }}>
                  {step.done ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: 12, color: step.done ? '#52C41A' : '#999', marginBottom: 4 }}>{step.label}</div>
                {step.time && <div style={{ fontSize: 11, color: '#bbb' }}>{formatDate(step.time)}</div>}
              </div>
              {i < timeline.length - 1 && (
                <div style={{ flex: 2, height: 2, background: timeline[i + 1].done ? '#52C41A' : '#E8E8E8' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Reject modal */}
      {showReject && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">拒绝退款</span>
              <button className="btn btn-ghost" onClick={() => setShowReject(false)} style={{ fontSize: 18 }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label required">拒绝原因</label>
                <textarea
                  className="form-input"
                  style={{ width: '100%', minHeight: 100, resize: 'vertical' }}
                  placeholder="请详细说明拒绝原因..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowReject(false)}>取消</button>
              <button className="btn btn-danger" onClick={handleReject}>确认拒绝</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
