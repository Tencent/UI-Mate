import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';

export default function OrderForm({ stock }) {
  const { state, placeOrder } = useStore();
  const [side, setSide] = useState('buy'); // 'buy' | 'sell'
  const [orderType, setOrderType] = useState('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewOrder, setReviewOrder] = useState(null);

  const executionPrice = orderType === 'market' ? stock.currentPrice : parseFloat(limitPrice) || 0;
  const estimatedCost = (parseFloat(quantity) || 0) * executionPrice;
  const buyingPower = state.user.buyingPower;
  const ownedShares = state.portfolio[stock.symbol]?.quantity || 0;

  const validateOrder = () => {
    const parsedQuantity = parseFloat(quantity);
    if (!quantity || parsedQuantity <= 0) {
      throw new Error("Please enter a valid quantity");
    }
    if (orderType !== 'market' && executionPrice <= 0) {
      throw new Error("Please enter a valid target price");
    }
    if (side === 'buy' && estimatedCost > buyingPower) {
      throw new Error("Insufficient buying power");
    }
    if (side === 'sell' && parsedQuantity > ownedShares) {
      throw new Error("Insufficient shares");
    }
    return parsedQuantity;
  };

  const handleReview = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const parsedQuantity = validateOrder();
      setReviewOrder({
        symbol: stock.symbol,
        side,
        type: orderType,
        quantity: parsedQuantity,
        price: executionPrice,
        status: orderType === 'market' ? 'filled' : 'pending'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirm = async () => {
    if (!reviewOrder) return;
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      placeOrder(reviewOrder.symbol, reviewOrder.type, reviewOrder.side, reviewOrder.quantity, reviewOrder.price);
      setSuccess(true);
      setQuantity('');
      setLimitPrice('');
      setReviewOrder(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl p-6 shadow-lg border border-surface-hover sticky top-6">
      <div className="flex border-b border-surface-hover mb-6">
        <button
          type="button"
          className={`flex-1 pb-3 font-bold text-sm transition-colors relative ${side === 'buy' ? 'text-primary' : 'text-text-muted hover:text-text'}`}
          onClick={() => { setSide('buy'); setReviewOrder(null); setError(null); }}
        >
          Buy {stock.symbol}
          {side === 'buy' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary"></div>}
        </button>
        <button
          type="button"
          className={`flex-1 pb-3 font-bold text-sm transition-colors relative ${side === 'sell' ? 'text-primary' : 'text-text-muted hover:text-text'}`}
          onClick={() => { setSide('sell'); setReviewOrder(null); setError(null); }}
        >
          Sell {stock.symbol}
          {side === 'sell' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary"></div>}
        </button>
      </div>

      <form onSubmit={handleReview} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Order Type</label>
          <select
            value={orderType}
            onChange={(e) => { setOrderType(e.target.value); setReviewOrder(null); setError(null); }}
            className="w-full bg-background border border-surface-hover rounded-md p-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="market">Market Order</option>
            <option value="limit">Limit Order</option>
            <option value="stop">Stop Order</option>
          </select>
        </div>

        {orderType !== 'market' && (
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              {orderType === 'limit' ? 'Limit Price' : 'Stop Price'}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={stock.currentPrice.toFixed(2)}
              value={limitPrice}
              onChange={(e) => { setLimitPrice(e.target.value); setReviewOrder(null); setError(null); }}
              className="w-full bg-background border border-surface-hover rounded-md p-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Shares</label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setReviewOrder(null); setError(null); }}
            className="w-full bg-background border border-surface-hover rounded-md p-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex justify-between text-sm py-2">
          <span className="font-bold text-primary">Market Price</span>
          <span>{formatCurrency(stock.currentPrice)}</span>
        </div>

        {reviewOrder && (
          <div className="bg-background border border-primary/30 rounded-lg p-3 text-sm space-y-2">
            <div className="font-bold text-primary">Review order</div>
            <div className="flex justify-between">
              <span className="text-text-muted">Action</span>
              <span className="uppercase font-bold">{reviewOrder.side} {reviewOrder.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Order type</span>
              <span className="capitalize">{reviewOrder.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Shares</span>
              <span>{reviewOrder.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Estimated total</span>
              <span>{formatCurrency(reviewOrder.quantity * reviewOrder.price)}</span>
            </div>
            {reviewOrder.status === 'pending' && (
              <div className="text-xs text-text-muted">
                This sandbox queues limit and stop orders as pending transactions.
              </div>
            )}
          </div>
        )}

        <div className="border-t border-surface-hover pt-4">
          <div className="flex justify-between text-sm font-bold mb-4">
            <span>Estimated {side === 'buy' ? 'Cost' : 'Credit'}</span>
            <span>{formatCurrency(estimatedCost)}</span>
          </div>

          <div className="text-xs text-text-muted mb-4 flex justify-between">
            <span>{side === 'buy' ? 'Buying Power Available' : 'Shares Available'}</span>
            <span>{side === 'buy' ? formatCurrency(buyingPower) : ownedShares}</span>
          </div>

          {error && (
            <div className="bg-danger/10 text-danger text-xs p-2 rounded mb-4 border border-danger/20">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-primary/10 text-primary text-xs p-2 rounded mb-4 border border-primary/20">
              Order Filled Successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full font-bold text-sm transition-all transform active:scale-[0.98] ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              side === 'buy' 
                ? 'bg-primary text-black hover:bg-primary-dark' 
                : 'bg-danger text-white hover:bg-danger-dark'
            }`}
          >
            {loading ? 'Processing...' : reviewOrder ? 'Update Review' : 'Review Order'}
          </button>
          {reviewOrder && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="w-full mt-2 py-3 rounded-full font-bold text-sm bg-primary text-black hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Submitting...' : `${reviewOrder.status === 'pending' ? 'Place' : 'Submit'} ${side === 'buy' ? 'Buy' : 'Sell'}`}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
