import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';
import { Rating } from '../components/ui/Rating';
import { CATEGORIES } from '../lib/mockData';
import { ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';

export const ProductListing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useStore();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const dealsParam = searchParams.get('deals') === 'true';

  // Get unique brands from products in the current category/search
  const availableBrands = useMemo(() => {
    const filtered = state.products.filter(p => categoryParam ? p.category === categoryParam : true);
    return [...new Set(filtered.map(p => p.brand))].sort();
  }, [state.products, categoryParam]);

  // Filter States
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [primeOnly, setPrimeOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return state.products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(query.toLowerCase()) ||
                            product.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryParam ? product.category === categoryParam : true;
      const matchesPrice = priceRange[1] >= 1000 ? true : (product.price >= priceRange[0] && product.price <= priceRange[1]);
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchesPrime = !primeOnly || product.prime;
      const matchesRating = product.rating >= minRating;
      const matchesDeals = !dealsParam || (product.originalPrice && product.originalPrice > product.price);

      return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesPrime && matchesRating && matchesDeals;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured
    });
  }, [state.products, query, categoryParam, dealsParam, priceRange, selectedBrands, primeOnly, minRating, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1); // Reset page on filter change
  };

  const handleCategoryClick = (cat) => {
    // Navigate to search page with category param, keeping other params if needed or resetting
    navigate(`/search?category=${encodeURIComponent(cat)}`);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-[1500px] mx-auto p-4 flex gap-6">
      {/* Sidebar Filters */}
      <div className="w-[230px] shrink-0 hidden md:block">
        <h3 className="font-bold text-[14px] mb-2 text-[#0F1111]">Department</h3>
        <ul className="text-[13px] mb-4 space-y-0.5">
          <li
            className={`cursor-pointer py-0.5 ${!categoryParam ? 'font-bold text-[#c7511f]' : 'text-[#0F1111] hover:text-[#c7511f]'}`}
            onClick={() => { navigate('/search'); setCurrentPage(1); }}
          >
            Any Department
          </li>
          {CATEGORIES.map(cat => (
            <li
              key={cat}
              className={`cursor-pointer py-0.5 pl-3 ${categoryParam === cat ? 'font-bold text-[#c7511f]' : 'text-[#0F1111] hover:text-[#c7511f]'}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </li>
          ))}
        </ul>

        <div className="border-t pt-3 mb-4">
          <h3 className="font-bold text-[13px] mb-2 text-[#0F1111]">Customer Reviews</h3>
          {[4, 3, 2, 1].map(star => (
            <div key={star} className="flex items-center gap-2 cursor-pointer hover:text-[#c7511f] py-0.5" onClick={() => { setMinRating(star); setCurrentPage(1); }}>
              <Rating value={star} size={14} /> <span className="text-[13px] text-[#007185]">& Up</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 mb-4">
          <h3 className="font-bold text-[13px] mb-2 text-[#0F1111]">Brand</h3>
          {availableBrands.map(brand => (
            <div key={brand} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="rounded text-[#e47911] focus:ring-[#e47911] w-4 h-4"
              />
              <span className="text-[13px] text-[#0F1111]">{brand}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 mb-4">
          <h3 className="font-bold text-[13px] mb-2 text-[#0F1111]">Price</h3>
          <div className="space-y-1 text-[13px]">
            {[
              { label: 'Under $25', max: 25 },
              { label: '$25 to $50', min: 25, max: 50 },
              { label: '$50 to $100', min: 50, max: 100 },
              { label: '$100 to $200', min: 100, max: 200 },
              { label: '$200 & Above', min: 200, max: 1000 },
            ].map((range, i) => (
              <div
                key={i}
                className="text-[#0F1111] hover:text-[#c7511f] cursor-pointer py-0.5"
                onClick={() => { setPriceRange([range.min || 0, range.max]); setCurrentPage(1); }}
              >
                {range.label}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[12px] text-[#565959]">$</span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              className="w-16 border rounded px-1.5 py-1 text-[12px] focus:outline-none focus:border-[#e47911]"
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
            />
            <span className="text-[12px] text-[#565959]">-</span>
            <span className="text-[12px] text-[#565959]">$</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              className="w-16 border rounded px-1.5 py-1 text-[12px] focus:outline-none focus:border-[#e47911]"
              onChange={(e) => { setPriceRange([priceRange[0], parseInt(e.target.value) || 1000]); setCurrentPage(1); }}
            />
            <button
              onClick={() => setCurrentPage(1)}
              className="bg-gray-100 hover:bg-gray-200 border rounded px-2 py-1 text-[12px]"
            >
              Go
            </button>
          </div>
        </div>

        <div className="border-t pt-3 mb-4">
          <h3 className="font-bold text-[13px] mb-2 text-[#0F1111]">Delivery</h3>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={primeOnly}
              onChange={(e) => { setPrimeOnly(e.target.checked); setCurrentPage(1); }}
              className="w-4 h-4"
            />
            <span className="text-[#00a8e1] font-bold italic text-[13px]">prime</span>
            <span className="text-[13px] text-[#0F1111]">FREE Delivery</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Breadcrumb */}
        <div className="text-[12px] text-[#007185] mb-2">
          <span className="hover:underline hover:text-[#c7511f] cursor-pointer" onClick={() => navigate('/')}>Xmazon.mock</span>
          <span className="text-[#565959] mx-1">›</span>
          {categoryParam ? (
            <span className="text-gray-700">{categoryParam}</span>
          ) : dealsParam ? (
            <span className="text-gray-700">Today's Deals</span>
          ) : (
            <span className="text-gray-700">Search results</span>
          )}
        </div>

        {/* Result count */}
        <div className="text-[14px] text-[#565959] mb-3">
          {filteredProducts.length > 0 ? (
            <span>
              <strong className="text-[#0F1111]">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</strong> of over <strong className="text-[#0F1111]">{filteredProducts.length}</strong> results
              {query && <span> for <strong className="text-[#c7511f]">"{query}"</strong></span>}
              {categoryParam && !query && <span> in <strong className="text-[#c7511f]">{categoryParam}</strong></span>}
            </span>
          ) : (
            <span>No results found{query && ` for "${query}"`}</span>
          )}
        </div>

        <div className="flex justify-between items-center mb-4 border-b border-[#e3e6e6] pb-2">
          <h1 className="font-bold text-[18px] text-[#0F1111]">
            {dealsParam ? "Today's Deals" : query ? `Results for "${query}"` : categoryParam || 'All Products'}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex bg-[#f0f2f2] rounded p-0.5 border border-[#d5d9d9]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm border border-[#d5d9d9]' : 'text-gray-500'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm border border-[#d5d9d9]' : 'text-gray-500'}`}
              >
                <List size={18} />
              </button>
            </div>

            <select
              className="border border-[#d5d9d9] rounded-lg p-1.5 text-[13px] bg-[#f0f2f2] shadow-sm focus:ring-[#e47911] focus:border-[#e47911]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Avg. Customer Review</option>
            </select>
          </div>
        </div>

        {currentProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No products found matching your criteria.
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8"
              : "flex flex-col gap-4 mb-8"
            }>
              {currentProducts.map(product => (
                <ProductCard key={product.id} product={product} layout={viewMode} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 py-4 border-t border-[#e3e6e6]">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 border border-[#d5d9d9] rounded-lg text-[13px] hover:bg-[#f7f8f8] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg border text-[13px] font-medium ${
                      currentPage === i + 1
                        ? 'bg-[#ffd814] border-[#fcd200] text-[#0F1111]'
                        : 'border-[#d5d9d9] hover:bg-[#f7f8f8] text-[#0F1111]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 border border-[#d5d9d9] rounded-lg text-[13px] hover:bg-[#f7f8f8] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};