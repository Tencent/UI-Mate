import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import RestaurantCard from '../components/RestaurantCard';
import './Favorites.css';

export default function Favorites() {
  const { state, toggleFavorite } = useApp();

  const favoriteRestaurants = state.restaurants.filter(r =>
    state.user.favoriteRestaurantIds.includes(r.id)
  );

  if (favoriteRestaurants.length === 0) {
    return (
      <div className="favorites-empty">
        <div className="favorites-empty__icon">
          <Heart size={48} />
        </div>
        <h2>You haven't saved any favorites yet</h2>
        <p>Tap the heart icon on a restaurant to save it here</p>
        <Link to="/" className="favorites-empty__btn">Browse restaurants</Link>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h1 className="favorites-page__title">Saved Restaurants</h1>
      <div className="favorites-grid">
        {favoriteRestaurants.map(restaurant => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            isFavorite={true}
            onToggleFavorite={() => toggleFavorite(restaurant.id)}
          />
        ))}
      </div>
    </div>
  );
}
