
    import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
    import { generateInitialState, getSessionId, fetchCustomState, saveState, initializeData } from '../lib/mockData';
    import { generateId } from '../lib/utils';

    const StoreContext = createContext();

    const BASE_INITIAL_KEY = 'food_delivery_initialState';

    export const StoreProvider = ({ children }) => {
      const [initialStateRef, setInitialStateRef] = useState(null);
      const [state, setState] = useState(null);
      const [loading, setLoading] = useState(true);
      const [pendingCartSwitch, setPendingCartSwitch] = useState(null);

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

      // Save on change
      useEffect(() => {
        if (!loading && state) {
          saveState(state, sidRef.current);
        }
      }, [state, loading]);

      // Order Status Simulation
      useEffect(() => {
        if (loading || !state) return;

        const interval = setInterval(() => {
          setState(curr => {
            if (!curr) return curr;
            const activeOrders = curr.orders.filter(o =>
              ['preparing', 'picked_up', 'delivering'].includes(o.status)
            );

            if (activeOrders.length === 0) return curr;

            const updatedOrders = curr.orders.map(order => {
              if (order.status === 'preparing' && Date.now() - order.created > 10000) { // 10s to pickup
                return { ...order, status: 'picked_up' };
              }
              if (order.status === 'picked_up' && Date.now() - order.created > 20000) { // 20s to delivering
                return { ...order, status: 'delivering' };
              }
              if (order.status === 'delivering' && Date.now() - order.created > 30000) { // 30s to delivered
                return { ...order, status: 'delivered' };
              }
              return order;
            });

            return { ...curr, orders: updatedOrders };
          });
        }, 3000);

        return () => clearInterval(interval);
      }, [loading]);

      // Actions
      const addToCart = (item, quantity, modifiers, instructions) => {
        if (state.cart.restaurantId && state.cart.restaurantId !== item.restaurantId) {
          setPendingCartSwitch({ item, quantity, modifiers, instructions });
          return;
        }

        setState(curr => {
          // Same restaurant or empty cart
          return {
            ...curr,
            cart: {
              restaurantId: item.restaurantId,
              items: [...curr.cart.items, {
                cartItemId: generateId(),
                menuItem: item,
                quantity,
                modifiers,
                instructions
              }]
            }
          };
        });
      };

      const confirmCartSwitch = () => {
        if (!pendingCartSwitch) return;
        const { item, quantity, modifiers, instructions } = pendingCartSwitch;

        setState(curr => ({
          ...curr,
          cart: {
            restaurantId: item.restaurantId,
            items: [{
              cartItemId: generateId(),
              menuItem: item,
              quantity,
              modifiers,
              instructions
            }]
          }
        }));
        setPendingCartSwitch(null);
      };

      const cancelCartSwitch = () => {
        setPendingCartSwitch(null);
      };

      const removeFromCart = (cartItemId) => {
        setState(curr => {
          const newItems = curr.cart.items.filter(i => i.cartItemId !== cartItemId);
          return {
            ...curr,
            cart: {
              ...curr.cart,
              restaurantId: newItems.length === 0 ? null : curr.cart.restaurantId,
              items: newItems
            }
          };
        });
      };

      const updateCartItemQuantity = (cartItemId, delta) => {
        setState(curr => {
          const newItems = curr.cart.items.map(item => {
            if (item.cartItemId === cartItemId) {
              const newQty = Math.max(1, item.quantity + delta);
              return { ...item, quantity: newQty };
            }
            return item;
          });
          return { ...curr, cart: { ...curr.cart, items: newItems } };
        });
      };

      const placeOrder = (deliveryDetails) => {
        const orderId = generateId();
        const newOrder = {
          id: orderId,
          userId: state.user.id,
          restaurantId: state.cart.restaurantId,
          items: [...state.cart.items],
          status: 'preparing',
          created: Date.now(),
          deliveryDetails,
          total: calculateCartTotal(state.cart.items)
        };

        setState(curr => ({
          ...curr,
          orders: [newOrder, ...curr.orders],
          cart: { restaurantId: null, items: [] }
        }));

        return orderId;
      };

      const reorder = (orderId) => {
        setState(curr => {
          const order = curr.orders.find(o => o.id === orderId);
          if (!order) return curr;
          return {
            ...curr,
            cart: {
              restaurantId: order.restaurantId,
              items: order.items.map(item => ({
                ...item,
                cartItemId: generateId()
              }))
            }
          };
        });
      };

      const toggleFavorite = (restaurantId) => {
        setState(curr => {
          const isFav = curr.favorites.includes(restaurantId);
          return {
            ...curr,
            favorites: isFav
              ? curr.favorites.filter(id => id !== restaurantId)
              : [...curr.favorites, restaurantId]
          };
        });
      };

      const calculateCartTotal = (items) => {
        const subtotal = items.reduce((sum, item) => {
          const modTotal = Object.values(item.modifiers).flatMap(m => Array.isArray(m) ? m : [m]).reduce((mSum, m) => mSum + (m.price || 0), 0);
          return sum + ((item.menuItem.price + modTotal) * item.quantity);
        }, 0);
        const fee = 2.99; // Mock fee
        const tax = subtotal * 0.08;
        return { subtotal, fee, tax, total: subtotal + fee + tax };
      };

      const getDebugState = () => {
        return {
          initial_state: initialStateRef,
          current_state: state,
          state_diff: calculateDiff(initialStateRef, state)
        };
      };

      if (loading || !state) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fff' }}>Loading...</div>;
      }

      return (
        <StoreContext.Provider value={{
          state,
          initialState: initialStateRef,
          pendingCartSwitch,
          addToCart,
          confirmCartSwitch,
          cancelCartSwitch,
          removeFromCart,
          updateCartItemQuantity,
          placeOrder,
          reorder,
          toggleFavorite,
          calculateCartTotal,
          getDebugState
        }}>
          {children}
        </StoreContext.Provider>
      );
    };

    export const useStore = () => useContext(StoreContext);

    // Simple diff helper
    function calculateDiff(obj1, obj2) {
      if (!obj1 || !obj2) return {};
      const diff = {};
      for (let key in obj2) {
        if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          diff[key] = { from: obj1[key], to: obj2[key] };
        }
      }
      return diff;
    }
