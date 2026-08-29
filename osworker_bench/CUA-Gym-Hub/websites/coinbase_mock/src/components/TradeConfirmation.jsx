import React, { useContext, useState } from 'react';
import { CoinbaseContext } from '../context/CoinbaseContext';
import { Check, ArrowLeft } from 'lucide-react';

function TradeConfirmation({ order, onBack, onComplete }) {
  const { buyAsset, sellAsset } = useContext(CoinbaseContext);
  const [confirmed, setConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);

  const formatCurrency = (val) => {
    return val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatQuantity = (qty) => {
    if (qty >= 1) return qty.toLocaleString('en-US', { maximumFractionDigits: 6 });
    return qty.toLocaleString('en-US', { maximumFractionDigits: 8 });
  };

  const handleConfirm = () => {
    setProcessing(true);

    // Simulate a brief processing delay, then call the context action
    setTimeout(() => {
      if (order.mode === 'buy') {
        buyAsset(order.asset.id, order.amountUSD);
      } else if (order.mode === 'sell') {
        sellAsset(order.asset.id, order.quantity);
      }

      setProcessing(false);
      setConfirmed(true);
    }, 600);
  };

  if (confirmed) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-[#05B169] flex items-center justify-center mb-4 animate-bounce">
          <Check size={32} className="text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Order Complete</h3>
        <p className="text-sm text-gray-500 mb-6 text-center">
          You {order.mode === 'buy' ? 'bought' : 'sold'}{' '}
          {formatQuantity(order.quantity)} {order.asset.symbol} for{' '}
          {formatCurrency(order.amountUSD)}
        </p>
        <button
          onClick={onComplete}
          className="px-6 py-2.5 rounded-full font-semibold text-sm text-white bg-[#0052FF] hover:bg-[#003ECB] transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Confirm {order.mode === 'buy' ? 'Buy' : 'Sell'} Order
      </h3>

      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: order.asset.iconColor }}
        >
          {order.asset.symbol.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{order.asset.name}</div>
          <div className="text-xs text-gray-500">{order.asset.symbol}</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Quantity</span>
          <span className="font-medium text-gray-900">
            {formatQuantity(order.quantity)} {order.asset.symbol}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Price per {order.asset.symbol}</span>
          <span className="font-medium text-gray-900">{formatCurrency(order.pricePerUnit)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium text-gray-900">{formatCurrency(order.amountUSD)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Xoinbase fee (1.49%)</span>
          <span className="font-medium text-gray-900">{formatCurrency(order.fee)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-semibold">
          <span className="text-gray-900">
            {order.mode === 'buy' ? 'Total cost' : 'You receive'}
          </span>
          <span className="text-gray-900">
            {order.mode === 'buy'
              ? formatCurrency(order.amountUSD + order.fee)
              : formatCurrency(order.amountUSD - order.fee)}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-full font-semibold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={processing}
          className={`flex-1 py-3 rounded-full font-semibold text-sm text-white transition-colors active:scale-[0.98] transform ${
            processing
              ? 'bg-[#0052FF]/60 cursor-not-allowed'
              : 'bg-[#0052FF] hover:bg-[#003ECB]'
          }`}
        >
          {processing ? 'Processing...' : `Confirm ${order.mode === 'buy' ? 'Buy' : 'Sell'}`}
        </button>
      </div>
    </div>
  );
}

export default TradeConfirmation;
