import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_DATA, getSessionId, fetchCustomState, saveState, initializeData } from '../lib/mockData';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

const BASE_INITIAL_KEY = 'amazon_mock_state_initialState';

export const StoreProvider = ({ children }) => {
  const [state, setState] = useState(() => ({ ...INITIAL_DATA, savedForLater: [] }));
  const [initialState, setInitialState] = useState(JSON.parse(JSON.stringify(INITIAL_DATA)));
  const [hydrated, setHydrated] = useState(false);

  // Session ID
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  // Session-aware initialization
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const sid = sidRef.current;

    if (sid) {
      const sessionKey = `${BASE_INITIAL_KEY}_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;
      if (isRefresh) {
        const data = initializeData(sid);
        setState(data);
        setInitialState(JSON.parse(JSON.stringify(data)));
        setHydrated(true);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setInitialState(JSON.parse(JSON.stringify(data)));
          setHydrated(true);
        });
      }
    } else {
      const data = initializeData();
      setState(data);
      setInitialState(JSON.parse(JSON.stringify(data)));
      setHydrated(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (hydrated) {
      saveState(state, sidRef.current);
    }
  }, [state, hydrated]);

  // Actions
  const addToCart = (product, quantity = 1) => {
    setState(prev => {
      const existing = prev.cart.find(item => item.productId === product.id);
      let newCart;
      if (existing) {
        newCart = prev.cart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prev.cart, { productId: product.id, quantity }];
      }
      return { ...prev, cart: newCart };
    });
  };

  const removeFromCart = (productId) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.productId !== productId)
    }));
  };

  const updateCartQty = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    setState(prev => ({
      ...prev,
      cart: prev.cart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    }));
  };

  const toggleWishlist = (productId) => {
    setState(prev => {
      const exists = prev.wishlist.includes(productId);
      return {
        ...prev,
        wishlist: exists
          ? prev.wishlist.filter(id => id !== productId)
          : [...prev.wishlist, productId]
      };
    });
  };

  const saveForLater = (productId) => {
    setState(prev => {
      const cartItem = prev.cart.find(item => item.productId === productId);
      if (!cartItem) return prev;

      const newCart = prev.cart.filter(item => item.productId !== productId);
      const newSaved = [...(prev.savedForLater || []), cartItem];

      return { ...prev, cart: newCart, savedForLater: newSaved };
    });
  };

  const moveToCart = (productId) => {
    setState(prev => {
      const savedItem = prev.savedForLater.find(item => item.productId === productId);
      if (!savedItem) return prev;

      const newSaved = prev.savedForLater.filter(item => item.productId !== productId);
      const existingCartItem = prev.cart.find(item => item.productId === productId);

      let newCart;
      if (existingCartItem) {
        newCart = prev.cart.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + savedItem.quantity }
            : item
        );
      } else {
        newCart = [...prev.cart, savedItem];
      }

      return { ...prev, cart: newCart, savedForLater: newSaved };
    });
  };

  const removeSavedItem = (productId) => {
    setState(prev => ({
      ...prev,
      savedForLater: (prev.savedForLater || []).filter(item => item.productId !== productId)
    }));
  };

  const addToRecentSearches = (term) => {
    setState(prev => {
      const filtered = prev.recentSearches.filter(t => t.toLowerCase() !== term.toLowerCase());
      return { ...prev, recentSearches: [term, ...filtered].slice(0, 10) };
    });
  };

  const addToRecentlyViewed = (productId) => {
    setState(prev => {
      const filtered = prev.recentlyViewed.filter(id => id !== productId);
      return { ...prev, recentlyViewed: [productId, ...filtered].slice(0, 10) };
    });
  };

  const placeOrder = (orderData) => {
    const newOrder = {
      id: `ord-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'Processing',
      ...orderData
    };
    setState(prev => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      cart: [] // Clear cart
    }));
    return newOrder.id;
  };

  const addReview = (review) => {
    setState(prev => ({
      ...prev,
      reviews: [...prev.reviews, { ...review, id: `rev-${Date.now()}`, date: new Date().toISOString(), helpful: 0 }]
    }));
  };

  const cancelOrder = (orderId) => {
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(order =>
        order.id === orderId ? { ...order, status: 'Cancelled' } : order
      )
    }));
  };

  const voteHelpful = (reviewId) => {
    setState(prev => ({
      ...prev,
      reviews: prev.reviews.map(r =>
        r.id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r
      )
    }));
  };

  const updateUserProfile = (profileData) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, ...profileData }
    }));
  };

  const addAddress = (address) => {
    setState(prev => {
      const newAddr = { ...address, id: `addr-${Date.now()}` };
      const addresses = [...(prev.user.addresses || [prev.user.address]), newAddr];
      return { ...prev, user: { ...prev.user, addresses } };
    });
  };

  const setDefaultAddress = (addressId) => {
    setState(prev => {
      const addresses = (prev.user.addresses || [prev.user.address]).map(a => ({ ...a, isDefault: a.id === addressId }));
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      return { ...prev, user: { ...prev.user, addresses, address: defaultAddr } };
    });
  };

  const addPaymentMethod = (pm) => {
    setState(prev => {
      const newPm = { ...pm, id: `pm-${Date.now()}` };
      const paymentMethods = [...(prev.user.paymentMethods || [prev.user.paymentMethod]), newPm];
      return { ...prev, user: { ...prev.user, paymentMethods } };
    });
  };

  const setDefaultPaymentMethod = (pmId) => {
    setState(prev => {
      const paymentMethods = (prev.user.paymentMethods || [prev.user.paymentMethod]).map(p => ({ ...p, isDefault: p.id === pmId }));
      const defaultPm = paymentMethods.find(p => p.isDefault) || paymentMethods[0];
      return { ...prev, user: { ...prev.user, paymentMethods, paymentMethod: defaultPm } };
    });
  };

  // Helper to get diff for /go endpoint
  const getStateDiff = () => {
    const diff = {};
    Object.keys(state).forEach(key => {
      if (JSON.stringify(state[key]) !== JSON.stringify(initialState[key])) {
        diff[key] = {
          from: initialState[key],
          to: state[key]
        };
      }
    });
    return diff;
  };

  return (
    <StoreContext.Provider value={{
      state,
      initialState,
      getStateDiff,
      addToCart,
      removeFromCart,
      updateCartQty,
      toggleWishlist,
      saveForLater,
      moveToCart,
      removeSavedItem,
      addToRecentSearches,
      addToRecentlyViewed,
      placeOrder,
      addReview,
      cancelOrder,
      voteHelpful,
      updateUserProfile,
      addAddress,
      setDefaultAddress,
      addPaymentMethod,
      setDefaultPaymentMethod,
    }}>
      {children}
    </StoreContext.Provider>
  );
};
