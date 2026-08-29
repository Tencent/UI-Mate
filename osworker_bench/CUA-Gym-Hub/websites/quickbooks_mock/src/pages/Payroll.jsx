import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export default function Payroll({ initialTab = 'overview' }) {
  const { data } = useStore();
  const [activeTab, setActiveTab] = useState(initialTab);

  const totalPayroll = data.employees.filter(e => e.isActive).reduce((sum, e) => sum + (e.salary / 26), 0);
  const activeEmployees = data.employees.filter(e => e.isActive);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-qb-text-primary">Payroll</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', path: '/payroll' },
            { key: 'employees', label: 'Employees', path: '/payroll/employees' },
            { key: 'contractors', label: 'Contractors', path: '/payroll/contractors' },
          ].map(tab => (
            <Link
              key={tab.key}
              to={tab.path}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm",
                activeTab === tab.key
                  ? "border-qb-green text-qb-green"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="text-sm font-medium text-gray-500 mb-1">Active Employees</div>
              <div className="text-2xl font-bold text-gray-900">{activeEmployees.length}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="text-sm font-medium text-gray-500 mb-1">Est. Bi-weekly Payroll</div>
              <div className="text-2xl font-bold text-gray-900">${totalPayroll.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="text-sm font-medium text-gray-500 mb-1">Annual Payroll</div>
              <div className="text-2xl font-bold text-gray-900">${activeEmployees.reduce((s, e) => s + e.salary, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          {/* Employees table on overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Employees</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Frequency</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Salary</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-400">{emp.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.payFrequency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">${emp.salary.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Freq.</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.startDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.payFrequency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">${emp.salary.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      emp.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    )}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'contractors' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          <div className="text-lg font-medium mb-2">No contractors on file</div>
          <div className="text-sm">Add independent contractors to track their payments and generate 1099 forms.</div>
        </div>
      )}
    </div>
  );
}
