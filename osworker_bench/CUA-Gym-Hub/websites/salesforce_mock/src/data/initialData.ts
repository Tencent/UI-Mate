
import { AppState, Dashboard } from '../types';

const BASE_STORAGE_KEY = 'xalesforce-crm-state';
const BASE_INITIAL_KEY = 'xalesforce-crm-initial';

// Get session-specific storage keys
function storageKey(sid: string | null): string {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid: string | null): string {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

// Read sid from URL query string or sessionStorage (survives refresh + SPA navigation)
export const getSessionId = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
};

export const getInitialState = (sid: string | null = null): AppState | null => {
  const stored = localStorage.getItem(initialKey(sid));
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};

export const fetchCustomState = async (sid: string | null = null): Promise<any | null> => {
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

// Save current state to session-specific localStorage
export const saveState = (state: AppState, sid: string | null = null): void => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state }),
    keepalive: true,
  }).catch(() => {});
};

export const initializeData = (sid: string | null = null, customState: any = null): AppState => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  // If custom state provided (first load with session), merge with defaults
  if (customState) {
    const data = deepMergeWithDefaults(createInitialState(), customState);
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  // Load from session-specific localStorage (refresh case)
  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
    }
    return JSON.parse(stored);
  }

  // No session data, no custom state -> create defaults
  const data = createInitialState();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

// --- Normalization helpers for array fields ---

function normalizeUser(user: any, index: number): any {
  return {
    userId: user.userId || `user-custom-${index}`,
    firstName: user.firstName || 'Unknown',
    lastName: user.lastName || 'User',
    email: user.email || `user${index}@company.com`,
    phone: user.phone || '',
    title: user.title || '',
    department: user.department || '',
    role: user.role || 'User',
    avatar: user.avatar || `https://picsum.photos/100/100?random=user${index}`,
    timezone: user.timezone || 'America/New_York',
    locale: user.locale || 'en_US',
    theme: user.theme || 'light',
  };
}

function normalizeLead(lead: any, index: number): any {
  return {
    leadId: lead.leadId || `lead-custom-${index}`,
    firstName: lead.firstName || 'Unknown',
    lastName: lead.lastName || 'Lead',
    company: lead.company || '',
    title: lead.title || '',
    email: lead.email || '',
    phone: lead.phone || '',
    mobile: lead.mobile || '',
    status: lead.status || 'New',
    source: lead.source || '',
    rating: lead.rating || 'Warm',
    street: lead.street || '',
    city: lead.city || '',
    state: lead.state || '',
    zip: lead.zip || '',
    country: lead.country || 'USA',
    industry: lead.industry || '',
    employees: typeof lead.employees === 'number' ? lead.employees : 0,
    revenue: typeof lead.revenue === 'number' ? lead.revenue : 0,
    website: lead.website || '',
    description: lead.description || '',
    ownerId: lead.ownerId || '',
    createdDate: lead.createdDate || new Date().toISOString(),
    modifiedDate: lead.modifiedDate || new Date().toISOString(),
  };
}

function normalizeAccount(account: any, index: number): any {
  return {
    accountId: account.accountId || `account-custom-${index}`,
    name: account.name || 'Unknown Account',
    phone: account.phone || '',
    website: account.website || '',
    type: account.type || 'Prospect',
    industry: account.industry || '',
    revenue: typeof account.revenue === 'number' ? account.revenue : 0,
    employees: typeof account.employees === 'number' ? account.employees : 0,
    description: account.description || '',
    ownerId: account.ownerId || '',
    billingStreet: account.billingStreet || '',
    billingCity: account.billingCity || '',
    billingState: account.billingState || '',
    billingZip: account.billingZip || '',
    billingCountry: account.billingCountry || 'USA',
    shippingStreet: account.shippingStreet || '',
    shippingCity: account.shippingCity || '',
    shippingState: account.shippingState || '',
    shippingZip: account.shippingZip || '',
    shippingCountry: account.shippingCountry || 'USA',
    createdDate: account.createdDate || new Date().toISOString(),
    modifiedDate: account.modifiedDate || new Date().toISOString(),
  };
}

function normalizeContact(contact: any, index: number): any {
  return {
    contactId: contact.contactId || `contact-custom-${index}`,
    accountId: contact.accountId || '',
    firstName: contact.firstName || 'Unknown',
    lastName: contact.lastName || 'Contact',
    title: contact.title || '',
    department: contact.department || '',
    email: contact.email || '',
    phone: contact.phone || '',
    mobile: contact.mobile || '',
    reportsToId: contact.reportsToId || undefined,
    mailingStreet: contact.mailingStreet || '',
    mailingCity: contact.mailingCity || '',
    mailingState: contact.mailingState || '',
    mailingZip: contact.mailingZip || '',
    mailingCountry: contact.mailingCountry || 'USA',
    ownerId: contact.ownerId || '',
    createdDate: contact.createdDate || new Date().toISOString(),
    modifiedDate: contact.modifiedDate || new Date().toISOString(),
  };
}

function normalizeOpportunity(opp: any, index: number): any {
  return {
    opportunityId: opp.opportunityId || `opp-custom-${index}`,
    name: opp.name || 'Untitled Opportunity',
    accountId: opp.accountId || '',
    contactId: opp.contactId || undefined,
    amount: typeof opp.amount === 'number' ? opp.amount : 0,
    closeDate: opp.closeDate || new Date().toISOString(),
    stage: opp.stage || 'Prospecting',
    probability: typeof opp.probability === 'number' ? opp.probability : 0,
    type: opp.type || 'New Business',
    leadSource: opp.leadSource || '',
    nextStep: opp.nextStep || '',
    description: opp.description || '',
    ownerId: opp.ownerId || '',
    createdDate: opp.createdDate || new Date().toISOString(),
    modifiedDate: opp.modifiedDate || new Date().toISOString(),
  };
}

function normalizeCase(c: any, index: number): any {
  return {
    caseId: c.caseId || `case-custom-${index}`,
    caseNumber: c.caseNumber || `CASE-${10000 + index}`,
    subject: c.subject || '',
    status: c.status || 'New',
    priority: c.priority || 'Medium',
    origin: c.origin || 'Web',
    type: c.type || undefined,
    accountId: c.accountId || '',
    contactId: c.contactId || '',
    description: c.description || '',
    internalComments: c.internalComments || undefined,
    ownerId: c.ownerId || '',
    createdDate: c.createdDate || new Date().toISOString(),
    modifiedDate: c.modifiedDate || new Date().toISOString(),
    closedDate: c.closedDate || undefined,
  };
}

function normalizeActivity(activity: any, index: number): any {
  return {
    activityId: activity.activityId || `activity-custom-${index}`,
    type: activity.type || 'task',
    subject: activity.subject || '',
    status: activity.status || 'Not Started',
    priority: activity.priority || 'Medium',
    dueDate: activity.dueDate || undefined,
    startDateTime: activity.startDateTime || undefined,
    endDateTime: activity.endDateTime || undefined,
    relatedToType: activity.relatedToType || '',
    relatedToId: activity.relatedToId || '',
    assignedToId: activity.assignedToId || '',
    description: activity.description || '',
    createdDate: activity.createdDate || new Date().toISOString(),
  };
}

function normalizeChatterPost(post: any, index: number): any {
  return {
    postId: post.postId || `post-custom-${index}`,
    userId: post.userId || '',
    content: post.content || '',
    createdDate: post.createdDate || new Date().toISOString(),
    likeCount: typeof post.likeCount === 'number' ? post.likeCount : 0,
    commentCount: typeof post.commentCount === 'number' ? post.commentCount : 0,
    likes: Array.isArray(post.likes) ? post.likes : [],
    comments: Array.isArray(post.comments) ? post.comments.map((c: any, i: number) => ({
      commentId: c.commentId || `comment-custom-${i}`,
      userId: c.userId || '',
      content: c.content || '',
      createdDate: c.createdDate || new Date().toISOString(),
      likeCount: typeof c.likeCount === 'number' ? c.likeCount : 0,
      likes: Array.isArray(c.likes) ? c.likes : [],
    })) : [],
  };
}

function normalizeFile(file: any, index: number): any {
  return {
    fileId: file.fileId || `file-custom-${index}`,
    name: file.name || 'untitled',
    type: file.type || 'application/octet-stream',
    size: typeof file.size === 'number' ? file.size : 0,
    url: file.url || '#',
    ownerId: file.ownerId || '',
    uploadDate: file.uploadDate || new Date().toISOString(),
  };
}

function normalizePartner(partner: any, index: number): any {
  return {
    partnerId: partner.partnerId || `partner-custom-${index}`,
    name: partner.name || 'Unknown Partner',
    stage: partner.stage || 'Prospect',
    nextAction: partner.nextAction || '',
    nextActionDate: partner.nextActionDate || '',
    notes: partner.notes || '',
    coMarketingStatus: partner.coMarketingStatus || 'Not Started',
    primaryContact: partner.primaryContact || '',
    contactEmail: partner.contactEmail || '',
    dealRegistration: partner.dealRegistration || 'Disabled',
    ownerId: partner.ownerId || '',
    createdDate: partner.createdDate || new Date().toISOString(),
    modifiedDate: partner.modifiedDate || new Date().toISOString(),
  };
}

function normalizeDashboard(d: any, index: number): Dashboard {
  return {
    dashboardId: d.dashboardId || `dashboard-custom-${index}`,
    name: d.name || 'Untitled Dashboard',
    description: d.description || undefined,
    chartType: d.chartType || 'bar',
    createdDate: d.createdDate || new Date().toISOString(),
    createdBy: d.createdBy || '',
  };
}

// Deep merge custom state with defaults (custom takes precedence)
function deepMergeWithDefaults(defaults: AppState, custom: any): AppState {
  if (!custom) return defaults;

  const result: any = { ...defaults };

  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (key === 'user' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
        result[key] = normalizeUser(custom[key], 0);
      } else if (key === 'users' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((u: any, i: number) => normalizeUser(u, i));
      } else if (key === 'leads' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((l: any, i: number) => normalizeLead(l, i));
      } else if (key === 'accounts' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((a: any, i: number) => normalizeAccount(a, i));
      } else if (key === 'contacts' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((c: any, i: number) => normalizeContact(c, i));
      } else if (key === 'opportunities' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((o: any, i: number) => normalizeOpportunity(o, i));
      } else if (key === 'cases' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((c: any, i: number) => normalizeCase(c, i));
      } else if (key === 'activities' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((a: any, i: number) => normalizeActivity(a, i));
      } else if (key === 'chatterPosts' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((p: any, i: number) => normalizeChatterPost(p, i));
      } else if (key === 'files' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((f: any, i: number) => normalizeFile(f, i));
      } else if (key === 'dashboards' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((d: any, i: number) => normalizeDashboard(d, i));
      } else if (key === 'partners' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((p: any, i: number) => normalizePartner(p, i));
      } else if (key === 'emailDrafts' && Array.isArray(custom[key])) {
        result[key] = custom[key];
      } else if (key === 'reportSnapshots' && Array.isArray(custom[key])) {
        result[key] = custom[key];
      } else if (key === 'following' && Array.isArray(custom[key])) {
        result[key] = custom[key];
      } else if (key === 'recentlyViewed' && Array.isArray(custom[key])) {
        result[key] = custom[key];
      } else if (key === 'dismissedNotifications' && Array.isArray(custom[key])) {
        result[key] = custom[key];
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof (defaults as any)[key] === 'object') {
        result[key] = { ...(defaults as any)[key], ...custom[key] };
      } else {
        result[key] = custom[key];
      }
    }
  }

  return result as AppState;
}

const createInitialState = (): AppState => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const hour = 60 * 60 * 1000;

  return {
    user: {
      userId: 'user-1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@company.com',
      phone: '(555) 123-4567',
      title: 'Sales Manager',
      department: 'Sales',
      role: 'Manager',
      avatar: 'https://i.pravatar.cc/150?u=user-1',
      timezone: 'America/New_York',
      locale: 'en-US',
      theme: 'lightning'
    },
    users: [
      { userId: 'user-1', firstName: 'John', lastName: 'Smith', email: 'john.smith@company.com', phone: '(555) 123-4567', title: 'Sales Manager', department: 'Sales', role: 'Manager', avatar: 'https://i.pravatar.cc/150?u=user-1', timezone: 'America/New_York', locale: 'en-US', theme: 'lightning' },
      { userId: 'user-2', firstName: 'Emma', lastName: 'Wilson', email: 'emma.wilson@company.com', phone: '(555) 234-5678', title: 'Senior Sales Rep', department: 'Sales', role: 'Rep', avatar: 'https://i.pravatar.cc/150?u=user-2', timezone: 'America/New_York', locale: 'en-US', theme: 'lightning' },
      { userId: 'user-3', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@company.com', phone: '(555) 345-6789', title: 'Sales Rep', department: 'Sales', role: 'Rep', avatar: 'https://i.pravatar.cc/150?u=user-3', timezone: 'America/Chicago', locale: 'en-US', theme: 'lightning' },
      { userId: 'user-4', firstName: 'Sarah', lastName: 'Davis', email: 'sarah.davis@company.com', phone: '(555) 456-7890', title: 'Sales Rep', department: 'Sales', role: 'Rep', avatar: 'https://i.pravatar.cc/150?u=user-4', timezone: 'America/Los_Angeles', locale: 'en-US', theme: 'lightning' },
      { userId: 'user-5', firstName: 'David', lastName: 'Brown', email: 'david.brown@company.com', phone: '(555) 567-8901', title: 'Junior Sales Rep', department: 'Sales', role: 'Rep', avatar: 'https://i.pravatar.cc/150?u=user-5', timezone: 'America/Denver', locale: 'en-US', theme: 'lightning' }
    ],
    leads: [
      // 3 New leads
      { leadId: 'lead-1', firstName: 'Sarah', lastName: 'Johnson', company: 'TechVentures Inc.', title: 'VP of Engineering', email: 'sarah.j@techventures.com', phone: '(555) 111-2222', mobile: '(555) 111-3333', status: 'New', source: 'Website', rating: 'Hot', street: '123 Innovation Dr', city: 'San Francisco', state: 'CA', zip: '94105', country: 'United States', industry: 'Technology', employees: 250, revenue: 15000000, website: 'https://techventures.com', description: 'Interested in enterprise CRM solution. Saw our webinar on digital transformation.', ownerId: 'user-1', createdDate: new Date(now - 2 * day).toISOString(), modifiedDate: new Date(now - 1 * day).toISOString() },
      { leadId: 'lead-2', firstName: 'Robert', lastName: 'Taylor', company: 'MedTech Partners', title: 'Director of Operations', email: 'r.taylor@medtechpartners.com', phone: '(555) 222-3333', mobile: '(555) 222-4444', status: 'New', source: 'LinkedIn', rating: 'Warm', street: '456 Health Ave', city: 'New York', state: 'NY', zip: '10001', country: 'United States', industry: 'Healthcare', employees: 180, revenue: 22000000, website: 'https://medtechpartners.com', description: 'Found us on LinkedIn. Interested in healthcare-specific CRM features.', ownerId: 'user-2', createdDate: new Date(now - 1 * day).toISOString(), modifiedDate: new Date(now - 1 * day).toISOString() },
      { leadId: 'lead-3', firstName: 'Patricia', lastName: 'Nguyen', company: 'FinanceFirst Corp', title: 'CFO', email: 'p.nguyen@financefirst.com', phone: '(555) 333-4444', mobile: '(555) 333-5555', status: 'New', source: 'Trade Show', rating: 'Warm', street: '789 Wall St', city: 'Chicago', state: 'IL', zip: '60601', country: 'United States', industry: 'Finance', employees: 400, revenue: 65000000, website: 'https://financefirst.com', description: 'Met at Cloud Expo 2025. Wants to replace legacy CRM system.', ownerId: 'user-3', createdDate: new Date(now - 3 * day).toISOString(), modifiedDate: new Date(now - 2 * day).toISOString() },
      // 2 Working leads
      { leadId: 'lead-4', firstName: 'James', lastName: 'Rodriguez', company: 'AutomatePro', title: 'CTO', email: 'j.rodriguez@automatepro.com', phone: '(555) 444-5555', mobile: '(555) 444-6666', status: 'Working', source: 'Website', rating: 'Hot', street: '321 Tech Park Blvd', city: 'Austin', state: 'TX', zip: '73301', country: 'United States', industry: 'Technology', employees: 120, revenue: 8000000, website: 'https://automatepro.com', description: 'Downloading whitepapers and attending webinars regularly. Ready for demo.', ownerId: 'user-1', createdDate: new Date(now - 7 * day).toISOString(), modifiedDate: new Date(now - 1 * day).toISOString() },
      { leadId: 'lead-5', firstName: 'Karen', lastName: 'Mitchell', company: 'RetailMax', title: 'VP of Sales', email: 'k.mitchell@retailmax.com', phone: '(555) 555-6666', mobile: '(555) 555-7777', status: 'Working', source: 'Referral', rating: 'Warm', street: '654 Commerce Way', city: 'Seattle', state: 'WA', zip: '98101', country: 'United States', industry: 'Retail', employees: 350, revenue: 42000000, website: 'https://retailmax.com', description: 'Referred by existing customer Acme Corporation. Looking for sales automation.', ownerId: 'user-2', createdDate: new Date(now - 5 * day).toISOString(), modifiedDate: new Date(now).toISOString() },
      // 2 Qualified leads
      { leadId: 'lead-6', firstName: 'Daniel', lastName: 'Park', company: 'CloudNine Systems', title: 'CEO', email: 'd.park@cloudnine.com', phone: '(555) 666-7777', mobile: '(555) 666-8888', status: 'Qualified', source: 'Website', rating: 'Hot', street: '100 Startup Lane', city: 'Boston', state: 'MA', zip: '02101', country: 'United States', industry: 'Technology', employees: 75, revenue: 5000000, website: 'https://cloudnine.com', description: 'Budget approved, decision maker engaged. Needs proposal by end of month.', ownerId: 'user-1', createdDate: new Date(now - 14 * day).toISOString(), modifiedDate: new Date(now - 2 * day).toISOString() },
      { leadId: 'lead-7', firstName: 'Lisa', lastName: 'Chang', company: 'ManuCorp International', title: 'Director of IT', email: 'l.chang@manucorp.com', phone: '(555) 777-8888', mobile: '(555) 777-9999', status: 'Qualified', source: 'Trade Show', rating: 'Hot', street: '200 Factory Rd', city: 'Denver', state: 'CO', zip: '80201', country: 'United States', industry: 'Manufacturing', employees: 600, revenue: 95000000, website: 'https://manucorp.com', description: 'Has budget of $200K+. Wants implementation within Q2.', ownerId: 'user-3', createdDate: new Date(now - 10 * day).toISOString(), modifiedDate: new Date(now - 1 * day).toISOString() },
      // 1 Unqualified lead
      { leadId: 'lead-8', firstName: 'Thomas', lastName: 'Garcia', company: 'SmallBiz Co', title: 'Owner', email: 't.garcia@smallbiz.com', phone: '(555) 888-9999', mobile: '(555) 888-0000', status: 'Unqualified', source: 'Website', rating: 'Cold', street: '50 Main St', city: 'Miami', state: 'FL', zip: '33101', country: 'United States', industry: 'Retail', employees: 10, revenue: 500000, website: 'https://smallbiz.com', description: 'Too small for enterprise solution. Recommended partner program instead.', ownerId: 'user-5', createdDate: new Date(now - 20 * day).toISOString(), modifiedDate: new Date(now - 15 * day).toISOString() }
    ],
    accounts: [
      { accountId: 'account-1', name: 'Acme Corporation', phone: '(555) 100-2000', website: 'https://acme.com', type: 'Customer', industry: 'Technology', revenue: 50000000, employees: 500, description: 'Enterprise software company specializing in cloud solutions. Long-standing customer since 2020.', ownerId: 'user-1', billingStreet: '100 Main St', billingCity: 'New York', billingState: 'NY', billingZip: '10001', billingCountry: 'United States', shippingStreet: '100 Main St', shippingCity: 'New York', shippingState: 'NY', shippingZip: '10001', shippingCountry: 'United States', createdDate: new Date(now - 365 * day).toISOString(), modifiedDate: new Date(now - 30 * day).toISOString() },
      { accountId: 'account-2', name: 'Global Enterprises', phone: '(555) 200-3000', website: 'https://globalenterprises.com', type: 'Customer', industry: 'Finance', revenue: 120000000, employees: 2000, description: 'Multinational financial services firm. Major customer with multiple product lines.', ownerId: 'user-2', billingStreet: '500 Wall St', billingCity: 'New York', billingState: 'NY', billingZip: '10005', billingCountry: 'United States', shippingStreet: '500 Wall St', shippingCity: 'New York', shippingState: 'NY', shippingZip: '10005', shippingCountry: 'United States', createdDate: new Date(now - 300 * day).toISOString(), modifiedDate: new Date(now - 15 * day).toISOString() },
      { accountId: 'account-3', name: 'Innovate Solutions', phone: '(555) 300-4000', website: 'https://innovatesolutions.com', type: 'Prospect', industry: 'Healthcare', revenue: 25000000, employees: 200, description: 'Healthcare technology startup building next-gen patient management systems.', ownerId: 'user-3', billingStreet: '75 Health Blvd', billingCity: 'San Francisco', billingState: 'CA', billingZip: '94102', billingCountry: 'United States', shippingStreet: '75 Health Blvd', shippingCity: 'San Francisco', shippingState: 'CA', shippingZip: '94102', shippingCountry: 'United States', createdDate: new Date(now - 90 * day).toISOString(), modifiedDate: new Date(now - 10 * day).toISOString() },
      { accountId: 'account-4', name: 'Pacific Trading Co.', phone: '(555) 400-5000', website: 'https://pacifictrading.com', type: 'Partner', industry: 'Manufacturing', revenue: 80000000, employees: 1200, description: 'International manufacturing and trading partner. Reseller of our products in APAC region.', ownerId: 'user-1', billingStreet: '250 Harbor Way', billingCity: 'Seattle', billingState: 'WA', billingZip: '98101', billingCountry: 'United States', shippingStreet: '250 Harbor Way', shippingCity: 'Seattle', shippingState: 'WA', shippingZip: '98101', shippingCountry: 'United States', createdDate: new Date(now - 200 * day).toISOString(), modifiedDate: new Date(now - 5 * day).toISOString() },
      { accountId: 'account-5', name: 'Summit Digital', phone: '(555) 500-6000', website: 'https://summitdigital.com', type: 'Prospect', industry: 'Retail', revenue: 15000000, employees: 150, description: 'E-commerce platform and digital retail solutions provider. Evaluating our CRM for sales team.', ownerId: 'user-4', billingStreet: '800 Commerce Dr', billingCity: 'Austin', billingState: 'TX', billingZip: '73301', billingCountry: 'United States', shippingStreet: '800 Commerce Dr', shippingCity: 'Austin', shippingState: 'TX', shippingZip: '73301', shippingCountry: 'United States', createdDate: new Date(now - 60 * day).toISOString(), modifiedDate: new Date(now - 3 * day).toISOString() }
    ],
    contacts: [
      // 2 for Acme Corporation
      { contactId: 'contact-1', accountId: 'account-1', firstName: 'Alice', lastName: 'Williams', title: 'CTO', department: 'Engineering', email: 'alice.w@acme.com', phone: '(555) 100-2001', mobile: '(555) 100-2002', mailingStreet: '100 Main St', mailingCity: 'New York', mailingState: 'NY', mailingZip: '10001', mailingCountry: 'United States', ownerId: 'user-1', createdDate: new Date(now - 350 * day).toISOString(), modifiedDate: new Date(now - 20 * day).toISOString() },
      { contactId: 'contact-2', accountId: 'account-1', firstName: 'Bob', lastName: 'Chen', title: 'VP Sales', department: 'Sales', email: 'bob.chen@acme.com', phone: '(555) 100-2003', mobile: '(555) 100-2004', reportsToId: 'contact-1', mailingStreet: '100 Main St', mailingCity: 'New York', mailingState: 'NY', mailingZip: '10001', mailingCountry: 'United States', ownerId: 'user-1', createdDate: new Date(now - 340 * day).toISOString(), modifiedDate: new Date(now - 10 * day).toISOString() },
      // 2 for Global Enterprises
      { contactId: 'contact-3', accountId: 'account-2', firstName: 'Diana', lastName: 'Park', title: 'CFO', department: 'Finance', email: 'diana.park@globalent.com', phone: '(555) 200-3001', mobile: '(555) 200-3002', mailingStreet: '500 Wall St', mailingCity: 'New York', mailingState: 'NY', mailingZip: '10005', mailingCountry: 'United States', ownerId: 'user-2', createdDate: new Date(now - 280 * day).toISOString(), modifiedDate: new Date(now - 15 * day).toISOString() },
      { contactId: 'contact-4', accountId: 'account-2', firstName: 'Frank', lastName: 'Rivera', title: 'Director of IT', department: 'Information Technology', email: 'frank.r@globalent.com', phone: '(555) 200-3003', mobile: '(555) 200-3004', reportsToId: 'contact-3', mailingStreet: '500 Wall St', mailingCity: 'New York', mailingState: 'NY', mailingZip: '10005', mailingCountry: 'United States', ownerId: 'user-2', createdDate: new Date(now - 260 * day).toISOString(), modifiedDate: new Date(now - 8 * day).toISOString() },
      // 1 for Innovate Solutions
      { contactId: 'contact-5', accountId: 'account-3', firstName: 'Lisa', lastName: 'Patel', title: 'CEO', department: 'Executive', email: 'dr.patel@innovatesolutions.com', phone: '(555) 300-4001', mobile: '(555) 300-4002', mailingStreet: '75 Health Blvd', mailingCity: 'San Francisco', mailingState: 'CA', mailingZip: '94102', mailingCountry: 'United States', ownerId: 'user-3', createdDate: new Date(now - 85 * day).toISOString(), modifiedDate: new Date(now - 5 * day).toISOString() },
      // 1 for Pacific Trading
      { contactId: 'contact-6', accountId: 'account-4', firstName: 'Tom', lastName: 'Nakamura', title: 'Procurement Manager', department: 'Procurement', email: 'tom.n@pacifictrading.com', phone: '(555) 400-5001', mobile: '(555) 400-5002', mailingStreet: '250 Harbor Way', mailingCity: 'Seattle', mailingState: 'WA', mailingZip: '98101', mailingCountry: 'United States', ownerId: 'user-1', createdDate: new Date(now - 190 * day).toISOString(), modifiedDate: new Date(now - 3 * day).toISOString() }
    ],
    opportunities: [
      { opportunityId: 'opp-1', name: 'Acme - Enterprise License', accountId: 'account-1', contactId: 'contact-1', amount: 25000, closeDate: new Date(now + 60 * day).toISOString(), stage: 'Prospecting', probability: 10, type: 'New Business', leadSource: 'Website', nextStep: 'Schedule initial discovery call', description: 'New enterprise license deal for expanded team', ownerId: 'user-5', createdDate: new Date(now - 10 * day).toISOString(), modifiedDate: new Date(now - 5 * day).toISOString() },
      { opportunityId: 'opp-2', name: 'Global - Platform Upgrade', accountId: 'account-2', contactId: 'contact-3', amount: 75000, closeDate: new Date(now + 45 * day).toISOString(), stage: 'Qualification', probability: 20, type: 'Existing Business', leadSource: 'Referral', nextStep: 'Confirm budget with CFO', description: 'Upgrading from Standard to Enterprise tier', ownerId: 'user-2', createdDate: new Date(now - 30 * day).toISOString(), modifiedDate: new Date(now - 7 * day).toISOString() },
      { opportunityId: 'opp-3', name: 'Innovate - CRM Implementation', accountId: 'account-3', contactId: 'contact-5', amount: 150000, closeDate: new Date(now + 30 * day).toISOString(), stage: 'Needs Analysis', probability: 30, type: 'New Business', leadSource: 'Trade Show', nextStep: 'Conduct needs assessment workshop', description: 'Full CRM implementation for healthcare workflows', ownerId: 'user-3', createdDate: new Date(now - 45 * day).toISOString(), modifiedDate: new Date(now - 3 * day).toISOString() },
      { opportunityId: 'opp-4', name: 'Pacific - Annual Renewal', accountId: 'account-4', contactId: 'contact-6', amount: 200000, closeDate: new Date(now + 20 * day).toISOString(), stage: 'Proposal', probability: 60, type: 'Renewal', leadSource: 'Existing Customer', nextStep: 'Send final proposal with pricing', description: 'Annual partnership renewal with expanded scope', ownerId: 'user-1', createdDate: new Date(now - 60 * day).toISOString(), modifiedDate: new Date(now - 2 * day).toISOString() },
      { opportunityId: 'opp-5', name: 'Summit - Sales Automation', accountId: 'account-5', amount: 350000, closeDate: new Date(now + 5 * day).toISOString(), stage: 'Negotiation', probability: 80, type: 'New Business', leadSource: 'LinkedIn', nextStep: 'Finalize contract terms and legal review', description: 'Sales automation platform for retail e-commerce team', ownerId: 'user-2', createdDate: new Date(now - 90 * day).toISOString(), modifiedDate: new Date(now - 1 * day).toISOString() },
      { opportunityId: 'opp-6', name: 'Acme - Support Package', accountId: 'account-1', contactId: 'contact-2', amount: 500000, closeDate: new Date(now - 5 * day).toISOString(), stage: 'Closed Won', probability: 100, type: 'Existing Business', leadSource: 'Referral', nextStep: 'Begin onboarding process', description: 'Premium support and consulting package', ownerId: 'user-1', createdDate: new Date(now - 120 * day).toISOString(), modifiedDate: new Date(now - 5 * day).toISOString() }
    ],
    cases: [
      { caseId: 'case-1', caseNumber: '00001001', subject: 'Dashboard access error', status: 'New', priority: 'High', origin: 'Phone', type: 'Problem', accountId: 'account-1', contactId: 'contact-1', description: 'Customer reports 403 Forbidden error when accessing the analytics dashboard. Affects all admin users.', ownerId: 'user-4', createdDate: new Date(now - 1 * day).toISOString(), modifiedDate: new Date(now - 1 * day).toISOString() },
      { caseId: 'case-2', caseNumber: '00001002', subject: 'Data export not working', status: 'New', priority: 'Medium', origin: 'Email', type: 'Problem', accountId: 'account-2', contactId: 'contact-4', description: 'CSV export from Reports module returns empty file. Started happening after recent update.', ownerId: 'user-4', createdDate: new Date(now - 2 * day).toISOString(), modifiedDate: new Date(now - 2 * day).toISOString() },
      { caseId: 'case-3', caseNumber: '00001003', subject: 'Integration API timeout', status: 'Working', priority: 'High', origin: 'Web', type: 'Problem', accountId: 'account-4', contactId: 'contact-6', description: 'REST API integration timing out after 30 seconds on bulk data sync operations. Need to increase timeout or optimize queries.', ownerId: 'user-3', createdDate: new Date(now - 5 * day).toISOString(), modifiedDate: new Date(now - 1 * day).toISOString() },
      { caseId: 'case-4', caseNumber: '00001004', subject: 'Billing discrepancy', status: 'Escalated', priority: 'Critical', origin: 'Chat', type: 'Problem', accountId: 'account-2', contactId: 'contact-3', description: 'Customer billed twice for March subscription. Finance team has confirmed the duplicate charge. Urgent resolution needed.', ownerId: 'user-1', createdDate: new Date(now - 3 * day).toISOString(), modifiedDate: new Date(now).toISOString() },
      { caseId: 'case-5', caseNumber: '00001005', subject: 'Feature request: bulk import', status: 'Closed', priority: 'Low', origin: 'Email', type: 'Feature Request', accountId: 'account-5', contactId: '', description: 'Customer requests ability to bulk import contacts from CSV with duplicate detection. Added to product backlog.', ownerId: 'user-5', createdDate: new Date(now - 15 * day).toISOString(), modifiedDate: new Date(now - 10 * day).toISOString(), closedDate: new Date(now - 10 * day).toISOString() }
    ],
    activities: [
      // 4 Tasks
      { activityId: 'activity-1', type: 'task' as const, subject: 'Follow up with Sarah Johnson', status: 'Not Started', priority: 'High', dueDate: new Date(now - 2 * day).toISOString(), relatedToType: 'Lead', relatedToId: 'lead-1', assignedToId: 'user-1', description: 'Call to discuss enterprise solution requirements. She mentioned budget approval by end of month.', createdDate: new Date(now - 7 * day).toISOString() },
      { activityId: 'activity-2', type: 'task' as const, subject: 'Send pricing proposal to Pacific Trading', status: 'In Progress', priority: 'High', dueDate: new Date(now).toISOString(), relatedToType: 'Opportunity', relatedToId: 'opp-4', assignedToId: 'user-1', description: 'Prepare and send renewal pricing proposal with new volume discount tiers.', createdDate: new Date(now - 3 * day).toISOString() },
      { activityId: 'activity-3', type: 'task' as const, subject: 'Research ManuCorp competitors', status: 'Not Started', priority: 'Normal', dueDate: new Date(now + 7 * day).toISOString(), relatedToType: 'Lead', relatedToId: 'lead-7', assignedToId: 'user-3', description: 'Research competitive landscape for ManuCorp deal. Check what CRM they currently use.', createdDate: new Date(now - 1 * day).toISOString() },
      { activityId: 'activity-4', type: 'task' as const, subject: 'Update Acme account contacts', status: 'Completed', priority: 'Low', dueDate: new Date(now - 1 * day).toISOString(), relatedToType: 'Account', relatedToId: 'account-1', assignedToId: 'user-1', description: 'Verify and update all Acme Corporation contact records after their org restructure.', createdDate: new Date(now - 5 * day).toISOString() },
      // 4 Events
      { activityId: 'activity-5', type: 'event' as const, subject: 'QBR with Global Enterprises', status: 'Completed', priority: 'High', startDateTime: new Date(now - 3 * day + 10 * hour).toISOString(), endDateTime: new Date(now - 3 * day + 11 * hour).toISOString(), relatedToType: 'Account', relatedToId: 'account-2', assignedToId: 'user-2', description: 'Quarterly business review covering service usage, upcoming renewals, and expansion opportunities.', createdDate: new Date(now - 10 * day).toISOString() },
      { activityId: 'activity-6', type: 'event' as const, subject: 'Demo for Innovate Solutions', status: 'Scheduled', priority: 'High', startDateTime: new Date(now + 2 * hour).toISOString(), endDateTime: new Date(now + 3 * hour).toISOString(), relatedToType: 'Opportunity', relatedToId: 'opp-3', assignedToId: 'user-3', description: 'Product demonstration focused on healthcare workflow automation features.', createdDate: new Date(now - 5 * day).toISOString() },
      { activityId: 'activity-7', type: 'event' as const, subject: 'Contract review with Summit Digital', status: 'Scheduled', priority: 'High', startDateTime: new Date(now + 3 * day + 14 * hour).toISOString(), endDateTime: new Date(now + 3 * day + 15 * hour).toISOString(), relatedToType: 'Case', relatedToId: 'case-4', assignedToId: 'user-1', description: 'Review billing discrepancy case with finance team and customer representatives.', createdDate: new Date(now - 2 * day).toISOString() },
      { activityId: 'activity-8', type: 'event' as const, subject: 'Team pipeline review', status: 'Scheduled', priority: 'Normal', startDateTime: new Date(now + 5 * day + 9 * hour).toISOString(), endDateTime: new Date(now + 5 * day + 10 * hour).toISOString(), relatedToType: 'Case', relatedToId: 'case-3', assignedToId: 'user-1', description: 'Weekly team pipeline review meeting. Cover all open opportunities and case escalations.', createdDate: new Date(now - 1 * day).toISOString() }
    ],
    chatterPosts: [
      {
        postId: 'post-1', userId: 'user-1',
        content: 'Thrilled to announce we just closed the Acme Support Package deal - $500K! Huge thanks to @Emma Wilson and @Bob Chen for their partnership on this one. This is our biggest deal of the quarter!',
        createdDate: new Date(now - 5 * day).toISOString(), likeCount: 4, commentCount: 3,
        likes: ['user-2', 'user-3', 'user-4', 'user-5'],
        comments: [
          { commentId: 'comment-1', userId: 'user-2', content: 'Amazing work! The team really came together on this one.', createdDate: new Date(now - 5 * day + 1 * hour).toISOString(), likeCount: 2, likes: ['user-1', 'user-3'] },
          { commentId: 'comment-2', userId: 'user-3', content: 'Congrats! Setting the bar high for Q2.', createdDate: new Date(now - 5 * day + 2 * hour).toISOString(), likeCount: 1, likes: ['user-1'] },
          { commentId: 'comment-3', userId: 'user-5', content: 'This is inspiring - great to see what\'s possible!', createdDate: new Date(now - 5 * day + 3 * hour).toISOString(), likeCount: 0, likes: [] }
        ]
      },
      {
        postId: 'post-2', userId: 'user-2',
        content: 'Quick update: We\'ve added 3 new healthcare leads this month. The trade show strategy is paying off. Let me know if anyone needs help with healthcare-specific pitch decks.',
        createdDate: new Date(now - 3 * day).toISOString(), likeCount: 3, commentCount: 1,
        likes: ['user-1', 'user-3', 'user-4'],
        comments: [
          { commentId: 'comment-4', userId: 'user-4', content: 'I\'d love to see those pitch decks! Can you share them in the Files section?', createdDate: new Date(now - 3 * day + 2 * hour).toISOString(), likeCount: 1, likes: ['user-2'] }
        ]
      },
      {
        postId: 'post-3', userId: 'user-4',
        content: 'Does anyone have experience with the new API integration tier? Pacific Trading is asking about bulk data sync limits and I want to give them accurate numbers.',
        createdDate: new Date(now - 2 * day).toISOString(), likeCount: 1, commentCount: 2,
        likes: ['user-3'],
        comments: [
          { commentId: 'comment-5', userId: 'user-3', content: 'I\'ve been working on the Pacific case. The limit is 10K records per batch. I can share the docs.', createdDate: new Date(now - 2 * day + 1 * hour).toISOString(), likeCount: 2, likes: ['user-4', 'user-1'] },
          { commentId: 'comment-6', userId: 'user-1', content: 'Good question. Let\'s discuss in our next team sync.', createdDate: new Date(now - 2 * day + 3 * hour).toISOString(), likeCount: 0, likes: [] }
        ]
      },
      {
        postId: 'post-4', userId: 'user-5',
        content: 'Welcome to the team! I just joined as Junior Sales Rep and I\'m excited to learn from all of you. Looking forward to contributing to our pipeline goals.',
        createdDate: new Date(now - 1 * day).toISOString(), likeCount: 5, commentCount: 0,
        likes: ['user-1', 'user-2', 'user-3', 'user-4'],
        comments: []
      },
      {
        postId: 'post-5', userId: 'user-1',
        content: 'Q1 Review: Pipeline is at $1.3M with 6 active opportunities. Conversion rate improved to 35%. Top performers: @Emma Wilson (3 closed deals) and @Michael Chen (highest pipeline value). Let\'s keep the momentum going!',
        createdDate: new Date(now - 6 * hour).toISOString(), likeCount: 3, commentCount: 0,
        likes: ['user-2', 'user-3', 'user-5'],
        comments: []
      }
    ],
    files: [
      { fileId: 'file-1', name: 'Q4_Forecast.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 245000, url: '/files/_default/Q4_Forecast.xlsx', ownerId: 'user-1', uploadDate: new Date(now - 5 * day).toISOString() },
      { fileId: 'file-2', name: 'Sales_Playbook.pdf', type: 'application/pdf', size: 1200000, url: '/files/_default/Sales_Playbook.pdf', ownerId: 'user-1', uploadDate: new Date(now - 15 * day).toISOString() },
      { fileId: 'file-3', name: 'Acme_Proposal.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 890000, url: '/files/_default/Acme_Proposal.docx', ownerId: 'user-2', uploadDate: new Date(now - 10 * day).toISOString() },
      { fileId: 'file-4', name: 'Pipeline_Review.pptx', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 3500000, url: '/files/_default/Pipeline_Review.pptx', ownerId: 'user-1', uploadDate: new Date(now - 3 * day).toISOString() },
      { fileId: 'file-5', name: 'Team_Photo.png', type: 'image/png', size: 2100000, url: '/files/_default/Team_Photo.png', ownerId: 'user-5', uploadDate: new Date(now - 1 * day).toISOString() },
      { fileId: 'file-6', name: 'Product_Catalog.pdf', type: 'application/pdf', size: 980000, url: '/files/_default/Product_Catalog.pdf', ownerId: 'user-3', uploadDate: new Date(now - 8 * day).toISOString() },
      { fileId: 'file-7', name: 'Case_Study_Acme.pdf', type: 'application/pdf', size: 750000, url: '/files/_default/Case_Study_Acme.pdf', ownerId: 'user-2', uploadDate: new Date(now - 12 * day).toISOString() }
    ],
    following: ['user-2', 'user-3'],
    recentlyViewed: [],
    dismissedNotifications: [],
    dashboards: [],
    emailDrafts: [],
    reportSnapshots: [],
    partners: []
  };
};

// Keep backward-compatible export
export const initialState: AppState = createInitialState();

export const calculateStateDiff = (initial: AppState, current: AppState): any => {
  const diff: any = {};

  for (const key in current) {
    if (Array.isArray((current as any)[key]) && Array.isArray((initial as any)[key])) {
      const added = (current as any)[key].filter((item: any) =>
        !(initial as any)[key].some((initItem: any) =>
          JSON.stringify(initItem) === JSON.stringify(item)
        )
      );
      const removed = (initial as any)[key].filter((item: any) =>
        !(current as any)[key].some((currItem: any) =>
          JSON.stringify(currItem) === JSON.stringify(item)
        )
      );
      const modified = (current as any)[key].filter((item: any) => {
        const initItem = (initial as any)[key].find((i: any) => {
          const itemId = Object.keys(item).find(k => k.endsWith('Id'));
          const initId = Object.keys(i).find(k => k.endsWith('Id'));
          return itemId && initId && item[itemId] === i[initId];
        });
        return initItem && JSON.stringify(item) !== JSON.stringify(initItem);
      });

      if (added.length > 0 || removed.length > 0 || modified.length > 0) {
        diff[key] = {
          added: added.length,
          removed: removed.length,
          modified: modified.length,
          total_initial: (initial as any)[key].length,
          total_current: (current as any)[key].length
        };
      }
    } else if (typeof (current as any)[key] === 'object' && (current as any)[key] !== null) {
      if (JSON.stringify((current as any)[key]) !== JSON.stringify((initial as any)[key])) {
        diff[key] = { initial: (initial as any)[key], current: (current as any)[key] };
      }
    } else if ((current as any)[key] !== (initial as any)[key]) {
      diff[key] = { initial: (initial as any)[key], current: (current as any)[key] };
    }
  }

  return diff;
};
