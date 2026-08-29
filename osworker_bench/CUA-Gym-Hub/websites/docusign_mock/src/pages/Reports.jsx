import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Send, CheckCircle, Clock, TrendingUp, Download } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, differenceInHours } from 'date-fns';
import { useToast } from '../components/Toast';
import { downloadReportCsv } from '../lib/utils';

const Reports = () => {
  const { state } = useStore();
  const { addToast } = useToast();
  const [showInfoModal, setShowInfoModal] = useState(null);
  const envelopes = state.envelopes;

  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const sentLast30 = envelopes.filter(e => e.sentAt && new Date(e.sentAt) >= thirtyDaysAgo).length;
  const completedTotal = envelopes.filter(e => e.status === 'completed').length;

  // Real avg completion time in hours (from sentAt to completedAt)
  const completedWithTimes = envelopes.filter(e =>
    e.status === 'completed' && e.sentAt && e.completedAt
  );
  let avgCompletionTimeDisplay = 'N/A';
  if (completedWithTimes.length > 0) {
    const totalHours = completedWithTimes.reduce((sum, e) => {
      return sum + differenceInHours(new Date(e.completedAt), new Date(e.sentAt));
    }, 0);
    const avgHours = totalHours / completedWithTimes.length;
    if (avgHours < 24) {
      avgCompletionTimeDisplay = `${Math.round(avgHours)}h`;
    } else {
      avgCompletionTimeDisplay = `${(avgHours / 24).toFixed(1)}d`;
    }
  }

  // Completion rate excludes drafts and voided
  const activeEnvelopes = envelopes.filter(e => e.status !== 'draft' && e.status !== 'voided');
  const completionRate = activeEnvelopes.length > 0
    ? Math.round((completedTotal / activeEnvelopes.length) * 100) : 0;

  // Status counts for bar chart
  const statuses = [
    { label: 'Draft', count: envelopes.filter(e => e.status === 'draft').length, color: 'bg-gray-400' },
    { label: 'Sent', count: envelopes.filter(e => e.status === 'sent' || e.status === 'delivered').length, color: 'bg-blue-500' },
    { label: 'Signed', count: envelopes.filter(e => e.status === 'signed').length, color: 'bg-yellow-500' },
    { label: 'Completed', count: completedTotal, color: 'bg-green-500' },
    { label: 'Voided', count: envelopes.filter(e => e.status === 'voided').length, color: 'bg-gray-600' },
    { label: 'Declined', count: envelopes.filter(e => e.status === 'declined').length, color: 'bg-red-500' },
  ];
  const maxCount = Math.max(...statuses.map(s => s.count), 1);

  // Real monthly data for last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const sent = envelopes.filter(e => e.sentAt && new Date(e.sentAt) >= start && new Date(e.sentAt) <= end).length;
    const completed = envelopes.filter(e => e.completedAt && new Date(e.completedAt) >= start && new Date(e.completedAt) <= end).length;
    return { label: format(d, 'MMM'), sent, completed };
  });
  const maxMonthly = Math.max(...last6Months.flatMap(m => [m.sent, m.completed]), 1);

  const cards = [
    { label: 'Envelopes Sent (30d)', value: sentLast30, icon: Send, color: 'text-blue-600', bg: 'bg-blue-50', info: 'Number of envelopes sent in the last 30 days.' },
    { label: 'Completed', value: completedTotal, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', info: 'Total number of envelopes that have been fully signed by all recipients.' },
    { label: 'Avg Completion Time', value: avgCompletionTimeDisplay, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', info: 'Average time from envelope sent to all signatures collected.' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', info: 'Percentage of sent envelopes that have been completed (drafts and voided excluded).' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={() => {
            downloadReportCsv(envelopes);
            addToast('Report exported', 'success');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <span className="text-sm text-gray-500">{card.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <button
                onClick={() => setShowInfoModal(card)}
                className="text-xs text-blue-600 hover:underline"
              >
                More Info
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart - Envelopes by Status */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Envelopes by Status</h2>
        <div className="space-y-3">
          {statuses.map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-24 text-right">{s.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full ${s.color} rounded-full flex items-center justify-end pr-2 transition-all`}
                  style={{ width: `${Math.max((s.count / maxCount) * 100, s.count > 0 ? 10 : 0)}%` }}
                >
                  {s.count > 0 && <span className="text-xs text-white font-medium">{s.count}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Line chart - Sent vs Completed over last 6 months (real data) */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Sent vs Completed (Last 6 Months)</h2>
        <div className="h-40 flex items-end gap-4 px-4">
          {last6Months.map((month) => {
            const sentH = (month.sent / maxMonthly) * 100;
            const compH = (month.completed / maxMonthly) * 100;
            return (
              <div key={month.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-1 h-32 w-full justify-center">
                  <div
                    className="w-4 bg-blue-400 rounded-t transition-all"
                    style={{ height: `${Math.max(sentH, month.sent > 0 ? 10 : 0)}%` }}
                    title={`Sent: ${month.sent}`}
                  />
                  <div
                    className="w-4 bg-green-400 rounded-t transition-all"
                    style={{ height: `${Math.max(compH, month.completed > 0 ? 10 : 0)}%` }}
                    title={`Completed: ${month.completed}`}
                  />
                </div>
                <span className="text-xs text-gray-500">{month.label}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded" />
            <span className="text-xs text-gray-600">Sent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded" />
            <span className="text-xs text-gray-600">Completed</span>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[380px]">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">{showInfoModal.label}</h3>
              <button onClick={() => setShowInfoModal(null)} className="text-gray-400 hover:text-gray-600">
                <span className="text-lg font-bold">×</span>
              </button>
            </div>
            <div className="p-6">
              <div className={`w-12 h-12 ${showInfoModal.bg} rounded-lg flex items-center justify-center mb-4`}>
                <showInfoModal.icon className={`w-6 h-6 ${showInfoModal.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">{showInfoModal.value}</p>
              <p className="text-sm text-gray-600">{showInfoModal.info}</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button onClick={() => setShowInfoModal(null)} className="px-4 py-2 text-sm bg-[#1A3763] text-white rounded-md hover:bg-[#15305a]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
