import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Clock, MapPin, Heart, ChevronRight, Info, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/dataManager';
import ItemModal from '../components/ItemModal';
import './StorePage.css';

const STORE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
  '#D7BDE2', '#AED6F1', '#F9E79F', '#A3E4D7', '#F5B7B1', '#ABEBC6'
];

const ITEM_COLORS = [
  '#FFE4E1', '#E0F7FA', '#F0FFF0', '#FFF8E1', '#F3E5F5',
  '#FDE2E4', '#E8F5E9', '#FFF3E0', '#E1F5FE', '#FCE4EC',
  '#F3E5F5', '#E0F2F1', '#FFFDE7', '#E8EAF6', '#FBE9E7', '#E0F7FA'
];

function getStoreColor(id) {
  const idx = parseInt(id.replace(/\D/g, ''), 10) || 0;
  return STORE_COLORS[idx % STORE_COLORS.length];
}

function getItemColor(id) {
  const idx = parseInt(id.replace(/\D/g, ''), 10) || 0;
  return ITEM_COLORS[idx % ITEM_COLORS.length];
}

function getItemEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes('pizza')) return '🍕';
  if (n.includes('burger') || n.includes('cheeseburger')) return '🍔';
  if (n.includes('taco')) return '🌮';
  if (n.includes('burrito')) return '🌯';
  if (n.includes('sushi') || n.includes('roll') || n.includes('sashimi')) return '🍣';
  if (n.includes('ramen') || n.includes('pho') || n.includes('noodle') || n.includes('pad thai') || n.includes('chow mein')) return '🍜';
  if (n.includes('curry') || n.includes('tikka') || n.includes('biryani')) return '🍛';
  if (n.includes('steak') || n.includes('ribeye') || n.includes('filet')) return '🥩';
  if (n.includes('chicken') && (n.includes('fried') || n.includes('wing'))) return '🍗';
  if (n.includes('salad') || n.includes('kale') || n.includes('bowl') && n.includes('quinoa')) return '🥗';
  if (n.includes('sandwich') || n.includes('banh mi')) return '🥪';
  if (n.includes('dumpling') || n.includes('spring roll') || n.includes('rangoon')) return '🥟';
  if (n.includes('cake') || n.includes('cheesecake') || n.includes('tiramisu')) return '🍰';
  if (n.includes('cookie')) return '🍪';
  if (n.includes('croissant') || n.includes('muffin') || n.includes('pastry')) return '🥐';
  if (n.includes('pancake') || n.includes('waffle') || n.includes('breakfast')) return '🥞';
  if (n.includes('egg') || n.includes('toast') && n.includes('avocado')) return '🍳';
  if (n.includes('smoothie') || n.includes('juice')) return '🥤';
  if (n.includes('coffee') || n.includes('latte') || n.includes('matcha')) return '☕';
  if (n.includes('milkshake')) return '🥛';
  if (n.includes('fries') || n.includes('onion ring')) return '🍟';
  if (n.includes('soup') || n.includes('tom yum')) return '🍲';
  if (n.includes('kebab') || n.includes('shawarma') || n.includes('bbq') || n.includes('rib')) return '🍖';
  if (n.includes('falafel') || n.includes('hummus') || n.includes('wrap') || n.includes('pita')) return '🥙';
  if (n.includes('acai') || n.includes('poke')) return '🥣';
  if (n.includes('bibimbap') || n.includes('rice')) return '🍚';
  if (n.includes('fish') || n.includes('branzino')) return '🐟';
  if (n.includes('pie')) return '🥧';
  if (n.includes('samosa')) return '🥟';
  if (n.includes('guacamole') || n.includes('chip')) return '🫔';
  if (n.includes('edamame')) return '🫘';
  if (n.includes('quesadilla')) return '🧀';
  if (n.includes('horchata') || n.includes('drink') || n.includes('lemonade')) return '🥤';
  if (n.includes('naan') || n.includes('bread')) return '🫓';
  return '🍽️';
}

export default function StorePage() {
  const { id } = useParams();
  const { state, toggleFavorite, addToCart } = useApp();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [storeSearch, setStoreSearch] = useState('');

  const restaurant = state.restaurants.find(r => r.id === id);
  const menuItems = state.menuItems.filter(m => {
    if (m.restaurantId !== id || !m.isAvailable) return false;
    const term = storeSearch.trim().toLowerCase();
    if (!term) return true;
    return (
      m.name.toLowerCase().includes(term) ||
      m.description.toLowerCase().includes(term) ||
      m.category.toLowerCase().includes(term) ||
      (m.dietaryTags || []).some(tag => tag.toLowerCase().includes(term))
    );
  });
  const reviews = state.reviews.filter(r => r.restaurantId === id);
  const isFav = state.user.favoriteRestaurantIds.includes(id);

  const menuByCategory = useMemo(() => {
    const grouped = {};
    menuItems.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });
    return grouped;
  }, [menuItems]);

  const categories = Object.keys(menuByCategory);

  if (!restaurant) {
    return (
      <div className="store-not-found">
        <h2>Restaurant not found</h2>
        <Link to="/" className="store-not-found__link">Back to home</Link>
      </div>
    );
  }

  const handleAddToCart = (item, quantity, options, instructions) => {
    addToCart(item, restaurant, quantity, options, instructions);
    setSelectedItem(null);
  };

  return (
    <div className="store-page">
      {/* Banner */}
      <div className="store-banner" style={{ background: getStoreColor(restaurant.id) }}>
        <div className="store-banner__overlay">
          <div className="store-banner__content">
            <h1 className="store-banner__name">{restaurant.name}</h1>
          </div>
          <button
            className={`store-banner__fav ${isFav ? 'store-banner__fav--active' : ''}`}
            onClick={() => toggleFavorite(restaurant.id)}
          >
            <Heart size={20} fill={isFav ? '#000' : 'none'} />
          </button>
        </div>
      </div>

      {/* Restaurant Info Bar */}
      <div className="store-info-bar">
        <div className="store-info-bar__left">
          <div className="store-info-bar__avatar" style={{ background: getStoreColor(restaurant.id) }}>
            {restaurant.name.charAt(0)}
          </div>
          <div>
            <h2 className="store-info-bar__name">{restaurant.name}</h2>
            <div className="store-info-bar__meta">
              <span className="store-info-bar__rating">
                <Star size={14} fill="#000" stroke="#000" /> {restaurant.rating}
              </span>
              <span className="store-info-bar__reviews">({restaurant.reviewCount}+)</span>
              <span className="store-info-bar__bullet">&bull;</span>
              <span>{restaurant.cuisineType.join(' &bull; ')}</span>
              <span className="store-info-bar__bullet">&bull;</span>
              <span>{restaurant.priceRange}</span>
            </div>
            <div className="store-info-bar__address">{restaurant.address}</div>
          </div>
        </div>
        <div className="store-info-bar__right">
          <div className="store-info-bar__stat">
            <span className="store-info-bar__stat-label">Delivery Fee</span>
            <span className="store-info-bar__stat-value">
              {restaurant.deliveryFee === 0 ? '$0' : formatCurrency(restaurant.deliveryFee)}
            </span>
          </div>
          <div className="store-info-bar__stat">
            <span className="store-info-bar__stat-label">Earliest arrival</span>
            <span className="store-info-bar__stat-value">{restaurant.deliveryTimeMin} min</span>
          </div>
        </div>
      </div>

      {/* Search in store */}
      <form
        className="store-search-wrap"
        onSubmit={(e) => e.preventDefault()}
        role="search"
        aria-label={`Search ${restaurant.name} menu`}
      >
        <label className="store-search">
          <Search size={16} />
          <input
            className="store-search__input"
            value={storeSearch}
            onChange={(e) => setStoreSearch(e.target.value)}
            placeholder={`Search in ${restaurant.name}`}
          />
        </label>
      </form>

      {/* Category Nav */}
      <nav className="store-categories scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            className={`store-categories__btn ${activeCategory === cat ? 'store-categories__btn--active' : ''}`}
            onClick={() => {
              setActiveCategory(cat);
              document.getElementById(`section-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Menu */}
      <div className="store-menu">
        {storeSearch.trim() && menuItems.length === 0 && (
          <div className="store-menu__empty">
            No matching menu items for "{storeSearch.trim()}". Try a dish, category, or dietary tag.
          </div>
        )}
        {categories.map(cat => (
          <section key={cat} id={`section-${cat}`} className="store-menu__section">
            <h2 className="store-menu__section-title">{cat}</h2>
            <div className="store-menu__grid">
              {menuByCategory[cat].map(item => (
                <button key={item.id} className="menu-item" onClick={() => setSelectedItem(item)}>
                  <div className="menu-item__info">
                    <h3 className="menu-item__name">{item.name}</h3>
                    <p className="menu-item__desc line-clamp-2">{item.description}</p>
                    <div className="menu-item__bottom">
                      <span className="menu-item__price">{formatCurrency(item.price)}</span>
                      {item.isPopular && <span className="menu-item__popular">Popular</span>}
                      {item.dietaryTags && item.dietaryTags.length > 0 && (
                        <span className="menu-item__dietary">{item.dietaryTags[0]}</span>
                      )}
                    </div>
                  </div>
                  <div className="menu-item__image" style={{ background: getItemColor(item.id) }}>
                    <span className="menu-item__image-emoji">{getItemEmoji(item.name)}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="store-reviews">
            <h2 className="store-menu__section-title">Reviews</h2>
            <div className="store-reviews__list">
              {reviews.map(rev => (
                <div key={rev.id} className="store-review">
                  <div className="store-review__header">
                    <div className="store-review__avatar">{rev.userName.charAt(0)}</div>
                    <div>
                      <div className="store-review__name">{rev.userName}</div>
                      <div className="store-review__meta">
                        <span className="store-review__stars">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                        <span className="store-review__date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p className="store-review__text">{rev.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Item Modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          restaurant={restaurant}
          onClose={() => setSelectedItem(null)}
          onAdd={handleAddToCart}
        />
      )}
    </div>
  );
}
