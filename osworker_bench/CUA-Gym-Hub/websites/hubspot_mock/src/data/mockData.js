import { v4 as uuidv4 } from 'uuid';

export const createInitialData = () => ({
  contacts: [
    { id: 'c1', firstName: 'Alice', lastName: 'Freeman', email: 'alice@techcorp.com', phone: '+1 (555) 010-1234', jobTitle: 'CTO', companyId: 'comp1', lifecycleStage: 'customer', leadStatus: 'open_deal', owner: 'Admin User', city: 'San Francisco', state: 'CA', country: 'United States', createDate: '2024-01-15T10:30:00Z', lastActivityDate: '2024-05-10T14:00:00Z', timeline: [] },
    { id: 'c2', firstName: 'Bob', lastName: 'Martinez', email: 'bob@marketinggurus.com', phone: '+1 (555) 020-5678', jobTitle: 'Marketing Director', companyId: 'comp2', lifecycleStage: 'sql', leadStatus: 'in_progress', owner: 'Admin User', city: 'New York', state: 'NY', country: 'United States', createDate: '2024-01-20T09:00:00Z', lastActivityDate: '2024-05-08T11:00:00Z', timeline: [] },
    { id: 'c3', firstName: 'Charlie', lastName: 'Davis', email: 'charlie@startups.io', phone: '+1 (555) 030-9012', jobTitle: 'Founder & CEO', companyId: 'comp3', lifecycleStage: 'opportunity', leadStatus: 'open_deal', owner: 'Admin User', city: 'Austin', state: 'TX', country: 'United States', createDate: '2024-02-01T10:00:00Z', lastActivityDate: '2024-05-06T14:00:00Z', timeline: [] },
    { id: 'c4', firstName: 'Diana', lastName: 'Prince', email: 'diana@enterprise.global', phone: '+1 (555) 040-3456', jobTitle: 'VP of Sales', companyId: 'comp4', lifecycleStage: 'customer', leadStatus: 'connected', owner: 'Admin User', city: 'Chicago', state: 'IL', country: 'United States', createDate: '2024-01-10T09:00:00Z', lastActivityDate: '2024-05-09T10:00:00Z', timeline: [] },
    { id: 'c5', firstName: 'Emma', lastName: 'Wilson', email: 'emma@techcorp.com', phone: '+1 (555) 050-7890', jobTitle: 'Product Manager', companyId: 'comp1', lifecycleStage: 'customer', leadStatus: 'open_deal', owner: 'Admin User', city: 'San Francisco', state: 'CA', country: 'United States', createDate: '2024-02-05T11:00:00Z', lastActivityDate: '2024-05-10T14:00:00Z', timeline: [] },
    { id: 'c6', firstName: 'Frank', lastName: 'Chen', email: 'frank@greenleaf.co', phone: '+1 (555) 060-1234', jobTitle: 'Head of Operations', companyId: 'comp5', lifecycleStage: 'mql', leadStatus: 'new', owner: 'Admin User', city: 'Portland', state: 'OR', country: 'United States', createDate: '2024-03-01T10:00:00Z', lastActivityDate: '2024-05-07T16:30:00Z', timeline: [] },
    { id: 'c7', firstName: 'Grace', lastName: 'Kim', email: 'grace@designstudio.com', phone: '+1 (555) 070-5678', jobTitle: 'Creative Director', companyId: 'comp6', lifecycleStage: 'lead', leadStatus: 'new', owner: 'Admin User', city: 'Los Angeles', state: 'CA', country: 'United States', createDate: '2024-03-10T09:00:00Z', lastActivityDate: '2024-05-08T10:00:00Z', timeline: [] },
    { id: 'c8', firstName: 'Henry', lastName: 'Taylor', email: 'henry@enterprise.global', phone: '+1 (555) 080-9012', jobTitle: 'CIO', companyId: 'comp4', lifecycleStage: 'opportunity', leadStatus: 'open_deal', owner: 'Admin User', city: 'Chicago', state: 'IL', country: 'United States', createDate: '2024-02-15T10:00:00Z', lastActivityDate: '2024-05-10T12:00:00Z', timeline: [] },
    { id: 'c9', firstName: 'Isabella', lastName: 'Garcia', email: 'isabella@startups.io', phone: '+1 (555) 090-3456', jobTitle: 'Head of Growth', companyId: 'comp3', lifecycleStage: 'sql', leadStatus: 'in_progress', owner: 'Admin User', city: 'Austin', state: 'TX', country: 'United States', createDate: '2024-02-20T11:00:00Z', lastActivityDate: '2024-05-07T08:45:00Z', timeline: [] },
    { id: 'c10', firstName: 'James', lastName: 'Brown', email: 'james@greenleaf.co', phone: '+1 (555) 100-7890', jobTitle: 'Sales Manager', companyId: 'comp5', lifecycleStage: 'lead', leadStatus: 'attempted', owner: 'Admin User', city: 'Portland', state: 'OR', country: 'United States', createDate: '2024-03-05T09:00:00Z', lastActivityDate: '2024-05-05T15:00:00Z', timeline: [] },
    { id: 'c11', firstName: 'Katherine', lastName: 'Lee', email: 'katherine@marketinggurus.com', phone: '+1 (555) 110-1234', jobTitle: 'Content Strategist', companyId: 'comp2', lifecycleStage: 'mql', leadStatus: 'open', owner: 'Admin User', city: 'New York', state: 'NY', country: 'United States', createDate: '2024-02-25T10:00:00Z', lastActivityDate: '2024-05-03T14:00:00Z', timeline: [] },
    { id: 'c12', firstName: 'Lucas', lastName: 'Wright', email: 'lucas@designstudio.com', phone: '+1 (555) 120-5678', jobTitle: 'UX Lead', companyId: 'comp6', lifecycleStage: 'lead', leadStatus: 'attempted', owner: 'Admin User', city: 'Los Angeles', state: 'CA', country: 'United States', createDate: '2024-03-15T10:00:00Z', lastActivityDate: '2024-05-04T11:00:00Z', timeline: [] },
  ],

  companies: [
    { id: 'comp1', name: 'TechCorp', domain: 'techcorp.com', industry: 'Technology', phone: '+1 (555) 100-0001', city: 'San Francisco', state: 'CA', country: 'United States', numberOfEmployees: 250, annualRevenue: 15000000, lifecycleStage: 'customer', owner: 'Admin User', description: 'Enterprise SaaS platform for developer tools', createDate: '2024-01-10T09:00:00Z' },
    { id: 'comp2', name: 'Marketing Gurus', domain: 'marketinggurus.com', industry: 'Marketing', phone: '+1 (555) 200-0002', city: 'New York', state: 'NY', country: 'United States', numberOfEmployees: 50, annualRevenue: 3000000, lifecycleStage: 'customer', owner: 'Admin User', description: 'Full-service digital marketing agency', createDate: '2024-01-12T09:00:00Z' },
    { id: 'comp3', name: 'Startups.io', domain: 'startups.io', industry: 'Venture Capital', phone: '+1 (555) 300-0003', city: 'Austin', state: 'TX', country: 'United States', numberOfEmployees: 30, annualRevenue: 8000000, lifecycleStage: 'opportunity', owner: 'Admin User', description: 'Early-stage startup accelerator and investment platform', createDate: '2024-01-15T09:00:00Z' },
    { id: 'comp4', name: 'Enterprise Global', domain: 'enterprise.global', industry: 'Manufacturing', phone: '+1 (555) 400-0004', city: 'Chicago', state: 'IL', country: 'United States', numberOfEmployees: 5000, annualRevenue: 500000000, lifecycleStage: 'customer', owner: 'Admin User', description: 'Global manufacturing and logistics conglomerate', createDate: '2024-01-08T09:00:00Z' },
    { id: 'comp5', name: 'GreenLeaf Solutions', domain: 'greenleaf.co', industry: 'Environmental Services', phone: '+1 (555) 500-0005', city: 'Portland', state: 'OR', country: 'United States', numberOfEmployees: 75, annualRevenue: 4500000, lifecycleStage: 'mql', owner: 'Admin User', description: 'Sustainable environmental consulting and green solutions', createDate: '2024-02-01T09:00:00Z' },
    { id: 'comp6', name: 'Design Studio Pro', domain: 'designstudio.com', industry: 'Design', phone: '+1 (555) 600-0006', city: 'Los Angeles', state: 'CA', country: 'United States', numberOfEmployees: 20, annualRevenue: 1200000, lifecycleStage: 'lead', owner: 'Admin User', description: 'Creative design agency specializing in brand identity', createDate: '2024-02-10T09:00:00Z' },
  ],

  deals: [
    { id: 'd1', name: 'TechCorp Enterprise License', stage: 'contract_sent', amount: 50000, closeDate: '2024-06-15', dealType: 'new_business', priority: 'high', owner: 'Admin User', companyId: 'comp1', contactIds: ['c1', 'c5'], probability: 90, description: 'Annual enterprise license for 250 seats', createDate: '2024-03-01T10:00:00Z', lastActivityDate: '2024-05-10T14:00:00Z' },
    { id: 'd2', name: 'Marketing Automation Setup', stage: 'presentation_scheduled', amount: 12000, closeDate: '2024-05-20', dealType: 'new_business', priority: 'medium', owner: 'Admin User', companyId: 'comp2', contactIds: ['c2'], probability: 60, description: 'Marketing automation implementation and training', createDate: '2024-03-10T10:00:00Z', lastActivityDate: '2024-05-08T11:00:00Z' },
    { id: 'd3', name: 'Seed Funding Platform', stage: 'qualified_to_buy', amount: 150000, closeDate: '2024-07-01', dealType: 'new_business', priority: 'high', owner: 'Admin User', companyId: 'comp3', contactIds: ['c3', 'c9'], probability: 40, description: 'Platform licensing for deal flow management', createDate: '2024-03-15T10:00:00Z', lastActivityDate: '2024-05-06T14:00:00Z' },
    { id: 'd4', name: 'Global Logistics Upgrade', stage: 'appointment_scheduled', amount: 75000, closeDate: '2024-08-10', dealType: 'existing_business', priority: 'medium', owner: 'Admin User', companyId: 'comp4', contactIds: ['c4', 'c8'], probability: 20, description: 'System upgrade for global logistics tracking', createDate: '2024-03-20T10:00:00Z', lastActivityDate: '2024-05-09T10:00:00Z' },
    { id: 'd5', name: 'GreenLeaf CRM Implementation', stage: 'decision_maker_bought_in', amount: 25000, closeDate: '2024-06-01', dealType: 'new_business', priority: 'medium', owner: 'Admin User', companyId: 'comp5', contactIds: ['c6'], probability: 80, description: 'Full CRM setup and data migration for GreenLeaf', createDate: '2024-04-01T10:00:00Z', lastActivityDate: '2024-05-07T16:30:00Z' },
    { id: 'd6', name: 'Design Studio Rebrand Package', stage: 'appointment_scheduled', amount: 8000, closeDate: '2024-07-15', dealType: 'new_business', priority: 'low', owner: 'Admin User', companyId: 'comp6', contactIds: ['c7'], probability: 20, description: 'Full brand identity redesign package', createDate: '2024-04-05T10:00:00Z', lastActivityDate: '2024-05-08T10:00:00Z' },
    { id: 'd7', name: 'TechCorp Support Expansion', stage: 'closed_won', amount: 35000, closeDate: '2024-04-20', dealType: 'existing_business', priority: 'high', owner: 'Admin User', companyId: 'comp1', contactIds: ['c1'], probability: 100, description: 'Expanding support tier from Pro to Enterprise', createDate: '2024-03-05T10:00:00Z', lastActivityDate: '2024-04-20T15:00:00Z' },
    { id: 'd8', name: 'Marketing Gurus Content Package', stage: 'closed_won', amount: 18000, closeDate: '2024-03-15', dealType: 'new_business', priority: 'medium', owner: 'Admin User', companyId: 'comp2', contactIds: ['c2', 'c11'], probability: 100, description: 'Annual content marketing and SEO package', createDate: '2024-02-15T10:00:00Z', lastActivityDate: '2024-03-15T12:00:00Z' },
    { id: 'd9', name: 'Enterprise Security Audit', stage: 'closed_lost', amount: 90000, closeDate: '2024-04-30', dealType: 'new_business', priority: 'high', owner: 'Admin User', companyId: 'comp4', contactIds: ['c4'], probability: 0, description: 'Comprehensive security audit and penetration testing', closedLostReason: 'Budget constraints — allocated to internal team', createDate: '2024-03-12T10:00:00Z', lastActivityDate: '2024-04-30T11:00:00Z' },
    { id: 'd10', name: 'Startups.io Analytics Dashboard', stage: 'presentation_scheduled', amount: 42000, closeDate: '2024-06-30', dealType: 'new_business', priority: 'medium', owner: 'Admin User', companyId: 'comp3', contactIds: ['c3'], probability: 60, description: 'Custom analytics dashboard for portfolio companies', createDate: '2024-04-10T10:00:00Z', lastActivityDate: '2024-05-06T14:00:00Z' },
  ],

  tickets: [
    { id: 't1', subject: 'Cannot access admin dashboard', description: 'User reports 403 error when trying to access the admin panel after recent update', status: 'in_progress', pipeline: 'support', priority: 'high', category: 'bug_report', source: 'email', owner: 'Admin User', contactId: 'c1', companyId: 'comp1', createDate: '2024-05-01T09:30:00Z', closeDate: null, lastActivityDate: '2024-05-10T11:00:00Z' },
    { id: 't2', subject: 'Billing discrepancy on invoice #4521', description: 'Client noticed double charge on their latest invoice for the Enterprise plan', status: 'closed', pipeline: 'support', priority: 'medium', category: 'billing', source: 'phone', owner: 'Admin User', contactId: 'c2', companyId: 'comp2', createDate: '2024-04-28T14:00:00Z', closeDate: '2024-04-30T16:00:00Z', lastActivityDate: '2024-04-30T16:00:00Z' },
    { id: 't3', subject: 'Feature request: Dark mode', description: 'Customer requesting dark mode support for the entire web portal', status: 'new', pipeline: 'support', priority: 'low', category: 'feature_request', source: 'form', owner: null, contactId: 'c7', companyId: 'comp6', createDate: '2024-05-08T10:00:00Z', closeDate: null, lastActivityDate: '2024-05-08T10:00:00Z' },
    { id: 't4', subject: 'API rate limiting issues', description: 'Getting 429 errors when making bulk API calls — affects data migration workflow', status: 'waiting_on_us', pipeline: 'support', priority: 'high', category: 'technical_support', source: 'email', owner: 'Admin User', contactId: 'c5', companyId: 'comp1', createDate: '2024-05-05T11:00:00Z', closeDate: null, lastActivityDate: '2024-05-09T14:00:00Z' },
    { id: 't5', subject: 'How to set up SSO?', description: 'Need step-by-step help configuring SAML SSO for their 200-person team', status: 'waiting_on_contact', pipeline: 'support', priority: 'medium', category: 'general_inquiry', source: 'chat', owner: 'Admin User', contactId: 'c8', companyId: 'comp4', createDate: '2024-05-07T08:30:00Z', closeDate: null, lastActivityDate: '2024-05-09T09:00:00Z' },
    { id: 't6', subject: 'Data export not working', description: 'CSV export button returns an empty file regardless of filters applied', status: 'in_progress', pipeline: 'support', priority: 'medium', category: 'bug_report', source: 'email', owner: 'Admin User', contactId: 'c3', companyId: 'comp3', createDate: '2024-05-09T15:00:00Z', closeDate: null, lastActivityDate: '2024-05-10T10:00:00Z' },
    { id: 't7', subject: 'Upgrade plan inquiry', description: 'Interested in upgrading from Pro to Enterprise — needs pricing and feature comparison', status: 'new', pipeline: 'support', priority: 'low', category: 'general_inquiry', source: 'form', owner: null, contactId: 'c6', companyId: 'comp5', createDate: '2024-05-10T09:00:00Z', closeDate: null, lastActivityDate: '2024-05-10T09:00:00Z' },
    { id: 't8', subject: 'Integration with Slack not syncing', description: 'Slack notifications stopped working after the v2.4 platform update last week', status: 'closed', pipeline: 'support', priority: 'high', category: 'technical_support', source: 'phone', owner: 'Admin User', contactId: 'c4', companyId: 'comp4', createDate: '2024-04-25T10:00:00Z', closeDate: '2024-04-27T14:00:00Z', lastActivityDate: '2024-04-27T14:00:00Z' },
  ],

  tasks: [
    { id: 'task1', title: 'Follow up with Alice on enterprise proposal', type: 'call', status: 'not_started', priority: 'high', dueDate: '2024-05-15T09:00:00Z', notes: 'Discuss pricing and contract terms', owner: 'Admin User', contactId: 'c1', companyId: 'comp1', dealId: 'd1', createDate: '2024-05-10T08:00:00Z', completedDate: null },
    { id: 'task2', title: 'Send revised quote to Charlie', type: 'email', status: 'in_progress', priority: 'high', dueDate: '2024-05-12T17:00:00Z', notes: 'Include volume discount options for 500+ seats', owner: 'Admin User', contactId: 'c3', companyId: 'comp3', dealId: 'd3', createDate: '2024-05-09T10:00:00Z', completedDate: null },
    { id: 'task3', title: 'Prepare demo presentation for GreenLeaf', type: 'to_do', status: 'not_started', priority: 'medium', dueDate: '2024-05-18T10:00:00Z', notes: 'Focus on environmental tracking and reporting features', owner: 'Admin User', contactId: 'c6', companyId: 'comp5', dealId: 'd5', createDate: '2024-05-08T14:00:00Z', completedDate: null },
    { id: 'task4', title: "Review Bob's marketing automation requirements", type: 'to_do', status: 'completed', priority: 'medium', dueDate: '2024-05-08T12:00:00Z', notes: 'Check compatibility with existing XubSpot tools', owner: 'Admin User', contactId: 'c2', companyId: 'comp2', dealId: 'd2', createDate: '2024-05-06T09:00:00Z', completedDate: '2024-05-08T11:30:00Z' },
    { id: 'task5', title: 'Schedule onboarding call with Diana', type: 'call', status: 'not_started', priority: 'medium', dueDate: '2024-05-20T14:00:00Z', notes: 'Introduce support team and set up initial training', owner: 'Admin User', contactId: 'c4', companyId: 'comp4', dealId: null, createDate: '2024-05-10T10:00:00Z', completedDate: null },
    { id: 'task6', title: 'Update CRM records for Design Studio', type: 'to_do', status: 'not_started', priority: 'low', dueDate: '2024-05-22T16:00:00Z', notes: 'Add new contact info gathered at trade show', owner: 'Admin User', contactId: null, companyId: 'comp6', dealId: null, createDate: '2024-05-10T11:00:00Z', completedDate: null },
    { id: 'task7', title: 'Send thank-you email after meeting', type: 'email', status: 'completed', priority: 'low', dueDate: '2024-05-07T09:00:00Z', notes: null, owner: 'Admin User', contactId: 'c9', companyId: 'comp3', dealId: null, createDate: '2024-05-06T16:00:00Z', completedDate: '2024-05-07T08:45:00Z' },
    { id: 'task8', title: 'Call Henry about security audit proposal', type: 'call', status: 'not_started', priority: 'high', dueDate: '2024-05-14T11:00:00Z', notes: 'Discuss revised scope and timeline options', owner: 'Admin User', contactId: 'c8', companyId: 'comp4', dealId: 'd9', createDate: '2024-05-10T12:00:00Z', completedDate: null },
  ],

  notes: [
    { id: 'note1', body: 'Had a great meeting with Alice and Emma. They are very interested in the enterprise plan and want to move forward by Q3. Key concerns: SSO integration and data migration support.', associatedType: 'contact', associatedId: 'c1', createdBy: 'Admin User', createDate: '2024-05-10T15:00:00Z' },
    { id: 'note2', body: "Bob mentioned they are comparing us with Competitor X. Need to highlight our marketing automation advantages in the next call. Price sensitivity is moderate.", associatedType: 'deal', associatedId: 'd2', createdBy: 'Admin User', createDate: '2024-05-08T11:00:00Z' },
    { id: 'note3', body: "Charlie's team is growing fast. They need a platform that can scale from 30 to 200 users within a year. Demo impressed the technical team.", associatedType: 'company', associatedId: 'comp3', createdBy: 'Admin User', createDate: '2024-05-06T14:00:00Z' },
    { id: 'note4', body: 'Resolved the billing issue. Double charge was due to a proration error. Refund of $420 processed and confirmation email sent to Bob.', associatedType: 'ticket', associatedId: 't2', createdBy: 'Admin User', createDate: '2024-04-30T16:00:00Z' },
    { id: 'note5', body: 'Enterprise Global expressed strong interest in a 3-year contract. Henry mentioned potential for expanding to all 5,000 employees. Need to prepare custom pricing tier.', associatedType: 'deal', associatedId: 'd4', createdBy: 'Admin User', createDate: '2024-05-09T10:00:00Z' },
    { id: 'note6', body: 'GreenLeaf team loved the sustainability tracking demo. Decision maker Frank Chen is fully on board. Waiting for budget approval from the board next Thursday.', associatedType: 'deal', associatedId: 'd5', createdBy: 'Admin User', createDate: '2024-05-07T16:30:00Z' },
  ],

  templates: [
    { id: 'tmp1', name: 'Introductory Email', subject: 'Introduction from {{company_name}}', body: 'Hi {{first_name}},\n\nI wanted to reach out and introduce myself. I\'m {{sender_name}} from {{company_name}}.\n\nI noticed that your company {{their_company}} might benefit from our solutions. Would you be open to a quick 15-minute call this week?\n\nBest regards,\n{{sender_name}}', folder: 'Sales', createdBy: 'Admin User', createDate: '2024-02-01T10:00:00Z', timesUsed: 47 },
    { id: 'tmp2', name: 'Follow-Up After Meeting', subject: 'Great meeting, {{first_name}}!', body: 'Hi {{first_name}},\n\nThank you for taking the time to meet with me today. I really enjoyed learning about {{their_company}} and your goals for this quarter.\n\nAs discussed, I\'m attaching the proposal for your review. Feel free to reach out with any questions.\n\nLooking forward to our next conversation!\n\nBest,\n{{sender_name}}', folder: 'Sales', createdBy: 'Admin User', createDate: '2024-02-15T10:00:00Z', timesUsed: 32 },
    { id: 'tmp3', name: 'Deal Closing Nudge', subject: 'Quick update on our proposal', body: 'Hi {{first_name}},\n\nJust wanted to check in on the proposal we sent over last week. We\'d love to get things moving and make sure you have everything you need to make a decision.\n\nIs there anything else I can help clarify?\n\nBest,\n{{sender_name}}', folder: 'Sales', createdBy: 'Admin User', createDate: '2024-03-01T10:00:00Z', timesUsed: 18 },
    { id: 'tmp4', name: 'Welcome New Customer', subject: 'Welcome to {{company_name}}!', body: 'Hi {{first_name}},\n\nWelcome aboard! We\'re thrilled to have {{their_company}} as a customer.\n\nYour dedicated account manager will be in touch shortly to schedule your onboarding session. In the meantime, here are some resources to get you started...\n\nBest,\n{{sender_name}}', folder: 'Onboarding', createdBy: 'Admin User', createDate: '2024-03-10T10:00:00Z', timesUsed: 12 },
  ],

  emails: [],

  meetings: [
    { id: 'm1', title: 'Demo with Alice & Emma', date: '2024-05-10T14:00:00Z', duration: 45, contactId: 'c1', companyId: 'comp1', status: 'completed', notes: 'Went great — showed enterprise features, strong interest expressed', location: 'Zoom', owner: 'Admin User', createDate: '2024-05-08T09:00:00Z' },
    { id: 'm2', title: 'Quarterly Review - Marketing Gurus', date: '2024-05-15T10:00:00Z', duration: 60, contactId: 'c2', companyId: 'comp2', status: 'scheduled', notes: 'Review Q1 results and plan Q2 marketing campaigns', location: 'Google Meet', owner: 'Admin User', createDate: '2024-05-05T11:00:00Z' },
    { id: 'm3', title: 'Pricing Discussion - Startups.io', date: '2024-05-18T15:00:00Z', duration: 30, contactId: 'c3', companyId: 'comp3', status: 'scheduled', notes: 'Discuss volume pricing for portfolio companies', location: 'Zoom', owner: 'Admin User', createDate: '2024-05-10T09:00:00Z' },
    { id: 'm4', title: 'Onboarding Kickoff - Enterprise Global', date: '2024-05-20T09:00:00Z', duration: 90, contactId: 'c4', companyId: 'comp4', status: 'scheduled', notes: 'Full team onboarding session with IT department heads', location: 'In-person', owner: 'Admin User', createDate: '2024-05-10T10:00:00Z' },
  ],

  forms: [
    { id: 'f1', name: 'Contact Us', status: 'active', submissions: 156, fields: ['email', 'first_name', 'last_name', 'company', 'message'], createDate: '2024-01-20T10:00:00Z', lastSubmission: '2024-05-09T16:30:00Z' },
    { id: 'f2', name: 'Newsletter Signup', status: 'active', submissions: 1250, fields: ['email', 'first_name'], createDate: '2024-01-15T10:00:00Z', lastSubmission: '2024-05-10T08:15:00Z' },
    { id: 'f3', name: 'Request a Demo', status: 'active', submissions: 89, fields: ['email', 'first_name', 'last_name', 'company', 'phone', 'company_size'], createDate: '2024-02-01T10:00:00Z', lastSubmission: '2024-05-10T11:00:00Z' },
    { id: 'f4', name: 'Customer Feedback Survey', status: 'inactive', submissions: 43, fields: ['email', 'rating', 'feedback', 'recommend'], createDate: '2024-03-15T10:00:00Z', lastSubmission: '2024-04-20T14:00:00Z' },
  ],

  dealStages: {
    appointment_scheduled: { id: 'appointment_scheduled', label: 'Appointment Scheduled', probability: 20, color: '#E5F4FF', order: 1 },
    qualified_to_buy: { id: 'qualified_to_buy', label: 'Qualified to Buy', probability: 40, color: '#FFF0E6', order: 2 },
    presentation_scheduled: { id: 'presentation_scheduled', label: 'Presentation Scheduled', probability: 60, color: '#FFF8E6', order: 3 },
    decision_maker_bought_in: { id: 'decision_maker_bought_in', label: 'Decision Maker Bought-In', probability: 80, color: '#E8F5E9', order: 4 },
    contract_sent: { id: 'contract_sent', label: 'Contract Sent', probability: 90, color: '#E6FFFA', order: 5 },
    closed_won: { id: 'closed_won', label: 'Closed Won', probability: 100, color: '#E6FFEC', order: 6 },
    closed_lost: { id: 'closed_lost', label: 'Closed Lost', probability: 0, color: '#FFE6E6', order: 7 },
  },

  ticketStatuses: {
    new: { id: 'new', label: 'New', color: '#E5F4FF', order: 1 },
    waiting_on_contact: { id: 'waiting_on_contact', label: 'Waiting on Contact', color: '#FFF8E6', order: 2 },
    waiting_on_us: { id: 'waiting_on_us', label: 'Waiting on Us', color: '#FFF0E6', order: 3 },
    in_progress: { id: 'in_progress', label: 'In Progress', color: '#E6FFFA', order: 4 },
    closed: { id: 'closed', label: 'Closed', color: '#E6FFEC', order: 5 },
  },

  appState: {
    sidebarOpen: true,
    currentUser: { name: 'Admin User', email: 'admin@example.com', avatar: null },
  }
});

// Keep backward-compat export used by Deals.jsx (it imports dealStages directly)
export const dealStages = {
  appointment_scheduled: { id: 'appointment_scheduled', label: 'Appointment Scheduled', probability: 20, color: '#E5F4FF', order: 1 },
  qualified_to_buy: { id: 'qualified_to_buy', label: 'Qualified to Buy', probability: 40, color: '#FFF0E6', order: 2 },
  presentation_scheduled: { id: 'presentation_scheduled', label: 'Presentation Scheduled', probability: 60, color: '#FFF8E6', order: 3 },
  decision_maker_bought_in: { id: 'decision_maker_bought_in', label: 'Decision Maker Bought-In', probability: 80, color: '#E8F5E9', order: 4 },
  contract_sent: { id: 'contract_sent', label: 'Contract Sent', probability: 90, color: '#E6FFFA', order: 5 },
  closed_won: { id: 'closed_won', label: 'Closed Won', probability: 100, color: '#E6FFEC', order: 6 },
  closed_lost: { id: 'closed_lost', label: 'Closed Lost', probability: 0, color: '#FFE6E6', order: 7 },
};

// --- Session-aware storage functions ---

const getDefaultData = () => createInitialData();

const BASE_STORAGE_KEY = 'hubspot_mock_db';
const BASE_INITIAL_KEY = 'hubspot_mock_db_initial';
export function storageKey(sid) { return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY; }
export function initialKey(sid) { return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY; }

export const getSessionId = () => {
  const p = new URLSearchParams(window.location.search);
  const s = p.get('sid');
  if (s) { sessionStorage.setItem('mock_sid', s); return s; }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const u = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const r = await fetch(u);
    if (r.ok) {
      const d = await r.json();
      if (d.has_custom_state && d.stored_state) return d.stored_state;
    }
  } catch (e) { /* no custom state */ }
  return null;
};

let _syncTimer = null;

// NOTE: hubspot_mock intentionally does NOT self-seed its built-in default data
// to the server (no client-side `action:'set'`). The server's initial_state is
// owned solely by the task's initial_setup.py injection. Self-seeding here used
// to clobber the injected deals + hidden answer key with the mock defaults on
// first load (the agent then saw the 10 built-in demo deals instead of the
// injected task deals, and the reward lost its initial_state ground truth).
// Every other mock (gmail, salesforce, ...) already behaves this way.

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
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
  const s = localStorage.getItem(initialKey(sid));
  return s ? JSON.parse(s) : null;
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
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
    const d = { ...getDefaultData(), ...customState };
    localStorage.setItem(sk, JSON.stringify(d));
    localStorage.setItem(ik, JSON.stringify(d));
    return d;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  // Cold start with no caller-provided customState: synthesize the default
  // fixture for the in-memory React store ONLY. Do NOT sync it to the server
  // (no syncInitialState call) — otherwise this would race with setup.py
  // and overwrite the task-specific state it just POSTed via /post?sid=...,
  // because action:'set' on the server unconditionally rewrites .json.
  // The async fetchCustomState() in StoreContext will pull the real
  // server state right after and dispatch LOAD_STATE to replace this seed.
  const d = getDefaultData();
  localStorage.setItem(sk, JSON.stringify(d));
  localStorage.setItem(ik, JSON.stringify(d));
  return d;
};

// Legacy export (some older components may reference initialData)
export const initialData = createInitialData();
