import React, { useContext, useState, useEffect } from 'react';
import { CoinbaseContext } from '../context/CoinbaseContext';
import { X } from 'lucide-react';
import TradeForm from './TradeForm';
import TradeConfirmation from './TradeConfirmation';

function TradeModal() {
  const { state, updateState } = useContext(CoinbaseContext);
  const { isOpen, mode, assetId } = state.ui.tradeModal;
  const [step, setStep] = useState('form'); // 'form' | 'confirm'
  const [orderData, setOrderData] = useState(null);

  // Reset to form step whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setOrderData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    updateState({
      ui: {
        ...state.ui,
        tradeModal: { isOpen: false, mode: 'buy', assetId: null },
      },
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handlePreview = (order) => {
    setOrderData(order);
    setStep('confirm');
  };

  const handleBack = () => {
    setStep('form');
    setOrderData(null);
  };

  const handleComplete = () => {
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>

        {step === 'form' && (
          <TradeForm
            onPreview={handlePreview}
            initialMode={mode}
            initialAssetId={assetId}
          />
        )}
        {step === 'confirm' && orderData && (
          <TradeConfirmation
            order={orderData}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}

export default TradeModal;
