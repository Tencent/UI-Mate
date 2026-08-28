import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Clock, ShoppingBag, Truck, Send, AlertTriangle } from 'lucide-react';

export default function OrderStatus() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const [messageInput, setMessageInput] = useState('');
  const chatContainerRef = useRef(null);

  const order = state.orders.find(o => o.id === state.activeOrder) || state.orders[0];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [order?.chat]);

  // Simulation Effect
  useEffect(() => {
    if (!order || order.status === 'delivered') return;

    const steps = ['received', 'shopping', 'checkout', 'delivering', 'delivered'];
    const currentStepIndex = steps.indexOf(order.status);

    if (currentStepIndex < steps.length - 1) {
      const timeout = setTimeout(() => {
        const nextStatus = steps[currentStepIndex + 1];
        
        // Mock Chat Messages based on status
        if (nextStatus === 'shopping') {
          dispatch({
            type: ACTION_TYPES.ADD_CHAT_MESSAGE,
            payload: { orderId: order.id, message: { sender: 'shopper', text: "Hi! I'm starting your shop now. I'll let you know if there are any issues.", time: new Date().toLocaleTimeString() } }
          });
        }
        
        if (nextStatus === 'shopping') {
            setTimeout(() => {
                 dispatch({
                    type: ACTION_TYPES.ADD_CHAT_MESSAGE,
                    payload: { orderId: order.id, message: { sender: 'shopper', text: "I'll follow your replacement preferences if anything is out of stock.", time: new Date().toLocaleTimeString() } }
                  });
            }, 3000);
        }

        if (nextStatus === 'delivering') {
          dispatch({
            type: ACTION_TYPES.ADD_CHAT_MESSAGE,
            payload: { orderId: order.id, message: { sender: 'shopper', text: "I'm on my way! ETA 10 minutes.", time: new Date().toLocaleTimeString() } }
          });
        }

        dispatch({
          type: ACTION_TYPES.UPDATE_ORDER_STATUS,
          payload: { orderId: order.id, updates: { status: nextStatus } }
        });
      }, 8000); // Change status every 8 seconds for demo

      return () => clearTimeout(timeout);
    }
  }, [order?.status, order?.id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    dispatch({
      type: ACTION_TYPES.ADD_CHAT_MESSAGE,
      payload: { 
        orderId: order.id, 
        message: { sender: 'user', text: messageInput, time: new Date().toLocaleTimeString() } 
      }
    });
    setMessageInput('');
  };

  if (!order) return <div className="p-8 text-center">No active orders</div>;

  const getStatusStep = () => {
    switch (order.status) {
      case 'received': return 1;
      case 'shopping': return 2;
      case 'checkout': return 3;
      case 'delivering': return 4;
      case 'delivered': return 5;
      default: return 1;
    }
  };

  const currentStep = getStatusStep();

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
      {/* Status Panel */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Status</h1>
          <p className="text-gray-500 mb-8">Order #{order.id}</p>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-8 relative">
              {[
                { label: 'Order Received', icon: CheckCircle },
                { label: 'Shopping in Progress', icon: ShoppingBag },
                { label: 'Checking Out', icon: Clock },
                { label: 'Out for Delivery', icon: Truck },
                { label: 'Delivered', icon: CheckCircle }
              ].map((step, idx) => {
                const isActive = currentStep > idx;
                const isCurrent = currentStep === idx + 1;
                const Icon = step.icon;
                
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${isActive || isCurrent ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`font-bold ${isActive || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</div>
                      {isCurrent && <div className="text-xs text-primary font-medium animate-pulse">In Progress...</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="font-bold text-lg mb-4">Items ({order.items.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {order.items.map(item => {
               const product = state.products.find(p => p.id === item.productId);
               return (
                 <div key={item.productId} className="flex gap-3 items-center p-2 border border-gray-100 rounded-lg">
                   <img src={product?.image} className="w-12 h-12 rounded bg-gray-50 object-cover" alt="" />
                   <div className="flex-1">
                     <div className="font-medium text-sm">{product?.name}</div>
                     <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                   </div>
                   {currentStep >= 3 && (
                     <div className="text-green-500">
                       <CheckCircle className="w-5 h-5" />
                     </div>
                   )}
                 </div>
               );
             })}
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-full lg:w-96 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[500px] lg:h-auto">
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="font-bold text-gray-900">Shopper Chat</h2>
          <p className="text-xs text-gray-500">Your shopper is Alex</p>
        </div>
        
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {(!order.chat || order.chat.length === 0) && (
            <div className="text-center text-gray-400 text-sm mt-10">
              No messages yet
            </div>
          )}
          {order.chat?.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                <p>{msg.text}</p>
                <div className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-green-100' : 'text-gray-400'}`}>{msg.time}</div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex gap-2">
          <input 
            type="text" 
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Message your shopper..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button type="submit" className="bg-primary text-white p-2 rounded-full hover:bg-primaryDark transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
