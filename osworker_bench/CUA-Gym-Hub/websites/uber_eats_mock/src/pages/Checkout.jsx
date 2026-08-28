
    import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { MapPin, Clock, CreditCard, ChevronRight } from 'lucide-react';
    import { useStore } from '../context/StoreContext';
    import { formatCurrency } from '../lib/utils';

    const modifierList = (modifiers) => Object.values(modifiers || {}).flatMap(mod => Array.isArray(mod) ? mod : [mod]);

    export default function Checkout() {
      const { state, placeOrder, calculateCartTotal } = useStore();
      const navigate = useNavigate();
      const [loading, setLoading] = useState(false);
      const [deliveryAddress, setDeliveryAddress] = useState('123 Home St, Apt 4B');
      const [deliveryTime, setDeliveryTime] = useState('ASAP (25-35 min)');
      const [paymentMethod, setPaymentMethod] = useState('Visa 4242');
      const [editing, setEditing] = useState(null);
      
      const { items, restaurantId } = state.cart;
      const restaurant = state.restaurants.find(r => r.id === restaurantId);
      const totals = calculateCartTotal(items);

      if (items.length === 0) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold">Your cart is empty</h2>
                <button onClick={() => navigate('/')} className="mt-4 text-primary underline">Go back home</button>
            </div>
        );
      }

      const handlePlaceOrder = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          const orderId = placeOrder({
            address: deliveryAddress,
            instructions: 'Leave at door',
            time: deliveryTime,
            paymentMethod
          });
          setLoading(false);
          navigate('/orders');
        }, 1500);
      };

      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              {/* Delivery Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h2 className="text-xl font-bold">Delivery Details</h2>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                  <MapPin className="w-6 h-6" />
                  <div className="flex-1">
                    <p className="font-bold">{deliveryAddress}</p>
                    <p className="text-sm text-gray-500">New York, NY</p>
                  </div>
                  <button onClick={() => setEditing(editing === 'address' ? null : 'address')} className="text-sm font-bold text-primary">Edit</button>
                </div>
                {editing === 'address' && (
                  <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                    <label className="text-sm font-bold" htmlFor="delivery-address">Delivery address</label>
                    <input
                      id="delivery-address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                    <button onClick={() => setEditing(null)} className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white">Save address</button>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                  <Clock className="w-6 h-6" />
                  <div className="flex-1">
                    <p className="font-bold">Standard Delivery</p>
                    <p className="text-sm text-gray-500">{deliveryTime}</p>
                  </div>
                  <button onClick={() => setEditing(editing === 'time' ? null : 'time')} className="text-sm font-bold text-primary">Schedule</button>
                </div>
                {editing === 'time' && (
                  <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                    {['ASAP (25-35 min)', 'Today 7:00 PM', 'Tomorrow 12:30 PM'].map(option => (
                      <label key={option} className="flex items-center gap-3 text-sm">
                        <input type="radio" name="delivery-time" checked={deliveryTime === option} onChange={() => setDeliveryTime(option)} className="h-4 w-4 accent-primary" />
                        {option}
                      </label>
                    ))}
                    <button onClick={() => setEditing(null)} className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white">Save time</button>
                  </div>
                )}
              </div>

               {/* Payment */}
               <div className="space-y-4 pt-4 border-t border-gray-100">
                <h2 className="text-xl font-bold">Payment</h2>
                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                  <CreditCard className="w-6 h-6" />
                  <div className="flex-1">
                    <p className="font-bold">{paymentMethod === 'Visa 4242' ? 'Visa •••• 4242' : paymentMethod}</p>
                  </div>
                  <button onClick={() => setEditing(editing === 'payment' ? null : 'payment')} className="text-sm font-bold text-primary">Edit</button>
                </div>
                {editing === 'payment' && (
                  <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                    {['Visa 4242', 'Apple Pay', 'Business card •••• 1881'].map(option => (
                      <label key={option} className="flex items-center gap-3 text-sm">
                        <input type="radio" name="payment-method" checked={paymentMethod === option} onChange={() => setPaymentMethod(option)} className="h-4 w-4 accent-primary" />
                        {option}
                      </label>
                    ))}
                    <button onClick={() => setEditing(null)} className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white">Save payment</button>
                  </div>
                )}
              </div>

              {/* Order Summary Items */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h2 className="text-xl font-bold">Order Summary</h2>
                <p className="text-sm text-gray-500">{restaurant?.name}</p>
                <div className="space-y-4">
                   {items.map(item => (
                     <div key={item.cartItemId} className="flex gap-4">
                       <div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold h-fit">{item.quantity}x</div>
                       <div className="flex-1">
                         <p className="font-medium">{item.menuItem.name}</p>
                         <p className="text-xs text-gray-500">
                           {modifierList(item.modifiers).map(m => m.name).join(', ')}
                         </p>
                       </div>
                       <div className="text-sm">
                         {formatCurrency((item.menuItem.price + modifierList(item.modifiers).reduce((s, m) => s + (m.price || 0), 0)) * item.quantity)}
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            {/* Total & Button */}
            <div className="md:w-80 shrink-0">
               <div className="bg-gray-50 p-6 rounded-xl space-y-4 sticky top-24">
                  <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>{formatCurrency(totals.fee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes & Fees</span>
                        <span>{formatCurrency(totals.tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>{formatCurrency(totals.total)}</span>
                      </div>
                   </div>

                   <button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full bg-primary text-white font-bold py-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {loading ? 'Processing...' : 'Place Order'}
                   </button>
                   <p className="text-xs text-center text-gray-500">
                     By placing your order, you agree to our Terms of Use and Privacy Policy.
                   </p>
               </div>
            </div>
          </div>
        </div>
      );
    }
  
