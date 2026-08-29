import React from 'react';

function formatNumber(num) {
  if (num == null) return 'N/A';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function formatSupply(num, symbol) {
  if (num == null) return null;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B ${symbol}`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M ${symbol}`;
  return `${num.toLocaleString()} ${symbol}`;
}

function AssetStats({ asset }) {
  const stats = [
    {
      label: 'Market Cap',
      value: formatNumber(asset.marketCap),
    },
    {
      label: 'Volume (24h)',
      value: formatNumber(asset.volume24h),
    },
    {
      label: 'Circulating Supply',
      value: formatSupply(asset.circulatingSupply, asset.symbol),
    },
    {
      label: 'Max Supply',
      value: asset.maxSupply
        ? formatSupply(asset.maxSupply, asset.symbol)
        : '\u221E',
    },
    {
      label: 'Price Change (24h)',
      value: asset.priceChange24h,
      isPercent: true,
    },
    {
      label: 'Price Change (7d)',
      value: asset.priceChange7d,
      isPercent: true,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
            {stat.isPercent ? (
              <div
                className={`text-sm font-semibold ${
                  stat.value >= 0 ? 'text-[#05B169]' : 'text-[#CF202F]'
                }`}
              >
                {stat.value >= 0 ? '+' : ''}
                {stat.value.toFixed(2)}%
              </div>
            ) : (
              <div className="text-sm font-semibold text-gray-900">
                {stat.value}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssetStats;
