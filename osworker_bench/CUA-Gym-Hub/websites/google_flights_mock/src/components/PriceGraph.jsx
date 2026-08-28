import React from 'react';

export default function PriceGraph({ basePrice = 300, currentDate }) {
  // Generate 14 deterministic mock prices around basePrice
  const today = currentDate ? new Date(currentDate) : new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i - 7);
    const noise = Math.sin(i * 1.7) * 0.18 + Math.cos(i * 0.9) * 0.08;
    const price = Math.round(basePrice * (1 + noise));
    return { date: d, price };
  });
  const max = Math.max(...days.map((p) => p.price));
  const min = Math.min(...days.map((p) => p.price));
  const range = Math.max(1, max - min);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Price trends</h3>
        <span className="text-xs text-gray-500">Past 14 days · base ${basePrice}</span>
      </div>
      <div className="flex items-end gap-1 h-32">
        {days.map((d, i) => {
          const h = ((d.price - min) / range) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end">
              <div
                className="w-full bg-blue-500 rounded-t transition-all"
                style={{ height: `${Math.max(8, h)}%`, opacity: 0.4 + (h / 200) }}
                title={`${d.date.toLocaleDateString()}: $${d.price}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-gray-500">
        <span>${min}</span>
        <span>${max}</span>
      </div>
    </div>
  );
}
