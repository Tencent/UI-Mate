const BASE_KEY = 'clio_mock_state'
const BASE_INITIAL_KEY = 'clio_mock_state_initial'

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) sessionStorage.setItem('clio_sid', sid)
  return sessionStorage.getItem('clio_sid') || null
}

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY

export const fetchCustomState = async (sid) => {
  try {
    const url = sid ? `/state?sid=${sid}` : '/state'
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export function createInitialData() {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const fmt = (d) => d.toISOString().split('T')[0]
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
  const subDays = (d, n) => addDays(d, -n)

  const users = [
    {
      id: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@meadowlaw.com',
      role: 'Attorney', isAdmin: true, subscriberType: 'Attorney',
      initials: 'SC', avatarColor: '#1A73E8', hourlyRate: 350,
      phone: '555-0101', jobTitle: 'Senior Partner',
      groups: ['Family Law', 'Criminal Law'],
      permissions: { administrator: true, accounts: true, reports: true, billing: true }
    },
    {
      id: 'user-2', name: 'Marcus Rivera', email: 'marcus.rivera@meadowlaw.com',
      role: 'Attorney', isAdmin: false, subscriberType: 'Attorney',
      initials: 'MR', avatarColor: '#34A853', hourlyRate: 280,
      phone: '555-0102', jobTitle: 'Associate Attorney',
      groups: ['Personal Injury', 'Corporate'],
      permissions: { administrator: false, accounts: false, reports: true, billing: true }
    },
    {
      id: 'user-3', name: 'Emily Park', email: 'emily.park@meadowlaw.com',
      role: 'Paralegal', isAdmin: false, subscriberType: 'Non-Attorney',
      initials: 'EP', avatarColor: '#FBBC04', hourlyRate: 150,
      phone: '555-0103', jobTitle: 'Senior Paralegal',
      groups: ['Criminal Law', 'Family Law'],
      permissions: { administrator: false, accounts: false, reports: false, billing: false }
    },
    {
      id: 'user-4', name: 'David Okafor', email: 'david.okafor@meadowlaw.com',
      role: 'Non-Attorney', isAdmin: false, subscriberType: 'Non-Attorney',
      initials: 'DO', avatarColor: '#EA4335', hourlyRate: 100,
      phone: '555-0104', jobTitle: 'Legal Assistant',
      groups: ['Administrative'],
      permissions: { administrator: false, accounts: false, reports: false, billing: false }
    }
  ]

  const contacts = [
    {
      id: 'contact-1', type: 'Person', prefix: 'Ms.', firstName: 'Jane', lastName: 'Grey',
      displayName: 'Jane Grey', companyId: null, companyName: '', jobTitle: '',
      email: 'jane.grey@gmail.com', emailSecondary: '', phone: '778-555-9988',
      phoneType: 'Work', website: '', address: { street: '2370 Ottawa Street', city: 'Port Coquitlam', state: 'BC', zip: 'V3B 7Z1', country: 'Canada' },
      dateOfBirth: '1985-03-22', maritalStatus: 'Single', tags: ['Client'],
      customFields: { 'Employed?': 'Yes', 'Preferred Contact Method': 'Text' },
      billingInfo: { ledesClientId: '', paymentProfile: 'Default (30 days)' },
      createdAt: '2024-03-15T10:00:00Z', updatedAt: '2025-01-20T14:30:00Z'
    },
    {
      id: 'contact-2', type: 'Person', prefix: 'Mr.', firstName: 'Robert', lastName: 'Hartmann',
      displayName: 'Robert Hartmann', companyId: 'contact-9', companyName: 'Hartmann Industries', jobTitle: 'CEO',
      email: 'robert.hartmann@hartmannindustries.com', emailSecondary: 'r.hartmann@gmail.com',
      phone: '604-555-3210', phoneType: 'Work', website: 'www.hartmannindustries.com',
      address: { street: '500 West Georgia St, Suite 2200', city: 'Vancouver', state: 'BC', zip: 'V6B 1Z6', country: 'Canada' },
      dateOfBirth: '1970-11-08', maritalStatus: 'Married', tags: ['Client'],
      customFields: { 'Industry': 'Manufacturing', 'Annual Revenue': '$50M+' },
      billingInfo: { ledesClientId: 'HART-001', paymentProfile: 'Net 60' },
      createdAt: '2023-08-01T09:00:00Z', updatedAt: '2025-02-10T11:00:00Z'
    },
    {
      id: 'contact-3', type: 'Person', prefix: 'Ms.', firstName: 'Patricia', lastName: 'Nguyen',
      displayName: 'Patricia Nguyen', companyId: null, companyName: '', jobTitle: 'Teacher',
      email: 'patricia.nguyen@email.com', emailSecondary: '', phone: '604-555-7744',
      phoneType: 'Mobile', website: '', address: { street: '845 Bute Street', city: 'Vancouver', state: 'BC', zip: 'V6E 1Y8', country: 'Canada' },
      dateOfBirth: '1978-06-15', maritalStatus: 'Divorced', tags: ['Client'],
      customFields: { 'Referred By': 'Robert Hartmann' },
      billingInfo: { ledesClientId: '', paymentProfile: 'Default (30 days)' },
      createdAt: '2024-01-10T08:00:00Z', updatedAt: '2025-01-05T15:00:00Z'
    },
    {
      id: 'contact-4', type: 'Person', prefix: 'Mr.', firstName: 'Daniel', lastName: 'Kim',
      displayName: 'Daniel Kim', companyId: null, companyName: '', jobTitle: 'Software Engineer',
      email: 'daniel.kim@techcorp.com', emailSecondary: '', phone: '778-555-4455',
      phoneType: 'Mobile', website: '', address: { street: '1234 Robson Street', city: 'Vancouver', state: 'BC', zip: 'V6G 1C3', country: 'Canada' },
      dateOfBirth: '1990-09-30', maritalStatus: 'Single', tags: ['Client'],
      customFields: {},
      billingInfo: { ledesClientId: '', paymentProfile: 'Default (30 days)' },
      createdAt: '2024-06-20T10:00:00Z', updatedAt: '2024-06-20T10:00:00Z'
    },
    {
      id: 'contact-5', type: 'Person', prefix: 'Mr.', firstName: 'James', lastName: 'Whitfield',
      displayName: 'James Whitfield', companyId: 'contact-10', companyName: 'Whitfield & Associates', jobTitle: 'Partner',
      email: 'j.whitfield@whitfieldlaw.com', emailSecondary: '', phone: '604-555-8899',
      phoneType: 'Work', website: 'www.whitfieldlaw.com', address: { street: '900 Howe Street', city: 'Vancouver', state: 'BC', zip: 'V6Z 2M4', country: 'Canada' },
      dateOfBirth: null, maritalStatus: '', tags: ['Opposing Counsel'],
      customFields: {},
      billingInfo: { ledesClientId: '', paymentProfile: '' },
      createdAt: '2022-05-01T09:00:00Z', updatedAt: '2024-12-01T14:00:00Z'
    },
    {
      id: 'contact-6', type: 'Person', prefix: 'Ms.', firstName: 'Rebecca', lastName: 'Torres',
      displayName: 'Rebecca Torres', companyId: 'contact-10', companyName: 'Whitfield & Associates', jobTitle: 'Associate',
      email: 'r.torres@whitfieldlaw.com', emailSecondary: '', phone: '604-555-8900',
      phoneType: 'Work', website: '', address: { street: '900 Howe Street', city: 'Vancouver', state: 'BC', zip: 'V6Z 2M4', country: 'Canada' },
      dateOfBirth: null, maritalStatus: '', tags: ['Opposing Counsel'],
      customFields: {},
      billingInfo: { ledesClientId: '', paymentProfile: '' },
      createdAt: '2023-02-15T09:00:00Z', updatedAt: '2024-11-01T11:00:00Z'
    },
    {
      id: 'contact-7', type: 'Person', prefix: 'Hon.', firstName: 'Margaret', lastName: 'Sullivan',
      displayName: 'Hon. Margaret Sullivan', companyId: null, companyName: '', jobTitle: 'Judge',
      email: 'm.sullivan@courts.bc.ca', emailSecondary: '', phone: '604-660-2121',
      phoneType: 'Work', website: '', address: { street: 'Provincial Courts, 222 Main St', city: 'Vancouver', state: 'BC', zip: 'V6A 2S8', country: 'Canada' },
      dateOfBirth: null, maritalStatus: '', tags: ['Judge'],
      customFields: { 'Court': 'BC Supreme Court' },
      billingInfo: { ledesClientId: '', paymentProfile: '' },
      createdAt: '2022-01-01T09:00:00Z', updatedAt: '2023-06-01T09:00:00Z'
    },
    {
      id: 'contact-8', type: 'Person', prefix: 'Dr.', firstName: 'Thomas', lastName: 'Adeyemi',
      displayName: 'Dr. Thomas Adeyemi', companyId: null, companyName: '', jobTitle: 'Medical Expert',
      email: 'tadeyemi@medexperts.ca', emailSecondary: '', phone: '604-555-2200',
      phoneType: 'Work', website: '', address: { street: '1081 Burrard Street', city: 'Vancouver', state: 'BC', zip: 'V6Z 1Y6', country: 'Canada' },
      dateOfBirth: null, maritalStatus: '', tags: ['Expert', 'Witness'],
      customFields: { 'Specialty': 'Orthopedic Surgery' },
      billingInfo: { ledesClientId: '', paymentProfile: '' },
      createdAt: '2024-04-01T09:00:00Z', updatedAt: '2024-04-01T09:00:00Z'
    },
    {
      id: 'contact-9', type: 'Company', prefix: '', firstName: '', lastName: '',
      displayName: 'Hartmann Industries', companyId: null, companyName: 'Hartmann Industries', jobTitle: '',
      email: 'info@hartmannindustries.com', emailSecondary: '', phone: '604-555-3200',
      phoneType: 'Work', website: 'www.hartmannindustries.com', address: { street: '500 West Georgia St', city: 'Vancouver', state: 'BC', zip: 'V6B 1Z6', country: 'Canada' },
      dateOfBirth: null, maritalStatus: '', tags: ['Client'],
      customFields: { 'Industry': 'Manufacturing', 'Employees': '250' },
      billingInfo: { ledesClientId: 'HART-CO-001', paymentProfile: 'Net 60' },
      createdAt: '2023-08-01T09:00:00Z', updatedAt: '2025-02-10T11:00:00Z'
    },
    {
      id: 'contact-10', type: 'Company', prefix: '', firstName: '', lastName: '',
      displayName: 'Whitfield & Associates', companyId: null, companyName: 'Whitfield & Associates', jobTitle: '',
      email: 'contact@whitfieldlaw.com', emailSecondary: '', phone: '604-555-8898',
      phoneType: 'Work', website: 'www.whitfieldlaw.com', address: { street: '900 Howe Street', city: 'Vancouver', state: 'BC', zip: 'V6Z 2M4', country: 'Canada' },
      dateOfBirth: null, maritalStatus: '', tags: ['Opposing Counsel'],
      customFields: {},
      billingInfo: { ledesClientId: '', paymentProfile: '' },
      createdAt: '2022-05-01T09:00:00Z', updatedAt: '2024-12-01T14:00:00Z'
    },
    {
      id: 'contact-11', type: 'Company', prefix: '', firstName: '', lastName: '',
      displayName: 'Pacific Insurance Group', companyId: null, companyName: 'Pacific Insurance Group', jobTitle: '',
      email: 'claims@pacificinsurance.ca', emailSecondary: '', phone: '604-555-5500',
      phoneType: 'Work', website: 'www.pacificinsurance.ca', address: { street: '200 Granville Street', city: 'Vancouver', state: 'BC', zip: 'V6C 1S4', country: 'Canada' },
      dateOfBirth: null, maritalStatus: '', tags: ['Other'],
      customFields: {},
      billingInfo: { ledesClientId: '', paymentProfile: '' },
      createdAt: '2023-03-01T09:00:00Z', updatedAt: '2023-03-01T09:00:00Z'
    },
    {
      id: 'contact-12', type: 'Company', prefix: '', firstName: '', lastName: '',
      displayName: 'BC Ministry of Justice', companyId: null, companyName: 'BC Ministry of Justice', jobTitle: '',
      email: 'info@gov.bc.ca', emailSecondary: '', phone: '250-387-5956',
      phoneType: 'Work', website: 'www.gov.bc.ca/justice', address: { street: '850 Burdett Avenue', city: 'Victoria', state: 'BC', zip: 'V8W 1B4', country: 'Canada' },
      dateOfBirth: null, maritalStatus: '', tags: ['Other'],
      customFields: {},
      billingInfo: { ledesClientId: '', paymentProfile: '' },
      createdAt: '2022-01-01T09:00:00Z', updatedAt: '2022-01-01T09:00:00Z'
    },
    {
      id: 'contact-13', type: 'Person', prefix: 'Ms.', firstName: 'Priya', lastName: 'Varma',
      displayName: 'Priya Varma', companyId: null, companyName: '', jobTitle: 'Restaurant Owner',
      email: 'priya.varma@gmail.com', emailSecondary: '', phone: '604-555-6677',
      phoneType: 'Mobile', website: '', address: { street: '3456 Main Street', city: 'Vancouver', state: 'BC', zip: 'V5V 3M9', country: 'Canada' },
      dateOfBirth: '1982-04-12', maritalStatus: 'Married', tags: ['Client'],
      customFields: { 'Business': 'Varma\'s Kitchen Ltd.' },
      billingInfo: { ledesClientId: '', paymentProfile: 'Default (30 days)' },
      createdAt: subDays(today, 25).toISOString(), updatedAt: subDays(today, 3).toISOString()
    },
    {
      id: 'contact-14', type: 'Person', prefix: 'Mr.', firstName: 'Andrei', lastName: 'Kozlov',
      displayName: 'Andrei Kozlov', companyId: null, companyName: '', jobTitle: 'Construction Worker',
      email: 'a.kozlov@email.com', emailSecondary: '', phone: '778-555-3344',
      phoneType: 'Mobile', website: '', address: { street: '789 East Hastings', city: 'Vancouver', state: 'BC', zip: 'V6A 1R5', country: 'Canada' },
      dateOfBirth: '1988-11-25', maritalStatus: 'Married', tags: ['Client'],
      customFields: { 'Employer': 'Pacific Construction Ltd.' },
      billingInfo: { ledesClientId: '', paymentProfile: 'Default (30 days)' },
      createdAt: subDays(today, 60).toISOString(), updatedAt: subDays(today, 2).toISOString()
    },
    {
      id: 'contact-15', type: 'Person', prefix: 'Ms.', firstName: 'Margaret', lastName: 'Chen',
      displayName: 'Margaret Chen', companyId: null, companyName: '', jobTitle: 'Retired',
      email: 'margaret.chen@email.com', emailSecondary: '', phone: '604-555-1122',
      phoneType: 'Home', website: '', address: { street: '5500 Oak Street', city: 'Vancouver', state: 'BC', zip: 'V6M 2V6', country: 'Canada' },
      dateOfBirth: '1952-07-08', maritalStatus: 'Widowed', tags: ['Client'],
      customFields: { 'Referred By': 'Jane Grey' },
      billingInfo: { ledesClientId: '', paymentProfile: 'Default (30 days)' },
      createdAt: subDays(today, 10).toISOString(), updatedAt: subDays(today, 1).toISOString()
    },
    {
      id: 'contact-16', type: 'Person', prefix: 'Ms.', firstName: 'Sofia', lastName: 'Torres',
      displayName: 'Sofia Torres', companyId: null, companyName: '', jobTitle: 'Graphic Designer',
      email: 'sofia.torres@design.com', emailSecondary: '', phone: '604-555-7788',
      phoneType: 'Mobile', website: 'www.sofiatorresdesign.com', address: { street: '1234 Davie Street', city: 'Vancouver', state: 'BC', zip: 'V6E 1N1', country: 'Canada' },
      dateOfBirth: '1995-02-14', maritalStatus: 'Single', tags: ['Client'],
      customFields: { 'Citizenship': 'Colombian' },
      billingInfo: { ledesClientId: '', paymentProfile: 'Default (30 days)' },
      createdAt: subDays(today, 18).toISOString(), updatedAt: subDays(today, 4).toISOString()
    }
  ]

  const matters = [
    {
      id: 'matter-1', matterNumber: '00071-Grey-07.2021', description: 'Assault & Battery',
      status: 'Open', clientId: 'contact-1', clientName: 'Jane Grey', practiceArea: 'Criminal Law',
      responsibleAttorneyId: 'user-1', responsibleAttorneyName: 'Sarah Chen',
      originatingAttorneyId: 'user-1', billingMethod: 'Hourly', hourlyRate: 350,
      budget: 15000, openDate: '2021-07-12', closeDate: null, pendingDate: null,
      statuteOfLimitations: '2024-07-12', courtName: 'Provincial Court of British Columbia',
      caseNumber: 'CR-2021-4455', stage: 'Discovery', tags: ['Active Litigation'],
      relatedContacts: [{ contactId: 'contact-5', role: 'Opposing Counsel' }, { contactId: 'contact-7', role: 'Judge' }],
      notes: '', createdAt: '2021-07-12T09:00:00Z', updatedAt: '2025-02-15T11:00:00Z'
    },
    {
      id: 'matter-2', matterNumber: '00089-Nguyen-01.2024', description: 'Divorce Proceedings',
      status: 'Open', clientId: 'contact-3', clientName: 'Patricia Nguyen', practiceArea: 'Family Law',
      responsibleAttorneyId: 'user-1', responsibleAttorneyName: 'Sarah Chen',
      originatingAttorneyId: 'user-1', billingMethod: 'Hourly', hourlyRate: 350,
      budget: 20000, openDate: '2024-01-15', closeDate: null, pendingDate: null,
      statuteOfLimitations: null, courtName: 'BC Supreme Court - Family Division',
      caseNumber: 'E243219', stage: 'Negotiation', tags: [],
      relatedContacts: [{ contactId: 'contact-6', role: 'Opposing Counsel' }],
      notes: '', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T09:00:00Z'
    },
    {
      id: 'matter-3', matterNumber: '00095-Hartmann-08.2023', description: 'Corporate Merger Agreement',
      status: 'Open', clientId: 'contact-2', clientName: 'Robert Hartmann', practiceArea: 'Corporate',
      responsibleAttorneyId: 'user-2', responsibleAttorneyName: 'Marcus Rivera',
      originatingAttorneyId: 'user-2', billingMethod: 'Flat Fee', hourlyRate: 0,
      budget: 50000, openDate: '2023-08-10', closeDate: null, pendingDate: null,
      statuteOfLimitations: null, courtName: '', caseNumber: '', stage: 'Drafting',
      tags: ['High Value'],
      relatedContacts: [],
      notes: '', createdAt: '2023-08-10T10:00:00Z', updatedAt: '2025-04-01T12:00:00Z'
    },
    {
      id: 'matter-4', matterNumber: '00102-Kim-06.2024', description: 'Employment Wrongful Termination',
      status: 'Open', clientId: 'contact-4', clientName: 'Daniel Kim', practiceArea: 'Employment',
      responsibleAttorneyId: 'user-2', responsibleAttorneyName: 'Marcus Rivera',
      originatingAttorneyId: 'user-2', billingMethod: 'Contingency', hourlyRate: 0,
      budget: 0, openDate: '2024-06-20', closeDate: null, pendingDate: null,
      statuteOfLimitations: '2025-06-20', courtName: '', caseNumber: '', stage: 'Filing',
      tags: ['Contingency'],
      relatedContacts: [{ contactId: 'contact-11', role: 'Opposing Party' }],
      notes: '', createdAt: '2024-06-20T10:00:00Z', updatedAt: '2025-03-15T10:00:00Z'
    },
    {
      id: 'matter-5', matterNumber: '00058-Grey-03.2020', description: 'Slip and Fall Claim',
      status: 'Pending', clientId: 'contact-1', clientName: 'Jane Grey', practiceArea: 'Personal Injury',
      responsibleAttorneyId: 'user-1', responsibleAttorneyName: 'Sarah Chen',
      originatingAttorneyId: 'user-1', billingMethod: 'Contingency', hourlyRate: 0,
      budget: 0, openDate: '2020-03-01', closeDate: null, pendingDate: '2024-10-01',
      statuteOfLimitations: '2022-03-01', courtName: 'BC Supreme Court',
      caseNumber: 'S-220918', stage: 'Negotiation', tags: [],
      relatedContacts: [{ contactId: 'contact-8', role: 'Expert Witness' }, { contactId: 'contact-11', role: 'Opposing Party' }],
      notes: '', createdAt: '2020-03-01T10:00:00Z', updatedAt: '2025-01-10T14:00:00Z'
    },
    {
      id: 'matter-6', matterNumber: '00078-Hartmann-12.2022', description: 'Commercial Lease Dispute',
      status: 'Pending', clientId: 'contact-9', clientName: 'Hartmann Industries', practiceArea: 'Real Estate',
      responsibleAttorneyId: 'user-2', responsibleAttorneyName: 'Marcus Rivera',
      originatingAttorneyId: 'user-1', billingMethod: 'Hourly', hourlyRate: 280,
      budget: 25000, openDate: '2022-12-05', closeDate: null, pendingDate: '2024-09-01',
      statuteOfLimitations: null, courtName: 'BC Civil Resolution Tribunal',
      caseNumber: 'CRT-2022-8821', stage: 'Negotiation', tags: [],
      relatedContacts: [],
      notes: '', createdAt: '2022-12-05T10:00:00Z', updatedAt: '2025-02-20T09:00:00Z'
    },
    {
      id: 'matter-7', matterNumber: '00083-Nguyen-09.2023', description: 'Child Custody and Support',
      status: 'Pending', clientId: 'contact-3', clientName: 'Patricia Nguyen', practiceArea: 'Family Law',
      responsibleAttorneyId: 'user-1', responsibleAttorneyName: 'Sarah Chen',
      originatingAttorneyId: 'user-1', billingMethod: 'Hourly', hourlyRate: 350,
      budget: 12000, openDate: '2023-09-20', closeDate: null, pendingDate: '2024-11-01',
      statuteOfLimitations: null, courtName: 'BC Supreme Court - Family Division',
      caseNumber: 'F239856', stage: 'Filing', tags: [],
      relatedContacts: [{ contactId: 'contact-6', role: 'Opposing Counsel' }],
      notes: '', createdAt: '2023-09-20T10:00:00Z', updatedAt: '2025-01-15T11:00:00Z'
    },
    {
      id: 'matter-8', matterNumber: '00045-Kim-02.2019', description: 'Immigration Permanent Residence',
      status: 'Closed', clientId: 'contact-4', clientName: 'Daniel Kim', practiceArea: 'Immigration',
      responsibleAttorneyId: 'user-1', responsibleAttorneyName: 'Sarah Chen',
      originatingAttorneyId: 'user-1', billingMethod: 'Flat Fee', hourlyRate: 0,
      budget: 8000, openDate: '2019-02-15', closeDate: '2020-06-30', pendingDate: null,
      statuteOfLimitations: null, courtName: '', caseNumber: '', stage: 'Closed', tags: [],
      relatedContacts: [],
      notes: 'Successfully obtained permanent residency.', createdAt: '2019-02-15T10:00:00Z', updatedAt: '2020-06-30T16:00:00Z'
    },
    {
      id: 'matter-9', matterNumber: '00062-Hartmann-07.2021', description: 'Trademark Registration',
      status: 'Closed', clientId: 'contact-2', clientName: 'Robert Hartmann', practiceArea: 'Corporate',
      responsibleAttorneyId: 'user-2', responsibleAttorneyName: 'Marcus Rivera',
      originatingAttorneyId: 'user-2', billingMethod: 'Flat Fee', hourlyRate: 0,
      budget: 5000, openDate: '2021-07-01', closeDate: '2022-03-15', pendingDate: null,
      statuteOfLimitations: null, courtName: '', caseNumber: '', stage: 'Closed', tags: [],
      relatedContacts: [],
      notes: 'Trademark registered successfully.', createdAt: '2021-07-01T09:00:00Z', updatedAt: '2022-03-15T14:00:00Z'
    },
    {
      id: 'matter-10', matterNumber: '00067-Grey-11.2021', description: 'Restraining Order Application',
      status: 'Closed', clientId: 'contact-1', clientName: 'Jane Grey', practiceArea: 'Criminal Law',
      responsibleAttorneyId: 'user-1', responsibleAttorneyName: 'Sarah Chen',
      originatingAttorneyId: 'user-1', billingMethod: 'Hourly', hourlyRate: 350,
      budget: 5000, openDate: '2021-11-01', closeDate: '2022-01-20', pendingDate: null,
      statuteOfLimitations: null, courtName: 'Provincial Court of British Columbia',
      caseNumber: 'PR-2021-9032', stage: 'Closed', tags: [],
      relatedContacts: [{ contactId: 'contact-7', role: 'Judge' }],
      notes: 'Order granted.', createdAt: '2021-11-01T10:00:00Z', updatedAt: '2022-01-20T11:00:00Z'
    },
    {
      id: 'matter-11', matterNumber: '00108-Grey-02.2025', description: 'Property Tax Assessment Appeal',
      status: 'Open', clientId: 'contact-1', clientName: 'Jane Grey', practiceArea: 'Real Estate',
      responsibleAttorneyId: 'user-2', responsibleAttorneyName: 'Marcus Rivera',
      originatingAttorneyId: 'user-1', billingMethod: 'Hourly', hourlyRate: 280,
      budget: 8000, openDate: fmt(subDays(today, 40)), closeDate: null, pendingDate: null,
      statuteOfLimitations: null, courtName: 'Property Assessment Review Panel',
      caseNumber: 'PARP-2025-1102', stage: 'Filing', tags: [],
      relatedContacts: [],
      notes: '', createdAt: subDays(today, 40).toISOString(), updatedAt: subDays(today, 5).toISOString()
    },
    {
      id: 'matter-12', matterNumber: '00110-Varma-03.2025', description: 'Business Incorporation',
      status: 'Open', clientId: 'contact-13', clientName: 'Priya Varma', practiceArea: 'Corporate',
      responsibleAttorneyId: 'user-2', responsibleAttorneyName: 'Marcus Rivera',
      originatingAttorneyId: 'user-2', billingMethod: 'Flat Fee', hourlyRate: 0,
      budget: 3500, openDate: fmt(subDays(today, 25)), closeDate: null, pendingDate: null,
      statuteOfLimitations: null, courtName: '', caseNumber: '', stage: 'Drafting',
      tags: [],
      relatedContacts: [],
      notes: '', createdAt: subDays(today, 25).toISOString(), updatedAt: subDays(today, 3).toISOString()
    },
    {
      id: 'matter-13', matterNumber: '00112-Kozlov-01.2025', description: 'Personal Injury - Vehicle Collision',
      status: 'Open', clientId: 'contact-14', clientName: 'Andrei Kozlov', practiceArea: 'Personal Injury',
      responsibleAttorneyId: 'user-1', responsibleAttorneyName: 'Sarah Chen',
      originatingAttorneyId: 'user-1', billingMethod: 'Contingency', hourlyRate: 0,
      budget: 0, openDate: fmt(subDays(today, 60)), closeDate: null, pendingDate: null,
      statuteOfLimitations: fmt(addDays(today, 670)), courtName: 'BC Supreme Court',
      caseNumber: 'S-250332', stage: 'Discovery', tags: ['Active Litigation'],
      relatedContacts: [{ contactId: 'contact-8', role: 'Expert Witness' }, { contactId: 'contact-11', role: 'Opposing Party' }],
      notes: '', createdAt: subDays(today, 60).toISOString(), updatedAt: subDays(today, 2).toISOString()
    },
    {
      id: 'matter-14', matterNumber: '00115-Chen-04.2025', description: 'Estate Planning & Will Preparation',
      status: 'Open', clientId: 'contact-15', clientName: 'Margaret Chen', practiceArea: 'Family Law',
      responsibleAttorneyId: 'user-1', responsibleAttorneyName: 'Sarah Chen',
      originatingAttorneyId: 'user-1', billingMethod: 'Flat Fee', hourlyRate: 0,
      budget: 4000, openDate: fmt(subDays(today, 10)), closeDate: null, pendingDate: null,
      statuteOfLimitations: null, courtName: '', caseNumber: '', stage: 'Intake',
      tags: [],
      relatedContacts: [],
      notes: '', createdAt: subDays(today, 10).toISOString(), updatedAt: subDays(today, 1).toISOString()
    },
    {
      id: 'matter-15', matterNumber: '00050-Hartmann-06.2019', description: 'Employee Non-Compete Agreement',
      status: 'Closed', clientId: 'contact-9', clientName: 'Hartmann Industries', practiceArea: 'Employment',
      responsibleAttorneyId: 'user-2', responsibleAttorneyName: 'Marcus Rivera',
      originatingAttorneyId: 'user-2', billingMethod: 'Hourly', hourlyRate: 280,
      budget: 10000, openDate: '2019-06-01', closeDate: '2019-12-15', pendingDate: null,
      statuteOfLimitations: null, courtName: '', caseNumber: '', stage: 'Closed', tags: [],
      relatedContacts: [],
      notes: 'Non-compete agreements drafted and executed for 12 key employees.', createdAt: '2019-06-01T09:00:00Z', updatedAt: '2019-12-15T14:00:00Z'
    },
    {
      id: 'matter-16', matterNumber: '00118-Torres-03.2025', description: 'Immigration Work Permit Renewal',
      status: 'Open', clientId: 'contact-16', clientName: 'Sofia Torres', practiceArea: 'Immigration',
      responsibleAttorneyId: 'user-1', responsibleAttorneyName: 'Sarah Chen',
      originatingAttorneyId: 'user-1', billingMethod: 'Flat Fee', hourlyRate: 0,
      budget: 5000, openDate: fmt(subDays(today, 18)), closeDate: null, pendingDate: null,
      statuteOfLimitations: null, courtName: '', caseNumber: '', stage: 'Filing',
      tags: [],
      relatedContacts: [],
      notes: '', createdAt: subDays(today, 18).toISOString(), updatedAt: subDays(today, 4).toISOString()
    }
  ]

  const activities = [
    // Time entries for matter-1
    { id: 'activity-1', type: 'TimeEntry', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 90)), description: 'Review discovery documents and prepare interrogatories', duration: 2.5, rate: 350, total: 875, billable: true, billed: true, billId: 'bill-1', category: 'Document Review', createdAt: subDays(today, 90).toISOString() },
    { id: 'activity-2', type: 'TimeEntry', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 88)), description: 'Prepare interrogatories for opposing counsel', duration: 3.0, rate: 350, total: 1050, billable: true, billed: true, billId: 'bill-1', category: 'Drafting', createdAt: subDays(today, 88).toISOString() },
    { id: 'activity-3', type: 'TimeEntry', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 85)), description: 'Client meeting re: case strategy and plea options', duration: 1.5, rate: 350, total: 525, billable: true, billed: true, billId: 'bill-1', category: 'Client Communication', createdAt: subDays(today, 85).toISOString() },
    { id: 'activity-4', type: 'TimeEntry', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', userId: 'user-3', userName: 'Emily Park', date: fmt(subDays(today, 30)), description: 'Legal research on self-defense precedents', duration: 3.5, rate: 150, total: 525, billable: true, billed: false, billId: null, category: 'Research', createdAt: subDays(today, 30).toISOString() },
    { id: 'activity-5', type: 'TimeEntry', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 25)), description: 'Court appearance - preliminary hearing', duration: 4.0, rate: 350, total: 1400, billable: true, billed: false, billId: null, category: 'Court Appearance', createdAt: subDays(today, 25).toISOString() },
    // Time entries for matter-2
    { id: 'activity-6', type: 'TimeEntry', matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 60)), description: 'Initial client consultation and case assessment', duration: 2.0, rate: 350, total: 700, billable: true, billed: true, billId: 'bill-2', category: 'Client Communication', createdAt: subDays(today, 60).toISOString() },
    { id: 'activity-7', type: 'TimeEntry', matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 45)), description: 'Draft separation agreement and property division schedule', duration: 5.0, rate: 350, total: 1750, billable: true, billed: false, billId: null, category: 'Drafting', createdAt: subDays(today, 45).toISOString() },
    { id: 'activity-8', type: 'TimeEntry', matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', userId: 'user-3', userName: 'Emily Park', date: fmt(subDays(today, 40)), description: 'Prepare financial disclosure documents', duration: 4.0, rate: 150, total: 600, billable: true, billed: false, billId: null, category: 'Document Review', createdAt: subDays(today, 40).toISOString() },
    // Time entries for matter-3
    { id: 'activity-9', type: 'TimeEntry', matterId: 'matter-3', matterDescription: 'Hartmann - Corporate Merger Agreement', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 70)), description: 'Due diligence review and report preparation', duration: 8.0, rate: 280, total: 2240, billable: true, billed: true, billId: 'bill-3', category: 'Document Review', createdAt: subDays(today, 70).toISOString() },
    { id: 'activity-10', type: 'TimeEntry', matterId: 'matter-3', matterDescription: 'Hartmann - Corporate Merger Agreement', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 55)), description: 'Draft merger agreement - initial version', duration: 10.0, rate: 280, total: 2800, billable: true, billed: true, billId: 'bill-3', category: 'Drafting', createdAt: subDays(today, 55).toISOString() },
    { id: 'activity-11', type: 'TimeEntry', matterId: 'matter-3', matterDescription: 'Hartmann - Corporate Merger Agreement', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 20)), description: 'Negotiate terms with opposing counsel', duration: 3.0, rate: 280, total: 840, billable: true, billed: false, billId: null, category: 'Client Communication', createdAt: subDays(today, 20).toISOString() },
    // Time entries for matter-4
    { id: 'activity-12', type: 'TimeEntry', matterId: 'matter-4', matterDescription: 'Kim - Employment Wrongful Termination', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 50)), description: 'Review employment contract and termination letter', duration: 2.0, rate: 280, total: 560, billable: true, billed: false, billId: null, category: 'Document Review', createdAt: subDays(today, 50).toISOString() },
    { id: 'activity-13', type: 'TimeEntry', matterId: 'matter-4', matterDescription: 'Kim - Employment Wrongful Termination', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 35)), description: 'Research wrongful dismissal case law', duration: 3.5, rate: 280, total: 980, billable: true, billed: false, billId: null, category: 'Research', createdAt: subDays(today, 35).toISOString() },
    // Time entries for matter-5
    { id: 'activity-14', type: 'TimeEntry', matterId: 'matter-5', matterDescription: 'Grey - Slip and Fall Claim', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 120)), description: 'Review medical records and expert reports', duration: 3.0, rate: 350, total: 1050, billable: true, billed: true, billId: 'bill-4', category: 'Document Review', createdAt: subDays(today, 120).toISOString() },
    { id: 'activity-15', type: 'TimeEntry', matterId: 'matter-5', matterDescription: 'Grey - Slip and Fall Claim', userId: 'user-3', userName: 'Emily Park', date: fmt(subDays(today, 100)), description: 'Coordinate with expert witness Dr. Adeyemi', duration: 1.5, rate: 150, total: 225, billable: true, billed: true, billId: 'bill-4', category: 'Client Communication', createdAt: subDays(today, 100).toISOString() },
    // Time entries for matter-6 and matter-7
    { id: 'activity-16', type: 'TimeEntry', matterId: 'matter-6', matterDescription: 'Hartmann Industries - Commercial Lease Dispute', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 75)), description: 'Review lease agreement and landlord demands', duration: 4.0, rate: 280, total: 1120, billable: true, billed: true, billId: 'bill-5', category: 'Document Review', createdAt: subDays(today, 75).toISOString() },
    { id: 'activity-17', type: 'TimeEntry', matterId: 'matter-7', matterDescription: 'Nguyen - Child Custody and Support', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 65)), description: 'Draft custody arrangement proposal', duration: 3.0, rate: 350, total: 1050, billable: true, billed: true, billId: 'bill-6', category: 'Drafting', createdAt: subDays(today, 65).toISOString() },
    { id: 'activity-18', type: 'TimeEntry', matterId: 'matter-7', matterDescription: 'Nguyen - Child Custody and Support', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 15)), description: 'Court attendance - custody hearing', duration: 5.0, rate: 350, total: 1750, billable: true, billed: false, billId: null, category: 'Court Appearance', createdAt: subDays(today, 15).toISOString() },
    // Recent time entries for this week
    { id: 'activity-19', type: 'TimeEntry', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 2)), description: 'Trial preparation - witness examination prep', duration: 3.0, rate: 350, total: 1050, billable: true, billed: false, billId: null, category: 'Drafting', createdAt: subDays(today, 2).toISOString() },
    { id: 'activity-19b', type: 'TimeEntry', matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 1)), description: 'Phone conference with client re: settlement offer', duration: 1.0, rate: 350, total: 350, billable: true, billed: false, billId: null, category: 'Client Communication', createdAt: subDays(today, 1).toISOString() },
    { id: 'activity-19c', type: 'TimeEntry', matterId: 'matter-3', matterDescription: 'Hartmann - Corporate Merger Agreement', userId: 'user-2', userName: 'Marcus Rivera', date: todayStr, description: 'Review shareholder approval documents', duration: 2.5, rate: 280, total: 700, billable: true, billed: false, billId: null, category: 'Document Review', createdAt: today.toISOString() },
    { id: 'activity-19d', type: 'TimeEntry', matterId: 'matter-4', matterDescription: 'Kim - Employment Wrongful Termination', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 3)), description: 'Draft statement of claim', duration: 4.0, rate: 280, total: 1120, billable: true, billed: false, billId: null, category: 'Drafting', createdAt: subDays(today, 3).toISOString() },
    { id: 'activity-19e', type: 'TimeEntry', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', userId: 'user-3', userName: 'Emily Park', date: fmt(subDays(today, 4)), description: 'Organize trial exhibits and documentation', duration: 2.0, rate: 150, total: 300, billable: true, billed: false, billId: null, category: 'Administrative', createdAt: subDays(today, 4).toISOString() },
    // Older entries
    { id: 'activity-19f', type: 'TimeEntry', matterId: 'matter-5', matterDescription: 'Grey - Slip and Fall Claim', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 10)), description: 'Settlement negotiations with Pacific Insurance', duration: 2.5, rate: 350, total: 875, billable: true, billed: false, billId: null, category: 'Client Communication', createdAt: subDays(today, 10).toISOString() },
    { id: 'activity-19g', type: 'TimeEntry', matterId: 'matter-6', matterDescription: 'Hartmann Industries - Commercial Lease Dispute', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 12)), description: 'Research commercial lease termination rights', duration: 3.0, rate: 280, total: 840, billable: true, billed: false, billId: null, category: 'Research', createdAt: subDays(today, 12).toISOString() },
    { id: 'activity-19h', type: 'TimeEntry', matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', userId: 'user-3', userName: 'Emily Park', date: fmt(subDays(today, 8)), description: 'Prepare asset inventory spreadsheet', duration: 2.5, rate: 150, total: 375, billable: true, billed: false, billId: null, category: 'Administrative', createdAt: subDays(today, 8).toISOString() },
    { id: 'activity-19i', type: 'TimeEntry', matterId: 'matter-7', matterDescription: 'Nguyen - Child Custody and Support', userId: 'user-4', userName: 'David Okafor', date: fmt(subDays(today, 5)), description: 'File court documents', duration: 1.0, rate: 100, total: 100, billable: true, billed: false, billId: null, category: 'Administrative', createdAt: subDays(today, 5).toISOString() },
    { id: 'activity-19j', type: 'TimeEntry', matterId: 'matter-3', matterDescription: 'Hartmann - Corporate Merger Agreement', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 7)), description: 'Client board presentation preparation', duration: 3.0, rate: 280, total: 840, billable: true, billed: false, billId: null, category: 'Client Communication', createdAt: subDays(today, 7).toISOString() },
    // Expense entries
    { id: 'activity-20', type: 'ExpenseEntry', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 92)), description: 'Court filing fee', quantity: 1, rate: 200, total: 200, billable: true, billed: true, billId: 'bill-1', category: 'Filing Fees', createdAt: subDays(today, 92).toISOString() },
    { id: 'activity-21', type: 'ExpenseEntry', matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', userId: 'user-4', userName: 'David Okafor', date: fmt(subDays(today, 58)), description: 'Court filing fee - divorce petition', quantity: 1, rate: 210, total: 210, billable: true, billed: true, billId: 'bill-2', category: 'Filing Fees', createdAt: subDays(today, 58).toISOString() },
    { id: 'activity-22', type: 'ExpenseEntry', matterId: 'matter-3', matterDescription: 'Hartmann - Corporate Merger Agreement', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 68)), description: 'Expert consultant fees - financial due diligence', quantity: 1, rate: 1500, total: 1500, billable: true, billed: true, billId: 'bill-3', category: 'Expert Fees', createdAt: subDays(today, 68).toISOString() },
    { id: 'activity-23', type: 'ExpenseEntry', matterId: 'matter-5', matterDescription: 'Grey - Slip and Fall Claim', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 115)), description: 'Medical expert report fee - Dr. Adeyemi', quantity: 1, rate: 2500, total: 2500, billable: true, billed: true, billId: 'bill-4', category: 'Expert Fees', createdAt: subDays(today, 115).toISOString() },
    { id: 'activity-24', type: 'ExpenseEntry', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', userId: 'user-3', userName: 'Emily Park', date: fmt(subDays(today, 28)), description: 'Document copying and printing', quantity: 200, rate: 0.25, total: 50, billable: true, billed: false, billId: null, category: 'Copying', createdAt: subDays(today, 28).toISOString() },
    { id: 'activity-25', type: 'ExpenseEntry', matterId: 'matter-4', matterDescription: 'Kim - Employment Wrongful Termination', userId: 'user-4', userName: 'David Okafor', date: fmt(subDays(today, 45)), description: 'Service of process fee', quantity: 1, rate: 75, total: 75, billable: true, billed: false, billId: null, category: 'Filing Fees', createdAt: subDays(today, 45).toISOString() },
    { id: 'activity-26', type: 'ExpenseEntry', matterId: 'matter-6', matterDescription: 'Hartmann Industries - Commercial Lease Dispute', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 73)), description: 'Property inspection fee', quantity: 1, rate: 350, total: 350, billable: true, billed: true, billId: 'bill-5', category: 'Expert Fees', createdAt: subDays(today, 73).toISOString() },
    { id: 'activity-27', type: 'ExpenseEntry', matterId: 'matter-7', matterDescription: 'Nguyen - Child Custody and Support', userId: 'user-4', userName: 'David Okafor', date: fmt(subDays(today, 62)), description: 'Court filing fee - custody motion', quantity: 1, rate: 180, total: 180, billable: true, billed: true, billId: 'bill-6', category: 'Filing Fees', createdAt: subDays(today, 62).toISOString() },
    // Activities for new matters
    { id: 'activity-28', type: 'TimeEntry', matterId: 'matter-11', matterDescription: 'Grey - Property Tax Assessment Appeal', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 35)), description: 'Review property assessment documentation and comparable sales data', duration: 3.0, rate: 280, total: 840, billable: true, billed: false, billId: null, category: 'Document Review', createdAt: subDays(today, 35).toISOString() },
    { id: 'activity-29', type: 'TimeEntry', matterId: 'matter-11', matterDescription: 'Grey - Property Tax Assessment Appeal', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 20)), description: 'Draft notice of appeal to Property Assessment Review Panel', duration: 2.5, rate: 280, total: 700, billable: true, billed: false, billId: null, category: 'Drafting', createdAt: subDays(today, 20).toISOString() },
    { id: 'activity-30', type: 'TimeEntry', matterId: 'matter-12', matterDescription: 'Varma - Business Incorporation', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 22)), description: 'Client consultation - business structure and incorporation options', duration: 1.5, rate: 280, total: 420, billable: true, billed: false, billId: null, category: 'Client Communication', createdAt: subDays(today, 22).toISOString() },
    { id: 'activity-31', type: 'TimeEntry', matterId: 'matter-12', matterDescription: 'Varma - Business Incorporation', userId: 'user-2', userName: 'Marcus Rivera', date: fmt(subDays(today, 15)), description: 'Prepare articles of incorporation and corporate bylaws', duration: 4.0, rate: 280, total: 1120, billable: true, billed: false, billId: null, category: 'Drafting', createdAt: subDays(today, 15).toISOString() },
    { id: 'activity-32', type: 'TimeEntry', matterId: 'matter-13', matterDescription: 'Kozlov - Personal Injury Vehicle Collision', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 55)), description: 'Initial client interview and accident scene review', duration: 2.0, rate: 350, total: 700, billable: true, billed: false, billId: null, category: 'Client Communication', createdAt: subDays(today, 55).toISOString() },
    { id: 'activity-33', type: 'TimeEntry', matterId: 'matter-13', matterDescription: 'Kozlov - Personal Injury Vehicle Collision', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 40)), description: 'Review police report and ICBC documentation', duration: 3.0, rate: 350, total: 1050, billable: true, billed: false, billId: null, category: 'Document Review', createdAt: subDays(today, 40).toISOString() },
    { id: 'activity-34', type: 'TimeEntry', matterId: 'matter-13', matterDescription: 'Kozlov - Personal Injury Vehicle Collision', userId: 'user-3', userName: 'Emily Park', date: fmt(subDays(today, 30)), description: 'Gather medical records and treatment documentation', duration: 2.5, rate: 150, total: 375, billable: true, billed: false, billId: null, category: 'Administrative', createdAt: subDays(today, 30).toISOString() },
    { id: 'activity-35', type: 'TimeEntry', matterId: 'matter-14', matterDescription: 'Chen - Estate Planning & Will Preparation', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 8)), description: 'Initial estate planning consultation', duration: 1.5, rate: 350, total: 525, billable: true, billed: false, billId: null, category: 'Client Communication', createdAt: subDays(today, 8).toISOString() },
    { id: 'activity-36', type: 'TimeEntry', matterId: 'matter-16', matterDescription: 'Torres - Immigration Work Permit Renewal', userId: 'user-1', userName: 'Sarah Chen', date: fmt(subDays(today, 14)), description: 'Review current work permit and eligibility for renewal', duration: 1.0, rate: 350, total: 350, billable: true, billed: false, billId: null, category: 'Document Review', createdAt: subDays(today, 14).toISOString() },
    { id: 'activity-37', type: 'TimeEntry', matterId: 'matter-16', matterDescription: 'Torres - Immigration Work Permit Renewal', userId: 'user-3', userName: 'Emily Park', date: fmt(subDays(today, 10)), description: 'Prepare work permit renewal application documents', duration: 3.0, rate: 150, total: 450, billable: true, billed: false, billId: null, category: 'Administrative', createdAt: subDays(today, 10).toISOString() },
    { id: 'activity-38', type: 'ExpenseEntry', matterId: 'matter-13', matterDescription: 'Kozlov - Personal Injury Vehicle Collision', userId: 'user-4', userName: 'David Okafor', date: fmt(subDays(today, 50)), description: 'Police report retrieval fee', quantity: 1, rate: 50, total: 50, billable: true, billed: false, billId: null, category: 'Filing Fees', createdAt: subDays(today, 50).toISOString() },
    { id: 'activity-39', type: 'ExpenseEntry', matterId: 'matter-12', matterDescription: 'Varma - Business Incorporation', userId: 'user-4', userName: 'David Okafor', date: fmt(subDays(today, 12)), description: 'BC Registry incorporation filing fee', quantity: 1, rate: 350, total: 350, billable: true, billed: false, billId: null, category: 'Filing Fees', createdAt: subDays(today, 12).toISOString() }
  ]

  const tasks = [
    { id: 'task-1', name: 'File motion for discovery extension', description: 'Draft and file motion requesting 30-day extension for discovery deadline', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', assigneeId: 'user-1', assigneeName: 'Sarah Chen', assignerId: 'user-1', priority: 'High', status: 'Outstanding', dueDate: fmt(subDays(today, 5)), completedDate: null, taskListId: 'tasklist-1', taskListName: 'Litigation Prep', isPrivate: false, createdAt: subDays(today, 30).toISOString(), updatedAt: subDays(today, 30).toISOString() },
    { id: 'task-2', name: 'Prepare witness examination questions', description: 'Develop comprehensive question list for key witnesses', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', assigneeId: 'user-1', assigneeName: 'Sarah Chen', assignerId: 'user-1', priority: 'High', status: 'Outstanding', dueDate: fmt(addDays(today, 7)), completedDate: null, taskListId: 'tasklist-1', taskListName: 'Litigation Prep', isPrivate: false, createdAt: subDays(today, 20).toISOString(), updatedAt: subDays(today, 20).toISOString() },
    { id: 'task-3', name: 'Draft separation agreement', description: 'Complete draft of property and asset division agreement', matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', assigneeId: 'user-1', assigneeName: 'Sarah Chen', assignerId: 'user-1', priority: 'Normal', status: 'Outstanding', dueDate: fmt(addDays(today, 14)), completedDate: null, taskListId: 'tasklist-2', taskListName: 'Client Intake', isPrivate: false, createdAt: subDays(today, 15).toISOString(), updatedAt: subDays(today, 15).toISOString() },
    { id: 'task-4', name: 'Review merger agreement with client', description: 'Schedule and conduct review meeting with Hartmann re: merger terms', matterId: 'matter-3', matterDescription: 'Hartmann - Corporate Merger Agreement', assigneeId: 'user-2', assigneeName: 'Marcus Rivera', assignerId: 'user-2', priority: 'High', status: 'Outstanding', dueDate: fmt(addDays(today, 3)), completedDate: null, taskListId: 'tasklist-1', taskListName: 'Litigation Prep', isPrivate: false, createdAt: subDays(today, 10).toISOString(), updatedAt: subDays(today, 10).toISOString() },
    { id: 'task-5', name: 'File statement of claim', description: 'File with BC Supreme Court registry', matterId: 'matter-4', matterDescription: 'Kim - Employment Wrongful Termination', assigneeId: 'user-4', assigneeName: 'David Okafor', assignerId: 'user-2', priority: 'High', status: 'Outstanding', dueDate: fmt(subDays(today, 2)), completedDate: null, taskListId: 'tasklist-3', taskListName: 'Administrative', isPrivate: false, createdAt: subDays(today, 12).toISOString(), updatedAt: subDays(today, 12).toISOString() },
    { id: 'task-6', name: 'Request medical records from hospital', description: 'Submit formal records request to St. Paul\'s Hospital', matterId: 'matter-5', matterDescription: 'Grey - Slip and Fall Claim', assigneeId: 'user-3', assigneeName: 'Emily Park', assignerId: 'user-1', priority: 'Normal', status: 'Outstanding', dueDate: fmt(addDays(today, 5)), completedDate: null, taskListId: 'tasklist-1', taskListName: 'Litigation Prep', isPrivate: false, createdAt: subDays(today, 8).toISOString(), updatedAt: subDays(today, 8).toISOString() },
    { id: 'task-7', name: 'Prepare trial exhibits binder', description: 'Organize all exhibits for trial', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', assigneeId: 'user-3', assigneeName: 'Emily Park', assignerId: 'user-1', priority: 'Normal', status: 'Outstanding', dueDate: fmt(addDays(today, 10)), completedDate: null, taskListId: 'tasklist-1', taskListName: 'Litigation Prep', isPrivate: false, createdAt: subDays(today, 5).toISOString(), updatedAt: subDays(today, 5).toISOString() },
    { id: 'task-8', name: 'Send invoice to Hartmann Industries', description: 'Email invoice INV-2025-003 to client', matterId: 'matter-6', matterDescription: 'Hartmann Industries - Commercial Lease Dispute', assigneeId: 'user-4', assigneeName: 'David Okafor', assignerId: 'user-1', priority: 'Low', status: 'Outstanding', dueDate: fmt(addDays(today, 1)), completedDate: null, taskListId: 'tasklist-3', taskListName: 'Administrative', isPrivate: false, createdAt: subDays(today, 3).toISOString(), updatedAt: subDays(today, 3).toISOString() },
    { id: 'task-9', name: 'Update client on custody hearing outcome', description: 'Call client to discuss result and next steps', matterId: 'matter-7', matterDescription: 'Nguyen - Child Custody and Support', assigneeId: 'user-1', assigneeName: 'Sarah Chen', assignerId: 'user-1', priority: 'Normal', status: 'Outstanding', dueDate: todayStr, completedDate: null, taskListId: 'tasklist-2', taskListName: 'Client Intake', isPrivate: false, createdAt: subDays(today, 2).toISOString(), updatedAt: subDays(today, 2).toISOString() },
    { id: 'task-10', name: 'Annual trust account reconciliation', description: 'Reconcile all client trust accounts for year-end', matterId: null, matterDescription: '', assigneeId: 'user-1', assigneeName: 'Sarah Chen', assignerId: 'user-1', priority: 'High', status: 'Outstanding', dueDate: fmt(addDays(today, 20)), completedDate: null, taskListId: 'tasklist-3', taskListName: 'Administrative', isPrivate: false, createdAt: subDays(today, 1).toISOString(), updatedAt: subDays(today, 1).toISOString() },
    // Completed tasks
    { id: 'task-11', name: 'Initial client intake - Jane Grey', description: 'Conduct initial consultation and intake for assault matter', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', assigneeId: 'user-1', assigneeName: 'Sarah Chen', assignerId: 'user-1', priority: 'High', status: 'Completed', dueDate: '2021-07-15', completedDate: '2021-07-14', taskListId: 'tasklist-2', taskListName: 'Client Intake', isPrivate: false, createdAt: '2021-07-12T09:00:00Z', updatedAt: '2021-07-14T16:00:00Z' },
    { id: 'task-12', name: 'File immigration PR application', description: 'Complete and file permanent residence application with IRCC', matterId: 'matter-8', matterDescription: 'Kim - Immigration Permanent Residence', assigneeId: 'user-1', assigneeName: 'Sarah Chen', assignerId: 'user-1', priority: 'High', status: 'Completed', dueDate: '2019-06-30', completedDate: '2019-06-28', taskListId: 'tasklist-3', taskListName: 'Administrative', isPrivate: false, createdAt: '2019-02-15T09:00:00Z', updatedAt: '2019-06-28T14:00:00Z' },
    { id: 'task-13', name: 'Obtain trademark search results', description: 'Commission and review trademark search for Hartmann brand', matterId: 'matter-9', matterDescription: 'Hartmann - Trademark Registration', assigneeId: 'user-2', assigneeName: 'Marcus Rivera', assignerId: 'user-2', priority: 'Normal', status: 'Completed', dueDate: '2021-08-15', completedDate: '2021-08-12', taskListId: 'tasklist-1', taskListName: 'Litigation Prep', isPrivate: false, createdAt: '2021-07-01T09:00:00Z', updatedAt: '2021-08-12T11:00:00Z' },
    { id: 'task-14', name: 'Prepare financial disclosure - Nguyen', description: 'Complete Form 8 financial disclosure for divorce proceedings', matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', assigneeId: 'user-3', assigneeName: 'Emily Park', assignerId: 'user-1', priority: 'Normal', status: 'Completed', dueDate: fmt(subDays(today, 20)), completedDate: fmt(subDays(today, 18)), taskListId: 'tasklist-2', taskListName: 'Client Intake', isPrivate: false, createdAt: subDays(today, 35).toISOString(), updatedAt: subDays(today, 18).toISOString() },
    { id: 'task-15', name: 'Draft demand letter to Pacific Insurance', description: 'Send formal demand letter for slip and fall settlement', matterId: 'matter-5', matterDescription: 'Grey - Slip and Fall Claim', assigneeId: 'user-1', assigneeName: 'Sarah Chen', assignerId: 'user-1', priority: 'High', status: 'Completed', dueDate: fmt(subDays(today, 45)), completedDate: fmt(subDays(today, 44)), taskListId: 'tasklist-1', taskListName: 'Litigation Prep', isPrivate: false, createdAt: subDays(today, 60).toISOString(), updatedAt: subDays(today, 44).toISOString() }
  ]

  const calendarEvents = [
    { id: 'event-1', title: 'Grey - Trial Date', description: 'Criminal trial for assault and battery charge', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', location: 'Provincial Court, Room 302, 222 Main Street Vancouver', startDate: fmt(addDays(today, 30)) + 'T09:00:00', endDate: fmt(addDays(today, 30)) + 'T17:00:00', allDay: false, attendees: ['user-1', 'user-3'], reminderMinutes: 1440, color: '#EA4335', recurrence: null, createdAt: subDays(today, 60).toISOString() },
    { id: 'event-2', title: 'Hartmann - Board Presentation', description: 'Present merger agreement to Hartmann board of directors', matterId: 'matter-3', matterDescription: 'Hartmann - Corporate Merger Agreement', location: 'Hartmann Industries HQ, 500 West Georgia St', startDate: fmt(addDays(today, 5)) + 'T14:00:00', endDate: fmt(addDays(today, 5)) + 'T16:00:00', allDay: false, attendees: ['user-2'], reminderMinutes: 60, color: '#1A73E8', recurrence: null, createdAt: subDays(today, 15).toISOString() },
    { id: 'event-3', title: 'Nguyen - Mediation Session', description: 'Court-ordered mediation for divorce proceedings', matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', location: 'Mediation BC, 1111 Melville St, Vancouver', startDate: fmt(addDays(today, 12)) + 'T10:00:00', endDate: fmt(addDays(today, 12)) + 'T14:00:00', allDay: false, attendees: ['user-1', 'user-3'], reminderMinutes: 60, color: '#FBBC04', recurrence: null, createdAt: subDays(today, 20).toISOString() },
    { id: 'event-4', title: 'Client Meeting - Patricia Nguyen', description: 'Discuss settlement proposal and client instructions', matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', location: 'Meadow Law Group, 1200 Main Street Suite 400', startDate: todayStr + 'T11:00:00', endDate: todayStr + 'T12:00:00', allDay: false, attendees: ['user-1'], reminderMinutes: 30, color: '#34A853', recurrence: null, createdAt: subDays(today, 5).toISOString() },
    { id: 'event-5', title: 'Firm Team Meeting', description: 'Weekly all-hands team meeting', matterId: null, matterDescription: '', location: 'Meadow Law Group Conference Room A', startDate: todayStr + 'T09:00:00', endDate: todayStr + 'T09:30:00', allDay: false, attendees: ['user-1', 'user-2', 'user-3', 'user-4'], reminderMinutes: 15, color: '#9E9E9E', recurrence: 'weekly', createdAt: subDays(today, 14).toISOString() },
    { id: 'event-6', title: 'Court Deadline - Kim Motion', description: 'Deadline to file statement of claim', matterId: 'matter-4', matterDescription: 'Kim - Employment Wrongful Termination', location: '', startDate: fmt(addDays(today, 2)), endDate: fmt(addDays(today, 2)), allDay: true, attendees: ['user-2'], reminderMinutes: 1440, color: '#EA4335', recurrence: null, createdAt: subDays(today, 10).toISOString() },
    { id: 'event-7', title: 'Grey - Settlement Conference', description: 'Judicial settlement conference for slip and fall', matterId: 'matter-5', matterDescription: 'Grey - Slip and Fall Claim', location: 'BC Supreme Court, 800 Smithe Street', startDate: fmt(addDays(today, 18)) + 'T13:00:00', endDate: fmt(addDays(today, 18)) + 'T17:00:00', allDay: false, attendees: ['user-1'], reminderMinutes: 60, color: '#FBBC04', recurrence: null, createdAt: subDays(today, 25).toISOString() },
    { id: 'event-8', title: 'Daniel Kim - Initial Consultation', description: 'Follow-up meeting re: wrongful dismissal strategy', matterId: 'matter-4', matterDescription: 'Kim - Employment Wrongful Termination', location: 'Meadow Law Group, 1200 Main Street Suite 400', startDate: fmt(addDays(today, 1)) + 'T15:00:00', endDate: fmt(addDays(today, 1)) + 'T16:00:00', allDay: false, attendees: ['user-2', 'user-3'], reminderMinutes: 30, color: '#1A73E8', recurrence: null, createdAt: subDays(today, 3).toISOString() },
    { id: 'event-9', title: 'CLE Seminar - Family Law Update', description: 'Continuing legal education - family law changes 2025', matterId: null, matterDescription: '', location: 'BC Law Society, 845 Cambie Street', startDate: fmt(addDays(today, 22)) + 'T09:00:00', endDate: fmt(addDays(today, 22)) + 'T17:00:00', allDay: false, attendees: ['user-1', 'user-3'], reminderMinutes: 1440, color: '#4285F4', recurrence: null, createdAt: subDays(today, 30).toISOString() },
    { id: 'event-10', title: 'Nguyen - Document Production Deadline', description: 'Deadline for exchange of financial documents', matterId: 'matter-7', matterDescription: 'Nguyen - Child Custody and Support', location: '', startDate: fmt(addDays(today, 8)), endDate: fmt(addDays(today, 8)), allDay: true, attendees: ['user-1', 'user-3'], reminderMinutes: 1440, color: '#FBBC04', recurrence: null, createdAt: subDays(today, 20).toISOString() },
    { id: 'event-11', title: 'Hartmann - Contract Signing', description: 'Final execution of merger agreement', matterId: 'matter-3', matterDescription: 'Hartmann - Corporate Merger Agreement', location: 'Hartmann Industries HQ, 500 West Georgia St', startDate: fmt(addDays(today, 45)) + 'T10:00:00', endDate: fmt(addDays(today, 45)) + 'T11:30:00', allDay: false, attendees: ['user-2'], reminderMinutes: 1440, color: '#34A853', recurrence: null, createdAt: subDays(today, 5).toISOString() },
    { id: 'event-12', title: 'Staff Performance Reviews', description: 'Annual performance review meetings', matterId: null, matterDescription: '', location: 'Meadow Law Group', startDate: fmt(addDays(today, 35)), endDate: fmt(addDays(today, 35)), allDay: true, attendees: ['user-1'], reminderMinutes: 1440, color: '#9E9E9E', recurrence: null, createdAt: subDays(today, 7).toISOString() }
  ]

  const bills = [
    {
      id: 'bill-1', billNumber: 'INV-2025-001', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery',
      clientId: 'contact-1', clientName: 'Jane Grey', status: 'Paid',
      issuedDate: fmt(subDays(today, 90)), dueDate: fmt(subDays(today, 60)),
      paidDate: fmt(subDays(today, 55)), subtotal: 3650, taxRate: 0, taxAmount: 0, totalDue: 3650,
      amountPaid: 3650, balance: 0,
      lineItems: [
        { activityId: 'activity-1', description: 'Review discovery documents and prepare interrogatories', hours: 2.5, rate: 350, amount: 875 },
        { activityId: 'activity-2', description: 'Prepare interrogatories for opposing counsel', hours: 3.0, rate: 350, amount: 1050 },
        { activityId: 'activity-3', description: 'Client meeting re: case strategy', hours: 1.5, rate: 350, amount: 525 },
        { activityId: 'activity-20', description: 'Court filing fee', quantity: 1, rate: 200, amount: 200 }
      ],
      memo: 'For legal services rendered Q1 2025', createdAt: subDays(today, 90).toISOString(), updatedAt: subDays(today, 55).toISOString()
    },
    {
      id: 'bill-2', billNumber: 'INV-2025-002', matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings',
      clientId: 'contact-3', clientName: 'Patricia Nguyen', status: 'Paid',
      issuedDate: fmt(subDays(today, 60)), dueDate: fmt(subDays(today, 30)),
      paidDate: fmt(subDays(today, 25)), subtotal: 1610, taxRate: 0, taxAmount: 0, totalDue: 1610,
      amountPaid: 1610, balance: 0,
      lineItems: [
        { activityId: 'activity-6', description: 'Initial client consultation and case assessment', hours: 2.0, rate: 350, amount: 700 },
        { activityId: 'activity-21', description: 'Court filing fee - divorce petition', quantity: 1, rate: 210, amount: 210 }
      ],
      memo: 'For legal services - initial retainer', createdAt: subDays(today, 60).toISOString(), updatedAt: subDays(today, 25).toISOString()
    },
    {
      id: 'bill-3', billNumber: 'INV-2025-003', matterId: 'matter-3', matterDescription: 'Hartmann - Corporate Merger Agreement',
      clientId: 'contact-2', clientName: 'Robert Hartmann', status: 'Sent',
      issuedDate: fmt(subDays(today, 30)), dueDate: fmt(addDays(today, 0)),
      paidDate: null, subtotal: 7540, taxRate: 0, taxAmount: 0, totalDue: 7540,
      amountPaid: 0, balance: 7540,
      lineItems: [
        { activityId: 'activity-9', description: 'Due diligence review and report preparation', hours: 8.0, rate: 280, amount: 2240 },
        { activityId: 'activity-10', description: 'Draft merger agreement - initial version', hours: 10.0, rate: 280, amount: 2800 },
        { activityId: 'activity-22', description: 'Expert consultant fees - financial due diligence', quantity: 1, rate: 1500, amount: 1500 }
      ],
      memo: 'For professional services - merger transaction Phase 1', createdAt: subDays(today, 30).toISOString(), updatedAt: subDays(today, 30).toISOString()
    },
    {
      id: 'bill-4', billNumber: 'INV-2024-009', matterId: 'matter-5', matterDescription: 'Grey - Slip and Fall Claim',
      clientId: 'contact-1', clientName: 'Jane Grey', status: 'Overdue',
      issuedDate: fmt(subDays(today, 120)), dueDate: fmt(subDays(today, 90)),
      paidDate: null, subtotal: 3775, taxRate: 0, taxAmount: 0, totalDue: 3775,
      amountPaid: 0, balance: 3775,
      lineItems: [
        { activityId: 'activity-14', description: 'Review medical records and expert reports', hours: 3.0, rate: 350, amount: 1050 },
        { activityId: 'activity-15', description: 'Coordinate with expert witness Dr. Adeyemi', hours: 1.5, rate: 150, amount: 225 },
        { activityId: 'activity-23', description: 'Medical expert report fee - Dr. Adeyemi', quantity: 1, rate: 2500, amount: 2500 }
      ],
      memo: 'For legal services and expert fees - Q4 2024', createdAt: subDays(today, 120).toISOString(), updatedAt: subDays(today, 120).toISOString()
    },
    {
      id: 'bill-5', billNumber: 'INV-2025-004', matterId: 'matter-6', matterDescription: 'Hartmann Industries - Commercial Lease Dispute',
      clientId: 'contact-9', clientName: 'Hartmann Industries', status: 'Awaiting Approval',
      issuedDate: fmt(subDays(today, 15)), dueDate: fmt(addDays(today, 15)),
      paidDate: null, subtotal: 1820, taxRate: 0, taxAmount: 0, totalDue: 1820,
      amountPaid: 0, balance: 1820,
      lineItems: [
        { activityId: 'activity-16', description: 'Review lease agreement and landlord demands', hours: 4.0, rate: 280, amount: 1120 },
        { activityId: 'activity-26', description: 'Property inspection fee', quantity: 1, rate: 350, amount: 350 }
      ],
      memo: 'For professional services - lease dispute', createdAt: subDays(today, 15).toISOString(), updatedAt: subDays(today, 15).toISOString()
    },
    {
      id: 'bill-6', billNumber: 'INV-2025-005', matterId: 'matter-7', matterDescription: 'Nguyen - Child Custody and Support',
      clientId: 'contact-3', clientName: 'Patricia Nguyen', status: 'Sent',
      issuedDate: fmt(subDays(today, 20)), dueDate: fmt(addDays(today, 10)),
      paidDate: null, subtotal: 1230, taxRate: 0, taxAmount: 0, totalDue: 1230,
      amountPaid: 0, balance: 1230,
      lineItems: [
        { activityId: 'activity-17', description: 'Draft custody arrangement proposal', hours: 3.0, rate: 350, amount: 1050 },
        { activityId: 'activity-27', description: 'Court filing fee - custody motion', quantity: 1, rate: 180, amount: 180 }
      ],
      memo: 'For legal services - custody proceedings', createdAt: subDays(today, 20).toISOString(), updatedAt: subDays(today, 20).toISOString()
    },
    {
      id: 'bill-7', billNumber: 'INV-2025-006', matterId: 'matter-4', matterDescription: 'Kim - Employment Wrongful Termination',
      clientId: 'contact-4', clientName: 'Daniel Kim', status: 'Draft',
      issuedDate: null, dueDate: null,
      paidDate: null, subtotal: 1615, taxRate: 0, taxAmount: 0, totalDue: 1615,
      amountPaid: 0, balance: 1615,
      lineItems: [
        { activityId: 'activity-12', description: 'Review employment contract and termination letter', hours: 2.0, rate: 280, amount: 560 },
        { activityId: 'activity-13', description: 'Research wrongful dismissal case law', hours: 3.5, rate: 280, amount: 980 },
        { activityId: 'activity-25', description: 'Service of process fee', quantity: 1, rate: 75, amount: 75 }
      ],
      memo: '', createdAt: subDays(today, 3).toISOString(), updatedAt: subDays(today, 3).toISOString()
    },
    {
      id: 'bill-8', billNumber: 'INV-2025-007', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery',
      clientId: 'contact-1', clientName: 'Jane Grey', status: 'Draft',
      issuedDate: null, dueDate: null,
      paidDate: null, subtotal: 975, taxRate: 0, taxAmount: 0, totalDue: 975,
      amountPaid: 0, balance: 975,
      lineItems: [
        { activityId: 'activity-4', description: 'Legal research on self-defense precedents', hours: 3.5, rate: 150, amount: 525 },
        { activityId: 'activity-5', description: 'Court appearance - preliminary hearing', hours: 4.0, rate: 350, amount: 1400 }
      ],
      memo: '', createdAt: subDays(today, 1).toISOString(), updatedAt: subDays(today, 1).toISOString()
    }
  ]

  const documents = [
    { id: 'doc-1', name: 'Grey_Discovery_Request.pdf', type: 'application/pdf', size: 245000, matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', folderId: 'folder-1', folderName: 'Discovery', uploadedBy: 'user-1', uploadedByName: 'Sarah Chen', category: 'Court Filing', description: 'Initial discovery request filed with court', version: 1, createdAt: subDays(today, 80).toISOString(), updatedAt: subDays(today, 80).toISOString() },
    { id: 'doc-2', name: 'Grey_Defence_Strategy_Memo.docx', type: 'application/msword', size: 58000, matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', folderId: 'folder-1', folderName: 'Discovery', uploadedBy: 'user-1', uploadedByName: 'Sarah Chen', category: 'Memo', description: 'Internal defence strategy memorandum', version: 2, createdAt: subDays(today, 70).toISOString(), updatedAt: subDays(today, 30).toISOString() },
    { id: 'doc-3', name: 'Grey_Police_Report_CR2021.pdf', type: 'application/pdf', size: 185000, matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', folderId: 'folder-4', folderName: 'Evidence', uploadedBy: 'user-3', uploadedByName: 'Emily Park', category: 'Evidence', description: 'Original police report CR-2021-4455', version: 1, createdAt: subDays(today, 85).toISOString(), updatedAt: subDays(today, 85).toISOString() },
    { id: 'doc-4', name: 'Nguyen_Separation_Agreement_v1.docx', type: 'application/msword', size: 92000, matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', folderId: 'folder-3', folderName: 'Pleadings', uploadedBy: 'user-1', uploadedByName: 'Sarah Chen', category: 'Contract', description: 'Draft separation and property agreement', version: 1, createdAt: subDays(today, 40).toISOString(), updatedAt: subDays(today, 40).toISOString() },
    { id: 'doc-5', name: 'Nguyen_Financial_Disclosure.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 45000, matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', folderId: 'folder-1', folderName: 'Discovery', uploadedBy: 'user-3', uploadedByName: 'Emily Park', category: 'Other', description: 'Complete financial disclosure per Form 8', version: 1, createdAt: subDays(today, 38).toISOString(), updatedAt: subDays(today, 18).toISOString() },
    { id: 'doc-6', name: 'Hartmann_Merger_Agreement_v3.pdf', type: 'application/pdf', size: 523000, matterId: 'matter-3', matterDescription: 'Hartmann - Corporate Merger Agreement', folderId: 'folder-3', folderName: 'Pleadings', uploadedBy: 'user-2', uploadedByName: 'Marcus Rivera', category: 'Contract', description: 'Merger and acquisition agreement - version 3', version: 3, createdAt: subDays(today, 55).toISOString(), updatedAt: subDays(today, 20).toISOString() },
    { id: 'doc-7', name: 'Hartmann_Due_Diligence_Report.pdf', type: 'application/pdf', size: 892000, matterId: 'matter-3', matterDescription: 'Hartmann - Corporate Merger Agreement', folderId: 'folder-1', folderName: 'Discovery', uploadedBy: 'user-2', uploadedByName: 'Marcus Rivera', category: 'Memo', description: 'Comprehensive due diligence findings report', version: 1, createdAt: subDays(today, 65).toISOString(), updatedAt: subDays(today, 65).toISOString() },
    { id: 'doc-8', name: 'Kim_Employment_Contract.pdf', type: 'application/pdf', size: 156000, matterId: 'matter-4', matterDescription: 'Kim - Employment Wrongful Termination', folderId: 'folder-4', folderName: 'Evidence', uploadedBy: 'user-2', uploadedByName: 'Marcus Rivera', category: 'Evidence', description: 'Original employment contract with Pacific Tech', version: 1, createdAt: subDays(today, 48).toISOString(), updatedAt: subDays(today, 48).toISOString() },
    { id: 'doc-9', name: 'Kim_Termination_Letter.pdf', type: 'application/pdf', size: 42000, matterId: 'matter-4', matterDescription: 'Kim - Employment Wrongful Termination', folderId: 'folder-4', folderName: 'Evidence', uploadedBy: 'user-3', uploadedByName: 'Emily Park', category: 'Evidence', description: 'Termination letter from employer', version: 1, createdAt: subDays(today, 47).toISOString(), updatedAt: subDays(today, 47).toISOString() },
    { id: 'doc-10', name: 'Grey_Medical_Expert_Report.pdf', type: 'application/pdf', size: 382000, matterId: 'matter-5', matterDescription: 'Grey - Slip and Fall Claim', folderId: 'folder-4', folderName: 'Evidence', uploadedBy: 'user-1', uploadedByName: 'Sarah Chen', category: 'Evidence', description: 'Expert medical opinion from Dr. T. Adeyemi', version: 1, createdAt: subDays(today, 100).toISOString(), updatedAt: subDays(today, 100).toISOString() },
    { id: 'doc-11', name: 'Grey_Slip_Fall_Demand_Letter.pdf', type: 'application/pdf', size: 68000, matterId: 'matter-5', matterDescription: 'Grey - Slip and Fall Claim', folderId: 'folder-2', folderName: 'Correspondence', uploadedBy: 'user-1', uploadedByName: 'Sarah Chen', category: 'Correspondence', description: 'Formal demand letter to Pacific Insurance Group', version: 1, createdAt: subDays(today, 44).toISOString(), updatedAt: subDays(today, 44).toISOString() },
    { id: 'doc-12', name: 'Hartmann_Lease_Agreement.pdf', type: 'application/pdf', size: 218000, matterId: 'matter-6', matterDescription: 'Hartmann Industries - Commercial Lease Dispute', folderId: 'folder-4', folderName: 'Evidence', uploadedBy: 'user-2', uploadedByName: 'Marcus Rivera', category: 'Contract', description: 'Original commercial lease agreement', version: 1, createdAt: subDays(today, 73).toISOString(), updatedAt: subDays(today, 73).toISOString() },
    { id: 'doc-13', name: 'Nguyen_Custody_Proposal.docx', type: 'application/msword', size: 78000, matterId: 'matter-7', matterDescription: 'Nguyen - Child Custody and Support', folderId: 'folder-3', folderName: 'Pleadings', uploadedBy: 'user-1', uploadedByName: 'Sarah Chen', category: 'Court Filing', description: 'Proposed custody arrangement and parenting plan', version: 1, createdAt: subDays(today, 62).toISOString(), updatedAt: subDays(today, 62).toISOString() },
    { id: 'doc-14', name: 'Firm_Retainer_Agreement_Template.docx', type: 'application/msword', size: 32000, matterId: null, matterDescription: '', folderId: 'folder-5', folderName: 'Administrative', uploadedBy: 'user-1', uploadedByName: 'Sarah Chen', category: 'Template', description: 'Standard client retainer agreement template', version: 4, createdAt: subDays(today, 200).toISOString(), updatedAt: subDays(today, 30).toISOString() },
    { id: 'doc-15', name: 'Grey_Witness_Statement_Chen.pdf', type: 'application/pdf', size: 95000, matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', folderId: 'folder-4', folderName: 'Evidence', uploadedBy: 'user-3', uploadedByName: 'Emily Park', category: 'Evidence', description: 'Witness statement from bystander - John Chen', version: 1, createdAt: subDays(today, 60).toISOString(), updatedAt: subDays(today, 60).toISOString() }
  ]

  const notes = [
    { id: 'note-1', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', subject: 'Initial Case Assessment', body: 'Met with client Jane Grey to discuss assault charges stemming from incident on July 5, 2021. Client claims self-defense after being confronted aggressively. Key witnesses: John Chen (bystander), Marcus Webb (friend of opposing party). Strategy: establish self-defense, challenge witness credibility. Client emotional but cooperative.', authorId: 'user-1', authorName: 'Sarah Chen', isPrivate: false, createdAt: '2021-07-12T15:00:00Z', updatedAt: '2021-07-12T15:00:00Z' },
    { id: 'note-2', matterId: 'matter-1', matterDescription: 'Grey - Assault & Battery', subject: 'Preliminary Hearing Notes', body: 'Attended preliminary hearing. Crown presented initial evidence. Judge Sullivan ordered full disclosure within 30 days. Client present and composed. Next steps: review full disclosure package, prepare for trial.', authorId: 'user-1', authorName: 'Sarah Chen', isPrivate: false, createdAt: subDays(today, 25).toISOString(), updatedAt: subDays(today, 25).toISOString() },
    { id: 'note-3', matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', subject: 'Client Interview - Property Division', body: 'Detailed discussion with Patricia re: marital assets. Primary concern: matrimonial home (estimated $850K equity), RRSP accounts ($120K each), vehicle (2022 Honda, $28K). Patricia wants to retain the home with buyout arrangement. Will need formal appraisal. Opposing party represented by Whitfield & Associates.', authorId: 'user-1', authorName: 'Sarah Chen', isPrivate: false, createdAt: subDays(today, 50).toISOString(), updatedAt: subDays(today, 50).toISOString() },
    { id: 'note-4', matterId: 'matter-3', matterDescription: 'Hartmann - Corporate Merger Agreement', subject: 'Due Diligence Findings - Summary', body: 'Completed review of Hartmann Industries corporate records. Key findings: (1) 2 outstanding CRA matters - discuss with client, (2) 3 employees on extended leave - potential liability disclosure required, (3) IP portfolio clean. Recommend engaging financial advisor for valuation confirmation. Overall risk assessment: MEDIUM. Proceed with appropriate representations and warranties.', authorId: 'user-2', authorName: 'Marcus Rivera', isPrivate: false, createdAt: subDays(today, 65).toISOString(), updatedAt: subDays(today, 65).toISOString() },
    { id: 'note-5', matterId: 'matter-4', matterDescription: 'Kim - Employment Wrongful Termination', subject: 'Initial Consultation Notes', body: 'Daniel Kim terminated June 15, 2024 after 7 years employment. Given no cause, 2 weeks pay in lieu. Has employment contract with 3-month notice clause. Company claims "restructuring" but hired replacement 1 month later. Clear wrongful dismissal case. Pursuing damages for wrongful dismissal + possible bad faith damages. Contingency fee arrangement agreed at 30%.', authorId: 'user-2', authorName: 'Marcus Rivera', isPrivate: false, createdAt: subDays(today, 45).toISOString(), updatedAt: subDays(today, 45).toISOString() },
    { id: 'note-6', matterId: 'matter-5', matterDescription: 'Grey - Slip and Fall Claim', subject: 'Settlement Negotiations Update', body: 'Pacific Insurance offered $45,000 (well below our demand of $120,000). Client rejecting. Counter-offer being prepared at $95,000. Dr. Adeyemi confirms permanent partial disability rating of 8%. Liability clear - property management company failed to address known ice hazard. Strong case for trial if settlement fails.', authorId: 'user-1', authorName: 'Sarah Chen', isPrivate: false, createdAt: subDays(today, 10).toISOString(), updatedAt: subDays(today, 10).toISOString() },
    { id: 'note-7', matterId: 'matter-5', matterDescription: 'Grey - Slip and Fall Claim', subject: 'Expert Witness Coordination', body: 'Spoke with Dr. Adeyemi re: trial testimony. He is available and prepared. Reviewed his report - covers mechanism of injury, treatment, and prognosis clearly. Discussed cross-examination scenarios. Fee: $3,500 for full day testimony. Will need 2 weeks notice for scheduling.', authorId: 'user-1', authorName: 'Sarah Chen', isPrivate: true, createdAt: subDays(today, 20).toISOString(), updatedAt: subDays(today, 20).toISOString() },
    { id: 'note-8', matterId: 'matter-6', matterDescription: 'Hartmann Industries - Commercial Lease Dispute', subject: 'Lease Review and Landlord Demands', body: 'Hartmann received notice from landlord Westside Properties Ltd. demanding $180,000 for alleged lease violations (unreported subletting, alterations). Review of lease shows: subletting clause ambiguous, alterations pre-approved via email. Strong case that landlord acting in bad faith. Recommend formal written response and consider counterclaim for harassment.', authorId: 'user-2', authorName: 'Marcus Rivera', isPrivate: false, createdAt: subDays(today, 72).toISOString(), updatedAt: subDays(today, 72).toISOString() },
    { id: 'note-9', matterId: 'matter-7', matterDescription: 'Nguyen - Child Custody and Support', subject: 'Custody Hearing Outcome', body: 'Attended custody hearing today. Judge awarded primary residence to Patricia with 40% parenting time to opposing party. Child support calculated at $1,850/month. Both parties satisfied with outcome. Appeal period 30 days. Next step: formalize consent order.', authorId: 'user-1', authorName: 'Sarah Chen', isPrivate: false, createdAt: subDays(today, 15).toISOString(), updatedAt: subDays(today, 15).toISOString() },
    { id: 'note-10', matterId: 'matter-2', matterDescription: 'Nguyen - Divorce Proceedings', subject: 'Mediation Preparation Notes', body: 'Upcoming mediation on ' + fmt(addDays(today, 12)) + '. Patricia\'s priorities: (1) retain matrimonial home, (2) equal RRSP division, (3) spousal support for 3 years. Prepared analysis showing Patricia entitled to $2,100/month spousal support for 3 years based on income disparity. Strong position going in. Remind client to stay calm and focused.', authorId: 'user-1', authorName: 'Sarah Chen', isPrivate: false, createdAt: subDays(today, 5).toISOString(), updatedAt: subDays(today, 5).toISOString() }
  ]

  const communications = [
    { id: 'comm-1', type: 'Email', direction: 'Outgoing', matterId: 'matter-1', contactId: 'contact-1', contactName: 'Jane Grey', subject: 'Case Update - Discovery Phase', body: 'Dear Ms. Grey,\n\nI wanted to update you on the progress of your case. We have received the disclosure package from the Crown and are currently reviewing approximately 450 pages of documents.\n\nWe have identified several inconsistencies in the witness statements that we intend to challenge at trial. I will be in touch once our review is complete.\n\nKind regards,\nSarah Chen', from: 'sarah.chen@meadowlaw.com', to: 'jane.grey@gmail.com', date: subDays(today, 25).toISOString(), read: true, attachments: [], createdAt: subDays(today, 25).toISOString() },
    { id: 'comm-2', type: 'Phone', direction: 'Incoming', matterId: 'matter-1', contactId: 'contact-1', contactName: 'Jane Grey', subject: 'Client Call - Questions About Testimony', body: 'Client called to discuss concerns about testifying. Answered questions about what to expect on the stand. Reviewed importance of answering only what is asked. Client feeling more confident. Call duration: 22 minutes.', from: 'jane.grey@gmail.com', to: 'sarah.chen@meadowlaw.com', date: subDays(today, 20).toISOString(), read: true, attachments: [], createdAt: subDays(today, 20).toISOString() },
    { id: 'comm-3', type: 'Email', direction: 'Incoming', matterId: 'matter-2', contactId: 'contact-3', contactName: 'Patricia Nguyen', subject: 'RE: Separation Agreement Review', body: 'Dear Sarah,\n\nThank you for sending the draft agreement. I have reviewed it with my accountant and have a few questions:\n\n1. Can we specify the exact buyout amount for the matrimonial home?\n2. The RRSP transfer - what are the tax implications?\n3. Regarding spousal support, my accountant suggests 4 years instead of 3.\n\nPlease advise at your earliest convenience.\n\nBest regards,\nPatricia', from: 'patricia.nguyen@email.com', to: 'sarah.chen@meadowlaw.com', date: subDays(today, 35).toISOString(), read: true, attachments: [], createdAt: subDays(today, 35).toISOString() },
    { id: 'comm-4', type: 'Email', direction: 'Outgoing', matterId: 'matter-2', contactId: 'contact-3', contactName: 'Patricia Nguyen', subject: 'Mediation Preparation - What to Expect', body: 'Dear Patricia,\n\nOur mediation is scheduled for ' + fmt(addDays(today, 12)) + '. Here is what you need to know:\n\n1. The mediator is neutral - they will help facilitate discussion\n2. Please bring your list of priorities\n3. Dress professionally\n4. Stay calm - we have a strong position\n\nI will meet with you 30 minutes before to review our strategy.\n\nBest,\nSarah', from: 'sarah.chen@meadowlaw.com', to: 'patricia.nguyen@email.com', date: subDays(today, 8).toISOString(), read: true, attachments: [], createdAt: subDays(today, 8).toISOString() },
    { id: 'comm-5', type: 'Email', direction: 'Outgoing', matterId: 'matter-3', contactId: 'contact-2', contactName: 'Robert Hartmann', subject: 'Merger Agreement - Version 3 Ready for Review', body: 'Dear Mr. Hartmann,\n\nPlease find attached the third draft of the merger agreement. Key changes in this version:\n\n1. Updated representations and warranties based on due diligence findings\n2. Adjusted earnout provisions per your instructions\n3. New confidentiality period extended to 5 years\n\nPlease review and provide comments by end of next week.\n\nBest regards,\nMarcus Rivera', from: 'marcus.rivera@meadowlaw.com', to: 'robert.hartmann@hartmannindustries.com', date: subDays(today, 20).toISOString(), read: true, attachments: [{ name: 'Hartmann_Merger_Agreement_v3.pdf', size: 523000 }], createdAt: subDays(today, 20).toISOString() },
    { id: 'comm-6', type: 'Phone', direction: 'Outgoing', matterId: 'matter-4', contactId: 'contact-4', contactName: 'Daniel Kim', subject: 'Call - Statement of Claim Review', body: 'Called client to review draft statement of claim. Discussed quantum of damages - agreed on $180,000 total claim (wrongful dismissal: $80K, lost benefits: $20K, bad faith: $80K). Client authorized proceeding with filing.', from: 'marcus.rivera@meadowlaw.com', to: 'daniel.kim@techcorp.com', date: subDays(today, 4).toISOString(), read: true, attachments: [], createdAt: subDays(today, 4).toISOString() },
    { id: 'comm-7', type: 'Email', direction: 'Incoming', matterId: 'matter-3', contactId: 'contact-2', contactName: 'Robert Hartmann', subject: 'RE: Merger Agreement - Board Approval', body: 'Marcus,\n\nGood news - the board approved the merger in principle last Thursday. They have requested a few minor changes (see comments in attached document). The target completion date remains end of this month. Please ensure all regulatory filings are in order.\n\nRegards,\nRobert Hartmann', from: 'robert.hartmann@hartmannindustries.com', to: 'marcus.rivera@meadowlaw.com', date: subDays(today, 7).toISOString(), read: true, attachments: [], createdAt: subDays(today, 7).toISOString() },
    { id: 'comm-8', type: 'Text', direction: 'Incoming', matterId: 'matter-5', contactId: 'contact-1', contactName: 'Jane Grey', subject: 'Question About Settlement Offer', body: 'Hi Sarah, just saw your email about the $45k offer from insurance. That seems very low given my ongoing physio and lost wages. Can we talk tomorrow? Available after 2pm.', from: '778-555-9988', to: 'sarah.chen@meadowlaw.com', date: subDays(today, 9).toISOString(), read: true, attachments: [], createdAt: subDays(today, 9).toISOString() },
    { id: 'comm-9', type: 'Email', direction: 'Outgoing', matterId: 'matter-5', contactId: 'contact-1', contactName: 'Jane Grey', subject: 'Settlement Update - Counter Offer Submitted', body: 'Dear Jane,\n\nAs discussed, we have submitted our counter-offer of $95,000 to Pacific Insurance. This is supported by:\n\n1. Dr. Adeyemi\'s expert report (8% permanent disability)\n2. Lost wage documentation ($35,000+)\n3. Future physiotherapy costs ($18,000)\n\nWe expect a response within 2 weeks. I will contact you immediately upon receipt.\n\nSarah', from: 'sarah.chen@meadowlaw.com', to: 'jane.grey@gmail.com', date: subDays(today, 9).toISOString(), read: true, attachments: [], createdAt: subDays(today, 9).toISOString() },
    { id: 'comm-10', type: 'Portal', direction: 'Incoming', matterId: 'matter-1', contactId: 'contact-1', contactName: 'Jane Grey', subject: 'Document Upload - Character Reference Letters', body: 'Client uploaded 3 character reference letters via client portal. Documents from: (1) employer Margaret Williams at BC Hydro, (2) community leader Pastor James Lee, (3) neighbor and family friend Lisa Tanaka.', from: 'jane.grey@gmail.com', to: 'meadowlaw_portal', date: subDays(today, 15).toISOString(), read: true, attachments: [{ name: 'Character_References.zip', size: 182000 }], createdAt: subDays(today, 15).toISOString() },
    { id: 'comm-11', type: 'Email', direction: 'Outgoing', matterId: 'matter-7', contactId: 'contact-3', contactName: 'Patricia Nguyen', subject: 'Custody Hearing Outcome', body: 'Dear Patricia,\n\nI am pleased to confirm the outcome of today\'s hearing. The court has awarded:\n\n- Primary residence with you\n- 40% parenting time for your former spouse\n- Child support: $1,850/month\n\nThis is a very good result. I will prepare the consent order over the next few days. The 30-day appeal period begins today.\n\nCongratulations,\nSarah Chen', from: 'sarah.chen@meadowlaw.com', to: 'patricia.nguyen@email.com', date: subDays(today, 15).toISOString(), read: true, attachments: [], createdAt: subDays(today, 15).toISOString() },
    { id: 'comm-12', type: 'Phone', direction: 'Incoming', matterId: 'matter-6', contactId: 'contact-2', contactName: 'Robert Hartmann', subject: 'Hartmann Industries - Landlord Harassment', body: 'Robert called to report additional pressure from landlord Westside Properties. Landlord has now threatened to terminate lease if demands not met in 30 days. Advised client not to respond directly - all communications through us. Will prepare cease and desist letter this week. Duration: 18 minutes.', from: 'robert.hartmann@hartmannindustries.com', to: 'marcus.rivera@meadowlaw.com', date: subDays(today, 5).toISOString(), read: false, attachments: [], createdAt: subDays(today, 5).toISOString() }
  ]

  const notifications = [
    { id: 'notif-1', type: 'task_due', title: 'Task overdue: File motion for discovery extension', message: 'This task was due 5 days ago and is still outstanding.', referenceType: 'task', referenceId: 'task-1', read: false, createdAt: subDays(today, 1).toISOString() },
    { id: 'notif-2', type: 'bill_overdue', title: 'Invoice overdue: INV-2024-009 ($3,775)', message: 'Invoice for Jane Grey - Slip and Fall Claim is 90+ days overdue.', referenceType: 'bill', referenceId: 'bill-4', read: false, createdAt: subDays(today, 2).toISOString() },
    { id: 'notif-3', type: 'event_reminder', title: 'Upcoming: Hartmann Board Presentation', message: 'Board presentation at Hartmann Industries is in 5 days.', referenceType: 'event', referenceId: 'event-2', read: false, createdAt: subDays(today, 1).toISOString() },
    { id: 'notif-4', type: 'task_due', title: 'Task due today: Update client on custody hearing', message: 'Call Patricia Nguyen to discuss custody hearing outcome - due today.', referenceType: 'task', referenceId: 'task-9', read: false, createdAt: today.toISOString() },
    { id: 'notif-5', type: 'matter_update', title: 'Matter status updated: Grey - Assault & Battery', message: 'Matter 00071-Grey-07.2021 has been updated. Trial date confirmed.', referenceType: 'matter', referenceId: 'matter-1', read: true, createdAt: subDays(today, 5).toISOString() },
    { id: 'notif-6', type: 'document_shared', title: 'New document: Kim - Termination Letter', message: 'Emily Park uploaded Termination Letter for Kim - Employment matter.', referenceType: 'document', referenceId: 'doc-9', read: true, createdAt: subDays(today, 7).toISOString() },
    { id: 'notif-7', type: 'bill_overdue', title: 'Invoice due soon: INV-2025-003 ($7,540)', message: 'Invoice for Robert Hartmann is due today.', referenceType: 'bill', referenceId: 'bill-3', read: true, createdAt: subDays(today, 3).toISOString() },
    { id: 'notif-8', type: 'event_reminder', title: 'Today: Client Meeting - Patricia Nguyen', message: 'Scheduled meeting with Patricia Nguyen at 11:00 AM today.', referenceType: 'event', referenceId: 'event-4', read: true, createdAt: today.toISOString() }
  ]

  const timer = {
    isRunning: false,
    startTime: null,
    elapsed: 0,
    matterId: null,
    description: '',
    billable: true
  }

  const firmSettings = {
    firmName: 'Meadow Law Group',
    address: {
      street: '1200 Main Street, Suite 400',
      city: 'Vancouver',
      state: 'BC',
      zip: 'V6B 1A1',
      country: 'Canada'
    },
    phone: '604-555-0100',
    website: 'www.meadowlaw.com',
    defaultBillingRate: 350,
    defaultPaymentTerms: 30,
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'America/Vancouver',
    practiceAreas: ['Criminal Law', 'Family Law', 'Personal Injury', 'Corporate', 'Immigration', 'Real Estate', 'Employment'],
    activityCategories: ['Document Review', 'Research', 'Court Appearance', 'Client Communication', 'Drafting', 'Travel', 'Administrative', 'Filing Fees', 'Copying', 'Expert Fees']
  }

  const folders = [
    { id: 'folder-1', name: 'Discovery' },
    { id: 'folder-2', name: 'Correspondence' },
    { id: 'folder-3', name: 'Pleadings' },
    { id: 'folder-4', name: 'Evidence' },
    { id: 'folder-5', name: 'Administrative' }
  ]

  return {
    users,
    currentUserId: 'user-1',
    contacts,
    matters,
    activities,
    tasks,
    calendarEvents,
    bills,
    documents,
    notes,
    communications,
    notifications,
    timer,
    firmSettings,
    folders,
    trustAccounts: [
      { id: 'ta-1', name: 'General Trust Account', bank: 'Royal Bank of Canada', accountNumber: '****4821', balance: 47250.00, type: 'Trust', status: 'Active', createdAt: '2023-01-15T10:00:00Z' },
      { id: 'ta-2', name: 'Real Estate Trust', bank: 'TD Canada Trust', accountNumber: '****7733', balance: 125000.00, type: 'Trust', status: 'Active', createdAt: '2023-06-01T10:00:00Z' },
      { id: 'ta-3', name: 'Operating Account', bank: 'Royal Bank of Canada', accountNumber: '****9102', balance: 83420.50, type: 'Operating', status: 'Active', createdAt: '2023-01-15T10:00:00Z' }
    ],
    trustTransactions: [
      { id: 'tt-1', accountId: 'ta-1', type: 'Deposit', amount: 15000.00, description: 'Retainer - Grey v. Thompson', matterId: 'matter-1', contactId: 'contact-1', date: fmt(subDays(today, 30)), createdAt: subDays(today, 30).toISOString() },
      { id: 'tt-2', accountId: 'ta-1', type: 'Withdrawal', amount: 4500.00, description: 'Invoice #2025-008 payment', matterId: 'matter-1', contactId: 'contact-1', date: fmt(subDays(today, 15)), createdAt: subDays(today, 15).toISOString() },
      { id: 'tt-3', accountId: 'ta-2', type: 'Deposit', amount: 125000.00, description: 'Property purchase deposit - Grey', matterId: 'matter-11', contactId: 'contact-1', date: fmt(subDays(today, 20)), createdAt: subDays(today, 20).toISOString() },
      { id: 'tt-4', accountId: 'ta-1', type: 'Deposit', amount: 10000.00, description: 'Retainer - Martinez divorce', matterId: 'matter-3', contactId: 'contact-3', date: fmt(subDays(today, 45)), createdAt: subDays(today, 45).toISOString() },
      { id: 'tt-5', accountId: 'ta-3', type: 'Deposit', amount: 28000.00, description: 'Revenue deposit - March 2025', matterId: null, contactId: null, date: fmt(subDays(today, 12)), createdAt: subDays(today, 12).toISOString() },
      { id: 'tt-6', accountId: 'ta-1', type: 'Withdrawal', amount: 3250.00, description: 'Filing fees - Kozlov injury', matterId: 'matter-13', contactId: 'contact-14', date: fmt(subDays(today, 5)), createdAt: subDays(today, 5).toISOString() }
    ],
    onlinePayments: {
      enabled: true,
      processor: 'Stripe',
      connectedAt: '2024-03-10T10:00:00Z',
      acceptedMethods: ['credit_card', 'bank_transfer'],
      surchargeEnabled: false,
      surchargeRate: 0,
      autoReminders: true,
      reminderDays: [7, 14, 30],
      paymentLinks: [
        { id: 'pl-1', billId: 'bill-4', url: 'https://pay.meadowlaw.com/inv/2025-010', status: 'Active', createdAt: fmt(subDays(today, 10)) },
        { id: 'pl-2', billId: 'bill-2', url: 'https://pay.meadowlaw.com/inv/2025-006', status: 'Paid', createdAt: fmt(subDays(today, 30)) }
      ],
      recentPayments: [
        { id: 'op-1', billId: 'bill-2', amount: 8750.00, method: 'credit_card', last4: '4242', contactName: 'Robert Hartmann', date: fmt(subDays(today, 25)), status: 'Completed' },
        { id: 'op-2', billId: 'bill-5', amount: 2100.00, method: 'bank_transfer', last4: '9988', contactName: 'Jane Grey', date: fmt(subDays(today, 18)), status: 'Completed' },
        { id: 'op-3', billId: 'bill-4', amount: 4200.00, method: 'credit_card', last4: '1234', contactName: 'Patricia Nguyen', date: fmt(subDays(today, 3)), status: 'Pending' }
      ]
    },
    appIntegrations: [
      { id: 'int-1', name: 'Google Calendar', icon: 'calendar', status: 'Connected', connectedAt: '2024-01-20T10:00:00Z', description: 'Sync calendar events with Google Calendar', category: 'Productivity' },
      { id: 'int-2', name: 'Dropbox', icon: 'cloud', status: 'Connected', connectedAt: '2024-02-15T10:00:00Z', description: 'Store and sync documents with Dropbox', category: 'Document Management' },
      { id: 'int-3', name: 'QuickBooks Online', icon: 'dollar', status: 'Disconnected', connectedAt: null, description: 'Sync invoices and payments with QuickBooks', category: 'Accounting' },
      { id: 'int-4', name: 'Microsoft 365', icon: 'mail', status: 'Connected', connectedAt: '2024-03-01T10:00:00Z', description: 'Email and document integration with Microsoft 365', category: 'Productivity' },
      { id: 'int-5', name: 'LawPay', icon: 'credit-card', status: 'Disconnected', connectedAt: null, description: 'Accept online payments through LawPay', category: 'Payments' },
      { id: 'int-6', name: 'Zoom', icon: 'video', status: 'Connected', connectedAt: '2024-05-10T10:00:00Z', description: 'Schedule and join Zoom meetings from Xlio', category: 'Communication' },
      { id: 'int-7', name: 'Slack', icon: 'message', status: 'Disconnected', connectedAt: null, description: 'Receive Xlio notifications in Slack channels', category: 'Communication' },
      { id: 'int-8', name: 'NetDocuments', icon: 'file', status: 'Disconnected', connectedAt: null, description: 'Enterprise document management integration', category: 'Document Management' }
    ],
    recentMatters: ['matter-1', 'matter-2', 'matter-3'],
    recentContacts: ['contact-1', 'contact-2', 'contact-3']
  }
}

export function initializeData(sid = null, customState = null) {
  const key = storageKey(sid)
  const ikey = initialKey(sid)

  if (customState) {
    const defaults = createInitialData()
    function deepMerge(base, override) {
      if (!override) return base
      const result = { ...base }
      for (const k of Object.keys(override)) {
        if (override[k] === null || override[k] === undefined) continue
        if (Array.isArray(override[k])) {
          result[k] = override[k]
        } else if (typeof override[k] === 'object' && typeof base[k] === 'object' && !Array.isArray(base[k])) {
          result[k] = deepMerge(base[k] || {}, override[k])
        } else {
          result[k] = override[k]
        }
      }
      return result
    }
    const merged = deepMerge(defaults, customState)
    localStorage.setItem(key, JSON.stringify(merged))
    localStorage.setItem(ikey, JSON.stringify(merged))
    return merged
  }

  const existingRaw = localStorage.getItem(key)
  if (existingRaw) {
    try { return JSON.parse(existingRaw) } catch {}
  }

  const initial = createInitialData()
  localStorage.setItem(key, JSON.stringify(initial))
  localStorage.setItem(ikey, JSON.stringify(initial))
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post'
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set', state: initial })
  }).catch(() => {})
  return initial
}

export function getState(sid = null) {
  const key = storageKey(sid)
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {}
  return createInitialData()
}

let syncTimer = null
export function setState(newState, sid = null) {
  const key = storageKey(sid)
  localStorage.setItem(key, JSON.stringify(newState))
  clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post'
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state: newState })
    }).catch(() => {})
  }, 500)
}

// Alias for consistency with other mocks
export const saveState = setState

export function getInitialState(sid = null) {
  const key = initialKey(sid)
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export function resetState(sid = null) {
  const ikey = initialKey(sid)
  const key = storageKey(sid)
  const initialRaw = localStorage.getItem(ikey)
  if (initialRaw) {
    localStorage.setItem(key, initialRaw)
    return JSON.parse(initialRaw)
  }
  const fresh = createInitialData()
  localStorage.setItem(key, JSON.stringify(fresh))
  localStorage.setItem(ikey, JSON.stringify(fresh))
  return fresh
}
