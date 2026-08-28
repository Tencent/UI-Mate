
import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../lib/utils';
import { CheckCircle, Clock, ChefHat, Truck, MapPin, X } from 'lucide-react';

const STATUS_CONFIG = {
  preparing: { icon: ChefHat, color: 'text-orange-500', label: 'Preparing your order' },
  picked_up: { icon: Truck, color: 'text-blue-500', label: 'Heading to you' },
  delivering: { icon: Truck, color: 'text-blue-500', label: 'Arriving soon' },
  delivered: { icon: CheckCircle, color: 'text-green-500', label: 'Delivered' },
};

export default function Orders() {
  const { state, reorder } = useStore();
  const orders = state.orders;
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);

  useEffect(() => {
    if (!receiptOrder) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setReceiptOrder(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [receiptOrder]);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-gray-500">Looks like you haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Orders</h1>
      
      <div className="space-y-6">
        {orders.map(order => {
          const restaurant = state.restaurants.find(r => r.id === order.restaurantId);
          const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.preparing;
          const StatusIcon = status.icon;
          const isLive = order.status !== 'delivered';

          return (
            <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <img src={restaurant?.image} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{restaurant?.name || 'Unknown Restaurant'}</h3>
                      <p className="text-sm text-gray-500">
                        {order.items.length} items • {formatCurrency(order.total.total)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.created).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 font-medium ${status.color}`}>
                    <StatusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">{status.label}</span>
                  </div>
                </div>

                {/* Progress Bar for Active Orders */}
                {isLive && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ 
                          width: order.status === 'preparing' ? '30%' : 
                                 order.status === 'picked_up' ? '60%' : '90%' 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>Preparing</span>
                      <span>Picked Up</span>
                      <span>Delivering</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="text-sm space-y-1">
                    {order.items.map(item => (
                      <div key={item.cartItemId} className="flex justify-between text-gray-600">
                        <span>{item.quantity}x {item.menuItem.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-6">
                    {isLive && (
                      <button 
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="flex-1 sm:flex-none bg-primary text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        {expandedOrder === order.id ? 'Hide Map' : 'Track Order'}
                      </button>
                    )}
                    <button
                      onClick={() => setReceiptOrder(order)}
                      className="flex-1 sm:flex-none bg-gray-100 px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-200"
                    >
                      View Receipt
                    </button>
                    <button
                      onClick={() => reorder(order.id)}
                      className="flex-1 sm:flex-none bg-black text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-800"
                    >
                        Reorder
                    </button>
                  </div>
                </div>
              </div>

              {/* Mock Map View */}
              {expandedOrder === order.id && isLive && (
                <div className="bg-gray-50 p-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
                  <div className="relative w-full h-64 bg-gray-200 rounded-xl overflow-hidden">
                    {/* Mock Map Image */}
                    <img 
                      src="https://picsum.photos/800/400?grayscale&blur=2" 
                      className="w-full h-full object-cover opacity-50"
                      alt="Map Background"
                    />
                    
                    {/* Map Elements Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-3/4 h-3/4 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                        {/* Restaurant Pin */}
                        <div className="absolute top-4 left-4 flex flex-col items-center">
                          <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center p-1">
                            <img src={restaurant?.image} className="w-full h-full rounded-full object-cover" />
                          </div>
                          <div className="w-2 h-2 bg-black rounded-full mt-1"></div>
                        </div>

                        {/* User Pin */}
                        <div className="absolute bottom-4 right-4 flex flex-col items-center">
                          <div className="w-8 h-8 bg-black text-white rounded-full shadow-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="w-2 h-2 bg-black rounded-full mt-1"></div>
                        </div>

                        {/* Driver */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                          <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg mb-1 whitespace-nowrap">
                            5 min away
                          </div>
                          <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-primary">
                            <Truck className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setReceiptOrder(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Receipt</h2>
                <p className="text-sm text-gray-500">Order {receiptOrder.id}</p>
              </div>
              <button onClick={() => setReceiptOrder(null)} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close receipt">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {receiptOrder.items.map(item => (
                <div key={item.cartItemId} className="flex justify-between gap-4 text-sm">
                  <span>{item.quantity}x {item.menuItem.name}</span>
                  <span>{formatCurrency(item.menuItem.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(receiptOrder.total.subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span>{formatCurrency(receiptOrder.total.fee)}</span></div>
              <div className="flex justify-between"><span>Taxes & Fees</span><span>{formatCurrency(receiptOrder.total.tax)}</span></div>
              <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-bold"><span>Total</span><span>{formatCurrency(receiptOrder.total.total)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
