import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, FileText, X, Download } from 'lucide-react';
import { downloadInvoicePdf } from '../lib/files';

const PDFPreviewModal = ({ invoice, company, onClose, onDownload }) => {
  const total = invoice.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = document.getElementById('invoice-preview-content');
      printWindow.document.write(`<html><head><title>Invoice #${invoice.number}</title></head><body>${content ? content.innerHTML : ''}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Invoice Preview</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div id="invoice-preview-content" className="bg-white shadow-sm p-8 min-h-[800px] border border-gray-200 mx-auto max-w-2xl">
            <div className="flex justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">INVOICE</h1>
                <div className="text-gray-600"># {invoice.number}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-xl text-gray-800">{company?.name || 'Acme Corp'}</div>
                <div className="text-gray-500">{company?.address || '123 Business Rd, San Francisco, CA 94105'}</div>
                <div className="text-gray-500">{company?.phone || ''}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-sm font-bold text-gray-600 uppercase mb-1">Bill To</div>
                <div className="text-gray-800 font-medium">{invoice.customerName || 'Customer Name'}</div>
              </div>
              <div className="text-right">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Date:</div>
                  <div className="font-medium">{invoice.date}</div>
                  <div className="text-gray-600">Due Date:</div>
                  <div className="font-medium">{invoice.dueDate}</div>
                  <div className="text-gray-600">Terms:</div>
                  <div className="font-medium">{invoice.terms || 'Net 30'}</div>
                </div>
              </div>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-2 font-bold text-gray-800">Description</th>
                  <th className="text-right py-2 font-bold text-gray-800">Qty</th>
                  <th className="text-right py-2 font-bold text-gray-800">Rate</th>
                  <th className="text-right py-2 font-bold text-gray-800">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-2 text-gray-800">{item.description}</td>
                    <td className="py-2 text-right text-gray-800">{item.qty}</td>
                    <td className="py-2 text-right text-gray-800">${item.rate.toFixed(2)}</td>
                    <td className="py-2 text-right text-gray-800">${(item.qty * item.rate).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-1/2 space-y-1">
                <div className="flex justify-between py-1 text-gray-600">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-xl">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {invoice.message && (
              <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">{invoice.message}</div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Close
          </button>
          <button onClick={onDownload} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </button>
          <button onClick={handlePrint} className="px-4 py-2 bg-qb-blue text-white rounded-md hover:bg-qb-hover flex items-center">
            <FileText className="w-4 h-4 mr-2" /> Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CreateInvoice() {
  const { data, addInvoice, addEmailDraft } = useStore();
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [terms, setTerms] = useState('Net 30');
  const [message, setMessage] = useState('');
  const [items, setItems] = useState([
    { id: uuidv4(), productId: '', description: '', qty: 1, rate: 0 }
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [formError, setFormError] = useState('');
  const [draftNotice, setDraftNotice] = useState('');

  const handleProductChange = (index, productId) => {
    const product = data.products.find(p => p.id === productId);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId,
      description: product ? product.name : '',
      rate: product ? product.price : 0
    };
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: uuidv4(), productId: '', description: '', qty: 1, rate: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  };

  const buildInvoice = (status) => {
    const subtotal = calculateSubtotal();
    // Calculate tax based on taxable products
    const tax = items.reduce((sum, item) => {
      const product = data.products.find(p => p.id === item.productId);
      if (product?.isTaxable) {
        return sum + (item.qty * item.rate * 0.08);
      }
      return sum;
    }, 0);
    const total = subtotal + tax;

    return {
      id: uuidv4(),
      number: (1000 + data.invoices.length + 1).toString(),
      customerId,
      date,
      dueDate,
      items: items.map(item => ({
        ...item,
        amount: item.qty * item.rate,
      })),
      subtotal,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      status,
      paidAmount: 0,
      paidDate: null,
      terms,
      message,
      createdAt: new Date().toISOString()
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!customerId) {
      setFormError('Please select a customer before saving.');
      return;
    }
    const newInvoice = buildInvoice('Sent');
    addInvoice(newInvoice);
    navigate('/sales');
  };

  const handleSaveAndSend = () => {
    setFormError('');
    if (!customerId) {
      setFormError('Please select a customer before saving.');
      return;
    }
    const newInvoice = buildInvoice('Sent');
    addInvoice(newInvoice);
    const customer = data.customers.find(c => c.id === customerId);
    addEmailDraft({
      id: uuidv4(),
      type: 'invoice',
      invoiceId: newInvoice.id,
      to: customer?.email || '',
      subject: `Invoice #${newInvoice.number} from ${data.company?.name || 'Acme Corp'}`,
      body: `Dear ${customer?.name || 'Customer'},\n\nPlease find your invoice #${newInvoice.number} for $${newInvoice.total.toFixed(2)} attached.\n\nDue date: ${newInvoice.dueDate}\n\nThank you for your business!\n${data.company?.name || 'Acme Corp'}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
    });
    navigate('/sales');
  };

  const handlePreview = () => {
    setFormError('');
    if (!customerId) {
      setFormError('Please select a customer to preview the invoice.');
      return;
    }
    setShowPreview(true);
  };

  const customer = data.customers.find(c => c.id === customerId);
  const subtotal = calculateSubtotal();
  const taxAmount = items.reduce((sum, item) => {
    const product = data.products.find(p => p.id === item.productId);
    if (product?.isTaxable) return sum + (item.qty * item.rate * 0.08);
    return sum;
  }, 0);
  const invoiceTotal = subtotal + taxAmount;
  const previewInvoice = {
    number: (1000 + data.invoices.length + 1).toString(),
    date,
    dueDate,
    terms,
    message,
    items: items.map(item => ({ ...item, amount: item.qty * item.rate })),
    customerName: customer?.name,
    subtotal,
    tax: Math.round(taxAmount * 100) / 100,
    total: Math.round(invoiceTotal * 100) / 100,
  };

  const handleDownloadPreview = () => {
    downloadInvoicePdf(previewInvoice, data.company);
    setDraftNotice(`Downloaded invoice preview #${previewInvoice.number}.`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Invoice no. {1000 + data.invoices.length + 1}</h1>
      </div>

      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {formError}
        </div>
      )}
      {draftNotice && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
          {draftNotice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer <span className="text-red-500">*</span></label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-blue focus:border-qb-blue"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select a customer</option>
              {data.customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terms</label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-blue focus:border-qb-blue"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            >
              <option value="Due on receipt">Due on receipt</option>
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Net 60">Net 60</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice date</label>
            <input
              type="date"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-blue focus:border-qb-blue"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
            <input
              type="date"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-blue focus:border-qb-blue"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Line Items */}
        <div>
          <table className="min-w-full divide-y divide-gray-200 mb-4">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Product/Service</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Qty</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Rate</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Amount</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td className="py-2 text-gray-400">{index + 1}</td>
                  <td className="py-2 pr-2">
                    <select
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-blue focus:border-qb-blue text-sm"
                      value={item.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                    >
                      <option value="">Select...</option>
                      {data.products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-blue focus:border-qb-blue text-sm"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-blue focus:border-qb-blue text-sm text-right"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-blue focus:border-qb-blue text-sm text-right"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-2 text-right text-sm font-medium">
                    ${(item.qty * item.rate).toFixed(2)}
                  </td>
                  <td className="py-2 text-center">
                    <button type="button" onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={addItem}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded px-3 py-1"
          >
            <Plus className="w-4 h-4 mr-1" /> Add line
          </button>
        </div>

        {/* Message field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message on invoice</label>
          <textarea
            rows={2}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-blue focus:border-qb-blue text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Thank you for your business!"
          />
        </div>

        {/* Footer / Total */}
        <div className="flex justify-end border-t border-gray-200 pt-4">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {taxAmount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (8%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>${invoiceTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between border-t border-gray-200 pt-6">
          <div className="space-x-3">
            <button type="button" onClick={() => navigate('/sales')} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex-inline items-center"
            >
              <FileText className="w-4 h-4 mr-2 inline" /> Preview PDF
            </button>
          </div>
          <div className="space-x-3">
            <button
              type="button"
              onClick={handleSaveAndSend}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Save and send
            </button>
            <button type="submit" className="px-4 py-2 bg-qb-blue text-white rounded-md hover:bg-qb-hover">
              Save and close
            </button>
          </div>
        </div>
      </form>

      {showPreview && (
        <PDFPreviewModal
          invoice={previewInvoice}
          company={data.company}
          onClose={() => setShowPreview(false)}
          onDownload={handleDownloadPreview}
        />
      )}
    </div>
  );
}
