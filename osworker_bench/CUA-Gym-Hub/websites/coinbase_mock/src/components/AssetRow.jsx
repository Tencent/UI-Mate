import React, { useContext, useMemo } from 'react';
import { Star } from 'lucide-react';
import { CoinbaseContext } from '../context/CoinbaseContext';

function formatPrice(price) {
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${price.toFixed(4)}`;
}

function formatNumber(num) {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function MiniSparkline({ data, width = 100, height = 32 }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? '#05B169' : '#CF202F';

  const points = data
    .map((price, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - 2 - ((price - min) / range) * (height - 4);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AssetRow({ asset, rank, onNavigate }) {
  const { state, updateState } = useContext(CoinbaseContext);
  const isWatchlisted = state.watchlist.includes(asset.id);

  const toggleWatchlist = (e) => {
    e.stopPropagation();
    const newWatchlist = isWatchlisted
      ? state.watchlist.filter((id) => id !== asset.id)
      : [...state.watchlist, asset.id];
    updateState({ watchlist: newWatchlist });
  };

  return (
    <tr
      onClick={() => onNavigate && onNavigate(asset.id)}
      className="hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <td className="py-3 px-3 text-sm text-gray-500 text-center w-10">
        {rank}
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
            style={{ backgroundColor: asset.iconColor }}
          >
            {asset.symbol.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">
              {asset.name}
            </div>
            <div className="text-xs text-gray-500">{asset.symbol}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-3 text-sm font-medium text-gray-900 text-right">
        {formatPrice(asset.currentPrice)}
      </td>
      <td className="py-3 px-3 text-right">
        <span
          className={`text-sm font-medium ${
            asset.priceChange24h >= 0 ? 'text-[#05B169]' : 'text-[#CF202F]'
          }`}
        >
          {asset.priceChange24h >= 0 ? '+' : ''}
          {asset.priceChange24h.toFixed(2)}%
        </span>
      </td>
      <td className="py-3 px-3 text-right hidden md:table-cell">
        <span
          className={`text-sm font-medium ${
            asset.priceChange7d >= 0 ? 'text-[#05B169]' : 'text-[#CF202F]'
          }`}
        >
          {asset.priceChange7d >= 0 ? '+' : ''}
          {asset.priceChange7d.toFixed(2)}%
        </span>
      </td>
      <td className="py-3 px-3 text-sm text-gray-700 text-right hidden lg:table-cell">
        {formatNumber(asset.marketCap)}
      </td>
      <td className="py-3 px-3 text-sm text-gray-700 text-right hidden xl:table-cell">
        {formatNumber(asset.volume24h)}
      </td>
      <td className="py-3 px-3 hidden lg:table-cell">
        <MiniSparkline data={asset.priceHistory} />
      </td>
      <td className="py-3 px-3 text-center w-10">
        <button
          onClick={toggleWatchlist}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star
            size={16}
            className={
              isWatchlisted
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-gray-400'
            }
          />
        </button>
      </td>
    </tr>
  );
}

export default AssetRow;
