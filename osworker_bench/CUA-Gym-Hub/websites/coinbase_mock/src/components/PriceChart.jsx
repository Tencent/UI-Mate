import React, { useState, useMemo, useRef } from 'react';

const TIME_RANGES = ['1D', '1W', '1M', '1Y', 'All'];

function PriceChart({ priceHistory, assetName }) {
  const [activeRange, setActiveRange] = useState('1M');
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  const data = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return [];
    const total = priceHistory.length;
    switch (activeRange) {
      case '1D':
        return priceHistory.slice(Math.max(0, total - 2));
      case '1W':
        return priceHistory.slice(Math.max(0, total - 3));
      case '1M':
        return priceHistory.slice(Math.max(0, total - 5));
      case '1Y':
        return priceHistory.slice(Math.max(0, total - 6));
      case 'All':
      default:
        return priceHistory;
    }
  }, [priceHistory, activeRange]);

  const chartWidth = 600;
  const chartHeight = 200;
  const padding = { top: 10, right: 10, bottom: 10, left: 10 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const { points, polylineStr, fillStr, isUp, minPrice, maxPrice } = useMemo(() => {
    if (data.length < 2) {
      return { points: [], polylineStr: '', fillStr: '', isUp: true, minPrice: 0, maxPrice: 0 };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const pts = data.map((price, i) => {
      const x = padding.left + (i / (data.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - ((price - min) / range) * innerHeight;
      return { x, y, price };
    });

    const lineStr = pts.map((p) => `${p.x},${p.y}`).join(' ');
    const fill =
      `${pts[0].x},${padding.top + innerHeight} ` +
      lineStr +
      ` ${pts[pts.length - 1].x},${padding.top + innerHeight}`;

    return {
      points: pts,
      polylineStr: lineStr,
      fillStr: fill,
      isUp: data[data.length - 1] >= data[0],
      minPrice: min,
      maxPrice: max,
    };
  }, [data, innerWidth, innerHeight, padding]);

  // Generate date labels for each data point (last N days)
  const dateLabels = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return [];
    const total = priceHistory.length;
    const today = new Date();
    // Each point in the full priceHistory represents one day going back from today
    return priceHistory.map((_, i) => {
      const daysAgo = total - 1 - i;
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return d;
    });
  }, [priceHistory]);

  const slicedDateLabels = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return [];
    const total = priceHistory.length;
    switch (activeRange) {
      case '1D':
        return dateLabels.slice(Math.max(0, total - 2));
      case '1W':
        return dateLabels.slice(Math.max(0, total - 3));
      case '1M':
        return dateLabels.slice(Math.max(0, total - 5));
      case '1Y':
        return dateLabels.slice(Math.max(0, total - 6));
      case 'All':
      default:
        return dateLabels;
    }
  }, [dateLabels, activeRange, priceHistory]);

  const formatDateLabel = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const lineColor = isUp ? '#05B169' : '#CF202F';
  const gradientId = `priceGradient-${assetName || 'chart'}`;

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const handleMouseMove = (e) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;

    let closestIdx = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });
    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const displayPrice =
    hoverIndex !== null && points[hoverIndex]
      ? points[hoverIndex].price
      : data.length > 0
        ? data[data.length - 1]
        : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <div className="text-2xl font-bold text-gray-900">
          {formatPrice(displayPrice)}
        </div>
        {hoverIndex !== null ? (
          <div className="text-xs text-gray-500 mt-0.5">
            {slicedDateLabels[hoverIndex] ? formatDateLabel(slicedDateLabels[hoverIndex]) : ''}
          </div>
        ) : (
          <div className={`text-xs font-medium mt-0.5 ${isUp ? 'text-[#05B169]' : 'text-[#CF202F]'}`}>
            {data.length >= 2
              ? `${isUp ? '+' : ''}${(((data[data.length - 1] - data[0]) / data[0]) * 100).toFixed(2)}%`
              : ''}
          </div>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto cursor-crosshair"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {data.length >= 2 && (
          <>
            <polygon
              points={fillStr}
              fill={`url(#${gradientId})`}
            />
            <polyline
              points={polylineStr}
              fill="none"
              stroke={lineColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {hoverIndex !== null && points[hoverIndex] && (
              <>
                <line
                  x1={points[hoverIndex].x}
                  y1={padding.top}
                  x2={points[hoverIndex].x}
                  y2={padding.top + innerHeight}
                  stroke="#9CA3AF"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={points[hoverIndex].x}
                  cy={points[hoverIndex].y}
                  r="4"
                  fill={lineColor}
                  stroke="white"
                  strokeWidth="2"
                />
              </>
            )}
          </>
        )}
      </svg>

      <div className="flex gap-1 mt-4 border-t border-gray-100 pt-3">
        {TIME_RANGES.map((range) => (
          <button
            key={range}
            onClick={() => setActiveRange(range)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              activeRange === range
                ? 'bg-[#0052FF] text-white'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PriceChart;
