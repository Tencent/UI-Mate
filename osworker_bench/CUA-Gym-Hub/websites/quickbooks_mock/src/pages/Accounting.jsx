import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export default function Accounting({ initialTab = 'chart' }) {
  const { data } = useStore();
  const [activeTab, setActiveTab] = useState(initialTab);

  const accountsByType = data.accounts.reduce((acc, account) => {
    if (!acc[account.type]) acc[account.type] = [];
    acc[account.type].push(account);
    return acc;
  }, {});

  const typeOrder = ['Bank', 'Accounts Receivable', 'Other Current Assets', 'Fixed Assets',
    'Accounts Payable', 'Credit Card', 'Equity', 'Income', 'Cost of Goods Sold', 'Expenses'];

  // For reconcile: show bank/credit accounts
  const reconcileAccounts = data.accounts.filter(a => a.type === 'Bank' || a.type === 'Credit Card');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-qb-text-primary">Accounting</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'chart', label: 'Chart of Accounts', path: '/accounting' },
            { key: 'reconcile', label: 'Reconcile', path: '/accounting/reconcile' },
            { key: 'accountant', label: 'My Accountant', path: '/accountant' },
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

      {activeTab === 'chart' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {typeOrder.flatMap(type => {
                const accounts = accountsByType[type];
                if (!accounts) return [];
                return [
                  <tr key={`header-${type}`} className="bg-gray-50">
                    <td colSpan={6} className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">{type}</td>
                  </tr>,
                  ...accounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{acc.number}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{acc.name}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">{acc.type}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{acc.detailType}</td>
                      <td className={clsx("px-6 py-3 whitespace-nowrap text-right text-sm font-medium", acc.balance < 0 ? 'text-red-600' : 'text-gray-900')}>
                        {acc.balance < 0 ? '-' : ''}${Math.abs(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={clsx(
                          "px-2 inline-flex text-xs leading-5 font-medium rounded-full",
                          acc.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                        )}>
                          {acc.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                ];
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'reconcile' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Select an account to reconcile.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reconcileAccounts.map(acc => {
              const pendingTx = data.transactions.filter(tx => tx.accountId === acc.id && tx.status === 'pending').length;
              const reconciledTx = data.transactions.filter(tx => tx.accountId === acc.id && tx.isReconciled).length;
              const totalTx = data.transactions.filter(tx => tx.accountId === acc.id).length;
              return (
                <div key={acc.id} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{acc.name}</div>
                      <div className="text-xs text-gray-400">{acc.detailType} {acc.number ? `· #${acc.number}` : ''}</div>
                    </div>
                    <div className={clsx("text-lg font-bold", acc.balance < 0 ? 'text-red-600' : 'text-gray-900')}>
                      {acc.balance < 0 ? '-' : ''}${Math.abs(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span>QB Balance</span>
                    <span>Bank Balance: ${Math.abs(acc.bankBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span>{reconciledTx}/{totalTx} transactions reconciled</span>
                    {pendingTx > 0 && <span className="text-orange-600">{pendingTx} to review</span>}
                  </div>
                  <Link
                    to="/transactions"
                    className="block text-center text-sm text-qb-green hover:underline font-medium"
                  >
                    Reconcile this account
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'accountant' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">My Accountant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Company Profile</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Company</dt>
                  <dd className="text-gray-900 font-medium">{data.company?.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">EIN / Tax ID</dt>
                  <dd className="text-gray-900 font-medium">{data.company?.taxId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Accounting Method</dt>
                  <dd className="text-gray-900 font-medium">{data.company?.accountingMethod}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Fiscal Year Start</dt>
                  <dd className="text-gray-900 font-medium">{data.company?.fiscalYearStart}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Industry</dt>
                  <dd className="text-gray-900 font-medium">{data.company?.industry}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-900 font-medium">{data.company?.email}</dd>
                </div>
              </dl>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Links for Accountant</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/reports/profit-loss" className="text-qb-blue hover:underline">Profit & Loss Report</Link></li>
                <li><Link to="/reports/balance-sheet" className="text-qb-blue hover:underline">Balance Sheet</Link></li>
                <li><Link to="/accounting" className="text-qb-blue hover:underline">Chart of Accounts</Link></li>
                <li><Link to="/reports/invoice-list" className="text-qb-blue hover:underline">Invoice List</Link></li>
                <li><Link to="/reports/expenses-by-vendor" className="text-qb-blue hover:underline">Expenses by Vendor</Link></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
