import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { MapPin, CreditCard, Check } from 'lucide-react';

export const Checkout = () => {
  const { state, placeOrder } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(
    (state.user.addresses && state.user.addresses.length > 0
      ? state.user.addresses.find(a => a.isDefault) || state.user.addresses[0]
      : state.user.address).id || 'addr1'
  );
  const [selectedPmId, setSelectedPmId] = useState(
    (state.user.paymentMethods && state.user.paymentMethods.length > 0
      ? state.user.paymentMethods.find(p => p.isDefault) || state.user.paymentMethods[0]
      : state.user.paymentMethod).id || 'pm1'
  );

  const addresses = state.user.addresses || [state.user.address];
  const paymentMethods = state.user.paymentMethods || [state.user.paymentMethod];
  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0] || state.user.address;
  const selectedPm = paymentMethods.find(p => p.id === selectedPmId) || paymentMethods[0] || state.user.paymentMethod;

  const subtotal = state.cart.reduce((acc, item) => {
    const product = state.products.find(p => p.id === item.productId);
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handlePlaceOrder = () => {
    setLoading(true);
    setTimeout(() => {
      const orderData = {
        items: state.cart,
        total: total,
        shippingAddress: selectedAddress,
        paymentMethod: selectedPm,
        trackingNumber: null,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      const orderId = placeOrder(orderData);
      setLoading(false);
      navigate(`/order-confirmation/${orderId}`);
    }, 1500);
  };

  if (state.cart.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto p-8 text-center">
        <div className="text-4xl mb-4">🛒</div>
        <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
        <p className="text-sm text-gray-600 mb-6">Add items to your cart before checking out.</p>
        <Link to="/" className="inline-block bg-[#ffd814] hover:bg-[#f7ca00] px-6 py-2 rounded-lg font-bold text-[13px] border border-[#fcd200]">
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Checkout</h1>
        <div className="text-gray-500">
          <span className={step >= 1 ? "text-xmazon-darkYellow font-bold" : ""}>Shipping</span>
          <span className="mx-1">›</span>
          <span className={step >= 2 ? "text-xmazon-darkYellow font-bold" : ""}>Payment</span>
          <span className="mx-1">›</span>
          <span className={step >= 3 ? "text-xmazon-darkYellow font-bold" : ""}>Review</span>
        </div>
      </div>

      <div className="flex gap-8 flex-col-reverse md:flex-row">
        <div className="flex-1 space-y-4">
          {/* Step 1: Shipping */}
          <div className={`bg-white p-4 border rounded ${step === 1 ? 'border-xmazon-orange shadow-md' : ''}`}>
            <div className="flex justify-between mb-2">
              <h2 className="font-bold text-lg flex items-center gap-2">
                {step > 1 && <Check size={16} className="text-green-600" />}
                1. Shipping Address
              </h2>
              {step > 1 && <button onClick={() => setStep(1)} className="text-xmazon-blue text-sm hover:underline">Change</button>}
            </div>
            {step === 1 ? (
              <div>
                <div className="space-y-3 mb-4">
                  {addresses.map((addr, idx) => (
                    <label
                      key={addr.id || idx}
                      className={`flex gap-3 p-3 border rounded cursor-pointer hover:border-xmazon-orange transition-colors ${selectedAddressId === addr.id ? 'border-xmazon-orange bg-orange-50' : ''}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 accent-xmazon-orange flex-shrink-0"
                      />
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-500" />
                          <span className="font-bold">{addr.fullName}</span>
                          {addr.isDefault && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Default</span>}
                        </div>
                        <div className="text-gray-600 mt-1">{addr.street}</div>
                        <div className="text-gray-600">{addr.city}, {addr.state} {addr.zip}</div>
                        <div className="text-gray-600">{addr.country}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <Button onClick={() => setStep(2)}>Use this address</Button>
              </div>
            ) : (
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />
                {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}
              </div>
            )}
          </div>

          {/* Step 2: Payment */}
          <div className={`bg-white p-4 border rounded ${step === 2 ? 'border-xmazon-orange shadow-md' : ''}`}>
            <div className="flex justify-between mb-2">
              <h2 className="font-bold text-lg flex items-center gap-2">
                {step > 2 && <Check size={16} className="text-green-600" />}
                2. Payment Method
              </h2>
              {step > 2 && <button onClick={() => setStep(2)} className="text-xmazon-blue text-sm hover:underline">Change</button>}
            </div>
            {step === 2 ? (
              <div>
                <div className="space-y-3 mb-4">
                  {paymentMethods.map((pm, idx) => (
                    <label
                      key={pm.id || idx}
                      className={`flex gap-3 p-3 border rounded cursor-pointer hover:border-xmazon-orange transition-colors ${selectedPmId === pm.id ? 'border-xmazon-orange bg-orange-50' : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={pm.id}
                        checked={selectedPmId === pm.id}
                        onChange={() => setSelectedPmId(pm.id)}
                        className="mt-1 accent-xmazon-orange flex-shrink-0"
                      />
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-gray-500" />
                          <span className="font-bold">{pm.brand} ending in {pm.last4}</span>
                          {pm.isDefault && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Default</span>}
                        </div>
                        {pm.expiry && <div className="text-gray-500 mt-1 text-xs">Expires {pm.expiry}</div>}
                      </div>
                    </label>
                  ))}
                </div>
                <Button onClick={() => setStep(3)}>Use this payment method</Button>
              </div>
            ) : (
              step > 2 && (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <CreditCard size={14} className="text-gray-400" />
                  {selectedPm.brand} ending in {selectedPm.last4}
                </div>
              )
            )}
          </div>

          {/* Step 3: Review */}
          <div className={`bg-white p-4 border rounded ${step === 3 ? 'border-xmazon-orange shadow-md' : ''}`}>
            <h2 className="font-bold text-lg mb-4">3. Review items and shipping</h2>
            {step === 3 && (
              <div>
                {state.cart.map(item => {
                  const product = state.products.find(p => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="flex gap-4 mb-4 border p-2 rounded">
                      <img src={product.image} alt={product.title} className="w-16 h-16 object-contain" />
                      <div>
                        <div className="font-bold text-sm">{product.title}</div>
                        <div className="text-sm text-red-700 font-bold">${product.price.toFixed(2)}</div>
                        <div className="text-sm">Qty: {item.quantity}</div>
                      </div>
                    </div>
                  );
                })}
                <div className="border-t pt-4 mt-4">
                  <Button onClick={handlePlaceOrder} className="w-full md:w-auto" disabled={loading}>
                    {loading ? 'Placing Order...' : 'Place your order'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full md:w-72">
          <div className="bg-white p-4 border rounded sticky top-4">
            <Button onClick={handlePlaceOrder} className="w-full mb-4" disabled={step < 3 || loading}>
              {loading ? 'Processing...' : 'Place your order'}
            </Button>
            <p className="text-xs text-gray-500 mb-4">
              By placing your order, you agree to Xmazon.mock's privacy notice and conditions of use.
            </p>
            <h3 className="font-bold text-lg mb-2">Order Summary</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span>Items:</span> <span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping:</span> <span>$0.00</span></div>
              <div className="flex justify-between"><span>Tax:</span> <span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between border-t pt-1 font-bold text-red-700 text-lg">
                <span>Order Total:</span> <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
