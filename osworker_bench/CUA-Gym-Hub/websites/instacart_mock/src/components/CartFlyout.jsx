import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CartFlyout() {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const navigate = useNavigate();
  const isOpen = state.cartOpen;

  const store = state.stores.find(s => s.id === state.selectedStoreId);
  const subtotal = state.cart.reduce((sum, item) => {
    const p = state.products.find(pr => pr.id === item.productId);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);
  const deliveryFee = (state.user.instacartPlus || subtotal >= 35) ? 0 : (store?.deliveryFee || 3.99);
  const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
  const tax = Math.round(subtotal * 0.0875 * 100) / 100;
  const total = subtotal + deliveryFee + serviceFee + tax;

  const close = () => dispatch({ type: ACTION_TYPES.TOGGLE_CART, payload: false });

  const handleCheckout = () => {
    close();
    navigate('/checkout');
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={close} />
      <div className={`cart-flyout ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div>
            <h2>Your Cart</h2>
            {store && <div className="store-name">{store.name}</div>}
          </div>
          <button className="cart-close-btn" onClick={close}>&#x2715;</button>
        </div>

        {state.cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">&#x1F6D2;</div>
            <h3>Your cart is empty</h3>
            <p>Start shopping to add items</p>
            <button className="btn-primary sm" onClick={() => { close(); navigate('/'); }}>Start Shopping</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {state.cart.map(item => {
                const product = state.products.find(p => p.id === item.productId);
                if (!product) return null;
                return (
                  <div key={item.productId} className="cart-item">
                    <div className="cart-item-image">{product.emoji || '📦'}</div>
                    <div className="cart-item-info">
                      <div className="cart-item-name">{product.name}</div>
                      <div className="cart-item-unit">{product.unitSize}</div>
                      <div className="cart-item-row">
                        <div className="qty-selector compact">
                          <button className="qty-btn" onClick={() => {
                            if (item.quantity <= 1) dispatch({ type: ACTION_TYPES.REMOVE_FROM_CART, payload: item.productId });
                            else dispatch({ type: ACTION_TYPES.UPDATE_CART_ITEM, payload: { productId: item.productId, quantity: item.quantity - 1 } });
                          }}>-</button>
                          <span className="qty-value">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => dispatch({ type: ACTION_TYPES.UPDATE_CART_ITEM, payload: { productId: item.productId, quantity: item.quantity + 1 } })}>+</button>
                        </div>
                        <span className="cart-item-price">${(product.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="cart-item-controls">
                        <label>
                          Replacement
                          <select
                            value={item.replacementPreference || 'best_match'}
                            onChange={e => dispatch({ type: ACTION_TYPES.UPDATE_REPLACEMENT, payload: { productId: item.productId, replacementPreference: e.target.value } })}
                          >
                            <option value="best_match">Best match</option>
                            <option value="refund">Refund item</option>
                            <option value="pick_specific">Pick specific</option>
                          </select>
                        </label>
                        <label>
                          Note
                          <textarea
                            rows={2}
                            placeholder="Add note for shopper"
                            value={item.note || ''}
                            onChange={e => dispatch({ type: ACTION_TYPES.UPDATE_CART_NOTE, payload: { productId: item.productId, note: e.target.value } })}
                          />
                        </label>
                      </div>
                    </div>
                    <button className="cart-item-remove" onClick={() => dispatch({ type: ACTION_TYPES.REMOVE_FROM_CART, payload: item.productId })}>&#x1F5D1;</button>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              {store && subtotal < store.minOrder && (
                <div className="cart-min-warning">
                  &#x26A0;&#xFE0F; Add ${(store.minOrder - subtotal).toFixed(2)} more to meet the ${store.minOrder} minimum
                </div>
              )}
              <div className="cart-summary-row">
                <span className="label">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span className="label">Delivery</span>
                {deliveryFee === 0 ? <span className="free">Free</span> : <span>${deliveryFee.toFixed(2)}</span>}
              </div>
              <div className="cart-summary-row">
                <span className="label">Service Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span className="label">Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row total">
                <span>Estimated Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button className="btn-primary" onClick={handleCheckout} disabled={store && subtotal < store.minOrder}>
                Go to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
