import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  INITIAL_USER, INITIAL_FOLDERS, INITIAL_EMAILS, INITIAL_CONTACTS,
  INITIAL_TASKS, INITIAL_EVENTS, CATEGORIES, INITIAL_RULES, INITIAL_QUICK_STEPS,
  initializeData, getStoredInitialState, fetchCustomState, getSessionId, saveState
} from '../utils/mockData';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  const getDefaultInitialState = () => ({
    user: INITIAL_USER,
    folders: INITIAL_FOLDERS,
    emails: INITIAL_EMAILS,
    contacts: INITIAL_CONTACTS,
    tasks: INITIAL_TASKS,
    events: INITIAL_EVENTS,
    categories: CATEGORIES,
    rules: INITIAL_RULES,
    quickSteps: INITIAL_QUICK_STEPS,
  });

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      // Check BEFORE initializeData if session data already exists in localStorage
      const sessionKey = `outlook_mock_initial_state_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const data = initializeData(sid);
        setState(data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setLoading(false);
        });
      }
    } else {
      const data = initializeData();
      setState(data);
      setLoading(false);
    }
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (state) {
      saveState(state, sidRef.current);
    }
  }, [state]);

  // --- Actions ---

  const sendEmail = (emailData) => {
    const newEmail = {
      id: `email-${Date.now()}`,
      folderId: 'sent',
      from: { name: state.user.name, email: state.user.email },
      to: emailData.to, // Array of objects
      subject: emailData.subject,
      body: emailData.body,
      preview: emailData.body.substring(0, 50) + '...',
      timestamp: new Date().toISOString(),
      read: true,
      flagged: false,
      categories: [],
      attachments: emailData.attachments || [],
      isFocused: false
    };
    setState(prev => ({ ...prev, emails: [newEmail, ...prev.emails] }));
  };

  const deleteEmail = (emailId) => {
    setState(prev => ({
      ...prev,
      emails: prev.emails.map(e =>
        e.id === emailId ? { ...e, folderId: 'deleted' } : e
      )
    }));
  };

  const markRead = (emailId, isRead = true) => {
    setState(prev => ({
      ...prev,
      emails: prev.emails.map(e => e.id === emailId ? { ...e, read: isRead } : e)
    }));
  };

  const toggleFlag = (emailId) => {
    setState(prev => ({
      ...prev,
      emails: prev.emails.map(e => e.id === emailId ? { ...e, flagged: !e.flagged } : e)
    }));
  };

  const moveEmail = (emailId, folderId) => {
    setState(prev => ({
      ...prev,
      emails: prev.emails.map(e => e.id === emailId ? { ...e, folderId } : e)
    }));
  };

  const addCategory = (emailId, categoryId) => {
    setState(prev => ({
      ...prev,
      emails: prev.emails.map(e => {
        if (e.id !== emailId) return e;
        const cats = e.categories.includes(categoryId)
          ? e.categories.filter(c => c !== categoryId)
          : [...e.categories, categoryId];
        return { ...e, categories: cats };
      })
    }));
  };

  const restoreEmails = (emails) => {
    setState(prev => ({ ...prev, emails }));
  };

  const createFolder = (name) => {
    const newFolder = {
      id: `folder-${Date.now()}`,
      name,
      icon: 'Folder',
      type: 'custom'
    };
    setState(prev => ({ ...prev, folders: [...prev.folders, newFolder] }));
  };

  const createTask = (title, dueDate) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      dueDate,
      completed: false
    };
    setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
  };

  const toggleTaskComplete = (taskId) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const createEvent = (eventData) => {
    const newEvent = {
      id: `evt-${Date.now()}`,
      ...eventData
    };
    setState(prev => ({ ...prev, events: [...prev.events, newEvent] }));
  };

  const addContact = (contactData) => {
    const newContact = {
      id: `c-${Date.now()}`,
      avatar: `https://picsum.photos/100/100?random=${Date.now()}`,
      ...contactData
    };
    setState(prev => ({ ...prev, contacts: [...prev.contacts, newContact] }));
  };

  const updateContact = (contactId, contactData) => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.map(contact =>
        contact.id === contactId ? { ...contact, ...contactData } : contact
      )
    }));
  };

  // --- Diffing for /go endpoint ---
  const getStateDiff = () => {
    const initial = getStoredInitialState(sidRef.current) || getDefaultInitialState();
    const diff = {};
    Object.keys(state).forEach(key => {
      if (JSON.stringify(state[key]) !== JSON.stringify(initial[key])) {
        diff[key] = {
          original: initial[key],
          current: state[key]
        };
      }
    });
    return diff;
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={{
      state,
      initialState: getStoredInitialState(sidRef.current) || getDefaultInitialState(),
      actions: {
        sendEmail, deleteEmail, markRead, toggleFlag, moveEmail, addCategory,
        restoreEmails, createFolder, createTask, toggleTaskComplete, createEvent, addContact, updateContact,
        getStateDiff
      }
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
