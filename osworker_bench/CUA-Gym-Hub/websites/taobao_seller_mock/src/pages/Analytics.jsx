import React, { useState, useMemo } from 'react'
import { useAppContext } from '../context/AppContext'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const DATE_PERIODS = [
  { key: 'today', label: '今日' },
  { key: 'yesterday', label: '昨日' },
  { key: '7d', label: '近7天' },
  { key: '30d', label: '近30天' },
]

const PIE_DATA = [
  { name: '搜索流量', value: 45, color: '#1890FF' },
  { name: '直接访问', value: 20, color: '#52C41A' },
  { name: '推广流量', value: 25, color: '#FF6600' },
  { name: '社交流量', value: 10, color: '#722ED1' },
]

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

export default function Analytics() {
  const { state } = useAppContext()
  const [period, setPeriod] = useState('7d')

  const { salesTrend } = state.dashboardMetrics
  const { today, yesterday } = state.dashboardMetrics

  const salesTrend30 = useMemo(() => generate30DayTrend(salesTrend), [salesTrend])

  const chartData = useMemo(() => {
    if (period === 'today') return [{ date: '今日', sales: today.sales, orders: today.orderCount }]
    if (period === 'yesterday') return [{ date: '昨日', sales: yesterday.sales, orders: yesterday.orderCount }]
    if (period === '30d') return salesTrend30
    return salesTrend
  }, [period, today, yesterday, salesTrend, salesTrend30])

  const metrics = useMemo(() => {
    if (period === 'today') return {
      revenue: today.sales, orders: today.orderCount, visitors: today.visitors,
      conversion: ((today.orderCount / today.visitors) * 100).toFixed(2),
      avgOrder: (today.sales / today.orderCount).toFixed(2)
    }
    if (period === 'yesterday') return {
      revenue: yesterday.sales, orders: yesterday.orderCount, visitors: yesterday.visitors,
      conversion: ((yesterday.orderCount / yesterday.visitors) * 100).toFixed(2),
      avgOrder: (yesterday.sales / yesterday.orderCount).toFixed(2)
    }
    const trendData = period === '30d' ? salesTrend30 : salesTrend
    const totalSales = trendData.reduce((s, d) => s + d.sales, 0)
    const totalOrders = trendData.reduce((s, d) => s + d.orders, 0)
    const totalVisitors = today.visitors * trendData.length
    return {
      revenue: totalSales,
      orders: totalOrders,
      visitors: totalVisitors,
      conversion: ((totalOrders / totalVisitors) * 100).toFixed(2),
      avgOrder: (totalSales / Math.max(totalOrders, 1)).toFixed(2)
    }
  }, [period, today, yesterday, salesTrend, salesTrend30])

  const productRanking = useMemo(() => {
    return [...state.products]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10)
      .map(p => ({
        ...p,
        revenue: (p.price * p.sales).toFixed(0),
        conversion: ((p.sales / Math.max(p.views, 1)) * 100).toFixed(1),
      }))
  }, [state.products])

  const colors = ['#FF5000', '#1890FF', '#52C41A', '#FAAD14', '#722ED1']
  function getProductColor(id) { return colors[parseInt((id || '').replace(/\D/g, '')) % colors.length] }

  const metricCards = [
    { label: '营业额', value: `¥${metrics.revenue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`, color: '#FF5000' },
    { label: '订单数', value: metrics.orders, color: '#1890FF' },
    { label: '访客数', value: metrics.visitors.toLocaleString(), color: '#52C41A' },
    { label: '转化率', value: `${metrics.conversion}%`, color: '#722ED1' },
    { label: '客单价', value: `¥${metrics.avgOrder}`, color: '#FA8C16' },
  ]

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">生意参谋</h1>
        <div style={{ display: 'flex', gap: 4 }}>
          {DATE_PERIODS.map(p => (
            <button
              key={p.key}
              className={`btn btn-sm ${period === p.key ? 'btn-primary' : 'btn-default'}`}
              onClick={() => setPeriod(p.key)}
            >{p.label}</button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {metricCards.map((card, i) => (
          <div key={i} className="card" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Sales trend */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>销售趋势</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5000" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF5000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `¥${v}`} />
              <Tooltip formatter={(v, n) => [n === 'sales' ? `¥${v}` : `${v}笔`, n === 'sales' ? '销售额' : '订单数']} labelFormatter={l => `日期：${l}`} />
              <Area type="monotone" dataKey="sales" stroke="#FF5000" fill="url(#analyticsGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic sources pie */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>流量来源</div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="45%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name">
                  {PIE_DATA.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v}%`, n]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Product ranking */}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>商品排行（前10名）</div>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>排名</th>
                <th>商品</th>
                <th>销量</th>
                <th>营业额</th>
                <th>转化率</th>
              </tr>
            </thead>
            <tbody>
              {productRanking.map((p, i) => (
                <tr key={p.id}>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, borderRadius: '50%', fontSize: 12, fontWeight: 600,
                      background: i < 3 ? ['#FF5000', '#FA8C16', '#FAAD14'][i] : '#f5f5f5',
                      color: i < 3 ? '#fff' : '#666'
                    }}>{i + 1}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 4,
                        background: getProductColor(p.id),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0
                      }}>{p.title.charAt(0)}</div>
                      <div style={{ fontSize: 13, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.sales}</td>
                  <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>¥{Number(p.revenue).toLocaleString()}</td>
                  <td style={{ color: '#52C41A' }}>{p.conversion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
