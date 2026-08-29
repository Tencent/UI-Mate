import React from 'react';

export default function QueryValueWidget({ widget }) {
  const def = widget.definition || {};
  const value = def.value ?? 0;
  const unit = def.unit || '';
  const precision = def.precision ?? 1;
  const formats = def.conditionalFormats || [];

  let color = '#23232F';
  for (const fmt of formats) {
    if (fmt.comparator === '>' && value > fmt.value) { color = fmt.color; break; }
    if (fmt.comparator === '>=' && value >= fmt.value) { color = fmt.color; break; }
    if (fmt.comparator === '<' && value < fmt.value) { color = fmt.color; break; }
    if (fmt.comparator === '<=' && value <= fmt.value) { color = fmt.color; break; }
  }

  const displayValue = typeof value === 'number'
    ? (unit === '$' ? `$${value.toLocaleString()}` : value.toFixed(precision))
    : value;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 60,
    }}>
      <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1.2 }}>
        {displayValue}{unit && unit !== '$' ? <span style={{ fontSize: 18, fontWeight: 500, marginLeft: 2 }}>{unit}</span> : null}
      </div>
    </div>
  );
}
