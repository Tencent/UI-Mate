import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, ShoppingCart, Mail, AlertTriangle, Package, Plus, BarChart3, Shield, Tag, MessageSquare, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

function fmt(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtPct(n, sign = true) { return (sign && n >= 0 ? '+' : '') + n.toFixed(1) + '%'; }

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState('7');

  if (!state) return null;

  const { salesData, orders, messages, returns, accountHealth, notifications, seller, products } = state;
  const today = salesData.dailySnapshots[salesData.dailySnapshots.length - 1];
  const yesterday = salesData.dailySnapshots[salesData.dailySnapshots.length - 2];

  const salesChange = yesterday ? ((today.orderedProductSales - yesterday.orderedProductSales) / yesterday.orderedProductSales) * 100 : 0;
  const unitsChange = yesterday ? ((today.unitsOrdered - yesterday.unitsOrdered) / yesterday.unitsOrdered) * 100 : 0;

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const unshippedOrders = orders.filter(o => o.status === 'Unshipped').length;
  const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
  const unansweredMessages = [...new Set(messages.filter(m => m.status === 'Unanswered' && m.sender === 'buyer').map(m => m.threadId))].length;
  const pendingReturns = returns.filter(r => r.status === 'Pending').length;
  const lowInventory = products.filter(p => p.availableQuantity < 10 && p.status === 'Active').length;

  // Chart data
  const days = parseInt(chartRange);
  const snapshots = salesData.dailySnapshots.slice(-days);
  const prevSnapshots = salesData.dailySnapshots.slice(-(days * 2), -days);
  const chartData = snapshots.map((s, i) => ({
    date: s.date.slice(5),
    sales: s.orderedProductSales,
    prevSales: prevSnapshots[i] ? prevSnapshots[i].orderedProductSales : null
  }));

  const healthColor = accountHealth.overallRating === 'Good' ? '#067d62' : accountHealth.overallRating === 'At Risk' ? '#b7791f' : '#d13212';

  const quickLinks = [
    { label: 'Add a Product', icon: Plus, to: '/catalog/add-product' },
    { label: 'Manage Inventory', icon: Package, to: '/inventory' },
    { label: 'Manage Orders', icon: ShoppingCart, to: '/orders' },
    { label: 'Advertising', icon: Tag, to: '/advertising' },
    { label: 'Business Reports', icon: BarChart3, to: '/reports' },
    { label: 'Account Health', icon: Shield, to: '/account-health' }
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 16px', lineHeight: '32px' }}>
        Summary
      </h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Today's Sales</div>
          <div style={{ fontSize: 24, fontWeight: 700, lineHeight: '32px' }}>{fmt(today.orderedProductSales)}</div>
          <div style={{ fontSize: 12, color: salesChange >= 0 ? '#067d62' : '#d13212', display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
            {salesChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {fmtPct(salesChange)} vs yesterday
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Orders</div>
          <div style={{ fontSize: 24, fontWeight: 700, lineHeight: '32px' }}>{orders.filter(o => o.status !== 'Cancelled').length}</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
            {pendingOrders} Pending | {unshippedOrders} Unshipped | {shippedOrders} Shipped
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Units Ordered</div>
          <div style={{ fontSize: 24, fontWeight: 700, lineHeight: '32px' }}>{today.unitsOrdered}</div>
          <div style={{ fontSize: 12, color: unitsChange >= 0 ? '#067d62' : '#d13212', display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
            {unitsChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {fmtPct(unitsChange)} vs yesterday
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Buyer Messages</div>
          <div style={{ fontSize: 24, fontWeight: 700, lineHeight: '32px' }}>{seller.unreadMessages}</div>
          {unansweredMessages > 0 && (
            <div style={{ fontSize: 12, color: '#ff9900', marginTop: 2 }}>{unansweredMessages} require response</div>
          )}
        </div>
      </div>

      {/* Account Health Banner */}
      <div className={`alert alert-${accountHealth.overallRating === 'Good' ? 'success' : accountHealth.overallRating === 'At Risk' ? 'warning' : 'error'}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: healthColor, flexShrink: 0 }} />
          <span><strong>Account Health:</strong> {accountHealth.overallRating} — Account Health Rating: {accountHealth.accountHealthRating}/1000</span>
        </div>
        <Link to="/account-health" style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>View Account Health →</Link>
      </div>

      {/* Sales Chart */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="card-title" style={{ marginBottom: 0 }}>Sales Overview</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['7', '30', '90'].map(d => (
              <button key={d} onClick={() => setChartRange(d)}
                style={{ padding: '4px 10px', fontSize: 12, cursor: 'pointer', border: '1px solid #ddd', borderRadius: 3, background: chartRange === d ? 'white' : 'white', borderBottom: chartRange === d ? '3px solid #ff9900' : '1px solid #ddd', fontWeight: chartRange === d ? 700 : 400 }}>
                {d} Days
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => '$' + (v/1000).toFixed(1) + 'k'} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [fmt(v), '']} />
            <Legend />
            <Line type="monotone" dataKey="sales" name="Sales" stroke="#ff9900" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="prevSales" name="Previous Period" stroke="#adb1b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Action Items + Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: 16 }}>
        {/* Action Items */}
        <div className="card">
          <div className="card-title">Action Items</div>
          {[
            { label: 'Unshipped orders', count: unshippedOrders, to: '/orders?status=Unshipped', icon: Package, color: unshippedOrders > 0 ? '#d13212' : '#111' },
            { label: 'Buyer messages awaiting reply', count: unansweredMessages, to: '/messages', icon: MessageSquare, color: unansweredMessages > 0 ? '#d13212' : '#111' },
            { label: 'Return requests pending', count: pendingReturns, to: '/returns', icon: RotateCcw, color: pendingReturns > 0 ? '#b7791f' : '#111' },
            { label: 'Low inventory alerts', count: lowInventory, to: '/inventory/planning', icon: AlertTriangle, color: lowInventory > 0 ? '#b7791f' : '#111' }
          ].map((item, i) => (
            <div key={i} onClick={() => navigate(item.to)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 3 ? '1px solid #eee' : 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f7feff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <item.icon size={16} color={item.color} />
                <Link to={item.to} style={{ fontWeight: 400, color: '#0066c0' }}>{item.label}</Link>
              </div>
              <span style={{ background: '#ff9900', color: '#111', fontSize: 12, fontWeight: 700, padding: '1px 8px', borderRadius: 10, minWidth: 24, textAlign: 'center' }}>
                {item.count}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="card">
          <div className="card-title">Quick Links</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {quickLinks.map((ql, i) => (
              <div key={i} onClick={() => navigate(ql.to)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 8px', border: '1px solid #eee', borderRadius: 4, cursor: 'pointer', textAlign: 'center', gap: 6 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e6f7f9'; e.currentTarget.style.borderColor = '#007185'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#eee'; }}>
                <ql.icon size={20} color="#232f3e" />
                <span style={{ fontSize: 12, color: '#0066c0', lineHeight: '14px' }}>{ql.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
