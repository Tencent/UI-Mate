export type Priority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
export type IssueType = 'Story' | 'Task' | 'Bug' | 'Epic' | 'Access Request';
export type IssueStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done';
export type NotificationType = 'comment' | 'status_change' | 'assignment' | 'mention';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Issue {
  id: string;
  key: string;
  projectId: string;
  summary: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: Priority;
  storyPoints: number;
  reporterId: string;
  assigneeId: string | null;
  sprintId: string | null;
  epicId: string | null;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  subtasks: Subtask[];
  linkedIssueIds: string[];
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  state: 'active' | 'future' | 'closed';
}

export interface Project {
  id: string;
  key: string;
  name: string;
  leadId: string;
  category: string;
  icon: string;
  description?: string;
}

export interface WorkflowTransition {
  from: IssueStatus;
  to: IssueStatus[];
}

export interface Workflow {
  id: string;
  name: string;
  transitions: WorkflowTransition[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  issueId: string;
  actorId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AppState {
  users: User[];
  projects: Project[];
  issues: Issue[];
  sprints: Sprint[];
  comments: Comment[];
  workflows: Workflow[];
  notifications: Notification[];
  currentUser: User;
}
