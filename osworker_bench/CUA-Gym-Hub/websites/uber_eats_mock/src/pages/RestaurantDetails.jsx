
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Clock, Info, ChevronRight, User, ThumbsUp } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../lib/utils';
import ItemModal from '../components/ItemModal';

export default function RestaurantDetails() {
  const { id } = useParams();
  const { state, addToCart } = useStore();
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Popular');

  const restaurant = state.restaurants.find(r => r.id === id);
  const menuItems = state.menuItems.filter(i => i.restaurantId === id);

  // Group items by category
  const menuByCategory = useMemo(() => {
    const grouped = {};
    menuItems.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });
    return grouped;
  }, [menuItems]);

  // Mock Reviews Data
  const [reviews, setReviews] = useState([
    { id: 1, user: 'Alex M.', rating: 5, date: '2 days ago', text: 'Absolutely delicious! The delivery was super fast too.', likes: 12 },
    { id: 2, user: 'Sarah K.', rating: 4, date: '1 week ago', text: 'Great food, but the portion size was a bit small for the price.', likes: 3 },
    { id: 3, user: 'Mike R.', rating: 5, date: '2 weeks ago', text: 'Best in town. Highly recommend the special!', likes: 8 },
    { id: 4, user: 'Emily J.', rating: 3, date: '3 weeks ago', text: 'Food was cold when it arrived.', likes: 1 },
  ]);

  if (!restaurant) return <div className="p-8">Restaurant not found</div>;

  const categories = [...Object.keys(menuByCategory), 'Reviews'];

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 md:h-80">
        <img src={restaurant.image} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 sm:p-8 text-white">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{restaurant.name}</h1>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="bg-white text-black px-2 py-1 rounded-full flex items-center gap-1">
              {restaurant.rating} <Star className="w-3 h-3 fill-black" />
            </span>
            <span>{restaurant.cuisine}</span>
            <span>•</span>
            <span>{restaurant.deliveryTime}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 px-4 py-8">
        {/* Sidebar Categories (Desktop) */}
        <div className="hidden md:block w-64 shrink-0 sticky top-24 h-fit">
          <h3 className="font-bold text-lg mb-4">Menu</h3>
          <ul className="space-y-2">
            {categories.map(cat => (
              <li key={cat}>
                <button 
                  onClick={() => {
                    setActiveCategory(cat);
                    document.getElementById(`cat-${cat}`).scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-sm w-full text-left py-2 px-4 rounded-lg transition-colors ${
                    activeCategory === cat ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Menu Content */}
        <div className="flex-1 space-y-10">
           {/* Mobile Categories */}
           <div className="md:hidden flex gap-2 overflow-x-auto pb-4 sticky top-16 bg-white z-20 py-2 -mx-4 px-4 border-b border-gray-100 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    document.getElementById(`cat-${cat}`).scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                    activeCategory === cat ? 'bg-black text-white' : 'bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>

          {Object.entries(menuByCategory).map(([category, items]) => (
            <div key={category} id={`cat-${category}`} className="scroll-mt-28">
              <h2 className="text-2xl font-bold mb-6">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    className="border border-gray-200 rounded-xl p-4 flex justify-between gap-4 cursor-pointer hover:border-gray-400 transition-colors h-full"
                  >
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-bold mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="mt-2 font-medium">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                    <div className="w-28 h-28 shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                       <img src={item.image} className="w-full h-full object-cover" />
                       {item.dietary.length > 0 && (
                         <div className="absolute bottom-1 right-1 bg-white/90 px-1 rounded text-[10px] font-bold text-green-700">
                           {item.dietary[0]}
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Reviews Section */}
          <div id="cat-Reviews" className="scroll-mt-28 pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>
            <div className="grid gap-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{review.user}</p>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex bg-gray-100 px-2 py-1 rounded-full text-xs font-bold items-center gap-1">
                      {review.rating} <Star className="w-3 h-3 fill-black" />
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">{review.text}</p>
                  <button
                    onClick={() => setReviews(current => current.map(item => item.id === review.id ? { ...item, likes: item.likes + 1 } : item))}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-black"
                  >
                    <ThumbsUp className="w-3 h-3" /> Helpful ({review.likes})
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ItemModal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
}
  
