import { useAppContext } from '../context/AppContext';
import { Link, useSearchParams } from 'react-router-dom';
import { BarChart3, Filter, GitBranch, Circle, User, Grid3X3, Clock, FileSpreadsheet } from 'lucide-react';

const templates = [
  { id: 'free_form', name: 'Free form', icon: FileSpreadsheet, desc: 'Explore your data with a flexible table or chart' },
  { id: 'funnel', name: 'Funnel exploration', icon: Filter, desc: 'Visualize steps users take to complete a task' },
  { id: 'path', name: 'Path exploration', icon: GitBranch, desc: 'See how users navigate your site' },
  { id: 'segment_overlap', name: 'Segment overlap', icon: Circle, desc: 'Compare up to 3 user segments' },
  { id: 'user_explorer', name: 'User explorer', icon: User, desc: 'Examine individual user activity' },
  { id: 'cohort', name: 'Cohort exploration', icon: Grid3X3, desc: 'Understand behavior of groups over time' },
  { id: 'user_lifetime', name: 'User lifetime', icon: Clock, desc: 'Explore user value over their lifetime' },
];

export default function ExploreGallery() {
  const { state } = useAppContext();
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  const qsStr = qs ? `?${qs}` : '';

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Explorations</h1>

      {/* Template cards */}
      <div className="explore-grid">
        {templates.map(t => (
          <Link key={t.id} to={`/explore/new?type=${t.id}${qs ? '&' + qs : ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="explore-card">
              <div className="explore-card-icon">
                <t.icon size={40} />
              </div>
              <div className="explore-card-title">{t.name}</div>
              <div className="explore-card-desc">{t.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent explorations */}
      <h2 style={{ fontSize: 16, fontWeight: 400, fontFamily: 'var(--ga-font-heading)', marginBottom: 12 }}>Recent explorations</h2>
      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Last modified</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {state.explorations.map(exp => (
              <tr key={exp.id}>
                <td>
                  <Link to={`/explore/${exp.id}${qsStr}`} style={{ color: 'var(--ga-blue)' }}>
                    {exp.name}
                  </Link>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{exp.type.replace('_', ' ')}</td>
                <td>{exp.lastModified}</td>
                <td>{exp.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
