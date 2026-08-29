import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { createChart, CandlestickSeries, LineSeries, AreaSeries, HistogramSeries } from 'lightweight-charts';
import { useAppContext } from '../../context/AppContext.jsx';
import OHLCLegend from './OHLCLegend.jsx';
import { chartScreenshotRef } from '../Toolbar/TopToolbar.jsx';

// Calculate SMA
function calcSMA(candles, length) {
  return candles.map((c, i) => {
    if (i < length - 1) return null;
    const slice = candles.slice(i - length + 1, i + 1);
    const avg = slice.reduce((s, x) => s + x.close, 0) / length;
    return { time: c.time, value: avg };
  }).filter(Boolean);
}

// Calculate EMA
function calcEMA(candles, length) {
  const k = 2 / (length + 1);
  let ema = null;
  return candles.map((c, i) => {
    if (i === 0) { ema = c.close; return null; }
    ema = c.close * k + ema * (1 - k);
    if (i < length - 1) return null;
    return { time: c.time, value: ema };
  }).filter(Boolean);
}

// Calculate VWAP (Volume Weighted Average Price, resets daily)
function calcVWAP(candles) {
  let cumPV = 0, cumV = 0;
  return candles.map(c => {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    const vol = c.volume || 1;
    cumPV += typicalPrice * vol;
    cumV += vol;
    return { time: c.time, value: cumPV / cumV };
  });
}

// Calculate Bollinger Bands (returns upper, middle, lower)
function calcBB(candles, length, stdDev) {
  const upper = [], middle = [], lower = [];
  for (let i = length - 1; i < candles.length; i++) {
    const slice = candles.slice(i - length + 1, i + 1);
    const avg = slice.reduce((s, c) => s + c.close, 0) / length;
    const variance = slice.reduce((s, c) => s + Math.pow(c.close - avg, 2), 0) / length;
    const sd = Math.sqrt(variance) * stdDev;
    middle.push({ time: candles[i].time, value: avg });
    upper.push({ time: candles[i].time, value: avg + sd });
    lower.push({ time: candles[i].time, value: avg - sd });
  }
  return { upper, middle, lower };
}

// Calculate RSI
function calcRSI(candles, length) {
  const result = [];
  let gains = 0, losses = 0;
  for (let i = 1; i <= length; i++) {
    const d = candles[i].close - candles[i - 1].close;
    if (d >= 0) gains += d; else losses -= d;
  }
  let avgGain = gains / length;
  let avgLoss = losses / length;
  for (let i = length; i < candles.length; i++) {
    const d = candles[i].close - candles[i - 1].close;
    const g = d >= 0 ? d : 0;
    const l = d < 0 ? -d : 0;
    avgGain = (avgGain * (length - 1) + g) / length;
    avgLoss = (avgLoss * (length - 1) + l) / length;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push({ time: candles[i].time, value: 100 - 100 / (1 + rs) });
  }
  return result;
}

// Calculate MACD (EMA fast - EMA slow, with signal line)
function calcMACD(candles, fast, slow, signal) {
  const result = [];
  const kFast = 2 / (fast + 1), kSlow = 2 / (slow + 1);
  let emaFast = candles[0].close, emaSlow = candles[0].close;
  const macdLine = [];
  for (let i = 0; i < candles.length; i++) {
    emaFast = candles[i].close * kFast + emaFast * (1 - kFast);
    emaSlow = candles[i].close * kSlow + emaSlow * (1 - kSlow);
    if (i >= slow - 1) macdLine.push({ time: candles[i].time, value: emaFast - emaSlow });
  }
  // Signal line = EMA(MACD, signal)
  const kSig = 2 / (signal + 1);
  let sigEma = macdLine[0]?.value || 0;
  for (let i = 0; i < macdLine.length; i++) {
    sigEma = macdLine[i].value * kSig + sigEma * (1 - kSig);
    if (i >= signal - 1) result.push({ time: macdLine[i].time, value: macdLine[i].value });
  }
  return result;
}

// Calculate ATR (Average True Range)
function calcATR(candles, length) {
  const result = [];
  const trs = candles.map((c, i) => {
    if (i === 0) return c.high - c.low;
    const prevClose = candles[i - 1].close;
    return Math.max(c.high - c.low, Math.abs(c.high - prevClose), Math.abs(c.low - prevClose));
  });
  let atr = trs.slice(0, length).reduce((s, v) => s + v, 0) / length;
  for (let i = length; i < candles.length; i++) {
    atr = (atr * (length - 1) + trs[i]) / length;
    result.push({ time: candles[i].time, value: atr });
  }
  return result;
}

// Calculate Stochastic %K
function calcSTOCH(candles, kLength, dSmooth) {
  const result = [];
  for (let i = kLength - 1; i < candles.length; i++) {
    const slice = candles.slice(i - kLength + 1, i + 1);
    const lowestLow = Math.min(...slice.map(c => c.low));
    const highestHigh = Math.max(...slice.map(c => c.high));
    const range = highestHigh - lowestLow;
    const k = range === 0 ? 50 : ((candles[i].close - lowestLow) / range) * 100;
    result.push({ time: candles[i].time, value: k });
  }
  return result;
}

// Convert candles to Heikin-Ashi
function toHeikinAshi(candles) {
  return candles.map((c, i) => {
    const haClose = (c.open + c.high + c.low + c.close) / 4;
    const haOpen = i === 0
      ? (c.open + c.close) / 2
      : (candles[i - 1].open + candles[i - 1].close) / 2;
    const haHigh = Math.max(c.high, haOpen, haClose);
    const haLow = Math.min(c.low, haOpen, haClose);
    return { ...c, open: haOpen, high: haHigh, low: haLow, close: haClose };
  });
}

// Drawing overlay using SVG and positioned elements
function DrawingOverlay({ drawings, chartRef, mainSeriesRef, containerRef, symbolId, timeframe }) {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    if (!chartRef.current || !mainSeriesRef.current || !containerRef.current) return;

    const chart = chartRef.current;
    const series = mainSeriesRef.current;
    const container = containerRef.current;

    const relevantDrawings = drawings.filter(d =>
      d.symbolId === symbolId && d.timeframe === timeframe && d.visible
    );

    const w = container.clientWidth;
    const h = container.clientHeight;

    const converted = relevantDrawings.map(d => {
      try {
        if (d.type === 'horizontal_line') {
          const y = series.priceToCoordinate(d.points[0].price);
          if (y === null) return null;
          return { ...d, y };
        }
        if (d.type === 'vertical_line') {
          const x = chart.timeScale().timeToCoordinate(d.points[0].time);
          if (x === null) return null;
          return { ...d, x };
        }
        if (d.type === 'trendline') {
          const x1 = chart.timeScale().timeToCoordinate(d.points[0].time);
          const y1 = series.priceToCoordinate(d.points[0].price);
          const x2 = chart.timeScale().timeToCoordinate(d.points[1].time);
          const y2 = series.priceToCoordinate(d.points[1].price);
          if (x1 === null || y1 === null || x2 === null || y2 === null) return null;
          return { ...d, x1, y1, x2, y2, w, h };
        }
        if (d.type === 'rectangle') {
          const x1 = chart.timeScale().timeToCoordinate(d.points[0].time);
          const y1 = series.priceToCoordinate(d.points[0].price);
          const x2 = chart.timeScale().timeToCoordinate(d.points[1].time);
          const y2 = series.priceToCoordinate(d.points[1].price);
          if (x1 === null || y1 === null || x2 === null || y2 === null) return null;
          return { ...d, x1: Math.min(x1, x2), y1: Math.min(y1, y2), x2: Math.max(x1, x2), y2: Math.max(y1, y2) };
        }
        if (d.type === 'text') {
          const x = chart.timeScale().timeToCoordinate(d.points[0].time);
          const y = series.priceToCoordinate(d.points[0].price);
          if (x === null || y === null) return null;
          return { ...d, x, y };
        }
        if (d.type === 'fibonacci') {
          const x1 = chart.timeScale().timeToCoordinate(d.points[0].time);
          const y1 = series.priceToCoordinate(d.points[0].price);
          const x2 = chart.timeScale().timeToCoordinate(d.points[1].time);
          const y2 = series.priceToCoordinate(d.points[1].price);
          if (x1 === null || y1 === null || x2 === null || y2 === null) return null;
          return { ...d, x1, y1, x2, y2, w, h };
        }
        return null;
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    setElements(converted);
  }, [drawings, symbolId, timeframe]);

  const w = containerRef.current?.clientWidth || 0;
  const h = containerRef.current?.clientHeight || 0;

  const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
      width={w}
      height={h}
    >
      {elements.map(d => {
        const color = d.style?.color || '#EF5350';
        const lw = d.style?.lineWidth || 1;
        const dashed = d.style?.lineStyle === 'dashed' ? '6,3' : undefined;

        if (d.type === 'horizontal_line') {
          return (
            <g key={d.id}>
              <line
                x1={0} y1={d.y} x2={w} y2={d.y}
                stroke={color} strokeWidth={lw}
                strokeDasharray={dashed}
              />
              {d.text && (
                <text x={8} y={d.y - 4} fill={color} fontSize={11} fontFamily='"Trebuchet MS", sans-serif'>
                  {d.text}
                </text>
              )}
            </g>
          );
        }
        if (d.type === 'vertical_line') {
          return (
            <line
              key={d.id}
              x1={d.x} y1={0} x2={d.x} y2={h}
              stroke={color} strokeWidth={lw}
              strokeDasharray={dashed}
            />
          );
        }
        if (d.type === 'trendline') {
          // Extend the line across the full chart width
          const dx = d.x2 - d.x1;
          const dy = d.y2 - d.y1;
          const slope = dx !== 0 ? dy / dx : 0;
          const extX1 = 0;
          const extY1 = d.y1 - slope * d.x1;
          const extX2 = w;
          const extY2 = d.y1 + slope * (w - d.x1);
          return (
            <g key={d.id}>
              <line
                x1={extX1} y1={extY1} x2={extX2} y2={extY2}
                stroke={color} strokeWidth={lw}
                strokeDasharray={dashed}
              />
              <circle cx={d.x1} cy={d.y1} r={4} fill={color} />
              <circle cx={d.x2} cy={d.y2} r={4} fill={color} />
            </g>
          );
        }
        if (d.type === 'rectangle') {
          const rx = d.x1, ry = d.y1;
          const rw = d.x2 - d.x1, rh = d.y2 - d.y1;
          return (
            <g key={d.id}>
              <rect
                x={rx} y={ry} width={rw} height={rh}
                fill={d.style?.fillColor || 'rgba(41,98,255,0.08)'}
                stroke={color} strokeWidth={lw}
                strokeDasharray={dashed}
              />
            </g>
          );
        }
        if (d.type === 'text') {
          return (
            <text
              key={d.id}
              x={d.x} y={d.y}
              fill={color} fontSize={13}
              fontFamily='"Trebuchet MS", sans-serif'
              fontWeight={600}
            >
              {d.text || 'Text'}
            </text>
          );
        }
        if (d.type === 'fibonacci') {
          const highPrice = d.points[0].price;
          const lowPrice = d.points[1].price;
          const priceRange = highPrice - lowPrice;
          return (
            <g key={d.id}>
              {FIB_LEVELS.map(level => {
                const price = highPrice - priceRange * level;
                try {
                  const y = chartRef.current && mainSeriesRef.current
                    ? mainSeriesRef.current.priceToCoordinate(price)
                    : null;
                  if (y === null) return null;
                  const fibColor = level === 0 || level === 1.0 ? color : `${color}99`;
                  return (
                    <g key={level}>
                      <line x1={0} y1={y} x2={w} y2={y} stroke={fibColor} strokeWidth={1} />
                      <text x={4} y={y - 3} fill={fibColor} fontSize={10} fontFamily='"Trebuchet MS", sans-serif'>
                        {(level * 100).toFixed(1)}% ({price.toFixed(2)})
                      </text>
                    </g>
                  );
                } catch (e) { return null; }
              })}
            </g>
          );
        }
        return null;
      })}
    </svg>
  );
}

export default function ChartContainer() {
  const { state, addDrawing, setSelectedDrawingTool } = useAppContext();
  const { chartState, candleData, symbols, indicators, drawings } = state;
  const { symbolId, timeframe, chartType } = chartState;
  const selectedTool = state.uiState.selectedDrawingTool;

  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const mainSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const indicatorSeriesRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // Drawing interaction state
  const drawingStateRef = useRef({ active: false, firstPoint: null });
  const [measureLabel, setMeasureLabel] = useState(null);
  const [pendingPoint, setPendingPoint] = useState(null); // for two-point drawings

  // Zoom state
  const zoomStateRef = useRef({ active: false, startX: null });
  const [zoomBox, setZoomBox] = useState(null);

  const [hoveredCandle, setHoveredCandle] = useState(null);

  const candles = candleData[symbolId]?.[timeframe] || [];
  const sym = symbols[symbolId] || {};

  // Escape key to deselect drawing tool / cancel active drawing
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (drawingStateRef.current.active) {
          drawingStateRef.current = { active: false, firstPoint: null };
          setPendingPoint(null);
        }
        if (zoomStateRef.current.active) {
          zoomStateRef.current = { active: false, startX: null };
          setZoomBox(null);
        }
        if (selectedTool && selectedTool !== 'cursor') {
          setSelectedDrawingTool('cursor');
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [selectedTool, setSelectedDrawingTool]);

  // Build volume data — memoized so initChart's useCallback doesn't re-fire on every render
  const volumeData = useMemo(() => candles.map(c => ({
    time: c.time,
    value: c.volume,
    color: c.close >= c.open ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.5)',
  })), [candles]);

  const initChart = useCallback(() => {
    if (!containerRef.current) return;

    // Cleanup previous
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
    indicatorSeriesRef.current = {};

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#131722' },
        textColor: '#D1D4DC',
        fontFamily: '"Trebuchet MS", Roboto, Ubuntu, sans-serif',
      },
      grid: {
        vertLines: { color: '#2A2E39' },
        horzLines: { color: '#2A2E39' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#9598A1', width: 1, style: 1 },
        horzLine: { color: '#9598A1', width: 1, style: 1 },
      },
      rightPriceScale: {
        borderColor: '#2A2E39',
        textColor: '#787B86',
        mode: 0,
      },
      timeScale: {
        borderColor: '#2A2E39',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        shiftVisibleRangeOnNewBar: true,
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });
    chartRef.current = chart;

    // Set up chart screenshot ref
    chartScreenshotRef.current = chart;

    // Main series based on chartType
    let mainSeries;
    if (chartType === 'Line') {
      mainSeries = chart.addSeries(LineSeries, {
        color: '#2962FF',
        lineWidth: 2,
        priceScaleId: 'right',
      });
      mainSeries.setData(candles.map(c => ({ time: c.time, value: c.close })));
    } else if (chartType === 'Area') {
      mainSeries = chart.addSeries(AreaSeries, {
        topColor: 'rgba(41,98,255,0.4)',
        bottomColor: 'rgba(41,98,255,0)',
        lineColor: '#2962FF',
        lineWidth: 2,
        priceScaleId: 'right',
      });
      mainSeries.setData(candles.map(c => ({ time: c.time, value: c.close })));
    } else if (chartType === 'Baseline') {
      const midPrice = candles.length > 0
        ? (Math.max(...candles.map(c => c.high)) + Math.min(...candles.map(c => c.low))) / 2
        : 0;
      mainSeries = chart.addSeries(AreaSeries, {
        topColor: 'rgba(38,166,154,0.3)',
        bottomColor: 'rgba(239,83,80,0.3)',
        lineColor: '#2962FF',
        lineWidth: 2,
        priceScaleId: 'right',
      });
      mainSeries.setData(candles.map(c => ({ time: c.time, value: c.close })));
    } else if (chartType === 'Heikin Ashi') {
      const haCandles = toHeikinAshi(candles);
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#26A69A',
        downColor: '#EF5350',
        borderVisible: false,
        wickUpColor: '#26A69A',
        wickDownColor: '#EF5350',
        priceScaleId: 'right',
      });
      mainSeries.setData(haCandles);
    } else if (chartType === 'Hollow Candles') {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: 'transparent',
        downColor: '#EF5350',
        borderVisible: true,
        borderUpColor: '#26A69A',
        borderDownColor: '#EF5350',
        wickUpColor: '#26A69A',
        wickDownColor: '#EF5350',
        priceScaleId: 'right',
      });
      mainSeries.setData(candles);
    } else if (chartType === 'Bars') {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#26A69A',
        downColor: '#EF5350',
        borderVisible: true,
        borderUpColor: '#26A69A',
        borderDownColor: '#EF5350',
        wickUpColor: '#26A69A',
        wickDownColor: '#EF5350',
        priceScaleId: 'right',
      });
      mainSeries.setData(candles);
    } else {
      // Default: Candles
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#26A69A',
        downColor: '#EF5350',
        borderVisible: false,
        wickUpColor: '#26A69A',
        wickDownColor: '#EF5350',
        priceScaleId: 'right',
      });
      mainSeries.setData(candles);
    }
    mainSeriesRef.current = mainSeries;

    // Volume
    const volSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      color: 'rgba(38,166,154,0.5)',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volSeries.setData(volumeData);
    volumeSeriesRef.current = volSeries;

    // Indicator series
    const indicatorSeries = {};
    for (const ind of indicators) {
      if (!ind.visible) continue;
      if (ind.paneIndex === 0) {
        let data = [];
        if (ind.type === 'SMA') {
          data = calcSMA(candles, ind.inputs.length || 20);
        } else if (ind.type === 'EMA') {
          data = calcEMA(candles, ind.inputs.length || 50);
        } else if (ind.type === 'VWAP') {
          data = calcVWAP(candles);
        } else if (ind.type === 'BB') {
          const bbData = calcBB(candles, ind.inputs.length || 20, ind.inputs.stdDev || 2);
          // Add three lines for BB
          for (const [key, bbLineData] of [['upper', bbData.upper], ['middle', bbData.middle], ['lower', bbData.lower]]) {
            if (bbLineData.length > 0) {
              const bbSeries = chart.addSeries(LineSeries, {
                color: ind.style?.color || '#9C27B0',
                lineWidth: key === 'middle' ? 1 : (ind.style?.lineWidth || 1),
                priceScaleId: 'right',
                title: key === 'middle' ? `${ind.name} Mid` : key === 'upper' ? `${ind.name} Upper` : `${ind.name} Lower`,
                lineStyle: key === 'middle' ? 1 : 0,
              });
              bbSeries.setData(bbLineData);
              indicatorSeries[`${ind.id}_${key}`] = bbSeries;
            }
          }
          continue; // BB is handled separately
        }
        if (data.length > 0) {
          const series = chart.addSeries(LineSeries, {
            color: ind.style?.color || '#2962FF',
            lineWidth: ind.style?.lineWidth || 2,
            priceScaleId: 'right',
            title: ind.name,
            lineStyle: ind.style?.lineStyle === 'dashed' ? 1 : 0,
          });
          series.setData(data);
          indicatorSeries[ind.id] = series;
        }
      } else {
        let data = [];
        if (ind.type === 'RSI') {
          data = calcRSI(candles, ind.inputs.length || 14);
        } else if (ind.type === 'MACD') {
          data = calcMACD(candles, ind.inputs.fast || 12, ind.inputs.slow || 26, ind.inputs.signal || 9);
        } else if (ind.type === 'ATR') {
          data = calcATR(candles, ind.inputs.length || 14);
        } else if (ind.type === 'STOCH') {
          data = calcSTOCH(candles, ind.inputs.kLength || 14, ind.inputs.dSmooth || 3);
        }
        if (data.length > 0 && ind.type !== 'VOL') {
          const subPaneId = `subpane_${ind.id}`;
          const series = chart.addSeries(LineSeries, {
            color: ind.style?.color || '#E91E63',
            lineWidth: ind.style?.lineWidth || 2,
            priceScaleId: subPaneId,
            title: ind.name,
          });
          chart.priceScale(subPaneId).applyOptions({
            scaleMargins: { top: 0.6, bottom: 0 },
          });
          series.setData(data);
          indicatorSeries[ind.id] = series;
        }
      }
    }
    indicatorSeriesRef.current = indicatorSeries;

    // Crosshair handler
    chart.subscribeCrosshairMove(param => {
      if (!param.point || !param.seriesData) {
        setHoveredCandle(null);
        return;
      }
      const data = param.seriesData.get(mainSeries);
      if (data) {
        setHoveredCandle(data);
      }
    });

    chart.timeScale().fitContent();

    return chart;
  }, [candles, volumeData, indicators, chartType]);

  useEffect(() => {
    const chart = initChart();
    if (!chart) return;

    // ResizeObserver
    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (chartRef.current && containerRef.current) {
          chartRef.current.applyOptions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
          });
        }
      });
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      chartScreenshotRef.current = null;
    };
  }, [initChart]);

  // Handle drawing overlay clicks
  const handleOverlayClick = useCallback((e) => {
    if (!selectedTool || selectedTool === 'cursor' || selectedTool === 'crosshair') return;
    if (!chartRef.current || !mainSeriesRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const time = chartRef.current.timeScale().coordinateToTime(x);
    const price = mainSeriesRef.current.coordinateToPrice(y);

    if (time === null || price === null) return;

    const singlePointTools = ['horizontal_line', 'vertical_line', 'text'];
    const twoPointTools = ['trend_line', 'rectangle', 'fibonacci', 'measure'];

    if (singlePointTools.includes(selectedTool)) {
      const drawing = {
        symbolId,
        timeframe,
        type: selectedTool,
        points: [{ time, price }],
        style: {
          color: selectedTool === 'horizontal_line' ? '#EF5350' : '#2962FF',
          lineWidth: 1,
          lineStyle: selectedTool === 'horizontal_line' ? 'dashed' : 'solid',
          fillColor: null,
          extendLeft: false,
          extendRight: false,
          showLabel: true,
        },
        text: selectedTool === 'text' ? 'Text' : null,
        locked: false,
        visible: true,
      };
      addDrawing(drawing);
      setSelectedDrawingTool('cursor');
      setPendingPoint(null);
    } else if (twoPointTools.includes(selectedTool)) {
      if (!drawingStateRef.current.active) {
        drawingStateRef.current = { active: true, firstPoint: { time, price } };
        setPendingPoint({ x, y });
      } else {
        const firstPoint = drawingStateRef.current.firstPoint;
        drawingStateRef.current = { active: false, firstPoint: null };
        setPendingPoint(null);

        if (selectedTool === 'measure') {
          const priceDiff = price - firstPoint.price;
          const pricePct = ((price - firstPoint.price) / firstPoint.price * 100).toFixed(2);
          setMeasureLabel({
            x: (x + pendingPoint?.x || x) / 2,
            y: (y + pendingPoint?.y || y) / 2,
            text: `${priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(2)} (${pricePct}%)`,
          });
          setTimeout(() => setMeasureLabel(null), 5000);
          setSelectedDrawingTool('cursor');
          return;
        }

        const drawing = {
          symbolId,
          timeframe,
          type: selectedTool === 'trend_line' ? 'trendline' : selectedTool,
          points: [firstPoint, { time, price }],
          style: {
            color: selectedTool === 'fibonacci' ? '#E65100' : '#2962FF',
            lineWidth: 2,
            lineStyle: 'solid',
            fillColor: selectedTool === 'rectangle' ? 'rgba(41,98,255,0.08)' : null,
            extendLeft: false,
            extendRight: false,
            showLabel: true,
          },
          text: null,
          locked: false,
          visible: true,
        };
        addDrawing(drawing);
        setSelectedDrawingTool('cursor');
      }
    }
  }, [selectedTool, symbolId, timeframe, addDrawing, setSelectedDrawingTool, pendingPoint]);

  const handleOverlayMouseMove = useCallback((e) => {
    if (!drawingStateRef.current.active) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPendingPoint({ x, y });
  }, []);

  const isDrawingActive = selectedTool && selectedTool !== 'cursor' && selectedTool !== 'crosshair' && selectedTool !== 'eraser' && selectedTool !== 'zoom';
  const isZoomActive = selectedTool === 'zoom';

  // Zoom tool handlers
  const handleZoomMouseDown = useCallback((e) => {
    if (!isZoomActive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    zoomStateRef.current = { active: true, startX: x };
    setZoomBox({ x1: x, x2: x });
  }, [isZoomActive]);

  const handleZoomMouseMove = useCallback((e) => {
    if (!zoomStateRef.current.active || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setZoomBox({ x1: zoomStateRef.current.startX, x2: x });
  }, []);

  const handleZoomMouseUp = useCallback((e) => {
    if (!zoomStateRef.current.active || !containerRef.current || !chartRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x2 = e.clientX - rect.left;
    const x1 = zoomStateRef.current.startX;
    zoomStateRef.current = { active: false, startX: null };
    setZoomBox(null);
    // Apply zoom to chart time scale
    const fromTime = chartRef.current.timeScale().coordinateToTime(Math.min(x1, x2));
    const toTime = chartRef.current.timeScale().coordinateToTime(Math.max(x1, x2));
    if (fromTime !== null && toTime !== null && fromTime !== toTime) {
      chartRef.current.timeScale().setVisibleRange({ from: fromTime, to: toTime });
    }
    setSelectedDrawingTool('cursor');
  }, [setSelectedDrawingTool]);

  const latestCandle = candles.length > 0 ? candles[candles.length - 1] : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#131722', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Drawing overlay SVG */}
      <DrawingOverlay
        drawings={drawings}
        chartRef={chartRef}
        mainSeriesRef={mainSeriesRef}
        containerRef={containerRef}
        symbolId={symbolId}
        timeframe={timeframe}
      />

      {/* Interactive overlay for capturing clicks when drawing tool is active */}
      {isDrawingActive && (
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            cursor: 'crosshair',
            zIndex: 5,
          }}
          onClick={handleOverlayClick}
          onMouseMove={handleOverlayMouseMove}
        />
      )}

      {/* Zoom tool overlay */}
      {isZoomActive && (
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            cursor: 'zoom-in',
            zIndex: 5,
          }}
          onMouseDown={handleZoomMouseDown}
          onMouseMove={handleZoomMouseMove}
          onMouseUp={handleZoomMouseUp}
        />
      )}

      {/* Zoom selection box */}
      {zoomBox && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: Math.min(zoomBox.x1, zoomBox.x2),
          width: Math.abs(zoomBox.x2 - zoomBox.x1),
          height: containerRef.current?.clientHeight || '100%',
          background: 'rgba(41,98,255,0.12)',
          border: '1px solid rgba(41,98,255,0.5)',
          pointerEvents: 'none',
          zIndex: 6,
        }} />
      )}

      {/* Preview line for two-point drawings */}
      {drawingStateRef.current.active && pendingPoint && (
        <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 6 }}
          width={containerRef.current?.clientWidth || 0}
          height={containerRef.current?.clientHeight || 0}
        >
          <circle cx={pendingPoint.x} cy={pendingPoint.y} r={5} fill='rgba(41,98,255,0.5)' />
          <text x={pendingPoint.x + 8} y={pendingPoint.y - 4} fill='#D1D4DC' fontSize={11} fontFamily='"Trebuchet MS", sans-serif'>
            Click to set second point
          </text>
        </svg>
      )}

      {/* Measure label */}
      {measureLabel && (
        <div style={{
          position: 'absolute',
          left: measureLabel.x,
          top: measureLabel.y,
          background: 'rgba(41,98,255,0.85)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          pointerEvents: 'none',
          zIndex: 7,
          transform: 'translate(-50%, -50%)',
        }}>
          {measureLabel.text}
        </div>
      )}

      <OHLCLegend
        symbol={sym}
        symbolId={symbolId}
        timeframe={timeframe}
        candle={hoveredCandle || latestCandle}
        previousClose={sym.previousClose}
      />
    </div>
  );
}
