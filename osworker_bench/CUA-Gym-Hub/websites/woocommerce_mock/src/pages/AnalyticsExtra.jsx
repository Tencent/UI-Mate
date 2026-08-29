import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { TrendingUp, TrendingDown, Download } from 'lucide-react'
import { format } from 'date-fns'

function fmt(n) {
  return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Breadcrumb({ page }) {
  return (
    <div className="wc-breadcrumb">
      <a>XooCommerce</a><span>/</span><a>Analytics</a><span>/</span>{page}
    </div>
  )
}

export function AnalyticsCoupons() {
  const { state } = useApp()
  const navTo = useNavigate()

  const couponData = useMemo(() => {
    return state.coupons.map(c => {
      const discount = c.discountType === 'percent'
        ? c.amount
        : parseFloat(c.amount)
      return {
        ...c,
        discountDisplay: c.discountType === 'percent' ? `${c.amount}%` : fmt(c.amount),
        totalDiscount: c.discountType === 'percent'
          ? (c.usageCount * discount * 0.5)
          : (c.usageCount * discount),
      }
    }).sort((a, b) => b.usageCount - a.usageCount)
  }, [state.coupons])

  const totalOrders = couponData.reduce((s, c) => s + c.usageCount, 0)
  const totalAmount = couponData.reduce((s, c) => s + c.totalDiscount, 0)

  return (
    <div>
      <Breadcrumb page="Coupons" />
      <div className="wp-page-title"><h1>Coupons</h1></div>

      <div className="wc-summary-cards">
        {[
          { label: 'Coupons Used', value: totalOrders, change: 12.4 },
          { label: 'Discount Amount', value: fmt(totalAmount), change: 8.1 },
          { label: 'Active Coupons', value: state.coupons.filter(c => !c.dateExpires || new Date(c.dateExpires) > new Date()).length, change: 0 },
        ].map((m, i) => (
          <div key={i} className="wc-summary-card">
            <div className="wc-summary-card-label">{m.label}</div>
            <div className="wc-summary-card-value">{m.value}</div>
            <div className={`wc-summary-card-change ${m.change >= 0 ? 'positive' : 'negative'}`}>
              {m.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(m.change).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      <div className="wc-card">
        <div className="wc-card-header">
          <span>Coupon Usage</span>
          <button className="button" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => {
            const csv = 'Code,Type,Discount,Usage Count,Total Discount\n' + couponData.map(c =>
              `${c.code},${c.discountType},${c.discountDisplay},${c.usageCount},${c.totalDiscount.toFixed(2)}`
            ).join('\n')
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'coupons-analytics.csv'; a.click()
          }}><Download size={14} /> Download</button>
        </div>
        <table className="wp-list-table" style={{ border: 'none' }}>
          <thead>
            <tr>
              <th>Coupon Code</th><th>Type</th><th>Discount</th><th>Usage Count</th><th>Total Discount</th><th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {couponData.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#646970' }}>No coupon data available.</td></tr>
            ) : couponData.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600, textTransform: 'uppercase', color: '#2271b1' }}>{c.code}</td>
                <td style={{ fontSize: 12 }}>{c.discountType === 'percent' ? 'Percentage' : c.discountType === 'fixed_cart' ? 'Fixed cart' : 'Fixed product'}</td>
                <td>{c.discountDisplay}</td>
                <td>{c.usageCount}</td>
                <td>{fmt(c.totalDiscount)}</td>
                <td style={{ fontSize: 12, color: '#646970' }}>{c.dateExpires ? format(new Date(c.dateExpires), 'MMM d, yyyy') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AnalyticsTaxes() {
  const { state } = useApp()
  const summary = state.analytics.revenueSummary
  const taxRate = 0.08

  const taxByDay = state.analytics.dailyData.map(d => ({
    date: d.date,
    orders: d.ordersCount,
    taxable: d.grossRevenue,
    tax: d.taxes || d.grossRevenue * taxRate,
    shipping: d.shipping * 0.05,
  }))

  const totalTax = taxByDay.reduce((s, d) => s + d.tax, 0)
  const totalShippingTax = taxByDay.reduce((s, d) => s + d.shipping, 0)

  return (
    <div>
      <Breadcrumb page="Taxes" />
      <div className="wp-page-title"><h1>Taxes</h1></div>

      <div className="wc-summary-cards">
        {[
          { label: 'Total Tax', value: fmt(totalTax), change: 4.2 },
          { label: 'Order Tax', value: fmt(totalTax - totalShippingTax), change: 3.8 },
          { label: 'Shipping Tax', value: fmt(totalShippingTax), change: 5.1 },
        ].map((m, i) => (
          <div key={i} className="wc-summary-card">
            <div className="wc-summary-card-label">{m.label}</div>
            <div className="wc-summary-card-value">{m.value}</div>
            <div className="wc-summary-card-change positive"><TrendingUp size={12} /> {m.change}%</div>
          </div>
        ))}
      </div>

      <div className="wc-card">
        <div className="wc-card-header">
          <span>Tax collected by day</span>
          <button className="button" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => {
            const csv = 'Date,Orders,Taxable Amount,Tax,Shipping Tax\n' + taxByDay.map(d =>
              `${d.date},${d.orders},${d.taxable.toFixed(2)},${d.tax.toFixed(2)},${d.shipping.toFixed(2)}`
            ).join('\n')
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'taxes-analytics.csv'; a.click()
          }}><Download size={14} /> Download</button>
        </div>
        <table className="wp-list-table" style={{ border: 'none' }}>
          <thead><tr><th>Date</th><th>Orders</th><th>Taxable Amount</th><th>Tax Collected</th><th>Shipping Tax</th></tr></thead>
          <tbody>
            {taxByDay.map(d => (
              <tr key={d.date}>
                <td>{format(new Date(d.date), 'MMM d, yyyy')}</td>
                <td style={{ color: '#2271b1' }}>{d.orders}</td>
                <td>{fmt(d.taxable)}</td>
                <td>{fmt(d.tax)}</td>
                <td>{fmt(d.shipping)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AnalyticsDownloads() {
  const { state } = useApp()

  const downloadProducts = state.products.filter(p => p.type === 'simple' && p.virtual).slice(0, 5)
  const downloads = downloadProducts.length > 0 ? downloadProducts : state.products.slice(0, 3).map(p => ({
    ...p,
    downloadCount: Math.floor(p.totalSales * 0.3),
  }))

  return (
    <div>
      <Breadcrumb page="Downloads" />
      <div className="wp-page-title"><h1>Downloads</h1></div>

      <div className="wc-summary-cards">
        {[
          { label: 'Downloads', value: downloads.reduce((s, d) => s + (d.downloadCount || d.totalSales || 0), 0), change: 15.3 },
        ].map((m, i) => (
          <div key={i} className="wc-summary-card">
            <div className="wc-summary-card-label">{m.label}</div>
            <div className="wc-summary-card-value">{m.value}</div>
            <div className="wc-summary-card-change positive"><TrendingUp size={12} /> {m.change}%</div>
          </div>
        ))}
      </div>

      <div className="wc-card">
        <div className="wc-card-header"><span>Downloads</span></div>
        {downloads.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#646970' }}>No downloadable products found.</div>
        ) : (
          <table className="wp-list-table" style={{ border: 'none' }}>
            <thead><tr><th>Product</th><th>Downloads</th><th>Status</th></tr></thead>
            <tbody>
              {downloads.map(p => (
                <tr key={p.id}>
                  <td style={{ color: '#2271b1' }}>{p.name}</td>
                  <td>{p.downloadCount || p.totalSales || 0}</td>
                  <td><span className={`stock-${p.stockStatus || 'instock'}`} style={{ fontSize: 12 }}>{p.stockStatus === 'instock' ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export function AnalyticsStock() {
  const { state } = useApp()

  const stockData = useMemo(() => {
    return state.products.filter(p => p.status === 'publish').map(p => ({
      ...p,
      stockLevel: p.stockQuantity !== null ? p.stockQuantity : (p.stockStatus === 'instock' ? 999 : 0),
    })).sort((a, b) => a.stockLevel - b.stockLevel)
  }, [state.products])

  const inStock = stockData.filter(p => p.stockStatus === 'instock').length
  const lowStock = stockData.filter(p => p.manageStock && p.stockQuantity !== null && p.stockQuantity > 0 && p.stockQuantity < 10).length
  const outOfStock = stockData.filter(p => p.stockStatus === 'outofstock' || (p.manageStock && p.stockQuantity === 0)).length

  return (
    <div>
      <Breadcrumb page="Stock" />
      <div className="wp-page-title"><h1>Stock</h1></div>

      <div className="wc-summary-cards">
        {[
          { label: 'In Stock', value: inStock, change: 0 },
          { label: 'Low Stock', value: lowStock, change: lowStock > 0 ? -8.2 : 0 },
          { label: 'Out of Stock', value: outOfStock, change: outOfStock > 0 ? 2.1 : 0 },
        ].map((m, i) => (
          <div key={i} className="wc-summary-card">
            <div className="wc-summary-card-label">{m.label}</div>
            <div className="wc-summary-card-value">{m.value}</div>
            {m.change !== 0 && (
              <div className={`wc-summary-card-change ${m.change >= 0 ? 'positive' : 'negative'}`}>
                {m.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(m.change)}%
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="wc-card">
        <div className="wc-card-header">
          <span>Product Stock Levels</span>
          <button className="button" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => {
            const csv = 'Product,SKU,Status,Stock,Category\n' + stockData.map(p =>
              `"${p.name}",${p.sku || ''},${p.stockStatus},${p.stockQuantity ?? 'N/A'},"${p.categories.map(c => c.name).join('; ')}"`
            ).join('\n')
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'stock-analytics.csv'; a.click()
          }}><Download size={14} /> Download</button>
        </div>
        <table className="wp-list-table" style={{ border: 'none' }}>
          <thead><tr><th>Product</th><th>SKU</th><th>Status</th><th>Stock</th><th>Category</th></tr></thead>
          <tbody>
            {stockData.map(p => (
              <tr key={p.id}>
                <td style={{ color: '#2271b1' }}>{p.name}</td>
                <td style={{ fontSize: 12, color: '#646970' }}>{p.sku || '-'}</td>
                <td>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 3,
                    background: p.stockStatus === 'outofstock' ? '#eba3a3' : p.stockQuantity !== null && p.stockQuantity < 10 ? '#fff3cd' : '#d4edda',
                    color: p.stockStatus === 'outofstock' ? '#761919' : p.stockQuantity !== null && p.stockQuantity < 10 ? '#856404' : '#155724',
                  }}>
                    {p.stockStatus === 'outofstock' ? 'Out of stock' : p.stockQuantity !== null && p.stockQuantity < 10 ? 'Low stock' : 'In stock'}
                  </span>
                </td>
                <td>{p.manageStock && p.stockQuantity !== null ? p.stockQuantity : '-'}</td>
                <td style={{ fontSize: 12 }}>{p.categories.map(c => c.name).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AnalyticsCustomers() {
  const { state } = useApp()

  const customerData = useMemo(() => {
    return state.customers.map(c => {
      const customerOrders = state.orders.filter(o =>
        o.billing.email === c.email || o.customerId === c.id
      )
      return {
        ...c,
        orderCount: customerOrders.length || c.ordersCount || 0,
        totalSpent: customerOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0) || parseFloat(c.totalSpent || 0),
        avgOrder: customerOrders.length ? customerOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0) / customerOrders.length : parseFloat(c.totalSpent || 0) / Math.max(c.ordersCount || 1, 1),
      }
    }).sort((a, b) => b.totalSpent - a.totalSpent)
  }, [state.customers, state.orders])

  const totalCustomers = customerData.length
  const totalRevenue = customerData.reduce((s, c) => s + c.totalSpent, 0)
  const avgOrderValue = totalCustomers > 0 ? totalRevenue / customerData.reduce((s, c) => s + c.orderCount, 0) : 0

  return (
    <div>
      <Breadcrumb page="Customers" />
      <div className="wp-page-title"><h1>Customers</h1></div>

      <div className="wc-summary-cards">
        {[
          { label: 'Total Customers', value: totalCustomers, change: 6.2 },
          { label: 'Total Revenue', value: fmt(totalRevenue), change: 4.8 },
          { label: 'Avg Order Value', value: fmt(avgOrderValue), change: 2.1 },
        ].map((m, i) => (
          <div key={i} className="wc-summary-card">
            <div className="wc-summary-card-label">{m.label}</div>
            <div className="wc-summary-card-value">{m.value}</div>
            <div className="wc-summary-card-change positive"><TrendingUp size={12} /> {m.change}%</div>
          </div>
        ))}
      </div>

      <div className="wc-card">
        <div className="wc-card-header">
          <span>Customers</span>
          <button className="button" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => {
            const csv = 'Name,Email,Orders,Total Spent,Avg Order,Country\n' + customerData.map(c =>
              `"${c.firstName} ${c.lastName}",${c.email},${c.orderCount},${c.totalSpent.toFixed(2)},${c.avgOrder.toFixed(2)},${c.billing?.country || ''}`
            ).join('\n')
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'customers-analytics.csv'; a.click()
          }}><Download size={14} /> Download</button>
        </div>
        <table className="wp-list-table" style={{ border: 'none' }}>
          <thead><tr><th>Customer</th><th>Email</th><th>Orders</th><th>Total Spent</th><th>Avg Order</th><th>Country</th></tr></thead>
          <tbody>
            {customerData.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.firstName} {c.lastName}</td>
                <td style={{ fontSize: 12, color: '#2271b1' }}>{c.email}</td>
                <td>{c.orderCount}</td>
                <td>{fmt(c.totalSpent)}</td>
                <td>{fmt(c.avgOrder)}</td>
                <td style={{ fontSize: 12 }}>{c.billing?.country || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AnalyticsSettings() {
  const [dateType, setDateType] = useState('last_month')
  const [compare, setCompare] = useState('previous_year')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <Breadcrumb page="Settings" />
      <div className="wp-page-title"><h1>Analytics Settings</h1></div>

      {saved && (
        <div className="notice notice-success" style={{ marginBottom: 16 }}>
          <span>Settings saved successfully.</span>
        </div>
      )}

      <div className="wc-card">
        <div className="wc-card-header">Default Date Range</div>
        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>Default date range</label>
            <select value={dateType} onChange={e => setDateType(e.target.value)} style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #8c8f94', fontSize: 13, minWidth: 200 }}>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week_to_date">Week to date</option>
              <option value="last_week">Last week</option>
              <option value="month_to_date">Month to date</option>
              <option value="last_month">Last month</option>
              <option value="quarter_to_date">Quarter to date</option>
              <option value="last_quarter">Last quarter</option>
              <option value="year_to_date">Year to date</option>
              <option value="last_year">Last year</option>
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>Compare to</label>
            <select value={compare} onChange={e => setCompare(e.target.value)} style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #8c8f94', fontSize: 13, minWidth: 200 }}>
              <option value="previous_year">Previous year</option>
              <option value="previous_period">Previous period</option>
            </select>
          </div>
          <button className="button-primary" onClick={handleSave}>Save Settings</button>
        </div>
      </div>

      <div className="wc-card" style={{ marginTop: 16 }}>
        <div className="wc-card-header">Excluded Statuses</div>
        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 13, color: '#646970', marginBottom: 12 }}>Select order statuses to exclude from analytics reports.</p>
          {['Pending payment', 'Cancelled', 'Refunded', 'Failed'].map(status => (
            <label key={status} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13 }}>
              <input type="checkbox" defaultChecked={status === 'Failed' || status === 'Cancelled'} />
              {status}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
