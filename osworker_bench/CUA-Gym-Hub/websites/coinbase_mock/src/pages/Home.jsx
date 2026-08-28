import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoinbaseContext } from '../context/CoinbaseContext';
import PortfolioSummary from '../components/PortfolioSummary';
import PortfolioChart from '../components/PortfolioChart';
import HoldingsList from '../components/HoldingsList';
import WatchlistWidget from '../components/WatchlistWidget';
import TransactionList from '../components/TransactionList';
import { ArrowUpRight, ArrowDownLeft, ArrowRight } from 'lucide-react';

function Home() {
  const { updateState, state } = useContext(CoinbaseContext);
  const navigate = useNavigate();

  const handleNavigateToAsset = (assetId) => {
    updateState({ ui: { ...state.ui, selectedAsset: assetId, currentView: 'asset' } });
    navigate(`/asset/${assetId}`);
  };

  const handleViewAllAssets = () => {
    updateState({ ui: { ...state.ui, currentView: 'assets' } });
    navigate('/assets');
  };

  const handleOpenBuy = () => {
    updateState({
      ui: {
        ...state.ui,
        tradeModal: { isOpen: true, mode: 'buy', assetId: state.assets[0]?.id || null },
      },
    });
  };

  const handleOpenSell = () => {
    updateState({
      ui: {
        ...state.ui,
        tradeModal: { isOpen: true, mode: 'sell', assetId: state.holdings[0]?.assetId || null },
      },
    });
  };

  const handleOpenSend = () => {
    updateState({
      ui: {
        ...state.ui,
        sendReceiveModal: { isOpen: true, mode: 'send', assetId: null },
      },
    });
  };

  const handleOpenReceive = () => {
    updateState({
      ui: {
        ...state.ui,
        sendReceiveModal: { isOpen: true, mode: 'receive', assetId: null },
      },
    });
  };

  const handleViewAllHistory = () => {
    updateState({ ui: { ...state.ui, currentView: 'history' } });
    navigate('/history');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PortfolioSummary />
      <PortfolioChart />

      {/* Quick action buttons */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={handleOpenBuy}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#0052FF]/8 hover:bg-[#0052FF]/15 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[#0052FF] flex items-center justify-center group-hover:bg-[#003ECB] transition-colors">
              <ArrowDownLeft size={18} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-[#0052FF]">Buy</span>
          </button>
          <button
            onClick={handleOpenSell}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
              <ArrowUpRight size={18} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Sell</span>
          </button>
          <button
            onClick={handleOpenSend}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
              <ArrowUpRight size={18} className="text-white rotate-45" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Send</span>
          </button>
          <button
            onClick={handleOpenReceive}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
              <ArrowDownLeft size={18} className="text-white rotate-45" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Receive</span>
          </button>
        </div>
      </div>

      <HoldingsList onNavigateToAsset={handleNavigateToAsset} />
      <WatchlistWidget
        onNavigateToAsset={handleNavigateToAsset}
        onViewAll={handleViewAllAssets}
      />

      {/* Transaction list with View All link */}
      <div>
        <TransactionList limit={3} />
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleViewAllHistory}
            className="flex items-center gap-1 text-sm text-[#0052FF] font-medium hover:underline"
          >
            View all transactions
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
