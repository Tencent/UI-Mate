import React, { useContext } from 'react';
import { Star, ArrowLeft } from 'lucide-react';
import { CoinbaseContext } from '../context/CoinbaseContext';
import PriceChart from './PriceChart';
import AssetStats from './AssetStats';

function formatPrice(price) {
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${price.toFixed(4)}`;
}

function formatCurrency(val) {
  if (Math.abs(val) >= 1) {
    return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function AssetDetail({ assetId, onBack, onBuy, onSell }) {
  const { state, updateState } = useContext(CoinbaseContext);

  const asset = state.assets.find((a) => a.id === assetId);
  if (!asset) {
    return (
      <div className="p-8 text-center text-gray-400">
        Asset not found.
      </div>
    );
  }

  const isWatchlisted = state.watchlist.includes(asset.id);
  const holding = state.holdings.find((h) => h.assetId === asset.id);

  const toggleWatchlist = () => {
    const newWatchlist = isWatchlisted
      ? state.watchlist.filter((id) => id !== asset.id)
      : [...state.watchlist, asset.id];
    updateState({ watchlist: newWatchlist });
  };

  const handleBuy = () => {
    if (onBuy) {
      onBuy(asset.id);
    } else {
      updateState({
        ui: {
          ...state.ui,
          tradeModal: { isOpen: true, mode: 'buy', assetId: asset.id },
        },
      });
    }
  };

  const handleSell = () => {
    if (onSell) {
      onSell(asset.id);
    } else {
      updateState({
        ui: {
          ...state.ui,
          tradeModal: { isOpen: true, mode: 'sell', assetId: asset.id },
        },
      });
    }
  };

  const currentValue = holding ? holding.quantity * asset.currentPrice : 0;
  const costBasis = holding ? holding.quantity * holding.avgBuyPrice : 0;
  const gainLoss = currentValue - costBasis;
  const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: asset.iconColor }}
          >
            {asset.symbol.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
              <span className="text-sm text-gray-500 font-medium">{asset.symbol}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(asset.currentPrice)}
              </span>
              <span
                className={`text-sm font-medium ${
                  asset.priceChange24h >= 0 ? 'text-[#05B169]' : 'text-[#CF202F]'
                }`}
              >
                {asset.priceChange24h >= 0 ? '+' : ''}
                {asset.priceChange24h.toFixed(2)}% (24h)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={toggleWatchlist}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star
            size={22}
            className={
              isWatchlisted
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-gray-400'
            }
          />
        </button>
      </div>

      {/* Price Chart */}
      <PriceChart priceHistory={asset.priceHistory} assetName={asset.id} />

      {/* User Holdings (if any) */}
      {holding && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Your Balance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Quantity</div>
              <div className="text-sm font-semibold text-gray-900">
                {holding.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })} {asset.symbol}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Current Value</div>
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(currentValue)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Avg. Buy Price</div>
              <div className="text-sm font-semibold text-gray-900">
                {formatPrice(holding.avgBuyPrice)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Total Return</div>
              <div
                className={`text-sm font-semibold ${
                  gainLoss >= 0 ? 'text-[#05B169]' : 'text-[#CF202F]'
                }`}
              >
                {gainLoss >= 0 ? '+' : ''}
                {formatCurrency(gainLoss)} ({gainLoss >= 0 ? '+' : ''}
                {gainLossPercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Stats */}
      <AssetStats asset={asset} />

      {/* About */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-2">About {asset.name}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{asset.about}</p>
        {asset.category && (
          <span className="inline-block mt-3 px-3 py-1 text-xs font-medium text-[#0052FF] bg-blue-50 rounded-full">
            {asset.category}
          </span>
        )}
      </div>

      {/* Buy / Sell Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleBuy}
          className="flex-1 py-3 bg-[#0052FF] text-white font-semibold rounded-xl hover:bg-[#0047E0] transition-colors text-sm"
        >
          Buy {asset.symbol}
        </button>
        {holding && (
          <button
            onClick={handleSell}
            className="flex-1 py-3 bg-white text-gray-900 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
          >
            Sell {asset.symbol}
          </button>
        )}
      </div>
    </div>
  );
}

export default AssetDetail;
