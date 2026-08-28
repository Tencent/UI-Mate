// dataManager.js - State initialization and session helpers

const BASE_KEY = 'greenhouseState';
const BASE_INITIAL_KEY = 'greenhouseInitialState';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('greenhouse_sid', sid);
    return sid;
  }
  return sessionStorage.getItem('greenhouse_sid') || null;
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

export const fetchCustomState = async (sid) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.has_custom_state && data.stored_state) {
      return data.stored_state;
    }
    return null;
  } catch {
    return null;
  }
};

export const saveState = (state, sid) => {
  try {
    localStorage.setItem(storageKey(sid), JSON.stringify(state));
    const effectiveSid = sid ? encodeURIComponent(sid) : 'default';
    fetch(`/post?sid=${effectiveSid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state })
    }).catch(() => {});
  } catch {}
};

function deepMerge(defaults, custom) {
  if (custom === null || custom === undefined) return defaults;
  if (Array.isArray(custom)) return custom;
  if (typeof custom !== 'object' || typeof defaults !== 'object') return custom;
  const result = { ...defaults };
  for (const key of Object.keys(custom)) {
    if (custom[key] === null || custom[key] === undefined) continue;
    if (Array.isArray(custom[key])) {
      result[key] = custom[key];
    } else if (typeof custom[key] === 'object' && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
      result[key] = deepMerge(defaults[key], custom[key]);
    } else {
      result[key] = custom[key];
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const key = storageKey(sid);
  const initKey = initialKey(sid);

  // ★ When a caller-provided customState is supplied (i.e. the async load
  //   phase in AppContext just fetched task-specific state from /state),
  //   it ALWAYS wins over whatever localStorage currently holds.
  //
  //   Why: the synchronous cold-start path below seeds localStorage with the
  //   default fixture for the very first render. If we let `localStorage` win
  //   here, the second call (with customState) would short-circuit on the
  //   stale defaults and the task state would be silently dropped — and then
  //   pushed back to the server by the saveState() effect, overwriting the
  //   .json file setup.py just wrote. (This is the exact race we are fixing.)
  if (customState) {
    const defaults = createInitialData();
    const data = deepMerge(defaults, customState);
    localStorage.setItem(initKey, JSON.stringify(data));
    localStorage.setItem(key, JSON.stringify(data));

    const effectiveSid = sid ? encodeURIComponent(sid) : 'default';
    fetch(`/post?sid=${effectiveSid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state: data })
    }).catch(() => {});

    return data;
  }

  // No customState provided: this is either the synchronous cold-start path
  // (useReducer init) or a refresh. localStorage stored value, if any, wins —
  // that lets navigation/refresh keep in-memory mutations until the load
  // phase re-fetches from the server.
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fall through to defaults
    }
  }

  // Cold start with no localStorage and no customState: synthesize the
  // default fixture for the in-memory React store + localStorage ONLY. Do
  // NOT POST back to the server with action:'set' — otherwise this would
  // race with setup.py and overwrite the task-specific state it just POSTed
  // via /post?sid=..., because action:'set' on the server unconditionally
  // rewrites the .json. The async fetchCustomState() in AppContext will
  // pull the real server state right after and dispatch SET_STATE to
  // replace this seed (and re-enter this function with customState set).
  const defaults = createInitialData();
  localStorage.setItem(initKey, JSON.stringify(defaults));
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};

export const getInitialState = (sid = null) => {
  const initKey = initialKey(sid);
  const stored = localStorage.getItem(initKey);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  return null;
};

export function createInitialData() {
  const users = [
    { id: 'user-1', firstName: 'Jules', lastName: 'Park', name: 'Jules Park', email: 'jules.park@company.com', role: 'recruiter', avatarUrl: null, department: 'People Operations', title: 'Senior Recruiter' },
    { id: 'user-2', firstName: 'Sarah', lastName: 'Chen', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'recruiter', avatarUrl: null, department: 'People Operations', title: 'Recruiter' },
    { id: 'user-3', firstName: 'David', lastName: 'Kim', name: 'David Kim', email: 'david.kim@company.com', role: 'hiring_manager', avatarUrl: null, department: 'Engineering', title: 'VP of Engineering' },
    { id: 'user-4', firstName: 'Emily', lastName: 'Rodriguez', name: 'Emily Rodriguez', email: 'emily.rodriguez@company.com', role: 'hiring_manager', avatarUrl: null, department: 'Design', title: 'Head of Design' },
    { id: 'user-5', firstName: 'Marcus', lastName: 'Johnson', name: 'Marcus Johnson', email: 'marcus.johnson@company.com', role: 'interviewer', avatarUrl: null, department: 'Engineering', title: 'Staff Engineer' },
    { id: 'user-6', firstName: 'Priya', lastName: 'Patel', name: 'Priya Patel', email: 'priya.patel@company.com', role: 'interviewer', avatarUrl: null, department: 'Engineering', title: 'Senior Engineer' },
    { id: 'user-7', firstName: 'James', lastName: 'Wright', name: 'James Wright', email: 'james.wright@company.com', role: 'coordinator', avatarUrl: null, department: 'People Operations', title: 'Recruiting Coordinator' },
    { id: 'user-8', firstName: 'Lisa', lastName: 'Thompson', name: 'Lisa Thompson', email: 'lisa.thompson@company.com', role: 'admin', avatarUrl: null, department: 'People Operations', title: 'HR Director' },
    { id: 'user-9', firstName: 'Kevin', lastName: 'Wang', name: 'Kevin Wang', email: 'kevin.wang@company.com', role: 'hiring_manager', avatarUrl: null, department: 'Sales', title: 'VP of Sales' },
    { id: 'user-10', firstName: 'Rachel', lastName: 'Green', name: 'Rachel Green', email: 'rachel.green@company.com', role: 'interviewer', avatarUrl: null, department: 'Product', title: 'Senior PM' }
  ];

  const departments = [
    { id: 'dept-1', name: 'Engineering', parentId: null },
    { id: 'dept-2', name: 'Design', parentId: null },
    { id: 'dept-3', name: 'Product', parentId: null },
    { id: 'dept-4', name: 'Marketing', parentId: null },
    { id: 'dept-5', name: 'Sales', parentId: null },
    { id: 'dept-6', name: 'People Operations', parentId: null },
    { id: 'dept-7', name: 'Finance', parentId: null },
    { id: 'dept-8', name: 'Customer Success', parentId: null }
  ];

  const offices = [
    { id: 'office-1', name: 'San Francisco HQ', location: 'San Francisco, CA' },
    { id: 'office-2', name: 'New York', location: 'New York, NY' },
    { id: 'office-3', name: 'Remote', location: 'Remote' },
    { id: 'office-4', name: 'Austin', location: 'Austin, TX' }
  ];

  const sources = [
    { id: 'src-1', name: 'Applied' },
    { id: 'src-2', name: 'Referral' },
    { id: 'src-3', name: 'LinkedIn' },
    { id: 'src-4', name: 'Indeed' },
    { id: 'src-5', name: 'Xreenhouse Job Board' },
    { id: 'src-6', name: 'Agency - TechRecruit' },
    { id: 'src-7', name: 'Internal Transfer' }
  ];

  const rejectionReasons = [
    { id: 'rr-1', name: 'Lacking technical skills' },
    { id: 'rr-2', name: 'Lacking culture fit' },
    { id: 'rr-3', name: 'Position filled' },
    { id: 'rr-4', name: 'Candidate withdrew' },
    { id: 'rr-5', name: 'Overqualified' },
    { id: 'rr-6', name: 'Underqualified' },
    { id: 'rr-7', name: 'Better qualified candidate' },
    { id: 'rr-8', name: 'Compensation mismatch' }
  ];

  const makeStages = (jobId, customStages) => {
    const defaults = [
      { name: 'Application Review', stageType: 'application_review' },
      { name: 'Recruiter Phone Screen', stageType: 'phone_screen' },
      { name: 'Hiring Manager Screen', stageType: 'phone_screen' },
      { name: 'Technical Interview', stageType: 'interview' },
      { name: 'Take Home Test', stageType: 'take_home' },
      { name: 'Onsite Interview', stageType: 'onsite' },
      { name: 'Offer', stageType: 'offer' },
      { name: 'Hired', stageType: 'hired' }
    ];
    const stageList = customStages || defaults;
    return stageList.map((s, i) => ({
      id: `stage-${jobId}-${i + 1}`,
      jobId,
      name: s.name,
      orderIndex: i,
      stageType: s.stageType
    }));
  };

  // 10 jobs
  const jobDefs = [
    { id: 'job-1', title: 'Senior Frontend Engineer', status: 'open', deptId: 'dept-1', officeId: 'office-1', hmId: 'user-3', recId: 'user-1', coordId: 'user-7', openings: 2, openDate: '2026-01-15', desc: 'We are looking for a Senior Frontend Engineer to join our growing engineering team. You will work on building and maintaining our core web application using React and TypeScript.', reqs: ['5+ years of frontend development experience', 'Expert knowledge of React and modern JavaScript', 'Experience with TypeScript', 'Strong understanding of web performance optimization', 'Experience with testing frameworks', 'Excellent communication skills'] },
    { id: 'job-2', title: 'Product Designer', status: 'open', deptId: 'dept-2', officeId: 'office-2', hmId: 'user-4', recId: 'user-1', coordId: 'user-7', openings: 1, openDate: '2026-02-01', desc: 'Join our design team to craft beautiful, user-centered experiences for our platform.', reqs: ['4+ years of product design experience', 'Expert in Figma', 'Experience with user research', 'Portfolio demonstrating end-to-end product design', 'Experience with design systems'] },
    { id: 'job-3', title: 'Backend Engineer', status: 'open', deptId: 'dept-1', officeId: 'office-3', hmId: 'user-3', recId: 'user-2', coordId: null, openings: 3, openDate: '2026-01-20', desc: 'We are hiring Backend Engineers to help scale our infrastructure and build robust APIs.', reqs: ['3+ years of backend development', 'Proficiency in Python or Go', 'Experience with microservices architecture', 'Knowledge of SQL and NoSQL databases', 'AWS/GCP experience'] },
    { id: 'job-4', title: 'Product Manager', status: 'open', deptId: 'dept-3', officeId: 'office-1', hmId: 'user-3', recId: 'user-1', coordId: 'user-7', openings: 1, openDate: '2026-02-15', desc: 'We need a Product Manager to lead the development of core platform features.', reqs: ['4+ years of product management', 'Strong analytical mindset', 'Agile/Scrum experience', 'Excellent stakeholder management', 'B2B SaaS experience preferred'] },
    { id: 'job-5', title: 'Marketing Coordinator', status: 'open', deptId: 'dept-4', officeId: 'office-2', hmId: 'user-8', recId: 'user-2', coordId: null, openings: 1, openDate: '2026-03-01', desc: 'Support content creation, campaign management, and brand initiatives.', reqs: ['2+ years of marketing experience', 'Strong written communication', 'Marketing automation tools experience', 'SEO and content marketing knowledge'] },
    { id: 'job-6', title: 'DevOps Engineer', status: 'closed', deptId: 'dept-1', officeId: 'office-1', hmId: 'user-3', recId: 'user-1', coordId: 'user-7', openings: 1, openDate: '2025-10-01', closeDate: '2026-02-28', desc: 'Build and maintain CI/CD pipelines and cloud infrastructure. This position has been filled.', reqs: ['3+ years DevOps experience', 'Expert in Kubernetes and Docker', 'AWS/GCP experience', 'Terraform experience'] },
    { id: 'job-7', title: 'Account Executive', status: 'open', deptId: 'dept-5', officeId: 'office-4', hmId: 'user-9', recId: 'user-2', coordId: null, openings: 2, openDate: '2026-02-20', desc: 'Drive revenue growth by managing the full sales cycle from prospecting to close for enterprise clients.', reqs: ['3+ years B2B SaaS sales experience', 'Track record of exceeding quota', 'Experience with Salesforce CRM', 'Excellent presentation skills', 'Enterprise deal experience'] },
    { id: 'job-8', title: 'Data Analyst', status: 'open', deptId: 'dept-3', officeId: 'office-3', hmId: 'user-10', recId: 'user-1', coordId: null, openings: 1, openDate: '2026-03-10', desc: 'Analyze product and business data to drive insights and inform strategic decisions.', reqs: ['2+ years data analysis experience', 'Proficiency in SQL and Python', 'Experience with BI tools (Looker, Tableau)', 'Strong communication of data insights', 'Statistical analysis background'] },
    { id: 'job-9', title: 'Customer Success Manager', status: 'open', deptId: 'dept-8', officeId: 'office-2', hmId: 'user-8', recId: 'user-2', coordId: null, openings: 1, openDate: '2026-03-15', desc: 'Own the post-sale customer relationship, driving adoption, retention, and expansion.', reqs: ['3+ years in customer success or account management', 'B2B SaaS experience', 'Excellent relationship building skills', 'Data-driven approach', 'Experience with CS platforms'] },
    { id: 'job-10', title: 'UX Researcher', status: 'draft', deptId: 'dept-2', officeId: 'office-1', hmId: 'user-4', recId: 'user-1', coordId: null, openings: 1, openDate: '2026-04-01', desc: 'Lead user research efforts to inform product and design decisions across the organization.', reqs: ['3+ years UX research experience', 'Mixed methods expertise', 'Experience with research repositories', 'Strong storytelling and presentation skills'] }
  ];

  const allStages = [];
  const jobs = jobDefs.map(jd => {
    let customStages = null;
    if (jd.id === 'job-2') customStages = [
      { name: 'Application Review', stageType: 'application_review' },
      { name: 'Recruiter Phone Screen', stageType: 'phone_screen' },
      { name: 'Hiring Manager Screen', stageType: 'phone_screen' },
      { name: 'Technical Interview', stageType: 'interview' },
      { name: 'Portfolio Review', stageType: 'take_home' },
      { name: 'Onsite Interview', stageType: 'onsite' },
      { name: 'Offer', stageType: 'offer' },
      { name: 'Hired', stageType: 'hired' }
    ];
    if (jd.id === 'job-3') customStages = [
      { name: 'Application Review', stageType: 'application_review' },
      { name: 'Recruiter Phone Screen', stageType: 'phone_screen' },
      { name: 'Hiring Manager Screen', stageType: 'phone_screen' },
      { name: 'Technical Interview', stageType: 'interview' },
      { name: 'Coding Challenge', stageType: 'take_home' },
      { name: 'Onsite Interview', stageType: 'onsite' },
      { name: 'Offer', stageType: 'offer' },
      { name: 'Hired', stageType: 'hired' }
    ];
    if (jd.id === 'job-4') customStages = [
      { name: 'Application Review', stageType: 'application_review' },
      { name: 'Recruiter Phone Screen', stageType: 'phone_screen' },
      { name: 'Hiring Manager Screen', stageType: 'phone_screen' },
      { name: 'Product Case Study', stageType: 'take_home' },
      { name: 'Panel Interview', stageType: 'interview' },
      { name: 'Executive Interview', stageType: 'onsite' },
      { name: 'Offer', stageType: 'offer' },
      { name: 'Hired', stageType: 'hired' }
    ];

    const stages = makeStages(jd.id, customStages);
    allStages.push(...stages);

    return {
      id: jd.id,
      title: jd.title,
      status: jd.status,
      departmentId: jd.deptId,
      officeId: jd.officeId,
      hiringManagerId: jd.hmId,
      recruiterId: jd.recId,
      coordinatorId: jd.coordId,
      openings: jd.openings,
      openDate: jd.openDate,
      closeDate: jd.closeDate || null,
      description: jd.desc,
      requirements: jd.reqs,
      stages: stages.map(s => s.id),
      candidateCount: 0,
      createdAt: `${jd.openDate}T09:00:00Z`,
      updatedAt: `${jd.openDate}T09:00:00Z`
    };
  });

  // 32 candidates
  const candidates = [
    { id: 'cand-1', firstName: 'Alex', lastName: 'Chen', name: 'Alex Chen', email: 'alex.chen@gmail.com', phone: '(415) 555-0101', location: 'San Francisco, CA', currentCompany: 'Stripe', currentTitle: 'Frontend Engineer', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['react', 'senior'], createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-03-15T10:00:00Z' },
    { id: 'cand-2', firstName: 'Maria', lastName: 'Santos', name: 'Maria Santos', email: 'maria.santos@outlook.com', phone: '(212) 555-0102', location: 'New York, NY', currentCompany: 'Figma', currentTitle: 'Senior Frontend Developer', resumeUrl: '#', linkedinUrl: '#', source: 'referral', referrerId: 'user-5', tags: ['typescript', 'react'], createdAt: '2026-01-22T10:00:00Z', updatedAt: '2026-04-08T10:00:00Z' },
    { id: 'cand-3', firstName: 'Jordan', lastName: 'Williams', name: 'Jordan Williams', email: 'jordan.w@protonmail.com', phone: '(650) 555-0103', location: 'Palo Alto, CA', currentCompany: 'Airbnb', currentTitle: 'Staff Frontend Engineer', resumeUrl: '#', linkedinUrl: '#', source: 'sourced', referrerId: null, tags: ['leadership', 'react', 'typescript'], createdAt: '2026-01-25T10:00:00Z', updatedAt: '2026-04-09T10:00:00Z' },
    { id: 'cand-4', firstName: 'Aisha', lastName: 'Okonkwo', name: 'Aisha Okonkwo', email: 'aisha.ok@gmail.com', phone: '(510) 555-0104', location: 'Oakland, CA', currentCompany: 'Notion', currentTitle: 'Frontend Engineer', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['react', 'performance'], createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z' },
    { id: 'cand-5', firstName: 'Ryan', lastName: 'Park', name: 'Ryan Park', email: 'ryan.park@gmail.com', phone: '(415) 555-0105', location: 'San Francisco, CA', currentCompany: 'Dropbox', currentTitle: 'Senior Software Engineer', resumeUrl: '#', linkedinUrl: '#', source: 'referral', referrerId: 'user-6', tags: ['fullstack'], createdAt: '2026-02-05T10:00:00Z', updatedAt: '2026-02-05T10:00:00Z' },
    { id: 'cand-6', firstName: 'Nina', lastName: 'Zhao', name: 'Nina Zhao', email: 'nina.zhao@yahoo.com', phone: '(646) 555-0106', location: 'New York, NY', currentCompany: 'Squarespace', currentTitle: 'Product Designer', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['figma', 'ux'], createdAt: '2026-02-10T10:00:00Z', updatedAt: '2026-04-05T10:00:00Z' },
    { id: 'cand-7', firstName: 'Dante', lastName: 'Rivera', name: 'Dante Rivera', email: 'dante.r@gmail.com', phone: '(718) 555-0107', location: 'Brooklyn, NY', currentCompany: 'Etsy', currentTitle: 'Senior Product Designer', resumeUrl: '#', linkedinUrl: '#', source: 'sourced', referrerId: null, tags: ['design-systems', 'figma'], createdAt: '2026-02-12T10:00:00Z', updatedAt: '2026-04-09T10:00:00Z' },
    { id: 'cand-8', firstName: 'Sophie', lastName: 'Martin', name: 'Sophie Martin', email: 'sophie.martin@gmail.com', phone: '(212) 555-0108', location: 'New York, NY', currentCompany: 'HubSpot', currentTitle: 'UX Designer', resumeUrl: '#', linkedinUrl: '#', source: 'agency', referrerId: null, tags: ['ux', 'research'], createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-03-20T10:00:00Z' },
    { id: 'cand-9', firstName: 'Kwame', lastName: 'Asante', name: 'Kwame Asante', email: 'kwame.asante@hotmail.com', phone: '(415) 555-0109', location: 'San Francisco, CA', currentCompany: 'MongoDB', currentTitle: 'Backend Engineer', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['python', 'distributed-systems'], createdAt: '2026-01-28T10:00:00Z', updatedAt: '2026-03-20T10:00:00Z' },
    { id: 'cand-10', firstName: 'Isabella', lastName: 'Nguyen', name: 'Isabella Nguyen', email: 'isabella.n@gmail.com', phone: '(408) 555-0110', location: 'San Jose, CA', currentCompany: 'Netflix', currentTitle: 'Senior Backend Engineer', resumeUrl: '#', linkedinUrl: '#', source: 'referral', referrerId: 'user-3', tags: ['go', 'microservices'], createdAt: '2026-01-30T10:00:00Z', updatedAt: '2026-04-05T10:00:00Z' },
    { id: 'cand-11', firstName: 'Liam', lastName: 'OBrien', name: 'Liam OBrien', email: 'liam.obrien@gmail.com', phone: '(503) 555-0111', location: 'Portland, OR', currentCompany: 'Twilio', currentTitle: 'Software Engineer', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['python', 'api'], createdAt: '2026-02-03T10:00:00Z', updatedAt: '2026-04-01T10:00:00Z' },
    { id: 'cand-12', firstName: 'Fatima', lastName: 'Al-Hassan', name: 'Fatima Al-Hassan', email: 'fatima.ah@gmail.com', phone: '(650) 555-0112', location: 'Remote', currentCompany: 'Shopify', currentTitle: 'Senior Engineer', resumeUrl: '#', linkedinUrl: '#', source: 'sourced', referrerId: null, tags: ['ruby', 'rails', 'go'], createdAt: '2026-02-07T10:00:00Z', updatedAt: '2026-03-25T10:00:00Z' },
    { id: 'cand-13', firstName: 'Marcus', lastName: 'Lee', name: 'Marcus Lee', email: 'marcus.lee@outlook.com', phone: '(415) 555-0113', location: 'San Francisco, CA', currentCompany: 'Salesforce', currentTitle: 'Product Manager', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['b2b', 'saas'], createdAt: '2026-02-18T10:00:00Z', updatedAt: '2026-03-25T10:00:00Z' },
    { id: 'cand-14', firstName: 'Priya', lastName: 'Sharma', name: 'Priya Sharma', email: 'priya.sharma@gmail.com', phone: '(650) 555-0114', location: 'Menlo Park, CA', currentCompany: 'Google', currentTitle: 'Senior Product Manager', resumeUrl: '#', linkedinUrl: '#', source: 'sourced', referrerId: null, tags: ['growth', 'analytics'], createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-04-07T10:00:00Z' },
    { id: 'cand-15', firstName: 'Tyler', lastName: 'Brooks', name: 'Tyler Brooks', email: 'tyler.brooks@yahoo.com', phone: '(212) 555-0115', location: 'New York, NY', currentCompany: 'Spotify', currentTitle: 'Marketing Coordinator', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['content', 'social-media'], createdAt: '2026-03-05T10:00:00Z', updatedAt: '2026-04-02T10:00:00Z' },
    { id: 'cand-16', firstName: 'Zoe', lastName: 'Anderson', name: 'Zoe Anderson', email: 'zoe.anderson@gmail.com', phone: '(646) 555-0116', location: 'New York, NY', currentCompany: 'BuzzFeed', currentTitle: 'Digital Marketing Specialist', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['seo', 'content'], createdAt: '2026-03-08T10:00:00Z', updatedAt: '2026-03-20T10:00:00Z' },
    { id: 'cand-17', firstName: 'Carlos', lastName: 'Mendez', name: 'Carlos Mendez', email: 'carlos.m@gmail.com', phone: '(415) 555-0117', location: 'San Francisco, CA', currentCompany: 'Hashicorp', currentTitle: 'DevOps Engineer', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['kubernetes', 'terraform'], createdAt: '2025-10-15T10:00:00Z', updatedAt: '2026-02-28T10:00:00Z' },
    { id: 'cand-18', firstName: 'Amara', lastName: 'Diallo', name: 'Amara Diallo', email: 'amara.d@gmail.com', phone: '(718) 555-0118', location: 'Remote', currentCompany: 'GitHub', currentTitle: 'Senior DevOps Engineer', resumeUrl: '#', linkedinUrl: '#', source: 'agency', referrerId: null, tags: ['aws', 'kubernetes', 'terraform'], createdAt: '2025-10-20T10:00:00Z', updatedAt: '2026-02-22T10:00:00Z' },
    { id: 'cand-19', firstName: 'Hannah', lastName: 'Kim', name: 'Hannah Kim', email: 'hannah.kim@gmail.com', phone: '(415) 555-0119', location: 'San Francisco, CA', currentCompany: 'Figma', currentTitle: 'Frontend Engineer', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['react', 'design-systems'], createdAt: '2026-02-08T10:00:00Z', updatedAt: '2026-03-10T10:00:00Z' },
    { id: 'cand-20', firstName: 'Omar', lastName: 'Hassan', name: 'Omar Hassan', email: 'omar.hassan@gmail.com', phone: '(650) 555-0120', location: 'Palo Alto, CA', currentCompany: 'LinkedIn', currentTitle: 'Senior Software Engineer', resumeUrl: '#', linkedinUrl: '#', source: 'sourced', referrerId: null, tags: ['java', 'scala', 'distributed'], createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-03-10T10:00:00Z' },
    // 12 more candidates
    { id: 'cand-21', firstName: 'Elena', lastName: 'Vasquez', name: 'Elena Vasquez', email: 'elena.v@gmail.com', phone: '(512) 555-0121', location: 'Austin, TX', currentCompany: 'Dell', currentTitle: 'Account Executive', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['enterprise-sales', 'saas'], createdAt: '2026-02-25T10:00:00Z', updatedAt: '2026-03-15T10:00:00Z' },
    { id: 'cand-22', firstName: 'James', lastName: 'Foster', name: 'James Foster', email: 'james.foster@outlook.com', phone: '(512) 555-0122', location: 'Austin, TX', currentCompany: 'Oracle', currentTitle: 'Senior Account Executive', resumeUrl: '#', linkedinUrl: '#', source: 'referral', referrerId: 'user-9', tags: ['enterprise', 'quota-exceeder'], createdAt: '2026-02-28T10:00:00Z', updatedAt: '2026-04-01T10:00:00Z' },
    { id: 'cand-23', firstName: 'Mei', lastName: 'Liu', name: 'Mei Liu', email: 'mei.liu@gmail.com', phone: '(415) 555-0123', location: 'San Francisco, CA', currentCompany: 'Tableau', currentTitle: 'Data Analyst', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['sql', 'python', 'tableau'], createdAt: '2026-03-12T10:00:00Z', updatedAt: '2026-03-30T10:00:00Z' },
    { id: 'cand-24', firstName: 'Derek', lastName: 'Thompson', name: 'Derek Thompson', email: 'derek.t@yahoo.com', phone: '(503) 555-0124', location: 'Portland, OR', currentCompany: 'Looker', currentTitle: 'Senior Data Analyst', resumeUrl: '#', linkedinUrl: '#', source: 'sourced', referrerId: null, tags: ['looker', 'sql', 'dbt'], createdAt: '2026-03-14T10:00:00Z', updatedAt: '2026-04-02T10:00:00Z' },
    { id: 'cand-25', firstName: 'Olivia', lastName: 'Parker', name: 'Olivia Parker', email: 'olivia.parker@gmail.com', phone: '(646) 555-0125', location: 'New York, NY', currentCompany: 'Zendesk', currentTitle: 'Customer Success Manager', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['cs', 'retention'], createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-04-05T10:00:00Z' },
    { id: 'cand-26', firstName: 'Samuel', lastName: 'Adeyemi', name: 'Samuel Adeyemi', email: 'sam.adeyemi@gmail.com', phone: '(212) 555-0126', location: 'New York, NY', currentCompany: 'Intercom', currentTitle: 'Senior CSM', resumeUrl: '#', linkedinUrl: '#', source: 'referral', referrerId: 'user-8', tags: ['enterprise-cs', 'expansion'], createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-04-08T10:00:00Z' },
    { id: 'cand-27', firstName: 'Tanya', lastName: 'Nguyen', name: 'Tanya Nguyen', email: 'tanya.n@gmail.com', phone: '(408) 555-0127', location: 'San Jose, CA', currentCompany: 'Apple', currentTitle: 'UX Researcher', resumeUrl: '#', linkedinUrl: '#', source: 'sourced', referrerId: null, tags: ['mixed-methods', 'qual'], createdAt: '2026-04-02T10:00:00Z', updatedAt: '2026-04-08T10:00:00Z' },
    { id: 'cand-28', firstName: 'Ben', lastName: 'Clarke', name: 'Ben Clarke', email: 'ben.clarke@protonmail.com', phone: '(512) 555-0128', location: 'Austin, TX', currentCompany: 'HubSpot', currentTitle: 'Sales Development Rep', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['outbound', 'cold-calling'], createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-10T10:00:00Z' },
    { id: 'cand-29', firstName: 'Rachel', lastName: 'Kim', name: 'Rachel Kim', email: 'rachel.k@gmail.com', phone: '(415) 555-0129', location: 'San Francisco, CA', currentCompany: 'Asana', currentTitle: 'Product Designer', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['systems-thinking', 'figma'], createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-03-15T10:00:00Z' },
    { id: 'cand-30', firstName: 'Victor', lastName: 'Okafor', name: 'Victor Okafor', email: 'victor.o@outlook.com', phone: '(650) 555-0130', location: 'Remote', currentCompany: 'Datadog', currentTitle: 'Backend Engineer', resumeUrl: '#', linkedinUrl: '#', source: 'agency', referrerId: null, tags: ['go', 'kubernetes'], createdAt: '2026-02-10T10:00:00Z', updatedAt: '2026-03-20T10:00:00Z' },
    { id: 'cand-31', firstName: 'Amy', lastName: 'Sato', name: 'Amy Sato', email: 'amy.sato@gmail.com', phone: '(415) 555-0131', location: 'San Francisco, CA', currentCompany: 'Databricks', currentTitle: 'Data Scientist', resumeUrl: '#', linkedinUrl: '#', source: 'sourced', referrerId: null, tags: ['ml', 'python', 'analytics'], createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-04-05T10:00:00Z' },
    { id: 'cand-32', firstName: 'Max', lastName: 'Brenner', name: 'Max Brenner', email: 'max.brenner@gmail.com', phone: '(718) 555-0132', location: 'Brooklyn, NY', currentCompany: 'WeWork', currentTitle: 'Marketing Manager', resumeUrl: '#', linkedinUrl: '#', source: 'applied', referrerId: null, tags: ['brand', 'growth'], createdAt: '2026-03-10T10:00:00Z', updatedAt: '2026-03-25T10:00:00Z' }
  ];

  const applications = [
    // job-1: Senior Frontend Engineer (8 apps)
    { id: 'app-1', candidateId: 'cand-1', jobId: 'job-1', currentStageId: 'stage-job-1-4', status: 'active', appliedAt: '2026-01-20T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-15T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: 'needs_scorecard', daysInCurrentStage: 5 },
    { id: 'app-2', candidateId: 'cand-2', jobId: 'job-1', currentStageId: 'stage-job-1-6', status: 'active', appliedAt: '2026-01-22T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-08T10:00:00Z', source: 'referral', creditedTo: 'user-5', recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: 'needs_decision', daysInCurrentStage: 2 },
    { id: 'app-3', candidateId: 'cand-3', jobId: 'job-1', currentStageId: 'stage-job-1-7', status: 'active', appliedAt: '2026-01-25T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-09T10:00:00Z', source: 'sourced', creditedTo: 'user-1', recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: null, daysInCurrentStage: 1 },
    { id: 'app-4', candidateId: 'cand-4', jobId: 'job-1', currentStageId: 'stage-job-1-2', status: 'active', appliedAt: '2026-02-01T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-01T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: 'needs_scheduling', daysInCurrentStage: 8 },
    { id: 'app-5', candidateId: 'cand-5', jobId: 'job-1', currentStageId: 'stage-job-1-1', status: 'active', appliedAt: '2026-02-05T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-02-05T10:00:00Z', source: 'referral', creditedTo: 'user-6', recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: 'needs_decision', daysInCurrentStage: 14 },
    { id: 'app-6', candidateId: 'cand-19', jobId: 'job-1', currentStageId: 'stage-job-1-3', status: 'active', appliedAt: '2026-02-08T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-10T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: 'needs_scorecard', daysInCurrentStage: 6 },
    { id: 'app-7', candidateId: 'cand-20', jobId: 'job-1', currentStageId: 'stage-job-1-1', status: 'rejected', appliedAt: '2026-02-15T10:00:00Z', rejectedAt: '2026-02-20T10:00:00Z', rejectionReason: 'Underqualified', hiredAt: null, lastActivityAt: '2026-02-20T10:00:00Z', source: 'sourced', creditedTo: 'user-1', recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: null, daysInCurrentStage: 0 },
    { id: 'app-8', candidateId: 'cand-11', jobId: 'job-1', currentStageId: 'stage-job-1-4', status: 'active', appliedAt: '2026-03-01T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-01T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: 'needs_scheduling', daysInCurrentStage: 3 },
    // job-2: Product Designer (5 apps)
    { id: 'app-9', candidateId: 'cand-6', jobId: 'job-2', currentStageId: 'stage-job-2-5', status: 'active', appliedAt: '2026-02-10T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-05T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: 'needs_decision', daysInCurrentStage: 4 },
    { id: 'app-10', candidateId: 'cand-7', jobId: 'job-2', currentStageId: 'stage-job-2-7', status: 'active', appliedAt: '2026-02-12T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-09T10:00:00Z', source: 'sourced', creditedTo: 'user-1', recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: null, daysInCurrentStage: 1 },
    { id: 'app-11', candidateId: 'cand-8', jobId: 'job-2', currentStageId: 'stage-job-2-3', status: 'active', appliedAt: '2026-02-15T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-20T10:00:00Z', source: 'agency', creditedTo: null, recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: 'needs_scorecard', daysInCurrentStage: 7 },
    { id: 'app-12', candidateId: 'cand-1', jobId: 'job-2', currentStageId: 'stage-job-2-1', status: 'rejected', appliedAt: '2026-02-18T10:00:00Z', rejectedAt: '2026-02-25T10:00:00Z', rejectionReason: 'Lacking technical skills', hiredAt: null, lastActivityAt: '2026-02-25T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: null, daysInCurrentStage: 0 },
    { id: 'app-13', candidateId: 'cand-29', jobId: 'job-2', currentStageId: 'stage-job-2-2', status: 'active', appliedAt: '2026-03-01T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-15T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: 'needs_scheduling', daysInCurrentStage: 10 },
    // job-3: Backend Engineer (6 apps)
    { id: 'app-14', candidateId: 'cand-9', jobId: 'job-3', currentStageId: 'stage-job-3-4', status: 'active', appliedAt: '2026-01-28T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-20T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-2', coordinatorId: null, actionRequired: 'needs_scorecard', daysInCurrentStage: 6 },
    { id: 'app-15', candidateId: 'cand-10', jobId: 'job-3', currentStageId: 'stage-job-3-6', status: 'active', appliedAt: '2026-01-30T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-05T10:00:00Z', source: 'referral', creditedTo: 'user-3', recruiterId: 'user-2', coordinatorId: null, actionRequired: 'needs_decision', daysInCurrentStage: 3 },
    { id: 'app-16', candidateId: 'cand-11', jobId: 'job-3', currentStageId: 'stage-job-3-2', status: 'active', appliedAt: '2026-02-03T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-02-20T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-2', coordinatorId: null, actionRequired: 'needs_scheduling', daysInCurrentStage: 9 },
    { id: 'app-17', candidateId: 'cand-12', jobId: 'job-3', currentStageId: 'stage-job-3-5', status: 'active', appliedAt: '2026-02-07T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-25T10:00:00Z', source: 'sourced', creditedTo: 'user-2', recruiterId: 'user-2', coordinatorId: null, actionRequired: null, daysInCurrentStage: 5 },
    { id: 'app-18', candidateId: 'cand-20', jobId: 'job-3', currentStageId: 'stage-job-3-3', status: 'active', appliedAt: '2026-02-15T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-10T10:00:00Z', source: 'sourced', creditedTo: 'user-2', recruiterId: 'user-2', coordinatorId: null, actionRequired: 'needs_scorecard', daysInCurrentStage: 4 },
    { id: 'app-19', candidateId: 'cand-30', jobId: 'job-3', currentStageId: 'stage-job-3-1', status: 'active', appliedAt: '2026-02-20T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-20T10:00:00Z', source: 'agency', creditedTo: null, recruiterId: 'user-2', coordinatorId: null, actionRequired: 'needs_decision', daysInCurrentStage: 12 },
    // job-4: Product Manager (4 apps)
    { id: 'app-20', candidateId: 'cand-13', jobId: 'job-4', currentStageId: 'stage-job-4-3', status: 'active', appliedAt: '2026-02-18T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-25T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: 'needs_scorecard', daysInCurrentStage: 7 },
    { id: 'app-21', candidateId: 'cand-14', jobId: 'job-4', currentStageId: 'stage-job-4-5', status: 'active', appliedAt: '2026-02-20T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-07T10:00:00Z', source: 'sourced', creditedTo: 'user-1', recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: 'needs_decision', daysInCurrentStage: 2 },
    { id: 'app-22', candidateId: 'cand-13', jobId: 'job-4', currentStageId: 'stage-job-4-2', status: 'rejected', appliedAt: '2026-03-01T10:00:00Z', rejectedAt: '2026-03-10T10:00:00Z', rejectionReason: 'Compensation mismatch', hiredAt: null, lastActivityAt: '2026-03-10T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: null, daysInCurrentStage: 0 },
    { id: 'app-23', candidateId: 'cand-5', jobId: 'job-4', currentStageId: 'stage-job-4-1', status: 'active', appliedAt: '2026-03-10T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-10T10:00:00Z', source: 'referral', creditedTo: 'user-6', recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: 'needs_decision', daysInCurrentStage: 12 },
    // job-5: Marketing Coordinator (3 apps)
    { id: 'app-24', candidateId: 'cand-15', jobId: 'job-5', currentStageId: 'stage-job-5-3', status: 'active', appliedAt: '2026-03-05T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-02T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-2', coordinatorId: null, actionRequired: 'needs_scheduling', daysInCurrentStage: 5 },
    { id: 'app-25', candidateId: 'cand-16', jobId: 'job-5', currentStageId: 'stage-job-5-2', status: 'active', appliedAt: '2026-03-08T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-20T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-2', coordinatorId: null, actionRequired: 'needs_decision', daysInCurrentStage: 8 },
    { id: 'app-38', candidateId: 'cand-32', jobId: 'job-5', currentStageId: 'stage-job-5-1', status: 'active', appliedAt: '2026-03-12T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-25T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-2', coordinatorId: null, actionRequired: 'needs_decision', daysInCurrentStage: 10 },
    // job-7: Account Executive (4 apps)
    { id: 'app-26', candidateId: 'cand-21', jobId: 'job-7', currentStageId: 'stage-job-7-3', status: 'active', appliedAt: '2026-02-28T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-15T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-2', coordinatorId: null, actionRequired: 'needs_scorecard', daysInCurrentStage: 6 },
    { id: 'app-27', candidateId: 'cand-22', jobId: 'job-7', currentStageId: 'stage-job-7-5', status: 'active', appliedAt: '2026-03-01T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-01T10:00:00Z', source: 'referral', creditedTo: 'user-9', recruiterId: 'user-2', coordinatorId: null, actionRequired: 'needs_decision', daysInCurrentStage: 3 },
    { id: 'app-28', candidateId: 'cand-28', jobId: 'job-7', currentStageId: 'stage-job-7-1', status: 'rejected', appliedAt: '2026-03-05T10:00:00Z', rejectedAt: '2026-03-12T10:00:00Z', rejectionReason: 'Underqualified', hiredAt: null, lastActivityAt: '2026-03-12T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-2', coordinatorId: null, actionRequired: null, daysInCurrentStage: 0 },
    { id: 'app-29', candidateId: 'cand-4', jobId: 'job-7', currentStageId: 'stage-job-7-2', status: 'active', appliedAt: '2026-03-08T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-20T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-2', coordinatorId: null, actionRequired: 'needs_scheduling', daysInCurrentStage: 8 },
    // job-8: Data Analyst (3 apps)
    { id: 'app-30', candidateId: 'cand-23', jobId: 'job-8', currentStageId: 'stage-job-8-3', status: 'active', appliedAt: '2026-03-15T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-03-30T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-1', coordinatorId: null, actionRequired: 'needs_scorecard', daysInCurrentStage: 5 },
    { id: 'app-31', candidateId: 'cand-24', jobId: 'job-8', currentStageId: 'stage-job-8-4', status: 'active', appliedAt: '2026-03-16T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-02T10:00:00Z', source: 'sourced', creditedTo: null, recruiterId: 'user-1', coordinatorId: null, actionRequired: 'needs_decision', daysInCurrentStage: 3 },
    { id: 'app-32', candidateId: 'cand-31', jobId: 'job-8', currentStageId: 'stage-job-8-1', status: 'active', appliedAt: '2026-03-22T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-05T10:00:00Z', source: 'sourced', creditedTo: null, recruiterId: 'user-1', coordinatorId: null, actionRequired: 'needs_decision', daysInCurrentStage: 7 },
    // job-9: Customer Success Manager (3 apps)
    { id: 'app-33', candidateId: 'cand-25', jobId: 'job-9', currentStageId: 'stage-job-9-4', status: 'active', appliedAt: '2026-03-20T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-05T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-2', coordinatorId: null, actionRequired: 'needs_scorecard', daysInCurrentStage: 4 },
    { id: 'app-34', candidateId: 'cand-26', jobId: 'job-9', currentStageId: 'stage-job-9-5', status: 'active', appliedAt: '2026-03-22T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-08T10:00:00Z', source: 'referral', creditedTo: 'user-8', recruiterId: 'user-2', coordinatorId: null, actionRequired: null, daysInCurrentStage: 2 },
    { id: 'app-35', candidateId: 'cand-15', jobId: 'job-9', currentStageId: 'stage-job-9-1', status: 'rejected', appliedAt: '2026-03-25T10:00:00Z', rejectedAt: '2026-03-30T10:00:00Z', rejectionReason: 'Lacking technical skills', hiredAt: null, lastActivityAt: '2026-03-30T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-2', coordinatorId: null, actionRequired: null, daysInCurrentStage: 0 },
    // job-6: DevOps Engineer - closed, hired
    { id: 'app-36', candidateId: 'cand-17', jobId: 'job-6', currentStageId: 'stage-job-6-8', status: 'hired', appliedAt: '2025-10-15T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: '2026-02-28T10:00:00Z', lastActivityAt: '2026-02-28T10:00:00Z', source: 'applied', creditedTo: null, recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: null, daysInCurrentStage: 0 },
    { id: 'app-37', candidateId: 'cand-18', jobId: 'job-6', currentStageId: 'stage-job-6-6', status: 'rejected', appliedAt: '2025-10-20T10:00:00Z', rejectedAt: '2026-01-15T10:00:00Z', rejectionReason: 'Better qualified candidate', hiredAt: null, lastActivityAt: '2026-01-15T10:00:00Z', source: 'agency', creditedTo: null, recruiterId: 'user-1', coordinatorId: 'user-7', actionRequired: null, daysInCurrentStage: 0 },
    // job-10: UX Researcher (2 apps - draft)
    { id: 'app-39', candidateId: 'cand-27', jobId: 'job-10', currentStageId: 'stage-job-10-1', status: 'active', appliedAt: '2026-04-03T10:00:00Z', rejectedAt: null, rejectionReason: null, hiredAt: null, lastActivityAt: '2026-04-08T10:00:00Z', source: 'sourced', creditedTo: null, recruiterId: 'user-1', coordinatorId: null, actionRequired: 'needs_decision', daysInCurrentStage: 5 },
  ];

  // Update candidate counts on jobs
  jobs.forEach(j => {
    j.candidateCount = applications.filter(a => a.jobId === j.id).length;
  });

  const scorecards = [
    { id: 'sc-1', applicationId: 'app-1', interviewerId: 'user-5', stageId: 'stage-job-1-4', overallRecommendation: 'yes', attributes: [ { name: 'Technical Skills', rating: 3, note: 'Solid React fundamentals' }, { name: 'Communication', rating: 4, note: 'Excellent communicator' }, { name: 'Problem Solving', rating: 3, note: 'Structured approach' }, { name: 'Culture Fit', rating: 4, note: 'Aligns well' }, { name: 'Leadership', rating: 3, note: 'Shows initiative' } ], submittedAt: '2026-03-16T14:00:00Z', createdAt: '2026-03-15T10:00:00Z', notes: 'Strong candidate overall.' },
    { id: 'sc-2', applicationId: 'app-2', interviewerId: 'user-6', stageId: 'stage-job-1-6', overallRecommendation: 'strong_yes', attributes: [ { name: 'Technical Skills', rating: 4, note: 'Exceptional frontend skills' }, { name: 'Communication', rating: 4, note: 'Outstanding' }, { name: 'Problem Solving', rating: 4, note: 'Creative solver' }, { name: 'Culture Fit', rating: 4, note: 'Perfect fit' }, { name: 'Leadership', rating: 3, note: 'Good potential' } ], submittedAt: '2026-04-08T16:00:00Z', createdAt: '2026-04-08T10:00:00Z', notes: 'Highly recommend - top candidate.' },
    { id: 'sc-3', applicationId: 'app-6', interviewerId: 'user-3', stageId: 'stage-job-1-3', overallRecommendation: 'yes', attributes: [ { name: 'Technical Skills', rating: 3, note: 'Good baseline' }, { name: 'Communication', rating: 3, note: 'Clear' }, { name: 'Problem Solving', rating: 3, note: 'Good approach' }, { name: 'Culture Fit', rating: 4, note: 'Great energy' }, { name: 'Leadership', rating: 2, note: 'Early career' } ], submittedAt: '2026-03-11T15:00:00Z', createdAt: '2026-03-10T10:00:00Z', notes: 'Good, recommend moving to technical.' },
    { id: 'sc-4', applicationId: 'app-9', interviewerId: 'user-4', stageId: 'stage-job-2-5', overallRecommendation: 'no', attributes: [ { name: 'Technical Skills', rating: 2, note: 'Portfolio lacks depth' }, { name: 'Communication', rating: 3, note: 'Good' }, { name: 'Problem Solving', rating: 2, note: 'Underdeveloped' }, { name: 'Culture Fit', rating: 3, note: 'OK' }, { name: 'Leadership', rating: 2, note: 'Limited' } ], submittedAt: '2026-04-06T12:00:00Z', createdAt: '2026-04-05T10:00:00Z', notes: 'Not strong enough for senior level.' },
    { id: 'sc-5', applicationId: 'app-10', interviewerId: 'user-4', stageId: 'stage-job-2-7', overallRecommendation: 'strong_yes', attributes: [ { name: 'Technical Skills', rating: 4, note: 'Exceptional design systems' }, { name: 'Communication', rating: 4, note: 'Brilliant presenter' }, { name: 'Problem Solving', rating: 4, note: 'Deep thinker' }, { name: 'Culture Fit', rating: 4, note: 'Outstanding' }, { name: 'Leadership', rating: 4, note: 'Led large teams' } ], submittedAt: '2026-04-09T11:00:00Z', createdAt: '2026-04-09T09:00:00Z', notes: 'Best candidate this year.' },
    { id: 'sc-6', applicationId: 'app-11', interviewerId: 'user-4', stageId: 'stage-job-2-3', overallRecommendation: 'no_opinion', attributes: [ { name: 'Technical Skills', rating: 3, note: 'Decent' }, { name: 'Communication', rating: 2, note: 'Unclear at times' }, { name: 'Problem Solving', rating: 3, note: 'Average' }, { name: 'Culture Fit', rating: 3, note: 'OK' }, { name: 'Leadership', rating: 2, note: 'None' } ], submittedAt: '2026-03-21T14:00:00Z', createdAt: '2026-03-20T10:00:00Z', notes: 'On the fence.' },
    { id: 'sc-7', applicationId: 'app-14', interviewerId: 'user-5', stageId: 'stage-job-3-4', overallRecommendation: 'yes', attributes: [ { name: 'Technical Skills', rating: 3, note: 'Good Python skills' }, { name: 'Communication', rating: 3, note: 'Good' }, { name: 'Problem Solving', rating: 4, note: 'Excellent algorithms' }, { name: 'Culture Fit', rating: 3, note: 'Good fit' }, { name: 'Leadership', rating: 2, note: 'IC track' } ], submittedAt: '2026-03-21T16:00:00Z', createdAt: '2026-03-20T10:00:00Z', notes: 'Strong tech, recommend advancing.' },
    { id: 'sc-8', applicationId: 'app-15', interviewerId: 'user-3', stageId: 'stage-job-3-6', overallRecommendation: 'strong_yes', attributes: [ { name: 'Technical Skills', rating: 4, note: 'Excellent Go expertise' }, { name: 'Communication', rating: 4, note: 'Outstanding' }, { name: 'Problem Solving', rating: 4, note: 'Creative solutions' }, { name: 'Culture Fit', rating: 3, note: 'Good fit' }, { name: 'Leadership', rating: 4, note: 'Led backend teams' } ], submittedAt: '2026-04-06T15:00:00Z', createdAt: '2026-04-05T10:00:00Z', notes: 'Excellent. Strongly recommend offer.' },
    { id: 'sc-9', applicationId: 'app-20', interviewerId: 'user-3', stageId: 'stage-job-4-3', overallRecommendation: 'yes', attributes: [ { name: 'Technical Skills', rating: 3, note: 'Good product sense' }, { name: 'Communication', rating: 4, note: 'Excellent stakeholder mgmt' }, { name: 'Problem Solving', rating: 3, note: 'Good framework' }, { name: 'Culture Fit', rating: 3, note: 'Would fit' }, { name: 'Leadership', rating: 3, note: 'Some PM exp' } ], submittedAt: '2026-03-26T14:00:00Z', createdAt: '2026-03-25T10:00:00Z', notes: 'Good candidate, move to case study.' },
    { id: 'sc-10', applicationId: 'app-21', interviewerId: 'user-3', stageId: 'stage-job-4-5', overallRecommendation: 'strong_yes', attributes: [ { name: 'Technical Skills', rating: 4, note: 'Deep product expertise' }, { name: 'Communication', rating: 4, note: 'World class' }, { name: 'Problem Solving', rating: 4, note: 'Exceptional' }, { name: 'Culture Fit', rating: 4, note: 'Great match' }, { name: 'Leadership', rating: 4, note: 'Led large areas' } ], submittedAt: '2026-04-08T16:00:00Z', createdAt: '2026-04-07T10:00:00Z', notes: 'Top tier. Move fast.' },
    // Pending scorecards
    { id: 'sc-11', applicationId: 'app-8', interviewerId: 'user-5', stageId: 'stage-job-1-4', overallRecommendation: null, attributes: [ { name: 'Technical Skills', rating: 0, note: '' }, { name: 'Communication', rating: 0, note: '' }, { name: 'Problem Solving', rating: 0, note: '' }, { name: 'Culture Fit', rating: 0, note: '' }, { name: 'Leadership', rating: 0, note: '' } ], submittedAt: null, createdAt: '2026-04-01T10:00:00Z', notes: '' },
    { id: 'sc-12', applicationId: 'app-1', interviewerId: 'user-6', stageId: 'stage-job-1-4', overallRecommendation: null, attributes: [ { name: 'Technical Skills', rating: 0, note: '' }, { name: 'Communication', rating: 0, note: '' }, { name: 'Problem Solving', rating: 0, note: '' }, { name: 'Culture Fit', rating: 0, note: '' }, { name: 'Leadership', rating: 0, note: '' } ], submittedAt: null, createdAt: '2026-03-15T10:00:00Z', notes: '' },
    { id: 'sc-13', applicationId: 'app-17', interviewerId: 'user-6', stageId: 'stage-job-3-5', overallRecommendation: null, attributes: [ { name: 'Technical Skills', rating: 0, note: '' }, { name: 'Communication', rating: 0, note: '' }, { name: 'Problem Solving', rating: 0, note: '' }, { name: 'Culture Fit', rating: 0, note: '' }, { name: 'Leadership', rating: 0, note: '' } ], submittedAt: null, createdAt: '2026-03-25T10:00:00Z', notes: '' },
    { id: 'sc-14', applicationId: 'app-18', interviewerId: 'user-5', stageId: 'stage-job-3-3', overallRecommendation: null, attributes: [ { name: 'Technical Skills', rating: 0, note: '' }, { name: 'Communication', rating: 0, note: '' }, { name: 'Problem Solving', rating: 0, note: '' }, { name: 'Culture Fit', rating: 0, note: '' }, { name: 'Leadership', rating: 0, note: '' } ], submittedAt: null, createdAt: '2026-03-10T10:00:00Z', notes: '' },
    { id: 'sc-15', applicationId: 'app-24', interviewerId: 'user-8', stageId: 'stage-job-5-3', overallRecommendation: null, attributes: [ { name: 'Technical Skills', rating: 0, note: '' }, { name: 'Communication', rating: 0, note: '' }, { name: 'Problem Solving', rating: 0, note: '' }, { name: 'Culture Fit', rating: 0, note: '' }, { name: 'Leadership', rating: 0, note: '' } ], submittedAt: null, createdAt: '2026-04-02T10:00:00Z', notes: '' },
    { id: 'sc-16', applicationId: 'app-26', interviewerId: 'user-9', stageId: 'stage-job-7-3', overallRecommendation: null, attributes: [ { name: 'Technical Skills', rating: 0, note: '' }, { name: 'Communication', rating: 0, note: '' }, { name: 'Problem Solving', rating: 0, note: '' }, { name: 'Culture Fit', rating: 0, note: '' }, { name: 'Leadership', rating: 0, note: '' } ], submittedAt: null, createdAt: '2026-03-15T10:00:00Z', notes: '' },
    { id: 'sc-17', applicationId: 'app-33', interviewerId: 'user-8', stageId: 'stage-job-9-4', overallRecommendation: null, attributes: [ { name: 'Technical Skills', rating: 0, note: '' }, { name: 'Communication', rating: 0, note: '' }, { name: 'Problem Solving', rating: 0, note: '' }, { name: 'Culture Fit', rating: 0, note: '' }, { name: 'Leadership', rating: 0, note: '' } ], submittedAt: null, createdAt: '2026-04-05T10:00:00Z', notes: '' }
  ];

  const interviews = [
    { id: 'int-1', applicationId: 'app-1', stageId: 'stage-job-1-4', interviewerIds: ['user-5', 'user-6'], scheduledAt: '2026-04-12T14:00:00Z', duration: 60, location: 'Conference Room A', status: 'scheduled', meetingUrl: null, notes: 'Technical deep-dive on React architecture' },
    { id: 'int-2', applicationId: 'app-2', stageId: 'stage-job-1-6', interviewerIds: ['user-3', 'user-5'], scheduledAt: '2026-04-11T10:00:00Z', duration: 90, location: 'Video Call', status: 'scheduled', meetingUrl: 'https://meet.company.com/int-2', notes: 'Final onsite panel' },
    { id: 'int-3', applicationId: 'app-15', stageId: 'stage-job-3-6', interviewerIds: ['user-3', 'user-6'], scheduledAt: '2026-04-14T15:00:00Z', duration: 60, location: 'Video Call', status: 'scheduled', meetingUrl: 'https://meet.company.com/int-3', notes: 'Backend system design interview' },
    { id: 'int-4', applicationId: 'app-21', stageId: 'stage-job-4-5', interviewerIds: ['user-3', 'user-8'], scheduledAt: '2026-04-15T11:00:00Z', duration: 60, location: 'Conference Room B', status: 'scheduled', meetingUrl: null, notes: 'Product panel with leadership' },
    { id: 'int-5', applicationId: 'app-14', stageId: 'stage-job-3-4', interviewerIds: ['user-5'], scheduledAt: '2026-03-20T14:00:00Z', duration: 60, location: 'Video Call', status: 'completed', meetingUrl: 'https://meet.company.com/int-5', notes: 'Technical interview completed' },
    { id: 'int-6', applicationId: 'app-9', stageId: 'stage-job-2-5', interviewerIds: ['user-4'], scheduledAt: '2026-04-05T13:00:00Z', duration: 60, location: 'Video Call', status: 'completed', meetingUrl: 'https://meet.company.com/int-6', notes: 'Portfolio review completed' },
    { id: 'int-7', applicationId: 'app-20', stageId: 'stage-job-4-3', interviewerIds: ['user-3'], scheduledAt: '2026-03-25T15:00:00Z', duration: 45, location: 'Video Call', status: 'completed', meetingUrl: 'https://meet.company.com/int-7', notes: 'Hiring manager screen completed' },
    { id: 'int-8', applicationId: 'app-6', stageId: 'stage-job-1-3', interviewerIds: ['user-3'], scheduledAt: '2026-03-10T11:00:00Z', duration: 30, location: 'Video Call', status: 'completed', meetingUrl: 'https://meet.company.com/int-8', notes: 'HM screen - positive feedback' },
    { id: 'int-9', applicationId: 'app-11', stageId: 'stage-job-2-3', interviewerIds: ['user-4'], scheduledAt: '2026-03-20T10:00:00Z', duration: 45, location: 'Video Call', status: 'completed', meetingUrl: 'https://meet.company.com/int-9', notes: 'Design skills assessment' },
    { id: 'int-10', applicationId: 'app-4', stageId: 'stage-job-1-2', interviewerIds: ['user-1'], scheduledAt: '2026-03-05T14:00:00Z', duration: 30, location: 'Video Call', status: 'cancelled', meetingUrl: null, notes: 'Candidate rescheduled' },
    { id: 'int-11', applicationId: 'app-27', stageId: 'stage-job-7-5', interviewerIds: ['user-9'], scheduledAt: '2026-04-10T14:00:00Z', duration: 60, location: 'Conference Room C', status: 'scheduled', meetingUrl: null, notes: 'Sales presentation and role play' },
    { id: 'int-12', applicationId: 'app-34', stageId: 'stage-job-9-5', interviewerIds: ['user-8'], scheduledAt: '2026-04-11T16:00:00Z', duration: 45, location: 'Video Call', status: 'scheduled', meetingUrl: 'https://meet.company.com/int-12', notes: 'CS leadership interview' },
    { id: 'int-13', applicationId: 'app-31', stageId: 'stage-job-8-4', interviewerIds: ['user-10'], scheduledAt: '2026-04-13T10:00:00Z', duration: 60, location: 'Video Call', status: 'scheduled', meetingUrl: 'https://meet.company.com/int-13', notes: 'Data analysis case study' },
    { id: 'int-14', applicationId: 'app-30', stageId: 'stage-job-8-3', interviewerIds: ['user-10'], scheduledAt: '2026-04-10T09:00:00Z', duration: 30, location: 'Video Call', status: 'scheduled', meetingUrl: 'https://meet.company.com/int-14', notes: 'Hiring manager screen' }
  ];

  const offers = [
    { id: 'offer-1', applicationId: 'app-3', jobId: 'job-1', candidateId: 'cand-3', status: 'pending_approval', salary: 185000, equity: '0.05%', signingBonus: 15000, currency: 'USD', startDate: '2026-05-01', expiresAt: '2026-04-25T00:00:00Z', createdBy: 'user-1', approvers: [ { userId: 'user-8', status: 'pending', respondedAt: null }, { userId: 'user-3', status: 'pending', respondedAt: null } ], createdAt: '2026-04-09T10:00:00Z', updatedAt: '2026-04-09T10:00:00Z' },
    { id: 'offer-2', applicationId: 'app-10', jobId: 'job-2', candidateId: 'cand-7', status: 'sent', salary: 155000, equity: '0.03%', signingBonus: 10000, currency: 'USD', startDate: '2026-05-15', expiresAt: '2026-04-20T00:00:00Z', createdBy: 'user-1', approvers: [ { userId: 'user-8', status: 'approved', respondedAt: '2026-04-07T14:00:00Z' }, { userId: 'user-4', status: 'approved', respondedAt: '2026-04-07T16:00:00Z' } ], createdAt: '2026-04-06T10:00:00Z', updatedAt: '2026-04-09T10:00:00Z' },
    { id: 'offer-3', applicationId: 'app-36', jobId: 'job-6', candidateId: 'cand-17', status: 'accepted', salary: 165000, equity: '0.04%', signingBonus: 12000, currency: 'USD', startDate: '2026-03-01', expiresAt: '2026-02-20T00:00:00Z', createdBy: 'user-1', approvers: [ { userId: 'user-8', status: 'approved', respondedAt: '2026-02-10T14:00:00Z' } ], createdAt: '2026-02-08T10:00:00Z', updatedAt: '2026-02-22T10:00:00Z' }
  ];

  const notes = [
    { id: 'note-1', candidateId: 'cand-1', authorId: 'user-1', body: 'Strong React experience from Stripe. Ask about system design in onsite.', visibility: 'public', isPinned: true, createdAt: '2026-01-21T10:00:00Z', updatedAt: '2026-01-21T10:00:00Z' },
    { id: 'note-2', candidateId: 'cand-2', authorId: 'user-1', body: 'Referred by Marcus Johnson. He says she is outstanding. Prioritize this candidate.', visibility: 'public', isPinned: true, createdAt: '2026-01-23T10:00:00Z', updatedAt: '2026-01-23T10:00:00Z' },
    { id: 'note-3', candidateId: 'cand-2', authorId: 'user-5', body: 'I worked with Maria at my previous company. She is one of the best engineers I have worked with.', visibility: 'public', isPinned: false, createdAt: '2026-01-24T10:00:00Z', updatedAt: '2026-01-24T10:00:00Z' },
    { id: 'note-4', candidateId: 'cand-3', authorId: 'user-1', body: 'Candidate preferred hybrid schedule. Confirmed 3 days in office is acceptable.', visibility: 'public', isPinned: false, createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z' },
    { id: 'note-5', candidateId: 'cand-7', authorId: 'user-4', body: 'Incredible portfolio. His fintech design system case studies are extremely detailed.', visibility: 'public', isPinned: true, createdAt: '2026-02-14T10:00:00Z', updatedAt: '2026-02-14T10:00:00Z' },
    { id: 'note-6', candidateId: 'cand-10', authorId: 'user-3', body: 'Referred by our VP Eng. Stellar reputation in Go community. Prioritize scheduling.', visibility: 'public', isPinned: false, createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z' },
    { id: 'note-7', candidateId: 'cand-14', authorId: 'user-1', body: 'Currently at Google - compensation expectations high (200k+). Discuss with leadership.', visibility: 'private', isPinned: false, createdAt: '2026-02-21T10:00:00Z', updatedAt: '2026-02-21T10:00:00Z' },
    { id: 'note-8', candidateId: 'cand-9', authorId: 'user-2', body: 'Solid technical foundation but may lack scale experience. Worth a phone screen.', visibility: 'public', isPinned: false, createdAt: '2026-01-29T10:00:00Z', updatedAt: '2026-01-29T10:00:00Z' },
    { id: 'note-9', candidateId: 'cand-12', authorId: 'user-2', body: 'Impressive background at Shopify. Very responsive and professional.', visibility: 'public', isPinned: false, createdAt: '2026-03-15T10:00:00Z', updatedAt: '2026-03-15T10:00:00Z' },
    { id: 'note-10', candidateId: 'cand-6', authorId: 'user-4', body: 'Portfolio decent but not senior level. Suggest moving to rejection.', visibility: 'admin_only', isPinned: false, createdAt: '2026-04-06T10:00:00Z', updatedAt: '2026-04-06T10:00:00Z' },
    { id: 'note-11', candidateId: 'cand-15', authorId: 'user-2', body: 'Great energy in phone screen. Has experience with HubSpot and Marketo.', visibility: 'public', isPinned: false, createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-03-20T10:00:00Z' },
    { id: 'note-12', candidateId: 'cand-20', authorId: 'user-1', body: 'Follow up needed - has not responded to interview invite in 5 days.', visibility: 'public', isPinned: false, createdAt: '2026-04-05T10:00:00Z', updatedAt: '2026-04-05T10:00:00Z' },
    { id: 'note-13', candidateId: 'cand-22', authorId: 'user-9', body: 'James was my top seller at Oracle. Crushed quota 3 years running. Grab him fast.', visibility: 'public', isPinned: true, createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z' },
    { id: 'note-14', candidateId: 'cand-26', authorId: 'user-8', body: 'Samuel managed 50+ enterprise accounts at Intercom. Strong expansion track record.', visibility: 'public', isPinned: false, createdAt: '2026-03-22T10:00:00Z', updatedAt: '2026-03-22T10:00:00Z' }
  ];

  const activityFeed = [
    { id: 'act-1', candidateId: 'cand-1', applicationId: 'app-1', type: 'application_submitted', actorId: 'user-1', description: 'Alex Chen applied for Senior Frontend Engineer', metadata: {}, createdAt: '2026-01-20T10:00:00Z' },
    { id: 'act-2', candidateId: 'cand-1', applicationId: 'app-1', type: 'stage_change', actorId: 'user-1', description: 'Moved to Technical Interview', metadata: { fromStage: 'Hiring Manager Screen', toStage: 'Technical Interview' }, createdAt: '2026-03-05T10:00:00Z' },
    { id: 'act-3', candidateId: 'cand-2', applicationId: 'app-2', type: 'application_submitted', actorId: 'user-1', description: 'Maria Santos referred for Senior Frontend Engineer', metadata: {}, createdAt: '2026-01-22T10:00:00Z' },
    { id: 'act-4', candidateId: 'cand-2', applicationId: 'app-2', type: 'scorecard_submitted', actorId: 'user-6', description: 'Priya Patel submitted scorecard: Strong Yes', metadata: { scorecardId: 'sc-2', recommendation: 'strong_yes' }, createdAt: '2026-04-08T16:00:00Z' },
    { id: 'act-5', candidateId: 'cand-3', applicationId: 'app-3', type: 'stage_change', actorId: 'user-1', description: 'Moved to Offer stage', metadata: { fromStage: 'Onsite Interview', toStage: 'Offer' }, createdAt: '2026-04-08T10:00:00Z' },
    { id: 'act-6', candidateId: 'cand-3', applicationId: 'app-3', type: 'offer_created', actorId: 'user-1', description: 'Offer created for $185,000 - pending approval', metadata: { offerId: 'offer-1', salary: 185000 }, createdAt: '2026-04-09T10:00:00Z' },
    { id: 'act-7', candidateId: 'cand-7', applicationId: 'app-10', type: 'stage_change', actorId: 'user-1', description: 'Moved to Offer stage', metadata: { fromStage: 'Onsite Interview', toStage: 'Offer' }, createdAt: '2026-04-09T09:00:00Z' },
    { id: 'act-8', candidateId: 'cand-7', applicationId: 'app-10', type: 'offer_created', actorId: 'user-1', description: 'Offer created for $155,000 and sent', metadata: { offerId: 'offer-2', salary: 155000 }, createdAt: '2026-04-06T10:00:00Z' },
    { id: 'act-9', candidateId: 'cand-10', applicationId: 'app-15', type: 'scorecard_submitted', actorId: 'user-3', description: 'David Kim submitted scorecard: Strong Yes', metadata: { scorecardId: 'sc-8' }, createdAt: '2026-04-06T15:00:00Z' },
    { id: 'act-10', candidateId: 'cand-14', applicationId: 'app-21', type: 'scorecard_submitted', actorId: 'user-3', description: 'David Kim submitted scorecard: Strong Yes', metadata: { scorecardId: 'sc-10' }, createdAt: '2026-04-08T16:00:00Z' },
    { id: 'act-11', candidateId: 'cand-20', applicationId: 'app-7', type: 'rejection', actorId: 'user-1', description: 'Omar Hassan rejected: Underqualified', metadata: { reason: 'Underqualified' }, createdAt: '2026-02-20T10:00:00Z' },
    { id: 'act-12', candidateId: 'cand-22', applicationId: 'app-27', type: 'stage_change', actorId: 'user-2', description: 'Moved to Take Home Test', metadata: { fromStage: 'Technical Interview', toStage: 'Take Home Test' }, createdAt: '2026-04-01T10:00:00Z' },
    { id: 'act-13', candidateId: 'cand-26', applicationId: 'app-34', type: 'stage_change', actorId: 'user-2', description: 'Moved to Take Home Test', metadata: { fromStage: 'Technical Interview', toStage: 'Take Home Test' }, createdAt: '2026-04-08T10:00:00Z' },
    { id: 'act-14', candidateId: 'cand-17', applicationId: 'app-36', type: 'offer_created', actorId: 'user-1', description: 'Carlos Mendez accepted offer for $165,000', metadata: { offerId: 'offer-3' }, createdAt: '2026-02-22T10:00:00Z' },
    { id: 'act-15', candidateId: 'cand-15', applicationId: 'app-24', type: 'application_submitted', actorId: 'user-2', description: 'Tyler Brooks applied for Marketing Coordinator', metadata: {}, createdAt: '2026-03-05T10:00:00Z' },
  ];

  const notifications = [
    { id: 'notif-1', type: 'scorecard_due', title: 'Scorecard due: Interview with Alex Chen', message: 'Your scorecard for Alex Chen (Technical Interview) is overdue', isRead: false, link: '/candidates/cand-1/scorecard/sc-12', createdAt: '2026-04-09T08:00:00Z' },
    { id: 'notif-2', type: 'offer_update', title: 'Offer awaiting approval: Senior Frontend Engineer', message: 'Jordan Williams offer for $185,000 is pending your approval', isRead: false, link: '/candidates/cand-3', createdAt: '2026-04-09T10:00:00Z' },
    { id: 'notif-3', type: 'interview_reminder', title: 'Interview tomorrow: Maria Santos', message: 'Onsite interview with Maria Santos at 10:00 AM', isRead: false, link: '/candidates/cand-2', createdAt: '2026-04-10T09:00:00Z' },
    { id: 'notif-4', type: 'stage_change', title: 'Dante Rivera moved to Offer', message: 'Dante Rivera advanced to Offer stage for Product Designer', isRead: true, link: '/candidates/cand-7', createdAt: '2026-04-09T09:00:00Z' },
    { id: 'notif-5', type: 'candidate_applied', title: 'New application: Tyler Brooks', message: 'Tyler Brooks applied for Marketing Coordinator', isRead: true, link: '/candidates/cand-15', createdAt: '2026-03-05T10:00:00Z' },
    { id: 'notif-6', type: 'interview_reminder', title: 'Interview today: James Foster', message: 'Sales presentation with James Foster at 2:00 PM', isRead: false, link: '/candidates/cand-22', createdAt: '2026-04-10T08:00:00Z' },
    { id: 'notif-7', type: 'scorecard_due', title: 'Scorecard due: Elena Vasquez', message: 'Scorecard for Elena Vasquez (HM Screen) is pending', isRead: true, link: '/candidates/cand-21', createdAt: '2026-03-16T09:00:00Z' },
    { id: 'notif-8', type: 'offer_update', title: 'Offer sent: Dante Rivera', message: 'Offer for $155,000 sent to Dante Rivera', isRead: true, link: '/candidates/cand-7', createdAt: '2026-04-09T11:00:00Z' }
  ];

  // Settings / templates
  const settings = {
    scorecardTemplates: [
      { id: 'sct-1', name: 'Engineering Interview', attributes: ['Technical Skills', 'Communication', 'Problem Solving', 'Culture Fit', 'Leadership'] },
      { id: 'sct-2', name: 'Design Interview', attributes: ['Design Skills', 'Communication', 'User Empathy', 'Culture Fit', 'Collaboration'] },
      { id: 'sct-3', name: 'Sales Interview', attributes: ['Sales Acumen', 'Communication', 'Negotiation', 'Culture Fit', 'Drive'] },
      { id: 'sct-4', name: 'General Interview', attributes: ['Technical Skills', 'Communication', 'Problem Solving', 'Culture Fit', 'Leadership'] }
    ],
    interviewKits: [
      { id: 'ik-1', name: 'Technical Phone Screen', duration: 45, description: 'Initial technical assessment via phone', questions: ['Tell me about your experience with X', 'Describe a challenging technical problem you solved', 'How do you approach system design?'] },
      { id: 'ik-2', name: 'Onsite Technical', duration: 60, description: 'In-depth technical interview with coding', questions: ['Live coding exercise', 'System design discussion', 'Technical deep-dive on past projects'] },
      { id: 'ik-3', name: 'Culture Fit', duration: 30, description: 'Assess cultural alignment and values', questions: ['What kind of work environment do you thrive in?', 'Tell me about a time you resolved a conflict', 'What motivates you in your career?'] },
      { id: 'ik-4', name: 'Sales Presentation', duration: 60, description: 'Role play and presentation skills assessment', questions: ['Product demo role play', 'Objection handling scenarios', 'Pipeline management discussion'] }
    ],
    jobTemplates: [
      { id: 'jt-1', name: 'Engineering Role', departmentId: 'dept-1', defaultStages: ['Application Review', 'Phone Screen', 'Technical Interview', 'Take Home', 'Onsite', 'Offer'] },
      { id: 'jt-2', name: 'Design Role', departmentId: 'dept-2', defaultStages: ['Application Review', 'Phone Screen', 'Portfolio Review', 'Design Challenge', 'Onsite', 'Offer'] },
      { id: 'jt-3', name: 'Sales Role', departmentId: 'dept-5', defaultStages: ['Application Review', 'Phone Screen', 'Sales Presentation', 'Panel Interview', 'Offer'] }
    ],
    emailTemplates: [
      { id: 'et-1', name: 'Application Received', subject: 'Thank you for applying to {{job_title}}', body: 'Hi {{candidate_name}},\n\nThank you for your interest in the {{job_title}} position. We have received your application and will review it shortly.\n\nBest regards,\n{{recruiter_name}}' },
      { id: 'et-2', name: 'Phone Screen Invite', subject: 'Phone Screen Invitation - {{job_title}}', body: 'Hi {{candidate_name}},\n\nWe would like to schedule a phone screen with you for the {{job_title}} position.\n\nPlease let us know your availability.\n\nBest,\n{{recruiter_name}}' },
      { id: 'et-3', name: 'Rejection', subject: 'Update on your application - {{job_title}}', body: 'Hi {{candidate_name}},\n\nThank you for your interest in the {{job_title}} role. After careful consideration, we have decided to move forward with other candidates.\n\nWe wish you all the best.\n\nBest regards,\n{{recruiter_name}}' },
      { id: 'et-4', name: 'Offer Letter', subject: 'Offer Letter - {{job_title}}', body: 'Dear {{candidate_name}},\n\nWe are thrilled to extend an offer for the {{job_title}} position.\n\nPlease find the details below and let us know if you have any questions.\n\nBest regards,\n{{recruiter_name}}' }
    ]
  };

  return {
    currentUser: users[0],
    users,
    departments,
    offices,
    jobs,
    jobStages: allStages,
    candidates,
    applications,
    scorecards,
    interviews,
    offers,
    notes,
    activityFeed,
    notifications,
    sources,
    rejectionReasons,
    settings,
    ui: {
      searchQuery: '',
      activeJobId: null,
      activeCandidateId: null,
      modals: {
        addCandidate: false,
        createJob: false,
        scheduleInterview: false,
        rejectCandidate: false,
        moveStage: false,
        search: false,
        notifications: false
      }
    }
  };
}
