import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatDistanceToNow } from 'date-fns';

export default function ListingCard({ listing }) {
  const { state, toggleWatchlist } = useStore();
  const isWatched = listing.watchers.includes(state.currentUser.id);
  const isAuction = listing.type === 'auction';
  const timeLeft = listing.endTime > Date.now() 
    ? formatDistanceToNow(listing.endTime) 
    : 'Ended';

  return (
    <div className="group relative bg-white rounded-lg p-4 hover:shadow-lg transition-shadow border border-transparent hover:border-gray-200">
      <button 
        onClick={(e) => {
          e.preventDefault();
          toggleWatchlist(listing.id);
        }}
        className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition-colors"
      >
        <Heart size={18} fill={isWatched ? "currentColor" : "none"} className={isWatched ? "text-red-500" : ""} />
      </button>

      <Link to={`/item/${listing.id}`} className="block">
        <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
          <img 
            src={listing.images[0]} 
            alt={listing.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-xbay-blue group-hover:underline">
          {listing.title}
        </h3>
        
        <div className="text-xs text-gray-500 mb-2">{listing.condition}</div>
        
        <div className="space-y-1">
          {isAuction ? (
            <>
              <div className="font-bold text-lg">${listing.currentBid.toFixed(2)}</div>
              <div className="text-xs text-gray-500">{listing.bids.length} bids · {timeLeft} left</div>
            </>
          ) : (
            <>
              <div className="font-bold text-lg">${listing.price.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Buy It Now</div>
            </>
          )}
          
          <div className="text-xs text-gray-500">
            {listing.shipping === 0 ? 'Free shipping' : `+$${listing.shipping.toFixed(2)} shipping`}
          </div>
        </div>
      </Link>
    </div>
  );
}