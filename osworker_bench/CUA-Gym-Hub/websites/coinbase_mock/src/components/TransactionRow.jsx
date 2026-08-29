import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Send, Download } from 'lucide-react';

const typeConfig = {
  buy: { icon: ArrowDownLeft, label: 'Bought', color: 'text-[#05B169]', bgColor: 'bg-green-50' },
  sell: { icon: ArrowUpRight, label: 'Sold', color: 'text-[#CF202F]', bgColor: 'bg-red-50' },
  send: { icon: Send, label: 'Sent', color: 'text-[#CF202F]', bgColor: 'bg-red-50' },
  receive: { icon: Download, label: 'Received', color: 'text-[#05B169]', bgColor: 'bg-green-50' },
};

function TransactionRow({ transaction, asset }) {
  const config = typeConfig[transaction.type] || typeConfig.buy;
  const Icon = config.icon;

  const formatCurrency = (val) => {
    return val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatQuantity = (qty) => {
    if (qty >= 1000) return qty.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (qty >= 1) return qty.toLocaleString('en-US', { maximumFractionDigits: 4 });
    return qty.toLocaleString('en-US', { maximumFractionDigits: 8 });
  };

  const formatDate = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(timestamp));
  };

  const assetName = asset ? asset.name : transaction.assetId.toUpperCase();
  const assetSymbol = asset ? asset.symbol : transaction.assetId.toUpperCase();

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${config.bgColor}`}>
          <Icon size={18} className={config.color} />
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-sm">
            {config.label} {assetName}
          </div>
          <div className="text-xs text-gray-500">{formatDate(transaction.timestamp)}</div>
        </div>
      </div>

      <div className="text-right">
        <div className={`font-semibold text-sm ${config.color}`}>
          {transaction.type === 'buy' || transaction.type === 'receive' ? '+' : '-'}
          {formatQuantity(transaction.quantity)} {assetSymbol}
        </div>
        <div className="text-xs text-gray-500">{formatCurrency(transaction.totalAmount)}</div>
      </div>

      <div className="ml-4">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            transaction.status === 'completed'
              ? 'bg-green-50 text-[#05B169]'
              : 'bg-yellow-50 text-yellow-600'
          }`}
        >
          {transaction.status === 'completed' ? 'Completed' : 'Pending'}
        </span>
      </div>
    </div>
  );
}

export default TransactionRow;
