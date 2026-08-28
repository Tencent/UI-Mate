import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import StockChart from '../components/StockChart';
import OrderForm from '../components/OrderForm';
import { formatNumber, formatCurrency } from '../lib/utils';
import { Star, X, ExternalLink } from 'lucide-react';

export default function StockDetail() {
  const { symbol } = useParams();
  const { state, toggleWatchlist } = useStore();
  const stock = state.stocks.find(s => s.symbol === symbol);
  const [selectedNewsItem, setSelectedNewsItem] = useState(null);

  if (!stock) {
    return <div className="p-8 text-center text-text-muted">Stock not found</div>;
  }

  const isUp = (stock.change || 0) >= 0;
  const inWatchlist = state.watchlist.includes(stock.symbol);
  const holding = state.portfolio[stock.symbol];

  // Related news
  const relatedNews = useMemo(() => {
    const related = state.news.filter(n =>
      n.relatedSymbols && n.relatedSymbols.includes(stock.symbol)
    );
    return related.length > 0 ? related : state.news.slice(0, 3);
  }, [state.news, stock.symbol]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        {/* Tags */}
        {stock.tags && stock.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {stock.tags.map(tag => (
              <span key={tag} className="text-xs font-medium text-primary border border-primary/40 rounded-full px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stock Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold mb-1">{stock.name}</h1>
          <div className="text-4xl font-bold tracking-tight mb-1">
            {formatCurrency(stock.currentPrice)}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={isUp ? 'text-primary' : 'text-danger'}>
              {isUp ? '+' : ''}{formatCurrency(stock.change)} ({isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </span>
            <span className="text-text-muted">Today</span>
          </div>
        </div>

        {/* Price Chart */}
        <div className="mb-4 border-b border-surface pb-4">
          <StockChart
            data={stock.history}
            intradayData={stock.intradayData}
            color={isUp ? '#00C805' : '#FF5000'}
            ranges={['1D', '1W', '1M', '3M', '1Y', '5Y', 'ALL']}
          />
        </div>

        {/* OHLCV Data */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-text-muted mb-6 px-1">
          <span>O: ${(stock.open || stock.prevClose).toFixed(2)}</span>
          <span>H: ${(stock.high || stock.currentPrice).toFixed(2)}</span>
          <span>L: ${(stock.low || stock.currentPrice).toFixed(2)}</span>
          <span>C: ${stock.currentPrice.toFixed(2)}</span>
          <span>V: {formatNumber(stock.volume)}</span>
        </div>

        {/* Your Position */}
        {holding && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">Your Position</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Equity Card */}
              <div className="bg-surface rounded-xl p-5 border border-surface-hover">
                <div className="text-sm text-text-muted mb-1">Your Equity</div>
                <div className="text-2xl font-bold mb-3">
                  {formatCurrency(holding.quantity * stock.currentPrice)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Cost</span>
                    <span>{formatCurrency(holding.quantity * holding.avgPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Today's Return</span>
                    <span className={holding.quantity * stock.change >= 0 ? 'text-primary' : 'text-danger'}>
                      {holding.quantity * stock.change >= 0 ? '+' : ''}
                      {formatCurrency(holding.quantity * stock.change)}
                      {' '}({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Total Return</span>
                    {(() => {
                      const totalReturn = (stock.currentPrice - holding.avgPrice) * holding.quantity;
                      const returnPct = ((stock.currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
                      return (
                        <span className={totalReturn >= 0 ? 'text-primary' : 'text-danger'}>
                          {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)} ({returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%)
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Average Cost Card */}
              <div className="bg-surface rounded-xl p-5 border border-surface-hover">
                <div className="text-sm text-text-muted mb-1">Your Average Cost</div>
                <div className="text-2xl font-bold mb-3">
                  {formatCurrency(holding.avgPrice)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Shares</span>
                    <span>{holding.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Portfolio Diversity</span>
                    <span>
                      {state.user.portfolioValue > 0
                        ? ((holding.quantity * stock.currentPrice / state.user.portfolioValue) * 100).toFixed(2)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">About</h2>
            <button
              onClick={() => toggleWatchlist(stock.symbol)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                inWatchlist
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-surface-hover hover:border-primary hover:text-primary'
              }`}
            >
              <Star size={14} fill={inWatchlist ? "currentColor" : "none"} />
              {inWatchlist ? 'Following' : 'Add to List'}
            </button>
          </div>
          <p className="text-sm text-text-muted leading-relaxed mb-6">
            {stock.about}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4">
            {[
              { label: 'Market Cap', value: formatNumber(stock.marketCap) },
              { label: 'P/E Ratio', value: stock.peRatio ? stock.peRatio.toFixed(1) : 'N/A' },
              { label: 'Dividend Yield', value: stock.dividendYield ? `${stock.dividendYield}%` : 'N/A' },
              { label: '52-Week High', value: stock.week52High ? `$${stock.week52High.toFixed(2)}` : 'N/A' },
              { label: '52-Week Low', value: stock.week52Low ? `$${stock.week52Low.toFixed(2)}` : 'N/A' },
              { label: 'Volume', value: formatNumber(stock.volume) },
              { label: 'Avg Volume', value: stock.avgVolume ? formatNumber(stock.avgVolume) : 'N/A' },
              { label: 'Sector', value: stock.sector },
              { label: 'CEO', value: stock.ceo || 'N/A' },
              { label: 'Headquarters', value: stock.headquarters || 'N/A' },
              { label: 'Employees', value: stock.employees ? stock.employees.toLocaleString() : 'N/A' },
              { label: 'Founded', value: stock.founded || 'N/A' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-xs text-text-muted mb-1">{stat.label}</div>
                <div className="text-sm font-medium">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Analyst Ratings */}
        {stock.analystRating && (stock.analystRating.buy > 0 || stock.analystRating.hold > 0 || stock.analystRating.sell > 0) && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">Analyst Ratings</h2>
            <div className="bg-surface rounded-xl p-5 border border-surface-hover">
              <AnalystRatingsBar rating={stock.analystRating} currentPrice={stock.currentPrice} />
            </div>
          </div>
        )}

        {/* Earnings */}
        {stock.earnings && stock.earnings.nextDate && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">Earnings</h2>
            <div className="bg-surface rounded-xl p-5 border border-surface-hover">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-text-muted mb-1">Next Earnings Date</div>
                  <div className="text-sm font-medium">
                    {new Date(stock.earnings.nextDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-muted mb-1">EPS Estimate</div>
                  <div className="text-sm font-medium">${stock.earnings.epsEstimate.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-text-muted mb-1">Revenue Estimate</div>
                  <div className="text-sm font-medium">{stock.earnings.revenueEstimate}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related News */}
        <div>
          <h2 className="text-lg font-bold mb-4">News</h2>
          <div className="space-y-1">
            {relatedNews.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedNewsItem(item)}
                className="flex gap-4 py-3 border-b border-surface hover:bg-surface/30 rounded px-2 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold">{item.source}</span>
                    <span className="text-xs text-text-muted">{item.time}</span>
                  </div>
                  <h3 className="font-bold text-sm line-clamp-2">{item.headline}</h3>
                </div>
                <img src={item.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg bg-surface-hover shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Panel */}
      <div className="w-full lg:w-96 shrink-0">
        <OrderForm stock={stock} />
      </div>

      {/* News Article Modal */}
      {selectedNewsItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedNewsItem(null)}>
          <div className="bg-surface rounded-xl border border-surface-hover max-w-lg w-full overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-hover shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary">{selectedNewsItem.source}</span>
                <span className="text-xs text-text-muted">{selectedNewsItem.time}</span>
              </div>
              <button onClick={() => setSelectedNewsItem(null)} className="text-text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto">
              <img
                src={selectedNewsItem.imageUrl}
                alt=""
                className="w-full h-48 object-cover bg-surface-hover"
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div className="p-5">
                <h2 className="text-lg font-bold mb-3 leading-snug">{selectedNewsItem.headline}</h2>
                <p className="text-sm text-text-muted leading-relaxed mb-4">{selectedNewsItem.summary}</p>
                {selectedNewsItem.relatedSymbols && selectedNewsItem.relatedSymbols.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedNewsItem.relatedSymbols.map(sym => (
                      <Link
                        key={sym}
                        to={`/stock/${sym}`}
                        onClick={() => setSelectedNewsItem(null)}
                        className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full hover:bg-primary/20 transition-colors flex items-center gap-1"
                      >
                        {sym}
                        <ExternalLink size={10} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalystRatingsBar({ rating, currentPrice }) {
  const total = rating.buy + rating.hold + rating.sell;
  if (total === 0) return null;

  const buyPct = (rating.buy / total) * 100;
  const holdPct = (rating.hold / total) * 100;
  const sellPct = (rating.sell / total) * 100;

  return (
    <div>
      {/* Bar */}
      <div className="flex rounded-full overflow-hidden h-3 mb-4">
        <div className="bg-primary transition-all" style={{ width: `${buyPct}%` }} />
        <div className="bg-yellow-500 transition-all" style={{ width: `${holdPct}%` }} />
        <div className="bg-danger transition-all" style={{ width: `${sellPct}%` }} />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-sm mb-4">
        <div className="text-center">
          <div className="text-primary font-bold">{rating.buy}</div>
          <div className="text-xs text-text-muted">Buy</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-500 font-bold">{rating.hold}</div>
          <div className="text-xs text-text-muted">Hold</div>
        </div>
        <div className="text-center">
          <div className="text-danger font-bold">{rating.sell}</div>
          <div className="text-xs text-text-muted">Sell</div>
        </div>
      </div>

      {/* Price Target */}
      {rating.priceTarget > 0 && (
        <div className="border-t border-surface-hover pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Price Target</span>
            <span className="text-sm font-bold">{formatCurrency(rating.priceTarget)}</span>
          </div>
          <div className="mt-2 relative h-2 bg-surface-hover rounded-full">
            {(() => {
              const low = Math.min(currentPrice, rating.priceTarget) * 0.9;
              const high = Math.max(currentPrice, rating.priceTarget) * 1.1;
              const range = high - low;
              const currentPos = ((currentPrice - low) / range) * 100;
              const targetPos = ((rating.priceTarget - low) / range) * 100;
              return (
                <>
                  <div className="absolute top-0 w-2 h-2 rounded-full bg-white border border-text-muted" style={{ left: `${Math.min(95, Math.max(5, currentPos))}%`, transform: 'translateX(-50%)' }} />
                  <div className="absolute top-0 w-2 h-2 rounded-full bg-primary" style={{ left: `${Math.min(95, Math.max(5, targetPos))}%`, transform: 'translateX(-50%)' }} />
                </>
              );
            })()}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-text-muted">
            <span>Current: {formatCurrency(currentPrice)}</span>
            <span>Target: {formatCurrency(rating.priceTarget)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
