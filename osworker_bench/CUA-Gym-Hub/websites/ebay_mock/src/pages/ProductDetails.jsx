import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Heart, Share2, ShieldCheck, Truck, RotateCcw, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, placeBid, buyNow, toggleWatchlist, sendMessage, incrementViews } = useStore();
  const listing = state.listings.find(l => l.id === id);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Increment views on mount
  useEffect(() => {
    if (listing) {
      incrementViews(listing.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Reset selected image when listing changes
  useEffect(() => {
    setSelectedImage(0);
  }, [id]);

  // Timer Effect
  useEffect(() => {
    if (!listing) return;
    const updateTimer = () => {
      if (listing.endTime < Date.now()) {
        setTimeLeft('Ended');
      } else {
        setTimeLeft(formatDistanceToNow(listing.endTime));
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [listing]);

  if (!listing) return <div className="p-8">Listing not found</div>;

  const seller = state.users.find(u => u.id === listing.sellerId);
  const isAuction = listing.type === 'auction';
  const isWatched = listing.watchers.includes(state.currentUser.id);
  const isEnded = listing.status !== 'active' || listing.endTime < Date.now();
  const isSeller = listing.sellerId === state.currentUser.id;

  // Rating: derive from feedbacks if available
  const sellerFeedbacks = state.feedbacks?.filter(f => f.toUserId === listing.sellerId) || [];
  const positiveFeedbacks = sellerFeedbacks.filter(f => f.rating === 'positive').length;
  const reviewCount = sellerFeedbacks.length;
  const starRating = reviewCount > 0
    ? Math.round((positiveFeedbacks / reviewCount) * 5)
    : 5;
  const displayStars = '★'.repeat(starRating) + '☆'.repeat(5 - starRating);

  // Calculate minimum bid
  const minBid = listing.bids.length === 0 ? listing.startingBid : listing.currentBid + 1;

  const handleBid = (e) => {
    e.preventDefault();
    if (isSeller) {
      setError("You cannot bid on your own listing.");
      return;
    }
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minBid) {
      setError(`Bid must be at least $${minBid.toFixed(2)}`);
      return;
    }
    placeBid(listing.id, amount);
    setBidAmount('');
    setError('');
  };

  const handleBuyNow = () => {
    if (isSeller) return;
    setShowBuyConfirm(true);
  };

  const confirmBuyNow = () => {
    setShowBuyConfirm(false);
    buyNow(listing.id);
    navigate('/dashboard');
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }).catch(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      });
    } else {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleContactSeller = () => {
    setContactSubject(`Question about: ${listing.title}`);
    setContactMessage('');
    setMessageSent(false);
    setShowContactModal(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!contactMessage.trim() || !contactSubject.trim()) return;
    sendMessage(listing.sellerId, listing.id, contactSubject, contactMessage);
    setMessageSent(true);
    setTimeout(() => setShowContactModal(false), 1500);
  };

  const handleSeeOtherItems = () => {
    navigate(`/search?seller=${listing.sellerId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Left: Images */}
          <div className="md:col-span-5">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-200">
              <img
                src={listing.images[selectedImage] || listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-contain"
              />
            </div>
            {listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {listing.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square bg-gray-100 rounded border overflow-hidden cursor-pointer transition-colors ${selectedImage === i ? 'border-xbay-blue border-2' : 'border-gray-200 hover:border-xbay-blue'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Middle: Details & Buying */}
          <div className="md:col-span-4 border-r border-gray-200 pr-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>

            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center text-yellow-500">
                {displayStars}
                <span className="text-gray-500 ml-1">({reviewCount > 0 ? reviewCount : 'No reviews yet'})</span>
              </div>
              <div className="text-gray-300">|</div>
              <div className="text-gray-600">Condition: <span className="font-bold text-gray-900">{listing.condition}</span></div>
            </div>

            <hr className="my-4 border-gray-200" />

            {isEnded ? (
              <div className="bg-gray-100 p-4 rounded-lg mb-6 text-center">
                <h3 className="text-xl font-bold text-gray-700">This listing has ended.</h3>
                {listing.status === 'sold' && <p className="text-green-600 font-bold mt-2">SOLD</p>}
                {listing.status === 'ended' && <p className="text-red-600 font-bold mt-2">ENDED BY SELLER</p>}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                {isAuction && (
                  <div className="mb-6">
                    <div className="text-sm text-gray-600 mb-1">Current Bid:</div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-gray-900">${listing.currentBid.toFixed(2)}</span>
                      <button
                        onClick={() => setShowBidHistory(!showBidHistory)}
                        className="text-sm text-xbay-blue hover:underline flex items-center gap-1"
                      >
                        [{listing.bids.length} bids]
                        {showBidHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {/* Bid History Panel */}
                    {showBidHistory && listing.bids.length > 0 && (
                      <div className="mb-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="text-xs font-bold text-gray-600 p-2 bg-gray-50 border-b border-gray-200">Bid History</div>
                        <div className="max-h-48 overflow-y-auto">
                          {listing.bids.map((bid, i) => {
                            const bidder = state.users.find(u => u.id === bid.userId);
                            return (
                              <div key={bid.id} className="flex justify-between items-center px-3 py-2 border-b border-gray-100 last:border-0 text-sm">
                                <span className="font-medium text-gray-800">{bidder?.username || bid.userId}</span>
                                <span className="text-gray-500 text-xs">{new Date(bid.timestamp).toLocaleString()}</span>
                                <span className="font-bold text-gray-900">${bid.amount.toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {isSeller ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800 mb-2">
                        This is your listing. You cannot bid on your own items.
                      </div>
                    ) : (
                      <form onSubmit={handleBid} className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min={minBid}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-2"
                            placeholder={`Max bid (min $${minBid.toFixed(2)})`}
                          />
                          <button type="submit" className="bg-xbay-blue text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
                            Place Bid
                          </button>
                        </div>
                        {error && <p className="text-red-500 text-xs">{error}</p>}
                        <p className="text-xs text-gray-500">
                          Enter your maximum bid. We'll bid for you, just enough to keep you in the lead.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Time left: <span className="font-bold text-red-600">{timeLeft}</span></p>
                      </form>
                    )}
                  </div>
                )}

                {(listing.buyItNowPrice || !isAuction) && !isSeller && (
                  <div>
                    {isAuction && <div className="text-xs text-gray-500 uppercase font-bold mb-1">Or</div>}
                    <div className="text-sm text-gray-600 mb-1">Buy It Now Price:</div>
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                      ${(listing.buyItNowPrice || listing.price).toFixed(2)}
                    </div>
                    <button
                      onClick={handleBuyNow}
                      className="w-full bg-blue-100 text-xbay-blue border border-xbay-blue px-6 py-3 rounded-full font-bold hover:bg-blue-200 transition-colors mb-3"
                    >
                      Buy It Now
                    </button>
                  </div>
                )}

                {(listing.buyItNowPrice || !isAuction) && isSeller && (
                  <div>
                    {isAuction && <div className="text-xs text-gray-500 uppercase font-bold mb-1">Or</div>}
                    <div className="text-sm text-gray-600 mb-1">Buy It Now Price:</div>
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                      ${(listing.buyItNowPrice || listing.price).toFixed(2)}
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800 mb-2">
                      This is your listing.
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => toggleWatchlist(listing.id)}
                    className={`flex-1 flex items-center justify-center gap-2 border px-4 py-2 rounded text-sm font-medium transition-colors ${isWatched ? 'border-xbay-blue text-xbay-blue bg-blue-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Heart size={16} fill={isWatched ? "currentColor" : "none"} />
                    {isWatched ? 'Watching' : 'Add to Watchlist'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {shareCopied ? <Check size={16} className="text-green-600" /> : <Share2 size={16} />}
                    {shareCopied ? 'Copied!' : 'Share'}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex gap-3">
                <Truck size={20} className="text-gray-400" />
                <div>
                  <div className="font-bold">Shipping: ${listing.shipping.toFixed(2)}</div>
                  <div className="text-gray-500">Expedited Shipping available</div>
                </div>
              </div>
              <div className="flex gap-3">
                <RotateCcw size={20} className="text-gray-400" />
                <div>
                  <div className="font-bold">Returns</div>
                  <div className="text-gray-500">30 days returns. Buyer pays for return shipping.</div>
                </div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck size={20} className="text-gray-400" />
                <div>
                  <div className="font-bold">xBay Money Back Guarantee</div>
                  <div className="text-gray-500">Get the item you ordered or get your money back.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Seller Info */}
          <div className="md:col-span-3">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Seller Information</h3>
              <div className="flex items-center gap-3 mb-3">
                <img src={seller?.avatar} alt={seller?.username} className="w-10 h-10 rounded-full" />
                <div>
                  <div className="font-bold text-xbay-blue truncate">{seller?.username}</div>
                  <div className="text-xs text-gray-500">{seller?.feedbackScore} feedback ({seller?.feedbackRating}%)</div>
                </div>
              </div>
              {!isSeller ? (
                <>
                  <button
                    onClick={handleContactSeller}
                    className="w-full border border-xbay-blue text-xbay-blue rounded-full py-1.5 text-sm font-bold hover:bg-blue-50 mb-2 transition-colors"
                  >
                    Contact Seller
                  </button>
                  <button
                    onClick={handleSeeOtherItems}
                    className="w-full border border-gray-300 text-gray-700 rounded-full py-1.5 text-sm font-bold hover:bg-gray-100 transition-colors"
                  >
                    See other items
                  </button>
                </>
              ) : (
                <div className="text-sm text-center text-gray-500 italic">This is your listing</div>
              )}
            </div>
          </div>

        </div>

        {/* Description */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold mb-4">Item Description</h2>
          <div className="prose max-w-none text-gray-800 bg-gray-50 p-6 rounded-lg border border-gray-200">
            {listing.description}
          </div>
        </div>
      </div>

      {/* Buy Now Confirmation Modal */}
      {showBuyConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-2">Confirm Purchase</h3>
            <p className="text-gray-600 mb-1">Are you sure you want to buy this item now?</p>
            <p className="font-bold text-gray-900 mb-1">{listing.title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-4">
              ${(listing.buyItNowPrice || listing.price).toFixed(2)}
            </p>
            {isAuction && (
              <p className="text-sm text-orange-600 mb-4">This will end the auction immediately.</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBuyConfirm(false)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmBuyNow}
                className="bg-xbay-blue text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Seller Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Contact Seller</h3>
              <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            {messageSent ? (
              <div className="text-center py-6">
                <Check size={40} className="text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-bold">Message sent successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage}>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">To: <span className="font-bold text-gray-800">{seller?.username}</span></div>
                  <div className="text-sm text-gray-500 mb-4">About: <span className="font-medium text-gray-800 line-clamp-1">{listing.title}</span></div>
                  <label className="block text-sm font-bold mb-1">Subject</label>
                  <input
                    type="text"
                    value={contactSubject}
                    onChange={e => setContactSubject(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none mb-3"
                    required
                  />
                  <label className="block text-sm font-bold mb-1">Message</label>
                  <textarea
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    rows="4"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-xbay-blue focus:outline-none"
                    placeholder="Type your message here..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-xbay-blue text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
