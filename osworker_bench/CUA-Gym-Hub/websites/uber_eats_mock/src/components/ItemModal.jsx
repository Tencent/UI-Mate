
    import React, { useEffect, useState } from 'react';
    import { X, Minus, Plus } from 'lucide-react';
    import { formatCurrency } from '../lib/utils';

    export default function ItemModal({ item, isOpen, onClose, onAddToCart }) {
      const [quantity, setQuantity] = useState(1);
      const [modifiers, setModifiers] = useState({});
      const [instructions, setInstructions] = useState('');
      const [validationMessage, setValidationMessage] = useState('');

      useEffect(() => {
        if (!isOpen) return undefined;

        setQuantity(1);
        setModifiers({});
        setInstructions('');
        setValidationMessage('');

        const handleKeyDown = (event) => {
          if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [isOpen, item?.id, onClose]);

      if (!isOpen || !item) return null;

      const handleModifierChange = (modId, option, type) => {
        setModifiers(prev => {
          if (type === 'radio') {
            return { ...prev, [modId]: option };
          } else {
            const current = Array.isArray(prev[modId]) ? prev[modId] : [];
            const exists = current.some(selected => selected.name === option.name);
            return {
              ...prev,
              [modId]: exists
                ? current.filter(selected => selected.name !== option.name)
                : [...current, option]
            };
          }
        });
        setValidationMessage('');
      };

      const calculateTotal = () => {
        const modTotal = Object.values(modifiers).flatMap(mod => Array.isArray(mod) ? mod : [mod]).reduce((sum, mod) => sum + (mod.price || 0), 0);
        return (item.price + modTotal) * quantity;
      };

      const handleSubmit = () => {
        // Validation: Check required modifiers
        const missingRequired = item.modifiers.filter(m => m.required && !modifiers[m.id]);
        if (missingRequired.length > 0) {
          setValidationMessage(`Please select: ${missingRequired.map(m => m.name).join(', ')}`);
          return;
        }
        onAddToCart(item, quantity, modifiers, instructions);
        onClose();
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(event) => event.stopPropagation()}>
            {/* Header Image */}
            <div className="relative h-48 sm:h-64 shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-3xl font-bold mb-2">{item.name}</h2>
              <p className="text-gray-500 mb-6">{item.description}</p>
              
              {/* Modifiers */}
              <div className="space-y-8">
                {item.modifiers.map(mod => (
                  <div key={mod.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-bold text-lg">{mod.name}</h3>
                      {mod.required && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-bold h-fit">Required</span>}
                    </div>
                    
                    <div className="space-y-3">
                      {mod.options.map((opt, idx) => (
                        <label key={idx} className="flex items-center justify-between cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <input 
                              type={mod.type} 
                              name={mod.id}
                              className="w-5 h-5 accent-primary"
                              onChange={() => handleModifierChange(mod.id, opt, mod.type)}
                              checked={mod.type === 'checkbox'
                                ? (Array.isArray(modifiers[mod.id]) && modifiers[mod.id].some(selected => selected.name === opt.name))
                                : modifiers[mod.id]?.name === opt.name}
                            />
                            <span className="text-gray-700 group-hover:text-black">{opt.name}</span>
                          </div>
                          {opt.price > 0 && (
                            <span className="text-gray-500">+{formatCurrency(opt.price)}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Special Instructions */}
                <div>
                  <h3 className="font-bold text-lg mb-2">Special Instructions</h3>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                    rows="3"
                    placeholder="Add a note for the kitchen..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white shrink-0 space-y-3">
              {validationMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {validationMessage}
                </div>
              )}
              <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="disabled:opacity-30 hover:text-primary"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="font-medium text-lg min-w-[20px] text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="hover:text-primary"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <button 
                onClick={handleSubmit}
                className="flex-1 bg-primary text-white font-bold text-lg py-3 rounded-lg hover:bg-green-600 transition-colors flex justify-between px-6"
              >
                <span>Add to order</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  
