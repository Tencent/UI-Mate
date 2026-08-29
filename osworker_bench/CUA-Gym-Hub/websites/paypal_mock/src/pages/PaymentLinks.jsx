
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../lib/utils';
import { Link as LinkIcon, Copy, Check, Plus } from 'lucide-react';

export default function PaymentLinks() {
  const { state, createPaymentLink, togglePaymentLink } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  // Mock existing links if not in state
  const links = state.paymentLinks || [];

  const handleCreate = (e) => {
    e.preventDefault();
    const newLink = createPaymentLink({
      amount: amount ? parseFloat(amount) : null,
      description: description || 'Payment Request',
    });
    
    setGeneratedLink(newLink);
    setIsCreating(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payment Links</h1>
        <button 
          onClick={() => {
            setIsCreating(true);
            setGeneratedLink(null);
            setAmount('');
            setDescription('');
          }}
          className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-full font-medium hover:bg-brand-dark transition-colors"
        >
          <Plus className="h-4 w-4" /> Create New Link
        </button>
      </div>

      {isCreating ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-6">Create Payment Link</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product or Service Name</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Consulting Services"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Optional)</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Leave empty for any amount"
              />
              <p className="text-xs text-gray-500 mt-1">If left empty, the customer can enter the amount.</p>
            </div>
            
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-2 bg-brand text-white rounded-full font-medium hover:bg-brand-dark"
              >
                Generate Link
              </button>
            </div>
          </form>
        </div>
      ) : generatedLink ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Created!</h2>
          <p className="text-gray-600 mb-6">Share this link to get paid.</p>
          
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6">
            <input 
              type="text" 
              readOnly 
              value={generatedLink.url}
              className="flex-1 bg-transparent border-none outline-none text-gray-600"
            />
            <button 
              onClick={() => copyToClipboard(generatedLink.url)}
              className="p-2 hover:bg-gray-200 rounded-md transition-colors"
            >
              {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-500" />}
            </button>
          </div>
          
          <button 
            onClick={() => setGeneratedLink(null)}
            className="text-brand font-medium hover:underline"
          >
            Create another link
          </button>
        </div>
      ) : links.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {links.map(link => (
              <div key={link.id} className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{link.description}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${link.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {link.active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{link.amount ? formatCurrency(link.amount) : 'Customer enters amount'}</p>
                  <p className="mt-1 text-xs text-gray-400">{link.url}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copyToClipboard(link.url)} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-bold hover:bg-gray-50">
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={() => togglePaymentLink(link.id)} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold hover:bg-gray-200">
                    {link.active ? 'Pause' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          <LinkIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-900">No active payment links</p>
          <p className="mb-6">Create a link to share via email, text, or social media.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-brand text-white px-6 py-2 rounded-full font-medium hover:bg-brand-dark transition-colors"
          >
            Create your first link
          </button>
        </div>
      )}
    </div>
  );
}
  
