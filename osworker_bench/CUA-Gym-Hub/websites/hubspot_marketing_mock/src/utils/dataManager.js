const BASE_KEY = 'hubspot_marketing_mock_state';
const BASE_INITIAL_KEY = 'hubspot_marketing_mock_initial_state';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('hs_sid', sid);
    return sid.replace(/[^a-zA-Z0-9_-]/g, '');
  }
  const stored = sessionStorage.getItem('hs_sid');
  return stored ? stored.replace(/[^a-zA-Z0-9_-]/g, '') : null;
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

export const fetchCustomState = async (sid) => {
  if (!sid) return null;
  try {
    const res = await fetch(`/state?sid=${sid}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.has_custom_state && data.stored_state) {
      return data.stored_state;
    }
    return null;
  } catch {
    return null;
  }
};

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] === null || source[key] === undefined) continue;
    if (Array.isArray(source[key])) {
      result[key] = source[key];
    } else if (typeof source[key] === 'object') {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function createInitialData() {
  return {
    currentUser: {
      id: 'user-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@acmecorp.com',
      avatar: null,
      role: 'Marketing Manager',
      company: 'Acme Corp',
      timezone: 'America/New_York'
    },
    users: [
      { id: 'user-1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@acmecorp.com', role: 'Marketing Manager' },
      { id: 'user-2', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@acmecorp.com', role: 'Sales Rep' },
      { id: 'user-3', firstName: 'Emily', lastName: 'Rivera', email: 'emily.rivera@acmecorp.com', role: 'Content Marketer' },
      { id: 'user-4', firstName: 'David', lastName: 'Park', email: 'david.park@acmecorp.com', role: 'Marketing Ops' }
    ],
    contacts: [
      { id: 'contact-1', firstName: 'Brian', lastName: 'Halligan', email: 'brian.halligan@techflow.com', phone: '+1 (617) 555-0123', company: 'TechFlow Solutions', companyId: 'company-1', jobTitle: 'VP of Marketing', lifecycleStage: 'customer', leadStatus: 'open_deal', contactOwner: 'user-1', createDate: '2024-01-15T10:30:00Z', lastActivityDate: '2025-03-20T14:22:00Z', source: 'organic_search', marketingStatus: 'marketing', city: 'Boston', state: 'MA', country: 'United States', tags: ['VIP', 'Customer'], notes: '' },
      { id: 'contact-2', firstName: 'Jennifer', lastName: 'Walsh', email: 'jennifer.walsh@greenleaf.com', phone: '+1 (415) 555-0234', company: 'Greenleaf Analytics', companyId: 'company-2', jobTitle: 'Director of Operations', lifecycleStage: 'customer', leadStatus: 'connected', contactOwner: 'user-2', createDate: '2024-02-08T09:15:00Z', lastActivityDate: '2025-03-18T11:00:00Z', source: 'email_marketing', marketingStatus: 'marketing', city: 'San Francisco', state: 'CA', country: 'United States', tags: ['Customer', 'Webinar Attendee'], notes: '' },
      { id: 'contact-3', firstName: 'Marcus', lastName: 'Thompson', email: 'marcus.thompson@beacon.io', phone: '+1 (312) 555-0345', company: 'Beacon Digital', companyId: 'company-3', jobTitle: 'CEO', lifecycleStage: 'customer', leadStatus: 'open_deal', contactOwner: 'user-1', createDate: '2024-02-22T14:00:00Z', lastActivityDate: '2025-03-15T16:30:00Z', source: 'referral', marketingStatus: 'marketing', city: 'Chicago', state: 'IL', country: 'United States', tags: ['VIP'], notes: '' },
      { id: 'contact-4', firstName: 'Olivia', lastName: 'Martinez', email: 'olivia.martinez@stellar.com', phone: '+1 (213) 555-0456', company: 'Stellar Dynamics', companyId: 'company-4', jobTitle: 'Marketing Manager', lifecycleStage: 'sales_qualified_lead', leadStatus: 'open_deal', contactOwner: 'user-2', createDate: '2024-03-05T11:00:00Z', lastActivityDate: '2025-03-12T09:45:00Z', source: 'paid_social', marketingStatus: 'marketing', city: 'Los Angeles', state: 'CA', country: 'United States', tags: ['Webinar Attendee'], notes: '' },
      { id: 'contact-5', firstName: 'Daniel', lastName: 'Kim', email: 'daniel.kim@cloudpeak.com', phone: '+1 (206) 555-0567', company: 'CloudPeak Systems', companyId: 'company-5', jobTitle: 'Head of Growth', lifecycleStage: 'sales_qualified_lead', leadStatus: 'in_progress', contactOwner: 'user-1', createDate: '2024-03-18T08:30:00Z', lastActivityDate: '2025-03-10T14:00:00Z', source: 'organic_search', marketingStatus: 'marketing', city: 'Seattle', state: 'WA', country: 'United States', tags: [], notes: '' },
      { id: 'contact-6', firstName: 'Rachel', lastName: 'Green', email: 'rachel.green@novabridge.com', phone: '+1 (212) 555-0678', company: 'NovaBridge Inc', companyId: 'company-6', jobTitle: 'Product Manager', lifecycleStage: 'sales_qualified_lead', leadStatus: 'attempted_to_contact', contactOwner: 'user-3', createDate: '2024-04-01T10:00:00Z', lastActivityDate: '2025-03-08T10:30:00Z', source: 'direct_traffic', marketingStatus: 'marketing', city: 'New York', state: 'NY', country: 'United States', tags: [], notes: '' },
      { id: 'contact-7', firstName: 'Alex', lastName: 'Turner', email: 'alex.turner@urbanedge.co', phone: '+1 (305) 555-0789', company: 'UrbanEdge Media', companyId: 'company-7', jobTitle: 'Content Strategist', lifecycleStage: 'marketing_qualified_lead', leadStatus: 'open', contactOwner: 'user-2', createDate: '2024-04-15T13:00:00Z', lastActivityDate: '2025-03-05T11:15:00Z', source: 'social_media', marketingStatus: 'marketing', city: 'Miami', state: 'FL', country: 'United States', tags: ['Webinar Attendee'], notes: '' },
      { id: 'contact-8', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@pacific.com', phone: '+1 (408) 555-0890', company: 'Pacific Rim Consulting', companyId: 'company-8', jobTitle: 'Business Analyst', lifecycleStage: 'marketing_qualified_lead', leadStatus: 'new', contactOwner: 'user-4', createDate: '2024-05-02T09:00:00Z', lastActivityDate: '2025-03-02T15:00:00Z', source: 'email_marketing', marketingStatus: 'marketing', city: 'San Jose', state: 'CA', country: 'United States', tags: [], notes: '' },
      { id: 'contact-9', firstName: 'James', lastName: 'Wilson', email: 'james.wilson@techflow.com', phone: '+1 (617) 555-0901', company: 'TechFlow Solutions', companyId: 'company-1', jobTitle: 'Software Engineer', lifecycleStage: 'marketing_qualified_lead', leadStatus: 'open', contactOwner: 'user-3', createDate: '2024-05-20T11:00:00Z', lastActivityDate: '2025-02-28T09:00:00Z', source: 'organic_search', marketingStatus: 'marketing', city: 'Cambridge', state: 'MA', country: 'United States', tags: [], notes: '' },
      { id: 'contact-10', firstName: 'Sofia', lastName: 'Rodriguez', email: 'sofia.rodriguez@greenleaf.com', phone: '+1 (415) 555-1012', company: 'Greenleaf Analytics', companyId: 'company-2', jobTitle: 'Data Scientist', lifecycleStage: 'lead', leadStatus: 'new', contactOwner: 'user-2', createDate: '2024-06-05T14:00:00Z', lastActivityDate: '2025-02-25T13:00:00Z', source: 'paid_search', marketingStatus: 'marketing', city: 'Oakland', state: 'CA', country: 'United States', tags: [], notes: '' },
      { id: 'contact-11', firstName: 'Nathan', lastName: 'Brooks', email: 'nathan.brooks@beacon.io', phone: '+1 (312) 555-1123', company: 'Beacon Digital', companyId: 'company-3', jobTitle: 'Sales Manager', lifecycleStage: 'lead', leadStatus: 'in_progress', contactOwner: 'user-1', createDate: '2024-06-18T10:00:00Z', lastActivityDate: '2025-02-20T14:30:00Z', source: 'direct_traffic', marketingStatus: 'marketing', city: 'Chicago', state: 'IL', country: 'United States', tags: [], notes: '' },
      { id: 'contact-12', firstName: 'Mia', lastName: 'Foster', email: 'mia.foster@stellar.com', phone: '+1 (213) 555-1234', company: 'Stellar Dynamics', companyId: 'company-4', jobTitle: 'UX Designer', lifecycleStage: 'lead', leadStatus: 'new', contactOwner: 'user-3', createDate: '2024-07-01T09:30:00Z', lastActivityDate: '2025-02-15T10:00:00Z', source: 'social_media', marketingStatus: 'marketing', city: 'Los Angeles', state: 'CA', country: 'United States', tags: [], notes: '' },
      { id: 'contact-13', firstName: 'Carlos', lastName: 'Mendez', email: 'carlos.mendez@novabridge.com', phone: '+1 (212) 555-1345', company: 'NovaBridge Inc', companyId: 'company-6', jobTitle: 'CTO', lifecycleStage: 'lead', leadStatus: 'attempted_to_contact', contactOwner: 'user-2', createDate: '2024-07-15T11:00:00Z', lastActivityDate: '2025-02-10T11:00:00Z', source: 'referral', marketingStatus: 'marketing', city: 'Brooklyn', state: 'NY', country: 'United States', tags: [], notes: '' },
      { id: 'contact-14', firstName: 'Zoe', lastName: 'Anderson', email: 'zoe.anderson@cloudpeak.com', phone: '+1 (206) 555-1456', company: 'CloudPeak Systems', companyId: 'company-5', jobTitle: 'Marketing Coordinator', lifecycleStage: 'subscriber', leadStatus: 'new', contactOwner: 'user-4', createDate: '2024-08-01T08:00:00Z', lastActivityDate: '2025-02-05T09:00:00Z', source: 'email_marketing', marketingStatus: 'marketing', city: 'Bellevue', state: 'WA', country: 'United States', tags: ['Newsletter'], notes: '' },
      { id: 'contact-15', firstName: 'Tyler', lastName: 'Hayes', email: 'tyler.hayes@pacific.com', phone: '+1 (408) 555-1567', company: 'Pacific Rim Consulting', companyId: 'company-8', jobTitle: 'Finance Analyst', lifecycleStage: 'subscriber', leadStatus: 'new', contactOwner: 'user-3', createDate: '2024-08-20T10:30:00Z', lastActivityDate: '2025-01-30T14:00:00Z', source: 'organic_search', marketingStatus: 'marketing', city: 'Palo Alto', state: 'CA', country: 'United States', tags: ['Newsletter'], notes: '' },
      { id: 'contact-16', firstName: 'Emma', lastName: 'Clark', email: 'emma.clark@urbanedge.co', phone: '+1 (305) 555-1678', company: 'UrbanEdge Media', companyId: 'company-7', jobTitle: 'Account Executive', lifecycleStage: 'subscriber', leadStatus: 'new', contactOwner: 'user-1', createDate: '2024-09-05T09:00:00Z', lastActivityDate: '2025-01-25T11:00:00Z', source: 'social_media', marketingStatus: 'marketing', city: 'Fort Lauderdale', state: 'FL', country: 'United States', tags: ['Newsletter'], notes: '' },
      { id: 'contact-17', firstName: 'Kevin', lastName: 'Scott', email: 'kevin.scott@techflow.com', phone: '+1 (617) 555-1789', company: 'TechFlow Solutions', companyId: 'company-1', jobTitle: 'Product Owner', lifecycleStage: 'opportunity', leadStatus: 'open_deal', contactOwner: 'user-2', createDate: '2024-09-20T13:00:00Z', lastActivityDate: '2025-01-20T16:00:00Z', source: 'email_marketing', marketingStatus: 'marketing', city: 'Cambridge', state: 'MA', country: 'United States', tags: [], notes: '' },
      { id: 'contact-18', firstName: 'Lauren', lastName: 'Hill', email: 'lauren.hill@beacon.io', phone: '+1 (312) 555-1890', company: 'Beacon Digital', companyId: 'company-3', jobTitle: 'CMO', lifecycleStage: 'opportunity', leadStatus: 'in_progress', contactOwner: 'user-4', createDate: '2024-10-01T10:00:00Z', lastActivityDate: '2025-01-15T09:30:00Z', source: 'direct_traffic', marketingStatus: 'marketing', city: 'Evanston', state: 'IL', country: 'United States', tags: ['VIP'], notes: '' },
    ],
    activities: {
      'contact-1': [
        { id: 'act-1-1', type: 'email', title: 'Email sent: Q2 Product Newsletter', body: 'Sent marketing email, recipient opened 2 times', timestamp: '2025-03-20T14:22:00Z', createdBy: 'user-1' },
        { id: 'act-1-2', type: 'call', title: 'Call: Discovery call', body: 'Connected for 32 minutes. Discussed enterprise upgrade options.', timestamp: '2025-03-15T10:00:00Z', createdBy: 'user-2' },
        { id: 'act-1-3', type: 'note', title: 'Note added', body: 'Very interested in Q2 features. Follow up with pricing deck.', timestamp: '2025-03-10T09:00:00Z', createdBy: 'user-1' },
        { id: 'act-1-4', type: 'form_submission', title: 'Form submitted: Webinar Registration', body: 'Registered for upcoming product webinar', timestamp: '2025-02-28T11:30:00Z', createdBy: 'user-1' },
        { id: 'act-1-5', type: 'email', title: 'Email sent: Welcome Email Series', body: 'Automated email sent via workflow', timestamp: '2025-01-15T09:00:00Z', createdBy: 'user-1' }
      ],
      'contact-2': [
        { id: 'act-2-1', type: 'email', title: 'Email opened: Summer Webinar Invite', body: 'Opened email, clicked 1 link', timestamp: '2025-03-18T11:00:00Z', createdBy: 'user-1' },
        { id: 'act-2-2', type: 'note', title: 'Note added', body: 'Asked about integration capabilities. Send API docs.', timestamp: '2025-03-12T14:00:00Z', createdBy: 'user-2' },
        { id: 'act-2-3', type: 'call', title: 'Call: Product demo follow-up', body: 'Left voicemail. Will try again tomorrow.', timestamp: '2025-03-05T16:00:00Z', createdBy: 'user-2' }
      ],
      'contact-3': [
        { id: 'act-3-1', type: 'email', title: 'Email sent: Q2 Product Newsletter', body: 'Opened email multiple times', timestamp: '2025-03-15T16:30:00Z', createdBy: 'user-1' },
        { id: 'act-3-2', type: 'form_submission', title: 'Form submitted: Free Trial Request', body: 'Requested free trial of Enterprise plan', timestamp: '2025-03-01T09:00:00Z', createdBy: 'user-1' },
        { id: 'act-3-3', type: 'note', title: 'Note added', body: 'CEO level contact — loop in sales leadership', timestamp: '2025-02-15T11:00:00Z', createdBy: 'user-3' }
      ],
      'contact-4': [
        { id: 'act-4-1', type: 'email', title: 'Email opened: Lead Nurturing', body: 'Opened email, no clicks', timestamp: '2025-03-12T09:45:00Z', createdBy: 'user-1' },
        { id: 'act-4-2', type: 'note', title: 'Note added', body: 'Downloaded case study, potential buyer', timestamp: '2025-03-08T10:00:00Z', createdBy: 'user-2' }
      ],
      'contact-5': [
        { id: 'act-5-1', type: 'email', title: 'Email sent: Welcome Email Series', body: 'Enrolled in automated workflow', timestamp: '2025-03-10T14:00:00Z', createdBy: 'user-1' },
        { id: 'act-5-2', type: 'call', title: 'Call: Qualification call', body: 'Connected for 22 minutes. Budget confirmed at $50k+.', timestamp: '2025-03-05T11:00:00Z', createdBy: 'user-2' },
        { id: 'act-5-3', type: 'note', title: 'Note added', body: 'Ready to move to proposal stage', timestamp: '2025-03-01T09:00:00Z', createdBy: 'user-1' }
      ],
      'contact-6': [
        { id: 'act-6-1', type: 'email', title: 'Email sent: Re-engagement Campaign', body: 'Automated re-engagement email sent', timestamp: '2025-03-08T10:30:00Z', createdBy: 'user-1' },
        { id: 'act-6-2', type: 'note', title: 'Note added', body: 'Left 2 voicemails, no response yet', timestamp: '2025-02-20T14:00:00Z', createdBy: 'user-3' }
      ],
      'contact-7': [
        { id: 'act-7-1', type: 'form_submission', title: 'Form submitted: Newsletter Signup', body: 'Subscribed via newsletter form', timestamp: '2025-03-05T11:15:00Z', createdBy: 'user-1' },
        { id: 'act-7-2', type: 'email', title: 'Email opened: Q2 Newsletter', body: 'Opened and clicked CTA button', timestamp: '2025-02-28T09:00:00Z', createdBy: 'user-1' }
      ],
      'contact-8': [
        { id: 'act-8-1', type: 'email', title: 'Email opened: Q2 Newsletter', body: 'Opened email once', timestamp: '2025-03-02T15:00:00Z', createdBy: 'user-1' },
        { id: 'act-8-2', type: 'form_submission', title: 'Form submitted: Contact Us', body: 'Sent inquiry about pricing', timestamp: '2025-02-15T11:00:00Z', createdBy: 'user-1' }
      ]
    },
    companies: [
      { id: 'company-1', name: 'TechFlow Solutions', domain: 'techflow.com', industry: 'Software & Technology', employeeCount: 450, annualRevenue: '$28M', city: 'Boston', state: 'MA', country: 'United States', phone: '+1 (617) 555-9000', owner: 'user-1', createDate: '2024-01-10T08:00:00Z', contactCount: 3 },
      { id: 'company-2', name: 'Greenleaf Analytics', domain: 'greenleaf.com', industry: 'Data & Analytics', employeeCount: 120, annualRevenue: '$8.5M', city: 'San Francisco', state: 'CA', country: 'United States', phone: '+1 (415) 555-9001', owner: 'user-2', createDate: '2024-01-20T08:00:00Z', contactCount: 2 },
      { id: 'company-3', name: 'Beacon Digital', domain: 'beacon.io', industry: 'Digital Marketing', employeeCount: 85, annualRevenue: '$5.2M', city: 'Chicago', state: 'IL', country: 'United States', phone: '+1 (312) 555-9002', owner: 'user-1', createDate: '2024-02-01T08:00:00Z', contactCount: 3 },
      { id: 'company-4', name: 'Stellar Dynamics', domain: 'stellar.com', industry: 'Aerospace & Defense', employeeCount: 2200, annualRevenue: '$185M', city: 'Los Angeles', state: 'CA', country: 'United States', phone: '+1 (213) 555-9003', owner: 'user-2', createDate: '2024-02-10T08:00:00Z', contactCount: 2 },
      { id: 'company-5', name: 'CloudPeak Systems', domain: 'cloudpeak.com', industry: 'Cloud Infrastructure', employeeCount: 340, annualRevenue: '$22M', city: 'Seattle', state: 'WA', country: 'United States', phone: '+1 (206) 555-9004', owner: 'user-1', createDate: '2024-02-20T08:00:00Z', contactCount: 2 },
      { id: 'company-6', name: 'NovaBridge Inc', domain: 'novabridge.com', industry: 'Business Consulting', employeeCount: 60, annualRevenue: '$4.1M', city: 'New York', state: 'NY', country: 'United States', phone: '+1 (212) 555-9005', owner: 'user-3', createDate: '2024-03-01T08:00:00Z', contactCount: 2 },
      { id: 'company-7', name: 'UrbanEdge Media', domain: 'urbanedge.co', industry: 'Media & Publishing', employeeCount: 35, annualRevenue: '$2.8M', city: 'Miami', state: 'FL', country: 'United States', phone: '+1 (305) 555-9006', owner: 'user-2', createDate: '2024-03-15T08:00:00Z', contactCount: 2 },
      { id: 'company-8', name: 'Pacific Rim Consulting', domain: 'pacific.com', industry: 'Management Consulting', employeeCount: 180, annualRevenue: '$14.6M', city: 'San Jose', state: 'CA', country: 'United States', phone: '+1 (408) 555-9007', owner: 'user-4', createDate: '2024-04-01T08:00:00Z', contactCount: 2 }
    ],
    deals: [
      { id: 'deal-1', name: 'TechFlow - Enterprise Plan', stage: 'contract_sent', amount: 85000, closeDate: '2025-05-30T00:00:00Z', contactId: 'contact-1', companyId: 'company-1', owner: 'user-2', pipeline: 'default', createDate: '2025-02-01T10:00:00Z' },
      { id: 'deal-2', name: 'Greenleaf - Growth Package', stage: 'decision_maker_bought_in', amount: 42000, closeDate: '2025-06-15T00:00:00Z', contactId: 'contact-2', companyId: 'company-2', owner: 'user-2', pipeline: 'default', createDate: '2025-02-15T10:00:00Z' },
      { id: 'deal-3', name: 'Beacon Digital - Pro Tier', stage: 'presentation_scheduled', amount: 28000, closeDate: '2025-06-30T00:00:00Z', contactId: 'contact-3', companyId: 'company-3', owner: 'user-1', pipeline: 'default', createDate: '2025-03-01T10:00:00Z' },
      { id: 'deal-4', name: 'Stellar - Integration Services', stage: 'qualified_to_buy', amount: 65000, closeDate: '2025-07-15T00:00:00Z', contactId: 'contact-4', companyId: 'company-4', owner: 'user-2', pipeline: 'default', createDate: '2025-03-10T10:00:00Z' },
      { id: 'deal-5', name: 'CloudPeak - Annual License', stage: 'appointment_scheduled', amount: 36000, closeDate: '2025-07-31T00:00:00Z', contactId: 'contact-5', companyId: 'company-5', owner: 'user-1', pipeline: 'default', createDate: '2025-03-15T10:00:00Z' },
      { id: 'deal-6', name: 'NovaBridge - Starter Package', stage: 'qualified_to_buy', amount: 12000, closeDate: '2025-08-01T00:00:00Z', contactId: 'contact-6', companyId: 'company-6', owner: 'user-3', pipeline: 'default', createDate: '2025-03-20T10:00:00Z' },
      { id: 'deal-7', name: 'Pacific Rim - Consulting Bundle', stage: 'appointment_scheduled', amount: 5000, closeDate: '2025-08-15T00:00:00Z', contactId: 'contact-8', companyId: 'company-8', owner: 'user-4', pipeline: 'default', createDate: '2025-03-25T10:00:00Z' }
    ],
    emails: [
      { id: 'email-1', name: 'Q2 Product Newsletter', subject: 'Exciting updates from Acme Corp — Q2 2025', previewText: 'Check out our latest product features and updates...', status: 'sent', type: 'regular', fromName: 'Acme Corp Marketing', fromEmail: 'marketing@acmecorp.com', replyTo: 'reply@acmecorp.com', listIds: ['list-1', 'list-2'], campaignId: 'campaign-1', scheduledDate: null, sentDate: '2025-03-15T09:00:00Z', createdDate: '2025-03-05T14:30:00Z', updatedDate: '2025-03-14T16:45:00Z', createdBy: 'user-1', stats: { sent: 2450, delivered: 2398, opened: 1127, clicked: 389, bounced: 52, unsubscribed: 12, openRate: 47.0, clickRate: 15.9, clickThroughRate: 34.5, bounceRate: 2.1, unsubscribeRate: 0.5 }, content: { blocks: [ { id: 'b1', type: 'header', data: { companyName: 'Acme Corp' } }, { id: 'b2', type: 'text', data: { html: '<h2>Hello {{contact.firstName}}!</h2><p>We have exciting news to share about our Q2 product updates.</p>' } }, { id: 'b3', type: 'image', data: { src: '', alt: 'Q2 Product Updates', width: '100%' } }, { id: 'b4', type: 'button', data: { text: 'See What\'s New', url: '#', color: '#FF7A59', align: 'center' } }, { id: 'b5', type: 'divider', data: { style: 'solid', color: '#CBD6E2' } }, { id: 'b6', type: 'text', data: { html: '<p>Thanks for being a valued subscriber.</p>' } } ] } },
      { id: 'email-2', name: 'Summer Webinar Invitation', subject: 'You\'re invited: The Future of Marketing Automation', previewText: 'Join our exclusive webinar on June 15th...', status: 'sent', type: 'regular', fromName: 'Sarah Johnson', fromEmail: 'sarah.johnson@acmecorp.com', replyTo: 'marketing@acmecorp.com', listIds: ['list-1', 'list-3'], campaignId: 'campaign-2', scheduledDate: null, sentDate: '2025-02-28T10:00:00Z', createdDate: '2025-02-15T10:00:00Z', updatedDate: '2025-02-27T15:00:00Z', createdBy: 'user-1', abTest: { enabled: true, variantB: { subject: 'Don\'t Miss Our Marketing Automation Webinar', openRate: 44.2, clickRate: 12.1 }, winner: 'A', sampleSize: 20 }, stats: { sent: 1823, delivered: 1795, opened: 899, clicked: 267, bounced: 28, unsubscribed: 8, openRate: 50.1, clickRate: 14.7, clickThroughRate: 29.7, bounceRate: 1.5, unsubscribeRate: 0.4 }, content: { blocks: [ { id: 'b1', type: 'header', data: { companyName: 'Acme Corp' } }, { id: 'b2', type: 'text', data: { html: '<h2>Join Us for an Exclusive Webinar</h2><p>Learn how top companies are revolutionizing their marketing with automation.</p>' } }, { id: 'b3', type: 'button', data: { text: 'Register Now', url: '#', color: '#FF7A59', align: 'center' } }, { id: 'b4', type: 'text', data: { html: '<p><small>Date: June 15th, 2025 | 2:00 PM EST</small></p>' } } ] } },
      { id: 'email-3', name: 'Customer Survey — Annual Feedback', subject: 'Help us improve — Take our 5-minute survey', previewText: 'Your feedback shapes our roadmap...', status: 'sent', type: 'regular', fromName: 'Acme Corp Team', fromEmail: 'feedback@acmecorp.com', replyTo: 'feedback@acmecorp.com', listIds: ['list-5'], campaignId: 'campaign-3', scheduledDate: null, sentDate: '2025-01-20T09:00:00Z', createdDate: '2025-01-10T11:00:00Z', updatedDate: '2025-01-19T17:00:00Z', createdBy: 'user-4', stats: { sent: 89, delivered: 87, opened: 48, clicked: 31, bounced: 2, unsubscribed: 1, openRate: 55.2, clickRate: 34.9, clickThroughRate: 63.3, bounceRate: 2.2, unsubscribeRate: 1.1 }, content: { blocks: [ { id: 'b1', type: 'header', data: { companyName: 'Acme Corp' } }, { id: 'b2', type: 'text', data: { html: '<h2>We Value Your Feedback</h2><p>Help us make Acme Corp even better for you.</p>' } }, { id: 'b3', type: 'button', data: { text: 'Take the Survey', url: '#', color: '#00A4BD', align: 'center' } } ] } },
      { id: 'email-4', name: 'April Product Update', subject: 'April product updates are here — see what\'s new', previewText: 'New integrations, faster performance, and more...', status: 'scheduled', type: 'regular', fromName: 'Acme Corp Marketing', fromEmail: 'marketing@acmecorp.com', replyTo: 'reply@acmecorp.com', listIds: ['list-1', 'list-2'], campaignId: 'campaign-1', scheduledDate: '2025-04-15T09:00:00Z', sentDate: null, createdDate: '2025-04-01T10:00:00Z', updatedDate: '2025-04-10T14:00:00Z', createdBy: 'user-1', stats: null, content: { blocks: [ { id: 'b1', type: 'header', data: { companyName: 'Acme Corp' } }, { id: 'b2', type: 'text', data: { html: '<h2>April Updates</h2><p>This month we\'re shipping several improvements to the platform.</p>' } }, { id: 'b3', type: 'button', data: { text: 'Read the Full Update', url: '#', color: '#FF7A59', align: 'center' } } ] } },
      { id: 'email-5', name: 'Webinar Follow-up: Key Takeaways', subject: 'Your webinar summary + exclusive resources inside', previewText: 'Thanks for attending. Here\'s what you missed...', status: 'scheduled', type: 'automated', fromName: 'Sarah Johnson', fromEmail: 'sarah.johnson@acmecorp.com', replyTo: 'sarah.johnson@acmecorp.com', listIds: ['list-3'], campaignId: 'campaign-2', scheduledDate: '2025-04-20T10:00:00Z', sentDate: null, createdDate: '2025-04-05T09:00:00Z', updatedDate: '2025-04-08T11:00:00Z', createdBy: 'user-3', stats: null, content: { blocks: [ { id: 'b1', type: 'header', data: { companyName: 'Acme Corp' } }, { id: 'b2', type: 'text', data: { html: '<h2>Thanks for Attending!</h2><p>Here are the top 5 takeaways from our webinar.</p>' } }, { id: 'b3', type: 'button', data: { text: 'Download Slides', url: '#', color: '#FF7A59', align: 'center' } } ] } },
      { id: 'email-6', name: 'Lead Nurture: Week 1 Intro', subject: 'Welcome to Acme Corp — let\'s get you started', previewText: 'Your guide to getting the most from your account...', status: 'draft', type: 'automated', fromName: 'Acme Corp', fromEmail: 'onboarding@acmecorp.com', replyTo: 'onboarding@acmecorp.com', listIds: [], campaignId: null, scheduledDate: null, sentDate: null, createdDate: '2025-03-20T10:00:00Z', updatedDate: '2025-04-02T09:00:00Z', createdBy: 'user-1', stats: null, content: { blocks: [ { id: 'b1', type: 'header', data: { companyName: 'Acme Corp' } }, { id: 'b2', type: 'text', data: { html: '<h2>Welcome to Acme Corp!</h2><p>We\'re thrilled to have you on board. Here\'s how to get started.</p>' } } ] } },
      { id: 'email-7', name: 'Re-engagement: We Miss You', subject: 'It\'s been a while — here\'s what you\'ve missed', previewText: 'Catch up on everything new at Acme Corp...', status: 'draft', type: 'regular', fromName: 'Acme Corp Marketing', fromEmail: 'marketing@acmecorp.com', replyTo: 'reply@acmecorp.com', listIds: ['list-6'], campaignId: null, scheduledDate: null, sentDate: null, createdDate: '2025-03-25T11:00:00Z', updatedDate: '2025-04-01T10:00:00Z', createdBy: 'user-3', stats: null, content: { blocks: [ { id: 'b1', type: 'header', data: { companyName: 'Acme Corp' } }, { id: 'b2', type: 'text', data: { html: '<h2>We\'ve Missed You!</h2><p>Here\'s a quick look at what\'s been happening.</p>' } }, { id: 'b3', type: 'button', data: { text: 'Come Back & Explore', url: '#', color: '#FF7A59', align: 'center' } } ] } },
      { id: 'email-8', name: 'Holiday Season Promotion 2024', subject: 'Special holiday offer just for you 🎁', previewText: 'Exclusive discounts for our loyal customers...', status: 'archived', type: 'regular', fromName: 'Acme Corp', fromEmail: 'marketing@acmecorp.com', replyTo: 'marketing@acmecorp.com', listIds: ['list-1'], campaignId: 'campaign-5', scheduledDate: null, sentDate: '2024-12-15T09:00:00Z', createdDate: '2024-12-01T10:00:00Z', updatedDate: '2024-12-14T16:00:00Z', createdBy: 'user-1', stats: { sent: 2450, delivered: 2410, opened: 1083, clicked: 412, bounced: 40, unsubscribed: 15, openRate: 44.9, clickRate: 17.1, clickThroughRate: 38.0, bounceRate: 1.6, unsubscribeRate: 0.6 }, content: { blocks: [ { id: 'b1', type: 'header', data: { companyName: 'Acme Corp' } }, { id: 'b2', type: 'text', data: { html: '<h2>Happy Holidays!</h2><p>As a thank you for your loyalty, enjoy 20% off all plans through December 31st.</p>' } }, { id: 'b3', type: 'button', data: { text: 'Claim Your Discount', url: '#', color: '#FF7A59', align: 'center' } } ] } },
      { id: 'email-9', name: 'Q1 Marketing Report', subject: 'Your Q1 marketing performance summary', previewText: 'See how your campaigns performed last quarter...', status: 'draft', type: 'regular', fromName: 'Acme Corp Analytics', fromEmail: 'analytics@acmecorp.com', replyTo: 'analytics@acmecorp.com', listIds: ['list-5'], campaignId: null, scheduledDate: null, sentDate: null, createdDate: '2025-04-05T09:00:00Z', updatedDate: '2025-04-09T15:00:00Z', createdBy: 'user-4', stats: null, content: { blocks: [ { id: 'b1', type: 'header', data: { companyName: 'Acme Corp' } }, { id: 'b2', type: 'text', data: { html: '<h2>Q1 Performance Summary</h2><p>Here\'s how your marketing performed in Q1 2025.</p>' } } ] } },
      { id: 'email-10', name: 'Product Demo Follow-up', subject: 'Thank you for your demo request', previewText: 'Here\'s everything you need to know before your demo...', status: 'sent', type: 'automated', fromName: 'Sarah Johnson', fromEmail: 'sarah.johnson@acmecorp.com', replyTo: 'sarah.johnson@acmecorp.com', listIds: [], campaignId: 'campaign-1', scheduledDate: null, sentDate: '2025-03-10T09:00:00Z', createdDate: '2025-02-20T10:00:00Z', updatedDate: '2025-03-05T11:00:00Z', createdBy: 'user-1', stats: { sent: 156, delivered: 154, opened: 85, clicked: 42, bounced: 2, unsubscribed: 0, openRate: 55.2, clickRate: 27.3, clickThroughRate: 49.4, bounceRate: 1.3, unsubscribeRate: 0.0 }, content: { blocks: [ { id: 'b1', type: 'header', data: { companyName: 'Acme Corp' } }, { id: 'b2', type: 'text', data: { html: '<h2>Looking forward to your demo!</h2><p>Here\'s how to prepare for your upcoming product demonstration.</p>' } }, { id: 'b3', type: 'button', data: { text: 'View Prep Checklist', url: '#', color: '#FF7A59', align: 'center' } } ] } }
    ],
    campaigns: [
      { id: 'campaign-1', name: 'Q2 Product Launch', status: 'active', goal: 'Drive awareness and signups for new Q2 features', startDate: '2025-04-01T00:00:00Z', endDate: '2025-06-30T23:59:59Z', owner: 'user-1', createdDate: '2025-03-15T10:00:00Z', budget: 25000, assets: { emails: ['email-1', 'email-4', 'email-10'], landingPages: ['lp-1'], forms: ['form-1', 'form-4'], socialPosts: ['social-1', 'social-2'], workflows: ['workflow-1'], ctas: ['cta-1'] }, metrics: { sessions: 12450, newContacts: 342, influencedContacts: 1580, closedDeals: 8, revenue: 185000 } },
      { id: 'campaign-2', name: 'Summer Webinar Series', status: 'active', goal: 'Register 500+ attendees for summer webinar series', startDate: '2025-03-01T00:00:00Z', endDate: '2025-08-31T23:59:59Z', owner: 'user-1', createdDate: '2025-02-10T10:00:00Z', budget: 8000, assets: { emails: ['email-2', 'email-5'], landingPages: ['lp-2'], forms: ['form-3'], socialPosts: ['social-3', 'social-4'], workflows: ['workflow-5'], ctas: ['cta-2'] }, metrics: { sessions: 6780, newContacts: 218, influencedContacts: 892, closedDeals: 3, revenue: 42000 } },
      { id: 'campaign-3', name: 'Annual Customer Survey', status: 'completed', goal: 'Collect feedback from 100% of enterprise customers', startDate: '2025-01-01T00:00:00Z', endDate: '2025-02-28T23:59:59Z', owner: 'user-4', createdDate: '2024-12-15T10:00:00Z', budget: 2000, assets: { emails: ['email-3'], landingPages: [], forms: ['form-5'], socialPosts: [], workflows: [], ctas: [] }, metrics: { sessions: 1240, newContacts: 0, influencedContacts: 89, closedDeals: 0, revenue: 0 } },
      { id: 'campaign-4', name: 'Brand Awareness 2025', status: 'draft', goal: 'Increase brand recognition in new market segments', startDate: '2025-05-01T00:00:00Z', endDate: '2025-12-31T23:59:59Z', owner: 'user-3', createdDate: '2025-03-20T10:00:00Z', budget: 50000, assets: { emails: [], landingPages: ['lp-4'], forms: [], socialPosts: ['social-5', 'social-6'], workflows: [], ctas: ['cta-3', 'cta-4'] }, metrics: { sessions: 0, newContacts: 0, influencedContacts: 0, closedDeals: 0, revenue: 0 } },
      { id: 'campaign-5', name: 'Holiday Promotion 2024', status: 'completed', goal: 'Drive year-end sales with limited-time discounts', startDate: '2024-11-15T00:00:00Z', endDate: '2024-12-31T23:59:59Z', owner: 'user-1', createdDate: '2024-11-01T10:00:00Z', budget: 15000, assets: { emails: ['email-8'], landingPages: ['lp-5'], forms: ['form-2'], socialPosts: ['social-7', 'social-8'], workflows: [], ctas: [] }, metrics: { sessions: 18920, newContacts: 523, influencedContacts: 2140, closedDeals: 22, revenue: 312000 } }
    ],
    forms: [
      { id: 'form-1', name: 'Newsletter Signup', type: 'embedded', status: 'published', views: 8450, submissions: 672, submissionRate: 7.95, createdDate: '2024-02-15T09:00:00Z', updatedDate: '2025-03-01T11:30:00Z', campaignId: 'campaign-1', fields: [ { id: 'f1-1', type: 'email', label: 'Email Address', required: true, placeholder: 'you@example.com' }, { id: 'f1-2', type: 'text', label: 'First Name', required: true, placeholder: 'John' }, { id: 'f1-3', type: 'text', label: 'Last Name', required: false, placeholder: 'Doe' }, { id: 'f1-4', type: 'checkbox', label: 'I agree to receive marketing emails', required: true, options: [] } ], settings: { submitButtonText: 'Subscribe', redirectUrl: '', thankYouMessage: 'Thanks for subscribing!', notifyEmails: ['sarah.johnson@acmecorp.com'], lifecycleStage: 'subscriber' } },
      { id: 'form-2', name: 'Contact Us', type: 'embedded', status: 'published', views: 12340, submissions: 891, submissionRate: 7.22, createdDate: '2024-01-20T09:00:00Z', updatedDate: '2025-02-15T10:00:00Z', campaignId: null, fields: [ { id: 'f2-1', type: 'text', label: 'First Name', required: true, placeholder: 'John' }, { id: 'f2-2', type: 'text', label: 'Last Name', required: true, placeholder: 'Doe' }, { id: 'f2-3', type: 'email', label: 'Email Address', required: true, placeholder: 'you@example.com' }, { id: 'f2-4', type: 'text', label: 'Company', required: false, placeholder: 'Acme Corp' }, { id: 'f2-5', type: 'textarea', label: 'Message', required: true, placeholder: 'How can we help you?' } ], settings: { submitButtonText: 'Send Message', redirectUrl: '', thankYouMessage: 'Thank you! We\'ll be in touch within 24 hours.', notifyEmails: ['sarah.johnson@acmecorp.com', 'michael.chen@acmecorp.com'], lifecycleStage: 'lead' } },
      { id: 'form-3', name: 'Webinar Registration', type: 'standalone', status: 'published', views: 4521, submissions: 342, submissionRate: 7.56, createdDate: '2025-01-10T09:00:00Z', updatedDate: '2025-03-10T14:00:00Z', campaignId: 'campaign-2', fields: [ { id: 'f3-1', type: 'email', label: 'Work Email', required: true, placeholder: 'you@company.com' }, { id: 'f3-2', type: 'text', label: 'First Name', required: true, placeholder: 'John' }, { id: 'f3-3', type: 'text', label: 'Last Name', required: true, placeholder: 'Doe' }, { id: 'f3-4', type: 'text', label: 'Job Title', required: false, placeholder: 'Marketing Manager' }, { id: 'f3-5', type: 'select', label: 'Company Size', required: false, options: ['1-10', '11-50', '51-200', '201-1000', '1000+'] }, { id: 'f3-6', type: 'checkbox', label: 'Send me the recording if I can\'t attend', required: false, options: [] } ], settings: { submitButtonText: 'Register Now', redirectUrl: '/webinar-confirmation', thankYouMessage: 'You\'re registered! Check your email for details.', notifyEmails: ['emily.rivera@acmecorp.com'], lifecycleStage: 'lead' } },
      { id: 'form-4', name: 'Free Trial Request', type: 'popup', status: 'published', views: 22650, submissions: 1247, submissionRate: 5.50, createdDate: '2024-06-01T09:00:00Z', updatedDate: '2025-02-28T16:00:00Z', campaignId: 'campaign-1', fields: [ { id: 'f4-1', type: 'email', label: 'Work Email', required: true, placeholder: 'you@company.com' }, { id: 'f4-2', type: 'text', label: 'First Name', required: true, placeholder: 'John' }, { id: 'f4-3', type: 'text', label: 'Company Name', required: true, placeholder: 'Acme Corp' }, { id: 'f4-4', type: 'select', label: 'Team Size', required: true, options: ['Just me', '2-10', '11-25', '26-50', '51-200', '200+'] } ], settings: { submitButtonText: 'Start Free Trial', redirectUrl: '/trial-welcome', thankYouMessage: 'Welcome aboard! Check your email to get started.', notifyEmails: ['sarah.johnson@acmecorp.com'], lifecycleStage: 'marketing_qualified_lead' } },
      { id: 'form-5', name: 'Feedback Survey', type: 'embedded', status: 'draft', views: 0, submissions: 0, submissionRate: 0, createdDate: '2025-03-25T09:00:00Z', updatedDate: '2025-04-05T10:00:00Z', campaignId: 'campaign-3', fields: [ { id: 'f5-1', type: 'radio', label: 'How satisfied are you overall?', required: true, options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied'] }, { id: 'f5-2', type: 'radio', label: 'How likely are you to recommend us?', required: true, options: ['Definitely would', 'Probably would', 'Probably not', 'Definitely not'] }, { id: 'f5-3', type: 'textarea', label: 'What can we improve?', required: false, placeholder: 'Share your thoughts...' } ], settings: { submitButtonText: 'Submit Feedback', redirectUrl: '', thankYouMessage: 'Thank you for your valuable feedback!', notifyEmails: ['david.park@acmecorp.com'], lifecycleStage: 'customer' } },
      { id: 'form-6', name: 'Gated Content Download', type: 'embedded', status: 'published', views: 6890, submissions: 523, submissionRate: 7.59, createdDate: '2024-09-10T09:00:00Z', updatedDate: '2025-01-15T12:00:00Z', campaignId: null, fields: [ { id: 'f6-1', type: 'email', label: 'Email Address', required: true, placeholder: 'you@example.com' }, { id: 'f6-2', type: 'text', label: 'First Name', required: true, placeholder: 'John' }, { id: 'f6-3', type: 'text', label: 'Company', required: false, placeholder: 'Company name' } ], settings: { submitButtonText: 'Download Now', redirectUrl: '/download-confirmation', thankYouMessage: 'Your download is ready!', notifyEmails: ['sarah.johnson@acmecorp.com'], lifecycleStage: 'lead' } }
    ],
    workflows: [
      { id: 'workflow-1', name: 'Welcome Email Series', type: 'contact', status: 'active', enrolledCount: 1245, enrolledCurrently: 83, createdDate: '2024-03-01T08:00:00Z', updatedDate: '2025-03-10T15:00:00Z', createdBy: 'user-1', trigger: { type: 'filter', description: 'Contact submits Newsletter Signup form', filterGroups: [{ filters: [{ property: 'form_submission', operator: 'eq', value: 'form-1' }] }] }, nodes: [ { id: 'wn-1-1', type: 'email', actionType: 'send_email', config: { emailId: 'email-6', label: 'Send welcome email' }, nextNodeId: 'wn-1-2' }, { id: 'wn-1-2', type: 'delay', actionType: 'delay', config: { duration: 3, unit: 'days', label: 'Wait 3 days' }, nextNodeId: 'wn-1-3' }, { id: 'wn-1-3', type: 'branch', actionType: 'branch', config: { condition: 'Opened welcome email', label: 'If/Then: opened email?' }, yesBranch: 'wn-1-4', noBranch: 'wn-1-5' }, { id: 'wn-1-4', type: 'action', actionType: 'set_property', config: { property: 'lifecycleStage', value: 'lead', label: 'Set lifecycle to Lead' }, nextNodeId: null }, { id: 'wn-1-5', type: 'email', actionType: 'send_email', config: { emailId: 'email-7', label: 'Send re-engagement email' }, nextNodeId: null } ] },
      { id: 'workflow-2', name: 'Lead Nurturing Sequence', type: 'contact', status: 'active', enrolledCount: 892, enrolledCurrently: 156, createdDate: '2024-04-15T08:00:00Z', updatedDate: '2025-02-20T12:00:00Z', createdBy: 'user-1', trigger: { type: 'filter', description: 'Contact becomes a Marketing Qualified Lead', filterGroups: [{ filters: [{ property: 'lifecycleStage', operator: 'eq', value: 'marketing_qualified_lead' }] }] }, nodes: [ { id: 'wn-2-1', type: 'email', actionType: 'send_email', config: { emailId: 'email-6', label: 'Send intro email' }, nextNodeId: 'wn-2-2' }, { id: 'wn-2-2', type: 'delay', actionType: 'delay', config: { duration: 7, unit: 'days', label: 'Wait 7 days' }, nextNodeId: 'wn-2-3' }, { id: 'wn-2-3', type: 'branch', actionType: 'branch', config: { condition: 'Submitted demo request', label: 'If/Then: demo requested?' }, yesBranch: 'wn-2-4', noBranch: 'wn-2-5' }, { id: 'wn-2-4', type: 'action', actionType: 'create_task', config: { title: 'Follow up with demo request', label: 'Create follow-up task' }, nextNodeId: null }, { id: 'wn-2-5', type: 'delay', actionType: 'delay', config: { duration: 14, unit: 'days', label: 'Wait 14 more days' }, nextNodeId: 'wn-2-6' }, { id: 'wn-2-6', type: 'action', actionType: 'add_to_list', config: { listId: 'list-4', label: 'Add to MQLs list' }, nextNodeId: null } ] },
      { id: 'workflow-3', name: 'Deal Stage Notifications', type: 'deal', status: 'active', enrolledCount: 342, enrolledCurrently: 12, createdDate: '2024-05-01T08:00:00Z', updatedDate: '2025-01-15T09:00:00Z', createdBy: 'user-2', trigger: { type: 'event', description: 'Deal stage changes', filterGroups: [{ filters: [{ property: 'dealstage', operator: 'changed', value: 'any' }] }] }, nodes: [ { id: 'wn-3-1', type: 'branch', actionType: 'branch', config: { condition: 'New stage is Closed Won', label: 'If/Then: Closed Won?' }, yesBranch: 'wn-3-2', noBranch: 'wn-3-3' }, { id: 'wn-3-2', type: 'action', actionType: 'internal_notification', config: { message: 'Deal closed! Notify account team', label: 'Notify team: Won!' }, nextNodeId: null }, { id: 'wn-3-3', type: 'action', actionType: 'internal_notification', config: { message: 'Deal stage updated', label: 'Notify team: Stage update' }, nextNodeId: null } ] },
      { id: 'workflow-4', name: 'Re-engagement Campaign', type: 'contact', status: 'inactive', enrolledCount: 523, enrolledCurrently: 0, createdDate: '2024-06-15T08:00:00Z', updatedDate: '2024-12-01T10:00:00Z', createdBy: 'user-3', trigger: { type: 'filter', description: 'No activity in 90 days', filterGroups: [{ filters: [{ property: 'last_activity_date', operator: 'lt', value: '90_days_ago' }] }] }, nodes: [ { id: 'wn-4-1', type: 'email', actionType: 'send_email', config: { emailId: 'email-7', label: 'Send re-engagement email' }, nextNodeId: 'wn-4-2' }, { id: 'wn-4-2', type: 'delay', actionType: 'delay', config: { duration: 14, unit: 'days', label: 'Wait 14 days' }, nextNodeId: 'wn-4-3' }, { id: 'wn-4-3', type: 'branch', actionType: 'branch', config: { condition: 'Contact re-engaged', label: 'If/Then: re-engaged?' }, yesBranch: 'wn-4-4', noBranch: 'wn-4-5' }, { id: 'wn-4-4', type: 'action', actionType: 'remove_from_list', config: { listId: 'list-6', label: 'Remove from Churned list' }, nextNodeId: null }, { id: 'wn-4-5', type: 'action', actionType: 'set_property', config: { property: 'marketingStatus', value: 'non_marketing', label: 'Set marketing status: off' }, nextNodeId: null } ] },
      { id: 'workflow-5', name: 'Webinar Follow-up', type: 'contact', status: 'draft', enrolledCount: 0, enrolledCurrently: 0, createdDate: '2025-03-01T08:00:00Z', updatedDate: '2025-04-05T10:00:00Z', createdBy: 'user-1', trigger: { type: 'event', description: 'Contact submits Webinar Registration form', filterGroups: [{ filters: [{ property: 'form_submission', operator: 'eq', value: 'form-3' }] }] }, nodes: [ { id: 'wn-5-1', type: 'action', actionType: 'add_to_list', config: { listId: 'list-3', label: 'Add to Webinar Registrants list' }, nextNodeId: 'wn-5-2' }, { id: 'wn-5-2', type: 'email', actionType: 'send_email', config: { emailId: 'email-5', label: 'Send confirmation email' }, nextNodeId: 'wn-5-3' }, { id: 'wn-5-3', type: 'delay', actionType: 'delay', config: { duration: 1, unit: 'days', label: 'Wait 1 day after webinar' }, nextNodeId: 'wn-5-4' }, { id: 'wn-5-4', type: 'action', actionType: 'set_property', config: { property: 'lifecycleStage', value: 'marketing_qualified_lead', label: 'Set lifecycle to MQL' }, nextNodeId: null } ] }
    ],
    lists: [
      { id: 'list-1', name: 'All Marketing Contacts', type: 'active', size: 2450, createdDate: '2024-01-05T08:00:00Z', updatedDate: '2025-04-01T00:00:00Z', filters: [{ property: 'marketingStatus', operator: 'eq', value: 'marketing' }], createdBy: 'user-1' },
      { id: 'list-2', name: 'Newsletter Subscribers', type: 'active', size: 1823, createdDate: '2024-02-10T08:00:00Z', updatedDate: '2025-04-01T00:00:00Z', filters: [{ property: 'lifecycleStage', operator: 'eq', value: 'subscriber' }], createdBy: 'user-1' },
      { id: 'list-3', name: 'Webinar Registrants', type: 'static', size: 342, createdDate: '2025-01-15T08:00:00Z', updatedDate: '2025-03-20T00:00:00Z', filters: [], createdBy: 'user-3' },
      { id: 'list-4', name: 'MQLs This Quarter', type: 'active', size: 156, createdDate: '2025-01-01T08:00:00Z', updatedDate: '2025-04-01T00:00:00Z', filters: [{ property: 'lifecycleStage', operator: 'eq', value: 'marketing_qualified_lead' }], createdBy: 'user-4' },
      { id: 'list-5', name: 'Customers', type: 'active', size: 89, createdDate: '2024-01-01T08:00:00Z', updatedDate: '2025-04-01T00:00:00Z', filters: [{ property: 'lifecycleStage', operator: 'eq', value: 'customer' }], createdBy: 'user-1' },
      { id: 'list-6', name: 'Churned Contacts', type: 'static', size: 23, createdDate: '2024-08-01T08:00:00Z', updatedDate: '2025-02-15T00:00:00Z', filters: [], createdBy: 'user-2' },
      { id: 'list-7', name: 'VIP Accounts', type: 'static', size: 45, createdDate: '2024-03-01T08:00:00Z', updatedDate: '2025-03-01T00:00:00Z', filters: [], createdBy: 'user-1' }
    ],
    landingPages: [
      { id: 'lp-1', name: 'Q2 Product Launch', slug: '/q2-product-launch', status: 'published', publishDate: '2025-04-01T00:00:00Z', views: 6797, submissions: 224, conversionRate: 3.30, newContacts: 109, campaignId: 'campaign-1', createdDate: '2025-03-20T10:00:00Z', updatedDate: '2025-03-31T16:00:00Z' },
      { id: 'lp-2', name: 'Summer Webinar Registration', slug: '/webinar-register', status: 'published', publishDate: '2025-03-01T00:00:00Z', views: 4521, submissions: 342, conversionRate: 7.56, newContacts: 218, campaignId: 'campaign-2', createdDate: '2025-02-20T10:00:00Z', updatedDate: '2025-02-28T14:00:00Z' },
      { id: 'lp-3', name: 'Free Trial Landing Page', slug: '/free-trial', status: 'published', publishDate: '2024-06-01T00:00:00Z', views: 22650, submissions: 1247, conversionRate: 5.50, newContacts: 892, campaignId: 'campaign-1', createdDate: '2024-05-15T10:00:00Z', updatedDate: '2025-02-15T10:00:00Z' },
      { id: 'lp-4', name: 'Case Study Download', slug: '/case-study', status: 'draft', publishDate: null, views: 0, submissions: 0, conversionRate: 0, newContacts: 0, campaignId: 'campaign-4', createdDate: '2025-03-25T10:00:00Z', updatedDate: '2025-04-05T09:00:00Z' },
      { id: 'lp-5', name: 'Holiday Promo 2024', slug: '/holiday-promo', status: 'published', publishDate: '2024-11-15T00:00:00Z', views: 18920, submissions: 1845, conversionRate: 9.75, newContacts: 523, campaignId: 'campaign-5', createdDate: '2024-11-01T10:00:00Z', updatedDate: '2024-12-31T00:00:00Z' }
    ],
    ctas: [
      { id: 'cta-1', name: 'Try Free Demo', type: 'button', text: 'Try Free Demo', url: '/demo', color: '#FF7A59', views: 15230, clicks: 892, clickRate: 5.86, status: 'active', createdDate: '2024-04-01T09:00:00Z', campaignId: 'campaign-1' },
      { id: 'cta-2', name: 'Download Ebook', type: 'popup', text: 'Download the Free Ebook', url: '/ebook', color: '#00A4BD', views: 8920, clicks: 534, clickRate: 5.99, status: 'active', createdDate: '2024-06-15T09:00:00Z', campaignId: 'campaign-2' },
      { id: 'cta-3', name: 'Subscribe Newsletter', type: 'slide_in', text: 'Subscribe to Our Newsletter', url: '/subscribe', color: '#00BDA5', views: 19450, clicks: 1247, clickRate: 6.41, status: 'active', createdDate: '2024-03-01T09:00:00Z', campaignId: null },
      { id: 'cta-4', name: 'Request Pricing', type: 'banner', text: 'Get Custom Pricing', url: '/pricing', color: '#516F90', views: 0, clicks: 0, clickRate: 0, status: 'draft', createdDate: '2025-03-20T09:00:00Z', campaignId: 'campaign-4' }
    ],
    dashboards: [
      { id: 'dashboard-1', name: 'Marketing Performance', isDefault: true, reports: ['report-1', 'report-2', 'report-3', 'report-4', 'report-5', 'report-6'] },
      { id: 'dashboard-2', name: 'Email Analytics', isDefault: false, reports: ['report-7', 'report-8', 'report-9', 'report-10', 'report-11', 'report-12'] }
    ],
    reports: [
      { id: 'report-1', name: 'New Contacts', type: 'number', dashboardId: 'dashboard-1', dateRange: 'last_30_days', metric: 'new_contacts', data: { value: 342, trend: 18.5, comparisonPeriod: 'vs last month', unit: '' }, position: { row: 0, col: 0, width: 1, height: 1 } },
      { id: 'report-2', name: 'Email Open Rate', type: 'line_chart', dashboardId: 'dashboard-1', dateRange: 'last_30_days', metric: 'email_open_rate', data: { labels: ['Mar 12', 'Mar 14', 'Mar 16', 'Mar 18', 'Mar 20', 'Mar 22', 'Mar 24', 'Mar 26', 'Mar 28', 'Mar 30', 'Apr 1', 'Apr 3', 'Apr 5', 'Apr 7', 'Apr 9'], values: [38, 42, 45, 43, 48, 47, 50, 46, 44, 49, 51, 48, 52, 47, 50], series: 'Open Rate (%)' }, position: { row: 0, col: 1, width: 2, height: 1 } },
      { id: 'report-3', name: 'Traffic Sources', type: 'bar_chart', dashboardId: 'dashboard-1', dateRange: 'last_30_days', metric: 'sessions_by_source', data: { labels: ['Organic', 'Direct', 'Social', 'Email', 'Referral', 'Paid'], values: [4250, 2890, 1820, 1540, 980, 970] }, position: { row: 1, col: 0, width: 2, height: 1 } },
      { id: 'report-4', name: 'Campaign Performance', type: 'donut_chart', dashboardId: 'dashboard-1', dateRange: 'this_quarter', metric: 'campaign_contacts', data: { labels: ['Q2 Launch', 'Summer Webinar', 'Customer Survey', 'Brand Awareness', 'Holiday Promo'], values: [342, 218, 0, 0, 523], colors: ['#FF7A59', '#00A4BD', '#00BDA5', '#DBAE17', '#516F90'] }, position: { row: 1, col: 2, width: 1, height: 1 } },
      { id: 'report-5', name: 'Conversion Rate', type: 'line_chart', dashboardId: 'dashboard-1', dateRange: 'last_30_days', metric: 'conversion_rate', data: { labels: ['Mar 12', 'Mar 16', 'Mar 20', 'Mar 24', 'Mar 28', 'Apr 1', 'Apr 5', 'Apr 9'], values: [3.2, 3.8, 4.1, 3.9, 4.5, 4.2, 4.8, 5.1], series: 'Conversion Rate (%)' }, position: { row: 2, col: 0, width: 2, height: 1 } },
      { id: 'report-6', name: 'Top Landing Pages', type: 'table', dashboardId: 'dashboard-1', dateRange: 'last_30_days', metric: 'landing_page_performance', data: { headers: ['Page', 'Views', 'Submissions', 'Conv. Rate'], rows: [['Free Trial', '22,650', '1,247', '5.50%'], ['Newsletter Signup', '8,450', '672', '7.95%'], ['Q2 Product Launch', '6,797', '224', '3.30%'], ['Contact Us', '4,521', '891', '7.22%'], ['Webinar Reg.', '4,521', '342', '7.56%']] }, position: { row: 2, col: 2, width: 1, height: 1 } },
      { id: 'report-7', name: 'Emails Sent', type: 'number', dashboardId: 'dashboard-2', dateRange: 'last_30_days', metric: 'emails_sent', data: { value: 4406, trend: 12.3, comparisonPeriod: 'vs last month', unit: '' }, position: { row: 0, col: 0, width: 1, height: 1 } },
      { id: 'report-8', name: 'Avg Open Rate', type: 'number', dashboardId: 'dashboard-2', dateRange: 'last_30_days', metric: 'avg_open_rate', data: { value: 47.8, trend: 3.2, comparisonPeriod: 'vs last month', unit: '%' }, position: { row: 0, col: 1, width: 1, height: 1 } },
      { id: 'report-9', name: 'Click Rate Trend', type: 'line_chart', dashboardId: 'dashboard-2', dateRange: 'last_30_days', metric: 'click_rate', data: { labels: ['Mar 12', 'Mar 16', 'Mar 20', 'Mar 24', 'Mar 28', 'Apr 1', 'Apr 5', 'Apr 9'], values: [14.2, 15.8, 16.1, 15.5, 17.2, 16.8, 17.9, 18.2], series: 'Click Rate (%)' }, position: { row: 0, col: 2, width: 1, height: 1 } },
      { id: 'report-10', name: 'Bounce Rate', type: 'number', dashboardId: 'dashboard-2', dateRange: 'last_30_days', metric: 'bounce_rate', data: { value: 1.8, trend: -0.3, comparisonPeriod: 'vs last month', unit: '%' }, position: { row: 1, col: 0, width: 1, height: 1 } },
      { id: 'report-11', name: 'Top Performing Emails', type: 'table', dashboardId: 'dashboard-2', dateRange: 'last_30_days', metric: 'email_performance', data: { headers: ['Email Name', 'Sent', 'Open Rate', 'Click Rate'], rows: [['Product Demo Follow-up', '156', '55.2%', '27.3%'], ['Customer Survey', '89', '55.2%', '34.9%'], ['Summer Webinar Invite', '1,823', '50.1%', '14.7%'], ['Q2 Newsletter', '2,450', '47.0%', '15.9%'], ['Holiday Promotion', '2,450', '44.9%', '17.1%']] }, position: { row: 1, col: 1, width: 2, height: 1 } },
      { id: 'report-12', name: 'Unsubscribe Rate', type: 'line_chart', dashboardId: 'dashboard-2', dateRange: 'last_30_days', metric: 'unsubscribe_rate', data: { labels: ['Mar 12', 'Mar 16', 'Mar 20', 'Mar 24', 'Mar 28', 'Apr 1', 'Apr 5', 'Apr 9'], values: [0.6, 0.5, 0.4, 0.5, 0.3, 0.4, 0.3, 0.4], series: 'Unsubscribe Rate (%)' }, position: { row: 2, col: 0, width: 3, height: 1 } }
    ],
    socialPosts: [
      { id: 'social-1', platform: 'linkedin', content: 'Excited to announce our Q2 product launch! We\'ve shipped 12 new features this quarter, including advanced automation, deeper CRM integrations, and a redesigned dashboard. Learn more 👇', status: 'published', scheduledDate: null, publishedDate: '2025-04-01T10:00:00Z', campaignId: 'campaign-1', metrics: { likes: 284, shares: 67, comments: 32, clicks: 892, impressions: 14500 } },
      { id: 'social-2', platform: 'twitter', content: '🚀 Our Q2 product launch is LIVE! 12 new features shipping today. Smarter automation, better reporting, and a faster interface. Check it out: #ProductLaunch #MarTech', status: 'published', scheduledDate: null, publishedDate: '2025-04-01T10:05:00Z', campaignId: 'campaign-1', metrics: { likes: 142, shares: 38, comments: 15, clicks: 267, impressions: 8900 } },
      { id: 'social-3', platform: 'linkedin', content: 'Join us for our Summer Webinar Series! 6 sessions covering the future of marketing automation, AI-driven campaigns, and ROI measurement. Register now — seats are limited.', status: 'published', scheduledDate: null, publishedDate: '2025-03-15T11:00:00Z', campaignId: 'campaign-2', metrics: { likes: 156, shares: 42, comments: 18, clicks: 423, impressions: 11200 } },
      { id: 'social-4', platform: 'facebook', content: '📣 Our Summer Webinar Series kicks off next month! Join marketing leaders from 50+ companies for expert-led sessions on automation, analytics, and growth. Reserve your free spot today!', status: 'published', scheduledDate: null, publishedDate: '2025-03-16T14:00:00Z', campaignId: 'campaign-2', metrics: { likes: 89, shares: 23, comments: 11, clicks: 198, impressions: 5400 } },
      { id: 'social-5', platform: 'twitter', content: 'Big things are coming in May 👀 Stay tuned for our Brand Awareness campaign. Hint: it involves some very exciting partnerships. #ComingSoon', status: 'scheduled', scheduledDate: '2025-04-25T10:00:00Z', publishedDate: null, campaignId: 'campaign-4', metrics: { likes: 0, shares: 0, comments: 0, clicks: 0, impressions: 0 } },
      { id: 'social-6', platform: 'linkedin', content: 'New case study: How TechFlow Solutions increased their qualified leads by 340% using Acme Corp\'s marketing automation platform. Read the full story on our blog.', status: 'scheduled', scheduledDate: '2025-04-20T09:00:00Z', publishedDate: null, campaignId: 'campaign-4', metrics: { likes: 0, shares: 0, comments: 0, clicks: 0, impressions: 0 } },
      { id: 'social-7', platform: 'facebook', content: '🎁 Our biggest sale of the year is HERE! Save 30% on all plans through December 31st. Use code HOLIDAY2024 at checkout. Don\'t miss out!', status: 'published', scheduledDate: null, publishedDate: '2024-12-01T10:00:00Z', campaignId: 'campaign-5', metrics: { likes: 312, shares: 98, comments: 45, clicks: 1245, impressions: 28900 } },
      { id: 'social-8', platform: 'instagram', content: 'Wishing everyone a wonderful holiday season from the Acme Corp team! 🎄✨ Grateful for our amazing community. Special holiday offer in bio!', status: 'published', scheduledDate: null, publishedDate: '2024-12-24T12:00:00Z', campaignId: 'campaign-5', metrics: { likes: 567, shares: 0, comments: 78, clicks: 234, impressions: 14200 } },
      { id: 'social-9', platform: 'twitter', content: 'Marketing tip of the week: Personalized email subject lines can increase open rates by up to 50%. How are you personalizing your outreach? Share below! 👇 #MarketingTips', status: 'published', scheduledDate: null, publishedDate: '2025-03-25T14:00:00Z', campaignId: null, metrics: { likes: 98, shares: 34, comments: 22, clicks: 145, impressions: 6700 } },
      { id: 'social-10', platform: 'linkedin', content: 'We\'re hiring! Looking for a Senior Marketing Automation Specialist to join our growing team. Must love data, creativity, and making a real impact. DM me or apply via the link below.', status: 'draft', scheduledDate: null, publishedDate: null, campaignId: null, metrics: { likes: 0, shares: 0, comments: 0, clicks: 0, impressions: 0 } }
    ],
    formSubmissions: [
      { id: 'fs-1', formId: 'form-1', contactId: 'contact-14', data: { email: 'zoe.anderson@cloudpeak.com', firstName: 'Zoe', lastName: 'Anderson' }, submittedAt: '2025-03-15T10:00:00Z' },
      { id: 'fs-2', formId: 'form-2', contactId: 'contact-8', data: { email: 'priya.sharma@pacific.com', firstName: 'Priya', lastName: 'Sharma', message: 'Interested in pricing for team of 50' }, submittedAt: '2025-02-15T11:00:00Z' },
      { id: 'fs-3', formId: 'form-3', contactId: 'contact-7', data: { email: 'alex.turner@urbanedge.co', firstName: 'Alex', lastName: 'Turner', jobTitle: 'Content Strategist' }, submittedAt: '2025-03-05T11:15:00Z' },
      { id: 'fs-4', formId: 'form-4', contactId: 'contact-3', data: { email: 'marcus.thompson@beacon.io', firstName: 'Marcus', companyName: 'Beacon Digital', teamSize: '51-200' }, submittedAt: '2025-03-01T09:00:00Z' },
      { id: 'fs-5', formId: 'form-1', contactId: 'contact-1', data: { email: 'brian.halligan@techflow.com', firstName: 'Brian', lastName: 'Halligan' }, submittedAt: '2025-02-28T11:30:00Z' },
      { id: 'fs-6', formId: 'form-3', contactId: 'contact-2', data: { email: 'jennifer.walsh@greenleaf.com', firstName: 'Jennifer', lastName: 'Walsh', jobTitle: 'Director of Operations' }, submittedAt: '2025-03-18T11:00:00Z' },
      { id: 'fs-7', formId: 'form-6', contactId: 'contact-9', data: { email: 'james.wilson@techflow.com', firstName: 'James', company: 'TechFlow Solutions' }, submittedAt: '2025-02-20T14:00:00Z' },
      { id: 'fs-8', formId: 'form-2', contactId: 'contact-13', data: { email: 'carlos.mendez@novabridge.com', firstName: 'Carlos', lastName: 'Mendez', message: 'Need demo for CTO review' }, submittedAt: '2025-01-28T09:30:00Z' }
    ],
    adCampaigns: [
      { id: 'ad-1', name: 'Q2 Product Launch - Search', platform: 'google', status: 'active', budget: 5000, spent: 3245, impressions: 89400, clicks: 2680, conversions: 134, cpc: 1.21, ctr: 3.0, conversionRate: 5.0, costPerConversion: 24.22, startDate: '2025-04-01T00:00:00Z', endDate: '2025-06-30T00:00:00Z', campaignId: 'campaign-1' },
      { id: 'ad-2', name: 'Brand Awareness - Display', platform: 'google', status: 'active', budget: 3000, spent: 1890, impressions: 245000, clicks: 3675, conversions: 48, cpc: 0.51, ctr: 1.5, conversionRate: 1.3, costPerConversion: 39.38, startDate: '2025-03-15T00:00:00Z', endDate: '2025-06-15T00:00:00Z', campaignId: 'campaign-4' },
      { id: 'ad-3', name: 'Webinar Registration - Lead Gen', platform: 'facebook', status: 'active', budget: 2500, spent: 1675, impressions: 156000, clicks: 4212, conversions: 218, cpc: 0.40, ctr: 2.7, conversionRate: 5.18, costPerConversion: 7.68, startDate: '2025-03-01T00:00:00Z', endDate: '2025-08-31T00:00:00Z', campaignId: 'campaign-2' },
      { id: 'ad-4', name: 'Free Trial - Conversions', platform: 'facebook', status: 'paused', budget: 4000, spent: 2340, impressions: 112000, clicks: 3024, conversions: 96, cpc: 0.77, ctr: 2.7, conversionRate: 3.17, costPerConversion: 24.38, startDate: '2025-02-01T00:00:00Z', endDate: '2025-05-31T00:00:00Z', campaignId: 'campaign-1' },
      { id: 'ad-5', name: 'Case Study Promotion', platform: 'linkedin', status: 'active', budget: 3500, spent: 2100, impressions: 45000, clicks: 1350, conversions: 67, cpc: 1.56, ctr: 3.0, conversionRate: 4.96, costPerConversion: 31.34, startDate: '2025-03-20T00:00:00Z', endDate: '2025-06-20T00:00:00Z', campaignId: 'campaign-4' },
      { id: 'ad-6', name: 'Holiday Promo - Retargeting', platform: 'google', status: 'completed', budget: 6000, spent: 5820, impressions: 320000, clicks: 9600, conversions: 523, cpc: 0.61, ctr: 3.0, conversionRate: 5.45, costPerConversion: 11.13, startDate: '2024-11-15T00:00:00Z', endDate: '2024-12-31T00:00:00Z', campaignId: 'campaign-5' },
      { id: 'ad-7', name: 'Newsletter Signup - Carousel', platform: 'facebook', status: 'completed', budget: 1500, spent: 1500, impressions: 89000, clicks: 2670, conversions: 187, cpc: 0.56, ctr: 3.0, conversionRate: 7.0, costPerConversion: 8.02, startDate: '2024-12-01T00:00:00Z', endDate: '2025-01-31T00:00:00Z', campaignId: 'campaign-5' },
      { id: 'ad-8', name: 'Talent Recruitment', platform: 'linkedin', status: 'draft', budget: 2000, spent: 0, impressions: 0, clicks: 0, conversions: 0, cpc: 0, ctr: 0, conversionRate: 0, costPerConversion: 0, startDate: null, endDate: null, campaignId: null }
    ],
    notifications: [
      { id: 'notif-1', type: 'info', message: 'Contact brian.halligan@techflow.com opened your email "Q2 Product Newsletter"', timestamp: '2025-04-10T09:30:00Z', read: false },
      { id: 'notif-2', type: 'success', message: 'Workflow "Welcome Email Series" successfully sent 83 emails', timestamp: '2025-04-10T08:15:00Z', read: false },
      { id: 'notif-3', type: 'warning', message: 'Email "April Product Update" is scheduled for April 15th. Review before it sends.', timestamp: '2025-04-09T17:00:00Z', read: false },
      { id: 'notif-4', type: 'info', message: 'New form submission: Jennifer Walsh submitted "Webinar Registration"', timestamp: '2025-04-09T14:22:00Z', read: true },
      { id: 'notif-5', type: 'info', message: 'Campaign "Q2 Product Launch" reached 1,000 influenced contacts', timestamp: '2025-04-08T11:00:00Z', read: true }
    ],
    settings: {
      general: { accountName: 'Acme Corp', timezone: 'America/New_York', dateFormat: 'MM/DD/YYYY', currency: 'USD' },
      email: { defaultFromName: 'Acme Corp Marketing', defaultFromEmail: 'marketing@acmecorp.com', footerInfo: '123 Marketing Lane, Boston, MA 02101' },
      marketing: { utmTracking: true, defaultLifecycleStage: 'lead' }
    },
    selectedDashboardId: 'dashboard-1',
    sidebarCollapsed: false,
    activeSection: 'marketing'
  };
}

export function loadState(sid = null) {
  try {
    const key = storageKey(sid);
    const serialized = localStorage.getItem(key);
    if (!serialized) return null;
    return JSON.parse(serialized);
  } catch {
    return null;
  }
}

export function saveState(state, sid = null) {
  try {
    const key = storageKey(sid);
    localStorage.setItem(key, JSON.stringify(state));
    // Also sync to server
    const serverSid = sid || getSessionId();
    if (serverSid) {
      fetch(`/post?sid=${serverSid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state })
      }).catch(() => {});
    }
  } catch {}
}

export function initializeData(sid = null, customState = null) {
  const defaultData = createInitialData();
  const iKey = initialKey(sid);
  const sKey = storageKey(sid);

  if (customState) {
    const merged = deepMerge(defaultData, customState);
    localStorage.setItem(iKey, JSON.stringify(merged));
    localStorage.setItem(sKey, JSON.stringify(merged));
    return merged;
  }

  const existing = localStorage.getItem(sKey);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      return defaultData;
    }
  }

  localStorage.setItem(iKey, JSON.stringify(defaultData));
  localStorage.setItem(sKey, JSON.stringify(defaultData));
  return defaultData;
}
