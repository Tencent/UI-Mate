import React, { useContext } from 'react';
import { CoinbaseContext } from '../context/CoinbaseContext';
import { Star, ChevronRight } from 'lucide-react';

function WatchlistWidget({ onNavigateToAsset, onViewAll }) {
  const { state, updateState } = useContext(CoinbaseContext);

  const watchlistAssets = state.watchlist
    .map((assetId) => state.assets.find((a) => a.id === assetId))
    .filter(Boolean);

  const handleRemoveFromWatchlist = (e, assetId) => {
    e.stopPropagation();
    updateState({
      watchlist: state.watchlist.filter((id) => id !== assetId),
    });
  };

  const formatPrice = (price) => {
    if (price >= 1) {
      return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  const renderSparkline = (priceHistory, isPositive) => {
    if (!priceHistory || priceHistory.length < 2) return null;
    const min = Math.min(...priceHistory);
    const max = Math.max(...priceHistory);
    const range = max - min || 1;
    const width = 60;
    const height = 24;

    const points = priceHistory
      .map((val, i) => {
        const x = (i / (priceHistory.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? '#05B169' : '#CF202F'}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Watchlist</h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-0.5 text-sm font-medium text-[#0052FF] hover:text-[#0041CC] transition-colors"
          >
            View All
            <ChevronRight size={16} />
          </button>
        )}
      </div>
      <div>
        {watchlistAssets.length > 0 ? (
          watchlistAssets.map((asset) => {
            const isPositive = asset.priceChange24h >= 0;
            return (
              <button
                key={asset.id}
                onClick={() => onNavigateToAsset && onNavigateToAsset(asset.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ backgroundColor: asset.iconColor }}
                  >
                    {asset.symbol.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{asset.name}</div>
                    <div className="text-xs text-gray-500">{asset.symbol}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  {renderSparkline(asset.priceHistory, isPositive)}

                  <div className="text-right min-w-[80px]">
                    <div className="font-semibold text-gray-900 text-sm">{formatPrice(asset.currentPrice)}</div>
                    <div className={`text-xs font-medium ${isPositive ? 'text-[#05B169]' : 'text-[#CF202F]'}`}>
                      {isPositive ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleRemoveFromWatchlist(e, asset.id)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    title="Remove from watchlist"
                  >
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  </button>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            No assets in your watchlist. Star assets to add them here.
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchlistWidget;
