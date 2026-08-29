import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { Plus, Mail, Printer, X } from 'lucide-react';
import { clsx } from 'clsx';
import { v4 as uuidv4 } from 'uuid';

// Invoice detail modal
function InvoiceDetailModal({ invoice, customer, onClose, onMarkPaid }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Invoice #{invoice.number}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Customer</div>
              <div className="text-sm font-medium text-gray-900">{customer?.name || '-'}</div>
              {customer?.company && <div className="text-xs text-gray-500">{customer.company}</div>}
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</div>
              <span className={clsx(
                "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                invoice.status === 'Paid' ? "bg-green-100 text-green-800" :
                invoice.status === 'Overdue' ? "bg-red-100 text-red-800" :
                invoice.status === 'Partial' ? "bg-yellow-100 text-yellow-800" :
                invoice.status === 'Draft' ? "bg-gray-100 text-gray-600" :
                "bg-blue-100 text-blue-800"
              )}>
                {invoice.status}
              </span>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Date</div>
              <div className="text-sm text-gray-900">{invoice.date}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</div>
              <div className="text-sm text-gray-900">{invoice.dueDate}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Terms</div>
              <div className="text-sm text-gray-900">{invoice.terms}</div>
            </div>
          </div>
          <table className="min-w-full border border-gray-200 rounded mb-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Rate</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(invoice.items || []).map((item, i) => (
                <tr key={item.id || i}>
                  <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                  <td className="px-4 py-2 text-sm text-right text-gray-600">{item.qty}</td>
                  <td className="px-4 py-2 text-sm text-right text-gray-600">${item.rate?.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">${item.amount?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end">
            <div className="w-56 space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${invoice.subtotal?.toFixed(2)}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>${invoice.tax?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-1">
                <span>Total</span>
                <span>${invoice.total?.toFixed(2)}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Paid</span>
                  <span>${invoice.paidAmount?.toFixed(2)}</span>
                </div>
              )}
              {invoice.paidAmount > 0 && invoice.status !== 'Paid' && (
                <div className="flex justify-between text-sm font-bold text-red-600 border-t border-gray-200 pt-1">
                  <span>Balance Due</span>
                  <span>${(invoice.total - invoice.paidAmount).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          {invoice.message && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600 border border-gray-200">
              <div className="font-medium text-gray-700 mb-1">Message</div>
              {invoice.message}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm">
            Close
          </button>
          {invoice.status !== 'Paid' && (
            <button
              onClick={() => { onMarkPaid(invoice); onClose(); }}
              className="px-4 py-2 bg-qb-green text-white rounded-md hover:bg-qb-green-hover text-sm"
            >
              Receive Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Customer create/edit modal
function CustomerModal({ customer, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    company: customer?.company || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    notes: customer?.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...(customer || {}),
      id: customer?.id || uuidv4(),
      ...formData,
      balance: customer?.balance || 0,
      isActive: true,
      createdAt: customer?.createdAt || new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">{customer ? 'Edit Customer' : 'New Customer'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
              <input required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-green focus:border-qb-green text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-green focus:border-qb-green text-sm" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-green focus:border-qb-green text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-green focus:border-qb-green text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-green focus:border-qb-green text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={2} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-green focus:border-qb-green text-sm" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-qb-green text-white rounded-md hover:bg-qb-green-hover text-sm">{customer ? 'Save' : 'Add Customer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Product create/edit modal
function ProductModal({ product, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    type: product?.type || 'Service',
    price: product?.price?.toString() || '',
    cost: product?.cost?.toString() || '',
    category: product?.category || 'Services',
    sku: product?.sku || '',
    isTaxable: product?.isTaxable || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...(product || {}),
      id: product?.id || uuidv4(),
      ...formData,
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || 0,
      isActive: true,
      quantityOnHand: product?.quantityOnHand ?? null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">{product ? 'Edit Product/Service' : 'New Product/Service'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
              <input required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-green focus:border-qb-green text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-green focus:border-qb-green text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Service">Service</option>
                <option value="Product">Product</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-green focus:border-qb-green text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Services">Services</option>
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
                <option value="Furniture">Furniture</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sales Price</label>
              <input type="number" step="0.01" min="0" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-green focus:border-qb-green text-sm" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
              <input type="number" step="0.01" min="0" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-green focus:border-qb-green text-sm" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-green focus:border-qb-green text-sm" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="isTaxable" className="rounded border-gray-300 text-qb-green mr-2" checked={formData.isTaxable} onChange={e => setFormData({...formData, isTaxable: e.target.checked})} />
              <label htmlFor="isTaxable" className="text-sm font-medium text-gray-700">Taxable</label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={2} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-qb-green focus:border-qb-green text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-qb-green text-white rounded-md hover:bg-qb-green-hover text-sm">{product ? 'Save' : 'Add Product/Service'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Sales({ initialTab = 'all-sales' }) {
  const { data, updateInvoice, addCustomer, updateCustomer, addProduct, updateProduct, addEmailDraft } = useStore();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [emailNotice, setEmailNotice] = useState('');

  const handleMarkPaid = (invoice) => {
    updateInvoice({
      ...invoice,
      status: 'Paid',
      paidAmount: invoice.total,
      paidDate: new Date().toISOString().split('T')[0]
    });
  };

  const handlePrintInvoice = (invoice, customer) => {
    const lines = (invoice.items || []).map(item =>
      `${item.description}  x${item.qty}  @$${item.rate?.toFixed(2)} = $${item.amount?.toFixed(2)}`
    ).join('\n');
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<pre style="font-family:monospace;padding:20px">INVOICE #${invoice.number}\nCustomer: ${customer?.name || ''}\nDate: ${invoice.date}  Due: ${invoice.dueDate}\n\n${lines}\n\nTotal: $${invoice.total?.toFixed(2)}\nStatus: ${invoice.status}</pre>`);
      win.print();
    }
  };

  const handleSendEmail = (invoice, customer) => {
    addEmailDraft({
      id: uuidv4(),
      type: 'invoice',
      invoiceId: invoice.id,
      to: customer?.email || '',
      subject: `Invoice #${invoice.number} from ${data.company?.name || 'Acme Corp'}`,
      body: `Dear ${customer?.name || 'Customer'},\n\nPlease find your invoice #${invoice.number} for $${invoice.total?.toFixed(2)} attached.\n\nDue date: ${invoice.dueDate}\n\nThank you for your business!\n${data.company?.name || 'Acme Corp'}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
    });
    setEmailNotice(`Email draft created for invoice #${invoice.number}${customer?.email ? ` to ${customer.email}` : ''}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-qb-text-primary">Sales</h1>
        <div className="flex space-x-2">
          {activeTab === 'customers' && (
            <button
              onClick={() => { setEditingCustomer(null); setShowCustomerModal(true); }}
              className="bg-qb-green text-white px-4 py-2 rounded font-medium hover:bg-qb-green-hover transition-colors text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> New customer
            </button>
          )}
          {activeTab === 'products' && (
            <button
              onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
              className="bg-qb-green text-white px-4 py-2 rounded font-medium hover:bg-qb-green-hover transition-colors text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> New product/service
            </button>
          )}
          {(activeTab === 'all-sales' || activeTab === 'invoices') && (
            <Link to="/sales/new-invoice" className="bg-qb-green text-white px-4 py-2 rounded font-medium hover:bg-qb-green-hover transition-colors text-sm">
              New invoice
            </Link>
          )}
        </div>
      </div>
      {emailNotice && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 flex justify-between">
          <span>{emailNotice}</span>
          <button onClick={() => setEmailNotice('')} className="text-green-700 hover:text-green-900">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all-sales', label: 'All Sales', path: '/sales' },
            { key: 'invoices', label: 'Invoices', path: '/sales/invoices' },
            { key: 'customers', label: 'Customers', path: '/sales/customers' },
            { key: 'products', label: 'Products and Services', path: '/sales/products' },
          ].map(tab => (
            <Link
              key={tab.path}
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

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {(activeTab === 'all-sales' || activeTab === 'invoices') && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.invoices.map((invoice) => {
                const customer = data.customers.find(c => c.id === invoice.customerId);
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-qb-blue cursor-pointer hover:underline" onClick={() => setSelectedInvoice(invoice)}>{invoice.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer?.name}</div>
                      {customer?.company && <div className="text-xs text-gray-400">{customer.company}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">${invoice.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        invoice.status === 'Paid' ? "bg-green-100 text-green-800" :
                        invoice.status === 'Overdue' ? "bg-red-100 text-red-800" :
                        invoice.status === 'Partial' ? "bg-yellow-100 text-yellow-800" :
                        invoice.status === 'Draft' ? "bg-gray-100 text-gray-600" :
                        "bg-blue-100 text-blue-800"
                      )}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {invoice.status !== 'Paid' && (
                          <button
                            onClick={() => handleMarkPaid(invoice)}
                            className="text-qb-green hover:text-qb-green-hover text-xs font-medium"
                          >
                            Receive payment
                          </button>
                        )}
                        <button onClick={() => handlePrintInvoice(invoice, customer)} className="text-gray-400 hover:text-gray-600" title="Print"><Printer className="w-4 h-4" /></button>
                        <button onClick={() => handleSendEmail(invoice, customer)} className="text-gray-400 hover:text-gray-600" title="Email"><Mail className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'customers' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Open Balance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.customers.filter(c => c.isActive).map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    {customer.company && <div className="text-xs text-gray-400">{customer.company}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">${customer.balance.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => { setEditingCustomer(customer); setShowCustomerModal(true); }}
                      className="text-qb-blue hover:underline text-xs font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'products' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty on Hand</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.products.filter(p => p.isActive).map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      "px-2 inline-flex text-xs leading-5 font-medium rounded-full",
                      product.type === 'Service' ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                    )}>
                      {product.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{product.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{product.cost > 0 ? `$${product.cost.toFixed(2)}` : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{product.quantityOnHand !== null ? product.quantityOnHand : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => { setEditingProduct(product); setShowProductModal(true); }}
                      className="text-qb-blue hover:underline text-xs font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invoice detail modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          customer={data.customers.find(c => c.id === selectedInvoice.customerId)}
          onClose={() => setSelectedInvoice(null)}
          onMarkPaid={handleMarkPaid}
        />
      )}

      {/* Customer modal */}
      {showCustomerModal && (
        <CustomerModal
          customer={editingCustomer}
          onSave={(c) => editingCustomer ? updateCustomer(c) : addCustomer(c)}
          onClose={() => { setShowCustomerModal(false); setEditingCustomer(null); }}
        />
      )}

      {/* Product modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onSave={(p) => editingProduct ? updateProduct(p) : addProduct(p)}
          onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
}
