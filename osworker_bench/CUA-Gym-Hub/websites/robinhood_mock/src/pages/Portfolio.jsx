import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatCurrency, formatNumber } from '../lib/utils';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-react';

export default function Portfolio() {
  const { state } = useStore();
  const [sortBy, setSortBy] = useState('value');
  const [sortDir, setSortDir] = useState('desc');

  const portfolioData = useMemo(() => {
    const holdings = [];
    let totalValue = 0;
    let totalCost = 0;
    let totalDayChange = 0;

    if (state.portfolio) {
      Object.entries(state.portfolio).forEach(([symbol, holding]) => {
        const stock = state.stocks.find(s => s.symbol === symbol);
        if (stock) {
          const marketValue = holding.quantity * stock.currentPrice;
          const costBasis = holding.quantity * holding.avgPrice;
          const totalReturn = marketValue - costBasis;
          const returnPct = costBasis > 0 ? ((marketValue - costBasis) / costBasis) * 100 : 0;
          const dayChange = holding.quantity * (stock.change || 0);

          totalValue += marketValue;
          totalCost += costBasis;
          totalDayChange += dayChange;

          holdings.push({
            symbol,
            name: stock.name,
            quantity: holding.quantity,
            avgPrice: holding.avgPrice,
            currentPrice: stock.currentPrice,
            marketValue,
            costBasis,
            totalReturn,
            returnPct,
            dayChange,
            dayChangePct: stock.changePercent || 0,
            stock,
          });
        }
      });
    }

    // Sort
    holdings.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'value': valA = a.marketValue; valB = b.marketValue; break;
        case 'return': valA = a.totalReturn; valB = b.totalReturn; break;
        case 'dayChange': valA = a.dayChange; valB = b.dayChange; break;
        case 'name': valA = a.symbol; valB = b.symbol; break;
        default: valA = a.marketValue; valB = b.marketValue;
      }
      if (sortBy === 'name') {
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });

    const totalReturn = totalValue - totalCost;
    const totalReturnPct = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

    return { holdings, totalValue, totalCost, totalReturn, totalReturnPct, totalDayChange };
  }, [state.portfolio, state.stocks, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  return (
    <div>
      {/* Portfolio Summary */}
      <div className="mb-8">
        <h1 className="text-sm text-text-muted mb-1">Investing</h1>
        <div className="text-4xl font-bold tracking-tight mb-1">
          {formatCurrency(portfolioData.totalValue + (state.user.cashBalance || 0))}
        </div>
        <div className="flex flex-wrap gap-4 text-sm mt-2">
          <div className={`flex items-center gap-1 ${portfolioData.totalDayChange >= 0 ? 'text-primary' : 'text-danger'}`}>
            {portfolioData.totalDayChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>
              {portfolioData.totalDayChange >= 0 ? '+' : ''}{formatCurrency(portfolioData.totalDayChange)} today
            </span>
          </div>
          <div className={`flex items-center gap-1 ${portfolioData.totalReturn >= 0 ? 'text-primary' : 'text-danger'}`}>
            {portfolioData.totalReturn >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>
              {portfolioData.totalReturn >= 0 ? '+' : ''}{formatCurrency(portfolioData.totalReturn)} ({portfolioData.totalReturnPct >= 0 ? '+' : ''}{portfolioData.totalReturnPct.toFixed(2)}%) total
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-surface-hover rounded-xl p-5">
          <div className="text-xs text-text-muted mb-1">Portfolio Value</div>
          <div className="text-xl font-bold">{formatCurrency(portfolioData.totalValue)}</div>
        </div>
        <div className="bg-surface border border-surface-hover rounded-xl p-5">
          <div className="text-xs text-text-muted mb-1">Cash Balance</div>
          <div className="text-xl font-bold">{formatCurrency(state.user.cashBalance || 0)}</div>
        </div>
        <div className="bg-surface border border-surface-hover rounded-xl p-5">
          <div className="text-xs text-text-muted mb-1">Buying Power</div>
          <div className="text-xl font-bold">{formatCurrency(state.user.buyingPower || 0)}</div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            Stocks & ETFs
            <span className="ml-2 text-sm text-text-muted font-normal">{portfolioData.holdings.length}</span>
          </h2>
        </div>

        {portfolioData.holdings.length > 0 ? (
          <div className="bg-surface border border-surface-hover rounded-xl overflow-hidden">
            {/* Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-2 px-5 py-3 border-b border-surface-hover text-xs font-bold text-text-muted">
              <div className="col-span-3 cursor-pointer hover:text-text" onClick={() => toggleSort('name')}>
                Name {sortBy === 'name' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
              </div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right cursor-pointer hover:text-text" onClick={() => toggleSort('dayChange')}>
                Today {sortBy === 'dayChange' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
              </div>
              <div className="col-span-2 text-right cursor-pointer hover:text-text" onClick={() => toggleSort('value')}>
                Market Value {sortBy === 'value' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
              </div>
              <div className="col-span-3 text-right cursor-pointer hover:text-text" onClick={() => toggleSort('return')}>
                Total Return {sortBy === 'return' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
              </div>
            </div>

            {/* Rows */}
            {portfolioData.holdings.map(h => (
              <Link
                key={h.symbol}
                to={`/stock/${h.symbol}`}
                className="grid grid-cols-2 md:grid-cols-12 gap-2 px-5 py-4 border-b border-surface-hover hover:bg-surface-hover transition-colors items-center"
              >
                {/* Name */}
                <div className="col-span-1 md:col-span-3">
                  <div className="font-bold text-sm">{h.symbol}</div>
                  <div className="text-xs text-text-muted">{h.quantity} shares</div>
                </div>

                {/* Price */}
                <div className="hidden md:block md:col-span-2 text-right text-sm">
                  ${h.currentPrice.toFixed(2)}
                </div>

                {/* Today */}
                <div className="hidden md:block md:col-span-2 text-right">
                  <span className={`text-sm ${h.dayChange >= 0 ? 'text-primary' : 'text-danger'}`}>
                    {h.dayChange >= 0 ? '+' : ''}{formatCurrency(h.dayChange)}
                  </span>
                  <div className="text-xs text-text-muted">{h.dayChangePct >= 0 ? '+' : ''}{h.dayChangePct.toFixed(2)}%</div>
                </div>

                {/* Market Value */}
                <div className="hidden md:block md:col-span-2 text-right">
                  <div className="text-sm font-medium">{formatCurrency(h.marketValue)}</div>
                  <div className="text-xs text-text-muted">Avg ${h.avgPrice.toFixed(2)}</div>
                </div>

                {/* Total Return */}
                <div className="col-span-1 md:col-span-3 text-right">
                  <span className={`text-sm font-medium ${h.totalReturn >= 0 ? 'text-primary' : 'text-danger'}`}>
                    {h.totalReturn >= 0 ? '+' : ''}{formatCurrency(h.totalReturn)}
                  </span>
                  <div className={`text-xs ${h.returnPct >= 0 ? 'text-primary' : 'text-danger'}`}>
                    {h.returnPct >= 0 ? '+' : ''}{h.returnPct.toFixed(2)}%
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-surface-hover rounded-xl p-12 text-center text-text-muted">
            <PieChart size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-1">No stocks yet</p>
            <p className="text-sm">Search for stocks to start investing</p>
          </div>
        )}
      </div>
    </div>
  );
}
