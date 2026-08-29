import React from 'react';
import { X } from 'lucide-react';
import { useStore } from '../lib/store';

export default function AwardModal({ isOpen, onClose, onSelect }) {
  const { state } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Give an Award</h3>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {state.awards.map(award => (
            <button 
              key={award.id}
              onClick={() => onSelect(award.id)}
              className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors"
            >
              <div className="text-4xl mb-2">{award.icon}</div>
              <div className="font-bold text-sm text-gray-900">{award.name}</div>
              <div className="text-xs text-gray-500">{award.cost} coins</div>
            </button>
          ))}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-center text-gray-500">
          Mock coins balance: ∞
        </div>
      </div>
    </div>
  );
}