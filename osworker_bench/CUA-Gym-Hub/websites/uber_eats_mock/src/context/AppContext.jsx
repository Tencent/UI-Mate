import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getSessionId, fetchCustomState, saveState, initializeData, initialKey, generateId } from '../utils/dataManager';
import { computeStateDiff } from '../utils/stateTracker';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(null);
  const [initialStateSnapshot, setInitialStateSnapshot] = useState(null);
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
      const initial = JSON.parse(localStorage.getItem(ik));
      setState(data);
      setInitialStateSnapshot(initial);
      setLoading(false);
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        setState(data);
        setInitialStateSnapshot(JSON.parse(JSON.stringify(data)));
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  // --- Actions ---

  const addToCart = useCallback((menuItem, restaurant, quantity, selectedOptions, specialInstructions) => {
    setState(prev => {
      if (!prev) return prev;
      const modifierTotal = selectedOptions.reduce((s, o) => s + o.priceModifier, 0);
      const cartItem = {
        id: generateId(),
        menuItemId: menuItem.id,
        restaurantId: restaurant.id,
        name: menuItem.name,
        quantity,
        basePrice: menuItem.price,
        selectedOptions: selectedOptions.map(o => ({
          groupId: o.groupId || '',
          groupName: o.groupName || '',
          optionId: o.optionId || o.id || '',
          optionName: o.optionName || o.name,
          priceModifier: o.priceModifier
        })),
        specialInstructions: specialInstructions || '',
        totalPrice: (menuItem.price + modifierTotal) * quantity
      };

      // If adding from a different restaurant, clear cart first
      if (prev.cart.restaurantId && prev.cart.restaurantId !== restaurant.id) {
        return {
          ...prev,
          cart: {
            ...prev.cart,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            items: [cartItem]
          }
        };
      }

      return {
        ...prev,
        cart: {
          ...prev.cart,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          items: [...prev.cart.items, cartItem]
        }
      };
    });
  }, []);

  const removeFromCart = useCallback((cartItemId) => {
    setState(prev => {
      if (!prev) return prev;
      const newItems = prev.cart.items.filter(i => i.id !== cartItemId);
      return {
        ...prev,
        cart: {
          ...prev.cart,
          restaurantId: newItems.length === 0 ? null : prev.cart.restaurantId,
          restaurantName: newItems.length === 0 ? null : prev.cart.restaurantName,
          items: newItems
        }
      };
    });
  }, []);

  const updateCartItemQuantity = useCallback((cartItemId, newQuantity) => {
    setState(prev => {
      if (!prev) return prev;
      if (newQuantity < 1) {
        const newItems = prev.cart.items.filter(i => i.id !== cartItemId);
        return {
          ...prev,
          cart: {
            ...prev.cart,
            restaurantId: newItems.length === 0 ? null : prev.cart.restaurantId,
            restaurantName: newItems.length === 0 ? null : prev.cart.restaurantName,
            items: newItems
          }
        };
      }
      return {
        ...prev,
        cart: {
          ...prev.cart,
          items: prev.cart.items.map(item => {
            if (item.id !== cartItemId) return item;
            const modTotal = item.selectedOptions.reduce((s, o) => s + o.priceModifier, 0);
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: (item.basePrice + modTotal) * newQuantity
            };
          })
        }
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        cart: {
          restaurantId: null, restaurantName: null, items: [],
          deliveryMode: prev.cart.deliveryMode, scheduledTime: null,
          promoCode: null, promoDiscount: 0, tipAmount: 0, tipPercentage: 18,
          deliveryInstructions: ''
        }
      };
    });
  }, []);

  const placeOrder = useCallback((orderData) => {
    const orderId = 'ord_' + Date.now().toString(36);
    setState(prev => {
      if (!prev) return prev;
      const cart = prev.cart;
      const restaurant = prev.restaurants.find(r => r.id === cart.restaurantId);
      const subtotal = cart.items.reduce((s, item) => s + item.totalPrice, 0);
      const serviceFee = Math.min(Math.max(subtotal * 0.15, 0.99), 9.99);
      const deliveryFee = restaurant ? restaurant.deliveryFee : 0;
      const tax = subtotal * 0.09;
      const tipAmount = cart.tipPercentage ? subtotal * (cart.tipPercentage / 100) : cart.tipAmount;
      const total = subtotal + serviceFee + deliveryFee + tax + tipAmount - cart.promoDiscount;

      const now = new Date();
      const delivTimeMin = restaurant ? restaurant.deliveryTimeMin : 25;
      const delivTimeMax = restaurant ? restaurant.deliveryTimeMax : 40;

      const selectedAddr = prev.user.addresses.find(a => a.id === prev.ui.selectedAddressId) || prev.user.addresses[0];

      const newOrder = {
        id: orderId,
        restaurantId: cart.restaurantId,
        restaurantName: cart.restaurantName || (restaurant ? restaurant.name : ''),
        restaurantImageUrl: restaurant ? restaurant.imageUrl : '',
        items: cart.items.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.basePrice + item.selectedOptions.reduce((s, o) => s + o.priceModifier, 0),
          totalPrice: item.totalPrice,
          selectedOptions: item.selectedOptions.map(o => o.optionName),
          specialInstructions: item.specialInstructions
        })),
        status: 'placed',
        placedAt: now.toISOString(),
        estimatedDeliveryMin: new Date(now.getTime() + delivTimeMin * 60000).toISOString(),
        estimatedDeliveryMax: new Date(now.getTime() + delivTimeMax * 60000).toISOString(),
        deliveredAt: null,
        deliveryAddress: selectedAddr,
        deliveryMode: cart.deliveryMode,
        subtotal: Math.round(subtotal * 100) / 100,
        serviceFee: Math.round(serviceFee * 100) / 100,
        deliveryFee: Math.round(deliveryFee * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        tip: Math.round(tipAmount * 100) / 100,
        promoDiscount: cart.promoDiscount,
        total: Math.round(total * 100) / 100,
        paymentMethod: prev.user.paymentMethods.find(p => p.isDefault)?.label || 'Visa \u2022\u2022\u2022\u2022 4242',
        deliveryPerson: (() => {
          const pool = [
            { id: 'dp_1', name: 'Marcus R.', photoUrl: '', vehicleType: 'car', rating: 4.9 },
            { id: 'dp_2', name: 'Sarah L.', photoUrl: '', vehicleType: 'bike', rating: 4.8 },
            { id: 'dp_3', name: 'James K.', photoUrl: '', vehicleType: 'car', rating: 4.7 },
            { id: 'dp_4', name: 'Priya M.', photoUrl: '', vehicleType: 'bike', rating: 4.6 }
          ];
          return pool[Math.floor(Math.random() * pool.length)];
        })(),
        rating: null,
        review: null
      };

      return {
        ...prev,
        orders: [newOrder, ...prev.orders],
        activeOrderId: orderId,
        cart: {
          restaurantId: null, restaurantName: null, items: [],
          deliveryMode: prev.cart.deliveryMode, scheduledTime: null,
          promoCode: null, promoDiscount: 0, tipAmount: 0, tipPercentage: 18,
          deliveryInstructions: ''
        }
      };
    });
    return orderId;
  }, []);

  const toggleFavorite = useCallback((restaurantId) => {
    setState(prev => {
      if (!prev) return prev;
      const favs = prev.user.favoriteRestaurantIds;
      const isFav = favs.includes(restaurantId);
      return {
        ...prev,
        user: {
          ...prev.user,
          favoriteRestaurantIds: isFav
            ? favs.filter(id => id !== restaurantId)
            : [...favs, restaurantId]
        }
      };
    });
  }, []);

  const setDeliveryMode = useCallback((mode) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        cart: { ...prev.cart, deliveryMode: mode },
        ui: { ...prev.ui, deliveryMode: mode }
      };
    });
  }, []);

  const updateFilters = useCallback((filters) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ui: { ...prev.ui, activeFilters: { ...prev.ui.activeFilters, ...filters } }
      };
    });
  }, []);

  const setSearchQuery = useCallback((query) => {
    setState(prev => {
      if (!prev) return prev;
      const recentSearches = prev.ui.recentSearches || [];
      let updated = recentSearches;
      if (query && !recentSearches.includes(query)) {
        updated = [query, ...recentSearches].slice(0, 5);
      }
      return {
        ...prev,
        ui: { ...prev.ui, searchQuery: query, recentSearches: updated }
      };
    });
  }, []);

  const rateOrder = useCallback((orderId, rating, review) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        orders: prev.orders.map(o =>
          o.id === orderId ? { ...o, rating, review: review || null } : o
        )
      };
    });
  }, []);

  const updateAddress = useCallback((addressId) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ui: { ...prev.ui, selectedAddressId: addressId }
      };
    });
  }, []);

  const updateDefaultPayment = useCallback((paymentId) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        user: {
          ...prev.user,
          defaultPaymentId: paymentId,
          paymentMethods: prev.user.paymentMethods.map(pm => ({
            ...pm,
            isDefault: pm.id === paymentId
          }))
        }
      };
    });
  }, []);

  const setTip = useCallback((amount, percentage) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        cart: { ...prev.cart, tipAmount: amount || 0, tipPercentage: percentage }
      };
    });
  }, []);

  const applyPromoCode = useCallback((code) => {
    setState(prev => {
      if (!prev) return prev;
      const promo = prev.promotions.find(p => p.code && p.code.toLowerCase() === code.toLowerCase());
      if (!promo) {
        return prev; // Invalid code
      }
      // Check expiration date
      if (promo.expiresAt) {
        const expiry = new Date(promo.expiresAt);
        expiry.setHours(23, 59, 59, 999);
        if (new Date() > expiry) {
          return prev; // Promo has expired
        }
      }
      // Check restaurant-specific restriction
      if (promo.restaurantId && prev.cart.restaurantId !== promo.restaurantId) {
        return prev; // Promo not valid for this restaurant
      }
      const subtotal = prev.cart.items.reduce((s, item) => s + item.totalPrice, 0);
      if (subtotal < promo.minOrder) {
        return prev; // Minimum not met
      }
      let discount = 0;
      if (promo.discountAmount > 0) {
        discount = promo.discountAmount;
      } else if (promo.discountPercent > 0) {
        discount = subtotal * (promo.discountPercent / 100);
      }
      return {
        ...prev,
        cart: {
          ...prev.cart,
          promoCode: code,
          promoDiscount: Math.round(discount * 100) / 100
        }
      };
    });
  }, []);

  const updateUser = useCallback((fields) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        user: { ...prev.user, ...fields }
      };
    });
  }, []);

  const updateDeliveryInstructions = useCallback((instructions) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        cart: { ...prev.cart, deliveryInstructions: instructions }
      };
    });
  }, []);

  const activateUberOne = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        user: { ...prev.user, uberOneActive: true }
      };
    });
  }, []);

  const addAddress = useCallback((address) => {
    setState(prev => {
      if (!prev) return prev;
      const newAddr = { ...address, id: 'addr_' + Date.now().toString(36) };
      const updatedAddresses = [...prev.user.addresses, newAddr];
      return {
        ...prev,
        user: { ...prev.user, addresses: updatedAddresses }
      };
    });
  }, []);

  const updateOrderStatus = useCallback((orderId, status) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        orders: prev.orders.map(o => {
          if (o.id !== orderId) return o;
          const updates = { status };
          if (status === 'delivered') {
            updates.deliveredAt = new Date().toISOString();
          }
          return { ...o, ...updates };
        })
      };
    });
  }, []);

  const getDebugState = useCallback(() => {
    return {
      initial_state: initialStateSnapshot,
      current_state: state,
      state_diff: computeStateDiff(initialStateSnapshot, state)
    };
  }, [state, initialStateSnapshot]);

  if (loading || !state) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fff', fontFamily: 'var(--font-family)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            <span style={{ color: '#000' }}>Uber </span>
            <span style={{ color: '#06C167' }}>Eats</span>
          </div>
          <p style={{ color: '#6B6B6B', marginTop: '12px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      state,
      initialState: initialStateSnapshot,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      placeOrder,
      toggleFavorite,
      setDeliveryMode,
      updateFilters,
      setSearchQuery,
      rateOrder,
      updateAddress,
      updateDefaultPayment,
      setTip,
      applyPromoCode,
      updateOrderStatus,
      getDebugState,
      updateUser,
      updateDeliveryInstructions,
      activateUberOne,
      addAddress
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
