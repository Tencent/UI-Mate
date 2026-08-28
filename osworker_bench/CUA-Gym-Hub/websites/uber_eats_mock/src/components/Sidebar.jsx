import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Heart, CreditCard, HelpCircle, Tag, ExternalLink, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const { state } = useApp();
  const navigate = useNavigate();
  const [localDialog, setLocalDialog] = useState(null);

  if (!isOpen) return null;

  const user = state.user;
  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleNav = (path) => {
    onClose();
    navigate(path);
  };

  const openLocalDialog = (title, body) => {
    setLocalDialog({ title, body });
  };

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <nav className="sidebar animate-slideInLeft" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sidebar__header">
          <div className="sidebar__profile" onClick={() => handleNav('/account')}>
            <div className="sidebar__avatar">{userInitials}</div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user.name.split(' ')[0]}</span>
              <span className="sidebar__manage-link">Manage account</span>
            </div>
          </div>
          <button className="sidebar__close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Main navigation */}
        <div className="sidebar__nav">
          <button className="sidebar__nav-item" onClick={() => handleNav('/orders')}>
            <ShoppingBag size={20} />
            <span>Orders</span>
          </button>
          <button className="sidebar__nav-item" onClick={() => handleNav('/favorites')}>
            <Heart size={20} />
            <span>Favorites</span>
          </button>
          <button className="sidebar__nav-item" onClick={() => handleNav('/account')}>
            <CreditCard size={20} />
            <span>Wallet</span>
          </button>
          <button className="sidebar__nav-item" onClick={() => handleNav('/account')}>
            <Tag size={20} />
            <span>Promotions</span>
          </button>
          <button className="sidebar__nav-item" onClick={() => handleNav('/account')}>
            <HelpCircle size={20} />
            <span>Help</span>
          </button>
          <button className="sidebar__nav-item" onClick={() => handleNav('/')}>
            <ExternalLink size={20} />
            <span>Get a ride</span>
            <ExternalLink size={14} className="sidebar__ext-icon" />
          </button>
        </div>

        {/* Uber One */}
        {!user.uberOneActive && (
          <div className="sidebar__uber-one" onClick={() => handleNav('/account')}>
            <div className="sidebar__uber-one-icon">
              <span className="sidebar__uber-one-badge">Uber<br/>One</span>
            </div>
            <div className="sidebar__uber-one-info">
              <strong>Uber One</strong>
              <span className="sidebar__uber-one-trial">Try free for 4 weeks</span>
            </div>
          </div>
        )}

        {/* Invite */}
        <button className="sidebar__nav-item sidebar__invite" onClick={() => handleNav('/account')}>
          <Users size={20} />
          <div>
            <span>Invite friends</span>
            <span className="sidebar__invite-sub">You get $15 off</span>
          </div>
        </button>

        {/* Divider */}
        <div className="sidebar__divider" />

        {/* Bottom links */}
        <div className="sidebar__bottom-links">
          <button className="sidebar__bottom-link" onClick={() => openLocalDialog('Signed out locally', 'This sandbox keeps you in the deterministic demo account so training tasks can continue.')}>Sign out</button>
          <div className="sidebar__bottom-divider" />
          <button className="sidebar__bottom-link" onClick={() => openLocalDialog('Business account draft', 'Business account setup is represented locally. Company orders and billing stay inside this browser session.')}>Create a business account</button>
          <button className="sidebar__bottom-link" onClick={() => openLocalDialog('Restaurant onboarding', 'Restaurant signup is simulated locally with no external submission.')}>Add your restaurant</button>
          <button className="sidebar__bottom-link" onClick={() => openLocalDialog('Delivery partner signup', 'Courier signup opens a local training flow and does not contact real Uber services.')}>Sign up to deliver</button>
        </div>

        {/* App download */}
        <div className="sidebar__app-download">
          <div className="sidebar__app-icon">
            <span style={{ fontWeight: 700, fontSize: 11, lineHeight: 1 }}>Uber<br/><span style={{ color: '#06C167' }}>Eats</span></span>
          </div>
          <span className="sidebar__app-text">There's more to love in the app.</span>
        </div>

        {localDialog && (
          <div className="sidebar__local-dialog">
            <strong>{localDialog.title}</strong>
            <p>{localDialog.body}</p>
            <button onClick={() => setLocalDialog(null)}>Done</button>
          </div>
        )}
      </nav>
    </div>
  );
}
