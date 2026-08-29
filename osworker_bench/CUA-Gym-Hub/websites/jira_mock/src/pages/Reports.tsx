import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { differenceInDays } from 'date-fns';
import { Breadcrumb } from '../components/Breadcrumb';

export const Reports: React.FC = () => {
  const { state } = useStore();
  const activeSprint = state.sprints.find((s) => s.state === 'active');

  // --- Burndown Data ---
  const burndownData = [
    { day: 'Day 1', remaining: 40 },
    { day: 'Day 2', remaining: 38 },
    { day: 'Day 3', remaining: 35 },
    { day: 'Day 4', remaining: 30 },
    { day: 'Day 5', remaining: 28 },
    { day: 'Day 6', remaining: 22 },
    { day: 'Day 7', remaining: 15 },
  ];

  // --- Velocity Chart Data ---
  const velocityData = state.sprints
    .filter((s) => s.state === 'closed' || s.state === 'active')
    .map((sprint) => {
      const sprintIssues = state.issues.filter(
        (i) => i.sprintId === sprint.id
      );
      const committed = sprintIssues.reduce(
        (acc, i) => acc + (i.storyPoints || 0),
        0
      );
      const completed = sprintIssues
        .filter((i) => i.status === 'Done')
        .reduce((acc, i) => acc + (i.storyPoints || 0), 0);

      return {
        name: sprint.name,
        committed,
        completed,
      };
    });

  // --- Sprint Report Data ---
  const activeSprintIssues = activeSprint
    ? state.issues.filter((i) => i.sprintId === activeSprint.id)
    : [];

  const completedIssues = activeSprintIssues.filter(
    (i) => i.status === 'Done'
  );
  const inProgressIssues = activeSprintIssues.filter(
    (i) => i.status === 'In Progress' || i.status === 'In Review'
  );
  const todoIssues = activeSprintIssues.filter(
    (i) => i.status === 'To Do'
  );

  const completedPoints = completedIssues.reduce(
    (acc, i) => acc + (i.storyPoints || 0),
    0
  );
  const inProgressPoints = inProgressIssues.reduce(
    (acc, i) => acc + (i.storyPoints || 0),
    0
  );
  const todoPoints = todoIssues.reduce(
    (acc, i) => acc + (i.storyPoints || 0),
    0
  );
  const totalPoints = completedPoints + inProgressPoints + todoPoints;
  const completionPercentage =
    totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  const donutData = [
    { name: 'Completed', value: completedPoints, color: '#36B37E' },
    { name: 'In Progress', value: inProgressPoints, color: '#0052CC' },
    { name: 'To Do', value: todoPoints, color: '#DFE1E6' },
  ].filter((d) => d.value > 0);

  const daysRemaining = activeSprint
    ? Math.max(
        0,
        differenceInDays(new Date(activeSprint.endDate), new Date())
      )
    : 0;

  return (
    <div className="p-8 h-full overflow-y-auto">
      <Breadcrumb pageName="Reports" />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

      {/* Burndown Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Burndown Chart
            </h2>
            <p className="text-sm text-gray-500">
              Track the remaining work for{' '}
              {activeSprint?.name || 'Active Sprint'}
            </p>
          </div>
        </div>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={burndownData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorRemaining"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#DE350B"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#DE350B"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="remaining"
                stroke="#DE350B"
                fillOpacity={1}
                fill="url(#colorRemaining)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Velocity Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800">
            Velocity Chart
          </h2>
          <p className="text-sm text-gray-500">
            Story points committed vs completed per sprint
          </p>
        </div>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={velocityData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="committed"
                fill="#DFE1E6"
                name="Committed"
                barSize={30}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="completed"
                fill="#36B37E"
                name="Completed"
                barSize={30}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sprint Report */}
      {activeSprint && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              Sprint Report
            </h2>
            <p className="text-sm text-gray-500">
              Summary for {activeSprint.name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sprint Info */}
            <div>
              <div className="mb-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Goal:
                  </span>
                  <span className="text-sm text-gray-600">
                    {activeSprint.goal || 'No goal set'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Dates:
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(
                      activeSprint.startDate
                    ).toLocaleDateString()}{' '}
                    -{' '}
                    {new Date(
                      activeSprint.endDate
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Days Remaining:
                  </span>
                  <span className="text-sm font-bold text-xira-blue">
                    {daysRemaining}
                  </span>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500 font-medium">
                      Category
                    </th>
                    <th className="text-right py-2 text-gray-500 font-medium">
                      Issues
                    </th>
                    <th className="text-right py-2 text-gray-500 font-medium">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-green-700 font-medium">
                      Completed
                    </td>
                    <td className="py-2 text-right">
                      {completedIssues.length}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {completedPoints}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-blue-700 font-medium">
                      In Progress
                    </td>
                    <td className="py-2 text-right">
                      {inProgressIssues.length}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {inProgressPoints}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-gray-600 font-medium">
                      To Do
                    </td>
                    <td className="py-2 text-right">
                      {todoIssues.length}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {todoPoints}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-400 font-medium">
                      Removed
                    </td>
                    <td className="py-2 text-right">0</td>
                    <td className="py-2 text-right font-medium">0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Donut Chart */}
            <div className="flex flex-col items-center justify-center">
              <div className="h-[200px] w-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {completionPercentage}%
                    </div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-xira-green"></div>
                  Done
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-xira-blue"></div>
                  In Progress
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-xira-border"></div>
                  To Do
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
