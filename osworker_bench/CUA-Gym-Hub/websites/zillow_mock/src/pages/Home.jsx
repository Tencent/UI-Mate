import React, { useMemo } from 'react';
import Map from '../components/Map';
import PropertyCard from '../components/PropertyCard';
import FilterBar from '../components/FilterBar';
import { useStore } from '../lib/store';

export default function Home() {
  const { state, updateFilters } = useStore();
  const filters = state.filters || { // Fallback if filters missing in old localstorage
    search: '',
    minPrice: 0,
    maxPrice: 10000000,
    minBeds: 0,
    minBaths: 0,
    minSqft: 0,
    maxSqft: 100000,
    type: 'All',
    features: []
  };

  const filteredProperties = useMemo(() => {
    return state.properties.filter(p => {
      const matchesSearch = p.address.toLowerCase().includes(filters.search.toLowerCase()) || 
                            p.city.toLowerCase().includes(filters.search.toLowerCase()) ||
                            p.zip.includes(filters.search);
      
      const matchesPrice = p.price >= filters.minPrice && p.price <= filters.maxPrice;
      const matchesBeds = p.beds >= filters.minBeds;
      const matchesBaths = p.baths >= (filters.minBaths || 0);
      const matchesType = filters.type === 'All' || p.type === filters.type;
      
      const matchesSqft = (!filters.minSqft || p.sqft >= filters.minSqft) && 
                          (!filters.maxSqft || p.sqft <= filters.maxSqft);

      const matchesFeatures = filters.features && filters.features.length > 0 
        ? filters.features.every(f => p.features.includes(f))
        : true;

      return matchesSearch && matchesPrice && matchesBeds && matchesBaths && matchesType && matchesSqft && matchesFeatures;
    });
  }, [state.properties, filters]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <FilterBar filters={filters} setFilters={updateFilters} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Map Section */}
        <div className="hidden lg:block w-1/2 h-full relative border-r border-gray-200">
          <Map properties={filteredProperties} />
        </div>

        {/* List Section */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-gray-50">
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Real Estate & Homes For Sale
              <span className="ml-2 text-sm font-normal text-gray-500">{filteredProperties.length} results</span>
            </h1>
            
            {filteredProperties.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-lg">No homes found matching your search.</p>
                    <button 
                        onClick={() => updateFilters({ 
                            search: '', 
                            minPrice: 0,
                            maxPrice: 10000000, 
                            minBeds: 0, 
                            minBaths: 0,
                            minSqft: 0,
                            maxSqft: 100000,
                            type: 'All',
                            features: [] 
                        })}
                        className="mt-4 text-brand-500 font-medium hover:underline"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProperties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
