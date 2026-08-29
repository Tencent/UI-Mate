
export const INITIAL_STATE = {
  user: {
    id: "u_1",
    name: "Alex Admin",
    email: "admin@example.com",
    balance: 4250.50,
    currency: "USD",
    avatar: "https://picsum.photos/100/100?random=user1"
  },
  contacts: [
    { id: "c_1", name: "Sarah Smith", email: "sarah@example.com", avatar: "https://picsum.photos/100/100?random=user2" },
    { id: "c_2", name: "Mike Johnson", email: "mike@example.com", avatar: "https://picsum.photos/100/100?random=user3" },
    { id: "c_3", name: "Tech Gadgets Inc", email: "billing@techgadgets.com", avatar: "https://picsum.photos/100/100?random=user4" }
  ],
  transactions: [
    {
      id: "t_1",
      type: "payment_sent",
      amount: 12.50,
      currency: "USD",
      recipientName: "Starbucks",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      status: "completed",
      description: "Morning Coffee"
    },
    {
      id: "t_2",
      type: "payment_received",
      amount: 150.00,
      currency: "USD",
      senderName: "Mike Johnson",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      status: "completed",
      description: "Dinner split"
    },
    {
      id: "t_3",
      type: "withdrawal",
      amount: 500.00,
      currency: "USD",
      destination: "Chase Bank ****4422",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      status: "completed",
      description: "Transfer to Bank"
    }
  ],
  paymentMethods: [
    { id: "pm_1", type: "card", brand: "Visa", last4: "4242", expiry: "12/25", verified: true },
    { id: "pm_2", type: "bank", bankName: "Chase", last4: "8899", verified: true }
  ],
  invoices: [
    { 
      id: "inv_1", 
      number: "INV-001",
      recipientEmail: "client@agency.com", 
      amount: 1200.00, 
      status: "paid", 
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      items: [{ description: "Web Design", quantity: 1, price: 1200 }]
    }
  ],
  subscriptions: [],
  paymentLinks: [],
  settings: {
    language: 'English',
    timezone: 'America/New_York',
    securityEmails: true,
    marketingEmails: false
  },
  notifications: [
    { id: "n_1", message: "Security alert: New login from Chrome", read: false, date: new Date().toISOString() }
  ]
};

function getDefaultData() {
  return { ...INITIAL_STATE };
}

// --- Session-aware storage functions ---

const BASE_STORAGE_KEY = 'paypal_mock_state';
const BASE_INITIAL_KEY = 'paypal_mock_initialState';

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

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch (e) { console.log('No custom state available'); }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));

  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state })
  }).catch(() => {
    // Browser-local state remains authoritative when the dev server is not reachable.
  });
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

// --- Array item normalizers ---

function normalizeTransaction(txn, index) {
  return {
    id: txn.id || `t_custom_${index}`,
    type: txn.type || 'payment_sent',
    amount: typeof txn.amount === 'number' ? txn.amount : parseFloat(txn.amount) || 0,
    currency: txn.currency || 'USD',
    recipientName: txn.recipientName || txn.recipient || txn.to || '',
    senderName: txn.senderName || txn.sender || txn.from || '',
    destination: txn.destination || '',
    date: txn.date || txn.createdAt || txn.timestamp || new Date().toISOString(),
    status: txn.status || 'completed',
    description: txn.description || txn.note || txn.memo || '',
  };
}

function normalizeContact(contact, index) {
  return {
    id: contact.id || `c_custom_${index}`,
    name: contact.name || contact.fullName || '',
    email: contact.email || '',
    avatar: contact.avatar || contact.image || '',
  };
}

function normalizePaymentMethod(pm, index) {
  return {
    id: pm.id || `pm_custom_${index}`,
    type: pm.type || 'card',
    brand: pm.brand || '',
    bankName: pm.bankName || '',
    last4: pm.last4 || '0000',
    expiry: pm.expiry || '',
    verified: typeof pm.verified === 'boolean' ? pm.verified : true,
  };
}

function normalizeInvoiceItem(item, index) {
  return {
    description: item.description || '',
    quantity: typeof item.quantity === 'number' ? item.quantity : 1,
    price: typeof item.price === 'number' ? item.price : 0,
  };
}

function normalizeInvoice(inv, index) {
  const rawItems = Array.isArray(inv.items) ? inv.items : [];
  return {
    id: inv.id || `inv_custom_${index}`,
    number: inv.number || `INV-${index + 1}`,
    recipientEmail: inv.recipientEmail || inv.email || '',
    amount: typeof inv.amount === 'number' ? inv.amount : parseFloat(inv.amount) || 0,
    status: inv.status || 'sent',
    dueDate: inv.dueDate || new Date().toISOString(),
    items: rawItems.map((item, i) => normalizeInvoiceItem(item, i)),
  };
}

function normalizeNotification(notif, index) {
  return {
    id: notif.id || `n_custom_${index}`,
    message: notif.message || notif.content || notif.text || '',
    read: typeof notif.read === 'boolean' ? notif.read : false,
    date: notif.date || notif.createdAt || notif.timestamp || new Date().toISOString(),
  };
}

function normalizePaymentLink(link, index) {
  return {
    id: link.id || `plink_custom_${index}`,
    amount: typeof link.amount === 'number' ? link.amount : (link.amount ? parseFloat(link.amount) : null),
    description: link.description || 'Payment Request',
    url: link.url || '',
    active: typeof link.active === 'boolean' ? link.active : true,
    created: link.created || link.date || new Date().toISOString(),
  };
}

const arrayNormalizers = {
  transactions: normalizeTransaction,
  contacts: normalizeContact,
  paymentMethods: normalizePaymentMethod,
  invoices: normalizeInvoice,
  subscriptions: null, // pass-through
  paymentLinks: normalizePaymentLink,
  notifications: normalizeNotification,
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key]) && arrayNormalizers[key]) {
        result[key] = custom[key].map((item, i) => arrayNormalizers[key](item, i));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const data = deepMergeWithDefaults(getDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const data = getDefaultData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};
  
