import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ListingCard from '../components/ListingCard';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const { state } = useStore();
  const featuredListings = state.listings.filter(l => l.status === 'active').slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="bg-xbay-blue text-white rounded-xl p-8 mb-12 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold mb-4">Score the best deals on electronics</h1>
          <p className="text-lg mb-6 text-blue-100">From vintage consoles to the latest cameras, find it all here.</p>
          <Link to="/search?c=electronics" className="inline-block bg-white text-xbay-blue font-bold px-6 py-3 rounded-full hover:bg-blue-50 transition-colors">
            Shop Electronics
          </Link>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-blue-600 to-transparent opacity-50"></div>
      </div>

      {/* Categories Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Explore Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Sneakers', 'Watches', 'Trading Cards', 'Handbags', 'Gaming', 'Cameras'].map((cat) => (
            <Link key={cat} to={`/search?q=${cat}`} className="group block text-center">
              <div className="aspect-square rounded-full bg-gray-100 mb-3 overflow-hidden mx-auto w-32 h-32 flex items-center justify-center">
                <img src={`https://picsum.photos/200/200?random=${cat}`} alt={cat} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-medium group-hover:underline">{cat}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Listings */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Today's Featured Items</h2>
          <Link to="/search" className="text-xbay-blue font-medium hover:underline flex items-center">
            See all <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
}