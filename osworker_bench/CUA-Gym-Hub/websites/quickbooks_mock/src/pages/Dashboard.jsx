import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { Pencil, ChevronRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { clsx } from 'clsx';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';

const COLORS = ['#14B8A6', '#0D6E6E', '#2CA01C', '#86EFAC', '#0077C5', '#F59E0B', '#D32F2F', '#6366F1'];

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtD(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Dashboard() {
  const { data } = useStore();
  const [activeTab, setActiveTab] = useState('overview');

  const now = new Date();
  const last30Start = subDays(now, 30);
  const last365Start = subDays(now, 365);

  // Invoice metrics
  const overdueInvoices = data.invoices.filter(i => i.status === 'Overdue');
  const openInvoices = data.invoices.filter(i => i.status === 'Sent');
  const paidLast30 = data.invoices.filter(i => i.status === 'Paid' && new Date(i.date) >= last30Start);
  const unpaidLast365 = data.invoices.filter(i => i.status !== 'Paid' && new Date(i.date) >= last365Start);
  const overdueTotal = overdueInvoices.reduce((s, i) => s + (i.total - (i.paidAmount || 0)), 0);
  const openTotal = openInvoices.reduce((s, i) => s + i.total, 0);
  const unpaidTotal = overdueTotal + openTotal;
  const paidTotal = paidLast30.reduce((s, i) => s + i.total, 0);

  // Bank balance
  const bankBalance = data.accounts.filter(a => a.type === 'Bank' || a.type === 'Credit Card')
    .reduce((s, a) => s + a.balance, 0);

  // P&L
  const totalIncome = data.invoices.reduce((s, i) => s + i.total, 0);
  const totalExpenses = data.expenses.reduce((s, e) => s + e.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  // Expense donut
  const expCat = {};
  data.expenses.forEach(e => { expCat[e.category] = (expCat[e.category] || 0) + e.amount; });
  const pieData = Object.entries(expCat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Sales line chart — last 30 days
  const monthDays = eachDayOfInterval({ start: last30Start, end: now });
  const salesByDay = {};
  monthDays.forEach(d => { salesByDay[format(d, 'MMM d')] = 0; });
  data.invoices.forEach(inv => {
    const key = format(new Date(inv.date), 'MMM d');
    if (salesByDay[key] !== undefined) salesByDay[key] += inv.total;
  });
  const salesData = Object.entries(salesByDay).map(([day, amount]) => ({ day, amount })).slice(-14);

  // Bank accounts
  const bankAccounts = data.accounts.filter(a => a.type === 'Bank' || a.type === 'Credit Card');
  const pendingByAccount = {};
  data.transactions.forEach(tx => {
    if (tx.status === 'pending') {
      pendingByAccount[tx.accountId] = (pendingByAccount[tx.accountId] || 0) + 1;
    }
  });

  // Invoice pipeline for status bar
  const estimates = data.estimates || [];
  const estTotal = estimates.reduce((s, e) => s + (e.total || 0), 0);
  const unbilledCount = data.invoices.filter(i => i.status === 'Draft').length;
  const unbilledTotal = data.invoices.filter(i => i.status === 'Draft').reduce((s, i) => s + i.total, 0);
  const pipelineTotal = estTotal + unbilledTotal + overdueTotal + openTotal + paidTotal || 1;

  const pipeline = [
    { label: 'ESTIMATES', amount: estTotal, count: estimates.length, color: '#6B7280', bg: 'bg-gray-400' },
    { label: 'UNBILLED', amount: unbilledTotal, count: unbilledCount, color: '#14B8A6', bg: 'bg-teal-500' },
    { label: 'OVERDUE', amount: overdueTotal, count: overdueInvoices.length, color: '#D32F2F', bg: 'bg-red-500' },
    { label: 'OPEN', amount: openTotal, count: openInvoices.length, color: '#0077C5', bg: 'bg-blue-500' },
    { label: 'PAID LAST 30 DAYS', amount: paidTotal, count: paidLast30.length, color: '#2CA01C', bg: 'bg-green-500' },
  ];

  // Open bills
  const openBills = data.bills ? data.bills.filter(b => b.status !== 'Paid') : [];
  const billsTotal = openBills.reduce((s, b) => s + b.total, 0);

  return (
    <div className="space-y-0">
      {/* Tab Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center">
          {[
            { key: 'overview', label: 'Business overview' },
            { key: 'todo', label: 'Get things done' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.key
                  ? 'border-qb-green text-qb-green'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-5 pt-5">
          {/* Invoice Status Pipeline Bar */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Invoices</h2>
              <span className="text-xs text-gray-400">${fmt(unpaidTotal)} UNPAID LAST 365 DAYS</span>
            </div>
            {/* Colored pipeline bar */}
            <div className="flex h-3 rounded-full overflow-hidden mb-4">
              {pipeline.map((seg, i) => {
                const pct = Math.max((seg.amount / pipelineTotal) * 100, seg.amount > 0 ? 2 : 0);
                return pct > 0 ? (
                  <div key={i} className={seg.bg} style={{ width: `${pct}%` }} title={seg.label} />
                ) : null;
              })}
            </div>
            {/* Pipeline segment labels */}
            <div className="grid grid-cols-5 gap-2">
              {pipeline.map((seg, i) => (
                <Link
                  key={i}
                  to="/sales/invoices"
                  className="text-center p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm font-bold text-gray-900">${fmt(seg.amount)}</div>
                  <div className="text-xs text-gray-500">{seg.count}</div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: seg.color }}>{seg.label}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top 3-column cards */}
          <div className="grid grid-cols-3 gap-5">
            {/* Bank Accounts */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800">Bank accounts</h3>
                <button className="text-gray-400 hover:text-gray-600"><Pencil className="w-3.5 h-3.5" /></button>
              </div>
              <div className="space-y-3">
                {bankAccounts.map(acc => (
                  <div key={acc.id} className="flex flex-col gap-0.5 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{acc.name}</span>
                      <Link to="/transactions" className={clsx('text-xs font-medium', pendingByAccount[acc.id] > 0 ? 'text-orange-600' : 'text-green-600')}>
                        {pendingByAccount[acc.id] > 0 ? `${pendingByAccount[acc.id]} to review` : '0 to review'}
                      </Link>
                    </div>
                    <div className="text-xs text-gray-400">Updated moments ago</div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Bank balance <span className="font-medium text-gray-800">${fmtD(acc.bankBalance || acc.balance)}</span></span>
                      <span className="text-gray-500">In XuickBooks <span className="font-medium text-gray-800">${fmtD(acc.balance)}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profit and Loss */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-800">Profit and Loss</h3>
                <select className="text-xs border-0 text-gray-500 focus:ring-0 pr-6 cursor-pointer">
                  <option>Last month</option>
                  <option>This month</option>
                  <option>This year</option>
                </select>
              </div>
              <div className={clsx('text-2xl font-bold mt-3 mb-0.5', netIncome >= 0 ? 'text-gray-900' : 'text-qb-red')}>
                ${fmtD(Math.abs(netIncome))}
              </div>
              <div className="text-xs text-gray-400 uppercase mb-4">NET INCOME FOR {format(now, 'MMMM').toUpperCase()}</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-green-500 flex-shrink-0" />
                  <span className="text-xs text-gray-500 flex-1">Income</span>
                  <span className="text-xs font-medium text-gray-800">${fmtD(totalIncome)}</span>
                  <Link to="/sales" className="text-xs text-orange-600 font-medium">{data.invoices.length} TO REVIEW</Link>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-teal-500 flex-shrink-0" />
                  <span className="text-xs text-gray-500 flex-1">Expenses</span>
                  <span className="text-xs font-medium text-gray-800">${fmtD(totalExpenses)}</span>
                  <Link to="/expenses" className="text-xs text-orange-600 font-medium">{data.expenses.length} TO REVIEW</Link>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${totalIncome > 0 ? Math.min((totalIncome / (totalIncome + totalExpenses)) * 100, 100) : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-800">Expenses</h3>
                <select className="text-xs border-0 text-gray-500 focus:ring-0 pr-6 cursor-pointer">
                  <option>Last month</option>
                  <option>This month</option>
                </select>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-3 mb-4">${fmtD(totalExpenses)}</div>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData.slice(0, 6)} innerRadius={28} outerRadius={52} dataKey="value" paddingAngle={2}>
                        {pieData.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5">
                  {pieData.slice(0, 5).map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-gray-600 truncate max-w-[80px]">{item.name}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-800">${fmt(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 2-column: Invoices + Sales */}
          <div className="grid grid-cols-2 gap-5">
            {/* Recent Invoices */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800">Recent Invoices</h3>
                <Link to="/sales/invoices" className="text-xs text-qb-blue hover:underline">See all</Link>
              </div>
              <div className="space-y-2">
                {data.invoices.slice(0, 6).map(inv => {
                  const customer = data.customers.find(c => c.id === inv.customerId);
                  return (
                    <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">#{inv.number} · Due {inv.dueDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">${fmtD(inv.total)}</div>
                        <span className={clsx('text-xs font-medium',
                          inv.status === 'Paid' ? 'text-green-600' :
                          inv.status === 'Overdue' ? 'text-red-600' :
                          inv.status === 'Partial' ? 'text-yellow-600' : 'text-gray-500'
                        )}>{inv.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400">Bills to pay: <span className="font-semibold text-gray-700">${fmtD(billsTotal)}</span></span>
                <Link to="/expenses/bills" className="text-xs text-qb-blue hover:underline">Pay bills <ChevronRight className="w-3 h-3 inline" /></Link>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-800">Sales</h3>
                <select className="text-xs border-0 text-gray-500 focus:ring-0 pr-6 cursor-pointer">
                  <option>Last month</option>
                  <option>This month</option>
                </select>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2 mb-0.5">${fmtD(totalIncome)}</div>
              <div className="text-xs text-gray-400 uppercase mb-4">LAST MONTH</div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={v => `$${fmtD(v)}`} contentStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="amount" stroke="#2CA01C" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="text-center pb-4">
            <Link to="/reports" className="text-sm text-qb-blue hover:underline">See all activity</Link>
          </div>
        </div>
      )}

      {activeTab === 'todo' && (
        <div className="py-12 text-center text-gray-400">
          <div className="text-lg font-semibold mb-2">Get things done</div>
          <p className="text-sm">Tasks and action items will appear here.</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            {overdueInvoices.length > 0 && (
              <Link to="/sales/invoices" className="bg-white border border-red-200 rounded-lg p-4 hover:bg-red-50 transition-colors">
                <div className="text-xs font-semibold text-red-600 uppercase mb-1">Action needed</div>
                <div className="text-sm font-medium text-gray-900">{overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''}</div>
                <div className="text-xs text-gray-400 mt-1">Total: ${fmtD(overdueTotal)}</div>
              </Link>
            )}
            {openBills.length > 0 && (
              <Link to="/expenses/bills" className="bg-white border border-orange-200 rounded-lg p-4 hover:bg-orange-50 transition-colors">
                <div className="text-xs font-semibold text-orange-600 uppercase mb-1">Bills to pay</div>
                <div className="text-sm font-medium text-gray-900">{openBills.length} open bill{openBills.length > 1 ? 's' : ''}</div>
                <div className="text-xs text-gray-400 mt-1">Total: ${fmtD(billsTotal)}</div>
              </Link>
            )}
            {data.transactions.filter(tx => tx.status === 'pending').length > 0 && (
              <Link to="/transactions" className="bg-white border border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                <div className="text-xs font-semibold text-blue-600 uppercase mb-1">To review</div>
                <div className="text-sm font-medium text-gray-900">{data.transactions.filter(tx => tx.status === 'pending').length} transactions</div>
                <div className="text-xs text-gray-400 mt-1">Needs categorization</div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
