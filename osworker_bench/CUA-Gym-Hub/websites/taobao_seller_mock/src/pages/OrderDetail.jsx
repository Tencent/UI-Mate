import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useToast } from '../components/Toast'

const STATUS_LABELS = {
  pending_payment: { label: '待付款', color: '#999' },
  pending_shipment: { label: '待发货', color: '#FA8C16' },
  shipped: { label: '已发货', color: '#1890FF' },
  completed: { label: '已完成', color: '#52C41A' },
  refunding: { label: '退款中', color: '#FF4D4F' },
  closed: { label: '已关闭', color: '#999' },
}

const colors = ['#FF5000', '#1890FF', '#52C41A', '#FAAD14', '#722ED1']
function getProductColor(id) { return colors[parseInt((id || '').replace(/\D/g, '')) % colors.length] }

function ShipModal({ order, onClose, onConfirm, providers }) {
  const [provider, setProvider] = useState(providers[0] || '')
  const [trackingNo, setTrackingNo] = useState('')
  const [error, setError] = useState('')

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">发货确认</span>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 18 }}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label required">快递公司</label>
            <select className="form-input" value={provider} onChange={e => setProvider(e.target.value)}>
              {providers.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label required">快递单号</label>
            <input className="form-input" placeholder="请输入快递单号" value={trackingNo} onChange={e => { setTrackingNo(e.target.value); setError('') }} />
            {error && <div className="form-error">{error}</div>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={() => {
            if (!trackingNo.trim()) { setError('请输入快递单号'); return }
            onConfirm(provider, trackingNo.trim())
          }}>确认发货</button>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const { state, dispatch } = useAppContext()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [showShip, setShowShip] = useState(false)
  const [editingNote, setEditingNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteColor, setNoteColor] = useState('')

  const order = state.orders.find(o => o.id === id)

  const NOTE_COLORS = [
    { value: 'red', label: '红色', hex: '#FF4D4F' },
    { value: 'orange', label: '橙色', hex: '#FA8C16' },
    { value: 'green', label: '绿色', hex: '#52C41A' },
    { value: 'blue', label: '蓝色', hex: '#1890FF' },
    { value: 'purple', label: '紫色', hex: '#722ED1' },
  ]

  function openNoteEdit() {
    setNoteText(order ? order.sellerNote || '' : '')
    setNoteColor(order ? order.sellerNoteColor || '' : '')
    setEditingNote(true)
  }

  function saveNote() {
    dispatch({ type: 'UPDATE_ORDER', payload: { id: order.id, sellerNote: noteText, sellerNoteColor: noteColor } })
    addToast('备注已保存', 'success')
    setEditingNote(false)
  }

  if (!order) return <div className="empty-state"><p>订单不存在</p></div>

  const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: '#999' }
  const refund = state.refunds.find(r => r.orderId === id)

  const steps = [
    { label: '买家下单', time: order.createdAt, done: true },
    { label: '买家付款', time: order.paidAt, done: !!order.paidAt },
    { label: '卖家发货', time: order.shippedAt, done: !!order.shippedAt },
    { label: '买家确认收货', time: null, done: order.status === 'completed' },
    { label: '交易完成', time: order.completedAt, done: order.status === 'completed' },
  ]

  function formatDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  function handleShip(provider, trackingNo) {
    dispatch({ type: 'SHIP_ORDER', payload: { orderId: id, provider, trackingNo } })
    addToast('发货成功！', 'success')
    setShowShip(false)
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
        <span style={{ cursor: 'pointer', color: 'var(--color-link)' }} onClick={() => navigate('/orders')}>订单管理</span>
        {' > '}
        <span>订单详情</span>
      </div>

      {/* Status banner */}
      <div style={{
        background: '#fff', border: '1px solid var(--color-border)',
        borderRadius: 8, padding: '20px 24px', marginBottom: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 600, color: statusInfo.color }}>{statusInfo.label}</span>
            <span style={{ fontSize: 13, color: '#999', marginLeft: 16 }}>订单号：{order.orderNo}</span>
          </div>
          {order.status === 'pending_shipment' && (
            <button className="btn btn-primary" onClick={() => setShowShip(true)}>发货</button>
          )}
        </div>

        {/* Progress stepper */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {steps.map((step, i) => (
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
              {i < steps.length - 1 && (
                <div style={{
                  flex: 2, height: 2,
                  background: steps[i + 1].done ? '#52C41A' : '#E8E8E8'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Order info */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>订单信息</div>
          {[
            ['订单编号', order.orderNo],
            ['创建时间', formatDate(order.createdAt)],
            ['付款时间', formatDate(order.paidAt) || '-'],
            ['付款方式', order.paymentMethod || '-'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', marginBottom: 10 }}>
              <span style={{ width: 80, fontSize: 13, color: '#999', flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: 13, color: '#333' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Buyer info */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>收货信息</div>
          {[
            ['买家昵称', order.buyerName],
            ['收货人', order.shippingAddress.recipient],
            ['联系电话', order.shippingAddress.phone],
            ['收货地址', `${order.shippingAddress.province}${order.shippingAddress.city}${order.shippingAddress.district}${order.shippingAddress.street}`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', marginBottom: 10 }}>
              <span style={{ width: 80, fontSize: 13, color: '#999', flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: 13, color: '#333' }}>{v}</span>
            </div>
          ))}
          {order.buyerNote && (
            <div style={{ display: 'flex', marginBottom: 10 }}>
              <span style={{ width: 80, fontSize: 13, color: '#999', flexShrink: 0 }}>买家备注</span>
              <span style={{ fontSize: 13, color: '#D48806', background: '#FFFBE6', padding: '2px 8px', borderRadius: 4 }}>{order.buyerNote}</span>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>商品信息</div>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 4, flexShrink: 0,
              background: getProductColor(item.productId),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 20, fontWeight: 700
            }}>
              {item.title.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{item.sku}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 14 }}>
              <div>¥{item.price.toFixed(2)}</div>
              <div style={{ color: '#999', fontSize: 12 }}>×{item.quantity}</div>
              <div style={{ fontWeight: 600, color: '#333' }}>¥{(item.price * item.quantity).toFixed(2)}</div>
            </div>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, fontSize: 13, color: '#666' }}>
            <span>商品总额：¥{order.totalAmount.toFixed(2)}</span>
            <span>运费：¥{(order.shippingFee || 0).toFixed(2)}</span>
            {order.discountAmount > 0 && <span>优惠：-¥{order.discountAmount.toFixed(2)}</span>}
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-primary)' }}>
              实付：¥{order.actualAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Logistics */}
      {order.logistics && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>物流信息</div>
          <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 12, color: '#999' }}>快递公司：</span>
              <span style={{ fontSize: 14 }}>{order.logistics.provider}</span>
            </div>
            <div>
              <span style={{ fontSize: 12, color: '#999' }}>快递单号：</span>
              <span style={{ fontSize: 14, color: 'var(--color-link)' }}>{order.logistics.trackingNo}</span>
            </div>
          </div>
          <div>
            {[
              { status: '快递员已取件', time: order.shippedAt },
              { status: '包裹运输中', time: new Date(new Date(order.shippedAt).getTime() + 12 * 3600000).toISOString() },
              { status: '已到达目的城市中转中心', time: new Date(new Date(order.shippedAt).getTime() + 36 * 3600000).toISOString() },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? 'var(--color-primary)' : '#ddd', flexShrink: 0, marginTop: 6 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: i === 0 ? 600 : 400 }}>{step.status}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{formatDate(step.time)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refund info */}
      {refund && (
        <div className="card" style={{ marginBottom: 16, borderLeft: '3px solid var(--color-danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>退款申请</span>
            <button className="btn btn-link" style={{ color: 'var(--color-danger)' }} onClick={() => navigate(`/refunds/${refund.id}`)}>
              查看详情 ›
            </button>
          </div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
            {refund.buyerName} 申请退款 ¥{refund.amount.toFixed(2)}，原因：{refund.reasonText}
          </div>
        </div>
      )}

      {/* Seller note */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>卖家备注</span>
          {!editingNote && (
            <button className="btn btn-default btn-sm" onClick={openNoteEdit}>编辑</button>
          )}
        </div>
        {!editingNote ? (
          <div style={{
            fontSize: 13, color: order.sellerNote ? (NOTE_COLORS.find(c => c.value === order.sellerNoteColor)?.hex || '#333') : '#999',
            background: order.sellerNote ? '#FFFBE6' : 'transparent',
            padding: order.sellerNote ? '8px 12px' : 0, borderRadius: 4
          }}>
            {order.sellerNote || '暂无备注'}
          </div>
        ) : (
          <div>
            <textarea
              className="form-input"
              style={{ width: '100%', minHeight: 80, resize: 'vertical', marginBottom: 12 }}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="输入卖家备注..."
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#666' }}>标记颜色：</span>
              {NOTE_COLORS.map(c => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => setNoteColor(c.value)}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', background: c.hex,
                    border: noteColor === c.value ? '2px solid #333' : '2px solid transparent',
                    cursor: 'pointer', flexShrink: 0
                  }}
                />
              ))}
              {noteColor && (
                <button className="btn btn-link" style={{ fontSize: 12, color: '#999' }} onClick={() => setNoteColor('')}>清除</button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={saveNote}>保存</button>
              <button className="btn btn-default btn-sm" onClick={() => setEditingNote(false)}>取消</button>
            </div>
          </div>
        )}
      </div>

      {showShip && (
        <ShipModal
          order={order}
          providers={state.logisticsProviders}
          onClose={() => setShowShip(false)}
          onConfirm={handleShip}
        />
      )}
    </div>
  )
}
