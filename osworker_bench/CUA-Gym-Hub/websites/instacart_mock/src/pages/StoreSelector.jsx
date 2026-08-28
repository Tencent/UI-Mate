import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Clock, Truck, DollarSign } from 'lucide-react';

export default function StoreSelector() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const navigate = useNavigate();
  const [pendingStoreId, setPendingStoreId] = useState(null);

  const handleSelectStore = (storeId) => {
    if (state.cart.length > 0 && state.currentStoreId !== storeId) {
      setPendingStoreId(storeId);
      return;
    }
    dispatch({ type: ACTION_TYPES.SET_STORE, payload: storeId });
    navigate(`/store/${storeId}`);
  };

  const confirmStoreSwitch = () => {
    if (!pendingStoreId) return;
    dispatch({ type: ACTION_TYPES.SET_STORE, payload: pendingStoreId });
    navigate(`/store/${pendingStoreId}`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Choose a store to start shopping</h1>
        <p className="text-gray-500">Delivery in as fast as 1 hour</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.stores.map((store) => (
          <button
            key={store.id}
            onClick={() => handleSelectStore(store.id)}
            className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all text-left"
          >
            <div className={`h-24 ${store.color} flex items-center justify-center p-4`}>
              <img 
                src={store.logo} 
                alt={store.name} 
                className="w-16 h-16 rounded-full shadow-md object-cover bg-white"
              />
            </div>
            <div className="p-5 space-y-4 w-full">
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{store.name}</h3>
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium mt-1">
                  <Clock className="w-4 h-4" />
                  <span>By 11:00 AM</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  <span>${store.deliveryFee} delivery</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Min ${store.minOrder}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {pendingStoreId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Start a new cart?</h2>
            <p className="text-gray-600 mb-6">
              Your current cart has items from another store. Switching stores will clear those items for this local order.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPendingStoreId(null)}
                className="flex-1 border border-gray-300 rounded-full py-3 font-bold hover:bg-gray-50"
              >
                Keep cart
              </button>
              <button
                type="button"
                onClick={confirmStoreSwitch}
                className="flex-1 bg-primary text-white rounded-full py-3 font-bold hover:bg-primaryDark"
              >
                Clear and switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
