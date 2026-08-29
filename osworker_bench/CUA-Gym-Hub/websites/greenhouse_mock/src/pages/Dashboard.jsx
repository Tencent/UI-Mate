import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { format, formatDistanceToNow, isToday, parseISO } from 'date-fns';
import { Briefcase, Users, Calendar, FileText, TrendingUp, Clock } from 'lucide-react';

const hiringVelocityData = [
  { month: 'Oct', hires: 0, offers: 1 },
  { month: 'Nov', hires: 0, offers: 0 },
  { month: 'Dec', hires: 0, offers: 0 },
  { month: 'Jan', hires: 0, offers: 1 },
  { month: 'Feb', hires: 1, offers: 2 },
  { month: 'Mar', hires: 0, offers: 1 },
  { month: 'Apr', hires: 0, offers: 2 },
];

const applicationTrendData = [
  { week: 'Jan 6', count: 5 },
  { week: 'Jan 13', count: 8 },
  { week: 'Jan 20', count: 12 },
  { week: 'Jan 27', count: 9 },
  { week: 'Feb 3', count: 15 },
  { week: 'Feb 10', count: 11 },
  { week: 'Feb 17', count: 18 },
  { week: 'Feb 24', count: 14 },
  { week: 'Mar 3', count: 16 },
  { week: 'Mar 10', count: 13 },
  { week: 'Mar 17', count: 19 },
  { week: 'Mar 24', count: 15 },
  { week: 'Mar 31', count: 17 },
];

export default function Dashboard() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  const [activeTab, setActiveTab] = useState('my');

  // Key metrics
  const openJobs = state.jobs.filter(j => j.status === 'open').length;
  const totalActiveApps = state.applications.filter(a => a.status === 'active').length;
  const interviewsToday = state.interviews.filter(i => i.status === 'scheduled' && isToday(parseISO(i.scheduledAt))).length;
  const pendingOffers = state.offers.filter(o => o.status === 'pending_approval' || o.status === 'sent').length;

  // Pipeline summary
  const stageNames = ['Application Review', 'Phone Screen', 'Interview', 'Onsite', 'Offer'];
  const pipelineCounts = [
    state.applications.filter(a => a.status === 'active' && state.jobStages.find(s => s.id === a.currentStageId)?.stageType === 'application_review').length,
    state.applications.filter(a => a.status === 'active' && state.jobStages.find(s => s.id === a.currentStageId)?.stageType === 'phone_screen').length,
    state.applications.filter(a => a.status === 'active' && ['interview', 'take_home'].includes(state.jobStages.find(s => s.id === a.currentStageId)?.stageType)).length,
    state.applications.filter(a => a.status === 'active' && state.jobStages.find(s => s.id === a.currentStageId)?.stageType === 'onsite').length,
    state.applications.filter(a => a.status === 'active' && state.jobStages.find(s => s.id === a.currentStageId)?.stageType === 'offer').length,
  ];
  const maxPipeline = Math.max(...pipelineCounts, 1);

  // Following candidates
  const followingCandidates = state.candidates.slice(0, 5).map(c => {
    const app = state.applications.find(a => a.candidateId === c.id && a.status === 'active');
    const stage = app ? state.jobStages.find(s => s.id === app.currentStageId) : null;
    const job = app ? state.jobs.find(j => j.id === app.jobId) : null;
    const dept = job ? state.departments.find(d => d.id === job.departmentId) : null;
    const office = job ? state.offices.find(o => o.id === job.officeId) : null;
    return { ...c, stage, dept, office, app, job };
  });

  // Upcoming interviews
  const upcomingInterviews = state.interviews
    .filter(i => i.status === 'scheduled' && new Date(i.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .slice(0, 4)
    .map(i => {
      const app = state.applications.find(a => a.id === i.applicationId);
      const cand = app ? state.candidates.find(c => c.id === app.candidateId) : null;
      const job = app ? state.jobs.find(j => j.id === app.jobId) : null;
      return { ...i, cand, job };
    });

  // Task counts
  const appReviewCount = state.applications.filter(a => a.status === 'active' && a.actionRequired === 'needs_decision' && state.jobStages.find(s => s.id === a.currentStageId)?.stageType === 'application_review').length;
  const phoneScreenCount = state.applications.filter(a => a.status === 'active' && a.actionRequired === 'needs_scheduling' && state.jobStages.find(s => s.id === a.currentStageId)?.stageType === 'phone_screen').length;
  const needsDecisionCount = state.applications.filter(a => a.status === 'active' && a.actionRequired === 'needs_decision').length;
  const scorecardsDueCount = state.scorecards.filter(sc => !sc.submittedAt).length;

  // Pipeline bar data for chart
  const pipelineChartData = stageNames.map((name, i) => ({ stage: name, count: pipelineCounts[i] }));

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Welcome banner */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
          Welcome back, {state.currentUser.firstName}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          Here is what is happening with your recruiting pipeline.
        </p>
      </div>

      {/* Key metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Open Jobs', value: openJobs, icon: Briefcase, color: '#3B8427', bgColor: '#E8F5E3', onClick: () => navigate(buildLink('/jobs')) },
          { label: 'Candidates in Pipeline', value: totalActiveApps, icon: Users, color: '#2563EB', bgColor: '#DBEAFE', onClick: () => navigate(buildLink('/candidates')) },
          { label: 'Interviews Today', value: interviewsToday, icon: Calendar, color: '#7C3AED', bgColor: '#EDE9FE', onClick: () => navigate(buildLink('/interviews')) },
          { label: 'Offers Pending', value: pendingOffers, icon: FileText, color: '#EA580C', bgColor: '#FFF7ED', onClick: () => navigate(buildLink('/offers')) },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: '20px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
            onClick={m.onClick}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: m.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <m.icon size={20} color={m.color} />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Hiring Velocity Chart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Hiring Velocity</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last 7 months</span>
            </div>
            <div style={{ padding: '16px 20px 20px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hiringVelocityData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12 }} />
                  <Bar dataKey="offers" fill="#3B8427" radius={[3, 3, 0, 0]} name="Offers" />
                  <Bar dataKey="hires" fill="#1B3A2D" radius={[3, 3, 0, 0]} name="Hires" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Applications over time */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Applications over time</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>3 months</span>
            </div>
            <div style={{ padding: '16px 20px 20px' }}>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={applicationTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9CA3AF' }} interval={2} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} domain={[0, 25]} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12 }} formatter={(v) => [v, 'Applications']} />
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B8427" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B8427" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="count" stroke="#3B8427" strokeWidth={2} fill="url(#colorApps)" dot={{ fill: '#3B8427', r: 3 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Candidates I'm following */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Candidates I am following</span>
            </div>
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Name', 'Job', 'Stage', 'Days'].map(h => (
                      <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: '#FAFAFA', borderBottom: '1px solid var(--divider)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {followingCandidates.map(c => (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(buildLink(`/candidates/${c.id}`))}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--accent)', borderBottom: '1px solid var(--divider)' }}>
                        {c.name}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--divider)' }}>
                        {c.job?.title || '-'}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--divider)' }}>
                        {c.stage?.name || '-'}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 13, borderBottom: '1px solid var(--divider)' }}>
                        {c.app?.daysInCurrentStage || 0}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* My Tasks */}
          <div className="card">
            <div style={{ display: 'flex', borderBottom: '1px solid var(--divider)' }}>
              <button
                onClick={() => setActiveTab('my')}
                style={{ flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: activeTab === 'my' ? 600 : 400, color: activeTab === 'my' ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'my' ? '2px solid var(--accent)' : '2px solid transparent', fontSize: 14 }}
              >
                My tasks
              </button>
              <button
                onClick={() => setActiveTab('all')}
                style={{ flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: activeTab === 'all' ? 600 : 400, color: activeTab === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'all' ? '2px solid var(--accent)' : '2px solid transparent', fontSize: 14 }}
              >
                All tasks
              </button>
            </div>
            <div style={{ padding: '12px 0' }}>
              {[
                { label: 'Application Review', count: appReviewCount, path: '/candidates' },
                { label: 'Needs Scheduling', count: phoneScreenCount, path: '/interviews' },
                { label: 'Needs Decision', count: needsDecisionCount, path: '/candidates' },
                { label: 'Scorecards Due', count: scorecardsDueCount, path: '/candidates' },
                { label: 'Offers Pending', count: pendingOffers, path: '/offers' },
              ].map(task => (
                <div
                  key={task.label}
                  onClick={() => navigate(buildLink(task.path))}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--divider)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: task.count > 0 ? '#3B8427' : '#D1D5DB', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14 }}>{task.label}</span>
                  {task.count > 0 && (
                    <span style={{ background: task.count > 3 ? '#FEE2E2' : '#E5E7EB', color: task.count > 3 ? '#991B1B' : '#4B5563', fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 10 }}>
                      {task.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Pipeline</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{totalActiveApps} active</span>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stageNames.map((name, i) => (
                <div key={name}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{pipelineCounts[i]}</span>
                  </div>
                  <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(pipelineCounts[i] / maxPipeline) * 100}%`, background: '#3B8427', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Upcoming Interviews</span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}
                onClick={() => navigate(buildLink('/interviews'))}
              >
                View all
              </button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {upcomingInterviews.length === 0 ? (
                <div style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: 13 }}>No upcoming interviews</div>
              ) : upcomingInterviews.map(i => (
                <div
                  key={i.id}
                  onClick={() => i.cand && navigate(buildLink(`/candidates/${i.cand.id}`))}
                  style={{ padding: '10px 20px', cursor: 'pointer', borderBottom: '1px solid var(--divider)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--divider)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{i.cand?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {i.job?.title} -- {format(new Date(i.scheduledAt), 'MMM d, h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Helpful links */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Quick Links</span>
            </div>
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href={buildLink('/settings')} style={{ fontSize: 13, color: 'var(--accent)' }}>
                Configure Settings
              </a>
              <a href={buildLink('/reports')} style={{ fontSize: 13, color: 'var(--accent)' }}>
                View Reports
              </a>
              <a href={buildLink('/offers')} style={{ fontSize: 13, color: 'var(--accent)' }}>
                Manage Offers
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
