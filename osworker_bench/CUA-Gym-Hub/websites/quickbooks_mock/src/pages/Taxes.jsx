import React from 'react';
import { useStore } from '../lib/store';
import { clsx } from 'clsx';

const TAX_RATE = 0.08; // 8% sales tax for taxable items

export default function Taxes() {
  const { data } = useStore();

  // Calculate taxable sales (invoices with taxable items)
  const invoicesWithTax = data.invoices.filter(inv => inv.tax > 0);
  const totalTaxCollected = data.invoices.reduce((s, inv) => s + (inv.tax || 0), 0);
  const totalTaxableSales = data.invoices.reduce((s, inv) => s + (inv.subtotal || 0), 0);
  const paidTax = data.invoices.filter(i => i.status === 'Paid').reduce((s, inv) => s + (inv.tax || 0), 0);
  const unpaidTax = totalTaxCollected - paidTax;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-qb-text-primary">Taxes</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Sales Tax Collected YTD</div>
          <div className="text-2xl font-bold text-gray-900">${totalTaxCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Tax on Paid Invoices</div>
          <div className="text-2xl font-bold text-qb-green">${paidTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Tax on Outstanding Invoices</div>
          <div className="text-2xl font-bold text-orange-500">${unpaidTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Company Tax Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Company Tax Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Company Name</div>
            <div className="font-medium text-gray-900 mt-0.5">{data.company?.name}</div>
          </div>
          <div>
            <div className="text-gray-500">Tax ID (EIN)</div>
            <div className="font-medium text-gray-900 mt-0.5">{data.company?.taxId}</div>
          </div>
          <div>
            <div className="text-gray-500">Accounting Method</div>
            <div className="font-medium text-gray-900 mt-0.5">{data.company?.accountingMethod}</div>
          </div>
          <div>
            <div className="text-gray-500">Fiscal Year Start</div>
            <div className="font-medium text-gray-900 mt-0.5">{data.company?.fiscalYearStart}</div>
          </div>
        </div>
      </div>

      {/* Invoices with Tax */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">Sales Tax by Invoice</h2>
        </div>
        {invoicesWithTax.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">No taxable invoices found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoicesWithTax.map(inv => {
                const customer = data.customers.find(c => c.id === inv.customerId);
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-qb-blue">#{inv.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">${inv.subtotal?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">${inv.tax?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        inv.status === 'Paid' ? "bg-green-100 text-green-800" :
                        inv.status === 'Overdue' ? "bg-red-100 text-red-800" :
                        "bg-blue-100 text-blue-800"
                      )}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-sm font-bold text-gray-700 text-right">Total Tax Collected</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">${totalTaxCollected.toFixed(2)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
