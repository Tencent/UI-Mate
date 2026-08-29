import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, Video, MapPin, Search, Filter, Users, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { format, isToday, isTomorrow, isThisWeek, isPast, parseISO } from 'date-fns';

function Avatar({ user, size = 28 }) {
  if (!user) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'var(--accent)',
      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.38), fontWeight: 600, flexShrink: 0
    }}>
      {user.firstName?.[0]}{user.lastName?.[0]}
    </div>
  );
}

export default function Interviews() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  const enrichedInterviews = state.interviews.map(i => {
    const app = state.applications.find(a => a.id === i.applicationId);
    const cand = app ? state.candidates.find(c => c.id === app.candidateId) : null;
    const job = app ? state.jobs.find(j => j.id === app.jobId) : null;
    const stage = state.jobStages.find(s => s.id === i.stageId);
    const interviewers = i.interviewerIds.map(uid => state.users.find(u => u.id === uid)).filter(Boolean);
    return { ...i, app, cand, job, stage, interviewers };
  });

  const now = new Date();
  const upcoming = enrichedInterviews.filter(i => i.status === 'scheduled' && new Date(i.scheduledAt) >= now);
  const past = enrichedInterviews.filter(i => i.status === 'completed' || (i.status === 'scheduled' && new Date(i.scheduledAt) < now));
  const cancelled = enrichedInterviews.filter(i => i.status === 'cancelled');

  let displayed = activeTab === 'upcoming' ? upcoming : activeTab === 'past' ? past : cancelled;

  if (search) {
    const q = search.toLowerCase();
    displayed = displayed.filter(i =>
      i.cand?.name.toLowerCase().includes(q) ||
      i.job?.title.toLowerCase().includes(q) ||
      i.stage?.name.toLowerCase().includes(q)
    );
  }

  if (statusFilter !== 'all') {
    displayed = displayed.filter(i => i.status === statusFilter);
  }

  displayed.sort((a, b) => {
    if (activeTab === 'upcoming') return new Date(a.scheduledAt) - new Date(b.scheduledAt);
    return new Date(b.scheduledAt) - new Date(a.scheduledAt);
  });

  const todayCount = enrichedInterviews.filter(i => i.status === 'scheduled' && isToday(parseISO(i.scheduledAt))).length;
  const thisWeekCount = enrichedInterviews.filter(i => i.status === 'scheduled' && isThisWeek(parseISO(i.scheduledAt))).length;
  const pendingScorecards = state.scorecards.filter(sc => !sc.submittedAt).length;

  const statusBadge = (status) => {
    const map = { scheduled: 'badge-green', completed: 'badge-blue', cancelled: 'badge-gray' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
  };

  const getTimeLabel = (dateStr) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'EEE, MMM d');
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Interviews</h1>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Today', value: todayCount, color: 'var(--accent)' },
          { label: 'This Week', value: thisWeekCount, color: 'var(--blue)' },
          { label: 'Upcoming Total', value: upcoming.length, color: 'var(--text-primary)' },
          { label: 'Scorecards Due', value: pendingScorecards, color: 'var(--red)' },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { key: 'past', label: `Past (${past.length})` },
          { key: 'cancelled', label: `Cancelled (${cancelled.length})` },
        ].map(tab => (
          <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 2, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search by candidate, job, or stage..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
      </div>

      {/* Interview list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {displayed.length === 0 ? (
          <div className="empty-state"><h3>No interviews found</h3><p>Try adjusting your filters</p></div>
        ) : displayed.map(i => (
          <div key={i.id} className="card" style={{ padding: '16px 20px', cursor: 'pointer' }}
            onClick={() => i.cand && navigate(buildLink(`/candidates/${i.cand.id}`))}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  {i.cand && <Avatar user={i.cand} size={36} />}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{i.cand?.name || 'Unknown'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {i.job?.title} - {i.stage?.name}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Calendar size={13} /> {getTimeLabel(i.scheduledAt)}, {format(parseISO(i.scheduledAt), 'h:mm a')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Clock size={13} /> {i.duration} min
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                    {i.location === 'Video Call' ? <Video size={13} /> : <MapPin size={13} />}
                    {i.location}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {i.interviewers.map(iv => (
                    <div key={iv.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--divider)', borderRadius: 12, padding: '3px 8px' }}>
                      <Avatar user={iv} size={18} />
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{iv.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                {statusBadge(i.status)}
                {i.meetingUrl && (
                  <a href={i.meetingUrl} onClick={e => e.stopPropagation()} className="btn btn-outline btn-sm" style={{ fontSize: 11 }}>
                    <Video size={12} /> Join
                  </a>
                )}
              </div>
            </div>
            {i.notes && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--divider)', paddingTop: 8 }}>
                {i.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
