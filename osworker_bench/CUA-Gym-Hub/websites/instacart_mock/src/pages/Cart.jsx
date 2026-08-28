import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const navigate = useNavigate();

  const cartItems = state.cart;
  const cartStoreId = cartItems[0]?.storeId || state.currentStoreId;
  const store = state.stores.find(s => s.id === cartStoreId);
  
  const subtotal = cartItems.reduce((acc, item) => {
    const product = state.products.find(p => p.id === item.productId);
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);

  const handleUpdateQuantity = (productId, delta) => {
    const item = cartItems.find(i => i.productId === productId);
    const newQty = item.quantity + delta;
    
    if (newQty <= 0) {
      dispatch({ type: ACTION_TYPES.REMOVE_FROM_CART, payload: productId });
    } else {
      dispatch({ 
        type: ACTION_TYPES.UPDATE_CART_ITEM, 
        payload: { productId, quantity: newQty } 
      });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Trash2 className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Start shopping to add items to your cart</p>
        <Link to="/" className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primaryDark transition-colors">
          Browse Stores
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <img src={store?.logo} className="w-8 h-8 rounded-full" alt="" />
            <span className="font-bold text-gray-700">Items from {store?.name}</span>
          </div>

          {cartItems.map(item => {
            const product = state.products.find(p => p.id === item.productId);
            if (!product) return null;

            return (
              <div key={item.productId} className="flex gap-4 bg-white p-4 rounded-xl border border-gray-200">
                <img src={product.image} alt={product.name} className="w-20 h-20 object-contain rounded-lg bg-gray-50" />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.unit}</p>
                    </div>
                    <div className="font-bold text-gray-900">${(product.price * item.quantity).toFixed(2)}</div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-200 rounded-full">
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, -1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-l-full"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-r-full"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      Sub: {item.subPreference === 'best_match' ? 'Best Match' : 'Refund'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full lg:w-80 h-fit bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium">${(store?.deliveryFee || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-medium">$2.00</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mb-6">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${(subtotal + (store?.deliveryFee || 0) + 2).toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primaryDark transition-colors flex items-center justify-center gap-2"
          >
            Go to Checkout <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
