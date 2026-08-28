import React, { useContext } from 'react';
import { CoinbaseContext } from '../context/CoinbaseContext';
import { TrendingUp, TrendingDown, Wallet, ArrowDownUp, Send, Download } from 'lucide-react';

function PortfolioSummary() {
  const { state, updateState } = useContext(CoinbaseContext);

  const portfolioValue = state.holdings.reduce((total, holding) => {
    const asset = state.assets.find((a) => a.id === holding.assetId);
    if (!asset) return total;
    return total + holding.quantity * asset.currentPrice;
  }, 0);

  const costBasis = state.holdings.reduce((total, holding) => {
    return total + holding.quantity * holding.avgBuyPrice;
  }, 0);

  const totalGainLoss = portfolioValue - costBasis;
  const totalGainLossPercent = costBasis > 0 ? ((totalGainLoss / costBasis) * 100) : 0;
  const isPositive = totalGainLoss >= 0;

  const totalBalance = portfolioValue + state.currentUser.cashBalance;

  const allocations = state.holdings
    .map((holding) => {
      const asset = state.assets.find((a) => a.id === holding.assetId);
      if (!asset) return null;
      const value = holding.quantity * asset.currentPrice;
      return { name: asset.symbol, value, color: asset.iconColor };
    })
    .filter(Boolean)
    .sort((a, b) => b.value - a.value);

  if (state.currentUser.cashBalance > 0) {
    allocations.push({ name: 'Cash', value: state.currentUser.cashBalance, color: '#6B7280' });
  }

  const totalAlloc = allocations.reduce((s, a) => s + a.value, 0);

  const formatCurrency = (val) => {
    return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const openTrade = (mode) => {
    updateState({
      ui: {
        ...state.ui,
        tradeModal: { isOpen: true, mode, assetId: mode === 'sell' ? state.holdings[0]?.assetId || null : 'btc' }
      }
    });
  };

  const openTransfer = (mode) => {
    updateState({
      ui: {
        ...state.ui,
        sendReceiveModal: { isOpen: true, mode, assetId: state.holdings[0]?.assetId || null }
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-1">Total Balance</div>
        <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalBalance)}</div>
        <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${isPositive ? 'text-[#05B169]' : 'text-[#CF202F]'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>
            {isPositive ? '+' : ''}{formatCurrency(totalGainLoss)} ({isPositive ? '+' : ''}{totalGainLossPercent.toFixed(2)}%) all time
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Portfolio Value</div>
          <div className="text-base font-semibold text-gray-900">{formatCurrency(portfolioValue)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <Wallet size={12} />
            Cash Balance
          </div>
          <div className="text-base font-semibold text-gray-900">{formatCurrency(state.currentUser.cashBalance)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <button type="button" onClick={() => openTrade('buy')} className="flex items-center justify-center gap-2 rounded-full bg-[#0052FF] text-white py-2.5 text-sm font-semibold hover:bg-[#003ECB]">
          <ArrowDownUp size={16} />
          Buy
        </button>
        <button type="button" onClick={() => openTrade('sell')} className="flex items-center justify-center gap-2 rounded-full bg-gray-100 text-gray-800 py-2.5 text-sm font-semibold hover:bg-gray-200">
          <ArrowDownUp size={16} />
          Sell
        </button>
        <button type="button" onClick={() => openTransfer('send')} className="flex items-center justify-center gap-2 rounded-full bg-gray-100 text-gray-800 py-2.5 text-sm font-semibold hover:bg-gray-200">
          <Send size={16} />
          Send
        </button>
        <button type="button" onClick={() => openTransfer('receive')} className="flex items-center justify-center gap-2 rounded-full bg-gray-100 text-gray-800 py-2.5 text-sm font-semibold hover:bg-gray-200">
          <Download size={16} />
          Receive
        </button>
      </div>

      <div>
        <div className="text-sm font-medium text-gray-700 mb-3">Allocation</div>
        <div className="flex w-full h-3 rounded-full overflow-hidden mb-3">
          {allocations.map((alloc, i) => (
            <div
              key={alloc.name}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                backgroundColor: alloc.color,
                width: `${totalAlloc > 0 ? (alloc.value / totalAlloc) * 100 : 0}%`,
              }}
              title={`${alloc.name}: ${formatCurrency(alloc.value)}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {allocations.map((alloc) => (
            <div key={alloc.name} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: alloc.color }} />
              <span>{alloc.name}</span>
              <span className="text-gray-400">{totalAlloc > 0 ? ((alloc.value / totalAlloc) * 100).toFixed(1) : 0}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PortfolioSummary;
