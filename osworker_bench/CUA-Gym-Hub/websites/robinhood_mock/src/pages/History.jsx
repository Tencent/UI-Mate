import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, Clock, X } from 'lucide-react';

export default function History() {
  const { state, cancelOrder, addTransfer } = useStore();
  const [filterSide, setFilterSide] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferType, setTransferType] = useState('deposit');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferError, setTransferError] = useState('');

  const transactions = useMemo(() => {
    let txns = [...(state.transactions || [])];

    if (filterSide !== 'all') {
      if (filterSide === 'transfer') {
        txns = txns.filter(t => t.type === 'transfer');
      } else {
        // When filtering by buy/sell, exclude transfer transactions
        txns = txns.filter(t => t.type !== 'transfer' && t.side === filterSide);
      }
    }
    if (filterStatus !== 'all') {
      txns = txns.filter(t => t.status === filterStatus);
    }

    // Sort by date descending
    txns.sort((a, b) => new Date(b.date) - new Date(a.date));

    return txns;
  }, [state.transactions, filterSide, filterStatus]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups = {};
    transactions.forEach(tx => {
      const dateStr = new Date(tx.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(tx);
    });
    return groups;
  }, [transactions]);

  return (
    <div>
      {/* Cash Header */}
      <div className="mb-8">
        <h1 className="text-sm text-text-muted mb-1">Cash</h1>
        <div className="text-4xl font-bold tracking-tight mb-1">
          {formatCurrency(state.user.cashBalance || 0)}
        </div>
        <div className="text-sm text-text-muted">
          Buying power: {formatCurrency(state.user.buyingPower || 0)}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => { setTransferType('deposit'); setTransferAmount(''); setTransferError(''); setShowTransferModal(true); }}
          className="px-6 py-2.5 bg-primary text-black font-bold rounded-full text-sm hover:bg-primary-dark transition-colors"
        >
          Transfer
        </button>
        <button
          onClick={() => { setTransferType('withdraw'); setTransferAmount(''); setTransferError(''); setShowTransferModal(true); }}
          className="px-6 py-2.5 border border-surface-hover text-text font-bold rounded-full text-sm hover:bg-surface-hover transition-colors"
        >
          Withdraw
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-text-muted">Type:</span>
          {['all', 'buy', 'sell', 'transfer'].map(opt => (
            <button
              key={opt}
              onClick={() => setFilterSide(opt)}
              className={`px-3 py-1.5 rounded-full transition-colors font-medium ${
                filterSide === opt
                  ? 'bg-primary text-black'
                  : 'bg-surface-hover text-text-muted hover:text-text'
              }`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs ml-4">
          <span className="text-text-muted">Status:</span>
          {['all', 'filled', 'pending', 'cancelled'].map(opt => (
            <button
              key={opt}
              onClick={() => setFilterStatus(opt)}
              className={`px-3 py-1.5 rounded-full transition-colors font-medium ${
                filterStatus === opt
                  ? 'bg-primary text-black'
                  : 'bg-surface-hover text-text-muted hover:text-text'
              }`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-lg font-bold mb-4">
          Recent Activity
          <span className="ml-2 text-sm text-text-muted font-normal">{transactions.length}</span>
        </h2>

        {Object.keys(groupedTransactions).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, txns]) => (
              <div key={date}>
                <div className="text-xs font-bold text-text-muted mb-2 px-1">{date}</div>
                <div className="bg-surface border border-surface-hover rounded-xl overflow-hidden">
                  {txns.map((tx, idx) => {
                    const isTransfer = tx.type === 'transfer';
                    const Wrapper = isTransfer ? 'div' : Link;
                    const wrapperProps = isTransfer
                      ? {}
                      : { to: `/stock/${tx.symbol}` };

                    return (
                    <Wrapper
                      key={tx.id}
                      {...wrapperProps}
                      className={`flex items-center justify-between px-5 py-4 hover:bg-surface-hover transition-colors ${
                        idx < txns.length - 1 ? 'border-b border-surface-hover' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isTransfer
                            ? tx.side === 'buy' ? 'bg-primary/15' : 'bg-surface-hover'
                            : tx.side === 'buy' ? 'bg-primary/15' : 'bg-danger/15'
                        }`}>
                          {tx.side === 'buy'
                            ? <ArrowUpRight size={16} className="text-primary" />
                            : <ArrowDownRight size={16} className="text-danger" />
                          }
                        </div>
                        <div>
                          <div className="font-bold text-sm">
                            {isTransfer ? tx.name : tx.symbol}
                            {!isTransfer && <span className="font-normal text-text-muted ml-2">{tx.name}</span>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            {isTransfer ? (
                              <span className="text-text-muted">Transfer</span>
                            ) : (
                              <>
                                <span className={tx.side === 'buy' ? 'text-primary' : 'text-danger'}>
                                  {tx.side === 'buy' ? 'Buy' : 'Sell'}
                                </span>
                                <span className="text-text-muted/50">&bull;</span>
                                <span>{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</span>
                                <span className="text-text-muted/50">&bull;</span>
                                <span>{tx.quantity} shares @ ${tx.price.toFixed(2)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className={`text-sm font-medium ${
                            isTransfer
                              ? tx.side === 'buy' ? 'text-primary' : 'text-danger'
                              : tx.side === 'buy' ? 'text-danger' : 'text-primary'
                          }`}>
                            {isTransfer
                              ? `${tx.side === 'buy' ? '+' : '-'}${formatCurrency(tx.totalAmount)}`
                              : `${tx.side === 'buy' ? '-' : '+'}${formatCurrency(tx.totalAmount)}`}
                          </div>
                          <div className={`text-xs ${
                            tx.status === 'filled' ? 'text-primary' : tx.status === 'cancelled' ? 'text-danger' : 'text-yellow-500'
                          }`}>
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </div>
                        </div>
                        {tx.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              cancelOrder(tx.id);
                            }}
                            className="p-1 text-text-muted hover:text-danger transition-colors"
                            title="Cancel order"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </Wrapper>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-surface-hover rounded-xl p-12 text-center text-text-muted">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-1">No transactions yet</p>
            <p className="text-sm">Buy or sell stocks to see your history</p>
          </div>
        )}
      </div>

      {/* Transfer/Withdraw Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowTransferModal(false)}>
          <div className="bg-surface rounded-xl border border-surface-hover max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">{transferType === 'deposit' ? 'Transfer to Xobinhood' : 'Withdraw to Bank'}</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-text-muted hover:text-text">
                <X size={20} />
              </button>
            </div>

            {/* Always show both tabs so user can switch between deposit and withdraw */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTransferType('deposit')}
                className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${
                  transferType === 'deposit' ? 'bg-primary text-black' : 'bg-surface-hover text-text-muted hover:text-text'
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => setTransferType('withdraw')}
                className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${
                  transferType === 'withdraw' ? 'bg-primary text-black' : 'bg-surface-hover text-text-muted hover:text-text'
                }`}
              >
                Withdraw
              </button>
            </div>

            <div className="mb-4">
              <label className="text-sm text-text-muted mb-1 block">Amount</label>
              <div className="flex items-center border border-surface-hover rounded-lg px-3 py-2 focus-within:border-primary transition-colors">
                <span className="text-text-muted mr-1">$</span>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={e => { setTransferAmount(e.target.value); setTransferError(''); }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="bg-transparent text-sm font-medium flex-1 focus:outline-none"
                  autoFocus
                />
              </div>
              {transferType === 'withdraw' && (
                <div className="text-xs text-text-muted mt-1">
                  Available: {formatCurrency(state.user.cashBalance || 0)}
                </div>
              )}
            </div>

            {transferError && (
              <div className="text-xs text-danger bg-danger/10 rounded px-3 py-2 mb-4">
                {transferError}
              </div>
            )}

            <button
              onClick={() => {
                const amount = parseFloat(transferAmount);
                if (!amount || amount <= 0) {
                  setTransferError('Please enter a valid amount');
                  return;
                }
                if (transferType === 'withdraw' && amount > state.user.cashBalance) {
                  setTransferError('Insufficient cash balance');
                  return;
                }
                addTransfer(transferType, amount);
                setShowTransferModal(false);
              }}
              className="w-full py-3 bg-primary text-black font-bold rounded-full hover:bg-primary-dark transition-colors text-sm"
            >
              {transferType === 'deposit' ? 'Transfer' : 'Withdraw'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
