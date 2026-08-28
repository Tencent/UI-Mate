import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_STATE, DEFAULT_SETTINGS, getSessionId, fetchCustomState, saveState, initializeData } from '../data/mockData';
import { generateId, formatDate } from '../lib/utils';

const StoreContext = createContext();

const INITIAL_KEY_PREFIX = 'xmail-clone-initialState';

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const [initialState, setInitialState] = useState(() => JSON.parse(JSON.stringify(INITIAL_STATE)));
  const [state, setState] = useState(() => INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('primary');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [composePreFill, setComposePreFill] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [focusedEmailIndex, setFocusedEmailIndex] = useState(-1);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Session-aware initialization
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const sid = sidRef.current;
    if (sid) {
      const sessionKey = `${INITIAL_KEY_PREFIX}_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;
      if (isRefresh) {
        const data = initializeData(sid);
        setState(data);
        const storedInitial = localStorage.getItem(sessionKey);
        setInitialState(storedInitial ? JSON.parse(storedInitial) : data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setInitialState(JSON.parse(JSON.stringify(data)));
          setLoading(false);
        });
      }
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
    try {
      saveState(state, sidRef.current, initialState);
    } catch (e) {
      console.error("Failed to save state to local storage", e);
    }
  }, [state, loading]);

  const updateEmail = (emailId, updates) => {
    setState(prev => ({
      ...prev,
      emails: prev.emails.map(email =>
        email.id === emailId ? { ...email, ...updates } : email
      )
    }));
  };

  const bulkUpdateEmails = (emailIds, updates) => {
    setState(prev => ({
      ...prev,
      emails: prev.emails.map(email =>
        emailIds.includes(email.id) ? { ...email, ...updates } : email
      )
    }));
    setSelectedEmails([]);
  };

  const deleteEmails = (emailIds) => {
    setState(prev => {
      const emailsToUpdate = prev.emails.filter(e => emailIds.includes(e.id));
      const trashIds = emailsToUpdate.filter(e => e.folder === 'trash').map(e => e.id);
      const nonTrashIds = emailsToUpdate.filter(e => e.folder !== 'trash').map(e => e.id);
      const snapshot = prev.emails;

      let newEmails = prev.emails;

      if (trashIds.length > 0) {
        newEmails = newEmails.filter(e => !trashIds.includes(e.id));
      }

      if (nonTrashIds.length > 0) {
        newEmails = newEmails.map(e =>
          nonTrashIds.includes(e.id) ? { ...e, folder: 'trash' } : e
        );
      }

      showToast(
        trashIds.length > 0 ? 'Conversation deleted forever' : 'Conversation moved to Trash',
        () => setState(s => ({ ...s, emails: snapshot }))
      );

      return { ...prev, emails: newEmails };
    });
    setSelectedEmails([]);
  };

  const archiveEmails = (emailIds) => {
    setState(prev => {
      const snapshot = prev.emails;
      showToast('Conversation archived', () => setState(s => ({ ...s, emails: snapshot })));
      return {
        ...prev,
        emails: prev.emails.map(e => emailIds.includes(e.id) ? { ...e, folder: 'all-mail' } : e)
      };
    });
    setSelectedEmails([]);
  }

  const parseRecipients = (str) => {
    if (!str) return [];
    return str.split(',').map(e => {
      const trimmed = e.trim();
      return trimmed ? { name: trimmed, email: trimmed } : null;
    }).filter(Boolean);
  };

  const sendEmail = (emailData) => {
    const newEmail = {
      id: generateId(),
      threadId: generateId(),
      from: { name: state.user.username, email: state.user.email, avatar: state.user.avatar },
      to: parseRecipients(emailData.to),
      cc: parseRecipients(emailData.cc),
      bcc: parseRecipients(emailData.bcc),
      subject: emailData.subject,
      body: emailData.body,
      snippet: emailData.body.replace(/<[^>]*>?/gm, '').substring(0, 100),
      timestamp: new Date().toISOString(),
      read: true,
      starred: false,
      important: false,
      labels: [],
      category: 'primary',
      folder: 'sent',
      attachments: emailData.attachments || []
    };

    setState(prev => ({
      ...prev,
      emails: [
        newEmail,
        ...prev.emails.filter(email => email.id !== currentDraftId)
      ]
    }));

    if (currentDraftId) {
      setCurrentDraftId(null);
    }
  };

  const saveDraft = (draftData) => {
      // If no content, don't save
      if (!draftData.to && !draftData.subject && !draftData.body) return;

      if (currentDraftId) {
          // Update existing draft
          setState(prev => ({
              ...prev,
              emails: prev.emails.map(e => e.id === currentDraftId ? {
                  ...e,
                  to: parseRecipients(draftData.to),
                  cc: parseRecipients(draftData.cc),
                  bcc: parseRecipients(draftData.bcc),
                  subject: draftData.subject || '(no subject)',
                  body: draftData.body,
                  snippet: draftData.body.replace(/<[^>]*>?/gm, '').substring(0, 100),
                  attachments: draftData.attachments || [],
                  timestamp: new Date().toISOString()
              } : e)
          }));
      } else {
          // Create new draft
          const newDraftId = generateId();
          const newDraft = {
              id: newDraftId,
              threadId: generateId(),
              from: { name: state.user.username, email: state.user.email, avatar: state.user.avatar },
              to: parseRecipients(draftData.to),
              cc: parseRecipients(draftData.cc),
              bcc: parseRecipients(draftData.bcc),
              subject: draftData.subject || '(no subject)',
              body: draftData.body,
              snippet: draftData.body.replace(/<[^>]*>?/gm, '').substring(0, 100),
              timestamp: new Date().toISOString(),
              read: true,
              starred: false,
              important: false,
              labels: [],
              category: 'primary',
              folder: 'drafts',
              attachments: draftData.attachments || []
          };

          setState(prev => ({
              ...prev,
              emails: [newDraft, ...prev.emails]
          }));
          setCurrentDraftId(newDraftId);
      }
  }

  const deleteDraft = (id) => {
      setState(prev => ({
          ...prev,
          emails: prev.emails.filter(e => e.id !== id)
      }));
  }

  const replyToEmail = (originalEmail, body, isReplyAll = false, attachments = []) => {
     const newEmail = {
      id: generateId(),
      threadId: originalEmail.threadId,
      from: { name: state.user.username, email: state.user.email, avatar: state.user.avatar },
      to: [originalEmail.from, ...(isReplyAll ? originalEmail.to : [])].filter(r => r.email !== state.user.email),
      cc: isReplyAll ? originalEmail.cc : [],
      bcc: [],
      subject: originalEmail.subject.startsWith('Re:') ? originalEmail.subject : `Re: ${originalEmail.subject}`,
      body: body,
      snippet: body.replace(/<[^>]*>?/gm, '').substring(0, 100),
      timestamp: new Date().toISOString(),
      read: true,
      starred: false,
      important: false,
      labels: [],
      category: 'primary',
      folder: 'sent',
      attachments: attachments
    };

    setState(prev => ({
        ...prev,
        emails: [...prev.emails, newEmail]
    }));
  }

  const toggleStar = (emailId) => {
    const email = state.emails.find(e => e.id === emailId);
    if (email) updateEmail(emailId, { starred: !email.starred });
  };

  const toggleImportant = (emailId) => {
    const email = state.emails.find(e => e.id === emailId);
    if (email) updateEmail(emailId, { important: !email.important });
  };

  const toggleRead = (emailId, status) => {
      updateEmail(emailId, { read: status });
  }

  const addLabel = (emailId, labelId) => {
    const email = state.emails.find(e => e.id === emailId);
    if (email && !email.labels.includes(labelId)) {
      updateEmail(emailId, { labels: [...email.labels, labelId] });
    }
  };

  const removeLabel = (emailId, labelId) => {
      const email = state.emails.find(e => e.id === emailId);
      if(email) {
          updateEmail(emailId, { labels: email.labels.filter(l => l !== labelId) });
      }
  }

  const createLabel = (name, color) => {
      const newLabel = { id: generateId(), name, color };
      setState(prev => ({
          ...prev,
          labels: [...prev.labels, newLabel]
      }));
  }

  const updateLabel = (labelId, updates) => {
      setState(prev => ({
          ...prev,
          labels: prev.labels.map(l => l.id === labelId ? { ...l, ...updates } : l)
      }));
  };

  const deleteLabel = (labelId) => {
      setState(prev => ({
          ...prev,
          labels: prev.labels.filter(l => l.id !== labelId),
          // Remove the label from all emails
          emails: prev.emails.map(e => ({
              ...e,
              labels: e.labels.filter(lid => lid !== labelId)
          }))
      }));
  };

  const updateSettings = (newSettings) => {
      setState(prev => ({
          ...prev,
          settings: { ...(prev.settings || DEFAULT_SETTINGS), ...newSettings }
      }));
  };

  const showToast = useCallback((message, undoAction) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, undoAction });
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  }, []);

  const forwardEmail = (originalEmail) => {
    const cleanBody = originalEmail.body.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
    const fwdBody = `---------- Forwarded message ---------\nFrom: ${originalEmail.from.name} <${originalEmail.from.email}>\nDate: ${formatDate(originalEmail.timestamp)}\nSubject: ${originalEmail.subject}\nTo: ${originalEmail.to.map(t => t.email).join(', ')}\n\n${cleanBody}`;
    setComposePreFill({
      to: '',
      cc: '',
      bcc: '',
      subject: `Fwd: ${originalEmail.subject}`,
      body: fwdBody,
      attachments: originalEmail.attachments || []
    });
    setCurrentDraftId(null);
    setIsComposeOpen(true);
  };

  const openDraft = (emailId) => {
    const draft = state.emails.find(e => e.id === emailId);
    if (!draft) return;
    setComposePreFill({
      to: draft.to.map(t => t.email || t.name).join(', '),
      cc: (draft.cc || []).map(t => t.email || t.name).join(', '),
      bcc: (draft.bcc || []).map(t => t.email || t.name).join(', '),
      subject: draft.subject,
      body: draft.body,
      attachments: draft.attachments || []
    });
    setCurrentDraftId(emailId);
    setIsComposeOpen(true);
  };

  const snoozeEmail = (emailId, snoozedUntil) => {
    setState(prev => {
      const snapshot = prev.emails;
      showToast('Conversation snoozed', () => setState(s => ({ ...s, emails: snapshot })));
      return {
        ...prev,
        emails: prev.emails.map(e =>
          e.id === emailId ? { ...e, folder: 'snoozed', snoozedUntil } : e
        )
      };
    });
  };

  // Check for unsnoozed emails on mount and periodically
  useEffect(() => {
    if (loading) return;
    const checkSnoozed = () => {
      const now = new Date();
      setState(prev => {
        const hasExpired = prev.emails.some(e => e.folder === 'snoozed' && e.snoozedUntil && new Date(e.snoozedUntil) <= now);
        if (!hasExpired) return prev;
        return {
          ...prev,
          emails: prev.emails.map(e =>
            e.folder === 'snoozed' && e.snoozedUntil && new Date(e.snoozedUntil) <= now
              ? { ...e, folder: 'inbox', snoozedUntil: null }
              : e
          )
        };
      });
    };
    checkSnoozed();
    const interval = setInterval(checkSnoozed, 60000);
    return () => clearInterval(interval);
  }, [loading]);

  const emptyTrash = () => {
    setState(prev => ({
      ...prev,
      emails: prev.emails.filter(e => e.folder !== 'trash')
    }));
  };

  return (
    <StoreContext.Provider value={{
      state,
      initialState,
      searchQuery,
      setSearchQuery,
      selectedEmails,
      setSelectedEmails,
      isComposeOpen,
      setIsComposeOpen,
      activeCategory,
      setActiveCategory,
      isSearchModalOpen,
      setIsSearchModalOpen,
      currentDraftId,
      setCurrentDraftId,
      updateEmail,
      bulkUpdateEmails,
      deleteEmails,
      archiveEmails,
      sendEmail,
      saveDraft,
      deleteDraft,
      replyToEmail,
      toggleStar,
      toggleImportant,
      toggleRead,
      addLabel,
      removeLabel,
      createLabel,
      updateLabel,
      deleteLabel,
      updateSettings,
      settings: state.settings || DEFAULT_SETTINGS,
      emptyTrash,
      forwardEmail,
      openDraft,
      snoozeEmail,
      composePreFill,
      setComposePreFill,
      toast,
      showToast,
      dismissToast,
      sidebarCollapsed,
      setSidebarCollapsed,
      focusedEmailIndex,
      setFocusedEmailIndex,
      showShortcutsModal,
      setShowShortcutsModal
    }}>
      {children}
    </StoreContext.Provider>
  );
};
