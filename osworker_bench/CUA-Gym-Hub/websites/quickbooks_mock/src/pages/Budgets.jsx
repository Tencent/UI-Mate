import React from 'react';
import { useStore } from '../lib/store';

export default function Budgets() {
  const { data } = useStore();

  // Compute budget data from expenses/invoices
  const currentYear = new Date().getFullYear();
  const totalIncome = data.invoices.reduce((s, inv) => s + inv.total, 0);
  const totalExpenses = data.expenses.reduce((s, exp) => s + exp.amount, 0);

  // Expense by category for budget overview
  const expenseByCategory = {};
  data.expenses.forEach(exp => {
    expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + exp.amount;
  });

  // Estimated budget (150% of current spend as "budget")
  const categories = Object.entries(expenseByCategory).map(([cat, actual]) => ({
    category: cat,
    budget: Math.round(actual * 1.5),
    actual,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-qb-text-primary">Budgets</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Income YTD</div>
          <div className="text-2xl font-bold text-qb-green">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Expenses YTD</div>
          <div className="text-2xl font-bold text-qb-red">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Net {currentYear}</div>
          <div className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-qb-green' : 'text-qb-red'}`}>
            ${(totalIncome - totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Budget vs Actuals by Category */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">Budget vs. Actuals — Expenses by Category ({currentYear})</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Progress</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.sort((a, b) => b.actual - a.actual).map(row => {
              const variance = row.budget - row.actual;
              const pct = row.budget > 0 ? (row.actual / row.budget) * 100 : 0;
              return (
                <tr key={row.category} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">${row.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">${row.actual.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {variance >= 0 ? '+' : ''}{variance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-yellow-500' : 'bg-qb-green'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{Math.round(pct)}%</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-6 py-3 text-sm font-bold text-gray-700">Total</td>
              <td className="px-6 py-3 text-right text-sm font-bold text-gray-700">${categories.reduce((s, r) => s + r.budget, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-6 py-3 text-right text-sm font-bold text-gray-700">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className={`px-6 py-3 text-right text-sm font-bold ${categories.reduce((s, r) => s + r.budget, 0) - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(categories.reduce((s, r) => s + r.budget, 0) - totalExpenses) >= 0 ? '+' : ''}
                {(categories.reduce((s, r) => s + r.budget, 0) - totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
