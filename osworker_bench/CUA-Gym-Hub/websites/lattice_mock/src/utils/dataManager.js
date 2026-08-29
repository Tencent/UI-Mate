const BASE_KEY = 'xattice'
const BASE_INITIAL_KEY = 'lattice_initial'

export function getSessionId() {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) {
    sessionStorage.setItem('lattice_sid', sid)
    return sid
  }
  return sessionStorage.getItem('lattice_sid') || null
}

export function storageKey(sid) {
  return sid ? `${BASE_KEY}_${sid}` : `${BASE_KEY}_default`
}

export function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : `${BASE_INITIAL_KEY}_default`
}

export async function fetchCustomState(sid) {
  if (!sid) return null
  try {
    const res = await fetch(`/state?sid=${encodeURIComponent(sid)}`, {
      headers: { 'Cache-Control': 'no-cache' }
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data) return null
    // Standard format: { stored_state, has_custom_state, sid }
    const state = data.stored_state || data.current || null
    return state && Object.keys(state).length > 0 ? state : null
  } catch {
    return null
  }
}

function deepMerge(base, override) {
  if (override === null || override === undefined) return base
  if (Array.isArray(override)) return override
  if (typeof override !== 'object') return override
  if (typeof base !== 'object' || base === null || Array.isArray(base)) return override
  const result = { ...base }
  for (const key of Object.keys(override)) {
    result[key] = deepMerge(base[key], override[key])
  }
  return result
}

export function initializeData(sid = null, customState = null) {
  const sKey = storageKey(sid)
  const iKey = initialKey(sid)

  // If we have a custom state (injected via API), use it
  if (customState) {
    const merged = deepMerge(createInitialData(), customState)
    localStorage.setItem(sKey, JSON.stringify(merged))
    localStorage.setItem(iKey, JSON.stringify(merged))
    return merged
  }

  // If there's existing state (page refresh), load it
  const existing = localStorage.getItem(sKey)
  if (existing) {
    try {
      const existingState = JSON.parse(existing)
      if (sid) {
        fetch(`/post?sid=${encodeURIComponent(sid)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'set_current', state: existingState }),
        }).catch(() => {})
      }
      return existingState
    } catch {
      // fall through to default
    }
  }

  // First load: use defaults
  const data = createInitialData()
  localStorage.setItem(sKey, JSON.stringify(data))
  if (!localStorage.getItem(iKey)) {
    localStorage.setItem(iKey, JSON.stringify(data))
  }
  if (sid) {
    fetch(`/post?sid=${encodeURIComponent(sid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state: data }),
    }).catch(() => {})
  }
  return data
}

let _syncTimer = null

export function saveState(sid, state) {
  localStorage.setItem(storageKey(sid), JSON.stringify(state))
  if (sid) {
    clearTimeout(_syncTimer)
    _syncTimer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(() => {})
    }, 300)
  }
}

export function getInitialState(sid) {
  const iKey = initialKey(sid)
  const stored = localStorage.getItem(iKey)
  if (stored) {
    try { return JSON.parse(stored) } catch { return null }
  }
  return null
}

export function getAvatarColor(userId) {
  const colors = [
    '#6B4FBB', '#7C3AED', '#DB2777', '#DC2626', '#D97706',
    '#059669', '#0891B2', '#8B5CF6', '#BE185D', '#1D4ED8'
  ]
  const num = parseInt(userId?.replace(/\D/g, '') || '0')
  return colors[num % colors.length]
}

export function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function createInitialData() {
  const users = [
    { id: 'user_1', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@evergreen.com', avatar: null, title: 'Senior Product Manager', department: 'Product', team: 'Platform Team', location: 'San Francisco, CA', startDate: '2021-03-15', managerId: 'user_2', directReportIds: ['user_14'], role: 'ic', status: 'active', birthday: '1990-06-12', workAnniversary: '2021-03-15' },
    { id: 'user_2', firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.johnson@evergreen.com', avatar: null, title: 'VP of Product', department: 'Product', team: 'Leadership', location: 'San Francisco, CA', startDate: '2019-08-01', managerId: 'user_10', directReportIds: ['user_1', 'user_3', 'user_12', 'user_22'], role: 'manager', status: 'active', birthday: '1984-11-22', workAnniversary: '2019-08-01' },
    { id: 'user_3', firstName: 'Emily', lastName: 'Rodriguez', email: 'emily.rodriguez@evergreen.com', avatar: null, title: 'Product Designer', department: 'Design', team: 'Design Systems', location: 'New York, NY', startDate: '2022-01-10', managerId: 'user_2', directReportIds: [], role: 'ic', status: 'active', birthday: '1993-03-07', workAnniversary: '2022-01-10' },
    { id: 'user_4', firstName: 'James', lastName: 'Kim', email: 'james.kim@evergreen.com', avatar: null, title: 'Software Engineer', department: 'Engineering', team: 'Backend', location: 'Austin, TX', startDate: '2023-06-05', managerId: 'user_6', directReportIds: [], role: 'ic', status: 'active', birthday: '1996-09-15', workAnniversary: '2023-06-05' },
    { id: 'user_5', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@evergreen.com', avatar: null, title: 'Marketing Manager', department: 'Marketing', team: 'Growth', location: 'Chicago, IL', startDate: '2020-11-12', managerId: 'user_7', directReportIds: ['user_18'], role: 'manager', status: 'active', birthday: '1988-04-30', workAnniversary: '2020-11-12' },
    { id: 'user_6', firstName: 'David', lastName: 'Thompson', email: 'david.thompson@evergreen.com', avatar: null, title: 'Engineering Manager', department: 'Engineering', team: 'Backend', location: 'Seattle, WA', startDate: '2018-03-20', managerId: 'user_10', directReportIds: ['user_4', 'user_11', 'user_15'], role: 'manager', status: 'active', birthday: '1982-07-18', workAnniversary: '2018-03-20' },
    { id: 'user_7', firstName: 'Lisa', lastName: 'Wang', email: 'lisa.wang@evergreen.com', avatar: null, title: 'Director of Marketing', department: 'Marketing', team: 'Marketing Leadership', location: 'San Francisco, CA', startDate: '2017-09-01', managerId: 'user_10', directReportIds: ['user_5', 'user_18'], role: 'manager', status: 'active', birthday: '1980-12-03', workAnniversary: '2017-09-01' },
    { id: 'user_8', firstName: 'Alex', lastName: 'Okafor', email: 'alex.okafor@evergreen.com', avatar: null, title: 'Account Executive', department: 'Sales', team: 'Enterprise Sales', location: 'Boston, MA', startDate: '2024-01-08', managerId: 'user_9', directReportIds: [], role: 'ic', status: 'active', birthday: '1997-02-14', workAnniversary: '2024-01-08' },
    { id: 'user_9', firstName: 'Rachel', lastName: 'Martinez', email: 'rachel.martinez@evergreen.com', avatar: null, title: 'Sales Director', department: 'Sales', team: 'Sales Leadership', location: 'New York, NY', startDate: '2019-04-15', managerId: 'user_10', directReportIds: ['user_8', 'user_19'], role: 'manager', status: 'active', birthday: '1986-08-25', workAnniversary: '2019-04-15' },
    { id: 'user_10', firstName: 'Michael', lastName: 'Torres', email: 'michael.torres@evergreen.com', avatar: null, title: 'CEO', department: 'Executive', team: 'Leadership', location: 'San Francisco, CA', startDate: '2015-01-01', managerId: null, directReportIds: ['user_2', 'user_6', 'user_7', 'user_9', 'user_13', 'user_20'], role: 'admin', status: 'active', birthday: '1975-05-10', workAnniversary: '2015-01-01' },
    { id: 'user_11', firstName: 'Aisha', lastName: 'Rahman', email: 'aisha.rahman@evergreen.com', avatar: null, title: 'Senior Software Engineer', department: 'Engineering', team: 'Frontend', location: 'San Francisco, CA', startDate: '2020-06-01', managerId: 'user_6', directReportIds: [], role: 'ic', status: 'active', birthday: '1991-09-20', workAnniversary: '2020-06-01' },
    { id: 'user_12', firstName: 'Tom', lastName: 'Nguyen', email: 'tom.nguyen@evergreen.com', avatar: null, title: 'Data Analyst', department: 'Product', team: 'Analytics', location: 'Austin, TX', startDate: '2022-08-15', managerId: 'user_2', directReportIds: [], role: 'ic', status: 'active', birthday: '1994-01-28', workAnniversary: '2022-08-15' },
    { id: 'user_13', firstName: 'Olivia', lastName: 'Bennett', email: 'olivia.bennett@evergreen.com', avatar: null, title: 'Head of People Operations', department: 'People Operations', team: 'People', location: 'San Francisco, CA', startDate: '2019-02-11', managerId: 'user_10', directReportIds: ['user_16', 'user_17'], role: 'manager', status: 'active', birthday: '1985-05-18', workAnniversary: '2019-02-11' },
    { id: 'user_14', firstName: 'Jordan', lastName: 'Lee', email: 'jordan.lee@evergreen.com', avatar: null, title: 'Associate Product Manager', department: 'Product', team: 'Platform Team', location: 'San Francisco, CA', startDate: '2024-03-04', managerId: 'user_1', directReportIds: [], role: 'ic', status: 'active', birthday: '1998-11-02', workAnniversary: '2024-03-04' },
    { id: 'user_15', firstName: 'Carlos', lastName: 'Reyes', email: 'carlos.reyes@evergreen.com', avatar: null, title: 'DevOps Engineer', department: 'Engineering', team: 'Infrastructure', location: 'Denver, CO', startDate: '2021-10-18', managerId: 'user_6', directReportIds: [], role: 'ic', status: 'active', birthday: '1992-03-14', workAnniversary: '2021-10-18' },
    { id: 'user_16', firstName: 'Megan', lastName: 'Foster', email: 'megan.foster@evergreen.com', avatar: null, title: 'Recruiting Coordinator', department: 'People Operations', team: 'Talent Acquisition', location: 'New York, NY', startDate: '2023-01-23', managerId: 'user_13', directReportIds: [], role: 'ic', status: 'active', birthday: '1995-07-09', workAnniversary: '2023-01-23' },
    { id: 'user_17', firstName: 'Derek', lastName: 'Chang', email: 'derek.chang@evergreen.com', avatar: null, title: 'People Partner', department: 'People Operations', team: 'People', location: 'San Francisco, CA', startDate: '2020-09-07', managerId: 'user_13', directReportIds: [], role: 'ic', status: 'active', birthday: '1989-12-01', workAnniversary: '2020-09-07' },
    { id: 'user_18', firstName: 'Sofia', lastName: 'Alvarez', email: 'sofia.alvarez@evergreen.com', avatar: null, title: 'Content Marketing Specialist', department: 'Marketing', team: 'Growth', location: 'Miami, FL', startDate: '2023-09-11', managerId: 'user_5', directReportIds: [], role: 'ic', status: 'active', birthday: '1996-08-22', workAnniversary: '2023-09-11' },
    { id: 'user_19', firstName: 'Nathan', lastName: 'Brooks', email: 'nathan.brooks@evergreen.com', avatar: null, title: 'Sales Development Rep', department: 'Sales', team: 'Sales Development', location: 'Boston, MA', startDate: '2024-06-17', managerId: 'user_9', directReportIds: [], role: 'ic', status: 'active', birthday: '1999-04-05', workAnniversary: '2024-06-17' },
    { id: 'user_20', firstName: 'Karen', lastName: 'Mitchell', email: 'karen.mitchell@evergreen.com', avatar: null, title: 'CFO', department: 'Finance', team: 'Finance Leadership', location: 'San Francisco, CA', startDate: '2017-04-01', managerId: 'user_10', directReportIds: ['user_21'], role: 'manager', status: 'active', birthday: '1978-10-30', workAnniversary: '2017-04-01' },
    { id: 'user_21', firstName: 'Brian', lastName: 'Park', email: 'brian.park@evergreen.com', avatar: null, title: 'Financial Analyst', department: 'Finance', team: 'FP&A', location: 'San Francisco, CA', startDate: '2022-05-09', managerId: 'user_20', directReportIds: [], role: 'ic', status: 'active', birthday: '1993-06-17', workAnniversary: '2022-05-09' },
    { id: 'user_22', firstName: 'Tanya', lastName: 'Williams', email: 'tanya.williams@evergreen.com', avatar: null, title: 'UX Researcher', department: 'Design', team: 'Design Systems', location: 'Portland, OR', startDate: '2023-03-27', managerId: 'user_2', directReportIds: [], role: 'ic', status: 'active', birthday: '1994-02-15', workAnniversary: '2023-03-27' },
    { id: 'user_23', firstName: 'Kevin', lastName: 'Zhao', email: 'kevin.zhao@evergreen.com', avatar: null, title: 'QA Engineer', department: 'Engineering', team: 'Quality', location: 'Seattle, WA', startDate: '2022-11-14', managerId: 'user_6', directReportIds: [], role: 'ic', status: 'active', birthday: '1991-12-08', workAnniversary: '2022-11-14' },
    { id: 'user_24', firstName: 'Hannah', lastName: 'Davis', email: 'hannah.davis@evergreen.com', avatar: null, title: 'Customer Success Manager', department: 'Sales', team: 'Customer Success', location: 'Chicago, IL', startDate: '2021-07-19', managerId: 'user_9', directReportIds: [], role: 'ic', status: 'active', birthday: '1990-03-11', workAnniversary: '2021-07-19' },
  ]

  return {
    currentUser: { ...users[0] },
    users,

    goals: [
      { id: 'goal_1', title: 'Launch v2.0 of the platform', description: 'Complete the redesign and ship the v2.0 platform release to all customers by end of Q2 with improved performance and UX.', ownerId: 'user_1', status: 'on_track', progress: 65, dueDate: '2025-06-30', parentGoalId: 'goal_3', category: 'individual', keyResults: [
        { id: 'kr_1_1', title: 'Complete UI redesign for all 5 core pages', startValue: 0, currentValue: 3, targetValue: 5, unit: 'pages' },
        { id: 'kr_1_2', title: 'Achieve 95% test coverage', startValue: 72, currentValue: 88, targetValue: 95, unit: '%' },
        { id: 'kr_1_3', title: 'Reduce page load time', startValue: 4200, currentValue: 2800, targetValue: 2000, unit: 'ms' },
      ], createdAt: '2025-01-10T09:00:00Z', updatedAt: '2025-04-01T14:30:00Z' },
      { id: 'goal_2', title: 'Improve NPS score from 42 to 55', description: 'Collect systematic customer feedback and implement top-requested improvements to drive NPS improvement this quarter.', ownerId: 'user_1', status: 'progressing', progress: 30, dueDate: '2025-06-30', parentGoalId: null, category: 'individual', keyResults: [
        { id: 'kr_2_1', title: 'Conduct 20 customer interviews', startValue: 0, currentValue: 7, targetValue: 20, unit: 'interviews' },
        { id: 'kr_2_2', title: 'Increase NPS score', startValue: 42, currentValue: 45, targetValue: 55, unit: 'NPS' },
      ], createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-03-20T11:00:00Z' },
      { id: 'goal_3', title: 'Achieve $10M ARR by Q4', description: 'Drive revenue growth through product-led growth initiatives, new enterprise deals, and improved retention.', ownerId: 'user_2', status: 'on_track', progress: 58, dueDate: '2025-12-31', parentGoalId: 'goal_5', category: 'team', keyResults: [
        { id: 'kr_3_1', title: 'Close 15 enterprise deals', startValue: 0, currentValue: 9, targetValue: 15, unit: 'deals' },
        { id: 'kr_3_2', title: 'Reach $10M ARR', startValue: 5800000, currentValue: 7200000, targetValue: 10000000, unit: '$' },
      ], createdAt: '2025-01-05T09:00:00Z', updatedAt: '2025-04-03T09:00:00Z' },
      { id: 'goal_4', title: 'Build world-class engineering culture', description: 'Establish a culture of excellence through improved processes, better tooling, and strong mentorship programs.', ownerId: 'user_6', status: 'progressing', progress: 42, dueDate: '2025-12-31', parentGoalId: 'goal_6', category: 'team', keyResults: [
        { id: 'kr_4_1', title: 'Improve deployment frequency to daily', startValue: 3, currentValue: 5, targetValue: 7, unit: 'deploys/week' },
        { id: 'kr_4_2', title: 'Achieve 90% team satisfaction in eng survey', startValue: 72, currentValue: 78, targetValue: 90, unit: '%' },
      ], createdAt: '2025-02-01T09:00:00Z', updatedAt: '2025-03-15T14:00:00Z' },
      { id: 'goal_5', title: 'Expand into EMEA market', description: 'Open European operations and establish partnerships with 5 regional resellers.', ownerId: 'user_10', status: 'on_track', progress: 55, dueDate: '2025-09-30', parentGoalId: null, category: 'company', keyResults: [
        { id: 'kr_5_1', title: 'Hire EMEA country manager', startValue: 0, currentValue: 1, targetValue: 1, unit: 'hire' },
        { id: 'kr_5_2', title: 'Sign 5 regional resellers', startValue: 0, currentValue: 3, targetValue: 5, unit: 'partners' },
      ], createdAt: '2025-01-01T09:00:00Z', updatedAt: '2025-04-02T10:00:00Z' },
      { id: 'goal_6', title: 'Achieve SOC 2 Type II certification', description: 'Complete security audit and implement all required controls to earn SOC 2 Type II certification.', ownerId: 'user_10', status: 'on_track', progress: 80, dueDate: '2025-05-30', parentGoalId: null, category: 'company', keyResults: [
        { id: 'kr_6_1', title: 'Complete security assessment', startValue: 0, currentValue: 1, targetValue: 1, unit: 'audit' },
        { id: 'kr_6_2', title: 'Remediate all critical findings', startValue: 18, currentValue: 15, targetValue: 0, unit: 'open findings' },
      ], createdAt: '2024-11-01T09:00:00Z', updatedAt: '2025-03-30T15:00:00Z' },
      { id: 'goal_7', title: 'Complete customer success playbook', description: 'Document and systematize the customer success process for onboarding and ongoing support.', ownerId: 'user_9', status: 'completed', progress: 100, dueDate: '2025-03-31', parentGoalId: null, category: 'individual', keyResults: [
        { id: 'kr_7_1', title: 'Document all CS workflows', startValue: 0, currentValue: 12, targetValue: 12, unit: 'workflows' },
      ], createdAt: '2025-01-15T09:00:00Z', updatedAt: '2025-03-28T16:00:00Z' },
      { id: 'goal_8', title: 'Launch company-wide mentorship program', description: 'Design and launch a structured mentorship program pairing senior employees with new hires.', ownerId: 'user_7', status: 'behind', progress: 15, dueDate: '2025-05-01', parentGoalId: null, category: 'team', keyResults: [
        { id: 'kr_8_1', title: 'Pair 20 mentors with mentees', startValue: 0, currentValue: 3, targetValue: 20, unit: 'pairs' },
        { id: 'kr_8_2', title: 'Complete program design documents', startValue: 0, currentValue: 1, targetValue: 4, unit: 'docs' },
      ], createdAt: '2025-02-01T09:00:00Z', updatedAt: '2025-03-10T11:00:00Z' },
      { id: 'goal_9', title: 'Reduce CI/CD pipeline time by 50%', description: 'Optimize build and deployment infrastructure to cut pipeline time from 20 to 10 minutes.', ownerId: 'user_15', status: 'on_track', progress: 70, dueDate: '2025-06-30', parentGoalId: 'goal_4', category: 'individual', keyResults: [
        { id: 'kr_9_1', title: 'Reduce build time', startValue: 20, currentValue: 13, targetValue: 10, unit: 'minutes' },
        { id: 'kr_9_2', title: 'Implement parallel test execution', startValue: 0, currentValue: 1, targetValue: 1, unit: 'complete' },
      ], createdAt: '2025-02-15T09:00:00Z', updatedAt: '2025-04-05T10:00:00Z' },
      { id: 'goal_10', title: 'Increase enterprise deal pipeline by 40%', description: 'Expand outbound and inbound pipeline for enterprise segment.', ownerId: 'user_8', status: 'progressing', progress: 35, dueDate: '2025-06-30', parentGoalId: null, category: 'individual', keyResults: [
        { id: 'kr_10_1', title: 'Generate 50 qualified enterprise leads', startValue: 0, currentValue: 18, targetValue: 50, unit: 'leads' },
        { id: 'kr_10_2', title: 'Book 30 demo meetings', startValue: 0, currentValue: 12, targetValue: 30, unit: 'demos' },
      ], createdAt: '2025-01-20T09:00:00Z', updatedAt: '2025-04-01T11:00:00Z' },
      { id: 'goal_11', title: 'Redesign the onboarding experience', description: 'Create a new employee onboarding program that reduces time-to-productivity from 60 to 30 days.', ownerId: 'user_13', status: 'on_track', progress: 50, dueDate: '2025-07-31', parentGoalId: null, category: 'team', keyResults: [
        { id: 'kr_11_1', title: 'Create onboarding curriculum', startValue: 0, currentValue: 6, targetValue: 10, unit: 'modules' },
        { id: 'kr_11_2', title: 'Reduce time-to-productivity', startValue: 60, currentValue: 45, targetValue: 30, unit: 'days' },
      ], createdAt: '2025-02-01T09:00:00Z', updatedAt: '2025-04-02T10:00:00Z' },
      { id: 'goal_12', title: 'Grow organic blog traffic by 3x', description: 'Develop and execute content strategy to triple monthly blog visitors.', ownerId: 'user_18', status: 'progressing', progress: 40, dueDate: '2025-09-30', parentGoalId: null, category: 'individual', keyResults: [
        { id: 'kr_12_1', title: 'Publish 24 SEO-optimized articles', startValue: 0, currentValue: 10, targetValue: 24, unit: 'articles' },
        { id: 'kr_12_2', title: 'Increase monthly visitors', startValue: 15000, currentValue: 28000, targetValue: 45000, unit: 'visitors' },
      ], createdAt: '2025-01-10T09:00:00Z', updatedAt: '2025-04-05T09:00:00Z' },
    ],

    feedback: [
      {
        id: 'fb_1',
        type: 'feedback',
        fromUserId: 'user_2',
        toUserId: 'user_1',
        body: 'Sarah did an exceptional job leading the Q1 platform planning sessions. Her preparation and ability to align cross-functional stakeholders was impressive. She kept the team focused and drove us to clear decisions even when there was ambiguity.',
        visibility: 'private',
        competencyTags: ['Leadership', 'Communication'],
        valueTags: [],
        reactions: [],
        createdAt: '2025-03-28T10:15:00Z',
      },
      {
        id: 'fb_2',
        type: 'feedback',
        fromUserId: 'user_3',
        toUserId: 'user_1',
        body: 'Sarah is a great collaborator. During the design review process, she always came prepared with clear use cases and user stories. I especially appreciated how she advocated for the user perspective while still being pragmatic about engineering constraints.',
        visibility: 'private',
        competencyTags: ['Collaboration', 'User Focus'],
        valueTags: [],
        reactions: [],
        createdAt: '2025-03-15T14:00:00Z',
      },
      {
        id: 'fb_3',
        type: 'feedback',
        fromUserId: 'user_6',
        toUserId: 'user_1',
        body: 'I appreciated how Sarah managed the v2.0 timeline when we hit the API integration blocker. She quickly reprioritized work, communicated clearly with stakeholders, and kept morale high. One area to grow: proactively flagging risks earlier in the cycle.',
        visibility: 'manager_only',
        competencyTags: ['Project Management', 'Adaptability'],
        valueTags: [],
        reactions: [],
        createdAt: '2025-02-20T09:30:00Z',
      },
      {
        id: 'fb_4',
        type: 'praise',
        fromUserId: 'user_2',
        toUserId: 'user_1',
        body: "Sarah's work on the onboarding redesign was outstanding! She shipped the new user onboarding flow ahead of schedule and the results speak for themselves — activation rates are up 18% week over week. This is exactly the kind of impact we need. 🎉",
        visibility: 'public',
        competencyTags: ['Execution', 'Impact'],
        valueTags: ['Customer Focus', 'Innovation'],
        reactions: [
          { userId: 'user_3', emoji: '👏' },
          { userId: 'user_5', emoji: '👏' },
          { userId: 'user_8', emoji: '🎉' },
        ],
        createdAt: '2025-04-02T11:00:00Z',
      },
      {
        id: 'fb_5',
        type: 'praise',
        fromUserId: 'user_3',
        toUserId: 'user_1',
        body: 'Huge shoutout to Sarah for her incredible support during the design sprint last week. She stayed late multiple evenings to help us refine the prototypes and her product instincts helped us avoid a significant usability issue. True team player!',
        visibility: 'public',
        competencyTags: ['Teamwork', 'Dedication'],
        valueTags: ['Teamwork', 'Growth Mindset'],
        reactions: [
          { userId: 'user_2', emoji: '👏' },
          { userId: 'user_4', emoji: '❤️' },
        ],
        createdAt: '2025-03-22T16:00:00Z',
      },
      {
        id: 'fb_6',
        type: 'feedback',
        fromUserId: 'user_1',
        toUserId: 'user_3',
        body: 'Emily has been an incredible design partner on the v2.0 project. Her attention to detail and ability to translate complex user needs into elegant UI solutions has elevated our product significantly. She proactively identifies potential UX issues before they become problems.',
        visibility: 'private',
        competencyTags: ['Design Thinking', 'Proactivity'],
        valueTags: [],
        reactions: [],
        createdAt: '2025-03-25T10:00:00Z',
      },
      {
        id: 'fb_7',
        type: 'praise',
        fromUserId: 'user_1',
        toUserId: 'user_4',
        body: 'James went above and beyond this sprint by independently identifying and fixing a critical performance regression that would have impacted our largest customers. He did this without being asked and documented the solution clearly for the team.',
        visibility: 'public',
        competencyTags: ['Initiative', 'Technical Skills'],
        valueTags: ['Innovation', 'Integrity'],
        reactions: [
          { userId: 'user_6', emoji: '👏' },
          { userId: 'user_2', emoji: '🙌' },
        ],
        createdAt: '2025-04-05T09:00:00Z',
      },
      {
        id: 'fb_8',
        type: 'praise',
        fromUserId: 'user_5',
        toUserId: 'user_7',
        body: 'Lisa has been an exceptional mentor and sponsor. She advocated for my promotion, gave me visibility on the exec team presentation, and provided thoughtful coaching throughout. I am grateful to have her as my manager.',
        visibility: 'public',
        competencyTags: ['Mentorship', 'Leadership'],
        valueTags: ['Teamwork', 'Growth Mindset'],
        reactions: [
          { userId: 'user_10', emoji: '👏' },
        ],
        createdAt: '2025-04-01T14:00:00Z',
      },
      {
        id: 'fb_9',
        type: 'feedback',
        fromUserId: 'user_8',
        toUserId: 'user_1',
        body: 'Would love to get Sarah\'s feedback on how I presented the product roadmap to our enterprise prospects last week. Specifically curious if the value proposition messaging resonated and what I could strengthen.',
        visibility: 'private',
        competencyTags: [],
        valueTags: [],
        reactions: [],
        createdAt: '2025-04-08T15:00:00Z',
        isPendingRequest: true,
      },
      {
        id: 'fb_10',
        type: 'feedback',
        fromUserId: 'user_1',
        toUserId: 'user_2',
        body: 'Marcus is one of the best managers I have had. He provides clear direction, creates space for autonomy, and always has my back with stakeholders. He could improve by giving more frequent informal check-ins between our 1:1s, but overall I feel very supported.',
        visibility: 'manager_only',
        competencyTags: ['Management', 'Strategy'],
        valueTags: [],
        reactions: [],
        createdAt: '2025-03-10T10:00:00Z',
      },
    ],

    oneOnOnes: [
      { id: 'oo_1', participantIds: ['user_1', 'user_2'], frequency: 'weekly', nextMeetingDate: '2025-04-14T14:00:00Z' },
      { id: 'oo_2', participantIds: ['user_1', 'user_3'], frequency: 'biweekly', nextMeetingDate: '2025-04-16T11:00:00Z' },
      { id: 'oo_3', participantIds: ['user_1', 'user_14'], frequency: 'weekly', nextMeetingDate: '2025-04-15T10:00:00Z' },
    ],

    meetings: [
      {
        id: 'meeting_1',
        oneOnOneId: 'oo_1',
        date: '2025-04-14T14:00:00Z',
        status: 'upcoming',
        talkingPoints: [
          { id: 'tp_1_1', text: 'Discuss Q2 goal progress and any blockers', addedBy: 'user_1', discussed: false, order: 0 },
          { id: 'tp_1_2', text: 'Review promotion timeline and next steps', addedBy: 'user_1', discussed: false, order: 1 },
          { id: 'tp_1_3', text: 'Align on v2.0 launch communication plan', addedBy: 'user_2', discussed: false, order: 2 },
          { id: 'tp_1_4', text: 'Team capacity planning for May', addedBy: 'user_2', discussed: false, order: 3 },
        ],
        actionItems: [
          { id: 'ai_1_1', text: 'Draft Q2 roadmap summary for exec review', assigneeId: 'user_1', dueDate: '2025-04-18', completed: false },
          { id: 'ai_1_2', text: 'Schedule skip-level with Michael', assigneeId: 'user_1', dueDate: '2025-04-15', completed: false },
        ],
        notes: '',
      },
      {
        id: 'meeting_2',
        oneOnOneId: 'oo_2',
        date: '2025-04-16T11:00:00Z',
        status: 'upcoming',
        talkingPoints: [
          { id: 'tp_2_1', text: 'Review the new settings page designs', addedBy: 'user_3', discussed: false, order: 0 },
          { id: 'tp_2_2', text: 'Discuss collaboration process improvements', addedBy: 'user_1', discussed: false, order: 1 },
          { id: 'tp_2_3', text: 'Feedback on the onboarding flow iterations', addedBy: 'user_1', discussed: false, order: 2 },
        ],
        actionItems: [],
        notes: '',
      },
      {
        id: 'meeting_3',
        oneOnOneId: 'oo_1',
        date: '2025-04-07T14:00:00Z',
        status: 'completed',
        talkingPoints: [
          { id: 'tp_3_1', text: 'Q1 performance review preparation', addedBy: 'user_2', discussed: true, order: 0 },
          { id: 'tp_3_2', text: 'v2.0 milestone status update', addedBy: 'user_1', discussed: true, order: 1 },
          { id: 'tp_3_3', text: 'Cross-functional team alignment issues', addedBy: 'user_1', discussed: true, order: 2 },
        ],
        actionItems: [
          { id: 'ai_3_1', text: 'Complete self-review by April 10', assigneeId: 'user_1', dueDate: '2025-04-10', completed: false },
          { id: 'ai_3_2', text: 'Set up cross-team sync with Engineering', assigneeId: 'user_1', dueDate: '2025-04-09', completed: true },
        ],
        notes: 'Good check-in. Sarah is making solid progress on the v2.0 launch. Main risk is the API integration timeline — need to ensure James has what he needs. Self-review deadline coming up this week.',
      },
      {
        id: 'meeting_4',
        oneOnOneId: 'oo_1',
        date: '2025-03-31T14:00:00Z',
        status: 'completed',
        talkingPoints: [
          { id: 'tp_4_1', text: 'Q1 wrap-up and wins to celebrate', addedBy: 'user_2', discussed: true, order: 0 },
          { id: 'tp_4_2', text: 'Career development discussion — promotion path', addedBy: 'user_1', discussed: true, order: 1 },
        ],
        actionItems: [
          { id: 'ai_4_1', text: 'Document impact metrics for promotion packet', assigneeId: 'user_1', dueDate: '2025-04-07', completed: true },
        ],
        notes: 'Great end-of-quarter conversation. Sarah has had a strong Q1 and is on track for promotion consideration. Marcus committed to presenting her case at the next calibration session.',
      },
      {
        id: 'meeting_5',
        oneOnOneId: 'oo_2',
        date: '2025-04-02T11:00:00Z',
        status: 'completed',
        talkingPoints: [
          { id: 'tp_5_1', text: 'Design handoff process for v2.0', addedBy: 'user_1', discussed: true, order: 0 },
          { id: 'tp_5_2', text: 'Emily\'s growth area progress update', addedBy: 'user_3', discussed: true, order: 1 },
        ],
        actionItems: [
          { id: 'ai_5_1', text: 'Create design-to-dev handoff template', assigneeId: 'user_3', dueDate: '2025-04-09', completed: false },
        ],
        notes: 'Productive session. Emily is doing great work on the design system. We agreed on a new handoff checklist to improve the PM-Design collaboration workflow.',
      },
      {
        id: 'meeting_6',
        oneOnOneId: 'oo_1',
        date: '2025-03-24T14:00:00Z',
        status: 'completed',
        talkingPoints: [
          { id: 'tp_6_1', text: 'Mid-quarter check-in: goals progress', addedBy: 'user_2', discussed: true, order: 0 },
          { id: 'tp_6_2', text: 'Feedback on customer advisory board presentation', addedBy: 'user_1', discussed: true, order: 1 },
        ],
        actionItems: [],
        notes: 'Solid meeting. Sarah received very positive feedback from the CAB presentation. Goals are tracking well — NPS goal needs more focus in Q2.',
      },
      {
        id: 'meeting_7',
        oneOnOneId: 'oo_3',
        date: '2025-04-15T10:00:00Z',
        status: 'upcoming',
        talkingPoints: [
          { id: 'tp_7_1', text: 'Onboarding progress check-in', addedBy: 'user_1', discussed: false, order: 0 },
          { id: 'tp_7_2', text: 'Assign first independent feature ownership', addedBy: 'user_1', discussed: false, order: 1 },
          { id: 'tp_7_3', text: 'Questions about product strategy', addedBy: 'user_14', discussed: false, order: 2 },
        ],
        actionItems: [
          { id: 'ai_7_1', text: 'Review the analytics dashboard PRD draft', assigneeId: 'user_14', dueDate: '2025-04-17', completed: false },
        ],
        notes: '',
      },
    ],

    reviewCycles: [
      {
        id: 'rc_1',
        name: 'Q1 2025 Performance Review',
        status: 'active',
        startDate: '2025-03-15',
        endDate: '2025-04-15',
        steps: ['nominate_peers', 'manage_team', 'share_results'],
        currentStep: 'manage_team',
        revieweeIds: ['user_1', 'user_3', 'user_4', 'user_5', 'user_6', 'user_11', 'user_14', 'user_15'],
        nominationsSubmitted: true,
      },
      {
        id: 'rc_2',
        name: 'Q3 2024 Performance Review',
        status: 'completed',
        startDate: '2024-09-15',
        endDate: '2024-10-15',
        steps: ['nominate_peers', 'manage_team', 'share_results'],
        currentStep: 'share_results',
        revieweeIds: ['user_1', 'user_3', 'user_4', 'user_8', 'user_11'],
        nominationsSubmitted: true,
      },
    ],

    reviews: [
      { id: 'rev_1', cycleId: 'rc_1', revieweeId: 'user_3', status: 'completed', nominatedPeerIds: ['user_1', 'user_2'], reviews: [
        { reviewerId: 'user_2', type: 'manager', overallRating: 'exceeds_expectations', responses: [
          { question: "What are this person's key strengths?", answer: 'Emily is a gifted designer with exceptional product instincts. She consistently delivers high-quality work under tight timelines.' },
          { question: 'What areas could this person improve?', answer: 'Could be more proactive in communicating blockers to the broader team.' },
        ], competencyRatings: [
          { competency: 'Design Quality', rating: 5 }, { competency: 'Collaboration', rating: 4 }, { competency: 'Communication', rating: 3 },
        ], submittedAt: '2025-04-02T11:00:00Z' },
      ] },
      { id: 'rev_2', cycleId: 'rc_1', revieweeId: 'user_4', status: 'still_receiving', nominatedPeerIds: ['user_6', 'user_1', 'user_11'], reviews: [] },
      { id: 'rev_3', cycleId: 'rc_1', revieweeId: 'user_5', status: 'still_receiving', nominatedPeerIds: ['user_7', 'user_3', 'user_18'], reviews: [] },
      { id: 'rev_4', cycleId: 'rc_1', revieweeId: 'user_6', status: 'not_started', nominatedPeerIds: [], reviews: [] },
      { id: 'rev_5', cycleId: 'rc_1', revieweeId: 'user_1', status: 'not_started', nominatedPeerIds: ['user_2', 'user_3', 'user_6'], selfReviewSubmitted: false, reviews: [] },
      { id: 'rev_6', cycleId: 'rc_1', revieweeId: 'user_11', status: 'still_receiving', nominatedPeerIds: ['user_4', 'user_15'], reviews: [] },
      { id: 'rev_7', cycleId: 'rc_1', revieweeId: 'user_14', status: 'not_started', nominatedPeerIds: [], reviews: [] },
      { id: 'rev_8', cycleId: 'rc_1', revieweeId: 'user_15', status: 'completed', nominatedPeerIds: ['user_11', 'user_23'], reviews: [
        { reviewerId: 'user_6', type: 'manager', overallRating: 'meets_expectations', responses: [
          { question: "What are this person's key strengths?", answer: 'Carlos has made significant improvements to our CI/CD pipeline. Solid technical skills.' },
          { question: 'What areas could this person improve?', answer: 'Could benefit from more cross-team visibility and communication.' },
        ], competencyRatings: [
          { competency: 'Technical Skills', rating: 4 }, { competency: 'Infrastructure', rating: 5 }, { competency: 'Communication', rating: 3 },
        ], submittedAt: '2025-04-04T09:00:00Z' },
      ] },
    ],

    updates: [
      {
        id: 'upd_1',
        authorId: 'user_1',
        weekOf: '2025-04-07',
        accomplishments: 'Completed the API integration spec for the payments module. Reviewed 3 PRs from the engineering team. Led the weekly product sync and resolved the design-engineering handoff bottleneck. Had productive 1:1 with Marcus to align on Q2 priorities.',
        challenges: 'Still blocked on design approvals for the settings page — Emily is slammed with the v2.0 sprint. Also struggling to get time with stakeholders for the pricing strategy review.',
        priorities: 'Finalize the settings page UI with Emily. Begin QA testing planning for payments flow. Schedule the pricing strategy working session with Lisa and Rachel.',
        mood: 'good',
        createdAt: '2025-04-11T16:00:00Z',
      },
      {
        id: 'upd_2',
        authorId: 'user_1',
        weekOf: '2025-03-31',
        accomplishments: 'Wrapped up Q1 with a great CAB presentation — received very positive feedback from 8 enterprise customers. Finalized the v2.0 feature set and communicated it to the engineering team. Reviewed and approved 4 designs from Emily.',
        challenges: 'The API timeline risk with James\'s team needs attention. We may need to descope one feature to hit the launch date. Also dealing with ambiguity around the EMEA expansion requirements.',
        priorities: 'Kick off Q2 planning. Finalize v2.0 scope decision by Tuesday. Set up cross-functional sync for the EMEA product requirements.',
        mood: 'great',
        createdAt: '2025-04-04T17:00:00Z',
      },
      {
        id: 'upd_3',
        authorId: 'user_1',
        weekOf: '2025-03-24',
        accomplishments: 'Prepared and delivered the Customer Advisory Board presentation. Got the onboarding redesign shipped — activation rates up 18% already. Completed mid-quarter goal check-in with Marcus.',
        challenges: 'Stakeholder alignment continues to be challenging on the pricing project. Different teams have conflicting requirements that need executive arbitration.',
        priorities: 'CAB follow-up action items. Continue v2.0 design reviews. Resolve pricing project stakeholder conflicts.',
        mood: 'good',
        createdAt: '2025-03-28T16:00:00Z',
      },
      {
        id: 'upd_4',
        authorId: 'user_1',
        weekOf: '2025-03-17',
        accomplishments: 'Started the Q1 review cycle self-assessment. Kicked off the onboarding redesign project with Emily. Resolved 2 critical product bugs that were affecting enterprise customers.',
        challenges: 'Team bandwidth is stretched — 3 concurrent initiatives is too many. Need to make a prioritization call. Also feeling a bit overwhelmed with the review cycle on top of regular work.',
        priorities: 'Complete self-assessment draft. Prioritize the three current initiatives and deprioritize one. Prepare for CAB presentation.',
        mood: 'okay',
        createdAt: '2025-03-21T15:00:00Z',
      },
    ],

    growthAreas: [
      {
        id: 'ga_1',
        userId: 'user_1',
        title: 'Improve my onboarding training skills',
        description: 'Develop the ability to create and deliver effective onboarding programs that get new team members productive quickly and feeling welcomed into the team culture.',
        status: 'active',
        actions: [
          { id: 'ga_1_a1', text: 'Shadow 2 onboarding sessions led by senior trainers', completed: true },
          { id: 'ga_1_a2', text: 'Create an onboarding checklist template for new PMs', completed: false },
        ],
        createdAt: '2024-11-15T10:00:00Z',
        updatedAt: '2024-12-27T14:00:00Z',
      },
      {
        id: 'ga_2',
        userId: 'user_1',
        title: 'Establish cross-functional team of talent experts',
        description: 'Build a network of cross-functional partners to improve product-engineering collaboration and reduce friction in the development process.',
        status: 'active',
        actions: [
          { id: 'ga_2_a1', text: 'Schedule monthly cross-functional PM/Eng/Design working sessions', completed: true },
          { id: 'ga_2_a2', text: 'Create a shared decision-making framework document', completed: true },
        ],
        createdAt: '2024-10-01T10:00:00Z',
        updatedAt: '2024-12-27T12:00:00Z',
      },
      {
        id: 'ga_3',
        userId: 'user_1',
        title: 'Learn data visualization techniques',
        description: 'Develop proficiency in data visualization tools and techniques to better analyze product metrics and communicate insights to stakeholders.',
        status: 'draft',
        actions: [
          { id: 'ga_3_a1', text: 'Complete Tableau fundamentals course', completed: false },
        ],
        createdAt: '2025-01-10T09:00:00Z',
        updatedAt: '2025-01-10T09:00:00Z',
      },
    ],

    careerTracks: [
      {
        id: 'ct_1',
        title: 'Product Manager',
        levels: [
          {
            id: 'ct_1_l1', name: 'Associate Product Manager', level: 1,
            competencies: [
              { name: 'Product Thinking', description: 'Understands basic product principles and user needs. Can articulate the problem being solved.' },
              { name: 'Data Analysis', description: 'Comfortable reading dashboards and interpreting key metrics with guidance.' },
              { name: 'Execution', description: 'Manages sprint tasks and delivers features with close manager support.' },
              { name: 'Communication', description: 'Communicates clearly in writing and in small group settings.' },
            ]
          },
          {
            id: 'ct_1_l2', name: 'Product Manager', level: 2,
            competencies: [
              { name: 'Product Thinking', description: 'Defines product strategy for a feature area. Conducts independent user research.' },
              { name: 'Data Analysis', description: 'Designs experiments, interprets A/B test results, and drives metric improvements.' },
              { name: 'Execution', description: 'Owns product roadmap for a feature area. Manages stakeholder expectations independently.' },
              { name: 'Communication', description: 'Presents to senior leadership. Writes compelling PRDs and strategy docs.' },
            ]
          },
          {
            id: 'ct_1_l3', name: 'Senior Product Manager', level: 3,
            competencies: [
              { name: 'Product Thinking', description: 'Defines multi-quarter strategy for a product area. Anticipates market trends.' },
              { name: 'Data Analysis', description: 'Leads data-driven culture. Mentors others on experimentation best practices.' },
              { name: 'Execution', description: 'Manages complex, cross-functional initiatives. Unblocks organizational bottlenecks.' },
              { name: 'Communication', description: 'Executive presence. Influences decisions across the organization.' },
            ]
          },
        ],
      },
      {
        id: 'ct_2',
        title: 'Software Engineer',
        levels: [
          {
            id: 'ct_2_l1', name: 'Junior Engineer', level: 1,
            competencies: [
              { name: 'Technical Skills', description: 'Writes clean code in primary language. Completes well-defined tasks independently.' },
              { name: 'Problem Solving', description: 'Debugs simple issues. Asks for help when stuck for more than an hour.' },
              { name: 'Collaboration', description: 'Participates constructively in code reviews. Asks good questions.' },
              { name: 'Delivery', description: 'Meets sprint commitments with occasional help.' },
              { name: 'Learning', description: 'Proactively learns from feedback and online resources.' },
            ]
          },
          {
            id: 'ct_2_l2', name: 'Software Engineer', level: 2,
            competencies: [
              { name: 'Technical Skills', description: 'Proficient in the tech stack. Writes well-tested, maintainable code.' },
              { name: 'Problem Solving', description: 'Diagnoses and resolves complex bugs. Proposes solutions independently.' },
              { name: 'Collaboration', description: 'Mentors junior engineers. Gives substantive code review feedback.' },
              { name: 'Delivery', description: 'Reliable sprint delivery. Manages personal work estimates accurately.' },
              { name: 'System Design', description: 'Contributes meaningfully to feature architecture discussions.' },
            ]
          },
          {
            id: 'ct_2_l3', name: 'Senior Engineer', level: 3,
            competencies: [
              { name: 'Technical Skills', description: 'Deep expertise in multiple areas. Shapes team technical standards.' },
              { name: 'Problem Solving', description: 'Solves ambiguous, high-impact technical problems across systems.' },
              { name: 'Collaboration', description: 'Elevates team quality through mentorship and process improvement.' },
              { name: 'Delivery', description: 'Leads multi-sprint initiatives. Manages technical risk.' },
              { name: 'System Design', description: 'Leads architectural decisions for complex systems.' },
            ]
          },
          {
            id: 'ct_2_l4', name: 'Staff Engineer', level: 4,
            competencies: [
              { name: 'Technical Skills', description: 'Organization-wide technical authority. Evaluates and adopts new technologies.' },
              { name: 'Problem Solving', description: 'Frames and solves the highest-leverage technical problems in the org.' },
              { name: 'Collaboration', description: 'Partners with leadership across engineering, product, and design.' },
              { name: 'Delivery', description: 'Aligns technical roadmap with company strategy.' },
              { name: 'System Design', description: 'Defines company-wide architectural principles and patterns.' },
            ]
          },
        ],
      },
    ],

    surveys: [
      {
        id: 'survey_1',
        title: 'Q1 2025 Engagement Pulse',
        status: 'active',
        startDate: '2025-03-20',
        endDate: '2025-04-20',
        responseRate: 78,
        questions: [
          { id: 'sq_1', text: 'I feel valued and recognized for my contributions at work.', type: 'likert', category: 'Belonging' },
          { id: 'sq_2', text: 'My manager actively supports my career development and growth.', type: 'likert', category: 'Manager Effectiveness' },
          { id: 'sq_3', text: 'I have the tools, resources, and information I need to do my job well.', type: 'likert', category: 'Enablement' },
          { id: 'sq_4', text: 'How likely are you to recommend Evergreen Technologies as a great place to work? (0 = not at all, 10 = extremely likely)', type: 'enps', category: 'eNPS' },
          { id: 'sq_5', text: 'What is one thing we could do to improve your experience at Evergreen Technologies?', type: 'open_text', category: 'Open Feedback' },
        ],
        userHasResponded: false,
      },
      {
        id: 'survey_2',
        title: 'Q3 2024 Engagement Pulse',
        status: 'closed',
        startDate: '2024-09-01',
        endDate: '2024-09-20',
        responseRate: 82,
        questions: [
          { id: 'sq2_1', text: 'I feel a strong sense of belonging at this company.', type: 'likert', category: 'Belonging' },
          { id: 'sq2_2', text: 'My manager gives me useful feedback to help me grow.', type: 'likert', category: 'Manager Effectiveness' },
          { id: 'sq2_3', text: 'I am proud to work at this company.', type: 'likert', category: 'Pride' },
          { id: 'sq2_4', text: 'How likely are you to recommend us as a workplace?', type: 'enps', category: 'eNPS' },
          { id: 'sq2_5', text: 'Any additional feedback for leadership?', type: 'open_text', category: 'Open Feedback' },
        ],
        userHasResponded: true,
      },
    ],

    surveyResults: {
      survey_1: {
        overallScore: 4.1,
        eNPS: 32,
        categoryScores: {
          'Belonging': 4.2,
          'Manager Effectiveness': 4.4,
          'Enablement': 3.8,
        },
        responseRate: 78,
      },
      survey_2: {
        overallScore: 3.9,
        eNPS: 28,
        categoryScores: {
          'Belonging': 4.0,
          'Manager Effectiveness': 4.1,
          'Pride': 3.7,
        },
        responseRate: 82,
      },
    },

    tasks: [
      {
        id: 'task_1',
        title: 'Submit self-review for Q1 2025 Performance Review',
        type: 'review',
        assigneeId: 'user_1',
        dueDate: '2025-04-15',
        priority: 'high',
        completed: false,
        relatedEntityId: 'rc_1',
        relatedEntityType: 'review_cycle',
        createdAt: '2025-03-15T09:00:00Z',
      },
      {
        id: 'task_2',
        title: 'Complete Q1 Engagement Pulse survey',
        type: 'survey',
        assigneeId: 'user_1',
        dueDate: '2025-04-20',
        priority: 'medium',
        completed: false,
        relatedEntityId: 'survey_1',
        relatedEntityType: 'survey',
        createdAt: '2025-03-20T09:00:00Z',
      },
      {
        id: 'task_3',
        title: 'Update progress on "Launch v2.0 of the platform" goal',
        type: 'goal',
        assigneeId: 'user_1',
        dueDate: '2025-04-12',
        priority: 'medium',
        completed: false,
        relatedEntityId: 'goal_1',
        relatedEntityType: 'goal',
        createdAt: '2025-04-08T09:00:00Z',
      },
      {
        id: 'task_4',
        title: 'Prepare talking points for 1:1 with Marcus',
        type: 'general',
        assigneeId: 'user_1',
        dueDate: '2025-04-14',
        priority: 'low',
        completed: false,
        relatedEntityId: 'oo_1',
        relatedEntityType: '1on1',
        createdAt: '2025-04-09T09:00:00Z',
      },
      {
        id: 'task_5',
        title: "Review Emily's feedback request",
        type: 'feedback',
        assigneeId: 'user_1',
        dueDate: '2025-04-13',
        priority: 'medium',
        completed: false,
        relatedEntityId: 'fb_9',
        relatedEntityType: 'feedback',
        createdAt: '2025-04-08T15:00:00Z',
      },
    ],

    celebrations: [
      { id: 'celeb_1', type: 'birthday', userId: 'user_4', date: '2025-04-12', details: null },
      { id: 'celeb_2', type: 'birthday', userId: 'user_5', date: '2025-04-15', details: null },
      { id: 'celeb_3', type: 'anniversary', userId: 'user_6', date: '2025-04-20', details: '7 years' },
      { id: 'celeb_4', type: 'new_hire', userId: 'user_8', date: '2025-04-08', details: null },
      { id: 'celeb_5', type: 'new_hire', userId: 'user_19', date: '2025-04-05', details: null },
      { id: 'celeb_6', type: 'anniversary', userId: 'user_3', date: '2025-04-22', details: '3 years' },
      { id: 'celeb_7', type: 'birthday', userId: 'user_9', date: '2025-04-25', details: null },
      { id: 'celeb_8', type: 'new_hire', userId: 'user_14', date: '2025-04-01', details: null },
      { id: 'celeb_9', type: 'birthday', userId: 'user_22', date: '2025-04-18', details: null },
      { id: 'celeb_10', type: 'anniversary', userId: 'user_13', date: '2025-04-11', details: '6 years' },
      { id: 'celeb_11', type: 'new_hire', userId: 'user_18', date: '2025-04-03', details: null },
    ],

    company: {
      name: 'Evergreen Technologies, Inc',
      departments: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'People Operations', 'Finance', 'Executive'],
      values: ['Innovation', 'Teamwork', 'Customer Focus', 'Integrity', 'Growth Mindset'],
      headcount: 24,
    },

    careerVision: 'Build a world-class product marketing function at Evergreen Technologies',

    compensation: {
      baseSalary: 125000,
      bonusTarget: 15,
      equityShares: 5000,
      currency: 'USD',
      history: [
        { date: 'January 2025', type: 'Merit Increase', oldValue: '$118,000', newValue: '$125,000' },
        { date: 'March 2023', type: 'Promotion', oldValue: '$105,000', newValue: '$118,000' },
        { date: 'March 2021', type: 'Starting Salary', oldValue: '—', newValue: '$105,000' },
      ],
    },
  }
}
