import React, { useContext, useState, useEffect } from 'react';
import { CoinbaseContext } from '../context/CoinbaseContext';
import { X, Send, Download, Copy, Check, ChevronDown } from 'lucide-react';

const MOCK_WALLET_ADDRESS = '0x1a2b3c4d5e6f7890abcdef1234567890abcd3c4d';
const FEE_RATE = 0.0149;

function SendReceiveModal() {
  const { state, updateState, sendAsset: sendAssetAction } = useContext(CoinbaseContext);
  const { isOpen, mode: initialMode, assetId: initialAssetId } = state.ui.sendReceiveModal;
  const [activeTab, setActiveTab] = useState(initialMode || 'send');
  const [copied, setCopied] = useState(false);

  // Send form state
  const [sendAssetId, setSendAssetId] = useState(initialAssetId || '');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendError, setSendError] = useState('');
  const [sendStep, setSendStep] = useState('form'); // 'form' | 'preview' | 'success'

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode || 'send');
      setSendAssetId(initialAssetId || (state.holdings[0]?.assetId || ''));
      setRecipientAddress('');
      setSendAmount('');
      setSendError('');
      setSendStep('form');
      setCopied(false);
    }
  }, [isOpen, initialMode, initialAssetId]);

  if (!isOpen) return null;

  const handleClose = () => {
    updateState({
      ui: {
        ...state.ui,
        sendReceiveModal: { isOpen: false, mode: 'send', assetId: null },
      },
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const sendAsset = state.assets.find((a) => a.id === sendAssetId);
  const sendHolding = state.holdings.find((h) => h.assetId === sendAssetId);
  const sendAmountNum = parseFloat(sendAmount) || 0;

  const formatCurrency = (val) => {
    return val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatQuantity = (qty) => {
    if (qty >= 1) return qty.toLocaleString('en-US', { maximumFractionDigits: 6 });
    return qty.toLocaleString('en-US', { maximumFractionDigits: 8 });
  };

  const handleSendPreview = () => {
    setSendError('');
    if (!sendAsset) {
      setSendError('Please select an asset.');
      return;
    }
    if (!recipientAddress.trim()) {
      setSendError('Please enter a recipient address.');
      return;
    }
    if (sendAmountNum <= 0) {
      setSendError('Please enter a valid amount.');
      return;
    }
    if (!sendHolding || sendAmountNum > sendHolding.quantity) {
      setSendError('Insufficient balance.');
      return;
    }
    setSendStep('preview');
  };

  const handleSendConfirm = () => {
    sendAssetAction(sendAsset.id, sendAmountNum, recipientAddress);
    setSendStep('success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_WALLET_ADDRESS).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const holdingsAssets = state.holdings
    .filter((h) => h.quantity > 0.00000001)
    .map((h) => {
      const asset = state.assets.find((a) => a.id === h.assetId);
      return asset ? { ...asset, quantity: h.quantity } : null;
    })
    .filter(Boolean);

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

        {/* Tab header */}
        <div className="flex border-b border-gray-200 px-6 pt-6">
          <button
            onClick={() => { setActiveTab('send'); setSendStep('form'); }}
            className={`flex-1 pb-3 font-semibold text-sm transition-colors relative flex items-center justify-center gap-1.5 ${
              activeTab === 'send' ? 'text-[#0052FF]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send size={14} />
            Send
            {activeTab === 'send' && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#0052FF]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('receive')}
            className={`flex-1 pb-3 font-semibold text-sm transition-colors relative flex items-center justify-center gap-1.5 ${
              activeTab === 'receive' ? 'text-[#0052FF]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Download size={14} />
            Receive
            {activeTab === 'receive' && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#0052FF]" />
            )}
          </button>
        </div>

        {/* Send tab */}
        {activeTab === 'send' && (
          <div className="p-6">
            {sendStep === 'form' && (
              <>
                {/* Asset selector */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Asset</label>
                  <div className="relative">
                    <select
                      value={sendAssetId}
                      onChange={(e) => { setSendAssetId(e.target.value); setSendError(''); }}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg p-3 pr-10 text-sm font-medium text-gray-900 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] focus:outline-none"
                    >
                      {holdingsAssets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.symbol}) - {formatQuantity(a.quantity)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Recipient address */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Recipient Address</label>
                  <input
                    type="text"
                    placeholder="Enter wallet address"
                    value={recipientAddress}
                    onChange={(e) => { setRecipientAddress(e.target.value); setSendError(''); }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-medium text-gray-900 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] focus:outline-none"
                  />
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Amount ({sendAsset ? sendAsset.symbol : ''})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={sendAmount}
                    onChange={(e) => { setSendAmount(e.target.value); setSendError(''); }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-medium text-gray-900 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] focus:outline-none"
                  />
                  {sendHolding && sendAsset && (
                    <div className="mt-1.5 text-xs text-gray-500">
                      Available: {formatQuantity(sendHolding.quantity)} {sendAsset.symbol}
                    </div>
                  )}
                </div>

                {sendError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#CF202F] font-medium">
                    {sendError}
                  </div>
                )}

                <button
                  onClick={handleSendPreview}
                  className="w-full py-3 rounded-full font-semibold text-sm text-white bg-[#0052FF] hover:bg-[#003ECB] transition-colors"
                >
                  Preview Send
                </button>
              </>
            )}

            {sendStep === 'preview' && sendAsset && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Send</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Asset</span>
                    <span className="font-medium text-gray-900">{sendAsset.name} ({sendAsset.symbol})</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium text-gray-900">
                      {formatQuantity(sendAmountNum)} {sendAsset.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Value</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(sendAmountNum * sendAsset.currentPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">To</span>
                    <span className="font-medium text-gray-900 truncate ml-4 max-w-[180px]">
                      {recipientAddress}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Network fee</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(sendAmountNum * sendAsset.currentPrice * FEE_RATE)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSendStep('form')}
                    className="flex-1 py-3 rounded-full font-semibold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendConfirm}
                    className="flex-1 py-3 rounded-full font-semibold text-sm text-white bg-[#0052FF] hover:bg-[#003ECB] transition-colors"
                  >
                    Confirm Send
                  </button>
                </div>
              </>
            )}

            {sendStep === 'success' && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#05B169] flex items-center justify-center mb-4 animate-bounce">
                  <Check size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Sent Successfully</h3>
                <p className="text-sm text-gray-500 mb-6 text-center">
                  {formatQuantity(sendAmountNum)} {sendAsset?.symbol} sent to {recipientAddress.slice(0, 10)}...
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-full font-semibold text-sm text-white bg-[#0052FF] hover:bg-[#003ECB] transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* Receive tab */}
        {activeTab === 'receive' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Receive Crypto</h3>
            <p className="text-sm text-gray-500 mb-6">
              Share your wallet address to receive cryptocurrency.
            </p>

            {/* QR Code placeholder */}
            <div className="w-48 h-48 mx-auto mb-6 border-2 border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50">
              <div className="grid grid-cols-5 gap-0.5 mb-3">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm ${
                      [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24].includes(i)
                        ? 'bg-gray-800'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">QR Code</span>
            </div>

            {/* Wallet address */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Your Wallet Address</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-gray-700 break-all font-mono bg-white rounded px-2 py-1.5 border border-gray-200">
                  {MOCK_WALLET_ADDRESS}
                </code>
                <button
                  onClick={handleCopy}
                  className={`shrink-0 p-2 rounded-lg transition-colors ${
                    copied ? 'bg-[#05B169] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {copied && (
              <p className="text-center text-xs text-[#05B169] font-medium">
                Address copied to clipboard!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SendReceiveModal;
