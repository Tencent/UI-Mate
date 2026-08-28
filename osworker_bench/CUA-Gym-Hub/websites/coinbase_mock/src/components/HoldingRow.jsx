import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function HoldingRow({ asset, holding, onNavigate }) {
  const currentValue = holding.quantity * asset.currentPrice;
  const costBasis = holding.quantity * holding.avgBuyPrice;
  const gainLoss = currentValue - costBasis;
  const gainLossPercent = costBasis > 0 ? ((gainLoss / costBasis) * 100) : 0;
  const isPositive = gainLoss >= 0;

  const formatCurrency = (val) => {
    if (Math.abs(val) >= 1) {
      return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  const formatQuantity = (qty, symbol) => {
    if (qty >= 1000) return qty.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (qty >= 1) return qty.toLocaleString('en-US', { maximumFractionDigits: 4 });
    return qty.toLocaleString('en-US', { maximumFractionDigits: 8 });
  };

  return (
    <button
      onClick={() => onNavigate && onNavigate(asset.id)}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0 text-left"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: asset.iconColor }}
        >
          {asset.symbol.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">{asset.name}</div>
          <div className="text-xs text-gray-500">
            {formatQuantity(holding.quantity, asset.symbol)} {asset.symbol}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0 ml-4">
        <div className="font-semibold text-gray-900 text-sm">{formatCurrency(currentValue)}</div>
        <div className={`flex items-center justify-end gap-1 text-xs font-medium ${isPositive ? 'text-[#05B169]' : 'text-[#CF202F]'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>
            {isPositive ? '+' : ''}{formatCurrency(gainLoss)} ({isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </button>
  );
}

export default HoldingRow;
