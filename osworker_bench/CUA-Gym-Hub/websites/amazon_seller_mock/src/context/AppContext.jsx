import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { initializeData, getInitialState, fetchCustomState, getSessionId, saveState, initialKey } from '../utils/dataManager';

const AppContext = createContext();

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };
    case 'UPDATE_ORDER':
      return { ...state, orders: state.orders.map(o => o.id === action.payload.id ? { ...o, ...action.payload } : o) };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'SEND_MESSAGE': {
      const { message } = action.payload;
      const updatedMessages = [...state.messages, message];
      const unread = updatedMessages.filter(m => !m.isRead && m.sender === 'buyer').length;
      const uniqueThreads = [...new Set(updatedMessages.filter(m => !m.isRead && m.sender === 'buyer').map(m => m.threadId))];
      return {
        ...state,
        messages: updatedMessages,
        seller: { ...state.seller, unreadMessages: uniqueThreads.length }
      };
    }
    case 'MARK_MESSAGE_READ': {
      const updatedMsgs = state.messages.map(m =>
        m.threadId === action.payload ? { ...m, isRead: true, status: m.status === 'Unanswered' ? 'Answered' : m.status } : m
      );
      const unreadThreads = [...new Set(updatedMsgs.filter(m => !m.isRead && m.sender === 'buyer').map(m => m.threadId))];
      return { ...state, messages: updatedMsgs, seller: { ...state.seller, unreadMessages: unreadThreads.length } };
    }
    case 'UPDATE_RETURN':
      return { ...state, returns: state.returns.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r) };
    case 'UPDATE_CAMPAIGN':
      return { ...state, campaigns: state.campaigns.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case 'ADD_CAMPAIGN':
      return { ...state, campaigns: [...state.campaigns, action.payload] };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'MARK_NOTIFICATION_READ': {
      const updated = state.notifications.map(n => n.id === action.payload ? { ...n, isRead: true } : n);
      const unreadCount = updated.filter(n => !n.isRead).length;
      return { ...state, notifications: updated, seller: { ...state.seller, notificationCount: unreadCount } };
    }
    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const updated = state.notifications.map(n => ({ ...n, isRead: true }));
      return { ...state, notifications: updated, seller: { ...state.seller, notificationCount: 0 } };
    }
    case 'ADD_FEEDBACK_RESPONSE':
      return { ...state, feedback: state.feedback.map(f => f.id === action.payload.id ? { ...f, hasResponse: true, sellerResponse: action.payload.response, removalRequested: action.payload.removalRequested || f.removalRequested } : f) };
    case 'UPDATE_COUPON':
      return { ...state, coupons: state.coupons.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case 'ADD_COUPON':
      return { ...state, coupons: [...state.coupons, action.payload] };
    case 'UPDATE_PRICING_RULE':
      return { ...state, pricingRules: state.pricingRules.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r) };
    case 'ADD_PRICING_RULE':
      return { ...state, pricingRules: [...state.pricingRules, action.payload] };
    case 'DELETE_PRICING_RULE':
      return { ...state, pricingRules: state.pricingRules.filter(r => r.id !== action.payload) };
    default:
      return state;
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, null);
  const [loading, setLoading] = React.useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const sid = sidRef.current;

    if (sid) {
      const sessionInitKey = initialKey(sid);
      const isRefresh = localStorage.getItem(sessionInitKey) !== null;
      if (isRefresh) {
        const data = initializeData(sid);
        dispatch({ type: 'SET_STATE', payload: data });
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          dispatch({ type: 'SET_STATE', payload: data });
          setLoading(false);
        });
      }
    } else {
      const data = initializeData();
      dispatch({ type: 'SET_STATE', payload: data });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!state || loading) return;
    saveState(state, sidRef.current);
  }, [state, loading]);

  const dispatchAndSave = (action) => {
    dispatch(action);
  };

  const [toast, setToast] = React.useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AppContext.Provider value={{ state, dispatch: dispatchAndSave, loading, toast, showToast }}>
      {children}
    </AppContext.Provider>
  );
};
