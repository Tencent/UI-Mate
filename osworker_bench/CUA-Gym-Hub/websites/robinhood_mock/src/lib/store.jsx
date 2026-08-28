import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initializeData, getInitialState, fetchCustomState, getSessionId, saveState, calculateStateDiff } from './mockData';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      // Check BEFORE initializeData if session data already exists in localStorage
      const sessionKey = `tradeflow_initial_v2_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const data = initializeData(sid);
        setState(data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setLoading(false);
        });
      }
    } else {
      const data = initializeData();
      setState(data);
      setLoading(false);
    }
  }, []);

  // Save state on changes
  useEffect(() => {
    if (state && !loading) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  // Simulate Live Prices
  useEffect(() => {
    if (!state) return;

    const interval = setInterval(() => {
      setState(prev => {
        if (!prev || !prev.stocks) return prev;

        const updatedStocks = prev.stocks.map(stock => {
          const changePercent = (Math.random() * 0.004) - 0.002; // +/- 0.2%
          const newPrice = Math.max(0.01, stock.currentPrice * (1 + changePercent));

          return {
            ...stock,
            currentPrice: parseFloat(newPrice.toFixed(2)),
            change: parseFloat((newPrice - stock.prevClose).toFixed(2)),
            changePercent: parseFloat(((newPrice - stock.prevClose) / stock.prevClose * 100).toFixed(2))
          };
        });

        // Update portfolio value based on new prices
        let newPortfolioValue = 0;
        if (prev.portfolio) {
          Object.entries(prev.portfolio).forEach(([symbol, holding]) => {
            const stock = updatedStocks.find(s => s.symbol === symbol);
            if (stock) {
              newPortfolioValue += holding.quantity * stock.currentPrice;
            }
          });
        }

        return {
          ...prev,
          stocks: updatedStocks,
          user: {
            ...prev.user,
            portfolioValue: parseFloat(newPortfolioValue.toFixed(2))
          }
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [loading]);

  const placeOrder = (symbol, type, side, quantity, price) => {
    setState(prev => {
      const stock = prev.stocks.find(s => s.symbol === symbol);
      if (!stock) return prev;

      const totalCost = quantity * price;
      const newUser = { ...prev.user };
      const newPortfolio = { ...prev.portfolio };
      const newTransactions = [...prev.transactions];
      const newNotifications = [...(prev.notifications || [])];
      const status = type === 'market' ? 'filled' : 'pending';

      if (side === 'buy' && status === 'filled') {
        if (newUser.buyingPower < totalCost) {
          throw new Error("Insufficient buying power");
        }
        newUser.buyingPower -= totalCost;
        newUser.cashBalance -= totalCost;

        const currentHolding = newPortfolio[symbol] || { quantity: 0, avgPrice: 0 };
        const newQuantity = currentHolding.quantity + quantity;
        const newAvgPrice = ((currentHolding.quantity * currentHolding.avgPrice) + totalCost) / newQuantity;

        newPortfolio[symbol] = {
          quantity: newQuantity,
          avgPrice: newAvgPrice
        };
      } else if (side === 'sell' && status === 'filled') {
        // Sell
        const currentHolding = newPortfolio[symbol];
        if (!currentHolding || currentHolding.quantity < quantity) {
          throw new Error("Insufficient shares");
        }

        newUser.buyingPower += totalCost;
        newUser.cashBalance += totalCost;

        const newQuantity = currentHolding.quantity - quantity;
        if (newQuantity === 0) {
          delete newPortfolio[symbol];
        } else {
          newPortfolio[symbol] = {
            ...currentHolding,
            quantity: newQuantity
          };
        }
      } else if (side === 'buy' && newUser.buyingPower < totalCost) {
        throw new Error("Insufficient buying power");
      } else if (side === 'sell') {
        const currentHolding = newPortfolio[symbol];
        if (!currentHolding || currentHolding.quantity < quantity) {
          throw new Error("Insufficient shares");
        }
      }

      newTransactions.unshift({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        symbol,
        type,
        side,
        quantity,
        price,
        status
      });

      newNotifications.unshift({
        id: `notif_${Date.now()}`,
        title: status === 'filled' ? 'Order filled' : 'Order placed',
        message: `${side === 'buy' ? 'Buy' : 'Sell'} ${quantity} ${symbol} ${status === 'filled' ? 'filled' : 'queued'} at $${price.toFixed(2)}`,
        date: new Date().toISOString(),
        read: false,
        type: status === 'filled' ? 'trade' : 'order'
      });

      return {
        ...prev,
        user: newUser,
        portfolio: newPortfolio,
        transactions: newTransactions,
        notifications: newNotifications
      };
    });
  };

  const toggleWatchlist = (symbol) => {
    setState(prev => {
      const newList = prev.watchlist.includes(symbol)
        ? prev.watchlist.filter(s => s !== symbol)
        : [...prev.watchlist, symbol];
      return { ...prev, watchlist: newList };
    });
  };

  const markNotificationRead = (notificationId) => {
    setState(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    }));
  };

  const markAllNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(notification => ({ ...notification, read: true }))
    }));
  };

  const getGoData = () => {
    const initial = getInitialState(sidRef.current);
    const initialState = initial || state;
    const diff = calculateStateDiff(initialState, state);

    return {
      initial_state: initialState,
      current_state: state,
      state_diff: diff
    };
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={{ state, placeOrder, toggleWatchlist, markNotificationRead, markAllNotificationsRead, getGoData }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
