import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initializeData, getSessionId, fetchCustomState, saveState } from '../lib/mockData';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Keep backward compat alias
export const useStore = () => useContext(AppContext);

export const StoreProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const sid = sidRef.current;

    if (sid) {
      fetchCustomState(sid).then(customState => {
        const data = initializeData(sid, customState);
        setState(data);
        setLoading(false);
      });
    } else {
      const data = initializeData();
      setState(data);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  const updateCurrentState = (updater) => {
    setState(prev => {
      if (!prev) return prev;
      const newCurrentState = typeof updater === 'function'
        ? updater(prev.current_state)
        : { ...prev.current_state, ...updater };
      return { ...prev, current_state: newCurrentState };
    });
  };

  // Search actions
  const setSearchParams = (params) => {
    updateCurrentState(current => ({
      ...current,
      searchParams: { ...current.searchParams, ...params },
    }));
  };

  const setSearchFilters = (filters) => {
    updateCurrentState(current => ({
      ...current,
      searchFilters: { ...current.searchFilters, ...filters },
    }));
  };

  const resetFilters = () => {
    updateCurrentState(current => ({
      ...current,
      searchFilters: {
        priceMin: null, priceMax: null, starRating: [], reviewScore: null,
        propertyType: [], facilities: [], freeCancellation: false,
        breakfastIncluded: false, geniusDeals: false, sortBy: 'our_top_picks',
      },
    }));
  };

  // Property actions
  const viewProperty = (propertyId) => {
    updateCurrentState(current => {
      const viewed = current.viewedProperties || [];
      if (viewed.includes(propertyId)) return current;
      const recentlyViewed = [propertyId, ...(current.recentlyViewed || []).filter(id => id !== propertyId)].slice(0, 10);
      return {
        ...current,
        selectedPropertyId: propertyId,
        viewedProperties: [...viewed, propertyId],
        recentlyViewed,
      };
    });
  };

  const toggleSaveProperty = (propertyId) => {
    updateCurrentState(current => {
      const savedProperties = current.user.savedProperties || [];
      const isSaved = savedProperties.includes(propertyId);
      return {
        ...current,
        user: {
          ...current.user,
          savedProperties: isSaved
            ? savedProperties.filter(id => id !== propertyId)
            : [...savedProperties, propertyId],
        },
      };
    });
  };

  // Booking actions
  const addBooking = (booking) => {
    updateCurrentState(current => ({
      ...current,
      bookings: [...current.bookings, booking],
    }));
  };

  const cancelBooking = (bookingId) => {
    updateCurrentState(current => ({
      ...current,
      bookings: current.bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ),
    }));
  };

  const updateBooking = (bookingId, updates) => {
    updateCurrentState(current => ({
      ...current,
      bookings: current.bookings.map(b =>
        b.id === bookingId ? { ...b, ...updates } : b
      ),
    }));
  };

  // Add recent search
  const addRecentSearch = (search) => {
    updateCurrentState(current => {
      const existing = current.recentSearches || [];
      const filtered = existing.filter(s => s.destinationId !== search.destinationId);
      return {
        ...current,
        recentSearches: [search, ...filtered].slice(0, 5),
      };
    });
  };

  // Compute flat state diff for /go endpoint
  const computeStateDiff = (initial, current) => {
    if (!initial || !current) return {};
    const diff = {};
    // Compare key top-level fields that agents care about
    const trackedFields = ['bookings', 'user.savedProperties', 'searchParams', 'searchFilters', 'viewedProperties', 'recentlyViewed', 'recentSearches'];
    for (const field of trackedFields) {
      const currentVal = getNestedValue(current, field);
      const initVal = getNestedValue(initial, field);
      if (JSON.stringify(currentVal) !== JSON.stringify(initVal)) {
        diff[field] = { old: initVal, new: currentVal };
      }
    }
    return diff;
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
  };

  const getDiff = () => {
    if (!state) return {};
    return computeStateDiff(state.initial_state, state.current_state);
  };

  const data = state?.current_state;

  const value = {
    data,
    initialData: state?.initial_state,
    loading,
    fullState: state,
    getDiff,
    setSearchParams,
    setSearchFilters,
    resetFilters,
    viewProperty,
    toggleSaveProperty,
    addBooking,
    cancelBooking,
    updateBooking,
    addRecentSearch,
    updateCurrentState,
    // backward compat
    sid: sidRef.current,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
