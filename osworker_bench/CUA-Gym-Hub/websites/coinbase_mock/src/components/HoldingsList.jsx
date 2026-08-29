import React, { useContext } from 'react';
import { CoinbaseContext } from '../context/CoinbaseContext';
import HoldingRow from './HoldingRow';

function HoldingsList({ onNavigateToAsset }) {
  const { state } = useContext(CoinbaseContext);

  const holdingsWithAssets = state.holdings
    .map((holding) => {
      const asset = state.assets.find((a) => a.id === holding.assetId);
      if (!asset) return null;
      const currentValue = holding.quantity * asset.currentPrice;
      return { holding, asset, currentValue };
    })
    .filter(Boolean)
    .sort((a, b) => b.currentValue - a.currentValue);

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Your Assets</h2>
      </div>
      <div>
        {holdingsWithAssets.length > 0 ? (
          holdingsWithAssets.map(({ holding, asset }) => (
            <HoldingRow
              key={holding.assetId}
              asset={asset}
              holding={holding}
              onNavigate={onNavigateToAsset}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-400">
            You don't have any crypto holdings yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default HoldingsList;
