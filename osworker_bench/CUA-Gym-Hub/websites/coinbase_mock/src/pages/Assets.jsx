import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoinbaseContext } from '../context/CoinbaseContext';
import SearchBar from '../components/SearchBar';
import AssetTable from '../components/AssetTable';

function Assets() {
  const { state, updateState } = useContext(CoinbaseContext);
  const navigate = useNavigate();

  const handleNavigateToAsset = (assetId) => {
    updateState({ ui: { ...state.ui, selectedAsset: assetId, currentView: 'asset' } });
    navigate(`/asset/${assetId}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">All Assets</h2>
        <SearchBar />
      </div>
      <AssetTable onNavigateToAsset={handleNavigateToAsset} />
    </div>
  );
}

export default Assets;
