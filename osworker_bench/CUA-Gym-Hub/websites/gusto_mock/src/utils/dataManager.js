const BASE_KEY = 'gusto_mock_state'
const BASE_INITIAL_KEY = 'gusto_mock_initial_state'

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) {
    sessionStorage.setItem('gusto_sid', sid)
    return sid
  }
  return sessionStorage.getItem('gusto_sid') || null
}

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY

export const fetchCustomState = async (sid) => {
  if (!sid) return null
  try {
    const res = await fetch(`/state?sid=${sid}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.has_custom_state && data.stored_state) {
      return data.stored_state
    }
    return null
  } catch (e) {
    return null
  }
}

export const saveState = (state, sid = null) => {
  try {
    localStorage.setItem(storageKey(sid), JSON.stringify(state))
  } catch (e) {}
}

export const saveInitialState = (state, sid = null) => {
  try {
    localStorage.setItem(initialKey(sid), JSON.stringify(state))
  } catch (e) {}
}

export const loadState = (sid = null) => {
  try {
    const data = localStorage.getItem(storageKey(sid))
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}

export const loadInitialState = (sid = null) => {
  try {
    const data = localStorage.getItem(initialKey(sid))
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}

export const clearState = (sid = null) => {
  localStorage.removeItem(storageKey(sid))
  localStorage.removeItem(initialKey(sid))
}

export const syncToServer = async (state, sid = null) => {
  const useSid = sid || 'main'
  try {
    await fetch(`/post?sid=${useSid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state })
    })
  } catch (e) {}
}

export const deepMerge = (defaults, custom) => {
  if (!custom) return defaults
  const result = { ...defaults }
  for (const key of Object.keys(custom)) {
    if (custom[key] === null || custom[key] === undefined) continue
    if (Array.isArray(custom[key])) {
      result[key] = custom[key]
    } else if (typeof custom[key] === 'object' && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
      result[key] = deepMerge(defaults[key], custom[key])
    } else {
      result[key] = custom[key]
    }
  }
  return result
}

export const initializeData = (sid = null, customState = null) => {
  const isRefresh = localStorage.getItem(initialKey(sid)) !== null

  if (isRefresh && !customState) {
    const saved = loadState(sid)
    if (saved) return saved
  }

  const defaults = createInitialData()
  const data = customState ? deepMerge(defaults, customState) : defaults

  saveState(data, sid)
  if (!isRefresh) {
    saveInitialState(data, sid)
    // Notify server of set action
    const useSid = sid || 'main'
    fetch(`/post?sid=${useSid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state: data })
    }).catch(() => {})
  }

  return data
}

export const createInitialData = () => ({
  company: {
    id: 'comp_1',
    name: 'Horizon Tech Solutions',
    legalName: 'Horizon Tech Solutions, LLC',
    ein: '12-3456789',
    industry: 'Technology',
    entityType: 'LLC',
    phone: '(415) 555-0192',
    email: 'admin@horizontech.com',
    website: 'www.horizontech.com',
    foundedDate: '2019-03-15',
    address: {
      street1: '742 Innovation Drive',
      street2: 'Suite 300',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'US'
    },
    locations: [
      { id: 'loc_1', name: 'HQ - San Francisco', address: { street1: '742 Innovation Drive', street2: 'Suite 300', city: 'San Francisco', state: 'CA', zip: '94107' }, isMain: true },
      { id: 'loc_2', name: 'Austin Office', address: { street1: '200 Congress Ave', street2: '', city: 'Austin', state: 'TX', zip: '78701' }, isMain: false }
    ],
    departments: [
      { id: 'dept_1', name: 'Engineering', headcount: 8 },
      { id: 'dept_2', name: 'Sales', headcount: 4 },
      { id: 'dept_3', name: 'Marketing', headcount: 2 },
      { id: 'dept_4', name: 'Operations', headcount: 2 },
      { id: 'dept_5', name: 'Finance', headcount: 1 }
    ],
    paySchedule: {
      frequency: 'Every other week',
      nextPayday: '2025-04-25',
      nextDeadline: '2025-04-22T16:00:00-08:00'
    },
    bankAccount: {
      bankName: 'Silicon Valley Bank',
      accountType: 'Checking',
      routingNumber: '****6789',
      accountNumber: '****4321',
      status: 'verified'
    },
    settings: {
      notifications: {
        payrollReminders: true,
        timeOffRequests: true,
        newHireOnboarding: true
      },
      timezone: 'America/Los_Angeles'
    }
  },

  currentUser: {
    id: 'emp_1',
    firstName: 'Jessica',
    lastName: 'Jackson',
    email: 'jessica.jackson@horizontech.com',
    role: 'Admin',
    avatar: null,
    title: 'HR Director'
  },

  employees: [
    {
      id: 'emp_1',
      firstName: 'Jessica',
      lastName: 'Jackson',
      middleName: '',
      email: 'jessica.jackson@horizontech.com',
      personalEmail: 'jessica.j@gmail.com',
      phone: '(415) 555-0101',
      dateOfBirth: '1988-06-15',
      ssn: '***-**-1234',
      address: { street1: '123 Market St', street2: 'Apt 4B', city: 'San Francisco', state: 'CA', zip: '94105' },
      department: 'Operations',
      departmentId: 'dept_4',
      jobTitle: 'HR Director',
      managerId: null,
      managerName: null,
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 125000, per: 'Year' },
      startDate: '2019-03-15',
      status: 'Active',
      location: 'HQ - San Francisco',
      locationId: 'loc_1',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Married Filing Jointly',
      stateFilingStatus: 'Married Filing Jointly',
      allowances: 2,
      benefits: ['medical', 'dental', 'vision', '401k'],
      pto: { vacationBalance: 80, sickBalance: 40, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_2',
      firstName: 'Marcus',
      lastName: 'Chen',
      middleName: 'W',
      email: 'marcus.chen@horizontech.com',
      personalEmail: 'marcus.chen@outlook.com',
      phone: '(415) 555-0102',
      dateOfBirth: '1990-11-22',
      ssn: '***-**-5678',
      address: { street1: '456 Oak Avenue', street2: '', city: 'San Francisco', state: 'CA', zip: '94110' },
      department: 'Engineering',
      departmentId: 'dept_1',
      jobTitle: 'Senior Software Engineer',
      managerId: 'emp_5',
      managerName: 'Priya Patel',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 145000, per: 'Year' },
      startDate: '2020-01-13',
      status: 'Active',
      location: 'HQ - San Francisco',
      locationId: 'loc_1',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Single',
      stateFilingStatus: 'Single',
      allowances: 1,
      benefits: ['medical', 'dental', '401k'],
      pto: { vacationBalance: 64, sickBalance: 32, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_3',
      firstName: 'Sarah',
      lastName: 'Mitchell',
      middleName: 'A',
      email: 'sarah.mitchell@horizontech.com',
      personalEmail: 'sarahm@yahoo.com',
      phone: '(512) 555-0201',
      dateOfBirth: '1985-03-08',
      ssn: '***-**-9012',
      address: { street1: '789 Elm Street', street2: '', city: 'Austin', state: 'TX', zip: '78701' },
      department: 'Sales',
      departmentId: 'dept_2',
      jobTitle: 'Sales Manager',
      managerId: 'emp_1',
      managerName: 'Jessica Jackson',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 95000, per: 'Year' },
      startDate: '2020-06-01',
      status: 'Active',
      location: 'Austin Office',
      locationId: 'loc_2',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Married Filing Jointly',
      stateFilingStatus: 'Married Filing Jointly',
      allowances: 3,
      benefits: ['medical', 'dental', 'vision', '401k'],
      pto: { vacationBalance: 48, sickBalance: 24, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_4',
      firstName: 'David',
      lastName: 'Kim',
      middleName: '',
      email: 'david.kim@horizontech.com',
      personalEmail: 'dkim.personal@gmail.com',
      phone: '(415) 555-0104',
      dateOfBirth: '1992-07-30',
      ssn: '***-**-3456',
      address: { street1: '321 Pine Rd', street2: 'Unit 12', city: 'San Francisco', state: 'CA', zip: '94108' },
      department: 'Engineering',
      departmentId: 'dept_1',
      jobTitle: 'Software Engineer',
      managerId: 'emp_5',
      managerName: 'Priya Patel',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 115000, per: 'Year' },
      startDate: '2021-03-22',
      status: 'Active',
      location: 'HQ - San Francisco',
      locationId: 'loc_1',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Single',
      stateFilingStatus: 'Single',
      allowances: 1,
      benefits: ['medical', 'dental', '401k'],
      pto: { vacationBalance: 56, sickBalance: 28, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_5',
      firstName: 'Priya',
      lastName: 'Patel',
      middleName: '',
      email: 'priya.patel@horizontech.com',
      personalEmail: 'priya.p@gmail.com',
      phone: '(415) 555-0105',
      dateOfBirth: '1987-09-14',
      ssn: '***-**-7890',
      address: { street1: '555 Valencia St', street2: '', city: 'San Francisco', state: 'CA', zip: '94110' },
      department: 'Engineering',
      departmentId: 'dept_1',
      jobTitle: 'VP of Engineering',
      managerId: 'emp_1',
      managerName: 'Jessica Jackson',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 165000, per: 'Year' },
      startDate: '2019-05-20',
      status: 'Active',
      location: 'HQ - San Francisco',
      locationId: 'loc_1',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Married Filing Jointly',
      stateFilingStatus: 'Married Filing Jointly',
      allowances: 2,
      benefits: ['medical', 'dental', 'vision', '401k'],
      pto: { vacationBalance: 72, sickBalance: 36, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_6',
      firstName: 'Alex',
      lastName: 'Martin',
      middleName: 'R',
      email: 'alex.martin@horizontech.com',
      personalEmail: 'alexrmartin@gmail.com',
      phone: '(512) 555-0202',
      dateOfBirth: '1994-12-03',
      ssn: '***-**-2345',
      address: { street1: '100 Congress Ave', street2: 'Apt 8', city: 'Austin', state: 'TX', zip: '78701' },
      department: 'Sales',
      departmentId: 'dept_2',
      jobTitle: 'Sales Representative',
      managerId: 'emp_3',
      managerName: 'Sarah Mitchell',
      employmentType: 'Full-time',
      compensation: { type: 'Hourly', amount: 32.00, per: 'Hour' },
      startDate: '2022-08-15',
      status: 'Active',
      location: 'Austin Office',
      locationId: 'loc_2',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Single',
      stateFilingStatus: 'Single',
      allowances: 1,
      benefits: ['medical', 'dental'],
      pto: { vacationBalance: 40, sickBalance: 20, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_7',
      firstName: 'Emily',
      lastName: 'Lee',
      middleName: '',
      email: 'emily.lee@horizontech.com',
      personalEmail: 'emily.lee88@gmail.com',
      phone: '(415) 555-0107',
      dateOfBirth: '1991-04-18',
      ssn: '***-**-6789',
      address: { street1: '890 Howard St', street2: '', city: 'San Francisco', state: 'CA', zip: '94103' },
      department: 'Marketing',
      departmentId: 'dept_3',
      jobTitle: 'Marketing Manager',
      managerId: 'emp_1',
      managerName: 'Jessica Jackson',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 98000, per: 'Year' },
      startDate: '2021-01-11',
      status: 'Active',
      location: 'HQ - San Francisco',
      locationId: 'loc_1',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Single',
      stateFilingStatus: 'Single',
      allowances: 1,
      benefits: ['medical', 'dental', 'vision'],
      pto: { vacationBalance: 60, sickBalance: 32, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_8',
      firstName: 'Jordan',
      lastName: 'Townsend',
      middleName: 'B',
      email: 'jordan.townsend@horizontech.com',
      personalEmail: 'jtownsend@outlook.com',
      phone: '(415) 555-0108',
      dateOfBirth: '1993-08-25',
      ssn: '***-**-0123',
      address: { street1: '200 Folsom St', street2: 'Unit 5C', city: 'San Francisco', state: 'CA', zip: '94105' },
      department: 'Engineering',
      departmentId: 'dept_1',
      jobTitle: 'Frontend Developer',
      managerId: 'emp_5',
      managerName: 'Priya Patel',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 120000, per: 'Year' },
      startDate: '2022-02-14',
      status: 'Active',
      location: 'HQ - San Francisco',
      locationId: 'loc_1',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Single',
      stateFilingStatus: 'Single',
      allowances: 1,
      benefits: ['medical', 'dental', '401k'],
      pto: { vacationBalance: 52, sickBalance: 26, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_9',
      firstName: 'Rachel',
      lastName: 'Gonzalez',
      middleName: '',
      email: 'rachel.gonzalez@horizontech.com',
      personalEmail: 'rachel.g@gmail.com',
      phone: '(512) 555-0203',
      dateOfBirth: '1989-02-14',
      ssn: '***-**-4567',
      address: { street1: '350 Lamar Blvd', street2: '', city: 'Austin', state: 'TX', zip: '78703' },
      department: 'Sales',
      departmentId: 'dept_2',
      jobTitle: 'Account Executive',
      managerId: 'emp_3',
      managerName: 'Sarah Mitchell',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 85000, per: 'Year' },
      startDate: '2023-04-10',
      status: 'Active',
      location: 'Austin Office',
      locationId: 'loc_2',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Married Filing Jointly',
      stateFilingStatus: 'Married Filing Jointly',
      allowances: 2,
      benefits: ['medical', 'dental', 'vision', '401k'],
      pto: { vacationBalance: 32, sickBalance: 16, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_10',
      firstName: 'Tyler',
      lastName: 'Brooks',
      middleName: 'J',
      email: 'tyler.brooks@horizontech.com',
      personalEmail: 'tyler.brooks@proton.me',
      phone: '(415) 555-0110',
      dateOfBirth: '1996-10-07',
      ssn: '***-**-8901',
      address: { street1: '45 Guerrero St', street2: '', city: 'San Francisco', state: 'CA', zip: '94110' },
      department: 'Marketing',
      departmentId: 'dept_3',
      jobTitle: 'Content Specialist',
      managerId: 'emp_7',
      managerName: 'Emily Lee',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 72000, per: 'Year' },
      startDate: '2023-09-05',
      status: 'Active',
      location: 'HQ - San Francisco',
      locationId: 'loc_1',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Single',
      stateFilingStatus: 'Single',
      allowances: 1,
      benefits: ['medical', 'dental'],
      pto: { vacationBalance: 24, sickBalance: 12, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_11',
      firstName: 'Nina',
      lastName: 'Sharma',
      middleName: '',
      email: 'nina.sharma@horizontech.com',
      personalEmail: 'nina.sharma@gmail.com',
      phone: '(415) 555-0111',
      dateOfBirth: '1995-05-20',
      ssn: '***-**-5670',
      address: { street1: '678 Mission St', street2: 'Apt 2A', city: 'San Francisco', state: 'CA', zip: '94105' },
      department: 'Engineering',
      departmentId: 'dept_1',
      jobTitle: 'QA Engineer',
      managerId: 'emp_5',
      managerName: 'Priya Patel',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 105000, per: 'Year' },
      startDate: '2023-11-01',
      status: 'Active',
      location: 'HQ - San Francisco',
      locationId: 'loc_1',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Single',
      stateFilingStatus: 'Single',
      allowances: 1,
      benefits: ['medical', 'dental', '401k'],
      pto: { vacationBalance: 16, sickBalance: 8, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_12',
      firstName: 'Brian',
      lastName: 'Foster',
      middleName: '',
      email: 'brian.foster@horizontech.com',
      personalEmail: 'bfoster@gmail.com',
      phone: '(415) 555-0112',
      dateOfBirth: '1986-01-28',
      ssn: '***-**-2340',
      address: { street1: '900 Bryant St', street2: '', city: 'San Francisco', state: 'CA', zip: '94103' },
      department: 'Finance',
      departmentId: 'dept_5',
      jobTitle: 'Finance Manager',
      managerId: 'emp_1',
      managerName: 'Jessica Jackson',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 110000, per: 'Year' },
      startDate: '2020-09-14',
      status: 'Active',
      location: 'HQ - San Francisco',
      locationId: 'loc_1',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Married Filing Jointly',
      stateFilingStatus: 'Married Filing Jointly',
      allowances: 3,
      benefits: ['medical', 'dental', 'vision', '401k'],
      pto: { vacationBalance: 56, sickBalance: 28, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_13',
      firstName: 'Craig',
      lastName: 'Ellis',
      middleName: '',
      email: 'craig.ellis@horizontech.com',
      personalEmail: 'craig.ellis@gmail.com',
      phone: '(415) 555-0113',
      dateOfBirth: '1997-06-12',
      ssn: '***-**-3451',
      address: { street1: '150 Brannan St', street2: '', city: 'San Francisco', state: 'CA', zip: '94107' },
      department: 'Operations',
      departmentId: 'dept_4',
      jobTitle: 'Operations Coordinator',
      managerId: 'emp_1',
      managerName: 'Jessica Jackson',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 65000, per: 'Year' },
      startDate: '2025-04-14',
      status: 'Onboarding',
      location: 'HQ - San Francisco',
      locationId: 'loc_1',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Single',
      stateFilingStatus: 'Single',
      allowances: 1,
      benefits: [],
      pto: { vacationBalance: 0, sickBalance: 0, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_14',
      firstName: 'Olivia',
      lastName: 'Ramirez',
      middleName: 'M',
      email: 'olivia.ramirez@horizontech.com',
      personalEmail: 'olivia.ram@gmail.com',
      phone: '(415) 555-0114',
      dateOfBirth: '1993-09-02',
      ssn: '***-**-6782',
      address: { street1: '220 Potrero Ave', street2: 'Unit 3', city: 'San Francisco', state: 'CA', zip: '94103' },
      department: 'Engineering',
      departmentId: 'dept_1',
      jobTitle: 'DevOps Engineer',
      managerId: 'emp_5',
      managerName: 'Priya Patel',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 130000, per: 'Year' },
      startDate: '2024-02-12',
      status: 'Active',
      location: 'HQ - San Francisco',
      locationId: 'loc_1',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Single',
      stateFilingStatus: 'Single',
      allowances: 1,
      benefits: ['medical', 'dental', '401k'],
      pto: { vacationBalance: 48, sickBalance: 24, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_15',
      firstName: 'Derek',
      lastName: 'Huang',
      middleName: '',
      email: 'derek.huang@horizontech.com',
      personalEmail: 'dhuang.personal@outlook.com',
      phone: '(512) 555-0204',
      dateOfBirth: '1990-03-18',
      ssn: '***-**-9013',
      address: { street1: '450 S Lamar Blvd', street2: '', city: 'Austin', state: 'TX', zip: '78704' },
      department: 'Sales',
      departmentId: 'dept_2',
      jobTitle: 'Sales Development Rep',
      managerId: 'emp_3',
      managerName: 'Sarah Mitchell',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 68000, per: 'Year' },
      startDate: '2024-08-05',
      status: 'Active',
      location: 'Austin Office',
      locationId: 'loc_2',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Single',
      stateFilingStatus: 'Single',
      allowances: 1,
      benefits: ['medical', 'dental'],
      pto: { vacationBalance: 32, sickBalance: 16, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    },
    {
      id: 'emp_16',
      firstName: 'Maya',
      lastName: 'Thompson',
      middleName: 'L',
      email: 'maya.thompson@horizontech.com',
      personalEmail: 'maya.t@gmail.com',
      phone: '(415) 555-0116',
      dateOfBirth: '1991-12-09',
      ssn: '***-**-4568',
      address: { street1: '88 King St', street2: '', city: 'San Francisco', state: 'CA', zip: '94107' },
      department: 'Engineering',
      departmentId: 'dept_1',
      jobTitle: 'Backend Engineer',
      managerId: 'emp_5',
      managerName: 'Priya Patel',
      employmentType: 'Full-time',
      compensation: { type: 'Salary', amount: 135000, per: 'Year' },
      startDate: '2023-06-19',
      status: 'Active',
      location: 'HQ - San Francisco',
      locationId: 'loc_1',
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Married Filing Jointly',
      stateFilingStatus: 'Married Filing Jointly',
      allowances: 2,
      benefits: ['medical', 'dental', 'vision', '401k'],
      pto: { vacationBalance: 40, sickBalance: 20, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    }
  ],

  contractors: [
    {
      id: 'contr_1',
      firstName: 'Lisa',
      lastName: 'Wang',
      email: 'lisa.wang@freelance.com',
      phone: '(415) 555-0201',
      businessName: 'Wang Design Studio',
      type: 'Individual',
      compensation: { type: 'Hourly', amount: 85.00, per: 'Hour' },
      address: { street1: '400 Divisadero St', street2: '', city: 'San Francisco', state: 'CA', zip: '94117' },
      startDate: '2024-01-15',
      status: 'Active',
      payMethod: 'Direct Deposit',
      totalPaidYTD: 12750.00
    },
    {
      id: 'contr_2',
      firstName: 'Mike',
      lastName: 'Rivera',
      email: 'mike@riveraconsulting.com',
      phone: '(512) 555-0301',
      businessName: 'Rivera Consulting LLC',
      type: 'Business',
      compensation: { type: 'Fixed', amount: 5000.00, per: 'Month' },
      address: { street1: '600 Brazos St', street2: 'Suite 200', city: 'Austin', state: 'TX', zip: '78701' },
      startDate: '2024-06-01',
      status: 'Active',
      payMethod: 'Direct Deposit',
      totalPaidYTD: 20000.00
    },
    {
      id: 'contr_3',
      firstName: 'Anika',
      lastName: 'Johal',
      email: 'anika@johalcopy.com',
      phone: '(415) 555-0302',
      businessName: 'Johal Copywriting',
      type: 'Individual',
      compensation: { type: 'Hourly', amount: 65.00, per: 'Hour' },
      address: { street1: '33 Tehama St', street2: '', city: 'San Francisco', state: 'CA', zip: '94105' },
      startDate: '2025-01-06',
      status: 'Active',
      payMethod: 'Direct Deposit',
      totalPaidYTD: 7800.00
    }
  ],

  payrolls: [
    {
      id: 'pay_current',
      status: 'Draft',
      payPeriod: { startDate: '2025-04-07', endDate: '2025-04-18' },
      checkDate: '2025-04-25',
      deadline: '2025-04-22T16:00:00',
      totalGrossPay: 0,
      totalTaxes: 0,
      totalBenefits: 0,
      totalNetPay: 0,
      totalReimbursements: 0,
      employeeCompensations: []
    },
    {
      id: 'pay_3',
      status: 'Complete',
      payPeriod: { startDate: '2025-03-24', endDate: '2025-04-04' },
      checkDate: '2025-04-11',
      deadline: '2025-04-08T16:00:00',
      totalGrossPay: 65538.46,
      totalTaxes: 16384.62,
      totalBenefits: 5250.00,
      totalNetPay: 43903.84,
      totalReimbursements: 245.00,
      employeeCount: 15,
      debitDate: '2025-04-09'
    },
    {
      id: 'pay_2',
      status: 'Complete',
      payPeriod: { startDate: '2025-03-10', endDate: '2025-03-21' },
      checkDate: '2025-03-28',
      deadline: '2025-03-25T16:00:00',
      totalGrossPay: 64730.77,
      totalTaxes: 16182.69,
      totalBenefits: 5250.00,
      totalNetPay: 43298.08,
      totalReimbursements: 180.00,
      employeeCount: 15,
      debitDate: '2025-03-26'
    },
    {
      id: 'pay_1',
      status: 'Complete',
      payPeriod: { startDate: '2025-02-24', endDate: '2025-03-07' },
      checkDate: '2025-03-14',
      deadline: '2025-03-11T16:00:00',
      totalGrossPay: 64730.77,
      totalTaxes: 16182.69,
      totalBenefits: 5250.00,
      totalNetPay: 43298.08,
      totalReimbursements: 0,
      employeeCount: 15,
      debitDate: '2025-03-12'
    },
    {
      id: 'pay_0',
      status: 'Complete',
      payPeriod: { startDate: '2025-02-10', endDate: '2025-02-21' },
      checkDate: '2025-02-28',
      deadline: '2025-02-25T16:00:00',
      totalGrossPay: 64730.77,
      totalTaxes: 16182.69,
      totalBenefits: 5250.00,
      totalNetPay: 43298.08,
      totalReimbursements: 320.00,
      employeeCount: 15,
      debitDate: '2025-02-26'
    }
  ],

  timeEntries: [
    {
      id: 'te_1',
      employeeId: 'emp_6',
      weekStartDate: '2025-04-07',
      status: 'Pending',
      totalHours: 42.5,
      regularHours: 40,
      overtimeHours: 2.5,
      entries: [
        { date: '2025-04-07', clockIn: '08:00', clockOut: '17:00', breakMinutes: 30, totalHours: 8.5, notes: '' },
        { date: '2025-04-08', clockIn: '07:30', clockOut: '17:00', breakMinutes: 30, totalHours: 9.0, notes: '' },
        { date: '2025-04-09', clockIn: '08:00', clockOut: '17:30', breakMinutes: 30, totalHours: 9.0, notes: 'Client meeting ran long' },
        { date: '2025-04-10', clockIn: '08:00', clockOut: '17:00', breakMinutes: 30, totalHours: 8.5, notes: '' },
        { date: '2025-04-11', clockIn: '08:00', clockOut: '15:30', breakMinutes: 30, totalHours: 7.5, notes: '' }
      ]
    },
    {
      id: 'te_2',
      employeeId: 'emp_6',
      weekStartDate: '2025-03-31',
      status: 'Approved',
      totalHours: 40,
      regularHours: 40,
      overtimeHours: 0,
      entries: [
        { date: '2025-03-31', clockIn: '08:00', clockOut: '16:30', breakMinutes: 30, totalHours: 8.0, notes: '' },
        { date: '2025-04-01', clockIn: '08:00', clockOut: '16:30', breakMinutes: 30, totalHours: 8.0, notes: '' },
        { date: '2025-04-02', clockIn: '08:00', clockOut: '16:30', breakMinutes: 30, totalHours: 8.0, notes: '' },
        { date: '2025-04-03', clockIn: '08:00', clockOut: '16:30', breakMinutes: 30, totalHours: 8.0, notes: '' },
        { date: '2025-04-04', clockIn: '08:00', clockOut: '16:30', breakMinutes: 30, totalHours: 8.0, notes: '' }
      ]
    }
  ],

  timeOffRequests: [
    {
      id: 'tor_1',
      employeeId: 'emp_4',
      employeeName: 'David Kim',
      type: 'Vacation',
      startDate: '2025-04-28',
      endDate: '2025-05-02',
      totalHours: 40,
      status: 'Pending',
      reason: 'Family vacation',
      requestedAt: '2025-04-05T10:30:00',
      reviewedBy: null,
      reviewedAt: null
    },
    {
      id: 'tor_2',
      employeeId: 'emp_7',
      employeeName: 'Emily Lee',
      type: 'Sick',
      startDate: '2025-04-03',
      endDate: '2025-04-03',
      totalHours: 8,
      status: 'Approved',
      reason: 'Doctor appointment',
      requestedAt: '2025-04-02T08:15:00',
      reviewedBy: 'emp_1',
      reviewedAt: '2025-04-02T09:00:00'
    },
    {
      id: 'tor_3',
      employeeId: 'emp_2',
      employeeName: 'Marcus Chen',
      type: 'Vacation',
      startDate: '2025-05-19',
      endDate: '2025-05-23',
      totalHours: 40,
      status: 'Approved',
      reason: 'Conference travel',
      requestedAt: '2025-03-20T14:00:00',
      reviewedBy: 'emp_1',
      reviewedAt: '2025-03-20T16:30:00'
    },
    {
      id: 'tor_4',
      employeeId: 'emp_10',
      employeeName: 'Tyler Brooks',
      type: 'Personal',
      startDate: '2025-04-15',
      endDate: '2025-04-15',
      totalHours: 8,
      status: 'Pending',
      reason: 'Moving day',
      requestedAt: '2025-04-08T11:00:00',
      reviewedBy: null,
      reviewedAt: null
    },
    {
      id: 'tor_5',
      employeeId: 'emp_14',
      employeeName: 'Olivia Ramirez',
      type: 'Vacation',
      startDate: '2025-05-05',
      endDate: '2025-05-09',
      totalHours: 40,
      status: 'Pending',
      reason: 'Spring break trip',
      requestedAt: '2025-04-07T09:15:00',
      reviewedBy: null,
      reviewedAt: null
    },
    {
      id: 'tor_6',
      employeeId: 'emp_16',
      employeeName: 'Maya Thompson',
      type: 'Sick',
      startDate: '2025-04-08',
      endDate: '2025-04-09',
      totalHours: 16,
      status: 'Approved',
      reason: 'Flu recovery',
      requestedAt: '2025-04-08T07:00:00',
      reviewedBy: 'emp_1',
      reviewedAt: '2025-04-08T08:30:00'
    }
  ],

  benefitPlans: [
    {
      id: 'ben_1',
      type: 'Medical',
      planName: 'Blue Shield Gold PPO',
      provider: 'Blue Shield of California',
      monthlyCostEmployee: 250.00,
      monthlyCostEmployer: 450.00,
      coverage: 'Employee + Family',
      enrolledCount: 16,
      description: 'Comprehensive health coverage with low deductibles and wide network access.'
    },
    {
      id: 'ben_2',
      type: 'Dental',
      planName: 'Delta Dental PPO',
      provider: 'Delta Dental',
      monthlyCostEmployee: 35.00,
      monthlyCostEmployer: 45.00,
      coverage: 'Employee Only',
      enrolledCount: 16,
      description: 'Preventive and basic dental care with orthodontia coverage.'
    },
    {
      id: 'ben_3',
      type: 'Vision',
      planName: 'VSP Choice Plan',
      provider: 'VSP Vision Care',
      monthlyCostEmployee: 15.00,
      monthlyCostEmployer: 15.00,
      coverage: 'Employee Only',
      enrolledCount: 9,
      description: 'Annual eye exams, lenses, and frames allowance.'
    },
    {
      id: 'ben_4',
      type: '401(k)',
      planName: 'Guideline 401(k)',
      provider: 'Guideline',
      monthlyCostEmployee: 0,
      monthlyCostEmployer: 0,
      employeeContributionPercent: '3-10%',
      employerMatchPercent: '4% match',
      enrolledCount: 13,
      description: 'Retirement savings with employer matching up to 4% of salary.'
    }
  ],

  taxForms: [
    { id: 'tf_1', type: 'W-2', year: 2024, status: 'Filed', filedDate: '2025-01-31', description: 'Wage and Tax Statement for all employees' },
    { id: 'tf_2', type: '1099-NEC', year: 2024, status: 'Filed', filedDate: '2025-01-31', description: 'Nonemployee Compensation for contractors' },
    { id: 'tf_3', type: '941', quarter: 'Q1 2025', status: 'Filed', filedDate: '2025-04-01', description: "Employer's Quarterly Federal Tax Return" },
    { id: 'tf_4', type: '940', year: 2024, status: 'Filed', filedDate: '2025-01-31', description: "Employer's Annual Federal Unemployment Tax Return" },
    { id: 'tf_5', type: 'DE 9', quarter: 'Q1 2025', status: 'Filed', filedDate: '2025-04-01', description: 'California Quarterly Contribution Return' },
    { id: 'tf_6', type: '941', quarter: 'Q2 2025', status: 'Upcoming', filedDate: null, description: "Employer's Quarterly Federal Tax Return" }
  ],

  documents: [
    { id: 'doc_1', name: 'Employee Handbook 2025', type: 'Company', category: 'Policies', uploadedDate: '2025-01-05', uploadedBy: 'Jessica Jackson', size: '2.4 MB' },
    { id: 'doc_2', name: 'I-9 Employment Eligibility', type: 'Employee Form', category: 'Compliance', employeeId: 'emp_13', uploadedDate: '2025-04-01', uploadedBy: 'Craig Ellis', size: '180 KB' },
    { id: 'doc_3', name: 'W-4 Withholding Certificate', type: 'Employee Form', category: 'Tax', employeeId: 'emp_13', uploadedDate: '2025-04-01', uploadedBy: 'Craig Ellis', size: '95 KB' },
    { id: 'doc_4', name: 'Offer Letter - Craig Ellis', type: 'Offer Letter', category: 'Hiring', employeeId: 'emp_13', uploadedDate: '2025-03-20', uploadedBy: 'Jessica Jackson', size: '120 KB' },
    { id: 'doc_5', name: 'Q1 2025 Payroll Summary', type: 'Report', category: 'Payroll', uploadedDate: '2025-04-02', uploadedBy: 'System', size: '340 KB' }
  ],

  todoItems: [
    {
      id: 'todo_1',
      title: 'Run payroll',
      description: 'Payroll for Apr 7 - Apr 18 is due by Apr 22',
      type: 'payroll',
      priority: 'high',
      dueDate: '2025-04-22',
      status: 'pending',
      actionUrl: '/payroll/run',
      relatedId: 'pay_current'
    },
    {
      id: 'todo_2',
      title: 'Complete onboarding for Craig Ellis',
      description: 'Craig starts on Apr 14. Review and approve his onboarding checklist.',
      type: 'onboarding',
      priority: 'high',
      dueDate: '2025-04-14',
      status: 'pending',
      actionUrl: '/people/team-members/emp_13',
      relatedId: 'emp_13'
    },
    {
      id: 'todo_3',
      title: 'Review time off requests',
      description: '3 pending time off requests need your review',
      type: 'general',
      priority: 'medium',
      dueDate: null,
      status: 'pending',
      actionUrl: '/time-tools/time-off',
      relatedId: null
    },
    {
      id: 'todo_4',
      title: 'Approve time entries',
      description: "Alex Martin's hours for this week are pending approval",
      type: 'general',
      priority: 'medium',
      dueDate: null,
      status: 'pending',
      actionUrl: '/time-tools/time-tracking',
      relatedId: 'te_1'
    }
  ],

  onboardingChecklists: [
    {
      id: 'onb_1',
      employeeId: 'emp_13',
      employeeName: 'Craig Ellis',
      startDate: '2025-04-14',
      tasks: [
        { id: 'onb_t1', title: 'Send offer letter', status: 'completed', completedDate: '2025-03-20', dueDate: '2025-03-25' },
        { id: 'onb_t2', title: 'Add to payroll', status: 'completed', completedDate: '2025-04-01', dueDate: '2025-04-07' },
        { id: 'onb_t3', title: 'Enroll in health insurance', status: 'pending', completedDate: null, dueDate: '2025-04-18' },
        { id: 'onb_t4', title: 'Create user accounts', status: 'pending', completedDate: null, dueDate: '2025-04-14' },
        { id: 'onb_t5', title: 'Order welcome supplies', status: 'pending', completedDate: null, dueDate: '2025-04-11' },
        { id: 'onb_t6', title: 'Schedule orientation meeting', status: 'pending', completedDate: null, dueDate: '2025-04-14' }
      ]
    }
  ],

  performanceReviews: [
    {
      id: 'pr_1',
      employeeId: 'emp_2',
      employeeName: 'Marcus Chen',
      reviewerId: 'emp_5',
      reviewerName: 'Priya Patel',
      period: 'Q1 2025',
      status: 'Completed',
      overallRating: 4,
      submittedDate: '2025-04-01',
      categories: [
        { name: 'Technical Skills', rating: 5, comment: 'Exceptional code quality and architecture decisions.' },
        { name: 'Communication', rating: 4, comment: 'Clear and concise in technical discussions.' },
        { name: 'Teamwork', rating: 4, comment: 'Great mentor to junior engineers.' },
        { name: 'Initiative', rating: 3, comment: 'Could propose more improvements proactively.' }
      ],
      summary: 'Marcus continues to be a top performer on the engineering team. His technical skills are outstanding, and he mentors well.'
    },
    {
      id: 'pr_2',
      employeeId: 'emp_4',
      employeeName: 'David Kim',
      reviewerId: 'emp_5',
      reviewerName: 'Priya Patel',
      period: 'Q1 2025',
      status: 'Completed',
      overallRating: 3,
      submittedDate: '2025-04-02',
      categories: [
        { name: 'Technical Skills', rating: 3, comment: 'Solid execution on assigned tasks.' },
        { name: 'Communication', rating: 3, comment: 'Room to improve on status updates.' },
        { name: 'Teamwork', rating: 4, comment: 'Always willing to help teammates.' },
        { name: 'Initiative', rating: 3, comment: 'Meets expectations on deliverables.' }
      ],
      summary: 'David is a dependable team member. He should focus on being more proactive with communication and taking on stretch goals.'
    },
    {
      id: 'pr_3',
      employeeId: 'emp_7',
      employeeName: 'Emily Lee',
      reviewerId: 'emp_1',
      reviewerName: 'Jessica Jackson',
      period: 'Q1 2025',
      status: 'Pending',
      overallRating: null,
      submittedDate: null,
      categories: [],
      summary: ''
    },
    {
      id: 'pr_4',
      employeeId: 'emp_3',
      employeeName: 'Sarah Mitchell',
      reviewerId: 'emp_1',
      reviewerName: 'Jessica Jackson',
      period: 'Q1 2025',
      status: 'Pending',
      overallRating: null,
      submittedDate: null,
      categories: [],
      summary: ''
    },
    {
      id: 'pr_5',
      employeeId: 'emp_8',
      employeeName: 'Jordan Townsend',
      reviewerId: 'emp_5',
      reviewerName: 'Priya Patel',
      period: 'Q1 2025',
      status: 'Completed',
      overallRating: 4,
      submittedDate: '2025-04-03',
      categories: [
        { name: 'Technical Skills', rating: 4, comment: 'Strong frontend skills, quick learner.' },
        { name: 'Communication', rating: 5, comment: 'Excellent at cross-team collaboration.' },
        { name: 'Teamwork', rating: 4, comment: 'Active contributor to code reviews.' },
        { name: 'Initiative', rating: 4, comment: 'Proactively improved our CI/CD pipeline.' }
      ],
      summary: 'Jordan has shown strong growth this quarter. Excellent communication skills and a proactive attitude.'
    }
  ],

  companyHolidays: [
    { id: 'hol_1', name: "New Year's Day", date: '2025-01-01' },
    { id: 'hol_2', name: 'Martin Luther King Jr. Day', date: '2025-01-20' },
    { id: 'hol_3', name: "Presidents' Day", date: '2025-02-17' },
    { id: 'hol_4', name: 'Memorial Day', date: '2025-05-26' },
    { id: 'hol_5', name: 'Independence Day', date: '2025-07-04' },
    { id: 'hol_6', name: 'Labor Day', date: '2025-09-01' },
    { id: 'hol_7', name: 'Thanksgiving Day', date: '2025-11-27' },
    { id: 'hol_8', name: 'Day after Thanksgiving', date: '2025-11-28' },
    { id: 'hol_9', name: 'Christmas Day', date: '2025-12-25' }
  ],

  notifications: [
    { id: 'notif_1', message: 'Payroll submitted successfully', type: 'payroll', read: false, timestamp: '2025-04-09T10:00:00', actionUrl: '/payroll/history' },
    { id: 'notif_2', message: 'David Kim requested time off', type: 'timeoff', read: false, timestamp: '2025-04-05T10:30:00', actionUrl: '/time-tools/time-off' },
    { id: 'notif_3', message: 'Craig Ellis completed I-9 form', type: 'onboarding', read: false, timestamp: '2025-04-01T09:00:00', actionUrl: '/people/team-members/emp_13' }
  ],

  reportHistory: [],

  referrals: []
})
