import React, { useMemo } from 'react';

const topListData = [
  { label: 'api-prod-us-east-1b', value: 91.3 },
  { label: 'worker-prod-us-east-1a', value: 78.6 },
  { label: 'api-prod-us-east-1a', value: 72.4 },
  { label: 'web-prod-us-east-1c', value: 55.8 },
  { label: 'web-prod-us-east-1a', value: 42.7 },
  { label: 'web-prod-us-east-1b', value: 38.2 },
  { label: 'db-prod-us-east-1a', value: 32.1 },
  { label: 'db-replica-us-east-1b', value: 18.7 },
  { label: 'cache-prod-us-east-1b', value: 15.1 },
  { label: 'cache-prod-us-east-1a', value: 12.4 },
];

export default function TopListWidget({ widget }) {
  const items = useMemo(() => {
    // Use mock data; in a real app, data would come from widget.definition
    return topListData;
  }, [widget.id]);

  const maxVal = Math.max(...items.map(i => i.value), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', justifyContent: 'center' }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <span style={{ width: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#23232F', flexShrink: 0 }}>
            {item.label}
          </span>
          <div style={{ flex: 1, height: 14, background: 'rgba(123,104,238,0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(item.value / maxVal) * 100}%`,
              background: '#7B68EE',
              borderRadius: 3,
              transition: 'width 0.3s',
            }} />
          </div>
          <span style={{ width: 50, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#6C6C80', flexShrink: 0 }}>
            {item.value.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}
