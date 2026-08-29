import React from 'react';
import { Link } from 'react-router-dom';
import { Rating } from '../ui/Rating';
import { useStore } from '../../context/StoreContext';

export const ProductCard = ({ product, layout = 'grid' }) => {
  const { addToCart } = useStore();
  const hasOriginalPrice = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasOriginalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  // Compute delivery date
  const getDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (product.prime ? 1 : 3));
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (layout === 'list') {
    return (
      <div className="flex gap-4 border border-gray-200 rounded p-4 bg-white hover:shadow-md transition-shadow">
        <div className="w-[180px] h-[180px] shrink-0 bg-white flex items-center justify-center relative p-2">
          <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
          {product.badges && product.badges.includes('Best Seller') && (
            <span className="absolute top-0 left-0 bg-[#e47911] text-white text-[11px] font-bold px-1.5 py-0.5">Best Seller</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/product/${product.id}`} className="text-[15px] font-medium hover:text-xmazon-orange line-clamp-2 text-[#0066c0] leading-snug">
            {product.title}
          </Link>
          <div className="mt-1 mb-1.5">
            <Rating value={product.rating} count={product.reviewCount} />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[20px] font-normal text-[#0F1111]">
              <span className="text-[12px] align-top relative -top-[4px]">$</span>{Math.floor(product.price)}<span className="text-[12px] align-top relative -top-[4px]">{(product.price % 1).toFixed(2).substring(2)}</span>
            </span>
            {hasOriginalPrice && (
              <span className="text-[13px] text-[#565959] line-through">List: ${product.originalPrice.toFixed(2)}</span>
            )}
            {discountPct && <span className="text-[13px] text-[#cc0c39] font-medium">({discountPct}% off)</span>}
          </div>
          {product.prime && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[#00a8e1] font-bold italic text-[12px]">prime</span>
              <span className="text-[12px] text-[#565959]">FREE Delivery <strong className="text-[#0F1111]">{getDeliveryDate()}</strong></span>
            </div>
          )}
          {!product.prime && (
            <div className="text-[12px] text-[#565959] mt-0.5">
              FREE Delivery <strong className="text-[#0F1111]">{getDeliveryDate()}</strong>
            </div>
          )}
          {product.stockCount && product.stockCount <= 10 && (
            <div className="text-[12px] text-[#cc0c39] mt-1">Only {product.stockCount} left in stock - order soon.</div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="mt-2 bg-[#ffd814] hover:bg-[#f7ca00] text-[13px] py-1.5 px-4 rounded-full border border-[#fcd200] font-medium"
          >
            Add to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded p-3 flex flex-col h-full hover:shadow-lg transition-shadow relative group">
      {/* Badge */}
      {product.badges && product.badges.includes('Best Seller') && (
        <span className="absolute top-0 left-0 bg-[#e47911] text-white text-[10px] font-bold px-1.5 py-0.5 z-10 rounded-br">Best Seller</span>
      )}
      {product.badges && product.badges.includes("Xmazon's Choice") && !product.badges.includes('Best Seller') && (
        <span className="absolute top-0 left-0 bg-[#232f3e] text-white text-[10px] font-bold px-1.5 py-0.5 z-10 rounded-br">
          <span className="text-[#f5a623]">Xmazon's</span> <span>Choice</span>
        </span>
      )}

      <div className="h-[200px] bg-white flex items-center justify-center mb-3 p-2">
        <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
      </div>

      <Link to={`/product/${product.id}`} className="text-[13px] text-[#0F1111] hover:text-xmazon-orange line-clamp-2 mb-1 leading-snug">
        {product.title}
      </Link>

      <div className="mb-1">
        <Rating value={product.rating} count={product.reviewCount} />
      </div>

      <div className="mt-auto">
        {hasOriginalPrice && (
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[12px] text-[#cc0c39] font-bold">-{discountPct}%</span>
            <span className="text-[12px] text-[#565959] line-through">${product.originalPrice.toFixed(2)}</span>
          </div>
        )}
        <div className="flex items-baseline mb-0.5">
          <span className="text-[11px] align-top text-[#0F1111] relative -top-[3px]">$</span>
          <span className="text-[20px] text-[#0F1111]">{Math.floor(product.price)}</span>
          <span className="text-[11px] align-top text-[#0F1111] relative -top-[3px]">{(product.price % 1).toFixed(2).substring(2)}</span>
        </div>

        {product.prime && (
          <div className="mb-0.5 flex items-center gap-1">
            <span className="text-[#00a8e1] font-bold italic text-[11px]">prime</span>
            <span className="text-[11px] text-[#565959]">FREE Delivery</span>
          </div>
        )}

        {product.stockCount && product.stockCount <= 10 && (
          <div className="text-[11px] text-[#cc0c39] mb-1">Only {product.stockCount} left</div>
        )}

        <button
          onClick={(e) => { e.preventDefault(); addToCart(product); }}
          className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-[13px] py-1.5 rounded-full mt-1 border border-[#fcd200] font-medium"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};
