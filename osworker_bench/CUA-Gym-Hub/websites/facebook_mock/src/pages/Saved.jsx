import React, { useState } from 'react';
import { Bookmark, Clock, ShoppingBag, Calendar, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDistanceToNow } from 'date-fns';

const Saved = () => {
  const { state, unsaveItem } = useApp();
  const [activeCollection, setActiveCollection] = useState('all');

  const savedItems = state.savedItems || [];
  const posts = state.posts || [];
  const marketplace = state.marketplace || [];
  const events = state.events || [];

  const getItemDetails = (savedItem) => {
    switch (savedItem.type) {
      case 'post': {
        const post = posts.find(p => p.id === savedItem.referenceId);
        return post ? {
          title: post.content.slice(0, 80) + (post.content.length > 80 ? '...' : ''),
          image: post.image || `https://picsum.photos/300/200?random=${post.id}`,
          source: 'Post',
          icon: <Clock size={16} className="text-blue-500" />,
          type: 'post'
        } : null;
      }
      case 'listing': {
        const listing = marketplace.find(l => l.id === savedItem.referenceId);
        return listing ? {
          title: listing.title,
          image: listing.images[0],
          source: `Marketplace · $${listing.price === 0 ? 'Free' : listing.price}`,
          icon: <ShoppingBag size={16} className="text-green-500" />,
          type: 'listing'
        } : null;
      }
      case 'event': {
        const event = events.find(e => e.id === savedItem.referenceId);
        return event ? {
          title: event.name,
          image: event.cover,
          source: `Event · ${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          icon: <Calendar size={16} className="text-red-500" />,
          type: 'event'
        } : null;
      }
      case 'link': {
        return {
          title: savedItem.title || 'Saved Link',
          image: `https://picsum.photos/300/200?random=${savedItem.id}`,
          source: 'Link',
          icon: <LinkIcon size={16} className="text-purple-500" />,
          type: 'link'
        };
      }
      default:
        return null;
    }
  };

  const collections = ['all', ...new Set(savedItems.filter(i => i.collection).map(i => i.collection))];

  const filteredItems = activeCollection === 'all'
    ? savedItems
    : savedItems.filter(i => i.collection === activeCollection);

  return (
    <div className="bg-[#F0F2F5] min-h-screen pt-14 flex">
      {/* Left Sidebar */}
      <div className="w-[360px] bg-white h-[calc(100vh-56px)] fixed left-0 overflow-y-auto p-4 shadow-sm hidden lg:block">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
            <Bookmark size={20} className="text-white fill-white" />
          </div>
          <h2 className="text-2xl font-bold">Saved</h2>
        </div>

        <nav className="space-y-1">
          {collections.map(col => (
            <div
              key={col}
              onClick={() => setActiveCollection(col)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer font-medium text-[15px] ${activeCollection === col ? 'bg-blue-50 text-primary' : 'hover:bg-gray-100 text-[#050505]'}`}
            >
              {col === 'all' ? 'All saved items' : col}
              {col === 'all' && (
                <span className="ml-auto text-[13px] text-gray-500">{savedItems.length}</span>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-[360px] p-4 flex justify-center">
        <div className="w-full max-w-[900px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {activeCollection === 'all' ? 'All Saved Items' : activeCollection}
            </h2>
            <span className="text-[13px] text-gray-500">{filteredItems.length} items</span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark size={32} className="text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-1">No saved items</p>
              <p className="text-[15px] text-gray-500">Save posts, listings, and events to find them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map(savedItem => {
                const details = getItemDetails(savedItem);
                if (!details) return null;

                return (
                  <div key={savedItem.id} className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow group">
                    {/* Thumbnail */}
                    <div className="h-44 overflow-hidden bg-gray-100 relative">
                      <img
                        src={details.image}
                        alt={details.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        title="Unsave"
                        onClick={(e) => { e.stopPropagation(); unsaveItem(savedItem.id); }}
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="font-semibold text-[15px] line-clamp-2 mb-1">{details.title}</p>
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-500 mb-1">
                        {details.icon}
                        <span>{details.source}</span>
                      </div>
                      <p className="text-[13px] text-gray-400">
                        Saved {formatDistanceToNow(savedItem.savedAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Saved;
