import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/dataManager';
import './CartPanel.css';

export default function CartPanel({ isOpen, onClose }) {
  const { state, removeFromCart, updateCartItemQuantity } = useApp();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const { items, restaurantId, restaurantName } = state.cart;
  const subtotal = items.reduce((s, item) => s + item.totalPrice, 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-panel animate-slideInRight" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-panel__header">
          <h2 className="cart-panel__title">Your cart</h2>
          <button className="cart-panel__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-panel__empty">
            <div className="cart-panel__empty-icon">
              <ShoppingBag size={40} />
            </div>
            <h3 className="cart-panel__empty-title">Your cart is empty</h3>
            <p className="cart-panel__empty-text">Add items from a restaurant to start your order</p>
            <button className="cart-panel__browse-btn" onClick={onClose}>
              Start browsing
            </button>
          </div>
        ) : (
          <>
            {/* Restaurant name */}
            {restaurantName && (
              <div className="cart-panel__restaurant">
                <span className="cart-panel__restaurant-label">From</span>
                <span className="cart-panel__restaurant-name">{restaurantName}</span>
              </div>
            )}

            {/* Items */}
            <div className="cart-panel__items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item__info">
                    <div className="cart-item__name">{item.name}</div>
                    {item.selectedOptions.length > 0 && (
                      <div className="cart-item__options">
                        {item.selectedOptions.map(o => o.optionName).join(', ')}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <div className="cart-item__instructions">"{item.specialInstructions}"</div>
                    )}
                  </div>
                  <div className="cart-item__right">
                    <div className="cart-item__price">{formatCurrency(item.totalPrice)}</div>
                    <div className="cart-item__qty-controls">
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                      >
                        {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                      </button>
                      <span className="cart-item__qty">{item.quantity}</span>
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="cart-panel__footer">
              <div className="cart-panel__subtotal">
                <span>Subtotal</span>
                <span className="cart-panel__subtotal-amount">{formatCurrency(subtotal)}</span>
              </div>
              <button className="cart-panel__checkout-btn" onClick={handleCheckout}>
                Go to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
