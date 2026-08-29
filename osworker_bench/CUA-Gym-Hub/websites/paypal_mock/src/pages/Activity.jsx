
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency, cn } from '../lib/utils';
import { Search, ArrowUpRight, ArrowDownLeft, Calendar, X, Download } from 'lucide-react';

function TransactionDetailModal({ tx, onClose }) {
  const typeLabels = {
    payment_sent: 'Payment Sent',
    payment_received: 'Payment Received',
    withdrawal: 'Transfer to Bank',
    refund: 'Refund',
    request_sent: 'Money Request',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Transaction Details
            </h2>
            <p className="text-sm text-gray-500">{tx.transactionId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Amount */}
          <div className="text-center py-4 bg-gray-50 rounded-xl">
            <p
              className={cn(
                'text-3xl font-bold',
                tx.type === 'payment_sent' || tx.type === 'withdrawal'
                  ? 'text-gray-900'
                  : 'text-green-600'
              )}
            >
              {tx.type === 'payment_sent' || tx.type === 'withdrawal'
                ? '-'
                : '+'}
              {formatCurrency(tx.amount, tx.currency)}
            </p>
            <p
              className={cn(
                'text-sm mt-1 capitalize font-medium',
                tx.status === 'completed'
                  ? 'text-green-600'
                  : tx.status === 'pending'
                  ? 'text-yellow-600'
                  : 'text-gray-500'
              )}
            >
              {tx.status}
            </p>
          </div>

          {/* Details Grid */}
          <div className="divide-y divide-gray-100">
            <DetailRow label="Type" value={typeLabels[tx.type] || tx.type} />
            <DetailRow
              label="Date"
              value={new Date(tx.date).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            />
            {(tx.recipientName || tx.recipientEmail) && (
              <DetailRow
                label="To"
                value={tx.recipientName || tx.recipientEmail}
              />
            )}
            {(tx.senderName || tx.senderEmail) && (
              <DetailRow
                label="From"
                value={tx.senderName || tx.senderEmail}
              />
            )}
            {tx.destination && (
              <DetailRow label="Destination" value={tx.destination} />
            )}
            {tx.source && <DetailRow label="Funded by" value={tx.source} />}
            {tx.description && (
              <DetailRow label="Description" value={tx.description} />
            )}
            {tx.fee > 0 && (
              <DetailRow label="Fee" value={formatCurrency(tx.fee, tx.currency)} />
            )}
            {tx.fee > 0 && (
              <DetailRow
                label="Net Amount"
                value={formatCurrency(tx.netAmount, tx.currency)}
              />
            )}
            <DetailRow label="Category" value={tx.category} capitalize />
            <DetailRow label="Transaction ID" value={tx.transactionId} mono />
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-full font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {(tx.type === 'payment_sent' && tx.status === 'completed') && (
            <button className="flex-1 py-2 bg-red-50 text-red-600 rounded-full font-medium text-sm hover:bg-red-100 transition-colors">
              Report a Problem
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, capitalize = false, mono = false }) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span
        className={cn(
          'text-sm text-gray-900 text-right',
          capitalize && 'capitalize',
          mono && 'font-mono text-xs'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default function Activity() {
  const { state } = useStore();
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  const transactions = state.transactions || [];

  const filteredTransactions = transactions.filter((tx) => {
    // Type Filter
    let matchesType = true;
    if (filterType !== 'all') {
      if (filterType === 'payment') {
        matchesType =
          tx.type === 'payment_sent' || tx.type === 'payment_received';
      } else if (filterType === 'withdrawal') {
        matchesType = tx.type === 'withdrawal';
      } else if (filterType === 'refund') {
        matchesType = tx.type === 'refund';
      } else if (filterType === 'request') {
        matchesType = tx.type === 'request_sent';
      }
    }

    // Search Filter
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      (tx.description && tx.description.toLowerCase().includes(searchLower)) ||
      (tx.recipientName && tx.recipientName.toLowerCase().includes(searchLower)) ||
      (tx.senderName && tx.senderName.toLowerCase().includes(searchLower)) ||
      (tx.transactionId && tx.transactionId.toLowerCase().includes(searchLower));

    // Date Range Filter
    let matchesDate = true;
    const txDate = new Date(tx.date);
    if (startDate) {
      matchesDate = matchesDate && txDate >= new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && txDate <= end;
    }

    return matchesType && matchesSearch && matchesDate;
  });

  const hasFilters = filterType !== 'all' || search || startDate || endDate;

  const handleClearFilters = () => {
    setFilterType('all');
    setSearch('');
    setStartDate('');
    setEndDate('');
  };

  const handleDownload = () => {
    const headers = [
      'Date',
      'Type',
      'Description',
      'To/From',
      'Amount',
      'Fee',
      'Net Amount',
      'Status',
      'Transaction ID',
    ];
    const rows = filteredTransactions.map((tx) => [
      new Date(tx.date).toLocaleString(),
      tx.type,
      tx.description,
      tx.recipientName || tx.senderName || tx.destination || '',
      tx.amount,
      tx.fee,
      tx.netAmount,
      tx.status,
      tx.transactionId,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${v ?? ''}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xaypal-statement.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand border border-gray-300 rounded-full px-4 py-2 hover:border-brand transition-colors"
          >
            <Download className="h-4 w-4" /> Download
          </button>
        </div>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, description, or transaction ID"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'payment', label: 'Payments' },
                { id: 'withdrawal', label: 'Withdrawals' },
                { id: 'refund', label: 'Refunds' },
                { id: 'request', label: 'Requests' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    filterType === f.id
                      ? 'bg-brand text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="date"
                className="bg-transparent border-none text-sm text-gray-600 focus:ring-0 p-0"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                className="bg-transparent border-none text-sm text-gray-600 focus:ring-0 p-0"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Count + Clear */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {filteredTransactions.length} of {transactions.length}{' '}
              transaction{transactions.length !== 1 ? 's' : ''}
            </span>
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="text-brand hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredTransactions.map((tx) => (
          <button
            key={tx.id}
            onClick={() => setSelectedTx(tx)}
            className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center w-12 text-gray-500">
                <span className="text-xs font-bold uppercase">
                  {new Date(tx.date).toLocaleString('default', { month: 'short' })}
                </span>
                <span className="text-lg font-bold">
                  {new Date(tx.date).getDate()}
                </span>
              </div>
              <div
                className={cn(
                  'w-10 h-10 rounded-full sm:flex items-center justify-center hidden',
                  tx.type === 'payment_sent' || tx.type === 'withdrawal'
                    ? 'bg-gray-100'
                    : 'bg-green-100'
                )}
              >
                {tx.type === 'payment_sent' || tx.type === 'withdrawal' ? (
                  <ArrowUpRight className="h-5 w-5 text-gray-600" />
                ) : (
                  <ArrowDownLeft className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {tx.recipientName || tx.senderName || tx.destination}
                </p>
                <p className="text-sm text-gray-500">
                  {tx.description} &bull; {tx.status}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  'font-bold',
                  tx.type === 'payment_sent' || tx.type === 'withdrawal'
                    ? 'text-gray-900'
                    : 'text-green-600'
                )}
              >
                {tx.type === 'payment_sent' || tx.type === 'withdrawal'
                  ? '-'
                  : '+'}
                {formatCurrency(tx.amount, tx.currency)}
              </p>
            </div>
          </button>
        ))}
        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No transactions found matching your criteria.
          </div>
        )}
      </div>

      {selectedTx && (
        <TransactionDetailModal
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
}
