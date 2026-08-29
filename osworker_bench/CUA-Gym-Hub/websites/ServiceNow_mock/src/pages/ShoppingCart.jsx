import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateId, getNextNumber } from '../utils/dataManager';

export default function ShoppingCart() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const cart = state.shoppingCart || [];

  const handleRemove = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) return;

    const reqId = generateId();
    const reqNumber = getNextNumber(state.requests, 'REQ');
    const now = new Date().toISOString();
    const ritmIds = [];

    const newItems = cart.map((cartItem, idx) => {
      const ritmId = generateId();
      ritmIds.push(ritmId);
      return {
        sys_id: ritmId,
        number: `RITM${String(state.requestedItems.length + idx + 1).padStart(7, '0')}`,
        request: reqId,
        cat_item: cartItem.item.sys_id,
        state: 'Open',
        assigned_to: null,
        assignment_group: '',
        quantity: cartItem.quantity,
        opened_at: now,
        updated_at: now,
        short_description: cartItem.item.name,
      };
    });

    const newRequest = {
      sys_id: reqId,
      number: reqNumber,
      requested_for: state.currentUser.sys_id,
      opened_at: now,
      opened_by: state.currentUser.sys_id,
      state: 'Open',
      stage: 'Requested',
      items: ritmIds,
      updated_at: now,
    };

    dispatch({ type: 'ADD_REQUEST', payload: newRequest });
    dispatch({ type: 'ADD_REQUESTED_ITEMS', payload: newItems });
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      sys_id: generateId(),
      type: 'state_change',
      target_table: 'sc_request',
      target_id: reqId,
      target_number: reqNumber,
      message: `${reqNumber} has been submitted`,
      created_at: now,
      read: false,
      actor: state.currentUser.sys_id,
    }});
    dispatch({ type: 'CLEAR_CART' });

    setOrderNumber(reqNumber);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="sn-page">
        <div className="sn-breadcrumb">
          <a onClick={() => navigate('/' + sp)}>Home</a>
          <span className="sn-breadcrumb-sep">&gt;</span>
          <a onClick={() => navigate('/catalog' + sp)}>Service Catalog</a>
          <span className="sn-breadcrumb-sep">&gt;</span>
          <span>Order Confirmation</span>
        </div>
        <div className="sn-page-body" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u2705'}</div>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>Order Submitted Successfully!</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>Your request <strong>{orderNumber}</strong> has been created and is being processed.</p>
          <button className="sn-btn sn-btn-primary" onClick={() => navigate('/catalog' + sp)}>Back to Catalog</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sn-page">
      <div className="sn-breadcrumb">
        <a onClick={() => navigate('/' + sp)}>Home</a>
        <span className="sn-breadcrumb-sep">&gt;</span>
        <a onClick={() => navigate('/catalog' + sp)}>Service Catalog</a>
        <span className="sn-breadcrumb-sep">&gt;</span>
        <span>Shopping Cart</span>
      </div>
      <div className="sn-page-body">
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Shopping Cart</h1>
        {cart.length === 0 ? (
          <div className="sn-cart-empty">
            <p>Your cart is empty.</p>
            <button className="sn-btn sn-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/catalog' + sp)}>Browse Catalog</button>
          </div>
        ) : (
          <div>
            <table className="sn-cart-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ width: 100 }}>Quantity</th>
                  <th style={{ width: 120 }}>Price</th>
                  <th style={{ width: 60 }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(c => (
                  <tr key={c.item.sys_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{c.item.picture}</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.item.name}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>{c.item.short_description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button className="sn-qty-btn" onClick={() => dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { itemId: c.item.sys_id, quantity: c.quantity - 1 } })} disabled={c.quantity <= 1}>-</button>
                        <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{c.quantity}</span>
                        <button className="sn-qty-btn" onClick={() => dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { itemId: c.item.sys_id, quantity: c.quantity + 1 } })}>+</button>
                      </div>
                    </td>
                    <td>{c.item.price}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="sn-btn-icon" onClick={() => handleRemove(c.item.sys_id)} style={{ color: '#d32f2f', fontSize: 16 }}>{'\u2715'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="sn-btn sn-btn-success" onClick={handleSubmitOrder}>Submit Order</button>
              <button className="sn-btn" onClick={() => dispatch({ type: 'CLEAR_CART' })}>Empty Cart</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
