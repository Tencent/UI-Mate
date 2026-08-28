import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { INITIAL_STATE, getSessionId, fetchCustomState, saveState, initializeData, getInitialState } from '../data/mockData';

const AppContext = createContext();

const BASE_INITIAL_KEY = 'instacart_mock_initialState';

const ACTION_TYPES = {
  LOAD_STATE: 'LOAD_STATE',
  SET_STORE: 'SET_STORE',
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_SUBSTITUTION: 'UPDATE_SUBSTITUTION',
  PLACE_ORDER: 'PLACE_ORDER',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  ADD_CHAT_MESSAGE: 'ADD_CHAT_MESSAGE',
  UPDATE_USER: 'UPDATE_USER',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_NOTIFICATIONS_READ: 'MARK_NOTIFICATIONS_READ',
  CLEAR_CART: 'CLEAR_CART',
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.LOAD_STATE:
      return { ...action.payload };

    case ACTION_TYPES.SET_STORE:
      return { ...state, currentStoreId: action.payload, cart: [] }; // Reset cart on store switch for simplicity

    case ACTION_TYPES.ADD_TO_CART: {
      const existingItemIndex = state.cart.findIndex(item => item.productId === action.payload.productId);
      if (existingItemIndex > -1) {
        const newCart = [...state.cart];
        newCart[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, cart: newCart };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    }

    case ACTION_TYPES.UPDATE_CART_ITEM: {
      const newCart = state.cart.map(item =>
        item.productId === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      return { ...state, cart: newCart };
    }

    case ACTION_TYPES.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.productId !== action.payload)
      };

    case ACTION_TYPES.UPDATE_SUBSTITUTION: {
      const newCart = state.cart.map(item =>
        item.productId === action.payload.productId
          ? {
              ...item,
              subPreference: action.payload.subPreference,
              subProductId: action.payload.subProductId
            }
          : item
      );
      return { ...state, cart: newCart };
    }

    case ACTION_TYPES.PLACE_ORDER:
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        activeOrder: action.payload.id,
        cart: []
      };

    case ACTION_TYPES.UPDATE_ORDER_STATUS:
      const updatedOrders = state.orders.map(order =>
        order.id === action.payload.orderId
          ? { ...order, ...action.payload.updates }
          : order
      );
      return { ...state, orders: updatedOrders };

    case ACTION_TYPES.ADD_CHAT_MESSAGE:
      const ordersWithChat = state.orders.map(order => {
        if (order.id === action.payload.orderId) {
          return {
            ...order,
            chat: [...(order.chat || []), action.payload.message]
          };
        }
        return order;
      });
      return { ...state, orders: ordersWithChat };

    case ACTION_TYPES.UPDATE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
          preferences: {
            ...(state.user.preferences || {}),
            ...(action.payload.preferences || {})
          }
        }
      };

    case ACTION_TYPES.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          {
            id: `notif_${Date.now()}`,
            read: false,
            created: new Date().toISOString(),
            ...action.payload
          },
          ...(state.notifications || [])
        ]
      };

    case ACTION_TYPES.MARK_NOTIFICATIONS_READ:
      return {
        ...state,
        notifications: (state.notifications || []).map(notification => ({ ...notification, read: true }))
      };

    case ACTION_TYPES.CLEAR_CART:
      return { ...state, cart: [] };

    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, null);
  const [initialStateSnapshot, setInitialStateSnapshot] = useState(null);
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
        dispatch({ type: ACTION_TYPES.LOAD_STATE, payload: data });
        setInitialStateSnapshot(getInitialState(sid) || data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          dispatch({ type: ACTION_TYPES.LOAD_STATE, payload: data });
          setInitialStateSnapshot(data);
          setLoading(false);
        });
      }
    } else {
      fetchCustomState().then(customState => {
        if (customState) {
          const data = initializeData(null, customState);
          dispatch({ type: ACTION_TYPES.LOAD_STATE, payload: data });
          setInitialStateSnapshot(data);
        } else {
          const data = initializeData();
          dispatch({ type: ACTION_TYPES.LOAD_STATE, payload: data });
          setInitialStateSnapshot(data);
        }
        setLoading(false);
      });
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  const value = {
    state,
    dispatch,
    initialState: initialStateSnapshot,
    ACTION_TYPES
  };

  if (loading || !state) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f9fafb' }}>Loading...</div>;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
