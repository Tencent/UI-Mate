import React from 'react';
import { useApp } from '../context/AppContext';

export default function ProductCard({ product }) {
  const { state, dispatch, ACTION_TYPES } = useApp();
  const cartItem = state.cart.find(i => i.productId === product.id);
  const qty = cartItem ? cartItem.quantity : 0;
  const isFavorited = (state.favorites || []).includes(product.id);

  const openModal = () => dispatch({ type: ACTION_TYPES.OPEN_MODAL, payload: { type: 'product', data: product } });

  const addToCart = (e) => {
    e.stopPropagation();
    dispatch({ type: ACTION_TYPES.ADD_TO_CART, payload: { productId: product.id, storeId: product.storeId, quantity: 1 } });
  };

  const updateQty = (e, delta) => {
    e.stopPropagation();
    const newQty = qty + delta;
    if (newQty <= 0) dispatch({ type: ACTION_TYPES.REMOVE_FROM_CART, payload: product.id });
    else dispatch({ type: ACTION_TYPES.UPDATE_CART_ITEM, payload: { productId: product.id, quantity: newQty } });
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    if (isFavorited) {
      dispatch({ type: ACTION_TYPES.REMOVE_FAVORITE, payload: product.id });
    } else {
      dispatch({ type: ACTION_TYPES.ADD_FAVORITE, payload: product.id });
    }
  };

  return (
    <div className="product-card" onClick={openModal}>
      <div className="product-card-image" style={{ position: 'relative' }}>
        {product.isOnSale && <span className="sale-badge">Sale</span>}
        <button
          onClick={toggleFavorite}
          style={{
            position: 'absolute', top: 4, right: 4, background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 2, zIndex: 1,
            color: isFavorited ? '#e53e3e' : '#ccc',
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'
          }}
          title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
        >
          {isFavorited ? '♥' : '♡'}
        </button>
        <span>{product.emoji || '📦'}</span>
      </div>
      <div className="product-card-price">
        ${product.price.toFixed(2)}
        {product.originalPrice && <span className="original">${product.originalPrice.toFixed(2)}</span>}
      </div>
      <div className="product-card-name">{product.name}</div>
      <div className="product-card-unit">{product.unitSize}</div>
      <div className="product-card-action">
        {qty === 0 ? (
          <button className="add-btn" onClick={addToCart}>+ Add</button>
        ) : (
          <div className="qty-selector compact" style={{ width: '100%', justifyContent: 'space-between' }}>
            <button className="qty-btn" onClick={(e) => updateQty(e, -1)}>-</button>
            <span className="qty-value">{qty}</span>
            <button className="qty-btn" onClick={(e) => updateQty(e, 1)}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}
