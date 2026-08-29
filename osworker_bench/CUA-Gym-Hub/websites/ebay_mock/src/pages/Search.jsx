import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ListingCard from '../components/ListingCard';

const CONDITIONS = ['New', 'Open Box', 'Used', 'Refurbished', 'For Parts'];
const FORMATS = ['Auction', 'Buy It Now'];

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('c') || '';
  const sellerFilter = searchParams.get('seller') || '';
  const { state } = useStore();

  // Filter state
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [appliedPriceMin, setAppliedPriceMin] = useState('');
  const [appliedPriceMax, setAppliedPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const toggleCondition = (condition) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleFormat = (format) => {
    setSelectedFormats(prev =>
      prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const handleApplyPrice = () => {
    setAppliedPriceMin(priceMin);
    setAppliedPriceMax(priceMax);
  };

  const handleClearFilters = () => {
    setSelectedConditions([]);
    setSelectedFormats([]);
    setPriceMin('');
    setPriceMax('');
    setAppliedPriceMin('');
    setAppliedPriceMax('');
    setSortBy('default');
  };

  const results = useMemo(() => {
    let filtered = state.listings.filter(item => {
      if (item.status !== 'active') return false;
      if (query && !item.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (category && item.category.toLowerCase() !== category.toLowerCase()) return false;
      if (sellerFilter && item.sellerId !== sellerFilter) return false;
      if (selectedConditions.length > 0 && !selectedConditions.includes(item.condition)) return false;
      if (selectedFormats.length > 0) {
        const formatMatch = (selectedFormats.includes('Auction') && item.type === 'auction') ||
                            (selectedFormats.includes('Buy It Now') && (item.type === 'fixed' || item.buyItNowPrice != null));
        if (!formatMatch) return false;
      }
      const effectivePrice = item.type === 'auction' ? item.currentBid : (item.price || item.buyItNowPrice);
      if (appliedPriceMin !== '' && !isNaN(parseFloat(appliedPriceMin)) && effectivePrice < parseFloat(appliedPriceMin)) return false;
      if (appliedPriceMax !== '' && !isNaN(parseFloat(appliedPriceMax)) && effectivePrice > parseFloat(appliedPriceMax)) return false;
      return true;
    });

    // Sort
    if (sortBy === 'price_asc') {
      filtered = [...filtered].sort((a, b) => {
        const pa = a.type === 'auction' ? a.currentBid : (a.price || a.buyItNowPrice || 0);
        const pb = b.type === 'auction' ? b.currentBid : (b.price || b.buyItNowPrice || 0);
        return pa - pb;
      });
    } else if (sortBy === 'price_desc') {
      filtered = [...filtered].sort((a, b) => {
        const pa = a.type === 'auction' ? a.currentBid : (a.price || a.buyItNowPrice || 0);
        const pb = b.type === 'auction' ? b.currentBid : (b.price || b.buyItNowPrice || 0);
        return pb - pa;
      });
    } else if (sortBy === 'ending_soonest') {
      filtered = [...filtered].sort((a, b) => a.endTime - b.endTime);
    } else if (sortBy === 'most_bids') {
      filtered = [...filtered].sort((a, b) => b.bids.length - a.bids.length);
    }

    return filtered;
  }, [query, category, sellerFilter, state.listings, selectedConditions, selectedFormats, appliedPriceMin, appliedPriceMax, sortBy]);

  const hasActiveFilters = selectedConditions.length > 0 || selectedFormats.length > 0 || appliedPriceMin !== '' || appliedPriceMax !== '';
  const sellerUser = sellerFilter ? state.users.find(u => u.id === sellerFilter) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div className="w-64 hidden md:block flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-xbay-blue hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-sm mb-2">Condition</h4>
            <div className="space-y-2">
              {CONDITIONS.map(cond => (
                <label key={cond} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 accent-xbay-blue"
                    checked={selectedConditions.includes(cond)}
                    onChange={() => toggleCondition(cond)}
                  />
                  {cond}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-sm mb-2">Buying Format</h4>
            <div className="space-y-2">
              {FORMATS.map(fmt => (
                <label key={fmt} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 accent-xbay-blue"
                    checked={selectedFormats.includes(fmt)}
                    onChange={() => toggleFormat(fmt)}
                  />
                  {fmt}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-sm mb-2">Price</h4>
            <div className="flex gap-2 items-center mb-2">
              <input
                type="number"
                placeholder="Min $"
                min="0"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                className="w-20 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-xbay-blue"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                placeholder="Max $"
                min="0"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                className="w-20 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-xbay-blue"
              />
            </div>
            <button
              onClick={handleApplyPrice}
              className="w-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 rounded transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">
                {sellerUser
                  ? `Items by ${sellerUser.username}`
                  : query
                    ? `Results for "${query}"`
                    : category
                      ? `${category} listings`
                      : 'All Listings'}
              </h1>
              <p className="text-gray-500 text-sm">{results.length} results</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-xbay-blue"
              >
                <option value="default">Best Match</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="ending_soonest">Time: Ending Soonest</option>
                <option value="most_bids">Most Bids</option>
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedConditions.map(c => (
                <span key={c} className="inline-flex items-center gap-1 bg-blue-50 text-xbay-blue text-xs px-2 py-1 rounded-full">
                  {c}
                  <button onClick={() => toggleCondition(c)} className="hover:text-blue-800 font-bold">&times;</button>
                </span>
              ))}
              {selectedFormats.map(f => (
                <span key={f} className="inline-flex items-center gap-1 bg-blue-50 text-xbay-blue text-xs px-2 py-1 rounded-full">
                  {f}
                  <button onClick={() => toggleFormat(f)} className="hover:text-blue-800 font-bold">&times;</button>
                </span>
              ))}
              {(appliedPriceMin !== '' || appliedPriceMax !== '') && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-xbay-blue text-xs px-2 py-1 rounded-full">
                  ${appliedPriceMin || '0'} – ${appliedPriceMax || '∞'}
                  <button onClick={() => { setPriceMin(''); setPriceMax(''); setAppliedPriceMin(''); setAppliedPriceMax(''); }} className="hover:text-blue-800 font-bold">&times;</button>
                </span>
              )}
            </div>
          )}

          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-lg text-gray-600">No matches found.</p>
              <p className="text-gray-500">Try checking your spelling or use more general terms.</p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-xbay-blue hover:underline text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
