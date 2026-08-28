import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { clsx } from 'clsx';

export default function PropertyCard({ property, horizontal = false }) {
  const { state, toggleSaveProperty } = useStore();
  const isSaved = state.user.savedProperties.includes(property.id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const isRental = property.listingStatus === 'For Rent';

  const formatPrice = (price) => {
    if (isRental) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(price) + '/mo';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  // Get agent name
  const agent = (state.agents || []).find(a => a.id === property.agentId);
  const agentName = agent ? agent.name.split(' ')[0] + ' ' + agent.name.split(' ')[1][0] + '.' : '';

  // Status badge color
  const getStatusColor = () => {
    switch (property.listingStatus) {
      case 'For Sale': return 'bg-blue-600 text-white';
      case 'For Rent': return 'bg-green-600 text-white';
      case 'Pending': return 'bg-yellow-500 text-white';
      case 'Recently Sold': return 'bg-gray-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  // Tag badges
  const tags = property.tags || [];

  return (
    <div
      className={clsx(
        "bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100 group relative",
        horizontal ? "flex flex-row h-40" : "flex flex-col"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className={clsx("relative overflow-hidden bg-gray-200", horizontal ? "w-1/3" : "w-full aspect-[4/3]")}>
        <Link to={`/property/${property.id}`} className="block w-full h-full">
            <img
            src={property.images[currentImageIndex]}
            alt={property.address}
            className="w-full h-full object-cover transition-transform duration-300"
            />
        </Link>

        {/* Status Badge */}
        <div className={`absolute top-2 left-2 ${getStatusColor()} px-2 py-1 rounded text-xs font-bold uppercase tracking-wider z-10`}>
          {property.listingStatus}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="absolute top-2 left-2 mt-7 flex gap-1 z-10">
            {tags.map(tag => (
              <span key={tag} className={`px-2 py-0.5 rounded text-xs font-semibold ${
                tag === 'New Listing' ? 'bg-orange-500 text-white' :
                tag === 'Price Cut' ? 'bg-red-500 text-white' :
                tag === 'Hot Home' ? 'bg-red-600 text-white' :
                tag === 'Open House' ? 'bg-purple-600 text-white' :
                'bg-gray-700 text-white'
              }`}>{tag}</span>
            ))}
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaveProperty(property.id);
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors z-10"
        >
          <Heart size={20} fill={isSaved ? "#ef4444" : "none"} className={isSaved ? "text-red-500" : "text-white"} />
        </button>

        {/* Carousel Controls */}
        {isHovered && property.images.length > 1 && !horizontal && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-sm z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-sm z-10"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {property.images.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    "w-1.5 h-1.5 rounded-full shadow-sm",
                    idx === currentImageIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content Section */}
      <Link to={`/property/${property.id}`} className={clsx("p-4 flex flex-col justify-between", horizontal ? "w-2/3" : "w-full")}>
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-2xl font-bold text-gray-900">{formatPrice(property.price)}</h3>
            {property.zestimate && !isRental && (
              <span className="text-xs text-gray-400">Zestimate: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.zestimate)}</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-gray-600 text-sm mb-3">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900">{property.beds}</span> <span className="text-xs">bds</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900">{property.baths}</span> <span className="text-xs">ba</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900">{property.sqft.toLocaleString()}</span> <span className="text-xs">sqft</span>
            </div>
            {property.type && (
              <span className="text-xs text-gray-400">- {property.type}</span>
            )}
          </div>

          <p className="text-gray-700 text-sm truncate">{property.address}</p>
          <p className="text-gray-500 text-xs">{property.city}, {property.state} {property.zip}</p>
        </div>

        {!horizontal && (
           <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
             <span className="text-[11px] text-gray-400 font-medium">
               {property.daysOnZillow === 0 ? 'Just listed' : `${property.daysOnZillow}d on Xillow`}
             </span>
             {agentName && <span className="text-[11px] text-gray-400">Listed by {agentName}</span>}
           </div>
        )}
      </Link>
    </div>
  );
}
