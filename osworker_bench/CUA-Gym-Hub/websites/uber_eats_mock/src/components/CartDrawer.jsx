
    import React, { useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { X, Minus, Plus, Trash2 } from 'lucide-react';
    import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../lib/utils';

const modifierList = (modifiers) => Object.values(modifiers || {}).flatMap(mod => Array.isArray(mod) ? mod : [mod]);

    export default function CartDrawer({ isOpen, onClose }) {
      const { state, removeFromCart, updateCartItemQuantity, calculateCartTotal } = useStore();
      const navigate = useNavigate();

      useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event) => {
          if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [isOpen, onClose]);

      if (!isOpen) return null;

      const { items, restaurantId } = state.cart;
      const restaurant = state.restaurants.find(r => r.id === restaurantId);
      const totals = calculateCartTotal(items);

      const handleCheckout = () => {
        onClose();
        navigate('/checkout');
      };

      return (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          
          {/* Drawer */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 flex items-center justify-center border-b border-gray-100">
              <h2 className="font-bold text-lg">Your Order</h2>
              <button onClick={onClose} className="absolute left-4 p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="font-bold text-xl text-black mb-2">Cart is empty</h3>
                <p>Go add some delicious food!</p>
                <button 
                  onClick={onClose}
                  className="mt-6 bg-black text-white px-6 py-3 rounded-full font-bold"
                >
                  Browse Restaurants
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {restaurant && (
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <img src={restaurant.image} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <h3 className="font-bold">{restaurant.name}</h3>
                        <p className="text-xs text-gray-500">Delivery in {restaurant.deliveryTime}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.cartItemId} className="flex gap-4">
                        <div className="flex flex-col items-center gap-1 border border-gray-200 rounded-full h-fit py-1 px-2">
                          <button 
                            onClick={() => updateCartItemQuantity(item.cartItemId, 1)}
                            className="p-1 hover:text-primary"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => item.quantity > 1 ? updateCartItemQuantity(item.cartItemId, -1) : removeFromCart(item.cartItemId)}
                            className="p-1 hover:text-red-500"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{item.menuItem.name}</h4>
                            <span className="text-sm text-gray-500">
                              {formatCurrency((item.menuItem.price + modifierList(item.modifiers).reduce((s, m) => s + (m.price || 0), 0)) * item.quantity)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                            {modifierList(item.modifiers).map((mod, idx) => (
                              <p key={idx}>{mod.name} {mod.price > 0 && `(+${formatCurrency(mod.price)})`}</p>
                            ))}
                            {item.instructions && <p className="italic">"{item.instructions}"</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4">
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
                   </div>
                   <button 
                    onClick={handleCheckout}
                    className="w-full bg-primary text-white font-bold py-4 rounded-lg hover:bg-green-600 transition-colors flex justify-between px-4"
                   >
                     <span>Go to Checkout</span>
                     <span>{formatCurrency(totals.total)}</span>
                   </button>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
  
