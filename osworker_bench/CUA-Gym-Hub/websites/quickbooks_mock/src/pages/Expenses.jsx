import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { Plus, ChevronDown, Search, Printer, Download, X, MoreHorizontal, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';
import { getSessionId } from '../lib/initialData';

const EXPENSE_CATEGORIES = [
  'Office Supplies', 'Meals & Entertainment', 'Travel', 'Software',
  'Rent', 'Utilities', 'Insurance', 'Advertising', 'Consulting',
  'Job Expenses', 'Miscellaneous', 'Equipment', 'Payroll'
];

const EXPENSE_TYPES = ['Expense', 'Check', 'Bill', 'Purchase Order', 'Vendor Credit'];

// ──────────────────────────────────────────────
// Expense Detail Modal
// ──────────────────────────────────────────────
function ExpenseDetailModal({ expense, vendor, onClose, onSave }) {
  const { data } = useStore();
  const [form, setForm] = useState({
    date: expense.date || '',
    payee: expense.payee || '',
    vendorId: expense.vendorId || '',
    category: expense.category || '',
    amount: expense.amount?.toString() || '',
    description: expense.description || '',
  });

  const handleSave = (e) => {
    e.preventDefault();
    onSave({ ...expense, ...form, amount: parseFloat(form.amount) || 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Expense</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
              <input type="date" className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payee</label>
              <select className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.vendorId} onChange={e => {
                  const v = data.vendors.find(v => v.id === e.target.value);
                  setForm(p => ({ ...p, vendorId: e.target.value, payee: v ? v.name : p.payee }));
                }}>
                <option value="">Select vendor...</option>
                {data.vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                <option value="">Select category</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
              <input type="number" step="0.01" min="0" className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <input type="text" className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-qb-green text-white rounded hover:bg-qb-green-hover text-sm font-medium">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// New Expense Form (inline)
// ──────────────────────────────────────────────
function NewExpenseForm({ vendors, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    payee: '', vendorId: '', category: '', amount: '',
    date: new Date().toISOString().split('T')[0], description: '', receiptFile: null
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.category) { setError('Please select a category.'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount.'); return; }

    let receiptUrl = '';
    if (form.receiptFile) {
      try {
        const sid = getSessionId();
        const fd = new FormData();
        fd.append('file', form.receiptFile);
        const res = await fetch(sid ? `/upload?sid=${encodeURIComponent(sid)}` : '/upload', { method: 'POST', body: fd });
        if (res.ok) {
          const result = await res.json();
          if (result.files?.length > 0) receiptUrl = result.files[0].url;
        }
      } catch {}
    }

    const v = vendors.find(v => v.id === form.vendorId);
    onSubmit({
      id: uuidv4(), date: form.date,
      payee: v ? v.name : form.payee, category: form.category,
      amount: parseFloat(form.amount), description: form.description,
      vendorId: form.vendorId || null, accountId: 'acc1',
      receipt: receiptUrl, isBillable: false, customerId: null, status: 'Cleared',
      type: 'Expense',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Add Expense</h3>
      {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Payee / Vendor</label>
          <select className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
            value={form.vendorId} onChange={e => {
              const v = vendors.find(v => v.id === e.target.value);
              setForm(p => ({ ...p, vendorId: e.target.value, payee: v ? v.name : '' }));
            }}>
            <option value="">Select vendor</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
          <select required className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
            value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
            <option value="">Select category</option>
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
          <input type="number" step="0.01" min="0.01" required
            className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
            value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
          <input type="date" className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
            value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
          <input type="text" className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Receipt</label>
          <label className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-300 rounded px-3 py-1.5 cursor-pointer hover:bg-gray-50">
            <Upload className="w-3.5 h-3.5" />
            {form.receiptFile ? form.receiptFile.name : 'Upload receipt'}
            <input type="file" className="hidden" accept="image/*,.pdf"
              onChange={e => e.target.files?.[0] && setForm(p => ({ ...p, receiptFile: e.target.files[0] }))} />
          </label>
        </div>
        <div className="col-span-3 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-qb-green text-white rounded hover:bg-qb-green-hover text-sm font-medium">Save</button>
        </div>
      </form>
    </div>
  );
}

// ──────────────────────────────────────────────
// Vendor Modal — full fields
// ──────────────────────────────────────────────
function VendorModal({ vendor, onSave, onClose }) {
  const [form, setForm] = useState({
    firstName: vendor?.firstName || '',
    lastName: vendor?.lastName || '',
    company: vendor?.company || '',
    displayName: vendor?.name || vendor?.displayName || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    mobile: vendor?.mobile || '',
    address: vendor?.address || '',
    terms: vendor?.terms || 'Net 30',
    accountNo: vendor?.accountNo || '',
    taxId: vendor?.taxId || '',
    notes: vendor?.notes || '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const displayName = form.displayName || [form.firstName, form.lastName].filter(Boolean).join(' ') || form.company;
    onSave({
      ...(vendor || {}),
      id: vendor?.id || uuidv4(),
      name: displayName,
      ...form,
      balance: vendor?.balance || 0,
      isActive: true,
      createdAt: vendor?.createdAt || new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">{vendor ? 'Edit Vendor' : 'New Vendor'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">First name</label>
              <input className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.firstName} onChange={e => set('firstName', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Last name</label>
              <input className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.lastName} onChange={e => set('lastName', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
              <input className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.company} onChange={e => set('company', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Display name <span className="text-red-500">*</span></label>
              <input required className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.displayName} onChange={e => set('displayName', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Mobile</label>
              <input type="tel" className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.mobile} onChange={e => set('mobile', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment terms</label>
              <select className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.terms} onChange={e => set('terms', e.target.value)}>
                <option>Net 30</option><option>Net 15</option><option>Net 60</option><option>Due on receipt</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
              <input className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Account no.</label>
              <input className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.accountNo} onChange={e => set('accountNo', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tax ID</label>
              <input className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.taxId} onChange={e => set('taxId', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={2} className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-qb-green text-white rounded hover:bg-qb-green-hover text-sm font-medium">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// New Bill Form (inline)
// ──────────────────────────────────────────────
function NewBillForm({ vendors, onSubmit, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [form, setForm] = useState({
    vendorId: '',
    date: today,
    dueDate: thirtyDaysLater,
    notes: '',
  });
  const [items, setItems] = useState([{ id: uuidv4(), description: '', amount: '' }]);
  const [error, setError] = useState('');

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const updateItem = (idx, k, v) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [k]: v } : item));
  };

  const addItem = () => setItems(prev => [...prev, { id: uuidv4(), description: '', amount: '' }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.vendorId) { setError('Please select a vendor.'); return; }
    const parsedItems = items.map(it => ({
      ...it,
      qty: 1,
      rate: parseFloat(it.amount) || 0,
      amount: parseFloat(it.amount) || 0,
    }));
    if (parsedItems.every(it => it.amount <= 0)) { setError('Add at least one line item with an amount.'); return; }
    const total = parsedItems.reduce((s, it) => s + it.amount, 0);
    const billNum = `B-${Math.floor(1000 + Math.random() * 9000)}`;
    onSubmit({
      id: uuidv4(),
      vendorId: form.vendorId,
      number: billNum,
      date: form.date,
      dueDate: form.dueDate,
      items: parsedItems,
      total,
      status: 'Open',
      paidDate: null,
      notes: form.notes,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      <h3 className="text-base font-semibold text-gray-800 mb-4">New Bill</h3>
      {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Vendor <span className="text-red-500">*</span></label>
            <select required className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
              value={form.vendorId} onChange={e => setField('vendorId', e.target.value)}>
              <option value="">Select vendor</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Bill date</label>
            <input type="date" className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
              value={form.date} onChange={e => setField('date', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Due date</label>
            <input type="date" className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
              value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-700">Line items</label>
            <button type="button" onClick={addItem} className="text-xs text-qb-blue hover:underline">+ Add line</button>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={item.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Description"
                  className="flex-1 border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                  value={item.description}
                  onChange={e => updateItem(idx, 'description', e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Amount"
                  className="w-32 border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
                  value={item.amount}
                  onChange={e => updateItem(idx, 'amount', e.target.value)}
                />
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Notes / Memo</label>
          <input type="text" className="w-full border-gray-300 rounded text-sm focus:ring-qb-green focus:border-qb-green"
            value={form.notes} placeholder="Optional memo..." onChange={e => setField('notes', e.target.value)} />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-qb-green text-white rounded hover:bg-qb-green-hover text-sm font-medium">Save</button>
        </div>
      </form>
    </div>
  );
}

// ──────────────────────────────────────────────
// Bill Detail Modal
// ──────────────────────────────────────────────
function BillDetailModal({ bill, vendor, onClose, onPayBill }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Bill {bill.number}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Vendor</div>
              <div className="text-sm font-medium text-gray-900">{vendor?.name || '—'}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</div>
              <span className={clsx(
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                bill.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                'bg-orange-100 text-orange-800'
              )}>{bill.status}</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Bill Date</div>
              <div className="text-sm text-gray-900">{bill.date}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</div>
              <div className="text-sm text-gray-900">{bill.dueDate}</div>
            </div>
          </div>
          {bill.items && bill.items.length > 0 ? (
            <table className="min-w-full border border-gray-200 rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bill.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-sm text-gray-900">{item.description}</td>
                    <td className="px-3 py-2 text-sm text-right text-gray-900">${item.amount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          <div className="flex justify-end">
            <div className="text-sm font-bold text-gray-900">
              Total: ${bill.total?.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm">Close</button>
          {bill.status !== 'Paid' && (
            <button
              onClick={() => { onPayBill(bill); onClose(); }}
              className="px-4 py-2 bg-qb-green text-white rounded hover:bg-qb-green-hover text-sm font-medium"
            >
              Pay Bill
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Expenses component
// ──────────────────────────────────────────────
export default function Expenses({ initialTab = 'expenses' }) {
  const { data, addExpense, updateExpense, deleteExpense, updateBill, addBill, addVendor, updateVendor, deleteVendor } = useStore();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showBillForm, setShowBillForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const [selectedVendorIds, setSelectedVendorIds] = useState(new Set());
  const [emailSentBanner, setEmailSentBanner] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showNewTxDropdown, setShowNewTxDropdown] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleAddExpense = (expense) => {
    addExpense(expense);
    setShowExpenseForm(false);
  };

  const handleAddBill = (bill) => {
    addBill(bill);
    setShowBillForm(false);
  };

  const handleMarkBillPaid = (bill) => {
    updateBill({ ...bill, status: 'Paid', paidDate: new Date().toISOString().split('T')[0] });
  };

  const handleDuplicate = (expense) => {
    addExpense({ ...expense, id: uuidv4(), date: new Date().toISOString().split('T')[0] });
  };

  // Filtered & sorted expenses
  const filteredExpenses = data.expenses
    .filter(e => {
      if (search && !e.payee?.toLowerCase().includes(search.toLowerCase()) && !e.category?.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter && e.type !== typeFilter) return false;
      return true;
    })
    .sort((a, b) => {
      let av = a[sortField] || '', bv = b[sortField] || '';
      if (sortField === 'amount') { av = a.amount; bv = b.amount; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  // Filtered vendors
  const filteredVendors = data.vendors.filter(v => {
    if (!search) return true;
    return v.name.toLowerCase().includes(search.toLowerCase()) || (v.company || '').toLowerCase().includes(search.toLowerCase());
  });

  // Bills
  const openBills = data.bills.filter(b => b.status !== 'Paid');
  const filteredBills = data.bills.filter(b => {
    if (search) {
      const vendor = data.vendors.find(v => v.id === b.vendorId);
      return vendor?.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const SortIcon = ({ field }) => (
    <span className={clsx('ml-0.5 text-xs', sortField === field ? 'text-gray-700' : 'text-gray-300')}>
      {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '▼'}
    </span>
  );

  return (
    <div className="space-y-0">
      {/* Bill detail modal */}
      {selectedBill && (
        <BillDetailModal
          bill={selectedBill}
          vendor={data.vendors.find(v => v.id === selectedBill.vendorId)}
          onClose={() => setSelectedBill(null)}
          onPayBill={handleMarkBillPaid}
        />
      )}
      {/* Sub-tab Nav */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center">
          {[
            { key: 'expenses', label: 'Expenses', path: '/expenses' },
            { key: 'bills', label: 'Bills', path: '/expenses/bills' },
            { key: 'vendors', label: 'Vendors', path: '/expenses/vendors' },
          ].map(tab => (
            <Link
              key={tab.key}
              to={tab.path}
              onClick={() => { setActiveTab(tab.key); setSearch(''); }}
              className={clsx(
                'px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.key
                  ? 'border-qb-green text-qb-green'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Expenses tab ── */}
      {activeTab === 'expenses' && (
        <div className="space-y-4 pt-4">
          {showExpenseForm && (
            <NewExpenseForm
              vendors={data.vendors}
              onSubmit={handleAddExpense}
              onCancel={() => setShowExpenseForm(false)}
            />
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowNewTxDropdown(v => !v)}
                  className="flex items-center gap-1 bg-qb-green text-white text-sm px-3 py-1.5 rounded font-medium hover:bg-qb-green-hover"
                >
                  <Plus className="w-4 h-4" /> New transaction <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showNewTxDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 w-44">
                    {EXPENSE_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => { setShowExpenseForm(true); setShowNewTxDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="border border-gray-300 rounded text-sm px-2 py-1.5 text-gray-600 focus:ring-qb-green focus:border-qb-green"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="">All types</option>
                {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm w-48 focus:ring-qb-green focus:border-qb-green"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded"><Printer className="w-4 h-4" /></button>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded"><Download className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded border-gray-300 text-qb-green" /></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('date')}>DATE <SortIcon field="date" /></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TYPE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NO.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('payee')}>PAYEE <SortIcon field="payee" /></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('category')}>CATEGORY <SortIcon field="category" /></th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('amount')}>TOTAL <SortIcon field="amount" /></th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ACTION</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-sm text-gray-400">No expenses found</td></tr>
                )}
                {filteredExpenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedExpense(expense)}>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 text-qb-green" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{expense.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{expense.type || 'Expense'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{expense.number || '—'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{expense.payee || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{expense.category || '—'}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">${expense.amount?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedExpense(expense)} className="text-xs text-qb-blue hover:underline">Edit</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => handleDuplicate(expense)} className="text-xs text-gray-500 hover:text-gray-700">Duplicate</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => deleteExpense(expense.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Bills tab ── */}
      {activeTab === 'bills' && (
        <div className="space-y-4 pt-4">
          {showBillForm && (
            <NewBillForm
              vendors={data.vendors}
              onSubmit={handleAddBill}
              onCancel={() => setShowBillForm(false)}
            />
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowBillForm(true)} className="flex items-center gap-1 bg-qb-green text-white text-sm px-3 py-1.5 rounded font-medium hover:bg-qb-green-hover">
                <Plus className="w-4 h-4" /> New bill
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bills..."
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm w-48 focus:ring-qb-green focus:border-qb-green"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded border-gray-300 text-qb-green" /></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill no.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-sm text-gray-400">No bills found</td></tr>
                )}
                {filteredBills.map(bill => {
                  const vendor = data.vendors.find(v => v.id === bill.vendorId);
                  return (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300 text-qb-green" /></td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{vendor?.name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{bill.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{bill.dueDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="text-qb-blue hover:underline font-medium"
                        >
                          {bill.number}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">${bill.total?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('px-2 py-0.5 text-xs font-semibold rounded-full',
                          bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          bill.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        )}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {bill.status !== 'Paid' && (
                          <button
                            onClick={() => handleMarkBillPaid(bill)}
                            className="text-xs text-qb-green hover:underline font-medium"
                          >
                            Pay bill
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Vendors tab ── */}
      {activeTab === 'vendors' && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowBatchDropdown(v => !v)}
                  className="flex items-center gap-1 text-sm text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
                >
                  Batch actions <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showBatchDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 w-44">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        const ids = Array.from(selectedVendorIds);
                        const vendorNames = ids.map(id => {
                          const v = data.vendors.find(v => v.id === id);
                          return v ? v.name : id;
                        });
                        setEmailSentBanner(`Email sent to ${vendorNames.length} vendor${vendorNames.length > 1 ? 's' : ''}: ${vendorNames.join(', ')}`);
                        setTimeout(() => setEmailSentBanner(null), 4000);
                        setSelectedVendorIds(new Set());
                        setShowBatchDropdown(false);
                      }}
                    >
                      Email selected
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => {
                        selectedVendorIds.forEach(id => deleteVendor(id));
                        setSelectedVendorIds(new Set());
                        setShowBatchDropdown(false);
                      }}
                    >
                      Delete selected
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm w-48 focus:ring-qb-green focus:border-qb-green"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => { setEditingVendor(null); setShowVendorModal(true); }}
                className="flex items-center gap-1 bg-qb-green text-white text-sm px-3 py-1.5 rounded font-medium hover:bg-qb-green-hover"
              >
                <Plus className="w-4 h-4" /> New vendor
              </button>
            </div>
          </div>

          {emailSentBanner && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-2 rounded-lg flex items-center justify-between">
              <span>{emailSentBanner}</span>
              <button onClick={() => setEmailSentBanner(null)} className="ml-2 text-green-600 hover:text-green-800"><X className="w-4 h-4" /></button>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded border-gray-300 text-qb-green" /></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Open Balance</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-400">No vendors found</td></tr>
                )}
                {filteredVendors.map(vendor => {
                  const openBal = data.bills
                    .filter(b => b.vendorId === vendor.id && b.status !== 'Paid')
                    .reduce((s, b) => s + b.total, 0);
                  return (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-qb-green"
                          checked={selectedVendorIds.has(vendor.id)}
                          onChange={() => setSelectedVendorIds(prev => {
                            const next = new Set(prev);
                            next.has(vendor.id) ? next.delete(vendor.id) : next.add(vendor.id);
                            return next;
                          })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setEditingVendor(vendor); setShowVendorModal(true); }}
                          className="text-sm font-semibold text-qb-blue hover:underline"
                        >
                          {vendor.name}
                        </button>
                        {vendor.company && <div className="text-xs text-gray-400">{vendor.company}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{vendor.phone || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{vendor.email || '—'}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        {openBal > 0 ? (
                          <span className="text-red-600">${openBal.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          vendor={data.vendors.find(v => v.id === selectedExpense.vendorId)}
          onClose={() => setSelectedExpense(null)}
          onSave={updateExpense}
        />
      )}

      {showVendorModal && (
        <VendorModal
          vendor={editingVendor}
          onSave={(v) => editingVendor ? updateVendor(v) : addVendor(v)}
          onClose={() => { setShowVendorModal(false); setEditingVendor(null); }}
        />
      )}
    </div>
  );
}
