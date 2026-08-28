import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, X, Check } from 'lucide-react';

export default function Transfers() {
  const { state, addTransfer } = useStore();
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    setError('');
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (activeTab === 'withdraw' && parsed > (state.user.cashBalance || 0)) {
      setError(`Insufficient cash balance. Available: ${formatCurrency(state.user.cashBalance || 0)}`);
      return;
    }
    if (parsed < 1) {
      setError('Minimum transfer amount is $1.00');
      return;
    }
    addTransfer(activeTab === 'deposit' ? 'deposit' : 'withdraw', parsed);
    setAmount('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Transfers</h1>

      {/* Balance Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface border border-surface-hover rounded-xl p-5">
          <div className="text-xs text-text-muted mb-1">Cash Balance</div>
          <div className="text-xl font-bold">{formatCurrency(state.user.cashBalance || 0)}</div>
        </div>
        <div className="bg-surface border border-surface-hover rounded-xl p-5">
          <div className="text-xs text-text-muted mb-1">Buying Power</div>
          <div className="text-xl font-bold">{formatCurrency(state.user.buyingPower || 0)}</div>
        </div>
      </div>

      {/* Transfer Form */}
      <div className="bg-surface border border-surface-hover rounded-xl overflow-hidden mb-8">
        {/* Tabs */}
        <div className="flex border-b border-surface-hover">
          <button
            onClick={() => { setActiveTab('deposit'); setError(''); setAmount(''); }}
            className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'deposit'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <ArrowUpRight size={16} />
            Deposit
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); setError(''); setAmount(''); }}
            className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'withdraw'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <ArrowDownRight size={16} />
            Withdraw
          </button>
        </div>

        <div className="p-6">
          <div className="mb-2">
            <label className="text-sm text-text-muted block mb-1">
              {activeTab === 'deposit' ? 'Amount to deposit' : 'Amount to withdraw'}
            </label>
            <div className="flex items-center border border-surface-hover rounded-lg px-4 py-3 focus-within:border-primary transition-colors">
              <span className="text-text-muted mr-2 text-lg">$</span>
              <input
                type="number"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError(''); }}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="bg-transparent text-xl font-bold flex-1 focus:outline-none"
              />
            </div>
            {activeTab === 'withdraw' && (
              <div className="text-xs text-text-muted mt-1">
                Available to withdraw: {formatCurrency(state.user.cashBalance || 0)}
              </div>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2 mt-3 mb-4">
            {quickAmounts.map(amt => (
              <button
                key={amt}
                onClick={() => { setAmount(amt.toString()); setError(''); }}
                className="flex-1 py-2 text-xs font-bold bg-surface-hover rounded hover:bg-surface-hover/80 transition-colors"
              >
                ${amt >= 1000 ? `${amt / 1000}K` : amt}
              </button>
            ))}
          </div>

          {/* Bank Account info */}
          <div className="flex items-center justify-between p-3 bg-surface-hover rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-surface flex items-center justify-center text-xs font-bold">
                BK
              </div>
              <div>
                <div className="text-sm font-medium">Chase Bank</div>
                <div className="text-xs text-text-muted">Checking ••••4821</div>
              </div>
            </div>
            <span className="text-xs text-primary font-medium">Default</span>
          </div>

          {error && (
            <div className="text-xs text-danger bg-danger/10 rounded px-3 py-2 mb-4 flex items-center gap-2">
              <X size={12} />
              {error}
            </div>
          )}

          {success && (
            <div className="text-xs text-primary bg-primary/10 rounded px-3 py-2 mb-4 flex items-center gap-2">
              <Check size={12} />
              {activeTab === 'deposit' ? 'Deposit' : 'Withdrawal'} processed successfully!
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-primary text-black font-bold rounded-full hover:bg-primary-dark transition-colors text-sm"
          >
            {activeTab === 'deposit' ? 'Deposit to Xobinhood' : 'Withdraw to Bank'}
          </button>

          <p className="text-xs text-text-muted text-center mt-3">
            {activeTab === 'deposit'
              ? 'Deposits are typically available within 1 business day.'
              : 'Withdrawals typically arrive in 3-5 business days.'}
          </p>
        </div>
      </div>

      {/* Recent Transfers */}
      {state.transactions && state.transactions.filter(tx => tx.type === 'transfer').length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Recent Transfers</h2>
          <div className="bg-surface border border-surface-hover rounded-xl overflow-hidden">
            {state.transactions
              .filter(tx => tx.type === 'transfer')
              .slice(0, 10)
              .map((tx, idx, arr) => {
                const isDeposit = tx.side === 'buy';
                return (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between px-5 py-4 ${
                      idx < arr.length - 1 ? 'border-b border-surface-hover' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDeposit ? 'bg-primary/15' : 'bg-danger/15'
                      }`}>
                        {isDeposit
                          ? <ArrowUpRight size={16} className="text-primary" />
                          : <ArrowDownRight size={16} className="text-danger" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{tx.name}</div>
                        <div className="text-xs text-text-muted">
                          {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${isDeposit ? 'text-primary' : 'text-danger'}`}>
                        {isDeposit ? '+' : '-'}{formatCurrency(tx.totalAmount)}
                      </div>
                      <div className="text-xs text-primary capitalize">{tx.status}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
