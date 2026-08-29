import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, ChevronDown, MapPin, X, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Header.css';

export default function Header({ onCartClick, onMenuClick }) {
  const { state, setDeliveryMode, updateAddress, addAddress } = useApp();
  const [searchValue, setSearchValue] = useState('');
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', apt: '', city: '', state: 'CA', zip: '', instructions: '', isDefault: false });
  const navigate = useNavigate();
  const addressRef = useRef(null);

  const cartCount = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const selectedAddress = state.user.addresses.find(a => a.id === state.ui.selectedAddressId) || state.user.addresses[0];
  const addressText = selectedAddress ? `${selectedAddress.street}` : '123 Main St';

  const userInitials = state.user.name
    ? state.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Close address dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (addressRef.current && !addressRef.current.contains(e.target)) {
        setAddressDropdownOpen(false);
        setShowAddAddressForm(false);
      }
    }
    if (addressDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addressDropdownOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleSearchFocus = () => {
    navigate('/search');
  };

  const handleSelectAddress = (addrId) => {
    updateAddress(addrId);
    setAddressDropdownOpen(false);
    setShowAddAddressForm(false);
  };

  const handleAddNewAddress = () => {
    if (!newAddress.street.trim() || !newAddress.city.trim()) return;
    addAddress(newAddress);
    setNewAddress({ label: 'Home', street: '', apt: '', city: '', state: 'CA', zip: '', instructions: '', isDefault: false });
    setShowAddAddressForm(false);
  };

  return (
    <header className="ue-header">
      <div className="ue-header__inner">
        {/* Hamburger menu */}
        <button className="ue-header__menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link to="/" className="ue-header__logo">
          <span className="ue-header__logo-uber">Uber</span>
          <span className="ue-header__logo-eats"> Eats</span>
        </Link>

        {/* Delivery/Pickup Toggle */}
        <div className="ue-header__mode-toggle">
          <button
            className={`ue-header__mode-btn ${state.ui.deliveryMode === 'delivery' ? 'ue-header__mode-btn--active' : ''}`}
            onClick={() => setDeliveryMode('delivery')}
          >
            Delivery
          </button>
          <button
            className={`ue-header__mode-btn ${state.ui.deliveryMode === 'pickup' ? 'ue-header__mode-btn--active' : ''}`}
            onClick={() => setDeliveryMode('pickup')}
          >
            Pickup
          </button>
        </div>

        {/* Address with dropdown */}
        <div className="ue-header__address-wrapper" ref={addressRef}>
          <button
            className="ue-header__address"
            onClick={() => { setAddressDropdownOpen(!addressDropdownOpen); setShowAddAddressForm(false); }}
          >
            <MapPin size={16} />
            <span className="ue-header__address-text">{addressText}</span>
            <ChevronDown size={14} className={addressDropdownOpen ? 'ue-header__chevron--open' : ''} />
            <span className="ue-header__address-sep">&bull;</span>
            <span className="ue-header__address-time">Now</span>
            <ChevronDown size={14} />
          </button>

          {addressDropdownOpen && (
            <div className="ue-header__address-dropdown">
              {!showAddAddressForm ? (
                <>
                  <div className="ue-header__dropdown-title">Deliver to</div>
                  {state.user.addresses.map(addr => (
                    <button
                      key={addr.id}
                      className={`ue-header__dropdown-item ${addr.id === state.ui.selectedAddressId ? 'ue-header__dropdown-item--active' : ''}`}
                      onClick={() => handleSelectAddress(addr.id)}
                    >
                      <MapPin size={16} />
                      <div className="ue-header__dropdown-item-info">
                        <strong>{addr.label}</strong>
                        <span>{addr.street}{addr.apt ? `, ${addr.apt}` : ''}</span>
                      </div>
                      {addr.id === state.ui.selectedAddressId && (
                        <span className="ue-header__dropdown-check">&#10003;</span>
                      )}
                    </button>
                  ))}
                  <div className="ue-header__dropdown-divider" />
                  <button
                    className="ue-header__dropdown-add"
                    onClick={() => setShowAddAddressForm(true)}
                  >
                    <span>+</span>
                    <span>Add new address</span>
                  </button>
                </>
              ) : (
                <div className="ue-header__add-address-form">
                  <div className="ue-header__add-address-header">
                    <strong>Add new address</strong>
                    <button onClick={() => setShowAddAddressForm(false)}><X size={16} /></button>
                  </div>
                  <input
                    className="ue-header__add-address-input"
                    type="text"
                    placeholder="Label (Home, Work...)"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress(a => ({ ...a, label: e.target.value }))}
                  />
                  <input
                    className="ue-header__add-address-input"
                    type="text"
                    placeholder="Street address *"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress(a => ({ ...a, street: e.target.value }))}
                  />
                  <input
                    className="ue-header__add-address-input"
                    type="text"
                    placeholder="Apt / Suite (optional)"
                    value={newAddress.apt}
                    onChange={(e) => setNewAddress(a => ({ ...a, apt: e.target.value }))}
                  />
                  <div className="ue-header__add-address-row">
                    <input
                      className="ue-header__add-address-input"
                      type="text"
                      placeholder="City *"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress(a => ({ ...a, city: e.target.value }))}
                    />
                    <input
                      className="ue-header__add-address-input"
                      type="text"
                      placeholder="ZIP"
                      value={newAddress.zip}
                      onChange={(e) => setNewAddress(a => ({ ...a, zip: e.target.value }))}
                    />
                  </div>
                  <button
                    className="ue-header__add-address-save"
                    onClick={handleAddNewAddress}
                    disabled={!newAddress.street.trim() || !newAddress.city.trim()}
                  >
                    Save address
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <form className="ue-header__search" onSubmit={handleSearch}>
          <Search size={18} className="ue-header__search-icon" />
          <input
            type="text"
            placeholder="Search Xber Eats"
            className="ue-header__search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={handleSearchFocus}
          />
        </form>

        {/* Right Section */}
        <div className="ue-header__actions">
          <button className="ue-header__cart-btn" onClick={onCartClick}>
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="ue-header__cart-badge">{cartCount}</span>
            )}
            <span className="ue-header__cart-label">Cart</span>
          </button>

          <Link to="/account" className="ue-header__avatar">
            <span>{userInitials}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
