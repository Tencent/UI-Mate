import React, { useState, useRef } from 'react';
import { useStore } from '../lib/store';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, Filter, Printer, Settings, Download, CheckCircle, X, Upload } from 'lucide-react';
import { clsx } from 'clsx';
import { getSessionId } from '../lib/initialData';

const CATEGORIES = [
  'Uncategorized Income', 'Uncategorized Expense', 'Office Supplies', 'Meals & Entertainment',
  'Travel', 'Software', 'Rent', 'Utilities', 'Insurance', 'Advertising',
  'Consulting', 'Sales', 'Payroll', 'Bank Charges', 'Other'
];

const ACCOUNT_COLORS = ['#0077C5', '#2CA01C', '#6366F1', '#D32F2F'];

function ExpandedRow({ tx, accounts, onConfirm, onExclude, onClose }) {
  const [category, setCategory] = useState(tx.category || 'Uncategorized Expense');
  const [payee, setPayee] = useState(tx.payee || '');
  const [tags, setTags] = useState('');

  const handleConfirm = () => {
    onConfirm(tx.id, category, payee);
    onClose();
  };

  return (
    <tr className="bg-blue-50">
      <td colSpan={8} className="px-6 py-4">
        <div className="grid grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              className="w-full border border-gray-300 rounded text-sm px-2 py-1.5 focus:ring-qb-green focus:border-qb-green"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Payee</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded text-sm px-2 py-1.5 focus:ring-qb-green focus:border-qb-green"
              value={payee}
              onChange={e => setPayee(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
            <input
              type="text"
              placeholder="Add tags..."
              className="w-full border border-gray-300 rounded text-sm px-2 py-1.5 focus:ring-qb-green focus:border-qb-green"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleConfirm}
              className="bg-qb-green text-white text-sm px-4 py-1.5 rounded font-medium hover:bg-qb-green-hover"
            >
              Confirm
            </button>
            <button
              onClick={() => { onExclude(tx); onClose(); }}
              className="border border-gray-300 text-gray-600 text-sm px-3 py-1.5 rounded hover:bg-gray-50"
            >
              Exclude
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function Transactions({ initialView = 'banking' }) {
  const { data, categorizeTransaction, updateTransaction } = useStore();
  const [activeMainTab, setActiveMainTab] = useState(initialView === 'rules' ? 'rules' : initialView === 'receipts' ? 'receipts' : 'banking');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedTxIds, setSelectedTxIds] = useState(new Set());
  const [expandedTxId, setExpandedTxId] = useState(null);
  const [showAccountCards, setShowAccountCards] = useState(true);
  const [rowCategories, setRowCategories] = useState({});

  // Rules state
  const [rules, setRules] = useState([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({ name: '', condition: '', category: CATEGORIES[0] });

  // Receipts state
  const [receipts, setReceipts] = useState([]);
  const [receiptToast, setReceiptToast] = useState('');
  const fileInputRef = useRef(null);

  const bankAndCreditAccounts = data.accounts.filter(a => a.type === 'Bank' || a.type === 'Credit Card');

  const pendingByAccount = {};
  data.transactions.forEach(tx => {
    if (tx.status === 'pending') {
      pendingByAccount[tx.accountId] = (pendingByAccount[tx.accountId] || 0) + 1;
    }
  });

  const filteredTx = data.transactions.filter(tx => {
    if (selectedAccount !== 'all' && tx.accountId !== selectedAccount) return false;
    if (statusFilter === 'pending' && tx.status !== 'pending') return false;
    if (statusFilter === 'posted' && tx.status !== 'posted') return false;
    if (statusFilter === 'excluded' && tx.status !== 'excluded') return false;
    return true;
  });

  const pendingCount = data.transactions.filter(tx => tx.status === 'pending').length;
  const postedCount = data.transactions.filter(tx => tx.status === 'posted').length;
  const excludedCount = data.transactions.filter(tx => tx.status === 'excluded').length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTxIds(new Set(filteredTx.map(tx => tx.id)));
    } else {
      setSelectedTxIds(new Set());
    }
  };

  const handleSelectTx = (txId) => {
    setSelectedTxIds(prev => {
      const next = new Set(prev);
      next.has(txId) ? next.delete(txId) : next.add(txId);
      return next;
    });
  };

  const handleConfirm = (txId, category, payee) => {
    const tx = data.transactions.find(t => t.id === txId);
    if (tx) {
      updateTransaction({ ...tx, category, payee, status: 'posted' });
    }
  };

  const handleExclude = (tx) => {
    updateTransaction({ ...tx, status: 'excluded' });
  };

  const handleAddBtn = (tx) => {
    // Use per-row selected category, fall back to tx.category or Uncategorized
    const rowCat = rowCategories[tx.id];
    const cat = rowCat || (tx.category && tx.category !== 'Uncategorized' ? tx.category : (tx.amount > 0 ? 'Uncategorized Income' : 'Uncategorized Expense'));
    updateTransaction({ ...tx, category: cat, status: 'posted' });
  };

  const handleMatch = (tx) => {
    updateTransaction({ ...tx, status: 'posted' });
  };

  const handleRowClick = (txId) => {
    setExpandedTxId(prev => prev === txId ? null : txId);
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    if (!ruleForm.name.trim()) return;
    setRules(prev => [...prev, { id: Date.now(), ...ruleForm }]);
    setRuleForm({ name: '', condition: '', category: CATEGORIES[0] });
    setShowRuleModal(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const sid = getSessionId();
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(sid ? `/upload?sid=${encodeURIComponent(sid)}` : '/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const result = await res.json();
        const uploaded = result.files?.[0];
        if (uploaded) {
          setReceipts(prev => [...prev, { name: uploaded.original_name, url: uploaded.url }]);
          setReceiptToast(`Uploaded: ${uploaded.original_name}`);
          setTimeout(() => setReceiptToast(''), 3000);
        }
      }
    } catch {
      setReceiptToast('Upload failed. Please try again.');
      setTimeout(() => setReceiptToast(''), 3000);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-0">
      {/* Create Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Create bank rule</h2>
              <button onClick={() => setShowRuleModal(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveRule} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rule name <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                  value={ruleForm.name}
                  onChange={e => setRuleForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Categorize Amazon as Office Supplies"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Condition: Description contains</label>
                <input
                  type="text"
                  className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                  value={ruleForm.condition}
                  onChange={e => setRuleForm(p => ({ ...p, condition: e.target.value }))}
                  placeholder="e.g. AMAZON"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Action: Assign category</label>
                <select
                  className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                  value={ruleForm.category}
                  onChange={e => setRuleForm(p => ({ ...p, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowRuleModal(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-qb-green text-white rounded hover:bg-qb-green-hover text-sm font-medium">Save rule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden file input for receipts */}
      <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center">
          {[
            { key: 'banking', label: 'Banking' },
            { key: 'rules', label: 'Rules' },
            { key: 'receipts', label: 'Receipts', badge: 'NEW' },
          ].map(tab => (
            <Link
              key={tab.key}
              to={tab.key === 'banking' ? '/transactions' : `/transactions/${tab.key}`}
              onClick={() => setActiveMainTab(tab.key)}
              className={clsx(
                'px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2',
                activeMainTab === tab.key
                  ? 'border-qb-green text-qb-green'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.label}
              {tab.badge && (
                <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                  {tab.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {activeMainTab === 'rules' && (
        <div className="pt-8">
          {rules.length === 0 ? (
            <div className="text-center text-gray-400">
              <div className="text-lg font-semibold mb-2">Bank Rules</div>
              <p className="text-sm">Automatically categorize recurring transactions using rules.</p>
              <button onClick={() => setShowRuleModal(true)} className="mt-6 bg-qb-green text-white px-5 py-2 rounded font-medium text-sm hover:bg-qb-green-hover">
                Create rule
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setShowRuleModal(true)} className="bg-qb-green text-white px-4 py-1.5 rounded font-medium text-sm hover:bg-qb-green-hover">
                  Create rule
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rule name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category assigned</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rules.map(rule => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{rule.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{rule.condition ? `Description contains "${rule.condition}"` : '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{rule.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeMainTab === 'receipts' && (
        <div className="pt-8">
          {receiptToast && (
            <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm">
              {receiptToast}
            </div>
          )}
          {receipts.length === 0 ? (
            <div className="text-center text-gray-400">
              <div className="text-lg font-semibold mb-2">Receipts</div>
              <p className="text-sm">Upload receipt photos to match with transactions automatically.</p>
              <button onClick={() => fileInputRef.current?.click()} className="mt-6 bg-qb-green text-white px-5 py-2 rounded font-medium text-sm hover:bg-qb-green-hover flex items-center gap-2 mx-auto">
                <Upload className="w-4 h-4" /> Upload receipts
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => fileInputRef.current?.click()} className="bg-qb-green text-white px-4 py-1.5 rounded font-medium text-sm hover:bg-qb-green-hover flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload receipts
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {receipts.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.name}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" /> Uploaded
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeMainTab === 'banking' && (
        <div className="space-y-4 pt-4">
          {/* Bank Account Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setShowAccountCards(v => !v)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                {showAccountCards ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showAccountCards ? 'Collapse' : 'Expand'} accounts
              </button>
              <div className="flex gap-2">
                <button className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50">Link account</button>
                <button className="bg-qb-green text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-qb-green-hover">Update</button>
              </div>
            </div>
            {showAccountCards && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {bankAndCreditAccounts.map((acc, idx) => {
                  const pending = pendingByAccount[acc.id] || 0;
                  const isSelected = selectedAccount === acc.id;
                  return (
                    <button
                      key={acc.id}
                      onClick={() => setSelectedAccount(isSelected ? 'all' : acc.id)}
                      className={clsx(
                        'rounded-lg p-4 text-left transition-all border-2',
                        isSelected ? 'border-white shadow-md' : 'border-transparent',
                      )}
                      style={{ backgroundColor: ACCOUNT_COLORS[idx % ACCOUNT_COLORS.length] }}
                    >
                      <div className="text-white text-xs font-medium opacity-80 mb-1 truncate">{acc.name}</div>
                      <div className="text-white text-xl font-bold mb-0.5">${Math.abs(acc.bankBalance || acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className="text-white text-xs opacity-70 mb-2">Updated moments ago</div>
                      <div className="text-white text-xs">In XuickBooks: <span className="font-semibold">${Math.abs(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                      {pending > 0 && (
                        <div className="mt-2 bg-white bg-opacity-20 rounded px-2 py-0.5 text-white text-xs font-semibold inline-block">
                          {pending} to review
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filter Tabs + Action Bar */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 border-b border-gray-200">
              <div className="flex -mb-px">
                {[
                  { key: 'pending', label: 'For Review', count: pendingCount },
                  { key: 'posted', label: 'Reviewed', count: postedCount },
                  { key: 'excluded', label: 'Excluded', count: excludedCount },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={clsx(
                      'px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5',
                      statusFilter === tab.key
                        ? 'border-qb-green text-qb-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    )}
                  >
                    {tab.label}
                    <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded-full',
                      statusFilter === tab.key ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-xs border border-gray-300 rounded overflow-hidden">
                  <span className="px-2.5 py-1.5 bg-gray-50 text-gray-700 font-medium">All ({filteredTx.length})</span>
                  <span className="px-2.5 py-1.5 text-gray-500">Recognized ({filteredTx.filter(tx => tx.matchedId).length})</span>
                </div>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded"><Filter className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded"><Printer className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded"><Download className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded"><Settings className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300 text-qb-green" onChange={handleSelectAll} />
                <button className="flex items-center gap-1 text-sm text-gray-600 border border-gray-300 rounded px-2.5 py-1 hover:bg-white">
                  Batch actions <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-4 py-3 text-left">
                    <input type="checkbox" className="rounded border-gray-300 text-qb-green" onChange={handleSelectAll} />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                    DATE <ChevronDown className="w-3 h-3 inline ml-0.5" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DESCRIPTION</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PAYEE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORY OR MATCH</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SPENT</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">RECEIVED</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTx.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-400">
                      No transactions to display
                    </td>
                  </tr>
                )}
                {filteredTx.map((tx) => {
                  const account = data.accounts.find(a => a.id === tx.accountId);
                  const hasMatch = !!tx.matchedId;
                  const isExpanded = expandedTxId === tx.id;

                  return (
                    <React.Fragment key={tx.id}>
                      <tr
                        className={clsx('hover:bg-gray-50 cursor-pointer', isExpanded && 'bg-blue-50')}
                        onClick={() => handleRowClick(tx.id)}
                      >
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-qb-green focus:ring-qb-green"
                            checked={selectedTxIds.has(tx.id)}
                            onChange={() => handleSelectTx(tx.id)}
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{tx.date}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{tx.description}</div>
                          {account && <div className="text-xs text-gray-400">{account.name}</div>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{tx.payee || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-3">
                          {tx.status === 'posted' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3" /> {tx.category}
                            </span>
                          ) : tx.status === 'pending' && hasMatch ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              1 record found
                            </span>
                          ) : tx.status === 'excluded' ? (
                            <span className="text-xs text-gray-400">{tx.category || 'Excluded'}</span>
                          ) : (
                            <select
                              className="text-xs border border-gray-300 rounded px-1.5 py-0.5 text-gray-700 focus:ring-qb-green focus:border-qb-green max-w-[160px]"
                              value={rowCategories[tx.id] || (tx.amount < 0 ? 'Uncategorized Expense' : 'Uncategorized Income')}
                              onClick={e => e.stopPropagation()}
                              onChange={e => {
                                e.stopPropagation();
                                setRowCategories(prev => ({ ...prev, [tx.id]: e.target.value }));
                              }}
                            >
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          {tx.amount < 0 ? (
                            <span className="text-gray-900">${Math.abs(tx.amount).toFixed(2)}</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          {tx.amount >= 0 ? (
                            <span className="text-green-600">${tx.amount.toFixed(2)}</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          {tx.status === 'posted' ? (
                            <span className="text-xs text-green-600 font-medium">Added</span>
                          ) : tx.status === 'excluded' ? (
                            <span className="text-xs text-gray-400">Excluded</span>
                          ) : hasMatch ? (
                            <button
                              onClick={() => handleMatch(tx)}
                              className="text-sm text-qb-blue font-medium hover:underline"
                            >
                              Match
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddBtn(tx)}
                              className="text-sm font-medium text-qb-green border border-qb-green rounded px-3 py-0.5 hover:bg-green-50"
                            >
                              Add
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <ExpandedRow
                          tx={tx}
                          accounts={data.accounts}
                          onConfirm={handleConfirm}
                          onExclude={handleExclude}
                          onClose={() => setExpandedTxId(null)}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
