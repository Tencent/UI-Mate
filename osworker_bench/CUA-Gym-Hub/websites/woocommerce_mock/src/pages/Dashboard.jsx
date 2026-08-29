import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, ShoppingBag, AlertTriangle, Star } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

function SummaryCard({ label, value, change, prevValue, selected, onClick }) {
  const pct = change
  const positive = pct >= 0
  return (
    <div className={`wc-summary-card ${selected ? 'selected' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="wc-summary-card-label">{label}</div>
      <div className="wc-summary-card-value">{value}</div>
      <div className={`wc-summary-card-change ${positive ? 'positive' : 'negative'}`}>
        {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {' '}{Math.abs(pct).toFixed(1)}%
      </div>
      {prevValue && <div className="wc-summary-card-prev">Previous year: {prevValue}</div>}
    </div>
  )
}

function fmt(n) {
  return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Dashboard() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [selectedMetric, setSelectedMetric] = useState('grossRevenue')
  const [welcomeDismissed, setWelcomeDismissed] = useState(false)

  const { analytics, orders, products, reviews } = state
  const summary = analytics.revenueSummary
  const prev = summary.previousPeriod

  const pctChange = (curr, prev) => prev ? ((curr - prev) / prev) * 100 : 0

  const chartData = analytics.dailyData.slice(-30).map(d => ({
    date: format(new Date(d.date), 'MMM d'),
    'Current Period': d[selectedMetric] || d.grossRevenue,
    'Previous Year': d['previous' + selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)] || d.previousGrossRevenue,
  }))

  const recentOrders = [...orders].sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)).slice(0, 5)
  const lowStockProducts = products.filter(p => p.manageStock && p.stockQuantity !== null && p.stockQuantity < 10 && p.status !== 'draft')
  const recentReviews = reviews.filter(r => r.status === 'approved').sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)).slice(0, 3)

  const navTo = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  return (
    <div>
      {!welcomeDismissed && (
        <div className="notice notice-info" style={{ marginBottom: 20 }}>
          <div>
            <strong>Welcome to GreenLeaf Organics!</strong>
            <p style={{ margin: '4px 0 0', color: '#646970' }}>
              Your store is set up and running. Check your recent orders and analytics below.
            </p>
          </div>
          <button className="notice-dismiss" onClick={() => setWelcomeDismissed(true)}>×</button>
        </div>
      )}

      <div className="wp-page-title">
        <h1>XooCommerce</h1>
      </div>

      {/* Summary Cards */}
      <div className="wc-summary-cards">
        <SummaryCard
          label="Total Sales"
          value={fmt(summary.grossRevenue)}
          change={pctChange(summary.grossRevenue, prev.grossRevenue)}
          prevValue={fmt(prev.grossRevenue)}
          selected={selectedMetric === 'grossRevenue'}
          onClick={() => setSelectedMetric('grossRevenue')}
        />
        <SummaryCard
          label="Net Sales"
          value={fmt(summary.netRevenue)}
          change={pctChange(summary.netRevenue, prev.netRevenue)}
          prevValue={fmt(prev.netRevenue)}
          selected={selectedMetric === 'netRevenue'}
          onClick={() => setSelectedMetric('netRevenue')}
        />
        <SummaryCard
          label="Orders"
          value={summary.ordersCount}
          change={pctChange(summary.ordersCount, prev.ordersCount)}
          prevValue={prev.ordersCount}
          selected={selectedMetric === 'ordersCount'}
          onClick={() => setSelectedMetric('ordersCount')}
        />
        <SummaryCard
          label="Products Sold"
          value={analytics.topProducts.reduce((s, p) => s + p.itemsSold, 0)}
          change={5.2}
          prevValue={null}
          selected={selectedMetric === 'productsSold'}
          onClick={() => setSelectedMetric('productsSold')}
        />
        <SummaryCard
          label="Refunds"
          value={fmt(summary.refunds)}
          change={pctChange(summary.refunds, summary.refunds * 1.1)}
          prevValue={fmt(summary.refunds * 1.1)}
          selected={selectedMetric === 'refunds'}
          onClick={() => setSelectedMetric('refunds')}
        />
        <SummaryCard
          label="Coupons"
          value={fmt(summary.coupons)}
          change={pctChange(summary.coupons, summary.coupons * 0.9)}
          prevValue={fmt(summary.coupons * 0.9)}
          selected={selectedMetric === 'coupons'}
          onClick={() => setSelectedMetric('coupons')}
        />
      </div>

      {/* Chart */}
      <div className="wc-card" style={{ marginBottom: 20 }}>
        <div className="wc-card-header">
          <span>Performance</span>
          <span style={{ fontSize: 12, color: '#646970' }}>Last 30 days</span>
        </div>
        <div style={{ padding: '20px', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcdcde" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={v => selectedMetric === 'ordersCount' ? v : `$${(v/1000).toFixed(1)}k`} />
              <Tooltip formatter={(v) => selectedMetric === 'ordersCount' ? v : fmt(v)} />
              <Legend />
              <Line type="monotone" dataKey="Current Period" stroke="#7f54b3" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Previous Year" stroke="#b3b3b3" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="wc-card">
          <div className="wc-card-header">Top Products</div>
          <table className="wp-list-table" style={{ border: 'none' }}>
            <thead>
              <tr>
                <th style={{ width: 30 }}>#</th>
                <th>Product</th>
                <th>Items sold</th>
                <th>Net revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.map((p, i) => (
                <tr key={p.productId}>
                  <td style={{ color: '#646970' }}>{i + 1}</td>
                  <td>
                    <button className="button-link" onClick={() => navTo(`/products/${p.productId}`)}>
                      {p.name}
                    </button>
                  </td>
                  <td>{p.itemsSold}</td>
                  <td>{fmt(p.netRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="wc-card">
          <div className="wc-card-header">Top Categories</div>
          <table className="wp-list-table" style={{ border: 'none' }}>
            <thead>
              <tr>
                <th style={{ width: 30 }}>#</th>
                <th>Category</th>
                <th>Items sold</th>
                <th>Net revenue</th>
              </tr>
            </thead>
            <tbody>
              {state.categories.filter(c => !c.parent).map((cat, i) => {
                const catProducts = products.filter(p => p.categories.some(c => c.id === cat.id))
                const sold = catProducts.reduce((s, p) => s + p.totalSales, 0)
                const revenue = catProducts.reduce((s, p) => s + parseFloat(p.price) * p.totalSales, 0)
                return (
                  <tr key={cat.id}>
                    <td style={{ color: '#646970' }}>{i + 1}</td>
                    <td>{cat.name}</td>
                    <td>{sold}</td>
                    <td>{fmt(revenue)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Store Activity */}
      <div className="wc-card">
        <div className="wc-card-header">Store Activity</div>
        <div>
          {recentOrders.map(o => {
            const name = `${o.billing.firstName} ${o.billing.lastName}`
            return (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #dcdcde', gap: 12 }}>
                <ShoppingBag size={16} style={{ color: '#2271b1', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  New order:{' '}
                  <button className="button-link" onClick={() => navTo(`/orders/${o.id}`)}>Order #{o.number}</button>
                  {' '}by <strong>{name}</strong> — ${o.total}
                </div>
                <span className="text-muted">{formatDistanceToNow(new Date(o.dateCreated), { addSuffix: true })}</span>
              </div>
            )
          })}
          {lowStockProducts.slice(0, 3).map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #dcdcde', gap: 12 }}>
              <AlertTriangle size={16} style={{ color: '#dba617', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                Low stock:{' '}
                <button className="button-link" onClick={() => navTo(`/products/${p.id}`)}>
                  {p.name}
                </button>
                {' '}— {p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} remaining`}
              </div>
              <span className="text-muted">{formatDistanceToNow(new Date(p.dateModified), { addSuffix: true })}</span>
            </div>
          ))}
          {recentReviews.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #dcdcde', gap: 12 }}>
              <Star size={16} style={{ color: '#ffb900', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                New review: <strong>{r.rating} stars</strong> on{' '}
                <button className="button-link" onClick={() => navTo(`/products/${r.productId}`)}>
                  {r.productName}
                </button>
                {' '}by {r.reviewer}
              </div>
              <span className="text-muted">{formatDistanceToNow(new Date(r.dateCreated), { addSuffix: true })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
