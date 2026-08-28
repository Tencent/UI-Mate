import React, { useContext, useState, useMemo } from 'react';
import { CoinbaseContext } from '../context/CoinbaseContext';

const TIME_RANGES = ['1D', '1W', '1M', '1Y', 'All'];

function PortfolioChart() {
  const { state } = useContext(CoinbaseContext);
  const [activeRange, setActiveRange] = useState('1M');
  const [hoverIndex, setHoverIndex] = useState(null);

  const currentPortfolioValue = state.holdings.reduce((total, holding) => {
    const asset = state.assets.find((a) => a.id === holding.assetId);
    if (!asset) return total;
    return total + holding.quantity * asset.currentPrice;
  }, 0);

  const chartData = useMemo(() => {
    const pointCounts = { '1D': 24, '1W': 7, '1M': 30, '1Y': 12, 'All': 52 };
    const numPoints = pointCounts[activeRange] || 30;

    const points = [];
    for (let i = 0; i < numPoints; i++) {
      let value = 0;
      state.holdings.forEach((holding) => {
        const asset = state.assets.find((a) => a.id === holding.assetId);
        if (!asset || !asset.priceHistory || asset.priceHistory.length === 0) return;

        const histLen = asset.priceHistory.length;
        const histIndex = Math.min(Math.floor((i / numPoints) * histLen), histLen - 1);
        const basePrice = asset.priceHistory[histIndex];

        const volatility = activeRange === '1D' ? 0.005 : activeRange === '1W' ? 0.015 : activeRange === '1M' ? 0.04 : activeRange === '1Y' ? 0.15 : 0.25;
        const seed = (i * 7 + asset.id.charCodeAt(0) * 13) % 100;
        const noise = ((seed / 100) - 0.5) * 2 * volatility;
        const price = basePrice * (1 + noise * (1 - i / numPoints));
        value += holding.quantity * price;
      });
      points.push(value);
    }

    points[numPoints - 1] = currentPortfolioValue;
    return points;
  }, [state.holdings, state.assets, activeRange, currentPortfolioValue]);

  const formatCurrency = (val) => {
    return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const minVal = Math.min(...chartData);
  const maxVal = Math.max(...chartData);
  const range = maxVal - minVal || 1;

  const chartWidth = 600;
  const chartHeight = 200;
  const paddingY = 10;

  const pointsStr = chartData
    .map((val, i) => {
      const x = (i / (chartData.length - 1)) * chartWidth;
      const y = paddingY + (1 - (val - minVal) / range) * (chartHeight - 2 * paddingY);
      return `${x},${y}`;
    })
    .join(' ');

  const firstVal = chartData[0];
  const lastVal = chartData[chartData.length - 1];
  const periodChange = lastVal - firstVal;
  const periodChangePercent = firstVal > 0 ? ((periodChange / firstVal) * 100) : 0;
  const isPositive = periodChange >= 0;

  const displayValue = hoverIndex !== null ? chartData[hoverIndex] : lastVal;
  const displayChange = hoverIndex !== null ? chartData[hoverIndex] - firstVal : periodChange;
  const displayChangePercent = firstVal > 0 ? ((displayChange / firstVal) * 100) : 0;
  const displayIsPositive = displayChange >= 0;

  const strokeColor = isPositive ? '#05B169' : '#CF202F';

  const gradientId = 'portfolioGradient';

  const areaPath = `M0,${chartHeight} L${pointsStr.split(' ').map((p, i) => {
    const [x, y] = p.split(',');
    return i === 0 ? `${x},${y}` : ` ${x},${y}`;
  }).join('')} L${chartWidth},${chartHeight} Z`;

  const areaPoints = chartData
    .map((val, i) => {
      const x = (i / (chartData.length - 1)) * chartWidth;
      const y = paddingY + (1 - (val - minVal) / range) * (chartHeight - 2 * paddingY);
      return `${x},${y}`;
    });

  const areaD = `M0,${chartHeight} L${areaPoints.join(' L')} L${chartWidth},${chartHeight} Z`;

  const handleMouseMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    const idx = Math.round(ratio * (chartData.length - 1));
    if (idx >= 0 && idx < chartData.length) {
      setHoverIndex(idx);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const hoverX = hoverIndex !== null ? (hoverIndex / (chartData.length - 1)) * chartWidth : null;
  const hoverY = hoverIndex !== null
    ? paddingY + (1 - (chartData[hoverIndex] - minVal) / range) * (chartHeight - 2 * paddingY)
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-4">
        <div className="text-2xl font-bold text-gray-900">{formatCurrency(displayValue)}</div>
        <div className={`flex items-center gap-1 text-sm font-medium ${displayIsPositive ? 'text-[#05B169]' : 'text-[#CF202F]'}`}>
          <span>
            {displayIsPositive ? '+' : ''}{formatCurrency(displayChange)} ({displayIsPositive ? '+' : ''}{displayChangePercent.toFixed(2)}%)
          </span>
          <span className="text-gray-400 font-normal ml-1">{activeRange === '1D' ? 'Today' : activeRange}</span>
        </div>
      </div>

      <div className="w-full">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-48 cursor-crosshair"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradientId})`} />
          <polyline
            points={pointsStr}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {hoverIndex !== null && (
            <>
              <line
                x1={hoverX}
                y1={0}
                x2={hoverX}
                y2={chartHeight}
                stroke="#9CA3AF"
                strokeWidth="1"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={hoverX}
                cy={hoverY}
                r="4"
                fill={strokeColor}
                stroke="white"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>
      </div>

      <div className="flex gap-1 mt-4 border-t border-gray-100 pt-4">
        {TIME_RANGES.map((range) => (
          <button
            key={range}
            onClick={() => setActiveRange(range)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              activeRange === range
                ? 'bg-[#0052FF] text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PortfolioChart;
