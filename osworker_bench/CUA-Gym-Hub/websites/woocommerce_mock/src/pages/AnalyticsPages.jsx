import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { TrendingUp, TrendingDown, Download } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

function fmt(n) {
  return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function AnalyticsOrders() {
  const { state } = useApp()
  const summary = state.analytics.revenueSummary
  const prev = summary.previousPeriod

  const avgOrderValue = summary.ordersCount ? (summary.netRevenue / summary.ordersCount) : 0
  const avgItemsPerOrder = summary.ordersCount ? (state.analytics.topProducts.reduce((s, p) => s + p.itemsSold, 0) / summary.ordersCount) : 0

  const chartData = state.analytics.dailyData.map(d => ({
    date: format(new Date(d.date), 'MMM d'),
    Orders: d.ordersCount,
    'Prev Year': d.previousOrdersCount,
  }))

  return (
    <div>
      <div className="wc-breadcrumb">
        <a>XooCommerce</a><span>/</span><a>Analytics</a><span>/</span>Orders
      </div>
      <div className="wp-page-title"><h1>Orders</h1></div>

      <div className="wc-summary-cards">
        {[
          { label: 'Orders', value: summary.ordersCount, prev: prev.ordersCount, change: prev.ordersCount ? ((summary.ordersCount - prev.ordersCount) / prev.ordersCount * 100) : 0 },
          { label: 'Net Revenue', value: fmt(summary.netRevenue), prev: fmt(prev.netRevenue), change: prev.netRevenue ? ((summary.netRevenue - prev.netRevenue) / prev.netRevenue * 100) : 0 },
          { label: 'Avg Order Value', value: fmt(avgOrderValue), prev: fmt(prev.netRevenue / prev.ordersCount), change: 3.2 },
          { label: 'Avg Items / Order', value: avgItemsPerOrder.toFixed(1), prev: (avgItemsPerOrder * 0.95).toFixed(1), change: 5.1 },
        ].map((m, i) => (
          <div key={i} className="wc-summary-card">
            <div className="wc-summary-card-label">{m.label}</div>
            <div className="wc-summary-card-value">{m.value}</div>
            <div className={`wc-summary-card-change ${m.change >= 0 ? 'positive' : 'negative'}`}>
              {m.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {' '}{Math.abs(m.change).toFixed(1)}%
            </div>
            <div className="wc-summary-card-prev">Previous year: {m.prev}</div>
          </div>
        ))}
      </div>

      <div className="wc-card">
        <div className="wc-card-header">Orders over time</div>
        <div style={{ padding: 20, height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcdcde" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Orders" stroke="#7f54b3" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Prev Year" stroke="#b3b3b3" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="wc-card">
        <div className="wc-card-header"><span>Orders</span><button className="button" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => { const csv = 'Date,Orders,Net Revenue,Avg Order Value\n' + state.analytics.dailyData.map(d => `${d.date},${d.ordersCount},${d.netRevenue},${d.ordersCount ? (d.netRevenue / d.ordersCount).toFixed(2) : 0}`).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'orders-analytics.csv'; a.click() }}><Download size={14} />Download</button></div>
        <table className="wp-list-table" style={{ border: 'none' }}>
          <thead>
            <tr>
              <th>Date</th><th>Orders</th><th>Net Revenue</th><th>Avg Order Value</th><th>Avg Items / Order</th>
            </tr>
          </thead>
          <tbody>
            {[...state.analytics.dailyData].sort((a, b) => b.date.localeCompare(a.date)).map(d => (
              <tr key={d.date}>
                <td>{format(new Date(d.date), 'MMM d, yyyy')}</td>
                <td style={{ color: '#2271b1' }}>{d.ordersCount}</td>
                <td>{fmt(d.netRevenue)}</td>
                <td>{d.ordersCount ? fmt(d.netRevenue / d.ordersCount) : '$0.00'}</td>
                <td>{d.ordersCount ? (2.1).toFixed(1) : '0.0'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AnalyticsCategories() {
  const { state } = useApp()

  const categoryData = state.categories.filter(c => !c.parent).map(cat => {
    const catProducts = state.products.filter(p => p.categories.some(c => c.id === cat.id) && p.status === 'publish')
    const itemsSold = catProducts.reduce((s, p) => s + p.totalSales, 0)
    const netRevenue = catProducts.reduce((s, p) => s + parseFloat(p.price) * p.totalSales, 0)
    const ordersCount = catProducts.reduce((s, p) => s + Math.floor(p.totalSales * 0.8), 0)
    return { ...cat, productsCount: catProducts.length, itemsSold, netRevenue, ordersCount }
  }).sort((a, b) => b.netRevenue - a.netRevenue)

  const totalSold = categoryData.reduce((s, c) => s + c.itemsSold, 0)
  const totalRevenue = categoryData.reduce((s, c) => s + c.netRevenue, 0)

  const chartData = categoryData.map(c => ({
    name: c.name,
    Revenue: Math.round(c.netRevenue),
    'Items Sold': c.itemsSold,
  }))

  return (
    <div>
      <div className="wc-breadcrumb">
        <a>XooCommerce</a><span>/</span><a>Analytics</a><span>/</span>Categories
      </div>
      <div className="wp-page-title"><h1>Categories</h1></div>

      <div className="wc-summary-cards">
        {[
          { label: 'Categories', value: categoryData.length, change: 0 },
          { label: 'Items Sold', value: totalSold, change: 6.8 },
          { label: 'Net Revenue', value: fmt(totalRevenue), change: 4.3 },
        ].map((m, i) => (
          <div key={i} className="wc-summary-card">
            <div className="wc-summary-card-label">{m.label}</div>
            <div className="wc-summary-card-value">{m.value}</div>
            <div className="wc-summary-card-change positive"><TrendingUp size={12} /> {m.change}%</div>
          </div>
        ))}
      </div>

      <div className="wc-card">
        <div className="wc-card-header">Revenue by category</div>
        <div style={{ padding: 20, height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcdcde" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
              <Tooltip formatter={(v, name) => name === 'Revenue' ? fmt(v) : v} />
              <Legend />
              <Bar dataKey="Revenue" fill="#7f54b3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="wc-card">
        <div className="wc-card-header"><span>Categories</span><button className="button" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => { const csv = 'Category,Products,Items Sold,Net Revenue,Orders\n' + categoryData.map(c => `${c.name},${c.productsCount},${c.itemsSold},${c.netRevenue.toFixed(2)},${c.ordersCount}`).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'categories-analytics.csv'; a.click() }}><Download size={14} />Download</button></div>
        <table className="wp-list-table" style={{ border: 'none' }}>
          <thead>
            <tr>
              <th>Category</th><th>Products</th><th>Items Sold</th><th>Net Revenue</th><th>Orders</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map(cat => (
              <tr key={cat.id}>
                <td style={{ fontWeight: 600 }}>{cat.name}</td>
                <td>{cat.productsCount}</td>
                <td>{cat.itemsSold}</td>
                <td>{fmt(cat.netRevenue)}</td>
                <td>{cat.ordersCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AnalyticsProducts() {
  const { state } = useApp()
  const totalSold = state.analytics.topProducts.reduce((s, p) => s + p.itemsSold, 0)
  const totalRevenue = state.analytics.topProducts.reduce((s, p) => s + p.netRevenue, 0)

  return (
    <div>
      <div className="wc-breadcrumb">
        <a>XooCommerce</a><span>/</span><a>Analytics</a><span>/</span>Products
      </div>
      <div className="wp-page-title"><h1>Products</h1></div>

      <div className="wc-summary-cards">
        {[
          { label: 'Items Sold', value: totalSold, change: 8.3 },
          { label: 'Net Revenue', value: fmt(totalRevenue), change: 5.7 },
          { label: 'Orders', value: state.analytics.revenueSummary.ordersCount, change: 3.1 },
        ].map((m, i) => (
          <div key={i} className="wc-summary-card">
            <div className="wc-summary-card-label">{m.label}</div>
            <div className="wc-summary-card-value">{m.value}</div>
            <div className="wc-summary-card-change positive"><TrendingUp size={12} /> {m.change}%</div>
          </div>
        ))}
      </div>

      <div className="wc-card">
        <div className="wc-card-header"><span>Products</span><button className="button" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => { const csv = 'Product,Items Sold,Net Revenue,Orders,Category,Stock\n' + state.products.filter(p => p.status === 'publish').map(p => { const a = state.analytics.topProducts.find(tp => tp.productId === p.id); return `"${p.name}",${a?.itemsSold || p.totalSales},${(a?.netRevenue || parseFloat(p.price) * p.totalSales).toFixed(2)},${a?.ordersCount || Math.floor(p.totalSales * 0.8)},"${p.categories.map(c => c.name).join('; ')}",${p.stockStatus}` }).join('\n'); const el = document.createElement('a'); el.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); el.download = 'products-analytics.csv'; el.click() }}><Download size={14} />Download</button></div>
        <table className="wp-list-table" style={{ border: 'none' }}>
          <thead>
            <tr>
              <th>Product Name</th><th>Items Sold</th><th>Net Revenue</th><th>Orders</th><th>Category</th><th>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {state.products.filter(p => p.status === 'publish').map(prod => {
              const analytics = state.analytics.topProducts.find(tp => tp.productId === prod.id)
              return (
                <tr key={prod.id}>
                  <td style={{ color: '#2271b1' }}>{prod.name}</td>
                  <td>{analytics?.itemsSold || prod.totalSales || 0}</td>
                  <td>{fmt(analytics?.netRevenue || parseFloat(prod.price) * prod.totalSales)}</td>
                  <td>{analytics?.ordersCount || Math.floor(prod.totalSales * 0.8)}</td>
                  <td style={{ fontSize: 12 }}>{prod.categories.map(c => c.name).join(', ')}</td>
                  <td>
                    <span className={`stock-${prod.stockStatus}`} style={{ fontSize: 12 }}>
                      {prod.stockStatus === 'instock' ? 'In stock' : prod.stockStatus === 'outofstock' ? 'Out of stock' : 'On backorder'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
