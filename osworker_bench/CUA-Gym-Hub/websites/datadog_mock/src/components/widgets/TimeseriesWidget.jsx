import React, { useMemo } from 'react';
import { LineChart, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['#7B68EE', '#00BCD4', '#FF9800', '#E91E63', '#2ECC71'];

function generateMockData(points = 60) {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => ({
    time: now - (points - 1 - i) * 60000,
    value: Math.max(0, 40 + Math.sin(i / 10) * 20 + (Math.random() - 0.5) * 10),
    value2: Math.max(0, 30 + Math.sin(i / 8) * 15 + (Math.random() - 0.5) * 8),
    value3: Math.max(0, 25 + Math.sin(i / 12) * 10 + (Math.random() - 0.5) * 6),
  }));
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function TimeseriesWidget({ widget }) {
  const data = useMemo(() => generateMockData(60), [widget.id]);
  const def = widget.definition || {};
  const requests = def.requests || [{ displayType: 'line', color: CHART_COLORS[0] }];
  const yaxis = def.yaxis || {};
  const isArea = requests.some(r => r.displayType === 'area');
  const ChartComp = isArea ? AreaChart : LineChart;

  const valueKeys = requests.map((_, i) => i === 0 ? 'value' : i === 1 ? 'value2' : 'value3');

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartComp data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="time"
          tickFormatter={formatTime}
          tick={{ fontSize: 11, fill: '#6C6C80' }}
          axisLine={{ stroke: '#DCDCE0' }}
          tickLine={false}
          minTickGap={60}
        />
        <YAxis
          domain={[yaxis.min ?? 'auto', yaxis.max ?? 'auto']}
          tick={{ fontSize: 11, fill: '#6C6C80' }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          labelFormatter={formatTime}
          formatter={(val) => [val.toFixed(2)]}
          contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #DCDCE0' }}
        />
        {requests.map((req, idx) => {
          const color = req.color || CHART_COLORS[idx % CHART_COLORS.length];
          const key = valueKeys[idx] || 'value';
          if (req.displayType === 'area') {
            return (
              <Area
                key={idx}
                type="monotone"
                dataKey={key}
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            );
          }
          return (
            <Line
              key={idx}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          );
        })}
      </ChartComp>
    </ResponsiveContainer>
  );
}
