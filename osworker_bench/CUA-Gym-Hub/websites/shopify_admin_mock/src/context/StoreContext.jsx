
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getSessionId, fetchCustomState, saveState, initializeData, getInitialState } from '../lib/seed';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

const BASE_INITIAL_KEY = 'shopify_mock_initialState';

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

  const updateState = (path, value) => {
    setState(prev => {
      const newState = { ...prev };
      // Simple path update logic (e.g., 'products' or 'settings.storeName')
      if (path.includes('.')) {
        const [section, key] = path.split('.');
        newState[section] = { ...newState[section], [key]: value };
      } else {
        newState[path] = value;
      }
      return newState;
    });
  };

  // ---- Product Actions ----
  const addProduct = (product) => {
    const newProduct = { ...product, id: `p${Date.now()}`, variants: product.variants || [] };
    setState(prev => ({ ...prev, products: [newProduct, ...prev.products] }));
  };

  const updateProduct = (id, updates) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteProduct = (id) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  // ---- Order Actions ----
  const addOrder = (order) => {
    const orders = (state && state.orders) ? state.orders : [];
    const maxNum = orders.reduce((m, o) => Math.max(m, o.orderNumber || 0), 1000);
    const newOrderNumber = maxNum + 1;
    const newOrder = {
      ...order,
      id: `order_${Date.now()}`,
      name: `#${newOrderNumber}`,
      orderNumber: newOrderNumber,
      financialStatus: order.financialStatus || 'pending',
      fulfillmentStatus: order.fulfillmentStatus || null,
      currency: order.currency || 'USD',
      totalDiscounts: order.totalDiscounts || '0.00',
      discountCodes: order.discountCodes || [],
      tags: order.tags || [],
      note: order.note || '',
      timeline: [
        {
          id: `evt_${Date.now()}`,
          type: 'created',
          message: `Order #${newOrderNumber} was placed`,
          createdAt: new Date().toISOString(),
          user: 'Alex Chen',
        },
        ...(order.financialStatus === 'paid' ? [{
          id: `evt_${Date.now()}_paid`,
          type: 'paid',
          message: `Payment of $${order.totalPrice} was received`,
          createdAt: new Date().toISOString(),
          user: 'Alex Chen',
        }] : []),
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, orders: [newOrder, ...prev.orders] }));
    return newOrder;
  };

  const updateOrder = (id, updates) => {
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === id ? { ...o, ...updates } : o)
    }));
  };

  const deleteOrder = (id) => {
    setState(prev => ({
      ...prev,
      orders: prev.orders.filter(o => o.id !== id)
    }));
  };

  // ---- Customer Actions ----
  const addCustomer = (customer) => {
    const newCustomer = {
      ...customer,
      id: `c${Date.now()}`,
      ordersCount: 0,
      totalSpent: '0.00',
      verifiedEmail: true,
      acceptsMarketing: false,
      tags: customer.tags || [],
      note: customer.note || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, customers: [newCustomer, ...prev.customers] }));
  };

  const updateCustomer = (id, updates) => {
    setState(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
    }));
  };

  const deleteCustomer = (id) => {
    setState(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id)
    }));
  };

  // ---- Discount Actions ----
  const addDiscount = (discount) => {
    const newDiscount = { ...discount, id: `d${Date.now()}`, usage: 0, status: discount.status || 'active' };
    setState(prev => ({ ...prev, discounts: [newDiscount, ...prev.discounts] }));
  };

  const updateDiscount = (id, updates) => {
    setState(prev => ({
      ...prev,
      discounts: prev.discounts.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  };

  const deleteDiscount = (id) => {
    setState(prev => ({
      ...prev,
      discounts: prev.discounts.filter(d => d.id !== id)
    }));
  };

  // ---- Collection Actions ----
  const addCollection = (collection) => {
    const newCollection = {
      ...collection,
      id: `coll_${Date.now()}`,
      productIds: collection.productIds || [],
      productsCount: (collection.productIds || []).length,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, collections: [...(prev.collections || []), newCollection] }));
  };

  const updateCollection = (id, updates) => {
    setState(prev => ({
      ...prev,
      collections: (prev.collections || []).map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
    }));
  };

  const deleteCollection = (id) => {
    setState(prev => ({
      ...prev,
      collections: (prev.collections || []).filter(c => c.id !== id)
    }));
  };

  // ---- Page Actions ----
  const addPage = (page) => {
    const newPage = {
      ...page,
      id: `page_${Date.now()}`,
      published: page.published !== undefined ? page.published : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, pages: [...(prev.pages || []), newPage] }));
  };

  const updatePage = (id, updates) => {
    setState(prev => ({
      ...prev,
      pages: (prev.pages || []).map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
    }));
  };

  const deletePage = (id) => {
    setState(prev => ({
      ...prev,
      pages: (prev.pages || []).filter(p => p.id !== id)
    }));
  };

  // ---- Blog Post Actions ----
  const addBlogPost = (post) => {
    const newPost = {
      ...post,
      id: `blog_${Date.now()}`,
      published: post.published !== undefined ? post.published : true,
      publishedAt: post.published !== false ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, blogPosts: [...(prev.blogPosts || []), newPost] }));
  };

  const updateBlogPost = (id, updates) => {
    setState(prev => ({
      ...prev,
      blogPosts: (prev.blogPosts || []).map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteBlogPost = (id) => {
    setState(prev => ({
      ...prev,
      blogPosts: (prev.blogPosts || []).filter(p => p.id !== id)
    }));
  };

  // ---- Navigation Menu Actions ----
  const updateNavigationMenu = (id, updates) => {
    setState(prev => ({
      ...prev,
      navigationMenus: (prev.navigationMenus || []).map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  // ---- Draft Order Actions ----
  const addDraftOrder = (draft) => {
    const drafts = (state && state.draftOrders) ? state.draftOrders : [];
    const maxNum = drafts.reduce((m, d) => {
      const n = parseInt((d.name || '#D0').replace('#D', '')) || 0;
      return Math.max(m, n);
    }, 0);
    const newNum = maxNum + 1;
    const newDraft = {
      ...draft,
      id: `draft_${Date.now()}`,
      name: `#D${newNum}`,
      status: draft.status || 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, draftOrders: [...(prev.draftOrders || []), newDraft] }));
  };

  const updateDraftOrder = (id, updates) => {
    setState(prev => ({
      ...prev,
      draftOrders: (prev.draftOrders || []).map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)
    }));
  };

  const deleteDraftOrder = (id) => {
    setState(prev => ({
      ...prev,
      draftOrders: (prev.draftOrders || []).filter(d => d.id !== id)
    }));
  };

  // ---- State Diffing for /go endpoint ----
  const getDiff = () => {
    if (!initialStateRef || !state) return {};
    const diff = {};
    const keys = new Set([...Object.keys(initialStateRef), ...Object.keys(state)]);

    keys.forEach(key => {
      if (JSON.stringify(initialStateRef[key]) !== JSON.stringify(state[key])) {
        diff[key] = {
          original: initialStateRef[key],
          current: state[key]
        };
      }
    });
    return diff;
  };

  if (loading || !state) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={{
      state,
      initialState: initialStateRef,
      updateState,
      // Products
      addProduct,
      updateProduct,
      deleteProduct,
      // Orders
      addOrder,
      updateOrder,
      deleteOrder,
      // Customers
      addCustomer,
      updateCustomer,
      deleteCustomer,
      // Discounts
      addDiscount,
      updateDiscount,
      deleteDiscount,
      // Collections
      addCollection,
      updateCollection,
      deleteCollection,
      // Pages
      addPage,
      updatePage,
      deletePage,
      // Blog Posts
      addBlogPost,
      updateBlogPost,
      deleteBlogPost,
      // Navigation
      updateNavigationMenu,
      // Draft Orders
      addDraftOrder,
      updateDraftOrder,
      deleteDraftOrder,
      // State diff
      getDiff
    }}>
      {children}
    </StoreContext.Provider>
  );
};
