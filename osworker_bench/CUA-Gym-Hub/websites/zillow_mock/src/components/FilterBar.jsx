import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, X, Check, Search, ChevronDown } from 'lucide-react';
import { useStore } from '../lib/store';

export default function FilterBar({ filters, setFilters }) {
  const { state, saveSearch } = useStore();
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);
  
  // Autocomplete State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Price Filter State
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const priceFilterRef = useRef(null);

  // Save Search State
  const [searchName, setSearchName] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (priceFilterRef.current && !priceFilterRef.current.contains(event.target)) {
        setShowPriceFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowMoreFilters(false);
        setShowSaveSearchModal(false);
        setShowPriceFilter(false);
        setShowSuggestions(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters({ ...filters, search: value });
    
    if (value.length > 0) {
      const locations = new Set();
      state.properties.forEach(p => {
        locations.add(p.city);
        locations.add(p.zip);
        locations.add(p.address);
        locations.add(`${p.city}, ${p.state}`);
      });
      
      const uniqueLocations = Array.from(locations);
      const filtered = uniqueLocations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setFilters({ ...filters, search: suggestion });
    setShowSuggestions(false);
  };

  const openModal = () => {
    setTempFilters(filters);
    setShowMoreFilters(true);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowMoreFilters(false);
  };

  const handleFeatureToggle = (feature) => {
    const currentFeatures = tempFilters.features || [];
    if (currentFeatures.includes(feature)) {
      setTempFilters({ ...tempFilters, features: currentFeatures.filter(f => f !== feature) });
    } else {
      setTempFilters({ ...tempFilters, features: [...currentFeatures, feature] });
    }
  };

  const handleSaveSearch = (e) => {
    e.preventDefault();
    saveSearch({
        name: searchName,
        filters: filters,
        alertsEnabled: emailAlerts
    });
    setSaveSuccess(true);
    setTimeout(() => {
        setSaveSuccess(false);
        setShowSaveSearchModal(false);
        setSearchName('');
    }, 2000);
  };

  const formatPriceShort = (price) => {
      if (price >= 1000000) return `$${(price/1000000).toFixed(1)}M`;
      if (price >= 1000) return `$${(price/1000).toFixed(0)}k`;
      return price;
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 p-3 flex flex-wrap items-center gap-3 shadow-sm z-10 sticky top-16">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md z-[100]" ref={searchContainerRef}>
          <div className="relative">
            <input 
                type="text" 
                placeholder="Address, City, ZIP, Neighborhood"
                className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                value={filters.search}
                onChange={handleSearchChange}
                onFocus={() => filters.search && setShowSuggestions(true)}
            />
            <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-xl mt-1 z-[9999] max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 border-b border-gray-50 last:border-0 flex items-center gap-2"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <Search size={14} className="text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter with Sliders */}
        <div className="relative z-[90]" ref={priceFilterRef}>
            <button 
                onClick={() => setShowPriceFilter(!showPriceFilter)}
                className={`border rounded-md px-3 py-2 text-sm bg-white hover:border-brand-500 flex items-center gap-2 min-w-[120px] justify-between ${showPriceFilter ? 'border-brand-500 ring-1 ring-brand-500' : 'border-gray-300'}`}
            >
                <span>
                    {filters.minPrice === 0 && filters.maxPrice === 10000000 ? 'Price' : 
                     filters.maxPrice === 10000000 ? `$${formatPriceShort(filters.minPrice)}+` :
                     filters.minPrice === 0 ? `Up to ${formatPriceShort(filters.maxPrice)}` :
                     `${formatPriceShort(filters.minPrice)} - ${formatPriceShort(filters.maxPrice)}`}
                </span>
                <ChevronDown size={14} className="text-gray-500" />
            </button>
            
            {showPriceFilter && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-[320px] z-[9999]">
                    <h3 className="font-bold text-gray-900 mb-3">Price Range</h3>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                            <input 
                                type="number" 
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                value={filters.minPrice === 0 ? '' : filters.minPrice}
                                onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
                            />
                        </div>
                        <span className="text-gray-400 mt-4">-</span>
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                            <input 
                                type="number" 
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                value={filters.maxPrice === 10000000 ? '' : filters.maxPrice}
                                onChange={(e) => setFilters({...filters, maxPrice: e.target.value ? Number(e.target.value) : 10000000})}
                            />
                        </div>
                    </div>
                    
                    {/* Actual Range Sliders */}
                    <div className="mb-6 px-2">
                        <label className="block text-xs text-gray-500 mb-1">Min: {formatPriceShort(filters.minPrice)}</label>
                        <input 
                            type="range" 
                            min="0" 
                            max="5000000" 
                            step="50000"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                        />
                    </div>
                    <div className="mb-6 px-2">
                        <label className="block text-xs text-gray-500 mb-1">Max: {filters.maxPrice >= 10000000 ? 'Any' : formatPriceShort(filters.maxPrice)}</label>
                        <input 
                            type="range" 
                            min="0" 
                            max="5000000" 
                            step="50000"
                            value={filters.maxPrice >= 5000000 ? 5000000 : filters.maxPrice}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setFilters({...filters, maxPrice: val >= 5000000 ? 10000000 : val})
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button 
                            onClick={() => setShowPriceFilter(false)}
                            className="bg-brand-500 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-brand-600"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Beds */}
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white hover:border-brand-500">
          <span className="px-3 py-2 bg-gray-50 text-sm text-gray-600 border-r border-gray-300">Beds</span>
          <select 
            className="px-2 py-2 text-sm bg-white outline-none cursor-pointer min-w-[60px]"
            value={filters.minBeds}
            onChange={(e) => setFilters({...filters, minBeds: Number(e.target.value)})}
          >
            <option value={0}>Any</option>
            <option value={1}>1+</option>
            <option value={2}>2+</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={5}>5+</option>
          </select>
        </div>

        {/* Listing Status */}
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-brand-500 cursor-pointer"
          value={filters.listingStatus || 'For Sale'}
          onChange={(e) => setFilters({...filters, listingStatus: e.target.value})}
        >
          <option value="For Sale">For Sale</option>
          <option value="For Rent">For Rent</option>
          <option value="Pending">Pending</option>
          <option value="Recently Sold">Recently Sold</option>
        </select>

        {/* Home Type */}
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-brand-500 cursor-pointer"
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="All">All Home Types</option>
          <option value="Single Family">Houses</option>
          <option value="Condo">Condos</option>
          <option value="Townhouse">Townhouses</option>
          <option value="Apartment">Apartments</option>
        </select>

        {/* More Filters Button */}
        <button
          onClick={openModal}
          className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 text-sm hover:border-brand-500 hover:text-brand-500 transition-colors bg-white"
        >
          <SlidersHorizontal size={16} />
          <span>More</span>
        </button>

        {/* Sort */}
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-brand-500 cursor-pointer"
          value={filters.sortBy || 'Homes for You'}
          onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
        >
          <option value="Homes for You">Sort: Homes for You</option>
          <option value="Price (Low to High)">Price (Low to High)</option>
          <option value="Price (High to Low)">Price (High to Low)</option>
          <option value="Newest">Newest</option>
          <option value="Bedrooms">Bedrooms</option>
          <option value="Square Feet">Square Feet</option>
        </select>

        <button
          className="ml-auto text-brand-500 text-sm font-medium hover:underline"
          onClick={() => setFilters({
            search: '',
            listingStatus: 'For Sale',
            minPrice: 0,
            maxPrice: 10000000,
            minBeds: 0,
            minBaths: 0,
            minSqft: 0,
            maxSqft: 100000,
            type: 'All',
            features: [],
            sortBy: 'Homes for You'
          })}
        >
          Reset All
        </button>
        
        <button 
            onClick={() => setShowSaveSearchModal(true)}
            className="bg-brand-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          Save Search
        </button>
      </div>

      {/* Advanced Filters Modal */}
      {showMoreFilters && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4" onClick={() => setShowMoreFilters(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">More Filters</h2>
              <button onClick={() => setShowMoreFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Baths */}
              <div>
                <h3 className="font-bold mb-3 text-gray-900">Bathrooms</h3>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => setTempFilters({...tempFilters, minBaths: num})}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        tempFilters.minBaths === num 
                          ? 'bg-brand-500 text-white border-brand-500' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-brand-500'
                      }`}
                    >
                      {num === 0 ? 'Any' : `${num}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Square Footage */}
              <div>
                 <h3 className="font-bold mb-3 text-gray-900">Square Footage</h3>
                 <div className="flex items-center gap-4">
                    <input 
                        type="number" 
                        placeholder="Min Sqft"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={tempFilters.minSqft || ''}
                        onChange={(e) => setTempFilters({...tempFilters, minSqft: Number(e.target.value)})}
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                        type="number" 
                        placeholder="Max Sqft"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={tempFilters.maxSqft || ''}
                        onChange={(e) => setTempFilters({...tempFilters, maxSqft: Number(e.target.value)})}
                    />
                 </div>
              </div>

              {/* Amenities / Features */}
              <div>
                <h3 className="font-bold mb-3 text-gray-900">Home Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Garage', 'Fireplace', 'Hardwood Floors', 'Garden', 'Bay View', 'Pool', 'Central AC', 'In-Unit Laundry', 'Pet Friendly', 'Parking', 'Gym', 'Deck'].map(feature => (
                    <label key={feature} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        (tempFilters.features || []).includes(feature)
                          ? 'bg-brand-500 border-brand-500'
                          : 'border-gray-300 group-hover:border-brand-500'
                      }`}>
                        {(tempFilters.features || []).includes(feature) && <Check size={14} className="text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={(tempFilters.features || []).includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                      />
                      <span className="text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <button 
                onClick={() => setShowMoreFilters(false)}
                className="px-6 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={applyFilters}
                className="px-6 py-2 rounded-lg font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveSearchModal && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4" onClick={() => setShowSaveSearchModal(false)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Save this Search</h2>
                    <button onClick={() => setShowSaveSearchModal(false)}><X size={24} /></button>
                </div>
                
                {saveSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="text-green-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Search Saved!</h3>
                        <p className="text-gray-600">We'll let you know when new homes hit the market.</p>
                        <p className="text-sm text-gray-500 mt-2">Alert created.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSaveSearch}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Name</label>
                            <input 
                                type="text" 
                                required
                                placeholder="e.g. Santa Monica Condos"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                            />
                        </div>
                        
                        <div className="mb-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${emailAlerts ? 'bg-brand-500' : 'bg-gray-300'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emailAlerts ? 'translate-x-4' : ''}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
                                <span className="text-sm font-medium text-gray-700">Email me when new homes match</span>
                            </label>
                        </div>

                        <button type="submit" className="w-full bg-brand-500 text-white font-bold py-3 rounded-lg hover:bg-brand-600 transition">
                            Save Search
                        </button>
                    </form>
                )}
            </div>
        </div>
      )}
    </>
  );
}
