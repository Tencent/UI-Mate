
export interface User {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  department: string;
  location: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  firstDayOfWeek?: 'sunday' | 'monday';
  notificationPrefs?: {
    taskAssigned: boolean;
    taskCompleted: boolean;
    commentsMentions: boolean;
    dailySummary: boolean;
  };
  loggedOut?: boolean;
}

export interface Team {
  teamId: string;
  name: string;
  description: string;
  memberIds: string[];
  ownerId: string;
  privacy: 'public' | 'private';
  createdDate: string;
}

export interface CustomField {
  fieldId: string;
  name: string;
  type: 'text' | 'number' | 'single-select' | 'multi-select' | 'date' | 'person' | 'checkbox';
  options?: string[];
  required: boolean;
}

export interface Project {
  projectId: string;
  name: string;
  teamId: string;
  description: string;
  color: string;
  icon: string;
  ownerId: string;
  memberIds: string[];
  sections: Section[];
  customFields: CustomField[];
  privacy: 'public' | 'private';
  startDate?: string;
  dueDate?: string;
  archived: boolean;
  starred: boolean;
  createdDate: string;
  modifiedDate: string;
}

export interface Section {
  sectionId: string;
  name: string;
  collapsed: boolean;
}

export interface Task {
  taskId: string;
  name: string;
  projectId: string;
  sectionId: string;
  description: string;
  assigneeId?: string;
  creatorId: string;
  dueDate?: string;
  startDate?: string;
  completed: boolean;
  completedDate?: string;
  parentTaskId?: string;
  dependencies: string[];
  tags: string[];
  attachmentIds: string[];
  customFieldValues: Record<string, any>;
  likeCount: number;
  createdDate: string;
  modifiedDate: string;
}

export interface Comment {
  commentId: string;
  taskId: string;
  userId: string;
  content: string;
  createdDate: string;
  likedBy: string[];
}

export interface Portfolio {
  portfolioId: string;
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  projectIds: string[];
  color: string;
}

export interface Goal {
  goalId: string;
  name: string;
  description: string;
  ownerId: string;
  timePeriod: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'off-track';
  parentGoalId?: string;
  supportingProjectIds: string[];
  metrics: string[];
}

export interface Notification {
  notificationId: string;
  userId: string;
  type: 'task-assigned' | 'task-completed' | 'task-due-soon' | 'comment' | 'mention' | 'project-invite' | 'status-update';
  actorId: string;
  targetId: string;
  targetType: 'task' | 'project' | 'comment';
  read: boolean;
  archived: boolean;
  createdDate: string;
}

export interface Attachment {
  attachmentId: string;
  taskId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploaderId: string;
  uploadDate: string;
}

export interface AppState {
  currentUser: User;
  users: User[];
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  portfolios: Portfolio[];
  goals: Goal[];
  notifications: Notification[];
  attachments: Attachment[];
}
  