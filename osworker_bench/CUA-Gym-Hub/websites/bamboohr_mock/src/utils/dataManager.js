const BASE_KEY = 'bamboohr_state';
const BASE_INITIAL_KEY = 'bamboohr_initial_state';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('bamboohr_sid', sid);
    return sid;
  }
  return sessionStorage.getItem('bamboohr_sid') || null;
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

export const fetchCustomState = async (sid) => {
  if (!sid) return null;
  try {
    const res = await fetch(`/state?sid=${sid}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.initial_state || null;
  } catch {
    return null;
  }
};

function deepMerge(base, override) {
  if (override === null || override === undefined) return base;
  if (Array.isArray(override)) return override;
  if (typeof override !== 'object') return override;
  if (typeof base !== 'object' || base === null) return override;
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (override[key] === null || override[key] === undefined) continue;
    if (Array.isArray(override[key])) {
      result[key] = override[key];
    } else if (typeof override[key] === 'object') {
      result[key] = deepMerge(base[key] || {}, override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

export function initializeData(sid = null, customState = null) {
  const sk = storageKey(sid);
  const ik = initialKey(sid);
  const stored = localStorage.getItem(sk);
  const storedInitial = localStorage.getItem(ik);

  if (stored && storedInitial) {
    // Refresh: load from localStorage
    return JSON.parse(stored);
  }

  // First load: build initial data
  const defaults = createInitialData();
  const merged = customState ? deepMerge(defaults, customState) : defaults;

  localStorage.setItem(ik, JSON.stringify(merged));
  localStorage.setItem(sk, JSON.stringify(merged));

  // Sync initial state to server
  const effectiveSid = sid || (typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('sid') || null) : null);
  if (effectiveSid) {
    fetch(`/post?sid=${encodeURIComponent(effectiveSid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state: merged })
    }).catch(() => {});
  }

  return merged;
}

export function saveState(state, sid = null) {
  const sk = storageKey(sid);
  localStorage.setItem(sk, JSON.stringify(state));
  // Debounced sync to server if we have a sid
  if (sid) {
    if (saveState._timer) clearTimeout(saveState._timer);
    saveState._timer = setTimeout(() => {
      fetch(`/post?sid=${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state })
      }).catch(() => {});
    }, 500);
  }
}

export function getInitialState(sid = null) {
  const ik = initialKey(sid);
  const stored = localStorage.getItem(ik);
  if (stored) return JSON.parse(stored);
  return createInitialData();
}

export function createInitialData() {
  return {
    currentUser: {
      employeeId: 1,
      role: 'admin',
      companyName: 'Efficient Office Solutions',
      companyLogo: null
    },

    departments: [
      { id: 1, name: 'Human Resources', headId: 5 },
      { id: 2, name: 'Engineering', headId: 8 },
      { id: 3, name: 'Sales', headId: 12 },
      { id: 4, name: 'Marketing', headId: 15 },
      { id: 5, name: 'Customer Support', headId: 18 },
      { id: 6, name: 'Finance', headId: 20 },
      { id: 7, name: 'Operations', headId: 22 },
      { id: 8, name: 'IT', headId: 24 },
      { id: 9, name: 'Legal', headId: 26 },
      { id: 10, name: 'Leadership', headId: 28 }
    ],

    locations: [
      { id: 1, name: 'San Francisco HQ', address: '100 Market St, San Francisco, CA 94105', timezone: 'America/Los_Angeles' },
      { id: 2, name: 'New York Office', address: '200 Park Ave, New York, NY 10166', timezone: 'America/New_York' },
      { id: 3, name: 'Remote', address: '', timezone: '' }
    ],

    divisions: [
      { id: 1, name: 'Western States' },
      { id: 2, name: 'Eastern States' },
      { id: 3, name: 'North America' }
    ],

    employees: [
      // 1 - Current user: Charlotte Abbott
      {
        id: 1, firstName: 'Charlotte', middleName: 'Danielle', lastName: 'Abbott',
        preferredName: 'Charlie', displayName: 'Charlotte Danielle Abbott',
        avatar: null, email: 'cabbott@efficientoffice.com', homeEmail: 'charlotte@gmail.com',
        workPhone: '415-555-1237', workPhoneExt: '1272', mobilePhone: '415-555-8965', homePhone: '',
        dateOfBirth: '1985-06-15', gender: 'Female', maritalStatus: 'Married',
        address1: '123 Main St', address2: 'Apt 4B', city: 'San Francisco',
        state: 'California', zipcode: '94102', country: 'United States',
        hireDate: '2011-08-08', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Sr. HR Administrator',
        departmentId: 1, locationId: 1, divisionId: 1, reportsToId: 5,
        employeeNumber: '1', payRate: 85000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: 'https://linkedin.com/in/charlotteabbott', twitter: '', facebook: '' },
        emergencyContactName: 'John Abbott', emergencyContactPhone: '415-555-0000', emergencyContactRelation: 'Spouse',
        ssn: '•••-••-4521'
      },
      // 2 - Brandon Bell
      {
        id: 2, firstName: 'Brandon', middleName: '', lastName: 'Bell',
        preferredName: '', displayName: 'Brandon Bell',
        avatar: null, email: 'bbell@efficientoffice.com', homeEmail: 'brandon@gmail.com',
        workPhone: '415-555-2341', workPhoneExt: '2341', mobilePhone: '415-555-7823', homePhone: '',
        dateOfBirth: '1990-03-22', gender: 'Male', maritalStatus: 'Single',
        address1: '456 Oak Ave', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94110', country: 'United States',
        hireDate: '2018-03-15', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'HR Specialist',
        departmentId: 1, locationId: 1, divisionId: 1, reportsToId: 5,
        employeeNumber: '2', payRate: 65000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Lisa Bell', emergencyContactPhone: '415-555-1111', emergencyContactRelation: 'Parent',
        ssn: '•••-••-7823'
      },
      // 3 - Amy Granger
      {
        id: 3, firstName: 'Amy', middleName: '', lastName: 'Granger',
        preferredName: '', displayName: 'Amy Granger',
        avatar: null, email: 'agranger@efficientoffice.com', homeEmail: 'amy.granger@yahoo.com',
        workPhone: '415-555-3456', workPhoneExt: '3456', mobilePhone: '415-555-9012', homePhone: '',
        dateOfBirth: '1993-11-08', gender: 'Female', maritalStatus: 'Single',
        address1: '789 Pine St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94115', country: 'United States',
        hireDate: '2021-06-01', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'HR Coordinator',
        departmentId: 1, locationId: 1, divisionId: 1, reportsToId: 5,
        employeeNumber: '3', payRate: 52000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Mike Granger', emergencyContactPhone: '510-555-2222', emergencyContactRelation: 'Sibling',
        ssn: '•••-••-3456'
      },
      // 4 - Daniel John (CEO)
      {
        id: 4, firstName: 'Daniel', middleName: 'Robert', lastName: 'John',
        preferredName: 'Dan', displayName: 'Daniel Robert John',
        avatar: null, email: 'djohn@efficientoffice.com', homeEmail: 'daniel@gmail.com',
        workPhone: '415-555-1000', workPhoneExt: '1000', mobilePhone: '415-555-5000', homePhone: '',
        dateOfBirth: '1970-01-15', gender: 'Male', maritalStatus: 'Married',
        address1: '1 CEO Lane', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94105', country: 'United States',
        hireDate: '2010-01-01', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Chief Executive Officer',
        departmentId: 10, locationId: 1, divisionId: 3, reportsToId: null,
        employeeNumber: '4', payRate: 280000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: 'https://linkedin.com/in/danieljohn', twitter: '', facebook: '' },
        emergencyContactName: 'Patricia John', emergencyContactPhone: '415-555-0001', emergencyContactRelation: 'Spouse',
        ssn: '•••-••-1000'
      },
      // 5 - Jennifer Caldwell (VP HR)
      {
        id: 5, firstName: 'Jennifer', middleName: '', lastName: 'Caldwell',
        preferredName: '', displayName: 'Jennifer Caldwell',
        avatar: null, email: 'jcaldwell@efficientoffice.com', homeEmail: 'jcaldwell@hotmail.com',
        workPhone: '415-555-1100', workPhoneExt: '1100', mobilePhone: '415-555-6100', homePhone: '',
        dateOfBirth: '1975-09-20', gender: 'Female', maritalStatus: 'Married',
        address1: '567 Broadway', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94133', country: 'United States',
        hireDate: '2012-03-10', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'VP of Human Resources',
        departmentId: 1, locationId: 1, divisionId: 3, reportsToId: 4,
        employeeNumber: '5', payRate: 145000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Robert Caldwell', emergencyContactPhone: '415-555-2200', emergencyContactRelation: 'Spouse',
        ssn: '•••-••-1100'
      },
      // 6 - Marcus Chen (VP Engineering)
      {
        id: 6, firstName: 'Marcus', middleName: '', lastName: 'Chen',
        preferredName: '', displayName: 'Marcus Chen',
        avatar: null, email: 'mchen@efficientoffice.com', homeEmail: 'marcus.chen@gmail.com',
        workPhone: '415-555-2000', workPhoneExt: '2000', mobilePhone: '415-555-7000', homePhone: '',
        dateOfBirth: '1978-05-12', gender: 'Male', maritalStatus: 'Married',
        address1: '234 Mission St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94105', country: 'United States',
        hireDate: '2013-07-15', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'VP of Engineering',
        departmentId: 2, locationId: 1, divisionId: 1, reportsToId: 4,
        employeeNumber: '6', payRate: 185000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Mei Chen', emergencyContactPhone: '415-555-3000', emergencyContactRelation: 'Spouse',
        ssn: '•••-••-2000'
      },
      // 7 - Sarah Mitchell (VP Sales)
      {
        id: 7, firstName: 'Sarah', middleName: '', lastName: 'Mitchell',
        preferredName: '', displayName: 'Sarah Mitchell',
        avatar: null, email: 'smitchell@efficientoffice.com', homeEmail: 'sarah.m@gmail.com',
        workPhone: '415-555-3000', workPhoneExt: '3000', mobilePhone: '415-555-8000', homePhone: '',
        dateOfBirth: '1980-12-03', gender: 'Female', maritalStatus: 'Single',
        address1: '890 Market St', address2: 'Suite 200', city: 'San Francisco',
        state: 'California', zipcode: '94102', country: 'United States',
        hireDate: '2015-02-20', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'VP of Sales',
        departmentId: 3, locationId: 1, divisionId: 1, reportsToId: 4,
        employeeNumber: '7', payRate: 160000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'John Mitchell', emergencyContactPhone: '415-555-4000', emergencyContactRelation: 'Parent',
        ssn: '•••-••-3000'
      },
      // 8 - David Park (Sr. Software Engineer)
      {
        id: 8, firstName: 'David', middleName: '', lastName: 'Park',
        preferredName: '', displayName: 'David Park',
        avatar: null, email: 'dpark@efficientoffice.com', homeEmail: 'david.park@gmail.com',
        workPhone: '415-555-2100', workPhoneExt: '2100', mobilePhone: '415-555-7100', homePhone: '',
        dateOfBirth: '1988-07-25', gender: 'Male', maritalStatus: 'Single',
        address1: '432 Castro St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94114', country: 'United States',
        hireDate: '2017-09-01', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Sr. Software Engineer',
        departmentId: 2, locationId: 1, divisionId: 1, reportsToId: 6,
        employeeNumber: '8', payRate: 145000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Janet Park', emergencyContactPhone: '415-555-5100', emergencyContactRelation: 'Parent',
        ssn: '•••-••-2100'
      },
      // 9 - Emily Torres (Software Engineer)
      {
        id: 9, firstName: 'Emily', middleName: '', lastName: 'Torres',
        preferredName: '', displayName: 'Emily Torres',
        avatar: null, email: 'etorres@efficientoffice.com', homeEmail: 'emily.torres@gmail.com',
        workPhone: '415-555-2200', workPhoneExt: '2200', mobilePhone: '415-555-7200', homePhone: '',
        dateOfBirth: '1992-04-18', gender: 'Female', maritalStatus: 'Single',
        address1: '654 Valencia St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94110', country: 'United States',
        hireDate: '2019-05-13', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Software Engineer',
        departmentId: 2, locationId: 1, divisionId: 1, reportsToId: 6,
        employeeNumber: '9', payRate: 120000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Carlos Torres', emergencyContactPhone: '510-555-6200', emergencyContactRelation: 'Parent',
        ssn: '•••-••-2200'
      },
      // 10 - James Kim (QA Engineer)
      {
        id: 10, firstName: 'James', middleName: '', lastName: 'Kim',
        preferredName: '', displayName: 'James Kim',
        avatar: null, email: 'jkim@efficientoffice.com', homeEmail: 'james.kim@gmail.com',
        workPhone: '415-555-2300', workPhoneExt: '2300', mobilePhone: '415-555-7300', homePhone: '',
        dateOfBirth: '1991-10-30', gender: 'Male', maritalStatus: 'Married',
        address1: '876 Haight St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94117', country: 'United States',
        hireDate: '2020-08-10', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'QA Engineer',
        departmentId: 2, locationId: 1, divisionId: 1, reportsToId: 6,
        employeeNumber: '10', payRate: 95000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Grace Kim', emergencyContactPhone: '415-555-7400', emergencyContactRelation: 'Spouse',
        ssn: '•••-••-2300'
      },
      // 11 - Rachel Wong (Frontend Developer)
      {
        id: 11, firstName: 'Rachel', middleName: '', lastName: 'Wong',
        preferredName: '', displayName: 'Rachel Wong',
        avatar: null, email: 'rwong@efficientoffice.com', homeEmail: 'rachel.wong@gmail.com',
        workPhone: '415-555-2400', workPhoneExt: '2400', mobilePhone: '415-555-7400', homePhone: '',
        dateOfBirth: '1994-02-14', gender: 'Female', maritalStatus: 'Single',
        address1: '321 Sunset Blvd', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94122', country: 'United States',
        hireDate: '2022-03-07', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Frontend Developer',
        departmentId: 2, locationId: 3, divisionId: 1, reportsToId: 6,
        employeeNumber: '11', payRate: 110000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Peter Wong', emergencyContactPhone: '415-555-8400', emergencyContactRelation: 'Parent',
        ssn: '•••-••-2400'
      },
      // 12 - Michael Adams (Account Executive)
      {
        id: 12, firstName: 'Michael', middleName: '', lastName: 'Adams',
        preferredName: 'Mike', displayName: 'Michael Adams',
        avatar: null, email: 'madams@efficientoffice.com', homeEmail: 'mike.adams@gmail.com',
        workPhone: '415-555-3100', workPhoneExt: '3100', mobilePhone: '415-555-8100', homePhone: '',
        dateOfBirth: '1986-08-19', gender: 'Male', maritalStatus: 'Married',
        address1: '567 Fillmore St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94117', country: 'United States',
        hireDate: '2016-04-25', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Account Executive',
        departmentId: 3, locationId: 1, divisionId: 1, reportsToId: 7,
        employeeNumber: '12', payRate: 90000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Lisa Adams', emergencyContactPhone: '415-555-9100', emergencyContactRelation: 'Spouse',
        ssn: '•••-••-3100'
      },
      // 13 - Nicole Rodriguez (Sales Dev Rep)
      {
        id: 13, firstName: 'Nicole', middleName: '', lastName: 'Rodriguez',
        preferredName: '', displayName: 'Nicole Rodriguez',
        avatar: null, email: 'nrodriguez@efficientoffice.com', homeEmail: 'nicole.r@gmail.com',
        workPhone: '415-555-3200', workPhoneExt: '3200', mobilePhone: '415-555-8200', homePhone: '',
        dateOfBirth: '1995-05-27', gender: 'Female', maritalStatus: 'Single',
        address1: '789 Irving St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94122', country: 'United States',
        hireDate: '2023-01-10', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Sales Development Representative',
        departmentId: 3, locationId: 1, divisionId: 1, reportsToId: 7,
        employeeNumber: '13', payRate: 58000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Maria Rodriguez', emergencyContactPhone: '415-555-0200', emergencyContactRelation: 'Parent',
        ssn: '•••-••-3200'
      },
      // 14 - Tom Nguyen (Account Executive)
      {
        id: 14, firstName: 'Tom', middleName: '', lastName: 'Nguyen',
        preferredName: '', displayName: 'Tom Nguyen',
        avatar: null, email: 'tnguyen@efficientoffice.com', homeEmail: 'tom.nguyen@yahoo.com',
        workPhone: '212-555-3300', workPhoneExt: '3300', mobilePhone: '212-555-8300', homePhone: '',
        dateOfBirth: '1989-07-14', gender: 'Male', maritalStatus: 'Single',
        address1: '100 Broadway', address2: 'Apt 5C', city: 'New York',
        state: 'New York', zipcode: '10005', country: 'United States',
        hireDate: '2019-11-04', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Account Executive',
        departmentId: 3, locationId: 2, divisionId: 2, reportsToId: 7,
        employeeNumber: '14', payRate: 88000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Lan Nguyen', emergencyContactPhone: '212-555-4300', emergencyContactRelation: 'Parent',
        ssn: '•••-••-3300'
      },
      // 15 - Jessica Liu (Marketing Director)
      {
        id: 15, firstName: 'Jessica', middleName: '', lastName: 'Liu',
        preferredName: '', displayName: 'Jessica Liu',
        avatar: null, email: 'jliu@efficientoffice.com', homeEmail: 'jessica.liu@gmail.com',
        workPhone: '415-555-4000', workPhoneExt: '4000', mobilePhone: '415-555-9000', homePhone: '',
        dateOfBirth: '1982-03-08', gender: 'Female', maritalStatus: 'Married',
        address1: '901 Sacramento St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94108', country: 'United States',
        hireDate: '2014-09-22', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Director of Marketing',
        departmentId: 4, locationId: 1, divisionId: 1, reportsToId: 4,
        employeeNumber: '15', payRate: 135000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Kevin Liu', emergencyContactPhone: '415-555-0000', emergencyContactRelation: 'Spouse',
        ssn: '•••-••-4000'
      },
      // 16 - Carlos Martinez (Content Strategist)
      {
        id: 16, firstName: 'Carlos', middleName: '', lastName: 'Martinez',
        preferredName: '', displayName: 'Carlos Martinez',
        avatar: null, email: 'cmartinez@efficientoffice.com', homeEmail: 'carlos.m@gmail.com',
        workPhone: '415-555-4100', workPhoneExt: '4100', mobilePhone: '415-555-9100', homePhone: '',
        dateOfBirth: '1991-09-15', gender: 'Male', maritalStatus: 'Single',
        address1: '234 Guerrero St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94103', country: 'United States',
        hireDate: '2020-07-27', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Content Strategist',
        departmentId: 4, locationId: 1, divisionId: 1, reportsToId: 15,
        employeeNumber: '16', payRate: 72000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Rosa Martinez', emergencyContactPhone: '510-555-0100', emergencyContactRelation: 'Parent',
        ssn: '•••-••-4100'
      },
      // 17 - Priya Patel (Marketing Specialist)
      {
        id: 17, firstName: 'Priya', middleName: '', lastName: 'Patel',
        preferredName: '', displayName: 'Priya Patel',
        avatar: null, email: 'ppatel@efficientoffice.com', homeEmail: 'priya.p@yahoo.com',
        workPhone: '212-555-4200', workPhoneExt: '4200', mobilePhone: '212-555-9200', homePhone: '',
        dateOfBirth: '1993-12-01', gender: 'Female', maritalStatus: 'Single',
        address1: '567 5th Ave', address2: 'Apt 3A', city: 'New York',
        state: 'New York', zipcode: '10017', country: 'United States',
        hireDate: '2022-08-15', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Marketing Specialist',
        departmentId: 4, locationId: 2, divisionId: 2, reportsToId: 15,
        employeeNumber: '17', payRate: 68000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Raj Patel', emergencyContactPhone: '212-555-5200', emergencyContactRelation: 'Parent',
        ssn: '•••-••-4200'
      },
      // 18 - Kevin Johnson (Customer Support Manager)
      {
        id: 18, firstName: 'Kevin', middleName: '', lastName: 'Johnson',
        preferredName: '', displayName: 'Kevin Johnson',
        avatar: null, email: 'kjohnson@efficientoffice.com', homeEmail: 'kevin.j@gmail.com',
        workPhone: '415-555-5000', workPhoneExt: '5000', mobilePhone: '415-555-0000', homePhone: '',
        dateOfBirth: '1984-06-30', gender: 'Male', maritalStatus: 'Married',
        address1: '1234 Lombard St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94123', country: 'United States',
        hireDate: '2016-11-14', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Customer Support Manager',
        departmentId: 5, locationId: 1, divisionId: 1, reportsToId: 4,
        employeeNumber: '18', payRate: 88000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Mary Johnson', emergencyContactPhone: '415-555-1000', emergencyContactRelation: 'Spouse',
        ssn: '•••-••-5000'
      },
      // 19 - Aisha Williams (Support Representative)
      {
        id: 19, firstName: 'Aisha', middleName: '', lastName: 'Williams',
        preferredName: '', displayName: 'Aisha Williams',
        avatar: null, email: 'awilliams@efficientoffice.com', homeEmail: 'aisha.w@gmail.com',
        workPhone: '415-555-5100', workPhoneExt: '5100', mobilePhone: '415-555-0100', homePhone: '',
        dateOfBirth: '1996-02-28', gender: 'Female', maritalStatus: 'Single',
        address1: '456 Clement St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94118', country: 'United States',
        hireDate: '2023-06-12', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Support Representative',
        departmentId: 5, locationId: 1, divisionId: 1, reportsToId: 18,
        employeeNumber: '19', payRate: 48000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'James Williams', emergencyContactPhone: '415-555-2000', emergencyContactRelation: 'Parent',
        ssn: '•••-••-5100'
      },
      // 20 - Dorothy Chou (Finance Controller)
      {
        id: 20, firstName: 'Dorothy', middleName: '', lastName: 'Chou',
        preferredName: '', displayName: 'Dorothy Chou',
        avatar: null, email: 'dchou@efficientoffice.com', homeEmail: 'dorothy.chou@gmail.com',
        workPhone: '415-555-6000', workPhoneExt: '6000', mobilePhone: '415-555-1000', homePhone: '',
        dateOfBirth: '1976-11-12', gender: 'Female', maritalStatus: 'Married',
        address1: '789 Clay St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94108', country: 'United States',
        hireDate: '2013-10-01', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Finance Controller',
        departmentId: 6, locationId: 1, divisionId: 1, reportsToId: 4,
        employeeNumber: '20', payRate: 125000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Henry Chou', emergencyContactPhone: '415-555-2000', emergencyContactRelation: 'Spouse',
        ssn: '•••-••-6000'
      },
      // 21 - Robert Lee (Sr. Accountant)
      {
        id: 21, firstName: 'Robert', middleName: '', lastName: 'Lee',
        preferredName: '', displayName: 'Robert Lee',
        avatar: null, email: 'rlee@efficientoffice.com', homeEmail: 'robert.lee@gmail.com',
        workPhone: '415-555-6100', workPhoneExt: '6100', mobilePhone: '415-555-1100', homePhone: '',
        dateOfBirth: '1985-03-15', gender: 'Male', maritalStatus: 'Single',
        address1: '321 Post St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94108', country: 'United States',
        hireDate: '2018-06-18', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Sr. Accountant',
        departmentId: 6, locationId: 1, divisionId: 1, reportsToId: 20,
        employeeNumber: '21', payRate: 78000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Helen Lee', emergencyContactPhone: '415-555-3100', emergencyContactRelation: 'Parent',
        ssn: '•••-••-6100'
      },
      // 22 - Sandra Wilson (Operations Manager)
      {
        id: 22, firstName: 'Sandra', middleName: '', lastName: 'Wilson',
        preferredName: '', displayName: 'Sandra Wilson',
        avatar: null, email: 'swilson@efficientoffice.com', homeEmail: 'sandra.w@yahoo.com',
        workPhone: '415-555-7000', workPhoneExt: '7000', mobilePhone: '415-555-2000', homePhone: '',
        dateOfBirth: '1979-08-22', gender: 'Female', maritalStatus: 'Married',
        address1: '654 Howard St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94105', country: 'United States',
        hireDate: '2015-05-11', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Operations Manager',
        departmentId: 7, locationId: 1, divisionId: 1, reportsToId: 4,
        employeeNumber: '22', payRate: 95000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Tom Wilson', emergencyContactPhone: '415-555-4000', emergencyContactRelation: 'Spouse',
        ssn: '•••-••-7000'
      },
      // 23 - Alex Hernandez (Operations Analyst)
      {
        id: 23, firstName: 'Alex', middleName: '', lastName: 'Hernandez',
        preferredName: '', displayName: 'Alex Hernandez',
        avatar: null, email: 'ahernandez@efficientoffice.com', homeEmail: 'alex.h@gmail.com',
        workPhone: '415-555-7100', workPhoneExt: '7100', mobilePhone: '415-555-2100', homePhone: '',
        dateOfBirth: '1992-01-17', gender: 'Male', maritalStatus: 'Single',
        address1: '876 Brannan St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94103', country: 'United States',
        hireDate: '2021-09-20', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Operations Analyst',
        departmentId: 7, locationId: 3, divisionId: 1, reportsToId: 22,
        employeeNumber: '23', payRate: 65000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Rosa Hernandez', emergencyContactPhone: '510-555-5100', emergencyContactRelation: 'Parent',
        ssn: '•••-••-7100'
      },
      // 24 - Chris Taylor (IT Director)
      {
        id: 24, firstName: 'Chris', middleName: '', lastName: 'Taylor',
        preferredName: '', displayName: 'Chris Taylor',
        avatar: null, email: 'ctaylor@efficientoffice.com', homeEmail: 'chris.t@gmail.com',
        workPhone: '415-555-8000', workPhoneExt: '8000', mobilePhone: '415-555-3000', homePhone: '',
        dateOfBirth: '1981-04-06', gender: 'Male', maritalStatus: 'Married',
        address1: '432 Sutter St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94108', country: 'United States',
        hireDate: '2016-02-29', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'IT Director',
        departmentId: 8, locationId: 1, divisionId: 1, reportsToId: 4,
        employeeNumber: '24', payRate: 115000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Susan Taylor', emergencyContactPhone: '415-555-6000', emergencyContactRelation: 'Spouse',
        ssn: '•••-••-8000'
      },
      // 25 - Olivia Brown (IT Systems Admin)
      {
        id: 25, firstName: 'Olivia', middleName: '', lastName: 'Brown',
        preferredName: '', displayName: 'Olivia Brown',
        avatar: null, email: 'obrown@efficientoffice.com', homeEmail: 'olivia.b@gmail.com',
        workPhone: '415-555-8100', workPhoneExt: '8100', mobilePhone: '415-555-3100', homePhone: '',
        dateOfBirth: '1994-06-23', gender: 'Female', maritalStatus: 'Single',
        address1: '123 Kearny St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94108', country: 'United States',
        hireDate: '2022-11-01', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'IT Systems Administrator',
        departmentId: 8, locationId: 1, divisionId: 1, reportsToId: 24,
        employeeNumber: '25', payRate: 82000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'William Brown', emergencyContactPhone: '415-555-7100', emergencyContactRelation: 'Parent',
        ssn: '•••-••-8100'
      },
      // 26 - Patricia Moore (General Counsel)
      {
        id: 26, firstName: 'Patricia', middleName: '', lastName: 'Moore',
        preferredName: '', displayName: 'Patricia Moore',
        avatar: null, email: 'pmoore@efficientoffice.com', homeEmail: 'pat.moore@gmail.com',
        workPhone: '415-555-9000', workPhoneExt: '9000', mobilePhone: '415-555-4000', homePhone: '',
        dateOfBirth: '1973-09-04', gender: 'Female', maritalStatus: 'Married',
        address1: '567 Battery St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94111', country: 'United States',
        hireDate: '2014-03-15', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'General Counsel',
        departmentId: 9, locationId: 1, divisionId: 1, reportsToId: 4,
        employeeNumber: '26', payRate: 165000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Brian Moore', emergencyContactPhone: '415-555-8000', emergencyContactRelation: 'Spouse',
        ssn: '•••-••-9000'
      },
      // 27 - Nathan Clark (Legal Associate)
      {
        id: 27, firstName: 'Nathan', middleName: '', lastName: 'Clark',
        preferredName: '', displayName: 'Nathan Clark',
        avatar: null, email: 'nclark@efficientoffice.com', homeEmail: 'nathan.c@gmail.com',
        workPhone: '212-555-9100', workPhoneExt: '9100', mobilePhone: '212-555-4100', homePhone: '',
        dateOfBirth: '1990-11-28', gender: 'Male', maritalStatus: 'Single',
        address1: '200 Broad St', address2: '', city: 'New York',
        state: 'New York', zipcode: '10004', country: 'United States',
        hireDate: '2020-01-13', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Legal Associate',
        departmentId: 9, locationId: 2, divisionId: 2, reportsToId: 26,
        employeeNumber: '27', payRate: 110000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Susan Clark', emergencyContactPhone: '212-555-5100', emergencyContactRelation: 'Parent',
        ssn: '•••-••-9100'
      },
      // 28 - Christopher Walker (COO)
      {
        id: 28, firstName: 'Christopher', middleName: '', lastName: 'Walker',
        preferredName: 'Chris W.', displayName: 'Christopher Walker',
        avatar: null, email: 'cwalker@efficientoffice.com', homeEmail: 'chris.walker@gmail.com',
        workPhone: '415-555-1050', workPhoneExt: '1050', mobilePhone: '415-555-6050', homePhone: '',
        dateOfBirth: '1972-07-16', gender: 'Male', maritalStatus: 'Married',
        address1: '100 California St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94111', country: 'United States',
        hireDate: '2011-05-01', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Chief Operating Officer',
        departmentId: 10, locationId: 1, divisionId: 3, reportsToId: 4,
        employeeNumber: '28', payRate: 245000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Mary Walker', emergencyContactPhone: '415-555-7050', emergencyContactRelation: 'Spouse',
        ssn: '•••-••-1050'
      },
      // 29 - Terminated employee 1
      {
        id: 29, firstName: 'George', middleName: '', lastName: 'Thomas',
        preferredName: '', displayName: 'George Thomas',
        avatar: null, email: 'gthomas@efficientoffice.com', homeEmail: 'george.t@gmail.com',
        workPhone: '415-555-5200', workPhoneExt: '5200', mobilePhone: '415-555-0200', homePhone: '',
        dateOfBirth: '1988-04-10', gender: 'Male', maritalStatus: 'Single',
        address1: '123 Valencia St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94103', country: 'United States',
        hireDate: '2019-03-01', terminationDate: '2026-01-31', status: 'Inactive',
        employmentStatus: 'Full-Time', jobTitle: 'Support Representative',
        departmentId: 5, locationId: 1, divisionId: 1, reportsToId: 18,
        employeeNumber: '29', payRate: 48000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Helen Thomas', emergencyContactPhone: '415-555-1200', emergencyContactRelation: 'Parent',
        ssn: '•••-••-5200'
      },
      // 30 - New hire
      {
        id: 30, firstName: 'Megan', middleName: '', lastName: 'Foster',
        preferredName: '', displayName: 'Megan Foster',
        avatar: null, email: 'mfoster@efficientoffice.com', homeEmail: 'megan.foster@gmail.com',
        workPhone: '415-555-3400', workPhoneExt: '3400', mobilePhone: '415-555-8400', homePhone: '',
        dateOfBirth: '1998-09-14', gender: 'Female', maritalStatus: 'Single',
        address1: '456 Union St', address2: '', city: 'San Francisco',
        state: 'California', zipcode: '94133', country: 'United States',
        hireDate: '2026-03-15', terminationDate: null, status: 'Active',
        employmentStatus: 'Full-Time', jobTitle: 'Sales Development Representative',
        departmentId: 3, locationId: 1, divisionId: 1, reportsToId: 7,
        employeeNumber: '30', payRate: 55000, payType: 'Salary', payFrequency: 'Twice a Month',
        standardHoursPerWeek: 40,
        socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
        emergencyContactName: 'Linda Foster', emergencyContactPhone: '415-555-9400', emergencyContactRelation: 'Parent',
        ssn: '•••-••-3400'
      }
    ],

    timeOffPolicies: [
      { id: 1, name: 'Vacation Full-Time', type: 'Vacation', icon: 'palm-tree', unit: 'hours', accrualRate: 6.67, maxBalance: 240 },
      { id: 2, name: 'Sick Full-Time', type: 'Sick', icon: 'medkit', unit: 'hours', accrualRate: 4.0, maxBalance: 120 },
      { id: 3, name: 'Bereavement', type: 'Bereavement', icon: 'heart', unit: 'days', accrualRate: 0, maxBalance: 5 },
      { id: 4, name: 'FMLA', type: 'FMLA', icon: 'shield', unit: 'days', accrualRate: 0, maxBalance: 60 },
      { id: 5, name: 'Personal', type: 'Personal', icon: 'user', unit: 'hours', accrualRate: 2.0, maxBalance: 40 }
    ],

    timeOffBalances: [
      { employeeId: 1, policyId: 1, available: 27.4, scheduled: 72, used: 40 },
      { employeeId: 1, policyId: 2, available: 24.0, scheduled: 0, used: 8 },
      { employeeId: 1, policyId: 3, available: 5, scheduled: 0, used: 0 },
      { employeeId: 1, policyId: 4, available: 60, scheduled: 0, used: 0 },
      { employeeId: 1, policyId: 5, available: 16, scheduled: 0, used: 0 },
      { employeeId: 2, policyId: 1, available: 40.0, scheduled: 0, used: 20 },
      { employeeId: 2, policyId: 2, available: 20.0, scheduled: 0, used: 0 },
      { employeeId: 3, policyId: 1, available: 15.0, scheduled: 8, used: 8 },
      { employeeId: 3, policyId: 2, available: 12.0, scheduled: 0, used: 0 }
    ],

    timeOffRequests: [
      {
        id: 1, employeeId: 1, policyId: 1, startDate: '2026-04-12', endDate: '2026-04-13',
        hours: 16, status: 'approved', note: 'Family vacation', reviewedBy: 5,
        reviewedAt: '2026-03-20T10:00:00Z', createdAt: '2026-03-15T09:00:00Z'
      },
      {
        id: 2, employeeId: 2, policyId: 1, startDate: '2026-04-10', endDate: '2026-04-10',
        hours: 8, status: 'approved', note: 'Personal day', reviewedBy: 5,
        reviewedAt: '2026-04-01T09:00:00Z', createdAt: '2026-03-28T10:00:00Z'
      },
      {
        id: 3, employeeId: 3, policyId: 2, startDate: '2026-04-09', endDate: '2026-04-09',
        hours: 8, status: 'approved', note: 'Not feeling well', reviewedBy: 5,
        reviewedAt: '2026-04-08T08:00:00Z', createdAt: '2026-04-08T07:30:00Z'
      },
      {
        id: 4, employeeId: 8, policyId: 1, startDate: '2026-04-14', endDate: '2026-04-17',
        hours: 32, status: 'pending', note: 'Spring break with family', reviewedBy: null,
        reviewedAt: null, createdAt: '2026-04-08T11:00:00Z'
      },
      {
        id: 5, employeeId: 12, policyId: 1, startDate: '2026-05-01', endDate: '2026-05-05',
        hours: 40, status: 'pending', note: 'Vacation', reviewedBy: null,
        reviewedAt: null, createdAt: '2026-04-07T14:00:00Z'
      },
      {
        id: 6, employeeId: 1, policyId: 2, startDate: '2026-03-01', endDate: '2026-03-01',
        hours: 8, status: 'denied', note: '', reviewedBy: 5,
        reviewedAt: '2026-02-28T12:00:00Z', createdAt: '2026-02-25T09:00:00Z'
      },
      {
        id: 7, employeeId: 9, policyId: 5, startDate: '2026-03-10', endDate: '2026-03-10',
        hours: 8, status: 'approved', note: 'Doctor appointment', reviewedBy: 6,
        reviewedAt: '2026-03-08T10:00:00Z', createdAt: '2026-03-05T09:00:00Z'
      },
      {
        id: 8, employeeId: 15, policyId: 1, startDate: '2026-04-20', endDate: '2026-04-24',
        hours: 40, status: 'approved', note: 'Conference trip', reviewedBy: 4,
        reviewedAt: '2026-04-02T10:00:00Z', createdAt: '2026-03-30T09:00:00Z'
      }
    ],

    jobOpenings: [
      {
        id: 1, title: 'Software Engineer', departmentId: 2, locationId: 1,
        status: 'Open', employmentType: 'Full-Time',
        description: 'We are looking for a talented Software Engineer to join our growing engineering team. You will be responsible for designing and building scalable web applications.',
        requirements: '5+ years of experience with JavaScript/TypeScript, React, Node.js. Strong understanding of software architecture and design patterns.',
        salaryMin: 120000, salaryMax: 160000, hiringManagerId: 6,
        createdAt: '2026-02-01', applicantCount: 12
      },
      {
        id: 2, title: 'Sales Development Representative', departmentId: 3, locationId: 1,
        status: 'Open', employmentType: 'Full-Time',
        description: 'Join our dynamic sales team as an SDR. You will prospect and qualify leads, set up meetings for our Account Executives, and help drive revenue growth.',
        requirements: '1-2 years of sales experience preferred. Excellent communication skills. Proficiency with CRM tools (Salesforce).',
        salaryMin: 50000, salaryMax: 70000, hiringManagerId: 7,
        createdAt: '2026-02-15', applicantCount: 8
      },
      {
        id: 3, title: 'Marketing Manager', departmentId: 4, locationId: 1,
        status: 'Open', employmentType: 'Full-Time',
        description: 'We are seeking an experienced Marketing Manager to lead our content and digital marketing initiatives. You will manage campaigns, analyze performance metrics, and collaborate with cross-functional teams.',
        requirements: '5+ years of marketing experience. Strong digital marketing background. Experience with analytics tools.',
        salaryMin: 90000, salaryMax: 120000, hiringManagerId: 15,
        createdAt: '2026-03-01', applicantCount: 5
      },
      {
        id: 4, title: 'Office Manager', departmentId: 7, locationId: 1,
        status: 'Draft', employmentType: 'Full-Time',
        description: 'We are looking for an organized and proactive Office Manager to oversee daily office operations.',
        requirements: '3+ years of office management experience. Strong organizational and multitasking skills.',
        salaryMin: 60000, salaryMax: 75000, hiringManagerId: 22,
        createdAt: '2026-03-20', applicantCount: 0
      }
    ],

    candidates: [
      {
        id: 1, jobOpeningId: 1, firstName: 'Janet', lastName: 'Lewis',
        email: 'janet.lewis@email.com', phone: '555-234-5678',
        resumeUrl: '/files/resume_jlewis.pdf', stage: 'Offer',
        rating: 5, appliedAt: '2026-02-05', notes: 'Excellent technical skills, strong communication'
      },
      {
        id: 2, jobOpeningId: 1, firstName: 'Robert', lastName: 'Chen',
        email: 'r.chen@email.com', phone: '555-345-6789',
        resumeUrl: '/files/resume_rchen.pdf', stage: 'On-site Interview',
        rating: 4, appliedAt: '2026-02-08', notes: 'Strong background, needs culture fit assessment'
      },
      {
        id: 3, jobOpeningId: 1, firstName: 'Maria', lastName: 'Garcia',
        email: 'mgarcia@email.com', phone: '555-456-7890',
        resumeUrl: '/files/resume_mgarcia.pdf', stage: 'Phone Interview',
        rating: 4, appliedAt: '2026-02-10', notes: 'Great experience, pending phone screen'
      },
      {
        id: 4, jobOpeningId: 1, firstName: 'Kevin', lastName: 'Williams',
        email: 'k.williams@email.com', phone: '555-567-8901',
        resumeUrl: '/files/resume_kwilliams.pdf', stage: 'Screening',
        rating: 3, appliedAt: '2026-02-15', notes: 'Reviewing resume'
      },
      {
        id: 5, jobOpeningId: 1, firstName: 'Sarah', lastName: 'Johnson',
        email: 's.johnson@email.com', phone: '555-678-9012',
        resumeUrl: '/files/resume_sjohnson.pdf', stage: 'New',
        rating: 3, appliedAt: '2026-02-20', notes: ''
      },
      {
        id: 6, jobOpeningId: 2, firstName: 'Alex', lastName: 'Thompson',
        email: 'a.thompson@email.com', phone: '555-789-0123',
        resumeUrl: '/files/resume_athompson.pdf', stage: 'Offer',
        rating: 5, appliedAt: '2026-02-18', notes: 'Strong candidate, extending offer'
      },
      {
        id: 7, jobOpeningId: 2, firstName: 'Lisa', lastName: 'Brown',
        email: 'l.brown@email.com', phone: '555-890-1234',
        resumeUrl: '/files/resume_lbrown.pdf', stage: 'Phone Interview',
        rating: 4, appliedAt: '2026-02-22', notes: 'Promising background'
      },
      {
        id: 8, jobOpeningId: 2, firstName: 'James', lastName: 'Davis',
        email: 'j.davis@email.com', phone: '555-901-2345',
        resumeUrl: '/files/resume_jdavis.pdf', stage: 'Screening',
        rating: 3, appliedAt: '2026-02-28', notes: 'Review resume'
      },
      {
        id: 9, jobOpeningId: 3, firstName: 'Emma', lastName: 'Wilson',
        email: 'e.wilson@email.com', phone: '555-012-3456',
        resumeUrl: '/files/resume_ewilson.pdf', stage: 'On-site Interview',
        rating: 5, appliedAt: '2026-03-05', notes: 'Excellent marketing background'
      },
      {
        id: 10, jobOpeningId: 3, firstName: 'David', lastName: 'Martinez',
        email: 'd.martinez@email.com', phone: '555-123-4567',
        resumeUrl: '/files/resume_dmartinez.pdf', stage: 'Screening',
        rating: 4, appliedAt: '2026-03-08', notes: 'Strong digital marketing experience'
      },
      {
        id: 11, jobOpeningId: 1, firstName: 'Olivia', lastName: 'Taylor',
        email: 'o.taylor@email.com', phone: '555-234-5679',
        resumeUrl: '/files/resume_otaylor.pdf', stage: 'Rejected',
        rating: 2, appliedAt: '2026-02-25', notes: 'Does not meet requirements'
      },
      {
        id: 12, jobOpeningId: 2, firstName: 'Noah', lastName: 'Anderson',
        email: 'n.anderson@email.com', phone: '555-345-6780',
        resumeUrl: '/files/resume_nanderson.pdf', stage: 'New',
        rating: 3, appliedAt: '2026-03-01', notes: ''
      }
    ],

    announcements: [
      {
        id: 1, title: 'Save the Date - Annual Company Movie Night!',
        body: 'Join us for our annual company movie night on April 25th at 7PM in the main conference room. Popcorn and refreshments will be provided. Family members are welcome!',
        authorId: 1, createdAt: '2026-04-05T14:00:00Z', isPinned: true
      },
      {
        id: 2, title: 'Updated Remote Work Policy',
        body: 'Please review the updated remote work policy effective May 1st. Key changes include flexible core hours and expanded remote work allowances. The full policy document is available in the Files section.',
        authorId: 5, createdAt: '2026-04-01T09:00:00Z', isPinned: false
      },
      {
        id: 3, title: 'Welcome Megan Foster to the Sales Team!',
        body: 'Please join us in welcoming Megan Foster who started as a Sales Development Representative on March 15th. Megan comes to us from TechStart Inc. and brings 2 years of sales experience. Please make her feel welcome!',
        authorId: 1, createdAt: '2026-03-15T08:00:00Z', isPinned: false
      },
      {
        id: 4, title: 'Office Closure - Memorial Day May 26th',
        body: 'The San Francisco and New York offices will be closed on Monday, May 26th in observance of Memorial Day. Please plan accordingly and enjoy the long weekend!',
        authorId: 5, createdAt: '2026-03-28T10:00:00Z', isPinned: false
      }
    ],

    notifications: [
      {
        id: 1, type: 'time_off_request', message: 'David Park made a request: Vacation from Apr 14–17 (32 hours).',
        timestamp: '2026-04-08T11:00:00Z', isRead: false, icon: 'calendar',
        linkTo: '/people/8/time-off', isPastDue: false, dueDate: null
      },
      {
        id: 2, type: 'time_off_request', message: 'Michael Adams made a request: Vacation from May 1–5 (40 hours).',
        timestamp: '2026-04-07T14:00:00Z', isRead: false, icon: 'calendar',
        linkTo: '/people/12/time-off', isPastDue: false, dueDate: null
      },
      {
        id: 3, type: 'application', message: 'Janet Lewis applied for the Software Engineer opening.',
        timestamp: '2026-04-06T10:30:00Z', isRead: false, icon: 'user',
        linkTo: '/hiring/1', isPastDue: false, dueDate: null
      },
      {
        id: 4, type: 'compensation_request', message: 'Charlotte Abbott made a request: Compensation request for Amy Granger.',
        timestamp: '2026-04-05T09:00:00Z', isRead: false, icon: 'dollar-sign',
        linkTo: '/people/3', isPastDue: false, dueDate: null
      },
      {
        id: 5, type: 'asset_request', message: 'Charlotte Abbott made a request: Asset Request for Amy Granger.',
        timestamp: '2026-04-04T16:00:00Z', isRead: false, icon: 'package',
        linkTo: '/people/3', isPastDue: false, dueDate: null
      },
      {
        id: 6, type: 'feedback_request', message: 'Take a moment to select peers to give feedback about your team members. Requests for feedback must be sent before Oct 24 (101 days ago).',
        timestamp: '2026-01-10T09:00:00Z', isRead: false, icon: 'star',
        linkTo: '/people/1/performance', isPastDue: true, dueDate: '2026-01-24'
      },
      {
        id: 7, type: 'task_due', message: 'Employee Handbook 2026 is awaiting your signature.',
        timestamp: '2026-03-15T10:00:00Z', isRead: true, icon: 'file-text',
        linkTo: '/files', isPastDue: true, dueDate: '2026-03-20'
      },
      {
        id: 8, type: 'task_due', message: 'Performance reviews are due by April 15th. 3 reviews pending.',
        timestamp: '2026-04-02T09:00:00Z', isRead: true, icon: 'clipboard',
        linkTo: '/people/1/performance', isPastDue: false, dueDate: '2026-04-15'
      },
      {
        id: 9, type: 'announcement', message: 'New announcement: Save the Date - Annual Company Movie Night!',
        timestamp: '2026-04-05T14:00:00Z', isRead: true, icon: 'megaphone',
        linkTo: '/', isPastDue: false, dueDate: null
      },
      {
        id: 10, type: 'new_hire', message: 'Welcome Megan Foster to the Sales team! Started March 15th.',
        timestamp: '2026-03-15T08:00:00Z', isRead: true, icon: 'user-plus',
        linkTo: '/people/30', isPastDue: false, dueDate: null
      },
      {
        id: 11, type: 'task_due', message: 'Schedule exit interview for George Thomas (terminated Jan 31).',
        timestamp: '2026-02-03T09:00:00Z', isRead: true, icon: 'calendar',
        linkTo: '/people/29', isPastDue: true, dueDate: '2026-02-07'
      },
      {
        id: 12, type: 'task_due', message: 'Annual compliance training is overdue for 3 employees.',
        timestamp: '2026-03-31T09:00:00Z', isRead: true, icon: 'alert-circle',
        linkTo: '/reports', isPastDue: true, dueDate: '2026-03-31'
      }
    ],

    notes: [
      {
        id: 1, employeeId: 1, authorId: 5,
        content: 'Discussed career development goals for 2026. Charlotte is interested in moving into an HR Manager role within 2 years. Will provide additional leadership opportunities.',
        createdAt: '2026-03-10T14:30:00Z'
      },
      {
        id: 2, employeeId: 3, authorId: 1,
        content: 'Amy completed her probationary period with flying colors. Very organized and detail-oriented. Great addition to the HR team.',
        createdAt: '2026-09-01T10:00:00Z'
      },
      {
        id: 3, employeeId: 8, authorId: 6,
        content: 'David is performing exceptionally well on the new platform migration project. Recognized with a spot bonus.',
        createdAt: '2026-02-15T11:00:00Z'
      }
    ],

    documents: [
      {
        id: 1, employeeId: 1, name: 'Employment_Contract_Charlotte_Abbott.pdf',
        category: 'Contracts', uploadedAt: '2011-08-08', uploadedById: 4, size: '1.2 MB'
      },
      {
        id: 2, employeeId: 1, name: 'Employee_Handbook_2026.pdf',
        category: 'Policies', uploadedAt: '2026-01-15', uploadedById: 5, size: '2.4 MB'
      },
      {
        id: 3, employeeId: 1, name: 'W2_2025.pdf',
        category: 'Tax Forms', uploadedAt: '2026-01-31', uploadedById: 20, size: '0.8 MB'
      },
      {
        id: 4, employeeId: 2, name: 'Employment_Contract_Brandon_Bell.pdf',
        category: 'Contracts', uploadedAt: '2018-03-15', uploadedById: 4, size: '1.1 MB'
      },
      {
        id: 5, employeeId: null, name: 'Company_Benefits_Guide_2026.pdf',
        category: 'Policies', uploadedAt: '2026-01-01', uploadedById: 1, size: '3.5 MB'
      }
    ],

    trainings: [
      {
        id: 1, employeeId: 1, title: 'Annual Compliance Training',
        status: 'completed', dueDate: '2026-03-31', completedDate: '2026-03-15', category: 'Compliance'
      },
      {
        id: 2, employeeId: 1, title: 'SHRM Certification Prep',
        status: 'in_progress', dueDate: '2026-06-30', completedDate: null, category: 'Professional Development'
      },
      {
        id: 3, employeeId: 1, title: 'Workplace Harassment Prevention',
        status: 'completed', dueDate: '2026-01-31', completedDate: '2026-01-20', category: 'Compliance'
      },
      {
        id: 4, employeeId: 2, title: 'Annual Compliance Training',
        status: 'overdue', dueDate: '2026-03-31', completedDate: null, category: 'Compliance'
      },
      {
        id: 5, employeeId: 3, title: 'Onboarding Facilitation Techniques',
        status: 'upcoming', dueDate: '2026-05-15', completedDate: null, category: 'HR Skills'
      },
      {
        id: 6, employeeId: 8, title: 'Security Awareness Training',
        status: 'overdue', dueDate: '2026-03-15', completedDate: null, category: 'Compliance'
      }
    ],

    assets: [
      {
        id: 1, employeeId: 1, type: 'Laptop',
        description: 'MacBook Pro 14" M3 (Space Gray)', serialNumber: 'SN-2024-001234',
        assignedDate: '2024-01-15', status: 'assigned'
      },
      {
        id: 2, employeeId: 1, type: 'Phone',
        description: 'iPhone 15 Pro (Black)', serialNumber: 'SN-2024-002567',
        assignedDate: '2024-01-15', status: 'assigned'
      },
      {
        id: 3, employeeId: 1, type: 'Badge',
        description: 'Access Badge - Level 3', serialNumber: 'BADGE-001-0234',
        assignedDate: '2011-08-08', status: 'assigned'
      },
      {
        id: 4, employeeId: 8, type: 'Laptop',
        description: 'MacBook Pro 16" M3 Max (Silver)', serialNumber: 'SN-2024-003891',
        assignedDate: '2024-02-01', status: 'assigned'
      }
    ],

    goals: [
      {
        id: 1, employeeId: null, title: 'Increase company-wide employee engagement score by 15%',
        description: 'Achieve an employee engagement score of 85% by implementing new programs and initiatives throughout the year.',
        progress: 60, status: 'on_track', dueDate: '2026-12-31', createdAt: '2026-01-01'
      },
      {
        id: 2, employeeId: null, title: 'Reduce voluntary turnover rate to below 8%',
        description: 'Implement retention strategies including compensation reviews, career development programs, and manager training.',
        progress: 40, status: 'on_track', dueDate: '2026-12-31', createdAt: '2026-01-01'
      },
      {
        id: 3, employeeId: 1, title: 'Complete SHRM-CP certification',
        description: 'Study for and pass the SHRM Certified Professional exam by June 2026.',
        progress: 45, status: 'on_track', dueDate: '2026-06-30', createdAt: '2026-01-15'
      },
      {
        id: 4, employeeId: 1, title: 'Implement new onboarding program for 2026',
        description: 'Design and launch a comprehensive 90-day onboarding program for all new hires.',
        progress: 80, status: 'on_track', dueDate: '2026-04-30', createdAt: '2026-01-15'
      },
      {
        id: 5, employeeId: 1, title: 'Reduce time-to-hire by 20%',
        description: 'Streamline the hiring process by improving job posting quality and interview scheduling efficiency.',
        progress: 25, status: 'behind', dueDate: '2026-12-31', createdAt: '2026-01-15'
      }
    ],

    performanceReviews: [
      {
        id: 1, employeeId: 1, reviewerId: 5, type: 'annual', period: '2025',
        rating: 4, comments: 'Charlotte has been a stellar performer this year. She consistently exceeds expectations in her core HR responsibilities and has taken on additional leadership in the team.',
        status: 'completed', createdAt: '2026-01-15'
      },
      {
        id: 2, employeeId: 1, reviewerId: 5, type: 'mid_year', period: '2025',
        rating: 4, comments: 'Strong first half of the year. Charlotte is on track to meet all her annual goals.',
        status: 'completed', createdAt: '2025-07-15'
      },
      {
        id: 3, employeeId: 8, reviewerId: 6, type: 'annual', period: '2025',
        rating: 5, comments: 'David delivered exceptional results on the platform migration. A true senior engineer.',
        status: 'completed', createdAt: '2026-01-20'
      }
    ],

    benefitPlans: [
      { id: 1, name: 'PPO Medical', type: 'Medical', provider: 'Blue Cross Blue Shield', employeeCost: 150, employerCost: 450 },
      { id: 2, name: 'Dental Basic', type: 'Dental', provider: 'Delta Dental', employeeCost: 25, employerCost: 75 },
      { id: 3, name: 'Vision Standard', type: 'Vision', provider: 'VSP', employeeCost: 10, employerCost: 30 },
      { id: 4, name: '401(k) Plan', type: '401k', provider: 'Fidelity', employeeCost: 0, employerCost: 0 },
      { id: 5, name: 'Life Insurance', type: 'Life', provider: 'MetLife', employeeCost: 15, employerCost: 50 }
    ],

    benefitEnrollments: [
      { id: 1, employeeId: 1, planId: 1, coverageLevel: 'Employee + Family', startDate: '2026-01-01', status: 'active' },
      { id: 2, employeeId: 1, planId: 2, coverageLevel: 'Employee + Family', startDate: '2026-01-01', status: 'active' },
      { id: 3, employeeId: 1, planId: 3, coverageLevel: 'Employee Only', startDate: '2026-01-01', status: 'active' },
      { id: 4, employeeId: 1, planId: 4, coverageLevel: 'Employee', startDate: '2011-08-08', status: 'active' },
      { id: 5, employeeId: 1, planId: 5, coverageLevel: 'Employee + Spouse', startDate: '2026-01-01', status: 'active' },
      { id: 6, employeeId: 2, planId: 1, coverageLevel: 'Employee Only', startDate: '2026-01-01', status: 'active' },
      { id: 7, employeeId: 2, planId: 2, coverageLevel: 'Employee Only', startDate: '2026-01-01', status: 'active' }
    ],

    reports: [
      { id: 1, name: 'Headcount', category: 'standard', type: 'headcount', description: 'Current headcount by department', lastRunAt: '2026-04-01' },
      { id: 2, name: 'Employee Turnover', category: 'standard', type: 'turnover', description: 'Turnover rates over time', lastRunAt: '2026-03-15' },
      { id: 3, name: 'Compensation Summary', category: 'standard', type: 'compensation', description: 'Salary distribution and ranges', lastRunAt: '2026-04-05' },
      { id: 4, name: 'Time Off Usage', category: 'standard', type: 'time_off', description: 'PTO usage by department', lastRunAt: '2026-03-20' },
      { id: 5, name: 'Benefits Enrollment', category: 'standard', type: 'benefits', description: 'Current benefits enrollment status', lastRunAt: '2026-02-28' },
      { id: 6, name: 'Department Report', category: 'standard', type: 'headcount', description: 'Employee count by department with chart', lastRunAt: '2026-04-08' },
      { id: 7, name: 'New Hires', category: 'standard', type: 'new_hires', description: 'Recent hires in the last 90 days', lastRunAt: '2026-04-02' },
      { id: 8, name: 'Employee Satisfaction', category: 'custom', type: 'custom', description: 'Custom eNPS survey results', lastRunAt: '2026-03-01' }
    ],

    // UI state
    ui: {
      notificationsPanelOpen: false,
      searchOpen: false,
      searchQuery: ''
    }
  };
}
