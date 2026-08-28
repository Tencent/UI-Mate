import React, { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { Search } from 'lucide-react'

const STATUS_LABELS = {
  pending_payment: { label: '待付款', class: 'badge-default' },
  pending_shipment: { label: '待发货', class: 'badge-warning' },
  shipped: { label: '已发货', class: 'badge-info' },
  completed: { label: '已完成', class: 'badge-success' },
  refunding: { label: '退款中', class: 'badge-danger' },
  closed: { label: '已关闭', class: 'badge-default' },
}

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'pending_payment', label: '待付款' },
  { key: 'pending_shipment', label: '待发货' },
  { key: 'shipped', label: '已发货' },
  { key: 'refunding', label: '退款中' },
  { key: 'completed', label: '已完成' },
  { key: 'closed', label: '已关闭' },
]

const NOTE_COLORS = [
  { key: 'red', value: '#FF4D4F', label: '红色' },
  { key: 'orange', value: '#FA8C16', label: '橙色' },
  { key: 'green', value: '#52C41A', label: '绿色' },
  { key: 'blue', value: '#1890FF', label: '蓝色' },
  { key: 'purple', value: '#722ED1', label: '紫色' },
]

const colors = ['#FF5000', '#1890FF', '#52C41A', '#FAAD14', '#722ED1']
function getProductColor(id) {
  return colors[parseInt((id || '').replace(/\D/g, '')) % colors.length]
}

function ShipModal({ order, onClose, onConfirm, providers }) {
  const [provider, setProvider] = useState(providers[0] || '')
  const [trackingNo, setTrackingNo] = useState('')
  const [error, setError] = useState('')

  function handleConfirm() {
    if (!trackingNo.trim()) { setError('请输入快递单号'); return }
    onConfirm(provider, trackingNo.trim())
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">发货确认</span>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 18 }}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 16, padding: 12, background: '#FAFAFA', borderRadius: 6 }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>订单：{order.orderNo}</div>
            {order.items.map((item, i) => (
              <div key={i} style={{ fontSize: 13, color: '#333' }}>{item.title} × {item.quantity}</div>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label required">快递公司</label>
            <select
              className="form-input"
              value={provider}
              onChange={e => setProvider(e.target.value)}
            >
              {providers.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label required">快递单号</label>
            <input
              className="form-input"
              placeholder="请输入快递单号"
              value={trackingNo}
              onChange={e => { setTrackingNo(e.target.value); setError('') }}
            />
            {error && <div className="form-error">{error}</div>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleConfirm}>确认发货</button>
        </div>
      </div>
    </div>
  )
}

function NoteSection({ order, onSave, onCancel }) {
  const [noteText, setNoteText] = useState(order.sellerNote || '')
  const [noteColor, setNoteColor] = useState(order.sellerNoteColor || 'red')

  function handleSave() {
    onSave(noteText, noteColor)
  }

  return (
    <div style={{
      padding: '12px 16px',
      borderTop: '1px solid var(--color-border)',
      background: '#FAFAFA',
    }}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8, fontWeight: 500 }}>卖家备注</div>
      <textarea
        style={{
          width: '100%', minHeight: 60, resize: 'vertical',
          padding: '6px 8px', border: '1px solid var(--color-border)',
          borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box',
          background: '#fff'
        }}
        placeholder="输入备注内容..."
        value={noteText}
        onChange={e => setNoteText(e.target.value)}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <span style={{ fontSize: 12, color: '#666' }}>标记颜色：</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {NOTE_COLORS.map(c => (
            <div
              key={c.key}
              title={c.label}
              onClick={() => setNoteColor(c.key)}
              style={{
                width: 20, height: 20, borderRadius: '50%',
                background: c.value, cursor: 'pointer',
                border: noteColor === c.key ? '2px solid #333' : '2px solid transparent',
                flexShrink: 0
              }}
            />
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>保存</button>
          <button className="btn btn-link" style={{ fontSize: 13 }} onClick={onCancel}>取消</button>
        </div>
      </div>
    </div>
  )
}

export default function OrderList() {
  const { state, dispatch } = useAppContext()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const defaultTab = searchParams.get('status') || 'all'
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [searchOrderNo, setSearchOrderNo] = useState('')
  const [searchBuyer, setSearchBuyer] = useState('')
  const [appliedOrderNo, setAppliedOrderNo] = useState('')
  const [appliedBuyer, setAppliedBuyer] = useState('')
  const [shipOrder, setShipOrder] = useState(null)
  const [page, setPage] = useState(1)
  const [openNoteId, setOpenNoteId] = useState(null)
  const pageSize = 10

  const filtered = useMemo(() => {
    return state.orders.filter(o => {
      if (activeTab !== 'all' && o.status !== activeTab) return false
      if (appliedOrderNo && !o.orderNo.includes(appliedOrderNo)) return false
      if (appliedBuyer && !o.buyerName.includes(appliedBuyer)) return false
      return true
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [state.orders, activeTab, appliedOrderNo, appliedBuyer])

  const counts = useMemo(() => {
    const c = {}
    state.orders.forEach(o => { c[o.status] = (c[o.status] || 0) + 1 })
    return c
  }, [state.orders])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  function handleShip(order, provider, trackingNo) {
    dispatch({ type: 'SHIP_ORDER', payload: { orderId: order.id, provider, trackingNo } })
    addToast('发货成功！', 'success')
    setShipOrder(null)
  }

  function handleSaveNote(orderId, sellerNote, sellerNoteColor) {
    dispatch({ type: 'UPDATE_ORDER', payload: { id: orderId, sellerNote, sellerNoteColor } })
    addToast('备注已保存', 'success')
    setOpenNoteId(null)
  }

  function getNoteColor(colorKey) {
    return NOTE_COLORS.find(c => c.key === colorKey)?.value || NOTE_COLORS[0].value
  }

  function formatDate(iso) {
    if (!iso) return '-'
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">已卖出的宝贝</h1>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {/* Tabs */}
        <div className="tabs">
          {TABS.map(tab => (
            <div
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.key); setPage(1) }}
            >
              {tab.label}
              {tab.key !== 'all' && counts[tab.key] > 0 && (
                <span style={{ marginLeft: 4, fontSize: 12, color: 'inherit' }}>({counts[tab.key]})</span>
              )}
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: '12px 16px', display: 'flex', gap: 8, borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              placeholder="订单编号"
              style={{ paddingLeft: 28, width: 180 }}
              className="form-input"
              value={searchOrderNo}
              onChange={e => setSearchOrderNo(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              placeholder="买家昵称"
              style={{ paddingLeft: 28, width: 150 }}
              className="form-input"
              value={searchBuyer}
              onChange={e => setSearchBuyer(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" style={{ marginLeft: 4 }} onClick={() => { setAppliedOrderNo(searchOrderNo); setAppliedBuyer(searchBuyer); setPage(1) }}>搜索</button>
          <button className="btn btn-default" onClick={() => { setSearchOrderNo(''); setSearchBuyer(''); setAppliedOrderNo(''); setAppliedBuyer(''); setPage(1) }}>重置</button>
        </div>

        {/* Order list */}
        <div style={{ padding: 16 }}>
          {paged.length === 0 ? (
            <div className="empty-state"><p>暂无订单</p></div>
          ) : paged.map(order => {
            const statusInfo = STATUS_LABELS[order.status] || { label: order.status, class: 'badge-default' }
            const noteColorValue = order.sellerNote ? getNoteColor(order.sellerNoteColor) : null
            return (
              <div key={order.id} style={{
                background: '#fff', border: '1px solid var(--color-border)',
                borderRadius: 8, marginBottom: 12, overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{
                  background: '#FAFAFA', padding: '8px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span
                      style={{ color: 'var(--color-link)', fontSize: 13, cursor: 'pointer' }}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      订单号：{order.orderNo}
                    </span>
                    {noteColorValue && (
                      <span
                        title={`备注：${order.sellerNote}`}
                        style={{
                          display: 'inline-block', width: 12, height: 12, borderRadius: '50%',
                          background: noteColorValue, flexShrink: 0, cursor: 'pointer'
                        }}
                        onClick={() => setOpenNoteId(openNoteId === order.id ? null : order.id)}
                      />
                    )}
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatDate(order.createdAt)}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>买家：{order.buyerName}</span>
                  </div>
                  <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
                </div>

                {/* Content */}
                <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < order.items.length - 1 ? 8 : 0 }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: 4, flexShrink: 0,
                          background: getProductColor(item.productId),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 16, fontWeight: 700
                        }}>
                          {item.title.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 2 }}>{item.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item.sku} × {item.quantity}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-primary)' }}>¥{item.price.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 24 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary)' }}>
                      ¥{order.actualAmount.toFixed(2)}
                    </div>
                    {order.discountAmount > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>优惠：-¥{order.discountAmount.toFixed(2)}</div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                {(order.buyerNote || order.status === 'pending_shipment' || order.status === 'shipped' || order.status === 'refunding') && (
                  <div style={{
                    padding: '8px 16px', borderTop: '1px solid var(--color-border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#FFFBE6'
                  }}>
                    <div style={{ fontSize: 12, color: '#D48806' }}>
                      {order.buyerNote && `买家留言：${order.buyerNote}`}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-link"
                        style={{ fontSize: 13 }}
                        onClick={() => setOpenNoteId(openNoteId === order.id ? null : order.id)}
                      >
                        备注
                      </button>
                      <button
                        className="btn btn-link"
                        style={{ fontSize: 13 }}
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        查看详情
                      </button>
                      {order.status === 'pending_shipment' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setShipOrder(order)}
                        >
                          发货
                        </button>
                      )}
                      {order.status === 'refunding' && (
                        <button
                          className="btn btn-link"
                          style={{ fontSize: 13, color: 'var(--color-danger)' }}
                          onClick={() => navigate('/refunds')}
                        >
                          查看退款
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {!order.buyerNote && order.status !== 'pending_shipment' && order.status !== 'refunding' && (
                  <div style={{
                    padding: '8px 16px', borderTop: '1px solid var(--color-border)',
                    display: 'flex', justifyContent: 'flex-end', gap: 8
                  }}>
                    <button
                      className="btn btn-link"
                      style={{ fontSize: 13 }}
                      onClick={() => setOpenNoteId(openNoteId === order.id ? null : order.id)}
                    >
                      备注
                    </button>
                    <button className="btn btn-link" style={{ fontSize: 13 }} onClick={() => navigate(`/orders/${order.id}`)}>查看详情</button>
                    {order.status === 'shipped' && (
                      <span style={{ fontSize: 12, color: '#999' }}>物流：{order.logistics?.provider} {order.logistics?.trackingNo}</span>
                    )}
                  </div>
                )}

                {/* Note section */}
                {openNoteId === order.id && (
                  <NoteSection
                    order={order}
                    onSave={(text, color) => handleSaveNote(order.id, text, color)}
                    onCancel={() => setOpenNoteId(null)}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">共 {filtered.length} 条订单</span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {shipOrder && (
        <ShipModal
          order={shipOrder}
          providers={state.logisticsProviders}
          onClose={() => setShipOrder(null)}
          onConfirm={(provider, trackingNo) => handleShip(shipOrder, provider, trackingNo)}
        />
      )}
    </div>
  )
}
