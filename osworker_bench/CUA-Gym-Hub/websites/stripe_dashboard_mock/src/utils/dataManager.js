const BASE_STORAGE_KEY = 'stripe_dashboard_state';
const BASE_INITIAL_KEY = 'stripe_dashboard_initialState';

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
    sessionStorage.setItem('stripe_mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('stripe_mock_sid') || null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch {
    // Local fallback is expected when the mock API is unavailable.
  }
  return null;
};

function serverSeedKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_serverSeeded_${sid}` : `${BASE_INITIAL_KEY}_serverSeeded`;
}

function syncInitialState(initialState, sid = null) {
  if (!sid || !initialState || localStorage.getItem(serverSeedKey(sid))) return;
  fetch(`/post?sid=${encodeURIComponent(sid)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set', state: initialState }),
  }).then(response => {
    if (response.ok) localStorage.setItem(serverSeedKey(sid), 'true');
  }).catch(() => {});
}

let _syncTimer = null;

export const saveState = (state, sid = null) => {
  try {
    localStorage.setItem(storageKey(sid), JSON.stringify(state));
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state })
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save state:', e);
  }
  if (sid) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(() => {});
    }, 300);
  }
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

export { initialKey, storageKey };

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key])) {
        result[key] = custom[key];
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
    const initialData = { ...createInitialData(), ...customState };
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    syncInitialState(initialData, sid);
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    syncInitialState(JSON.parse(localStorage.getItem(ik) || stored), sid);
    return JSON.parse(stored);
  }

  const initialData = createInitialData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  syncInitialState(initialData, sid);
  return initialData;
};

// Format cents to dollar string
export function formatCurrency(cents, currency = 'usd') {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2
  }).format(amount);
}

export function generateId(prefix) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix + '_';
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper timestamps
function daysAgo(d) {
  return Math.floor(Date.now() / 1000) - d * 86400;
}
function hoursAgo(h) {
  return Math.floor(Date.now() / 1000) - h * 3600;
}

export function createInitialData() {
  const now = Math.floor(Date.now() / 1000);

  // ===== CUSTOMERS =====
  const customers = [
    { id: 'cus_P1a2b3c4d5e6f7', name: 'Acme Corporation', email: 'billing@acmecorp.com', phone: '+1 (415) 555-0100', description: 'Enterprise customer - annual contract', address: { line1: '100 Market Street', line2: 'Suite 400', city: 'San Francisco', state: 'CA', postal_code: '94105', country: 'US' }, balance: 0, currency: 'usd', default_payment_method: 'pm_acme_visa_01', metadata: { company_size: '500+', plan: 'enterprise' }, created: daysAgo(180), livemode: true, delinquent: false, total_spent: 1199880, payments_count: 12 },
    { id: 'cus_Q2b3c4d5e6f7g8', name: 'Jane Cooper', email: 'jane.cooper@gmail.com', phone: '+1 (555) 234-5678', description: null, address: { line1: '456 Oak Avenue', line2: null, city: 'Austin', state: 'TX', postal_code: '73301', country: 'US' }, balance: 0, currency: 'usd', default_payment_method: 'pm_jane_mc_01', metadata: {}, created: daysAgo(120), livemode: true, delinquent: false, total_spent: 359880, payments_count: 12 },
    { id: 'cus_R3c4d5e6f7g8h9', name: 'TechStart Inc.', email: 'finance@techstart.io', phone: '+1 (650) 555-0200', description: 'Startup - Pro Plan', address: { line1: '789 Innovation Blvd', line2: null, city: 'Palo Alto', state: 'CA', postal_code: '94301', country: 'US' }, balance: 0, currency: 'usd', default_payment_method: 'pm_tech_visa_01', metadata: { industry: 'SaaS' }, created: daysAgo(90), livemode: true, delinquent: false, total_spent: 89970, payments_count: 3 },
    { id: 'cus_S4d5e6f7g8h9i0', name: 'Robert Fox', email: 'robert.fox@outlook.com', phone: null, description: 'Individual user', address: null, balance: 0, currency: 'usd', default_payment_method: 'pm_robert_visa_01', metadata: {}, created: daysAgo(60), livemode: true, delinquent: false, total_spent: 9990, payments_count: 1 },
    { id: 'cus_T5e6f7g8h9i0j1', name: 'Globex Industries', email: 'ap@globexind.com', phone: '+1 (212) 555-0300', description: 'Enterprise - custom pricing', address: { line1: '1 World Trade Center', line2: 'Floor 68', city: 'New York', state: 'NY', postal_code: '10007', country: 'US' }, balance: 0, currency: 'usd', default_payment_method: 'pm_globex_amex_01', metadata: { contract_id: 'ENT-2024-001' }, created: daysAgo(200), livemode: true, delinquent: false, total_spent: 2399760, payments_count: 24 },
    { id: 'cus_U6f7g8h9i0j1k2', name: 'Sarah Miller', email: 'sarah.miller@yahoo.com', phone: '+1 (555) 345-6789', description: null, address: { line1: '321 Elm Street', line2: 'Apt 4B', city: 'Portland', state: 'OR', postal_code: '97201', country: 'US' }, balance: 0, currency: 'usd', default_payment_method: 'pm_sarah_visa_01', metadata: {}, created: daysAgo(45), livemode: true, delinquent: false, total_spent: 29990, payments_count: 1 },
    { id: 'cus_V7g8h9i0j1k2l3', name: 'Dev Solutions LLC', email: 'accounts@devsolutions.co', phone: '+1 (408) 555-0400', description: 'Agency - multiple seats', address: { line1: '555 Developer Way', line2: null, city: 'San Jose', state: 'CA', postal_code: '95110', country: 'US' }, balance: 0, currency: 'usd', default_payment_method: 'pm_dev_mc_01', metadata: { seats: '10' }, created: daysAgo(150), livemode: true, delinquent: false, total_spent: 599880, payments_count: 6 },
    { id: 'cus_W8h9i0j1k2l3m4', name: 'Michael Chen', email: 'mchen@protonmail.com', phone: null, description: 'Freelance developer', address: null, balance: 0, currency: 'usd', default_payment_method: 'pm_michael_disc_01', metadata: {}, created: daysAgo(30), livemode: true, delinquent: false, total_spent: 49990, payments_count: 1 },
    { id: 'cus_X9i0j1k2l3m4n5', name: 'Emily Davis', email: 'emily.d@gmail.com', phone: '+1 (555) 456-7890', description: null, address: { line1: '888 Pine Road', line2: null, city: 'Denver', state: 'CO', postal_code: '80202', country: 'US' }, balance: 0, currency: 'usd', default_payment_method: 'pm_emily_visa_01', metadata: {}, created: daysAgo(75), livemode: true, delinquent: false, total_spent: 19980, payments_count: 2 },
    { id: 'cus_Y0j1k2l3m4n5o6', name: 'CloudSync Pro', email: 'billing@cloudsyncpro.com', phone: '+1 (206) 555-0500', description: 'SaaS reseller', address: { line1: '1200 Cloud Ave', line2: null, city: 'Seattle', state: 'WA', postal_code: '98101', country: 'US' }, balance: 0, currency: 'usd', default_payment_method: 'pm_cloud_visa_01', metadata: { partner_tier: 'gold' }, created: daysAgo(110), livemode: true, delinquent: false, total_spent: 449940, payments_count: 3 },
    { id: 'cus_Z1k2l3m4n5o6p7', name: 'Alex Thompson', email: 'alex.t@fastmail.com', phone: null, description: null, address: null, balance: 0, currency: 'usd', default_payment_method: null, metadata: {}, created: daysAgo(15), livemode: true, delinquent: true, total_spent: 0, payments_count: 0 },
    { id: 'cus_A2l3m4n5o6p7q8', name: 'Riverside Medical Group', email: 'it@riversidemedical.org', phone: '+1 (555) 567-8901', description: 'Healthcare provider', address: { line1: '400 Health Center Dr', line2: null, city: 'Chicago', state: 'IL', postal_code: '60601', country: 'US' }, balance: 0, currency: 'usd', default_payment_method: 'pm_riverside_visa_01', metadata: { hipaa_compliant: 'true' }, created: daysAgo(160), livemode: true, delinquent: false, total_spent: 179940, payments_count: 6 },
    { id: 'cus_B3m4n5o6p7q8r9', name: 'Lisa Wang', email: 'lisa.wang@icloud.com', phone: '+1 (555) 678-9012', description: null, address: null, balance: 0, currency: 'usd', default_payment_method: 'pm_lisa_mc_01', metadata: {}, created: daysAgo(20), livemode: true, delinquent: false, total_spent: 9990, payments_count: 1 },
    { id: 'cus_C4n5o6p7q8r9s0', name: 'BrightPath Education', email: 'admin@brightpath.edu', phone: '+1 (617) 555-0600', description: 'Educational institution', address: { line1: '75 University Ave', line2: null, city: 'Boston', state: 'MA', postal_code: '02108', country: 'US' }, balance: 0, currency: 'usd', default_payment_method: 'pm_bright_visa_01', metadata: { edu_discount: 'true' }, created: daysAgo(100), livemode: true, delinquent: true, total_spent: 59940, payments_count: 6 },
    { id: 'cus_D5o6p7q8r9s0t1', name: 'Marcus Johnson', email: 'marcus.j@gmail.com', phone: null, description: null, address: null, balance: 0, currency: 'usd', default_payment_method: null, metadata: {}, created: daysAgo(5), livemode: true, delinquent: true, total_spent: 0, payments_count: 0 },
    { id: 'cus_E6p7q8r9s0t1u2', name: 'Nordic Design Co.', email: 'hello@nordicdesign.se', phone: '+46 8 555 1234', description: 'International customer - Sweden', address: { line1: 'Sveavagen 44', line2: null, city: 'Stockholm', state: null, postal_code: '111 34', country: 'SE' }, balance: 0, currency: 'usd', default_payment_method: 'pm_nordic_visa_01', metadata: {}, created: daysAgo(85), livemode: true, delinquent: false, total_spent: 59940, payments_count: 2 },
    { id: 'cus_F7q8r9s0t1u2v3', name: 'DataVault Systems', email: 'procurement@datavault.io', phone: '+1 (503) 555-0700', description: 'Data infrastructure', address: { line1: '900 Data Center Pkwy', line2: null, city: 'Portland', state: 'OR', postal_code: '97204', country: 'US' }, balance: 0, currency: 'usd', default_payment_method: 'pm_datavault_amex_01', metadata: {}, created: daysAgo(130), livemode: true, delinquent: false, total_spent: 299940, payments_count: 3 },
    { id: 'cus_G8r9s0t1u2v3w4', name: 'Priya Patel', email: 'priya.patel@gmail.com', phone: '+1 (555) 789-0123', description: null, address: { line1: '202 Maple Lane', line2: null, city: 'Miami', state: 'FL', postal_code: '33101', country: 'US' }, balance: 0, currency: 'usd', default_payment_method: 'pm_priya_visa_01', metadata: {}, created: daysAgo(40), livemode: true, delinquent: false, total_spent: 19990, payments_count: 1 },
  ];

  // ===== PRODUCTS & PRICES =====
  const products = [
    { id: 'prod_starter01', name: 'Starter Plan', description: 'Essential features for individuals and small teams', active: true, images: [], default_price: 'price_starter_monthly', metadata: {}, created: daysAgo(365), updated: daysAgo(30), unit_label: null },
    { id: 'prod_pro01', name: 'Pro Plan', description: 'Advanced features with priority support', active: true, images: [], default_price: 'price_pro_monthly', metadata: {}, created: daysAgo(365), updated: daysAgo(30), unit_label: null },
    { id: 'prod_enterprise01', name: 'Enterprise Plan', description: 'Full platform access with dedicated support and SLA', active: true, images: [], default_price: 'price_enterprise_monthly', metadata: {}, created: daysAgo(365), updated: daysAgo(30), unit_label: 'seat' },
    { id: 'prod_api01', name: 'API Access', description: 'Programmatic access to all platform APIs', active: true, images: [], default_price: 'price_api_monthly', metadata: {}, created: daysAgo(300), updated: daysAgo(60), unit_label: null },
    { id: 'prod_setup01', name: 'One-time Setup Fee', description: 'Professional onboarding and configuration', active: true, images: [], default_price: 'price_setup_onetime', metadata: {}, created: daysAgo(300), updated: daysAgo(90), unit_label: null },
    { id: 'prod_export01', name: 'Data Export Add-on', description: 'Automated data export and reporting', active: true, images: [], default_price: 'price_export_monthly', metadata: {}, created: daysAgo(200), updated: daysAgo(45), unit_label: null },
    { id: 'prod_support01', name: 'Priority Support', description: '24/7 dedicated support with < 1 hour response time', active: true, images: [], default_price: 'price_support_monthly', metadata: {}, created: daysAgo(250), updated: daysAgo(30), unit_label: null },
  ];

  const prices = [
    { id: 'price_starter_monthly', product: 'prod_starter01', active: true, currency: 'usd', unit_amount: 999, billing_scheme: 'per_unit', type: 'recurring', recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' }, nickname: 'Monthly', metadata: {}, created: daysAgo(365) },
    { id: 'price_starter_yearly', product: 'prod_starter01', active: true, currency: 'usd', unit_amount: 9999, billing_scheme: 'per_unit', type: 'recurring', recurring: { interval: 'year', interval_count: 1, usage_type: 'licensed' }, nickname: 'Yearly', metadata: {}, created: daysAgo(365) },
    { id: 'price_pro_monthly', product: 'prod_pro01', active: true, currency: 'usd', unit_amount: 2999, billing_scheme: 'per_unit', type: 'recurring', recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' }, nickname: 'Monthly', metadata: {}, created: daysAgo(365) },
    { id: 'price_pro_yearly', product: 'prod_pro01', active: true, currency: 'usd', unit_amount: 29999, billing_scheme: 'per_unit', type: 'recurring', recurring: { interval: 'year', interval_count: 1, usage_type: 'licensed' }, nickname: 'Yearly', metadata: {}, created: daysAgo(365) },
    { id: 'price_enterprise_monthly', product: 'prod_enterprise01', active: true, currency: 'usd', unit_amount: 9999, billing_scheme: 'per_unit', type: 'recurring', recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' }, nickname: 'Monthly', metadata: {}, created: daysAgo(365) },
    { id: 'price_enterprise_yearly', product: 'prod_enterprise01', active: true, currency: 'usd', unit_amount: 99999, billing_scheme: 'per_unit', type: 'recurring', recurring: { interval: 'year', interval_count: 1, usage_type: 'licensed' }, nickname: 'Yearly', metadata: {}, created: daysAgo(365) },
    { id: 'price_api_monthly', product: 'prod_api01', active: true, currency: 'usd', unit_amount: 4999, billing_scheme: 'per_unit', type: 'recurring', recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' }, nickname: 'Monthly', metadata: {}, created: daysAgo(300) },
    { id: 'price_setup_onetime', product: 'prod_setup01', active: true, currency: 'usd', unit_amount: 19900, billing_scheme: 'per_unit', type: 'one_time', recurring: null, nickname: 'One-time', metadata: {}, created: daysAgo(300) },
    { id: 'price_export_monthly', product: 'prod_export01', active: true, currency: 'usd', unit_amount: 1999, billing_scheme: 'per_unit', type: 'recurring', recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' }, nickname: 'Monthly', metadata: {}, created: daysAgo(200) },
    { id: 'price_support_monthly', product: 'prod_support01', active: true, currency: 'usd', unit_amount: 14999, billing_scheme: 'per_unit', type: 'recurring', recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' }, nickname: 'Monthly', metadata: {}, created: daysAgo(250) },
  ];

  // ===== PAYMENT METHODS =====
  const paymentMethods = [
    { id: 'pm_acme_visa_01', type: 'card', card: { brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2026, funding: 'credit' }, billing_details: { name: 'Acme Corporation' }, created: daysAgo(180), customer: 'cus_P1a2b3c4d5e6f7' },
    { id: 'pm_jane_mc_01', type: 'card', card: { brand: 'mastercard', last4: '5555', exp_month: 8, exp_year: 2027, funding: 'credit' }, billing_details: { name: 'Jane Cooper' }, created: daysAgo(120), customer: 'cus_Q2b3c4d5e6f7g8' },
    { id: 'pm_tech_visa_01', type: 'card', card: { brand: 'visa', last4: '1234', exp_month: 3, exp_year: 2026, funding: 'credit' }, billing_details: { name: 'TechStart Inc.' }, created: daysAgo(90), customer: 'cus_R3c4d5e6f7g8h9' },
    { id: 'pm_robert_visa_01', type: 'card', card: { brand: 'visa', last4: '9876', exp_month: 6, exp_year: 2027, funding: 'debit' }, billing_details: { name: 'Robert Fox' }, created: daysAgo(60), customer: 'cus_S4d5e6f7g8h9i0' },
    { id: 'pm_globex_amex_01', type: 'card', card: { brand: 'amex', last4: '0005', exp_month: 11, exp_year: 2026, funding: 'credit' }, billing_details: { name: 'Globex Industries' }, created: daysAgo(200), customer: 'cus_T5e6f7g8h9i0j1' },
    { id: 'pm_sarah_visa_01', type: 'card', card: { brand: 'visa', last4: '3456', exp_month: 2, exp_year: 2028, funding: 'credit' }, billing_details: { name: 'Sarah Miller' }, created: daysAgo(45), customer: 'cus_U6f7g8h9i0j1k2' },
    { id: 'pm_dev_mc_01', type: 'card', card: { brand: 'mastercard', last4: '7890', exp_month: 9, exp_year: 2026, funding: 'credit' }, billing_details: { name: 'Dev Solutions LLC' }, created: daysAgo(150), customer: 'cus_V7g8h9i0j1k2l3' },
    { id: 'pm_michael_disc_01', type: 'card', card: { brand: 'discover', last4: '1111', exp_month: 4, exp_year: 2027, funding: 'credit' }, billing_details: { name: 'Michael Chen' }, created: daysAgo(30), customer: 'cus_W8h9i0j1k2l3m4' },
    { id: 'pm_emily_visa_01', type: 'card', card: { brand: 'visa', last4: '2222', exp_month: 7, exp_year: 2026, funding: 'debit' }, billing_details: { name: 'Emily Davis' }, created: daysAgo(75), customer: 'cus_X9i0j1k2l3m4n5' },
    { id: 'pm_cloud_visa_01', type: 'card', card: { brand: 'visa', last4: '6543', exp_month: 10, exp_year: 2027, funding: 'credit' }, billing_details: { name: 'CloudSync Pro' }, created: daysAgo(110), customer: 'cus_Y0j1k2l3m4n5o6' },
    { id: 'pm_riverside_visa_01', type: 'card', card: { brand: 'visa', last4: '8888', exp_month: 1, exp_year: 2027, funding: 'credit' }, billing_details: { name: 'Riverside Medical Group' }, created: daysAgo(160), customer: 'cus_A2l3m4n5o6p7q8' },
    { id: 'pm_lisa_mc_01', type: 'card', card: { brand: 'mastercard', last4: '4444', exp_month: 5, exp_year: 2028, funding: 'credit' }, billing_details: { name: 'Lisa Wang' }, created: daysAgo(20), customer: 'cus_B3m4n5o6p7q8r9' },
    { id: 'pm_bright_visa_01', type: 'card', card: { brand: 'visa', last4: '7777', exp_month: 12, exp_year: 2026, funding: 'credit' }, billing_details: { name: 'BrightPath Education' }, created: daysAgo(100), customer: 'cus_C4n5o6p7q8r9s0' },
    { id: 'pm_nordic_visa_01', type: 'card', card: { brand: 'visa', last4: '3333', exp_month: 8, exp_year: 2027, funding: 'credit' }, billing_details: { name: 'Nordic Design Co.' }, created: daysAgo(85), customer: 'cus_E6p7q8r9s0t1u2' },
    { id: 'pm_datavault_amex_01', type: 'card', card: { brand: 'amex', last4: '0001', exp_month: 6, exp_year: 2027, funding: 'credit' }, billing_details: { name: 'DataVault Systems' }, created: daysAgo(130), customer: 'cus_F7q8r9s0t1u2v3' },
    { id: 'pm_priya_visa_01', type: 'card', card: { brand: 'visa', last4: '5678', exp_month: 3, exp_year: 2028, funding: 'debit' }, billing_details: { name: 'Priya Patel' }, created: daysAgo(40), customer: 'cus_G8r9s0t1u2v3w4' },
  ];

  // ===== PAYMENTS =====
  const paymentStatuses = ['succeeded', 'succeeded', 'succeeded', 'succeeded', 'succeeded', 'succeeded', 'succeeded', 'pending', 'failed', 'succeeded'];
  const descriptions = ['Subscription to Pro Plan', 'Subscription to Starter Plan', 'Subscription to Enterprise Plan', 'API Access subscription', 'One-time Setup Fee', 'Data Export Add-on', 'Priority Support', 'Pro Plan upgrade', 'Subscription renewal', null];

  const payments = [];
  const paymentAmounts = [999, 2999, 9999, 4999, 19900, 1999, 14999, 2999, 999, 9999, 29999, 49990, 99990, 19900, 2999, 999, 4999, 9999, 1999, 14999, 2999, 999, 9999, 2999, 999, 4999, 2999, 9999, 19900, 999, 2999, 14999, 999, 2999, 9999, 4999, 1999, 2999, 999, 9999, 19900, 2999, 999, 4999, 2999];

  for (let i = 0; i < 45; i++) {
    const custIdx = i % customers.length;
    const cust = customers[custIdx];
    const pm = paymentMethods.find(p => p.customer === cust.id);
    let status;
    if (i < 32) status = 'succeeded';
    else if (i < 37) status = 'pending';
    else if (i < 41) status = 'failed';
    else if (i < 43) status = 'succeeded'; // partial refund
    else status = 'succeeded'; // full refund

    const amount = paymentAmounts[i] || 2999;
    const dayOffset = Math.floor(i * 30 / 45);
    const created = daysAgo(dayOffset);
    const isRefunded = i >= 43;
    const isPartialRefund = i >= 41 && i < 43;

    payments.push({
      id: `pi_${String(i + 1).padStart(4, '0')}Fj49a8cB${String.fromCharCode(65 + (i % 26))}`,
      amount,
      currency: 'usd',
      status: isRefunded ? 'succeeded' : (isPartialRefund ? 'succeeded' : status),
      description: descriptions[i % descriptions.length],
      customer: cust.id,
      customer_email: cust.email,
      customer_name: cust.name,
      payment_method: pm ? { type: 'card', card: { ...pm.card } } : { type: 'card', card: { brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2026 } },
      amount_received: status === 'succeeded' || isRefunded || isPartialRefund ? amount : 0,
      amount_refunded: isRefunded ? amount : (isPartialRefund ? Math.floor(amount / 2) : 0),
      refunded: isRefunded,
      disputed: i === 2 || i === 8 || i === 15 || i === 22,
      captured: status === 'succeeded' || isRefunded || isPartialRefund,
      receipt_email: cust.email,
      receipt_url: null,
      metadata: i % 5 === 0 ? { order_id: `ORD-${1000 + i}` } : {},
      created,
      livemode: true,
      risk_score: status === 'failed' ? 65 : (Math.floor(Math.random() * 30) + 5),
      risk_level: status === 'failed' ? 'elevated' : 'normal',
      outcome: { type: status === 'failed' ? 'blocked' : 'authorized', risk_level: status === 'failed' ? 'elevated' : 'normal', risk_score: status === 'failed' ? 65 : 12, reason: status === 'failed' ? 'highest_risk_level' : null },
      invoice: null,
    });
  }

  // ===== SUBSCRIPTIONS =====
  const subscriptions = [
    { id: 'sub_01acme', customer: 'cus_P1a2b3c4d5e6f7', customer_name: 'Acme Corporation', customer_email: 'billing@acmecorp.com', status: 'active', items: [{ id: 'si_01', price: 'price_enterprise_monthly', product: 'prod_enterprise01', product_name: 'Enterprise Plan', quantity: 1 }], current_period_start: daysAgo(15), current_period_end: daysAgo(-15), cancel_at_period_end: false, canceled_at: null, ended_at: null, trial_start: null, trial_end: null, collection_method: 'charge_automatically', default_payment_method: 'pm_acme_visa_01', latest_invoice: 'in_0001', created: daysAgo(180), metadata: {} },
    { id: 'sub_02jane', customer: 'cus_Q2b3c4d5e6f7g8', customer_name: 'Jane Cooper', customer_email: 'jane.cooper@gmail.com', status: 'active', items: [{ id: 'si_02', price: 'price_pro_monthly', product: 'prod_pro01', product_name: 'Pro Plan', quantity: 1 }], current_period_start: daysAgo(10), current_period_end: daysAgo(-20), cancel_at_period_end: false, canceled_at: null, ended_at: null, trial_start: null, trial_end: null, collection_method: 'charge_automatically', default_payment_method: 'pm_jane_mc_01', latest_invoice: 'in_0002', created: daysAgo(120), metadata: {} },
    { id: 'sub_03tech', customer: 'cus_R3c4d5e6f7g8h9', customer_name: 'TechStart Inc.', customer_email: 'finance@techstart.io', status: 'active', items: [{ id: 'si_03', price: 'price_pro_monthly', product: 'prod_pro01', product_name: 'Pro Plan', quantity: 1 }], current_period_start: daysAgo(5), current_period_end: daysAgo(-25), cancel_at_period_end: false, canceled_at: null, ended_at: null, trial_start: null, trial_end: null, collection_method: 'charge_automatically', default_payment_method: 'pm_tech_visa_01', latest_invoice: 'in_0003', created: daysAgo(90), metadata: {} },
    { id: 'sub_04globex', customer: 'cus_T5e6f7g8h9i0j1', customer_name: 'Globex Industries', customer_email: 'ap@globexind.com', status: 'active', items: [{ id: 'si_04', price: 'price_enterprise_monthly', product: 'prod_enterprise01', product_name: 'Enterprise Plan', quantity: 1 }, { id: 'si_04b', price: 'price_support_monthly', product: 'prod_support01', product_name: 'Priority Support', quantity: 1 }], current_period_start: daysAgo(8), current_period_end: daysAgo(-22), cancel_at_period_end: false, canceled_at: null, ended_at: null, trial_start: null, trial_end: null, collection_method: 'charge_automatically', default_payment_method: 'pm_globex_amex_01', latest_invoice: 'in_0004', created: daysAgo(200), metadata: {} },
    { id: 'sub_05dev', customer: 'cus_V7g8h9i0j1k2l3', customer_name: 'Dev Solutions LLC', customer_email: 'accounts@devsolutions.co', status: 'active', items: [{ id: 'si_05', price: 'price_pro_monthly', product: 'prod_pro01', product_name: 'Pro Plan', quantity: 10 }], current_period_start: daysAgo(12), current_period_end: daysAgo(-18), cancel_at_period_end: false, canceled_at: null, ended_at: null, trial_start: null, trial_end: null, collection_method: 'charge_automatically', default_payment_method: 'pm_dev_mc_01', latest_invoice: 'in_0005', created: daysAgo(150), metadata: {} },
    { id: 'sub_06cloud', customer: 'cus_Y0j1k2l3m4n5o6', customer_name: 'CloudSync Pro', customer_email: 'billing@cloudsyncpro.com', status: 'active', items: [{ id: 'si_06', price: 'price_enterprise_yearly', product: 'prod_enterprise01', product_name: 'Enterprise Plan', quantity: 1 }], current_period_start: daysAgo(60), current_period_end: daysAgo(-305), cancel_at_period_end: false, canceled_at: null, ended_at: null, trial_start: null, trial_end: null, collection_method: 'charge_automatically', default_payment_method: 'pm_cloud_visa_01', latest_invoice: 'in_0006', created: daysAgo(110), metadata: {} },
    { id: 'sub_07bright', customer: 'cus_C4n5o6p7q8r9s0', customer_name: 'BrightPath Education', customer_email: 'admin@brightpath.edu', status: 'past_due', items: [{ id: 'si_07', price: 'price_starter_monthly', product: 'prod_starter01', product_name: 'Starter Plan', quantity: 1 }], current_period_start: daysAgo(35), current_period_end: daysAgo(-5), cancel_at_period_end: false, canceled_at: null, ended_at: null, trial_start: null, trial_end: null, collection_method: 'charge_automatically', default_payment_method: 'pm_bright_visa_01', latest_invoice: 'in_0007', created: daysAgo(100), metadata: {} },
    { id: 'sub_08nordic', customer: 'cus_E6p7q8r9s0t1u2', customer_name: 'Nordic Design Co.', customer_email: 'hello@nordicdesign.se', status: 'canceled', items: [{ id: 'si_08', price: 'price_pro_monthly', product: 'prod_pro01', product_name: 'Pro Plan', quantity: 1 }], current_period_start: daysAgo(45), current_period_end: daysAgo(-15), cancel_at_period_end: false, canceled_at: daysAgo(10), ended_at: daysAgo(10), trial_start: null, trial_end: null, collection_method: 'charge_automatically', default_payment_method: 'pm_nordic_visa_01', latest_invoice: 'in_0008', created: daysAgo(85), metadata: {} },
    { id: 'sub_09priya', customer: 'cus_G8r9s0t1u2v3w4', customer_name: 'Priya Patel', customer_email: 'priya.patel@gmail.com', status: 'trialing', items: [{ id: 'si_09', price: 'price_pro_monthly', product: 'prod_pro01', product_name: 'Pro Plan', quantity: 1 }], current_period_start: daysAgo(3), current_period_end: daysAgo(-27), cancel_at_period_end: false, canceled_at: null, ended_at: null, trial_start: daysAgo(3), trial_end: daysAgo(-11), collection_method: 'charge_automatically', default_payment_method: 'pm_priya_visa_01', latest_invoice: null, created: daysAgo(3), metadata: {} },
    { id: 'sub_10river', customer: 'cus_A2l3m4n5o6p7q8', customer_name: 'Riverside Medical Group', customer_email: 'it@riversidemedical.org', status: 'paused', items: [{ id: 'si_10', price: 'price_pro_monthly', product: 'prod_pro01', product_name: 'Pro Plan', quantity: 1 }], current_period_start: daysAgo(20), current_period_end: daysAgo(10), cancel_at_period_end: false, canceled_at: null, ended_at: null, trial_start: null, trial_end: null, collection_method: 'charge_automatically', default_payment_method: 'pm_riverside_visa_01', latest_invoice: 'in_0010', created: daysAgo(160), metadata: {} },
  ];

  // ===== INVOICES =====
  const invoices = [];
  const invoiceData = [
    { cust: 0, amount: 9999, status: 'paid', sub: 'sub_01acme', desc: 'Enterprise Plan (Monthly)', priceId: 'price_enterprise_monthly' },
    { cust: 1, amount: 2999, status: 'paid', sub: 'sub_02jane', desc: 'Pro Plan (Monthly)', priceId: 'price_pro_monthly' },
    { cust: 2, amount: 2999, status: 'paid', sub: 'sub_03tech', desc: 'Pro Plan (Monthly)', priceId: 'price_pro_monthly' },
    { cust: 4, amount: 24998, status: 'paid', sub: 'sub_04globex', desc: 'Enterprise Plan + Priority Support', priceId: 'price_enterprise_monthly' },
    { cust: 6, amount: 29990, status: 'paid', sub: 'sub_05dev', desc: 'Pro Plan x10', priceId: 'price_pro_monthly' },
    { cust: 9, amount: 99999, status: 'paid', sub: 'sub_06cloud', desc: 'Enterprise Plan (Yearly)', priceId: 'price_enterprise_yearly' },
    { cust: 13, amount: 999, status: 'open', sub: 'sub_07bright', desc: 'Starter Plan (Monthly)', priceId: 'price_starter_monthly' },
    { cust: 15, amount: 2999, status: 'void', sub: 'sub_08nordic', desc: 'Pro Plan (Monthly)', priceId: 'price_pro_monthly' },
    { cust: 0, amount: 9999, status: 'paid', sub: 'sub_01acme', desc: 'Enterprise Plan (Monthly)', priceId: 'price_enterprise_monthly' },
    { cust: 1, amount: 2999, status: 'paid', sub: 'sub_02jane', desc: 'Pro Plan (Monthly)', priceId: 'price_pro_monthly' },
    { cust: 11, amount: 2999, status: 'paid', sub: null, desc: 'Riverside Medical Group - Pro Plan', priceId: 'price_pro_monthly' },
    { cust: 3, amount: 999, status: 'paid', sub: null, desc: 'Starter Plan', priceId: 'price_starter_monthly' },
    { cust: 5, amount: 2999, status: 'paid', sub: null, desc: 'Pro Plan', priceId: 'price_pro_monthly' },
    { cust: 7, amount: 4999, status: 'paid', sub: null, desc: 'API Access', priceId: 'price_api_monthly' },
    { cust: 4, amount: 24998, status: 'paid', sub: 'sub_04globex', desc: 'Enterprise + Support', priceId: 'price_enterprise_monthly' },
    { cust: 16, amount: 19900, status: 'paid', sub: null, desc: 'One-time Setup Fee', priceId: 'price_setup_onetime' },
    { cust: 8, amount: 999, status: 'paid', sub: null, desc: 'Starter Plan', priceId: 'price_starter_monthly' },
    { cust: 0, amount: 9999, status: 'paid', sub: 'sub_01acme', desc: 'Enterprise Plan (Monthly)', priceId: 'price_enterprise_monthly' },
    { cust: 6, amount: 29990, status: 'paid', sub: 'sub_05dev', desc: 'Pro Plan x10', priceId: 'price_pro_monthly' },
    { cust: 2, amount: 2999, status: 'draft', sub: 'sub_03tech', desc: 'Pro Plan (Monthly)', priceId: 'price_pro_monthly' },
    { cust: 4, amount: 24998, status: 'draft', sub: 'sub_04globex', desc: 'Enterprise + Support', priceId: 'price_enterprise_monthly' },
    { cust: 13, amount: 999, status: 'uncollectible', sub: 'sub_07bright', desc: 'Starter Plan (past due)', priceId: 'price_starter_monthly' },
  ];

  invoiceData.forEach((inv, i) => {
    const cust = customers[inv.cust];
    const dayOffset = Math.floor(i * 60 / invoiceData.length);
    invoices.push({
      id: `in_${String(i + 1).padStart(4, '0')}`,
      number: `INV-${String(i + 1).padStart(4, '0')}`,
      customer: cust.id,
      customer_name: cust.name,
      customer_email: cust.email,
      status: inv.status,
      amount_due: inv.amount,
      amount_paid: inv.status === 'paid' ? inv.amount : 0,
      amount_remaining: inv.status === 'paid' ? 0 : inv.amount,
      currency: 'usd',
      description: null,
      due_date: inv.status === 'draft' ? null : daysAgo(dayOffset - 30),
      collection_method: 'charge_automatically',
      billing_reason: inv.sub ? 'subscription_cycle' : 'manual',
      subscription: inv.sub,
      lines: [{ id: `il_${String(i + 1).padStart(4, '0')}`, description: inv.desc, amount: inv.amount, currency: 'usd', quantity: 1, price: inv.priceId, period: { start: daysAgo(dayOffset + 30), end: daysAgo(dayOffset) } }],
      subtotal: inv.amount,
      tax: 0,
      total: inv.amount,
      period_start: daysAgo(dayOffset + 30),
      period_end: daysAgo(dayOffset),
      created: daysAgo(dayOffset),
      paid_at: inv.status === 'paid' ? daysAgo(dayOffset - 1) : null,
      metadata: {},
    });
  });

  // ===== PAYOUTS =====
  const payouts = [];
  for (let i = 0; i < 12; i++) {
    const dayOffset = i * 5;
    let status = 'paid';
    if (i === 0) status = 'pending';
    if (i === 1) status = 'in_transit';
    const amount = 50000 + Math.floor(Math.random() * 450000);
    payouts.push({
      id: `po_${String(i + 1).padStart(4, '0')}aB3cD`,
      amount,
      currency: 'usd',
      status,
      arrival_date: daysAgo(dayOffset - 2),
      method: 'standard',
      type: 'bank_account',
      description: 'XTRIPE PAYOUT',
      destination: { bank_name: 'BANK OF AMERICA', last4: '6789', routing_number: '***4321' },
      created: daysAgo(dayOffset),
      metadata: {},
    });
  }

  // ===== DISPUTES =====
  const disputes = [
    { id: 'dp_001aB3cD', amount: 9999, currency: 'usd', charge: payments[2].id, customer: payments[2].customer, reason: 'fraudulent', status: 'needs_response', evidence_due_by: daysAgo(-7), created: daysAgo(5), metadata: {} },
    { id: 'dp_002eF5gH', amount: 2999, currency: 'usd', charge: payments[8].id, customer: payments[8].customer, reason: 'product_not_received', status: 'under_review', evidence_due_by: daysAgo(-14), created: daysAgo(12), metadata: {} },
    { id: 'dp_003iJ7kL', amount: 4999, currency: 'usd', charge: payments[15].id, customer: payments[15].customer, reason: 'duplicate', status: 'won', evidence_due_by: null, created: daysAgo(25), metadata: {} },
    { id: 'dp_004mN9oP', amount: 19900, currency: 'usd', charge: payments[22].id, customer: payments[22].customer, reason: 'unrecognized', status: 'lost', evidence_due_by: null, created: daysAgo(35), metadata: {} },
  ];

  // ===== REFUNDS =====
  const refunds = [
    { id: 're_001aB3cD', amount: 2999, currency: 'usd', charge: payments[43].id, reason: 'requested_by_customer', status: 'succeeded', created: daysAgo(2), metadata: {} },
    { id: 're_002eF5gH', amount: 999, currency: 'usd', charge: payments[44].id, reason: 'requested_by_customer', status: 'succeeded', created: daysAgo(3), metadata: {} },
    { id: 're_003iJ7kL', amount: 1500, currency: 'usd', charge: payments[41].id, reason: 'duplicate', status: 'succeeded', created: daysAgo(5), metadata: {} },
    { id: 're_004mN9oP', amount: 4999, currency: 'usd', charge: payments[42].id, reason: 'duplicate', status: 'succeeded', created: daysAgo(7), metadata: {} },
    { id: 're_005qR1sT', amount: 9999, currency: 'usd', charge: payments[10].id, reason: 'requested_by_customer', status: 'succeeded', created: daysAgo(10), metadata: {} },
    { id: 're_006uV3wX', amount: 19900, currency: 'usd', charge: payments[20].id, reason: 'fraudulent', status: 'succeeded', created: daysAgo(15), metadata: {} },
  ];

  // ===== BALANCE TRANSACTIONS =====
  const balanceTransactions = [];
  payments.filter(p => p.status === 'succeeded').forEach((p, i) => {
    const fee = Math.round(p.amount * 0.029 + 30);
    balanceTransactions.push({
      id: `txn_ch_${String(i + 1).padStart(4, '0')}`,
      amount: p.amount,
      currency: 'usd',
      type: 'charge',
      fee,
      net: p.amount - fee,
      status: 'available',
      available_on: p.created + 172800,
      source: p.id,
      description: `Payment for ${p.description || 'order'}`,
      created: p.created,
    });
  });
  refunds.forEach((r, i) => {
    balanceTransactions.push({
      id: `txn_re_${String(i + 1).padStart(4, '0')}`,
      amount: -r.amount,
      currency: 'usd',
      type: 'refund',
      fee: 0,
      net: -r.amount,
      status: 'available',
      available_on: r.created + 172800,
      source: r.id,
      description: `Refund for ${r.charge}`,
      created: r.created,
    });
  });
  payouts.filter(p => p.status === 'paid').forEach((p, i) => {
    balanceTransactions.push({
      id: `txn_po_${String(i + 1).padStart(4, '0')}`,
      amount: -p.amount,
      currency: 'usd',
      type: 'payout',
      fee: 0,
      net: -p.amount,
      status: 'available',
      available_on: p.arrival_date,
      source: p.id,
      description: 'XTRIPE PAYOUT',
      created: p.created,
    });
  });

  // ===== EVENTS =====
  const events = [];
  const eventTypes = [
    ['payment_intent.created', 1], ['payment_intent.succeeded', 0.5], ['charge.succeeded', 0.5],
    ['customer.created', 2], ['customer.updated', 3], ['invoice.created', 1],
    ['invoice.paid', 1.5], ['invoice.payment_failed', 4], ['subscription.created', 2],
    ['subscription.updated', 3], ['payout.paid', 5], ['dispute.created', 6],
    ['charge.refunded', 2],
  ];
  for (let i = 0; i < 35; i++) {
    const evtType = eventTypes[i % eventTypes.length];
    events.push({
      id: `evt_${String(i + 1).padStart(4, '0')}aB3cD`,
      type: evtType[0],
      created: daysAgo(Math.floor(evtType[1] + i * 0.2)),
      data: { object: { id: payments[i % payments.length]?.id || 'unknown' } },
      request: null,
      livemode: true,
    });
  }

  // ===== METRICS =====
  const grossVolumeChart = [];
  for (let h = 0; h < 24; h++) {
    const hourLabel = h === 0 ? '12:00 AM' : h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
    const amount = h < 8 ? Math.floor(Math.random() * 5000) + 1000 :
                   h < 18 ? Math.floor(Math.random() * 25000) + 10000 :
                   Math.floor(Math.random() * 10000) + 3000;
    grossVolumeChart.push({ time: hourLabel, amount });
  }

  const grossVolumeDaily = [];
  const netVolumeDaily = [];
  const disputeRateDaily = [];
  for (let d = 28; d >= 0; d--) {
    const date = new Date(Date.now() - d * 86400000);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const gv = Math.floor(Math.random() * 50000) + 120000;
    grossVolumeDaily.push({ date: label, amount: gv });
    netVolumeDaily.push({ date: label, amount: Math.floor(gv * 0.92) });
    disputeRateDaily.push({ date: label, rate: +(Math.random() * 0.3 + 0.2).toFixed(2) });
  }

  return {
    business: {
      name: 'Rocket Rides',
      email: 'admin@rocketrides.io',
      url: 'https://rocketrides.io',
      support_email: 'support@rocketrides.io',
      country: 'US',
      currency: 'usd',
      timezone: 'America/Los_Angeles',
    },
    currentUser: {
      id: 'user_admin',
      name: 'Alex Johnson',
      email: 'alex@rocketrides.io',
      role: 'administrator',
      avatar: null,
    },
    balance: {
      available: 553257,
      pending: 125430,
      reserved: 0,
      currency: 'usd',
    },
    customers,
    payments,
    products,
    prices,
    invoices,
    subscriptions,
    payouts,
    disputes,
    refunds,
    balanceTransactions,
    events,
    paymentMethods,
    testMode: false,
    searchQuery: '',
    selectedDateRange: 'last_4_weeks',
    metrics: {
      today: {
        grossVolume: 352819,
        grossVolumeChart,
      },
      summary: {
        grossVolume: { amount: 454234545, change: 4.6, previousAmount: 434062124 },
        netVolume: { amount: 418033254, change: 4.2, previousAmount: 401173291 },
        disputeActivity: { rate: 0.36, change: -1.9, previousRate: 0.37 },
      },
      chartData: {
        grossVolume: grossVolumeDaily,
        netVolume: netVolumeDaily,
        disputeRate: disputeRateDaily,
      },
    },
  };
}
