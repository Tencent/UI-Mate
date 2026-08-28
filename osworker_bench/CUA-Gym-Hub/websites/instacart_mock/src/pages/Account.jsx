import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, MapPin, Bell, CreditCard } from 'lucide-react';

export default function Account() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const [form, setForm] = useState({
    name: state.user.name,
    email: state.user.email,
    phone: state.user.phone || '',
    address: state.user.address,
    smsUpdates: state.user.preferences?.smsUpdates ?? true,
    leaveAtDoor: state.user.preferences?.leaveAtDoor ?? true
  });
  const [status, setStatus] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch({
      type: ACTION_TYPES.UPDATE_USER,
      payload: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        preferences: {
          smsUpdates: form.smsUpdates,
          leaveAtDoor: form.leaveAtDoor
        }
      }
    });
    setStatus('Account preferences saved.');
  };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-8">
        <img src={state.user.avatar} alt="" className="w-16 h-16 rounded-full border border-gray-200" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account</h1>
          <p className="text-gray-500">Local profile and delivery preferences</p>
        </div>
      </div>

      {status && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-semibold">
          {status}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-lg text-gray-900">Profile</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-semibold text-gray-700">
              Name
              <input
                value={form.name}
                onChange={(event) => setForm(prev => ({ ...prev, name: event.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 font-normal focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Email
              <input
                value={form.email}
                onChange={(event) => setForm(prev => ({ ...prev, email: event.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 font-normal focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700 md:col-span-2">
              Phone
              <input
                value={form.phone}
                onChange={(event) => setForm(prev => ({ ...prev, phone: event.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 font-normal focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-lg text-gray-900">Default Delivery</h2>
          </div>
          <label className="text-sm font-semibold text-gray-700">
            Address
            <input
              value={form.address}
              onChange={(event) => setForm(prev => ({ ...prev, address: event.target.value }))}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 font-normal focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>
          <label className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
            <span>
              <span className="block font-semibold text-gray-900">Leave at door</span>
              <span className="block text-sm text-gray-500">Use contactless delivery by default.</span>
            </span>
            <input
              type="checkbox"
              checked={form.leaveAtDoor}
              onChange={(event) => setForm(prev => ({ ...prev, leaveAtDoor: event.target.checked }))}
              className="text-primary focus:ring-primary"
            />
          </label>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-lg text-gray-900">Notifications</h2>
          </div>
          <label className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
            <span>
              <span className="block font-semibold text-gray-900">SMS order updates</span>
              <span className="block text-sm text-gray-500">Receive shopping and delivery updates.</span>
            </span>
            <input
              type="checkbox"
              checked={form.smsUpdates}
              onChange={(event) => setForm(prev => ({ ...prev, smsUpdates: event.target.checked }))}
              className="text-primary focus:ring-primary"
            />
          </label>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-lg text-gray-900">Payment Methods</h2>
          </div>
          <div className="grid gap-3">
            {(state.user.paymentMethods || []).map(method => (
              <div key={method.id} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                <span className="font-semibold text-gray-900">{method.brand} ending in {method.last4}</span>
                {method.default && <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">Default</span>}
              </div>
            ))}
          </div>
        </section>

        <button type="submit" className="w-full bg-primary text-white rounded-full py-3 font-bold hover:bg-primaryDark">
          Save account
        </button>
      </form>
    </div>
  );
}
