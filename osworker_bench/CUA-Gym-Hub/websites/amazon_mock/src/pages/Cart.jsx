import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { Tag } from 'lucide-react';

export const Cart = () => {
  const { state, updateCartQty, removeFromCart, saveForLater, moveToCart, removeSavedItem, addToCart } = useStore();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  const subtotal = state.cart.reduce((acc, item) => {
    const product = state.products.find(p => p.id === item.productId);
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);

  const discount = appliedPromo ? subtotal * 0.10 : 0;
  const finalSubtotal = subtotal - discount;
  const totalItems = state.cart.reduce((acc, item) => acc + item.quantity, 0);
  const savedItems = state.savedForLater || [];

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'SAVE10') {
      setAppliedPromo('SAVE10');
      setPromoError('');
    } else {
      setAppliedPromo(null);
      setPromoError('Invalid promo code');
    }
  };

  // Recommended products from cart categories
  const cartCategories = [...new Set(state.cart.map(item => {
    const p = state.products.find(pr => pr.id === item.productId);
    return p ? p.category : null;
  }).filter(Boolean))];
  const cartProductIds = new Set(state.cart.map(i => i.productId));
  const recommendedProducts = state.products
    .filter(p => cartCategories.includes(p.category) && !cartProductIds.has(p.id))
    .slice(0, 6);

  return (
    <div className="bg-xmazon-bg min-h-screen">
      <div className="max-w-[1500px] mx-auto p-4 flex flex-col md:flex-row gap-6">
        {/* Main Cart Area */}
        <div className="flex-1">
          <div className="bg-white p-6 mb-4">
            <h1 className="text-2xl font-medium border-b pb-4 mb-4">Shopping Cart</h1>

            {state.cart.length === 0 ? (
              <div className="py-8 text-center">
                <div className="text-4xl mb-4">🛒</div>
                <h2 className="text-2xl font-medium mb-2">Your Xmazon Cart is empty</h2>
                <p className="text-sm text-gray-600 mb-4">Your shopping cart lives here. Add items you want to purchase.</p>
                <Link to="/" className="text-xmazon-blue hover:underline text-sm font-bold">Shop today's deals</Link>
              </div>
            ) : (
              <>
                {state.cart.map(item => {
                  const product = state.products.find(p => p.id === item.productId);
                  if (!product) return null;

                  return (
                    <div key={item.productId} className="flex gap-4 border-b py-4 last:border-0">
                      <Link to={`/product/${product.id}`}>
                        <img src={product.image} alt={product.title} className="w-32 h-32 object-contain" />
                      </Link>
                      <div className="flex-1">
                        <Link to={`/product/${product.id}`} className="text-base font-medium hover:text-xmazon-darkYellow hover:underline line-clamp-2 text-xmazon-blue">
                          {product.title}
                        </Link>
                        <div className={`text-sm my-1 ${product.inStock !== false ? 'text-green-700' : 'text-red-600'}`}>
                          {product.inStock !== false ? 'In Stock' : 'Currently Unavailable'}
                        </div>
                        {product.prime && <div className="text-[#00a8e1] font-bold italic text-xs mb-2">prime</div>}

                        <div className="flex items-center gap-4 text-sm mt-2">
                          <select
                            value={item.quantity}
                            onChange={(e) => updateCartQty(item.productId, Number(e.target.value))}
                            className="p-1 border rounded bg-gray-50 shadow-sm text-sm"
                          >
                            {[...Array(10)].map((_, i) => (
                              <option key={i+1} value={i+1}>Qty: {i+1}</option>
                            ))}
                          </select>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => removeFromCart(item.productId)} className="text-xmazon-blue hover:underline text-xs">Delete</button>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => saveForLater(item.productId)} className="text-xmazon-blue hover:underline text-xs">Save for later</button>
                        </div>
                      </div>
                      <div className="text-right font-bold text-base">
                        ${(product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}

                <div className="text-right text-base mt-4">
                  Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'}): <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Saved for Later Section */}
          {savedItems.length > 0 && (
            <div className="bg-white p-6 mb-4">
              <h2 className="text-xl font-bold mb-4">Saved for later ({savedItems.length} {savedItems.length === 1 ? 'item' : 'items'})</h2>
              <div className="space-y-4">
                {savedItems.map(item => {
                  const product = state.products.find(p => p.id === item.productId);
                  if (!product) return null;

                  return (
                    <div key={item.productId} className="flex gap-4 border-b pb-4 last:border-0">
                      <Link to={`/product/${product.id}`}>
                        <img src={product.image} alt={product.title} className="w-24 h-24 object-contain" />
                      </Link>
                      <div className="flex-1">
                        <Link to={`/product/${product.id}`} className="font-medium hover:text-xmazon-darkYellow hover:underline line-clamp-2 text-xmazon-blue text-sm">
                          {product.title}
                        </Link>
                        <div className="text-red-700 font-bold text-sm my-1">${product.price.toFixed(2)}</div>
                        <div className={`text-xs mb-2 ${product.inStock !== false ? 'text-green-700' : 'text-red-600'}`}>
                          {product.inStock !== false ? 'In Stock' : 'Currently Unavailable'}
                        </div>

                        <div className="flex gap-4 text-xs">
                          <button onClick={() => moveToCart(item.productId)} className="text-xmazon-blue hover:underline">Move to Cart</button>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => removeSavedItem(item.productId)} className="text-xmazon-blue hover:underline">Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customers who bought items in your cart also bought */}
          {recommendedProducts.length > 0 && state.cart.length > 0 && (
            <div className="bg-white p-6">
              <h2 className="text-base font-bold mb-4">Customers who bought items in your cart also bought</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {recommendedProducts.map(p => (
                  <div key={p.id} className="flex-shrink-0 w-36 text-center">
                    <Link to={`/product/${p.id}`}>
                      <img src={p.image} alt={p.title} className="w-full h-32 object-contain mb-2" />
                      <div className="text-xs text-xmazon-blue hover:underline line-clamp-2 mb-1">{p.title}</div>
                    </Link>
                    <div className="text-sm font-bold">${p.price.toFixed(2)}</div>
                    <button
                      onClick={() => addToCart(p)}
                      className="mt-1 w-full bg-xmazon-yellow hover:bg-xmazon-darkYellow text-xs py-1 rounded-full border border-gray-300"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Checkout Sidebar */}
        {state.cart.length > 0 && (
          <div className="w-full md:w-80">
            <div className="bg-white p-4 shadow-sm sticky top-4">
              {appliedPromo && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-2 rounded mb-3 flex items-center gap-1">
                  <Tag size={14} />
                  <span>Promo code applied: <strong>10% off</strong></span>
                </div>
              )}
              <div className="text-base mb-1">
                Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'}): <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              {appliedPromo && (
                <div className="text-sm text-green-700 mb-1">
                  Promo discount: -<span className="font-bold">${discount.toFixed(2)}</span>
                </div>
              )}
              {appliedPromo && (
                <div className="text-base font-bold mb-3">
                  Total: ${finalSubtotal.toFixed(2)}
                </div>
              )}
              <Button
                className="w-full mb-4"
                onClick={() => navigate('/checkout')}
              >
                Proceed to checkout
              </Button>

              {/* Promo code section */}
              <div className="border-t pt-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
                    placeholder="Enter promo code"
                    className="flex-1 border rounded px-2 py-1.5 text-sm focus:outline-none focus:border-xmazon-orange"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-gray-100 hover:bg-gray-200 border rounded px-3 py-1.5 text-sm font-medium"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <div className="text-red-600 text-xs mt-1">{promoError}</div>}
                {appliedPromo && (
                  <div className="text-green-700 text-xs mt-1">Promo code applied: 10% off</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
