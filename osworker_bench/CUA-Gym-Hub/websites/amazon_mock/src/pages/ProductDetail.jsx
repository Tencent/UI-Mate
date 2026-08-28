import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Rating } from '../components/ui/Rating';
import { Button } from '../components/ui/Button';
import { MapPin, User, ZoomIn, Star } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, addToCart, addToRecentlyViewed, toggleWishlist, addReview, voteHelpful } = useStore();
  const [qty, setQty] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', content: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [votedReviews, setVotedReviews] = useState(new Set());
  const reviewsRef = useRef(null);

  const product = state.products.find(p => p.id === id);
  const inWishlist = state.wishlist.includes(id);

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product.id);
    }
    setSelectedImageIdx(0);
    setVotedReviews(new Set());
  }, [id]);

  useEffect(() => {
    if (location.hash === '#reviews' && reviewsRef.current) {
      setTimeout(() => {
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [location.hash, id]);

  if (!product) return <div className="p-8">Product not found</div>;

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const currentImage = images[selectedImageIdx] || images[0];

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/checkout');
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReview.title.trim()) { setReviewError('Please enter a review headline.'); return; }
    if (!newReview.content.trim() || newReview.content.trim().length < 10) { setReviewError('Review must be at least 10 characters.'); return; }
    setReviewError('');
    addReview({
      productId: product.id,
      userId: state.user.id,
      userName: state.user.name,
      verifiedPurchase: true,
      ...newReview
    });
    setNewReview({ rating: 5, title: '', content: '' });
    setShowReviewForm(false);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleScrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const productReviews = state.reviews.filter(r => r.productId === product.id);
  const relatedProducts = state.products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 6);

  // Rating histogram: blend seed review count with actual submitted reviews
  // Use actual product reviewCount for realistic percentages, but bias from available reviews
  const totalReviewCount = product.reviewCount;
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: productReviews.filter(r => Math.round(r.rating) === star).length
  }));
  const totalActualReviews = productReviews.length;

  // Compute histogram percentages: if we have actual reviews use them, else derive from product.rating
  const getHistogramPct = (star) => {
    if (totalActualReviews >= 3) {
      const count = ratingCounts.find(r => r.star === star)?.count || 0;
      return Math.round((count / totalActualReviews) * 100);
    }
    // Derive approximate histogram from avg rating (typical distribution)
    const avg = product.rating;
    const basePcts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (avg >= 4.5) { basePcts[5] = 72; basePcts[4] = 18; basePcts[3] = 6; basePcts[2] = 2; basePcts[1] = 2; }
    else if (avg >= 4.0) { basePcts[5] = 55; basePcts[4] = 25; basePcts[3] = 12; basePcts[2] = 5; basePcts[1] = 3; }
    else if (avg >= 3.5) { basePcts[5] = 35; basePcts[4] = 30; basePcts[3] = 20; basePcts[2] = 10; basePcts[1] = 5; }
    else { basePcts[5] = 20; basePcts[4] = 20; basePcts[3] = 25; basePcts[2] = 20; basePcts[1] = 15; }
    return basePcts[star] || 0;
  };

  // Deal pricing
  const hasOriginalPrice = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasOriginalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  // Frequently bought together — 2 random related products
  const fbtProducts = relatedProducts.slice(0, 2);
  const fbtAll = [product, ...fbtProducts];
  const fbtTotal = fbtAll.reduce((sum, p) => sum + p.price, 0);

  // Compute delivery date: next weekday + 1 if prime, else + 3
  const getDeliveryDate = () => {
    const d = new Date();
    const daysToAdd = product.prime ? 1 : 3;
    d.setDate(d.getDate() + daysToAdd);
    // Skip weekends
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };
  const deliveryDate = getDeliveryDate();

  // Interactive star rating component
  const StarRatingInput = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(0);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              size={24}
              className={`transition-colors ${(hovered || value) >= star ? 'text-xmazon-yellow fill-xmazon-yellow' : 'text-gray-300'}`}
            />
          </button>
        ))}
        <span className="text-sm text-gray-600 ml-1">
          {hovered > 0 ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hovered] : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-[1500px] mx-auto bg-[#eaeded]">
      {/* Breadcrumb */}
      <div className="text-[12px] text-[#007185] px-4 pt-3 pb-1">
        <Link to="/" className="hover:underline hover:text-[#c7511f]">Xmazon.mock</Link>
        <span className="text-[#565959] mx-1">›</span>
        <Link to={`/search?category=${encodeURIComponent(product.category)}`} className="hover:underline hover:text-[#c7511f]">{product.category}</Link>
        <span className="text-[#565959] mx-1">›</span>
        <span className="text-[#565959] line-clamp-1">{product.title}</span>
      </div>

      <div className="bg-white p-4 mt-1">
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Image Gallery */}
          <div className="w-full md:w-[380px] flex-shrink-0">
            <div className="flex gap-2">
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex flex-col gap-2 w-12 flex-shrink-0">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`w-11 h-11 border-2 rounded cursor-pointer overflow-hidden flex-shrink-0 ${selectedImageIdx === idx ? 'border-xmazon-orange' : 'border-gray-200 hover:border-xmazon-blue'}`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div
                className="flex-1 border rounded p-2 flex items-center justify-center relative overflow-hidden cursor-crosshair"
                style={{ minHeight: 400 }}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={currentImage}
                  alt={product.title}
                  className={`max-w-full max-h-[400px] object-contain transition-transform duration-150 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                  style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
                />
                {!isZoomed && (
                  <div className="absolute bottom-3 right-3 bg-white/80 px-2 py-1 rounded text-gray-500 text-xs flex items-center gap-1 pointer-events-none border">
                    <ZoomIn size={12} /> Hover to zoom
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            {product.badges && product.badges.length > 0 && (
              <div className="flex gap-2 mb-2">
                {product.badges.map(badge => (
                  <span key={badge} className={`text-xs font-bold px-2 py-0.5 rounded ${badge === 'Best Seller' ? 'bg-xmazon-orange text-white' : 'bg-xmazon-blue text-white'}`}>
                    {badge === "Xmazon's Choice" ? "Xmazon's Choice" : badge}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-xl font-medium text-gray-900 mb-2 leading-snug">{product.title}</h1>

            <div className="flex items-center gap-2 mb-3 pb-3 border-b">
              <Rating value={product.rating} count={product.reviewCount} onCountClick={handleScrollToReviews} />
              <span className="text-xs text-gray-500">|</span>
              <button
                onClick={handleScrollToReviews}
                className="text-xs text-xmazon-blue hover:underline cursor-pointer"
              >
                {product.reviewCount.toLocaleString()} ratings
              </button>
            </div>

            {/* Price */}
            <div className="mb-4">
              {hasOriginalPrice && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#cc0c39] text-white text-[12px] font-bold px-1.5 py-0.5 rounded-sm">Limited time deal</span>
                </div>
              )}
              <div className="flex items-baseline gap-2">
                {hasOriginalPrice && (
                  <span className="text-[24px] text-[#cc0c39] font-medium">-{discountPct}%</span>
                )}
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[13px] align-top relative -top-[6px] text-[#0F1111]">$</span>
                  <span className="text-[28px] font-light text-[#0F1111]">{Math.floor(product.price)}</span>
                  <span className="text-[13px] align-top relative -top-[6px] text-[#0F1111]">{(product.price % 1).toFixed(2).substring(2)}</span>
                </div>
              </div>
              {hasOriginalPrice && (
                <div className="text-[13px] text-[#565959]">
                  List Price: <span className="line-through">${product.originalPrice.toFixed(2)}</span>
                </div>
              )}
              {product.prime && (
                <div className="text-[13px] flex items-center gap-1 mt-1">
                  <span className="font-bold italic text-[#00a8e1]">prime</span>
                  <span className="text-[#565959]">FREE Returns</span>
                </div>
              )}
              <div className="text-[13px] text-[#565959] mt-0.5">
                FREE delivery <strong className="text-[#0F1111]">{deliveryDate}</strong>
              </div>
            </div>

            {/* About this item */}
            {product.bulletPoints && product.bulletPoints.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold mb-2 text-sm">About this item</h3>
                <ul className="list-disc pl-5 text-sm space-y-1.5 text-gray-800">
                  {product.bulletPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {product.description && (
              <p className="text-sm text-gray-700 mb-4">{product.description}</p>
            )}
          </div>

          {/* Buy Box */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="border rounded-lg p-4 shadow-sm">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-sm align-top mt-1">$</span>
                <span className="text-2xl font-medium text-red-700">{Math.floor(product.price)}</span>
                <span className="text-sm align-top mt-1 text-red-700">{(product.price % 1).toFixed(2).substring(2)}</span>
              </div>

              <div className="text-sm text-xmazon-blue mb-3">
                FREE delivery{' '}
                <span className="font-bold text-black">{deliveryDate}</span>.
                <div className="flex items-center gap-1 mt-1 text-xs text-black">
                  <MapPin size={12} /> Deliver to {state.user.address.city} {state.user.address.zip}
                </div>
              </div>

              {product.inStock !== false ? (
                <div className="text-sm text-green-700 font-medium mb-1">In Stock</div>
              ) : (
                <div className="text-sm text-red-600 font-medium mb-1">Currently unavailable</div>
              )}
              {product.stockCount && product.stockCount <= 10 && product.inStock !== false && (
                <div className="text-sm text-orange-600 font-medium mb-2">
                  Only {product.stockCount} left in stock - order soon
                </div>
              )}

              {product.inStock !== false && (
                <>
                  <select
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full mb-3 p-1 border rounded bg-gray-50 shadow-sm text-sm"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>Qty: {n}</option>)}
                  </select>

                  <Button className="w-full mb-2 text-sm" onClick={() => addToCart(product, qty)}>Add to Cart</Button>
                  <Button variant="orange" className="w-full mb-4 text-sm" onClick={handleBuyNow}>Buy Now</Button>
                </>
              )}

              <div className="text-xs text-gray-500 space-y-1 mb-4">
                <div className="flex justify-between"><span>Ships from</span> <span>Xmazon</span></div>
                <div className="flex justify-between"><span>Sold by</span> <span>{product.seller || product.brand}</span></div>
              </div>

              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-full text-left text-sm text-xmazon-blue hover:text-xmazon-darkYellow hover:underline border-t pt-2"
              >
                {inWishlist ? '♥ Remove from List' : '♡ Add to List'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Specifications Table */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="bg-white mt-2 p-6">
          <h2 className="text-xl font-bold mb-4">Product information</h2>
          <div className="max-w-2xl">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {Object.entries(product.specs).map(([key, val], idx) => (
                  <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-4 font-bold text-gray-700 w-48">{key}</td>
                    <td className="py-2 px-4 text-gray-800">{val}</td>
                  </tr>
                ))}
                <tr className={Object.keys(product.specs).length % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 font-bold text-gray-700 w-48">ASIN</td>
                  <td className="py-2 px-4 text-gray-800 font-mono text-xs">{product.id.toUpperCase()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Frequently Bought Together */}
      {fbtProducts.length > 0 && (
        <div className="bg-white mt-2 p-6">
          <h2 className="text-xl font-bold mb-4">Frequently bought together</h2>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {fbtAll.map((p, idx) => (
              <React.Fragment key={p.id}>
                <div className="flex flex-col items-center text-center w-32">
                  <Link to={`/product/${p.id}`}>
                    <img src={p.image} alt={p.title} className="w-20 h-20 object-contain mb-1" />
                  </Link>
                  <Link to={`/product/${p.id}`} className="text-xs text-xmazon-blue hover:underline line-clamp-2">{p.title}</Link>
                  <span className="text-sm font-bold mt-1">${p.price.toFixed(2)}</span>
                  {p.id === product.id && <span className="text-xs text-gray-500">(This item)</span>}
                </div>
                {idx < fbtAll.length - 1 && <span className="text-2xl font-bold text-gray-400">+</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Total price: <strong>${fbtTotal.toFixed(2)}</strong></span>
            <button
              onClick={() => fbtAll.forEach(p => addToCart(p, 1))}
              className="bg-xmazon-yellow hover:bg-xmazon-darkYellow text-sm font-bold px-4 py-2 rounded-full border border-gray-300"
            >
              Add all 3 to Cart
            </button>
          </div>
        </div>
      )}

      {/* Customers who viewed this also viewed */}
      {relatedProducts.length > 0 && (
        <div className="bg-white mt-2 p-6">
          <h2 className="text-xl font-bold mb-4">Customers who viewed this item also viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {relatedProducts.map(p => (
              <div key={p.id} className="flex-shrink-0 w-36 text-center">
                <Link to={`/product/${p.id}`}>
                  <img src={p.image} alt={p.title} className="w-full h-36 object-contain mb-2" />
                  <div className="text-xs text-xmazon-blue hover:underline line-clamp-2 mb-1">{p.title}</div>
                </Link>
                <Rating value={p.rating} size={10} />
                <div className="text-sm font-bold">${p.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="bg-white mt-2 p-6" ref={reviewsRef}>
        <h2 className="text-xl font-bold mb-6">Customer reviews</h2>
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left column */}
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Rating value={product.rating} size={20} />
              <span className="text-lg font-medium">{product.rating} out of 5</span>
            </div>
            <div className="text-sm text-gray-500 mb-4">{totalReviewCount.toLocaleString()} global ratings</div>

            {/* Rating Histogram */}
            <div className="space-y-1.5 mb-6">
              {[5, 4, 3, 2, 1].map(star => {
                const pct = getHistogramPct(star);
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <button
                      onClick={handleScrollToReviews}
                      className="w-8 text-right text-xmazon-blue hover:underline"
                    >
                      {star} star
                    </button>
                    <div className="flex-1 h-3 bg-gray-200 rounded overflow-hidden">
                      <div className="h-full bg-xmazon-yellow rounded" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-7 text-xmazon-blue">{pct}%</span>
                  </div>
                );
              })}
            </div>

            <h3 className="font-bold mb-2 text-sm">Review this product</h3>
            <p className="text-xs text-gray-600 mb-3">Share your thoughts with other customers</p>
            <Button variant="secondary" className="w-full text-sm" onClick={() => setShowReviewForm(!showReviewForm)}>
              Write a customer review
            </Button>
          </div>

          {/* Right column - reviews */}
          <div className="flex-1">
            {showReviewForm && (
              <div className="bg-gray-50 p-6 rounded mb-8 border">
                <h3 className="font-bold mb-4">Write a review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Overall rating</label>
                    <StarRatingInput
                      value={newReview.rating}
                      onChange={r => setNewReview({...newReview, rating: r})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Headline</label>
                    <input
                      type="text"
                      required
                      value={newReview.title}
                      onChange={e => setNewReview({...newReview, title: e.target.value})}
                      className="w-full p-2 border rounded text-sm focus:outline-none focus:border-xmazon-orange"
                      placeholder="What's most important to know?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Review</label>
                    <textarea
                      required
                      value={newReview.content}
                      onChange={e => setNewReview({...newReview, content: e.target.value})}
                      className="w-full p-2 border rounded h-28 text-sm focus:outline-none focus:border-xmazon-orange"
                      placeholder="What did you like or dislike? (min 10 characters)"
                    />
                    <div className="text-xs text-gray-500 mt-1">{newReview.content.length} characters</div>
                  </div>
                  {reviewError && <div className="text-red-600 text-sm">{reviewError}</div>}
                  <Button type="submit">Submit Review</Button>
                </form>
              </div>
            )}

            <h3 className="font-bold text-base mb-4">Top reviews from the United States</h3>
            {productReviews.length > 0 ? (
              <div className="space-y-6">
                {productReviews.map((review) => {
                  const helpfulCount = review.helpful || 0;
                  return (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User size={16} />
                        </div>
                        <span className="text-sm font-medium">{review.userName || 'Xmazon Customer'}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Rating value={review.rating} size={14} />
                        <span className="font-bold text-sm">{review.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>Reviewed on {new Date(review.date || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        {review.verifiedPurchase && (
                          <span className="text-orange-600 font-medium">Verified Purchase</span>
                        )}
                      </div>
                      <p className="text-sm mb-3">{review.content}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        {(helpfulCount > 0 || votedReviews.has(review.id)) && (
                          <span>{helpfulCount} {helpfulCount === 1 ? 'person' : 'people'} found this helpful</span>
                        )}
                        {votedReviews.has(review.id) ? (
                          <button
                            disabled
                            className="border rounded px-3 py-1 text-xs text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed"
                          >
                            You found this helpful
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              voteHelpful(review.id);
                              setVotedReviews(prev => new Set([...prev, review.id]));
                            }}
                            className="border rounded px-3 py-1 text-xs text-gray-700 border-gray-400 hover:bg-gray-100 cursor-pointer"
                          >
                            Helpful
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
