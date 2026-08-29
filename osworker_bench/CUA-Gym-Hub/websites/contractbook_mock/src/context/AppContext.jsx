import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import {
  getSessionId,
  fetchCustomState,
  initializeData,
  saveState,
  initialKey,
  storageKey,
} from '../utils/dataManager';

const AppContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload };

    case 'ADD_CONTRACT': {
      const newContracts = [...state.contracts, action.payload];
      return { ...state, contracts: newContracts };
    }

    case 'UPDATE_CONTRACT': {
      const newContracts = state.contracts.map(c =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c
      );
      return { ...state, contracts: newContracts };
    }

    case 'DELETE_CONTRACT': {
      const newContracts = state.contracts.filter(c => c.id !== action.payload);
      return { ...state, contracts: newContracts };
    }

    case 'ADD_CONTACT': {
      return { ...state, contacts: [...state.contacts, action.payload] };
    }

    case 'UPDATE_CONTACT': {
      const newContacts = state.contacts.map(c =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c
      );
      return { ...state, contacts: newContacts };
    }

    case 'DELETE_CONTACT': {
      return { ...state, contacts: state.contacts.filter(c => c.id !== action.payload) };
    }

    case 'ADD_TEMPLATE': {
      return { ...state, templates: [...state.templates, action.payload] };
    }

    case 'UPDATE_TEMPLATE': {
      const newTemplates = state.templates.map(t =>
        t.id === action.payload.id ? { ...t, ...action.payload } : t
      );
      return { ...state, templates: newTemplates };
    }

    case 'DELETE_TEMPLATE': {
      return { ...state, templates: state.templates.filter(t => t.id !== action.payload) };
    }

    case 'ADD_TASK': {
      return { ...state, tasks: [...state.tasks, action.payload] };
    }

    case 'UPDATE_TASK': {
      const newTasks = state.tasks.map(t =>
        t.id === action.payload.id ? { ...t, ...action.payload } : t
      );
      return { ...state, tasks: newTasks };
    }

    case 'DELETE_TASK': {
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    }

    case 'MARK_NOTIFICATION_READ': {
      const newNotifs = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      return { ...state, notifications: newNotifs };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const newNotifs = state.notifications.map(n => ({ ...n, read: true }));
      return { ...state, notifications: newNotifs };
    }

    case 'ADD_NOTIFICATION': {
      return { ...state, notifications: [action.payload, ...state.notifications] };
    }

    case 'ADD_ACTIVITY': {
      return { ...state, activities: [...state.activities, action.payload] };
    }

    case 'ADD_COMMENT': {
      return { ...state, comments: [...state.comments, action.payload] };
    }

    case 'UPDATE_COMMENT': {
      const newComments = state.comments.map(c =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c
      );
      return { ...state, comments: newComments };
    }

    case 'DELETE_COMMENT': {
      return { ...state, comments: state.comments.filter(c => c.id !== action.payload) };
    }

    case 'ADD_FOLDER': {
      return { ...state, folders: [...state.folders, action.payload] };
    }

    case 'UPDATE_FOLDER': {
      const newFolders = state.folders.map(f =>
        f.id === action.payload.id ? { ...f, ...action.payload } : f
      );
      return { ...state, folders: newFolders };
    }

    case 'DELETE_FOLDER': {
      return { ...state, folders: state.folders.filter(f => f.id !== action.payload) };
    }

    case 'UPDATE_SETTINGS': {
      return { ...state, settings: { ...state.settings, ...action.payload } };
    }

    case 'ADD_SAVED_VIEW': {
      return { ...state, savedViews: [...state.savedViews, action.payload] };
    }

    case 'DELETE_SAVED_VIEW': {
      return { ...state, savedViews: state.savedViews.filter(v => v.id !== action.payload) };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null);
  const [sid, setSid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = getSessionId();
    setSid(sessionId);

    const initKey = initialKey(sessionId);
    const isRefresh = localStorage.getItem(initKey) !== null;

    if (isRefresh) {
      const data = initializeData(sessionId);
      dispatch({ type: 'SET_STATE', payload: data });
      setLoading(false);
    } else {
      fetchCustomState(sessionId).then(custom => {
        const data = initializeData(sessionId, custom);
        dispatch({ type: 'SET_STATE', payload: data });
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (state && !loading) {
      saveState(state, sid);
    }
  }, [state, sid, loading]);

  const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addContract = (contract) => {
    const newContract = {
      id: generateId('contract'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvals: [],
      ...contract,
    };
    dispatch({ type: 'ADD_CONTRACT', payload: newContract });
    addActivity({
      contractId: newContract.id,
      type: 'created',
      userId: state?.currentUser?.id || 'user-1',
      contactId: null,
      description: `${state?.currentUser?.firstName} ${state?.currentUser?.lastName} created this contract`,
      metadata: null,
    });
    return newContract;
  };

  const updateContract = (updates) => {
    dispatch({ type: 'UPDATE_CONTRACT', payload: { ...updates, updatedAt: new Date().toISOString() } });
  };

  const deleteContract = (id) => {
    dispatch({ type: 'DELETE_CONTRACT', payload: id });
  };

  const addContact = (contact) => {
    const newContact = {
      id: generateId('contact'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...contact,
    };
    dispatch({ type: 'ADD_CONTACT', payload: newContact });
    return newContact;
  };

  const updateContact = (updates) => {
    dispatch({ type: 'UPDATE_CONTACT', payload: { ...updates, updatedAt: new Date().toISOString() } });
  };

  const deleteContact = (id) => {
    dispatch({ type: 'DELETE_CONTACT', payload: id });
  };

  const addTemplate = (template) => {
    const newTemplate = {
      id: generateId('template'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      ...template,
    };
    dispatch({ type: 'ADD_TEMPLATE', payload: newTemplate });
    return newTemplate;
  };

  const updateTemplate = (updates) => {
    dispatch({ type: 'UPDATE_TEMPLATE', payload: { ...updates, updatedAt: new Date().toISOString() } });
  };

  const deleteTemplate = (id) => {
    dispatch({ type: 'DELETE_TEMPLATE', payload: id });
  };

  const addTask = (task) => {
    const newTask = {
      id: generateId('task'),
      createdAt: new Date().toISOString(),
      completedAt: null,
      ...task,
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    return newTask;
  };

  const updateTask = (updates) => {
    dispatch({ type: 'UPDATE_TASK', payload: updates });
  };

  const deleteTask = (id) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const markNotificationRead = (id) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const markAllNotificationsRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  };

  const addNotification = (notification) => {
    const newNotif = {
      id: generateId('notif'),
      createdAt: new Date().toISOString(),
      read: false,
      ...notification,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotif });
  };

  const addActivity = (activity) => {
    const newActivity = {
      id: generateId('activity'),
      timestamp: new Date().toISOString(),
      ...activity,
    };
    dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
  };

  const addComment = (comment) => {
    const newComment = {
      id: generateId('comment'),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      resolved: false,
      ...comment,
    };
    dispatch({ type: 'ADD_COMMENT', payload: newComment });
    addActivity({
      contractId: comment.contractId,
      type: 'commented',
      userId: comment.userId,
      contactId: null,
      description: `${state?.currentUser?.firstName} ${state?.currentUser?.lastName} added a comment`,
      metadata: null,
    });
    return newComment;
  };

  const addFolder = (folder) => {
    const newFolder = {
      id: generateId('folder'),
      createdAt: new Date().toISOString(),
      createdBy: state?.currentUser?.id || 'user-1',
      ...folder,
    };
    dispatch({ type: 'ADD_FOLDER', payload: newFolder });
    return newFolder;
  };

  const updateFolder = (updates) => {
    dispatch({ type: 'UPDATE_FOLDER', payload: updates });
  };

  const deleteFolder = (id) => {
    dispatch({ type: 'DELETE_FOLDER', payload: id });
  };

  const updateSettings = (updates) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
  };

  // Approval workflow actions
  const requestApproval = (contractId, approverUserId) => {
    const contract = state.contracts.find(c => c.id === contractId);
    if (!contract) return;
    const newApproval = {
      id: generateId('approval'),
      userId: approverUserId,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      respondedAt: null,
      comment: null,
    };
    const updatedApprovals = [...(contract.approvals || []), newApproval];
    updateContract({ id: contractId, approvals: updatedApprovals });
    addActivity({
      contractId,
      type: 'approval_requested',
      userId: state.currentUser?.id,
      contactId: null,
      description: `${state.currentUser?.firstName} ${state.currentUser?.lastName} requested approval from ${getUserName(approverUserId)}`,
      metadata: { approverId: approverUserId },
    });
    const approverUser = [state.currentUser, ...state.users].find(u => u.id === approverUserId);
    addNotification({
      type: 'task_assigned',
      title: `Approval requested: ${contract.title}`,
      description: `${state.currentUser?.firstName} ${state.currentUser?.lastName} requested your approval`,
      contractId,
    });
  };

  const respondToApproval = (contractId, approvalId, approved, comment) => {
    const contract = state.contracts.find(c => c.id === contractId);
    if (!contract) return;
    const updatedApprovals = (contract.approvals || []).map(a =>
      a.id === approvalId
        ? { ...a, status: approved ? 'approved' : 'rejected', respondedAt: new Date().toISOString(), comment: comment || null }
        : a
    );
    updateContract({ id: contractId, approvals: updatedApprovals });
    addActivity({
      contractId,
      type: approved ? 'approval_granted' : 'approval_rejected',
      userId: state.currentUser?.id,
      contactId: null,
      description: `${state.currentUser?.firstName} ${state.currentUser?.lastName} ${approved ? 'approved' : 'rejected'} the contract${comment ? ': ' + comment : ''}`,
      metadata: { approved, comment },
    });
    addNotification({
      type: approved ? 'signature_received' : 'contract_expired',
      title: `${contract.title} - Approval ${approved ? 'granted' : 'rejected'}`,
      description: `${state.currentUser?.firstName} ${state.currentUser?.lastName} ${approved ? 'approved' : 'rejected'} the contract${comment ? ': ' + comment : ''}`,
      contractId,
    });
  };

  const getUserName = (userId) => {
    if (userId === state?.currentUser?.id) return `${state.currentUser.firstName} ${state.currentUser.lastName}`;
    const user = state?.users?.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  const getInitialState = () => {
    const initKey = initialKey(sid);
    try {
      const raw = localStorage.getItem(initKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  if (loading || !state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F8FA' }}>
        <div style={{ color: '#6B7280', fontSize: '14px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      sid,
      addContract,
      updateContract,
      deleteContract,
      addContact,
      updateContact,
      deleteContact,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      addTask,
      updateTask,
      deleteTask,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      addActivity,
      addComment,
      addFolder,
      updateFolder,
      deleteFolder,
      updateSettings,
      requestApproval,
      respondToApproval,
      getUserName,
      getInitialState,
      generateId: (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
