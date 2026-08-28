import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const FOOTER_CONTENT = {
  help: { title: 'Xber Eats Help', body: 'Choose an order from Your Orders to get order-specific help, refunds, delivery updates, or contact options.' },
  gift: { title: 'Gift cards', body: 'Sandbox gift cards can be added at checkout with promo code SAVE5. No external purchase is required.' },
  restaurant: { title: 'Add your restaurant', body: 'Restaurant onboarding is simulated locally. Your draft is saved in this browser session for training tasks.' },
  deliver: { title: 'Sign up to deliver', body: 'Delivery partner signup opens a local information flow in this sandbox and never contacts external services.' },
  near: { title: 'Restaurants near you', body: 'The restaurant list is filtered to San Francisco seed data for deterministic RL tasks.' },
  cities: { title: 'Cities', body: 'This sandbox currently serves San Francisco neighborhoods with stable local fixtures.' },
  countries: { title: 'Countries', body: 'Country selection is fixed to the United States so prices, addresses, and taxes remain deterministic.' },
  pickup: { title: 'Pickup near me', body: 'Use the Delivery/Pickup toggle in the header to switch the catalog and cart to pickup mode.' },
  about: { title: 'About Xber Eats', body: 'This is a self-contained Xber Eats training mock with local restaurants, orders, account settings, and file endpoints.' },
  appStore: { title: 'App Store', body: 'App installation is represented locally. Continue using this browser sandbox for all training workflows.' },
  playStore: { title: 'Google Play', body: 'App installation is represented locally. Continue using this browser sandbox for all training workflows.' },
  privacy: { title: 'Privacy Policy', body: 'Sandbox data stays local to this mock server and browser storage for the active session id.' },
  terms: { title: 'Terms', body: 'Training actions are local and deterministic. No real orders, payments, or external accounts are created.' },
  pricing: { title: 'Pricing', body: 'Menu prices, fees, tax, tips, and promotions are calculated locally from fixture data.' },
};

export default function Footer() {
  const [modalKey, setModalKey] = useState(null);
  const modal = modalKey ? FOOTER_CONTENT[modalKey] : null;

  return (
    <footer className="ue-footer">
      <div className="ue-footer__inner">
        <div className="ue-footer__brand">
          <div className="ue-footer__logo">
            <span className="ue-footer__logo-uber">Uber</span>
            <span className="ue-footer__logo-eats"> Eats</span>
          </div>
        </div>

        <div className="ue-footer__links">
          <div className="ue-footer__col">
            <button className="ue-footer__link" onClick={() => setModalKey('help')}>Get Help</button>
            <button className="ue-footer__link" onClick={() => setModalKey('gift')}>Buy gift cards</button>
            <button className="ue-footer__link" onClick={() => setModalKey('restaurant')}>Add your restaurant</button>
            <button className="ue-footer__link" onClick={() => setModalKey('deliver')}>Sign up to deliver</button>
          </div>
          <div className="ue-footer__col">
            <button className="ue-footer__link" onClick={() => setModalKey('near')}>Restaurants near me</button>
            <button className="ue-footer__link" onClick={() => setModalKey('cities')}>View all cities</button>
            <button className="ue-footer__link" onClick={() => setModalKey('countries')}>View all countries</button>
            <button className="ue-footer__link" onClick={() => setModalKey('pickup')}>Pickup near me</button>
          </div>
          <div className="ue-footer__col">
            <button className="ue-footer__link" onClick={() => setModalKey('about')}>About Xber Eats</button>
            <Link to="/" className="ue-footer__link">English</Link>
          </div>
        </div>

        <div className="ue-footer__bottom">
          <div className="ue-footer__stores">
            <button className="ue-footer__store-btn" onClick={() => setModalKey('appStore')}>
              <span className="ue-footer__store-icon">&#63743;</span>
              <div>
                <span className="ue-footer__store-sub">Download on the</span>
                <span className="ue-footer__store-name">App Store</span>
              </div>
            </button>
            <button className="ue-footer__store-btn" onClick={() => setModalKey('playStore')}>
              <span className="ue-footer__store-icon">&#9654;</span>
              <div>
                <span className="ue-footer__store-sub">Get it on</span>
                <span className="ue-footer__store-name">Google Play</span>
              </div>
            </button>
          </div>

          <div className="ue-footer__legal">
            <span>&copy; {new Date().getFullYear()} Uber Technologies Inc.</span>
            <span className="ue-footer__dot">&bull;</span>
            <button className="ue-footer__legal-link" onClick={() => setModalKey('privacy')}>Privacy Policy</button>
            <span className="ue-footer__dot">&bull;</span>
            <button className="ue-footer__legal-link" onClick={() => setModalKey('terms')}>Terms</button>
            <span className="ue-footer__dot">&bull;</span>
            <button className="ue-footer__legal-link" onClick={() => setModalKey('pricing')}>Pricing</button>
          </div>
        </div>
      </div>
      {modal && (
        <div className="ue-footer-modal" onClick={() => setModalKey(null)}>
          <div className="ue-footer-modal__dialog" onClick={(e) => e.stopPropagation()}>
            <button className="ue-footer-modal__close" onClick={() => setModalKey(null)} aria-label="Close">×</button>
            <h2>{modal.title}</h2>
            <p>{modal.body}</p>
            <button className="ue-footer-modal__button" onClick={() => setModalKey(null)}>Done</button>
          </div>
        </div>
      )}
    </footer>
  );
}
