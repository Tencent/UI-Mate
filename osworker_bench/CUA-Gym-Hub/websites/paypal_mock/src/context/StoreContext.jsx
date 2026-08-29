
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_STATE, getSessionId, fetchCustomState, saveState, initializeData, getInitialState } from '../lib/initialData';
import { generateId } from '../lib/utils';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

const BASE_INITIAL_KEY = 'paypal_mock_initialState';

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
        setInitialStateRef(getInitialState(sid) || data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setInitialStateRef(getInitialState(sid) || data);
          setLoading(false);
        });
      }
    } else {
      fetchCustomState().then(customState => {
        if (customState) {
          const data = initializeData(null, customState);
          setState(data);
          setInitialStateRef(getInitialState(null) || data);
        } else {
          const data = initializeData();
          setState(data);
          setInitialStateRef(getInitialState(null) || data);
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

  // Actions
  const sendMoney = (recipient, amount, note, currency = 'USD') => {
    const newTransaction = {
      id: generateId(),
      type: 'payment_sent',
      amount: parseFloat(amount),
      currency,
      recipientName: recipient,
      date: new Date().toISOString(),
      status: 'completed',
      description: note || 'Money Sent'
    };

    setState(prev => ({
      ...prev,
      user: { ...prev.user, balance: prev.user.balance - parseFloat(amount) },
      transactions: [newTransaction, ...prev.transactions]
    }));
  };

  const addMoney = (amount, sourceName = 'Linked bank', currency = 'USD') => {
    const parsedAmount = parseFloat(amount);
    const newTransaction = {
      id: generateId(),
      type: 'money_added',
      amount: parsedAmount,
      currency,
      fee: 0,
      netAmount: parsedAmount,
      recipientName: null,
      recipientEmail: null,
      senderName: sourceName,
      senderEmail: null,
      destination: 'XayPal balance',
      source: sourceName,
      date: new Date().toISOString(),
      status: 'completed',
      description: 'Added money',
      category: 'transfer',
      transactionId: `TXN-${Math.random().toString(36).substring(2,10).toUpperCase()}`,
      relatedInvoiceId: null,
    };

    setState(prev => ({
      ...prev,
      user: { ...prev.user, balance: prev.user.balance + parsedAmount },
      transactions: [newTransaction, ...prev.transactions]
    }));
  };

  const requestMoney = (recipient, amount, note, currency = 'USD') => {
    const newTransaction = {
      id: generateId(),
      type: 'request_sent',
      amount: parseFloat(amount),
      currency,
      recipientName: recipient,
      date: new Date().toISOString(),
      status: 'pending',
      description: note || 'Money Request'
    };

    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));
  };

  const addPaymentMethod = (method) => {
    setState(prev => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, { ...method, id: generateId(), verified: method.verified ?? true }]
    }));
  };

  const deletePaymentMethod = (methodId) => {
    setState(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(method => method.id !== methodId)
    }));
  };

  const verifyPaymentMethod = (methodId) => {
    setState(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method =>
        method.id === methodId ? { ...method, verified: true } : method
      ),
      notifications: [
        {
          id: generateId(),
          message: 'Payment method verified',
          read: false,
          date: new Date().toISOString()
        },
        ...prev.notifications
      ]
    }));
  };

  const createInvoice = (invoiceData) => {
    setState(prev => ({
      ...prev,
      invoices: [...prev.invoices, { ...invoiceData, id: generateId(), status: 'sent', number: `INV-${Math.floor(Math.random() * 10000)}` }]
    }));
  };

  const createSubscription = (subData) => {
    setState(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, { ...subData, id: generateId(), status: 'active' }]
    }));
  };

  const createPaymentLink = (linkData) => {
    const newLink = {
      ...linkData,
      id: generateId(),
      url: `https://paypal-mock.local/pay/${generateId()}`,
      active: true,
      created: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      paymentLinks: [newLink, ...(prev.paymentLinks || [])]
    }));

    return newLink;
  };

  const togglePaymentLink = (linkId) => {
    setState(prev => ({
      ...prev,
      paymentLinks: (prev.paymentLinks || []).map(link =>
        link.id === linkId ? { ...link, active: !link.active } : link
      )
    }));
  };

  const markNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification => ({ ...notification, read: true }))
    }));
  };

  const updateSettings = (settings) => {
    setState(prev => ({
      ...prev,
      settings: { ...(prev.settings || {}), ...settings }
    }));
  };

  // Helper for the /go endpoint
  const getDiff = () => {
    const diff = {};
    if (!state || !initialStateRef) return diff;

    Object.keys(state).forEach(key => {
      if (JSON.stringify(state[key]) !== JSON.stringify(initialStateRef[key])) {
        diff[key] = {
          original: initialStateRef[key],
          current: state[key]
        };
      }
    });
    return diff;
  };

  const resetState = () => {
    setState(INITIAL_STATE);
    const sid = sidRef.current;
    const sk = sid ? `paypal_mock_state_${sid}` : 'paypal_mock_state';
    localStorage.removeItem(sk);
  };

  if (loading || !state) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f7fa' }}>Loading...</div>;
  }

  const value = {
    state: state || INITIAL_STATE,
    initialState: initialStateRef,
    getDiff,
    sendMoney,
    addMoney,
    requestMoney,
    addPaymentMethod,
    deletePaymentMethod,
    verifyPaymentMethod,
    createInvoice,
    createSubscription,
    createPaymentLink,
    togglePaymentLink,
    markNotificationsRead,
    updateSettings,
    resetState
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
