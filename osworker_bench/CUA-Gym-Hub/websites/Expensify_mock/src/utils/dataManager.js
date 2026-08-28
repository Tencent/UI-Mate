const BASE_KEY = 'expensify_mock_state';
const BASE_INITIAL_KEY = 'expensify_mock_initial_state';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) sessionStorage.setItem('expensify_sid', sid);
  return sid || sessionStorage.getItem('expensify_sid') || null;
};

export const storageKey = (sid) => sid ? BASE_KEY + '_' + sid : BASE_KEY;
export const initialKey = (sid) => sid ? BASE_INITIAL_KEY + '_' + sid : BASE_INITIAL_KEY;

export const fetchCustomState = async (sid) => {
  if (!sid) return null;
  try {
    const res = await fetch('/state?sid=' + encodeURIComponent(sid));
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) { return null; }
};

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  if (!target || typeof target !== 'object') return source;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] === null || source[key] === undefined) continue;
    if (Array.isArray(source[key])) {
      result[key] = source[key];
    } else if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sKey = storageKey(sid);
  const iKey = initialKey(sid);
  if (customState) {
    const merged = { ...createInitialData(), ...customState };
    localStorage.setItem(sKey, JSON.stringify(merged));
    localStorage.setItem(iKey, JSON.stringify(merged));
    return merged;
  }
  const existing = localStorage.getItem(sKey);
  if (existing) {
    try { return JSON.parse(existing); } catch (e) { /* ignore */ }
  }
  const defaults = createInitialData();
  localStorage.setItem(sKey, JSON.stringify(defaults));
  localStorage.setItem(iKey, JSON.stringify(defaults));
  return defaults;
};

let _syncTimer = null;

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

export function createInitialData() {
  return {
    currentUser: {
      id: "usr_001", email: "sarah.chen@acmecorp.com", firstName: "Sarah", lastName: "Chen",
      displayName: "Sarah Chen", avatar: null, role: "admin", managerId: null, employeeId: "EMP-2847",
      department: "Engineering", defaultPolicy: "pol_001", reimbursementMethod: "ach", createdAt: "2023-01-15T09:00:00Z"
    },
    users: [
      { id: "usr_001", email: "sarah.chen@acmecorp.com", firstName: "Sarah", lastName: "Chen", displayName: "Sarah Chen", avatar: null, role: "admin", managerId: null, employeeId: "EMP-2847", department: "Engineering", defaultPolicy: "pol_001", reimbursementMethod: "ach", createdAt: "2023-01-15T09:00:00Z" },
      { id: "usr_002", email: "james.wilson@acmecorp.com", firstName: "James", lastName: "Wilson", displayName: "James Wilson", avatar: null, role: "employee", managerId: "usr_001", employeeId: "EMP-3912", department: "Sales", defaultPolicy: "pol_001", reimbursementMethod: "ach", createdAt: "2023-02-01T09:00:00Z" },
      { id: "usr_003", email: "emily.rodriguez@acmecorp.com", firstName: "Emily", lastName: "Rodriguez", displayName: "Emily Rodriguez", avatar: null, role: "employee", managerId: "usr_001", employeeId: "EMP-4201", department: "Marketing", defaultPolicy: "pol_001", reimbursementMethod: "ach", createdAt: "2023-03-10T09:00:00Z" },
      { id: "usr_004", email: "michael.park@acmecorp.com", firstName: "Michael", lastName: "Park", displayName: "Michael Park", avatar: null, role: "employee", managerId: "usr_001", employeeId: "EMP-5087", department: "Engineering", defaultPolicy: "pol_001", reimbursementMethod: "ach", createdAt: "2023-04-15T09:00:00Z" },
      { id: "usr_005", email: "lisa.thompson@acmecorp.com", firstName: "Lisa", lastName: "Thompson", displayName: "Lisa Thompson", avatar: null, role: "employee", managerId: "usr_001", employeeId: "EMP-6234", department: "Finance", defaultPolicy: "pol_001", reimbursementMethod: "check", createdAt: "2023-05-20T09:00:00Z" },
      { id: "usr_006", email: "david.kim@acmecorp.com", firstName: "David", lastName: "Kim", displayName: "David Kim", avatar: null, role: "employee", managerId: "usr_002", employeeId: "EMP-7891", department: "Sales", defaultPolicy: "pol_001", reimbursementMethod: "ach", createdAt: "2023-06-01T09:00:00Z" }
    ],
    policies: [
      { id: "pol_001", name: "Acme Corp Expenses", type: "corporate", outputCurrency: "USD", owner: "usr_001", autoReporting: true, autoReportingFrequency: "weekly", autoReportingOffset: 1, requiresCategory: true, requiresTag: false, requiresComment: false, maxExpenseAge: 90, maxExpenseAmount: 5000, preventSelfApproval: true, approvalMode: "basic", reimbursementChoice: "reimburseManual", createdAt: "2023-01-10T09:00:00Z" },
      { id: "pol_002", name: "Sarah's Personal Expenses", type: "personal", outputCurrency: "USD", owner: "usr_001", autoReporting: false, autoReportingFrequency: "manual", autoReportingOffset: 0, requiresCategory: false, requiresTag: false, requiresComment: false, maxExpenseAge: 365, maxExpenseAmount: 10000, preventSelfApproval: false, approvalMode: "basic", reimbursementChoice: "noReimbursement", createdAt: "2023-01-10T09:00:00Z" }
    ],
    categories: [
      { id: "cat_001", policyId: "pol_001", name: "Travel: Airfare", enabled: true, glCode: "6010", payrollCode: "", maxExpenseAmount: 3000, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_002", policyId: "pol_001", name: "Travel: Hotel", enabled: true, glCode: "6020", payrollCode: "", maxExpenseAmount: 0, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_003", policyId: "pol_001", name: "Travel: Car Rental", enabled: true, glCode: "6030", payrollCode: "", maxExpenseAmount: 0, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_004", policyId: "pol_001", name: "Travel: Ground Transport", enabled: true, glCode: "6040", payrollCode: "", maxExpenseAmount: 0, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_005", policyId: "pol_001", name: "Meals & Entertainment", enabled: true, glCode: "6100", payrollCode: "", maxExpenseAmount: 200, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_006", policyId: "pol_001", name: "Office Supplies", enabled: true, glCode: "6200", payrollCode: "", maxExpenseAmount: 0, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_007", policyId: "pol_001", name: "Software & Subscriptions", enabled: true, glCode: "6300", payrollCode: "", maxExpenseAmount: 0, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_008", policyId: "pol_001", name: "Professional Services", enabled: true, glCode: "6400", payrollCode: "", maxExpenseAmount: 0, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_009", policyId: "pol_001", name: "Communication", enabled: true, glCode: "6500", payrollCode: "", maxExpenseAmount: 0, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_010", policyId: "pol_001", name: "Mileage", enabled: true, glCode: "6600", payrollCode: "", maxExpenseAmount: 0, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_011", policyId: "pol_001", name: "Equipment", enabled: true, glCode: "6700", payrollCode: "", maxExpenseAmount: 0, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_012", policyId: "pol_001", name: "Training & Education", enabled: true, glCode: "6800", payrollCode: "", maxExpenseAmount: 0, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_013", policyId: "pol_001", name: "Utilities", enabled: true, glCode: "6900", payrollCode: "", maxExpenseAmount: 0, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_014", policyId: "pol_001", name: "Dues & Subscriptions", enabled: true, glCode: "7000", payrollCode: "", maxExpenseAmount: 0, requiresComment: false, commentHint: "", externalId: "" },
      { id: "cat_015", policyId: "pol_001", name: "Miscellaneous", enabled: true, glCode: "9999", payrollCode: "", maxExpenseAmount: 0, requiresComment: false, commentHint: "", externalId: "" }
    ],
    tags: [
      { id: "tag_001", policyId: "pol_001", name: "Project Alpha", enabled: true, glCode: "PA-001", required: false },
      { id: "tag_002", policyId: "pol_001", name: "Project Beta", enabled: true, glCode: "PB-002", required: false },
      { id: "tag_003", policyId: "pol_001", name: "Client: Globex", enabled: true, glCode: "CG-003", required: false },
      { id: "tag_004", policyId: "pol_001", name: "Client: Initech", enabled: true, glCode: "CI-004", required: false },
      { id: "tag_005", policyId: "pol_001", name: "Internal", enabled: true, glCode: "INT-005", required: false },
      { id: "tag_006", policyId: "pol_001", name: "Conference", enabled: true, glCode: "CONF-006", required: false }
    ],
    expenses: [
      { id: "exp_001", type: "expense", policyId: "pol_001", reportId: "rpt_001", createdBy: "usr_002", merchant: "United Airlines", amount: 45600, currency: "USD", date: "2024-11-15", categoryId: "cat_001", category: "Travel: Airfare", tagId: "tag_001", tag: "Project Alpha", description: "Flight SFO to NYC for client meeting", comment: "", receiptUrl: null, hasReceipt: true, billable: true, reimbursable: true, taxAmount: 0, taxRate: "", distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null, status: "open", violations: [], createdAt: "2024-11-15T14:30:00Z", modifiedAt: "2024-11-15T14:30:00Z" },
      { id: "exp_002", type: "expense", policyId: "pol_001", reportId: "rpt_001", createdBy: "usr_002", merchant: "Hilton Hotels", amount: 28950, currency: "USD", date: "2024-11-15", categoryId: "cat_002", category: "Travel: Hotel", tagId: "tag_001", tag: "Project Alpha", description: "2 nights at Hilton Midtown", comment: "", receiptUrl: null, hasReceipt: true, billable: true, reimbursable: true, taxAmount: 0, taxRate: "", distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null, status: "open", violations: [], createdAt: "2024-11-15T18:00:00Z", modifiedAt: "2024-11-15T18:00:00Z" },
      { id: "exp_003", type: "expense", policyId: "pol_001", reportId: "rpt_001", createdBy: "usr_002", merchant: "Yellow Cab", amount: 4200, currency: "USD", date: "2024-11-16", categoryId: "cat_004", category: "Travel: Ground Transport", tagId: "tag_001", tag: "Project Alpha", description: "Cab from hotel to client office", comment: "", receiptUrl: null, hasReceipt: false, billable: true, reimbursable: true, taxAmount: 0, taxRate: "", distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null, status: "open", violations: [], createdAt: "2024-11-16T09:00:00Z", modifiedAt: "2024-11-16T09:00:00Z" },
      { id: "exp_004", type: "expense", policyId: "pol_001", reportId: "rpt_001", createdBy: "usr_002", merchant: "Olive Garden", amount: 6785, currency: "USD", date: "2024-11-16", categoryId: "cat_005", category: "Meals & Entertainment", tagId: "tag_001", tag: "Project Alpha", description: "Team dinner with client", comment: "", receiptUrl: null, hasReceipt: true, billable: true, reimbursable: true, taxAmount: 560, taxRate: "Sales Tax", distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null, status: "open", violations: [], createdAt: "2024-11-16T20:00:00Z", modifiedAt: "2024-11-16T20:00:00Z" },
      { id: "exp_005", type: "expense", policyId: "pol_001", reportId: "rpt_002", createdBy: "usr_003", merchant: "Uber", amount: 2850, currency: "USD", date: "2024-11-10", categoryId: "cat_004", category: "Travel: Ground Transport", tagId: "tag_006", tag: "Conference", description: "Ride to conference center", comment: "", receiptUrl: null, hasReceipt: false, billable: false, reimbursable: true, taxAmount: 0, taxRate: "", distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null, status: "approved", violations: [], createdAt: "2024-11-10T08:00:00Z", modifiedAt: "2024-11-12T10:00:00Z" },
      { id: "exp_006", type: "expense", policyId: "pol_001", reportId: "rpt_002", createdBy: "usr_003", merchant: "Marriott Downtown", amount: 19500, currency: "USD", date: "2024-11-10", categoryId: "cat_002", category: "Travel: Hotel", tagId: "tag_006", tag: "Conference", description: "Hotel for marketing conference", comment: "", receiptUrl: null, hasReceipt: true, billable: false, reimbursable: true, taxAmount: 1609, taxRate: "Sales Tax", distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null, status: "approved", violations: [], createdAt: "2024-11-10T16:00:00Z", modifiedAt: "2024-11-12T10:00:00Z" },
      { id: "exp_007", type: "expense", policyId: "pol_001", reportId: "rpt_002", createdBy: "usr_003", merchant: "Delta Airlines", amount: 52300, currency: "USD", date: "2024-11-09", categoryId: "cat_001", category: "Travel: Airfare", tagId: "tag_006", tag: "Conference", description: "Round trip SFO-ORD for MarketWorld 2024", comment: "", receiptUrl: null, hasReceipt: true, billable: false, reimbursable: true, taxAmount: 0, taxRate: "", distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null, status: "approved", violations: [], createdAt: "2024-11-09T06:00:00Z", modifiedAt: "2024-11-12T10:00:00Z" },
      { id: "exp_008", type: "expense", policyId: "pol_001", reportId: "rpt_003", createdBy: "usr_004", merchant: "Staples", amount: 12430, currency: "USD", date: "2024-10-28", categoryId: "cat_006", category: "Office Supplies", tagId: "tag_005", tag: "Internal", description: "Printer paper, toner, desk organizer", comment: "", receiptUrl: null, hasReceipt: true, billable: false, reimbursable: true, taxAmount: 1025, taxRate: "Sales Tax", distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null, status: "reimbursed", violations: [], createdAt: "2024-10-28T11:00:00Z", modifiedAt: "2024-11-05T09:00:00Z" },
      { id: "exp_009", type: "expense", policyId: "pol_001", reportId: "rpt_003", createdBy: "usr_004", merchant: "Adobe Creative Cloud", amount: 5499, currency: "USD", date: "2024-10-25", categoryId: "cat_007", category: "Software & Subscriptions", tagId: "tag_005", tag: "Internal", description: "Monthly Creative Cloud subscription", comment: "", receiptUrl: null, hasReceipt: false, billable: false, reimbursable: true, taxAmount: 0, taxRate: "", distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null, status: "reimbursed", violations: [], createdAt: "2024-10-25T09:00:00Z", modifiedAt: "2024-11-05T09:00:00Z" },
      { id: "exp_010", type: "distance", policyId: "pol_001", reportId: "rpt_004", createdBy: "usr_006", merchant: "14.6 mi mileage", amount: 978, currency: "USD", date: "2024-10-15", categoryId: "cat_010", category: "Mileage", tagId: "tag_003", tag: "Client: Globex", description: "Client site visit - round trip", comment: "", receiptUrl: null, hasReceipt: false, billable: true, reimbursable: true, taxAmount: 0, taxRate: "", distance: 14.6, distanceUnit: "mi", distanceRate: 67, hours: null, hourlyRate: null, status: "closed", violations: [], createdAt: "2024-10-15T17:00:00Z", modifiedAt: "2024-10-20T09:00:00Z" },
      { id: "exp_011", type: "expense", policyId: "pol_001", reportId: "rpt_005", createdBy: "usr_004", merchant: "AWS Monthly", amount: 34218, currency: "USD", date: "2024-12-01", categoryId: "cat_007", category: "Software & Subscriptions", tagId: "tag_002", tag: "Project Beta", description: "AWS infrastructure costs - December", comment: "", receiptUrl: null, hasReceipt: false, billable: true, reimbursable: true, taxAmount: 0, taxRate: "", distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null, status: "open", violations: [], createdAt: "2024-12-01T09:00:00Z", modifiedAt: "2024-12-01T09:00:00Z" },
      { id: "exp_012", type: "expense", policyId: "pol_001", reportId: null, createdBy: "usr_002", merchant: "Starbucks", amount: 1245, currency: "USD", date: "2024-12-05", categoryId: "cat_005", category: "Meals & Entertainment", tagId: null, tag: "", description: "Coffee meeting with prospect", comment: "", receiptUrl: null, hasReceipt: true, billable: false, reimbursable: true, taxAmount: 103, taxRate: "Sales Tax", distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null, status: "unreported", violations: [], createdAt: "2024-12-05T10:00:00Z", modifiedAt: "2024-12-05T10:00:00Z" },
      { id: "exp_013", type: "expense", policyId: "pol_001", reportId: null, createdBy: "usr_003", merchant: "Office Depot", amount: 8999, currency: "USD", date: "2024-12-03", categoryId: "cat_006", category: "Office Supplies", tagId: "tag_005", tag: "Internal", description: "Standing desk converter", comment: "", receiptUrl: null, hasReceipt: true, billable: false, reimbursable: true, taxAmount: 742, taxRate: "Sales Tax", distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null, status: "unreported", violations: [], createdAt: "2024-12-03T14:00:00Z", modifiedAt: "2024-12-03T14:00:00Z" },
      { id: "exp_014", type: "expense", policyId: "pol_001", reportId: null, createdBy: "usr_005", merchant: "Lyft", amount: 1975, currency: "USD", date: "2024-12-04", categoryId: "cat_004", category: "Travel: Ground Transport", tagId: null, tag: "", description: "Ride to quarterly planning offsite", comment: "", receiptUrl: null, hasReceipt: false, billable: false, reimbursable: true, taxAmount: 0, taxRate: "", distance: null, distanceUnit: null, distanceRate: null, hours: null, hourlyRate: null, status: "unreported", violations: [], createdAt: "2024-12-04T08:30:00Z", modifiedAt: "2024-12-04T08:30:00Z" },
      { id: "exp_015", type: "time", policyId: "pol_001", reportId: "rpt_005", createdBy: "usr_004", merchant: "8 hours consulting", amount: 96000, currency: "USD", date: "2024-12-02", categoryId: "cat_008", category: "Professional Services", tagId: "tag_002", tag: "Project Beta", description: "Security audit consulting", comment: "", receiptUrl: null, hasReceipt: false, billable: true, reimbursable: true, taxAmount: 0, taxRate: "", distance: null, distanceUnit: null, distanceRate: null, hours: 8, hourlyRate: 12000, status: "open", violations: [], createdAt: "2024-12-02T17:00:00Z", modifiedAt: "2024-12-02T17:00:00Z" }
    ],
    reports: [
      { id: "rpt_001", title: "NYC Client Visit - November 2024", reportNumber: 77324820, policyId: "pol_001", policyName: "Acme Corp Expenses", createdBy: "usr_002", createdByName: "James Wilson", createdByEmail: "james.wilson@acmecorp.com", status: "open", total: 85535, currency: "USD", submittedTo: "usr_001", submittedToEmail: "sarah.chen@acmecorp.com", submittedDate: null, approvedDate: null, reimbursedDate: null, startDate: "2024-11-15", endDate: "2024-11-16", expenseCount: 4, starred: true, exported: false, exportedDate: null, isRetracted: false, createdAt: "2024-11-16T10:00:00Z", modifiedAt: "2024-11-16T10:00:00Z" },
      { id: "rpt_002", title: "Marketing Conference - Chicago", reportNumber: 77321220, policyId: "pol_001", policyName: "Acme Corp Expenses", createdBy: "usr_003", createdByName: "Emily Rodriguez", createdByEmail: "emily.rodriguez@acmecorp.com", status: "approved", total: 74650, currency: "USD", submittedTo: "usr_001", submittedToEmail: "sarah.chen@acmecorp.com", submittedDate: "2024-11-12T10:00:00Z", approvedDate: "2024-11-13T09:00:00Z", reimbursedDate: null, startDate: "2024-11-09", endDate: "2024-11-10", expenseCount: 3, starred: true, exported: false, exportedDate: null, isRetracted: false, createdAt: "2024-11-11T08:00:00Z", modifiedAt: "2024-11-13T09:00:00Z" },
      { id: "rpt_003", title: "Office Supplies Q4", reportNumber: 77324769, policyId: "pol_001", policyName: "Acme Corp Expenses", createdBy: "usr_004", createdByName: "Michael Park", createdByEmail: "michael.park@acmecorp.com", status: "reimbursed", total: 17929, currency: "USD", submittedTo: "usr_001", submittedToEmail: "sarah.chen@acmecorp.com", submittedDate: "2024-10-30T09:00:00Z", approvedDate: "2024-10-31T11:00:00Z", reimbursedDate: "2024-11-05T09:00:00Z", startDate: "2024-10-25", endDate: "2024-10-28", expenseCount: 2, starred: false, exported: true, exportedDate: "2024-11-05T10:00:00Z", isRetracted: false, createdAt: "2024-10-29T09:00:00Z", modifiedAt: "2024-11-05T09:00:00Z" },
      { id: "rpt_004", title: "Mileage Expenses - October", reportNumber: 77265596, policyId: "pol_001", policyName: "Acme Corp Expenses", createdBy: "usr_006", createdByName: "David Kim", createdByEmail: "david.kim@acmecorp.com", status: "closed", total: 978, currency: "USD", submittedTo: "usr_001", submittedToEmail: "sarah.chen@acmecorp.com", submittedDate: "2024-10-16T09:00:00Z", approvedDate: "2024-10-17T09:00:00Z", reimbursedDate: "2024-10-20T09:00:00Z", startDate: "2024-10-15", endDate: "2024-10-15", expenseCount: 1, starred: false, exported: true, exportedDate: "2024-10-20T10:00:00Z", isRetracted: false, createdAt: "2024-10-15T17:30:00Z", modifiedAt: "2024-10-20T09:00:00Z" },
      { id: "rpt_005", title: "Engineering Tools - December", reportNumber: 77265599, policyId: "pol_001", policyName: "Acme Corp Expenses", createdBy: "usr_004", createdByName: "Michael Park", createdByEmail: "michael.park@acmecorp.com", status: "open", total: 130218, currency: "USD", submittedTo: "usr_001", submittedToEmail: "sarah.chen@acmecorp.com", submittedDate: null, approvedDate: null, reimbursedDate: null, startDate: "2024-12-01", endDate: "2024-12-02", expenseCount: 2, starred: false, exported: false, exportedDate: null, isRetracted: false, createdAt: "2024-12-02T18:00:00Z", modifiedAt: "2024-12-02T18:00:00Z" }
    ],
    comments: [
      { id: "cmt_001", reportId: "rpt_001", authorId: "usr_002", authorName: "James Wilson", authorEmail: "james.wilson@acmecorp.com", type: "system", text: "You created this report", timestamp: "2024-11-16T10:00:00Z" },
      { id: "cmt_002", reportId: "rpt_001", authorId: "usr_002", authorName: "James Wilson", authorEmail: "james.wilson@acmecorp.com", type: "comment", text: "Please review before month-end", timestamp: "2024-11-16T10:05:00Z" },
      { id: "cmt_003", reportId: "rpt_002", authorId: "usr_003", authorName: "Emily Rodriguez", authorEmail: "emily.rodriguez@acmecorp.com", type: "system", text: "You created this report", timestamp: "2024-11-11T08:00:00Z" },
      { id: "cmt_004", reportId: "rpt_002", authorId: "usr_003", authorName: "Emily Rodriguez", authorEmail: "emily.rodriguez@acmecorp.com", type: "status_change", text: "Report submitted", timestamp: "2024-11-12T10:00:00Z" },
      { id: "cmt_005", reportId: "rpt_002", authorId: "usr_001", authorName: "Sarah Chen", authorEmail: "sarah.chen@acmecorp.com", type: "status_change", text: "Report approved", timestamp: "2024-11-13T09:00:00Z" },
      { id: "cmt_006", reportId: "rpt_003", authorId: "usr_004", authorName: "Michael Park", authorEmail: "michael.park@acmecorp.com", type: "system", text: "You created this report", timestamp: "2024-10-29T09:00:00Z" },
      { id: "cmt_007", reportId: "rpt_003", authorId: "usr_001", authorName: "Sarah Chen", authorEmail: "sarah.chen@acmecorp.com", type: "status_change", text: "Report approved", timestamp: "2024-10-31T11:00:00Z" },
      { id: "cmt_008", reportId: "rpt_003", authorId: "system", authorName: "System", authorEmail: "", type: "system", text: "Reimbursement processed via ACH", timestamp: "2024-11-05T09:00:00Z" }
    ],
    inboxItems: [
      { id: "inb_001", type: "report_submitted", title: "Expense Report Submitted", description: "James Wilson submitted 'NYC Client Visit - November 2024' ($855.35) for your approval", relatedId: "rpt_001", fromUserId: "usr_002", fromUserName: "James Wilson", read: false, hidden: false, actionRequired: true, actionType: "approve_report", createdAt: "2024-11-16T10:05:00Z" },
      { id: "inb_002", type: "report_submitted", title: "Engineering Tools Report Submitted", description: "Michael Park submitted 'Engineering Tools - December' ($1,302.18) for your approval", relatedId: "rpt_005", fromUserId: "usr_004", fromUserName: "Michael Park", read: false, hidden: false, actionRequired: true, actionType: "approve_report", createdAt: "2024-12-02T18:30:00Z" },
      { id: "inb_003", type: "expense_violation", title: "Policy Violation Flagged", description: "Expense 'Olive Garden' ($67.85) by James Wilson exceeds the per-meal limit for Meals & Entertainment", relatedId: "exp_004", fromUserId: "usr_002", fromUserName: "James Wilson", read: false, hidden: false, actionRequired: true, actionType: "review_violation", createdAt: "2024-11-16T20:05:00Z" },
      { id: "inb_004", type: "report_approved", title: "Your Report Was Approved", description: "Sarah Chen approved 'Marketing Conference - Chicago' ($746.50)", relatedId: "rpt_002", fromUserId: "usr_001", fromUserName: "Sarah Chen", read: true, hidden: false, actionRequired: false, actionType: null, createdAt: "2024-11-13T09:05:00Z" },
      { id: "inb_005", type: "concierge", title: "Welcome to Xpensify!", description: "Hi Sarah! Welcome to Xpensify. I'm Concierge, your personal assistant. Let me help you get set up.", relatedId: null, fromUserId: "concierge", fromUserName: "Concierge", read: true, hidden: false, actionRequired: false, actionType: null, createdAt: "2023-01-15T09:01:00Z" },
      { id: "inb_006", type: "task", title: "Set Up Direct Reimbursement", description: "Connect your bank account to enable direct ACH reimbursements for approved expense reports.", relatedId: null, fromUserId: "concierge", fromUserName: "Concierge", read: false, hidden: false, actionRequired: false, actionType: "setup_task", createdAt: "2023-01-15T09:02:00Z" }
    ],
    members: [
      { id: "mem_001", userId: "usr_001", policyId: "pol_001", email: "sarah.chen@acmecorp.com", name: "Sarah Chen", role: "admin", managerId: null, managerEmail: null, employeeId: "EMP-2847", submitsTo: null, approvesTo: null, isApprover: true, addedAt: "2023-01-15T09:00:00Z" },
      { id: "mem_002", userId: "usr_002", policyId: "pol_001", email: "james.wilson@acmecorp.com", name: "James Wilson", role: "member", managerId: "usr_001", managerEmail: "sarah.chen@acmecorp.com", employeeId: "EMP-3912", submitsTo: "usr_001", approvesTo: null, isApprover: false, addedAt: "2023-02-01T09:00:00Z" },
      { id: "mem_003", userId: "usr_003", policyId: "pol_001", email: "emily.rodriguez@acmecorp.com", name: "Emily Rodriguez", role: "member", managerId: "usr_001", managerEmail: "sarah.chen@acmecorp.com", employeeId: "EMP-4201", submitsTo: "usr_001", approvesTo: null, isApprover: false, addedAt: "2023-03-10T09:00:00Z" },
      { id: "mem_004", userId: "usr_004", policyId: "pol_001", email: "michael.park@acmecorp.com", name: "Michael Park", role: "member", managerId: "usr_001", managerEmail: "sarah.chen@acmecorp.com", employeeId: "EMP-5087", submitsTo: "usr_001", approvesTo: null, isApprover: false, addedAt: "2023-04-15T09:00:00Z" },
      { id: "mem_005", userId: "usr_005", policyId: "pol_001", email: "lisa.thompson@acmecorp.com", name: "Lisa Thompson", role: "member", managerId: "usr_001", managerEmail: "sarah.chen@acmecorp.com", employeeId: "EMP-6234", submitsTo: "usr_001", approvesTo: null, isApprover: false, addedAt: "2023-05-20T09:00:00Z" },
      { id: "mem_006", userId: "usr_006", policyId: "pol_001", email: "david.kim@acmecorp.com", name: "David Kim", role: "member", managerId: "usr_002", managerEmail: "james.wilson@acmecorp.com", employeeId: "EMP-7891", submitsTo: "usr_001", approvesTo: null, isApprover: false, addedAt: "2023-06-01T09:00:00Z" }
    ],
    reportFields: [
      { id: "rf_001", policyId: "pol_001", name: "Department", type: "dropdown", values: ["Engineering", "Sales", "Marketing", "Finance", "Operations"], required: true, defaultValue: "" },
      { id: "rf_002", policyId: "pol_001", name: "Project Code", type: "text", values: [], required: false, defaultValue: "" },
      { id: "rf_003", policyId: "pol_001", name: "Trip End Date", type: "date", values: [], required: false, defaultValue: "" }
    ],
    distanceRates: [
      { id: "dr_001", policyId: "pol_001", unit: "mi", rate: 67, currency: "USD", enabled: true }
    ],
    taxRates: [
      { id: "tax_001", policyId: "pol_001", name: "No Tax", rate: 0, isDefault: true, enabled: true },
      { id: "tax_002", policyId: "pol_001", name: "Sales Tax", rate: 8.25, isDefault: false, enabled: true },
      { id: "tax_003", policyId: "pol_001", name: "VAT", rate: 20, isDefault: false, enabled: true }
    ],
    ui: {
      activeView: "inbox",
      expenseViewMode: "list",
      expenseFiltersVisible: false,
      reportFiltersVisible: false,
      selectedExpenseIds: [],
      selectedReportIds: [],
      activeSettingsTab: "basics",
      modalOpen: null,
      modalData: null,
      expenseFilters: { merchant: "", dateFrom: "", dateTo: "", categories: [], tags: [], policies: [], statuses: [], billableFilter: "all" },
      reportFilters: { dateFrom: "", dateTo: "", policies: [], statuses: [] },
      expenseSortBy: "date",
      expenseSortDir: "desc",
      reportSortBy: "name",
      reportSortDir: "desc",
    },
    exportSettings: {
      format: "csv",
      template: "${date},${merchant},${amount},${category},${tag},${description}",
    }
  };
}
