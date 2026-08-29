import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { Search, Truck, Package, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

const colors = ['#FF5000', '#1890FF', '#52C41A', '#FAAD14', '#722ED1']
function getProductColor(id) { return colors[parseInt((id || '').replace(/\D/g, '')) % colors.length] }

const TABS = [
  { key: 'all', label: '全部物流' },
  { key: 'pending_shipment', label: '待发货' },
  { key: 'shipped', label: '运输中' },
  { key: 'completed', label: '已签收' },
]

const LOGISTICS_STATUS = {
  pending_shipment: { label: '待发货', color: '#FA8C16', icon: Clock },
  shipped: { label: '运输中', color: '#1890FF', icon: Truck },
  completed: { label: '已签收', color: '#52C41A', icon: CheckCircle },
}

function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

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
          <div style={{ marginBottom: 16, padding: 12, background: '#FAFAFA', borderRadius: 6 }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>订单：{order.orderNo}</div>
            <div style={{ fontSize: 13 }}>收件人：{order.shippingAddress.recipient} {order.shippingAddress.phone}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              {order.shippingAddress.province}{order.shippingAddress.city}{order.shippingAddress.district}{order.shippingAddress.street}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label required">快递公司</label>
            <select className="form-input" value={provider} onChange={e => setProvider(e.target.value)}>
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
          <button className="btn btn-primary" onClick={() => {
            if (!trackingNo.trim()) { setError('请输入快递单号'); return }
            onConfirm(provider, trackingNo.trim())
          }}>确认发货</button>
        </div>
      </div>
    </div>
  )
}

export default function LogisticsManagement() {
  const { state, dispatch } = useAppContext()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [shipOrder, setShipOrder] = useState(null)

  const logisticsOrders = useMemo(() => {
    return state.orders
      .filter(o => ['pending_shipment', 'shipped', 'completed'].includes(o.status))
      .filter(o => {
        if (activeTab !== 'all' && o.status !== activeTab) return false
        if (search && !o.orderNo.includes(search) && !o.buyerName.includes(search) &&
            !(o.logistics?.trackingNo || '').includes(search)) return false
        return true
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [state.orders, activeTab, search])

  const counts = useMemo(() => {
    const c = { all: 0 }
    state.orders.forEach(o => {
      if (['pending_shipment', 'shipped', 'completed'].includes(o.status)) {
        c[o.status] = (c[o.status] || 0) + 1
        c.all++
      }
    })
    return c
  }, [state.orders])

  // Provider stats
  const providerStats = useMemo(() => {
    const stats = {}
    state.orders.forEach(o => {
      if (o.logistics?.provider) {
        if (!stats[o.logistics.provider]) stats[o.logistics.provider] = { count: 0, shipped: 0, completed: 0 }
        stats[o.logistics.provider].count++
        if (o.status === 'shipped') stats[o.logistics.provider].shipped++
        if (o.status === 'completed') stats[o.logistics.provider].completed++
      }
    })
    return Object.entries(stats).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.count - a.count)
  }, [state.orders])

  function handleShip(order, provider, trackingNo) {
    dispatch({ type: 'SHIP_ORDER', payload: { orderId: order.id, provider, trackingNo } })
    addToast(`订单 ${order.orderNo} 已发货`, 'success')
    setShipOrder(null)
  }

  function getLogisticsTimeline(order) {
    if (!order.logistics) return []
    const steps = [
      { status: '商家已发货，等待揽收', time: order.shippedAt },
    ]
    if (order.shippedAt) {
      const shipped = new Date(order.shippedAt)
      steps.push({ status: '快递员已取件', time: new Date(shipped.getTime() + 2 * 3600000).toISOString() })
      steps.push({ status: '包裹已到达发件城市中转中心', time: new Date(shipped.getTime() + 8 * 3600000).toISOString() })
      steps.push({ status: '包裹运输中', time: new Date(shipped.getTime() + 18 * 3600000).toISOString() })
      if (order.status === 'completed') {
        steps.push({ status: '包裹已到达目的城市中转中心', time: new Date(shipped.getTime() + 30 * 3600000).toISOString() })
        steps.push({ status: '正在派送中', time: new Date(shipped.getTime() + 36 * 3600000).toISOString() })
        steps.push({ status: '已签收', time: order.completedAt || new Date(shipped.getTime() + 40 * 3600000).toISOString() })
      }
    }
    return steps.reverse()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">物流管理</h1>
        <p className="page-subtitle">管理订单物流信息，跟踪配送状态</p>
      </div>

      {/* Stats overview */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Clock size={18} color="#FA8C16" />
            <span style={{ fontSize: 12, color: '#999' }}>待发货</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#FA8C16' }}>{counts.pending_shipment || 0}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Truck size={18} color="#1890FF" />
            <span style={{ fontSize: 12, color: '#999' }}>运输中</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1890FF' }}>{counts.shipped || 0}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <CheckCircle size={18} color="#52C41A" />
            <span style={{ fontSize: 12, color: '#999' }}>已签收</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#52C41A' }}>{counts.completed || 0}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Package size={18} color="#722ED1" />
            <span style={{ fontSize: 12, color: '#999' }}>物流总量</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#722ED1' }}>{counts.all || 0}</div>
        </div>
      </div>

      {/* Provider stats */}
      {providerStats.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>快递公司使用统计</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {providerStats.map(ps => (
              <div key={ps.name} style={{
                padding: '8px 16px', background: '#FAFAFA', borderRadius: 6,
                border: '1px solid var(--color-border)', fontSize: 13, minWidth: 140
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{ps.name}</div>
                <div style={{ color: '#666' }}>
                  共{ps.count}单 · 运输中{ps.shipped} · 已签收{ps.completed}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logistics list */}
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
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ position: 'relative', maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              placeholder="搜索订单号/买家/快递单号"
              style={{ paddingLeft: 28, width: '100%' }}
              className="form-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ padding: 16 }}>
          {logisticsOrders.length === 0 ? (
            <div className="empty-state"><p>暂无物流记录</p></div>
          ) : logisticsOrders.map(order => {
            const statusInfo = LOGISTICS_STATUS[order.status] || { label: order.status, color: '#999', icon: Package }
            const StatusIcon = statusInfo.icon
            const timeline = getLogisticsTimeline(order)

            return (
              <div key={order.id} style={{
                border: '1px solid var(--color-border)', borderRadius: 8, marginBottom: 12, overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{
                  background: '#FAFAFA', padding: '10px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-link)', fontSize: 13, cursor: 'pointer' }}
                      onClick={() => navigate(`/orders/${order.id}`)}>
                      {order.orderNo}
                    </span>
                    <span style={{ fontSize: 12, color: '#999' }}>买家：{order.buyerName}</span>
                    <span style={{ fontSize: 12, color: '#999' }}>{formatDate(order.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StatusIcon size={14} color={statusInfo.color} />
                    <span style={{ color: statusInfo.color, fontWeight: 500, fontSize: 13 }}>{statusInfo.label}</span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Items */}
                    <div style={{ flex: 1 }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 13 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 4, flexShrink: 0,
                            background: getProductColor(item.productId),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 13, fontWeight: 700
                          }}>{item.title.charAt(0)}</div>
                          <div>
                            <div style={{ fontSize: 13 }}>{item.title}</div>
                            <div style={{ fontSize: 11, color: '#999' }}>{item.sku} × {item.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Address */}
                    <div style={{ textAlign: 'right', fontSize: 12, color: '#666', maxWidth: 240 }}>
                      <div>{order.shippingAddress.recipient} {order.shippingAddress.phone}</div>
                      <div>{order.shippingAddress.province}{order.shippingAddress.city}{order.shippingAddress.district}</div>
                    </div>
                  </div>

                  {/* Logistics info */}
                  {order.logistics && (
                    <div style={{ marginTop: 12, padding: 12, background: '#F6F8FA', borderRadius: 6 }}>
                      <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 13 }}>
                        <span>快递公司：<strong>{order.logistics.provider}</strong></span>
                        <span>快递单号：<strong style={{ color: 'var(--color-link)' }}>{order.logistics.trackingNo}</strong></span>
                      </div>
                      {timeline.length > 0 && (
                        <div style={{ borderLeft: '2px solid var(--color-border)', paddingLeft: 12, marginLeft: 4 }}>
                          {timeline.slice(0, 3).map((step, i) => (
                            <div key={i} style={{ marginBottom: 8, position: 'relative' }}>
                              <div style={{
                                position: 'absolute', left: -18, top: 4,
                                width: 8, height: 8, borderRadius: '50%',
                                background: i === 0 ? 'var(--color-primary)' : '#ddd'
                              }} />
                              <div style={{ fontSize: 12, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? '#333' : '#999' }}>
                                {step.status}
                              </div>
                              <div style={{ fontSize: 11, color: '#bbb' }}>{formatDate(step.time)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{
                  padding: '8px 16px', borderTop: '1px solid var(--color-border)',
                  display: 'flex', justifyContent: 'flex-end', gap: 8
                }}>
                  <button className="btn btn-link" style={{ fontSize: 13 }}
                    onClick={() => navigate(`/orders/${order.id}`)}>查看订单</button>
                  {order.status === 'pending_shipment' && (
                    <button className="btn btn-primary btn-sm" onClick={() => setShipOrder(order)}>发货</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
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
