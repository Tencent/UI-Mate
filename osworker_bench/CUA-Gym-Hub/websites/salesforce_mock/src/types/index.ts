
export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  role: string;
  avatar: string;
  timezone: string;
  locale: string;
  theme: string;
  settings?: {
    language: string;
    timezone: string;
    emailNotifications: boolean;
    taskReminders: boolean;
  };
}

export interface Lead {
  leadId: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  mobile: string;
  status: 'New' | 'Working' | 'Qualified' | 'Unqualified';
  source: string;
  rating: 'Hot' | 'Warm' | 'Cold';
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  industry: string;
  employees: number;
  revenue: number;
  website: string;
  description: string;
  ownerId: string;
  createdDate: string;
  modifiedDate: string;
}

export interface Account {
  accountId: string;
  name: string;
  parentAccountId?: string;
  phone: string;
  website: string;
  type: string;
  industry: string;
  revenue: number;
  employees: number;
  description: string;
  ownerId: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  createdDate: string;
  modifiedDate: string;
}

export interface Contact {
  contactId: string;
  accountId: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  mobile: string;
  reportsToId?: string;
  mailingStreet: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  mailingCountry: string;
  ownerId: string;
  createdDate: string;
  modifiedDate: string;
}

export interface Opportunity {
  opportunityId: string;
  name: string;
  accountId: string;
  contactId?: string;
  amount: number;
  closeDate: string;
  stage: 'Prospecting' | 'Qualification' | 'Needs Analysis' | 'Value Proposition' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  probability: number;
  type: string;
  leadSource: string;
  nextStep: string;
  description: string;
  ownerId: string;
  createdDate: string;
  modifiedDate: string;
}

export interface Case {
  caseId: string;
  caseNumber: string;
  subject: string;
  status: 'New' | 'Working' | 'Escalated' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  origin: string;
  type?: string;
  accountId: string;
  contactId: string;
  description: string;
  internalComments?: string;
  ownerId: string;
  createdDate: string;
  modifiedDate: string;
  closedDate?: string;
}

export interface Activity {
  activityId: string;
  type: 'task' | 'event';
  subject: string;
  status: string;
  priority: string;
  dueDate?: string;
  startDateTime?: string;
  endDateTime?: string;
  relatedToType: string;
  relatedToId: string;
  assignedToId: string;
  description: string;
  createdDate: string;
}

export interface ChatterPost {
  postId: string;
  userId: string;
  authorId?: string;
  content: string;
  body?: string;
  relatedToType?: string;
  relatedToId?: string;
  createdDate: string;
  likeCount: number;
  commentCount: number;
  comments: ChatterComment[];
  likes: string[];
}

export interface ChatterComment {
  commentId: string;
  userId: string;
  content: string;
  createdDate: string;
  likeCount: number;
  likes: string[];
}

export interface FileItem {
  fileId: string;
  name: string;
  type: string;
  size: number;
  url: string;
  ownerId: string;
  uploadDate: string;
}

export interface RecentItem {
  type: string;
  id: string;
  name: string;
  path: string;
  timestamp: string;
}

export interface Dashboard {
  dashboardId: string;
  name: string;
  description?: string;
  createdDate: string;
  createdBy: string;
  chartType: 'bar' | 'line' | 'pie' | 'table';
}

export interface EmailDraft {
  draftId: string;
  to: string;
  subject: string;
  body: string;
  relatedToType: string;
  relatedToId: string;
  status: 'draft';
  createdDate: string;
}

export interface ReportSnapshot {
  snapshotId: string;
  name: string;
  createdDate: string;
  metrics: Record<string, number>;
}

export interface Partner {
  partnerId: string;
  name: string;
  stage: 'Prospect' | 'Qualified' | 'Contract Sent' | 'Active' | 'Inactive';
  nextAction: string;
  nextActionDate: string;
  notes: string;
  coMarketingStatus: 'Not Started' | 'Interested' | 'In Discussion' | 'Committed' | 'Complete';
  primaryContact: string;
  contactEmail: string;
  dealRegistration: 'Enabled' | 'Disabled' | 'Pending';
  ownerId: string;
  createdDate: string;
  modifiedDate: string;
}

export interface PicklistValue {
  label: string;
  value: string;
}

export interface CustomField {
  label: string;
  apiName: string;
  type: string;
  description?: string;
  values?: PicklistValue[];
}

export interface CustomObject {
  label: string;
  apiName: string;
  fields: Record<string, CustomField>;
}

export type CustomObjects = Record<string, CustomObject>;

export interface AppState {
  user: User;
  users: User[];
  leads: Lead[];
  accounts: Account[];
  contacts: Contact[];
  opportunities: Opportunity[];
  cases: Case[];
  activities: Activity[];
  chatterPosts: ChatterPost[];
  files: FileItem[];
  dashboards: Dashboard[];
  emailDrafts: EmailDraft[];
  reportSnapshots: ReportSnapshot[];
  partners: Partner[];
  following: string[];
  recentlyViewed: RecentItem[];
  dismissedNotifications: string[];
  customObjects?: CustomObjects;
}
