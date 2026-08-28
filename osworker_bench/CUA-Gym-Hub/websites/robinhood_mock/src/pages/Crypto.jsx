import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Simulated crypto holdings (separate from stock portfolio)
const CRYPTO_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67420.50, change: 1840.20, changePercent: 2.81, held: 0.05 },
  { symbol: 'ETH', name: 'Ethereum', price: 3512.80, change: -48.30, changePercent: -1.36, held: 0.8 },
  { symbol: 'SOL', name: 'Solana', price: 178.40, change: 12.60, changePercent: 7.60, held: 5.0 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.1624, change: 0.0082, changePercent: 5.32, held: 2500 },
];

export default function Crypto() {
  const { state } = useStore();

  // Look up COIN stock for crypto-related equities
  const coinStock = state.stocks?.find(s => s.symbol === 'COIN');

  const cryptoValue = useMemo(() => {
    return CRYPTO_ASSETS.reduce((sum, asset) => sum + asset.held * asset.price, 0);
  }, []);

  const cryptoDayChange = useMemo(() => {
    return CRYPTO_ASSETS.reduce((sum, asset) => sum + asset.held * asset.change, 0);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Crypto</h1>
      <p className="text-text-muted text-sm mb-6">Your cryptocurrency portfolio</p>

      {/* Crypto Summary */}
      <div className="mb-8">
        <div className="text-sm text-text-muted mb-1">Crypto Value</div>
        <div className="text-4xl font-bold tracking-tight mb-1">
          {formatCurrency(cryptoValue)}
        </div>
        <div className={`flex items-center gap-1 text-sm ${cryptoDayChange >= 0 ? 'text-primary' : 'text-danger'}`}>
          {cryptoDayChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>
            {cryptoDayChange >= 0 ? '+' : ''}{formatCurrency(cryptoDayChange)} Today
          </span>
        </div>
      </div>

      {/* Crypto Holdings */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Your Holdings</h2>
        <div className="bg-surface border border-surface-hover rounded-xl overflow-hidden">
          {CRYPTO_ASSETS.map((asset, idx) => {
            const marketValue = asset.held * asset.price;
            const dayChange = asset.held * asset.change;
            const isUp = asset.change >= 0;
            return (
              <div
                key={asset.symbol}
                className={`flex items-center justify-between px-5 py-4 hover:bg-surface-hover transition-colors ${
                  idx < CRYPTO_ASSETS.length - 1 ? 'border-b border-surface-hover' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{asset.symbol}</div>
                    <div className="text-xs text-text-muted">{asset.name}</div>
                  </div>
                </div>
                <div className="text-center hidden md:block">
                  <div className="text-sm">{formatCurrency(asset.price)}</div>
                  <div className={`text-xs font-medium ${isUp ? 'text-primary' : 'text-danger'}`}>
                    {isUp ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatCurrency(marketValue)}</div>
                  <div className="text-xs text-text-muted">
                    {asset.held >= 1 ? asset.held.toFixed(asset.held >= 100 ? 0 : 2) : asset.held.toFixed(6)} {asset.symbol}
                  </div>
                  <div className={`text-xs ${isUp ? 'text-primary' : 'text-danger'}`}>
                    {isUp ? '+' : ''}{formatCurrency(dayChange)} today
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Crypto-Related Equities */}
      {coinStock && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Crypto-Related Stocks</h2>
          <div className="bg-surface border border-surface-hover rounded-xl overflow-hidden">
            <Link
              to={`/stock/${coinStock.symbol}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center font-bold text-xs">
                  {coinStock.symbol}
                </div>
                <div>
                  <div className="font-bold text-sm">{coinStock.symbol}</div>
                  <div className="text-xs text-text-muted">{coinStock.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{formatCurrency(coinStock.currentPrice)}</div>
                <div className={`text-xs font-medium ${coinStock.change >= 0 ? 'text-primary' : 'text-danger'}`}>
                  {coinStock.change >= 0 ? '+' : ''}{coinStock.changePercent.toFixed(2)}%
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Educational Callout */}
      <div className="bg-surface border border-surface-hover rounded-xl p-6">
        <h3 className="font-bold mb-2">About Crypto on Xobinhood</h3>
        <p className="text-sm text-text-muted leading-relaxed">
          Xobinhood Crypto is not a member of FINRA or SIPC. Crypto is highly speculative and volatile. Investments in crypto involve significant risk, including the risk of losing all your invested amount.
        </p>
      </div>
    </div>
  );
}
