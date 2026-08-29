import React, { useState, useMemo, useId } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../lib/utils';

const DEFAULT_RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

export default function StockChart({ data, intradayData, color = "#00C805", ranges }) {
  const rangeList = ranges || DEFAULT_RANGES;
  const [activeRange, setActiveRange] = useState('1M');
  const [hoverData, setHoverData] = useState(null);
  const uid = useId();
  const gradientId = `chartGrad_${uid.replace(/:/g, '')}`;

  const chartData = useMemo(() => {
    if (activeRange === '1D') {
      // Use intraday data if available, otherwise fall back to last 8 daily points
      if (intradayData && intradayData.length >= 2) return intradayData;
      if (!data || data.length === 0) return [];
      return data.slice(Math.max(0, data.length - 8));
    }
    if (!data || data.length === 0) return [];
    const total = data.length;
    switch(activeRange) {
      case '1W': return data.slice(Math.max(0, total - 7));
      case '1M': return data.slice(Math.max(0, total - 30));
      case '3M': return data.slice(Math.max(0, total - 60));
      case '1Y': return data.slice(Math.max(0, total - 100));
      case '5Y': return data;
      case 'YTD': return data.slice(Math.max(0, total - 70));
      default: return data;
    }
  }, [data, intradayData, activeRange]);

  if (!chartData || chartData.length < 2) {
    return (
      <div className="w-full h-[250px] flex items-center justify-center text-text-muted text-sm">
        No chart data available
      </div>
    );
  }

  const firstPrice = chartData[0]?.price || 0;
  const lastPrice = chartData[chartData.length - 1]?.price || 0;
  const rangeChange = lastPrice - firstPrice;
  const isRangePositive = rangeChange >= 0;
  const chartColor = isRangePositive ? '#00C805' : '#FF5000';

  return (
    <div className="w-full">
      {/* Hover Price Display */}
      {hoverData && (
        <div className="mb-2">
          <div className="text-sm text-text-muted">{hoverData.date}</div>
          <div className="text-lg font-bold">{formatCurrency(hoverData.price)}</div>
        </div>
      )}

      <div className="h-[250px] w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            onMouseMove={(e) => {
              if (e.activePayload) {
                setHoverData(e.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoverData(null)}
            margin={{ top: 5, right: 5, bottom: 0, left: 5 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip
              content={() => null}
              cursor={{ stroke: '#666', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Range Buttons */}
      <div className="flex gap-0.5 mt-3">
        {rangeList.map(range => (
          <button
            key={range}
            onClick={() => { setActiveRange(range); setHoverData(null); }}
            className={`
              px-3 py-1.5 text-xs font-bold rounded-full transition-all
              ${activeRange === range
                ? 'text-primary bg-primary/10'
                : 'text-text-muted hover:text-text'
              }
            `}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
}
