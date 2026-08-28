import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'
import { ShoppingBag, RotateCcw, Eye, TrendingUp, TrendingDown, PlusCircle, Megaphone, BarChart3, Star, Truck, Store, MessageSquare, Ticket } from 'lucide-react'

const colors = ['#FF5000', '#1890FF', '#52C41A', '#FAAD14', '#722ED1']
function getProductColor(id) {
  return colors[parseInt((id || '').replace(/\D/g, '')) % colors.length]
}

function MetricCard({ icon, iconBg, label, value, compare, compareLabel, onClick }) {
  const isPositive = compare >= 0
  return (
    <div
      className="card"
      style={{ cursor: onClick ? 'pointer' : 'default', flex: 1, minWidth: 0 }}
      onClick={onClick}
      onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = '')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>{value}</div>
          {compareLabel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              {isPositive ? <TrendingUp size={12} color="#52C41A" /> : <TrendingDown size={12} color="#FF4D4F" />}
              <span style={{ color: isPositive ? '#52C41A' : '#FF4D4F' }}>
                较昨日 {isPositive ? '+' : ''}{compareLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function generate30DayTrend(salesTrend7) {
  if (!salesTrend7 || salesTrend7.length === 0) return []
  const lastDate = new Date(salesTrend7[salesTrend7.length - 1].date)
  const avgSales = salesTrend7.reduce((s, d) => s + d.sales, 0) / salesTrend7.length
  const avgOrders = salesTrend7.reduce((s, d) => s + d.orders, 0) / salesTrend7.length
  const result = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(lastDate)
    d.setDate(d.getDate() - i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const existing = salesTrend7.find(x => x.date === dateStr)
    if (existing) {
      result.push(existing)
    } else {
      const seed = d.getDate() + d.getMonth() * 31
      const noise = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
      result.push({
        date: dateStr,
        sales: Math.round(avgSales * (0.7 + noise * 0.6)),
        orders: Math.max(1, Math.round(avgOrders * (0.7 + noise * 0.6)))
      })
    }
  }
  return result
}

export default function Dashboard() {
  const { state } = useAppContext()
  const navigate = useNavigate()
  const [trendPeriod, setTrendPeriod] = useState('7')
  const [announcementModal, setAnnouncementModal] = useState(null)

  const { today, yesterday, salesTrend } = state.dashboardMetrics
  const chartData = trendPeriod === '30' ? generate30DayTrend(salesTrend) : salesTrend

  const salesDiff = ((today.sales - yesterday.sales) / yesterday.sales * 100).toFixed(1)
  const orderDiff = today.orderCount - yesterday.orderCount
  const visitorDiff = ((today.visitors - yesterday.visitors) / yesterday.visitors * 100).toFixed(1)

  const pendingShipmentCount = state.orders.filter(o => o.status === 'pending_shipment').length
  const pendingRefundCount = state.refunds.filter(r => r.status === 'pending').length
  const unrepliedReviewCount = state.reviews.filter(r => !r.sellerReply).length
  const unreadMsgCount = state.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)

  const quickActions = [
    { label: '发布商品', path: '/products/new', color: '#FF5000', bg: '#FFF0EB', icon: <PlusCircle size={20} color="#FF5000" /> },
    { label: '订单管理', path: '/orders', color: '#1890FF', bg: '#E6F7FF', icon: <ShoppingBag size={20} color="#1890FF" /> },
    { label: '营销活动', path: '/promotions', color: '#52C41A', bg: '#F6FFED', icon: <Megaphone size={20} color="#52C41A" /> },
    { label: '数据报表', path: '/analytics', color: '#722ED1', bg: '#F9F0FF', icon: <BarChart3 size={20} color="#722ED1" /> },
    { label: '退款管理', path: '/refunds', color: '#FF4D4F', bg: '#FFF2F0', icon: <RotateCcw size={20} color="#FF4D4F" /> },
    { label: '评价管理', path: '/reviews', color: '#FA8C16', bg: '#FFF7E6', icon: <Star size={20} color="#FA8C16" /> },
    { label: '优惠券', path: '/coupons', color: '#EB2F96', bg: '#FFF0F6', icon: <Ticket size={20} color="#EB2F96" /> },
    { label: '消息中心', path: '/messages', color: '#13C2C2', bg: '#E6FFFB', icon: <MessageSquare size={20} color="#13C2C2" /> },
    { label: '物流管理', path: '/logistics', color: '#2F54EB', bg: '#F0F5FF', icon: <Truck size={20} color="#2F54EB" /> },
    { label: '店铺设置', path: '/settings', color: '#8C8C8C', bg: '#FAFAFA', icon: <Store size={20} color="#8C8C8C" /> },
  ]

  const announcements = [
    { id: 1, tag: '活动', title: '双十一大促活动：全场满200减30，满500减80', date: '2024-11-01', content: '双十一大促活动正式开启！活动时间：2024年11月1日至2024年11月11日。活动内容：全场商品满200减30，满500减80。请商家提前备货，确保活动期间正常发货。' },
    { id: 2, tag: '公告', title: '关于双十一期间发货时效的特别提醒', date: '2024-11-08', content: '双十一期间快递量大，预计物流时效会有所延迟。请商家提前和买家沟通，并在72小时内完成发货操作，避免影响店铺指标。建议提前备货，确保活动期间库存充足。' },
    { id: 3, tag: '政策', title: '消费者保障计划升级：全面升级退换货政策', date: '2024-11-10', content: '平台升级消费者保障计划，要求商家严格执行7天无理由退换货政策。对于退款申请，要求在48小时内进行处理，超时将自动同意退款。请商家及时关注退款申请，避免影响店铺评分。' },
    { id: 4, tag: '系统', title: '卖家中心系统升级维护公告', date: '2024-11-15', content: '平台计划于2024年11月25日凌晨2:00-4:00进行系统维护升级，升级期间卖家中心将无法正常使用，请商家提前做好相关工作安排，避免在此期间进行重要操作。感谢您的理解与配合。' },
  ]

  const tagColors = { 活动: '#FF6600', 公告: '#1890FF', 政策: '#722ED1', 系统: '#52C41A' }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">工作台</h1>
        <p className="page-subtitle">欢迎回来，{state.store.owner}！今天是个好日子，好好卖货吧～</p>
      </div>

      {/* 今日数据 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 16, background: 'var(--color-primary)', borderRadius: 2 }} />
            <span style={{ fontWeight: 600, fontSize: 16 }}>今日数据</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            更新时间：{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <MetricCard
          icon={<span style={{ fontSize: 18 }}>¥</span>}
          iconBg="#FFF0EB"
          label="今日销售额"
          value={`¥${today.sales.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`}
          compare={Number(salesDiff)}
          compareLabel={`${Math.abs(salesDiff)}%`}
        />
        <MetricCard
          icon={<ShoppingBag size={18} color="#1890FF" />}
          iconBg="#E6F7FF"
          label="待发货订单"
          value={`${pendingShipmentCount}笔`}
          compare={pendingShipmentCount - (yesterday.pendingShipment || 0)}
          compareLabel={`${Math.abs(pendingShipmentCount - (yesterday.pendingShipment || 0))}笔`}
          onClick={() => navigate('/orders?status=pending_shipment')}
        />
        <MetricCard
          icon={<RotateCcw size={18} color="#FF4D4F" />}
          iconBg="#FFF2F0"
          label="待处理退款"
          value={`${pendingRefundCount}笔`}
          compare={-(pendingRefundCount - (yesterday.pendingRefund || 0))}
          compareLabel={`${Math.abs(pendingRefundCount - (yesterday.pendingRefund || 0))}笔`}
          onClick={() => navigate('/refunds?status=pending')}
        />
        <MetricCard
          icon={<Eye size={18} color="#52C41A" />}
          iconBg="#F6FFED"
          label="今日访客"
          value={`${today.visitors.toLocaleString()}人`}
          compare={Number(visitorDiff)}
          compareLabel={`${Math.abs(visitorDiff)}%`}
        />
      </div>
      </div>

      {/* Quick actions */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>快捷操作</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {quickActions.map((action, i) => (
            <div
              key={i}
              onClick={() => navigate(action.path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 8,
                padding: '16px 8px', borderRadius: 8, cursor: 'pointer',
                background: '#fff', border: '1px solid var(--color-border)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = ''
                e.currentTarget.style.transform = ''
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {action.icon}
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 20 }}>
        {/* Sales trend chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>销售趋势</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {['7', '30'].map(p => (
                <button
                  key={p}
                  className={`btn btn-sm ${trendPeriod === p ? 'btn-primary' : 'btn-default'}`}
                  onClick={() => setTrendPeriod(p)}
                >近{p}天</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5000" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF5000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `¥${v}`} />
              <Tooltip formatter={(v, n) => [n === 'sales' ? `¥${v}` : `${v}笔`, n === 'sales' ? '销售额' : '订单数']} labelFormatter={l => `日期：${l}`} />
              <Area type="monotone" dataKey="sales" stroke="#FF5000" fill="url(#salesGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pending tasks */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>待办事项</div>
          {[
            { label: '待发货订单', count: pendingShipmentCount, color: '#FF6600', path: '/orders?status=pending_shipment' },
            { label: '待处理退款', count: pendingRefundCount, color: '#FF4D4F', path: '/refunds?status=pending' },
            { label: '待回复评价', count: unrepliedReviewCount, color: '#1890FF', path: '/reviews' },
            { label: '待回复消息', count: unreadMsgCount, color: '#52C41A', path: '/messages' },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', marginBottom: 8, borderRadius: 6,
                borderLeft: `4px solid ${item.color}`,
                background: '#FAFAFA', cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
              onMouseLeave={e => e.currentTarget.style.background = '#FAFAFA'}
            >
              <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)' }}>{item.label}</span>
              <span className="count-badge" style={{ background: item.color }}>{item.count}</span>
              <span style={{ color: '#ccc' }}>›</span>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements & Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Announcements */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>平台公告</div>
          {announcements.map(a => (
            <div
              key={a.id}
              onClick={() => setAnnouncementModal(a)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: '1px solid var(--color-border-light)',
                cursor: 'pointer'
              }}
            >
              <span style={{
                background: tagColors[a.tag] || '#999',
                color: '#fff', padding: '1px 6px', borderRadius: 3,
                fontSize: 11, flexShrink: 0
              }}>{a.tag}</span>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.title}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', flexShrink: 0 }}>{a.date}</span>
            </div>
          ))}
        </div>

        {/* Top products */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>热销商品</div>
          {state.products
            .filter(p => p.status === 'on_sale')
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
            .map((p, i) => (
              <div
                key={p.id}
                onClick={() => navigate(`/products/${p.id}/edit`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                  borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer'
                }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 600,
                  background: i < 3 ? ['#FF5000', '#FA8C16', '#FAAD14'][i] : '#f0f0f0',
                  color: i < 3 ? '#fff' : '#666', flexShrink: 0
                }}>{i + 1}</span>
                <div style={{
                  width: 36, height: 36, borderRadius: 4, flexShrink: 0,
                  background: getProductColor(p.id),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 14, fontWeight: 700
                }}>{p.title.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>销量 {p.sales} | 库存 {p.stock}</div>
                </div>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
                  ¥{p.price.toFixed(0)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {announcementModal && (
        <div className="modal-overlay" onClick={() => setAnnouncementModal(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{announcementModal.title}</span>
              <button className="btn btn-ghost" onClick={() => setAnnouncementModal(null)} style={{ fontSize: 18, padding: '0 4px' }}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--color-text-primary)' }}>{announcementModal.content}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 12 }}>发布时间：{announcementModal.date}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setAnnouncementModal(null)}>知道了</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
