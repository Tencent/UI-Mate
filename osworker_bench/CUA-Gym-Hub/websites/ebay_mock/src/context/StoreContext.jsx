import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { INITIAL_STATE, getSessionId, fetchCustomState, saveState, initializeData } from '../data/mockData';

const StoreContext = createContext();

const ACTIONS = {
  PLACE_BID: 'PLACE_BID',
  BUY_NOW: 'BUY_NOW',
  ADD_WATCHLIST: 'ADD_WATCHLIST',
  REMOVE_WATCHLIST: 'REMOVE_WATCHLIST',
  SEND_MESSAGE: 'SEND_MESSAGE',
  MARK_MESSAGE_READ: 'MARK_MESSAGE_READ',
  CREATE_LISTING: 'CREATE_LISTING',
  EDIT_LISTING: 'EDIT_LISTING',
  END_LISTING: 'END_LISTING',
  LEAVE_FEEDBACK: 'LEAVE_FEEDBACK',
  INCREMENT_VIEWS: 'INCREMENT_VIEWS',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  MARK_ALL_NOTIFICATIONS_READ: 'MARK_ALL_NOTIFICATIONS_READ',
  SET_STATE: 'SET_STATE',
  RESET: 'RESET'
};

const BASE_INITIAL_KEY = 'ebay_mock_state_initialState';

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.PLACE_BID: {
      const { listingId, amount, userId } = action.payload;
      const listingIndex = state.listings.findIndex(l => l.id === listingId);
      if (listingIndex === -1) return state;

      const listing = state.listings[listingIndex];

      // Basic validation
      if (amount <= listing.currentBid) return state;

      const currentHighBidderId = listing.bids.length > 0 ? listing.bids[0].userId : null;
      const currentHighBidderMax = listing.bids.length > 0 ? (listing.bids[0].autoBidMax || listing.bids[0].amount) : 0;

      const increment = 1.00;

      let newCurrentBid = listing.currentBid;
      let newBids = [...listing.bids];
      let notifications = [...state.notifications];

      // Scenario 1: No previous bids
      if (listing.bids.length === 0) {
        newCurrentBid = listing.startingBid;

        const newBid = {
          id: `bid_${Date.now()}`,
          userId,
          amount: newCurrentBid,
          autoBidMax: amount,
          timestamp: Date.now()
        };
        newBids = [newBid, ...newBids];
      }
      // Scenario 2: New bid is higher than current price but LOWER than current leader's max
      else if (amount <= currentHighBidderMax && userId !== currentHighBidderId) {
        newCurrentBid = Math.min(amount + increment, currentHighBidderMax);

        const failedBid = {
          id: `bid_${Date.now()}_failed`,
          userId,
          amount: amount,
          autoBidMax: amount,
          timestamp: Date.now()
        };

        const autoBid = {
          id: `bid_${Date.now()}_auto`,
          userId: currentHighBidderId,
          amount: newCurrentBid,
          autoBidMax: currentHighBidderMax,
          timestamp: Date.now() + 1
        };

        newBids = [autoBid, failedBid, ...newBids];

        notifications.push({
          id: `notif_${Date.now()}`,
          userId: userId,
          message: `You were outbid by an automatic bid on ${listing.title}`,
          read: false
        });
      }
      // Scenario 3: New bid is HIGHER than current leader's max
      else if (amount > currentHighBidderMax) {
        newCurrentBid = Math.min(currentHighBidderMax + increment, amount);

        const newBid = {
          id: `bid_${Date.now()}`,
          userId,
          amount: newCurrentBid,
          autoBidMax: amount,
          timestamp: Date.now()
        };

        newBids = [newBid, ...newBids];

        if (currentHighBidderId && currentHighBidderId !== userId) {
          notifications.push({
            id: `notif_${Date.now()}`,
            userId: currentHighBidderId,
            message: `You were outbid on ${listing.title}. Place a higher bid to win!`,
            read: false
          });
        }
      }
      // Scenario 4: Updating own max bid
      else if (userId === currentHighBidderId) {
         const myLatestBid = newBids[0];
         newBids[0] = { ...myLatestBid, autoBidMax: amount };
      }

      const updatedListing = {
        ...listing,
        currentBid: newCurrentBid,
        bids: newBids
      };

      const newListings = [...state.listings];
      newListings[listingIndex] = updatedListing;

      return { ...state, listings: newListings, notifications };
    }

    case ACTIONS.BUY_NOW: {
      const { listingId, userId } = action.payload;
      const listingIndex = state.listings.findIndex(l => l.id === listingId);
      if (listingIndex === -1) return state;

      const listing = state.listings[listingIndex];
      const updatedListing = { ...listing, status: 'sold', endTime: Date.now() };

      const newListings = [...state.listings];
      newListings[listingIndex] = updatedListing;

      const newOrder = {
        id: `order_${Date.now()}`,
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
        amount: listing.buyItNowPrice || listing.price,
        date: Date.now(),
        status: 'paid'
      };

      return {
        ...state,
        listings: newListings,
        orders: [...state.orders, newOrder]
      };
    }

    case ACTIONS.ADD_WATCHLIST: {
      const { listingId, userId } = action.payload;
      const listingIndex = state.listings.findIndex(l => l.id === listingId);
      if (listingIndex === -1) return state;

      const listing = state.listings[listingIndex];
      if (listing.watchers.includes(userId)) return state;

      const updatedListing = {
        ...listing,
        watchers: [...listing.watchers, userId]
      };

      const newListings = [...state.listings];
      newListings[listingIndex] = updatedListing;

      return { ...state, listings: newListings };
    }

    case ACTIONS.REMOVE_WATCHLIST: {
      const { listingId, userId } = action.payload;
      const listingIndex = state.listings.findIndex(l => l.id === listingId);
      if (listingIndex === -1) return state;

      const listing = state.listings[listingIndex];
      const updatedListing = {
        ...listing,
        watchers: listing.watchers.filter(id => id !== userId)
      };

      const newListings = [...state.listings];
      newListings[listingIndex] = updatedListing;

      return { ...state, listings: newListings };
    }

    case ACTIONS.SEND_MESSAGE: {
      const { toId, listingId, content, subject } = action.payload;
      const newMessage = {
        id: `msg_${Date.now()}`,
        fromId: state.currentUser.id,
        toId,
        listingId,
        subject,
        content,
        read: false,
        timestamp: Date.now()
      };
      return { ...state, messages: [...state.messages, newMessage] };
    }

    case ACTIONS.MARK_MESSAGE_READ: {
      const { messageId } = action.payload;
      const newMessages = state.messages.map(m =>
        m.id === messageId ? { ...m, read: true } : m
      );
      return { ...state, messages: newMessages };
    }

    case ACTIONS.CREATE_LISTING: {
      const { listing } = action.payload;
      const newListing = {
        ...listing,
        id: `item_${Date.now()}`,
        sellerId: state.currentUser.id,
        bids: [],
        watchers: [],
        views: 0,
        status: 'active'
      };
      return { ...state, listings: [...state.listings, newListing] };
    }

    case ACTIONS.EDIT_LISTING: {
      const { listingId, updates, userId } = action.payload;
      const listingIndex = state.listings.findIndex(l => l.id === listingId);
      if (listingIndex === -1) return state;
      const listing = state.listings[listingIndex];
      if (listing.sellerId !== userId) return state;
      const updatedListing = { ...listing, ...updates };
      const newListings = [...state.listings];
      newListings[listingIndex] = updatedListing;
      return { ...state, listings: newListings };
    }

    case ACTIONS.END_LISTING: {
      const { listingId, userId } = action.payload;
      const listingIndex = state.listings.findIndex(l => l.id === listingId);
      if (listingIndex === -1) return state;

      const listing = state.listings[listingIndex];
      if (listing.sellerId !== userId) return state;

      const updatedListing = {
        ...listing,
        status: 'ended',
        endTime: Date.now()
      };

      const newListings = [...state.listings];
      newListings[listingIndex] = updatedListing;

      return { ...state, listings: newListings };
    }

    case ACTIONS.LEAVE_FEEDBACK: {
      const { orderId, rating, comment, fromUserId, toUserId } = action.payload;

      const newFeedback = {
        id: `fb_${Date.now()}`,
        orderId,
        fromUserId,
        toUserId,
        rating,
        comment,
        created: Date.now()
      };

      const userIndex = state.users.findIndex(u => u.id === toUserId);
      let newUsers = [...state.users];

      if (userIndex !== -1) {
        const user = newUsers[userIndex];
        const scoreChange = rating === 'positive' ? 1 : (rating === 'negative' ? -1 : 0);
        newUsers[userIndex] = {
          ...user,
          feedbackScore: user.feedbackScore + scoreChange
        };
      }

      let currentUser = state.currentUser;
      if (currentUser.id === toUserId) {
        const scoreChange = rating === 'positive' ? 1 : (rating === 'negative' ? -1 : 0);
        currentUser = { ...currentUser, feedbackScore: currentUser.feedbackScore + scoreChange };
      }

      return {
        ...state,
        users: newUsers,
        currentUser: currentUser,
        feedbacks: [...(state.feedbacks || []), newFeedback]
      };
    }

    case ACTIONS.INCREMENT_VIEWS: {
      const { listingId } = action.payload;
      const listingIndex = state.listings.findIndex(l => l.id === listingId);
      if (listingIndex === -1) return state;

      const listing = state.listings[listingIndex];
      const updatedListing = { ...listing, views: (listing.views || 0) + 1 };

      const newListings = [...state.listings];
      newListings[listingIndex] = updatedListing;

      return { ...state, listings: newListings };
    }

    case ACTIONS.ADD_TO_CART: {
      const { listingId } = action.payload;
      const cart = state.cart || [];
      if (cart.includes(listingId)) return state;
      return { ...state, cart: [...cart, listingId] };
    }

    case ACTIONS.REMOVE_FROM_CART: {
      const { listingId } = action.payload;
      const cart = state.cart || [];
      return { ...state, cart: cart.filter(id => id !== listingId) };
    }

    case ACTIONS.CLEAR_CART: {
      return { ...state, cart: [] };
    }

    case ACTIONS.MARK_NOTIFICATION_READ: {
      const { notifId } = action.payload;
      const newNotifications = state.notifications.map(n =>
        n.id === notifId ? { ...n, read: true } : n
      );
      return { ...state, notifications: newNotifications };
    }

    case ACTIONS.MARK_ALL_NOTIFICATIONS_READ: {
      const newNotifications = state.notifications.map(n => ({ ...n, read: true }));
      return { ...state, notifications: newNotifications };
    }

    case ACTIONS.SET_STATE:
      return { ...state, ...action.payload };

    case ACTIONS.RESET:
      return INITIAL_STATE;

    default:
      return state;
  }
}

export const StoreProvider = ({ children }) => {
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);
  const [hydrated, setHydrated] = useState(false);

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, (initial) => {
    return initial;
  });

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
        dispatch({ type: ACTIONS.SET_STATE, payload: data });
        setHydrated(true);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          dispatch({ type: ACTIONS.SET_STATE, payload: data });
          setHydrated(true);
        });
      }
    } else {
      const data = initializeData();
      dispatch({ type: ACTIONS.SET_STATE, payload: data });
      setHydrated(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (hydrated) {
      saveState(state, sidRef.current);
    }
  }, [state, hydrated]);

  const placeBid = (listingId, amount) => {
    dispatch({ type: ACTIONS.PLACE_BID, payload: { listingId, amount, userId: state.currentUser.id } });
  };

  const buyNow = (listingId) => {
    dispatch({ type: ACTIONS.BUY_NOW, payload: { listingId, userId: state.currentUser.id } });
  };

  const toggleWatchlist = (listingId) => {
    const listing = state.listings.find(l => l.id === listingId);
    if (listing.watchers.includes(state.currentUser.id)) {
      dispatch({ type: ACTIONS.REMOVE_WATCHLIST, payload: { listingId, userId: state.currentUser.id } });
    } else {
      dispatch({ type: ACTIONS.ADD_WATCHLIST, payload: { listingId, userId: state.currentUser.id } });
    }
  };

  const sendMessage = (toId, listingId, subject, content) => {
    dispatch({ type: ACTIONS.SEND_MESSAGE, payload: { toId, listingId, subject, content } });
  };

  const createListing = (listing) => {
    dispatch({ type: ACTIONS.CREATE_LISTING, payload: { listing } });
  };

  const endListing = (listingId) => {
    dispatch({ type: ACTIONS.END_LISTING, payload: { listingId, userId: state.currentUser.id } });
  };

  const leaveFeedback = (orderId, toUserId, rating, comment) => {
    dispatch({ type: ACTIONS.LEAVE_FEEDBACK, payload: {
      orderId,
      toUserId,
      rating,
      comment,
      fromUserId: state.currentUser.id
    }});
  };

  const incrementViews = (listingId) => {
    dispatch({ type: ACTIONS.INCREMENT_VIEWS, payload: { listingId } });
  };

  const markMessageRead = (messageId) => {
    dispatch({ type: ACTIONS.MARK_MESSAGE_READ, payload: { messageId } });
  };

  const editListing = (listingId, updates) => {
    dispatch({ type: ACTIONS.EDIT_LISTING, payload: { listingId, updates, userId: state.currentUser.id } });
  };

  const addToCart = (listingId) => {
    dispatch({ type: ACTIONS.ADD_TO_CART, payload: { listingId } });
  };

  const removeFromCart = (listingId) => {
    dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: { listingId } });
  };

  const clearCart = () => {
    dispatch({ type: ACTIONS.CLEAR_CART });
  };

  const markNotificationRead = (notifId) => {
    dispatch({ type: ACTIONS.MARK_NOTIFICATION_READ, payload: { notifId } });
  };

  const markAllNotificationsRead = () => {
    dispatch({ type: ACTIONS.MARK_ALL_NOTIFICATIONS_READ });
  };

  return (
    <StoreContext.Provider value={{
      state,
      dispatch,
      placeBid,
      buyNow,
      toggleWatchlist,
      sendMessage,
      markMessageRead,
      createListing,
      editListing,
      endListing,
      leaveFeedback,
      incrementViews,
      addToCart,
      removeFromCart,
      clearCart,
      markNotificationRead,
      markAllNotificationsRead
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
