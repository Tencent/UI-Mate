import { useAppContext } from '../context/AppContext';
import { Grid, HelpCircle } from 'lucide-react';

export default function Header() {
  const { state } = useAppContext();

  return (
    <div className="app-header">
      <div className="header-logo">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <rect x="2" y="14" width="4" height="8" rx="1" fill="#e37400" />
          <rect x="8" y="8" width="4" height="14" rx="1" fill="#f9ab00" />
          <rect x="14" y="4" width="4" height="18" rx="1" fill="#e37400" />
        </svg>
        <span>Analytics</span>
      </div>
      <div className="header-breadcrumb">
        <div>
          <div className="account-line">All accounts &gt; {state.property.accountName}</div>
          <div className="property-line">{state.property.propertyName} &#9662;</div>
        </div>
      </div>
      <div className="header-search">
        <input type="text" placeholder="Try searching 'add web stream'" readOnly />
      </div>
      <div className="header-actions">
        <button className="header-icon-btn" title="Google apps">
          <Grid size={20} />
        </button>
        <button className="header-icon-btn" title="Help">
          <HelpCircle size={20} />
        </button>
        <div className="header-avatar" title={state.currentUser.name}>
          {state.currentUser.name.charAt(0)}
        </div>
      </div>
    </div>
  );
}
