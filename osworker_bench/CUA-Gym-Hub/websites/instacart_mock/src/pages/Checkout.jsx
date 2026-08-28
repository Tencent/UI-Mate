import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MapPin, Clock, CreditCard, CheckCircle, MessageSquare, Percent } from 'lucide-react';
import { format, addDays, addHours, setHours, setMinutes } from 'date-fns';

export default function Checkout() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(state.savedAddresses?.[0]?.id || 'custom');
  const [customAddress, setCustomAddress] = useState(state.user.address);
  const [instructions, setInstructions] = useState(state.savedAddresses?.[0]?.instructions || "Leave at door if I'm not around");
  const [selectedPaymentId, setSelectedPaymentId] = useState(state.user.paymentMethods?.find(method => method.default)?.id || state.user.paymentMethods?.[0]?.id || '');
  const [tipPercent, setTipPercent] = useState(state.user.preferences?.defaultTipPercent || 10);
  const [isPlacing, setIsPlacing] = useState(false);

  const cartStoreId = state.cart[0]?.storeId || state.currentStoreId;
  const store = state.stores.find(s => s.id === cartStoreId);
  const subtotal = state.cart.reduce((acc, item) => {
    const p = state.products.find(prod => prod.id === item.productId);
    return acc + (p ? p.price * item.quantity : 0);
  }, 0);
  const serviceFee = 2;
  const deliveryFee = store?.deliveryFee || 0;
  const slotFee = selectedSlot?.fee || 0;
  const tip = Number((subtotal * (tipPercent / 100)).toFixed(2));
  const total = subtotal + deliveryFee + serviceFee + slotFee + tip;
  const selectedAddress = state.savedAddresses?.find(address => address.id === selectedAddressId);
  const deliveryAddress = selectedAddress?.address || customAddress;
  const minimumMet = subtotal >= (store?.minOrder || 0);

  // Generate delivery slots
  const generateSlots = () => {
    const slots = [];
    const today = new Date();
    for (let i = 0; i < 3; i++) {
      const date = addDays(today, i);
      const startHour = 9; // 9 AM
      for (let h = 0; h < 5; h++) {
        const slotTime = setHours(setMinutes(date, 0), startHour + (h * 2));
        slots.push({
          id: `slot_${i}_${h}`,
          date: date,
          timeLabel: `${format(slotTime, 'h:mm a')} - ${format(addHours(slotTime, 2), 'h:mm a')}`,
          fee: i === 0 ? 5.99 : 3.99
        });
      }
    }
    return slots;
  };

  const slots = generateSlots();

  const handlePlaceOrder = () => {
    if (!store || !selectedSlot || !minimumMet || !deliveryAddress.trim()) return;
    setIsPlacing(true);

    const newOrder = {
      id: `order_${Date.now()}`,
      userId: state.user.id,
      storeId: store.id,
      items: [...state.cart],
      status: 'received', // received, shopping, checkout, delivering, delivered
      subtotal,
      total,
      deliveryFee,
      serviceFee,
      slotFee,
      tip,
      slot: selectedSlot,
      deliveryAddress,
      deliveryInstructions: instructions,
      paymentMethodId: selectedPaymentId,
      createdAt: new Date().toISOString(),
      chat: []
    };

    setTimeout(() => {
      dispatch({ type: ACTION_TYPES.PLACE_ORDER, payload: newOrder });
      dispatch({
        type: ACTION_TYPES.ADD_NOTIFICATION,
        payload: { message: `Order ${newOrder.id} placed at ${store.name}` }
      });
      navigate('/order-status');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="space-y-6">
        {/* Address */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
          </div>
          <div className="pl-9">
            <div className="grid gap-3">
              {(state.savedAddresses || []).map(address => (
                <label key={address.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${selectedAddressId === address.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === address.id}
                    onChange={() => {
                      setSelectedAddressId(address.id);
                      setInstructions(address.instructions);
                    }}
                    className="mt-1 text-primary focus:ring-primary"
                  />
                  <span>
                    <span className="block font-bold text-gray-900">{address.label}</span>
                    <span className="block text-sm text-gray-600">{address.address}</span>
                  </span>
                </label>
              ))}
              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${selectedAddressId === 'custom' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === 'custom'}
                  onChange={() => setSelectedAddressId('custom')}
                  className="mt-1 text-primary focus:ring-primary"
                />
                <span className="flex-1">
                  <span className="block font-bold text-gray-900 mb-2">Custom address</span>
                  <input
                    type="text"
                    value={customAddress}
                    onChange={(event) => setCustomAddress(event.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">Delivery Instructions</h2>
          </div>
          <textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Time Slots */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">Delivery Time</h2>
          </div>
          <div className="pl-9 grid grid-cols-2 gap-3">
            {slots.slice(0, 6).map(slot => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3 rounded-lg border text-left transition-all ${selectedSlot?.id === slot.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="font-bold text-gray-900">{format(slot.date, 'EEE, MMM d')}</div>
                <div className="text-sm text-gray-600">{slot.timeLabel}</div>
                <div className="text-xs font-medium text-primary mt-1">${slot.fee}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
          </div>
          <div className="pl-9 flex items-center gap-4">
            <div className="grid gap-3 w-full">
              {(state.user.paymentMethods || []).map(method => (
                <label key={method.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer ${selectedPaymentId === method.id ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPaymentId === method.id}
                    onChange={() => setSelectedPaymentId(method.id)}
                    className="text-primary focus:ring-primary"
                  />
                  <div className="w-8 h-5 bg-gray-800 rounded"></div>
                  <span className="font-medium">{method.brand} ending in {method.last4}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Percent className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">Shopper Tip</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[5, 10, 15, 20].map(percent => (
              <button
                key={percent}
                type="button"
                onClick={() => setTipPercent(percent)}
                className={`rounded-lg border py-3 font-bold ${tipPercent === percent ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        {!minimumMet && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm font-semibold">
            Add ${(store.minOrder - subtotal).toFixed(2)} more to meet the {store.name} minimum order.
          </div>
        )}

        <button
          onClick={handlePlaceOrder}
          disabled={!selectedSlot || !minimumMet || !deliveryAddress.trim() || isPlacing}
          className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl hover:bg-primaryDark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform active:scale-[0.99]"
        >
          {isPlacing ? 'Placing Order...' : `Place Order • $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
