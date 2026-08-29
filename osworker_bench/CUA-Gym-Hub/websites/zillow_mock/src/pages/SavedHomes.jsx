import React from 'react';
import { useStore } from '../lib/store';
import PropertyCard from '../components/PropertyCard';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';

export default function SavedHomes() {
  const { state, updateFilters } = useStore();
  const navigate = useNavigate();
  
  const savedProperties = state.properties.filter(p => state.user.savedProperties.includes(p.id));
  const savedSearches = state.user.savedSearches || [];

  const viewSavedSearch = (search) => {
    updateFilters(search.filters);
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Activity</h1>
      
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="text-brand-500" /> Saved Searches & Alerts
        </h2>
        {savedSearches.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center text-gray-500">
                No saved searches yet.
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedSearches.map(search => (
                    <div key={search.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="font-bold text-lg mb-1">{search.name}</div>
                        <div className="text-sm text-gray-600 mb-3">
                            {search.filters.search || 'Any Location'} • {search.alertsEnabled ? 'Alerts On' : 'Alerts Off'}
                        </div>
                        <button onClick={() => viewSavedSearch(search)} className="text-brand-500 text-sm font-medium hover:underline">View Results</button>
                    </div>
                ))}
            </div>
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Saved Homes</h2>
      {savedProperties.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <h2 className="text-xl font-medium text-gray-700 mb-4">No saved homes yet</h2>
          <p className="text-gray-500 mb-6">Click the heart icon on any property to save it here.</p>
          <Link to="/" className="bg-brand-500 text-white px-6 py-2 rounded-lg hover:bg-brand-600 font-medium">
            Start Searching
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
