import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, CheckCircle2, Clock, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Issue } from '../types';
import { IssueModal } from '../components/IssueModal';

export const Dashboard: React.FC = () => {
  const { state } = useStore();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const statusData = [
    { name: 'To Do', value: state.issues.filter(i => i.status === 'To Do').length, color: '#DFE1E6' },
    { name: 'In Progress', value: state.issues.filter(i => i.status === 'In Progress').length, color: '#0052CC' },
    { name: 'In Review', value: state.issues.filter(i => i.status === 'In Review').length, color: '#00B8D9' },
    { name: 'Done', value: state.issues.filter(i => i.status === 'Done').length, color: '#36B37E' },
  ];

  const priorityData = [
    { name: 'High', value: state.issues.filter(i => i.priority === 'High' || i.priority === 'Highest').length },
    { name: 'Medium', value: state.issues.filter(i => i.priority === 'Medium').length },
    { name: 'Low', value: state.issues.filter(i => i.priority === 'Low' || i.priority === 'Lowest').length },
  ];

  const myIssues = state.issues.filter(i => i.assigneeId === state.currentUser.id && i.status !== 'Done');

  return (
    <div className="p-8 overflow-y-auto h-full bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">System Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Welcome Widget */}
        <div className="col-span-full bg-gradient-to-r from-xira-blue to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {state.currentUser.name}!</h2>
          <p className="opacity-90">You have {myIssues.length} issues assigned to you that need attention.</p>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-4">Issue Statistics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assigned to Me */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <UserIcon size={18} /> Assigned to Me
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {myIssues.length === 0 ? (
                <p className="text-gray-500 text-sm">No active issues assigned to you.</p>
            ) : (
                myIssues.map(issue => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 cursor-pointer"
                >
                    <div className={`w-2 h-2 rounded-full ${
                        issue.priority === 'High' || issue.priority === 'Highest' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{issue.summary}</p>
                    <p className="text-xs text-gray-500">{issue.key}</p>
                    </div>
                    <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-600">{issue.status}</span>
                </div>
                ))
            )}
          </div>
        </div>

        {/* Activity Stream */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Activity size={18} /> Recent Activity
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {state.comments.slice(0, 5).map(comment => {
                const user = state.users.find(u => u.id === comment.userId);
                const issue = state.issues.find(i => i.id === comment.issueId);
                return (
                    <div key={comment.id} className="flex gap-3 text-sm">
                        <img src={user?.avatar} className="w-8 h-8 rounded-full flex-shrink-0" />
                        <div>
                            <p className="text-gray-900">
                                <span className="font-semibold">{user?.name}</span> commented on <span className="text-xira-blue">{issue?.key}</span>
                            </p>
                            <p className="text-gray-500 text-xs mt-1">{formatDistanceToNow(new Date(comment.createdAt))} ago</p>
                        </div>
                    </div>
                );
            })}
             {state.comments.length === 0 && <p className="text-gray-500 text-sm">No recent activity.</p>}
          </div>
        </div>

        {/* Priority Bar Chart */}
        <div className="col-span-full md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="font-bold text-gray-700 mb-4">Issues by Priority</h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0052CC" barSize={20} radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>

      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};
