import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BarChart2, TrendingUp, Users, Target } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const reportMeta = {
  'pipeline-health': {
    title: 'Pipeline Health',
    icon: BarChart2,
    color: '#2D9D78',
    description: 'Track candidate progression and pass-through rates across all pipeline stages.',
  },
  'recruiting-efficiency': {
    title: 'Recruiting Efficiency',
    icon: TrendingUp,
    color: '#2563EB',
    description: 'Measure time-to-hire, time-to-fill, and recruiter productivity metrics.',
  },
  'offers-hires': {
    title: 'Offers & Hires',
    icon: Users,
    color: '#16A34A',
    description: 'Offer acceptance rates, compensation trends, and hiring velocity.',
  },
  'sourcing': {
    title: 'Source Effectiveness',
    icon: Target,
    color: '#F59E0B',
    description: 'Compare candidate quality and conversion rates by sourcing channel.',
  },
  'time-to-hire': {
    title: 'Time to Hire',
    icon: TrendingUp,
    color: '#2563EB',
    description: 'Average time from application to hire across all open roles.',
  },
  'source-effectiveness': {
    title: 'Source Effectiveness',
    icon: Target,
    color: '#F59E0B',
    description: 'Compare candidate quality and conversion rates by sourcing channel.',
  },
};

export default function ReportDetail() {
  const { reportId } = useParams();
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  const meta = reportMeta[reportId];

  // Pipeline data
  const stageTypes = ['application_review', 'phone_screen', 'interview', 'take_home', 'onsite', 'offer'];
  const stageLabels = ['App Review', 'Phone Screen', 'Interview', 'Take Home', 'Onsite', 'Offer'];
  const pipelineData = stageTypes.map((stageType, i) => ({
    stage: stageLabels[i],
    active: state.applications.filter(a =>
      a.status === 'active' &&
      state.jobStages.find(s => s.id === a.currentStageId)?.stageType === stageType
    ).length,
  }));

  // Source data
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

  // Jobs summary
  const openJobs = state.jobs.filter(j => j.status === 'open').length;
  const totalApps = state.applications.length;
  const activeApps = state.applications.filter(a => a.status === 'active').length;
  const hiredApps = state.applications.filter(a => a.status === 'hired').length;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <button
        onClick={() => navigate(buildLink('/reports'))}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, padding: 0 }}
      >
        <ArrowLeft size={14} /> All Reports
      </button>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          {meta ? (
            <>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <meta.icon size={20} color={meta.color} />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>{meta.title}</h1>
            </>
          ) : (
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Report: {reportId}</h1>
          )}
        </div>
        {meta && <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{meta.description}</p>}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Open Jobs', value: openJobs, color: 'var(--accent)' },
          { label: 'Total Applications', value: totalApps, color: 'var(--text-primary)' },
          { label: 'Active Candidates', value: activeApps, color: '#2563EB' },
          { label: 'Hired', value: hiredApps, color: '#16A34A' },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pipeline by Stage</span>
          </div>
          <div style={{ padding: '16px 20px 20px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pipelineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12 }} />
                <Bar dataKey="active" fill="#2D9D78" radius={[3, 3, 0, 0]} name="Active" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Candidates by Source</span>
          </div>
          <div style={{ padding: '16px 20px 20px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sourceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12 }} />
                <Bar dataKey="count" fill="#1B3A2D" radius={[3, 3, 0, 0]} name="Candidates" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
