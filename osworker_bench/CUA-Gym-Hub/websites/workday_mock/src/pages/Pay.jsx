import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Download, FileText, X, DollarSign, CreditCard, Edit2, Check, Building } from 'lucide-react';
import { formatDate, formatCurrency } from '../lib/utils';

function PayslipModal({ paystub, onClose, onDownload, downloadedPaystub }) {
  if (!paystub) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-5 border-b border-gray-200 flex justify-between items-center z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Payslip Details</h2>
            <p className="text-sm text-gray-500">{paystub.period}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Earnings */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">Earnings</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Regular Pay (80 hrs x $69.71)</span>
                <span className="font-medium text-gray-900">{formatCurrency(paystub.grossPay)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                <span>Gross Pay</span>
                <span>{formatCurrency(paystub.grossPay)}</span>
              </div>
            </div>
          </div>

          {/* Taxes */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">Taxes</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Federal Income Tax</span>
                <span className="text-red-600">-{formatCurrency(paystub.federalTax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">State Income Tax (CA)</span>
                <span className="text-red-600">-{formatCurrency(paystub.stateTax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Social Security</span>
                <span className="text-red-600">-{formatCurrency(paystub.socialSecurity)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Medicare</span>
                <span className="text-red-600">-{formatCurrency(paystub.medicare)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                <span>Total Taxes</span>
                <span className="text-red-600">-{formatCurrency(paystub.federalTax + paystub.stateTax + paystub.socialSecurity + paystub.medicare)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">Deductions</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Health Insurance</span>
                <span className="text-red-600">-{formatCurrency(paystub.healthInsurance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">401(k) Contribution</span>
                <span className="text-red-600">-{formatCurrency(paystub.retirement401k)}</span>
              </div>
              {paystub.otherDeductions > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Other Deductions</span>
                  <span className="text-red-600">-{formatCurrency(paystub.otherDeductions)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                <span>Total Deductions</span>
                <span className="text-red-600">-{formatCurrency(paystub.healthInsurance + paystub.retirement401k + (paystub.otherDeductions || 0))}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gross Pay</span>
                <span className="font-medium">{formatCurrency(paystub.grossPay)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Deductions</span>
                <span className="text-red-600">-{formatCurrency(paystub.totalDeductions)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
                <span className="text-gray-900">Net Pay</span>
                <span className="text-green-600">{formatCurrency(paystub.netPay)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-200 flex justify-between items-center">
          {downloadedPaystub === paystub.paystubId && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <Check size={16} /> Downloaded successfully
            </span>
          )}
          {downloadedPaystub !== paystub.paystubId && <span />}
          <button
            onClick={() => {
              const lines = [
                `PAYSLIP - ${paystub.period}`,
                `Pay Date: ${paystub.date}`,
                '',
                `Gross Pay: $${paystub.grossPay.toFixed(2)}`,
                `Federal Tax: -$${paystub.federalTax.toFixed(2)}`,
                `State Tax: -$${paystub.stateTax.toFixed(2)}`,
                `Social Security: -$${paystub.socialSecurity.toFixed(2)}`,
                `Medicare: -$${paystub.medicare.toFixed(2)}`,
                `Health Insurance: -$${paystub.healthInsurance.toFixed(2)}`,
                `401(k): -$${paystub.retirement401k.toFixed(2)}`,
                `Net Pay: $${paystub.netPay.toFixed(2)}`,
              ];
              const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `payslip-${paystub.paystubId}.txt`;
              a.click();
              URL.revokeObjectURL(url);
              onDownload(paystub.paystubId);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pay() {
  const { state, dispatch } = useStore();
  const { payroll } = state;
  const [viewPaystub, setViewPaystub] = useState(null);
  const [editingElections, setEditingElections] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [downloadedPaystub, setDownloadedPaystub] = useState(null);
  const [downloadedTaxDoc, setDownloadedTaxDoc] = useState(null);

  const elections = state.paymentElections || {
    bankName: 'Chase Bank',
    accountType: 'Checking',
    last4: '4521',
    depositAmount: '100% of Net Pay',
  };
  const [electionsForm, setElectionsForm] = useState({ ...elections });

  const handleSaveElections = () => {
    dispatch({ type: 'UPDATE_PAYMENT_ELECTIONS', payload: electionsForm });
    setEditingElections(false);
    setSuccessMsg('Payment elections updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const ytd = useMemo(() => {
    return payroll.reduce((acc, ps) => ({
      gross: acc.gross + ps.grossPay,
      taxes: acc.taxes + ps.federalTax + ps.stateTax + ps.socialSecurity + ps.medicare,
      deductions: acc.deductions + ps.healthInsurance + ps.retirement401k + (ps.otherDeductions || 0),
      net: acc.net + ps.netPay,
    }), { gross: 0, taxes: 0, deductions: 0, net: 0 });
  }, [payroll]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Pay & Tax</h1>

      {/* Success message */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <Check size={18} />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* YTD Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">YTD Gross</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(ytd.gross)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">YTD Taxes</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(ytd.taxes)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">YTD Deductions</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(ytd.deductions)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">YTD Net</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(ytd.net)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Pay Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-gray-500 font-medium">Most Recent Pay</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(payroll[0].netPay)}</h2>
              <p className="text-sm text-gray-500 mt-1">Pay Date: {formatDate(payroll[0].date)}</p>
            </div>
            <button
              onClick={() => setViewPaystub(payroll[0])}
              className="flex items-center gap-2 text-primary hover:bg-light-blue px-3 py-2 rounded-md transition-colors text-sm font-medium"
            >
              <FileText size={18} /> View Details
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-semibold">Gross Pay</p>
              <p className="text-lg font-medium text-gray-900 mt-1">{formatCurrency(payroll[0].grossPay)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-semibold">Taxes & Deductions</p>
              <p className="text-lg font-medium text-red-600 mt-1">-{formatCurrency(payroll[0].totalDeductions)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-semibold">Net Pay</p>
              <p className="text-lg font-medium text-green-600 mt-1">{formatCurrency(payroll[0].netPay)}</p>
            </div>
          </div>
        </div>

        {/* Tax Forms */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-gray-400" /> Tax Documents
          </h3>
          <ul className="space-y-3">
            {['2023 W-2', '2022 W-2', '2021 W-2'].map((doc, i) => (
              <li
                key={i}
                onClick={() => {
                  const content = `${doc} - Wage and Tax Statement\n\nEmployee: Alex Morgan\nEmployer: Acme Corporation\nYear: ${doc.split(' ')[0]}\n\n[Mock Tax Document - Download Simulation]`;
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${doc.replace(' ', '-')}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setDownloadedTaxDoc(doc);
                  setTimeout(() => setDownloadedTaxDoc(null), 3000);
                }}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer group"
              >
                <span className="text-sm font-medium text-gray-700">{doc}</span>
                {downloadedTaxDoc === doc ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><Check size={14} /> Downloaded</span>
                ) : (
                  <Download size={16} className="text-gray-400 group-hover:text-primary" />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Elections */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <CreditCard size={20} className="text-gray-400" /> Payment Elections
            </h3>
            {!editingElections ? (
              <button
                onClick={() => {
                  setElectionsForm({ ...elections });
                  setEditingElections(true);
                }}
                className="flex items-center gap-1 text-primary hover:text-primary-hover text-sm font-medium"
              >
                <Edit2 size={14} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingElections(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveElections}
                  className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <Building size={24} />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Bank Name</p>
                  {editingElections ? (
                    <input
                      type="text"
                      value={electionsForm.bankName}
                      onChange={e => setElectionsForm({ ...electionsForm, bankName: e.target.value })}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium mt-1">{elections.bankName}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Account Type</p>
                  {editingElections ? (
                    <select
                      value={electionsForm.accountType}
                      onChange={e => setElectionsForm({ ...electionsForm, accountType: e.target.value })}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option>Checking</option>
                      <option>Savings</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium mt-1">{elections.accountType}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Account Number</p>
                  {editingElections ? (
                    <input
                      type="text"
                      value={electionsForm.last4}
                      onChange={e => setElectionsForm({ ...electionsForm, last4: e.target.value })}
                      maxLength={4}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Last 4 digits"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium mt-1">****{elections.last4}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Deposit Amount</p>
                  {editingElections ? (
                    <select
                      value={electionsForm.depositAmount}
                      onChange={e => setElectionsForm({ ...electionsForm, depositAmount: e.target.value })}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option>100% of Net Pay</option>
                      <option>Fixed Amount</option>
                      <option>Remaining Balance</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium mt-1">{elections.depositAmount}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pay History List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-3">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Pay History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Pay Date</th>
                  <th className="px-6 py-3">Period</th>
                  <th className="px-6 py-3">Gross</th>
                  <th className="px-6 py-3">Deductions</th>
                  <th className="px-6 py-3">Net</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payroll.map((stub) => (
                  <tr key={stub.paystubId} className="hover:bg-gray-50 cursor-pointer" onClick={() => setViewPaystub(stub)}>
                    <td className="px-6 py-4 font-medium">{formatDate(stub.date)}</td>
                    <td className="px-6 py-4 text-gray-500">{stub.period}</td>
                    <td className="px-6 py-4">{formatCurrency(stub.grossPay)}</td>
                    <td className="px-6 py-4 text-red-600">-{formatCurrency(stub.totalDeductions)}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(stub.netPay)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:text-primary-hover font-medium text-xs">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payslip detail modal */}
      {viewPaystub && (
        <PayslipModal
          paystub={viewPaystub}
          onClose={() => setViewPaystub(null)}
          onDownload={(id) => setDownloadedPaystub(id)}
          downloadedPaystub={downloadedPaystub}
        />
      )}
    </div>
  );
}
