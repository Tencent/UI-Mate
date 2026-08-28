import { v4 as uuidv4 } from 'uuid';
import { subDays, format } from 'date-fns';

const BASE_STORAGE_KEY = 'qb_mock_data';
const BASE_INITIAL_KEY = 'qb_mock_initial';

function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) {
        return data.stored_state;
      }
    }
  } catch (e) {
    console.log('No custom state available');
  }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state }),
    keepalive: true,
  }).catch(() => {});
};

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const data = deepMergeWithDefaults(generateInitialData(), customState);
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
    }
    return JSON.parse(stored);
  }

  const data = generateInitialData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

// --- Normalization helpers ---

function normalizeCustomer(customer, index) {
  return {
    id: customer.id || `c_custom_${index}`,
    name: customer.name || 'Unknown Customer',
    company: customer.company || '',
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    balance: typeof customer.balance === 'number' ? customer.balance : 0,
    notes: customer.notes || '',
    isActive: customer.isActive !== false,
    createdAt: customer.createdAt || new Date().toISOString().split('T')[0],
  };
}

function normalizeVendor(vendor, index) {
  return {
    id: vendor.id || `v_custom_${index}`,
    name: vendor.name || 'Unknown Vendor',
    company: vendor.company || '',
    email: vendor.email || '',
    phone: vendor.phone || '',
    address: vendor.address || '',
    balance: typeof vendor.balance === 'number' ? vendor.balance : 0,
    isActive: vendor.isActive !== false,
    createdAt: vendor.createdAt || new Date().toISOString().split('T')[0],
  };
}

function normalizeProduct(product, index) {
  return {
    id: product.id || `p_custom_${index}`,
    name: product.name || 'Unknown Product',
    description: product.description || '',
    type: product.type || 'Service',
    price: typeof product.price === 'number' ? product.price : 0,
    cost: typeof product.cost === 'number' ? product.cost : 0,
    category: product.category || 'Services',
    sku: product.sku || '',
    isActive: product.isActive !== false,
    isTaxable: product.isTaxable || false,
    quantityOnHand: product.quantityOnHand ?? null,
  };
}

function normalizeInvoice(invoice, index) {
  return {
    id: invoice.id || `inv_custom_${index}`,
    number: invoice.number || `${1000 + index}`,
    customerId: invoice.customerId || '',
    date: invoice.date || new Date().toISOString().split('T')[0],
    dueDate: invoice.dueDate || new Date().toISOString().split('T')[0],
    items: Array.isArray(invoice.items) ? invoice.items : [],
    subtotal: typeof invoice.subtotal === 'number' ? invoice.subtotal : (typeof invoice.total === 'number' ? invoice.total : 0),
    tax: typeof invoice.tax === 'number' ? invoice.tax : 0,
    total: typeof invoice.total === 'number' ? invoice.total : 0,
    status: invoice.status || 'Draft',
    paidAmount: typeof invoice.paidAmount === 'number' ? invoice.paidAmount : 0,
    paidDate: invoice.paidDate || null,
    terms: invoice.terms || 'Net 30',
    message: invoice.message || '',
    createdAt: invoice.createdAt || new Date().toISOString(),
  };
}

function normalizeEstimate(estimate, index) {
  return {
    id: estimate.id || `est_custom_${index}`,
    number: estimate.number || `E-${1000 + index}`,
    customerId: estimate.customerId || '',
    date: estimate.date || new Date().toISOString().split('T')[0],
    expiryDate: estimate.expiryDate || new Date().toISOString().split('T')[0],
    items: Array.isArray(estimate.items) ? estimate.items : [],
    total: typeof estimate.total === 'number' ? estimate.total : 0,
    status: estimate.status || 'Pending',
  };
}

function normalizeExpense(expense, index) {
  return {
    id: expense.id || `exp_custom_${index}`,
    date: expense.date || new Date().toISOString().split('T')[0],
    payee: expense.payee || '',
    vendorId: expense.vendorId || null,
    category: expense.category || 'Uncategorized',
    amount: typeof expense.amount === 'number' ? expense.amount : 0,
    description: expense.description || '',
    accountId: expense.accountId || '',
    receipt: expense.receipt || '',
    isBillable: expense.isBillable || false,
    customerId: expense.customerId || null,
    status: expense.status || 'Cleared',
  };
}

function normalizeBill(bill, index) {
  return {
    id: bill.id || `bill_custom_${index}`,
    vendorId: bill.vendorId || '',
    number: bill.number || `B-${5000 + index}`,
    date: bill.date || new Date().toISOString().split('T')[0],
    dueDate: bill.dueDate || new Date().toISOString().split('T')[0],
    items: Array.isArray(bill.items) ? bill.items : [],
    total: typeof bill.total === 'number' ? bill.total : 0,
    status: bill.status || 'Open',
    paidDate: bill.paidDate || null,
  };
}

function normalizeAccount(account, index) {
  return {
    id: account.id || `acc_custom_${index}`,
    number: account.number || '',
    name: account.name || 'Unknown Account',
    type: account.type || 'Bank',
    detailType: account.detailType || '',
    balance: typeof account.balance === 'number' ? account.balance : 0,
    bankBalance: typeof account.bankBalance === 'number' ? account.bankBalance : (typeof account.balance === 'number' ? account.balance : 0),
    isActive: account.isActive !== false,
  };
}

function normalizeTransaction(tx, index) {
  return {
    id: tx.id || `tx_custom_${index}`,
    accountId: tx.accountId || '',
    date: tx.date || new Date().toISOString().split('T')[0],
    description: tx.description || '',
    payee: tx.payee || '',
    amount: typeof tx.amount === 'number' ? tx.amount : 0,
    type: tx.type || 'debit',
    category: tx.category || 'Uncategorized',
    matchedTo: tx.matchedTo || null,
    status: tx.status || 'pending',
    isReconciled: tx.isReconciled || false,
  };
}

function normalizeEmployee(emp, index) {
  return {
    id: emp.id || `emp_custom_${index}`,
    name: emp.name || 'Unknown',
    email: emp.email || '',
    role: emp.role || '',
    department: emp.department || '',
    salary: typeof emp.salary === 'number' ? emp.salary : 0,
    payFrequency: emp.payFrequency || 'Bi-weekly',
    startDate: emp.startDate || '',
    isActive: emp.isActive !== false,
  };
}

function normalizeProject(proj, index) {
  return {
    id: proj.id || `proj_custom_${index}`,
    name: proj.name || 'Untitled Project',
    customerId: proj.customerId || '',
    status: proj.status || 'Planning',
    budget: typeof proj.budget === 'number' ? proj.budget : 0,
    spent: typeof proj.spent === 'number' ? proj.spent : 0,
    startDate: proj.startDate || '',
    endDate: proj.endDate || null,
    description: proj.description || '',
  };
}

// Deep merge custom state with defaults
function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;

  const result = { ...defaults };

  const arrayNormalizers = {
    customers: normalizeCustomer,
    vendors: normalizeVendor,
    products: normalizeProduct,
    invoices: normalizeInvoice,
    estimates: normalizeEstimate,
    expenses: normalizeExpense,
    bills: normalizeBill,
    accounts: normalizeAccount,
    transactions: normalizeTransaction,
    employees: normalizeEmployee,
    projects: normalizeProject,
  };

  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (arrayNormalizers[key] && Array.isArray(custom[key])) {
        result[key] = custom[key].map((item, i) => arrayNormalizers[key](item, i));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object') {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }

  return result;
}

export const generateInitialData = () => {
  const today = new Date();

  return {
    // Company singleton
    company: {
      name: 'Acme Corp',
      address: '123 Business Rd, San Francisco, CA 94105',
      phone: '(555) 123-4567',
      email: 'admin@acmecorp.com',
      website: 'www.acmecorp.com',
      industry: 'Technology Services',
      taxId: '12-3456789',
      fiscalYearStart: 'January',
      accountingMethod: 'Accrual',
    },

    // Customers (10 records)
    customers: [
      { id: 'c1', name: "Amy's Bird Sanctuary", company: "Amy's Bird Sanctuary LLC", email: 'amy@birdsanctuary.com', phone: '(650) 555-0101', address: '456 Nature Way, Bayshore, CA 94326', balance: 239.00, notes: 'Prefers email communication', isActive: true, createdAt: '2024-01-15' },
      { id: 'c2', name: "Bill's Windsurf Shop", company: "Bill's Windsurf Shop Inc.", email: 'bill@windsurfshop.com', phone: '(831) 555-0102', address: '78 Ocean Blvd, Santa Cruz, CA 95060', balance: 85.00, notes: '', isActive: true, createdAt: '2024-01-20' },
      { id: 'c3', name: 'Cool Cars', company: 'Cool Cars Automotive', email: 'info@coolcars.com', phone: '(408) 555-0103', address: '1200 Auto Row, San Jose, CA 95112', balance: 0.00, notes: 'Net 15 terms', isActive: true, createdAt: '2024-02-01' },
      { id: 'c4', name: 'Diego Rodriguez', company: '', email: 'diego@email.com', phone: '(415) 555-0104', address: '890 Mission St, San Francisco, CA 94103', balance: 450.00, notes: '', isActive: true, createdAt: '2024-02-10' },
      { id: 'c5', name: 'Dukes Basketball Camp', company: 'Dukes Basketball Camp LLC', email: 'dukes@basketballcamp.com', phone: '(510) 555-0105', address: '333 Court Dr, Oakland, CA 94601', balance: 0.00, notes: 'Seasonal client', isActive: true, createdAt: '2024-02-15' },
      { id: 'c6', name: 'Freeman Sporting Goods', company: 'Freeman Sporting Goods Inc.', email: 'orders@freemangoods.com', phone: '(925) 555-0106', address: '55 Twin Lane, Walnut Creek, CA 94596', balance: 85.00, notes: 'Sub-customer: 55 Twin Lane', isActive: true, createdAt: '2024-03-01' },
      { id: 'c7', name: 'Geeta Kalapatapu', company: '', email: 'geeta@consulting.com', phone: '(650) 555-0107', address: '400 Tech Park, Palo Alto, CA 94301', balance: 0.00, notes: 'Referred by Diego', isActive: true, createdAt: '2024-03-05' },
      { id: 'c8', name: "Jeff's Jalopies", company: "Jeff's Jalopies Auto Sales", email: 'jeff@jalopies.com', phone: '(707) 555-0108', address: '2100 Car Lot Rd, Petaluma, CA 94952', balance: 1200.00, notes: 'Net 30 terms preferred', isActive: true, createdAt: '2024-03-10' },
      { id: 'c9', name: 'Kookies by Kathy', company: 'Kookies by Kathy', email: 'kathy@kookies.com', phone: '(831) 555-0109', address: '55 Baker St, Monterey, CA 93940', balance: 0.00, notes: '', isActive: true, createdAt: '2024-03-15' },
      { id: 'c10', name: "Pye's Cakes", company: "Pye's Cakes & Pastries", email: 'pye@pyescakes.com', phone: '(408) 555-0110', address: '789 Dessert Ave, Campbell, CA 95008', balance: 340.00, notes: 'Monthly recurring order', isActive: true, createdAt: '2024-03-20' },
    ],

    // Vendors (8 records)
    vendors: [
      { id: 'v1', name: 'Office Depot', company: 'Office Depot Inc.', email: 'orders@officedepot.com', phone: '(800) 463-3768', address: '6600 North Military Trail, Boca Raton, FL 33496', balance: 250.00, isActive: true, createdAt: '2024-01-10' },
      { id: 'v2', name: 'Google Cloud', company: 'Google LLC', email: 'billing@google.com', phone: '(855) 289-5765', address: '1600 Amphitheatre Parkway, Mountain View, CA 94043', balance: 150.00, isActive: true, createdAt: '2024-01-12' },
      { id: 'v3', name: 'Pacific Gas & Electric', company: 'PG&E Corporation', email: 'billing@pge.com', phone: '(800) 743-5000', address: '77 Beale St, San Francisco, CA 94105', balance: 0.00, isActive: true, createdAt: '2024-01-15' },
      { id: 'v4', name: 'State Farm Insurance', company: 'State Farm Mutual', email: 'agents@statefarm.com', phone: '(800) 732-5246', address: 'One State Farm Plaza, Bloomington, IL 61710', balance: 0.00, isActive: true, createdAt: '2024-01-18' },
      { id: 'v5', name: 'Adobe Systems', company: 'Adobe Inc.', email: 'billing@adobe.com', phone: '(800) 833-6687', address: '345 Park Ave, San Jose, CA 95110', balance: 54.99, isActive: true, createdAt: '2024-02-01' },
      { id: 'v6', name: 'Amazon Web Services', company: 'Amazon.com Inc.', email: 'aws-billing@amazon.com', phone: '(206) 266-4064', address: '410 Terry Ave North, Seattle, WA 98109', balance: 320.00, isActive: true, createdAt: '2024-02-05' },
      { id: 'v7', name: 'Uber for Business', company: 'Uber Technologies Inc.', email: 'business@uber.com', phone: '(800) 353-8237', address: '1515 3rd St, San Francisco, CA 94158', balance: 0.00, isActive: true, createdAt: '2024-02-10' },
      { id: 'v8', name: 'Starbucks Corporate', company: 'Starbucks Corporation', email: 'corporate@starbucks.com', phone: '(800) 782-7282', address: '2401 Utah Ave South, Seattle, WA 98134', balance: 0.00, isActive: true, createdAt: '2024-02-15' },
    ],

    // Products & Services (7 records)
    products: [
      { id: 'p1', name: 'Consulting Services', description: 'Hourly consulting and advisory services', type: 'Service', price: 150.00, cost: 0, category: 'Services', sku: '', isActive: true, isTaxable: false, quantityOnHand: null },
      { id: 'p2', name: 'Web Development', description: 'Website design and development services', type: 'Service', price: 100.00, cost: 0, category: 'Services', sku: '', isActive: true, isTaxable: false, quantityOnHand: null },
      { id: 'p3', name: 'Design Services', description: 'Graphic and UI/UX design', type: 'Service', price: 125.00, cost: 0, category: 'Services', sku: '', isActive: true, isTaxable: false, quantityOnHand: null },
      { id: 'p4', name: 'Premium Support', description: 'Priority technical support', type: 'Service', price: 75.00, cost: 0, category: 'Services', sku: '', isActive: true, isTaxable: false, quantityOnHand: null },
      { id: 'p5', name: 'Software License', description: 'Annual software license subscription', type: 'Product', price: 499.00, cost: 150.00, category: 'Software', sku: 'SL-001', isActive: true, isTaxable: true, quantityOnHand: null },
      { id: 'p6', name: 'Laptop Computer', description: 'Business-grade laptop computer', type: 'Product', price: 1200.00, cost: 800.00, category: 'Hardware', sku: 'HW-LAP-001', isActive: true, isTaxable: true, quantityOnHand: 5 },
      { id: 'p7', name: 'Office Chair', description: 'Ergonomic office chair', type: 'Product', price: 350.00, cost: 180.00, category: 'Furniture', sku: 'FN-CHR-001', isActive: true, isTaxable: true, quantityOnHand: 12 },
    ],

    // Invoices (8 records)
    invoices: [
      {
        id: 'inv1', number: '1001', customerId: 'c8', date: format(subDays(today, 45), 'yyyy-MM-dd'), dueDate: format(subDays(today, 15), 'yyyy-MM-dd'),
        items: [{ id: 'item1', productId: 'p1', description: 'Consulting - December', qty: 8, rate: 150.00, amount: 1200.00 }],
        subtotal: 1200.00, tax: 0, total: 1200.00, status: 'Overdue', paidAmount: 0, paidDate: null, terms: 'Net 30', message: 'Thank you for your business!', createdAt: format(subDays(today, 45), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      },
      {
        id: 'inv2', number: '1002', customerId: 'c4', date: format(subDays(today, 40), 'yyyy-MM-dd'), dueDate: format(subDays(today, 10), 'yyyy-MM-dd'),
        items: [{ id: 'item2', productId: 'p2', description: 'Web Development - Phase 1', qty: 4.5, rate: 100.00, amount: 450.00 }],
        subtotal: 450.00, tax: 0, total: 450.00, status: 'Overdue', paidAmount: 0, paidDate: null, terms: 'Net 30', message: '', createdAt: format(subDays(today, 40), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      },
      {
        id: 'inv3', number: '1003', customerId: 'c1', date: format(subDays(today, 20), 'yyyy-MM-dd'), dueDate: format(subDays(today, -10), 'yyyy-MM-dd'),
        items: [{ id: 'item3', productId: 'p3', description: 'Logo Redesign', qty: 1, rate: 239.00, amount: 239.00 }],
        subtotal: 239.00, tax: 0, total: 239.00, status: 'Sent', paidAmount: 0, paidDate: null, terms: 'Net 30', message: 'Please remit payment at your earliest convenience.', createdAt: format(subDays(today, 20), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      },
      {
        id: 'inv4', number: '1004', customerId: 'c6', date: format(subDays(today, 10), 'yyyy-MM-dd'), dueDate: format(subDays(today, -20), 'yyyy-MM-dd'),
        items: [{ id: 'item4', productId: 'p4', description: 'Monthly Support Plan', qty: 1, rate: 85.00, amount: 85.00 }],
        subtotal: 85.00, tax: 0, total: 85.00, status: 'Sent', paidAmount: 0, paidDate: null, terms: 'Net 30', message: '', createdAt: format(subDays(today, 10), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      },
      {
        id: 'inv5', number: '1005', customerId: 'c3', date: format(subDays(today, 30), 'yyyy-MM-dd'), dueDate: format(subDays(today, 5), 'yyyy-MM-dd'),
        items: [
          { id: 'item5a', productId: 'p5', description: 'Software License - Annual', qty: 2, rate: 499.00, amount: 998.00 },
          { id: 'item5b', productId: 'p1', description: 'Setup & Configuration', qty: 2, rate: 150.00, amount: 300.00 },
        ],
        subtotal: 1298.00, tax: 0, total: 1298.00, status: 'Paid', paidAmount: 1298.00, paidDate: format(subDays(today, 3), 'yyyy-MM-dd'), terms: 'Net 30', message: '', createdAt: format(subDays(today, 30), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      },
      {
        id: 'inv6', number: '1006', customerId: 'c2', date: format(subDays(today, 25), 'yyyy-MM-dd'), dueDate: format(subDays(today, 2), 'yyyy-MM-dd'),
        items: [{ id: 'item6', productId: 'p2', description: 'Website Maintenance', qty: 1, rate: 85.00, amount: 85.00 }],
        subtotal: 85.00, tax: 0, total: 85.00, status: 'Paid', paidAmount: 85.00, paidDate: format(subDays(today, 1), 'yyyy-MM-dd'), terms: 'Net 30', message: '', createdAt: format(subDays(today, 25), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      },
      {
        id: 'inv7', number: '1007', customerId: 'c10', date: format(subDays(today, 5), 'yyyy-MM-dd'), dueDate: format(subDays(today, -25), 'yyyy-MM-dd'),
        items: [
          { id: 'item7a', productId: 'p3', description: 'Menu Design', qty: 1, rate: 125.00, amount: 125.00 },
          { id: 'item7b', productId: 'p2', description: 'Website Updates', qty: 2, rate: 100.00, amount: 200.00 },
        ],
        subtotal: 325.00, tax: 15.00, total: 340.00, status: 'Draft', paidAmount: 0, paidDate: null, terms: 'Net 30', message: '', createdAt: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      },
      {
        id: 'inv8', number: '1008', customerId: 'c8', date: format(subDays(today, 15), 'yyyy-MM-dd'), dueDate: format(subDays(today, -15), 'yyyy-MM-dd'),
        items: [{ id: 'item8', productId: 'p6', description: 'Laptop Computer', qty: 1, rate: 1200.00, amount: 1200.00 }],
        subtotal: 1200.00, tax: 96.00, total: 1296.00, status: 'Partial', paidAmount: 500.00, paidDate: format(subDays(today, 5), 'yyyy-MM-dd'), terms: 'Net 30', message: 'Partial payment received. Remainder due by due date.', createdAt: format(subDays(today, 15), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      },
    ],

    // Estimates (3 records)
    estimates: [
      {
        id: 'est1', number: 'E-1001', customerId: 'c5', date: format(subDays(today, 7), 'yyyy-MM-dd'), expiryDate: format(subDays(today, -23), 'yyyy-MM-dd'),
        items: [{ id: 'est1a', productId: 'p2', description: 'Basketball Camp Website', qty: 40, rate: 100.00, amount: 4000.00 }],
        total: 4000.00, status: 'Pending',
      },
      {
        id: 'est2', number: 'E-1002', customerId: 'c7', date: format(subDays(today, 14), 'yyyy-MM-dd'), expiryDate: format(subDays(today, -16), 'yyyy-MM-dd'),
        items: [
          { id: 'est2a', productId: 'p1', description: 'Strategic Consulting', qty: 20, rate: 150.00, amount: 3000.00 },
          { id: 'est2b', productId: 'p3', description: 'Brand Identity', qty: 1, rate: 2000.00, amount: 2000.00 },
        ],
        total: 5000.00, status: 'Accepted',
      },
      {
        id: 'est3', number: 'E-1003', customerId: 'c9', date: format(subDays(today, 21), 'yyyy-MM-dd'), expiryDate: format(subDays(today, -9), 'yyyy-MM-dd'),
        items: [{ id: 'est3a', productId: 'p3', description: 'Packaging Design', qty: 1, rate: 750.00, amount: 750.00 }],
        total: 750.00, status: 'Rejected',
      },
    ],

    // Expenses (12 records)
    expenses: [
      { id: 'exp1', date: format(subDays(today, 2), 'yyyy-MM-dd'), payee: 'Office Depot', vendorId: 'v1', category: 'Office Supplies', amount: 45.20, description: 'Paper, pens, and stapler', accountId: 'acc1', receipt: '', isBillable: false, customerId: null, status: 'Cleared' },
      { id: 'exp2', date: format(subDays(today, 5), 'yyyy-MM-dd'), payee: 'Uber', vendorId: 'v7', category: 'Travel', amount: 24.50, description: 'Client meeting - downtown', accountId: 'acc10', receipt: '', isBillable: true, customerId: 'c1', status: 'Cleared' },
      { id: 'exp3', date: format(subDays(today, 8), 'yyyy-MM-dd'), payee: 'Google Cloud', vendorId: 'v2', category: 'Software', amount: 150.00, description: 'Monthly hosting fees', accountId: 'acc10', receipt: '', isBillable: false, customerId: null, status: 'Cleared' },
      { id: 'exp4', date: format(subDays(today, 12), 'yyyy-MM-dd'), payee: 'Starbucks', vendorId: 'v8', category: 'Meals & Entertainment', amount: 32.80, description: 'Team lunch meeting', accountId: 'acc10', receipt: '', isBillable: false, customerId: null, status: 'Cleared' },
      { id: 'exp5', date: format(subDays(today, 15), 'yyyy-MM-dd'), payee: 'Building Management', vendorId: null, category: 'Rent', amount: 2500.00, description: 'Monthly office rent - March', accountId: 'acc1', receipt: '', isBillable: false, customerId: null, status: 'Cleared' },
      { id: 'exp6', date: format(subDays(today, 18), 'yyyy-MM-dd'), payee: 'PG&E', vendorId: 'v3', category: 'Utilities', amount: 187.50, description: 'Electricity and gas', accountId: 'acc1', receipt: '', isBillable: false, customerId: null, status: 'Cleared' },
      { id: 'exp7', date: format(subDays(today, 22), 'yyyy-MM-dd'), payee: 'State Farm', vendorId: 'v4', category: 'Insurance', amount: 450.00, description: 'Business liability insurance', accountId: 'acc1', receipt: '', isBillable: false, customerId: null, status: 'Cleared' },
      { id: 'exp8', date: format(subDays(today, 25), 'yyyy-MM-dd'), payee: 'Adobe Systems', vendorId: 'v5', category: 'Software', amount: 54.99, description: 'Creative Cloud subscription', accountId: 'acc10', receipt: '', isBillable: false, customerId: null, status: 'Cleared' },
      { id: 'exp9', date: format(subDays(today, 30), 'yyyy-MM-dd'), payee: 'Amazon Web Services', vendorId: 'v6', category: 'Software', amount: 320.00, description: 'AWS hosting and services', accountId: 'acc10', receipt: '', isBillable: false, customerId: null, status: 'Cleared' },
      { id: 'exp10', date: format(subDays(today, 35), 'yyyy-MM-dd'), payee: 'Google Ads', vendorId: 'v2', category: 'Advertising', amount: 500.00, description: 'Google Ads campaign - Feb', accountId: 'acc10', receipt: '', isBillable: false, customerId: null, status: 'Cleared' },
      { id: 'exp11', date: format(subDays(today, 42), 'yyyy-MM-dd'), payee: 'Office Depot', vendorId: 'v1', category: 'Office Supplies', amount: 89.99, description: 'Printer ink cartridges', accountId: 'acc1', receipt: '', isBillable: false, customerId: null, status: 'Cleared' },
      { id: 'exp12', date: format(subDays(today, 50), 'yyyy-MM-dd'), payee: 'Uber', vendorId: 'v7', category: 'Travel', amount: 42.00, description: 'Airport ride for conference', accountId: 'acc10', receipt: '', isBillable: true, customerId: 'c4', status: 'Pending' },
    ],

    // Bills (5 records)
    bills: [
      { id: 'bill1', vendorId: 'v1', number: 'B-5001', date: format(subDays(today, 20), 'yyyy-MM-dd'), dueDate: format(subDays(today, -10), 'yyyy-MM-dd'), items: [{ id: 'bi1', description: 'Office furniture delivery', qty: 1, rate: 1500.00, amount: 1500.00 }], total: 1500.00, status: 'Open', paidDate: null },
      { id: 'bill2', vendorId: 'v6', number: 'B-5002', date: format(subDays(today, 15), 'yyyy-MM-dd'), dueDate: format(subDays(today, -15), 'yyyy-MM-dd'), items: [{ id: 'bi2', description: 'AWS Reserved Instances', qty: 1, rate: 2400.00, amount: 2400.00 }], total: 2400.00, status: 'Open', paidDate: null },
      { id: 'bill3', vendorId: 'v5', number: 'B-5003', date: format(subDays(today, 45), 'yyyy-MM-dd'), dueDate: format(subDays(today, 15), 'yyyy-MM-dd'), items: [{ id: 'bi3', description: 'Adobe Enterprise License', qty: 1, rate: 659.00, amount: 659.00 }], total: 659.00, status: 'Overdue', paidDate: null },
      { id: 'bill4', vendorId: 'v3', number: 'B-5004', date: format(subDays(today, 60), 'yyyy-MM-dd'), dueDate: format(subDays(today, 30), 'yyyy-MM-dd'), items: [{ id: 'bi4', description: 'Q4 Utilities', qty: 1, rate: 560.00, amount: 560.00 }], total: 560.00, status: 'Paid', paidDate: format(subDays(today, 28), 'yyyy-MM-dd') },
      { id: 'bill5', vendorId: 'v4', number: 'B-5005', date: format(subDays(today, 55), 'yyyy-MM-dd'), dueDate: format(subDays(today, 25), 'yyyy-MM-dd'), items: [{ id: 'bi5', description: 'Annual Insurance Premium', qty: 1, rate: 3600.00, amount: 3600.00 }], total: 3600.00, status: 'Paid', paidDate: format(subDays(today, 23), 'yyyy-MM-dd') },
    ],

    // Chart of Accounts (20 entries)
    accounts: [
      { id: 'acc1', number: '10100', name: 'Checking', type: 'Bank', detailType: 'Checking', balance: 12450.00, bankBalance: 12500.00, isActive: true },
      { id: 'acc2', number: '10200', name: 'Savings', type: 'Bank', detailType: 'Savings', balance: 50000.00, bankBalance: 50000.00, isActive: true },
      { id: 'acc3', number: '11000', name: 'Accounts Receivable', type: 'Accounts Receivable', detailType: 'Accounts Receivable', balance: 2399.00, bankBalance: 0, isActive: true },
      { id: 'acc4', number: '12000', name: 'Inventory Asset', type: 'Other Current Assets', detailType: 'Inventory', balance: 10200.00, bankBalance: 0, isActive: true },
      { id: 'acc5', number: '13000', name: 'Prepaid Insurance', type: 'Other Current Assets', detailType: 'Prepaid Expenses', balance: 2700.00, bankBalance: 0, isActive: true },
      { id: 'acc6', number: '15000', name: 'Furniture & Equipment', type: 'Fixed Assets', detailType: 'Furniture & Fixtures', balance: 8500.00, bankBalance: 0, isActive: true },
      { id: 'acc7', number: '15100', name: 'Computers', type: 'Fixed Assets', detailType: 'Machinery & Equipment', balance: 4800.00, bankBalance: 0, isActive: true },
      { id: 'acc8', number: '20000', name: 'Accounts Payable', type: 'Accounts Payable', detailType: 'Accounts Payable', balance: 4809.00, bankBalance: 0, isActive: true },
      { id: 'acc9', number: '30000', name: "Owner's Equity", type: 'Equity', detailType: "Owner's Equity", balance: 25000.00, bankBalance: 0, isActive: true },
      { id: 'acc10', number: '21000', name: 'Visa', type: 'Credit Card', detailType: 'Credit Card', balance: -1245.00, bankBalance: -1245.00, isActive: true },
      { id: 'acc11', number: '21100', name: 'Mastercard', type: 'Credit Card', detailType: 'Credit Card', balance: -380.00, bankBalance: -380.00, isActive: true },
      { id: 'acc12', number: '30100', name: 'Retained Earnings', type: 'Equity', detailType: 'Retained Earnings', balance: 15000.00, bankBalance: 0, isActive: true },
      { id: 'acc13', number: '40000', name: 'Sales', type: 'Income', detailType: 'Sales of Product Income', balance: 0, bankBalance: 0, isActive: true },
      { id: 'acc14', number: '40100', name: 'Service Revenue', type: 'Income', detailType: 'Service/Fee Income', balance: 0, bankBalance: 0, isActive: true },
      { id: 'acc15', number: '40200', name: 'Consulting', type: 'Income', detailType: 'Service/Fee Income', balance: 0, bankBalance: 0, isActive: true },
      { id: 'acc16', number: '50000', name: 'Cost of Goods Sold', type: 'Cost of Goods Sold', detailType: 'Cost of Labor COS', balance: 0, bankBalance: 0, isActive: true },
      { id: 'acc17', number: '60100', name: 'Rent', type: 'Expenses', detailType: 'Rent or Lease of Buildings', balance: 0, bankBalance: 0, isActive: true },
      { id: 'acc18', number: '60200', name: 'Utilities', type: 'Expenses', detailType: 'Utilities', balance: 0, bankBalance: 0, isActive: true },
      { id: 'acc19', number: '60300', name: 'Office Supplies', type: 'Expenses', detailType: 'Office/General Administrative Expenses', balance: 0, bankBalance: 0, isActive: true },
      { id: 'acc20', number: '60400', name: 'Travel', type: 'Expenses', detailType: 'Travel', balance: 0, bankBalance: 0, isActive: true },
    ],

    // Bank Feed Transactions (20 records)
    transactions: [
      // Pending / For Review (6)
      { id: 'tx1', accountId: 'acc1', date: format(subDays(today, 1), 'yyyy-MM-dd'), description: 'ACH Deposit - Cool Cars', payee: 'Cool Cars', amount: 1298.00, type: 'credit', category: 'Uncategorized', matchedTo: 'inv5', status: 'pending', isReconciled: false },
      { id: 'tx2', accountId: 'acc1', date: format(subDays(today, 2), 'yyyy-MM-dd'), description: 'CHECKCARD STARBUCKS #3924', payee: 'Starbucks', amount: -12.50, type: 'debit', category: 'Uncategorized', matchedTo: null, status: 'pending', isReconciled: false },
      { id: 'tx3', accountId: 'acc1', date: format(subDays(today, 3), 'yyyy-MM-dd'), description: 'WIRE TRANSFER - Jeff Jalopies', payee: "Jeff's Jalopies", amount: 500.00, type: 'credit', category: 'Uncategorized', matchedTo: 'inv8', status: 'pending', isReconciled: false },
      { id: 'tx4', accountId: 'acc10', date: format(subDays(today, 1), 'yyyy-MM-dd'), description: 'UBER *TRIP 2F8H3K', payee: 'Uber', amount: -18.75, type: 'debit', category: 'Uncategorized', matchedTo: null, status: 'pending', isReconciled: false },
      { id: 'tx5', accountId: 'acc10', date: format(subDays(today, 2), 'yyyy-MM-dd'), description: 'AMZN MKTP US*3Z1K2P', payee: 'Amazon', amount: -67.43, type: 'debit', category: 'Uncategorized', matchedTo: null, status: 'pending', isReconciled: false },
      { id: 'tx6', accountId: 'acc2', date: format(subDays(today, 1), 'yyyy-MM-dd'), description: 'INTEREST PAYMENT', payee: 'Bank', amount: 42.50, type: 'credit', category: 'Uncategorized', matchedTo: null, status: 'pending', isReconciled: false },
      // Posted / Reviewed (10)
      { id: 'tx7', accountId: 'acc1', date: format(subDays(today, 5), 'yyyy-MM-dd'), description: 'ACH DEBIT - Building Mgmt', payee: 'Building Management', amount: -2500.00, type: 'debit', category: 'Rent', matchedTo: 'exp5', status: 'posted', isReconciled: false },
      { id: 'tx8', accountId: 'acc1', date: format(subDays(today, 6), 'yyyy-MM-dd'), description: 'ACH DEPOSIT - Bill Windsurf', payee: "Bill's Windsurf Shop", amount: 85.00, type: 'credit', category: 'Sales', matchedTo: 'inv6', status: 'posted', isReconciled: false },
      { id: 'tx9', accountId: 'acc1', date: format(subDays(today, 8), 'yyyy-MM-dd'), description: 'PGE BILL PAYMENT', payee: 'PG&E', amount: -187.50, type: 'debit', category: 'Utilities', matchedTo: 'exp6', status: 'posted', isReconciled: false },
      { id: 'tx10', accountId: 'acc1', date: format(subDays(today, 10), 'yyyy-MM-dd'), description: 'STATE FARM PREMIUM', payee: 'State Farm', amount: -450.00, type: 'debit', category: 'Insurance', matchedTo: 'exp7', status: 'posted', isReconciled: true },
      { id: 'tx11', accountId: 'acc10', date: format(subDays(today, 4), 'yyyy-MM-dd'), description: 'GOOGLE *CLOUD SVCS', payee: 'Google Cloud', amount: -150.00, type: 'debit', category: 'Software', matchedTo: 'exp3', status: 'posted', isReconciled: false },
      { id: 'tx12', accountId: 'acc10', date: format(subDays(today, 6), 'yyyy-MM-dd'), description: 'STARBUCKS #2834', payee: 'Starbucks', amount: -32.80, type: 'debit', category: 'Meals & Entertainment', matchedTo: 'exp4', status: 'posted', isReconciled: false },
      { id: 'tx13', accountId: 'acc10', date: format(subDays(today, 8), 'yyyy-MM-dd'), description: 'ADOBE *CREATIVE CLD', payee: 'Adobe', amount: -54.99, type: 'debit', category: 'Software', matchedTo: 'exp8', status: 'posted', isReconciled: false },
      { id: 'tx14', accountId: 'acc10', date: format(subDays(today, 10), 'yyyy-MM-dd'), description: 'GOOGLE ADS 8T4K2P', payee: 'Google Ads', amount: -500.00, type: 'debit', category: 'Advertising', matchedTo: 'exp10', status: 'posted', isReconciled: false },
      { id: 'tx15', accountId: 'acc1', date: format(subDays(today, 12), 'yyyy-MM-dd'), description: 'OFFICE DEPOT #3827', payee: 'Office Depot', amount: -89.99, type: 'debit', category: 'Office Supplies', matchedTo: 'exp11', status: 'posted', isReconciled: false },
      { id: 'tx16', accountId: 'acc1', date: format(subDays(today, 15), 'yyyy-MM-dd'), description: 'ACH DEPOSIT - Consulting', payee: 'Various', amount: 3200.00, type: 'credit', category: 'Consulting', matchedTo: null, status: 'posted', isReconciled: false },
      // Excluded (2)
      { id: 'tx17', accountId: 'acc1', date: format(subDays(today, 7), 'yyyy-MM-dd'), description: 'TRANSFER TO SAVINGS', payee: 'Internal Transfer', amount: -5000.00, type: 'debit', category: 'Transfer', matchedTo: null, status: 'excluded', isReconciled: false },
      { id: 'tx18', accountId: 'acc2', date: format(subDays(today, 7), 'yyyy-MM-dd'), description: 'TRANSFER FROM CHECKING', payee: 'Internal Transfer', amount: 5000.00, type: 'credit', category: 'Transfer', matchedTo: null, status: 'excluded', isReconciled: false },
      // Additional pending for credit card
      { id: 'tx19', accountId: 'acc10', date: format(subDays(today, 3), 'yyyy-MM-dd'), description: 'ZOOM VIDEO US', payee: 'Zoom', amount: -14.99, type: 'debit', category: 'Uncategorized', matchedTo: null, status: 'pending', isReconciled: false },
      { id: 'tx20', accountId: 'acc10', date: format(subDays(today, 4), 'yyyy-MM-dd'), description: 'DOORDASH *DELIVERY', payee: 'DoorDash', amount: -28.45, type: 'debit', category: 'Uncategorized', matchedTo: null, status: 'pending', isReconciled: false },
    ],

    // Employees (5 records)
    employees: [
      { id: 'emp1', name: 'Sarah Chen', email: 'sarah@acmecorp.com', role: 'Senior Developer', department: 'Engineering', salary: 95000, payFrequency: 'Bi-weekly', startDate: '2023-01-15', isActive: true },
      { id: 'emp2', name: 'Marcus Johnson', email: 'marcus@acmecorp.com', role: 'UX Designer', department: 'Design', salary: 82000, payFrequency: 'Bi-weekly', startDate: '2023-03-01', isActive: true },
      { id: 'emp3', name: 'Emily Rodriguez', email: 'emily@acmecorp.com', role: 'Project Manager', department: 'Operations', salary: 88000, payFrequency: 'Bi-weekly', startDate: '2023-06-15', isActive: true },
      { id: 'emp4', name: 'David Kim', email: 'david@acmecorp.com', role: 'Full Stack Developer', department: 'Engineering', salary: 78000, payFrequency: 'Bi-weekly', startDate: '2024-01-02', isActive: true },
      { id: 'emp5', name: 'Lisa Park', email: 'lisa@acmecorp.com', role: 'Marketing Specialist', department: 'Marketing', salary: 65000, payFrequency: 'Bi-weekly', startDate: '2024-02-15', isActive: true },
    ],

    // Projects (4 records)
    projects: [
      { id: 'proj1', name: 'Website Redesign', customerId: 'c8', status: 'In Progress', budget: 5000, spent: 2340, startDate: '2024-01-15', endDate: null, description: "Complete redesign of Jeff's Jalopies website" },
      { id: 'proj2', name: 'Mobile App Development', customerId: 'c5', status: 'Planning', budget: 15000, spent: 0, startDate: '2024-03-01', endDate: null, description: 'Basketball Camp booking mobile app' },
      { id: 'proj3', name: 'Brand Identity Package', customerId: 'c7', status: 'In Progress', budget: 5000, spent: 1200, startDate: '2024-02-01', endDate: null, description: 'Full brand identity design for Geeta Consulting' },
      { id: 'proj4', name: 'E-commerce Platform', customerId: 'c6', status: 'Completed', budget: 8000, spent: 7650, startDate: '2023-10-01', endDate: '2024-01-30', description: 'Online store for Freeman Sporting Goods' },
    ],

    // Local email drafts created by sandbox send actions.
    emailDrafts: [],

    // Report categories
    reportCategories: [
      {
        name: 'Business overview',
        reports: [
          { id: 'profit-loss', name: 'Profit and Loss', starred: true },
          { id: 'balance-sheet', name: 'Balance Sheet', starred: true },
          { id: 'balance-sheet-detail', name: 'Balance Sheet Detail', starred: false },
          { id: 'cash-flow', name: 'Statement of Cash Flows', starred: false },
          { id: 'budget-overview', name: 'Budget Overview', starred: false },
          { id: 'budget-vs-actuals', name: 'Budget vs. Actuals', starred: false },
          { id: 'audit-log', name: 'Audit Log', starred: false },
        ],
      },
      {
        name: 'Sales and customers',
        reports: [
          { id: 'invoice-list', name: 'Invoice List', starred: false },
          { id: 'sales-by-customer', name: 'Sales by Customer Summary', starred: true },
          { id: 'sales-by-product', name: 'Sales by Product/Service Summary', starred: false },
          { id: 'customer-balance', name: 'Customer Balance Summary', starred: false },
          { id: 'collections', name: 'Collections Report', starred: false },
          { id: 'estimates-by-customer', name: 'Estimates by Customer', starred: false },
        ],
      },
      {
        name: 'Expenses and vendors',
        reports: [
          { id: 'expenses-by-vendor', name: 'Expenses by Vendor Summary', starred: false },
          { id: 'unpaid-bills', name: 'Unpaid Bills', starred: true },
          { id: 'vendor-balance', name: 'Vendor Balance Summary', starred: false },
          { id: 'ap-aging', name: 'A/P Aging Summary', starred: false },
        ],
      },
      {
        name: 'Employees',
        reports: [
          { id: 'payroll-summary', name: 'Payroll Summary', starred: false },
          { id: 'employee-details', name: 'Employee Details', starred: false },
        ],
      },
    ],
  };
};

export const calculateStateDiff = (initial, current) => {
  const diff = {};
  Object.keys(current).forEach(key => {
    if (JSON.stringify(current[key]) !== JSON.stringify(initial[key])) {
      diff[key] = {
        from: initial[key],
        to: current[key]
      };
    }
  });
  return diff;
};
