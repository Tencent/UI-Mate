import React, { useContext } from 'react';
import { Search, X } from 'lucide-react';
import { CoinbaseContext } from '../context/CoinbaseContext';

function SearchBar() {
  const { state, updateState } = useContext(CoinbaseContext);
  const query = state.ui.searchQuery || '';

  const handleChange = (e) => {
    updateState({
      ui: {
        ...state.ui,
        searchQuery: e.target.value,
      },
    });
  };

  const handleClear = () => {
    updateState({
      ui: {
        ...state.ui,
        searchQuery: '',
      },
    });
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search assets..."
        className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-colors"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
