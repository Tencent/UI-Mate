import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function OrderDetail() {
  const { orderId } = useParams();
  const { state, dispatch, ACTION_TYPES } = useApp();
  const navigate = useNavigate();

  const order = state.orders.find(o => o.id === orderId);
  if (!order) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#x1F4E6;</div>
        <h2>Order not found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 8 }}>This order doesn't exist or has been removed.</p>
        <button className="btn-primary" style={{ width: 'auto', marginTop: 24, display: 'inline-flex' }} onClick={() => navigate('/orders')}>Back to Orders</button>
      </div>
    );
  }

  const store = state.stores.find(s => s.id === order.storeId);
  const statusLabel = { placed: 'Order Placed', shopping: 'Being Shopped', delivering: 'On the Way', delivered: 'Delivered' }[order.status] || order.status;

  const handleReorder = () => {
    order.items.forEach(item => {
      const existingCartItem = state.cart.find(ci => ci.productId === item.productId);
      if (!existingCartItem) {
        dispatch({ type: ACTION_TYPES.ADD_TO_CART, payload: { productId: item.productId, storeId: order.storeId, quantity: item.quantity } });
      }
    });
    navigate('/cart');
  };

  return (
    <div className="page-content" style={{ maxWidth: 800 }}>
      <button style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 16 }} onClick={() => navigate('/orders')}>
        &#x2190; Back to Orders
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: store?.color || '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {store?.emoji || '&#x1F6D2;'}
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{order.storeName || store?.name}</h1>
          <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Order {order.id} &middot; {order.deliveryDate}</div>
        </div>
        <span className={`order-status-badge ${order.status}`} style={{ marginLeft: 'auto' }}>{statusLabel}</span>
      </div>

      <div className="checkout-section" style={{ marginBottom: 16 }}>
        <h2>Delivery Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
          <div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 4 }}>Delivery Address</div>
            <div style={{ fontWeight: 500 }}>{order.deliveryAddress}</div>
          </div>
          <div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 4 }}>Delivery Window</div>
            <div style={{ fontWeight: 500 }}>{order.deliveryWindow}</div>
          </div>
          {order.shopperName && (
            <div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 4 }}>Shopper</div>
              <div style={{ fontWeight: 500 }}>{order.shopperName}</div>
            </div>
          )}
          {order.placedAt && (
            <div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 4 }}>Placed At</div>
              <div style={{ fontWeight: 500 }}>{new Date(order.placedAt).toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>

      <div className="checkout-section" style={{ marginBottom: 16 }}>
        <h2>Items ({order.items?.length || order.itemCount})</h2>
        {order.items?.map((item, idx) => {
          const product = state.products.find(p => p.id === item.productId);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: idx < order.items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-page-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {product?.emoji || '&#x1F4E6;'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{item.productName}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Qty: {item.quantity}</div>
                {item.wasReplaced && item.replacementProductName && (
                  <div style={{ fontSize: 12, color: 'var(--color-primary)', marginTop: 2 }}>Replaced with: {item.replacementProductName}</div>
                )}
              </div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          );
        })}
      </div>

      <div className="checkout-section" style={{ marginBottom: 16 }}>
        <h2>Order Summary</h2>
        <div className="cart-summary-row"><span className="label">Subtotal</span><span>${(order.subtotal || 0).toFixed(2)}</span></div>
        <div className="cart-summary-row"><span className="label">Delivery</span>{order.deliveryFee === 0 ? <span className="free">Free</span> : <span>${(order.deliveryFee || 0).toFixed(2)}</span>}</div>
        <div className="cart-summary-row"><span className="label">Service Fee</span><span>${(order.serviceFee || 0).toFixed(2)}</span></div>
        <div className="cart-summary-row"><span className="label">Shopper Tip</span><span>${(order.tip || 0).toFixed(2)}</span></div>
        <div className="cart-summary-row"><span className="label">Estimated Tax</span><span>${(order.tax || 0).toFixed(2)}</span></div>
        <div className="cart-summary-row total"><span>Total</span><span>${(order.total || 0).toFixed(2)}</span></div>
      </div>

      {order.status === 'delivered' && (
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="btn-primary" style={{ flex: 1 }} onClick={handleReorder}>&#x1F504; Reorder</button>
        </div>
      )}

      {order.shopperRating && (
        <div className="checkout-section" style={{ marginTop: 16 }}>
          <h2>Shopper Rating</h2>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= order.shopperRating ? '#FFC107' : '#ddd', fontSize: 20 }}>&#x2605;</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
