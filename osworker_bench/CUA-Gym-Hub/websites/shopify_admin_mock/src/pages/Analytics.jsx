
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format, subDays } from 'date-fns';

const rangePeriods = [
  { label: 'Today', days: 1 },
  { label: 'Yesterday', days: 1, offset: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export default function Analytics() {
  const { state } = useStore();
  const dailyMetrics = state.analytics?.dailyMetrics || [];
  const [rangeIdx, setRangeIdx] = useState(3); // default: Last 30 days

  // Build synthetic metrics from orders if dailyMetrics is empty
  const syntheticMetrics = useMemo(() => {
    if (dailyMetrics.length > 0) return dailyMetrics;
    const orders = state.orders || [];
    const byDate = {};
    orders.forEach(order => {
      const dateStr = order.createdAt?.slice(0, 10);
      if (!dateStr) return;
      if (!byDate[dateStr]) byDate[dateStr] = { date: dateStr, totalSales: 0, ordersCount: 0, onlineStoreSessions: 0, returningCustomerRate: 0.2, conversionRate: 0.03, averageOrderValue: 0, topProducts: [], topReferrers: [], sessionsByLocation: [] };
      byDate[dateStr].totalSales += parseFloat(order.totalPrice || 0);
      byDate[dateStr].ordersCount += 1;
      byDate[dateStr].onlineStoreSessions += Math.floor(Math.random() * 20 + 5);
    });
    return Object.values(byDate).map(d => ({ ...d, averageOrderValue: d.ordersCount > 0 ? d.totalSales / d.ordersCount : 0 }));
  }, [dailyMetrics, state.orders]);

  const data = useMemo(() => {
    const p = rangePeriods[rangeIdx];
    const now = new Date();
    const startDate = subDays(now, p.days + (p.offset || 0));
    const endDate = p.offset ? subDays(now, p.offset) : now;
    const prevStartDate = subDays(startDate, p.days);
    const prevEndDate = startDate;

    const currentMetrics = syntheticMetrics.filter(d => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });
    const prevMetrics = syntheticMetrics.filter(d => {
      const date = new Date(d.date);
      return date >= prevStartDate && date < prevEndDate;
    });

    const sumField = (arr, field) => arr.reduce((s, d) => s + (d[field] || 0), 0);
    const avgField = (arr, field) => arr.length ? sumField(arr, field) / arr.length : 0;

    const totalSales = sumField(currentMetrics, 'totalSales');
    const prevTotalSales = sumField(prevMetrics, 'totalSales');
    const sessions = sumField(currentMetrics, 'onlineStoreSessions');
    const prevSessions = sumField(prevMetrics, 'onlineStoreSessions');
    const returningRate = avgField(currentMetrics, 'returningCustomerRate');
    const prevReturningRate = avgField(prevMetrics, 'returningCustomerRate');
    const conversionRate = avgField(currentMetrics, 'conversionRate');
    const prevConversionRate = avgField(prevMetrics, 'conversionRate');
    const totalOrders = sumField(currentMetrics, 'ordersCount');
    const aov = totalOrders > 0 ? totalSales / totalOrders : 0;
    const prevTotalOrders = sumField(prevMetrics, 'ordersCount');
    const prevAov = prevTotalOrders > 0 ? prevTotalSales / prevTotalOrders : 0;

    const pctChange = (curr, prev) => prev > 0 ? ((curr - prev) / prev * 100) : 0;

    // Chart data
    const chartData = currentMetrics.map(d => ({
      date: format(new Date(d.date), 'MMM d'),
      sales: d.totalSales,
      sessions: d.onlineStoreSessions,
    }));

    // Top products (aggregate from all current metrics)
    const productMap = {};
    currentMetrics.forEach(d => {
      (d.topProducts || []).forEach(tp => {
        if (!productMap[tp.productId]) {
          productMap[tp.productId] = { title: tp.title, quantity: 0, revenue: 0 };
        }
        productMap[tp.productId].quantity += tp.quantity;
        productMap[tp.productId].revenue += tp.revenue;
      });
    });
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top referrers
    const referrerMap = {};
    currentMetrics.forEach(d => {
      (d.topReferrers || []).forEach(tr => {
        referrerMap[tr.source] = (referrerMap[tr.source] || 0) + tr.sessions;
      });
    });
    const topReferrers = Object.entries(referrerMap)
      .map(([source, sessions]) => ({ source, sessions }))
      .sort((a, b) => b.sessions - a.sessions);

    // Sessions by location
    const locationMap = {};
    currentMetrics.forEach(d => {
      (d.sessionsByLocation || []).forEach(sl => {
        locationMap[sl.country] = (locationMap[sl.country] || 0) + sl.sessions;
      });
    });
    const totalLocationSessions = Object.values(locationMap).reduce((s, v) => s + v, 0);
    const sessionsByLocation = Object.entries(locationMap)
      .map(([country, sess]) => ({ country, sessions: sess, pct: totalLocationSessions > 0 ? (sess / totalLocationSessions * 100).toFixed(1) : 0 }))
      .sort((a, b) => b.sessions - a.sessions);

    return {
      totalSales, salesChange: pctChange(totalSales, prevTotalSales),
      sessions, sessionsChange: pctChange(sessions, prevSessions),
      returningRate, returningChange: pctChange(returningRate, prevReturningRate),
      conversionRate, conversionChange: pctChange(conversionRate, prevConversionRate),
      aov, aovChange: pctChange(aov, prevAov),
      chartData, topProducts, topReferrers, sessionsByLocation,
    };
  }, [syntheticMetrics, rangeIdx]);

  const MetricCard = ({ title, value, change }) => {
    const isUp = change >= 0;
    return (
      <div className="card">
        <div className="text-[13px] text-[#616161] font-medium">{title}</div>
        <div className="text-[20px] font-bold text-[#303030] mt-1">{value}</div>
        <div className="flex items-center gap-1 mt-2 text-[12px]">
          {isUp ? <TrendingUp size={12} className="text-[#047b5d]" /> : <TrendingDown size={12} className="text-[#d72c0d]" />}
          <span className={isUp ? 'text-[#047b5d]' : 'text-[#d72c0d]'} style={{ fontWeight: 550 }}>
            {isUp ? '+' : ''}{change.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Analytics</h1>
        <div className="flex gap-1">
          {rangePeriods.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setRangeIdx(i)}
              className={`px-3 py-1 text-[12px] rounded-full transition-colors ${
                rangeIdx === i
                  ? 'bg-[#303030] text-white'
                  : 'text-[#616161] hover:bg-[#f0f0f0]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Total sales" value={`$${data.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} change={data.salesChange} />
        <MetricCard title="Sessions" value={data.sessions.toLocaleString()} change={data.sessionsChange} />
        <MetricCard title="Returning rate" value={`${(data.returningRate * 100).toFixed(1)}%`} change={data.returningChange} />
        <MetricCard title="Conversion rate" value={`${(data.conversionRate * 100).toFixed(2)}%`} change={data.conversionChange} />
        <MetricCard title="Avg. order value" value={`$${data.aov.toFixed(2)}`} change={data.aovChange} />
      </div>

      {/* Sales chart */}
      <div className="card">
        <h3 className="card-title mb-4">Sales over time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#008060" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#008060" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e3e3" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#616161' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#616161' }} tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
              <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Sales']} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              <Area type="monotone" dataKey="sales" stroke="#008060" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sessions chart */}
      <div className="card">
        <h3 className="card-title mb-4">Online store sessions</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e3e3" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#616161' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#616161' }} />
              <Tooltip formatter={(value) => [value, 'Sessions']} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="sessions" fill="#005bd3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="card">
          <h3 className="card-title mb-4">Top products</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p, i) => (
                <tr key={i}>
                  <td className="text-[#303030] font-medium">{p.title}</td>
                  <td className="text-[#616161]">{p.quantity}</td>
                  <td className="text-[#303030]">${p.revenue.toFixed(2)}</td>
                </tr>
              ))}
              {data.topProducts.length === 0 && (
                <tr><td colSpan="3" className="text-center text-[#616161] py-8">No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top referrers */}
        <div className="card">
          <h3 className="card-title mb-4">Top referrers</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Sessions</th>
              </tr>
            </thead>
            <tbody>
              {data.topReferrers.map((r, i) => (
                <tr key={i}>
                  <td className="text-[#303030] font-medium">{r.source}</td>
                  <td className="text-[#616161]">{r.sessions.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sessions by location */}
      <div className="card">
        <h3 className="card-title mb-4">Sessions by location</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Country</th>
              <th>Sessions</th>
              <th>% of total</th>
            </tr>
          </thead>
          <tbody>
            {data.sessionsByLocation.map((l, i) => (
              <tr key={i}>
                <td className="text-[#303030] font-medium">{l.country}</td>
                <td className="text-[#616161]">{l.sessions.toLocaleString()}</td>
                <td className="text-[#616161]">{l.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
