import React from 'react';

function fmt(val, price) {
  if (val === undefined || val === null) return '--';
  if (price >= 1000) return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 10) return val.toFixed(2);
  if (price >= 1) return val.toFixed(4);
  return val.toFixed(6);
}

export default function OHLCLegend({ symbol, symbolId, timeframe, candle, previousClose }) {
  const prev = previousClose || symbol?.previousClose || 0;
  const o = candle?.open;
  const h = candle?.high;
  const l = candle?.low;
  const c = candle?.close ?? candle?.value;

  const price = symbol?.price || c || 0;
  const change = c != null && prev ? c - prev : symbol?.change || 0;
  const changePct = prev ? (change / prev) * 100 : symbol?.changePercent || 0;
  const isUp = change >= 0;

  const tfLabels = { '1': '1m', '5': '5m', '15': '15m', '60': '1h', '240': '4h', 'D': '1D', 'W': '1W', 'M': '1M' };
  const tfLabel = tfLabels[timeframe] || timeframe;

  const colorFor = (val) => {
    if (val == null) return 'var(--text-secondary)';
    return val >= prev ? 'var(--up)' : 'var(--down)';
  };

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      left: 12,
      zIndex: 5,
      pointerEvents: 'none',
      userSelect: 'none',
      lineHeight: 1.6,
    }}>
      {/* Symbol name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{symbolId}</span>
        {symbol?.exchange && (
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'rgba(120,123,134,0.2)', padding: '1px 5px', borderRadius: 3 }}>
            {symbol.exchange}
          </span>
        )}
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tfLabel}</span>
      </div>

      {/* OHLC row */}
      {(o != null || h != null || l != null || c != null) && (
        <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-primary)', marginBottom: 1 }}>
          <span>
            <span style={{ color: 'var(--text-secondary)' }}>O </span>
            <span style={{ color: colorFor(o) }}>{fmt(o, price)}</span>
          </span>
          <span>
            <span style={{ color: 'var(--text-secondary)' }}>H </span>
            <span style={{ color: colorFor(h) }}>{fmt(h, price)}</span>
          </span>
          <span>
            <span style={{ color: 'var(--text-secondary)' }}>L </span>
            <span style={{ color: colorFor(l) }}>{fmt(l, price)}</span>
          </span>
          <span>
            <span style={{ color: 'var(--text-secondary)' }}>C </span>
            <span style={{ color: colorFor(c) }}>{fmt(c, price)}</span>
          </span>
        </div>
      )}

      {/* Change row */}
      <div style={{ fontSize: 12, color: isUp ? 'var(--up)' : 'var(--down)' }}>
        {isUp ? '+' : ''}{fmt(change, Math.abs(change))} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
      </div>
    </div>
  );
}
