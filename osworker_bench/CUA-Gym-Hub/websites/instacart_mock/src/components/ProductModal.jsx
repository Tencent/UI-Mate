import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Minus, X, AlertCircle } from 'lucide-react';

export default function ProductModal({ product, storeId, onClose }) {
  const { state, dispatch, ACTION_TYPES } = useApp();
  
  const cartItem = state.cart.find(i => i.productId === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  
  const handleUpdateQuantity = (delta) => {
    if (!product.inStock) return;
    const newQty = quantity + delta;
    if (newQty <= 0) {
      if (quantity > 0) dispatch({ type: ACTION_TYPES.REMOVE_FROM_CART, payload: product.id });
    } else if (quantity === 0 && delta > 0) {
      dispatch({ 
        type: ACTION_TYPES.ADD_TO_CART, 
        payload: { 
          productId: product.id, 
          quantity: 1,
          subPreference: 'best_match',
          subProductId: null,
          storeId
        } 
      });
    } else {
      dispatch({ 
        type: ACTION_TYPES.UPDATE_CART_ITEM, 
        payload: { productId: product.id, quantity: newQty } 
      });
    }
  };

  const handleSubPreferenceChange = (pref) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_SUBSTITUTION,
      payload: {
        productId: product.id,
        subPreference: pref,
        subProductId: null // Reset specific product if changing type
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 bg-gray-50 p-8 flex items-center justify-center">
            <img src={product.image} alt={product.name} className="w-full max-w-[250px] object-contain mix-blend-multiply" />
          </div>
          
          <div className="w-full md:w-1/2 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
              <div className="text-3xl font-bold text-gray-900 mb-1">${product.price}</div>
              <p className="text-gray-500">{product.unit}</p>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-full">
                <button 
                  onClick={() => handleUpdateQuantity(-1)}
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-l-full transition-colors"
                  disabled={quantity === 0}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button 
                  onClick={() => handleUpdateQuantity(1)}
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-r-full transition-colors"
                  disabled={!product.inStock}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={() => {
                  if (!product.inStock) return;
                  if (quantity === 0) handleUpdateQuantity(1);
                  onClose();
                }}
                disabled={!product.inStock}
                className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primaryDark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {!product.inStock ? 'Out of Stock' : (quantity === 0 ? 'Add to Cart' : 'Update Cart')}
              </button>
            </div>

            {quantity > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-900">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  If out of stock:
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input 
                      type="radio" 
                      name="sub_pref" 
                      checked={cartItem?.subPreference === 'best_match'}
                      onChange={() => handleSubPreferenceChange('best_match')}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Find Best Match</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input 
                      type="radio" 
                      name="sub_pref" 
                      checked={cartItem?.subPreference === 'refund'}
                      onChange={() => handleSubPreferenceChange('refund')}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Don't Replace (Refund)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
