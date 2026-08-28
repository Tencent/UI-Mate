import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { useParams, Link } from 'react-router-dom';
import { Star, Search, ChevronDown, ChevronRight, Download, Printer, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { subDays, format, differenceInDays } from 'date-fns';

function ReportList() {
  const { data, toggleReportStar } = useStore();
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(
    data.reportCategories.reduce((acc, cat) => ({ ...acc, [cat.name]: true }), {})
  );

  const toggleCategory = (name) => {
    setExpandedCategories(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const starredReports = data.reportCategories.flatMap(cat =>
    cat.reports.filter(r => r.starred)
  );

  const filteredCategories = data.reportCategories.map(cat => ({
    ...cat,
    reports: cat.reports.filter(r =>
      !search || r.name.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.reports.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-qb-text-primary">Reports</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search reports"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-qb-green focus:border-qb-green"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Starred Reports */}
      {!search && starredReports.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            Favorites
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {starredReports.map(report => (
              <Link
                key={report.id}
                to={`/reports/${report.id}`}
                className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 border border-gray-100 transition-colors"
              >
                <span className="text-sm text-qb-blue hover:underline">{report.name}</span>
                <button
                  onClick={(e) => { e.preventDefault(); toggleReportStar(report.id); }}
                  className="text-yellow-400 hover:text-yellow-500"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Report Categories */}
      <div className="space-y-2">
        {filteredCategories.map(cat => (
          <div key={cat.name} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleCategory(cat.name)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
              {expandedCategories[cat.name]
                ? <ChevronDown className="w-4 h-4 text-gray-400" />
                : <ChevronRight className="w-4 h-4 text-gray-400" />
              }
            </button>
            {expandedCategories[cat.name] && (
              <div className="border-t border-gray-100">
                {cat.reports.map(report => (
                  <Link
                    key={report.id}
                    to={`/reports/${report.id}`}
                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm text-qb-blue hover:underline">{report.name}</span>
                    <button
                      onClick={(e) => { e.preventDefault(); toggleReportStar(report.id); }}
                      className={clsx(
                        "transition-colors",
                        report.starred ? "text-yellow-400 hover:text-yellow-500" : "text-gray-300 hover:text-yellow-400"
                      )}
                    >
                      <Star className={clsx("w-3.5 h-3.5", report.starred ? "fill-current" : "")} />
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportDetail() {
  const { reportId } = useParams();
  const { data } = useStore();

  // Calculate P&L
  const totalIncome = data.invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalExpenses = data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  // Calculate Balance Sheet
  const bankAssets = data.accounts.filter(a => a.type === 'Bank').reduce((sum, acc) => sum + acc.balance, 0);
  const arAssets = data.invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + (i.total - (i.paidAmount || 0)), 0);
  const otherAssets = data.accounts.filter(a => a.type === 'Other Current Assets' || a.type === 'Fixed Assets').reduce((sum, a) => sum + a.balance, 0);
  const totalAssets = bankAssets + arAssets + otherAssets;
  const totalLiabilities = data.accounts.filter(a => a.type === 'Accounts Payable' || a.type === 'Credit Card').reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const totalEquity = data.accounts.filter(a => a.type === 'Equity').reduce((sum, a) => sum + a.balance, 0);

  const companyName = data.company?.name || 'Acme Corp';

  const Breadcrumb = ({ title }) => (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <Link to="/reports" className="text-qb-blue hover:underline">Reports</Link>
      <span>/</span>
      <span>{title}</span>
    </div>
  );

  if (reportId === 'profit-loss') {
    return (
      <div className="space-y-6">
        <Breadcrumb title="Profit and Loss" />
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">{companyName}</h2>
            <h3 className="text-lg font-semibold text-gray-700">Profit and Loss</h3>
            <div className="text-sm text-gray-500">This Year-to-date</div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between font-semibold text-gray-700 border-b border-gray-200 pb-2">
                <span>Income</span>
                <span>Total</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600">
                <span className="pl-4">Sales</span>
                <span>${totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-gray-900 border-t border-gray-100">
                <span>Total Income</span>
                <span>${totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex justify-between font-semibold text-gray-700 border-b border-gray-200 pb-2">
                <span>Expenses</span>
                <span>Total</span>
              </div>
              {Object.entries(data.expenses.reduce((acc, exp) => {
                acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                return acc;
              }, {})).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                <div key={cat} className="flex justify-between py-2 text-gray-600">
                  <span className="pl-4">{cat}</span>
                  <span>${amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-bold text-gray-900 border-t border-gray-100">
                <span>Total Expenses</span>
                <span>${totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-gray-200">
              <div className="flex justify-between text-lg font-bold">
                <span>Net Income</span>
                <span className={netIncome >= 0 ? 'text-qb-green' : 'text-qb-red'}>
                  ${netIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (reportId === 'balance-sheet') {
    return (
      <div className="space-y-6">
        <Breadcrumb title="Balance Sheet" />
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">{companyName}</h2>
            <h3 className="text-lg font-semibold text-gray-700">Balance Sheet</h3>
            <div className="text-sm text-gray-500">As of today</div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between font-semibold text-gray-700 border-b border-gray-200 pb-2">
                <span>Assets</span>
                <span>Total</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600">
                <span className="pl-4">Bank Accounts</span>
                <span>${bankAssets.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600">
                <span className="pl-4">Accounts Receivable</span>
                <span>${arAssets.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600">
                <span className="pl-4">Other Assets</span>
                <span>${otherAssets.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-gray-900 border-t border-gray-100">
                <span>Total Assets</span>
                <span>${totalAssets.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex justify-between font-semibold text-gray-700 border-b border-gray-200 pb-2">
                <span>Liabilities & Equity</span>
                <span>Total</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600">
                <span className="pl-4">Liabilities</span>
                <span>${totalLiabilities.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600">
                <span className="pl-4">Equity</span>
                <span>${totalEquity.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-gray-900 border-t border-gray-100">
                <span>Total Liabilities & Equity</span>
                <span>${(totalLiabilities + totalEquity).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (reportId === 'invoice-list') {
    return (
      <div className="space-y-6">
        <Breadcrumb title="Invoice List" />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Invoice List — {companyName}</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.invoices.map(inv => {
                const customer = data.customers.find(c => c.id === inv.customerId);
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-qb-blue">#{inv.number}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{inv.date}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{inv.dueDate}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{customer?.name || '-'}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">${inv.total.toFixed(2)}</td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        inv.status === 'Paid' ? "bg-green-100 text-green-800" :
                        inv.status === 'Overdue' ? "bg-red-100 text-red-800" :
                        "bg-blue-100 text-blue-800"
                      )}>{inv.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-sm font-bold text-gray-700 text-right">Total</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                  ${data.invoices.reduce((s, i) => s + i.total, 0).toFixed(2)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  if (reportId === 'sales-by-customer') {
    const salesByCustomer = {};
    data.invoices.forEach(inv => {
      if (!salesByCustomer[inv.customerId]) salesByCustomer[inv.customerId] = { total: 0, count: 0 };
      salesByCustomer[inv.customerId].total += inv.total;
      salesByCustomer[inv.customerId].count += 1;
    });
    const rows = Object.entries(salesByCustomer).map(([cid, val]) => ({
      customer: data.customers.find(c => c.id === cid),
      ...val
    })).sort((a, b) => b.total - a.total);

    return (
      <div className="space-y-6">
        <Breadcrumb title="Sales by Customer" />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Sales by Customer — {companyName}</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoices</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sales</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{row.customer?.name || 'Unknown'}</td>
                  <td className="px-6 py-3 text-right text-sm text-gray-600">{row.count}</td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">${row.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-3 text-sm font-bold text-gray-700">Total</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-gray-700">{data.invoices.length}</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                  ${rows.reduce((s, r) => s + r.total, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  if (reportId === 'customer-balance') {
    const balanceRows = data.customers.filter(c => c.isActive).map(c => {
      const unpaid = data.invoices.filter(i => i.customerId === c.id && i.status !== 'Paid')
        .reduce((s, i) => s + (i.total - (i.paidAmount || 0)), 0);
      return { customer: c, balance: unpaid };
    }).filter(r => r.balance > 0).sort((a, b) => b.balance - a.balance);

    return (
      <div className="space-y-6">
        <Breadcrumb title="Customer Balance" />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Customer Balance Detail — {companyName}</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outstanding Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {balanceRows.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">No outstanding balances</td></tr>
              ) : balanceRows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{row.customer.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{row.customer.email}</td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-qb-red">${row.balance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            {balanceRows.length > 0 && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-6 py-3 text-sm font-bold text-gray-700 text-right">Total A/R Outstanding</td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-qb-red">
                    ${balanceRows.reduce((s, r) => s + r.balance, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  }

  if (reportId === 'expenses-by-vendor') {
    const expByVendor = {};
    data.expenses.forEach(exp => {
      const key = exp.vendorId || '_none';
      if (!expByVendor[key]) expByVendor[key] = { total: 0, count: 0 };
      expByVendor[key].total += exp.amount;
      expByVendor[key].count += 1;
    });
    const vendorRows = Object.entries(expByVendor).map(([vid, val]) => ({
      vendor: vid === '_none' ? null : data.vendors.find(v => v.id === vid),
      ...val
    })).sort((a, b) => b.total - a.total);

    return (
      <div className="space-y-6">
        <Breadcrumb title="Expenses by Vendor" />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Expenses by Vendor — {companyName}</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transactions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Expenses</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendorRows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{row.vendor?.name || 'Other / Unassigned'}</td>
                  <td className="px-6 py-3 text-right text-sm text-gray-600">{row.count}</td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">${row.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-3 text-sm font-bold text-gray-700">Total</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-gray-700">{data.expenses.length}</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                  ${vendorRows.reduce((s, r) => s + r.total, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  if (reportId === 'unpaid-bills') {
    const unpaidBills = data.bills.filter(b => b.status !== 'Paid');
    const total = unpaidBills.reduce((s, b) => s + b.total, 0);

    return (
      <div className="space-y-6">
        <Breadcrumb title="Unpaid Bills" />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Unpaid Bills — {companyName}</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {unpaidBills.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">No unpaid bills</td></tr>
              ) : unpaidBills.map(bill => {
                const vendor = data.vendors.find(v => v.id === bill.vendorId);
                return (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-qb-blue">{bill.number}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{vendor?.name || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{bill.date}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{bill.dueDate}</td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">${bill.total.toFixed(2)}</td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        bill.status === 'Overdue' ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                      )}>{bill.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {unpaidBills.length > 0 && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-sm font-bold text-gray-700 text-right">Total A/P Outstanding</td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">${total.toFixed(2)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  }

  if (reportId === 'payroll-summary') {
    const activeEmp = data.employees.filter(e => e.isActive);
    const totalAnnual = activeEmp.reduce((s, e) => s + e.salary, 0);
    const deptMap = {};
    activeEmp.forEach(e => {
      deptMap[e.department] = (deptMap[e.department] || 0) + e.salary;
    });

    return (
      <div className="space-y-6">
        <Breadcrumb title="Payroll Summary" />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Payroll Summary — {companyName}</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500 uppercase font-medium">Active Employees</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{activeEmp.length}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500 uppercase font-medium">Total Annual Payroll</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">${totalAnnual.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500 uppercase font-medium">Avg. Salary</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                ${activeEmp.length > 0 ? (totalAnnual / activeEmp.length).toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
              </div>
            </div>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pay Frequency</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Annual Salary</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeEmp.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{emp.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{emp.department}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{emp.role}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{emp.payFrequency}</td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">${emp.salary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Default: show the report list for unknown report IDs
  return <ReportList />;
}

export default function Reports() {
  const { reportId } = useParams();

  if (reportId) {
    return <ReportDetail />;
  }

  return <ReportList />;
}
