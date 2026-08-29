import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './RestaurantCard.css';

const FOOD_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
  '#D7BDE2', '#AED6F1', '#F9E79F', '#A3E4D7', '#F5B7B1', '#ABEBC6'
];

const FOOD_EMOJIS = {
  italian: '🍕', pizza: '🍕', japanese: '🍣', sushi: '🍣',
  american: '🍔', burgers: '🍔', mexican: '🌮', tacos: '🌮',
  chinese: '🥡', indian: '🍛', healthy: '🥗', salads: '🥗',
  dessert: '🍰', bakery: '🍰', vietnamese: '🍜', pho: '🍜',
  mediterranean: '🥙', korean: '🍖', thai: '🍜', bbq: '🍖',
  breakfast: '🥞', brunch: '🥞', coffee: '☕', steakhouse: '🥩',
};

function getCardColor(id) {
  const idx = parseInt(String(id).replace(/\D/g, ''), 10) || 0;
  return FOOD_COLORS[idx % FOOD_COLORS.length];
}

function getEmoji(cuisine) {
  if (!cuisine) return '🍽️';
  const key = String(cuisine).toLowerCase();
  return FOOD_EMOJIS[key] || '🍽️';
}

export default function RestaurantCard({ restaurant }) {
  const { state, toggleFavorite } = useStore();
  const isFav = state.favorites.includes(restaurant.id);

  const deliveryInfo = restaurant.deliveryFee === 0
    ? 'Lowest Delivery Fee'
    : restaurant.deliveryFee <= 1.99
    ? 'Low Delivery Fee'
    : restaurant.deliveryFee <= 3.00
    ? 'Moderate Delivery Fee'
    : 'Higher Delivery Fee';

  return (
    <div className="rest-card">
      <Link to={`/restaurant/${restaurant.id}`} className="rest-card__image-link">
        <div
          className="rest-card__image"
          style={{ background: getCardColor(restaurant.id) }}
        >
          <span className="rest-card__emoji">{getEmoji(restaurant.cuisine)}</span>

          {/* Promotion badge */}
          {restaurant.deliveryFee === 0 && (
            <span className="rest-card__promo-badge" style={{ background: '#06C167' }}>
              $0 Delivery Fee
            </span>
          )}

          {/* Rating badge */}
          <span className="rest-card__rating-badge">
            {restaurant.rating}
          </span>
        </div>
      </Link>

      <button
        className={`rest-card__fav ${isFav ? 'rest-card__fav--active' : ''}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(restaurant.id); }}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart size={18} fill={isFav ? '#000' : 'none'} stroke={isFav ? '#000' : 'currentColor'} />
      </button>

      <Link to={`/restaurant/${restaurant.id}`} className="rest-card__info">
        <div className="rest-card__row1">
          <h3 className="rest-card__name">{restaurant.name}</h3>
        </div>
        <div className="rest-card__row2">
          <span className="rest-card__delivery-info">
            {restaurant.deliveryFee === 0 && <span className="rest-card__uber-one-icon">&#9913;</span>}
            {deliveryInfo}
          </span>
          <span className="rest-card__dot">&bull;</span>
          <span>{restaurant.deliveryTime}</span>
        </div>
        <div className="rest-card__row3">
          <span className="rest-card__stars">{restaurant.rating} &#9733;</span>
          <span className="rest-card__dot">&bull;</span>
          <span className="rest-card__time">{restaurant.deliveryTime}</span>
        </div>
      </Link>
    </div>
  );
}
