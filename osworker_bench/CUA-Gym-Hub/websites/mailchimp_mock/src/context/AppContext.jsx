import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createInitialData, getSessionId, fetchCustomState, initializeData, saveState, initialKey, storageKey } from '../utils/dataManager';

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }) {
  const [state, setState] = useState(null);
  const [sid] = useState(() => getSessionId());
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const iKey = initialKey(sid);
    const isRefresh = localStorage.getItem(iKey) !== null;

    if (isRefresh) {
      const data = initializeData(sid);
      setState(data);
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        setState(data);
      });
    }
  }, [sid]);

  const updateState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveState(next, sid);
      return next;
    });
  }, [sid]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const statusStatKey = (status) => {
    if (status === 'non-subscribed') return 'nonSubscribed';
    return status;
  };

  const adjustAudienceStats = (audiences, audienceId, changes) => audiences.map(a => {
    if (a.id !== audienceId) return a;
    const stats = { ...(a.stats || {}) };
    Object.entries(changes).forEach(([key, delta]) => {
      stats[key] = Math.max(0, (stats[key] || 0) + delta);
    });
    return { ...a, stats };
  });

  // Action helpers
  const addCampaign = useCallback((campaign) => {
    updateState(s => ({ ...s, campaigns: [...s.campaigns, campaign] }));
  }, [updateState]);

  const updateCampaign = useCallback((id, updates) => {
    updateState(s => ({
      ...s,
      campaigns: s.campaigns.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
    }));
  }, [updateState]);

  const deleteCampaign = useCallback((id) => {
    updateState(s => ({ ...s, campaigns: s.campaigns.filter(c => c.id !== id) }));
  }, [updateState]);

  const addContact = useCallback((contact) => {
    updateState(s => ({
      ...s,
      contacts: [...s.contacts, contact],
      audiences: adjustAudienceStats(s.audiences, contact.audienceId, {
        totalContacts: 1,
        [statusStatKey(contact.status)]: 1
      })
    }));
  }, [updateState]);

  const updateContact = useCallback((id, updates) => {
    updateState(s => ({
      ...s,
      contacts: s.contacts.map(c => c.id === id ? { ...c, ...updates } : c),
      audiences: (() => {
        const existing = s.contacts.find(c => c.id === id);
        if (!existing || !updates.status || updates.status === existing.status) return s.audiences;
        return adjustAudienceStats(s.audiences, existing.audienceId, {
          [statusStatKey(existing.status)]: -1,
          [statusStatKey(updates.status)]: 1
        });
      })()
    }));
  }, [updateState]);

  const deleteContact = useCallback((id) => {
    updateState(s => {
      const existing = s.contacts.find(c => c.id === id);
      return {
        ...s,
        contacts: s.contacts.filter(c => c.id !== id),
        audiences: existing ? adjustAudienceStats(s.audiences, existing.audienceId, {
          totalContacts: -1,
          [statusStatKey(existing.status)]: -1
        }) : s.audiences
      };
    });
  }, [updateState]);

  const addTag = useCallback((tag) => {
    updateState(s => ({ ...s, tags: [...s.tags, tag] }));
  }, [updateState]);

  const updateTag = useCallback((id, updates) => {
    updateState(s => ({
      ...s,
      tags: s.tags.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  }, [updateState]);

  const deleteTag = useCallback((id) => {
    updateState(s => ({ ...s, tags: s.tags.filter(t => t.id !== id) }));
  }, [updateState]);

  const addSegment = useCallback((segment) => {
    updateState(s => ({ ...s, segments: [...s.segments, segment] }));
  }, [updateState]);

  const updateSegment = useCallback((id, updates) => {
    updateState(s => ({
      ...s,
      segments: s.segments.map(seg => seg.id === id ? { ...seg, ...updates } : seg)
    }));
  }, [updateState]);

  const deleteSegment = useCallback((id) => {
    updateState(s => ({ ...s, segments: s.segments.filter(seg => seg.id !== id) }));
  }, [updateState]);

  const addAutomation = useCallback((automation) => {
    updateState(s => ({ ...s, automations: [...s.automations, automation] }));
  }, [updateState]);

  const updateAutomation = useCallback((id, updates) => {
    updateState(s => ({
      ...s,
      automations: s.automations.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)
    }));
  }, [updateState]);

  const deleteAutomation = useCallback((id) => {
    updateState(s => ({ ...s, automations: s.automations.filter(a => a.id !== id) }));
  }, [updateState]);

  const markNotificationRead = useCallback((id) => {
    updateState(s => ({
      ...s,
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  }, [updateState]);

  const markAllNotificationsRead = useCallback(() => {
    updateState(s => ({
      ...s,
      notifications: s.notifications.map(n => ({ ...n, read: true }))
    }));
  }, [updateState]);

  if (!state) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F6F6F4', fontFamily: '"Graphik", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif' }}>Loading...</div>;
  }

  return (
    <AppContext.Provider value={{
      state, updateState, sid, toasts, addToast, removeToast,
      addCampaign, updateCampaign, deleteCampaign,
      addContact, updateContact, deleteContact,
      addTag, updateTag, deleteTag,
      addSegment, updateSegment, deleteSegment,
      addAutomation, updateAutomation, deleteAutomation,
      markNotificationRead, markAllNotificationsRead
    }}>
      {children}
    </AppContext.Provider>
  );
}
