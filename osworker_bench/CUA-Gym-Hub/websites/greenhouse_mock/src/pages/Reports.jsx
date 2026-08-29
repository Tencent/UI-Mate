import { BarChart2, TrendingUp, Users, Target, FileText, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const reportCards = [
  { id: 'pipeline-health', title: 'Pipeline Health', description: 'Track candidate progression and pass-through rates across all pipeline stages', icon: BarChart2, color: '#2D9D78' },
  { id: 'recruiting-efficiency', title: 'Recruiting Efficiency', description: 'Measure time-to-hire, time-to-fill, and recruiter productivity metrics', icon: TrendingUp, color: '#2563EB' },
  { id: 'offers-hires', title: 'Offers & Hires', description: 'Offer acceptance rates, compensation trends, and hiring velocity', icon: Users, color: '#16A34A' },
  { id: 'sourcing', title: 'Source Effectiveness', description: 'Compare candidate quality and conversion rates by sourcing channel', icon: Target, color: '#F59E0B' },
];

export default function Reports() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  // Source breakdown data
  const sourceIdToKey = {
    'src-1': 'applied',
    'src-2': 'referral',
    'src-3': 'sourced',
    'src-4': 'applied',
    'src-5': 'applied',
    'src-6': 'agency',
    'src-7': 'internal',
  };
  const sourceData = state.sources.map(src => {
    const sourceKey = sourceIdToKey[src.id];
    const count = sourceKey ? state.candidates.filter(c => c.source === sourceKey).length : 0;
    return { name: src.name.split(' ')[0], count };
  }).filter(d => d.count > 0);

  // Pipeline by stage
  const stages = ['application_review', 'phone_screen', 'interview', 'take_home', 'onsite', 'offer'];
  const stageLabels = ['App Review', 'Phone Screen', 'Interview', 'Take Home', 'Onsite', 'Offer'];
  const pipelineData = stages.map((stageType, i) => ({
    stage: stageLabels[i],
    count: state.applications.filter(a =>
      a.status === 'active' &&
      state.jobStages.find(s => s.id === a.currentStageId)?.stageType === stageType
    ).length
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
      </div>

      {/* Report cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
        {reportCards.map(report => (
          <div
            key={report.id}
            className="card"
            style={{ padding: '20px 24px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
            onClick={() => navigate(buildLink(`/reports/${report.id}`))}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${report.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <report.icon size={18} color={report.color} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>{report.title}</h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{report.description}</p>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 4 }} />
            </div>
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 12, color: report.color, fontWeight: 500 }}>View Report →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Pipeline by stage */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Active Pipeline by Stage</span>
          </div>
          <div style={{ padding: '16px 20px 20px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pipelineData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12 }} />
                <Bar dataKey="count" fill="#2D9D78" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source breakdown */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Candidates by Source</span>
          </div>
          <div style={{ padding: '16px 20px 20px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sourceData} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#9CA3AF' }} width={60} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12 }} />
                <Bar dataKey="count" fill="#1B3A2D" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* All reports list */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>All Reports</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Category</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'pipeline-health', name: 'Pipeline History and Pass-through Rates', category: 'Pipeline', desc: 'Historical pipeline flow and conversion rates' },
                { id: 'recruiting-efficiency', name: 'Time to Hire by Department', category: 'Efficiency', desc: 'Average hiring timeline by department' },
                { id: 'sourcing', name: 'Source Effectiveness', category: 'Sourcing', desc: 'Which sources produce the best candidates' },
                { id: 'offers-hires', name: 'Offer Acceptance Rate', category: 'Offers & Hires', desc: 'Track offer outcomes and compensation data' },
                { id: 'recruiting-efficiency', name: 'Interview-to-Hire Ratio', category: 'Efficiency', desc: 'How many interviews lead to a hire' },
                { id: 'pipeline-health', name: 'Candidate Demographics', category: 'Diversity', desc: 'Diversity and inclusion metrics' },
              ].map(r => (
                <tr key={r.name} style={{ cursor: 'pointer' }} onClick={() => navigate(buildLink(`/reports/${r.id}`))}>
                  <td style={{ fontWeight: 500, color: 'var(--accent)' }}>{r.name}</td>
                  <td><span className="badge badge-gray">{r.category}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.desc}</td>
                  <td style={{ textAlign: 'right' }}>
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
