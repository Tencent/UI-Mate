import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_DATA, getSessionId, fetchCustomState, saveState, initializeData, getInitialState } from './mockData';

const StoreContext = createContext();

const BASE_INITIAL_KEY = 'zillow_mock_initial_state';

export const StoreProvider = ({ children }) => {
  const [initialStateRef, setInitialStateRef] = useState(null);
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      // CRITICAL: Check localStorage BEFORE initializeData
      const sessionKey = `${BASE_INITIAL_KEY}_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const data = initializeData(sid);
        setState(data);
        setInitialStateRef(data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setInitialStateRef(data);
          setLoading(false);
        });
      }
    } else {
      fetchCustomState().then(customState => {
        if (customState) {
          const data = initializeData(null, customState);
          setState(data);
          setInitialStateRef(data);
        } else {
          const data = initializeData();
          setState(data);
          setInitialStateRef(data);
        }
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  const toggleSaveProperty = (propertyId) => {
    setState(prev => {
      const isSaved = prev.user.savedProperties.includes(propertyId);
      const newSaved = isSaved
        ? prev.user.savedProperties.filter(id => id !== propertyId)
        : [...prev.user.savedProperties, propertyId];

      return {
        ...prev,
        user: {
          ...prev.user,
          savedProperties: newSaved
        }
      };
    });
  };

  const scheduleTour = (tourData) => {
    setState(prev => ({
      ...prev,
      tours: [...prev.tours, { ...tourData, id: `t${Date.now()}`, status: 'pending' }]
    }));
  };

  const saveSearch = (searchData) => {
     const newId = `s${Date.now()}`;
     const searchObj = { ...searchData, id: newId, emailAlerts: searchData.alertsEnabled ?? searchData.emailAlerts ?? true, createdAt: new Date().toISOString(), newListings: 0 };
     // Remove alertsEnabled key if present (normalize to emailAlerts)
     delete searchObj.alertsEnabled;
     setState(prev => ({
        ...prev,
        user: {
            ...prev.user,
            savedSearches: [...prev.user.savedSearches, newId]
        },
        savedSearches: [...(prev.savedSearches || []), searchObj]
     }));
  };

  const addContactRequest = (request) => {
    setState(prev => ({
      ...prev,
      contactRequests: [
        {
          ...request,
          id: `contact_${Date.now()}`,
          status: 'drafted',
          createdAt: new Date().toISOString()
        },
        ...(prev.contactRequests || [])
      ]
    }));
  };

  const addShareDraft = (draft) => {
    setState(prev => ({
      ...prev,
      shareDrafts: [
        {
          ...draft,
          id: `share_${Date.now()}`,
          createdAt: new Date().toISOString()
        },
        ...(prev.shareDrafts || [])
      ]
    }));
  };

  const updateFilters = (newFilters) => {
      setState(prev => ({
          ...prev,
          filters: newFilters
      }));
  };

  const toggleSignIn = () => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        isSignedIn: !prev.user.isSignedIn
      }
    }));
  };

  const addRecentlyViewed = (propertyId) => {
    setState(prev => {
      const existing = prev.user.recentlyViewed || [];
      // Remove if already in list, then prepend
      const filtered = existing.filter(id => id !== propertyId);
      const updated = [propertyId, ...filtered].slice(0, 20);
      return {
        ...prev,
        user: {
          ...prev.user,
          recentlyViewed: updated
        }
      };
    });
  };

  const sendContactMessage = (messageData) => {
    setState(prev => ({
      ...prev,
      contactMessages: [...(prev.contactMessages || []), {
        ...messageData,
        id: `msg-${Date.now()}`,
        sentAt: new Date().toISOString()
      }]
    }));
  };

  const recordShareAction = (shareData) => {
    setState(prev => ({
      ...prev,
      shareActions: [...(prev.shareActions || []), {
        ...shareData,
        id: `share-${Date.now()}`,
        createdAt: new Date().toISOString()
      }]
    }));
  };

  const addSellerLead = (leadData) => {
    setState(prev => ({
      ...prev,
      sellerLeads: [...(prev.sellerLeads || []), {
        ...leadData,
        id: `seller-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      }]
    }));
  };

  const deleteSavedSearch = (searchId) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        savedSearches: (prev.user.savedSearches || []).filter(id => id !== searchId)
      },
      savedSearches: (prev.savedSearches || []).filter(s => s.id !== searchId)
    }));
  };

  const toggleSearchAlerts = (searchId) => {
    setState(prev => ({
      ...prev,
      savedSearches: (prev.savedSearches || []).map(s =>
        s.id === searchId ? { ...s, emailAlerts: !s.emailAlerts } : s
      )
    }));
  };

  const getDiff = () => {
    if (!initialStateRef || !state) return {};
    const diff = {};
    for (let key in state) {
      if (JSON.stringify(initialStateRef[key]) !== JSON.stringify(state[key])) {
        diff[key] = { from: initialStateRef[key], to: state[key] };
      }
    }
    return diff;
  };

  const resetData = () => {
    const sid = sidRef.current;
    // Clear localStorage first so initializeData gets fresh defaults
    const sk = sid ? `zillow_mock_state_${sid}` : 'zillow_mock_state';
    const ik = sid ? `zillow_mock_initial_state_${sid}` : 'zillow_mock_initial_state';
    localStorage.removeItem(sk);
    localStorage.removeItem(ik);
    const data = initializeData(sid);
    setState(data);
    setInitialStateRef(data);
  };

  const getDebugState = () => {
    return {
      initial_state: initialStateRef,
      current_state: state,
      state_diff: getDiff()
    };
  };

  if (loading || !state) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={{
      state,
      initialState: initialStateRef,
      toggleSaveProperty,
      scheduleTour,
      saveSearch,
      addContactRequest,
      addShareDraft,
      updateFilters,
      toggleSignIn,
      addRecentlyViewed,
      sendContactMessage,
      recordShareAction,
      addSellerLead,
      deleteSavedSearch,
      toggleSearchAlerts,
      getDiff,
      resetData,
      getDebugState
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
