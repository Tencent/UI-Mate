import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CreditCard, Heart, Clock, Settings, ChevronRight, User, Phone, Mail, Shield, Edit2, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Account.css';

export default function Account() {
  const { state, updateUser, activateUberOne } = useApp();
  const user = state.user;
  const favRestaurants = state.restaurants.filter(r => user.favoriteRestaurantIds.includes(r.id));

  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState('');
  const [showUberOneModal, setShowUberOneModal] = useState(false);

  const handleStartEdit = (field, currentValue) => {
    setEditingField(field);
    setFieldValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (editingField && fieldValue.trim()) {
      updateUser({ [editingField]: fieldValue.trim() });
    }
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setFieldValue('');
  };

  const handleActivateUberOne = () => {
    activateUberOne();
    setShowUberOneModal(false);
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="account-page">
      {/* Profile Header */}
      <div className="account-profile">
        <div className="account-profile__avatar">
          {userInitials}
        </div>
        <h1 className="account-profile__name">{user.name}</h1>
        <p className="account-profile__email">{user.email}</p>
      </div>

      {/* Uber One banner */}
      {!user.uberOneActive && (
        <div className="account-uber-one">
          <div className="account-uber-one__content">
            <strong>Uber One</strong>
            <p>$0 Delivery Fee and 5% off eligible orders</p>
          </div>
          <button className="account-uber-one__btn" onClick={() => setShowUberOneModal(true)}>Try free for 1 month</button>
        </div>
      )}
      {user.uberOneActive && (
        <div className="account-uber-one account-uber-one--active">
          <div className="account-uber-one__content">
            <strong>Uber One Member</strong>
            <p>Enjoy $0 delivery and 5% off eligible orders</p>
          </div>
          <Shield size={24} />
        </div>
      )}

      {/* Quick links menu */}
      <div className="account-menu">
        <Link to="/orders" className="account-menu__item">
          <Clock size={20} />
          <span className="account-menu__label">Orders</span>
          <span className="account-menu__count">{state.orders.length}</span>
          <ChevronRight size={16} />
        </Link>
        <Link to="/favorites" className="account-menu__item">
          <Heart size={20} />
          <span className="account-menu__label">Favorites</span>
          <span className="account-menu__count">{user.favoriteRestaurantIds.length}</span>
          <ChevronRight size={16} />
        </Link>
        <button
          type="button"
          className="account-menu__item"
          onClick={() => scrollToSection('addresses')}
        >
          <MapPin size={20} />
          <span className="account-menu__label">Addresses</span>
          <span className="account-menu__count">{user.addresses.length}</span>
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          className="account-menu__item"
          onClick={() => scrollToSection('payment')}
        >
          <CreditCard size={20} />
          <span className="account-menu__label">Payment</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Personal Info */}
      <section className="account-section">
        <h2 className="account-section__title">Personal Info</h2>
        <div className="account-info-card">
          <div className="account-info__row">
            <User size={18} />
            <div className="account-info__field">
              <span className="account-info__label">Name</span>
              {editingField === 'name' ? (
                <div className="account-info__edit-row">
                  <input
                    type="text"
                    className="account-info__input"
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') handleCancelEdit(); }}
                    autoFocus
                  />
                  <button className="account-info__save-btn" onClick={handleSaveEdit} title="Save"><Check size={16} /></button>
                  <button className="account-info__cancel-btn" onClick={handleCancelEdit} title="Cancel"><X size={16} /></button>
                </div>
              ) : (
                <span className="account-info__value">{user.name}</span>
              )}
            </div>
            {editingField !== 'name' && (
              <button className="account-info__edit" onClick={() => handleStartEdit('name', user.name)}>
                <Edit2 size={16} />
              </button>
            )}
          </div>

          <div className="account-info__row">
            <Mail size={18} />
            <div className="account-info__field">
              <span className="account-info__label">Email</span>
              {editingField === 'email' ? (
                <div className="account-info__edit-row">
                  <input
                    type="email"
                    className="account-info__input"
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') handleCancelEdit(); }}
                    autoFocus
                  />
                  <button className="account-info__save-btn" onClick={handleSaveEdit} title="Save"><Check size={16} /></button>
                  <button className="account-info__cancel-btn" onClick={handleCancelEdit} title="Cancel"><X size={16} /></button>
                </div>
              ) : (
                <span className="account-info__value">{user.email}</span>
              )}
            </div>
            {editingField !== 'email' && (
              <button className="account-info__edit" onClick={() => handleStartEdit('email', user.email)}>
                <Edit2 size={16} />
              </button>
            )}
          </div>

          <div className="account-info__row">
            <Phone size={18} />
            <div className="account-info__field">
              <span className="account-info__label">Phone</span>
              {editingField === 'phone' ? (
                <div className="account-info__edit-row">
                  <input
                    type="tel"
                    className="account-info__input"
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') handleCancelEdit(); }}
                    autoFocus
                  />
                  <button className="account-info__save-btn" onClick={handleSaveEdit} title="Save"><Check size={16} /></button>
                  <button className="account-info__cancel-btn" onClick={handleCancelEdit} title="Cancel"><X size={16} /></button>
                </div>
              ) : (
                <span className="account-info__value">{user.phone}</span>
              )}
            </div>
            {editingField !== 'phone' && (
              <button className="account-info__edit" onClick={() => handleStartEdit('phone', user.phone)}>
                <Edit2 size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Favorites section */}
      {favRestaurants.length > 0 && (
        <section className="account-section">
          <div className="account-section__header">
            <h2 className="account-section__title">Favorite Restaurants</h2>
            <Link to="/favorites" className="account-section__link">See all</Link>
          </div>
          <div className="account-favs">
            {favRestaurants.slice(0, 3).map(r => (
              <Link key={r.id} to={`/store/${r.id}`} className="account-fav">
                <div className="account-fav__icon">{r.name.charAt(0)}</div>
                <div className="account-fav__info">
                  <span className="account-fav__name">{r.name}</span>
                  <span className="account-fav__meta">{r.cuisineType.join(', ')}</span>
                </div>
                <ChevronRight size={16} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Addresses */}
      <section id="addresses" className="account-section">
        <h2 className="account-section__title">Saved Addresses</h2>
        <div className="account-addresses">
          {user.addresses.map(addr => (
            <div key={addr.id} className="account-address">
              <MapPin size={18} />
              <div className="account-address__info">
                <strong>{addr.label}</strong>
                <span className="account-address__detail">{addr.street}{addr.apt ? `, ${addr.apt}` : ''}</span>
                <span className="account-address__detail">{addr.city}, {addr.state} {addr.zip}</span>
              </div>
              {addr.isDefault && <span className="account-address__badge">Default</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Payment Methods */}
      <section id="payment" className="account-section">
        <h2 className="account-section__title">Payment Methods</h2>
        <div className="account-payments">
          {user.paymentMethods.map(pm => (
            <div key={pm.id} className="account-payment">
              <CreditCard size={18} />
              <div className="account-payment__info">
                <strong>{pm.label}</strong>
                {pm.type === 'visa' && <span className="account-payment__type">Visa</span>}
                {pm.type === 'paypal' && <span className="account-payment__type">PayPal</span>}
              </div>
              {pm.isDefault && <span className="account-address__badge">Default</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Uber One Modal */}
      {showUberOneModal && (
        <div className="uber-one-modal-overlay" onClick={() => setShowUberOneModal(false)}>
          <div className="uber-one-modal" onClick={(e) => e.stopPropagation()}>
            <button className="uber-one-modal__close" onClick={() => setShowUberOneModal(false)}>
              <X size={20} />
            </button>
            <div className="uber-one-modal__header">
              <strong>Uber One</strong>
            </div>
            <div className="uber-one-modal__benefits">
              <div className="uber-one-modal__benefit">
                <span className="uber-one-modal__benefit-icon">🚚</span>
                <div>
                  <strong>$0 Delivery Fee</strong>
                  <p>No delivery fees on eligible orders</p>
                </div>
              </div>
              <div className="uber-one-modal__benefit">
                <span className="uber-one-modal__benefit-icon">💰</span>
                <div>
                  <strong>5% off eligible orders</strong>
                  <p>Save on every eligible order you place</p>
                </div>
              </div>
              <div className="uber-one-modal__benefit">
                <span className="uber-one-modal__benefit-icon">⚡</span>
                <div>
                  <strong>Priority delivery</strong>
                  <p>Your orders get priority assignment</p>
                </div>
              </div>
            </div>
            <p className="uber-one-modal__price">$9.99/month after free trial</p>
            <button className="uber-one-modal__cta" onClick={handleActivateUberOne}>
              Start free trial
            </button>
            <button className="uber-one-modal__skip" onClick={() => setShowUberOneModal(false)}>
              No thanks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
