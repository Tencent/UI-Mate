import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Home, BarChart3, Compass, Megaphone, Settings } from 'lucide-react';

export default function IconRail({ activeSection }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const qs = query ? `?${query}` : '';

  const items = [
    { id: 'home', icon: Home, label: 'Home', to: '/' },
    { id: 'reports', icon: BarChart3, label: 'Reports', to: '/reports/snapshot' },
    { id: 'explore', icon: Compass, label: 'Explore', to: '/explore' },
    { id: 'advertising', icon: Megaphone, label: 'Advertising', to: '/advertising' },
  ];

  return (
    <div className="icon-rail">
      {items.map(item => (
        <Link
          key={item.id}
          to={item.to + qs}
          className={`icon-rail-item ${activeSection === item.id ? 'active' : ''}`}
        >
          <item.icon size={20} />
          <span className="label">{item.label}</span>
        </Link>
      ))}
      <div className="icon-rail-spacer" />
      <Link
        to={'/admin' + qs}
        className={`icon-rail-item ${activeSection === 'admin' ? 'active' : ''}`}
      >
        <Settings size={20} />
        <span className="label">Admin</span>
      </Link>
    </div>
  );
}
