import React, { useMemo } from 'react';

function generateHeatmapData(cols = 30, rows = 10) {
  const data = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const base = Math.sin(c / 8) * 40 + 50 + Math.sin(r / 3) * 20;
      data.push({
        col: c,
        row: r,
        value: Math.max(0, base + (Math.random() - 0.5) * 30),
      });
    }
  }
  return data;
}

function getColor(val) {
  if (val > 80) return '#7B68EE';
  if (val > 60) return '#9B8FEE';
  if (val > 40) return '#B8AFEE';
  if (val > 20) return '#D5D0F5';
  return '#F0EDF5';
}

export default function HeatmapWidget({ widget }) {
  const data = useMemo(() => generateHeatmapData(30, 10), [widget.id]);
  const cols = 30;
  const rows = 10;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 1, padding: 4 }}>
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              background: getColor(d.value),
              borderRadius: 1,
            }}
            title={`${d.value.toFixed(1)}`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 4px 0 4px', fontSize: 10, color: '#6C6C80' }}>
        <span>30m ago</span>
        <span>Now</span>
      </div>
    </div>
  );
}
