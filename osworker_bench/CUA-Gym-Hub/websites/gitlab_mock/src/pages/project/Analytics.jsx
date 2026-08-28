import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const commitData = [
  { name: 'Mon', commits: 4 },
  { name: 'Tue', commits: 7 },
  { name: 'Wed', commits: 2 },
  { name: 'Thu', commits: 12 },
  { name: 'Fri', commits: 8 },
  { name: 'Sat', commits: 1 },
  { name: 'Sun', commits: 0 },
];

const pipelineData = [
  { name: 'Mon', duration: 120 },
  { name: 'Tue', duration: 150 },
  { name: 'Wed', duration: 90 },
  { name: 'Thu', duration: 200 },
  { name: 'Fri', duration: 180 },
];

export default function Analytics() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Commit Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="commits" fill="#6b4fbb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Pipeline Duration (seconds)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="duration" stroke="#108548" strokeWidth={2} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}