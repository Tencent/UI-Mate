import { useAppContext } from '../context/AppContext';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function AdminPage() {
  const { state } = useAppContext();
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  const qsStr = qs ? `?${qs}` : '';

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Admin</h1>

      <div className="admin-grid">
        {/* Account */}
        <div className="admin-section">
          <div className="admin-section-title">Account</div>
          <div style={{ fontSize: 14, color: 'var(--ga-text-secondary)', marginBottom: 16 }}>
            {state.property.accountName}
          </div>
          <div className="admin-list-item">
            Account settings <ChevronRight size={16} />
          </div>
          <div className="admin-list-item">
            User management <ChevronRight size={16} />
          </div>
        </div>

        {/* Property */}
        <div className="admin-section">
          <div className="admin-section-title">Property</div>
          <div style={{ fontSize: 14, color: 'var(--ga-text-secondary)', marginBottom: 16 }}>
            {state.property.propertyName}
          </div>
          <Link to={`/admin/property-settings${qsStr}`} className="admin-list-item">
            Property settings <ChevronRight size={16} />
          </Link>
          <Link to={`/admin/data-streams${qsStr}`} className="admin-list-item">
            Data streams <ChevronRight size={16} />
          </Link>
          <Link to={`/admin/events${qsStr}`} className="admin-list-item">
            Events <ChevronRight size={16} />
          </Link>
          <Link to={`/admin/custom-definitions${qsStr}`} className="admin-list-item">
            Custom definitions <ChevronRight size={16} />
          </Link>
          <div className="admin-list-item">
            Data settings <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
