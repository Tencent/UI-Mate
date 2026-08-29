import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';
import { TrendingUp, Users, DollarSign, Briefcase } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-green-600 font-medium flex items-center">
        <TrendingUp size={16} className="mr-1" /> {trend}
      </span>
      <span className="text-gray-400 ml-2">vs last month</span>
    </div>
  </div>
);

export default function Dashboard() {
  const { state } = useStore();

  const totalRevenue = state.deals.reduce((acc, deal) =>
    acc + (deal.stage === 'closed_won' ? (deal.amount || 0) : 0), 0);
  const openDeals = state.deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length;
  const pipelineValue = state.deals.reduce((acc, deal) =>
    acc + (deal.stage !== 'closed_lost' ? (deal.amount || 0) : 0), 0);

  const dealStages = state.dealStages || {};
  const dealStageData = Object.values(dealStages)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(stage => ({
      name: stage.label.length > 15 ? stage.label.slice(0, 14) + '…' : stage.label,
      deals: state.deals.filter(d => d.stage === stage.id).length,
      amount: state.deals.filter(d => d.stage === stage.id).reduce((s, d) => s + (d.amount || 0), 0),
    }));

  const activityData = [
    { name: 'Mon', calls: 4, emails: 24, meetings: 2 },
    { name: 'Tue', calls: 7, emails: 18, meetings: 4 },
    { name: 'Wed', calls: 5, emails: 32, meetings: 1 },
    { name: 'Thu', calls: 9, emails: 21, meetings: 5 },
    { name: 'Fri', calls: 3, emails: 15, meetings: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Contacts"
          value={state.contacts.length}
          icon={Users}
          trend="+12%"
          color="bg-blue-500"
        />
        <StatCard
          title="Revenue Closed"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="+8.2%"
          color="bg-green-500"
        />
        <StatCard
          title="Open Deals"
          value={openDeals}
          icon={Briefcase}
          trend="+5%"
          color="bg-xubspot"
        />
        <StatCard
          title="Pipeline Value"
          value={`$${pipelineValue.toLocaleString()}`}
          icon={TrendingUp}
          trend="+24%"
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Deal Pipeline by Stage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dealStageData} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f5f8fa' }}
                  formatter={(value, name) => [value, name === 'deals' ? 'Deals' : 'Amount']}
                />
                <Bar dataKey="deals" fill="#FF7A59" radius={[4, 4, 0, 0]} name="Deals" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="emails" stackId="1" stroke="#8884d8" fill="#8884d8" name="Emails" />
                <Area type="monotone" dataKey="calls" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Calls" />
                <Area type="monotone" dataKey="meetings" stackId="1" stroke="#ffc658" fill="#ffc658" name="Meetings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            ...state.tasks.filter(t => t.completedDate).map(t => ({
              type: 'task', text: `Task completed: "${t.title}"`,
              date: t.completedDate, icon: '✓'
            })),
            ...state.notes.map(n => ({
              type: 'note', text: `Note added: "${n.body.slice(0, 60)}..."`,
              date: n.createDate, icon: '📝'
            })),
            ...state.deals.filter(d => d.stage === 'closed_won').map(d => ({
              type: 'deal', text: `Deal closed won: "${d.name}" ($${(d.amount || 0).toLocaleString()})`,
              date: d.lastActivityDate, icon: '🏆'
            })),
          ]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8)
            .map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-base mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{item.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
