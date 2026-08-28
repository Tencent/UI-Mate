export const generateInitialState = () => {
  const currentUser = {
    id: 'emp001',
    name: 'Alex Morgan',
    email: 'alex.morgan@acmecorp.com',
    phone: '+1 (415) 555-0142',
    role: 'Manager',
    department: 'Engineering',
    departmentId: 'dept001',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Morgan&background=0875E1&color=fff&size=128',
    managerId: 'emp002',
    title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    joinDate: '2020-03-15',
    employeeType: 'Full-Time',
    compensationGrade: 'IC4',
    annualSalary: 145000,
    workSchedule: 'Mon-Fri 9:00-17:00',
    skills: ['React', 'Node.js', 'AWS', 'Leadership', 'System Design'],
    birthday: '1990-04-12',
    workAnniversary: '2020-03-15',
  };

  const employees = [
    currentUser,
    {
      id: 'emp002',
      name: 'Sarah Connor',
      email: 'sarah.connor@acmecorp.com',
      phone: '+1 (415) 555-0201',
      role: 'Director',
      department: 'Engineering',
      departmentId: 'dept001',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Connor&background=7C3AED&color=fff&size=128',
      managerId: null,
      title: 'Director of Engineering',
      location: 'San Francisco, CA',
      joinDate: '2018-06-01',
      employeeType: 'Full-Time',
      birthday: '1985-11-03',
      workAnniversary: '2018-06-01',
    },
    {
      id: 'emp003',
      name: 'John Smith',
      email: 'john.smith@acmecorp.com',
      phone: '+1 (415) 555-0198',
      role: 'Employee',
      department: 'Engineering',
      departmentId: 'dept001',
      avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=059669&color=fff&size=128',
      managerId: 'emp001',
      title: 'Junior Developer',
      location: 'Remote',
      joinDate: '2022-01-10',
      employeeType: 'Full-Time',
      birthday: '1995-06-15',
      workAnniversary: '2022-01-10',
    },
    {
      id: 'emp004',
      name: 'Emily Chen',
      email: 'emily.chen@acmecorp.com',
      phone: '+1 (212) 555-0345',
      role: 'Manager',
      department: 'Design',
      departmentId: 'dept002',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Chen&background=EC4899&color=fff&size=128',
      managerId: 'emp002',
      title: 'Product Designer',
      location: 'New York, NY',
      joinDate: '2021-08-20',
      employeeType: 'Full-Time',
      birthday: '1992-09-28',
      workAnniversary: '2021-08-20',
    },
    {
      id: 'emp005',
      name: 'Marcus Johnson',
      email: 'marcus.johnson@acmecorp.com',
      phone: '+1 (415) 555-0267',
      role: 'Employee',
      department: 'Engineering',
      departmentId: 'dept001',
      avatar: 'https://ui-avatars.com/api/?name=Marcus+Johnson&background=2563EB&color=fff&size=128',
      managerId: 'emp001',
      title: 'Senior Developer',
      location: 'San Francisco, CA',
      joinDate: '2021-02-15',
      employeeType: 'Full-Time',
      birthday: '1988-12-20',
      workAnniversary: '2021-02-15',
    },
    {
      id: 'emp006',
      name: 'Lisa Park',
      email: 'lisa.park@acmecorp.com',
      phone: '+1 (415) 555-0389',
      role: 'Employee',
      department: 'Design',
      departmentId: 'dept002',
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Park&background=F59E0B&color=fff&size=128',
      managerId: 'emp004',
      title: 'UX Designer',
      location: 'Remote',
      joinDate: '2023-03-01',
      employeeType: 'Full-Time',
      birthday: '1994-07-08',
      workAnniversary: '2023-03-01',
    },
    {
      id: 'emp007',
      name: 'David Kim',
      email: 'david.kim@acmecorp.com',
      phone: '+1 (310) 555-0412',
      role: 'Manager',
      department: 'Marketing',
      departmentId: 'dept003',
      avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=DC2626&color=fff&size=128',
      managerId: 'emp002',
      title: 'Marketing Manager',
      location: 'Los Angeles, CA',
      joinDate: '2019-09-10',
      employeeType: 'Full-Time',
      birthday: '1987-03-25',
      workAnniversary: '2019-09-10',
    },
    {
      id: 'emp008',
      name: 'Rachel Green',
      email: 'rachel.green@acmecorp.com',
      phone: '+1 (310) 555-0478',
      role: 'Employee',
      department: 'Marketing',
      departmentId: 'dept003',
      avatar: 'https://ui-avatars.com/api/?name=Rachel+Green&background=8B5CF6&color=fff&size=128',
      managerId: 'emp007',
      title: 'Marketing Specialist',
      location: 'Los Angeles, CA',
      joinDate: '2023-06-15',
      employeeType: 'Full-Time',
      birthday: '1996-01-18',
      workAnniversary: '2023-06-15',
    },
    {
      id: 'emp009',
      name: 'James Wilson',
      email: 'james.wilson@acmecorp.com',
      phone: '+1 (415) 555-0534',
      role: 'Employee',
      department: 'Finance',
      departmentId: 'dept004',
      avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=0D9488&color=fff&size=128',
      managerId: 'emp002',
      title: 'Finance Analyst',
      location: 'San Francisco, CA',
      joinDate: '2022-04-01',
      employeeType: 'Full-Time',
      birthday: '1993-10-05',
      workAnniversary: '2022-04-01',
    },
    {
      id: 'emp010',
      name: 'Nina Patel',
      email: 'nina.patel@acmecorp.com',
      phone: '+1 (415) 555-0601',
      role: 'Employee',
      department: 'Human Resources',
      departmentId: 'dept005',
      avatar: 'https://ui-avatars.com/api/?name=Nina+Patel&background=E11D48&color=fff&size=128',
      managerId: 'emp002',
      title: 'HR Coordinator',
      location: 'San Francisco, CA',
      joinDate: '2023-01-09',
      employeeType: 'Full-Time',
      birthday: '1991-05-30',
      workAnniversary: '2023-01-09',
    },
  ];

  const departments = [
    { id: 'dept001', name: 'Engineering', headcount: 4, managerId: 'emp002' },
    { id: 'dept002', name: 'Design', headcount: 2, managerId: 'emp004' },
    { id: 'dept003', name: 'Marketing', headcount: 2, managerId: 'emp007' },
    { id: 'dept004', name: 'Finance', headcount: 1, managerId: 'emp009' },
    { id: 'dept005', name: 'Human Resources', headcount: 1, managerId: 'emp010' },
  ];

  // Generate dates relative to "now" for realistic data
  const today = new Date();
  const fmt = (d) => d.toISOString().split('T')[0];
  const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
  const daysFromNow = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
  const weekdayDaysAgo = (startDaysAgo, count) => {
    const entries = [];
    let d = new Date(today);
    d.setDate(d.getDate() - startDaysAgo);
    while (entries.length < count) {
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) entries.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return entries;
  };

  // Time entries: 15 records for Alex over last 3 weeks
  const timeEntryDates = [];
  for (let w = 2; w >= 0; w--) {
    for (let d = 0; d < 5; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (4 - d)));
      if (date <= today) timeEntryDates.push(date);
    }
  }

  const projects = ['Project Alpha', 'Project Beta', 'Internal Meetings'];
  const timeEntries = timeEntryDates.slice(0, 15).map((date, i) => ({
    entryId: `te${i + 1}`,
    employeeId: 'emp001',
    date: fmt(date),
    hours: i % 5 === 4 ? 6 : 8,
    project: projects[i % 3],
    status: i < 10 ? 'Approved' : 'Pending',
    notes: '',
  }));

  const timeOffRequests = [
    {
      requestId: 'tr1', employeeId: 'emp001', type: 'Vacation',
      startDate: fmt(daysAgo(60)), endDate: fmt(daysAgo(55)), status: 'Approved',
      reason: 'Family vacation', totalHours: 40, reviewedBy: 'emp002', reviewedDate: fmt(daysAgo(65)),
    },
    {
      requestId: 'tr2', employeeId: 'emp001', type: 'Sick',
      startDate: fmt(daysAgo(30)), endDate: fmt(daysAgo(30)), status: 'Approved',
      reason: 'Flu', totalHours: 8, reviewedBy: 'emp002', reviewedDate: fmt(daysAgo(30)),
    },
    {
      requestId: 'tr3', employeeId: 'emp001', type: 'Personal',
      startDate: fmt(daysAgo(90)), endDate: fmt(daysAgo(90)), status: 'Denied',
      reason: 'Team offsite conflict', totalHours: 8, reviewedBy: 'emp002', reviewedDate: fmt(daysAgo(92)),
    },
    {
      requestId: 'tr4', employeeId: 'emp003', type: 'Vacation',
      startDate: fmt(daysFromNow(5)), endDate: fmt(daysFromNow(9)), status: 'Pending',
      reason: 'Personal trip', totalHours: 40, reviewedBy: null, reviewedDate: null,
    },
    {
      requestId: 'tr5', employeeId: 'emp001', type: 'Personal',
      startDate: fmt(daysFromNow(14)), endDate: fmt(daysFromNow(14)), status: 'Pending',
      reason: 'Appointment', totalHours: 8, reviewedBy: null, reviewedDate: null,
    },
  ];

  const timeOffBalance = {
    vacation: 120,
    sick: 40,
    personal: 16,
  };

  // Payroll: 6 biweekly paystubs (Oct - Dec 2024)
  const payroll = [];
  const payDates = [
    { period: 'Oct 1 - Oct 15, 2024', payDate: '2024-10-15' },
    { period: 'Oct 16 - Oct 31, 2024', payDate: '2024-10-31' },
    { period: 'Nov 1 - Nov 15, 2024', payDate: '2024-11-15' },
    { period: 'Nov 16 - Nov 30, 2024', payDate: '2024-11-30' },
    { period: 'Dec 1 - Dec 15, 2024', payDate: '2024-12-15' },
    { period: 'Dec 16 - Dec 31, 2024', payDate: '2024-12-31' },
  ];

  payDates.forEach((p, i) => {
    const grossPay = 5576.92;
    const federalTax = 892.31;
    const stateTax = 445.35;
    const socialSecurity = 345.77;
    const medicare = 80.87;
    const healthInsurance = 120.00;
    const retirement401k = 278.85;
    const otherDeductions = 15.00;
    const totalDeductions = federalTax + stateTax + socialSecurity + medicare + healthInsurance + retirement401k + otherDeductions;
    const netPay = grossPay - totalDeductions;

    payroll.push({
      paystubId: `ps${i + 1}`,
      employeeId: 'emp001',
      period: p.period,
      payDate: p.payDate,
      date: p.payDate,
      grossPay,
      federalTax,
      stateTax,
      socialSecurity,
      medicare,
      healthInsurance,
      retirement401k,
      otherDeductions,
      totalDeductions: parseFloat(totalDeductions.toFixed(2)),
      netPay: parseFloat(netPay.toFixed(2)),
      deductions: parseFloat(totalDeductions.toFixed(2)),
    });
  });

  const benefits = {
    employeeId: 'emp001',
    enrollmentStatus: 'Complete',
    plans: [
      {
        id: 'b1', type: 'Medical', name: 'Medical - PPO Plus', provider: 'BlueCross BlueShield',
        coverageLevel: 'Employee + Spouse', employeeCost: 240.00, employerCost: 680.00,
        cost: 240.00, status: 'Active', effectiveDate: '2024-01-01',
        details: { deductible: 1500, outOfPocketMax: 5000, copay: 25, coinsurance: 20 },
      },
      {
        id: 'b2', type: 'Dental', name: 'Dental - Premium', provider: 'Delta Dental',
        coverageLevel: 'Employee + Spouse', employeeCost: 28.00, employerCost: 55.00,
        cost: 28.00, status: 'Active', effectiveDate: '2024-01-01',
        details: { deductible: 50, annualMax: 2000, preventiveCoverage: '100%' },
      },
      {
        id: 'b3', type: 'Vision', name: 'Vision', provider: 'VSP',
        coverageLevel: 'Employee + Spouse', employeeCost: 12.00, employerCost: 20.00,
        cost: 12.00, status: 'Active', effectiveDate: '2024-01-01',
        details: { examCopay: 10, frameAllowance: 200, contactAllowance: 150 },
      },
      {
        id: 'b4', type: '401k', name: '401(k) Retirement', provider: 'Fidelity',
        coverageLevel: 'Employee Only', employeeCost: 278.85, employerCost: 185.90,
        cost: 278.85, status: 'Active', effectiveDate: '2024-01-01',
        details: { contributionRate: '6%', employerMatch: '4%', vestingSchedule: '3-year graded' },
      },
    ],
    dependents: [
      { id: 'dep1', name: 'Jane Morgan', relationship: 'Spouse', dateOfBirth: '1991-08-22' },
    ],
  };

  const reviews = [
    {
      reviewId: 'r1', employeeId: 'emp001', managerId: 'emp002',
      period: '2023 Annual Review', rating: 'Exceeds Expectations', ratingScore: 4,
      status: 'Completed',
      selfReviewComments: 'I led the AWS migration project, mentored 2 junior developers, and improved our CI/CD pipeline reducing deployment time by 40%.',
      managerComments: 'Alex consistently delivers above expectations. Strong technical skills combined with excellent leadership qualities.',
      comments: 'Great work this year.',
      completedDate: '2024-03-15',
    },
    {
      reviewId: 'r2', employeeId: 'emp001', managerId: 'emp002',
      period: '2024 Mid-Year Review', rating: '', ratingScore: null,
      status: 'Pending Self-Review',
      selfReviewComments: '', managerComments: '', comments: '',
      completedDate: null,
    },
    {
      reviewId: 'r3', employeeId: 'emp003', managerId: 'emp001',
      period: '2024 Mid-Year Review', rating: 'Meets Expectations', ratingScore: 3,
      status: 'Pending Manager Review',
      selfReviewComments: 'I completed 3 feature sprints and passed all code reviews. I would like to take on more responsibility in the next quarter.',
      managerComments: '', comments: 'Good progress on onboarding.',
      completedDate: null,
    },
  ];

  const goals = [
    {
      goalId: 'g1', employeeId: 'emp001',
      title: 'Complete AWS migration',
      description: 'Migrate all 3 core services from on-prem to AWS ECS with zero downtime.',
      category: 'Technical', status: 'On Track', progress: 75,
      dueDate: '2024-12-31', createdDate: '2024-01-15',
      milestones: ['Phase 1 complete', 'Phase 2 in progress', 'Phase 3 planned'],
    },
    {
      goalId: 'g2', employeeId: 'emp001',
      title: 'Mentor 2 junior developers',
      description: 'Provide weekly 1:1 mentoring sessions and help them achieve their first independent feature delivery.',
      category: 'Leadership', status: 'On Track', progress: 50,
      dueDate: '2024-12-31', createdDate: '2024-02-01',
      milestones: ['John paired for feature A', 'Weekly sessions established'],
    },
    {
      goalId: 'g3', employeeId: 'emp001',
      title: 'Reduce build time by 30%',
      description: 'Optimize the CI/CD pipeline to reduce average build time from 20 mins to under 14 mins.',
      category: 'Technical', status: 'At Risk', progress: 20,
      dueDate: '2024-11-30', createdDate: '2024-03-01',
      milestones: ['Audit completed'],
    },
    {
      goalId: 'g4', employeeId: 'emp001',
      title: 'Present at team all-hands',
      description: 'Prepare and deliver a technical presentation on the migration project at the quarterly all-hands.',
      category: 'Personal', status: 'Completed', progress: 100,
      dueDate: '2024-09-30', createdDate: '2024-07-01',
      milestones: ['Slides prepared', 'Rehearsal done', 'Presented successfully'],
    },
  ];

  const tasks = [
    {
      taskId: 't1', employeeId: 'emp001', type: 'Approval', subType: 'Time Off Request',
      description: 'Approve Time Off for John Smith', status: 'Pending',
      dueDate: fmt(daysFromNow(3)), createdDate: fmt(daysAgo(2)),
      relatedId: 'tr4', initiator: 'John Smith', businessProcess: 'Request Time Off',
      priority: 'Normal',
      comments: [
        { id: 'c1', author: 'John Smith', text: 'Hi Alex, I would like to take a week off for a personal trip. My tasks will be covered by Marcus.', timestamp: daysAgo(2).toISOString() },
      ],
    },
    {
      taskId: 't2', employeeId: 'emp001', type: 'Review', subType: 'Performance Review',
      description: 'Complete Performance Review for John Smith', status: 'Pending',
      dueDate: fmt(daysFromNow(10)), createdDate: fmt(daysAgo(5)),
      relatedId: 'r3', initiator: 'HR System', businessProcess: 'Annual Performance Review',
      priority: 'High',
      comments: [],
    },
    {
      taskId: 't3', employeeId: 'emp001', type: 'Compliance', subType: 'Training',
      description: 'Complete Cyber Security Training', status: 'Pending',
      dueDate: fmt(daysFromNow(7)), createdDate: fmt(daysAgo(14)),
      relatedId: null, initiator: 'IT Security', businessProcess: 'Mandatory Training',
      priority: 'High',
      comments: [],
    },
    {
      taskId: 't4', employeeId: 'emp001', type: 'Approval', subType: 'Expense Report',
      description: 'Approve Expense Report for Emily Chen', status: 'Pending',
      dueDate: fmt(daysFromNow(2)), createdDate: fmt(daysAgo(1)),
      relatedId: null, initiator: 'Emily Chen', businessProcess: 'Expense Reimbursement',
      priority: 'Normal',
      comments: [
        { id: 'c2', author: 'Emily Chen', text: 'Conference travel expenses - $1,240 total.', timestamp: daysAgo(1).toISOString() },
      ],
    },
    {
      taskId: 't5', employeeId: 'emp001', type: 'Information', subType: 'Benefits',
      description: 'Review Benefits Enrollment Reminder', status: 'Pending',
      dueDate: fmt(daysFromNow(14)), createdDate: fmt(daysAgo(3)),
      relatedId: null, initiator: 'HR System', businessProcess: 'Benefits Enrollment',
      priority: 'Low',
      comments: [],
    },
    {
      taskId: 't6', employeeId: 'emp001', type: 'Approval', subType: 'Time Off Request',
      description: 'Approve Time Off for Marcus Johnson', status: 'Completed',
      dueDate: fmt(daysAgo(10)), createdDate: fmt(daysAgo(15)),
      relatedId: null, initiator: 'Marcus Johnson', businessProcess: 'Request Time Off',
      priority: 'Normal',
      comments: [
        { id: 'c3', author: 'Alex Morgan', text: 'Approved. Have a great time!', timestamp: daysAgo(10).toISOString() },
      ],
    },
  ];

  const notifications = [
    {
      id: 'n1', type: 'task', title: 'Time Off Request',
      message: 'John Smith has requested time off and needs your approval.',
      timestamp: daysAgo(2).toISOString(), read: false, link: '/inbox',
    },
    {
      id: 'n2', type: 'pay', title: 'Payslip Ready',
      message: 'Your payslip for Dec 16-31 is now available.',
      timestamp: daysAgo(3).toISOString(), read: false, link: '/pay',
    },
    {
      id: 'n3', type: 'task', title: 'Performance Review Due',
      message: 'Performance review deadline for John Smith is approaching.',
      timestamp: daysAgo(5).toISOString(), read: false, link: '/inbox',
    },
    {
      id: 'n4', type: 'system', title: 'Benefits Enrollment Reminder',
      message: 'Open enrollment period ends on November 30. Review your benefits.',
      timestamp: daysAgo(7).toISOString(), read: true, link: '/benefits',
    },
    {
      id: 'n5', type: 'timeoff', title: 'Time Off Approved',
      message: 'Your vacation request for Dec 20-28 has been approved.',
      timestamp: daysAgo(14).toISOString(), read: true, link: '/time',
    },
    {
      id: 'n6', type: 'system', title: 'Welcome to Q4!',
      message: 'New quarter goals and team priorities are now available.',
      timestamp: daysAgo(30).toISOString(), read: true, link: '/',
    },
  ];

  const announcements = [
    {
      id: 'a1', title: 'Open Enrollment Begins Nov 1', date: fmt(daysAgo(10)),
      content: 'Benefits open enrollment starts next week. Please review your plan options and make any changes before November 30. Contact HR for assistance.',
      category: 'Benefits', priority: 'High',
    },
    {
      id: 'a2', title: 'Holiday Office Closure Schedule', date: fmt(daysAgo(14)),
      content: 'The office will be closed on Nov 28-29 for Thanksgiving and Dec 24-25 for Christmas. Please plan accordingly.',
      category: 'Company', priority: 'Normal',
    },
    {
      id: 'a3', title: 'Q4 All-Hands Meeting', date: fmt(daysAgo(7)),
      content: 'Join us for the quarterly all-hands meeting next Friday at 2:00 PM PST in the main conference room or via Zoom.',
      category: 'Company', priority: 'Normal',
    },
    {
      id: 'a4', title: 'New Cyber Security Training Required', date: fmt(daysAgo(14)),
      content: 'All employees must complete the updated Cyber Security Awareness Training by end of month. Access it through the Learning portal.',
      category: 'IT', priority: 'High',
    },
    {
      id: 'a5', title: 'Wellness Program Launch', date: fmt(daysAgo(21)),
      content: 'We are excited to announce our new employee wellness program including gym reimbursement, mental health resources, and wellness challenges.',
      category: 'HR', priority: 'Normal',
    },
  ];

  return {
    currentUser,
    employees,
    departments,
    timeEntries,
    timeOffRequests,
    timeOffBalance,
    payroll,
    benefits,
    reviews,
    goals,
    tasks,
    announcements,
    notifications,
    contactDrafts: [],
    clockStatus: { isClockedIn: false, startTime: null },
  };
};

// --- Session-aware storage functions ---

const BASE_STORAGE_KEY = 'hr_platform_state';
const BASE_INITIAL_KEY = 'hr_platform_initialState';

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
  } catch (e) { /* No custom state available */ }
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

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

// --- Array item normalizers ---

function normalizeEmployee(emp, index) {
  return {
    id: emp.id || `emp_custom_${index}`,
    name: emp.name || emp.fullName || emp.displayName || 'Unknown',
    email: emp.email || '',
    phone: emp.phone || '',
    role: emp.role || 'Employee',
    department: emp.department || emp.dept || '',
    departmentId: emp.departmentId || '',
    avatar: emp.avatar || emp.photo || '',
    managerId: emp.managerId || emp.manager || null,
    title: emp.title || emp.position || emp.jobTitle || '',
    location: emp.location || emp.office || '',
    joinDate: emp.joinDate || emp.startDate || emp.hireDate || '',
    employeeType: emp.employeeType || 'Full-Time',
    birthday: emp.birthday || '',
    workAnniversary: emp.workAnniversary || emp.joinDate || '',
  };
}

function normalizeTimeEntry(entry, index) {
  return {
    entryId: entry.entryId || entry.id || `te_custom_${index}`,
    employeeId: entry.employeeId || entry.employee || 'emp001',
    date: entry.date || '',
    hours: typeof entry.hours === 'number' ? entry.hours : 0,
    project: entry.project || entry.projectName || 'General',
    status: entry.status || 'Pending',
    notes: entry.notes || '',
  };
}

function normalizeTimeOffRequest(req, index) {
  return {
    requestId: req.requestId || req.id || `tr_custom_${index}`,
    employeeId: req.employeeId || req.employee || 'emp001',
    type: req.type || req.leaveType || 'Vacation',
    startDate: req.startDate || req.from || '',
    endDate: req.endDate || req.to || '',
    status: req.status || 'Pending',
    reason: req.reason || req.note || '',
    totalHours: typeof req.totalHours === 'number' ? req.totalHours : 0,
    reviewedBy: req.reviewedBy || null,
    reviewedDate: req.reviewedDate || null,
  };
}

function normalizePaystub(ps, index) {
  return {
    paystubId: ps.paystubId || ps.id || `ps_custom_${index}`,
    employeeId: ps.employeeId || ps.employee || 'emp001',
    period: ps.period || '',
    payDate: ps.payDate || ps.date || '',
    date: ps.date || ps.payDate || '',
    grossPay: typeof ps.grossPay === 'number' ? ps.grossPay : 0,
    federalTax: typeof ps.federalTax === 'number' ? ps.federalTax : 0,
    stateTax: typeof ps.stateTax === 'number' ? ps.stateTax : 0,
    socialSecurity: typeof ps.socialSecurity === 'number' ? ps.socialSecurity : 0,
    medicare: typeof ps.medicare === 'number' ? ps.medicare : 0,
    healthInsurance: typeof ps.healthInsurance === 'number' ? ps.healthInsurance : 0,
    retirement401k: typeof ps.retirement401k === 'number' ? ps.retirement401k : 0,
    otherDeductions: typeof ps.otherDeductions === 'number' ? ps.otherDeductions : 0,
    totalDeductions: typeof ps.totalDeductions === 'number' ? ps.totalDeductions : (typeof ps.deductions === 'number' ? ps.deductions : 0),
    netPay: typeof ps.netPay === 'number' ? ps.netPay : 0,
    deductions: typeof ps.deductions === 'number' ? ps.deductions : (typeof ps.totalDeductions === 'number' ? ps.totalDeductions : 0),
  };
}

function normalizeBenefitPlan(plan, index) {
  return {
    id: plan.id || `b_custom_${index}`,
    type: plan.type || '',
    name: plan.name || plan.planName || 'Unknown Plan',
    provider: plan.provider || '',
    coverageLevel: plan.coverageLevel || 'Employee Only',
    employeeCost: typeof plan.employeeCost === 'number' ? plan.employeeCost : (typeof plan.cost === 'number' ? plan.cost : 0),
    employerCost: typeof plan.employerCost === 'number' ? plan.employerCost : 0,
    cost: typeof plan.cost === 'number' ? plan.cost : (typeof plan.employeeCost === 'number' ? plan.employeeCost : 0),
    status: plan.status || 'Active',
    effectiveDate: plan.effectiveDate || '',
    details: plan.details || {},
  };
}

function normalizeReview(review, index) {
  return {
    reviewId: review.reviewId || review.id || `r_custom_${index}`,
    employeeId: review.employeeId || review.employee || 'emp001',
    managerId: review.managerId || review.manager || '',
    period: review.period || '',
    rating: review.rating || '',
    ratingScore: typeof review.ratingScore === 'number' ? review.ratingScore : null,
    status: review.status || 'Pending',
    selfReviewComments: review.selfReviewComments || '',
    managerComments: review.managerComments || '',
    comments: review.comments || review.feedback || '',
    completedDate: review.completedDate || null,
  };
}

function normalizeTask(task, index) {
  return {
    taskId: task.taskId || task.id || `t_custom_${index}`,
    employeeId: task.employeeId || task.employee || 'emp001',
    type: task.type || task.taskType || 'General',
    subType: task.subType || '',
    description: task.description || task.title || task.text || '',
    status: task.status || 'Pending',
    dueDate: task.dueDate || task.due || '',
    createdDate: task.createdDate || '',
    relatedId: task.relatedId || task.related || null,
    initiator: task.initiator || '',
    businessProcess: task.businessProcess || '',
    priority: task.priority || 'Normal',
    comments: Array.isArray(task.comments) ? task.comments : [],
  };
}

function normalizeAnnouncement(ann, index) {
  return {
    id: ann.id || `a_custom_${index}`,
    title: ann.title || ann.headline || 'Announcement',
    date: ann.date || ann.publishedAt || '',
    content: ann.content || ann.body || ann.text || '',
    category: ann.category || 'Company',
    priority: ann.priority || 'Normal',
  };
}

function normalizeDepartment(dept, index) {
  return {
    id: dept.id || `dept_custom_${index}`,
    name: dept.name || 'Unknown Department',
    headcount: typeof dept.headcount === 'number' ? dept.headcount : 0,
    managerId: dept.managerId || null,
  };
}

function normalizeGoal(goal, index) {
  return {
    goalId: goal.goalId || goal.id || `g_custom_${index}`,
    employeeId: goal.employeeId || 'emp001',
    title: goal.title || '',
    description: goal.description || '',
    category: goal.category || 'Technical',
    status: goal.status || 'Not Started',
    progress: typeof goal.progress === 'number' ? goal.progress : 0,
    dueDate: goal.dueDate || '',
    createdDate: goal.createdDate || '',
    milestones: Array.isArray(goal.milestones) ? goal.milestones : [],
  };
}

function normalizeNotification(notif, index) {
  return {
    id: notif.id || `n_custom_${index}`,
    type: notif.type || 'system',
    title: notif.title || '',
    message: notif.message || '',
    timestamp: notif.timestamp || new Date().toISOString(),
    read: typeof notif.read === 'boolean' ? notif.read : false,
    link: notif.link || '/',
  };
}

function normalizeDependent(dep, index) {
  return {
    id: dep.id || `dep_custom_${index}`,
    name: dep.name || '',
    relationship: dep.relationship || '',
    dateOfBirth: dep.dateOfBirth || dep.dob || '',
  };
}

const arrayNormalizers = {
  employees: normalizeEmployee,
  timeEntries: normalizeTimeEntry,
  timeOffRequests: normalizeTimeOffRequest,
  payroll: normalizePaystub,
  reviews: normalizeReview,
  tasks: normalizeTask,
  announcements: normalizeAnnouncement,
  departments: normalizeDepartment,
  goals: normalizeGoal,
  notifications: normalizeNotification,
};

// Normalizers for nested arrays within objects
const nestedArrayNormalizers = {
  'benefits.plans': normalizeBenefitPlan,
  'benefits.dependents': normalizeDependent,
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key]) && arrayNormalizers[key]) {
        result[key] = custom[key].map((item, i) => arrayNormalizers[key](item, i));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeNested(defaults[key], custom[key], key);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

function deepMergeNested(defaults, custom, parentKey) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      const fullKey = `${parentKey}.${key}`;
      if (Array.isArray(custom[key]) && nestedArrayNormalizers[fullKey]) {
        result[key] = custom[key].map((item, i) => nestedArrayNormalizers[fullKey](item, i));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeNested(defaults[key], custom[key], fullKey);
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
    const initialData = deepMergeWithDefaults(generateInitialState(), customState);
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const initialData = generateInitialState();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};
