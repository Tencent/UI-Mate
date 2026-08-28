import React from 'react';
import { useAppContext } from '../../context/AppContext.jsx';

function fmt(val, decimals = 2) {
  if (val == null || (val === 0 && decimals > 2)) return '--';
  if (typeof val === 'number' && val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (typeof val === 'number' && val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (typeof val === 'number' && val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (typeof val === 'number' && val >= 1e4) return val.toLocaleString('en-US', { minimumFractionDigits: 2 });
  return typeof val === 'number' ? val.toFixed(decimals) : val;
}

function fmtPrice(price, type) {
  if (price == null) return '--';
  if (type === 'forex') return price.toFixed(4);
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtBigNum(n) {
  if (!n) return '--';
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

function StatRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '5px 0', borderBottom: '1px solid rgba(42,46,57,0.6)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

const TYPE_LABELS = { stock: 'Stock', crypto: 'Crypto', forex: 'Forex', index: 'Index', futures: 'Futures' };
const TYPE_COLORS = { stock: '#2962FF', crypto: '#F7931A', forex: '#00BCD4', index: '#9C27B0', futures: '#FF6D00' };

export default function SymbolDetailsPanel() {
  const { state } = useAppContext();
  const { chartState, symbols } = state;
  const sym = symbols[chartState.symbolId];

  if (!sym) {
    return (
      <div style={{ padding: 24, color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
        No symbol selected
      </div>
    );
  }

  const isUp = sym.change >= 0;
  const typeColor = TYPE_COLORS[sym.type] || '#2962FF';
  const typeLabel = TYPE_LABELS[sym.type] || sym.type;

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px 8px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{sym.id}</span>
          <span style={{
            fontSize: 10, padding: '2px 6px', borderRadius: 3,
            background: `${typeColor}22`, color: typeColor, fontWeight: 600,
          }}>
            {typeLabel}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{sym.exchange}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{sym.name}</div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 700 }}>
            {fmtPrice(sym.price, sym.type)}
          </span>
          <span style={{ fontSize: 14, color: isUp ? 'var(--up)' : 'var(--down)', fontWeight: 600 }}>
            {isUp ? '+' : ''}{sym.change?.toFixed(2)} ({isUp ? '+' : ''}{sym.changePercent?.toFixed(2)}%)
          </span>
        </div>

        {sym.currency && (
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{sym.currency}</div>
        )}
      </div>

      {/* Stats grid */}
      <div style={{ padding: '8px 14px' }}>
        <StatRow label="Prev. Close" value={fmtPrice(sym.previousClose, sym.type)} />
        <StatRow label="Open" value={fmtPrice(sym.open, sym.type)} />
        <StatRow label="Day's High" value={fmtPrice(sym.high, sym.type)} />
        <StatRow label="Day's Low" value={fmtPrice(sym.low, sym.type)} />
        <StatRow label="52W High" value={fmtPrice(sym.week52High, sym.type)} />
        <StatRow label="52W Low" value={fmtPrice(sym.week52Low, sym.type)} />
        {sym.volume > 0 && <StatRow label="Volume" value={fmtBigNum(sym.volume)} />}
        {sym.avgVolume > 0 && <StatRow label="Avg Volume" value={fmtBigNum(sym.avgVolume)} />}
        {sym.marketCap != null && <StatRow label="Market Cap" value={fmtBigNum(sym.marketCap)} />}
        {sym.pe != null && <StatRow label="P/E Ratio" value={sym.pe?.toFixed(1)} />}
        {sym.eps != null && <StatRow label="EPS" value={`$${sym.eps?.toFixed(2)}`} />}
        {sym.dividendYield != null && sym.dividendYield > 0 && <StatRow label="Div. Yield" value={`${sym.dividendYield?.toFixed(2)}%`} />}
        {sym.beta != null && <StatRow label="Beta" value={sym.beta?.toFixed(2)} />}
        {sym.sector && <StatRow label="Sector" value={sym.sector} />}
        {sym.industry && <StatRow label="Industry" value={sym.industry} />}
        {sym.rsi14 != null && <StatRow label="RSI (14)" value={sym.rsi14?.toFixed(1)} />}
        {sym.recommendation && <StatRow label="Analyst Rating" value={sym.recommendation} />}
      </div>

      {/* Performance */}
      {(sym.weeklyPerf != null) && (
        <div style={{ padding: '0 14px 8px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, paddingTop: 6, paddingBottom: 4 }}>
            PERFORMANCE
          </div>
          {[
            { label: '1 Week', val: sym.weeklyPerf },
            { label: '1 Month', val: sym.monthlyPerf },
            { label: '3 Months', val: sym.threeMonthPerf },
            { label: '6 Months', val: sym.sixMonthPerf },
            { label: 'YTD', val: sym.ytdPerf },
            { label: '1 Year', val: sym.yearlyPerf },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '4px 0', borderBottom: '1px solid rgba(42,46,57,0.6)',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: item.val >= 0 ? 'var(--up)' : 'var(--down)',
              }}>
                {item.val >= 0 ? '+' : ''}{item.val?.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {sym.description && (
        <div style={{ padding: '8px 14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>DESCRIPTION</div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{sym.description}</p>
        </div>
      )}
    </div>
  );
}
