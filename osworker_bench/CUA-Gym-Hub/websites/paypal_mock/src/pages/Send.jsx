
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { formatCurrency, cn } from '../lib/utils';
import { Search, CheckCircle } from 'lucide-react';

export default function Send() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'request' ? 'request' : 'send';
  const initialRecipient = searchParams.get('recipient') || '';
  const { state, sendMoney, requestMoney } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState(initialRecipient);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Defensive check for contacts
  const contacts = state.contacts || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (mode === 'send' && parseFloat(amount) > state.user.balance) {
      setError('Insufficient balance.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate network delay
    setTimeout(() => {
      try {
        if (mode === 'send') {
          sendMoney(recipient, amount, note, currency);
        } else {
          requestMoney(recipient, amount, note, currency);
        }
        setIsProcessing(false);
        setStep(3);
      } catch (err) {
        console.error("Transaction failed:", err);
        setError('Transaction failed. Please try again.');
        setIsProcessing(false);
      }
    }, 1500);
  };

  const validateAndProceed = (email) => {
    const contactExists = contacts.some(c => c.email.toLowerCase() === email.toLowerCase());
    
    // For this mock, we enforce that the recipient must be in the contacts list
    if (!contactExists) {
      setError('Recipient not found in contacts. Please select a valid contact.');
      return;
    }

    setRecipient(email);
    setStep(2);
    setError('');
  };

  const handleRecipientSelect = (email) => {
    validateAndProceed(email);
  };

  const handleManualRecipientEnter = (e) => {
    if (e.key === 'Enter' && recipient) {
      validateAndProceed(recipient);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 text-center relative">
          {step === 2 && (
            <button 
              onClick={() => setStep(1)}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-brand hover:underline text-sm font-medium"
            >
              Back
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-900">
            {step === 3 ? 'Success' : (mode === 'send' ? 'Send Money' : 'Request Money')}
          </h2>
        </div>

        {/* Step 1: Recipient */}
        {step === 1 && (
          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Name, @username, email, or mobile"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-shadow"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setError('');
                }}
                onKeyDown={handleManualRecipientEnter}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Suggested Contacts</h3>
              <div className="space-y-2">
                {contacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => handleRecipientSelect(contact.email)}
                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {recipient && (
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => validateAndProceed(recipient)}
                  className="bg-brand hover:bg-brand-dark text-white px-6 py-2 rounded-full font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Amount & Confirm */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex items-center gap-3 mb-8 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center font-bold text-lg">
                {recipient && recipient[0] ? recipient[0].toUpperCase() : '?'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{recipient}</p>
                <button type="button" onClick={() => setStep(1)} className="text-sm text-brand hover:underline">Change</button>
              </div>
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  className="text-5xl font-bold text-gray-900 w-48 text-center outline-none placeholder:text-gray-300"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (parseFloat(e.target.value) > 0) setError('');
                  }}
                  required
                  min="0.01"
                  step="0.01"
                  autoFocus
                />
              </div>
              <select 
                className="mt-2 text-gray-500 bg-transparent border-none outline-none font-medium cursor-pointer hover:text-gray-700"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div className="mb-8">
              <textarea
                placeholder="What's this for? (Optional)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none resize-none"
                rows="2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className={cn(
                "w-full py-3 rounded-full font-bold text-lg transition-all transform active:scale-95",
                isProcessing 
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                  : "bg-brand hover:bg-brand-dark text-white shadow-lg hover:shadow-xl"
              )}
            >
              {isProcessing ? 'Processing...' : (mode === 'send' ? 'Send Payment' : 'Request Payment')}
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'send' ? 'Money Sent!' : 'Request Sent!'}
            </h3>
            <p className="text-gray-600 mb-8">
              You {mode === 'send' ? 'sent' : 'requested'} <span className="font-bold text-gray-900">{formatCurrency(amount, currency)}</span> {mode === 'send' ? 'to' : 'from'} {recipient}
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-2 border border-gray-300 rounded-full font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => {
                  setStep(1);
                  setAmount('');
                  setRecipient('');
                  setNote('');
                  setCurrency('USD');
                }}
                className="px-6 py-2 bg-brand text-white rounded-full font-medium hover:bg-brand-dark transition-colors"
              >
                New Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
  
