import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import StockChart from '../components/StockChart';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';

export default function Dashboard() {
  const { state, toggleWatchlist } = useStore();
  const [showAddList, setShowAddList] = useState(false);
  
  // Safety check for critical data
  if (!state.user || !state.stocks || state.stocks.length === 0) {
    return <div className="p-8 text-center">Loading market data...</div>;
  }

  // Calculate daily change (mock calculation based on portfolio)
  const portfolioChange = (state.user.portfolioValue || 0) * 0.012; // Mock +1.2%
  const isPositive = portfolioChange >= 0;

  // Generate a composite chart for the portfolio
  // Fallback to first stock's history if available, else empty array
  const baseHistory = state.stocks[0]?.history || [];
  const basePrice = state.stocks[0]?.currentPrice || 1;
  
  const portfolioHistory = baseHistory.map(h => ({
    ...h,
    price: h.price * ((state.user.portfolioValue || 0) / basePrice || 1) // Scale to portfolio value
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
      {/* Main Column */}
      <div className="flex-1 min-w-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            {formatCurrency((state.user.portfolioValue || 0) + (state.user.cashBalance || 0))}
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className={isPositive ? 'text-primary' : 'text-danger'}>
              {isPositive ? '+' : '-'}{formatCurrency(Math.abs(portfolioChange))} ({isPositive ? '+' : '-'}1.20%)
            </span>
            <span className="text-text-muted">Today</span>
          </div>
        </div>

        <div className="mb-8 border-b border-surface pb-8">
          <StockChart data={portfolioHistory} color={isPositive ? '#00C805' : '#FF5000'} />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-surface pb-2">Buying Power</h2>
          <div className="flex justify-between items-center bg-surface rounded-lg p-4">
            <span className="text-text-muted">Brokerage Cash</span>
            <span className="font-bold">{formatCurrency(state.user.buyingPower || 0)}</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Market News</h2>
          <div className="grid gap-4">
            {state.news && state.news.map(item => (
              <div key={item.id} className="flex gap-4 bg-surface rounded-lg p-4 hover:bg-surface-hover transition-colors cursor-pointer border border-transparent hover:border-surface-hover">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-text">{item.source}</span>
                    <span className="text-xs text-text-muted">{item.time}</span>
                  </div>
                  <h3 className="font-bold mb-2 line-clamp-2">{item.headline}</h3>
                  <p className="text-sm text-text-muted line-clamp-2">{item.summary}</p>
                </div>
                <img src={item.imageUrl} alt="" className="w-24 h-24 object-cover rounded-md bg-surface-hover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Column (Watchlist) */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-surface rounded-xl border border-surface-hover overflow-hidden sticky top-6">
          <div className="p-4 border-b border-surface-hover flex justify-between items-center">
            <h3 className="font-bold text-text-muted">Lists</h3>
            <button
              type="button"
              onClick={() => setShowAddList(value => !value)}
              className="p-1 hover:bg-surface-hover rounded text-primary"
              aria-label="Add stock to watchlist"
            >
              <Plus size={20} />
            </button>
          </div>
          {showAddList && (
            <div className="p-3 border-b border-surface-hover bg-background">
              <div className="text-xs text-text-muted mb-2">Add to watchlist</div>
              <div className="grid gap-2">
                {state.stocks
                  .filter(stock => !state.watchlist.includes(stock.symbol))
                  .slice(0, 4)
                  .map(stock => (
                    <button
                      key={stock.symbol}
                      type="button"
                      onClick={() => {
                        toggleWatchlist(stock.symbol);
                        setShowAddList(false);
                      }}
                      className="flex items-center justify-between rounded-md bg-surface px-3 py-2 text-sm hover:bg-surface-hover"
                    >
                      <span className="font-bold">{stock.symbol}</span>
                      <span className="text-text-muted">{stock.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
          
          <div className="divide-y divide-surface-hover">
            {state.watchlist && state.watchlist.map(symbol => {
              const stock = state.stocks.find(s => s.symbol === symbol);
              if (!stock) return null;
              
              const isUp = (stock.change || 0) >= 0;
              const currentPrice = stock.currentPrice || 0;
              const changePercent = stock.changePercent || 0;
              
              return (
                <Link to={`/stock/${symbol}`} key={symbol} className="flex items-center justify-between p-4 hover:bg-surface-hover transition-colors group">
                  <div>
                    <div className="font-bold text-sm">{symbol}</div>
                    <div className="text-xs text-text-muted">{stock.quantity ? `${stock.quantity} shares` : 'Watch'}</div>
                  </div>
                  
                  <div className="w-20 h-8 mx-2 opacity-50">
                    {/* Mini Sparkline Placeholder */}
                    <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                      <path 
                        d={`M0,15 Q25,${isUp ? 5 : 25} 50,15 T100,${isUp ? 5 : 25}`} 
                        fill="none" 
                        stroke={isUp ? '#00C805' : '#FF5000'} 
                        strokeWidth="2" 
                      />
                    </svg>
                  </div>

                  <div className="text-right">
                    <div className="font-medium text-sm">${currentPrice.toFixed(2)}</div>
                    <div className={`text-xs font-medium ${isUp ? 'text-primary' : 'text-danger'}`}>
                      {isUp ? '+' : ''}{changePercent.toFixed(2)}%
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
