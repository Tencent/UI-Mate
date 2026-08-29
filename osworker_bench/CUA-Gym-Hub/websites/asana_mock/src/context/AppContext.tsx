
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { AppState, Task, Project, Comment, Goal, Portfolio, Attachment } from '../types';
import { generateInitialData, getSessionId, fetchCustomState, saveState, initializeData } from '../data/initialData';

interface AppContextType {
  state: AppState;
  initialState: AppState;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  addProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addComment: (comment: Comment) => void;
  addAttachment: (attachment: Attachment) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  archiveNotification: (notificationId: string) => void;
  toggleTaskComplete: (taskId: string) => void;
  toggleProjectStar: (projectId: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  addPortfolio: (portfolio: Portfolio) => void;
  updatePortfolio: (portfolioId: string, updates: Partial<Portfolio>) => void;
  addTeamMember: (teamId: string, userId: string) => void;
  toggleCommentLike: (commentId: string) => void;
  updateCurrentUser: (updates: Partial<import('../types').User>) => void;
}

const INITIAL_KEY_PREFIX = 'xsana-app-initialState';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialState, setInitialState] = useState<AppState>(() => generateInitialData());
  const [state, setState] = useState<AppState>(() => generateInitialData());
  const [loading, setLoading] = useState(true);
  const sidRef = useRef<string | null>(getSessionId());
  const initDone = useRef(false);

  // Session-aware initialization
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const sid = sidRef.current;
    if (sid) {
      const sessionKey = `${INITIAL_KEY_PREFIX}_${sid}`;
      fetchCustomState(sid).then(customState => {
        const data = initializeData(sid, customState);
        setState(data);
        const storedInitial = localStorage.getItem(sessionKey);
        setInitialState(storedInitial ? JSON.parse(storedInitial) : data);
        setLoading(false);
      });
    } else {
      fetchCustomState().then(customState => {
        if (customState) {
          const data = initializeData(null, customState);
          setState(data);
          setInitialState(JSON.parse(JSON.stringify(data)));
        } else {
          const data = initializeData();
          setState(data);
          setInitialState(JSON.parse(JSON.stringify(data)));
        }
        setLoading(false);
      });
    }
  }, []);

  // Save state on changes (session-aware)
  useEffect(() => {
    if (loading) return;
    saveState(state, sidRef.current);
  }, [state, loading]);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.taskId === taskId
          ? { ...task, ...updates, modifiedDate: new Date().toISOString() }
          : task
      )
    }));
  };

  const addTask = (task: Task) => {
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }));
  };

  const deleteTask = (taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.taskId !== taskId)
    }));
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(project =>
        project.projectId === projectId
          ? { ...project, ...updates, modifiedDate: new Date().toISOString() }
          : project
      )
    }));
  };

  const addProject = (project: Project) => {
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, project]
    }));
  };

  const deleteProject = (projectId: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.projectId !== projectId),
      tasks: prev.tasks.filter(t => t.projectId !== projectId)
    }));
  };

  const addComment = (comment: Comment) => {
    setState(prev => ({
      ...prev,
      comments: [...prev.comments, comment]
    }));
  };

  const addAttachment = (attachment: Attachment) => {
    setState(prev => ({
      ...prev,
      attachments: [...prev.attachments, attachment]
    }));
  };

  const markNotificationRead = (notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.notificationId === notificationId
          ? { ...notif, read: true }
          : notif
      )
    }));
  };

  const markAllNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.userId === prev.currentUser.userId
          ? { ...notif, read: true }
          : notif
      )
    }));
  };

  const archiveNotification = (notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.notificationId === notificationId
          ? { ...notif, archived: !notif.archived }
          : notif
      )
    }));
  };

  const toggleTaskComplete = (taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.taskId === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedDate: !task.completed ? new Date().toISOString() : undefined,
              modifiedDate: new Date().toISOString()
            }
          : task
      )
    }));
  };

  const toggleProjectStar = (projectId: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(project =>
        project.projectId === projectId
          ? { ...project, starred: !project.starred }
          : project
      )
    }));
  };

  const addGoal = (goal: Goal) => {
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, goal]
    }));
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(goal =>
        goal.goalId === goalId
          ? { ...goal, ...updates }
          : goal
      )
    }));
  };

  const addPortfolio = (portfolio: Portfolio) => {
    setState(prev => ({
      ...prev,
      portfolios: [...prev.portfolios, portfolio]
    }));
  };

  const updatePortfolio = (portfolioId: string, updates: Partial<Portfolio>) => {
    setState(prev => ({
      ...prev,
      portfolios: prev.portfolios.map(p =>
        p.portfolioId === portfolioId
          ? { ...p, ...updates }
          : p
      )
    }));
  };

  const addTeamMember = (teamId: string, userId: string) => {
    setState(prev => ({
      ...prev,
      teams: prev.teams.map(team =>
        team.teamId === teamId && !team.memberIds.includes(userId)
          ? { ...team, memberIds: [...team.memberIds, userId] }
          : team
      )
    }));
  };

  const updateCurrentUser = (updates: Partial<import('../types').User>) => {
    setState(prev => ({
      ...prev,
      currentUser: { ...prev.currentUser, ...updates },
      users: prev.users.map(u =>
        u.userId === prev.currentUser.userId ? { ...u, ...updates } : u
      )
    }));
  };

  const toggleCommentLike = (commentId: string) => {
    setState(prev => ({
      ...prev,
      comments: prev.comments.map(comment =>
        comment.commentId === commentId
          ? {
              ...comment,
              likedBy: comment.likedBy.includes(prev.currentUser.userId)
                ? comment.likedBy.filter(id => id !== prev.currentUser.userId)
                : [...comment.likedBy, prev.currentUser.userId]
            }
          : comment
      )
    }));
  };

  return (
    <AppContext.Provider
      value={{
        state,
        initialState,
        updateTask,
        addTask,
        deleteTask,
        updateProject,
        addProject,
        deleteProject,
        addComment,
        addAttachment,
        markNotificationRead,
        markAllNotificationsRead,
        archiveNotification,
        toggleTaskComplete,
        toggleProjectStar,
        addGoal,
        updateGoal,
        addPortfolio,
        updatePortfolio,
        addTeamMember,
        toggleCommentLike,
        updateCurrentUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
