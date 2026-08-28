
import { AppState } from '../types';

// --- Session-aware storage functions ---
const BASE_STORAGE_KEY = 'xsana-app-state';
const BASE_INITIAL_KEY = 'xsana-app-initialState';

function storageKey(sid: string | null): string {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid: string | null): string {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export const getSessionId = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) { sessionStorage.setItem('mock_sid', urlSid); return urlSid; }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid: string | null = null): Promise<Partial<AppState> | null> => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const resp = await fetch(url);
    if (resp.ok) { const d = await resp.json(); if (d.has_custom_state && d.stored_state) return d.stored_state; }
  } catch (e) { console.warn('No custom state available'); }
  return null;
};

export const saveState = (state: AppState, sid: string | null = null): void => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  try {
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state }),
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to sync state to server', e);
  }
};

export const getInitialState = (sid: string | null = null): AppState | null => {
  const s = localStorage.getItem(initialKey(sid));
  return s ? JSON.parse(s) : null;
};

export const initializeData = (sid: string | null = null, customState: Partial<AppState> | null = null): AppState => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);
  if (customState) {
    const data = deepMergeWithDefaults(generateInitialData(), customState) as AppState;
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }
  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }
  const data = generateInitialData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

// --- Data normalization functions for malformed POST data ---

const arrayNormalizers: Record<string, (item: any, index: number) => any> = {
  users: normalizeUser,
  teams: normalizeTeam,
  projects: normalizeProject,
  tasks: normalizeTask,
  comments: normalizeComment,
  portfolios: normalizePortfolio,
  goals: normalizeGoal,
  notifications: normalizeNotification,
  attachments: normalizeAttachment,
};

function normalizeUser(user: any, index: number): any {
  return {
    userId: user.userId || user.user_id || user.id || `user_custom_${index}`,
    name: user.name || user.displayName || user.display_name || user.username || '(Unknown User)',
    email: user.email || user.mail || `user_custom_${index}@example.com`,
    avatar: user.avatar || user.avatarUrl || user.avatar_url || user.profileImage || user.profile_image || `https://picsum.photos/100/100?random=custom_user${index}`,
    title: user.title || user.jobTitle || user.job_title || user.role || '',
    department: user.department || user.dept || '',
    location: user.location || '',
    timezone: user.timezone || user.tz || 'UTC',
    theme: (['light', 'dark', 'auto'].includes(user.theme) ? user.theme : 'light') as 'light' | 'dark' | 'auto',
  };
}

function normalizeTeam(team: any, index: number): any {
  return {
    teamId: team.teamId || team.team_id || team.id || `team_custom_${index}`,
    name: team.name || team.title || `(Untitled Team ${index + 1})`,
    description: team.description || team.desc || '',
    memberIds: Array.isArray(team.memberIds || team.member_ids || team.members) ? (team.memberIds || team.member_ids || team.members) : [],
    ownerId: team.ownerId || team.owner_id || team.owner || '',
    privacy: (['public', 'private'].includes(team.privacy) ? team.privacy : 'public') as 'public' | 'private',
    createdDate: team.createdDate || team.created_date || team.createdAt || team.created_at || new Date().toISOString(),
  };
}

function normalizeSection(section: any, index: number): any {
  return {
    sectionId: section.sectionId || section.section_id || section.id || `section_custom_${index}`,
    name: section.name || section.title || `Section ${index + 1}`,
    collapsed: section.collapsed ?? false,
  };
}

function normalizeCustomField(field: any, index: number): any {
  const validTypes = ['text', 'number', 'single-select', 'multi-select', 'date', 'person', 'checkbox'];
  return {
    fieldId: field.fieldId || field.field_id || field.id || `field_custom_${index}`,
    name: field.name || field.label || field.title || `Field ${index + 1}`,
    type: (validTypes.includes(field.type) ? field.type : 'text') as 'text' | 'number' | 'single-select' | 'multi-select' | 'date' | 'person' | 'checkbox',
    options: Array.isArray(field.options) ? field.options : undefined,
    required: field.required ?? false,
  };
}

function normalizeProject(project: any, index: number): any {
  const rawSections = Array.isArray(project.sections) ? project.sections : [];
  const rawCustomFields = Array.isArray(project.customFields || project.custom_fields) ? (project.customFields || project.custom_fields) : [];

  return {
    projectId: project.projectId || project.project_id || project.id || `project_custom_${index}`,
    name: project.name || project.title || `(Untitled Project ${index + 1})`,
    teamId: project.teamId || project.team_id || project.team || '',
    description: project.description || project.desc || '',
    color: project.color || '#808080',
    icon: project.icon || project.iconUrl || project.icon_url || `https://picsum.photos/64/64?random=custom_project${index}`,
    ownerId: project.ownerId || project.owner_id || project.owner || '',
    memberIds: Array.isArray(project.memberIds || project.member_ids || project.members) ? (project.memberIds || project.member_ids || project.members) : [],
    sections: rawSections.map((s: any, i: number) => normalizeSection(s, i)),
    customFields: rawCustomFields.map((f: any, i: number) => normalizeCustomField(f, i)),
    privacy: (['public', 'private'].includes(project.privacy) ? project.privacy : 'public') as 'public' | 'private',
    startDate: project.startDate || project.start_date || undefined,
    dueDate: project.dueDate || project.due_date || undefined,
    archived: project.archived ?? false,
    starred: project.starred ?? project.favorite ?? project.favourited ?? false,
    createdDate: project.createdDate || project.created_date || project.createdAt || project.created_at || new Date().toISOString(),
    modifiedDate: project.modifiedDate || project.modified_date || project.modifiedAt || project.modified_at || project.updatedAt || project.updated_at || new Date().toISOString(),
  };
}

function normalizeTask(task: any, index: number): any {
  return {
    taskId: task.taskId || task.task_id || task.id || `task_custom_${index}`,
    name: task.name || task.title || task.subject || '(Untitled Task)',
    projectId: task.projectId || task.project_id || task.project || '',
    sectionId: task.sectionId || task.section_id || task.section || '',
    description: task.description || task.desc || task.body || task.content || '',
    assigneeId: task.assigneeId || task.assignee_id || task.assignee || undefined,
    creatorId: task.creatorId || task.creator_id || task.creator || task.author || '',
    dueDate: task.dueDate || task.due_date || task.deadline || undefined,
    startDate: task.startDate || task.start_date || undefined,
    completed: task.completed ?? task.done ?? task.is_completed ?? false,
    completedDate: task.completedDate || task.completed_date || task.completedAt || task.completed_at || undefined,
    parentTaskId: task.parentTaskId || task.parent_task_id || task.parentId || task.parent_id || undefined,
    dependencies: Array.isArray(task.dependencies || task.deps) ? (task.dependencies || task.deps) : [],
    tags: Array.isArray(task.tags || task.labels) ? (task.tags || task.labels) : [],
    attachmentIds: Array.isArray(task.attachmentIds || task.attachment_ids || task.attachments) ? (task.attachmentIds || task.attachment_ids || task.attachments) : [],
    customFieldValues: (task.customFieldValues && typeof task.customFieldValues === 'object')
      ? task.customFieldValues
      : (task.custom_field_values && typeof task.custom_field_values === 'object')
        ? task.custom_field_values
        : {},
    likeCount: typeof task.likeCount === 'number' ? task.likeCount : (typeof task.like_count === 'number' ? task.like_count : (typeof task.likes === 'number' ? task.likes : 0)),
    createdDate: task.createdDate || task.created_date || task.createdAt || task.created_at || new Date().toISOString(),
    modifiedDate: task.modifiedDate || task.modified_date || task.modifiedAt || task.modified_at || task.updatedAt || task.updated_at || new Date().toISOString(),
  };
}

function normalizeComment(comment: any, index: number): any {
  return {
    commentId: comment.commentId || comment.comment_id || comment.id || `comment_custom_${index}`,
    taskId: comment.taskId || comment.task_id || comment.task || '',
    userId: comment.userId || comment.user_id || comment.author || comment.authorId || comment.author_id || '',
    content: comment.content || comment.text || comment.body || comment.message || '',
    createdDate: comment.createdDate || comment.created_date || comment.createdAt || comment.created_at || new Date().toISOString(),
    likedBy: Array.isArray(comment.likedBy || comment.liked_by || comment.likes) ? (comment.likedBy || comment.liked_by || comment.likes) : [],
  };
}

function normalizePortfolio(portfolio: any, index: number): any {
  return {
    portfolioId: portfolio.portfolioId || portfolio.portfolio_id || portfolio.id || `portfolio_custom_${index}`,
    name: portfolio.name || portfolio.title || `(Untitled Portfolio ${index + 1})`,
    description: portfolio.description || portfolio.desc || '',
    ownerId: portfolio.ownerId || portfolio.owner_id || portfolio.owner || '',
    memberIds: Array.isArray(portfolio.memberIds || portfolio.member_ids || portfolio.members) ? (portfolio.memberIds || portfolio.member_ids || portfolio.members) : [],
    projectIds: Array.isArray(portfolio.projectIds || portfolio.project_ids || portfolio.projects) ? (portfolio.projectIds || portfolio.project_ids || portfolio.projects) : [],
    color: portfolio.color || '#808080',
  };
}

function normalizeGoal(goal: any, index: number): any {
  const validStatuses = ['on-track', 'at-risk', 'off-track'];
  return {
    goalId: goal.goalId || goal.goal_id || goal.id || `goal_custom_${index}`,
    name: goal.name || goal.title || `(Untitled Goal ${index + 1})`,
    description: goal.description || goal.desc || '',
    ownerId: goal.ownerId || goal.owner_id || goal.owner || '',
    timePeriod: goal.timePeriod || goal.time_period || goal.period || '',
    progress: typeof goal.progress === 'number' ? Math.max(0, Math.min(100, goal.progress)) : 0,
    status: (validStatuses.includes(goal.status) ? goal.status : 'on-track') as 'on-track' | 'at-risk' | 'off-track',
    parentGoalId: goal.parentGoalId || goal.parent_goal_id || goal.parentId || goal.parent_id || undefined,
    supportingProjectIds: Array.isArray(goal.supportingProjectIds || goal.supporting_project_ids || goal.projectIds || goal.project_ids) ? (goal.supportingProjectIds || goal.supporting_project_ids || goal.projectIds || goal.project_ids) : [],
    metrics: Array.isArray(goal.metrics) ? goal.metrics : [],
  };
}

function normalizeNotification(notification: any, index: number): any {
  const validTypes = ['task-assigned', 'task-completed', 'task-due-soon', 'comment', 'mention', 'project-invite', 'status-update'];
  const validTargetTypes = ['task', 'project', 'comment'];
  return {
    notificationId: notification.notificationId || notification.notification_id || notification.id || `notif_custom_${index}`,
    userId: notification.userId || notification.user_id || notification.recipient || '',
    type: (validTypes.includes(notification.type) ? notification.type : 'comment') as 'task-assigned' | 'task-completed' | 'task-due-soon' | 'comment' | 'mention' | 'project-invite' | 'status-update',
    actorId: notification.actorId || notification.actor_id || notification.actor || notification.senderId || notification.sender_id || '',
    targetId: notification.targetId || notification.target_id || notification.target || '',
    targetType: (validTargetTypes.includes(notification.targetType || notification.target_type) ? (notification.targetType || notification.target_type) : 'task') as 'task' | 'project' | 'comment',
    read: notification.read ?? notification.is_read ?? false,
    archived: notification.archived ?? notification.is_archived ?? false,
    createdDate: notification.createdDate || notification.created_date || notification.createdAt || notification.created_at || new Date().toISOString(),
  };
}

function normalizeAttachment(attachment: any, index: number): any {
  return {
    attachmentId: attachment.attachmentId || attachment.attachment_id || attachment.id || `attachment_custom_${index}`,
    taskId: attachment.taskId || attachment.task_id || attachment.task || '',
    fileName: attachment.fileName || attachment.file_name || attachment.name || attachment.filename || 'unnamed_file',
    fileType: attachment.fileType || attachment.file_type || attachment.type || attachment.mimeType || attachment.mime_type || 'application/octet-stream',
    fileSize: typeof attachment.fileSize === 'number' ? attachment.fileSize : (typeof attachment.file_size === 'number' ? attachment.file_size : (typeof attachment.size === 'number' ? attachment.size : 0)),
    fileUrl: attachment.fileUrl || attachment.file_url || attachment.url || attachment.downloadUrl || attachment.download_url || '',
    uploaderId: attachment.uploaderId || attachment.uploader_id || attachment.uploader || attachment.userId || attachment.user_id || '',
    uploadDate: attachment.uploadDate || attachment.upload_date || attachment.uploadedAt || attachment.uploaded_at || attachment.createdDate || attachment.created_date || new Date().toISOString(),
  };
}

function deepMergeWithDefaults(defaults: any, custom: any): any {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key]) && arrayNormalizers[key]) {
        // Normalize each item in custom array data using the appropriate normalizer
        result[key] = custom[key].map((item: any, index: number) => arrayNormalizers[key](item, index));
      } else if (key === 'currentUser' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
        // Normalize the currentUser object
        result[key] = normalizeUser(custom[key], 0);
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

// --- Default data generation ---

export const generateInitialData = (): AppState => {
  const users = [
    {
      userId: 'user-0',
      name: 'Alex Johnson',
      email: 'alex.johnson@company.com',
      avatar: 'https://picsum.photos/100/100?random=user0',
      title: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      timezone: 'PST',
      theme: 'light' as const
    },
    {
      userId: 'user-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      avatar: 'https://picsum.photos/100/100?random=user1',
      title: 'Senior Designer',
      department: 'Design',
      location: 'New York, NY',
      timezone: 'EST',
      theme: 'light' as const
    },
    {
      userId: 'user-2',
      name: 'Mike Rodriguez',
      email: 'mike.rodriguez@company.com',
      avatar: 'https://picsum.photos/100/100?random=user2',
      title: 'Lead Engineer',
      department: 'Engineering',
      location: 'Austin, TX',
      timezone: 'CST',
      theme: 'dark' as const
    },
    {
      userId: 'user-3',
      name: 'Emily Watson',
      email: 'emily.watson@company.com',
      avatar: 'https://picsum.photos/100/100?random=user3',
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Seattle, WA',
      timezone: 'PST',
      theme: 'light' as const
    },
    {
      userId: 'user-4',
      name: 'David Kim',
      email: 'david.kim@company.com',
      avatar: 'https://picsum.photos/100/100?random=user4',
      title: 'Software Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      timezone: 'PST',
      theme: 'light' as const
    },
    {
      userId: 'user-5',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@company.com',
      avatar: 'https://picsum.photos/100/100?random=user5',
      title: 'UX Designer',
      department: 'Design',
      location: 'Los Angeles, CA',
      timezone: 'PST',
      theme: 'light' as const
    }
  ];

  const teams = [
    {
      teamId: 'team-1',
      name: 'Product Team',
      description: 'Product development and strategy',
      memberIds: ['user-0', 'user-1', 'user-2', 'user-4', 'user-5'],
      ownerId: 'user-0',
      privacy: 'public' as const,
      createdDate: '2024-01-01T00:00:00Z'
    },
    {
      teamId: 'team-2',
      name: 'Engineering Team',
      description: 'Software development and infrastructure',
      memberIds: ['user-2', 'user-4', 'user-0'],
      ownerId: 'user-2',
      privacy: 'public' as const,
      createdDate: '2024-01-01T00:00:00Z'
    },
    {
      teamId: 'team-3',
      name: 'Marketing Team',
      description: 'Marketing campaigns and brand management',
      memberIds: ['user-3', 'user-1', 'user-0'],
      ownerId: 'user-3',
      privacy: 'public' as const,
      createdDate: '2024-01-01T00:00:00Z'
    }
  ];

  const projects = [
    {
      projectId: 'project-1',
      name: 'Q1 Product Launch',
      teamId: 'team-1',
      description: 'Launch our new product features for Q1 2024',
      color: '#FC6D26',
      icon: 'https://picsum.photos/64/64?random=project1',
      ownerId: 'user-0',
      memberIds: ['user-0', 'user-1', 'user-2', 'user-4'],
      sections: [
        { sectionId: 'section-1-1', name: 'To Do', collapsed: false },
        { sectionId: 'section-1-2', name: 'In Progress', collapsed: false },
        { sectionId: 'section-1-3', name: 'Done', collapsed: false }
      ],
      customFields: [
        {
          fieldId: 'field-1',
          name: 'Priority',
          type: 'single-select' as const,
          options: ['High', 'Medium', 'Low'],
          required: false
        },
        {
          fieldId: 'field-2',
          name: 'Status',
          type: 'single-select' as const,
          options: ['Not Started', 'In Progress', 'Blocked', 'Complete'],
          required: false
        }
      ],
      privacy: 'public' as const,
      startDate: '2024-01-01',
      dueDate: '2024-03-31',
      archived: false,
      starred: true,
      createdDate: '2024-01-01T00:00:00Z',
      modifiedDate: new Date().toISOString()
    },
    {
      projectId: 'project-2',
      name: 'Website Redesign',
      teamId: 'team-2',
      description: 'Complete redesign of company website',
      color: '#EA4E9D',
      icon: 'https://picsum.photos/64/64?random=project2',
      ownerId: 'user-2',
      memberIds: ['user-2', 'user-1', 'user-5', 'user-4'],
      sections: [
        { sectionId: 'section-2-1', name: 'Backlog', collapsed: false },
        { sectionId: 'section-2-2', name: 'In Development', collapsed: false },
        { sectionId: 'section-2-3', name: 'In Review', collapsed: false },
        { sectionId: 'section-2-4', name: 'Completed', collapsed: false }
      ],
      customFields: [],
      privacy: 'public' as const,
      startDate: '2024-02-01',
      dueDate: '2024-05-31',
      archived: false,
      starred: true,
      createdDate: '2024-02-01T00:00:00Z',
      modifiedDate: new Date().toISOString()
    },
    {
      projectId: 'project-3',
      name: 'Marketing Campaign Q1',
      teamId: 'team-3',
      description: 'Q1 marketing initiatives and campaigns',
      color: '#7AC142',
      icon: 'https://picsum.photos/64/64?random=project3',
      ownerId: 'user-3',
      memberIds: ['user-3', 'user-1', 'user-0'],
      sections: [
        { sectionId: 'section-3-1', name: 'Planning', collapsed: false },
        { sectionId: 'section-3-2', name: 'Execution', collapsed: false },
        { sectionId: 'section-3-3', name: 'Complete', collapsed: false }
      ],
      customFields: [],
      privacy: 'public' as const,
      startDate: '2024-01-15',
      dueDate: '2024-03-31',
      archived: false,
      starred: false,
      createdDate: '2024-01-15T00:00:00Z',
      modifiedDate: new Date().toISOString()
    },
    {
      projectId: 'project-4',
      name: 'Mobile App Development',
      teamId: 'team-2',
      description: 'Build iOS and Android mobile applications',
      color: '#4186E0',
      icon: 'https://picsum.photos/64/64?random=project4',
      ownerId: 'user-2',
      memberIds: ['user-2', 'user-4', 'user-0'],
      sections: [
        { sectionId: 'section-4-1', name: 'To Do', collapsed: false },
        { sectionId: 'section-4-2', name: 'In Progress', collapsed: false },
        { sectionId: 'section-4-3', name: 'Done', collapsed: false }
      ],
      customFields: [],
      privacy: 'public' as const,
      archived: false,
      starred: false,
      createdDate: '2024-01-20T00:00:00Z',
      modifiedDate: new Date().toISOString()
    }
  ];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const threeDaysOut = new Date(today);
  threeDaysOut.setDate(threeDaysOut.getDate() + 3);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const twoWeeksOut = new Date(today);
  twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const fourDaysAgo = new Date(today);
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const tasks = [
    // --- Project 1: Q1 Product Launch ---
    {
      taskId: 'task-1',
      name: 'Design landing page mockups',
      projectId: 'project-1',
      sectionId: 'section-1-2',
      description: 'Create high-fidelity mockups for the new landing page including hero section, features grid, pricing table, and footer. Must be responsive for desktop, tablet, and mobile viewports.',
      assigneeId: 'user-1',
      creatorId: 'user-0',
      dueDate: fmt(tomorrow),
      startDate: '2024-01-05',
      completed: false,
      dependencies: [],
      tags: ['design', 'high-priority'],
      attachmentIds: ['attach-1'],
      customFieldValues: { 'field-1': 'High', 'field-2': 'In Progress' },
      likeCount: 3,
      createdDate: '2024-01-05T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-1a',
      name: 'Design hero section',
      projectId: 'project-1',
      sectionId: 'section-1-2',
      description: 'Create the hero banner with headline, subheadline, and CTA button',
      assigneeId: 'user-1',
      creatorId: 'user-0',
      dueDate: fmt(today),
      parentTaskId: 'task-1',
      completed: false,
      dependencies: [],
      tags: ['design'],
      attachmentIds: [],
      customFieldValues: { 'field-1': 'High' },
      likeCount: 0,
      createdDate: '2024-01-06T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-1b',
      name: 'Design footer component',
      projectId: 'project-1',
      sectionId: 'section-1-2',
      description: 'Footer with navigation links, social icons, and newsletter signup',
      assigneeId: 'user-5',
      creatorId: 'user-0',
      dueDate: fmt(dayAfterTomorrow),
      parentTaskId: 'task-1',
      completed: false,
      dependencies: [],
      tags: ['design'],
      attachmentIds: [],
      customFieldValues: { 'field-1': 'Medium' },
      likeCount: 0,
      createdDate: '2024-01-06T10:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-2',
      name: 'Implement user authentication',
      projectId: 'project-1',
      sectionId: 'section-1-2',
      description: 'Set up OAuth 2.0 and JWT-based authentication system with social login support (Google, GitHub)',
      assigneeId: 'user-2',
      creatorId: 'user-0',
      dueDate: fmt(nextWeek),
      startDate: '2024-01-10',
      completed: false,
      dependencies: [],
      tags: ['backend', 'security'],
      attachmentIds: [],
      customFieldValues: { 'field-1': 'High', 'field-2': 'In Progress' },
      likeCount: 2,
      createdDate: '2024-01-06T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-3',
      name: 'Write launch blog post',
      projectId: 'project-1',
      sectionId: 'section-1-3',
      description: 'Draft and publish blog post announcing the product launch. Include feature highlights, customer quotes, and roadmap preview.',
      assigneeId: 'user-3',
      creatorId: 'user-0',
      dueDate: '2024-01-10',
      completed: true,
      completedDate: '2024-01-10T15:30:00Z',
      dependencies: [],
      tags: ['content', 'marketing'],
      attachmentIds: [],
      customFieldValues: { 'field-1': 'Medium', 'field-2': 'Complete' },
      likeCount: 5,
      createdDate: '2024-01-03T00:00:00Z',
      modifiedDate: '2024-01-10T15:30:00Z'
    },
    {
      taskId: 'task-7',
      name: 'Review API documentation',
      projectId: 'project-1',
      sectionId: 'section-1-1',
      description: 'Update and review all API endpoint documentation. Ensure all request/response examples are current and error codes are documented.',
      assigneeId: 'user-0',
      creatorId: 'user-2',
      completed: false,
      dependencies: ['task-2'],
      tags: ['documentation'],
      attachmentIds: ['attach-2'],
      customFieldValues: { 'field-1': 'Low', 'field-2': 'Not Started' },
      likeCount: 0,
      createdDate: '2024-01-08T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-9',
      name: 'Set up staging environment',
      projectId: 'project-1',
      sectionId: 'section-1-1',
      description: 'Configure a staging server that mirrors production. Deploy latest build and enable feature flags for QA team.',
      assigneeId: 'user-4',
      creatorId: 'user-0',
      dueDate: fmt(threeDaysOut),
      startDate: fmt(today),
      completed: false,
      dependencies: [],
      tags: ['devops', 'infrastructure'],
      attachmentIds: [],
      customFieldValues: { 'field-1': 'High', 'field-2': 'Not Started' },
      likeCount: 1,
      createdDate: '2024-01-12T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-10',
      name: 'Update privacy policy',
      projectId: 'project-1',
      sectionId: 'section-1-1',
      description: 'Review and update privacy policy to comply with GDPR and CCPA regulations before public launch.',
      assigneeId: 'user-0',
      creatorId: 'user-0',
      dueDate: fmt(fourDaysAgo),
      completed: false,
      dependencies: [],
      tags: ['legal', 'compliance'],
      attachmentIds: [],
      customFieldValues: { 'field-1': 'Medium', 'field-2': 'Not Started' },
      likeCount: 0,
      createdDate: '2024-01-09T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-11',
      name: 'Create onboarding email sequence',
      projectId: 'project-1',
      sectionId: 'section-1-3',
      description: 'Design and write a 5-email onboarding sequence: welcome, feature highlights, tips & tricks, team invite, and feedback request.',
      assigneeId: 'user-3',
      creatorId: 'user-0',
      dueDate: fmt(twoDaysAgo),
      completed: true,
      completedDate: twoDaysAgo.toISOString(),
      dependencies: [],
      tags: ['email', 'marketing'],
      attachmentIds: [],
      customFieldValues: { 'field-1': 'Medium', 'field-2': 'Complete' },
      likeCount: 3,
      createdDate: '2024-01-04T00:00:00Z',
      modifiedDate: twoDaysAgo.toISOString()
    },

    // --- Project 2: Website Redesign ---
    {
      taskId: 'task-4',
      name: 'Set up CI/CD pipeline',
      projectId: 'project-2',
      sectionId: 'section-2-2',
      description: 'Configure GitHub Actions for automated testing, linting, and deployment to staging on PR merge.',
      assigneeId: 'user-4',
      creatorId: 'user-2',
      dueDate: fmt(nextWeek),
      startDate: '2024-02-01',
      completed: false,
      dependencies: [],
      tags: ['devops', 'infrastructure'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 1,
      createdDate: '2024-02-01T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-5',
      name: 'Create component library',
      projectId: 'project-2',
      sectionId: 'section-2-2',
      description: 'Build reusable React components for the new design system: Button, Input, Card, Modal, Toast, Dropdown, Avatar, Badge.',
      assigneeId: 'user-5',
      creatorId: 'user-2',
      dueDate: fmt(nextWeek),
      startDate: '2024-02-02',
      completed: false,
      dependencies: [],
      tags: ['frontend', 'design-system'],
      attachmentIds: ['attach-3'],
      customFieldValues: {},
      likeCount: 4,
      createdDate: '2024-02-02T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-8',
      name: 'Conduct user testing',
      projectId: 'project-2',
      sectionId: 'section-2-1',
      description: 'Run usability tests with 10 participants on the new website prototype. Record sessions, gather feedback, and compile findings report.',
      assigneeId: 'user-1',
      creatorId: 'user-2',
      dueDate: fmt(twoWeeksOut),
      completed: false,
      dependencies: [],
      tags: ['research', 'ux'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 1,
      createdDate: '2024-02-03T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-12',
      name: 'Design mobile navigation',
      projectId: 'project-2',
      sectionId: 'section-2-1',
      description: 'Create responsive navigation pattern for mobile. Consider hamburger menu vs bottom tab bar. Must support 6+ top-level items.',
      assigneeId: 'user-5',
      creatorId: 'user-2',
      dueDate: fmt(tomorrow),
      completed: false,
      dependencies: [],
      tags: ['design', 'mobile'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 2,
      createdDate: '2024-02-05T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-13',
      name: 'Write unit tests for auth module',
      projectId: 'project-2',
      sectionId: 'section-2-3',
      description: 'Achieve 90%+ code coverage on the authentication module. Cover login, registration, password reset, and session management flows.',
      assigneeId: 'user-4',
      creatorId: 'user-2',
      dueDate: fmt(yesterday),
      completed: false,
      dependencies: ['task-4'],
      tags: ['testing', 'backend'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 0,
      createdDate: '2024-02-06T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-14',
      name: 'Migrate database schema',
      projectId: 'project-2',
      sectionId: 'section-2-4',
      description: 'Run migration scripts to update the production database schema. Includes new user preferences table and updated indexes.',
      assigneeId: 'user-2',
      creatorId: 'user-2',
      dueDate: '2024-02-08',
      completed: true,
      completedDate: '2024-02-08T10:00:00Z',
      dependencies: [],
      tags: ['database', 'backend'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 2,
      createdDate: '2024-02-04T00:00:00Z',
      modifiedDate: '2024-02-08T10:00:00Z'
    },
    {
      taskId: 'task-15',
      name: 'Review competitor analysis',
      projectId: 'project-2',
      sectionId: 'section-2-1',
      description: 'Analyze top 5 competitor websites for UX patterns, feature sets, and design trends. Compile insights into a shared document.',
      assigneeId: 'user-0',
      creatorId: 'user-2',
      completed: false,
      dependencies: [],
      tags: ['research', 'strategy'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 1,
      createdDate: '2024-02-07T00:00:00Z',
      modifiedDate: now.toISOString()
    },

    // --- Project 3: Marketing Campaign Q1 ---
    {
      taskId: 'task-6',
      name: 'Plan social media campaign',
      projectId: 'project-3',
      sectionId: 'section-3-1',
      description: 'Outline content calendar and posting strategy for Twitter, LinkedIn, and Instagram for the next 8 weeks.',
      assigneeId: 'user-3',
      creatorId: 'user-3',
      dueDate: fmt(tomorrow),
      completed: false,
      dependencies: [],
      tags: ['social-media', 'planning'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 2,
      createdDate: '2024-01-16T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-16',
      name: 'Design email newsletter template',
      projectId: 'project-3',
      sectionId: 'section-3-2',
      description: 'Create a branded HTML email template for monthly newsletter. Must be responsive and compatible with major email clients.',
      assigneeId: 'user-1',
      creatorId: 'user-3',
      dueDate: fmt(threeDaysOut),
      completed: false,
      dependencies: [],
      tags: ['design', 'email'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 1,
      createdDate: '2024-01-20T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-17',
      name: 'Create promotional video script',
      projectId: 'project-3',
      sectionId: 'section-3-1',
      description: 'Write a 90-second promotional video script highlighting key product features and customer testimonials.',
      assigneeId: 'user-3',
      creatorId: 'user-3',
      completed: false,
      dependencies: [],
      tags: ['content', 'video'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 0,
      createdDate: '2024-01-22T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-18',
      name: 'Set up analytics tracking',
      projectId: 'project-3',
      sectionId: 'section-3-3',
      description: 'Configure UTM parameters, conversion tracking, and Google Analytics 4 events for all campaign landing pages.',
      assigneeId: 'user-0',
      creatorId: 'user-3',
      dueDate: '2024-01-25',
      completed: true,
      completedDate: '2024-01-24T16:00:00Z',
      dependencies: [],
      tags: ['analytics', 'tracking'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 2,
      createdDate: '2024-01-18T00:00:00Z',
      modifiedDate: '2024-01-24T16:00:00Z'
    },

    // --- Project 4: Mobile App Development ---
    {
      taskId: 'task-19',
      name: 'Set up React Native project',
      projectId: 'project-4',
      sectionId: 'section-4-3',
      description: 'Initialize React Native project with TypeScript, ESLint, Prettier, and navigation library. Configure both iOS and Android build pipelines.',
      assigneeId: 'user-4',
      creatorId: 'user-2',
      dueDate: '2024-02-01',
      completed: true,
      completedDate: '2024-01-31T14:00:00Z',
      dependencies: [],
      tags: ['mobile', 'setup'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 3,
      createdDate: '2024-01-22T00:00:00Z',
      modifiedDate: '2024-01-31T14:00:00Z'
    },
    {
      taskId: 'task-20',
      name: 'Implement push notification service',
      projectId: 'project-4',
      sectionId: 'section-4-2',
      description: 'Integrate Firebase Cloud Messaging for both iOS (APNs) and Android push notifications. Set up notification channels and handling.',
      assigneeId: 'user-4',
      creatorId: 'user-2',
      dueDate: fmt(dayAfterTomorrow),
      startDate: fmt(yesterday),
      completed: false,
      dependencies: ['task-19'],
      tags: ['mobile', 'notifications'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 1,
      createdDate: '2024-02-01T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-21',
      name: 'Design app icon and splash screen',
      projectId: 'project-4',
      sectionId: 'section-4-1',
      description: 'Create app icon in all required sizes for App Store and Play Store. Design animated splash screen with brand logo.',
      assigneeId: 'user-5',
      creatorId: 'user-2',
      dueDate: fmt(nextWeek),
      completed: false,
      dependencies: [],
      tags: ['design', 'mobile', 'branding'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 2,
      createdDate: '2024-02-02T00:00:00Z',
      modifiedDate: now.toISOString()
    },
    {
      taskId: 'task-22',
      name: 'Build user profile screen',
      projectId: 'project-4',
      sectionId: 'section-4-2',
      description: 'Implement the user profile screen with avatar upload, bio editing, notification preferences, and account settings.',
      assigneeId: 'user-2',
      creatorId: 'user-2',
      dueDate: fmt(twoWeeksOut),
      startDate: fmt(threeDaysOut),
      completed: false,
      dependencies: [],
      tags: ['mobile', 'frontend'],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 0,
      createdDate: '2024-02-03T00:00:00Z',
      modifiedDate: now.toISOString()
    }
  ];

  const comments = [
    {
      commentId: 'comment-1',
      taskId: 'task-1',
      userId: 'user-0',
      content: 'Great progress on the mockups! Can you add a mobile version as well?',
      createdDate: new Date(Date.now() - 86400000).toISOString(),
      likedBy: ['user-1', 'user-2']
    },
    {
      commentId: 'comment-2',
      taskId: 'task-1',
      userId: 'user-1',
      content: 'Sure! I\'ll have the mobile mockups ready by tomorrow. I\'m also working on the tablet breakpoint.',
      createdDate: new Date(Date.now() - 43200000).toISOString(),
      likedBy: ['user-0']
    },
    {
      commentId: 'comment-3',
      taskId: 'task-2',
      userId: 'user-2',
      content: 'OAuth integration is complete. Working on JWT implementation now. Should have refresh token flow done by EOD.',
      createdDate: new Date(Date.now() - 7200000).toISOString(),
      likedBy: ['user-0', 'user-4']
    },
    {
      commentId: 'comment-4',
      taskId: 'task-4',
      userId: 'user-4',
      content: 'GitHub Actions workflow is set up. Running lint, type-check, and unit tests on every PR. Still need to add the deployment step.',
      createdDate: new Date(Date.now() - 172800000).toISOString(),
      likedBy: ['user-2']
    },
    {
      commentId: 'comment-5',
      taskId: 'task-5',
      userId: 'user-5',
      content: 'I\'ve finished the Button, Input, and Card components. Working on Modal and Toast next. The Storybook documentation is also ready for the first three.',
      createdDate: new Date(Date.now() - 54000000).toISOString(),
      likedBy: ['user-2', 'user-1']
    },
    {
      commentId: 'comment-6',
      taskId: 'task-6',
      userId: 'user-0',
      content: 'Can we include a paid social budget breakdown in the campaign plan? Marketing wants to see projected ROI for each channel.',
      createdDate: new Date(Date.now() - 28800000).toISOString(),
      likedBy: []
    },
    {
      commentId: 'comment-7',
      taskId: 'task-6',
      userId: 'user-3',
      content: 'Absolutely! I\'ll add a budget allocation section with expected reach and conversion rates per platform.',
      createdDate: new Date(Date.now() - 14400000).toISOString(),
      likedBy: ['user-0']
    },
    {
      commentId: 'comment-8',
      taskId: 'task-12',
      userId: 'user-2',
      content: 'I prefer the bottom tab bar approach for our use case. Users need quick access to Home, Search, Create, Notifications, and Profile.',
      createdDate: new Date(Date.now() - 3600000).toISOString(),
      likedBy: ['user-5']
    }
  ];

  const portfolios = [
    {
      portfolioId: 'portfolio-1',
      name: 'Q1 2024 Initiatives',
      description: 'All major projects for Q1',
      ownerId: 'user-0',
      memberIds: ['user-0', 'user-2', 'user-3'],
      projectIds: ['project-1', 'project-3'],
      color: '#FC6D26'
    },
    {
      portfolioId: 'portfolio-2',
      name: 'Engineering Projects',
      description: 'Technical development projects',
      ownerId: 'user-2',
      memberIds: ['user-2', 'user-4', 'user-0'],
      projectIds: ['project-2', 'project-4'],
      color: '#4186E0'
    }
  ];

  const goals = [
    {
      goalId: 'goal-1',
      name: 'Increase user engagement by 30%',
      description: 'Improve key engagement metrics across the platform',
      ownerId: 'user-0',
      timePeriod: 'Q1 2024',
      progress: 45,
      status: 'on-track' as const,
      supportingProjectIds: ['project-1', 'project-2'],
      metrics: ['Daily Active Users', 'Session Duration', 'Feature Adoption']
    },
    {
      goalId: 'goal-2',
      name: 'Launch mobile app',
      description: 'Release iOS and Android applications',
      ownerId: 'user-2',
      timePeriod: 'Q2 2024',
      progress: 20,
      status: 'on-track' as const,
      supportingProjectIds: ['project-4'],
      metrics: ['App Store Rating', 'Downloads', 'Retention Rate']
    }
  ];

  const notifications = [
    {
      notificationId: 'notif-1',
      userId: 'user-0',
      type: 'comment' as const,
      actorId: 'user-1',
      targetId: 'task-1',
      targetType: 'task' as const,
      read: false,
      archived: false,
      createdDate: new Date(Date.now() - 43200000).toISOString()
    },
    {
      notificationId: 'notif-2',
      userId: 'user-0',
      type: 'task-completed' as const,
      actorId: 'user-3',
      targetId: 'task-3',
      targetType: 'task' as const,
      read: false,
      archived: false,
      createdDate: new Date(Date.now() - 86400000).toISOString()
    },
    {
      notificationId: 'notif-3',
      userId: 'user-0',
      type: 'task-assigned' as const,
      actorId: 'user-2',
      targetId: 'task-7',
      targetType: 'task' as const,
      read: false,
      archived: false,
      createdDate: new Date(Date.now() - 10800000).toISOString()
    },
    {
      notificationId: 'notif-4',
      userId: 'user-0',
      type: 'task-due-soon' as const,
      actorId: 'user-0',
      targetId: 'task-10',
      targetType: 'task' as const,
      read: false,
      archived: false,
      createdDate: new Date(Date.now() - 7200000).toISOString()
    },
    {
      notificationId: 'notif-5',
      userId: 'user-0',
      type: 'comment' as const,
      actorId: 'user-2',
      targetId: 'task-12',
      targetType: 'task' as const,
      read: true,
      archived: false,
      createdDate: new Date(Date.now() - 100800000).toISOString()
    },
    {
      notificationId: 'notif-6',
      userId: 'user-0',
      type: 'mention' as const,
      actorId: 'user-3',
      targetId: 'task-6',
      targetType: 'task' as const,
      read: false,
      archived: false,
      createdDate: new Date(Date.now() - 14400000).toISOString()
    },
    {
      notificationId: 'notif-7',
      userId: 'user-0',
      type: 'project-invite' as const,
      actorId: 'user-2',
      targetId: 'project-4',
      targetType: 'project' as const,
      read: true,
      archived: false,
      createdDate: new Date(Date.now() - 172800000).toISOString()
    },
    {
      notificationId: 'notif-8',
      userId: 'user-0',
      type: 'status-update' as const,
      actorId: 'user-4',
      targetId: 'task-4',
      targetType: 'task' as const,
      read: true,
      archived: false,
      createdDate: new Date(Date.now() - 216000000).toISOString()
    },
    {
      notificationId: 'notif-9',
      userId: 'user-0',
      type: 'task-assigned' as const,
      actorId: 'user-3',
      targetId: 'task-18',
      targetType: 'task' as const,
      read: true,
      archived: true,
      createdDate: new Date(Date.now() - 259200000).toISOString()
    },
    {
      notificationId: 'notif-10',
      userId: 'user-0',
      type: 'comment' as const,
      actorId: 'user-5',
      targetId: 'task-5',
      targetType: 'task' as const,
      read: false,
      archived: false,
      createdDate: new Date(Date.now() - 54000000).toISOString()
    }
  ];

  const attachments = [
    {
      attachmentId: 'attach-1',
      taskId: 'task-1',
      fileName: 'landing_page_v2.fig',
      fileType: 'application/x-figma',
      fileSize: 2457600,
      fileUrl: '/files/_default/design-specs.pdf',
      uploaderId: 'user-1',
      uploadDate: '2024-01-08T14:30:00Z'
    },
    {
      attachmentId: 'attach-2',
      taskId: 'task-7',
      fileName: 'api_endpoints_spec.pdf',
      fileType: 'application/pdf',
      fileSize: 460800,
      fileUrl: '/files/_default/api_endpoints_spec.pdf',
      uploaderId: 'user-2',
      uploadDate: '2024-01-09T09:00:00Z'
    },
    {
      attachmentId: 'attach-3',
      taskId: 'task-5',
      fileName: 'design_system_tokens.json',
      fileType: 'application/json',
      fileSize: 12400,
      fileUrl: '/files/_default/design_system_tokens.json',
      uploaderId: 'user-5',
      uploadDate: '2024-02-03T11:00:00Z'
    }
  ];

  return {
    currentUser: users[0],
    users,
    teams,
    projects,
    tasks,
    comments,
    portfolios,
    goals,
    notifications,
    attachments
  };
};
