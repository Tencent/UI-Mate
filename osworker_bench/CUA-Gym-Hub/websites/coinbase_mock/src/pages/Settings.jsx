import React, { useContext, useState } from 'react';
import { CoinbaseContext } from '../context/CoinbaseContext';
import { User, CreditCard, Bell, DollarSign, Landmark } from 'lucide-react';

function Settings() {
  const { state, updateState } = useContext(CoinbaseContext);
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [nameValue, setNameValue] = useState(state.currentUser.name);
  const [emailValue, setEmailValue] = useState(state.currentUser.email);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentDraft, setPaymentDraft] = useState({ type: 'bank', name: '', last4: '' });
  const [pendingRemovePaymentId, setPendingRemovePaymentId] = useState(null);

  const handleSaveName = () => {
    if (nameValue.trim()) {
      updateState({
        currentUser: { ...state.currentUser, name: nameValue.trim() }
      });
    }
    setEditingName(false);
  };

  const handleSaveEmail = () => {
    if (emailValue.trim()) {
      updateState({
        currentUser: { ...state.currentUser, email: emailValue.trim() }
      });
    }
    setEditingEmail(false);
  };

  const handleCurrencyChange = (currency) => {
    updateState({
      currentUser: { ...state.currentUser, defaultCurrency: currency }
    });
  };

  const handleNotificationChange = (key, checked) => {
    updateState({
      notificationPreferences: {
        ...(state.notificationPreferences || {}),
        [key]: checked
      }
    });
  };

  const handleAddPaymentMethod = (event) => {
    event.preventDefault();
    if (!paymentDraft.name.trim() || !/^\d{4}$/.test(paymentDraft.last4)) return;
    updateState({
      paymentMethods: [
        ...state.paymentMethods,
        {
          id: `pm_${Date.now()}`,
          type: paymentDraft.type,
          name: paymentDraft.name.trim(),
          last4: paymentDraft.last4,
          isDefault: state.paymentMethods.length === 0
        }
      ]
    });
    setPaymentDraft({ type: 'bank', name: '', last4: '' });
    setShowPaymentForm(false);
  };

  const handleSetDefaultPayment = (paymentId) => {
    updateState({
      paymentMethods: state.paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === paymentId
      }))
    });
  };

  const handleRemovePayment = (paymentId) => {
    updateState({
      paymentMethods: state.paymentMethods.filter(pm => pm.id !== paymentId)
    });
  };

  const paymentIcon = (type) => {
    if (type === 'bank') return Landmark;
    return CreditCard;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <User size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Full Name</div>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button
                    onClick={handleSaveName}
                    className="text-xs text-[#0052FF] font-medium hover:underline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameValue(state.currentUser.name); }}
                    className="text-xs text-gray-400 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-sm font-medium text-gray-900">{state.currentUser.name}</div>
              )}
            </div>
            {!editingName && (
              <button
                onClick={() => setEditingName(true)}
                className="text-xs text-[#0052FF] font-medium hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Email</div>
              {editingEmail ? (
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEmail()}
                  />
                  <button
                    onClick={handleSaveEmail}
                    className="text-xs text-[#0052FF] font-medium hover:underline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingEmail(false); setEmailValue(state.currentUser.email); }}
                    className="text-xs text-gray-400 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-sm font-medium text-gray-900">{state.currentUser.email}</div>
              )}
            </div>
            {!editingEmail && (
              <button
                onClick={() => setEditingEmail(true)}
                className="text-xs text-[#0052FF] font-medium hover:underline"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
        </div>
        <div className="space-y-3">
          {state.paymentMethods.map((pm) => {
            const Icon = paymentIcon(pm.type);
            return (
              <div key={pm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {pm.name || pm.brand} ****{pm.last4}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{pm.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pm.isDefault ? (
                    <span className="text-xs bg-green-50 text-[#05B169] px-2 py-0.5 rounded-full font-medium">
                      Default
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSetDefaultPayment(pm.id)}
                        className="text-xs text-[#0052FF] font-semibold hover:underline"
                      >
                        Set default
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingRemovePaymentId(pm.id)}
                        className="text-xs text-[#CF202F] font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {showPaymentForm ? (
          <form onSubmit={handleAddPaymentMethod} className="mt-4 grid gap-3 border border-gray-200 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3">
              <select
                value={paymentDraft.type}
                onChange={(e) => setPaymentDraft(prev => ({ ...prev, type: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
              >
                <option value="bank">Bank</option>
                <option value="card">Card</option>
              </select>
              <input
                value={paymentDraft.last4}
                onChange={(e) => setPaymentDraft(prev => ({ ...prev, last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="Last 4"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
              />
            </div>
            <input
              value={paymentDraft.name}
              onChange={(e) => setPaymentDraft(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Payment method name"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-full bg-[#0052FF] text-white text-sm font-semibold hover:bg-[#003ECB]">
                Save payment method
              </button>
              <button type="button" onClick={() => setShowPaymentForm(false)} className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowPaymentForm(true)}
            className="mt-4 w-full rounded-full border border-[#0052FF] text-[#0052FF] py-2.5 text-sm font-semibold hover:bg-[#EBF0FF]"
          >
            Add payment method
          </button>
        )}
        {pendingRemovePaymentId && (
          <div className="mt-4 border border-red-100 bg-red-50 rounded-lg p-3">
            <div className="text-sm font-semibold text-gray-900">Remove this payment method?</div>
            <div className="text-xs text-gray-600 mt-1">It will be removed from this local sandbox account only.</div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  handleRemovePayment(pendingRemovePaymentId);
                  setPendingRemovePaymentId(null);
                }}
                className="px-3 py-1.5 rounded-full bg-[#CF202F] text-white text-xs font-semibold"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={() => setPendingRemovePaymentId(null)}
                className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Default Currency */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Default Currency</h2>
        </div>
        <div className="flex gap-2">
          {['USD', 'EUR', 'GBP'].map((currency) => (
            <button
              key={currency}
              onClick={() => handleCurrencyChange(currency)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                state.currentUser.defaultCurrency === currency
                  ? 'bg-[#0052FF] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {currency}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { key: 'trade_notifications', label: 'Trade confirmations' },
            { key: 'price_alerts', label: 'Price alerts' },
            { key: 'security_alerts', label: 'Security alerts' },
          ].map((pref) => (
            <label key={pref.key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">{pref.label}</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={(state.notificationPreferences || {})[pref.key] !== false}
                  onChange={(event) => handleNotificationChange(pref.key, event.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-checked:bg-[#0052FF] rounded-full transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Settings;
