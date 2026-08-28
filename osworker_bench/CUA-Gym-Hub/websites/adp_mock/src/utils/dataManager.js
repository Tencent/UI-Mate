const STORAGE_KEY = 'adp_mock_state'

export function getStorageKey() {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  return sid ? `adp_mock_state_${sid}` : STORAGE_KEY
}

export function createInitialData() {
  return {
    employee: {
      id: 'emp-001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@acmecorp.com',
      phone: '(555) 234-5678',
      employeeId: 'EMP-2847',
      hireDate: '2021-03-15',
      jobTitle: 'Senior Software Engineer',
      department: 'Engineering',
      division: 'Product Development',
      manager: 'Michael Chen',
      managerId: 'emp-010',
      workLocation: 'San Francisco, CA',
      employmentStatus: 'Full-Time',
      payRate: 95000,
      payFrequency: 'Bi-Weekly',
      avatar: 'SJ',
      dateOfBirth: '1990-05-14',
    },
    address: {
      street1: '456 Oak Avenue',
      street2: 'Apt 12B',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      country: 'United States',
    },
    emergencyContacts: [
      {
        id: 'ec-001',
        name: 'David Johnson',
        relationship: 'Spouse',
        phone: '(555) 345-6789',
        email: 'david.johnson@email.com',
        isPrimary: true,
      },
      {
        id: 'ec-002',
        name: 'Margaret Johnson',
        relationship: 'Parent',
        phone: '(555) 456-7890',
        email: 'margaret.johnson@email.com',
        isPrimary: false,
      },
    ],

    // Full employee directory (20+ employees)
    employees: [
      { id: 'emp-001', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@acmecorp.com', phone: '(555) 234-5678', employeeId: 'EMP-2847', hireDate: '2021-03-15', jobTitle: 'Senior Software Engineer', department: 'Engineering', division: 'Product Development', manager: 'Michael Chen', managerId: 'emp-010', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 95000, payFrequency: 'Bi-Weekly', avatar: 'SJ', status: 'Active' },
      { id: 'emp-002', firstName: 'Alex', lastName: 'Rivera', email: 'alex.rivera@acmecorp.com', phone: '(555) 456-7890', employeeId: 'EMP-3012', hireDate: '2022-01-10', jobTitle: 'Software Engineer', department: 'Engineering', division: 'Product Development', manager: 'Sarah Johnson', managerId: 'emp-001', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 82000, payFrequency: 'Bi-Weekly', avatar: 'AR', status: 'Active' },
      { id: 'emp-003', firstName: 'Emily', lastName: 'Zhang', email: 'emily.zhang@acmecorp.com', phone: '(555) 567-8901', employeeId: 'EMP-3156', hireDate: '2022-06-20', jobTitle: 'Software Engineer', department: 'Engineering', division: 'Product Development', manager: 'Sarah Johnson', managerId: 'emp-001', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 84000, payFrequency: 'Bi-Weekly', avatar: 'EZ', status: 'Active' },
      { id: 'emp-004', firstName: 'Marcus', lastName: 'Williams', email: 'marcus.williams@acmecorp.com', phone: '(555) 678-9012', employeeId: 'EMP-3298', hireDate: '2023-02-06', jobTitle: 'Junior Developer', department: 'Engineering', division: 'Product Development', manager: 'Sarah Johnson', managerId: 'emp-001', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 68000, payFrequency: 'Bi-Weekly', avatar: 'MW', status: 'Active' },
      { id: 'emp-005', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@acmecorp.com', phone: '(555) 789-0123', employeeId: 'EMP-3344', hireDate: '2022-09-01', jobTitle: 'QA Engineer', department: 'Engineering', division: 'Quality Assurance', manager: 'Sarah Johnson', managerId: 'emp-001', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 78000, payFrequency: 'Bi-Weekly', avatar: 'PP', status: 'Active' },
      { id: 'emp-006', firstName: 'James', lastName: 'O\'Brien', email: 'james.obrien@acmecorp.com', phone: '(555) 890-1234', employeeId: 'EMP-2501', hireDate: '2020-07-20', jobTitle: 'DevOps Engineer', department: 'Engineering', division: 'Infrastructure', manager: 'Michael Chen', managerId: 'emp-010', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 105000, payFrequency: 'Bi-Weekly', avatar: 'JO', status: 'Active' },
      { id: 'emp-007', firstName: 'Lisa', lastName: 'Kim', email: 'lisa.kim@acmecorp.com', phone: '(555) 901-2345', employeeId: 'EMP-2199', hireDate: '2019-11-11', jobTitle: 'Product Manager', department: 'Product', division: 'Product Development', manager: 'Jennifer Lee', managerId: 'emp-020', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 115000, payFrequency: 'Bi-Weekly', avatar: 'LK', status: 'Active' },
      { id: 'emp-008', firstName: 'Robert', lastName: 'Thompson', email: 'robert.thompson@acmecorp.com', phone: '(555) 012-3456', employeeId: 'EMP-1887', hireDate: '2018-04-02', jobTitle: 'Senior Product Manager', department: 'Product', division: 'Product Development', manager: 'Jennifer Lee', managerId: 'emp-020', workLocation: 'New York, NY', employmentStatus: 'Full-Time', payRate: 130000, payFrequency: 'Bi-Weekly', avatar: 'RT', status: 'Active' },
      { id: 'emp-009', firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@acmecorp.com', phone: '(555) 123-4567', employeeId: 'EMP-2678', hireDate: '2020-10-15', jobTitle: 'UX Designer', department: 'Design', division: 'Product Development', manager: 'Jennifer Lee', managerId: 'emp-020', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 92000, payFrequency: 'Bi-Weekly', avatar: 'MG', status: 'Active' },
      { id: 'emp-010', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@acmecorp.com', phone: '(555) 234-5670', employeeId: 'EMP-1542', hireDate: '2017-01-09', jobTitle: 'VP of Engineering', department: 'Engineering', division: 'Product Development', manager: 'Jennifer Lee', managerId: 'emp-020', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 180000, payFrequency: 'Bi-Weekly', avatar: 'MC', status: 'Active' },
      { id: 'emp-011', firstName: 'Diana', lastName: 'Foster', email: 'diana.foster@acmecorp.com', phone: '(555) 345-6780', employeeId: 'EMP-2890', hireDate: '2021-05-17', jobTitle: 'HR Manager', department: 'Human Resources', division: 'Operations', manager: 'Karen White', managerId: 'emp-019', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 98000, payFrequency: 'Bi-Weekly', avatar: 'DF', status: 'Active' },
      { id: 'emp-012', firstName: 'Kevin', lastName: 'Martinez', email: 'kevin.martinez@acmecorp.com', phone: '(555) 456-7891', employeeId: 'EMP-3401', hireDate: '2023-04-10', jobTitle: 'HR Specialist', department: 'Human Resources', division: 'Operations', manager: 'Diana Foster', managerId: 'emp-011', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 62000, payFrequency: 'Bi-Weekly', avatar: 'KM', status: 'Active' },
      { id: 'emp-013', firstName: 'Amanda', lastName: 'Brown', email: 'amanda.brown@acmecorp.com', phone: '(555) 567-8902', employeeId: 'EMP-2345', hireDate: '2019-08-12', jobTitle: 'Accountant', department: 'Finance', division: 'Operations', manager: 'David Park', managerId: 'emp-018', workLocation: 'New York, NY', employmentStatus: 'Full-Time', payRate: 75000, payFrequency: 'Bi-Weekly', avatar: 'AB', status: 'Active' },
      { id: 'emp-014', firstName: 'Jason', lastName: 'Lee', email: 'jason.lee@acmecorp.com', phone: '(555) 678-9013', employeeId: 'EMP-3078', hireDate: '2022-03-14', jobTitle: 'Financial Analyst', department: 'Finance', division: 'Operations', manager: 'David Park', managerId: 'emp-018', workLocation: 'New York, NY', employmentStatus: 'Full-Time', payRate: 82000, payFrequency: 'Bi-Weekly', avatar: 'JL', status: 'Active' },
      { id: 'emp-015', firstName: 'Rachel', lastName: 'Adams', email: 'rachel.adams@acmecorp.com', phone: '(555) 789-0124', employeeId: 'EMP-2956', hireDate: '2021-11-01', jobTitle: 'Marketing Manager', department: 'Marketing', division: 'Growth', manager: 'Karen White', managerId: 'emp-019', workLocation: 'New York, NY', employmentStatus: 'Full-Time', payRate: 95000, payFrequency: 'Bi-Weekly', avatar: 'RA', status: 'Active' },
      { id: 'emp-016', firstName: 'Tyler', lastName: 'Scott', email: 'tyler.scott@acmecorp.com', phone: '(555) 890-1235', employeeId: 'EMP-3502', hireDate: '2023-07-24', jobTitle: 'Marketing Coordinator', department: 'Marketing', division: 'Growth', manager: 'Rachel Adams', managerId: 'emp-015', workLocation: 'New York, NY', employmentStatus: 'Full-Time', payRate: 55000, payFrequency: 'Bi-Weekly', avatar: 'TS', status: 'Active' },
      { id: 'emp-017', firstName: 'Sophia', lastName: 'Nguyen', email: 'sophia.nguyen@acmecorp.com', phone: '(555) 901-2346', employeeId: 'EMP-3189', hireDate: '2022-08-15', jobTitle: 'Sales Representative', department: 'Sales', division: 'Growth', manager: 'Karen White', managerId: 'emp-019', workLocation: 'Chicago, IL', employmentStatus: 'Full-Time', payRate: 65000, payFrequency: 'Bi-Weekly', avatar: 'SN', status: 'Active' },
      { id: 'emp-018', firstName: 'David', lastName: 'Park', email: 'david.park@acmecorp.com', phone: '(555) 012-3457', employeeId: 'EMP-1678', hireDate: '2017-09-18', jobTitle: 'Finance Director', department: 'Finance', division: 'Operations', manager: 'Karen White', managerId: 'emp-019', workLocation: 'New York, NY', employmentStatus: 'Full-Time', payRate: 145000, payFrequency: 'Bi-Weekly', avatar: 'DP', status: 'Active' },
      { id: 'emp-019', firstName: 'Karen', lastName: 'White', email: 'karen.white@acmecorp.com', phone: '(555) 123-4568', employeeId: 'EMP-1201', hireDate: '2016-02-01', jobTitle: 'Chief Operating Officer', department: 'Executive', division: 'Executive', manager: 'Jennifer Lee', managerId: 'emp-020', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 210000, payFrequency: 'Bi-Weekly', avatar: 'KW', status: 'Active' },
      { id: 'emp-020', firstName: 'Jennifer', lastName: 'Lee', email: 'jennifer.lee@acmecorp.com', phone: '(555) 234-5671', employeeId: 'EMP-1001', hireDate: '2015-06-01', jobTitle: 'Chief Executive Officer', department: 'Executive', division: 'Executive', manager: '', managerId: '', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 275000, payFrequency: 'Bi-Weekly', avatar: 'JL', status: 'Active' },
      { id: 'emp-021', firstName: 'Chris', lastName: 'Taylor', email: 'chris.taylor@acmecorp.com', phone: '(555) 345-6781', employeeId: 'EMP-3567', hireDate: '2023-10-02', jobTitle: 'Data Analyst', department: 'Engineering', division: 'Product Development', manager: 'Michael Chen', managerId: 'emp-010', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 78000, payFrequency: 'Bi-Weekly', avatar: 'CT', status: 'Active' },
      { id: 'emp-022', firstName: 'Nicole', lastName: 'Evans', email: 'nicole.evans@acmecorp.com', phone: '(555) 456-7892', employeeId: 'EMP-2123', hireDate: '2019-03-25', jobTitle: 'Senior Designer', department: 'Design', division: 'Product Development', manager: 'Jennifer Lee', managerId: 'emp-020', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 102000, payFrequency: 'Bi-Weekly', avatar: 'NE', status: 'Active' },
      { id: 'emp-023', firstName: 'Brandon', lastName: 'Hughes', email: 'brandon.hughes@acmecorp.com', phone: '(555) 567-8903', employeeId: 'EMP-2789', hireDate: '2021-01-18', jobTitle: 'IT Support Specialist', department: 'IT', division: 'Operations', manager: 'Karen White', managerId: 'emp-019', workLocation: 'San Francisco, CA', employmentStatus: 'Full-Time', payRate: 60000, payFrequency: 'Bi-Weekly', avatar: 'BH', status: 'Active' },
      { id: 'emp-024', firstName: 'Megan', lastName: 'Clark', email: 'megan.clark@acmecorp.com', phone: '(555) 678-9014', employeeId: 'EMP-3623', hireDate: '2024-01-08', jobTitle: 'Intern', department: 'Engineering', division: 'Product Development', manager: 'Sarah Johnson', managerId: 'emp-001', workLocation: 'San Francisco, CA', employmentStatus: 'Part-Time', payRate: 40000, payFrequency: 'Bi-Weekly', avatar: 'MC', status: 'Active' },
      { id: 'emp-025', firstName: 'Daniel', lastName: 'Wright', email: 'daniel.wright@acmecorp.com', phone: '(555) 789-0125', employeeId: 'EMP-2034', hireDate: '2018-11-15', jobTitle: 'Sales Manager', department: 'Sales', division: 'Growth', manager: 'Karen White', managerId: 'emp-019', workLocation: 'Chicago, IL', employmentStatus: 'Full-Time', payRate: 110000, payFrequency: 'Bi-Weekly', avatar: 'DW', status: 'Active' },
      { id: 'emp-026', firstName: 'Laura', lastName: 'Mitchell', email: 'laura.mitchell@acmecorp.com', phone: '(555) 890-1236', employeeId: 'EMP-2567', hireDate: '2020-05-11', jobTitle: 'Customer Success Manager', department: 'Sales', division: 'Growth', manager: 'Daniel Wright', managerId: 'emp-025', workLocation: 'Chicago, IL', employmentStatus: 'Full-Time', payRate: 72000, payFrequency: 'Bi-Weekly', avatar: 'LM', status: 'Active' },
    ],

    payStatements: [
      {
        id: 'pay-001',
        payDate: '2026-03-28',
        periodStart: '2026-03-15',
        periodEnd: '2026-03-28',
        grossPay: 3653.85,
        netPay: 2487.32,
        earnings: [
          { type: 'Regular', hours: 80, rate: 45.67, current: 3653.85, ytd: 21923.10 },
        ],
        deductions: [
          { type: 'Medical - Employee', current: 187.50, ytd: 1125.00 },
          { type: 'Dental - Employee', current: 42.00, ytd: 252.00 },
          { type: 'Vision - Employee', current: 18.00, ytd: 108.00 },
          { type: '401(k)', current: 182.69, ytd: 1096.14 },
        ],
        taxes: [
          { type: 'Federal Income Tax', current: 548.08, ytd: 3288.47 },
          { type: 'State Income Tax (CA)', current: 219.23, ytd: 1315.38 },
          { type: 'Social Security', current: 226.54, ytd: 1359.23 },
          { type: 'Medicare', current: 52.98, ytd: 317.90 },
        ],
        ytdGross: 21923.10,
        ytdNet: 14923.92,
      },
      {
        id: 'pay-002',
        payDate: '2026-03-14',
        periodStart: '2026-03-01',
        periodEnd: '2026-03-14',
        grossPay: 3653.85,
        netPay: 2487.32,
        earnings: [
          { type: 'Regular', hours: 80, rate: 45.67, current: 3653.85, ytd: 18269.25 },
        ],
        deductions: [
          { type: 'Medical - Employee', current: 187.50, ytd: 937.50 },
          { type: 'Dental - Employee', current: 42.00, ytd: 210.00 },
          { type: 'Vision - Employee', current: 18.00, ytd: 90.00 },
          { type: '401(k)', current: 182.69, ytd: 913.45 },
        ],
        taxes: [
          { type: 'Federal Income Tax', current: 548.08, ytd: 2740.39 },
          { type: 'State Income Tax (CA)', current: 219.23, ytd: 1096.15 },
          { type: 'Social Security', current: 226.54, ytd: 1132.69 },
          { type: 'Medicare', current: 52.98, ytd: 264.92 },
        ],
        ytdGross: 18269.25,
        ytdNet: 12436.60,
      },
      {
        id: 'pay-003',
        payDate: '2026-02-28',
        periodStart: '2026-02-15',
        periodEnd: '2026-02-28',
        grossPay: 3836.54,
        netPay: 2611.74,
        earnings: [
          { type: 'Regular', hours: 80, rate: 45.67, current: 3653.85, ytd: 14615.40 },
          { type: 'Overtime', hours: 4, rate: 68.51, current: 182.69, ytd: 182.69 },
        ],
        deductions: [
          { type: 'Medical - Employee', current: 187.50, ytd: 750.00 },
          { type: 'Dental - Employee', current: 42.00, ytd: 168.00 },
          { type: 'Vision - Employee', current: 18.00, ytd: 72.00 },
          { type: '401(k)', current: 191.83, ytd: 730.76 },
        ],
        taxes: [
          { type: 'Federal Income Tax', current: 575.48, ytd: 2192.31 },
          { type: 'State Income Tax (CA)', current: 230.19, ytd: 876.92 },
          { type: 'Social Security', current: 237.86, ytd: 906.15 },
          { type: 'Medicare', current: 55.63, ytd: 211.94 },
        ],
        ytdGross: 14797.69,
        ytdNet: 9824.86,
      },
      {
        id: 'pay-004',
        payDate: '2026-02-14',
        periodStart: '2026-02-01',
        periodEnd: '2026-02-14',
        grossPay: 3653.85,
        netPay: 2487.32,
        earnings: [
          { type: 'Regular', hours: 80, rate: 45.67, current: 3653.85, ytd: 10961.55 },
        ],
        deductions: [
          { type: 'Medical - Employee', current: 187.50, ytd: 562.50 },
          { type: 'Dental - Employee', current: 42.00, ytd: 126.00 },
          { type: 'Vision - Employee', current: 18.00, ytd: 54.00 },
          { type: '401(k)', current: 182.69, ytd: 548.07 },
        ],
        taxes: [
          { type: 'Federal Income Tax', current: 548.08, ytd: 1644.23 },
          { type: 'State Income Tax (CA)', current: 219.23, ytd: 657.69 },
          { type: 'Social Security', current: 226.54, ytd: 679.61 },
          { type: 'Medicare', current: 52.98, ytd: 158.93 },
        ],
        ytdGross: 10961.55,
        ytdNet: 7337.54,
      },
      {
        id: 'pay-005',
        payDate: '2026-01-31',
        periodStart: '2026-01-18',
        periodEnd: '2026-01-31',
        grossPay: 3653.85,
        netPay: 2487.32,
        earnings: [
          { type: 'Regular', hours: 80, rate: 45.67, current: 3653.85, ytd: 7307.70 },
        ],
        deductions: [
          { type: 'Medical - Employee', current: 187.50, ytd: 375.00 },
          { type: 'Dental - Employee', current: 42.00, ytd: 84.00 },
          { type: 'Vision - Employee', current: 18.00, ytd: 36.00 },
          { type: '401(k)', current: 182.69, ytd: 365.38 },
        ],
        taxes: [
          { type: 'Federal Income Tax', current: 548.08, ytd: 1096.15 },
          { type: 'State Income Tax (CA)', current: 219.23, ytd: 438.46 },
          { type: 'Social Security', current: 226.54, ytd: 453.07 },
          { type: 'Medicare', current: 52.98, ytd: 105.95 },
        ],
        ytdGross: 7307.70,
        ytdNet: 4974.64,
      },
      {
        id: 'pay-006',
        payDate: '2026-01-17',
        periodStart: '2026-01-01',
        periodEnd: '2026-01-17',
        grossPay: 3653.85,
        netPay: 2487.32,
        earnings: [
          { type: 'Regular', hours: 80, rate: 45.67, current: 3653.85, ytd: 3653.85 },
        ],
        deductions: [
          { type: 'Medical - Employee', current: 187.50, ytd: 187.50 },
          { type: 'Dental - Employee', current: 42.00, ytd: 42.00 },
          { type: 'Vision - Employee', current: 18.00, ytd: 18.00 },
          { type: '401(k)', current: 182.69, ytd: 182.69 },
        ],
        taxes: [
          { type: 'Federal Income Tax', current: 548.08, ytd: 548.08 },
          { type: 'State Income Tax (CA)', current: 219.23, ytd: 219.23 },
          { type: 'Social Security', current: 226.54, ytd: 226.54 },
          { type: 'Medicare', current: 52.98, ytd: 52.98 },
        ],
        ytdGross: 3653.85,
        ytdNet: 2487.32,
      },
    ],
    taxDocuments: [
      {
        id: 'tax-001',
        year: 2025,
        type: 'W-2',
        employerName: 'Acme Corporation',
        availableDate: '2026-01-31',
        downloaded: false,
        wages: 87692.31,
        federalTaxWithheld: 13153.85,
        stateTaxWithheld: 5261.54,
        socialSecurityWages: 87692.31,
        medicareWages: 87692.31,
      },
      {
        id: 'tax-002',
        year: 2024,
        type: 'W-2',
        employerName: 'Acme Corporation',
        availableDate: '2025-01-31',
        downloaded: true,
        wages: 83076.92,
        federalTaxWithheld: 12461.54,
        stateTaxWithheld: 4984.62,
        socialSecurityWages: 83076.92,
        medicareWages: 83076.92,
      },
    ],
    directDeposits: [
      {
        id: 'dd-001',
        bankName: 'Chase Bank',
        accountType: 'Checking',
        routingNumber: '****1234',
        accountNumber: '****5678',
        depositType: 'Percentage',
        amount: 100,
        isPrimary: true,
      },
    ],
    timeEntries: [
      { id: 'te-001', date: '2026-04-01', clockIn: '08:02', clockOut: '17:10', breakMinutes: 60, totalHours: 8.13, status: 'Approved', note: '' },
      { id: 'te-002', date: '2026-04-02', clockIn: '08:05', clockOut: '17:05', breakMinutes: 60, totalHours: 8.00, status: 'Approved', note: '' },
      { id: 'te-003', date: '2026-04-03', clockIn: '07:58', clockOut: '17:15', breakMinutes: 60, totalHours: 8.28, status: 'Approved', note: '' },
      { id: 'te-004', date: '2026-04-04', clockIn: '08:10', clockOut: '17:00', breakMinutes: 60, totalHours: 7.83, status: 'Approved', note: '' },
      { id: 'te-005', date: '2026-04-05', clockIn: '08:00', clockOut: '13:00', breakMinutes: 0, totalHours: 5.00, status: 'Approved', note: 'Half day' },
      { id: 'te-006', date: '2026-04-07', clockIn: '08:00', clockOut: '17:00', breakMinutes: 60, totalHours: 8.00, status: 'Submitted', note: '' },
      { id: 'te-007', date: '2026-04-08', clockIn: '08:15', clockOut: '17:15', breakMinutes: 60, totalHours: 8.00, status: 'Submitted', note: '' },
      { id: 'te-008', date: '2026-04-09', clockIn: '08:05', clockOut: '17:05', breakMinutes: 60, totalHours: 8.00, status: 'Submitted', note: '' },
      { id: 'te-009', date: '2026-04-10', clockIn: '08:02', clockOut: null, breakMinutes: 60, totalHours: null, status: 'Not Submitted', note: '' },
    ],
    timeOffBalances: [
      { type: 'Vacation', totalDays: 20, usedDays: 6, pendingDays: 2, availableDays: 12, accrualRate: '1.54 hrs/pay period' },
      { type: 'Sick', totalDays: 10, usedDays: 2, pendingDays: 0, availableDays: 8, accrualRate: '0.77 hrs/pay period' },
      { type: 'Personal', totalDays: 3, usedDays: 1, pendingDays: 0, availableDays: 2, accrualRate: 'N/A' },
    ],
    timeOffRequests: [
      {
        id: 'tor-001',
        type: 'Vacation',
        startDate: '2026-04-21',
        endDate: '2026-04-25',
        totalHours: 40,
        status: 'Pending',
        notes: 'Family vacation',
        submittedDate: '2026-04-01',
        reviewedBy: '',
        reviewedDate: '',
      },
      {
        id: 'tor-002',
        type: 'Vacation',
        startDate: '2026-02-16',
        endDate: '2026-02-20',
        totalHours: 40,
        status: 'Approved',
        notes: 'Presidents Day week trip',
        submittedDate: '2026-02-01',
        reviewedBy: 'Michael Chen',
        reviewedDate: '2026-02-03',
      },
      {
        id: 'tor-003',
        type: 'Sick',
        startDate: '2026-01-13',
        endDate: '2026-01-13',
        totalHours: 8,
        status: 'Approved',
        notes: '',
        submittedDate: '2026-01-13',
        reviewedBy: 'Michael Chen',
        reviewedDate: '2026-01-13',
      },
      {
        id: 'tor-004',
        type: 'Personal',
        startDate: '2026-03-31',
        endDate: '2026-03-31',
        totalHours: 8,
        status: 'Denied',
        notes: 'Personal errand',
        submittedDate: '2026-03-25',
        reviewedBy: 'Michael Chen',
        reviewedDate: '2026-03-27',
      },
    ],
    holidays: [
      { id: 'hol-001', name: "New Year's Day", date: '2026-01-01', dayOfWeek: 'Thursday' },
      { id: 'hol-002', name: 'Martin Luther King Jr. Day', date: '2026-01-19', dayOfWeek: 'Monday' },
      { id: 'hol-003', name: "Presidents' Day", date: '2026-02-16', dayOfWeek: 'Monday' },
      { id: 'hol-004', name: 'Memorial Day', date: '2026-05-25', dayOfWeek: 'Monday' },
      { id: 'hol-005', name: 'Independence Day', date: '2026-07-03', dayOfWeek: 'Friday' },
      { id: 'hol-006', name: 'Labor Day', date: '2026-09-07', dayOfWeek: 'Monday' },
      { id: 'hol-007', name: 'Thanksgiving Day', date: '2026-11-26', dayOfWeek: 'Thursday' },
      { id: 'hol-008', name: 'Day After Thanksgiving', date: '2026-11-27', dayOfWeek: 'Friday' },
      { id: 'hol-009', name: 'Christmas Eve', date: '2026-12-24', dayOfWeek: 'Thursday' },
      { id: 'hol-010', name: 'Christmas Day', date: '2026-12-25', dayOfWeek: 'Friday' },
    ],
    benefitPlans: [
      {
        id: 'ben-001',
        category: 'Medical',
        planName: 'Blue Cross PPO Gold',
        coverageLevel: 'Employee + Spouse',
        employeeCostPerPeriod: 187.50,
        employerContribution: 562.50,
        effectiveDate: '2026-01-01',
        status: 'Active',
        dependentsCovered: ['David Johnson'],
        details: 'PPO plan with in-network deductible $500, out-of-pocket max $3,000',
      },
      {
        id: 'ben-002',
        category: 'Dental',
        planName: 'Delta Dental PPO',
        coverageLevel: 'Employee + Spouse',
        employeeCostPerPeriod: 42.00,
        employerContribution: 28.00,
        effectiveDate: '2026-01-01',
        status: 'Active',
        dependentsCovered: ['David Johnson'],
        details: 'Preventive care 100% covered, basic 80%, major 50%',
      },
      {
        id: 'ben-003',
        category: 'Vision',
        planName: 'VSP Choice Plan',
        coverageLevel: 'Employee + Spouse',
        employeeCostPerPeriod: 18.00,
        employerContribution: 7.00,
        effectiveDate: '2026-01-01',
        status: 'Active',
        dependentsCovered: ['David Johnson'],
        details: 'Annual eye exam covered, $150 frame allowance',
      },
      {
        id: 'ben-004',
        category: 'Life Insurance',
        planName: 'Basic Life - 1x Salary',
        coverageLevel: 'Employee',
        employeeCostPerPeriod: 0,
        employerContribution: 36.54,
        effectiveDate: '2026-01-01',
        status: 'Active',
        dependentsCovered: [],
        details: 'Coverage: $95,000 (1x annual salary). AD&D included.',
      },
      {
        id: 'ben-005',
        category: '401(k)',
        planName: 'Acme 401(k) Plan',
        coverageLevel: 'Employee',
        employeeCostPerPeriod: 182.69,
        employerContribution: 91.35,
        effectiveDate: '2021-09-15',
        status: 'Active',
        dependentsCovered: [],
        details: 'Employee contribution: 5% of gross. Employer match: 4% up to 4% of salary.',
        contributionPercent: 5,
        employerMatchPercent: 4,
      },
    ],
    dependents: [
      {
        id: 'dep-001',
        firstName: 'David',
        lastName: 'Johnson',
        relationship: 'Spouse',
        dateOfBirth: '1988-07-22',
        ssn: '***-**-4321',
        coveredPlans: ['Medical', 'Dental', 'Vision'],
      },
    ],
    directReports: [
      { id: 'emp-002', firstName: 'Alex', lastName: 'Rivera', jobTitle: 'Software Engineer', department: 'Engineering', email: 'alex.rivera@acmecorp.com', phone: '(555) 456-7890', avatar: 'AR', status: 'Active' },
      { id: 'emp-003', firstName: 'Emily', lastName: 'Zhang', jobTitle: 'Software Engineer', department: 'Engineering', email: 'emily.zhang@acmecorp.com', phone: '(555) 567-8901', avatar: 'EZ', status: 'Active' },
      { id: 'emp-004', firstName: 'Marcus', lastName: 'Williams', jobTitle: 'Junior Developer', department: 'Engineering', email: 'marcus.williams@acmecorp.com', phone: '(555) 678-9012', avatar: 'MW', status: 'Active' },
      { id: 'emp-005', firstName: 'Priya', lastName: 'Patel', jobTitle: 'QA Engineer', department: 'Engineering', email: 'priya.patel@acmecorp.com', phone: '(555) 789-0123', avatar: 'PP', status: 'Active' },
      { id: 'emp-024', firstName: 'Megan', lastName: 'Clark', jobTitle: 'Intern', department: 'Engineering', email: 'megan.clark@acmecorp.com', phone: '(555) 678-9014', avatar: 'MC', status: 'Active' },
    ],
    announcements: [
      {
        id: 'ann-001',
        title: 'Open Enrollment Begins May 1',
        content: 'Open enrollment for 2026-2027 benefits begins May 1. Review your current coverage and make any changes by May 31. Visit the Benefits section for more information.',
        date: '2026-04-08',
        category: 'Benefits',
        isRead: false,
        priority: 'high',
      },
      {
        id: 'ann-002',
        title: 'Q1 All-Hands Meeting Recording Available',
        content: 'The recording of the Q1 All-Hands meeting is now available on the company intranet. Key highlights include the product roadmap updates and team achievements.',
        date: '2026-04-01',
        category: 'Company',
        isRead: true,
        priority: 'normal',
      },
      {
        id: 'ann-003',
        title: 'Updated Remote Work Policy',
        content: 'The remote work policy has been updated effective April 15. Employees may work remotely up to 3 days per week with manager approval. Please review the full policy document.',
        date: '2026-03-28',
        category: 'Policy',
        isRead: false,
        priority: 'normal',
      },
      {
        id: 'ann-004',
        title: 'Summer Team Building Event -- Register Now',
        content: 'Join us for our annual summer team building event on June 15 at Golden Gate Park. Activities include sports, BBQ, and games. Register by May 15.',
        date: '2026-03-20',
        category: 'Events',
        isRead: true,
        priority: 'normal',
      },
    ],
    todoItems: [
      {
        id: 'todo-001',
        title: 'Submit timecard for week of 4/7',
        description: 'Your timecard is due by Friday',
        dueDate: '2026-04-11',
        type: 'timecard',
        isCompleted: false,
        link: '/myself/time',
      },
      {
        id: 'todo-002',
        title: 'Review updated remote work policy',
        description: 'New remote work policy effective April 15',
        dueDate: '2026-04-15',
        type: 'policy',
        isCompleted: false,
        link: '/myself/info',
      },
      {
        id: 'todo-003',
        title: 'Complete annual compliance training',
        description: 'Required annual compliance training due',
        dueDate: '2026-04-30',
        type: 'training',
        isCompleted: false,
        link: '/',
      },
    ],
    notifications: [
      {
        id: 'notif-001',
        title: 'Timecard Reminder',
        message: 'Submit your timecard for the week of Apr 7 by Friday, Apr 11.',
        date: '2026-04-10',
        isRead: false,
        type: 'timecard',
        actionUrl: '/myself/time',
      },
      {
        id: 'notif-002',
        title: 'Pay Statement Available',
        message: 'Your pay statement for the period ending Mar 28 is now available.',
        date: '2026-03-28',
        isRead: false,
        type: 'pay',
        actionUrl: '/myself/pay/pay-001',
      },
      {
        id: 'notif-003',
        title: 'Time Off Approved',
        message: 'Your vacation request for Feb 16-20 has been approved by Michael Chen.',
        date: '2026-02-03',
        isRead: true,
        type: 'timeoff',
        actionUrl: '/myself/timeoff',
      },
      {
        id: 'notif-004',
        title: 'Benefits Update',
        message: 'Open enrollment for 2026-2027 benefits begins May 1. Review your options.',
        date: '2026-04-08',
        isRead: true,
        type: 'benefits',
        actionUrl: '/myself/benefits',
      },
      {
        id: 'notif-005',
        title: 'Policy Update',
        message: 'The remote work policy has been updated. Please review the changes.',
        date: '2026-03-28',
        isRead: true,
        type: 'policy',
        actionUrl: '/',
      },
    ],
    companyInfo: {
      name: 'Acme Corporation',
      ein: '94-1234567',
      address: '100 Market Street, San Francisco, CA 94105',
      industry: 'Technology',
      founded: '2010',
      website: 'www.acmecorp.com',
      phone: '(415) 555-1000',
    },
    clockStatus: {
      isClockedIn: false,
      lastClockIn: null,
      lastClockOut: null,
    },
    pendingApprovals: [
      {
        id: 'approval-001',
        type: 'timeoff',
        employeeId: 'emp-002',
        employeeName: 'Alex Rivera',
        employeeAvatar: 'AR',
        request: 'Vacation Apr 14-15',
        startDate: '2026-04-14',
        endDate: '2026-04-15',
        totalHours: 16,
        submittedDate: '2026-04-05',
        status: 'Pending',
      },
      {
        id: 'approval-002',
        type: 'timecard',
        employeeId: 'emp-004',
        employeeName: 'Marcus Williams',
        employeeAvatar: 'MW',
        request: 'Timecard for week of Apr 7',
        weekStart: '2026-04-07',
        weekEnd: '2026-04-11',
        totalHours: 40,
        submittedDate: '2026-04-10',
        status: 'Pending',
      },
      {
        id: 'approval-003',
        type: 'timeoff',
        employeeId: 'emp-005',
        employeeName: 'Priya Patel',
        employeeAvatar: 'PP',
        request: 'Sick Leave Apr 16',
        startDate: '2026-04-16',
        endDate: '2026-04-16',
        totalHours: 8,
        submittedDate: '2026-04-09',
        status: 'Pending',
      },
    ],

    // Payroll runs (admin view)
    payrollRuns: [
      { id: 'pr-001', name: 'Regular Bi-Weekly', payDate: '2026-03-28', periodStart: '2026-03-15', periodEnd: '2026-03-28', status: 'Completed', totalGross: 94891.00, totalNet: 64566.08, employeeCount: 26, approvedBy: 'David Park', approvedDate: '2026-03-26' },
      { id: 'pr-002', name: 'Regular Bi-Weekly', payDate: '2026-03-14', periodStart: '2026-03-01', periodEnd: '2026-03-14', status: 'Completed', totalGross: 93245.00, totalNet: 63446.60, employeeCount: 26, approvedBy: 'David Park', approvedDate: '2026-03-12' },
      { id: 'pr-003', name: 'Regular Bi-Weekly', payDate: '2026-02-28', periodStart: '2026-02-15', periodEnd: '2026-02-28', status: 'Completed', totalGross: 95120.00, totalNet: 64721.60, employeeCount: 26, approvedBy: 'David Park', approvedDate: '2026-02-26' },
      { id: 'pr-004', name: 'Regular Bi-Weekly', payDate: '2026-02-14', periodStart: '2026-02-01', periodEnd: '2026-02-14', status: 'Completed', totalGross: 93245.00, totalNet: 63446.60, employeeCount: 26, approvedBy: 'David Park', approvedDate: '2026-02-12' },
      { id: 'pr-005', name: 'Regular Bi-Weekly', payDate: '2026-04-11', periodStart: '2026-03-29', periodEnd: '2026-04-11', status: 'In Progress', totalGross: 94891.00, totalNet: null, employeeCount: 26, approvedBy: '', approvedDate: '' },
      { id: 'pr-006', name: 'Bonus Run Q1', payDate: '2026-04-15', periodStart: '2026-01-01', periodEnd: '2026-03-31', status: 'Draft', totalGross: 45000.00, totalNet: null, employeeCount: 8, approvedBy: '', approvedDate: '' },
    ],

    // Departments
    departments: [
      { id: 'dept-001', name: 'Engineering', headcount: 9, manager: 'Michael Chen', managerId: 'emp-010', location: 'San Francisco, CA', costCenter: 'CC-1001' },
      { id: 'dept-002', name: 'Product', headcount: 2, manager: 'Jennifer Lee', managerId: 'emp-020', location: 'San Francisco, CA', costCenter: 'CC-1002' },
      { id: 'dept-003', name: 'Design', headcount: 2, manager: 'Jennifer Lee', managerId: 'emp-020', location: 'San Francisco, CA', costCenter: 'CC-1003' },
      { id: 'dept-004', name: 'Human Resources', headcount: 2, manager: 'Karen White', managerId: 'emp-019', location: 'San Francisco, CA', costCenter: 'CC-2001' },
      { id: 'dept-005', name: 'Finance', headcount: 3, manager: 'David Park', managerId: 'emp-018', location: 'New York, NY', costCenter: 'CC-2002' },
      { id: 'dept-006', name: 'Marketing', headcount: 2, manager: 'Rachel Adams', managerId: 'emp-015', location: 'New York, NY', costCenter: 'CC-3001' },
      { id: 'dept-007', name: 'Sales', headcount: 3, manager: 'Daniel Wright', managerId: 'emp-025', location: 'Chicago, IL', costCenter: 'CC-3002' },
      { id: 'dept-008', name: 'IT', headcount: 1, manager: 'Karen White', managerId: 'emp-019', location: 'San Francisco, CA', costCenter: 'CC-2003' },
      { id: 'dept-009', name: 'Executive', headcount: 2, manager: '', managerId: '', location: 'San Francisco, CA', costCenter: 'CC-0001' },
    ],

    // Locations
    locations: [
      { id: 'loc-001', name: 'San Francisco HQ', address: '100 Market Street, San Francisco, CA 94105', phone: '(415) 555-1000', headcount: 18, type: 'Headquarters' },
      { id: 'loc-002', name: 'New York Office', address: '350 Fifth Avenue, Suite 200, New York, NY 10118', phone: '(212) 555-2000', headcount: 5, type: 'Branch' },
      { id: 'loc-003', name: 'Chicago Office', address: '233 S Wacker Drive, Suite 1500, Chicago, IL 60606', phone: '(312) 555-3000', headcount: 3, type: 'Branch' },
    ],

    // Pay policies
    payPolicies: [
      { id: 'pp-001', name: 'Standard Bi-Weekly', frequency: 'Bi-Weekly', overtimeRule: '1.5x after 40 hrs/week', effectiveDate: '2024-01-01', status: 'Active' },
      { id: 'pp-002', name: 'Executive Monthly', frequency: 'Monthly', overtimeRule: 'Exempt', effectiveDate: '2024-01-01', status: 'Active' },
    ],

    // Saved reports
    savedReports: [
      { id: 'rpt-001', name: 'Monthly Headcount', type: 'Headcount', lastRun: '2026-04-01', schedule: 'Monthly', createdBy: 'Diana Foster' },
      { id: 'rpt-002', name: 'Q1 Payroll Summary', type: 'Payroll Summary', lastRun: '2026-04-01', schedule: 'Quarterly', createdBy: 'David Park' },
      { id: 'rpt-003', name: 'Turnover Report 2026', type: 'Turnover', lastRun: '2026-03-15', schedule: 'Monthly', createdBy: 'Diana Foster' },
      { id: 'rpt-004', name: 'Benefits Enrollment', type: 'Benefits', lastRun: '2026-01-15', schedule: 'Annual', createdBy: 'Diana Foster' },
      { id: 'rpt-005', name: 'Department Cost Analysis', type: 'Custom', lastRun: '2026-03-28', schedule: 'On Demand', createdBy: 'David Park' },
    ],
  }
}

export function getState() {
  try {
    const key = getStorageKey()
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.error('Error reading state:', e)
  }
  return createInitialData()
}

export function setState(newState) {
  try {
    const key = getStorageKey()
    localStorage.setItem(key, JSON.stringify(newState))
    const initKey = key + '_initial'
    if (!localStorage.getItem(initKey)) {
      localStorage.setItem(initKey, JSON.stringify(newState))
    }
  } catch (e) {
    console.error('Error setting state:', e)
  }
}

export function saveState(state) {
  try {
    const key = getStorageKey()
    localStorage.setItem(key, JSON.stringify(state))
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('sid')
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post'
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state }),
    }).catch(() => {})
  } catch (e) {
    console.error('Error saving state:', e)
  }
}

export function initializeState(state) {
  try {
    const key = getStorageKey()
    localStorage.setItem(key, JSON.stringify(state))
    const initKey = key + '_initial'
    if (!localStorage.getItem(initKey)) {
      localStorage.setItem(initKey, JSON.stringify(state))
    }
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('sid')
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post'
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state }),
    }).catch(() => {})
  } catch (e) {
    console.error('Error initializing state:', e)
  }
}

export function resetState() {
  try {
    const key = getStorageKey()
    const initKey = key + '_initial'
    localStorage.removeItem(key)
    localStorage.removeItem(initKey)
  } catch (e) {
    console.error('Error resetting state:', e)
  }
}

export async function fetchCustomState(sid) {
  if (!sid) return null
  try {
    const safeSid = encodeURIComponent(sid)
    const res = await fetch(`/go?sid=${safeSid}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (data && data.current_state && Object.keys(data.current_state).length > 0) {
      return data.current_state
    }
  } catch (e) {
    // Server not available or no state
  }
  return null
}

export function getInitialState() {
  try {
    const key = getStorageKey()
    const initKey = key + '_initial'
    const stored = localStorage.getItem(initKey)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.error('Error reading initial state:', e)
  }
  return createInitialData()
}

export function getStateDiff() {
  const initial = getInitialState()
  const current = getState()
  const diff = {}
  for (const key in current) {
    if (JSON.stringify(current[key]) !== JSON.stringify(initial[key])) {
      diff[key] = { from: initial[key], to: current[key] }
    }
  }
  return diff
}
