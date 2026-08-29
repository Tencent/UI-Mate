import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';

export const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { state } = useStore();
  const order = state.orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="max-w-[720px] mx-auto p-6">
        <div className="bg-white border rounded p-8 text-center">
          <Package size={44} className="mx-auto text-gray-300 mb-3" />
          <h1 className="text-2xl font-medium mb-2">Order not found</h1>
          <p className="text-sm text-gray-600 mb-5">This confirmation may have expired or the order was reset.</p>
          <Link to="/orders">
            <Button>View your orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto p-4">
      <div className="bg-white border rounded p-6 mb-4">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <CheckCircle size={44} className="text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <h1 className="text-2xl font-medium text-green-700">Order placed, thank you!</h1>
            <p className="text-sm text-gray-600 mt-1">Confirmation number: <span className="font-mono">{order.id}</span></p>
            {order.estimatedDelivery && (
              <p className="text-sm text-gray-700 mt-2">
                Estimated delivery: <span className="font-bold">{new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link to="/orders">
              <Button variant="secondary">View orders</Button>
            </Link>
            <Link to="/">
              <Button>Continue shopping</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-4">
        <div className="bg-white border rounded p-4">
          <h2 className="font-bold mb-3">Items in this order</h2>
          <div className="space-y-3">
            {order.items.map(item => {
              const product = state.products.find(p => p.id === item.productId);
              if (!product) return null;
              return (
                <div key={item.productId} className="flex gap-3 border-b last:border-0 pb-3 last:pb-0">
                  <img src={product.image} alt={product.title} className="w-16 h-16 object-contain flex-shrink-0" />
                  <div className="text-sm">
                    <Link to={`/product/${product.id}`} className="font-medium text-xmazon-blue hover:underline line-clamp-2">{product.title}</Link>
                    <div className="text-gray-500 mt-1">Qty: {item.quantity}</div>
                    <div className="font-bold text-red-700">${product.price.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border rounded p-4 h-fit text-sm">
          <h2 className="font-bold mb-3">Order summary</h2>
          <div className="space-y-2 border-b pb-3 mb-3">
            <div className="flex justify-between">
              <span>Status</span>
              <span className="font-bold text-orange-600">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-bold">${order.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mb-3">
            <div className="font-bold text-xs uppercase text-gray-500 mb-1">Ship to</div>
            <div>{order.shippingAddress.fullName}</div>
            <div className="text-gray-600">{order.shippingAddress.street}</div>
            <div className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
          </div>
          <div>
            <div className="font-bold text-xs uppercase text-gray-500 mb-1">Paid with</div>
            <div>{order.paymentMethod.brand} ending in {order.paymentMethod.last4}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
