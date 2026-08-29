import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Minus, Search, X, ChevronRight } from 'lucide-react';
import ProductModal from '../components/ProductModal';

export default function ProductBrowser() {
  const { storeId } = useParams();
  const [searchParams] = useSearchParams();
  const { state, dispatch, ACTION_TYPES } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const store = state.stores.find(s => s.id === storeId);
  
  if (!store) return <div className="p-8 text-center">Store not found</div>;

  const filteredProducts = useMemo(() => {
    return state.products.filter(p => {
      const matchesStore = p.storeId === storeId;
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStore && matchesCategory && matchesSearch;
    });
  }, [state.products, storeId, selectedCategory, searchQuery]);

  const getCartQuantity = (productId) => {
    const item = state.cart.find(i => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const handleUpdateQuantity = (e, product, delta) => {
    e.stopPropagation();
    const currentQty = getCartQuantity(product.id);
    const newQty = currentQty + delta;
    
    if (newQty <= 0) {
      dispatch({ type: ACTION_TYPES.REMOVE_FROM_CART, payload: product.id });
    } else if (currentQty === 0 && delta > 0) {
      // First add, default sub preference
      dispatch({ 
        type: ACTION_TYPES.ADD_TO_CART, 
        payload: { 
          productId: product.id, 
          quantity: 1,
          subPreference: 'best_match',
          subProductId: null,
          storeId: store.id
        } 
      });
    } else {
      dispatch({ 
        type: ACTION_TYPES.UPDATE_CART_ITEM, 
        payload: { productId: product.id, quantity: newQty } 
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
      {/* Sidebar Categories */}
      <aside className="w-full md:w-64 flex-shrink-0 overflow-y-auto hide-scrollbar pb-20 md:pb-0">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-0">
          <h2 className="font-bold text-gray-900 mb-4 px-2">Categories</h2>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              All Products
            </button>
            {state.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${selectedCategory === cat.id ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span>{cat.name}</span>
                {selectedCategory === cat.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="mb-6 flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{store.name}</h1>
            <p className="text-xs text-green-600 font-medium">{store.hours}</p>
          </div>
          <div className="ml-auto flex-1 max-w-md relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
             <input 
                type="text"
                placeholder="Search in store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-primary outline-none"
             />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => {
            const qty = getCartQuantity(product.id);
            return (
              <div 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
              >
                <div className="relative aspect-square mb-3">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain rounded-lg" />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">Out of Stock</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-lg">${product.price}</div>
                  <h3 className="text-sm text-gray-700 font-medium line-clamp-2 leading-snug mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{product.unit}</p>
                </div>

                <div className="mt-auto">
                  {qty === 0 ? (
                    <button 
                      onClick={(e) => handleUpdateQuantity(e, product, 1)}
                      disabled={!product.inStock}
                      className="w-full py-2 bg-primary text-white rounded-full font-bold text-sm hover:bg-primaryDark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-primary text-white rounded-full px-1 py-1">
                      <button 
                        onClick={(e) => handleUpdateQuantity(e, product, -1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-primaryDark rounded-full"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-sm">{qty}</span>
                      <button 
                        onClick={(e) => handleUpdateQuantity(e, product, 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-primaryDark rounded-full"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          storeId={storeId}
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
