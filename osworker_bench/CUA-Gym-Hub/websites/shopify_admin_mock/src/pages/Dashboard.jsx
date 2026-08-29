
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { DollarSign, ShoppingBag, Users, TrendingUp, TrendingDown, ArrowRight, Plus, Eye, BarChart3, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { format, subDays, parseISO, isAfter, formatDistanceToNow } from 'date-fns';

const periods = [
  { label: 'Today', days: 1 },
  { label: 'Yesterday', days: 1, offset: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
];

function getFinancialBadge(status) {
  const map = {
    paid: 'badge-success',
    pending: 'badge-warning',
    partially_paid: 'badge-warning',
    refunded: 'badge-error',
    partially_refunded: 'badge-warning',
    voided: 'badge-info',
    authorized: 'badge-warning',
  };
  return map[status] || 'badge-info';
}

function getFulfillmentBadge(status) {
  if (!status) return 'badge-error';
  const map = {
    fulfilled: 'badge-success',
    partial: 'badge-warning',
    restocked: 'badge-info',
  };
  return map[status] || 'badge-info';
}

function getFulfillmentLabel(status) {
  if (!status) return 'Unfulfilled';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function Dashboard() {
  const { state } = useStore();
  const { analytics, orders } = state;
  const [period, setPeriod] = useState(2); // default: Last 7 days

  const dailyMetrics = analytics?.dailyMetrics || [];

  // Calculate metrics for selected period
  const metrics = useMemo(() => {
    const p = periods[period];
    const now = new Date();
    const startDate = subDays(now, p.days + (p.offset || 0));
    const endDate = p.offset ? subDays(now, p.offset) : now;

    // Previous period for comparison
    const prevStartDate = subDays(startDate, p.days);
    const prevEndDate = startDate;

    const currentMetrics = dailyMetrics.filter(d => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });

    const prevMetrics = dailyMetrics.filter(d => {
      const date = new Date(d.date);
      return date >= prevStartDate && date < prevEndDate;
    });

    const sumField = (arr, field) => arr.reduce((s, d) => s + (d[field] || 0), 0);
    const avgField = (arr, field) => arr.length ? sumField(arr, field) / arr.length : 0;

    const totalSales = sumField(currentMetrics, 'totalSales');
    const prevTotalSales = sumField(prevMetrics, 'totalSales');
    const totalOrders = sumField(currentMetrics, 'ordersCount');
    const prevTotalOrders = sumField(prevMetrics, 'ordersCount');
    const sessions = sumField(currentMetrics, 'onlineStoreSessions');
    const prevSessions = sumField(prevMetrics, 'onlineStoreSessions');
    const avgConversion = avgField(currentMetrics, 'conversionRate');
    const prevAvgConversion = avgField(prevMetrics, 'conversionRate');
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const prevAvgOrderValue = prevTotalOrders > 0 ? prevTotalSales / prevTotalOrders : 0;

    const pctChange = (curr, prev) => prev > 0 ? ((curr - prev) / prev * 100) : 0;

    return {
      totalSales,
      salesChange: pctChange(totalSales, prevTotalSales),
      totalOrders,
      ordersChange: pctChange(totalOrders, prevTotalOrders),
      sessions,
      sessionsChange: pctChange(sessions, prevSessions),
      conversionRate: avgConversion,
      conversionChange: pctChange(avgConversion, prevAvgConversion),
      avgOrderValue,
      aovChange: pctChange(avgOrderValue, prevAvgOrderValue),
      chartData: currentMetrics.map(d => ({
        date: format(new Date(d.date), 'MMM d'),
        sales: d.totalSales,
      })),
    };
  }, [dailyMetrics, period]);

  // Orders to fulfill
  const unfulfilledOrders = orders
    .filter(o => !o.fulfillmentStatus && o.financialStatus === 'paid')
    .slice(0, 5);

  // Recent timeline events across all orders
  const recentEvents = useMemo(() => {
    const allEvents = [];
    orders.forEach(order => {
      (order.timeline || []).forEach(evt => {
        allEvents.push({ ...evt, orderName: order.name, orderId: order.id });
      });
    });
    return allEvents
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [orders]);

  const StatCard = ({ title, value, change }) => {
    const isUp = change >= 0;
    return (
      <div className="card">
        <div className="text-[13px] text-[#616161] font-medium">{title}</div>
        <div className="text-[24px] font-bold text-[#303030] mt-1">{value}</div>
        <div className="flex items-center gap-1 mt-2 text-[13px]">
          {isUp ? (
            <TrendingUp size={14} className="text-[#047b5d]" />
          ) : (
            <TrendingDown size={14} className="text-[#d72c0d]" />
          )}
          <span className={isUp ? 'text-[#047b5d]' : 'text-[#d72c0d]'} style={{ fontWeight: 550 }}>
            {isUp ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="text-[#616161]">vs last period</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Quick actions */}
      <div className="flex items-center gap-3">
        <Link to="/products/new" className="btn-secondary text-[13px]">
          <Plus size={16} /> Add product
        </Link>
        <Link to="/orders" className="btn-secondary text-[13px]">
          <ShoppingBag size={16} /> Create order
        </Link>
        <Link to="/analytics" className="btn-secondary text-[13px]">
          <BarChart3 size={16} /> View analytics
        </Link>
      </div>

      {/* Sales summary card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title">Sales overview</h3>
          <div className="flex gap-1">
            {periods.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setPeriod(i)}
                className={`px-3 py-1 text-[12px] rounded-full transition-colors ${
                  period === i
                    ? 'bg-[#303030] text-white'
                    : 'text-[#616161] hover:bg-[#f0f0f0]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total sales"
            value={`$${metrics.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={metrics.salesChange}
          />
          <StatCard
            title="Online store sessions"
            value={metrics.sessions.toLocaleString()}
            change={metrics.sessionsChange}
          />
          <StatCard
            title="Conversion rate"
            value={`${(metrics.conversionRate * 100).toFixed(2)}%`}
            change={metrics.conversionChange}
          />
          <StatCard
            title="Average order value"
            value={`$${metrics.avgOrderValue.toFixed(2)}`}
            change={metrics.aovChange}
          />
        </div>

        {/* Chart */}
        {metrics.chartData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e3e3" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#616161' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#616161' }} tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Sales']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e3e3e3', fontSize: 13 }}
                />
                <Line type="monotone" dataKey="sales" stroke="#008060" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Orders to fulfill */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title">Orders to fulfill</h3>
          <span className="badge badge-warning">{unfulfilledOrders.length} unfulfilled</span>
        </div>
        {unfulfilledOrders.length === 0 ? (
          <p className="text-[13px] text-[#616161]">All orders are fulfilled. Great job!</p>
        ) : (
          <div className="space-y-2">
            {unfulfilledOrders.map(order => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f9fafb] transition-colors group"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-[#303030]">{order.name}</span>
                  <span className="text-[13px] text-[#616161]">
                    {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'No customer'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-[#303030]">${parseFloat(order.totalPrice).toFixed(2)}</span>
                  <ArrowRight size={16} className="text-[#616161] opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
            <Link to="/orders" className="btn-plain text-[13px] mt-2">
              View all orders <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="card">
        <h3 className="card-title mb-4">Recent activity</h3>
        {recentEvents.length === 0 ? (
          <p className="text-[13px] text-[#616161]">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {recentEvents.map((evt, i) => (
              <div key={evt.id || i} className="flex items-start gap-3 text-[13px]">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: '#f1f1f1' }}
                >
                  {evt.type === 'paid' ? (
                    <DollarSign size={14} className="text-[#047b5d]" />
                  ) : evt.type === 'fulfilled' ? (
                    <ShoppingBag size={14} className="text-[#005bd3]" />
                  ) : (
                    <Package size={14} className="text-[#616161]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#303030]">{evt.message}</p>
                  <p className="text-[#616161] text-[12px] mt-0.5">
                    {formatDistanceToNow(new Date(evt.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
