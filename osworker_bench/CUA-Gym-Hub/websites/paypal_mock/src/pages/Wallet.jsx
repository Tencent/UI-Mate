
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CreditCard, Building, Plus, Trash2, ShieldCheck } from 'lucide-react';

export default function Wallet() {
  const { state, addPaymentMethod, deletePaymentMethod, verifyPaymentMethod } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newCard, setNewCard] = useState({ type: 'card', brand: 'Visa', last4: '', expiry: '' });
  const [verifyingId, setVerifyingId] = useState(null);
  const [depositAmount1, setDepositAmount1] = useState('');
  const [depositAmount2, setDepositAmount2] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    // New accounts start as unverified for demonstration
    addPaymentMethod({ ...newCard, verified: false });
    setIsAdding(false);
    setStatusMessage(`${newCard.brand} ending in ${newCard.last4} linked. Verification required.`);
    setNewCard({ type: 'card', brand: 'Visa', last4: '', expiry: '' });
  };

  const handleVerify = (id) => {
    // Mock verification logic
    if (depositAmount1 && depositAmount2) {
      verifyPaymentMethod(id);
      setVerifyingId(null);
      setDepositAmount1('');
      setDepositAmount2('');
      setStatusMessage('Micro-deposits verified successfully.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-full font-medium hover:bg-brand-dark transition-colors"
        >
          <Plus className="h-4 w-4" /> Link a card or bank
        </button>
      </div>

      {statusMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.paymentMethods.map(method => (
          <div key={method.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 group">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-8 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                  {method.type === 'card' ? <CreditCard className="h-5 w-5 text-gray-600" /> : <Building className="h-5 w-5 text-gray-600" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {method.type === 'card' ? `${method.brand} ••••${method.last4}` : `${method.bankName} ••••${method.last4}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {method.type === 'card' ? `Expires ${method.expiry}` : 'Checking Account'}
                  </p>
                  {method.verified ? (
                    <span className="inline-block mt-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">Verified</span>
                  ) : (
                    <button 
                      onClick={() => setVerifyingId(method.id)}
                      className="inline-block mt-1 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded hover:bg-orange-100"
                    >
                      Verify Now
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  deletePaymentMethod(method.id);
                  setStatusMessage('Payment method removed from wallet.');
                }}
                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                aria-label={`Remove ${method.type === 'card' ? method.brand : method.bankName} ending in ${method.last4}`}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {/* Verification UI */}
            {verifyingId === method.id && !method.verified && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand" /> Verify Micro-deposits
                </h4>
                <p className="text-xs text-gray-600 mb-3">Enter the two small amounts deposited to your account.</p>
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      type="number" 
                      className="w-full pl-5 p-1 text-sm border border-gray-300 rounded"
                      placeholder="0.00"
                      value={depositAmount1}
                      onChange={e => setDepositAmount1(e.target.value)}
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      type="number" 
                      className="w-full pl-5 p-1 text-sm border border-gray-300 rounded"
                      placeholder="0.00"
                      value={depositAmount2}
                      onChange={e => setDepositAmount2(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setVerifyingId(null)}
                    className="flex-1 py-1 text-xs border border-gray-300 rounded hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleVerify(method.id)}
                    className="flex-1 py-1 text-xs bg-brand text-white rounded hover:bg-brand-dark"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal (Mock) */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Link a new card</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Brand</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newCard.brand}
                  onChange={e => setNewCard({...newCard, brand: e.target.value})}
                >
                  <option>Visa</option>
                  <option>Mastercard</option>
                  <option>Amex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last 4 Digits (Mock)</label>
                <input 
                  type="text" 
                  maxLength="4"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newCard.last4}
                  onChange={e => setNewCard({...newCard, last4: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="12/25"
                  value={newCard.expiry}
                  onChange={e => setNewCard({...newCard, expiry: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-brand text-white rounded-full font-medium hover:bg-brand-dark"
                >
                  Link Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
  
