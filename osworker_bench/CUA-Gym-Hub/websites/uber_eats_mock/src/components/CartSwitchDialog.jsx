import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CartSwitchDialog() {
  const { state, pendingCartSwitch, confirmCartSwitch, cancelCartSwitch } = useStore();

  useEffect(() => {
    if (!pendingCartSwitch) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') cancelCartSwitch();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingCartSwitch, cancelCartSwitch]);

  if (!pendingCartSwitch) return null;

  const currentRestaurant = state.restaurants.find(rest => rest.id === state.cart.restaurantId);
  const nextRestaurant = state.restaurants.find(rest => rest.id === pendingCartSwitch.item.restaurantId);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={cancelCartSwitch}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Start a new basket?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your current basket from {currentRestaurant?.name || 'another restaurant'} will be replaced with an item from {nextRestaurant?.name || 'this restaurant'}.
            </p>
          </div>
          <button onClick={cancelCartSwitch} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close cart switch dialog">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 text-sm">
          <p className="font-bold">{pendingCartSwitch.item.name}</p>
          <p className="text-gray-500">Quantity: {pendingCartSwitch.quantity}</p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={cancelCartSwitch} className="rounded-full bg-gray-100 px-5 py-3 text-sm font-bold hover:bg-gray-200">
            Keep current basket
          </button>
          <button onClick={confirmCartSwitch} className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white hover:bg-gray-800">
            Start new basket
          </button>
        </div>
      </div>
    </div>
  );
}
