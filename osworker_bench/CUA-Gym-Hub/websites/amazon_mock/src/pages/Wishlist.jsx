import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { Rating } from '../components/ui/Rating';

export const Wishlist = () => {
  const { state, toggleWishlist, addToCart } = useStore();
  const [sortBy, setSortBy] = useState('newest');

  const wishlistItems = useMemo(() => {
    const items = state.wishlist
      .map((id, index) => ({ product: state.products.find(p => p.id === id), index }))
      .filter(item => item.product);

    return items.sort((a, b) => {
      if (sortBy === 'oldest') return a.index - b.index;
      if (sortBy === 'priceLow') return a.product.price - b.product.price;
      if (sortBy === 'priceHigh') return b.product.price - a.product.price;
      return b.index - a.index;
    }).map(item => item.product);
  }, [state.products, state.wishlist, sortBy]);

  const moveAllToCart = () => {
    wishlistItems.forEach(product => addToCart(product, 1));
    wishlistItems.forEach(product => toggleWishlist(product.id));
  };

  return (
    <div className="max-w-[1500px] mx-auto p-4">
      <div className="border-b pb-4 mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              <Link to="/" className="text-xmazon-blue hover:underline">Xmazon.mock</Link>
              <span className="mx-1">›</span>
              <span>Your Lists</span>
            </div>
            <h1 className="text-2xl font-medium">Your Wish List</h1>
            <span className="text-gray-500 text-sm">{wishlistItems.length} items</span>
          </div>
          {wishlistItems.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <label className="text-sm text-gray-600">
                Sort by{' '}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="border rounded px-2 py-1 bg-white focus:outline-none focus:border-xmazon-orange"
                >
                  <option value="newest">Date added (newest)</option>
                  <option value="oldest">Date added (oldest)</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </label>
              <Button onClick={moveAllToCart} className="text-sm whitespace-nowrap">Move all to Cart</Button>
            </div>
          )}
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white p-8 border rounded text-center">
          <p className="mb-4">Your wish list is empty.</p>
          <Link to="/" className="text-xmazon-blue hover:underline">Explore items</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map(product => (
            <div key={product.id} className="bg-white border rounded p-4 flex flex-col relative">
              <button 
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                title="Remove from wishlist"
              >
                ✕
              </button>
              
              <div className="h-48 flex items-center justify-center mb-4">
                <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
              </div>

              <Link to={`/product/${product.id}`} className="font-medium hover:text-xmazon-darkYellow hover:underline line-clamp-2 mb-2">
                {product.title}
              </Link>

              <div className="mb-2">
                <Rating value={product.rating} count={product.reviewCount} />
              </div>

              <div className="font-bold text-lg mb-4">
                ${product.price.toFixed(2)}
              </div>

              <div className="mt-auto space-y-2">
                <Button 
                  onClick={() => addToCart(product)}
                  className="w-full text-sm"
                >
                  Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => toggleWishlist(product.id)}
                  className="w-full text-sm"
                >
                  Remove from list
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
