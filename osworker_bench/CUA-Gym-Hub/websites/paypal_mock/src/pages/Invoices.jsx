
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency, generateId } from '../lib/utils';
import { Plus, FileText, Trash2, CheckCircle, Send, Eye, X } from 'lucide-react';

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-800',
  sent: 'bg-blue-100 text-blue-800',
  draft: 'bg-gray-100 text-gray-600',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-400 line-through',
};

const ALL_TABS = ['all', 'draft', 'sent', 'paid', 'overdue'];

const getDefaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
};

export default function Invoices() {
  const { state, createInvoice, updateInvoice, deleteInvoice } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    dueDate: getDefaultDueDate(),
    note: '',
    terms: 'Net 30',
    items: [{ id: generateId(), description: '', quantity: 1, price: '' }],
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id: generateId(), description: '', quantity: 1, price: '' },
      ],
    });
  };

  const handleRemoveItem = (id) => {
    if (formData.items.length === 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== id),
    });
  };

  const handleItemChange = (id, field, value) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + qty * price;
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = calculateTotal();

    createInvoice({
      recipientName: formData.recipientName,
      recipientEmail: formData.recipientEmail,
      amount: total,
      dueDate: new Date(formData.dueDate).toISOString(),
      note: formData.note,
      terms: formData.terms,
      items: formData.items.map((item) => ({
        description: item.description,
        quantity: parseFloat(item.quantity),
        price: parseFloat(item.price),
      })),
    });

    setIsCreating(false);
    setFormData({
      recipientName: '',
      recipientEmail: '',
      dueDate: getDefaultDueDate(),
      note: '',
      terms: 'Net 30',
      items: [{ id: generateId(), description: '', quantity: 1, price: '' }],
    });
  };

  const handleMarkPaid = (inv) => {
    updateInvoice(inv.id, {
      status: 'paid',
      paidDate: new Date().toISOString(),
    });
    if (selectedInvoice && selectedInvoice.id === inv.id) {
      setSelectedInvoice({ ...inv, status: 'paid', paidDate: new Date().toISOString() });
    }
  };

  const handleMarkSent = (inv) => {
    updateInvoice(inv.id, { status: 'sent' });
    if (selectedInvoice && selectedInvoice.id === inv.id) {
      setSelectedInvoice({ ...inv, status: 'sent' });
    }
  };

  const handleDelete = (invoice) => {
    deleteInvoice(invoice.id);
    if (selectedInvoice && selectedInvoice.id === invoice.id) {
      setSelectedInvoice(null);
    }
    setInvoiceToDelete(null);
  };

  const filteredInvoices =
    statusFilter === 'all'
      ? state.invoices
      : state.invoices.filter((inv) => inv.status === statusFilter);

  const tabCounts = ALL_TABS.reduce((acc, tab) => {
    acc[tab] =
      tab === 'all'
        ? state.invoices.length
        : state.invoices.filter((inv) => inv.status === tab).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-full font-medium hover:bg-brand-dark transition-colors"
        >
          <Plus className="h-4 w-4" /> Create Invoice
        </button>
      </div>

      {isCreating ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-6">New Invoice</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
                  value={formData.recipientName}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
                  value={formData.recipientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientEmail: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
                  value={formData.terms}
                  onChange={(e) =>
                    setFormData({ ...formData, terms: e.target.value })
                  }
                >
                  <option value="Due on receipt">Due on receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-900">Items</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-sm text-brand hover:underline"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div className="flex-grow">
                      <input
                        type="text"
                        placeholder="Description"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(item.id, 'description', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        placeholder="Qty"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, 'quantity', e.target.value)
                        }
                        required
                        min="1"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        placeholder="Price"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(item.id, 'price', e.target.value)
                        }
                        required
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 mt-0.5"
                      disabled={formData.items.length === 1}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <span className="text-sm text-gray-500 mr-2">Total:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note to Recipient (Optional)
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand focus:border-transparent outline-none resize-none"
                rows="2"
                placeholder="Thank you for your business"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-brand text-white rounded-full font-medium hover:bg-brand-dark"
              >
                Send Invoice
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Status Filter Tabs */}
          <div className="flex gap-1 flex-wrap border-b border-gray-200">
            {ALL_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  statusFilter === tab
                    ? 'border-brand text-brand'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tabCounts[tab] > 0 && (
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                      statusFilter === tab
                        ? 'bg-brand text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tabCounts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="hover:underline"
                      >
                        {inv.number}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {inv.recipientName || '-'}
                      </p>
                      <p className="text-xs text-gray-400">{inv.recipientEmail}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          STATUS_STYLES[inv.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          title="View invoice"
                          className="p-1.5 text-gray-400 hover:text-brand rounded-full transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {inv.status === 'draft' && (
                          <button
                            onClick={() => handleMarkSent(inv)}
                            title="Mark as sent"
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full transition-colors"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        {(inv.status === 'sent' || inv.status === 'overdue') && (
                          <button
                            onClick={() => handleMarkPaid(inv)}
                            title="Mark as paid"
                            className="p-1.5 text-gray-400 hover:text-green-600 rounded-full transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setInvoiceToDelete(inv)}
                          title="Delete invoice"
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInvoices.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>
                  {statusFilter === 'all'
                    ? 'No invoices yet'
                    : `No ${statusFilter} invoices`}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 my-4">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedInvoice.number}
                </h2>
                <span
                  className={`mt-1 inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                    STATUS_STYLES[selectedInvoice.status] ||
                    'bg-gray-100 text-gray-600'
                  }`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                  Bill To
                </p>
                <p className="font-semibold text-gray-900">
                  {selectedInvoice.recipientName}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedInvoice.recipientEmail}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                  Invoice Details
                </p>
                <p className="text-sm text-gray-600">
                  Created:{' '}
                  {new Date(selectedInvoice.createdDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                </p>
                {selectedInvoice.paidDate && (
                  <p className="text-sm text-green-600">
                    Paid:{' '}
                    {new Date(selectedInvoice.paidDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Terms: {selectedInvoice.terms}
                </p>
              </div>
            </div>

            <table className="w-full mb-6 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(selectedInvoice.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 text-gray-900">{item.description}</td>
                    <td className="py-3 px-3 text-right text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-600">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.quantity * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td
                    colSpan="3"
                    className="py-3 px-3 text-right font-bold text-gray-900"
                  >
                    Total
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 text-lg">
                    {formatCurrency(selectedInvoice.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {selectedInvoice.note && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                  Note
                </p>
                <p className="text-sm text-gray-700">{selectedInvoice.note}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
              {selectedInvoice.status === 'draft' && (
                <button
                  onClick={() => handleMarkSent(selectedInvoice)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4" /> Send Invoice
                </button>
              )}
              {(selectedInvoice.status === 'sent' ||
                selectedInvoice.status === 'overdue') && (
                <button
                  onClick={() => handleMarkPaid(selectedInvoice)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" /> Mark as Paid
                </button>
              )}
              <button
                onClick={() => {
                  setInvoiceToDelete(selectedInvoice);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="ml-auto px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Invoice Delete Modal */}
      {invoiceToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Delete Invoice</h2>
              <button
                onClick={() => setInvoiceToDelete(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Delete {invoiceToDelete.number} for {invoiceToDelete.recipientName}?
              This removes the invoice from the list while leaving unrelated
              payments untouched.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setInvoiceToDelete(null)}
                className="flex-1 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(invoiceToDelete)}
                className="flex-1 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
