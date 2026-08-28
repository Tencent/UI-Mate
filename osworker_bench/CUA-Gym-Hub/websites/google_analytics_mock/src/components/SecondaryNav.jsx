import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function SecondaryNav({ activeSection }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const qs = query ? `?${query}` : '';
  const path = location.pathname;

  if (activeSection === 'reports') return <ReportsNav path={path} qs={qs} />;
  if (activeSection === 'admin') return <AdminNav path={path} qs={qs} />;
  return null;
}

function NavItem({ to, label, active, indent }) {
  return (
    <Link to={to} className={`nav-item ${active ? 'active' : ''} ${indent ? 'indent' : ''}`}>
      {label}
    </Link>
  );
}

function NavGroup({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <div className={`nav-group-toggle ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        <span>{label}</span>
        <ChevronDown size={16} />
      </div>
      {open && children}
    </>
  );
}

function ReportsNav({ path, qs }) {
  return (
    <div className="secondary-nav">
      <NavItem to={`/reports/snapshot${qs}`} label="Reports snapshot" active={path === '/reports/snapshot'} />
      <NavItem to={`/reports/realtime${qs}`} label="Realtime" active={path === '/reports/realtime'} />

      <NavGroup label="Acquisition" defaultOpen={path.includes('/acquisition')}>
        <NavItem to={`/reports/acquisition${qs}`} label="Overview" active={path === '/reports/acquisition'} indent />
        <NavItem to={`/reports/acquisition/user-acquisition${qs}`} label="User acquisition" active={path === '/reports/acquisition/user-acquisition'} indent />
        <NavItem to={`/reports/acquisition/traffic-acquisition${qs}`} label="Traffic acquisition" active={path === '/reports/acquisition/traffic-acquisition'} indent />
      </NavGroup>

      <NavGroup label="Engagement" defaultOpen={path.includes('/engagement')}>
        <NavItem to={`/reports/engagement${qs}`} label="Overview" active={path === '/reports/engagement'} indent />
        <NavItem to={`/reports/engagement/events${qs}`} label="Events" active={path === '/reports/engagement/events'} indent />
        <NavItem to={`/reports/engagement/pages${qs}`} label="Pages and screens" active={path === '/reports/engagement/pages'} indent />
        <NavItem to={`/reports/engagement/conversions${qs}`} label="Conversions" active={path === '/reports/engagement/conversions'} indent />
      </NavGroup>

      <NavItem to={`/reports/retention${qs}`} label="Retention" active={path === '/reports/retention'} />

      <NavGroup label="User" defaultOpen={path.includes('/user/')}>
        <NavItem to={`/reports/user/demographics${qs}`} label="Demographics" active={path === '/reports/user/demographics'} indent />
        <NavItem to={`/reports/user/tech${qs}`} label="Tech" active={path === '/reports/user/tech'} indent />
      </NavGroup>
    </div>
  );
}

function AdminNav({ path, qs }) {
  return (
    <div className="secondary-nav">
      <NavItem to={`/admin${qs}`} label="Admin" active={path === '/admin'} />
      <div className="nav-section-header">Property</div>
      <NavItem to={`/admin/property-settings${qs}`} label="Property settings" active={path === '/admin/property-settings'} indent />
      <NavItem to={`/admin/data-streams${qs}`} label="Data streams" active={path === '/admin/data-streams'} indent />
      <NavItem to={`/admin/events${qs}`} label="Events" active={path === '/admin/events'} indent />
      <NavItem to={`/admin/custom-definitions${qs}`} label="Custom definitions" active={path === '/admin/custom-definitions'} indent />
    </div>
  );
}
