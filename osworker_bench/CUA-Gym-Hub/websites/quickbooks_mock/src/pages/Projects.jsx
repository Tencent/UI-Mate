import React from 'react';
import { useStore } from '../lib/store';
import { clsx } from 'clsx';

export default function Projects() {
  const { data } = useStore();

  const totalBudget = data.projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = data.projects.reduce((s, p) => s + p.spent, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-qb-text-primary">Projects</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Projects</div>
          <div className="text-2xl font-bold text-gray-900">{data.projects.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Budget</div>
          <div className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.projects.map(project => {
              const customer = data.customers.find(c => c.id === project.customerId);
              const remaining = project.budget - project.spent;
              const pctUsed = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
              return (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    {project.description && <div className="text-xs text-gray-400 max-w-xs truncate">{project.description}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      project.status === 'Completed' ? "bg-green-100 text-green-800" :
                      project.status === 'In Progress' ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.startDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.endDate || 'Ongoing'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">${project.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">${project.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1 ml-auto">
                      <div
                        className={clsx("h-1.5 rounded-full", pctUsed > 90 ? "bg-red-500" : pctUsed > 70 ? "bg-yellow-500" : "bg-qb-green")}
                        style={{ width: `${Math.min(pctUsed, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className={clsx("px-6 py-4 whitespace-nowrap text-right text-sm font-medium", remaining < 0 ? "text-red-600" : "text-gray-900")}>
                    {remaining < 0 ? '-' : ''}${Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
