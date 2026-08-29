import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import IconRail from './IconRail';
import SecondaryNav from './SecondaryNav';
import Header from './Header';
import { useEffect } from 'react';

export default function Layout() {
  const location = useLocation();
  const { addRecentlyAccessed } = useAppContext();

  // Track recently accessed pages
  useEffect(() => {
    const pathTitleMap = {
      '/': 'Home',
      '/reports/snapshot': 'Reports Snapshot',
      '/reports/realtime': 'Realtime',
      '/reports/acquisition': 'Acquisition Overview',
      '/reports/acquisition/user-acquisition': 'User Acquisition',
      '/reports/acquisition/traffic-acquisition': 'Traffic Acquisition',
      '/reports/engagement': 'Engagement Overview',
      '/reports/engagement/events': 'Events',
      '/reports/engagement/pages': 'Pages and Screens',
      '/reports/engagement/conversions': 'Conversions',
      '/reports/retention': 'Retention',
      '/reports/user/demographics': 'Demographics',
      '/reports/user/tech': 'Tech Overview',
      '/explore': 'Explore',
      '/advertising': 'Advertising',
      '/admin': 'Admin',
    };
    const title = pathTitleMap[location.pathname];
    if (title) {
      addRecentlyAccessed(location.pathname, title);
    }
  }, [location.pathname]);

  // Determine active section
  const getActiveSection = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/reports')) return 'reports';
    if (location.pathname.startsWith('/explore')) return 'explore';
    if (location.pathname.startsWith('/advertising')) return 'advertising';
    if (location.pathname.startsWith('/admin')) return 'admin';
    return 'home';
  };

  const activeSection = getActiveSection();
  const showSecondaryNav = activeSection === 'reports' || activeSection === 'admin';

  return (
    <div className="app-layout">
      <IconRail activeSection={activeSection} />
      <div className="app-right">
        <Header />
        <div className="app-main">
          {showSecondaryNav && <SecondaryNav activeSection={activeSection} />}
          <div className="content-area">
            <div className="content-inner">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
