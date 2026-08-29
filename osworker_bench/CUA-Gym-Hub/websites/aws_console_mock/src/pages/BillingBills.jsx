import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { RefreshCw, Download, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function BillingBills() {
  const { state, addFlash } = useStore();
  const bills = state.billing?.bills || [];
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [expandedBill, setExpandedBill] = useState(null);

  const filteredBills = bills.filter(b => {
    if (!b.period) return true;
    return b.period.includes(MONTHS[selectedMonth]) || b.period.includes(String(selectedYear));
  });

  const displayBills = filteredBills.length > 0 ? filteredBills : bills;

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1); }
    else setSelectedMonth(selectedMonth - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1); }
    else setSelectedMonth(selectedMonth + 1);
  };

  const mockCharges = [
    { service: 'Amazon Elastic Compute Cloud', charge: 45.23 },
    { service: 'Amazon Simple Storage Service', charge: 12.87 },
    { service: 'Amazon Relational Database Service', charge: 28.50 },
    { service: 'AWS Lambda', charge: 3.14 },
    { service: 'Amazon CloudFront', charge: 5.67 },
    { service: 'Amazon Route 53', charge: 1.50 },
    { service: 'AWS Key Management Service', charge: 1.00 },
    { service: 'Tax', charge: 8.92 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Bills</h1>
        <div className="flex items-center gap-2">
          <button className="aws-btn aws-btn-secondary text-xs flex items-center gap-1" onClick={() => addFlash('info', 'Bill download initiated.')}>
            <Download size={14} /> Download CSV
          </button>
        </div>
      </div>

      {/* Month selector */}
      <div className="aws-card">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm">Date</h2>
          <div className="flex items-center gap-3">
            <button className="p-1 hover:bg-gray-100 rounded" onClick={prevMonth}><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium min-w-[140px] text-center">{MONTHS[selectedMonth]} {selectedYear}</span>
            <button className="p-1 hover:bg-gray-100 rounded" onClick={nextMonth}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="aws-card">
        <h2 className="font-bold text-sm mb-3">Summary</h2>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <span className="text-aws-text-secondary block">Total charges</span>
            <span className="text-2xl font-bold">${mockCharges.reduce((s, c) => s + c.charge, 0).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-aws-text-secondary block">Credits</span>
            <span className="text-2xl font-bold text-green-600">-$0.00</span>
          </div>
          <div>
            <span className="text-aws-text-secondary block">Total</span>
            <span className="text-2xl font-bold">${mockCharges.reduce((s, c) => s + c.charge, 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Charges by service */}
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-sm">Charges by service</h2>
          <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
        </div>
        <table className="aws-table">
          <thead>
            <tr><th>Service</th><th className="text-right">Charges</th></tr>
          </thead>
          <tbody>
            {mockCharges.map((c, i) => (
              <tr key={i} className={c.service === 'Tax' ? 'border-t-2 border-aws-border' : ''}>
                <td className={c.service === 'Tax' ? 'font-bold' : 'text-aws-blue hover:underline cursor-pointer'}>{c.service}</td>
                <td className="text-right font-mono">${c.charge.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-bold border-t-2 border-aws-border">
              <td>Total</td>
              <td className="text-right font-mono">${mockCharges.reduce((s, c) => s + c.charge, 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bill history */}
      <div className="aws-card p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border">
          <h2 className="font-bold text-sm">All bills ({bills.length})</h2>
          <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => addFlash('success', 'Refreshed')}><RefreshCw size={16} className="text-aws-text-secondary" /></button>
        </div>
        <table className="aws-table">
          <thead><tr><th>Period</th><th>Total</th><th>Status</th><th>Due date</th><th>Paid date</th><th></th></tr></thead>
          <tbody>
            {bills.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-aws-text-secondary">No bills available for this period</td></tr>
            ) : displayBills.map((b, i) => (
              <tr key={i}>
                <td className="font-medium">{b.period}</td>
                <td className="font-bold font-mono">${typeof b.total === 'number' ? b.total.toFixed(2) : b.total}</td>
                <td>
                  <span className={`aws-badge ${b.status === 'Paid' ? 'aws-badge-success' : b.status === 'Due' ? 'aws-badge-warning' : 'aws-badge-info'}`}>
                    {b.status}
                  </span>
                </td>
                <td>{b.dueDate ? format(new Date(b.dueDate), 'MMM d, yyyy') : '-'}</td>
                <td>{b.paidDate ? format(new Date(b.paidDate), 'MMM d, yyyy') : '-'}</td>
                <td>
                  <button className="text-aws-blue text-xs hover:underline" onClick={() => addFlash('info', 'Bill PDF download initiated.')}>
                    <Download size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
