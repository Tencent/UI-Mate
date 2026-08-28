import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { getSessionId, fetchCustomState, initializeData, saveState, initialKey, generateId, formatCurrency } from '../utils/dataManager';

const AppContext = createContext(null);

const BASE_INITIAL_KEY = 'stripe_dashboard_initialState';

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };

    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };

    case 'ADD_PAYMENT': {
      const newPayment = action.payload;
      return {
        ...state,
        payments: [newPayment, ...state.payments],
        events: [{ id: generateId('evt'), type: 'payment_intent.succeeded', created: Math.floor(Date.now() / 1000), data: { object: { id: newPayment.id, amount: newPayment.amount } }, request: null, livemode: true }, ...state.events],
      };
    }

    case 'ADD_CUSTOMER': {
      const newCust = action.payload;
      return {
        ...state,
        customers: [newCust, ...state.customers],
        events: [{ id: generateId('evt'), type: 'customer.created', created: Math.floor(Date.now() / 1000), data: { object: { id: newCust.id } }, request: null, livemode: true }, ...state.events],
      };
    }

    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
        events: [{ id: generateId('evt'), type: 'customer.updated', created: Math.floor(Date.now() / 1000), data: { object: { id: action.payload.id } }, request: null, livemode: true }, ...state.events],
      };

    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(c => c.id !== action.payload),
        events: [{ id: generateId('evt'), type: 'customer.deleted', created: Math.floor(Date.now() / 1000), data: { object: { id: action.payload } }, request: null, livemode: true }, ...state.events],
      };

    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [action.payload, ...state.products],
      };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };

    case 'ADD_PRICE':
      return {
        ...state,
        prices: [action.payload, ...state.prices],
      };

    case 'ADD_INVOICE': {
      const inv = action.payload;
      return {
        ...state,
        invoices: [inv, ...state.invoices],
        events: [{ id: generateId('evt'), type: 'invoice.created', created: Math.floor(Date.now() / 1000), data: { object: { id: inv.id } }, request: null, livemode: true }, ...state.events],
      };
    }

    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(inv =>
          inv.id === action.payload.id ? { ...inv, ...action.payload.updates } : inv
        ),
        events: [{ id: generateId('evt'), type: `invoice.${action.payload.eventType || 'updated'}`, created: Math.floor(Date.now() / 1000), data: { object: { id: action.payload.id } }, request: null, livemode: true }, ...state.events],
      };

    case 'ADD_SUBSCRIPTION': {
      const sub = action.payload;
      return {
        ...state,
        subscriptions: [sub, ...state.subscriptions],
        events: [{ id: generateId('evt'), type: 'subscription.created', created: Math.floor(Date.now() / 1000), data: { object: { id: sub.id } }, request: null, livemode: true }, ...state.events],
      };
    }

    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        ),
        events: [{ id: generateId('evt'), type: 'subscription.updated', created: Math.floor(Date.now() / 1000), data: { object: { id: action.payload.id } }, request: null, livemode: true }, ...state.events],
      };

    case 'CANCEL_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map(s =>
          s.id === action.payload.id ? {
            ...s,
            status: action.payload.immediate ? 'canceled' : s.status,
            cancel_at_period_end: !action.payload.immediate,
            canceled_at: Math.floor(Date.now() / 1000),
            ended_at: action.payload.immediate ? Math.floor(Date.now() / 1000) : null,
          } : s
        ),
      };

    case 'ADD_REFUND': {
      const refund = action.payload;
      return {
        ...state,
        refunds: [refund, ...state.refunds],
        payments: state.payments.map(p =>
          p.id === refund.charge ? {
            ...p,
            amount_refunded: p.amount_refunded + refund.amount,
            refunded: (p.amount_refunded + refund.amount) >= p.amount,
          } : p
        ),
        balance: {
          ...state.balance,
          available: state.balance.available - refund.amount,
        },
        balanceTransactions: [
          { id: generateId('txn'), amount: -refund.amount, currency: 'usd', type: 'refund', fee: 0, net: -refund.amount, status: 'available', available_on: Math.floor(Date.now() / 1000) + 172800, source: refund.id, description: `Refund for ${refund.charge}`, created: Math.floor(Date.now() / 1000) },
          ...state.balanceTransactions,
        ],
        events: [{ id: generateId('evt'), type: 'charge.refunded', created: Math.floor(Date.now() / 1000), data: { object: { id: refund.charge } }, request: null, livemode: true }, ...state.events],
      };
    }

    case 'UPDATE_DISPUTE':
      return {
        ...state,
        disputes: state.disputes.map(d =>
          d.id === action.payload.id ? { ...d, ...action.payload.updates } : d
        ),
      };

    case 'UPDATE_BUSINESS':
      return {
        ...state,
        business: { ...state.business, ...action.payload },
      };

    case 'ADD_WEBHOOK': {
      const hook = action.payload;
      return {
        ...state,
        webhooks: [hook, ...(state.webhooks || [])],
      };
    }

    case 'DELETE_WEBHOOK':
      return {
        ...state,
        webhooks: (state.webhooks || []).filter(h => h.id !== action.payload),
      };

    case 'UPDATE_TAX_SETTINGS':
      return {
        ...state,
        taxSettings: { ...(state.taxSettings || {}), ...action.payload },
      };

    case 'TOGGLE_TEST_MODE':
      return { ...state, testMode: !state.testMode };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [initialStateRef, setInitialStateRef] = useState(null);
  const [state, dispatch] = useReducer(reducer, null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;
    const ik = initialKey(sid);
    const isRefresh = localStorage.getItem(ik) !== null;

    if (isRefresh) {
      const data = initializeData(sid);
      dispatch({ type: 'SET_STATE', payload: data });
      setInitialStateRef(JSON.parse(JSON.stringify(data)));
      setLoading(false);
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        dispatch({ type: 'SET_STATE', payload: data });
        setInitialStateRef(JSON.parse(JSON.stringify(data)));
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  if (loading || !state) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <AppContext.Provider value={{ state, dispatch, initialState: initialStateRef }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export default AppContext;
