import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { CreditCard, X } from 'lucide-react';

export default function BillingPaymentMethods() {
  const { state, dispatch, addFlash } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');

  const methods = state.billing?.paymentMethods || [];

  const brandIcon = (brand) => {
    const colors = { Visa: 'text-blue-700', Mastercard: 'text-red-600', Amex: 'text-blue-500' };
    return colors[brand] || 'text-gray-600';
  };

  const handleAdd = () => {
    if (!cardNumber || !cardName || !expiry) return;
    const method = {
      id: Math.random().toString(36).substr(2, 8),
      type: 'Credit Card',
      brand: cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Amex',
      last4: cardNumber.slice(-4),
      expiry,
      name: cardName,
      isDefault: methods.length === 0,
    };
    dispatch({ type: 'ADD_PAYMENT_METHOD', payload: method });
    addFlash('success', 'Payment method added successfully');
    setShowAdd(false);
    setCardNumber(''); setCardName(''); setExpiry('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Payment methods</h1>
        <button className="aws-btn aws-btn-primary text-xs" onClick={() => setShowAdd(true)}>Add payment method</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.length === 0 ? (
          <div className="aws-card col-span-2 text-center text-aws-text-secondary py-8">No payment methods configured</div>
        ) : methods.map(m => (
          <div key={m.id || m.last4} className="aws-card flex items-start gap-4">
            <CreditCard size={32} className={brandIcon(m.brand)} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">{m.brand}</span>
                {m.isDefault && <span className="aws-badge bg-green-100 text-green-800">Default</span>}
              </div>
              <div className="text-sm text-aws-text-secondary mt-1">**** **** **** {m.last4}</div>
              <div className="text-xs text-aws-text-secondary">Expires {m.expiry}</div>
              {m.name && <div className="text-xs text-aws-text-secondary">{m.name}</div>}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl w-full max-w-md border border-aws-border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold">Add payment method</h3>
              <button onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Card number *</label>
                <input className="aws-input" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="4111 1111 1111 1111" maxLength={19} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Name on card *</label>
                <input className="aws-input" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Expiry *</label>
                <input className="aws-input w-32" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} />
              </div>
              <p className="text-xs text-aws-text-disabled">This is a mock form. No real payment data is processed.</p>
              <div className="flex justify-end gap-2 pt-2">
                <button className="aws-btn aws-btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="aws-btn aws-btn-primary" onClick={handleAdd} disabled={!cardNumber || !cardName || !expiry}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
