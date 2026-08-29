
    import React, { useState, useMemo } from 'react';
    import { useSearchParams } from 'react-router-dom';
    import { useStore } from '../context/StoreContext';
    import RestaurantCard from '../components/RestaurantCard';

    const FILTERS = [
      { id: 'all', label: 'All' },
      { id: 'price', label: 'Price Rating' },
      { id: 'rating', label: 'Top Rated' },
      { id: 'veg', label: 'Vegetarian' },
      { id: 'gf', label: 'Gluten Free' },
    ];

    const CATEGORIES = [
      { name: 'Deals', image: 'https://picsum.photos/100/100?random=cat1' },
      { name: 'Grocery', image: 'https://picsum.photos/100/100?random=cat2' },
      { name: 'Convenience', image: 'https://picsum.photos/100/100?random=cat3' },
      { name: 'Alcohol', image: 'https://picsum.photos/100/100?random=cat4' },
      { name: 'Pharmacy', image: 'https://picsum.photos/100/100?random=cat5' },
      { name: 'Baby', image: 'https://picsum.photos/100/100?random=cat6' },
    ];

    export default function Home() {
      const { state } = useStore();
      const [searchParams] = useSearchParams();
      const searchQuery = searchParams.get('q') || '';
      const [activeFilter, setActiveFilter] = useState('all');
      const [activeCategory, setActiveCategory] = useState(null);

      const filteredRestaurants = useMemo(() => {
        let results = state.restaurants;

        // Search
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          results = results.filter(r => 
            r.name.toLowerCase().includes(q) || 
            r.cuisine.toLowerCase().includes(q)
          );
        }

        // Filters
        if (activeFilter === 'rating') {
          results = [...results].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        }
        if (activeFilter === 'price') {
          results = [...results].sort((a, b) => a.deliveryFee - b.deliveryFee);
        }
        if (activeFilter === 'veg' || activeFilter === 'gf') {
          const tag = activeFilter === 'veg' ? 'Vegetarian' : 'Gluten-Free';
          const restaurantIds = new Set(state.menuItems.filter(item => item.dietary.includes(tag)).map(item => item.restaurantId));
          results = results.filter(rest => restaurantIds.has(rest.id));
        }
        if (activeCategory === 'Deals') {
          results = results.filter(rest => rest.deliveryFee <= 2);
        }
        
        return results;
      }, [state.restaurants, state.menuItems, searchQuery, activeFilter, activeCategory]);

      return (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
          
          {/* Categories */}
          {!searchQuery && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                  className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group"
                >
                  <div className={`w-16 h-16 rounded-lg overflow-hidden group-hover:shadow-md transition-all ${activeCategory === cat.name ? 'ring-2 ring-black' : 'bg-gray-100'}`}>
                    <img src={cat.image} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  activeFilter === filter.id 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {searchQuery ? `Results for "${searchQuery}"` : 'Restaurants near you'}
              {activeCategory && <span className="block text-sm font-medium text-gray-500 mt-1">{activeCategory} selected</span>}
            </h2>
            
            {filteredRestaurants.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No restaurants found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRestaurants.map(restaurant => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
  
