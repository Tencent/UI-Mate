import React, { useContext } from 'react';
import { CoinbaseContext } from '../context/CoinbaseContext';
import TransactionRow from './TransactionRow';

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'buy', label: 'Buys' },
  { key: 'sell', label: 'Sells' },
  { key: 'send', label: 'Sends' },
  { key: 'receive', label: 'Receives' },
];

function TransactionList({ limit }) {
  const { state, updateState } = useContext(CoinbaseContext);
  const activeFilter = state.ui.historyFilter || 'all';

  const setActiveFilter = (key) => {
    updateState({ ui: { ...state.ui, historyFilter: key } });
  };

  const sortedTransactions = [...state.transactions].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const filteredTransactions =
    activeFilter === 'all'
      ? sortedTransactions
      : sortedTransactions.filter((tx) => tx.type === activeFilter);

  const displayedTransactions = limit
    ? filteredTransactions.slice(0, limit)
    : filteredTransactions;

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Transaction History</h2>
        <div className="flex gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === tab.key
                  ? 'bg-[#0052FF] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        {displayedTransactions.length > 0 ? (
          displayedTransactions.map((tx) => {
            const asset = state.assets.find((a) => a.id === tx.assetId);
            return <TransactionRow key={tx.id} transaction={tx} asset={asset} />;
          })
        ) : (
          <div className="p-8 text-center text-gray-400">
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionList;
