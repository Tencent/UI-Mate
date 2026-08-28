import React, { useContext, useState, useMemo } from 'react';
import { CoinbaseContext } from '../context/CoinbaseContext';
import { ChevronDown } from 'lucide-react';

const FEE_RATE = 0.0149; // 1.49%

function TradeForm({ onPreview, initialMode, initialAssetId }) {
  const { state } = useContext(CoinbaseContext);
  const [mode, setMode] = useState(initialMode || 'buy');
  const [selectedAssetId, setSelectedAssetId] = useState(initialAssetId || state.assets[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const selectedAsset = useMemo(
    () => state.assets.find((a) => a.id === selectedAssetId),
    [state.assets, selectedAssetId]
  );

  const holding = useMemo(
    () => state.holdings.find((h) => h.assetId === selectedAssetId),
    [state.holdings, selectedAssetId]
  );

  const amountNum = parseFloat(amount) || 0;
  const fee = amountNum * FEE_RATE;
  const total = amountNum + fee;
  const quantity = selectedAsset && selectedAsset.currentPrice > 0
    ? amountNum / selectedAsset.currentPrice
    : 0;

  const maxSellValue = holding && selectedAsset
    ? holding.quantity * selectedAsset.currentPrice
    : 0;

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

  const handlePreview = () => {
    setError('');

    if (!selectedAsset) {
      setError('Please select an asset.');
      return;
    }
    if (amountNum < 1) {
      setError('Minimum order is $1.00.');
      return;
    }
    if (mode === 'buy' && total > state.currentUser.cashBalance) {
      setError('Insufficient cash balance.');
      return;
    }
    if (mode === 'sell') {
      if (!holding || holding.quantity <= 0) {
        setError('You do not hold this asset.');
        return;
      }
      if (amountNum > maxSellValue) {
        setError('Amount exceeds your holdings value.');
        return;
      }
    }

    onPreview({
      mode,
      asset: selectedAsset,
      amountUSD: amountNum,
      quantity: mode === 'buy' ? quantity : amountNum / selectedAsset.currentPrice,
      fee,
      total: mode === 'buy' ? total : amountNum - fee,
      pricePerUnit: selectedAsset.currentPrice,
    });
  };

  // For sell mode, only show assets user holds
  const availableAssets = mode === 'sell'
    ? state.assets.filter((a) => state.holdings.some((h) => h.assetId === a.id && h.quantity > 0))
    : state.assets;

  return (
    <div className="p-6">
      {/* Buy/Sell toggle */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => { setMode('buy'); setError(''); }}
          className={`flex-1 pb-3 font-semibold text-sm transition-colors relative ${
            mode === 'buy' ? 'text-[#0052FF]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Buy
          {mode === 'buy' && (
            <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#0052FF]" />
          )}
        </button>
        <button
          onClick={() => { setMode('sell'); setError(''); }}
          className={`flex-1 pb-3 font-semibold text-sm transition-colors relative ${
            mode === 'sell' ? 'text-[#0052FF]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sell
          {mode === 'sell' && (
            <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#0052FF]" />
          )}
        </button>
      </div>

      {/* Asset selector */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Asset</label>
        <div className="relative">
          <select
            value={selectedAssetId}
            onChange={(e) => { setSelectedAssetId(e.target.value); setError(''); }}
            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg p-3 pr-10 text-sm font-medium text-gray-900 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] focus:outline-none"
          >
            {availableAssets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.symbol})
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Amount input */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Amount (USD)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(''); }}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 pl-7 text-sm font-medium text-gray-900 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] focus:outline-none"
          />
        </div>
        {mode === 'sell' && holding && selectedAsset && (
          <div className="mt-1.5 text-xs text-gray-500">
            Available: {formatQuantity(holding.quantity)} {selectedAsset.symbol} ({formatCurrency(maxSellValue)})
          </div>
        )}
        {mode === 'buy' && (
          <div className="mt-1.5 text-xs text-gray-500">
            Cash balance: {formatCurrency(state.currentUser.cashBalance)}
          </div>
        )}
      </div>

      {/* Preview section */}
      {amountNum > 0 && selectedAsset && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              {mode === 'buy' ? 'You get approximately' : 'You sell approximately'}
            </span>
            <span className="font-medium text-gray-900">
              {formatQuantity(quantity)} {selectedAsset.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Price per {selectedAsset.symbol}</span>
            <span className="font-medium text-gray-900">{formatCurrency(selectedAsset.currentPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Xoinbase fee (1.49%)</span>
            <span className="font-medium text-gray-900">{formatCurrency(fee)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-gray-900">{mode === 'buy' ? 'Total' : 'You receive'}</span>
            <span className="text-gray-900">
              {mode === 'buy' ? formatCurrency(total) : formatCurrency(amountNum - fee)}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#CF202F] font-medium">
          {error}
        </div>
      )}

      {/* Preview button */}
      <button
        onClick={handlePreview}
        className="w-full py-3 rounded-full font-semibold text-sm text-white bg-[#0052FF] hover:bg-[#003ECB] transition-colors active:scale-[0.98] transform"
      >
        Preview {mode === 'buy' ? 'Buy' : 'Sell'} Order
      </button>
    </div>
  );
}

export default TradeForm;
