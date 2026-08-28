import React, { createContext, useState, useEffect, useRef } from 'react';
import { initializeData, getInitialState, fetchCustomState, getSessionId, saveState, calculateStateDiff } from '../utils/dataManager';
import { generateId } from '../utils/helpers';

export const CoinbaseContext = createContext();
const FEE_RATE = 0.0149;

export function CoinbaseProvider({ children }) {
  const [state, setState] = useState(null);
  const [initialStateRef, setInitialStateRef] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      const sessionKey = `coinbase_mock_initialState_${sid}`;
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

  // Auto-save to localStorage on state change
  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  // Live price simulation - fluctuate prices every 5 seconds
  useEffect(() => {
    if (!state) return;

    const interval = setInterval(() => {
      setState(prev => {
        if (!prev || !prev.assets) return prev;

        const updatedAssets = prev.assets.map(asset => {
          const changePercent = (Math.random() * 0.01) - 0.005; // +/- 0.5%
          const newPrice = Math.max(0.001, asset.currentPrice * (1 + changePercent));

          return {
            ...asset,
            currentPrice: parseFloat(newPrice.toPrecision(asset.currentPrice >= 1 ? 7 : 4))
          };
        });

        return { ...prev, assets: updatedAssets };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [loading]);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const buyAsset = (assetId, usdAmount) => {
    setState(prev => {
      const asset = prev.assets.find(a => a.id === assetId);
      if (!asset) return prev;

      const fee = parseFloat((usdAmount * FEE_RATE).toFixed(2)) || 0.99;
      const totalCost = usdAmount + fee;

      if (prev.currentUser.cashBalance < totalCost) return prev;

      const quantity = usdAmount / asset.currentPrice;
      const existingHolding = prev.holdings.find(h => h.assetId === assetId);

      let newHoldings;
      if (existingHolding) {
        const newQty = existingHolding.quantity + quantity;
        const newAvg = ((existingHolding.quantity * existingHolding.avgBuyPrice) + usdAmount) / newQty;
        newHoldings = prev.holdings.map(h =>
          h.assetId === assetId ? { ...h, quantity: newQty, avgBuyPrice: newAvg } : h
        );
      } else {
        newHoldings = [...prev.holdings, { assetId, quantity, avgBuyPrice: asset.currentPrice }];
      }

      const newTx = {
        id: generateId('tx'),
        type: 'buy',
        assetId,
        quantity,
        pricePerUnit: asset.currentPrice,
        totalAmount: usdAmount,
        fee,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      const newNotif = {
        id: generateId('notif'),
        type: 'trade_completed',
        message: `Your purchase of ${quantity.toFixed(6)} ${asset.symbol} was completed`,
        timestamp: new Date().toISOString(),
        read: false,
        assetId
      };

      return {
        ...prev,
        currentUser: { ...prev.currentUser, cashBalance: prev.currentUser.cashBalance - totalCost },
        holdings: newHoldings,
        transactions: [newTx, ...prev.transactions],
        notifications: [newNotif, ...prev.notifications]
      };
    });
  };

  const sellAsset = (assetId, quantity) => {
    setState(prev => {
      const asset = prev.assets.find(a => a.id === assetId);
      if (!asset) return prev;

      const holding = prev.holdings.find(h => h.assetId === assetId);
      if (!holding || holding.quantity < quantity) return prev;

      const usdAmount = quantity * asset.currentPrice;
      const fee = parseFloat((usdAmount * FEE_RATE).toFixed(2)) || 0.99;
      const proceeds = usdAmount - fee;

      const newQty = holding.quantity - quantity;
      let newHoldings;
      if (newQty <= 0.000001) {
        newHoldings = prev.holdings.filter(h => h.assetId !== assetId);
      } else {
        newHoldings = prev.holdings.map(h =>
          h.assetId === assetId ? { ...h, quantity: newQty } : h
        );
      }

      const newTx = {
        id: generateId('tx'),
        type: 'sell',
        assetId,
        quantity,
        pricePerUnit: asset.currentPrice,
        totalAmount: usdAmount,
        fee,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      const newNotif = {
        id: generateId('notif'),
        type: 'trade_completed',
        message: `Your sale of ${quantity.toFixed(6)} ${asset.symbol} was completed`,
        timestamp: new Date().toISOString(),
        read: false,
        assetId
      };

      return {
        ...prev,
        currentUser: { ...prev.currentUser, cashBalance: prev.currentUser.cashBalance + proceeds },
        holdings: newHoldings,
        transactions: [newTx, ...prev.transactions],
        notifications: [newNotif, ...prev.notifications]
      };
    });
  };

  const sendAsset = (assetId, quantity, address) => {
    setState(prev => {
      const asset = prev.assets.find(a => a.id === assetId);
      if (!asset) return prev;

      const holding = prev.holdings.find(h => h.assetId === assetId);
      if (!holding || holding.quantity < quantity) return prev;

      const fee = parseFloat((quantity * asset.currentPrice * FEE_RATE).toFixed(2));
      const newQty = holding.quantity - quantity;
      let newHoldings;
      if (newQty <= 0.000001) {
        newHoldings = prev.holdings.filter(h => h.assetId !== assetId);
      } else {
        newHoldings = prev.holdings.map(h =>
          h.assetId === assetId ? { ...h, quantity: newQty } : h
        );
      }

      const newTx = {
        id: generateId('tx'),
        type: 'send',
        assetId,
        quantity,
        pricePerUnit: asset.currentPrice,
        totalAmount: quantity * asset.currentPrice,
        fee,
        toAddress: address,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      const newNotif = {
        id: generateId('notif'),
        type: 'trade_completed',
        message: `You sent ${quantity.toFixed(6)} ${asset.symbol} to ${address}`,
        timestamp: new Date().toISOString(),
        read: false,
        assetId
      };

      return {
        ...prev,
        holdings: newHoldings,
        transactions: [newTx, ...prev.transactions],
        notifications: [newNotif, ...prev.notifications]
      };
    });
  };

  const toggleWatchlist = (assetId) => {
    setState(prev => {
      const newWatchlist = prev.watchlist.includes(assetId)
        ? prev.watchlist.filter(id => id !== assetId)
        : [...prev.watchlist, assetId];
      return { ...prev, watchlist: newWatchlist };
    });
  };

  const markNotificationRead = (notifId) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === notifId ? { ...n, read: true } : n
      )
    }));
  };

  const markAllNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
  };

  const getGoData = () => {
    const initial = initialStateRef || state;
    const diff = calculateStateDiff(initial, state);
    return {
      initial_state: initial,
      current_state: state,
      state_diff: diff
    };
  };

  if (loading || !state) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fff' }}>
        Loading...
      </div>
    );
  }

  const value = {
    state,
    initialState: initialStateRef,
    updateState,
    buyAsset,
    sellAsset,
    sendAsset,
    toggleWatchlist,
    markNotificationRead,
    markAllNotificationsRead,
    getGoData
  };

  return (
    <CoinbaseContext.Provider value={value}>
      {children}
    </CoinbaseContext.Provider>
  );
}
