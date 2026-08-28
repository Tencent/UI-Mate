import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const STATUS_FLOW = { placed: 'shopping', shopping: 'delivering', delivering: 'delivered' };
const STATUS_LABELS = { placed: 'Order Placed', shopping: 'Being Shopped', delivering: 'On the Way', delivered: 'Delivered' };

export default function Orders() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const navigate = useNavigate();
  const [ratingOrder, setRatingOrder] = useState(null);
  const [hoverStar, setHoverStar] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const statusLabel = (s) => STATUS_LABELS[s] || s;

  const handleReorder = (order) => {
    order.items.forEach(item => {
      const existingCartItem = state.cart.find(ci => ci.productId === item.productId);
      if (!existingCartItem) {
        dispatch({ type: ACTION_TYPES.ADD_TO_CART, payload: { productId: item.productId, storeId: order.storeId, quantity: item.quantity } });
      }
    });
    navigate('/cart');
  };

  const handleAdvanceStatus = (order) => {
    const nextStatus = STATUS_FLOW[order.status];
    if (!nextStatus) return;
    dispatch({ type: ACTION_TYPES.UPDATE_ORDER_STATUS, payload: { orderId: order.id, status: nextStatus } });
  };

  return (
    <div className="page-content">
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Your Orders</h1>
      {state.orders.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>&#x1F4E6;</div>
          <h3 style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>No orders yet</h3>
          <p style={{ color:'var(--color-text-secondary)' }}>Your order history will appear here</p>
        </div>
      ) : (
        state.orders.map(order => {
          const store = state.stores.find(s => s.id === order.storeId);
          const isExpanded = expandedOrder === order.id;
          return (
            <div key={order.id} className="order-card" style={{ position: 'relative', flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="order-card-logo" style={{ background: store?.color || '#888' }}>{store?.emoji || '&#x1F6D2;'}</div>
                <div className="order-card-info" style={{ flex: 1 }}>
                  <div className="order-card-store">{order.storeName || store?.name}</div>
                  <div className="order-card-meta">
                    <span>{order.itemCount || order.items?.length} items</span>
                    <span>${(order.total || 0).toFixed(2)}</span>
                    <span>{order.deliveryDate}</span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span className={`order-status-badge ${order.status}`}>{statusLabel(order.status)}</span>
                  </div>
                  <div className="order-items-preview">
                    {order.items?.slice(0, 5).map((item, idx) => {
                      const p = state.products.find(pr => pr.id === item.productId);
                      return <div key={idx} className="order-item-thumb">{p?.emoji || '&#x1F4E6;'}</div>;
                    })}
                    {order.items?.length > 5 && <div className="order-item-thumb" style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>+{order.items.length - 5}</div>}
                  </div>
                </div>
                <div className="order-card-actions">
                  {order.status === 'delivered' && !order.shopperRating && (
                    <button className="btn-outline" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => setRatingOrder(order.id)}>Rate</button>
                  )}
                  {order.shopperRating && (
                    <div style={{ display:'flex', gap:2 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= order.shopperRating ? '#FFC107' : '#ddd', fontSize: 16 }}>&#x2605;</span>)}
                    </div>
                  )}
                  {order.status !== 'delivered' && STATUS_FLOW[order.status] && (
                    <button className="btn-outline" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => handleAdvanceStatus(order)}>
                      Advance Status
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button className="btn-outline" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => handleReorder(order)}>&#x1F504; Reorder</button>
                  )}
                  <button className="btn-outline" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => navigate(`/orders/${order.id}`)}>View Details</button>
                  <button style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, padding: '6px 8px' }} onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                    {isExpanded ? '▲ Less' : '▼ More'}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Delivery Address</div>
                      <div style={{ fontWeight: 500 }}>{order.deliveryAddress}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Delivery Window</div>
                      <div style={{ fontWeight: 500 }}>{order.deliveryWindow}</div>
                    </div>
                    {order.placedAt && (
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Placed At</div>
                        <div style={{ fontWeight: 500 }}>{new Date(order.placedAt).toLocaleString()}</div>
                      </div>
                    )}
                    {order.shopperName && (
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Shopper</div>
                        <div style={{ fontWeight: 500 }}>{order.shopperName}</div>
                      </div>
                    )}
                  </div>
                  <div>
                    {order.items?.map((item, idx) => {
                      const p = state.products.find(pr => pr.id === item.productId);
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: idx < order.items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-page-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{p?.emoji || '&#x1F4E6;'}</div>
                          <div style={{ flex: 1, fontSize: 13 }}>
                            <div style={{ fontWeight: 500 }}>{item.productName}</div>
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>Qty: {item.quantity}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)', fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span><span>${(order.subtotal || 0).toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ color: 'var(--color-text-secondary)' }}>Delivery</span>{order.deliveryFee === 0 ? <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Free</span> : <span>${(order.deliveryFee || 0).toFixed(2)}</span>}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ color: 'var(--color-text-secondary)' }}>Service Fee</span><span>${(order.serviceFee || 0).toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ color: 'var(--color-text-secondary)' }}>Tip</span><span>${(order.tip || 0).toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}><span>Total</span><span>${(order.total || 0).toFixed(2)}</span></div>
                  </div>
                </div>
              )}

              {ratingOrder === order.id && (
                <div style={{ position:'absolute', right:80, top:20, background:'var(--color-white)', borderRadius:'var(--radius-card)', boxShadow:'0 4px 20px rgba(0,0,0,0.15)', padding:16, zIndex:10 }}>
                  <div style={{ fontWeight:600, marginBottom:8 }}>Rate your shopper</div>
                  <div style={{ display:'flex', gap:4 }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} style={{ fontSize:24, color: s <= hoverStar ? '#FFC107' : '#ddd' }} onMouseEnter={() => setHoverStar(s)} onMouseLeave={() => setHoverStar(0)}
                        onClick={() => { dispatch({ type: ACTION_TYPES.RATE_ORDER, payload: { orderId: order.id, rating: s } }); setRatingOrder(null); setHoverStar(0); }}>
                        &#x2605;
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
